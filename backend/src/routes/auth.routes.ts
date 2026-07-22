import { Router } from 'express';
import { loginController, refreshController, logoutController, getMeController, resetPasswordController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

export const authRouter = Router();

authRouter.post('/login', loginController);
authRouter.post('/refresh', refreshController);
authRouter.post('/logout', logoutController);
authRouter.post('/reset-password', resetPasswordController);
authRouter.get('/me', authenticate, getMeController);
