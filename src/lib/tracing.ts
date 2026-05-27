import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { trace, context, propagation, SpanStatusCode } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PrismaInstrumentation } from '@prisma/instrumentation';

const sdk = new NodeSDK({
  traceExporter: new ConsoleSpanExporter(), // Replace with OTLP exporter in real production
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false }, // avoid noisy fs traces
    }),
    new PrismaInstrumentation(),
  ],
});

export const startTracing = () => {
  sdk.start();
};

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});

export const tracer = trace.getTracer('nexuscore-tracer');

export const withTrace = <T>(name: string, fn: () => Promise<T>, attributes?: Record<string, any>): Promise<T> => {
  return tracer.startActiveSpan(name, async (span) => {
    if (attributes) {
      span.setAttributes(attributes);
    }
    try {
      const result = await fn();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (err: any) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: err.message,
      });
      span.recordException(err);
      throw err;
    } finally {
      span.end();
    }
  });
};

export const runWithTraceContext = <T>(parentContext: any, name: string, fn: () => Promise<T>): Promise<T> => {
  const activeContext = propagation.extract(context.active(), parentContext);
  return context.with(activeContext, () => {
    return withTrace(name, fn);
  });
};
