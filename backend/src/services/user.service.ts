import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { getPagination, paginatedResponse } from '../utils/pagination';
import { UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function getUsers(query: any) {
  const { page, limit, skip } = getPagination(query);
  const where: any = {};
  if (query.role) where.role = query.role as UserRole;
  if (query.status) where.status = query.status as UserStatus;
  if (query.search) where.OR = [
    { name: { contains: query.search, mode: 'insensitive' } },
    { email: { contains: query.search, mode: 'insensitive' } },
  ];

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where, skip, take: limit,
      select: { id: true, name: true, email: true, role: true, department: true, title: true, avatar: true, status: true, phone: true, location: true, skills: true, startDate: true },
      orderBy: { name: 'asc' },
    }),
    prisma.user.count({ where }),
  ]);
  return paginatedResponse(users, total, { page, limit, skip });
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, department: true, title: true, avatar: true, status: true, phone: true, location: true, bio: true, skills: true, startDate: true, leaveBalance: true },
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
}

export async function createUser(data: any) {
  const { password, email, ...rest } = data;
  if (!password || !email) throw new AppError('Email and password are required', 400);
  const normalizedEmail = email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) throw new AppError('Email already in use', 400);
  const hashed = await bcrypt.hash(password, 12);
  return prisma.user.create({
    data: { ...rest, email: normalizedEmail, password: hashed, status: 'active' },
    select: { id: true, name: true, email: true, role: true, department: true, title: true, avatar: true, status: true },
  });
}

export async function updateUser(id: string, data: any) {
  const { password, ...rest } = data;
  // If email is being changed, check uniqueness
  if (rest.email) {
    rest.email = rest.email.toLowerCase();
    const existing = await prisma.user.findFirst({ where: { email: rest.email, NOT: { id } } });
    if (existing) throw new AppError('Email already in use', 400);
  }
  return prisma.user.update({
    where: { id },
    data: rest,
    select: { id: true, name: true, email: true, role: true, department: true, title: true, avatar: true, status: true, phone: true, location: true, bio: true },
  });
}

export async function changePassword(id: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError('User not found', 404);
  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id }, data: { password: hashed } });
}

export async function deleteUser(id: string) {
  await prisma.user.delete({ where: { id } });
}
