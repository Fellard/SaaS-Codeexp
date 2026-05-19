/**
 * create-new-5-grammar-courses.mjs
 * ════════════════════════════════════════════════════════════════════
 * Crée 15 nouveaux cours standard (5 FR + 5 EN + 5 AR) :
 *   1. La comparaison (A1-A2)
 *   2. Identifier les temps verbaux (A1-A2)
 *   3. Les indicateurs de temps (A1-A2)
 *   4. Les pronoms COD (A1-A2)
 *   5. Le passé composé : révisions (A2)
 *
 * Les doublons existants sont détectés et ignorés.
 * Usage : node create-new-5-grammar-courses.mjs
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
// COURS FRANÇAIS — 5 nouveaux topics
// ════════════════════════════════════════════════════════════════════
const FR_COURSES = [

  // ──────────────────────────────────────────────────────────────────
  // 1. LA COMPARAISON
  // ──────────────────────────────────────────────────────────────────
  {
    titre:        'La comparaison : comparatif et superlatif (A1-A2)',
    cours_nom:    'Français',
    langue:       'Francais',
    categorie:    'grammaire',
    niveau:       'A1',
    description:  'Maîtriser le comparatif et le superlatif en français pour comparer des personnes, des objets et des situations. Supériorité, infériorité, égalité et formes irrégulières.',
    description_fr: 'Maîtriser le comparatif et le superlatif en français.',
    description_en: 'Master comparatives and superlatives in French.',
    description_ar: 'إتقان أسلوب المقارنة والتفضيل في الفرنسية.',
    title_fr: 'La comparaison : comparatif et superlatif',
    title_en: 'Comparison: Comparatives and Superlatives',
    title_ar: 'المقارنة: أسلوب المقارنة والتفضيل',
    pages: [
      {
        id: 'fr-comp-p1\', type: \'intro',
        title: 'Introduction — La comparaison',
        content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 Grammaire française A1-A2</div>
  <h2>La comparaison en français</h2>
  <p class="lead">Comparer, c'est dire qu'une chose est <strong>supérieure, inférieure ou égale</strong> à une autre. On utilise le <strong>comparatif</strong> pour deux éléments et le <strong>superlatif</strong> pour un groupe.</p>
  <div class="lesson-objectives">
    <h4>🎯 Objectifs</h4>
    <ul>
      <li>Exprimer la <strong>supériorité</strong> : <em>plus grand que</em></li>
      <li>Exprimer l'<strong>infériorité</strong> : <em>moins cher que</em></li>
      <li>Exprimer l'<strong>égalité</strong> : <em>aussi rapide que</em></li>
      <li>Utiliser le <strong>superlatif</strong> : <em>le plus beau</em></li>
      <li>Connaître les formes <strong>irrégulières</strong> : meilleur, mieux, pire</li>
    </ul>
  </div>
</div>`,
      },
      {
        id: 'fr-comp-p2\', type: \'lesson',
        title: 'Le comparatif',
        content: `<h3>📖 Le comparatif</h3>
<p>Le comparatif compare <strong>deux éléments</strong>. Il peut porter sur un adjectif, un adverbe ou un nom.</p>
<div class="rule-box">
  <h4>Structure : comparatif + que</h4>
  <table>
    <thead><tr><th>Type</th><th>Structure</th><th>Exemple</th></tr></thead>
    <tbody>
      <tr><td>⬆️ Supériorité</td><td><strong>plus + adj/adv + que</strong></td><td>Paul est <strong>plus grand que</strong> Marie.</td></tr>
      <tr><td>⬇️ Infériorité</td><td><strong>moins + adj/adv + que</strong></td><td>Ce livre est <strong>moins cher que</strong> l'autre.</td></tr>
      <tr><td>↔️ Égalité (adj)</td><td><strong>aussi + adj/adv + que</strong></td><td>Elle est <strong>aussi intelligente que</strong> lui.</td></tr>
      <tr><td>↔️ Égalité (nom)</td><td><strong>autant de + nom + que</strong></td><td>J'ai <strong>autant de</strong> travail <strong>que</strong> toi.</td></tr>
    </tbody>
  </table>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4>⚠️ Formes irrégulières</h4>
  <table>
    <thead><tr><th>Adjectif/Adverbe</th><th>Comparatif de supériorité</th></tr></thead>
    <tbody>
      <tr><td>bon(ne)</td><td><strong>meilleur(e)</strong> que (≠ plus bon)</td></tr>
      <tr><td>bien</td><td><strong>mieux</strong> que (≠ plus bien)</td></tr>
      <tr><td>mauvais(e)</td><td><strong>pire</strong> que / plus mauvais(e) que</td></tr>
    </tbody>
  </table>
</div>
<div class="example-box" style="margin-top:1rem">
  <h4>✏️ Exemples</h4>
  <ul>
    <li>Ce gâteau est <strong>meilleur que</strong> celui d'hier.</li>
    <li>Elle chante <strong>mieux que</strong> moi.</li>
    <li>Ce temps est <strong>pire que</strong> la semaine dernière.</li>
  </ul>
</div>`,
      },
      {
        id: 'fr-comp-p3\', type: \'lesson',
        title: 'Le superlatif',
        content: `<h3>📖 Le superlatif</h3>
<p>Le superlatif exprime le <strong>degré extrême</strong> dans un groupe. Il se forme avec l'article défini.</p>
<div class="rule-box">
  <h4>Structure du superlatif relatif</h4>
  <table>
    <thead><tr><th>Type</th><th>Structure</th><th>Exemple</th></tr></thead>
    <tbody>
      <tr><td>⬆️ Supériorité</td><td><strong>le/la/les plus + adj</strong></td><td>C'est <strong>la plus belle</strong> ville de France.</td></tr>
      <tr><td>⬇️ Infériorité</td><td><strong>le/la/les moins + adj</strong></td><td>C'est <strong>le moins cher</strong> du magasin.</td></tr>
    </tbody>
  </table>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4>⚠️ Superlatifs irréguliers</h4>
  <table>
    <thead><tr><th>Adjectif/Adverbe</th><th>Superlatif</th><th>Exemple</th></tr></thead>
    <tbody>
      <tr><td>bon(ne)</td><td><strong>le/la meilleur(e)</strong></td><td>C'est le meilleur restaurant de la ville.</td></tr>
      <tr><td>bien</td><td><strong>le mieux</strong></td><td>C'est lui qui travaille le mieux.</td></tr>
      <tr><td>mauvais(e)</td><td><strong>le/la pire</strong></td><td>C'est la pire situation possible.</td></tr>
    </tbody>
  </table>
</div>
<div class="tip-box" style="margin-top:1rem">
  <h4>💡 Accord de l'adjectif</h4>
  <p>L'adjectif s'accorde en <strong>genre et en nombre</strong> avec le nom :<br>
  <em>le plus grand garçon / la plus grande fille / les plus grands élèves</em></p>
</div>`,
      },
      {
        id: 'fr-comp-p4\', type: \'exercises',
        title: 'Exercices — La comparaison',
        content: `<h3>✏️ Exercices</h3>
<h4>Exercice 1 — Complétez avec plus, moins ou aussi</h4>
<ol>
  <li>Le train est _______ rapide que la voiture. (+)</li>
  <li>Ce film est _______ intéressant que le livre. (=)</li>
  <li>Paris est _______ grand que Lyon. (+)</li>
  <li>Mon appartement est _______ spacieux que le tien. (−)</li>
  <li>Elle parle français _______ bien que sa sœur. (+)</li>
</ol>
<h4>Exercice 2 — Utilisez la forme correcte (meilleur/mieux/pire)</h4>
<ol>
  <li>Ce restaurant est _______ que celui d'hier. (bon)</li>
  <li>Il joue _______ que son adversaire. (bien)</li>
  <li>La situation est _______ qu'avant. (mauvais)</li>
  <li>Cette recette est _______. C'est la _______ de toutes ! (bon)</li>
</ol>
<h4>Exercice 3 — Formez le superlatif</h4>
<ol>
  <li>C'est la ville / grand / de France. → ______________________________</li>
  <li>C'est l'élève / travailleur / de la classe. → ______________________________</li>
  <li>C'est le film / mauvais / de l'année. → ______________________________</li>
</ol>`,
      },
    ],
    exercises: [
      { id:'fr-comp-q1', question:"Quelle phrase exprime la supériorité ?", options:['Il est aussi grand que moi.','Elle est moins grande que lui.','Ce livre est plus intéressant que l\'autre.','J\'ai autant de travail que toi.'], answer:2 },
      { id:'fr-comp-q2', question:"Quelle est la forme correcte du comparatif de 'bon' ?", options:['plus bon','aussi bon','meilleur','le meilleur'], answer:2 },
      { id:'fr-comp-q3', question:"Complétez : Elle chante _______ que moi. (bien)", options:['plus bien','aussi bien','mieux','le mieux'], answer:2 },
      { id:'fr-comp-q4', question:"Quel est le superlatif de supériorité de 'bon' ?", options:['le plus bon','le meilleur','le mieux','le plus meilleur'], answer:1 },
      { id:'fr-comp-q5', question:"Complétez : C\'est _______ élève de la classe. (supériorité de 'travailleur')", options:['le plus travailleur','le travailleur le plus','le meilleur travailleur','plus travailleur'], answer:0 },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 2. IDENTIFIER LES TEMPS
  // ──────────────────────────────────────────────────────────────────
  {
    titre:        'Identifier les temps verbaux : passé, présent, futur (A1-A2)',
    cours_nom:    'Français',
    langue:       'Francais',
    categorie:    'grammaire',
    niveau:       'A1',
    description:  'Apprendre à identifier et distinguer le passé composé, le présent et le futur proche grâce aux indicateurs temporels et à la conjugaison.',
    description_fr: 'Identifier le passé composé, le présent et le futur proche.',
    description_en: 'Identify past, present and near future tenses in French.',
    description_ar: 'التعرف على الأزمنة الثلاثة في الفرنسية.',
    title_fr: 'Identifier les temps verbaux',
    title_en: 'Identifying Verb Tenses',
    title_ar: 'التعرف على الأزمنة الفعلية',
    pages: [
      {
        id: 'fr-temps-p1\', type: \'intro',
        title: 'Introduction — Les trois temps principaux',
        content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 Grammaire française A1-A2</div>
  <h2>Identifier les temps verbaux</h2>
  <p class="lead">En français A1-A2, on utilise principalement <strong>trois temps</strong> : le <em>passé composé</em>, le <em>présent</em> et le <em>futur proche</em>. Les indicateurs de temps nous aident à les identifier.</p>
  <div class="lesson-objectives">
    <h4>🎯 Objectifs</h4>
    <ul>
      <li>Reconnaître les <strong>indicateurs temporels</strong> (hier, maintenant, demain…)</li>
      <li>Conjuguer au <strong>passé composé</strong> (avoir/être + p.p.)</li>
      <li>Conjuguer au <strong>présent</strong> de l'indicatif</li>
      <li>Conjuguer au <strong>futur proche</strong> (aller + infinitif)</li>
    </ul>
  </div>
</div>`,
      },
      {
        id: 'fr-temps-p2\', type: \'lesson',
        title: 'Les indicateurs temporels',
        content: `<h3>📖 Les indicateurs temporels</h3>
<p>Les mots de temps nous indiquent à quel moment se passe l'action.</p>
<div class="rule-box">
  <table>
    <thead><tr><th>⏮️ Passé</th><th>⏺️ Présent</th><th>⏭️ Futur</th></tr></thead>
    <tbody>
      <tr><td>hier</td><td>aujourd'hui</td><td>demain</td></tr>
      <tr><td>avant-hier</td><td>maintenant / en ce moment</td><td>après-demain</td></tr>
      <tr><td>la semaine dernière</td><td>ce matin / ce soir</td><td>la semaine prochaine</td></tr>
      <tr><td>il y a + durée</td><td>tous les jours / chaque…</td><td>dans + durée</td></tr>
      <tr><td>ce matin (révolu)</td><td>actuellement</td><td>bientôt / prochainement</td></tr>
    </tbody>
  </table>
</div>
<div class="tip-box" style="margin-top:1rem">
  <h4>💡 Astuce</h4>
  <p>Repérez d'abord le <strong>mot de temps</strong> dans la phrase, puis choisissez le temps verbal qui lui correspond !</p>
</div>`,
      },
      {
        id: 'fr-temps-p3\', type: \'lesson',
        title: 'Les conjugaisons',
        content: `<h3>📖 Les conjugaisons des trois temps</h3>
<div class="rule-box">
  <h4>1. Le présent de l'indicatif — PARLER</h4>
  <table>
    <thead><tr><th>Pronom</th><th>Forme</th></tr></thead>
    <tbody>
      <tr><td>je</td><td>parle</td></tr>
      <tr><td>tu</td><td>parles</td></tr>
      <tr><td>il/elle/on</td><td>parle</td></tr>
      <tr><td>nous</td><td>parlons</td></tr>
      <tr><td>vous</td><td>parlez</td></tr>
      <tr><td>ils/elles</td><td>parlent</td></tr>
    </tbody>
  </table>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4>2. Le passé composé — PARLER (auxiliaire AVOIR)</h4>
  <table>
    <thead><tr><th>Pronom</th><th>Auxiliaire</th><th>Participe passé</th></tr></thead>
    <tbody>
      <tr><td>j'</td><td>ai</td><td>parlé</td></tr>
      <tr><td>tu</td><td>as</td><td>parlé</td></tr>
      <tr><td>il/elle/on</td><td>a</td><td>parlé</td></tr>
      <tr><td>nous</td><td>avons</td><td>parlé</td></tr>
      <tr><td>vous</td><td>avez</td><td>parlé</td></tr>
      <tr><td>ils/elles</td><td>ont</td><td>parlé</td></tr>
    </tbody>
  </table>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4>3. Le futur proche — ALLER + infinitif</h4>
  <table>
    <thead><tr><th>Pronom</th><th>ALLER (présent)</th><th>+ Infinitif</th></tr></thead>
    <tbody>
      <tr><td>je</td><td>vais</td><td>parler</td></tr>
      <tr><td>tu</td><td>vas</td><td>partir</td></tr>
      <tr><td>il/elle/on</td><td>va</td><td>manger</td></tr>
      <tr><td>nous</td><td>allons</td><td>voyager</td></tr>
      <tr><td>vous</td><td>allez</td><td>finir</td></tr>
      <tr><td>ils/elles</td><td>vont</td><td>arriver</td></tr>
    </tbody>
  </table>
</div>`,
      },
      {
        id: 'fr-temps-p4\', type: \'exercises',
        title: 'Exercices — Identifier et utiliser les temps',
        content: `<h3>✏️ Exercices</h3>
<h4>Exercice 1 — Identifiez le temps indiqué par chaque expression</h4>
<ol>
  <li>hier soir → _______</li>
  <li>dans trois jours → _______</li>
  <li>en ce moment → _______</li>
  <li>la semaine dernière → _______</li>
  <li>bientôt → _______</li>
</ol>
<h4>Exercice 2 — Conjuguez au temps correct</h4>
<ol>
  <li>Hier, nous _______ (manger) au restaurant.</li>
  <li>En ce moment, elle _______ (lire) un roman.</li>
  <li>Demain, ils _______ (partir) en vacances.</li>
  <li>La semaine dernière, tu _______ (voir) ce film.</li>
  <li>Bientôt, je _______ (changer) de travail.</li>
</ol>`,
      },
    ],
    exercises: [
      { id:'fr-temps-q1', question:"Quel temps utilise-t-on avec 'hier' ?", options:['Le présent','Le futur proche','Le passé composé','L\'imparfait'], answer:2 },
      { id:'fr-temps-q2', question:"Quel est le futur proche de 'je mange' ?", options:['J\'ai mangé','Je mangeais','Je vais manger','Je mangerai'], answer:2 },
      { id:'fr-temps-q3', question:"Comment forme-t-on le passé composé ?", options:['Verbe conjugué seul','Aller + infinitif','Avoir/Être au présent + participe passé','Verbe à l\'imparfait'], answer:2 },
      { id:'fr-temps-q4', question:"Avec quel indicateur utilise-t-on le futur proche ?", options:['Hier','Il y a deux jours','En ce moment','Dans une semaine'], answer:3 },
      { id:'fr-temps-q5', question:"Conjuguez 'partir' au passé composé avec ÊTRE (elle) :", options:['Elle a parti','Elle est partie','Elle était partie','Elle va partir'], answer:1 },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 3. LES INDICATEURS DE TEMPS
  // ──────────────────────────────────────────────────────────────────
  {
    titre:        'Les indicateurs de temps : depuis, pendant, il y a… (A1-A2)',
    cours_nom:    'Français',
    langue:       'Francais',
    categorie:    'grammaire',
    niveau:       'A1',
    description:  'Maîtriser les prépositions et expressions de temps : depuis, il y a, pendant, cela fait…que, dans, pour, jusqu\'à, en, à partir de. Exprimer la durée, le moment et la fréquence.',
    description_fr: 'Maîtriser depuis, il y a, pendant et autres indicateurs de temps.',
    description_en: 'Master French time expressions: since, for, ago, during…',
    description_ar: 'إتقان مؤشرات الزمن في الفرنسية: منذ، قبل، خلال...',
    title_fr: 'Les indicateurs de temps',
    title_en: 'Time Expressions',
    title_ar: 'مؤشرات الزمن',
    pages: [
      {
        id: 'fr-ind-p1\', type: \'intro',
        title: 'Introduction — Les expressions de temps',
        content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 Grammaire française A1-A2</div>
  <h2>Les indicateurs de temps</h2>
  <p class="lead">Les indicateurs de temps permettent de <strong>situer une action dans le temps</strong> : quand elle commence, combien de temps elle dure, quand elle se termine.</p>
  <div class="lesson-objectives">
    <h4>🎯 Objectifs</h4>
    <ul>
      <li>Utiliser <strong>depuis / il y a / pendant / cela fait…que</strong></li>
      <li>Exprimer le début : <strong>à partir de, dès</strong></li>
      <li>Exprimer la durée : <strong>en, pour, de…à, jusqu'à</strong></li>
      <li>Situer dans le futur : <strong>dans, vers, à</strong></li>
    </ul>
  </div>
</div>`,
      },
      {
        id: 'fr-ind-p2\', type: \'lesson',
        title: 'Indicateurs du passé et du présent continu',
        content: `<h3>📖 Passé et présent continu</h3>
<div class="rule-box">
  <table>
    <thead><tr><th>Expression</th><th>Usage</th><th>Exemple</th></tr></thead>
    <tbody>
      <tr><td><strong>il y a</strong> + durée</td><td>Moment révolu dans le passé</td><td>J'ai déménagé <strong>il y a</strong> deux ans.</td></tr>
      <tr><td><strong>pendant</strong> + durée</td><td>Durée limitée, terminée</td><td>J'ai travaillé <strong>pendant</strong> trois heures.</td></tr>
      <tr><td><strong>depuis</strong> + durée/date</td><td>Action qui continue jusqu'au présent</td><td>J'habite ici <strong>depuis</strong> 2019. / <strong>depuis</strong> six mois.</td></tr>
      <tr><td><strong>cela fait…que</strong></td><td>Durée depuis le début (= depuis)</td><td><strong>Cela fait</strong> une heure <strong>que</strong> j'attends.</td></tr>
      <tr><td><strong>jusqu'à / jusqu'au</strong></td><td>Limite temporelle</td><td>J'ai travaillé <strong>jusqu'à</strong> minuit.</td></tr>
    </tbody>
  </table>
</div>
<div class="tip-box" style="margin-top:1rem">
  <h4>💡 Depuis vs Il y a</h4>
  <ul>
    <li><strong>depuis</strong> → action encore en cours : J'habite ici depuis 5 ans. (j'habite encore)</li>
    <li><strong>il y a</strong> → action terminée dans le passé : Je suis arrivé il y a 5 ans.</li>
  </ul>
</div>`,
      },
      {
        id: 'fr-ind-p3\', type: \'lesson',
        title: 'Indicateurs de durée et du futur',
        content: `<h3>📖 Durée précise et futur</h3>
<div class="rule-box">
  <table>
    <thead><tr><th>Expression</th><th>Usage</th><th>Exemple</th></tr></thead>
    <tbody>
      <tr><td><strong>en</strong> + durée</td><td>Durée pour accomplir qqch</td><td>J'ai terminé ce livre <strong>en</strong> deux jours.</td></tr>
      <tr><td><strong>pour</strong> + durée</td><td>Durée prévue (futur/départ)</td><td>Je pars <strong>pour</strong> trois semaines.</td></tr>
      <tr><td><strong>de…à</strong></td><td>Intervalle entre deux moments</td><td>Je travaille <strong>de</strong> 9h <strong>à</strong> 17h.</td></tr>
      <tr><td><strong>dans</strong> + durée</td><td>Dans combien de temps (futur)</td><td>Le cours commence <strong>dans</strong> dix minutes.</td></tr>
      <tr><td><strong>à partir de</strong></td><td>Point de départ (futur)</td><td><strong>À partir de</strong> lundi, je travaille ici.</td></tr>
      <tr><td><strong>vers</strong></td><td>Approximation temporelle</td><td>J'arrive <strong>vers</strong> 20h.</td></tr>
    </tbody>
  </table>
</div>
<div class="example-box" style="margin-top:1rem">
  <h4>✏️ Récapitulatif</h4>
  <ul>
    <li>⏮️ <strong>il y a</strong> deux ans → passé révolu</li>
    <li>⏮️↔️ <strong>depuis</strong> deux ans → passé qui continue</li>
    <li>⏺️ <strong>pendant</strong> deux heures → durée finie</li>
    <li>⏺️ <strong>en</strong> deux heures → durée pour accomplir</li>
    <li>⏭️ <strong>dans</strong> deux jours → futur proche</li>
    <li>⏭️ <strong>pour</strong> deux jours → durée prévue</li>
  </ul>
</div>`,
      },
      {
        id: 'fr-ind-p4\', type: \'exercises',
        title: 'Exercices — Les indicateurs de temps',
        content: `<h3>✏️ Exercices</h3>
<h4>Exercice 1 — Choisissez l'indicateur correct</h4>
<ol>
  <li>J'étudie le français _______ trois ans. (depuis / il y a)</li>
  <li>Nous avons marché _______ deux heures. (pendant / dans)</li>
  <li>Il a terminé son rapport _______ une heure. (en / depuis)</li>
  <li>Le train part _______ cinq minutes. (il y a / dans)</li>
  <li>Elle travaille _______ 8h _______ 16h. (de…à / depuis…jusqu'à)</li>
</ol>
<h4>Exercice 2 — Depuis ou Il y a ?</h4>
<ol>
  <li>Nous sommes arrivés _______ deux heures. (action terminée)</li>
  <li>Il vit à Paris _______ dix ans. (action en cours)</li>
  <li>Mon frère est parti _______ une semaine. (il est parti et n'est pas revenu)</li>
</ol>`,
      },
    ],
    exercises: [
      { id:'fr-ind-q1', question:"Quelle expression indique une action qui continue jusqu'au présent ?", options:['il y a','pendant','depuis','dans'], answer:2 },
      { id:'fr-ind-q2', question:"Complétez : J'ai fini cet exercice _______ cinq minutes. (durée pour accomplir)", options:['depuis','pendant','en','il y a'], answer:2 },
      { id:'fr-ind-q3', question:"Complétez : Le film commence _______ une heure. (futur)", options:['depuis','pendant','il y a','dans'], answer:3 },
      { id:'fr-ind-q4', question:"'J\'ai dormi _______ huit heures\' exprime :", options:['un moment précis','une durée limitée terminée','une action qui continue','un futur prévu'], answer:1 },
      { id:'fr-ind-q5', question:"Laquelle de ces phrases est correcte ?", options:['Je travaille il y a 2 ans ici.','Je suis arrivé depuis 2 ans.','J\'habite ici depuis 2 ans.','Je pars pendant 3 jours prochains.'], answer:2 },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 4. LES PRONOMS COD
  // ──────────────────────────────────────────────────────────────────
  {
    titre:        'Les pronoms compléments d\'objet direct (COD) (A1-A2)',
    cours_nom:    'Français',
    langue:       'Francais',
    categorie:    'grammaire',
    niveau:       'A1',
    description:  'Apprendre à utiliser les pronoms COD (me, te, le, la, nous, vous, les) pour éviter les répétitions. Placement avant le verbe, à l\'impératif et au passé composé avec accord.',
    description_fr: 'Utiliser les pronoms COD : me, te, le, la, nous, vous, les.',
    description_en: 'Use direct object pronouns in French.',
    description_ar: 'استخدام ضمائر المفعول به المباشر في الفرنسية.',
    title_fr: 'Les pronoms COD',
    title_en: 'Direct Object Pronouns (COD)',
    title_ar: 'ضمائر المفعول به المباشر',
    pages: [
      {
        id: 'fr-cod-p1\', type: \'intro',
        title: 'Introduction — Les pronoms COD',
        content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 Grammaire française A1-A2</div>
  <h2>Les pronoms COD</h2>
  <p class="lead">Le pronom COD (Complément d'Objet Direct) remplace un nom <strong>sans préposition</strong> pour <strong>éviter les répétitions</strong>.</p>
  <div class="lesson-objectives">
    <h4>🎯 Objectifs</h4>
    <ul>
      <li>Identifier le COD dans une phrase</li>
      <li>Choisir le bon pronom : <strong>me, te, le, la, l', nous, vous, les</strong></li>
      <li>Placer le pronom <strong>avant le verbe</strong></li>
      <li>Utiliser le COD à l'<strong>impératif</strong> et au <strong>passé composé</strong></li>
    </ul>
  </div>
</div>`,
      },
      {
        id: 'fr-cod-p2\', type: \'lesson',
        title: 'Les pronoms COD — Tableau et placement',
        content: `<h3>📖 Les pronoms COD</h3>
<div class="rule-box">
  <h4>Tableau des pronoms</h4>
  <table>
    <thead><tr><th>Personne</th><th>Pronom COD</th><th>Exemple</th></tr></thead>
    <tbody>
      <tr><td>1ère pers. sing.</td><td><strong>me / m'</strong></td><td>Il <strong>me</strong> regarde. / Il <strong>m'</strong>aime.</td></tr>
      <tr><td>2ème pers. sing.</td><td><strong>te / t'</strong></td><td>Je <strong>te</strong> vois. / Je <strong>t'</strong>écoute.</td></tr>
      <tr><td>3ème pers. sing. masc.</td><td><strong>le / l'</strong></td><td>Je <strong>le</strong> connais. / Je <strong>l'</strong>appelle.</td></tr>
      <tr><td>3ème pers. sing. fém.</td><td><strong>la / l'</strong></td><td>Tu <strong>la</strong> vois ? / Tu <strong>l'</strong>invites ?</td></tr>
      <tr><td>1ère pers. plur.</td><td><strong>nous</strong></td><td>Il <strong>nous</strong> comprend.</td></tr>
      <tr><td>2ème pers. plur.</td><td><strong>vous</strong></td><td>Je <strong>vous</strong> entends.</td></tr>
      <tr><td>3ème pers. plur.</td><td><strong>les</strong></td><td>Je <strong>les</strong> connais.</td></tr>
    </tbody>
  </table>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4>📌 Placement du pronom COD</h4>
  <ul>
    <li>✅ Temps simples : <strong>sujet + pronom + verbe</strong> → Je <strong>le</strong> mange.</li>
    <li>✅ Temps composés : <strong>sujet + pronom + auxiliaire + p.p.</strong> → Je <strong>l'</strong>ai mangé.</li>
    <li>✅ Infinitif : <strong>verbe conjugué + pronom + infinitif</strong> → Je veux <strong>le</strong> manger.</li>
  </ul>
</div>`,
      },
      {
        id: 'fr-cod-p3\', type: \'lesson',
        title: 'COD à l\'impératif et accord au passé composé',
        content: `<h3>📖 Cas particuliers</h3>
<div class="rule-box">
  <h4>1. À l'impératif affirmatif — le pronom se place APRÈS le verbe</h4>
  <table>
    <thead><tr><th>Phrase normale</th><th>Impératif affirmatif</th></tr></thead>
    <tbody>
      <tr><td>Tu le prends.</td><td>Prends-<strong>le</strong> !</td></tr>
      <tr><td>Tu la regardes.</td><td>Regarde-<strong>la</strong> !</td></tr>
      <tr><td>Tu les manges.</td><td>Mange-<strong>les</strong> !</td></tr>
      <tr><td>Tu me rappelles.</td><td>Rappelle-<strong>moi</strong> !</td></tr>
    </tbody>
  </table>
  <p>⚠️ À l'impératif négatif, le pronom reste AVANT le verbe : <em>Ne <strong>le</strong> prends pas !</em></p>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4>2. Accord du participe passé avec le COD au passé composé</h4>
  <p>Quand le pronom COD est <strong>placé avant</strong> l'auxiliaire AVOIR, le participe passé s'accorde :</p>
  <ul>
    <li>J'ai acheté cette robe. → Je <strong>l'</strong>ai achetée. (fém. sing.)</li>
    <li>J'ai vu ces films. → Je <strong>les</strong> ai vus. (masc. plur.)</li>
    <li>Il a mangé les pommes. → Il <strong>les</strong> a mangées. (fém. plur.)</li>
  </ul>
</div>`,
      },
      {
        id: 'fr-cod-p4\', type: \'exercises',
        title: 'Exercices — Les pronoms COD',
        content: `<h3>✏️ Exercices</h3>
<h4>Exercice 1 — Remplacez le COD par un pronom</h4>
<ol>
  <li>Je mange la pizza. → Je _______ mange.</li>
  <li>Elle regarde ses enfants. → Elle _______ regarde.</li>
  <li>Tu connais Paul ? → Tu _______ connais ?</li>
  <li>Nous prenons le bus. → Nous _______ prenons.</li>
  <li>Vous invitez Marie et Sophie ? → Vous _______ invitez ?</li>
</ol>
<h4>Exercice 2 — Mettez à l'impératif affirmatif</h4>
<ol>
  <li>Tu prends la clé. → _______!</li>
  <li>Tu appelles ta mère. → _______!</li>
  <li>Tu manges les légumes. → _______!</li>
</ol>
<h4>Exercice 3 — Accordez le participe passé si nécessaire</h4>
<ol>
  <li>J'ai acheté ces chaussures → Je les ai achet___.</li>
  <li>Tu as vu Marie ? → Tu l'as vu___.</li>
  <li>Il a pris les billets. → Il les a pris___.</li>
</ol>`,
      },
    ],
    exercises: [
      { id:'fr-cod-q1', question:"Remplacez le COD : 'Je regarde le film.' →", options:['Je le regarde.','Je la regarde.','Je lui regarde.','Je les regarde.'], answer:0 },
      { id:'fr-cod-q2', question:"Où se place le pronom COD à l'impératif affirmatif ?", options:['Avant le verbe','Après le verbe','Avant le sujet','À la fin de la phrase'], answer:1 },
      { id:'fr-cod-q3', question:"Quelle phrase est correcte ?", options:['Je la ai vue.','Je l\'ai vu.','Je l\'ai vue.','Je ai la vue.'], answer:2 },
      { id:'fr-cod-q4', question:"'Prends-les !' — que remplace 'les' ?", options:['Un nom masculin singulier','Un nom féminin singulier','Des personnes ou choses au pluriel','Le sujet'], answer:2 },
      { id:'fr-cod-q5', question:"Complétez : 'Tu connais Marie ? — Oui, je _______ connais.'", options:['lui','la','le','les'], answer:1 },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 5. LE PASSÉ COMPOSÉ — RÉVISIONS
  // ──────────────────────────────────────────────────────────────────
  {
    titre:        'Le passé composé : révisions complètes (A2)',
    cours_nom:    'Français',
    langue:       'Francais',
    categorie:    'grammaire',
    niveau:       'A2',
    description:  'Réviser toutes les règles du passé composé : formation avec être/avoir, les 14 verbes avec être, les verbes pronominaux, l\'accord du participe passé et les participes irréguliers.',
    description_fr: 'Réviser le passé composé : auxiliaires, accord, participes irréguliers.',
    description_en: 'Review the French perfect tense: auxiliaries, agreement, irregular past participles.',
    description_ar: 'مراجعة الماضي المركب في الفرنسية: المساعد، التطابق، والتصريفات الشاذة.',
    title_fr: 'Le passé composé : révisions',
    title_en: 'The Perfect Tense: Complete Review',
    title_ar: 'الماضي المركب: مراجعة شاملة',
    pages: [
      {
        id: 'fr-pc-p1\', type: \'intro',
        title: 'Introduction — Rappel du passé composé',
        content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 Grammaire française A2</div>
  <h2>Le passé composé — Révisions</h2>
  <p class="lead">Le passé composé exprime une <strong>action ponctuelle et terminée dans le passé</strong>. Il se forme avec l'auxiliaire <em>être</em> ou <em>avoir</em> au présent + le <strong>participe passé</strong>.</p>
  <div class="lesson-objectives">
    <h4>🎯 Objectifs de révision</h4>
    <ul>
      <li>Choisir le bon auxiliaire : <strong>être ou avoir</strong></li>
      <li>Connaître les <strong>14 verbes</strong> qui se conjuguent avec être</li>
      <li>Appliquer l'<strong>accord du participe passé</strong></li>
      <li>Maîtriser les <strong>participes passés irréguliers</strong> courants</li>
    </ul>
  </div>
</div>`,
      },
      {
        id: 'fr-pc-p2\', type: \'lesson',
        title: 'Être ou Avoir ? — Règles d\'emploi',
        content: `<h3>📖 Choisir l'auxiliaire</h3>
<div class="rule-box">
  <h4>Avec AVOIR (majorité des verbes)</h4>
  <ul>
    <li>J'<strong>ai</strong> mangé / J'<strong>ai</strong> vu / J'<strong>ai</strong> pris</li>
    <li>Tous les verbes transitifs directs utilisent AVOIR.</li>
  </ul>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4>Avec ÊTRE — Les 14 verbes + pronominaux</h4>
  <p>Moyen mnémotechnique : <strong>DR & MRS VANDER TRAMP</strong></p>
  <table>
    <thead><tr><th>Verbe</th><th>Participe passé</th><th>Verbe</th><th>Participe passé</th></tr></thead>
    <tbody>
      <tr><td>Devenir</td><td>devenu(e)</td><td>Venir</td><td>venu(e)</td></tr>
      <tr><td>Revenir</td><td>revenu(e)</td><td>Aller</td><td>allé(e)</td></tr>
      <tr><td>Monter</td><td>monté(e)</td><td>Naître</td><td>né(e)</td></tr>
      <tr><td>Rester</td><td>resté(e)</td><td>Descendre</td><td>descendu(e)</td></tr>
      <tr><td>Sortir</td><td>sorti(e)</td><td>Entrer</td><td>entré(e)</td></tr>
      <tr><td>Partir</td><td>parti(e)</td><td>Rentrer</td><td>rentré(e)</td></tr>
      <tr><td>Tomber</td><td>tombé(e)</td><td>Mourir</td><td>mort(e)</td></tr>
    </tbody>
  </table>
  <p>⚠️ <strong>Tous les verbes pronominaux</strong> (se lever, se laver…) se conjuguent aussi avec ÊTRE.</p>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4>Accord du participe passé avec ÊTRE</h4>
  <p>Le participe passé s'accorde avec le <strong>sujet</strong> :</p>
  <ul>
    <li>Il est allé. / Elle est allée. / Ils sont allés. / Elles sont allées.</li>
    <li>Elle s'est levée tôt. (pronominal féminin)</li>
  </ul>
</div>`,
      },
      {
        id: 'fr-pc-p3\', type: \'lesson',
        title: 'Participes passés irréguliers',
        content: `<h3>📖 Les participes passés irréguliers</h3>
<div class="rule-box">
  <table>
    <thead><tr><th>Infinitif</th><th>Participe passé</th><th>Infinitif</th><th>Participe passé</th></tr></thead>
    <tbody>
      <tr><td>avoir</td><td><strong>eu</strong></td><td>être</td><td><strong>été</strong></td></tr>
      <tr><td>aller</td><td><strong>allé</strong></td><td>venir</td><td><strong>venu</strong></td></tr>
      <tr><td>faire</td><td><strong>fait</strong></td><td>dire</td><td><strong>dit</strong></td></tr>
      <tr><td>prendre</td><td><strong>pris</strong></td><td>mettre</td><td><strong>mis</strong></td></tr>
      <tr><td>voir</td><td><strong>vu</strong></td><td>lire</td><td><strong>lu</strong></td></tr>
      <tr><td>savoir</td><td><strong>su</strong></td><td>pouvoir</td><td><strong>pu</strong></td></tr>
      <tr><td>devoir</td><td><strong>dû</strong></td><td>vouloir</td><td><strong>voulu</strong></td></tr>
      <tr><td>boire</td><td><strong>bu</strong></td><td>croire</td><td><strong>cru</strong></td></tr>
      <tr><td>naître</td><td><strong>né</strong></td><td>mourir</td><td><strong>mort</strong></td></tr>
      <tr><td>vivre</td><td><strong>vécu</strong></td><td>écrire</td><td><strong>écrit</strong></td></tr>
    </tbody>
  </table>
</div>`,
      },
      {
        id: 'fr-pc-p4\', type: \'exercises',
        title: 'Exercices — Le passé composé',
        content: `<h3>✏️ Exercices</h3>
<h4>Exercice 1 — Choisissez l'auxiliaire correct (être/avoir)</h4>
<ol>
  <li>Elles _______ allées au cinéma hier soir.</li>
  <li>Nous _______ mangé au restaurant.</li>
  <li>Il _______ né le 3 mai.</li>
  <li>On _______ dîné pour son anniversaire.</li>
  <li>Mardi dernier, elle _______ levée tôt.</li>
</ol>
<h4>Exercice 2 — Conjuguez au passé composé</h4>
<ol>
  <li>Ce matin, il _______ (avoir) rendez-vous chez le dentiste.</li>
  <li>Elle _______ (lire) ce livre en une journée.</li>
  <li>Le 1er janvier, ils _______ (s'appeler) pour les vœux.</li>
  <li>Nous _______ (prendre) le métro à la gare.</li>
</ol>
<h4>Exercice 3 — Corrigez les erreurs</h4>
<ol>
  <li>Elles ont allé au parc. → _______</li>
  <li>Il est mangé une pomme. → _______</li>
  <li>Elle s'est levé tôt. → _______</li>
</ol>`,
      },
    ],
    exercises: [
      { id:'fr-pc-q1', question:"Le passé composé exprime :", options:['Une action habituellement répétée dans le passé','Une action en cours dans le passé','Une action ponctuelle et terminée dans le passé','Une action qui dure encore'], answer:2 },
      { id:'fr-pc-q2', question:"Quel est le bon auxiliaire pour 'aller' ?", options:['avoir','être','les deux sont possibles','aucun des deux'], answer:1 },
      { id:'fr-pc-q3', question:"Laquelle est correcte ?", options:['Elles sont allé.','Elles sont allés.','Elles sont allées.','Elles ont allées.'], answer:2 },
      { id:'fr-pc-q4', question:"Quel est le participe passé de 'prendre' ?", options:['prendu','pris','prit','prend'], answer:1 },
      { id:'fr-pc-q5', question:"'Elle s\'est levée tôt.' — Pourquoi le participe passé est-il accordé ?", options:['Parce que l\'auxiliaire est avoir','Parce que le verbe est pronominal avec être','Parce qu\'il y a un COD','Il n\'y a pas d\'accord ici'], answer:1 },
    ],
  },
];

// ════════════════════════════════════════════════════════════════════
// COURS ANGLAIS — 5 topics équivalents
// ════════════════════════════════════════════════════════════════════
const EN_COURSES = [

  // ──────────────────────────────────────────────────────────────────
  // 1. COMPARATIVES AND SUPERLATIVES
  // ──────────────────────────────────────────────────────────────────
  {
    titre:        'Comparatives and Superlatives in English (A1-A2)',
    cours_nom:    'Anglais',
    langue:       'Anglais',
    categorie:    'grammaire',
    niveau:       'A1',
    description:  'Learn to compare people, places and things in English using comparatives (bigger than, more interesting than) and superlatives (the biggest, the most interesting). Includes irregular forms.',
    description_fr: 'Apprendre le comparatif et superlatif en anglais.',
    description_en: 'Learn comparatives and superlatives in English.',
    description_ar: 'تعلم أسلوب المقارنة والتفضيل في الإنجليزية.',
    title_fr: 'Comparatif et superlatif en anglais',
    title_en: 'Comparatives and Superlatives',
    title_ar: 'المقارنة والتفضيل في الإنجليزية',
    pages: [
      {
        id: 'en-comp-p1\', type: \'intro',
        title: 'Introduction — Comparatives and Superlatives',
        content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 English Grammar A1-A2</div>
  <h2>Comparatives and Superlatives</h2>
  <p class="lead">We use <strong>comparatives</strong> to compare two things, and <strong>superlatives</strong> to say something is the most extreme in a group.</p>
  <div class="lesson-objectives">
    <h4>🎯 Learning Objectives</h4>
    <ul>
      <li>Form comparatives: <em>taller than, more beautiful than</em></li>
      <li>Form superlatives: <em>the tallest, the most beautiful</em></li>
      <li>Express equality: <em>as tall as</em></li>
      <li>Use irregular forms: <em>good → better → best</em></li>
    </ul>
  </div>
</div>`,
      },
      {
        id: 'en-comp-p2\', type: \'lesson',
        title: 'Forming Comparatives',
        content: `<h3>📖 How to Form Comparatives</h3>
<div class="rule-box">
  <table>
    <thead><tr><th>Adjective type</th><th>Comparative rule</th><th>Example</th></tr></thead>
    <tbody>
      <tr><td>Short (1 syllable)</td><td>adj + <strong>-er + than</strong></td><td>tall → <strong>taller than</strong></td></tr>
      <tr><td>Ending in -e</td><td>adj + <strong>-r + than</strong></td><td>nice → <strong>nicer than</strong></td></tr>
      <tr><td>CVC ending</td><td>double consonant + <strong>-er + than</strong></td><td>big → <strong>bigger than</strong></td></tr>
      <tr><td>Ending in -y</td><td>-y → <strong>-ier + than</strong></td><td>happy → <strong>happier than</strong></td></tr>
      <tr><td>Long (2+ syllables)</td><td><strong>more + adj + than</strong></td><td>beautiful → <strong>more beautiful than</strong></td></tr>
    </tbody>
  </table>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4>↔️ Equality — as … as</h4>
  <ul>
    <li>She is <strong>as tall as</strong> her brother.</li>
    <li>This book is <strong>as interesting as</strong> the other one.</li>
    <li>Negative: He is <strong>not as fast as</strong> his friend.</li>
  </ul>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4>⚠️ Irregular Comparatives</h4>
  <table>
    <thead><tr><th>Adjective</th><th>Comparative</th></tr></thead>
    <tbody>
      <tr><td>good</td><td><strong>better than</strong></td></tr>
      <tr><td>bad</td><td><strong>worse than</strong></td></tr>
      <tr><td>far</td><td><strong>further/farther than</strong></td></tr>
    </tbody>
  </table>
</div>`,
      },
      {
        id: 'en-comp-p3\', type: \'lesson',
        title: 'Forming Superlatives',
        content: `<h3>📖 How to Form Superlatives</h3>
<div class="rule-box">
  <table>
    <thead><tr><th>Adjective type</th><th>Superlative rule</th><th>Example</th></tr></thead>
    <tbody>
      <tr><td>Short (1 syllable)</td><td><strong>the</strong> + adj + <strong>-est</strong></td><td>tall → <strong>the tallest</strong></td></tr>
      <tr><td>Ending in -e</td><td><strong>the</strong> + adj + <strong>-st</strong></td><td>nice → <strong>the nicest</strong></td></tr>
      <tr><td>CVC ending</td><td><strong>the</strong> + double consonant + <strong>-est</strong></td><td>big → <strong>the biggest</strong></td></tr>
      <tr><td>Ending in -y</td><td><strong>the</strong> + -y → <strong>-iest</strong></td><td>happy → <strong>the happiest</strong></td></tr>
      <tr><td>Long (2+ syllables)</td><td><strong>the most + adj</strong></td><td>→ <strong>the most beautiful</strong></td></tr>
    </tbody>
  </table>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4>⚠️ Irregular Superlatives</h4>
  <table>
    <thead><tr><th>Adjective</th><th>Comparative</th><th>Superlative</th></tr></thead>
    <tbody>
      <tr><td>good</td><td>better</td><td><strong>the best</strong></td></tr>
      <tr><td>bad</td><td>worse</td><td><strong>the worst</strong></td></tr>
      <tr><td>far</td><td>further</td><td><strong>the furthest</strong></td></tr>
    </tbody>
  </table>
</div>`,
      },
      {
        id: 'en-comp-p4\', type: \'exercises',
        title: 'Exercises — Comparatives and Superlatives',
        content: `<h3>✏️ Exercises</h3>
<h4>Exercise 1 — Write the comparative</h4>
<ol>
  <li>This house is _______ (big) than mine.</li>
  <li>She is _______ (intelligent) than her classmate.</li>
  <li>Today is _______ (hot) than yesterday.</li>
  <li>This film is _______ (good) than the other one.</li>
  <li>My new phone is _______ (expensive) than the old one.</li>
</ol>
<h4>Exercise 2 — Write the superlative</h4>
<ol>
  <li>This is _______ (tall) building in the city.</li>
  <li>She is _______ (happy) person I know.</li>
  <li>That was _______ (bad) film of the year.</li>
</ol>
<h4>Exercise 3 — Equal or not equal?</h4>
<ol>
  <li>Paris / London — expensive (equal): Paris is _______ London.</li>
  <li>My bag / your bag — heavy (not equal, mine is less): My bag is _______ yours.</li>
</ol>`,
      },
    ],
    exercises: [
      { id:'en-comp-q1', question:"What is the comparative of 'happy'?", options:['happyer than','more happy than','happier than','the happiest'], answer:2 },
      { id:'en-comp-q2', question:"Which is correct?", options:['She is more tall than me.','She is taller than me.','She is tallest than me.','She is tall than me.'], answer:1 },
      { id:'en-comp-q3', question:"What is the superlative of 'good'?", options:['the goodest','the most good','the better','the best'], answer:3 },
      { id:'en-comp-q4', question:"Complete: This is _______ film I have ever seen!", options:['the most boring','more boring','boring','boringly'], answer:0 },
      { id:'en-comp-q5', question:"'She is as tall as her brother.' What does this express?", options:['She is taller.','She is shorter.','They are the same height.','He is taller.'], answer:2 },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 2. IDENTIFYING VERB TENSES
  // ──────────────────────────────────────────────────────────────────
  {
    titre:        'Identifying Verb Tenses — Past, Present & Future (A1-A2)',
    cours_nom:    'Anglais',
    langue:       'Anglais',
    categorie:    'grammaire',
    niveau:       'A1',
    description:  'Learn to identify and use the three main tenses in English: the simple past, the present simple/continuous, and the future (going to / will). Includes time markers for each tense.',
    description_fr: 'Identifier et utiliser les temps passé, présent et futur en anglais.',
    description_en: 'Identify and use past, present and future tenses in English.',
    description_ar: 'التعرف على الأزمنة الثلاثة في الإنجليزية واستخدامها.',
    title_fr: 'Identifier les temps en anglais',
    title_en: 'Identifying Verb Tenses',
    title_ar: 'التعرف على الأزمنة في الإنجليزية',
    pages: [
      {
        id: 'en-tenses-p1\', type: \'intro',
        title: 'Introduction — Three Main Tenses',
        content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 English Grammar A1-A2</div>
  <h2>Identifying Verb Tenses</h2>
  <p class="lead">English uses time markers to help us identify when an action takes place. Learning these key words helps you choose the right tense every time!</p>
  <div class="lesson-objectives">
    <h4>🎯 Learning Objectives</h4>
    <ul>
      <li>Recognize <strong>time markers</strong> for each tense</li>
      <li>Use the <strong>simple past</strong> for completed actions</li>
      <li>Use the <strong>present simple/continuous</strong> for now and habits</li>
      <li>Use <strong>going to / will</strong> for future plans and predictions</li>
    </ul>
  </div>
</div>`,
      },
      {
        id: 'en-tenses-p2\', type: \'lesson',
        title: 'Time Markers',
        content: `<h3>📖 Time Markers by Tense</h3>
<div class="rule-box">
  <table>
    <thead><tr><th>⏮️ Past</th><th>⏺️ Present</th><th>⏭️ Future</th></tr></thead>
    <tbody>
      <tr><td>yesterday</td><td>now / right now</td><td>tomorrow</td></tr>
      <tr><td>last week / last year</td><td>today / this morning</td><td>next week / next year</td></tr>
      <tr><td>… ago (two days ago)</td><td>every day / usually</td><td>in + time (in two days)</td></tr>
      <tr><td>in 2020 / in January</td><td>at the moment</td><td>soon / later</td></tr>
      <tr><td>when I was young…</td><td>always / never / often</td><td>this weekend</td></tr>
    </tbody>
  </table>
</div>`,
      },
      {
        id: 'en-tenses-p3\', type: \'lesson',
        title: 'The Three Tenses — Forms',
        content: `<h3>📖 Tense Forms</h3>
<div class="rule-box">
  <h4>1. Simple Past — completed actions</h4>
  <ul>
    <li>Regular: verb + <strong>-ed</strong> → I <strong>walked</strong>, She <strong>worked</strong></li>
    <li>Irregular: go → <strong>went</strong>, have → <strong>had</strong>, see → <strong>saw</strong></li>
    <li>Negative: <strong>didn't + base verb</strong> → I didn't go.</li>
  </ul>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4>2. Present Simple / Continuous — habits and now</h4>
  <ul>
    <li>Simple: I <strong>work</strong> every day. / She <strong>speaks</strong> French.</li>
    <li>Continuous: I <strong>am working</strong> right now. / They <strong>are eating</strong>.</li>
  </ul>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4>3. Future — plans and predictions</h4>
  <ul>
    <li><strong>Going to</strong> (plans/intentions): I <strong>am going to</strong> study tonight.</li>
    <li><strong>Will</strong> (predictions/decisions): It <strong>will</strong> rain tomorrow.</li>
  </ul>
</div>`,
      },
      {
        id: 'en-tenses-p4\', type: \'exercises',
        title: 'Exercises — Tense Identification',
        content: `<h3>✏️ Exercises</h3>
<h4>Exercise 1 — Which tense does each time marker suggest?</h4>
<ol>
  <li>yesterday → _______</li>
  <li>next Monday → _______</li>
  <li>right now → _______</li>
  <li>two years ago → _______</li>
  <li>every morning → _______</li>
</ol>
<h4>Exercise 2 — Put the verb in the correct tense</h4>
<ol>
  <li>Yesterday, she _______ (go) to the supermarket.</li>
  <li>Right now, I _______ (study) for my exam.</li>
  <li>Next week, we _______ (visit) our grandparents.</li>
  <li>He _______ (walk) to school every day.</li>
</ol>`,
      },
    ],
    exercises: [
      { id:'en-tenses-q1', question:"Which time marker goes with the simple past?", options:['tomorrow','right now','yesterday','next week'], answer:2 },
      { id:'en-tenses-q2', question:"'I am going to travel next summer.' Which tense is this?", options:['Simple past','Present continuous','Future with going to','Present simple'], answer:2 },
      { id:'en-tenses-q3', question:"How do you form the simple past of a regular verb?", options:['verb + -ing','verb + -s','verb + -ed','will + verb'], answer:2 },
      { id:'en-tenses-q4', question:"Which sentence is in the present continuous?", options:['She works every day.','She worked yesterday.','She is working right now.','She will work tomorrow.'], answer:2 },
      { id:'en-tenses-q5', question:"'He didn\'t go to school.' — What tense is this?", options:['Present simple negative','Simple past negative','Future negative','Present continuous negative'], answer:1 },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 3. TIME EXPRESSIONS
  // ──────────────────────────────────────────────────────────────────
  {
    titre:        'Time Expressions — since, for, ago, during… (A1-A2)',
    cours_nom:    'Anglais',
    langue:       'Anglais',
    categorie:    'grammaire',
    niveau:       'A1',
    description:  'Master English time prepositions and expressions: since, for, ago, during, until, in, by, from…to. Learn how to talk about duration, starting points and deadlines.',
    description_fr: 'Maîtriser les expressions de temps en anglais : since, for, ago, during…',
    description_en: 'Master time expressions in English: since, for, ago, during…',
    description_ar: 'إتقان مؤشرات الزمن في الإنجليزية: since, for, ago...',
    title_fr: 'Expressions de temps en anglais',
    title_en: 'Time Expressions',
    title_ar: 'مؤشرات الزمن في الإنجليزية',
    pages: [
      {
        id: 'en-time-p1\', type: \'intro',
        title: 'Introduction — Talking About Time',
        content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 English Grammar A1-A2</div>
  <h2>Time Expressions in English</h2>
  <p class="lead">Time expressions tell us <strong>when</strong> an action happens, <strong>how long</strong> it lasts, and <strong>from when to when</strong>. Getting them right is essential for clear communication!</p>
  <div class="lesson-objectives">
    <h4>🎯 Learning Objectives</h4>
    <ul>
      <li>Use <strong>since vs. for</strong> correctly</li>
      <li>Use <strong>ago</strong> for past moments</li>
      <li>Use <strong>during, until, by, in, within</strong></li>
      <li>Use <strong>from…to / between…and</strong></li>
    </ul>
  </div>
</div>`,
      },
      {
        id: 'en-time-p2\', type: \'lesson',
        title: 'Since, For, Ago',
        content: `<h3>📖 Since, For, Ago</h3>
<div class="rule-box">
  <table>
    <thead><tr><th>Expression</th><th>Usage</th><th>Example</th></tr></thead>
    <tbody>
      <tr><td><strong>since</strong> + point in time</td><td>Starting point of an ongoing action</td><td>I have lived here <strong>since 2018</strong>. / <strong>since Monday</strong>.</td></tr>
      <tr><td><strong>for</strong> + duration</td><td>Length of an ongoing or completed action</td><td>I have studied English <strong>for three years</strong>.</td></tr>
      <tr><td><strong>ago</strong> + (after duration)</td><td>Completed action in the past</td><td>I moved here <strong>two years ago</strong>.</td></tr>
      <tr><td><strong>during</strong> + noun/period</td><td>Something happening within a period</td><td>It rained <strong>during the night</strong>.</td></tr>
    </tbody>
  </table>
</div>
<div class="tip-box" style="margin-top:1rem">
  <h4>💡 Since vs For</h4>
  <ul>
    <li><strong>since</strong> + a point in time: since 2020, since Monday, since I was born</li>
    <li><strong>for</strong> + a length of time: for two years, for three days, for a long time</li>
  </ul>
</div>`,
      },
      {
        id: 'en-time-p3\', type: \'lesson',
        title: 'Until, By, In, From…To',
        content: `<h3>📖 More Time Expressions</h3>
<div class="rule-box">
  <table>
    <thead><tr><th>Expression</th><th>Usage</th><th>Example</th></tr></thead>
    <tbody>
      <tr><td><strong>until / till</strong></td><td>Up to a certain point in time</td><td>I worked <strong>until</strong> midnight.</td></tr>
      <tr><td><strong>by</strong></td><td>No later than (deadline)</td><td>Finish this <strong>by</strong> Friday.</td></tr>
      <tr><td><strong>in</strong> + future duration</td><td>After a period of time (future)</td><td>The train leaves <strong>in</strong> ten minutes.</td></tr>
      <tr><td><strong>within</strong></td><td>Before the end of a period</td><td>I'll reply <strong>within</strong> 24 hours.</td></tr>
      <tr><td><strong>from…to</strong></td><td>Interval between two points</td><td>I work <strong>from</strong> 9am <strong>to</strong> 5pm.</td></tr>
    </tbody>
  </table>
</div>`,
      },
      {
        id: 'en-time-p4\', type: \'exercises',
        title: 'Exercises — Time Expressions',
        content: `<h3>✏️ Exercises</h3>
<h4>Exercise 1 — Since or For?</h4>
<ol>
  <li>I have known her _______ five years.</li>
  <li>He has worked here _______ 2015.</li>
  <li>They have been married _______ a long time.</li>
  <li>We haven't spoken _______ last summer.</li>
</ol>
<h4>Exercise 2 — Choose the correct expression</h4>
<ol>
  <li>I moved to London _______ three years. (ago / since)</li>
  <li>Please submit your work _______ Monday. (by / since)</li>
  <li>I'll call you _______ an hour. (in / for)</li>
  <li>She studied _______ the holidays. (during / since)</li>
</ol>`,
      },
    ],
    exercises: [
      { id:'en-time-q1', question:"Which is correct?", options:['I have lived here since five years.','I have lived here for five years.','I have lived here five years ago.','I live here since five years.'], answer:1 },
      { id:'en-time-q2', question:"'I moved here two years ___.' Choose the right word.", options:['since','for','ago','during'], answer:2 },
      { id:'en-time-q3', question:"'Finish the report ___ Friday.' (deadline) — Choose:", options:['since','until','by','for'], answer:2 },
      { id:'en-time-q4', question:"'The bus arrives ___ ten minutes.' — Choose:", options:['since','in','for','ago'], answer:1 },
      { id:'en-time-q5', question:"'Since' is always followed by:", options:['A duration (e.g. three years)','A point in time (e.g. Monday, 2020)','A verb in the -ing form','Nothing — it stands alone'], answer:1 },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 4. DIRECT OBJECT PRONOUNS
  // ──────────────────────────────────────────────────────────────────
  {
    titre:        'Direct Object Pronouns — me, you, him, her, it… (A1-A2)',
    cours_nom:    'Anglais',
    langue:       'Anglais',
    categorie:    'grammaire',
    niveau:       'A1',
    description:  'Learn to use English direct object pronouns (me, you, him, her, it, us, them) to replace nouns and avoid repetition. Includes position in sentences and contrast with subject pronouns.',
    description_fr: 'Apprendre les pronoms COD en anglais : me, you, him, her, it, us, them.',
    description_en: 'Learn direct object pronouns in English.',
    description_ar: 'تعلم ضمائر المفعول به في الإنجليزية.',
    title_fr: 'Pronoms COD en anglais',
    title_en: 'Direct Object Pronouns',
    title_ar: 'ضمائر المفعول به في الإنجليزية',
    pages: [
      {
        id: 'en-dop-p1\', type: \'intro',
        title: 'Introduction — Object Pronouns',
        content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 English Grammar A1-A2</div>
  <h2>Direct Object Pronouns</h2>
  <p class="lead">Object pronouns replace nouns that receive the action of the verb. Instead of saying "I saw <em>John</em>", we say "I saw <em>him</em>." They help us avoid <strong>repetition</strong>.</p>
  <div class="lesson-objectives">
    <h4>🎯 Learning Objectives</h4>
    <ul>
      <li>Know the object pronouns: <strong>me, you, him, her, it, us, them</strong></li>
      <li>Distinguish subject vs object pronouns</li>
      <li>Place object pronouns correctly in sentences</li>
      <li>Use them after verbs and prepositions</li>
    </ul>
  </div>
</div>`,
      },
      {
        id: 'en-dop-p2\', type: \'lesson',
        title: 'Subject vs Object Pronouns',
        content: `<h3>📖 Subject vs Object Pronouns</h3>
<div class="rule-box">
  <table>
    <thead><tr><th>Person</th><th>Subject Pronoun</th><th>Object Pronoun</th><th>Example</th></tr></thead>
    <tbody>
      <tr><td>1st sing.</td><td><strong>I</strong></td><td><strong>me</strong></td><td><em>I</em> called her. / She called <em>me</em>.</td></tr>
      <tr><td>2nd sing.</td><td><strong>you</strong></td><td><strong>you</strong></td><td><em>You</em> know him. / He knows <em>you</em>.</td></tr>
      <tr><td>3rd sing. masc.</td><td><strong>he</strong></td><td><strong>him</strong></td><td><em>He</em> saw us. / We saw <em>him</em>.</td></tr>
      <tr><td>3rd sing. fem.</td><td><strong>she</strong></td><td><strong>her</strong></td><td><em>She</em> helped me. / I helped <em>her</em>.</td></tr>
      <tr><td>3rd sing. neut.</td><td><strong>it</strong></td><td><strong>it</strong></td><td><em>It</em> broke. / I broke <em>it</em>.</td></tr>
      <tr><td>1st plur.</td><td><strong>we</strong></td><td><strong>us</strong></td><td><em>We</em> left. / They invited <em>us</em>.</td></tr>
      <tr><td>3rd plur.</td><td><strong>they</strong></td><td><strong>them</strong></td><td><em>They</em> arrived. / I met <em>them</em>.</td></tr>
    </tbody>
  </table>
</div>`,
      },
      {
        id: 'en-dop-p3\', type: \'lesson',
        title: 'Using Object Pronouns',
        content: `<h3>📖 Placement and Usage</h3>
<div class="rule-box">
  <h4>Position: AFTER the verb</h4>
  <ul>
    <li>I love this song. → I love <strong>it</strong>.</li>
    <li>She called Tom. → She called <strong>him</strong>.</li>
    <li>We invited our friends. → We invited <strong>them</strong>.</li>
  </ul>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4>After prepositions</h4>
  <ul>
    <li>This is for you and <strong>me</strong>. (not "for you and I")</li>
    <li>She came with <strong>us</strong>.</li>
    <li>Can you talk to <strong>him</strong>?</li>
  </ul>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4>⚠️ Common mistakes</h4>
  <table>
    <thead><tr><th>❌ Wrong</th><th>✅ Correct</th></tr></thead>
    <tbody>
      <tr><td>Between you and I</td><td>Between you and <strong>me</strong></td></tr>
      <tr><td>She saw he.</td><td>She saw <strong>him</strong>.</td></tr>
      <tr><td>They invited we.</td><td>They invited <strong>us</strong>.</td></tr>
    </tbody>
  </table>
</div>`,
      },
      {
        id: 'en-dop-p4\', type: \'exercises',
        title: 'Exercises — Object Pronouns',
        content: `<h3>✏️ Exercises</h3>
<h4>Exercise 1 — Replace the noun with an object pronoun</h4>
<ol>
  <li>I like <u>this movie</u>. → I like _______ .</li>
  <li>She called <u>John</u>. → She called _______ .</li>
  <li>They invited <u>us and our parents</u>. → They invited _______ .</li>
  <li>He loves <u>his sister</u>. → He loves _______ .</li>
  <li>Can you help <u>me and Sarah</u>? → Can you help _______ ?</li>
</ol>
<h4>Exercise 2 — Subject or Object pronoun?</h4>
<ol>
  <li>This present is for you and _______ . (I / me)</li>
  <li>_______ and I are going to the cinema. (Her / She)</li>
  <li>Please call _______ tonight. (he / him)</li>
  <li>_______ won the game! (Them / They)</li>
</ol>`,
      },
    ],
    exercises: [
      { id:'en-dop-q1', question:"Replace the noun: 'She saw John.' →", options:['She saw he.','She saw him.','She saw his.','She saw himself.'], answer:1 },
      { id:'en-dop-q2', question:"Which sentence is correct?", options:['This is a secret between you and I.','This is a secret between you and me.','This is a secret between you and myself.','This is a secret between I and you.'], answer:1 },
      { id:'en-dop-q3', question:"'I like this song.' Replace 'this song' with a pronoun →", options:['I like he.','I like they.','I like it.','I like its.'], answer:2 },
      { id:'en-dop-q4', question:"What is the object pronoun for 'we'?", options:['we','our','us','ours'], answer:2 },
      { id:'en-dop-q5', question:"'They invited our friends.' Replace 'our friends' →", options:['They invited they.','They invited their.','They invited them.','They invited those.'], answer:2 },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 5. THE PERFECT TENSE — REVISION
  // ──────────────────────────────────────────────────────────────────
  {
    titre:        'The Present Perfect — Form, Use and Review (A2)',
    cours_nom:    'Anglais',
    langue:       'Anglais',
    categorie:    'grammaire',
    niveau:       'A2',
    description:  'Review the English present perfect tense: structure (have/has + past participle), usage (experience, recent past, unfinished actions), contrast with simple past, and irregular past participles.',
    description_fr: 'Réviser le present perfect anglais : structure, usage et participes irréguliers.',
    description_en: 'Review the present perfect tense in English.',
    description_ar: 'مراجعة الماضي التام في الإنجليزية: البنية والاستخدام والتصريفات الشاذة.',
    title_fr: 'Le present perfect en anglais',
    title_en: 'The Present Perfect — Review',
    title_ar: 'الماضي التام في الإنجليزية — مراجعة',
    pages: [
      {
        id: 'en-pp-p1\', type: \'intro',
        title: 'Introduction — The Present Perfect',
        content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 English Grammar A2</div>
  <h2>The Present Perfect</h2>
  <p class="lead">The present perfect connects the <strong>past to the present</strong>. We use it for experiences, recent events, and situations that started in the past and continue now.</p>
  <div class="lesson-objectives">
    <h4>🎯 Learning Objectives</h4>
    <ul>
      <li>Form the present perfect: <strong>have/has + past participle</strong></li>
      <li>Use it for <strong>life experiences</strong>: I have visited Paris.</li>
      <li>Use it with <strong>since/for</strong>: I have lived here for 5 years.</li>
      <li>Know key <strong>irregular past participles</strong></li>
      <li>Contrast with the <strong>simple past</strong></li>
    </ul>
  </div>
</div>`,
      },
      {
        id: 'en-pp-p2\', type: \'lesson',
        title: 'Form and Usage',
        content: `<h3>📖 Form and Uses</h3>
<div class="rule-box">
  <h4>Structure: have/has + past participle</h4>
  <table>
    <thead><tr><th>Subject</th><th>Auxiliary</th><th>Past participle</th><th>Example</th></tr></thead>
    <tbody>
      <tr><td>I / you / we / they</td><td><strong>have</strong></td><td>eaten</td><td>I <strong>have eaten</strong> pizza before.</td></tr>
      <tr><td>he / she / it</td><td><strong>has</strong></td><td>gone</td><td>She <strong>has gone</strong> home.</td></tr>
    </tbody>
  </table>
  <p>Negative: I <strong>have not / haven't</strong> seen that film.</p>
  <p>Question: <strong>Have</strong> you ever <strong>been</strong> to Japan?</p>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4>Main Uses</h4>
  <table>
    <thead><tr><th>Use</th><th>Example</th></tr></thead>
    <tbody>
      <tr><td>Life experience</td><td>I <strong>have visited</strong> London twice.</td></tr>
      <tr><td>Recent past (result now)</td><td>She <strong>has lost</strong> her keys. (she can't open the door)</td></tr>
      <tr><td>Unfinished action (since/for)</td><td>He <strong>has worked</strong> here <strong>for</strong> 10 years.</td></tr>
      <tr><td>With ever/never/already/yet</td><td>Have you <strong>ever</strong> tried sushi? / I've <strong>never</strong> been to China.</td></tr>
    </tbody>
  </table>
</div>`,
      },
      {
        id: 'en-pp-p3\', type: \'lesson',
        title: 'Irregular Past Participles',
        content: `<h3>📖 Key Irregular Past Participles</h3>
<div class="rule-box">
  <table>
    <thead><tr><th>Infinitive</th><th>Simple Past</th><th>Past Participle</th></tr></thead>
    <tbody>
      <tr><td>go</td><td>went</td><td><strong>gone</strong></td></tr>
      <tr><td>have</td><td>had</td><td><strong>had</strong></td></tr>
      <tr><td>see</td><td>saw</td><td><strong>seen</strong></td></tr>
      <tr><td>eat</td><td>ate</td><td><strong>eaten</strong></td></tr>
      <tr><td>do</td><td>did</td><td><strong>done</strong></td></tr>
      <tr><td>make</td><td>made</td><td><strong>made</strong></td></tr>
      <tr><td>take</td><td>took</td><td><strong>taken</strong></td></tr>
      <tr><td>write</td><td>wrote</td><td><strong>written</strong></td></tr>
      <tr><td>read</td><td>read</td><td><strong>read</strong></td></tr>
      <tr><td>know</td><td>knew</td><td><strong>known</strong></td></tr>
      <tr><td>give</td><td>gave</td><td><strong>given</strong></td></tr>
      <tr><td>come</td><td>came</td><td><strong>come</strong></td></tr>
      <tr><td>speak</td><td>spoke</td><td><strong>spoken</strong></td></tr>
    </tbody>
  </table>
</div>
<div class="tip-box" style="margin-top:1rem">
  <h4>💡 Simple Past vs Present Perfect</h4>
  <ul>
    <li><strong>Simple past</strong>: specific time in the past → I <em>visited Paris</em> <strong>last year</strong>.</li>
    <li><strong>Present perfect</strong>: no specific time / link to now → I <strong>have visited</strong> Paris.</li>
  </ul>
</div>`,
      },
      {
        id: 'en-pp-p4\', type: \'exercises',
        title: 'Exercises — The Present Perfect',
        content: `<h3>✏️ Exercises</h3>
<h4>Exercise 1 — Simple past or present perfect?</h4>
<ol>
  <li>I _______ (visit) Paris last summer. (specific time)</li>
  <li>She _______ (never / eat) sushi. (life experience)</li>
  <li>We _______ (live) here since 2019. (unfinished)</li>
  <li>He _______ (lose) his keys. Where are they? (recent result)</li>
</ol>
<h4>Exercise 2 — Write the past participle</h4>
<ol>
  <li>go → _______</li>
  <li>see → _______</li>
  <li>write → _______</li>
  <li>take → _______</li>
</ol>
<h4>Exercise 3 — Form a question with 'ever'</h4>
<ol>
  <li>you / ever / be / to Australia? → _______</li>
  <li>she / ever / eat / Indian food? → _______</li>
</ol>`,
      },
    ],
    exercises: [
      { id:'en-pp-q1', question:"How is the present perfect formed?", options:['be + past participle','have/has + -ing form','have/has + past participle','did + base verb'], answer:2 },
      { id:'en-pp-q2', question:"Which sentence uses the present perfect correctly?", options:['I have seen him yesterday.','She has went to Paris last year.','We have lived here for ten years.','He has worked there in 2018.'], answer:2 },
      { id:'en-pp-q3', question:"What is the past participle of 'go'?", options:['goed','went','gone','go'], answer:2 },
      { id:'en-pp-q4', question:"'Have you ever eaten sushi?' — This is used for:", options:['A future plan','A life experience','A habit in the present','A specific past time'], answer:1 },
      { id:'en-pp-q5', question:"'I visited Rome last year.' — Why is this simple past (not present perfect)?", options:['Because Rome is far away','Because the action is complete and has a specific time (last year)','Because the speaker doesn\'t remember when','Because it is a negative sentence'], answer:1 },
    ],
  },
];

// ════════════════════════════════════════════════════════════════════
// COURS ARABES — 5 topics équivalents
// ════════════════════════════════════════════════════════════════════
const AR_COURSES = [

  // ──────────────────────────────────────────────────────────────────
  // 1. المقارنة
  // ──────────────────────────────────────────────────────────────────
  {
    titre:        'المقارنة وأسلوب التفضيل في اللغة العربية (A1-A2)',
    cours_nom:    'Arabe',
    langue:       'Arabe',
    categorie:    'grammaire',
    niveau:       'A1',
    description:  'Apprendre à exprimer la comparaison et le superlatif en arabe : أسلوب التفضيل (أفعل), la comparaison avec مثل/كـ, أكثر/أقل. Inclut les formes irrégulières et les exercices pratiques.',
    description_fr: 'Apprendre la comparaison et le superlatif en arabe.',
    description_en: 'Learn comparatives and superlatives in Arabic.',
    description_ar: 'تعلم أسلوب المقارنة والتفضيل في اللغة العربية.',
    title_fr: 'Comparatif et superlatif en arabe',
    title_en: 'Comparatives and Superlatives in Arabic',
    title_ar: 'المقارنة وأسلوب التفضيل',
    pages: [
      {
        id: 'ar-comp-p1\', type: \'intro',
        title: 'مقدمة — أسلوب المقارنة والتفضيل',
        content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 Arabic Grammar A1-A2</div>
  <h2 dir="rtl">المقارنة وأسلوب التفضيل في العربية</h2>
  <p class="lead" dir="rtl">نستخدم <strong>أسلوب التفضيل</strong> للمقارنة بين شيئين أو أكثر، أو للدلالة على أن شيئًا ما هو الأفضل أو الأعلى درجةً.</p>
  <div class="lesson-objectives">
    <h4>🎯 Learning Objectives</h4>
    <ul>
      <li dir="rtl">صياغة <strong>أفعل التفضيل</strong>: أكبر، أجمل، أطول</li>
      <li dir="rtl">استخدام <strong>المقارنة بالمساواة</strong>: مثل / كـ</li>
      <li dir="rtl">استخدام <strong>أكثر / أقل</strong> + صفة</li>
      <li dir="rtl">معرفة الصيغ الشاذة: خير، شر</li>
    </ul>
  </div>
</div>`,
      },
      {
        id: 'ar-comp-p2\', type: \'lesson',
        title: 'أسلوب التفضيل — صيغة أفعل',
        content: `<h3 dir="rtl">📖 أسلوب التفضيل في العربية</h3>
<p dir="rtl">تُصاغ كلمة التفضيل على وزن <strong>أَفْعَل</strong> من الصفة الثلاثية:</p>
<div class="rule-box">
  <table dir="rtl">
    <thead><tr><th>الصفة</th><th>أفعل التفضيل</th><th>مثال</th></tr></thead>
    <tbody>
      <tr><td>كبير</td><td><strong>أَكبَر</strong></td><td>أحمد أكبر من علي.</td></tr>
      <tr><td>صغير</td><td><strong>أَصغَر</strong></td><td>فاطمة أصغر منه.</td></tr>
      <tr><td>طويل</td><td><strong>أَطوَل</strong></td><td>هذا البرج أطول من ذاك.</td></tr>
      <tr><td>جميل</td><td><strong>أَجمَل</strong></td><td>هذه الحديقة أجمل من تلك.</td></tr>
      <tr><td>سريع</td><td><strong>أَسرَع</strong></td><td>القطار أسرع من الحافلة.</td></tr>
    </tbody>
  </table>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4 dir="rtl">⚠️ الصيغ الشاذة</h4>
  <table dir="rtl">
    <thead><tr><th>الصفة</th><th>أفعل التفضيل</th></tr></thead>
    <tbody>
      <tr><td>جيد / حسن</td><td><strong>خَيْر / أَحسَن</strong></td></tr>
      <tr><td>سيئ / قبيح</td><td><strong>شَرّ / أَقبَح</strong></td></tr>
      <tr><td>كثير</td><td><strong>أَكثَر</strong></td></tr>
      <tr><td>قليل</td><td><strong>أَقَل</strong></td></tr>
    </tbody>
  </table>
</div>`,
      },
      {
        id: 'ar-comp-p3\', type: \'lesson',
        title: 'المقارنة بالمساواة وأكثر/أقل',
        content: `<h3 dir="rtl">📖 المقارنة بالمساواة والتفاوت</h3>
<div class="rule-box">
  <h4 dir="rtl">المساواة : مثل / كـ</h4>
  <ul dir="rtl">
    <li>هو <strong>مثل</strong> أخيه في الطول. (هو بنفس طول أخيه)</li>
    <li>هي ذكية <strong>كـ</strong>أختها.</li>
  </ul>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4 dir="rtl">التفاوت : أكثر / أقل + صفة + من</h4>
  <ul dir="rtl">
    <li>هذا الكتاب <strong>أكثر</strong> تعقيدًا <strong>من</strong> ذاك.</li>
    <li>هذا المسار <strong>أقل</strong> صعوبةً <strong>من</strong> الآخر.</li>
  </ul>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4 dir="rtl">أعلى درجة : أفعل + جمع / المعرَّف بـ ال</h4>
  <ul dir="rtl">
    <li>هو <strong>الأطول</strong> في الفصل. (= le plus grand)</li>
    <li>هذا <strong>أجمل</strong> مدينة في البلاد.</li>
  </ul>
</div>`,
      },
      {
        id: 'ar-comp-p4\', type: \'exercises',
        title: 'تمارين — أسلوب التفضيل',
        content: `<h3 dir="rtl">✏️ تمارين</h3>
<h4 dir="rtl">تمرين 1 — حوّل الصفة إلى أفعل التفضيل</h4>
<ol dir="rtl">
  <li>كبير → _______ (أحمد ... من علي)</li>
  <li>سريع → _______ (السيارة ... من الدراجة)</li>
  <li>جميل → _______ (هذا البستان ... من ذلك)</li>
  <li>صغير → _______ (هذا البيت ... من ذلك)</li>
</ol>
<h4 dir="rtl">تمرين 2 — أكمل بـ مثل / أكثر / أقل</h4>
<ol dir="rtl">
  <li>هو _______ أخيه في العمر. (مساواة)</li>
  <li>هذا الطريق _______ أمانًا من ذاك. (أقل)</li>
  <li>هذا المطعم _______ شهرةً في المدينة. (أكثر)</li>
</ol>`,
      },
    ],
    exercises: [
      { id:'ar-comp-q1', question:"ما هو أفعل التفضيل من 'كبير'؟", options:['كبيرًا','أكبر','الأكبر','أكثر كبيرًا'], answer:1 },
      { id:'ar-comp-q2', question:"أكمل: هذه السيارة _______ من تلك. (سريع)", options:['أسرع','سريعة','أكثر السرعة','أسرع تلك'], answer:0 },
      { id:'ar-comp-q3', question:"ما معنى 'هو مثل أخيه في الطول'؟", options:['هو أطول من أخيه','هو أقصر من أخيه','هما بنفس الطول','هو الأطول في العائلة'], answer:2 },
      { id:'ar-comp-q4', question:"ما هو التفضيل الأعلى من 'جيد'؟", options:['أجيد','جيدًا جدًا','خير / أحسن','أكثر جودة'], answer:2 },
      { id:'ar-comp-q5', question:"أكمل: هو _______ في الفصل. (الأعلى تفضيلًا من طويل)", options:['الأطول','أطول','طولًا','أكثر طولًا'], answer:0 },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 2. التعرف على الأزمنة
  // ──────────────────────────────────────────────────────────────────
  {
    titre:        'التعرف على الأزمنة الفعلية — الماضي والحاضر والمستقبل (A1-A2)',
    cours_nom:    'Arabe',
    langue:       'Arabe',
    categorie:    'grammaire',
    niveau:       'A1',
    description:  'Apprendre à identifier et à utiliser les trois temps principaux en arabe : الماضي, المضارع, et المستقبل (سـ / سوف). Inclut les indicateurs temporels et les tableaux de conjugaison.',
    description_fr: 'Identifier les trois temps en arabe : passé, présent, futur.',
    description_en: 'Identify Arabic verb tenses: past, present and future.',
    description_ar: 'التعرف على الأزمنة الفعلية الثلاثة في العربية.',
    title_fr: 'Identifier les temps en arabe',
    title_en: 'Identifying Arabic Verb Tenses',
    title_ar: 'التعرف على الأزمنة الفعلية',
    pages: [
      {
        id: 'ar-tenses-p1\', type: \'intro',
        title: 'مقدمة — الأزمنة الثلاثة',
        content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 Arabic Grammar A1-A2</div>
  <h2 dir="rtl">الأزمنة الفعلية في العربية</h2>
  <p class="lead" dir="rtl">تتميز العربية بثلاثة أزمنة رئيسية للفعل: <strong>الماضي</strong> للأحداث المنتهية، <strong>المضارع</strong> للأحداث الجارية أو المعتادة، و<strong>المستقبل</strong> للأحداث القادمة.</p>
  <div class="lesson-objectives">
    <h4>🎯 Learning Objectives</h4>
    <ul>
      <li dir="rtl">التمييز بين الماضي والمضارع والمستقبل</li>
      <li dir="rtl">التعرف على مؤشرات الزمن (أمس، الآن، غدًا...)</li>
      <li dir="rtl">تصريف الفعل في الأزمنة الثلاثة</li>
      <li dir="rtl">استخدام <strong>سـ / سوف</strong> للمستقبل</li>
    </ul>
  </div>
</div>`,
      },
      {
        id: 'ar-tenses-p2\', type: \'lesson',
        title: 'مؤشرات الزمن',
        content: `<h3 dir="rtl">📖 مؤشرات الزمن في العربية</h3>
<div class="rule-box">
  <table dir="rtl">
    <thead><tr><th>⏮️ الماضي</th><th>⏺️ الحاضر</th><th>⏭️ المستقبل</th></tr></thead>
    <tbody>
      <tr><td>أمس</td><td>الآن / الأن</td><td>غدًا</td></tr>
      <tr><td>البارحة</td><td>في الوقت الحالي</td><td>بعد غد</td></tr>
      <tr><td>الأسبوع الماضي</td><td>كل يوم / دائمًا</td><td>الأسبوع القادم</td></tr>
      <tr><td>منذ + مدة</td><td>هذا الصباح / هذا المساء</td><td>بعد + مدة</td></tr>
      <tr><td>في عام...</td><td>في العادة / عادةً</td><td>قريبًا / في المستقبل</td></tr>
    </tbody>
  </table>
</div>`,
      },
      {
        id: 'ar-tenses-p3\', type: \'lesson',
        title: 'التصريف في الأزمنة الثلاثة',
        content: `<h3 dir="rtl">📖 تصريف الفعل — كَتَبَ (مثال)</h3>
<div class="rule-box">
  <h4 dir="rtl">1. الماضي — فَعَل</h4>
  <table dir="rtl">
    <thead><tr><th>الضمير</th><th>الفعل</th></tr></thead>
    <tbody>
      <tr><td>أنا</td><td>كَتَبْتُ</td></tr>
      <tr><td>أنتَ</td><td>كَتَبْتَ</td></tr>
      <tr><td>هو</td><td>كَتَبَ</td></tr>
      <tr><td>هي</td><td>كَتَبَتْ</td></tr>
      <tr><td>نحن</td><td>كَتَبْنا</td></tr>
    </tbody>
  </table>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4 dir="rtl">2. المضارع — يَفعَل</h4>
  <table dir="rtl">
    <thead><tr><th>الضمير</th><th>الفعل</th></tr></thead>
    <tbody>
      <tr><td>أنا</td><td>أَكتُبُ</td></tr>
      <tr><td>أنتَ</td><td>تَكتُبُ</td></tr>
      <tr><td>هو</td><td>يَكتُبُ</td></tr>
      <tr><td>هي</td><td>تَكتُبُ</td></tr>
      <tr><td>نحن</td><td>نَكتُبُ</td></tr>
    </tbody>
  </table>
</div>
<div class="rule-box" style="margin-top:1rem">
  <h4 dir="rtl">3. المستقبل — سـ / سوف + المضارع</h4>
  <ul dir="rtl">
    <li>أنا <strong>سأكتب</strong> غدًا. / أنا <strong>سوف أكتب</strong> غدًا.</li>
    <li>هو <strong>سيكتب</strong> الرسالة.</li>
    <li>نحن <strong>سنكتب</strong> التقرير.</li>
  </ul>
</div>`,
      },
      {
        id: 'ar-tenses-p4\', type: \'exercises',
        title: 'تمارين — التعرف على الأزمنة',
        content: `<h3 dir="rtl">✏️ تمارين</h3>
<h4 dir="rtl">تمرين 1 — ما الزمن الذي يشير إليه كل مؤشر؟</h4>
<ol dir="rtl">
  <li>أمس → _______</li>
  <li>غدًا → _______</li>
  <li>الآن → _______</li>
  <li>الأسبوع الماضي → _______</li>
  <li>قريبًا → _______</li>
</ol>
<h4 dir="rtl">تمرين 2 — صرّف الفعل في الزمن المناسب</h4>
<ol dir="rtl">
  <li>أمس، أنا _______ (ذهب) إلى المدرسة.</li>
  <li>الآن، هو _______ (يقرأ) كتابًا.</li>
  <li>غدًا، نحن _______ (سافر) إلى باريس.</li>
  <li>كل يوم، هي _______ (شرب) قهوة.</li>
</ol>`,
      },
    ],
    exercises: [
      { id:'ar-tenses-q1', question:"أي زمن يستخدم مع 'أمس'؟", options:['المضارع','المستقبل','الماضي','الأمر'], answer:2 },
      { id:'ar-tenses-q2', question:"كيف نصيغ المستقبل في العربية؟", options:['الماضي + تاء','المضارع وحده','سـ / سوف + المضارع','كان + المضارع'], answer:2 },
      { id:'ar-tenses-q3', question:"صرّف 'كتب' في المضارع للمفرد المتكلم (أنا):", options:['كتبتُ','أكتُبُ','سأكتب','اكتب'], answer:1 },
      { id:'ar-tenses-q4', question:"أي جملة تدل على المستقبل؟", options:['ذهب أحمد إلى المدرسة.','يذهب أحمد إلى المدرسة.','سيذهب أحمد إلى المدرسة.','ذهاب أحمد إلى المدرسة.'], answer:2 },
      { id:'ar-tenses-q5', question:"ما مؤشر الزمن الحاضر من بين الخيارات التالية؟", options:['أمس','الأسبوع الماضي','الآن','غدًا'], answer:2 },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 3. مؤشرات الزمن
  // ──────────────────────────────────────────────────────────────────
  {
    titre:        'مؤشرات الزمن في العربية : منذ، خلال، قبل… (A1-A2)',
    cours_nom:    'Arabe',
    langue:       'Arabe',
    categorie:    'grammaire',
    niveau:       'A1',
    description:  'Maîtriser les expressions de temps en arabe : منذ, قبل, خلال, حتى, بعد, من…إلى, في غضون. Exprimer la durée, le début et la fin d\'une action.',
    description_fr: 'Maîtriser les expressions de temps en arabe.',
    description_en: 'Master Arabic time expressions.',
    description_ar: 'إتقان مؤشرات الزمن في العربية: منذ، قبل، خلال...',
    title_fr: 'Expressions de temps en arabe',
    title_en: 'Arabic Time Expressions',
    title_ar: 'مؤشرات الزمن في العربية',
    pages: [
      {
        id: 'ar-ind-p1\', type: \'intro',
        title: 'مقدمة — مؤشرات الزمن',
        content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 Arabic Grammar A1-A2</div>
  <h2 dir="rtl">مؤشرات الزمن في العربية</h2>
  <p class="lead" dir="rtl">تساعدنا مؤشرات الزمن على تحديد <strong>متى</strong> تحدث الأفعال، وكم <strong>مدة</strong> استمرارها، ومتى تبدأ وتنتهي.</p>
  <div class="lesson-objectives">
    <h4>🎯 Learning Objectives</h4>
    <ul>
      <li dir="rtl">استخدام <strong>منذ</strong> للحدث المستمر من الماضي</li>
      <li dir="rtl">استخدام <strong>قبل / منذ</strong> للماضي المنتهي</li>
      <li dir="rtl">استخدام <strong>خلال / في غضون</strong> للمدة</li>
      <li dir="rtl">استخدام <strong>بعد / من...إلى / حتى</strong></li>
    </ul>
  </div>
</div>`,
      },
      {
        id: 'ar-ind-p2\', type: \'lesson',
        title: 'مؤشرات الماضي والحاضر المستمر',
        content: `<h3 dir="rtl">📖 الماضي والحاضر المستمر</h3>
<div class="rule-box">
  <table dir="rtl">
    <thead><tr><th>المؤشر</th><th>الاستخدام</th><th>مثال</th></tr></thead>
    <tbody>
      <tr><td><strong>قبل</strong> + مدة</td><td>لحظة في الماضي المنتهي</td><td>انتقلت إلى هنا <strong>قبل</strong> سنتين.</td></tr>
      <tr><td><strong>منذ</strong> + مدة/تاريخ</td><td>حدث بدأ في الماضي ولا يزال مستمرًا</td><td>أسكن هنا <strong>منذ</strong> عامين. / <strong>منذ</strong> عام 2019.</td></tr>
      <tr><td><strong>خلال</strong> + مدة</td><td>مدة محددة ومنتهية</td><td>عملتُ <strong>خلال</strong> ثلاث ساعات.</td></tr>
      <tr><td><strong>حتى / إلى</strong></td><td>نهاية زمنية</td><td>عملتُ <strong>حتى</strong> منتصف الليل.</td></tr>
    </tbody>
  </table>
</div>
<div class="tip-box" style="margin-top:1rem">
  <h4 dir="rtl">💡 الفرق بين منذ و قبل</h4>
  <ul dir="rtl">
    <li><strong>منذ</strong> → الحدث لا يزال مستمرًا: أسكن هنا <strong>منذ</strong> خمس سنوات. (لا أزال هنا)</li>
    <li><strong>قبل</strong> → الحدث انتهى: وصلتُ <strong>قبل</strong> خمس سنوات.</li>
  </ul>
</div>`,
      },
      {
        id: 'ar-ind-p3\', type: \'lesson',
        title: 'مؤشرات المدة والمستقبل',
        content: `<h3 dir="rtl">📖 المدة والمستقبل</h3>
<div class="rule-box">
  <table dir="rtl">
    <thead><tr><th>المؤشر</th><th>الاستخدام</th><th>مثال</th></tr></thead>
    <tbody>
      <tr><td><strong>في غضون</strong> + مدة</td><td>مدة لإنجاز شيء</td><td>أنهيتُ الكتاب <strong>في غضون</strong> يومين.</td></tr>
      <tr><td><strong>لمدة</strong> + مدة</td><td>مدة محددة (= pendant)</td><td>درستُ <strong>لمدة</strong> ساعتين.</td></tr>
      <tr><td><strong>بعد</strong> + مدة</td><td>بعد انقضاء وقت (مستقبل)</td><td>سأصل <strong>بعد</strong> عشر دقائق.</td></tr>
      <tr><td><strong>من...إلى</strong></td><td>فترة زمنية محددة</td><td>أعمل <strong>من</strong> التاسعة <strong>إلى</strong> الخامسة.</td></tr>
      <tr><td><strong>ابتداءً من</strong></td><td>نقطة البداية (= à partir de)</td><td><strong>ابتداءً من</strong> الاثنين، أعمل هنا.</td></tr>
    </tbody>
  </table>
</div>`,
      },
      {
        id: 'ar-ind-p4\', type: \'exercises',
        title: 'تمارين — مؤشرات الزمن',
        content: `<h3 dir="rtl">✏️ تمارين</h3>
<h4 dir="rtl">تمرين 1 — اختر المؤشر الصحيح</h4>
<ol dir="rtl">
  <li>أدرس اللغة العربية _______ ثلاث سنوات. (منذ / قبل)</li>
  <li>مشينا _______ ساعتين. (لمدة / بعد)</li>
  <li>أنهى التقرير _______ يوم واحد. (في غضون / منذ)</li>
  <li>سيصل القطار _______ خمس دقائق. (بعد / منذ)</li>
  <li>أعمل _______ الثامنة _______ الرابعة. (من...إلى)</li>
</ol>
<h4 dir="rtl">تمرين 2 — منذ أم قبل؟</h4>
<ol dir="rtl">
  <li>وصلنا _______ ساعتين. (الحدث منتهٍ)</li>
  <li>هو يسكن في باريس _______ عشر سنوات. (الحدث مستمر)</li>
</ol>`,
      },
    ],
    exercises: [
      { id:'ar-ind-q1', question:"أي تعبير يدل على حدث مستمر من الماضي إلى الآن؟", options:['قبل','خلال','منذ','بعد'], answer:2 },
      { id:'ar-ind-q2', question:"أكمل: أنهيتُ التمرين _______ عشر دقائق. (مدة لإنجاز)", options:['منذ','لمدة','في غضون','قبل'], answer:2 },
      { id:'ar-ind-q3', question:"أكمل: ستبدأ الحصة _______ ربع ساعة. (مستقبل)", options:['منذ','لمدة','قبل','بعد'], answer:3 },
      { id:'ar-ind-q4', question:"'درستُ لمدة ثلاث ساعات' تعني:", options:['أنا أدرس الآن','درستُ منذ ثلاث ساعات وأنا أدرس','استمر الدراسة ثلاث ساعات وانتهت','سأدرس بعد ثلاث ساعات'], answer:2 },
      { id:'ar-ind-q5', question:"أي الجمل صحيحة؟", options:['أسكن هنا قبل خمس سنوات (لا أزال).','أسكن هنا منذ خمس سنوات.','وصلتُ منذ خمس سنوات (الحدث انتهى).','درستُ بعد ساعتين (الماضي).'], answer:1 },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 4. ضمائر المفعول به
  // ──────────────────────────────────────────────────────────────────
  {
    titre:        'ضمائر المفعول به المباشر في العربية (A1-A2)',
    cours_nom:    'Arabe',
    langue:       'Arabe',
    categorie:    'grammaire',
    niveau:       'A1',
    description:  'Apprendre à utiliser les pronoms affixes (ضمائر المفعول به المتصلة) en arabe pour remplacer le complément d\'objet direct. Tableaux des suffixes, placement et exemples pratiques.',
    description_fr: 'Apprendre les pronoms COD en arabe (ضمائر المفعول به).',
    description_en: 'Learn Arabic direct object pronouns (suffixed pronouns).',
    description_ar: 'تعلم ضمائر المفعول به المتصلة في العربية.',
    title_fr: 'Pronoms COD en arabe',
    title_en: 'Arabic Object Pronouns',
    title_ar: 'ضمائر المفعول به في العربية',
    pages: [
      {
        id: 'ar-dop-p1\', type: \'intro',
        title: 'مقدمة — ضمائر المفعول به',
        content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 Arabic Grammar A1-A2</div>
  <h2 dir="rtl">ضمائر المفعول به المتصلة</h2>
  <p class="lead" dir="rtl">ضمائر المفعول به المتصلة هي ضمائر تُلحق بنهاية الفعل لتحلّ محل الاسم المفعول به وتتجنب التكرار.</p>
  <div class="lesson-objectives">
    <h4>🎯 Learning Objectives</h4>
    <ul>
      <li dir="rtl">معرفة الضمائر المتصلة: <strong>ـني، ـك، ـه، ـها، ـنا، ـكم، ـهم</strong></li>
      <li dir="rtl">إلحاق الضمير بالفعل بشكل صحيح</li>
      <li dir="rtl">التمييز بين ضمائر المفعول والفاعل</li>
    </ul>
  </div>
</div>`,
      },
      {
        id: 'ar-dop-p2\', type: \'lesson',
        title: 'ضمائر المفعول به المتصلة — الجدول',
        content: `<h3 dir="rtl">📖 جدول الضمائر المتصلة</h3>
<div class="rule-box">
  <table dir="rtl">
    <thead><tr><th>الضمير</th><th>اللاحقة</th><th>مثال (كتب)</th><th>المعنى</th></tr></thead>
    <tbody>
      <tr><td>أنا</td><td><strong>ـني</strong></td><td>كَتَبَني (نادرًا) / رآني</td><td>Il m'a vu</td></tr>
      <tr><td>أنتَ (م.)</td><td><strong>ـك</strong></td><td>كَتَبَك / رآك</td><td>Il t'a vu</td></tr>
      <tr><td>هو</td><td><strong>ـه</strong></td><td>كَتَبَه / رآه</td><td>Il l'a vu (masc.)</td></tr>
      <tr><td>هي</td><td><strong>ـها</strong></td><td>كَتَبَها / رآها</td><td>Il l'a vu (fém.)</td></tr>
      <tr><td>نحن</td><td><strong>ـنا</strong></td><td>كَتَبَنا / رآنا</td><td>Il nous a vus</td></tr>
      <tr><td>أنتم</td><td><strong>ـكم</strong></td><td>كَتَبَكم / رآكم</td><td>Il vous a vus</td></tr>
      <tr><td>هم</td><td><strong>ـهم</strong></td><td>كَتَبَهم / رآهم</td><td>Il les a vus</td></tr>
    </tbody>
  </table>
</div>
<div class="tip-box" style="margin-top:1rem">
  <h4 dir="rtl">💡 طريقة الإلحاق</h4>
  <p dir="rtl">تُلحَق اللاحقة مباشرةً بنهاية الفعل: رأى + ـه = <strong>رآه</strong> / كَتَبَ + ـها = <strong>كَتَبَها</strong></p>
</div>`,
      },
      {
        id: 'ar-dop-p3\', type: \'lesson',
        title: 'أمثلة وتدريب',
        content: `<h3 dir="rtl">📖 أمثلة تطبيقية</h3>
<div class="rule-box">
  <h4 dir="rtl">استبدال المفعول به بالضمير</h4>
  <table dir="rtl">
    <thead><tr><th>الجملة الأصلية</th><th>مع الضمير</th></tr></thead>
    <tbody>
      <tr><td>رأيتُ <u>أحمد</u>.</td><td>رأيتُ<strong>ه</strong>. (ضمير الغائب المفرد المذكر)</td></tr>
      <tr><td>سمعتُ <u>فاطمة</u>.</td><td>سمعتُ<strong>ها</strong>. (ضمير الغائب المفرد المؤنث)</td></tr>
      <tr><td>ساعدَ المعلمُ <u>الطلابَ</u>.</td><td>ساعدَ<strong>هم</strong>. (ضمير الغائب الجمع)</td></tr>
      <tr><td>أحبّتني <u>أمي</u>.</td><td>أحبّ<strong>تني</strong>. (ضمير المتكلم المفرد)</td></tr>
      <tr><td>دعا المدير <u>الموظفين</u>.</td><td>دعا<strong>هم</strong>.</td></tr>
    </tbody>
  </table>
</div>`,
      },
      {
        id: 'ar-dop-p4\', type: \'exercises',
        title: 'تمارين — ضمائر المفعول به',
        content: `<h3 dir="rtl">✏️ تمارين</h3>
<h4 dir="rtl">تمرين 1 — استبدل المفعول به بالضمير المناسب</h4>
<ol dir="rtl">
  <li>رأيتُ <u>الكتاب</u>. → رأيتُ_______.</li>
  <li>زرنا <u>الأستاذة</u>. → زرنا_______.</li>
  <li>يعرف المدير <u>الموظفين</u>. → يعرف_______.</li>
  <li>أحبّتِ الأمُّ <u>أولادها</u>. → أحبّت_______.</li>
</ol>
<h4 dir="rtl">تمرين 2 — أكمل بالضمير الصحيح</h4>
<ol dir="rtl">
  <li>هل رأيتَ الفيلم؟ — نعم، رأيتُ_______ أمس.</li>
  <li>هل تعرف أختي؟ — نعم، أعرف_______.</li>
  <li>هل سمعوا الأغنية؟ — نعم، سمعو_______.</li>
</ol>`,
      },
    ],
    exercises: [
      { id:'ar-dop-q1', question:"ما اللاحقة الدالة على المفعول 'هو' (مفرد مذكر غائب)؟", options:['ـني','ـك','ـه','ـها'], answer:2 },
      { id:'ar-dop-q2', question:"حوّل: 'رأيتُ فاطمة.' →", options:['رأيتُه.','رأيتُها.','رأيتُهم.','رأيتُك.'], answer:1 },
      { id:'ar-dop-q3', question:"ما معنى 'ساعدَهم'؟", options:['Il l\'a aidée.','Il l\'a aidé.','Il les a aidés.','Il nous a aidés.'], answer:2 },
      { id:'ar-dop-q4', question:"أي ضمير يدل على 'نحن' كمفعول به؟", options:['ـنا','ـكم','ـهم','ـني'], answer:0 },
      { id:'ar-dop-q5', question:"اختر الجملة الصحيحة:", options:['رأيتُهو.','رأيتُه.','رأيته هو.','رأيتُي.'], answer:1 },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 5. الماضي المركب — مراجعة
  // ──────────────────────────────────────────────────────────────────
  {
    titre:        'الماضي التام في العربية وما يقابله في الفرنسية (A2)',
    cours_nom:    'Arabe',
    langue:       'Arabe',
    categorie:    'grammaire',
    niveau:       'A2',
    description:  'Comprendre comment l\'arabe exprime les actions passées et terminées, le parallèle avec le passé composé français. Révision du passé simple arabe (الفعل الماضي), ses formes et usages.',
    description_fr: 'Comprendre le passé en arabe et son parallèle avec le passé composé français.',
    description_en: 'Understand how Arabic expresses past tense, compared to the French passé composé.',
    description_ar: 'مراجعة الفعل الماضي في العربية وأوجه التشابه مع الماضي المركب الفرنسي.',
    title_fr: 'Le passé en arabe — révisions',
    title_en: 'Arabic Past Tense — Review',
    title_ar: 'الفعل الماضي في العربية — مراجعة شاملة',
    pages: [
      {
        id: 'ar-past-p1\', type: \'intro',
        title: 'مقدمة — الفعل الماضي',
        content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 Arabic Grammar A2</div>
  <h2 dir="rtl">الفعل الماضي في العربية — مراجعة</h2>
  <p class="lead" dir="rtl">يعبّر <strong>الفعل الماضي</strong> في العربية عن حدث مكتمل ومنته، وهو ما يقابل <em>le passé composé</em> في الفرنسية. يتميّز بأنه يُبنى على الفتح عادةً.</p>
  <div class="lesson-objectives">
    <h4>🎯 Learning Objectives</h4>
    <ul>
      <li dir="rtl">مراجعة تصريف الفعل الماضي الثلاثي الصحيح</li>
      <li dir="rtl">مراجعة الأفعال الشائعة المتصرفة بشكل شاذ</li>
      <li dir="rtl">التمييز بين الماضي والمضارع</li>
      <li dir="rtl">ربط الماضي العربي بالمفاهيم الفرنسية المكتسبة</li>
    </ul>
  </div>
</div>`,
      },
      {
        id: 'ar-past-p2\', type: \'lesson',
        title: 'تصريف الفعل الماضي الثلاثي',
        content: `<h3 dir="rtl">📖 تصريف الفعل الماضي — ذهب</h3>
<div class="rule-box">
  <table dir="rtl">
    <thead><tr><th>الضمير</th><th>ذهب</th><th>كتب</th><th>أكل</th></tr></thead>
    <tbody>
      <tr><td>أنا</td><td>ذَهَبْتُ</td><td>كَتَبْتُ</td><td>أَكَلْتُ</td></tr>
      <tr><td>أنتَ</td><td>ذَهَبْتَ</td><td>كَتَبْتَ</td><td>أَكَلْتَ</td></tr>
      <tr><td>أنتِ</td><td>ذَهَبْتِ</td><td>كَتَبْتِ</td><td>أَكَلْتِ</td></tr>
      <tr><td>هو</td><td>ذَهَبَ</td><td>كَتَبَ</td><td>أَكَلَ</td></tr>
      <tr><td>هي</td><td>ذَهَبَتْ</td><td>كَتَبَتْ</td><td>أَكَلَتْ</td></tr>
      <tr><td>نحن</td><td>ذَهَبْنا</td><td>كَتَبْنا</td><td>أَكَلْنا</td></tr>
      <tr><td>هم</td><td>ذَهَبُوا</td><td>كَتَبُوا</td><td>أَكَلُوا</td></tr>
    </tbody>
  </table>
</div>
<div class="tip-box" style="margin-top:1rem">
  <h4 dir="rtl">💡 الفعل الماضي العربي مقابل الفرنسي</h4>
  <p dir="rtl">بخلاف الفرنسية التي تستخدم مساعدَيْن (être/avoir + participe passé)، تُعبّر العربية عن الماضي بفعل واحد مصرَّف مباشرةً بالضمير.</p>
  <ul dir="rtl">
    <li>فرنسي: <em>Il est allé</em> (être + allé)</li>
    <li>عربي: <strong>ذَهَبَ</strong> (فعل واحد كامل)</li>
  </ul>
</div>`,
      },
      {
        id: 'ar-past-p3\', type: \'lesson',
        title: 'أفعال ماضية شائعة وشاذة',
        content: `<h3 dir="rtl">📖 أفعال ماضية شائعة ومتصرفات شاذة</h3>
<div class="rule-box">
  <table dir="rtl">
    <thead><tr><th>الفعل المضارع</th><th>الماضي (هو)</th><th>المعنى</th></tr></thead>
    <tbody>
      <tr><td>يذهب</td><td><strong>ذَهَبَ</strong></td><td>aller / went</td></tr>
      <tr><td>يجيء / يأتي</td><td><strong>جاءَ</strong></td><td>venir / came</td></tr>
      <tr><td>يقول</td><td><strong>قالَ</strong></td><td>dire / said</td></tr>
      <tr><td>يرى</td><td><strong>رأى</strong></td><td>voir / saw</td></tr>
      <tr><td>يأخذ</td><td><strong>أخَذَ</strong></td><td>prendre / took</td></tr>
      <tr><td>يعطي</td><td><strong>أَعطى</strong></td><td>donner / gave</td></tr>
      <tr><td>يعرف</td><td><strong>عَرَفَ</strong></td><td>savoir / knew</td></tr>
      <tr><td>يستطيع</td><td><strong>اسْتَطاعَ</strong></td><td>pouvoir / could</td></tr>
      <tr><td>يشرب</td><td><strong>شَرِبَ</strong></td><td>boire / drank</td></tr>
      <tr><td>يقرأ</td><td><strong>قَرَأَ</strong></td><td>lire / read</td></tr>
    </tbody>
  </table>
</div>`,
      },
      {
        id: 'ar-past-p4\', type: \'exercises',
        title: 'تمارين — الفعل الماضي',
        content: `<h3 dir="rtl">✏️ تمارين</h3>
<h4 dir="rtl">تمرين 1 — صرّف الفعل في الماضي</h4>
<ol dir="rtl">
  <li>أنا / ذهب → _______</li>
  <li>هي / كتب → _______</li>
  <li>هم / أكل → _______</li>
  <li>نحن / شرب → _______</li>
  <li>أنتَ / قرأ → _______</li>
</ol>
<h4 dir="rtl">تمرين 2 — أكمل الجمل بالفعل الماضي المناسب</h4>
<ol dir="rtl">
  <li>أمس، _______ (هي / ذهب) إلى المدرسة.</li>
  <li>الأسبوع الماضي، نحن _______ (شرب) قهوة معًا.</li>
  <li>البارحة، هو _______ (قرأ) الكتاب كله.</li>
</ol>
<h4 dir="rtl">تمرين 3 — صحّح الأخطاء</h4>
<ol dir="rtl">
  <li>هي ذَهَبَ إلى البيت. → _______</li>
  <li>هم كَتَبَ الدرس. → _______</li>
</ol>`,
      },
    ],
    exercises: [
      { id:'ar-past-q1', question:"على ماذا يدل الفعل الماضي في العربية؟", options:['حدث في المستقبل','حدث في الحاضر','حدث مكتمل ومنتهٍ','حدث متكرر'], answer:2 },
      { id:'ar-past-q2', question:"ما تصريف 'ذهب' للضمير 'هي'؟", options:['ذَهَبَ','ذَهَبَت','ذَهَبْتِ','ذَهَبُوا'], answer:1 },
      { id:'ar-past-q3', question:"ما الفرق الرئيسي بين الماضي العربي والفرنسي (passé composé)؟", options:['العربية تستخدم مساعدًا (être/avoir)','الفرنسية فعل واحد، العربية اثنان','العربية فعل واحد، الفرنسية مساعد + اسم المفعول','لا فرق بينهما'], answer:2 },
      { id:'ar-past-q4', question:"ما الماضي من الفعل 'يقول' للمفرد المذكر الغائب (هو)؟", options:['يقول','قُلْتُ','قالَ','قُولُوا'], answer:2 },
      { id:'ar-past-q5', question:"أكمل: الأسبوع الماضي، هم _______ إلى المكتبة.", options:['يذهبون','سيذهبون','ذهبوا','اذهبوا'], answer:2 },
    ],
  },
];

// ════════════════════════════════════════════════════════════════════
// DÉTECTION DES DOUBLONS
// ════════════════════════════════════════════════════════════════════
const FR_DETECT = [
  ['comparaison', 'comparatif', 'superlatif', 'meilleur', 'plus grand'],
  ['identifier les temps', 'passé composé présent futur', 'passé présent futur'],
  ['indicateurs de temps', 'depuis', 'pendant', 'il y a', 'prépositions de temps'],
  ['pronoms cod', 'complément d\'objet direct', 'pronoms cod'],
  ['passé composé', 'révisions', 'auxiliaire être avoir', 'participe passé révision'],
];

const EN_DETECT = [
  ['comparative', 'superlative', 'bigger than', 'the best'],
  ['identifying tenses', 'past present future', 'simple past present'],
  ['time expression', 'since', 'for', 'ago', 'during', 'until'],
  ['object pronoun', 'direct object pronoun', 'him her them'],
  ['present perfect', 'have has past participle', 'perfect tense review'],
];

const AR_DETECT = [
  ['مقارنة', 'تفضيل', 'أفعل', 'أكبر', 'أجمل'],
  ['التعرف على الأزمنة', 'الماضي المضارع المستقبل', 'أزمنة فعلية'],
  ['مؤشرات الزمن', 'منذ', 'خلال', 'لمدة', 'قبل'],
  ['ضمائر المفعول به', 'ضمائر متصلة', 'لاحقة الضمير'],
  ['الماضي التام', 'الفعل الماضي', 'تصريف الماضي', 'مراجعة الماضي'],
];

// ════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════
function detectDuplicate(existing, detectList, idx, newTitre) {
  if (existing.some(c => c.titre === newTitre)) return true;
  const joined = existing.map(c => (c.titre || '') + ' ' + (c.description || '')).join(' | ').toLowerCase();
  return detectList[idx].some(kw => joined.includes(kw.toLowerCase()));
}

async function createCourse(pb, course) {
  const payload = {
    titre:          course.titre,
    cours_nom:      course.cours_nom,
    langue:         course.langue,
    categorie:      course.categorie    || 'grammaire',
    categorie_age:  course.categorie_age || 'Adultes',
    section:        course.section      || 'langues',
    niveau:         course.niveau       || 'A1',
    course_type:    'standard',
    prix:           course.prix         ?? 0,
    duree:          course.duree        ?? 30,
    description:    course.description  || '',
    description_fr: course.description_fr || '',
    description_en: course.description_en || '',
    description_ar: course.description_ar || '',
    title_fr:       course.title_fr     || '',
    title_en:       course.title_en     || (course.langue === 'Anglais'  ? course.titre : ''),
    title_ar:       course.title_ar     || (course.langue === 'Arabe'    ? course.titre : ''),
    pages:          JSON.stringify(course.pages     || []),
    exercises:      JSON.stringify(course.exercises || []),
  };
  return pb.collection('courses').create(payload, { requestKey: null });
}

// ════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════
async function main() {
  console.log('\n🌐 create-new-5-grammar-courses.mjs');
  console.log('='.repeat(65));
  console.log('   5 cours FR + 5 EN + 5 AR (comparaison, temps, indicateurs,');
  console.log('   pronoms COD, passé composé révisions)\n');

  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);

  try {
    await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  } catch (e) {
    console.error('Connexion PocketBase échouée :', e.message);
    process.exit(1);
  }
  console.log('Connecté à PocketBase (' + PB_URL + ')\n');

  const allCourses = await pb.collection('courses').getFullList({ requestKey: null });

  const existingFR = allCourses.filter(c => c.langue === 'Francais'  && c.course_type === 'standard');
  const existingEN = allCourses.filter(c => c.langue === 'Anglais'   && c.course_type === 'standard');
  const existingAR = allCourses.filter(c => c.langue === 'Arabe'     && c.course_type === 'standard');

  console.log('Standards existants : ' + existingFR.length + ' FR / ' + existingEN.length + ' EN / ' + existingAR.length + ' AR');
  console.log('');

  let created = 0, skipped = 0, errors = 0;

  // ── COURS FRANÇAIS ──────────────────────────────────────────────
  console.log('COURS FRANÇAIS\n' + '-'.repeat(50));
  for (let i = 0; i < FR_COURSES.length; i++) {
    const course = FR_COURSES[i];
    if (detectDuplicate(existingFR, FR_DETECT, i, course.titre)) {
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
      console.error('    ERREUR: ' + e.message);
      errors++;
    }
  }

  // ── COURS ANGLAIS ──────────────────────────────────────────────
  console.log('\nCOURS ANGLAIS\n' + '-'.repeat(50));
  for (let i = 0; i < EN_COURSES.length; i++) {
    const course = EN_COURSES[i];
    if (detectDuplicate(existingEN, EN_DETECT, i, course.titre)) {
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
      console.error('    ERREUR: ' + e.message);
      errors++;
    }
  }

  // ── COURS ARABES ──────────────────────────────────────────────
  console.log('\nCOURS ARABES\n' + '-'.repeat(50));
  for (let i = 0; i < AR_COURSES.length; i++) {
    const course = AR_COURSES[i];
    if (detectDuplicate(existingAR, AR_DETECT, i, course.titre)) {
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
      console.error('    ERREUR: ' + e.message);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(65));
  console.log('Résultats : ' + created + ' créés / ' + skipped + ' déjà existants / ' + errors + ' erreurs');
  if (errors > 0) console.log('Relancez le script pour réessayer les erreurs.');
  console.log('');
}

main().catch(e => { console.error('Erreur fatale :', e.message); process.exit(1); });
