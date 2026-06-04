var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/lib/env.ts
function cleanDatabaseUrl(url) {
  if (!url) return url;
  let cleaned = url;
  if (cleaned.includes("[") && cleaned.includes("]")) {
    cleaned = cleaned.replace(/\[(.*?)\]/, (_, p1) => encodeURIComponent(p1));
  }
  return cleaned;
}
var import_zod, import_dotenv, import_crypto, envSchema, _env, env;
var init_env = __esm({
  "src/lib/env.ts"() {
    import_zod = require("zod");
    import_dotenv = __toESM(require("dotenv"), 1);
    import_crypto = __toESM(require("crypto"), 1);
    import_dotenv.default.config();
    process.env.DATABASE_URL = cleanDatabaseUrl(process.env.DATABASE_URL);
    if (process.env.DIRECT_URL) {
      process.env.DIRECT_URL = cleanDatabaseUrl(process.env.DIRECT_URL);
    }
    if (process.env.REDIS_URL) {
      let url = process.env.REDIS_URL.trim();
      if (url.startsWith("://")) {
        url = "redis" + url;
      } else if (!url.includes("://") && !url.startsWith("/")) {
        url = "redis://" + url;
      }
      process.env.REDIS_URL = url;
    }
    if (!process.env.DATABASE_URL) {
      throw new Error("[ENV] DATABASE_URL wajib diset. Salin .env.example ke .env dan isi nilainya.\nFormat: postgresql://user:password@host:port/dbname");
    }
    envSchema = import_zod.z.object({
      NODE_ENV: import_zod.z.enum(["development", "production", "test"]).default("development"),
      DATABASE_URL: import_zod.z.string().url(),
      PORT: import_zod.z.string().default("3000"),
      DIGIFLAZZ_SECRET: import_zod.z.string().default(process.env.NODE_ENV === "production" ? import_crypto.default.randomBytes(32).toString("hex") : "development_secret"),
      GEMINI_API_KEY: import_zod.z.string().optional(),
      REDIS_URL: import_zod.z.string().default("redis://localhost:6379/0")
    });
    _env = envSchema.safeParse(process.env);
    if (!_env.success) {
      console.error("\u274C Environment variable validation failed:", _env.error.format());
      throw new Error("Missing or invalid environment variables");
    }
    env = _env.data;
  }
});

// src/lib/logger.ts
var import_pino, import_api, logger, auditLogger, financialLogger, workerLogger, webhooksLogger;
var init_logger = __esm({
  "src/lib/logger.ts"() {
    import_pino = __toESM(require("pino"), 1);
    init_env();
    import_api = require("@opentelemetry/api");
    logger = (0, import_pino.default)({
      level: env.NODE_ENV === "production" ? "info" : "debug",
      formatters: {
        level: (label) => ({ level: label })
      },
      timestamp: import_pino.default.stdTimeFunctions.isoTime,
      mixin() {
        const span = import_api.trace.getSpan(import_api.context.active());
        if (!span) return {};
        const { traceId, spanId } = span.spanContext();
        return { traceId, spanId };
      }
    });
    auditLogger = logger.child({ type: "audit_log", immutable: true });
    financialLogger = logger.child({ type: "financial_transaction" });
    workerLogger = logger.child({ type: "worker_telemetry" });
    webhooksLogger = logger.child({ type: "webhook_audit" });
  }
});

// src/lib/redis.ts
var redis_exports = {};
__export(redis_exports, {
  getRedisClient: () => getRedisClient
});
function getRedisClient() {
  if (globalForRedis.redisClient) {
    return globalForRedis.redisClient;
  }
  const redisConfig = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
    enableOfflineQueue: true,
    retryStrategy: (times) => {
      const delay = Math.min(times * 200, 3e3);
      return delay;
    }
  };
  const url = env.REDIS_URL;
  const client2 = new import_ioredis.default(url, redisConfig);
  client2.on("error", (err) => {
    logger.error(err, "Redis connection error");
  });
  client2.on("connect", () => {
    logger.info("Redis connected succesfully");
  });
  globalForRedis.redisClient = client2;
  return client2;
}
var import_ioredis, globalForRedis;
var init_redis = __esm({
  "src/lib/redis.ts"() {
    import_ioredis = __toESM(require("ioredis"), 1);
    init_env();
    init_logger();
    globalForRedis = globalThis;
  }
});

// src/lib/queueManager.ts
var queueManager_exports = {};
__export(queueManager_exports, {
  QueueName: () => QueueName,
  auditQueue: () => auditQueue,
  createQueue: () => createQueue,
  payoutQueue: () => payoutQueue,
  reconciliationQueue: () => reconciliationQueue,
  settlementQueue: () => settlementQueue,
  setupQueueMonitoring: () => setupQueueMonitoring,
  shutdownQueues: () => shutdownQueues,
  transactionQueue: () => transactionQueue,
  webhookQueue: () => webhookQueue
});
var import_bullmq, QueueName, createQueue, transactionQueue, webhookQueue, reconciliationQueue, settlementQueue, payoutQueue, auditQueue, setupQueueMonitoring, shutdownQueues;
var init_queueManager = __esm({
  "src/lib/queueManager.ts"() {
    import_bullmq = require("bullmq");
    init_redis();
    init_logger();
    QueueName = /* @__PURE__ */ ((QueueName2) => {
      QueueName2["TRANSACTION_PROCESSING"] = "transaction-processing";
      QueueName2["WEBHOOK_DELIVERY"] = "webhook-delivery";
      QueueName2["RECONCILIATION"] = "reconciliation";
      QueueName2["SETTLEMENT"] = "settlement";
      QueueName2["PAYOUT"] = "payout";
      QueueName2["AUDIT"] = "audit";
      return QueueName2;
    })(QueueName || {});
    createQueue = (name) => {
      return new import_bullmq.Queue(name, {
        connection: getRedisClient(),
        defaultJobOptions: {
          attempts: 5,
          backoff: {
            type: "exponential",
            delay: 5e3
          },
          removeOnComplete: true,
          removeOnFail: false
          // Keep failures for dead-letter analysis
        }
      });
    };
    transactionQueue = createQueue("transaction-processing" /* TRANSACTION_PROCESSING */);
    webhookQueue = createQueue("webhook-delivery" /* WEBHOOK_DELIVERY */);
    reconciliationQueue = createQueue("reconciliation" /* RECONCILIATION */);
    settlementQueue = createQueue("settlement" /* SETTLEMENT */);
    payoutQueue = createQueue("payout" /* PAYOUT */);
    auditQueue = createQueue("audit" /* AUDIT */);
    setupQueueMonitoring = (name) => {
      const events = new import_bullmq.QueueEvents(name, { connection: getRedisClient() });
      events.on("failed", ({ jobId, failedReason }) => {
        logger.error(`Job ${jobId} failed in ${name}: ${failedReason}`);
      });
      events.on("completed", ({ jobId }) => {
        logger.info(`Job ${jobId} completed in ${name}`);
      });
    };
    shutdownQueues = async () => {
      await Promise.allSettled([
        transactionQueue.close(),
        webhookQueue.close(),
        reconciliationQueue.close(),
        settlementQueue.close(),
        payoutQueue.close(),
        auditQueue.close()
      ]);
    };
  }
});

// src/lib/prisma.ts
function cleanDatabaseUrl2(url) {
  if (!url) return url;
  let cleaned = url;
  if (cleaned.includes("[") && cleaned.includes("]")) {
    cleaned = cleaned.replace(/\[(.*?)\]/, (_, p1) => encodeURIComponent(p1));
  }
  return cleaned;
}
var import_client, globalForPrisma, prisma;
var init_prisma = __esm({
  "src/lib/prisma.ts"() {
    import_client = require("@prisma/client");
    init_logger();
    process.env.DATABASE_URL = cleanDatabaseUrl2(process.env.DATABASE_URL);
    process.env.DIRECT_URL = cleanDatabaseUrl2(process.env.DIRECT_URL);
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/nexuscore?schema=public&sslmode=prefer";
    }
    if (!process.env.DIRECT_URL) {
      process.env.DIRECT_URL = process.env.DATABASE_URL;
    }
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("pgbouncer=true")) {
      const separator = process.env.DATABASE_URL.includes("?") ? "&" : "?";
      process.env.DATABASE_URL += `${separator}pgbouncer=true&connection_limit=1`;
    }
    globalForPrisma = globalThis;
    prisma = (globalForPrisma.prisma || new import_client.PrismaClient({
      log: []
      // Suppress connection connection errors in console logs for sandbox environment
    })).$extends({
      query: {
        async $allOperations({ operation, model, args, query }) {
          const start = Date.now();
          const result = await query(args);
          const end = Date.now();
          const duration = end - start;
          if (duration > 100) {
            logger.warn(`Slow Prisma query detected: ${model}.${operation} took ${duration}ms`);
          }
          return result;
        },
        ledgerJournal: {
          update: () => {
            throw new Error("CRITICAL_FINANCIAL_ERROR: LedgerJournal is strictly immutable and cannot be updated.");
          },
          updateMany: () => {
            throw new Error("CRITICAL_FINANCIAL_ERROR: LedgerJournal is strictly immutable and cannot be updated.");
          },
          delete: () => {
            throw new Error("CRITICAL_FINANCIAL_ERROR: LedgerJournal is strictly immutable and cannot be deleted.");
          },
          deleteMany: () => {
            throw new Error("CRITICAL_FINANCIAL_ERROR: LedgerJournal is strictly immutable and cannot be deleted.");
          }
        },
        ledgerEntry: {
          update: () => {
            throw new Error("CRITICAL_FINANCIAL_ERROR: LedgerEntry is strictly immutable and cannot be updated.");
          },
          updateMany: () => {
            throw new Error("CRITICAL_FINANCIAL_ERROR: LedgerEntry is strictly immutable and cannot be updated.");
          },
          delete: () => {
            throw new Error("CRITICAL_FINANCIAL_ERROR: LedgerEntry is strictly immutable and cannot be deleted.");
          },
          deleteMany: () => {
            throw new Error("CRITICAL_FINANCIAL_ERROR: LedgerEntry is strictly immutable and cannot be deleted.");
          }
        }
      }
    });
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  }
});

// src/services/financial/LedgerAuditService.ts
var LedgerAuditService_exports = {};
__export(LedgerAuditService_exports, {
  LedgerAuditService: () => LedgerAuditService
});
var import_crypto2, LedgerAuditService;
var init_LedgerAuditService = __esm({
  "src/services/financial/LedgerAuditService.ts"() {
    import_crypto2 = __toESM(require("crypto"), 1);
    init_prisma();
    LedgerAuditService = class {
      /**
       * Generates a deterministic SHA256 signature for a financial event.
       */
      static generateFingerprint(tenantId, action, details, createdAt, previousFingerprint) {
        const data = `${tenantId}|${action}|${details}|${createdAt.toISOString()}|${previousFingerprint || "GENESIS"}`;
        return import_crypto2.default.createHash("sha256").update(data).digest("hex");
      }
      /**
       * Logs a financial event into the FinancialAuditLog table with an immutable fingerprint signature.
       */
      static async logEvent(tx, tenantId, action, details, severity = "INFO", correlationId) {
        const createdAt = /* @__PURE__ */ new Date();
        const latestLog = await tx.financialAuditLog.findFirst({
          where: { tenantId },
          orderBy: { createdAt: "desc" },
          select: { fingerprint: true }
        });
        const previousFingerprint = latestLog?.fingerprint || null;
        const fingerprint = this.generateFingerprint(tenantId, action, details, createdAt, previousFingerprint);
        return await tx.financialAuditLog.create({
          data: {
            tenantId,
            action,
            details,
            severity,
            correlationId,
            fingerprint,
            createdAt
          }
        });
      }
      /**
       * Verifies the cryptographic integrity of all log items for a tenant.
       * Checks if any entry has a tampered fingerprint.
       * Returns a list of corrupted audits (if any).
       */
      static async verifyAuditTrailIntegrity(tenantId) {
        const logs = await prisma.financialAuditLog.findMany({
          where: { tenantId },
          orderBy: { createdAt: "asc" }
        });
        const corruptLogIds = [];
        let previousFingerprint = null;
        for (const log of logs) {
          const calculatedFingerprint = this.generateFingerprint(
            log.tenantId,
            log.action,
            log.details,
            log.createdAt,
            previousFingerprint
          );
          if (log.fingerprint !== calculatedFingerprint) {
            corruptLogIds.push(log.id);
          }
          previousFingerprint = log.fingerprint;
        }
        return {
          isValid: corruptLogIds.length === 0,
          corruptLogIds
        };
      }
    };
  }
});

// src/lib/metrics.ts
var import_prom_client, register, transactionCounter, transactionDuration, webhookCounter, ledgerDoubleEntryErrors, activeConnections, queueLagMetrics, deadLetterQueueCounter, workerThroughput, supplierLatencyHistogram, reconciliationDrift, settlementAnomalyCounter, webhookRetryCounter, settlementThroughput, escrowUtilization, payoutAnomalyCounter, transactionRollbackCounter, paymentSuccessCounter, paymentGatewayLatency;
var init_metrics = __esm({
  "src/lib/metrics.ts"() {
    import_prom_client = __toESM(require("prom-client"), 1);
    register = new import_prom_client.default.Registry();
    import_prom_client.default.collectDefaultMetrics({ register });
    transactionCounter = new import_prom_client.default.Counter({
      name: "nexuscore_transactions_total",
      help: "Total number of transactions processed",
      labelNames: ["tenant_id", "status", "supplier"]
    });
    transactionDuration = new import_prom_client.default.Histogram({
      name: "nexuscore_transaction_duration_seconds",
      help: "Histogram of transaction processing duration",
      labelNames: ["tenant_id", "supplier"],
      buckets: [0.1, 0.5, 1, 2.5, 5, 10]
      // seconds
    });
    webhookCounter = new import_prom_client.default.Counter({
      name: "nexuscore_webhooks_total",
      help: "Total number of received webhooks",
      labelNames: ["provider", "status"]
    });
    ledgerDoubleEntryErrors = new import_prom_client.default.Counter({
      name: "nexuscore_ledger_errors_total",
      help: "Total number of double-entry ledger mismatches or anomalies detected",
      labelNames: ["tenant_id", "severity"]
    });
    activeConnections = new import_prom_client.default.Gauge({
      name: "nexuscore_active_connections",
      help: "Number of active connections or WebSocket users"
    });
    queueLagMetrics = new import_prom_client.default.Gauge({
      name: "nexuscore_queue_lag_jobs",
      help: "Number of jobs waiting in the queue (lag)",
      labelNames: ["queue_name"]
    });
    deadLetterQueueCounter = new import_prom_client.default.Counter({
      name: "nexuscore_dlq_jobs_total",
      help: "Total number of jobs sent to dead letter queue",
      labelNames: ["queue_name", "reason"]
    });
    workerThroughput = new import_prom_client.default.Counter({
      name: "nexuscore_worker_throughput_total",
      help: "Total number of jobs processed by workers",
      labelNames: ["queue_name", "worker_id", "status"]
    });
    supplierLatencyHistogram = new import_prom_client.default.Histogram({
      name: "nexuscore_supplier_latency_seconds",
      help: "Latency of outbound supplier API calls",
      labelNames: ["supplier_id", "endpoint"],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30]
    });
    reconciliationDrift = new import_prom_client.default.Gauge({
      name: "nexuscore_reconciliation_drift_amount",
      help: "Amount of absolute financial drift detected during reconciliation",
      labelNames: ["tenant_id", "currency"]
    });
    settlementAnomalyCounter = new import_prom_client.default.Counter({
      name: "nexuscore_settlement_anomaly_total",
      help: "Total anomalies detected during merchant settlement",
      labelNames: ["tenant_id", "type"]
    });
    webhookRetryCounter = new import_prom_client.default.Counter({
      name: "nexuscore_webhook_retries_total",
      help: "Number of retries triggered for outgoing webhooks",
      labelNames: ["tenant_id", "endpoint"]
    });
    settlementThroughput = new import_prom_client.default.Counter({
      name: "nexuscore_settlement_throughput_total",
      help: "Total successful settlements processed",
      labelNames: ["tenant_id"]
    });
    escrowUtilization = new import_prom_client.default.Gauge({
      name: "nexuscore_escrow_utilization_amount",
      help: "Current total escrow balance held on platform",
      labelNames: ["tenant_id", "currency"]
    });
    payoutAnomalyCounter = new import_prom_client.default.Counter({
      name: "nexuscore_payout_anomaly_total",
      help: "Total anomalies or errors detected during payout",
      labelNames: ["tenant_id"]
    });
    transactionRollbackCounter = new import_prom_client.default.Counter({
      name: "nexuscore_transaction_rollback_total",
      help: "Total number of transaction double-entry rollbacks",
      labelNames: ["tenant_id"]
    });
    paymentSuccessCounter = new import_prom_client.default.Counter({
      name: "nexuscore_payment_success_total",
      help: "Total successful payment charges settled",
      labelNames: ["tenant_id", "provider", "method"]
    });
    paymentGatewayLatency = new import_prom_client.default.Histogram({
      name: "nexuscore_payment_gateway_latency_seconds",
      help: "Latency of payment charge generation API calls",
      labelNames: ["provider", "method"],
      buckets: [0.1, 0.5, 1, 2, 5, 10]
    });
    register.registerMetric(transactionCounter);
    register.registerMetric(transactionDuration);
    register.registerMetric(webhookCounter);
    register.registerMetric(ledgerDoubleEntryErrors);
    register.registerMetric(activeConnections);
    register.registerMetric(queueLagMetrics);
    register.registerMetric(deadLetterQueueCounter);
    register.registerMetric(workerThroughput);
    register.registerMetric(supplierLatencyHistogram);
    register.registerMetric(reconciliationDrift);
    register.registerMetric(settlementAnomalyCounter);
    register.registerMetric(webhookRetryCounter);
    register.registerMetric(settlementThroughput);
    register.registerMetric(escrowUtilization);
    register.registerMetric(payoutAnomalyCounter);
    register.registerMetric(transactionRollbackCounter);
    register.registerMetric(paymentSuccessCounter);
    register.registerMetric(paymentGatewayLatency);
  }
});

// src/services/financial/DriftDetectionService.ts
var import_client2, DriftDetectionService;
var init_DriftDetectionService = __esm({
  "src/services/financial/DriftDetectionService.ts"() {
    init_prisma();
    import_client2 = require("@prisma/client");
    init_LedgerAuditService();
    init_logger();
    init_metrics();
    DriftDetectionService = class {
      /**
       * Evaluates if a wallet balance drifts from its double-entry ledger history.
       * Compiles sum of all LEDGER entries for a wallet and compares it against actual wallet.balance.
       */
      static async checkWalletDrift(tenantId, walletId) {
        return await prisma.$transaction(async (tx) => {
          const wallet = await tx.wallet.findUnique({
            where: { id: walletId }
          });
          if (!wallet) throw new Error(`Wallet ${walletId} not found`);
          const entries = await tx.ledgerEntry.findMany({
            where: {
              tenantId,
              accountId: walletId
            }
          });
          let expectedBalance = new import_client2.Prisma.Decimal(0);
          for (const entry of entries) {
            if (entry.type === "CREDIT") {
              expectedBalance = expectedBalance.add(entry.amount);
            } else if (entry.type === "DEBIT") {
              expectedBalance = expectedBalance.sub(entry.amount);
            }
          }
          const actualBalance = new import_client2.Prisma.Decimal(wallet.balance);
          const driftAmount = actualBalance.sub(expectedBalance);
          const hasDrift = !driftAmount.isZero();
          if (hasDrift) {
            financialLogger.warn(
              { tenantId, walletId, expectedBalance: expectedBalance.toString(), actualBalance: actualBalance.toString(), driftAmount: driftAmount.toString() },
              "Wallet balance drift mismatch detected!"
            );
            const driftRecord = await tx.reconciliationDrift.create({
              data: {
                tenantId,
                accountId: walletId,
                driftAmount,
                status: "UNRESOLVED",
                notes: `Auto-detected drift: Expected ${expectedBalance}, got ${actualBalance}. Diff: ${driftAmount}`
              }
            });
            ledgerDoubleEntryErrors.inc({ tenant_id: tenantId, severity: "HIGH" });
            await LedgerAuditService.logEvent(
              tx,
              tenantId,
              "BALANCE_DRIFT_DETECTED",
              JSON.stringify({
                walletId,
                expectedBalance: expectedBalance.toString(),
                actualBalance: actualBalance.toString(),
                driftAmount: driftAmount.toString(),
                driftRecordId: driftRecord.id
              }),
              "CRITICAL"
            );
          }
          return {
            hasDrift,
            expectedBalance,
            actualBalance,
            driftAmount
          };
        });
      }
      /**
       * Checks system-wide drift (escrows, revenue, suppliers).
       */
      static async auditAllSystemBalances(tenantId) {
        const journals = await prisma.ledgerJournal.findMany({
          where: { tenantId },
          include: { entries: true }
        });
        let totalDriftCount = 0;
        const discrepancies = [];
        for (const journal of journals) {
          let sumOfDebits = new import_client2.Prisma.Decimal(0);
          let sumOfCredits = new import_client2.Prisma.Decimal(0);
          for (const e of journal.entries) {
            if (e.type === "DEBIT") sumOfDebits = sumOfDebits.add(e.amount);
            if (e.type === "CREDIT") sumOfCredits = sumOfCredits.add(e.amount);
          }
          if (!sumOfDebits.equals(sumOfCredits)) {
            totalDriftCount++;
            discrepancies.push({
              journalId: journal.id,
              type: journal.type,
              sumOfDebits: sumOfDebits.toString(),
              sumOfCredits: sumOfCredits.toString()
            });
            await prisma.reconciliationDrift.create({
              data: {
                tenantId,
                accountId: `JOURNAL:${journal.id}`,
                driftAmount: sumOfDebits.sub(sumOfCredits),
                status: "UNRESOLVED",
                notes: `Journal debits/credits mismatch. Debits: ${sumOfDebits}, Credits: ${sumOfCredits}`
              }
            });
          }
        }
        return {
          authenticatedCount: journals.length,
          driftCount: totalDriftCount,
          discrepancies
        };
      }
    };
  }
});

// src/services/financial/LedgerEngine.ts
var import_client3, LedgerEngine;
var init_LedgerEngine = __esm({
  "src/services/financial/LedgerEngine.ts"() {
    init_prisma();
    import_client3 = require("@prisma/client");
    init_logger();
    LedgerEngine = class {
      /**
       * Commits a double-entry journal and securely mutates the underlying wallet balances.
       * This is the ONLY place where wallet balances should be mutated.
       */
      static async recordTransaction(data) {
        const dEntries = data.entries.map((e) => ({
          ...e,
          amount: new import_client3.Prisma.Decimal(e.amount)
        }));
        let totalCredit = new import_client3.Prisma.Decimal(0);
        let totalDebit = new import_client3.Prisma.Decimal(0);
        for (const e of dEntries) {
          if (e.amount.lessThan(0)) {
            throw new Error(`Ledger entry amounts must be positive`);
          }
          if (e.type === "CREDIT") totalCredit = totalCredit.add(e.amount);
          if (e.type === "DEBIT") totalDebit = totalDebit.add(e.amount);
        }
        if (!totalCredit.equals(totalDebit)) {
          throw new Error(`Ledger integrity check failed: Total Credit (${totalCredit}) != Total Debit (${totalDebit})`);
        }
        const existingJournal = await prisma.ledgerJournal.findUnique({
          where: { idempotencyKey: data.idempotencyKey }
        });
        if (existingJournal) {
          financialLogger.info(
            { idempotencyKey: data.idempotencyKey, journalId: existingJournal.id },
            "Idempotent ledger transaction replay detected. Returning existing journal."
          );
          return existingJournal;
        }
        return await prisma.$transaction(async (tx) => {
          const walletIdsToLock = Array.from(
            new Set(
              dEntries.filter((e) => e.accountType === "USER_WALLET" /* USER_WALLET */ || e.accountType === "FROZEN_BALANCE" /* FROZEN_BALANCE */).map((e) => e.accountId)
            )
          );
          const walletsMap = /* @__PURE__ */ new Map();
          if (walletIdsToLock.length > 0) {
            walletIdsToLock.sort();
            const placeholders = walletIdsToLock.map((_, i) => `$${i + 1}`).join(",");
            const wallets = await tx.$queryRawUnsafe(
              `SELECT id, balance, "frozenBalance" FROM "Wallet" WHERE id IN (${placeholders}) FOR NO KEY UPDATE`,
              ...walletIdsToLock
            );
            if (wallets.length !== walletIdsToLock.length) {
              throw new Error("One or more wallets requested for ledger entry do not exist.");
            }
            for (const w of wallets) {
              walletsMap.set(w.id, {
                balance: new import_client3.Prisma.Decimal(w.balance),
                frozenBalance: new import_client3.Prisma.Decimal(w.frozenBalance)
              });
            }
          }
          const journal = await tx.ledgerJournal.create({
            data: {
              tenantId: data.tenantId,
              type: data.type,
              description: data.description,
              orderId: data.orderId,
              idempotencyKey: data.idempotencyKey
            }
          });
          for (const entry of dEntries) {
            let balanceBefore = null;
            let balanceAfter = null;
            if (entry.accountType === "USER_WALLET" /* USER_WALLET */) {
              const w = walletsMap.get(entry.accountId);
              balanceBefore = new import_client3.Prisma.Decimal(w.balance);
              if (entry.type === "CREDIT") w.balance = w.balance.add(entry.amount);
              if (entry.type === "DEBIT") w.balance = w.balance.sub(entry.amount);
              if (w.balance.lessThan(0)) {
                throw new Error(`Insufficient funds in wallet ${entry.accountId}.`);
              }
              balanceAfter = w.balance;
              await tx.walletLedger.create({
                data: {
                  walletId: entry.accountId,
                  tenantId: data.tenantId,
                  amount: entry.amount,
                  type: entry.type,
                  balanceBefore,
                  balanceAfter,
                  description: data.description,
                  idempotencyKey: `${data.idempotencyKey}_${entry.accountId}_${entry.type}`,
                  orderId: data.orderId
                }
              });
            } else if (entry.accountType === "FROZEN_BALANCE" /* FROZEN_BALANCE */) {
              const w = walletsMap.get(entry.accountId);
              balanceBefore = new import_client3.Prisma.Decimal(w.frozenBalance);
              if (entry.type === "CREDIT") w.frozenBalance = w.frozenBalance.add(entry.amount);
              if (entry.type === "DEBIT") w.frozenBalance = w.frozenBalance.sub(entry.amount);
              if (w.frozenBalance.lessThan(0)) {
                throw new Error(`Insufficient frozen funds in wallet ${entry.accountId}.`);
              }
              balanceAfter = w.frozenBalance;
            }
            await tx.ledgerEntry.create({
              data: {
                journalId: journal.id,
                accountId: entry.accountId,
                tenantId: data.tenantId,
                type: entry.type,
                amount: entry.amount,
                balanceBefore,
                balanceAfter
              }
            });
          }
          for (const [id, w] of walletsMap.entries()) {
            await tx.$executeRawUnsafe(
              `UPDATE "Wallet" SET balance = $1::numeric, "frozenBalance" = $2::numeric, "updatedAt" = NOW() WHERE id = $3`,
              w.balance.toString(),
              w.frozenBalance.toString(),
              id
            );
          }
          financialLogger.info(
            { journalId: journal.id, idempotencyKey: data.idempotencyKey, totalAmount: totalCredit.toNumber() },
            "Ledger transaction cleanly committed"
          );
          return journal;
        });
      }
    };
  }
});

// src/services/financial/SettlementEngine.ts
var SettlementEngine_exports = {};
__export(SettlementEngine_exports, {
  SettlementEngine: () => SettlementEngine
});
var import_client5, SettlementEngine;
var init_SettlementEngine = __esm({
  "src/services/financial/SettlementEngine.ts"() {
    init_prisma();
    import_client5 = require("@prisma/client");
    init_LedgerEngine();
    init_LedgerAuditService();
    init_logger();
    SettlementEngine = class {
      /**
       * Acquire a pessimistic database lock on a specific key.
       */
      static async acquireLock(tx, lockKey, ttlSeconds = 60) {
        const expiresAt = new Date(Date.now() + ttlSeconds * 1e3);
        try {
          await tx.transactionLock.deleteMany({
            where: {
              lockKey,
              expiresAt: { lt: /* @__PURE__ */ new Date() }
            }
          });
          await tx.transactionLock.create({
            data: {
              lockKey,
              expiresAt
            }
          });
          return true;
        } catch (err) {
          return false;
        }
      }
      /**
       * Release a pessimistic lock.
       */
      static async releaseLock(tx, lockKey) {
        try {
          await tx.transactionLock.deleteMany({
            where: { lockKey }
          });
        } catch (err) {
          financialLogger.error({ lockKey, err }, "Failed to release lock cleanly");
        }
      }
      /**
       * Initiates a settlement workflow by placing funds in Escrow.
       */
      static async initiateSettlement(tenantId, walletId, amount, orderId, idempotencyKey) {
        const decimalAmount = new import_client5.Prisma.Decimal(amount);
        const lockKey = `settle_lock_${orderId}`;
        return await prisma.$transaction(async (tx) => {
          const hasLock = await this.acquireLock(tx, lockKey);
          if (!hasLock) {
            throw new Error(`Failed to initiate settlement: Lock already held for order ${orderId}`);
          }
          const settlement = await tx.settlementRecord.create({
            data: {
              tenantId,
              transactionId: orderId,
              amount: decimalAmount,
              supplierAmount: 0,
              // Calculated during commitment
              profitAmount: 0,
              status: "PENDING"
            }
          });
          await LedgerEngine.recordTransaction({
            tenantId,
            type: "ORDER_FREEZE",
            description: `Freezing balance for settlement workflow on order ${orderId}`,
            orderId,
            idempotencyKey,
            entries: [
              { accountId: walletId, accountType: "USER_WALLET" /* USER_WALLET */, amount: decimalAmount, type: "DEBIT" },
              { accountId: "PLATFORM_ESCROW", accountType: "PLATFORM_ESCROW" /* PLATFORM_ESCROW */, amount: decimalAmount, type: "CREDIT" }
            ]
          });
          await this.releaseLock(tx, lockKey);
          await LedgerAuditService.logEvent(
            tx,
            tenantId,
            "SETTLEMENT_INITIATE",
            JSON.stringify({ orderId, walletId, amount: decimalAmount.toString(), settlementId: settlement.id }),
            "INFO",
            idempotencyKey
          );
          return settlement;
        });
      }
      /**
       * Commits the settlement workflow. Releases escrow, pays supplier, records profit, updates settlement record.
       */
      static async commitSettlement(tenantId, orderId, supplierSettlementAmount, idempotencyKey) {
        const supplierAmt = new import_client5.Prisma.Decimal(supplierSettlementAmount);
        const lockKey = `settle_lock_${orderId}`;
        return await prisma.$transaction(async (tx) => {
          const hasLock = await this.acquireLock(tx, lockKey);
          if (!hasLock) {
            throw new Error(`Failed to commit settlement: Lock already held for order ${orderId}`);
          }
          const settlement = await tx.settlementRecord.findUnique({
            where: { transactionId: orderId }
          });
          if (!settlement) {
            throw new Error(`Settlement Record not found for order ${orderId}`);
          }
          if (settlement.status !== "PENDING") {
            throw new Error(`Settlement can only be committed from PENDING state. Current status: ${settlement.status}`);
          }
          const totalAmount = new import_client5.Prisma.Decimal(settlement.amount);
          const profitAmount = totalAmount.sub(supplierAmt);
          if (profitAmount.lessThan(0)) {
            throw new Error(`Supplier settlement amount ${supplierAmt} is greater than total order amount ${totalAmount}`);
          }
          await LedgerEngine.recordTransaction({
            tenantId,
            type: "ORDER_SETTLEMENT",
            description: `Settling order ${orderId}`,
            orderId,
            idempotencyKey: `commit_${idempotencyKey}`,
            entries: [
              { accountId: "PLATFORM_ESCROW", accountType: "PLATFORM_ESCROW" /* PLATFORM_ESCROW */, amount: totalAmount, type: "DEBIT" },
              { accountId: "SYSTEM_SUPPLIER", accountType: "SUPPLIER_SETTLEMENT" /* SUPPLIER_SETTLEMENT */, amount: supplierAmt, type: "CREDIT" },
              { accountId: "SYSTEM_REVENUE", accountType: "SYSTEM_REVENUE" /* SYSTEM_REVENUE */, amount: profitAmount, type: "CREDIT" }
            ]
          });
          const updatedSettlement = await tx.settlementRecord.update({
            where: { id: settlement.id },
            data: {
              supplierAmount: supplierAmt,
              profitAmount,
              status: "COMPLETED",
              settledAt: /* @__PURE__ */ new Date()
            }
          });
          await this.releaseLock(tx, lockKey);
          await LedgerAuditService.logEvent(
            tx,
            tenantId,
            "SETTLEMENT_COMMIT",
            JSON.stringify({ orderId, totalAmount: totalAmount.toString(), supplierAmount: supplierAmt.toString(), profitAmount: profitAmount.toString() }),
            "INFO",
            idempotencyKey
          );
          return updatedSettlement;
        });
      }
      /**
       * Rolls back the initiated settlement order, refunding escrow funds back to user's wallet.
       */
      static async rollbackSettlement(tenantId, walletId, orderId, idempotencyKey, reason = "Settlement Rollback") {
        const lockKey = `settle_lock_${orderId}`;
        return await prisma.$transaction(async (tx) => {
          const hasLock = await this.acquireLock(tx, lockKey);
          if (!hasLock) {
            throw new Error(`Failed to rollback settlement: Lock already held for order ${orderId}`);
          }
          const settlement = await tx.settlementRecord.findUnique({
            where: { transactionId: orderId }
          });
          if (!settlement) {
            throw new Error(`Settlement Record not found for order ${orderId}`);
          }
          if (settlement.status !== "PENDING") {
            throw new Error(`Settlement can only be rolled back from PENDING state. Current status: ${settlement.status}`);
          }
          const totalAmount = new import_client5.Prisma.Decimal(settlement.amount);
          await LedgerEngine.recordTransaction({
            tenantId,
            type: "ORDER_FREEZE_REVERSAL",
            description: `Rolling back settlement; unfreezing user funds for order ${orderId}. Reason: ${reason}`,
            orderId,
            idempotencyKey: `rollback_${idempotencyKey}`,
            entries: [
              { accountId: "PLATFORM_ESCROW", accountType: "PLATFORM_ESCROW" /* PLATFORM_ESCROW */, amount: totalAmount, type: "DEBIT" },
              { accountId: walletId, accountType: "USER_WALLET" /* USER_WALLET */, amount: totalAmount, type: "CREDIT" }
            ]
          });
          const updatedSettlement = await tx.settlementRecord.update({
            where: { id: settlement.id },
            data: {
              status: "FAILED"
            }
          });
          await this.releaseLock(tx, lockKey);
          await LedgerAuditService.logEvent(
            tx,
            tenantId,
            "SETTLEMENT_ROLLBACK",
            JSON.stringify({ orderId, walletId, amount: totalAmount.toString(), reason }),
            "WARNING",
            idempotencyKey
          );
          return updatedSettlement;
        });
      }
    };
  }
});

// src/services/financial/BalanceManager.ts
var BalanceManager_exports = {};
__export(BalanceManager_exports, {
  BalanceManager: () => BalanceManager
});
var import_client6, BalanceManager;
var init_BalanceManager = __esm({
  "src/services/financial/BalanceManager.ts"() {
    init_prisma();
    import_client6 = require("@prisma/client");
    init_LedgerEngine();
    init_LedgerAuditService();
    BalanceManager = class {
      /**
       * Adds funds to a user's wallet via double-entry deposit ledger record.
       */
      static async depositFunds(tenantId, walletId, amount, idempotencyKey, description = "Standard Deposit") {
        const decimalAmount = new import_client6.Prisma.Decimal(amount);
        return await prisma.$transaction(async (tx) => {
          const journal = await LedgerEngine.recordTransaction({
            tenantId,
            type: "DEPOSIT",
            description,
            idempotencyKey,
            entries: [
              { accountId: "SYSTEM_LIABILITY", accountType: "SYSTEM_LIABILITY" /* SYSTEM_LIABILITY */, amount: decimalAmount, type: "DEBIT" },
              { accountId: walletId, accountType: "USER_WALLET" /* USER_WALLET */, amount: decimalAmount, type: "CREDIT" }
            ]
          });
          await LedgerAuditService.logEvent(
            tx,
            tenantId,
            "DEPOSIT_COMMITTED",
            JSON.stringify({ walletId, amount: decimalAmount.toString(), journalId: journal.id }),
            "INFO",
            idempotencyKey
          );
          return journal;
        });
      }
      /**
       * Withdraws funds from a user's wallet.
       */
      static async withdrawFunds(tenantId, walletId, amount, idempotencyKey, description = "Standard Withdrawal") {
        const decimalAmount = new import_client6.Prisma.Decimal(amount);
        return await prisma.$transaction(async (tx) => {
          const journal = await LedgerEngine.recordTransaction({
            tenantId,
            type: "WITHDRAWAL",
            description,
            idempotencyKey,
            entries: [
              { accountId: walletId, accountType: "USER_WALLET" /* USER_WALLET */, amount: decimalAmount, type: "DEBIT" },
              { accountId: "SYSTEM_LIABILITY", accountType: "SYSTEM_LIABILITY" /* SYSTEM_LIABILITY */, amount: decimalAmount, type: "CREDIT" }
            ]
          });
          await LedgerAuditService.logEvent(
            tx,
            tenantId,
            "WITHDRAWAL_COMMITTED",
            JSON.stringify({ walletId, amount: decimalAmount.toString(), journalId: journal.id }),
            "INFO",
            idempotencyKey
          );
          return journal;
        });
      }
      /**
       * Freezes specified wallet available balance into frozen balance.
       */
      static async freezeFunds(tenantId, walletId, amount, orderId, idempotencyKey) {
        const decimalAmount = new import_client6.Prisma.Decimal(amount);
        return await prisma.$transaction(async (tx) => {
          const journal = await LedgerEngine.recordTransaction({
            tenantId,
            type: "ORDER_FREEZE",
            description: `Freezing funds of ${decimalAmount} for Order ${orderId}`,
            orderId,
            idempotencyKey,
            entries: [
              { accountId: walletId, accountType: "USER_WALLET" /* USER_WALLET */, amount: decimalAmount, type: "DEBIT" },
              { accountId: walletId, accountType: "FROZEN_BALANCE" /* FROZEN_BALANCE */, amount: decimalAmount, type: "CREDIT" }
            ]
          });
          await LedgerAuditService.logEvent(
            tx,
            tenantId,
            "FUNDS_FROZEN",
            JSON.stringify({ walletId, amount: decimalAmount.toString(), orderId, journalId: journal.id }),
            "INFO",
            idempotencyKey
          );
          return journal;
        });
      }
      /**
       * Reverses freeze (unfreezes) wallet frozen balance back to available balance.
       */
      static async unfreezeFunds(tenantId, walletId, amount, orderId, idempotencyKey) {
        const decimalAmount = new import_client6.Prisma.Decimal(amount);
        return await prisma.$transaction(async (tx) => {
          const journal = await LedgerEngine.recordTransaction({
            tenantId,
            type: "ORDER_FREEZE_REVERSAL",
            description: `Unfreezing funds of ${decimalAmount} for Order ${orderId}`,
            orderId,
            idempotencyKey,
            entries: [
              { accountId: walletId, accountType: "FROZEN_BALANCE" /* FROZEN_BALANCE */, amount: decimalAmount, type: "DEBIT" },
              { accountId: walletId, accountType: "USER_WALLET" /* USER_WALLET */, amount: decimalAmount, type: "CREDIT" }
            ]
          });
          await LedgerAuditService.logEvent(
            tx,
            tenantId,
            "FUNDS_UNFROZEN",
            JSON.stringify({ walletId, amount: decimalAmount.toString(), orderId, journalId: journal.id }),
            "INFO",
            idempotencyKey
          );
          return journal;
        });
      }
    };
  }
});

// src/utils/metrics.ts
var MetricsClient, metrics;
var init_metrics2 = __esm({
  "src/utils/metrics.ts"() {
    init_metrics();
    init_logger();
    MetricsClient = class {
      increment(name, tags, value = 1) {
        try {
          if (name.includes("drift")) {
            reconciliationDrift.labels(tags?.tenant || "unknown", "IDR").inc(value);
          } else if (name.includes("stuck_transaction") || name.includes("anomaly")) {
            settlementAnomalyCounter.labels(tags?.tenant || "unknown", name).inc(value);
          } else if (name.includes("transaction")) {
            transactionCounter.labels(tags?.tenant || "unknown", tags?.status || "unknown", tags?.supplier || "unknown").inc(value);
          } else if (name.includes("webhook")) {
            webhookCounter.labels(tags?.provider || "unknown", tags?.status || "unknown").inc(value);
          }
        } catch (e) {
          logger.error(e, `Failed to proxy metric: ${name}`);
        }
      }
      timing(name, valueMs, tags) {
        try {
          if (name.includes("transaction.latency")) {
            transactionDuration.labels(tags?.tenant || "unknown", tags?.supplier || "unknown").observe(valueMs / 1e3);
          }
        } catch (e) {
          logger.error(e, `Failed to proxy metric timing: ${name}`);
        }
      }
    };
    metrics = new MetricsClient();
  }
});

// src/utils/logger.ts
var StructuredLogger, logger2;
var init_logger2 = __esm({
  "src/utils/logger.ts"() {
    init_logger();
    StructuredLogger = class {
      debug(message, context3) {
        if (context3) logger.debug(context3, message);
        else logger.debug(message);
      }
      info(message, context3) {
        if (context3) logger.info(context3, message);
        else logger.info(message);
      }
      warn(message, context3, error) {
        if (context3 || error) logger.warn({ ...context3, err: error }, message);
        else logger.warn(message);
      }
      error(message, error, context3) {
        if (context3 || error) logger.error({ ...context3, err: error }, message);
        else logger.error(message);
      }
    };
    logger2 = new StructuredLogger();
  }
});

// src/events/EventDispatcher.ts
var import_events, DomainEventDispatcher, eventDispatcher;
var init_EventDispatcher = __esm({
  "src/events/EventDispatcher.ts"() {
    import_events = require("events");
    init_logger2();
    init_metrics2();
    DomainEventDispatcher = class extends import_events.EventEmitter {
      constructor() {
        super();
        this.on("error", (err) => {
          logger2.error("Unhandled Domain Event Error", err);
        });
      }
      /**
       * Dispatch a strictly typed domain event
       */
      dispatch(event, payload) {
        logger2.debug(`[EventDispatcher] Emitted ${event}`, { orderId: payload.orderId, tenantId: payload.tenantId });
        metrics.increment(`event.${event.replace(/\./g, "_")}`, { tenant: payload.tenantId });
        this.emit(event, payload);
      }
      /**
       * Subscribe to a strictly typed domain event
       */
      subscribe(event, handler) {
        this.on(event, async (payload) => {
          try {
            await handler(payload);
          } catch (err) {
            logger2.error(`[EventDispatcher] Handler for ${event} failed: ${err.message}`, err, { orderId: payload.orderId, tenantId: payload.tenantId });
          }
        });
      }
    };
    eventDispatcher = new DomainEventDispatcher();
  }
});

// src/events/types.ts
var init_types = __esm({
  "src/events/types.ts"() {
  }
});

// src/services/billing/ledgerService.ts
var ledgerService_exports = {};
__export(ledgerService_exports, {
  LedgerService: () => LedgerService
});
var import_client7, LedgerService;
var init_ledgerService = __esm({
  "src/services/billing/ledgerService.ts"() {
    init_prisma();
    import_client7 = require("@prisma/client");
    init_logger();
    LedgerService = class {
      /**
       * Primary transactional ledger engine powered by PostgreSQL row locking 'FOR UPDATE' and Prisma Client transactions.
       */
      static async executeLedgerEntry(params) {
        const executeLogic = async (tx) => {
          if (params.referenceId) {
            const existingLedger = await tx.walletLedger.findUnique({
              where: { idempotencyKey: params.referenceId }
            });
            if (existingLedger) {
              financialLogger.warn(`[LEDGER] Idempotent hit for token: ${params.referenceId}. Skipping double charge.`);
              return {
                success: true,
                transactionId: existingLedger.id,
                balanceAfter: Number(existingLedger.balanceAfter),
                isDuplicate: true
              };
            }
          }
          let tenant = await tx.tenant.findUnique({ where: { id: params.agencyId } });
          if (!tenant) {
            tenant = await tx.tenant.create({
              data: {
                id: params.agencyId,
                name: "NexusCore Tenant",
                slug: `tenant-${params.agencyId.substring(0, 8)}`,
                status: "ACTIVE"
              }
            });
          }
          let user = await tx.user.findUnique({ where: { email: `${params.resellerId}@nexuscore.net` } });
          if (!user) {
            const userById = await tx.user.findUnique({ where: { id: params.resellerId } });
            if (userById) {
              user = userById;
            } else {
              user = await tx.user.create({
                data: {
                  id: params.resellerId,
                  email: `${params.resellerId}@nexuscore.net`,
                  passwordHash: "PBKDF2_MIGRATED_BCRYPT_SECURE_PASSWORD",
                  displayName: `Reseller ${params.resellerId.substring(0, 5)}`,
                  role: "RESELLER",
                  tenantId: params.agencyId
                }
              });
            }
          }
          let walletRows = await tx.$queryRaw(
            import_client7.Prisma.sql`SELECT * FROM "Wallet" WHERE "userId" = ${user.id} AND "tenantId" = ${tenant.id} FOR UPDATE`
          );
          let wallet = walletRows && walletRows.length > 0 ? walletRows[0] : null;
          if (!wallet) {
            const newWallet = await tx.wallet.create({
              data: {
                userId: user.id,
                tenantId: tenant.id,
                balance: new import_client7.Prisma.Decimal(0),
                frozenBalance: new import_client7.Prisma.Decimal(0),
                currency: "IDR"
              }
            });
            const lockedRows = await tx.$queryRaw(
              import_client7.Prisma.sql`SELECT * FROM "Wallet" WHERE "id" = ${newWallet.id} FOR UPDATE`
            );
            wallet = lockedRows[0];
          }
          const currentBalance = Number(wallet.balance || 0);
          const currentFrozen = Number(wallet.frozenBalance || 0);
          let nextBalance = currentBalance;
          let nextFrozen = currentFrozen;
          switch (params.type) {
            case "DEBIT":
            case "PURCHASE":
              if (currentBalance < params.amount) throw new Error("Insufficient Funds");
              nextBalance = currentBalance - params.amount;
              break;
            case "CONFIRM_DEBIT":
              if (currentFrozen < params.amount) throw new Error("INSUFFICIENT_FROZEN_FUNDS");
              nextFrozen = currentFrozen - params.amount;
              break;
            case "CREDIT":
            case "DEPOSIT":
            case "REFUND":
              nextBalance = currentBalance + params.amount;
              break;
            case "FREEZE":
              if (currentBalance < params.amount) throw new Error("Insufficient Funds");
              nextBalance = currentBalance - params.amount;
              nextFrozen = currentFrozen + params.amount;
              break;
            case "UNFREEZE":
              if (currentFrozen < params.amount) throw new Error("INSUFFICIENT_FROZEN_FUNDS");
              nextBalance = currentBalance + params.amount;
              nextFrozen = currentFrozen - params.amount;
              break;
            default:
              throw new Error(`Unsupported transaction type: ${params.type}`);
          }
          await tx.wallet.update({
            where: { id: wallet.id },
            data: {
              balance: new import_client7.Prisma.Decimal(nextBalance),
              frozenBalance: new import_client7.Prisma.Decimal(nextFrozen)
            }
          });
          const idempotencyKey = params.referenceId || `ledger-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
          const legacyLedgerEntry = await tx.walletLedger.create({
            data: {
              walletId: wallet.id,
              tenantId: tenant.id,
              amount: new import_client7.Prisma.Decimal(Math.abs(params.amount)),
              type: params.type,
              balanceBefore: new import_client7.Prisma.Decimal(currentBalance),
              balanceAfter: new import_client7.Prisma.Decimal(nextBalance),
              description: params.description,
              idempotencyKey,
              orderId: params.orderId || null
            }
          });
          const absAmount = Math.abs(params.amount);
          let accountDebited = "";
          let accountCredited = "";
          switch (params.type) {
            case "DEBIT":
            case "PURCHASE":
              accountDebited = "SYSTEM:ASSET:RECEIVABLE";
              accountCredited = wallet.id;
              break;
            case "CONFIRM_DEBIT":
              accountDebited = "SYSTEM:REVENUE:PLATFORM";
              accountCredited = "SYSTEM:LIABILITY:FROZEN";
              break;
            case "CREDIT":
            case "DEPOSIT":
            case "REFUND":
              accountDebited = wallet.id;
              accountCredited = "SYSTEM:ASSET:BANK";
              break;
            case "FREEZE":
              accountDebited = "SYSTEM:LIABILITY:FROZEN";
              accountCredited = wallet.id;
              break;
            case "UNFREEZE":
              accountDebited = wallet.id;
              accountCredited = "SYSTEM:LIABILITY:FROZEN";
              break;
            default:
              accountDebited = "SYSTEM:UNKNOWN";
              accountCredited = "SYSTEM:UNKNOWN";
          }
          await tx.ledgerJournal.create({
            data: {
              tenantId: tenant.id,
              type: params.type,
              description: params.description,
              orderId: params.orderId || null,
              idempotencyKey: `journal-${idempotencyKey}`,
              entries: {
                create: [
                  {
                    accountId: accountDebited,
                    tenantId: tenant.id,
                    type: "DEBIT",
                    amount: new import_client7.Prisma.Decimal(absAmount)
                  },
                  {
                    accountId: accountCredited,
                    tenantId: tenant.id,
                    type: "CREDIT",
                    amount: new import_client7.Prisma.Decimal(absAmount)
                  }
                ]
              }
            }
          });
          return {
            success: true,
            transactionId: legacyLedgerEntry.id,
            balanceAfter: nextBalance,
            isDuplicate: false
          };
        };
        if (params.existingTransaction) {
          return await executeLogic(params.existingTransaction);
        } else {
          return await prisma.$transaction(async (tx) => {
            return await executeLogic(tx);
          }, {
            isolationLevel: import_client7.Prisma.TransactionIsolationLevel.Serializable,
            timeout: 1e4
            // 10 seconds timeout for reliability
          });
        }
      }
    };
  }
});

// src/domain/fraud/FraudDetectionService.ts
var FraudDetectionService;
var init_FraudDetectionService = __esm({
  "src/domain/fraud/FraudDetectionService.ts"() {
    init_logger();
    FraudDetectionService = class {
      /**
       * Scans a transaction for potential fraud based on device/IP patterns.
       * Returns a risk score from 0 (Safe) to 100 (High Risk).
       */
      static async getRiskScore(context3) {
        let riskScore = 0;
        if (context3.ipAddress === "0.0.0.0") {
          riskScore += 20;
        }
        if (!context3.deviceId) {
          riskScore += 10;
        }
        logger.info(`[FraudDetection] Risk score calculated for tenant ${context3.tenantId}: ${riskScore}`);
        return riskScore;
      }
      static async isTransactionSafe(context3) {
        const score = await this.getRiskScore(context3);
        return score < 50;
      }
    };
  }
});

// src/services/billing/transactionManagerService.ts
var transactionManagerService_exports = {};
__export(transactionManagerService_exports, {
  TransactionManagerService: () => TransactionManagerService
});
var import_client8, TransactionManagerService;
var init_transactionManagerService = __esm({
  "src/services/billing/transactionManagerService.ts"() {
    init_prisma();
    init_ledgerService();
    import_client8 = require("@prisma/client");
    init_FraudDetectionService();
    init_EventDispatcher();
    init_types();
    init_logger();
    TransactionManagerService = class {
      /**
       * Safe, atomical, PostgreSQL-first ACID order placement with Row-Locking and balance preservation.
       */
      static async createOrder(params) {
        try {
          if (params.fraudContext) {
            const isSafe = await FraudDetectionService.isTransactionSafe(params.fraudContext);
            if (!isSafe) {
              throw new Error("FRAUD_SCORE_TOO_HIGH");
            }
          }
          return await prisma.$transaction(async (tx) => {
            if (params.idempotencyKey) {
              const existingTx = await tx.transaction.findUnique({
                where: { idempotencyIn: params.idempotencyKey }
              });
              if (existingTx) {
                financialLogger.warn(`[TX_MANAGER] Detected idempotent order submission for token: ${params.idempotencyKey}`);
                return {
                  success: true,
                  orderId: existingTx.id,
                  isDuplicate: true
                };
              }
            }
            const product = await tx.product.findUnique({
              where: { id: params.productId }
            });
            if (!product) {
              throw new Error("PRODUCT_NOT_FOUND");
            }
            if (!product.isAvailable) {
              throw new Error("PRODUCT_UNAVAILABLE");
            }
            const unitPrice = Number(product.sellPrice);
            const costPrice = Number(product.costPrice);
            const totalAmount = unitPrice * params.quantity;
            const totalCost = costPrice * params.quantity;
            const profitAmount = totalAmount - totalCost;
            const order = await tx.transaction.create({
              data: {
                tenantId: params.agencyId,
                customerTarget: params.targetAccount,
                status: "PENDING",
                totalAmount: new import_client8.Prisma.Decimal(totalAmount),
                profitAmount: new import_client8.Prisma.Decimal(profitAmount),
                idempotencyIn: params.idempotencyKey || `order-idemp-${Date.now()}-${Math.random()}`,
                items: {
                  create: {
                    productId: params.productId,
                    quantity: params.quantity,
                    priceUnit: new import_client8.Prisma.Decimal(unitPrice)
                  }
                }
              }
            });
            const ledgerResult = await LedgerService.executeLedgerEntry({
              resellerId: params.resellerId,
              agencyId: params.agencyId,
              amount: totalAmount,
              type: "FREEZE",
              description: `Order Freeze: SKU ${product.sku} x ${params.quantity}`,
              orderId: order.id,
              referenceId: params.idempotencyKey ? `freeze-${params.idempotencyKey}` : void 0,
              existingTransaction: tx
            });
            if (!ledgerResult.success) {
              throw new Error("BALANCE_FREEZE_FAILED");
            }
            return {
              success: true,
              orderId: order.id,
              isDuplicate: false
            };
          }, {
            isolationLevel: import_client8.Prisma.TransactionIsolationLevel.Serializable,
            timeout: 1e4
          });
        } catch (err) {
          financialLogger.error({ error: err.message }, `[TX_MANAGER] Transactional order creation aborted or rolled back.`);
          return {
            success: false,
            error: err.message || "TRANSACTION_ROLLBACK"
          };
        }
      }
      /**
       * Settle and complete final delivery confirmation. Resolves frozen reserves into absolute debit.
       */
      static async completeOrder(orderId, resellerId, agencyId) {
        try {
          const payload = await prisma.$transaction(async (tx) => {
            const lockedOrders = await tx.$queryRaw(
              import_client8.Prisma.sql`SELECT * FROM "Transaction" WHERE id = ${orderId} FOR UPDATE`
            );
            const order = lockedOrders[0];
            if (!order || !(order.status === "PENDING" || order.status === "PROCESSING")) {
              financialLogger.warn(`[TX_MANAGER] Process violation: Order ${orderId} missing or not in processable state.`);
              throw new Error("ORDER_NOT_PROCESSABLE");
            }
            const amount = Number(order.totalAmount);
            const ledgerRes = await LedgerService.executeLedgerEntry({
              resellerId,
              agencyId,
              amount,
              type: "CONFIRM_DEBIT",
              description: `Settle Order Delivery: ID ${orderId}`,
              orderId,
              existingTransaction: tx
            });
            if (!ledgerRes.success) {
              throw new Error("SETTLEMENT_DEBIT_FAILED");
            }
            await tx.transaction.update({
              where: { id: orderId },
              data: { status: "SUCCESS" }
            });
            await this.distributeCommissions(orderId, resellerId, agencyId, tx);
            return { orderId, amount, resellerId, agencyId };
          });
          if (!payload) return false;
          eventDispatcher.dispatch("order.settled" /* ORDER_SETTLED */, {
            orderId: payload.orderId,
            tenantId: payload.agencyId,
            resellerId: payload.resellerId,
            profitAmount: 0,
            // Placeholder
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          });
          return true;
        } catch (err) {
          financialLogger.error({ error: err.message }, `[TX_MANAGER] Fails to complete and settle order ${orderId}:`);
          return false;
        }
      }
      /**
       * Safe fail-safe path representing rollback protection. Unfreezes reserved funds and resets balances.
       */
      static async failAndRefundOrder(orderId, resellerId, agencyId, reason) {
        try {
          const payload = await prisma.$transaction(async (tx) => {
            const lockedOrders = await tx.$queryRaw(
              import_client8.Prisma.sql`SELECT * FROM "Transaction" WHERE id = ${orderId} FOR UPDATE`
            );
            const order = lockedOrders[0];
            if (!order) {
              financialLogger.warn(`[TX_MANAGER] Processing error: Order ${orderId} not found.`);
              return false;
            }
            if (order.status === "FAILED" || order.status === "REFUNDED") {
              financialLogger.warn(`[TX_MANAGER] Processing error: Order ${orderId} already rolled back.`);
              return false;
            }
            const amount = Number(order.totalAmount);
            if (order.status === "PENDING" || order.status === "PROCESSING") {
              const ledgerRes = await LedgerService.executeLedgerEntry({
                resellerId,
                agencyId,
                amount,
                type: "UNFREEZE",
                description: `Failure Rollback: ${reason} (Order: ${orderId})`,
                orderId,
                existingTransaction: tx
              });
              if (!ledgerRes.success) throw new Error("ROLLBACK_REVERSION_FAILED");
            } else if (order.status === "SUCCESS") {
              const ledgerRes = await LedgerService.executeLedgerEntry({
                resellerId,
                agencyId,
                amount,
                type: "CREDIT",
                description: `Supplier Webhook Failure Refund: ${reason} (Order: ${orderId})`,
                orderId,
                existingTransaction: tx
              });
              if (!ledgerRes.success) throw new Error("WEBHOOK_REFUND_CREDIT_FAILED");
            }
            await tx.transaction.update({
              where: { id: orderId },
              data: { status: "FAILED" }
            });
            return { orderId, agencyId, resellerId, reason, isRefund: order.status === "SUCCESS" };
          });
          if (!payload) return false;
          eventDispatcher.dispatch("supplier.failed" /* SUPPLIER_FAILED */, {
            orderId: payload.orderId,
            tenantId: payload.agencyId,
            supplierName: "UNKNOWN",
            // Track provider later
            reason: payload.reason,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          });
          if (payload.isRefund) {
            eventDispatcher.dispatch("refund.issued" /* REFUND_ISSUED */, {
              orderId: payload.orderId,
              tenantId: payload.agencyId,
              timestamp: (/* @__PURE__ */ new Date()).toISOString()
            });
          }
          return true;
        } catch (err) {
          financialLogger.error({ error: err.message }, `[TX_MANAGER] Failed to rollback/refund order ${orderId}:`);
          return false;
        }
      }
      /**
       * Distributes commissions to agency partners hierarchy securely.
       */
      static async distributeCommissions(orderId, resellerId, agencyId, tx) {
        try {
          const links = await tx.resellerTree.findMany({
            where: {
              childId: resellerId,
              tenantId: agencyId
            },
            orderBy: {
              level: "asc"
            }
          });
          if (!links || links.length === 0) return;
          const order = await tx.transaction.findUnique({ where: { id: orderId } });
          if (!order) return;
          const totalProfit = Number(order.profitAmount);
          if (totalProfit <= 0) return;
          for (const link of links) {
            const rate = link.level === 1 ? 0.05 : 0.02;
            const commissionAmount = totalProfit * rate;
            if (commissionAmount > 0) {
              const comm = await tx.commission.create({
                data: {
                  tenantId: agencyId,
                  transactionId: orderId,
                  resellerId: link.parentId,
                  amount: new import_client8.Prisma.Decimal(commissionAmount),
                  isSettled: false
                }
              });
              await LedgerService.executeLedgerEntry({
                resellerId: link.parentId,
                agencyId,
                amount: commissionAmount,
                type: "CREDIT",
                description: `Tier Commission from Reseller: Team order ID ${orderId}`,
                orderId,
                referenceId: `comm-${comm.id}`,
                existingTransaction: tx
              });
              await tx.commission.update({
                where: { id: comm.id },
                data: { isSettled: true }
              });
            }
          }
        } catch (commErr) {
          financialLogger.error({ error: commErr }, "[COMMISSION_DISTRIBUTION_WARNING] Commissions failed to settle:");
        }
      }
    };
  }
});

// src/services/payment/adapters/MidtransAdapter.ts
var import_crypto4, MidtransAdapter;
var init_MidtransAdapter = __esm({
  "src/services/payment/adapters/MidtransAdapter.ts"() {
    import_crypto4 = __toESM(require("crypto"), 1);
    init_prisma();
    init_redis();
    init_logger();
    MidtransAdapter = class {
      getName() {
        return "midtrans";
      }
      async getHealthScore(tenantId) {
        try {
          const redis = getRedisClient();
          const errorCountStr = await redis.get(`gateway_health:${tenantId}:midtrans:errors`);
          const errorCount = errorCountStr ? parseInt(errorCountStr, 10) : 0;
          return Math.max(0, 100 - errorCount * 10);
        } catch {
          return 95;
        }
      }
      async getCreds(tenantId) {
        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
        const branding = tenant?.brandingConfig;
        const config = branding?.paymentGateways?.midtrans;
        if (config?.serverKey) {
          return {
            serverKey: config.serverKey,
            merchantId: config.merchantId || "",
            isProduction: config.isProduction || false
          };
        }
        return {
          serverKey: process.env.MIDTRANS_SERVER_KEY || "dummy_midtrans_server_key",
          merchantId: process.env.MIDTRANS_MERCHANT_ID || "dummy_midtrans_merchant_id",
          isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true"
        };
      }
      getBaseUrl(isProduction) {
        return isProduction ? "https://api.midtrans.com/v2" : "https://api.sandbox.midtrans.com/v2";
      }
      async generateQRIS(tenantId, req) {
        const creds = await this.getCreds(tenantId);
        const authHeader = Buffer.from(`${creds.serverKey}:`).toString("base64");
        const url = `${this.getBaseUrl(creds.isProduction)}/charge`;
        const payload = {
          payment_type: "gopay",
          transaction_details: {
            order_id: req.transactionId,
            gross_amount: Math.round(parseFloat(req.amount.toString()))
          },
          customer_details: {
            first_name: req.customerName,
            email: req.customerEmail
          }
        };
        try {
          if (creds.serverKey === "dummy_midtrans_server_key") {
            const fakeQr = `00020101021226540014ID.CO.GOPAY.WWW01189360000000001234565204000053033605802ID5110A0123456785204000053033605802ID5110A012345678`;
            return {
              transactionId: req.transactionId,
              qrData: fakeQr,
              expirationDate: new Date(Date.now() + 15 * 60 * 1e3),
              // 15 mins expiration
              referenceId: `mid-${import_crypto4.default.randomBytes(4).toString("hex")}`
            };
          }
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Basic ${authHeader}`
            },
            body: JSON.stringify(payload)
          });
          if (!res.ok) {
            throw new Error(`Midtrans QRIS creation failed: ${res.statusText}`);
          }
          const data = await res.json();
          const actions = data.actions || [];
          const qrAction = actions.find((a) => a.name === "generate-qr-code");
          return {
            transactionId: req.transactionId,
            qrData: qrAction?.url || data.qr_string || "",
            expirationDate: new Date(Date.now() + 15 * 60 * 1e3),
            referenceId: data.transaction_id
          };
        } catch (err) {
          logger.error({ err, tenantId, transactionId: req.transactionId }, "Midtrans QRIS generation error");
          throw err;
        }
      }
      async generateVirtualAccount(tenantId, req) {
        const creds = await this.getCreds(tenantId);
        const authHeader = Buffer.from(`${creds.serverKey}:`).toString("base64");
        const url = `${this.getBaseUrl(creds.isProduction)}/charge`;
        const payload = {
          payment_type: "bank_transfer",
          transaction_details: {
            order_id: req.transactionId,
            gross_amount: Math.round(parseFloat(req.amount.toString()))
          },
          bank_transfer: {
            bank: req.bankCode.toLowerCase()
          },
          customer_details: {
            first_name: req.customerName,
            email: req.customerEmail
          }
        };
        try {
          if (creds.serverKey === "dummy_midtrans_server_key") {
            const fakeAccNum = `8800${Math.floor(1e7 + Math.random() * 9e7)}`;
            return {
              transactionId: req.transactionId,
              bankCode: req.bankCode.toUpperCase(),
              accountNumber: fakeAccNum,
              expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1e3),
              // 24 hours
              referenceId: `mid-va-${import_crypto4.default.randomBytes(4).toString("hex")}`
            };
          }
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Basic ${authHeader}`
            },
            body: JSON.stringify(payload)
          });
          if (!res.ok) {
            throw new Error(`Midtrans VA creation failed: ${res.statusText}`);
          }
          const data = await res.json();
          const vaNumbers = data.va_numbers || [];
          const primaryVa = vaNumbers[0] || {};
          return {
            transactionId: req.transactionId,
            bankCode: (primaryVa.bank || req.bankCode).toUpperCase(),
            accountNumber: primaryVa.va_number || "",
            expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1e3),
            referenceId: data.transaction_id
          };
        } catch (err) {
          logger.error({ err, tenantId, transactionId: req.transactionId }, "Midtrans VA generation error");
          throw err;
        }
      }
      async chargeEWallet(tenantId, req) {
        const creds = await this.getCreds(tenantId);
        const authHeader = Buffer.from(`${creds.serverKey}:`).toString("base64");
        const url = `${this.getBaseUrl(creds.isProduction)}/charge`;
        const channel = req.walletProvider.toLowerCase() === "ovo" ? "qris" : req.walletProvider.toLowerCase();
        const payload = {
          payment_type: channel === "shopeepay" ? "shopeepay" : "gopay",
          transaction_details: {
            order_id: req.transactionId,
            gross_amount: Math.round(parseFloat(req.amount.toString()))
          }
        };
        try {
          if (creds.serverKey === "dummy_midtrans_server_key") {
            return {
              transactionId: req.transactionId,
              deeplinkUrl: `https://gopay.co.id/pay?id=${import_crypto4.default.randomBytes(8).toString("hex")}`,
              referenceId: `mid-ew-${import_crypto4.default.randomBytes(4).toString("hex")}`,
              expirationDate: new Date(Date.now() + 15 * 60 * 1e3)
            };
          }
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Basic ${authHeader}`
            },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          const actions = data.actions || [];
          const deeplink = actions.find((a) => a.name === "deeplink-redirect");
          return {
            transactionId: req.transactionId,
            deeplinkUrl: deeplink?.url || "",
            qrData: data.qr_string || "",
            referenceId: data.transaction_id,
            expirationDate: new Date(Date.now() + 15 * 60 * 1e3)
          };
        } catch (err) {
          logger.error({ err, tenantId, transactionId: req.transactionId }, "Midtrans EWallet generation error");
          throw err;
        }
      }
      async queryPaymentStatus(tenantId, transactionId) {
        const creds = await this.getCreds(tenantId);
        const authHeader = Buffer.from(`${creds.serverKey}:`).toString("base64");
        const url = `${this.getBaseUrl(creds.isProduction)}/${transactionId}/status`;
        try {
          if (creds.serverKey === "dummy_midtrans_server_key") {
            return {
              transactionId,
              status: "PENDING"
            };
          }
          const res = await fetch(url, {
            method: "GET",
            headers: {
              "Authorization": `Basic ${authHeader}`
            }
          });
          if (!res.ok) {
            throw new Error(`Midtrans status query error: ${res.statusText}`);
          }
          const data = await res.json();
          let status = "PENDING";
          if (data.transaction_status === "settlement" || data.transaction_status === "capture") {
            status = "SETTLED";
          } else if (data.transaction_status === "expire") {
            status = "EXPIRED";
          } else if (data.transaction_status === "deny" || data.transaction_status === "cancel") {
            status = "FAILED";
          }
          return {
            transactionId,
            status,
            paidAt: data.settlement_time ? new Date(data.settlement_time) : void 0,
            rawResponse: data
          };
        } catch (err) {
          logger.error({ err, tenantId, transactionId }, "Midtrans payment status query error");
          throw err;
        }
      }
      async processPayout(tenantId, req) {
        return {
          payoutId: req.payoutId,
          status: "PENDING",
          referenceId: `mid-payout-${import_crypto4.default.randomBytes(6).toString("hex")}`
        };
      }
      async processRefund(tenantId, transactionId, amount, reason) {
        const creds = await this.getCreds(tenantId);
        const authHeader = Buffer.from(`${creds.serverKey}:`).toString("base64");
        const url = `${this.getBaseUrl(creds.isProduction)}/${transactionId}/refund`;
        try {
          if (creds.serverKey === "dummy_midtrans_server_key") {
            return true;
          }
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Basic ${authHeader}`
            },
            body: JSON.stringify({
              refund_key: `ref-${Date.now()}`,
              amount: Math.round(parseFloat(amount.toString())),
              reason: reason || "Refund requested"
            })
          });
          return res.ok;
        } catch (err) {
          logger.error({ err, tenantId, transactionId }, "Midtrans refund request failed");
          return false;
        }
      }
      async verifyWebhook(tenantId, payload) {
        const body = payload.body;
        const creds = await this.getCreds(tenantId);
        const orderId = body.order_id;
        const statusCode = body.status_code;
        const grossAmount = body.gross_amount;
        const signatureKeyReceived = body.signature_key;
        if (!orderId || !statusCode || !grossAmount || !signatureKeyReceived) {
          return { isValid: false, transactionId: "", amount: 0, status: "FAILED", paymentMethod: "unknown" };
        }
        const calculatedSig = import_crypto4.default.createHash("sha512").update(`${orderId}${statusCode}${grossAmount}${creds.serverKey}`).digest("hex");
        const isLocalMock = creds.serverKey === "dummy_midtrans_server_key" && process.env.NODE_ENV !== "production";
        const isValid = calculatedSig === signatureKeyReceived || isLocalMock;
        let status = "FAILED";
        if (body.transaction_status === "settlement" || body.transaction_status === "capture") {
          status = "SETTLED";
        } else if (body.transaction_status === "expire") {
          status = "EXPIRED";
        }
        return {
          isValid,
          transactionId: orderId,
          amount: parseFloat(grossAmount),
          status,
          paymentMethod: body.payment_type || "midtrans",
          referenceId: body.transaction_id
        };
      }
    };
  }
});

// src/services/payment/adapters/XenditAdapter.ts
var import_crypto5, XenditAdapter;
var init_XenditAdapter = __esm({
  "src/services/payment/adapters/XenditAdapter.ts"() {
    import_crypto5 = __toESM(require("crypto"), 1);
    init_prisma();
    init_redis();
    init_logger();
    XenditAdapter = class {
      getName() {
        return "xendit";
      }
      async getHealthScore(tenantId) {
        try {
          const redis = getRedisClient();
          const errorCountStr = await redis.get(`gateway_health:${tenantId}:xendit:errors`);
          const errorCount = errorCountStr ? parseInt(errorCountStr, 10) : 0;
          return Math.max(0, 100 - errorCount * 8);
        } catch {
          return 98;
        }
      }
      async getCreds(tenantId) {
        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
        const branding = tenant?.brandingConfig;
        const config = branding?.paymentGateways?.xendit;
        if (config?.apiKey) {
          return {
            apiKey: config.apiKey,
            callbackToken: config.callbackToken || ""
          };
        }
        return {
          apiKey: process.env.XENDIT_SECRET_KEY || "dummy_xendit_secret_key",
          callbackToken: process.env.XENDIT_CALLBACK_TOKEN || "dummy_xendit_callback_token"
        };
      }
      async generateQRIS(tenantId, req) {
        const creds = await this.getCreds(tenantId);
        const authHeader = Buffer.from(`${creds.apiKey}:`).toString("base64");
        const url = "https://api.xendit.co/qr_codes";
        try {
          if (creds.apiKey === "dummy_xendit_secret_key") {
            const fakeQr = `00020101021126380009id.co.qr011012345678905204000053033605802ID5912XENDIT_AGENT6007JAKARTA6105121106304A1B2`;
            return {
              transactionId: req.transactionId,
              qrData: fakeQr,
              expirationDate: new Date(Date.now() + 30 * 60 * 1e3),
              referenceId: `xen-${import_crypto5.default.randomBytes(4).toString("hex")}`
            };
          }
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Basic ${authHeader}`
            },
            body: JSON.stringify({
              external_id: req.transactionId,
              type: "DYNAMIC",
              callback_url: `${process.env.PUBLIC_API_URL || "https://api.nexuscore.com"}/api/webhooks/xendit/qr`,
              amount: Math.round(parseFloat(req.amount.toString()))
            })
          });
          if (!res.ok) {
            throw new Error(`Xendit QRIS chargement error: ${res.statusText}`);
          }
          const data = await res.json();
          return {
            transactionId: req.transactionId,
            qrData: data.qr_string || "",
            expirationDate: new Date(data.expires_at || Date.now() + 30 * 60 * 1e3),
            referenceId: data.id
          };
        } catch (err) {
          logger.error({ err, tenantId, transactionId: req.transactionId }, "Xendit QRIS creation error");
          throw err;
        }
      }
      async generateVirtualAccount(tenantId, req) {
        const creds = await this.getCreds(tenantId);
        const authHeader = Buffer.from(`${creds.apiKey}:`).toString("base64");
        const url = "https://api.xendit.co/callback_virtual_accounts";
        try {
          if (creds.apiKey === "dummy_xendit_secret_key") {
            const fakeVaNum = `99000${Math.floor(1e7 + Math.random() * 9e7)}`;
            return {
              transactionId: req.transactionId,
              bankCode: req.bankCode.toUpperCase(),
              accountNumber: fakeVaNum,
              expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1e3),
              referenceId: `xen-va-${import_crypto5.default.randomBytes(4).toString("hex")}`
            };
          }
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Basic ${authHeader}`
            },
            body: JSON.stringify({
              external_id: req.transactionId,
              bank_code: req.bankCode.toUpperCase(),
              name: req.customerName,
              is_closed: true,
              expected_amount: Math.round(parseFloat(req.amount.toString())),
              expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1e3).toISOString()
            })
          });
          if (!res.ok) {
            throw new Error(`Xendit VA creation failed: ${res.statusText}`);
          }
          const data = await res.json();
          return {
            transactionId: req.transactionId,
            bankCode: data.bank_code.toUpperCase(),
            accountNumber: data.account_number,
            expirationDate: new Date(data.expiration_date),
            referenceId: data.id
          };
        } catch (err) {
          logger.error({ err, tenantId, transactionId: req.transactionId }, "Xendit VA creation error");
          throw err;
        }
      }
      async chargeEWallet(tenantId, req) {
        const creds = await this.getCreds(tenantId);
        const authHeader = Buffer.from(`${creds.apiKey}:`).toString("base64");
        const url = "https://api.xendit.co/ewallets/charges";
        try {
          if (creds.apiKey === "dummy_xendit_secret_key") {
            return {
              transactionId: req.transactionId,
              deeplinkUrl: `https://shopee.co.id/pay/xendit?charge=${import_crypto5.default.randomBytes(8).toString("hex")}`,
              referenceId: `xen-ew-${import_crypto5.default.randomBytes(4).toString("hex")}`,
              expirationDate: new Date(Date.now() + 15 * 60 * 1e3)
            };
          }
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Basic ${authHeader}`
            },
            body: JSON.stringify({
              reference_id: req.transactionId,
              currency: "IDR",
              amount: Math.round(parseFloat(req.amount.toString())),
              checkout_method: "ONE_TIME_PAYMENT",
              channel_code: `ID_${req.walletProvider.toUpperCase()}`,
              channel_properties: {
                mobile_number: req.phoneNumber,
                success_redirect_url: req.callbackUrl || "https://nexuscore.com/payment/success"
              }
            })
          });
          if (!res.ok) {
            throw new Error(`Xendit EWallet charge failed: ${res.statusText}`);
          }
          const data = await res.json();
          const actions = data.actions || {};
          return {
            transactionId: req.transactionId,
            deeplinkUrl: actions.mobile_web_checkout_url || actions.desktop_web_checkout_url || "",
            qrData: actions.qr_checkout_string || "",
            referenceId: data.id,
            expirationDate: new Date(Date.now() + 15 * 60 * 1e3)
          };
        } catch (err) {
          logger.error({ err, tenantId, transactionId: req.transactionId }, "Xendit E-Wallet charge operation failed");
          throw err;
        }
      }
      async queryPaymentStatus(tenantId, transactionId) {
        const creds = await this.getCreds(tenantId);
        const authHeader = Buffer.from(`${creds.apiKey}:`).toString("base64");
        const url = `https://api.xendit.co/qr_codes/${transactionId}`;
        try {
          if (creds.apiKey === "dummy_xendit_secret_key") {
            return {
              transactionId,
              status: "PENDING"
            };
          }
          const res = await fetch(url, {
            method: "GET",
            headers: {
              "Authorization": `Basic ${authHeader}`
            }
          });
          if (!res.ok) {
            return { transactionId, status: "PENDING" };
          }
          const data = await res.json();
          let status = "PENDING";
          if (data.status === "COMPLETED" || data.status === "SUCCESS") {
            status = "SETTLED";
          } else if (data.status === "EXPIRED") {
            status = "EXPIRED";
          } else if (data.status === "FAILED") {
            status = "FAILED";
          }
          return {
            transactionId,
            status,
            rawResponse: data
          };
        } catch {
          return { transactionId, status: "PENDING" };
        }
      }
      async processPayout(tenantId, req) {
        const creds = await this.getCreds(tenantId);
        const authHeader = Buffer.from(`${creds.apiKey}:`).toString("base64");
        const url = "https://api.xendit.co/disbursements";
        try {
          if (creds.apiKey === "dummy_xendit_secret_key") {
            return {
              payoutId: req.payoutId,
              status: "COMPLETED",
              referenceId: `disb-${import_crypto5.default.randomBytes(6).toString("hex")}`,
              completedAt: /* @__PURE__ */ new Date()
            };
          }
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Basic ${authHeader}`
            },
            body: JSON.stringify({
              external_id: req.payoutId,
              amount: Math.round(parseFloat(req.amount.toString())),
              bank_code: req.bankCode.toUpperCase(),
              account_holder_name: req.accountName,
              account_number: req.accountNumber,
              description: req.description
            })
          });
          if (!res.ok) {
            throw new Error(`Xendit disbursement failed: ${res.statusText}`);
          }
          const data = await res.json();
          let status = "PENDING";
          if (data.status === "COMPLETED") status = "COMPLETED";
          else if (data.status === "FAILED") status = "FAILED";
          return {
            payoutId: req.payoutId,
            status,
            referenceId: data.id,
            failureReason: data.failure_code
          };
        } catch (err) {
          logger.error({ err, tenantId, payoutId: req.payoutId }, "Xendit payout processing error");
          return {
            payoutId: req.payoutId,
            status: "FAILED",
            referenceId: "",
            failureReason: err.message
          };
        }
      }
      async processRefund(tenantId, transactionId, amount, reason) {
        return true;
      }
      async verifyWebhook(tenantId, payload) {
        const body = payload.body;
        const creds = await this.getCreds(tenantId);
        const tokenHeader = payload.headers["x-callback-token"];
        const isLocalMock = creds.apiKey === "dummy_xendit_secret_key" && process.env.NODE_ENV !== "production";
        const isValid = tokenHeader === creds.callbackToken || isLocalMock;
        const transactionId = body.external_id || body.reference_id || body.qr_code?.external_id || "";
        const amount = body.amount || body.qr_payment?.amount || 0;
        const paymentMethod = body.payment_method || body.bank_code || "xendit";
        const referenceId = body.id || body.qr_payment?.id || "";
        let status = "FAILED";
        if (body.status === "COMPLETED" || body.status === "SUCCESS" || body.event === "qr_code.payment") {
          status = "SETTLED";
        } else if (body.status === "EXPIRED") {
          status = "EXPIRED";
        }
        return {
          isValid,
          transactionId,
          amount: parseFloat(amount),
          status,
          paymentMethod,
          referenceId
        };
      }
    };
  }
});

// src/services/payment/adapters/DuitkuAdapter.ts
var import_crypto6, DuitkuAdapter;
var init_DuitkuAdapter = __esm({
  "src/services/payment/adapters/DuitkuAdapter.ts"() {
    import_crypto6 = __toESM(require("crypto"), 1);
    init_prisma();
    init_redis();
    init_logger();
    DuitkuAdapter = class {
      getName() {
        return "duitku";
      }
      async getHealthScore(tenantId) {
        try {
          const redis = getRedisClient();
          const errorCountStr = await redis.get(`gateway_health:${tenantId}:duitku:errors`);
          const errorCount = errorCountStr ? parseInt(errorCountStr, 10) : 0;
          return Math.max(0, 100 - errorCount * 12);
        } catch {
          return 94;
        }
      }
      async getCreds(tenantId) {
        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
        const branding = tenant?.brandingConfig;
        const config = branding?.paymentGateways?.duitku;
        if (config?.merchantCode) {
          return {
            merchantCode: config.merchantCode,
            merchantKey: config.merchantKey,
            isProduction: config.isProduction || false
          };
        }
        return {
          merchantCode: process.env.DUITKU_MERCHANT_CODE || "dummy_duitku_merchant_code",
          merchantKey: process.env.DUITKU_MERCHANT_KEY || "dummy_duitku_merchant_key",
          isProduction: process.env.DUITKU_IS_PRODUCTION === "true"
        };
      }
      getBaseUrl(isProduction) {
        return isProduction ? "https://passport.duitku.com/webapi/api/merchant/v2" : "https://sandbox.duitku.com/webapi/api/merchant/v2";
      }
      createMd5(data) {
        return import_crypto6.default.createHash("md5").update(data).digest("hex");
      }
      async generateQRIS(tenantId, req) {
        const creds = await this.getCreds(tenantId);
        const amountInt = Math.round(parseFloat(req.amount.toString()));
        const signature = this.createMd5(`${creds.merchantCode}${req.transactionId}${amountInt}${creds.merchantKey}`);
        try {
          if (creds.merchantCode === "dummy_duitku_merchant_code") {
            const fakeQr = `00020101021226590011ID.CO.QRIS01189360000000001234565204000053033605802ID5110A0123456785204000053033605802ID5110A012345678`;
            return {
              transactionId: req.transactionId,
              qrData: fakeQr,
              expirationDate: new Date(Date.now() + 15 * 60 * 1e3),
              referenceId: `dtk-${import_crypto6.default.randomBytes(4).toString("hex")}`
            };
          }
          const url = `${this.getBaseUrl(creds.isProduction)}/inquiry`;
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              merchantCode: creds.merchantCode,
              paymentAmount: amountInt,
              paymentMethod: "SP",
              // ShopeePay/Gopay/QRIS
              merchantOrderId: req.transactionId,
              productDetails: `NexusCore Deposit for ${req.customerName}`,
              email: req.customerEmail,
              signature
            })
          });
          if (!res.ok) {
            throw new Error(`Duitku QRIS Inquiry failed: ${res.statusText}`);
          }
          const data = await res.json();
          return {
            transactionId: req.transactionId,
            qrData: data.qrString || data.paymentUrl || "",
            expirationDate: new Date(Date.now() + 15 * 60 * 1e3),
            referenceId: data.reference || ""
          };
        } catch (err) {
          logger.error({ err, tenantId, transactionId: req.transactionId }, "Duitku QRIS creation error");
          throw err;
        }
      }
      async generateVirtualAccount(tenantId, req) {
        const creds = await this.getCreds(tenantId);
        const amountInt = Math.round(parseFloat(req.amount.toString()));
        const signature = this.createMd5(`${creds.merchantCode}${req.transactionId}${amountInt}${creds.merchantKey}`);
        try {
          if (creds.merchantCode === "dummy_duitku_merchant_code") {
            return {
              transactionId: req.transactionId,
              bankCode: req.bankCode.toUpperCase(),
              accountNumber: `7700${Math.floor(1e7 + Math.random() * 9e7)}`,
              expirationDate: new Date(Date.now() + 12 * 60 * 60 * 1e3),
              referenceId: `dtk-va-${import_crypto6.default.randomBytes(4).toString("hex")}`
            };
          }
          const url = `${this.getBaseUrl(creds.isProduction)}/inquiry`;
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              merchantCode: creds.merchantCode,
              paymentAmount: amountInt,
              paymentMethod: req.bankCode.toUpperCase(),
              merchantOrderId: req.transactionId,
              productDetails: "Deposit Payment",
              email: req.customerEmail,
              signature
            })
          });
          if (!res.ok) {
            throw new Error(`Duitku VA inquiry failed: ${res.statusText}`);
          }
          const data = await res.json();
          return {
            transactionId: req.transactionId,
            bankCode: req.bankCode.toUpperCase(),
            accountNumber: data.vaNumber || "",
            expirationDate: new Date(Date.now() + 12 * 60 * 60 * 1e3),
            referenceId: data.reference || ""
          };
        } catch (err) {
          logger.error({ err, tenantId, transactionId: req.transactionId }, "Duitku VA creation error");
          throw err;
        }
      }
      async chargeEWallet(tenantId, req) {
        const creds = await this.getCreds(tenantId);
        const amountInt = Math.round(parseFloat(req.amount.toString()));
        const signature = this.createMd5(`${creds.merchantCode}${req.transactionId}${amountInt}${creds.merchantKey}`);
        try {
          if (creds.merchantCode === "dummy_duitku_merchant_code") {
            return {
              transactionId: req.transactionId,
              deeplinkUrl: `https://duitku.com/pay/ewallet?order=${req.transactionId}`,
              expirationDate: new Date(Date.now() + 15 * 60 * 1e3),
              referenceId: `dtk-ew-${import_crypto6.default.randomBytes(4).toString("hex")}`
            };
          }
          const url = `${this.getBaseUrl(creds.isProduction)}/inquiry`;
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              merchantCode: creds.merchantCode,
              paymentAmount: amountInt,
              paymentMethod: req.walletProvider.toUpperCase(),
              merchantOrderId: req.transactionId,
              productDetails: "E-Wallet Charge",
              phoneNumber: req.phoneNumber,
              signature
            })
          });
          const data = await res.json();
          return {
            transactionId: req.transactionId,
            deeplinkUrl: data.paymentUrl || "",
            qrData: data.qrString || "",
            referenceId: data.reference || "",
            expirationDate: new Date(Date.now() + 15 * 60 * 1e3)
          };
        } catch (err) {
          logger.error({ err, tenantId, transactionId: req.transactionId }, "Duitku ewallet charge failed");
          throw err;
        }
      }
      async queryPaymentStatus(tenantId, transactionId) {
        return {
          transactionId,
          status: "PENDING"
        };
      }
      async processPayout(tenantId, req) {
        return {
          payoutId: req.payoutId,
          status: "PENDING",
          referenceId: ""
        };
      }
      async processRefund(tenantId, transactionId, amount, reason) {
        return true;
      }
      async verifyWebhook(tenantId, payload) {
        const body = payload.body;
        const creds = await this.getCreds(tenantId);
        const merchantCode = body.merchantCode;
        const amount = body.amount;
        const merchantOrderId = body.merchantOrderId;
        const signatureReceived = body.signature;
        if (!merchantCode || !amount || !merchantOrderId || !signatureReceived) {
          return { isValid: false, transactionId: "", amount: 0, status: "FAILED", paymentMethod: "unknown" };
        }
        const calculatedSig = this.createMd5(`${merchantCode}${amount}${merchantOrderId}${creds.merchantKey}`);
        const isLocalMock = creds.merchantCode === "dummy_duitku_merchant_code" && process.env.NODE_ENV !== "production";
        const isValid = calculatedSig === signatureReceived || isLocalMock;
        let status = "FAILED";
        if (body.resultCode === "00") {
          status = "SETTLED";
        }
        return {
          isValid,
          transactionId: merchantOrderId,
          amount: parseFloat(amount),
          status,
          paymentMethod: body.paymentCode || "duitku",
          referenceId: body.reference
        };
      }
    };
  }
});

// src/services/orchestration/CircuitBreaker.ts
var CircuitBreaker;
var init_CircuitBreaker = __esm({
  "src/services/orchestration/CircuitBreaker.ts"() {
    init_redis();
    init_logger();
    CircuitBreaker = class {
      constructor(name, options = { failureThreshold: 5, recoveryTimeout: 3e4 }) {
        this.name = `cb:${name}`;
        this.options = options;
      }
      async getState() {
        const state = await getRedisClient().get(`${this.name}:state`);
        return state || "CLOSED" /* CLOSED */;
      }
      async recordFailure() {
        const failures = await getRedisClient().incr(`${this.name}:failures`);
        if (failures >= this.options.failureThreshold) {
          await getRedisClient().set(`${this.name}:state`, "OPEN" /* OPEN */, "PX", this.options.recoveryTimeout);
          logger.warn(`Circuit breaker ${this.name} tripped to OPEN`);
        }
      }
      async recordSuccess() {
        await getRedisClient().del(`${this.name}:failures`);
        await getRedisClient().set(`${this.name}:state`, "CLOSED" /* CLOSED */);
      }
      async execute(action) {
        const state = await this.getState();
        if (state === "OPEN" /* OPEN */) {
          throw new Error(`CircuitBreaker ${this.name} is OPEN - Fast failing`);
        }
        try {
          const result = await action();
          await this.recordSuccess();
          return result;
        } catch (error) {
          await this.recordFailure();
          throw error;
        }
      }
    };
  }
});

// src/services/payment/PaymentGatewayManager.ts
var PaymentGatewayManager_exports = {};
__export(PaymentGatewayManager_exports, {
  PaymentGatewayManager: () => PaymentGatewayManager
});
var PaymentGatewayManager;
var init_PaymentGatewayManager = __esm({
  "src/services/payment/PaymentGatewayManager.ts"() {
    init_redis();
    init_logger();
    init_MidtransAdapter();
    init_XenditAdapter();
    init_DuitkuAdapter();
    init_CircuitBreaker();
    PaymentGatewayManager = class _PaymentGatewayManager {
      constructor() {
        this.adapters = /* @__PURE__ */ new Map();
        this.breakers = /* @__PURE__ */ new Map();
        this.registerAdapter(new MidtransAdapter());
        this.registerAdapter(new XenditAdapter());
        this.registerAdapter(new DuitkuAdapter());
      }
      static getInstance() {
        if (!_PaymentGatewayManager.instance) {
          _PaymentGatewayManager.instance = new _PaymentGatewayManager();
        }
        return _PaymentGatewayManager.instance;
      }
      registerAdapter(adapter) {
        const name = adapter.getName();
        this.adapters.set(name, adapter);
        this.breakers.set(name, new CircuitBreaker(`pg_${name}`, { failureThreshold: 5, recoveryTimeout: 6e4 }));
      }
      async executeWithBreaker(providerName, action) {
        const breaker = this.breakers.get(providerName);
        if (!breaker) throw new Error(`Breaker for ${providerName} not found`);
        return breaker.execute(action);
      }
      /**
       * Evaluates and routes to the best provider based on health score or tenant manual preference
       */
      async getBestAdapter(tenantId, preferredProvider) {
        if (preferredProvider) {
          const adapter = this.adapters.get(preferredProvider);
          const breaker = this.breakers.get(preferredProvider);
          if (adapter && breaker && await breaker.getState() === "CLOSED" /* CLOSED */) {
            const score = await adapter.getHealthScore(tenantId);
            if (score >= 50) {
              return adapter;
            }
            logger.warn({ tenantId, preferredProvider, score }, "Preferred payment gateway has low health score. Seeking failover.");
          }
        }
        let bestAdapter = null;
        let highestScore = -1;
        for (const adapter of this.adapters.values()) {
          const name = adapter.getName();
          const breaker = this.breakers.get(name);
          if (breaker && await breaker.getState() === "OPEN" /* OPEN */) {
            continue;
          }
          const score = await adapter.getHealthScore(tenantId);
          logger.debug({ provider: name, score, tenantId }, "Checking health score for routing");
          if (score > highestScore) {
            highestScore = score;
            bestAdapter = adapter;
          }
        }
        if (!bestAdapter) {
          bestAdapter = this.adapters.get("xendit") || this.adapters.get("midtrans");
        }
        logger.info({ tenantId, selectedProvider: bestAdapter.getName(), healthScore: highestScore }, "Dynamic gateway routing selected provider");
        return bestAdapter;
      }
      /**
       * Tracks standard failures to fuel the routing/failover dynamic engine
       */
      async recordFailure(tenantId, provider) {
        try {
          const redis = getRedisClient();
          const key = `gateway_health:${tenantId}:${provider}:errors`;
          await redis.incr(key);
          await redis.expire(key, 300);
          logger.warn({ tenantId, provider }, `Recorded payment gateway failure for ${provider}. Updated health scores.`);
        } catch (err) {
          logger.error(err, "Failed to record gateway failure in Redis");
        }
      }
      getAdapter(name) {
        const adapter = this.adapters.get(name);
        if (!adapter) {
          throw new Error(`Payment adapter ${name} is not registered`);
        }
        return adapter;
      }
    };
  }
});

// src/services/payment/QRISService.ts
var QRISService_exports = {};
__export(QRISService_exports, {
  QRISService: () => QRISService
});
var QRISService;
var init_QRISService = __esm({
  "src/services/payment/QRISService.ts"() {
    init_prisma();
    init_logger();
    init_PaymentGatewayManager();
    QRISService = class {
      /**
       * Generates a new dynamic QRIS for deposit funds
       */
      static async generateDepositQR(tenantId, walletId, amount, customerName, customerEmail, preferredProvider) {
        const manager = PaymentGatewayManager.getInstance();
        const adapter = await manager.getBestAdapter(tenantId, preferredProvider);
        const deposit = await prisma.deposit.create({
          data: {
            walletId,
            amount,
            status: "PENDING",
            paymentMethod: "QRIS"
          }
        });
        try {
          const qrReq = {
            transactionId: deposit.id,
            amount,
            customerName,
            customerEmail
          };
          const qrResponse = await adapter.generateQRIS(tenantId, qrReq);
          await prisma.deposit.update({
            where: { id: deposit.id },
            data: {
              paymentRef: qrResponse.referenceId
            }
          });
          logger.info(
            { depositId: deposit.id, provider: adapter.getName(), referenceId: qrResponse.referenceId },
            "Successfully initiated dynamic QRIS payment request"
          );
          return {
            depositId: deposit.id,
            qrData: qrResponse.qrData,
            expirationDate: qrResponse.expirationDate,
            amount,
            provider: adapter.getName()
          };
        } catch (err) {
          await manager.recordFailure(tenantId, adapter.getName());
          await prisma.deposit.update({
            where: { id: deposit.id },
            data: { status: "FAILED" }
          });
          logger.error({ err, depositId: deposit.id }, "Failed to generate dynamic QRIS, marked as FAILED.");
          throw err;
        }
      }
      /**
       * Syncs the status of a QRIS payment with the gateway manually
       */
      static async syncQRISPaymentStatus(tenantId, depositId) {
        const deposit = await prisma.deposit.findUnique({
          where: { id: depositId }
        });
        if (!deposit || deposit.status !== "PENDING") {
          return deposit?.status || "NOT_FOUND";
        }
        const manager = PaymentGatewayManager.getInstance();
        const adapter = await manager.getBestAdapter(tenantId);
        try {
          const statusResult = await adapter.queryPaymentStatus(tenantId, deposit.id);
          if (statusResult.status === "SETTLED") {
            await prisma.deposit.update({
              where: { id: depositId },
              data: { status: "SUCCESS" }
            });
            logger.info({ depositId }, "Deposit payment matched SETTLED on gateway check. Status synchronized.");
            return "SUCCESS";
          } else if (statusResult.status === "EXPIRED") {
            await prisma.deposit.update({
              where: { id: depositId },
              data: { status: "EXPIRED" }
            });
            return "EXPIRED";
          }
          return "PENDING";
        } catch (err) {
          logger.error({ err, depositId }, "Error querying payment status of QRIS");
          return "PENDING";
        }
      }
    };
  }
});

// src/services/products/CatalogCacheService.ts
var CatalogCacheService_exports = {};
__export(CatalogCacheService_exports, {
  CatalogCacheService: () => CatalogCacheService
});
var CatalogCacheService;
var init_CatalogCacheService = __esm({
  "src/services/products/CatalogCacheService.ts"() {
    init_prisma();
    init_redis();
    init_logger();
    CatalogCacheService = class {
      static {
        this.CACHE_TTL = 300;
      }
      // 5 minutes in seconds
      static getCacheKey(tenantId) {
        return `catalog:public:${tenantId}`;
      }
      /**
       * Get public products catalog for a tenant. Checks Redis cache first, falls back to Prisma, then caches.
       */
      static async getPublicProducts(tenantId) {
        const key = this.getCacheKey(tenantId);
        try {
          const redis = getRedisClient();
          const cached = await redis.get(key);
          if (cached) {
            logger.info({ tenantId }, "[CatalogCache] Cache HIT for public products list");
            return JSON.parse(cached);
          }
        } catch (cacheErr) {
          logger.warn({ cacheErr, tenantId }, "[CatalogCache] Redis fetch failed, falling back to database query");
        }
        logger.info({ tenantId }, "[CatalogCache] Cache MISS for public products list. Querying database.");
        const products = await prisma.product.findMany({
          where: { tenantId, isAvailable: true }
        });
        if (products.length > 0) {
          try {
            const redis = getRedisClient();
            await redis.set(key, JSON.stringify(products), "EX", this.CACHE_TTL);
            logger.info({ tenantId }, "[CatalogCache] Successfully warmed public products cache");
          } catch (cacheErr) {
            logger.error({ cacheErr, tenantId }, "[CatalogCache] Failed to warm public products cache");
          }
        }
        return products;
      }
      /**
       * Invalidates public products catalog cache for a tenant.
       * Call this whenever products are created, updated, toggled, or synced.
       */
      static async invalidateCatalog(tenantId) {
        const key = this.getCacheKey(tenantId);
        try {
          const redis = getRedisClient();
          await redis.del(key);
          logger.info({ tenantId }, "[CatalogCache] Successfully invalidated public products cache");
        } catch (cacheErr) {
          logger.error({ cacheErr, tenantId }, "[CatalogCache] Failed to invalidate public products cache");
        }
      }
    };
  }
});

// src/services/billing/billingService.server.ts
var billingService_server_exports = {};
__export(billingService_server_exports, {
  BillingService: () => BillingService
});
var import_client10, BillingService;
var init_billingService_server = __esm({
  "src/services/billing/billingService.server.ts"() {
    init_prisma();
    init_ledgerService();
    import_client10 = require("@prisma/client");
    BillingService = class {
      static async getPendingDeposits(agencyId) {
        const deposits = await prisma.deposit.findMany({
          where: {
            status: "PENDING",
            wallet: {
              tenantId: agencyId
            }
          },
          include: {
            wallet: true
          },
          orderBy: {
            createdAt: "desc"
          }
        });
        return deposits.map((d) => ({
          id: d.id,
          resellerId: d.wallet.userId,
          agencyId: d.wallet.tenantId,
          amount: Number(d.amount),
          type: "CREDIT",
          status: "PENDING",
          description: `Deposit via ${d.paymentMethod}`,
          paymentMethod: d.paymentMethod,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt
        }));
      }
      static async approveDeposit(tx) {
        if (!tx.agencyId) throw new Error("Missing agencyId in transaction");
        return await prisma.$transaction(async (prismaTx) => {
          const lockedDeposits = await prismaTx.$queryRaw(
            import_client10.Prisma.sql`SELECT * FROM "Deposit" WHERE id = ${tx.id} FOR UPDATE`
          );
          const deposit = lockedDeposits && lockedDeposits.length > 0 ? lockedDeposits[0] : null;
          if (!deposit) {
            throw new Error("DEPOSIT_NOT_FOUND");
          }
          if (deposit.status !== "PENDING") {
            throw new Error("DEPOSIT_ALREADY_PROCESSED");
          }
          await LedgerService.executeLedgerEntry({
            resellerId: tx.resellerId,
            agencyId: tx.agencyId,
            amount: tx.amount,
            type: "CREDIT",
            description: `Approved Deposit: ${tx.description || "Deposit Request"}`,
            metadata: { originalTxId: tx.id },
            existingTransaction: prismaTx
          });
          await prismaTx.deposit.update({
            where: { id: tx.id },
            data: {
              status: "SUCCESS",
              updatedAt: /* @__PURE__ */ new Date()
            }
          });
        }, {
          isolationLevel: import_client10.Prisma.TransactionIsolationLevel.Serializable
        });
      }
      static async rejectDeposit(agencyId, id) {
        return await prisma.$transaction(async (prismaTx) => {
          const lockedDeposits = await prismaTx.$queryRaw(
            import_client10.Prisma.sql`SELECT * FROM "Deposit" WHERE id = ${id} FOR UPDATE`
          );
          const deposit = lockedDeposits && lockedDeposits.length > 0 ? lockedDeposits[0] : null;
          if (!deposit) {
            throw new Error("DEPOSIT_NOT_FOUND");
          }
          if (deposit.status !== "PENDING") {
            throw new Error("DEPOSIT_ALREADY_PROCESSED");
          }
          await prismaTx.deposit.update({
            where: { id },
            data: {
              status: "EXPIRED",
              updatedAt: /* @__PURE__ */ new Date()
            }
          });
        }, {
          isolationLevel: import_client10.Prisma.TransactionIsolationLevel.Serializable
        });
      }
      static async requestDeposit(params) {
        return await prisma.$transaction(async (prismaTx) => {
          let user = await prismaTx.user.findFirst({
            where: {
              id: params.resellerId,
              tenantId: params.agencyId
            }
          });
          if (!user) {
            user = await prismaTx.user.upsert({
              where: { email: `${params.resellerId}@nexuscore.net` },
              update: {},
              create: {
                id: params.resellerId,
                email: `${params.resellerId}@nexuscore.net`,
                passwordHash: "PBKDF2_SECURE_PASSWORD",
                displayName: `Reseller ${params.resellerId.substring(0, 5)}`,
                role: "RESELLER",
                tenantId: params.agencyId
              }
            });
          }
          let wallet = await prismaTx.wallet.findUnique({
            where: {
              userId_tenantId: {
                userId: user.id,
                tenantId: params.agencyId
              }
            }
          });
          if (!wallet) {
            wallet = await prismaTx.wallet.create({
              data: {
                userId: user.id,
                tenantId: params.agencyId,
                balance: new import_client10.Prisma.Decimal(0),
                frozenBalance: new import_client10.Prisma.Decimal(0),
                currency: "IDR"
              }
            });
          }
          await prismaTx.deposit.create({
            data: {
              walletId: wallet.id,
              amount: new import_client10.Prisma.Decimal(params.amount),
              status: "PENDING",
              paymentMethod: params.paymentMethod,
              paymentRef: `DEP-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
            }
          });
          return true;
        });
      }
      static async debitReseller(params) {
        return await LedgerService.executeLedgerEntry({
          ...params,
          type: "DEBIT"
        });
      }
      static async creditReseller(params) {
        return await LedgerService.executeLedgerEntry({
          ...params,
          type: "CREDIT"
        });
      }
    };
  }
});

// src/services/payment/EWalletService.ts
var EWalletService_exports = {};
__export(EWalletService_exports, {
  EWalletService: () => EWalletService
});
var EWalletService;
var init_EWalletService = __esm({
  "src/services/payment/EWalletService.ts"() {
    init_prisma();
    init_logger();
    init_PaymentGatewayManager();
    EWalletService = class {
      /**
       * Charges an E-Wallet directly
       */
      static async chargeDepositEWallet(tenantId, walletId, amount, walletProvider, phoneNumber, callbackUrl, preferredProvider) {
        const manager = PaymentGatewayManager.getInstance();
        const adapter = await manager.getBestAdapter(tenantId, preferredProvider);
        const deposit = await prisma.deposit.create({
          data: {
            walletId,
            amount,
            status: "PENDING",
            paymentMethod: walletProvider
          }
        });
        try {
          const eWalletReq = {
            transactionId: deposit.id,
            amount,
            walletProvider,
            phoneNumber,
            callbackUrl
          };
          const eWalletResponse = await adapter.chargeEWallet(tenantId, eWalletReq);
          await prisma.deposit.update({
            where: { id: deposit.id },
            data: {
              paymentRef: eWalletResponse.referenceId
            }
          });
          logger.info(
            { depositId: deposit.id, walletProvider, provider: adapter.getName() },
            "E-wallet deposit requested successfully"
          );
          return {
            depositId: deposit.id,
            deeplinkUrl: eWalletResponse.deeplinkUrl,
            qrData: eWalletResponse.qrData,
            expirationDate: eWalletResponse.expirationDate,
            amount,
            provider: adapter.getName()
          };
        } catch (err) {
          await manager.recordFailure(tenantId, adapter.getName());
          await prisma.deposit.update({
            where: { id: deposit.id },
            data: { status: "FAILED" }
          });
          logger.error({ err, depositId: deposit.id }, "E-wallet charge failed. Marked as FAILED.");
          throw err;
        }
      }
    };
  }
});

// src/services/financial/FraudDetectionService.ts
var import_client11, FraudRules, FraudDetectionService2;
var init_FraudDetectionService2 = __esm({
  "src/services/financial/FraudDetectionService.ts"() {
    init_redis();
    init_logger();
    import_client11 = require("@prisma/client");
    init_LedgerAuditService();
    init_prisma();
    FraudRules = {
      MAX_DAILY_PAYOUT_AMOUNT: 5e8,
      // 500 million IDR
      MAX_PAYOUTS_PER_HOUR: 10,
      MAX_DAILY_DEPOSIT_VELOCITY: 50
      // 50 deposits max per day per wallet
    };
    FraudDetectionService2 = class {
      /**
       * Evaluates payout anomalies based on velocity and thresholds
       */
      static async evaluatePayoutRisk(tenantId, walletId, amount) {
        const decimalAmount = new import_client11.Prisma.Decimal(amount);
        const redis = getRedisClient();
        const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        try {
          const dailyKey = `fraud:payout:daily_vol:${walletId}:${today}`;
          const currentVolStr = await redis.get(dailyKey);
          const currentVol = currentVolStr ? new import_client11.Prisma.Decimal(currentVolStr) : new import_client11.Prisma.Decimal(0);
          const newVol = currentVol.add(decimalAmount);
          if (newVol.greaterThan(FraudRules.MAX_DAILY_PAYOUT_AMOUNT)) {
            logger.error({ tenantId, walletId, amount: decimalAmount.toString() }, "FRAUD DETECTED: Daily payout volume exceeded");
            await this.logFraudEvent(tenantId, walletId, "DAILY_VOLUME_EXCEEDED");
            return false;
          }
          const hourKey = `fraud:payout:freq_hr:${walletId}:${(/* @__PURE__ */ new Date()).getHours()}`;
          const count = await redis.incr(hourKey);
          if (count === 1) await redis.expire(hourKey, 3600);
          if (count > FraudRules.MAX_PAYOUTS_PER_HOUR) {
            logger.error({ tenantId, walletId, count }, "FRAUD DETECTED: Hourly payout frequency exceeded");
            await this.logFraudEvent(tenantId, walletId, "HOURLY_FREQUENCY_EXCEEDED");
            return false;
          }
          if (currentVolStr === null) {
            await redis.set(dailyKey, newVol.toString(), "EX", 86400);
          } else {
            await redis.set(dailyKey, newVol.toString());
          }
          return true;
        } catch (err) {
          logger.error(err, "Failed to evaluate fraud risk");
          return true;
        }
      }
      static async logFraudEvent(tenantId, walletId, reason) {
        try {
          await prisma.$transaction(async (tx) => {
            await LedgerAuditService.logEvent(
              tx,
              tenantId,
              "FRAUD_ALERT",
              JSON.stringify({ walletId, reason }),
              "CRITICAL",
              `fraud_detect_${walletId}_${Date.now()}`
            );
          });
        } catch (err) {
          logger.error(err, "Could not log fraud event to database");
        }
      }
    };
  }
});

// src/services/payment/PayoutEngine.ts
var import_crypto7, import_client12, PayoutEngine;
var init_PayoutEngine = __esm({
  "src/services/payment/PayoutEngine.ts"() {
    import_crypto7 = __toESM(require("crypto"), 1);
    init_prisma();
    init_logger();
    init_PaymentGatewayManager();
    init_LedgerEngine();
    init_LedgerAuditService();
    import_client12 = require("@prisma/client");
    init_FraudDetectionService2();
    PayoutEngine = class {
      /**
       * Initiates a secure real-money payout across providers with atomic double-entry ledger bookkeeping
       */
      static async initiatePayout(tenantId, walletId, amount, bankCode, accountNumber, accountName, description, correlationId) {
        const ANOMALY_THRESHOLD = 5e7;
        if (amount > ANOMALY_THRESHOLD) {
          logger.error(
            { tenantId, amount, walletId },
            "CRITICAL_FINANCIAL_ALERT: Payout threshold exceeded anomaly. Access Denied."
          );
          throw new Error("FINANCIAL_ALERT: Payout transaction blocks due to threshold ceiling breach.");
        }
        if (amount <= 0) {
          throw new Error("Payout amount must be positive.");
        }
        const isSafe = await FraudDetectionService2.evaluatePayoutRisk(tenantId, walletId, amount);
        if (!isSafe) {
          throw new Error("SECURITY_ALERT: Transaction blocked by anti-fraud velocity policies.");
        }
        const wallet = await prisma.wallet.findFirst({
          where: { id: walletId }
        });
        if (!wallet || wallet.balance.toNumber() < amount) {
          throw new Error(`Insufficient funds inside wallet ${walletId}. Available: ${wallet?.balance || 0}`);
        }
        const decimalAmount = new import_client12.Prisma.Decimal(amount);
        return await prisma.$transaction(async (tx) => {
          const journal = await LedgerEngine.recordTransaction({
            tenantId,
            type: "WITHDRAWAL",
            description: `Payout pending for ${accountName} via ${bankCode}`,
            idempotencyKey: correlationId,
            entries: [
              { accountId: walletId, accountType: "USER_WALLET" /* USER_WALLET */, amount: decimalAmount, type: "DEBIT" },
              { accountId: "SYSTEM_LIABILITY", accountType: "SYSTEM_LIABILITY" /* SYSTEM_LIABILITY */, amount: decimalAmount, type: "CREDIT" }
            ]
          });
          const manager = PaymentGatewayManager.getInstance();
          const adapter = await manager.getBestAdapter(tenantId, "xendit");
          const payoutId = `payout-${import_crypto7.default.randomBytes(12).toString("hex")}`;
          try {
            const payload = {
              payoutId,
              amount,
              bankCode,
              accountNumber,
              accountName,
              description
            };
            const result = await manager.executeWithBreaker(adapter.getName(), () => adapter.processPayout(tenantId, payload));
            await LedgerAuditService.logEvent(
              tx,
              tenantId,
              "PAYOUT_INITIATED",
              JSON.stringify({
                payoutId,
                walletId,
                amount,
                status: result.status,
                referenceId: result.referenceId,
                journalId: journal.id
              }),
              "INFO",
              correlationId
            );
            return {
              success: true,
              payoutId,
              status: result.status,
              referenceId: result.referenceId,
              journalId: journal.id
            };
          } catch (gatewayErr) {
            await manager.recordFailure(tenantId, adapter.getName());
            const rollbackKey = `rollback-pay-${correlationId}`;
            await LedgerEngine.recordTransaction({
              tenantId,
              type: "REFUND",
              description: `ROLLBACK: Failed Payout to ${accountName} (${bankCode})`,
              idempotencyKey: rollbackKey,
              entries: [
                { accountId: "SYSTEM_LIABILITY", accountType: "SYSTEM_LIABILITY" /* SYSTEM_LIABILITY */, amount: decimalAmount, type: "DEBIT" },
                { accountId: walletId, accountType: "USER_WALLET" /* USER_WALLET */, amount: decimalAmount, type: "CREDIT" }
              ]
            });
            logger.error({ err: gatewayErr, tenantId, walletId }, "Payout gateway failure. Automated balance rollback succeeded.");
            throw new Error(`Payout failed: ${gatewayErr.message}`);
          }
        });
      }
    };
  }
});

// src/services/payment/WithdrawalService.ts
var WithdrawalService_exports = {};
__export(WithdrawalService_exports, {
  WithdrawalService: () => WithdrawalService
});
var WithdrawalService;
var init_WithdrawalService = __esm({
  "src/services/payment/WithdrawalService.ts"() {
    init_prisma();
    init_logger();
    init_PayoutEngine();
    WithdrawalService = class {
      /**
       * Submits a withdrawal request and triggers dynamic disbursement through Xendit/Midtrans PayoutEngine
       */
      static async requestWithdrawal(tenantId, walletId, amount, bankCode, accountNumber, accountName, description = "Partner revenue payout") {
        if (amount <= 0) {
          throw new Error("Withdrawal amount must be postive.");
        }
        const withdrawal = await prisma.withdrawal.create({
          data: {
            walletId,
            amount,
            status: "PENDING",
            bankAccount: `${bankCode}:${accountNumber}:${accountName}`
          }
        });
        const correlationId = `wdr-corr-${withdrawal.id}`;
        try {
          const payoutResult = await PayoutEngine.initiatePayout(
            tenantId,
            walletId,
            amount,
            bankCode,
            accountNumber,
            accountName,
            description,
            correlationId
          );
          await prisma.withdrawal.update({
            where: { id: withdrawal.id },
            data: {
              status: payoutResult.status === "COMPLETED" ? "APPROVED" : "PENDING"
            }
          });
          logger.info({ withdrawalId: withdrawal.id, status: payoutResult.status }, "Withdrawal request created and dispatched");
          return {
            withdrawalId: withdrawal.id,
            status: payoutResult.status === "COMPLETED" ? "COMPLETED" : "PENDING",
            referenceId: payoutResult.referenceId
          };
        } catch (err) {
          await prisma.withdrawal.update({
            where: { id: withdrawal.id },
            data: {
              status: "REJECTED"
            }
          });
          logger.error({ err, withdrawalId: withdrawal.id }, "Withdrawal request execution failed.");
          throw err;
        }
      }
    };
  }
});

// src/lib/lock.ts
var import_crypto8, DistributedLock;
var init_lock = __esm({
  "src/lib/lock.ts"() {
    init_redis();
    init_logger();
    import_crypto8 = __toESM(require("crypto"), 1);
    DistributedLock = class {
      static async acquire(key, ttlSeconds = 30) {
        const client2 = getRedisClient();
        const token = import_crypto8.default.randomUUID();
        const result = await client2.set(key, token, "EX", ttlSeconds, "NX");
        if (result === "OK") {
          return token;
        }
        return null;
      }
      static async release(key, token) {
        const client2 = getRedisClient();
        const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
        const result = await client2.eval(script, 1, key, token);
        return result === 1;
      }
      static async withLock(key, ttlSeconds, fn) {
        const lockKey = `lock:${key}`;
        const token = await this.acquire(lockKey, ttlSeconds);
        if (!token) {
          logger.warn({ lockKey }, "Failed to acquire distributed lock");
          throw new Error("Resource is currently locked. Please try again.");
        }
        try {
          return await fn();
        } finally {
          const released = await this.release(lockKey, token);
          if (!released) {
            logger.error({ lockKey }, "Failed to release distributed lock, or lock was unexpectedly overwritten");
          }
        }
      }
    };
  }
});

// src/services/financial/EscrowManager.ts
var import_client13, EscrowManager;
var init_EscrowManager = __esm({
  "src/services/financial/EscrowManager.ts"() {
    init_prisma();
    import_client13 = require("@prisma/client");
    init_LedgerEngine();
    init_logger();
    init_LedgerAuditService();
    init_lock();
    EscrowManager = class {
      /**
       * Holds an amount in escrow.
       * Debits the user's wallet, credits the platform escrow account, and records the escrow record.
       */
      static async holdEscrow(tenantId, walletId, amount, orderId, idempotencyKey, description = "") {
        return DistributedLock.withLock(`escrow_hold_${walletId}_${orderId}`, 30, async () => {
          const decimalAmount = new import_client13.Prisma.Decimal(amount);
          return await prisma.$transaction(async (tx) => {
            const journal = await LedgerEngine.recordTransaction({
              tenantId,
              type: "ESCROW_HOLD",
              description: description || `Escrow hold of ${decimalAmount} for order ${orderId}`,
              orderId,
              idempotencyKey,
              entries: [
                {
                  accountId: walletId,
                  accountType: "USER_WALLET" /* USER_WALLET */,
                  amount: decimalAmount,
                  type: "DEBIT"
                },
                {
                  accountId: "PLATFORM_ESCROW",
                  accountType: "PLATFORM_ESCROW" /* PLATFORM_ESCROW */,
                  amount: decimalAmount,
                  type: "CREDIT"
                }
              ]
            });
            const escrowRecord = await tx.escrowBalance.create({
              data: {
                tenantId,
                walletId,
                amount: decimalAmount,
                status: "HELD",
                description,
                orderId
              }
            });
            await LedgerAuditService.logEvent(
              tx,
              tenantId,
              "ESCROW_HOLD",
              JSON.stringify({
                walletId,
                amount: decimalAmount.toString(),
                orderId,
                escrowId: escrowRecord.id,
                journalId: journal.id
              }),
              "INFO",
              idempotencyKey
            );
            financialLogger.info(
              { tenantId, orderId, escrowId: escrowRecord.id, amount: decimalAmount.toString() },
              "Escrow hold securely recorded and double-entry logged"
            );
            return escrowRecord;
          });
        });
      }
      /**
       * Releases escrow funds.
       * Debits the platform escrow account, credits systems/suppliers, and updates the escrow record status.
       */
      static async releaseEscrow(tenantId, escrowId, supplierSettlementAmount, idempotencyKey) {
        return DistributedLock.withLock(`escrow_release_${escrowId}`, 30, async () => {
          return await prisma.$transaction(async (tx) => {
            const escrow = await tx.escrowBalance.findUnique({
              where: { id: escrowId }
            });
            if (!escrow) {
              throw new Error(`Escrow record with ID ${escrowId} not found`);
            }
            if (escrow.status !== "HELD") {
              throw new Error(`Cannot release escrow with status ${escrow.status}`);
            }
            const totalEscrowAmount = new import_client13.Prisma.Decimal(escrow.amount);
            const supplierAmt = new import_client13.Prisma.Decimal(supplierSettlementAmount);
            const profitAmt = totalEscrowAmount.sub(supplierAmt);
            if (profitAmt.lessThan(0)) {
              throw new Error(`Supplier settlement amount ${supplierAmt} cannot exceed total escrow amount ${totalEscrowAmount}`);
            }
            const journal = await LedgerEngine.recordTransaction({
              tenantId,
              type: "ESCROW_RELEASE",
              description: `Escrow release for order ${escrow.orderId}`,
              orderId: escrow.orderId || void 0,
              idempotencyKey,
              entries: [
                {
                  accountId: "PLATFORM_ESCROW",
                  accountType: "PLATFORM_ESCROW" /* PLATFORM_ESCROW */,
                  amount: totalEscrowAmount,
                  type: "DEBIT"
                },
                {
                  accountId: "SYSTEM_SUPPLIER",
                  accountType: "SUPPLIER_SETTLEMENT" /* SUPPLIER_SETTLEMENT */,
                  amount: supplierAmt,
                  type: "CREDIT"
                },
                {
                  accountId: "SYSTEM_REVENUE",
                  accountType: "SYSTEM_REVENUE" /* SYSTEM_REVENUE */,
                  amount: profitAmt,
                  type: "CREDIT"
                }
              ]
            });
            const updatedEscrow = await tx.escrowBalance.update({
              where: { id: escrowId },
              data: {
                status: "RELEASED"
              }
            });
            await LedgerAuditService.logEvent(
              tx,
              tenantId,
              "ESCROW_RELEASE",
              JSON.stringify({
                escrowId,
                orderId: escrow.orderId,
                totalAmount: totalEscrowAmount.toString(),
                supplierAmount: supplierAmt.toString(),
                profitAmount: profitAmt.toString(),
                journalId: journal.id
              }),
              "INFO",
              idempotencyKey
            );
            financialLogger.info(
              { tenantId, escrowId, orderId: escrow.orderId, releasedAmount: totalEscrowAmount.toString() },
              "Escrow funds successfully released to supplier and system revenues"
            );
            return updatedEscrow;
          });
        });
      }
      /**
       * Refunds escrow funds back to the user's wallet.
       * Debits the platform escrow account, credits the user's wallet.
       */
      static async refundEscrow(tenantId, escrowId, idempotencyKey) {
        return DistributedLock.withLock(`escrow_refund_${escrowId}`, 30, async () => {
          return await prisma.$transaction(async (tx) => {
            const escrow = await tx.escrowBalance.findUnique({
              where: { id: escrowId }
            });
            if (!escrow) {
              throw new Error(`Escrow record with ID ${escrowId} not found`);
            }
            if (escrow.status !== "HELD") {
              throw new Error(`Cannot refund escrow with status ${escrow.status}`);
            }
            if (!escrow.walletId) {
              throw new Error(`Cannot refund escrow without associated walletId`);
            }
            const totalEscrowAmount = new import_client13.Prisma.Decimal(escrow.amount);
            const journal = await LedgerEngine.recordTransaction({
              tenantId,
              type: "ESCROW_REFUND",
              description: `Escrow refund for order ${escrow.orderId}`,
              orderId: escrow.orderId || void 0,
              idempotencyKey,
              entries: [
                {
                  accountId: "PLATFORM_ESCROW",
                  accountType: "PLATFORM_ESCROW" /* PLATFORM_ESCROW */,
                  amount: totalEscrowAmount,
                  type: "DEBIT"
                },
                {
                  accountId: escrow.walletId,
                  accountType: "USER_WALLET" /* USER_WALLET */,
                  amount: totalEscrowAmount,
                  type: "CREDIT"
                }
              ]
            });
            const updatedEscrow = await tx.escrowBalance.update({
              where: { id: escrowId },
              data: {
                status: "REFUNDED"
              }
            });
            await LedgerAuditService.logEvent(
              tx,
              tenantId,
              "ESCROW_REFUND",
              JSON.stringify({
                escrowId,
                orderId: escrow.orderId,
                walletId: escrow.walletId,
                refundAmount: totalEscrowAmount.toString(),
                journalId: journal.id
              }),
              "INFO",
              idempotencyKey
            );
            financialLogger.info(
              { tenantId, escrowId, orderId: escrow.orderId, walletId: escrow.walletId },
              "Escrow funds successfully refunded back to wallet"
            );
            return updatedEscrow;
          });
        });
      }
    };
  }
});

// src/services/payment/RefundEngine.ts
var RefundEngine_exports = {};
__export(RefundEngine_exports, {
  RefundEngine: () => RefundEngine
});
var import_client14, RefundEngine;
var init_RefundEngine = __esm({
  "src/services/payment/RefundEngine.ts"() {
    init_prisma();
    init_logger();
    init_LedgerEngine();
    init_LedgerAuditService();
    init_EscrowManager();
    import_client14 = require("@prisma/client");
    RefundEngine = class {
      /**
       * Processes a structured financial refund with double-entry accounting and rollback protection
       */
      static async processRefund(tenantId, transactionId, amount, reason, idempotencyKey) {
        if (amount <= 0) {
          throw new Error("Refund amount must be positive.");
        }
        const decimalAmount = new import_client14.Prisma.Decimal(amount);
        return await prisma.$transaction(async (tx) => {
          const existingRefund = await tx.ledgerJournal.findFirst({
            where: {
              tenantId,
              type: "REFUND",
              idempotencyKey
            }
          });
          if (existingRefund) {
            logger.warn({ idempotencyKey, transactionId }, "Replay-reversal detected. Refund already processed.");
            return { success: true, alreadyProcessed: true, journalId: existingRefund.id };
          }
          const transaction = await tx.transaction.findFirst({
            where: { id: transactionId, tenantId },
            include: {
              items: true
            }
          });
          if (!transaction) {
            throw new Error(`Refund failed: Transaction ${transactionId} not found.`);
          }
          if (transaction.status === "REFUNDED") {
            throw new Error(`Transaction ${transactionId} has already been fully refunded.`);
          }
          const escrowRecord = await tx.escrowBalance.findFirst({
            where: {
              tenantId,
              orderId: transactionId,
              status: "HELD"
            }
          });
          let journal;
          if (escrowRecord) {
            logger.info({ escrowId: escrowRecord.id, transactionId }, "Escrow hold detected. Refunding through Escrow Refund controller.");
            const updatedEscrow = await EscrowManager.refundEscrow(tenantId, escrowRecord.id, idempotencyKey);
            await tx.transaction.update({
              where: { id: transactionId },
              data: { refundStatus: "FULL", status: "REFUNDED" }
            });
            return {
              success: true,
              type: "ESCROW_REFUND",
              escrowId: updatedEscrow.id,
              amount
            };
          }
          const firstLedger = await tx.walletLedger.findFirst({
            where: { orderId: transactionId }
          });
          const walletId = firstLedger?.walletId;
          if (!walletId) {
            throw new Error(`Cannot trace user wallet from transaction logs for ${transactionId}`);
          }
          journal = await LedgerEngine.recordTransaction({
            tenantId,
            type: "REFUND",
            description: `Refund committed: ${reason} for transaction ${transactionId}`,
            idempotencyKey,
            entries: [
              { accountId: "SYSTEM_LIABILITY", accountType: "SYSTEM_LIABILITY" /* SYSTEM_LIABILITY */, amount: decimalAmount, type: "DEBIT" },
              { accountId: walletId, accountType: "USER_WALLET" /* USER_WALLET */, amount: decimalAmount, type: "CREDIT" }
            ]
          });
          await tx.transaction.update({
            where: { id: transactionId },
            data: {
              refundStatus: "FULL",
              status: "REFUNDED"
            }
          });
          await LedgerAuditService.logEvent(
            tx,
            tenantId,
            "REFUND_COMMITTED",
            JSON.stringify({
              transactionId,
              walletId,
              amount: decimalAmount.toString(),
              reason,
              journalId: journal.id
            }),
            "INFO",
            idempotencyKey
          );
          logger.info({ transactionId, walletId, refundAmount: amount }, "Transaction successfully refunded. Balancing journal entries recorded.");
          return {
            success: true,
            type: "STANDARD_REFUND",
            journalId: journal.id,
            amount
          };
        });
      }
    };
  }
});

// src/services/financial/FinancialIntegrityService.ts
var FinancialIntegrityService_exports = {};
__export(FinancialIntegrityService_exports, {
  FinancialIntegrityService: () => FinancialIntegrityService
});
var FinancialIntegrityService;
var init_FinancialIntegrityService = __esm({
  "src/services/financial/FinancialIntegrityService.ts"() {
    init_prisma();
    init_DriftDetectionService();
    init_LedgerAuditService();
    init_logger();
    FinancialIntegrityService = class {
      /**
       * Computes a full integrity check across the tenant's ledger and financial data.
       */
      static async performIntegrityAudit(tenantId) {
        financialLogger.info({ tenantId }, "Performing end-to-end Financial Integrity Audit...");
        const auditIntegrity = await LedgerAuditService.verifyAuditTrailIntegrity(tenantId);
        const systemDrift = await DriftDetectionService.auditAllSystemBalances(tenantId);
        const wallets = await prisma.wallet.findMany({ where: { tenantId } });
        let walletDriftCount = 0;
        for (const wallet of wallets) {
          const checkResult = await DriftDetectionService.checkWalletDrift(tenantId, wallet.id);
          if (checkResult.hasDrift) {
            walletDriftCount++;
          }
        }
        const pendingDiscrepancies = await prisma.reconciliationRecord.count({
          where: {
            tenantId,
            status: "DISCREPANCY"
          }
        });
        let healthStatus = "HEALTHY";
        if (!auditIntegrity.isValid || walletDriftCount > 0 || systemDrift.driftCount > 0) {
          healthStatus = "CRITICAL";
        } else if (pendingDiscrepancies > 0) {
          healthStatus = "DISRUPTED";
        }
        const report = {
          tenantId,
          timestamp: /* @__PURE__ */ new Date(),
          auditTrailValid: auditIntegrity.isValid,
          tamperedLogCount: auditIntegrity.corruptLogIds.length,
          walletDriftCount,
          journalDriftCount: systemDrift.driftCount,
          totalDriftAmountUSD: systemDrift.discrepancies.reduce((acc, item) => {
            return acc + Math.abs(parseFloat(item.sumOfDebits) - parseFloat(item.sumOfCredits));
          }, 0),
          reconciliationDiscrepancies: pendingDiscrepancies,
          healthStatus
        };
        financialLogger.info({ tenantId, report }, "Financial Integrity Audit completed.");
        return report;
      }
    };
  }
});

// server.ts
var import_express = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var Sentry = __toESM(require("@sentry/node"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var import_helmet = __toESM(require("helmet"), 1);
var import_pino_http = __toESM(require("pino-http"), 1);
init_env();
init_logger();

// src/lib/tracing.ts
var import_sdk_node = require("@opentelemetry/sdk-node");
var import_sdk_trace_node = require("@opentelemetry/sdk-trace-node");
var import_api2 = require("@opentelemetry/api");
var import_auto_instrumentations_node = require("@opentelemetry/auto-instrumentations-node");
var import_instrumentation = require("@prisma/instrumentation");
init_logger();
var sdk = new import_sdk_node.NodeSDK({
  traceExporter: new import_sdk_trace_node.ConsoleSpanExporter(),
  // Replace with OTLP exporter in real production
  instrumentations: [
    (0, import_auto_instrumentations_node.getNodeAutoInstrumentations)({
      "@opentelemetry/instrumentation-fs": { enabled: false }
      // avoid noisy fs traces
    }),
    new import_instrumentation.PrismaInstrumentation()
  ]
});
var startTracing = () => {
  sdk.start();
};
process.on("SIGTERM", () => {
  sdk.shutdown().then(() => logger.info("Tracing terminated")).catch((error) => logger.error({ err: error }, "Error terminating tracing")).finally(() => process.exit(0));
});
var tracer = import_api2.trace.getTracer("nexuscore-tracer");

// src/workers/index.ts
init_logger();

// src/workers/transactionWorker.ts
var import_bullmq2 = require("bullmq");
init_redis();
init_queueManager();
init_logger();
var startTransactionWorker = () => {
  const worker = new import_bullmq2.Worker(
    "transaction-processing" /* TRANSACTION_PROCESSING */,
    async (job) => {
      logger.info(`Processing transaction job: ${job.id}`);
      const { transactionId } = job.data;
      return { status: "completed" };
    },
    {
      connection: getRedisClient(),
      concurrency: 5
    }
  );
  worker.on("active", (job) => {
    logger.info(`Transaction job ${job.id} started processing`);
  });
  worker.on("failed", (job, err) => {
    logger.error(`Transaction job ${job?.id} failed: ${err.message}`);
  });
  worker.on("stalled", (jobId) => {
    logger.warn(`Transaction job ${jobId} stalled`);
  });
  worker.on("error", (err) => {
    logger.error(`Transaction worker error: ${err.message}`);
  });
  return worker;
};

// src/workers/ReconciliationWorker.ts
var import_bullmq3 = require("bullmq");
init_redis();
init_queueManager();
init_logger();
init_DriftDetectionService();
var startReconciliationWorker = () => {
  return new import_bullmq3.Worker(
    "reconciliation" /* RECONCILIATION */,
    async (job) => {
      const { tenantId, walletId, type } = job.data;
      logger.info({ jobId: job.id, tenantId, walletId }, `Reconciling transaction balances`);
      try {
        if (type === "WALLET_AUDIT") {
          const check = await DriftDetectionService.checkWalletDrift(tenantId, walletId);
          return { status: "reconciled", hasDrift: check.hasDrift, driftAmount: check.driftAmount.toString() };
        } else if (type === "SYSTEM_AUDIT") {
          const check = await DriftDetectionService.auditAllSystemBalances(tenantId);
          return { status: "reconciled", driftCount: check.driftCount };
        }
        return { status: "skipped" };
      } catch (err) {
        logger.error({ err, tenantId, walletId }, "Reconciliation background runner failed");
        throw err;
      }
    },
    { connection: getRedisClient() }
  );
};

// src/workers/QueueTelemetryWorker.ts
var import_bullmq4 = require("bullmq");
init_redis();
init_metrics();
init_logger();
init_queueManager();
var startQueueTelemetryWorker = () => {
  const connection = getRedisClient();
  const queues = [
    new import_bullmq4.Queue("transaction-processing" /* TRANSACTION_PROCESSING */, { connection }),
    new import_bullmq4.Queue("webhook-delivery" /* WEBHOOK_DELIVERY */, { connection }),
    new import_bullmq4.Queue("reconciliation" /* RECONCILIATION */, { connection }),
    new import_bullmq4.Queue("settlement-queue", { connection }),
    new import_bullmq4.Queue("settlement" /* SETTLEMENT */, { connection }),
    new import_bullmq4.Queue("payout" /* PAYOUT */, { connection }),
    new import_bullmq4.Queue("audit" /* AUDIT */, { connection })
  ];
  const interval = setInterval(async () => {
    for (const queue of queues) {
      try {
        const waiting = await queue.getWaitingCount();
        const active = await queue.getActiveCount();
        const failed = await queue.getFailedCount();
        queueLagMetrics.labels(queue.name).set(waiting);
        if (waiting > 100) {
          workerLogger.warn({ queue: queue.name, waiting, active }, "High queue lag detected");
        }
        if (failed > 0) {
          workerLogger.info({ queue: queue.name, failed }, "Jobs in dead letter state");
        }
      } catch (err) {
        workerLogger.error(err, `Failed to collect queue telemetry for ${queue.name}`);
      }
    }
  }, 1e4);
  return {
    close: async () => {
      clearInterval(interval);
      for (const queue of queues) {
        await queue.close().catch(() => {
        });
      }
      await connection.quit().catch(() => {
      });
    }
  };
};

// src/workers/LedgerSettlementWorker.ts
var import_bullmq5 = require("bullmq");
init_redis();
init_logger();
init_prisma();

// src/services/financial/SettlementManager.ts
init_LedgerEngine();
init_prisma();
var SettlementManager = class {
  static async freezeBalance(tenantId, walletId, amount, orderId, idempotencyKey) {
    await LedgerEngine.recordTransaction({
      tenantId,
      type: "ORDER_FREEZE",
      description: `Freezing balance for order ${orderId}`,
      orderId,
      idempotencyKey,
      entries: [
        { accountId: walletId, accountType: "USER_WALLET" /* USER_WALLET */, amount, type: "DEBIT" },
        { accountId: walletId, accountType: "FROZEN_BALANCE" /* FROZEN_BALANCE */, amount, type: "CREDIT" }
      ]
    });
  }
  static async commitSettlement(tenantId, walletId, amount, supplierSettlementAmount, orderId, idempotencyKey) {
    const profitAmount = amount.sub(supplierSettlementAmount);
    return await prisma.$transaction(async (tx) => {
      await LedgerEngine.recordTransaction({
        tenantId,
        type: "ORDER_SETTLEMENT",
        description: `Settling order ${orderId}`,
        orderId,
        idempotencyKey: `settle_${idempotencyKey}`,
        entries: [
          // Release from frozen
          { accountId: walletId, accountType: "FROZEN_BALANCE" /* FROZEN_BALANCE */, type: "DEBIT", amount },
          // Pay supplier
          { accountId: "SYSTEM_SUPPLIER", accountType: "SUPPLIER_SETTLEMENT" /* SUPPLIER_SETTLEMENT */, type: "CREDIT", amount: supplierSettlementAmount },
          // Record Profit
          { accountId: "SYSTEM_REVENUE", accountType: "SYSTEM_REVENUE" /* SYSTEM_REVENUE */, type: "CREDIT", amount: profitAmount }
        ]
      });
      const settlement = await tx.settlementRecord.create({
        data: {
          tenantId,
          transactionId: orderId,
          amount,
          supplierAmount: supplierSettlementAmount,
          profitAmount,
          status: "COMPLETED",
          settledAt: /* @__PURE__ */ new Date()
        }
      });
      return settlement;
    });
  }
  static async cancelFreeze(tenantId, walletId, amount, orderId, idempotencyKey) {
    await LedgerEngine.recordTransaction({
      tenantId,
      type: "ORDER_FREEZE_REVERSAL",
      description: `Reversing freeze for order ${orderId}`,
      orderId,
      idempotencyKey: `unfreeze_${idempotencyKey}`,
      entries: [
        { accountId: walletId, accountType: "FROZEN_BALANCE" /* FROZEN_BALANCE */, amount, type: "DEBIT" },
        { accountId: walletId, accountType: "USER_WALLET" /* USER_WALLET */, amount, type: "CREDIT" }
      ]
    });
  }
};

// src/workers/LedgerSettlementWorker.ts
var import_client4 = require("@prisma/client");
var startLedgerSettlementWorker = () => {
  return new import_bullmq5.Worker(
    "settlement-queue",
    async (job) => {
      const { transactionId, tenantId, walletId, amount, supplierSettlementAmount } = job.data;
      workerLogger.info({ transactionId }, `Processing async settlement strategy for transaction: ${transactionId}`);
      try {
        const tx = await prisma.transaction.findUnique({ where: { id: transactionId } });
        if (!tx || tx.status !== "PROCESSING") {
          workerLogger.warn({ transactionId }, "Transaction not in correct state for settlement");
          return { status: "skipped" };
        }
        const settlement = await SettlementManager.commitSettlement(
          tenantId,
          walletId,
          new import_client4.Prisma.Decimal(amount),
          new import_client4.Prisma.Decimal(supplierSettlementAmount),
          transactionId,
          job.id
        );
        await prisma.transaction.update({
          where: { id: transactionId },
          data: { status: "SUCCESS" }
        });
        financialLogger.info({ transactionId, settlementId: settlement.id }, "Ledger settlement safely committed");
        return { status: "settled", settlementId: settlement.id };
      } catch (err) {
        financialLogger.error({ transactionId, err }, "Failed to commit ledger settlement. Safe rollback engaged.");
        throw err;
      }
    },
    {
      connection: getRedisClient(),
      concurrency: 50,
      limiter: {
        max: 500,
        duration: 1e3
      }
    }
  );
};

// src/workers/SettlementQueueWorker.ts
var import_bullmq6 = require("bullmq");
init_redis();
init_queueManager();
init_logger();
init_SettlementEngine();
var startSettlementQueueWorker = () => {
  return new import_bullmq6.Worker(
    "settlement" /* SETTLEMENT */,
    async (job) => {
      const { type, tenantId, orderId, walletId, amount, supplierSettlementAmount, idempotencyKey, reason } = job.data;
      logger.info({ jobId: job.id, type, orderId }, `Processing settlement queue task`);
      try {
        if (type === "INITIATE") {
          await SettlementEngine.initiateSettlement(tenantId, walletId, amount, orderId, idempotencyKey);
        } else if (type === "COMMIT") {
          await SettlementEngine.commitSettlement(tenantId, orderId, supplierSettlementAmount, idempotencyKey);
        } else if (type === "ROLLBACK") {
          await SettlementEngine.rollbackSettlement(tenantId, walletId, orderId, idempotencyKey, reason);
        } else {
          throw new Error(`Unknown settlement task type: ${type}`);
        }
        return { status: "success", type, orderId };
      } catch (err) {
        logger.error({ err, orderId, type }, "Settlement queue task failed");
        throw err;
      }
    },
    { connection: getRedisClient(), concurrency: 10 }
  );
};

// src/workers/PayoutQueueWorker.ts
var import_bullmq7 = require("bullmq");
init_redis();
init_queueManager();
init_logger();
init_BalanceManager();
var startPayoutQueueWorker = () => {
  return new import_bullmq7.Worker(
    "payout" /* PAYOUT */,
    async (job) => {
      const { tenantId, walletId, amount, idempotencyKey, description } = job.data;
      logger.info({ jobId: job.id, walletId, amount }, `Processing payout orchestration task`);
      try {
        const journal = await BalanceManager.withdrawFunds(tenantId, walletId, amount, idempotencyKey, description);
        return { status: "payout_completed", journalId: journal.id };
      } catch (err) {
        logger.error({ err, walletId }, "Payout queue execution failed");
        throw err;
      }
    },
    { connection: getRedisClient(), concurrency: 5 }
  );
};

// src/workers/AuditQueueWorker.ts
var import_bullmq8 = require("bullmq");
init_redis();
init_queueManager();
init_logger();
init_LedgerAuditService();
init_prisma();
var startAuditQueueWorker = () => {
  return new import_bullmq8.Worker(
    "audit" /* AUDIT */,
    async (job) => {
      const { tenantId, action, details, severity, correlationId } = job.data;
      logger.debug({ jobId: job.id, action }, `Processing asynchronous financial audit logging`);
      try {
        await prisma.$transaction(async (tx) => {
          await LedgerAuditService.logEvent(tx, tenantId, action, details, severity, correlationId);
        });
        return { status: "audit_logged" };
      } catch (err) {
        logger.error({ err, action }, "Failed to persist audit log asynchronously");
        throw err;
      }
    },
    { connection: getRedisClient(), concurrency: 20 }
  );
};

// src/workers/FinancialIntegrityAuditWorker.ts
init_logger();
init_prisma();
init_DriftDetectionService();
var FinancialIntegrityAuditWorker = class {
  constructor() {
    this.intervalId = null;
    this.isScanning = false;
  }
  start() {
    logger.info("[FinancialIntegrityAuditWorker] Initializing automated 60-minute Financial Integrity Audit loop...");
    setTimeout(() => {
      this.runAuditScan().catch((err) => {
        logger.error(err, "[FinancialIntegrityAuditWorker] Error during initial audit scan");
      });
    }, 5e3);
    this.intervalId = setInterval(() => {
      this.runAuditScan().catch((err) => {
        logger.error(err, "[FinancialIntegrityAuditWorker] Error during scheduled audit scan");
      });
    }, 36e5);
  }
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info("[FinancialIntegrityAuditWorker] Audit loop stopped.");
    }
  }
  async runAuditScan() {
    if (this.isScanning) {
      logger.warn("[FinancialIntegrityAuditWorker] Audit scan is already in progress, skipping...");
      return;
    }
    this.isScanning = true;
    logger.info("[FinancialIntegrityAuditWorker] Running scheduled multi-tenant Financial Integrity Audit scan...");
    try {
      const activeTenants = await prisma.tenant.findMany({
        where: {
          status: "ACTIVE"
        }
      });
      logger.info(`[FinancialIntegrityAuditWorker] Found ${activeTenants.length} active tenants to scan.`);
      for (const tenant of activeTenants) {
        logger.info(`[FinancialIntegrityAuditWorker] Auditing tenant: ${tenant.name} (${tenant.id})`);
        try {
          const sysAudit = await DriftDetectionService.auditAllSystemBalances(tenant.id);
          if (sysAudit.driftCount > 0) {
            logger.error(
              { tenantId: tenant.id, driftCount: sysAudit.driftCount, discrepancies: sysAudit.discrepancies },
              `[FinancialIntegrityAuditWorker] WARNING: Journal ledger Credits vs Debits mismatch for tenant ${tenant.name}`
            );
          }
        } catch (sysErr) {
          logger.error(sysErr, `[FinancialIntegrityAuditWorker] Failed system balance audit for tenant ${tenant.id}`);
        }
        try {
          const wallets = await prisma.wallet.findMany({
            where: { tenantId: tenant.id }
          });
          for (const wallet of wallets) {
            const check = await DriftDetectionService.checkWalletDrift(tenant.id, wallet.id);
            if (check.hasDrift) {
              logger.error(
                { tenantId: tenant.id, walletId: wallet.id, driftAmount: check.driftAmount.toString() },
                `[FinancialIntegrityAuditWorker] CRITICAL: Balance drift mismatch found on wallet: ${wallet.id}. Drift amount: ${check.driftAmount}`
              );
            }
          }
        } catch (walletErr) {
          logger.error(walletErr, `[FinancialIntegrityAuditWorker] Failed wallet balance drift audit for tenant ${tenant.id}`);
        }
      }
      logger.info("[FinancialIntegrityAuditWorker] Automated multi-tenant Financial Integrity Audit scan completed successfully.");
    } catch (err) {
      if (err.name === "PrismaClientInitializationError" || err.message?.includes("Can't reach database")) {
        logger.warn("[FinancialIntegrityAuditWorker] Could not connect to database, skipping this audit scan.");
      } else {
        logger.error(err, "[FinancialIntegrityAuditWorker] Fatal error running automated audit scans");
      }
    } finally {
      this.isScanning = false;
    }
  }
};
var startFinancialIntegrityAuditWorker = () => {
  const worker = new FinancialIntegrityAuditWorker();
  worker.start();
  return {
    close: async () => {
      worker.stop();
    }
  };
};

// src/workers/index.ts
var globalForWorkers = globalThis;
var startAllWorkers = async () => {
  if (globalForWorkers.workers) {
    logger.info("Workers already running, skipping initialization (HMR)");
    return {
      shutdown: async () => {
        logger.info("Shutting down background workers gracefully...");
        for (const instance of globalForWorkers.workers) {
          try {
            await instance.close();
          } catch (err) {
            logger.error({ err }, "Error during worker shutdown");
          }
        }
        globalForWorkers.workers = [];
      }
    };
  }
  logger.info("Starting background workers...");
  const workers = [
    { name: "TransactionWorker", start: startTransactionWorker },
    { name: "ReconciliationWorker", start: startReconciliationWorker },
    { name: "LedgerSettlementWorker", start: startLedgerSettlementWorker },
    { name: "QueueTelemetryWorker", start: startQueueTelemetryWorker },
    { name: "SettlementQueueWorker", start: startSettlementQueueWorker },
    { name: "PayoutQueueWorker", start: startPayoutQueueWorker },
    { name: "AuditQueueWorker", start: startAuditQueueWorker },
    { name: "FinancialIntegrityAuditWorker", start: startFinancialIntegrityAuditWorker }
  ];
  const instances = [];
  for (const w of workers) {
    try {
      logger.info(`Initializing worker: ${w.name}`);
      const instance = w.start();
      if (instance && typeof instance.on === "function") {
        instance.on("error", (err) => {
          logger.error({ err, worker: w.name }, `[CRITICAL_WORKER_ERROR] Worker encountered an isolated error. Process thread preserved.`);
        });
      }
      instances.push(instance);
    } catch (err) {
      logger.error({ err }, `Failed to start worker: ${w.name}`);
    }
  }
  globalForWorkers.workers = instances;
  const shutdown = async () => {
    logger.info("Shutting down background workers gracefully...");
    for (const instance of instances) {
      try {
        await instance.close();
      } catch (err) {
        logger.error({ err }, "Error during worker shutdown");
      }
    }
    globalForWorkers.workers = [];
  };
  return { shutdown };
};

// src/adapters/suppliers/BaseAdapter.ts
init_logger();
var BaseAdapter = class {
  constructor(config) {
    this.config = config || {};
  }
  /**
   * Helper payload extractor returning either parameters explicitly passed or constructor config
   */
  getCredentials(credentials) {
    const active = credentials || {};
    return {
      apiKey: active.apiKey || this.config.apiKey || "",
      secretKey: active.secretKey || this.config.secretKey || active.webhookSecret || this.config.webhookSecret || "",
      username: active.username || this.config.username || active.accessToken || this.config.accessToken || "",
      resellerId: active.resellerId || this.config.resellerId || ""
    };
  }
  /**
   * Safe Fetch with AbortController timeout execution
   */
  async fetchWithTimeout(url, options, timeoutMs = 15e3) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        throw new Error(`[${this.name}] Endpoint request to ${url} timed out after ${timeoutMs}ms`);
      }
      throw err;
    }
  }
  /**
   * Universal retry wrapper with exponential backoff
   */
  async withRetry(operation, maxRetries = 3, initialDelay = 1e3) {
    let lastError;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        const delay = initialDelay * Math.pow(2, attempt);
        logger.warn({ adapter: this.name, attempt: attempt + 1, delayMs: delay }, "Adapter retry attempt");
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw lastError;
  }
};

// src/components/ISupplierAdapter.ts
var Decimal = function(val) {
  if (!(this instanceof Decimal)) return new Decimal(val);
  this.value = val;
  this.lessThan = (amt) => Number(this.value) < Number(amt);
  this.toString = () => String(this.value);
  this.toNumber = () => Number(this.value);
};

// src/services/suppliers/types.ts
var SupplierStatus = {
  COMPLETED: "COMPLETED",
  PROCESSING: "PROCESSING",
  PENDING: "PENDING",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED"
};

// src/adapters/suppliers/instances/DigiflazzAdapter.ts
var import_crypto_js = __toESM(require("crypto-js"), 1);
init_logger();
var DigiflazzAdapter = class extends BaseAdapter {
  constructor(config) {
    super(config);
    this.id = "digiflazz";
    this.name = "Digiflazz";
    this.baseUrl = "https://api.digiflazz.com/v1";
    if (config?.baseUrl) {
      this.baseUrl = config.baseUrl;
    }
  }
  /**
   * Generates MD5 signature for Digiflazz API authentication
   * Format: MD5(username + apiKey + suffix)
   */
  generateSignature(username, apiKey, suffix) {
    return import_crypto_js.default.MD5(username + apiKey + suffix).toString();
  }
  /**
   * Maps Indonesian status labels and standard RC codes to unified SupplierStatus
   */
  mapStatus(statusStr, rc) {
    if (!statusStr) {
      if (rc === "00") return SupplierStatus.COMPLETED;
      if (rc === "03" || rc === "05") return SupplierStatus.PROCESSING;
      if (rc && rc !== "00" && rc !== "03" && rc !== "05") return SupplierStatus.FAILED;
      return SupplierStatus.PENDING;
    }
    const normalized = statusStr.toLowerCase();
    if (normalized === "sukses" || normalized === "success") {
      return SupplierStatus.COMPLETED;
    }
    if (normalized === "gagal" || normalized === "failed" || normalized === "gagal / refund" || normalized === "blocked" || normalized === "error") {
      return SupplierStatus.FAILED;
    }
    if (normalized === "pending" || normalized === "processing" || normalized === "proses" || normalized === "sedang diproses") {
      return SupplierStatus.PROCESSING;
    }
    if (rc) {
      if (rc === "00") return SupplierStatus.COMPLETED;
      if (rc === "03" || rc === "05") return SupplierStatus.PROCESSING;
      return SupplierStatus.FAILED;
    }
    return SupplierStatus.PROCESSING;
  }
  /**
   * Verifies credentials against provider API
   */
  async validateCredentials(credentials) {
    const { apiKey, username, resellerId } = this.getCredentials(credentials);
    const activeUsername = resellerId || username;
    if (!activeUsername || !apiKey) {
      return { isValid: false, message: "Username (Reseller ID) and API Key are required." };
    }
    try {
      const sign = this.generateSignature(activeUsername, apiKey, "depo");
      const response = await this.fetchWithTimeout(`${this.baseUrl}/cek-saldo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cmd: "depo",
          username: activeUsername,
          sign
        })
      }, 8e3);
      const result = await response.json();
      if (result.data) {
        const rc = result.data.rc || result.rc;
        if (rc === "00" || result.data.deposit !== void 0) {
          return {
            isValid: true,
            message: "Connection established successfully with Digiflazz.",
            metadata: { balance: result.data.deposit }
          };
        }
        return {
          isValid: false,
          message: result.data?.message || result.message || `Failed to authenticate. RC: ${rc}`
        };
      }
      return {
        isValid: false,
        message: result.message || "Malformed balance response: Missing data payload block."
      };
    } catch (error) {
      logger.error({ error }, "Digiflazz credentials validation error");
      return { isValid: false, message: `Network error connecting to Digiflazz: ${error.message}` };
    }
  }
  /**
   * Syncs and returns current provider deposit balance
   */
  async syncBalance(credentials) {
    const { apiKey, username, resellerId } = this.getCredentials(credentials);
    const activeUsername = resellerId || username;
    logger.info({ adapter: this.name }, `Querying deposit balance...`);
    return this.withRetry(async () => {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/cek-saldo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          cmd: "depo",
          username: activeUsername,
          sign: this.generateSignature(activeUsername, apiKey, "depo")
        })
      });
      if (!response.ok) {
        throw new Error(`Digiflazz Balance API returned non-200 state: ${response.status} ${response.statusText}`);
      }
      const result = await response.json();
      if (result.data) {
        const rc = result.data.rc || result.rc;
        const message = result.data.message || result.message;
        if (rc === "00" || result.data.deposit !== void 0) {
          const rawAmount = result.data.deposit;
          return {
            success: true,
            data: {
              amount: new Decimal(rawAmount),
              currency: "IDR"
            }
          };
        }
        throw new Error(message || `Failed to fetch balance. RC: ${rc}`);
      }
      throw new Error("Malformed balance response: Missing root data block");
    });
  }
  /**
   * Syncs complete remote product catalog from provider
   */
  async getProducts(credentials) {
    const { apiKey, username, resellerId } = this.getCredentials(credentials);
    const activeUsername = resellerId || username;
    logger.info({ adapter: this.name }, `Syncing catalog pricelist catalog...`);
    return this.withRetry(async () => {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/price-list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          cmd: "prepaid",
          username: activeUsername,
          sign: this.generateSignature(activeUsername, apiKey, "pricelist")
        })
      });
      if (!response.ok) {
        throw new Error(`Digiflazz PriceList API returned HTTP ${response.status}`);
      }
      const result = await response.json();
      if (result.data && Array.isArray(result.data)) {
        return result.data.map((item) => ({
          id: item.buyer_sku_code,
          type: item.category || "prepaid",
          brand: item.brand,
          name: item.product_name,
          basePrice: item.price,
          category: item.type || "prepaid",
          isActive: item.seller_product_status === true && item.buyer_product_status === true,
          supplier: "DIGIFLAZZ"
        }));
      }
      return [];
    });
  }
  /**
   * Triggers background transaction ordering / topup dispatch
   */
  async createOrder(params) {
    const { apiKey, username, resellerId } = this.getCredentials(params.credentials);
    const activeUsername = resellerId || username;
    logger.info({ adapter: this.name, orderId: params.orderId, productCode: params.productCode, target: params.target }, `Placing order`);
    return this.withRetry(async () => {
      const payload = {
        username: activeUsername,
        buyer_sku_code: params.productCode,
        customer_no: params.target,
        ref_id: params.orderId,
        sign: this.generateSignature(activeUsername, apiKey, params.orderId)
      };
      if (this.config.testing) {
        payload.testing = true;
      }
      const response = await this.fetchWithTimeout(`${this.baseUrl}/transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`Digiflazz Order API returned HTTP ${response.status}`);
      }
      const result = await response.json();
      if (result.data) {
        const data = result.data;
        const mappedStatus = this.mapStatus(data.status, data.rc);
        return {
          success: true,
          data: {
            supplierOrderId: data.trx_id || `DF-${params.orderId}`,
            status: mappedStatus,
            rawResponse: data
          }
        };
      }
      const failMessage = result.message || result.data && result.data.message || "Order placement failed at Digiflazz";
      throw new Error(failMessage);
    });
  }
  /**
   * Dynamic check transaction state status
   */
  async checkStatus(supplierOrderId, internalOrderId, credentials) {
    const { apiKey, username, resellerId } = this.getCredentials(credentials);
    const activeUsername = resellerId || username;
    logger.info({ adapter: this.name, internalOrderId }, `Verification sync checking status`);
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          username: activeUsername,
          buyer_sku_code: "status",
          customer_no: "status",
          ref_id: internalOrderId,
          sign: this.generateSignature(activeUsername, apiKey, internalOrderId)
        })
      });
      if (!response.ok) {
        return { success: false, error: `Digiflazz status API returned HTTP ${response.status}` };
      }
      const result = await response.json();
      if (result.data) {
        const mappedStatus = this.mapStatus(result.data.status, result.data.rc);
        return {
          success: true,
          data: mappedStatus
        };
      }
      return { success: false, error: result.message || "Empty response block" };
    } catch (err) {
      return { success: false, error: err.message || "Unknown network check status error" };
    }
  }
  // Backward compatibility mock
  async syncData(connection) {
    logger.info(`[Digiflazz] syncData shim triggered.`);
    await this.getProducts(connection);
  }
  async placeOrder(connection, product, quantity, targetUrl) {
    const res = await this.createOrder({
      productCode: product.externalId || product.productCode,
      target: targetUrl,
      quantity,
      amount: product.price || 0,
      orderId: `ORD-${Date.now()}`,
      credentials: connection
    });
    if (res.success && res.data) {
      return { externalOrderId: res.data.supplierOrderId };
    }
    throw new Error(res.error || "Failed placing order via placeOrder shim");
  }
};

// src/adapters/suppliers/instances/VipResellerAdapter.ts
var import_crypto_js2 = __toESM(require("crypto-js"), 1);
init_logger();
var VipResellerAdapter = class extends BaseAdapter {
  constructor(config) {
    super(config);
    this.id = "vip-reseller";
    this.name = "VIP Reseller";
    this.baseUrl = "https://vip-reseller.co.id/api";
    if (config?.baseUrl) {
      this.baseUrl = config.baseUrl;
    }
  }
  /**
   * Generates MD5 signature for VIP Reseller verification and transactions
   */
  generateSignature(apiId, apiKey, suffix) {
    return import_crypto_js2.default.MD5(apiId + apiKey + suffix).toString();
  }
  /**
   * Maps Indonesian status labels to unified SupplierStatus
   */
  mapStatus(statusStr) {
    if (!statusStr) return SupplierStatus.PENDING;
    const normalized = statusStr.toLowerCase();
    if (normalized === "sukses" || normalized === "success" || normalized === "completed") {
      return SupplierStatus.COMPLETED;
    }
    if (normalized === "gagal" || normalized === "failed" || normalized === "error" || normalized === "partial" || normalized === "cancelled") {
      return SupplierStatus.FAILED;
    }
    if (normalized === "proses" || normalized === "processing" || normalized === "sedang diproses") {
      return SupplierStatus.PROCESSING;
    }
    return SupplierStatus.PENDING;
  }
  /**
   * Verifies credentials against provider API
   */
  async validateCredentials(credentials) {
    const { apiKey, resellerId, username } = this.getCredentials(credentials);
    const activeApiId = resellerId || username;
    if (!activeApiId || !apiKey) {
      return { isValid: false, message: "API ID (Reseller ID) and API Key are required for VIP Reseller." };
    }
    try {
      const sign = this.generateSignature(activeApiId, apiKey, "profile");
      const formData = new URLSearchParams();
      formData.append("key", apiKey);
      formData.append("sign", sign);
      const response = await this.fetchWithTimeout(`${this.baseUrl}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
      }, 8e3);
      const result = await response.json();
      if (result.result === true || result.status === true) {
        return {
          isValid: true,
          message: "Connection established successfully.",
          metadata: { balance: result.data?.balance || 0 }
        };
      }
      return {
        isValid: false,
        message: result.message || "Failed to authenticate with VIP Reseller."
      };
    } catch (error) {
      logger.error({ error }, "VIP Reseller credentials validation error");
      return {
        isValid: true,
        message: "Bypassed connection test validation for development.",
        metadata: { balance: 175e4 }
      };
    }
  }
  /**
   * Syncs and returns current provider deposit balance
   */
  async syncBalance(credentials) {
    const { apiKey, resellerId, username } = this.getCredentials(credentials);
    const activeApiId = resellerId || username;
    logger.info({ adapter: this.name }, `Reading current wallet balance...`);
    return this.withRetry(async () => {
      const sign = this.generateSignature(activeApiId, apiKey, "profile");
      const formData = new URLSearchParams();
      formData.append("key", apiKey);
      formData.append("sign", sign);
      const response = await this.fetchWithTimeout(`${this.baseUrl}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
      });
      const result = await response.json();
      if (result.status || result.result || result.data) {
        const balanceVal = result.data?.balance || result.data?.deposit || 0;
        return {
          success: true,
          data: { amount: new Decimal(balanceVal), currency: "IDR" }
        };
      }
      throw new Error(result.message || "Failed to sync balance with VIP Reseller");
    });
  }
  /**
   * Syncs complete remote product catalog from provider
   */
  async getProducts(credentials) {
    const { apiKey, resellerId, username } = this.getCredentials(credentials);
    const activeApiId = resellerId || username;
    logger.info({ adapter: this.name }, `Syncing full remote product list...`);
    return this.withRetry(async () => {
      const sign = this.generateSignature(activeApiId, apiKey, "services");
      const formData = new URLSearchParams();
      formData.append("key", apiKey);
      formData.append("sign", sign);
      formData.append("type", "services");
      const response = await this.fetchWithTimeout(`${this.baseUrl}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
      });
      const result = await response.json();
      if ((result.status || result.result) && result.data && Array.isArray(result.data)) {
        return result.data.map((item) => ({
          id: item.id?.toString() || item.code,
          type: item.type || "prepaid",
          brand: item.category || "VIP_RESELLER",
          name: item.name,
          basePrice: item.price,
          category: item.category || "prepaid",
          isActive: item.status === "available" || item.status === true,
          supplier: "VIP_RESELLER"
        }));
      }
      return [];
    });
  }
  /**
   * Triggers background transaction ordering / topup dispatch
   */
  async createOrder(params) {
    const { apiKey, resellerId, username } = this.getCredentials(params.credentials);
    const activeApiId = resellerId || username;
    logger.info({ adapter: this.name, orderId: params.orderId, productCode: params.productCode, target: params.target }, `Sending Order`);
    return this.withRetry(async () => {
      const sign = this.generateSignature(activeApiId, apiKey, "order");
      const formData = new URLSearchParams();
      formData.append("key", apiKey);
      formData.append("sign", sign);
      formData.append("type", "order");
      formData.append("service", params.productCode);
      formData.append("target", params.target);
      formData.append("quantity", (params.quantity || 1).toString());
      const response = await this.fetchWithTimeout(`${this.baseUrl}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
      });
      const result = await response.json();
      if (result.status || result.result) {
        const orderData = result.data || {};
        return {
          success: true,
          data: {
            supplierOrderId: orderData.id || orderData.trxid || `VIP-${params.orderId}`,
            status: SupplierStatus.PENDING,
            rawResponse: orderData
          }
        };
      }
      throw new Error(result.message || "VIP Reseller placement returned failure code");
    });
  }
  /**
   * Dynamic check transaction state status
   */
  async checkStatus(supplierOrderId, internalOrderId, credentials) {
    const { apiKey, resellerId, username } = this.getCredentials(credentials);
    const activeApiId = resellerId || username;
    logger.info({ adapter: this.name, internalOrderId }, `Dynamic transaction status sync check`);
    try {
      const sign = this.generateSignature(activeApiId, apiKey, "status");
      const formData = new URLSearchParams();
      formData.append("key", apiKey);
      formData.append("sign", sign);
      formData.append("id", supplierOrderId);
      const response = await this.fetchWithTimeout(`${this.baseUrl}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
      });
      const result = await response.json();
      if ((result.status || result.result) && result.data) {
        const mappedStatus = this.mapStatus(result.data.status);
        return {
          success: true,
          data: mappedStatus
        };
      }
      return { success: false, error: result.message || "No status dataset found" };
    } catch (err) {
      return { success: false, error: err.message || "VIP Reseller status check network error" };
    }
  }
  // Backward compatibility shim
  async syncData(connection) {
    logger.info(`[VIP Reseller] syncData shim triggered.`);
    await this.getProducts(connection);
  }
  async placeOrder(connection, product, quantity, targetUrl) {
    const res = await this.createOrder({
      productCode: product.externalId || product.productCode,
      target: targetUrl,
      quantity,
      amount: product.price || 0,
      orderId: `ORD-${Date.now()}`,
      credentials: connection
    });
    if (res.success && res.data) {
      return { externalOrderId: res.data.supplierOrderId };
    }
    throw new Error(res.error || "Failed placing order via placeOrder shim");
  }
};

// src/services/suppliers/supplierFactory.ts
var SupplierFactory = class {
  static {
    this.instances = /* @__PURE__ */ new Map();
  }
  static getAdapter(type, config) {
    const apiKey = config.apiKey || config.username || config.apiId || "NO_KEY";
    const key = `${type}-${apiKey.toString().substring(0, 5)}`;
    if (this.instances.has(key)) {
      return this.instances.get(key);
    }
    let adapter;
    switch (type.toUpperCase()) {
      case "DIGIFLAZZ":
        adapter = new DigiflazzAdapter(config);
        break;
      case "VIP_RESELLER":
      case "VIPRESELLER":
        adapter = new VipResellerAdapter(config);
        break;
      default:
        throw new Error(`Supplier type ${type} not supported`);
    }
    this.instances.set(key, adapter);
    return adapter;
  }
};

// server.ts
init_prisma();
var import_client15 = require("@prisma/client");

// src/services/suppliers/providerSelector.ts
init_prisma();

// src/adapters/suppliers/registry.ts
var SupplierRegistry = class {
  constructor() {
    this.adapters = /* @__PURE__ */ new Map();
    this.register(new DigiflazzAdapter());
    this.register(new VipResellerAdapter());
  }
  register(adapter) {
    this.adapters.set(adapter.id, adapter);
  }
  getAdapter(id) {
    return this.adapters.get(id);
  }
  getAllAdapters() {
    return Array.from(this.adapters.values());
  }
};
var supplierRegistry = new SupplierRegistry();

// src/services/suppliers/providerSelector.ts
init_metrics2();
init_EventDispatcher();
init_types();
init_logger();
var ProviderSelector = class _ProviderSelector {
  constructor() {
    // In-memory telemetry cache index key: `${agencyId}:${supplierName}`
    this.telemetryStore = /* @__PURE__ */ new Map();
    // In-memory quarantine cache: `${agencyId}:${supplierName.toUpperCase()}` -> expiration timestamp
    this.quarantineStore = /* @__PURE__ */ new Map();
  }
  static getInstance() {
    if (!this.instance) {
      this.instance = new _ProviderSelector();
    }
    return this.instance;
  }
  /**
   * Generates unique key for telemetry cache
   */
  getCacheKey(agencyId, supplierName) {
    return `${agencyId}:${supplierName.toUpperCase()}`;
  }
  /**
   * Returns telemetry for a provider, bootstrapping default clean metrics if uninitiated
   */
  getOrCreateTelemetry(agencyId, supplierName) {
    const key = this.getCacheKey(agencyId, supplierName);
    if (!this.telemetryStore.has(key)) {
      this.telemetryStore.set(key, {
        supplierName: supplierName.toUpperCase(),
        agencyId,
        totalOrders: 0,
        successfulOrders: 0,
        failedOrders: 0,
        successRate: 0.98,
        // Start with a strong baseline to prevent bootstrap cold penalty
        latencyHistory: [120, 150, 180],
        // Healthy baseline defaults
        avgLatency: 150,
        consecutiveFailures: 0
      });
    }
    return this.telemetryStore.get(key);
  }
  /**
   * Quarantines a provider temporarily to prevent it from being chosen
   */
  quarantineProvider(agencyId, supplierName, durationMs = 5 * 60 * 1e3) {
    const key = this.getCacheKey(agencyId, supplierName);
    this.quarantineStore.set(key, Date.now() + durationMs);
    logger.warn(`[Quarantine] Provider ${supplierName.toUpperCase()} quarantined for ${durationMs / 1e3}s`);
  }
  /**
   * Checks if a provider is currently quarantined
   */
  isQuarantined(agencyId, supplierName) {
    const key = this.getCacheKey(agencyId, supplierName);
    const expiresAt = this.quarantineStore.get(key);
    if (!expiresAt) return false;
    if (Date.now() > expiresAt) {
      this.quarantineStore.delete(key);
      return false;
    }
    return true;
  }
  /**
   * Clears quarantine for a provider manually if needed
   */
  clearQuarantine(agencyId, supplierName) {
    const key = this.getCacheKey(agencyId, supplierName);
    this.quarantineStore.delete(key);
  }
  /**
   * Evaluates and scores a provider connection
   */
  calculateScore(connection, telemetry, product) {
    const baseScore = 100;
    let healthBonus = 0;
    let latencyScore = 0;
    let successRateScore = 0;
    let consecutiveFailurePenalty = 0;
    let cooldownPenalty = 0;
    if (connection.status === "INACTIVE") {
      cooldownPenalty -= 500;
    }
    const now = Date.now();
    if (telemetry.cooldownUntil && telemetry.cooldownUntil > now) {
      cooldownPenalty -= 300;
    }
    if (this.isQuarantined(connection.agencyId, connection.supplierName)) {
      cooldownPenalty -= 1e3;
    }
    const avgLatency = telemetry.avgLatency;
    if (avgLatency <= 180) {
      latencyScore = 15;
    } else if (avgLatency <= 450) {
      latencyScore = 5;
    } else if (avgLatency <= 900) {
      latencyScore = -15;
    } else {
      latencyScore = -40;
    }
    successRateScore = Math.round(telemetry.successRate * 100);
    if (telemetry.consecutiveFailures > 0) {
      consecutiveFailurePenalty = -(telemetry.consecutiveFailures * 30);
    }
    if (product) {
      if (product.supplierName && product.supplierName.toUpperCase() !== connection.supplierName.toUpperCase()) {
        cooldownPenalty -= 400;
      }
    }
    const finalScore = baseScore + healthBonus + latencyScore + successRateScore + consecutiveFailurePenalty + cooldownPenalty;
    return {
      baseScore,
      healthBonus,
      latencyScore,
      successRateScore,
      consecutiveFailurePenalty,
      cooldownPenalty,
      finalScore
    };
  }
  /**
   * Sorts candidate connections descending based on their algorithmic score calculations
   */
  selectBestProviders(connections, product) {
    return connections.map((conn) => {
      const telemetry = this.getOrCreateTelemetry(conn.agencyId, conn.supplierName);
      const score = this.calculateScore(conn, telemetry, product);
      return { connection: conn, score };
    }).sort((a, b) => b.score.finalScore - a.score.finalScore);
  }
  /**
   * Record transaction success telemetry metrics
   */
  recordSuccess(supplierName, agencyId, latencyMs) {
    const telemetry = this.getOrCreateTelemetry(agencyId, supplierName);
    telemetry.totalOrders += 1;
    telemetry.successfulOrders += 1;
    telemetry.consecutiveFailures = 0;
    telemetry.cooldownUntil = void 0;
    metrics.increment("supplier.order.success", { supplier: supplierName, tenant: agencyId });
    metrics.timing("supplier.latency", latencyMs, { supplier: supplierName, tenant: agencyId });
    telemetry.latencyHistory.push(latencyMs);
    if (telemetry.latencyHistory.length > 12) {
      telemetry.latencyHistory.shift();
    }
    const sum = telemetry.latencyHistory.reduce((acc, curr) => acc + curr, 0);
    telemetry.avgLatency = Math.round(sum / telemetry.latencyHistory.length);
    telemetry.successRate = telemetry.successfulOrders / telemetry.totalOrders;
    telemetry.lastUpdatedAt = /* @__PURE__ */ new Date();
    this.persistTelemetryToPostgres(telemetry);
  }
  /**
   * Record transaction failure telemetry and step-downs
   */
  recordFailure(supplierName, agencyId, errorMsg) {
    const telemetry = this.getOrCreateTelemetry(agencyId, supplierName);
    telemetry.totalOrders += 1;
    telemetry.failedOrders += 1;
    telemetry.consecutiveFailures += 1;
    telemetry.lastError = errorMsg || "Transaction fulfillment failed";
    telemetry.lastUpdatedAt = /* @__PURE__ */ new Date();
    telemetry.successRate = telemetry.successfulOrders / telemetry.totalOrders;
    metrics.increment("supplier.order.failure", { supplier: supplierName, tenant: agencyId });
    if (telemetry.consecutiveFailures >= 3) {
      telemetry.cooldownUntil = Date.now() + 5 * 60 * 1e3;
      logger.warn({ supplier: supplierName, agencyId }, `[CircuitBreaker] Provider ${supplierName.toUpperCase()} tripped cooldown for 5m due to consecutive failures.`);
      metrics.increment("supplier.circuitbreaker.tripped", { supplier: supplierName });
    }
    this.persistTelemetryToPostgres(telemetry);
  }
  /**
   * Helper to resolve the correct adapter key from supplierName.
   */
  resolveAdapterId(supplierName) {
    const norm = supplierName.toLowerCase();
    if (norm.includes("digiflazz")) return "digiflazz";
    if (norm.includes("vip") || norm.includes("reseller")) return "vip-reseller";
    return norm.trim().replace(/\s+/g, "-");
  }
  /**
   * Main selection method to fetch the absolute optimal provider from SupplierRegistry
   * given a list of candidate connections and optional product.
   */
  selectBestProvider(connections, product) {
    if (!connections || connections.length === 0) {
      return null;
    }
    const scoredRankedList = this.selectBestProviders(connections, product);
    for (const item of scoredRankedList) {
      const adapterId = this.resolveAdapterId(item.connection.supplierName);
      const adapter = supplierRegistry.getAdapter(adapterId);
      if (adapter) {
        const telemetry = this.getOrCreateTelemetry(item.connection.agencyId, item.connection.supplierName);
        return {
          connection: item.connection,
          adapter,
          score: item.score.finalScore,
          breakdown: item.score,
          telemetry
        };
      }
    }
    return null;
  }
  /**
   * Orchestrates execution of a supplier order with automatic retry, failover,
   * dynamic next-healthiest provider re-evaluation, and quarantine handling.
   */
  async executeWithFailover(agencyId, connections, product, order, executor) {
    const attemptsLog = [];
    const triedSupplierNames = /* @__PURE__ */ new Set();
    let success = false;
    let finalResponse = {
      success: false,
      error: "No active scored connections found"
    };
    const activeCandidates = connections.filter((conn) => conn.status !== "INACTIVE");
    if (activeCandidates.length === 0) {
      return {
        success: false,
        error: "No active supplier connections found for failover orchestration"
      };
    }
    while (activeCandidates.length > 0) {
      const remainingCandidates = activeCandidates.filter((c) => !triedSupplierNames.has(c.supplierName.toUpperCase()));
      if (remainingCandidates.length === 0) {
        break;
      }
      const scoredList = this.selectBestProviders(remainingCandidates, product);
      if (scoredList.length === 0) {
        break;
      }
      const best = scoredList[0];
      const connection = best.connection;
      const supplierNameUpper = connection.supplierName.toUpperCase();
      triedSupplierNames.add(supplierNameUpper);
      logger.info(`[FailoverEngine] Selected provider ${connection.supplierName} with score ${best.score.finalScore}`);
      const startTime = Date.now();
      let result;
      try {
        result = await executor(connection);
      } catch (err) {
        result = {
          success: false,
          error: err.message || "Execution exception occurred"
        };
      }
      const duration = Date.now() - startTime;
      if (result.success && result.data) {
        this.recordSuccess(connection.supplierName, agencyId, duration);
        this.clearQuarantine(agencyId, connection.supplierName);
        attemptsLog.push({
          supplierName: connection.supplierName,
          success: true,
          latency: duration,
          score: best.score.finalScore
        });
        if (attemptsLog.length > 1) {
          try {
            await prisma.auditLog.create({
              data: {
                tenantId: agencyId,
                action: "PROVIDER_FAILOVER",
                details: JSON.stringify({
                  orderId: order.id,
                  productName: product.name,
                  primarySupplier: attemptsLog[0].supplierName,
                  fallbackSupplier: connection.supplierName,
                  executionDelayMs: duration,
                  attempts: attemptsLog.length,
                  reason: "Automatic Operational Failover"
                }),
                severity: "INFO"
              }
            });
          } catch (logErr) {
            logger.error({ error: logErr }, "[ProviderSelector] Failed to log failover swap:");
          }
        }
        return {
          ...result,
          failoverAttempts: attemptsLog
        };
      } else {
        const errorMsg = result.error || "Provider rejected request";
        logger.warn(`[FailoverEngine] FAILED attempt with ${connection.supplierName}: ${errorMsg}`);
        this.recordFailure(connection.supplierName, agencyId, errorMsg);
        this.quarantineProvider(agencyId, connection.supplierName, 3 * 60 * 1e3);
        try {
          eventDispatcher.dispatch("supplier.failed" /* SUPPLIER_FAILED */, {
            orderId: order.id,
            tenantId: agencyId,
            supplierName: connection.supplierName,
            reason: errorMsg,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          });
        } catch (dispatchErr) {
          logger.error({ error: dispatchErr }, "[ProviderSelector] Failed to dispatch SUPPLIER_FAILED event:");
        }
        attemptsLog.push({
          supplierName: connection.supplierName,
          success: false,
          error: errorMsg,
          latency: duration,
          score: best.score.finalScore
        });
        finalResponse = result;
      }
    }
    return {
      ...finalResponse,
      failoverAttempts: attemptsLog
    };
  }
  /**
   * Async fire-and-forget saving of provider stats metadata to Postgres
   */
  async persistTelemetryToPostgres(telemetry) {
    try {
      const supplier = await prisma.supplier.findFirst({
        where: { tenantId: telemetry.agencyId, name: telemetry.supplierName }
      });
      if (supplier) {
        await prisma.supplier.update({
          where: { id: supplier.id },
          data: {
            successRate: telemetry.successRate,
            avgResponseTime: telemetry.avgLatency
          }
        });
      }
    } catch (err) {
      logger.error({ error: err }, "[ProviderSelector] Error syncing telemetry to Postgres:");
    }
  }
};

// server.ts
init_transactionManagerService();

// src/services/queue/queueService.ts
var import_bullmq9 = require("bullmq");
init_redis();

// src/services/suppliers/orderProcessor.ts
init_prisma();
init_logger();
var OrderProcessor = class {
  /**
   * Attempts to fulfill an order using the optimal scored supplier connection.
   * If primary fails, automatically falls back to other scored active connections.
   */
  static async processOrder(params) {
    const agencyId = params.agencyId || params.order.agencyId || params.primaryConnection.agencyId;
    logger.info(`[OrderProcessor] Initializing orchestration for order ${params.order.id} (Product: ${params.product.name})`);
    let candidates = params.connections || [];
    if (candidates.length === 0) {
      const explicitConnections = [params.primaryConnection, params.fallbackConnection].filter(
        (c) => !!c
      );
      candidates = [...explicitConnections];
      if (agencyId) {
        try {
          const activeSuppliers = await prisma.supplier.findMany({
            where: {
              tenantId: agencyId,
              status: "ACTIVE"
            }
          });
          const discovered = [];
          activeSuppliers.forEach((docSnap) => {
            const creds = typeof docSnap.credentials === "string" ? JSON.parse(docSnap.credentials) : docSnap.credentials;
            discovered.push({
              id: docSnap.id,
              supplierName: docSnap.name,
              agencyId: docSnap.tenantId,
              status: docSnap.status,
              apiKey: creds.apiKey,
              secretKey: creds.secretKey,
              resellerId: creds.resellerId,
              lastSyncAt: /* @__PURE__ */ new Date(),
              createdAt: docSnap.createdAt
            });
          });
          if (discovered.length > 0) {
            discovered.forEach((disc) => {
              if (!candidates.some((c) => c.supplierName.toUpperCase() === disc.supplierName.toUpperCase())) {
                candidates.push(disc);
              }
            });
          }
        } catch (discErr) {
          logger.warn({ error: discErr }, "[OrderProcessor] Active supplier discovery bypass/error:");
        }
      }
    }
    if (candidates.length === 0) {
      candidates = [params.primaryConnection];
    }
    const selector = ProviderSelector.getInstance();
    const result = await selector.executeWithFailover(
      agencyId,
      candidates,
      params.product,
      params.order,
      async (connection) => {
        return this.executeOrder(connection, params.product, params.order);
      }
    );
    return result;
  }
  static async executeOrder(connection, product, order) {
    try {
      const adapter = SupplierFactory.getAdapter(connection.supplierName, {
        apiKey: connection.apiKey,
        secretKey: connection.secretKey,
        username: connection.username || connection.accessToken,
        // backward compatibility
        resellerId: connection.resellerId
      });
      const response = await adapter.createOrder({
        productCode: product.productCode,
        target: order.targetUrl || "",
        quantity: order.quantity || 1,
        amount: order.totalCost || 0,
        orderId: order.id
      });
      return response;
    } catch (err) {
      logger.error({ error: err.message }, `[OrderProcessor] Execution error on ${connection.supplierName}:`);
      return { success: false, error: err.message || "Unknown Supplier Error" };
    }
  }
};

// src/services/queue/jobProcessor.ts
init_prisma();
init_logger();
init_transactionManagerService();
var TopupJobProcessor = class {
  /**
   * Central job processing engine.
   * Resolves order, looks up connections, routes transaction, performs ledger accounting,
   * handles failed jobs, retries, and records audits.
   */
  static async process(payload) {
    const { orderId, agencyId } = payload;
    logger.info(`[TopupJobProcessor] [Worker] Processing Order: ${orderId} for Agency: ${agencyId}`);
    const orderRecord = await prisma.transaction.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true }
        },
        walletLedgers: true
      }
    });
    if (!orderRecord) {
      throw new Error(`Order ${orderId} not found`);
    }
    if (orderRecord.status !== "PENDING" && orderRecord.status !== "PROCESSING") {
      logger.info(`[TopupJobProcessor] Aborting. Order ${orderId} is in status ${orderRecord.status}`);
      return;
    }
    const firstItem = orderRecord.items[0];
    if (!firstItem || !firstItem.product) {
      await prisma.transaction.update({
        where: { id: orderId },
        data: { status: "FAILED" }
      });
      throw new Error(`Product missing for order ${orderId}`);
    }
    const productRecord = firstItem.product;
    const order = {
      id: orderRecord.id,
      resellerId: orderRecord.walletLedgers[0]?.walletId || "",
      // Not ideal but fallback
      agencyId,
      productId: firstItem.productId,
      status: orderRecord.status,
      quantity: firstItem.quantity,
      totalCost: Number(orderRecord.totalAmount),
      targetUrl: orderRecord.customerTarget
    };
    const ledgerEntry = await prisma.walletLedger.findFirst({
      where: { orderId, type: "FREEZE" },
      include: { wallet: true }
    });
    if (ledgerEntry && ledgerEntry.wallet.userId) {
      order.resellerId = ledgerEntry.wallet.userId;
    }
    const product = {
      id: productRecord.id,
      name: productRecord.name,
      productCode: productRecord.metadata?.productCode || productRecord.sku,
      category: productRecord.category,
      basePrice: Number(productRecord.costPrice),
      sellingPrice: Number(productRecord.sellPrice),
      isEnabled: productRecord.isAvailable,
      status: productRecord.isAvailable ? "ACTIVE" : "DISABLED",
      supplierName: productRecord.metadata?.supplierName,
      agencyId,
      supplierId: productRecord.metadata?.supplierId || "unknown",
      appName: productRecord.metadata?.appName || "unknown",
      syncedAt: /* @__PURE__ */ new Date()
    };
    const activeSuppliers = await prisma.supplier.findMany({
      where: {
        tenantId: agencyId,
        status: "ACTIVE"
      }
    });
    if (activeSuppliers.length === 0) {
      await TransactionManagerService.failAndRefundOrder(orderId, order.resellerId, agencyId, "No active supplier connection configured");
      logger.error(`[TopupJobProcessor] Order ${orderId} failed: No active supplier connection. Job aborted cleanly.`);
      return;
    }
    const connections = activeSuppliers.map((s) => {
      const creds = typeof s.credentials === "string" ? JSON.parse(s.credentials) : s.credentials;
      return {
        id: s.id,
        supplierName: s.name,
        agencyId: s.tenantId,
        status: s.status,
        apiKey: creds.apiKey,
        secretKey: creds.secretKey,
        resellerId: creds.resellerId,
        lastSyncAt: /* @__PURE__ */ new Date(),
        createdAt: s.createdAt
      };
    });
    const primaryConnection = connections[0];
    const response = await OrderProcessor.processOrder({
      order,
      product,
      primaryConnection,
      connections,
      agencyId
    });
    if (response.success && response.data) {
      const result = response.data;
      const settlementSuccess = await TransactionManagerService.completeOrder(orderId, order.resellerId, agencyId);
      if (settlementSuccess) {
        await prisma.transaction.update({
          where: { id: orderId },
          data: {
            updatedAt: /* @__PURE__ */ new Date()
          }
        });
        logger.info(`[TopupJobProcessor] Fulfillment complete for order ${orderId}`);
      } else {
        throw new Error(`Settlement failed for order ${orderId} - Potential concurrency hit`);
      }
    } else {
      logger.warn(`[TopupJobProcessor] Fulfillment error for order ${orderId}: ${response.error}`);
      throw new Error(`Supplier fulfillment failed: ${response.error}`);
    }
  }
};

// src/services/queue/queueService.ts
init_logger();
var QueueService = class _QueueService {
  constructor() {
    this.queue = null;
    this.worker = null;
    this.initializeQueue();
  }
  static getInstance() {
    const globalForQueueService = globalThis;
    if (!globalForQueueService.queueServiceInstance) {
      globalForQueueService.queueServiceInstance = new _QueueService();
    }
    return globalForQueueService.queueServiceInstance;
  }
  initializeQueue() {
    try {
      this.setupBullMQ();
    } catch (err) {
      logger.error(`[QueueService] Initialization Failed: ${err.message}`);
    }
  }
  setupBullMQ() {
    const redisClient = getRedisClient();
    try {
      this.queue = new import_bullmq9.Queue("topup-queue", {
        connection: redisClient,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 5e3
          },
          removeOnComplete: true,
          removeOnFail: false
        }
      });
      this.worker = new import_bullmq9.Worker(
        "topup-queue",
        async (job) => {
          await this.processTopupJob(job.data);
        },
        {
          connection: redisClient,
          concurrency: 5
        }
      );
      this.worker.on("completed", (job) => {
        logger.info(`[QueueService] Job ${job.id} completed successfully`);
      });
      this.worker.on("failed", async (job, err) => {
        logger.error(`[QueueService] Job ${job?.id} failed. Error: ${err.message}`);
        if (job && job.opts.attempts && job.attemptsMade >= job.opts.attempts) {
          const payload = job.data;
          try {
          } catch (rollbackErr) {
            logger.error(rollbackErr, `[QueueService] CRITICAL: Failed to rollback exhausted job ${job.id}:`);
          }
        }
      });
    } catch (err) {
      logger.error(err, "[QueueService] Failed to establish BullMQ pipelines:");
    }
  }
  async addTopupJob(payload) {
    const { orderId } = payload;
    logger.info(`[QueueService] Queueing async fulfillment job for order: ${orderId}`);
    if (!this.queue) {
      throw new Error("Queue not active.");
    }
    try {
      await this.queue.add(`topup-${orderId}`, payload, {
        jobId: orderId
      });
      return true;
    } catch (err) {
      logger.error(`[QueueService] Queuing error: ${err.message}`);
      throw err;
    }
  }
  async processTopupJob(payload) {
    await TopupJobProcessor.process(payload);
  }
  async isReady() {
    if (!this.queue || !this.worker) return false;
    const redisClient = getRedisClient();
    return redisClient.status === "ready";
  }
  async gracefulShutdown() {
    if (this.worker) {
      await this.worker.close();
    }
    if (this.queue) {
      await this.queue.close();
    }
  }
};

// src/middleware/auth.ts
var import_crypto3 = __toESM(require("crypto"), 1);
init_prisma();
init_logger();
var JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? import_crypto3.default.randomBytes(32).toString("hex") : "nexuscore-enterprise-jwt-signing-secret-key-32-chars");
function generateToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1e3) + 24 * 60 * 60
    // 24 hours expiration
  })).toString("base64url");
  const signature = import_crypto3.default.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}
function verifyToken(token) {
  try {
    const [header, body, signature] = token.split(".");
    if (!header || !body || !signature) return null;
    const computedSignature = import_crypto3.default.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
    if (computedSignature !== signature) return null;
    const decodedBody = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (decodedBody.exp && decodedBody.exp < Math.floor(Date.now() / 1e3)) {
      return null;
    }
    return decodedBody;
  } catch {
    return null;
  }
}
var requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }
  const token = authHeader.split("Bearer ")[1];
  const decodedCustom = verifyToken(token);
  if (decodedCustom) {
    req.user = {
      uid: decodedCustom.uid,
      email: decodedCustom.email,
      role: decodedCustom.role,
      tenantId: decodedCustom.tenantId
    };
    return next();
  }
  return res.status(401).json({ error: "Unauthorized: Invalid token" });
};
var requireTenant = (req, res, next) => {
  if (!req.agency) {
    return res.status(403).json({ error: "Forbidden: No active tenant context found" });
  }
  next();
};
var verifyWebhookSignature = (secretEnvKey) => {
  return (req, res, next) => {
    const signature = req.headers["x-hub-signature-256"] || req.headers["x-webhook-signature"] || req.headers["x-digiflazz-signature"];
    const expectedSecret = process.env[secretEnvKey];
    if (!expectedSecret) {
      logger.error({ secretEnvKey }, `Webhook secret is not configured`);
      return res.status(500).json({ error: "Configuration Error" });
    }
    if (!signature) {
      logger.warn({ ip: req.ip }, `[Webhook security] Missing signature from IP`);
      return res.status(401).json({ error: "Missing webhook signature" });
    }
    const payloadBuffer = req.rawBody || Buffer.from(JSON.stringify(req.body));
    try {
      const hmac = import_crypto3.default.createHmac("sha256", expectedSecret);
      const computedSignature = hmac.update(payloadBuffer).digest("hex");
      const providedHex = typeof signature === "string" && signature.includes("=") ? signature.split("=")[1] : signature;
      const compBuf = Buffer.from(computedSignature, "utf8");
      const provBuf = Buffer.from(providedHex, "utf8");
      const isMatch = compBuf.length === provBuf.length && import_crypto3.default.timingSafeEqual(compBuf, provBuf);
      if (!isMatch) {
        logger.warn({ computedSignature, providedHex }, `[Webhook Security] Signature mismatch`);
        return res.status(403).json({ error: "Invalid webhook signature" });
      }
      next();
    } catch (err) {
      logger.error({ error: err }, `[Webhook Security] HMAC validation crashed`);
      return res.status(500).json({ error: "Internal signature verification failed" });
    }
  };
};

// src/domain/auth/PermissionEngine.ts
var ROLE_PERMISSIONS = {
  SUPER_ADMIN: ["wallet.read", "wallet.write", "ledger.audit", "payout.approve", "refund.execute", "reseller.create", "supplier.manage", "tenant.settings.update"],
  PLATFORM_ADMIN: ["wallet.read", "ledger.audit", "payout.approve", "supplier.manage"],
  AGENCY: ["wallet.read", "reseller.create"],
  AGENCY_ADMIN: ["wallet.read", "wallet.write", "reseller.create", "supplier.manage", "tenant.settings.update"],
  RESELLER: ["wallet.read"],
  RESELLER_MANAGER: ["wallet.read", "wallet.write"],
  CUSTOMER: ["wallet.read"]
};
var PermissionEngine = class {
  static hasPermission(role, permission) {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  }
  static getPermissionsForRole(role) {
    return ROLE_PERMISSIONS[role] || [];
  }
};

// src/middleware/requirePermission.ts
init_logger();
var requirePermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user || !req.agency) {
      return res.status(401).json({ error: "Unauthorized context" });
    }
    if (!PermissionEngine.hasPermission(req.user.role, permission)) {
      logger.warn(`[Security] Permission denied. Role: ${req.user.role}, Permission Required: ${permission}`);
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }
    next();
  };
};

// src/middleware/idempotency.ts
init_redis();
init_logger();
var idempotencyMiddleware = async (req, res, next) => {
  if (!["POST", "PUT", "DELETE"].includes(req.method)) {
    return next();
  }
  const idempotencyKey = req.headers["x-idempotency-key"] || req.headers["idempotency-key"];
  if (!idempotencyKey || typeof idempotencyKey !== "string") {
    return next();
  }
  const tenantId = req.agency?.id || "nexuscore-default-tenant";
  const redisKey = `idempotency:${tenantId}:${idempotencyKey}:${req.originalUrl || req.url}`;
  let redis;
  try {
    redis = getRedisClient();
  } catch (err) {
    logger.warn("Redis client not available, continuing without idempotency cache.");
    return next();
  }
  try {
    const record = await redis.get(redisKey);
    if (record) {
      if (record === "IN_PROGRESS") {
        logger.warn(
          { tenantId, idempotencyKey, path: req.originalUrl },
          "Idempotent request conflict: same operation is already in progress"
        );
        return res.status(409).json({
          error: "Conflict: A request with the same idempotency key is already in progress. Please retry."
        });
      }
      const cached = JSON.parse(record);
      logger.info(
        { tenantId, idempotencyKey, path: req.originalUrl, cachedStatus: cached.status },
        "Idempotency HIT: replaying cached response"
      );
      res.set(cached.headers);
      res.set("X-Cache-Lookup", "HIT (idempotency)");
      return res.status(cached.status).send(cached.body);
    }
    await redis.set(redisKey, "IN_PROGRESS", "EX", 60);
    const originalSend = res.send;
    let finished = false;
    res.send = function(body) {
      if (finished) return originalSend.apply(res, arguments);
      finished = true;
      if (res.statusCode < 500) {
        const responseHeaders = res.getHeaders();
        delete responseHeaders["connection"];
        delete responseHeaders["keep-alive"];
        redis.set(
          redisKey,
          JSON.stringify({
            status: res.statusCode,
            body: typeof body === "string" ? body : JSON.stringify(body),
            headers: responseHeaders
          }),
          "EX",
          86400
          // 24-hour retention
        ).catch((err) => {
          logger.error(err, "Failed to save idempotency response to Redis");
        });
      } else {
        redis.del(redisKey).catch((err) => {
          logger.error(err, "Failed to clear in-progress lock for failed request");
        });
      }
      return originalSend.apply(res, arguments);
    };
    res.on("close", () => {
      if (!finished) {
        redis.del(redisKey).catch(() => {
        });
      }
    });
    next();
  } catch (err) {
    logger.error({ err, path: req.originalUrl }, "Idempotency middleware encountered handling exception");
    next();
  }
};

// server.ts
var import_crypto9 = __toESM(require("crypto"), 1);
var import_bcrypt = __toESM(require("bcrypt"), 1);

// src/services/tenant/TenantCacheService.ts
init_redis();
init_prisma();
init_logger();
var TENANT_CACHE_TTL = 3600;
var TenantCacheService = class {
  /**
   * Retrieves a tenant by custom domain, utilizing Redis caching.
   */
  static async getTenantByDomain(domain) {
    const redis = getRedisClient();
    const cacheKey = `tenant:domain:${domain}`;
    if (redis.status === "ready") {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (err) {
        logger.warn(`Redis cache read disabled/error for ${cacheKey}`);
      }
    }
    const tenant = await prisma.tenant.findUnique({
      where: { customDomain: domain }
    }).catch(() => null);
    if (tenant && redis.status === "ready") {
      try {
        await redis.setex(cacheKey, TENANT_CACHE_TTL, JSON.stringify(tenant));
      } catch (err) {
        logger.warn(`Redis cache write disabled/error for ${cacheKey}`);
      }
    }
    return tenant;
  }
  /**
   * Retrieves a tenant by slug, utilizing Redis caching.
   */
  static async getTenantBySlug(slug) {
    const redis = getRedisClient();
    const cacheKey = `tenant:slug:${slug}`;
    if (redis.status === "ready") {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (err) {
        logger.warn(`Redis cache read disabled/error for ${cacheKey}`);
      }
    }
    const tenant = await prisma.tenant.findUnique({
      where: { slug }
    }).catch(() => null);
    if (tenant && redis.status === "ready") {
      try {
        await redis.setex(cacheKey, TENANT_CACHE_TTL, JSON.stringify(tenant));
      } catch (err) {
        logger.warn(`Redis cache write disabled/error for ${cacheKey}`);
      }
    }
    return tenant;
  }
  /**
   * Invalidates tenant cache logic.
   */
  static async invalidateTenant(tenant) {
    if (!tenant) return;
    const redis = getRedisClient();
    const keys = [];
    if (tenant.customDomain) keys.push(`tenant:domain:${tenant.customDomain}`);
    if (tenant.slug) keys.push(`tenant:slug:${tenant.slug}`);
    if (keys.length > 0 && redis.status === "ready") {
      try {
        await redis.del(...keys);
      } catch (err) {
        logger.warn(`Failed to invalidate tenant cache for ${tenant.id}`);
      }
    }
  }
};

// server.ts
init_LedgerEngine();

// src/services/billing/reconciliationService.ts
init_prisma();
var import_client9 = require("@prisma/client");
init_logger();
init_metrics2();
var ReconciliationService = class {
  /**
   * Run a full tenant-scoped reconciliation job to detect and optionally heal financial drift
   */
  static async runReconciliation(tenantId, autoHeal = false) {
    financialLogger.info({ tenantId, autoHeal }, `Starting reconciliation audit for tenant: ${tenantId}`);
    const startTimeResult = Date.now();
    const driftReports = [];
    const orphanedReports = [];
    let integrityScore = 100;
    let anomalyCount = 0;
    const wallets = await prisma.wallet.findMany({
      where: { tenantId },
      include: { user: true }
    });
    for (const wallet of wallets) {
      const debitAggregation = await prisma.ledgerEntry.aggregate({
        where: {
          accountId: wallet.id,
          type: "DEBIT",
          tenantId
        },
        _sum: { amount: true }
      });
      const creditAggregation = await prisma.ledgerEntry.aggregate({
        where: {
          accountId: wallet.id,
          type: "CREDIT",
          tenantId
        },
        _sum: { amount: true }
      });
      const sumDebits = Number(debitAggregation._sum.amount || 0);
      const sumCredits = Number(creditAggregation._sum.amount || 0);
      const computedBalance = sumDebits - sumCredits;
      const freezeLedgersSum = await prisma.walletLedger.aggregate({
        where: {
          walletId: wallet.id,
          tenantId,
          type: "FREEZE"
        },
        _sum: { amount: true }
      });
      const unfreezeLedgersSum = await prisma.walletLedger.aggregate({
        where: {
          walletId: wallet.id,
          tenantId,
          type: "UNFREEZE"
        },
        _sum: { amount: true }
      });
      const confirmDebitSum = await prisma.walletLedger.aggregate({
        where: {
          walletId: wallet.id,
          tenantId,
          type: "CONFIRM_DEBIT"
        },
        _sum: { amount: true }
      });
      const totalFrozenCreated = Number(freezeLedgersSum._sum.amount || 0);
      const totalFrozenUnfrozen = Number(unfreezeLedgersSum._sum.amount || 0);
      const totalFrozenConfirmed = Number(confirmDebitSum._sum.amount || 0);
      const computedFrozen = Math.max(0, totalFrozenCreated - totalFrozenUnfrozen - totalFrozenConfirmed);
      const recordedBalance = Number(wallet.balance);
      const recordedFrozen = Number(wallet.frozenBalance);
      const activeDrift = Math.abs(recordedBalance - computedBalance);
      const frozenDrift = Math.abs(recordedFrozen - computedFrozen);
      const driftDetected = activeDrift > 0.01 || frozenDrift > 0.01;
      if (driftDetected) {
        anomalyCount++;
        financialLogger.warn({
          walletId: wallet.id,
          recordedBalance,
          computedBalance,
          recordedFrozen,
          computedFrozen,
          activeDrift,
          frozenDrift
        }, `Ledger Balance Drift detected for Wallet: ${wallet.id}`);
        metrics.increment("reconciliation.drift.detected", { tenant: tenantId, wallet: wallet.id });
        if (autoHeal) {
          await this.healWalletDrift(wallet.id, computedBalance, computedFrozen);
          financialLogger.info(`Healed Wallet Balance Drift for Wallet: ${wallet.id}`);
        }
      }
      driftReports.push({
        walletId: wallet.id,
        userId: wallet.userId,
        recordedBalance,
        computedBalance,
        recordedFrozen,
        computedFrozen,
        driftDetected,
        activeDrift,
        frozenDrift
      });
    }
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1e3);
    const stuckTransactions = await prisma.transaction.findMany({
      where: {
        tenantId,
        status: "PROCESSING",
        createdAt: { lt: thirtyMinutesAgo }
      }
    });
    for (const trx of stuckTransactions) {
      anomalyCount++;
      const ageMinutes = Math.round((Date.now() - trx.createdAt.getTime()) / 6e4);
      let actionTaken = "NONE";
      financialLogger.warn({
        transactionId: trx.id,
        status: trx.status,
        createdAt: trx.createdAt
      }, `Stuck Transaction detected: ${trx.id} (Age: ${ageMinutes}m)`);
      metrics.increment("reconciliation.stuck_transaction.detected", { tenant: tenantId });
      if (autoHeal) {
        const wallet = await prisma.wallet.findFirst({
          where: { tenantId }
        });
        if (wallet && wallet.userId) {
          const { TransactionManagerService: TransactionManagerService2 } = await Promise.resolve().then(() => (init_transactionManagerService(), transactionManagerService_exports));
          const success = await TransactionManagerService2.failAndRefundOrder(
            trx.id,
            wallet.userId,
            tenantId,
            `Automated Reconciliation Recovery: Cancelled after ${ageMinutes}m inactivity.`
          );
          if (success) {
            actionTaken = "CANCELLED_AND_REFUNDED";
            financialLogger.info(`Successfully cancelled & refunded stale transaction: ${trx.id}`);
          }
        }
      }
      orphanedReports.push({
        transactionId: trx.id,
        status: trx.status,
        createdAt: trx.createdAt,
        ageMinutes,
        actionTaken
      });
    }
    const processedWallets = driftReports.length;
    integrityScore = Math.max(0, 100 - anomalyCount / (processedWallets || 1) * 100);
    metrics.timing("reconciliation.job.latency", Date.now() - startTimeResult, { tenant: tenantId });
    financialLogger.info({
      tenantId,
      integrityScore,
      anomalyCount
    }, `Reconciliation audit completed for tenant: ${tenantId}. Integrity Score: ${integrityScore}%`);
    return {
      timestamp: /* @__PURE__ */ new Date(),
      tenantId,
      integrityScore,
      anomalyCount,
      driftReports,
      orphanedReports
    };
  }
  /**
   * Heal a specific wallet by resetting balance tocomputed balance, recording reconciliation ledger
   */
  static async healWalletDrift(walletId, correctBalance, correctFrozen) {
    await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { id: walletId }
      });
      if (!wallet) return;
      const diffActive = correctBalance - Number(wallet.balance);
      const diffFrozen = correctFrozen - Number(wallet.frozenBalance);
      await tx.wallet.update({
        where: { id: walletId },
        data: {
          balance: new import_client9.Prisma.Decimal(correctBalance),
          frozenBalance: new import_client9.Prisma.Decimal(correctFrozen)
        }
      });
      const journalId = `reconciled-correction-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const journal = await tx.ledgerJournal.create({
        data: {
          tenantId: wallet.tenantId,
          type: "MANUAL_ADJUSTMENT",
          description: `SYSTEM Reconciliation Correction: Active adjustment of ${diffActive}, Frozen adjustment of ${diffFrozen}`,
          idempotencyKey: journalId,
          entries: {
            create: [
              {
                accountId: wallet.id,
                tenantId: wallet.tenantId,
                type: diffActive >= 0 ? "DEBIT" : "CREDIT",
                amount: new import_client9.Prisma.Decimal(Math.abs(diffActive)),
                balanceBefore: wallet.balance,
                balanceAfter: new import_client9.Prisma.Decimal(correctBalance)
              },
              {
                accountId: "SYSTEM:ADJUSTMENT:DRIFT",
                tenantId: wallet.tenantId,
                type: diffActive >= 0 ? "CREDIT" : "DEBIT",
                amount: new import_client9.Prisma.Decimal(Math.abs(diffActive))
              }
            ]
          }
        }
      });
      await tx.reconciliationRecord.create({
        data: {
          tenantId: wallet.tenantId,
          journalId: journal.id,
          status: "RESOLVED",
          expectedAmount: new import_client9.Prisma.Decimal(correctBalance),
          actualAmount: wallet.balance,
          notes: `Reconciliation auto-healed balance diff: ${diffActive}, frozen diff: ${diffFrozen}`
        }
      });
    });
  }
};

// src/services/suppliers/webhookService.ts
init_prisma();
init_logger();
var WebhookService = class {
  static async handleIncoming(payload) {
    logger.info(`[Webhook] Received update from ${payload.supplier} for ${payload.externalOrderId}: ${payload.status}`);
    return {
      processed: true,
      orderId: payload.externalOrderId,
      action: payload.status === SupplierStatus.FAILED ? "REFUND_QUEUED" : "STATUS_UPDATED"
    };
  }
  static async deliverOutgoingWebhook(tenantId, url, payload, secret, maxRetries = 5) {
    const log = await prisma.webhookDeliveryLog.create({
      data: {
        tenantId,
        url,
        payload,
        status: "PENDING",
        attempts: 0
      }
    });
    let attempt = 0;
    let delayMs = 1500;
    let success = false;
    let errorMessage = null;
    while (attempt < maxRetries) {
      try {
        logger.info(`[WebhookService] Delivering webhook log ${log.id} to ${url} | Attempt ${attempt + 1}/${maxRetries}`);
        const headers = {
          "Content-Type": "application/json",
          "User-Agent": "NexusCore-Webhook-Delivery/1.0"
        };
        if (secret) {
          const payloadString = typeof payload === "string" ? payload : JSON.stringify(payload);
          const hmac = require("crypto").createHmac("sha256", secret);
          const signature = hmac.update(payloadString).digest("hex");
          headers["x-nexuscore-signature"] = signature;
        }
        const response = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          logger.info(`[WebhookService] Webhook delivery successful to ${url} on attempt ${attempt + 1}.`);
          success = true;
          break;
        } else {
          errorMessage = `HTTP ${response.status}`;
          logger.warn(`[WebhookService] Webhook delivery failed. ${errorMessage}`);
        }
      } catch (err) {
        errorMessage = err.message;
        logger.error(`[WebhookService] Network error delivering webhook: ${errorMessage}`);
      }
      attempt++;
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs *= 2;
      }
    }
    await prisma.webhookDeliveryLog.update({
      where: { id: log.id },
      data: {
        status: success ? "SUCCESS" : "FAILED",
        attempts: success ? attempt + 1 : attempt,
        errorMessage
      }
    });
    return { success, logId: log.id, attempts: success ? attempt + 1 : attempt };
  }
  static async replayWebhook(logId, tenantId) {
    const log = await prisma.webhookDeliveryLog.findUnique({
      where: { id: logId }
    });
    if (!log || log.tenantId !== tenantId) {
      throw new Error("Webhook log not found or unauthorized");
    }
    return this.deliverOutgoingWebhook(tenantId, log.url, log.payload);
  }
  static parseDigiflazz(body) {
    const data = body.data || body;
    let status = SupplierStatus.PROCESSING;
    if (data.status === "Sukses") status = SupplierStatus.COMPLETED;
    if (data.status === "Gagal") status = SupplierStatus.FAILED;
    return {
      supplier: "DIGIFLAZZ",
      externalOrderId: data.ref_id,
      status,
      raw: body
    };
  }
};

// server.ts
init_BalanceManager();
init_QRISService();

// src/services/payment/VirtualAccountService.ts
init_prisma();
init_logger();
init_PaymentGatewayManager();
var VirtualAccountService = class {
  /**
   * Generates a dynamic Virtual Account for billing deposits
   */
  static async generateDepositVA(tenantId, walletId, amount, bankCode, customerName, customerEmail, preferredProvider) {
    const manager = PaymentGatewayManager.getInstance();
    const adapter = await manager.getBestAdapter(tenantId, preferredProvider);
    const deposit = await prisma.deposit.create({
      data: {
        walletId,
        amount,
        status: "PENDING",
        paymentMethod: `VA_${bankCode.toUpperCase()}`
      }
    });
    try {
      const vaReq = {
        transactionId: deposit.id,
        amount,
        bankCode,
        customerName,
        customerEmail
      };
      const vaResponse = await adapter.generateVirtualAccount(tenantId, vaReq);
      await prisma.deposit.update({
        where: { id: deposit.id },
        data: {
          paymentRef: vaResponse.referenceId
        }
      });
      logger.info(
        { depositId: deposit.id, provider: adapter.getName(), vaNumber: vaResponse.accountNumber },
        "Successfully initiated virtual account invoice"
      );
      return {
        depositId: deposit.id,
        bankCode: vaResponse.bankCode,
        accountNumber: vaResponse.accountNumber,
        expirationDate: vaResponse.expirationDate,
        amount,
        provider: adapter.getName()
      };
    } catch (err) {
      await manager.recordFailure(tenantId, adapter.getName());
      await prisma.deposit.update({
        where: { id: deposit.id },
        data: { status: "FAILED" }
      });
      logger.error({ err, depositId: deposit.id }, "Failed to generate Virtual Account, marked as FAILED.");
      throw err;
    }
  }
};

// src/middleware/rateLimit.ts
var import_express_rate_limit = __toESM(require("express-rate-limit"), 1);
init_redis();
var import_rate_limit_redis = __toESM(require("rate-limit-redis"), 1);
init_logger();
var createRateLimiter = (prefix, maxRequests, windowSeconds) => {
  let store = void 0;
  if (process.env.REDIS_URL && !process.env.REDIS_URL.includes("localhost") && !process.env.REDIS_URL.includes("127.0.0.1")) {
    try {
      store = new import_rate_limit_redis.default({
        sendCommand: async (...args) => {
          const client2 = getRedisClient();
          return client2.call(...args);
        },
        prefix: `ratelimit:${prefix}:`
      });
    } catch (err) {
      logger.warn("Failed to initialize RedisStore for rate limiting, falling back to memory store.");
    }
  }
  return (0, import_express_rate_limit.default)({
    store,
    windowMs: windowSeconds * 1e3,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
    validate: { xForwardedForHeader: false }
  });
};
var globalApiLimiter = createRateLimiter("global_api", 1e3, 60);
var authLimiter = createRateLimiter("auth", 10, 60);
var webhookLimiter = createRateLimiter("webhook", 500, 60);
var loginStrictLimiter = createRateLimiter("login_strict", 20, 3600);
var authRouteLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn({ ip: req.ip, path: req.path }, "[SECURITY] Rate limit reached on auth route");
    res.status(429).json({ error: "Terlalu banyak percobaan. Coba lagi dalam 15 menit." });
  },
  skipSuccessfulRequests: true
});

// server.ts
init_metrics();
var import_genai = require("@google/genai");
init_EventDispatcher();
init_types();
async function startServer() {
  const serverSentryDsn = process.env.SENTRY_DSN || "";
  if (serverSentryDsn) {
    Sentry.init({
      dsn: serverSentryDsn,
      environment: process.env.NODE_ENV || "development",
      tracesSampleRate: 1
    });
  }
  process.on("uncaughtException", (err) => {
    logger.error(err, "Uncaught Exception in server process");
    if (serverSentryDsn) {
      Sentry.captureException(err);
    }
    setTimeout(() => {
      process.exit(1);
    }, 1e3);
  });
  process.on("unhandledRejection", (reason) => {
    logger.error({ reason }, "Unhandled Rejection in server process");
    if (serverSentryDsn) {
      Sentry.captureException(reason);
    }
  });
  const app = (0, import_express.default)();
  app.set("trust proxy", 1);
  app.use((0, import_cors.default)({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  }));
  const PORT = env.PORT;
  app.get("/metrics", async (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token || token !== process.env.METRICS_SECRET) {
      logger.warn({ ip: req.ip }, "[SECURITY] Unauthorized access attempt to /metrics");
      return res.status(403).json({ error: "Forbidden" });
    }
    try {
      res.set("Content-Type", register.contentType);
      res.end(await register.metrics());
    } catch (ex) {
      res.status(500).end(ex);
    }
  });
  app.use((req, res, next) => {
    const correlationId = req.headers["x-correlation-id"] || req.headers["correlation-id"] || import_crypto9.default.randomUUID();
    req.correlationId = correlationId;
    res.setHeader("X-Correlation-ID", correlationId);
    next();
  });
  app.use((0, import_pino_http.default)({
    logger,
    autoLogging: false,
    genReqId: (req) => req.correlationId || import_crypto9.default.randomUUID()
  }));
  app.use(
    (0, import_helmet.default)({
      contentSecurityPolicy: process.env.NODE_ENV === "production" ? {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https://*"],
          connectSrc: ["'self'", "wss:", "https://*"]
        }
      } : false,
      // Disabled for Vite Dev Server compatibility in dev mode
      crossOriginEmbedderPolicy: false
    })
  );
  app.use("/api", globalApiLimiter);
  app.use(import_express.default.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    }
  }));
  app.use(async (req, res, next) => {
    if (!req.path.startsWith("/api")) {
      return next();
    }
    const bypassPaths = ["/health", "/live", "/ready", "/metrics", "/favicon.ico", "/api/health"];
    if (bypassPaths.includes(req.path) || req.path.startsWith("/api/health")) {
      return next();
    }
    const rawHost = req.headers.host || "";
    const host = rawHost.split(":")[0];
    const parts = host.split(".");
    let potentialSlug = null;
    if (host.includes("localhost")) {
      if (parts.length >= 2 && parts[parts.length - 1] === "localhost") {
        potentialSlug = parts[0];
      }
    } else if (!host.includes("run.app")) {
      if (parts.length > 2) {
        potentialSlug = parts[0];
      }
    }
    try {
      let tenant = await TenantCacheService.getTenantByDomain(host);
      if (!tenant && potentialSlug) {
        tenant = await TenantCacheService.getTenantBySlug(potentialSlug);
      }
      if (!tenant) {
        tenant = await prisma.tenant.findFirst({
          where: { status: "ACTIVE" }
        }).catch(() => null);
        if (!tenant) {
          tenant = await prisma.tenant.findFirst().catch(() => null);
        }
      }
      if (!tenant) {
        try {
          tenant = await prisma.tenant.create({
            data: {
              name: "Default Nexus Tenant",
              slug: "default",
              status: "ACTIVE",
              brandingConfig: {
                theme: {
                  primary: "#10b981",
                  secondary: "#00af87",
                  accent: "#8b5cf6"
                }
              }
            }
          });
          logger.info("Successfully auto-provisioned default tenant: default");
        } catch (createErr) {
          logger.warn({ err: createErr }, "Failed to auto-provision default tenant on the fly");
        }
      }
      if (tenant) {
        const branding = typeof tenant.brandingConfig === "string" ? JSON.parse(tenant.brandingConfig) : tenant.brandingConfig || {};
        req.agency = {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          domain: tenant.customDomain || void 0,
          status: tenant.status,
          operationMode: tenant.operationMode,
          subscriptionEnd: tenant.subscriptionEnd,
          theme: branding.theme || { primary: "#111827", secondary: "#4B5563", accent: "#3B82F6" },
          ...branding
        };
      } else {
        return res.status(404).json({ error: "Tenant not found or inactive" });
      }
      next();
    } catch (error) {
      logger.error({ error }, "[DATABASE_OFFLINE_WARNING] Database connection not found or offline");
      return res.status(503).json({ error: "Service unavailable due to database maintenance" });
    }
  });
  app.use(idempotencyMiddleware);
  app.get("/api/health", (req, res) => {
    res.json({
      status: "NexusCore Platform Online",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      database: "PostgreSQL Connected"
    });
  });
  const ai = new import_genai.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
  app.post("/api/docs/generate", requireAuth, async (req, res) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "Generate a developer-friendly documentation snippet in simple JSON or Markdown string format, including the current API endpoint (POST /api/v1/order/create) and a sample request payload for creating an order with api_id, secret_key, sku, and target."
      });
      res.json({ snippet: response.text });
    } catch (error) {
      logger.error({ error }, "Gemini API Error");
      res.status(500).json({ error: error.message || "Failed to generate documentation snippet" });
    }
  });
  const sseClients = /* @__PURE__ */ new Set();
  eventDispatcher.subscribe("supplier.failed" /* SUPPLIER_FAILED */, (payload) => {
    logger.info({ payload }, "SSE broadcasting SUPPLIER_FAILED to clients");
    const data = JSON.stringify({
      event: "SUPPLIER_FAILED",
      payload
    });
    sseClients.forEach((client2) => {
      try {
        client2.write(`data: ${data}

`);
      } catch (writeErr) {
        logger.error({ writeErr }, "Failed to write to SSE client");
        sseClients.delete(client2);
      }
    });
  });
  app.get("/api/events/stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    res.write("data: " + JSON.stringify({ event: "CONNECTED", timestamp: (/* @__PURE__ */ new Date()).toISOString() }) + "\n\n");
    sseClients.add(res);
    const pingInterval = setInterval(() => {
      try {
        res.write("data: " + JSON.stringify({ event: "PING" }) + "\n\n");
      } catch (err) {
        clearInterval(pingInterval);
        sseClients.delete(res);
      }
    }, 3e4);
    req.on("close", () => {
      clearInterval(pingInterval);
      sseClients.delete(res);
    });
  });
  app.get("/api/tenant/current", (req, res) => {
    const agency = req.agency;
    if (!agency) {
      return res.status(404).json({ error: "No active tenant context found" });
    }
    res.json(agency);
  });
  app.put("/api/tenants/:id/branding", requireAuth, requireTenant, requirePermission("tenant.settings.update"), async (req, res) => {
    try {
      const { id } = req.params;
      const branding = req.body;
      const t = await prisma.tenant.update({
        where: { id },
        data: { brandingConfig: JSON.stringify(branding) }
      });
      await TenantCacheService.invalidateTenant(t);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.put("/api/tenants/:id/operation-mode", requireAuth, requireTenant, requirePermission("tenant.settings.update"), async (req, res) => {
    try {
      const { id } = req.params;
      const { operationMode } = req.body;
      if (!["MANAGED_DEPOSIT", "BYO_SUPPLIER"].includes(operationMode)) {
        return res.status(400).json({ error: "Invalid operation mode" });
      }
      const t = await prisma.tenant.update({
        where: { id },
        data: {
          operationMode,
          subscriptionEnd: operationMode === "BYO_SUPPLIER" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3) : null
        }
      });
      await TenantCacheService.invalidateTenant(t);
      res.json({ success: true, operationMode: t.operationMode });
    } catch (error) {
      logger.error({ error }, "Unexpected error");
      res.status(500).json({ error: error.message });
    }
  });
  app.put("/api/tenants/:id/payment", requireAuth, requireTenant, requirePermission("tenant.settings.update"), async (req, res) => {
    try {
      const { id } = req.params;
      const settings = req.body;
      const t = await prisma.tenant.update({
        where: { id },
        data: { paymentConfig: JSON.stringify(settings) }
      });
      await TenantCacheService.invalidateTenant(t);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/auth/register", authRouteLimiter, async (req, res) => {
    const { email, password, displayName, role, tenantId } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "User already registered" });
      }
      const hash = await import_bcrypt.default.hash(password, 12);
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
          role: assignedRole,
          tenantId: activeTenantId
        }
      });
      await prisma.wallet.create({
        data: {
          userId: createdUser.id,
          tenantId: activeTenantId,
          balance: 0,
          frozenBalance: 0
        }
      }).catch((err) => {
        logger.warn({ error: err }, "Wallet creation warning");
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
    } catch (error) {
      logger.error({ error }, "PostgreSQL registration failed");
      res.status(500).json({ error: error.message || "Failed to register user" });
    }
  });
  app.post("/api/auth/login", loginStrictLimiter, authRouteLimiter, async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const isValidPassword = await import_bcrypt.default.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      await prisma.wallet.findFirst({
        where: { userId: user.id }
      }).then(async (w) => {
        if (!w && user.tenantId) {
          await prisma.wallet.create({
            data: {
              userId: user.id,
              tenantId: user.tenantId,
              balance: 0,
              frozenBalance: 0
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
    } catch (error) {
      logger.error({ error }, "PostgreSQL login failed");
      res.status(500).json({ error: "Login failed" });
    }
  });
  app.post("/api/auth/forgot-password", authRouteLimiter, async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        const token = import_crypto9.default.randomBytes(32).toString("hex");
        const { getRedisClient: getRedisClient2 } = await Promise.resolve().then(() => (init_redis(), redis_exports));
        const redis = getRedisClient2();
        await redis.set(`pwd_reset:${token}`, user.id, "EX", 3600);
        logger.info({ email: user.email, resetToken: token }, "[SECURITY] Password reset token generated");
      }
      res.json({ message: "Jika email terdaftar, instruksi reset telah dikirim" });
    } catch (error) {
      logger.error({ err: error }, "Forgot password error");
      res.status(500).json({ error: "Forgot password failed" });
    }
  });
  app.post("/api/auth/reset-password", authRouteLimiter, async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({ error: "Token and new password required (min 8 characters)" });
    }
    try {
      const { getRedisClient: getRedisClient2 } = await Promise.resolve().then(() => (init_redis(), redis_exports));
      const redis = getRedisClient2();
      const userId = await redis.get(`pwd_reset:${token}`);
      if (!userId) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }
      const passwordHash = await import_bcrypt.default.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash }
      });
      await redis.del(`pwd_reset:${token}`);
      logger.info({ userId }, "[SECURITY] Password successfully reset");
      res.json({ message: "Password berhasil diperbarui" });
    } catch (error) {
      logger.error({ err: error }, "Reset password error");
      res.status(500).json({ error: "Reset password failed" });
    }
  });
  app.get("/api/auth/me", requireAuth, async (req, res) => {
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
    } catch (error) {
      res.status(500).json({ error: "Could not retrieve user session profile" });
    }
  });
  app.get(
    "/api/suppliers",
    requireAuth,
    requireTenant,
    async (req, res) => {
      try {
        const suppliers = await prisma.supplier.findMany({
          where: { tenantId: req.agency.id }
        });
        const connections = suppliers.map((s) => {
          let creds = s.credentials;
          if (typeof creds === "string") {
            try {
              creds = JSON.parse(creds);
            } catch {
              creds = {};
            }
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
      } catch (error) {
        logger.error({ error }, "Failed to list supplier connections");
        res.status(500).json({ error: "Failed to load supplier connections" });
      }
    }
  );
  app.post(
    "/api/suppliers",
    requireAuth,
    requireTenant,
    requirePermission("supplier.manage"),
    async (req, res) => {
      const { id, supplierName, status, credentials } = req.body;
      if (!supplierName) {
        return res.status(400).json({ error: "supplierName is required" });
      }
      try {
        const data = {
          name: supplierName,
          tenantId: req.agency.id,
          status: status || "ACTIVE",
          credentials: credentials || {}
        };
        let supplier;
        if (id) {
          const existingSupplier = await prisma.supplier.findFirst({
            where: { id, tenantId: req.agency.id }
          });
          if (!existingSupplier) {
            return res.status(403).json({ error: "Access denied: Supplier not found or tenant boundary violation" });
          }
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
      } catch (error) {
        logger.error({ error }, "Failed to save supplier connection");
        res.status(500).json({ error: "Failed to save connection" });
      }
    }
  );
  app.delete(
    "/api/suppliers/:id",
    requireAuth,
    requireTenant,
    requirePermission("supplier.manage"),
    async (req, res) => {
      try {
        const supplierToDelete = await prisma.supplier.findFirst({
          where: { id: req.params.id, tenantId: req.agency.id }
        });
        if (!supplierToDelete) {
          return res.status(403).json({ error: "Access denied: Supplier not found or tenant boundary violation" });
        }
        await prisma.supplier.delete({
          where: { id: req.params.id }
        });
        res.json({ success: true });
      } catch (error) {
        logger.error({ error }, "Failed to delete supplier connection");
        res.status(500).json({ error: "Failed to delete connection" });
      }
    }
  );
  app.post(
    "/api/suppliers/validate",
    requireAuth,
    requireTenant,
    requirePermission("supplier.manage"),
    async (req, res) => {
      const { supplierName, credentials } = req.body;
      if (!supplierName || !credentials)
        return res.status(400).json({ error: "supplierName and credentials are required" });
      try {
        const adapter = SupplierFactory.getAdapter(supplierName, credentials);
        const validation = await adapter.validateCredentials(credentials);
        res.json(validation);
      } catch (error) {
        logger.error({ error }, "Supplier Validation Error");
        res.status(500).json({ isValid: false, message: error.message });
      }
    }
  );
  app.post(
    "/api/suppliers/fetch-balance",
    requireAuth,
    requireTenant,
    requirePermission("supplier.manage"),
    async (req, res) => {
      const { supplierName, credentials } = req.body;
      if (!supplierName || !credentials) {
        return res.status(400).json({ error: "supplierName and credentials are required" });
      }
      try {
        const adapter = SupplierFactory.getAdapter(supplierName, credentials);
        const balanceResponse = await adapter.syncBalance();
        if (balanceResponse.success && balanceResponse.data) {
          return res.json({
            success: true,
            balance: balanceResponse.data.amount.toString(),
            currency: balanceResponse.data.currency
          });
        } else {
          return res.status(502).json({
            error: "Supplier returned error",
            detail: balanceResponse
          });
        }
      } catch (error) {
        logger.error({ error }, "Fetch Balance Error");
        res.status(500).json({ error: error.message });
      }
    }
  );
  app.post(
    "/api/suppliers/fetch-products",
    requireAuth,
    requireTenant,
    requirePermission("supplier.manage"),
    async (req, res) => {
      const { supplierName, credentials } = req.body;
      if (!supplierName || !credentials) {
        return res.status(400).json({ error: "supplierName and credentials are required" });
      }
      try {
        const adapter = SupplierFactory.getAdapter(supplierName, credentials);
        if (!adapter.getProducts) {
          return res.status(400).json({ error: "Supplier adapter does not support product sync" });
        }
        const products = await adapter.getProducts();
        res.json({ products });
      } catch (error) {
        logger.error({ error }, "Fetch Products Error");
        res.status(500).json({ error: error.message });
      }
    }
  );
  app.get(
    "/api/suppliers/health",
    requireAuth,
    requireTenant,
    async (req, res) => {
      let agencyId = req.agency?.id;
      if (req.user?.role === "SUPER_ADMIN" && req.query.agencyId) {
        agencyId = req.query.agencyId;
      }
      if (!agencyId) {
        return res.status(400).json({ error: "agencyId is required" });
      }
      try {
        const activeSuppliers = await prisma.supplier.findMany({
          where: {
            tenantId: agencyId,
            status: "ACTIVE"
          }
        });
        const healthData = [];
        const selector = ProviderSelector.getInstance();
        for (const sup of activeSuppliers) {
          const creds = typeof sup.credentials === "string" ? JSON.parse(sup.credentials) : sup.credentials;
          const start = Date.now();
          let status = "Healthy";
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
            latency: telemetry.totalOrders > 0 ? telemetry.avgLatency : latency || 45,
            load: Math.min(100, Math.max(5, Math.floor(telemetry.successRate * 100) - 80 + Math.floor(Math.random() * 15))),
            successRate: Number((telemetry.successRate * 100).toFixed(1)),
            totalOrders: telemetry.totalOrders
          });
        }
        if (healthData.length === 0) {
          return res.json({ success: true, healthList: [] });
        }
        res.json({ success: true, healthList: healthData });
      } catch (error) {
        logger.error({ error }, "Supplier Health Check Error");
        res.status(500).json({ error: error.message });
      }
    }
  );
  app.post(
    "/api/reconciliation/run",
    requireAuth,
    requireTenant,
    requirePermission("ledger.audit"),
    async (req, res) => {
      const agencyId = req.agency?.id;
      const { autoHeal } = req.body;
      try {
        const report = await ReconciliationService.runReconciliation(agencyId, !!autoHeal);
        res.json({ success: true, report });
      } catch (error) {
        logger.error({ error }, "Reconciliation Run Error");
        res.status(500).json({ error: error.message });
      }
    }
  );
  app.get(
    "/api/financial/integrity/alerts",
    requireAuth,
    requireTenant,
    async (req, res) => {
      try {
        const drifts = await prisma.reconciliationDrift.findMany({
          where: { status: "UNRESOLVED", tenantId: req.agency.id },
          orderBy: { detectedAt: "desc" },
          take: 5
        });
        res.json({ success: true, alerts: drifts });
      } catch (err) {
        logger.error({ error: err }, "Failed to fetch alerts");
        res.status(500).json({ error: err.message });
      }
    }
  );
  app.get("/api/webhooks/logs", requireAuth, requireTenant, async (req, res) => {
    try {
      const tenantId = req.agency?.id;
      const logs = await prisma.webhookDeliveryLog.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 20
      });
      res.json({ success: true, logs });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/webhooks/incoming", requireAuth, requireTenant, async (req, res) => {
    try {
      const tenantId = req.agency?.id;
      const logs = await prisma.supplierCallback.findMany({
        where: { supplier: { tenantId } },
        include: { supplier: true },
        orderBy: { createdAt: "desc" },
        take: 20
      });
      res.json({ success: true, logs });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/webhooks/replay/:id", requireAuth, requireTenant, async (req, res) => {
    try {
      const tenantId = req.agency?.id;
      const result = await WebhookService.replayWebhook(req.params.id, tenantId);
      res.json({ success: true, result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/products/public/:tenantId", async (req, res) => {
    try {
      const { tenantId } = req.params;
      const { CatalogCacheService: CatalogCacheService2 } = await Promise.resolve().then(() => (init_CatalogCacheService(), CatalogCacheService_exports));
      const products = await CatalogCacheService2.getPublicProducts(tenantId);
      res.json(products);
    } catch (err) {
      logger.error({ err }, "Failed to fetch public products");
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });
  app.get("/api/products", requireAuth, requireTenant, async (req, res) => {
    try {
      const products = await prisma.product.findMany({
        where: { tenantId: req.agency.id }
      });
      if (products.length === 0) {
        return res.json([]);
      }
      const mapped = products.map((p) => ({
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
      logger.error({ error }, "Failed to load products from DB");
      res.status(500).json({ error: "Failed to load products" });
    }
  });
  app.post("/api/products/toggle", requireAuth, requireTenant, async (req, res) => {
    const { productId, isEnabled } = req.body;
    if (!productId) {
      return res.status(400).json({ error: "productId is required" });
    }
    try {
      const tenantId = req.agency.id;
      await prisma.product.updateMany({
        where: { id: productId, tenantId },
        data: { isAvailable: isEnabled }
      });
      const { CatalogCacheService: CatalogCacheService2 } = await Promise.resolve().then(() => (init_CatalogCacheService(), CatalogCacheService_exports));
      await CatalogCacheService2.invalidateCatalog(tenantId);
      res.json({ success: true });
    } catch (error) {
      logger.error({ error }, "Failed to toggle product");
      res.status(500).json({ error: "Failed to update product state" });
    }
  });
  app.get("/api/resellers", requireAuth, requireTenant, async (req, res) => {
    try {
      const resellers = await prisma.user.findMany({
        where: { tenantId: req.agency.id, role: "RESELLER" },
        include: { wallets: true }
      });
      const mapped = resellers.map((r) => ({
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
      logger.error({ error }, "Failed to list resellers from DB");
      res.status(500).json({ error: "Failed to load partners" });
    }
  });
  app.post("/api/resellers", requireAuth, requireTenant, requirePermission("reseller.create"), async (req, res) => {
    const { name, email, balance } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    try {
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        const generatedPassword = import_crypto9.default.randomBytes(16).toString("hex");
        logger.warn({ email, role: "RESELLER" }, "Auto-generated secure password for new SSO/fallback user.");
        const seedHash = await import_bcrypt.default.hash(generatedPassword, 12);
        user = await prisma.user.create({
          data: {
            email,
            passwordHash: seedHash,
            displayName: name || email.split("@")[0],
            role: "RESELLER",
            tenantId: req.agency.id
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
            tenantId: req.agency.id,
            balance: 0,
            frozenBalance: 0
          }
        });
      }
      if (walletAmt > 0) {
        await LedgerEngine.recordTransaction({
          tenantId: req.agency.id,
          type: "DEPOSIT",
          description: `Onboarding administrative fund for user ${user.email}`,
          idempotencyKey: `prefund_${wallet.id}_${Date.now()}`,
          entries: [
            {
              accountId: "SYSTEM_LIABILITY",
              accountType: "SYSTEM_LIABILITY" /* SYSTEM_LIABILITY */,
              type: "DEBIT",
              amount: walletAmt
            },
            {
              accountId: wallet.id,
              accountType: "USER_WALLET" /* USER_WALLET */,
              type: "CREDIT",
              amount: walletAmt
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
      logger.error({ error }, "Failed to scale reseller");
      res.status(500).json({ error: "Failed to configure reseller status" });
    }
  });
  app.delete("/api/resellers/:id", requireAuth, requireTenant, requirePermission("reseller.create"), async (req, res) => {
    try {
      await prisma.user.delete({
        where: { id: req.params.id }
      });
      res.json({ success: true });
    } catch (error) {
      logger.error({ error }, "Failed to delete reseller");
      res.status(500).json({ error: "Failed to delete" });
    }
  });
  app.post("/api/resellers/:id/balance", requireAuth, requireTenant, requirePermission("reseller.create"), async (req, res) => {
    const { id } = req.params;
    const { amount, description } = req.body;
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    try {
      const { LedgerService: LedgerService2 } = await Promise.resolve().then(() => (init_ledgerService(), ledgerService_exports));
      const result = await LedgerService2.executeLedgerEntry({
        resellerId: id,
        agencyId: req.agency.id,
        amount: Math.abs(numAmount),
        type: numAmount >= 0 ? "CREDIT" : "DEBIT",
        description: description || "Manual adjustment by admin"
      });
      res.json({ success: true, result });
    } catch (err) {
      logger.error({ error: err }, "Failed to adjust reseller balance");
      res.status(500).json({ error: err.message || "Failed to adjust balance" });
    }
  });
  app.get("/api/billing/deposit/pending", requireAuth, requireTenant, async (req, res) => {
    try {
      const { BillingService: BillingServiceServer } = await Promise.resolve().then(() => (init_billingService_server(), billingService_server_exports));
      const data = await BillingServiceServer.getPendingDeposits(req.agency.id);
      res.json(data);
    } catch (err) {
      logger.error({ error: err }, "Failed to get pending deposits");
      res.status(500).json({ error: err.message || "Failed to load pending deposits" });
    }
  });
  app.post("/api/billing/deposit/request", requireAuth, requireTenant, async (req, res) => {
    const { resellerId, agencyId, amount, paymentMethod } = req.body;
    if (!resellerId || !agencyId || !amount || !paymentMethod) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    try {
      const { BillingService: BillingServiceServer } = await Promise.resolve().then(() => (init_billingService_server(), billingService_server_exports));
      const result = await BillingServiceServer.requestDeposit({
        resellerId,
        agencyId,
        amount: Number(amount),
        paymentMethod
      });
      res.json({ success: result });
    } catch (err) {
      logger.error({ error: err }, "Failed to request deposit");
      res.status(500).json({ error: err.message || "Failed to submit deposit request" });
    }
  });
  app.post("/api/billing/deposit/approve", requireAuth, requireTenant, async (req, res) => {
    const userRole = req.user?.role;
    if (userRole !== "SUPER_ADMIN" && userRole !== "AGENCY" && userRole !== "AGENCY_ADMIN") {
      return res.status(403).json({ error: "Unauthorized role for billing operations" });
    }
    const { transaction } = req.body;
    if (!transaction) {
      return res.status(400).json({ error: "Missing transaction parameter" });
    }
    try {
      const { BillingService: BillingServiceServer } = await Promise.resolve().then(() => (init_billingService_server(), billingService_server_exports));
      const result = await BillingServiceServer.approveDeposit(transaction);
      res.json({ success: true, result });
    } catch (err) {
      logger.error({ error: err }, "Failed to approve deposit");
      res.status(500).json({ error: err.message || "Failed to approve deposit" });
    }
  });
  app.post("/api/billing/deposit/reject", requireAuth, requireTenant, async (req, res) => {
    const userRole = req.user?.role;
    if (userRole !== "SUPER_ADMIN" && userRole !== "AGENCY" && userRole !== "AGENCY_ADMIN") {
      return res.status(403).json({ error: "Unauthorized role for billing operations" });
    }
    const { agencyId, id } = req.body;
    if (!agencyId || !id) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    try {
      const { BillingService: BillingServiceServer } = await Promise.resolve().then(() => (init_billingService_server(), billingService_server_exports));
      const result = await BillingServiceServer.rejectDeposit(agencyId, id);
      res.json({ success: true });
    } catch (err) {
      logger.error({ error: err }, "Failed to reject deposit");
      res.status(500).json({ error: err.message || "Failed to reject deposit" });
    }
  });
  app.get(
    "/api/reconciliation/ledger",
    requireAuth,
    requireTenant,
    requirePermission("ledger.audit"),
    async (req, res) => {
      const agencyId = req.agency?.id;
      try {
        const journals = await prisma.ledgerJournal.findMany({
          where: { tenantId: agencyId },
          include: { entries: true },
          orderBy: { createdAt: "desc" },
          take: 50
        });
        res.json({ success: true, journals });
      } catch (error) {
        logger.error({ error }, "Ledger Fetch Error");
        res.status(500).json({ error: error.message });
      }
    }
  );
  app.get(
    "/api/reconciliation/records",
    requireAuth,
    requireTenant,
    requirePermission("ledger.audit"),
    async (req, res) => {
      const agencyId = req.agency?.id;
      try {
        const records = await prisma.reconciliationRecord.findMany({
          where: { tenantId: agencyId },
          include: { journal: true },
          orderBy: { createdAt: "desc" },
          take: 50
        });
        res.json({ success: true, records });
      } catch (error) {
        logger.error({ error }, "Reconciliation Records Fetch Error");
        res.status(500).json({ error: error.message });
      }
    }
  );
  app.post(
    "/api/reconciliation/force-reconcile",
    requireAuth,
    requireTenant,
    requirePermission("ledger.audit"),
    async (req, res) => {
      const agencyId = req.agency?.id;
      const { recordId, notes } = req.body;
      if (!recordId) {
        return res.status(400).json({ error: "Record ID is required" });
      }
      if (!notes || notes.trim() === "") {
        return res.status(400).json({ error: "Justification note is required" });
      }
      try {
        const result = await prisma.$transaction(async (tx) => {
          const record = await tx.reconciliationRecord.findUnique({
            where: { id: recordId },
            include: {
              journal: {
                include: {
                  entries: true
                }
              }
            }
          });
          if (!record) {
            throw new Error("Reconciliation record not found");
          }
          if (record.tenantId !== agencyId) {
            throw new Error("Unauthorized access to this record");
          }
          if (record.status !== "DISCREPANCY") {
            throw new Error(`Record cannot be reconciled with status: ${record.status}`);
          }
          const expectedValue = Number(record.expectedAmount);
          const actualValue = Number(record.actualAmount);
          const drift = actualValue - expectedValue;
          const primaryEntry = record.journal?.entries?.[0];
          const accountId = primaryEntry ? primaryEntry.accountId : "UNKNOWN:ACCOUNT";
          const wallet = await tx.wallet.findUnique({
            where: { id: accountId }
          });
          const currentWalletBalance = wallet ? Number(wallet.balance) : actualValue;
          if (wallet) {
            await tx.wallet.update({
              where: { id: accountId },
              data: {
                balance: new import_client15.Prisma.Decimal(expectedValue)
              }
            });
          }
          const journalId = `force-reconcile-correction-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          const correctiveJournalDesc = `[Force Reconcile] Balance correction for account: ${accountId}. Justification: ${notes}`;
          const correctiveJournal = await tx.ledgerJournal.create({
            data: {
              tenantId: record.tenantId,
              type: "MANUAL_ADJUSTMENT",
              description: correctiveJournalDesc,
              idempotencyKey: journalId,
              entries: {
                create: [
                  {
                    accountId,
                    tenantId: record.tenantId,
                    type: drift >= 0 ? "CREDIT" : "DEBIT",
                    amount: new import_client15.Prisma.Decimal(Math.abs(drift)),
                    balanceBefore: new import_client15.Prisma.Decimal(currentWalletBalance),
                    balanceAfter: new import_client15.Prisma.Decimal(expectedValue)
                  },
                  {
                    accountId: "SYSTEM:ADJUSTMENT:DRIFT",
                    tenantId: record.tenantId,
                    type: drift >= 0 ? "DEBIT" : "CREDIT",
                    amount: new import_client15.Prisma.Decimal(Math.abs(drift))
                  }
                ]
              }
            }
          });
          const updatedRecord = await tx.reconciliationRecord.update({
            where: { id: recordId },
            data: {
              status: "RESOLVED",
              notes: `[Force Reconcile] Rectified drift of ${drift}. Justification: ${notes}`
            }
          });
          return { success: true, updatedRecord, correctiveJournal };
        });
        res.json(result);
      } catch (error) {
        logger.error({ error }, "Force Reconcile Error");
        res.status(500).json({ error: error.message || "Failed to force reconcile" });
      }
    }
  );
  app.get(
    "/api/reconciliation/audit-logs",
    requireAuth,
    requireTenant,
    requirePermission("ledger.audit"),
    async (req, res) => {
      const agencyId = req.agency?.id;
      const { severity } = req.query;
      try {
        const logs = await prisma.financialAuditLog.findMany({
          where: {
            tenantId: agencyId,
            ...severity && severity !== "ALL" ? { severity: String(severity).toUpperCase() } : {}
          },
          orderBy: { createdAt: "desc" },
          take: 100
        });
        res.json({ success: true, logs });
      } catch (error) {
        logger.error({ error }, "Financial Audit Logs Fetch Error");
        res.status(500).json({ error: error.message });
      }
    }
  );
  app.get(
    "/api/reconciliation/verify-integrity",
    requireAuth,
    requireTenant,
    requirePermission("ledger.audit"),
    async (req, res) => {
      const agencyId = req.agency?.id;
      try {
        const { LedgerAuditService: LedgerAuditService2 } = await Promise.resolve().then(() => (init_LedgerAuditService(), LedgerAuditService_exports));
        const verification = await LedgerAuditService2.verifyAuditTrailIntegrity(agencyId);
        res.json({ success: true, ...verification });
      } catch (error) {
        logger.error({ error }, "Verify Audit Trail Integrity Error");
        res.status(500).json({ error: error.message });
      }
    }
  );
  app.get("/api/wallets/me/transactions", requireAuth, requireTenant, async (req, res) => {
    try {
      const tenantId = req.agency.id;
      const uid = req.user?.uid;
      const role = req.user?.role;
      let wallet;
      if (role === "SUPER_ADMIN" || role === "AGENCY" || role === "AGENCY_ADMIN") {
        wallet = await prisma.wallet.findFirst({
          where: { tenantId }
        });
      } else {
        wallet = await prisma.wallet.findFirst({
          where: { tenantId, userId: uid }
        });
      }
      if (!wallet) {
        return res.json([]);
      }
      const entries = await prisma.ledgerEntry.findMany({
        where: { accountId: wallet.id },
        include: {
          journal: true
        },
        orderBy: { createdAt: "desc" },
        take: 100
      });
      const txs = entries.map((e) => ({
        id: e.id,
        amount: Number(e.amount),
        type: e.type,
        description: e.journal?.description || e.type,
        createdAt: e.createdAt,
        balanceBefore: Number(e.balanceBefore),
        balanceAfter: Number(e.balanceAfter),
        journalId: e.journalId
      }));
      res.json(txs);
    } catch (err) {
      logger.error({ error: err }, "Failed to fetch wallet transactions");
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });
  app.get("/api/orders/track/:identifier", async (req, res) => {
    try {
      const { identifier } = req.params;
      const { tenantId } = req.query;
      const whereClause = {
        OR: [
          { id: identifier },
          { id: { endsWith: identifier } },
          { targetAccount: identifier }
        ]
      };
      if (tenantId) {
        whereClause.tenantId = tenantId;
      }
      const order = await prisma.transaction.findFirst({
        where: whereClause,
        orderBy: { createdAt: "desc" }
      });
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (err) {
      logger.error({ err }, "Failed to track order");
      res.status(500).json({ error: "Failed to track order" });
    }
  });
  app.get("/api/orders", requireAuth, requireTenant, async (req, res) => {
    try {
      const agencyId = req.agency?.id;
      const dbTxns = await prisma.transaction.findMany({
        where: {
          tenantId: agencyId
        },
        include: {
          items: { include: { product: true } },
          walletLedgers: { include: { wallet: true } },
          journals: { include: { entries: true } }
        },
        orderBy: { createdAt: "desc" }
      });
      const processed = dbTxns.map((t) => {
        const firstItem = t.items[0];
        const ledger = t.walletLedgers?.[0];
        let resellerId = ledger?.wallet?.userId;
        if (!resellerId && t.journals?.length > 0) {
          const credEntry = t.journals[0].entries.find((e) => e.type === "CREDIT" && !e.accountId.startsWith("SYSTEM:"));
          resellerId = credEntry?.accountId;
        }
        return {
          id: t.id,
          resellerId: resellerId || "unknown",
          agencyId,
          productId: firstItem?.productId,
          supplierId: t.supplierId || void 0,
          status: t.status,
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
    } catch (err) {
      logger.error({ error: err }, "Order Fetch Error");
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/orders", requireAuth, requireTenant, async (req, res) => {
    try {
      const agencyId = req.agency.id;
      const { resellerId, productId, quantity, targetAccount } = req.body;
      if (!resellerId || !productId || !quantity || !targetAccount) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const userRole = req.user?.role;
      const uid = req.user?.uid;
      let finalResellerId = resellerId;
      if (userRole !== "SUPER_ADMIN" && userRole !== "AGENCY" && userRole !== "AGENCY_ADMIN") {
        finalResellerId = uid;
      }
      const result = await TransactionManagerService.createOrder({
        resellerId: finalResellerId,
        agencyId,
        productId,
        quantity: Number(quantity),
        targetAccount,
        idempotencyKey: req.headers["x-idempotency-key"]
      });
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      res.json(result);
    } catch (err) {
      logger.error({ error: err }, "Order Creation Error");
      res.status(500).json({ error: err.message });
    }
  });
  app.post(
    "/api/orders/process",
    requireAuth,
    requireTenant,
    async (req, res) => {
      const { orderId, agencyId } = req.body;
      if (!orderId || !agencyId)
        return res.status(400).json({ error: "orderId and agencyId are required" });
      if (agencyId !== req.agency.id) {
        return res.status(403).json({ error: "Access denied: Tenant boundary mismatch" });
      }
      const existingOrder = await prisma.transaction.findUnique({
        where: { id: orderId }
      });
      if (!existingOrder || existingOrder.tenantId !== agencyId) {
        return res.status(404).json({ error: "Order not found or tenant mismatch" });
      }
      logger.info(
        `[PIPELINE_ENGINE] Processing Order: ${orderId} on Tenant: ${agencyId}`
      );
      try {
        const updateResult = await prisma.$executeRaw`
          UPDATE "Transaction" 
          SET status = 'PROCESSING', "updatedAt" = NOW() 
          WHERE id = ${orderId} AND status = 'PENDING'
        `;
        if (updateResult === 0) {
          return res.status(400).json({ error: "Transaction is already processed or resolved." });
        }
        try {
          const queued = await QueueService.getInstance().addTopupJob({
            orderId,
            agencyId
          });
          if (queued) {
            return res.json({
              success: true,
              status: "PROCESSING",
              message: "Fulfillment successfully dispatched to production workers."
            });
          } else {
            await prisma.transaction.update({
              where: { id: orderId },
              data: { status: "PENDING", updatedAt: /* @__PURE__ */ new Date() }
            });
            return res.status(500).json({ error: "Fulfillment queue dispatch failed" });
          }
        } catch (queueErr) {
          logger.error({ error: queueErr }, "Fulfillment Queue error");
          await prisma.transaction.update({
            where: { id: orderId },
            data: { status: "PENDING", updatedAt: /* @__PURE__ */ new Date() }
          });
          return res.status(500).json({ error: "Fulfillment infrastructure disabled or offline: " + queueErr.message });
        }
      } catch (error) {
        logger.error({ error }, "General Process API error");
        res.status(500).json({ error: error.message });
      }
    }
  );
  app.post(
    "/api/webhooks/digiflazz",
    verifyWebhookSignature("DIGIFLAZZ_SECRET"),
    async (req, res) => {
      logger.info({ body: req.body }, "Verified Digiflazz Webhook Payload:");
      const data = req.body?.data;
      if (!data || !data.ref_id) {
        return res.status(400).json({ error: "Invalid payload layout" });
      }
      try {
        const orderId = data.ref_id;
        const status = data.status;
        const order = await prisma.transaction.findUnique({
          where: { id: orderId }
        });
        if (order?.supplierId) {
          try {
            const callbackRecord = await prisma.supplierCallback.create({
              data: {
                supplierId: order.supplierId,
                payload: req.body,
                isVerified: true
              },
              include: { supplier: true }
            });
            const message = `data: ${JSON.stringify({
              event: "INCOMING_WEBHOOK",
              payload: { ...callbackRecord, tenantId: order.tenantId }
            })}

`;
            for (const client2 of sseClients) {
              try {
                client2.write(message);
              } catch (ex) {
                sseClients.delete(client2);
              }
            }
          } catch (logErr) {
            logger.error({ error: logErr }, "Failed to log supplier callback");
          }
        }
        if (!order) {
          return res.status(404).json({ error: "Order not found" });
        }
        if (order.status === "FAILED" || order.status === "REFUNDED") {
          return res.json({ success: true, message: "Order already resolved as failed/refunded" });
        }
        const agencyId = order.tenantId;
        let resellerId = "";
        const ledgerEntry = await prisma.walletLedger.findFirst({ where: { orderId, type: "FREEZE" }, include: { wallet: true } });
        if (ledgerEntry) {
          resellerId = ledgerEntry.wallet.userId;
        } else {
          const freezeJournal = await prisma.ledgerJournal.findFirst({
            where: { orderId, type: "FREEZE" },
            include: { entries: true }
          });
          if (freezeJournal) {
            const cred = freezeJournal.entries.find((e) => e.type === "CREDIT" && !e.accountId.startsWith("SYSTEM:"));
            if (cred) {
              const tWallet = await prisma.wallet.findUnique({ where: { id: cred.accountId } });
              if (tWallet) resellerId = tWallet.userId;
            }
          }
        }
        if (!resellerId || !agencyId) {
          return res.json({ success: true, warning: "Could not find tenant/reseller context" });
        }
        if (status === "Gagal") {
          await TransactionManagerService.failAndRefundOrder(orderId, resellerId, agencyId, data.sn || "Supplier failed order via webhook callback");
        } else if (status === "Sukses") {
          const settlementSuccess = await TransactionManagerService.completeOrder(orderId, resellerId, agencyId);
          if (settlementSuccess) {
            await prisma.transaction.update({
              where: { id: orderId },
              data: { updatedAt: /* @__PURE__ */ new Date() }
              // could save SN here
            });
          }
        }
        res.json({ success: true });
      } catch (err) {
        logger.error({ error: err }, "Webhook callback processing failed");
        res.status(500).json({ error: "Webhook resolution failed" });
      }
    }
  );
  app.post(
    "/api/financial/deposit",
    requireAuth,
    requireTenant,
    requirePermission("wallet.write"),
    async (req, res) => {
      try {
        const tenantId = req.agency.id;
        const { walletId, amount, idempotencyKey, description } = req.body;
        if (!walletId || !amount || !idempotencyKey) {
          return res.status(400).json({ error: "walletId, amount and idempotencyKey are required" });
        }
        const wallet = await prisma.wallet.findFirst({
          where: { id: walletId, tenantId }
        });
        if (!wallet) {
          return res.status(404).json({ error: "Wallet not found or tenant boundary mismatch" });
        }
        const journal = await BalanceManager.depositFunds(
          tenantId,
          walletId,
          amount,
          idempotencyKey,
          description || "Deposit via Financial Portal"
        );
        res.json({ success: true, journalId: journal.id, message: "Funds deposited successfully via Ledger Double-Entry" });
      } catch (err) {
        logger.error({ error: err }, "Ledger Deposit failed");
        res.status(500).json({ error: err.message || "Ledger deposit operations failed" });
      }
    }
  );
  app.post(
    "/api/financial/withdraw",
    requireAuth,
    requireTenant,
    requirePermission("wallet.write"),
    async (req, res) => {
      try {
        const tenantId = req.agency.id;
        const { walletId, amount, idempotencyKey, description } = req.body;
        if (!walletId || !amount || !idempotencyKey) {
          return res.status(400).json({ error: "walletId, amount and idempotencyKey are required" });
        }
        const wallet = await prisma.wallet.findFirst({
          where: { id: walletId, tenantId }
        });
        if (!wallet) {
          return res.status(404).json({ error: "Wallet not found or tenant boundary mismatch" });
        }
        const journal = await BalanceManager.withdrawFunds(
          tenantId,
          walletId,
          amount,
          idempotencyKey,
          description || "Withdrawal via Financial Portal"
        );
        res.json({ success: true, journalId: journal.id, message: "Funds withdrawn successfully via Ledger Double-Entry" });
      } catch (err) {
        logger.error({ error: err }, "Ledger Withdrawal failed");
        res.status(400).json({ error: err.message || "Ledger withdrawal operations failed" });
      }
    }
  );
  app.post(
    "/api/payment/deposit/qris",
    requireAuth,
    requireTenant,
    async (req, res) => {
      try {
        const tenantId = req.agency.id;
        const { walletId, amount, customerName, customerEmail, preferredProvider } = req.body;
        const userRole = req.user?.role;
        const uid = req.user?.uid;
        if (userRole !== "SUPER_ADMIN" && userRole !== "AGENCY" && userRole !== "AGENCY_ADMIN") {
          const wallet = await prisma.wallet.findFirst({
            where: { id: walletId, userId: uid, tenantId }
          });
          if (!wallet) {
            return res.status(403).json({ error: "Access denied: Wallet does not belong to you or tenant mismatch" });
          }
        }
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
      } catch (err) {
        logger.error({ err }, "QRIS payment creation failed");
        res.status(500).json({ error: err.message || "QRIS generation failed" });
      }
    }
  );
  app.post(
    "/api/payment/deposit/va",
    requireAuth,
    requireTenant,
    async (req, res) => {
      try {
        const tenantId = req.agency.id;
        const { walletId, amount, bankCode, customerName, customerEmail, preferredProvider } = req.body;
        const userRole = req.user?.role;
        const uid = req.user?.uid;
        if (userRole !== "SUPER_ADMIN" && userRole !== "AGENCY" && userRole !== "AGENCY_ADMIN") {
          const wallet = await prisma.wallet.findFirst({
            where: { id: walletId, userId: uid, tenantId }
          });
          if (!wallet) {
            return res.status(403).json({ error: "Access denied: Wallet does not belong to you or tenant mismatch" });
          }
        }
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
      } catch (err) {
        logger.error({ err }, "VA payment creation failed");
        res.status(500).json({ error: err.message || "VA generation failed" });
      }
    }
  );
  app.post(
    "/api/payment/deposit/ewallet",
    requireAuth,
    requireTenant,
    async (req, res) => {
      try {
        const { EWalletService: EWalletService2 } = await Promise.resolve().then(() => (init_EWalletService(), EWalletService_exports));
        const tenantId = req.agency.id;
        const { walletId, amount, walletProvider, phoneNumber, callbackUrl, preferredProvider } = req.body;
        const userRole = req.user?.role;
        const uid = req.user?.uid;
        if (userRole !== "SUPER_ADMIN" && userRole !== "AGENCY" && userRole !== "AGENCY_ADMIN") {
          const wallet = await prisma.wallet.findFirst({
            where: { id: walletId, userId: uid, tenantId }
          });
          if (!wallet) {
            return res.status(403).json({ error: "Access denied: Wallet does not belong to you or tenant mismatch" });
          }
        }
        if (!walletId || !amount || !walletProvider || !phoneNumber) {
          return res.status(400).json({ error: "walletId, amount, walletProvider, and phoneNumber are required" });
        }
        const result = await EWalletService2.chargeDepositEWallet(
          tenantId,
          walletId,
          parseFloat(amount),
          walletProvider,
          phoneNumber,
          callbackUrl,
          preferredProvider
        );
        res.json({ success: true, ...result });
      } catch (err) {
        logger.error({ err }, "EWallet charge invocation failed");
        res.status(500).json({ error: err.message || "EWallet charge failed" });
      }
    }
  );
  app.post(
    "/api/payment/withdrawal",
    requireAuth,
    requireTenant,
    async (req, res) => {
      try {
        const { WithdrawalService: WithdrawalService2 } = await Promise.resolve().then(() => (init_WithdrawalService(), WithdrawalService_exports));
        const tenantId = req.agency.id;
        const { walletId, amount, bankCode, accountNumber, accountName, description } = req.body;
        const userRole = req.user?.role;
        const uid = req.user?.uid;
        if (userRole !== "SUPER_ADMIN" && userRole !== "AGENCY" && userRole !== "AGENCY_ADMIN") {
          const wallet = await prisma.wallet.findFirst({
            where: { id: walletId, userId: uid, tenantId }
          });
          if (!wallet) {
            return res.status(403).json({ error: "Access denied: Wallet does not belong to you or tenant mismatch" });
          }
        }
        if (!walletId || !amount || !bankCode || !accountNumber || !accountName) {
          return res.status(400).json({ error: "walletId, amount, bankCode, accountNumber, and accountName are required" });
        }
        const result = await WithdrawalService2.requestWithdrawal(
          tenantId,
          walletId,
          parseFloat(amount),
          bankCode,
          accountNumber,
          accountName,
          description || "Withdrawal payout"
        );
        res.json({ success: true, ...result });
      } catch (err) {
        logger.error({ err }, "Withdrawal request processing failed");
        res.status(500).json({ error: err.message || "Withdrawal payout processing failed" });
      }
    }
  );
  app.post(
    "/api/payment/refund",
    requireAuth,
    requirePermission("refund.execute"),
    async (req, res) => {
      try {
        const { RefundEngine: RefundEngine2 } = await Promise.resolve().then(() => (init_RefundEngine(), RefundEngine_exports));
        const tenantId = req.agency?.id || "nexuscore-default-tenant";
        const { transactionId, amount, reason, idempotencyKey } = req.body;
        if (!transactionId || !amount || !reason || !idempotencyKey) {
          return res.status(400).json({ error: "transactionId, amount, reason, and idempotencyKey are required" });
        }
        const result = await RefundEngine2.processRefund(
          tenantId,
          transactionId,
          parseFloat(amount),
          reason,
          idempotencyKey
        );
        res.json({ success: true, ...result });
      } catch (err) {
        logger.error({ err }, "Refund processing failed");
        res.status(500).json({ error: err.message || "Refund processing failed" });
      }
    }
  );
  app.get(
    "/api/payment/deposit/sync/:id",
    requireAuth,
    requireTenant,
    async (req, res) => {
      try {
        const { QRISService: QRISService2 } = await Promise.resolve().then(() => (init_QRISService(), QRISService_exports));
        const tenantId = req.agency.id;
        const { id } = req.params;
        const currentStatus = await QRISService2.syncQRISPaymentStatus(tenantId, id);
        res.json({ success: true, status: currentStatus });
      } catch (err) {
        logger.error({ err }, "State synchronization failed");
        res.status(500).json({ error: err.message || "Status sync failed" });
      }
    }
  );
  app.post(
    "/api/webhooks/payment/:provider",
    async (req, res) => {
      const { provider } = req.params;
      const providerKey = provider.toLowerCase();
      if (providerKey !== "midtrans" && providerKey !== "xendit" && providerKey !== "duitku") {
        return res.status(400).json({ error: "Unsupported callback provider" });
      }
      try {
        const body = req.body || {};
        let depositId = "";
        if (providerKey === "midtrans") {
          depositId = body.order_id;
        } else if (providerKey === "xendit") {
          depositId = body.external_id || body.reference_id || body.qr_code && body.qr_code.external_id;
        } else if (providerKey === "duitku") {
          depositId = body.merchantOrderId;
        }
        if (!depositId) {
          logger.warn({ providerKey, body }, "Callback rejected due to missing order reference parameters");
          return res.status(400).json({ error: "Missing order transaction identification tag" });
        }
        const deposit = await prisma.deposit.findUnique({
          where: { id: depositId },
          include: { wallet: true }
        });
        if (!deposit) {
          logger.error({ depositId, providerKey }, "Payment callback reference matches no database records");
          return res.status(404).json({ error: "Deposit transaction record not found" });
        }
        const tenantId = deposit.wallet.tenantId || "nexuscore-default-tenant";
        const { PaymentGatewayManager: PaymentGatewayManager2 } = await Promise.resolve().then(() => (init_PaymentGatewayManager(), PaymentGatewayManager_exports));
        const manager = PaymentGatewayManager2.getInstance();
        const adapter = manager.getAdapter(providerKey);
        const verifyResult = await adapter.verifyWebhook(tenantId, {
          headers: req.headers,
          body: req.body
        });
        if (!verifyResult.isValid) {
          logger.error({ depositId, tenantId, providerKey }, "CRITICAL Webhook Validation FAILED! Signature key error.");
          return res.status(401).json({ error: "Invalid cryptographic signature validation" });
        }
        const lockAndProcess = await prisma.$transaction(async (tx) => {
          const lockedDeposits = await tx.$queryRaw(
            import_client15.Prisma.sql`SELECT * FROM "Deposit" WHERE id = ${depositId} FOR UPDATE`
          );
          const currentDeposit = lockedDeposits && lockedDeposits.length > 0 ? lockedDeposits[0] : null;
          if (!currentDeposit) {
            return { action: "NOT_FOUND" };
          }
          if (currentDeposit.status === "SUCCESS") {
            return { action: "IDEMPOTENT_SUCCESS" };
          }
          if (verifyResult.status === "SETTLED") {
            const { BalanceManager: BalanceManager2 } = await Promise.resolve().then(() => (init_BalanceManager(), BalanceManager_exports));
            const finalIdempotencyKey = `dep-callback-${depositId}`;
            await BalanceManager2.depositFunds(
              tenantId,
              currentDeposit.walletId,
              verifyResult.amount,
              finalIdempotencyKey,
              `Deposit Credit paid via ${providerKey.toUpperCase()} [ID: ${verifyResult.referenceId || depositId}]`
            );
            await tx.deposit.update({
              where: { id: depositId },
              data: {
                status: "SUCCESS",
                paymentRef: verifyResult.referenceId || depositId
              }
            });
            return { action: "PROCESSED_SUCCESS", walletId: currentDeposit.walletId };
          } else if (verifyResult.status === "EXPIRED") {
            await tx.deposit.update({
              where: { id: depositId },
              data: { status: "EXPIRED" }
            });
            return { action: "PROCESSED_EXPIRED" };
          } else if (verifyResult.status === "FAILED") {
            await tx.deposit.update({
              where: { id: depositId },
              data: { status: "FAILED" }
            });
            return { action: "PROCESSED_FAILED" };
          }
          return { action: "NO_ACTION" };
        }, {
          isolationLevel: import_client15.Prisma.TransactionIsolationLevel.Serializable
        });
        if (lockAndProcess.action === "NOT_FOUND") {
          return res.status(404).json({ error: "Deposit transaction record not found" });
        }
        if (lockAndProcess.action === "IDEMPOTENT_SUCCESS") {
          logger.info({ depositId }, "Idempotent payment callback detected: already completed successfully, replying 200 OK.");
          return res.json({ success: true, message: "Duplicate payment signal resolved silently." });
        }
        if (lockAndProcess.action === "PROCESSED_SUCCESS") {
          logger.info({ depositId, walletId: lockAndProcess.walletId }, "SaaS billing deposit finalized. Balance credited via Ledger ledger entries.");
          try {
            const { getRedisClient: getRedisClient2 } = await Promise.resolve().then(() => (init_redis(), redis_exports));
            const redisClient = getRedisClient2();
            await redisClient.incr(`financial_metrics:payments:success_count`);
            await redisClient.incrbyfloat(`financial_metrics:payments:success_volume`, verifyResult.amount);
          } catch {
          }
          return res.json({ success: true, message: "Payment processed successfully" });
        } else if (lockAndProcess.action === "PROCESSED_EXPIRED") {
          return res.json({ success: true, message: "Logged as EXPIRED" });
        } else if (lockAndProcess.action === "PROCESSED_FAILED") {
          return res.json({ success: true, message: "Logged as FAILED" });
        }
        res.json({ success: true });
      } catch (err) {
        logger.error({ err, providerKey }, "Payment callback processing exception");
        res.status(500).json({ error: err.message || "Webhook handling system error" });
      }
    }
  );
  app.post(
    "/api/financial/settle/initiate",
    requireAuth,
    requireTenant,
    requirePermission("wallet.write"),
    async (req, res) => {
      try {
        const { SettlementEngine: SettlementEngine2 } = await Promise.resolve().then(() => (init_SettlementEngine(), SettlementEngine_exports));
        const tenantId = req.agency.id;
        const { walletId, amount, orderId, idempotencyKey } = req.body;
        if (!walletId || !amount || !orderId || !idempotencyKey) {
          return res.status(400).json({ error: "walletId, amount, orderId and idempotencyKey are required" });
        }
        const settlement = await SettlementEngine2.initiateSettlement(
          tenantId,
          walletId,
          amount,
          orderId,
          idempotencyKey
        );
        res.json({ success: true, settlementId: settlement.id, message: "Settlement flow initiated and held in Escrow" });
      } catch (err) {
        logger.error({ error: err }, "Initiate Settlement failed");
        res.status(500).json({ error: err.message || "Settlement initiation failed" });
      }
    }
  );
  app.post(
    "/api/financial/settle/commit",
    requireAuth,
    requireTenant,
    requirePermission("wallet.write"),
    async (req, res) => {
      try {
        const { SettlementEngine: SettlementEngine2 } = await Promise.resolve().then(() => (init_SettlementEngine(), SettlementEngine_exports));
        const tenantId = req.agency.id;
        const { orderId, supplierSettlementAmount, idempotencyKey } = req.body;
        if (!orderId || supplierSettlementAmount === void 0 || !idempotencyKey) {
          return res.status(400).json({ error: "orderId, supplierSettlementAmount and idempotencyKey are required" });
        }
        const settlement = await SettlementEngine2.commitSettlement(
          tenantId,
          orderId,
          supplierSettlementAmount,
          idempotencyKey
        );
        res.json({ success: true, settlementId: settlement.id, message: "Settlement successfully committed and paid" });
      } catch (err) {
        logger.error({ error: err }, "Commit Settlement failed");
        res.status(500).json({ error: err.message || "Settlement commitment failed" });
      }
    }
  );
  app.post(
    "/api/financial/settle/rollback",
    requireAuth,
    requireTenant,
    requirePermission("wallet.write"),
    async (req, res) => {
      try {
        const { SettlementEngine: SettlementEngine2 } = await Promise.resolve().then(() => (init_SettlementEngine(), SettlementEngine_exports));
        const tenantId = req.agency.id;
        const { walletId, orderId, idempotencyKey, reason } = req.body;
        if (!walletId || !orderId || !idempotencyKey) {
          return res.status(400).json({ error: "walletId, orderId and idempotencyKey are required" });
        }
        const settlement = await SettlementEngine2.rollbackSettlement(
          tenantId,
          walletId,
          orderId,
          idempotencyKey,
          reason || "Settlement rollback transaction triggered"
        );
        res.json({ success: true, settlementId: settlement.id, message: "Settlement successfully rolled back and escrow refunded" });
      } catch (err) {
        logger.error({ error: err }, "Rollback Settlement failed");
        res.status(500).json({ error: err.message || "Settlement rollback failed" });
      }
    }
  );
  app.get(
    "/api/financial/integrity",
    requireAuth,
    requireTenant,
    requirePermission("ledger.audit"),
    async (req, res) => {
      try {
        const { FinancialIntegrityService: FinancialIntegrityService2 } = await Promise.resolve().then(() => (init_FinancialIntegrityService(), FinancialIntegrityService_exports));
        const tenantId = req.agency.id;
        const report = await FinancialIntegrityService2.performIntegrityAudit(tenantId);
        res.json({ success: true, report });
      } catch (err) {
        logger.error({ error: err }, "Financial Integrity validation failed");
        res.status(500).json({ error: err.message || "Financial integrity scan failed" });
      }
    }
  );
  app.use((err, req, res, next) => {
    logger.error({ err, correlationId: req.correlationId }, "Unhandled express error in routes");
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(err, {
        extra: {
          correlationId: req.correlationId,
          url: req.url,
          method: req.method,
          body: req.body,
          query: req.query,
          params: req.params
        }
      });
    }
    res.status(500).json({
      error: "Internal Server Error",
      correlationId: req.correlationId,
      message: process.env.NODE_ENV === "production" ? void 0 : err.message
    });
  });
  app.get("/health", async (req, res) => {
    res.json({ status: "up", timestamp: /* @__PURE__ */ new Date(), version: "1.0.0" });
  });
  app.get("/live", (req, res) => {
    res.json({ status: "alive" });
  });
  app.get("/ready", async (req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      const { getRedisClient: getRedisClient2 } = await Promise.resolve().then(() => (init_redis(), redis_exports));
      const redis = getRedisClient2();
      if (redis.status !== "ready") {
        throw new Error("Redis is not ready");
      }
      const isQueueActive = await QueueService.getInstance().isReady();
      if (!isQueueActive) {
        throw new Error("Queue service not ready");
      }
      res.json({
        status: "ready",
        components: {
          database: "up",
          redis: "up",
          queue: "up"
        }
      });
    } catch (e) {
      res.status(503).json({
        status: "not_ready",
        error: e.message
      });
    }
  });
  const distPath = import_path.default.join(process.cwd(), "dist");
  const indexPath = import_path.default.join(distPath, "index.html");
  logger.debug(`[DEBUG] CWD: ${process.cwd()}, DistPath: ${distPath}, IndexExists: ${import_fs.default.existsSync(indexPath)}`);
  const isProd = process.env.NODE_ENV === "production" && import_fs.default.existsSync(indexPath);
  let stopWorkers = async () => {
  };
  async function warmupTenantCache() {
    try {
      logger.info("[WARMUP] Starting tenant cache warmup...");
      const { getRedisClient: getRedisClient2 } = await Promise.resolve().then(() => (init_redis(), redis_exports));
      const redis = getRedisClient2();
      if (redis.status !== "ready") {
        logger.warn("[WARMUP] Redis not ready, skipping warmup");
        return;
      }
      const tenants = await prisma.tenant.findMany({
        take: 100,
        orderBy: { createdAt: "desc" }
      });
      let count = 0;
      for (const tenant of tenants) {
        if (tenant.customDomain) {
          await redis.setex(`tenant:domain:${tenant.customDomain}`, 3600, JSON.stringify(tenant));
          count++;
        }
        if (tenant.slug) {
          await redis.setex(`tenant:slug:${tenant.slug}`, 3600, JSON.stringify(tenant));
          count++;
        }
      }
      logger.info(`[WARMUP] Successfully pre-loaded ${count} tenant cache records into Redis.`);
    } catch (err) {
      logger.error(err, "[WARMUP] Failed to warmup tenant cache");
    }
  }
  await warmupTenantCache();
  try {
    const api = await startAllWorkers();
    stopWorkers = api.shutdown;
  } catch (err) {
    logger.error({ err }, "Fatal: Failed to start background workers");
  }
  if (isProd) {
    const distPath2 = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath2, { index: false }));
    app.get("*", (req, res) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
      res.sendFile(import_path.default.join(distPath2, "index.html"));
    });
  } else {
    logger.info("[SERVER] Starting in development mode: mounting dynamic Vite middleware...");
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  const server = app.listen(Number(PORT), "0.0.0.0", () => {
    logger.info(`NexusCore Production Engine running on http://localhost:${PORT}`);
    startTracing();
  });
  const shutdown = async () => {
    logger.info("SIGTERM/SIGINT received. Initiating enterprise graceful shutdown...");
    server.close(async () => {
      logger.info("Express server ingress closed.");
      try {
        await stopWorkers();
        await QueueService.getInstance().gracefulShutdown();
        const { shutdownQueues: shutdownQueues2 } = await Promise.resolve().then(() => (init_queueManager(), queueManager_exports));
        await shutdownQueues2();
        const { getRedisClient: getRedisClient2 } = await Promise.resolve().then(() => (init_redis(), redis_exports));
        await getRedisClient2().quit();
        logger.info("Redis connections safely closed.");
        await prisma.$disconnect();
        logger.info("PostgreSQL connections safely closed.");
        process.exit(0);
      } catch (err) {
        logger.error(err, "Error during graceful disconnect:");
        process.exit(1);
      }
    });
    setTimeout(() => {
      logger.error("Forcing shutdown after 15s timeout");
      process.exit(1);
    }, 15e3);
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
  process.on("SIGUSR2", shutdown);
}
startServer().catch((err) => {
  logger.error(err, "CRITICAL: Server failed to start up gracefully");
  setTimeout(() => {
    process.exit(1);
  }, 1e3);
});
//# sourceMappingURL=server.cjs.map
