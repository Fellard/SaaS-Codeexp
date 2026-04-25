/**
 * setup-course-types.mjs
 * ═══════════════════════════════════════════════════════════════════
 * 1. Ajoute le champ "course_type" (select: standard | audio)
 *    à la collection "courses" via l'API REST PocketBase.
 * 2. Marque les 7 cours Tip Top! A1.2 comme "audio".
 * 3. Marque tous les autres cours comme "standard".
 *
 * Usage :
 *   node setup-course-types.mjs
 * ═══════════════════════════════════════════════════════════════════
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

// ── IDs des 7 cours Tip Top! A1.2 (audio) ───────────────────────
const AUDIO_COURSE_IDS = new Set([
  '1yeiteynlt34xrt',  // Module 1 — Unité 1 (pistes 4-14)
  'w33cg61a0pho8f6',  // Module 2 — Unité 2 (pistes 15-23)
  'bkkzo0bslkalmqa',  // Module 3 — Unité 3 (pistes 24-34)
  'slnu1e8dqpidq8y',  // Module 4 — Unité 4 (pistes 35-43)
  'tko1h1ocellzf48',  // Module 5 — Unité 5 (pistes 44-52)
  'prq3piwkn1fflso',  // Module 6 — Unité 6 (pistes 53-60)
  'utg4lp6nyphwoin',  // Évaluations & DELF Prim (pistes 61-69)
]);

// ── Helpers fetch authentifié ────────────────────────────────────
function apiGet(url, token) {
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(r => r.json());
}

function apiPatch(url, token, body) {
  return fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }).then(r => r.json());
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  const pb = new PocketBase(PB_URL);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  const token = pb.authStore.token;
  console.log('✅ PocketBase connecté\n');

  // ── Étape 1 : Récupérer le schéma actuel de la collection ───────
  console.log('📋 Lecture du schéma de la collection "courses"…');
  const coll = await apiGet(`${PB_URL}/api/collections/courses`, token);

  if (!coll || !coll.fields) {
    console.error('❌ Impossible de lire la collection "courses" :', coll);
    process.exit(1);
  }

  const existingField = coll.fields.find(f => f.name === 'course_type');

  if (existingField) {
    console.log('  ✅ Champ "course_type" déjà présent — schéma inchangé.\n');
  } else {
    // ── Étape 2 : Ajouter le champ course_type ─────────────────────
    console.log('  ➕ Ajout du champ "course_type" (select: standard | audio)…');

    const newField = {
      name:        'course_type',
      type:        'select',
      required:    false,
      presentable: false,
      options: {
        maxSelect: 1,
        values:    ['standard', 'audio'],
      },
    };

    const updated = await apiPatch(
      `${PB_URL}/api/collections/courses`,
      token,
      { fields: [...coll.fields, newField] }
    );

    if (updated.fields?.find(f => f.name === 'course_type')) {
      console.log('  ✅ Champ "course_type" ajouté avec succès.\n');
    } else {
      console.error('  ❌ Échec ajout du champ :', JSON.stringify(updated, null, 2));
      process.exit(1);
    }
  }

  // ── Étape 3 : Récupérer tous les cours ──────────────────────────
  console.log('📚 Récupération de tous les cours…');
  const allCourses = await pb.collection('courses').getFullList({ perPage: 500, requestKey: null });
  console.log(`  ${allCourses.length} cours trouvés.\n`);

  // ── Étape 4 : Mettre à jour le champ course_type ─────────────────
  console.log('🏷️  Marquage des cours…\n');
  let countAudio = 0, countStandard = 0, countError = 0;

  for (const course of allCourses) {
    const isAudio  = AUDIO_COURSE_IDS.has(course.id);
    const newType  = isAudio ? 'audio' : 'standard';
    const icon     = isAudio ? '🎧' : '📚';
    const label    = course.cours_nom || course.title || course.titre || course.id;

    // Skip si déjà bon
    if (course.course_type === newType) {
      console.log(`  ✅ [${icon}] ${label} → déjà "${newType}"`);
      isAudio ? countAudio++ : countStandard++;
      continue;
    }

    try {
      await pb.collection('courses').update(course.id, { course_type: newType });
      console.log(`  ✅ [${icon}] ${label} → "${newType}"`);
      isAudio ? countAudio++ : countStandard++;
    } catch (e) {
      console.error(`  ❌ Erreur [${course.id}] : ${e.message}`);
      countError++;
    }
  }

  // ── Résumé ──────────────────────────────────────────────────────
  console.log('\n─── Résumé ─────────────────────────────────────');
  console.log(`  🎧 Cours audio    : ${countAudio}`);
  console.log(`  📚 Cours standard : ${countStandard}`);
  if (countError) console.log(`  ❌ Erreurs        : ${countError}`);
  console.log('\n✅ Configuration terminée !');
  console.log('   Le frontend peut maintenant distinguer les cours audio des cours standard.');
  console.log('   Rechargez l\'interface : http://localhost:5173/formations');
}

main().catch(console.error);
