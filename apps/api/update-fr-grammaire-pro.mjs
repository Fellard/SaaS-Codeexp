/**
 * update-fr-grammaire-pro.mjs
 * ════════════════════════════════════════════════════════════════════
 * Injecte des cours pédagogiques PROFESSIONNELS pour les cours de
 * grammaire française qui ont reçu un contenu générique ou incorrect.
 *
 * Cible les cours par mots-clés dans le titre :
 *   • La phrase interrogative
 *   • L'interrogation (registres de langue)
 *   • L'accord et la place des adjectifs
 *   • L'hypothèse sur le futur
 *   • L'impératif
 *   • Compréhension orale — modules thématiques (loisirs, ville, météo…)
 *   • Lettre de Londres
 *   • Le voyage / texte de lecture
 *
 * Usage :
 *   cd apps/api && node update-fr-grammaire-pro.mjs
 *   node update-fr-grammaire-pro.mjs --dry-run
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
const DRY_RUN  = process.argv.includes('--dry-run');

// ════════════════════════════════════════════════════════════════════
// BIBLIOTHÈQUE DE COURS PÉDAGOGIQUES PRO
// Format : { match: fn(titre) → bool, pages: [...] }
// ════════════════════════════════════════════════════════════════════

const COURSES_PRO = [

  // ──────────────────────────────────────────────────────────────────
  // 1. LA PHRASE INTERROGATIVE
  // ──────────────────────────────────────────────────────────────────
  {
    match: t => t.includes('phrase interrogative') || (t.includes('interrogati') && !t.includes('registre')),
    pages: [
      {
        id: 'int-p1', type: 'intro',
        title: 'Introduction — La phrase interrogative',
        content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 Grammaire Française A1</div>
  <h2>La phrase interrogative en français</h2>
  <p class="lead">En français, on peut poser une question de <strong>trois manières différentes</strong>. Chaque manière correspond à un niveau de langue différent.</p>
  <div class="lesson-objectives">
    <h4>🎯 Objectifs de cette leçon</h4>
    <ul>
      <li>Former des questions avec <strong>l'intonation montante</strong> (oral familier)</li>
      <li>Utiliser <strong>Est-ce que</strong> (oral standard)</li>
      <li>Maîtriser l'<strong>inversion sujet-verbe</strong> (écrit soutenu)</li>
      <li>Employer les mots interrogatifs : <em>qui, que, quoi, où, quand, comment, pourquoi, combien</em></li>
    </ul>
  </div>
  <div class="lesson-highlight"><strong>Dans cette leçon :</strong> intonation · est-ce que · inversion · qui · quoi · où · quand · comment · pourquoi · combien</div>
</div>`,
      },
      {
        id: 'int-p2', type: 'lesson',
        title: 'Les 3 façons de poser une question',
        content: `<h3>3 structures pour interroger</h3>
<div class="rule-box">
  <div class="rule-icon">1️⃣</div>
  <div>
    <strong>Intonation montante</strong> — oral familier (↗️)<br/>
    On garde l'ordre normal de la phrase, la voix monte à la fin.
    <ul>
      <li>Tu <strong>parles</strong> français ?<span class="inline-trans">= Do you speak French?</span></li>
      <li>Il <strong>vient</strong> demain ?</li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">2️⃣</div>
  <div>
    <strong>Est-ce que…</strong> — oral standard (neutre)
    <ul>
      <li><strong>Est-ce que</strong> tu parles français ?<span class="inline-trans">= Do you speak French?</span></li>
      <li><strong>Est-ce qu'</strong>il vient demain ? (devant voyelle)</li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">3️⃣</div>
  <div>
    <strong>Inversion sujet-verbe</strong> — écrit formel / soutenu
    <ul>
      <li><strong>Parles</strong>-<strong>tu</strong> français ?<span class="inline-trans">= Do you speak French?</span></li>
      <li><strong>Vient</strong>-<strong>il</strong> demain ? · <strong>Mange</strong>-<strong>t</strong>-elle ici ?</li>
    </ul>
  </div>
</div>
<div class="info-box">💡 Le <strong>-t-</strong> euphonique s'ajoute entre un verbe terminant par une voyelle et il/elle/on : <em>Mange-<strong>t</strong>-il ?</em></div>`,
      },
      {
        id: 'int-p3', type: 'lesson',
        title: 'Mots interrogatifs — Qui, Que, Où, Quand…',
        content: `<h3>Les mots interrogatifs essentiels</h3>
<div class="summary-table">
  <div class="summary-row header"><div>Mot</div><div>Question posée</div><div>Exemple</div></div>
  <div class="summary-row"><div><span class="prep">qui</span></div><div>Personne (sujet ou objet)</div><div><strong>Qui</strong> est-ce ? · <strong>Qui</strong> vois-tu ?</div></div>
  <div class="summary-row"><div><span class="prep">que / quoi</span></div><div>Chose (objet)</div><div><strong>Que</strong> fais-tu ? · Tu fais <strong>quoi</strong> ?</div></div>
  <div class="summary-row"><div><span class="prep">où</span></div><div>Lieu</div><div><strong>Où</strong> habitez-vous ?</div></div>
  <div class="summary-row"><div><span class="prep">quand</span></div><div>Temps</div><div><strong>Quand</strong> part-il ?</div></div>
  <div class="summary-row"><div><span class="prep">comment</span></div><div>Manière</div><div><strong>Comment</strong> allez-vous ?</div></div>
  <div class="summary-row"><div><span class="prep">pourquoi</span></div><div>Cause / raison</div><div><strong>Pourquoi</strong> pleurez-vous ?</div></div>
  <div class="summary-row"><div><span class="prep">combien</span></div><div>Quantité / prix</div><div><strong>Combien</strong> ça coûte ?</div></div>
  <div class="summary-row"><div><span class="prep">quel(le)</span></div><div>Choix parmi plusieurs</div><div><strong>Quel</strong> film tu regardes ?</div></div>
</div>
<div class="compare-box">
  <div class="compare-item good">✅ <strong>Qui</strong> est là ? (personne — sujet)</div>
  <div class="compare-item good">✅ Tu vois <strong>qui</strong> ? / <strong>Qui</strong> vois-tu ? (personne — objet)</div>
  <div class="compare-item good">✅ Tu fais <strong>quoi</strong> ? / <strong>Que</strong> fais-tu ? (chose — objet)</div>
</div>`,
      },
      {
        id: 'int-p4', type: 'lesson',
        title: 'Questions avec prépositions — À qui, De qui, Avec qui…',
        content: `<h3>Prépositions + mots interrogatifs</h3>
<div class="rule-box">
  <div class="rule-icon">🔗</div>
  <div>
    Les prépositions se placent <strong>avant</strong> le mot interrogatif :
    <ul>
      <li><strong>À qui</strong> tu téléphones ?<span class="inline-trans">= Who are you calling?</span></li>
      <li><strong>De qui</strong> tu parles ?<span class="inline-trans">= Who are you talking about?</span></li>
      <li><strong>Avec qui</strong> tu travailles ?<span class="inline-trans">= Who do you work with?</span></li>
      <li><strong>Pour quoi</strong> est-ce qu'il vient ? → <strong>Pourquoi</strong> vient-il ?</li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">📍</div>
  <div>
    <strong>D'où / Par où / Jusqu'où</strong>
    <ul>
      <li><strong>D'où</strong> viens-tu ?<span class="inline-trans">= Where are you from?</span></li>
      <li><strong>Par où</strong> est-ce qu'on passe ?<span class="inline-trans">= Which way do we go?</span></li>
    </ul>
  </div>
</div>
<div class="lesson-highlight" style="margin-top:1rem">🎓 Vous avez terminé la leçon ! Passez aux <strong>Exercices</strong> pour tester vos connaissances.</div>`,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 2. L'INTERROGATION — REGISTRES DE LANGUE
  // ──────────────────────────────────────────────────────────────────
  {
    match: t => t.includes('registre') && t.includes('interrogat'),
    pages: [
      {
        id: 'reg-p1', type: 'intro',
        title: 'Introduction — Registres de langue',
        content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 Grammaire Française A1</div>
  <h2>L'interrogation et les registres de langue</h2>
  <p class="lead">En français, la même question peut s'exprimer de plusieurs façons selon la situation. C'est ce qu'on appelle les <strong>registres de langue</strong> : familier, courant, soutenu.</p>
  <div class="lesson-objectives">
    <h4>🎯 Objectifs de cette leçon</h4>
    <ul>
      <li>Identifier les 3 registres de langue en français</li>
      <li>Choisir le registre adapté à la situation (conversation, lettre, email…)</li>
      <li>Transformer une question d'un registre à l'autre</li>
      <li>Éviter les mélanges de registres</li>
    </ul>
  </div>
  <div class="lesson-highlight"><strong>Registres :</strong> familier (amis) · courant (quotidien) · soutenu (formel/écrit)</div>
</div>`,
      },
      {
        id: 'reg-p2', type: 'lesson',
        title: 'Le registre familier — oral informel',
        content: `<h3>🗣️ Registre familier — entre amis, famille</h3>
<p>Dans le registre <strong>familier</strong>, on simplifie au maximum. La question se fait par l'intonation ou avec des formules raccourcies.</p>
<div class="rule-box">
  <div class="rule-icon">😎</div>
  <div>
    <strong>Caractéristiques :</strong>
    <ul>
      <li><strong>Intonation montante</strong> : Tu viens ? / Il est là ?</li>
      <li><strong>C'est quoi ?</strong> / <strong>T'as</strong> (tu as) / <strong>J'suis</strong> (je suis)</li>
      <li>Suppression du <strong>ne</strong> : Je sais <strong>pas</strong>. (≠ Je ne sais pas)</li>
      <li>Vocabulaire simplifié : <em>bouquin</em> (livre), <em>bagnole</em> (voiture)</li>
    </ul>
  </div>
</div>
<div class="compare-box">
  <div class="compare-item good">😎 T'as faim ? (familier)</div>
  <div class="compare-item good">😐 Est-ce que tu as faim ? (courant)</div>
  <div class="compare-item special">🎩 As-tu faim ? (soutenu)</div>
</div>`,
      },
      {
        id: 'reg-p3', type: 'lesson',
        title: 'Le registre courant — neutre et universel',
        content: `<h3>😐 Registre courant — utilisé partout au quotidien</h3>
<p>Le registre <strong>courant</strong> est le niveau standard utilisé dans la vie quotidienne, les médias, les conversations normales.</p>
<div class="rule-box">
  <div class="rule-icon">📱</div>
  <div>
    <strong>Caractéristiques :</strong>
    <ul>
      <li><strong>Est-ce que</strong> pour la question : Est-ce que tu viens ?</li>
      <li><strong>Ne…pas</strong> conservé : Je ne sais pas.</li>
      <li>Vocabulaire standard : <em>livre, voiture, travail</em></li>
      <li>Phrases complètes, correctes, naturelles</li>
    </ul>
  </div>
</div>`,
      },
      {
        id: 'reg-p4', type: 'lesson',
        title: 'Le registre soutenu — écrit et formel',
        content: `<h3>🎩 Registre soutenu — courrier, discours, littérature</h3>
<p>Le registre <strong>soutenu</strong> s'utilise dans les écrits formels, les discours officiels et la littérature.</p>
<div class="rule-box">
  <div class="rule-icon">📝</div>
  <div>
    <strong>Caractéristiques :</strong>
    <ul>
      <li><strong>Inversion sujet-verbe</strong> : Venez-vous demain ?</li>
      <li>Vocabulaire riche : <em>ouvrage</em> (livre), <em>demeure</em> (maison)</li>
      <li>Phrases élaborées, subjonctif présent</li>
      <li>Pas d'abréviations ni de mots familiers</li>
    </ul>
  </div>
</div>
<div class="summary-table">
  <div class="summary-row header"><div>Registre</div><div>Exemple</div><div>Contexte</div></div>
  <div class="summary-row"><div>😎 Familier</div><div>Tu viens ?</div><div>Amis, famille</div></div>
  <div class="summary-row"><div>😐 Courant</div><div>Est-ce que tu viens ?</div><div>Quotidien, médias</div></div>
  <div class="summary-row"><div>🎩 Soutenu</div><div>Viendrez-vous ?</div><div>Courrier, discours</div></div>
</div>
<div class="lesson-highlight" style="margin-top:1rem">🎓 Passez aux <strong>Exercices</strong> pour identifier et transformer les registres !</div>`,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 3. L'ACCORD ET LA PLACE DES ADJECTIFS
  // ──────────────────────────────────────────────────────────────────
  {
    match: t => t.includes('adjectif') || t.includes('accord') && t.includes('place'),
    pages: [
      {
        id: 'adj-p1', type: 'intro',
        title: 'Introduction — L\'accord des adjectifs',
        content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 Grammaire Française A1</div>
  <h2>L'accord et la place des adjectifs</h2>
  <p class="lead">En français, l'adjectif s'<strong>accorde</strong> en genre (masculin/féminin) et en nombre (singulier/pluriel) avec le nom qu'il qualifie. Sa <strong>place</strong> dans la phrase peut varier.</p>
  <div class="lesson-objectives">
    <h4>🎯 Objectifs de cette leçon</h4>
    <ul>
      <li>Former le <strong>féminin</strong> des adjectifs (-e, doublement de consonne, formes irrégulières)</li>
      <li>Former le <strong>pluriel</strong> des adjectifs (-s, -aux)</li>
      <li>Placer l'adjectif correctement (<strong>avant ou après</strong> le nom)</li>
      <li>Maîtriser les adjectifs BAGS (Beauty, Age, Goodness, Size) qui précèdent</li>
    </ul>
  </div>
  <div class="lesson-highlight"><strong>Dans cette leçon :</strong> masculin/féminin · singulier/pluriel · avant/après le nom · BAGS</div>
</div>`,
      },
      {
        id: 'adj-p2', type: 'lesson',
        title: 'Formation du féminin',
        content: `<h3>Former le féminin des adjectifs</h3>
<div class="rule-box">
  <div class="rule-icon">📝</div>
  <div>
    <strong>Règle générale :</strong> ajouter <span class="prep">-e</span> au masculin
    <ul>
      <li>grand → grand<strong>e</strong> · petit → petit<strong>e</strong> · joli → joli<strong>e</strong></li>
      <li>français → françai<strong>se</strong> · anglais → anglai<strong>se</strong></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">⚠️</div>
  <div>
    <strong>Doublement de la consonne finale :</strong>
    <ul>
      <li>bon → bon<strong>ne</strong> · gentil → gentil<strong>le</strong> · gros → gros<strong>se</strong></li>
      <li>ancien → ancien<strong>ne</strong> · mignon → mignon<strong>ne</strong></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">⭐</div>
  <div>
    <strong>Formes irrégulières à mémoriser :</strong>
    <ul>
      <li>beau → bell<strong>e</strong> · nouveau → nouvel<strong>le</strong> · vieux → vieil<strong>le</strong></li>
      <li>blanc → blanch<strong>e</strong> · doux → douc<strong>e</strong> · faux → faus<strong>se</strong></li>
      <li>heureux → heureu<strong>se</strong> · actif → activ<strong>e</strong></li>
    </ul>
  </div>
</div>`,
      },
      {
        id: 'adj-p3', type: 'lesson',
        title: 'Formation du pluriel',
        content: `<h3>Former le pluriel des adjectifs</h3>
<div class="rule-box">
  <div class="rule-icon">📝</div>
  <div>
    <strong>Règle générale :</strong> ajouter <span class="prep">-s</span>
    <ul>
      <li>grand → grand<strong>s</strong> · grande → grande<strong>s</strong></li>
      <li>petit → petit<strong>s</strong> · petite → petite<strong>s</strong></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">⚠️</div>
  <div>
    <strong>Adjectifs en -al → -aux :</strong>
    <ul>
      <li>normal → norm<strong>aux</strong> · principal → princip<strong>aux</strong></li>
      <li>national → nation<strong>aux</strong> · banal → banal<strong>s</strong> (exception !)</li>
    </ul>
  </div>
</div>
<div class="compare-box">
  <div class="compare-item good">✅ Un livre <strong>rouge</strong> → des livres <strong>rouges</strong></div>
  <div class="compare-item good">✅ Un problème <strong>normal</strong> → des problèmes <strong>normaux</strong></div>
  <div class="compare-item bad">❌ des livres <strong>rouge</strong> (oubli du -s)</div>
</div>`,
      },
      {
        id: 'adj-p4', type: 'lesson',
        title: 'Place de l\'adjectif — Avant ou après le nom ?',
        content: `<h3>Où placer l'adjectif ?</h3>
<div class="rule-box">
  <div class="rule-icon">➡️</div>
  <div>
    <strong>La plupart des adjectifs se placent APRÈS le nom :</strong>
    <ul>
      <li>un livre <strong>intéressant</strong> · une maison <strong>bleue</strong></li>
      <li>un enfant <strong>intelligent</strong> · une femme <strong>courageuse</strong></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">⬅️</div>
  <div>
    <strong>Adjectifs BAGS se placent AVANT le nom :</strong><br/>
    <em>Beauty · Age · Goodness · Size</em>
    <ul>
      <li>🌸 <strong>Beau/belle</strong>, joli(e) — Beauty</li>
      <li>👴 <strong>Vieux/vieille</strong>, nouveau, jeune — Age</li>
      <li>👍 <strong>Bon/bonne</strong>, mauvais, gentil — Goodness</li>
      <li>📏 <strong>Grand</strong>, petit, gros, long — Size</li>
    </ul>
    <em>une <strong>belle</strong> maison · un <strong>petit</strong> chat · une <strong>bonne</strong> idée</em>
  </div>
</div>
<div class="info-box">💡 Certains adjectifs changent de sens selon leur place : <em>un <strong>grand</strong> homme</em> (illustre) ≠ un homme <em><strong>grand</strong></em> (de grande taille)</div>
<div class="lesson-highlight" style="margin-top:1rem">🎓 Passez aux <strong>Exercices</strong> pour pratiquer l'accord et la place des adjectifs !</div>`,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 4. L'HYPOTHÈSE SUR LE FUTUR (SI + PRÉSENT → FUTUR SIMPLE)
  // ──────────────────────────────────────────────────────────────────
  {
    match: t => t.includes('hypothèse') || t.includes('hypothese') || t.includes('futur') && t.includes('exercice'),
    pages: [
      {
        id: 'hyp-p1', type: 'intro',
        title: 'Introduction — L\'hypothèse sur le futur',
        content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 Grammaire Française A1</div>
  <h2>L'hypothèse sur le futur</h2>
  <p class="lead">Pour exprimer une hypothèse ou une condition sur le futur en français, on utilise la structure : <strong>Si + présent → futur simple</strong>.</p>
  <div class="lesson-objectives">
    <h4>🎯 Objectifs de cette leçon</h4>
    <ul>
      <li>Comprendre la structure <strong>si + présent de l'indicatif + futur simple</strong></li>
      <li>Conjuguer les verbes au <strong>futur simple</strong> (réguliers et irréguliers)</li>
      <li>Distinguer hypothèse <strong>réelle</strong> (futur) et <strong>irréelle</strong> (conditionnel)</li>
      <li>Produire des phrases d'hypothèse dans des contextes variés</li>
    </ul>
  </div>
  <div class="lesson-highlight"><strong>Structure clé :</strong> Si + présent → futur simple (ex : Si tu viens, je serai content.)</div>
</div>`,
      },
      {
        id: 'hyp-p2', type: 'lesson',
        title: 'Le futur simple — Formation',
        content: `<h3>Conjugaison du futur simple</h3>
<div class="rule-box">
  <div class="rule-icon">📝</div>
  <div>
    <strong>Règle générale :</strong> infinitif + terminaisons <span class="prep">-ai, -as, -a, -ons, -ez, -ont</span>
    <table style="width:100%;border-collapse:collapse;margin-top:.5rem;font-size:.9rem">
      <tr style="background:#dc2626;color:#fff"><th style="padding:6px">Pronom</th><th style="padding:6px">PARLER</th><th style="padding:6px">FINIR</th></tr>
      <tr><td style="padding:6px">je</td><td style="padding:6px">parler<strong>ai</strong></td><td style="padding:6px">finir<strong>ai</strong></td></tr>
      <tr style="background:#f9f9f9"><td style="padding:6px">tu</td><td style="padding:6px">parler<strong>as</strong></td><td style="padding:6px">finir<strong>as</strong></td></tr>
      <tr><td style="padding:6px">il/elle</td><td style="padding:6px">parler<strong>a</strong></td><td style="padding:6px">finir<strong>a</strong></td></tr>
      <tr style="background:#f9f9f9"><td style="padding:6px">nous</td><td style="padding:6px">parler<strong>ons</strong></td><td style="padding:6px">finir<strong>ons</strong></td></tr>
      <tr><td style="padding:6px">vous</td><td style="padding:6px">parler<strong>ez</strong></td><td style="padding:6px">finir<strong>ez</strong></td></tr>
      <tr style="background:#f9f9f9"><td style="padding:6px">ils/elles</td><td style="padding:6px">parler<strong>ont</strong></td><td style="padding:6px">finir<strong>ont</strong></td></tr>
    </table>
  </div>
</div>
<div class="info-box">💡 Verbes irréguliers au futur (à mémoriser) : <br/>être → <strong>ser</strong>ai · avoir → <strong>aur</strong>ai · aller → <strong>ir</strong>ai · faire → <strong>fer</strong>ai · pouvoir → <strong>pourr</strong>ai · vouloir → <strong>voudr</strong>ai · venir → <strong>viendr</strong>ai</div>`,
      },
      {
        id: 'hyp-p3', type: 'lesson',
        title: 'Structure : Si + présent → futur simple',
        content: `<h3>La phrase hypothétique réelle</h3>
<div class="rule-box">
  <div class="rule-icon">🔑</div>
  <div>
    <strong>Formule :</strong> <span class="prep">Si</span> + <em>présent de l'indicatif</em> → <em>futur simple</em>
    <ul>
      <li><strong>Si</strong> tu <em>viens</em> demain, nous <em>irons</em> au cinéma.<span class="inline-trans">= If you come tomorrow, we will go to the cinema.</span></li>
      <li><strong>Si</strong> il <em>fait</em> beau, je <em>sortirai</em>.<span class="inline-trans">= If it's nice weather, I will go out.</span></li>
      <li><strong>Si</strong> tu <em>travailles</em> bien, tu <em>réussiras</em>.<span class="inline-trans">= If you work well, you will succeed.</span></li>
    </ul>
  </div>
</div>
<div class="compare-box">
  <div class="compare-item good">✅ Si je <strong>mange</strong> bien, je <strong>serai</strong> en bonne santé. (hypothèse réelle)</div>
  <div class="compare-item bad">❌ Si je <strong>mangerai</strong> bien… (JAMAIS le futur après «si»)</div>
  <div class="compare-item special">⭐ Si j'<strong>avais</strong> de l'argent, j'<strong>achèterais</strong>… (irréel → conditionnel)</div>
</div>
<div class="lesson-highlight" style="margin-top:1rem">🎓 Passez aux <strong>Exercices</strong> pour pratiquer les phrases d'hypothèse !</div>`,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 5. L'IMPÉRATIF
  // ──────────────────────────────────────────────────────────────────
  {
    match: t => t.includes('impératif') || t.includes('imperatif'),
    pages: [
      {
        id: 'imp-p1', type: 'intro',
        title: 'Introduction — L\'impératif',
        content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 Grammaire Française A1</div>
  <h2>L'impératif en français</h2>
  <p class="lead">L'<strong>impératif</strong> est le mode utilisé pour donner des <em>ordres</em>, des <em>conseils</em>, des <em>instructions</em> ou des <em>invitations</em>. Il n'a que <strong>3 personnes</strong> sans pronom sujet.</p>
  <div class="lesson-objectives">
    <h4>🎯 Objectifs de cette leçon</h4>
    <ul>
      <li>Former l'impératif des verbes du 1er groupe (-er)</li>
      <li>Maîtriser les formes irrégulières : être, avoir, aller, savoir</li>
      <li>Utiliser l'impératif avec des pronoms (me, te, nous, vous, le, la, les)</li>
      <li>Distinguer ordre, conseil et invitation</li>
    </ul>
  </div>
  <div class="lesson-highlight"><strong>Personnes de l'impératif :</strong> tu (familier) · nous (inclusion) · vous (formel/pluriel)</div>
</div>`,
      },
      {
        id: 'imp-p2', type: 'lesson',
        title: 'Formation de l\'impératif',
        content: `<h3>Conjuguer à l'impératif</h3>
<div class="rule-box">
  <div class="rule-icon">📝</div>
  <div>
    <strong>1er groupe (-er) :</strong> même que le présent, mais <strong>sans -s</strong> à la 2e pers. singulier
    <table style="width:100%;border-collapse:collapse;margin-top:.5rem;font-size:.9rem">
      <tr style="background:#dc2626;color:#fff"><th style="padding:6px">Personne</th><th style="padding:6px">PARLER</th><th style="padding:6px">FINIR</th><th style="padding:6px">VENDRE</th></tr>
      <tr><td style="padding:6px">tu</td><td style="padding:6px">Parl<strong>e</strong> !</td><td style="padding:6px">Fini<strong>s</strong> !</td><td style="padding:6px">Vend<strong>s</strong> !</td></tr>
      <tr style="background:#f9f9f9"><td style="padding:6px">nous</td><td style="padding:6px">Parlons !</td><td style="padding:6px">Finissons !</td><td style="padding:6px">Vendons !</td></tr>
      <tr><td style="padding:6px">vous</td><td style="padding:6px">Parlez !</td><td style="padding:6px">Finissez !</td><td style="padding:6px">Vendez !</td></tr>
    </table>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">⭐</div>
  <div>
    <strong>Formes irrégulières à mémoriser :</strong>
    <table style="width:100%;border-collapse:collapse;margin-top:.5rem;font-size:.9rem">
      <tr style="background:#dc2626;color:#fff"><th style="padding:6px">Verbe</th><th style="padding:6px">tu</th><th style="padding:6px">nous</th><th style="padding:6px">vous</th></tr>
      <tr><td style="padding:6px">être</td><td style="padding:6px"><strong>Sois</strong></td><td style="padding:6px">Soyons</td><td style="padding:6px">Soyez</td></tr>
      <tr style="background:#f9f9f9"><td style="padding:6px">avoir</td><td style="padding:6px"><strong>Aie</strong></td><td style="padding:6px">Ayons</td><td style="padding:6px">Ayez</td></tr>
      <tr><td style="padding:6px">aller</td><td style="padding:6px"><strong>Va</strong></td><td style="padding:6px">Allons</td><td style="padding:6px">Allez</td></tr>
      <tr style="background:#f9f9f9"><td style="padding:6px">savoir</td><td style="padding:6px"><strong>Sache</strong></td><td style="padding:6px">Sachons</td><td style="padding:6px">Sachez</td></tr>
    </table>
  </div>
</div>`,
      },
      {
        id: 'imp-p3', type: 'lesson',
        title: 'Usages de l\'impératif',
        content: `<h3>Quand utiliser l'impératif ?</h3>
<div class="rule-box">
  <div class="rule-icon">⚡</div>
  <div>
    <strong>Ordre / Interdiction :</strong>
    <ul>
      <li><strong>Fermez</strong> la porte !<span class="inline-trans">= Close the door!</span></li>
      <li>Ne <strong>parlez</strong> pas en classe !<span class="inline-trans">= Don't talk in class!</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">💡</div>
  <div>
    <strong>Conseil :</strong>
    <ul>
      <li><strong>Mange</strong> des légumes !<span class="inline-trans">= Eat vegetables!</span></li>
      <li><strong>Sois</strong> patient !<span class="inline-trans">= Be patient!</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">🤝</div>
  <div>
    <strong>Invitation / Suggestion :</strong>
    <ul>
      <li><strong>Entrez</strong>, je vous en prie !<span class="inline-trans">= Come in, please!</span></li>
      <li><strong>Allons</strong> au restaurant !<span class="inline-trans">= Let's go to a restaurant!</span></li>
    </ul>
  </div>
</div>
<div class="info-box">💡 <strong>Négation à l'impératif :</strong> Ne + verbe + pas<br/><em>Ne parle pas ! · N'oublie pas ! · Ne sois pas en retard !</em></div>
<div class="lesson-highlight" style="margin-top:1rem">🎓 Passez aux <strong>Exercices</strong> pour pratiquer l'impératif !</div>`,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 6. COMPRÉHENSION ORALE — Modules thématiques (GENERIQUES AMÉLIORÉS)
  // ──────────────────────────────────────────────────────────────────
  {
    match: t => t.includes('compréhension orale') || t.includes('comprehension orale'),
    pages: (course) => {
      const titre = course.titre || course.title || 'Compréhension orale';
      const module = titre.match(/module\s*(\d+)\s*[:\-·]?\s*(.*)/i);
      const moduleNum = module ? module[1] : '';
      const theme = module ? module[2].trim() : titre;

      return [
        {
          id: `co-p1`, type: 'intro',
          title: `Introduction — ${titre}`,
          content: `<div class="lesson-intro">
  <div class="lesson-badge">🎧 Compréhension Orale A1.2</div>
  <h2>${titre}</h2>
  <p class="lead">Ce module de <strong>compréhension orale</strong> vous entraîne à comprendre le français parlé dans des situations de la vie réelle.</p>
  <div class="lesson-objectives">
    <h4>🎯 Objectifs de ce module</h4>
    <ul>
      <li>Comprendre des dialogues authentiques sur le thème : <strong>${theme}</strong></li>
      <li>Identifier les informations clés en écoutant</li>
      <li>Mémoriser le vocabulaire essentiel du thème</li>
      <li>Répondre à des questions de compréhension (vrai/faux, QCM)</li>
    </ul>
  </div>
  <div class="lesson-highlight"><strong>Thème :</strong> ${theme} · <strong>Niveau :</strong> A1.2 · <strong>Méthode :</strong> Tip Top !</div>
</div>`,
        },
        {
          id: `co-p2`, type: 'lesson',
          title: 'Stratégies d\'écoute',
          content: `<h3>🎧 Comment bien écouter en français ?</h3>
<div class="rule-box">
  <div class="rule-icon">1️⃣</div>
  <div>
    <strong>Avant l'écoute :</strong>
    <ul>
      <li>Lisez les questions <strong>avant</strong> d'écouter pour savoir quoi chercher</li>
      <li>Regardez les images ou le contexte pour anticiper le contenu</li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">2️⃣</div>
  <div>
    <strong>Pendant l'écoute :</strong>
    <ul>
      <li>Concentrez-vous sur les <strong>mots-clés</strong>, pas sur chaque mot</li>
      <li>Notez les <strong>chiffres, noms, lieux et dates</strong> que vous entendez</li>
      <li>Utilisez le contexte pour comprendre les mots inconnus</li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">3️⃣</div>
  <div>
    <strong>Après l'écoute :</strong>
    <ul>
      <li>Vérifiez vos réponses en réécoutant les passages difficiles</li>
      <li>Répétez les phrases que vous avez entendues (shadowing)</li>
    </ul>
  </div>
</div>`,
        },
        {
          id: `co-p3`, type: 'lesson',
          title: 'Vocabulaire clé du module',
          content: `<h3>📚 Vocabulaire — ${theme}</h3>
<div class="rule-box">
  <div class="rule-icon">💬</div>
  <div>
    <p>Ce module utilise le vocabulaire autour du thème <strong>${theme}</strong>. Pour réussir les exercices :</p>
    <ul>
      <li>Lisez les mots <strong>à voix haute</strong> pour les mémoriser</li>
      <li>Créez des <strong>associations mentales</strong> (images, histoires)</li>
      <li>Utilisez ces mots dans des <strong>phrases simples</strong> de votre vie quotidienne</li>
    </ul>
  </div>
</div>
<div class="info-box">💡 <strong>Conseil pédagogique :</strong> En compréhension orale, il est normal de ne pas tout comprendre. L'essentiel est de saisir l'idée générale et les informations clés.</div>
<div class="lesson-highlight" style="margin-top:1rem">🎧 Écoutez les dialogues, puis passez aux <strong>Exercices</strong> pour tester votre compréhension !</div>`,
        },
      ];
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 7. LETTRE DE LONDRES — Lecture & Écriture
  // ──────────────────────────────────────────────────────────────────
  {
    match: t => t.includes('lettre') && (t.includes('londres') || t.includes('london')),
    pages: [
      {
        id: 'let-p1', type: 'intro',
        title: 'Introduction — Écrire une lettre en français',
        content: `<div class="lesson-intro">
  <div class="lesson-badge">✉️ Lecture & Écriture A1</div>
  <h2>Lettre de Londres — Lire et écrire une lettre</h2>
  <p class="lead">Ce cours vous apprend à <strong>lire</strong> et à <strong>écrire</strong> une lettre amicale en français. La lettre est un genre textuel structuré avec des codes à respecter.</p>
  <div class="lesson-objectives">
    <h4>🎯 Objectifs de cette leçon</h4>
    <ul>
      <li>Identifier la <strong>structure</strong> d'une lettre amicale</li>
      <li>Comprendre le vocabulaire d'une lettre de voyage</li>
      <li>Utiliser les formules d'<strong>ouverture et de clôture</strong></li>
      <li>Produire une lettre courte en respectant le format</li>
    </ul>
  </div>
  <div class="lesson-highlight"><strong>Structure :</strong> lieu et date · formule d'appel · corps · formule de clôture · signature</div>
</div>`,
      },
      {
        id: 'let-p2', type: 'lesson',
        title: 'Structure d\'une lettre amicale',
        content: `<h3>✉️ Les éléments d'une lettre en français</h3>
<div class="rule-box">
  <div class="rule-icon">📝</div>
  <div>
    <strong>Structure standard :</strong>
    <ol>
      <li><strong>Lieu et date</strong> (en haut à droite) : <em>Laâyoune, le 30 avril 2026</em></li>
      <li><strong>Formule d'appel</strong> : <em>Cher Paul, / Chère Marie, / Bonjour !</em></li>
      <li><strong>Corps de la lettre</strong> : les informations principales</li>
      <li><strong>Formule de clôture</strong> : <em>Amitiés, / Grosses bises, / À bientôt,</em></li>
      <li><strong>Signature</strong> : ton prénom</li>
    </ol>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">💬</div>
  <div>
    <strong>Formules utiles :</strong>
    <ul>
      <li><em>Je t'écris de Londres…</em> (I'm writing to you from London…)</li>
      <li><em>Je te donne de mes nouvelles…</em> (I'm giving you my news…)</li>
      <li><em>La ville est magnifique !</em> / <em>Il fait beau / froid / chaud.</em></li>
      <li><em>Je rentre le…</em> (I'm coming back on…)</li>
    </ul>
  </div>
</div>
<div class="lesson-highlight" style="margin-top:1rem">🎓 Passez aux <strong>Exercices</strong> pour lire et compléter la lettre !</div>`,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 8. LE VOYAGE / TEXTE DE LECTURE
  // ──────────────────────────────────────────────────────────────────
  {
    match: t => t.includes('voyage') || t.includes('texte de lecture'),
    pages: [
      {
        id: 'voy-p1', type: 'intro',
        title: 'Introduction — Le voyage en français',
        content: `<div class="lesson-intro">
  <div class="lesson-badge">✈️ Lecture A1</div>
  <h2>Le voyage — Texte de lecture A1</h2>
  <p class="lead">Ce module de <strong>lecture</strong> vous entraîne à comprendre un texte sur le thème du voyage. Vous allez enrichir votre vocabulaire et travailler la compréhension écrite.</p>
  <div class="lesson-objectives">
    <h4>🎯 Objectifs</h4>
    <ul>
      <li>Lire et comprendre un texte authentique sur le voyage</li>
      <li>Identifier les <strong>informations clés</strong> d'un récit</li>
      <li>Mémoriser le <strong>vocabulaire du voyage</strong> en français</li>
      <li>Répondre à des questions de compréhension écrite</li>
    </ul>
  </div>
  <div class="lesson-highlight"><strong>Vocabulaire :</strong> le passeport · la valise · l'aéroport · le billet · l'hôtel · les transports</div>
</div>`,
      },
      {
        id: 'voy-p2', type: 'lesson',
        title: 'Vocabulaire du voyage',
        content: `<h3>✈️ Les mots essentiels du voyage</h3>
<div class="rule-box">
  <div class="rule-icon">🧳</div>
  <div>
    <strong>À l'aéroport / à la gare :</strong>
    <ul>
      <li>le <strong>passeport</strong> · la <strong>valise</strong> · le <strong>billet</strong> (ticket)</li>
      <li>l'<strong>aéroport</strong> · la <strong>gare</strong> · le <strong>vol</strong> (flight)</li>
      <li><strong>enregistrer</strong> ses bagages · <strong>embarquer</strong> (to board)</li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">🏨</div>
  <div>
    <strong>À l'hôtel / en ville :</strong>
    <ul>
      <li>l'<strong>hôtel</strong> · la <strong>chambre</strong> · la <strong>réception</strong></li>
      <li><strong>réserver</strong> une chambre · <strong>s'enregistrer</strong></li>
      <li>le <strong>restaurant</strong> · le <strong>musée</strong> · les <strong>transports</strong></li>
    </ul>
  </div>
</div>
<div class="info-box">💡 <strong>Stratégie de lecture :</strong> Lisez le texte une première fois pour l'idée générale, puis une deuxième fois pour les détails.</div>
<div class="lesson-highlight" style="margin-top:1rem">🎓 Passez aux <strong>Exercices</strong> pour tester votre compréhension du texte !</div>`,
      },
    ],
  },

];

// ════════════════════════════════════════════════════════════════════
// SÉLECTIONNER LES PAGES PRO POUR UN COURS
// ════════════════════════════════════════════════════════════════════
function selectProPages(course) {
  const titre = (course.titre || course.title || '').toLowerCase();
  for (const cfg of COURSES_PRO) {
    if (cfg.match(titre)) {
      // Les pages peuvent être un tableau ou une fonction (pour les modules dynamiques)
      return typeof cfg.pages === 'function' ? cfg.pages(course) : cfg.pages;
    }
  }
  return null; // pas de contenu pro pour ce cours
}

// ════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════
async function main() {
  console.log('\n🎓 update-fr-grammaire-pro.mjs — Cours professionnels');
  console.log('═'.repeat(60));
  if (DRY_RUN) console.log('⚠️  MODE APERÇU (--dry-run) — aucune écriture\n');

  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log(`✅ Connecté à PocketBase (${PB_URL})\n`);

  const courses = await pb.collection('courses').getFullList({ sort: 'created', requestKey: null });
  console.log(`📚 ${courses.length} cours trouvés\n`);

  let updated = 0, skipped = 0;

  for (const course of courses) {
    const pages = selectProPages(course);

    if (!pages) {
      skipped++;
      continue; // ce cours n'a pas de contenu pro spécifique dans ce script
    }

    console.log(`  ✏️  UPDATE  "${course.titre}"`);
    console.log(`           ${pages.length} pages pédagogiques pro`);

    if (!DRY_RUN) {
      try {
        await pb.collection('courses').update(course.id, {
          pages: JSON.stringify(pages),
        }, { requestKey: null });
        console.log(`           ✅ Mis à jour !`);
        updated++;
      } catch (e) {
        console.error(`           ❌ Erreur : ${e.message}`);
      }
    } else {
      console.log(`           ✅ (simulation) ${pages.map(p => p.title).join(' · ')}`);
      updated++;
    }
    console.log();
  }

  console.log('═'.repeat(60));
  console.log(`📊 Résultats : ${updated} mis à jour · ${skipped} sans contenu spécifique (déjà traités)`);
  if (DRY_RUN) console.log('⚠️  Relancez sans --dry-run pour appliquer les changements');
  console.log('');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
