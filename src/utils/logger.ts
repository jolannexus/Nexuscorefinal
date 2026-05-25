/**
 * Enterprise Structured Logging Utility
 * Provides standardized JSON logging for production observability (e.g., Datadog, ELK, CloudWatch).
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
  tenantId?: string;
  userId?: string;
  orderId?: string;
  traceId?: string;
}

class StructuredLogger {
  private formatMessage(level: LogLevel, message: string, context?: LogContext, error?: unknown) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && { context }),
      ...(error instanceof Error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      })
    };

    return process.env.NODE_ENV === 'production' 
      ? JSON.stringify(logEntry) 
      : `[${logEntry.timestamp}] [${level.toUpperCase()}] ${message} ${context ? JSON.stringify(context) : ''} ${error ? (error as Error).message : ''}`;
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext) {
    console.info(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext, error?: unknown) {
    console.warn(this.formatMessage('warn', message, context, error));
  }

  error(message: string, error?: unknown, context?: LogContext) {
    console.error(this.formatMessage('error', message, context, error));
  }
}

export const logger = new StructuredLogger();
