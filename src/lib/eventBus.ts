import { Queue } from 'bullmq';
import { getRedisClient } from './redis';
import { logger } from './logger';

export enum EventTopic {
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_SETTLED = 'ORDER_SETTLED',
  ORDER_FAILED = 'ORDER_FAILED',
  COMMISSION_GRANTED = 'COMMISSION_GRANTED',
  RECONCILIATION_REQUIRED = 'RECONCILIATION_REQUIRED',
  TENANT_CREATED = 'TENANT_CREATED',
}

export interface EventPayload {
  topic: EventTopic;
  tenantId: string;
  source: string;
  data: any;
  timestamp: string;
  idempotencyKey: string;
}

/**
 * EventBus acts as a boundary for future Kafka/NATS migration.
 * Currently backed by Redis/BullMQ.
 */
class EventBusService {
  private queue: Queue;

  constructor() {
    this.queue = new Queue('nexus-event-bus', {
      connection: getRedisClient(),
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
        removeOnFail: false,
      }
    });
  }

  /**
   * Publish an internal domain event.
   */
  async publish(topic: EventTopic, payload: Omit<EventPayload, 'topic' | 'timestamp'>) {
    const event: EventPayload = {
      ...payload,
      topic,
      timestamp: new Date().toISOString(),
    };

    // Partition key concept for future Kafka migration
    const partitionKey = payload.tenantId;

    try {
      await this.queue.add(topic, event, {
        jobId: payload.idempotencyKey,
      });
      logger.debug({ topic, partitionKey, idempotencyKey: payload.idempotencyKey }, 'Event published to bus');
    } catch (err: any) {
      logger.error(err, `Failed to publish event ${topic}`);
      throw err;
    }
  }

  getQueue() {
    return this.queue;
  }
}

export const EventBus = new EventBusService();
