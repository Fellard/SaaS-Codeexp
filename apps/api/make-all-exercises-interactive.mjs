/**
 * make-all-exercises-interactive.mjs
 * ════════════════════════════════════════════════════════════
 * Met à jour les pages d'exercices statiques de 24 cours
 * (EN audio × 7 + EN standard × 5 + AR audio × 7 + AR standard × 5)
 * → remplace par des exercices interactifs : boutons radio,
 *   bouton "Check", feedback ✅/❌, score.
 *
 * Usage :  cd apps/api && node make-all-exercises-interactive.mjs
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
  env.split('\n').forEach(line => { const m = line.match(/^([^#=]+)=(.*)$/); if (m) process.env[m[1].trim()] = m[2].trim(); });
} catch {}
const PB_URL   = process.env.PB_URL   || 'http://127.0.0.1:8090';
const PB_EMAIL = process.env.PB_SUPERUSER_EMAIL    || '';
const PB_PASS  = process.env.PB_SUPERUSER_PASSWORD || '';

// ════════════════════════════════════════════════════════════
// SHARED CSS + JS (injected once per page)
// ════════════════════════════════════════════════════════════
const STYLE = `<style>
.iws-wrap{font-family:inherit;max-width:720px;margin:0 auto}
.iws-intro{background:#f0f9ff;border-left:4px solid #2563eb;border-radius:8px;padding:12px 16px;margin-bottom:18px;font-size:14px;line-height:1.6}
.iws-intro.ar{background:#f0fdf4;border-left:none;border-right:4px solid #16a34a}
.iws-q{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:12px;transition:border .2s}
.iws-q.correct{border-color:#16a34a;background:#f0fdf4}
.iws-q.wrong{border-color:#dc2626;background:#fef2f2}
.iws-q-text{font-weight:600;margin:0 0 12px;font-size:14px;color:#1e293b;display:flex;gap:8px;align-items:flex-start}
.iws-q-num{display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:26px;background:#2563eb;color:#fff;border-radius:50%;font-size:11px;font-weight:700;flex-shrink:0}
.iws-q-num.ar{background:#16a34a}
.iws-opts{display:flex;flex-direction:column;gap:7px}
.iws-opt{display:flex;align-items:center;gap:10px;cursor:pointer;padding:8px 12px;border-radius:8px;border:1px solid #e5e7eb;transition:all .15s;user-select:none;font-size:14px}
.iws-opt:hover{background:#f1f5f9;border-color:#93c5fd}
.iws-opt input{display:none}
.iws-radio{width:18px;height:18px;border-radius:50%;border:2px solid #94a3b8;flex-shrink:0;transition:all .15s;position:relative}
.iws-opt input:checked~.iws-radio{border-color:#2563eb;background:#2563eb}
.iws-opt input:checked~.iws-radio::after{content:'';position:absolute;width:6px;height:6px;background:#fff;border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%)}
.iws-opt input:checked~span:last-child{font-weight:600;color:#1e40af}
.iws-opt.opt-correct{background:#dcfce7;border-color:#16a34a}
.iws-opt.opt-correct .iws-radio{border-color:#16a34a;background:#16a34a}
.iws-opt.opt-wrong{background:#fee2e2;border-color:#dc2626}
.iws-opt.opt-wrong .iws-radio{border-color:#dc2626;background:#dc2626}
.iws-fb{font-size:13px;margin-top:8px;padding:6px 10px;border-radius:6px;display:none}
.iws-fb.show{display:block}
.iws-fb.ok{background:#dcfce7;color:#166534}
.iws-fb.ko{background:#fee2e2;color:#991b1b}
.iws-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}
.iws-btn{background:#2563eb;color:#fff;border:none;padding:10px 22px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;transition:background .2s}
.iws-btn:hover{background:#1d4ed8}
.iws-btn.ar{background:#16a34a}.iws-btn.ar:hover{background:#15803d}
.iws-reset{background:transparent;color:#64748b;border:1px solid #e2e8f0;padding:9px 16px;border-radius:8px;font-size:13px;cursor:pointer}
.iws-reset:hover{background:#f1f5f9}
.iws-score{display:none;margin-top:14px;padding:12px 16px;border-radius:10px;font-size:14px;font-weight:600;text-align:center}
.iws-score.show{display:block}
.iws-score.pass{background:#dcfce7;color:#166534;border:2px solid #16a34a}
.iws-score.fail{background:#fee2e2;color:#991b1b;border:2px solid #dc2626}
</style>`;

const JS = `<script>
function iwsCheck(id,correct,expl,pass,passMsg,failMsg,scoreLabel){
  var n=correct.length,score=0;
  for(var i=0;i<n;i++){
    var blk=document.getElementById(id+'_b'+i);
    var fb=document.getElementById(id+'_f'+i);
    var sel=document.querySelector('input[name="'+id+'_q'+i+'"]:checked');
    blk.classList.remove('correct','wrong');
    fb.className='iws-fb';fb.textContent='';
    document.querySelectorAll('[id^="'+id+'_o'+i+'_"]').forEach(function(el){el.classList.remove('opt-correct','opt-wrong')});
    var corrEl=document.getElementById(id+'_o'+i+'_'+correct[i]);
    if(corrEl)corrEl.classList.add('opt-correct');
    if(!sel){fb.className='iws-fb ko show';fb.textContent='⚠️ Please select an answer.';blk.classList.add('wrong');continue}
    if(sel.value===correct[i]){score++;blk.classList.add('correct');fb.className='iws-fb ok show';fb.textContent='✅ '+(expl[i]||'Correct!')}
    else{blk.classList.add('wrong');var wrongEl=document.getElementById(id+'_o'+i+'_'+sel.value);if(wrongEl)wrongEl.classList.add('opt-wrong');fb.className='iws-fb ko show';fb.textContent='❌ '+(expl[i]||'Incorrect.')}
  }
  var sc=document.getElementById(id+'_sc');
  sc.textContent=scoreLabel+': '+score+'/'+n+' — '+(score>=pass?'🎉 '+passMsg:'📚 '+failMsg);
  sc.className='iws-score show '+(score>=pass?'pass':'fail');
}
function iwsReset(id,n){
  for(var i=0;i<n;i++){
    document.getElementById(id+'_b'+i).classList.remove('correct','wrong');
    var fb=document.getElementById(id+'_f'+i);fb.className='iws-fb';fb.textContent='';
    document.querySelectorAll('input[name="'+id+'_q'+i+'"]').forEach(function(inp){inp.checked=false});
    document.querySelectorAll('[id^="'+id+'_o'+i+'_"]').forEach(function(el){el.classList.remove('opt-correct','opt-wrong')});
  }
  document.getElementById(id+'_sc').classList.remove('show');
}
</script>`;

function buildInteractivePage(lang, id, intro, qs, btnLabel, scoreLabel) {
  const isAr = lang === 'ar';
  const numColor = isAr ? 'ar' : '';
  const introClass = isAr ? 'iws-intro ar' : 'iws-intro';
  const btnClass = isAr ? 'iws-btn ar' : 'iws-btn';
  const dir = isAr ? ' dir="rtl"' : '';

  const qHtml = qs.map((q, i) => {
    const opts = q.opts.map(o => `
      <label class="iws-opt" id="${id}_o${i}_${o.v}" onclick="">
        <input type="radio" name="${id}_q${i}" value="${o.v}" onchange="document.getElementById('${id}_sc').classList.remove('show')">
        <span class="iws-radio"></span>
        <span>${o.l}</span>
      </label>`).join('');
    return `<div class="iws-q" id="${id}_b${i}"${dir}>
  <p class="iws-q-text"><span class="iws-q-num ${numColor}">${i+1}</span><span>${q.q}</span></p>
  <div class="iws-opts">${opts}</div>
  <div class="iws-fb" id="${id}_f${i}"></div>
</div>`;
  }).join('\n');

  const corrArr = JSON.stringify(qs.map(q => q.ans));
  const explArr = JSON.stringify(qs.map(q => q.exp || ''));
  const pass    = Math.ceil(qs.length * 0.7);

  return `${STYLE}${JS}
<div class="iws-wrap">
<div class="${introClass}"${dir}>${intro}</div>
${qHtml}
<div class="iws-actions">
  <button class="${btnClass}" onclick="iwsCheck('${id}',${corrArr},${explArr},${pass},'Great job!','Review and try again.',${JSON.stringify(scoreLabel)})">${btnLabel}</button>
  <button class="iws-reset" onclick="iwsReset('${id}',${qs.length})">🔄 Reset</button>
</div>
<div class="iws-score" id="${id}_sc"></div>
</div>`;
}

// shorthand
const q = (question, options, ans, exp) => ({
  q: question,
  opts: options.map((l, i) => ({ v: String.fromCharCode(97+i), l })),
  ans: String.fromCharCode(97 + ans),
  exp,
});

// ════════════════════════════════════════════════════════════
// ENGLISH AUDIO COURSES
// ════════════════════════════════════════════════════════════
const EA_M1 = buildInteractivePage('en','ea_m1',
  '<strong>🎧 Module 1 — Introducing yourself</strong><br/>Choose the best answer for each question.',
  [
    q('What is the correct way to introduce yourself?', ['My name is Anna.','Me Anna name.','I Anna is.','Name me Anna.'], 0, 'We say "<strong>My name is…</strong>" to introduce ourselves.'),
    q('Which sentence asks someone\'s name?', ['How are you?','Where are you from?','What is your name?','How old are you?'], 2, '"<strong>What is your name?</strong>" asks for someone\'s name.'),
    q('How do you say your age in English? (You are 15)', ['I have 15 years.','I am 15 years old.','My age has 15.','I is 15.'], 1, '"<strong>I am 15 years old</strong>" is the correct form in English.'),
    q('Which word means the same as "Hello"?', ['Goodbye','Sorry','Hi','Please'], 2, '<strong>Hi</strong> is an informal way of saying hello.'),
    q('Complete: "I ___ from Morocco."', ['is','am','are','be'], 1, 'We use <strong>am</strong> with "I": I am from…'),
    q('Which is a nationality?', ['Moroccan','Morocco','Maroc','Marrocan'], 0, '<strong>Moroccan</strong> is the nationality; Morocco is the country.'),
  ],
  '✅ Check my answers','Score');

const EA_M2 = buildInteractivePage('en','ea_m2',
  '<strong>🎧 Module 2 — Family & Home</strong><br/>Choose the correct answer.',
  [
    q('What do you call your father\'s mother?', ['Aunt','Grandmother','Sister','Mother-in-law'], 1, 'Your father\'s mother is your <strong>grandmother</strong>.'),
    q('Complete: "___ is my brother." (pointing to him)', ['She','They','He','It'], 2, 'Use <strong>He</strong> to refer to a male person.'),
    q('Which word means "the place where you live"?', ['School','Office','Home','Market'], 2, '<strong>Home</strong> is where you live.'),
    q('What is the possessive form of "I"?', ['Me','Mine','My','I\'s'], 2, 'The possessive adjective of "I" is <strong>my</strong>.'),
    q('"She is my mother\'s sister." What relation is she?', ['Grandmother','Aunt','Cousin','Sister'], 1, 'Your mother\'s sister is your <strong>aunt</strong>.'),
    q('Complete: "There ___ two bedrooms in our house."', ['is','am','are','be'], 2, 'Use <strong>are</strong> with plural nouns: there are…'),
  ],
  '✅ Check my answers','Score');

const EA_M3 = buildInteractivePage('en','ea_m3',
  '<strong>🎧 Module 3 — Daily Life</strong><br/>Choose the correct answer.',
  [
    q('What time do most people wake up for school?', ['At midnight','In the evening','In the morning','At noon'], 2, 'School starts <strong>in the morning</strong>.'),
    q('Complete: "I ___ breakfast every day."', ['have','has','am','be'], 0, 'With <strong>I</strong>, we use "have": I have breakfast.'),
    q('Which activity happens every day?', ['Birthday','Holiday','Daily routine','Weekend trip'], 2, 'A <strong>daily routine</strong> is what you do every day.'),
    q('"Always, usually, sometimes, never" are…', ['Adjectives','Adverbs of frequency','Prepositions','Nouns'], 1, 'These are <strong>adverbs of frequency</strong>.'),
    q('Complete: "She ___ to school at 8 a.m."', ['go','goes','going','gone'], 1, 'With he/she/it, add <strong>-s</strong>: she goes.'),
    q('What do you say when you arrive at school?', ['Good night','Goodbye','Good morning','See you later'], 2, 'We say <strong>Good morning</strong> in the morning.'),
  ],
  '✅ Check my answers','Score');

const EA_M4 = buildInteractivePage('en','ea_m4',
  '<strong>🎧 Module 4 — Shopping & Food</strong><br/>Choose the correct answer.',
  [
    q('What do you say to ask the price?', ['Where is it?','How much is it?','What is it?','Who sells it?'], 1, '"<strong>How much is it?</strong>" asks for the price.'),
    q('Which word means "to buy food"?', ['Cook','Shop','Eat','Plant'], 1, '<strong>Shop</strong> = to buy things in a store.'),
    q('Complete: "I would like ___ apple, please."', ['a','an','the','some'], 1, 'We use <strong>an</strong> before words starting with a vowel sound.'),
    q('Which is NOT a food item?', ['Bread','Rice','Chicken','Table'], 3, 'A <strong>table</strong> is furniture, not food.'),
    q('"Can I have the bill, please?" — where do you say this?', ['At school','In a restaurant','At the park','At home'], 1, 'You ask for the bill <strong>in a restaurant</strong>.'),
    q('How do you say you like something?', ['I like…','I likes…','I am like…','I liking…'], 0, 'The correct form is <strong>I like</strong> + noun/verb-ing.'),
  ],
  '✅ Check my answers','Score');

const EA_M5 = buildInteractivePage('en','ea_m5',
  '<strong>🎧 Module 5 — Leisure & Sports</strong><br/>Choose the correct answer.',
  [
    q('Complete: "I ___ football every weekend."', ['play','plays','playing','played'], 0, 'With <strong>I</strong>, we use the base form: I play.'),
    q('Which verb goes with "music"?', ['Play','Do','Go','Make'], 0, 'We <strong>play</strong> music / a musical instrument.'),
    q('Which verb goes with "swimming"?', ['Play','Make','Go','Do'], 2, 'We <strong>go</strong> swimming / go cycling / go running.'),
    q('"I really enjoy reading." What does "enjoy" mean here?', ['Hate','Like very much','Forget','Dislike'], 1, '<strong>Enjoy</strong> = like very much / get pleasure from.'),
    q('Which is a leisure activity?', ['Working','Cooking dinner','Playing video games','Sleeping at night'], 2, '<strong>Playing video games</strong> is a leisure (free-time) activity.'),
    q('Complete: "Do you like ___?" (football)', ['play','plays','playing','to play — both c and d'], 3, 'After "like", we can use <strong>playing</strong> or <strong>to play</strong>.'),
  ],
  '✅ Check my answers','Score');

const EA_M6 = buildInteractivePage('en','ea_m6',
  '<strong>🎧 Module 6 — The City & Transport</strong><br/>Choose the correct answer.',
  [
    q('Where do planes take off and land?', ['Station','Port','Airport','Bus stop'], 2, 'Planes use an <strong>airport</strong>.'),
    q('Complete: "Go straight, then turn ___."', ['under','above','left','inside'], 2, '<strong>Turn left/right</strong> is used for directions.'),
    q('Which means of transport uses tracks?', ['Bus','Plane','Train','Car'], 2, 'A <strong>train</strong> runs on tracks.'),
    q('What do you buy to travel by train?', ['A ticket','A map','A passport','A visa'], 0, 'You buy a <strong>ticket</strong> to travel by train.'),
    q('"Excuse me, where is the nearest bank?" — This is…', ['A greeting','A farewell','Asking for directions','Ordering food'], 2, 'You are <strong>asking for directions</strong>.'),
    q('Complete: "The hospital is ___ the school."', ['in','by','next to','all of the above can work'], 3, '<strong>Next to, near, opposite, behind</strong> can all describe relative location.'),
  ],
  '✅ Check my answers','Score');

const EA_BILAN1 = buildInteractivePage('en','ea_bil1',
  '<strong>🎓 Final Review — Grammar</strong><br/>Mixed questions from all 6 modules. Aim for 70% or above.',
  [
    q('Complete: "___ name is Thomas."', ['My','Me','I','Mine'], 0, 'Use <strong>my</strong> as possessive adjective.'),
    q('Complete: "She ___ three brothers."', ['have','has','is','are'], 1, 'With he/she/it, use <strong>has</strong>.'),
    q('Which word is a frequency adverb?', ['Happy','Always','Kitchen','Run'], 1, '<strong>Always</strong> is a frequency adverb.'),
    q('How much ___ the jacket?', ['is','are','am','be'], 0, 'Use <strong>is</strong> with a singular noun.'),
    q('We ___ football on Saturdays.', ['plays','play','playing','played'], 1, 'With <strong>we</strong>, use the base form: we play.'),
    q('The train station is ___ the supermarket.', ['in front of','under','inside','above'], 0, '<strong>In front of</strong> describes relative position.'),
    q('Which is the correct greeting in the morning?', ['Good night','Good evening','Good morning','Goodnight'], 2, '<strong>Good morning</strong> is used in the morning.'),
    q('Complete: "I ___ from Spain."', ['am','is','are','be'], 0, 'I + <strong>am</strong>: I am from Spain.'),
  ],
  '✅ Check final answers','Score');

const EA_BILAN2 = buildInteractivePage('en','ea_bil2',
  '<strong>🎓 Final Review — Vocabulary</strong><br/>Vocabulary check from all modules.',
  [
    q('Your mother\'s brother is your…', ['Uncle','Cousin','Nephew','Grandfather'], 0, 'Your mother\'s brother is your <strong>uncle</strong>.'),
    q('What do you say to end a meal at a restaurant?', ['"I want food"','The bill, please','Good morning','I go now'], 1, 'You ask for <strong>the bill</strong> when you finish eating.'),
    q('Which sport uses a ball and a net?', ['Swimming','Tennis','Running','Cycling'], 1, '<strong>Tennis</strong> uses a ball and a net.'),
    q('Where do you buy medicine?', ['Bakery','Pharmacy','Library','Market'], 1, 'You buy medicine at a <strong>pharmacy</strong>.'),
    q('What does "I am tired" mean?', ['I am happy','I feel sleepy/exhausted','I am hungry','I am cold'], 1, '"I am tired" means you are <strong>sleepy or exhausted</strong>.'),
    q('Which is a means of transport?', ['Table','Window','Bus','Door'], 2, 'A <strong>bus</strong> is a means of transport.'),
  ],
  '✅ Check final answers','Score');

// ════════════════════════════════════════════════════════════
// ENGLISH STANDARD COURSES
// ════════════════════════════════════════════════════════════
const ES_TIME = buildInteractivePage('en','es_time',
  '<strong>⏰ Practice — Expressing Time</strong><br/>Choose the correct time preposition for each sentence.',
  [
    q('She was born ___ 1995.', ['at','on','in','by'], 2, '<strong>In</strong> is used with years, months, and seasons.'),
    q('The meeting starts ___ 9 o\'clock.', ['in','on','at','by'], 2, '<strong>At</strong> is used with clock times.'),
    q('I have lived here ___ three years.', ['since','for','ago','during'], 1, '<strong>For</strong> + duration (three years).'),
    q('They arrived two hours ___.', ['before','since','ago','after'], 2, '<strong>Ago</strong> comes after a duration to refer to the past.'),
    q('Please finish this ___ Friday.', ['until','by','during','since'], 1, '<strong>By</strong> = no later than a deadline.'),
    q('I have been learning English ___ 2020.', ['for','ago','since','during'], 2, '<strong>Since</strong> + point in time (2020).'),
    q('We always go on holiday ___ the summer.', ['at','on','in','during'], 3, 'Both <strong>in</strong> and <strong>during</strong> work with seasons.'),
    q('The class is ___ Monday ___ 10 a.m. (choose for "Monday")', ['on','in','at','by'], 0, '<strong>On</strong> is used with days of the week.'),
  ],
  '✅ Check my answers','Score');

const ES_PLACE = buildInteractivePage('en','es_place',
  '<strong>📍 Practice — Expressing a Place</strong><br/>Choose the correct place preposition.',
  [
    q('The book is ___ the table.', ['in','on','at','above'], 1, '<strong>On</strong> = resting on a surface.'),
    q('She is waiting ___ the bus stop.', ['on','in','at','between'], 2, '<strong>At</strong> = a specific point or location.'),
    q('The cat is hiding ___ the sofa.', ['above','near','under','opposite'], 2, '<strong>Under</strong> = below something.'),
    q('The bank is ___ the post office and the library.', ['next to','between','behind','above'], 1, '<strong>Between</strong> = with two reference points.'),
    q('My office is ___ the third floor.', ['at','in','on','by'], 2, '<strong>On</strong> + floor number.'),
    q('The children play ___ the garden.', ['at','on','in','above'], 2, '<strong>In</strong> = inside an enclosed space.'),
    q('The school is ___ the park.', ['under','opposite','behind','between'], 1, '<strong>Opposite</strong> = facing, across from.'),
    q('She lives ___ London.', ['at','on','in','near'], 2, '<strong>In</strong> + cities and countries.'),
  ],
  '✅ Check my answers','Score');

const ES_PREP = buildInteractivePage('en','es_prep',
  '<strong>🔗 Practice — All Prepositions</strong><br/>Choose the correct preposition.',
  [
    q('He traveled ___ bus from Paris to Lyon.', ['with','by','on','in'], 1, '<strong>By</strong> + transport (by bus, by train, by plane).'),
    q('This book was written ___ a famous author.', ['from','by','with','to'], 1, '<strong>By</strong> = written/created by someone.'),
    q('She is good ___ mathematics.', ['in','at','on','for'], 1, '"Good <strong>at</strong>" is a fixed expression.'),
    q('We are looking forward ___ your visit.', ['for','of','to','at'], 2, '"Look forward <strong>to</strong>" is a fixed expression.'),
    q('He apologized ___ being late.', ['for','of','about','to'], 0, '"Apologize <strong>for</strong>" is a fixed expression.'),
    q('The train arrives ___ platform 3.', ['in','at','on','by'], 2, '<strong>On</strong> + platform/floor.'),
    q('She is interested ___ learning Arabic.', ['about','for','in','at'], 2, '"Interested <strong>in</strong>" is a fixed expression.'),
    q('The letter was written ___ ink.', ['by','with','in','of'], 2, '<strong>In</strong> ink / in pencil = the material used.'),
  ],
  '✅ Check my answers','Score');

const ES_LONDON_R = buildInteractivePage('en','es_lon_r',
  '<strong>📖 Reading Comprehension — A Letter from London</strong><br/><em style="display:block;background:#f8fafc;border-radius:6px;padding:10px;margin:8px 0;font-style:italic">"Dear Sarah, I am writing to you from London! I arrived here on Monday and I have been exploring the city for three days. Yesterday, I visited Big Ben and the Tower of London. The weather has been cold but sunny. I look forward to seeing you when I get back. Yours sincerely, Emma."</em>',
  [
    q('When did Emma arrive?', ['On Sunday','On Monday','On Friday','Yesterday'], 1, 'The letter says "I arrived <strong>on Monday</strong>".'),
    q('How long has she been exploring?', ['One day','One week','Three days','Two months'], 2, '"I have been exploring <strong>for three days</strong>".'),
    q('What famous clock tower did she visit?', ['Eiffel Tower','Big Ben','Sagrada Familia','Colosseum'], 1, 'She visited <strong>Big Ben</strong> and the Tower of London.'),
    q('How is the weather?', ['Hot and rainy','Cold but sunny','Cloudy','Warm and windy'], 1, '"The weather has been <strong>cold but sunny</strong>".'),
    q('"Yours sincerely" is used to ___ a letter.', ['open','respond to','close formally','address'], 2, '"<strong>Yours sincerely</strong>" is a formal letter closing.'),
    q('Which preposition of time is used with "Monday"?', ['in','at','on','by'], 2, '<strong>On</strong> + days of the week.'),
    q('Which preposition of time is used with "three days"?', ['since','ago','for','during'], 2, '<strong>For</strong> + duration.'),
  ],
  '✅ Check my answers','Score');

const ES_LONDON_W = buildInteractivePage('en','es_lon_w',
  '<strong>✍️ Writing Knowledge Check — Letter Skills</strong><br/>Test your knowledge of formal letter writing conventions.',
  [
    q('How do you start a formal letter?', ['Hey there!','Dear Sir/Madam,','What\'s up?','Hello friend,'], 1, 'A formal letter starts with <strong>Dear Sir/Madam,</strong>'),
    q('Which phrase means you expect a reply?', ['See you later','I look forward to hearing from you','That\'s all','The end'], 1, '"<strong>I look forward to hearing from you</strong>" signals you expect a reply.'),
    q('In a letter, what does "P.S." mean?', ['Please send','Post Script (extra note)','Private story','Page section'], 1, '<strong>P.S.</strong> = Post Script, an extra note added after signing.'),
    q('Which is NOT correct for ending a formal letter?', ['Yours sincerely,','Best regards,','Catch ya!','Kind regards,'], 2, '"<strong>Catch ya!</strong>" is far too informal for a formal letter.'),
    q('What preposition do you use with dates in letters? (e.g. ___ 12th April)', ['in','at','on','by'], 2, '<strong>On</strong> + specific dates.'),
    q('A letter "from London" uses which preposition?', ['to','in','from','at'], 2, '"<strong>From</strong> London" tells you the origin/location.'),
  ],
  '✅ Check my answers','Score');

const ES_TRAVEL_R = buildInteractivePage('en','es_trav_r',
  '<strong>📖 Reading & Vocabulary — Travel & Adventure</strong><br/>Choose the correct answer.',
  [
    q('"To explore" means…', ['To stay at home','To discover new places','To eat local food','To sleep outside'], 1, '"<strong>To explore</strong>" = to travel and discover new places.'),
    q('Which word means "a journey, especially a long one"?', ['Walk','Trip','Step','Stop'], 1, '<strong>Trip</strong> = a journey, especially away from home.'),
    q('What do you call something you buy to remember a place?', ['Souvenir','Receipt','Luggage','Passport'], 0, 'A <strong>souvenir</strong> is bought to remember a trip.'),
    q('"Jet lag" is caused by…', ['Eating too much','Travelling across time zones','Forgetting luggage','Speaking another language'], 1, '<strong>Jet lag</strong> = tiredness caused by crossing time zones.'),
    q('Where do planes take off and land?', ['Station','Port','Airport','Bus stop'], 2, 'Planes use an <strong>airport</strong>.'),
    q('Which verb completes: "I ___ my suitcase last night."', ['packed','pack','packing','packs'], 0, '<strong>Packed</strong> (past tense) = put things in a suitcase.'),
  ],
  '✅ Check my answers','Score');

const ES_TRAVEL_W = buildInteractivePage('en','es_trav_w',
  '<strong>✍️ Writing Knowledge — Travel Expressions</strong><br/>Choose the best expression or form.',
  [
    q('I travelled ___ train to London.', ['with','on','by','in'], 2, '<strong>By</strong> + transport mode.'),
    q('She has ___ to 20 countries.', ['went','been','gone','travel'], 1, '"Have <strong>been</strong> to" = have visited.'),
    q('Which sentence describes a past completed trip?', ['I go to Paris last year.','I went to Paris last year.','I going to Paris last year.','I have go to Paris last year.'], 1, '<strong>Went</strong> = simple past of "go".'),
    q('I am ___ forward to my holiday.', ['look','looking','looked','looks'], 1, '"Looking forward to" = excited about (present continuous).'),
    q('The trip ___ three days.', ['lasts','lasted','lasting','last'], 1, '<strong>Lasted</strong> = simple past, the trip was over.'),
    q('Complete: "___ do you go on holiday?" — "In August."', ['Where','When','Who','What'], 1, '<strong>When</strong> asks about time.'),
  ],
  '✅ Check my answers','Score');

// ════════════════════════════════════════════════════════════
// ARABIC AUDIO COURSES
// ════════════════════════════════════════════════════════════
const AA_M1 = buildInteractivePage('ar','aa_m1',
  '<strong>🔤 الوحدة 1 — الحروف العربية</strong><br/>اختر الإجابة الصحيحة لكل سؤال.',
  [
    q('كم عدد حروف الأبجدية العربية؟', ['24 حرفًا','26 حرفًا','28 حرفًا','30 حرفًا'], 2, 'الأبجدية العربية تتكون من <strong>28 حرفًا</strong>.'),
    q('في أي اتجاه تُكتب اللغة العربية؟', ['من اليسار إلى اليمين','من اليمين إلى اليسار','من الأعلى إلى الأسفل','لا يوجد اتجاه ثابت'], 1, 'العربية تُكتب وتُقرأ من <strong>اليمين إلى اليسار</strong>.'),
    q('ما اسم الحركة التي تُنطق بصوت /a/ ؟', ['كسرة','ضمة','فتحة','سكون'], 2, '<strong>الفتحة</strong> تُنطق /a/ وتوضع فوق الحرف.'),
    q('ما اسم الحركة التي تُنطق بصوت /i/ ؟', ['فتحة','ضمة','كسرة','سكون'], 2, '<strong>الكسرة</strong> تُنطق /i/ وتوضع تحت الحرف.'),
    q('ما التاء المربوطة؟', ['ت في بداية الكلمة','ة في نهاية الكلمة','ط في وسط الكلمة','ث في نهاية الكلمة'], 1, '<strong>التاء المربوطة (ة)</strong> توضع في نهاية الكلمة وتدل عادة على المؤنث.'),
    q('كم شكلاً تأخذ معظم الحروف العربية؟', ['شكلان','ثلاثة أشكال','أربعة أشكال','شكل واحد'], 2, 'لكل حرف <strong>4 أشكال</strong>: منفردة، أولى، وسط، آخر.'),
  ],
  '✅ تحقق من إجاباتك','النتيجة');

const AA_M2 = buildInteractivePage('ar','aa_m2',
  '<strong>👋 الوحدة 2 — التحيات والتعارف</strong><br/>اختر الإجابة الصحيحة.',
  [
    q('كيف تقول "Good morning" بالعربية؟', ['مساء الخير','صباح الخير','مع السلامة','شكراً'], 1, '<strong>صباح الخير</strong> = Good morning.'),
    q('ما معنى "شكراً"؟', ['Hello','Goodbye','Thank you','Please'], 2, '<strong>شكراً</strong> = Thank you.'),
    q('كيف تُرد على "كيف حالك؟"', ['مع السلامة','بخير، شكراً','صباح النور','عفواً'], 1, '"<strong>بخير، شكراً</strong>" = Fine, thank you.'),
    q('ما الضمير المناسب لـ "She"؟', ['أنا','أنتَ','هو','هي'], 3, '<strong>هي</strong> = She.'),
    q('أكمل: "اسم___ كريم." (my name)', ['كَ','ي','هُ','هَا'], 1, 'اللاحقة <strong>-ي</strong> تعني "my": اسمي = my name.'),
    q('ما معنى "من فضلك"؟', ['Thank you','Goodbye','Please','You\'re welcome'], 2, '<strong>من فضلك</strong> = Please.'),
  ],
  '✅ تحقق من إجاباتك','النتيجة');

const AA_M3 = buildInteractivePage('ar','aa_m3',
  '<strong>👨‍👩‍👧 الوحدة 3 — الأسرة</strong><br/>اختر الإجابة الصحيحة.',
  [
    q('ما معنى "أب"؟', ['Mother','Brother','Father','Son'], 2, '<strong>أب</strong> = Father.'),
    q('ما المؤنث من "طالب"؟', ['طالبة','طالبات','مطالبة','طالبون'], 0, 'نضيف <strong>ة</strong> (تاء مربوطة) لتأنيث الاسم: طالب → طالبة.'),
    q('ما معنى "أخت"؟', ['Aunt','Daughter','Sister','Cousin'], 2, '<strong>أخت</strong> = Sister.'),
    q('أكمل: "هذا أبو___." (his father)', ['ي','كَ','هُ','هَا'], 2, 'اللاحقة <strong>-هُ</strong> = his.'),
    q('ما معنى "جدة"؟', ['Aunt','Grandmother','Sister','Mother'], 1, '<strong>جدة</strong> = Grandmother.'),
    q('كيف تقول "my sister" بالعربية؟', ['أختكَ','أختي','أختهُ','أختهَا'], 1, '<strong>أختي</strong> = my sister (اللاحقة -ي = my).'),
  ],
  '✅ تحقق من إجاباتك','النتيجة');

const AA_M4 = buildInteractivePage('ar','aa_m4',
  '<strong>🔢 الوحدة 4 — الأرقام والألوان</strong><br/>اختر الإجابة الصحيحة.',
  [
    q('ما المؤنث من "أحمر"؟', ['أحمرة','حمراء','محمرة','أحمرات'], 1, 'المؤنث من <strong>أحمر</strong> هو <strong>حمراء</strong>.'),
    q('ما معنى "أزرق"؟', ['Red','Green','Blue','Yellow'], 2, '<strong>أزرق</strong> = Blue.'),
    q('كيف تقول عمرك بالعربية؟ (I am 15)', ['عمري خمسة عشر سنة','أنا خمسة عشر سنة','عندي خمسة عشر','لي خمسة عشر'], 0, 'نقول <strong>عُمْرِي … سَنَة</strong> للتعبير عن العمر.'),
    q('ما معنى "أصفر"؟', ['White','Black','Orange','Yellow'], 3, '<strong>أصفر</strong> = Yellow.'),
    q('ما اللون المؤنث لـ "أخضر"؟', ['خضرة','خضراء','أخضرة','أخضرات'], 1, 'المؤنث من أخضر هو <strong>خضراء</strong>.'),
    q('اختر الجملة الصحيحة: قلم (red, masc.)', ['قلم حمراء','قلم أحمر','قلم أحمرة','قلم أحمر وحمراء'], 1, '<strong>قلم أحمر</strong> = red pen (مذكر → أحمر).'),
  ],
  '✅ تحقق من إجاباتك','النتيجة');

const AA_M5 = buildInteractivePage('ar','aa_m5',
  '<strong>🍽️ الوحدة 5 — الطعام والوجبات</strong><br/>اختر الإجابة الصحيحة.',
  [
    q('ما معنى "خبز"؟', ['Rice','Fish','Bread','Chicken'], 2, '<strong>خبز</strong> = Bread.'),
    q('كيف تقول "أريد ماء" بالإنجليزية؟', ['I want tea','I want water','I want juice','I want coffee'], 1, '<strong>ماء</strong> = Water, so: I want water.'),
    q('أكمل: "أنتَ ___ شاي؟"', ['تُريدين','أريد','تُريد','يُريد'], 2, 'مع أنتَ (masc.) نستخدم <strong>تُريد</strong>.'),
    q('ما معنى "أُحِبُّ"؟', ['I hate','I want','I like/love','I have'], 2, '<strong>أُحِبُّ</strong> = I like / I love.'),
    q('ما معنى "دجاج"؟', ['Fish','Meat','Vegetables','Chicken'], 3, '<strong>دجاج</strong> = Chicken.'),
    q('كيف تطلب الحساب في المطعم؟', ['أريد ماء','الحساب من فضلك','شكراً جزيلاً','أنا لا أريد'], 1, 'نقول <strong>الحساب من فضلك</strong> = The bill, please.'),
  ],
  '✅ تحقق من إجاباتك','النتيجة');

const AA_M6 = buildInteractivePage('ar','aa_m6',
  '<strong>🏙️ الوحدة 6 — المدينة والنقل</strong><br/>اختر الإجابة الصحيحة.',
  [
    q('ما معنى "مدرسة"؟', ['Hospital','Mosque','School','Market'], 2, '<strong>مدرسة</strong> = School.'),
    q('أكمل: "الصيدلية ___ المدرسة." (in front of)', ['خلف','بين','أمام','فوق'], 2, '<strong>أمام</strong> = in front of.'),
    q('ما معنى "مستشفى"؟', ['Pharmacy','Hospital','School','Bank'], 1, '<strong>مستشفى</strong> = Hospital.'),
    q('كيف تقول "next to" بالعربية؟', ['أمام','خلف','بجانب','بين'], 2, '<strong>بجانب</strong> = next to.'),
    q('أين تستقل الطائرة؟', ['في المحطة','في المطار','في الميناء','في المدرسة'], 1, 'تستقل الطائرة <strong>في المطار</strong>.'),
    q('أكمل: "الكتاب ___ الطاولة." (on)', ['في','تحت','على','من'], 2, '<strong>على</strong> = on (رأس شيء).'),
  ],
  '✅ تحقق من إجاباتك','النتيجة');

const AA_BILAN1 = buildInteractivePage('ar','aa_bil1',
  '<strong>🎓 المراجعة النهائية — القواعد</strong><br/>أسئلة متنوعة من كل الوحدات. استهدف 70% أو أكثر.',
  [
    q('كم حرفاً في الأبجدية العربية؟', ['24','26','28','30'], 2, '<strong>28 حرفًا</strong> في الأبجدية العربية.'),
    q('ما معنى "صباح الخير"؟', ['Good evening','Good morning','Goodbye','Good night'], 1, '<strong>صباح الخير</strong> = Good morning.'),
    q('ما المؤنث من "مدرِّس"؟', ['مدرِّسة','مدرِّسات','مدرِّسون','مدرِّسين'], 0, 'نضيف ة: <strong>مدرِّسة</strong> = female teacher.'),
    q('ما معنى "أحمر"؟', ['Blue','Green','Red','Yellow'], 2, '<strong>أحمر</strong> = Red.'),
    q('كيف تقول "I like chicken"؟', ['أنا دجاج','أُحِبُّ الدجاج','دجاج أُحِبُّ','أريد الدجاج'], 1, '<strong>أُحِبُّ الدجاج</strong> = I like chicken.'),
    q('ما معنى "بين"؟', ['above','behind','between','near'], 2, '<strong>بين</strong> = between.'),
    q('أكمل: "اسم___ سارة." (her name)', ['ي','كَ','هُ','هَا'], 3, '<strong>-هَا</strong> = her: اسمها = her name.'),
    q('ما معنى "مطار"؟', ['Station','Port','Airport','Bus stop'], 2, '<strong>مطار</strong> = Airport.'),
  ],
  '✅ تحقق من الإجابات النهائية','النتيجة');

const AA_BILAN2 = buildInteractivePage('ar','aa_bil2',
  '<strong>🎓 المراجعة النهائية — مفردات</strong><br/>مراجعة مفردات من جميع الوحدات.',
  [
    q('ما معنى "جد"؟', ['Father','Uncle','Grandfather','Brother'], 2, '<strong>جد</strong> = Grandfather.'),
    q('ما معنى "خضراء"؟', ['Red (f)','Blue (f)','Yellow (f)','Green (f)'], 3, '<strong>خضراء</strong> = Green (feminine form).'),
    q('كيف تطلب من شخص أن يقول اسمه؟', ['أين أنت؟','ما اسمك؟','كيف حالك؟','من أين أنت؟'], 1, '<strong>ما اسمك؟</strong> = What is your name?'),
    q('ما معنى "سمك"؟', ['Bread','Rice','Fish','Chicken'], 2, '<strong>سمك</strong> = Fish.'),
    q('ما معنى "حديقة"؟', ['Market','Hospital','Garden/Park','School'], 2, '<strong>حديقة</strong> = Garden / Park.'),
    q('أكمل: "عُمْرِي عشرون ___."', ['سنة','شهر','يوم','أسبوع'], 0, 'نقول عُمْرِي … <strong>سَنَة</strong> للتعبير عن العمر.'),
  ],
  '✅ تحقق من الإجابات النهائية','النتيجة');

// ════════════════════════════════════════════════════════════
// ARABIC STANDARD COURSES
// ════════════════════════════════════════════════════════════
const AS_TIME = buildInteractivePage('ar','as_time',
  '<strong>⏰ تدريبات — التعبير عن الزمن</strong><br/>اختر حرف الجر المناسب في كل جملة.',
  [
    q('وُلِدتُ ___ عام 1998.', ['على','في','إلى','من'], 1, '<strong>في</strong> تستخدم مع السنوات والأشهر والفصول.'),
    q('الاجتماع ___ الساعة العاشرة.', ['في','على','إلى','من'], 0, '<strong>في</strong> تستخدم مع أوقات الساعة في العربية.'),
    q('أسكن هنا ___ خمس سنوات.', ['قبل','بعد','منذ','خلال'], 2, '<strong>منذ</strong> + مدة = since / for (حتى الآن).'),
    q('وصلتُ ___ ثلاث ساعات.', ['منذ','بعد','قبل','خلال'], 0, '<strong>منذ ثلاث ساعات</strong> = three hours ago / since three hours.'),
    q('سأسافر ___ غد.', ['في','منذ','من','على'], 0, '<strong>في</strong> + ظرف الزمان: في غد، في الصباح.'),
    q('أكمل الجملة: "زرتُه ___ الأسبوع الماضي."', ['في','من','إلى','على'], 0, '<strong>في</strong> الأسبوع الماضي = last week.'),
    q('ما معنى "دائماً"؟', ['never','sometimes','always','often'], 2, '<strong>دائماً</strong> = always.'),
    q('ما مقابل "بعد"؟', ['منذ','خلال','قبل','في'], 2, 'عكس <strong>بعد</strong> (after) هو <strong>قبل</strong> (before).'),
  ],
  '✅ تحقق من إجاباتك','النتيجة');

const AS_PLACE = buildInteractivePage('ar','as_place',
  '<strong>📍 تدريبات — التعبير عن المكان</strong><br/>اختر حرف الجر الصحيح.',
  [
    q('الكتاب ___ الطاولة.', ['من','إلى','على','في'], 2, '<strong>على</strong> = on (فوق سطح).'),
    q('القطة ___ الأريكة.', ['فوق','تحت','بجانب','أمام'], 1, '<strong>تحت</strong> = under / below.'),
    q('أسكن ___ لندن.', ['إلى','على','من','في'], 3, '<strong>في</strong> + المدن والبلدان.'),
    q('البنك ___ المدرسة والصيدلية.', ['فوق','خلف','بين','أمام'], 2, '<strong>بين</strong> = between.'),
    q('الكتاب ___ الحقيبة.', ['على','من','داخل / في','إلى'], 2, '<strong>داخل / في</strong> = inside / in.'),
    q('المسجد ___ المدرسة.', ['بين','أمام','من','إلى'], 1, '<strong>أمام</strong> = in front of.'),
    q('ما معنى "قريب من"؟', ['far from','next to','near / close to','inside'], 2, '<strong>قريب من</strong> = near / close to.'),
    q('ما عكس "أمام"؟', ['فوق','تحت','خلف','بجانب'], 2, 'عكس <strong>أمام</strong> (in front of) هو <strong>خلف</strong> (behind).'),
  ],
  '✅ تحقق من إجاباتك','النتيجة');

const AS_PREP = buildInteractivePage('ar','as_prep',
  '<strong>🔗 تدريبات — حروف الجر</strong><br/>اختر حرف الجر المناسب.',
  [
    q('ذهبتُ ___ المدرسة.', ['في','إلى','من','على'], 1, '<strong>إلى</strong> = to (الاتجاه نحو مكان).'),
    q('جئتُ ___ المغرب.', ['إلى','في','من','على'], 2, '<strong>من</strong> = from (نقطة البداية).'),
    q('أكتب ___ قلم.', ['في','على','بـ','من'], 2, '<strong>بـ</strong> = with / by (الأداة).'),
    q('أتحدث ___ أستاذي كل يوم.', ['من','في','مع','إلى'], 2, '<strong>مع</strong> = with (المصاحبة).'),
    q('الكتاب ___ الحقيبة.', ['على','إلى','في','من'], 2, '<strong>في</strong> = in / inside.'),
    q('هذه الرسالة ___ صديقي.', ['من','في','على','إلى'], 0, '<strong>من</strong> = from (المُرسِل).'),
    q('"لـ" تُستخدم للتعبير عن:', ['المكان','الأداة','الملكية والغاية','الزمان'], 2, '<strong>لـ</strong> = for / to (belonging / purpose).'),
    q('أكمل: "ذهبنا ___ السيارة."', ['في','بـ','على','من'], 1, '<strong>بـ</strong> + وسيلة التنقل: بالسيارة، بالقطار.'),
  ],
  '✅ تحقق من إجاباتك','النتيجة');

const AS_LONDON_R = buildInteractivePage('ar','as_lon_r',
  '<strong>📖 فهم المقروء — رسالة من لندن</strong><br/><em style="display:block;background:#f0fdf4;border-radius:6px;padding:10px;margin:8px 0;direction:rtl">"عزيزي أحمد، أكتب إليك من لندن! وصلتُ هنا يوم الاثنين وأنا أكتشف المدينة منذ ثلاثة أيام. أمس، زرتُ برج الساعة بيغ بن وجسر لندن. الطقس بارد ولكن مشمس. أتطلع إلى رؤيتك عند عودتي. مع تحياتي، سارة."</em>',
  [
    q('متى وصلت سارة إلى لندن؟', ['يوم الأحد','يوم الاثنين','يوم الجمعة','أمس'], 1, 'الرسالة تقول "وصلتُ هنا <strong>يوم الاثنين</strong>".'),
    q('كم يوماً وهي تكتشف المدينة؟', ['يوم واحد','أسبوع كامل','ثلاثة أيام','شهران'], 2, '"أنا أكتشف المدينة <strong>منذ ثلاثة أيام</strong>".'),
    q('ما المكان المشهور الذي زارته سارة؟', ['برج إيفل','بيغ بن','الكولوسيوم','ساغرادا فاميليا'], 1, 'زارت <strong>بيغ بن</strong> وجسر لندن.'),
    q('كيف كان الطقس؟', ['حار وممطر','بارد ولكن مشمس','غائم','دافئ وعاصف'], 1, '"الطقس <strong>بارد ولكن مشمس</strong>".'),
    q('ما معنى "أتطلع إلى رؤيتك"؟', ['أنا غاضب منك','أنتظر لقاءك بشوق','لا أريد رؤيتك','نسيتُك'], 1, '"<strong>أتطلع إلى</strong>" = I look forward to.'),
    q('حرف الجر المستخدم مع يوم الأسبوع "الاثنين" هو:', ['في','على','من','إلى'], 0, 'نستخدم <strong>في / يوم</strong> مع أيام الأسبوع بالعربية.'),
  ],
  '✅ تحقق من إجاباتك','النتيجة');

const AS_LONDON_W = buildInteractivePage('ar','as_lon_w',
  '<strong>✍️ مهارات الكتابة — قواعد الرسائل</strong><br/>اختر الإجابة الصحيحة.',
  [
    q('كيف تبدأ رسالة رسمية بالعربية؟', ['مرحبا يا صاحبي!','إلى من يهمه الأمر،','هيا نتحدث','ما الأخبار؟'], 1, 'تبدأ الرسالة الرسمية بـ "<strong>إلى من يهمه الأمر</strong>" أو "السيد/السيدة...".'),
    q('كيف تختم رسالة رسمية؟', ['مع السلامة فقط','مع تحياتي الحارة / تفضل بقبول التحية','إلى اللقاء','وداعاً للأبد'], 1, 'الختام الرسمي: "<strong>مع تحياتي الحارة</strong>" أو "تفضل بقبول الاحترام".'),
    q('ما معنى "أتطلع إلى ردّك"؟', ['أنا غاضب منك','أنتظر ردّك بشوق','لا أريد ردًا','لقد أجبتُك'], 1, '"<strong>أتطلع إلى</strong>" = I look forward to.'),
    q('ما حرف الجر المستخدم مع "لندن" في "أكتب إليك من لندن"؟', ['في','إلى','من','على'], 2, '<strong>من</strong> = from (المصدر / المنشأ).'),
    q('ما الكلمة المناسبة: "أكتب إليك ___ لندن"؟', ['إلى','على','في','من'], 3, '<strong>من لندن</strong> = from London.'),
    q('ما معنى "عزيزي"؟', ['Goodbye','Dear','Thank you','Hello'], 1, '<strong>عزيزي</strong> = Dear (في بداية الرسائل).'),
  ],
  '✅ تحقق من إجاباتك','النتيجة');

const AS_TRAVEL_R = buildInteractivePage('ar','as_trav_r',
  '<strong>📖 فهم المقروء — السفر والمغامرة</strong><br/>اختر الإجابة الصحيحة.',
  [
    q('ما معنى "السفر"؟', ['النوم','الطبخ','التنقل والرحلات','القراءة'], 2, '<strong>السفر</strong> = Travel / journey.'),
    q('ما الذي تحتاجه للسفر إلى الخارج؟', ['الكتاب المدرسي','جواز السفر','المطبخ','الدراجة'], 1, 'تحتاج <strong>جواز السفر</strong> للسفر خارج البلاد.'),
    q('ما معنى "الحقيبة"؟', ['Passport','Ticket','Suitcase / bag','Hotel'], 2, '<strong>الحقيبة</strong> = Suitcase / bag.'),
    q('أين تستقل الطائرة؟', ['في المحطة','في المطار','في الميناء','في المدرسة'], 1, 'تستقل الطائرة <strong>في المطار</strong>.'),
    q('ما معنى "التذكرة"؟', ['Luggage','Hotel room','Ticket','Map'], 2, '<strong>التذكرة</strong> = Ticket.'),
    q('ما عكس "الوصول"؟', ['السفر','المغادرة','الإقامة','الراحة'], 1, 'عكس <strong>الوصول</strong> (arrival) هو <strong>المغادرة</strong> (departure).'),
  ],
  '✅ تحقق من إجاباتك','النتيجة');

const AS_TRAVEL_W = buildInteractivePage('ar','as_trav_w',
  '<strong>✍️ مفردات الكتابة — السفر والمغامرة</strong><br/>اختر الإجابة الصحيحة.',
  [
    q('أكمل: "سافرتُ ___ الطائرة إلى دبي."', ['في','مع','بـ','من'], 2, '<strong>بـ</strong> + وسيلة التنقل: بالطائرة، بالقطار.'),
    q('كيف تقول أنك زرت مكاناً سابقاً؟', ['سأزور باريس','زرتُ باريس','أزور باريس','أُريد زيارة باريس'], 1, '<strong>زرتُ</strong> = past tense: I visited.'),
    q('ما معنى "المغامرة"؟', ['Boring routine','Exciting unexpected experience','Sleep','Homework'], 1, '<strong>المغامرة</strong> = Adventure (exciting experience).'),
    q('اختر الجملة الصحيحة:', ['ذهبتُ إلى باريس منذ أسبوع.','ذهبتُ إلى باريس من أسبوع.','ذهبتُ إلى باريس في أسبوع.','ذهبتُ إلى باريس أسبوع.'], 0, '<strong>منذ أسبوع</strong> = a week ago / since a week.'),
    q('ما معنى "أتطلع إلى رحلتي"؟', ['I dreaded my trip','I look forward to my trip','I cancelled my trip','I finished my trip'], 1, '"<strong>أتطلع إلى</strong>" = I look forward to.'),
    q('أكمل: "الرحلة استغرقت ___ ثلاث ساعات."', ['منذ','قبل','خلال / مدة','بعد'], 2, '<strong>خلال / مدة</strong> = for / during (مدة محددة).'),
  ],
  '✅ تحقق من إجاباتك','النتيجة');

// ════════════════════════════════════════════════════════════
// COURSE → NEW EXERCISE PAGES MAP
// ════════════════════════════════════════════════════════════
const COURSE_UPDATES = [
  // English Audio
  { id: 'sn2baaic8ylzlnl', label: 'EN Audio M1 — Introducing yourself',  newExPages: [{ type:'exercises', title:'Interactive Exercises — Module 1', content: EA_M1 }] },
  { id: '85m0rq8dclno58h', label: 'EN Audio M2 — Family & Home',          newExPages: [{ type:'exercises', title:'Interactive Exercises — Module 2', content: EA_M2 }] },
  { id: '2hlztf7glx10l61', label: 'EN Audio M3 — Daily Life',              newExPages: [{ type:'exercises', title:'Interactive Exercises — Module 3', content: EA_M3 }] },
  { id: '76dug8t4wjxcchv', label: 'EN Audio M4 — Shopping & Food',         newExPages: [{ type:'exercises', title:'Interactive Exercises — Module 4', content: EA_M4 }] },
  { id: '92ljnifnmlbfyt3', label: 'EN Audio M5 — Leisure & Sports',        newExPages: [{ type:'exercises', title:'Interactive Exercises — Module 5', content: EA_M5 }] },
  { id: 'c2pyz13tok4got1', label: 'EN Audio M6 — City & Transport',        newExPages: [{ type:'exercises', title:'Interactive Exercises — Module 6', content: EA_M6 }] },
  { id: 'zceyq6kmvyeu7tz', label: 'EN Audio Bilan',                        newExPages: [
    { type:'exercises', title:'Final Review — Grammar',    content: EA_BILAN1 },
    { type:'exercises', title:'Final Review — Vocabulary', content: EA_BILAN2 },
  ]},
  // English Standard
  { id: 'b2nxise7pf7wolc', label: 'EN Std — Expressing Time',              newExPages: [{ type:'exercises', title:'Interactive Practice — Expressing Time',        content: ES_TIME }] },
  { id: 'kogc77rtrcw4pyu', label: 'EN Std — Expressing a Place',           newExPages: [{ type:'exercises', title:'Interactive Practice — Expressing a Place',      content: ES_PLACE }] },
  { id: 'xhf7u9oszzqn4gb', label: 'EN Std — All Prepositions',             newExPages: [{ type:'exercises', title:'Interactive Practice — All Prepositions',        content: ES_PREP }] },
  { id: 'kzzoof2b79o6dcz', label: 'EN Std — Letter from London',           newExPages: [
    { type:'exercises', title:'Reading Comprehension — A Letter from London', content: ES_LONDON_R },
    { type:'exercises', title:'Writing Knowledge Check — Letter Skills',      content: ES_LONDON_W },
  ]},
  { id: 'q5ibz22dzpp43ha', label: 'EN Std — Travel & Adventure',           newExPages: [
    { type:'exercises', title:'Reading & Vocabulary — Travel & Adventure',    content: ES_TRAVEL_R },
    { type:'exercises', title:'Writing Knowledge — Travel Expressions',        content: ES_TRAVEL_W },
  ]},
  // Arabic Audio
  { id: 'b6nrz95uw5fh3yt', label: 'AR Audio M1 — Alphabet',               newExPages: [{ type:'exercises', title:'تدريبات تفاعلية — الوحدة 1',  content: AA_M1 }] },
  { id: 'jbcsyuo1286gwbh', label: 'AR Audio M2 — Greetings',              newExPages: [{ type:'exercises', title:'تدريبات تفاعلية — الوحدة 2',  content: AA_M2 }] },
  { id: '62sizeupdh8h4uk', label: 'AR Audio M3 — Family',                 newExPages: [{ type:'exercises', title:'تدريبات تفاعلية — الوحدة 3',  content: AA_M3 }] },
  { id: 'xe5x8qkqybxoac1', label: 'AR Audio M4 — Numbers & Colours',      newExPages: [{ type:'exercises', title:'تدريبات تفاعلية — الوحدة 4',  content: AA_M4 }] },
  { id: 'u6f3lywovesf8tw', label: 'AR Audio M5 — Food',                   newExPages: [{ type:'exercises', title:'تدريبات تفاعلية — الوحدة 5',  content: AA_M5 }] },
  { id: '8jvy5lx96ctd6o1', label: 'AR Audio M6 — City & Transport',       newExPages: [{ type:'exercises', title:'تدريبات تفاعلية — الوحدة 6',  content: AA_M6 }] },
  { id: 'an8jxf1naa2u3j1', label: 'AR Audio Bilan',                       newExPages: [
    { type:'exercises', title:'المراجعة النهائية — القواعد',    content: AA_BILAN1 },
    { type:'exercises', title:'المراجعة النهائية — المفردات',   content: AA_BILAN2 },
  ]},
  // Arabic Standard
  { id: 'iuyveu92etv94kv', label: 'AR Std — Expressing Time',             newExPages: [{ type:'exercises', title:'تدريبات تفاعلية — التعبير عن الزمن',  content: AS_TIME }] },
  { id: 'aku0a8wjay4utz2', label: 'AR Std — Expressing Place',            newExPages: [{ type:'exercises', title:'تدريبات تفاعلية — التعبير عن المكان', content: AS_PLACE }] },
  { id: '1p9p91k66uel0e0', label: 'AR Std — Prepositions',                newExPages: [{ type:'exercises', title:'تدريبات تفاعلية — حروف الجر',         content: AS_PREP }] },
  { id: 'aqycq8mzh66j0zy', label: 'AR Std — Letter from London',          newExPages: [
    { type:'exercises', title:'تدريبات تفاعلية — فهم النص',       content: AS_LONDON_R },
    { type:'exercises', title:'تدريبات تفاعلية — مهارات الكتابة', content: AS_LONDON_W },
  ]},
  { id: 'znc5ppvxq8t5rkm', label: 'AR Std — Travel & Adventure',          newExPages: [
    { type:'exercises', title:'تدريبات تفاعلية — فهم المقروء',      content: AS_TRAVEL_R },
    { type:'exercises', title:'تدريبات تفاعلية — مفردات الكتابة',   content: AS_TRAVEL_W },
  ]},
];

// ════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════
async function main() {
  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);

  console.log('🔐 Authenticating...');
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log(`✅ Authenticated\n`);
  console.log(`📋 Updating ${COURSE_UPDATES.length} courses...\n`);

  let ok = 0, fail = 0;

  for (const { id, label, newExPages } of COURSE_UPDATES) {
    try {
      // Fetch current pages
      const course = await pb.collection('courses').getOne(id, { requestKey: null });
      let pages = [];
      try { pages = typeof course.pages === 'string' ? JSON.parse(course.pages) : (course.pages || []); } catch {}

      // Replace exercise pages in order, keep all others
      let exIdx = 0;
      const updated = pages.map(p => {
        if (p.type === 'exercises' && exIdx < newExPages.length) {
          const np = newExPages[exIdx++];
          return { id: p.id, type: np.type, title: np.title, content: np.content };
        }
        return p;
      });
      // Append extra exercise pages if more new than old
      while (exIdx < newExPages.length) {
        const np = newExPages[exIdx++];
        updated.push({ id: `ex-extra-${id}-${exIdx}`, type: np.type, title: np.title, content: np.content });
      }

      const str = JSON.stringify(updated);
      await pb.collection('courses').update(id, { pages: str });
      console.log(`  ✅ ${label} (${updated.length} pages, ${str.length} chars)`);
      ok++;
    } catch (err) {
      console.error(`  ❌ ${label}: ${err.message}`);
      fail++;
    }
  }

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`✅ Done — ${ok} updated, ${fail} failed`);
  console.log('═'.repeat(50));
}

main().catch(err => { console.error('Fatal:', err?.message); process.exit(1); });
