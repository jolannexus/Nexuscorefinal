import * as fs from 'fs';

const file = './src/pages/PublicStore.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  { search: /Reliable Platform: 99\.9% Uptime/g, replace: 'Secure & Instant Delivery' },
  { search: /Ultra-fast top-ups for global games and live streaming platforms\. Powered by Nexus fulfillment cluster\. No delay\. No friction\./g, replace: 'Instant delivery for global games and digital vouchers. Secure payments and immediate fulfillment.' },
  { search: /Elevate Your <br className="hidden md:block" \/>\n.*<span className="text-primary italic">Digital Presence<\/span>/g, replace: 'Your Premium <br className="hidden md:block" />\n<span className="text-primary">Digital Store</span>' }
];

for (const { search, replace } of replacements) {
  content = content.replace(search, replace);
}

fs.writeFileSync(file, content, 'utf8');
console.log(`Updated PublicStore.tsx`);
