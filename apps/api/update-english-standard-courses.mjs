/**
 * update-english-standard-courses.mjs
 * ════════════════════════════════════════════════════════════════════
 * 1. Supprime les 2 doublons des cours anglais (mauvais titres en FR)
 * 2. Met à jour les 3 cours anglais uniques (titres/contenu 100% EN)
 * 3. Met à jour les 5 cours arabes (titres propres, contenu arabe)
 *
 * Usage :  cd apps/api && node update-english-standard-courses.mjs
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

// ════════════════════════════════════════════════════════════════════
// Titres à supprimer (doublons avec mauvais titres français)
// ════════════════════════════════════════════════════════════════════
const TITLES_TO_DELETE = [
  'Anglais — Exprimer le temps (Time Expressions)',
  'Anglais — Exprimer un lieu (Place Expressions)',
];

// ════════════════════════════════════════════════════════════════════
// 3 COURS ANGLAIS À METTRE À JOUR (style 100% anglais)
// ════════════════════════════════════════════════════════════════════
const ENGLISH_UPDATES = [
  // ─────────────────────────────────────────────────────────────────
  {
    oldTitre: 'Anglais — Toutes les prépositions (A1–A2)',
    newData: {
      titre:       'All English Prepositions (A1–A2)',
      description: 'Master all English prepositions: time, place, movement, cause and fixed phrases. Progressive exercises to use every essential preposition correctly.',
      niveau:      'A2',
      pages: [
        {
          id: 'en-std-prep-p1', type: 'intro',
          title: 'Introduction — All English Prepositions',
          content: `<div style="text-align:center;margin-bottom:16px">
  <span style="background:#c0392b;color:#fff;padding:6px 18px;border-radius:20px;font-size:13px;font-weight:600">🎓 English Grammar</span>
</div>
<h2 style="text-align:center">All English Prepositions</h2>
<p style="text-align:center;color:#555">A complete guide to English prepositions — from beginner to intermediate.</p>
<div style="background:#fff3f3;border-left:4px solid #c0392b;border-radius:6px;padding:14px;margin:16px 0">
  <strong>🎯 Lesson Objectives</strong>
  <ul style="margin:8px 0 0 0">
    <li>Use prepositions of <strong>time</strong>: at, in, on, for, since, during, by, ago</li>
    <li>Use prepositions of <strong>place</strong>: in, at, on, under, above, next to, between</li>
    <li>Use prepositions of <strong>movement</strong>: to, from, into, out of, through, across</li>
    <li>Use prepositions of <strong>manner &amp; cause</strong>: by, with, because of, due to</li>
    <li>Master <strong>fixed verb + preposition</strong> combinations</li>
  </ul>
</div>
<p style="background:#fff3f3;padding:10px;border-radius:6px;text-align:center">
  <strong>In this lesson:</strong> at · in · on · for · since · during · to · from · into · out of · through · across · by · with · because of
</p>`,
        },
        {
          id: 'en-std-prep-p2', type: 'lesson',
          title: 'Prepositions of Time',
          content: `<h3>📖 Time Prepositions</h3>
<table style="width:100%;border-collapse:collapse">
  <thead><tr style="background:#c0392b;color:#fff">
    <th style="padding:8px">Preposition</th><th style="padding:8px">Usage</th><th style="padding:8px">Examples</th>
  </tr></thead>
  <tbody>
    <tr><td style="padding:8px"><strong>AT</strong></td><td style="padding:8px">Exact time, moment of day</td><td style="padding:8px">at 8 o'clock · at noon · at night · at Christmas</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px"><strong>IN</strong></td><td style="padding:8px">Month, season, year, century</td><td style="padding:8px">in July · in summer · in 2020 · in the morning</td></tr>
    <tr><td style="padding:8px"><strong>ON</strong></td><td style="padding:8px">Day, date</td><td style="padding:8px">on Monday · on 1st July · on Monday morning</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px"><strong>FOR</strong></td><td style="padding:8px">Duration (how long)</td><td style="padding:8px">I studied <strong>for</strong> two hours.</td></tr>
    <tr><td style="padding:8px"><strong>SINCE</strong></td><td style="padding:8px">Starting point (since when)</td><td style="padding:8px">I've lived here <strong>since</strong> 2015.</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px"><strong>DURING</strong></td><td style="padding:8px">Throughout a period</td><td style="padding:8px"><strong>During</strong> the summer · during the meeting</td></tr>
    <tr><td style="padding:8px"><strong>BY</strong></td><td style="padding:8px">Deadline (no later than)</td><td style="padding:8px">Finish <strong>by</strong> Friday. · I'll be there by 6 pm.</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px"><strong>AGO</strong></td><td style="padding:8px">Time in the past</td><td style="padding:8px">I arrived two days <strong>ago</strong>.<br/><span style="color:#888;font-style:italic">= Je suis arrivé il y a deux jours.</span></td></tr>
  </tbody>
</table>
<div style="background:#fffbe6;border-left:4px solid #f39c12;padding:10px;border-radius:4px;margin-top:12px">
  💡 <strong>FOR</strong> answers "How long?" — <strong>SINCE</strong> answers "Since when?"<br/>
  <em>I've been here <strong>for</strong> 3 years.</em> / <em>I've been here <strong>since</strong> 2021.</em>
</div>`,
        },
        {
          id: 'en-std-prep-p3', type: 'lesson',
          title: 'Prepositions of Movement',
          content: `<h3>📖 Movement &amp; Direction</h3>
<table style="width:100%;border-collapse:collapse">
  <thead><tr style="background:#c0392b;color:#fff">
    <th style="padding:8px">Preposition</th><th style="padding:8px">Meaning</th><th style="padding:8px">Example</th>
  </tr></thead>
  <tbody>
    <tr><td style="padding:8px"><strong>to</strong></td><td style="padding:8px">towards / destination</td><td style="padding:8px">Go <strong>to</strong> school. / Travel <strong>to</strong> London.<br/><span style="color:#888;font-style:italic">= Aller à l'école. / Voyager à Londres.</span></td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px"><strong>from</strong></td><td style="padding:8px">origin / departure point</td><td style="padding:8px">Come <strong>from</strong> Morocco. / A train <strong>from</strong> Paris.<br/><span style="color:#888;font-style:italic">= Venir du Maroc.</span></td></tr>
    <tr><td style="padding:8px"><strong>into</strong></td><td style="padding:8px">entering a space</td><td style="padding:8px">Walk <strong>into</strong> the room. / Jump <strong>into</strong> the pool.</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px"><strong>out of</strong></td><td style="padding:8px">leaving a space</td><td style="padding:8px">Get <strong>out of</strong> the car. / Take it <strong>out of</strong> the bag.</td></tr>
    <tr><td style="padding:8px"><strong>through</strong></td><td style="padding:8px">passing inside / across</td><td style="padding:8px">Walk <strong>through</strong> the forest. / Drive <strong>through</strong> the tunnel.</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px"><strong>across</strong></td><td style="padding:8px">from one side to the other</td><td style="padding:8px">Swim <strong>across</strong> the river. / Walk <strong>across</strong> the street.</td></tr>
    <tr><td style="padding:8px"><strong>along</strong></td><td style="padding:8px">following a line / path</td><td style="padding:8px">Walk <strong>along</strong> the beach.<br/><span style="color:#888;font-style:italic">= Se promener le long de la plage.</span></td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px"><strong>past</strong></td><td style="padding:8px">going beyond / in front of</td><td style="padding:8px">Go <strong>past</strong> the school, then turn left.</td></tr>
  </tbody>
</table>`,
        },
        {
          id: 'en-std-prep-p4', type: 'lesson',
          title: 'Fixed Verb + Preposition',
          content: `<h3>📖 Fixed Verb + Preposition Combinations</h3>
<p>These combinations must be memorised — the preposition is fixed and cannot be changed.</p>
<table style="width:100%;border-collapse:collapse">
  <thead><tr style="background:#c0392b;color:#fff">
    <th style="padding:8px">Verb + Preposition</th><th style="padding:8px">Meaning</th><th style="padding:8px">Example</th>
  </tr></thead>
  <tbody>
    <tr><td style="padding:8px">listen <strong>to</strong></td><td style="padding:8px">to listen to sth</td><td style="padding:8px">Listen to the music.</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px">look <strong>at</strong></td><td style="padding:8px">to look at sth/sb</td><td style="padding:8px">Look at this photo.</td></tr>
    <tr><td style="padding:8px">wait <strong>for</strong></td><td style="padding:8px">to wait for sb/sth</td><td style="padding:8px">Wait for the bus.</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px">talk <strong>about</strong></td><td style="padding:8px">to talk about sth</td><td style="padding:8px">Talk about the problem.</td></tr>
    <tr><td style="padding:8px">think <strong>about/of</strong></td><td style="padding:8px">to think about sth</td><td style="padding:8px">Think about your future.</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px">depend <strong>on</strong></td><td style="padding:8px">to depend on sth</td><td style="padding:8px">It depends on the weather.</td></tr>
    <tr><td style="padding:8px">agree <strong>with</strong></td><td style="padding:8px">to agree with sb</td><td style="padding:8px">I agree with you.</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px">look <strong>after</strong></td><td style="padding:8px">to take care of sb/sth</td><td style="padding:8px">She looks after her brother.</td></tr>
  </tbody>
</table>`,
        },
        {
          id: 'en-std-prep-p5', type: 'exercises',
          title: 'Practice Exercises',
          content: `<h3>✏️ Practice</h3>
<h4>Choose the correct preposition</h4>
<ol>
  <li>She walked ___ the park every morning. (through / across)</li>
  <li>I travelled ___ bus from Casablanca. (by / with)</li>
  <li>The match was cancelled ___ rain. (because of / due to)</li>
  <li>Can you look ___ my bag while I'm gone? (at / after)</li>
  <li>She jumped ___ the pool. (into / in)</li>
  <li>I have been studying English ___ three years. (for / since)</li>
  <li>The train leaves ___ Monday morning. (in / on)</li>
</ol>
<h4>Build sentences with these elements</h4>
<ol>
  <li>travel / by plane / to London</li>
  <li>a book / about / ancient history</li>
  <li>wait / for / the train / at the station</li>
</ol>
<h4>Correct the mistakes</h4>
<ol>
  <li>I was born <u>in</u> 15th August.</li>
  <li>She listened <u>for</u> the music all evening.</li>
  <li>We have known each other <u>since</u> five years.</li>
</ol>`,
        },
        {
          id: 'en-std-prep-p6', type: 'lesson',
          title: 'Quick Reference Guide',
          content: `<h3>📋 Quick Reference — All Prepositions</h3>
<div style="background:#f8f9fa;border-radius:8px;padding:16px;line-height:2">
  <p><strong>⏰ Time:</strong> <code>at</code> 8h · <code>in</code> July · <code>on</code> Monday · <code>for</code> 2 hours · <code>since</code> 2015 · <code>during</code> the film · <code>by</code> Friday · <code>ago</code></p>
  <p><strong>📍 Place:</strong> <code>in</code> the room · <code>at</code> school · <code>on</code> the table · <code>under</code> · <code>above</code> · <code>next to</code> · <code>between</code> · <code>opposite</code> · <code>behind</code> · <code>in front of</code></p>
  <p><strong>🚶 Movement:</strong> <code>to</code> · <code>from</code> · <code>into</code> · <code>out of</code> · <code>through</code> · <code>across</code> · <code>along</code> · <code>past</code></p>
  <p><strong>🔧 Manner/Cause:</strong> <code>by</code> bus · <code>with</code> a pen · <code>without</code> help · <code>because of</code> · <code>due to</code></p>
  <p><strong>🔗 Fixed:</strong> listen <code>to</code> · look <code>at</code> · wait <code>for</code> · talk <code>about</code> · depend <code>on</code> · agree <code>with</code></p>
</div>`,
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────
  {
    oldTitre: 'Anglais — Lettre de Londres (Reading & Writing)',
    newData: {
      titre:       'A Letter from London (Reading & Writing)',
      description: 'Read an authentic letter written from London. Build your reading comprehension, discover London vocabulary, and learn to write a personal letter in English.',
      niveau:      'A2',
      pages: [
        {
          id: 'en-std-london-p1', type: 'intro',
          title: 'Introduction — A Letter from London',
          content: `<div style="text-align:center;margin-bottom:16px">
  <span style="background:#c0392b;color:#fff;padding:6px 18px;border-radius:20px;font-size:13px;font-weight:600">📖 Reading &amp; Writing</span>
</div>
<h2 style="text-align:center">A Letter from London</h2>
<p style="text-align:center;color:#555">Read, understand, and write a personal letter in English.</p>
<div style="background:#fff3f3;border-left:4px solid #c0392b;border-radius:6px;padding:14px;margin:16px 0">
  <strong>🎯 Lesson Objectives</strong>
  <ul style="margin:8px 0 0 0">
    <li>Read and understand an authentic English letter</li>
    <li>Learn vocabulary related to London and city life</li>
    <li>Understand formal and informal letter structure</li>
    <li>Write your own personal letter in English (80–100 words)</li>
  </ul>
</div>
<p style="background:#fff3f3;padding:10px;border-radius:6px;text-align:center">
  <strong>In this lesson:</strong> reading comprehension · letter structure · London vocabulary · writing practice
</p>`,
        },
        {
          id: 'en-std-london-p2', type: 'lesson',
          title: 'Text — A Letter from London',
          content: `<h3>📖 Read the letter</h3>
<div style="background:#f8f9fa;border:1px solid #dee2e6;border-radius:8px;padding:24px;font-family:Georgia,serif;line-height:1.9">
  <p style="text-align:right;color:#666;font-size:14px">15 Baker Street,<br/>London, W1U 6RT<br/>10th October 2024</p>
  <p><strong>Dear Yasmine,</strong></p>
  <p>How are you? I hope you and your family are doing well. I am writing to you from my new flat in London. I arrived here two weeks ago and I am slowly getting used to life in this amazing city.</p>
  <p>London is a very big and busy city. The streets are full of people from all over the world. I love the red double-decker buses and the Underground — that's what they call the metro here! My flat is in the centre, near Hyde Park, which is a huge and beautiful park. I go there every morning for a walk.</p>
  <p>The weather is quite cold and rainy, very different from home! But the city is incredible — there are museums, theatres, markets and parks everywhere. Last weekend, I visited the British Museum and Buckingham Palace. It was fantastic!</p>
  <p>I miss you and our friends very much. I hope you can visit me soon. Please write back when you have time.</p>
  <p><strong>Best wishes,<br/>Sophia</strong></p>
</div>`,
        },
        {
          id: 'en-std-london-p3', type: 'lesson',
          title: 'Vocabulary — Key Words',
          content: `<h3>📚 Key Vocabulary</h3>
<table style="width:100%;border-collapse:collapse">
  <thead><tr style="background:#c0392b;color:#fff">
    <th style="padding:8px">English</th><th style="padding:8px">French translation</th>
  </tr></thead>
  <tbody>
    <tr><td style="padding:8px"><strong>flat</strong></td><td style="padding:8px;color:#666;font-style:italic">appartement</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px"><strong>getting used to</strong></td><td style="padding:8px;color:#666;font-style:italic">s'habituer à</td></tr>
    <tr><td style="padding:8px"><strong>double-decker bus</strong></td><td style="padding:8px;color:#666;font-style:italic">bus à deux étages</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px"><strong>the Underground (the Tube)</strong></td><td style="padding:8px;color:#666;font-style:italic">le métro londonien</td></tr>
    <tr><td style="padding:8px"><strong>huge</strong></td><td style="padding:8px;color:#666;font-style:italic">immense, gigantesque</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px"><strong>incredible</strong></td><td style="padding:8px;color:#666;font-style:italic">incroyable</td></tr>
    <tr><td style="padding:8px"><strong>I miss you</strong></td><td style="padding:8px;color:#666;font-style:italic">Tu me manques</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px"><strong>Write back</strong></td><td style="padding:8px;color:#666;font-style:italic">Réponds-moi</td></tr>
    <tr><td style="padding:8px"><strong>Best wishes</strong></td><td style="padding:8px;color:#666;font-style:italic">Cordialement / Amitiés</td></tr>
  </tbody>
</table>
<h4 style="margin-top:16px">Letter Phrases</h4>
<table style="width:100%;border-collapse:collapse">
  <thead><tr style="background:#c0392b;color:#fff">
    <th style="padding:8px">Opening</th><th style="padding:8px">Closing</th>
  </tr></thead>
  <tbody>
    <tr><td style="padding:8px">Dear [Name],</td><td style="padding:8px">Best wishes / Kind regards</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px">How are you?</td><td style="padding:8px">Yours sincerely / Love</td></tr>
    <tr><td style="padding:8px">I hope you are well.</td><td style="padding:8px">Looking forward to hearing from you.</td></tr>
  </tbody>
</table>`,
        },
        {
          id: 'en-std-london-p4', type: 'exercises',
          title: 'Reading Comprehension',
          content: `<h3>✏️ Comprehension — True or False?</h3>
<ol>
  <li>Sophia arrived in London a month ago. (T / F)</li>
  <li>Her flat is near Hyde Park. (T / F)</li>
  <li>She goes to the park every morning. (T / F)</li>
  <li>The weather in London is warm and sunny. (T / F)</li>
  <li>She visited the British Museum last weekend. (T / F)</li>
</ol>
<h4>Open Questions</h4>
<ol>
  <li>What does Sophia call the London metro?</li>
  <li>What two famous places did she visit last weekend?</li>
  <li>What does she miss?</li>
  <li>How long has she been in London?</li>
</ol>
<h4>Vocabulary in Context</h4>
<p>Find a word in the letter that means:</p>
<ol>
  <li>Very large _______</li>
  <li>Apartment _______</li>
  <li>Amazing, extraordinary _______</li>
</ol>`,
        },
        {
          id: 'en-std-london-p5', type: 'exercises',
          title: 'Writing — Your Turn!',
          content: `<h3>✏️ Write Your Own Letter!</h3>
<p>Write a letter of <strong>80–100 words</strong> to a friend about a city you live in or have visited. Use Sophia's letter as a model:</p>
<div style="background:#f8f9fa;border-radius:8px;padding:16px">
  <p>✅ <strong>Include:</strong></p>
  <ul>
    <li>How long have you been there?</li>
    <li>Describe 2–3 things about the city</li>
    <li>What have you done / seen?</li>
    <li>What do you miss from home?</li>
    <li>Use a proper closing phrase</li>
  </ul>
</div>
<div style="background:#fffbe6;border-left:4px solid #f39c12;padding:10px;border-radius:4px;margin-top:12px">
  💡 Start with: <em>"Dear [Name], How are you? I am writing from..."</em>
</div>`,
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────
  {
    oldTitre: 'Anglais — Texte : Voyage et aventure (Travel & Adventure)',
    newData: {
      titre:       'Travel & Adventure (Reading & Speaking)',
      description: 'Read an English text about a gap year trip. Build travel vocabulary, practise the past simple tense, and write about your own travel experience.',
      niveau:      'A2',
      pages: [
        {
          id: 'en-std-travel-p1', type: 'intro',
          title: 'Introduction — Travel & Adventure',
          content: `<div style="text-align:center;margin-bottom:16px">
  <span style="background:#c0392b;color:#fff;padding:6px 18px;border-radius:20px;font-size:13px;font-weight:600">✈️ Reading &amp; Speaking</span>
</div>
<h2 style="text-align:center">Travel &amp; Adventure</h2>
<p style="text-align:center;color:#555">Read about a real trip and talk about your own travel experiences.</p>
<div style="background:#fff3f3;border-left:4px solid #c0392b;border-radius:6px;padding:14px;margin:16px 0">
  <strong>🎯 Lesson Objectives</strong>
  <ul style="margin:8px 0 0 0">
    <li>Read and understand an English travel story</li>
    <li>Learn vocabulary for travel, transport, and destinations</li>
    <li>Use the past simple tense to talk about past trips</li>
    <li>Express opinions about travel experiences</li>
  </ul>
</div>
<p style="background:#fff3f3;padding:10px;border-radius:6px;text-align:center">
  <strong>In this lesson:</strong> reading comprehension · travel vocabulary · past simple · speaking &amp; writing practice
</p>`,
        },
        {
          id: 'en-std-travel-p2', type: 'lesson',
          title: 'Text — My Gap Year Adventure',
          content: `<h3>📖 Read the text</h3>
<div style="background:#f8f9fa;border:1px solid #dee2e6;border-radius:8px;padding:24px;font-family:Georgia,serif;line-height:1.9">
  <h4>My Gap Year Adventure — by James</h4>
  <p>After finishing school, I decided to take a gap year and travel around the world. It was the best decision of my life!</p>
  <p>My journey started in Morocco. I flew from London to Marrakech and spent two weeks exploring the medina, the souks, and the beautiful desert. The people were incredibly friendly and the food was delicious.</p>
  <p>From Morocco, I took a ferry to Spain, then travelled by train through France and Italy. In Rome, I visited the Colosseum and ate the most amazing pasta. In Paris, I went up the Eiffel Tower at sunset — breathtaking!</p>
  <p>My favourite part of the trip was Morocco. The colours, the smells, the music… everything was magical. I stayed in a traditional riad and rode a camel in the Sahara Desert!</p>
  <p>Travelling taught me to be independent, open-minded, and grateful. I met people from every corner of the world and learned something new every single day. I would recommend a gap year to everyone!</p>
</div>`,
        },
        {
          id: 'en-std-travel-p3', type: 'lesson',
          title: 'Vocabulary — Travel Words',
          content: `<h3>📚 Travel Vocabulary</h3>
<table style="width:100%;border-collapse:collapse">
  <thead><tr style="background:#c0392b;color:#fff">
    <th style="padding:8px">English</th><th style="padding:8px">French translation</th>
  </tr></thead>
  <tbody>
    <tr><td style="padding:8px"><strong>gap year</strong></td><td style="padding:8px;color:#666;font-style:italic">année de césure</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px"><strong>journey</strong></td><td style="padding:8px;color:#666;font-style:italic">voyage, trajet</td></tr>
    <tr><td style="padding:8px"><strong>to explore</strong></td><td style="padding:8px;color:#666;font-style:italic">explorer</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px"><strong>ferry</strong></td><td style="padding:8px;color:#666;font-style:italic">ferry, bac</td></tr>
    <tr><td style="padding:8px"><strong>breathtaking</strong></td><td style="padding:8px;color:#666;font-style:italic">à couper le souffle</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px"><strong>riad</strong></td><td style="padding:8px;color:#666;font-style:italic">riad (maison traditionnelle marocaine)</td></tr>
    <tr><td style="padding:8px"><strong>independent</strong></td><td style="padding:8px;color:#666;font-style:italic">indépendant(e)</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px"><strong>open-minded</strong></td><td style="padding:8px;color:#666;font-style:italic">ouvert(e) d'esprit</td></tr>
    <tr><td style="padding:8px"><strong>grateful</strong></td><td style="padding:8px;color:#666;font-style:italic">reconnaissant(e)</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px"><strong>to recommend</strong></td><td style="padding:8px;color:#666;font-style:italic">recommander</td></tr>
  </tbody>
</table>
<h4 style="margin-top:16px">Past Simple — Key verbs from the text</h4>
<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">
  <span style="background:#fff3f3;border:1px solid #c0392b;border-radius:4px;padding:4px 10px;font-size:13px">flew ← fly</span>
  <span style="background:#fff3f3;border:1px solid #c0392b;border-radius:4px;padding:4px 10px;font-size:13px">spent ← spend</span>
  <span style="background:#fff3f3;border:1px solid #c0392b;border-radius:4px;padding:4px 10px;font-size:13px">took ← take</span>
  <span style="background:#fff3f3;border:1px solid #c0392b;border-radius:4px;padding:4px 10px;font-size:13px">went ← go</span>
  <span style="background:#fff3f3;border:1px solid #c0392b;border-radius:4px;padding:4px 10px;font-size:13px">visited ← visit</span>
  <span style="background:#fff3f3;border:1px solid #c0392b;border-radius:4px;padding:4px 10px;font-size:13px">ate ← eat</span>
  <span style="background:#fff3f3;border:1px solid #c0392b;border-radius:4px;padding:4px 10px;font-size:13px">stayed ← stay</span>
  <span style="background:#fff3f3;border:1px solid #c0392b;border-radius:4px;padding:4px 10px;font-size:13px">rode ← ride</span>
  <span style="background:#fff3f3;border:1px solid #c0392b;border-radius:4px;padding:4px 10px;font-size:13px">met ← meet</span>
  <span style="background:#fff3f3;border:1px solid #c0392b;border-radius:4px;padding:4px 10px;font-size:13px">learned ← learn</span>
</div>`,
        },
        {
          id: 'en-std-travel-p4', type: 'exercises',
          title: 'Reading Comprehension',
          content: `<h3>✏️ Comprehension</h3>
<h4>Answer the questions</h4>
<ol>
  <li>Where did James start his journey?</li>
  <li>How did he travel from Morocco to Spain?</li>
  <li>What was his favourite part of the trip? Why?</li>
  <li>What two things did he do in Morocco?</li>
  <li>What did travelling teach him?</li>
</ol>
<h4>Vocabulary in Context</h4>
<p>Replace the underlined words with a synonym from the text:</p>
<ol>
  <li>The view from the top was <u>amazing</u>.</li>
  <li>He decided to <u>discover</u> the old city.</li>
  <li>The experience made him more <u>thankful</u>.</li>
</ol>
<h4>True or False?</h4>
<ol>
  <li>James travelled from London to Morocco by train. (T / F)</li>
  <li>His favourite destination was Italy. (T / F)</li>
  <li>He stayed in a traditional Moroccan house. (T / F)</li>
</ol>`,
        },
        {
          id: 'en-std-travel-p5', type: 'exercises',
          title: 'Writing — My Journey',
          content: `<h3>✏️ Write About Your Journey!</h3>
<p>Write a paragraph of <strong>80–100 words</strong> about a real or imaginary trip. Include:</p>
<div style="background:#f8f9fa;border-radius:8px;padding:16px">
  <ul>
    <li>Where did you go?</li>
    <li>How did you travel?</li>
    <li>What did you see / do?</li>
    <li>What impressed you the most?</li>
    <li>Would you recommend this destination?</li>
  </ul>
</div>
<div style="background:#fffbe6;border-left:4px solid #f39c12;padding:10px;border-radius:4px;margin-top:12px">
  💡 Use the <strong>past simple</strong>: went, saw, ate, visited, took, stayed…<br/>
  <em>Example: "Last summer, I went to... I visited... The food was..."</em>
</div>`,
        },
      ],
    },
  },
];

// ════════════════════════════════════════════════════════════════════
// 5 COURS ARABES — mise à jour titres propres + contenu arabe amélioré
// ════════════════════════════════════════════════════════════════════
const ARABIC_UPDATES = [
  {
    oldTitre: 'Arabe — Exprimer le temps (التعبير عن الزمن)',
    newData: {
      titre:       'التعبير عن الزمن — Expressing Time in Arabic',
      description: 'Learn to talk about time in Arabic: days, months, temporal adverbs and prepositions. With transliteration and French explanations.',
      pages: null, // Keep existing pages, only update titre/description
    },
  },
  {
    oldTitre: 'Arabe — Exprimer un lieu (التعبير عن المكان)',
    newData: {
      titre:       'التعبير عن المكان — Expressing Place in Arabic',
      description: 'Master place prepositions in Arabic: في، على، تحت، فوق، أمام، خلف، بين. Examples and exercises with transliteration.',
      pages: null,
    },
  },
  {
    oldTitre: 'Arabe — Toutes les prépositions (حروف الجر)',
    newData: {
      titre:       'حروف الجر — Arabic Prepositions (A1–A2)',
      description: 'Complete guide to Arabic prepositions (حروف الجر): time, place, movement and cause. Transliteration and French explanations included.',
      pages: null,
    },
  },
  {
    oldTitre: 'Arabe — Lettre de Londres (رسالة من لندن)',
    newData: {
      titre:       'رسالة من لندن — A Letter from London (Arabic)',
      description: 'Read and write a personal letter in Arabic. Discover London vocabulary in Arabic, letter structure, and write your own 80-word letter.',
      pages: null,
    },
  },
  {
    oldTitre: 'Arabe — Texte : السفر والمغامرة',
    newData: {
      titre:       'السفر والمغامرة — Travel & Adventure (Arabic)',
      description: 'Read an Arabic travel text. Learn travel vocabulary in Arabic, practise the past tense (الفعل الماضي), and write about your own trip.',
      pages: null,
    },
  },
];

// ════════════════════════════════════════════════════════════════════
async function main() {
  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);

  console.log('🔐 Authenticating...');
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log('✅ Authenticated\n');

  // ── STEP 1: Delete duplicate English courses ──────────────────────
  console.log('═══════════════════════════════════════════');
  console.log('STEP 1 — Deleting duplicate EN courses');
  console.log('═══════════════════════════════════════════');

  for (const titre of TITLES_TO_DELETE) {
    try {
      const res = await pb.collection('courses').getList(1, 50, {
        filter: `titre = "${titre}"`,
      });
      if (res.items.length === 0) {
        console.log(`  ℹ️  Not found (already deleted?): ${titre}`);
      } else {
        for (const item of res.items) {
          await pb.collection('courses').delete(item.id);
          console.log(`  🗑️  Deleted: ${titre} (${item.id})`);
        }
      }
    } catch (err) {
      const detail = err?.data ? JSON.stringify(err.data) : err.message;
      console.error(`  ❌ Error deleting "${titre}": ${detail}`);
    }
  }

  // ── STEP 2: Update 3 English standard courses ─────────────────────
  console.log('\n═══════════════════════════════════════════');
  console.log('STEP 2 — Updating 3 English standard courses');
  console.log('═══════════════════════════════════════════');

  for (const item of ENGLISH_UPDATES) {
    const { oldTitre, newData } = item;
    try {
      const res = await pb.collection('courses').getList(1, 10, {
        filter: `titre = "${oldTitre}"`,
      });
      if (res.items.length === 0) {
        console.log(`  ℹ️  Not found: ${oldTitre}`);
        continue;
      }
      const record = res.items[0];
      const updatePayload = {
        titre:       newData.titre,
        description: newData.description,
        niveau:      newData.niveau,
      };
      if (newData.pages) {
        updatePayload.pages = JSON.stringify(newData.pages);
      }
      await pb.collection('courses').update(record.id, updatePayload);
      console.log(`  ✅ Updated: "${oldTitre}"\n      → "${newData.titre}"`);
    } catch (err) {
      const detail = err?.data ? JSON.stringify(err.data) : err.message;
      console.error(`  ❌ Error updating "${oldTitre}": ${detail}`);
    }
  }

  // ── STEP 3: Update Arabic course titles ──────────────────────────
  console.log('\n═══════════════════════════════════════════');
  console.log('STEP 3 — Updating Arabic course titles');
  console.log('═══════════════════════════════════════════');

  for (const item of ARABIC_UPDATES) {
    const { oldTitre, newData } = item;
    try {
      const res = await pb.collection('courses').getList(1, 10, {
        filter: `titre = "${oldTitre}"`,
      });
      if (res.items.length === 0) {
        console.log(`  ℹ️  Not found: ${oldTitre}`);
        continue;
      }
      const record = res.items[0];
      await pb.collection('courses').update(record.id, {
        titre:       newData.titre,
        description: newData.description,
      });
      console.log(`  ✅ Updated: "${oldTitre}"\n      → "${newData.titre}"`);
    } catch (err) {
      const detail = err?.data ? JSON.stringify(err.data) : err.message;
      console.error(`  ❌ Error updating "${oldTitre}": ${detail}`);
    }
  }

  console.log('\n════════════════════════════════════════════');
  console.log('✅ All done!');
  console.log('════════════════════════════════════════════');
}

main().catch(err => {
  const detail = err?.data ? JSON.stringify(err.data) : err.message;
  console.error('Fatal error:', detail);
  process.exit(1);
});
