import { Router } from 'express';
import multer from 'multer';
import { getUsers, getUserById, createUser, updateUser, changePassword, deleteUser, uploadAvatar } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

export const userRouter = Router();

userRouter.use(authenticate);

userRouter.get('/', getUsers);
userRouter.post('/', createUser);
userRouter.get('/:id', getUserById);
userRouter.patch('/:id', updateUser);
userRouter.patch('/:id/password', changePassword);
userRouter.post('/:id/avatar', upload.single('avatar'), uploadAvatar);
userRouter.delete('/:id', authorize('admin'), deleteUser);
