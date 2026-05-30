import { SupplierStatus } from './types';
import { prisma } from '../../lib/prisma';

export interface WebhookPayload {
  supplier: string;
  externalOrderId: string;
  status: SupplierStatus;
  raw: any;
}

export class WebhookService {
  static async handleIncoming(payload: WebhookPayload) {
    console.log(`[Webhook] Received update from ${payload.supplier} for ${payload.externalOrderId}: ${payload.status}`);
    return { 
      processed: true, 
      orderId: payload.externalOrderId,
      action: payload.status === SupplierStatus.FAILED ? 'REFUND_QUEUED' : 'STATUS_UPDATED'
    };
  }

  static async deliverOutgoingWebhook(tenantId: string, url: string, payload: any, secret?: string, maxRetries = 5) {
    const log = await prisma.webhookDeliveryLog.create({
      data: {
        tenantId,
        url,
        payload,
        status: 'PENDING',
        attempts: 0
      }
    });

    let attempt = 0;
    let delayMs = 1500;
    let success = false;
    let errorMessage: string | null = null;

    while (attempt < maxRetries) {
      try {
        console.log(`[WebhookService] Delivering webhook log ${log.id} to ${url} | Attempt ${attempt + 1}/${maxRetries}`);
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'NexusCore-Webhook-Delivery/1.0',
        };

        if (secret) {
          const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
          const hmac = require('crypto').createHmac('sha256', secret);
          const signature = hmac.update(payloadString).digest('hex');
          headers['x-nexuscore-signature'] = signature; 
        }

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          console.log(`[WebhookService] Webhook delivery successful to ${url} on attempt ${attempt + 1}.`);
          success = true;
          break;
        } else {
          errorMessage = `HTTP ${response.status}`;
          console.warn(`[WebhookService] Webhook delivery failed. ${errorMessage}`);
        }
      } catch (err: any) {
        errorMessage = err.message;
        console.error(`[WebhookService] Network error delivering webhook: ${errorMessage}`);
      }

      attempt++;
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2;
      }
    }

    await prisma.webhookDeliveryLog.update({
      where: { id: log.id },
      data: {
        status: success ? 'SUCCESS' : 'FAILED',
        attempts: success ? attempt + 1 : attempt,
        errorMessage
      }
    });

    return { success, logId: log.id, attempts: success ? attempt + 1 : attempt };
  }
  
  static async replayWebhook(logId: string, tenantId: string) {
    const log = await prisma.webhookDeliveryLog.findUnique({
      where: { id: logId }
    });
    
    if (!log || log.tenantId !== tenantId) {
      throw new Error('Webhook log not found or unauthorized');
    }
    
    return this.deliverOutgoingWebhook(tenantId, log.url, log.payload);
  }

  static parseDigiflazz(body: any): WebhookPayload {
    const data = body.data || body;
    let status: SupplierStatus = SupplierStatus.PROCESSING;
    
    if (data.status === 'Sukses') status = SupplierStatus.COMPLETED;
    if (data.status === 'Gagal') status = SupplierStatus.FAILED;

    return {
      supplier: 'DIGIFLAZZ',
      externalOrderId: data.ref_id,
      status,
      raw: body
    };
  }
}
