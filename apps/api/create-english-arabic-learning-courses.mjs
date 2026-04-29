/**
 * create-english-arabic-learning-courses.mjs
 * ═══════════════════════════════════════════════════════════════════
 * Crée des cours qui ENSEIGNENT L'ANGLAIS et L'ARABE (niveau A1)
 * aux apprenants francophones — même pédagogie que Tip Top! A1.2.
 *
 * Ces cours sont INDÉPENDANTS des cours de français existants.
 * Les cours français NE SONT PAS modifiés.
 *
 * Structure de chaque module (7 modules par langue) :
 *   Page 1 → Introduction & objectifs
 *   Page 2 → Dialogue (avec référence piste audio)
 *   Page 3 → Vocabulaire
 *   Page 4 → Grammaire
 *   Page 5 → Exercices
 *   Page 6 → Bilan / Révision
 *
 * Usage :
 *   cd apps/api
 *   node create-english-arabic-learning-courses.mjs
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
// COURS D'ANGLAIS — 7 modules (A1 — pour francophones)
// ═══════════════════════════════════════════════════════════════════
const ENGLISH_COURSES = [
  {
    titre:       'Anglais A1 — Module 1 · Se présenter (Pistes 1–10)',
    cours_nom:   'Anglais A1',
    description: 'Premier module du cours d\'anglais A1. Apprenez à vous présenter, dire votre nom, votre âge et votre nationalité en anglais. Dialogue audio avec des locuteurs natifs.',
    langue:      'en',
    categorie:   'anglais',
    section:     'langues',
    niveau:      'A1',
    course_type: 'audio',
    pages: [
      {
        id: 'en-m1-p1',
        type: 'intro',
        title: 'Introduction',
        content: `<h2>Module 1 — Se présenter en anglais</h2>
<p>Dans ce module, vous allez apprendre à :</p>
<ul>
  <li>Dire bonjour et au revoir en anglais</li>
  <li>Vous présenter : nom, prénom, âge, nationalité</li>
  <li>Poser des questions simples sur quelqu'un</li>
  <li>Utiliser les verbes <strong>to be</strong> et <strong>to have</strong> au présent</li>
</ul>
<p><strong>Mots-clés :</strong> Hello · Hi · My name is · I am · How are you? · Nice to meet you</p>`,
      },
      {
        id: 'en-m1-p2',
        type: 'audio',
        title: 'Dialogue — Nice to meet you!',
        piste_numero: 1,
        transcript: `<h3>🎧 Écoutez le dialogue (Piste 1)</h3>
<div class="dialogue">
  <p><strong>Emma:</strong> Hi! My name is Emma. What's your name?</p>
  <p><strong>Lucas:</strong> Hello! I'm Lucas. Nice to meet you, Emma.</p>
  <p><strong>Emma:</strong> Nice to meet you too! Where are you from?</p>
  <p><strong>Lucas:</strong> I'm from France. And you?</p>
  <p><strong>Emma:</strong> I'm from England. How old are you?</p>
  <p><strong>Lucas:</strong> I'm sixteen. And you?</p>
  <p><strong>Emma:</strong> I'm fifteen.</p>
</div>
<hr/>
<h4>Traduction</h4>
<p><strong>Emma :</strong> Salut ! Je m'appelle Emma. Comment tu t'appelles ?</p>
<p><strong>Lucas :</strong> Bonjour ! Je suis Lucas. Enchanté, Emma.</p>
<p><strong>Emma :</strong> Enchantée aussi ! Tu viens d'où ?</p>
<p><strong>Lucas :</strong> Je viens de France. Et toi ?</p>
<p><strong>Emma :</strong> Je viens d'Angleterre. Tu as quel âge ?</p>
<p><strong>Lucas :</strong> J'ai seize ans. Et toi ?</p>
<p><strong>Emma :</strong> J'ai quinze ans.</p>`,
      },
      {
        id: 'en-m1-p3',
        type: 'audio',
        title: 'Dialogue — At school',
        piste_numero: 2,
        transcript: `<h3>🎧 Écoutez le dialogue (Piste 2)</h3>
<div class="dialogue">
  <p><strong>Teacher:</strong> Good morning, class! My name is Mr. Brown. I'm your English teacher.</p>
  <p><strong>Student:</strong> Good morning, Mr. Brown!</p>
  <p><strong>Teacher:</strong> What is your name?</p>
  <p><strong>Student:</strong> My name is Sofia. I'm from Morocco.</p>
  <p><strong>Teacher:</strong> Welcome, Sofia! Are you a new student?</p>
  <p><strong>Student:</strong> Yes, I am. I'm in Year 10.</p>
</div>
<hr/>
<h4>Traduction</h4>
<p><strong>Professeur :</strong> Bonjour, la classe ! Je m'appelle M. Brown. Je suis votre professeur d'anglais.</p>
<p><strong>Élève :</strong> Bonjour, M. Brown !</p>
<p><strong>Professeur :</strong> Comment vous appelez-vous ?</p>
<p><strong>Élève :</strong> Je m'appelle Sofia. Je viens du Maroc.</p>
<p><strong>Professeur :</strong> Bienvenue, Sofia ! Vous êtes un nouvel élève ?</p>
<p><strong>Élève :</strong> Oui. Je suis en 4ème.</p>`,
      },
      {
        id: 'en-m1-p4',
        type: 'vocabulary',
        title: 'Vocabulaire — Se présenter',
        content: `<h3>📚 Vocabulaire essentiel</h3>
<table>
  <thead><tr><th>Anglais</th><th>Français</th><th>Prononciation</th></tr></thead>
  <tbody>
    <tr><td><strong>Hello / Hi</strong></td><td>Bonjour / Salut</td><td>/həˈloʊ/ /haɪ/</td></tr>
    <tr><td><strong>Good morning</strong></td><td>Bonjour (matin)</td><td>/ɡʊd ˈmɔːrnɪŋ/</td></tr>
    <tr><td><strong>Good afternoon</strong></td><td>Bonjour (après-midi)</td><td>/ɡʊd ˌæftərˈnuːn/</td></tr>
    <tr><td><strong>Good evening</strong></td><td>Bonsoir</td><td>/ɡʊd ˈiːvnɪŋ/</td></tr>
    <tr><td><strong>Goodbye / Bye</strong></td><td>Au revoir</td><td>/ɡʊdˈbaɪ/</td></tr>
    <tr><td><strong>My name is…</strong></td><td>Je m'appelle…</td><td>/maɪ neɪm ɪz/</td></tr>
    <tr><td><strong>I'm from…</strong></td><td>Je viens de…</td><td>/aɪm frɒm/</td></tr>
    <tr><td><strong>I'm … years old</strong></td><td>J'ai … ans</td><td>/aɪm … jɪərz oʊld/</td></tr>
    <tr><td><strong>Nice to meet you</strong></td><td>Enchanté(e)</td><td>/naɪs tə miːt juː/</td></tr>
    <tr><td><strong>How are you?</strong></td><td>Comment vas-tu ?</td><td>/haʊ ɑːr juː/</td></tr>
    <tr><td><strong>I'm fine, thanks</strong></td><td>Je vais bien, merci</td><td>/aɪm faɪn θæŋks/</td></tr>
    <tr><td><strong>Please / Thank you</strong></td><td>S'il vous plaît / Merci</td><td>/pliːz/ /θæŋk juː/</td></tr>
  </tbody>
</table>`,
      },
      {
        id: 'en-m1-p5',
        type: 'grammar',
        title: 'Grammaire — Le verbe TO BE',
        content: `<h3>📖 Le verbe <em>to be</em> (être) au présent</h3>
<table>
  <thead><tr><th>Pronom</th><th>Forme complète</th><th>Forme contractée</th><th>Traduction</th></tr></thead>
  <tbody>
    <tr><td>I</td><td>I am</td><td>I'm</td><td>Je suis</td></tr>
    <tr><td>You</td><td>You are</td><td>You're</td><td>Tu es / Vous êtes</td></tr>
    <tr><td>He</td><td>He is</td><td>He's</td><td>Il est</td></tr>
    <tr><td>She</td><td>She is</td><td>She's</td><td>Elle est</td></tr>
    <tr><td>It</td><td>It is</td><td>It's</td><td>C'est (neutre)</td></tr>
    <tr><td>We</td><td>We are</td><td>We're</td><td>Nous sommes</td></tr>
    <tr><td>They</td><td>They are</td><td>They're</td><td>Ils/Elles sont</td></tr>
  </tbody>
</table>
<h4>Forme négative</h4>
<p>Ajoutez <strong>not</strong> après le verbe :</p>
<ul>
  <li>I am <strong>not</strong> French. → I'm <strong>not</strong> French.</li>
  <li>He is <strong>not</strong> a student. → He <strong>isn't</strong> a student.</li>
</ul>
<h4>Forme interrogative</h4>
<p>Inversez le sujet et le verbe :</p>
<ul>
  <li><strong>Are</strong> you French? — Yes, I am. / No, I'm not.</li>
  <li><strong>Is</strong> she a teacher? — Yes, she is. / No, she isn't.</li>
</ul>`,
      },
      {
        id: 'en-m1-p6',
        type: 'exercises',
        title: 'Exercices — Module 1',
        content: `<h3>✏️ Exercices</h3>
<h4>Exercice 1 — Complétez avec la bonne forme de <em>to be</em></h4>
<ol>
  <li>I ___ fifteen years old. (am / is / are)</li>
  <li>She ___ from England. (am / is / are)</li>
  <li>We ___ students. (am / is / are)</li>
  <li>They ___ not French. (am / is / are)</li>
  <li>___ you a new student? (Am / Is / Are)</li>
</ol>
<h4>Exercice 2 — Traduisez en anglais</h4>
<ol>
  <li>Je m'appelle Karim.</li>
  <li>J'ai quatorze ans.</li>
  <li>Je viens du Maroc.</li>
  <li>Enchanté de vous rencontrer.</li>
  <li>Elle n'est pas professeur.</li>
</ol>
<h4>Exercice 3 — Posez la question</h4>
<p>Exemple : She is French. → <em>Is she French?</em></p>
<ol>
  <li>He is a student.</li>
  <li>They are from England.</li>
  <li>You are sixteen.</li>
</ol>`,
      },
      {
        id: 'en-m1-p7',
        type: 'bilan',
        title: 'Bilan — Module 1',
        content: `<h3>✅ Bilan du Module 1</h3>
<h4>Ce que vous avez appris :</h4>
<ul>
  <li>✅ Les salutations : Hello, Good morning, Goodbye…</li>
  <li>✅ Se présenter : My name is… / I'm from… / I'm … years old</li>
  <li>✅ Le verbe <em>to be</em> (forme affirmative, négative, interrogative)</li>
  <li>✅ Vocabulaire de base : les nationalités, les salutations</li>
</ul>
<h4>Auto-évaluation</h4>
<p>Pouvez-vous :</p>
<ul>
  <li>☐ Dire bonjour et au revoir en anglais ?</li>
  <li>☐ Vous présenter en 3 phrases ?</li>
  <li>☐ Demander et donner l'âge de quelqu'un ?</li>
  <li>☐ Conjuguer <em>to be</em> à toutes les personnes ?</li>
</ul>
<p><strong>Prochain module :</strong> La famille et le domicile 🏠</p>`,
      },
    ],
  },

  {
    titre:       'Anglais A1 — Module 2 · La famille et la maison (Pistes 11–20)',
    cours_nom:   'Anglais A1',
    description: 'Deuxième module du cours d\'anglais A1. Apprenez à parler de votre famille, décrire votre maison et utiliser les adjectifs possessifs en anglais.',
    langue:      'en',
    categorie:   'anglais',
    section:     'langues',
    niveau:      'A1',
    course_type: 'audio',
    pages: [
      {
        id: 'en-m2-p1', type: 'intro', title: 'Introduction',
        content: `<h2>Module 2 — La famille et la maison</h2>
<p>Dans ce module, vous allez apprendre à :</p>
<ul>
  <li>Parler de votre famille en anglais</li>
  <li>Décrire les membres de votre famille</li>
  <li>Présenter votre maison et les pièces</li>
  <li>Utiliser les adjectifs possessifs : my, your, his, her…</li>
</ul>
<p><strong>Mots-clés :</strong> family · mother · father · brother · sister · house · bedroom · kitchen</p>`,
      },
      {
        id: 'en-m2-p2', type: 'audio', title: 'Dialogue — My family',
        piste_numero: 11,
        transcript: `<h3>🎧 Écoutez le dialogue (Piste 11)</h3>
<div class="dialogue">
  <p><strong>Tom:</strong> Look! This is a photo of my family.</p>
  <p><strong>Sara:</strong> Oh nice! Who is this?</p>
  <p><strong>Tom:</strong> This is my mother. Her name is Mary. And this is my father, John.</p>
  <p><strong>Sara:</strong> Do you have brothers or sisters?</p>
  <p><strong>Tom:</strong> Yes! I have one brother and two sisters. My brother is twelve and my sisters are eight and ten.</p>
  <p><strong>Sara:</strong> What a big family!</p>
</div>
<hr/>
<h4>Traduction</h4>
<p><strong>Tom :</strong> Regarde ! C'est une photo de ma famille.</p>
<p><strong>Sara :</strong> Oh sympa ! C'est qui ça ?</p>
<p><strong>Tom :</strong> C'est ma mère. Elle s'appelle Mary. Et voici mon père, John.</p>
<p><strong>Sara :</strong> Tu as des frères ou des sœurs ?</p>
<p><strong>Tom :</strong> Oui ! J'ai un frère et deux sœurs. Mon frère a douze ans et mes sœurs ont huit et dix ans.</p>
<p><strong>Sara :</strong> Quelle grande famille !</p>`,
      },
      {
        id: 'en-m2-p3', type: 'vocabulary', title: 'Vocabulaire — La famille',
        content: `<h3>📚 La famille (Family)</h3>
<table>
  <thead><tr><th>Anglais</th><th>Français</th></tr></thead>
  <tbody>
    <tr><td>mother / mum</td><td>mère / maman</td></tr>
    <tr><td>father / dad</td><td>père / papa</td></tr>
    <tr><td>brother</td><td>frère</td></tr>
    <tr><td>sister</td><td>sœur</td></tr>
    <tr><td>grandma / grandmother</td><td>grand-mère / mamie</td></tr>
    <tr><td>grandpa / grandfather</td><td>grand-père / papy</td></tr>
    <tr><td>aunt</td><td>tante</td></tr>
    <tr><td>uncle</td><td>oncle</td></tr>
    <tr><td>cousin</td><td>cousin(e)</td></tr>
    <tr><td>baby</td><td>bébé</td></tr>
  </tbody>
</table>
<h3>📚 La maison (The house)</h3>
<table>
  <thead><tr><th>Anglais</th><th>Français</th></tr></thead>
  <tbody>
    <tr><td>bedroom</td><td>chambre</td></tr>
    <tr><td>kitchen</td><td>cuisine</td></tr>
    <tr><td>living room</td><td>salon</td></tr>
    <tr><td>bathroom</td><td>salle de bain</td></tr>
    <tr><td>garden</td><td>jardin</td></tr>
  </tbody>
</table>`,
      },
      {
        id: 'en-m2-p4', type: 'grammar', title: 'Grammaire — Adjectifs possessifs',
        content: `<h3>📖 Les adjectifs possessifs</h3>
<table>
  <thead><tr><th>Pronom</th><th>Adjectif possessif</th><th>Exemple</th></tr></thead>
  <tbody>
    <tr><td>I</td><td><strong>my</strong></td><td>My brother is tall.</td></tr>
    <tr><td>You</td><td><strong>your</strong></td><td>Your sister is nice.</td></tr>
    <tr><td>He</td><td><strong>his</strong></td><td>His father is a doctor.</td></tr>
    <tr><td>She</td><td><strong>her</strong></td><td>Her mother is a teacher.</td></tr>
    <tr><td>We</td><td><strong>our</strong></td><td>Our house is big.</td></tr>
    <tr><td>They</td><td><strong>their</strong></td><td>Their family is large.</td></tr>
  </tbody>
</table>
<p>⚠️ En anglais, l'adjectif possessif ne s'accorde PAS avec le nom qui suit :</p>
<ul>
  <li>my brother / my sister (pas de différence)</li>
  <li>his mother / his father (invariable)</li>
</ul>`,
      },
      {
        id: 'en-m2-p5', type: 'exercises', title: 'Exercices — Module 2',
        content: `<h3>✏️ Exercices</h3>
<h4>Exercice 1 — Complétez avec l'adjectif possessif</h4>
<ol>
  <li>I have a sister. ___ name is Anna.</li>
  <li>Tom has a dog. ___ dog is small.</li>
  <li>We love ___ grandmother.</li>
  <li>Do you like ___ bedroom?</li>
  <li>They live in ___ house near the school.</li>
</ol>
<h4>Exercice 2 — Vrai ou faux ?</h4>
<p><em>Relisez le dialogue et répondez :</em></p>
<ol>
  <li>Tom's mother is called Mary. (True / False)</li>
  <li>Tom has two brothers. (True / False)</li>
  <li>Tom's sisters are six and eight. (True / False)</li>
</ol>
<h4>Exercice 3 — Décrivez votre famille</h4>
<p>Écrivez 4 phrases sur votre famille en utilisant les adjectifs possessifs.</p>`,
      },
      {
        id: 'en-m2-p6', type: 'bilan', title: 'Bilan — Module 2',
        content: `<h3>✅ Bilan du Module 2</h3>
<ul>
  <li>✅ Vocabulaire de la famille : mother, father, brother, sister…</li>
  <li>✅ Vocabulaire de la maison : bedroom, kitchen, living room…</li>
  <li>✅ Adjectifs possessifs : my, your, his, her, our, their</li>
</ul>
<p><strong>Prochain module :</strong> La vie quotidienne ⏰</p>`,
      },
    ],
  },

  {
    titre:       'Anglais A1 — Module 3 · La vie quotidienne (Pistes 21–30)',
    cours_nom:   'Anglais A1',
    description: 'Troisième module. Apprenez à parler de votre journée, les activités quotidiennes et l\'heure en anglais. Verbes d\'action au présent simple.',
    langue:      'en',
    categorie:   'anglais',
    section:     'langues',
    niveau:      'A1',
    course_type: 'audio',
    pages: [
      { id: 'en-m3-p1', type: 'intro', title: 'Introduction',
        content: `<h2>Module 3 — La vie quotidienne</h2><ul><li>Décrire votre routine quotidienne</li><li>Dire l'heure en anglais</li><li>Utiliser le présent simple (affirmation, négation, question)</li><li>Fréquences : always, often, sometimes, never</li></ul><p><strong>Mots-clés :</strong> wake up · have breakfast · go to school · study · have lunch · play · sleep</p>` },
      { id: 'en-m3-p2', type: 'audio', title: 'Dialogue — A typical day',
        piste_numero: 21,
        transcript: `<h3>🎧 Piste 21</h3><div class="dialogue"><p><strong>Maya:</strong> What time do you wake up?</p><p><strong>Jack:</strong> I wake up at seven o'clock. Then I have breakfast at half past seven.</p><p><strong>Maya:</strong> Do you walk to school?</p><p><strong>Jack:</strong> No, I don't. I take the bus. School starts at eight thirty.</p><p><strong>Maya:</strong> What do you do after school?</p><p><strong>Jack:</strong> I usually play football with my friends. Then I do my homework and have dinner with my family.</p></div><hr/><h4>Traduction</h4><p>Maya : À quelle heure tu te lèves ? Jack : Je me lève à sept heures. Puis je prends le petit-déjeuner à sept heures et demie. Maya : Tu vas à l'école à pied ? Jack : Non. Je prends le bus. L'école commence à huit heures trente. Maya : Qu'est-ce que tu fais après l'école ? Jack : Je joue généralement au football avec mes amis. Puis je fais mes devoirs et dîne avec ma famille.</p>` },
      { id: 'en-m3-p3', type: 'vocabulary', title: 'Vocabulaire — La routine',
        content: `<h3>📚 Activités quotidiennes</h3><table><thead><tr><th>Anglais</th><th>Français</th></tr></thead><tbody><tr><td>wake up</td><td>se lever</td></tr><tr><td>have breakfast</td><td>prendre le petit-déjeuner</td></tr><tr><td>go to school</td><td>aller à l'école</td></tr><tr><td>study</td><td>étudier</td></tr><tr><td>have lunch</td><td>déjeuner</td></tr><tr><td>play</td><td>jouer</td></tr><tr><td>do homework</td><td>faire ses devoirs</td></tr><tr><td>have dinner</td><td>dîner</td></tr><tr><td>go to bed</td><td>se coucher</td></tr></tbody></table><h3>L'heure</h3><ul><li>7:00 → seven o'clock</li><li>7:30 → half past seven</li><li>7:15 → quarter past seven</li><li>7:45 → quarter to eight</li></ul>` },
      { id: 'en-m3-p4', type: 'grammar', title: 'Grammaire — Présent simple',
        content: `<h3>📖 Le présent simple</h3><p>Utilisé pour les habitudes et routines.</p><table><thead><tr><th>Forme</th><th>Exemple</th></tr></thead><tbody><tr><td>Affirmative</td><td>I <strong>wake up</strong> at 7. / She <strong>wakes up</strong> at 7.</td></tr><tr><td>Négative</td><td>I <strong>don't</strong> walk to school. / He <strong>doesn't</strong> play football.</td></tr><tr><td>Interrogative</td><td><strong>Do</strong> you walk? / <strong>Does</strong> she play?</td></tr></tbody></table><p>⚠️ À la 3ème personne du singulier (he/she/it), on ajoute <strong>-s</strong> au verbe !</p>` },
      { id: 'en-m3-p5', type: 'exercises', title: 'Exercices — Module 3',
        content: `<h3>✏️ Exercices</h3><h4>Exercice 1 — Présent simple</h4><ol><li>She ___ (wake up) at 6 o'clock.</li><li>They ___ (not / have) lunch at school.</li><li>___ you ___ (go) to bed late?</li></ol><h4>Exercice 2 — L'heure</h4><p>Écrivez en anglais : 8h15, 12h30, 6h45, 9h00</p><h4>Exercice 3 — Ma routine</h4><p>Décrivez votre journée typique en 5 phrases au présent simple.</p>` },
      { id: 'en-m3-p6', type: 'bilan', title: 'Bilan — Module 3',
        content: `<h3>✅ Bilan du Module 3</h3><ul><li>✅ Vocabulaire de la routine quotidienne</li><li>✅ Dire l'heure : o'clock, half past, quarter past/to</li><li>✅ Présent simple : affirmation, négation, question</li><li>✅ 3ème personne singulier → ajouter -s</li></ul><p><strong>Prochain module :</strong> Les courses et la nourriture 🛒</p>` },
      ],
  },

  {
    titre:       'Anglais A1 — Module 4 · Les courses et la nourriture (Pistes 31–40)',
    cours_nom:   'Anglais A1',
    description: 'Quatrième module. Apprenez à faire les courses, commander au restaurant et parler de vos aliments préférés en anglais. Dénombrable et indénombrable.',
    langue:      'en',
    categorie:   'anglais',
    section:     'langues',
    niveau:      'A1',
    course_type: 'audio',
    pages: [
      { id: 'en-m4-p1', type: 'intro', title: 'Introduction',
        content: `<h2>Module 4 — Les courses et la nourriture</h2><ul><li>Nommer les aliments courants en anglais</li><li>Faire les courses : quantités, prix</li><li>Commander au café/restaurant</li><li>Dénombrable (countable) vs indénombrable (uncountable)</li><li>Some / Any / How much / How many</li></ul>` },
      { id: 'en-m4-p2', type: 'audio', title: 'Dialogue — At the market',
        piste_numero: 31,
        transcript: `<h3>🎧 Piste 31</h3><div class="dialogue"><p><strong>Customer:</strong> Good morning! Can I have some apples, please?</p><p><strong>Vendor:</strong> Of course! How many would you like?</p><p><strong>Customer:</strong> Six apples, please. And do you have any oranges?</p><p><strong>Vendor:</strong> Yes, we do. They're very fresh today!</p><p><strong>Customer:</strong> Great! I'll take a kilo. How much is that?</p><p><strong>Vendor:</strong> That's two pounds fifty, please.</p></div><hr/><h4>Traduction</h4><p>Client : Bonjour ! Je peux avoir des pommes, s'il vous plaît ? Vendeur : Bien sûr ! Combien en voulez-vous ? Client : Six pommes, s'il vous plaît. Et vous avez des oranges ? Vendeur : Oui. Elles sont très fraîches aujourd'hui ! Client : Super ! J'en prendrai un kilo. C'est combien ? Vendeur : C'est deux livres cinquante, s'il vous plaît.</p>` },
      { id: 'en-m4-p3', type: 'vocabulary', title: 'Vocabulaire — La nourriture',
        content: `<h3>📚 Les aliments</h3><table><thead><tr><th>Anglais</th><th>Français</th></tr></thead><tbody><tr><td>apple / orange / banana</td><td>pomme / orange / banane</td></tr><tr><td>bread / milk / butter</td><td>pain / lait / beurre</td></tr><tr><td>rice / pasta / meat</td><td>riz / pâtes / viande</td></tr><tr><td>chicken / fish / egg</td><td>poulet / poisson / œuf</td></tr><tr><td>water / juice / coffee / tea</td><td>eau / jus / café / thé</td></tr><tr><td>sugar / salt / pepper</td><td>sucre / sel / poivre</td></tr></tbody></table>` },
      { id: 'en-m4-p4', type: 'grammar', title: 'Grammaire — Some / Any',
        content: `<h3>📖 Some / Any — Dénombrable / Indénombrable</h3><p><strong>Dénombrable (countable)</strong> = on peut compter : an apple, two apples</p><p><strong>Indénombrable (uncountable)</strong> = on ne peut pas compter : milk, bread, water</p><table><thead><tr><th></th><th>Some</th><th>Any</th></tr></thead><tbody><tr><td>Affirmatif</td><td>I have <strong>some</strong> apples.</td><td>—</td></tr><tr><td>Négatif</td><td>—</td><td>I don't have <strong>any</strong> milk.</td></tr><tr><td>Question</td><td>Would you like <strong>some</strong> tea?</td><td>Do you have <strong>any</strong> eggs?</td></tr></tbody></table><p><strong>How many</strong> + dénombrable : How many apples?</p><p><strong>How much</strong> + indénombrable : How much milk?</p>` },
      { id: 'en-m4-p5', type: 'exercises', title: 'Exercices — Module 4',
        content: `<h3>✏️ Exercices</h3><h4>Some ou Any ?</h4><ol><li>I'd like ___ orange juice.</li><li>Do you have ___ bread?</li><li>There isn't ___ milk in the fridge.</li><li>Can I have ___ apples?</li></ol><h4>How much ou How many ?</h4><ol><li>___ eggs do you need?</li><li>___ sugar is in your coffee?</li><li>___ bananas can I eat?</li></ol>` },
      { id: 'en-m4-p6', type: 'bilan', title: 'Bilan — Module 4',
        content: `<h3>✅ Bilan du Module 4</h3><ul><li>✅ Vocabulaire alimentaire : fruits, légumes, boissons</li><li>✅ Dénombrable vs indénombrable</li><li>✅ Some / Any dans différents contextes</li><li>✅ How much / How many</li></ul><p><strong>Prochain module :</strong> Loisirs et sports 🎾</p>` },
      ],
  },

  {
    titre:       'Anglais A1 — Module 5 · Loisirs et sports (Pistes 41–50)',
    cours_nom:   'Anglais A1',
    description: 'Cinquième module. Parlez de vos loisirs, sports préférés et activités du week-end en anglais. Le présent continu (be + -ing) et l\'expression des goûts.',
    langue:      'en',
    categorie:   'anglais',
    section:     'langues',
    niveau:      'A1',
    course_type: 'audio',
    pages: [
      { id: 'en-m5-p1', type: 'intro', title: 'Introduction',
        content: `<h2>Module 5 — Loisirs et sports</h2><ul><li>Nommer les loisirs et sports courants</li><li>Exprimer vos goûts : like / love / hate / don't like</li><li>Le présent continu : I am playing…</li><li>Différence présent simple vs présent continu</li></ul>` },
      { id: 'en-m5-p2', type: 'audio', title: 'Dialogue — What are you doing?',
        piste_numero: 41,
        transcript: `<h3>🎧 Piste 41</h3><div class="dialogue"><p><strong>Lena:</strong> Hi! What are you doing?</p><p><strong>Max:</strong> I'm watching a football match on TV. My favourite team is playing!</p><p><strong>Lena:</strong> Do you like football?</p><p><strong>Max:</strong> I love it! I play football every Saturday. Do you play sports?</p><p><strong>Lena:</strong> Yes, I like swimming and cycling. But I don't like team sports very much.</p><p><strong>Max:</strong> That's okay! Sport is important for health.</p></div><hr/><h4>Traduction</h4><p>Lena : Salut ! Qu'est-ce que tu fais ? Max : Je regarde un match de foot à la télé. Mon équipe préférée joue ! Lena : Tu aimes le foot ? Max : Je l'adore ! Je joue au foot tous les samedis. Tu fais du sport ? Lena : Oui, j'aime la natation et le cyclisme. Mais je n'aime pas trop les sports d'équipe. Max : C'est bien ! Le sport est important pour la santé.</p>` },
      { id: 'en-m5-p3', type: 'vocabulary', title: 'Vocabulaire — Sports et loisirs',
        content: `<h3>📚 Sports et loisirs</h3><table><thead><tr><th>Anglais</th><th>Français</th></tr></thead><tbody><tr><td>football / soccer</td><td>football</td></tr><tr><td>basketball</td><td>basketball</td></tr><tr><td>swimming</td><td>natation</td></tr><tr><td>cycling</td><td>cyclisme</td></tr><tr><td>tennis</td><td>tennis</td></tr><tr><td>reading</td><td>lecture</td></tr><tr><td>painting</td><td>peinture</td></tr><tr><td>dancing</td><td>danse</td></tr><tr><td>cooking</td><td>cuisine</td></tr><tr><td>gaming</td><td>jeux vidéo</td></tr></tbody></table>` },
      { id: 'en-m5-p4', type: 'grammar', title: 'Grammaire — Présent continu',
        content: `<h3>📖 Le présent continu (be + -ing)</h3><p>Utilisé pour une action <strong>en cours au moment où on parle</strong>.</p><table><thead><tr><th>Forme</th><th>Exemple</th></tr></thead><tbody><tr><td>Affirmative</td><td>I <strong>am playing</strong> football.</td></tr><tr><td>Négative</td><td>She <strong>is not watching</strong> TV.</td></tr><tr><td>Interrogative</td><td><strong>Are</strong> you <strong>reading</strong>?</td></tr></tbody></table><h4>Présent simple vs Présent continu</h4><ul><li>I <strong>play</strong> football every Saturday. (habitude)</li><li>I <strong>am playing</strong> football right now. (maintenant)</li></ul>` },
      { id: 'en-m5-p5', type: 'exercises', title: 'Exercices — Module 5',
        content: `<h3>✏️ Exercices</h3><h4>Présent simple ou continu ?</h4><ol><li>She ___ (read) a book every night. </li><li>Look! They ___ (play) basketball.</li><li>He ___ (not / like) swimming.</li><li>What ___ you ___ (do) right now?</li></ol><h4>Exprimez vos goûts</h4><p>Écrivez 5 phrases en utilisant : love / like / don't like / hate + un sport ou loisir.</p>` },
      { id: 'en-m5-p6', type: 'bilan', title: 'Bilan — Module 5',
        content: `<h3>✅ Bilan du Module 5</h3><ul><li>✅ Vocabulaire des loisirs et sports</li><li>✅ Exprimer les goûts : love, like, don't like, hate</li><li>✅ Présent continu : be + verb-ing</li><li>✅ Différence présent simple / continu</li></ul><p><strong>Prochain module :</strong> La ville et les transports 🏙️</p>` },
      ],
  },

  {
    titre:       'Anglais A1 — Module 6 · La ville et les transports (Pistes 51–60)',
    cours_nom:   'Anglais A1',
    description: 'Sixième module. Orientez-vous en ville, prenez les transports et donnez des directions en anglais. Les prépositions de lieu et les impératifs.',
    langue:      'en',
    categorie:   'anglais',
    section:     'langues',
    niveau:      'A1',
    course_type: 'audio',
    pages: [
      { id: 'en-m6-p1', type: 'intro', title: 'Introduction',
        content: `<h2>Module 6 — La ville et les transports</h2><ul><li>Nommer les lieux en ville</li><li>Demander et donner des directions</li><li>Les moyens de transport</li><li>Les prépositions de lieu : in, on, at, next to, opposite…</li><li>L'impératif pour donner des directions : Turn left / Go straight</li></ul>` },
      { id: 'en-m6-p2', type: 'audio', title: 'Dialogue — Excuse me, where is…?',
        piste_numero: 51,
        transcript: `<h3>🎧 Piste 51</h3><div class="dialogue"><p><strong>Tourist:</strong> Excuse me! Where is the nearest bus stop?</p><p><strong>Local:</strong> It's not far. Go straight ahead, then turn left at the traffic lights.</p><p><strong>Tourist:</strong> Turn left at the traffic lights. OK.</p><p><strong>Local:</strong> Yes. The bus stop is next to the supermarket, opposite the park.</p><p><strong>Tourist:</strong> How far is it?</p><p><strong>Local:</strong> About five minutes on foot.</p><p><strong>Tourist:</strong> Thank you so much!</p></div><hr/><h4>Traduction</h4><p>Touriste : Excusez-moi ! Où est l'arrêt de bus le plus proche ? Local : Ce n'est pas loin. Allez tout droit, puis tournez à gauche aux feux. Touriste : Tourner à gauche aux feux. D'accord. Local : Oui. L'arrêt de bus est à côté du supermarché, en face du parc. Touriste : C'est à quelle distance ? Local : Environ cinq minutes à pied. Touriste : Merci beaucoup !</p>` },
      { id: 'en-m6-p3', type: 'vocabulary', title: 'Vocabulaire — La ville',
        content: `<h3>📚 La ville (The city)</h3><table><thead><tr><th>Anglais</th><th>Français</th></tr></thead><tbody><tr><td>bus stop</td><td>arrêt de bus</td></tr><tr><td>train station</td><td>gare</td></tr><tr><td>supermarket</td><td>supermarché</td></tr><tr><td>hospital</td><td>hôpital</td></tr><tr><td>school</td><td>école</td></tr><tr><td>park</td><td>parc</td></tr><tr><td>pharmacy</td><td>pharmacie</td></tr><tr><td>post office</td><td>bureau de poste</td></tr><tr><td>bank</td><td>banque</td></tr><tr><td>restaurant</td><td>restaurant</td></tr></tbody></table>` },
      { id: 'en-m6-p4', type: 'grammar', title: 'Grammaire — Prépositions et impératif',
        content: `<h3>📖 Prépositions de lieu</h3><ul><li><strong>next to</strong> — à côté de</li><li><strong>opposite</strong> — en face de</li><li><strong>in front of</strong> — devant</li><li><strong>behind</strong> — derrière</li><li><strong>between</strong> — entre</li></ul><h3>Donner des directions (impératif)</h3><ul><li>Go <strong>straight ahead</strong>. — Allez tout droit.</li><li><strong>Turn left / right</strong>. — Tournez à gauche / droite.</li><li><strong>Take</strong> the first street. — Prenez la première rue.</li><li>The bank is <strong>on the left</strong>. — La banque est à gauche.</li></ul>` },
      { id: 'en-m6-p5', type: 'exercises', title: 'Exercices — Module 6',
        content: `<h3>✏️ Exercices</h3><h4>Complétez les directions</h4><ol><li>___ straight ahead and ___ left at the lights.</li><li>The pharmacy is ___ to the school.</li><li>The park is ___ the hospital and the bank.</li></ol><h4>Traduisez</h4><ol><li>L'arrêt de bus est en face du parc.</li><li>Prenez la deuxième rue à droite.</li><li>La banque est à cinq minutes à pied.</li></ol>` },
      { id: 'en-m6-p6', type: 'bilan', title: 'Bilan — Module 6',
        content: `<h3>✅ Bilan du Module 6</h3><ul><li>✅ Lieux en ville : bus stop, hospital, park, bank…</li><li>✅ Prépositions : next to, opposite, between, behind…</li><li>✅ Donner des directions à l'impératif</li><li>✅ Demander son chemin poliment</li></ul><p><strong>Prochain module :</strong> Bilan final et auto-évaluation ✅</p>` },
      ],
  },

  {
    titre:       'Anglais A1 — Bilan et évaluation finale (Pistes 61–69)',
    cours_nom:   'Anglais A1',
    description: 'Module de bilan et d\'évaluation finale du cours d\'anglais A1. Révision de tous les modules, test de compréhension orale et auto-évaluation complète.',
    langue:      'en',
    categorie:   'anglais',
    section:     'langues',
    niveau:      'A1',
    course_type: 'audio',
    pages: [
      { id: 'en-m7-p1', type: 'intro', title: 'Introduction — Bilan A1',
        content: `<h2>Module 7 — Bilan et évaluation</h2><p>Félicitations ! Vous avez terminé les 6 modules du cours d'anglais A1. Ce module final vous permet de :</p><ul><li>Réviser l'ensemble du vocabulaire et de la grammaire</li><li>Tester votre compréhension orale</li><li>Évaluer votre niveau A1 en anglais</li><li>Préparer la suite (niveau A2)</li></ul>` },
      { id: 'en-m7-p2', type: 'audio', title: 'Compréhension orale — Test 1',
        piste_numero: 61,
        transcript: `<h3>🎧 Test de compréhension (Piste 61)</h3><p>Écoutez le dialogue et répondez aux questions :</p><ol><li>What is the girl's name?</li><li>Where is she from?</li><li>How old is she?</li><li>What does she like doing?</li><li>What time does she wake up?</li></ol>` },
      { id: 'en-m7-p3', type: 'audio', title: 'Compréhension orale — Test 2',
        piste_numero: 62,
        transcript: `<h3>🎧 Test de compréhension (Piste 62)</h3><p>Écoutez et choisissez la bonne réponse :</p><ol><li>Where does the man want to go? a) The bank b) The park c) The station</li><li>How does he travel? a) By bus b) On foot c) By train</li><li>How far is it? a) 5 min b) 10 min c) 15 min</li></ol>` },
      { id: 'en-m7-p4', type: 'exercises', title: 'Révision — Grammaire complète',
        content: `<h3>✏️ Révision générale</h3><h4>1. To be — Complétez</h4><ol><li>She ___ a student from Morocco.</li><li>We ___ not at home today.</li><li>___ they your friends?</li></ol><h4>2. Présent simple</h4><ol><li>He ___ (play) football every day.</li><li>I ___ (not / eat) meat.</li><li>___ she ___ (speak) English?</li></ol><h4>3. Présent continu</h4><ol><li>They ___ (watch) a film right now.</li><li>She ___ (not / sleep) — she ___ (read).</li></ol><h4>4. Some / Any — How much / How many</h4><ol><li>I need ___ eggs and ___ milk.</li><li>___ apples are in the basket? — Six.</li></ol>` },
      { id: 'en-m7-p5', type: 'exercises', title: 'Production écrite — Bilan',
        content: `<h3>✏️ Production écrite</h3><h4>Exercice 1 — Présentez-vous</h4><p>Écrivez un paragraphe de 60-80 mots pour vous présenter : nom, âge, nationalité, famille, loisirs, routine quotidienne.</p><h4>Exercice 2 — Décrivez votre ville</h4><p>Écrivez 5 phrases pour décrire votre ville ou quartier en utilisant les prépositions de lieu.</p>` },
      { id: 'en-m7-p6', type: 'bilan', title: 'Auto-évaluation finale — A1 Anglais',
        content: `<h3>🎓 Auto-évaluation A1 — Anglais</h3><p>Je peux :</p><ul><li>☐ Me présenter et présenter quelqu'un</li><li>☐ Parler de ma famille</li><li>☐ Décrire ma routine quotidienne</li><li>☐ Faire les courses et commander à manger</li><li>☐ Parler de mes loisirs et sports</li><li>☐ Me repérer en ville et donner des directions</li><li>☐ Conjuguer <em>to be</em> et le présent simple/continu</li><li>☐ Utiliser some/any, how much/many</li></ul><p><strong>🎉 Félicitations ! Vous avez terminé le niveau A1 d'anglais !</strong></p><p>Continuez avec le niveau A2 pour progresser encore davantage.</p>` },
      ],
  },
];

// ═══════════════════════════════════════════════════════════════════
// COURS D'ARABE — 7 modules (A1 — pour francophones)
// ═══════════════════════════════════════════════════════════════════
const ARABIC_COURSES = [
  {
    titre:       'Arabe A1 — Module 1 · L\'alphabet arabe (الحروف العربية)',
    cours_nom:   'Arabe A1',
    description: 'Premier module du cours d\'arabe A1. Découvrez l\'alphabet arabe, les 28 lettres et leur prononciation. Initiation à l\'écriture de droite à gauche et aux signes diacritiques.',
    langue:      'ar',
    categorie:   'arabe',
    section:     'langues',
    niveau:      'A1',
    course_type: 'audio',
    pages: [
      { id: 'ar-m1-p1', type: 'intro', title: 'Introduction',
        content: `<h2>Module 1 — L'alphabet arabe</h2>
<p>Bienvenue dans le cours d'arabe A1 ! Dans ce premier module, vous allez :</p>
<ul>
  <li>Découvrir les 28 lettres de l'alphabet arabe</li>
  <li>Apprendre la direction d'écriture : <strong>de droite à gauche (←)</strong></li>
  <li>Comprendre les formes initiale, médiane, finale et isolée de chaque lettre</li>
  <li>Découvrir les voyelles courtes (harakat) : fatha, kasra, damma</li>
</ul>
<p>⚠️ L'arabe s'écrit et se lit de droite à gauche. Prenez le temps de vous y habituer !</p>` },
      { id: 'ar-m1-p2', type: 'audio', title: 'Écoute — L\'alphabet (الأبجدية)',
        piste_numero: 1,
        transcript: `<h3>🎧 Écoutez l'alphabet arabe (Piste 1)</h3>
<div dir="rtl" style="font-size:1.4em;line-height:2.5">
<p>أ - ب - ت - ث - ج - ح - خ - د - ذ - ر - ز - س - ش - ص - ض - ط - ظ - ع - غ - ف - ق - ك - ل - م - ن - ه - و - ي</p>
</div>
<h4>Tableau de l'alphabet</h4>
<table><thead><tr><th>Lettre</th><th>Nom (arabe)</th><th>Nom (français)</th><th>Son</th></tr></thead>
<tbody>
<tr><td style="font-size:1.5em;direction:rtl">أ</td><td dir="rtl">أَلِف</td><td>Alif</td><td>/a/</td></tr>
<tr><td style="font-size:1.5em;direction:rtl">ب</td><td dir="rtl">بَاء</td><td>Baa</td><td>/b/</td></tr>
<tr><td style="font-size:1.5em;direction:rtl">ت</td><td dir="rtl">تَاء</td><td>Taa</td><td>/t/</td></tr>
<tr><td style="font-size:1.5em;direction:rtl">ث</td><td dir="rtl">ثَاء</td><td>Thaa</td><td>/θ/ (th anglais)</td></tr>
<tr><td style="font-size:1.5em;direction:rtl">ج</td><td dir="rtl">جِيم</td><td>Jiim</td><td>/dʒ/</td></tr>
<tr><td style="font-size:1.5em;direction:rtl">ح</td><td dir="rtl">حَاء</td><td>Haa</td><td>/ħ/ (h gutturale)</td></tr>
<tr><td style="font-size:1.5em;direction:rtl">خ</td><td dir="rtl">خَاء</td><td>Khaa</td><td>/x/ (comme "jota" espagnol)</td></tr>
<tr><td style="font-size:1.5em;direction:rtl">د</td><td dir="rtl">دَال</td><td>Daal</td><td>/d/</td></tr>
<tr><td style="font-size:1.5em;direction:rtl">ر</td><td dir="rtl">رَاء</td><td>Raa</td><td>/r/ (roulé)</td></tr>
<tr><td style="font-size:1.5em;direction:rtl">س</td><td dir="rtl">سِين</td><td>Siin</td><td>/s/</td></tr>
<tr><td style="font-size:1.5em;direction:rtl">ع</td><td dir="rtl">عَيْن</td><td>Ayn</td><td>/ʕ/ (son guttural unique)</td></tr>
<tr><td style="font-size:1.5em;direction:rtl">م</td><td dir="rtl">مِيم</td><td>Miim</td><td>/m/</td></tr>
<tr><td style="font-size:1.5em;direction:rtl">ن</td><td dir="rtl">نُون</td><td>Nuun</td><td>/n/</td></tr>
</tbody></table>` },
      { id: 'ar-m1-p3', type: 'vocabulary', title: 'Les voyelles — الحركات',
        content: `<h3>📚 Les voyelles courtes (الحركات)</h3>
<p>En arabe, les voyelles courtes sont des signes diacritiques placés au-dessus ou en dessous des lettres :</p>
<table><thead><tr><th>Signe</th><th>Nom</th><th>Son</th><th>Exemple</th></tr></thead>
<tbody>
<tr><td style="font-size:1.5em;direction:rtl">َ</td><td>Fatha</td><td>/a/</td><td dir="rtl">كَتَبَ</td></tr>
<tr><td style="font-size:1.5em;direction:rtl">ِ</td><td>Kasra</td><td>/i/</td><td dir="rtl">كِتَاب</td></tr>
<tr><td style="font-size:1.5em;direction:rtl">ُ</td><td>Damma</td><td>/u/</td><td dir="rtl">كُتُب</td></tr>
<tr><td style="font-size:1.5em;direction:rtl">ْ</td><td>Sukun</td><td>(pas de voyelle)</td><td dir="rtl">كَلْب</td></tr>
</tbody></table>
<p>💡 Dans les textes courants, les voyelles ne sont souvent pas écrites. On les apprend avec la pratique.</p>` },
      { id: 'ar-m1-p4', type: 'grammar', title: 'Grammaire — Les formes des lettres',
        content: `<h3>📖 Les 4 formes de chaque lettre</h3>
<p>En arabe, chaque lettre peut prendre 4 formes selon sa position dans le mot :</p>
<table><thead><tr><th>Lettre</th><th>Isolée</th><th>Initiale</th><th>Médiane</th><th>Finale</th></tr></thead>
<tbody>
<tr><td>Baa (ب)</td><td dir="rtl" style="font-size:1.3em">ب</td><td dir="rtl" style="font-size:1.3em">بـ</td><td dir="rtl" style="font-size:1.3em">ـبـ</td><td dir="rtl" style="font-size:1.3em">ـب</td></tr>
<tr><td>Miim (م)</td><td dir="rtl" style="font-size:1.3em">م</td><td dir="rtl" style="font-size:1.3em">مـ</td><td dir="rtl" style="font-size:1.3em">ـمـ</td><td dir="rtl" style="font-size:1.3em">ـم</td></tr>
<tr><td>Nuun (ن)</td><td dir="rtl" style="font-size:1.3em">ن</td><td dir="rtl" style="font-size:1.3em">نـ</td><td dir="rtl" style="font-size:1.3em">ـنـ</td><td dir="rtl" style="font-size:1.3em">ـن</td></tr>
</tbody></table>
<p>⚠️ Certaines lettres (comme dal د et ra ر) ne se lient qu'à gauche — elles n'ont pas de forme initiale/médiane liée.</p>` },
      { id: 'ar-m1-p5', type: 'exercises', title: 'Exercices — Module 1',
        content: `<h3>✏️ Exercices</h3>
<h4>Exercice 1 — Identifiez les lettres</h4>
<p>Écrivez le nom de chaque lettre :</p>
<p dir="rtl" style="font-size:1.5em">ب &nbsp; س &nbsp; م &nbsp; ن &nbsp; ر &nbsp; ع</p>
<h4>Exercice 2 — Lisez ces mots</h4>
<p dir="rtl" style="font-size:1.3em">بَاب &nbsp;·&nbsp; سَمَك &nbsp;·&nbsp; نَار &nbsp;·&nbsp; مَاء</p>
<p>(Aide : بَاب = porte, سَمَك = poisson, نَار = feu, مَاء = eau)</p>
<h4>Exercice 3 — Écrivez</h4>
<p>Essayez d'écrire votre prénom en lettres arabes !</p>` },
      { id: 'ar-m1-p6', type: 'bilan', title: 'Bilan — Module 1',
        content: `<h3>✅ Bilan du Module 1</h3>
<ul>
  <li>✅ Les 28 lettres de l'alphabet arabe</li>
  <li>✅ Direction d'écriture : droite à gauche</li>
  <li>✅ Les 3 voyelles courtes : fatha (a), kasra (i), damma (u)</li>
  <li>✅ Les 4 formes des lettres selon leur position</li>
</ul>
<p><strong>Prochain module :</strong> Se saluer et se présenter en arabe 👋</p>` },
      ],
  },

  {
    titre:       'Arabe A1 — Module 2 · Les salutations (التحيات والتعارف)',
    cours_nom:   'Arabe A1',
    description: 'Deuxième module. Apprenez à saluer, vous présenter et échanger des politesses en arabe standard. Les pronoms personnels et le verbe être en arabe.',
    langue:      'ar',
    categorie:   'arabe',
    section:     'langues',
    niveau:      'A1',
    course_type: 'audio',
    pages: [
      { id: 'ar-m2-p1', type: 'intro', title: 'Introduction',
        content: `<h2>Module 2 — Les salutations en arabe</h2>
<ul>
  <li>Dire bonjour, bonsoir, au revoir en arabe</li>
  <li>Se présenter : nom, prénom, nationalité, âge</li>
  <li>Les formules de politesse islamiques</li>
  <li>Les pronoms personnels : أَنَا / أَنْتَ / هُوَ / هِيَ</li>
</ul>` },
      { id: 'ar-m2-p2', type: 'audio', title: 'Dialogue — مرحباً !',
        piste_numero: 11,
        transcript: `<h3>🎧 Écoutez le dialogue (Piste 11)</h3>
<div dir="rtl" style="line-height:2.2;font-size:1.1em">
<p><strong>أحمد:</strong> السَّلَامُ عَلَيْكُمْ!</p>
<p><strong>سارة:</strong> وَعَلَيْكُمُ السَّلَام! كَيْفَ حَالُكَ؟</p>
<p><strong>أحمد:</strong> بِخَيْر، شُكْراً. وَأَنْتِ؟</p>
<p><strong>سارة:</strong> أَنَا بِخَيْر أَيْضاً، الحَمْدُ لِلَّه. مَا اسْمُكَ؟</p>
<p><strong>أحمد:</strong> اسْمِي أَحْمَد. وَأَنْتِ، مَا اسْمُكِ؟</p>
<p><strong>سارة:</strong> اسْمِي سَارَة. أَهْلاً وَسَهْلاً يَا أَحْمَد!</p>
<p><strong>أحمد:</strong> أَهْلاً بِكِ يَا سَارَة!</p>
</div>
<hr/>
<h4>Traduction et translittération</h4>
<table><thead><tr><th>Arabe</th><th>Translittération</th><th>Traduction</th></tr></thead>
<tbody>
<tr><td dir="rtl">السَّلَامُ عَلَيْكُمْ</td><td>Assalamu alaykum</td><td>Que la paix soit sur vous</td></tr>
<tr><td dir="rtl">وَعَلَيْكُمُ السَّلَام</td><td>Wa alaykum assalam</td><td>Et sur vous la paix (réponse)</td></tr>
<tr><td dir="rtl">كَيْفَ حَالُكَ؟</td><td>Kayfa haluk?</td><td>Comment vas-tu ? (masc.)</td></tr>
<tr><td dir="rtl">بِخَيْر، شُكْراً</td><td>Bikhayr, shukran</td><td>Bien, merci</td></tr>
<tr><td dir="rtl">مَا اسْمُكَ؟</td><td>Ma ismuk?</td><td>Quel est ton nom ? (masc.)</td></tr>
<tr><td dir="rtl">اسْمِي…</td><td>Ismi…</td><td>Je m'appelle…</td></tr>
<tr><td dir="rtl">أَهْلاً وَسَهْلاً</td><td>Ahlan wa sahlan</td><td>Bienvenue / Enchanté</td></tr>
</tbody></table>` },
      { id: 'ar-m2-p3', type: 'vocabulary', title: 'Vocabulaire — Les salutations',
        content: `<h3>📚 Les salutations et formules de politesse</h3>
<table><thead><tr><th>Arabe</th><th>Translittération</th><th>Français</th></tr></thead>
<tbody>
<tr><td dir="rtl">صَبَاحُ الخَيْر</td><td>Sabah al-khayr</td><td>Bonjour (matin)</td></tr>
<tr><td dir="rtl">صَبَاحُ النُّور</td><td>Sabah an-nur</td><td>Bonjour (réponse)</td></tr>
<tr><td dir="rtl">مَسَاءُ الخَيْر</td><td>Masa' al-khayr</td><td>Bonsoir</td></tr>
<tr><td dir="rtl">مَعَ السَّلَامَة</td><td>Ma'a s-salama</td><td>Au revoir</td></tr>
<tr><td dir="rtl">شُكْراً</td><td>Shukran</td><td>Merci</td></tr>
<tr><td dir="rtl">عَفْواً</td><td>Afwan</td><td>De rien / Pardon</td></tr>
<tr><td dir="rtl">مِنْ فَضْلِكَ</td><td>Min fadlak</td><td>S'il te plaît (masc.)</td></tr>
<tr><td dir="rtl">نَعَم / لَا</td><td>Na'am / Laa</td><td>Oui / Non</td></tr>
</tbody></table>` },
      { id: 'ar-m2-p4', type: 'grammar', title: 'Grammaire — Pronoms et phrases nominales',
        content: `<h3>📖 Les pronoms personnels</h3>
<table><thead><tr><th>Arabe</th><th>Translittération</th><th>Français</th></tr></thead>
<tbody>
<tr><td dir="rtl">أَنَا</td><td>Ana</td><td>Je / Moi</td></tr>
<tr><td dir="rtl">أَنْتَ</td><td>Anta</td><td>Tu / Toi (masc.)</td></tr>
<tr><td dir="rtl">أَنْتِ</td><td>Anti</td><td>Tu / Toi (fém.)</td></tr>
<tr><td dir="rtl">هُوَ</td><td>Huwa</td><td>Il / Lui</td></tr>
<tr><td dir="rtl">هِيَ</td><td>Hiya</td><td>Elle</td></tr>
<tr><td dir="rtl">نَحْنُ</td><td>Nahnu</td><td>Nous</td></tr>
</tbody></table>
<h4>La phrase nominale (pas de verbe "être")</h4>
<p>En arabe, on n'utilise pas le verbe "être" au présent !</p>
<p dir="rtl">أَنَا طَالِب = Je suis étudiant (litt. "Moi étudiant")</p>
<p dir="rtl">هِيَ مُدَرِّسَة = Elle est professeur</p>` },
      { id: 'ar-m2-p5', type: 'exercises', title: 'Exercices — Module 2',
        content: `<h3>✏️ Exercices</h3>
<h4>Exercice 1 — Complétez le dialogue</h4>
<p>Complétez avec les mots appropriés :</p>
<p dir="rtl">أ: السَّلَامُ عَلَيْكُمْ!<br/>ب: _______ السَّلَام!<br/>أ: كَيْفَ _______؟<br/>ب: _______, شُكْراً.</p>
<h4>Exercice 2 — Traduisez en arabe</h4>
<ol>
  <li>Je m'appelle Yasmine.</li>
  <li>Bonjour ! Comment vas-tu ?</li>
  <li>Merci, au revoir.</li>
</ol>
<h4>Exercice 3 — Présentez-vous</h4>
<p>Écrivez 3 phrases pour vous présenter en arabe (nom + nationalité + situation).</p>` },
      { id: 'ar-m2-p6', type: 'bilan', title: 'Bilan — Module 2',
        content: `<h3>✅ Bilan du Module 2</h3>
<ul>
  <li>✅ Salutations : السلام عليكم, صباح الخير, مساء الخير…</li>
  <li>✅ Se présenter : اسمي… / أنا من…</li>
  <li>✅ Pronoms personnels : أنا / أنتَ / أنتِ / هو / هي</li>
  <li>✅ La phrase nominale en arabe (sans verbe être)</li>
</ul>
<p><strong>Prochain module :</strong> La famille 👨‍👩‍👧</p>` },
      ],
  },

  {
    titre:       'Arabe A1 — Module 3 · La famille (الأسرة)',
    cours_nom:   'Arabe A1',
    description: 'Troisième module. Apprenez le vocabulaire de la famille en arabe, les adjectifs possessifs et la distinction masculin/féminin (genre grammatical en arabe).',
    langue:      'ar',
    categorie:   'arabe',
    section:     'langues',
    niveau:      'A1',
    course_type: 'audio',
    pages: [
      { id: 'ar-m3-p1', type: 'intro', title: 'Introduction',
        content: `<h2>Module 3 — La famille en arabe</h2><ul><li>Nommer les membres de la famille</li><li>Parler de votre famille</li><li>Le genre (masculin/féminin) en arabe</li><li>Les suffixes possessifs : -ي / -كَ / -هُ / -هَا</li></ul>` },
      { id: 'ar-m3-p2', type: 'audio', title: 'Dialogue — عَائِلَتِي',
        piste_numero: 21,
        transcript: `<h3>🎧 Écoutez (Piste 21)</h3>
<div dir="rtl" style="line-height:2.2;font-size:1.1em">
<p><strong>مريم:</strong> هَذِهِ صُورَةُ عَائِلَتِي.</p>
<p><strong>خالد:</strong> مَنْ هَذَا؟</p>
<p><strong>مريم:</strong> هَذَا أَبِي. اسْمُهُ يُوسُف. وَهَذِهِ أُمِّي، اسْمُهَا فَاطِمَة.</p>
<p><strong>خالد:</strong> هَلْ عِنْدَكِ إِخْوَة؟</p>
<p><strong>مريم:</strong> نَعَم، عِنْدِي أَخٌ وَأُخْتَان. أَخِي اسْمُهُ كَرِيم وَأُخْتَايَ اسْمُهُمَا لَيْلَى وَسَلْمَى.</p>
</div>
<hr/><h4>Traduction</h4><p>Mariam : Voici une photo de ma famille. Khalid : Qui est-ce ? Mariam : C'est mon père. Il s'appelle Youssef. Et voici ma mère, elle s'appelle Fatima. Khalid : As-tu des frères et sœurs ? Mariam : Oui, j'ai un frère et deux sœurs. Mon frère s'appelle Karim et mes sœurs s'appellent Layla et Salma.</p>` },
      { id: 'ar-m3-p3', type: 'vocabulary', title: 'Vocabulaire — La famille',
        content: `<h3>📚 أفراد الأسرة (Les membres de la famille)</h3>
<table><thead><tr><th>Arabe</th><th>Translittération</th><th>Français</th></tr></thead>
<tbody>
<tr><td dir="rtl">أَب / أَبُو</td><td>Ab / Abu</td><td>père / papa</td></tr>
<tr><td dir="rtl">أُم / مَامَا</td><td>Umm / Mama</td><td>mère / maman</td></tr>
<tr><td dir="rtl">أَخ</td><td>Akh</td><td>frère</td></tr>
<tr><td dir="rtl">أُخْت</td><td>Ukht</td><td>sœur</td></tr>
<tr><td dir="rtl">جَدّ</td><td>Jadd</td><td>grand-père</td></tr>
<tr><td dir="rtl">جَدَّة</td><td>Jadda</td><td>grand-mère</td></tr>
<tr><td dir="rtl">عَم</td><td>Amm</td><td>oncle paternel</td></tr>
<tr><td dir="rtl">عَمَّة</td><td>Amma</td><td>tante paternelle</td></tr>
<tr><td dir="rtl">خَال</td><td>Khal</td><td>oncle maternel</td></tr>
<tr><td dir="rtl">ابْن</td><td>Ibn</td><td>fils</td></tr>
<tr><td dir="rtl">بِنْت</td><td>Bint</td><td>fille</td></tr>
</tbody></table>` },
      { id: 'ar-m3-p4', type: 'grammar', title: 'Grammaire — Genre en arabe',
        content: `<h3>📖 Le genre en arabe (المذكر والمؤنث)</h3>
<p>En arabe, tous les noms sont soit <strong>masculins (مذكر)</strong>, soit <strong>féminins (مؤنث)</strong>.</p>
<p>Le féminin se forme souvent en ajoutant <strong>ة (ta marbuta)</strong> à la fin :</p>
<table><thead><tr><th>Masculin</th><th>Féminin</th><th>Sens</th></tr></thead>
<tbody>
<tr><td dir="rtl">طَالِب</td><td dir="rtl">طَالِبَة</td><td>étudiant / étudiante</td></tr>
<tr><td dir="rtl">مُدَرِّس</td><td dir="rtl">مُدَرِّسَة</td><td>professeur (m/f)</td></tr>
<tr><td dir="rtl">مَرِيض</td><td dir="rtl">مَرِيضَة</td><td>malade (m/f)</td></tr>
</tbody></table>
<h4>Les suffixes possessifs</h4>
<table><thead><tr><th>Personne</th><th>Suffixe</th><th>Exemple</th><th>Traduction</th></tr></thead>
<tbody>
<tr><td>Mon / Ma</td><td dir="rtl">-ي</td><td dir="rtl">أَبِي</td><td>mon père</td></tr>
<tr><td>Ton / Ta (m)</td><td dir="rtl">-كَ</td><td dir="rtl">أَبُوكَ</td><td>ton père</td></tr>
<tr><td>Son / Sa (m→)</td><td dir="rtl">-هُ</td><td dir="rtl">أَبُوهُ</td><td>son père (à lui)</td></tr>
<tr><td>Son / Sa (f→)</td><td dir="rtl">-هَا</td><td dir="rtl">أَبُوهَا</td><td>son père (à elle)</td></tr>
</tbody></table>` },
      { id: 'ar-m3-p5', type: 'exercises', title: 'Exercices — Module 3',
        content: `<h3>✏️ Exercices</h3>
<h4>Exercice 1 — Masculin ou féminin ?</h4>
<p>Donnez la forme féminine :</p>
<p dir="rtl">طَالِب ← _______ &nbsp;|&nbsp; مُدَرِّس ← _______ &nbsp;|&nbsp; مَرِيض ← _______</p>
<h4>Exercice 2 — Complétez avec le bon suffixe</h4>
<ol>
<li dir="rtl">هَذَا أَب___ . (mon père)</li>
<li dir="rtl">هَذِهِ أُم___ . (ta mère, masc.)</li>
<li dir="rtl">اسم___ كَرِيم. (son nom, à lui)</li>
</ol>
<h4>Exercice 3 — Présentez votre famille</h4>
<p>Écrivez 4 phrases pour présenter votre famille en arabe.</p>` },
      { id: 'ar-m3-p6', type: 'bilan', title: 'Bilan — Module 3',
        content: `<h3>✅ Bilan du Module 3</h3><ul><li>✅ Vocabulaire de la famille en arabe</li><li>✅ Distinction masculin/féminin (-ة ta marbuta)</li><li>✅ Suffixes possessifs : -ي / -كَ / -هُ / -هَا</li></ul><p><strong>Prochain module :</strong> Les chiffres et les couleurs 🔢</p>` },
      ],
  },

  {
    titre:       'Arabe A1 — Module 4 · Les chiffres et les couleurs (الأرقام والألوان)',
    cours_nom:   'Arabe A1',
    description: 'Quatrième module. Les chiffres arabes de 1 à 100, les couleurs et les accords adjectivaux. Parler de l\'âge, des quantités et des descriptions.',
    langue:      'ar',
    categorie:   'arabe',
    section:     'langues',
    niveau:      'A1',
    course_type: 'audio',
    pages: [
      { id: 'ar-m4-p1', type: 'intro', title: 'Introduction',
        content: `<h2>Module 4 — Les chiffres et les couleurs</h2><ul><li>Compter de 1 à 100 en arabe</li><li>Dire son âge</li><li>Les couleurs en arabe et leur accord</li><li>Décrire des objets : couleur, taille</li></ul>` },
      { id: 'ar-m4-p2', type: 'audio', title: 'Écoute — Les chiffres',
        piste_numero: 31,
        transcript: `<h3>🎧 Écoutez les chiffres (Piste 31)</h3>
<table><thead><tr><th>Chiffre</th><th>Arabe</th><th>Translittération</th></tr></thead>
<tbody>
<tr><td>1</td><td dir="rtl">وَاحِد</td><td>wahid</td></tr>
<tr><td>2</td><td dir="rtl">اثْنَان</td><td>ithnan</td></tr>
<tr><td>3</td><td dir="rtl">ثَلَاثَة</td><td>thalatha</td></tr>
<tr><td>4</td><td dir="rtl">أَرْبَعَة</td><td>arba'a</td></tr>
<tr><td>5</td><td dir="rtl">خَمْسَة</td><td>khamsa</td></tr>
<tr><td>6</td><td dir="rtl">سِتَّة</td><td>sitta</td></tr>
<tr><td>7</td><td dir="rtl">سَبْعَة</td><td>sab'a</td></tr>
<tr><td>8</td><td dir="rtl">ثَمَانِيَة</td><td>thamaniya</td></tr>
<tr><td>9</td><td dir="rtl">تِسْعَة</td><td>tis'a</td></tr>
<tr><td>10</td><td dir="rtl">عَشَرَة</td><td>'ashara</td></tr>
<tr><td>20</td><td dir="rtl">عِشْرُون</td><td>'ishrun</td></tr>
<tr><td>100</td><td dir="rtl">مِئَة</td><td>mi'a</td></tr>
</tbody></table>` },
      { id: 'ar-m4-p3', type: 'vocabulary', title: 'Vocabulaire — Les couleurs',
        content: `<h3>📚 الألوان (Les couleurs)</h3>
<table><thead><tr><th>Masculin</th><th>Féminin</th><th>Translittération</th><th>Français</th></tr></thead>
<tbody>
<tr><td dir="rtl">أَحْمَر</td><td dir="rtl">حَمْرَاء</td><td>ahmar / hamra</td><td>rouge</td></tr>
<tr><td dir="rtl">أَزْرَق</td><td dir="rtl">زَرْقَاء</td><td>azraq / zarqa</td><td>bleu</td></tr>
<tr><td dir="rtl">أَخْضَر</td><td dir="rtl">خَضْرَاء</td><td>akhdar / khadra</td><td>vert</td></tr>
<tr><td dir="rtl">أَصْفَر</td><td dir="rtl">صَفْرَاء</td><td>asfar / safra</td><td>jaune</td></tr>
<tr><td dir="rtl">أَبْيَض</td><td dir="rtl">بَيْضَاء</td><td>abyad / bayda</td><td>blanc</td></tr>
<tr><td dir="rtl">أَسْوَد</td><td dir="rtl">سَوْدَاء</td><td>aswad / sawda</td><td>noir</td></tr>
<tr><td dir="rtl">بُرْتُقَالِي</td><td dir="rtl">بُرْتُقَالِيَّة</td><td>burtuqali</td><td>orange</td></tr>
</tbody></table>` },
      { id: 'ar-m4-p4', type: 'grammar', title: 'Grammaire — L\'accord des adjectifs',
        content: `<h3>📖 L'accord des adjectifs de couleur</h3>
<p>En arabe, l'adjectif suit le nom et s'accorde en genre :</p>
<p dir="rtl">كِتَاب أَحْمَر = un livre rouge (masc.)</p>
<p dir="rtl">سَيَّارَة حَمْرَاء = une voiture rouge (fém.)</p>
<h4>Dire son âge :</h4>
<p dir="rtl">عُمْرِي خَمْسَ عَشَرَة سَنَة = J'ai quinze ans (litt. "Mon âge est quinze ans")</p>
<p dir="rtl">كَمْ عُمْرُكَ؟ = Quel âge as-tu ? (masc.)</p>
<p dir="rtl">كَمْ عُمْرُكِ؟ = Quel âge as-tu ? (fém.)</p>` },
      { id: 'ar-m4-p5', type: 'exercises', title: 'Exercices — Module 4',
        content: `<h3>✏️ Exercices</h3>
<h4>Exercice 1 — Écrivez en chiffres arabes</h4>
<p>7 · 14 · 25 · 50 · 100</p>
<h4>Exercice 2 — Accordez la couleur</h4>
<ol>
<li dir="rtl">قَلَم ___ (rouge — masc.)</li>
<li dir="rtl">سَيَّارَة ___ (bleue — fém.)</li>
<li dir="rtl">كِتَاب ___ (vert — masc.)</li>
</ol>
<h4>Exercice 3 — Dites votre âge en arabe</h4>
<p>Écrivez la phrase complète en arabe.</p>` },
      { id: 'ar-m4-p6', type: 'bilan', title: 'Bilan — Module 4',
        content: `<h3>✅ Bilan du Module 4</h3><ul><li>✅ Chiffres de 1 à 100</li><li>✅ Les couleurs et leur accord masculin/féminin</li><li>✅ Exprimer l'âge : عُمْرِي… سَنَة</li></ul><p><strong>Prochain module :</strong> La nourriture et les repas 🍽️</p>` },
      ],
  },

  {
    titre:       'Arabe A1 — Module 5 · La nourriture et les repas (الطعام والوجبات)',
    cours_nom:   'Arabe A1',
    description: 'Cinquième module. Parlez de nourriture, commandez un repas et décrivez vos goûts alimentaires en arabe. Le verbe vouloir et les formules au restaurant.',
    langue:      'ar',
    categorie:   'arabe',
    section:     'langues',
    niveau:      'A1',
    course_type: 'audio',
    pages: [
      { id: 'ar-m5-p1', type: 'intro', title: 'Introduction',
        content: `<h2>Module 5 — La nourriture et les repas</h2><ul><li>Nommer les aliments courants en arabe</li><li>Commander au restaurant</li><li>Exprimer ses goûts : أُحِب / لا أُحِب</li><li>Le verbe أَرَادَ (vouloir) au présent</li></ul>` },
      { id: 'ar-m5-p2', type: 'audio', title: 'Dialogue — في المطعم',
        piste_numero: 41,
        transcript: `<h3>🎧 Piste 41 — Au restaurant</h3>
<div dir="rtl" style="line-height:2.2;font-size:1.1em">
<p><strong>النَّادِل:</strong> أَهْلاً وَسَهْلاً! مَاذَا تُرِيد؟</p>
<p><strong>الزَّبُون:</strong> أُرِيدُ طَبَقَ كُسْكُس مِنْ فَضْلِكَ.</p>
<p><strong>النَّادِل:</strong> وَمَاذَا تَشْرَب؟</p>
<p><strong>الزَّبُون:</strong> أُرِيدُ عَصِيرَ بُرْتُقَال وَكُوبَ مَاء.</p>
<p><strong>النَّادِل:</strong> حَاضِر! وَهَلْ تُرِيدُ حَلْوَى؟</p>
<p><strong>الزَّبُون:</strong> لَا، شُكْراً. الحِسَاب مِنْ فَضْلِكَ.</p>
</div>
<hr/><h4>Traduction</h4><p>Serveur : Bienvenue ! Que voulez-vous ? Client : Je veux un plat de couscous, s'il vous plaît. Serveur : Et que buvez-vous ? Client : Je veux un jus d'orange et un verre d'eau. Serveur : Bien sûr ! Et voulez-vous un dessert ? Client : Non merci. L'addition, s'il vous plaît.</p>` },
      { id: 'ar-m5-p3', type: 'vocabulary', title: 'Vocabulaire — La nourriture',
        content: `<h3>📚 الطعام والشراب</h3>
<table><thead><tr><th>Arabe</th><th>Translittération</th><th>Français</th></tr></thead>
<tbody>
<tr><td dir="rtl">خُبْز</td><td>khubz</td><td>pain</td></tr>
<tr><td dir="rtl">أَرُز</td><td>aruzz</td><td>riz</td></tr>
<tr><td dir="rtl">لَحْم</td><td>lahm</td><td>viande</td></tr>
<tr><td dir="rtl">دَجَاج</td><td>dajaj</td><td>poulet</td></tr>
<tr><td dir="rtl">سَمَك</td><td>samak</td><td>poisson</td></tr>
<tr><td dir="rtl">خُضَار</td><td>khudar</td><td>légumes</td></tr>
<tr><td dir="rtl">فَاكِهَة</td><td>fakiha</td><td>fruit(s)</td></tr>
<tr><td dir="rtl">مَاء</td><td>ma'</td><td>eau</td></tr>
<tr><td dir="rtl">عَصِير</td><td>asir</td><td>jus</td></tr>
<tr><td dir="rtl">شَاي</td><td>shay</td><td>thé</td></tr>
<tr><td dir="rtl">قَهْوَة</td><td>qahwa</td><td>café</td></tr>
</tbody></table>` },
      { id: 'ar-m5-p4', type: 'grammar', title: 'Grammaire — Le verbe أَرَادَ (vouloir)',
        content: `<h3>📖 Le verbe يُرِيد (vouloir) au présent</h3>
<table><thead><tr><th>Pronom</th><th>Forme</th><th>Traduction</th></tr></thead>
<tbody>
<tr><td dir="rtl">أَنَا</td><td dir="rtl">أُرِيد</td><td>Je veux</td></tr>
<tr><td dir="rtl">أَنْتَ</td><td dir="rtl">تُرِيد</td><td>Tu veux (masc.)</td></tr>
<tr><td dir="rtl">أَنْتِ</td><td dir="rtl">تُرِيدِين</td><td>Tu veux (fém.)</td></tr>
<tr><td dir="rtl">هُوَ</td><td dir="rtl">يُرِيد</td><td>Il veut</td></tr>
<tr><td dir="rtl">هِيَ</td><td dir="rtl">تُرِيد</td><td>Elle veut</td></tr>
</tbody></table>
<h4>Exprimer ses goûts</h4>
<p dir="rtl">أُحِبُّ الشَّاي = J'aime le thé</p>
<p dir="rtl">لَا أُحِبُّ اللَّحْم = Je n'aime pas la viande</p>` },
      { id: 'ar-m5-p5', type: 'exercises', title: 'Exercices — Module 5',
        content: `<h3>✏️ Exercices</h3>
<h4>Conjuguez يُرِيد</h4>
<ol>
<li>Nous voulons du pain.</li>
<li>Elle veut du jus d'orange.</li>
<li>Ils veulent du poisson.</li>
</ol>
<h4>Traduisez</h4>
<ol>
<li>Je veux un thé, s'il vous plaît.</li>
<li>J'aime le couscous.</li>
<li>L'addition, s'il vous plaît.</li>
</ol>` },
      { id: 'ar-m5-p6', type: 'bilan', title: 'Bilan — Module 5',
        content: `<h3>✅ Bilan du Module 5</h3><ul><li>✅ Vocabulaire alimentaire en arabe</li><li>✅ Commander au restaurant</li><li>✅ Le verbe يُرِيد (vouloir)</li><li>✅ Exprimer ses goûts : أُحِب / لا أُحِب</li></ul><p><strong>Prochain module :</strong> La ville et les transports 🏙️</p>` },
      ],
  },

  {
    titre:       'Arabe A1 — Module 6 · La ville et les transports (المدينة والنقل)',
    cours_nom:   'Arabe A1',
    description: 'Sixième module. Demandez votre chemin, utilisez les transports et décrivez les lieux en arabe. Les prépositions de lieu et les questions directionnelles.',
    langue:      'ar',
    categorie:   'arabe',
    section:     'langues',
    niveau:      'A1',
    course_type: 'audio',
    pages: [
      { id: 'ar-m6-p1', type: 'intro', title: 'Introduction',
        content: `<h2>Module 6 — La ville et les transports</h2><ul><li>Nommer les lieux en ville en arabe</li><li>Demander et indiquer un chemin</li><li>Les moyens de transport</li><li>Les prépositions de lieu : في / على / أَمَام / خَلْف / بِجَانِب</li></ul>` },
      { id: 'ar-m6-p2', type: 'audio', title: 'Dialogue — أَيْنَ المَحَطَّة؟',
        piste_numero: 51,
        transcript: `<h3>🎧 Piste 51</h3>
<div dir="rtl" style="line-height:2.2;font-size:1.1em">
<p><strong>السَّائِح:</strong> عَفْواً! أَيْنَ مَحَطَّةُ الحَافِلَة؟</p>
<p><strong>المَارَّة:</strong> اذْهَب إِلَى الأَمَام، ثُمَّ اِنْعَطِف يَسَاراً عِنْدَ الإِشَارَة الضَّوْئِيَّة.</p>
<p><strong>السَّائِح:</strong> وَأَيْنَ الصَّيْدَلِيَّة؟</p>
<p><strong>المَارَّة:</strong> الصَّيْدَلِيَّة أَمَامَ المَدْرَسَة، بِجَانِبِ البَنْك.</p>
<p><strong>السَّائِح:</strong> شُكْراً جَزِيلاً!</p>
</div>
<hr/><h4>Traduction</h4><p>Touriste : Pardon ! Où est l'arrêt de bus ? Passant : Allez tout droit, puis tournez à gauche au feu de signalisation. Touriste : Et où est la pharmacie ? Passant : La pharmacie est devant l'école, à côté de la banque. Touriste : Merci beaucoup !</p>` },
      { id: 'ar-m6-p3', type: 'vocabulary', title: 'Vocabulaire — La ville',
        content: `<h3>📚 المدينة (La ville)</h3>
<table><thead><tr><th>Arabe</th><th>Translittération</th><th>Français</th></tr></thead>
<tbody>
<tr><td dir="rtl">مَحَطَّة الحَافِلَة</td><td>mahattat al-hafila</td><td>arrêt de bus</td></tr>
<tr><td dir="rtl">مَحَطَّة القِطَار</td><td>mahattat al-qitar</td><td>gare</td></tr>
<tr><td dir="rtl">مَسْجِد</td><td>masjid</td><td>mosquée</td></tr>
<tr><td dir="rtl">مَدْرَسَة</td><td>madrasa</td><td>école</td></tr>
<tr><td dir="rtl">مَسْتَشْفَى</td><td>mustashfa</td><td>hôpital</td></tr>
<tr><td dir="rtl">صَيْدَلِيَّة</td><td>saydaliyya</td><td>pharmacie</td></tr>
<tr><td dir="rtl">سُوق</td><td>suq</td><td>marché / souk</td></tr>
<tr><td dir="rtl">بَنْك</td><td>bank</td><td>banque</td></tr>
<tr><td dir="rtl">حَدِيقَة</td><td>hadiqa</td><td>jardin / parc</td></tr>
</tbody></table>` },
      { id: 'ar-m6-p4', type: 'grammar', title: 'Grammaire — Prépositions de lieu',
        content: `<h3>📖 حُرُوف الجَرّ المَكَانِيَّة</h3>
<table><thead><tr><th>Arabe</th><th>Translittération</th><th>Français</th></tr></thead>
<tbody>
<tr><td dir="rtl">فِي</td><td>fi</td><td>dans / en</td></tr>
<tr><td dir="rtl">عَلَى</td><td>'ala</td><td>sur</td></tr>
<tr><td dir="rtl">أَمَامَ</td><td>amama</td><td>devant</td></tr>
<tr><td dir="rtl">خَلْفَ</td><td>khalfa</td><td>derrière</td></tr>
<tr><td dir="rtl">بِجَانِبِ</td><td>bijanibi</td><td>à côté de</td></tr>
<tr><td dir="rtl">بَيْنَ</td><td>bayna</td><td>entre</td></tr>
<tr><td dir="rtl">قُرْبَ</td><td>qurba</td><td>près de</td></tr>
<tr><td dir="rtl">بَعِيداً عَن</td><td>ba'idan 'an</td><td>loin de</td></tr>
</tbody></table>` },
      { id: 'ar-m6-p5', type: 'exercises', title: 'Exercices — Module 6',
        content: `<h3>✏️ Exercices</h3>
<h4>Complétez avec la bonne préposition</h4>
<ol>
<li dir="rtl">الصَّيْدَلِيَّة ___ المَدْرَسَة. (devant)</li>
<li dir="rtl">البَنْك ___ السُّوق. (à côté de)</li>
<li dir="rtl">الكِتَاب ___ الطَّاوِلَة. (sur)</li>
</ol>
<h4>Traduisez</h4>
<ol><li>Où est la mosquée ?</li><li>L'hôpital est derrière l'école.</li><li>Allez tout droit, puis à gauche.</li></ol>` },
      { id: 'ar-m6-p6', type: 'bilan', title: 'Bilan — Module 6',
        content: `<h3>✅ Bilan du Module 6</h3><ul><li>✅ Lieux en ville : مدرسة، مسجد، مستشفى، بنك…</li><li>✅ Prépositions : في، أمام، خلف، بجانب، بين…</li><li>✅ Demander et donner des directions en arabe</li></ul><p><strong>Prochain module :</strong> Bilan final ✅</p>` },
      ],
  },

  {
    titre:       'Arabe A1 — Bilan et évaluation finale (المراجعة والتقييم)',
    cours_nom:   'Arabe A1',
    description: 'Module de bilan et d\'évaluation finale du cours d\'arabe A1. Révision de l\'alphabet, vocabulaire, grammaire et auto-évaluation complète du niveau A1.',
    langue:      'ar',
    categorie:   'arabe',
    section:     'langues',
    niveau:      'A1',
    course_type: 'audio',
    pages: [
      { id: 'ar-m7-p1', type: 'intro', title: 'Introduction — Bilan A1 Arabe',
        content: `<h2>Module 7 — Bilan et évaluation</h2>
<p>Félicitations pour avoir suivi les 6 modules ! Ce module final vous permet de :</p>
<ul>
  <li>Réviser l'alphabet et la phonétique arabes</li>
  <li>Revoir l'ensemble du vocabulaire A1</li>
  <li>Tester votre compréhension orale</li>
  <li>Auto-évaluer votre niveau A1 en arabe</li>
</ul>` },
      { id: 'ar-m7-p2', type: 'audio', title: 'Test de compréhension 1',
        piste_numero: 61,
        transcript: `<h3>🎧 Test d'écoute (Piste 61)</h3>
<p>Écoutez et répondez aux questions :</p>
<ol>
<li dir="rtl">مَا اسْم البِنْت؟</li>
<li dir="rtl">مِنْ أَيْنَ هِيَ؟</li>
<li dir="rtl">كَمْ عُمْرُهَا؟</li>
<li dir="rtl">مَاذَا تُحِب؟</li>
</ol>` },
      { id: 'ar-m7-p3', type: 'audio', title: 'Test de compréhension 2',
        piste_numero: 62,
        transcript: `<h3>🎧 Piste 62 — Compréhension</h3>
<p>Écoutez les directions et cochez le bon chemin sur le plan.</p>
<ol>
<li>Où se trouve la pharmacie ?</li>
<li>Quel est le moyen de transport mentionné ?</li>
<li>À combien de minutes est la destination ?</li>
</ol>` },
      { id: 'ar-m7-p4', type: 'exercises', title: 'Révision générale',
        content: `<h3>✏️ Révision complète</h3>
<h4>1. Alphabet</h4>
<p dir="rtl" style="font-size:1.3em">اكتب هذه الكلمات : بَاب &nbsp;·&nbsp; كِتَاب &nbsp;·&nbsp; مَاء &nbsp;·&nbsp; سَمَك</p>
<h4>2. Salutations</h4>
<p>Écrivez en arabe : Bonjour (matin) — Merci — Au revoir</p>
<h4>3. La famille</h4>
<p>Nommez 5 membres de la famille en arabe avec leur translittération.</p>
<h4>4. Chiffres</h4>
<p dir="rtl">اكتب بالأرقام العربية : 15 · 27 · 43 · 60 · 100</p>
<h4>5. Prépositions</h4>
<p>Complétez : La banque est ___ (à côté de) l'école.</p>` },
      { id: 'ar-m7-p5', type: 'exercises', title: 'Production — Présentation en arabe',
        content: `<h3>✏️ Production écrite finale</h3>
<h4>Rédigez une courte présentation en arabe (6-8 phrases) :</h4>
<ul>
<li>Votre nom et votre origine</li>
<li>Votre âge</li>
<li>Votre famille</li>
<li>Vos goûts alimentaires</li>
<li>Un lieu que vous aimez dans votre ville</li>
</ul>` },
      { id: 'ar-m7-p6', type: 'bilan', title: 'Auto-évaluation finale — A1 Arabe',
        content: `<h3>🎓 Auto-évaluation A1 — Arabe</h3>
<p>Je peux :</p>
<ul>
<li>☐ Lire et écrire les 28 lettres de l'alphabet arabe</li>
<li>☐ Me saluer et me présenter en arabe</li>
<li>☐ Parler de ma famille</li>
<li>☐ Compter de 1 à 100 et dire mon âge</li>
<li>☐ Nommer les aliments et commander au restaurant</li>
<li>☐ Me repérer en ville et demander mon chemin</li>
<li>☐ Utiliser les prépositions de lieu en arabe</li>
</ul>
<p><strong>🎉 Félicitations ! Vous avez terminé le niveau A1 d'arabe !</strong></p>
<p>Continuez avec le niveau A2 pour approfondir vos connaissances.</p>` },
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

  // Charger les cours existants pour déduplication
  const existing = await pb.collection('courses').getFullList({ requestKey: null });
  const existingTitles = new Set(existing.map(c => c.titre));
  console.log(`📚 ${existing.length} cours existants chargés.\n`);

  let created = 0, skipped = 0, errors = 0;

  const ALL_NEW_COURSES = [
    ...ENGLISH_COURSES.map(c => ({ ...c, _lang: 'EN' })),
    ...ARABIC_COURSES.map(c  => ({ ...c, _lang: 'AR' })),
  ];

  for (const course of ALL_NEW_COURSES) {
    const lang = course._lang;
    delete course._lang;

    if (existingTitles.has(course.titre)) {
      console.log(`⏭️  [${lang}] Déjà présent — ${course.titre}`);
      skipped++;
      continue;
    }

    // Mapper langue interne → valeur du schéma PocketBase (select)
    const langueMap = { en: 'Anglais', ar: 'Arabe', fr: 'Francais' };
    const langueValue = langueMap[course.langue] || 'Anglais';

    const pagesJson = JSON.stringify(course.pages);
    if (pagesJson.length > 195000) {
      console.warn(`   ⚠️  pages JSON trop long (${pagesJson.length} chars) — risque de troncature`);
    }

    const data = {
      titre:         course.titre,
      cours_nom:     course.cours_nom,
      description:   course.description,
      langue:        langueValue,
      categorie:     course.categorie,
      categorie_age: 'Adultes',
      section:       course.section,
      niveau:        course.niveau,
      course_type:   course.course_type,
      pages:         pagesJson,
      prix:          0,
      duree:         0,
      instructeur:   'IWS LAAYOUNE',
    };

    try {
      await pb.collection('courses').create(data, { requestKey: null });
      console.log(`✅ [${lang}] Créé : ${course.titre}`);
      created++;
    } catch (err) {
      const detail = err?.data ? JSON.stringify(err.data) : (err?.response ? JSON.stringify(err.response) : '');
      console.error(`❌ [${lang}] Erreur (${course.titre}) : ${err.message}`);
      if (detail) console.error(`   ↳ Détails : ${detail}`);
      errors++;
    }

    await new Promise(r => setTimeout(r, 100));
  }

  console.log('\n' + '═'.repeat(60));
  console.log('  📊 RÉSUMÉ');
  console.log('═'.repeat(60));
  console.log(`  ✅ Cours créés     : ${created}`);
  console.log(`  ⏭️  Déjà existants : ${skipped}`);
  if (errors) console.log(`  ❌ Erreurs        : ${errors}`);
  console.log('═'.repeat(60));
  console.log('\n🎉 Terminé !');
  console.log('   📖 Cours anglais A1 : 7 modules créés (enseignement de l\'anglais)');
  console.log('   📖 Cours arabe A1   : 7 modules créés (enseignement de l\'arabe)');
  console.log('   ⚠️  Les cours français Tip Top ne sont PAS modifiés.');
  console.log('\n   🔊 Pour les fichiers audio :');
  console.log('      - Uploadez les MP3 anglais via l\'interface PocketBase → courses → pages[].audio_url');
  console.log('      - Chaque page audio a un piste_numero pour faciliter l\'organisation');
  console.log('\n   ➜ http://localhost:5173/formation\n');
}

main().catch(console.error);
