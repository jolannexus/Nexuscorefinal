const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacements = [
  { search: `console.error("[DATABASE_OFFLINE_WARNING] Database connection not found or offline:", error);`, replace: `logger.error({ error }, "[DATABASE_OFFLINE_WARNING] Database connection not found or offline");` },
  { search: `console.error("Gemini API Error:", error);`, replace: `logger.error({ error }, "Gemini API Error");` },
  { search: `console.error(error);`, replace: `logger.error({ error }, "Unexpected error");` },
  { search: `console.warn("Wallet creation warning:", err.message);`, replace: `logger.warn({ error: err }, "Wallet creation warning");` },
  { search: `console.error("PostgreSQL registration failed:", error);`, replace: `logger.error({ error }, "PostgreSQL registration failed");` },
  { search: `console.error("PostgreSQL login failed:", error);`, replace: `logger.error({ error }, "PostgreSQL login failed");` },
  { search: `console.error("Failed to list supplier connections:", error);`, replace: `logger.error({ error }, "Failed to list supplier connections");` },
  { search: `console.error("Failed to save supplier connection:", error);`, replace: `logger.error({ error }, "Failed to save supplier connection");` },
  { search: `console.error("Failed to delete supplier connection:", error);`, replace: `logger.error({ error }, "Failed to delete supplier connection");` },
  { search: `console.error("Supplier Validation Error:", error);`, replace: `logger.error({ error }, "Supplier Validation Error");` },
  { search: `console.error("Fetch Balance Error:", error);`, replace: `logger.error({ error }, "Fetch Balance Error");` },
  { search: `console.error("Fetch Products Error:", error);`, replace: `logger.error({ error }, "Fetch Products Error");` },
  { search: `console.error("Supplier Health Check Error:", error);`, replace: `logger.error({ error }, "Supplier Health Check Error");` },
  { search: `console.error("Reconciliation Run Error:", error);`, replace: `logger.error({ error }, "Reconciliation Run Error");` },
  { search: `console.error("Failed to fetch alerts:", err);`, replace: `logger.error({ error: err }, "Failed to fetch alerts");` },
  { search: `console.error("Failed to load products from DB:", error);`, replace: `logger.error({ error }, "Failed to load products from DB");` },
  { search: `console.error("Failed to toggle product:", error);`, replace: `logger.error({ error }, "Failed to toggle product");` },
  { search: `console.error("Failed to list resellers from DB:", error);`, replace: `logger.error({ error }, "Failed to list resellers from DB");` },
  { search: `console.error("Failed to scale reseller:", error);`, replace: `logger.error({ error }, "Failed to scale reseller");` },
  { search: `console.error("Failed to delete reseller:", error);`, replace: `logger.error({ error }, "Failed to delete reseller");` },
  { search: `console.error("Failed to adjust reseller balance:", err);`, replace: `logger.error({ error: err }, "Failed to adjust reseller balance");` },
  { search: `console.error("Failed to get pending deposits:", err);`, replace: `logger.error({ error: err }, "Failed to get pending deposits");` },
  { search: `console.error("Failed to request deposit:", err);`, replace: `logger.error({ error: err }, "Failed to request deposit");` },
  { search: `console.error("Failed to approve deposit:", err);`, replace: `logger.error({ error: err }, "Failed to approve deposit");` },
  { search: `console.error("Failed to reject deposit:", err);`, replace: `logger.error({ error: err }, "Failed to reject deposit");` },
  { search: `console.error("Ledger Fetch Error:", error);`, replace: `logger.error({ error }, "Ledger Fetch Error");` },
  { search: `console.error("Reconciliation Records Fetch Error:", error);`, replace: `logger.error({ error }, "Reconciliation Records Fetch Error");` },
  { search: `console.error("Force Reconcile Error:", error);`, replace: `logger.error({ error }, "Force Reconcile Error");` },
  { search: `console.error("Financial Audit Logs Fetch Error:", error);`, replace: `logger.error({ error }, "Financial Audit Logs Fetch Error");` },
  { search: `console.error("Verify Audit Trail Integrity Error:", error);`, replace: `logger.error({ error }, "Verify Audit Trail Integrity Error");` },
  { search: `console.error("Failed to fetch wallet transactions", err);`, replace: `logger.error({ error: err }, "Failed to fetch wallet transactions");` },
  { search: `console.error("Order Fetch Error:", err);`, replace: `logger.error({ error: err }, "Order Fetch Error");` },
  { search: `console.error("Order Creation Error:", err);`, replace: `logger.error({ error: err }, "Order Creation Error");` },
  { search: 'console.log(`[PIPELINE_ENGINE] Processing Order: ${orderId} on Tenant: ${agencyId}`);', replace: `logger.info({ orderId, agencyId }, 'Pipeline engine processing order');` },
  { search: `console.error("Fulfillment Queue error:", queueErr);`, replace: `logger.error({ error: queueErr }, "Fulfillment Queue error");` },
  { search: `console.error("General Process API error:", error);`, replace: `logger.error({ error }, "General Process API error");` },
  { search: `console.log("Verified Digiflazz Webhook Payload:", req.body);`, replace: `logger.info({ payload: req.body }, 'Digiflazz webhook payload verified');` },
  { search: `console.error("Failed to log supplier callback:", logErr);`, replace: `logger.error({ error: logErr }, "Failed to log supplier callback");` },
  { search: `console.error("Webhook callback processing failed:", err);`, replace: `logger.error({ error: err }, "Webhook callback processing failed");` },
  { search: `console.error("Ledger Deposit failed:", err);`, replace: `logger.error({ error: err }, "Ledger Deposit failed");` },
  { search: `console.error("Ledger Withdrawal failed:", err);`, replace: `logger.error({ error: err }, "Ledger Withdrawal failed");` },
  { search: `console.error("Initiate Settlement failed:", err);`, replace: `logger.error({ error: err }, "Initiate Settlement failed");` },
  { search: `console.error("Commit Settlement failed:", err);`, replace: `logger.error({ error: err }, "Commit Settlement failed");` },
  { search: `console.error("Rollback Settlement failed:", err);`, replace: `logger.error({ error: err }, "Rollback Settlement failed");` },
  { search: `console.error("Financial Integrity validation failed:", err);`, replace: `logger.error({ error: err }, "Financial Integrity validation failed");` },
  { search: 'console.log(`[DEBUG] CWD: ${process.cwd()}, DistPath: ${distPath}, IndexExists: ${fs.existsSync(indexPath)}`);', replace: `logger.debug({ cwd: process.cwd(), distPath, indexExists: fs.existsSync(indexPath) }, 'Server path info');` },
  { search: `console.log("[SERVER] Starting in development mode: mounting dynamic Vite middleware...");`, replace: `logger.info("[SERVER] Starting in development mode: mounting dynamic Vite middleware...");` },
];

for (const r of replacements) {
  if (code.includes(r.search)) {
    code = code.replace(r.search, r.replace);
  } else {
    console.log("Not found:", r.search);
  }
}

fs.writeFileSync('server.ts', code);
