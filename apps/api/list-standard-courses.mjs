import 'dotenv/config';
import PocketBase from 'pocketbase';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
try {
  const env = readFileSync(join(__dirname, '.env'), 'utf8');
  env.split('\n').forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
} catch {}

const pb = new PocketBase(process.env.PB_URL || 'http://127.0.0.1:8090');
pb.autoCancellation(false);
await pb.collection('_superusers').authWithPassword(
  process.env.PB_SUPERUSER_EMAIL, process.env.PB_SUPERUSER_PASSWORD
);

const all = await pb.collection('courses').getFullList({ requestKey: null });
const fr  = all.filter(c => c.langue === 'Francais' && c.course_type !== 'audio');
const en  = all.filter(c => c.langue === 'Anglais'  && c.course_type === 'standard');
const ar  = all.filter(c => c.langue === 'Arabe'    && c.course_type === 'standard');

const pages = c => { try { const p = typeof c.pages==='string'?JSON.parse(c.pages):c.pages; return Array.isArray(p)?p.length:0; } catch{return 0;} };

console.log(`\n===== FRANCAIS (${fr.length}) =====`);
fr.forEach((c,i) => console.log(`  ${String(i+1).padStart(2)}. ${c.titre}`));

console.log(`\n===== ANGLAIS (${en.length}) =====`);
en.forEach((c,i) => console.log(`  ${String(i+1).padStart(2)}. [${pages(c)}p] ${c.titre}`));

console.log(`\n===== ARABE (${ar.length}) =====`);
ar.forEach((c,i) => console.log(`  ${String(i+1).padStart(2)}. [${pages(c)}p] ${c.titre}`));
