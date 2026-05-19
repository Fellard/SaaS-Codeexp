/**
 * add-exercise-translations.mjs
 * ════════════════════════════════════════════════════════════════
 * Génère automatiquement les traductions des exercices via Claude API
 *
 * Règles :
 *   • cours français  → traduction anglaise (gris)
 *   • cours anglais   → traduction française (gris)
 *   • cours arabe     → traduction anglaise (gris)
 *
 * Usage :
 *   node add-exercise-translations.mjs            (tous les cours)
 *   node add-exercise-translations.mjs --dry-run  (aperçu sans écriture)
 *   node add-exercise-translations.mjs --id COURSE_ID  (un seul cours)
 * ════════════════════════════════════════════════════════════════
 */

import 'dotenv/config';
import PocketBase from 'pocketbase';
import Anthropic from '@anthropic-ai/sdk';
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
const FORCE    = process.argv.includes('--force');    // ré-traduire même si déjà traduit
const TARGET_ID = (() => {
  const i = process.argv.indexOf('--id');
  return i !== -1 ? process.argv[i + 1] : null;
})();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ════════════════════════════════════════════════════════════════
// DÉTECTION LANGUE DU COURS
// ════════════════════════════════════════════════════════════════
function detectCourseLang(course) {
  const langue = (course.langue || '').toLowerCase();
  const titre  = (course.titre  || course.title || '').toLowerCase();
  const desc   = (course.description || '').toLowerCase();
  const all    = langue + ' ' + titre + ' ' + desc;

  if (all.match(/arabe|arabic|\bar\b/)) return 'ar';
  if (all.match(/anglais|english|\ben\b/)) return 'en';
  return 'fr'; // par défaut : français
}

function getTargetLang(courseLang) {
  if (courseLang === 'en') return 'fr'; // cours anglais → trad française
  return 'en';                           // cours français ou arabe → trad anglaise
}

function getLangLabel(lang) {
  return lang === 'fr' ? 'French' : lang === 'en' ? 'English' : 'Arabic';
}

// ════════════════════════════════════════════════════════════════
// PARSE EXERCICES
// ════════════════════════════════════════════════════════════════
function parseExercises(raw) {
  if (!raw) return [];
  try {
    const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

// ════════════════════════════════════════════════════════════════
// VÉRIFIER SI DÉJÀ TRADUIT
// ════════════════════════════════════════════════════════════════
function alreadyTranslated(exercises) {
  if (!exercises.length) return false;
  return exercises.some(q => q.translation && q.translation.trim().length > 3);
}

// ════════════════════════════════════════════════════════════════
// APPEL CLAUDE POUR TRADUCTION D'UN BATCH D'EXERCICES
// ════════════════════════════════════════════════════════════════
async function translateExercises(exercises, sourceLang, targetLang) {
  const sourceName = getLangLabel(sourceLang);
  const targetName = getLangLabel(targetLang);

  const prompt = `You are a professional language teacher. Translate the following multiple-choice exercises from ${sourceName} to ${targetName}.

For each exercise, provide:
1. A translation of the question (replacing blanks ___ with ___ as well)
2. A short translation for each option (keep it concise, max 4 words per option)

IMPORTANT:
- Keep ___ (blanks) as ___ in the translation
- For short grammatical options (like "à", "en", "dans", "at", "in", "on"), give a brief meaning hint
- Return ONLY valid JSON, no explanation

Input exercises:
${JSON.stringify(exercises.map(q => ({
  id: q.id,
  question: q.question || q.q || '',
  options: q.options || (q.opts ? q.opts.map(o => typeof o === 'string' ? o : o.v) : []),
})), null, 2)}

Return this exact JSON structure:
[
  {
    "id": "...",
    "translation": "translated question here",
    "opt_translations": ["trans opt1", "trans opt2", "trans opt3", "trans opt4"]
  }
]`;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();

  // Extraire le JSON de la réponse
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Claude n\'a pas retourné de JSON valide');

  return JSON.parse(jsonMatch[0]);
}

// ════════════════════════════════════════════════════════════════
// FUSIONNER TRADUCTIONS DANS LES EXERCICES
// ════════════════════════════════════════════════════════════════
function mergeTranslations(exercises, translations) {
  const transMap = new Map(translations.map(t => [t.id, t]));
  return exercises.map(q => {
    const qId = q.id;
    const trans = transMap.get(qId);
    if (!trans) return q;
    return {
      ...q,
      translation: trans.translation || '',
      opt_translations: trans.opt_translations || [],
    };
  });
}

// ════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════
async function main() {
  console.log('\n🌐 add-exercise-translations.mjs — Traductions automatiques');
  console.log('═'.repeat(62));
  if (DRY_RUN) console.log('⚠️  MODE APERÇU — aucune écriture\n');

  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log(`✅ Connecté à PocketBase (${PB_URL})\n`);

  let courses = await pb.collection('courses').getFullList({ sort: 'created', requestKey: null });
  if (TARGET_ID) courses = courses.filter(c => c.id === TARGET_ID);

  console.log(`📚 ${courses.length} cours à traiter\n`);

  let updated = 0, skipped = 0, errors = 0;

  for (const course of courses) {
    const titre = course.titre || course.title || '(sans titre)';
    const exercises = parseExercises(course.exercises);

    if (!exercises.length) {
      console.log(`  ⏭  SKIP  "${titre}" — aucun exercice`);
      skipped++;
      continue;
    }

    if (!FORCE && alreadyTranslated(exercises)) {
      console.log(`  ✅ DÉJÀ  "${titre}" — traductions existantes`);
      skipped++;
      continue;
    }

    const courseLang  = detectCourseLang(course);
    const targetLang  = getTargetLang(courseLang);
    const targetLabel = getLangLabel(targetLang);

    console.log(`  🔄 TRAD  "${titre}"`);
    console.log(`           ${courseLang.toUpperCase()} → ${targetLabel} · ${exercises.length} exercices`);

    if (DRY_RUN) {
      console.log(`           ✅ (simulation)\n`);
      updated++;
      continue;
    }

    try {
      // Traiter par batch de 10 pour ne pas dépasser les limites
      const BATCH = 10;
      let allTranslations = [];
      for (let i = 0; i < exercises.length; i += BATCH) {
        const batch = exercises.slice(i, i + BATCH);
        const trans = await translateExercises(batch, courseLang, targetLang);
        allTranslations = [...allTranslations, ...trans];
        // Petite pause pour éviter rate limiting
        if (i + BATCH < exercises.length) await new Promise(r => setTimeout(r, 500));
      }

      const updatedExercises = mergeTranslations(exercises, allTranslations);

      await pb.collection('courses').update(course.id, {
        exercises: JSON.stringify(updatedExercises),
      }, { requestKey: null });

      console.log(`           ✅ Mis à jour !\n`);
      updated++;
    } catch (e) {
      console.error(`           ❌ Erreur : ${e.message}\n`);
      errors++;
    }

    // Pause entre les cours pour le rate limiting Claude
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('═'.repeat(62));
  console.log(`📊 Résultats : ${updated} traduits · ${skipped} ignorés · ${errors} erreurs`);
  if (DRY_RUN) console.log('⚠️  Relancez sans --dry-run pour appliquer');
  console.log('');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
