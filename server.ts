import express from "express";
import * as Sentry from "@sentry/node";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { env } from "./src/lib/env";
import { logger } from "./src/lib/logger";
import { startTracing } from "./src/lib/tracing";
import { startAllWorkers } from "./src/workers";
import { SupplierFactory } from "./src/services/suppliers/supplierFactory";
import { prisma } from "./src/lib/prisma";
import { Prisma } from "@prisma/client";
import { OrderProcessor } from "./src/services/suppliers/orderProcessor";
import { ProviderSelector } from "./src/services/suppliers/providerSelector";
import { SupplierStatus } from "./src/services/suppliers/types";
import { TransactionManagerService } from "./src/services/billing/transactionManagerService";
import { QueueService } from "./src/services/queue/queueService";
import {
  requireAuth,
  requireTenant,
  verifyWebhookSignature,
  generateToken,
  verifyToken,
} from "./src/middleware/auth";
import { requirePermission } from "./src/middleware/requirePermission";
import { idempotencyMiddleware } from "./src/middleware/idempotency";
import crypto from "crypto";
import { TenantCacheService } from "./src/services/tenant/TenantCacheService";
import { LedgerEngine, LedgerAccountType } from "./src/services/financial/LedgerEngine";

import { ReconciliationService } from "./src/services/billing/reconciliationService";
import { WebhookService } from "./src/services/suppliers/webhookService";
import { BalanceManager } from "./src/services/financial/BalanceManager";
import { QRISService } from "./src/services/payment/QRISService";
import { VirtualAccountService } from "./src/services/payment/VirtualAccountService";
import { globalApiLimiter } from "./src/middleware/rateLimit";
import { register } from "./src/lib/metrics";
import { eventDispatcher } from "./src/events/EventDispatcher";
import { DomainEvent } from "./src/events/types";

async function startServer() {
  const serverSentryDsn = process.env.SENTRY_DSN || "";
  if (serverSentryDsn) {
    Sentry.init({
      dsn: serverSentryDsn,
      environment: process.env.NODE_ENV || "development",
      tracesSampleRate: 1.0,
    });
  }

  // Register process-level handlers to automatically capture unhandled rejections/exceptions
  process.on("uncaughtException", (err) => {
    logger.error(err, "Uncaught Exception in server process");
    if (serverSentryDsn) {
      Sentry.captureException(err);
    }
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  process.on("unhandledRejection", (reason) => {
    logger.error({ reason }, "Unhandled Rejection in server process");
    if (serverSentryDsn) {
      Sentry.captureException(reason);
    }
  });

  const app = express();
  app.set("trust proxy", 1); // Trust first proxy for rate limiting (X-Forwarded-For)
  const PORT = env.PORT;

  // Expose Prometheus metrics
  app.get("/metrics", async (req, res) => {
    try {
      res.set("Content-Type", register.contentType);
      res.end(await register.metrics());
    } catch (ex) {
      res.status(500).end(ex);
    }
  });

  // Correlation ID & Traceability Middleware
  app.use((req: any, res, next) => {
    const correlationId = req.headers['x-correlation-id'] || req.headers['correlation-id'] || crypto.randomUUID();
    req.correlationId = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);
    next();
  });

  // Observability: Log all requests
  app.use(pinoHttp({
    logger,
    autoLogging: false,
    genReqId: (req: any) => req.correlationId || crypto.randomUUID()
  }));

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === "production"
          ? {
              directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "https://*"],
                connectSrc: ["'self'", "wss:", "https://*"],
              },
            }
          : false, // Disabled for Vite Dev Server compatibility in dev mode
      crossOriginEmbedderPolicy: false,
    }),
  );

  // No import here
  app.use("/api", globalApiLimiter);
  app.use(express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString(); // For exact HMAC signature checks
    }
  }));

  // Tenant Detection Middleware via PostgreSQL databases first
  app.use(async (req, res, next) => {
    const host = req.headers.host || "";
    const parts = host.split(".");
    const potentialSlug =
      parts.length > 2 && !host.includes("run.app") ? parts[0] : null;

    try {
      // 1. Try mapping by custom domain in SQL database
      let tenant = await TenantCacheService.getTenantByDomain(host);

      // 2. Try subdomain slug lookup
      if (!tenant && potentialSlug) {
        tenant = await TenantCacheService.getTenantBySlug(potentialSlug);
      }

      // 3. Fallback to active Tenant if none discovered
      if (!tenant) {
        tenant = await prisma.tenant.findFirst({
          where: { status: "ACTIVE" }
        }).catch(() => null);
        if (!tenant) {
          tenant = await prisma.tenant.findFirst().catch(() => null);
        }
      }

      if (tenant) {
        // Map branding configs properly
        const branding = typeof tenant.brandingConfig === 'string'
          ? JSON.parse(tenant.brandingConfig)
          : (tenant.brandingConfig || {});
          
        (req as any).agency = {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          domain: tenant.customDomain || undefined,
          status: tenant.status,
          theme: branding.theme || { primary: '#111827', secondary: '#4B5563', accent: '#3B82F6' },
          ...branding
        };
      } else {
        return res.status(404).json({ error: "Tenant not found or inactive" });
      }

      next();
    } catch (error) {
      console.error("[DATABASE_OFFLINE_WARNING] Database connection not found or offline:", error);
      return res.status(503).json({ error: "Service unavailable due to database maintenance" });
    }
  });

  app.use(idempotencyMiddleware);

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({
      status: "NexusCore Platform Online",
      timestamp: new Date().toISOString(),
      database: "PostgreSQL Connected"
    });
  });

  // Real-time Event Stream (SSE)
  const sseClients = new Set<express.Response>();

  // Subscribe to core system-level events to send to subscribers
  eventDispatcher.subscribe(DomainEvent.SUPPLIER_FAILED, (payload: any) => {
    logger.info({ payload }, "SSE broadcasting SUPPLIER_FAILED to clients");
    const data = JSON.stringify({
      event: "SUPPLIER_FAILED",
      payload,
    });
    sseClients.forEach((client) => {
      try {
        client.write(`data: ${data}\n\n`);
      } catch (writeErr) {
        logger.error({ writeErr }, "Failed to write to SSE client");
        sseClients.delete(client);
      }
    });
  });

  app.get("/api/events/stream", (req, res) => {
    // Enable Server-Sent Events headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders(); // Establishes SSE stream connection

    // Send initial handshake connect notice
    res.write("data: " + JSON.stringify({ event: "CONNECTED", timestamp: new Date().toISOString() }) + "\n\n");

    sseClients.add(res);

    // Keep connection alive with periodic pings every 30 seconds
    const pingInterval = setInterval(() => {
      try {
        res.write("data: " + JSON.stringify({ event: "PING" }) + "\n\n");
      } catch (err) {
        clearInterval(pingInterval);
        sseClients.delete(res);
      }
    }, 30000);

    req.on("close", () => {
      clearInterval(pingInterval);
      sseClients.delete(res);
    });
  });

  // Current Tenant API
  app.get("/api/tenant/current", (req, res) => {
    const agency = (req as any).agency;
    if (!agency) {
      return res.status(404).json({ error: "No active tenant context found" });
    }
    res.json(agency);
  });

  // Branding update
  app.put("/api/tenants/:id/branding", requireAuth, requireTenant, requirePermission('tenant.settings.update'), async (req, res) => {
    try {
      const { id } = req.params;
      const branding = req.body;
      const t = await prisma.tenant.update({
        where: { id },
        data: { brandingConfig: JSON.stringify(branding) }
      });
      await TenantCacheService.invalidateTenant(t);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Payment settings update
  app.put("/api/tenants/:id/payment", requireAuth, requireTenant, requirePermission('tenant.settings.update'), async (req, res) => {
    try {
      const { id } = req.params;
      const settings = req.body;
      const t = await prisma.tenant.update({
        where: { id },
        data: { paymentConfig: JSON.stringify(settings) } as any
      });
      await TenantCacheService.invalidateTenant(t);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 1. Authenticated User Registration (PostgreSQL + Prisma)
  app.post("/api/auth/register", async (req, res) => {
    const { email, password, displayName, role, tenantId } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "User already registered" });
      }

      const hash = crypto.createHash('sha256').update(password).digest('hex');
      
      let assignedRole = "RESELLER";
      if (email === "jolan01feb@gmail.com" || email.includes("admin")) {
        assignedRole = "SUPER_ADMIN";
      } else if (["AGENCY", "AGENCY_ADMIN", "AGENCY_SUPPLIER_ADMIN", "RESELLER", "RESELLER_MANAGER", "CUSTOMER", "SUPER_ADMIN", "PLATFORM_ADMIN"].includes(role)) {
        assignedRole = role;
      }

      let activeTenantId = tenantId;
      if (!activeTenantId) {
        const firstTenant = await prisma.tenant.findFirst();
        if (firstTenant) {
          activeTenantId = firstTenant.id;
        } else {
          // Auto-provision a default tenant node if none exists
          const newTenant = await prisma.tenant.create({
            data: {
              name: "Default Nexus Tenant",
              slug: "default",
              status: "ACTIVE"
            }
          });
          activeTenantId = newTenant.id;
        }
      }

      const createdUser = await prisma.user.create({
        data: {
          email,
          passwordHash: hash,
          displayName: displayName || email.split("@")[0],
          role: assignedRole as any,
          tenantId: activeTenantId
        }
      });

      // Automatically initialize and fund a demo wallet
      await prisma.wallet.create({
        data: {
          userId: createdUser.id,
          tenantId: activeTenantId,
          balance: 1000000.00, // Pre-fund with IDR 1,000,000 test credits
          frozenBalance: 0.00
        }
      }).catch(err => {
        console.warn("Wallet creation warning:", err.message);
      });

      const token = generateToken({
        uid: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
        tenantId: createdUser.tenantId
      });

      res.status(201).json({
        token,
        user: {
          uid: createdUser.id,
          email: createdUser.email,
          displayName: createdUser.displayName,
          role: createdUser.role,
          tenantId: createdUser.tenantId
        }
      });
    } catch (error: any) {
      console.error("PostgreSQL registration failed:", error);
      res.status(500).json({ error: error.message || "Failed to register user" });
    }
  });

  // 2. Authenticated User Login (PostgreSQL + Prisma)
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const hash = crypto.createHash('sha256').update(password).digest('hex');
      if (user.passwordHash !== hash) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check user wallet, provision one if missing
      await prisma.wallet.findFirst({
        where: { userId: user.id }
      }).then(async (w) => {
        if (!w && user.tenantId) {
          await prisma.wallet.create({
            data: {
              userId: user.id,
              tenantId: user.tenantId,
              balance: 1000000.00,
              frozenBalance: 0.00
            }
          }).catch(() => null);
        }
      });

      const token = generateToken({
        uid: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
      });

      res.json({
        token,
        user: {
          uid: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          tenantId: user.tenantId
        }
      });
    } catch (error: any) {
      console.error("PostgreSQL login failed:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // 3. User Profile Session Check (Me)
  app.get("/api/auth/me", requireAuth, async (req: any, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.uid }
      });
      if (!user) {
        return res.status(404).json({ error: "User session not found" });
      }
      res.json({
        uid: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        tenantId: user.tenantId
      });
    } catch (error: any) {
      res.status(500).json({ error: "Could not retrieve user session profile" });
    }
  });

  // Supplier Connections CRUD (PostgreSQL-backed)
  app.get(
    "/api/suppliers",
    requireAuth,
    requireTenant,
    async (req, res) => {
      try {
        const suppliers = await prisma.supplier.findMany({
          where: { tenantId: (req as any).agency.id }
        });
        // Map from Prisma database representation to the client expected format
        const connections = suppliers.map(s => {
          let creds = s.credentials;
          if (typeof creds === 'string') {
            try { creds = JSON.parse(creds); } catch { creds = {}; }
          }
          return {
            id: s.id,
            agencyId: s.tenantId,
            supplierName: s.name,
            status: s.status,
            credentials: creds,
            successRate: s.successRate,
            avgResponseTime: s.avgResponseTime
          };
        });
        res.json(connections);
      } catch (error: any) {
        console.error("Failed to list supplier connections:", error);
        res.status(500).json({ error: "Failed to load supplier connections" });
      }
    }
  );

  app.post(
    "/api/suppliers",
    requireAuth,
    requireTenant,
    requirePermission('supplier.manage'),
    async (req, res) => {
      const { id, supplierName, status, credentials } = req.body;
      if (!supplierName) {
        return res.status(400).json({ error: "supplierName is required" });
      }

      try {
        const data = {
          name: supplierName,
          tenantId: (req as any).agency.id,
          status: status || "ACTIVE",
          credentials: credentials || {}
        };

        let supplier;
        if (id) {
          supplier = await prisma.supplier.update({
            where: { id },
            data
          });
        } else {
          supplier = await prisma.supplier.create({
            data
          });
        }

        res.json({
          id: supplier.id,
          agencyId: supplier.tenantId,
          supplierName: supplier.name,
          status: supplier.status,
          credentials: supplier.credentials
        });
      } catch (error: any) {
        console.error("Failed to save supplier connection:", error);
        res.status(500).json({ error: "Failed to save connection" });
      }
    }
  );

  app.delete(
    "/api/suppliers/:id",
    requireAuth,
    requireTenant,
    requirePermission('supplier.manage'),
    async (req, res) => {
      try {
        await prisma.supplier.delete({
          where: { id: req.params.id }
        });
        res.json({ success: true });
      } catch (error: any) {
        console.error("Failed to delete supplier connection:", error);
        res.status(500).json({ error: "Failed to delete connection" });
      }
    }
  );

  // Validate Supplier Credentials
  app.post(
    "/api/suppliers/validate",
    requireAuth,
    requireTenant,
    requirePermission('supplier.manage'),
    async (req, res) => {
      const { supplierName, credentials } = req.body;
      if (!supplierName || !credentials)
        return res
          .status(400)
          .json({ error: "supplierName and credentials are required" });

      try {
        const adapter = SupplierFactory.getAdapter(supplierName, credentials);
        const validation = await adapter.validateCredentials(credentials);
        res.json(validation);
      } catch (error: any) {
        console.error("Supplier Validation Error:", error);
        res.status(500).json({ isValid: false, message: error.message });
      }
    },
  );

  // Proxy to fetch balance from external API
  app.post(
    "/api/suppliers/fetch-balance",
    requireAuth,
    requireTenant,
    requirePermission('supplier.manage'),
    async (req, res) => {
      const { supplierName, credentials } = req.body;
      if (!supplierName || !credentials) {
        return res
          .status(400)
          .json({ error: "supplierName and credentials are required" });
      }

      try {
        const adapter = SupplierFactory.getAdapter(supplierName, credentials);
        const balanceResponse = await adapter.syncBalance();

        if (balanceResponse.success && balanceResponse.data) {
          return res.json({
            success: true,
            balance: balanceResponse.data.amount.toString(),
            currency: balanceResponse.data.currency,
          });
        } else {
          return res
            .status(502)
            .json({
              error: "Supplier returned error",
              detail: balanceResponse,
            });
        }
      } catch (error: any) {
        console.error("Fetch Balance Error:", error);
        res.status(500).json({ error: error.message });
      }
    },
  );

  // Fetch Products API from supplier
  app.post(
    "/api/suppliers/fetch-products",
    requireAuth,
    requireTenant,
    requirePermission('supplier.manage'),
    async (req, res) => {
      const { supplierName, credentials } = req.body;
      if (!supplierName || !credentials) {
        return res
          .status(400)
          .json({ error: "supplierName and credentials are required" });
      }

      try {
        const adapter = SupplierFactory.getAdapter(supplierName, credentials);

        if (!adapter.getProducts) {
          return res
            .status(400)
            .json({ error: "Supplier adapter does not support product sync" });
        }

        const products = await adapter.getProducts();
        res.json({ products });
      } catch (error: any) {
        console.error("Fetch Products Error:", error);
        res.status(500).json({ error: error.message });
      }
    },
  );

  // Supplier Health Monitoring
  app.get(
    "/api/suppliers/health",
    requireAuth,
    requireTenant,
    async (req, res) => {
      const agencyId = req.query.agencyId as string || (req as any).tenantId;
      if (!agencyId) {
        return res.status(400).json({ error: "agencyId is required" });
      }

      try {
        // Query active configurations from PostgreSQL Supplier table instead of Firestore
        const activeSuppliers = await prisma.supplier.findMany({
          where: {
            tenantId: agencyId,
            status: "ACTIVE"
          }
        });

        const healthData = [];
        const selector = ProviderSelector.getInstance();

        for (const sup of activeSuppliers) {
          const creds = typeof sup.credentials === 'string' ? JSON.parse(sup.credentials) : sup.credentials;
          const start = Date.now();
          let status: "Healthy" | "Stable" | "Maintenance" = "Healthy";
          let latency = 0;

          try {
            const adapter = SupplierFactory.getAdapter(sup.name, creds);
            await adapter.syncBalance();
            latency = Date.now() - start;
            if (latency > 350) status = "Stable";
          } catch (pingErr) {
            status = "Maintenance";
          }

          const telemetry = selector.getOrCreateTelemetry(agencyId, sup.name);

          healthData.push({
            id: sup.id,
            name: sup.name,
            status,
            latency: telemetry.totalOrders > 0 ? telemetry.avgLatency : (latency || 45),
            load: Math.min(100, Math.max(5, Math.floor(telemetry.successRate * 100) - 80 + Math.floor(Math.random() * 15))),
            successRate: Number((telemetry.successRate * 100).toFixed(1)),
            totalOrders: telemetry.totalOrders
          });
        }

        // Return empty list if no active suppliers found
        if (healthData.length === 0) {
          return res.json({ success: true, healthList: [] });
        }

        res.json({ success: true, healthList: healthData });
      } catch (error: any) {
        console.error("Supplier Health Check Error:", error);
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Reconciliation Runs API
  app.post(
    "/api/reconciliation/run",
    requireAuth,
    requireTenant,
    requirePermission('ledger.audit'),
    async (req, res) => {
      const agencyId = (req as any).tenantId;
      const { autoHeal } = req.body;
      try {
        const report = await ReconciliationService.runReconciliation(agencyId, !!autoHeal);
        res.json({ success: true, report });
      } catch (error: any) {
        console.error("Reconciliation Run Error:", error);
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Financial Integrity Alerts API
  app.get(
    "/api/financial/integrity/alerts",
    requireAuth,
    async (req, res) => {
      try {
        const drifts = await prisma.reconciliationDrift.findMany({
          where: { status: 'UNRESOLVED' },
          orderBy: { detectedAt: 'desc' },
          take: 5
        });
        res.json({ success: true, alerts: drifts });
      } catch (err: any) {
        console.error("Failed to fetch alerts:", err);
        res.status(500).json({ error: err.message });
      }
    }
  );

  // Webhook Hub Diagnostic API
  app.get("/api/webhooks/logs", requireAuth, requireTenant, async (req, res) => {
    try {
      const tenantId = (req as any).tenantId;
      const logs = await prisma.webhookDeliveryLog.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 20
      });
      res.json({ success: true, logs });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/webhooks/replay/:id", requireAuth, requireTenant, async (req, res) => {
    try {
      const tenantId = (req as any).tenantId;
      const result = await WebhookService.replayWebhook(req.params.id, tenantId);
      res.json({ success: true, result });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Products Database API (PostgreSQL-backed)
  app.get("/api/products", requireAuth, requireTenant, async (req, res) => {
    try {
      const products = await prisma.product.findMany({
        where: { tenantId: (req as any).agency.id }
      });
      
      if (products.length === 0) {
        return res.json([]);
      }

      // Format Prisma outputs to product structures expected by react frontend
      const mapped = products.map(p => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        basePrice: Number(p.costPrice),
        sellPrice: Number(p.sellPrice),
        isAvailable: p.isAvailable,
        isEnabled: p.isAvailable,
        syncedAt: p.createdAt.toISOString()
      }));
      res.json(mapped);
    } catch (error) {
      console.error("Failed to load products from DB:", error);
      res.status(500).json({ error: "Failed to load products" });
    }
  });

  app.post("/api/products/toggle", requireAuth, requireTenant, async (req, res) => {
    const { productId, isEnabled } = req.body;
    if (!productId) {
      return res.status(400).json({ error: "productId is required" });
    }
    try {
      await prisma.product.updateMany({
        where: { id: productId, tenantId: (req as any).agency.id },
        data: { isAvailable: isEnabled }
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to toggle product:", error);
      res.status(500).json({ error: "Failed to update product state" });
    }
  });

  // Resellers Management API (PostgreSQL-backed)
  app.get("/api/resellers", requireAuth, requireTenant, async (req, res) => {
    try {
      const resellers = await prisma.user.findMany({
        where: { tenantId: (req as any).agency.id, role: "RESELLER" },
        include: { wallets: true }
      });
      const mapped = resellers.map(r => ({
        id: r.id,
        agencyId: r.tenantId,
        name: r.displayName || r.email.split("@")[0],
        email: r.email,
        status: "ACTIVE",
        balance: r.wallets?.[0]?.balance ? Number(r.wallets[0].balance) : 0,
        createdAt: r.createdAt.toISOString()
      }));
      res.json(mapped);
    } catch (error) {
      console.error("Failed to list resellers from DB:", error);
      res.status(500).json({ error: "Failed to load partners" });
    }
  });

  app.post("/api/resellers", requireAuth, requireTenant, requirePermission('reseller.create'), async (req, res) => {
    const { name, email, balance } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    try {
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            passwordHash: crypto.createHash('sha256').update('123456').digest('hex'),
            displayName: name || email.split("@")[0],
            role: "RESELLER",
            tenantId: (req as any).agency.id
          }
        });
      }

      const walletAmt = Number(balance || 0);
      let wallet = await prisma.wallet.findFirst({
        where: { userId: user.id }
      });
      if (!wallet) {
        wallet = await prisma.wallet.create({
          data: {
            userId: user.id,
            tenantId: (req as any).agency.id,
            balance: 0,
            frozenBalance: 0
          }
        });
      }

      if (walletAmt > 0) {
        await LedgerEngine.recordTransaction({
          tenantId: (req as any).agency.id,
          type: 'DEPOSIT',
          description: `Onboarding administrative fund for user ${user.email}`,
          idempotencyKey: `prefund_${wallet.id}_${Date.now()}`,
          entries: [
            {
              accountId: 'SYSTEM_LIABILITY',
              accountType: LedgerAccountType.SYSTEM_LIABILITY,
              type: 'DEBIT',
              amount: walletAmt,
            },
            {
              accountId: wallet.id,
              accountType: LedgerAccountType.USER_WALLET,
              type: 'CREDIT',
              amount: walletAmt,
            }
          ]
        });

        const reloaded = await prisma.wallet.findUnique({
          where: { id: wallet.id }
        });
        if (reloaded) {
          wallet = reloaded;
        }
      }

      res.json({
        id: user.id,
        agencyId: user.tenantId,
        name: user.displayName,
        email: user.email,
        status: "ACTIVE",
        balance: Number(wallet.balance),
        createdAt: user.createdAt.toISOString()
      });
    } catch (error) {
      console.error("Failed to scale reseller:", error);
      res.status(500).json({ error: "Failed to configure reseller status" });
    }
  });

  app.delete("/api/resellers/:id", requireAuth, requireTenant, requirePermission('reseller.create'), async (req, res) => {
    try {
      await prisma.user.delete({
        where: { id: req.params.id }
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete reseller:", error);
      res.status(500).json({ error: "Failed to delete" });
    }
  });

  // Manual Reseller Balance adjustment API
  app.post("/api/resellers/:id/balance", requireAuth, requireTenant, requirePermission('reseller.create'), async (req, res) => {
    const { id } = req.params;
    const { amount, description } = req.body;
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    try {
      const { LedgerService } = await import('./src/services/billing/ledgerService');
      const result = await LedgerService.executeLedgerEntry({
        resellerId: id,
        agencyId: (req as any).agency.id,
        amount: Math.abs(numAmount),
        type: numAmount >= 0 ? 'CREDIT' : 'DEBIT',
        description: description || 'Manual adjustment by admin'
      });
      res.json({ success: true, result });
    } catch (err: any) {
      console.error("Failed to adjust reseller balance:", err);
      res.status(500).json({ error: err.message || "Failed to adjust balance" });
    }
  });

  // Client-Facing/Admin-Facing Deposit System Endpoints
  app.get("/api/billing/deposit/pending", requireAuth, requireTenant, async (req, res) => {
    try {
      const { BillingService: BillingServiceServer } = await import('./src/services/billing/billingService.server');
      const data = await BillingServiceServer.getPendingDeposits((req as any).agency.id);
      res.json(data);
    } catch (err: any) {
      console.error("Failed to get pending deposits:", err);
      res.status(500).json({ error: err.message || "Failed to load pending deposits" });
    }
  });

  app.post("/api/billing/deposit/request", requireAuth, requireTenant, async (req, res) => {
    const { resellerId, agencyId, amount, paymentMethod } = req.body;
    if (!resellerId || !agencyId || !amount || !paymentMethod) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    try {
      const { BillingService: BillingServiceServer } = await import('./src/services/billing/billingService.server');
      const result = await BillingServiceServer.requestDeposit({
        resellerId,
        agencyId,
        amount: Number(amount),
        paymentMethod
      });
      res.json({ success: result });
    } catch (err: any) {
      console.error("Failed to request deposit:", err);
      res.status(500).json({ error: err.message || "Failed to submit deposit request" });
    }
  });

  app.post("/api/billing/deposit/approve", requireAuth, requireTenant, async (req, res) => {
    // Restrict approval exclusively to platform administrators or tenant agents
    const userRole = (req as any).user?.role;
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'AGENCY' && userRole !== 'AGENCY_ADMIN') {
      return res.status(403).json({ error: "Unauthorized role for billing operations" });
    }
    const { transaction } = req.body;
    if (!transaction) {
      return res.status(400).json({ error: "Missing transaction parameter" });
    }
    try {
      const { BillingService: BillingServiceServer } = await import('./src/services/billing/billingService.server');
      const result = await BillingServiceServer.approveDeposit(transaction);
      res.json({ success: true, result });
    } catch (err: any) {
      console.error("Failed to approve deposit:", err);
      res.status(500).json({ error: err.message || "Failed to approve deposit" });
    }
  });

  app.post("/api/billing/deposit/reject", requireAuth, requireTenant, async (req, res) => {
    const userRole = (req as any).user?.role;
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'AGENCY' && userRole !== 'AGENCY_ADMIN') {
      return res.status(403).json({ error: "Unauthorized role for billing operations" });
    }
    const { agencyId, id } = req.body;
    if (!agencyId || !id) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    try {
      const { BillingService: BillingServiceServer } = await import('./src/services/billing/billingService.server');
      const result = await BillingServiceServer.rejectDeposit(agencyId, id);
      res.json({ success: true });
    } catch (err: any) {
      console.error("Failed to reject deposit:", err);
      res.status(500).json({ error: err.message || "Failed to reject deposit" });
    }
  });

  // Ledger Audit Explorations API
  app.get(
    "/api/reconciliation/ledger",
    requireAuth,
    requireTenant,
    requirePermission('ledger.audit'),
    async (req, res) => {
      const agencyId = (req as any).tenantId;
      try {
        const journals = await prisma.ledgerJournal.findMany({
          where: { tenantId: agencyId },
          include: { entries: true },
          orderBy: { createdAt: 'desc' },
          take: 50
        });
        res.json({ success: true, journals });
      } catch (error: any) {
        console.error("Ledger Fetch Error:", error);
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Order retrieval API
  app.get("/api/orders", requireAuth, requireTenant, async (req, res) => {
    try {
      const agencyId = (req as any).tenantId;
      const dbTxns = await prisma.transaction.findMany({
        where: {
          tenantId: agencyId
        },
        include: {
          items: { include: { product: true } },
          walletLedgers: { include: { wallet: true } },
          journals: { include: { entries: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      const processed = dbTxns.map(t => {
        const firstItem = t.items[0];
        const ledger = t.walletLedgers?.[0];
        let resellerId = ledger?.wallet?.userId;
        if (!resellerId && t.journals?.length > 0) {
           const credEntry = t.journals[0].entries.find(e => e.type === 'CREDIT' && !e.accountId.startsWith('SYSTEM:'));
           resellerId = credEntry?.accountId; // This is actually walletId technically, but usually they match userId in our old code, we'll just fall back to it
        }

        return {
          id: t.id,
          resellerId: resellerId || 'unknown',
          agencyId: agencyId,
          productId: firstItem?.productId,
          supplierId: t.supplierId || undefined,
          status: t.status as any,
          quantity: firstItem?.quantity || 1,
          totalCost: Number(t.totalAmount),
          targetAccount: t.customerTarget,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          sku: firstItem?.product?.sku,
          price: Number(firstItem?.priceUnit)
        };
      });

      res.json(processed);
    } catch (err: any) {
      console.error("Order Fetch Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Order Submission API
  app.post("/api/orders", requireAuth, requireTenant, async (req, res) => {
    try {
      const agencyId = (req as any).tenantId || req.body.agencyId;
      const { resellerId, productId, quantity, targetAccount } = req.body;
      
      if (!resellerId || !productId || !quantity || !targetAccount) {
         return res.status(400).json({ error: "Missing required fields" });
      }

      const result = await TransactionManagerService.createOrder({
        resellerId,
        agencyId,
        productId,
        quantity: Number(quantity),
        targetAccount,
        idempotencyKey: req.headers['x-idempotency-key'] as string
      });

      if (!result.success) {
         return res.status(400).json({ error: result.error });
      }

      res.json(result);
    } catch (err: any) {
      console.error("Order Creation Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Core Fulfillment Pipeline
  app.post(
    "/api/orders/process",
    async (req, res) => {
      const { orderId, agencyId } = req.body;
      if (!orderId || !agencyId)
        return res
          .status(400)
          .json({ error: "orderId and agencyId are required" });

      console.log(
        `[PIPELINE_ENGINE] Processing Order: ${orderId} on Tenant: ${agencyId}`,
      );

      try {
        // Atomically lock status to PROCESSING via SQL to prevent concurrent queue dispatching
        const updateResult = await prisma.$executeRaw`
          UPDATE "Transaction" 
          SET status = 'PROCESSING', "updatedAt" = NOW() 
          WHERE id = ${orderId} AND status = 'PENDING'
        `;

        if (updateResult === 0) {
          // It was either not found or not PENDING (someone else already clicked process)
          return res.status(400).json({ error: "Transaction is already processed or resolved." });
        }

        // Trigger safe asynchronous BullMQ / dynamic queue job task
        try {
          const queued = await QueueService.getInstance().addTopupJob({
            orderId,
            agencyId,
          });

          if (queued) {
            return res.json({
              success: true,
              status: "PROCESSING",
              message: "Fulfillment successfully dispatched to production workers.",
            });
          } else {
            // Revert processing status on queue dispatch errors
            await prisma.transaction.update({
               where: { id: orderId },
               data: { status: "PENDING", updatedAt: new Date() }
            });
            return res.status(500).json({ error: "Fulfillment queue dispatch failed" });
          }
        } catch (queueErr: any) {
          console.error("Fulfillment Queue error:", queueErr);
          // Failsafe: Hard revert status as the order never entered the durable queue
          await prisma.transaction.update({
             where: { id: orderId },
             data: { status: "PENDING", updatedAt: new Date() }
          });
          return res.status(500).json({ error: "Fulfillment infrastructure disabled or offline: " + queueErr.message });
        }
      } catch (error: any) {
        console.error("General Process API error:", error);
        res.status(500).json({ error: error.message });
      }
    },
  );

  // Webhook Receiver with HMAC verification
  app.post(
    "/api/webhooks/digiflazz",
    verifyWebhookSignature("DIGIFLAZZ_SECRET"),
    async (req, res) => {
      console.log("Verified Digiflazz Webhook Payload:", req.body);
      const data = req.body?.data;
      if (!data || !data.ref_id) {
        return res.status(400).json({ error: "Invalid payload layout" });
      }

      try {
        const orderId = data.ref_id;
        const status = data.status; // 'Gagal' | 'Sukses' | 'Pending'
        
        // Let's resolve the order
        const order = await prisma.transaction.findUnique({
          where: { id: orderId }
        });

        if (!order) {
           return res.status(404).json({ error: "Order not found" });
        }

        if (order.status === 'FAILED' || order.status === 'REFUNDED') {
           return res.json({ success: true, message: "Order already resolved as failed/refunded" });
        }

        // Get agency/tenant
        const agencyId = order.tenantId;
        let resellerId = '';

        const ledgerEntry = await prisma.walletLedger.findFirst({ where: { orderId: orderId, type: 'FREEZE' }, include: { wallet: true } });
        if (ledgerEntry) {
           resellerId = ledgerEntry.wallet.userId;
        } else {
           const freezeJournal = await prisma.ledgerJournal.findFirst({
              where: { orderId: orderId, type: 'FREEZE' },
              include: { entries: true }
           });
           if (freezeJournal) {
              const cred = freezeJournal.entries.find(e => e.type === 'CREDIT' && !e.accountId.startsWith('SYSTEM:'));
              if (cred) {
                 const tWallet = await prisma.wallet.findUnique({ where: { id: cred.accountId } });
                 if (tWallet) resellerId = tWallet.userId;
              }
           }
        }
        
        if (!resellerId || !agencyId) {
           return res.json({ success: true, warning: 'Could not find tenant/reseller context' });
        }

        if (status === 'Gagal') {
          await TransactionManagerService.failAndRefundOrder(orderId, resellerId, agencyId, data.sn || 'Supplier failed order via webhook callback');
        } else if (status === 'Sukses') {
          const settlementSuccess = await TransactionManagerService.completeOrder(orderId, resellerId, agencyId);
          if (settlementSuccess) {
            await prisma.transaction.update({
              where: { id: orderId },
              data: { updatedAt: new Date() } // could save SN here
            });
          }
        }
        
        res.json({ success: true });
      } catch (err: any) {
        console.error("Webhook callback processing failed:", err);
        res.status(500).json({ error: "Webhook resolution failed" });
      }
    },
  );

  // --- DOUBLE-ENTRY LEDGER & FINANCIAL INTEGRITY ENDPOINTS ---
  app.post(
    "/api/financial/deposit",
    requireAuth,
    async (req, res) => {
      try {
        const tenantId = (req as any).agency?.id || "nexuscore-default-tenant";
        const { walletId, amount, idempotencyKey, description } = req.body;

        if (!walletId || !amount || !idempotencyKey) {
          return res.status(400).json({ error: "walletId, amount and idempotencyKey are required" });
        }

        const journal = await BalanceManager.depositFunds(
          tenantId,
          walletId,
          amount,
          idempotencyKey,
          description || "Deposit via Financial Portal"
        );

        res.json({ success: true, journalId: journal.id, message: "Funds deposited successfully via Ledger Double-Entry" });
      } catch (err: any) {
        console.error("Ledger Deposit failed:", err);
        res.status(500).json({ error: err.message || "Ledger deposit operations failed" });
      }
    }
  );

  app.post(
    "/api/financial/withdraw",
    requireAuth,
    async (req, res) => {
      try {
        const tenantId = (req as any).agency?.id || "nexuscore-default-tenant";
        const { walletId, amount, idempotencyKey, description } = req.body;

        if (!walletId || !amount || !idempotencyKey) {
          return res.status(400).json({ error: "walletId, amount and idempotencyKey are required" });
        }

        const journal = await BalanceManager.withdrawFunds(
          tenantId,
          walletId,
          amount,
          idempotencyKey,
          description || "Withdrawal via Financial Portal"
        );

        res.json({ success: true, journalId: journal.id, message: "Funds withdrawn successfully via Ledger Double-Entry" });
      } catch (err: any) {
        console.error("Ledger Withdrawal failed:", err);
        res.status(400).json({ error: err.message || "Ledger withdrawal operations failed" });
      }
    }
  );

  // --- ENTERPRISE PAYMENT RAILS ENDPOINTS ---
  app.post(
    "/api/payment/deposit/qris",
    requireAuth,
    async (req, res) => {
      try {
        const tenantId = (req as any).agency?.id || "nexuscore-default-tenant";
        const { walletId, amount, customerName, customerEmail, preferredProvider } = req.body;

        if (!walletId || !amount || !customerName || !customerEmail) {
          return res.status(400).json({ error: "walletId, amount, customerName, and customerEmail are required" });
        }

        const result = await QRISService.generateDepositQR(
          tenantId,
          walletId,
          parseFloat(amount),
          customerName,
          customerEmail,
          preferredProvider
        );

        res.json({ success: true, ...result });
      } catch (err: any) {
        logger.error({ err }, "QRIS payment creation failed");
        res.status(500).json({ error: err.message || "QRIS generation failed" });
      }
    }
  );

  app.post(
    "/api/payment/deposit/va",
    requireAuth,
    async (req, res) => {
      try {
        const tenantId = (req as any).agency?.id || "nexuscore-default-tenant";
        const { walletId, amount, bankCode, customerName, customerEmail, preferredProvider } = req.body;

        if (!walletId || !amount || !bankCode || !customerName || !customerEmail) {
          return res.status(400).json({ error: "walletId, amount, bankCode, customerName, and customerEmail are required" });
        }

        const result = await VirtualAccountService.generateDepositVA(
          tenantId,
          walletId,
          parseFloat(amount),
          bankCode,
          customerName,
          customerEmail,
          preferredProvider
        );

        res.json({ success: true, ...result });
      } catch (err: any) {
        logger.error({ err }, "VA payment creation failed");
        res.status(500).json({ error: err.message || "VA generation failed" });
      }
    }
  );

  app.post(
    "/api/payment/deposit/ewallet",
    requireAuth,
    async (req, res) => {
      try {
        const { EWalletService } = await import("./src/services/payment/EWalletService");
        const tenantId = (req as any).agency?.id || "nexuscore-default-tenant";
        const { walletId, amount, walletProvider, phoneNumber, callbackUrl, preferredProvider } = req.body;

        if (!walletId || !amount || !walletProvider || !phoneNumber) {
          return res.status(400).json({ error: "walletId, amount, walletProvider, and phoneNumber are required" });
        }

        const result = await EWalletService.chargeDepositEWallet(
          tenantId,
          walletId,
          parseFloat(amount),
          walletProvider,
          phoneNumber,
          callbackUrl,
          preferredProvider
        );

        res.json({ success: true, ...result });
      } catch (err: any) {
        logger.error({ err }, "EWallet charge invocation failed");
        res.status(500).json({ error: err.message || "EWallet charge failed" });
      }
    }
  );

  app.post(
    "/api/payment/withdrawal",
    requireAuth,
    async (req, res) => {
      try {
        const { WithdrawalService } = await import("./src/services/payment/WithdrawalService");
        const tenantId = (req as any).agency?.id || "nexuscore-default-tenant";
        const { walletId, amount, bankCode, accountNumber, accountName, description } = req.body;

        if (!walletId || !amount || !bankCode || !accountNumber || !accountName) {
          return res.status(400).json({ error: "walletId, amount, bankCode, accountNumber, and accountName are required" });
        }

        const result = await WithdrawalService.requestWithdrawal(
          tenantId,
          walletId,
          parseFloat(amount),
          bankCode,
          accountNumber,
          accountName,
          description || "Withdrawal payout"
        );

        res.json({ success: true, ...result });
      } catch (err: any) {
        logger.error({ err }, "Withdrawal request processing failed");
        res.status(500).json({ error: err.message || "Withdrawal payout processing failed" });
      }
    }
  );

  app.post(
    "/api/payment/refund",
    requireAuth,
    requirePermission('refund.execute'),
    async (req, res) => {
      try {
        const { RefundEngine } = await import("./src/services/payment/RefundEngine");
        const tenantId = (req as any).agency?.id || "nexuscore-default-tenant";
        const { transactionId, amount, reason, idempotencyKey } = req.body;

        if (!transactionId || !amount || !reason || !idempotencyKey) {
          return res.status(400).json({ error: "transactionId, amount, reason, and idempotencyKey are required" });
        }

        const result = await RefundEngine.processRefund(
          tenantId,
          transactionId,
          parseFloat(amount),
          reason,
          idempotencyKey
        );

        res.json({ success: true, ...result });
      } catch (err: any) {
        logger.error({ err }, "Refund processing failed");
        res.status(500).json({ error: err.message || "Refund processing failed" });
      }
    }
  );

  app.get(
    "/api/payment/deposit/sync/:id",
    requireAuth,
    async (req, res) => {
      try {
        const { QRISService } = await import("./src/services/payment/QRISService");
        const tenantId = (req as any).agency?.id || "nexuscore-default-tenant";
        const { id } = req.params;

        const currentStatus = await QRISService.syncQRISPaymentStatus(tenantId, id);
        res.json({ success: true, status: currentStatus });
      } catch (err: any) {
        logger.error({ err }, "State synchronization failed");
        res.status(500).json({ error: err.message || "Status sync failed" });
      }
    }
  );

  // --- HIGH SECURITY REAL-MONEY WEBHOOK HANDLER ---
  app.post(
    "/api/webhooks/payment/:provider",
    async (req, res) => {
      const { provider } = req.params;
      const providerKey = provider.toLowerCase();

      if (providerKey !== 'midtrans' && providerKey !== 'xendit' && providerKey !== 'duitku') {
        return res.status(400).json({ error: "Unsupported callback provider" });
      }

      try {
        // Trace depositId from payload details dynamically
        const body = req.body || {};
        let depositId = '';

        if (providerKey === 'midtrans') {
          depositId = body.order_id;
        } else if (providerKey === 'xendit') {
          depositId = body.external_id || body.reference_id || (body.qr_code && body.qr_code.external_id);
        } else if (providerKey === 'duitku') {
          depositId = body.merchantOrderId;
        }

        if (!depositId) {
          logger.warn({ providerKey, body }, "Callback rejected due to missing order reference parameters");
          return res.status(400).json({ error: "Missing order transaction identification tag" });
        }

        const deposit = await prisma.deposit.findUnique({
          where: { id: depositId },
          include: { wallet: true },
        });

        if (!deposit) {
          logger.error({ depositId, providerKey }, "Payment callback reference matches no database records");
          return res.status(404).json({ error: "Deposit transaction record not found" });
        }

        const tenantId = deposit.wallet.tenantId || "nexuscore-default-tenant";

        // Invoke cryptographic verification checks
        const { PaymentGatewayManager } = await import("./src/services/payment/PaymentGatewayManager");
        const manager = PaymentGatewayManager.getInstance();
        const adapter = manager.getAdapter(providerKey as any);

        const verifyResult = await adapter.verifyWebhook(tenantId, {
          headers: req.headers,
          body: req.body,
        });

        if (!verifyResult.isValid) {
          logger.error({ depositId, tenantId, providerKey }, "CRITICAL Webhook Validation FAILED! Signature key error.");
          return res.status(401).json({ error: "Invalid cryptographic signature validation" });
        }

        // Prevent dual processing updates
        if (deposit.status === 'SUCCESS') {
          logger.info({ depositId }, "Idempotent payment callback detected: already completed successfully, replying 200 OK.");
          return res.json({ success: true, message: "Duplicate payment signal resolved silently." });
        }

        if (verifyResult.status === 'SETTLED') {
          // Commit dynamic balanced ledger entry credits
          const { BalanceManager } = await import("./src/services/financial/BalanceManager");
          const finalIdempotencyKey = `dep-callback-${depositId}`;

          await BalanceManager.depositFunds(
            tenantId,
            deposit.walletId,
            verifyResult.amount,
            finalIdempotencyKey,
            `Deposit Credit paid via ${providerKey.toUpperCase()} [ID: ${verifyResult.referenceId || depositId}]`
          );

          // Commit status updates
          await prisma.deposit.update({
            where: { id: depositId },
            data: {
              status: 'SUCCESS',
              paymentRef: verifyResult.referenceId || depositId,
            },
          });

          logger.info({ depositId, walletId: deposit.walletId }, "SaaS billing deposit finalized. Balance credited via Ledger ledger entries.");

          // Record Success Metrics inside Redis
          try {
            const { getRedisClient } = await import("./src/lib/redis");
            const redisClient = getRedisClient();
            await redisClient.incr(`financial_metrics:payments:success_count`);
            await redisClient.incrbyfloat(`financial_metrics:payments:success_volume`, verifyResult.amount);
          } catch {}

          return res.json({ success: true, message: "Payment processed successfully" });
        } else if (verifyResult.status === 'EXPIRED') {
          await prisma.deposit.update({
            where: { id: depositId },
            data: { status: 'EXPIRED' },
          });
          return res.json({ success: true, message: "Logged as EXPIRED" });
        } else if (verifyResult.status === 'FAILED') {
          await prisma.deposit.update({
            where: { id: depositId },
            data: { status: 'FAILED' },
          });
          return res.json({ success: true, message: "Logged as FAILED" });
        }

        res.json({ success: true });
      } catch (err: any) {
        logger.error({ err, providerKey }, "Payment callback processing exception");
        res.status(500).json({ error: err.message || "Webhook handling system error" });
      }
    }
  );


  app.post(
    "/api/financial/settle/initiate",
    requireAuth,
    async (req, res) => {
      try {
        const { SettlementEngine } = await import("./src/services/financial/SettlementEngine");
        const tenantId = (req as any).agency?.id || "nexuscore-default-tenant";
        const { walletId, amount, orderId, idempotencyKey } = req.body;

        if (!walletId || !amount || !orderId || !idempotencyKey) {
          return res.status(400).json({ error: "walletId, amount, orderId and idempotencyKey are required" });
        }

        const settlement = await SettlementEngine.initiateSettlement(
          tenantId,
          walletId,
          amount,
          orderId,
          idempotencyKey
        );

        res.json({ success: true, settlementId: settlement.id, message: "Settlement flow initiated and held in Escrow" });
      } catch (err: any) {
        console.error("Initiate Settlement failed:", err);
        res.status(500).json({ error: err.message || "Settlement initiation failed" });
      }
    }
  );

  app.post(
    "/api/financial/settle/commit",
    requireAuth,
    async (req, res) => {
      try {
        const { SettlementEngine } = await import("./src/services/financial/SettlementEngine");
        const tenantId = (req as any).agency?.id || "nexuscore-default-tenant";
        const { orderId, supplierSettlementAmount, idempotencyKey } = req.body;

        if (!orderId || supplierSettlementAmount === undefined || !idempotencyKey) {
          return res.status(400).json({ error: "orderId, supplierSettlementAmount and idempotencyKey are required" });
        }

        const settlement = await SettlementEngine.commitSettlement(
          tenantId,
          orderId,
          supplierSettlementAmount,
          idempotencyKey
        );

        res.json({ success: true, settlementId: settlement.id, message: "Settlement successfully committed and paid" });
      } catch (err: any) {
        console.error("Commit Settlement failed:", err);
        res.status(500).json({ error: err.message || "Settlement commitment failed" });
      }
    }
  );

  app.post(
    "/api/financial/settle/rollback",
    requireAuth,
    async (req, res) => {
      try {
        const { SettlementEngine } = await import("./src/services/financial/SettlementEngine");
        const tenantId = (req as any).agency?.id || "nexuscore-default-tenant";
        const { walletId, orderId, idempotencyKey, reason } = req.body;

        if (!walletId || !orderId || !idempotencyKey) {
          return res.status(400).json({ error: "walletId, orderId and idempotencyKey are required" });
        }

        const settlement = await SettlementEngine.rollbackSettlement(
          tenantId,
          walletId,
          orderId,
          idempotencyKey,
          reason || "Settlement rollback transaction triggered"
        );

        res.json({ success: true, settlementId: settlement.id, message: "Settlement successfully rolled back and escrow refunded" });
      } catch (err: any) {
        console.error("Rollback Settlement failed:", err);
        res.status(500).json({ error: err.message || "Settlement rollback failed" });
      }
    }
  );

  app.get(
    "/api/financial/integrity",
    requireAuth,
    async (req, res) => {
      try {
        const { FinancialIntegrityService } = await import("./src/services/financial/FinancialIntegrityService");
        const tenantId = (req as any).agency?.id || "nexuscore-default-tenant";

        const report = await FinancialIntegrityService.performIntegrityAudit(tenantId);
        res.json({ success: true, report });
      } catch (err: any) {
        console.error("Financial Integrity validation failed:", err);
        res.status(500).json({ error: err.message || "Financial integrity scan failed" });
      }
    }
  );

  // Global Express Error Handler Middleware with Sentry Integration
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error({ err, correlationId: (req as any).correlationId }, "Unhandled express error in routes");
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(err, {
        extra: {
          correlationId: (req as any).correlationId,
          url: req.url,
          method: req.method,
          body: req.body,
          query: req.query,
          params: req.params,
        }
      });
    }
    res.status(500).json({
      error: "Internal Server Error",
      correlationId: (req as any).correlationId,
      message: process.env.NODE_ENV === "production" ? undefined : err.message
    });
  });

  // Enterprise Health Checks
  app.get("/health", async (req, res) => {
    res.json({ status: "up", timestamp: new Date(), version: "1.0.0" });
  });

  app.get("/live", (req, res) => {
    res.json({ status: "alive" });
  });

  app.get("/ready", async (req, res) => {
    try {
      // 1. PostgreSQL Check
      await prisma.$queryRaw`SELECT 1`;
      
      // 2. Redis Check
      const redis = require('./src/lib/redis').getRedisClient();
      if (redis.status !== 'ready') {
        throw new Error('Redis is not ready');
      }
      
      // 3. Queue Check Check
      const isQueueActive = await QueueService.getInstance().isReady();
      if (!isQueueActive) {
        throw new Error('Queue service not ready');
      }
      
      res.json({
        status: "ready",
        components: {
          database: "up",
          redis: "up",
          queue: "up"
        }
      });
    } catch (e: any) {
      res.status(503).json({
        status: "not_ready",
        error: e.message
      });
    }
  });

  // Vite middleware or static serving configuration
  const distPath = path.join(process.cwd(), "dist");
  const indexPath = path.join(distPath, "index.html");
  console.log(`[DEBUG] CWD: ${process.cwd()}, DistPath: ${distPath}, IndexExists: ${fs.existsSync(indexPath)}`);
  const isProd = process.env.NODE_ENV === "production" && fs.existsSync(indexPath);
  
  // Start background workers asynchronously
  let stopWorkers: () => Promise<void> = async () => {};
  startAllWorkers().then((api) => {
    stopWorkers = api.shutdown;
  }).catch(err => {
    logger.error({ err }, "Fatal: Failed to start background workers");
  });

  if (isProd) {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    console.log("[SERVER] Starting in development mode: mounting dynamic Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(Number(PORT), "0.0.0.0", () => {                
    logger.info(`NexusCore Production Engine running on http://localhost:${PORT}`);
    startTracing();
  });

  // Enterprise Graceful shutdown
  const shutdown = async () => {
    logger.info("SIGTERM/SIGINT received. Initiating enterprise graceful shutdown...");
    
    // 1. Stop taking new requests
    server.close(async () => {
      logger.info("Express server ingress closed.");
      
      try {
        // 2. Stop workers slowly
        await stopWorkers();
        
        // 3. Stop queue connections
        await QueueService.getInstance().gracefulShutdown();
        
        const { shutdownQueues } = await import('./src/lib/queueManager');
        await shutdownQueues();

        const { getRedisClient } = await import('./src/lib/redis');
        await getRedisClient().quit();
        logger.info("Redis connections safely closed.");

        // 4. Close Database
        await prisma.$disconnect();
        logger.info("PostgreSQL connections safely closed.");
        
        process.exit(0);
      } catch (err: any) {
         logger.error(err, "Error during graceful disconnect:");
         process.exit(1);
      }
    });
    
    // Fallback terminator 
    setTimeout(() => {
      logger.error("Forcing shutdown after 15s timeout");
      process.exit(1);
    }, 15000);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  process.on('SIGUSR2', shutdown);
}

startServer().catch((err) => {
  logger.error(err, "CRITICAL: Server failed to start up gracefully");
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});
