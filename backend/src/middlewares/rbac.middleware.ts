import { Response, NextFunction } from 'express';
import { WorkspaceRole, GlobalRole } from '@prisma/client';
import { AuthenticatedRequest } from '../types/index.js';
import { AppError } from './error.middleware.js';

export function requireWorkspaceRole(allowedRoles: WorkspaceRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    // Superadmin bypasses workspace role restrictions
    if (req.user.role === GlobalRole.SUPERADMIN) {
      return next();
    }

    if (!req.workspaceRole || !allowedRoles.includes(req.workspaceRole)) {
      throw new AppError(
        `Forbidden. This action requires one of the following roles: ${allowedRoles.join(', ')}. Your role: ${req.workspaceRole || 'none'}`,
        403
      );
    }

    next();
  };
}

export function requireGlobalRole(role: GlobalRole) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    if (req.user.role !== role) {
      throw new AppError(`Forbidden. Requires global role ${role}`, 403);
    }

    next();
  };
}
