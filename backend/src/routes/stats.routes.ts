import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

export const statsRouter = Router();

statsRouter.use(authenticate);

statsRouter.get('/', StatsController.getStats);
statsRouter.get('/analytics', StatsController.getAnalytics);
statsRouter.get('/notifications', StatsController.getNotifications);
