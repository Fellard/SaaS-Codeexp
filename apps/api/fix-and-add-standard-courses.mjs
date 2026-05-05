/**
 * fix-and-add-standard-courses.mjs
 * ═══════════════════════════════════════════════════════════════════
 * 1. CORRIGE les cours audio Anglais A1 / Arabe A1 :
 *    cours_nom 'Anglais A1' → 'Anglais'
 *    cours_nom 'Arabe A1'   → 'Arabe'
 *    (évite les sections violettes "Autre" dans l'admin)
 *
 * 2. CRÉE les 5 cours standard équivalents en ANGLAIS et ARABE :
 *    - Exprimer le temps        → English Time Expressions / التعبير عن الزمن
 *    - Exprimer un lieu         → English Place Expressions / التعبير عن المكان
 *    - Toutes les prépositions  → English Prepositions / حروف الجر الإنجليزية
 *    - Lettre de Londres        → A Letter from London / رسالة من لندن
 *    - Texte voyage             → Travel & Adventure / نص: السفر والمغامرة
 *
 * Usage :
 *   cd apps/api
 *   node fix-and-add-standard-courses.mjs
 * ═══════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════
// 5 COURS STANDARD EN ANGLAIS (enseigne l'anglais aux francophones)
// ═══════════════════════════════════════════════════════════════════
const ENGLISH_STANDARD = [
  {
    titre:       'Anglais — Exprimer le temps (Time Expressions)',
    cours_nom:   'Anglais',
    description: 'Maîtrisez les expressions de temps en anglais : at, in, on, for, since, during, before, after, by, ago. 8 leçons illustrées avec exemples bilingues et exercices interactifs.',
    langue:      'Anglais',
    categorie:   'anglais',
    section:     'langues',
    niveau:      'A1',
    course_type: 'standard',
    pages: [
      {
        id: 'en-std-time-p1', type: 'intro', title: 'Introduction — Time Expressions',
        content: `<h2>Exprimer le temps en anglais</h2>
<p>Dans cette leçon, vous allez maîtriser les prépositions et expressions de temps en anglais :</p>
<ul>
  <li><strong>at</strong> — pour les heures et moments précis : at 3 o'clock, at night</li>
  <li><strong>in</strong> — pour les mois, années, saisons : in January, in 2024, in summer</li>
  <li><strong>on</strong> — pour les jours et dates : on Monday, on 15th March</li>
  <li><strong>for / since / during</strong> — pour les durées</li>
  <li><strong>before / after / by / ago</strong> — pour situer dans le temps</li>
</ul>`,
      },
      {
        id: 'en-std-time-p2', type: 'lesson', title: 'AT — IN — ON',
        content: `<h3>📖 AT · IN · ON</h3>
<table>
  <thead><tr><th>Préposition</th><th>Usage</th><th>Exemples</th></tr></thead>
  <tbody>
    <tr><td><strong>AT</strong></td><td>Heure précise, moment de la journée, fêtes</td><td>at 8 o'clock · at noon · at midnight · at Christmas</td></tr>
    <tr><td><strong>IN</strong></td><td>Mois, saison, année, siècle, partie de journée</td><td>in July · in summer · in 2020 · in the morning</td></tr>
    <tr><td><strong>ON</strong></td><td>Jour, date, jour + partie de journée</td><td>on Monday · on 1st July · on Monday morning</td></tr>
  </tbody>
</table>
<h4>⚠️ Cas particuliers :</h4>
<ul>
  <li>No preposition + last/next/this/every : <em>last week, next Monday, this morning, every day</em></li>
  <li><em>At the weekend</em> (GB) / <em>On the weekend</em> (US)</li>
</ul>`,
      },
      {
        id: 'en-std-time-p3', type: 'lesson', title: 'FOR · SINCE · DURING',
        content: `<h3>📖 FOR · SINCE · DURING</h3>
<table>
  <thead><tr><th>Préposition</th><th>Usage</th><th>Exemples</th></tr></thead>
  <tbody>
    <tr><td><strong>FOR</strong></td><td>Durée (combien de temps)</td><td>I studied for two hours. · She lived here for 5 years.</td></tr>
    <tr><td><strong>SINCE</strong></td><td>Point de départ (depuis quand)</td><td>I have lived here since 2015. · Since Monday it has been raining.</td></tr>
    <tr><td><strong>DURING</strong></td><td>Au cours d'une période</td><td>during the summer · during the meeting · during my stay</td></tr>
  </tbody>
</table>
<p>⚠️ <strong>FOR</strong> répond à "How long?" · <strong>SINCE</strong> répond à "Since when?"</p>`,
      },
      {
        id: 'en-std-time-p4', type: 'lesson', title: 'BEFORE · AFTER · BY · AGO',
        content: `<h3>📖 BEFORE · AFTER · BY · AGO</h3>
<table>
  <thead><tr><th>Expression</th><th>Sens</th><th>Exemple</th></tr></thead>
  <tbody>
    <tr><td><strong>BEFORE</strong></td><td>Avant</td><td>Finish before Friday. / Before going out, check the weather.</td></tr>
    <tr><td><strong>AFTER</strong></td><td>Après</td><td>After lunch, we went for a walk.</td></tr>
    <tr><td><strong>BY</strong></td><td>D'ici, au plus tard</td><td>I'll be there by 6 pm. / Submit it by Monday.</td></tr>
    <tr><td><strong>AGO</strong></td><td>Il y a (dans le passé)</td><td>I arrived two days ago. / He left an hour ago.</td></tr>
  </tbody>
</table>`,
      },
      {
        id: 'en-std-time-p5', type: 'exercises', title: 'Exercices — Time Expressions',
        content: `<h3>✏️ Exercices</h3>
<h4>Choisissez : AT · IN · ON</h4>
<ol>
  <li>I was born ___ 15th August.</li>
  <li>The meeting starts ___ 9 o'clock.</li>
  <li>She was born ___ 1995.</li>
  <li>We go skiing ___ winter.</li>
  <li>Let's meet ___ Saturday morning.</li>
</ol>
<h4>FOR ou SINCE ?</h4>
<ol>
  <li>I have known her ___ ten years.</li>
  <li>He has been sick ___ Monday.</li>
  <li>They waited ___ two hours.</li>
  <li>We have lived here ___ 2010.</li>
</ol>
<h4>Traduisez</h4>
<ol>
  <li>Il est arrivé il y a trois jours.</li>
  <li>Finissez avant lundi.</li>
  <li>Pendant l'été, nous allons à la plage.</li>
</ol>`,
      },
      {
        id: 'en-std-time-p6', type: 'lesson', title: 'Mémo — Récapitulatif',
        content: `<h3>📋 Mémo — Prépositions de temps</h3>
<div style="background:#f8f9fa;border-radius:8px;padding:16px">
<p><strong>AT</strong> : at 8h · at noon · at night · at Christmas · at the weekend</p>
<p><strong>IN</strong> : in July · in 2024 · in summer · in the morning · in the 20th century</p>
<p><strong>ON</strong> : on Monday · on 1st July · on Monday morning</p>
<p><strong>FOR</strong> : for 2 hours / years / days (durée)</p>
<p><strong>SINCE</strong> : since Monday / 2015 / yesterday (point de départ)</p>
<p><strong>DURING</strong> : during the film / meeting / holidays</p>
<p><strong>BY</strong> : by Friday = au plus tard vendredi</p>
<p><strong>AGO</strong> : 2 days ago = il y a 2 jours</p>
</div>`,
      },
    ],
  },

  {
    titre:       'Anglais — Exprimer un lieu (Place Expressions)',
    cours_nom:   'Anglais',
    description: 'Maîtrisez les prépositions de lieu en anglais : in, at, on, under, above, in front of, behind, between, around. 8 leçons avec exemples et exercices.',
    langue:      'Anglais',
    categorie:   'anglais',
    section:     'langues',
    niveau:      'A1',
    course_type: 'standard',
    pages: [
      {
        id: 'en-std-place-p1', type: 'intro', title: 'Introduction — Place Expressions',
        content: `<h2>Exprimer un lieu en anglais</h2>
<p>Cette leçon couvre les prépositions de lieu essentielles :</p>
<ul>
  <li><strong>in / at / on</strong> — les 3 prépositions de base</li>
  <li><strong>under / above / below / over</strong> — haut et bas</li>
  <li><strong>in front of / behind / beside / next to</strong> — devant, derrière, à côté</li>
  <li><strong>between / among / opposite</strong> — entre, parmi, en face</li>
</ul>`,
      },
      {
        id: 'en-std-place-p2', type: 'lesson', title: 'IN · AT · ON (lieu)',
        content: `<h3>📖 IN · AT · ON pour les lieux</h3>
<table>
  <thead><tr><th>Préposition</th><th>Usage</th><th>Exemples</th></tr></thead>
  <tbody>
    <tr><td><strong>IN</strong></td><td>Espace fermé / à l'intérieur</td><td>in the room · in London · in Morocco · in the car</td></tr>
    <tr><td><strong>AT</strong></td><td>Point précis / lieu fonctionnel</td><td>at the door · at school · at work · at home · at the station</td></tr>
    <tr><td><strong>ON</strong></td><td>Surface</td><td>on the table · on the wall · on the floor · on the road</td></tr>
  </tbody>
</table>`,
      },
      {
        id: 'en-std-place-p3', type: 'lesson', title: 'UNDER · ABOVE · OVER · BELOW',
        content: `<h3>📖 Vertical — haut et bas</h3>
<table>
  <thead><tr><th>Mot</th><th>Sens</th><th>Exemple</th></tr></thead>
  <tbody>
    <tr><td><strong>under</strong></td><td>sous</td><td>The cat is under the table.</td></tr>
    <tr><td><strong>above</strong></td><td>au-dessus de (sans contact)</td><td>The lamp is above the desk.</td></tr>
    <tr><td><strong>over</strong></td><td>par-dessus / au-dessus (mouvement)</td><td>Jump over the fence. / A bridge over the river.</td></tr>
    <tr><td><strong>below</strong></td><td>en dessous de (niveau)</td><td>The temperature is below zero.</td></tr>
  </tbody>
</table>`,
      },
      {
        id: 'en-std-place-p4', type: 'lesson', title: 'NEXT TO · BETWEEN · OPPOSITE',
        content: `<h3>📖 Position relative</h3>
<table>
  <thead><tr><th>Mot</th><th>Sens</th><th>Exemple</th></tr></thead>
  <tbody>
    <tr><td><strong>next to / beside</strong></td><td>à côté de</td><td>The bank is next to the pharmacy.</td></tr>
    <tr><td><strong>in front of</strong></td><td>devant</td><td>There's a garden in front of the house.</td></tr>
    <tr><td><strong>behind</strong></td><td>derrière</td><td>The car is behind the building.</td></tr>
    <tr><td><strong>between</strong></td><td>entre (deux)</td><td>The library is between the school and the park.</td></tr>
    <tr><td><strong>among</strong></td><td>parmi (plusieurs)</td><td>She was among the first to arrive.</td></tr>
    <tr><td><strong>opposite</strong></td><td>en face de</td><td>The hotel is opposite the station.</td></tr>
  </tbody>
</table>`,
      },
      {
        id: 'en-std-place-p5', type: 'exercises', title: 'Exercices — Place Expressions',
        content: `<h3>✏️ Exercices</h3>
<h4>IN · AT · ON ?</h4>
<ol>
  <li>She lives ___ Paris.</li>
  <li>The book is ___ the shelf.</li>
  <li>He's ___ work right now.</li>
  <li>The map is ___ the wall.</li>
  <li>We met ___ the airport.</li>
</ol>
<h4>Complétez</h4>
<ol>
  <li>The supermarket is ___ the bank and the school. (between)</li>
  <li>The cat jumped ___ the wall. (over)</li>
  <li>The pharmacy is ___ the hospital. (opposite)</li>
</ol>
<h4>Décrivez l'image (exercice libre)</h4>
<p>Décrivez la position de 5 objets dans votre chambre en utilisant les prépositions apprises.</p>`,
      },
      {
        id: 'en-std-place-p6', type: 'lesson', title: 'Mémo — Récapitulatif',
        content: `<h3>📋 Mémo — Prépositions de lieu</h3>
<div style="background:#f8f9fa;border-radius:8px;padding:16px">
<p><strong>IN</strong> : espace fermé — in the box / in London / in the car</p>
<p><strong>AT</strong> : point précis — at school / at home / at the door</p>
<p><strong>ON</strong> : surface — on the table / on the wall / on the floor</p>
<p><strong>UNDER</strong> : sous &nbsp;|&nbsp; <strong>ABOVE/OVER</strong> : au-dessus &nbsp;|&nbsp; <strong>BELOW</strong> : en dessous</p>
<p><strong>NEXT TO / BESIDE</strong> : à côté &nbsp;|&nbsp; <strong>IN FRONT OF</strong> : devant &nbsp;|&nbsp; <strong>BEHIND</strong> : derrière</p>
<p><strong>BETWEEN</strong> : entre deux &nbsp;|&nbsp; <strong>AMONG</strong> : parmi plusieurs &nbsp;|&nbsp; <strong>OPPOSITE</strong> : en face</p>
</div>`,
      },
    ],
  },

  {
    titre:       'Anglais — Toutes les prépositions (A1–A2)',
    cours_nom:   'Anglais',
    description: 'Guide complet des prépositions anglaises : temps, lieu, mouvement, cause, moyen. Exercices progressifs pour maîtriser toutes les prépositions essentielles.',
    langue:      'Anglais',
    categorie:   'anglais',
    section:     'langues',
    niveau:      'A2',
    course_type: 'standard',
    pages: [
      {
        id: 'en-std-prep-p1', type: 'intro', title: 'Introduction — Toutes les prépositions',
        content: `<h2>Guide complet des prépositions anglaises</h2>
<p>Les prépositions sont indispensables en anglais. Ce cours couvre :</p>
<ul>
  <li>Prépositions de <strong>temps</strong> : at, in, on, for, since, during, by, ago</li>
  <li>Prépositions de <strong>lieu</strong> : in, at, on, under, above, next to, between</li>
  <li>Prépositions de <strong>mouvement</strong> : to, from, into, out of, through, across</li>
  <li>Prépositions de <strong>moyen / cause</strong> : by, with, because of, due to</li>
  <li>Prépositions <strong>fixes</strong> (avec verbes et adjectifs)</li>
</ul>`,
      },
      {
        id: 'en-std-prep-p2', type: 'lesson', title: 'Prépositions de mouvement',
        content: `<h3>📖 Mouvement et direction</h3>
<table>
  <thead><tr><th>Préposition</th><th>Sens</th><th>Exemple</th></tr></thead>
  <tbody>
    <tr><td><strong>to</strong></td><td>vers / à destination de</td><td>Go to school. / Travel to London.</td></tr>
    <tr><td><strong>from</strong></td><td>depuis / en provenance de</td><td>Come from Morocco. / I'm from Laayoune.</td></tr>
    <tr><td><strong>into</strong></td><td>entrer dans (mouvement)</td><td>Walk into the room. / Jump into the pool.</td></tr>
    <tr><td><strong>out of</strong></td><td>sortir de</td><td>Get out of the car. / Take it out of the bag.</td></tr>
    <tr><td><strong>through</strong></td><td>à travers</td><td>Walk through the forest. / Drive through the tunnel.</td></tr>
    <tr><td><strong>across</strong></td><td>traverser (d'un côté à l'autre)</td><td>Swim across the river. / Walk across the street.</td></tr>
    <tr><td><strong>along</strong></td><td>le long de</td><td>Walk along the beach.</td></tr>
    <tr><td><strong>past</strong></td><td>dépasser / passer devant</td><td>Go past the school, then turn left.</td></tr>
  </tbody>
</table>`,
      },
      {
        id: 'en-std-prep-p3', type: 'lesson', title: 'Prépositions de moyen et cause',
        content: `<h3>📖 Moyen, cause, manière</h3>
<table>
  <thead><tr><th>Préposition</th><th>Sens</th><th>Exemple</th></tr></thead>
  <tbody>
    <tr><td><strong>by</strong></td><td>moyen de transport / auteur</td><td>travel by bus · written by Shakespeare</td></tr>
    <tr><td><strong>with</strong></td><td>avec / au moyen de</td><td>write with a pen · cut with scissors</td></tr>
    <tr><td><strong>without</strong></td><td>sans</td><td>without money · without help</td></tr>
    <tr><td><strong>because of</strong></td><td>à cause de</td><td>absent because of illness</td></tr>
    <tr><td><strong>due to</strong></td><td>en raison de</td><td>cancelled due to bad weather</td></tr>
    <tr><td><strong>for</strong></td><td>pour (but)</td><td>a gift for you · fight for justice</td></tr>
    <tr><td><strong>about</strong></td><td>à propos de</td><td>a book about history</td></tr>
  </tbody>
</table>`,
      },
      {
        id: 'en-std-prep-p4', type: 'lesson', title: 'Prépositions fixes avec verbes',
        content: `<h3>📖 Prépositions fixes — Verbes courants</h3>
<table>
  <thead><tr><th>Verbe + préposition</th><th>Sens</th><th>Exemple</th></tr></thead>
  <tbody>
    <tr><td>listen <strong>to</strong></td><td>écouter</td><td>Listen to the music.</td></tr>
    <tr><td>look <strong>at</strong></td><td>regarder</td><td>Look at this photo.</td></tr>
    <tr><td>wait <strong>for</strong></td><td>attendre</td><td>Wait for the bus.</td></tr>
    <tr><td>talk <strong>about</strong></td><td>parler de</td><td>Talk about the problem.</td></tr>
    <tr><td>think <strong>about/of</strong></td><td>penser à</td><td>Think about your future.</td></tr>
    <tr><td>depend <strong>on</strong></td><td>dépendre de</td><td>It depends on the weather.</td></tr>
    <tr><td>agree <strong>with</strong></td><td>être d'accord avec</td><td>I agree with you.</td></tr>
    <tr><td>consist <strong>of</strong></td><td>se composer de</td><td>The team consists of 11 players.</td></tr>
  </tbody>
</table>`,
      },
      {
        id: 'en-std-prep-p5', type: 'exercises', title: 'Exercices — Toutes les prépositions',
        content: `<h3>✏️ Exercices mixtes</h3>
<h4>Complétez avec la bonne préposition</h4>
<ol>
  <li>She walked ___ the park every morning. (through/across)</li>
  <li>I traveled ___ bus from Casablanca. (by/with)</li>
  <li>The match was cancelled ___ rain. (because of/due to)</li>
  <li>Can you look ___ my bag while I'm gone? (at/after)</li>
  <li>She jumped ___ the pool. (into/in)</li>
</ol>
<h4>Formez des phrases</h4>
<ol>
  <li>travel / plane / London</li>
  <li>book / about / history / ancient</li>
  <li>wait / train / station</li>
</ol>`,
      },
      {
        id: 'en-std-prep-p6', type: 'lesson', title: 'Bilan — Guide de référence',
        content: `<h3>📋 Guide de référence complet</h3>
<h4>Temps : at · in · on · for · since · during · by · ago · before · after</h4>
<h4>Lieu : in · at · on · under · above · next to · between · opposite · behind · in front of</h4>
<h4>Mouvement : to · from · into · out of · through · across · along · past</h4>
<h4>Moyen/cause : by · with · without · because of · due to · for</h4>
<h4>Verbes fixes : listen to · look at · wait for · talk about · depend on · agree with</h4>`,
      },
    ],
  },

  {
    titre:       'Anglais — Lettre de Londres (Reading & Writing)',
    cours_nom:   'Anglais',
    description: 'Explorez un texte authentique en anglais : une lettre de Londres. Développez la compréhension écrite, le vocabulaire et l\'expression écrite en anglais A2.',
    langue:      'Anglais',
    categorie:   'anglais',
    section:     'langues',
    niveau:      'A2',
    course_type: 'standard',
    pages: [
      {
        id: 'en-std-london-p1', type: 'intro', title: 'Introduction',
        content: `<h2>A Letter from London</h2>
<p>Dans cette leçon, vous allez :</p>
<ul>
  <li>Lire une lettre authentique en anglais</li>
  <li>Découvrir le vocabulaire de la ville de Londres</li>
  <li>Apprendre à écrire une lettre personnelle en anglais</li>
  <li>Comprendre les formules d'ouverture et de clôture d'une lettre</li>
</ul>`,
      },
      {
        id: 'en-std-london-p2', type: 'lesson', title: 'Texte — A Letter from London',
        content: `<h3>📖 Lisez la lettre</h3>
<div style="background:#f8f9fa;border:1px solid #dee2e6;border-radius:8px;padding:20px;font-family:Georgia,serif;line-height:1.8">
<p style="text-align:right">15 Baker Street,<br/>London, W1U 6RT<br/>10th October 2024</p>
<p>Dear Yasmine,</p>
<p>How are you? I hope you and your family are doing well. I am writing to you from my new flat in London. I arrived here two weeks ago and I am slowly getting used to life in this amazing city.</p>
<p>London is a very big and busy city. The streets are full of people from all over the world. I love the red double-decker buses and the Underground — that's what they call the metro here! My flat is in the centre, near Hyde Park, which is a huge and beautiful park. I go there every morning for a walk.</p>
<p>The weather is quite cold and rainy, very different from home! But the city is incredible — there are museums, theatres, markets and parks everywhere. Last weekend, I visited the British Museum and Buckingham Palace. It was fantastic!</p>
<p>I miss you and our friends very much. I hope you can visit me soon. Please write back when you have time.</p>
<p>Best wishes,<br/>Sophia</p>
</div>`,
      },
      {
        id: 'en-std-london-p3', type: 'lesson', title: 'Vocabulaire de la lettre',
        content: `<h3>📚 Vocabulaire</h3>
<table>
  <thead><tr><th>Anglais</th><th>Français</th></tr></thead>
  <tbody>
    <tr><td>flat</td><td>appartement</td></tr>
    <tr><td>getting used to</td><td>s'habituer à</td></tr>
    <tr><td>double-decker bus</td><td>bus à deux étages</td></tr>
    <tr><td>the Underground</td><td>le métro londonien (le Tube)</td></tr>
    <tr><td>huge</td><td>immense / gigantesque</td></tr>
    <tr><td>rainy</td><td>pluvieux</td></tr>
    <tr><td>incredible</td><td>incroyable</td></tr>
    <tr><td>I miss you</td><td>Tu me manques / Vous me manquez</td></tr>
    <tr><td>Write back</td><td>Réponds-moi</td></tr>
    <tr><td>Best wishes</td><td>Cordialement / Amitiés</td></tr>
  </tbody>
</table>
<h4>Formules épistolaires</h4>
<table>
  <thead><tr><th>Ouverture</th><th>Clôture</th></tr></thead>
  <tbody>
    <tr><td>Dear [Name],</td><td>Best wishes / Kind regards</td></tr>
    <tr><td>How are you?</td><td>Yours sincerely / Love</td></tr>
    <tr><td>I hope you are well.</td><td>Looking forward to hearing from you.</td></tr>
  </tbody>
</table>`,
      },
      {
        id: 'en-std-london-p4', type: 'exercises', title: 'Compréhension',
        content: `<h3>✏️ Compréhension — Vrai ou Faux ?</h3>
<ol>
  <li>Sophia arrived in London a month ago. (T / F)</li>
  <li>Her flat is near Hyde Park. (T / F)</li>
  <li>She goes to the park in the evenings. (T / F)</li>
  <li>The weather in London is warm and sunny. (T / F)</li>
  <li>She visited the British Museum last weekend. (T / F)</li>
</ol>
<h4>Questions ouvertes</h4>
<ol>
  <li>What does Sophia call the London metro?</li>
  <li>What two famous places did she visit last weekend?</li>
  <li>What does she miss?</li>
</ol>`,
      },
      {
        id: 'en-std-london-p5', type: 'exercises', title: 'Production écrite',
        content: `<h3>✏️ À vous d'écrire !</h3>
<p>Rédigez une lettre de <strong>80–100 mots</strong> à un(e) ami(e) pour lui raconter une ville que vous habitez ou avez visitée. Utilisez le modèle de Sophia :</p>
<ul>
  <li>Introduction : depuis quand êtes-vous là ?</li>
  <li>Description de la ville (2-3 éléments)</li>
  <li>Ce que vous avez fait / vu</li>
  <li>Ce qui vous manque</li>
  <li>Formule de clôture appropriée</li>
</ul>`,
      },
    ],
  },

  {
    titre:       'Anglais — Texte : Voyage et aventure (Travel & Adventure)',
    cours_nom:   'Anglais',
    description: 'Texte de lecture en anglais sur le thème du voyage. Vocabulaire du voyage, des transports et des aventures. Niveau A2 avec exercices de compréhension et production.',
    langue:      'Anglais',
    categorie:   'anglais',
    section:     'langues',
    niveau:      'A2',
    course_type: 'standard',
    pages: [
      {
        id: 'en-std-travel-p1', type: 'intro', title: 'Introduction — Travel & Adventure',
        content: `<h2>Travel & Adventure</h2>
<p>Dans cette leçon :</p>
<ul>
  <li>Lire un texte sur le voyage en anglais</li>
  <li>Vocabulaire des transports, hôtels, destinations</li>
  <li>Parler de ses voyages au passé simple (past simple)</li>
  <li>Exprimer ses opinions sur les voyages</li>
</ul>`,
      },
      {
        id: 'en-std-travel-p2', type: 'lesson', title: 'Texte — My Gap Year Adventure',
        content: `<h3>📖 Lisez le texte</h3>
<div style="background:#f8f9fa;border:1px solid #dee2e6;border-radius:8px;padding:20px;line-height:1.8">
<h4>My Gap Year Adventure — by James</h4>
<p>After finishing school, I decided to take a gap year and travel around the world. It was the best decision of my life!</p>
<p>My journey started in Morocco. I flew from London to Marrakech and spent two weeks exploring the medina, the souks, and the beautiful desert. The people were incredibly friendly and the food was delicious.</p>
<p>From Morocco, I took a ferry to Spain, then travelled by train through France and Italy. In Rome, I visited the Colosseum and ate the most amazing pasta. In Paris, I went up the Eiffel Tower at sunset — breathtaking!</p>
<p>My favourite part of the trip was Morocco. The colours, the smells, the music… everything was magical. I stayed in a traditional riad and rode a camel in the Sahara Desert!</p>
<p>Travelling taught me to be independent, open-minded, and grateful. I met people from every corner of the world and learned something new every single day. I would recommend a gap year to everyone!</p>
</div>`,
      },
      {
        id: 'en-std-travel-p3', type: 'lesson', title: 'Vocabulaire — Travel',
        content: `<h3>📚 Vocabulaire du voyage</h3>
<table>
  <thead><tr><th>Anglais</th><th>Français</th></tr></thead>
  <tbody>
    <tr><td>gap year</td><td>année de césure</td></tr>
    <tr><td>journey</td><td>voyage / trajet</td></tr>
    <tr><td>to explore</td><td>explorer</td></tr>
    <tr><td>souk / medina</td><td>souk / médina</td></tr>
    <tr><td>ferry</td><td>ferry / bac</td></tr>
    <tr><td>breathtaking</td><td>à couper le souffle</td></tr>
    <tr><td>riad</td><td>riad (maison traditionnelle)</td></tr>
    <tr><td>independent</td><td>indépendant</td></tr>
    <tr><td>open-minded</td><td>ouvert d'esprit</td></tr>
    <tr><td>grateful</td><td>reconnaissant</td></tr>
    <tr><td>to recommend</td><td>recommander</td></tr>
  </tbody>
</table>`,
      },
      {
        id: 'en-std-travel-p4', type: 'exercises', title: 'Compréhension',
        content: `<h3>✏️ Compréhension</h3>
<h4>Répondez aux questions</h4>
<ol>
  <li>Where did James start his journey?</li>
  <li>How did he travel from Morocco to Spain?</li>
  <li>What was his favourite part of the trip? Why?</li>
  <li>What two things did he do in Morocco?</li>
  <li>What did travelling teach him?</li>
</ol>
<h4>Vocabulaire en contexte</h4>
<p>Remplacez les mots soulignés par un synonyme du texte :</p>
<ol>
  <li>The view from the top was <u>amazing</u>.</li>
  <li>He decided to <u>discover</u> the old city.</li>
  <li>The experience made him more <u>thankful</u>.</li>
</ol>`,
      },
      {
        id: 'en-std-travel-p5', type: 'exercises', title: 'Production — Mon voyage',
        content: `<h3>✏️ À vous de voyager !</h3>
<p>Rédigez un paragraphe de <strong>80–100 mots</strong> sur un voyage réel ou imaginaire. Incluez :</p>
<ul>
  <li>Où êtes-vous allé(e) ?</li>
  <li>Comment avez-vous voyagé ?</li>
  <li>Qu'est-ce que vous avez vu/fait ?</li>
  <li>Qu'est-ce qui vous a le plus marqué ?</li>
  <li>Recommanderiez-vous cette destination ?</li>
</ul>
<p><em>Utilisez le passé simple (went, saw, ate, visited, took…)</em></p>`,
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════
// 5 COURS STANDARD EN ARABE (enseigne l'arabe aux francophones)
// ═══════════════════════════════════════════════════════════════════
const ARABIC_STANDARD = [
  {
    titre:       'التعبير عن الزمن — Expressing Time (A1–A2)',
    cours_nom:   'Arabe',
    description: 'Maîtrisez les expressions de temps en arabe : ظرف الزمان. Prépositions, adverbes temporels et expressions courantes pour situer une action dans le temps.',
    langue:      'Arabe',
    categorie:   'arabe',
    section:     'langues',
    niveau:      'A1',
    course_type: 'standard',
    pages: [
      {
        id: 'ar-std-time-p1', type: 'intro', title: 'Introduction — التعبير عن الزمن',
        content: `<h2>التعبير عن الزمن بالعربية</h2>
<p>في هذا الدرس، ستتعلم كيف تتحدث عن الوقت بالعربية :</p>
<ul dir="rtl">
  <li>ظرف الزمان : كلمات تدل على الوقت</li>
  <li>حروف الجر الزمانية : في، منذ، خلال، قبل، بعد</li>
  <li>أيام الأسبوع والأشهر</li>
  <li>التعبير عن الماضي والحاضر والمستقبل</li>
</ul>`,
      },
      {
        id: 'ar-std-time-p2', type: 'lesson', title: 'ظرف الزمان — Les adverbes de temps',
        content: `<h3>📖 ظرف الزمان (Adverbes de temps)</h3>
<table>
  <thead><tr><th>Arabe</th><th>Translittération</th><th>Français</th></tr></thead>
  <tbody>
    <tr><td dir="rtl">الآن</td><td>al-'an</td><td>maintenant</td></tr>
    <tr><td dir="rtl">اليَوْم</td><td>al-yawm</td><td>aujourd'hui</td></tr>
    <tr><td dir="rtl">أَمْس</td><td>ams</td><td>hier</td></tr>
    <tr><td dir="rtl">غَداً</td><td>ghadan</td><td>demain</td></tr>
    <tr><td dir="rtl">الأُسْبُوع المَاضِي</td><td>al-usbuu' al-maadi</td><td>la semaine dernière</td></tr>
    <tr><td dir="rtl">الأُسْبُوع القَادِم</td><td>al-usbuu' al-qadim</td><td>la semaine prochaine</td></tr>
    <tr><td dir="rtl">الصَّبَاح</td><td>as-sabah</td><td>le matin</td></tr>
    <tr><td dir="rtl">المَسَاء</td><td>al-masa'</td><td>le soir</td></tr>
    <tr><td dir="rtl">دَائِماً</td><td>da'iman</td><td>toujours</td></tr>
    <tr><td dir="rtl">أَحْيَاناً</td><td>ahyanan</td><td>parfois</td></tr>
    <tr><td dir="rtl">أَبَداً</td><td>abadan</td><td>jamais</td></tr>
  </tbody>
</table>`,
      },
      {
        id: 'ar-std-time-p3', type: 'lesson', title: 'أيام الأسبوع والأشهر',
        content: `<h3>📖 أيام الأسبوع (Jours de la semaine)</h3>
<table>
  <thead><tr><th>Arabe</th><th>Translittération</th><th>Français</th></tr></thead>
  <tbody>
    <tr><td dir="rtl">الأحَد</td><td>al-ahad</td><td>dimanche</td></tr>
    <tr><td dir="rtl">الاثْنَيْن</td><td>al-ithnayn</td><td>lundi</td></tr>
    <tr><td dir="rtl">الثَّلَاثَاء</td><td>ath-thulatha'</td><td>mardi</td></tr>
    <tr><td dir="rtl">الأَرْبِعَاء</td><td>al-arbi'a'</td><td>mercredi</td></tr>
    <tr><td dir="rtl">الخَمِيس</td><td>al-khamis</td><td>jeudi</td></tr>
    <tr><td dir="rtl">الجُمُعَة</td><td>al-jumu'a</td><td>vendredi</td></tr>
    <tr><td dir="rtl">السَّبْت</td><td>as-sabt</td><td>samedi</td></tr>
  </tbody>
</table>`,
      },
      {
        id: 'ar-std-time-p4', type: 'lesson', title: 'حروف الجر الزمانية',
        content: `<h3>📖 حروف الجر الزمانية (Prépositions de temps)</h3>
<table>
  <thead><tr><th>Arabe</th><th>Translittération</th><th>Sens</th><th>Exemple</th></tr></thead>
  <tbody>
    <tr><td dir="rtl">فِي</td><td>fi</td><td>en / dans</td><td dir="rtl">فِي الصَّبَاح (le matin)</td></tr>
    <tr><td dir="rtl">مُنْذُ</td><td>mundhu</td><td>depuis</td><td dir="rtl">مُنْذُ ثَلَاثَة أَيَّام (depuis 3 jours)</td></tr>
    <tr><td dir="rtl">خِلَال</td><td>khilal</td><td>pendant / durant</td><td dir="rtl">خِلَال الصَّيْف (pendant l'été)</td></tr>
    <tr><td dir="rtl">قَبْل</td><td>qabl</td><td>avant</td><td dir="rtl">قَبْل الغَدَاء (avant le déjeuner)</td></tr>
    <tr><td dir="rtl">بَعْد</td><td>ba'd</td><td>après</td><td dir="rtl">بَعْد الدِّرَاسَة (après les études)</td></tr>
    <tr><td dir="rtl">حَتَّى</td><td>hatta</td><td>jusqu'à</td><td dir="rtl">حَتَّى المَسَاء (jusqu'au soir)</td></tr>
  </tbody>
</table>`,
      },
      {
        id: 'ar-std-time-p5', type: 'exercises', title: 'تمارين — الزمن',
        content: `<h3>✏️ تمارين</h3>
<h4>Complétez avec le bon mot (أمس / اليوم / غداً)</h4>
<ol dir="rtl">
  <li>___ ذَهَبْتُ إِلَى المَدْرَسَة. (hier)</li>
  <li>___ لَدَيَّ امْتِحَان. (demain)</li>
  <li>___ الطَّقْسُ جَمِيل. (aujourd'hui)</li>
</ol>
<h4>Traduisez en arabe</h4>
<ol>
  <li>Je suis ici depuis lundi.</li>
  <li>Avant le dîner, je fais mes devoirs.</li>
  <li>Parfois, je lis le soir.</li>
</ol>`,
      },
      {
        id: 'ar-std-time-p6', type: 'lesson', title: 'Mémo — ملخص',
        content: `<h3>📋 ملخص — Récapitulatif du temps en arabe</h3>
<div dir="rtl" style="background:#f8f9fa;border-radius:8px;padding:16px;line-height:2.5">
<p>الآن · اليوم · أمس · غداً · الأسبوع الماضي · الأسبوع القادم</p>
<p>الصباح · الظهر · المساء · الليل</p>
<p>فِي (dans) · مُنْذُ (depuis) · خِلَال (pendant) · قَبْل (avant) · بَعْد (après) · حَتَّى (jusqu'à)</p>
</div>`,
      },
    ],
  },

  {
    titre:       'التعبير عن المكان — Expressing Location (A1–A2)',
    cours_nom:   'Arabe',
    description: 'Maîtrisez les prépositions de lieu en arabe : ظرف المكان. Dans, sur, sous, devant, derrière, entre, à côté. Exercices avec exemples bilingues.',
    langue:      'Arabe',
    categorie:   'arabe',
    section:     'langues',
    niveau:      'A1',
    course_type: 'standard',
    pages: [
      {
        id: 'ar-std-place-p1', type: 'intro', title: 'Introduction — التعبير عن المكان',
        content: `<h2>التعبير عن المكان بالعربية</h2>
<p>في هذا الدرس ستتعلم :</p>
<ul dir="rtl">
  <li>حروف الجر المكانية الأساسية</li>
  <li>ظرف المكان : هنا، هناك، أين</li>
  <li>وصف موقع الأشياء والأماكن</li>
</ul>`,
      },
      {
        id: 'ar-std-place-p2', type: 'lesson', title: 'حروف الجر المكانية',
        content: `<h3>📖 حروف الجر المكانية</h3>
<table>
  <thead><tr><th>Arabe</th><th>Translittération</th><th>Français</th><th>Exemple</th></tr></thead>
  <tbody>
    <tr><td dir="rtl">فِي</td><td>fi</td><td>dans / en</td><td dir="rtl">الكِتَاب فِي الحَقِيبَة</td></tr>
    <tr><td dir="rtl">عَلَى</td><td>'ala</td><td>sur</td><td dir="rtl">الكِتَاب عَلَى الطَّاوِلَة</td></tr>
    <tr><td dir="rtl">تَحْت</td><td>taht</td><td>sous</td><td dir="rtl">القِطُّ تَحْت الكُرْسِي</td></tr>
    <tr><td dir="rtl">فَوْق</td><td>fawq</td><td>au-dessus de</td><td dir="rtl">الطَّائِرَة فَوْق السَّحَاب</td></tr>
    <tr><td dir="rtl">أَمَام</td><td>amam</td><td>devant</td><td dir="rtl">البَيْت أَمَام المَدْرَسَة</td></tr>
    <tr><td dir="rtl">خَلْف</td><td>khalf</td><td>derrière</td><td dir="rtl">السَّيَّارَة خَلْف البَيْت</td></tr>
    <tr><td dir="rtl">بِجَانِب</td><td>bijanibi</td><td>à côté de</td><td dir="rtl">المَكْتَبَة بِجَانِب المَسْجِد</td></tr>
    <tr><td dir="rtl">بَيْن</td><td>bayna</td><td>entre</td><td dir="rtl">المَحَل بَيْن البَنْك والصَّيْدَلِيَّة</td></tr>
    <tr><td dir="rtl">قُرْب / قَرِيب مِن</td><td>qurb / qarib min</td><td>près de</td><td dir="rtl">البَيْت قَرِيب مِن البَحْر</td></tr>
    <tr><td dir="rtl">بَعِيد عَن</td><td>ba'id 'an</td><td>loin de</td><td dir="rtl">المَطَار بَعِيد عَن المَدِينَة</td></tr>
  </tbody>
</table>`,
      },
      {
        id: 'ar-std-place-p3', type: 'lesson', title: 'ظرف المكان',
        content: `<h3>📖 ظرف المكان (Adverbes de lieu)</h3>
<table>
  <thead><tr><th>Arabe</th><th>Translittération</th><th>Français</th></tr></thead>
  <tbody>
    <tr><td dir="rtl">هُنَا</td><td>huna</td><td>ici</td></tr>
    <tr><td dir="rtl">هُنَاك</td><td>hunak</td><td>là-bas</td></tr>
    <tr><td dir="rtl">أَيْن؟</td><td>ayn?</td><td>Où ?</td></tr>
    <tr><td dir="rtl">في كُلِّ مَكَان</td><td>fi kulli makan</td><td>partout</td></tr>
    <tr><td dir="rtl">لا مَكَان</td><td>la makan</td><td>nulle part</td></tr>
    <tr><td dir="rtl">يَمِين</td><td>yamin</td><td>droite</td></tr>
    <tr><td dir="rtl">يَسَار</td><td>yasar</td><td>gauche</td></tr>
  </tbody>
</table>`,
      },
      {
        id: 'ar-std-place-p4', type: 'exercises', title: 'تمارين — المكان',
        content: `<h3>✏️ تمارين</h3>
<h4>Complétez avec la bonne préposition</h4>
<ol dir="rtl">
  <li>الكِتَاب ___ الطَّاوِلَة. (sur)</li>
  <li>القِطُّ ___ الكُرْسِي. (sous)</li>
  <li>الصَّيْدَلِيَّة ___ المَدْرَسَة وَالبَنْك. (entre)</li>
  <li>البَيْت ___ الشَّارِع الرَّئِيسِي. (devant)</li>
</ol>
<h4>Traduisez en arabe</h4>
<ol>
  <li>La bibliothèque est à côté de la mosquée.</li>
  <li>Où est le marché ?</li>
  <li>La gare est loin du centre-ville.</li>
</ol>`,
      },
      {
        id: 'ar-std-place-p5', type: 'lesson', title: 'ملخص — المكان',
        content: `<h3>📋 ملخص</h3>
<div dir="rtl" style="background:#f8f9fa;border-radius:8px;padding:16px;line-height:2.5">
<p>فِي (dans) · عَلَى (sur) · تَحْت (sous) · فَوْق (au-dessus)</p>
<p>أَمَام (devant) · خَلْف (derrière) · بِجَانِب (à côté) · بَيْن (entre)</p>
<p>قَرِيب مِن (près de) · بَعِيد عَن (loin de)</p>
<p>هُنَا (ici) · هُنَاك (là-bas) · أَيْن؟ (où?)</p>
</div>`,
      },
    ],
  },

  {
    titre:       'حروف الجر — Arabic Prepositions (A1–A2)',
    cours_nom:   'Arabe',
    description: 'Guide complet des prépositions arabes حروف الجر : de, à, sur, dans, avec, par, sans. Classification, exemples et exercices progressifs pour maîtriser toutes les prépositions.',
    langue:      'Arabe',
    categorie:   'arabe',
    section:     'langues',
    niveau:      'A2',
    course_type: 'standard',
    pages: [
      {
        id: 'ar-std-prep-p1', type: 'intro', title: 'Introduction — حروف الجر',
        content: `<h2>حروف الجر العربية</h2>
<p>Les prépositions arabes (حروف الجر) sont des mots courts mais essentiels. Elles relient les noms et expriment des relations de lieu, de temps, de cause, de moyen…</p>
<p>Liste des prépositions essentielles :</p>
<p dir="rtl" style="font-size:1.2em;line-height:2.5">مِن · إِلَى · فِي · عَلَى · عَن · بِ · لِ · كَ · مَع · بِدُون</p>`,
      },
      {
        id: 'ar-std-prep-p2', type: 'lesson', title: 'مِن · إِلَى · فِي · عَلَى',
        content: `<h3>📖 Les 4 prépositions fondamentales</h3>
<table>
  <thead><tr><th>Arabe</th><th>Sens principal</th><th>Exemples</th></tr></thead>
  <tbody>
    <tr><td dir="rtl" style="font-size:1.3em">مِن</td><td>de / depuis / à partir de</td><td dir="rtl">أَنَا مِن المَغْرِب · قَادِم مِن لَنْدَن</td></tr>
    <tr><td dir="rtl" style="font-size:1.3em">إِلَى</td><td>vers / à destination de / jusqu'à</td><td dir="rtl">أَذْهَب إِلَى المَدْرَسَة · مِن الصَّبَاح إِلَى المَسَاء</td></tr>
    <tr><td dir="rtl" style="font-size:1.3em">فِي</td><td>dans / en / à (lieu ou temps)</td><td dir="rtl">أَعِيش فِي المَغْرِب · فِي الصَّبَاح</td></tr>
    <tr><td dir="rtl" style="font-size:1.3em">عَلَى</td><td>sur / à la charge de</td><td dir="rtl">الكِتَاب عَلَى الطَّاوِلَة · عَلَيْكَ أَن تَدْرُس</td></tr>
  </tbody>
</table>`,
      },
      {
        id: 'ar-std-prep-p3', type: 'lesson', title: 'عَن · بِ · لِ · مَع',
        content: `<h3>📖 Autres prépositions essentielles</h3>
<table>
  <thead><tr><th>Arabe</th><th>Sens</th><th>Exemples</th></tr></thead>
  <tbody>
    <tr><td dir="rtl" style="font-size:1.3em">عَن</td><td>de / à propos de / loin de</td><td dir="rtl">تَحَدَّثَ عَن المُشْكِلَة · بَعِيد عَن البَيْت</td></tr>
    <tr><td dir="rtl" style="font-size:1.3em">بِ</td><td>avec / par / en</td><td dir="rtl">كَتَبَ بِالقَلَم · سَافَر بِالطَّائِرَة</td></tr>
    <tr><td dir="rtl" style="font-size:1.3em">لِ</td><td>pour / appartenant à</td><td dir="rtl">هَذَا الكِتَاب لِأَحْمَد · ذَهَب لِلدِّرَاسَة</td></tr>
    <tr><td dir="rtl" style="font-size:1.3em">مَع</td><td>avec (accompagnement)</td><td dir="rtl">جِئْتُ مَع أَصْدِقَائِي · مَع السَّلَامَة</td></tr>
    <tr><td dir="rtl" style="font-size:1.3em">بِدُون / بِلَا</td><td>sans</td><td dir="rtl">بِدُون سُكَّر · بِلَا مُشْكِلَة</td></tr>
    <tr><td dir="rtl" style="font-size:1.3em">كَ</td><td>comme / tel que</td><td dir="rtl">هُوَ كَالأَسَد · كَمَا قُلْتُ</td></tr>
  </tbody>
</table>`,
      },
      {
        id: 'ar-std-prep-p4', type: 'exercises', title: 'تمارين — حروف الجر',
        content: `<h3>✏️ تمارين</h3>
<h4>Complétez avec la bonne préposition</h4>
<ol dir="rtl">
  <li>أَنَا ___ المَغْرِب. (من)</li>
  <li>أَذْهَب ___ المَدْرَسَة كُلَّ يَوْم. (إلى)</li>
  <li>كَتَبَ الدَّرْس ___ القَلَم. (بِ)</li>
  <li>تَحَدَّثْنَا ___ الرِّحْلَة. (عَن)</li>
  <li>جِئْتُ ___ أَخِي. (مَع)</li>
</ol>
<h4>Traduisez en arabe</h4>
<ol>
  <li>Je viens du Maroc.</li>
  <li>Il voyage en avion.</li>
  <li>Ce livre est pour toi.</li>
  <li>Je parle sans hésitation.</li>
</ol>`,
      },
      {
        id: 'ar-std-prep-p5', type: 'lesson', title: 'ملخص — حروف الجر',
        content: `<h3>📋 ملخص حروف الجر العربية</h3>
<div dir="rtl" style="background:#f8f9fa;border-radius:8px;padding:16px;line-height:3">
<p><strong>مِن</strong> = de/depuis &nbsp;|&nbsp; <strong>إِلَى</strong> = vers/à &nbsp;|&nbsp; <strong>فِي</strong> = dans/en &nbsp;|&nbsp; <strong>عَلَى</strong> = sur</p>
<p><strong>عَن</strong> = à propos de &nbsp;|&nbsp; <strong>بِ</strong> = avec/par &nbsp;|&nbsp; <strong>لِ</strong> = pour &nbsp;|&nbsp; <strong>مَع</strong> = avec</p>
<p><strong>بِدُون</strong> = sans &nbsp;|&nbsp; <strong>كَ</strong> = comme &nbsp;|&nbsp; <strong>حَتَّى</strong> = jusqu'à</p>
</div>`,
      },
    ],
  },

  {
    titre:       'رسالة من لندن — A Letter from London (A2)',
    cours_nom:   'Arabe',
    description: 'Lisez et analysez une lettre en arabe standard. Développez votre compréhension écrite, le vocabulaire de la correspondance et apprenez à rédiger une lettre en arabe.',
    langue:      'Arabe',
    categorie:   'arabe',
    section:     'langues',
    niveau:      'A2',
    course_type: 'standard',
    pages: [
      {
        id: 'ar-std-london-p1', type: 'intro', title: 'مقدمة — رسالة من لندن',
        content: `<h2 dir="rtl">رسالة من لندن</h2>
<p>في هذا الدرس ستتعلم :</p>
<ul dir="rtl">
  <li>قراءة رسالة شخصية باللغة العربية</li>
  <li>مفردات المدينة والحياة اليومية</li>
  <li>كيفية كتابة رسالة بالعربية</li>
  <li>صيغ الافتتاح والختام في الرسائل العربية</li>
</ul>`,
      },
      {
        id: 'ar-std-london-p2', type: 'lesson', title: 'النص — رسالة من لندن',
        content: `<h3>📖 اقرأ الرسالة</h3>
<div dir="rtl" style="background:#f8f9fa;border:1px solid #dee2e6;border-radius:8px;padding:20px;font-family:'Amiri',serif;line-height:2.5">
<p>لندن، 10 أكتوبر 2024</p>
<p>سليمى العزيزة،</p>
<p>كيف حالك؟ أتمنى أن تكوني بخير أنت وعائلتك. أكتب إليك من شقتي الجديدة في لندن. لقد وصلت إلى هنا منذ أسبوعين، وأنا أتأقلم شيئاً فشيئاً مع الحياة في هذه المدينة الرائعة.</p>
<p>لندن مدينة كبيرة جداً ومليئة بالحيوية. الشوارع مزدحمة بأناس من كل أنحاء العالم. أحب الحافلات الحمراء ذات الطابقين والمترو الذي يسمونه "التيوب". شقتي في مركز المدينة، قريبة من حديقة هايد بارك الجميلة.</p>
<p>الطقس بارد وممطر هنا، مختلف تماماً عن بلدنا. لكن المدينة رائعة — فيها متاحف ومسارح وأسواق وحدائق في كل مكان. في الأسبوع الماضي، زرت المتحف البريطاني وقصر باكينغهام. كان ذلك رائعاً!</p>
<p>أشتاق إليك كثيراً. أتمنى أن تزوريني قريباً. أرجو أن تردي عليّ في أقرب وقت.</p>
<p>مع أطيب التمنيات،<br/>ياسمين</p>
</div>`,
      },
      {
        id: 'ar-std-london-p3', type: 'lesson', title: 'مفردات الرسالة',
        content: `<h3>📚 المفردات الجديدة</h3>
<table>
  <thead><tr><th>عربي</th><th>Translittération</th><th>Français</th></tr></thead>
  <tbody>
    <tr><td dir="rtl">شَقَّة</td><td>shaqqa</td><td>appartement</td></tr>
    <tr><td dir="rtl">أَتَأَقْلَم</td><td>ata'aqlam</td><td>je m'adapte / je m'habitue</td></tr>
    <tr><td dir="rtl">مَزْدَحِم</td><td>muzdahim</td><td>encombré / bondé</td></tr>
    <tr><td dir="rtl">حَدِيقَة</td><td>hadiqa</td><td>parc / jardin</td></tr>
    <tr><td dir="rtl">مَتْحَف</td><td>mathaf</td><td>musée</td></tr>
    <tr><td dir="rtl">مَسْرَح</td><td>masrah</td><td>théâtre</td></tr>
    <tr><td dir="rtl">أَشْتَاق</td><td>ashtaq</td><td>je regrette / tu me manques</td></tr>
    <tr><td dir="rtl">أَطْيَب التَّمَنِّيَات</td><td>atyab at-tamanni</td><td>avec les meilleurs vœux</td></tr>
  </tbody>
</table>
<h4>Formules épistolaires arabes</h4>
<table>
  <thead><tr><th>Ouverture</th><th>Clôture</th></tr></thead>
  <tbody>
    <tr><td dir="rtl">العزيزة / العزيز</td><td dir="rtl">مع أطيب التمنيات</td></tr>
    <tr><td dir="rtl">كيف حالك؟</td><td dir="rtl">في انتظار ردك</td></tr>
    <tr><td dir="rtl">أتمنى أن تكون بخير</td><td dir="rtl">أخوك/أختك المخلص/ة</td></tr>
  </tbody>
</table>`,
      },
      {
        id: 'ar-std-london-p4', type: 'exercises', title: 'تمارين — الفهم',
        content: `<h3>✏️ تمارين الفهم</h3>
<h4>صح أم خطأ؟ (Vrai ou Faux ?)</h4>
<ol dir="rtl">
  <li>وصلت ياسمين إلى لندن منذ شهر. (صح / خطأ)</li>
  <li>شقتها قريبة من حديقة هايد بارك. (صح / خطأ)</li>
  <li>الطقس في لندن حار ومشمس. (صح / خطأ)</li>
  <li>زارت ياسمين المتحف البريطاني. (صح / خطأ)</li>
</ol>
<h4>أجب عن الأسئلة</h4>
<ol dir="rtl">
  <li>ماذا تسمي ياسمين المترو في لندن؟</li>
  <li>ماذا تجد في المدينة في كل مكان؟</li>
  <li>لماذا تشتاق ياسمين إلى سليمى؟</li>
</ol>`,
      },
      {
        id: 'ar-std-london-p5', type: 'exercises', title: 'الإنتاج الكتابي',
        content: `<h3>✏️ اكتب أنت !</h3>
<p>اكتب رسالة من <strong>60-80 كلمة</strong> إلى صديق/صديقة تصف فيها مدينة تسكن فيها أو زرتها. استخدم نموذج ياسمين :</p>
<ul dir="rtl">
  <li>المقدمة : منذ متى أنت هناك؟</li>
  <li>وصف المدينة (2-3 عناصر)</li>
  <li>ما الذي فعلته أو رأيته؟</li>
  <li>ما الذي تشتاق إليه؟</li>
  <li>صيغة الختام المناسبة</li>
</ul>`,
      },
    ],
  },

  {
    titre:       'السفر والمغامرة — Travel and Adventure (A2)',
    cours_nom:   'Arabe',
    description: 'Texte de lecture en arabe standard sur le thème du voyage. Vocabulaire des transports et destinations. Niveau A2 avec exercices de compréhension et production.',
    langue:      'Arabe',
    categorie:   'arabe',
    section:     'langues',
    niveau:      'A2',
    course_type: 'standard',
    pages: [
      {
        id: 'ar-std-travel-p1', type: 'intro', title: 'مقدمة — السفر والمغامرة',
        content: `<h2 dir="rtl">السفر والمغامرة</h2>
<p>في هذا الدرس ستتعلم :</p>
<ul dir="rtl">
  <li>قراءة نص عربي عن السفر</li>
  <li>مفردات وسائل النقل والسياحة</li>
  <li>الحديث عن تجارب السفر بالماضي</li>
  <li>التعبير عن الرأي والمشاعر</li>
</ul>`,
      },
      {
        id: 'ar-std-travel-p2', type: 'lesson', title: 'النص — رحلتي إلى الأندلس',
        content: `<h3>📖 اقرأ النص</h3>
<div dir="rtl" style="background:#f8f9fa;border:1px solid #dee2e6;border-radius:8px;padding:20px;font-family:'Amiri',serif;line-height:2.8">
<h4>رحلتي إلى الأندلس — بقلم: عمر</h4>
<p>في الصيف الماضي، قررت أن أسافر إلى إسبانيا لأكتشف تراث الأندلس. كان هذا حلمي منذ سنوات طويلة!</p>
<p>سافرت بالطائرة من الدار البيضاء إلى مدريد، ثم أخذت القطار إلى غرناطة. كانت المدينة رائعة — قصر الحمراء كان أجمل مما تخيلت. المباني والزخارف والأبواب العربية القديمة تحكي تاريخاً عريقاً.</p>
<p>من غرناطة، سافرت إلى إشبيلية وقرطبة. في قرطبة، زرت المسجد الكبير الذي بناه المسلمون قبل أكثر من ألف عام. شعرت بفخر عميق وأنا أقف أمام هذا الصرح العظيم.</p>
<p>أحببت الطعام الأندلسي، خاصة الغزباتشو والتاباس. والناس كانوا لطيفين جداً. أوصي كل مسلم بزيارة الأندلس مرة في حياته.</p>
</div>`,
      },
      {
        id: 'ar-std-travel-p3', type: 'lesson', title: 'المفردات — السفر',
        content: `<h3>📚 مفردات السفر والنقل</h3>
<table>
  <thead><tr><th>عربي</th><th>Translittération</th><th>Français</th></tr></thead>
  <tbody>
    <tr><td dir="rtl">سَافَر</td><td>safara</td><td>voyager (passé)</td></tr>
    <tr><td dir="rtl">رِحْلَة</td><td>rihla</td><td>voyage / excursion</td></tr>
    <tr><td dir="rtl">تُرَاث</td><td>turath</td><td>patrimoine / héritage</td></tr>
    <tr><td dir="rtl">قَطَار</td><td>qitar</td><td>train</td></tr>
    <tr><td dir="rtl">طَائِرَة</td><td>ta'ira</td><td>avion</td></tr>
    <tr><td dir="rtl">تَخَيَّل</td><td>takhayyal</td><td>imaginer</td></tr>
    <tr><td dir="rtl">زَخَارِف</td><td>zakharif</td><td>ornements / décorations</td></tr>
    <tr><td dir="rtl">فَخْر</td><td>fakhr</td><td>fierté</td></tr>
    <tr><td dir="rtl">أُوصِي</td><td>uwsi</td><td>je recommande</td></tr>
  </tbody>
</table>`,
      },
      {
        id: 'ar-std-travel-p4', type: 'exercises', title: 'تمارين — الفهم',
        content: `<h3>✏️ تمارين</h3>
<h4>أجب عن الأسئلة</h4>
<ol dir="rtl">
  <li>إلى أين سافر عمر في الصيف الماضي؟</li>
  <li>بماذا سافر من الدار البيضاء؟</li>
  <li>ما الذي أعجبه في قرطبة؟</li>
  <li>ماذا يقول عن الناس الإسبان؟</li>
  <li>من يوصي بزيارة الأندلس؟</li>
</ol>
<h4>أكمل الجمل</h4>
<ol dir="rtl">
  <li>سافر عمر إلى إسبانيا لأنه يريد ___.</li>
  <li>قصر الحمراء كان أجمل مما ___.</li>
  <li>شعر بفخر عندما ___.</li>
</ol>`,
      },
      {
        id: 'ar-std-travel-p5', type: 'exercises', title: 'الإنتاج الكتابي — رحلتي',
        content: `<h3>✏️ اكتب عن رحلتك</h3>
<p dir="rtl">اكتب فقرة من <strong>60-80 كلمة</strong> عن رحلة حقيقية أو خيالية. ضمّن :</p>
<ul dir="rtl">
  <li>أين ذهبت ومتى؟</li>
  <li>كيف سافرت؟</li>
  <li>ماذا رأيت وفعلت؟</li>
  <li>ما الذي أعجبك أكثر؟</li>
  <li>هل توصي بهذه الوجهة؟</li>
</ul>
<p><em>استخدم الفعل الماضي : ذَهَبَ، رَأَى، أَكَل، زَار، أَخَذ…</em></p>`,
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
async function main() {
  const pb = new PocketBase(PB_URL);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log('✅ PocketBase connecté\n');

  const allCourses = await pb.collection('courses').getFullList({ requestKey: null });
  console.log(`📚 ${allCourses.length} cours existants chargés.\n`);

  // ── ÉTAPE 1 : Corriger cours_nom des cours audio A1 ──────────────
  console.log('═'.repeat(55));
  console.log('  ÉTAPE 1 — Correction cours_nom (A1 → Anglais/Arabe)');
  console.log('═'.repeat(55));

  let fixed = 0;
  for (const c of allCourses) {
    let newNom = null;
    if (c.cours_nom === 'Anglais A1') newNom = 'Anglais';
    if (c.cours_nom === 'Arabe A1')   newNom = 'Arabe';
    if (!newNom) continue;

    try {
      await pb.collection('courses').update(c.id, { cours_nom: newNom }, { requestKey: null });
      console.log(`   ✅ "${c.cours_nom}" → "${newNom}"  (${c.titre?.slice(0, 45)}…)`);
      fixed++;
    } catch (err) {
      console.error(`   ❌ Erreur : ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 80));
  }
  console.log(`\n   ✅ ${fixed} cours corrigés.\n`);

  // ── ÉTAPE 2 : Créer les 5 cours standard EN + 5 AR ───────────────
  console.log('═'.repeat(55));
  console.log('  ÉTAPE 2 — Création des cours standard EN + AR');
  console.log('═'.repeat(55));

  const existingTitles = new Set(allCourses.map(c => c.titre));
  let created = 0, skipped = 0, errors = 0;

  const ALL_NEW = [
    ...ENGLISH_STANDARD.map(c => ({ ...c, _tag: 'EN' })),
    ...ARABIC_STANDARD.map(c  => ({ ...c, _tag: 'AR' })),
  ];

  for (const course of ALL_NEW) {
    const tag = course._tag;
    delete course._tag;

    if (existingTitles.has(course.titre)) {
      console.log(`\n⏭️  [${tag}] Déjà présent — ${course.titre}`);
      skipped++;
      continue;
    }

    const data = {
      titre:         course.titre,
      cours_nom:     course.cours_nom,
      description:   course.description,
      langue:        course.langue,
      categorie:     course.categorie,
      categorie_age: 'Adultes',
      section:       course.section,
      niveau:        course.niveau,
      course_type:   course.course_type,
      pages:         JSON.stringify(course.pages),
      prix:          0,
      duree:         45,
      instructeur:   'IWS LAAYOUNE',
    };

    try {
      await pb.collection('courses').create(data, { requestKey: null });
      console.log(`\n✅ [${tag}] Créé : ${course.titre}`);
      created++;
    } catch (err) {
      const detail = err?.data ? JSON.stringify(err.data) : '';
      console.error(`\n❌ [${tag}] Erreur (${course.titre}) : ${err.message}`);
      if (detail) console.error(`   ↳ ${detail}`);
      errors++;
    }
    await new Promise(r => setTimeout(r, 100));
  }

  // ── Résumé ───────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(55));
  console.log('  📊 RÉSUMÉ');
  console.log('═'.repeat(55));
  console.log(`  🔧 cours_nom corrigés  : ${fixed}`);
  console.log(`  ✅ Cours créés         : ${created}`);
  console.log(`  ⏭️  Déjà existants     : ${skipped}`);
  if (errors) console.log(`  ❌ Erreurs            : ${errors}`);
  console.log('═'.repeat(55));
  console.log('\n🎉 Terminé !');
  console.log('   ➜ Les sections "Anglais A1" et "Arabe A1" (violettes) ont disparu.');
  console.log('   ➜ Tous les cours anglais sont regroupés sous "Anglais" (rouge).');
  console.log('   ➜ Tous les cours arabes sont regroupés sous "Arabe" (vert).\n');
}

main().catch(console.error);
