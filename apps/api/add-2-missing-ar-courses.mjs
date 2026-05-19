/**
 * add-2-missing-ar-courses.mjs
 * Ajoute les 2 cours AR manquants (faux positifs de détection) :
 *   1. المقارنة وأسلوب التفضيل (A1-A2)
 *   2. الماضي التام — مراجعة شاملة (A2)
 * Vérifie uniquement par titre exact — pas de détection par mots-clés.
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

const COURSES = [
  {
    titre:        'المقارنة وأسلوب التفضيل في اللغة العربية (A1-A2)',
    cours_nom:    'Arabe',
    langue:       'Arabe',
    categorie:    'grammaire',
    niveau:       'A1',
    description:  'Apprendre à exprimer la comparaison et le superlatif en arabe : أسلوب التفضيل (أفعل), comparaison avec مثل/كـ, أكثر/أقل. Formes irrégulières et exercices pratiques.',
    description_fr: 'Apprendre la comparaison et le superlatif en arabe.',
    description_en: 'Learn comparatives and superlatives in Arabic.',
    description_ar: 'تعلم أسلوب المقارنة والتفضيل في اللغة العربية.',
    title_fr: 'Comparatif et superlatif en arabe',
    title_en: 'Comparatives and Superlatives in Arabic',
    title_ar: 'المقارنة وأسلوب التفضيل',
    pages: [
      {
        id: 'ar-comp-p1', type: 'intro',
        title: 'مقدمة — أسلوب المقارنة والتفضيل',
        content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 Arabic Grammar A1-A2</div>
  <h2 dir="rtl">المقارنة وأسلوب التفضيل في العربية</h2>
  <p class="lead" dir="rtl">نستخدم <strong>أسلوب التفضيل</strong> للمقارنة بين شيئين أو أكثر، أو للدلالة على أن شيئًا ما هو الأفضل أو الأعلى درجةً في مجموعة.</p>
  <div class="lesson-objectives">
    <h4>🎯 Learning Objectives</h4>
    <ul>
      <li dir="rtl">صياغة <strong>اسم التفضيل</strong> على وزن أَفْعَل: أكبر، أجمل، أطول</li>
      <li dir="rtl">استخدام <strong>المقارنة بالمساواة</strong>: مثل / كـ</li>
      <li dir="rtl">استخدام <strong>أكثر / أقل</strong> + صفة + من</li>
      <li dir="rtl">معرفة الصيغ الشاذة: خير، شر، أكثر، أقل</li>
    </ul>
  </div>
</div>`,
      },
      {
        id: 'ar-comp-p2', type: 'lesson',
        title: 'اسم التفضيل — صيغة أَفْعَل',
        content: `<h3 dir="rtl">📖 اسم التفضيل في العربية</h3>
<p dir="rtl">يُصاغ اسم التفضيل على وزن <strong>أَفْعَل</strong> من الفعل الثلاثي الصحيح:</p>
<div class="rule-box">
  <table>
    <thead><tr><th dir="rtl">الصفة</th><th dir="rtl">اسم التفضيل</th><th dir="rtl">مثال</th></tr></thead>
    <tbody>
      <tr><td dir="rtl">كبير</td><td dir="rtl"><strong>أَكبَر</strong></td><td dir="rtl">أحمد أكبر من علي.</td></tr>
      <tr><td dir="rtl">صغير</td><td dir="rtl"><strong>أَصغَر</strong></td><td dir="rtl">هذا البيت أصغر من ذاك.</td></tr>
      <tr><td dir="rtl">طويل</td><td dir="rtl"><strong>أَطوَل</strong></td><td dir="rtl">هذا البرج أطول من ذاك.</td></tr>
      <tr><td dir="rtl">جميل</td><td dir="rtl"><strong>أَجمَل</strong></td><td dir="rtl">هذه الحديقة أجمل من تلك.</td></tr>
      <tr><td dir="rtl">سريع</td><td dir="rtl"><strong>أَسرَع</strong></td><td dir="rtl">القطار أسرع من الحافلة.</td></tr>
      <tr><td dir="rtl">قريب</td><td dir="rtl"><strong>أَقرَب</strong></td><td dir="rtl">هذا المكان أقرب منه.</td></tr>
    </tbody>
  </table>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4 dir="rtl">⚠️ الصيغ الشاذة</h4>
  <table>
    <thead><tr><th dir="rtl">الصفة</th><th dir="rtl">اسم التفضيل</th></tr></thead>
    <tbody>
      <tr><td dir="rtl">جيد / حسن</td><td dir="rtl"><strong>خَيْر / أَحسَن</strong></td></tr>
      <tr><td dir="rtl">سيئ / قبيح</td><td dir="rtl"><strong>شَرّ / أَقبَح</strong></td></tr>
      <tr><td dir="rtl">كثير</td><td dir="rtl"><strong>أَكثَر</strong></td></tr>
      <tr><td dir="rtl">قليل</td><td dir="rtl"><strong>أَقَل</strong></td></tr>
    </tbody>
  </table>
</div>`,
      },
      {
        id: 'ar-comp-p3', type: 'lesson',
        title: 'المقارنة بالمساواة وأكثر/أقل',
        content: `<h3 dir="rtl">📖 المقارنة بالمساواة والتفاوت</h3>
<div class="rule-box">
  <h4 dir="rtl">1. المساواة : مثل / كـ</h4>
  <ul dir="rtl">
    <li>هو <strong>مثل</strong> أخيه في الطول. (= aussi grand que son frère)</li>
    <li>هي ذكية <strong>كـ</strong>أختها. (= aussi intelligente que sa sœur)</li>
  </ul>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4 dir="rtl">2. التفاوت : أكثر / أقل + صفة/مصدر + من</h4>
  <ul dir="rtl">
    <li>هذا الكتاب <strong>أكثر</strong> تعقيدًا <strong>من</strong> ذاك. (plus complexe que)</li>
    <li>هذا المسار <strong>أقل</strong> صعوبةً <strong>من</strong> الآخر. (moins difficile que)</li>
  </ul>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4 dir="rtl">3. أعلى درجة (superlatif) : ال + اسم التفضيل</h4>
  <ul dir="rtl">
    <li>هو <strong>الأطول</strong> في الفصل. (le plus grand de la classe)</li>
    <li>هذه <strong>أجمل</strong> مدينة في البلاد. (la plus belle ville du pays)</li>
    <li>هذا <strong>الأكثر</strong> شهرةً في المنطقة. (le plus célèbre de la région)</li>
  </ul>
</div>
<div class="tip-box" style="margin-top:1rem">
  <h4 dir="rtl">💡 ملاحظة</h4>
  <p dir="rtl">اسم التفضيل <strong>لا يتغير</strong> مع المؤنث والجمع في صيغة المقارنة:<br>
  هو أكبر / هي أكبر / هم أكبر (dans un contexte comparatif)</p>
</div>`,
      },
      {
        id: 'ar-comp-p4', type: 'exercises',
        title: 'تمارين — أسلوب المقارنة والتفضيل',
        content: `<h3 dir="rtl">✏️ تمارين</h3>
<h4 dir="rtl">تمرين 1 — حوّل الصفة إلى اسم التفضيل</h4>
<ol dir="rtl">
  <li>كبير → أحمد _______ من علي.</li>
  <li>سريع → السيارة _______ من الدراجة.</li>
  <li>جميل → هذا البستان _______ من ذلك.</li>
  <li>قريب → المحطة _______ من المدرسة.</li>
</ol>
<h4 dir="rtl">تمرين 2 — أكمل بـ مثل / أكثر / أقل</h4>
<ol dir="rtl">
  <li>هو _______ أخيه في الطول. (مساواة)</li>
  <li>هذا الطريق _______ أمانًا من ذاك. (أقل)</li>
  <li>هذا المطعم _______ شهرةً في المدينة. (أكثر)</li>
</ol>
<h4 dir="rtl">تمرين 3 — ما الصحيح؟</h4>
<ol dir="rtl">
  <li>هي أكبر___ أختها. (من / عن / في)</li>
  <li>هذا ___ أجمل مدينة في البلاد. (أل / لا شيء)</li>
  <li>خير من بقي. (صيغة الشاذة لـ: جيد / سيئ / كثير)</li>
</ol>`,
      },
    ],
    exercises: [
      { id:'ar-comp-q1', question:"ما هو اسم التفضيل من 'كبير'؟", options:['كبيرًا','أكبر','الأكبر','أكثر كبيرًا'], answer:1 },
      { id:'ar-comp-q2', question:"أكمل: هذه السيارة _______ من تلك. (سريع)", options:['أسرع','سريعة','أكثر السرعة','سريع جدًا'], answer:0 },
      { id:'ar-comp-q3', question:"ما معنى 'هو مثل أخيه في الطول'؟", options:['هو أطول من أخيه','هو أقصر من أخيه','هما بنفس الطول','هو الأطول في العائلة'], answer:2 },
      { id:'ar-comp-q4', question:"ما هو التفضيل الشاذ من 'جيد'؟", options:['أجيد','جيدًا جدًا','خير / أحسن','أكثر جودة'], answer:2 },
      { id:'ar-comp-q5', question:"أكمل: هو _______ في الفصل. (أعلى درجة من طويل)", options:['الأطول','أطول','أكثر طولًا','طولًا'], answer:0 },
    ],
  },

  {
    titre:        'الماضي التام في العربية وما يقابله في الفرنسية (A2)',
    cours_nom:    'Arabe',
    langue:       'Arabe',
    categorie:    'grammaire',
    niveau:       'A2',
    description:  'Comprendre et maîtriser le passé en arabe (الفعل الماضي) : tenses, accord, verbes irréguliers courants. Comparaison avec le passé composé français pour mieux comprendre les deux systèmes.',
    description_fr: 'Maîtriser le passé en arabe et le comparer au passé composé français.',
    description_en: 'Master the Arabic past tense and compare it to the French passé composé.',
    description_ar: 'إتقان الفعل الماضي في العربية ومقارنته بالماضي المركب الفرنسي.',
    title_fr: 'Le passé en arabe — révisions',
    title_en: 'Arabic Past Tense — Review',
    title_ar: 'الفعل الماضي في العربية — مراجعة شاملة',
    pages: [
      {
        id: 'ar-past-p1', type: 'intro',
        title: 'مقدمة — الفعل الماضي في العربية',
        content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 Arabic Grammar A2</div>
  <h2 dir="rtl">الفعل الماضي — مراجعة شاملة</h2>
  <p class="lead" dir="rtl">يعبّر <strong>الفعل الماضي</strong> في العربية عن حدث <strong>مكتمل ومنتهٍ</strong>، وهو ما يقابل <em>le passé composé</em> في الفرنسية. يتميّز بأنه يُصرَّف مباشرةً دون حاجة إلى فعل مساعد.</p>
  <div class="lesson-objectives">
    <h4>🎯 Learning Objectives</h4>
    <ul>
      <li dir="rtl">مراجعة تصريف الفعل الماضي الثلاثي الصحيح لجميع الضمائر</li>
      <li dir="rtl">معرفة الأفعال الشائعة ذات الأوزان غير المنتظمة</li>
      <li dir="rtl">التمييز بين الماضي والمضارع في السياق</li>
      <li dir="rtl">المقارنة مع الماضي المركب الفرنسي (être/avoir + p.p.)</li>
    </ul>
  </div>
</div>`,
      },
      {
        id: 'ar-past-p2', type: 'lesson',
        title: 'تصريف الفعل الماضي — جميع الضمائر',
        content: `<h3 dir="rtl">📖 تصريف الفعل الماضي — ذهب / كتب / أكل</h3>
<div class="rule-box">
  <table>
    <thead><tr><th dir="rtl">الضمير</th><th dir="rtl">ذَهَبَ</th><th dir="rtl">كَتَبَ</th><th dir="rtl">أَكَلَ</th></tr></thead>
    <tbody>
      <tr><td dir="rtl">أنا</td><td dir="rtl">ذَهَبْتُ</td><td dir="rtl">كَتَبْتُ</td><td dir="rtl">أَكَلْتُ</td></tr>
      <tr><td dir="rtl">أنتَ</td><td dir="rtl">ذَهَبْتَ</td><td dir="rtl">كَتَبْتَ</td><td dir="rtl">أَكَلْتَ</td></tr>
      <tr><td dir="rtl">أنتِ</td><td dir="rtl">ذَهَبْتِ</td><td dir="rtl">كَتَبْتِ</td><td dir="rtl">أَكَلْتِ</td></tr>
      <tr><td dir="rtl">هو</td><td dir="rtl">ذَهَبَ</td><td dir="rtl">كَتَبَ</td><td dir="rtl">أَكَلَ</td></tr>
      <tr><td dir="rtl">هي</td><td dir="rtl">ذَهَبَتْ</td><td dir="rtl">كَتَبَتْ</td><td dir="rtl">أَكَلَتْ</td></tr>
      <tr><td dir="rtl">نحن</td><td dir="rtl">ذَهَبْنا</td><td dir="rtl">كَتَبْنا</td><td dir="rtl">أَكَلْنا</td></tr>
      <tr><td dir="rtl">أنتم</td><td dir="rtl">ذَهَبْتُم</td><td dir="rtl">كَتَبْتُم</td><td dir="rtl">أَكَلْتُم</td></tr>
      <tr><td dir="rtl">هم</td><td dir="rtl">ذَهَبُوا</td><td dir="rtl">كَتَبُوا</td><td dir="rtl">أَكَلُوا</td></tr>
      <tr><td dir="rtl">هن</td><td dir="rtl">ذَهَبْنَ</td><td dir="rtl">كَتَبْنَ</td><td dir="rtl">أَكَلْنَ</td></tr>
    </tbody>
  </table>
</div>
<div class="tip-box" style="margin-top:1rem">
  <h4 dir="rtl">💡 الفرق الجوهري مع الفرنسية</h4>
  <table>
    <thead><tr><th>Français (passé composé)</th><th dir="rtl">العربية (الماضي)</th></tr></thead>
    <tbody>
      <tr><td>Il <strong>est allé</strong> (être + allé)</td><td dir="rtl"><strong>ذَهَبَ</strong> (فعل واحد)</td></tr>
      <tr><td>Elle <strong>a mangé</strong> (avoir + mangé)</td><td dir="rtl"><strong>أَكَلَتْ</strong> (فعل واحد)</td></tr>
    </tbody>
  </table>
  <p dir="rtl">العربية تستخدم <strong>فعلًا واحدًا مصرَّفًا</strong> بدون فعل مساعد.</p>
</div>`,
      },
      {
        id: 'ar-past-p3', type: 'lesson',
        title: 'أفعال ماضية شائعة وشاذة',
        content: `<h3 dir="rtl">📖 أفعال ماضية شائعة</h3>
<div class="rule-box">
  <table>
    <thead><tr><th dir="rtl">الفعل المضارع</th><th dir="rtl">الماضي (هو)</th><th>Équivalent FR</th></tr></thead>
    <tbody>
      <tr><td dir="rtl">يذهب</td><td dir="rtl"><strong>ذَهَبَ</strong></td><td>il est allé</td></tr>
      <tr><td dir="rtl">يجيء / يأتي</td><td dir="rtl"><strong>جاءَ</strong></td><td>il est venu</td></tr>
      <tr><td dir="rtl">يقول</td><td dir="rtl"><strong>قالَ</strong></td><td>il a dit</td></tr>
      <tr><td dir="rtl">يرى</td><td dir="rtl"><strong>رأى</strong></td><td>il a vu</td></tr>
      <tr><td dir="rtl">يأخذ</td><td dir="rtl"><strong>أَخَذَ</strong></td><td>il a pris</td></tr>
      <tr><td dir="rtl">يعطي</td><td dir="rtl"><strong>أَعطى</strong></td><td>il a donné</td></tr>
      <tr><td dir="rtl">يعرف</td><td dir="rtl"><strong>عَرَفَ</strong></td><td>il a su / il connaissait</td></tr>
      <tr><td dir="rtl">يشرب</td><td dir="rtl"><strong>شَرِبَ</strong></td><td>il a bu</td></tr>
      <tr><td dir="rtl">يقرأ</td><td dir="rtl"><strong>قَرَأَ</strong></td><td>il a lu</td></tr>
      <tr><td dir="rtl">يكتب</td><td dir="rtl"><strong>كَتَبَ</strong></td><td>il a écrit</td></tr>
      <tr><td dir="rtl">يسمع</td><td dir="rtl"><strong>سَمِعَ</strong></td><td>il a entendu</td></tr>
      <tr><td dir="rtl">يستطيع</td><td dir="rtl"><strong>اسْتَطاعَ</strong></td><td>il a pu</td></tr>
    </tbody>
  </table>
</div>`,
      },
      {
        id: 'ar-past-p4', type: 'exercises',
        title: 'تمارين — الفعل الماضي',
        content: `<h3 dir="rtl">✏️ تمارين</h3>
<h4 dir="rtl">تمرين 1 — صرّف الفعل في الماضي</h4>
<ol dir="rtl">
  <li>أنا / ذهب → _______</li>
  <li>هي / كتب → _______</li>
  <li>هم / أكل → _______</li>
  <li>نحن / شرب → _______</li>
  <li>أنتِ / قرأ → _______</li>
</ol>
<h4 dir="rtl">تمرين 2 — أكمل الجمل بالفعل الماضي المناسب</h4>
<ol dir="rtl">
  <li>أمس، _______ (هي / ذهب) إلى المدرسة.</li>
  <li>الأسبوع الماضي، نحن _______ (شرب) قهوة معًا.</li>
  <li>البارحة، هو _______ (قرأ) الكتاب كله.</li>
  <li>في الاجتماع، هم _______ (قال) رأيهم بوضوح.</li>
</ol>
<h4 dir="rtl">تمرين 3 — صحّح الأخطاء</h4>
<ol dir="rtl">
  <li>هي ذَهَبَ إلى البيت. → _______</li>
  <li>هم كَتَبَ الدرس. → _______</li>
  <li>أنتَ أَكَلْتِ كثيرًا. → _______</li>
</ol>`,
      },
    ],
    exercises: [
      { id:'ar-past-q1', question:"على ماذا يدل الفعل الماضي في العربية؟", options:['حدث في المستقبل','حدث في الحاضر','حدث مكتمل ومنتهٍ','حدث متكرر'], answer:2 },
      { id:'ar-past-q2', question:"ما تصريف 'ذهب' للضمير 'هي'؟", options:['ذَهَبَ','ذَهَبَتْ','ذَهَبْتِ','ذَهَبُوا'], answer:1 },
      { id:'ar-past-q3', question:"ما الفرق الرئيسي بين الماضي العربي والفرنسي (passé composé)؟", options:['العربية تستخدم مساعدًا (être/avoir)','الفرنسية فعل واحد، العربية اثنان','العربية فعل واحد، الفرنسية مساعد + اسم المفعول','لا فرق بينهما'], answer:2 },
      { id:'ar-past-q4', question:"ما الماضي من الفعل 'يقول' للمفرد المذكر الغائب (هو)؟", options:['يقول','قُلْتُ','قالَ','قُولُوا'], answer:2 },
      { id:'ar-past-q5', question:"أكمل: الأسبوع الماضي، هم _______ إلى المكتبة.", options:['يذهبون','سيذهبون','ذهبوا','اذهبوا'], answer:2 },
    ],
  },
];

async function main() {
  console.log('\n🌐 add-2-missing-ar-courses.mjs');
  console.log('='.repeat(55));
  console.log('   2 cours AR manquants : المقارنة + الماضي التام\n');

  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log('Connecté à PocketBase (' + PB_URL + ')\n');

  const existing = await pb.collection('courses').getFullList({
    filter: "langue='Arabe' && course_type='standard'",
    requestKey: null,
  });
  const existingTitles = existing.map(c => c.titre);

  let created = 0;

  for (const course of COURSES) {
    if (existingTitles.includes(course.titre)) {
      console.log('  [SKIP] ' + course.titre + ' (titre exact déjà présent)');
      continue;
    }
    console.log('  [CREATE] ' + course.titre);
    try {
      const rec = await pb.collection('courses').create({
        titre:          course.titre,
        cours_nom:      course.cours_nom,
        langue:         course.langue,
        categorie:      'grammaire',
        categorie_age:  'Adultes',
        section:        'langues',
        niveau:         course.niveau,
        course_type:    'standard',
        prix:           0,
        duree:          30,
        description:    course.description,
        description_fr: course.description_fr,
        description_en: course.description_en,
        description_ar: course.description_ar,
        title_fr:       course.title_fr,
        title_en:       course.title_en,
        title_ar:       course.title_ar,
        pages:          JSON.stringify(course.pages),
        exercises:      JSON.stringify(course.exercises),
      }, { requestKey: null });
      console.log('    OK id=' + rec.id);
      created++;
    } catch (e) {
      console.error('    ERREUR: ' + e.message);
    }
  }

  console.log('\n' + '='.repeat(55));
  console.log('Résultat : ' + created + '/2 cours créés.');
  const total = existing.length + created;
  console.log('Total AR standard : ' + total + ' cours\n');
}

main().catch(e => { console.error('Erreur fatale :', e.message); process.exit(1); });
