import fs from 'fs';

let content = fs.readFileSync('src/services/suppliers/providerSelector.ts', 'utf8');
content = content.replace("import { logger } from '../../utils/logger';\n", "");
fs.writeFileSync('src/services/suppliers/providerSelector.ts', content);
