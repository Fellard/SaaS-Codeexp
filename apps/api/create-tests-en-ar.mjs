/**
 * create-tests-en-ar.mjs
 * ════════════════════════════════════════════════════════════
 * Crée deux nouveaux cours "Tests & Assessments" :
 *   - Anglais A1  : Tests & Assessments (A1)
 *   - Arabe A1    : اختبارات وتقييمات (A1)
 *
 * Inspirés du cours FR "Tests et DELF Prim" mais adaptés
 * à chaque langue (pas d'audio Tip Top! — textes interactifs).
 *
 * Usage :  cd apps/api && node create-tests-en-ar.mjs
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
// ENGLISH COURSE — Tests & Assessments A1
// ════════════════════════════════════════════════════════════
const EN_PAGES = [
  {
    id: 'en-test-p1', type: 'intro',
    title: 'Tests & Assessments — Overview',
    content: `<div style="text-align:center;margin-bottom:16px">
  <span style="background:#1a56db;color:#fff;padding:6px 18px;border-radius:20px;font-size:13px;font-weight:600">📝 Tests & Assessments — English A1</span>
</div>
<h2 style="text-align:center">End-of-Unit Tests & A1 Mock Exams</h2>
<p style="text-align:center;color:#555">Validate your English A1 level with structured tests and mock exams.</p>
<div style="background:#eff6ff;border-left:4px solid #1a56db;border-radius:6px;padding:14px;margin:16px 0">
  <strong>🎯 What's inside</strong>
  <ul style="margin:8px 0 0 0">
    <li>6 end-of-unit tests (one per topic covered)</li>
    <li>3 complete A1 mock exam papers</li>
    <li>Self-correction grids and score tracking</li>
    <li>Tips to succeed in your A1 English assessment</li>
  </ul>
</div>
<div style="background:#f0fdf4;border-left:4px solid #16a34a;border-radius:6px;padding:12px;margin:16px 0">
  <strong>📋 Units covered:</strong> Time expressions · Places · Prepositions · Letter writing · Travel · Vocabulary review
</div>`,
  },
  {
    id: 'en-test-p2', type: 'lesson',
    title: 'Unit Tests — Topics 1–6',
    content: `<h3>📝 End-of-Unit Tests</h3>
<p style="color:#555;margin-bottom:16px">Complete each test after finishing the corresponding unit. Aim for 80% or above before moving on.</p>

<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:14px">
  <h4 style="color:#1a56db;margin:0 0 8px 0">✏️ Test 1 — Expressing Time</h4>
  <p><strong>Choose the correct preposition:</strong></p>
  <ol>
    <li>She was born ___ 1995. &nbsp;<em style="color:#888">(at / in / on)</em></li>
    <li>The train leaves ___ 8 o'clock. &nbsp;<em style="color:#888">(at / in / on)</em></li>
    <li>I have studied here ___ two years. &nbsp;<em style="color:#888">(since / for / ago)</em></li>
    <li>They arrived three days ___. &nbsp;<em style="color:#888">(since / for / ago)</em></li>
  </ol>
  <p><strong>Fill in the blank:</strong></p>
  <ol start="5">
    <li>I have been learning English ___ 2021. &nbsp;<em style="color:#888">(since / for)</em></li>
    <li>Please submit the report ___ Friday. &nbsp;<em style="color:#888">(until / by)</em></li>
  </ol>
  <div style="background:#e0f2fe;border-radius:6px;padding:8px;margin-top:10px;font-size:13px">✅ Answers: 1-in · 2-at · 3-for · 4-ago · 5-since · 6-by</div>
</div>

<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:14px">
  <h4 style="color:#1a56db;margin:0 0 8px 0">✏️ Test 2 — Expressing a Place</h4>
  <p><strong>Choose the correct preposition:</strong></p>
  <ol>
    <li>The book is ___ the table. &nbsp;<em style="color:#888">(in / on / at)</em></li>
    <li>She lives ___ London. &nbsp;<em style="color:#888">(in / on / at)</em></li>
    <li>The cat is ___ the sofa. &nbsp;<em style="color:#888">(under / above / on)</em></li>
    <li>The bank is ___ the post office and the library. &nbsp;<em style="color:#888">(between / opposite / near)</em></li>
  </ol>
  <div style="background:#e0f2fe;border-radius:6px;padding:8px;margin-top:10px;font-size:13px">✅ Answers: 1-on · 2-in · 3-under · 4-between</div>
</div>

<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:14px">
  <h4 style="color:#1a56db;margin:0 0 8px 0">✏️ Test 3 — All Prepositions</h4>
  <p><strong>Choose the correct preposition:</strong></p>
  <ol>
    <li>He traveled ___ train. &nbsp;<em style="color:#888">(by / with / on)</em></li>
    <li>She is interested ___ learning languages. &nbsp;<em style="color:#888">(in / at / for)</em></li>
    <li>He apologized ___ being late. &nbsp;<em style="color:#888">(for / of / to)</em></li>
    <li>The letter was written ___ ink. &nbsp;<em style="color:#888">(with / in / by)</em></li>
  </ol>
  <div style="background:#e0f2fe;border-radius:6px;padding:8px;margin-top:10px;font-size:13px">✅ Answers: 1-by · 2-in · 3-for · 4-in</div>
</div>

<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:14px">
  <h4 style="color:#1a56db;margin:0 0 8px 0">✏️ Test 4 — A Letter from London</h4>
  <p><strong>Reading comprehension — True or False:</strong></p>
  <ol>
    <li>London is the capital of England. &nbsp;<em style="color:#888">(True / False)</em></li>
    <li>"Yours sincerely" is used to start a formal letter. &nbsp;<em style="color:#888">(True / False)</em></li>
    <li>Big Ben is a famous museum in London. &nbsp;<em style="color:#888">(True / False)</em></li>
    <li>"I look forward to hearing from you" means you expect a reply. &nbsp;<em style="color:#888">(True / False)</em></li>
  </ol>
  <div style="background:#e0f2fe;border-radius:6px;padding:8px;margin-top:10px;font-size:13px">✅ Answers: 1-True · 2-False (it's used to end) · 3-False (it's a clock tower) · 4-True</div>
</div>

<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:14px">
  <h4 style="color:#1a56db;margin:0 0 8px 0">✏️ Test 5 — Travel & Adventure</h4>
  <p><strong>Vocabulary — Match the word to its definition:</strong></p>
  <ol>
    <li>"To explore" means… &nbsp;<em style="color:#888">(a) to discover new places / b) to stay home)</em></li>
    <li>A "souvenir" is something you… &nbsp;<em style="color:#888">(a) eat / b) buy to remember a place)</em></li>
    <li>"Jet lag" is caused by… &nbsp;<em style="color:#888">(a) travelling across time zones / b) eating too much)</em></li>
  </ol>
  <div style="background:#e0f2fe;border-radius:6px;padding:8px;margin-top:10px;font-size:13px">✅ Answers: 1-a · 2-b · 3-a</div>
</div>

<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px">
  <h4 style="color:#1a56db;margin:0 0 8px 0">✏️ Test 6 — Vocabulary Review</h4>
  <p><strong>Choose the correct word to complete the sentence:</strong></p>
  <ol>
    <li>I was ___ in Paris in 1999. &nbsp;<em style="color:#888">(born / live / go)</em></li>
    <li>She is good ___ mathematics. &nbsp;<em style="color:#888">(at / in / on)</em></li>
    <li>We are looking forward ___ your visit. &nbsp;<em style="color:#888">(to / for / at)</em></li>
    <li>He has ___ here since 2010. &nbsp;<em style="color:#888">(lived / lives / living)</em></li>
  </ol>
  <div style="background:#e0f2fe;border-radius:6px;padding:8px;margin-top:10px;font-size:13px">✅ Answers: 1-born · 2-at · 3-to · 4-lived</div>
</div>`,
  },
  {
    id: 'en-test-p3', type: 'lesson',
    title: 'A1 Mock Exams',
    content: `<h3>🏅 A1 Mock Exam Papers</h3>
<p style="color:#555;margin-bottom:16px">Simulate exam conditions. Read each instruction carefully and answer without looking at your notes.</p>

<div style="background:#fff7ed;border:2px solid #f59e0b;border-radius:10px;padding:16px;margin-bottom:20px">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
    <span style="background:#f59e0b;color:#fff;padding:3px 10px;border-radius:10px;font-size:12px;font-weight:700">🏅 MOCK EXAM 1</span>
    <span style="color:#888;font-size:13px">Time: 20 minutes · 20 points</span>
  </div>
  <p><strong>Part A — Multiple Choice (10 pts)</strong><br/>Choose the correct answer:</p>
  <ol>
    <li>She has lived in Madrid ___ five years. &nbsp;<em>(a) since &nbsp; b) for &nbsp; c) ago)</em></li>
    <li>The supermarket is ___ the bank and the pharmacy. &nbsp;<em>(a) between &nbsp; b) above &nbsp; c) under)</em></li>
    <li>My keys are ___ the table. &nbsp;<em>(a) in &nbsp; b) on &nbsp; c) at)</em></li>
    <li>He traveled ___ plane to New York. &nbsp;<em>(a) with &nbsp; b) on &nbsp; c) by)</em></li>
    <li>I was born ___ a sunny day ___ July. &nbsp;<em>(a) on/in &nbsp; b) at/on &nbsp; c) in/at)</em></li>
  </ol>
  <p><strong>Part B — Fill in the blanks (10 pts)</strong></p>
  <p>Complete with: <em>since · for · in · on · at · by · between · under · next to · ago</em></p>
  <ol>
    <li>The meeting is ___ Monday ___ 10 a.m.</li>
    <li>I have known her ___ 2018.</li>
    <li>He arrived two hours ___.</li>
    <li>The cat is hiding ___ the sofa.</li>
    <li>The café is ___ the museum and the park.</li>
  </ol>
  <div style="background:#fef9c3;border-radius:6px;padding:8px;margin-top:10px;font-size:13px">✅ Part A: 1-b · 2-a · 3-b · 4-c · 5-a &nbsp;|&nbsp; Part B: 1-on/at · 2-since · 3-ago · 4-under · 5-between</div>
</div>

<div style="background:#fff7ed;border:2px solid #f59e0b;border-radius:10px;padding:16px;margin-bottom:20px">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
    <span style="background:#f59e0b;color:#fff;padding:3px 10px;border-radius:10px;font-size:12px;font-weight:700">🏅 MOCK EXAM 2</span>
    <span style="color:#888;font-size:13px">Time: 20 minutes · 20 points</span>
  </div>
  <p><strong>Reading Comprehension — Letter from London</strong></p>
  <p style="background:#f8fafc;border-radius:6px;padding:12px;font-style:italic">"Dear Sarah, I am writing to you from London! I arrived here on Monday and I have been exploring the city for three days. Yesterday, I visited Big Ben and the Tower of London. The weather has been cold but sunny. I look forward to seeing you when I get back. Yours sincerely, Emma."</p>
  <p><strong>Answer these questions:</strong></p>
  <ol>
    <li>When did Emma arrive in London?</li>
    <li>How long has she been exploring the city?</li>
    <li>What two places did she visit yesterday?</li>
    <li>How is the weather?</li>
    <li>Find two prepositions of time in the letter.</li>
  </ol>
  <div style="background:#fef9c3;border-radius:6px;padding:8px;margin-top:10px;font-size:13px">✅ 1-Monday · 2-three days · 3-Big Ben & Tower of London · 4-cold but sunny · 5-on / for</div>
</div>

<div style="background:#fff7ed;border:2px solid #f59e0b;border-radius:10px;padding:16px">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
    <span style="background:#f59e0b;color:#fff;padding:3px 10px;border-radius:10px;font-size:12px;font-weight:700">🏅 MOCK EXAM 3</span>
    <span style="color:#888;font-size:13px">Time: 25 minutes · 25 points</span>
  </div>
  <p><strong>Writing Task</strong> — Write a short letter (8–10 sentences) to a friend describing a trip you took. Include:</p>
  <ul>
    <li>When you left and how long you stayed</li>
    <li>At least 3 prepositions of time (on, in, at, for, since, ago…)</li>
    <li>At least 3 prepositions of place (in, at, near, between, opposite…)</li>
    <li>Two things you visited or did</li>
  </ul>
  <div style="background:#fef9c3;border-radius:6px;padding:8px;margin-top:10px;font-size:13px">📋 Marking: Grammar (10) · Vocabulary (8) · Structure (7)</div>
</div>`,
  },
  {
    id: 'en-test-p4', type: 'bilan',
    title: 'Score Summary & Progress',
    content: `<h3>📊 Score Summary — All Tests</h3>
<table style="width:100%;border-collapse:collapse;margin-bottom:20px">
  <thead><tr style="background:#1a56db;color:#fff">
    <th style="padding:10px">Test</th><th style="padding:10px">Topic</th><th style="padding:10px">My Score</th><th style="padding:10px">Pass Mark</th>
  </tr></thead>
  <tbody>
    <tr style="background:#f8fafc"><td style="padding:9px">Test 1</td><td style="padding:9px">Expressing Time</td><td style="padding:9px">&nbsp;&nbsp;&nbsp;/ 6</td><td style="padding:9px">5/6</td></tr>
    <tr><td style="padding:9px">Test 2</td><td style="padding:9px">Expressing a Place</td><td style="padding:9px">&nbsp;&nbsp;&nbsp;/ 4</td><td style="padding:9px">3/4</td></tr>
    <tr style="background:#f8fafc"><td style="padding:9px">Test 3</td><td style="padding:9px">All Prepositions</td><td style="padding:9px">&nbsp;&nbsp;&nbsp;/ 4</td><td style="padding:9px">3/4</td></tr>
    <tr><td style="padding:9px">Test 4</td><td style="padding:9px">A Letter from London</td><td style="padding:9px">&nbsp;&nbsp;&nbsp;/ 4</td><td style="padding:9px">3/4</td></tr>
    <tr style="background:#f8fafc"><td style="padding:9px">Test 5</td><td style="padding:9px">Travel & Adventure</td><td style="padding:9px">&nbsp;&nbsp;&nbsp;/ 3</td><td style="padding:9px">2/3</td></tr>
    <tr><td style="padding:9px">Test 6</td><td style="padding:9px">Vocabulary Review</td><td style="padding:9px">&nbsp;&nbsp;&nbsp;/ 4</td><td style="padding:9px">3/4</td></tr>
    <tr style="background:#eff6ff;font-weight:600"><td style="padding:9px">Mock 1</td><td style="padding:9px">Full Paper</td><td style="padding:9px">&nbsp;&nbsp;&nbsp;/ 20</td><td style="padding:9px">14/20</td></tr>
    <tr style="background:#eff6ff;font-weight:600"><td style="padding:9px">Mock 2</td><td style="padding:9px">Reading</td><td style="padding:9px">&nbsp;&nbsp;&nbsp;/ 20</td><td style="padding:9px">14/20</td></tr>
    <tr style="background:#eff6ff;font-weight:600"><td style="padding:9px">Mock 3</td><td style="padding:9px">Writing</td><td style="padding:9px">&nbsp;&nbsp;&nbsp;/ 25</td><td style="padding:9px">18/25</td></tr>
  </tbody>
</table>
<div style="background:#f0fdf4;border-left:4px solid #16a34a;border-radius:6px;padding:14px;margin-bottom:12px">
  <strong>✅ A1 English Self-check:</strong>
  <ul style="margin:8px 0 0 0">
    <li>☐ I can use prepositions of time correctly (on, in, at, for, since, ago, by, during)</li>
    <li>☐ I can describe locations using prepositions of place</li>
    <li>☐ I can write a simple letter or email in English</li>
    <li>☐ I can understand a short text and answer questions about it</li>
    <li>☐ I can use travel and everyday vocabulary at A1 level</li>
  </ul>
</div>
<div style="text-align:center;margin-top:16px">
  <div style="background:#1a56db;color:#fff;padding:12px 24px;border-radius:12px;display:inline-block;font-weight:700">
    🎓 Congratulations — You have completed the English A1 Assessment!
  </div>
</div>`,
  },
];

// ════════════════════════════════════════════════════════════
// ARABIC COURSE — اختبارات وتقييمات A1
// ════════════════════════════════════════════════════════════
const GREEN = '#16a34a';

const AR_PAGES = [
  {
    id: 'ar-test-p1', type: 'intro',
    title: 'اختبارات وتقييمات — مقدمة',
    content: `<div style="text-align:center;margin-bottom:16px">
  <span style="background:${GREEN};color:#fff;padding:6px 18px;border-radius:20px;font-size:13px;font-weight:600">📝 اختبارات وتقييمات — عربي A1</span>
</div>
<h2 style="text-align:center;direction:rtl">اختبارات نهاية الوحدة والامتحانات التجريبية</h2>
<p style="text-align:center;color:#555">قيّم مستواك في اللغة العربية A1 من خلال اختبارات منظمة وامتحانات تجريبية.</p>
<div style="background:#f0fdf4;border-left:4px solid ${GREEN};border-radius:6px;padding:14px;margin:16px 0">
  <strong>🎯 محتوى هذا القسم</strong>
  <ul style="margin:8px 0 0 0" dir="rtl">
    <li>6 اختبارات نهاية وحدة (واحد لكل موضوع)</li>
    <li>3 امتحانات تجريبية كاملة بمستوى A1</li>
    <li>شبكات تصحيح ذاتي ومتابعة النقاط</li>
    <li>نصائح للنجاح في تقييم مستوى A1 العربي</li>
  </ul>
</div>
<div style="background:#f0fdf4;border-right:4px solid ${GREEN};border-radius:6px;padding:12px;margin:16px 0;direction:rtl">
  <strong>📋 الوحدات المغطاة:</strong> التعبير عن الزمن · التعبير عن المكان · حروف الجر · رسالة من لندن · السفر والمغامرة · مراجعة المفردات
</div>`,
  },
  {
    id: 'ar-test-p2', type: 'lesson',
    title: 'اختبارات الوحدات — 1 إلى 6',
    content: `<h3>📝 اختبارات نهاية الوحدات</h3>
<p style="color:#555;margin-bottom:16px" dir="rtl">أكمل كل اختبار بعد إنهاء الوحدة المقابلة. استهدف نسبة 80% أو أكثر قبل المتابعة.</p>

<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:14px" dir="rtl">
  <h4 style="color:${GREEN};margin:0 0 8px 0">✏️ اختبار 1 — التعبير عن الزمن</h4>
  <p><strong>اختر حرف الجر المناسب:</strong></p>
  <ol>
    <li>وُلِدتُ ___ عام 1995. &nbsp;<em style="color:#888">(في / منذ / قبل)</em></li>
    <li>الاجتماع ___ الساعة التاسعة. &nbsp;<em style="color:#888">(في / على / من)</em></li>
    <li>أسكن هنا ___ ثلاث سنوات. &nbsp;<em style="color:#888">(منذ / قبل / بعد)</em></li>
    <li>وصلتُ ___ ساعتين. &nbsp;<em style="color:#888">(منذ / بعد / قبل)</em></li>
  </ol>
  <div style="background:#dcfce7;border-radius:6px;padding:8px;margin-top:10px;font-size:13px">✅ الإجابات: 1-في · 2-في · 3-منذ · 4-منذ</div>
</div>

<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:14px" dir="rtl">
  <h4 style="color:${GREEN};margin:0 0 8px 0">✏️ اختبار 2 — التعبير عن المكان</h4>
  <p><strong>اختر حرف الجر الصحيح:</strong></p>
  <ol>
    <li>الكتاب ___ الطاولة. &nbsp;<em style="color:#888">(على / في / من)</em></li>
    <li>القطة ___ الأريكة. &nbsp;<em style="color:#888">(تحت / فوق / بجانب)</em></li>
    <li>البنك ___ المدرسة والصيدلية. &nbsp;<em style="color:#888">(بين / أمام / خلف)</em></li>
    <li>أسكن ___ لندن. &nbsp;<em style="color:#888">(في / على / إلى)</em></li>
  </ol>
  <div style="background:#dcfce7;border-radius:6px;padding:8px;margin-top:10px;font-size:13px">✅ الإجابات: 1-على · 2-تحت · 3-بين · 4-في</div>
</div>

<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:14px" dir="rtl">
  <h4 style="color:${GREEN};margin:0 0 8px 0">✏️ اختبار 3 — حروف الجر</h4>
  <p><strong>أكمل بحرف الجر المناسب:</strong></p>
  <ol>
    <li>ذهبتُ ___ المدرسة. &nbsp;<em style="color:#888">(إلى / من / في)</em></li>
    <li>جئتُ ___ المغرب. &nbsp;<em style="color:#888">(من / إلى / في)</em></li>
    <li>أكتب ___ قلم. &nbsp;<em style="color:#888">(بـ / في / على)</em></li>
    <li>أتحدث ___ أستاذي كل يوم. &nbsp;<em style="color:#888">(مع / من / إلى)</em></li>
  </ol>
  <div style="background:#dcfce7;border-radius:6px;padding:8px;margin-top:10px;font-size:13px">✅ الإجابات: 1-إلى · 2-من · 3-بـ · 4-مع</div>
</div>

<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:14px" dir="rtl">
  <h4 style="color:${GREEN};margin:0 0 8px 0">✏️ اختبار 4 — رسالة من لندن</h4>
  <p><strong>صواب أم خطأ؟</strong></p>
  <ol>
    <li>لندن عاصمة إنجلترا. &nbsp;<em style="color:#888">(صواب / خطأ)</em></li>
    <li>"Big Ben" متحف مشهور في لندن. &nbsp;<em style="color:#888">(صواب / خطأ)</em></li>
    <li>"أتطلع إلى ردّك" تعني أنتظر ردّك. &nbsp;<em style="color:#888">(صواب / خطأ)</em></li>
    <li>الرسالة الرسمية تبدأ بـ "مرحبا يا صديقي". &nbsp;<em style="color:#888">(صواب / خطأ)</em></li>
  </ol>
  <div style="background:#dcfce7;border-radius:6px;padding:8px;margin-top:10px;font-size:13px">✅ الإجابات: 1-صواب · 2-خطأ (برج الساعة) · 3-صواب · 4-خطأ</div>
</div>

<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:14px" dir="rtl">
  <h4 style="color:${GREEN};margin:0 0 8px 0">✏️ اختبار 5 — السفر والمغامرة</h4>
  <p><strong>اختر المعنى الصحيح:</strong></p>
  <ol>
    <li>"السفر" يعني: &nbsp;<em style="color:#888">(أ) التنقل والرحلات / ب) النوم في المنزل)</em></li>
    <li>"الحقيبة" تعني: &nbsp;<em style="color:#888">(أ) جواز السفر / ب) الشنطة)</em></li>
    <li>"المغادرة" هي عكس: &nbsp;<em style="color:#888">(أ) الوصول / ب) السفر)</em></li>
  </ol>
  <div style="background:#dcfce7;border-radius:6px;padding:8px;margin-top:10px;font-size:13px">✅ الإجابات: 1-أ · 2-ب · 3-أ</div>
</div>

<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px" dir="rtl">
  <h4 style="color:${GREEN};margin:0 0 8px 0">✏️ اختبار 6 — مراجعة المفردات</h4>
  <p><strong>أكمل الجمل بالكلمة المناسبة:</strong></p>
  <ol>
    <li>___ من فضلك، أين المحطة؟ &nbsp;<em style="color:#888">(عفوًا / شكرًا / مرحبا)</em></li>
    <li>عُمْرِي ___ عشرين سنة. &nbsp;<em style="color:#888">(في / من / ـ)</em></li>
    <li>أنا ___ اللغة العربية. &nbsp;<em style="color:#888">(أُحِب / أذهب / أكتب)</em></li>
    <li>المستشفى ___ المدرسة. &nbsp;<em style="color:#888">(خلف / بعيد / فوق)</em></li>
  </ol>
  <div style="background:#dcfce7;border-radius:6px;padding:8px;margin-top:10px;font-size:13px">✅ الإجابات: 1-عفوًا · 2-ـ (لا حرف جر) · 3-أُحِب · 4-خلف</div>
</div>`,
  },
  {
    id: 'ar-test-p3', type: 'lesson',
    title: 'امتحانات تجريبية A1',
    content: `<h3>🏅 الامتحانات التجريبية A1</h3>
<p style="color:#555;margin-bottom:16px" dir="rtl">تدرّب على ظروف الامتحان الحقيقي. اقرأ كل تعليمة بعناية وأجب دون الرجوع إلى ملاحظاتك.</p>

<div style="background:#fff7ed;border:2px solid #f59e0b;border-radius:10px;padding:16px;margin-bottom:20px" dir="rtl">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
    <span style="background:#f59e0b;color:#fff;padding:3px 10px;border-radius:10px;font-size:12px;font-weight:700">🏅 الامتحان 1</span>
    <span style="color:#888;font-size:13px">الوقت: 20 دقيقة · 20 نقطة</span>
  </div>
  <p><strong>الجزء أ — اختيار متعدد (10 نقاط)</strong></p>
  <ol>
    <li>وُلِدتُ ___ القاهرة عام 2005. &nbsp;<em>(أ) في / ب) إلى / ج) من)</em></li>
    <li>الصيدلية ___ البنك والمدرسة. &nbsp;<em>(أ) بين / ب) فوق / ج) تحت)</em></li>
    <li>مفاتيحي ___ الطاولة. &nbsp;<em>(أ) في / ب) على / ج) إلى)</em></li>
    <li>سافر ___ الطائرة إلى دبي. &nbsp;<em>(أ) مع / ب) في / ج) بـ)</em></li>
    <li>وصلتُ ___ ثلاث ساعات. &nbsp;<em>(أ) منذ / ب) بعد / ج) خلال)</em></li>
  </ol>
  <p><strong>الجزء ب — أكمل الفراغات (10 نقاط)</strong></p>
  <p>استخدم: <em>منذ · إلى · من · على · في · بين · خلف · مع · بـ · أمام</em></p>
  <ol>
    <li>الاجتماع ___ يوم الاثنين ___ الساعة العاشرة.</li>
    <li>أعرفه ___ عام 2019.</li>
    <li>القطة تختبئ ___ الأريكة.</li>
    <li>ذهبتُ ___ المطار.</li>
    <li>المسجد ___ المدرسة والحديقة.</li>
  </ol>
  <div style="background:#fef9c3;border-radius:6px;padding:8px;margin-top:10px;font-size:13px">✅ الجزء أ: 1-في · 2-بين · 3-على · 4-بـ · 5-منذ &nbsp;|&nbsp; الجزء ب: 1-في/في · 2-منذ · 3-خلف · 4-إلى · 5-بين</div>
</div>

<div style="background:#fff7ed;border:2px solid #f59e0b;border-radius:10px;padding:16px;margin-bottom:20px" dir="rtl">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
    <span style="background:#f59e0b;color:#fff;padding:3px 10px;border-radius:10px;font-size:12px;font-weight:700">🏅 الامتحان 2</span>
    <span style="color:#888;font-size:13px">الوقت: 20 دقيقة · 20 نقطة</span>
  </div>
  <p><strong>فهم المقروء — رسالة</strong></p>
  <p style="background:#f8fafc;border-radius:6px;padding:12px;font-style:normal">
    "عزيزي أحمد، أكتب إليك من لندن! وصلتُ هنا يوم الاثنين وأنا أكتشف المدينة منذ ثلاثة أيام. أمس، زرتُ برج الساعة "بيغ بن" وجسر لندن. الطقس بارد ولكن مشمس. أتطلع إلى رؤيتك عند عودتي. مع تحياتي، سارة."
  </p>
  <p><strong>أجب على هذه الأسئلة:</strong></p>
  <ol>
    <li>متى وصلت سارة إلى لندن؟</li>
    <li>كم يوماً وهي تكتشف المدينة؟</li>
    <li>ما المكانان اللذان زارتهما أمس؟</li>
    <li>كيف الطقس؟</li>
    <li>ابحث عن حرفَي جر للزمن في الرسالة.</li>
  </ol>
  <div style="background:#fef9c3;border-radius:6px;padding:8px;margin-top:10px;font-size:13px">✅ 1-الاثنين · 2-ثلاثة أيام · 3-بيغ بن وجسر لندن · 4-بارد ومشمس · 5-يوم / منذ</div>
</div>

<div style="background:#fff7ed;border:2px solid #f59e0b;border-radius:10px;padding:16px" dir="rtl">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
    <span style="background:#f59e0b;color:#fff;padding:3px 10px;border-radius:10px;font-size:12px;font-weight:700">🏅 الامتحان 3</span>
    <span style="color:#888;font-size:13px">الوقت: 25 دقيقة · 25 نقطة</span>
  </div>
  <p><strong>مهمة كتابية</strong> — اكتب رسالة قصيرة (8–10 جمل) إلى صديق تصف فيها رحلة قمت بها. اذكر:</p>
  <ul>
    <li>متى سافرت وكم مدة إقامتك</li>
    <li>3 حروف جر للزمن على الأقل (في، منذ، قبل، بعد…)</li>
    <li>3 حروف جر للمكان على الأقل (في، أمام، خلف، بين، بجانب…)</li>
    <li>مكانان زرتهما أو شيئان قمت بهما</li>
  </ul>
  <div style="background:#fef9c3;border-radius:6px;padding:8px;margin-top:10px;font-size:13px">📋 التصحيح: القواعد (10) · المفردات (8) · التركيب (7)</div>
</div>`,
  },
  {
    id: 'ar-test-p4', type: 'bilan',
    title: 'ملخص النتائج والتقدم',
    content: `<h3>📊 ملخص النتائج — جميع الاختبارات</h3>
<table style="width:100%;border-collapse:collapse;margin-bottom:20px" dir="rtl">
  <thead><tr style="background:${GREEN};color:#fff">
    <th style="padding:10px">الاختبار</th><th style="padding:10px">الموضوع</th><th style="padding:10px">نقطتي</th><th style="padding:10px">النجاح</th>
  </tr></thead>
  <tbody>
    <tr style="background:#f8fafc"><td style="padding:9px">اختبار 1</td><td style="padding:9px">التعبير عن الزمن</td><td style="padding:9px">&nbsp;&nbsp;&nbsp;/ 4</td><td style="padding:9px">3/4</td></tr>
    <tr><td style="padding:9px">اختبار 2</td><td style="padding:9px">التعبير عن المكان</td><td style="padding:9px">&nbsp;&nbsp;&nbsp;/ 4</td><td style="padding:9px">3/4</td></tr>
    <tr style="background:#f8fafc"><td style="padding:9px">اختبار 3</td><td style="padding:9px">حروف الجر</td><td style="padding:9px">&nbsp;&nbsp;&nbsp;/ 4</td><td style="padding:9px">3/4</td></tr>
    <tr><td style="padding:9px">اختبار 4</td><td style="padding:9px">رسالة من لندن</td><td style="padding:9px">&nbsp;&nbsp;&nbsp;/ 4</td><td style="padding:9px">3/4</td></tr>
    <tr style="background:#f8fafc"><td style="padding:9px">اختبار 5</td><td style="padding:9px">السفر والمغامرة</td><td style="padding:9px">&nbsp;&nbsp;&nbsp;/ 3</td><td style="padding:9px">2/3</td></tr>
    <tr><td style="padding:9px">اختبار 6</td><td style="padding:9px">مراجعة المفردات</td><td style="padding:9px">&nbsp;&nbsp;&nbsp;/ 4</td><td style="padding:9px">3/4</td></tr>
    <tr style="background:#f0fdf4;font-weight:600"><td style="padding:9px">امتحان 1</td><td style="padding:9px">ورقة كاملة</td><td style="padding:9px">&nbsp;&nbsp;&nbsp;/ 20</td><td style="padding:9px">14/20</td></tr>
    <tr style="background:#f0fdf4;font-weight:600"><td style="padding:9px">امتحان 2</td><td style="padding:9px">فهم المقروء</td><td style="padding:9px">&nbsp;&nbsp;&nbsp;/ 20</td><td style="padding:9px">14/20</td></tr>
    <tr style="background:#f0fdf4;font-weight:600"><td style="padding:9px">امتحان 3</td><td style="padding:9px">التعبير الكتابي</td><td style="padding:9px">&nbsp;&nbsp;&nbsp;/ 25</td><td style="padding:9px">18/25</td></tr>
  </tbody>
</table>
<div style="background:#f0fdf4;border-right:4px solid ${GREEN};border-radius:6px;padding:14px;margin-bottom:12px" dir="rtl">
  <strong>✅ تقييم ذاتي — مستوى A1 عربي:</strong>
  <ul style="margin:8px 0 0 0">
    <li>☐ أستطيع استخدام حروف الجر الزمنية بشكل صحيح (في، منذ، قبل، بعد، خلال)</li>
    <li>☐ أستطيع وصف المواقع باستخدام حروف الجر المكانية</li>
    <li>☐ أستطيع كتابة رسالة بسيطة باللغة العربية</li>
    <li>☐ أستطيع فهم نص قصير والإجابة على أسئلة حوله</li>
    <li>☐ أتقن مفردات السفر والحياة اليومية بمستوى A1</li>
  </ul>
</div>
<div style="text-align:center;margin-top:16px" dir="rtl">
  <div style="background:${GREEN};color:#fff;padding:12px 24px;border-radius:12px;display:inline-block;font-weight:700">
    🎓 مبروك — لقد أكملتَ تقييم اللغة العربية A1!
  </div>
</div>`,
  },
];

// ════════════════════════════════════════════════════════════
// QCM exercises for both courses
// ════════════════════════════════════════════════════════════
const QCM_EN_TESTS = [
  { id: 'ent-1', question: 'She was born ___ 1998.', options: ['at', 'on', 'in', 'by'], answer: 2 },
  { id: 'ent-2', question: 'The keys are ___ the table.', options: ['in', 'on', 'at', 'by'], answer: 1 },
  { id: 'ent-3', question: 'He has lived here ___ five years.', options: ['since', 'for', 'ago', 'at'], answer: 1 },
  { id: 'ent-4', question: 'The bank is ___ the pharmacy and the library.', options: ['above', 'between', 'under', 'on'], answer: 1 },
  { id: 'ent-5', question: 'She traveled ___ plane to London.', options: ['on', 'with', 'in', 'by'], answer: 3 },
  { id: 'ent-6', question: 'I have studied here ___ 2020.', options: ['for', 'ago', 'since', 'during'], answer: 2 },
  { id: 'ent-7', question: 'Please finish the report ___ Friday.', options: ['until', 'by', 'during', 'in'], answer: 1 },
  { id: 'ent-8', question: 'London is the capital of ___.', options: ['France', 'Germany', 'England', 'Spain'], answer: 2 },
];

const QCM_AR_TESTS = [
  { id: 'art-1', question: 'وُلِدتُ ___ عام 2000.', options: ['على', 'في', 'إلى', 'من'], answer: 1 },
  { id: 'art-2', question: 'الكتاب ___ الطاولة.', options: ['في', 'من', 'على', 'إلى'], answer: 2 },
  { id: 'art-3', question: 'أسكن هنا ___ خمس سنوات.', options: ['قبل', 'منذ', 'بعد', 'خلال'], answer: 1 },
  { id: 'art-4', question: 'البنك ___ المدرسة والصيدلية.', options: ['فوق', 'بين', 'تحت', 'خلف'], answer: 1 },
  { id: 'art-5', question: 'سافرتُ ___ الطائرة إلى لندن.', options: ['في', 'مع', 'بـ', 'من'], answer: 2 },
  { id: 'art-6', question: 'جئتُ ___ المغرب.', options: ['إلى', 'في', 'من', 'على'], answer: 2 },
  { id: 'art-7', question: '"أتطلع إلى ردّك" يعني:', options: ['أنا غاضب منك', 'أنتظر ردّك بشوق', 'لا أريد ردًا', 'نسيتُك'], answer: 1 },
  { id: 'art-8', question: 'عاصمة إنجلترا هي:', options: ['باريس', 'مدريد', 'لندن', 'برلين'], answer: 2 },
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

  // ── Create English course ──────────────────────────────────
  try {
    const enCourse = await pb.collection('courses').create({
      titre:         'Tests & Assessments (A1 English)',
      description:   'End-of-unit tests and A1 mock exam papers. Validate your English A1 level with 6 unit tests and 3 complete mock exams.',
      langue:        'Anglais',
      course_type:   'standard',
      cours_nom:     'Anglais',
      niveau:        'A1',
      instructeur:   'IWS Laayoune',
      section:       'langues',
      categorie:     'langue',
      categorie_age: 'Ados (13-17 ans)',
      duree:         30,
      prix:          0,
      pages:         JSON.stringify(EN_PAGES),
      exercises:     JSON.stringify(QCM_EN_TESTS),
    });
    console.log(`  ✅ Created English course: "${enCourse.titre}" [${enCourse.id}]`);
  } catch (err) {
    console.error(`  ❌ English course failed: ${err.message}`);
    if (err?.data) console.error('  Details:', JSON.stringify(err.data, null, 2));
  }

  // ── Create Arabic course ───────────────────────────────────
  try {
    const arCourse = await pb.collection('courses').create({
      titre:         'اختبارات وتقييمات — Tests & Assessments (A1)',
      description:   'Evaluate your A1 Arabic level with 6 unit tests and 3 complete mock exams. Self-correction grids included.',
      langue:        'Arabe',
      course_type:   'standard',
      cours_nom:     'Arabe',
      niveau:        'A1',
      instructeur:   'IWS Laayoune',
      section:       'langues',
      categorie:     'langue',
      categorie_age: 'Ados (13-17 ans)',
      duree:         30,
      prix:          0,
      pages:         JSON.stringify(AR_PAGES),
      exercises:     JSON.stringify(QCM_AR_TESTS),
    });
    console.log(`  ✅ Created Arabic course: "${arCourse.titre}" [${arCourse.id}]`);
  } catch (err) {
    console.error(`  ❌ Arabic course failed: ${err.message}`);
    if (err?.data) console.error('  Details:', JSON.stringify(err.data, null, 2));
  }

  console.log('\n════════════════════════════════════════════');
  console.log('✅ Done');
  console.log('════════════════════════════════════════════');
}

main().catch(err => {
  console.error('Fatal:', err?.data ? JSON.stringify(err.data) : err.message);
  process.exit(1);
});
