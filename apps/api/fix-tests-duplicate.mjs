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
const pages = c => { try { const p = typeof c.pages==='string'?JSON.parse(c.pages):c.pages; return Array.isArray(p)?p.length:0; } catch{return 0;} };

// Trouver les doublons Tests EN
const testsEN = all.filter(c => c.langue === 'Anglais' && c.course_type === 'standard' && c.titre.includes('Tests'));
// Trouver les doublons Tests AR
const testsAR = all.filter(c => c.langue === 'Arabe'   && c.course_type === 'standard' && (c.titre.includes('اختبارات') || c.titre.includes('Tests')));

console.log('\n📋 Cours Tests EN :');
testsEN.forEach(c => console.log(`  [${pages(c)}p] ${c.titre} [${c.id}]`));
console.log('\n📋 Cours Tests AR :');
testsAR.forEach(c => console.log(`  [${pages(c)}p] ${c.titre} [${c.id}]`));

// Trier par pages DESC → garder le 1er (le plus riche), supprimer les suivants
const toDelete = [];
if (testsEN.length > 1) {
  testsEN.sort((a,b) => pages(b) - pages(a));
  toDelete.push(...testsEN.slice(1));
}
if (testsAR.length > 1) {
  testsAR.sort((a,b) => pages(b) - pages(a));
  toDelete.push(...testsAR.slice(1));
}

if (toDelete.length === 0) { console.log('\n✅ Aucun doublon — déjà propre.'); process.exit(0); }

console.log(`\n🗑️  Suppression de ${toDelete.length} doublon(s)…`);
for (const c of toDelete) {
  await pb.collection('courses').delete(c.id, { requestKey: null });
  console.log(`  ✅ Supprimé [${pages(c)}p] "${c.titre}" [${c.id}]`);
}
console.log('\n✅ Terminé — 13 EN · 13 AR désormais.');
