import { Router } from 'express';
import { AuthController, registerSchema, loginSchema, updateProfileSchema } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';

export const authRouter = Router();

authRouter.post('/register', validate({ body: registerSchema }), AuthController.register);
authRouter.post('/login', validate({ body: loginSchema }), AuthController.login);
authRouter.post('/refresh', AuthController.refreshToken);
authRouter.get('/me', authenticate, AuthController.getMe);
authRouter.patch('/profile', authenticate, validate({ body: updateProfileSchema }), AuthController.updateProfile);
authRouter.put('/me', authenticate, validate({ body: updateProfileSchema }), AuthController.updateProfile);
authRouter.post('/logout', AuthController.logout);
