import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { recordingsRouter } from './recordings.routes.js';
import { customersRouter } from './customers.routes.js';
import { jobsRouter } from './jobs.routes.js';
import { tasksRouter } from './tasks.routes.js';
import { statsRouter } from './stats.routes.js';
import { workspaceRouter } from './workspace.routes.js';
import webhookRouter from './webhook.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/recordings', recordingsRouter);
apiRouter.use('/customers', customersRouter);
apiRouter.use('/jobs', jobsRouter);
apiRouter.use('/tasks', tasksRouter);
apiRouter.use('/stats', statsRouter);
apiRouter.use('/workspaces', workspaceRouter);
apiRouter.use('/workspaces/webhooks', webhookRouter);

apiRouter.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EchoDesk Backend API is healthy and operational',
    timestamp: new Date().toISOString(),
  });
});
