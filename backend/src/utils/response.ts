import { Response, Request, NextFunction } from 'express';

export interface StandardApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: Record<string, any>;
}

export class ApiResponse {
  static success<T>(res: Response, data?: T, message?: string, statusCode = 200, meta?: Record<string, any>): void {
    const payload: StandardApiResponse<T> = {
      success: true,
      ...(data !== undefined ? { data } : {}),
      ...(message ? { message } : {}),
      ...(meta ? { meta } : {}),
    };
    res.status(statusCode).json(payload);
  }

  static created<T>(res: Response, data: T, message?: string): void {
    this.success(res, data, message, 201);
  }
}

export const asyncHandler = (fn: (req: any, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
