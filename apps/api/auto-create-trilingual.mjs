// auto-create-trilingual.mjs
// Prend un cours français existant en PocketBase et génère automatiquement
// les versions EN et AR en utilisant l'API Claude comme rédacteur pédagogique.
//
// Usage :
//   node auto-create-trilingual.mjs "titre exact du cours français"
//   node auto-create-trilingual.mjs --id <pocketbase_id>
//   node auto-create-trilingual.mjs --all          ← traite tous les FR sans équivalent
//   node auto-create-trilingual.mjs --dry-run "titre"  ← aperçu sans écrire

import 'dotenv/config';
import PocketBase   from 'pocketbase';
import Anthropic    from '@anthropic-ai/sdk';

const PB_URL        = process.env.PB_URL                || 'http://127.0.0.1:8090';
const PB_EMAIL      = process.env.PB_SUPERUSER_EMAIL    || '';
const PB_PASS       = process.env.PB_SUPERUSER_PASSWORD || '';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY     || '';

const args    = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const ALL     = args.includes('--all');
const idFlag  = args.indexOf('--id');
const courseId= idFlag !== -1 ? args[idFlag + 1] : null;
const titleArg= args.filter(a => !a.startsWith('--') && a !== args[idFlag + 1]).join(' ') || null;

if (!titleArg && !courseId && !ALL) {
  console.log('Usage:');
  console.log('  node auto-create-trilingual.mjs "titre du cours"');
  console.log('  node auto-create-trilingual.mjs --id <id>');
  console.log('  node auto-create-trilingual.mjs --all');
  console.log('  node auto-create-trilingual.mjs --dry-run "titre"');
  process.exit(0);
}

// ─── Connexions ───────────────────────────────────────────────────────────────
const pb      = new PocketBase(PB_URL);
const claude  = new Anthropic({ apiKey: ANTHROPIC_KEY });
pb.autoCancellation(false);

await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
console.log('✅ Connecté à PocketBase');

const allCourses = await pb.collection('courses').getFullList({ requestKey: null });
console.log(`📚 ${allCourses.length} cours chargés depuis PocketBase\n`);

// ─── Trouver le ou les cours FR à traiter ────────────────────────────────────
function normTitle(t) {
  return (t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').trim();
}

function hasEquivalent(pool, frTitre, langue) {
  // On cherche si un cours de cette langue fait référence au même topic
  // via une heuristique : mots-clés communs significatifs (4+ lettres)
  const frWords = normTitle(frTitre).split(/\s+/).filter(w => w.length >= 4);
  return pool
    .filter(c => c.langue === langue && c.course_type === 'standard')
    .some(c => {
      const tgt = normTitle(c.titre);
      const hits = frWords.filter(w => tgt.includes(w));
      return hits.length >= 2; // au moins 2 mots-clés en commun
    });
}

let targets = [];

if (ALL) {
  const frCourses = allCourses.filter(c =>
    c.langue === 'Francais' && c.course_type === 'standard'
  );
  for (const c of frCourses) {
    const needsEN = !hasEquivalent(allCourses, c.titre, 'Anglais');
    const needsAR = !hasEquivalent(allCourses, c.titre, 'Arabe');
    if (needsEN || needsAR) targets.push({ course: c, needsEN, needsAR });
  }
  if (targets.length === 0) {
    console.log('🎉 Tous les cours français ont déjà un équivalent EN et AR !');
    process.exit(0);
  }
  console.log(`🔍 ${targets.length} cours FR sans équivalent complet :\n`);
  targets.forEach(t => {
    const manque = [t.needsEN && 'EN', t.needsAR && 'AR'].filter(Boolean).join('+');
    console.log(`  ❌ ${manque} : ${t.course.titre}`);
  });
  console.log('');
} else {
  let frCourse;
  if (courseId) {
    frCourse = allCourses.find(c => c.id === courseId);
  } else {
    frCourse = allCourses.find(c =>
      normTitle(c.titre) === normTitle(titleArg) && c.langue === 'Francais'
    );
    if (!frCourse) {
      // recherche approximative
      frCourse = allCourses.find(c =>
        c.langue === 'Francais' && normTitle(c.titre).includes(normTitle(titleArg))
      );
    }
  }
  if (!frCourse) {
    console.error(`❌ Cours introuvable : "${titleArg || courseId}"`);
    console.log('\nCours français disponibles :');
    allCourses
      .filter(c => c.langue === 'Francais' && c.course_type === 'standard')
      .forEach(c => console.log(`  • ${c.titre}`));
    process.exit(1);
  }
  const needsEN = !hasEquivalent(allCourses, frCourse.titre, 'Anglais');
  const needsAR = !hasEquivalent(allCourses, frCourse.titre, 'Arabe');
  targets.push({ course: frCourse, needsEN, needsAR });
}

// ─── Génération via Claude API ────────────────────────────────────────────────
async function generateEquivalent(frCourse, targetLang) {
  const langLabel = targetLang === 'Anglais' ? 'English' : 'Arabic';
  const instructions = targetLang === 'Anglais'
    ? `You are a professional language pedagogy expert. Create an English grammar course equivalent to the French course below.
The course must:
- Teach the SAME grammatical concept but adapted to English (e.g., French "passé composé" → English "present perfect")
- Follow the exact same JSON structure as the French course (pages array + exercises array)
- Use English as the language of instruction
- Include page types: lesson (HTML content) and bridge (FR|EN|AR comparison table)
- Include 6-9 exercises mixing types: qcm, fill, order, vf
- Generate unique IDs prefixed with "en-auto-"
- Set niveau to same or equivalent level`
    : `أنت خبير في تعليم اللغة. أنشئ دورة قواعد عربية مكافئة للدورة الفرنسية أدناه.
الدورة يجب أن:
- تُعلّم نفس المفهوم النحوي لكن مُكيَّفًا للعربية (مثال: "المضارع التام" بدل "passé composé")
- تتبع نفس هيكل JSON تمامًا (مصفوفة pages + مصفوفة exercises)
- تستخدم العربية كلغة تعليم مع شرح إنجليزي أحيانًا
- تتضمن أنواع الصفحات: lesson (محتوى HTML) و bridge (مقارنة FR|EN|AR)
- تتضمن 6-9 تمارين من أنواع: qcm, fill, order, vf
- استخدم IDs مُبتدئة بـ "ar-auto-"
- ضع نفس المستوى أو ما يكافئه`;

  const frPages     = JSON.parse(frCourse.pages     || '[]');
  const frExercises = JSON.parse(frCourse.exercises || '[]');

  const prompt = `${instructions}

FRENCH COURSE TO ADAPT:
Title: ${frCourse.titre}
Level: ${frCourse.niveau}
Description: ${frCourse.description}

Pages structure (adapt this, don't copy it):
${JSON.stringify(frPages.slice(0,2), null, 2)}

Exercises structure (adapt, don't copy):
${JSON.stringify(frExercises.slice(0,3), null, 2)}

Respond ONLY with a valid JSON object in this exact format:
{
  "titre": "...",
  "description": "...",
  "niveau": "...",
  "pages": [...],
  "exercises": [...]
}`;

  console.log(`  🤖 Appel Claude pour version ${langLabel}...`);

  const response = await claude.messages.create({
    model:      'claude-opus-4-6',
    max_tokens: 8000,
    messages:   [{ role: 'user', content: prompt }],
  });

  const raw = response.content[0].text;
  // Extraire le JSON de la réponse
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Impossible d\'extraire le JSON de la réponse Claude');
  return JSON.parse(jsonMatch[0]);
}

// ─── Créer le cours en PocketBase ─────────────────────────────────────────────
async function createCourse(data, langue, frCourse) {
  const payload = {
    titre:         data.titre,
    langue,
    course_type:   'standard',
    niveau:        data.niveau || frCourse.niveau,
    description:   data.description,
    categorie:     langue === 'Anglais' ? 'anglais' : 'arabe',
    categorie_age: 'Adultes',
    duree:         frCourse.duree || '35 min',
    prix:          0,
    instructeur:   'IWS',
    pages:         JSON.stringify(data.pages),
    exercises:     JSON.stringify(data.exercises),
    actif:         true,
  };
  if (DRY_RUN) {
    console.log(`  [DRY-RUN] Serait créé : "${payload.titre}" (${langue})`);
    return { id: 'DRY_RUN' };
  }
  return await pb.collection('courses').create(payload, { requestKey: null });
}

// ─── Traitement principal ─────────────────────────────────────────────────────
let totalCreated = 0;

for (const { course, needsEN, needsAR } of targets) {
  console.log(`\n${'─'.repeat(65)}`);
  console.log(`📖 Traitement : ${course.titre}`);
  console.log(`   Niveau : ${course.niveau} | Langue source : Francais`);
  console.log(`   À créer : ${[needsEN && 'EN', needsAR && 'AR'].filter(Boolean).join(' + ')}`);

  if (needsEN) {
    try {
      const enData = await generateEquivalent(course, 'Anglais');
      const rec    = await createCourse(enData, 'Anglais', course);
      console.log(`  ✅ EN créé : "${enData.titre}" (id: ${rec.id})`);
      totalCreated++;
    } catch (err) {
      console.error(`  ❌ Erreur EN :`, err.message);
    }
    // Pause pour respecter les limites de l'API
    await new Promise(r => setTimeout(r, 2000));
  }

  if (needsAR) {
    try {
      const arData = await generateEquivalent(course, 'Arabe');
      const rec    = await createCourse(arData, 'Arabe', course);
      console.log(`  ✅ AR créé : "${arData.titre}" (id: ${rec.id})`);
      totalCreated++;
    } catch (err) {
      console.error(`  ❌ Erreur AR :`, err.message);
    }
    await new Promise(r => setTimeout(r, 2000));
  }
}

console.log(`\n${'═'.repeat(65)}`);
console.log(`📊 Terminé : ${totalCreated} cours créé(s)${DRY_RUN ? ' (mode aperçu)' : ''}`);
process.exit(0);
