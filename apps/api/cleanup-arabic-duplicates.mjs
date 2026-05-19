/**
 * cleanup-arabic-duplicates.mjs
 * ════════════════════════════════════════════════════════════
 * Affiche tous les cours Arabe standard, détecte les doublons
 * (même sujet, titres différents) et supprime les anciens.
 *
 * Usage :  cd apps/api && node cleanup-arabic-duplicates.mjs
 * ════════════════════════════════════════════════════════════
 */

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

const PB_URL   = process.env.PB_URL               || 'http://127.0.0.1:8090';
const PB_EMAIL = process.env.PB_SUPERUSER_EMAIL    || '';
const PB_PASS  = process.env.PB_SUPERUSER_PASSWORD || '';

// IDs exacts des doublons à supprimer (anciens cours remplacés par les nouvelles versions)
// Doublon → Remplacé par
// td130cs4ist11zt  التعبير عن الزمن            → iuyveu92etv94kv  التعبير عن الزمن — Expressing Time in Arabic
// irzdrii7unmomqm  التعبير عن المكان            → aku0a8wjay4utz2  التعبير عن المكان — Expressing Place in Arabic
// 4ksik9l0degdb8c  Arabe — حروف الجر            → 1p9p91k66uel0e0  حروف الجر — Arabic Prepositions (A1–A2)
// o0j2bnr6gi6tcb8  Arabe — رسالة من لندن        → aqycq8mzh66j0zy  رسالة من لندن — A Letter from London (Arabic)
// 73r3ilnm5qn2q26  Arabe — نص : السفر والمغامرة → znc5ppvxq8t5rkm  السفر والمغامرة — Travel & Adventure (Arabic)
const IDS_TO_DELETE = [
  { id: 'td130cs4ist11zt', titre: 'التعبير عن الزمن' },
  { id: 'irzdrii7unmomqm', titre: 'التعبير عن المكان' },
  { id: '4ksik9l0degdb8c', titre: 'Arabe — حروف الجر (Toutes les prépositions arabes)' },
  { id: 'o0j2bnr6gi6tcb8', titre: 'Arabe — رسالة من لندن (Lettre de Londres)' },
  { id: '73r3ilnm5qn2q26', titre: 'Arabe — نص : السفر والمغامرة (Voyage et aventure)' },
];

async function main() {
  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);

  console.log('🔐 Authenticating...');
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log('✅ Authenticated\n');

  // ── Liste tous les cours Arabe standard ───────────────────────
  const all = await pb.collection('courses').getFullList({
    filter: `langue = "Arabe" && course_type = "standard"`,
    sort:   'created',
    requestKey: null,
  });

  console.log(`📋 Cours Arabe standard trouvés : ${all.length}`);
  console.log('─'.repeat(60));
  all.forEach((c, i) => {
    console.log(`  ${i + 1}. [${c.id}] ${c.titre}`);
  });
  console.log('─'.repeat(60));
  console.log('');

  // ── Suppression des anciens doublons ─────────────────────────
  console.log('🗑️  Recherche des doublons à supprimer...\n');

  let deleted = 0;
  let skipped = 0;

  for (const { id, titre } of IDS_TO_DELETE) {
    try {
      await pb.collection('courses').delete(id);
      console.log(`  ✅ Supprimé : "${titre}" (${id})`);
      deleted++;
    } catch (err) {
      const detail = err?.data ? JSON.stringify(err.data) : err.message;
      if (detail.includes('required relation')) {
        console.log(`  ⚠️  Bloqué (inscriptions) : "${titre}"`);
        try {
          await pb.collection('courses').update(id, { titre: `[DOUBLON] ${titre}` });
          console.log(`      ✓ Renommé en "[DOUBLON] ${titre}"`);
        } catch (e2) {
          console.error(`      ❌ Renommage échoué : ${e2.message}`);
        }
        skipped++;
      } else {
        console.error(`  ❌ Erreur : ${detail}`);
        skipped++;
      }
    }
  }

  console.log('\n════════════════════════════════════════════');
  console.log(`✅ Terminé : ${deleted} supprimé(s), ${skipped} bloqué(s)`);

  // ── Affiche l'état final ──────────────────────────────────────
  const final = await pb.collection('courses').getFullList({
    filter: `langue = "Arabe" && course_type = "standard"`,
    sort:   'created',
    requestKey: null,
  });
  console.log(`\n📋 Cours Arabe standard restants : ${final.length}`);
  final.forEach((c, i) => console.log(`  ${i + 1}. ${c.titre}`));
  console.log('════════════════════════════════════════════');
}

main().catch(err => {
  console.error('Fatal:', err?.data ? JSON.stringify(err.data) : err.message);
  process.exit(1);
});
