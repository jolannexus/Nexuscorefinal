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

  // Replace fraction borders and bg
  content = content.replace(/border-white\/\[0\.05\]/g, 'border-slate-800');
  content = content.replace(/border-white\/\[0\.03\]/g, 'border-slate-800');
  content = content.replace(/bg-white\/\[0\.02\]/g, 'bg-slate-900');
  content = content.replace(/bg-white\/\[0\.01\]/g, 'bg-slate-900');
  content = content.replace(/bg-white\/\[0\.03\]/g, 'bg-slate-800/50');
  content = content.replace(/bg-[a-zA-Z0-9_-]+\/\[0\.\d+\]/g, (match) => {
    return match.replace(/\[0\.0(1|2|3|4|5)\]/, '5');
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
