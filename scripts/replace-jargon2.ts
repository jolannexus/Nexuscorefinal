import * as fs from 'fs';
import * as path from 'path';

const walk = (dir: string, fileList: string[] = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === 'dist' || file === 'build') continue;
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walk(filePath, fileList);
    } else {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
};

const replacements = [
  { search: /Pricing Engine/g, replace: 'Pricing Control' },
  { search: /Connected Nodes/g, replace: 'Connected Providers' },
  { search: /Modify Config/g, replace: 'Manage Connection' },
  { search: /Setup Node/g, replace: 'Connect Provider' },
  { search: /Establishing secure handshake protocol/g, replace: 'Connecting to provider...' },
  { search: /Synchronizing updated security parameters/g, replace: 'Updating provider settings...' },
  { search: /Active Node Pool/g, replace: 'Active Providers' },
  { search: /Add New Node/g, replace: 'Add Provider' },
  { search: /Target Nodes:/g, replace: 'Audience:' },
  { search: /Generate Discount Node/g, replace: 'Create Discount' },
  { search: /Type Node/g, replace: 'Discount Type' },
  { search: /Support Nodes/g, replace: 'Support Channels' },
  { search: /Nexus Node/g, replace: 'Platform' },
  { search: /Industry standard encryption protocol\./g, replace: 'Secure Encrypted Connection.' },
  { search: /Sync Node Control/g, replace: 'Sync Catalog' },
  { search: /Every digital asset recharge is secured via our proprietary Nexus Vault protocol\. Sub-millisecond validation ensures your reseller channel remains anonymous and 100% compliant with global game publisher APIs\./g, replace: 'All transactions are fully secured and compliant with supplier requirements. Enjoy low latency processing for your catalog.' },
  { search: /Node Fulfillment Cluster/g, replace: 'Product Catalog' },
  { search: /Sync All Nodes/g, replace: 'Sync Providers' },
  { search: /transmitted via Vortex Node JKT-01 is cryptographically signed/g, replace: 'connections are cryptographically signed' },
  { search: /Gold Node/g, replace: 'Gold Partner' },
  { search: /Node Clearance/g, replace: 'Clearance' },
  { search: /Node Tier/g, replace: 'Tier' },
  { search: /Node Map/g, replace: 'System Status' },
  { search: /Nodes Online/g, replace: 'Systems Online' },
  { search: /Real-time Chart Simulation/g, replace: 'Platform Interface' },
  { search: /Mock Node Connections/g, replace: 'System Connections' },
  { search: /View Node Map/g, replace: 'View System Status' },
  { search: /Product Node/g, replace: 'Provider' },
  { search: /productService\.ts:22:\/\/ Normalization Engine/g, replace: '// Normalization logic' },
  { search: /Export Node Database/g, replace: 'Export Catalog' },
  { search: /affect the global front-facing identity of your Nexus Node/g, replace: 'affect the brand identity of your platform' },
  { search: /Routed 'store.game.id' via Edge Node_04/g, replace: 'Processed recent order request.' }
];

const files = walk('./src');
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const { search, replace } of replacements) {
    if (search.test(content)) {
      content = content.replace(search, replace);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
