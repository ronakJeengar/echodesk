import bcrypt from 'bcryptjs';
import { prisma } from '../database/prisma.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { AppError } from '../middlewares/error.middleware.js';
import { GlobalRole, WorkspaceRole } from '@prisma/client';

export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
  workspaceName: string;
  industry?: string;
  phone?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export class AuthService {
  static async register(dto: RegisterDto) {
    const existingUser = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError('An account with this email address already exists.', 409);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const baseSlug = slugify(dto.workspaceName) || 'workspace';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const slug = `${baseSlug}-${randomSuffix}`;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName: dto.fullName,
          email: dto.email.toLowerCase(),
          password: hashedPassword,
          phone: dto.phone,
          role: GlobalRole.USER,
        },
      });

      const workspace = await tx.workspace.create({
        data: {
          name: dto.workspaceName,
          slug,
          industry: dto.industry || 'General Contractor',
        },
      });

      const membership = await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
          role: WorkspaceRole.OWNER,
        },
      });

      return { user, workspace, membership };
    });

    const tokenPayload = {
      userId: result.user.id,
      email: result.user.email,
      fullName: result.user.fullName,
      globalRole: result.user.role,
      currentWorkspaceId: result.workspace.id,
      currentWorkspaceRole: result.membership.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken({ userId: result.user.id });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.fullName,
        phone: result.user.phone,
        role: result.user.role,
      },
      workspace: {
        id: result.workspace.id,
        name: result.workspace.name,
        slug: result.workspace.slug,
        industry: result.workspace.industry,
        role: result.membership.role,
      },
      accessToken,
      refreshToken,
    };
  }

  static async login(dto: LoginDto) {
    const user = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        memberships: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password.', 401);
    }

    const primaryMembership = user.memberships[0];

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      globalRole: user.role,
      currentWorkspaceId: primaryMembership?.workspaceId,
      currentWorkspaceRole: primaryMembership?.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken({ userId: user.id });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
      },
      workspace: primaryMembership
        ? {
            id: primaryMembership.workspace.id,
            name: primaryMembership.workspace.name,
            slug: primaryMembership.workspace.slug,
            industry: primaryMembership.workspace.industry,
            role: primaryMembership.role,
          }
        : null,
      workspaces: user.memberships.map((m) => ({
        id: m.workspace.id,
        name: m.workspace.name,
        slug: m.workspace.slug,
        industry: m.workspace.industry,
        role: m.role,
      })),
      accessToken,
      refreshToken,
    };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      memberships: user.memberships.map((m) => ({
        workspaceId: m.workspaceId,
        workspaceName: m.workspace.name,
        workspaceSlug: m.workspace.slug,
        industry: m.workspace.industry,
        role: m.role,
      })),
    };
  }
}
