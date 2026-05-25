import { EventEmitter } from 'events';
import { DomainEvent, BaseEventPayload } from './types';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';

class DomainEventDispatcher extends EventEmitter {
  constructor() {
    super();
    // Default error handler to prevent crashing if an event throws unhandled
    this.on('error', (err) => {
      logger.error('Unhandled Domain Event Error', err);
    });
  }

  /**
   * Dispatch a strictly typed domain event
   */
  dispatch<T extends BaseEventPayload>(event: DomainEvent, payload: T): void {
    logger.debug(`[EventDispatcher] Emitted ${event}`, { orderId: payload.orderId, tenantId: payload.tenantId });
    metrics.increment(`event.${event.replace(/\./g, '_')}`, { tenant: payload.tenantId });
    this.emit(event, payload);
  }

  /**
   * Subscribe to a strictly typed domain event
   */
  subscribe<T extends BaseEventPayload>(event: DomainEvent, handler: (payload: T) => Promise<void> | void): void {
    this.on(event, async (payload: T) => {
      try {
        await handler(payload);
      } catch (err: any) {
        logger.error(`[EventDispatcher] Handler for ${event} failed: ${err.message}`, err, { orderId: payload.orderId, tenantId: payload.tenantId });
      }
    });
  }
}

// Singleton dispatcher for the monolithic instance
export const eventDispatcher = new DomainEventDispatcher();
