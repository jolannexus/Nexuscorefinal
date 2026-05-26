import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';
import { EventBus, EventTopic } from '../../lib/eventBus';

export interface TenantProvisionRequest {
  name: string;
  slug: string;
  customDomain?: string;
  adminEmail: string;
  adminPasswordHash: string;
}

export class TenantProvisioningService {
  /**
   * Provisions a new White-Label SaaS tenant idempotently.
   */
  static async provisionTenant(req: TenantProvisionRequest) {
    logger.info({ slug: req.slug }, 'Starting tenant provisioning');

    return await prisma.$transaction(async (tx) => {
      // 1. Check constraints
      const existing = await tx.tenant.findUnique({ where: { slug: req.slug } });
      if (existing) throw new Error('Tenant slug already exists');

      // 2. Create Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: req.name,
          slug: req.slug,
          customDomain: req.customDomain,
          status: 'ACTIVE',
          brandingConfig: {
            primaryColor: '#0f172a',
            fontFamily: 'Inter',
            logoUrl: null
          }
        }
      });

      // 3. Create Super Admin User
      const admin = await tx.user.create({
        data: {
          email: req.adminEmail,
          passwordHash: req.adminPasswordHash,
          role: 'SUPER_ADMIN',
          tenantId: tenant.id
        }
      });

      // 4. Create Ledger Revenue System accounts safely via abstraction
      // Note: LedgerEntries are dynamically created usually, but we could init defaults.

      // 5. Emit Domain Event
      await EventBus.publish(EventTopic.TENANT_CREATED, {
        tenantId: tenant.id,
        source: 'TenantProvisioningService',
        data: { slug: tenant.slug, adminId: admin.id },
        idempotencyKey: `tenant_prov_${tenant.id}`
      });

      logger.info({ tenantId: tenant.id }, 'Tenant successfully provisioned');
      return tenant;
    });
  }
}
