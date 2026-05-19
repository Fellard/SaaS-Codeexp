/**
 * fix-niveau-a1-2.mjs
 * Met à jour le champ "niveau" des cours audio A1.2 de "A1" → "A1.2"
 */
import PocketBase from 'pocketbase';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
try {
  const env = readFileSync(join(__dirname, '.env'), 'utf8');
  env.split('\n').forEach(l => { const m = l.match(/^([^#=]+)=(.*)$/); if(m) process.env[m[1].trim()]=m[2].trim(); });
} catch {}

const pb = new PocketBase(process.env.PB_URL || 'http://127.0.0.1:8090');
await pb.collection('_superusers').authWithPassword(process.env.PB_SUPERUSER_EMAIL, process.env.PB_SUPERUSER_PASSWORD);

const all = await pb.collection('courses').getFullList({ $autoCancel: false });
let count = 0;

for (const c of all) {
  const titre = (c.titre || c.title || '').toLowerCase();
  // Cibler les cours de compréhension orale A1.2 et évaluation A1.2
  const isAudio = titre.includes('compréhension orale a1') ||
                  titre.includes('évaluation orale a1') ||
                  titre.includes('c\'est reparti') ||
                  titre.includes('unité') ||
                  titre.includes('module');
  
  if (!isAudio) continue;
  if (c.niveau === 'A1.2') { console.log(`  ✓ Déjà A1.2 : "${c.titre}"`); continue; }

  await pb.collection('courses').update(c.id, { niveau: 'A1.2' }, { $autoCancel: false });
  console.log(`  ✅ "${c.titre}" → niveau A1.2`);
  count++;
}

console.log(`\n${count} cours mis à jour en A1.2.`);
console.log('ℹ️  A1.2 = deuxième partie du niveau A1 (CECRL) — fin du niveau débutant.');
