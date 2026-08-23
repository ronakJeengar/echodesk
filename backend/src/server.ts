import http from 'http';
import { createApp } from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { connectDatabase, disconnectDatabase } from './database/prisma.js';
import { socketServer } from './socket/socket.server.js';
import { initAudioQueue } from './queues/audio.queue.js';
import { startAudioWorker } from './queues/audio.worker.js';

async function bootstrap(): Promise<void> {
  try {
    logger.info('Starting EchoDesk Backend API Server...');

    // 1. Connect to PostgreSQL
    await connectDatabase();

    // 2. Create Express App & HTTP Server
    const app = createApp();
    const server = http.createServer(app);

    // 3. Initialize Socket.IO Real-time Gateway
    socketServer.init(server);

    // 4. Initialize BullMQ Queue & Worker
    await initAudioQueue();
    await startAudioWorker();

    // 5. Start Listening
    server.listen(config.port, () => {
      logger.info(`🚀 EchoDesk API Server listening at http://localhost:${config.port}${config.apiPrefix}`);
      logger.info(`⚡ Socket.IO real-time gateway active on port ${config.port}`);
      logger.info(`🤖 AI Pipeline ready (STT: ${config.ai.sttProvider}, LLM: ${config.ai.llmProvider}, Storage: ${config.storage.driver})`);
    });

    // 6. Graceful Shutdown Handlers
    const handleShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDatabase();
        logger.info('Server closed. Process terminating.');
        process.exit(0);
      });

      // Force exit if hanging
      setTimeout(() => {
        logger.error('Force shutdown timeout exceeded. Exiting immediately.');
        process.exit(1);
      }, 5000);
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  } catch (error) {
    logger.error('Fatal bootstrap error:', error);
    process.exit(1);
  }
}

bootstrap();
