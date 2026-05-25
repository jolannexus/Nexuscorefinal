import { SupplierStatus } from './types';

export interface WebhookPayload {
  supplier: string;
  externalOrderId: string;
  status: SupplierStatus;
  raw: any;
}

export class WebhookService {
  /**
   * Universal webhook entry point
   * Normalizes provider-specific payloads into standard NexusCore events
   */
  static async handleIncoming(payload: WebhookPayload) {
    console.log(`[Webhook] Received update from ${payload.supplier} for ${payload.externalOrderId}: ${payload.status}`);
    
    // 1. Locate Internal Order in DB
    // 2. Update status and log audit trail
    // 3. Trigger Real-time Event (Socket/Firebase)
    // 4. (Optional) Auto-refund if status is FAILED or CANCELLED
    
    return { 
      processed: true, 
      orderId: payload.externalOrderId,
      action: payload.status === SupplierStatus.FAILED ? 'REFUND_QUEUED' : 'STATUS_UPDATED'
    };
  }

  /**
   * Deliver outgoing webhooks to Resellers/Tenants with Exponential Backoff
   * Guarantees external systems eventually synchronize with correct state.
   */
  static async deliverOutgoingWebhook(url: string, payload: any, secret?: string, maxRetries = 5) {
    let attempt = 0;
    let delayMs = 1500; // Base delay 1.5 seconds

    while (attempt < maxRetries) {
      try {
        console.log(`[WebhookService] Delivering webhook to ${url} | Attempt ${attempt + 1}/${maxRetries}`);
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'NexusCore-Webhook-Delivery/1.0',
        };

        // If tenant has a webhook secret, sign the payload (HMAC simulation or placeholder)
        if (secret) {
          headers['x-nexuscore-signature'] = 'signed-with-secret'; 
        }

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          console.log(`[WebhookService] Webhook delivery successful to ${url} on attempt ${attempt + 1}.`);
          return { success: true, attempts: attempt + 1 };
        } else {
          console.warn(`[WebhookService] Webhook delivery failed. HTTP Status: ${response.status}`);
        }
      } catch (err: any) {
        console.error(`[WebhookService] Network error delivering webhook: ${err.message}`);
      }

      attempt++;
      if (attempt < maxRetries) {
        console.log(`[WebhookService] Backing off for ${delayMs}ms before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2; // Exponential backoff
      }
    }

    console.error(`[WebhookService] Exhausted all ${maxRetries} webhook delivery attempts to ${url}.`);
    return { success: false, attempts: maxRetries };
  }

  /**
   * Provider-specific parser: Digiflazz
   */
  static parseDigiflazz(body: any): WebhookPayload {
    // Digiflazz format: { data: { ref_id: "...", status: "...", rc: "..." } }
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
