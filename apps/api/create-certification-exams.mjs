// create-certification-exams.mjs
// Phase 3 : crée les 3 examens de certification (FR / EN / AR)
//           course_type = 'exam', 20 questions mixtes, seuil 75%
import 'dotenv/config';
import PocketBase from 'pocketbase';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PB_URL   = process.env.PB_URL                || 'http://127.0.0.1:8090';
const PB_EMAIL = process.env.PB_SUPERUSER_EMAIL    || '';
const PB_PASS  = process.env.PB_SUPERUSER_PASSWORD || '';

const DATA_FILE = join(__dirname, 'certification-exams-data.json');
const exams     = JSON.parse(readFileSync(DATA_FILE, 'utf8'));

// Contenu pédagogique de la page d'introduction de l'examen
function makeIntroPage(langue) {
  const content = {
    Francais: `<div class="lesson-intro">
<div class="lesson-badge">🎓 Examen de Certification IWS</div>
<h2>Examen Final — Français A1/A2</h2>
<p class="lead">Félicitations d'avoir atteint cette étape ! Cet examen valide l'ensemble de votre parcours.</p>
<div class="lesson-objectives">
<h4>📋 Informations importantes</h4>
<ul>
<li><strong>20 questions</strong> couvrant tout le programme A1/A2</li>
<li>Types de questions : QCM, texte à trous, reconstruction de phrase, Vrai/Faux</li>
<li>Score minimum pour obtenir le certificat : <strong>75%</strong></li>
<li>Durée estimée : 25-30 minutes</li>
</ul>
</div>
<div class="lesson-highlight">
💡 Relisez vos notes avant de commencer. Vous pouvez retenter l'examen si nécessaire.
</div>
</div>`,
    Anglais: `<div class="lesson-intro">
<div class="lesson-badge">🎓 IWS Certification Exam</div>
<h2>Final Exam — English A1/A2</h2>
<p class="lead">Congratulations on reaching this stage! This exam validates your entire learning journey.</p>
<div class="lesson-objectives">
<h4>📋 Important information</h4>
<ul>
<li><strong>20 questions</strong> covering the full A1/A2 curriculum</li>
<li>Question types: MCQ, fill-in-the-blank, word ordering, True/False</li>
<li>Minimum score to obtain the certificate: <strong>75%</strong></li>
<li>Estimated duration: 25-30 minutes</li>
</ul>
</div>
<div class="lesson-highlight">
💡 Review your notes before starting. You may retake the exam if needed.
</div>
</div>`,
    Arabe: `<div class="lesson-intro">
<div class="lesson-badge">🎓 اختبار شهادة IWS</div>
<h2>الاختبار النهائي — العربية والإنجليزية A1/A2</h2>
<p class="lead">مبروك على وصولك إلى هذه المرحلة! هذا الاختبار يُصادق على رحلتك التعليمية كاملة.</p>
<div class="lesson-objectives">
<h4>📋 معلومات مهمة</h4>
<ul>
<li><strong>20 سؤالاً</strong> تغطي المنهج الكامل A1/A2</li>
<li>أنواع الأسئلة: اختيار متعدد، تعبئة الفراغ، ترتيب الكلمات، صح/خطأ</li>
<li>الحد الأدنى للحصول على الشهادة: <strong>75%</strong></li>
<li>المدة التقديرية: 25-30 دقيقة</li>
</ul>
</div>
<div class="lesson-highlight">
💡 راجع ملاحظاتك قبل البدء. يمكنك إعادة الاختبار إذا لزم الأمر.
</div>
</div>`,
  };
  return {
    id:      `exam_intro_${langue.toLowerCase().slice(0,2)}`,
    type:    'lesson',
    title:   langue === 'Francais' ? '📋 Instructions de l\'examen'
           : langue === 'Anglais'  ? '📋 Exam Instructions'
                                   : '📋 تعليمات الاختبار',
    content: content[langue] || content.Francais,
  };
}

async function main() {
  console.log('🚀 create-certification-exams.mjs');
  console.log('=================================================================');
  console.log('   Phase 3 : Examens de certification (20 questions, seuil 75%)');

  const pb = new PocketBase(PB_URL);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log(`Connecté (${PB_URL})\n`);

  let created = 0, updated = 0;

  for (const exam of exams) {
    const introPage = makeIntroPage(exam.langue);
    const pages     = JSON.stringify([introPage]);
    const exercises = exam.exercises_json;

    // Chercher si l'examen existe déjà
    const existing = await pb.collection('courses').getList(1, 3, {
      filter: `titre = "${exam.titre.replace(/"/g, '\\"')}" && langue = "${exam.langue}" && course_type = "exam"`,
      requestKey: null,
    });

    const payload = {
      titre:         exam.titre,
      langue:        exam.langue,
      course_type:   'exam',
      niveau:        exam.niveau,
      description:   exam.description,
      categorie:     'langue',
      categorie_age: 'Adultes',
      duree:         30,
      prix:          0,
      instructeur:   'IWS Laayoune',
      pages,
      exercises,
      sort_order:    999, // toujours en dernier dans le parcours
    };

    if (existing.items.length > 0) {
      await pb.collection('courses').update(existing.items[0].id, payload, { requestKey: null });
      console.log(`  [UPDATED] ${exam.langue} — ${exam.titre.substring(0, 55)}`);
      updated++;
    } else {
      const rec = await pb.collection('courses').create(payload, { requestKey: null });
      console.log(`  [CREATED] ${exam.langue} — ${rec.id} — ${exam.titre.substring(0, 55)}`);
      created++;
    }
  }

  console.log('\n=================================================================');
  console.log(`Résultats : ${created} créés / ${updated} mis à jour`);
  console.log('\nChaque examen contient :');
  console.log('  📄 1 page d\'instructions');
  console.log('  ✏️  8 QCM (grammaire variée)');
  console.log('  ✏️  5 Textes à trous (fill)');
  console.log('  ✏️  4 Reconstructions de phrase (order)');
  console.log('  ✏️  3 Vrai / Faux avec explication (vf)');
  console.log('\n  🎓 Seuil de réussite : 75% (15/20)');
  console.log('  🔒 Débloqué uniquement après validation de tous les cours du parcours');
}

main().catch(e => {
  console.error('Erreur fatale :', e.message);
  if (e.response?.data) console.error('Details:', JSON.stringify(e.response.data, null, 2));
  process.exit(1);
});
