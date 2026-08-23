import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { ProcessingStatus } from '@prisma/client';

class SocketServer {
  private io: Server | null = null;

  init(httpServer: HttpServer): Server {
    this.io = new Server(httpServer, {
      cors: {
        origin: config.corsOrigin === '*' ? '*' : config.corsOrigin.split(','),
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.io.on('connection', (socket: Socket) => {
      logger.info(`Socket client connected: ${socket.id}`);

      // Client joins workspace room
      socket.on('join:workspace', (workspaceId: string) => {
        if (workspaceId) {
          const room = `workspace:${workspaceId}`;
          socket.join(room);
          logger.info(`Socket ${socket.id} joined ${room}`);
        }
      });

      // Client joins recording room
      socket.on('join:recording', (recordingId: string) => {
        if (recordingId) {
          const room = `recording:${recordingId}`;
          socket.join(room);
          logger.info(`Socket ${socket.id} joined ${room}`);
        }
      });

      socket.on('disconnect', () => {
        logger.info(`Socket client disconnected: ${socket.id}`);
      });
    });

    logger.info('Initialized Socket.IO real-time event gateway');
    return this.io;
  }

  getIO(): Server | null {
    return this.io;
  }

  emitStatusChange(params: {
    workspaceId: string;
    recordingId: string;
    status: ProcessingStatus;
    progressPercent: number;
    message?: string;
  }): void {
    if (!this.io) return;

    const payload = {
      recordingId: params.recordingId,
      status: params.status,
      progressPercent: params.progressPercent,
      message: params.message,
      timestamp: new Date().toISOString(),
    };

    // Emit to both specific recording room and workspace-wide room
    this.io.to(`recording:${params.recordingId}`).emit('recording:status_change', payload);
    this.io.to(`workspace:${params.workspaceId}`).emit('recording:status_change', payload);
  }

  emitRecordingCompleted(params: {
    workspaceId: string;
    recordingId: string;
    data: any;
  }): void {
    if (!this.io) return;

    const payload = {
      recordingId: params.recordingId,
      status: ProcessingStatus.COMPLETED,
      data: params.data,
      timestamp: new Date().toISOString(),
    };

    this.io.to(`recording:${params.recordingId}`).emit('recording:completed', payload);
    this.io.to(`workspace:${params.workspaceId}`).emit('recording:completed', payload);
  }

  emitRecordingFailed(params: {
    workspaceId: string;
    recordingId: string;
    errorMessage: string;
  }): void {
    if (!this.io) return;

    const payload = {
      recordingId: params.recordingId,
      status: ProcessingStatus.FAILED,
      errorMessage: params.errorMessage,
      timestamp: new Date().toISOString(),
    };

    this.io.to(`recording:${params.recordingId}`).emit('recording:error', payload);
    this.io.to(`workspace:${params.workspaceId}`).emit('recording:error', payload);
  }

  emitCustomerActivity(params: {
    workspaceId: string;
    customerId: string;
    action: string;
    summary: string;
  }): void {
    if (!this.io) return;

    this.io.to(`workspace:${params.workspaceId}`).emit('customer:activity', {
      customerId: params.customerId,
      action: params.action,
      summary: params.summary,
      timestamp: new Date().toISOString(),
    });
  }
}

export const socketServer = new SocketServer();
