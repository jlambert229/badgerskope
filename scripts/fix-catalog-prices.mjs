import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const catPath = path.join(__dirname, '..', 'orbitrex-peptides.json');
const d = JSON.parse(fs.readFileSync(catPath, 'utf8'));

let fixed = 0;
for (const e of d.items) {
  const pr = e.priceText;
  if (!pr) continue;
  const m = pr.match(/^(\$[\d,.]+ – \$[\d,.]+)Price range:/);
  if (m) {
    e.priceText = m[1];
    fixed++;
    console.log('FIXED:', e.title, '->', e.priceText);
  }
}

fs.writeFileSync(catPath, JSON.stringify(d, null, 2) + '\n', 'utf8');
console.log('fixed', fixed);
