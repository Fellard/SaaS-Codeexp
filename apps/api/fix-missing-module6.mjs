// fix-missing-module6.mjs
// Patch rapide : corrige le seul cours restant avec sort_order = 0
// c2pyz13tok4got1 — Anglais A1 — Module 6 · La ville et les transports
import 'dotenv/config';
import PocketBase from 'pocketbase';

const PB_URL   = process.env.PB_URL                || 'http://127.0.0.1:8090';
const PB_EMAIL = process.env.PB_SUPERUSER_EMAIL    || '';
const PB_PASS  = process.env.PB_SUPERUSER_PASSWORD || '';

async function main() {
  const pb = new PocketBase(PB_URL);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);

  const ID = 'c2pyz13tok4got1';
  const rec = await pb.collection('courses').update(ID, { sort_order: 56 }, { requestKey: null });
  console.log(`✅ [Anglais] sort_order → 56 — ${rec.titre}`);

  // Vérification finale : plus aucun cours non-exam à sort_order = 0 ?
  const remaining = await pb.collection('courses').getFullList({
    filter: 'sort_order = 0 && course_type != "exam"',
    requestKey: null,
  });

  if (remaining.length === 0) {
    console.log('\n✅ Tous les cours non-exam ont un sort_order > 0. Parcours cohérent !');
  } else {
    console.log(`\n⚠️  ${remaining.length} cours ont encore sort_order = 0 :`);
    remaining.forEach(c => console.log(`   - ${c.id} [${c.langue}] — ${c.titre}`));
  }

  // Résumé final
  for (const lang of ['Francais', 'Anglais', 'Arabe']) {
    const courses = await pb.collection('courses').getFullList({
      filter: `langue = "${lang}"`,
      sort: '+sort_order',
      requestKey: null,
    });
    const standard = courses.filter(c => c.course_type !== 'exam');
    const exam     = courses.find(c => c.course_type === 'exam');
    console.log(`\n  📚 ${lang} : ${standard.length} cours (sort_order 1→${Math.max(...standard.map(c=>c.sort_order))}) + examen (${exam?.sort_order ?? '?'})`);
  }
}

main().catch(e => { console.error('Erreur :', e.message); process.exit(1); });
