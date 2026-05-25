export enum DomainEvent {
  ORDER_CREATED = 'order.created',
  ORDER_PROCESSING = 'order.processing',
  SUPPLIER_ASSIGNED = 'supplier.assigned',
  SUPPLIER_FAILED = 'supplier.failed',
  ORDER_SETTLED = 'order.settled',
  REFUND_ISSUED = 'refund.issued',
  COMMISSION_GENERATED = 'commission.generated',
  WEBHOOK_VERIFIED = 'webhook.verified'
}

export interface BaseEventPayload {
  tenantId: string;
  orderId: string;
  timestamp: string;
}

export interface SupplierFailedPayload extends BaseEventPayload {
  supplierName: string;
  reason: string;
}

export interface OrderSettledPayload extends BaseEventPayload {
  resellerId: string;
  profitAmount: number;
}
