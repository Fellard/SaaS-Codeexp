/**
 * add-exercises-qcm.mjs
 * ════════════════════════════════════════════════════════════
 * Ajoute les questions QCM (champ `exercises`) pour tous les
 * cours standard anglais et arabe qui n'ont pas d'exercices.
 *
 * Format attendu par le frontend :
 *   [{ id, question, options: string[], answer: number }]
 *   (answer = index du bon choix dans options)
 *
 * Usage :  cd apps/api && node add-exercises-qcm.mjs
 * ════════════════════════════════════════════════════════════
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

// ════════════════════════════════════════════════════════════
// QCM BANKS — 8 questions per course
// ════════════════════════════════════════════════════════════

// ── ENGLISH — Expressing Time ────────────────────────────────
const QCM_EN_TIME = [
  {
    id: 'en-time-1',
    question: 'I was born ___ 1995.',
    options: ['at', 'on', 'in', 'for'],
    answer: 2,
  },
  {
    id: 'en-time-2',
    question: 'The meeting starts ___ 9 o\'clock.',
    options: ['in', 'on', 'at', 'by'],
    answer: 2,
  },
  {
    id: 'en-time-3',
    question: 'She has lived here ___ three years.',
    options: ['since', 'for', 'ago', 'during'],
    answer: 1,
  },
  {
    id: 'en-time-4',
    question: 'They arrived two hours ___.',
    options: ['before', 'since', 'ago', 'after'],
    answer: 2,
  },
  {
    id: 'en-time-5',
    question: 'I have been studying English ___ 2020.',
    options: ['for', 'ago', 'since', 'during'],
    answer: 2,
  },
  {
    id: 'en-time-6',
    question: 'We always relax ___ the weekend.',
    options: ['in', 'on', 'at', 'by'],
    answer: 1,
  },
  {
    id: 'en-time-7',
    question: 'Please finish the report ___ Friday.',
    options: ['until', 'by', 'during', 'since'],
    answer: 1,
  },
  {
    id: 'en-time-8',
    question: '___ the summer, we go to the beach every week.',
    options: ['At', 'On', 'In', 'During'],
    answer: 3,
  },
];

// ── ENGLISH — Expressing a Place ────────────────────────────
const QCM_EN_PLACE = [
  {
    id: 'en-place-1',
    question: 'The keys are ___ the table.',
    options: ['in', 'on', 'at', 'above'],
    answer: 1,
  },
  {
    id: 'en-place-2',
    question: 'She is waiting ___ the bus stop.',
    options: ['on', 'in', 'at', 'between'],
    answer: 2,
  },
  {
    id: 'en-place-3',
    question: 'The cat is hiding ___ the sofa.',
    options: ['above', 'near', 'under', 'opposite'],
    answer: 2,
  },
  {
    id: 'en-place-4',
    question: 'The bank is ___ the post office and the supermarket.',
    options: ['next to', 'between', 'behind', 'above'],
    answer: 1,
  },
  {
    id: 'en-place-5',
    question: 'My office is ___ the third floor.',
    options: ['at', 'in', 'on', 'by'],
    answer: 2,
  },
  {
    id: 'en-place-6',
    question: 'The children are playing ___ the garden.',
    options: ['at', 'on', 'in', 'above'],
    answer: 2,
  },
  {
    id: 'en-place-7',
    question: 'The school is ___ the park — you can see it from here.',
    options: ['under', 'opposite', 'behind', 'between'],
    answer: 1,
  },
  {
    id: 'en-place-8',
    question: 'She lives ___ London.',
    options: ['at', 'on', 'in', 'near'],
    answer: 2,
  },
];

// ── ENGLISH — All Prepositions ───────────────────────────────
const QCM_EN_PREP = [
  {
    id: 'en-prep-1',
    question: 'He traveled ___ bus from Paris to Lyon.',
    options: ['with', 'by', 'on', 'in'],
    answer: 1,
  },
  {
    id: 'en-prep-2',
    question: 'This book was written ___ a famous author.',
    options: ['from', 'by', 'with', 'to'],
    answer: 1,
  },
  {
    id: 'en-prep-3',
    question: 'She is good ___ mathematics.',
    options: ['in', 'at', 'on', 'for'],
    answer: 1,
  },
  {
    id: 'en-prep-4',
    question: 'We are looking forward ___ your visit.',
    options: ['for', 'of', 'to', 'at'],
    answer: 2,
  },
  {
    id: 'en-prep-5',
    question: 'He apologized ___ being late.',
    options: ['for', 'of', 'about', 'to'],
    answer: 0,
  },
  {
    id: 'en-prep-6',
    question: 'The train arrives ___ platform 3.',
    options: ['in', 'at', 'on', 'by'],
    answer: 2,
  },
  {
    id: 'en-prep-7',
    question: 'She is interested ___ learning Arabic.',
    options: ['about', 'for', 'in', 'at'],
    answer: 2,
  },
  {
    id: 'en-prep-8',
    question: 'The letter was written ___ ink.',
    options: ['by', 'with', 'in', 'of'],
    answer: 2,
  },
];

// ── ENGLISH — A Letter from London ──────────────────────────
const QCM_EN_LONDON = [
  {
    id: 'en-lon-1',
    question: 'Where was the letter written from?',
    options: ['Paris', 'New York', 'London', 'Berlin'],
    answer: 2,
  },
  {
    id: 'en-lon-2',
    question: 'Which tense is commonly used when describing current experiences in a letter?',
    options: ['Past simple', 'Present continuous', 'Future perfect', 'Past perfect'],
    answer: 1,
  },
  {
    id: 'en-lon-3',
    question: 'How do you start a formal letter in English?',
    options: ['Hey there!', 'Dear Sir/Madam,', 'Yo!', 'What\'s up?'],
    answer: 1,
  },
  {
    id: 'en-lon-4',
    question: 'Which phrase is used to end a formal letter?',
    options: ['See ya later', 'Yours sincerely,', 'TTYL', 'Bye'],
    answer: 1,
  },
  {
    id: 'en-lon-5',
    question: 'London is the capital of ___.',
    options: ['France', 'Germany', 'England', 'Spain'],
    answer: 2,
  },
  {
    id: 'en-lon-6',
    question: 'Which expression means "I am enjoying my time here"?',
    options: ['I am bored here', 'I am having a great time', 'I want to leave', 'This place is bad'],
    answer: 1,
  },
  {
    id: 'en-lon-7',
    question: 'In a letter, "I look forward to hearing from you" means:',
    options: ['I don\'t want a reply', 'I hope you will write back', 'I am angry', 'I have no news'],
    answer: 1,
  },
  {
    id: 'en-lon-8',
    question: 'Which word describes a famous old clock tower in London?',
    options: ['Eiffel', 'Big Ben', 'Colosseum', 'Sagrada'],
    answer: 1,
  },
];

// ── ENGLISH — Travel & Adventure ────────────────────────────
const QCM_EN_TRAVEL = [
  {
    id: 'en-trav-1',
    question: 'What does "to explore" mean?',
    options: ['To stay at home', 'To travel and discover new places', 'To eat local food', 'To sleep outside'],
    answer: 1,
  },
  {
    id: 'en-trav-2',
    question: 'Which word means "a journey, especially a long one"?',
    options: ['walk', 'trip', 'step', 'stop'],
    answer: 1,
  },
  {
    id: 'en-trav-3',
    question: 'She packed her ___ before the flight.',
    options: ['passport', 'suitcase', 'ticket', 'All of the above'],
    answer: 3,
  },
  {
    id: 'en-trav-4',
    question: '"Backpacking" refers to travelling ___.',
    options: ['by plane only', 'with minimal luggage and low budget', 'in a luxury hotel', 'without a destination'],
    answer: 1,
  },
  {
    id: 'en-trav-5',
    question: 'Which phrase means to enjoy yourself while travelling?',
    options: ['Have a rough time', 'Have a great adventure', 'Stay bored', 'Miss the flight'],
    answer: 1,
  },
  {
    id: 'en-trav-6',
    question: 'What do you call the place where planes take off and land?',
    options: ['Station', 'Port', 'Airport', 'Terminal'],
    answer: 2,
  },
  {
    id: 'en-trav-7',
    question: 'A "souvenir" is something you ___.',
    options: ['eat at a restaurant', 'buy to remember a place', 'read in a guidebook', 'say to a local person'],
    answer: 1,
  },
  {
    id: 'en-trav-8',
    question: '"Jet lag" is caused by ___.',
    options: ['eating too much', 'travelling across time zones', 'forgetting luggage', 'speaking another language'],
    answer: 1,
  },
];

// ── ARABIC — التعبير عن الزمن (Time) ─────────────────────────
const QCM_AR_TIME = [
  {
    id: 'ar-time-1',
    question: 'ما معنى كلمة "صباحًا"؟',
    options: ['في الليل', 'في الصباح', 'في المساء', 'في الظهيرة'],
    answer: 1,
  },
  {
    id: 'ar-time-2',
    question: 'اختر الجملة الصحيحة:',
    options: [
      'أنا ذاهب إلى المدرسة في غد',
      'أنا ذاهب إلى المدرسة غدًا',
      'أنا ذاهب إلى المدرسة الغد',
      'أنا ذاهب إلى المدرسة من غد',
    ],
    answer: 1,
  },
  {
    id: 'ar-time-3',
    question: 'ما مرادف "الآن"؟',
    options: ['لاحقًا', 'في هذه اللحظة', 'أمس', 'منذ زمن'],
    answer: 1,
  },
  {
    id: 'ar-time-4',
    question: 'كيف تقول "last year" بالعربية؟',
    options: ['العام المقبل', 'السنة الماضية', 'هذا العام', 'منذ سنوات'],
    answer: 1,
  },
  {
    id: 'ar-time-5',
    question: '"بعد ساعة" يعني:',
    options: ['قبل ساعة', 'منذ ساعة', 'في غضون ساعة', 'طوال ساعة'],
    answer: 2,
  },
  {
    id: 'ar-time-6',
    question: 'ما عكس كلمة "قديم"؟',
    options: ['جميل', 'قبيح', 'حديث', 'كبير'],
    answer: 2,
  },
  {
    id: 'ar-time-7',
    question: 'أي من هذه الكلمات تعبّر عن المستقبل؟',
    options: ['أمس', 'قبل', 'سوف', 'منذ'],
    answer: 2,
  },
  {
    id: 'ar-time-8',
    question: 'كم يوم في الأسبوع؟',
    options: ['خمسة', 'ستة', 'سبعة', 'ثمانية'],
    answer: 2,
  },
];

// ── ARABIC — التعبير عن المكان (Place) ───────────────────────
const QCM_AR_PLACE = [
  {
    id: 'ar-place-1',
    question: 'ما معنى "فوق"؟',
    options: ['تحت', 'بجانب', 'أعلى', 'خلف'],
    answer: 2,
  },
  {
    id: 'ar-place-2',
    question: 'اختر الجملة الصحيحة:',
    options: [
      'الكتاب على الطاولة',
      'الكتاب في الطاولة',
      'الكتاب من الطاولة',
      'الكتاب إلى الطاولة',
    ],
    answer: 0,
  },
  {
    id: 'ar-place-3',
    question: '"بين" تعني:',
    options: ['next to one side', 'in the middle of two things', 'behind', 'above'],
    answer: 1,
  },
  {
    id: 'ar-place-4',
    question: 'ما مقابل "أمام" ؟',
    options: ['فوق', 'تحت', 'خلف', 'بجانب'],
    answer: 2,
  },
  {
    id: 'ar-place-5',
    question: 'أين الكتاب في الجملة: "الكتاب داخل الحقيبة"؟',
    options: ['على الطاولة', 'أمام الباب', 'داخل الحقيبة', 'تحت الكرسي'],
    answer: 2,
  },
  {
    id: 'ar-place-6',
    question: 'كيف تقول "next to" بالعربية؟',
    options: ['فوق', 'بجانب', 'تحت', 'بين'],
    answer: 1,
  },
  {
    id: 'ar-place-7',
    question: '"قريب من" يعني:',
    options: ['far from', 'near / close to', 'inside', 'opposite'],
    answer: 1,
  },
  {
    id: 'ar-place-8',
    question: 'أين البنك في الجملة: "البنك أمام المدرسة"؟',
    options: ['خلف المدرسة', 'بجانب المدرسة', 'أمام المدرسة', 'داخل المدرسة'],
    answer: 2,
  },
];

// ── ARABIC — حروف الجر (Prepositions) ───────────────────────
const QCM_AR_PREP = [
  {
    id: 'ar-prep-1',
    question: 'أكمل الجملة: "ذهبت ___ المدرسة."',
    options: ['في', 'إلى', 'من', 'على'],
    answer: 1,
  },
  {
    id: 'ar-prep-2',
    question: '"من" في الجملة "جئتُ من باريس" تعني:',
    options: ['to', 'at', 'from', 'with'],
    answer: 2,
  },
  {
    id: 'ar-prep-3',
    question: 'أكمل: "الكتاب ___ الطاولة." (The book is on the table)',
    options: ['في', 'من', 'على', 'إلى'],
    answer: 2,
  },
  {
    id: 'ar-prep-4',
    question: 'ما حرف الجر المناسب: "أتحدث ___ أستاذي كل يوم"؟',
    options: ['من', 'في', 'مع', 'إلى'],
    answer: 2,
  },
  {
    id: 'ar-prep-5',
    question: '"في" تستخدم للدلالة على:',
    options: ['الاتجاه (direction)', 'المكان والزمان (place/time)', 'الأداة (tool)', 'الملكية (possession)'],
    answer: 1,
  },
  {
    id: 'ar-prep-6',
    question: 'أكمل: "الكتاب ___ الحقيبة." (The book is inside the bag)',
    options: ['على', 'في', 'من', 'إلى'],
    answer: 1,
  },
  {
    id: 'ar-prep-7',
    question: '"لـ" تُستخدم للتعبير عن:',
    options: ['المكان', 'الملكية والغاية', 'الأداة', 'الانتقال'],
    answer: 1,
  },
  {
    id: 'ar-prep-8',
    question: 'أكمل: "أكتب ___ قلم." (I write with a pen)',
    options: ['في', 'على', 'بـ', 'من'],
    answer: 2,
  },
];

// ── ARABIC — رسالة من لندن (Letter from London) ──────────────
const QCM_AR_LONDON = [
  {
    id: 'ar-lon-1',
    question: 'من أين كُتبت الرسالة؟',
    options: ['باريس', 'برلين', 'لندن', 'مدريد'],
    answer: 2,
  },
  {
    id: 'ar-lon-2',
    question: 'ما هي عاصمة إنجلترا؟',
    options: ['مانشستر', 'لندن', 'ليفربول', 'برمنغهام'],
    answer: 1,
  },
  {
    id: 'ar-lon-3',
    question: 'كيف تبدأ رسالة رسمية بالعربية؟',
    options: ['مرحبا يا صاحبي!', 'إلى من يهمه الأمر...', 'هيا نتحدث', 'يا أخي'],
    answer: 1,
  },
  {
    id: 'ar-lon-4',
    question: 'ما معنى "أتمنى أن تكون بخير"؟',
    options: ['I miss you', 'I hope you are well', 'I am late', 'Please reply'],
    answer: 1,
  },
  {
    id: 'ar-lon-5',
    question: 'ما الكلمة المناسبة: "أكتب إليك من ___ لندن"؟',
    options: ['في', 'على', 'مدينة', 'داخل'],
    answer: 2,
  },
  {
    id: 'ar-lon-6',
    question: '"Big Ben" هو:',
    options: ['متحف مشهور', 'برج الساعة الشهير في لندن', 'مطعم شهير', 'جسر فوق النهر'],
    answer: 1,
  },
  {
    id: 'ar-lon-7',
    question: 'ما معنى "أتطلع إلى ردّك"؟',
    options: ['أنا غاضب منك', 'أنتظر ردّك بشوق', 'لا أريد ردًا', 'أنسيتُك'],
    answer: 1,
  },
  {
    id: 'ar-lon-8',
    question: 'كيف تختم رسالة بالعربية؟',
    options: ['مع السلامة فقط', 'مع تحياتي الحارة / تفضل بقبول التحية', 'إلى اللقاء!', 'وداعًا للأبد'],
    answer: 1,
  },
];

// ── ARABIC — السفر والمغامرة (Travel & Adventure) ────────────
const QCM_AR_TRAVEL = [
  {
    id: 'ar-trav-1',
    question: 'ما معنى "السفر"؟',
    options: ['النوم', 'الطبخ', 'التنقل والرحلات', 'القراءة'],
    answer: 2,
  },
  {
    id: 'ar-trav-2',
    question: 'ما الذي تحتاجه قبل السفر إلى الخارج؟',
    options: ['جواز السفر', 'الكتاب المدرسي', 'المطبخ', 'الدراجة'],
    answer: 0,
  },
  {
    id: 'ar-trav-3',
    question: '"المغامرة" تعني:',
    options: ['الاسترخاء في المنزل', 'تجربة مثيرة وغير متوقعة', 'النوم المبكر', 'تناول الطعام'],
    answer: 1,
  },
  {
    id: 'ar-trav-4',
    question: 'أكمل: "أحب ___ إلى أماكن جديدة."',
    options: ['الطبخ', 'النوم', 'السفر', 'القراءة'],
    answer: 2,
  },
  {
    id: 'ar-trav-5',
    question: 'ما معنى "الحقيبة"؟',
    options: ['passport', 'suitcase / bag', 'ticket', 'hotel'],
    answer: 1,
  },
  {
    id: 'ar-trav-6',
    question: 'أين تستقل الطائرة؟',
    options: ['في المحطة', 'في المطار', 'في الميناء', 'في المدرسة'],
    answer: 1,
  },
  {
    id: 'ar-trav-7',
    question: '"تذكرة" تعني:',
    options: ['hotel room', 'ticket', 'luggage', 'map'],
    answer: 1,
  },
  {
    id: 'ar-trav-8',
    question: 'ما عكس "الوصول"؟',
    options: ['السفر', 'المغادرة', 'الإقامة', 'الراحة'],
    answer: 1,
  },
];

// ════════════════════════════════════════════════════════════
// MAPPING — course title pattern → QCM bank
// ════════════════════════════════════════════════════════════
const COURSE_QCM = [
  { match: (t) => t.includes('Time') && !t.includes('Arabic'),   qcm: QCM_EN_TIME   },
  { match: (t) => t.includes('Place') && !t.includes('Arabic'),  qcm: QCM_EN_PLACE  },
  { match: (t) => t.includes('Prepositions') && t.includes('English'), qcm: QCM_EN_PREP },
  { match: (t) => t.includes('Prepositions') && !t.includes('English') && !t.includes('حروف'), qcm: QCM_EN_PREP },
  { match: (t) => t.includes('Letter') && t.includes('London') && !t.includes('Arabic'), qcm: QCM_EN_LONDON },
  { match: (t) => t.includes('Travel') && !t.includes('Arabic'), qcm: QCM_EN_TRAVEL  },
  // Arabic
  { match: (t) => t.includes('الزمن'),    qcm: QCM_AR_TIME   },
  { match: (t) => t.includes('المكان'),   qcm: QCM_AR_PLACE  },
  { match: (t) => t.includes('حروف الجر'), qcm: QCM_AR_PREP  },
  { match: (t) => t.includes('لندن'),     qcm: QCM_AR_LONDON },
  { match: (t) => t.includes('السفر'),    qcm: QCM_AR_TRAVEL },
];

function findQcm(titre) {
  for (const rule of COURSE_QCM) {
    if (rule.match(titre)) return rule.qcm;
  }
  return null;
}

// ════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════
async function main() {
  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);

  console.log('🔐 Authenticating...');
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log('✅ Authenticated\n');

  const courses = await pb.collection('courses').getFullList({
    filter: `(langue = "Anglais" || langue = "Arabe") && course_type = "standard"`,
    sort: 'created',
    requestKey: null,
  });

  console.log(`📋 Found ${courses.length} standard EN + AR courses\n`);
  console.log('─'.repeat(60));

  let updated = 0;
  let skipped = 0;
  let noMatch = 0;

  for (const course of courses) {
    const titre = course.titre || '';
    const existing = course.exercises;
    let hasExercises = false;
    try {
      const parsed = typeof existing === 'string' ? JSON.parse(existing) : existing;
      hasExercises = Array.isArray(parsed) && parsed.length > 0;
    } catch {}

    if (hasExercises) {
      console.log(`  ✅ Already has exercises: "${titre}"`);
      skipped++;
      continue;
    }

    const qcm = findQcm(titre);
    if (!qcm) {
      console.log(`  ⚠️  No QCM bank found for: "${titre}"`);
      noMatch++;
      continue;
    }

    try {
      await pb.collection('courses').update(course.id, {
        exercises: JSON.stringify(qcm),
      });
      console.log(`  ✅ Added ${qcm.length} QCM questions to: "${titre}"`);
      updated++;
    } catch (err) {
      console.error(`  ❌ Failed: ${err.message}`);
    }
  }

  console.log('\n════════════════════════════════════════════');
  console.log(`✅ Done: ${updated} updated, ${skipped} already had exercises, ${noMatch} no match`);
  console.log('════════════════════════════════════════════');
}

main().catch(err => {
  console.error('Fatal:', err?.data ? JSON.stringify(err.data) : err.message);
  process.exit(1);
});
