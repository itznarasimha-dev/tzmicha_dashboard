import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getMessages, sendMessage, pollMessages,
  getDMHistory, sendDM, pollDM, getUnreadCounts,
} from '../controllers/chat.controller';

export const chatRouter = Router();

chatRouter.use(authenticate);

// Group chat
chatRouter.get('/',             getMessages);
chatRouter.post('/',            sendMessage);
chatRouter.get('/poll',         pollMessages);

// DM unread counts
chatRouter.get('/unread',       getUnreadCounts);

// DM with a specific peer
chatRouter.get('/dm/:peerId',         getDMHistory);
chatRouter.post('/dm/:peerId',        sendDM);
chatRouter.get('/dm/:peerId/poll',    pollDM);
