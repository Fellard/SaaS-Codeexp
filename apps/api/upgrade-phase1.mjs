// upgrade-phase1.mjs
// Phase 1 : ajoute bridge_page (Pont linguistique) + q_fill + q_order + q_vf
//           à chacun des 39 cours originaux
import 'dotenv/config';
import PocketBase from 'pocketbase';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PB_URL   = process.env.PB_URL                || 'http://127.0.0.1:8090';
const PB_EMAIL = process.env.PB_SUPERUSER_EMAIL    || '';
const PB_PASS  = process.env.PB_SUPERUSER_PASSWORD || '';

const DATA_FILE = join(__dirname, 'upgrade-phase1-data.json');
const upgrades  = JSON.parse(readFileSync(DATA_FILE, 'utf8'));

async function main() {
  console.log('🚀 upgrade-phase1.mjs');
  console.log('=================================================================');
  console.log('   Phase 1 : Pont linguistique + Q_fill + Q_order + Q_vf');
  console.log(`   ${upgrades.length} cours à traiter\n`);

  const pb = new PocketBase(PB_URL);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log(`Connecté (${PB_URL})\n`);

  let upgraded = 0, alreadyDone = 0, notFound = 0;

  for (const upg of upgrades) {
    // Trouver le cours par titre + langue + course_type standard
    const res = await pb.collection('courses').getList(1, 5, {
      filter: `titre = "${upg.titre.replace(/"/g, '\\"')}" && langue = "${upg.langue}" && course_type = "standard"`,
      requestKey: null,
    });

    if (res.items.length === 0) {
      console.log(`  [NOT FOUND] (${upg.langue.substring(0,2)}) ${upg.titre.substring(0, 55)}`);
      notFound++;
      continue;
    }

    const course = res.items[0];
    let pages     = JSON.parse(course.pages     || '[]');
    let exercises = JSON.parse(course.exercises || '[]');

    // Idempotence : vérifier si le bridge_page est déjà présent
    const hasBridge = pages.some(p => p.id === upg.bridge_page.id);
    const hasFill   = exercises.some(e => e.id === upg.q_fill.id);
    const hasOrder  = exercises.some(e => e.id === upg.q_order.id);
    const hasVf     = exercises.some(e => e.id === upg.q_vf.id);

    if (hasBridge && hasFill && hasOrder && hasVf) {
      console.log(`  [ALREADY DONE] (${upg.langue.substring(0,2)}) ${upg.titre.substring(0, 55)}`);
      alreadyDone++;
      continue;
    }

    // Ajouter bridge_page si absent (en dernière position)
    if (!hasBridge) pages.push(upg.bridge_page);

    // Ajouter les exercices si absents
    if (!hasFill)  exercises.push(upg.q_fill);
    if (!hasOrder) exercises.push(upg.q_order);
    if (!hasVf)    exercises.push(upg.q_vf);

    const pagesStr     = JSON.stringify(pages);
    const exercisesStr = JSON.stringify(exercises);

    await pb.collection('courses').update(course.id, {
      pages:     pagesStr,
      exercises: exercisesStr,
    }, { requestKey: null });

    console.log(`  [UPGRADED] (${upg.langue.substring(0,2)}) ${upg.titre.substring(0, 55)} → ${pages.length}p / ${exercises.length}q`);
    upgraded++;
  }

  console.log('\n=================================================================');
  console.log(`Résultats : ${upgraded} mis à niveau / ${alreadyDone} déjà faits / ${notFound} introuvables`);
  console.log('\nChaque cours upgradé dispose maintenant de :');
  console.log('  📄 Pont linguistique FR|EN|AR (dernière page)');
  console.log('  ✏️  Q_fill  : Texte à trous (4 choix cliquables)');
  console.log('  ✏️  Q_order : Reconstruction de phrase (clic sur mots)');
  console.log('  ✏️  Q_vf    : Vrai / Faux avec explication');
}

main().catch(e => {
  console.error('Erreur fatale :', e.message);
  if (e.response?.data) console.error('Details PB:', JSON.stringify(e.response.data, null, 2));
  if (e.data) console.error('Details data:', JSON.stringify(e.data, null, 2));
  process.exit(1);
});
