import * as fs from 'fs';

const file = './src/pages/products/ProductDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  { search: /Asset Inventory/g, replace: 'Products' },
  { search: /<ShieldCheck className="w-3\.5 h-3\.5 text-primary" \/>\n\s*Node Fulfillment Cluster \/\n\s*<\/p>/g, replace: '<ShieldCheck className="w-3.5 h-3.5 text-primary" />\nManage your product catalog\n</p>' },
  { search: /Margin Control/g, replace: 'Bulk Pricing' }
];

for (const { search, replace } of replacements) {
  content = content.replace(search, replace);
}

fs.writeFileSync(file, content, 'utf8');
console.log(`Updated ProductDashboard.tsx`);
