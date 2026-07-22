import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { catchAsync } from '../utils/AppError';
import { chatService } from '../services/chat.service';

export const getMessages = catchAsync(async (req: AuthRequest, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const before = req.query.before as string | undefined;
  const messages = await chatService.getMessages(limit, before);
  res.json({ status: 'success', data: messages });
});

export const sendMessage = catchAsync(async (req: AuthRequest, res: Response) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ status: 'error', message: 'Text is required' });
  const message = await chatService.sendMessage(req.user!.id, text.trim());
  res.status(201).json({ status: 'success', data: message });
});

export const pollMessages = catchAsync(async (req: AuthRequest, res: Response) => {
  const afterTime = req.query.afterTime as string;
  if (!afterTime) return res.json({ status: 'success', data: [] });
  const messages = await chatService.getLatestAfter(afterTime);
  res.json({ status: 'success', data: messages });
});

export const getDMHistory = catchAsync(async (req: AuthRequest, res: Response) => {
  const { peerId } = req.params;
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const messages = await chatService.getDMHistory(req.user!.id, peerId, limit);
  res.json({ status: 'success', data: messages });
});

export const sendDM = catchAsync(async (req: AuthRequest, res: Response) => {
  const { peerId } = req.params;
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ status: 'error', message: 'Text is required' });
  const message = await chatService.sendDM(req.user!.id, peerId, text.trim());
  res.status(201).json({ status: 'success', data: message });
});

export const pollDM = catchAsync(async (req: AuthRequest, res: Response) => {
  const { peerId } = req.params;
  const afterTime = req.query.afterTime as string;
  if (!afterTime) return res.json({ status: 'success', data: [] });
  const messages = await chatService.pollDM(req.user!.id, peerId, afterTime);
  res.json({ status: 'success', data: messages });
});

export const getUnreadCounts = catchAsync(async (req: AuthRequest, res: Response) => {
  const counts = await chatService.getUnreadCounts(req.user!.id);
  res.json({ status: 'success', data: counts });
});
