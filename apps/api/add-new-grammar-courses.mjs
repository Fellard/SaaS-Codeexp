// add-new-grammar-courses.mjs
// Ajoute 4 nouveaux cours de grammaire française dans PocketBase
// Cours : indicateurs de temps (A1-A2), pronoms relatifs composés (B1),
//         homophones (B1-B2), verbes + prépositions à/de (B2)
// Idempotent : vérifie le titre avant de créer
//
// Utilisation :
//   PB_URL=http://127.0.0.1:8090 \
//   PB_SUPERUSER_EMAIL=admin@example.com \
//   PB_SUPERUSER_PASSWORD=secret \
//   node add-new-grammar-courses.mjs

import 'dotenv/config';
import PocketBase from 'pocketbase';

const PB_URL   = process.env.PB_URL                || 'http://127.0.0.1:8090';
const PB_EMAIL = process.env.PB_SUPERUSER_EMAIL    || '';
const PB_PASS  = process.env.PB_SUPERUSER_PASSWORD || '';

// ─────────────────────────────────────────────────────────────────────────────
// Cours 1 — Les indicateurs de temps (A1-A2)
// ─────────────────────────────────────────────────────────────────────────────
const cours_indicateurs_temps = {
  titre:         'Les indicateurs de temps : depuis, il y a, pendant, dans… (A1-A2)',
  langue:        'Francais',
  course_type:   'standard',
  niveau:        'A1-A2',
  description:   'Maîtrisez les indicateurs de temps en français : depuis, il y a, pendant, en, dans, pour, jusqu\'à et à partir de. Apprenez à situer les actions dans le temps avec précision.',
  categorie:     'langue',
  categorie_age: 'Adultes',
  duree:         '35 min',
  prix:          0,
  instructeur:   'IWS',
  sort_order:    110,
  pages: [
    {
      id:      'fr-indic-temps-p1',
      type:    'lesson',
      title:   '🕐 Les indicateurs de temps',
      content: `<div class="lesson-intro">
<div class="lesson-badge">📚 Grammaire Française — A1/A2</div>
<h2>Les indicateurs de temps</h2>
<p class="lead">Les indicateurs de temps permettent de situer une action dans le passé, le présent ou le futur.</p>
<div class="lesson-objectives">
<h4>🎯 Objectifs du cours</h4>
<ul>
<li>Distinguer <strong>depuis</strong>, <strong>il y a</strong>, <strong>pendant</strong>, <strong>en</strong></li>
<li>Utiliser <strong>dans</strong>, <strong>pour</strong>, <strong>jusqu'à</strong>, <strong>à partir de</strong></li>
<li>Situer une action dans le temps avec précision</li>
</ul>
</div>
</div>

<div class="rule-box">
<h4>⏮ Passé — actions révolues</h4>
<ul>
<li><strong>Il y a + durée</strong> → moment révolu : <em>Il est parti <strong>il y a</strong> deux heures.</em></li>
<li><strong>Pendant + durée</strong> → durée limitée terminée : <em>J'ai travaillé <strong>pendant</strong> trois ans.</em></li>
<li><strong>En + durée</strong> → temps nécessaire pour accomplir : <em>Elle a lu ce livre <strong>en</strong> deux jours.</em></li>
</ul>
</div>

<div class="rule-box">
<h4>⏯ Présent — actions en cours</h4>
<ul>
<li><strong>Depuis + durée / date</strong> → début d'une action qui continue : <em>J'habite ici <strong>depuis</strong> 2019.</em></li>
<li><strong>Ça fait … que</strong> → équivalent familier de depuis : <em><strong>Ça fait</strong> deux ans <strong>que</strong> je l'attends.</em></li>
</ul>
</div>

<div class="rule-box">
<h4>⏭ Futur — actions à venir</h4>
<ul>
<li><strong>Dans + durée</strong> → moment futur à partir de maintenant : <em>Il arrivera <strong>dans</strong> dix minutes.</em></li>
<li><strong>Pour + durée</strong> → durée prévue : <em>Je pars <strong>pour</strong> trois semaines.</em></li>
<li><strong>Jusqu'à + moment</strong> → limite temporelle : <em>J'attends <strong>jusqu'à</strong> midi.</em></li>
<li><strong>À partir de + moment</strong> → début futur : <em><strong>À partir de</strong> lundi, je travaille ici.</em></li>
</ul>
</div>

<div class="lesson-highlight">
⚠️ <strong>Confusion fréquente</strong> : <em>depuis</em> vs <em>il y a</em><br>
→ <strong>Depuis</strong> = l'action DURE encore : <em>Je travaille ici depuis 3 ans</em> (je travaille encore)<br>
→ <strong>Il y a</strong> = l'action est TERMINÉE : <em>J'ai commencé il y a 3 ans</em> (référence au passé)
</div>

<div class="rule-box">
<h4>📋 Tableau récapitulatif</h4>
<table>
<thead><tr><th>Indicateur</th><th>Usage</th><th>Exemple</th></tr></thead>
<tbody>
<tr><td><strong>depuis</strong></td><td>action commencée dans le passé, toujours en cours</td><td>Je vis ici depuis 5 ans.</td></tr>
<tr><td><strong>il y a</strong></td><td>action révolue dans le passé</td><td>Je suis arrivé il y a 5 ans.</td></tr>
<tr><td><strong>pendant</strong></td><td>durée d'une action passée (terminée)</td><td>J'ai attendu pendant 2 heures.</td></tr>
<tr><td><strong>en</strong></td><td>temps pour accomplir une action</td><td>Il a couru 10 km en 45 min.</td></tr>
<tr><td><strong>dans</strong></td><td>moment futur</td><td>Je reviens dans 5 minutes.</td></tr>
<tr><td><strong>pour</strong></td><td>durée prévue</td><td>Elle part pour 3 semaines.</td></tr>
<tr><td><strong>jusqu'à</strong></td><td>limite temporelle</td><td>Il travaille jusqu'à 18h.</td></tr>
<tr><td><strong>à partir de</strong></td><td>début d'une période</td><td>À partir de mai, il fait chaud.</td></tr>
</tbody>
</table>
</div>`
    },
    {
      id:      'fr-indic-temps-bridge',
      type:    'bridge',
      title:   '🌍 Les indicateurs de temps dans 3 langues',
      content: `<h3>📖 Les indicateurs de temps dans 3 langues</h3>
<div class="rule-box"><h4>📊 Tableau comparatif FR | EN | AR</h4>
<table><thead><tr><th>Indicateur</th><th>🇫🇷 Français</th><th>🇬🇧 English</th><th>🇸🇦 العربية</th></tr></thead>
<tbody>
<tr><td>Action en cours</td><td>depuis 3 ans</td><td>for 3 years (present perfect)</td><td>منذ 3 سنوات</td></tr>
<tr><td>Moment révolu</td><td>il y a 2 jours</td><td>2 days ago</td><td>منذ يومين / قبل يومين</td></tr>
<tr><td>Durée terminée</td><td>pendant une heure</td><td>for an hour (past)</td><td>لمدة ساعة</td></tr>
<tr><td>Moment futur</td><td>dans 10 minutes</td><td>in 10 minutes</td><td>بعد 10 دقائق</td></tr>
<tr><td>Durée prévue</td><td>pour 3 semaines</td><td>for 3 weeks (future)</td><td>لمدة 3 أسابيع</td></tr>
<tr><td>Limite</td><td>jusqu'à lundi</td><td>until Monday</td><td>حتى يوم الاثنين</td></tr>
<tr><td>Début d'une période</td><td>à partir de mars</td><td>from March / starting March</td><td>ابتداءً من مارس</td></tr>
</tbody></table></div>
<div class="example-box"><h4>✏️ La même phrase dans 3 langues</h4>
<ul>
<li>🇫🇷 <em>Je travaille ici depuis trois ans.</em></li>
<li>🇬🇧 <em>I have been working here for three years.</em></li>
<li>🇸🇦 <em>أعمل هنا منذ ثلاث سنوات.</em></li>
</ul></div>
<div class="tip-box"><h4>⚠️ Différences importantes</h4>
<ul>
<li>🇫🇷 <strong>depuis</strong> couvre à la fois "since" et "for" en anglais</li>
<li>🇬🇧 <strong>since</strong> + point de départ (since 2020) / <strong>for</strong> + durée (for 3 years)</li>
<li>🇸🇦 <strong>منذ</strong> couvre les deux selon le contexte</li>
</ul></div>`
    }
  ],
  exercises: [
    {
      id:       'fr-indic-temps-q1',
      type:     'qcm',
      question: 'Choisissez la bonne réponse : "Il a plu _______ toute la nuit."',
      options:  ['depuis', 'pendant', 'dans', 'à partir de'],
      answer:   1
    },
    {
      id:       'fr-indic-temps-q2',
      type:     'qcm',
      question: 'Que signifie "depuis" dans : "Elle habite Paris depuis 2018" ?',
      options:  [
        'Elle a habité Paris jusqu\'en 2018',
        'Elle habite toujours Paris, à partir de 2018',
        'Elle habitait Paris il y a 2018 ans',
        'Elle habitera Paris en 2018'
      ],
      answer:   1
    },
    {
      id:       'fr-indic-temps-q3',
      type:     'qcm',
      question: '"J\'ai terminé ce rapport _______ deux heures." (le rapport = terminé, durée de travail)',
      options:  ['depuis', 'il y a', 'en', 'dans'],
      answer:   2
    },
    {
      id:       'fr-indic-temps-q4',
      type:     'fill',
      question: 'Complétez : "Nous partons _______ trois semaines en vacances."',
      options:  ['pendant', 'pour', 'depuis', 'en'],
      answer:   1
    },
    {
      id:       'fr-indic-temps-q5',
      type:     'fill',
      question: 'Complétez : "Le cours commence _______ lundi prochain."',
      options:  ['il y a', 'pendant', 'jusqu\'à', 'à partir de'],
      answer:   3
    },
    {
      id:          'fr-indic-temps-q6',
      type:        'order',
      instruction: 'Remettez dans l\'ordre pour former une phrase correcte :',
      words:       ['ici', 'depuis', 'ans', 'cinq', 'Il', 'travaille'],
      answer:      ['Il', 'travaille', 'ici', 'depuis', 'cinq', 'ans']
    },
    {
      id:          'fr-indic-temps-q7',
      type:        'order',
      instruction: 'Remettez dans l\'ordre :',
      words:       ['minutes', 'arrivera', 'dans', 'dix', 'Il'],
      answer:      ['Il', 'arrivera', 'dans', 'dix', 'minutes']
    },
    {
      id:          'fr-indic-temps-q8',
      type:        'vf',
      question:    '"Il y a" s\'utilise avec le présent pour une action toujours en cours.',
      answer:      false,
      explanation: '"Il y a" s\'utilise avec un temps du passé pour une action révolue (ex : "Il est parti il y a 2 heures"). Pour une action toujours en cours, on utilise "depuis" avec le présent.'
    },
    {
      id:          'fr-indic-temps-q9',
      type:        'vf',
      question:    '"En" indique le temps nécessaire pour accomplir une action.',
      answer:      true,
      explanation: '"En" exprime la durée nécessaire pour réaliser quelque chose : "Il a couru 10 km en 45 minutes." On ne confond pas avec "pendant" qui exprime la durée d\'une action.'
    }
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// Cours 2 — Les pronoms relatifs composés (B1)
// ─────────────────────────────────────────────────────────────────────────────
const cours_pronoms_relatifs_composes = {
  titre:         'Les pronoms relatifs composés : lequel, auquel, duquel… (B1)',
  langue:        'Francais',
  course_type:   'standard',
  niveau:        'B1',
  description:   'Apprenez à utiliser les pronoms relatifs composés (lequel, laquelle, lesquels, auquel, duquel) pour relier des propositions et enrichir votre expression écrite et orale.',
  categorie:     'langue',
  categorie_age: 'Adultes',
  duree:         '40 min',
  prix:          0,
  instructeur:   'IWS',
  sort_order:    111,
  pages: [
    {
      id:      'fr-pron-rel-comp-p1',
      type:    'lesson',
      title:   '🔗 Les pronoms relatifs composés',
      content: `<div class="lesson-intro">
<div class="lesson-badge">📚 Grammaire Française — B1</div>
<h2>Les pronoms relatifs composés</h2>
<p class="lead">Les pronoms relatifs composés remplacent un nom précédé d'une préposition. Ils s'accordent en genre et en nombre avec leur antécédent.</p>
<div class="lesson-objectives">
<h4>🎯 Objectifs du cours</h4>
<ul>
<li>Former les pronoms <strong>lequel, laquelle, lesquels, lesquelles</strong></li>
<li>Utiliser les formes contractées : <strong>auquel, duquel</strong> et variantes</li>
<li>Choisir entre <strong>qui</strong> et <strong>lequel</strong> après une préposition</li>
</ul>
</div>
</div>

<div class="rule-box">
<h4>📋 Tableau des formes</h4>
<table>
<thead><tr><th>Genre / Nombre</th><th>Forme simple</th><th>avec à (auquel…)</th><th>avec de (duquel…)</th></tr></thead>
<tbody>
<tr><td>Masculin singulier</td><td>lequel</td><td>auquel</td><td>duquel</td></tr>
<tr><td>Féminin singulier</td><td>laquelle</td><td>à laquelle</td><td>de laquelle</td></tr>
<tr><td>Masculin pluriel</td><td>lesquels</td><td>auxquels</td><td>desquels</td></tr>
<tr><td>Féminin pluriel</td><td>lesquelles</td><td>auxquelles</td><td>desquelles</td></tr>
</tbody>
</table>
</div>

<div class="rule-box">
<h4>🔧 Comment choisir la bonne forme ?</h4>
<p>Repérez la <strong>préposition</strong> utilisée avec le verbe ou l'adjectif :</p>
<ul>
<li><strong>Préposition + lequel</strong> (avec, sans, pour, par, sur, dans…) :<br>
<em>C'est le stylo <strong>avec lequel</strong> j'écris.</em> (écrire avec)</li>
<li><strong>à + lequel → auquel</strong> :<br>
<em>C'est le projet <strong>auquel</strong> je travaille.</em> (travailler à)</li>
<li><strong>de + lequel → duquel</strong> :<br>
<em>C'est le dossier <strong>duquel</strong> tu parlais.</em> (parler de)</li>
</ul>
</div>

<div class="rule-box">
<h4>👤 Qui ou lequel après une préposition ?</h4>
<ul>
<li>Avec des <strong>personnes</strong> : préférence pour <strong>qui</strong> mais lequel est possible<br>
<em>La personne <strong>avec qui</strong> je travaille. / La personne <strong>avec laquelle</strong> je travaille.</em></li>
<li>Avec des <strong>choses</strong> : on utilise <strong>lequel</strong><br>
<em>La table <strong>sur laquelle</strong> il a posé son livre.</em></li>
</ul>
</div>

<div class="lesson-highlight">
⚠️ <strong>Ne pas confondre</strong> avec les pronoms relatifs simples :<br>
→ <strong>qui</strong> = sujet / <strong>que</strong> = objet direct (sans préposition)<br>
→ <strong>lequel</strong> = après une préposition
</div>

<div class="rule-box">
<h4>✅ Exemples complets</h4>
<ul>
<li>C'est la raison <strong>pour laquelle</strong> je suis ici. <em>(la raison est féminin)</em></li>
<li>Voilà les problèmes <strong>auxquels</strong> nous faisons face. <em>(faire face à)</em></li>
<li>Le collègue <strong>duquel</strong> / <strong>dont</strong> tu parles est absent. <em>(parler de → dont possible aussi)</em></li>
<li>C'est un outil <strong>sans lequel</strong> je ne peux pas travailler.</li>
</ul>
</div>`
    },
    {
      id:      'fr-pron-rel-comp-bridge',
      type:    'bridge',
      title:   '🌍 Les pronoms relatifs composés dans 3 langues',
      content: `<h3>📖 Les pronoms relatifs composés dans 3 langues</h3>
<div class="rule-box"><h4>📊 Tableau comparatif FR | EN | AR</h4>
<table><thead><tr><th>Structure</th><th>🇫🇷 Français</th><th>🇬🇧 English</th><th>🇸🇦 العربية</th></tr></thead>
<tbody>
<tr><td>Préposition + chose</td><td>sur lequel / laquelle</td><td>on which</td><td>الذي / التي + على</td></tr>
<tr><td>à + chose</td><td>auquel / à laquelle</td><td>to which</td><td>الذي / التي + إليه/إليها</td></tr>
<tr><td>de + chose</td><td>duquel / de laquelle</td><td>of which / whose</td><td>الذي / التي + منه/منها</td></tr>
<tr><td>avec + personne</td><td>avec qui / avec lequel</td><td>with whom / with which</td><td>الذي / التي معه / معها</td></tr>
<tr><td>pour + raison</td><td>pour lequel / laquelle</td><td>for which</td><td>الذي / التي لأجله/لأجلها</td></tr>
</tbody></table></div>
<div class="example-box"><h4>✏️ La même idée dans 3 langues</h4>
<ul>
<li>🇫🇷 <em>C'est la raison pour laquelle je suis venu.</em></li>
<li>🇬🇧 <em>That is the reason for which / why I came.</em></li>
<li>🇸🇦 <em>هذا هو السبب الذي من أجله جئت.</em></li>
</ul></div>
<div class="tip-box"><h4>⚠️ Différences importantes</h4>
<ul>
<li>🇫🇷 Accord obligatoire en genre et nombre : lequel / laquelle / lesquels / lesquelles</li>
<li>🇬🇧 "which" est invariable, "whom" pour les personnes</li>
<li>🇸🇦 الذي (masc. sing.) / التي (fém. sing.) / الذين (masc. plur.) — pas de contraction avec la préposition</li>
</ul></div>`
    }
  ],
  exercises: [
    {
      id:       'fr-pron-rel-comp-q1',
      type:     'qcm',
      question: 'Complétez : "C\'est le projet _______ je travaille depuis 6 mois." (travailler sur)',
      options:  ['que', 'dont', 'sur lequel', 'auquel'],
      answer:   2
    },
    {
      id:       'fr-pron-rel-comp-q2',
      type:     'qcm',
      question: 'Quelle est la forme correcte ? "Les problèmes _______ nous faisons face." (faire face à)',
      options:  ['auxquels', 'desquels', 'lesquels', 'dont'],
      answer:   0
    },
    {
      id:       'fr-pron-rel-comp-q3',
      type:     'qcm',
      question: '"C\'est la raison _______ je suis parti." — La raison est féminin, la préposition est "pour".',
      options:  ['lequel', 'pour lequel', 'pour laquelle', 'laquelle'],
      answer:   2
    },
    {
      id:       'fr-pron-rel-comp-q4',
      type:     'fill',
      question: 'Complétez : "Voilà les amis _______ j\'ai voyagé." (voyager avec — personnes)',
      options:  ['avec lesquels', 'avec lequel', 'avec qui', 'avec que'],
      answer:   2
    },
    {
      id:       'fr-pron-rel-comp-q5',
      type:     'fill',
      question: 'Complétez : "C\'est un outil _______ je ne peux pas me passer." (se passer de)',
      options:  ['duquel', 'dont', 'sans lequel', 'pour lequel'],
      answer:   1
    },
    {
      id:          'fr-pron-rel-comp-q6',
      type:        'order',
      instruction: 'Remettez dans l\'ordre :',
      words:       ['je', 'lequel', 'C\'est', 'sur', 'travaille', 'le', 'dossier'],
      answer:      ['C\'est', 'le', 'dossier', 'sur', 'lequel', 'je', 'travaille']
    },
    {
      id:          'fr-pron-rel-comp-q7',
      type:        'order',
      instruction: 'Remettez dans l\'ordre :',
      words:       ['auxquelles', 'fais', 'Je', 'face', 'les', 'difficultés'],
      answer:      ['Je', 'fais', 'face', 'aux', 'difficultés', 'auxquelles']
    },
    {
      id:          'fr-pron-rel-comp-q8',
      type:        'vf',
      question:    '"Auquel" est la contraction de "à + lequel".',
      answer:      true,
      explanation: 'En français, "à + lequel" se contracte en "auquel", "à + lesquels" → "auxquels", "à + lesquelles" → "auxquelles". Seul "à + laquelle" reste "à laquelle" (pas de contraction au féminin singulier).'
    },
    {
      id:          'fr-pron-rel-comp-q9',
      type:        'vf',
      question:    'Avec une personne, on ne peut jamais utiliser "lequel".',
      answer:      false,
      explanation: 'Avec une personne, on préfère "qui" après une préposition (avec qui, pour qui…), mais "lequel" est grammaticalement correct aussi : "la personne avec laquelle je travaille" est tout à fait acceptable.'
    }
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// Cours 3 — Les homophones grammaticaux (B1-B2)
// ─────────────────────────────────────────────────────────────────────────────
const cours_homophones = {
  titre:         'Les homophones grammaticaux : a/à, son/sont, ou/où… (B1-B2)',
  langue:        'Francais',
  course_type:   'standard',
  niveau:        'B1-B2',
  description:   'Ne plus confondre les homophones grammaticaux français : a/à, est/et, son/sont, ou/où, c\'est/ses, ce/se, on/ont, mais/mes. Règles claires et exercices pratiques.',
  categorie:     'langue',
  categorie_age: 'Adultes',
  duree:         '40 min',
  prix:          0,
  instructeur:   'IWS',
  sort_order:    112,
  pages: [
    {
      id:      'fr-homophones-p1',
      type:    'lesson',
      title:   '🔤 Les homophones grammaticaux',
      content: `<div class="lesson-intro">
<div class="lesson-badge">📚 Grammaire Française — B1/B2</div>
<h2>Les homophones grammaticaux</h2>
<p class="lead">Des mots qui se prononcent identiquement mais s'écrivent différemment selon leur fonction grammaticale.</p>
<div class="lesson-objectives">
<h4>🎯 Objectifs du cours</h4>
<ul>
<li>Distinguer les homophones les plus courants : <strong>a/à, est/et, son/sont, ou/où, c'est/ses</strong></li>
<li>Comprendre la logique grammaticale derrière chaque forme</li>
<li>Éviter les fautes d'orthographe les plus fréquentes</li>
</ul>
</div>
</div>

<div class="rule-box">
<h4>1️⃣ a / à</h4>
<ul>
<li><strong>a</strong> = verbe avoir (3ᵉ pers. sing.) → on peut remplacer par "avait" :<br>
<em>Il <strong>a</strong> mangé.</em> → "avait" ✓</li>
<li><strong>à</strong> = préposition → "avait" impossible :<br>
<em>Je vais <strong>à</strong> Paris.</em> → "avait" ✗</li>
</ul>
</div>

<div class="rule-box">
<h4>2️⃣ est / et</h4>
<ul>
<li><strong>est</strong> = verbe être (3ᵉ pers. sing.) → remplaçable par "était" :<br>
<em>Il <strong>est</strong> fatigué.</em> → "était" ✓</li>
<li><strong>et</strong> = conjonction de coordination (= and) → "était" impossible :<br>
<em>Pierre <strong>et</strong> Marie sont là.</em> → "était" ✗</li>
</ul>
</div>

<div class="rule-box">
<h4>3️⃣ son / sont</h4>
<ul>
<li><strong>son</strong> = déterminant possessif (son, sa, ses) → remplaçable par "mon" :<br>
<em><strong>Son</strong> chien est grand.</em> → "mon chien" ✓</li>
<li><strong>sont</strong> = verbe être (3ᵉ pers. plur.) → remplaçable par "étaient" :<br>
<em>Ils <strong>sont</strong> partis.</em> → "étaient" ✓</li>
</ul>
</div>

<div class="rule-box">
<h4>4️⃣ ou / où</h4>
<ul>
<li><strong>ou</strong> = conjonction (= or, either/or) → remplaçable par "ou bien" :<br>
<em>Café <strong>ou</strong> thé ?</em></li>
<li><strong>où</strong> = pronom relatif / adverbe de lieu :<br>
<em>La ville <strong>où</strong> je vis.</em> / <em><strong>Où</strong> es-tu ?</em></li>
</ul>
</div>

<div class="rule-box">
<h4>5️⃣ c'est / ses / ces / s'est</h4>
<ul>
<li><strong>c'est</strong> = c + est (présentatif) : <em><strong>C'est</strong> beau.</em></li>
<li><strong>ses</strong> = pluriel de son/sa : <em><strong>Ses</strong> enfants jouent.</em></li>
<li><strong>ces</strong> = déterminant démonstratif pluriel : <em><strong>Ces</strong> fleurs sont jolies.</em></li>
<li><strong>s'est</strong> = pronom + est (verbe pronominal) : <em>Elle <strong>s'est</strong> levée tôt.</em></li>
</ul>
</div>

<div class="rule-box">
<h4>6️⃣ on / ont</h4>
<ul>
<li><strong>on</strong> = pronom sujet (= nous/someone) → remplaçable par "il" :<br>
<em><strong>On</strong> mange à midi.</em></li>
<li><strong>ont</strong> = verbe avoir (3ᵉ pers. plur.) → remplaçable par "avaient" :<br>
<em>Ils <strong>ont</strong> fini.</em> → "avaient" ✓</li>
</ul>
</div>

<div class="lesson-highlight">
💡 <strong>Astuce générale</strong> : Pour chaque homophone, demandez-vous si vous pouvez le remplacer par une forme à l'imparfait (avait, était, étaient, avaient). Si oui → forme verbale. Sinon → préposition, conjonction ou déterminant.
</div>`
    },
    {
      id:      'fr-homophones-bridge',
      type:    'bridge',
      title:   '🌍 Les homophones dans 3 langues',
      content: `<h3>📖 Les homophones grammaticaux dans 3 langues</h3>
<div class="rule-box"><h4>📊 Tableau comparatif FR | EN | AR</h4>
<table><thead><tr><th>Homophone FR</th><th>🇫🇷 Distinction</th><th>🇬🇧 English</th><th>🇸🇦 العربية</th></tr></thead>
<tbody>
<tr><td>a / à</td><td>verbe avoir / préposition</td><td>has / to (at)</td><td>لديه / إلى (في)</td></tr>
<tr><td>est / et</td><td>verbe être / conjonction</td><td>is / and</td><td>هو (يكون) / و</td></tr>
<tr><td>son / sont</td><td>possessif / verbe être plur.</td><td>his-her / are</td><td>-ه / -ها / هم يكونون</td></tr>
<tr><td>ou / où</td><td>conjonction / lieu</td><td>or / where</td><td>أو / أين</td></tr>
<tr><td>on / ont</td><td>pronom / avoir plur.</td><td>one-we / they have</td><td>المرء / لديهم</td></tr>
</tbody></table></div>
<div class="example-box"><h4>✏️ Homophones en contexte multilingue</h4>
<ul>
<li>🇫🇷 <em>Il <strong>a</strong> voyagé <strong>à</strong> Paris.</em></li>
<li>🇬🇧 <em>He <strong>has</strong> traveled <strong>to</strong> Paris.</em></li>
<li>🇸🇦 <em>لقد سافر <strong>إلى</strong> باريس.</em></li>
</ul></div>
<div class="tip-box"><h4>⚠️ Particularité française</h4>
<ul>
<li>🇫🇷 Le français a beaucoup d'homophones car les terminaisons verbales (-e, -es, -ent) ne se prononcent pas</li>
<li>🇬🇧 L'anglais a aussi des homophones (there/their/they're) mais moins de formes verbales identiques</li>
<li>🇸🇦 L'arabe écrit les voyelles brèves sous forme de signes diacritiques (harakāt) — moins d'homophones à l'écrit</li>
</ul></div>`
    }
  ],
  exercises: [
    {
      id:       'fr-homophones-q1',
      type:     'qcm',
      question: 'Choisissez la bonne orthographe : "Elle ___ appelé hier soir."',
      options:  ['a', 'à'],
      answer:   0
    },
    {
      id:       'fr-homophones-q2',
      type:     'qcm',
      question: 'Choisissez la bonne orthographe : "Je vais ___ la boulangerie."',
      options:  ['a', 'à'],
      answer:   1
    },
    {
      id:       'fr-homophones-q3',
      type:     'qcm',
      question: '"Les élèves ___ rendu leurs devoirs." — Lequel convient ?',
      options:  ['on', 'ont'],
      answer:   1
    },
    {
      id:       'fr-homophones-q4',
      type:     'fill',
      question: 'Complétez : "Tu veux du café ___ du thé ?"',
      options:  ['ou', 'où'],
      answer:   0
    },
    {
      id:       'fr-homophones-q5',
      type:     'fill',
      question: 'Complétez : "Dis-moi ___ tu habites."',
      options:  ['ou', 'où'],
      answer:   1
    },
    {
      id:       'fr-homophones-q6',
      type:     'fill',
      question: 'Complétez : "___ frère joue de la guitare." (le frère appartient à quelqu\'un)',
      options:  ['Son', 'Sont'],
      answer:   0
    },
    {
      id:          'fr-homophones-q7',
      type:        'order',
      instruction: 'Remettez dans l\'ordre pour former une phrase correcte :',
      words:       ['à', 'est', 'Il', 'Paris', 'allé'],
      answer:      ['Il', 'est', 'allé', 'à', 'Paris']
    },
    {
      id:          'fr-homophones-q8',
      type:        'vf',
      question:    'Pour vérifier si on doit écrire "a" ou "à", on peut essayer de remplacer par "avait".',
      answer:      true,
      explanation: 'Si "avait" peut remplacer le mot, c\'est le verbe "avoir" → on écrit "a". Si "avait" ne convient pas, c\'est la préposition → on écrit "à" avec accent.'
    },
    {
      id:          'fr-homophones-q9',
      type:        'vf',
      question:    '"Ces" et "ses" se prononcent différemment.',
      answer:      false,
      explanation: '"Ces" (démonstratif pluriel : "ces livres") et "ses" (possessif pluriel : "ses livres") sont des homophones — ils se prononcent exactement pareil [se]. Seul le contexte grammatical permet de les distinguer.'
    }
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// Cours 4 — Les verbes avec prépositions à et de (B2)
// ─────────────────────────────────────────────────────────────────────────────
const cours_verbes_prep = {
  titre:         'Les verbes suivis de à ou de : commencer à, finir de, décider de… (B2)',
  langue:        'Francais',
  course_type:   'standard',
  niveau:        'B2',
  description:   'Maîtrisez les constructions verbales avec les prépositions "à" et "de" en français : commencer à, finir de, réussir à, décider de, accepter de, hésiter à… et la règle être + adjectif + préposition.',
  categorie:     'langue',
  categorie_age: 'Adultes',
  duree:         '45 min',
  prix:          0,
  instructeur:   'IWS',
  sort_order:    113,
  pages: [
    {
      id:      'fr-verbes-prep-p1',
      type:    'lesson',
      title:   '⚙️ Verbes + prépositions à et de',
      content: `<div class="lesson-intro">
<div class="lesson-badge">📚 Grammaire Française — B2</div>
<h2>Les verbes suivis de à ou de</h2>
<p class="lead">En français, de nombreux verbes exigent une préposition spécifique avant un infinitif ou un complément. Il n'existe pas de règle absolue : il faut mémoriser les constructions.</p>
<div class="lesson-objectives">
<h4>🎯 Objectifs du cours</h4>
<ul>
<li>Connaître les verbes qui se construisent avec <strong>à + infinitif</strong></li>
<li>Connaître les verbes qui se construisent avec <strong>de + infinitif</strong></li>
<li>Appliquer la règle <strong>être + adjectif + à/de</strong></li>
</ul>
</div>
</div>

<div class="rule-box">
<h4>🔵 Verbes + à + infinitif</h4>
<p>Ces verbes veulent <strong>à</strong> avant un deuxième verbe :</p>
<div style="columns: 2; gap: 1rem;">
<ul>
<li>aider <strong>à</strong></li>
<li>apprendre <strong>à</strong></li>
<li>arriver <strong>à</strong></li>
<li>chercher <strong>à</strong></li>
<li>commencer <strong>à</strong></li>
<li>continuer <strong>à</strong></li>
<li>hésiter <strong>à</strong></li>
<li>inviter <strong>à</strong></li>
<li>penser <strong>à</strong></li>
<li>réussir <strong>à</strong></li>
<li>s'amuser <strong>à</strong></li>
<li>tenir <strong>à</strong></li>
</ul>
</div>
<p>Exemples : <em>Elle <strong>commence à</strong> comprendre.</em> / <em>Il <strong>réussit à</strong> parler sans accent.</em></p>
</div>

<div class="rule-box">
<h4>🔴 Verbes + de + infinitif</h4>
<p>Ces verbes veulent <strong>de</strong> avant un deuxième verbe :</p>
<div style="columns: 2; gap: 1rem;">
<ul>
<li>accepter <strong>de</strong></li>
<li>arrêter <strong>de</strong></li>
<li>choisir <strong>de</strong></li>
<li>décider <strong>de</strong></li>
<li>essayer <strong>de</strong></li>
<li>finir <strong>de</strong></li>
<li>interdire <strong>de</strong></li>
<li>oublier <strong>de</strong></li>
<li>promettre <strong>de</strong></li>
<li>refuser <strong>de</strong></li>
<li>rêver <strong>de</strong></li>
<li>risquer <strong>de</strong></li>
</ul>
</div>
<p>Exemples : <em>J'ai <strong>décidé de</strong> partir.</em> / <em>Elle <strong>essaie de</strong> trouver une solution.</em></p>
</div>

<div class="rule-box">
<h4>🟡 Être + adjectif + à / de</h4>
<ul>
<li><strong>être + adjectif + à + infinitif</strong> → facile, difficile, agréable, prêt, le premier/dernier… :<br>
<em>Ce livre est <strong>facile à</strong> lire.</em> / <em>Elle est <strong>prête à</strong> partir.</em></li>
<li><strong>être + adjectif + de + infinitif</strong> → heureux, content, désolé, capable, obligé, triste… :<br>
<em>Je suis <strong>heureux de</strong> te voir.</em> / <em>Il est <strong>capable de</strong> réussir.</em></li>
</ul>
</div>

<div class="rule-box">
<h4>⚠️ Verbes pouvant changer de sens selon la préposition</h4>
<table>
<thead><tr><th>Verbe</th><th>+ à</th><th>+ de</th></tr></thead>
<tbody>
<tr><td>penser</td><td>penser à qn (avoir en tête) : <em>Je pense à toi.</em></td><td>penser de qch (avoir un avis) : <em>Que penses-tu de ce film ?</em></td></tr>
<tr><td>manquer</td><td>manquer à qn (ressentir l'absence) : <em>Tu me manques.</em></td><td>manquer de qch (ne pas avoir assez) : <em>Il manque de patience.</em></td></tr>
<tr><td>tenir</td><td>tenir à (être attaché à) : <em>Je tiens à partir tôt.</em></td><td>tenir de (ressembler à) : <em>Elle tient de sa mère.</em></td></tr>
</tbody>
</table>
</div>

<div class="lesson-highlight">
💡 <strong>Astuce mnémotechnique</strong> :<br>
→ Verbes d'<em>action progressive</em> → <strong>à</strong> (commencer à, continuer à, réussir à)<br>
→ Verbes d'<em>achèvement ou décision</em> → <strong>de</strong> (finir de, décider de, arrêter de)
</div>`
    },
    {
      id:      'fr-verbes-prep-bridge',
      type:    'bridge',
      title:   '🌍 Verbes + prépositions dans 3 langues',
      content: `<h3>📖 Les constructions verbales dans 3 langues</h3>
<div class="rule-box"><h4>📊 Tableau comparatif FR | EN | AR</h4>
<table><thead><tr><th>Construction FR</th><th>🇫🇷 Exemple</th><th>🇬🇧 English</th><th>🇸🇦 العربية</th></tr></thead>
<tbody>
<tr><td>commencer à</td><td>commencer à travailler</td><td>start working / start to work</td><td>يبدأ في / بـ العمل</td></tr>
<tr><td>finir de</td><td>finir de manger</td><td>finish eating</td><td>ينتهي من الأكل</td></tr>
<tr><td>décider de</td><td>décider de partir</td><td>decide to leave</td><td>يقرر المغادرة</td></tr>
<tr><td>réussir à</td><td>réussir à convaincre</td><td>manage to convince / succeed in</td><td>ينجح في الإقناع</td></tr>
<tr><td>essayer de</td><td>essayer de comprendre</td><td>try to understand</td><td>يحاول الفهم</td></tr>
<tr><td>hésiter à</td><td>hésiter à répondre</td><td>hesitate to answer</td><td>يتردد في الإجابة</td></tr>
</tbody></table></div>
<div class="example-box"><h4>✏️ La même idée dans 3 langues</h4>
<ul>
<li>🇫🇷 <em>Il a décidé de changer de travail.</em></li>
<li>🇬🇧 <em>He decided to change jobs.</em></li>
<li>🇸🇦 <em>قرّر تغيير وظيفته.</em></li>
</ul></div>
<div class="tip-box"><h4>⚠️ Différences structurelles importantes</h4>
<ul>
<li>🇫🇷 La préposition (à/de) est imposée par le premier verbe — pas de logique universelle</li>
<li>🇬🇧 Choix entre infinitif (to + V) ou gérondif (V-ing) selon le verbe — aussi arbitraire (stop to do ≠ stop doing)</li>
<li>🇸🇦 Structure : verbe conjugué + مصدر (nom verbal) ou verbe conjugué + أن + verbe — la préposition se fond dans la structure</li>
</ul></div>`
    }
  ],
  exercises: [
    {
      id:       'fr-verbes-prep-q1',
      type:     'qcm',
      question: 'Choisissez la préposition correcte : "Elle a décidé ___ partir en vacances."',
      options:  ['à', 'de', 'pour', 'en'],
      answer:   1
    },
    {
      id:       'fr-verbes-prep-q2',
      type:     'qcm',
      question: 'Complétez : "Ils ont finalement réussi ___ obtenir leur diplôme."',
      options:  ['de', 'à', 'pour', 'en'],
      answer:   1
    },
    {
      id:       'fr-verbes-prep-q3',
      type:     'qcm',
      question: '"Je suis heureux ___ vous rencontrer." — Quelle préposition ?',
      options:  ['à', 'de', 'par', 'pour'],
      answer:   1
    },
    {
      id:       'fr-verbes-prep-q4',
      type:     'qcm',
      question: 'Quelle phrase est correcte ?',
      options:  [
        'Elle a commencé de chanter.',
        'Elle a commencé à chanter.',
        'Elle a commencé pour chanter.',
        'Elle a commencé chanter.'
      ],
      answer:   1
    },
    {
      id:       'fr-verbes-prep-q5',
      type:     'fill',
      question: 'Complétez : "N\'oublie pas ___ appeler ta mère !"',
      options:  ['à', 'de', 'pour', 'en'],
      answer:   1
    },
    {
      id:       'fr-verbes-prep-q6',
      type:     'fill',
      question: 'Complétez : "Ce problème est difficile ___ résoudre."',
      options:  ['de', 'à', 'pour', 'en'],
      answer:   1
    },
    {
      id:          'fr-verbes-prep-q7',
      type:        'order',
      instruction: 'Remettez dans l\'ordre pour former une phrase correcte :',
      words:       ['de', 'travailler', 'arrêté', 'Il', 'a', 'nuit', 'la'],
      answer:      ['Il', 'a', 'arrêté', 'de', 'travailler', 'la', 'nuit']
    },
    {
      id:          'fr-verbes-prep-q8',
      type:        'order',
      instruction: 'Remettez dans l\'ordre :',
      words:       ['à', 'Elle', 'continues', 'apprendre', 'à', 'guitar', 'la'],
      answer:      ['Elle', 'continues', 'à', 'apprendre', 'à', 'jouer', 'de', 'la', 'guitar']
    },
    {
      id:          'fr-verbes-prep-q9',
      type:        'vf',
      question:    '"Arrêter de" et "commencer à" prennent la même préposition.',
      answer:      false,
      explanation: '"Arrêter" se construit avec "de" (arrêter de fumer), tandis que "commencer" se construit avec "à" (commencer à travailler). Ce sont deux prépositions différentes car les verbes n\'appartiennent pas au même groupe.'
    },
    {
      id:          'fr-verbes-prep-q10',
      type:        'vf',
      question:    '"Penser à" et "penser de" ont exactement le même sens.',
      answer:      false,
      explanation: '"Penser à" signifie avoir quelqu\'un ou quelque chose à l\'esprit (Je pense à toi). "Penser de" exprime une opinion (Que penses-tu de ce film ?). La préposition change le sens du verbe.'
    }
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// Script principal
// ─────────────────────────────────────────────────────────────────────────────
const COURSES = [
  cours_indicateurs_temps,
  cours_pronoms_relatifs_composes,
  cours_homophones,
  cours_verbes_prep,
];

async function main() {
  const pb = new PocketBase(PB_URL);

  // Authentification superuser
  try {
    await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
    console.log('✅ Connecté à PocketBase');
  } catch (err) {
    console.error('❌ Échec d\'authentification :', err.message);
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;

  for (const course of COURSES) {
    const { pages, exercises, ...meta } = course;

    // Vérifier si le cours existe déjà (idempotence)
    let existing;
    try {
      existing = await pb.collection('courses').getFirstListItem(
        `titre="${meta.titre}" && langue="${meta.langue}" && course_type="standard"`
      );
    } catch (_) {
      existing = null;
    }

    if (existing) {
      console.log(`⏭  Ignoré (déjà présent) : ${meta.titre}`);
      skipped++;
      continue;
    }

    // Créer le cours
    try {
      const payload = {
        ...meta,
        pages:     JSON.stringify(pages),
        exercises: JSON.stringify(exercises),
        actif:     true,
      };

      const record = await pb.collection('courses').create(payload);
      console.log(`✅ Créé : ${meta.titre} (id: ${record.id})`);
      created++;
    } catch (err) {
      console.error(`❌ Erreur lors de la création de "${meta.titre}" :`, err.message);
      if (err.data) console.error('   Détails :', JSON.stringify(err.data, null, 2));
    }
  }

  console.log(`\n📊 Résumé : ${created} cours créé(s), ${skipped} ignoré(s).`);
  process.exit(0);
}

main();
