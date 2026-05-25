import { z } from 'zod';

export const UserSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['SUPER_ADMIN', 'AGENCY', 'RESELLER', 'PLATFORM_ADMIN', 'AGENCY_ADMIN', 'CUSTOMER']),
  agencyId: z.string().nullable(),
  displayName: z.string().max(100).nullable(),
});

export const OrderSchema = z.object({
  resellerId: z.string().min(1),
  agencyId: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  totalCost: z.number().nonnegative(),
  targetUrl: z.string().url().or(z.string().min(3)), // Allow some non-URL target identifiers
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'ERROR', 'SUCCESS', 'FAILED']),
});

export const TransactionSchema = z.object({
  resellerId: z.string().min(1),
  agencyId: z.string().min(1),
  type: z.enum(['DEBIT', 'CREDIT']),
  amount: z.number().positive(),
  description: z.string().min(5).max(255),
  orderId: z.string().optional(),
});
