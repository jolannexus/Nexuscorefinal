import * as fs from 'fs';
import * as path from 'path';

const file = './src/pages/Landing.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  { search: /Orchestrate your digital <br className="hidden md:block" \/>\n.*<span.*>\n.*monetization ecosystem\n.*<\/span>/g, replace: 'The complete transaction <br className="hidden md:block" />\n<span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-300 to-slate-500">\nplatform for your business\n</span>' },
  { search: /Build, scale, and manage white-label wallets and transactional structures\. \n\s*Production-grade infrastructure designed for modern fintech, gaming, and creator platforms\./g, replace: 'Manage products, providers, resellers, and wallets in one unified platform. Built for modern businesses to scale their digital sales.' },
  { search: /Real-time ecosystem performance/g, replace: 'Dashboard revenue overview' },
  { search: /Capabilities designed for scale/g, replace: 'Everything you need to grow your business' },
  { search: /Everything you need to orchestrate complex monetization structures in a single platform\./g, replace: 'Manage your products, providers, and resellers from one powerful dashboard.' },
  { search: /Recharge Ecosystems/g, replace: 'Provider Integrations' },
  { search: /Connect seamlessly with major global suppliers and manage unified inventories for game credits, digital vouchers, and recurring subscriptions\./g, replace: 'Connect directly with multiple suppliers to manage unified product catalogs and automated fulfillment.' },
  { search: /Wallet Platform/g, replace: 'Wallet & Billing System' },
  { search: /Deploy multi-tenant ledger systems with automated reconciliations, threshold limits, and secure fund routing for all your partners\./g, replace: 'Manage reseller balances, process top-ups, and track every transaction with a built-in wallet system.' },
  { search: /White-label Environments/g, replace: 'White-label Storefronts' },
  { search: /Provide your resellers and agencies with fully branded, autonomous interfaces tailored to their unique commercial operations\./g, replace: 'Give your resellers a fully branded dashboard and storefront to sell products to their customers.' },
  { search: /Are you ready to scale your infrastructure\?/g, replace: 'Are you ready to scale your business?' },
  { search: /Join industry leaders using NexusCore to orchestrate transactions, empower resellers, and maximize digital monetization\./g, replace: 'Join businesses using NexusCore to manage their digital transactions and empower their resellers.' },
  { search: /Enterprise Platform Now Available/g, replace: 'NexusCore Business Platform' }
];

for (const { search, replace } of replacements) {
  content = content.replace(search, replace);
}

fs.writeFileSync(file, content, 'utf8');
console.log(`Updated Landing.tsx`);
