type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` | ${typeof meta === 'object' ? JSON.stringify(meta) : meta}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  info(message: string, meta?: any): void {
    console.log('\x1b[36m%s\x1b[0m', this.formatMessage('info', message, meta));
  }

  warn(message: string, meta?: any): void {
    console.warn('\x1b[33m%s\x1b[0m', this.formatMessage('warn', message, meta));
  }

  error(message: string, meta?: any): void {
    console.error('\x1b[31m%s\x1b[0m', this.formatMessage('error', message, meta));
  }

  debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('\x1b[90m%s\x1b[0m', this.formatMessage('debug', message, meta));
    }
  }
}

export const logger = new Logger();
