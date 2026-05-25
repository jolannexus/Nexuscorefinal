import * as fs from 'fs';

const file = './src/pages/SecurityCenter.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  { search: /System Defenses & Identity Protection Protocols/g, replace: 'Manage your account security' },
  { search: /Shield Status: Optimal/g, replace: 'Account Secured' },
  { search: /Biometric & Token Verification/g, replace: 'Two-Factor Authentication' },
  { search: /API Safeguard/g, replace: 'API Access' },
  { search: /Cryptographic Endpoint Protection/g, replace: 'Manage API security settings' },
  { search: /Audit Broadcast/g, replace: 'Recent Activity' },
  { search: /Real-time Node Access Logs/g, replace: 'Recent security events' },
  { search: /<span className="text-\[9px\] font-bold bg-red-500\/20 border border-red-500\/30 text-red-500 px-1\.5 py-0\.5 rounded uppercase tracking-wider">THREAT<\/span>/g, replace: '<span className="text-[9px] font-bold bg-red-500/20 border border-red-500/30 text-red-500 px-1.5 py-0.5 rounded uppercase tracking-wider">FAILED</span>' },
  { search: /Threat Level/g, replace: 'Security Score' },
  { search: /Operational Continuity/g, replace: 'Account Health' },
  { search: /Download Full Trail/g, replace: 'Download Logs' }
];

for (const { search, replace } of replacements) {
  content = content.replace(search, replace);
}

fs.writeFileSync(file, content, 'utf8');
console.log(`Updated SecurityCenter.tsx`);
