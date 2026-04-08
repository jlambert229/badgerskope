import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'peptide-info-database.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let fixed = 0;
for (const e of db.entries) {
  const p = e.catalog?.priceText;
  if (!p) continue;
  const m = p.match(/^(\$[\d,.]+ – \$[\d,.]+)Price range:/);
  if (m) {
    e.catalog.priceText = m[1];
    fixed++;
    console.log('FIXED:', e.catalog.title, '->', e.catalog.priceText);
  }
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2) + '\n', 'utf8');
console.log('fixed', fixed, 'price entries');
