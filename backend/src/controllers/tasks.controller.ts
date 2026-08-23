import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types/index.js';
import { CRMService } from '../services/crm.service.js';
import { AppError } from '../middlewares/error.middleware.js';
import { TaskStatus, Priority } from '@prisma/client';

export const createTaskSchema = z.object({
  title: z.string().min(2, 'Task title is required'),
  description: z.string().optional(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
  customerId: z.string().optional(),
  jobId: z.string().optional(),
  assignedToId: z.string().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: z.string().optional().nullable().transform((val) => (val ? new Date(val) : null)),
  assignedToId: z.string().optional().nullable(),
});

export class TasksController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) throw new AppError('Workspace context is required', 400);

      const status = req.query.status as TaskStatus | undefined;
      const priority = req.query.priority as Priority | undefined;
      const assignedToId = req.query.assignedToId as string | undefined;
      const customerId = req.query.customerId as string | undefined;
      const jobId = req.query.jobId as string | undefined;

      const tasks = await CRMService.listTasks(workspaceId, {
        status,
        priority,
        assignedToId,
        customerId,
        jobId,
      });

      res.status(200).json({ success: true, data: tasks });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) throw new AppError('Workspace context is required', 400);
      if (!req.user) throw new AppError('Authentication required', 401);

      const task = await CRMService.createTask(workspaceId, req.user.id, req.body);
      res.status(201).json({ success: true, message: 'Task created', data: task });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) throw new AppError('Workspace context is required', 400);

      const task = await CRMService.updateTask(workspaceId, req.params.id as string, req.body);
      res.status(200).json({ success: true, message: 'Task updated', data: task });
    } catch (error) {
      next(error);
    }
  }

  static async toggleStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) throw new AppError('Workspace context is required', 400);

      const task = await CRMService.toggleTaskStatus(workspaceId, req.params.id as string);
      res.status(200).json({ success: true, message: 'Task status toggled', data: task });
    } catch (error) {
      next(error);
    }
  }
}
