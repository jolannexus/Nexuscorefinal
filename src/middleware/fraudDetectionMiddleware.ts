import { Request, Response, NextFunction } from 'express';
import { FraudDetectionService, TransactionContext } from '../domain/fraud/FraudDetectionService';

export const fraudDetectionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const tenantId = (req as any).tenantId;
  const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || '0.0.0.0';
  const userAgent = req.headers['user-agent'] || '';
  const deviceId = req.headers['x-device-id'] as string | undefined;

  const context: TransactionContext = {
    ipAddress,
    userAgent,
    deviceId,
    tenantId
  };

  try {
    const isSafe = await FraudDetectionService.isTransactionSafe(context);
    
    if (!isSafe) {
      console.warn(`[FraudDetectionMiddleware] Unsafe transaction blocked for tenant ${tenantId}. IP: ${ipAddress}`);
      return res.status(403).json({ error: 'TRANSACTION_REJECTED_BY_RISK_ENGINE' });
    }

    // Attach to request for potential use in service layer
    (req as any).fraudContext = context;
    next();
  } catch (err) {
    console.error('[FraudDetectionMiddleware] Internal error during risk assessment', err);
    // Fail closed for security
    return res.status(500).json({ error: 'RISK_ASSESSMENT_FAILED' });
  }
};
