import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { prisma } from '../database/prisma.js';
import { AppError } from './error.middleware.js';

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new AppError('Authentication required. Please provide a valid token.', 401);
    }

    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        memberships: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User belonging to this token no longer exists.', 401);
    }

    // Determine target workspace
    const requestedWorkspaceId =
      (req.headers['x-workspace-id'] as string) ||
      (req.query.workspaceId as string) ||
      (req.body?.workspaceId as string) ||
      payload.currentWorkspaceId;

    let targetMembership = user.memberships.find(
      (m) => m.workspaceId === requestedWorkspaceId
    );

    // If no specific workspace requested, default to the user's primary/first workspace
    if (!targetMembership && user.memberships.length > 0) {
      targetMembership = user.memberships[0];
    }

    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatar: user.avatar,
      phone: user.phone,
      role: user.role,
      workspaceId: targetMembership?.workspaceId,
      workspaceRole: targetMembership?.role,
    };

    req.workspaceId = targetMembership?.workspaceId;
    req.workspaceRole = targetMembership?.role;

    next();
  } catch (error) {
    next(error);
  }
}

export function requireWorkspace(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.workspaceId) {
    throw new AppError('Workspace context is required for this operation. Pass x-workspace-id header.', 400);
  }
  next();
}
