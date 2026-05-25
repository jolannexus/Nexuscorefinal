import * as fs from 'fs';

const file = './src/pages/Landing.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/Create Workspace/g, 'Create Account');

fs.writeFileSync(file, content, 'utf8');
console.log(`Updated Landing.tsx`);
