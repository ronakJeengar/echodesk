import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types/index.js';
import { CRMService } from '../services/crm.service.js';
import { AppError } from '../middlewares/error.middleware.js';

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Customer name is required'),
  companyName: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export class CustomersController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) throw new AppError('Workspace context is required', 400);

      const search = req.query.search as string | undefined;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;

      const result = await CRMService.listCustomers(workspaceId, { search, page, limit });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) throw new AppError('Workspace context is required', 400);

      const customer = await CRMService.createCustomer(workspaceId, req.body);
      res.status(201).json({ success: true, message: 'Customer created', data: customer });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) throw new AppError('Workspace context is required', 400);

      const customer = await CRMService.getCustomerById(workspaceId, req.params.id as string);
      res.status(200).json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  }

  static async getTimeline(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) throw new AppError('Workspace context is required', 400);

      const timeline = await CRMService.getCustomerTimeline(workspaceId, req.params.id as string);
      res.status(200).json({ success: true, data: timeline });
    } catch (error) {
      next(error);
    }
  }
}
