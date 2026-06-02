import fs from 'fs';

const p = (file) => file;

const doReplace = (file, regex, replacement) => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content);
};

// 3. DiscountManager
doReplace(p('src/modules/Marketing/DiscountManager.tsx'),
    /console\.error\(\'Failed to fetch discounts\', error\);/g,
    `setFetchError('Gagal memuat discount. Coba refresh halaman.');`);
doReplace(p('src/modules/Marketing/DiscountManager.tsx'),
    /const \[discounts, setDiscounts\] = useState<DiscountRule\[\]>\(\[\]\);/,
    `const [discounts, setDiscounts] = useState<DiscountRule[]>([]);\n  const [fetchError, setFetchError] = useState<string | null>(null);`);
doReplace(p('src/modules/Marketing/DiscountManager.tsx'),
    /setLoading\(true\);/,
    `setLoading(true);\n      setFetchError(null);`);
doReplace(p('src/modules/Marketing/DiscountManager.tsx'),
    /<h2 className="text-xl flex items-center gap-2"><Tag className="w-5 h-5 text-indigo-400" \/> Diskon Spesial<\/h2>/,
    `<h2 className="text-xl flex items-center gap-2"><Tag className="w-5 h-5 text-indigo-400" /> Diskon Spesial</h2>\n        {fetchError && <p className="text-red-400 text-sm mt-2">{fetchError}</p>}`);

// 6. DeveloperSnippet
doReplace(p('src/modules/Network/DeveloperSnippet.tsx'),
    /console\.error\("Failed to generate snippet:", err\);/,
    `setGenError('Gagal generate snippet. Coba lagi.');`);
doReplace(p('src/modules/Network/DeveloperSnippet.tsx'),
    /const \[isLoading, setIsLoading\] = useState\(false\);/,
    `const [isLoading, setIsLoading] = useState(false);\n  const [genError, setGenError] = useState<string | null>(null);`);
doReplace(p('src/modules/Network/DeveloperSnippet.tsx'),
    /<\/button>/,
    `</button>\n          {genError && <p className="text-red-400 text-xs mt-1">{genError}</p>}`);

// 9. LedgerReconciliationManager
doReplace(p('src/modules/System/LedgerReconciliationManager.tsx'),
    /console\.error\('Error fetching financial audit logs:', err\);/g,
    `setError('Gagal memuat data. Refresh halaman atau hubungi admin.');`);
doReplace(p('src/modules/System/LedgerReconciliationManager.tsx'),
    /console\.error\('Error verifying integrity:', err\);/g,
    `setError('Gagal memuat data. Refresh halaman atau hubungi admin.');`);
doReplace(p('src/modules/System/LedgerReconciliationManager.tsx'),
    /console\.error\('Error fetching ledger journals:', err\);/g,
    `setError('Gagal memuat data. Refresh halaman atau hubungi admin.');`);
doReplace(p('src/modules/System/LedgerReconciliationManager.tsx'),
    /console\.error\('Reconciliation error:', err\);/g,
    `setError('Gagal memuat data. Refresh halaman atau hubungi admin.');`);
doReplace(p('src/modules/System/LedgerReconciliationManager.tsx'),
    /const \[journals, setJournals\] = useState<LedgerJournal\[\]>\(\[\]\);/,
    `const [journals, setJournals] = useState<LedgerJournal[]>([]);\n  const [error, setError] = useState<string | null>(null);`);
doReplace(p('src/modules/System/LedgerReconciliationManager.tsx'),
    /<h2 className="text-xl font-bold flex items-center gap-2">/,
    `{error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl mb-4">{error}</div>}\n      <h2 className="text-xl font-bold flex items-center gap-2">`);

// 12. SaaSModelManager
doReplace(p('src/modules/System/SaaSModelManager.tsx'),
    /console\.error\(e\);/,
    `setError('Gagal memuat konfigurasi SaaS model.');`);
doReplace(p('src/modules/System/SaaSModelManager.tsx'),
    /const \[loading, setLoading\] = useState\(false\);/,
    `const [loading, setLoading] = useState(false);\n  const [error, setError] = useState<string | null>(null);`);
doReplace(p('src/modules/System/SaaSModelManager.tsx'),
    /<h2 className="text-lg font-bold">Model Configuration<\/h2>/,
    `<h2 className="text-lg font-bold">Model Configuration</h2>\n          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}`);

// 21. IncomingWebhooksTable
doReplace(p('src/components/IncomingWebhooksTable.tsx'),
    /console\.error\('Failed to load incoming webhook logs:', err\);/g,
    `setError('Gagal memuat log');`);
doReplace(p('src/components/IncomingWebhooksTable.tsx'),
    /const \[loading, setLoading\] = useState\(true\);/,
    `const [loading, setLoading] = useState(true);\n  const [error, setError] = useState<string | null>(null);`);
doReplace(p('src/components/IncomingWebhooksTable.tsx'),
    /<h2 className="font-semibold px-4 pt-4 pb-2 text-slate-200">Incoming Webhooks<\/h2>/,
    `<h2 className="font-semibold px-4 pt-4 pb-2 text-slate-200">Incoming Webhooks</h2>\n      {error && <div className="text-red-500 px-4 pb-2 text-sm">{error}</div>}`);
doReplace(p('src/components/IncomingWebhooksTable.tsx'),
    /<h2 className="font-semibold px-4 pt-4 pb-2">Incoming Webhook Callbacks<\/h2>/,
    `<h2 className="font-semibold px-4 pt-4 pb-2">Incoming Webhook Callbacks</h2>\n      {error && <div className="text-red-500 px-4 pb-2 text-sm">{error}</div>}`);


// 23. WebhookLogsTable
doReplace(p('src/components/WebhookLogsTable.tsx'),
    /console\.error\('Failed to load webhook logs:', err\);/,
    `setError('Gagal memuat log');`);
doReplace(p('src/components/WebhookLogsTable.tsx'),
    /console\.error\('Failed to replay webhook:', err\);/,
    `setError('Gagal replay webhook');`);
doReplace(p('src/components/WebhookLogsTable.tsx'),
    /const \[logs, setLogs\] = useState<WebhookLog\[\]>\(\[\]\);/,
    `const [logs, setLogs] = useState<WebhookLog[]>([]);\n  const [error, setError] = useState<string | null>(null);`);
doReplace(p('src/components/WebhookLogsTable.tsx'),
    /<h2 className="text-lg font-bold flex items-center gap-2">/,
    `{error && <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded-md text-sm mb-3">{error}</div>}\n      <h2 className="text-lg font-bold flex items-center gap-2">`);

// 32. OnboardingFlow
doReplace(p('src/pages/onboarding/OnboardingFlow.tsx'),
    /console\.error\('Launch failed:', error\);/,
    `setLaunchError('Gagal meluncurkan. Periksa konfigurasi dan coba lagi.');`);
doReplace(p('src/pages/onboarding/OnboardingFlow.tsx'),
    /const \[deploying, setDeploying\] = useState\(false\);/,
    `const [deploying, setDeploying] = useState(false);\n  const [launchError, setLaunchError] = useState<string | null>(null);`);
doReplace(p('src/pages/onboarding/OnboardingFlow.tsx'),
    /<h2 className="text-3xl font-black mb-4 gap-2 flex items-center">/,
    `{launchError && <div className="text-red-400 bg-red-400/10 border border-red-400/20 p-3 rounded-lg mb-6">{launchError}</div>}\n            <h2 className="text-3xl font-black mb-4 gap-2 flex items-center">`);
