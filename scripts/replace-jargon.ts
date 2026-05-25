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
  { search: /Account Overview/g, replace: 'Dashboard' },
  { search: /Workspace:/g, replace: 'Reseller:' },
  { search: /Available Balance/g, replace: 'Wallet Balance' },
  { search: /Operational Overview/g, replace: 'Dashboard' },
  { search: /System status: <span className="text-emerald-500">Operational<\/span>/g, replace: 'Status: <span className="text-emerald-500">Online</span>' },
  { search: /Region:/g, replace: 'Agency:' },
  { search: /Network Activity \& Revenue Volume/g, replace: 'Revenue & Transaction Volume' },
  { search: /Real-time aggregate across all connected ecosystems\./g, replace: 'Aggregate transaction data across your platform.' },
  { search: /Network Activity/g, replace: 'Transactions' },
  { search: /Live feed of global operational activity/g, replace: 'Recent orders across your network' },
  { search: /Infra/g, replace: 'Providers' },
  { search: /Awaiting operational activity\.\.\./g, replace: 'Awaiting recent orders...' },
  { search: /Real-time security events/g, replace: 'Recent security events' },
  { search: /Marketplace Catalog/g, replace: 'Product Catalog' }
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
