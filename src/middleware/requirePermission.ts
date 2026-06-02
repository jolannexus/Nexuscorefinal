import { Request, Response, NextFunction } from 'express';
import { PermissionEngine } from '../domain/auth/PermissionEngine';
import { Permission } from '../domain/auth/PermissionTypes';
import { AuthenticatedRequest } from './auth';
import { logger } from '../lib/logger';

export const requirePermission = (permission: Permission) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.agency) {
      return res.status(401).json({ error: 'Unauthorized context' });
    }

    if (!PermissionEngine.hasPermission(req.user.role as any, permission)) {
      logger.warn(`[Security] Permission denied. Role: ${req.user.role}, Permission Required: ${permission}`);
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};
