import PocketBase from 'pocketbase';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
try {
  const env = readFileSync(join(__dirname, '.env'), 'utf8');
  env.split('\n').forEach(l => { const m = l.match(/^([^#=]+)=(.*)$/); if (m) process.env[m[1].trim()] = m[2].trim(); });
} catch {}
const pb = new PocketBase(process.env.PB_URL || 'http://127.0.0.1:8090');
await pb.collection('_superusers').authWithPassword(process.env.PB_SUPERUSER_EMAIL, process.env.PB_SUPERUSER_PASSWORD);
const all = await pb.collection('courses').getFullList({ $autoCancel: false });
let count = 0;
for (const c of all) {
  const t = c.titre || '';
  if (!t.toLowerCase().includes('tip top') && !t.toLowerCase().includes('tiptop')) continue;
  const newTitre = t
    .replace(/Tip Top!\s*2\s*[—–-]\s*/gi, '')
    .replace(/Tip Top!\s*2/gi, '')
    .replace(/TipTop\s*2\s*[—–-]\s*/gi, '')
    .trim();
  await pb.collection('courses').update(c.id, { titre: newTitre }, { $autoCancel: false });
  console.log(`✅ "${t}" → "${newTitre}"`);
  count++;
}
console.log(`\n${count} cours renommés.`);
