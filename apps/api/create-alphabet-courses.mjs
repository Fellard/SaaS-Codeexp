/**
 * create-alphabet-courses.mjs
 * ════════════════════════════════════════════════════════════════
 * Crée 3 cours d'alphabet professionnels avec traductions inline :
 *   • Alphabet Français  — traductions EN en gris (inline-trans)
 *   • Alphabet Anglais   — traductions FR en gris (inline-trans)
 *   • Alphabet Arabe     — traductions EN en gris (inline-trans)
 *
 * Usage :
 *   node create-alphabet-courses.mjs
 *   node create-alphabet-courses.mjs --dry-run
 *   node create-alphabet-courses.mjs --force
 * ════════════════════════════════════════════════════════════════
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
const FORCE    = process.argv.includes('--force');

// ════════════════════════════════════════════════════════════════
// ①  ALPHABET FRANÇAIS  (traductions anglaises en gris)
// ════════════════════════════════════════════════════════════════
const COURS_ALPHABET_FRANCAIS = {
  titre:         "L'alphabet français — Niveau A0/A1",
  cours_nom:     'Grammaire',
  description:   "Maîtrisez les 26 lettres de l'alphabet français, leur prononciation, les voyelles et consonnes, les accents (é è ê à â ù î ô ç) et les sons spéciaux. Indispensable pour tout débutant.",
  langue:        'Francais',
  categorie_age: 'Adultes',
  categorie:     'grammaire',
  section:       'langues',
  niveau:        'A0',
  course_type:   'standard',

  pages: [
    {
      id: 'fr-alpha-p1',
      type: 'intro',
      title: "Introduction — L'alphabet français",
      content: `<h2>L'alphabet français</h2>
<p>L'alphabet français comporte <strong>26 lettres</strong>, les mêmes que l'alphabet latin. Chaque lettre a un nom et un son (parfois plusieurs sons selon sa position dans le mot).</p>
<h3>🎯 Objectifs de ce cours</h3>
<ul>
  <li>Connaître les 26 lettres et leur nom<span class="inline-trans">= Know the 26 letters and their names</span></li>
  <li>Distinguer les voyelles et les consonnes<span class="inline-trans">= Tell apart vowels and consonants</span></li>
  <li>Prononcer correctement chaque lettre<span class="inline-trans">= Correctly pronounce each letter</span></li>
  <li>Reconnaître les accents : é, è, ê, à, â, ù, î, ô, ç, œ, æ<span class="inline-trans">= Recognize accent marks</span></li>
  <li>Épeler un mot en français<span class="inline-trans">= Spell a word in French</span></li>
</ul>
<h3>📋 Les 26 lettres</h3>
<p class="alphabet-line"><strong>A B C D E F G H I J K L M N O P Q R S T U V W X Y Z</strong></p>
<p><strong>6 voyelles :</strong> A — E — I — O — U — Y</p>
<p><strong>20 consonnes :</strong> B — C — D — F — G — H — J — K — L — M — N — P — Q — R — S — T — V — W — X — Z</p>`,
    },

    {
      id: 'fr-alpha-p2',
      type: 'lesson',
      title: 'Les voyelles — A, E, I, O, U, Y',
      content: `<h3>📖 Les voyelles</h3>
<p>Les voyelles sont les lettres dont le son est produit sans blocage de l'air.<span class="inline-trans">= Vowels are letters whose sound is produced without blocking airflow.</span></p>
<div class="summary-table">
<table>
  <thead><tr><th>Lettre</th><th>Nom</th><th>Son</th><th>Exemple</th></tr></thead>
  <tbody>
    <tr><td><strong>A</strong></td><td>/a/</td><td>[a]</td><td><em>ami</em>, <em>chat</em></td></tr>
    <tr><td><strong>E</strong></td><td>/euh/</td><td>[ə] ou [e] ou [ɛ]</td><td><em>le</em>, <em>été</em>, <em>mer</em></td></tr>
    <tr><td><strong>I</strong></td><td>/i/</td><td>[i]</td><td><em>île</em>, <em>midi</em></td></tr>
    <tr><td><strong>O</strong></td><td>/o/</td><td>[o] ou [ɔ]</td><td><em>rose</em>, <em>porte</em></td></tr>
    <tr><td><strong>U</strong></td><td>/u/</td><td>[y]</td><td><em>lune</em>, <em>rue</em></td></tr>
    <tr><td><strong>Y</strong></td><td>/i-grec/</td><td>[i]</td><td><em>style</em>, <em>pays</em></td></tr>
  </tbody>
</table>
</div>
<h4>📌 Les voyelles nasales</h4>
<ul>
  <li><strong>AN / EN</strong> → [ã] : <em>enfant</em><span class="inline-trans">= child</span>, <em>dans</em><span class="inline-trans">= in/inside</span></li>
  <li><strong>IN / AIN / EIN</strong> → [ɛ̃] : <em>vin</em><span class="inline-trans">= wine</span>, <em>main</em><span class="inline-trans">= hand</span></li>
  <li><strong>ON</strong> → [ɔ̃] : <em>bon</em><span class="inline-trans">= good</span>, <em>maison</em><span class="inline-trans">= house</span></li>
  <li><strong>UN</strong> → [œ̃] : <em>un</em><span class="inline-trans">= one / a</span>, <em>brun</em><span class="inline-trans">= brown</span></li>
</ul>`,
    },

    {
      id: 'fr-alpha-p3',
      type: 'lesson',
      title: 'Les consonnes — B à N',
      content: `<h3>📖 Les consonnes — Première partie (B → N)</h3>
<div class="summary-table">
<table>
  <thead><tr><th>Lettre</th><th>Nom</th><th>Son</th><th>Exemple</th></tr></thead>
  <tbody>
    <tr><td><strong>B</strong></td><td>/bé/</td><td>[b]</td><td><em>bonjour</em>, <em>belle</em></td></tr>
    <tr><td><strong>C</strong></td><td>/cé/</td><td>[k] devant A/O/U · [s] devant E/I/Y</td><td><em>carte</em>, <em>ciel</em></td></tr>
    <tr><td><strong>D</strong></td><td>/dé/</td><td>[d]</td><td><em>danser</em>, <em>deux</em></td></tr>
    <tr><td><strong>F</strong></td><td>/effe/</td><td>[f]</td><td><em>famille</em>, <em>fête</em></td></tr>
    <tr><td><strong>G</strong></td><td>/gé/</td><td>[g] devant A/O/U · [ʒ] devant E/I/Y</td><td><em>garçon</em>, <em>gentil</em></td></tr>
    <tr><td><strong>H</strong></td><td>/ache/</td><td>muet ou aspiré</td><td><em>heure</em>, <em>homme</em></td></tr>
    <tr><td><strong>J</strong></td><td>/ji/</td><td>[ʒ]</td><td><em>jardin</em>, <em>jour</em></td></tr>
    <tr><td><strong>K</strong></td><td>/ka/</td><td>[k]</td><td><em>kilo</em>, <em>képi</em></td></tr>
    <tr><td><strong>L</strong></td><td>/elle/</td><td>[l]</td><td><em>livre</em>, <em>lait</em></td></tr>
    <tr><td><strong>M</strong></td><td>/emme/</td><td>[m]</td><td><em>maison</em>, <em>mère</em></td></tr>
    <tr><td><strong>N</strong></td><td>/enne/</td><td>[n]</td><td><em>nuit</em>, <em>neige</em></td></tr>
  </tbody>
</table>
</div>
<h4>⚠️ Règles importantes</h4>
<ul>
  <li><em>bonjour</em><span class="inline-trans">= hello / good day</span> · <em>belle</em><span class="inline-trans">= beautiful</span> · <em>livre</em><span class="inline-trans">= book</span> · <em>lait</em><span class="inline-trans">= milk</span></li>
  <li><em>maison</em><span class="inline-trans">= house</span> · <em>mère</em><span class="inline-trans">= mother</span> · <em>nuit</em><span class="inline-trans">= night</span> · <em>jardin</em><span class="inline-trans">= garden</span></li>
  <li>Le <strong>C</strong> devient <strong>Ç</strong> (cédille) devant A, O, U pour garder le son [s] : <em>garçon</em><span class="inline-trans">= boy</span>, <em>leçon</em><span class="inline-trans">= lesson</span></li>
  <li>Le <strong>H</strong> ne se prononce jamais en français : <em>hôpital</em><span class="inline-trans">= hospital</span>, <em>homme</em><span class="inline-trans">= man</span></li>
</ul>`,
    },

    {
      id: 'fr-alpha-p4',
      type: 'lesson',
      title: 'Les consonnes — P à Z + accents',
      content: `<h3>📖 Les consonnes — Deuxième partie (P → Z)</h3>
<div class="summary-table">
<table>
  <thead><tr><th>Lettre</th><th>Nom</th><th>Son</th><th>Exemple</th></tr></thead>
  <tbody>
    <tr><td><strong>P</strong></td><td>/pé/</td><td>[p]</td><td><em>père</em>, <em>pain</em></td></tr>
    <tr><td><strong>Q</strong></td><td>/ku/</td><td>[k] (toujours suivi de U)</td><td><em>quatre</em>, <em>qui</em></td></tr>
    <tr><td><strong>R</strong></td><td>/erre/</td><td>[ʁ] — gorge</td><td><em>rouge</em>, <em>rue</em></td></tr>
    <tr><td><strong>S</strong></td><td>/esse/</td><td>[s] ou [z] entre voyelles</td><td><em>sac</em>, <em>rose</em></td></tr>
    <tr><td><strong>T</strong></td><td>/té/</td><td>[t] ou [s] dans -tion</td><td><em>table</em>, <em>nation</em></td></tr>
    <tr><td><strong>V</strong></td><td>/vé/</td><td>[v]</td><td><em>vélo</em>, <em>voix</em></td></tr>
    <tr><td><strong>W</strong></td><td>/double-vé/</td><td>[v] ou [w]</td><td><em>wagon</em>, <em>week-end</em></td></tr>
    <tr><td><strong>X</strong></td><td>/iks/</td><td>[ks] ou [gz] ou [s]</td><td><em>taxi</em>, <em>dixième</em></td></tr>
    <tr><td><strong>Z</strong></td><td>/zède/</td><td>[z]</td><td><em>zéro</em>, <em>zone</em></td></tr>
  </tbody>
</table>
</div>
<h4>📌 Exemples de mots</h4>
<ul>
  <li><em>père</em><span class="inline-trans">= father</span> · <em>pain</em><span class="inline-trans">= bread</span> · <em>rouge</em><span class="inline-trans">= red</span> · <em>rue</em><span class="inline-trans">= street</span></li>
  <li><em>sac</em><span class="inline-trans">= bag</span> · <em>table</em><span class="inline-trans">= table</span> · <em>vélo</em><span class="inline-trans">= bicycle</span> · <em>voix</em><span class="inline-trans">= voice</span></li>
</ul>
<h3>📖 Les accents et signes spéciaux</h3>
<div class="summary-table">
<table>
  <thead><tr><th>Signe</th><th>Nom</th><th>Effet</th><th>Exemple</th></tr></thead>
  <tbody>
    <tr><td><strong>é</strong></td><td>accent aigu</td><td>[e] fermé</td><td><em>été</em><span class="inline-trans">= summer</span>, <em>café</em><span class="inline-trans">= coffee</span></td></tr>
    <tr><td><strong>è / ê</strong></td><td>accent grave / circumflexe</td><td>[ɛ] ouvert</td><td><em>mère</em><span class="inline-trans">= mother</span>, <em>fête</em><span class="inline-trans">= celebration</span></td></tr>
    <tr><td><strong>â / à</strong></td><td>accent circumflexe / grave</td><td>distinction de sens</td><td><em>pâte</em><span class="inline-trans">= dough</span> ≠ <em>patte</em><span class="inline-trans">= paw</span></td></tr>
    <tr><td><strong>î / ï</strong></td><td>accent circumflexe / tréma</td><td>longueur ou séparation</td><td><em>île</em><span class="inline-trans">= island</span>, <em>naïf</em><span class="inline-trans">= naive</span></td></tr>
    <tr><td><strong>ô / ù</strong></td><td>accent circumflexe / grave</td><td>distinction</td><td><em>côte</em><span class="inline-trans">= coast</span>, <em>où</em><span class="inline-trans">= where</span></td></tr>
    <tr><td><strong>ç</strong></td><td>cédille</td><td>C devient [s]</td><td><em>garçon</em><span class="inline-trans">= boy</span>, <em>façon</em><span class="inline-trans">= way / manner</span></td></tr>
  </tbody>
</table>
</div>`,
    },

    {
      id: 'fr-alpha-p5',
      type: 'lesson',
      title: "Épeler et lire — Combinaisons de lettres",
      content: `<h3>✏️ Épeler en français</h3>
<p>Pour épeler un mot en français, on dit chaque lettre une par une :</p>
<ul>
  <li><strong>PARIS</strong> = P · A · R · I · S → <em>Paris</em><span class="inline-trans">= Paris (capital of France)</span></li>
  <li><strong>ÉCOLE</strong> = E · C · O · L · E → <em>école</em><span class="inline-trans">= school</span></li>
  <li><strong>CAFÉ</strong> = C · A · F · É → <em>café</em><span class="inline-trans">= coffee / café</span></li>
</ul>
<h4>📌 Combinaisons de lettres importantes</h4>
<ul>
  <li><strong>CH</strong> → [ʃ] : <em>chat</em><span class="inline-trans">= cat</span>, <em>chien</em><span class="inline-trans">= dog</span>, <em>chocolat</em><span class="inline-trans">= chocolate</span></li>
  <li><strong>GN</strong> → [ɲ] : <em>montagne</em><span class="inline-trans">= mountain</span>, <em>agneau</em><span class="inline-trans">= lamb</span></li>
  <li><strong>PH</strong> → [f] : <em>photo</em><span class="inline-trans">= photo</span>, <em>téléphone</em><span class="inline-trans">= telephone</span></li>
  <li><strong>OU</strong> → [u] : <em>bonjour</em><span class="inline-trans">= hello</span>, <em>rouge</em><span class="inline-trans">= red</span></li>
  <li><strong>AU / EAU</strong> → [o] : <em>eau</em><span class="inline-trans">= water</span>, <em>bateau</em><span class="inline-trans">= boat</span></li>
  <li><strong>EU</strong> → [ø] : <em>feu</em><span class="inline-trans">= fire</span>, <em>peur</em><span class="inline-trans">= fear</span></li>
  <li><strong>OI</strong> → [wa] : <em>moi</em><span class="inline-trans">= me</span>, <em>voiture</em><span class="inline-trans">= car</span></li>
  <li><strong>ILL</strong> → [j] : <em>famille</em><span class="inline-trans">= family</span>, <em>soleil</em><span class="inline-trans">= sun</span></li>
</ul>
<h4>💡 Les lettres muettes</h4>
<ul>
  <li>Le <strong>E</strong> final ne se prononce pas : <em>table</em><span class="inline-trans">= table (the final E is silent)</span></li>
  <li>Les consonnes finales souvent muettes : <em>vous</em><span class="inline-trans">= you (the S is silent)</span>, <em>est</em><span class="inline-trans">= is (the T is silent)</span></li>
  <li>La liaison : <em>vous avez</em><span class="inline-trans">= you have (liaison: vous_avez [vu.za.ve])</span></li>
</ul>`,
    },

    {
      id: 'fr-alpha-p6',
      type: 'bilan',
      title: "Bilan — L'alphabet français complet",
      content: `<h3>📊 Tableau récapitulatif — L'alphabet français</h3>
<div class="summary-table">
<table>
  <thead><tr><th>Lettre</th><th>Nom</th><th>Lettre</th><th>Nom</th><th>Lettre</th><th>Nom</th></tr></thead>
  <tbody>
    <tr><td>A</td><td>/a/</td><td>J</td><td>/ji/</td><td>S</td><td>/esse/</td></tr>
    <tr><td>B</td><td>/bé/</td><td>K</td><td>/ka/</td><td>T</td><td>/té/</td></tr>
    <tr><td>C</td><td>/cé/</td><td>L</td><td>/elle/</td><td>U</td><td>/u/</td></tr>
    <tr><td>D</td><td>/dé/</td><td>M</td><td>/emme/</td><td>V</td><td>/vé/</td></tr>
    <tr><td>E</td><td>/euh/</td><td>N</td><td>/enne/</td><td>W</td><td>/double-vé/</td></tr>
    <tr><td>F</td><td>/effe/</td><td>O</td><td>/o/</td><td>X</td><td>/iks/</td></tr>
    <tr><td>G</td><td>/gé/</td><td>P</td><td>/pé/</td><td>Y</td><td>/i-grec/</td></tr>
    <tr><td>H</td><td>/ache/</td><td>Q</td><td>/ku/</td><td>Z</td><td>/zède/</td></tr>
    <tr><td>I</td><td>/i/</td><td>R</td><td>/erre/</td><td></td><td></td></tr>
  </tbody>
</table>
</div>
<h4>✅ Les 5 accents du français</h4>
<div class="summary-table">
<table>
  <thead><tr><th>Accent</th><th>Lettres</th><th>Exemples</th></tr></thead>
  <tbody>
    <tr><td>Accent aigu ´</td><td>é</td><td>été, café, école, répéter</td></tr>
    <tr><td>Accent grave &#96;</td><td>è, à, ù</td><td>mère, à Paris, où</td></tr>
    <tr><td>Accent circumflexe ^</td><td>â, ê, î, ô, û</td><td>âge, fête, île, côte, sûr</td></tr>
    <tr><td>Tréma ¨</td><td>ë, ï, ü</td><td>Noël, naïf</td></tr>
    <tr><td>Cédille ¸</td><td>ç</td><td>garçon, leçon, façon</td></tr>
  </tbody>
</table>
</div>`,
    },

    {
      id: 'fr-alpha-drill',
      type: 'audio-drill',
      title: '🎧 Écoute et répète — L\'alphabet',
      content: '',
      drillData: {
        lang: 'fr-FR',
        subtitle: 'Le navigateur prononce chaque lettre — répète-la à voix haute avant le compte à rebours !',
        pauseSeconds: 3,
        letters: [
          {char:'A', name:'a',         speak:'A'},
          {char:'B', name:'bé',        speak:'B'},
          {char:'C', name:'cé',        speak:'C'},
          {char:'D', name:'dé',        speak:'D'},
          {char:'E', name:'euh',       speak:'E'},
          {char:'F', name:'effe',      speak:'F'},
          {char:'G', name:'gé',        speak:'G'},
          {char:'H', name:'ache',      speak:'H'},
          {char:'I', name:'i',         speak:'I'},
          {char:'J', name:'ji',        speak:'J'},
          {char:'K', name:'ka',        speak:'K'},
          {char:'L', name:'elle',      speak:'L'},
          {char:'M', name:'emme',      speak:'M'},
          {char:'N', name:'enne',      speak:'N'},
          {char:'O', name:'o',         speak:'O'},
          {char:'P', name:'pé',        speak:'P'},
          {char:'Q', name:'ku',        speak:'Q'},
          {char:'R', name:'erre',      speak:'R'},
          {char:'S', name:'esse',      speak:'S'},
          {char:'T', name:'té',        speak:'T'},
          {char:'U', name:'u',         speak:'U'},
          {char:'V', name:'vé',        speak:'V'},
          {char:'W', name:'double vé', speak:'W'},
          {char:'X', name:'iks',       speak:'X'},
          {char:'Y', name:'i grec',    speak:'Y'},
          {char:'Z', name:'zède',      speak:'Z'},
        ],
      },
    },
  ],

  exercises: [
    { id: 'fr-alpha-q1', question: "Combien de lettres comporte l'alphabet français ?", options: ['24', '25', '26', '28'], answer: 2 },
    { id: 'fr-alpha-q2', question: "Quelle lettre s'appelle « ache » en français ?", options: ['K', 'H', 'G', 'J'], answer: 1 },
    { id: 'fr-alpha-q3', question: "Combien y a-t-il de voyelles dans l'alphabet français ?", options: ['5', '6', '7', '4'], answer: 1 },
    { id: 'fr-alpha-q4', question: "La cédille (ç) donne à la lettre C le son :", options: ['[k]', '[g]', '[s]', '[ʃ]'], answer: 2 },
    { id: 'fr-alpha-q5', question: "Dans quel mot la lettre C se prononce-t-elle [s] ?", options: ['Carte', 'Couleur', 'Ciel', 'Corps'], answer: 2 },
    { id: 'fr-alpha-q6', question: "Comment se prononce « CH » en français ?", options: ['[k]', '[tʃ]', '[ʃ]', '[h]'], answer: 2 },
    { id: 'fr-alpha-q7', question: "Quel accent porte la lettre É dans « café » ?", options: ['Accent grave', 'Accent circumflexe', 'Tréma', 'Accent aigu'], answer: 3 },
    { id: 'fr-alpha-q8', question: "La lettre H en français est généralement :", options: ['Aspirée et prononcée', 'Muette (non prononcée)', 'Prononcée [h]', 'Prononcée [k]'], answer: 1 },
    { id: 'fr-alpha-q9', question: "La combinaison « OI » se prononce :", options: ['[oa]', '[oi]', '[wa]', '[we]'], answer: 2 },
    { id: 'fr-alpha-q10', question: "Que signifie « eau » en anglais ?", options: ['Fire', 'Air', 'Water', 'Earth'], answer: 2 },
  ],
};

// ════════════════════════════════════════════════════════════════
// ②  ALPHABET ANGLAIS  (traductions françaises en gris)
// ════════════════════════════════════════════════════════════════
const COURS_ALPHABET_ANGLAIS = {
  titre:         'The English Alphabet — Level A0/A1',
  cours_nom:     'Anglais',
  description:   'Master the 26 letters of the English alphabet: names, sounds, vowels and consonants, silent letters, and key pronunciation rules. Essential for all beginners learning English.',
  langue:        'Anglais',
  categorie_age: 'Adultes',
  categorie:     'anglais',
  section:       'langues',
  niveau:        'A0',
  course_type:   'standard',

  pages: [
    {
      id: 'en-alpha-p1',
      type: 'intro',
      title: 'Introduction — The English Alphabet',
      content: `<h2>The English Alphabet</h2>
<p>The English alphabet has <strong>26 letters</strong>. Each letter has a name and one or more sounds.<span class="inline-trans">= L'alphabet anglais a 26 lettres. Chaque lettre a un nom et un ou plusieurs sons.</span></p>
<h3>🎯 Learning Objectives</h3>
<ul>
  <li>Name all 26 letters of the alphabet<span class="inline-trans">= Nommer les 26 lettres de l'alphabet</span></li>
  <li>Identify vowels and consonants<span class="inline-trans">= Identifier les voyelles et les consonnes</span></li>
  <li>Understand the most common sound of each letter<span class="inline-trans">= Comprendre le son principal de chaque lettre</span></li>
  <li>Spell words aloud in English<span class="inline-trans">= Épeler des mots à voix haute en anglais</span></li>
  <li>Learn key pronunciation rules<span class="inline-trans">= Apprendre les règles de prononciation essentielles</span></li>
</ul>
<h3>📋 The 26 Letters</h3>
<p class="alphabet-line"><strong>A B C D E F G H I J K L M N O P Q R S T U V W X Y Z</strong></p>
<p><strong>5 vowels :</strong> A — E — I — O — U</p>
<p><strong>21 consonants :</strong> B C D F G H J K L M N P Q R S T V W X Y Z</p>`,
    },

    {
      id: 'en-alpha-p2',
      type: 'lesson',
      title: 'Vowels — A, E, I, O, U',
      content: `<h3>📖 Vowels — A · E · I · O · U</h3>
<p>Each vowel has a <strong>short sound</strong> and a <strong>long sound</strong>.<span class="inline-trans">= Chaque voyelle a un son court et un son long.</span></p>
<div class="summary-table">
<table>
  <thead><tr><th>Letter</th><th>Name</th><th>Short</th><th>Long</th><th>Examples</th></tr></thead>
  <tbody>
    <tr><td><strong>A</strong></td><td>/eɪ/</td><td>[æ] — cat</td><td>[eɪ] — cake</td><td><em>cat, apple, cake, name</em></td></tr>
    <tr><td><strong>E</strong></td><td>/iː/</td><td>[e] — bed</td><td>[iː] — eve</td><td><em>bed, red, eve, we</em></td></tr>
    <tr><td><strong>I</strong></td><td>/aɪ/</td><td>[ɪ] — sit</td><td>[aɪ] — bike</td><td><em>sit, him, bike, time</em></td></tr>
    <tr><td><strong>O</strong></td><td>/oʊ/</td><td>[ɒ] — hot</td><td>[oʊ] — home</td><td><em>hot, dog, home, note</em></td></tr>
    <tr><td><strong>U</strong></td><td>/juː/</td><td>[ʌ] — cup</td><td>[juː] — cube</td><td><em>cup, bus, cube, use</em></td></tr>
  </tbody>
</table>
</div>
<h4>📌 The "Magic E" Rule</h4>
<ul>
  <li><em>cap</em><span class="inline-trans">= casquette</span> → <em>cape</em><span class="inline-trans">= cape / pèlerine</span> (le A devient long)</li>
  <li><em>kit</em><span class="inline-trans">= trousse</span> → <em>kite</em><span class="inline-trans">= cerf-volant</span> (le I devient long)</li>
  <li><em>hop</em><span class="inline-trans">= sauter à cloche-pied</span> → <em>hope</em><span class="inline-trans">= espoir / espérer</span> (le O devient long)</li>
  <li><em>cut</em><span class="inline-trans">= couper</span> → <em>cute</em><span class="inline-trans">= mignon</span> (le U devient long)</li>
</ul>`,
    },

    {
      id: 'en-alpha-p3',
      type: 'lesson',
      title: 'Consonants — B to N',
      content: `<h3>📖 Consonants — B to N</h3>
<div class="summary-table">
<table>
  <thead><tr><th>Letter</th><th>Name</th><th>Sound</th><th>Example</th></tr></thead>
  <tbody>
    <tr><td><strong>B</strong></td><td>/biː/</td><td>[b]</td><td><em>book, boy, bread</em></td></tr>
    <tr><td><strong>C</strong></td><td>/siː/</td><td>[k] + [s] before E/I/Y</td><td><em>cat, city, cycle</em></td></tr>
    <tr><td><strong>D</strong></td><td>/diː/</td><td>[d]</td><td><em>dog, door, dream</em></td></tr>
    <tr><td><strong>F</strong></td><td>/ef/</td><td>[f]</td><td><em>fish, fun, flower</em></td></tr>
    <tr><td><strong>G</strong></td><td>/dʒiː/</td><td>[g] + [dʒ] before E/I/Y</td><td><em>go, game, giant, gym</em></td></tr>
    <tr><td><strong>H</strong></td><td>/eɪtʃ/</td><td>[h] — always pronounced!</td><td><em>hello, house, happy</em></td></tr>
    <tr><td><strong>J</strong></td><td>/dʒeɪ/</td><td>[dʒ]</td><td><em>job, jump, jam</em></td></tr>
    <tr><td><strong>K</strong></td><td>/keɪ/</td><td>[k] (silent before N)</td><td><em>king, key, know</em></td></tr>
    <tr><td><strong>L</strong></td><td>/el/</td><td>[l]</td><td><em>love, light, lamp</em></td></tr>
    <tr><td><strong>M</strong></td><td>/em/</td><td>[m]</td><td><em>moon, mother, mouse</em></td></tr>
    <tr><td><strong>N</strong></td><td>/en/</td><td>[n]</td><td><em>night, name, north</em></td></tr>
  </tbody>
</table>
</div>
<h4>📌 Key Vocabulary</h4>
<ul>
  <li><em>book</em><span class="inline-trans">= livre</span> · <em>boy</em><span class="inline-trans">= garçon</span> · <em>bread</em><span class="inline-trans">= pain</span> · <em>dog</em><span class="inline-trans">= chien</span></li>
  <li><em>fish</em><span class="inline-trans">= poisson</span> · <em>flower</em><span class="inline-trans">= fleur</span> · <em>house</em><span class="inline-trans">= maison</span> · <em>king</em><span class="inline-trans">= roi</span></li>
  <li><em>love</em><span class="inline-trans">= amour</span> · <em>moon</em><span class="inline-trans">= lune</span> · <em>mother</em><span class="inline-trans">= mère</span> · <em>night</em><span class="inline-trans">= nuit</span></li>
</ul>`,
    },

    {
      id: 'en-alpha-p4',
      type: 'lesson',
      title: 'Consonants — P to Z + Silent Letters',
      content: `<h3>📖 Consonants — P to Z</h3>
<div class="summary-table">
<table>
  <thead><tr><th>Letter</th><th>Name</th><th>Sound</th><th>Example</th></tr></thead>
  <tbody>
    <tr><td><strong>P</strong></td><td>/piː/</td><td>[p]</td><td><em>paper, pink, pen</em></td></tr>
    <tr><td><strong>Q</strong></td><td>/kjuː/</td><td>[k] (always + U)</td><td><em>queen, question, quiet</em></td></tr>
    <tr><td><strong>R</strong></td><td>/ɑːr/</td><td>[r]</td><td><em>red, road, right</em></td></tr>
    <tr><td><strong>S</strong></td><td>/es/</td><td>[s] or [z] between vowels</td><td><em>sun, rose, music</em></td></tr>
    <tr><td><strong>T</strong></td><td>/tiː/</td><td>[t]</td><td><em>table, tree, time</em></td></tr>
    <tr><td><strong>V</strong></td><td>/viː/</td><td>[v]</td><td><em>voice, very, village</em></td></tr>
    <tr><td><strong>W</strong></td><td>/ˈdʌbljuː/</td><td>[w]</td><td><em>water, window, world</em></td></tr>
    <tr><td><strong>X</strong></td><td>/eks/</td><td>[ks] or [gz]</td><td><em>box, exam</em></td></tr>
    <tr><td><strong>Y</strong></td><td>/waɪ/</td><td>[j] or vowel [ɪ]</td><td><em>yes, yellow, gym</em></td></tr>
    <tr><td><strong>Z</strong></td><td>/zed/</td><td>[z]</td><td><em>zero, zoo, zone</em></td></tr>
  </tbody>
</table>
</div>
<h4>⚠️ Silent Letters — Lettres muettes</h4>
<ul>
  <li>Silent <strong>K</strong> before N : <em>know</em><span class="inline-trans">= savoir / connaître</span>, <em>knee</em><span class="inline-trans">= genou</span>, <em>knife</em><span class="inline-trans">= couteau</span></li>
  <li>Silent <strong>W</strong> before R : <em>write</em><span class="inline-trans">= écrire</span>, <em>wrong</em><span class="inline-trans">= faux / incorrect</span>, <em>wrist</em><span class="inline-trans">= poignet</span></li>
  <li>Silent <strong>B</strong> after M : <em>climb</em><span class="inline-trans">= grimper</span>, <em>thumb</em><span class="inline-trans">= pouce</span>, <em>comb</em><span class="inline-trans">= peigne</span></li>
  <li>Silent <strong>GH</strong> : <em>night</em><span class="inline-trans">= nuit</span>, <em>light</em><span class="inline-trans">= lumière</span>, <em>daughter</em><span class="inline-trans">= fille (enfant)</span></li>
  <li>Silent <strong>T</strong> : <em>often</em><span class="inline-trans">= souvent</span>, <em>listen</em><span class="inline-trans">= écouter</span>, <em>castle</em><span class="inline-trans">= château</span></li>
</ul>`,
    },

    {
      id: 'en-alpha-p5',
      type: 'lesson',
      title: 'Digraphs & Key Combinations',
      content: `<h3>📖 Key Letter Combinations (Digraphs)</h3>
<p>Two letters that make one sound :<span class="inline-trans">= Deux lettres qui forment un seul son :</span></p>
<div class="summary-table">
<table>
  <thead><tr><th>Digraph</th><th>Sound</th><th>Examples</th></tr></thead>
  <tbody>
    <tr><td><strong>SH</strong></td><td>[ʃ]</td><td><em>she, ship, fish, shop</em></td></tr>
    <tr><td><strong>CH</strong></td><td>[tʃ]</td><td><em>chair, child, church</em></td></tr>
    <tr><td><strong>TH</strong></td><td>[θ] or [ð]</td><td><em>think (θ), the (ð), this (ð)</em></td></tr>
    <tr><td><strong>PH</strong></td><td>[f]</td><td><em>phone, photo, alphabet</em></td></tr>
    <tr><td><strong>WH</strong></td><td>[w]</td><td><em>when, where, what, which</em></td></tr>
    <tr><td><strong>NG</strong></td><td>[ŋ]</td><td><em>sing, ring, morning</em></td></tr>
    <tr><td><strong>CK</strong></td><td>[k]</td><td><em>back, clock, duck, stick</em></td></tr>
    <tr><td><strong>OO</strong></td><td>[uː] or [ʊ]</td><td><em>moon (uː), book (ʊ)</em></td></tr>
  </tbody>
</table>
</div>
<h4>📌 Examples with French translations</h4>
<ul>
  <li><em>she</em><span class="inline-trans">= elle</span> · <em>ship</em><span class="inline-trans">= bateau</span> · <em>shop</em><span class="inline-trans">= magasin</span> · <em>fish</em><span class="inline-trans">= poisson</span></li>
  <li><em>chair</em><span class="inline-trans">= chaise</span> · <em>child</em><span class="inline-trans">= enfant</span> · <em>church</em><span class="inline-trans">= église</span></li>
  <li><em>think</em><span class="inline-trans">= penser</span> · <em>the</em><span class="inline-trans">= le / la / les</span> · <em>this</em><span class="inline-trans">= ce / ceci</span></li>
  <li><em>phone</em><span class="inline-trans">= téléphone</span> · <em>when</em><span class="inline-trans">= quand</span> · <em>where</em><span class="inline-trans">= où</span> · <em>what</em><span class="inline-trans">= quoi / quel</span></li>
  <li><em>sing</em><span class="inline-trans">= chanter</span> · <em>morning</em><span class="inline-trans">= matin</span> · <em>moon</em><span class="inline-trans">= lune</span> · <em>book</em><span class="inline-trans">= livre</span></li>
</ul>`,
    },

    {
      id: 'en-alpha-p6',
      type: 'bilan',
      title: 'Summary — The English Alphabet',
      content: `<h3>📊 Full Alphabet Summary</h3>
<div class="summary-table">
<table>
  <thead><tr><th>Letter</th><th>Name</th><th>Letter</th><th>Name</th><th>Letter</th><th>Name</th></tr></thead>
  <tbody>
    <tr><td>A</td><td>/eɪ/</td><td>J</td><td>/dʒeɪ/</td><td>S</td><td>/es/</td></tr>
    <tr><td>B</td><td>/biː/</td><td>K</td><td>/keɪ/</td><td>T</td><td>/tiː/</td></tr>
    <tr><td>C</td><td>/siː/</td><td>L</td><td>/el/</td><td>U</td><td>/juː/</td></tr>
    <tr><td>D</td><td>/diː/</td><td>M</td><td>/em/</td><td>V</td><td>/viː/</td></tr>
    <tr><td>E</td><td>/iː/</td><td>N</td><td>/en/</td><td>W</td><td>/ˈdʌbljuː/</td></tr>
    <tr><td>F</td><td>/ef/</td><td>O</td><td>/oʊ/</td><td>X</td><td>/eks/</td></tr>
    <tr><td>G</td><td>/dʒiː/</td><td>P</td><td>/piː/</td><td>Y</td><td>/waɪ/</td></tr>
    <tr><td>H</td><td>/eɪtʃ/</td><td>Q</td><td>/kjuː/</td><td>Z</td><td>/zed/</td></tr>
    <tr><td>I</td><td>/aɪ/</td><td>R</td><td>/ɑːr/</td><td></td><td></td></tr>
  </tbody>
</table>
</div>
<h4>✅ Key Rules — Règles essentielles</h4>
<div class="summary-table">
<table>
  <thead><tr><th>Rule</th><th>Example</th></tr></thead>
  <tbody>
    <tr><td>Magic E → long vowel</td><td>cap → cape · bit → bite · hop → hope</td></tr>
    <tr><td>C before E/I/Y → [s]</td><td>city, cycle, ceiling</td></tr>
    <tr><td>G before E/I/Y → [dʒ]</td><td>giant, gym, gel</td></tr>
    <tr><td>Silent K before N</td><td>know, knee, knight</td></tr>
    <tr><td>Silent W before R</td><td>write, wrong, wrist</td></tr>
    <tr><td>TH → two sounds</td><td>think [θ] · the [ð]</td></tr>
  </tbody>
</table>
</div>`,
    },

    {
      id: 'en-alpha-drill',
      type: 'audio-drill',
      title: '🎧 Listen and Repeat — The Alphabet',
      content: '',
      drillData: {
        lang: 'en-US',
        subtitle: 'Listen to each letter name — repeat it aloud before the countdown ends!',
        pauseSeconds: 3,
        letters: [
          {char:'A', name:'eɪ',     speak:'A'},
          {char:'B', name:'biː',    speak:'B'},
          {char:'C', name:'siː',    speak:'C'},
          {char:'D', name:'diː',    speak:'D'},
          {char:'E', name:'iː',     speak:'E'},
          {char:'F', name:'ef',     speak:'F'},
          {char:'G', name:'dʒiː',   speak:'G'},
          {char:'H', name:'eɪtʃ',   speak:'H'},
          {char:'I', name:'aɪ',     speak:'I'},
          {char:'J', name:'dʒeɪ',   speak:'J'},
          {char:'K', name:'keɪ',    speak:'K'},
          {char:'L', name:'el',     speak:'L'},
          {char:'M', name:'em',     speak:'M'},
          {char:'N', name:'en',     speak:'N'},
          {char:'O', name:'oʊ',     speak:'O'},
          {char:'P', name:'piː',    speak:'P'},
          {char:'Q', name:'kjuː',   speak:'Q'},
          {char:'R', name:'ɑːr',    speak:'R'},
          {char:'S', name:'es',     speak:'S'},
          {char:'T', name:'tiː',    speak:'T'},
          {char:'U', name:'juː',    speak:'U'},
          {char:'V', name:'viː',    speak:'V'},
          {char:'W', name:'dʌbljuː',speak:'W'},
          {char:'X', name:'eks',    speak:'X'},
          {char:'Y', name:'waɪ',    speak:'Y'},
          {char:'Z', name:'zed',    speak:'Z'},
        ],
      },
    },
  ],

  exercises: [
    { id: 'en-alpha-q1', question: 'How many letters are in the English alphabet?', options: ['24', '25', '26', '28'], answer: 2 },
    { id: 'en-alpha-q2', question: 'Which of these is NOT a vowel in English?', options: ['A', 'E', 'R', 'I'], answer: 2 },
    { id: 'en-alpha-q3', question: 'How is the letter H named in English?', options: ['/hah/', '/etch/', '/eɪtʃ/', '/hi/'], answer: 2 },
    { id: 'en-alpha-q4', question: 'The "Magic E" rule means that…', options: ['E is always silent', 'E makes the previous vowel long', 'E doubles the consonant', 'E changes the meaning only'], answer: 1 },
    { id: 'en-alpha-q5', question: 'In the word "know", which letter is silent?', options: ['N', 'O', 'W', 'K'], answer: 3 },
    { id: 'en-alpha-q6', question: 'How is "TH" pronounced in "the"?', options: ['[t]', '[θ] unvoiced', '[ð] voiced', '[d]'], answer: 2 },
    { id: 'en-alpha-q7', question: 'The letter C sounds like [s] in which word?', options: ['Cat', 'Come', 'City', 'Clock'], answer: 2 },
    { id: 'en-alpha-q8', question: 'Which digraph produces the [ʃ] sound as in "ship"?', options: ['CH', 'TH', 'SH', 'PH'], answer: 2 },
    { id: 'en-alpha-q9', question: 'What does "mother" mean in French?', options: ['Sœur', 'Fille', 'Mère', 'Tante'], answer: 2 },
    { id: 'en-alpha-q10', question: 'The letter Y acts as a vowel in which word?', options: ['Yellow', 'Yes', 'Yard', 'Gym'], answer: 3 },
  ],
};

// ════════════════════════════════════════════════════════════════
// ③  ALPHABET ARABE  (traductions françaises en gris)
// ════════════════════════════════════════════════════════════════
const COURS_ALPHABET_ARABE = {
  titre:         'الحروف العربية — المستوى A0/A1',
  cours_nom:     'Arabe',
  description:   "Apprenez les 28 lettres de l'alphabet arabe, leurs formes, les voyelles courtes (harakat), les voyelles longues et la prononciation de base. Essentiel pour tout débutant en arabe.",
  langue:        'Arabe',
  categorie_age: 'Adultes',
  categorie:     'arabe',
  section:       'langues',
  niveau:        'A0',
  course_type:   'standard',

  pages: [
    {
      id: 'ar-alpha-p1',
      type: 'intro',
      title: 'المقدمة — الحروف العربية',
      content: `<h2>الحروف العربية</h2>
<p>يتكون الأبجدية العربية من <strong>28 حرفاً</strong>. تُكتب العربية من اليمين إلى اليسار.<span class="inline-trans">= The Arabic alphabet has 28 letters. Arabic is written from right to left.</span></p>
<h3>🎯 أهداف هذا الدرس</h3>
<ul>
  <li>التعرف على الـ 28 حرفاً العربية<span class="inline-trans">= Recognize the 28 Arabic letters</span></li>
  <li>معرفة أشكال الحرف الأربعة (مستقل · أول · وسط · آخر)<span class="inline-trans">= Know the 4 forms of each letter (isolated · initial · middle · final)</span></li>
  <li>فهم الحركات القصيرة : الفتحة · الكسرة · الضمة<span class="inline-trans">= Understand the short vowels: fatha · kasra · damma</span></li>
  <li>التمييز بين حروف المد الطويلة : ا · و · ي<span class="inline-trans">= Distinguish the long vowels: ā · ū · ī</span></li>
  <li>نطق الحروف بشكل صحيح<span class="inline-trans">= Correctly pronounce the letters</span></li>
</ul>
<h3>📋 الحروف الـ 28</h3>
<p dir="rtl"><strong>أ ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن هـ و ي</strong></p>
<p><strong>حروف المد :</strong> ا (ā) · و (ū/w) · ي (ī/y)</p>`,
    },

    {
      id: 'ar-alpha-p2',
      type: 'lesson',
      title: 'المجموعة الأولى — أ ب ت ث ج ح خ',
      content: `<h3>📖 المجموعة الأولى</h3>
<div class="summary-table">
<table>
  <thead><tr><th>الحرف</th><th>الاسم</th><th>الصوت</th><th>مثال</th><th>Translation</th></tr></thead>
  <tbody>
    <tr><td dir="rtl"><strong>أ / ا</strong></td><td dir="rtl">أَلِف</td><td>[ʔ] / [aː]</td><td dir="rtl">أَب · أُم</td><td>father · mother</td></tr>
    <tr><td dir="rtl"><strong>ب</strong></td><td dir="rtl">بَاء</td><td>[b]</td><td dir="rtl">بَيْت · بَاب</td><td>house · door</td></tr>
    <tr><td dir="rtl"><strong>ت</strong></td><td dir="rtl">تَاء</td><td>[t]</td><td dir="rtl">تُفَّاح · تَمْر</td><td>apple · dates</td></tr>
    <tr><td dir="rtl"><strong>ث</strong></td><td dir="rtl">ثَاء</td><td>[θ] — like EN "think"</td><td dir="rtl">ثَلَاثَة · ثَوْب</td><td>three · garment</td></tr>
    <tr><td dir="rtl"><strong>ج</strong></td><td dir="rtl">جِيم</td><td>[dʒ] or [ʒ]</td><td dir="rtl">جَمَل · جَبَل</td><td>camel · mountain</td></tr>
    <tr><td dir="rtl"><strong>ح</strong></td><td dir="rtl">حَاء</td><td>[ħ] — pharyngeal H</td><td dir="rtl">حَلِيب · حُب</td><td>milk · love</td></tr>
    <tr><td dir="rtl"><strong>خ</strong></td><td dir="rtl">خَاء</td><td>[x] — like Spanish "jota"</td><td dir="rtl">خُبْز · خَيْر</td><td>bread · goodness</td></tr>
  </tbody>
</table>
</div>
<h4>📌 Key words</h4>
<ul>
  <li>أَب<span class="inline-trans">= father</span> · أُم<span class="inline-trans">= mother</span> · بَيْت<span class="inline-trans">= house</span> · بَاب<span class="inline-trans">= door</span></li>
  <li>جَمَل<span class="inline-trans">= camel</span> · جَبَل<span class="inline-trans">= mountain</span> · حُب<span class="inline-trans">= love</span></li>
  <li>Le <strong>ا</strong> (alef) ne se connecte jamais à la lettre suivante.<span class="inline-trans">= Alef never connects to the next letter.</span></li>
</ul>`,
    },

    {
      id: 'ar-alpha-p3',
      type: 'lesson',
      title: 'المجموعة الثانية — د ذ ر ز س ش ص ض',
      content: `<h3>📖 المجموعة الثانية</h3>
<div class="summary-table">
<table>
  <thead><tr><th>الحرف</th><th>الاسم</th><th>الصوت</th><th>مثال</th><th>Translation</th></tr></thead>
  <tbody>
    <tr><td dir="rtl"><strong>د</strong></td><td dir="rtl">دَال</td><td>[d]</td><td dir="rtl">دَار · دُب</td><td>home · bear</td></tr>
    <tr><td dir="rtl"><strong>ذ</strong></td><td dir="rtl">ذَال</td><td>[ð] — like EN "the"</td><td dir="rtl">ذَهَب · ذِئْب</td><td>gold · wolf</td></tr>
    <tr><td dir="rtl"><strong>ر</strong></td><td dir="rtl">رَاء</td><td>[r] — rolled</td><td dir="rtl">رَجُل · رَأْس</td><td>man · head</td></tr>
    <tr><td dir="rtl"><strong>ز</strong></td><td dir="rtl">زَاي</td><td>[z]</td><td dir="rtl">زَيْت · زَهْرَة</td><td>oil · flower</td></tr>
    <tr><td dir="rtl"><strong>س</strong></td><td dir="rtl">سِين</td><td>[s]</td><td dir="rtl">سَمَاء · سَمَك</td><td>sky · fish</td></tr>
    <tr><td dir="rtl"><strong>ش</strong></td><td dir="rtl">شِين</td><td>[ʃ] — like "sh" in "ship"</td><td dir="rtl">شَمْس · شَجَرَة</td><td>sun · tree</td></tr>
    <tr><td dir="rtl"><strong>ص</strong></td><td dir="rtl">صَاد</td><td>[sˤ] — emphatic S</td><td dir="rtl">صَبْر · صَيْف</td><td>patience · summer</td></tr>
    <tr><td dir="rtl"><strong>ض</strong></td><td dir="rtl">ضَاد</td><td>[dˤ] — emphatic D</td><td dir="rtl">ضَوْء · ضَيْف</td><td>light · guest</td></tr>
  </tbody>
</table>
</div>
<h4>📌 The 6 non-connecting letters</h4>
<p>Ces lettres ne se connectent JAMAIS à la lettre suivante :<span class="inline-trans">= These letters NEVER connect to the following letter:</span></p>
<ul>
  <li dir="rtl"><strong>ا · د · ذ · ر · ز · و</strong></li>
  <li>زَيْت<span class="inline-trans">= oil</span> · شَمْس<span class="inline-trans">= sun</span> · رَجُل<span class="inline-trans">= man</span> · سَمَاء<span class="inline-trans">= sky</span></li>
</ul>`,
    },

    {
      id: 'ar-alpha-p4',
      type: 'lesson',
      title: 'المجموعة الثالثة — ط ظ ع غ ف ق ك ل م ن هـ و ي',
      content: `<h3>📖 المجموعة الثالثة</h3>
<div class="summary-table">
<table>
  <thead><tr><th>الحرف</th><th>الاسم</th><th>الصوت</th><th>مثال</th><th>Translation</th></tr></thead>
  <tbody>
    <tr><td dir="rtl"><strong>ط</strong></td><td dir="rtl">طَاء</td><td>[tˤ] — emphatic T</td><td dir="rtl">طَالِب · طَرِيق</td><td>student · road</td></tr>
    <tr><td dir="rtl"><strong>ظ</strong></td><td dir="rtl">ظَاء</td><td>[ðˤ] — emphatic</td><td dir="rtl">ظِل · ظَهْر</td><td>shadow · back / noon</td></tr>
    <tr><td dir="rtl"><strong>ع</strong></td><td dir="rtl">عَيْن</td><td>[ʕ] — deep throat</td><td dir="rtl">عَيْن · عَرَب</td><td>eye / spring · Arabs</td></tr>
    <tr><td dir="rtl"><strong>غ</strong></td><td dir="rtl">غَيْن</td><td>[ɣ] — hard Parisian R</td><td dir="rtl">غُرْفَة · غَابَة</td><td>room · forest</td></tr>
    <tr><td dir="rtl"><strong>ف</strong></td><td dir="rtl">فَاء</td><td>[f]</td><td dir="rtl">فَم · فَتْح</td><td>mouth · opening</td></tr>
    <tr><td dir="rtl"><strong>ق</strong></td><td dir="rtl">قَاف</td><td>[q] — back-of-throat K</td><td dir="rtl">قَلَم · قَمَر</td><td>pen · moon</td></tr>
    <tr><td dir="rtl"><strong>ك</strong></td><td dir="rtl">كَاف</td><td>[k]</td><td dir="rtl">كِتَاب · كَلْب</td><td>book · dog</td></tr>
    <tr><td dir="rtl"><strong>ل</strong></td><td dir="rtl">لَام</td><td>[l]</td><td dir="rtl">لُغَة · لَيْل</td><td>language · night</td></tr>
    <tr><td dir="rtl"><strong>م</strong></td><td dir="rtl">مِيم</td><td>[m]</td><td dir="rtl">مَاء · مَدْرَسَة</td><td>water · school</td></tr>
    <tr><td dir="rtl"><strong>ن</strong></td><td dir="rtl">نُون</td><td>[n]</td><td dir="rtl">نُور · نَهْر</td><td>light · river</td></tr>
    <tr><td dir="rtl"><strong>هـ</strong></td><td dir="rtl">هَاء</td><td>[h]</td><td dir="rtl">هَوَاء · هِلَال</td><td>air · crescent moon</td></tr>
    <tr><td dir="rtl"><strong>و</strong></td><td dir="rtl">وَاو</td><td>[w] / [uː]</td><td dir="rtl">وَرْدَة · وَلَد</td><td>rose · boy</td></tr>
    <tr><td dir="rtl"><strong>ي</strong></td><td dir="rtl">يَاء</td><td>[j] / [iː]</td><td dir="rtl">يَد · يَوْم</td><td>hand · day</td></tr>
  </tbody>
</table>
</div>
<h4>📌 Key vocabulary</h4>
<ul>
  <li>قَلَم<span class="inline-trans">= pen</span> · قَمَر<span class="inline-trans">= moon</span> · كِتَاب<span class="inline-trans">= book</span> · مَاء<span class="inline-trans">= water</span></li>
  <li>مَدْرَسَة<span class="inline-trans">= school</span> · يَد<span class="inline-trans">= hand</span> · يَوْم<span class="inline-trans">= day</span> · لَيْل<span class="inline-trans">= night</span></li>
</ul>`,
    },

    {
      id: 'ar-alpha-p5',
      type: 'lesson',
      title: 'الحركات والتشكيل — Les voyelles',
      content: `<h3>📖 الحَرَكَات (Voyelles courtes)</h3>
<p>Les voyelles courtes en arabe sont des signes placés sur ou sous les lettres.<span class="inline-trans">= Short vowels in Arabic are signs placed above or below letters.</span></p>
<div class="summary-table">
<table>
  <thead><tr><th>Sign</th><th>Name</th><th>Sound</th><th>Example</th><th>Meaning</th></tr></thead>
  <tbody>
    <tr><td dir="rtl"><strong>َ</strong></td><td dir="rtl">فَتْحَة</td><td>[a] short</td><td dir="rtl">كَتَبَ</td><td>kataba = he wrote</td></tr>
    <tr><td dir="rtl"><strong>ِ</strong></td><td dir="rtl">كَسْرَة</td><td>[i] short</td><td dir="rtl">بِئْر</td><td>bi'r = well</td></tr>
    <tr><td dir="rtl"><strong>ُ</strong></td><td dir="rtl">ضَمَّة</td><td>[u] short</td><td dir="rtl">كُتُب</td><td>kutub = books</td></tr>
    <tr><td dir="rtl"><strong>ْ</strong></td><td dir="rtl">سُكُون</td><td>no vowel</td><td dir="rtl">بَيْت</td><td>bayt = house</td></tr>
    <tr><td dir="rtl"><strong>ّ</strong></td><td dir="rtl">شَدَّة</td><td>doubled consonant</td><td dir="rtl">مُدَرِّس</td><td>mudarris = teacher</td></tr>
  </tbody>
</table>
</div>
<h4>📌 حروف المد — Long Vowels</h4>
<ul>
  <li>كِتَاب<span class="inline-trans">= book — the ا lengthens [a] → [aː]</span></li>
  <li>نُور<span class="inline-trans">= light — the و lengthens [u] → [uː]</span></li>
  <li>كَرِيم<span class="inline-trans">= generous — the ي lengthens [i] → [iː]</span></li>
</ul>
<h4>📌 التَّنْوِين — Nunation</h4>
<ul>
  <li>كِتَابٌ<span class="inline-trans">= a book — ٌ = final sound [un]</span></li>
  <li>وَلَداً<span class="inline-trans">= a boy — ً = final sound [an]</span></li>
  <li>مَدْرَسَةٍ<span class="inline-trans">= of a school — ٍ = final sound [in]</span></li>
</ul>`,
    },

    {
      id: 'ar-alpha-p6',
      type: 'bilan',
      title: 'بيلان — جدول الحروف الكاملة',
      content: `<h3>📊 الحروف العربية الـ 28 — Tableau complet</h3>
<div class="summary-table">
<table>
  <thead><tr><th>#</th><th>الحرف</th><th>الاسم</th><th>الصوت</th><th>#</th><th>الحرف</th><th>الاسم</th><th>الصوت</th></tr></thead>
  <tbody>
    <tr><td>1</td><td dir="rtl">ا</td><td dir="rtl">أَلِف</td><td>[ʔ/aː]</td><td>15</td><td dir="rtl">ع</td><td dir="rtl">عَيْن</td><td>[ʕ]</td></tr>
    <tr><td>2</td><td dir="rtl">ب</td><td dir="rtl">بَاء</td><td>[b]</td><td>16</td><td dir="rtl">غ</td><td dir="rtl">غَيْن</td><td>[ɣ]</td></tr>
    <tr><td>3</td><td dir="rtl">ت</td><td dir="rtl">تَاء</td><td>[t]</td><td>17</td><td dir="rtl">ف</td><td dir="rtl">فَاء</td><td>[f]</td></tr>
    <tr><td>4</td><td dir="rtl">ث</td><td dir="rtl">ثَاء</td><td>[θ]</td><td>18</td><td dir="rtl">ق</td><td dir="rtl">قَاف</td><td>[q]</td></tr>
    <tr><td>5</td><td dir="rtl">ج</td><td dir="rtl">جِيم</td><td>[dʒ]</td><td>19</td><td dir="rtl">ك</td><td dir="rtl">كَاف</td><td>[k]</td></tr>
    <tr><td>6</td><td dir="rtl">ح</td><td dir="rtl">حَاء</td><td>[ħ]</td><td>20</td><td dir="rtl">ل</td><td dir="rtl">لَام</td><td>[l]</td></tr>
    <tr><td>7</td><td dir="rtl">خ</td><td dir="rtl">خَاء</td><td>[x]</td><td>21</td><td dir="rtl">م</td><td dir="rtl">مِيم</td><td>[m]</td></tr>
    <tr><td>8</td><td dir="rtl">د</td><td dir="rtl">دَال</td><td>[d]</td><td>22</td><td dir="rtl">ن</td><td dir="rtl">نُون</td><td>[n]</td></tr>
    <tr><td>9</td><td dir="rtl">ذ</td><td dir="rtl">ذَال</td><td>[ð]</td><td>23</td><td dir="rtl">هـ</td><td dir="rtl">هَاء</td><td>[h]</td></tr>
    <tr><td>10</td><td dir="rtl">ر</td><td dir="rtl">رَاء</td><td>[r]</td><td>24</td><td dir="rtl">و</td><td dir="rtl">وَاو</td><td>[w/uː]</td></tr>
    <tr><td>11</td><td dir="rtl">ز</td><td dir="rtl">زَاي</td><td>[z]</td><td>25</td><td dir="rtl">ي</td><td dir="rtl">يَاء</td><td>[j/iː]</td></tr>
    <tr><td>12</td><td dir="rtl">س</td><td dir="rtl">سِين</td><td>[s]</td><td>26</td><td dir="rtl">ص</td><td dir="rtl">صَاد</td><td>[sˤ]</td></tr>
    <tr><td>13</td><td dir="rtl">ش</td><td dir="rtl">شِين</td><td>[ʃ]</td><td>27</td><td dir="rtl">ض</td><td dir="rtl">ضَاد</td><td>[dˤ]</td></tr>
    <tr><td>14</td><td dir="rtl">ط</td><td dir="rtl">طَاء</td><td>[tˤ]</td><td>28</td><td dir="rtl">ظ</td><td dir="rtl">ظَاء</td><td>[ðˤ]</td></tr>
  </tbody>
</table>
</div>
<h4>✅ الحروف غير المتصلة — Lettres non-connectantes</h4>
<p dir="rtl"><strong>ا · د · ذ · ر · ز · و</strong></p>
<p>Ces 6 lettres ne se connectent jamais à la lettre qui suit (à leur gauche).<span class="inline-trans">= These 6 letters never connect to the letter that follows them.</span></p>`,
    },

    {
      id: 'ar-alpha-drill',
      type: 'audio-drill',
      title: '🎧 استمع وكرر — الحروف العربية',
      content: '',
      drillData: {
        lang: 'ar-SA',
        subtitle: 'استمع إلى كل حرف ثم كرره بصوت عالٍ قبل انتهاء العد التنازلي!',
        pauseSeconds: 4,
        letters: [
          {char:'ا', name:'أَلِف', speak:'الف'},
          {char:'ب', name:'بَاء',  speak:'باء'},
          {char:'ت', name:'تَاء',  speak:'تاء'},
          {char:'ث', name:'ثَاء',  speak:'ثاء'},
          {char:'ج', name:'جِيم',  speak:'جيم'},
          {char:'ح', name:'حَاء',  speak:'حاء'},
          {char:'خ', name:'خَاء',  speak:'خاء'},
          {char:'د', name:'دَال',  speak:'دال'},
          {char:'ذ', name:'ذَال',  speak:'ذال'},
          {char:'ر', name:'رَاء',  speak:'راء'},
          {char:'ز', name:'زَاي',  speak:'زاي'},
          {char:'س', name:'سِين',  speak:'سين'},
          {char:'ش', name:'شِين',  speak:'شين'},
          {char:'ص', name:'صَاد',  speak:'صاد'},
          {char:'ض', name:'ضَاد',  speak:'ضاد'},
          {char:'ط', name:'طَاء',  speak:'طاء'},
          {char:'ظ', name:'ظَاء',  speak:'ظاء'},
          {char:'ع', name:'عَيْن', speak:'عين'},
          {char:'غ', name:'غَيْن', speak:'غين'},
          {char:'ف', name:'فَاء',  speak:'فاء'},
          {char:'ق', name:'قَاف',  speak:'قاف'},
          {char:'ك', name:'كَاف',  speak:'كاف'},
          {char:'ل', name:'لَام',  speak:'لام'},
          {char:'م', name:'مِيم',  speak:'ميم'},
          {char:'ن', name:'نُون',  speak:'نون'},
          {char:'هـ',name:'هَاء',  speak:'هاء'},
          {char:'و', name:'وَاو',  speak:'واو'},
          {char:'ي', name:'يَاء',  speak:'ياء'},
        ],
      },
    },
  ],

  exercises: [
    { id: 'ar-alpha-q1', question: "Combien de lettres comporte l'alphabet arabe ?", options: ['26', '27', '28', '29'], answer: 2 },
    { id: 'ar-alpha-q2', question: "L'arabe s'écrit :", options: ['De gauche à droite', 'De droite à gauche', 'De haut en bas', 'Sans direction fixe'], answer: 1 },
    { id: 'ar-alpha-q3', question: "Quelle lettre arabe produit le son [ʃ] comme « ch » en français ?", options: ['س', 'ش', 'ص', 'ث'], answer: 1 },
    { id: 'ar-alpha-q4', question: "La فَتْحَة (fatha) donne le son :", options: ['[u] court', '[i] court', '[a] court', '[a] long'], answer: 2 },
    { id: 'ar-alpha-q5', question: "Laquelle de ces lettres ne se connecte PAS à la suivante ?", options: ['ب', 'ت', 'ر', 'ك'], answer: 2 },
    { id: 'ar-alpha-q6', question: "Le mot كِتَاب (kitāb) signifie :", options: ['Maison', 'Livre', 'École', 'Stylo'], answer: 1 },
    { id: 'ar-alpha-q7', question: "Quelle lettre produit le son [ħ] (H pharyngal fort) ?", options: ['هـ', 'خ', 'ح', 'ع'], answer: 2 },
    { id: 'ar-alpha-q8', question: "La شَدَّة (shadda) indique :", options: ['Pas de voyelle', 'Un son [n] final', 'Une consonne doublée', 'Une voyelle longue'], answer: 2 },
    { id: 'ar-alpha-q9', question: "Quel est le son de la lettre ث en arabe ?", options: ['[s]', '[θ] comme dans "think"', '[ʃ] comme "ch"', '[t]'], answer: 1 },
    { id: 'ar-alpha-q10', question: "مَاء (mā') signifie en français :", options: ['Feu', 'Terre', 'Air', 'Eau'], answer: 3 },
  ],
};

// ════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════
const ALL_COURSES = [
  COURS_ALPHABET_FRANCAIS,
  COURS_ALPHABET_ANGLAIS,
  COURS_ALPHABET_ARABE,
];

async function main() {
  console.log('\n🔤 create-alphabet-courses.mjs — Cours d\'alphabet avec traductions inline');
  console.log('═'.repeat(65));
  if (DRY_RUN) console.log('⚠️  MODE APERÇU — aucune écriture\n');

  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log(`✅ Connecté à PocketBase (${PB_URL})\n`);

  const existing = await pb.collection('courses').getFullList({ requestKey: null });
  const existingMap = new Map(existing.map(c => [c.titre, c]));

  let updated = 0, skipped = 0, errors = 0;

  for (const course of ALL_COURSES) {
    const flag = course.langue === 'Francais' ? '🇫🇷' :
                 course.langue === 'Anglais'  ? '🇬🇧' : '🇲🇦';
    const exists = existingMap.has(course.titre);

    if (!FORCE && !exists) {
      console.log(`  ⚠️  "${course.titre}" n'existe pas — utilisez sans --force pour créer`);
    }

    if (!FORCE && exists) {
      console.log(`  🔄 MAJ   ${flag} "${course.titre}"`);
    } else if (FORCE || !exists) {
      console.log(`  ✨ CRÉE  ${flag} "${course.titre}"`);
    }

    console.log(`           ${course.pages.length} pages · ${course.exercises.length} exercices`);

    if (DRY_RUN) {
      console.log(`           ✅ (simulation)\n`);
      updated++;
      continue;
    }

    try {
      const payload = {
        titre:         course.titre,
        cours_nom:     course.cours_nom,
        description:   course.description,
        langue:        course.langue,
        categorie_age: course.categorie_age,
        categorie:     course.categorie,
        section:       course.section,
        niveau:        course.niveau,
        course_type:   course.course_type,
        pages:         JSON.stringify(course.pages),
        exercises:     JSON.stringify(course.exercises),
      };

      if (exists) {
        const existingCourse = existingMap.get(course.titre);
        await pb.collection('courses').update(existingCourse.id, payload, { requestKey: null });
        console.log(`           ✅ Mis à jour !\n`);
      } else {
        await pb.collection('courses').create(payload, { requestKey: null });
        console.log(`           ✅ Créé !\n`);
      }
      updated++;
    } catch (e) {
      const detail = e.response?.data ? JSON.stringify(e.response.data, null, 2) : e.message;
      console.error(`           ❌ Erreur : ${e.message}`);
      console.error(`           Détail   : ${detail}\n`);
      errors++;
    }
  }

  console.log('═'.repeat(65));
  console.log(`📊 Résultats : ${updated} traités · ${skipped} ignorés · ${errors} erreurs`);
  if (DRY_RUN) console.log('⚠️  Relancez sans --dry-run pour appliquer');
  console.log('');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
