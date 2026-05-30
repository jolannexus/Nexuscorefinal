import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' 
  ? crypto.randomBytes(32).toString('hex') 
  : 'nexuscore-enterprise-jwt-signing-secret-key-32-chars');

export function generateToken(payload: { uid: string; email: string; role: string; tenantId?: string | null }) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours expiration
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): any | null {
  try {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) return null;
    const computedSignature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (computedSignature !== signature) return null;
    
    const decodedBody = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (decodedBody.exp && decodedBody.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return decodedBody;
  } catch {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role: string;
    tenantId?: string | null;
  };
  agency?: any;
}

// 1. API Protection (Auth verification)
export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  
  // Try standard JWT verification
  const decodedCustom = verifyToken(token);
  if (decodedCustom) {
    req.user = {
      uid: decodedCustom.uid,
      email: decodedCustom.email,
      role: decodedCustom.role,
      tenantId: decodedCustom.tenantId,
    };
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized: Invalid token' });
};

// 2. Tenant Validation
export const requireTenant = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.agency) {
    return res.status(403).json({ error: 'Forbidden: No active tenant context found' });
  }
  next();
};

import { RBAC, Permission } from '../lib/rbac';

// 3. Role Middleware
export const requireRole = (allowedRoles: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.agency) {
        return res.status(401).json({ error: 'Unauthorized context' });
      }

      // Fetch from PostgreSQL database using prisma
      const user = await prisma.user.findFirst({
        where: { id: req.user.uid }
      });

      if (!user) {
        // Fallback or verify with token decoded role
        if (allowedRoles.includes(req.user.role)) {
          return next();
        }
        return res.status(403).json({ error: 'Forbidden: User not found in database' });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: `Forbidden: Requires one of ${allowedRoles.join(', ')}` });
      }

      next();
    } catch (error) {
      console.error('Role verification failed:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
};

// 3.5. Permission Middleware (RBAC)
export const requirePermission = (permission: Permission) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Use user token role for quick check, or DB for strict check.
      const hasPerm = RBAC.hasPermission(req.user.role, permission);
      
      if (!hasPerm) {
        return res.status(403).json({ error: `Forbidden: Missing required permission ${permission}` });
      }

      next();
    } catch (error) {
      console.error('Permission verification failed:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};


// 4. Webhook Verification (Generic HMAC / Secret check)
export const verifyWebhookSignature = (secretEnvKey: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers['x-hub-signature-256'] || req.headers['x-webhook-signature'] || req.headers['x-digiflazz-signature'];
    const expectedSecret = process.env[secretEnvKey];
    
    if (!expectedSecret) {
      console.error(`Webhook secret ${secretEnvKey} is not configured`);
      return res.status(500).json({ error: 'Configuration Error' });
    }

    if (!signature) {
      console.warn(`[Webhook security] Missing signature from IP: ${req.ip}`);
      return res.status(401).json({ error: 'Missing webhook signature' });
    }

    // In production, we assume express.json() is used and we verify the raw body if available.
    // If not, we JSON stringify it (though raw buffer is safer to prevent serialization mismatches).
    const payloadBuffer = (req as any).rawBody || Buffer.from(JSON.stringify(req.body));
    
    try {
       const hmac = crypto.createHmac('sha256', expectedSecret);
       const computedSignature = hmac.update(payloadBuffer).digest('hex');
       
       // Handle prefixed signatures (e.g. sha256=abcdef)
       const providedHex = typeof signature === 'string' && signature.includes('=') 
         ? signature.split('=')[1] 
         : signature;

       // Use timingSafeEqual to prevent timing attacks safely
       const compBuf = Buffer.from(computedSignature, 'utf8');
       const provBuf = Buffer.from(providedHex as string, 'utf8');
       const isMatch = compBuf.length === provBuf.length && crypto.timingSafeEqual(compBuf, provBuf);

       if (!isMatch) {
         console.warn(`[Webhook Security] Signature mismatch. Computed: ${computedSignature}, Provided: ${providedHex}`);
         return res.status(403).json({ error: 'Invalid webhook signature' });
       }
       
       next();
    } catch (err: any) {
       console.error(`[Webhook Security] HMAC validation crashed: ${err.message}`);
       return res.status(500).json({ error: 'Internal signature verification failed' });
    }
  };
};
