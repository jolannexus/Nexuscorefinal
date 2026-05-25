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

  // Find occurrences of Pascal_Pascal and replace with Pascal Pascal
  // e.g. Transaction_Logs -> Transaction Logs, Active_Node_Pool -> Active Node Pool
  // We'll run it a few times to catch Active_Node_Pool (2 underscores)
  
  const pascalRegex = /([A-Z][a-z]+)_([A-Z][a-z]+)/g;
  content = content.replace(pascalRegex, '$1 $2');
  content = content.replace(pascalRegex, '$1 $2'); 
  content = content.replace(pascalRegex, '$1 $2'); // run 3 times to cascade

  // Fix up specific weird ones
  content = content.replace(/System_Ready/g, 'System Ready');
  content = content.replace(/Game_v2/g, 'Game v2');
  content = content.replace(/Endpoint_URL/g, 'Endpoint URL');
  content = content.replace(/GamerStore_ID/g, 'GamerStore ID');
  content = content.replace(/Multi-Factor_Auth/g, 'Multi-Factor Auth');
  content = content.replace(/API_Safe_Guard/g, 'API Safe Guard');
  content = content.replace(/Nexus_Vault/g, 'Nexus Vault');
  content = content.replace(/Brand_Asset/g, 'Brand Asset');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
