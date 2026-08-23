import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { CRMService } from '../services/crm.service.js';
import { AppError } from '../middlewares/error.middleware.js';

export class StatsController {
  static async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) throw new AppError('Workspace context is required', 400);

      const stats = await CRMService.getWorkspaceStats(workspaceId);
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) throw new AppError('Workspace context is required', 400);

      const analytics = await CRMService.getWorkspaceAnalytics(workspaceId);
      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) throw new AppError('Workspace context is required', 400);

      const notifications = await CRMService.getNotificationsFeed(workspaceId);
      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  }
}
