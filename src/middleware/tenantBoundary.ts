import { Request, Response, NextFunction } from 'express';
import { PermissionEngine } from '../domain/auth/PermissionEngine';
import { Permission } from '../domain/auth/PermissionTypes';
import { User } from '../types';

export const tenantBoundaryMiddleware = (requiredPermission?: Permission) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as User;
    const targetTenantId = req.params.tenantId || req.body.tenantId;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Role-based check
    if (requiredPermission && !PermissionEngine.hasPermission(user.role, requiredPermission)) {
        return res.status(403).json({ error: 'Permission denied' });
    }

    // Tenant isolation check
    const userTenantId = (user as any).tenantId || user.agencyId;
    if (targetTenantId && userTenantId !== targetTenantId && user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Tenant isolation violation' });
    }

    next();
  };
};
