/**
 * patch-arabic-titles.mjs
 * ════════════════════════════════════════════════════════════════
 * Patche tous les titres des cours arabes dans PocketBase pour
 * suivre le format bilingue : "عربي — English (Level)"
 *
 * Usage : node patch-arabic-titles.mjs
 *         node patch-arabic-titles.mjs --dry-run
 * ════════════════════════════════════════════════════════════════
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
const DRY_RUN  = process.argv.includes('--dry-run');

// ════════════════════════════════════════════════════════════════
// TABLE DE CORRESPONDANCE — ancien titre → nouveau titre bilingue
// Format cible : "عربي — English (Level)"
// ════════════════════════════════════════════════════════════════
const TITLE_MAP = {
  // ── Cours alphabet (create-alphabet-courses.mjs) ──────────────
  'الحروف العربية — المستوى A0/A1':
    'الحروف العربية — Arabic Alphabet (A0/A1)',

  // ── Modules A1 audio (create-english-arabic-learning-courses.mjs) ─
  "Arabe A1 — Module 1 · L'alphabet arabe (الحروف العربية)":
    'الحروف العربية — The Arabic Alphabet · Module 1 (A1)',
  'Arabe A1 — Module 2 · Les salutations (التحيات والتعارف)':
    'التحيات والتعارف — Greetings & Introductions · Module 2 (A1)',
  'Arabe A1 — Module 3 · La famille (الأسرة)':
    'الأسرة — The Family · Module 3 (A1)',
  'Arabe A1 — Module 4 · Les chiffres et les couleurs (الأرقام والألوان)':
    'الأرقام والألوان — Numbers and Colours · Module 4 (A1)',
  'Arabe A1 — Module 5 · La nourriture et les repas (الطعام والوجبات)':
    'الطعام والوجبات — Food and Meals · Module 5 (A1)',
  'Arabe A1 — Module 6 · La ville et les transports (المدينة والنقل)':
    'المدينة والنقل — The City and Transport · Module 6 (A1)',
  'Arabe A1 — Bilan et évaluation finale (المراجعة والتقييم)':
    'المراجعة والتقييم — Final Review and Assessment (A1)',

  // Variantes possibles si déjà partiellement mis à jour
  'Arabic A1 — Module 1 · The Arabic Alphabet (الحروف العربية)':
    'الحروف العربية — The Arabic Alphabet · Module 1 (A1)',
  'Arabic A1 — Module 2 · Greetings (التحيات والتعارف)':
    'التحيات والتعارف — Greetings & Introductions · Module 2 (A1)',
  'Arabic A1 — Module 3 · The Family (الأسرة)':
    'الأسرة — The Family · Module 3 (A1)',
  'Arabic A1 — Module 4 · Numbers and Colours (الأرقام والألوان)':
    'الأرقام والألوان — Numbers and Colours · Module 4 (A1)',
  'Arabic A1 — Module 5 · Food and Meals (الطعام والوجبات)':
    'الطعام والوجبات — Food and Meals · Module 5 (A1)',
  'Arabic A1 — Module 6 · The City and Transport (المدينة والنقل)':
    'المدينة والنقل — The City and Transport · Module 6 (A1)',
  'Arabic A1 — Final Review and Assessment (المراجعة والتقييم)':
    'المراجعة والتقييم — Final Review and Assessment (A1)',

  // ── Cours standard (fix-and-add-standard-courses.mjs) ─────────
  'Arabe — Exprimer le temps (التعبير عن الزمن)':
    'التعبير عن الزمن — Expressing Time (A1–A2)',
  'Arabe — Exprimer un lieu (التعبير عن المكان)':
    'التعبير عن المكان — Expressing Location (A1–A2)',
  'Arabe — حروف الجر (Toutes les prépositions arabes)':
    'حروف الجر — Arabic Prepositions (A1–A2)',
  'Arabe — رسالة من لندن (Lettre de Londres)':
    'رسالة من لندن — A Letter from London (A2)',
  "Arabe — نص : السفر والمغامرة (Voyage et aventure)":
    'السفر والمغامرة — Travel and Adventure (A2)',
};

// ════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════
async function main() {
  console.log('\n🔤 patch-arabic-titles.mjs — Mise à jour des titres bilingues');
  console.log('═'.repeat(65));
  if (DRY_RUN) console.log('⚠️  MODE APERÇU — aucune écriture\n');

  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log(`✅ Connecté à PocketBase (${PB_URL})\n`);

  // Récupérer tous les cours arabes
  const all = await pb.collection('courses').getFullList({
    filter: 'langue="Arabe" || langue="ar"',
    requestKey: null,
  });

  console.log(`📚 ${all.length} cours arabes trouvés\n`);

  let updated = 0, skipped = 0, unknown = 0;

  for (const course of all) {
    const oldTitle = course.titre || course.title || '';
    const newTitle = TITLE_MAP[oldTitle];

    if (!newTitle) {
      // Vérifier si le titre est déjà au bon format (contient Arabic + العربية/عربي)
      const hasArabic = /[؀-ۿ]/.test(oldTitle);
      const hasLatin  = /[a-zA-Z]/.test(oldTitle);
      if (hasArabic && hasLatin) {
        console.log(`  ✅ OK     "${oldTitle}"`);
        skipped++;
      } else {
        console.log(`  ❓ INCONNU "${oldTitle}" — à corriger manuellement`);
        unknown++;
      }
      continue;
    }

    if (oldTitle === newTitle) {
      console.log(`  ✅ DÉJÀ OK "${newTitle}"`);
      skipped++;
      continue;
    }

    console.log(`  🔄 "${oldTitle}"`);
    console.log(`     → "${newTitle}"`);

    if (!DRY_RUN) {
      try {
        await pb.collection('courses').update(course.id, {
          titre: newTitle,
          title: newTitle,
        }, { requestKey: null });
        console.log(`     ✅ Mis à jour !\n`);
        updated++;
      } catch (e) {
        console.error(`     ❌ Erreur : ${e.message}\n`);
      }
    } else {
      console.log(`     ✅ (simulation)\n`);
      updated++;
    }
  }

  console.log('═'.repeat(65));
  console.log(`📊 Résultats : ${updated} mis à jour · ${skipped} déjà corrects · ${unknown} inconnus`);
  if (DRY_RUN) console.log('⚠️  Relancez sans --dry-run pour appliquer les changements');
  console.log('');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
