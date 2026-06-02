import fs from 'fs';
import path from 'path';

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) {
        console.log("File not found:", filePath);
        return;
    }
    let code = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    for (const r of replacements) {
        if (code.includes(r.search)) {
            code = code.replace(r.search, r.replace);
            changed = true;
        } else {
            console.log(`String not found in ${filePath}:\n${r.search}`);
        }
    }
    if (changed) fs.writeFileSync(filePath, code);
}

// 1. HealthMonitor
replaceInFile('src/modules/Supplier/HealthMonitor.tsx', [
    { search: `console.warn('Using client-side simulated health indicators:', error);`, replace: `` }
]);

// 2. Storefront
replaceInFile('src/modules/Reseller/Storefront.tsx', [
    { search: `console.warn("Connection check bypassed. Resolving supplier locally.", fbErr);`, replace: `` }
]);

// 3. DiscountManager
replaceInFile('src/modules/Marketing/DiscountManager.tsx', [
    {
        search: `const [loading, setLoading] = useState(false);`,
        replace: `const [loading, setLoading] = useState(false);\n  const [fetchError, setFetchError] = useState<string | null>(null);`
    },
    { search: `setLoading(true);`, replace: `setLoading(true);\n      setFetchError(null);` },
    { search: `console.error('Failed to fetch discounts', error);`, replace: `setFetchError('Gagal memuat discount. Coba refresh halaman.');` },
    {
        search: `<h2 className="text-xl flex items-center gap-2"><Tag className="w-5 h-5 text-indigo-400" /> Diskon Spesial</h2>`,
        replace: `<h2 className="text-xl flex items-center gap-2"><Tag className="w-5 h-5 text-indigo-400" /> Diskon Spesial</h2>\n        {fetchError && <p className="text-red-400 text-sm mt-2">{fetchError}</p>}`
    }
]);

// 4. DomainManager
replaceInFile('src/modules/WhiteLabel/DomainManager.tsx', [
    { search: `console.error(e);`, replace: `` },
    { search: `console.error(e); // duplicate`, replace: `` } // Will get handled by string matching if multiple? Replace is single by default.
]);
// Actually, let's use string replacement globally or loop for DomainManager since it has 2 `console.error(e);`
let domMan = fs.readFileSync('src/modules/WhiteLabel/DomainManager.tsx', 'utf8');
fs.writeFileSync('src/modules/WhiteLabel/DomainManager.tsx', domMan.replace(/console\.error\(e\);/g, ''));


// 5. OrderHistory
replaceInFile('src/modules/orders/OrderHistory.tsx', [
    { search: `console.error(err);`, replace: `alert('Gagal retry order. Silakan coba lagi.');` }
]);

// 6. DeveloperSnippet
replaceInFile('src/modules/Network/DeveloperSnippet.tsx', [
    { search: `const [apiKey, setApiKey] = useState('live_sk_test_7a9f_12bcj');`, replace: `const [apiKey, setApiKey] = useState('live_sk_test_7a9f_12bcj');\n  const [genError, setGenError] = useState<string | null>(null);` },
    { search: `console.error("Failed to generate snippet:", err);`, replace: `setGenError('Gagal generate snippet. Coba lagi.');` },
    { search: `Generate SDK`, replace: `Generate SDK` },
    // Actually we need to put it below the button. The button says <span className="font-bold">AI Generate</span>
    { search: `</button>`, replace: `</button>\n          {genError && <p className="text-red-400 text-xs mt-1">{genError}</p>}` }
]);

// 7. QRISPaymentValidator
replaceInFile('src/modules/billing/QRISPaymentValidator.tsx', [
    { search: `console.error('Failed to sync deposit:', err);`, replace: `` }
]);

// 8. AnnouncementManager
replaceInFile('src/modules/System/AnnouncementManager.tsx', [
    { search: `console.error(err);`, replace: `alert('Gagal publish announcement. Coba lagi.');` }
]);

// 9. LedgerReconciliationManager
replaceInFile('src/modules/System/LedgerReconciliationManager.tsx', [
    { search: `const [isReconciling, setIsReconciling] = useState(false);`, replace: `const [isReconciling, setIsReconciling] = useState(false);\n  const [error, setError] = useState<string | null>(null);` },
    { search: `console.error('Error fetching financial audit logs:', err);`, replace: `setError('Gagal memuat data. Refresh halaman atau hubungi admin.');` },
    { search: `console.error('Error verifying integrity:', err);`, replace: `setError('Gagal memuat data. Refresh halaman atau hubungi admin.');` },
    { search: `console.error('Error fetching ledger journals:', err);`, replace: `setError('Gagal memuat data. Refresh halaman atau hubungi admin.');` },
    { search: `console.error('Reconciliation error:', err);`, replace: `setError('Gagal memuat data. Refresh halaman atau hubungi admin.');` },
    { search: `<h2 className="text-xl font-bold flex items-center gap-2">`, replace: `{error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl mb-4">{error}</div>}\n      <h2 className="text-xl font-bold flex items-center gap-2">` }
]);

// 10. LedgerDriftMonitor
replaceInFile('src/modules/System/LedgerDriftMonitor.tsx', [
    { search: `console.error('Failed to fetch reconciliation records', err);`, replace: `` }
]);

// 11. BalanceAlerts
replaceInFile('src/modules/System/BalanceAlerts.tsx', [
    { search: `console.error('Failed to load integrity alerts:', err);`, replace: `` }
]);

// 12. SaaSModelManager
replaceInFile('src/modules/System/SaaSModelManager.tsx', [
    { search: `const [loading, setLoading] = useState(true);`, replace: `const [loading, setLoading] = useState(true);\n  const [error, setError] = useState<string | null>(null);` },
    { search: `console.error(e);`, replace: `setError('Gagal memuat konfigurasi SaaS model.');` },
    { search: `<h2 className="text-lg font-bold">Model Configuration</h2>`, replace: `<h2 className="text-lg font-bold">Model Configuration</h2>\n          {error && <p className="text-red-400 text-sm">{error}</p>}` }
]);

// 13. ProductCatalog
replaceInFile('src/modules/products/ProductCatalog.tsx', [
    { search: `console.error('Global sync failed:', err);`, replace: `` }
]);

// 14. BulkPricingControl
replaceInFile('src/modules/products/BulkPricingControl.tsx', [
    { search: `console.error('Failed to apply pricing rule:', err);`, replace: `alert('Gagal menerapkan pricing rule. Periksa koneksi dan coba lagi.');` }
]);

// 15. SupplierModule
replaceInFile('src/modules/suppliers/SupplierModule.tsx', [
    { search: `const [error, setError] = useState<string | null>(null);`, replace: `const [errorState, setErrorState] = useState<string | null>(null);` },
    { search: `console.error(err);`, replace: `setErrorState('Gagal memuat data provider.');` }
]);
let supMod = fs.readFileSync('src/modules/suppliers/SupplierModule.tsx', 'utf8');
supMod = supMod.replace(/console\.error\(err\);/g, `setError('Gagal melakukan aksi ini.');`);
fs.writeFileSync('src/modules/suppliers/SupplierModule.tsx', supMod);

// 16. ResellerModule
replaceInFile('src/modules/resellers/ResellerModule.tsx', [
    { search: `const [error, setError] = useState<string | null>(null);`, replace: `const [error, setError] = useState<string | null>(null);` },
    { search: `console.error(err);`, replace: `setError('Terjadi kesalahan memuat data.');` }
]);
let resMod = fs.readFileSync('src/modules/resellers/ResellerModule.tsx', 'utf8');
resMod = resMod.replace(/console\.error\(err\);/g, `setError('Terjadi kesalahan.');`);
fs.writeFileSync('src/modules/resellers/ResellerModule.tsx', resMod);

// 17. FulfillmentPipeline
replaceInFile('src/modules/Order/FulfillmentPipeline.tsx', [
    { search: `console.error("Fulfillment error:", error);`, replace: `` }
]);

// 18. DepositHub
let depHub = fs.readFileSync('src/modules/Order/DepositHub.tsx', 'utf8');
depHub = depHub.replace(/const \[loading, setLoading\] = useState\(false\);/, `const [loading, setLoading] = useState(false);\n  const [error, setError] = useState<string | null>(null);`);
depHub = depHub.replace(/console\.error\(err\);/g, `setError('Terjadi kesalahan. Coba ulangi request.');`);
depHub = depHub.replace(/<CreditCard className="w-6 h-6 text-emerald-400" \/>/, `<CreditCard className="w-6 h-6 text-emerald-400" />\n          {error && <span className="text-red-400 text-sm">{error}</span>}`);
fs.writeFileSync('src/modules/Order/DepositHub.tsx', depHub);

// 21. IncomingWebhooksTable
replaceInFile('src/components/IncomingWebhooksTable.tsx', [
    { search: `const [loading, setLoading] = useState(true);`, replace: `const [loading, setLoading] = useState(true);\n  const [error, setError] = useState<string | null>(null);` },
    { search: `console.error('Failed to load incoming webhook logs:', err);`, replace: `setError('Gagal memuat log');` },
    { search: `<h2 className="font-semibold px-4 pt-4 pb-2">Incoming Webhook Callbacks</h2>`, replace: `<h2 className="font-semibold px-4 pt-4 pb-2">Incoming Webhook Callbacks</h2>\n      {error && <div className="text-red-500 px-4 pb-2 text-sm">{error}</div>}` }
]);

// 22. Header
replaceInFile('src/components/common/Header.tsx', [
    { search: `console.error('Logout error:', error);`, replace: `alert('Logout gagal. Coba lagi.');` }
]);

// 23. WebhookLogsTable
replaceInFile('src/components/WebhookLogsTable.tsx', [
    { search: `const [logs, setLogs] = useState([]);`, replace: `const [logs, setLogs] = useState([]);\n  const [error, setError] = useState<string | null>(null);` },
    { search: `console.error('Failed to load webhook logs:', err);`, replace: `setError('Gagal memuat log');` },
    { search: `console.error('Failed to replay webhook:', err);`, replace: `setError('Gagal replay webhook');` },
    { search: `<h2 className="text-lg font-bold flex items-center gap-2">`, replace: `{error && <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded-md text-sm mb-3">{error}</div>}\n      <h2 className="text-lg font-bold flex items-center gap-2">` }
]);

// 24. useOrders
replaceInFile('src/hooks/useOrders.ts', [
    { search: `console.error('Order processing background error:', err);`, replace: `` },
    { search: `console.error('Manual retry failed:', err);`, replace: `` }
]);

// 25. App.tsx
replaceInFile('src/App.tsx', [
    { search: `console.error("Chunk loading failed:", error);`, replace: `` },
    { search: `console.warn("Attempting recovery reload due to chunk load failure...");`, replace: `` }
]);

// 26. AuthContext
replaceInFile('src/contexts/AuthContext.tsx', [
    { search: `console.error('Error refreshing active session:', error);`, replace: `` }
]);

// 27. TenantContext
replaceInFile('src/contexts/TenantContext.tsx', [
    { search: `console.error('Resilient safety trap: failed resolving tenant context:', error);`, replace: `` }
]);

// 28. diagnostics.ts
replaceInFile('src/utils/diagnostics.ts', [
    { search: `console.info(msg, style);`, replace: `if (import.meta.env.DEV) {\n      console.info(msg, style);\n    }` },
    { search: `console.info(msg);`, replace: `if (import.meta.env.DEV) {\n      console.info(msg);\n    }` }
]);

// 29. Dashboard
replaceInFile('src/pages/Dashboard.tsx', [
    { search: `console.error('Error parsing SSE event in Dashboard:', err);`, replace: `` },
    { search: `console.warn('Real-time notification stream error (retrying):', err);`, replace: `` }
]);

// 30. PublicStore
replaceInFile('src/pages/PublicStore.tsx', [
    { search: `console.error("Tracking lookup error:", e);`, replace: `` },
    { search: `console.error("Failed to load products", err);`, replace: `` }
]);

// 31. ProductDashboard
replaceInFile('src/pages/products/ProductDashboard.tsx', [
    { search: `console.error('Global sync failed:', err);`, replace: `alert('Gagal sync global. Coba lagi.');` },
    { search: `console.error('Toggle failed:', err);`, replace: `alert('Gagal toggle. Coba lagi.');` }
]);

// 32. OnboardingFlow
replaceInFile('src/pages/onboarding/OnboardingFlow.tsx', [
    { search: `const [deploying, setDeploying] = useState(false);`, replace: `const [deploying, setDeploying] = useState(false);\n  const [launchError, setLaunchError] = useState<string | null>(null);` },
    { search: `console.error('Launch failed:', error);`, replace: `setLaunchError('Gagal meluncurkan. Periksa konfigurasi dan coba lagi.');` },
    { search: `<h2 className="text-3xl font-black mb-4"><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Ready to Launch</span></h2>`, replace: `<h2 className="text-3xl font-black mb-4"><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Ready to Launch</span></h2>\n            {launchError && <div className="text-red-400 bg-red-400/10 border border-red-400/20 p-3 rounded-lg mb-6">{launchError}</div>}` }
]);
