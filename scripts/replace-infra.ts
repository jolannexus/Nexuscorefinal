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
  { search: /Providersstructure/g, replace: 'Platform' },
  { search: /Providers/g, replace: 'Providers' } // keep Providers but clean up any mistakes
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
