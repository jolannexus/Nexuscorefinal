import fs from 'fs';

const insertImport = (file, importStatement) => {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes(importStatement)) {
        const lastImportIndex = content.lastIndexOf('import ');
        if (lastImportIndex !== -1) {
            const endOfLastImport = content.indexOf('\n', lastImportIndex);
            content = content.slice(0, endOfLastImport + 1) + importStatement + '\n' + content.slice(endOfLastImport + 1);
        } else {
            content = importStatement + '\n' + content;
        }
        fs.writeFileSync(file, content);
    }
}

const replaceAll = (file, search, replace) => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.split(search).join(replace);
    fs.writeFileSync(file, content);
}

const replaceRegex = (file, regex, replace) => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(regex, replace);
    fs.writeFileSync(file, content);
}

// 1. fraudDetectionMiddleware.ts
insertImport('src/middleware/fraudDetectionMiddleware.ts', "import { logger } from '../lib/logger';");
replaceRegex('src/middleware/fraudDetectionMiddleware.ts', /console\.warn\(\`\[FraudDetectionMiddleware\] Unsafe transaction blocked for tenant \$\{tenantId\}\. IP: \$\{ipAddress\}\`\);/g, "logger.warn(`[FraudDetectionMiddleware] Unsafe transaction blocked for tenant ${tenantId}. IP: ${ipAddress}`);");
replaceRegex('src/middleware/fraudDetectionMiddleware.ts', /console\.error\('\[FraudDetectionMiddleware\] Internal error during risk assessment', err\);/g, "logger.error({ error: err }, '[FraudDetectionMiddleware] Internal error during risk assessment');");

// 2. requirePermission.ts
insertImport('src/middleware/requirePermission.ts', "import { logger } from '../lib/logger';");
replaceRegex('src/middleware/requirePermission.ts', /console\.warn\(\`\[Security\] Permission denied\. Role: \$\{req\.user\.role\}, Permission Required: \$\{permission\}\`\);/g, "logger.warn(`[Security] Permission denied. Role: ${req.user.role}, Permission Required: ${permission}`);");

// 3. orderService.ts
insertImport('src/services/orders/orderService.ts', "import { logger } from '../../lib/logger';");
replaceRegex('src/services/orders/orderService.ts', /console\.error\('\[SQL_ORDERS\] Error retrieving orders from API:', error\);/g, "logger.error({ error }, '[SQL_ORDERS] Error retrieving orders from API:');");
replaceRegex('src/services/orders/orderService.ts', /console\.error\("\[Fulfillment Trigger Warning\] Async fetch call failed:", e\)/g, "logger.error({ error: e }, \"[Fulfillment Trigger Warning] Async fetch call failed:\")");
replaceRegex('src/services/orders/orderService.ts', /console\.warn\('\[Fulfillment Trigger Bypassed\]', apiErr\);/g, "logger.warn({ error: apiErr }, '[Fulfillment Trigger Bypassed]');");
replaceRegex('src/services/orders/orderService.ts', /console\.error\(\`\[OrderService\] Manual processing pipeline trigger failed:\`, error\);/g, "logger.error({ error }, `[OrderService] Manual processing pipeline trigger failed:`);");

// 4. jobProcessor.ts
insertImport('src/services/queue/jobProcessor.ts', "import { logger } from '../../lib/logger';");
replaceRegex('src/services/queue/jobProcessor.ts', /console\.error\(\`\[TopupJobProcessor\] Order \$\{orderId\} failed: No active supplier connection\. Job aborted cleanly\.\`\);/g, "logger.error(`[TopupJobProcessor] Order ${orderId} failed: No active supplier connection. Job aborted cleanly.`);");

// 5. ledgerService.ts
insertImport('src/services/billing/ledgerService.ts', "import { financialLogger } from '../../lib/logger';");
replaceRegex('src/services/billing/ledgerService.ts', /console\.warn\(\`\[LEDGER\] Idempotent hit for token: \$\{params\.referenceId\}\. Skipping double charge\.\`\);/g, "financialLogger.warn(`[LEDGER] Idempotent hit for token: ${params.referenceId}. Skipping double charge.`);");

// 6. billingService.ts
insertImport('src/services/billing/billingService.ts', "import { financialLogger } from '../../lib/logger';");
replaceRegex('src/services/billing/billingService.ts', /console\.error\(err\);/g, "financialLogger.error({ error: err }, 'Billing service error');");

// 7. transactionManagerService.ts
insertImport('src/services/billing/transactionManagerService.ts', "import { financialLogger } from '../../lib/logger';");
replaceRegex('src/services/billing/transactionManagerService.ts', /console\.warn\(\`\[TX_MANAGER\] Detected idempotent order submission for token: \$\{params\.idempotencyKey\}\`\);/g, "financialLogger.warn(`[TX_MANAGER] Detected idempotent order submission for token: ${params.idempotencyKey}`);");
replaceRegex('src/services/billing/transactionManagerService.ts', /console\.error\(\`\[TX_MANAGER\] Transactional order creation aborted or rolled back\. Reason:\`, err\.message\);/g, "financialLogger.error({ error: err.message }, `[TX_MANAGER] Transactional order creation aborted or rolled back.`);");
replaceRegex('src/services/billing/transactionManagerService.ts', /console\.warn\(\`\[TX_MANAGER\] Process violation: Order \$\{orderId\} missing or not in processable state\.\`\);/g, "financialLogger.warn(`[TX_MANAGER] Process violation: Order ${orderId} missing or not in processable state.`);");
replaceRegex('src/services/billing/transactionManagerService.ts', /console\.error\(\`\[TX_MANAGER\] Fails to complete and settle order \$\{orderId\}:\`, err\.message\);/g, "financialLogger.error({ error: err.message }, `[TX_MANAGER] Fails to complete and settle order ${orderId}:`);");
replaceRegex('src/services/billing/transactionManagerService.ts', /console\.warn\(\`\[TX_MANAGER\] Processing error: Order \$\{orderId\} not found\.\`\);/g, "financialLogger.warn(`[TX_MANAGER] Processing error: Order ${orderId} not found.`);");
replaceRegex('src/services/billing/transactionManagerService.ts', /console\.warn\(\`\[TX_MANAGER\] Processing error: Order \$\{orderId\} already rolled back\.\`\);/g, "financialLogger.warn(`[TX_MANAGER] Processing error: Order ${orderId} already rolled back.`);");
replaceRegex('src/services/billing/transactionManagerService.ts', /console\.error\(\`\[TX_MANAGER\] Failed to rollback\/refund order \$\{orderId\}:\`, err\.message\);/g, "financialLogger.error({ error: err.message }, `[TX_MANAGER] Failed to rollback/refund order ${orderId}:`);");
replaceRegex('src/services/billing/transactionManagerService.ts', /console\.error\('\[COMMISSION_DISTRIBUTION_WARNING\] Commissions failed to settle:', commErr\);/g, "financialLogger.error({ error: commErr }, '[COMMISSION_DISTRIBUTION_WARNING] Commissions failed to settle:');");

// 8. authService.ts
replaceRegex('src/services/authService.ts', /console\.info\(`Password reset requested for: \$\{email\}`\);\n/g, "");

// 9. productService.ts
replaceRegex('src/services/products/productService.ts', /info: \(\.\.\.args: any\[\]\) => console\.info\(\.\.\.args\),/g, "info: (...args: any[]) => { if ((import.meta as any).env.DEV) console.info(...args); },");
replaceRegex('src/services/products/productService.ts', /debug: \(\.\.\.args: any\[\]\) => console\.debug\(\.\.\.args\),/g, "debug: (...args: any[]) => { if ((import.meta as any).env.DEV) console.debug(...args); },");
replaceRegex('src/services/products/productService.ts', /warn: \(\.\.\.args: any\[\]\) => console\.warn\(\.\.\.args\),/g, "warn: (...args: any[]) => { if ((import.meta as any).env.DEV) console.warn(...args); },");
replaceRegex('src/services/products/productService.ts', /error: \(\.\.\.args: any\[\]\) => console\.error\(\.\.\.args\),/g, "error: (...args: any[]) => { if ((import.meta as any).env.DEV) console.error(...args); },");

// 10. pricingService.ts
replaceRegex('src/services/products/pricingService.ts', /console\.info\("Pricing rule applied locally in memory:", rule\);/g, "if ((import.meta as any).env.DEV) console.info(\"Pricing rule applied locally in memory:\", rule);");

// 11. tenantService.ts
replaceRegex('src/services/system/tenantService.ts', /console\.warn\('API error or local network block resolving tenant\. Serving resilient fallback:', error\);/g, "");

// 12. supplierService.ts
replaceRegex('src/services/suppliers/supplierService.ts', /console\.error\('Failed to get supplier connections:', error\);/g, "if ((import.meta as any).env.DEV) console.error('Failed to get supplier connections:', error);");
replaceRegex('src/services/suppliers/supplierService.ts', /console\.error\('Failed to update connection:', error\);/g, "if ((import.meta as any).env.DEV) console.error('Failed to update connection:', error);");
replaceRegex('src/services/suppliers/supplierService.ts', /console\.error\('Failed to delete connection:', error\);/g, "if ((import.meta as any).env.DEV) console.error('Failed to delete connection:', error);");
replaceRegex('src/services/suppliers/supplierService.ts', /console\.error\('Balance sync failed:', error\);/g, "if ((import.meta as any).env.DEV) console.error('Balance sync failed:', error);");
replaceRegex('src/services/suppliers/supplierService.ts', /console\.error\('Product sync failed:', error\);/g, "if ((import.meta as any).env.DEV) console.error('Product sync failed:', error);");

// 13. providerSelector.ts
insertImport('src/services/suppliers/providerSelector.ts', "import { logger } from '../../lib/logger';");
replaceRegex('src/services/suppliers/providerSelector.ts', /console\.warn\(\`\[Quarantine\] Provider \$\{supplierName\.toUpperCase\(\)\} quarantined for \$\{durationMs \/ 1000\}s\`\);/g, "logger.warn(`[Quarantine] Provider ${supplierName.toUpperCase()} quarantined for ${durationMs / 1000}s`);");
replaceRegex('src/services/suppliers/providerSelector.ts', /console\.info\(\`\[FailoverEngine\] Selected provider \$\{connection\.supplierName\} with score \$\{best\.score\.finalScore\}\`\);/g, "logger.info(`[FailoverEngine] Selected provider ${connection.supplierName} with score ${best.score.finalScore}`);");
replaceRegex('src/services/suppliers/providerSelector.ts', /console\.error\('\[ProviderSelector\] Failed to log failover swap:', logErr\);/g, "logger.error({ error: logErr }, '[ProviderSelector] Failed to log failover swap:');");
replaceRegex('src/services/suppliers/providerSelector.ts', /console\.warn\(\`\[FailoverEngine\] FAILED attempt with \$\{connection\.supplierName\}: \$\{errorMsg\}\`\);/g, "logger.warn(`[FailoverEngine] FAILED attempt with ${connection.supplierName}: ${errorMsg}`);");
replaceRegex('src/services/suppliers/providerSelector.ts', /console\.error\('\[ProviderSelector\] Failed to dispatch SUPPLIER_FAILED event:', dispatchErr\);/g, "logger.error({ error: dispatchErr }, '[ProviderSelector] Failed to dispatch SUPPLIER_FAILED event:');");
replaceRegex('src/services/suppliers/providerSelector.ts', /console\.error\('\[ProviderSelector\] Error syncing telemetry to Postgres:', err\);/g, "logger.error({ error: err }, '[ProviderSelector] Error syncing telemetry to Postgres:');");

// 14. orderProcessor.ts
insertImport('src/services/suppliers/orderProcessor.ts', "import { logger } from '../../lib/logger';");
replaceRegex('src/services/suppliers/orderProcessor.ts', /console\.warn\('\[OrderProcessor\] Active supplier discovery bypass\/error:', discErr\);/g, "logger.warn({ error: discErr }, '[OrderProcessor] Active supplier discovery bypass/error:');");
replaceRegex('src/services/suppliers/orderProcessor.ts', /console\.error\(\`\[OrderProcessor\] Execution error on \$\{connection\.supplierName\}:\`, err\.message\);/g, "logger.error({ error: err.message }, `[OrderProcessor] Execution error on ${connection.supplierName}:`);");

// 15. responseNormalizer.ts
insertImport('src/services/suppliers/utils/responseNormalizer.ts', "import { logger } from '../../../lib/logger';");
replaceRegex('src/services/suppliers/utils/responseNormalizer.ts', /console\.error\(\`\[SupplierResponseNormalizer\] \[\\$\{providerName\}\] Processing runtime error: \$\{errorMsg\}\`\);/g, "logger.error(`[SupplierResponseNormalizer] [${providerName}] Processing runtime error: ${errorMsg}`);");

// 16. resellerService.ts
replaceRegex('src/services/resellers/resellerService.ts', /console\.error\('Failed to get resellers:', error\);/g, "if ((import.meta as any).env.DEV) console.error('Failed to get resellers:', error);");
replaceRegex('src/services/resellers/resellerService.ts', /console\.info\(`Status update requested for reseller \$\{id\}: \$\{status\}`\);/g, "if ((import.meta as any).env.DEV) console.info(`Status update requested for reseller ${id}: ${status}`);");
replaceRegex('src/services/resellers/resellerService.ts', /console\.error\('Failed to delete reseller:', error\);/g, "if ((import.meta as any).env.DEV) console.error('Failed to delete reseller:', error);");

// 18. diagnostics.ts (Already fixed by previous prompt fix)
// We'll just enforce it in case:
replaceRegex('src/utils/diagnostics.ts', /console\.info\(msg, style\);/g, "if ((import.meta as any).env.DEV) console.info(msg, style);");
replaceRegex('src/utils/diagnostics.ts', /console\.info\(msg\);/g, "if ((import.meta as any).env.DEV) console.info(msg);");

// 19. BaseAdapter.ts
insertImport('src/adapters/suppliers/BaseAdapter.ts', "import { logger } from '../../lib/logger';");
replaceRegex('src/adapters/suppliers/BaseAdapter.ts', /console\.warn\(\`\[\$\{this\.name\}\] Attempt \$\{attempt \+ 1\} failed\. Retrying in \$\{delay\}ms\.\.\.\`\);/g, "logger.warn({ adapter: this.name, attempt: attempt + 1, delayMs: delay }, 'Adapter retry attempt');");

// 20. VipResellerAdapter.ts
insertImport('src/adapters/suppliers/instances/VipResellerAdapter.ts', "import { logger } from '../../../lib/logger';");
replaceRegex('src/adapters/suppliers/instances/VipResellerAdapter.ts', /console\.error\('VIP Reseller credentials validation error:', error\);/g, "logger.error({ error }, 'VIP Reseller credentials validation error');");
replaceRegex('src/adapters/suppliers/instances/VipResellerAdapter.ts', /console\.info\(\`\[\$\{this\.name\}\] Reading current wallet balance\.\.\.\`\);/g, "logger.info({ adapter: this.name }, `Reading current wallet balance...`);");
replaceRegex('src/adapters/suppliers/instances/VipResellerAdapter.ts', /console\.info\(\`\[\$\{this\.name\}\] Syncing full remote product list\.\.\.\`\);/g, "logger.info({ adapter: this.name }, `Syncing full remote product list...`);");
replaceRegex('src/adapters/suppliers/instances/VipResellerAdapter.ts', /console\.info\(\`\[\$\{this\.name\}\] Sending Order: \$\{params\.orderId\} \(Product: \$\{params\.productCode\}, Target: \$\{params\.target\}\)\`\);/g, "logger.info({ adapter: this.name, orderId: params.orderId, productCode: params.productCode, target: params.target }, `Sending Order`);");
replaceRegex('src/adapters/suppliers/instances/VipResellerAdapter.ts', /console\.info\(\`\[\$\{this\.name\}\] Dynamic transaction status sync check: \$\{internalOrderId\}\`\);/g, "logger.info({ adapter: this.name, internalOrderId }, `Dynamic transaction status sync check`);");

// 21. DigiflazzAdapter.ts
insertImport('src/adapters/suppliers/instances/DigiflazzAdapter.ts', "import { logger } from '../../../lib/logger';");
replaceRegex('src/adapters/suppliers/instances/DigiflazzAdapter.ts', /console\.error\('Digiflazz credentials validation error:', error\);/g, "logger.error({ error }, 'Digiflazz credentials validation error');");
replaceRegex('src/adapters/suppliers/instances/DigiflazzAdapter.ts', /console\.info\(\`\[\$\{this\.name\}\] Querying deposit balance\.\.\.\`\);/g, "logger.info({ adapter: this.name }, `Querying deposit balance...`);");
replaceRegex('src/adapters/suppliers/instances/DigiflazzAdapter.ts', /console\.info\(\`\[\$\{this\.name\}\] Syncing catalog pricelist catalog\.\.\.\`\);/g, "logger.info({ adapter: this.name }, `Syncing catalog pricelist catalog...`);");
replaceRegex('src/adapters/suppliers/instances/DigiflazzAdapter.ts', /console\.info\(\`\[\$\{this\.name\}\] Placing order: \$\{params\.orderId\} \(Product: \$\{params\.productCode\}, Target: \$\{params\.target\}\)\`\);/g, "logger.info({ adapter: this.name, orderId: params.orderId, productCode: params.productCode, target: params.target }, `Placing order`);");
replaceRegex('src/adapters/suppliers/instances/DigiflazzAdapter.ts', /console\.info\(\`\[\$\{this\.name\}\] Verification sync checking status: \$\{internalOrderId\}\`\);/g, "logger.info({ adapter: this.name, internalOrderId }, `Verification sync checking status`);");

