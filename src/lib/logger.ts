import pino from 'pino';
import { env } from './env';
import { trace, context } from '@opentelemetry/api';

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  mixin() {
    const span = trace.getSpan(context.active());
    if (!span) return {};
    const { traceId, spanId } = span.spanContext();
    return { traceId, spanId };
  }
});

// Specialized loggers
export const auditLogger = logger.child({ type: 'audit_log', immutable: true });
export const financialLogger = logger.child({ type: 'financial_transaction' });
export const workerLogger = logger.child({ type: 'worker_telemetry' });
export const webhooksLogger = logger.child({ type: 'webhook_audit' });

export function getTenantLogger(tenantId: string, baseLogger = logger) {
  return baseLogger.child({ tenantId });
}
