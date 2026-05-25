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

  content = content.replace(/tracking-\[0\.\d+em\]/g, 'tracking-wider');
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
