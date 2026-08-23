import { Router, Response, NextFunction } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';
import { SeedService } from '../services/seed.service.js';
import { AppError } from '../middlewares/error.middleware.js';

export const workspaceRouter = Router();

workspaceRouter.use(authenticate);

workspaceRouter.post(
  '/seed-demo',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.workspaceId;
      const userId = req.user?.id;

      if (!workspaceId || !userId) {
        throw new AppError('Authentication and workspace context required', 400);
      }

      const result = await SeedService.seedWorkspace(workspaceId, userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);
