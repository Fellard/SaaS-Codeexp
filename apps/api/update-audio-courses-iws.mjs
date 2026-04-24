/**
 * update-audio-courses-iws.mjs
 *
 * Restructure complète des cours audio A1.2 :
 *  1. Supprime les anciens cours "Tip Top"
 *  2. Crée 7 cours IWS professionnels avec nommage uniforme
 *  3. Récupère les URLs audio depuis la collection tiptop2_audio
 *  4. Génère des exercices QCM pertinents pour chaque module
 *
 * Usage : node update-audio-courses-iws.mjs
 */

import PocketBase from 'pocketbase';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

try {
  const env = readFileSync(join(__dirname, '.env'), 'utf8');
  env.split('\n').forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
} catch {}

const PB_URL   = process.env.PB_URL  || 'http://127.0.0.1:8090';
const PB_EMAIL = process.env.PB_SUPERUSER_EMAIL    || '';
const PB_PASS  = process.env.PB_SUPERUSER_PASSWORD || '';

// ════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════
function audioPlayer(url, label) {
  if (!url) return `<div class="info-box">🔊 <em>${label} — audio en cours de chargement.</em></div>`;
  return `<div class="audio-player-box">
  <div class="audio-label">🔊 ${label}</div>
  <audio controls style="width:100%;margin-top:6px;border-radius:8px">
    <source src="${url}" type="audio/mpeg" />
  </audio>
</div>`;
}

// ════════════════════════════════════════════════════════════════════
// TRACK MAP — sections par numéro de piste
// ════════════════════════════════════════════════════════════════════
const SECTIONS = {
  module1: [4,5,6,7,8,9,10,11,12,13,14],
  module2: [15,16,17,18,19,20,21,22,23],
  module3: [24,25,26,27,28,29,30,31,32,33,34],
  module4: [35,36,37,38,39,40,41,42,43],
  module5: [44,45,46,47,48,49,50,51,52],
  module6: [53,54,55,56,57,58,59,60],
  evals:   [61,62,63,64,65,66,67,68,69],
};

const TRACK_INFO = {
  4:  { type:'dialogue', label:'Dialogue — La rentrée',                  page:12 },
  5:  { type:'texte',    label:'Le mail de Maé',                         page:12 },
  6:  { type:'texte',    label:'C\'est l\'histoire d\'une heure',        page:13 },
  7:  { type:'activite', label:'Activité de compréhension 1',            page:15 },
  8:  { type:'activite', label:'Activité de compréhension 2',            page:15 },
  9:  { type:'activite', label:'Activité de compréhension 3',            page:15 },
  10: { type:'chanson',  label:'Chanson — Méli-mélodie',                 page:15 },
  11: { type:'activite', label:'Exercice de renforcement 4',             page:5  },
  12: { type:'activite', label:'Exercice de renforcement 6',             page:5  },
  13: { type:'activite', label:'Exercice de renforcement 10',            page:7  },
  14: { type:'activite', label:'Exercice de renforcement 12',            page:7  },
  15: { type:'dialogue', label:'Dialogue 1 — En ville',                  page:20 },
  16: { type:'dialogue', label:'Dialogue 2 — En ville',                  page:20 },
  17: { type:'texte',    label:'Où vont-ils ? — Texte audio',            page:21 },
  18: { type:'activite', label:'Activité de compréhension 1',            page:23 },
  19: { type:'activite', label:'Activité de compréhension 2',            page:23 },
  20: { type:'activite', label:'Activité de compréhension 3',            page:23 },
  21: { type:'chanson',  label:'Chanson — Méli-mélodie',                 page:23 },
  22: { type:'activite', label:'Exercice de renforcement 8',             page:14 },
  23: { type:'activite', label:'Exercice de renforcement 12',            page:15 },
  24: { type:'dialogue', label:'Dialogue 1 — Les loisirs',               page:28 },
  25: { type:'dialogue', label:'Dialogue 2 — Les loisirs',               page:28 },
  26: { type:'texte',    label:'On va s\'amuser ! — Texte audio',        page:29 },
  27: { type:'activite', label:'Activité de compréhension 1',            page:31 },
  28: { type:'activite', label:'Activité de compréhension 2',            page:31 },
  29: { type:'chanson',  label:'Chanson — Méli-mélodie',                 page:31 },
  30: { type:'activite', label:'Exercice de renforcement 7',             page:22 },
  31: { type:'activite', label:'Exercice de renforcement 9',             page:23 },
  32: { type:'activite', label:'Exercice de renforcement 11',            page:23 },
  33: { type:'delf',     label:'DELF Prim — Exercice 1',                 page:24 },
  34: { type:'delf',     label:'DELF Prim — Exercice 2',                 page:24 },
  35: { type:'dialogue', label:'Dialogue 1 — Le quotidien',              page:36 },
  36: { type:'dialogue', label:'Dialogue 2 — Le quotidien',              page:36 },
  37: { type:'texte',    label:'Fais comme moi ! — Texte audio',         page:37 },
  38: { type:'activite', label:'Activité de compréhension 1',            page:39 },
  39: { type:'activite', label:'Activité de compréhension 2',            page:39 },
  40: { type:'activite', label:'Activité de compréhension 3',            page:39 },
  41: { type:'chanson',  label:'Chanson — Méli-mélodie',                 page:39 },
  42: { type:'activite', label:'Exercice de renforcement 10',            page:31 },
  43: { type:'activite', label:'Exercice de renforcement 12',            page:31 },
  44: { type:'texte',    label:'La météo — Bulletin audio',              page:44 },
  45: { type:'dialogue', label:'Dialogue — Les métiers',                 page:44 },
  46: { type:'texte',    label:'Les beaux métiers — Texte audio',        page:45 },
  47: { type:'activite', label:'Activité de compréhension 1',            page:47 },
  48: { type:'activite', label:'Activité de compréhension 2',            page:47 },
  49: { type:'chanson',  label:'Chanson — Méli-mélodie',                 page:47 },
  50: { type:'activite', label:'Exercice de renforcement 9',             page:39 },
  51: { type:'activite', label:'Exercice de renforcement 12',            page:39 },
  52: { type:'activite', label:'Exercice de renforcement 3',             page:43 },
  53: { type:'dialogue', label:'Dialogue 1 — Au téléphone',              page:52 },
  54: { type:'dialogue', label:'Dialogue 2 — Au téléphone',              page:52 },
  55: { type:'texte',    label:'C\'est un faux numéro ! — Texte audio',  page:53 },
  56: { type:'activite', label:'Activité de compréhension 1',            page:55 },
  57: { type:'chanson',  label:'Chanson — Méli-mélodie',                 page:55 },
  58: { type:'activite', label:'Exercice de renforcement 11',            page:47 },
  59: { type:'activite', label:'Exercice de renforcement 13',            page:47 },
  60: { type:'delf',     label:'DELF Prim — Étape finale',               page:48 },
  61: { type:'test',     label:'Évaluation orale — Module 1' },
  62: { type:'test',     label:'Évaluation orale — Module 2' },
  63: { type:'test',     label:'Évaluation orale — Module 3' },
  64: { type:'test',     label:'Évaluation orale — Module 4' },
  65: { type:'test',     label:'Évaluation orale — Module 5' },
  66: { type:'test',     label:'Évaluation orale — Module 6' },
  67: { type:'delf',     label:'DELF Prim — Épreuve 1' },
  68: { type:'delf',     label:'DELF Prim — Épreuve 2' },
  69: { type:'delf',     label:'DELF Prim — Épreuve 3' },
};

const TYPE_ICON = { dialogue:'💬', texte:'📄', activite:'✏️', chanson:'🎵', delf:'🏅', test:'📝' };

// ════════════════════════════════════════════════════════════════════
// PAGE BUILDERS
// ════════════════════════════════════════════════════════════════════

function buildModulePages(moduleNum, theme, tracks, audioUrls, extra = {}) {
  const dialogues = tracks.filter(n => TRACK_INFO[n]?.type === 'dialogue');
  const textes    = tracks.filter(n => TRACK_INFO[n]?.type === 'texte');
  const activites = tracks.filter(n => TRACK_INFO[n]?.type === 'activite');
  const chansons  = tracks.filter(n => TRACK_INFO[n]?.type === 'chanson');
  const delfs     = tracks.filter(n => TRACK_INFO[n]?.type === 'delf');

  const pages = [];

  // ── Page 1 : Introduction ──────────────────────────────────────
  pages.push({
    id: 1,
    title: `Présentation — Module ${moduleNum}`,
    content: `<div class="lesson-intro">
  <div class="lesson-badge">🎧 Compréhension orale — A1.2</div>
  <h2>${theme.title}</h2>
  <p class="lead">${theme.intro}</p>
  <div class="lesson-objectives">
    <h4>🎯 Objectifs du module</h4>
    <ul>
      ${theme.objectives.map(o => `<li>${o}</li>`).join('\n      ')}
    </ul>
  </div>
  <div class="lesson-highlight">
    🔊 <strong>${tracks.length} piste${tracks.length > 1 ? 's' : ''} audio</strong> :
    ${[
      dialogues.length ? `${dialogues.length} dialogue${dialogues.length>1?'s':''}` : '',
      textes.length    ? `${textes.length} texte${textes.length>1?'s':''}` : '',
      activites.length ? `${activites.length} activité${activites.length>1?'s':''}` : '',
      chansons.length  ? '1 chanson' : '',
      delfs.length     ? `${delfs.length} exercice${delfs.length>1?'s':''} DELF` : '',
    ].filter(Boolean).join(' · ')}
  </div>
</div>`
  });

  // ── Page 2 : Dialogues ────────────────────────────────────────
  if (dialogues.length) {
    let content = `<h3>💬 Écoute active — Dialogues</h3>
<p>Écoute attentivement chaque dialogue. Repère <strong>qui parle</strong>, <strong>où</strong> et <strong>de quoi</strong>.</p>`;
    for (const n of dialogues) {
      const info = TRACK_INFO[n];
      content += audioPlayer(audioUrls[n], `Piste ${n} — ${info.label}`);
      content += `<div class="rule-box"><div class="rule-icon">💬</div><div>
  <strong>Stratégie d'écoute :</strong>
  <ul>
    <li><strong>1ère écoute</strong> → sens général (qui ? quoi ? où ?)</li>
    <li><strong>2ème écoute</strong> → détails et expressions clés</li>
  </ul>
</div></div>`;
    }
    content += `<div class="info-box">💡 <strong>À retenir :</strong> ${theme.dialogueTip}</div>`;
    pages.push({ id: 2, title: 'Dialogues — Écoute et comprends', content });
  }

  // ── Page 3 : Textes audio ─────────────────────────────────────
  if (textes.length) {
    let content = `<h3>📄 Textes audio — Lecture et écoute</h3>
<p>Lis le texte silencieusement, puis écoute-le pour travailler ta <strong>prononciation</strong> et ta <strong>compréhension</strong>.</p>`;
    for (const n of textes) {
      const info = TRACK_INFO[n];
      content += audioPlayer(audioUrls[n], `Piste ${n} — ${info.label}`);
      content += `<div class="rule-box"><div class="rule-icon">📖</div><div>
  <strong>Méthode :</strong> Lis d'abord le texte, puis écoute pour vérifier ta compréhension.
</div></div>`;
    }
    content += `<div class="info-box">💡 ${theme.texteTip}</div>`;
    pages.push({ id: 3, title: 'Textes audio — Compréhension', content });
  }

  // ── Page 4 : Vocabulaire clé ──────────────────────────────────
  pages.push({
    id: 4,
    title: 'Vocabulaire clé',
    content: `<h3>🗝️ Vocabulaire essentiel — ${theme.vocabTitle}</h3>
${theme.vocabContent}`
  });

  // ── Page 5 : Activités d'écoute ───────────────────────────────
  if (activites.length) {
    let content = `<h3>✏️ Activités d'écoute guidées</h3>
<p>Écoute chaque piste et complète l'activité correspondante.</p>`;
    for (const n of activites) {
      const info = TRACK_INFO[n];
      content += audioPlayer(audioUrls[n], `Piste ${n} — ${info.label}`);
      content += `<div class="info-box">✏️ Réponds aux questions après l'écoute.</div>`;
    }
    pages.push({ id: 5, title: 'Activités d\'écoute guidées', content });
  }

  // ── Page 6 : Chanson ──────────────────────────────────────────
  if (chansons.length) {
    const n = chansons[0];
    pages.push({
      id: 6,
      title: 'Chanson — Méli-mélodie 🎵',
      content: `<h3>🎵 Chanson du module</h3>
<p>La musique est un excellent outil pour <strong>mémoriser le vocabulaire</strong> et améliorer ta prononciation.</p>
${audioPlayer(audioUrls[n], `Piste ${n} — Chanson du module`)}
<div class="rule-box"><div class="rule-icon">🎤</div><div>
  <strong>Écoute en 3 étapes :</strong>
  <ul>
    <li>🎧 <strong>Étape 1</strong> — Écoute et observe le rythme</li>
    <li>📖 <strong>Étape 2</strong> — Lis les paroles en écoutant</li>
    <li>🎤 <strong>Étape 3</strong> — Chante avec l'enregistrement</li>
  </ul>
</div></div>
<div class="info-box">💡 Les chansons facilitent la <strong>mémorisation à long terme</strong> du vocabulaire et des structures grammaticales.</div>`
    });
  }

  // ── Page 7 : DELF (si présent) ────────────────────────────────
  if (delfs.length) {
    let content = `<h3>🏅 Préparation DELF Prim — Compréhension orale</h3>
<p>Ces exercices reproduisent les conditions réelles de l'épreuve officielle <strong>DELF Prim</strong>.</p>
<div class="compare-box">
  <div class="compare-item good">✅ Écoute une seule fois comme à l'examen</div>
  <div class="compare-item special">⚠️ Lis les questions AVANT d'écouter</div>
</div>`;
    for (const n of delfs) {
      content += audioPlayer(audioUrls[n], `Piste ${n} — ${TRACK_INFO[n].label}`);
      content += `<div class="rule-box"><div class="rule-icon">🏅</div><div>
  <strong>Consigne officielle :</strong> Écoute l'enregistrement. Réponds aux questions sur ta feuille.
</div></div>`;
    }
    pages.push({ id: 7, title: 'Préparation DELF Prim', content });
  }

  // ── Page finale : Récapitulatif ───────────────────────────────
  pages.push({
    id: pages.length + 1,
    title: 'Récapitulatif du module',
    content: `<h3>📊 Bilan — Module ${moduleNum} : ${theme.shortTitle}</h3>
<div class="summary-table">
  <div class="summary-row header"><div>Piste</div><div>Type</div><div>Contenu</div></div>
  ${tracks.map(n => {
    const info = TRACK_INFO[n];
    return `<div class="summary-row"><div><span class="prep">${n}</span></div><div>${TYPE_ICON[info?.type] || '🔊'} ${info?.type || ''}</div><div>${info?.label || ''}</div></div>`;
  }).join('\n  ')}
</div>
<div class="summary-table" style="margin-top:1.2rem">
  <div class="summary-row header"><div>Compétence</div><div>Acquise dans ce module</div></div>
  ${theme.skills.map(s => `<div class="summary-row"><div>✅</div><div>${s}</div></div>`).join('\n  ')}
</div>
<div class="lesson-highlight" style="margin-top:1.5rem">🎓 Module terminé ! Passe aux <strong>Exercices</strong> pour valider tes acquis.</div>`
  });

  return pages;
}

// ════════════════════════════════════════════════════════════════════
// THEMES PAR MODULE
// ════════════════════════════════════════════════════════════════════

const THEMES = {
  module1: {
    title: 'Module 1 — La rentrée scolaire',
    shortTitle: 'La rentrée',
    intro: 'Découvrez les dialogues et textes audio sur la rentrée scolaire en France. Vous allez écouter des conversations entre élèves, un mail et un récit audio pour développer votre compréhension orale.',
    objectives: [
      'Comprendre des dialogues sur la vie scolaire',
      'Identifier les personnages et leurs activités',
      'Reconnaître le vocabulaire de l\'école et des fournitures',
      'Répondre à des questions de compréhension orale',
    ],
    dialogueTip: 'À la rentrée, les élèves parlent de leurs vacances, de leurs classes et de leurs camarades. Repérez les expressions de salutation et de description.',
    texteTip: 'Le mail et le récit audio utilisent le passé composé pour raconter des événements passés. Observez les conjugaisons.',
    vocabTitle: 'L\'école',
    vocabContent: `<div class="rule-box"><div class="rule-icon">🏫</div><div>
  <strong>Les matières scolaires</strong>
  <ul>
    <li><strong>le français</strong><span class="inline-trans">= French</span></li>
    <li><strong>les mathématiques</strong><span class="inline-trans">= mathematics</span></li>
    <li><strong>l'histoire-géographie</strong><span class="inline-trans">= history and geography</span></li>
    <li><strong>les sciences</strong><span class="inline-trans">= sciences</span></li>
    <li><strong>l'éducation physique (EPS)</strong><span class="inline-trans">= PE / sports</span></li>
    <li><strong>les arts plastiques</strong><span class="inline-trans">= art</span></li>
  </ul>
</div></div>
<div class="rule-box"><div class="rule-icon">🎒</div><div>
  <strong>Les fournitures scolaires</strong>
  <ul>
    <li><strong>un cahier</strong><span class="inline-trans">= an exercise book</span></li>
    <li><strong>un stylo / un crayon</strong><span class="inline-trans">= a pen / a pencil</span></li>
    <li><strong>une règle</strong><span class="inline-trans">= a ruler</span></li>
    <li><strong>un cartable / un sac</strong><span class="inline-trans">= a school bag</span></li>
    <li><strong>une gomme</strong><span class="inline-trans">= an eraser</span></li>
  </ul>
</div></div>
<div class="rule-box"><div class="rule-icon">⏰</div><div>
  <strong>La journée scolaire</strong>
  <ul>
    <li><strong>la récréation</strong><span class="inline-trans">= break time</span></li>
    <li><strong>la cantine</strong><span class="inline-trans">= the school canteen</span></li>
    <li><strong>un cours / une leçon</strong><span class="inline-trans">= a lesson</span></li>
    <li><strong>les devoirs</strong><span class="inline-trans">= homework</span></li>
  </ul>
</div></div>`,
    skills: [
      'Comprendre un dialogue sur la rentrée scolaire',
      'Identifier les matières et les fournitures',
      'Reconnaître le passé composé à l\'oral',
      'Comprendre un mail simple en français',
    ],
  },

  module2: {
    title: 'Module 2 — En ville',
    shortTitle: 'En ville',
    intro: 'Apprenez à vous repérer et à vous déplacer en ville grâce à des dialogues et des textes audio authentiques. Comprendre des indications, identifier des lieux et des modes de transport.',
    objectives: [
      'Comprendre des dialogues sur les déplacements en ville',
      'Identifier les lieux et les transports dans un contexte oral',
      'Reconnaître les prépositions de lieu à l\'écoute',
      'Comprendre des indications de direction simples',
    ],
    dialogueTip: 'Repérez les mots-clés de direction : "à gauche", "à droite", "tout droit", "en face de", "près de".',
    texteTip: 'Le texte décrit des déplacements. Observez les verbes de mouvement : aller, venir, prendre, passer.',
    vocabTitle: 'La ville et les transports',
    vocabContent: `<div class="rule-box"><div class="rule-icon">🏙️</div><div>
  <strong>Les lieux en ville</strong>
  <ul>
    <li><strong>la mairie</strong><span class="inline-trans">= the town hall</span></li>
    <li><strong>la boulangerie</strong><span class="inline-trans">= the bakery</span></li>
    <li><strong>la pharmacie</strong><span class="inline-trans">= the pharmacy</span></li>
    <li><strong>la bibliothèque</strong><span class="inline-trans">= the library</span></li>
    <li><strong>le supermarché</strong><span class="inline-trans">= the supermarket</span></li>
    <li><strong>le cinéma</strong><span class="inline-trans">= the cinema</span></li>
    <li><strong>la poste</strong><span class="inline-trans">= the post office</span></li>
  </ul>
</div></div>
<div class="rule-box"><div class="rule-icon">🚌</div><div>
  <strong>Les transports</strong>
  <ul>
    <li><strong>le bus / le car</strong><span class="inline-trans">= the bus / the coach</span></li>
    <li><strong>le métro</strong><span class="inline-trans">= the underground / metro</span></li>
    <li><strong>le vélo</strong><span class="inline-trans">= the bicycle</span></li>
    <li><strong>à pied</strong><span class="inline-trans">= on foot</span></li>
    <li><strong>la voiture</strong><span class="inline-trans">= the car</span></li>
  </ul>
</div></div>
<div class="rule-box"><div class="rule-icon">🗺️</div><div>
  <strong>S'orienter</strong>
  <ul>
    <li><strong>à gauche</strong><span class="inline-trans">= to the left</span></li>
    <li><strong>à droite</strong><span class="inline-trans">= to the right</span></li>
    <li><strong>tout droit</strong><span class="inline-trans">= straight ahead</span></li>
    <li><strong>en face de</strong><span class="inline-trans">= opposite</span></li>
    <li><strong>près de / loin de</strong><span class="inline-trans">= near / far from</span></li>
  </ul>
</div></div>`,
    skills: [
      'Comprendre des dialogues sur les déplacements',
      'Identifier des lieux et des transports à l\'oral',
      'Suivre des indications de direction simples',
      'Reconnaître les prépositions de lieu',
    ],
  },

  module3: {
    title: 'Module 3 — Les loisirs',
    shortTitle: 'Les loisirs',
    intro: 'Explorez le vocabulaire des loisirs et des activités de temps libre à travers des dialogues et textes audio dynamiques. Exprimez vos préférences et comprenez celles des autres.',
    objectives: [
      'Comprendre des dialogues sur les activités de loisirs',
      'Identifier les expressions de préférence à l\'oral',
      'Reconnaître les expressions de fréquence',
      'Se préparer aux épreuves orales DELF Prim',
    ],
    dialogueTip: 'Repérez les verbes d\'opinion : "j\'aime", "j\'adore", "je préfère", "je déteste" et les activités associées.',
    texteTip: 'Le texte parle d\'activités pour s\'amuser. Notez les structures "on va + infinitif" pour proposer des activités.',
    vocabTitle: 'Les activités de loisirs',
    vocabContent: `<div class="rule-box"><div class="rule-icon">⚽</div><div>
  <strong>Les sports</strong>
  <ul>
    <li><strong>jouer au football / au basket</strong><span class="inline-trans">= to play football / basketball</span></li>
    <li><strong>faire de la natation</strong><span class="inline-trans">= to go swimming</span></li>
    <li><strong>faire du vélo</strong><span class="inline-trans">= to go cycling</span></li>
    <li><strong>faire de la danse</strong><span class="inline-trans">= to do dancing</span></li>
    <li><strong>faire du judo / de la gym</strong><span class="inline-trans">= to do judo / gymnastics</span></li>
  </ul>
</div></div>
<div class="rule-box"><div class="rule-icon">🎮</div><div>
  <strong>Les loisirs créatifs et culturels</strong>
  <ul>
    <li><strong>lire un livre</strong><span class="inline-trans">= to read a book</span></li>
    <li><strong>regarder un film</strong><span class="inline-trans">= to watch a film</span></li>
    <li><strong>écouter de la musique</strong><span class="inline-trans">= to listen to music</span></li>
    <li><strong>jouer d'un instrument</strong><span class="inline-trans">= to play an instrument</span></li>
    <li><strong>jouer à des jeux vidéo</strong><span class="inline-trans">= to play video games</span></li>
    <li><strong>dessiner / peindre</strong><span class="inline-trans">= to draw / to paint</span></li>
  </ul>
</div></div>
<div class="rule-box"><div class="rule-icon">📅</div><div>
  <strong>La fréquence</strong>
  <ul>
    <li><strong>tous les jours</strong><span class="inline-trans">= every day</span></li>
    <li><strong>souvent / parfois / rarement</strong><span class="inline-trans">= often / sometimes / rarely</span></li>
    <li><strong>le week-end</strong><span class="inline-trans">= at the weekend</span></li>
    <li><strong>une fois par semaine</strong><span class="inline-trans">= once a week</span></li>
  </ul>
</div></div>`,
    skills: [
      'Comprendre des dialogues sur les préférences et loisirs',
      'Identifier les expressions de fréquence',
      'Reconnaître les verbes d\'opinion à l\'oral',
      'S\'entraîner aux exercices DELF Prim',
    ],
  },

  module4: {
    title: 'Module 4 — La vie quotidienne',
    shortTitle: 'La vie quotidienne',
    intro: 'Décrivez et comprenez les habitudes et la routine quotidienne en français. Dialogues sur les activités du matin, de la journée et du soir, avec les verbes pronominaux en contexte.',
    objectives: [
      'Comprendre des dialogues sur la routine quotidienne',
      'Identifier les verbes pronominaux à l\'oral',
      'Reconnaître les expressions de temps et d\'heure',
      'Comprendre des instructions et des habitudes décrites à l\'oral',
    ],
    dialogueTip: 'Repérez les verbes pronominaux : "se lever", "se laver", "s\'habiller", "se coucher". Observez à quelle heure les personnages font leurs activités.',
    texteTip: 'Le texte décrit comment imiter des gestes du quotidien. Notez les verbes d\'action à l\'impératif.',
    vocabTitle: 'La routine quotidienne',
    vocabContent: `<div class="rule-box"><div class="rule-icon">🌅</div><div>
  <strong>Le matin</strong>
  <ul>
    <li><strong>se réveiller / se lever</strong><span class="inline-trans">= to wake up / to get up</span></li>
    <li><strong>se laver / se doucher</strong><span class="inline-trans">= to wash / to shower</span></li>
    <li><strong>s'habiller</strong><span class="inline-trans">= to get dressed</span></li>
    <li><strong>prendre le petit-déjeuner</strong><span class="inline-trans">= to have breakfast</span></li>
    <li><strong>se brosser les dents</strong><span class="inline-trans">= to brush one's teeth</span></li>
  </ul>
</div></div>
<div class="rule-box"><div class="rule-icon">🌙</div><div>
  <strong>Le soir</strong>
  <ul>
    <li><strong>rentrer à la maison</strong><span class="inline-trans">= to come home</span></li>
    <li><strong>faire ses devoirs</strong><span class="inline-trans">= to do homework</span></li>
    <li><strong>dîner</strong><span class="inline-trans">= to have dinner</span></li>
    <li><strong>se coucher / s'endormir</strong><span class="inline-trans">= to go to bed / to fall asleep</span></li>
  </ul>
</div></div>
<div class="rule-box"><div class="rule-icon">⏰</div><div>
  <strong>Exprimer l'heure</strong>
  <ul>
    <li><strong>Il est huit heures</strong><span class="inline-trans">= It is eight o'clock</span></li>
    <li><strong>à midi / à minuit</strong><span class="inline-trans">= at noon / at midnight</span></li>
    <li><strong>le matin / l'après-midi / le soir</strong><span class="inline-trans">= in the morning / afternoon / evening</span></li>
  </ul>
</div></div>`,
    skills: [
      'Comprendre des dialogues sur la routine',
      'Identifier les verbes pronominaux à l\'oral',
      'Reconnaître les expressions de temps et d\'heure',
      'Comprendre des instructions simples',
    ],
  },

  module5: {
    title: 'Module 5 — La météo et les métiers',
    shortTitle: 'Météo & métiers',
    intro: 'Comprenez les bulletins météo et découvrez le vocabulaire des professions en français. Des dialogues authentiques sur les conditions climatiques et les ambitions professionnelles.',
    objectives: [
      'Comprendre un bulletin météo oral simple',
      'Identifier les professions et les décrire à l\'oral',
      'Reconnaître les expressions météorologiques',
      'Comprendre des dialogues sur les projets et ambitions',
    ],
    dialogueTip: 'Dans les dialogues sur les métiers, repérez "je veux être", "je voudrais devenir", "je rêve de". Pour la météo, notez "il fait", "il y a", "il pleut".',
    texteTip: 'Le texte "Les beaux métiers" présente différentes professions. Notez le genre (masculin/féminin) des noms de métiers.',
    vocabTitle: 'La météo et les professions',
    vocabContent: `<div class="rule-box"><div class="rule-icon">☀️</div><div>
  <strong>La météo</strong>
  <ul>
    <li><strong>Il fait beau / chaud / froid</strong><span class="inline-trans">= The weather is nice / hot / cold</span></li>
    <li><strong>Il pleut / Il neige</strong><span class="inline-trans">= It's raining / It's snowing</span></li>
    <li><strong>Il y a du vent / du soleil / des nuages</strong><span class="inline-trans">= It's windy / sunny / cloudy</span></li>
    <li><strong>la température</strong><span class="inline-trans">= the temperature</span></li>
    <li><strong>les prévisions</strong><span class="inline-trans">= the forecast</span></li>
  </ul>
</div></div>
<div class="rule-box"><div class="rule-icon">👷</div><div>
  <strong>Les métiers</strong>
  <ul>
    <li><strong>médecin / infirmier(ère)</strong><span class="inline-trans">= doctor / nurse</span></li>
    <li><strong>professeur(e)</strong><span class="inline-trans">= teacher</span></li>
    <li><strong>ingénieur(e)</strong><span class="inline-trans">= engineer</span></li>
    <li><strong>cuisinier(ère) / chef</strong><span class="inline-trans">= cook / chef</span></li>
    <li><strong>acteur / actrice</strong><span class="inline-trans">= actor / actress</span></li>
    <li><strong>footballeur(euse)</strong><span class="inline-trans">= footballer</span></li>
    <li><strong>pompier</strong><span class="inline-trans">= firefighter</span></li>
  </ul>
</div></div>`,
    skills: [
      'Comprendre un bulletin météo oral',
      'Identifier et nommer des professions',
      'Reconnaître les expressions météorologiques',
      'Comprendre des dialogues sur les ambitions',
    ],
  },

  module6: {
    title: 'Module 6 — Conversations téléphoniques',
    shortTitle: 'Au téléphone',
    intro: 'Maîtrisez les codes de la communication téléphonique en français. Dialogues authentiques, situations réelles et préparation finale au DELF Prim pour valider votre niveau A1.2.',
    objectives: [
      'Comprendre et simuler des conversations téléphoniques simples',
      'Identifier les formules de politesse téléphoniques',
      'Reconnaître les malentendus et corrections à l\'oral',
      'Réussir l\'épreuve finale de compréhension orale DELF Prim',
    ],
    dialogueTip: 'Repérez les formules typiques : "Allô ?", "C\'est de la part de qui ?", "Ne quittez pas", "Vous avez fait un faux numéro".',
    texteTip: 'La situation "C\'est un faux numéro" illustre un malentendu téléphonique. Observez comment les personnages corrigent l\'erreur.',
    vocabTitle: 'Le téléphone et la communication',
    vocabContent: `<div class="rule-box"><div class="rule-icon">📱</div><div>
  <strong>Expressions téléphoniques</strong>
  <ul>
    <li><strong>Allô ?</strong><span class="inline-trans">= Hello? (on the phone)</span></li>
    <li><strong>C'est de la part de qui ?</strong><span class="inline-trans">= Who is calling?</span></li>
    <li><strong>Ne quittez pas.</strong><span class="inline-trans">= Hold on / Please hold.</span></li>
    <li><strong>Je rappelle plus tard.</strong><span class="inline-trans">= I'll call back later.</span></li>
    <li><strong>Vous avez fait un faux numéro.</strong><span class="inline-trans">= You have the wrong number.</span></li>
    <li><strong>Je peux laisser un message ?</strong><span class="inline-trans">= Can I leave a message?</span></li>
  </ul>
</div></div>
<div class="rule-box"><div class="rule-icon">🔢</div><div>
  <strong>Les numéros de téléphone</strong>
  <ul>
    <li>En France, les numéros ont <strong>10 chiffres</strong> par groupes de 2.<span class="inline-trans">= In France, phone numbers have 10 digits in pairs.</span></li>
    <li><strong>Exemple :</strong> 06 12 34 56 78<span class="inline-trans">= zéro six, douze, trente-quatre, cinquante-six, soixante-dix-huit</span></li>
  </ul>
</div></div>`,
    skills: [
      'Comprendre une conversation téléphonique simple',
      'Identifier les formules de politesse téléphoniques',
      'Reconnaître un malentendu et sa correction',
      'Réussir l\'épreuve DELF Prim de compréhension orale',
    ],
  },
};

// ════════════════════════════════════════════════════════════════════
// EXERCICES QCM PAR MODULE
// ════════════════════════════════════════════════════════════════════

const EXERCISES = {
  module1: [
    { id:'q1', question:"Qu'est-ce qu'un 'cahier' en anglais ?", options:['A ruler','A pen','An exercise book','A bag'], answer:2 },
    { id:'q2', question:"Quelle matière signifie 'Physical Education' en français ?", options:['Les sciences','L\'EPS','L\'histoire','Les arts plastiques'], answer:1 },
    { id:'q3', question:"Maé envoie... à son ami.", options:['une lettre','un message vocal','un mail','une carte postale'], answer:2 },
    { id:'q4', question:"'La cantine' est...", options:['La salle de classe','La bibliothèque','Le restaurant de l\'école','Le couloir'], answer:2 },
    { id:'q5', question:"Comment dit-on 'homework' en français ?", options:['Les cours','Les devoirs','Les cahiers','Les leçons'], answer:1 },
    { id:'q6', question:"'La récréation' correspond à...", options:['Un cours de sport','La pause entre les cours','Le déjeuner','La sortie de l\'école'], answer:1 },
    { id:'q7', question:"Quel verbe utilise-t-on pour parler de vacances passées ?", options:['Le présent','Le futur','Le passé composé','L\'imparfait'], answer:2 },
    { id:'q8', question:"Comment dit-on 'pencil' en français ?", options:['Un stylo','Une gomme','Un crayon','Une règle'], answer:2 },
  ],

  module2: [
    { id:'q1', question:"'Tout droit' signifie...", options:['Turn left','Go straight ahead','Turn right','Stop'], answer:1 },
    { id:'q2', question:"Où achète-t-on du pain en France ?", options:['À la pharmacie','À la mairie','À la boulangerie','Au cinéma'], answer:2 },
    { id:'q3', question:"Comment dit-on 'on foot' en français ?", options:['En voiture','En vélo','À pied','En bus'], answer:2 },
    { id:'q4', question:"'En face de' signifie...", options:['Near','Far from','Opposite','Behind'], answer:2 },
    { id:'q5', question:"Où emprunte-t-on des livres gratuitement ?", options:['À la librairie','À la bibliothèque','À la poste','Au supermarché'], answer:1 },
    { id:'q6', question:"Comment dit-on 'underground / metro' en français ?", options:['Le bus','Le tramway','Le métro','Le train'], answer:2 },
    { id:'q7', question:"'À gauche' signifie...", options:['To the right','Straight ahead','To the left','Behind'], answer:2 },
    { id:'q8', question:"'Près de' est le contraire de...", options:['En face de','Derrière','Loin de','Devant'], answer:2 },
  ],

  module3: [
    { id:'q1', question:"'Jouer au football' utilise quelle préposition ?", options:['de','du','au','à la'], answer:2 },
    { id:'q2', question:"Comment dit-on 'to go swimming' en français ?", options:['Faire du vélo','Faire de la natation','Jouer au basket','Faire de la danse'], answer:1 },
    { id:'q3', question:"'Souvent' signifie...", options:['Never','Rarely','Sometimes','Often'], answer:3 },
    { id:'q4', question:"Pour proposer une activité, on dit...", options:['Tu veux ?','On va + infinitif','Je préfère','J\'adore'], answer:1 },
    { id:'q5', question:"'Une fois par semaine' signifie...", options:['Every day','Once a month','Once a week','Twice a week'], answer:2 },
    { id:'q6', question:"Quel verbe exprime une préférence forte ?", options:['Aimer','Détester','Adorer','Préférer'], answer:2 },
    { id:'q7', question:"Comment dit-on 'to draw' en français ?", options:['Peindre','Dessiner','Lire','Écouter'], answer:1 },
    { id:'q8', question:"'Je déteste' exprime...", options:['Une préférence','Un amour fort','Un dégoût','Une indifférence'], answer:2 },
  ],

  module4: [
    { id:'q1', question:"'Se lever' est un verbe...", options:['D\'action ordinaire','Pronominal','Irrégulier seulement','D\'état'], answer:1 },
    { id:'q2', question:"Que fait-on 'avant de s\'habiller' normalement ?", options:['Dîner','Se laver','Faire ses devoirs','Rentrer'], answer:1 },
    { id:'q3', question:"'Il est midi' signifie...", options:['12h00','00h00','12h30','11h00'], answer:0 },
    { id:'q4', question:"Comment dit-on 'to have breakfast' en français ?", options:['Dîner','Déjeuner','Prendre le petit-déjeuner','Goûter'], answer:2 },
    { id:'q5', question:"'Le soir' correspond à quelle période ?", options:['La nuit','Le matin','L\'après-midi','La soirée et la nuit tombante'], answer:3 },
    { id:'q6', question:"Comment dit-on 'to fall asleep' en français ?", options:['Se coucher','S\'endormir','Se réveiller','Se reposer'], answer:1 },
    { id:'q7', question:"'Faire ses devoirs' signifie...", options:['To play games','To do sports','To do homework','To watch TV'], answer:2 },
    { id:'q8', question:"Dans 'je me lève', 'me' est...", options:['Un article','Un pronom réfléchi','Un adjectif','Un adverbe'], answer:1 },
  ],

  module5: [
    { id:'q1', question:"'Il pleut' décrit...", options:['Du vent','De la neige','De la pluie','Du soleil'], answer:2 },
    { id:'q2', question:"Comment dit-on 'nurse' en français ?", options:['Médecin','Pompier','Infirmier/infirmière','Professeur'], answer:2 },
    { id:'q3', question:"'Il fait beau' signifie...", options:['It is raining','The weather is nice','It is cold','It is windy'], answer:1 },
    { id:'q4', question:"La forme féminine de 'acteur' est...", options:['Acteure','Acteuse','Actrice','Acteure'], answer:2 },
    { id:'q5', question:"'Les prévisions météo' sont...", options:['Les températures passées','Les photos du ciel','Le bulletin météo futur','Les saisons'], answer:2 },
    { id:'q6', question:"'Je voudrais devenir médecin' exprime...", options:['Un fait présent','Une habitude','Un souhait futur','Un ordre'], answer:2 },
    { id:'q7', question:"Comment dit-on 'it is snowing' en français ?", options:['Il fait froid','Il pleut','Il y a du vent','Il neige'], answer:3 },
    { id:'q8', question:"'Il y a du soleil' signifie...", options:['It is cloudy','It is sunny','It is raining','It is cold'], answer:1 },
  ],

  module6: [
    { id:'q1', question:"'Allô ?' s'utilise...", options:['Pour dire au revoir','Pour commencer une conversation téléphonique','Pour s\'excuser','Pour remercier'], answer:1 },
    { id:'q2', question:"'Vous avez fait un faux numéro' signifie...", options:['You called at the wrong time','You have the wrong number','You forgot to call','You called too many times'], answer:1 },
    { id:'q3', question:"'Ne quittez pas' signifie...", options:['Goodbye','Please leave','Please hold','Call back later'], answer:2 },
    { id:'q4', question:"En France, un numéro de téléphone a combien de chiffres ?", options:['8','9','10','12'], answer:2 },
    { id:'q5', question:"'C'est de la part de qui ?' signifie...", options:['Where are you calling from?','Who is calling?','Why are you calling?','When did you call?'], answer:1 },
    { id:'q6', question:"'Je rappelle plus tard' signifie...", options:['I will call you back later','I called before','I forgot to call','Please call me'], answer:0 },
    { id:'q7', question:"Un 'message vocal' est...", options:['Un texto','Un email','Un message enregistré sur téléphone','Une lettre'], answer:2 },
    { id:'q8', question:"Pour laisser un message, on dit...", options:['Allô ?','Je peux laisser un message ?','Ne quittez pas.','C\'est de la part de qui ?'], answer:1 },
  ],

  evals: [
    { id:'q1', question:"Combien de modules compose ce cours de compréhension orale A1.2 ?", options:['4','5','6','7'], answer:2 },
    { id:'q2', question:"Le DELF Prim évalue quel niveau du CECRL ?", options:['A2','B1','A1','B2'], answer:2 },
    { id:'q3', question:"Dans un examen DELF, on écoute l'enregistrement...", options:['Autant de fois que nécessaire','Une seule fois','Deux fois','Trois fois'], answer:0 },
    { id:'q4', question:"Quel module traite de la communication téléphonique ?", options:['Module 3','Module 4','Module 5','Module 6'], answer:3 },
    { id:'q5', question:"La 'Méli-mélodie' est présente dans...", options:['Chaque module','Seulement le module 1','Les modules pairs','Les modules 1 et 6'], answer:0 },
    { id:'q6', question:"Quel module aborde les verbes pronominaux à l'oral ?", options:['Module 1','Module 2','Module 4','Module 6'], answer:2 },
  ],
};

// ════════════════════════════════════════════════════════════════════
// COURS CONFIG
// ════════════════════════════════════════════════════════════════════

const COURSES_CONFIG = [
  { key:'module1', titre:'Compréhension orale A1.2 — Module 1 : La rentrée scolaire',     duree:45, prix:49 },
  { key:'module2', titre:'Compréhension orale A1.2 — Module 2 : En ville',                duree:45, prix:49 },
  { key:'module3', titre:'Compréhension orale A1.2 — Module 3 : Les loisirs',             duree:45, prix:49 },
  { key:'module4', titre:'Compréhension orale A1.2 — Module 4 : La vie quotidienne',      duree:45, prix:49 },
  { key:'module5', titre:'Compréhension orale A1.2 — Module 5 : La météo et les métiers', duree:45, prix:49 },
  { key:'module6', titre:'Compréhension orale A1.2 — Module 6 : Conversations téléphoniques', duree:45, prix:49 },
  { key:'evals',   titre:'Évaluation orale A1.2 — Tests et DELF Prim',                    duree:30, prix:0  },
];

// ════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════

async function main() {
  console.log('🔧 PocketBase :', PB_URL);
  const pb = new PocketBase(PB_URL);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log('✅ Connecté\n');

  // ── 1. Charger toutes les URLs audio depuis tiptop2_audio ─────────
  console.log('🎵 Chargement des URLs audio...');
  const audioUrls = {};
  try {
    const audioRecords = await pb.collection('tiptop2_audio').getFullList({ $autoCancel: false });
    for (const rec of audioRecords) {
      if (rec.fichier) {
        audioUrls[rec.piste_numero] = `${PB_URL}/api/files/tiptop2_audio/${rec.id}/${rec.fichier}`;
      }
    }
    console.log(`   ✅ ${Object.keys(audioUrls).length} pistes disponibles\n`);
  } catch (e) {
    console.log(`   ⚠️  Collection tiptop2_audio introuvable : ${e.message}`);
    console.log('   → Lancez d\'abord setup-tiptop2.mjs pour uploader les audios.\n');
  }

  // ── 2. Supprimer les anciens cours "Tip Top" ──────────────────────
  console.log('🗑️  Suppression des anciens cours "Tip Top"...');
  try {
    const allCourses = await pb.collection('courses').getFullList({ $autoCancel: false });
    const oldCourses = allCourses.filter(c =>
      (c.titre || '').toLowerCase().includes('tip top') ||
      (c.titre || '').toLowerCase().includes('tiptop')
    );
    for (const c of oldCourses) {
      await pb.collection('courses').delete(c.id, { $autoCancel: false });
      console.log(`   🗑️  Supprimé : "${c.titre}"`);
    }
    if (oldCourses.length === 0) console.log('   ℹ️  Aucun ancien cours Tip Top trouvé.');
  } catch (e) {
    console.log(`   ⚠️  Erreur suppression : ${e.message}`);
  }

  // ── 3. Créer / mettre à jour les 7 cours IWS ─────────────────────
  console.log('\n📚 Création des cours IWS...\n');

  for (const config of COURSES_CONFIG) {
    const tracks = SECTIONS[config.key];
    const theme  = THEMES[config.key];

    let pages;
    if (config.key === 'evals') {
      // Cours évaluations spécial
      const testTracks = tracks.filter(n => n >= 61 && n <= 66);
      const delfTracks = tracks.filter(n => n >= 67);
      let testContent = `<h3>📝 Évaluations de fin de module</h3><p>Écoute chaque piste et réponds aux questions d'évaluation.</p>`;
      testTracks.forEach(n => {
        testContent += audioPlayer(audioUrls[n], `Piste ${n} — ${TRACK_INFO[n].label}`);
        testContent += `<div class="info-box">📝 Écoute et complète l'évaluation du module correspondant.</div>`;
      });
      let delfContent = `<h3>🏅 Examens blancs DELF Prim</h3><p>Conditions réelles d'examen — une seule écoute, pas de pause.</p><div class="compare-box"><div class="compare-item good">✅ Lis les questions AVANT d'écouter</div><div class="compare-item special">⚠️ Une seule écoute comme à l'examen</div></div>`;
      delfTracks.forEach(n => {
        delfContent += audioPlayer(audioUrls[n], `Piste ${n} — ${TRACK_INFO[n].label}`);
        delfContent += `<div class="rule-box"><div class="rule-icon">🏅</div><div><strong>Consigne :</strong> Écoute une seule fois et réponds sur ta feuille.</div></div>`;
      });
      pages = [
        { id:1, title:'Présentation — Évaluations A1.2', content:`<div class="lesson-intro"><div class="lesson-badge">📝 Évaluations & DELF Prim</div><h2>Tests de compréhension orale A1.2</h2><p class="lead">Ce module regroupe les <strong>évaluations de fin de module</strong> (6 tests) et les <strong>entraînements DELF Prim</strong> (3 épreuves) pour valider votre niveau A1.2.</p><div class="lesson-objectives"><h4>🎯 Contenu</h4><ul><li>6 tests oraux — un par module (pistes 61 à 66)</li><li>3 épreuves DELF Prim complètes (pistes 67 à 69)</li></ul></div><div class="lesson-highlight">🏅 Le <strong>DELF Prim</strong> est une certification officielle délivrée par le ministère français de l'Éducation nationale.</div></div>` },
        { id:2, title:'Tests par module', content: testContent },
        { id:3, title:'Épreuves DELF Prim', content: delfContent },
        { id:4, title:'Récapitulatif général A1.2', content:`<h3>📊 Bilan complet — Compréhension orale A1.2</h3><div class="summary-table"><div class="summary-row header"><div>Module</div><div>Thème</div><div>Pistes</div></div><div class="summary-row"><div><span class="prep">1</span></div><div>La rentrée scolaire</div><div>4 → 14</div></div><div class="summary-row"><div><span class="prep">2</span></div><div>En ville</div><div>15 → 23</div></div><div class="summary-row"><div><span class="prep">3</span></div><div>Les loisirs</div><div>24 → 34</div></div><div class="summary-row"><div><span class="prep">4</span></div><div>La vie quotidienne</div><div>35 → 43</div></div><div class="summary-row"><div><span class="prep">5</span></div><div>Météo & métiers</div><div>44 → 52</div></div><div class="summary-row"><div><span class="prep">6</span></div><div>Au téléphone</div><div>53 → 60</div></div><div class="summary-row"><div><span class="prep">Tests</span></div><div>Évaluations & DELF Prim</div><div>61 → 69</div></div></div><div class="lesson-highlight" style="margin-top:1.5rem">🎓 Félicitations ! Vous avez complété le cours de <strong>Compréhension orale A1.2</strong> — IWS Laayoune.</div>` },
      ];
    } else {
      pages = buildModulePages(
        config.key.replace('module',''),
        theme,
        tracks,
        audioUrls
      );
    }

    // Vérifier si le cours existe déjà (par titre IWS)
    let existingId = null;
    try {
      const found = await pb.collection('courses').getFirstListItem(
        `titre="${config.titre}"`, { $autoCancel: false }
      );
      existingId = found.id;
    } catch {}

    const data = {
      titre:         config.titre,
      langue:        'Francais',
      categorie_age: 'Ados (13-17 ans)',
      cours_nom:     'Français',
      niveau:        'A1',
      section:       'langues',
      categorie:     'langue',
      description:   theme ? theme.intro : 'Évaluations et DELF Prim — Compréhension orale A1.2',
      instructeur:   'IWS Laayoune',
      duree:         config.duree,
      prix:          config.prix,
      pages:         JSON.stringify(pages),
      exercises:     JSON.stringify(EXERCISES[config.key] || []),
    };

    let record;
    if (existingId) {
      record = await pb.collection('courses').update(existingId, data, { $autoCancel: false });
      console.log(`  🔄 Mis à jour : "${record.titre}"`);
    } else {
      record = await pb.collection('courses').create(data, { $autoCancel: false });
      console.log(`  ✅ Créé : "${record.titre}"`);
    }

    const audioCount = tracks.filter(n => audioUrls[n]).length;
    console.log(`     📄 ${pages.length} pages · ✏️ ${(EXERCISES[config.key]||[]).length} exercices · 🔊 ${audioCount}/${tracks.length} audios actifs`);
  }

  console.log('\n🎉 Restructuration terminée !');
  console.log('   7 cours IWS créés — sans aucune mention de la méthode source.');
  console.log('   Chaque cours : pages pédagogiques + vocabulaire + exercices QCM + lecteurs audio.');
}

main().catch(err => {
  console.error('\n❌ Erreur :', err.message);
  console.error('   data :', JSON.stringify(err?.data, null, 2));
  process.exit(1);
});
