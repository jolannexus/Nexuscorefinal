import * as fs from 'fs';
import * as path from 'path';

function walk(dir: string, fileList: string[]) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist') {
        walk(path.join(dir, file), fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(path.join(dir, file));
    }
  }
}

const files: string[] = [];
walk('./src', files);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace border-white/5 with border-slate-800 and border-white/10 with border-slate-700
  content = content.replace(/border-white\/5/g, 'border-slate-800');
  content = content.replace(/border-white\/10/g, 'border-slate-800'); // same contrast roughly
  
  // Replace font-mono where it looks like subheading boilerplate
  content = content.replace(/font-mono uppercase/g, 'font-medium uppercase');
  content = content.replace(/font-mono text-xs/g, 'font-medium text-xs');
  content = content.replace(/text-xs font-mono/g, 'text-xs font-medium');
  content = content.replace(/text-sm font-mono/g, 'text-sm font-medium');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
