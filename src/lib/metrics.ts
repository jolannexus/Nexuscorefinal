import client from 'prom-client';

// Create a Registry
export const register = new client.Registry();

// Add default metrics (e.g., CPU, Memory usage)
client.collectDefaultMetrics({ register });

// Core Custom Metrics
export const transactionCounter = new client.Counter({
  name: 'nexuscore_transactions_total',
  help: 'Total number of transactions processed',
  labelNames: ['tenant_id', 'status', 'supplier'],
});

export const transactionDuration = new client.Histogram({
  name: 'nexuscore_transaction_duration_seconds',
  help: 'Histogram of transaction processing duration',
  labelNames: ['tenant_id', 'supplier'],
  buckets: [0.1, 0.5, 1, 2.5, 5, 10], // seconds
});

export const webhookCounter = new client.Counter({
  name: 'nexuscore_webhooks_total',
  help: 'Total number of received webhooks',
  labelNames: ['provider', 'status'],
});

export const ledgerDoubleEntryErrors = new client.Counter({
  name: 'nexuscore_ledger_errors_total',
  help: 'Total number of double-entry ledger mismatches or anomalies detected',
  labelNames: ['tenant_id', 'severity'],
});

export const activeConnections = new client.Gauge({
  name: 'nexuscore_active_connections',
  help: 'Number of active connections or WebSocket users',
});

// --- ADVANCED PROMETHEUS METRICS ---

// Queue Metrics
export const queueLagMetrics = new client.Gauge({
  name: 'nexuscore_queue_lag_jobs',
  help: 'Number of jobs waiting in the queue (lag)',
  labelNames: ['queue_name'],
});

export const deadLetterQueueCounter = new client.Counter({
  name: 'nexuscore_dlq_jobs_total',
  help: 'Total number of jobs sent to dead letter queue',
  labelNames: ['queue_name', 'reason'],
});

export const workerThroughput = new client.Counter({
  name: 'nexuscore_worker_throughput_total',
  help: 'Total number of jobs processed by workers',
  labelNames: ['queue_name', 'worker_id', 'status'],
});

// Supplier Metrics
export const supplierLatencyHistogram = new client.Histogram({
  name: 'nexuscore_supplier_latency_seconds',
  help: 'Latency of outbound supplier API calls',
  labelNames: ['supplier_id', 'endpoint'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
});

// Reconciliation & Settlement Metrics
export const reconciliationDrift = new client.Gauge({
  name: 'nexuscore_reconciliation_drift_amount',
  help: 'Amount of absolute financial drift detected during reconciliation',
  labelNames: ['tenant_id', 'currency'],
});

export const settlementAnomalyCounter = new client.Counter({
  name: 'nexuscore_settlement_anomaly_total',
  help: 'Total anomalies detected during merchant settlement',
  labelNames: ['tenant_id', 'type'],
});

export const webhookRetryCounter = new client.Counter({
  name: 'nexuscore_webhook_retries_total',
  help: 'Number of retries triggered for outgoing webhooks',
  labelNames: ['tenant_id', 'endpoint'],
});

export const settlementThroughput = new client.Counter({
  name: 'nexuscore_settlement_throughput_total',
  help: 'Total successful settlements processed',
  labelNames: ['tenant_id'],
});

export const escrowUtilization = new client.Gauge({
  name: 'nexuscore_escrow_utilization_amount',
  help: 'Current total escrow balance held on platform',
  labelNames: ['tenant_id', 'currency'],
});

export const payoutAnomalyCounter = new client.Counter({
  name: 'nexuscore_payout_anomaly_total',
  help: 'Total anomalies or errors detected during payout',
  labelNames: ['tenant_id'],
});

export const transactionRollbackCounter = new client.Counter({
  name: 'nexuscore_transaction_rollback_total',
  help: 'Total number of transaction double-entry rollbacks',
  labelNames: ['tenant_id'],
});

// Register metrics
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
