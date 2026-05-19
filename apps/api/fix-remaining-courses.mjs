/**
 * fix-remaining-courses.mjs
 * ════════════════════════════════════════════════════════════════════
 * 1. Met à jour les 2 cours EN bloqués (titres mixtes français/anglais
 *    → 100% anglais, contenu propre)
 * 2. Crée les 3 cours arabes manquants
 *
 * Usage :  cd apps/api && node fix-remaining-courses.mjs
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
// STEP 1 — Update 2 blocked EN courses (can't delete, update content)
// ════════════════════════════════════════════════════════════════════
const EN_BLOCKED_UPDATES = [
  {
    oldTitre: 'Anglais — Exprimer le temps (Time Expressions)',
    newData: {
      titre:       'Expressing Time in English — Grammar & Exercises',
      description: 'Master English time prepositions: at, in, on, for, since, during, before, after, by, ago. 6 illustrated lessons with bilingual examples and exercises.',
      niveau:      'A1',
      pages: [
        {
          id: 'en-time2-p1', type: 'intro',
          title: 'Introduction — Expressing Time',
          content: `<div style="text-align:center;margin-bottom:16px">
  <span style="background:#c0392b;color:#fff;padding:6px 18px;border-radius:20px;font-size:13px;font-weight:600">⏰ English Grammar</span>
</div>
<h2 style="text-align:center">Expressing Time in English</h2>
<p style="text-align:center;color:#555">Learn to talk about time using the right preposition every time.</p>
<div style="background:#fff3f3;border-left:4px solid #c0392b;border-radius:6px;padding:14px;margin:16px 0">
  <strong>🎯 Lesson Objectives</strong>
  <ul style="margin:8px 0 0 0">
    <li>Use <strong>AT, IN, ON</strong> correctly for times, months, and days</li>
    <li>Distinguish <strong>FOR</strong> (duration) from <strong>SINCE</strong> (starting point)</li>
    <li>Use <strong>DURING, BEFORE, AFTER, BY, AGO</strong> accurately</li>
    <li>Avoid the most common time preposition mistakes</li>
  </ul>
</div>
<p style="background:#fff3f3;padding:10px;border-radius:6px;text-align:center">
  <strong>In this lesson:</strong> at · in · on · for · since · during · before · after · by · ago
</p>`,
        },
        {
          id: 'en-time2-p2', type: 'lesson',
          title: 'AT — IN — ON',
          content: `<h3>📖 The three main time prepositions</h3>
<table style="width:100%;border-collapse:collapse">
  <thead><tr style="background:#c0392b;color:#fff">
    <th style="padding:8px">Preposition</th><th style="padding:8px">When to use it</th><th style="padding:8px">Examples</th>
  </tr></thead>
  <tbody>
    <tr>
      <td style="padding:10px"><span style="background:#c0392b;color:#fff;padding:3px 10px;border-radius:12px;font-weight:bold">AT</span></td>
      <td style="padding:10px">Exact time · moment of day · public holidays</td>
      <td style="padding:10px">at <strong>8 o'clock</strong> · at <strong>noon</strong> · at <strong>midnight</strong> · at <strong>Christmas</strong><br/><span style="color:#888;font-style:italic">= à 8h · à midi · à minuit · à Noël</span></td>
    </tr>
    <tr style="background:#f9f9f9">
      <td style="padding:10px"><span style="background:#c0392b;color:#fff;padding:3px 10px;border-radius:12px;font-weight:bold">IN</span></td>
      <td style="padding:10px">Month · season · year · century · part of day</td>
      <td style="padding:10px">in <strong>July</strong> · in <strong>summer</strong> · in <strong>2020</strong> · in the <strong>morning</strong><br/><span style="color:#888;font-style:italic">= en juillet · en été · en 2020 · le matin</span></td>
    </tr>
    <tr>
      <td style="padding:10px"><span style="background:#c0392b;color:#fff;padding:3px 10px;border-radius:12px;font-weight:bold">ON</span></td>
      <td style="padding:10px">Day of the week · specific date</td>
      <td style="padding:10px">on <strong>Monday</strong> · on <strong>1st July</strong> · on <strong>Monday morning</strong><br/><span style="color:#888;font-style:italic">= lundi · le 1er juillet · lundi matin</span></td>
    </tr>
  </tbody>
</table>
<div style="background:#fffbe6;border-left:4px solid #f39c12;padding:10px;border-radius:4px;margin-top:12px">
  ⚠️ <strong>No preposition</strong> with: last / next / this / every<br/>
  <em>last week · next Monday · this morning · every day</em>
</div>`,
        },
        {
          id: 'en-time2-p3', type: 'lesson',
          title: 'FOR — SINCE — DURING',
          content: `<h3>📖 Talking about duration and periods</h3>
<table style="width:100%;border-collapse:collapse">
  <thead><tr style="background:#c0392b;color:#fff">
    <th style="padding:8px">Preposition</th><th style="padding:8px">Usage</th><th style="padding:8px">Examples</th>
  </tr></thead>
  <tbody>
    <tr>
      <td style="padding:10px"><span style="background:#c0392b;color:#fff;padding:3px 10px;border-radius:12px;font-weight:bold">FOR</span></td>
      <td style="padding:10px">Duration — <em>how long</em></td>
      <td style="padding:10px">I studied <strong>for</strong> two hours.<br/>She lived here <strong>for</strong> 5 years.<br/><span style="color:#888;font-style:italic">= pendant deux heures / pendant 5 ans</span></td>
    </tr>
    <tr style="background:#f9f9f9">
      <td style="padding:10px"><span style="background:#c0392b;color:#fff;padding:3px 10px;border-radius:12px;font-weight:bold">SINCE</span></td>
      <td style="padding:10px">Starting point — <em>since when</em></td>
      <td style="padding:10px">I have lived here <strong>since</strong> 2015.<br/>It has been raining <strong>since</strong> Monday.<br/><span style="color:#888;font-style:italic">= depuis 2015 / depuis lundi</span></td>
    </tr>
    <tr>
      <td style="padding:10px"><span style="background:#c0392b;color:#fff;padding:3px 10px;border-radius:12px;font-weight:bold">DURING</span></td>
      <td style="padding:10px">Throughout a period</td>
      <td style="padding:10px"><strong>During</strong> the summer · <strong>during</strong> the meeting<br/><span style="color:#888;font-style:italic">= pendant l'été / pendant la réunion</span></td>
    </tr>
  </tbody>
</table>
<div style="background:#fffbe6;border-left:4px solid #f39c12;padding:10px;border-radius:4px;margin-top:12px">
  💡 <strong>FOR</strong> answers "How long?" → <em>for 3 years</em><br/>
  💡 <strong>SINCE</strong> answers "Since when?" → <em>since 2020</em>
</div>`,
        },
        {
          id: 'en-time2-p4', type: 'lesson',
          title: 'BEFORE — AFTER — BY — AGO',
          content: `<h3>📖 Placing events in time</h3>
<table style="width:100%;border-collapse:collapse">
  <thead><tr style="background:#c0392b;color:#fff">
    <th style="padding:8px">Word</th><th style="padding:8px">Meaning</th><th style="padding:8px">Example</th>
  </tr></thead>
  <tbody>
    <tr>
      <td style="padding:10px"><strong>BEFORE</strong></td>
      <td style="padding:10px">earlier than</td>
      <td style="padding:10px">Finish <strong>before</strong> Friday. / <strong>Before</strong> going out, check the weather.<br/><span style="color:#888;font-style:italic">= avant vendredi / avant de sortir</span></td>
    </tr>
    <tr style="background:#f9f9f9">
      <td style="padding:10px"><strong>AFTER</strong></td>
      <td style="padding:10px">later than</td>
      <td style="padding:10px"><strong>After</strong> lunch, we went for a walk.<br/><span style="color:#888;font-style:italic">= après le déjeuner</span></td>
    </tr>
    <tr>
      <td style="padding:10px"><strong>BY</strong></td>
      <td style="padding:10px">no later than (deadline)</td>
      <td style="padding:10px">I'll be there <strong>by</strong> 6 pm. / Submit it <strong>by</strong> Monday.<br/><span style="color:#888;font-style:italic">= au plus tard à 18h / d'ici lundi</span></td>
    </tr>
    <tr style="background:#f9f9f9">
      <td style="padding:10px"><strong>AGO</strong></td>
      <td style="padding:10px">in the past (from now)</td>
      <td style="padding:10px">I arrived two days <strong>ago</strong>. / He left an hour <strong>ago</strong>.<br/><span style="color:#888;font-style:italic">= il y a deux jours / il y a une heure</span></td>
    </tr>
  </tbody>
</table>`,
        },
        {
          id: 'en-time2-p5', type: 'exercises',
          title: 'Practice Exercises',
          content: `<h3>✏️ Practice</h3>
<h4>Choose: AT · IN · ON</h4>
<ol>
  <li>I was born ___ 15th August.</li>
  <li>The meeting starts ___ 9 o'clock.</li>
  <li>She was born ___ 1995.</li>
  <li>We go skiing ___ winter.</li>
  <li>Let's meet ___ Saturday morning.</li>
  <li>The train leaves ___ midnight.</li>
</ol>
<h4>FOR or SINCE?</h4>
<ol>
  <li>I have known her ___ ten years.</li>
  <li>He has been sick ___ Monday.</li>
  <li>They waited ___ two hours.</li>
  <li>We have lived here ___ 2010.</li>
</ol>
<h4>Translate these sentences</h4>
<ol>
  <li>He arrived three days ago.</li>
  <li>Finish before Monday.</li>
  <li>I'll call you by 5 pm.</li>
  <li>During the holidays, I read a lot.</li>
</ol>`,
        },
        {
          id: 'en-time2-p6', type: 'lesson',
          title: 'Quick Reference — Time Prepositions',
          content: `<h3>📋 Quick Reference Card</h3>
<div style="background:#f8f9fa;border-radius:8px;padding:16px;line-height:2.2">
  <p><span style="background:#c0392b;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">AT</span> &nbsp;at 8h · at noon · at night · at Christmas · at the weekend</p>
  <p><span style="background:#c0392b;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">IN</span> &nbsp;in July · in 2024 · in summer · in the morning · in the 20th century</p>
  <p><span style="background:#c0392b;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">ON</span> &nbsp;on Monday · on 1st July · on Monday morning</p>
  <p><span style="background:#c0392b;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">FOR</span> &nbsp;for 2 hours / years / days <span style="color:#888;font-size:12px">(duration)</span></p>
  <p><span style="background:#c0392b;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">SINCE</span> &nbsp;since Monday / 2015 / yesterday <span style="color:#888;font-size:12px">(starting point)</span></p>
  <p><span style="background:#c0392b;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">DURING</span> &nbsp;during the film / meeting / holidays</p>
  <p><span style="background:#c0392b;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">BY</span> &nbsp;by Friday = no later than Friday</p>
  <p><span style="background:#c0392b;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">AGO</span> &nbsp;2 days ago = il y a 2 jours</p>
</div>`,
        },
      ],
    },
  },

  {
    oldTitre: 'Anglais — Exprimer un lieu (Place Expressions)',
    newData: {
      titre:       'Expressing a Place in English — Grammar & Exercises',
      description: 'Master English place prepositions: in, at, on, under, above, in front of, behind, between, around. 6 lessons with examples and practical exercises.',
      niveau:      'A1',
      pages: [
        {
          id: 'en-place2-p1', type: 'intro',
          title: 'Introduction — Expressing a Place',
          content: `<div style="text-align:center;margin-bottom:16px">
  <span style="background:#c0392b;color:#fff;padding:6px 18px;border-radius:20px;font-size:13px;font-weight:600">📍 English Grammar</span>
</div>
<h2 style="text-align:center">Expressing a Place in English</h2>
<p style="text-align:center;color:#555">Place prepositions describe <em>where</em> someone or something is.</p>
<div style="background:#fff3f3;border-left:4px solid #c0392b;border-radius:6px;padding:14px;margin:16px 0">
  <strong>🎯 Lesson Objectives</strong>
  <ul style="margin:8px 0 0 0">
    <li>Use <strong>IN, AT, ON</strong> correctly for locations</li>
    <li>Use <strong>UNDER, ABOVE, OVER, BELOW</strong> for vertical position</li>
    <li>Use <strong>NEXT TO, BETWEEN, OPPOSITE, BEHIND, IN FRONT OF</strong></li>
    <li>Describe the position of objects and people in a scene</li>
  </ul>
</div>
<p style="background:#fff3f3;padding:10px;border-radius:6px;text-align:center">
  <strong>In this lesson:</strong> in · at · on · under · above · in front of · behind · next to · between · around · opposite · far from
</p>`,
        },
        {
          id: 'en-place2-p2', type: 'lesson',
          title: 'IN — AT — ON (place)',
          content: `<h3>📖 The three core place prepositions</h3>
<table style="width:100%;border-collapse:collapse">
  <thead><tr style="background:#c0392b;color:#fff">
    <th style="padding:8px">Preposition</th><th style="padding:8px">When to use it</th><th style="padding:8px">Examples</th>
  </tr></thead>
  <tbody>
    <tr>
      <td style="padding:10px"><span style="background:#c0392b;color:#fff;padding:3px 10px;border-radius:12px;font-weight:bold">IN</span></td>
      <td style="padding:10px">Inside an enclosed space · inside a city or country</td>
      <td style="padding:10px"><strong>in</strong> the room · <strong>in</strong> London · <strong>in</strong> Morocco · <strong>in</strong> the car<br/><span style="color:#888;font-style:italic">= dans la pièce · à Londres · au Maroc · dans la voiture</span></td>
    </tr>
    <tr style="background:#f9f9f9">
      <td style="padding:10px"><span style="background:#c0392b;color:#fff;padding:3px 10px;border-radius:12px;font-weight:bold">AT</span></td>
      <td style="padding:10px">Specific point · functional place</td>
      <td style="padding:10px"><strong>at</strong> the door · <strong>at</strong> school · <strong>at</strong> work · <strong>at</strong> home · <strong>at</strong> the station<br/><span style="color:#888;font-style:italic">= à la porte · à l'école · au travail · à la maison</span></td>
    </tr>
    <tr>
      <td style="padding:10px"><span style="background:#c0392b;color:#fff;padding:3px 10px;border-radius:12px;font-weight:bold">ON</span></td>
      <td style="padding:10px">On a surface · on a floor · on a street</td>
      <td style="padding:10px"><strong>on</strong> the table · <strong>on</strong> the wall · <strong>on</strong> the floor · <strong>on</strong> the road<br/><span style="color:#888;font-style:italic">= sur la table · sur le mur · sur le sol · sur la route</span></td>
    </tr>
  </tbody>
</table>`,
        },
        {
          id: 'en-place2-p3', type: 'lesson',
          title: 'UNDER — ABOVE — OVER — BELOW',
          content: `<h3>📖 Vertical position</h3>
<table style="width:100%;border-collapse:collapse">
  <thead><tr style="background:#c0392b;color:#fff">
    <th style="padding:8px">Word</th><th style="padding:8px">Meaning</th><th style="padding:8px">Example</th>
  </tr></thead>
  <tbody>
    <tr>
      <td style="padding:8px"><strong>under</strong></td>
      <td style="padding:8px">below, beneath</td>
      <td style="padding:8px">The cat is <strong>under</strong> the table.<br/><span style="color:#888;font-style:italic">= sous la table</span></td>
    </tr>
    <tr style="background:#f9f9f9">
      <td style="padding:8px"><strong>above</strong></td>
      <td style="padding:8px">higher than (no contact)</td>
      <td style="padding:8px">The lamp is <strong>above</strong> the desk.<br/><span style="color:#888;font-style:italic">= au-dessus du bureau</span></td>
    </tr>
    <tr>
      <td style="padding:8px"><strong>over</strong></td>
      <td style="padding:8px">above + covering / movement</td>
      <td style="padding:8px">Jump <strong>over</strong> the fence. / A bridge <strong>over</strong> the river.<br/><span style="color:#888;font-style:italic">= par-dessus la clôture</span></td>
    </tr>
    <tr style="background:#f9f9f9">
      <td style="padding:8px"><strong>below</strong></td>
      <td style="padding:8px">lower than (level)</td>
      <td style="padding:8px">The temperature is <strong>below</strong> zero.<br/><span style="color:#888;font-style:italic">= en dessous de zéro</span></td>
    </tr>
  </tbody>
</table>`,
        },
        {
          id: 'en-place2-p4', type: 'lesson',
          title: 'NEXT TO — BETWEEN — OPPOSITE',
          content: `<h3>📖 Relative position</h3>
<table style="width:100%;border-collapse:collapse">
  <thead><tr style="background:#c0392b;color:#fff">
    <th style="padding:8px">Word</th><th style="padding:8px">Meaning</th><th style="padding:8px">Example</th>
  </tr></thead>
  <tbody>
    <tr>
      <td style="padding:8px"><strong>next to / beside</strong></td>
      <td style="padding:8px">at the side of</td>
      <td style="padding:8px">The bank is <strong>next to</strong> the pharmacy.<br/><span style="color:#888;font-style:italic">= à côté de la pharmacie</span></td>
    </tr>
    <tr style="background:#f9f9f9">
      <td style="padding:8px"><strong>in front of</strong></td>
      <td style="padding:8px">facing, before</td>
      <td style="padding:8px">There's a garden <strong>in front of</strong> the house.<br/><span style="color:#888;font-style:italic">= devant la maison</span></td>
    </tr>
    <tr>
      <td style="padding:8px"><strong>behind</strong></td>
      <td style="padding:8px">at the back of</td>
      <td style="padding:8px">The car is parked <strong>behind</strong> the building.<br/><span style="color:#888;font-style:italic">= derrière le bâtiment</span></td>
    </tr>
    <tr style="background:#f9f9f9">
      <td style="padding:8px"><strong>between</strong></td>
      <td style="padding:8px">in the middle of two things</td>
      <td style="padding:8px">The library is <strong>between</strong> the school and the park.<br/><span style="color:#888;font-style:italic">= entre l'école et le parc</span></td>
    </tr>
    <tr>
      <td style="padding:8px"><strong>opposite</strong></td>
      <td style="padding:8px">facing, across from</td>
      <td style="padding:8px">The hotel is <strong>opposite</strong> the station.<br/><span style="color:#888;font-style:italic">= en face de la gare</span></td>
    </tr>
    <tr style="background:#f9f9f9">
      <td style="padding:8px"><strong>around</strong></td>
      <td style="padding:8px">surrounding, on all sides</td>
      <td style="padding:8px">There are trees <strong>around</strong> the lake.<br/><span style="color:#888;font-style:italic">= autour du lac</span></td>
    </tr>
  </tbody>
</table>`,
        },
        {
          id: 'en-place2-p5', type: 'exercises',
          title: 'Practice Exercises',
          content: `<h3>✏️ Practice</h3>
<h4>Choose: IN · AT · ON</h4>
<ol>
  <li>She lives ___ Paris.</li>
  <li>The book is ___ the shelf.</li>
  <li>He's ___ work right now.</li>
  <li>The map is ___ the wall.</li>
  <li>We met ___ the airport.</li>
  <li>I put the keys ___ my bag.</li>
</ol>
<h4>Complete the sentences</h4>
<ol>
  <li>The supermarket is ___ the bank and the school. (between)</li>
  <li>The cat jumped ___ the wall. (over)</li>
  <li>The pharmacy is ___ the hospital. (opposite)</li>
  <li>There's a small café ___ the bookshop. (next to)</li>
</ol>
<h4>Describe your room</h4>
<p>Write 5 sentences describing where objects are in your room. Use 5 different prepositions from this lesson.</p>`,
        },
        {
          id: 'en-place2-p6', type: 'lesson',
          title: 'Quick Reference — Place Prepositions',
          content: `<h3>📋 Quick Reference Card</h3>
<div style="background:#f8f9fa;border-radius:8px;padding:16px;line-height:2.2">
  <p><span style="background:#c0392b;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">IN</span> &nbsp;enclosed space — in the box / in London / in the car</p>
  <p><span style="background:#c0392b;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">AT</span> &nbsp;specific point — at school / at home / at the door</p>
  <p><span style="background:#c0392b;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">ON</span> &nbsp;surface — on the table / on the wall / on the floor</p>
  <p><span style="background:#c0392b;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">UNDER</span> &nbsp;below &nbsp;|&nbsp; <span style="background:#c0392b;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">ABOVE/OVER</span> &nbsp;above &nbsp;|&nbsp; <span style="background:#c0392b;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">BELOW</span> &nbsp;lower than</p>
  <p><span style="background:#c0392b;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">NEXT TO</span> &nbsp;beside &nbsp;|&nbsp; <span style="background:#c0392b;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">IN FRONT OF</span> &nbsp;facing &nbsp;|&nbsp; <span style="background:#c0392b;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">BEHIND</span> &nbsp;at the back</p>
  <p><span style="background:#c0392b;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">BETWEEN</span> &nbsp;middle of two &nbsp;|&nbsp; <span style="background:#c0392b;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">OPPOSITE</span> &nbsp;facing &nbsp;|&nbsp; <span style="background:#c0392b;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">AROUND</span> &nbsp;surrounding</p>
</div>`,
        },
      ],
    },
  },
];

// ════════════════════════════════════════════════════════════════════
// STEP 2 — Create 3 missing Arabic standard courses
// ════════════════════════════════════════════════════════════════════
const ARABIC_NEW = [
  {
    titre:       'حروف الجر — Arabic Prepositions (A1–A2)',
    cours_nom:   'Arabe',
    description: 'Complete guide to Arabic prepositions (حروف الجر): في، على، تحت، فوق، من، إلى، مع، بدون، بسبب. Progressive exercises with transliteration and French explanations.',
    langue:      'Arabe',
    categorie:   'arabe',
    section:     'langues',
    niveau:      'A2',
    course_type: 'standard',
    pages: [
      {
        id: 'ar-prep-p1', type: 'intro',
        title: 'Introduction — حروف الجر',
        content: `<div style="text-align:center;margin-bottom:16px">
  <span style="background:#27ae60;color:#fff;padding:6px 18px;border-radius:20px;font-size:13px;font-weight:600">🔡 نحو عربي — Arabic Grammar</span>
</div>
<h2 style="text-align:center;direction:rtl">حروف الجر في اللغة العربية</h2>
<p style="text-align:center;color:#555">Les prépositions arabes (Arabic Prepositions)</p>
<div style="background:#f0fff4;border-left:4px solid #27ae60;border-radius:6px;padding:14px;margin:16px 0">
  <strong>🎯 Objectifs du cours</strong>
  <ul style="margin:8px 0 0 0">
    <li>Utiliser les prépositions de lieu : <strong>في، على، تحت، فوق، أمام، خلف، بين</strong></li>
    <li>Utiliser les prépositions de temps : <strong>في، منذ، خلال، قبل، بعد</strong></li>
    <li>Utiliser les prépositions de mouvement : <strong>إلى، من، نحو، عبر</strong></li>
    <li>Comprendre les prépositions fixes avec les verbes courants</li>
  </ul>
</div>
<p style="background:#f0fff4;padding:10px;border-radius:6px;text-align:center;direction:rtl">
  <strong>في هذا الدرس:</strong> في · على · تحت · فوق · من · إلى · مع · بدون · بسبب · أمام · خلف · بين
</p>`,
      },
      {
        id: 'ar-prep-p2', type: 'lesson',
        title: 'حروف الجر المكانية — Place Prepositions',
        content: `<h3>📖 حروف الجر المكانية</h3>
<table style="width:100%;border-collapse:collapse">
  <thead><tr style="background:#27ae60;color:#fff">
    <th style="padding:8px">العربية</th><th style="padding:8px">Translittération</th><th style="padding:8px">Français</th><th style="padding:8px">Exemple</th>
  </tr></thead>
  <tbody>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>في</strong></td><td style="padding:8px">fī</td><td style="padding:8px">dans, en</td><td style="padding:8px;direction:rtl">الكتاب في الحقيبة.<br/><span style="color:#888;font-style:italic">= Le livre est dans le sac.</span></td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>على</strong></td><td style="padding:8px">'alā</td><td style="padding:8px">sur</td><td style="padding:8px;direction:rtl">القلم على الطاولة.<br/><span style="color:#888;font-style:italic">= Le stylo est sur la table.</span></td></tr>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>تحت</strong></td><td style="padding:8px">taḥta</td><td style="padding:8px">sous</td><td style="padding:8px;direction:rtl">القطة تحت الكرسي.<br/><span style="color:#888;font-style:italic">= Le chat est sous la chaise.</span></td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>فوق</strong></td><td style="padding:8px">fawqa</td><td style="padding:8px">au-dessus de</td><td style="padding:8px;direction:rtl">الطائرة فوق الغيوم.<br/><span style="color:#888;font-style:italic">= L'avion est au-dessus des nuages.</span></td></tr>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>أمام</strong></td><td style="padding:8px">amāma</td><td style="padding:8px">devant</td><td style="padding:8px;direction:rtl">السيارة أمام البيت.<br/><span style="color:#888;font-style:italic">= La voiture est devant la maison.</span></td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>خلف</strong></td><td style="padding:8px">khalfa</td><td style="padding:8px">derrière</td><td style="padding:8px;direction:rtl">الحديقة خلف المنزل.<br/><span style="color:#888;font-style:italic">= Le jardin est derrière la maison.</span></td></tr>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>بين</strong></td><td style="padding:8px">bayna</td><td style="padding:8px">entre</td><td style="padding:8px;direction:rtl">المدرسة بين المستشفى والحديقة.<br/><span style="color:#888;font-style:italic">= L'école est entre l'hôpital et le jardin.</span></td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>بجانب / قرب</strong></td><td style="padding:8px">bi-jānib / qurba</td><td style="padding:8px">à côté de</td><td style="padding:8px;direction:rtl">البنك بجانب المكتبة.<br/><span style="color:#888;font-style:italic">= La banque est à côté de la librairie.</span></td></tr>
  </tbody>
</table>`,
      },
      {
        id: 'ar-prep-p3', type: 'lesson',
        title: 'حروف الجر الزمانية — Time Prepositions',
        content: `<h3>📖 حروف الجر الزمانية</h3>
<table style="width:100%;border-collapse:collapse">
  <thead><tr style="background:#27ae60;color:#fff">
    <th style="padding:8px">العربية</th><th style="padding:8px">Translittération</th><th style="padding:8px">Français</th><th style="padding:8px">Exemple</th>
  </tr></thead>
  <tbody>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>في</strong></td><td style="padding:8px">fī</td><td style="padding:8px">en, le (mois/jour)</td><td style="padding:8px;direction:rtl">في يناير · في الصباح<br/><span style="color:#888;font-style:italic">= en janvier · le matin</span></td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>منذ</strong></td><td style="padding:8px">mundhu</td><td style="padding:8px">depuis</td><td style="padding:8px;direction:rtl">أسكن هنا منذ سنتين.<br/><span style="color:#888;font-style:italic">= J'habite ici depuis deux ans.</span></td></tr>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>خلال</strong></td><td style="padding:8px">khilāla</td><td style="padding:8px">pendant, durant</td><td style="padding:8px;direction:rtl">خلال الصيف · خلال الاجتماع<br/><span style="color:#888;font-style:italic">= pendant l'été</span></td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>قبل</strong></td><td style="padding:8px">qabla</td><td style="padding:8px">avant</td><td style="padding:8px;direction:rtl">قبل الدرس · قبل الأكل<br/><span style="color:#888;font-style:italic">= avant le cours · avant de manger</span></td></tr>
    <tr><td style="padding:8px;text-align:center;font-size:16px;direction:rtl"><strong>بعد</strong></td><td style="padding:8px">ba'da</td><td style="padding:8px">après</td><td style="padding:8px;direction:rtl">بعد الظهر · بعد ساعة<br/><span style="color:#888;font-style:italic">= l'après-midi · dans une heure</span></td></tr>
  </tbody>
</table>`,
      },
      {
        id: 'ar-prep-p4', type: 'exercises',
        title: 'تدريبات — Exercises',
        content: `<h3>✏️ تدريبات</h3>
<h4>أكمل الجمل (Complétez les phrases)</h4>
<p dir="rtl">اختر الحرف المناسب: في / على / تحت / أمام / بين</p>
<ol dir="rtl">
  <li>القطة ___ الطاولة.</li>
  <li>الكتاب ___ الحقيبة.</li>
  <li>وقفت ___ باب المدرسة.</li>
  <li>المطعم ___ الفندق والمكتبة.</li>
  <li>وضعت الصحن ___ الطاولة.</li>
</ol>
<h4>ترجم إلى العربية (Traduisez en arabe)</h4>
<ol>
  <li>Le chat est sous la chaise.</li>
  <li>La banque est à côté de la pharmacie.</li>
  <li>J'étudie depuis une heure.</li>
  <li>La réunion est avant le déjeuner.</li>
</ol>`,
      },
      {
        id: 'ar-prep-p5', type: 'lesson',
        title: 'ملخص — Quick Reference',
        content: `<h3>📋 ملخص حروف الجر</h3>
<div style="background:#f0fff4;border-radius:8px;padding:16px;line-height:2.4;direction:rtl">
  <p><span style="background:#27ae60;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">في</span> &nbsp;في الحقيبة · في يناير · في الصباح</p>
  <p><span style="background:#27ae60;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">على</span> &nbsp;على الطاولة · على الجدار</p>
  <p><span style="background:#27ae60;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">تحت</span> &nbsp;تحت الكرسي &nbsp;|&nbsp; <span style="background:#27ae60;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">فوق</span> &nbsp;فوق الطاولة</p>
  <p><span style="background:#27ae60;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">أمام</span> &nbsp;devant &nbsp;|&nbsp; <span style="background:#27ae60;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">خلف</span> &nbsp;derrière &nbsp;|&nbsp; <span style="background:#27ae60;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">بين</span> &nbsp;entre</p>
  <p><span style="background:#27ae60;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">من</span> &nbsp;de (origine) &nbsp;|&nbsp; <span style="background:#27ae60;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">إلى</span> &nbsp;vers &nbsp;|&nbsp; <span style="background:#27ae60;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">مع</span> &nbsp;avec</p>
  <p><span style="background:#27ae60;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">قبل</span> &nbsp;avant &nbsp;|&nbsp; <span style="background:#27ae60;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">بعد</span> &nbsp;après &nbsp;|&nbsp; <span style="background:#27ae60;color:#fff;padding:2px 8px;border-radius:10px;font-size:12px">منذ</span> &nbsp;depuis</p>
</div>`,
      },
    ],
  },

  {
    titre:       'رسالة من لندن — A Letter from London (Arabic)',
    cours_nom:   'Arabe',
    description: 'Read and write a personal letter in Arabic. Discover London vocabulary in Arabic, understand letter structure in Arabic, and write your own letter.',
    langue:      'Arabe',
    categorie:   'arabe',
    section:     'langues',
    niveau:      'A2',
    course_type: 'standard',
    pages: [
      {
        id: 'ar-london-p1', type: 'intro',
        title: 'مقدمة — رسالة من لندن',
        content: `<div style="text-align:center;margin-bottom:16px">
  <span style="background:#27ae60;color:#fff;padding:6px 18px;border-radius:20px;font-size:13px;font-weight:600">📖 قراءة وكتابة — Reading &amp; Writing</span>
</div>
<h2 style="text-align:center;direction:rtl">رسالة من لندن</h2>
<p style="text-align:center;color:#555">Une lettre de Londres — Lire et écrire en arabe</p>
<div style="background:#f0fff4;border-left:4px solid #27ae60;border-radius:6px;padding:14px;margin:16px 0">
  <strong>🎯 أهداف الدرس (Objectifs)</strong>
  <ul style="margin:8px 0 0 0" dir="rtl">
    <li>قراءة وفهم رسالة شخصية باللغة العربية</li>
    <li>تعلم مفردات المدينة والحياة اليومية</li>
    <li>فهم بنية الرسالة الرسمية وغير الرسمية بالعربية</li>
    <li>كتابة رسالة قصيرة بالعربية (80-100 كلمة)</li>
  </ul>
</div>`,
      },
      {
        id: 'ar-london-p2', type: 'lesson',
        title: 'النص — رسالة من لندن',
        content: `<h3>📖 اقرأ الرسالة (Lisez la lettre)</h3>
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
        id: 'ar-london-p3', type: 'lesson',
        title: 'المفردات — Key Vocabulary',
        content: `<h3>📚 مفردات الرسالة (Vocabulaire)</h3>
<table style="width:100%;border-collapse:collapse">
  <thead><tr style="background:#27ae60;color:#fff">
    <th style="padding:8px">العربية</th><th style="padding:8px">Translittération</th><th style="padding:8px">Français</th>
  </tr></thead>
  <tbody>
    <tr><td style="padding:8px;direction:rtl">شقة</td><td style="padding:8px">shaqqa</td><td style="padding:8px;color:#666;font-style:italic">appartement</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px;direction:rtl">أتأقلم</td><td style="padding:8px">ata'aqqlam</td><td style="padding:8px;color:#666;font-style:italic">je m'adapte / je m'habitue</td></tr>
    <tr><td style="padding:8px;direction:rtl">صاخبة</td><td style="padding:8px">sākhiba</td><td style="padding:8px;color:#666;font-style:italic">bruyante, animée</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px;direction:rtl">ذات الطابقين</td><td style="padding:8px">dhāt al-ṭābiqayn</td><td style="padding:8px;color:#666;font-style:italic">à deux étages</td></tr>
    <tr><td style="padding:8px;direction:rtl">رائعة</td><td style="padding:8px">rā'i'a</td><td style="padding:8px;color:#666;font-style:italic">magnifique, extraordinaire</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px;direction:rtl">أشتاق إليك</td><td style="padding:8px">ashtāq ilayki</td><td style="padding:8px;color:#666;font-style:italic">tu me manques</td></tr>
    <tr><td style="padding:8px;direction:rtl">مع أطيب التحيات</td><td style="padding:8px">ma'a aṭyab al-taḥiyyāt</td><td style="padding:8px;color:#666;font-style:italic">avec mes meilleures salutations</td></tr>
  </tbody>
</table>
<h4 style="margin-top:16px;direction:rtl">عبارات الرسائل (Formules épistolaires)</h4>
<table style="width:100%;border-collapse:collapse">
  <thead><tr style="background:#27ae60;color:#fff">
    <th style="padding:8px">Ouverture</th><th style="padding:8px">Clôture</th>
  </tr></thead>
  <tbody>
    <tr><td style="padding:8px;direction:rtl">عزيزي / عزيزتي [الاسم]</td><td style="padding:8px;direction:rtl">مع أطيب التحيات</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px;direction:rtl">كيف حالك؟</td><td style="padding:8px;direction:rtl">في انتظار ردك</td></tr>
    <tr><td style="padding:8px;direction:rtl">أتمنى أن تكون بخير</td><td style="padding:8px;direction:rtl">صديقك المخلص / صديقتك المخلصة</td></tr>
  </tbody>
</table>`,
      },
      {
        id: 'ar-london-p4', type: 'exercises',
        title: 'تدريبات — Comprehension',
        content: `<h3>✏️ فهم النص (Compréhension)</h3>
<h4>صح أم خطأ؟ (Vrai ou Faux?)</h4>
<ol dir="rtl">
  <li>وصلت صوفيا إلى لندن منذ شهر. (صح / خطأ)</li>
  <li>شقتها قريبة من حديقة هايد بارك. (صح / خطأ)</li>
  <li>الطقس في لندن دافئ ومشمس. (صح / خطأ)</li>
  <li>زارت المتحف البريطاني الأسبوع الماضي. (صح / خطأ)</li>
</ol>
<h4>أجب على الأسئلة (Répondez aux questions)</h4>
<ol dir="rtl">
  <li>ماذا تحب صوفيا في لندن؟</li>
  <li>ماذا زارت الأسبوع الماضي؟</li>
  <li>ما هو شعورها تجاه أصدقائها؟</li>
</ol>`,
      },
      {
        id: 'ar-london-p5', type: 'exercises',
        title: 'إنتاج كتابي — Write Your Letter',
        content: `<h3>✏️ اكتب رسالتك! (Écrivez votre lettre!)</h3>
<p dir="rtl">اكتب رسالة من <strong>80-100 كلمة</strong> إلى صديق عن مدينة تعيش فيها أو زرتها. استخدم نموذج صوفيا:</p>
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
  💡 ابدأ بـ: <em>"عزيزي / عزيزتي... كيف حالك؟ أكتب إليك من..."</em>
</div>`,
      },
    ],
  },

  {
    titre:       'السفر والمغامرة — Travel & Adventure (Arabic)',
    cours_nom:   'Arabe',
    description: 'Read an Arabic travel text. Learn travel vocabulary in Arabic with transliteration, practise the past tense (الفعل الماضي), and write about your own trip.',
    langue:      'Arabe',
    categorie:   'arabe',
    section:     'langues',
    niveau:      'A2',
    course_type: 'standard',
    pages: [
      {
        id: 'ar-travel-p1', type: 'intro',
        title: 'مقدمة — السفر والمغامرة',
        content: `<div style="text-align:center;margin-bottom:16px">
  <span style="background:#27ae60;color:#fff;padding:6px 18px;border-radius:20px;font-size:13px;font-weight:600">✈️ قراءة وتعبير — Reading &amp; Speaking</span>
</div>
<h2 style="text-align:center;direction:rtl">السفر والمغامرة</h2>
<p style="text-align:center;color:#555">Voyage et aventure — Lire et parler de voyages en arabe</p>
<div style="background:#f0fff4;border-left:4px solid #27ae60;border-radius:6px;padding:14px;margin:16px 0">
  <strong>🎯 أهداف الدرس</strong>
  <ul style="margin:8px 0 0 0" dir="rtl">
    <li>قراءة وفهم نص عربي عن السفر</li>
    <li>تعلم مفردات السفر والمواصلات والوجهات</li>
    <li>استخدام الفعل الماضي للحديث عن رحلات سابقة</li>
    <li>التعبير عن الآراء حول تجارب السفر</li>
  </ul>
</div>`,
      },
      {
        id: 'ar-travel-p2', type: 'lesson',
        title: 'النص — رحلتي الكبرى',
        content: `<h3>📖 اقرأ النص (Lisez le texte)</h3>
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
        id: 'ar-travel-p3', type: 'lesson',
        title: 'مفردات السفر — Travel Vocabulary',
        content: `<h3>📚 مفردات السفر</h3>
<table style="width:100%;border-collapse:collapse">
  <thead><tr style="background:#27ae60;color:#fff">
    <th style="padding:8px">العربية</th><th style="padding:8px">Translittération</th><th style="padding:8px">Français</th>
  </tr></thead>
  <tbody>
    <tr><td style="padding:8px;direction:rtl">سنة سفر / سنة فاصلة</td><td style="padding:8px">sanat safar</td><td style="padding:8px;color:#666;font-style:italic">année de césure (gap year)</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px;direction:rtl">رحلة</td><td style="padding:8px">riḥla</td><td style="padding:8px;color:#666;font-style:italic">voyage, trajet</td></tr>
    <tr><td style="padding:8px;direction:rtl">يستكشف</td><td style="padding:8px">yastakshif</td><td style="padding:8px;color:#666;font-style:italic">explorer</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px;direction:rtl">عبّارة</td><td style="padding:8px">'abbāra</td><td style="padding:8px;color:#666;font-style:italic">ferry</td></tr>
    <tr><td style="padding:8px;direction:rtl">خلّاب</td><td style="padding:8px">khallāb</td><td style="padding:8px;color:#666;font-style:italic">à couper le souffle (breathtaking)</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px;direction:rtl">رياض</td><td style="padding:8px">riyāḍ</td><td style="padding:8px;color:#666;font-style:italic">riad (maison traditionnelle)</td></tr>
    <tr><td style="padding:8px;direction:rtl">الاستقلالية</td><td style="padding:8px">al-istiqlāliyya</td><td style="padding:8px;color:#666;font-style:italic">indépendance</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px;direction:rtl">الامتنان</td><td style="padding:8px">al-imtinān</td><td style="padding:8px;color:#666;font-style:italic">la gratitude</td></tr>
    <tr><td style="padding:8px;direction:rtl">أوصي</td><td style="padding:8px">awṣī</td><td style="padding:8px;color:#666;font-style:italic">je recommande</td></tr>
  </tbody>
</table>
<h4 style="margin-top:16px">الفعل الماضي — Past Tense Key Verbs</h4>
<div style="display:flex;flex-wrap:wrap;gap:8px;direction:rtl;margin-top:8px">
  <span style="background:#f0fff4;border:1px solid #27ae60;border-radius:4px;padding:4px 10px;font-size:13px">طار ← يطير</span>
  <span style="background:#f0fff4;border:1px solid #27ae60;border-radius:4px;padding:4px 10px;font-size:13px">قضى ← يقضي</span>
  <span style="background:#f0fff4;border:1px solid #27ae60;border-radius:4px;padding:4px 10px;font-size:13px">ركب ← يركب</span>
  <span style="background:#f0fff4;border:1px solid #27ae60;border-radius:4px;padding:4px 10px;font-size:13px">زار ← يزور</span>
  <span style="background:#f0fff4;border:1px solid #27ae60;border-radius:4px;padding:4px 10px;font-size:13px">بات ← يبيت</span>
  <span style="background:#f0fff4;border:1px solid #27ae60;border-radius:4px;padding:4px 10px;font-size:13px">التقى ← يلتقي</span>
</div>`,
      },
      {
        id: 'ar-travel-p4', type: 'exercises',
        title: 'تدريبات — Comprehension',
        content: `<h3>✏️ فهم النص</h3>
<h4>أجب على الأسئلة (Répondez)</h4>
<ol dir="rtl">
  <li>أين بدأت رحلة جيمس؟</li>
  <li>كيف سافر من المغرب إلى إسبانيا؟</li>
  <li>ما هو الجزء المفضل لديه في الرحلة؟ ولماذا؟</li>
  <li>ماذا فعل في المغرب؟ (شيئان)</li>
  <li>ماذا علّمه السفر؟</li>
</ol>
<h4>صح أم خطأ؟</h4>
<ol dir="rtl">
  <li>سافر جيمس من لندن إلى المغرب بالقطار. (صح / خطأ)</li>
  <li>وجهته المفضلة كانت إيطاليا. (صح / خطأ)</li>
  <li>بات في رياض تقليدي. (صح / خطأ)</li>
</ol>`,
      },
      {
        id: 'ar-travel-p5', type: 'exercises',
        title: 'إنتاج كتابي — Write Your Trip',
        content: `<h3>✏️ اكتب عن رحلتك!</h3>
<p dir="rtl">اكتب فقرة من <strong>80-100 كلمة</strong> عن رحلة حقيقية أو خيالية. اذكر:</p>
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
  💡 استخدم الفعل الماضي: ذهبتُ، رأيتُ، أكلتُ، زرتُ، ركبتُ...<br/>
  <em>مثال: "في الصيف الماضي، ذهبتُ إلى... زرتُ... كان الطعام..."</em>
</div>`,
      },
    ],
  },
];

// ════════════════════════════════════════════════════════════════════
async function main() {
  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);

  console.log('🔐 Authenticating...');
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log('✅ Authenticated\n');

  // ── STEP 1: Update 2 blocked EN courses ──────────────────────────
  console.log('═══════════════════════════════════════════');
  console.log('STEP 1 — Updating 2 blocked EN courses (100% English content)');
  console.log('═══════════════════════════════════════════');

  for (const item of EN_BLOCKED_UPDATES) {
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
        niveau:      newData.niveau,
        pages:       JSON.stringify(newData.pages),
      });
      console.log(`  ✅ Updated: "${oldTitre}"\n      → "${newData.titre}"`);
    } catch (err) {
      const detail = err?.data ? JSON.stringify(err.data) : err.message;
      console.error(`  ❌ Error updating "${oldTitre}": ${detail}`);
    }
  }

  // ── STEP 2: Create 3 missing Arabic courses ───────────────────────
  console.log('\n═══════════════════════════════════════════');
  console.log('STEP 2 — Creating 3 missing Arabic courses');
  console.log('═══════════════════════════════════════════');

  for (const course of ARABIC_NEW) {
    try {
      const pagesJson = JSON.stringify(course.pages);
      if (pagesJson.length > 200000) {
        console.warn(`  ⚠️  Pages JSON too large for "${course.titre}": ${pagesJson.length} chars`);
      }
      const record = await pb.collection('courses').create({
        titre:         course.titre,
        cours_nom:     course.cours_nom,
        description:   course.description,
        langue:        course.langue,
        categorie:     course.categorie,
        categorie_age: 'Adultes',
        section:       course.section,
        niveau:        course.niveau,
        course_type:   course.course_type,
        pages:         pagesJson,
        prix:          0,
        duree:         0,
        instructeur:   'IWS LAAYOUNE',
      });
      console.log(`  ✅ Created: "${course.titre}" (${record.id})`);
    } catch (err) {
      const detail = err?.data ? JSON.stringify(err.data) : err.message;
      console.error(`  ❌ Error creating "${course.titre}": ${detail}`);
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
