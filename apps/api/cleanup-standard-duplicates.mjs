/**
 * cleanup-standard-duplicates.mjs
 * ════════════════════════════════════════════════════════════════════
 * Détecte et supprime les cours standard EN/AR en doublon créés
 * par les différentes passes de scripts (fix-and-add, fix-remaining…).
 *
 * Stratégie :
 *   1. Regrouper les cours EN standard par topic (mots-clés)
 *   2. Pour chaque groupe de doublons, GARDER celui avec le plus
 *      de pages (contenu le plus riche) et SUPPRIMER les autres.
 *   3. Idem pour AR.
 *   4. Supprimer aussi les cours avec préfixe "Anglais — " ou
 *      "Arabe — " s'ils ont un équivalent proprement nommé.
 *
 * Usage :
 *   node cleanup-standard-duplicates.mjs --list    → aperçu sans suppression
 *   node cleanup-standard-duplicates.mjs           → suppression réelle
 * ════════════════════════════════════════════════════════════════════
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

const PB_URL    = process.env.PB_URL               || 'http://127.0.0.1:8090';
const PB_EMAIL  = process.env.PB_SUPERUSER_EMAIL    || '';
const PB_PASS   = process.env.PB_SUPERUSER_PASSWORD || '';
const LIST_ONLY = process.argv.includes('--list');

// ════════════════════════════════════════════════════════════════════
// GROUPES THÉMATIQUES — mots-clés pour regrouper les doublons EN
// ════════════════════════════════════════════════════════════════════
const EN_GROUPS = [
  { topic: 'time',         keys: ['time', 'temps', 'exprimer le temps'] },
  { topic: 'place',        keys: ['place', 'lieu', 'exprimer un lieu'] },
  { topic: 'prepositions', keys: ['preposition', 'préposition'] },
  { topic: 'london',       keys: ['london', 'londres'] },
  { topic: 'travel',       keys: ['travel', 'voyage', 'aventure'] },
];

// Mots-clés AR (sensibles à la casse)
const AR_GROUPS = [
  { topic: 'time',         keys: ['الزمن', 'الوقت'] },
  { topic: 'place',        keys: ['المكان'] },
  { topic: 'prepositions', keys: ['حروف الجر'] },
  { topic: 'london',       keys: ['لندن'] },
  { topic: 'travel',       keys: ['السفر', 'المغامرة'] },
];

// ════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════
function pageCount(course) {
  try {
    const p = typeof course.pages === 'string' ? JSON.parse(course.pages) : (course.pages || []);
    return Array.isArray(p) ? p.length : 0;
  } catch { return 0; }
}

function matchesGroup(titre, keys) {
  const t = titre.toLowerCase();
  return keys.some(k => t.includes(k.toLowerCase()));
}

function matchesGroupAR(titre, keys) {
  return keys.some(k => titre.includes(k));
}

// ════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════
async function main() {
  console.log('\n🧹 cleanup-standard-duplicates.mjs');
  console.log('═'.repeat(65));
  if (LIST_ONLY) console.log('📋 Mode aperçu — aucune suppression\n');

  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log(`✅ Connecté (${PB_URL})\n`);

  const allCourses = await pb.collection('courses').getFullList({ requestKey: null });

  const stdEN = allCourses.filter(c => c.langue === 'Anglais' && c.course_type === 'standard');
  const stdAR = allCourses.filter(c => c.langue === 'Arabe'   && c.course_type === 'standard');

  console.log(`📊 Standards : ${stdEN.length} EN · ${stdAR.length} AR\n`);

  const toDelete = [];

  // ── EN duplicates ─────────────────────────────────────────────────
  console.log('🇬🇧  Analyse EN\n' + '─'.repeat(50));
  for (const grp of EN_GROUPS) {
    const matches = stdEN.filter(c => matchesGroup(c.titre, grp.keys));
    if (matches.length <= 1) continue;

    // Trier : plus de pages = meilleur
    matches.sort((a, b) => pageCount(b) - pageCount(a));
    const keep = matches[0];
    const dups  = matches.slice(1);

    console.log(`  Topic "${grp.topic}" — ${matches.length} doublons :`);
    console.log(`    ✅ GARDER  (${pageCount(keep)} pages) "${keep.titre}" [${keep.id}]`);
    for (const d of dups) {
      console.log(`    🗑️  SUPPRIMER (${pageCount(d)} pages) "${d.titre}" [${d.id}]`);
      toDelete.push(d);
    }
  }

  // Supprimer aussi les cours avec préfixe "Anglais — " si doublon propre existe
  for (const c of stdEN) {
    if (c.titre.startsWith('Anglais — ') || c.titre.startsWith('Anglais—')) {
      if (!toDelete.find(d => d.id === c.id)) {
        console.log(`  🗑️  Préfixe "Anglais — " : "${c.titre}" [${c.id}]`);
        toDelete.push(c);
      }
    }
  }

  // ── AR duplicates ─────────────────────────────────────────────────
  console.log('\n🇸🇦  Analyse AR\n' + '─'.repeat(50));
  for (const grp of AR_GROUPS) {
    const matches = stdAR.filter(c => matchesGroupAR(c.titre, grp.keys));
    if (matches.length <= 1) continue;

    matches.sort((a, b) => pageCount(b) - pageCount(a));
    const keep = matches[0];
    const dups  = matches.slice(1);

    console.log(`  Topic "${grp.topic}" — ${matches.length} doublons :`);
    console.log(`    ✅ GARDER  (${pageCount(keep)} pages) "${keep.titre}" [${keep.id}]`);
    for (const d of dups) {
      console.log(`    🗑️  SUPPRIMER (${pageCount(d)} pages) "${d.titre}" [${d.id}]`);
      toDelete.push(d);
    }
  }

  // Préfixe "Arabe — "
  for (const c of stdAR) {
    if (c.titre.startsWith('Arabe — ') || c.titre.startsWith('Arabe—')) {
      if (!toDelete.find(d => d.id === c.id)) {
        console.log(`  🗑️  Préfixe "Arabe — " : "${c.titre}" [${c.id}]`);
        toDelete.push(c);
      }
    }
  }

  // ── Résumé et suppression ──────────────────────────────────────────
  console.log('\n' + '═'.repeat(65));
  if (toDelete.length === 0) {
    console.log('✅ Aucun doublon détecté — base de données propre !');
    return;
  }

  console.log(`🗑️  ${toDelete.length} cours à supprimer :\n`);
  toDelete.forEach(c => console.log(`  • [${c.langue}] "${c.titre}" [${c.id}]`));

  if (LIST_ONLY) {
    console.log('\n⚠️  Mode aperçu — relancez sans --list pour supprimer.');
    return;
  }

  console.log('\n🚀 Suppression en cours…');
  let deleted = 0, errors = 0;
  for (const c of toDelete) {
    try {
      await pb.collection('courses').delete(c.id, { requestKey: null });
      console.log(`  ✅ Supprimé : "${c.titre}"`);
      deleted++;
    } catch (e) {
      console.log(`  ❌ Erreur   : "${c.titre}" — ${e.message}`);
      errors++;
    }
  }

  console.log('\n' + '═'.repeat(65));
  console.log(`📊 Résultats : ${deleted} supprimés · ${errors} erreurs`);
  if (errors) console.log('   Relancer le script pour ré-essayer.');
  console.log('');
}

main().catch(e => { console.error('❌ Erreur fatale :', e.message); process.exit(1); });
