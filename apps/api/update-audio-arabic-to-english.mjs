/**
 * update-audio-arabic-to-english.mjs
 * ════════════════════════════════════════════════════════════
 * Remplace TOUT le texte français dans les cours audio arabes
 * par de l'anglais (instructions, tableaux, exercices, bilans).
 *
 * Usage :  cd apps/api && node update-audio-arabic-to-english.mjs
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
// MODULE 1 — Alphabet
// ════════════════════════════════════════════════════════════
const M1_PAGES = [
  {
    id: 'ar-m1-p1', type: 'intro',
    title: 'Introduction',
    content: `<h2>Module 1 — The Arabic Alphabet (الحروف العربية)</h2>
<p>Welcome to the A1 Arabic course! In this first module, you will:</p>
<ul>
  <li>Discover the 28 letters of the Arabic alphabet</li>
  <li>Learn the writing direction: <strong>right to left (←)</strong></li>
  <li>Understand the initial, medial, final and isolated forms of each letter</li>
  <li>Discover short vowels (harakat): fatha, kasra, damma</li>
</ul>
<p>⚠️ Arabic is written and read from right to left. Take time to get used to it!</p>`,
  },
  {
    id: 'ar-m1-p2', type: 'audio',
    title: 'Listening — The Alphabet (الأبجدية)',
  },
  {
    id: 'ar-m1-p3', type: 'vocabulary',
    title: 'Short Vowels — الحركات',
    content: `<h3>📚 Short Vowels (الحركات)</h3>
<p>In Arabic, short vowels are diacritical marks placed above or below letters:</p>
<table><thead><tr><th>Sign</th><th>Name</th><th>Sound</th><th>Example</th></tr></thead>
<tbody>
<tr><td style="font-size:1.5em;direction:rtl">َ</td><td>Fatha</td><td>/a/</td><td dir="rtl">كَتَبَ</td></tr>
<tr><td style="font-size:1.5em;direction:rtl">ِ</td><td>Kasra</td><td>/i/</td><td dir="rtl">كِتَاب</td></tr>
<tr><td style="font-size:1.5em;direction:rtl">ُ</td><td>Damma</td><td>/u/</td><td dir="rtl">كُتُب</td></tr>
<tr><td style="font-size:1.5em;direction:rtl">ْ</td><td>Sukun</td><td>(no vowel)</td><td dir="rtl">كَلْب</td></tr>
</tbody></table>
<p>💡 In everyday texts, vowels are often not written. You learn them through practice.</p>`,
  },
  {
    id: 'ar-m1-p4', type: 'grammar',
    title: 'Grammar — Letter Forms',
    content: `<h3>📖 The 4 Forms of Each Letter</h3>
<p>In Arabic, each letter can take 4 forms depending on its position in the word:</p>
<table><thead><tr><th>Letter</th><th>Isolated</th><th>Initial</th><th>Medial</th><th>Final</th></tr></thead>
<tbody>
<tr><td>Baa (ب)</td><td dir="rtl" style="font-size:1.3em">ب</td><td dir="rtl" style="font-size:1.3em">بـ</td><td dir="rtl" style="font-size:1.3em">ـبـ</td><td dir="rtl" style="font-size:1.3em">ـب</td></tr>
<tr><td>Miim (م)</td><td dir="rtl" style="font-size:1.3em">م</td><td dir="rtl" style="font-size:1.3em">مـ</td><td dir="rtl" style="font-size:1.3em">ـمـ</td><td dir="rtl" style="font-size:1.3em">ـم</td></tr>
<tr><td>Nuun (ن)</td><td dir="rtl" style="font-size:1.3em">ن</td><td dir="rtl" style="font-size:1.3em">نـ</td><td dir="rtl" style="font-size:1.3em">ـنـ</td><td dir="rtl" style="font-size:1.3em">ـن</td></tr>
</tbody></table>
<p>⚠️ Some letters (like dal د and ra ر) only connect on the left — they have no initial/medial joined form.</p>`,
  },
  {
    id: 'ar-m1-p5', type: 'exercises',
    title: 'Exercises — Module 1',
    content: `<h3>✏️ Exercises</h3>
<h4>Exercise 1 — Identify the letters</h4>
<p>Write the name of each letter:</p>
<p dir="rtl" style="font-size:1.5em">ب &nbsp; س &nbsp; م &nbsp; ن &nbsp; ر &nbsp; ع</p>
<h4>Exercise 2 — Read these words</h4>
<p dir="rtl" style="font-size:1.3em">بَاب &nbsp;·&nbsp; سَمَك &nbsp;·&nbsp; نَار &nbsp;·&nbsp; مَاء</p>
<p>(Hint: بَاب = door, سَمَك = fish, نَار = fire, مَاء = water)</p>
<h4>Exercise 3 — Write</h4>
<p>Try writing your first name in Arabic letters!</p>`,
  },
  {
    id: 'ar-m1-p6', type: 'bilan',
    title: 'Summary — Module 1',
    content: `<h3>✅ Module 1 Summary</h3>
<ul>
  <li>✅ The 28 letters of the Arabic alphabet</li>
  <li>✅ Writing direction: right to left</li>
  <li>✅ The 3 short vowels: fatha (a), kasra (i), damma (u)</li>
  <li>✅ The 4 letter forms depending on position</li>
</ul>
<p><strong>Next module:</strong> Greetings and introductions in Arabic 👋</p>`,
  },
];

// ════════════════════════════════════════════════════════════
// MODULE 2 — Greetings
// ════════════════════════════════════════════════════════════
const M2_PAGES = [
  {
    id: 'ar-m2-p1', type: 'intro',
    title: 'Introduction',
    content: `<h2>Module 2 — Greetings in Arabic (التحيات والتعارف)</h2>
<ul>
  <li>Say hello, good evening, goodbye in Arabic</li>
  <li>Introduce yourself: name, nationality, age</li>
  <li>Islamic politeness expressions</li>
  <li>Personal pronouns: أَنَا / أَنْتَ / هُوَ / هِيَ</li>
</ul>`,
  },
  {
    id: 'ar-m2-p2', type: 'audio',
    title: 'Dialogue — مرحباً !',
  },
  {
    id: 'ar-m2-p3', type: 'vocabulary',
    title: 'Vocabulary — Greetings',
    content: `<h3>📚 Greetings and Politeness Expressions</h3>
<table><thead><tr><th>Arabic</th><th>Transliteration</th><th>English</th></tr></thead>
<tbody>
<tr><td dir="rtl">صَبَاحُ الخَيْر</td><td>Sabah al-khayr</td><td>Good morning</td></tr>
<tr><td dir="rtl">صَبَاحُ النُّور</td><td>Sabah an-nur</td><td>Good morning (reply)</td></tr>
<tr><td dir="rtl">مَسَاءُ الخَيْر</td><td>Masa' al-khayr</td><td>Good evening</td></tr>
<tr><td dir="rtl">مَعَ السَّلَامَة</td><td>Ma'a s-salama</td><td>Goodbye</td></tr>
<tr><td dir="rtl">شُكْراً</td><td>Shukran</td><td>Thank you</td></tr>
<tr><td dir="rtl">عَفْواً</td><td>Afwan</td><td>You're welcome / Excuse me</td></tr>
<tr><td dir="rtl">مِنْ فَضْلِكَ</td><td>Min fadlak</td><td>Please (masc.)</td></tr>
<tr><td dir="rtl">نَعَم / لَا</td><td>Na'am / Laa</td><td>Yes / No</td></tr>
</tbody></table>`,
  },
  {
    id: 'ar-m2-p4', type: 'grammar',
    title: 'Grammar — Pronouns and Nominal Sentences',
    content: `<h3>📖 Personal Pronouns</h3>
<table><thead><tr><th>Arabic</th><th>Transliteration</th><th>English</th></tr></thead>
<tbody>
<tr><td dir="rtl">أَنَا</td><td>Ana</td><td>I / Me</td></tr>
<tr><td dir="rtl">أَنْتَ</td><td>Anta</td><td>You (masc.)</td></tr>
<tr><td dir="rtl">أَنْتِ</td><td>Anti</td><td>You (fem.)</td></tr>
<tr><td dir="rtl">هُوَ</td><td>Huwa</td><td>He / Him</td></tr>
<tr><td dir="rtl">هِيَ</td><td>Hiya</td><td>She / Her</td></tr>
<tr><td dir="rtl">نَحْنُ</td><td>Nahnu</td><td>We</td></tr>
</tbody></table>
<h4>The Nominal Sentence (no verb "to be")</h4>
<p>In Arabic, the verb "to be" is not used in the present tense!</p>
<p dir="rtl">أَنَا طَالِب = I am a student (lit. "Me student")</p>
<p dir="rtl">هِيَ مُدَرِّسَة = She is a teacher</p>`,
  },
  {
    id: 'ar-m2-p5', type: 'exercises',
    title: 'Exercises — Module 2',
    content: `<h3>✏️ Exercises</h3>
<h4>Exercise 1 — Complete the dialogue</h4>
<p>Fill in the blanks with the right words:</p>
<p dir="rtl">أ: السَّلَامُ عَلَيْكُمْ!<br/>ب: _______ السَّلَام!<br/>أ: كَيْفَ _______؟<br/>ب: _______, شُكْراً.</p>
<h4>Exercise 2 — Translate into Arabic</h4>
<ol>
  <li>My name is Yasmine.</li>
  <li>Good morning! How are you?</li>
  <li>Thank you, goodbye.</li>
</ol>
<h4>Exercise 3 — Introduce yourself</h4>
<p>Write 3 sentences to introduce yourself in Arabic (name + nationality + situation).</p>`,
  },
  {
    id: 'ar-m2-p6', type: 'bilan',
    title: 'Summary — Module 2',
    content: `<h3>✅ Module 2 Summary</h3>
<ul>
  <li>✅ Greetings: السلام عليكم, صباح الخير, مساء الخير…</li>
  <li>✅ Introducing yourself: اسمي… / أنا من…</li>
  <li>✅ Personal pronouns: أنا / أنتَ / أنتِ / هو / هي</li>
  <li>✅ The nominal sentence in Arabic (no verb "to be")</li>
</ul>
<p><strong>Next module:</strong> The family 👨‍👩‍👧</p>`,
  },
];

// ════════════════════════════════════════════════════════════
// MODULE 3 — Family
// ════════════════════════════════════════════════════════════
const M3_PAGES = [
  {
    id: 'ar-m3-p1', type: 'intro',
    title: 'Introduction',
    content: `<h2>Module 3 — The Family in Arabic (الأسرة)</h2>
<ul>
  <li>Name family members in Arabic</li>
  <li>Talk about your family</li>
  <li>Gender (masculine/feminine) in Arabic</li>
  <li>Possessive suffixes: -ي / -كَ / -هُ / -هَا</li>
</ul>`,
  },
  {
    id: 'ar-m3-p2', type: 'audio',
    title: 'Dialogue — عَائِلَتِي',
  },
  {
    id: 'ar-m3-p3', type: 'vocabulary',
    title: 'Vocabulary — The Family',
    content: `<h3>📚 أفراد الأسرة (Family Members)</h3>
<table><thead><tr><th>Arabic</th><th>Transliteration</th><th>English</th></tr></thead>
<tbody>
<tr><td dir="rtl">أَب / أَبُو</td><td>Ab / Abu</td><td>father / dad</td></tr>
<tr><td dir="rtl">أُم / مَامَا</td><td>Umm / Mama</td><td>mother / mum</td></tr>
<tr><td dir="rtl">أَخ</td><td>Akh</td><td>brother</td></tr>
<tr><td dir="rtl">أُخْت</td><td>Ukht</td><td>sister</td></tr>
<tr><td dir="rtl">جَدّ</td><td>Jadd</td><td>grandfather</td></tr>
<tr><td dir="rtl">جَدَّة</td><td>Jadda</td><td>grandmother</td></tr>
<tr><td dir="rtl">عَم</td><td>Amm</td><td>paternal uncle</td></tr>
<tr><td dir="rtl">عَمَّة</td><td>Amma</td><td>paternal aunt</td></tr>
<tr><td dir="rtl">خَال</td><td>Khal</td><td>maternal uncle</td></tr>
<tr><td dir="rtl">ابْن</td><td>Ibn</td><td>son</td></tr>
<tr><td dir="rtl">بِنْت</td><td>Bint</td><td>daughter</td></tr>
</tbody></table>`,
  },
  {
    id: 'ar-m3-p4', type: 'grammar',
    title: 'Grammar — Gender in Arabic',
    content: `<h3>📖 Gender in Arabic (المذكر والمؤنث)</h3>
<p>In Arabic, all nouns are either <strong>masculine (مذكر)</strong> or <strong>feminine (مؤنث)</strong>.</p>
<p>The feminine is often formed by adding <strong>ة (ta marbuta)</strong> at the end:</p>
<table><thead><tr><th>Masculine</th><th>Feminine</th><th>Meaning</th></tr></thead>
<tbody>
<tr><td dir="rtl">طَالِب</td><td dir="rtl">طَالِبَة</td><td>student (m/f)</td></tr>
<tr><td dir="rtl">مُدَرِّس</td><td dir="rtl">مُدَرِّسَة</td><td>teacher (m/f)</td></tr>
<tr><td dir="rtl">مَرِيض</td><td dir="rtl">مَرِيضَة</td><td>sick (m/f)</td></tr>
</tbody></table>
<h4>Possessive Suffixes</h4>
<table><thead><tr><th>Person</th><th>Suffix</th><th>Example</th><th>Translation</th></tr></thead>
<tbody>
<tr><td>My</td><td dir="rtl">-ي</td><td dir="rtl">أَبِي</td><td>my father</td></tr>
<tr><td>Your (m)</td><td dir="rtl">-كَ</td><td dir="rtl">أَبُوكَ</td><td>your father (m)</td></tr>
<tr><td>His</td><td dir="rtl">-هُ</td><td dir="rtl">أَبُوهُ</td><td>his father</td></tr>
<tr><td>Her</td><td dir="rtl">-هَا</td><td dir="rtl">أَبُوهَا</td><td>her father</td></tr>
</tbody></table>`,
  },
  {
    id: 'ar-m3-p5', type: 'exercises',
    title: 'Exercises — Module 3',
    content: `<h3>✏️ Exercises</h3>
<h4>Exercise 1 — Masculine or Feminine?</h4>
<p>Give the feminine form:</p>
<p dir="rtl">طَالِب ← _______ &nbsp;|&nbsp; مُدَرِّس ← _______ &nbsp;|&nbsp; مَرِيض ← _______</p>
<h4>Exercise 2 — Complete with the right suffix</h4>
<ol>
<li dir="rtl">هَذَا أَب___ . (my father)</li>
<li dir="rtl">هَذِهِ أُم___ . (your mother, masc.)</li>
<li dir="rtl">اسم___ كَرِيم. (his name)</li>
</ol>
<h4>Exercise 3 — Introduce your family</h4>
<p>Write 4 sentences to introduce your family in Arabic.</p>`,
  },
  {
    id: 'ar-m3-p6', type: 'bilan',
    title: 'Summary — Module 3',
    content: `<h3>✅ Module 3 Summary</h3>
<ul>
  <li>✅ Family vocabulary in Arabic</li>
  <li>✅ Masculine/feminine distinction (-ة ta marbuta)</li>
  <li>✅ Possessive suffixes: -ي / -كَ / -هُ / -هَا</li>
</ul>
<p><strong>Next module:</strong> Numbers and colours 🔢</p>`,
  },
];

// ════════════════════════════════════════════════════════════
// MODULE 4 — Numbers & Colours
// ════════════════════════════════════════════════════════════
const M4_PAGES = [
  {
    id: 'ar-m4-p1', type: 'intro',
    title: 'Introduction',
    content: `<h2>Module 4 — Numbers and Colours (الأرقام والألوان)</h2>
<ul>
  <li>Count from 1 to 100 in Arabic</li>
  <li>Say your age</li>
  <li>Colours in Arabic and their agreement</li>
  <li>Describe objects: colour, size</li>
</ul>`,
  },
  {
    id: 'ar-m4-p2', type: 'audio',
    title: 'Listening — Numbers',
  },
  {
    id: 'ar-m4-p3', type: 'vocabulary',
    title: 'Vocabulary — Colours',
    content: `<h3>📚 الألوان (Colours)</h3>
<table><thead><tr><th>Masculine</th><th>Feminine</th><th>Transliteration</th><th>English</th></tr></thead>
<tbody>
<tr><td dir="rtl">أَحْمَر</td><td dir="rtl">حَمْرَاء</td><td>ahmar / hamra</td><td>red</td></tr>
<tr><td dir="rtl">أَزْرَق</td><td dir="rtl">زَرْقَاء</td><td>azraq / zarqa</td><td>blue</td></tr>
<tr><td dir="rtl">أَخْضَر</td><td dir="rtl">خَضْرَاء</td><td>akhdar / khadra</td><td>green</td></tr>
<tr><td dir="rtl">أَصْفَر</td><td dir="rtl">صَفْرَاء</td><td>asfar / safra</td><td>yellow</td></tr>
<tr><td dir="rtl">أَبْيَض</td><td dir="rtl">بَيْضَاء</td><td>abyad / bayda</td><td>white</td></tr>
<tr><td dir="rtl">أَسْوَد</td><td dir="rtl">سَوْدَاء</td><td>aswad / sawda</td><td>black</td></tr>
<tr><td dir="rtl">بُرْتُقَالِي</td><td dir="rtl">بُرْتُقَالِيَّة</td><td>burtuqali</td><td>orange</td></tr>
</tbody></table>`,
  },
  {
    id: 'ar-m4-p4', type: 'grammar',
    title: 'Grammar — Adjective Agreement',
    content: `<h3>📖 Colour Adjective Agreement</h3>
<p>In Arabic, the adjective follows the noun and agrees in gender:</p>
<p dir="rtl">كِتَاب أَحْمَر = a red book (masc.)</p>
<p dir="rtl">سَيَّارَة حَمْرَاء = a red car (fem.)</p>
<h4>Saying your age:</h4>
<p dir="rtl">عُمْرِي خَمْسَ عَشَرَة سَنَة = I am fifteen years old (lit. "My age is fifteen years")</p>
<p dir="rtl">كَمْ عُمْرُكَ؟ = How old are you? (masc.)</p>
<p dir="rtl">كَمْ عُمْرُكِ؟ = How old are you? (fem.)</p>`,
  },
  {
    id: 'ar-m4-p5', type: 'exercises',
    title: 'Exercises — Module 4',
    content: `<h3>✏️ Exercises</h3>
<h4>Exercise 1 — Write in Arabic numerals</h4>
<p>7 · 14 · 25 · 50 · 100</p>
<h4>Exercise 2 — Agree the colour</h4>
<ol>
<li dir="rtl">قَلَم ___ (red — masc.)</li>
<li dir="rtl">سَيَّارَة ___ (blue — fem.)</li>
<li dir="rtl">كِتَاب ___ (green — masc.)</li>
</ol>
<h4>Exercise 3 — Say your age in Arabic</h4>
<p>Write the complete sentence in Arabic.</p>`,
  },
  {
    id: 'ar-m4-p6', type: 'bilan',
    title: 'Summary — Module 4',
    content: `<h3>✅ Module 4 Summary</h3>
<ul>
  <li>✅ Numbers from 1 to 100</li>
  <li>✅ Colours and their masculine/feminine agreement</li>
  <li>✅ Expressing age: عُمْرِي… سَنَة</li>
</ul>
<p><strong>Next module:</strong> Food and meals 🍽️</p>`,
  },
];

// ════════════════════════════════════════════════════════════
// MODULE 5 — Food & Meals
// ════════════════════════════════════════════════════════════
const M5_PAGES = [
  {
    id: 'ar-m5-p1', type: 'intro',
    title: 'Introduction',
    content: `<h2>Module 5 — Food and Meals (الطعام والوجبات)</h2>
<ul>
  <li>Name common foods in Arabic</li>
  <li>Order at a restaurant</li>
  <li>Express preferences: أُحِب / لا أُحِب</li>
  <li>The verb أَرَادَ (to want) in the present tense</li>
</ul>`,
  },
  {
    id: 'ar-m5-p2', type: 'audio',
    title: 'Dialogue — في المطعم',
  },
  {
    id: 'ar-m5-p3', type: 'vocabulary',
    title: 'Vocabulary — Food',
    content: `<h3>📚 الطعام والشراب (Food and Drink)</h3>
<table><thead><tr><th>Arabic</th><th>Transliteration</th><th>English</th></tr></thead>
<tbody>
<tr><td dir="rtl">خُبْز</td><td>khubz</td><td>bread</td></tr>
<tr><td dir="rtl">أَرُز</td><td>aruzz</td><td>rice</td></tr>
<tr><td dir="rtl">لَحْم</td><td>lahm</td><td>meat</td></tr>
<tr><td dir="rtl">دَجَاج</td><td>dajaj</td><td>chicken</td></tr>
<tr><td dir="rtl">سَمَك</td><td>samak</td><td>fish</td></tr>
<tr><td dir="rtl">خُضَار</td><td>khudar</td><td>vegetables</td></tr>
<tr><td dir="rtl">فَاكِهَة</td><td>fakiha</td><td>fruit(s)</td></tr>
<tr><td dir="rtl">مَاء</td><td>ma'</td><td>water</td></tr>
<tr><td dir="rtl">عَصِير</td><td>asir</td><td>juice</td></tr>
<tr><td dir="rtl">شَاي</td><td>shay</td><td>tea</td></tr>
<tr><td dir="rtl">قَهْوَة</td><td>qahwa</td><td>coffee</td></tr>
</tbody></table>`,
  },
  {
    id: 'ar-m5-p4', type: 'grammar',
    title: 'Grammar — The Verb يُرِيد (to want)',
    content: `<h3>📖 The Verb يُرِيد (to want) — Present Tense</h3>
<table><thead><tr><th>Pronoun</th><th>Form</th><th>Translation</th></tr></thead>
<tbody>
<tr><td dir="rtl">أَنَا</td><td dir="rtl">أُرِيد</td><td>I want</td></tr>
<tr><td dir="rtl">أَنْتَ</td><td dir="rtl">تُرِيد</td><td>You want (masc.)</td></tr>
<tr><td dir="rtl">أَنْتِ</td><td dir="rtl">تُرِيدِين</td><td>You want (fem.)</td></tr>
<tr><td dir="rtl">هُوَ</td><td dir="rtl">يُرِيد</td><td>He wants</td></tr>
<tr><td dir="rtl">هِيَ</td><td dir="rtl">تُرِيد</td><td>She wants</td></tr>
</tbody></table>
<h4>Expressing preferences</h4>
<p dir="rtl">أُحِبُّ الشَّاي = I like tea</p>
<p dir="rtl">لَا أُحِبُّ اللَّحْم = I don't like meat</p>`,
  },
  {
    id: 'ar-m5-p5', type: 'exercises',
    title: 'Exercises — Module 5',
    content: `<h3>✏️ Exercises</h3>
<h4>Conjugate يُرِيد</h4>
<ol>
<li>We want some bread.</li>
<li>She wants orange juice.</li>
<li>They want fish.</li>
</ol>
<h4>Translate into Arabic</h4>
<ol>
<li>I want a tea, please.</li>
<li>I like couscous.</li>
<li>The bill, please.</li>
</ol>`,
  },
  {
    id: 'ar-m5-p6', type: 'bilan',
    title: 'Summary — Module 5',
    content: `<h3>✅ Module 5 Summary</h3>
<ul>
  <li>✅ Food vocabulary in Arabic</li>
  <li>✅ Ordering at a restaurant</li>
  <li>✅ The verb يُرِيد (to want)</li>
  <li>✅ Expressing preferences: أُحِب / لا أُحِب</li>
</ul>
<p><strong>Next module:</strong> The city and transport 🏙️</p>`,
  },
];

// ════════════════════════════════════════════════════════════
// MODULE 6 — City & Transport
// ════════════════════════════════════════════════════════════
const M6_PAGES = [
  {
    id: 'ar-m6-p1', type: 'intro',
    title: 'Introduction',
    content: `<h2>Module 6 — The City and Transport (المدينة والنقل)</h2>
<ul>
  <li>Name places in the city in Arabic</li>
  <li>Ask for and give directions</li>
  <li>Means of transport</li>
  <li>Place prepositions: في / على / أَمَام / خَلْف / بِجَانِب</li>
</ul>`,
  },
  {
    id: 'ar-m6-p2', type: 'audio',
    title: 'Dialogue — أَيْنَ المَحَطَّة؟',
  },
  {
    id: 'ar-m6-p3', type: 'vocabulary',
    title: 'Vocabulary — The City',
    content: `<h3>📚 المدينة (The City)</h3>
<table><thead><tr><th>Arabic</th><th>Transliteration</th><th>English</th></tr></thead>
<tbody>
<tr><td dir="rtl">مَحَطَّة الحَافِلَة</td><td>mahattat al-hafila</td><td>bus stop</td></tr>
<tr><td dir="rtl">مَحَطَّة القِطَار</td><td>mahattat al-qitar</td><td>train station</td></tr>
<tr><td dir="rtl">مَسْجِد</td><td>masjid</td><td>mosque</td></tr>
<tr><td dir="rtl">مَدْرَسَة</td><td>madrasa</td><td>school</td></tr>
<tr><td dir="rtl">مَسْتَشْفَى</td><td>mustashfa</td><td>hospital</td></tr>
<tr><td dir="rtl">صَيْدَلِيَّة</td><td>saydaliyya</td><td>pharmacy</td></tr>
<tr><td dir="rtl">سُوق</td><td>suq</td><td>market / souk</td></tr>
<tr><td dir="rtl">بَنْك</td><td>bank</td><td>bank</td></tr>
<tr><td dir="rtl">حَدِيقَة</td><td>hadiqa</td><td>garden / park</td></tr>
</tbody></table>`,
  },
  {
    id: 'ar-m6-p4', type: 'grammar',
    title: 'Grammar — Place Prepositions',
    content: `<h3>📖 حُرُوف الجَرّ المَكَانِيَّة (Place Prepositions)</h3>
<table><thead><tr><th>Arabic</th><th>Transliteration</th><th>English</th></tr></thead>
<tbody>
<tr><td dir="rtl">فِي</td><td>fi</td><td>in / inside</td></tr>
<tr><td dir="rtl">عَلَى</td><td>'ala</td><td>on / above</td></tr>
<tr><td dir="rtl">أَمَامَ</td><td>amama</td><td>in front of</td></tr>
<tr><td dir="rtl">خَلْفَ</td><td>khalfa</td><td>behind</td></tr>
<tr><td dir="rtl">بِجَانِبِ</td><td>bijanibi</td><td>next to</td></tr>
<tr><td dir="rtl">بَيْنَ</td><td>bayna</td><td>between</td></tr>
<tr><td dir="rtl">قُرْبَ</td><td>qurba</td><td>near / close to</td></tr>
<tr><td dir="rtl">بَعِيداً عَن</td><td>ba'idan 'an</td><td>far from</td></tr>
</tbody></table>`,
  },
  {
    id: 'ar-m6-p5', type: 'exercises',
    title: 'Exercises — Module 6',
    content: `<h3>✏️ Exercises</h3>
<h4>Complete with the right preposition</h4>
<ol>
<li dir="rtl">الصَّيْدَلِيَّة ___ المَدْرَسَة. (in front of)</li>
<li dir="rtl">البَنْك ___ السُّوق. (next to)</li>
<li dir="rtl">الكِتَاب ___ الطَّاوِلَة. (on)</li>
</ol>
<h4>Translate into Arabic</h4>
<ol>
<li>Where is the mosque?</li>
<li>The hospital is behind the school.</li>
<li>Go straight ahead, then turn left.</li>
</ol>`,
  },
  {
    id: 'ar-m6-p6', type: 'bilan',
    title: 'Summary — Module 6',
    content: `<h3>✅ Module 6 Summary</h3>
<ul>
  <li>✅ City places: مدرسة، مسجد، مستشفى، بنك…</li>
  <li>✅ Prepositions: في، أمام، خلف، بجانب، بين…</li>
  <li>✅ Asking and giving directions in Arabic</li>
</ul>
<p><strong>Next:</strong> Final assessment ✅</p>`,
  },
];

// ════════════════════════════════════════════════════════════
// MODULE 7 — Final Assessment
// ════════════════════════════════════════════════════════════
const M7_PAGES = [
  {
    id: 'ar-m7-p1', type: 'intro',
    title: 'Introduction — A1 Arabic Final Review',
    content: `<h2>Module 7 — Final Review and Assessment (المراجعة والتقييم)</h2>
<p>Congratulations on completing all 6 modules! This final module lets you:</p>
<ul>
  <li>Review the Arabic alphabet and phonetics</li>
  <li>Revise all A1 vocabulary</li>
  <li>Test your listening comprehension</li>
  <li>Self-assess your A1 level in Arabic</li>
</ul>`,
  },
  {
    id: 'ar-m7-p2', type: 'audio',
    title: 'Listening Test 1',
  },
  {
    id: 'ar-m7-p3', type: 'audio',
    title: 'Listening Test 2',
  },
  {
    id: 'ar-m7-p4', type: 'exercises',
    title: 'General Revision',
    content: `<h3>✏️ Complete Revision</h3>
<h4>1. Alphabet</h4>
<p dir="rtl" style="font-size:1.3em">اكتب هذه الكلمات : بَاب &nbsp;·&nbsp; كِتَاب &nbsp;·&nbsp; مَاء &nbsp;·&nbsp; سَمَك</p>
<h4>2. Greetings</h4>
<p>Write in Arabic: Good morning — Thank you — Goodbye</p>
<h4>3. The Family</h4>
<p>Name 5 family members in Arabic with their transliteration.</p>
<h4>4. Numbers</h4>
<p dir="rtl">اكتب بالأرقام العربية : 15 · 27 · 43 · 60 · 100</p>
<h4>5. Prepositions</h4>
<p>Complete: The bank is ___ (next to) the school.</p>`,
  },
  {
    id: 'ar-m7-p5', type: 'exercises',
    title: 'Production — Self-introduction in Arabic',
    content: `<h3>✏️ Final Written Production</h3>
<h4>Write a short self-introduction in Arabic (6–8 sentences):</h4>
<ul>
<li>Your name and origin</li>
<li>Your age</li>
<li>Your family</li>
<li>Your food preferences</li>
<li>A place you like in your city</li>
</ul>`,
  },
  {
    id: 'ar-m7-p6', type: 'bilan',
    title: 'Final Self-assessment — A1 Arabic',
    content: `<h3>🎓 A1 Self-assessment — Arabic</h3>
<p>I can:</p>
<ul>
<li>☐ Read and write the 28 letters of the Arabic alphabet</li>
<li>☐ Greet and introduce myself in Arabic</li>
<li>☐ Talk about my family</li>
<li>☐ Count from 1 to 100 and say my age</li>
<li>☐ Name foods and order at a restaurant</li>
<li>☐ Navigate the city and ask for directions</li>
<li>☐ Use place prepositions in Arabic</li>
</ul>
<p><strong>🎉 Congratulations! You have completed A1 Arabic!</strong></p>
<p>Continue with A2 to deepen your knowledge.</p>`,
  },
];

// ════════════════════════════════════════════════════════════
// MAPPING: course ID → pages
// ════════════════════════════════════════════════════════════
const UPDATES = [
  { id: 'b6nrz95uw5fh3yt', label: 'Module 1 — Alphabet',           pages: M1_PAGES },
  { id: 'jbcsyuo1286gwbh', label: 'Module 2 — Greetings',          pages: M2_PAGES },
  { id: '62sizeupdh8h4uk', label: 'Module 3 — Family',             pages: M3_PAGES },
  { id: 'xe5x8qkqybxoac1', label: 'Module 4 — Numbers & Colours',  pages: M4_PAGES },
  { id: 'u6f3lywovesf8tw', label: 'Module 5 — Food & Meals',       pages: M5_PAGES },
  { id: '8jvy5lx96ctd6o1', label: 'Module 6 — City & Transport',   pages: M6_PAGES },
  { id: 'an8jxf1naa2u3j1', label: 'Module 7 — Final Assessment',   pages: M7_PAGES },
];

// ════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════
async function main() {
  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);

  console.log('🔐 Authenticating...');
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log('✅ Authenticated\n');

  let updated = 0;

  for (const { id, label, pages } of UPDATES) {
    try {
      const pagesStr = JSON.stringify(pages);
      await pb.collection('courses').update(id, { pages: pagesStr });
      console.log(`  ✅ Updated: ${label} (${pages.length} pages, ${pagesStr.length} chars)`);
      updated++;
    } catch (err) {
      console.error(`  ❌ Failed "${label}": ${err.message}`);
    }
  }

  console.log('\n════════════════════════════════════════════');
  console.log(`✅ Done — ${updated}/${UPDATES.length} courses updated`);
  console.log('════════════════════════════════════════════');
}

main().catch(err => {
  console.error('Fatal:', err?.data ? JSON.stringify(err.data) : err.message);
  process.exit(1);
});
