// set-sort-order.mjs
// Phase 2 : ajoute le champ sort_order à la collection courses
//           et assigne l'ordre pédagogique pour chaque cours (FR / EN / AR)
import 'dotenv/config';
import PocketBase from 'pocketbase';

const PB_URL   = process.env.PB_URL                || 'http://127.0.0.1:8090';
const PB_EMAIL = process.env.PB_SUPERUSER_EMAIL    || '';
const PB_PASS  = process.env.PB_SUPERUSER_PASSWORD || '';

// ── Ordre pédagogique par langue ────────────────────────────────────────────
// Les titres doivent correspondre EXACTEMENT aux valeurs dans PocketBase.
const PATH_FR = [
  { sort_order: 1,  titre: "L'alphabet français — Niveau A0/A1" },
  { sort_order: 2,  titre: "L'impératif — Exercices A1" },
  { sort_order: 3,  titre: "La phrase interrogative — Exercices A0/A1" },
  { sort_order: 4,  titre: "L'interrogation — Registres de langue — Exercices A1" },
  { sort_order: 5,  titre: "Les articles partitifs — Exercices A1" },
  { sort_order: 6,  titre: "L'accord et la place des adjectifs — Exercices A1" },
  { sort_order: 7,  titre: "Exprimer le temps en français — Niveau A1" },
  { sort_order: 8,  titre: "Exprimer un lieu" },
  { sort_order: 9,  titre: "Grammaire-Toutes les prépositions" },
  { sort_order: 10, titre: "La comparaison : comparatif et superlatif (A1-A2)" },
  { sort_order: 11, titre: "Identifier les temps verbaux : passé, présent, futur (A1-A2)" },
  { sort_order: 12, titre: "Les pronoms compléments d'objet direct (COD) (A1-A2)" },
  { sort_order: 13, titre: "Le passé composé : révisions complètes (A2)" },
  { sort_order: 14, titre: "L'hypothèse sur le futur — Exercices A1" },
  { sort_order: 15, titre: "Lettre de Londres — Niveau A1" },
  { sort_order: 16, titre: "Le voyage — Texte de lecture A1" },
  { sort_order: 17, titre: "Tests et DELF Prim" },
];

const PATH_EN = [
  { sort_order: 1,  titre: "The English Alphabet — Level A0/A1" },
  { sort_order: 2,  titre: "The Imperative — Commands and Instructions (A1)" },
  { sort_order: 3,  titre: "Forming Questions in English — Wh- and Yes/No (A1)" },
  { sort_order: 4,  titre: "Formal & Informal English — Language Registers (A1)" },
  { sort_order: 5,  titre: "Quantifiers: Some, Any, Much, Many (A1–A2)" },
  { sort_order: 6,  titre: "Adjectives in English — Position and Comparison (A1–A2)" },
  { sort_order: 7,  titre: "Expressing Time in English — Grammar & Exercises" },
  { sort_order: 8,  titre: "Expressing a Place in English — Grammar & Exercises" },
  { sort_order: 9,  titre: "All English Prepositions (A1–A2)" },
  { sort_order: 10, titre: "Comparatives and Superlatives in English (A1-A2)" },
  { sort_order: 11, titre: "Identifying Verb Tenses — Past, Present & Future (A1-A2)" },
  { sort_order: 12, titre: "Direct Object Pronouns — me, you, him, her, it… (A1-A2)" },
  { sort_order: 13, titre: "The Present Perfect — Form, Use and Review (A2)" },
  { sort_order: 14, titre: "The First Conditional — If Clauses (A2)" },
  { sort_order: 15, titre: "A Letter from London (Reading & Writing)" },
  { sort_order: 16, titre: "Travel & Adventure (Reading & Speaking)" },
  { sort_order: 17, titre: "Tests & Assessments (A1 English)" },
];

const PATH_AR = [
  { sort_order: 1,  titre: "الحروف العربية — Arabic Alphabet (A0/A1)" },
  { sort_order: 2,  titre: "صيغة الأمر — The Imperative in Arabic (A1)" },
  { sort_order: 3,  titre: "أسلوب الاستفهام — Question Words in Arabic (A1)" },
  { sort_order: 4,  titre: "مستويات اللغة العربية — الفصحى والعامية (A1)" },
  { sort_order: 5,  titre: "النكرة والمعرفة — Definite and Indefinite (A1)" },
  { sort_order: 6,  titre: "الصفة والموصوف — Adjectives in Arabic (A1)" },
  { sort_order: 7,  titre: "التعبير عن الزمن — Expressing Time in Arabic" },
  { sort_order: 8,  titre: "التعبير عن المكان — Expressing Place in Arabic" },
  { sort_order: 9,  titre: "حروف الجر — Arabic Prepositions (A1–A2)" },
  { sort_order: 10, titre: "المقارنة وأسلوب التفضيل في اللغة العربية (A1-A2)" },
  { sort_order: 11, titre: "التعرف على الأزمنة الفعلية — الماضي والحاضر والمستقبل (A1-A2)" },
  { sort_order: 12, titre: "مؤشرات الزمن في العربية : منذ، خلال، قبل… (A1-A2)" },
  { sort_order: 13, titre: "ضمائر المفعول به المباشر في العربية (A1-A2)" },
  { sort_order: 14, titre: "الجملة الشرطية — Conditional Sentences (A2)" },
  { sort_order: 15, titre: "الماضي التام في العربية وما يقابله في الفرنسية (A2)" },
  { sort_order: 16, titre: "رسالة من لندن — A Letter from London (Arabic)" },
  { sort_order: 17, titre: "السفر والمغامرة — Travel & Adventure (Arabic)" },
  { sort_order: 18, titre: "اختبارات وتقييمات — Tests & Assessments (A1)" },
];

async function addSortOrderField(pb) {
  console.log('  → Ajout du champ sort_order à la collection courses...');
  try {
    const coll = await pb.send('/api/collections/courses', { method: 'GET' });
    const alreadyHas = (coll.fields || []).some(f => f.name === 'sort_order');
    if (alreadyHas) {
      console.log('  ✓ sort_order existe déjà');
      return;
    }
    const updatedFields = [
      ...(coll.fields || []),
      { name: 'sort_order', type: 'number', min: 0, onlyInt: true, required: false },
    ];
    await pb.send('/api/collections/courses', {
      method: 'PATCH',
      body: { fields: updatedFields },
    });
    console.log('  ✓ Champ sort_order ajouté');
  } catch (e) {
    if (e?.message?.includes('already exists') || e?.message?.includes('sort_order')) {
      console.log('  ✓ sort_order déjà présent (ignore)');
    } else {
      console.warn('  ⚠ addSortOrderField:', e.message);
    }
  }
}

async function applyPath(pb, path, langue) {
  let ok = 0, notFound = 0;
  for (const entry of path) {
    const filter = `titre = "${entry.titre.replace(/"/g, '\\"')}" && langue = "${langue}"`;
    const res = await pb.collection('courses').getList(1, 5, { filter, requestKey: null });
    if (res.items.length === 0) {
      console.log(`  [NOT FOUND] (${langue.substring(0,2)}) ${entry.titre.substring(0, 55)}`);
      notFound++;
      continue;
    }
    for (const course of res.items) {
      await pb.collection('courses').update(course.id, { sort_order: entry.sort_order }, { requestKey: null });
    }
    console.log(`  [OK] #${String(entry.sort_order).padStart(2,'0')} → ${entry.titre.substring(0, 60)}`);
    ok++;
  }
  return { ok, notFound };
}

async function main() {
  console.log('🚀 set-sort-order.mjs');
  console.log('=================================================================');

  const pb = new PocketBase(PB_URL);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log(`Connecté (${PB_URL})\n`);

  await addSortOrderField(pb);
  console.log();

  console.log('── Parcours Français (17 cours) ─────────────────────────────────');
  const fr = await applyPath(pb, PATH_FR, 'Francais');

  console.log('\n── Parcours Anglais (17 cours) ──────────────────────────────────');
  const en = await applyPath(pb, PATH_EN, 'Anglais');

  console.log('\n── Parcours Arabe (18 cours) ────────────────────────────────────');
  const ar = await applyPath(pb, PATH_AR, 'Arabe');

  console.log('\n=================================================================');
  console.log(`FR : ${fr.ok} OK / ${fr.notFound} introuvables`);
  console.log(`EN : ${en.ok} OK / ${en.notFound} introuvables`);
  console.log(`AR : ${ar.ok} OK / ${ar.notFound} introuvables`);
  console.log('\nPhase 2 — sort_order appliqué ✅');
}

main().catch(e => {
  console.error('Erreur fatale :', e.message);
  process.exit(1);
});
