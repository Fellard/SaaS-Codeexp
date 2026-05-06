/**
 * create-missing-6-en-ar-courses.mjs
 * Crée les 6 cours EN + 6 cours AR standards manquants :
 *   Impératif · Hypothèse/futur · Articles · Phrase interrogative
 *   Registres de langue · Accord des adjectifs
 *
 * Usage :  cd apps/api && node create-missing-6-en-ar-courses.mjs
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

// ════════════════════════════════════════════════════════════════════
// COURS ANGLAIS
// ════════════════════════════════════════════════════════════════════
const EN_COURSES = [

// ── 1. The Imperative ─────────────────────────────────────────────
{
  titre: 'The Imperative in English — Orders & Instructions (A1)',
  cours_nom: 'Anglais', langue: 'Anglais', section: 'langues',
  categorie: 'anglais', categorie_age: 'Adultes', niveau: 'A1',
  prix: 0, duree: 35, course_type: 'standard',
  description: 'Master the imperative mood in English: positive and negative commands, directions, advice and polite requests. 3 lessons + 10 interactive exercises.',
  description_fr: 'Maîtrisez l\'impératif en anglais : ordres, instructions, conseils et demandes polies. 3 leçons + 10 exercices interactifs.',
  description_en: 'Master the imperative mood in English: positive and negative commands, directions, advice and polite requests.',
  description_ar: 'أتقن صيغة الأمر في اللغة الإنجليزية: الأوامر، التعليمات، النصائح والطلبات المؤدبة.',
  title_fr: 'L\'impératif en anglais — Ordres et instructions (A1)',
  title_en: 'The Imperative in English — Orders & Instructions (A1)',
  title_ar: 'فعل الأمر في اللغة الإنجليزية — الأوامر والتعليمات (A1)',
  pages: [
    {
      id: 'en-imp2-p1', type: 'intro',
      title: 'Introduction — The Imperative',
      content: `<div class="lesson-intro">
<div class="lesson-badge">📚 English Grammar — Level A1</div>
<h2>The Imperative in English</h2>
<p class="lead">The imperative is used to give <strong>orders, instructions, advice or directions</strong>. It is very simple to form!</p>
<div class="lesson-objectives">
  <h4>🎯 Learning Objectives</h4>
  <ul>
    <li>Form <strong>positive imperatives</strong>: Open the door!</li>
    <li>Form <strong>negative imperatives</strong>: Don't run!</li>
    <li>Use imperatives for <strong>directions</strong>: Turn left at the corner.</li>
    <li>Make <strong>polite requests</strong>: Please sit down.</li>
  </ul>
</div>
<div class="lesson-highlight"><strong>Key point:</strong> The imperative uses the <strong>base form</strong> of the verb — no subject, no conjugation!</div>
</div>`
    },
    {
      id: 'en-imp2-p2', type: 'lesson',
      title: 'Forming the Imperative',
      content: `<h3>📖 How to form the imperative</h3>
<div class="rule-box">
  <div class="rule-icon">✅</div>
  <div>
    <strong>Positive — base verb (no "to")</strong>
    <table style="margin-top:8px;width:100%">
      <thead><tr><th>Infinitive</th><th>Imperative</th><th>Example</th></tr></thead>
      <tbody>
        <tr><td>to open</td><td><strong>Open</strong></td><td>Open your book!</td></tr>
        <tr><td>to sit</td><td><strong>Sit</strong></td><td>Sit down, please.</td></tr>
        <tr><td>to listen</td><td><strong>Listen</strong></td><td>Listen carefully!</td></tr>
        <tr><td>to write</td><td><strong>Write</strong></td><td>Write your name.</td></tr>
        <tr><td>to be</td><td><strong>Be</strong></td><td>Be quiet!</td></tr>
      </tbody>
    </table>
  </div>
</div>
<div class="rule-box" style="margin-top:1rem">
  <div class="rule-icon">❌</div>
  <div>
    <strong>Negative — Don't + base verb</strong>
    <table style="margin-top:8px;width:100%">
      <thead><tr><th>Positive</th><th>Negative</th></tr></thead>
      <tbody>
        <tr><td>Open the window.</td><td><strong>Don't</strong> open the window.</td></tr>
        <tr><td>Run in the corridor.</td><td><strong>Don't</strong> run in the corridor.</td></tr>
        <tr><td>Be late.</td><td><strong>Don't</strong> be late.</td></tr>
        <tr><td>Touch that.</td><td><strong>Don't</strong> touch that.</td></tr>
      </tbody>
    </table>
  </div>
</div>
<div class="rule-box" style="margin-top:1rem">
  <div class="rule-icon">👥</div>
  <div>
    <strong>Let's — suggestions (including yourself)</strong>
    <ul style="margin-top:8px">
      <li><strong>Let's</strong> go! &nbsp;(= Let us go)</li>
      <li><strong>Let's</strong> start the lesson.</li>
      <li><strong>Let's not</strong> be late.</li>
    </ul>
  </div>
</div>`
    },
    {
      id: 'en-imp2-p3', type: 'lesson',
      title: 'Uses of the Imperative',
      content: `<h3>📋 Common Uses of the Imperative</h3>
<table>
  <thead><tr><th>Situation</th><th>Examples</th></tr></thead>
  <tbody>
    <tr><td>🏫 Classroom</td><td>Open your books. Listen! Don't talk. Write your answers.</td></tr>
    <tr><td>🗺️ Directions</td><td>Turn left. Go straight. Stop at the lights. Take the first right.</td></tr>
    <tr><td>🍳 Recipes</td><td>Mix the flour. Add two eggs. Bake for 30 minutes.</td></tr>
    <tr><td>⚠️ Warning signs</td><td>Stop! Keep off the grass. Do not enter. Handle with care.</td></tr>
    <tr><td>💬 Polite requests</td><td>Please help me. Have a seat. Feel free to ask.</td></tr>
    <tr><td>💪 Encouragement</td><td>Try again! Don't give up! Keep going!</td></tr>
  </tbody>
</table>
<div class="info-box" style="margin-top:1rem">
  💡 <strong>Make it polite:</strong> Add <em>please</em> at the start or end.<br/>
  &nbsp;&nbsp;&nbsp;<em>Please close the door.</em> / <em>Close the door, please.</em>
</div>
<div class="lesson-highlight" style="margin-top:1rem">✅ Now complete the exercises to practise the imperative!</div>`
    }
  ],
  exercises: [
    { id:'en-imp-q1', question:'___ the door, please. (to close)', options:['Closes','Closing','Close','To close'], answer:2 },
    { id:'en-imp-q2', question:'___ in the classroom! (Don\'t / to run)', options:['Run','Don\'t run','Runs','Not run'], answer:1 },
    { id:'en-imp-q3', question:'___ left at the traffic lights. (to turn)', options:['Turning','Turns','Turn','To turn'], answer:2 },
    { id:'en-imp-q4', question:'___ go to the cinema tonight! (suggestion)', options:['Let\'s','Let us to','Lets','Let'], answer:0 },
    { id:'en-imp-q5', question:'"___ your homework!" said the teacher.', options:['Do','Does','Doing','To do'], answer:0 },
    { id:'en-imp-q6', question:'___ late for the meeting!', options:['Don\'t be','Not be','Be not','No be'], answer:0 },
    { id:'en-imp-q7', question:'___ straight on and take the second street on the right.', options:['Going','Goes','To go','Go'], answer:3 },
    { id:'en-imp-q8', question:'___ quiet! The baby is sleeping.', options:['Being','Be','Is','Are'], answer:1 },
    { id:'en-imp-q9', question:'How do you make the negative imperative?', options:['Not + verb','No + verb','Don\'t + base verb','Doesn\'t + verb'], answer:2 },
    { id:'en-imp-q10', question:'Which sentence is a correct imperative?', options:['You open the window.','Open the window!','Opens the window.','Opening the window.'], answer:1 },
  ]
},

// ── 2. Future Hypothesis — First Conditional ───────────────────────
{
  titre: 'Future Hypothesis in English — First Conditional (A1)',
  cours_nom: 'Anglais', langue: 'Anglais', section: 'langues',
  categorie: 'anglais', categorie_age: 'Adultes', niveau: 'A1',
  prix: 0, duree: 35, course_type: 'standard',
  description: 'Learn to express future possibilities and hypotheses in English using the first conditional: If + present simple → will + infinitive.',
  description_fr: 'Apprenez à exprimer les hypothèses sur le futur en anglais avec le premier conditionnel.',
  description_en: 'Learn to express future possibilities using the first conditional: If + present → will + verb.',
  description_ar: 'تعلم التعبير عن الفرضيات المستقبلية بالجملة الشرطية الأولى في الإنجليزية.',
  title_fr: 'L\'hypothèse sur le futur en anglais — Premier conditionnel (A1)',
  title_en: 'Future Hypothesis in English — First Conditional (A1)',
  title_ar: 'الفرضية المستقبلية في الإنجليزية — الشرط الأول (A1)',
  pages: [
    {
      id: 'en-cond2-p1', type: 'intro',
      title: 'Introduction — Future Hypothesis',
      content: `<div class="lesson-intro">
<div class="lesson-badge">📚 English Grammar — Level A1</div>
<h2>Future Hypothesis — The First Conditional</h2>
<p class="lead">When we want to talk about a <strong>realistic future possibility</strong>, we use the <strong>first conditional</strong>.</p>
<div class="lesson-objectives">
  <h4>🎯 Learning Objectives</h4>
  <ul>
    <li>Understand the structure <strong>If + present simple → will + infinitive</strong></li>
    <li>Talk about <strong>future possibilities</strong>: If it rains, I will stay home.</li>
    <li>Use <strong>unless</strong> as an alternative to "if not"</li>
    <li>Know when to use <strong>will</strong> vs <strong>going to</strong></li>
  </ul>
</div>
<div class="lesson-highlight"><strong>Key formula:</strong> If + present simple, will + base verb</div>
</div>`
    },
    {
      id: 'en-cond2-p2', type: 'lesson',
      title: 'The First Conditional — Structure',
      content: `<h3>📖 First Conditional — Structure</h3>
<div class="rule-box">
  <div class="rule-icon">🔮</div>
  <div>
    <strong>If + present simple → will + base verb</strong>
    <ul style="margin-top:8px">
      <li>If it <strong>rains</strong>, I <strong>will stay</strong> home.</li>
      <li>If she <strong>studies</strong> hard, she <strong>will pass</strong> the exam.</li>
      <li>If you <strong>call</strong> me, I <strong>will answer</strong>.</li>
    </ul>
  </div>
</div>
<div class="compare-box" style="margin-top:1rem">
  <div class="compare-item good">✅ If it <strong>rains</strong>, I <strong>will</strong> take an umbrella.</div>
  <div class="compare-item bad">❌ If it <strong>will rain</strong>, I will take an umbrella.</div>
</div>
<div class="info-box" style="margin-top:1rem">
  ⚠️ <strong>Important:</strong> Never use "will" in the IF clause!<br/>
  The if-clause always uses the <strong>present simple</strong>.
</div>
<div class="rule-box" style="margin-top:1rem">
  <div class="rule-icon">🔄</div>
  <div>
    <strong>You can reverse the order:</strong>
    <ul style="margin-top:8px">
      <li>If it rains, <em>I will stay home.</em></li>
      <li>I will stay home <em>if it rains.</em> (no comma needed)</li>
    </ul>
  </div>
</div>
<div class="rule-box" style="margin-top:1rem">
  <div class="rule-icon">🚫</div>
  <div>
    <strong>Unless = if not</strong>
    <ul style="margin-top:8px">
      <li><strong>Unless</strong> it rains, we will go out. (= If it does NOT rain...)</li>
      <li><strong>Unless</strong> you study, you will fail.</li>
    </ul>
  </div>
</div>`
    },
    {
      id: 'en-cond2-p3', type: 'lesson',
      title: 'Will vs Going to',
      content: `<h3>📖 Will vs Going to</h3>
<div class="rule-box">
  <div class="rule-icon">🔵</div>
  <div>
    <strong>WILL — spontaneous decision or prediction</strong>
    <ul style="margin-top:8px">
      <li>I think it <strong>will</strong> rain tomorrow. (prediction)</li>
      <li>I <strong>will</strong> help you! (spontaneous offer)</li>
      <li>If you ask her, she <strong>will</strong> say yes.</li>
    </ul>
  </div>
</div>
<div class="rule-box" style="margin-top:1rem">
  <div class="rule-icon">🟢</div>
  <div>
    <strong>GOING TO — planned intention or evidence</strong>
    <ul style="margin-top:8px">
      <li>I <strong>am going to</strong> study tonight. (already planned)</li>
      <li>Look at those clouds — it <strong>is going to</strong> rain! (evidence)</li>
    </ul>
  </div>
</div>
<div class="compare-box" style="margin-top:1rem">
  <div class="compare-item good">✅ If the weather is good, we <strong>will</strong> go to the beach.</div>
  <div class="compare-item good">✅ We <strong>are going to</strong> go to the beach — we booked it last week.</div>
</div>
<div class="lesson-highlight" style="margin-top:1rem">✅ Now complete the exercises!</div>`
    }
  ],
  exercises: [
    { id:'en-cond-q1', question:'If it ___ tomorrow, we will cancel the picnic.', options:['will rain','rains','rained','is raining'], answer:1 },
    { id:'en-cond-q2', question:'If you eat too much, you ___ feel sick.', options:['will','would','are','be'], answer:0 },
    { id:'en-cond-q3', question:'She ___ the bus if she doesn\'t hurry.', options:['miss','missed','will miss','would miss'], answer:2 },
    { id:'en-cond-q4', question:'___ you study hard, you will pass the exam.', options:['Unless','If not','Without','Despite'], answer:0 },
    { id:'en-cond-q5', question:'Which sentence is a correct first conditional?', options:['If it will rain, I stay home.','If it rains, I will stay home.','If it rained, I will stay home.','If it rains, I stayed home.'], answer:1 },
    { id:'en-cond-q6', question:'If she ___ (to call), I will answer immediately.', options:['calls','will call','is calling','called'], answer:0 },
    { id:'en-cond-q7', question:'We can reverse the order: "I will help you if you ___."', options:['will ask','asked','ask','are asking'], answer:2 },
    { id:'en-cond-q8', question:'"Unless it rains" means:', options:['If it rains','If it doesn\'t rain','Even if it rains','Before it rains'], answer:1 },
    { id:'en-cond-q9', question:'Look at those clouds! It ___ rain. (evidence = visible sign)', options:['will','is going to','would','may'], answer:1 },
    { id:'en-cond-q10', question:'Spontaneous decision: "I ___ help you carry that bag!"', options:['am going to','will','would','should'], answer:1 },
  ]
},

// ── 3. English Articles ─────────────────────────────────────────────
{
  titre: 'English Articles — a, an, the, some, any (A1)',
  cours_nom: 'Anglais', langue: 'Anglais', section: 'langues',
  categorie: 'anglais', categorie_age: 'Adultes', niveau: 'A1',
  prix: 0, duree: 40, course_type: 'standard',
  description: 'Master English articles: indefinite (a/an), definite (the), zero article, and quantifiers some/any. 4 lessons with clear rules and 10 exercises.',
  description_fr: 'Maîtrisez les articles anglais : indéfinis (a/an), défini (the), article zéro, et quantifieurs some/any.',
  description_en: 'Master English articles: a/an, the, zero article, and some/any with clear rules and exercises.',
  description_ar: 'أتقن أدوات التعريف والتنكير في الإنجليزية: a/an, the, ومقدار some/any.',
  title_fr: 'Les articles anglais — a, an, the, some, any (A1)',
  title_en: 'English Articles — a, an, the, some, any (A1)',
  title_ar: 'أدوات التعريف والتنكير الإنجليزية — a, an, the, some, any (A1)',
  pages: [
    {
      id: 'en-art-p1', type: 'intro',
      title: 'Introduction — English Articles',
      content: `<div class="lesson-intro">
<div class="lesson-badge">📚 English Grammar — Level A1</div>
<h2>English Articles: a, an, the, some, any</h2>
<p class="lead">English has two types of articles: <strong>indefinite</strong> (a/an) and <strong>definite</strong> (the). We also use <strong>some</strong> and <strong>any</strong> for quantities.</p>
<div class="lesson-objectives">
  <h4>🎯 Learning Objectives</h4>
  <ul>
    <li>Use <strong>a / an</strong> for non-specific nouns</li>
    <li>Use <strong>the</strong> for specific, known nouns</li>
    <li>Know when to use <strong>no article</strong> (zero article)</li>
    <li>Use <strong>some</strong> and <strong>any</strong> for quantities</li>
  </ul>
</div>
</div>`
    },
    {
      id: 'en-art-p2', type: 'lesson',
      title: 'Indefinite Articles — A / AN',
      content: `<h3>📖 A / AN — Indefinite Articles</h3>
<div class="rule-box">
  <div class="rule-icon">📝</div>
  <div>
    <strong>Use A before consonant sounds:</strong>
    <ul style="margin-top:8px">
      <li><strong>a</strong> book · <strong>a</strong> car · <strong>a</strong> university (starts with /j/ sound)</li>
    </ul>
    <strong style="margin-top:12px;display:block">Use AN before vowel sounds (a, e, i, o, u):</strong>
    <ul style="margin-top:8px">
      <li><strong>an</strong> apple · <strong>an</strong> orange · <strong>an</strong> hour (silent h → vowel sound)</li>
    </ul>
  </div>
</div>
<div class="compare-box" style="margin-top:1rem">
  <div class="compare-item good">✅ I have <strong>a</strong> dog.</div>
  <div class="compare-item good">✅ She is <strong>an</strong> engineer.</div>
  <div class="compare-item bad">❌ She is <strong>a</strong> engineer.</div>
</div>
<div class="info-box" style="margin-top:1rem">💡 Use A/AN with <strong>singular countable nouns</strong> mentioned for the first time or when the identity is not known.</div>`
    },
    {
      id: 'en-art-p3', type: 'lesson',
      title: 'Definite Article — THE & Zero Article',
      content: `<h3>📖 THE — Definite Article</h3>
<div class="rule-box">
  <div class="rule-icon">🎯</div>
  <div>
    <strong>Use THE when the noun is specific or already known:</strong>
    <ul style="margin-top:8px">
      <li>I saw a film. <strong>The</strong> film was great. (second mention)</li>
      <li>Please close <strong>the</strong> door. (specific door we know)</li>
      <li><strong>The</strong> sun rises in the east. (unique thing)</li>
      <li><strong>The</strong> Eiffel Tower, <strong>the</strong> Thames. (unique places)</li>
    </ul>
  </div>
</div>
<div class="rule-box" style="margin-top:1rem">
  <div class="rule-icon">🚫</div>
  <div>
    <strong>Zero Article — no article needed:</strong>
    <ul style="margin-top:8px">
      <li>Languages: I speak <strong>English</strong>.</li>
      <li>Meals: We had <strong>breakfast</strong>.</li>
      <li>Sports: She plays <strong>tennis</strong>.</li>
      <li>Countries (most): <strong>France</strong>, <strong>England</strong> (but: <em>the</em> UK, <em>the</em> USA)</li>
    </ul>
  </div>
</div>
<div class="rule-box" style="margin-top:1rem">
  <div class="rule-icon">📦</div>
  <div>
    <strong>SOME / ANY for quantities:</strong>
    <ul style="margin-top:8px">
      <li><strong>Some</strong> → affirmative: I have <em>some</em> water.</li>
      <li><strong>Any</strong> → questions & negatives: Do you have <em>any</em> milk? I don't have <em>any</em>.</li>
    </ul>
  </div>
</div>`
    },
    {
      id: 'en-art-p4', type: 'lesson',
      title: 'Summary Table — All Articles',
      content: `<h3>📊 Summary — English Articles</h3>
<table>
  <thead><tr><th>Article</th><th>Use</th><th>Example</th></tr></thead>
  <tbody>
    <tr><td><strong>A</strong></td><td>First mention, consonant sound, one</td><td>I have <strong>a</strong> cat.</td></tr>
    <tr><td><strong>AN</strong></td><td>First mention, vowel sound, one</td><td>She is <strong>an</strong> artist.</td></tr>
    <tr><td><strong>THE</strong></td><td>Known/specific, second mention, unique</td><td><strong>The</strong> cat is on the table.</td></tr>
    <tr><td><strong>∅ (none)</strong></td><td>Languages, meals, sports, most countries</td><td>I play <strong>∅</strong> football.</td></tr>
    <tr><td><strong>SOME</strong></td><td>Quantity, affirmative</td><td>I need <strong>some</strong> help.</td></tr>
    <tr><td><strong>ANY</strong></td><td>Quantity, question/negative</td><td>Is there <strong>any</strong> bread left?</td></tr>
  </tbody>
</table>
<div class="lesson-highlight" style="margin-top:1rem">✅ Complete the exercises to consolidate your knowledge!</div>`
    }
  ],
  exercises: [
    { id:'en-art-q1', question:'I saw ___ elephant at the zoo.', options:['a','an','the','some'], answer:1 },
    { id:'en-art-q2', question:'Please close ___ window — it\'s cold!', options:['a','an','the','∅'], answer:2 },
    { id:'en-art-q3', question:'She is ___ university student. (u → /j/ sound)', options:['an','a','the','∅'], answer:1 },
    { id:'en-art-q4', question:'I speak ___ French very well.', options:['the','a','an','∅'], answer:3 },
    { id:'en-art-q5', question:'There is ___ milk in the fridge. (some or any?)', options:['some','any','a','the'], answer:0 },
    { id:'en-art-q6', question:'Do you have ___ questions?', options:['some','any','a','the'], answer:1 },
    { id:'en-art-q7', question:'I bought a book yesterday. ___ book is very interesting.', options:['A','An','The','Some'], answer:2 },
    { id:'en-art-q8', question:'___ sun is a star.', options:['A','An','The','∅'], answer:2 },
    { id:'en-art-q9', question:'We had ___ dinner at 8 pm. (meal → zero article)', options:['a','an','the','∅'], answer:3 },
    { id:'en-art-q10', question:'She lives in ___ United Kingdom.', options:['∅','a','an','the'], answer:3 },
  ]
},

// ── 4. Questions in English ─────────────────────────────────────────
{
  titre: 'Questions in English — How to Ask (A0/A1)',
  cours_nom: 'Anglais', langue: 'Anglais', section: 'langues',
  categorie: 'anglais', categorie_age: 'Adultes', niveau: 'A1',
  prix: 0, duree: 35, course_type: 'standard',
  description: 'Learn all question types in English: yes/no questions, wh-questions, and tag questions. Clear rules with examples and 10 exercises.',
  description_fr: 'Apprenez tous les types de questions en anglais : oui/non, mots interrogatifs, questions tags.',
  description_en: 'Master all question types in English: yes/no questions, wh-questions and tag questions.',
  description_ar: 'تعلم جميع أنواع الأسئلة في اللغة الإنجليزية: أسئلة نعم/لا، وأسئلة الاستفهام.',
  title_fr: 'Les questions en anglais — Comment poser une question (A0/A1)',
  title_en: 'Questions in English — How to Ask (A0/A1)',
  title_ar: 'الأسئلة في اللغة الإنجليزية — كيف تسأل (A0/A1)',
  pages: [
    {
      id: 'en-q-p1', type: 'intro',
      title: 'Introduction — Asking Questions in English',
      content: `<div class="lesson-intro">
<div class="lesson-badge">📚 English Grammar — Level A0/A1</div>
<h2>Questions in English</h2>
<p class="lead">There are <strong>three main types</strong> of questions in English. Mastering them allows you to have real conversations!</p>
<div class="lesson-objectives">
  <h4>🎯 Learning Objectives</h4>
  <ul>
    <li>Form <strong>Yes/No questions</strong>: Do you like pizza?</li>
    <li>Form <strong>Wh-questions</strong>: Where do you live?</li>
    <li>Use <strong>question words</strong>: Who, What, Where, When, Why, How</li>
    <li>Use <strong>tag questions</strong>: It's cold, isn't it?</li>
  </ul>
</div>
</div>`
    },
    {
      id: 'en-q-p2', type: 'lesson',
      title: 'Yes/No Questions',
      content: `<h3>📖 Yes/No Questions</h3>
<div class="rule-box">
  <div class="rule-icon">❓</div>
  <div>
    <strong>With DO/DOES (present simple):</strong>
    <ul style="margin-top:8px">
      <li><strong>Do</strong> you like coffee? — Yes, I do. / No, I don't.</li>
      <li><strong>Does</strong> she speak French? — Yes, she does.</li>
    </ul>
    <strong style="margin-top:12px;display:block">With auxiliary verbs (am/is/are/was/were/will):</strong>
    <ul style="margin-top:8px">
      <li><strong>Are</strong> you a student? — Yes, I am.</li>
      <li><strong>Will</strong> he come? — No, he won't.</li>
      <li><strong>Is</strong> it raining? — Yes, it is.</li>
    </ul>
  </div>
</div>
<div class="compare-box" style="margin-top:1rem">
  <div class="compare-item good">✅ <strong>Do</strong> you like music?</div>
  <div class="compare-item bad">❌ You like music?</div>
</div>`
    },
    {
      id: 'en-q-p3', type: 'lesson',
      title: 'Wh-Questions & Tag Questions',
      content: `<h3>📖 Wh-Questions</h3>
<div class="rule-box">
  <div class="rule-icon">🔤</div>
  <div>
    <strong>Question word + auxiliary + subject + verb</strong>
    <table style="margin-top:8px;width:100%">
      <thead><tr><th>Word</th><th>Asks about</th><th>Example</th></tr></thead>
      <tbody>
        <tr><td><strong>What</strong></td><td>Things</td><td>What do you do? (job)</td></tr>
        <tr><td><strong>Who</strong></td><td>People</td><td>Who is your teacher?</td></tr>
        <tr><td><strong>Where</strong></td><td>Place</td><td>Where do you live?</td></tr>
        <tr><td><strong>When</strong></td><td>Time</td><td>When does the film start?</td></tr>
        <tr><td><strong>Why</strong></td><td>Reason</td><td>Why are you late?</td></tr>
        <tr><td><strong>How</strong></td><td>Manner/quantity</td><td>How old are you?</td></tr>
        <tr><td><strong>Which</strong></td><td>Choice</td><td>Which colour do you prefer?</td></tr>
      </tbody>
    </table>
  </div>
</div>
<div class="rule-box" style="margin-top:1rem">
  <div class="rule-icon">🏷️</div>
  <div>
    <strong>Tag Questions — checking information</strong>
    <ul style="margin-top:8px">
      <li>It's cold, <strong>isn't it</strong>? (positive → negative tag)</li>
      <li>You don't like fish, <strong>do you</strong>? (negative → positive tag)</li>
      <li>She works here, <strong>doesn't she</strong>?</li>
    </ul>
  </div>
</div>
<div class="lesson-highlight" style="margin-top:1rem">✅ Now complete the exercises!</div>`
    }
  ],
  exercises: [
    { id:'en-q-q1', question:'___ you like chocolate?', options:['Are','Do','Does','Is'], answer:1 },
    { id:'en-q-q2', question:'___ does she live? — In London.', options:['What','Who','Where','When'], answer:2 },
    { id:'en-q-q3', question:'___ is your name? — My name is Tom.', options:['Where','What','Who','Why'], answer:1 },
    { id:'en-q-q4', question:'___ old are you? — I am 25.', options:['What','How','Who','Which'], answer:1 },
    { id:'en-q-q5', question:'___ the film start? — At 8 pm.', options:['Do','Does','When does','When do'], answer:2 },
    { id:'en-q-q6', question:'It\'s a beautiful day, ___ ?', options:['is it','isn\'t it','doesn\'t it','wasn\'t it'], answer:1 },
    { id:'en-q-q7', question:'___ she speak English? — Yes, she does.', options:['Do','Does','Is','Are'], answer:1 },
    { id:'en-q-q8', question:'___ are you late? — Because I missed the bus.', options:['What','When','Why','Where'], answer:2 },
    { id:'en-q-q9', question:'You don\'t like vegetables, ___ ?', options:['don\'t you','do you','doesn\'t you','are you'], answer:1 },
    { id:'en-q-q10', question:'___ colour do you prefer, blue or green?', options:['What','Who','Which','How'], answer:2 },
  ]
},

// ── 5. Formal vs Informal English ──────────────────────────────────
{
  titre: 'Formal & Informal English — Language Registers (A1)',
  cours_nom: 'Anglais', langue: 'Anglais', section: 'langues',
  categorie: 'anglais', categorie_age: 'Adultes', niveau: 'A1',
  prix: 0, duree: 35, course_type: 'standard',
  description: 'Understand the difference between informal, neutral and formal English. Learn when and how to switch registers in speaking and writing.',
  description_fr: 'Comprenez la différence entre l\'anglais familier, courant et soutenu. Apprenez à adapter votre registre.',
  description_en: 'Understand informal, neutral and formal English registers and when to use each one.',
  description_ar: 'افهم الفرق بين مستويات اللغة الإنجليزية: العامية، العادية، والرسمية.',
  title_fr: 'Anglais formel et informel — Registres de langue (A1)',
  title_en: 'Formal & Informal English — Language Registers (A1)',
  title_ar: 'الإنجليزية الرسمية وغير الرسمية — مستويات اللغة (A1)',
  pages: [
    {
      id: 'en-reg-p1', type: 'intro',
      title: 'Introduction — Language Registers',
      content: `<div class="lesson-intro">
<div class="lesson-badge">📚 English Communication — Level A1</div>
<h2>Formal & Informal English</h2>
<p class="lead">We do not speak the same way in all situations. With friends we are casual; at work or in writing we are more formal.</p>
<div class="lesson-objectives">
  <h4>🎯 Learning Objectives</h4>
  <ul>
    <li>Recognise <strong>informal</strong> language (friends, social media)</li>
    <li>Use <strong>neutral</strong> language (everyday, universal)</li>
    <li>Use <strong>formal</strong> language (work emails, official letters)</li>
    <li>Adapt your English to the right <strong>context</strong></li>
  </ul>
</div>
</div>`
    },
    {
      id: 'en-reg-p2', type: 'lesson',
      title: 'Informal English',
      content: `<h3>📖 Informal English — Casual & Spoken</h3>
<div class="rule-box">
  <div class="rule-icon">💬</div>
  <div>
    <strong>Used with:</strong> friends, family, social media, text messages<br/>
    <strong>Features:</strong> contractions, slang, short sentences, emoji
    <table style="margin-top:12px;width:100%">
      <thead><tr><th>Informal</th><th>Formal equivalent</th></tr></thead>
      <tbody>
        <tr><td>Hey! What's up?</td><td>Hello! How are you?</td></tr>
        <tr><td>Can't make it tonight.</td><td>I am unable to attend this evening.</td></tr>
        <tr><td>Gonna, wanna, gotta</td><td>Going to, want to, have to</td></tr>
        <tr><td>Yeah / Nah</td><td>Yes / No</td></tr>
        <tr><td>Thanks a lot!</td><td>Thank you very much.</td></tr>
        <tr><td>ASAP</td><td>As soon as possible</td></tr>
      </tbody>
    </table>
  </div>
</div>`
    },
    {
      id: 'en-reg-p3', type: 'lesson',
      title: 'Neutral & Formal English',
      content: `<h3>📖 Neutral & Formal English</h3>
<div class="rule-box">
  <div class="rule-icon">🟡</div>
  <div>
    <strong>Neutral English</strong> — everyday, understood by everyone
    <ul style="margin-top:8px">
      <li>Hello! How are you? — I'm fine, thank you.</li>
      <li>I can't come tonight, I'm sorry.</li>
      <li>Could you help me, please?</li>
    </ul>
  </div>
</div>
<div class="rule-box" style="margin-top:1rem">
  <div class="rule-icon">👔</div>
  <div>
    <strong>Formal English</strong> — professional emails, letters, presentations
    <table style="margin-top:8px;width:100%">
      <thead><tr><th>Formal expression</th><th>Use</th></tr></thead>
      <tbody>
        <tr><td>Dear Mr/Ms [Name],</td><td>Opening a formal letter</td></tr>
        <tr><td>I am writing to enquire about...</td><td>Stating purpose</td></tr>
        <tr><td>I would be grateful if you could...</td><td>Polite request</td></tr>
        <tr><td>Please do not hesitate to contact me.</td><td>Closing offer</td></tr>
        <tr><td>Yours sincerely / Yours faithfully,</td><td>Letter closing</td></tr>
      </tbody>
    </table>
  </div>
</div>
<div class="compare-box" style="margin-top:1rem">
  <div class="compare-item good">📱 Informal: Hey! Can u send me the file?</div>
  <div class="compare-item good">📧 Formal: Dear John, Could you please send me the document?</div>
</div>
<div class="lesson-highlight" style="margin-top:1rem">✅ Now complete the exercises!</div>`
    }
  ],
  exercises: [
    { id:'en-reg-q1', question:'Which is the INFORMAL way to say "I cannot attend"?', options:['I am unable to attend.','I can\'t make it.','I would not be able to come.','I regret I am unavailable.'], answer:1 },
    { id:'en-reg-q2', question:'How do you open a formal email?', options:['Hey John!','What\'s up, John?','Dear Mr Smith,','Yo John,'], answer:2 },
    { id:'en-reg-q3', question:'"Gonna" is the informal form of:', options:['gone to','going to','got to','been to'], answer:1 },
    { id:'en-reg-q4', question:'Which sentence is FORMAL?', options:['Thanks a lot!','Cheers!','Thank you very much.','Thx!'], answer:2 },
    { id:'en-reg-q5', question:'How do you close a formal letter?', options:['See ya!','Bye!','Yours sincerely,','Later!'], answer:2 },
    { id:'en-reg-q6', question:'"Could you please send me the report?" is:', options:['informal','neutral','formal','slang'], answer:2 },
    { id:'en-reg-q7', question:'"Yeah, no worries!" is which register?', options:['formal','neutral','informal','academic'], answer:2 },
    { id:'en-reg-q8', question:'In a formal email, which phrase is correct?', options:['Wanna meet?','I was wondering if we could meet.','Let\'s catch up?','U free?'], answer:1 },
    { id:'en-reg-q9', question:'"I would be grateful if you could..." is used in:', options:['text messages','formal writing','social media','casual conversation'], answer:1 },
    { id:'en-reg-q10', question:'Which is the NEUTRAL way to ask for help?', options:['Help me!','Could you help me, please?','I would be most grateful for your assistance.','Gimme a hand!'], answer:1 },
  ]
},

// ── 6. Adjectives in English ────────────────────────────────────────
{
  titre: 'Adjectives in English — Position & Comparison (A1)',
  cours_nom: 'Anglais', langue: 'Anglais', section: 'langues',
  categorie: 'anglais', categorie_age: 'Adultes', niveau: 'A1',
  prix: 0, duree: 35, course_type: 'standard',
  description: 'Master adjectives in English: position before nouns, no agreement, comparative and superlative forms. 4 lessons + 10 exercises.',
  description_fr: 'Maîtrisez les adjectifs en anglais : position, invariabilité, comparatif et superlatif.',
  description_en: 'Master English adjectives: position, no agreement, comparatives and superlatives.',
  description_ar: 'أتقن الصفات في اللغة الإنجليزية: موضعها، عدم التوافق، والتفضيل والتفضيل الأعلى.',
  title_fr: 'Les adjectifs en anglais — Position et comparaison (A1)',
  title_en: 'Adjectives in English — Position & Comparison (A1)',
  title_ar: 'الصفات في اللغة الإنجليزية — الموضع والمقارنة (A1)',
  pages: [
    {
      id: 'en-adj-p1', type: 'intro',
      title: 'Introduction — Adjectives in English',
      content: `<div class="lesson-intro">
<div class="lesson-badge">📚 English Grammar — Level A1</div>
<h2>Adjectives in English</h2>
<p class="lead">Adjectives describe nouns. In English, adjectives <strong>never change form</strong> — no masculine, no feminine, no plural!</p>
<div class="lesson-objectives">
  <h4>🎯 Learning Objectives</h4>
  <ul>
    <li>Place adjectives <strong>before the noun</strong>: a big house</li>
    <li>Understand that adjectives are <strong>invariable</strong> in English</li>
    <li>Form <strong>comparatives</strong>: bigger, more beautiful</li>
    <li>Form <strong>superlatives</strong>: the biggest, the most beautiful</li>
  </ul>
</div>
<div class="lesson-highlight"><strong>Key difference from French:</strong> "une grande maison" → "a big house" (no agreement!)</div>
</div>`
    },
    {
      id: 'en-adj-p2', type: 'lesson',
      title: 'Position & Agreement of Adjectives',
      content: `<h3>📖 Position & Agreement</h3>
<div class="rule-box">
  <div class="rule-icon">📍</div>
  <div>
    <strong>In English: adjective BEFORE the noun</strong>
    <ul style="margin-top:8px">
      <li>a <strong>beautiful</strong> garden (not: a garden beautiful)</li>
      <li>a <strong>red</strong> car</li>
      <li>three <strong>tall</strong> men</li>
    </ul>
  </div>
</div>
<div class="rule-box" style="margin-top:1rem">
  <div class="rule-icon">🔒</div>
  <div>
    <strong>Adjectives NEVER change in English:</strong>
    <table style="margin-top:8px;width:100%">
      <thead><tr><th>French</th><th>English</th></tr></thead>
      <tbody>
        <tr><td>un grand garçon</td><td>a <strong>tall</strong> boy</td></tr>
        <tr><td>une grande fille</td><td>a <strong>tall</strong> girl (same!)</td></tr>
        <tr><td>de grands arbres</td><td><strong>tall</strong> trees (same!)</td></tr>
      </tbody>
    </table>
  </div>
</div>
<div class="compare-box" style="margin-top:1rem">
  <div class="compare-item good">✅ She has <strong>blue</strong> eyes.</div>
  <div class="compare-item bad">❌ She has <strong>blues</strong> eyes.</div>
</div>`
    },
    {
      id: 'en-adj-p3', type: 'lesson',
      title: 'Comparative & Superlative',
      content: `<h3>📖 Comparative & Superlative</h3>
<div class="rule-box">
  <div class="rule-icon">📏</div>
  <div>
    <strong>Short adjectives (1–2 syllables): add -er / -est</strong>
    <table style="margin-top:8px;width:100%">
      <thead><tr><th>Adjective</th><th>Comparative</th><th>Superlative</th></tr></thead>
      <tbody>
        <tr><td>big</td><td>bigg<strong>er</strong></td><td>the bigg<strong>est</strong></td></tr>
        <tr><td>tall</td><td>tall<strong>er</strong></td><td>the tall<strong>est</strong></td></tr>
        <tr><td>old</td><td>old<strong>er</strong></td><td>the old<strong>est</strong></td></tr>
        <tr><td>nice</td><td>nic<strong>er</strong></td><td>the nic<strong>est</strong></td></tr>
      </tbody>
    </table>
  </div>
</div>
<div class="rule-box" style="margin-top:1rem">
  <div class="rule-icon">📐</div>
  <div>
    <strong>Long adjectives (3+ syllables): use more / most</strong>
    <table style="margin-top:8px;width:100%">
      <thead><tr><th>Adjective</th><th>Comparative</th><th>Superlative</th></tr></thead>
      <tbody>
        <tr><td>beautiful</td><td><strong>more</strong> beautiful</td><td>the <strong>most</strong> beautiful</td></tr>
        <tr><td>expensive</td><td><strong>more</strong> expensive</td><td>the <strong>most</strong> expensive</td></tr>
        <tr><td>interesting</td><td><strong>more</strong> interesting</td><td>the <strong>most</strong> interesting</td></tr>
      </tbody>
    </table>
  </div>
</div>
<div class="rule-box" style="margin-top:1rem">
  <div class="rule-icon">⚠️</div>
  <div>
    <strong>Irregular adjectives:</strong>
    <ul style="margin-top:8px">
      <li>good → <strong>better</strong> → the <strong>best</strong></li>
      <li>bad → <strong>worse</strong> → the <strong>worst</strong></li>
      <li>far → <strong>farther/further</strong> → the <strong>farthest/furthest</strong></li>
    </ul>
  </div>
</div>
<div class="lesson-highlight" style="margin-top:1rem">✅ Now complete the exercises!</div>`
    }
  ],
  exercises: [
    { id:'en-adj-q1', question:'In English, the adjective goes ___ the noun.', options:['after','before','at the end','anywhere'], answer:1 },
    { id:'en-adj-q2', question:'Which is correct?', options:['a car red','a reds car','a red car','a car reds'], answer:2 },
    { id:'en-adj-q3', question:'Do adjectives change for plural in English?', options:['Yes, add -s','Yes, add -x','Yes, add -e','No, they never change'], answer:3 },
    { id:'en-adj-q4', question:'Comparative of "big":', options:['more big','bigger','bigest','biger'], answer:1 },
    { id:'en-adj-q5', question:'Superlative of "beautiful":', options:['beautifuler','beautifullest','the most beautiful','the more beautiful'], answer:2 },
    { id:'en-adj-q6', question:'Irregular comparative of "good":', options:['gooder','more good','better','the best'], answer:2 },
    { id:'en-adj-q7', question:'Which sentence is correct?', options:['She has hairs longs.','She has long hairs.','She has long hair.','She has hair long.'], answer:2 },
    { id:'en-adj-q8', question:'Superlative of "bad":', options:['the baddest','the most bad','the worst','the worse'], answer:2 },
    { id:'en-adj-q9', question:'"This hotel is ___ than the other one." (expensive)', options:['expensiver','more expensive','most expensive','the most expensive'], answer:1 },
    { id:'en-adj-q10', question:'Fill in: "He is ___ student in the class." (good)', options:['the better','the gooder','a good','the best'], answer:3 },
  ]
},

]; // end EN_COURSES


// ════════════════════════════════════════════════════════════════════
// COURS ARABES
// ════════════════════════════════════════════════════════════════════
const AR_COURSES = [

// ── 1. فعل الأمر (The Imperative) ─────────────────────────────────
{
  titre: 'فعل الأمر — الأوامر والتعليمات (A1)',
  cours_nom: 'Arabe', langue: 'Arabe', section: 'langues',
  categorie: 'arabe', categorie_age: 'Adultes', niveau: 'A1',
  prix: 0, duree: 35, course_type: 'standard',
  description: 'تعلم صياغة فعل الأمر في اللغة العربية: المخاطب المفرد والجمع، الأمر المؤكد، والنهي. دروس وتمارين تفاعلية.',
  description_fr: 'Apprenez le mode impératif en arabe : singulier et pluriel, affirmation et défense.',
  description_en: 'Learn the imperative form in Arabic: singular and plural commands, affirmative and negative.',
  description_ar: 'تعلم صياغة فعل الأمر في اللغة العربية مع تمارين تفاعلية.',
  title_fr: 'L\'impératif en arabe — Ordres et instructions (A1)',
  title_en: 'The Imperative in Arabic — Orders & Instructions (A1)',
  title_ar: 'فعل الأمر — الأوامر والتعليمات (A1)',
  pages: [
    {
      id: 'ar-imp2-p1', type: 'intro',
      title: 'مقدمة — فعل الأمر',
      content: `<div class="lesson-intro">
<div class="lesson-badge">📚 اللغة العربية — المستوى A1</div>
<h2>فعل الأمر في اللغة العربية</h2>
<p class="lead">فعل الأمر يُستخدم للطلب والتوجيه والنصيحة. في العربية يتصرف حسب الضمير المخاطَب.</p>
<div class="lesson-objectives" dir="rtl">
  <h4>🎯 أهداف الدرس</h4>
  <ul>
    <li>صياغة فعل الأمر للمفرد المذكر والمؤنث</li>
    <li>صياغة فعل الأمر للجمع</li>
    <li>استخدام النهي: <strong>لا + المضارع المجزوم</strong></li>
    <li>التمييز بين الأمر المباشر والطلب المؤدب</li>
  </ul>
</div>
<div class="lesson-highlight"><strong>القاعدة الأساسية:</strong> فعل الأمر يُشتق من المضارع بحذف حرف المضارعة وتسكين آخره أو تغييره.</div>
</div>`
    },
    {
      id: 'ar-imp2-p2', type: 'lesson',
      title: 'تصريف فعل الأمر',
      content: `<h3 dir="rtl">📖 تصريف فعل الأمر</h3>
<div class="rule-box" dir="rtl">
  <div class="rule-icon">📝</div>
  <div>
    <strong>مثال على الفعل "كتب" — يكتب — اكتُب</strong>
    <table style="margin-top:8px;width:100%;direction:rtl">
      <thead><tr><th>الضمير</th><th>فعل الأمر</th><th>مثال</th></tr></thead>
      <tbody>
        <tr><td>أنتَ (مذكر)</td><td><strong>اكتُبْ</strong></td><td>اكتُبْ درسَك!</td></tr>
        <tr><td>أنتِ (مؤنث)</td><td><strong>اكتُبي</strong></td><td>اكتُبي اسمَك!</td></tr>
        <tr><td>أنتما</td><td><strong>اكتُبا</strong></td><td>اكتُبا الواجب!</td></tr>
        <tr><td>أنتم (جمع مذكر)</td><td><strong>اكتُبوا</strong></td><td>اكتُبوا الإجابة!</td></tr>
        <tr><td>أنتن (جمع مؤنث)</td><td><strong>اكتُبْنَ</strong></td><td>اكتُبْنَ الدرس!</td></tr>
      </tbody>
    </table>
  </div>
</div>
<div class="rule-box" style="margin-top:1rem" dir="rtl">
  <div class="rule-icon">❌</div>
  <div>
    <strong>النهي: لا + المضارع المجزوم</strong>
    <ul style="margin-top:8px">
      <li><strong>لا تكتُبْ</strong> هنا! (لا تكتب للمذكر)</li>
      <li><strong>لا تكتُبي</strong> هنا! (للمؤنث)</li>
      <li><strong>لا تكتُبوا</strong> على الجدار! (للجمع)</li>
    </ul>
  </div>
</div>`
    },
    {
      id: 'ar-imp2-p3', type: 'lesson',
      title: 'استخدامات فعل الأمر',
      content: `<h3 dir="rtl">📋 استخدامات فعل الأمر</h3>
<table dir="rtl" style="width:100%">
  <thead><tr><th>الموقف</th><th>أمثلة</th></tr></thead>
  <tbody>
    <tr><td>🏫 في الفصل</td><td>افتحْ كتابَك! اقرأْ بصوت عالٍ! لا تتحدثْ!</td></tr>
    <tr><td>🗺️ الاتجاهات</td><td>سِرْ في الشارع الرئيسي. انعطفْ يساراً. قِفْ!</td></tr>
    <tr><td>🍳 الوصفات</td><td>أضفِ الملح. اخلطِ المكونات. لا تُحرقِ الأكل!</td></tr>
    <tr><td>💬 الطلب المؤدب</td><td>تفضَّلْ! (اجلسْ) · تفضَّلي! · هيَّا بنا.</td></tr>
    <tr><td>💪 التشجيع</td><td>حاوِلْ مرة أخرى! لا تستسلمْ! استمرَّ!</td></tr>
  </tbody>
</table>
<div class="info-box" style="margin-top:1rem" dir="rtl">
  💡 <strong>للتأدب:</strong> يمكن إضافة "من فضلك" أو "لو سمحتَ" بعد فعل الأمر.<br/>
  مثال: <em>أعطِني الكتاب، من فضلك.</em>
</div>
<div class="lesson-highlight" style="margin-top:1rem">✅ الآن أكمِلْ التمارين!</div>`
    }
  ],
  exercises: [
    { id:'ar-imp-q1', question:'فعل الأمر من "ذهب" للمفرد المذكر (أنتَ):', options:['اذهبي','اذهبوا','اذهبْ','تذهبُ'], answer:2 },
    { id:'ar-imp-q2', question:'النهي يُصاغ بـ:', options:['لا + الماضي','لا + المضارع المجزوم','لا + المضارع المرفوع','ما + الماضي'], answer:1 },
    { id:'ar-imp-q3', question:'"اكتبي" — هذا أمر موجَّه إلى:', options:['أنتَ','أنتِ','أنتم','أنتن'], answer:1 },
    { id:'ar-imp-q4', question:'فعل الأمر للجمع المذكر من "قرأ":', options:['اقرأ','اقرئي','اقرؤوا','اقرأن'], answer:2 },
    { id:'ar-imp-q5', question:'أيُّ جملة هي نهيٌ صحيح؟', options:['لا تذهبُ','لا تذهبْ','ما ذهبتَ','تذهبْ لا'], answer:1 },
    { id:'ar-imp-q6', question:'كيف تقول "Sit down!" بالعربية للمذكر المفرد؟', options:['اجلسي','اجلسوا','اجلسْ','جلستَ'], answer:2 },
    { id:'ar-imp-q7', question:'"تفضَّلي" موجَّهة إلى:', options:['رجل واحد','امرأة واحدة','مجموعة رجال','مجموعة نساء'], answer:1 },
    { id:'ar-imp-q8', question:'فعل الأمر من "فتح" للمذكر المفرد:', options:['فتحَ','يفتحُ','افتحْ','افتحي'], answer:2 },
    { id:'ar-imp-q9', question:'"لا تتأخروا!" — هذا نهيٌ موجَّه إلى:', options:['مفرد مذكر','مفرد مؤنث','جمع مذكر','مثنى'], answer:2 },
    { id:'ar-imp-q10', question:'ما معنى "هيَّا بنا!" بالإنجليزية؟', options:['Stop!','Don\'t go!','Let\'s go!','Come back!'], answer:2 },
  ]
},

// ── 2. الفرضية المستقبلية / الشرط ─────────────────────────────────
{
  titre: 'المستقبل والفرضية — جملة الشرط بالعربية (A1)',
  cours_nom: 'Arabe', langue: 'Arabe', section: 'langues',
  categorie: 'arabe', categorie_age: 'Adultes', niveau: 'A1',
  prix: 0, duree: 35, course_type: 'standard',
  description: 'تعلم التعبير عن المستقبل والفرضية بالعربية: سوف/سـ + المضارع، وجملة الشرط بإن/إذا.',
  description_fr: 'Apprenez à exprimer le futur et l\'hypothèse en arabe : sauf + présent, et la phrase conditionnelle.',
  description_en: 'Learn to express the future and hypothesis in Arabic: future tense and conditional sentences.',
  description_ar: 'تعلم التعبير عن المستقبل والشرط باللغة العربية مع تمارين.',
  title_fr: 'Le futur et l\'hypothèse en arabe — La phrase conditionnelle (A1)',
  title_en: 'The Future & Hypothesis in Arabic — Conditional Sentences (A1)',
  title_ar: 'المستقبل والفرضية — جملة الشرط بالعربية (A1)',
  pages: [
    {
      id: 'ar-fut-p1', type: 'intro',
      title: 'مقدمة — المستقبل والفرضية',
      content: `<div class="lesson-intro">
<div class="lesson-badge">📚 اللغة العربية — المستوى A1</div>
<h2>المستقبل والفرضية بالعربية</h2>
<p class="lead">نستخدم المستقبل والشرط للتعبير عن الاحتمالات والفرضيات. في العربية نستخدم <strong>سوف / سـ</strong> للمستقبل، و<strong>إن / إذا</strong> للشرط.</p>
<div class="lesson-objectives" dir="rtl">
  <h4>🎯 أهداف الدرس</h4>
  <ul>
    <li>استخدام <strong>سوف + المضارع</strong> للتعبير عن المستقبل</li>
    <li>استخدام <strong>سـ + المضارع</strong> (الاختصار)</li>
    <li>بناء جملة الشرط: <strong>إن/إذا + الماضي/المضارع → الجواب</strong></li>
    <li>التمييز بين الشرط الحقيقي والشرط غير الحقيقي</li>
  </ul>
</div>
</div>`
    },
    {
      id: 'ar-fut-p2', type: 'lesson',
      title: 'المستقبل: سوف وسـ',
      content: `<h3 dir="rtl">📖 صياغة المستقبل</h3>
<div class="rule-box" dir="rtl">
  <div class="rule-icon">🔮</div>
  <div>
    <strong>سوف + المضارع = المستقبل</strong>
    <ul style="margin-top:8px">
      <li><strong>سوف أذهبُ</strong> إلى المدرسة غداً. (I will go to school tomorrow)</li>
      <li><strong>سوف تدرسُ</strong> هي في الجامعة. (She will study at university)</li>
      <li><strong>سوف يسافرُ</strong> أبي الأسبوع القادم.</li>
    </ul>
    <strong style="margin-top:12px;display:block">سـ + المضارع = نفس المعنى (مختصر)</strong>
    <ul style="margin-top:8px">
      <li><strong>سأذهبُ</strong> إلى السوق. (= سوف أذهب)</li>
      <li><strong>ستدرسُ</strong> غداً. (= سوف تدرس)</li>
    </ul>
  </div>
</div>`
    },
    {
      id: 'ar-fut-p3', type: 'lesson',
      title: 'جملة الشرط: إن / إذا',
      content: `<h3 dir="rtl">📖 جملة الشرط</h3>
<div class="rule-box" dir="rtl">
  <div class="rule-icon">🔗</div>
  <div>
    <strong>إن / إذا + فعل الشرط → جواب الشرط</strong>
    <ul style="margin-top:8px">
      <li><strong>إنْ دَرَسْتَ</strong> جيداً، <strong>نجحتَ</strong>. (If you study well, you pass)</li>
      <li><strong>إذا جاءَ</strong> محمد، <strong>أخبِرْهُ</strong>. (If Mohammed comes, tell him)</li>
      <li><strong>إن ذهبتُ</strong> باكراً، <strong>سأجدُ</strong> مقعداً.</li>
    </ul>
  </div>
</div>
<div class="compare-box" style="margin-top:1rem" dir="rtl">
  <div class="compare-item good">✅ إن تذهبْ مبكراً، ستجدُ التذكرة.</div>
  <div class="compare-item good">✅ إذا درستَ، ستنجحُ في الامتحان.</div>
</div>
<div class="info-box" style="margin-top:1rem" dir="rtl">
  💡 <strong>الفرق:</strong><br/>
  • <strong>إن</strong> → للشرط المحتمل والمستقبل (رسمية أكثر)<br/>
  • <strong>إذا</strong> → للشرط المتوقع أو في اللغة العادية
</div>
<div class="lesson-highlight" style="margin-top:1rem">✅ الآن أكمِلْ التمارين!</div>`
    }
  ],
  exercises: [
    { id:'ar-fut-q1', question:'كيف نصوغ المستقبل بالعربية؟', options:['كان + المضارع','سوف + المضارع','قد + الماضي','لن + المضارع'], answer:1 },
    { id:'ar-fut-q2', question:'"سأذهبُ" تعني:', options:['I went','I was going','I will go','I am going'], answer:2 },
    { id:'ar-fut-q3', question:'اختر الجملة الصحيحة للمستقبل:', options:['سوف ذهبتُ','سوف أذهبُ','سوف ذهبَ','سذهبتُ'], answer:1 },
    { id:'ar-fut-q4', question:'"إن درستَ..." هي بداية جملة:', options:['خبرية','استفهامية','شرطية','أمرية'], answer:2 },
    { id:'ar-fut-q5', question:'ما الفرق بين "إن" و"إذا"؟', options:['لا فرق في المعنى','إن للماضي وإذا للمستقبل','إن للشرط الرسمي وإذا للعادي','إذا للأمر وإن للنهي'], answer:2 },
    { id:'ar-fut-q6', question:'أكمل: "إذا جاءَ أحمد، ___ له." (أخبر)', options:['تخبرُ','أخبِرْ','أخبرَ','يخبرُ'], answer:1 },
    { id:'ar-fut-q7', question:'"ستدرسُ في الجامعة" — من الفاعل؟', options:['أنا','هو','هي','أنتَ'], answer:2 },
    { id:'ar-fut-q8', question:'"سوف" و"سـ" يُستخدمان مع:', options:['الفعل الماضي','الفعل المضارع','الفعل الأمر','الاسم'], answer:1 },
    { id:'ar-fut-q9', question:'ترجم: "If you study, you will succeed."', options:['إذا درستَ، نجحتَ','سوف تنجحُ دائماً','ادرسْ الآن','لن تنجحَ بدون دراسة'], answer:0 },
    { id:'ar-fut-q10', question:'"لن أذهبَ" تعني:', options:['I will go','I went','I will not go','I am going'], answer:2 },
  ]
},

// ── 3. التعريف والتنكير (Articles / Definiteness) ──────────────────
{
  titre: 'التعريف والتنكير — أل والتنوين (A1)',
  cours_nom: 'Arabe', langue: 'Arabe', section: 'langues',
  categorie: 'arabe', categorie_age: 'Adultes', niveau: 'A1',
  prix: 0, duree: 40, course_type: 'standard',
  description: 'تعلم الفرق بين المعرفة والنكرة في اللغة العربية: أداة التعريف "أل" والتنوين وأنواع المعارف.',
  description_fr: 'Apprenez la différence entre les noms définis et indéfinis en arabe : l\'article "al" et le tanwin.',
  description_en: 'Learn the difference between definite and indefinite nouns in Arabic: the article "al" and tanwin.',
  description_ar: 'تعلم قواعد التعريف والتنكير في العربية مع تمارين تفاعلية.',
  title_fr: 'Le défini et l\'indéfini en arabe — Al et tanwin (A1)',
  title_en: 'Definite & Indefinite in Arabic — Al and Tanwin (A1)',
  title_ar: 'التعريف والتنكير — أل والتنوين (A1)',
  pages: [
    {
      id: 'ar-art-p1', type: 'intro',
      title: 'مقدمة — التعريف والتنكير',
      content: `<div class="lesson-intro">
<div class="lesson-badge">📚 اللغة العربية — المستوى A1</div>
<h2>التعريف والتنكير في العربية</h2>
<p class="lead">في العربية، الاسم إما <strong>نكرة</strong> (غير محدد) أو <strong>معرفة</strong> (محدد). هذا يشبه الفرق بين a/an و the في الإنجليزية.</p>
<div class="lesson-objectives" dir="rtl">
  <h4>🎯 أهداف الدرس</h4>
  <ul>
    <li>فهم الفرق بين النكرة والمعرفة</li>
    <li>استخدام أداة التعريف <strong>"أل"</strong> بشكل صحيح</li>
    <li>التعرف على <strong>التنوين</strong> علامة التنكير</li>
    <li>معرفة أنواع المعارف في اللغة العربية</li>
  </ul>
</div>
</div>`
    },
    {
      id: 'ar-art-p2', type: 'lesson',
      title: 'النكرة والتنوين',
      content: `<h3 dir="rtl">📖 النكرة — الاسم غير المحدد</h3>
<div class="rule-box" dir="rtl">
  <div class="rule-icon">📝</div>
  <div>
    <strong>النكرة تُعرَّف بالتنوين (ـٌ ـٍ ـً)</strong>
    <table style="margin-top:8px;width:100%;direction:rtl">
      <thead><tr><th>التنوين</th><th>مثال</th><th>المعنى</th></tr></thead>
      <tbody>
        <tr><td>ضم التنوين ـٌ</td><td>كتابٌ</td><td>a book (مبتدأ/فاعل)</td></tr>
        <tr><td>كسر التنوين ـٍ</td><td>كتابٍ</td><td>of a book (مضاف إليه)</td></tr>
        <tr><td>فتح التنوين ـً</td><td>كتاباً</td><td>a book (مفعول به)</td></tr>
      </tbody>
    </table>
    <div style="margin-top:12px">
      <strong>أمثلة:</strong>
      <ul>
        <li>رأيتُ <strong>كتاباً</strong> على الطاولة. (I saw a book...)</li>
        <li>هذا <strong>بيتٌ</strong> كبير. (This is a big house.)</li>
      </ul>
    </div>
  </div>
</div>`
    },
    {
      id: 'ar-art-p3', type: 'lesson',
      title: 'المعرفة — أداة التعريف "أل"',
      content: `<h3 dir="rtl">📖 المعرفة — أداة التعريف أل</h3>
<div class="rule-box" dir="rtl">
  <div class="rule-icon">🎯</div>
  <div>
    <strong>نضيف "أل" في بداية الاسم للتعريف</strong>
    <table style="margin-top:8px;width:100%;direction:rtl">
      <thead><tr><th>نكرة</th><th>معرفة</th><th>معنى</th></tr></thead>
      <tbody>
        <tr><td>كتابٌ</td><td><strong>الكتابُ</strong></td><td>the book</td></tr>
        <tr><td>بيتٌ</td><td><strong>البيتُ</strong></td><td>the house</td></tr>
        <tr><td>ولدٌ</td><td><strong>الولدُ</strong></td><td>the boy</td></tr>
        <tr><td>مدرسةٌ</td><td><strong>المدرسةُ</strong></td><td>the school</td></tr>
      </tbody>
    </table>
  </div>
</div>
<div class="rule-box" style="margin-top:1rem" dir="rtl">
  <div class="rule-icon">☀️🌙</div>
  <div>
    <strong>أل الشمسية وأل القمرية</strong>
    <ul style="margin-top:8px">
      <li><strong>أل القمرية:</strong> اللام تُنطق → الكتاب، البيت، القمر</li>
      <li><strong>أل الشمسية:</strong> اللام لا تُنطق → الشمس (= اشـشـمس)، النور (= اننور)</li>
    </ul>
    <p style="margin-top:8px;font-size:13px;color:#666">الحروف الشمسية: ت ث د ذ ر ز س ش ص ض ط ظ ل ن</p>
  </div>
</div>
<div class="lesson-highlight" style="margin-top:1rem">✅ الآن أكمِلْ التمارين!</div>`
    }
  ],
  exercises: [
    { id:'ar-art-q1', question:'"كتابٌ" هو:', options:['معرفة','نكرة','فعل','صفة'], answer:1 },
    { id:'ar-art-q2', question:'كيف نُعرِّف كلمة "بيتٌ"؟', options:['بيتاً','البيت','بيوت','أبيات'], answer:1 },
    { id:'ar-art-q3', question:'ما علامة النكرة في العربية؟', options:['أل','التنوين','الضمة','الكسرة'], answer:1 },
    { id:'ar-art-q4', question:'"الشمسُ" — اللام في هذه الكلمة:', options:['تُنطق','لا تُنطق','اختيارية','ساكنة'], answer:1 },
    { id:'ar-art-q5', question:'أضِفْ أل التعريف على "ولدٌ":', options:['ألولد','الولدُ','والولد','لولدٌ'], answer:1 },
    { id:'ar-art-q6', question:'"الكتابُ" يعني:', options:['a book','the book','books','some books'], answer:1 },
    { id:'ar-art-q7', question:'أيُّ الكلمات نكرة؟', options:['المدرسة','الولد','بيتٌ','الشمس'], answer:2 },
    { id:'ar-art-q8', question:'"القمرُ" — اللام فيها:', options:['شمسية (لا تُنطق)','قمرية (تُنطق)','مفتوحة','ساكنة'], answer:1 },
    { id:'ar-art-q9', question:'ترجم: "I saw a dog."', options:['رأيتُ الكلبَ','رأيتُ كلباً','الكلب رأيته','كلبٌ رأى'], answer:1 },
    { id:'ar-art-q10', question:'ما الفرق بين "كتابٌ" و"الكتابُ"؟', options:['لا فرق','كتابٌ جمع والكتاب مفرد','كتابٌ نكرة والكتاب معرفة','كتابٌ مذكر والكتاب مؤنث'], answer:2 },
  ]
},

// ── 4. الجملة الاستفهامية (Interrogative Sentence) ─────────────────
{
  titre: 'الجملة الاستفهامية — كيف تسأل بالعربية (A0/A1)',
  cours_nom: 'Arabe', langue: 'Arabe', section: 'langues',
  categorie: 'arabe', categorie_age: 'Adultes', niveau: 'A1',
  prix: 0, duree: 35, course_type: 'standard',
  description: 'تعلم كيف تصوغ الأسئلة باللغة العربية: أسلوب الاستفهام بهل وأم وأدوات الاستفهام.',
  description_fr: 'Apprenez à poser des questions en arabe : hal, am et les mots interrogatifs.',
  description_en: 'Learn how to ask questions in Arabic: hal, am, and interrogative words.',
  description_ar: 'تعلم صياغة الأسئلة في اللغة العربية مع تمارين تفاعلية.',
  title_fr: 'La phrase interrogative en arabe — Comment poser une question (A0/A1)',
  title_en: 'Interrogative Sentences in Arabic — How to Ask (A0/A1)',
  title_ar: 'الجملة الاستفهامية — كيف تسأل بالعربية (A0/A1)',
  pages: [
    {
      id: 'ar-int-p1', type: 'intro',
      title: 'مقدمة — الجملة الاستفهامية',
      content: `<div class="lesson-intro">
<div class="lesson-badge">📚 اللغة العربية — المستوى A0/A1</div>
<h2>الجملة الاستفهامية في العربية</h2>
<p class="lead">للسؤال في اللغة العربية نستخدم <strong>أدوات الاستفهام</strong>. يمكنك الاستفهام بـ"هل"، أو بأحد أسماء وحروف الاستفهام.</p>
<div class="lesson-objectives" dir="rtl">
  <h4>🎯 أهداف الدرس</h4>
  <ul>
    <li>استخدام <strong>هل / أ</strong> لأسئلة نعم/لا</li>
    <li>استخدام أدوات الاستفهام: مَنْ، مَا، أين، متى، كيف، لماذا</li>
    <li>التمييز بين <strong>هل</strong> و<strong>أم</strong></li>
    <li>صياغة الأسئلة في جمل صحيحة</li>
  </ul>
</div>
</div>`
    },
    {
      id: 'ar-int-p2', type: 'lesson',
      title: 'هل وأ — أسئلة نعم/لا',
      content: `<h3 dir="rtl">📖 هل وأ — الاستفهام عن نعم أو لا</h3>
<div class="rule-box" dir="rtl">
  <div class="rule-icon">❓</div>
  <div>
    <strong>هل + جملة خبرية = سؤال نعم/لا</strong>
    <ul style="margin-top:8px">
      <li><strong>هل</strong> أنتَ طالبٌ؟ — نعم، أنا طالبٌ. / لا، لستُ طالباً.</li>
      <li><strong>هل</strong> تحبُّ الشاي؟ — نعم، أحبُّهُ.</li>
      <li><strong>هل</strong> ذهبتَ إلى السوق؟</li>
    </ul>
    <strong style="margin-top:12px;display:block">أ + الاسم = سؤال (أكثر رسمية)</strong>
    <ul style="margin-top:8px">
      <li><strong>أ</strong>أنتَ معلمٌ؟ (= هل أنتَ معلمٌ؟)</li>
      <li><strong>أ</strong>جاءَ محمد؟</li>
    </ul>
  </div>
</div>`
    },
    {
      id: 'ar-int-p3', type: 'lesson',
      title: 'أدوات الاستفهام',
      content: `<h3 dir="rtl">📖 أدوات الاستفهام</h3>
<table dir="rtl" style="width:100%">
  <thead><tr><th>الأداة</th><th>معناها</th><th>مثال</th></tr></thead>
  <tbody>
    <tr><td><strong>مَنْ</strong></td><td>Who</td><td>مَنْ هذا؟ — هذا أبي.</td></tr>
    <tr><td><strong>مَا / مَاذا</strong></td><td>What</td><td>مَا اسمُك؟ مَاذا تدرس؟</td></tr>
    <tr><td><strong>أين</strong></td><td>Where</td><td>أين تسكن؟ — أسكن في الرباط.</td></tr>
    <tr><td><strong>متى</strong></td><td>When</td><td>متى يبدأ الدرس؟ — الساعة التاسعة.</td></tr>
    <tr><td><strong>كيف</strong></td><td>How</td><td>كيف حالُك؟ — بخير، شكراً.</td></tr>
    <tr><td><strong>لماذا</strong></td><td>Why</td><td>لماذا تأخَّرتَ؟ — لأن الحافلة تأخرت.</td></tr>
    <tr><td><strong>كم</strong></td><td>How many/much</td><td>كم عمرُك؟ — عمري عشرون سنة.</td></tr>
    <tr><td><strong>أيّ</strong></td><td>Which</td><td>أيّ كتابٍ تريد؟</td></tr>
  </tbody>
</table>
<div class="info-box" style="margin-top:1rem" dir="rtl">
  💡 <strong>هل</strong> للسؤال عن نعم/لا فقط. أما بقية أدوات الاستفهام فتستخدم مباشرة دون "هل".
</div>
<div class="lesson-highlight" style="margin-top:1rem">✅ الآن أكمِلْ التمارين!</div>`
    }
  ],
  exercises: [
    { id:'ar-int-q1', question:'أيُّ الأدوات يُستخدم للسؤال عن شخص؟', options:['ما','أين','مَنْ','متى'], answer:2 },
    { id:'ar-int-q2', question:'"___ تسكن؟" — للسؤال عن المكان:', options:['متى','كيف','لماذا','أين'], answer:3 },
    { id:'ar-int-q3', question:'"هل تحبُّ القهوة؟" — هذا سؤال عن:', options:['المكان','نعم أو لا','السبب','الوقت'], answer:1 },
    { id:'ar-int-q4', question:'"___ عمرُك؟" — للسؤال عن العدد:', options:['مَنْ','كيف','كم','أيّ'], answer:2 },
    { id:'ar-int-q5', question:'"لماذا" تعني:', options:['Where','When','How','Why'], answer:3 },
    { id:'ar-int-q6', question:'كيف تسأل "Are you a student?" بالعربية؟', options:['أنتَ طالب؟','هل أنتَ طالبٌ؟','مَن أنتَ طالب؟','ما طالبٌ أنتَ؟'], answer:1 },
    { id:'ar-int-q7', question:'"مَاذا تدرسُ؟" تعني:', options:['Where do you study?','When do you study?','What do you study?','Why do you study?'], answer:2 },
    { id:'ar-int-q8', question:'ما الفرق بين "ما" و"مَنْ"؟', options:['لا فرق','ما للأشياء ومَنْ للأشخاص','مَنْ للأشياء وما للأشخاص','ما للمستقبل ومَنْ للماضي'], answer:1 },
    { id:'ar-int-q9', question:'"كيف حالُك؟" تعني:', options:['Where are you?','How are you?','Who are you?','What is your name?'], answer:1 },
    { id:'ar-int-q10', question:'أكمل: "___ يبدأ الاجتماع؟ — الساعة العاشرة."', options:['أين','لماذا','متى','كيف'], answer:2 },
  ]
},

// ── 5. مستويات اللغة (Language Registers) ─────────────────────────
{
  titre: 'مستويات اللغة العربية — الفصحى والعامية (A1)',
  cours_nom: 'Arabe', langue: 'Arabe', section: 'langues',
  categorie: 'arabe', categorie_age: 'Adultes', niveau: 'A1',
  prix: 0, duree: 35, course_type: 'standard',
  description: 'اكتشف الفرق بين الفصحى الحديثة والعامية والأسلوب الرسمي في اللغة العربية وكيف تختار المستوى المناسب.',
  description_fr: 'Découvrez les registres de la langue arabe : arabe standard moderne, dialectal et formel.',
  description_en: 'Discover Arabic language registers: Modern Standard Arabic, dialectal Arabic and formal register.',
  description_ar: 'تعرف على مستويات اللغة العربية وكيف تختار الأسلوب المناسب لكل موقف.',
  title_fr: 'Les registres de l\'arabe — Fus\'ha et Aamiya (A1)',
  title_en: 'Arabic Language Registers — Fusha and Aamiya (A1)',
  title_ar: 'مستويات اللغة العربية — الفصحى والعامية (A1)',
  pages: [
    {
      id: 'ar-reg-p1', type: 'intro',
      title: 'مقدمة — مستويات اللغة العربية',
      content: `<div class="lesson-intro">
<div class="lesson-badge">📚 اللغة العربية — المستوى A1</div>
<h2>مستويات اللغة العربية</h2>
<p class="lead">اللغة العربية لها مستويات متعددة: <strong>العامية</strong> في الحديث اليومي، و<strong>الفصحى البسيطة</strong> في الإعلام والتعليم، و<strong>الفصحى الرسمية</strong> في الكتابة والخطب.</p>
<div class="lesson-objectives" dir="rtl">
  <h4>🎯 أهداف الدرس</h4>
  <ul>
    <li>التمييز بين <strong>العامية</strong> والفصحى</li>
    <li>معرفة متى نستخدم <strong>الفصحى الحديثة</strong> (MSA)</li>
    <li>فهم <strong>الفصحى الرسمية</strong> للكتابة الرسمية</li>
    <li>اختيار المستوى المناسب لكل موقف</li>
  </ul>
</div>
</div>`
    },
    {
      id: 'ar-reg-p2', type: 'lesson',
      title: 'العامية — اللغة اليومية',
      content: `<h3 dir="rtl">📖 العامية — اللغة الدارجة</h3>
<div class="rule-box" dir="rtl">
  <div class="rule-icon">💬</div>
  <div>
    <strong>تُستخدم مع:</strong> الأصدقاء والعائلة والحياة اليومية<br/>
    <strong>خصائصها:</strong> تختلف من بلد لآخر، أبسط في النطق
    <table style="margin-top:12px;width:100%;direction:rtl">
      <thead><tr><th>العامية (المغرب مثلاً)</th><th>الفصحى</th><th>المعنى</th></tr></thead>
      <tbody>
        <tr><td>كيداير؟</td><td>كيف حالُك؟</td><td>How are you?</td></tr>
        <tr><td>واش عندك...؟</td><td>هل عندك...؟</td><td>Do you have...?</td></tr>
        <tr><td>بغيت</td><td>أريد</td><td>I want</td></tr>
        <tr><td>مزيان</td><td>جيد / حسن</td><td>Good</td></tr>
      </tbody>
    </table>
  </div>
</div>`
    },
    {
      id: 'ar-reg-p3', type: 'lesson',
      title: 'الفصحى الحديثة والفصحى الرسمية',
      content: `<h3 dir="rtl">📖 الفصحى الحديثة والرسمية</h3>
<div class="rule-box" dir="rtl">
  <div class="rule-icon">📺</div>
  <div>
    <strong>الفصحى الحديثة (MSA) — الإعلام والتعليم</strong>
    <ul style="margin-top:8px">
      <li>تُستخدم في: الصحف، التلفزيون، المدارس، الكتب</li>
      <li>مفهومة في جميع الدول العربية</li>
      <li>مثال: <em>أعلن الرئيس اليوم عن...</em></li>
    </ul>
  </div>
</div>
<div class="rule-box" style="margin-top:1rem" dir="rtl">
  <div class="rule-icon">📝</div>
  <div>
    <strong>الفصحى الرسمية — الكتابة الرسمية والدينية</strong>
    <ul style="margin-top:8px">
      <li>تُستخدم في: الرسائل الرسمية، العقود، الخطب الدينية</li>
      <li>تحترم قواعد الإعراب الكاملة</li>
      <li>مثال: <em>يسعدني أن أتقدم إليكم بطلب...</em></li>
    </ul>
  </div>
</div>
<div class="compare-box" style="margin-top:1rem" dir="rtl">
  <div class="compare-item good">💬 عامية: "بغيت نتكلم معاك"</div>
  <div class="compare-item good">📺 فصحى عادية: "أريد التحدث معك"</div>
  <div class="compare-item good">📝 فصحى رسمية: "يشرفني أن أتواصل معكم"</div>
</div>
<div class="lesson-highlight" style="margin-top:1rem">✅ الآن أكمِلْ التمارين!</div>`
    }
  ],
  exercises: [
    { id:'ar-reg-q1', question:'أيُّ المستويات يُستخدم مع الأصدقاء؟', options:['الفصحى الرسمية','العامية','الفصحى الكلاسيكية','لغة الشعر'], answer:1 },
    { id:'ar-reg-q2', question:'أين تُستخدم الفصحى الحديثة (MSA)؟', options:['بين الأصدقاء فقط','في الصحف والتلفزيون','في الرسائل الشخصية فقط','في الحياة اليومية فقط'], answer:1 },
    { id:'ar-reg-q3', question:'"يسعدني أن أتقدم بطلب..." هذا أسلوب:', options:['عامي','فصحى بسيطة','فصحى رسمية','شعري'], answer:2 },
    { id:'ar-reg-q4', question:'هل تختلف العامية من بلد لآخر؟', options:['لا، هي نفسها في كل البلاد','نعم، تختلف كثيراً','نعم، قليلاً فقط','لا، إلا بين الشرق والغرب'], answer:1 },
    { id:'ar-reg-q5', question:'الفصحى الحديثة مفهومة:', options:['في المغرب فقط','في مصر فقط','في جميع الدول العربية','في الخليج فقط'], answer:2 },
    { id:'ar-reg-q6', question:'أيُّ الجمل هي فصحى رسمية؟', options:['واش راك?','كيف حالك؟','يشرفني أن أتواصل معكم.','مرحبا، عامل إيه?'], answer:2 },
    { id:'ar-reg-q7', question:'للكتابة في صحيفة نستخدم:', options:['العامية المحلية','الفصحى الحديثة','اللغة الدارجة','الشفرة'], answer:1 },
    { id:'ar-reg-q8', question:'"أريد التحدث معك" هي:', options:['عامية','فصحى حديثة','فصحى كلاسيكية','إنجليزية'], answer:1 },
    { id:'ar-reg-q9', question:'مَن يفهم الفصحى الحديثة؟', options:['العرب المتعلمون فقط','الفصحى غير مفهومة اليوم','جميع المتحدثين بالعربية تقريباً','المغاربة فقط'], answer:2 },
    { id:'ar-reg-q10', question:'في أيِّ حالة تستخدم العامية؟', options:['في خطاب رسمي','في كتابة عقد','في محادثة مع صديق','في مقال علمي'], answer:2 },
  ]
},

// ── 6. الصفة في العربية (Adjectives) ──────────────────────────────
{
  titre: 'الصفة في العربية — التوافق والموضع (A1)',
  cours_nom: 'Arabe', langue: 'Arabe', section: 'langues',
  categorie: 'arabe', categorie_age: 'Adultes', niveau: 'A1',
  prix: 0, duree: 35, course_type: 'standard',
  description: 'تعلم قواعد الصفة في اللغة العربية: التوافق في الجنس والعدد والتعريف، وموضع الصفة بعد الموصوف.',
  description_fr: 'Apprenez les règles de l\'adjectif en arabe : accord en genre, nombre, définition et position après le nom.',
  description_en: 'Learn Arabic adjective rules: agreement in gender, number, definiteness and position after the noun.',
  description_ar: 'تعلم قواعد الصفة في العربية: التوافق في الجنس والعدد والتعريف مع تمارين.',
  title_fr: 'L\'adjectif en arabe — Accord et position (A1)',
  title_en: 'Adjectives in Arabic — Agreement & Position (A1)',
  title_ar: 'الصفة في العربية — التوافق والموضع (A1)',
  pages: [
    {
      id: 'ar-adj2-p1', type: 'intro',
      title: 'مقدمة — الصفة في العربية',
      content: `<div class="lesson-intro">
<div class="lesson-badge">📚 اللغة العربية — المستوى A1</div>
<h2>الصفة في اللغة العربية</h2>
<p class="lead">الصفة في العربية تتبع الموصوف وتوافقه في <strong>الجنس</strong> و<strong>العدد</strong> و<strong>التعريف</strong>. هذا يختلف عن الإنجليزية حيث الصفة لا تتغير!</p>
<div class="lesson-objectives" dir="rtl">
  <h4>🎯 أهداف الدرس</h4>
  <ul>
    <li>وضع الصفة <strong>بعد الاسم</strong> (عكس الإنجليزية)</li>
    <li>توافق الصفة في <strong>الجنس</strong>: ولدٌ كبيرٌ / بنتٌ كبيرةٌ</li>
    <li>توافق الصفة في <strong>العدد</strong>: ولدٌ / ولدان / أولادٌ</li>
    <li>توافق الصفة في <strong>التعريف</strong>: البيتُ الكبيرُ</li>
  </ul>
</div>
<div class="lesson-highlight"><strong>الفرق عن الإنجليزية:</strong> في العربية "a big house" = بيتٌ كبيرٌ (الصفة بعد الاسم وتوافقه)</div>
</div>`
    },
    {
      id: 'ar-adj2-p2', type: 'lesson',
      title: 'التوافق في الجنس والتعريف',
      content: `<h3 dir="rtl">📖 التوافق في الجنس والتعريف</h3>
<div class="rule-box" dir="rtl">
  <div class="rule-icon">⚧️</div>
  <div>
    <strong>الصفة تتبع الموصوف في الجنس:</strong>
    <table style="margin-top:8px;width:100%;direction:rtl">
      <thead><tr><th>مذكر</th><th>مؤنث</th><th>المعنى</th></tr></thead>
      <tbody>
        <tr><td>ولدٌ <strong>كبيرٌ</strong></td><td>بنتٌ <strong>كبيرةٌ</strong></td><td>a big boy / a big girl</td></tr>
        <tr><td>بيتٌ <strong>جميلٌ</strong></td><td>سيارةٌ <strong>جميلةٌ</strong></td><td>a beautiful house/car</td></tr>
        <tr><td>كتابٌ <strong>جديدٌ</strong></td><td>مدرسةٌ <strong>جديدةٌ</strong></td><td>a new book/school</td></tr>
      </tbody>
    </table>
    <p style="margin-top:8px;font-size:13px">القاعدة: المؤنث = المذكر + <strong>ة</strong></p>
  </div>
</div>
<div class="rule-box" style="margin-top:1rem" dir="rtl">
  <div class="rule-icon">🔍</div>
  <div>
    <strong>الصفة تتبع الموصوف في التعريف:</strong>
    <ul style="margin-top:8px">
      <li>بيتٌ كبيرٌ (نكرة + نكرة) = a big house</li>
      <li><strong>البيتُ الكبيرُ</strong> (معرفة + معرفة) = the big house</li>
    </ul>
  </div>
</div>
<div class="compare-box" style="margin-top:1rem" dir="rtl">
  <div class="compare-item good">✅ البيتُ <strong>الكبيرُ</strong> (معرفة)</div>
  <div class="compare-item bad">❌ البيتُ <strong>كبيرٌ</strong> (هذه جملة: "the house is big"!)</div>
</div>`
    },
    {
      id: 'ar-adj2-p3', type: 'lesson',
      title: 'التوافق في العدد وموضع الصفة',
      content: `<h3 dir="rtl">📖 التوافق في العدد</h3>
<div class="rule-box" dir="rtl">
  <div class="rule-icon">🔢</div>
  <div>
    <table style="width:100%;direction:rtl">
      <thead><tr><th>العدد</th><th>مثال</th><th>المعنى</th></tr></thead>
      <tbody>
        <tr><td>المفرد</td><td>طالبٌ <strong>مجتهدٌ</strong></td><td>a hardworking student</td></tr>
        <tr><td>المثنى</td><td>طالبان <strong>مجتهدان</strong></td><td>two hardworking students</td></tr>
        <tr><td>الجمع (عاقل)</td><td>طلابٌ <strong>مجتهدون</strong></td><td>hardworking students</td></tr>
        <tr><td>الجمع (غير عاقل)</td><td>كتبٌ <strong>جديدةٌ</strong></td><td>new books (مؤنث للجمع!)</td></tr>
      </tbody>
    </table>
  </div>
</div>
<div class="rule-box" style="margin-top:1rem" dir="rtl">
  <div class="rule-icon">📍</div>
  <div>
    <strong>موضع الصفة: دائماً بعد الاسم</strong>
    <ul style="margin-top:8px">
      <li>بيتٌ <strong>كبيرٌ</strong> ✅ (الصفة بعد الاسم)</li>
      <li><strong>كبيرٌ</strong> بيتٌ ❌ (خطأ)</li>
      <li>في الإنجليزية: a <strong>big</strong> house (الصفة قبل الاسم)</li>
    </ul>
  </div>
</div>
<div class="lesson-highlight" style="margin-top:1rem">✅ الآن أكمِلْ التمارين!</div>`
    }
  ],
  exercises: [
    { id:'ar-adj-q1', question:'أين توضع الصفة في العربية؟', options:['قبل الاسم','بعد الاسم','في أي مكان','في بداية الجملة'], answer:1 },
    { id:'ar-adj-q2', question:'الصفة المؤنثة من "كبير" هي:', options:['كبير','كبيرة','كبيران','كبيرون'], answer:1 },
    { id:'ar-adj-q3', question:'أيُّ التركيبات صحيحٌ؟', options:['جميل بيتٌ','بيتٌ جميلٌ','بيتٌ جميل (بلا تنوين)','الجميل بيتٌ'], answer:1 },
    { id:'ar-adj-q4', question:'"البيتُ الكبيرُ" — لماذا أضفنا "أل" للصفة؟', options:['للتأكيد','لأن الموصوف معرفة','لأن الجملة مؤنثة','لأن الصفة مذكرة'], answer:1 },
    { id:'ar-adj-q5', question:'جمع غير العاقل (كتب، سيارات) يأخذ صفة:', options:['جمع مذكر','جمع مؤنث','مفرد مذكر','مفرد مؤنث'], answer:3 },
    { id:'ar-adj-q6', question:'"طالبٌ مجتهدٌ" بالمثنى يصبح:', options:['طلابٌ مجتهدون','طالبان مجتهدان','طالبتان مجتهدتان','طلابٌ مجتهدة'], answer:1 },
    { id:'ar-adj-q7', question:'ترجم "a new school" إلى العربية:', options:['مدرسةٌ الجديدةٌ','مدرسةٌ جديدٌ','مدرسةٌ جديدةٌ','جديدةٌ مدرسةٌ'], answer:2 },
    { id:'ar-adj-q8', question:'"كتبٌ ___" (جديد — جمع غير عاقل):', options:['جديدون','جديدة','جديدٌ','جديدان'], answer:1 },
    { id:'ar-adj-q9', question:'ما الفرق بين "البيتُ كبيرٌ" و"البيتُ الكبيرُ"؟', options:['لا فرق','الأولى جملة، الثانية وصف','الأولى وصف، الثانية جملة','الأولى مذكر والثانية مؤنث'], answer:1 },
    { id:'ar-adj-q10', question:'في الإنجليزية الصفة توضع ___ الاسم، وفي العربية توضع ___ الاسم.', options:['قبل / قبل','بعد / بعد','قبل / بعد','بعد / قبل'], answer:2 },
  ]
},

]; // end AR_COURSES


// ════════════════════════════════════════════════════════════════════
// DÉTECTION DES DOUBLONS — mots-clés par topic (index = index cours)
// Gère les cas où create-trilingual-standard-courses.mjs a déjà
// créé une version avec un titre légèrement différent.
// ════════════════════════════════════════════════════════════════════
const EN_DETECT = [
  ['imperative'],                                     // 1. L'impératif
  ['conditional', 'hypothesis', 'first conditional'], // 2. L'hypothèse
  ['quantifier', 'article', 'a, an', 'some, any'],   // 3. Articles partitifs
  ['question', 'wh-', 'how to ask'],                 // 4. Phrase interrogative
  ['register', 'formal', 'informal'],                 // 5. Registres de langue
  ['adjective', 'adjectives in english'],             // 6. Adjectifs
];

const AR_DETECT = [
  ['الأمر', 'فعل الأمر', 'أوامر'],                  // 1. L'impératif
  ['شرط', 'فرضية', 'المستقبل', 'الشرطية'],         // 2. L'hypothèse
  ['تعريف', 'تنكير', 'النكرة', 'المعرفة'],          // 3. Articles/définitude
  ['استفهام', 'الاستفهام', 'سؤال'],                 // 4. Phrase interrogative
  ['مستويات', 'فصحى', 'عامية'],                     // 5. Registres de langue
  ['الصفة', 'صفة في'],                               // 6. Adjectifs
];

// ────────────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────────────
function alreadyExistsEN(existingEN, idx, newTitre) {
  if (existingEN.some(c => c.titre === newTitre)) return true;
  const joined = existingEN.map(c => (c.titre || '').toLowerCase()).join(' | ');
  return EN_DETECT[idx].some(kw => joined.includes(kw.toLowerCase()));
}

function alreadyExistsAR(existingAR, idx, newTitre) {
  if (existingAR.some(c => c.titre === newTitre)) return true;
  const joined = existingAR.map(c => c.titre || '').join(' | ');
  return AR_DETECT[idx].some(kw => joined.includes(kw));
}

async function createCourse(pb, course) {
  const payload = {
    titre:          course.titre,
    cours_nom:      course.cours_nom,
    langue:         course.langue,
    categorie:      course.categorie,
    categorie_age:  course.categorie_age || 'Adultes',
    section:        course.section       || 'langues',
    niveau:         course.niveau        || 'A1',
    course_type:    'standard',
    prix:           course.prix          ?? 0,
    duree:          course.duree         ?? 30,
    description:    course.description   || '',
    description_fr: course.description_fr || '',
    description_en: course.description_en || '',
    description_ar: course.description_ar || '',
    title_fr:       course.title_fr      || '',
    title_en:       course.title_en      || (course.langue === 'Anglais' ? course.titre : ''),
    title_ar:       course.title_ar      || (course.langue === 'Arabe'   ? course.titre : ''),
    pages:          JSON.stringify(course.pages     || []),
    exercises:      JSON.stringify(course.exercises || []),
  };
  return pb.collection('courses').create(payload, { requestKey: null });
}

// ════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════
async function main() {
  console.log('\n🌐 create-missing-6-en-ar-courses.mjs');
  console.log('='.repeat(65));
  console.log('   6 cours EN + 6 cours AR — ignore les doublons existants.\n');

  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);

  try {
    await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  } catch (e) {
    console.error('Connexion PocketBase echouee :', e.message);
    process.exit(1);
  }
  console.log('Connecte a PocketBase (' + PB_URL + ')\n');

  const allCourses = await pb.collection('courses').getFullList({ requestKey: null });

  const existingEN = allCourses.filter(
    c => c.langue === 'Anglais' && c.course_type === 'standard'
  );
  const existingAR = allCourses.filter(
    c => c.langue === 'Arabe' && c.course_type === 'standard'
  );

  console.log('Standards existants : ' + existingEN.length + ' EN / ' + existingAR.length + ' AR');
  existingEN.forEach(c => console.log('  EN: ' + c.titre));
  existingAR.forEach(c => console.log('  AR: ' + c.titre));
  console.log('');

  let created = 0, skipped = 0, errors = 0;

  // COURS ANGLAIS
  console.log('COURS ANGLAIS\n' + '-'.repeat(50));
  for (let i = 0; i < EN_COURSES.length; i++) {
    const course = EN_COURSES[i];
    if (alreadyExistsEN(existingEN, i, course.titre)) {
      console.log('  [SKIP] ' + course.titre);
      skipped++;
      continue;
    }
    console.log('  [CREATE] ' + course.titre);
    try {
      const rec = await createCourse(pb, course);
      console.log('    OK id=' + rec.id);
      created++;
    } catch (e) {
      console.log('    ERREUR: ' + e.message);
      errors++;
    }
  }

  // COURS ARABES
  console.log('\nCOURS ARABES\n' + '-'.repeat(50));
  for (let i = 0; i < AR_COURSES.length; i++) {
    const course = AR_COURSES[i];
    if (alreadyExistsAR(existingAR, i, course.titre)) {
      console.log('  [SKIP] ' + course.titre);
      skipped++;
      continue;
    }
    console.log('  [CREATE] ' + course.titre);
    try {
      const rec = await createCourse(pb, course);
      console.log('    OK id=' + rec.id);
      created++;
    } catch (e) {
      console.log('    ERREUR: ' + e.message);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(65));
  console.log('Resultats : ' + created + ' crees / ' + skipped + ' deja existants / ' + errors + ' erreurs');
  if (errors) console.log('Relancer le script pour reessayer les erreurs.');
  console.log('');
}

main().catch(e => { console.error('Erreur fatale :', e.message); process.exit(1); });
