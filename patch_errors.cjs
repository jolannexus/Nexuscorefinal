const fs = require('fs');

// 1. IncomingWebhooksTable.tsx
let incHooks = fs.readFileSync('src/components/IncomingWebhooksTable.tsx', 'utf8');
incHooks = incHooks.replace(/const \[loading, setLoading\] = useState\(true\);\n  const \[error, setError\] = useState<string \| null>\(null\);\n  const \[error, setError\] = useState<string \| null>\(null\);/, 
  "const [loading, setLoading] = useState(true);\n  const [error, setError] = useState<string | null>(null);");
incHooks = incHooks.replace(/const \[error, setError\] = useState<string \| null>\(null\);\n  const \[error, setError\] = useState<string \| null>\(null\);/g, "const [error, setError] = useState<string | null>(null);");
fs.writeFileSync('src/components/IncomingWebhooksTable.tsx', incHooks);

// 2. WebhookLogsTable.tsx - missing setError?
let hookLogs = fs.readFileSync('src/components/WebhookLogsTable.tsx', 'utf8');
if (!hookLogs.includes('const [error, setError]')) {
  hookLogs = hookLogs.replace(/const \[logs, setLogs\] = useState<any\[\]>\(\[\]\);/, "const [logs, setLogs] = useState<any[]>([]);\n  const [error, setError] = useState<string | null>(null);");
}
fs.writeFileSync('src/components/WebhookLogsTable.tsx', hookLogs);

// 3. DiscountManager.tsx
let discountMan = fs.readFileSync('src/modules/Marketing/DiscountManager.tsx', 'utf8');
if (!discountMan.includes('const [fetchError, setFetchError]')) {
  discountMan = discountMan.replace(/const \[loading, setLoading\] = useState.true.;/g, "const [loading, setLoading] = useState(true);\n  const [fetchError, setFetchError] = useState<string | null>(null);");
  discountMan = discountMan.replace(/const \[loading, setLoading\] = useState.false.;/g, "const [loading, setLoading] = useState(false);\n  const [fetchError, setFetchError] = useState<string | null>(null);");
}
fs.writeFileSync('src/modules/Marketing/DiscountManager.tsx', discountMan);

// 4. ResellerModule.tsx
let resellerMod = fs.readFileSync('src/modules/resellers/ResellerModule.tsx', 'utf8');
if (!resellerMod.includes('const [error, setError]')) {
  resellerMod = resellerMod.replace(/const \[searchQuery, setSearchQuery\] = useState\(''\);/, "const [searchQuery, setSearchQuery] = useState('');\n  const [error, setError] = useState<string | null>(null);");
}
fs.writeFileSync('src/modules/resellers/ResellerModule.tsx', resellerMod);

// 5. SupplierModule.tsx
let suppMod = fs.readFileSync('src/modules/suppliers/SupplierModule.tsx', 'utf8');
suppMod = suppMod.replace(/setErrorState\(/g, "setError(");
if (!suppMod.includes('const [error, setError]')) {
  suppMod = suppMod.replace(/const \[showConnectForm, setShowConnectForm\] = useState\(false\);/, "const [showConnectForm, setShowConnectForm] = useState(false);\n  const [error, setError] = useState<string | null>(null);");
}
fs.writeFileSync('src/modules/suppliers/SupplierModule.tsx', suppMod);

// 6. OnboardingFlow.tsx
let onboardFlow = fs.readFileSync('src/pages/onboarding/OnboardingFlow.tsx', 'utf8');
if (!onboardFlow.includes('const [launchError, setLaunchError]')) {
  onboardFlow = onboardFlow.replace(/const \[isLaunching, setIsLaunching\] = useState\(false\);/, "const [isLaunching, setIsLaunching] = useState(false);\n  const [launchError, setLaunchError] = useState<string | null>(null);");
  onboardFlow = onboardFlow.replace(/const \[deploying, setDeploying\] = useState\(false\);/, "const [deploying, setDeploying] = useState(false);\n  const [launchError, setLaunchError] = useState<string | null>(null);");
}
fs.writeFileSync('src/pages/onboarding/OnboardingFlow.tsx', onboardFlow);

// 7. diagnostics.ts
let diag = fs.readFileSync('src/utils/diagnostics.ts', 'utf8');
diag = diag.replace(/import.meta.env.DEV/g, "(import.meta as any).env.DEV");
fs.writeFileSync('src/utils/diagnostics.ts', diag);

console.log("Done patching.");
