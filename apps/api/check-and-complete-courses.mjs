/**
 * check-and-complete-courses.mjs
 * ════════════════════════════════════════════════════════════════════
 * 1. Diagnostique tous les cours standard EN + AR
 * 2. Affiche les pages présentes / manquantes (lecture, exercices,
 *    dialogue, bilan)
 * 3. Ajoute les pages manquantes pour chaque cours
 *
 * Usage :  cd apps/api && node check-and-complete-courses.mjs
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

// ── helpers ──────────────────────────────────────────────────────────
const hasType = (pages, type) => pages.some(p => p.type === type);
const RED  = '#c0392b';
const GRN  = '#27ae60';
const th   = (bg) => `style="background:${bg};color:#fff"`;
const row  = `style="background:#f9f9f9"`;

// ════════════════════════════════════════════════════════════════════
// MISSING PAGES GENERATORS — returns array of page objects to append
// ════════════════════════════════════════════════════════════════════

// ── ENGLISH courses ──────────────────────────────────────────────────

function enTimeMissing(pages) {
  const add = [];

  if (!hasType(pages, 'dialogue')) add.push({
    id: 'en-time-dial', type: 'dialogue',
    title: 'Dialogue — Making Plans',
    content: `<h3>💬 Dialogue — Making Plans</h3>
<p style="color:#555;font-size:13px;margin-bottom:12px">Listen and read. Notice how time prepositions are used naturally.</p>
<div style="background:#f8f9fa;border-radius:8px;padding:16px;line-height:2">
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Emma</span>&nbsp; Are you free <strong>on</strong> Saturday?</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Tom</span>&nbsp; Yes! What time?</p>
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Emma</span>&nbsp; Let's meet <strong>at</strong> 3 o'clock <strong>in</strong> the afternoon.</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Tom</span>&nbsp; Perfect. I've been waiting <strong>for</strong> weeks to see that film!</p>
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Emma</span>&nbsp; Me too. I saw the trailer <strong>two days ago</strong> and it looks amazing.</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Tom</span>&nbsp; Great. <strong>Before</strong> the film, shall we get coffee?</p>
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Emma</span>&nbsp; Sure — <strong>by</strong> 2:30 at the café?</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Tom</span>&nbsp; Deal. See you then!</p>
</div>
<div style="background:#fff3f3;border-left:4px solid ${RED};padding:10px;border-radius:4px;margin-top:12px">
  <strong>🔍 Spot the prepositions:</strong> on Saturday · at 3 o'clock · in the afternoon · for weeks · two days ago · before the film · by 2:30
</div>`,
  });

  if (!hasType(pages, 'bilan')) add.push({
    id: 'en-time-bilan', type: 'bilan',
    title: 'Summary — What You Learned',
    content: `<h3>🏁 Summary — Expressing Time in English</h3>
<div style="background:#f8f9fa;border-radius:8px;padding:16px;line-height:2.2">
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">AT</span>&nbsp; exact time / moment of day: <em>at 8h · at noon · at Christmas</em></p>
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">IN</span>&nbsp; month / season / year: <em>in July · in summer · in 2020</em></p>
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">ON</span>&nbsp; day / date: <em>on Monday · on 1st July</em></p>
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">FOR</span>&nbsp; duration: <em>for 2 hours</em> &nbsp;|&nbsp; <span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">SINCE</span>&nbsp; starting point: <em>since 2015</em></p>
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">DURING</span>&nbsp; throughout a period: <em>during the film</em></p>
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">BY</span>&nbsp; deadline: <em>by Friday</em> &nbsp;|&nbsp; <span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">AGO</span>&nbsp; past: <em>2 days ago</em></p>
</div>
<div style="background:#fff3f3;border-left:4px solid ${RED};border-radius:6px;padding:14px;margin-top:12px">
  <strong>✅ Self-check — Can you…</strong>
  <ul style="margin:8px 0 0 0">
    <li>Say what time you do something each day? (AT / IN / ON)</li>
    <li>Say how long you have done something? (FOR / SINCE)</li>
    <li>Talk about a past event? (AGO / BEFORE / AFTER)</li>
    <li>Give a deadline? (BY)</li>
  </ul>
</div>`,
  });
  return add;
}

function enPlaceMissing(pages) {
  const add = [];
  if (!hasType(pages, 'dialogue')) add.push({
    id: 'en-place-dial', type: 'dialogue',
    title: 'Dialogue — Finding the Library',
    content: `<h3>💬 Dialogue — Finding the Library</h3>
<p style="color:#555;font-size:13px;margin-bottom:12px">Read the conversation. Notice how place prepositions are used.</p>
<div style="background:#f8f9fa;border-radius:8px;padding:16px;line-height:2">
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Sarah</span>&nbsp; Excuse me, is there a library <strong>near</strong> here?</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Man</span>&nbsp; Yes! Go along this street, past the bank.</p>
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Sarah</span>&nbsp; Is it <strong>on</strong> the left or the right?</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Man</span>&nbsp; It's <strong>between</strong> the post office and the school, <strong>opposite</strong> the park.</p>
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Sarah</span>&nbsp; Great. And is there a café <strong>in front of</strong> the library?</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Man</span>&nbsp; Yes, there's one <strong>next to</strong> the entrance. You can't miss it!</p>
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Sarah</span>&nbsp; Perfect, thank you so much!</p>
</div>
<div style="background:#fff3f3;border-left:4px solid ${RED};padding:10px;border-radius:4px;margin-top:12px">
  <strong>🔍 Spot the prepositions:</strong> near · on the left · between · opposite · in front of · next to
</div>`,
  });
  if (!hasType(pages, 'bilan')) add.push({
    id: 'en-place-bilan', type: 'bilan',
    title: 'Summary — What You Learned',
    content: `<h3>🏁 Summary — Expressing Place in English</h3>
<div style="background:#f8f9fa;border-radius:8px;padding:16px;line-height:2.2">
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">IN</span>&nbsp; enclosed space: <em>in the room · in London · in the car</em></p>
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">AT</span>&nbsp; specific point: <em>at school · at home · at the station</em></p>
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">ON</span>&nbsp; surface: <em>on the table · on the wall · on the floor</em></p>
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">UNDER</span>&nbsp; below &nbsp;|&nbsp; <span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">ABOVE</span>&nbsp; higher than &nbsp;|&nbsp; <span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">OVER</span>&nbsp; covering</p>
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">NEXT TO</span>&nbsp; beside &nbsp;|&nbsp; <span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">IN FRONT OF</span>&nbsp; facing &nbsp;|&nbsp; <span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">BEHIND</span>&nbsp; at the back</p>
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">BETWEEN</span>&nbsp; two things &nbsp;|&nbsp; <span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">OPPOSITE</span>&nbsp; facing &nbsp;|&nbsp; <span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">AROUND</span>&nbsp; surrounding</p>
</div>
<div style="background:#fff3f3;border-left:4px solid ${RED};border-radius:6px;padding:14px;margin-top:12px">
  <strong>✅ Self-check — Can you…</strong>
  <ul style="margin:8px 0 0 0">
    <li>Say where something is using IN / AT / ON?</li>
    <li>Describe vertical position (under, above, below)?</li>
    <li>Give directions using next to, opposite, behind, between?</li>
    <li>Describe your room or neighbourhood in English?</li>
  </ul>
</div>`,
  });
  return add;
}

function enPrepMissing(pages) {
  const add = [];
  if (!hasType(pages, 'dialogue')) add.push({
    id: 'en-prep-dial', type: 'dialogue',
    title: 'Dialogue — Getting Around the City',
    content: `<h3>💬 Dialogue — Getting Around the City</h3>
<div style="background:#f8f9fa;border-radius:8px;padding:16px;line-height:2">
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Ali</span>&nbsp; How do you usually get <strong>to</strong> work?</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Lena</span>&nbsp; I travel <strong>by</strong> bus. It goes <strong>through</strong> the city centre.</p>
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Ali</span>&nbsp; How long does it take?</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Lena</span>&nbsp; About 30 minutes. I've been doing it <strong>since</strong> January.</p>
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Ali</span>&nbsp; Do you walk <strong>along</strong> the river <strong>from</strong> the bus stop?</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Lena</span>&nbsp; Yes! I walk <strong>across</strong> the bridge and <strong>past</strong> the market. It's lovely!</p>
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Ali</span>&nbsp; That sounds great. I depend <strong>on</strong> my car — I should change!</p>
</div>
<div style="background:#fff3f3;border-left:4px solid ${RED};padding:10px;border-radius:4px;margin-top:12px">
  <strong>🔍 Spot the prepositions:</strong> to work · by bus · through · since January · along · from · across · past · depend on
</div>`,
  });
  if (!hasType(pages, 'bilan')) add.push({
    id: 'en-prep-bilan', type: 'bilan',
    title: 'Summary — All Prepositions',
    content: `<h3>🏁 Summary — All English Prepositions</h3>
<div style="background:#f8f9fa;border-radius:8px;padding:14px;line-height:2">
  <p><strong>⏰ Time:</strong> <code>at</code> 8h · <code>in</code> July · <code>on</code> Monday · <code>for</code> 2h · <code>since</code> 2015 · <code>during</code> · <code>by</code> Friday · <code>ago</code></p>
  <p><strong>📍 Place:</strong> <code>in</code> room · <code>at</code> school · <code>on</code> table · <code>under</code> · <code>above</code> · <code>next to</code> · <code>between</code> · <code>opposite</code></p>
  <p><strong>🚶 Movement:</strong> <code>to</code> · <code>from</code> · <code>into</code> · <code>out of</code> · <code>through</code> · <code>across</code> · <code>along</code> · <code>past</code></p>
  <p><strong>🔧 Manner:</strong> <code>by</code> bus · <code>with</code> a pen · <code>because of</code> · <code>due to</code></p>
  <p><strong>🔗 Fixed:</strong> listen <code>to</code> · look <code>at</code> · wait <code>for</code> · depend <code>on</code> · agree <code>with</code></p>
</div>
<div style="background:#fff3f3;border-left:4px solid ${RED};border-radius:6px;padding:14px;margin-top:12px">
  <strong>✅ Self-check — Can you…</strong>
  <ul style="margin:8px 0 0 0">
    <li>Use time, place, and movement prepositions correctly?</li>
    <li>Describe how you travel (by bus, on foot, by car)?</li>
    <li>Use fixed verb + preposition combinations?</li>
    <li>Distinguish FOR (duration) from SINCE (starting point)?</li>
  </ul>
</div>`,
  });
  return add;
}

function enLondonMissing(pages) {
  const add = [];
  if (!hasType(pages, 'dialogue')) add.push({
    id: 'en-london-dial', type: 'dialogue',
    title: 'Dialogue — Talking About the Letter',
    content: `<h3>💬 Dialogue — Talking About the Letter</h3>
<div style="background:#f8f9fa;border-radius:8px;padding:16px;line-height:2">
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Yasmine</span>&nbsp; I just got a letter from Sophia in London!</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Nadia</span>&nbsp; Really? How is she? What does she say?</p>
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Yasmine</span>&nbsp; She's getting used to life there. Her <strong>flat</strong> is near Hyde Park.</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Nadia</span>&nbsp; <strong>Incredible!</strong> Does she like London?</p>
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Yasmine</span>&nbsp; Yes! She loves the red <strong>double-decker buses</strong> and the <strong>Underground</strong>.</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Nadia</span>&nbsp; What about the weather?</p>
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Yasmine</span>&nbsp; Cold and rainy! She <strong>misses</strong> us a lot. She wants us to visit soon.</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Nadia</span>&nbsp; We should <strong>write back</strong> to her today!</p>
</div>
<div style="background:#fff3f3;border-left:4px solid ${RED};padding:10px;border-radius:4px;margin-top:12px">
  <strong>🔍 Key vocabulary in context:</strong> flat · incredible · double-decker buses · Underground · misses · write back
</div>`,
  });
  if (!hasType(pages, 'bilan')) add.push({
    id: 'en-london-bilan', type: 'bilan',
    title: 'Summary — What You Learned',
    content: `<h3>🏁 Summary — A Letter from London</h3>
<div style="background:#f8f9fa;border-radius:8px;padding:16px;line-height:2">
  <p><strong>📖 Reading skills:</strong> You can read and understand an authentic personal letter in English.</p>
  <p><strong>📚 Vocabulary learned:</strong> flat · getting used to · double-decker · Underground · incredible · I miss you · write back · best wishes</p>
  <p><strong>✉️ Letter structure:</strong></p>
  <ul>
    <li>Opening: <em>Dear [Name], How are you? I hope you are well.</em></li>
    <li>Body: describe your situation, what you have seen/done</li>
    <li>Closing: <em>Best wishes / Kind regards / Looking forward to hearing from you.</em></li>
  </ul>
</div>
<div style="background:#fff3f3;border-left:4px solid ${RED};border-radius:6px;padding:14px;margin-top:12px">
  <strong>✅ Self-check — Can you…</strong>
  <ul style="margin:8px 0 0 0">
    <li>Understand the main points of Sophia's letter?</li>
    <li>Use at least 5 new vocabulary words correctly?</li>
    <li>Write a personal letter of 80–100 words in English?</li>
    <li>Use proper opening and closing phrases?</li>
  </ul>
</div>`,
  });
  return add;
}

function enTravelMissing(pages) {
  const add = [];
  if (!hasType(pages, 'dialogue')) add.push({
    id: 'en-travel-dial', type: 'dialogue',
    title: 'Dialogue — Talking About a Trip',
    content: `<h3>💬 Dialogue — Talking About a Trip</h3>
<div style="background:#f8f9fa;border-radius:8px;padding:16px;line-height:2">
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">James</span>&nbsp; Did you have a good holiday?</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Sara</span>&nbsp; Amazing! I went to Morocco for two weeks.</p>
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">James</span>&nbsp; Really? How did you get there?</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Sara</span>&nbsp; I flew to Marrakech. The flight was only 3 hours — <strong>breathtaking</strong> views!</p>
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">James</span>&nbsp; What did you visit?</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Sara</span>&nbsp; I <strong>explored</strong> the medina, visited the souks, and stayed in a beautiful <strong>riad</strong>.</p>
  <p><span style="background:${RED};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">James</span>&nbsp; Would you <strong>recommend</strong> it?</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">Sara</span>&nbsp; Absolutely! The people were incredibly friendly and the food was delicious. I'm <strong>grateful</strong> I went!</p>
</div>
<div style="background:#fff3f3;border-left:4px solid ${RED};padding:10px;border-radius:4px;margin-top:12px">
  <strong>🔍 Key vocabulary in context:</strong> breathtaking · explored · riad · recommend · grateful · past tense: went, flew, visited, stayed
</div>`,
  });
  if (!hasType(pages, 'bilan')) add.push({
    id: 'en-travel-bilan', type: 'bilan',
    title: 'Summary — What You Learned',
    content: `<h3>🏁 Summary — Travel & Adventure</h3>
<div style="background:#f8f9fa;border-radius:8px;padding:16px;line-height:2">
  <p><strong>📖 Reading skills:</strong> You can read and understand an English travel text.</p>
  <p><strong>📚 Key vocabulary:</strong> gap year · journey · explore · ferry · breathtaking · riad · independent · open-minded · grateful · recommend</p>
  <p><strong>⏰ Past Simple verbs:</strong> flew · spent · took · went · visited · ate · stayed · rode · met · learned</p>
</div>
<div style="background:#fff3f3;border-left:4px solid ${RED};border-radius:6px;padding:14px;margin-top:12px">
  <strong>✅ Self-check — Can you…</strong>
  <ul style="margin:8px 0 0 0">
    <li>Understand the main points of James's travel story?</li>
    <li>Use past simple verbs to talk about a past trip?</li>
    <li>Use at least 5 travel vocabulary words correctly?</li>
    <li>Write 80–100 words about a real or imaginary trip?</li>
  </ul>
</div>`,
  });
  return add;
}

// ── ARABIC courses ────────────────────────────────────────────────────

function arTimeMissing(pages) {
  const add = [];
  if (!hasType(pages, 'dialogue')) add.push({
    id: 'ar-time-dial', type: 'dialogue',
    title: 'Dialogue — حوار يومي',
    content: `<h3>💬 Dialogue — حوار يومي (Daily Conversation)</h3>
<p style="color:#555;font-size:13px;margin-bottom:12px">Read the dialogue. Notice how time words are used.</p>
<div style="background:#f8f9fa;border-radius:8px;padding:16px;line-height:2;direction:rtl">
  <p><span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">سارة</span>&nbsp; ماذا فعلتَ <strong>أمس</strong>؟</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">أحمد</span>&nbsp; ذهبتُ إلى المكتبة <strong>في الصباح</strong>، ثم زرتُ صديقي <strong>بعد الظهر</strong>.</p>
  <p><span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">سارة</span>&nbsp; وماذا ستفعل <strong>غداً</strong>؟</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">أحمد</span>&nbsp; لديّ امتحان <strong>في</strong> الساعة التاسعة <strong>صباحاً</strong>.</p>
  <p><span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">سارة</span>&nbsp; هل أنت مستعد؟</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">أحمد</span>&nbsp; أدرس <strong>منذ</strong> أسبوع، <strong>دائماً</strong> في المساء.</p>
  <p><span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">سارة</span>&nbsp; حظ سعيد!</p>
</div>
<div style="background:#f0fff4;border-left:4px solid ${GRN};padding:10px;border-radius:4px;margin-top:12px">
  <strong>🔍 Time words used:</strong> أمس (yesterday) · في الصباح (in the morning) · بعد الظهر (in the afternoon) · غداً (tomorrow) · في الساعة (at … o'clock) · منذ (since/for) · دائماً (always)
</div>`,
  });
  if (!hasType(pages, 'bilan')) add.push({
    id: 'ar-time-bilan', type: 'bilan',
    title: 'Summary — What You Learned',
    content: `<h3>🏁 Summary — التعبير عن الزمن</h3>
<div style="background:#f0fff4;border-radius:8px;padding:16px;line-height:2.4;direction:rtl">
  <p><span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">الآن</span>&nbsp; now &nbsp;|&nbsp; <span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">اليوم</span>&nbsp; today &nbsp;|&nbsp; <span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">أمس</span>&nbsp; yesterday &nbsp;|&nbsp; <span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">غداً</span>&nbsp; tomorrow</p>
  <p><span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">دائماً</span>&nbsp; always &nbsp;|&nbsp; <span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">أحياناً</span>&nbsp; sometimes &nbsp;|&nbsp; <span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">أبداً</span>&nbsp; never</p>
  <p><span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">في</span>&nbsp; in / on &nbsp;|&nbsp; <span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">منذ</span>&nbsp; since / for &nbsp;|&nbsp; <span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">خلال</span>&nbsp; during</p>
  <p><span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">قبل</span>&nbsp; before &nbsp;|&nbsp; <span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">بعد</span>&nbsp; after</p>
</div>
<div style="background:#f0fff4;border-left:4px solid ${GRN};border-radius:6px;padding:14px;margin-top:12px">
  <strong>✅ Self-check — Can you…</strong>
  <ul style="margin:8px 0 0 0">
    <li>Say what you did yesterday and what you will do tomorrow?</li>
    <li>Name all 7 days of the week in Arabic?</li>
    <li>Use منذ (since/for) in a sentence correctly?</li>
    <li>Say something you always / sometimes / never do?</li>
  </ul>
</div>`,
  });
  return add;
}

function arPlaceMissing(pages) {
  const add = [];
  if (!hasType(pages, 'dialogue')) add.push({
    id: 'ar-place-dial', type: 'dialogue',
    title: 'Dialogue — أين المكتبة؟',
    content: `<h3>💬 Dialogue — أين المكتبة؟ (Where is the library?)</h3>
<div style="background:#f8f9fa;border-radius:8px;padding:16px;line-height:2;direction:rtl">
  <p><span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">ليلى</span>&nbsp; عفواً، أين المكتبة؟</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">رجل</span>&nbsp; المكتبة <strong>بين</strong> البنك والمدرسة.</p>
  <p><span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">ليلى</span>&nbsp; هل هي <strong>بجانب</strong> الحديقة؟</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">رجل</span>&nbsp; نعم، الحديقة <strong>أمام</strong> المكتبة مباشرةً.</p>
  <p><span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">ليلى</span>&nbsp; وهل هناك مقهى <strong>داخل</strong> المكتبة؟</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">رجل</span>&nbsp; نعم، المقهى <strong>في</strong> الطابق الأول، <strong>بجانب</strong> المدخل.</p>
  <p><span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">ليلى</span>&nbsp; شكراً جزيلاً!</p>
</div>
<div style="background:#f0fff4;border-left:4px solid ${GRN};padding:10px;border-radius:4px;margin-top:12px">
  <strong>🔍 Place prepositions used:</strong> بين (between) · بجانب (next to) · أمام (in front of) · داخل (inside) · في (in) · بجانب (next to)
</div>`,
  });
  if (!hasType(pages, 'bilan')) add.push({
    id: 'ar-place-bilan', type: 'bilan',
    title: 'Summary — What You Learned',
    content: `<h3>🏁 Summary — التعبير عن المكان</h3>
<div style="background:#f0fff4;border-radius:8px;padding:16px;line-height:2.4;direction:rtl">
  <p><span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">في</span>&nbsp; in, inside &nbsp;|&nbsp; <span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">على</span>&nbsp; on</p>
  <p><span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">تحت</span>&nbsp; under &nbsp;|&nbsp; <span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">فوق</span>&nbsp; above / over</p>
  <p><span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">أمام</span>&nbsp; in front of &nbsp;|&nbsp; <span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">خلف</span>&nbsp; behind &nbsp;|&nbsp; <span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">بين</span>&nbsp; between</p>
  <p><span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">بجانب</span>&nbsp; next to &nbsp;|&nbsp; <span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">داخل</span>&nbsp; inside &nbsp;|&nbsp; <span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">خارج</span>&nbsp; outside</p>
</div>
<div style="background:#f0fff4;border-left:4px solid ${GRN};border-radius:6px;padding:14px;margin-top:12px">
  <strong>✅ Self-check — Can you…</strong>
  <ul style="margin:8px 0 0 0">
    <li>Describe where an object is using في / على / تحت / فوق?</li>
    <li>Give directions using أمام / خلف / بين / بجانب?</li>
    <li>Describe your room or a street in Arabic?</li>
    <li>Understand a short Arabic dialogue about location?</li>
  </ul>
</div>`,
  });
  return add;
}

function arPrepMissing(pages) {
  const add = [];
  if (!hasType(pages, 'dialogue')) add.push({
    id: 'ar-prep2-dial', type: 'dialogue',
    title: 'Dialogue — رحلة إلى المدرسة',
    content: `<h3>💬 Dialogue — رحلة إلى المدرسة (Going to School)</h3>
<div style="background:#f8f9fa;border-radius:8px;padding:16px;line-height:2;direction:rtl">
  <p><span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">أم</span>&nbsp; <strong>إلى</strong> أين تذهب يا أحمد؟</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">أحمد</span>&nbsp; أذهب <strong>إلى</strong> المدرسة، يا أمي.</p>
  <p><span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">أم</span>&nbsp; كيف تسافر؟ <strong>بالحافلة</strong>؟</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">أحمد</span>&nbsp; لا، أمشي. أمرّ <strong>عبر</strong> الحديقة و<strong>أمام</strong> المسجد.</p>
  <p><span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">أم</span>&nbsp; هل تصل <strong>قبل</strong> الثامنة؟</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">أحمد</span>&nbsp; نعم، المدرسة <strong>قريبة من</strong> البيت — فقط عشر دقائق.</p>
</div>
<div style="background:#f0fff4;border-left:4px solid ${GRN};padding:10px;border-radius:4px;margin-top:12px">
  <strong>🔍 Prepositions used:</strong> إلى (to) · بالحافلة (by bus) · عبر (through) · أمام (in front of) · قبل (before) · قريبة من (close to)
</div>`,
  });
  if (!hasType(pages, 'bilan')) add.push({
    id: 'ar-prep2-bilan', type: 'bilan',
    title: 'Summary — All Prepositions',
    content: `<h3>🏁 Summary — حروف الجر العربية</h3>
<div style="background:#f0fff4;border-radius:8px;padding:16px;line-height:2.4;direction:rtl">
  <p><strong>📍 Place:</strong> <span style="background:${GRN};color:#fff;padding:2px 6px;border-radius:8px;font-size:11px">في</span> in &nbsp; <span style="background:${GRN};color:#fff;padding:2px 6px;border-radius:8px;font-size:11px">على</span> on &nbsp; <span style="background:${GRN};color:#fff;padding:2px 6px;border-radius:8px;font-size:11px">تحت</span> under &nbsp; <span style="background:${GRN};color:#fff;padding:2px 6px;border-radius:8px;font-size:11px">فوق</span> above &nbsp; <span style="background:${GRN};color:#fff;padding:2px 6px;border-radius:8px;font-size:11px">بين</span> between</p>
  <p><strong>⏰ Time:</strong> <span style="background:${GRN};color:#fff;padding:2px 6px;border-radius:8px;font-size:11px">في</span> in/on &nbsp; <span style="background:${GRN};color:#fff;padding:2px 6px;border-radius:8px;font-size:11px">منذ</span> since &nbsp; <span style="background:${GRN};color:#fff;padding:2px 6px;border-radius:8px;font-size:11px">خلال</span> during &nbsp; <span style="background:${GRN};color:#fff;padding:2px 6px;border-radius:8px;font-size:11px">قبل</span> before &nbsp; <span style="background:${GRN};color:#fff;padding:2px 6px;border-radius:8px;font-size:11px">بعد</span> after</p>
  <p><strong>🚶 Movement:</strong> <span style="background:${GRN};color:#fff;padding:2px 6px;border-radius:8px;font-size:11px">إلى</span> to &nbsp; <span style="background:${GRN};color:#fff;padding:2px 6px;border-radius:8px;font-size:11px">من</span> from &nbsp; <span style="background:${GRN};color:#fff;padding:2px 6px;border-radius:8px;font-size:11px">عبر</span> through &nbsp; <span style="background:${GRN};color:#fff;padding:2px 6px;border-radius:8px;font-size:11px">نحو</span> towards</p>
  <p><strong>🔧 Other:</strong> <span style="background:${GRN};color:#fff;padding:2px 6px;border-radius:8px;font-size:11px">مع</span> with &nbsp; <span style="background:${GRN};color:#fff;padding:2px 6px;border-radius:8px;font-size:11px">بدون</span> without &nbsp; <span style="background:${GRN};color:#fff;padding:2px 6px;border-radius:8px;font-size:11px">بسبب</span> because of</p>
</div>
<div style="background:#f0fff4;border-left:4px solid ${GRN};border-radius:6px;padding:14px;margin-top:12px">
  <strong>✅ Self-check — Can you…</strong>
  <ul style="margin:8px 0 0 0">
    <li>Use place, time, and movement prepositions in Arabic?</li>
    <li>Say how you travel (بالحافلة، بالقطار، مشياً)?</li>
    <li>Describe a route or journey in Arabic?</li>
    <li>Use قبل and بعد with a noun correctly?</li>
  </ul>
</div>`,
  });
  return add;
}

function arLondonMissing(pages) {
  const add = [];
  if (!hasType(pages, 'dialogue')) add.push({
    id: 'ar-london2-dial', type: 'dialogue',
    title: 'Dialogue — الحديث عن الرسالة',
    content: `<h3>💬 Dialogue — الحديث عن الرسالة (Talking About the Letter)</h3>
<div style="background:#f8f9fa;border-radius:8px;padding:16px;line-height:2;direction:rtl">
  <p><span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">ياسمين</span>&nbsp; وصلتني رسالة من صوفيا <strong>من لندن</strong>!</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">نادية</span>&nbsp; حقاً؟ كيف حالها؟ ماذا قالت؟</p>
  <p><span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">ياسمين</span>&nbsp; هي تتأقلم <strong>مع</strong> الحياة هناك. <strong>شقتها</strong> قريبة <strong>من</strong> حديقة هايد بارك.</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">نادية</span>&nbsp; رائع! هل تحب لندن؟</p>
  <p><span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">ياسمين</span>&nbsp; نعم! تحب الحافلات الحمراء <strong>ذات الطابقين</strong> والقطار <strong>تحت الأرض</strong>.</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">نادية</span>&nbsp; وكيف الطقس؟</p>
  <p><span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">ياسمين</span>&nbsp; بارد وممطر! هي <strong>تشتاق إلينا</strong> كثيراً. تريد أن نزورها قريباً.</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">نادية</span>&nbsp; يجب أن <strong>نرد عليها</strong> اليوم!</p>
</div>
<div style="background:#f0fff4;border-left:4px solid ${GRN};padding:10px;border-radius:4px;margin-top:12px">
  <strong>🔍 Key vocabulary:</strong> شقة (flat) · ذات الطابقين (double-decker) · تحت الأرض (underground) · تشتاق إلينا (she misses us) · نرد عليها (write back to her)
</div>`,
  });
  if (!hasType(pages, 'bilan')) add.push({
    id: 'ar-london2-bilan', type: 'bilan',
    title: 'Summary — What You Learned',
    content: `<h3>🏁 Summary — رسالة من لندن</h3>
<div style="background:#f0fff4;border-radius:8px;padding:16px;line-height:2;direction:rtl">
  <p><strong>📖 Reading:</strong> You can read and understand a personal letter written in Arabic.</p>
  <p><strong>📚 Vocabulary learned:</strong> شقة · أتأقلم · صاخبة · ذات الطابقين · رائعة · أشتاق إليك · مع أطيب التحيات</p>
  <p><strong>✉️ Letter structure in Arabic:</strong></p>
  <ul>
    <li>Opening: <em>عزيزي / عزيزتي [الاسم]، كيف حالك؟ أتمنى أن تكون بخير.</em></li>
    <li>Body: describe your situation, what you have seen/done</li>
    <li>Closing: <em>مع أطيب التحيات / في انتظار ردك</em></li>
  </ul>
</div>
<div style="background:#f0fff4;border-left:4px solid ${GRN};border-radius:6px;padding:14px;margin-top:12px">
  <strong>✅ Self-check — Can you…</strong>
  <ul style="margin:8px 0 0 0">
    <li>Understand the main points of Sophia's letter in Arabic?</li>
    <li>Use at least 5 new vocabulary words correctly?</li>
    <li>Write a personal letter of 80–100 words in Arabic?</li>
    <li>Use correct Arabic opening and closing phrases?</li>
  </ul>
</div>`,
  });
  return add;
}

function arTravelMissing(pages) {
  const add = [];
  if (!hasType(pages, 'dialogue')) add.push({
    id: 'ar-travel2-dial', type: 'dialogue',
    title: 'Dialogue — الحديث عن الرحلة',
    content: `<h3>💬 Dialogue — الحديث عن الرحلة (Talking About the Trip)</h3>
<div style="background:#f8f9fa;border-radius:8px;padding:16px;line-height:2;direction:rtl">
  <p><span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">جيمس</span>&nbsp; هل استمتعتَ بعطلتك؟</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">سارة</span>&nbsp; كانت رائعة! <strong>ذهبتُ</strong> إلى المغرب لمدة أسبوعين.</p>
  <p><span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">جيمس</span>&nbsp; حقاً؟ كيف <strong>سافرتِ</strong> إلى هناك؟</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">سارة</span>&nbsp; <strong>طرتُ</strong> إلى مراكش — المناظر كانت <strong>خلّابة</strong>!</p>
  <p><span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">جيمس</span>&nbsp; ماذا <strong>زرتِ</strong>؟</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">سارة</span>&nbsp; <strong>استكشفتُ</strong> المدينة القديمة و<strong>بِتُّ</strong> في رياض تقليدي. كان ساحراً!</p>
  <p><span style="background:${GRN};color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">جيمس</span>&nbsp; هل <strong>توصين</strong> به؟</p>
  <p><span style="background:#2980b9;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">سارة</span>&nbsp; بالتأكيد! أنا <strong>ممتنّة</strong> لهذه التجربة الرائعة!</p>
</div>
<div style="background:#f0fff4;border-left:4px solid ${GRN};padding:10px;border-radius:4px;margin-top:12px">
  <strong>🔍 Past tense verbs used:</strong> ذهبتُ (went) · سافرتِ (travelled) · طرتُ (flew) · زرتِ (visited) · استكشفتُ (explored) · بِتُّ (stayed)
</div>`,
  });
  if (!hasType(pages, 'bilan')) add.push({
    id: 'ar-travel2-bilan', type: 'bilan',
    title: 'Summary — What You Learned',
    content: `<h3>🏁 Summary — السفر والمغامرة</h3>
<div style="background:#f0fff4;border-radius:8px;padding:16px;line-height:2;direction:rtl">
  <p><strong>📖 Reading:</strong> You can read and understand an Arabic travel story.</p>
  <p><strong>📚 Key vocabulary:</strong> رحلة · يستكشف · عبّارة · خلّاب · رياض · الاستقلالية · الامتنان · أوصي</p>
  <p><strong>⏰ Past tense verbs:</strong> طار · قضى · ركب · زار · بات · التقى · تعلّم</p>
</div>
<div style="background:#f0fff4;border-left:4px solid ${GRN};border-radius:6px;padding:14px;margin-top:12px">
  <strong>✅ Self-check — Can you…</strong>
  <ul style="margin:8px 0 0 0">
    <li>Understand James's travel story in Arabic?</li>
    <li>Use past tense verbs to describe a trip (طرتُ، زرتُ، بِتُّ)?</li>
    <li>Use at least 5 travel vocabulary words in Arabic?</li>
    <li>Write 80–100 words about a trip in Arabic?</li>
  </ul>
</div>`,
  });
  return add;
}

// ════════════════════════════════════════════════════════════════════
// Map: title pattern → missing pages generator
// ════════════════════════════════════════════════════════════════════
const COURSE_RULES = [
  // English
  { match: t => t.includes('Expressing Time') && !t.includes('Arabic'),    fn: enTimeMissing   },
  { match: t => t.includes('Expressing a Place') && !t.includes('Arabic'), fn: enPlaceMissing  },
  { match: t => t.includes('All English Prepositions'),                     fn: enPrepMissing   },
  { match: t => t.includes('Letter from London') && !t.includes('Arabic'), fn: enLondonMissing },
  { match: t => t.includes('Travel') && !t.includes('Arabic'),             fn: enTravelMissing },
  // Arabic
  { match: t => t.includes('الزمن'),   fn: arTimeMissing   },
  { match: t => t.includes('المكان'),  fn: arPlaceMissing  },
  { match: t => t.includes('حروف الجر'), fn: arPrepMissing },
  { match: t => t.includes('لندن'),    fn: arLondonMissing },
  { match: t => t.includes('السفر'),   fn: arTravelMissing },
];

// ════════════════════════════════════════════════════════════════════
async function main() {
  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);

  console.log('🔐 Authenticating...');
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log('✅ Authenticated\n');

  // Fetch all EN + AR standard courses
  const all = await pb.collection('courses').getFullList({
    filter: `(langue = "Anglais" || langue = "Arabe") && course_type = "standard"`,
    sort:   'langue,created',
    requestKey: null,
  });

  console.log(`📋 Found ${all.length} standard EN + AR courses\n`);

  let updated = 0;
  let ok      = 0;

  for (const course of all) {
    let pages = [];
    try { pages = JSON.parse(course.pages || '[]'); } catch { pages = []; }

    const types     = pages.map(p => p.type);
    const hasLesson = hasType(pages, 'lesson');
    const hasEx     = hasType(pages, 'exercises');
    const hasDial   = hasType(pages, 'dialogue');
    const hasBilan  = hasType(pages, 'bilan');

    const status = [
      hasLesson ? '✅ lecture'   : '❌ lecture',
      hasEx     ? '✅ exercices' : '❌ exercices',
      hasDial   ? '✅ dialogue'  : '❌ dialogue',
      hasBilan  ? '✅ bilan'     : '❌ bilan',
    ].join('  ');

    console.log(`[${course.langue}] ${course.titre}`);
    console.log(`  ${status}`);
    console.log(`  Pages: ${types.join(', ')}`);

    if (hasDial && hasBilan) { console.log('  → Already complete ✓\n'); ok++; continue; }

    // Find matching rule
    const rule = COURSE_RULES.find(r => r.match(course.titre));
    if (!rule) { console.log('  ⚠️  No rule found — skipping\n'); continue; }

    const toAdd = rule.fn(pages);
    if (toAdd.length === 0) { console.log('  → Nothing to add\n'); ok++; continue; }

    const newPages = [...pages, ...toAdd];
    try {
      await pb.collection('courses').update(course.id, { pages: JSON.stringify(newPages) });
      console.log(`  ✅ Added: ${toAdd.map(p => p.type + ' (' + p.title + ')').join(', ')}\n`);
      updated++;
    } catch (err) {
      const d = err?.data ? JSON.stringify(err.data) : err.message;
      console.error(`  ❌ Update failed: ${d}\n`);
    }
  }

  console.log('════════════════════════════════════════════');
  console.log(`✅ Done — ${updated} courses updated, ${ok} already complete`);
  console.log('════════════════════════════════════════════');
}

main().catch(err => {
  console.error('Fatal:', err?.data ? JSON.stringify(err.data) : err.message);
  process.exit(1);
});
