import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config/index.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';

export function createApp(): Express {
  const app: Express = express();

  // Basic Security & Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS Configuration
  app.use(
    cors({
      origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(','),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-workspace-id'],
    })
  );

  // Parsers
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(cookieParser());

  // Request Logging
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Master API Routes
  app.use(config.apiPrefix, apiRouter);

  // Root Welcome & Health Check
  app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
      name: 'EchoDesk AI Voice Agent & Field Operations CRM API',
      version: '1.0.0',
      status: 'healthy',
      documentation: '/api/v1/health',
    });
  });

  // 404 Not Found Catch-All
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: `Endpoint '${req.method} ${req.originalUrl}' not found on this server`,
    });
  });

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
}
