/**
 * update-courses-pedagogy.mjs
 * ════════════════════════════════════════════════════════════════════
 * Scanne TOUS les cours PocketBase et injecte un cours pédagogique
 * complet (intro + leçons + récapitulatif) pour ceux qui n'ont que
 * des exercices ou n'ont pas de pages de cours.
 *
 * Pédagogie : même format que LESSON_PAGES_TEMPS (référence du projet)
 * — badge · objectifs · règle illustrée · comparatif · tableau recap
 *
 * Usage :
 *   cd apps/api && node update-courses-pedagogy.mjs
 *   node update-courses-pedagogy.mjs --dry-run   (aperçu sans écriture)
 *   node update-courses-pedagogy.mjs COURSE_ID   (un seul cours)
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
const TARGET   = process.argv.find(a => !a.startsWith('--') && a !== process.argv[0] && a !== process.argv[1]);

// ════════════════════════════════════════════════════════════════════
// DÉTECTION DU TOPIC D'UN COURS
// ════════════════════════════════════════════════════════════════════
function detectTopic(course) {
  const t = (course.titre || course.title || '').toLowerCase();
  const d = (course.description || '').toLowerCase();
  const haystack = `${t} ${d}`;

  if (haystack.match(/\btemps\b|time express|prépositions? de temps|exprimer le temps/)) return 'temps';
  if (haystack.match(/\blieu\b|place express|prépositions? de lieu|exprimer (un|le) lieu/)) return 'lieu';
  if (haystack.match(/toutes? les? prép|all prep|جميع حروف/)) return 'prepositions-all';
  if (haystack.match(/articles?|défini|indéfini|partitif/)) return 'articles';
  if (haystack.match(/verbes?|conjugai|présent|passé composé|imparfait|futur/)) return 'verbes';
  if (haystack.match(/prépositions?|حروف الجر/)) return 'prepositions-all';
  return 'generic';
}

// ════════════════════════════════════════════════════════════════════
// PAGES PÉDAGOGIQUES — "Toutes les prépositions françaises"
// (Utilisé si aucune des spécialisations temps/lieu ne correspond)
// ════════════════════════════════════════════════════════════════════
function buildPagesPrepositionsAll(course) {
  const titre = course.titre || course.title || 'Les prépositions françaises';
  return [
    {
      id: 'prep-p1', type: 'intro',
      title: 'Introduction — Les prépositions françaises',
      content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 Grammaire Française A1</div>
  <h2>${titre}</h2>
  <p class="lead">Les <strong>prépositions</strong> sont de petits mots qui relient des éléments de la phrase. Elles indiquent un <em>lieu</em>, un <em>temps</em>, une <em>manière</em>, une <em>cause</em> ou un <em>but</em>.</p>
  <div class="lesson-objectives">
    <h4>🎯 Objectifs de cette leçon</h4>
    <ul>
      <li>Maîtriser les prépositions de <strong>lieu</strong> : <em>à, dans, sur, sous, chez, loin de…</em></li>
      <li>Maîtriser les prépositions de <strong>temps</strong> : <em>en, à, dans, depuis, pendant…</em></li>
      <li>Comprendre les prépositions de <strong>manière et cause</strong> : <em>avec, sans, par, grâce à…</em></li>
      <li>Éviter les erreurs les plus fréquentes</li>
    </ul>
  </div>
  <div class="lesson-highlight"><strong>Dans cette leçon :</strong> à · en · dans · sur · sous · avec · sans · par · pour · depuis · pendant · vers · grâce à · à cause de · chez · loin de</div>
</div>`,
    },
    {
      id: 'prep-p2', type: 'lesson',
      title: 'À, En, Dans — Temps (1)',
      content: `<h3>Trois prépositions de temps proches mais différentes</h3>
<div class="rule-box">
  <div class="rule-icon">⏰</div>
  <div>
    <strong><span class="prep">à</span></strong> — heure précise, moment fixe
    <ul>
      <li>J'arrive au cinéma <strong>à</strong> 7 heures.<span class="inline-trans">= I arrive at the cinema at 7 o'clock.</span></li>
      <li>Mon vol pour Paris est prévu <strong>à</strong> lundi.</li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">📅</div>
  <div>
    <strong><span class="prep">en</span></strong> — mois, saison (fém.), année
    <ul>
      <li>Marie part en vacances <strong>en</strong> été.<span class="inline-trans">= Marie goes on holiday in summer.</span></li>
      <li>Les cours commencent <strong>en</strong> septembre.</li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">🔮</div>
  <div>
    <strong><span class="prep">dans</span></strong> — délai futur / intérieur d'un espace
    <ul>
      <li>Mon anniversaire est <strong>dans</strong> dix jours.<span class="inline-trans">= My birthday is in ten days.</span></li>
      <li>Je mets du café <strong>dans</strong> ma tasse.</li>
    </ul>
  </div>
</div>
<div class="compare-box">
  <div class="compare-item good">✅ J'arrive <strong>à</strong> 7h (heure précise)</div>
  <div class="compare-item good">✅ Je pars <strong>en</strong> été (saison)</div>
  <div class="compare-item good">✅ J'arrive <strong>dans</strong> 10 minutes (délai futur)</div>
</div>`,
    },
    {
      id: 'prep-p3', type: 'lesson',
      title: 'Depuis, Pendant, Pour — Durée',
      content: `<h3>Exprimer la durée</h3>
<div class="rule-box">
  <div class="rule-icon">📆</div>
  <div>
    <strong><span class="prep">depuis</span></strong> — action commencée dans le passé, qui continue
    <ul>
      <li>Pierre travaille ici <strong>depuis</strong> 2018.<span class="inline-trans">= Pierre has worked here since 2018.</span></li>
      <li><strong>Depuis</strong> deux semaines, je suis malade.</li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">⌛</div>
  <div>
    <strong><span class="prep">pendant</span></strong> — durée déterminée et terminée
    <ul>
      <li>Je suis en vacances <strong>pendant</strong> trois semaines.<span class="inline-trans">= I am on holiday for three weeks.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">🎯</div>
  <div>
    <strong><span class="prep">pour</span></strong> — durée prévue (futur)
    <ul>
      <li>Je pars <strong>pour</strong> un mois.<span class="inline-trans">= I'm leaving for a month.</span></li>
    </ul>
  </div>
</div>
<div class="compare-box">
  <div class="compare-item good">✅ Je travaille ici <strong>depuis</strong> 2018 (encore maintenant)</div>
  <div class="compare-item good">✅ J'ai travaillé <strong>pendant</strong> 3 ans (terminé)</div>
  <div class="compare-item bad">❌ J'ai travaillé ici <strong>depuis</strong> 3 ans (incorrect au passé composé)</div>
</div>`,
    },
    {
      id: 'prep-p4', type: 'lesson',
      title: 'Sur, Sous, Chez, À, Au — Lieu',
      content: `<h3>Se situer dans l'espace</h3>
<div class="rule-box">
  <div class="rule-icon">📦</div>
  <div>
    <strong><span class="prep">sur</span></strong> / <strong><span class="prep">sous</span></strong> — dessus et dessous
    <ul>
      <li>Le livre est <strong>sur</strong> la table.<span class="inline-trans">= The book is on the table.</span></li>
      <li>Le chat se cache <strong>sous</strong> le canapé.</li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">🏠</div>
  <div>
    <strong><span class="prep">chez</span></strong> — domicile ou lieu habituel d'une personne
    <ul>
      <li>Après l'école, ma sœur va <strong>chez</strong> son amie.<span class="inline-trans">= my friend's place.</span></li>
      <li>Je mange <strong>au</strong> restaurant ≠ <strong>chez</strong> quelqu'un (lieu public ≠ domicile)</li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">🏙️</div>
  <div>
    <strong><span class="prep">à</span></strong> + ville · <strong><span class="prep">au</span></strong> + pays masculin · <strong><span class="prep">en</span></strong> + pays féminin
    <ul>
      <li>J'habite <strong>à</strong> Paris. Je vis <strong>au</strong> Maroc. Je voyage <strong>en</strong> France.</li>
      <li>À 8h, les enfants vont <strong>à</strong> l'école.</li>
    </ul>
  </div>
</div>`,
    },
    {
      id: 'prep-p5', type: 'lesson',
      title: 'Avec, Sans, Par, Pour, Grâce à — Manière & Cause',
      content: `<h3>Exprimer la manière, le moyen, la cause et le but</h3>
<div class="rule-box">
  <div class="rule-icon">🤝</div>
  <div>
    <strong><span class="prep">avec</span></strong> — accompagnement, moyen · <strong><span class="prep">sans</span></strong> — absence
    <ul>
      <li>Je pars <strong>avec</strong> ma famille.<span class="inline-trans">= I leave with my family.</span></li>
      <li>Je ne vois rien <strong>sans</strong> mes lunettes.</li>
      <li>Anne rentre <strong>à</strong> pied (moyen de transport non motorisé).</li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">💡</div>
  <div>
    <strong><span class="prep">par</span></strong> — cause, agent · <strong><span class="prep">pour</span></strong> — but, destination
    <ul>
      <li>Tout cela est arrivé <strong>par</strong> sa faute.<span class="inline-trans">= because of his/her fault.</span></li>
      <li>Je pars <strong>pour</strong> Paris.<span class="inline-trans">= I'm leaving for Paris.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">⭐</div>
  <div>
    <strong><span class="prep">grâce à</span></strong> — cause positive · <strong><span class="prep">à cause de</span></strong> — cause négative
    <ul>
      <li><strong>Grâce à</strong> toi, j'ai réussi ! (positif)<span class="inline-trans">= Thanks to you, I succeeded!</span></li>
      <li><strong>À cause de</strong> la pluie, je suis en retard. (négatif)</li>
    </ul>
  </div>
</div>`,
    },
    {
      id: 'prep-p6', type: 'lesson',
      title: 'Avant, Après, Vers, Entre — Ordre & Approximation',
      content: `<h3>Situer dans l'ordre et dans l'approximation</h3>
<div class="rule-box">
  <div class="rule-icon">⬅️</div>
  <div>
    <strong><span class="prep">avant</span></strong> — antériorité
    <ul>
      <li>Je me brosse les dents <strong>avant</strong> d'aller dormir.<span class="inline-trans">= before going to sleep.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">➡️</div>
  <div>
    <strong><span class="prep">après</span></strong> — postériorité
    <ul>
      <li><strong>Après</strong> le petit-déjeuner, je vais au travail.<span class="inline-trans">= After breakfast, I go to work.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">↔️</div>
  <div>
    <strong><span class="prep">entre</span></strong> — intervalle · <strong><span class="prep">vers</span></strong> — approximation
    <ul>
      <li>Je vais chez ma mère <strong>entre</strong> 10h et midi.</li>
      <li>Tu viendras <strong>vers</strong> 5 heures (heure approximative).</li>
      <li>Marc met les bougies <strong>sur</strong> le gâteau.</li>
    </ul>
  </div>
</div>
<div class="info-box">💡 <strong>À retenir :</strong> «vers» exprime une approximation de temps ou de direction. «entre» exprime un intervalle entre deux éléments.</div>`,
    },
    {
      id: 'prep-p7', type: 'lesson',
      title: 'Tableau récapitulatif — Toutes les prépositions',
      content: `<h3>📊 Récapitulatif général des prépositions</h3>
<div class="summary-table">
  <div class="summary-row header"><div>Préposition</div><div>Catégorie</div><div>Exemple clé</div></div>
  <div class="summary-row"><div><span class="prep">à</span></div><div>Heure, ville, but</div><div>à 7h · à Paris · à faire</div></div>
  <div class="summary-row"><div><span class="prep">en</span></div><div>Saison/mois/année, pays fém.</div><div>en été · en France</div></div>
  <div class="summary-row"><div><span class="prep">dans</span></div><div>Intérieur, délai futur</div><div>dans la tasse · dans 10 min</div></div>
  <div class="summary-row"><div><span class="prep">depuis</span></div><div>Durée passée → maintenant</div><div>depuis 2018</div></div>
  <div class="summary-row"><div><span class="prep">pendant</span></div><div>Durée terminée</div><div>pendant 3 semaines</div></div>
  <div class="summary-row"><div><span class="prep">sur</span></div><div>Surface / internet</div><div>sur la table · sur internet</div></div>
  <div class="summary-row"><div><span class="prep">sous</span></div><div>En dessous</div><div>sous le canapé</div></div>
  <div class="summary-row"><div><span class="prep">chez</span></div><div>Domicile d'une personne</div><div>chez mon oncle</div></div>
  <div class="summary-row"><div><span class="prep">avec</span></div><div>Compagnie, moyen</div><div>avec ma famille</div></div>
  <div class="summary-row"><div><span class="prep">sans</span></div><div>Absence</div><div>sans mes lunettes</div></div>
  <div class="summary-row"><div><span class="prep">par</span></div><div>Cause, agent</div><div>par sa faute</div></div>
  <div class="summary-row"><div><span class="prep">pour</span></div><div>But, destination, durée prévue</div><div>pour Paris · pour 3 jours</div></div>
  <div class="summary-row"><div><span class="prep">vers</span></div><div>Approximation temporelle/directionnelle</div><div>vers 5h · vers Paris</div></div>
  <div class="summary-row"><div><span class="prep">grâce à</span></div><div>Cause positive</div><div>grâce à toi</div></div>
  <div class="summary-row"><div><span class="prep">à cause de</span></div><div>Cause négative</div><div>à cause de la pluie</div></div>
  <div class="summary-row"><div><span class="prep">entre</span></div><div>Intervalle</div><div>entre 10h et midi</div></div>
</div>
<div class="lesson-highlight" style="margin-top:1.5rem">🎓 Vous avez terminé la leçon ! Passez aux <strong>Exercices</strong> pour tester vos connaissances.</div>`,
    },
  ];
}

// ════════════════════════════════════════════════════════════════════
// PAGES PÉDAGOGIQUES — "Les articles français" (A1)
// ════════════════════════════════════════════════════════════════════
function buildPagesArticles(course) {
  const titre = course.titre || course.title || 'Les articles français';
  return [
    {
      id: 'art-p1', type: 'intro',
      title: 'Introduction — Les articles français',
      content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 Grammaire Française A1</div>
  <h2>${titre}</h2>
  <p class="lead">En français, chaque nom est accompagné d'un <strong>article</strong>. L'article indique le genre (masculin/féminin) et le nombre (singulier/pluriel) du nom.</p>
  <div class="lesson-objectives">
    <h4>🎯 Objectifs de cette leçon</h4>
    <ul>
      <li>Distinguer les articles <strong>définis</strong> (le, la, les)</li>
      <li>Utiliser les articles <strong>indéfinis</strong> (un, une, des)</li>
      <li>Employer les articles <strong>partitifs</strong> (du, de la, des)</li>
      <li>Éviter les erreurs les plus fréquentes</li>
    </ul>
  </div>
  <div class="lesson-highlight"><strong>Dans cette leçon :</strong> le · la · l' · les · un · une · des · du · de la · de l'</div>
</div>`,
    },
    {
      id: 'art-p2', type: 'lesson',
      title: 'Articles définis — le, la, l\', les',
      content: `<h3>Les articles définis</h3>
<p>On utilise les articles définis quand le nom est <em>connu</em>, <em>spécifique</em>, ou pour parler d'une chose en général.</p>
<div class="rule-box">
  <div class="rule-icon">📌</div>
  <div>
    <table style="width:100%;border-collapse:collapse;font-size:.9rem">
      <tr style="background:#dc2626;color:#fff"><th style="padding:6px">Article</th><th style="padding:6px">Usage</th><th style="padding:6px">Exemple</th></tr>
      <tr><td style="padding:6px"><span class="prep">le</span></td><td style="padding:6px">Masculin singulier</td><td style="padding:6px"><strong>Le</strong> livre est rouge.</td></tr>
      <tr style="background:#f9f9f9"><td style="padding:6px"><span class="prep">la</span></td><td style="padding:6px">Féminin singulier</td><td style="padding:6px"><strong>La</strong> maison est grande.</td></tr>
      <tr><td style="padding:6px"><span class="prep">l'</span></td><td style="padding:6px">Devant voyelle ou h</td><td style="padding:6px"><strong>L'</strong>hôtel est ici.</td></tr>
      <tr style="background:#f9f9f9"><td style="padding:6px"><span class="prep">les</span></td><td style="padding:6px">Pluriel (masc./fém.)</td><td style="padding:6px"><strong>Les</strong> enfants jouent.</td></tr>
    </table>
  </div>
</div>
<div class="info-box">💡 <strong>À retenir :</strong> «le» + «à» → <strong>au</strong> · «les» + «à» → <strong>aux</strong> · «le» + «de» → <strong>du</strong> · «les» + «de» → <strong>des</strong></div>`,
    },
    {
      id: 'art-p3', type: 'lesson',
      title: 'Articles indéfinis — un, une, des',
      content: `<h3>Les articles indéfinis</h3>
<p>On utilise les articles indéfinis pour parler d'une chose <em>non spécifique</em> ou pour introduire un nom pour la <em>première fois</em>.</p>
<div class="rule-box">
  <div class="rule-icon">🆕</div>
  <div>
    <ul>
      <li>Je vois <strong>un</strong> chat (masculin singulier).<span class="inline-trans">= I see a cat.</span></li>
      <li>C'est <strong>une</strong> belle maison (féminin singulier).<span class="inline-trans">= It's a beautiful house.</span></li>
      <li>Il y a <strong>des</strong> enfants dans le parc (pluriel).<span class="inline-trans">= There are children in the park.</span></li>
    </ul>
  </div>
</div>
<div class="compare-box">
  <div class="compare-item good">✅ Je cherche <strong>un</strong> appartement. (indéfini — je ne sais pas lequel)</div>
  <div class="compare-item good">✅ J'aime <strong>l'</strong>appartement de Marie. (défini — spécifique)</div>
</div>`,
    },
    {
      id: 'art-p4', type: 'lesson',
      title: 'Articles partitifs — du, de la, de l\'',
      content: `<h3>Les articles partitifs</h3>
<p>On utilise les articles partitifs pour parler d'une <em>quantité non précisée</em> d'une chose (souvent nourriture, liquide, activité).</p>
<div class="rule-box">
  <div class="rule-icon">🍽️</div>
  <div>
    <ul>
      <li>Je mange <strong>du</strong> pain (masculin).<span class="inline-trans">= I eat some bread.</span></li>
      <li>Elle boit <strong>de la</strong> limonade (féminin).<span class="inline-trans">= She drinks some lemonade.</span></li>
      <li>Je fais <strong>de l'</strong>exercice (devant voyelle).<span class="inline-trans">= I do some exercise.</span></li>
    </ul>
  </div>
</div>
<div class="compare-box">
  <div class="compare-item good">✅ Je mange <strong>du</strong> pain (partitif — quantité non précisée)</div>
  <div class="compare-item good">✅ Je mange <strong>le</strong> pain de boulanger. (défini — pain spécifique)</div>
  <div class="compare-item bad">❌ Je mange <strong>du</strong> pas pain. → Je ne mange <strong>pas de</strong> pain (négation → «de»)</div>
</div>`,
    },
    {
      id: 'art-p5', type: 'lesson',
      title: 'Tableau récapitulatif — Tous les articles',
      content: `<h3>📊 Récapitulatif — Les articles français</h3>
<div class="summary-table">
  <div class="summary-row header"><div>Article</div><div>Type</div><div>Exemple</div></div>
  <div class="summary-row"><div><span class="prep">le</span></div><div>Défini masc. sing.</div><div>le livre, le garçon</div></div>
  <div class="summary-row"><div><span class="prep">la</span></div><div>Défini fém. sing.</div><div>la maison, la fille</div></div>
  <div class="summary-row"><div><span class="prep">l'</span></div><div>Défini (devant voyelle/h)</div><div>l'ami, l'hôtel</div></div>
  <div class="summary-row"><div><span class="prep">les</span></div><div>Défini pluriel</div><div>les enfants</div></div>
  <div class="summary-row"><div><span class="prep">un</span></div><div>Indéfini masc. sing.</div><div>un chat</div></div>
  <div class="summary-row"><div><span class="prep">une</span></div><div>Indéfini fém. sing.</div><div>une maison</div></div>
  <div class="summary-row"><div><span class="prep">des</span></div><div>Indéfini pluriel</div><div>des enfants</div></div>
  <div class="summary-row"><div><span class="prep">du</span></div><div>Partitif masc.</div><div>du pain, du sport</div></div>
  <div class="summary-row"><div><span class="prep">de la</span></div><div>Partitif fém.</div><div>de la limonade</div></div>
  <div class="summary-row"><div><span class="prep">de l'</span></div><div>Partitif (voyelle/h)</div><div>de l'eau, de l'huile</div></div>
  <div class="summary-row"><div><span class="prep">de / d'</span></div><div>Après négation</div><div>pas de pain, pas d'eau</div></div>
  <div class="summary-row"><div><span class="prep">au / aux</span></div><div>Contraction à + le/les</div><div>au cinéma, aux États-Unis</div></div>
  <div class="summary-row"><div><span class="prep">du / des</span></div><div>Contraction de + le/les</div><div>du pain, des amis</div></div>
</div>
<div class="lesson-highlight" style="margin-top:1.5rem">🎓 Vous avez terminé la leçon ! Passez aux <strong>Exercices</strong> pour tester vos connaissances.</div>`,
    },
  ];
}

// ════════════════════════════════════════════════════════════════════
// PAGES PÉDAGOGIQUES — "Les verbes français au présent" (A1)
// ════════════════════════════════════════════════════════════════════
function buildPagesVerbes(course) {
  const titre = course.titre || course.title || 'Les verbes français au présent';
  return [
    {
      id: 'vrb-p1', type: 'intro',
      title: 'Introduction — Les verbes au présent',
      content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 Grammaire Française A1</div>
  <h2>${titre}</h2>
  <p class="lead">Le <strong>présent de l'indicatif</strong> est le temps de base du français. Il exprime une action qui se passe <em>maintenant</em>, une <em>habitude</em> ou une <em>vérité générale</em>.</p>
  <div class="lesson-objectives">
    <h4>🎯 Objectifs de cette leçon</h4>
    <ul>
      <li>Conjuguer les verbes du <strong>1er groupe</strong> (-er) au présent</li>
      <li>Maîtriser les verbes du <strong>2e groupe</strong> (-ir)</li>
      <li>Connaître les verbes <strong>irréguliers</strong> essentiels : être, avoir, aller, faire</li>
      <li>Utiliser les pronoms sujets correctement</li>
    </ul>
  </div>
  <div class="lesson-highlight"><strong>Dans cette leçon :</strong> je · tu · il/elle · nous · vous · ils/elles · -er · -ir · être · avoir · aller · faire</div>
</div>`,
    },
    {
      id: 'vrb-p2', type: 'lesson',
      title: '1er groupe — Verbes en -ER',
      content: `<h3>La conjugaison du 1er groupe (-ER)</h3>
<p>Les verbes en <strong>-er</strong> représentent 90% des verbes français. La conjugaison est régulière.</p>
<div class="rule-box">
  <div class="rule-icon">📝</div>
  <div>
    <strong>Modèle : PARLER</strong>
    <table style="width:100%;border-collapse:collapse;margin-top:.5rem;font-size:.9rem">
      <tr style="background:#dc2626;color:#fff"><th style="padding:6px">Pronom</th><th style="padding:6px">Conjugaison</th><th style="padding:6px">Traduction</th></tr>
      <tr><td style="padding:6px">je</td><td style="padding:6px">parl<strong>e</strong></td><td style="padding:6px">I speak</td></tr>
      <tr style="background:#f9f9f9"><td style="padding:6px">tu</td><td style="padding:6px">parl<strong>es</strong></td><td style="padding:6px">you speak</td></tr>
      <tr><td style="padding:6px">il / elle</td><td style="padding:6px">parl<strong>e</strong></td><td style="padding:6px">he/she speaks</td></tr>
      <tr style="background:#f9f9f9"><td style="padding:6px">nous</td><td style="padding:6px">parl<strong>ons</strong></td><td style="padding:6px">we speak</td></tr>
      <tr><td style="padding:6px">vous</td><td style="padding:6px">parl<strong>ez</strong></td><td style="padding:6px">you speak</td></tr>
      <tr style="background:#f9f9f9"><td style="padding:6px">ils / elles</td><td style="padding:6px">parl<strong>ent</strong></td><td style="padding:6px">they speak</td></tr>
    </table>
  </div>
</div>
<div class="info-box">💡 Autres verbes en -er : <em>aimer, habiter, travailler, manger, écouter, regarder, étudier, marcher, danser…</em></div>`,
    },
    {
      id: 'vrb-p3', type: 'lesson',
      title: 'Être & Avoir — Verbes essentiels',
      content: `<h3>Les deux verbes les plus importants</h3>
<div class="rule-box">
  <div class="rule-icon">⭐</div>
  <div>
    <strong>ÊTRE (to be)</strong>
    <table style="width:100%;border-collapse:collapse;margin-top:.5rem;font-size:.9rem">
      <tr><td style="padding:4px">je <strong>suis</strong></td><td style="padding:4px">nous <strong>sommes</strong></td></tr>
      <tr style="background:#f9f9f9"><td style="padding:4px">tu <strong>es</strong></td><td style="padding:4px">vous <strong>êtes</strong></td></tr>
      <tr><td style="padding:4px">il/elle <strong>est</strong></td><td style="padding:4px">ils/elles <strong>sont</strong></td></tr>
    </table>
    <em style="font-size:.85rem">Je <strong>suis</strong> étudiant. Elle <strong>est</strong> française.</em>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">⭐</div>
  <div>
    <strong>AVOIR (to have)</strong>
    <table style="width:100%;border-collapse:collapse;margin-top:.5rem;font-size:.9rem">
      <tr><td style="padding:4px">j' <strong>ai</strong></td><td style="padding:4px">nous <strong>avons</strong></td></tr>
      <tr style="background:#f9f9f9"><td style="padding:4px">tu <strong>as</strong></td><td style="padding:4px">vous <strong>avez</strong></td></tr>
      <tr><td style="padding:4px">il/elle <strong>a</strong></td><td style="padding:4px">ils/elles <strong>ont</strong></td></tr>
    </table>
    <em style="font-size:.85rem">J' <strong>ai</strong> 20 ans. Nous <strong>avons</strong> un chien.</em>
  </div>
</div>`,
    },
    {
      id: 'vrb-p4', type: 'lesson',
      title: 'Aller & Faire — Verbes du quotidien',
      content: `<h3>Deux verbes indispensables au quotidien</h3>
<div class="rule-box">
  <div class="rule-icon">🚶</div>
  <div>
    <strong>ALLER (to go)</strong>
    <ul>
      <li>je <strong>vais</strong> · tu <strong>vas</strong> · il <strong>va</strong></li>
      <li>nous <strong>allons</strong> · vous <strong>allez</strong> · ils <strong>vont</strong></li>
    </ul>
    <em style="font-size:.85rem">Je <strong>vais</strong> à l'école. Nous <strong>allons</strong> au cinéma.</em>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">🔨</div>
  <div>
    <strong>FAIRE (to do / make)</strong>
    <ul>
      <li>je <strong>fais</strong> · tu <strong>fais</strong> · il <strong>fait</strong></li>
      <li>nous <strong>faisons</strong> · vous <strong>faites</strong> · ils <strong>font</strong></li>
    </ul>
    <em style="font-size:.85rem">Je <strong>fais</strong> du sport. Ma femme <strong>fait</strong> le repas.</em>
  </div>
</div>
<div class="lesson-highlight" style="margin-top:1rem">🎓 Vous avez terminé la leçon ! Passez aux <strong>Exercices</strong> pour tester vos connaissances.</div>`,
    },
  ];
}

// ════════════════════════════════════════════════════════════════════
// PAGES GENERIQUES — pour tout autre cours sans topic reconnu
// ════════════════════════════════════════════════════════════════════
function buildPagesGeneric(course) {
  const titre = course.titre || course.title || 'Cours de français';
  const desc = course.description || 'Maîtrisez ce point de grammaire française essentiel.';
  const niveau = course.niveau || 'A1';
  return [
    {
      id: 'gen-p1', type: 'intro',
      title: `Introduction — ${titre}`,
      content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 Grammaire Française ${niveau}</div>
  <h2>${titre}</h2>
  <p class="lead">${desc}</p>
  <div class="lesson-objectives">
    <h4>🎯 Objectifs de cette leçon</h4>
    <ul>
      <li>Comprendre les règles fondamentales de ce point de grammaire</li>
      <li>Identifier les cas d'usage dans des phrases réelles</li>
      <li>Éviter les erreurs les plus fréquentes</li>
      <li>Mettre en pratique à travers des exercices progressifs</li>
    </ul>
  </div>
  <div class="lesson-highlight"><strong>Niveau :</strong> ${niveau} — Pédagogie progressive · Exemples bilingues · Exercices interactifs</div>
</div>`,
    },
    {
      id: 'gen-p2', type: 'lesson',
      title: 'Notions fondamentales',
      content: `<h3>Les règles essentielles</h3>
<div class="rule-box">
  <div class="rule-icon">📖</div>
  <div>
    <p>Ce cours porte sur : <strong>${titre}</strong></p>
    <p>Étudiez attentivement les exercices ci-dessous — ils couvrent les cas les plus importants à maîtriser pour le niveau <strong>${niveau}</strong>.</p>
    <ul>
      <li>Lisez chaque question attentivement avant de répondre</li>
      <li>Si vous hésitez, éliminez d'abord les réponses incorrectes</li>
      <li>Notez les structures correctes pour les mémoriser</li>
    </ul>
  </div>
</div>
<div class="info-box">💡 <strong>Conseil pédagogique :</strong> Après avoir fait les exercices, relisez les réponses correctes à voix haute pour mémoriser les structures.</div>`,
    },
    {
      id: 'gen-p3', type: 'lesson',
      title: 'Exemples et contexte',
      content: `<h3>Mise en contexte — Exemples pratiques</h3>
<div class="rule-box">
  <div class="rule-icon">💬</div>
  <div>
    <p><strong>Comment mémoriser efficacement :</strong></p>
    <ul>
      <li><strong>Répétition espacée :</strong> Revenez sur ce cours après 1 jour, puis 3 jours, puis 1 semaine.</li>
      <li><strong>Production active :</strong> Créez vos propres exemples avec les mots que vous connaissez.</li>
      <li><strong>Contexte réel :</strong> Cherchez ces structures dans des textes, films ou conversations en français.</li>
    </ul>
  </div>
</div>
<div class="compare-box">
  <div class="compare-item good">✅ Pratiquez régulièrement — 15 minutes par jour valent mieux qu'une heure par semaine</div>
  <div class="compare-item special">⭐ Faites les exercices plusieurs fois jusqu'à obtenir 100%</div>
</div>
<div class="lesson-highlight" style="margin-top:1rem">🎓 Passez aux <strong>Exercices</strong> pour mettre en pratique !</div>`,
    },
  ];
}

// ════════════════════════════════════════════════════════════════════
// SÉLECTEUR DE PAGES SELON LE TOPIC
// ════════════════════════════════════════════════════════════════════
function buildPages(course) {
  const topic = detectTopic(course);
  switch (topic) {
    case 'prepositions-all': return buildPagesPrepositionsAll(course);
    case 'articles':         return buildPagesArticles(course);
    case 'verbes':           return buildPagesVerbes(course);
    case 'temps':
    case 'lieu':
      // Ces cours utilisent les pages hardcodées dans SecureCourseViewer.jsx
      // Mais on leur ajoute quand même des pages DB pour être complet
      return buildPagesPrepositionsAll(course);
    default:                 return buildPagesGeneric(course);
  }
}

// ════════════════════════════════════════════════════════════════════
// DIAGNOSTIC : un cours a-t-il besoin d'une mise à jour ?
// ════════════════════════════════════════════════════════════════════
function needsUpdate(course) {
  // A déjà des pages DB complètes → skip
  let pages = [];
  try {
    pages = typeof course.pages === 'string'
      ? JSON.parse(course.pages || '[]')
      : (course.pages || []);
  } catch {}

  // Compte les pages de type 'intro' ou 'lesson' (vraies pages pédagogiques)
  const lessonPages = pages.filter(p => p.type === 'intro' || p.type === 'lesson' || p.type === 'bilan');

  // Cours audio avec beaucoup de pages → déjà complet
  if (pages.length >= 5 && lessonPages.length >= 2) return false;

  // Cours sans pages OU pages insuffisantes → à mettre à jour
  return true;
}

// ════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════
async function main() {
  console.log('\n🎓 update-courses-pedagogy.mjs');
  console.log('═'.repeat(60));
  if (DRY_RUN) console.log('⚠️  MODE APERÇU (--dry-run) — aucune écriture\n');

  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log(`✅ Connecté à PocketBase (${PB_URL})\n`);

  // Récupérer les cours
  let courses;
  if (TARGET) {
    const c = await pb.collection('courses').getOne(TARGET, { requestKey: null });
    courses = [c];
    console.log(`🎯 Cours ciblé : "${c.titre}" (${c.id})\n`);
  } else {
    courses = await pb.collection('courses').getFullList({ sort: 'created', requestKey: null });
    console.log(`📚 ${courses.length} cours trouvés\n`);
  }

  let updated = 0, skipped = 0;

  for (const course of courses) {
    const topic = detectTopic(course);
    const needs = needsUpdate(course);

    if (!needs) {
      console.log(`  ⏭️  SKIP    "${course.titre}" — pages déjà complètes`);
      skipped++;
      continue;
    }

    const pages = buildPages(course);
    console.log(`  ✏️  UPDATE  "${course.titre}"`);
    console.log(`           Topic: ${topic} | ${pages.length} pages à injecter`);

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
  console.log(`📊 Résultats : ${updated} mis à jour · ${skipped} déjà complets`);
  if (DRY_RUN) console.log('⚠️  Relancez sans --dry-run pour appliquer les changements');
  console.log('');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
