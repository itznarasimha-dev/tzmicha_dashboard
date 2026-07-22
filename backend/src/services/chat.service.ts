import { prisma } from '../config/prisma';

const senderSelect = { id: true, name: true, avatar: true, role: true };

export const chatService = {
  // ── Group chat (receiverId = null) ────────────────────────────────────────
  getMessages: async (limit = 50, before?: string) => {
    const messages = await prisma.chatMessage.findMany({
      where: { receiverId: null },
      take: limit,
      ...(before ? { cursor: { id: before }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: { sender: { select: senderSelect } },
    });
    return messages.reverse();
  },

  sendMessage: async (senderId: string, text: string) => {
    return prisma.chatMessage.create({
      data: { senderId, text },
      include: { sender: { select: senderSelect } },
    });
  },

  getLatestAfter: async (afterTime: string) => {
    return prisma.chatMessage.findMany({
      where: { receiverId: null, createdAt: { gt: new Date(afterTime) } },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: senderSelect } },
    });
  },

  // ── Direct messages ───────────────────────────────────────────────────────
  getDMHistory: async (userId: string, peerId: string, limit = 50) => {
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: peerId },
          { senderId: peerId, receiverId: userId },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { sender: { select: senderSelect } },
    });
    // Mark received messages as read
    await prisma.chatMessage.updateMany({
      where: { senderId: peerId, receiverId: userId, read: false },
      data: { read: true },
    });
    return messages.reverse();
  },

  sendDM: async (senderId: string, receiverId: string, text: string) => {
    return prisma.chatMessage.create({
      data: { senderId, receiverId, text },
      include: { sender: { select: senderSelect } },
    });
  },

  pollDM: async (userId: string, peerId: string, afterTime: string) => {
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: peerId },
          { senderId: peerId, receiverId: userId },
        ],
        createdAt: { gt: new Date(afterTime) },
      },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: senderSelect } },
    });
    if (messages.some(m => m.senderId === peerId)) {
      await prisma.chatMessage.updateMany({
        where: { senderId: peerId, receiverId: userId, read: false },
        data: { read: true },
      });
    }
    return messages;
  },

  // Returns unread DM counts per sender for a given user
  getUnreadCounts: async (userId: string) => {
    const rows = await prisma.chatMessage.groupBy({
      by: ['senderId'],
      where: { receiverId: userId, read: false },
      _count: { id: true },
    });
    return rows.reduce<Record<string, number>>((acc, r) => {
      acc[r.senderId] = r._count.id;
      return acc;
    }, {});
  },
};
