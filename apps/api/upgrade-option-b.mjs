// upgrade-option-b.mjs
// Option B : remplace page 4 (exercices textuels) par "Exemples corrigés"
//            + ajoute Q8 (fill) + Q9 (order) + Q10 (vf) à chaque cours
import 'dotenv/config';
import PocketBase from 'pocketbase';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PB_URL   = process.env.PB_URL                || 'http://127.0.0.1:8090';
const PB_EMAIL = process.env.PB_SUPERUSER_EMAIL    || '';
const PB_PASS  = process.env.PB_SUPERUSER_PASSWORD || '';

// Charger les données depuis le fichier JSON
const DATA_FILE = join(__dirname, 'upgrade-b-data.json');
const upgrades  = JSON.parse(readFileSync(DATA_FILE, 'utf8'));

async function main() {
  console.log('🚀 upgrade-option-b.mjs');
  console.log('=================================================================');
  console.log('   Page 4 → Exemples corrigés | + Q8 (fill) + Q9 (order) + Q10 (vf)');

  const pb = new PocketBase(PB_URL);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log(`Connecté (${PB_URL})\n`);

  let upgraded = 0, alreadyDone = 0, notFound = 0;

  for (const upg of upgrades) {
    // Trouver le cours par titre + langue
    const res = await pb.collection('courses').getList(1, 5, {
      filter: `titre = "${upg.titre}" && langue = "${upg.langue}" && course_type = "standard"`,
      requestKey: null,
    });

    if (res.items.length === 0) {
      console.log(`  [NOT FOUND] ${upg.titre.substring(0, 55)}`);
      notFound++;
      continue;
    }

    const course = res.items[0];
    let pages     = JSON.parse(course.pages     || '[]');
    let exercises = JSON.parse(course.exercises || '[]');

    // Vérifier si déjà fait (Q10 présent)
    const hasQ10 = exercises.some(e => e.id === upg.q10.id);
    if (hasQ10) {
      console.log(`  [ALREADY DONE] ${upg.titre.substring(0, 55)}`);
      alreadyDone++;
      continue;
    }

    // ── Remplacer page 4 (index 3) par les exemples corrigés ──
    // On cherche la page dont l'id correspond à l'ancien p4, ou on cible l'index 3
    const p4Index = pages.findIndex((p, i) => i === 3);
    if (p4Index !== -1) {
      pages[p4Index] = upg.page4;
    } else if (pages.length >= 4) {
      pages[3] = upg.page4;
    }
    // Si page 4 n'existe pas encore, on ne l'ajoute pas (ne devrait pas arriver)

    // ── Ajouter Q8, Q9, Q10 ──
    const hasQ8 = exercises.some(e => e.id === upg.q8.id);
    const hasQ9 = exercises.some(e => e.id === upg.q9.id);
    if (!hasQ8) exercises.push(upg.q8);
    if (!hasQ9) exercises.push(upg.q9);
    exercises.push(upg.q10); // Q10 absence vérifiée plus haut

    const pagesStr     = JSON.stringify(pages);
    const exercisesStr = JSON.stringify(exercises);
    console.log(`  [DEBUG] ${upg.titre.substring(0, 40)} | pages=${pagesStr.length}c | exercises=${exercisesStr.length}c`);

    await pb.collection('courses').update(course.id, {
      pages:     pagesStr,
      exercises: exercisesStr,
    }, { requestKey: null });

    console.log(`  [UPGRADED] ${upg.titre.substring(0, 55)} → ${pages.length}p / ${exercises.length}q`);
    upgraded++;
  }

  console.log('\n=================================================================');
  console.log(`Résultats : ${upgraded} mis à niveau / ${alreadyDone} déjà faits / ${notFound} introuvables`);
  console.log(`\nChaque cours upgradé dispose maintenant de :`);
  console.log(`  📄 Page 4 : Exemples corrigés (lecture)`);
  console.log(`  📄 Page 5 : Pont linguistique FR|EN|AR`);
  console.log(`  ✏️  Q1-Q5  : QCM classiques`);
  console.log(`  ✏️  Q6     : Contexte réel`);
  console.log(`  ✏️  Q7     : Correction d'erreur`);
  console.log(`  ✏️  Q8     : Texte à trous (fill)`);
  console.log(`  ✏️  Q9     : Reconstruction de phrase (order)`);
  console.log(`  ✏️  Q10    : Vrai / Faux avec explication (vf)`);
}

main().catch(e => {
  console.error('Erreur fatale :', e.message);
  if (e.response?.data) console.error('Details PB:', JSON.stringify(e.response.data, null, 2));
  if (e.data) console.error('Details data:', JSON.stringify(e.data, null, 2));
  process.exit(1);
});
