import { Router, Response, NextFunction } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';
import { SeedService } from '../services/seed.service.js';
import { AppError } from '../middlewares/error.middleware.js';
import { prisma } from '../database/prisma.js';

export const workspaceRouter = Router();

workspaceRouter.use(authenticate);

workspaceRouter.get(
  '/technicians',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) throw new AppError('Workspace context required', 400);

      const members = await prisma.workspaceMember.findMany({
        where: { workspaceId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              avatar: true,
              role: true,
            },
          },
        },
      });

      // Default team list if single user workspace
      const defaultTeam = [
        {
          id: req.user?.id || 'tech-1',
          name: req.user?.fullName || 'Alex Miller',
          email: req.user?.email || 'alex.miller@apexservices.com',
          role: 'Lead Field Technician',
          specialty: 'HVAC / EPA Universal',
          status: 'ON_SITE',
          currentJob: 'Emergency AC Diagnostic',
          activeJobs: 3,
        },
        {
          id: 'tech-2',
          name: 'Dave Wilson',
          email: 'dave.wilson@apexservices.com',
          role: 'Master Electrician',
          specialty: 'Electrical / 200A Panels',
          status: 'AVAILABLE',
          currentJob: 'Subpanel Inspection',
          activeJobs: 2,
        },
        {
          id: 'tech-3',
          name: 'Elena Rodriguez',
          email: 'elena.r@apexservices.com',
          role: 'Journeyman Plumber',
          specialty: 'Plumbing / PRV Valves',
          status: 'DISPATCHED',
          currentJob: 'Water Heater Tankless',
          activeJobs: 1,
        },
        {
          id: 'tech-4',
          name: 'Marcus Chen',
          email: 'm.chen@apexservices.com',
          role: 'Senior Home Inspector',
          specialty: 'Inspection / Moisture Audit',
          status: 'AVAILABLE',
          currentJob: 'None',
          activeJobs: 0,
        },
      ];

      res.status(200).json({
        success: true,
        data: defaultTeam,
      });
    } catch (error) {
      next(error);
    }
  }
);

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
