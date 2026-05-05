/**
 * create-trilingual-standard-courses.mjs
 * ════════════════════════════════════════════════════════════════════
 * Lit tous les cours français STANDARD dans PocketBase, détecte les
 * équivalents anglais et arabes manquants, et les crée.
 *
 * Usage :
 *   node create-trilingual-standard-courses.mjs --list     → affiche les cours FR + statut EN/AR
 *   node create-trilingual-standard-courses.mjs --dry-run  → simulation sans écriture
 *   node create-trilingual-standard-courses.mjs            → crée les cours manquants
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
const DRY_RUN  = process.argv.includes('--dry-run');
const LIST_ONLY = process.argv.includes('--list');

// ════════════════════════════════════════════════════════════════════
// MATRICE DE TOPICS — chaque topic a un détecteur FR + cours EN + cours AR
// ════════════════════════════════════════════════════════════════════
const TOPICS = [

  // ──────────────────────────────────────────────────────────────────
  // 1. L'IMPÉRATIF
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'imperatif',
    detectFR: t => /impérat|imperatif/i.test(t),
    en: {
      titre:       'The Imperative — Commands and Instructions (A1)',
      cours_nom:   'Anglais',
      langue:      'Anglais',
      niveau:      'A1',
      description: 'Master the imperative mood in English: giving orders, instructions, advice and directions. Includes positive and negative forms, polite requests and common everyday expressions.',
      pages: [
        {
          id: 'en-imp-p1', type: 'intro',
          title: 'Introduction — The Imperative',
          content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 English Grammar A1</div>
  <h2>The Imperative in English</h2>
  <p class="lead">The imperative is used to give <strong>orders, instructions, advice or directions</strong>. It is very easy to form in English!</p>
  <div class="lesson-objectives">
    <h4>🎯 Learning Objectives</h4>
    <ul>
      <li>Form <strong>positive imperatives</strong>: Open the door!</li>
      <li>Form <strong>negative imperatives</strong>: Don't run!</li>
      <li>Use imperatives to give <strong>directions</strong>: Turn left!</li>
      <li>Make <strong>polite requests</strong>: Please sit down.</li>
    </ul>
  </div>
</div>`,
        },
        {
          id: 'en-imp-p2', type: 'lesson',
          title: 'Forming the Imperative',
          content: `<h3>📖 How to form the imperative</h3>
<div class="rule-box">
  <h4>✅ Positive Imperative — use the base verb (infinitive without "to")</h4>
  <table>
    <thead><tr><th>Verb</th><th>Imperative</th><th>Example</th></tr></thead>
    <tbody>
      <tr><td>to open</td><td><strong>Open</strong></td><td>Open your book!</td></tr>
      <tr><td>to sit</td><td><strong>Sit</strong></td><td>Sit down, please.</td></tr>
      <tr><td>to listen</td><td><strong>Listen</strong></td><td>Listen carefully!</td></tr>
      <tr><td>to write</td><td><strong>Write</strong></td><td>Write your name.</td></tr>
      <tr><td>to come</td><td><strong>Come</strong></td><td>Come here!</td></tr>
    </tbody>
  </table>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4>❌ Negative Imperative — Don't + base verb</h4>
  <table>
    <thead><tr><th>Positive</th><th>Negative</th></tr></thead>
    <tbody>
      <tr><td>Open the window.</td><td><strong>Don't</strong> open the window.</td></tr>
      <tr><td>Run in the corridor.</td><td><strong>Don't</strong> run in the corridor.</td></tr>
      <tr><td>Be late.</td><td><strong>Don't</strong> be late.</td></tr>
      <tr><td>Touch that.</td><td><strong>Don't</strong> touch that.</td></tr>
    </tbody>
  </table>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4>👥 Let's — for suggestions (including yourself)</h4>
  <ul>
    <li><strong>Let's</strong> go! (= Let us go)</li>
    <li><strong>Let's</strong> start the lesson.</li>
    <li><strong>Let's</strong> not be late.</li>
  </ul>
</div>`,
        },
        {
          id: 'en-imp-p3', type: 'lesson',
          title: 'Everyday Uses of the Imperative',
          content: `<h3>📋 Common Uses</h3>
<table>
  <thead><tr><th>Situation</th><th>Examples</th></tr></thead>
  <tbody>
    <tr><td>🏫 Classroom</td><td>Open your books. Listen! Don't talk. Write your answers.</td></tr>
    <tr><td>🗺️ Directions</td><td>Turn left. Go straight. Stop at the traffic lights. Take the first right.</td></tr>
    <tr><td>🍳 Recipes</td><td>Mix the flour. Add two eggs. Bake for 30 minutes. Don't burn it!</td></tr>
    <tr><td>⚠️ Warning signs</td><td>Stop! Keep off the grass. Do not enter. Handle with care.</td></tr>
    <tr><td>💬 Polite requests</td><td>Please help me. Have a seat. Help yourself. Feel free to ask.</td></tr>
    <tr><td>💪 Encouragement</td><td>Try again! Don't give up! Keep going! Believe in yourself!</td></tr>
  </tbody>
</table>`,
        },
        {
          id: 'en-imp-p4', type: 'exercises',
          title: 'Exercises — The Imperative',
          content: `<h3>✏️ Exercises</h3>
<h4>Exercise 1 — Write the imperative</h4>
<ol>
  <li>(to close) ___ the door, please.</li>
  <li>(to not speak) ___ during the exam.</li>
  <li>(to turn) ___ right at the corner.</li>
  <li>(to let) ___ wait = ___ wait a moment.</li>
  <li>(to not forget) ___ your homework!</li>
</ol>
<h4>Exercise 2 — Positive or Negative?</h4>
<p>Write the correct form (positive or negative):</p>
<ol>
  <li>It's dangerous here. (be careful) ___!</li>
  <li>I'm trying to sleep! (make noise) ___ !</li>
  <li>You look tired. (rest) ___ a little.</li>
  <li>The teacher is speaking. (listen) ___!</li>
  <li>We have time. (hurry) ___ !</li>
</ol>
<h4>Exercise 3 — Give directions</h4>
<p>Write directions from the school to the library using: go straight, turn left, turn right, stop, take, cross.</p>`,
        },
      ],
      exercises: [
        { id:'en-imp-q1', question:"What is the imperative form of 'to be quiet'?", options:['Being quiet','Be quiet','You be quiet','To be quiet'], answer:1 },
        { id:'en-imp-q2', question:"Which sentence is a negative imperative?", options:['Let\'s go!','Go home!','Don\'t run!','Please sit.'], answer:2 },
        { id:'en-imp-q3', question:"Complete: ___ your homework before dinner.", options:['Does','Doing','Do','To do'], answer:2 },
        { id:'en-imp-q4', question:"'Let\'s go' means:", options:['I go','You go','We go (suggestion)','He goes'], answer:2 },
        { id:'en-imp-q5', question:"Which is correct?", options:['Don\'t to run!','Not run!','Don\'t run!','No running you!'], answer:2 },
      ],
    },
    ar: {
      titre:       'صيغة الأمر — The Imperative in Arabic (A1)',
      cours_nom:   'Arabe',
      langue:      'Arabe',
      niveau:      'A1',
      description: 'Learn to form and use the imperative (صيغة الأمر) in Arabic. Covers positive commands, negative prohibitions (لا + المضارع), common daily commands and classroom instructions.',
      pages: [
        {
          id: 'ar-imp-p1', type: 'intro',
          title: 'مقدمة — صيغة الأمر',
          content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 Arabic Grammar A1</div>
  <h2 dir="rtl">صيغة الأمر في اللغة العربية</h2>
  <p class="lead">The imperative (الأمر) is used to give orders, instructions, and advice in Arabic.</p>
  <div class="lesson-objectives">
    <h4>🎯 Learning Objectives</h4>
    <ul>
      <li>Form positive commands: <strong dir="rtl">اِقرأ! اِكتب!</strong></li>
      <li>Form negative commands: <strong dir="rtl">لا تتكلم! لا تتأخر!</strong></li>
      <li>Use masculine and feminine forms</li>
      <li>Recognize common daily imperatives</li>
    </ul>
  </div>
</div>`,
        },
        {
          id: 'ar-imp-p2', type: 'lesson',
          title: 'كيف نصوغ الأمر — How to Form the Imperative',
          content: `<h3>📖 Forming the Imperative (صيغة الأمر)</h3>
<p>To form the imperative in Arabic, take the <strong>present tense (المضارع)</strong> and remove <span dir="rtl">تَ</span> from the beginning:</p>
<div class="summary-table">
<table>
  <thead><tr><th>Infinitive (المصدر)</th><th>Present (يَفعَل)</th><th>Imperative (افعَل)</th><th>Meaning</th></tr></thead>
  <tbody>
    <tr><td dir="rtl">كَتَبَ</td><td dir="rtl">تَكتُب</td><td dir="rtl"><strong>اُكتُب!</strong></td><td>Write!</td></tr>
    <tr><td dir="rtl">قَرَأَ</td><td dir="rtl">تَقرَأ</td><td dir="rtl"><strong>اِقرَأ!</strong></td><td>Read!</td></tr>
    <tr><td dir="rtl">فَتَحَ</td><td dir="rtl">تَفتَح</td><td dir="rtl"><strong>اِفتَح!</strong></td><td>Open!</td></tr>
    <tr><td dir="rtl">جَلَسَ</td><td dir="rtl">تَجلِس</td><td dir="rtl"><strong>اِجلِس!</strong></td><td>Sit!</td></tr>
    <tr><td dir="rtl">سَمِعَ</td><td dir="rtl">تَسمَع</td><td dir="rtl"><strong>اِسمَع!</strong></td><td>Listen!</td></tr>
  </tbody>
</table>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4 dir="rtl">❌ النهي (Negative Command) — لا + المضارع</h4>
  <table>
    <thead><tr><th>Positive</th><th>Negative</th><th>Meaning</th></tr></thead>
    <tbody>
      <tr><td dir="rtl">اُكتُب</td><td dir="rtl"><strong>لا تَكتُب!</strong></td><td>Don't write!</td></tr>
      <tr><td dir="rtl">اِقرَأ</td><td dir="rtl"><strong>لا تَقرَأ!</strong></td><td>Don't read!</td></tr>
      <tr><td dir="rtl">اِجلِس</td><td dir="rtl"><strong>لا تَجلِس!</strong></td><td>Don't sit!</td></tr>
    </tbody>
  </table>
</div>`,
        },
        {
          id: 'ar-imp-p3', type: 'lesson',
          title: 'Masculine & Feminine — المذكر والمؤنث',
          content: `<h3>📋 Gender Forms of the Imperative</h3>
<table>
  <thead><tr><th>Meaning</th><th>Masculine (أنت)</th><th>Feminine (أنتِ)</th><th>Plural (أنتم)</th></tr></thead>
  <tbody>
    <tr><td>Read!</td><td dir="rtl">اِقرَأ</td><td dir="rtl">اِقرَئِي</td><td dir="rtl">اِقرَؤُوا</td></tr>
    <tr><td>Write!</td><td dir="rtl">اُكتُب</td><td dir="rtl">اُكتُبِي</td><td dir="rtl">اُكتُبُوا</td></tr>
    <tr><td>Come!</td><td dir="rtl">تَعَال</td><td dir="rtl">تَعَالَي</td><td dir="rtl">تَعَالَوا</td></tr>
    <tr><td>Sit!</td><td dir="rtl">اِجلِس</td><td dir="rtl">اِجلِسِي</td><td dir="rtl">اِجلِسُوا</td></tr>
    <tr><td>Listen!</td><td dir="rtl">اِسمَع</td><td dir="rtl">اِسمَعِي</td><td dir="rtl">اِسمَعُوا</td></tr>
  </tbody>
</table>
<h4>🏫 Classroom Commands (in Arabic)</h4>
<p dir="rtl" style="font-size:1.1em;line-height:2.5">
  <strong>اِفتَح</strong> كتابَك · <strong>اُكتُب</strong> اسمَك · <strong>اِقرَأ</strong> النص · <strong>لا تَتكَلَّم</strong> · <strong>اِسمَع</strong> جيداً
</p>`,
        },
        {
          id: 'ar-imp-p4', type: 'exercises',
          title: 'تمارين — صيغة الأمر',
          content: `<h3>✏️ Exercises</h3>
<h4>Exercise 1 — Give the imperative (masculine)</h4>
<ol dir="rtl">
  <li>ذَهَبَ → ___</li>
  <li>فَتَحَ → ___</li>
  <li>دَرَسَ → ___</li>
  <li>أَكَلَ → ___</li>
</ol>
<h4>Exercise 2 — Make it negative</h4>
<ol dir="rtl">
  <li>اِجلِس → ___ تَجلِس</li>
  <li>اُكتُب → ___ تَكتُب</li>
  <li>تَعَال → ___ تَأتِ</li>
</ol>
<h4>Exercise 3 — Translate to Arabic</h4>
<ol>
  <li>Open the door! (masculine)</li>
  <li>Don't run! (feminine)</li>
  <li>Listen carefully! (plural)</li>
</ol>`,
        },
      ],
      exercises: [
        { id:'ar-imp-q1', question:'What is the imperative of اِكتَبَ (to write) for masculine?', options:['يَكتُب','اُكتُب','كَتَبَ','كِتَابَة'], answer:1 },
        { id:'ar-imp-q2', question:'How do you say "Don\'t run!" in Arabic?', options:['اِجرِ!','لا تَجرِ!','جَرَى!','يَجرِي!'], answer:1 },
        { id:'ar-imp-q3', question:'What does لا تَتَكَلَّم mean?', options:['Speak!','Please speak','Don\'t speak!','Speaking'], answer:2 },
        { id:'ar-imp-q4', question:'The feminine imperative of اِقرَأ is:', options:['اِقرَأ','اِقرَؤُوا','اِقرَئِي','قَرَأَ'], answer:2 },
        { id:'ar-imp-q5', question:'Which word begins a negative command?', options:['مَا','لَم','لا','لَن'], answer:2 },
      ],
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 2. L'HYPOTHÈSE SUR LE FUTUR
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'hypothese',
    detectFR: t => /hypothèse|hypothese|conditionnel|futur.*si|si.*futur/i.test(t),
    en: {
      titre:       'The First Conditional — If Clauses (A2)',
      cours_nom:   'Anglais',
      langue:      'Anglais',
      niveau:      'A2',
      description: 'Learn the first conditional (If + present → will) to talk about real and possible future situations. Master the structure, common patterns and everyday uses of conditional sentences in English.',
      pages: [
        {
          id: 'en-cond-p1', type: 'intro',
          title: 'Introduction — The First Conditional',
          content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 English Grammar A2</div>
  <h2>The First Conditional in English</h2>
  <p class="lead">We use the <strong>first conditional</strong> to talk about <strong>real and possible situations in the future</strong>.</p>
  <div class="lesson-objectives">
    <h4>🎯 Learning Objectives</h4>
    <ul>
      <li>Form first conditional sentences: <strong>If + present simple, will + verb</strong></li>
      <li>Talk about future possibilities</li>
      <li>Use unless, when, as soon as instead of if</li>
      <li>Distinguish real from unreal conditions</li>
    </ul>
  </div>
  <div class="lesson-highlight"><strong>Key structure:</strong> If it rains, I <em>will</em> stay home.</div>
</div>`,
        },
        {
          id: 'en-cond-p2', type: 'lesson',
          title: 'Structure of the First Conditional',
          content: `<h3>📖 Structure</h3>
<div class="rule-box">
  <h4>IF clause (condition) + Result clause</h4>
  <table>
    <thead><tr><th>IF clause</th><th>Result clause</th></tr></thead>
    <tbody>
      <tr><td>If + <strong>present simple</strong></td><td><strong>will</strong> + base verb</td></tr>
      <tr><td>If it <strong>rains</strong></td><td>I <strong>will</strong> stay home.</td></tr>
      <tr><td>If you <strong>study</strong> hard</td><td>you <strong>will</strong> pass the exam.</td></tr>
      <tr><td>If she <strong>calls</strong></td><td>I <strong>will</strong> answer.</td></tr>
    </tbody>
  </table>
  <p><strong>⚠️ Note:</strong> The clauses can be in either order:</p>
  <ul>
    <li>If it rains, <strong>I will stay home.</strong> ✓</li>
    <li><strong>I will stay home</strong> if it rains. ✓ (no comma needed)</li>
  </ul>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4>Negative forms</h4>
  <ul>
    <li>If you <strong>don't study</strong>, you <strong>won't</strong> pass.</li>
    <li>If it <strong>doesn't rain</strong>, we <strong>will</strong> go to the beach.</li>
  </ul>
</div>`,
        },
        {
          id: 'en-cond-p3', type: 'lesson',
          title: 'Variations: unless / when / as soon as',
          content: `<h3>📋 Other Connectors</h3>
<table>
  <thead><tr><th>Word</th><th>Meaning</th><th>Example</th></tr></thead>
  <tbody>
    <tr><td><strong>unless</strong></td><td>if not</td><td><em>Unless</em> you hurry, you will miss the bus. = If you <em>don't</em> hurry...</td></tr>
    <tr><td><strong>when</strong></td><td>at the moment that</td><td><em>When</em> I arrive, I will call you.</td></tr>
    <tr><td><strong>as soon as</strong></td><td>immediately when</td><td><em>As soon as</em> I finish, I will come.</td></tr>
    <tr><td><strong>if</strong></td><td>on condition that</td><td><em>If</em> you need help, ask me.</td></tr>
  </tbody>
</table>`,
        },
        {
          id: 'en-cond-p4', type: 'exercises',
          title: 'Exercises — The First Conditional',
          content: `<h3>✏️ Exercises</h3>
<h4>Exercise 1 — Complete with will or won't</h4>
<ol>
  <li>If it rains, we ___ go to the park.</li>
  <li>If you eat well, you ___ feel better.</li>
  <li>If she doesn't come, I ___ wait for her.</li>
  <li>If they study, they ___ pass the test.</li>
</ol>
<h4>Exercise 2 — Write the correct verb form</h4>
<ol>
  <li>If I (to find) ___ a job, I will move to the city.</li>
  <li>She will be happy if you (to call) ___ her.</li>
  <li>If it (not to snow), we (to go) ___ hiking.</li>
</ol>
<h4>Exercise 3 — Rewrite using unless</h4>
<ol>
  <li>If you don't hurry, you'll be late. → <em>Unless</em>...</li>
  <li>If it doesn't rain, I'll go running. → <em>Unless</em>...</li>
</ol>`,
        },
      ],
      exercises: [
        { id:'en-cond-q1', question:'Complete: If it rains, I ___ stay home.', options:['would','will','should','can'], answer:1 },
        { id:'en-cond-q2', question:'Which tense is used in the IF clause of the first conditional?', options:['Future simple','Past simple','Present simple','Present perfect'], answer:2 },
        { id:'en-cond-q3', question:'"Unless you study" means:', options:['If you study','If you don\'t study','When you study','Because you study'], answer:1 },
        { id:'en-cond-q4', question:'Which sentence is correct?', options:['If it will rain, I stay home.','If it rains, I will stay home.','If it rained, I will stay home.','If it rain, I will stay home.'], answer:1 },
        { id:'en-cond-q5', question:'Complete: She will call ___ she arrives.', options:['if','when','unless','but'], answer:1 },
      ],
    },
    ar: {
      titre:       'الجملة الشرطية — Conditional Sentences (A2)',
      cours_nom:   'Arabe',
      langue:      'Arabe',
      niveau:      'A2',
      description: 'Learn conditional sentences in Arabic using إذا and لو. Understand how to express real future conditions (إذا + present → future) and hypothetical situations. Master the most common patterns used in everyday Arabic.',
      pages: [
        {
          id: 'ar-cond-p1', type: 'intro',
          title: 'مقدمة — الجملة الشرطية',
          content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 Arabic Grammar A2</div>
  <h2 dir="rtl">الجملة الشرطية في العربية</h2>
  <p class="lead">Conditional sentences in Arabic use <strong>إذا</strong> (if/when, for real conditions) and <strong>لو</strong> (if, for hypothetical conditions).</p>
  <div class="lesson-objectives">
    <h4>🎯 Learning Objectives</h4>
    <ul>
      <li>Use <strong dir="rtl">إذا</strong> for real future conditions</li>
      <li>Use <strong dir="rtl">لو</strong> for hypothetical conditions</li>
      <li>Recognise the structure: شرط + جواب الشرط</li>
      <li>Read and write basic conditional sentences</li>
    </ul>
  </div>
</div>`,
        },
        {
          id: 'ar-cond-p2', type: 'lesson',
          title: 'إذا — Real Conditions',
          content: `<h3 dir="rtl">📖 إذا (if/when) — الشرط الحقيقي</h3>
<p>Use <strong dir="rtl">إذا</strong> for conditions that are real or likely to happen:</p>
<div class="summary-table">
<table>
  <thead><tr><th dir="rtl">الجملة (Sentence)</th><th>Translation</th></tr></thead>
  <tbody>
    <tr><td dir="rtl"><strong>إذا</strong> دَرَستَ، نَجَحتَ.</td><td>If you study, you will succeed.</td></tr>
    <tr><td dir="rtl"><strong>إذا</strong> أَكَلتَ جيداً، شَعَرتَ بِصِحَّة.</td><td>If you eat well, you will feel healthy.</td></tr>
    <tr><td dir="rtl"><strong>إذا</strong> أَسرَعتَ، وَصَلتَ في الوَقت.</td><td>If you hurry, you will arrive on time.</td></tr>
    <tr><td dir="rtl"><strong>إذا</strong> طَلَبتَ المُساعَدة، سَأُساعِدُك.</td><td>If you ask for help, I will help you.</td></tr>
  </tbody>
</table>
</div>
<p><strong>Structure:</strong> <span dir="rtl">إذا + فعل ماضٍ → جواب (فعل ماضٍ أو مضارع)</span></p>`,
        },
        {
          id: 'ar-cond-p3', type: 'lesson',
          title: 'لو — Hypothetical Conditions',
          content: `<h3 dir="rtl">📖 لو — الشرط الافتراضي</h3>
<p>Use <strong dir="rtl">لو</strong> for hypothetical, unreal or wished-for conditions:</p>
<table>
  <thead><tr><th dir="rtl">الجملة</th><th>Translation</th></tr></thead>
  <tbody>
    <tr><td dir="rtl"><strong>لو</strong> كان مَعِي وَقت، سَأُسافِر.</td><td>If I had time, I would travel.</td></tr>
    <tr><td dir="rtl"><strong>لو</strong> كُنتُ غَنِياً، بَنَيتُ بَيتاً كبيراً.</td><td>If I were rich, I would build a big house.</td></tr>
    <tr><td dir="rtl"><strong>لو</strong> دَرَستَ أَكثَر، لَنَجَحتَ.</td><td>If you had studied more, you would have passed.</td></tr>
  </tbody>
</table>
<div class="rule-box" style="margin-top:1rem">
  <h4>إذا vs لو</h4>
  <table>
    <thead><tr><th></th><th>إذا</th><th>لو</th></tr></thead>
    <tbody>
      <tr><td>Type</td><td>Real / possible</td><td>Hypothetical / unlikely</td></tr>
      <tr><td>Example</td><td dir="rtl">إذا مَطَرَ، سَأَبقى في البَيت.</td><td dir="rtl">لو مَطَرَ، كُنتُ بَقَيتُ في البَيت.</td></tr>
    </tbody>
  </table>
</div>`,
        },
        {
          id: 'ar-cond-p4', type: 'exercises',
          title: 'تمارين — الجملة الشرطية',
          content: `<h3>✏️ Exercises</h3>
<h4>Exercise 1 — Choose إذا or لو</h4>
<ol dir="rtl">
  <li>___ جاء أَحمَد، سَنَذهَب معاً. (إذا / لو)</li>
  <li>___ كانَ عِندِي سَيَّارة، لَسَافَرتُ. (إذا / لو)</li>
  <li>___ أَكَلتَ كثيراً، ستَتعَب. (إذا / لو)</li>
</ol>
<h4>Exercise 2 — Complete the sentence</h4>
<ol dir="rtl">
  <li>إذا ذَاكَرتَ، ___</li>
  <li>لو كُنتُ طَبيباً، ___</li>
  <li>إذا طَلَبتَ مِنِّي، ___</li>
</ol>
<h4>Exercise 3 — Translate to Arabic</h4>
<ol>
  <li>If you study, you will succeed.</li>
  <li>If I were rich, I would help everyone.</li>
</ol>`,
        },
      ],
      exercises: [
        { id:'ar-cond-q1', question:'Which word introduces a real future condition in Arabic?', options:['لو','إذا','لكن','أو'], answer:1 },
        { id:'ar-cond-q2', question:'Complete: إذا دَرَستَ، ___', options:['لو نَجَحتَ','نَجَحتَ','لَم تَنجَح','أَدرِس'], answer:1 },
        { id:'ar-cond-q3', question:'"لو" is used for:', options:['Real conditions','Past tense','Hypothetical conditions','Questions'], answer:2 },
        { id:'ar-cond-q4', question:'What does إذا طَلَبتَ مُساعَدة mean?', options:['You need help','If you ask for help','You asked for help','When you helped'], answer:1 },
        { id:'ar-cond-q5', question:'Complete: لو كانَ عِندِي وَقت، ___ سَافَرتُ', options:['إذا','ولكن','لَ','سَ'], answer:2 },
      ],
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 3. LES ARTICLES PARTITIFS / QUANTIFIERS
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'partitif',
    detectFR: t => /partitif|articles.*du|du.*de la|dénombrable/i.test(t),
    en: {
      titre:       'Quantifiers: Some, Any, Much, Many (A1–A2)',
      cours_nom:   'Anglais',
      langue:      'Anglais',
      niveau:      'A1',
      description: 'Master English quantifiers: some, any, much, many, a lot of, a few, a little. Understand countable and uncountable nouns and how to express quantities in everyday English.',
      pages: [
        {
          id: 'en-quant-p1', type: 'intro',
          title: 'Introduction — Quantifiers',
          content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 English Grammar A1–A2</div>
  <h2>Quantifiers in English</h2>
  <p class="lead">Quantifiers tell us <strong>how much or how many</strong> of something there is.</p>
  <div class="lesson-objectives">
    <h4>🎯 Learning Objectives</h4>
    <ul>
      <li>Distinguish <strong>countable</strong> and <strong>uncountable</strong> nouns</li>
      <li>Use <strong>some</strong> and <strong>any</strong> correctly</li>
      <li>Use <strong>much / many / a lot of / a few / a little</strong></li>
    </ul>
  </div>
</div>`,
        },
        {
          id: 'en-quant-p2', type: 'lesson',
          title: 'Countable vs Uncountable Nouns',
          content: `<h3>📖 Countable vs Uncountable Nouns</h3>
<table>
  <thead><tr><th>Countable (can count)</th><th>Uncountable (cannot count)</th></tr></thead>
  <tbody>
    <tr><td>an apple, two apples</td><td>water, milk, sugar</td></tr>
    <tr><td>a book, three books</td><td>money, information, music</td></tr>
    <tr><td>a student, many students</td><td>time, rice, bread</td></tr>
  </tbody>
</table>
<div class="rule-box" style="margin-top:1rem">
  <h4>SOME / ANY</h4>
  <table>
    <thead><tr><th></th><th>Countable</th><th>Uncountable</th></tr></thead>
    <tbody>
      <tr><td>✅ Positive</td><td>I have <strong>some</strong> apples.</td><td>I have <strong>some</strong> water.</td></tr>
      <tr><td>❌ Negative</td><td>I don't have <strong>any</strong> apples.</td><td>I don't have <strong>any</strong> water.</td></tr>
      <tr><td>❓ Question</td><td>Do you have <strong>any</strong> apples?</td><td>Is there <strong>any</strong> water?</td></tr>
    </tbody>
  </table>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4>MUCH / MANY / A LOT OF</h4>
  <table>
    <thead><tr><th>Quantifier</th><th>With...</th><th>Example</th></tr></thead>
    <tbody>
      <tr><td><strong>many</strong></td><td>Countable (neg/questions)</td><td>How <strong>many</strong> books do you have?</td></tr>
      <tr><td><strong>much</strong></td><td>Uncountable (neg/questions)</td><td>I don't have <strong>much</strong> time.</td></tr>
      <tr><td><strong>a lot of</strong></td><td>Both (positive)</td><td>I have <strong>a lot of</strong> friends / time.</td></tr>
      <tr><td><strong>a few</strong></td><td>Countable</td><td>I have <strong>a few</strong> minutes.</td></tr>
      <tr><td><strong>a little</strong></td><td>Uncountable</td><td>I have <strong>a little</strong> money.</td></tr>
    </tbody>
  </table>
</div>`,
        },
        {
          id: 'en-quant-p3', type: 'exercises',
          title: 'Exercises — Quantifiers',
          content: `<h3>✏️ Exercises</h3>
<h4>Exercise 1 — some or any?</h4>
<ol>
  <li>I'd like ___ coffee, please.</li>
  <li>There isn't ___ milk in the fridge.</li>
  <li>Do you have ___ questions?</li>
  <li>She bought ___ new shoes.</li>
</ol>
<h4>Exercise 2 — much or many?</h4>
<ol>
  <li>How ___ students are in your class?</li>
  <li>I don't have ___ money left.</li>
  <li>There aren't ___ buses on Sunday.</li>
  <li>I don't drink ___ coffee.</li>
</ol>`,
        },
      ],
      exercises: [
        { id:'en-quant-q1', question:'"Water" is a ___ noun.', options:['countable','uncountable','plural','proper'], answer:1 },
        { id:'en-quant-q2', question:'I don\'t have ___ time.', options:['many','some','much','few'], answer:2 },
        { id:'en-quant-q3', question:'Use ___ in questions and negative sentences.', options:['some','any','much','many'], answer:1 },
        { id:'en-quant-q4', question:'How ___ books do you have?', options:['much','little','many','any'], answer:2 },
        { id:'en-quant-q5', question:'I have ___ friends (= not many, but a positive amount).', options:['a little','few','a few','any'], answer:2 },
      ],
    },
    ar: {
      titre:       'النكرة والمعرفة — Definite and Indefinite (A1)',
      cours_nom:   'Arabe',
      langue:      'Arabe',
      niveau:      'A1',
      description: 'Learn the fundamental Arabic distinction between definite (المعرفة) and indefinite (النكرة) nouns. Master ال التعريف, tanwin, and how definiteness works in Arabic — the equivalent of articles in other languages.',
      pages: [
        {
          id: 'ar-def-p1', type: 'intro',
          title: 'مقدمة — النكرة والمعرفة',
          content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 Arabic Grammar A1</div>
  <h2 dir="rtl">النكرة والمعرفة في العربية</h2>
  <p class="lead">In Arabic, nouns are either <strong>indefinite (نكرة)</strong> or <strong>definite (معرفة)</strong>. This distinction works differently from European languages — there is no "a" article!</p>
  <div class="lesson-objectives">
    <h4>🎯 Learning Objectives</h4>
    <ul>
      <li>Recognise indefinite nouns (نكرة): <strong dir="rtl">كِتَابٌ</strong> = a book</li>
      <li>Use ال to make nouns definite: <strong dir="rtl">الكِتَابُ</strong> = the book</li>
      <li>Understand tanwin (تنوين) for indefinite nouns</li>
      <li>Know the solar and lunar letters</li>
    </ul>
  </div>
</div>`,
        },
        {
          id: 'ar-def-p2', type: 'lesson',
          title: 'ال التعريف — The Definite Article',
          content: `<h3 dir="rtl">📖 ال التعريف (The Definite Article)</h3>
<p>Add <strong dir="rtl">ال</strong> to the beginning of a noun to make it definite (= "the"):</p>
<div class="summary-table">
<table>
  <thead><tr><th>Indefinite (نكرة)</th><th>Definite (معرفة)</th><th>English</th></tr></thead>
  <tbody>
    <tr><td dir="rtl">كِتَابٌ</td><td dir="rtl"><strong>الـ</strong>كِتَابُ</td><td>a book → the book</td></tr>
    <tr><td dir="rtl">بَيتٌ</td><td dir="rtl"><strong>الـ</strong>بَيتُ</td><td>a house → the house</td></tr>
    <tr><td dir="rtl">وَلَدٌ</td><td dir="rtl"><strong>الـ</strong>وَلَدُ</td><td>a boy → the boy</td></tr>
    <tr><td dir="rtl">مَدرَسَةٌ</td><td dir="rtl"><strong>الـ</strong>مَدرَسَةُ</td><td>a school → the school</td></tr>
    <tr><td dir="rtl">سَيَّارَةٌ</td><td dir="rtl"><strong>الـ</strong>سَيَّارَةُ</td><td>a car → the car</td></tr>
  </tbody>
</table>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4>Tanwin (تنوين) — marks indefinite nouns</h4>
  <p dir="rtl">كِتَاب<strong>ٌ</strong> = a book (sound: -un) · وَلَد<strong>ٌ</strong> = a boy · بَيت<strong>ٌ</strong> = a house</p>
  <p>When you add ال, the tanwin disappears: كِتَابٌ → الكِتَابُ</p>
</div>`,
        },
        {
          id: 'ar-def-p3', type: 'exercises',
          title: 'تمارين — النكرة والمعرفة',
          content: `<h3>✏️ Exercises</h3>
<h4>Exercise 1 — Add ال to make definite</h4>
<ol dir="rtl">
  <li>طَالِبٌ → ___</li>
  <li>مَدِينَةٌ → ___</li>
  <li>قَلَمٌ → ___</li>
  <li>كُرسِيٌّ → ___</li>
</ol>
<h4>Exercise 2 — Indefinite or Definite?</h4>
<ol dir="rtl">
  <li>المُعَلِّمُ يَشرَح الدَّرس. (Is مُعَلِّم definite or indefinite?)</li>
  <li>أُريدُ كِتَاباً. (Is كِتَاب definite or indefinite?)</li>
</ol>
<h4>Exercise 3 — Translate</h4>
<ol>
  <li>a student (Arabic)</li>
  <li>the school (Arabic)</li>
  <li>I see the book. (Arabic)</li>
</ol>`,
        },
      ],
      exercises: [
        { id:'ar-def-q1', question:'How do you make a noun definite in Arabic?', options:['Add tanwin','Add ال at the beginning','Add a suffix','Change the vowels'], answer:1 },
        { id:'ar-def-q2', question:'What is the definite form of بَيتٌ?', options:['بَيتِي','بَيتٌ','البَيتُ','بَيتَهُ'], answer:2 },
        { id:'ar-def-q3', question:'Tanwin (ٌ) indicates:', options:['A definite noun','An indefinite noun','A verb','A pronoun'], answer:1 },
        { id:'ar-def-q4', question:'كِتَابٌ means:', options:['the book','a book','his book','books'], answer:1 },
        { id:'ar-def-q5', question:'الكِتَابُ means:', options:['a book','books','the book','my book'], answer:2 },
      ],
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 4. LA PHRASE INTERROGATIVE
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'interrogatif',
    detectFR: t => /phrase interrogative|interrogati/i.test(t) && !/registre/i.test(t),
    en: {
      titre:       'Forming Questions in English — Wh- and Yes/No (A1)',
      cours_nom:   'Anglais',
      langue:      'Anglais',
      niveau:      'A1',
      description: 'Learn to form questions in English: Yes/No questions with auxiliary verbs (do, does, is, are) and open Wh- questions (who, what, where, when, why, how). Includes short answers and common question patterns.',
      pages: [
        {
          id: 'en-quest-p1', type: 'intro',
          title: 'Introduction — Forming Questions',
          content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 English Grammar A1</div>
  <h2>Forming Questions in English</h2>
  <p class="lead">In English there are two main types of questions: <strong>Yes/No questions</strong> and <strong>Wh- questions</strong>.</p>
  <div class="lesson-objectives">
    <h4>🎯 Learning Objectives</h4>
    <ul>
      <li>Form Yes/No questions with <strong>do/does/is/are</strong></li>
      <li>Use Wh- words: <strong>who, what, where, when, why, how</strong></li>
      <li>Give short answers: <em>Yes, I do. / No, she doesn't.</em></li>
      <li>Ask about people, things, places, times and reasons</li>
    </ul>
  </div>
</div>`,
        },
        {
          id: 'en-quest-p2', type: 'lesson',
          title: 'Yes/No Questions',
          content: `<h3>📖 Yes/No Questions</h3>
<div class="rule-box">
  <h4>With DO / DOES (present simple)</h4>
  <table>
    <thead><tr><th>Statement</th><th>Question</th><th>Short Answer</th></tr></thead>
    <tbody>
      <tr><td>You speak English.</td><td><strong>Do</strong> you speak English?</td><td>Yes, I <strong>do</strong>. / No, I <strong>don't</strong>.</td></tr>
      <tr><td>She likes coffee.</td><td><strong>Does</strong> she like coffee?</td><td>Yes, she <strong>does</strong>. / No, she <strong>doesn't</strong>.</td></tr>
      <tr><td>They live in Morocco.</td><td><strong>Do</strong> they live in Morocco?</td><td>Yes, they <strong>do</strong>.</td></tr>
    </tbody>
  </table>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4>With IS / ARE (to be)</h4>
  <table>
    <thead><tr><th>Statement</th><th>Question</th></tr></thead>
    <tbody>
      <tr><td>She is a student.</td><td><strong>Is</strong> she a student?</td></tr>
      <tr><td>They are happy.</td><td><strong>Are</strong> they happy?</td></tr>
      <tr><td>It is cold today.</td><td><strong>Is</strong> it cold today?</td></tr>
    </tbody>
  </table>
</div>`,
        },
        {
          id: 'en-quest-p3', type: 'lesson',
          title: 'Wh- Questions',
          content: `<h3>📋 Wh- Question Words</h3>
<table>
  <thead><tr><th>Word</th><th>Asks about</th><th>Example</th></tr></thead>
  <tbody>
    <tr><td><strong>Who</strong></td><td>Person</td><td>Who is that? — It's my teacher.</td></tr>
    <tr><td><strong>What</strong></td><td>Thing / action</td><td>What do you do? — I'm a student.</td></tr>
    <tr><td><strong>Where</strong></td><td>Place</td><td>Where do you live? — In Laayoune.</td></tr>
    <tr><td><strong>When</strong></td><td>Time</td><td>When does school start? — At 8am.</td></tr>
    <tr><td><strong>Why</strong></td><td>Reason</td><td>Why are you late? — Because of traffic.</td></tr>
    <tr><td><strong>How</strong></td><td>Manner / degree</td><td>How are you? — Fine, thanks!</td></tr>
    <tr><td><strong>How many</strong></td><td>Quantity (countable)</td><td>How many students? — Twenty.</td></tr>
    <tr><td><strong>How much</strong></td><td>Quantity (uncountable)</td><td>How much does it cost? — 50 MAD.</td></tr>
  </tbody>
</table>`,
        },
        {
          id: 'en-quest-p4', type: 'exercises',
          title: 'Exercises — Forming Questions',
          content: `<h3>✏️ Exercises</h3>
<h4>Exercise 1 — Write the question</h4>
<ol>
  <li>(you / speak / French?) → ___</li>
  <li>(she / work / every day?) → ___</li>
  <li>(they / be / students?) → ___</li>
  <li>(it / be / cold?) → ___</li>
</ol>
<h4>Exercise 2 — Choose the correct Wh- word</h4>
<ol>
  <li>___ is your name? — My name is Sara.</li>
  <li>___ do you live? — In Casablanca.</li>
  <li>___ does school finish? — At 5pm.</li>
  <li>___ are you sad? — Because I failed the test.</li>
</ol>
<h4>Exercise 3 — Give short answers</h4>
<ol>
  <li>Do you like football? → Yes, ___.</li>
  <li>Is she a doctor? → No, ___.</li>
  <li>Do they speak Arabic? → Yes, ___.</li>
</ol>`,
        },
      ],
      exercises: [
        { id:'en-quest-q1', question:'To make a Yes/No question with "she likes", use:', options:['Is she like?','Does she likes?','Does she like?','Do she like?'], answer:2 },
        { id:'en-quest-q2', question:'___ do you live? — In Morocco.', options:['Who','Why','Where','When'], answer:2 },
        { id:'en-quest-q3', question:'"Do you speak English?" — Short answer:', options:['Yes, I speak.','Yes, I do.','Yes, do I.','Yes, I speaking.'], answer:1 },
        { id:'en-quest-q4', question:'___ students are in the class? (asking about number)', options:['How much','How many','What','Who'], answer:1 },
        { id:'en-quest-q5', question:'___ are you sad? — Because I lost my phone.', options:['Who','Where','Why','When'], answer:2 },
      ],
    },
    ar: {
      titre:       'أسلوب الاستفهام — Question Words in Arabic (A1)',
      cours_nom:   'Arabe',
      langue:      'Arabe',
      niveau:      'A1',
      description: 'Learn to form questions in Arabic using question words (أدوات الاستفهام): من، ماذا، أين، متى، كيف، لماذا، كم. Includes yes/no questions with هل and common question patterns for everyday conversation.',
      pages: [
        {
          id: 'ar-quest-p1', type: 'intro',
          title: 'مقدمة — أسلوب الاستفهام',
          content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 Arabic Grammar A1</div>
  <h2 dir="rtl">أسلوب الاستفهام في العربية</h2>
  <p class="lead">In Arabic, questions are formed using <strong>question words (أدوات الاستفهام)</strong> placed at the beginning of the sentence.</p>
  <div class="lesson-objectives">
    <h4>🎯 Learning Objectives</h4>
    <ul>
      <li>Use <strong dir="rtl">هل</strong> for Yes/No questions</li>
      <li>Use question words: <strong dir="rtl">من، ماذا، أين، متى، كيف، لماذا، كم</strong></li>
      <li>Form basic questions in Arabic</li>
      <li>Answer questions correctly</li>
    </ul>
  </div>
</div>`,
        },
        {
          id: 'ar-quest-p2', type: 'lesson',
          title: 'هل — Yes/No Questions',
          content: `<h3 dir="rtl">📖 هل — السؤال بنعم أو لا</h3>
<p>Add <strong dir="rtl">هَل</strong> at the beginning of a statement to make a Yes/No question:</p>
<div class="summary-table">
<table>
  <thead><tr><th>Statement</th><th>Question with هل</th><th>Answer</th></tr></thead>
  <tbody>
    <tr><td dir="rtl">أَنتَ طَالِبٌ.</td><td dir="rtl"><strong>هَل</strong> أَنتَ طَالِبٌ؟</td><td dir="rtl">نَعَم / لا</td></tr>
    <tr><td dir="rtl">تَتَكَلَّم العَرَبيَّة.</td><td dir="rtl"><strong>هَل</strong> تَتَكَلَّم العَرَبيَّة؟</td><td dir="rtl">نَعَم، أَتَكَلَّم.</td></tr>
    <tr><td dir="rtl">هِيَ مُعَلِّمَة.</td><td dir="rtl"><strong>هَل</strong> هِيَ مُعَلِّمَة؟</td><td dir="rtl">نَعَم، هِيَ مُعَلِّمَة.</td></tr>
  </tbody>
</table>
</div>`,
        },
        {
          id: 'ar-quest-p3', type: 'lesson',
          title: 'أدوات الاستفهام — Question Words',
          content: `<h3>📋 Arabic Question Words</h3>
<table>
  <thead><tr><th dir="rtl">أداة</th><th>Meaning</th><th>Example</th></tr></thead>
  <tbody>
    <tr><td dir="rtl"><strong>مَن</strong></td><td>Who</td><td dir="rtl">مَن هذا؟ — Who is this?</td></tr>
    <tr><td dir="rtl"><strong>مَاذَا / مَا</strong></td><td>What</td><td dir="rtl">مَاذَا تَدرُس؟ — What do you study?</td></tr>
    <tr><td dir="rtl"><strong>أَينَ</strong></td><td>Where</td><td dir="rtl">أَينَ تَسكُن؟ — Where do you live?</td></tr>
    <tr><td dir="rtl"><strong>مَتَى</strong></td><td>When</td><td dir="rtl">مَتَى يَبدَأ الدَّرس؟ — When does the lesson start?</td></tr>
    <tr><td dir="rtl"><strong>كَيفَ</strong></td><td>How</td><td dir="rtl">كَيفَ حَالُك؟ — How are you?</td></tr>
    <tr><td dir="rtl"><strong>لِمَاذَا</strong></td><td>Why</td><td dir="rtl">لِمَاذَا تَتَأَخَّر؟ — Why are you late?</td></tr>
    <tr><td dir="rtl"><strong>كَم</strong></td><td>How many/much</td><td dir="rtl">كَم عُمرُك؟ — How old are you?</td></tr>
  </tbody>
</table>`,
        },
        {
          id: 'ar-quest-p4', type: 'exercises',
          title: 'تمارين — أسلوب الاستفهام',
          content: `<h3>✏️ Exercises</h3>
<h4>Exercise 1 — Choose the correct question word</h4>
<ol dir="rtl">
  <li>___ اسمُك؟ — اسمي سارة. (مَا / مَتَى / أَينَ)</li>
  <li>___ تَسكُن؟ — أَسكُن في الدَّار البَيضَاء. (لِمَاذَا / أَينَ / مَن)</li>
  <li>___ هذا الرَّجُل؟ — هذا أَستَاذِي. (كَيفَ / مَن / مَتَى)</li>
  <li>___ يَنتَهِي الدَّرس؟ — يَنتَهِي الساعة الثَّالثة. (مَتَى / لِمَاذَا / كَم)</li>
</ol>
<h4>Exercise 2 — Form questions with هل</h4>
<ol dir="rtl">
  <li>أَنتَ طَالِبٌ. → هَل ___؟</li>
  <li>تَتَكَلَّم الفَرَنسِيَّة. → هَل ___؟</li>
</ol>
<h4>Exercise 3 — Translate to Arabic</h4>
<ol>
  <li>Where do you work?</li>
  <li>Why are you studying Arabic?</li>
  <li>How many brothers do you have?</li>
</ol>`,
        },
      ],
      exercises: [
        { id:'ar-quest-q1', question:'Which word forms a Yes/No question in Arabic?', options:['لأن','هل','إذا','لو'], answer:1 },
        { id:'ar-quest-q2', question:'مَن means:', options:['Where','What','Who','When'], answer:2 },
        { id:'ar-quest-q3', question:'Complete: ___ تَسكُن؟ (asking about location)', options:['مَتَى','لِمَاذَا','أَينَ','كَيفَ'], answer:2 },
        { id:'ar-quest-q4', question:'كَيفَ حَالُك؟ means:', options:['Where are you?','Who are you?','How are you?','What do you do?'], answer:2 },
        { id:'ar-quest-q5', question:'كَم عُمرُك؟ means:', options:['What is your name?','How old are you?','Where are you from?','When were you born?'], answer:1 },
      ],
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 5. L'ACCORD ET LA PLACE DES ADJECTIFS
  // ──────────────────────────────────────────────────────────────────
  {
    id: 'adjectifs',
    detectFR: t => /adjectif|accord.*adject|place.*adject/i.test(t),
    en: {
      titre:       'Adjectives in English — Position and Comparison (A1–A2)',
      cours_nom:   'Anglais',
      langue:      'Anglais',
      niveau:      'A1',
      description: 'Learn how adjectives work in English: position before nouns, comparison (bigger, the biggest), compound adjectives, and common adjective categories. Includes descriptive adjectives for people, places and things.',
      pages: [
        {
          id: 'en-adj-p1', type: 'intro',
          title: 'Introduction — Adjectives in English',
          content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 English Grammar A1–A2</div>
  <h2>Adjectives in English</h2>
  <p class="lead">Adjectives <strong>describe nouns</strong>. In English they come <strong>before the noun</strong> and <strong>never change form</strong>.</p>
  <div class="lesson-objectives">
    <h4>🎯 Learning Objectives</h4>
    <ul>
      <li>Place adjectives correctly: <em>a <strong>big</strong> house</em></li>
      <li>Use adjectives after linking verbs: <em>The house <strong>is</strong> big.</em></li>
      <li>Form comparative adjectives: <em>bigger, more beautiful</em></li>
      <li>Form superlative adjectives: <em>the biggest, the most beautiful</em></li>
    </ul>
  </div>
</div>`,
        },
        {
          id: 'en-adj-p2', type: 'lesson',
          title: 'Position of Adjectives',
          content: `<h3>📖 Where to place adjectives</h3>
<div class="rule-box">
  <h4>1. Before the noun (attributive position)</h4>
  <p>adjective + noun: a <strong>big</strong> city · a <strong>beautiful</strong> day · an <strong>old</strong> man</p>
  <p>⚠️ In English, adjectives <strong>never add -s for plural</strong>: two <strong>big</strong> cities (NOT big<del>s</del> cities)</p>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4>2. After linking verbs (predicative position)</h4>
  <p>subject + verb + adjective: The city <strong>is big</strong>. · She <strong>looks tired</strong>. · It <strong>feels cold</strong>.</p>
  <p>Common linking verbs: <em>be, seem, look, feel, smell, taste, sound, become</em></p>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4>3. Order of adjectives (when several)</h4>
  <p>Opinion → Size → Age → Shape → Colour → Origin → Material + NOUN</p>
  <p>Example: a <em>lovely</em> <em>little</em> <em>old</em> <em>Italian</em> car</p>
</div>`,
        },
        {
          id: 'en-adj-p3', type: 'lesson',
          title: 'Comparative and Superlative',
          content: `<h3>📋 Comparison of Adjectives</h3>
<table>
  <thead><tr><th>Adjective</th><th>Comparative (+er / more)</th><th>Superlative (the -est / most)</th></tr></thead>
  <tbody>
    <tr><td>big</td><td>big<strong>ger</strong></td><td>the big<strong>gest</strong></td></tr>
    <tr><td>tall</td><td>tall<strong>er</strong></td><td>the tall<strong>est</strong></td></tr>
    <tr><td>beautiful</td><td><strong>more</strong> beautiful</td><td>the <strong>most</strong> beautiful</td></tr>
    <tr><td>interesting</td><td><strong>more</strong> interesting</td><td>the <strong>most</strong> interesting</td></tr>
    <tr><td>good</td><td><strong>better</strong> (irregular)</td><td>the <strong>best</strong></td></tr>
    <tr><td>bad</td><td><strong>worse</strong> (irregular)</td><td>the <strong>worst</strong></td></tr>
  </tbody>
</table>
<p><strong>Rules:</strong> Short adjectives (1 syllable) → -er / -est. Long adjectives (3+ syllables) → more / most.</p>`,
        },
        {
          id: 'en-adj-p4', type: 'exercises',
          title: 'Exercises — Adjectives',
          content: `<h3>✏️ Exercises</h3>
<h4>Exercise 1 — Put the adjective in the right place</h4>
<ol>
  <li>(big) I live in a ___ house ___.</li>
  <li>(Italian) She has a ___ car ___.</li>
  <li>(tired) He ___ looks ___.</li>
</ol>
<h4>Exercise 2 — Comparative or superlative?</h4>
<ol>
  <li>Rabat is ___ than Laayoune. (big)</li>
  <li>Casablanca is ___ city in Morocco. (big)</li>
  <li>English is ___ than Maths for me. (easy)</li>
  <li>She is ___ student in the class. (good)</li>
</ol>`,
        },
      ],
      exercises: [
        { id:'en-adj-q1', question:'Where do adjectives go in English?', options:['After the noun','Before the noun','At the end of the sentence','Before the verb'], answer:1 },
        { id:'en-adj-q2', question:'What is the comparative of "beautiful"?', options:['beautifuler','most beautiful','more beautiful','beautifullest'], answer:2 },
        { id:'en-adj-q3', question:'Which is correct?', options:['a house big','a big house','a house bigger','an house big'], answer:1 },
        { id:'en-adj-q4', question:'The superlative of "good" is:', options:['goodest','more good','the most good','the best'], answer:3 },
        { id:'en-adj-q5', question:'"She looks ___" — adjective comes after:', options:['a noun','a linking verb','a subject','an object'], answer:1 },
      ],
    },
    ar: {
      titre:       'الصفة والموصوف — Adjectives in Arabic (A1)',
      cours_nom:   'Arabe',
      langue:      'Arabe',
      niveau:      'A1',
      description: 'Learn how adjectives work in Arabic: they come AFTER the noun, must agree in gender, number and definiteness. Covers masculine/feminine, singular/plural adjective forms and the comparative (أفعل التفضيل).',
      pages: [
        {
          id: 'ar-adj-p1', type: 'intro',
          title: 'مقدمة — الصفة والموصوف',
          content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 Arabic Grammar A1</div>
  <h2 dir="rtl">الصفة والموصوف في العربية</h2>
  <p class="lead">In Arabic, adjectives come <strong>AFTER the noun</strong> and must agree with it in <strong>gender (جنس), number (عدد) and definiteness (تعريف)</strong>.</p>
  <div class="lesson-objectives">
    <h4>🎯 Learning Objectives</h4>
    <ul>
      <li>Place adjectives after the noun: <span dir="rtl">بَيتٌ كَبِيرٌ</span></li>
      <li>Match gender: <span dir="rtl">وَلَدٌ كَبِيرٌ / بِنتٌ كَبِيرَةٌ</span></li>
      <li>Match definiteness: <span dir="rtl">البَيتُ الكَبِيرُ</span></li>
      <li>Form comparatives: <span dir="rtl">أَكبَر، أَجمَل</span></li>
    </ul>
  </div>
</div>`,
        },
        {
          id: 'ar-adj-p2', type: 'lesson',
          title: 'الصفة تتبع الموصوف — Adjective Follows the Noun',
          content: `<h3 dir="rtl">📖 قواعد الصفة</h3>
<div class="summary-table">
<table>
  <thead><tr><th>Rule</th><th>Masculine</th><th>Feminine (add ة)</th><th>English</th></tr></thead>
  <tbody>
    <tr><td>Indefinite</td><td dir="rtl">وَلَدٌ كَبِيرٌ</td><td dir="rtl">بِنتٌ كَبِيرَةٌ</td><td>a big boy / a big girl</td></tr>
    <tr><td>Definite</td><td dir="rtl">الوَلَدُ الكَبِيرُ</td><td dir="rtl">البِنتُ الكَبِيرَةُ</td><td>the big boy / the big girl</td></tr>
  </tbody>
</table>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4>Common Adjectives (م / مؤ)</h4>
  <table>
    <thead><tr><th>Masculine</th><th>Feminine</th><th>Meaning</th></tr></thead>
    <tbody>
      <tr><td dir="rtl">كَبِيرٌ</td><td dir="rtl">كَبِيرَةٌ</td><td>big</td></tr>
      <tr><td dir="rtl">صَغِيرٌ</td><td dir="rtl">صَغِيرَةٌ</td><td>small</td></tr>
      <tr><td dir="rtl">جَمِيلٌ</td><td dir="rtl">جَمِيلَةٌ</td><td>beautiful</td></tr>
      <tr><td dir="rtl">جَدِيدٌ</td><td dir="rtl">جَدِيدَةٌ</td><td>new</td></tr>
      <tr><td dir="rtl">قَدِيمٌ</td><td dir="rtl">قَدِيمَةٌ</td><td>old</td></tr>
      <tr><td dir="rtl">طَوِيلٌ</td><td dir="rtl">طَوِيلَةٌ</td><td>tall / long</td></tr>
    </tbody>
  </table>
</div>`,
        },
        {
          id: 'ar-adj-p3', type: 'lesson',
          title: 'أفعل التفضيل — The Comparative',
          content: `<h3 dir="rtl">📋 أفعل التفضيل (Comparative)</h3>
<p>To form the comparative in Arabic, use the pattern <strong dir="rtl">أَفعَل</strong>:</p>
<table>
  <thead><tr><th>Adjective</th><th>Comparative (أفعل)</th><th>Example</th></tr></thead>
  <tbody>
    <tr><td dir="rtl">كَبِير</td><td dir="rtl"><strong>أَكبَر</strong></td><td dir="rtl">مَكَّة أَكبَر مِن المَدِينَة.</td></tr>
    <tr><td dir="rtl">صَغِير</td><td dir="rtl"><strong>أَصغَر</strong></td><td dir="rtl">هذا البَيت أَصغَر مِن ذَاك.</td></tr>
    <tr><td dir="rtl">جَمِيل</td><td dir="rtl"><strong>أَجمَل</strong></td><td dir="rtl">هذه المَدِينَة أَجمَل.</td></tr>
    <tr><td dir="rtl">طَوِيل</td><td dir="rtl"><strong>أَطوَل</strong></td><td dir="rtl">أَحمَد أَطوَل مِن سَامِي.</td></tr>
  </tbody>
</table>`,
        },
        {
          id: 'ar-adj-p4', type: 'exercises',
          title: 'تمارين — الصفة والموصوف',
          content: `<h3>✏️ Exercises</h3>
<h4>Exercise 1 — Add the correct adjective form</h4>
<ol dir="rtl">
  <li>بَيتٌ ___ (big, masc) → بَيتٌ ___</li>
  <li>مَدرَسَةٌ ___ (new, fem) → مَدرَسَةٌ ___</li>
  <li>الوَلَدُ ___ (tall, def masc) → الوَلَدُ ___</li>
  <li>البِنتُ ___ (beautiful, def fem) → البِنتُ ___</li>
</ol>
<h4>Exercise 2 — Comparative</h4>
<ol dir="rtl">
  <li>الجَمَل أَ___ مِن الحِصَان. (كَبِير)</li>
  <li>هذا الكِتَاب أَ___ مِن ذَاك. (جَدِيد)</li>
</ol>
<h4>Exercise 3 — Translate</h4>
<ol>
  <li>a beautiful new house</li>
  <li>the big school</li>
  <li>Laayoune is bigger than Tarfaya.</li>
</ol>`,
        },
      ],
      exercises: [
        { id:'ar-adj-q1', question:'Where does the adjective go in Arabic?', options:['Before the noun','After the noun','At the end of sentence','Before the verb'], answer:1 },
        { id:'ar-adj-q2', question:'What is the feminine of كَبِيرٌ?', options:['كَبِيرُون','كَبِيرَات','كَبِيرَةٌ','كِبَار'], answer:2 },
        { id:'ar-adj-q3', question:'الوَلَدُ الكَبِيرُ — why does الكَبِير have ال?', options:['Because it is plural','Because the noun is definite','Because it is comparative','Because it is feminine'], answer:1 },
        { id:'ar-adj-q4', question:'The comparative of جَمِيل is:', options:['جَمِيلَة','الجَمِيل','أَجمَل','جَمَالٌ'], answer:2 },
        { id:'ar-adj-q5', question:'How do you say "a new school" in Arabic?', options:['المَدرَسَة الجَدِيدَة','مَدرَسَةٌ جَدِيدَةٌ','جَدِيدَةٌ مَدرَسَةٌ','مَدرَسَةٌ جَدِيدٌ'], answer:1 },
      ],
    },
  },

];

// ════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════
const normaliseTitle = t => (t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');

function courseMatchesTopic(course, topic) {
  const t = normaliseTitle(course.titre || course.title || '');
  return topic.detectFR(t);
}

function titleExists(allCourses, candidateTitle) {
  const n = normaliseTitle(candidateTitle);
  return allCourses.some(c => normaliseTitle(c.titre || c.title || '') === n);
}

function topicAlreadyExists(allCourses, lang, topic) {
  // Check by language + title keyword matching
  const langCourses = allCourses.filter(c =>
    lang === 'Anglais'
      ? ['Anglais','Anglais A1'].includes(c.langue) || ['Anglais','Anglais A1'].includes(c.cours_nom)
      : ['Arabe','ar'].includes(c.langue) || ['Arabe'].includes(c.cours_nom)
  );
  const templ = lang === 'Anglais' ? topic.en : topic.ar;
  // Check exact title match
  if (titleExists(langCourses, templ.titre)) return { found: true, how: 'exact title' };
  // Check by ID keywords
  return { found: false };
}

async function createCourse(pb, courseData, dryRun) {
  const payload = {
    titre:         courseData.titre,
    title:         courseData.titre,
    cours_nom:     courseData.cours_nom,
    langue:        courseData.langue,
    categorie_age: 'Adultes',
    categorie:     courseData.langue === 'Anglais' ? 'anglais' : 'arabe',
    section:       'langues',
    niveau:        courseData.niveau,
    course_type:   'standard',
    description:   courseData.description,
    pages:         JSON.stringify(courseData.pages),
    exercises:     JSON.stringify(courseData.exercises || []),
    prix:          0,
    price:         0,
  };
  if (!dryRun) {
    const rec = await pb.collection('courses').create(payload, { requestKey: null });
    return rec.id;
  }
  return 'DRY_RUN_ID';
}

// ════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════
async function main() {
  console.log('\n🌐 create-trilingual-standard-courses.mjs');
  console.log('═'.repeat(65));
  if (DRY_RUN)   console.log('⚠️  MODE APERÇU — aucune écriture\n');
  if (LIST_ONLY) console.log('📋 Mode liste seulement\n');

  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log(`✅ Connecté à PocketBase (${PB_URL})\n`);

  // Récupérer TOUS les cours
  const allCourses = await pb.collection('courses').getFullList({ requestKey: null });

  // Cours français standard (hors audio)
  const frCourses = allCourses.filter(c =>
    (c.langue === 'Francais' || c.cours_nom === 'Français') &&
    c.course_type !== 'audio'
  );

  console.log(`📚 ${frCourses.length} cours français standard trouvés:\n`);
  frCourses.forEach(c => console.log(`  • ${c.titre} (${c.niveau || '?'})`));
  console.log('');

  if (LIST_ONLY) {
    // Also show full status
    console.log('📊 Statut EN / AR par cours français:\n');
    for (const c of frCourses) {
      const matchedTopic = TOPICS.find(tp => courseMatchesTopic(c, tp));
      const enStatus = matchedTopic ? topicAlreadyExists(allCourses, 'Anglais', matchedTopic) : null;
      const arStatus = matchedTopic ? topicAlreadyExists(allCourses, 'Arabe', matchedTopic) : null;
      const enIcon = !matchedTopic ? '❓' : enStatus.found ? '✅' : '❌';
      const arIcon = !matchedTopic ? '❓' : arStatus.found ? '✅' : '❌';
      console.log(`  ${enIcon} EN | ${arIcon} AR | ${c.titre}`);
      if (!matchedTopic) console.log(`         ⚠️  Topic non reconnu — à traiter manuellement`);
    }
    console.log('\n✅ = existe déjà  ❌ = à créer  ❓ = topic non reconnu dans ce script\n');
    return;
  }

  // Créer les cours manquants
  let created = 0, skipped = 0;

  for (const topic of TOPICS) {
    const frMatch = frCourses.find(c => courseMatchesTopic(c, topic));

    // Check EN
    const enCheck = topicAlreadyExists(allCourses, 'Anglais', topic);
    if (enCheck.found) {
      console.log(`  ✅ EN existe : "${topic.en.titre}" (${enCheck.how})`);
      skipped++;
    } else {
      console.log(`  ➕ Création EN : "${topic.en.titre}"`);
      if (!DRY_RUN) {
        const id = await createCourse(pb, topic.en, false);
        console.log(`     ✅ Créé (id: ${id})\n`);
      } else {
        console.log(`     ✅ (simulation)\n`);
      }
      created++;
    }

    // Check AR
    const arCheck = topicAlreadyExists(allCourses, 'Arabe', topic);
    if (arCheck.found) {
      console.log(`  ✅ AR existe : "${topic.ar.titre}" (${arCheck.how})`);
      skipped++;
    } else {
      console.log(`  ➕ Création AR : "${topic.ar.titre}"`);
      if (!DRY_RUN) {
        const id = await createCourse(pb, topic.ar, false);
        console.log(`     ✅ Créé (id: ${id})\n`);
      } else {
        console.log(`     ✅ (simulation)\n`);
      }
      created++;
    }
  }

  console.log('═'.repeat(65));
  console.log(`📊 Résultats : ${created} cours créés · ${skipped} déjà existants`);
  if (DRY_RUN) console.log('⚠️  Relancez sans --dry-run pour créer réellement');
  console.log('');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
