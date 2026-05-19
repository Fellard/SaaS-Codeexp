// fix-zero-sort-order.mjs
// Corrige les 21 cours avec sort_order = 0
// Ces cours "Module" ont été créés avant Phase 2 et sont passés à travers les mailles.
// Solution : sort_order 50-60+ par langue (après les cours existants 1-18, avant l'examen 999)
import 'dotenv/config';
import PocketBase from 'pocketbase';

const PB_URL   = process.env.PB_URL                || 'http://127.0.0.1:8090';
const PB_EMAIL = process.env.PB_SUPERUSER_EMAIL    || '';
const PB_PASS  = process.env.PB_SUPERUSER_PASSWORD || '';

// ─────────────────────────────────────────────────────────────────────────────
// Ordre pédagogique par ID de cours (détecté visuellement depuis PocketBase)
// ─────────────────────────────────────────────────────────────────────────────

const ARABIC_MODULES = [
  { id: 'b6nrz95uw5fh3yt', order: 50, titre: 'الحروف العربية — The Arabic Alphabet · Module 1' },
  { id: 'jbcsyuo1286gwbh', order: 51, titre: 'التحيات والتعارف — Greetings & Introductions · Module 2' },
  { id: '62sizeupdh8h4uk', order: 52, titre: 'الأسرة — The Family · Module 3 (A1)' },
  { id: 'xe5x8qkqybxoac1', order: 53, titre: 'الأرقام والألوان — Numbers and Colours · Module 4' },
  { id: 'u6f3lywovesf8tw', order: 54, titre: 'الطعام والوجبات — Food and Meals · Module 5 (A1)' },
  { id: '8jvy5lx96ctd6o1', order: 55, titre: 'المدينة والنقل — The City and Transport · Module 6' },
  { id: 'an8jxf1naa2u3j1', order: 56, titre: 'المراجعة والتقييم — Final Review and Assessment' },
];

const ENGLISH_MODULES = [
  { id: 'sn2baaic8ylzlnl', order: 50, titre: 'Anglais A1 — Module 1 · Se présenter' },
  { id: '85m0rq8dclno58h', order: 51, titre: 'Anglais A1 — Module 2 · La famille et la maison' },
  { id: '2hlztf7glx10l61', order: 52, titre: 'Anglais A1 — Module 3 · La vie quotidienne' },
  { id: '76dug8t4wjxcchv', order: 53, titre: 'Anglais A1 — Module 4 · Les courses et la nourriture' },
  { id: '92ljnifnmlbfyt3', order: 54, titre: 'Anglais A1 — Module 5 · Loisirs et sports' },
  { id: 'zceyq6kmvyeu7tz', order: 55, titre: 'Anglais A1 — Bilan et évaluation finale' },
];

const FRENCH_MODULES = [
  { id: '1yeiteynlt34xrt', order: 50, titre: 'Compréhension orale A1.2 — Module 1' },
  { id: 'w33cg61a0pho8f6', order: 51, titre: 'Compréhension orale A1.2 — Module 2' },
  { id: 'bkkzo0bslkalmqa', order: 52, titre: 'Compréhension orale A1.2 — Module 3' },
  { id: 'slnu1e8dqpidq8y', order: 53, titre: 'Compréhension orale A1.2 — Module 4' },
  { id: 'tko1h1ocellzf48', order: 54, titre: 'Compréhension orale A1.2 — Module 5' },
  { id: 'prq3piwkn1fflso', order: 55, titre: 'Compréhension orale A1.2 — Module 6' },
  { id: 'utg4lp6nyphwoin', order: 56, titre: 'Évaluation orale A1.2 — Tests et DELF Prim' },
];

async function main() {
  console.log('🚀 fix-zero-sort-order.mjs');
  console.log('=================================================================');
  console.log('   Correction des 21 cours avec sort_order = 0');

  const pb = new PocketBase(PB_URL);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log(`Connecté (${PB_URL})\n`);

  // D'abord, vérification : récupère tous les cours sort_order = 0
  const zeroCourses = await pb.collection('courses').getFullList({
    filter: 'sort_order = 0',
    requestKey: null,
  });
  console.log(`Cours avec sort_order = 0 trouvés : ${zeroCourses.length}\n`);

  const allModules = [
    ...ARABIC_MODULES.map(m => ({ ...m, langue: 'Arabe' })),
    ...ENGLISH_MODULES.map(m => ({ ...m, langue: 'Anglais' })),
    ...FRENCH_MODULES.map(m => ({ ...m, langue: 'Francais' })),
  ];

  let updated = 0, notFound = 0, skipped = 0;

  for (const mod of allModules) {
    // Vérifie que le cours existe dans la liste sort_order=0
    const found = zeroCourses.find(c => c.id === mod.id);
    if (!found) {
      // Le cours existe peut-être déjà avec un sort_order correct
      try {
        const existing = await pb.collection('courses').getOne(mod.id, { requestKey: null });
        if (existing.sort_order > 0) {
          console.log(`  [SKIP] ${mod.langue} — sort_order déjà = ${existing.sort_order} — ${mod.titre.substring(0, 50)}`);
          skipped++;
        } else {
          console.log(`  [?] ${mod.langue} — ID introuvable : ${mod.id}`);
          notFound++;
        }
      } catch {
        console.log(`  [NOT FOUND] ${mod.langue} — ID introuvable : ${mod.id}`);
        notFound++;
      }
      continue;
    }

    await pb.collection('courses').update(mod.id, { sort_order: mod.order }, { requestKey: null });
    console.log(`  [OK] ${mod.langue} — sort_order ${mod.order} — ${(found.titre || mod.titre).substring(0, 55)}`);
    updated++;
  }

  // Rapport final : vérifie s'il reste des sort_order = 0 (excl. exams)
  const remaining = await pb.collection('courses').getFullList({
    filter: 'sort_order = 0 && course_type != "exam"',
    requestKey: null,
  });

  console.log('\n=================================================================');
  console.log(`Résultats : ${updated} mis à jour / ${skipped} déjà corrects / ${notFound} non trouvés`);

  if (remaining.length > 0) {
    console.log(`\n⚠️  ${remaining.length} cours non-exam ont encore sort_order = 0 :`);
    remaining.forEach(c => console.log(`   - ${c.id} [${c.langue}] — ${c.titre?.substring(0, 60)}`));
  } else {
    console.log('\n✅ Tous les cours non-exam ont maintenant un sort_order > 0');
  }

  console.log('\nRécapitulatif du parcours par langue après correction :');
  for (const lang of ['Francais', 'Anglais', 'Arabe']) {
    const courses = await pb.collection('courses').getFullList({
      filter: `langue = "${lang}" && course_type != "exam"`,
      sort: '+sort_order',
      requestKey: null,
    });
    const min = Math.min(...courses.map(c => c.sort_order));
    const max = Math.max(...courses.map(c => c.sort_order));
    console.log(`  ${lang} : ${courses.length} cours — sort_order de ${min} à ${max}`);
  }
}

main().catch(e => {
  console.error('Erreur fatale :', e.message);
  process.exit(1);
});
