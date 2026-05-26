/**
 * Enterprise Structured Logging Utility
 * Provides standardized JSON logging for production observability (e.g., Datadog, ELK, CloudWatch).
 */

import { logger as pinoLogger } from '../lib/logger';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
  tenantId?: string;
  userId?: string;
  orderId?: string;
  traceId?: string;
}

class StructuredLogger {
  debug(message: string, context?: LogContext) {
    if (context) pinoLogger.debug(context, message);
    else pinoLogger.debug(message);
  }

  info(message: string, context?: LogContext) {
    if (context) pinoLogger.info(context, message);
    else pinoLogger.info(message);
  }

  warn(message: string, context?: LogContext, error?: unknown) {
    if (context || error) pinoLogger.warn({ ...context, err: error }, message);
    else pinoLogger.warn(message);
  }

  error(message: string, error?: unknown, context?: LogContext) {
    if (context || error) pinoLogger.error({ ...context, err: error }, message);
    else pinoLogger.error(message);
  }
}

export const logger = new StructuredLogger();
