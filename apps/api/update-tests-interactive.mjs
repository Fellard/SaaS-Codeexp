/**
 * update-tests-interactive.mjs
 * ════════════════════════════════════════════════════════════
 * Remplace le contenu statique des cours tests EN + AR
 * par des pages 100% interactives :
 *   - Boutons radio cliquables par question
 *   - Bouton "Check my answers / تحقق من إجاباتك"
 *   - Feedback ✅/❌ par question
 *   - Score affiché après correction
 *
 * Usage :  cd apps/api && node update-tests-interactive.mjs
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

// ── shared CSS + JS injected into every interactive page ────
function buildPage(lang, quizId, title, intro, questions, checkLabel, scoreLabel) {
  // questions: [{text, options:[{val,label}], correct, explanation}]
  const qHtml = questions.map((q, i) => {
    const name = `${quizId}_q${i}`;
    const opts = q.options.map(o => `
      <label class="iws-opt" id="${name}_${o.val}">
        <input type="radio" name="${name}" value="${o.val}" onchange="iwsClear('${quizId}')"/>
        <span class="iws-opt-box"></span>
        <span class="iws-opt-text">${o.label}</span>
      </label>`).join('');
    return `
    <div class="iws-q" id="${quizId}_q${i}_block" ${lang === 'ar' ? 'dir="rtl"' : ''}>
      <p class="iws-q-text"><span class="iws-q-num">${i + 1}</span> ${q.text}</p>
      <div class="iws-opts">${opts}</div>
      <div class="iws-feedback" id="${quizId}_q${i}_fb"></div>
    </div>`;
  }).join('');

  const correctJson = JSON.stringify(questions.map(q => q.correct));
  const explJson    = JSON.stringify(questions.map(q => q.explanation || ''));

  return `<style>
.iws-wrap{font-family:inherit;max-width:720px;margin:0 auto}
.iws-intro{background:#f0f9ff;border-left:4px solid #2563eb;border-radius:8px;padding:14px 16px;margin-bottom:20px;font-size:14px}
.iws-intro[dir=rtl]{border-left:none;border-right:4px solid #16a34a}
.iws-q{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px 18px;margin-bottom:12px;transition:border .2s}
.iws-q.correct{border-color:#16a34a;background:#f0fdf4}
.iws-q.wrong{border-color:#dc2626;background:#fef2f2}
.iws-q-text{font-weight:600;margin:0 0 12px 0;font-size:15px;color:#1e293b}
.iws-q-num{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;background:#2563eb;color:#fff;border-radius:50%;font-size:12px;font-weight:700;margin-right:8px;flex-shrink:0}
.iws-q[dir=rtl] .iws-q-num{margin-right:0;margin-left:8px}
.iws-opts{display:flex;flex-direction:column;gap:8px}
.iws-opt{display:flex;align-items:center;gap:10px;cursor:pointer;padding:8px 12px;border-radius:8px;border:1px solid #e5e7eb;transition:background .15s,border .15s;user-select:none}
.iws-opt:hover{background:#f1f5f9;border-color:#93c5fd}
.iws-opt input{display:none}
.iws-opt-box{width:18px;height:18px;border-radius:50%;border:2px solid #94a3b8;flex-shrink:0;transition:all .15s;position:relative}
.iws-opt input:checked ~ .iws-opt-box{border-color:#2563eb;background:#2563eb}
.iws-opt input:checked ~ .iws-opt-box::after{content:'';position:absolute;width:6px;height:6px;background:#fff;border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%)}
.iws-opt input:checked ~ .iws-opt-text{font-weight:600;color:#1e40af}
.iws-opt.opt-correct{background:#dcfce7;border-color:#16a34a}
.iws-opt.opt-correct .iws-opt-box{border-color:#16a34a;background:#16a34a}
.iws-opt.opt-wrong{background:#fee2e2;border-color:#dc2626}
.iws-opt.opt-wrong .iws-opt-box{border-color:#dc2626;background:#dc2626}
.iws-feedback{font-size:13px;margin-top:8px;padding:6px 10px;border-radius:6px;display:none}
.iws-feedback.show{display:block}
.iws-feedback.ok{background:#dcfce7;color:#166534}
.iws-feedback.ko{background:#fee2e2;color:#991b1b}
.iws-btn{display:inline-flex;align-items:center;gap:8px;background:#2563eb;color:#fff;border:none;padding:11px 24px;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;margin-top:8px;transition:background .2s}
.iws-btn:hover{background:#1d4ed8}
.iws-btn.ar{background:#16a34a}.iws-btn.ar:hover{background:#15803d}
.iws-score{display:none;margin-top:16px;padding:14px 18px;border-radius:10px;font-size:15px;font-weight:600;text-align:center}
.iws-score.show{display:block}
.iws-score.pass{background:#dcfce7;color:#166534;border:2px solid #16a34a}
.iws-score.fail{background:#fee2e2;color:#991b1b;border:2px solid #dc2626}
.iws-reset{background:transparent;color:#64748b;border:1px solid #e2e8f0;padding:8px 16px;border-radius:8px;font-size:13px;cursor:pointer;margin-top:8px;margin-left:8px}
.iws-reset:hover{background:#f1f5f9}
</style>
<script>
function iwsClear(qid){document.getElementById(qid+'_score').classList.remove('show')}
function iwsCheck(qid,correct,expl,total,passScore,passMsg,failMsg,scoreLabel){
  var score=0;
  for(var i=0;i<correct.length;i++){
    var block=document.getElementById(qid+'_q'+i+'_block');
    var fb=document.getElementById(qid+'_q'+i+'_fb');
    var sel=document.querySelector('input[name="'+qid+'_q'+i+'"]:checked');
    var labels=document.querySelectorAll('[id^="'+qid+'_q'+i+'_"]');
    // reset
    block.classList.remove('correct','wrong');
    fb.className='iws-feedback';fb.textContent='';
    document.querySelectorAll('input[name="'+qid+'_q'+i+'"]').forEach(function(inp){
      inp.parentElement.classList.remove('opt-correct','opt-wrong');
    });
    if(!sel){fb.className='iws-feedback ko show';fb.textContent='⚠️ No answer selected.';block.classList.add('wrong');continue;}
    var userVal=sel.value;
    var corrVal=correct[i];
    // mark correct option always green
    var corrEl=document.getElementById(qid+'_q'+i+'_'+corrVal);
    if(corrEl)corrEl.classList.add('opt-correct');
    if(userVal===corrVal){
      score++;block.classList.add('correct');
      fb.className='iws-feedback ok show';fb.textContent='✅ '+(expl[i]||'Correct!');
    } else {
      block.classList.add('wrong');
      var wrongEl=document.getElementById(qid+'_q'+i+'_'+userVal);
      if(wrongEl)wrongEl.classList.add('opt-wrong');
      fb.className='iws-feedback ko show';fb.textContent='❌ '+(expl[i]||'Incorrect.');
    }
  }
  var sc=document.getElementById(qid+'_score');
  sc.textContent=scoreLabel+': '+score+'/'+total+' — '+(score>=passScore?'🎉 '+passMsg:'📚 '+failMsg);
  sc.className='iws-score show '+(score>=passScore?'pass':'fail');
}
function iwsReset(qid,n){
  for(var i=0;i<n;i++){
    var block=document.getElementById(qid+'_q'+i+'_block');
    var fb=document.getElementById(qid+'_q'+i+'_fb');
    block.classList.remove('correct','wrong');
    fb.className='iws-feedback';fb.textContent='';
    document.querySelectorAll('input[name="'+qid+'_q'+i+'"]').forEach(function(inp){
      inp.checked=false;inp.parentElement.classList.remove('opt-correct','opt-wrong');
    });
  }
  document.getElementById(qid+'_score').classList.remove('show');
}
</script>
<div class="iws-wrap">
  <div class="iws-intro" ${lang==='ar'?'dir="rtl"':''}>${intro}</div>
  ${qHtml}
  <div style="display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-top:4px">
    <button class="iws-btn ${lang==='ar'?'ar':''}" onclick="iwsCheck('${quizId}',${correctJson},${explJson},${questions.length},${Math.ceil(questions.length*0.7)},'Great job! Keep it up!','Review and try again.',${JSON.stringify(scoreLabel)})">${checkLabel}</button>
    <button class="iws-reset" onclick="iwsReset('${quizId}',${questions.length})">🔄 Reset</button>
  </div>
  <div class="iws-score" id="${quizId}_score"></div>
</div>`;
}

// ════════════════════════════════════════════════════════════
// ENGLISH — Test pages
// ════════════════════════════════════════════════════════════

const enIntro = `<strong>📝 End-of-Unit Tests</strong><br/>
Complete each test after finishing the corresponding unit. Select your answer for each question, then click <strong>Check my answers</strong>. You need <strong>70%</strong> or above to pass.`;

const EN_TEST_PAGE = buildPage('en', 'en_tests', 'End-of-Unit Tests', enIntro, [
  // Test 1 — Time
  { text: '<em>[Time]</em> She was born ___ 1995.', options:[{val:'a',label:'at'},{val:'b',label:'on'},{val:'c',label:'in'},{val:'d',label:'by'}], correct:'c', explanation:'We use <strong>in</strong> with years.' },
  { text: '<em>[Time]</em> The meeting starts ___ 9 o\'clock.', options:[{val:'a',label:'in'},{val:'b',label:'on'},{val:'c',label:'at'},{val:'d',label:'by'}], correct:'c', explanation:'We use <strong>at</strong> with clock times.' },
  { text: '<em>[Time]</em> She has lived here ___ three years.', options:[{val:'a',label:'since'},{val:'b',label:'for'},{val:'c',label:'ago'},{val:'d',label:'during'}], correct:'b', explanation:'<strong>For</strong> is used with a duration (3 years).' },
  { text: '<em>[Time]</em> They arrived two hours ___.', options:[{val:'a',label:'before'},{val:'b',label:'since'},{val:'c',label:'ago'},{val:'d',label:'after'}], correct:'c', explanation:'<strong>Ago</strong> goes after a time duration to refer to the past.' },
  { text: '<em>[Time]</em> Please finish the report ___ Friday.', options:[{val:'a',label:'until'},{val:'b',label:'by'},{val:'c',label:'during'},{val:'d',label:'since'}], correct:'b', explanation:'<strong>By</strong> means "no later than" a deadline.' },
  // Test 2 — Place
  { text: '<em>[Place]</em> The book is ___ the table.', options:[{val:'a',label:'in'},{val:'b',label:'on'},{val:'c',label:'at'},{val:'d',label:'above'}], correct:'b', explanation:'<strong>On</strong> is used for surfaces.' },
  { text: '<em>[Place]</em> She lives ___ London.', options:[{val:'a',label:'at'},{val:'b',label:'on'},{val:'c',label:'in'},{val:'d',label:'near'}], correct:'c', explanation:'<strong>In</strong> is used for cities and countries.' },
  { text: '<em>[Place]</em> The cat is hiding ___ the sofa.', options:[{val:'a',label:'above'},{val:'b',label:'near'},{val:'c',label:'under'},{val:'d',label:'opposite'}], correct:'c', explanation:'<strong>Under</strong> means below something.' },
  { text: '<em>[Place]</em> The bank is ___ the post office and the library.', options:[{val:'a',label:'next to'},{val:'b',label:'between'},{val:'c',label:'behind'},{val:'d',label:'above'}], correct:'b', explanation:'<strong>Between</strong> is used for two reference points.' },
  // Test 3 — Prepositions
  { text: '<em>[Prepositions]</em> He traveled ___ bus from Paris to Lyon.', options:[{val:'a',label:'with'},{val:'b',label:'by'},{val:'c',label:'on'},{val:'d',label:'in'}], correct:'b', explanation:'<strong>By</strong> is used with means of transport.' },
  { text: '<em>[Prepositions]</em> She is interested ___ learning languages.', options:[{val:'a',label:'about'},{val:'b',label:'for'},{val:'c',label:'in'},{val:'d',label:'at'}], correct:'c', explanation:'"Interested <strong>in</strong>" is a fixed expression.' },
  { text: '<em>[Prepositions]</em> He apologized ___ being late.', options:[{val:'a',label:'for'},{val:'b',label:'of'},{val:'c',label:'about'},{val:'d',label:'to'}], correct:'a', explanation:'"Apologize <strong>for</strong>" is a fixed expression.' },
], '✅ Check my answers', 'Score');

const enMock1Intro = `<strong>🏅 Mock Exam 1</strong> — Time limit: 20 minutes · 10 questions<br/>
Read each question carefully and select the best answer. You need <strong>7/10</strong> to pass.`;

const EN_MOCK1_PAGE = buildPage('en', 'en_mock1', 'Mock Exam 1', enMock1Intro, [
  { text: 'She has lived in Madrid ___ five years.', options:[{val:'a',label:'since'},{val:'b',label:'for'},{val:'c',label:'ago'},{val:'d',label:'at'}], correct:'b', explanation:'<strong>For</strong> + duration (5 years).' },
  { text: 'The supermarket is ___ the bank and the pharmacy.', options:[{val:'a',label:'above'},{val:'b',label:'between'},{val:'c',label:'under'},{val:'d',label:'on'}], correct:'b', explanation:'<strong>Between</strong> = in the middle of two things.' },
  { text: 'My keys are ___ the table.', options:[{val:'a',label:'in'},{val:'b',label:'on'},{val:'c',label:'at'},{val:'d',label:'by'}], correct:'b', explanation:'<strong>On</strong> for flat surfaces.' },
  { text: 'He traveled ___ plane to New York.', options:[{val:'a',label:'with'},{val:'b',label:'on'},{val:'c',label:'by'},{val:'d',label:'in'}], correct:'c', explanation:'<strong>By</strong> + transport (by plane, by train…).' },
  { text: 'I was born ___ a sunny day ___ July. (choose the first blank)', options:[{val:'a',label:'on'},{val:'b',label:'at'},{val:'c',label:'in'},{val:'d',label:'by'}], correct:'a', explanation:'<strong>On</strong> + specific day/date.' },
  { text: 'The meeting is ___ Monday ___ 10 a.m. (choose the second blank)', options:[{val:'a',label:'on'},{val:'b',label:'at'},{val:'c',label:'in'},{val:'d',label:'by'}], correct:'b', explanation:'<strong>At</strong> + clock time.' },
  { text: 'I have known her ___ 2018.', options:[{val:'a',label:'for'},{val:'b',label:'ago'},{val:'c',label:'since'},{val:'d',label:'during'}], correct:'c', explanation:'<strong>Since</strong> + point in time (2018).' },
  { text: 'He arrived two hours ___.', options:[{val:'a',label:'since'},{val:'b',label:'ago'},{val:'c',label:'before'},{val:'d',label:'for'}], correct:'b', explanation:'<strong>Ago</strong> = time before now.' },
  { text: 'The cat is hiding ___ the sofa.', options:[{val:'a',label:'above'},{val:'b',label:'on'},{val:'c',label:'over'},{val:'d',label:'under'}], correct:'d', explanation:'<strong>Under</strong> = below.' },
  { text: 'The café is ___ the museum and the park.', options:[{val:'a',label:'next to'},{val:'b',label:'opposite'},{val:'c',label:'between'},{val:'d',label:'behind'}], correct:'c', explanation:'<strong>Between</strong> = with two reference points.' },
], '🏅 Submit Mock Exam 1', 'Your score');

const EN_MOCK2_PAGE = buildPage('en', 'en_mock2', 'Mock Exam 2 — Reading', `<strong>🏅 Mock Exam 2 — Reading Comprehension</strong><br/>
Read the letter carefully, then answer all questions. 8 questions · pass mark: 6/8.
<br/><br/><blockquote style="background:#f8fafc;border-left:3px solid #2563eb;padding:12px 16px;border-radius:6px;font-style:italic;margin:10px 0">
"Dear Sarah, I am writing to you from London! I arrived here <u>on</u> Monday and I have been exploring the city <u>for</u> three days. Yesterday, I visited Big Ben and the Tower of London. The weather has been cold but sunny. I look forward to seeing you when I get back. <em>Yours sincerely</em>, Emma."
</blockquote>`, [
  { text: 'When did Emma arrive in London?', options:[{val:'a',label:'On Sunday'},{val:'b',label:'On Monday'},{val:'c',label:'On Friday'},{val:'d',label:'Yesterday'}], correct:'b', explanation:'The letter says "I arrived here <strong>on Monday</strong>".' },
  { text: 'How long has she been exploring the city?', options:[{val:'a',label:'One day'},{val:'b',label:'One week'},{val:'c',label:'Three days'},{val:'d',label:'Two months'}], correct:'c', explanation:'"I have been exploring the city <strong>for three days</strong>".' },
  { text: 'What famous place did Emma visit?', options:[{val:'a',label:'The Eiffel Tower'},{val:'b',label:'Big Ben'},{val:'c',label:'The Colosseum'},{val:'d',label:'Notre-Dame'}], correct:'b', explanation:'She visited <strong>Big Ben</strong> and the Tower of London.' },
  { text: 'How is the weather?', options:[{val:'a',label:'Hot and rainy'},{val:'b',label:'Sunny and warm'},{val:'c',label:'Cold but sunny'},{val:'d',label:'Cloudy and grey'}], correct:'c', explanation:'"The weather has been <strong>cold but sunny</strong>".' },
  { text: 'What does "I look forward to seeing you" mean?', options:[{val:'a',label:'I am angry at you'},{val:'b',label:'I hope to see you soon'},{val:'c',label:'I don\'t want to see you'},{val:'d',label:'I saw you yesterday'}], correct:'b', explanation:'"Look forward to" means to be excited about a future event.' },
  { text: 'Which preposition of time is used with "Monday"?', options:[{val:'a',label:'in'},{val:'b',label:'at'},{val:'c',label:'on'},{val:'d',label:'by'}], correct:'c', explanation:'We use <strong>on</strong> with days of the week.' },
  { text: 'Which preposition of time is used with "three days"?', options:[{val:'a',label:'since'},{val:'b',label:'ago'},{val:'c',label:'for'},{val:'d',label:'during'}], correct:'c', explanation:'We use <strong>for</strong> with a duration.' },
  { text: 'How do you close a formal letter in English?', options:[{val:'a',label:'See ya!'},{val:'b',label:'Yours sincerely,'},{val:'c',label:'Bye!'},{val:'d',label:'Later!'}], correct:'b', explanation:'"<strong>Yours sincerely</strong>" is the standard formal closing.' },
], '🏅 Submit Mock Exam 2', 'Your score');

// ════════════════════════════════════════════════════════════
// ARABIC — Test pages
// ════════════════════════════════════════════════════════════

const arIntro = `<strong>📝 اختبارات نهاية الوحدات</strong><br/>
أكمل كل اختبار بعد إنهاء الوحدة المقابلة. اختر إجابتك لكل سؤال ثم انقر على <strong>تحقق من إجاباتك</strong>. تحتاج إلى <strong>70%</strong> أو أكثر للنجاح.`;

const AR_TEST_PAGE = buildPage('ar', 'ar_tests', 'اختبارات الوحدات', arIntro, [
  // Time
  { text: '<em>[الزمن]</em> وُلِدتُ ___ عام 1995.', options:[{val:'a',label:'على'},{val:'b',label:'في'},{val:'c',label:'إلى'},{val:'d',label:'من'}], correct:'b', explanation:'نستخدم <strong>في</strong> مع السنوات والأوقات الزمنية العامة.' },
  { text: '<em>[الزمن]</em> أسكن هنا ___ خمس سنوات.', options:[{val:'a',label:'قبل'},{val:'b',label:'بعد'},{val:'c',label:'منذ'},{val:'d',label:'خلال'}], correct:'c', explanation:'<strong>منذ</strong> تدل على بداية الفترة وامتدادها حتى الآن.' },
  { text: '<em>[الزمن]</em> وصلتُ ___ ساعتين.', options:[{val:'a',label:'منذ'},{val:'b',label:'بعد'},{val:'c',label:'قبل'},{val:'d',label:'خلال'}], correct:'a', explanation:'<strong>منذ ساعتين</strong> = قبل ساعتين حتى الآن.' },
  { text: '<em>[الزمن]</em> سأسافر ___ غد.', options:[{val:'a',label:'في'},{val:'b',label:'منذ'},{val:'c',label:'من'},{val:'d',label:'على'}], correct:'a', explanation:'نستخدم <strong>في</strong> مع اليوم التالي.' },
  // Place
  { text: '<em>[المكان]</em> الكتاب ___ الطاولة.', options:[{val:'a',label:'من'},{val:'b',label:'إلى'},{val:'c',label:'على'},{val:'d',label:'في'}], correct:'c', explanation:'<strong>على</strong> تدل على وجود شيء فوق سطح.' },
  { text: '<em>[المكان]</em> القطة ___ الأريكة.', options:[{val:'a',label:'فوق'},{val:'b',label:'تحت'},{val:'c',label:'بجانب'},{val:'d',label:'أمام'}], correct:'b', explanation:'<strong>تحت</strong> = في الجهة السفلى.' },
  { text: '<em>[المكان]</em> أسكن ___ لندن.', options:[{val:'a',label:'إلى'},{val:'b',label:'على'},{val:'c',label:'من'},{val:'d',label:'في'}], correct:'d', explanation:'<strong>في</strong> تستخدم للإقامة في مدينة أو بلد.' },
  { text: '<em>[المكان]</em> البنك ___ المدرسة والصيدلية.', options:[{val:'a',label:'فوق'},{val:'b',label:'خلف'},{val:'c',label:'بين'},{val:'d',label:'أمام'}], correct:'c', explanation:'<strong>بين</strong> = في المنتصف بين شيئين.' },
  // Prepositions
  { text: '<em>[حروف الجر]</em> ذهبتُ ___ المدرسة.', options:[{val:'a',label:'في'},{val:'b',label:'إلى'},{val:'c',label:'من'},{val:'d',label:'على'}], correct:'b', explanation:'<strong>إلى</strong> تدل على الاتجاه نحو مكان.' },
  { text: '<em>[حروف الجر]</em> جئتُ ___ المغرب.', options:[{val:'a',label:'إلى'},{val:'b',label:'في'},{val:'c',label:'من'},{val:'d',label:'على'}], correct:'c', explanation:'<strong>من</strong> تدل على المنشأ أو نقطة البداية.' },
  { text: '<em>[حروف الجر]</em> أكتب ___ قلم.', options:[{val:'a',label:'في'},{val:'b',label:'على'},{val:'c',label:'بـ'},{val:'d',label:'من'}], correct:'c', explanation:'<strong>بـ</strong> تستخدم للأداة أو الوسيلة.' },
], '✅ تحقق من إجاباتك', 'نتيجتك');

const AR_MOCK1_PAGE = buildPage('ar', 'ar_mock1', 'الامتحان التجريبي 1', `<strong>🏅 الامتحان التجريبي 1</strong> — الوقت: 20 دقيقة · 10 أسئلة<br/>
اقرأ كل سؤال بعناية واختر أفضل إجابة. تحتاج إلى <strong>7/10</strong> للنجاح.`, [
  { text: 'وُلِدتُ ___ القاهرة عام 2005.', options:[{val:'a',label:'إلى'},{val:'b',label:'في'},{val:'c',label:'على'},{val:'d',label:'من'}], correct:'b', explanation:'<strong>في</strong> تستخدم مع أسماء المدن والبلدان.' },
  { text: 'الصيدلية ___ البنك والمدرسة.', options:[{val:'a',label:'فوق'},{val:'b',label:'تحت'},{val:'c',label:'بين'},{val:'d',label:'خلف'}], correct:'c', explanation:'<strong>بين</strong> = في المنتصف بين شيئين.' },
  { text: 'مفاتيحي ___ الطاولة.', options:[{val:'a',label:'في'},{val:'b',label:'على'},{val:'c',label:'إلى'},{val:'d',label:'من'}], correct:'b', explanation:'<strong>على</strong> تستخدم لوصف موقع شيء فوق سطح.' },
  { text: 'سافر ___ الطائرة إلى دبي.', options:[{val:'a',label:'مع'},{val:'b',label:'في'},{val:'c',label:'بـ'},{val:'d',label:'من'}], correct:'c', explanation:'<strong>بـ</strong> تستخدم مع وسائل التنقل.' },
  { text: 'وصلتُ ___ ثلاث ساعات.', options:[{val:'a',label:'بعد'},{val:'b',label:'منذ'},{val:'c',label:'قبل'},{val:'d',label:'خلال'}], correct:'b', explanation:'<strong>منذ ثلاث ساعات</strong> = قبل ثلاث ساعات حتى الآن.' },
  { text: 'الاجتماع ___ يوم الاثنين.', options:[{val:'a',label:'من'},{val:'b',label:'إلى'},{val:'c',label:'في'},{val:'d',label:'على'}], correct:'c', explanation:'<strong>في</strong> تستخدم مع أيام الأسبوع.' },
  { text: 'أعرفه ___ عام 2019.', options:[{val:'a',label:'بعد'},{val:'b',label:'منذ'},{val:'c',label:'قبل'},{val:'d',label:'في'}], correct:'b', explanation:'<strong>منذ</strong> + نقطة في الزمن = since.' },
  { text: 'القطة تختبئ ___ الأريكة.', options:[{val:'a',label:'فوق'},{val:'b',label:'أمام'},{val:'c',label:'خلف'},{val:'d',label:'تحت'}], correct:'d', explanation:'<strong>تحت</strong> = أسفل شيء.' },
  { text: 'ذهبتُ ___ المطار.', options:[{val:'a',label:'في'},{val:'b',label:'من'},{val:'c',label:'إلى'},{val:'d',label:'على'}], correct:'c', explanation:'<strong>إلى</strong> تدل على الوجهة.' },
  { text: 'المسجد ___ المدرسة والحديقة.', options:[{val:'a',label:'خلف'},{val:'b',label:'بين'},{val:'c',label:'فوق'},{val:'d',label:'أمام'}], correct:'b', explanation:'<strong>بين</strong> = in the middle of two places.' },
], '🏅 تسليم الامتحان 1', 'نتيجتك');

// ════════════════════════════════════════════════════════════
// Page arrays
// ════════════════════════════════════════════════════════════

const EN_PAGES_NEW = [
  {
    id: 'en-test-p1', type: 'intro',
    title: 'Tests & Assessments — Overview',
    content: `<div style="text-align:center;margin-bottom:16px">
  <span style="background:#1a56db;color:#fff;padding:6px 18px;border-radius:20px;font-size:13px;font-weight:600">📝 Tests & Assessments — English A1</span>
</div>
<h2 style="text-align:center">End-of-Unit Tests & A1 Mock Exams</h2>
<p style="text-align:center;color:#555">Validate your English A1 level with interactive tests and mock exams.</p>
<div style="background:#eff6ff;border-left:4px solid #1a56db;border-radius:6px;padding:14px;margin:16px 0">
  <strong>🎯 What's inside</strong>
  <ul>
    <li>📝 <strong>Unit Tests</strong> — 11 interactive MCQ questions covering Time, Place &amp; Prepositions</li>
    <li>🏅 <strong>Mock Exam 1</strong> — 10 questions, full grammar paper</li>
    <li>🏅 <strong>Mock Exam 2</strong> — 8 questions, reading comprehension (Letter from London)</li>
    <li>📊 <strong>Score Summary</strong> — track your results and identify gaps</li>
  </ul>
</div>
<div style="background:#f0fdf4;border-left:4px solid #16a34a;border-radius:6px;padding:12px">
  💡 Select your answers and click <strong>Check my answers</strong> at the bottom of each test to see your score and feedback instantly.
</div>`,
  },
  { id: 'en-test-p2', type: 'exercises', title: 'Unit Tests — Time, Place & Prepositions', content: EN_TEST_PAGE },
  { id: 'en-test-p3', type: 'exercises', title: 'Mock Exam 1 — Full Grammar Paper', content: EN_MOCK1_PAGE },
  { id: 'en-test-p4', type: 'exercises', title: 'Mock Exam 2 — Reading Comprehension', content: EN_MOCK2_PAGE },
  {
    id: 'en-test-p5', type: 'bilan',
    title: 'Score Summary & A1 Checklist',
    content: `<h3>📊 A1 English — Final Checklist</h3>
<p style="color:#555;margin-bottom:16px">Use this checklist to confirm you are ready for your A1 English assessment.</p>
<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px">
  <table style="width:100%;border-collapse:collapse">
    <thead><tr style="background:#1a56db;color:#fff">
      <th style="padding:10px;text-align:left">Skill</th>
      <th style="padding:10px;text-align:center">✅ Done</th>
    </tr></thead>
    <tbody>
      <tr><td style="padding:10px;border-bottom:1px solid #f1f5f9">Use prepositions of time: <em>on, in, at, for, since, ago, by, during</em></td><td style="text-align:center">☐</td></tr>
      <tr style="background:#f8fafc"><td style="padding:10px;border-bottom:1px solid #f1f5f9">Describe locations: <em>in, on, at, under, between, next to, opposite</em></td><td style="text-align:center">☐</td></tr>
      <tr><td style="padding:10px;border-bottom:1px solid #f1f5f9">Use other prepositions correctly: <em>by, with, for, in (interest)</em></td><td style="text-align:center">☐</td></tr>
      <tr style="background:#f8fafc"><td style="padding:10px;border-bottom:1px solid #f1f5f9">Read a short text and answer comprehension questions</td><td style="text-align:center">☐</td></tr>
      <tr><td style="padding:10px">Write a short letter or email using correct prepositions</td><td style="text-align:center">☐</td></tr>
    </tbody>
  </table>
</div>
<div style="text-align:center;margin-top:20px">
  <div style="background:#1a56db;color:#fff;padding:14px 28px;border-radius:12px;display:inline-block;font-weight:700;font-size:16px">
    🎓 Congratulations — You completed the English A1 Assessment!
  </div>
</div>`,
  },
];

const AR_PAGES_NEW = [
  {
    id: 'ar-test-p1', type: 'intro',
    title: 'اختبارات وتقييمات — مقدمة',
    content: `<div style="text-align:center;margin-bottom:16px">
  <span style="background:#16a34a;color:#fff;padding:6px 18px;border-radius:20px;font-size:13px;font-weight:600">📝 اختبارات وتقييمات — عربي A1</span>
</div>
<h2 style="text-align:center;direction:rtl">اختبارات تفاعلية وامتحانات تجريبية</h2>
<p style="text-align:center;color:#555">قيّم مستواك في اللغة العربية A1 باختبارات تفاعلية مع تصحيح فوري.</p>
<div style="background:#f0fdf4;border-right:4px solid #16a34a;border-radius:6px;padding:14px;margin:16px 0;direction:rtl">
  <strong>🎯 محتوى هذا القسم</strong>
  <ul>
    <li>📝 <strong>اختبارات الوحدات</strong> — 11 سؤالاً تفاعلياً (الزمن، المكان، حروف الجر)</li>
    <li>🏅 <strong>الامتحان التجريبي 1</strong> — 10 أسئلة، ورقة قواعد كاملة</li>
    <li>📊 <strong>ملخص النتائج</strong> — تتبع نتائجك وحدد نقاط الضعف</li>
  </ul>
</div>
<div style="background:#f0fdf4;border-right:4px solid #16a34a;border-radius:6px;padding:12px;direction:rtl">
  💡 اختر إجاباتك ثم انقر على <strong>تحقق من إجاباتك</strong> في أسفل كل اختبار لرؤية نتيجتك والتصحيح فورًا.
</div>`,
  },
  { id: 'ar-test-p2', type: 'exercises', title: 'اختبارات الوحدات — الزمن والمكان وحروف الجر', content: AR_TEST_PAGE },
  { id: 'ar-test-p3', type: 'exercises', title: 'الامتحان التجريبي 1 — ورقة القواعد الكاملة', content: AR_MOCK1_PAGE },
  {
    id: 'ar-test-p4', type: 'bilan',
    title: 'ملخص النتائج وقائمة التحقق',
    content: `<h3>📊 عربي A1 — قائمة التحقق النهائية</h3>
<p style="color:#555;margin-bottom:16px;direction:rtl">استخدم هذه القائمة للتأكد من جاهزيتك لتقييم مستوى A1 عربي.</p>
<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px" dir="rtl">
  <table style="width:100%;border-collapse:collapse">
    <thead><tr style="background:#16a34a;color:#fff">
      <th style="padding:10px;text-align:right">المهارة</th>
      <th style="padding:10px;text-align:center">✅ أتقنتُها</th>
    </tr></thead>
    <tbody>
      <tr><td style="padding:10px;border-bottom:1px solid #f1f5f9">استخدام حروف جر الزمان: <em>في، منذ، قبل، بعد، خلال</em></td><td style="text-align:center">☐</td></tr>
      <tr style="background:#f8fafc"><td style="padding:10px;border-bottom:1px solid #f1f5f9">وصف المواقع: <em>في، على، تحت، بين، أمام، خلف، بجانب</em></td><td style="text-align:center">☐</td></tr>
      <tr><td style="padding:10px;border-bottom:1px solid #f1f5f9">استخدام حروف الجر الأخرى: <em>إلى، من، مع، بـ، لـ</em></td><td style="text-align:center">☐</td></tr>
      <tr style="background:#f8fafc"><td style="padding:10px;border-bottom:1px solid #f1f5f9">قراءة نص قصير والإجابة على أسئلة الفهم</td><td style="text-align:center">☐</td></tr>
      <tr><td style="padding:10px">كتابة رسالة قصيرة باستخدام حروف الجر الصحيحة</td><td style="text-align:center">☐</td></tr>
    </tbody>
  </table>
</div>
<div style="text-align:center;margin-top:20px" dir="rtl">
  <div style="background:#16a34a;color:#fff;padding:14px 28px;border-radius:12px;display:inline-block;font-weight:700;font-size:16px">
    🎓 مبروك — لقد أكملتَ تقييم اللغة العربية A1!
  </div>
</div>`,
  },
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

  const EN_ID = 'mik7seui2iindcl';
  const AR_ID = 's2imx9xynhxeyw2';

  try {
    const enStr = JSON.stringify(EN_PAGES_NEW);
    await pb.collection('courses').update(EN_ID, { pages: enStr });
    console.log(`  ✅ English test course updated (${EN_PAGES_NEW.length} pages, ${enStr.length} chars)`);
  } catch (err) {
    console.error(`  ❌ English failed: ${err.message}`);
    if (err?.data) console.error(JSON.stringify(err.data, null, 2));
  }

  try {
    const arStr = JSON.stringify(AR_PAGES_NEW);
    await pb.collection('courses').update(AR_ID, { pages: arStr });
    console.log(`  ✅ Arabic test course updated (${AR_PAGES_NEW.length} pages, ${arStr.length} chars)`);
  } catch (err) {
    console.error(`  ❌ Arabic failed: ${err.message}`);
    if (err?.data) console.error(JSON.stringify(err.data, null, 2));
  }

  console.log('\n════════════════════════════════════════════');
  console.log('✅ Done — interactive tests ready!');
  console.log('════════════════════════════════════════════');
}

main().catch(err => {
  console.error('Fatal:', err?.data ? JSON.stringify(err.data) : err.message);
  process.exit(1);
});
