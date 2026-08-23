import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types/index.js';
import { CRMService } from '../services/crm.service.js';
import { AppError } from '../middlewares/error.middleware.js';
import { JobStatus, Priority } from '@prisma/client';

export const createJobSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  title: z.string().min(2, 'Job title is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  status: z.nativeEnum(JobStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  quotedAmount: z.number().optional(),
  laborHours: z.number().optional(),
  scheduledAt: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
});

export const updateJobSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.nativeEnum(JobStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  quotedAmount: z.number().optional(),
  laborHours: z.number().optional(),
  scheduledAt: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
  completedAt: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
});

export class JobsController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) throw new AppError('Workspace context is required', 400);

      const status = req.query.status as JobStatus | undefined;
      const priority = req.query.priority as Priority | undefined;
      const customerId = req.query.customerId as string | undefined;
      const search = req.query.search as string | undefined;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;

      const result = await CRMService.listJobs(workspaceId, {
        status,
        priority,
        customerId,
        search,
        page,
        limit,
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) throw new AppError('Workspace context is required', 400);

      const job = await CRMService.createJob(workspaceId, req.body);
      res.status(201).json({ success: true, message: 'Job created', data: job });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) throw new AppError('Workspace context is required', 400);

      const job = await CRMService.getJobById(workspaceId, req.params.id as string);
      res.status(200).json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) throw new AppError('Workspace context is required', 400);

      const job = await CRMService.updateJob(workspaceId, req.params.id as string, req.body);
      res.status(200).json({ success: true, message: 'Job updated', data: job });
    } catch (error) {
      next(error);
    }
  }

  static async exportCsv(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) throw new AppError('Workspace context is required', 400);

      const csvData = await CRMService.exportJobsCsv(workspaceId);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="echodesk-jobs-${Date.now()}.csv"`);
      res.status(200).send(csvData);
    } catch (error) {
      next(error);
    }
  }
}
