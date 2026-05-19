/**
 * update-arabic-to-english-translations.mjs
 * ════════════════════════════════════════════════════════════════════
 * Met à jour les 5 cours arabes standard :
 * remplace TOUTES les traductions françaises par de l'anglais.
 *
 * Usage :  cd apps/api && node update-arabic-to-english-translations.mjs
 * ════════════════════════════════════════════════════════════════════
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

const GREEN = '#27ae60';
const TH    = `style="background:${GREEN};color:#fff"`;
const ROW   = `style="background:#f9f9f9"`;

// ════════════════════════════════════════════════════════════════════
// COURS 1 — التعبير عن الزمن — Expressing Time in Arabic
// ════════════════════════════════════════════════════════════════════
const TIME_PAGES = [
  {
    id: 'ar-time-p1', type: 'intro',
    title: 'Introduction — التعبير عن الزمن',
    content: `<div style="text-align:center;margin-bottom:16px">
  <span style="background:${GREEN};color:#fff;padding:6px 18px;border-radius:20px;font-size:13px;font-weight:600">⏰ Arabic Grammar — النحو العربي</span>
</div>
<h2 style="text-align:center;direction:rtl">التعبير عن الزمن بالعربية</h2>
<p style="text-align:center;color:#555">Expressing Time in Arabic</p>
<div style="background:#f0fff4;border-left:4px solid ${GREEN};border-radius:6px;padding:14px;margin:16px 0">
  <strong>🎯 Lesson Objectives</strong>
  <ul style="margin:8px 0 0 0">
    <li>Use time adverbs in Arabic: <strong>الآن، اليوم، أمس، غداً</strong></li>
    <li>Use time prepositions: <strong>في، منذ، خلال، قبل، بعد</strong></li>
    <li>Name the days of the week and months in Arabic</li>
    <li>Talk about past, present and future events</li>
  </ul>
</div>
<p style="background:#f0fff4;padding:10px;border-radius:6px;text-align:center;direction:rtl">
  <strong>في هذا الدرس:</strong> الآن · اليوم · أمس · غداً · في · منذ · خلال · قبل · بعد
</p>`,
  },
  {
    id: 'ar-time-p2', type: 'lesson',
    title: 'ظرف الزمان — Time Adverbs',
    content: `<h3>📖 ظرف الزمان (Time Adverbs)</h3>
<table style="width:100%;border-collapse:collapse">
  <thead><tr ${TH}>
    <th style="padding:8px">العربية</th>
    <th style="padding:8px">Transliteration</th>
    <th style="padding:8px">English</th>
    <th style="padding:8px">Example</th>
  </tr></thead>
  <tbody>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>الآن</strong></td><td style="padding:8px">al-ān</td><td style="padding:8px">now</td><td style="padding:8px;direction:rtl">أنا أدرس الآن.<br/><span style="color:#888;font-style:italic">= I am studying now.</span></td></tr>
    <tr ${ROW}><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>اليَوْم</strong></td><td style="padding:8px">al-yawm</td><td style="padding:8px">today</td><td style="padding:8px;direction:rtl">اليوم الاثنين.<br/><span style="color:#888;font-style:italic">= Today is Monday.</span></td></tr>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>أَمْس</strong></td><td style="padding:8px">ams</td><td style="padding:8px">yesterday</td><td style="padding:8px;direction:rtl">ذهبتُ إلى المدرسة أمس.<br/><span style="color:#888;font-style:italic">= I went to school yesterday.</span></td></tr>
    <tr ${ROW}><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>غَداً</strong></td><td style="padding:8px">ghadan</td><td style="padding:8px">tomorrow</td><td style="padding:8px;direction:rtl">سأسافر غداً.<br/><span style="color:#888;font-style:italic">= I will travel tomorrow.</span></td></tr>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>الأسبوع الماضي</strong></td><td style="padding:8px">al-māḍī</td><td style="padding:8px">last week</td><td style="padding:8px;direction:rtl">زرتُه الأسبوع الماضي.<br/><span style="color:#888;font-style:italic">= I visited him last week.</span></td></tr>
    <tr ${ROW}><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>الأسبوع القادم</strong></td><td style="padding:8px">al-qādim</td><td style="padding:8px">next week</td><td style="padding:8px;direction:rtl">الاجتماع الأسبوع القادم.<br/><span style="color:#888;font-style:italic">= The meeting is next week.</span></td></tr>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>دَائِماً</strong></td><td style="padding:8px">dā'iman</td><td style="padding:8px">always</td><td style="padding:8px;direction:rtl">هو دائماً في الوقت.<br/><span style="color:#888;font-style:italic">= He is always on time.</span></td></tr>
    <tr ${ROW}><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>أَحْيَاناً</strong></td><td style="padding:8px">aḥyānan</td><td style="padding:8px">sometimes</td><td style="padding:8px;direction:rtl">أحياناً أتأخر.<br/><span style="color:#888;font-style:italic">= I am sometimes late.</span></td></tr>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>أَبَداً</strong></td><td style="padding:8px">abadan</td><td style="padding:8px">never</td><td style="padding:8px;direction:rtl">لا أكذب أبداً.<br/><span style="color:#888;font-style:italic">= I never lie.</span></td></tr>
  </tbody>
</table>`,
  },
  {
    id: 'ar-time-p3', type: 'lesson',
    title: 'أيام الأسبوع — Days of the Week',
    content: `<h3>📖 أيام الأسبوع (Days of the Week)</h3>
<table style="width:100%;border-collapse:collapse">
  <thead><tr ${TH}>
    <th style="padding:8px">العربية</th>
    <th style="padding:8px">Transliteration</th>
    <th style="padding:8px">English</th>
  </tr></thead>
  <tbody>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>الأحَد</strong></td><td style="padding:8px">al-aḥad</td><td style="padding:8px">Sunday</td></tr>
    <tr ${ROW}><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>الاثْنَيْن</strong></td><td style="padding:8px">al-ithnayn</td><td style="padding:8px">Monday</td></tr>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>الثَّلَاثَاء</strong></td><td style="padding:8px">ath-thulāthā'</td><td style="padding:8px">Tuesday</td></tr>
    <tr ${ROW}><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>الأَرْبِعَاء</strong></td><td style="padding:8px">al-arbi'ā'</td><td style="padding:8px">Wednesday</td></tr>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>الخَمِيس</strong></td><td style="padding:8px">al-khamīs</td><td style="padding:8px">Thursday</td></tr>
    <tr ${ROW}><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>الجُمُعَة</strong></td><td style="padding:8px">al-jumu'a</td><td style="padding:8px">Friday</td></tr>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>السَّبْت</strong></td><td style="padding:8px">as-sabt</td><td style="padding:8px">Saturday</td></tr>
  </tbody>
</table>`,
  },
  {
    id: 'ar-time-p4', type: 'lesson',
    title: 'حروف الجر الزمانية — Time Prepositions',
    content: `<h3>📖 حروف الجر الزمانية (Time Prepositions)</h3>
<table style="width:100%;border-collapse:collapse">
  <thead><tr ${TH}>
    <th style="padding:8px">العربية</th>
    <th style="padding:8px">Transliteration</th>
    <th style="padding:8px">English</th>
    <th style="padding:8px">Example</th>
  </tr></thead>
  <tbody>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>في</strong></td><td style="padding:8px">fī</td><td style="padding:8px">in / on (time)</td><td style="padding:8px;direction:rtl">في يناير · في الصباح<br/><span style="color:#888;font-style:italic">= in January · in the morning</span></td></tr>
    <tr ${ROW}><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>منذ</strong></td><td style="padding:8px">mundhu</td><td style="padding:8px">since / for</td><td style="padding:8px;direction:rtl">أسكن هنا منذ سنتين.<br/><span style="color:#888;font-style:italic">= I have lived here for two years.</span></td></tr>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>خلال</strong></td><td style="padding:8px">khilāla</td><td style="padding:8px">during</td><td style="padding:8px;direction:rtl">خلال الصيف · خلال الاجتماع<br/><span style="color:#888;font-style:italic">= during the summer · during the meeting</span></td></tr>
    <tr ${ROW}><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>قبل</strong></td><td style="padding:8px">qabla</td><td style="padding:8px">before</td><td style="padding:8px;direction:rtl">قبل الدرس · قبل الأكل<br/><span style="color:#888;font-style:italic">= before the lesson · before eating</span></td></tr>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>بعد</strong></td><td style="padding:8px">ba'da</td><td style="padding:8px">after</td><td style="padding:8px;direction:rtl">بعد الظهر · بعد ساعة<br/><span style="color:#888;font-style:italic">= in the afternoon · after one hour</span></td></tr>
  </tbody>
</table>`,
  },
  {
    id: 'ar-time-p5', type: 'exercises',
    title: 'Exercises — تدريبات',
    content: `<h3>✏️ Exercises — تدريبات</h3>
<h4>Choose the correct word — اختر الكلمة الصحيحة</h4>
<p dir="rtl">اختر من: الآن / أمس / غداً / دائماً / أحياناً</p>
<ol dir="rtl">
  <li>ذهبتُ إلى السوق ___.</li>
  <li>سيأتي أخي ___.</li>
  <li>هو ___ يصل في الوقت.</li>
  <li>أنا ___ أدرس في المساء.</li>
  <li>ماذا تفعل ___؟</li>
</ol>
<h4>Translate into Arabic — ترجم إلى العربية</h4>
<ol>
  <li>I went to school yesterday.</li>
  <li>She always arrives on time.</li>
  <li>I have lived here since 2020.</li>
  <li>The exam is before lunch.</li>
</ol>`,
  },
];

// ════════════════════════════════════════════════════════════════════
// COURS 2 — التعبير عن المكان — Expressing Place in Arabic
// ════════════════════════════════════════════════════════════════════
const PLACE_PAGES = [
  {
    id: 'ar-place-p1', type: 'intro',
    title: 'Introduction — التعبير عن المكان',
    content: `<div style="text-align:center;margin-bottom:16px">
  <span style="background:${GREEN};color:#fff;padding:6px 18px;border-radius:20px;font-size:13px;font-weight:600">📍 Arabic Grammar — النحو العربي</span>
</div>
<h2 style="text-align:center;direction:rtl">التعبير عن المكان بالعربية</h2>
<p style="text-align:center;color:#555">Expressing Place in Arabic</p>
<div style="background:#f0fff4;border-left:4px solid ${GREEN};border-radius:6px;padding:14px;margin:16px 0">
  <strong>🎯 Lesson Objectives</strong>
  <ul style="margin:8px 0 0 0">
    <li>Use place prepositions: <strong>في، على، تحت، فوق، أمام، خلف، بين، بجانب</strong></li>
    <li>Describe the position of objects and people</li>
    <li>Read and understand place descriptions in Arabic</li>
    <li>Write sentences about location using Arabic prepositions</li>
  </ul>
</div>
<p style="background:#f0fff4;padding:10px;border-radius:6px;text-align:center;direction:rtl">
  <strong>في هذا الدرس:</strong> في · على · تحت · فوق · أمام · خلف · بين · بجانب · قرب · داخل · خارج
</p>`,
  },
  {
    id: 'ar-place-p2', type: 'lesson',
    title: 'حروف الجر المكانية — Place Prepositions',
    content: `<h3>📖 حروف الجر المكانية (Place Prepositions)</h3>
<table style="width:100%;border-collapse:collapse">
  <thead><tr ${TH}>
    <th style="padding:8px">العربية</th>
    <th style="padding:8px">Transliteration</th>
    <th style="padding:8px">English</th>
    <th style="padding:8px">Example</th>
  </tr></thead>
  <tbody>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>في</strong></td><td style="padding:8px">fī</td><td style="padding:8px">in, inside</td><td style="padding:8px;direction:rtl">الكتاب في الحقيبة.<br/><span style="color:#888;font-style:italic">= The book is in the bag.</span></td></tr>
    <tr ${ROW}><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>على</strong></td><td style="padding:8px">'alā</td><td style="padding:8px">on</td><td style="padding:8px;direction:rtl">القلم على الطاولة.<br/><span style="color:#888;font-style:italic">= The pen is on the table.</span></td></tr>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>تحت</strong></td><td style="padding:8px">taḥta</td><td style="padding:8px">under</td><td style="padding:8px;direction:rtl">القطة تحت الكرسي.<br/><span style="color:#888;font-style:italic">= The cat is under the chair.</span></td></tr>
    <tr ${ROW}><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>فوق</strong></td><td style="padding:8px">fawqa</td><td style="padding:8px">above, over</td><td style="padding:8px;direction:rtl">الطائرة فوق الغيوم.<br/><span style="color:#888;font-style:italic">= The plane is above the clouds.</span></td></tr>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>أمام</strong></td><td style="padding:8px">amāma</td><td style="padding:8px">in front of</td><td style="padding:8px;direction:rtl">السيارة أمام البيت.<br/><span style="color:#888;font-style:italic">= The car is in front of the house.</span></td></tr>
    <tr ${ROW}><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>خلف</strong></td><td style="padding:8px">khalfa</td><td style="padding:8px">behind</td><td style="padding:8px;direction:rtl">الحديقة خلف المنزل.<br/><span style="color:#888;font-style:italic">= The garden is behind the house.</span></td></tr>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>بين</strong></td><td style="padding:8px">bayna</td><td style="padding:8px">between</td><td style="padding:8px;direction:rtl">المدرسة بين المستشفى والحديقة.<br/><span style="color:#888;font-style:italic">= The school is between the hospital and the park.</span></td></tr>
    <tr ${ROW}><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>بجانب / قرب</strong></td><td style="padding:8px">bi-jānib / qurba</td><td style="padding:8px">next to, near</td><td style="padding:8px;direction:rtl">البنك بجانب المكتبة.<br/><span style="color:#888;font-style:italic">= The bank is next to the library.</span></td></tr>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>داخل</strong></td><td style="padding:8px">dākhil</td><td style="padding:8px">inside</td><td style="padding:8px;direction:rtl">الأطفال داخل الفصل.<br/><span style="color:#888;font-style:italic">= The children are inside the classroom.</span></td></tr>
    <tr ${ROW}><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>خارج</strong></td><td style="padding:8px">khārij</td><td style="padding:8px">outside</td><td style="padding:8px;direction:rtl">اللعب خارج البيت.<br/><span style="color:#888;font-style:italic">= Playing outside the house.</span></td></tr>
  </tbody>
</table>`,
  },
  {
    id: 'ar-place-p3', type: 'exercises',
    title: 'Exercises — تدريبات',
    content: `<h3>✏️ Exercises</h3>
<h4>Complete the sentences — أكمل الجمل</h4>
<p dir="rtl">اختر من: في / على / تحت / أمام / بين</p>
<ol dir="rtl">
  <li>القطة ___ الطاولة.</li>
  <li>الكتاب ___ الحقيبة.</li>
  <li>وقفتُ ___ باب المدرسة.</li>
  <li>المطعم ___ الفندق والمكتبة.</li>
  <li>وضعتُ الصحن ___ الطاولة.</li>
</ol>
<h4>Translate into Arabic — ترجم إلى العربية</h4>
<ol>
  <li>The cat is under the chair.</li>
  <li>The bank is next to the pharmacy.</li>
  <li>The school is between the hospital and the park.</li>
  <li>The children are inside the classroom.</li>
</ol>`,
  },
  {
    id: 'ar-place-p4', type: 'lesson',
    title: 'Quick Reference — ملخص',
    content: `<h3>📋 Quick Reference — حروف الجر المكانية</h3>
<div style="background:#f0fff4;border-radius:8px;padding:16px;line-height:2.4;direction:rtl">
  <p><span style="background:${GREEN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">في</span> &nbsp;in, inside — في الحقيبة · في المدينة</p>
  <p><span style="background:${GREEN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">على</span> &nbsp;on — على الطاولة · على الجدار</p>
  <p><span style="background:${GREEN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">تحت</span> &nbsp;under &nbsp;|&nbsp; <span style="background:${GREEN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">فوق</span> &nbsp;above / over</p>
  <p><span style="background:${GREEN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">أمام</span> &nbsp;in front of &nbsp;|&nbsp; <span style="background:${GREEN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">خلف</span> &nbsp;behind</p>
  <p><span style="background:${GREEN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">بين</span> &nbsp;between &nbsp;|&nbsp; <span style="background:${GREEN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">بجانب</span> &nbsp;next to</p>
  <p><span style="background:${GREEN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">داخل</span> &nbsp;inside &nbsp;|&nbsp; <span style="background:${GREEN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">خارج</span> &nbsp;outside</p>
</div>`,
  },
];

// ════════════════════════════════════════════════════════════════════
// COURS 3 — حروف الجر — Arabic Prepositions (A1–A2)
// ════════════════════════════════════════════════════════════════════
const PREP_PAGES = [
  {
    id: 'ar-prep2-p1', type: 'intro',
    title: 'Introduction — حروف الجر',
    content: `<div style="text-align:center;margin-bottom:16px">
  <span style="background:${GREEN};color:#fff;padding:6px 18px;border-radius:20px;font-size:13px;font-weight:600">🔡 Arabic Grammar — النحو العربي</span>
</div>
<h2 style="text-align:center;direction:rtl">حروف الجر في اللغة العربية</h2>
<p style="text-align:center;color:#555">Arabic Prepositions — Complete Guide</p>
<div style="background:#f0fff4;border-left:4px solid ${GREEN};border-radius:6px;padding:14px;margin:16px 0">
  <strong>🎯 Lesson Objectives</strong>
  <ul style="margin:8px 0 0 0">
    <li>Use place prepositions: <strong>في، على، تحت، فوق، أمام، خلف، بين</strong></li>
    <li>Use time prepositions: <strong>في، منذ، خلال، قبل، بعد</strong></li>
    <li>Use movement prepositions: <strong>إلى، من، نحو، عبر</strong></li>
    <li>Understand fixed verb + preposition combinations</li>
  </ul>
</div>
<p style="background:#f0fff4;padding:10px;border-radius:6px;text-align:center;direction:rtl">
  <strong>في هذا الدرس:</strong> في · على · تحت · فوق · من · إلى · مع · بدون · بسبب · أمام · خلف · بين
</p>`,
  },
  {
    id: 'ar-prep2-p2', type: 'lesson',
    title: 'Place Prepositions — حروف الجر المكانية',
    content: `<h3>📖 حروف الجر المكانية (Place Prepositions)</h3>
<table style="width:100%;border-collapse:collapse">
  <thead><tr ${TH}>
    <th style="padding:8px">العربية</th>
    <th style="padding:8px">Transliteration</th>
    <th style="padding:8px">English</th>
    <th style="padding:8px">Example</th>
  </tr></thead>
  <tbody>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>في</strong></td><td style="padding:8px">fī</td><td style="padding:8px">in, inside</td><td style="padding:8px;direction:rtl">الكتاب في الحقيبة.<br/><span style="color:#888;font-style:italic">= The book is in the bag.</span></td></tr>
    <tr ${ROW}><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>على</strong></td><td style="padding:8px">'alā</td><td style="padding:8px">on</td><td style="padding:8px;direction:rtl">القلم على الطاولة.<br/><span style="color:#888;font-style:italic">= The pen is on the table.</span></td></tr>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>تحت</strong></td><td style="padding:8px">taḥta</td><td style="padding:8px">under</td><td style="padding:8px;direction:rtl">القطة تحت الكرسي.<br/><span style="color:#888;font-style:italic">= The cat is under the chair.</span></td></tr>
    <tr ${ROW}><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>فوق</strong></td><td style="padding:8px">fawqa</td><td style="padding:8px">above</td><td style="padding:8px;direction:rtl">الطائرة فوق الغيوم.<br/><span style="color:#888;font-style:italic">= The plane is above the clouds.</span></td></tr>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>أمام</strong></td><td style="padding:8px">amāma</td><td style="padding:8px">in front of</td><td style="padding:8px;direction:rtl">السيارة أمام البيت.<br/><span style="color:#888;font-style:italic">= The car is in front of the house.</span></td></tr>
    <tr ${ROW}><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>خلف</strong></td><td style="padding:8px">khalfa</td><td style="padding:8px">behind</td><td style="padding:8px;direction:rtl">الحديقة خلف المنزل.<br/><span style="color:#888;font-style:italic">= The garden is behind the house.</span></td></tr>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>بين</strong></td><td style="padding:8px">bayna</td><td style="padding:8px">between</td><td style="padding:8px;direction:rtl">المدرسة بين المستشفى والحديقة.<br/><span style="color:#888;font-style:italic">= The school is between the hospital and the park.</span></td></tr>
    <tr ${ROW}><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>بجانب</strong></td><td style="padding:8px">bi-jānib</td><td style="padding:8px">next to</td><td style="padding:8px;direction:rtl">البنك بجانب المكتبة.<br/><span style="color:#888;font-style:italic">= The bank is next to the library.</span></td></tr>
  </tbody>
</table>`,
  },
  {
    id: 'ar-prep2-p3', type: 'lesson',
    title: 'Time Prepositions — حروف الجر الزمانية',
    content: `<h3>📖 حروف الجر الزمانية (Time Prepositions)</h3>
<table style="width:100%;border-collapse:collapse">
  <thead><tr ${TH}>
    <th style="padding:8px">العربية</th>
    <th style="padding:8px">Transliteration</th>
    <th style="padding:8px">English</th>
    <th style="padding:8px">Example</th>
  </tr></thead>
  <tbody>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>في</strong></td><td style="padding:8px">fī</td><td style="padding:8px">in / on (time)</td><td style="padding:8px;direction:rtl">في يناير · في الصباح<br/><span style="color:#888;font-style:italic">= in January · in the morning</span></td></tr>
    <tr ${ROW}><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>منذ</strong></td><td style="padding:8px">mundhu</td><td style="padding:8px">since / for</td><td style="padding:8px;direction:rtl">أسكن هنا منذ سنتين.<br/><span style="color:#888;font-style:italic">= I have lived here for two years.</span></td></tr>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>خلال</strong></td><td style="padding:8px">khilāla</td><td style="padding:8px">during</td><td style="padding:8px;direction:rtl">خلال الصيف · خلال الاجتماع<br/><span style="color:#888;font-style:italic">= during the summer · during the meeting</span></td></tr>
    <tr ${ROW}><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>قبل</strong></td><td style="padding:8px">qabla</td><td style="padding:8px">before</td><td style="padding:8px;direction:rtl">قبل الدرس · قبل الأكل<br/><span style="color:#888;font-style:italic">= before the lesson · before eating</span></td></tr>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>بعد</strong></td><td style="padding:8px">ba'da</td><td style="padding:8px">after</td><td style="padding:8px;direction:rtl">بعد الظهر · بعد ساعة<br/><span style="color:#888;font-style:italic">= in the afternoon · after one hour</span></td></tr>
  </tbody>
</table>`,
  },
  {
    id: 'ar-prep2-p4', type: 'exercises',
    title: 'Exercises — تدريبات',
    content: `<h3>✏️ Exercises — تدريبات</h3>
<h4>Complete the sentences — أكمل الجمل</h4>
<p dir="rtl">اختر الحرف المناسب: في / على / تحت / أمام / بين</p>
<ol dir="rtl">
  <li>القطة ___ الطاولة.</li>
  <li>الكتاب ___ الحقيبة.</li>
  <li>وقفتُ ___ باب المدرسة.</li>
  <li>المطعم ___ الفندق والمكتبة.</li>
  <li>وضعتُ الصحن ___ الطاولة.</li>
</ol>
<h4>Translate into Arabic — ترجم إلى العربية</h4>
<ol>
  <li>The cat is under the chair.</li>
  <li>The bank is next to the pharmacy.</li>
  <li>I have been studying for one hour.</li>
  <li>The meeting is before lunch.</li>
</ol>`,
  },
  {
    id: 'ar-prep2-p5', type: 'lesson',
    title: 'Quick Reference — ملخص حروف الجر',
    content: `<h3>📋 Quick Reference — حروف الجر</h3>
<div style="background:#f0fff4;border-radius:8px;padding:16px;line-height:2.4;direction:rtl">
  <p><span style="background:${GREEN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">في</span> &nbsp;in the bag · in January · in the morning</p>
  <p><span style="background:${GREEN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">على</span> &nbsp;on the table · on the wall</p>
  <p><span style="background:${GREEN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">تحت</span> &nbsp;under &nbsp;|&nbsp; <span style="background:${GREEN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">فوق</span> &nbsp;above</p>
  <p><span style="background:${GREEN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">أمام</span> &nbsp;in front of &nbsp;|&nbsp; <span style="background:${GREEN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">خلف</span> &nbsp;behind &nbsp;|&nbsp; <span style="background:${GREEN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">بين</span> &nbsp;between</p>
  <p><span style="background:${GREEN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">من</span> &nbsp;from &nbsp;|&nbsp; <span style="background:${GREEN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">إلى</span> &nbsp;to &nbsp;|&nbsp; <span style="background:${GREEN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">مع</span> &nbsp;with</p>
  <p><span style="background:${GREEN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">قبل</span> &nbsp;before &nbsp;|&nbsp; <span style="background:${GREEN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">بعد</span> &nbsp;after &nbsp;|&nbsp; <span style="background:${GREEN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">منذ</span> &nbsp;since / for</p>
</div>`,
  },
];

// ════════════════════════════════════════════════════════════════════
// COURS 4 — رسالة من لندن — A Letter from London (Arabic)
// ════════════════════════════════════════════════════════════════════
const LONDON_PAGES = [
  {
    id: 'ar-london2-p1', type: 'intro',
    title: 'Introduction — رسالة من لندن',
    content: `<div style="text-align:center;margin-bottom:16px">
  <span style="background:${GREEN};color:#fff;padding:6px 18px;border-radius:20px;font-size:13px;font-weight:600">📖 Reading &amp; Writing — القراءة والكتابة</span>
</div>
<h2 style="text-align:center;direction:rtl">رسالة من لندن</h2>
<p style="text-align:center;color:#555">A Letter from London — Read and Write in Arabic</p>
<div style="background:#f0fff4;border-left:4px solid ${GREEN};border-radius:6px;padding:14px;margin:16px 0">
  <strong>🎯 Lesson Objectives</strong>
  <ul style="margin:8px 0 0 0">
    <li>Read and understand a personal letter written in Arabic</li>
    <li>Learn vocabulary related to city life and London</li>
    <li>Understand Arabic letter structure (opening and closing)</li>
    <li>Write your own short letter in Arabic (80–100 words)</li>
  </ul>
</div>`,
  },
  {
    id: 'ar-london2-p2', type: 'lesson',
    title: 'The Letter — رسالة من لندن',
    content: `<h3>📖 Read the letter — اقرأ الرسالة</h3>
<div style="background:#f8f9fa;border:1px solid #dee2e6;border-radius:8px;padding:24px;font-family:Georgia,serif;line-height:2;direction:rtl">
  <p style="text-align:left;color:#666;font-size:13px;direction:ltr">15 Baker Street, London · 10 October 2024</p>
  <p><strong>ياسمين العزيزة،</strong></p>
  <p>كيف حالك؟ أتمنى أن تكوني بخير. أكتب إليك من شقتي الجديدة في لندن. وصلتُ هنا منذ أسبوعين، وأنا أتأقلم ببطء مع الحياة في هذه المدينة الرائعة.</p>
  <p>لندن مدينة كبيرة جداً وصاخبة. الشوارع مليئة بالناس من كل أنحاء العالم. أحب الحافلات الحمراء ذات الطابقين والقطار تحت الأرض — يسمّونه "الأنبوب" هنا! شقتي في وسط المدينة، قريبة من حديقة هايد بارك، وهي حديقة ضخمة وجميلة. أذهب إليها كل صباح للتنزه.</p>
  <p>الطقس بارد وممطر، مختلف جداً عن بلدنا! لكن المدينة رائعة — هناك متاحف ومسارح وأسواق وحدائق في كل مكان. الأسبوع الماضي زرتُ المتحف البريطاني وقصر باكينغهام. كان ذلك رائعاً!</p>
  <p>أشتاق إليك وإلى أصدقائنا كثيراً. أتمنى أن تزوريني قريباً.</p>
  <p><strong>مع أطيب التحيات،<br/>صوفيا</strong></p>
</div>`,
  },
  {
    id: 'ar-london2-p3', type: 'lesson',
    title: 'Key Vocabulary — المفردات',
    content: `<h3>📚 Key Vocabulary — مفردات الرسالة</h3>
<table style="width:100%;border-collapse:collapse">
  <thead><tr ${TH}>
    <th style="padding:8px">العربية</th>
    <th style="padding:8px">Transliteration</th>
    <th style="padding:8px">English</th>
  </tr></thead>
  <tbody>
    <tr><td style="padding:8px;direction:rtl">شقة</td><td style="padding:8px">shaqqa</td><td style="padding:8px">flat, apartment</td></tr>
    <tr ${ROW}><td style="padding:8px;direction:rtl">أتأقلم</td><td style="padding:8px">ata'aqlam</td><td style="padding:8px">I am adapting / getting used to</td></tr>
    <tr><td style="padding:8px;direction:rtl">صاخبة</td><td style="padding:8px">sākhiba</td><td style="padding:8px">noisy, lively</td></tr>
    <tr ${ROW}><td style="padding:8px;direction:rtl">ذات الطابقين</td><td style="padding:8px">dhāt al-ṭābiqayn</td><td style="padding:8px">double-decker</td></tr>
    <tr><td style="padding:8px;direction:rtl">رائعة</td><td style="padding:8px">rā'i'a</td><td style="padding:8px">wonderful, amazing</td></tr>
    <tr ${ROW}><td style="padding:8px;direction:rtl">أشتاق إليك</td><td style="padding:8px">ashtāq ilayki</td><td style="padding:8px">I miss you</td></tr>
    <tr><td style="padding:8px;direction:rtl">مع أطيب التحيات</td><td style="padding:8px">ma'a aṭyab al-taḥiyyāt</td><td style="padding:8px">best wishes</td></tr>
  </tbody>
</table>
<h4 style="margin-top:16px">Letter Phrases — عبارات الرسائل</h4>
<table style="width:100%;border-collapse:collapse">
  <thead><tr ${TH}>
    <th style="padding:8px">Opening</th><th style="padding:8px">Closing</th>
  </tr></thead>
  <tbody>
    <tr><td style="padding:8px;direction:rtl">عزيزي / عزيزتي [الاسم]</td><td style="padding:8px;direction:rtl">مع أطيب التحيات</td></tr>
    <tr ${ROW}><td style="padding:8px;direction:rtl">كيف حالك؟</td><td style="padding:8px;direction:rtl">في انتظار ردك</td></tr>
    <tr><td style="padding:8px;direction:rtl">أتمنى أن تكون بخير</td><td style="padding:8px;direction:rtl">صديقك المخلص</td></tr>
  </tbody>
</table>`,
  },
  {
    id: 'ar-london2-p4', type: 'exercises',
    title: 'Comprehension — فهم النص',
    content: `<h3>✏️ Comprehension — فهم النص</h3>
<h4>True or False? — صح أم خطأ؟</h4>
<ol dir="rtl">
  <li>وصلت صوفيا إلى لندن منذ شهر. (صح / خطأ)</li>
  <li>شقتها قريبة من حديقة هايد بارك. (صح / خطأ)</li>
  <li>الطقس في لندن دافئ ومشمس. (صح / خطأ)</li>
  <li>زارت المتحف البريطاني الأسبوع الماضي. (صح / خطأ)</li>
</ol>
<h4>Answer the questions — أجب على الأسئلة</h4>
<ol dir="rtl">
  <li>ماذا تحب صوفيا في لندن؟</li>
  <li>ماذا زارت الأسبوع الماضي؟</li>
  <li>ما هو شعورها تجاه أصدقائها؟</li>
</ol>`,
  },
  {
    id: 'ar-london2-p5', type: 'exercises',
    title: 'Write Your Letter — اكتب رسالتك',
    content: `<h3>✏️ Write Your Own Letter — اكتب رسالتك!</h3>
<p dir="rtl">اكتب رسالة من <strong>80-100 كلمة</strong> إلى صديق عن مدينة تعيش فيها أو زرتها:</p>
<div style="background:#f0fff4;border-radius:8px;padding:16px;direction:rtl">
  <ul>
    <li>منذ متى وأنت هناك؟</li>
    <li>صِف 2-3 أشياء في المدينة</li>
    <li>ماذا زرت أو فعلت؟</li>
    <li>ما الذي تشتاق إليه؟</li>
    <li>استخدم عبارة إغلاق مناسبة</li>
  </ul>
</div>
<div style="background:#fffbe6;border-left:4px solid #f39c12;padding:10px;border-radius:4px;margin-top:12px;direction:rtl">
  💡 Start with: <em>"عزيزي / عزيزتي... كيف حالك؟ أكتب إليك من..."</em>
</div>`,
  },
];

// ════════════════════════════════════════════════════════════════════
// COURS 5 — السفر والمغامرة — Travel & Adventure (Arabic)
// ════════════════════════════════════════════════════════════════════
const TRAVEL_PAGES = [
  {
    id: 'ar-travel2-p1', type: 'intro',
    title: 'Introduction — السفر والمغامرة',
    content: `<div style="text-align:center;margin-bottom:16px">
  <span style="background:${GREEN};color:#fff;padding:6px 18px;border-radius:20px;font-size:13px;font-weight:600">✈️ Reading &amp; Speaking — القراءة والتعبير</span>
</div>
<h2 style="text-align:center;direction:rtl">السفر والمغامرة</h2>
<p style="text-align:center;color:#555">Travel &amp; Adventure — Read and Speak about Trips in Arabic</p>
<div style="background:#f0fff4;border-left:4px solid ${GREEN};border-radius:6px;padding:14px;margin:16px 0">
  <strong>🎯 Lesson Objectives</strong>
  <ul style="margin:8px 0 0 0">
    <li>Read and understand an Arabic travel text</li>
    <li>Learn travel vocabulary in Arabic with transliteration</li>
    <li>Use the past tense (الفعل الماضي) to talk about trips</li>
    <li>Express opinions about travel experiences</li>
  </ul>
</div>`,
  },
  {
    id: 'ar-travel2-p2', type: 'lesson',
    title: 'The Text — رحلتي الكبرى',
    content: `<h3>📖 Read the text — اقرأ النص</h3>
<div style="background:#f8f9fa;border:1px solid #dee2e6;border-radius:8px;padding:24px;font-family:Georgia,serif;line-height:2;direction:rtl">
  <h4>رحلتي الكبرى — بقلم جيمس</h4>
  <p>بعد إنهاء دراستي الثانوية، قررتُ أن أقوم بسنة سفر وأكتشف العالم. كان ذلك أفضل قرار في حياتي!</p>
  <p>بدأتْ رحلتي في المغرب. طرتُ من لندن إلى مراكش وقضيتُ أسبوعين أستكشف المدينة القديمة والأسواق والصحراء الجميلة. كان الناس ودودين للغاية والطعام لذيذاً جداً.</p>
  <p>من المغرب، ركبتُ العبّارة إلى إسبانيا، ثم سافرتُ بالقطار عبر فرنسا وإيطاليا. في روما، زرتُ الكولوسيوم وأكلتُ أشهى المعكرونة. وفي باريس، صعدتُ برج إيفل عند الغروب — كان المنظر خلّاباً!</p>
  <p>الجزء المفضل لديّ كان المغرب. الألوان، والروائح، والموسيقى... كل شيء كان ساحراً. بِتُّ في رياض تقليدي وركبتُ الجمل في صحراء الساحل!</p>
  <p>علّمني السفر الاستقلالية والانفتاح والامتنان. التقيتُ بأشخاص من كل أنحاء العالم وتعلمتُ شيئاً جديداً كل يوم. أوصي بهذه التجربة للجميع!</p>
</div>`,
  },
  {
    id: 'ar-travel2-p3', type: 'lesson',
    title: 'Travel Vocabulary — مفردات السفر',
    content: `<h3>📚 Travel Vocabulary — مفردات السفر</h3>
<table style="width:100%;border-collapse:collapse">
  <thead><tr ${TH}>
    <th style="padding:8px">العربية</th>
    <th style="padding:8px">Transliteration</th>
    <th style="padding:8px">English</th>
  </tr></thead>
  <tbody>
    <tr><td style="padding:8px;direction:rtl">سنة سفر</td><td style="padding:8px">sanat safar</td><td style="padding:8px">gap year</td></tr>
    <tr ${ROW}><td style="padding:8px;direction:rtl">رحلة</td><td style="padding:8px">riḥla</td><td style="padding:8px">journey, trip</td></tr>
    <tr><td style="padding:8px;direction:rtl">يستكشف</td><td style="padding:8px">yastakshif</td><td style="padding:8px">to explore</td></tr>
    <tr ${ROW}><td style="padding:8px;direction:rtl">عبّارة</td><td style="padding:8px">'abbāra</td><td style="padding:8px">ferry</td></tr>
    <tr><td style="padding:8px;direction:rtl">خلّاب</td><td style="padding:8px">khallāb</td><td style="padding:8px">breathtaking</td></tr>
    <tr ${ROW}><td style="padding:8px;direction:rtl">رياض</td><td style="padding:8px">riyāḍ</td><td style="padding:8px">riad (traditional house)</td></tr>
    <tr><td style="padding:8px;direction:rtl">الاستقلالية</td><td style="padding:8px">al-istiqlāliyya</td><td style="padding:8px">independence</td></tr>
    <tr ${ROW}><td style="padding:8px;direction:rtl">الامتنان</td><td style="padding:8px">al-imtinān</td><td style="padding:8px">gratitude</td></tr>
    <tr><td style="padding:8px;direction:rtl">أوصي</td><td style="padding:8px">awṣī</td><td style="padding:8px">I recommend</td></tr>
  </tbody>
</table>
<h4 style="margin-top:16px">Past Tense — الفعل الماضي</h4>
<div style="display:flex;flex-wrap:wrap;gap:8px;direction:rtl;margin-top:8px">
  <span style="background:#f0fff4;border:1px solid ${GREEN};border-radius:4px;padding:4px 10px;font-size:13px">طار ← يطير (flew)</span>
  <span style="background:#f0fff4;border:1px solid ${GREEN};border-radius:4px;padding:4px 10px;font-size:13px">قضى ← يقضي (spent)</span>
  <span style="background:#f0fff4;border:1px solid ${GREEN};border-radius:4px;padding:4px 10px;font-size:13px">ركب ← يركب (rode/took)</span>
  <span style="background:#f0fff4;border:1px solid ${GREEN};border-radius:4px;padding:4px 10px;font-size:13px">زار ← يزور (visited)</span>
  <span style="background:#f0fff4;border:1px solid ${GREEN};border-radius:4px;padding:4px 10px;font-size:13px">بات ← يبيت (stayed)</span>
  <span style="background:#f0fff4;border:1px solid ${GREEN};border-radius:4px;padding:4px 10px;font-size:13px">التقى ← يلتقي (met)</span>
</div>`,
  },
  {
    id: 'ar-travel2-p4', type: 'exercises',
    title: 'Comprehension — فهم النص',
    content: `<h3>✏️ Comprehension — فهم النص</h3>
<h4>Answer the questions — أجب على الأسئلة</h4>
<ol dir="rtl">
  <li>أين بدأت رحلة جيمس؟</li>
  <li>كيف سافر من المغرب إلى إسبانيا؟</li>
  <li>ما هو الجزء المفضل لديه في الرحلة؟ ولماذا؟</li>
  <li>ماذا فعل في المغرب؟ (شيئان)</li>
  <li>ماذا علّمه السفر؟</li>
</ol>
<h4>True or False? — صح أم خطأ؟</h4>
<ol dir="rtl">
  <li>سافر جيمس من لندن إلى المغرب بالقطار. (صح / خطأ)</li>
  <li>وجهته المفضلة كانت إيطاليا. (صح / خطأ)</li>
  <li>بات في رياض تقليدي. (صح / خطأ)</li>
</ol>`,
  },
  {
    id: 'ar-travel2-p5', type: 'exercises',
    title: 'Write Your Trip — اكتب عن رحلتك',
    content: `<h3>✏️ Write About Your Trip — اكتب عن رحلتك!</h3>
<p dir="rtl">اكتب فقرة من <strong>80-100 كلمة</strong> عن رحلة حقيقية أو خيالية:</p>
<div style="background:#f0fff4;border-radius:8px;padding:16px;direction:rtl">
  <ul>
    <li>إلى أين ذهبت؟</li>
    <li>كيف سافرت؟</li>
    <li>ماذا رأيت وفعلت؟</li>
    <li>ما الذي أثّر فيك أكثر؟</li>
    <li>هل توصي بهذه الوجهة؟</li>
  </ul>
</div>
<div style="background:#fffbe6;border-left:4px solid #f39c12;padding:10px;border-radius:4px;margin-top:12px;direction:rtl">
  💡 Use the past tense: ذهبتُ، رأيتُ، أكلتُ، زرتُ، ركبتُ...<br/>
  <em>Example: "في الصيف الماضي، ذهبتُ إلى... زرتُ... كان الطعام..."</em>
</div>`,
  },
];

// ════════════════════════════════════════════════════════════════════
// Mapping ID → pages
// ════════════════════════════════════════════════════════════════════
const UPDATES = [
  { id: 'iuyveu92etv94kv', titre: 'التعبير عن الزمن — Expressing Time in Arabic',   pages: TIME_PAGES   },
  { id: 'aku0a8wjay4utz2', titre: 'التعبير عن المكان — Expressing Place in Arabic',  pages: PLACE_PAGES  },
  { id: '1p9p91k66uel0e0', titre: 'حروف الجر — Arabic Prepositions (A1–A2)',          pages: PREP_PAGES   },
  { id: 'aqycq8mzh66j0zy', titre: 'رسالة من لندن — A Letter from London (Arabic)',    pages: LONDON_PAGES },
  { id: 'znc5ppvxq8t5rkm', titre: 'السفر والمغامرة — Travel & Adventure (Arabic)',    pages: TRAVEL_PAGES },
];

// ════════════════════════════════════════════════════════════════════
async function main() {
  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);

  console.log('🔐 Authenticating...');
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log('✅ Authenticated\n');
  console.log('🔄 Updating Arabic courses — replacing French with English...\n');

  for (const { id, titre, pages } of UPDATES) {
    try {
      const pagesJson = JSON.stringify(pages);
      await pb.collection('courses').update(id, { pages: pagesJson });
      console.log(`  ✅ Updated: "${titre}" (${pages.length} pages, ${pagesJson.length} chars)`);
    } catch (err) {
      const detail = err?.data ? JSON.stringify(err.data) : err.message;
      console.error(`  ❌ Error on "${titre}": ${detail}`);
    }
  }

  console.log('\n════════════════════════════════════════════');
  console.log('✅ All Arabic courses updated — English translations applied!');
  console.log('════════════════════════════════════════════');
}

main().catch(err => {
  console.error('Fatal:', err?.data ? JSON.stringify(err.data) : err.message);
  process.exit(1);
});
