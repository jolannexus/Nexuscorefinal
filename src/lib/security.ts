import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'); // 32 bytes fallback
const ALGORITHM = 'aes-256-gcm';

export class EncryptionService {
  static encrypt(text: string): { encrypted: string; iv: string; authTag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    
    return { encrypted, iv: iv.toString('hex'), authTag };
  }

  static decrypt(encrypted: string, iv: string, authTag: string): string {
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

/**
 * Ensures requests originating from a specific tenant workspace 
 * do not bleed into other tenants' boundaries.
 */
export const enforceTenantBoundary = (req: Request, res: Response, next: NextFunction) => {
  const reqTenantId = (req as any).tenantId;
  const userTenantId = (req as any).user?.tenantId;

  if (userTenantId && reqTenantId && userTenantId !== reqTenantId) {
    // Cross-tenant boundary violation attempt
    return res.status(403).json({ error: 'Tenant boundary violation detected' });
  }

  next();
};
