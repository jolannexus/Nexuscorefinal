import fs from 'fs';

let content = fs.readFileSync('src/services/suppliers/providerSelector.ts', 'utf8');
content = content.replace(
    /logger\.warn\(\`\[CircuitBreaker\] Provider \$\{supplierName\.toUpperCase\(\)\} tripped cooldown for 5m due to consecutive failures\.\`, \{\n         supplier: supplierName, \n         agencyId\n      \}\);/g,
    "logger.warn({ supplier: supplierName, agencyId }, `[CircuitBreaker] Provider ${supplierName.toUpperCase()} tripped cooldown for 5m due to consecutive failures.`);"
);
fs.writeFileSync('src/services/suppliers/providerSelector.ts', content);
