/**
 * setup-tiptop2.mjs
 *
 * Met en place le cours Tip Top! 2 (A1.2) dans PocketBase :
 *  1. Crée (ou met à jour) la collection "tiptop2_audio" pour héberger les MP3
 *  2. Uploade les fichiers audio disponibles dans audio-tiptop2/
 *  3. Crée les 8 cours (C'est reparti + 6 Unités + Tests) avec pages HTML
 *     intégrant les lecteurs audio à chaque piste concernée.
 *
 * Usage :
 *   node setup-tiptop2.mjs
 *
 * Relancer à chaque nouveau lot d'audios — le script est idempotent.
 */

import PocketBase from 'pocketbase';
import { readFileSync, existsSync, readdirSync } from 'fs';
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
const AUDIO_DIR = join(__dirname, 'audio-tiptop2');

// ════════════════════════════════════════════════════════════════════
// CARTE COMPLÈTE DES 69 PISTES
// ════════════════════════════════════════════════════════════════════
const TRACK_MAP = {
  intro:  [
    { n:1,  type:'copyright', titre:'Copyright'  },
    { n:2,  type:'activite',  titre:'C\'est reparti ! — Activité 1',  page:8  },
    { n:3,  type:'activite',  titre:'C\'est reparti ! — Activité 4',  page:12 },
  ],
  unite1: [
    { n:4,  type:'dialogue',  titre:'Dialogue',                           page:12 },
    { n:5,  type:'texte',     titre:'Le mail de Maé',                    page:12 },
    { n:6,  type:'texte',     titre:'C\'est l\'histoire d\'une heure',   page:13 },
    { n:7,  type:'activite',  titre:'Activité 1',                        page:15 },
    { n:8,  type:'activite',  titre:'Activité 2',                        page:15 },
    { n:9,  type:'activite',  titre:'Activité 3',                        page:15 },
    { n:10, type:'chanson',   titre:'Méli-mélodie',                      page:15 },
    { n:11, type:'activite',  titre:'Cahier — Activité 4',               page:5  },
    { n:12, type:'activite',  titre:'Cahier — Activité 6',               page:5  },
    { n:13, type:'activite',  titre:'Cahier — Activité 10',              page:7  },
    { n:14, type:'activite',  titre:'Cahier — Activité 12',              page:7  },
  ],
  unite2: [
    { n:15, type:'dialogue',  titre:'Dialogue 1',                              page:20 },
    { n:16, type:'dialogue',  titre:'Dialogue 2',                              page:20 },
    { n:17, type:'texte',     titre:'Et où vont-ils ? / Où sont les vélos ?', page:21 },
    { n:18, type:'activite',  titre:'Activité 1',                             page:23 },
    { n:19, type:'activite',  titre:'Activité 2',                             page:23 },
    { n:20, type:'activite',  titre:'Activité 3',                             page:23 },
    { n:21, type:'chanson',   titre:'Méli-mélodie',                           page:23 },
    { n:22, type:'activite',  titre:'Cahier — Activité 8',                    page:14 },
    { n:23, type:'activite',  titre:'Cahier — Activité 12',                   page:15 },
  ],
  unite3: [
    { n:24, type:'dialogue',  titre:'Dialogue 1',            page:28 },
    { n:25, type:'dialogue',  titre:'Dialogue 2',            page:28 },
    { n:26, type:'texte',     titre:'On va s\'amuser !',     page:29 },
    { n:27, type:'activite',  titre:'Activité 1',            page:31 },
    { n:28, type:'activite',  titre:'Activité 2',            page:31 },
    { n:29, type:'chanson',   titre:'Méli-mélodie',          page:31 },
    { n:30, type:'activite',  titre:'Cahier — Activité 7',   page:22 },
    { n:31, type:'activite',  titre:'Cahier — Activité 9',   page:23 },
    { n:32, type:'activite',  titre:'Cahier — Activité 11',  page:23 },
    { n:33, type:'delf',      titre:'DELF Prim — Exercice 1', page:24 },
    { n:34, type:'delf',      titre:'DELF Prim — Exercice 2', page:24 },
  ],
  unite4: [
    { n:35, type:'dialogue',  titre:'Dialogue 1',            page:36 },
    { n:36, type:'dialogue',  titre:'Dialogue 2',            page:36 },
    { n:37, type:'texte',     titre:'Fais comme moi !',      page:37 },
    { n:38, type:'activite',  titre:'Activité 1',            page:39 },
    { n:39, type:'activite',  titre:'Activité 2',            page:39 },
    { n:40, type:'activite',  titre:'Activité 3',            page:39 },
    { n:41, type:'chanson',   titre:'Méli-mélodie',          page:39 },
    { n:42, type:'activite',  titre:'Cahier — Activité 10',  page:31 },
    { n:43, type:'activite',  titre:'Cahier — Activité 12',  page:31 },
  ],
  unite5: [
    { n:44, type:'texte',     titre:'Météo',                 page:44 },
    { n:45, type:'dialogue',  titre:'Dialogue',              page:44 },
    { n:46, type:'texte',     titre:'Les beaux métiers',     page:45 },
    { n:47, type:'activite',  titre:'Activité 1',            page:47 },
    { n:48, type:'activite',  titre:'Activité 2',            page:47 },
    { n:49, type:'chanson',   titre:'Méli-mélodie',          page:47 },
    { n:50, type:'activite',  titre:'Cahier — Activité 9',   page:39 },
    { n:51, type:'activite',  titre:'Cahier — Activité 12',  page:39 },
    { n:52, type:'activite',  titre:'Cahier — Activité 3',   page:43 },
  ],
  unite6: [
    { n:53, type:'dialogue',  titre:'Dialogue 1',             page:52 },
    { n:54, type:'dialogue',  titre:'Dialogue 2',             page:52 },
    { n:55, type:'texte',     titre:'C\'est un faux numéro !', page:53 },
    { n:56, type:'activite',  titre:'Activité 1',             page:55 },
    { n:57, type:'chanson',   titre:'Méli-mélodie',           page:55 },
    { n:58, type:'activite',  titre:'Cahier — Activité 11',   page:47 },
    { n:59, type:'activite',  titre:'Cahier — Activité 13',   page:47 },
    { n:60, type:'delf',      titre:'DELF Prim — Étape 1',    page:48 },
  ],
  tests: [
    { n:61, type:'test',  titre:'Test — Unité 1' },
    { n:62, type:'test',  titre:'Test — Unité 2' },
    { n:63, type:'test',  titre:'Test — Unité 3' },
    { n:64, type:'test',  titre:'Test — Unité 4' },
    { n:65, type:'test',  titre:'Test — Unité 5' },
    { n:66, type:'test',  titre:'Test — Unité 6' },
    { n:67, type:'delf',  titre:'DELF Prim — Exercice 1' },
    { n:68, type:'delf',  titre:'DELF Prim — Exercice 2' },
    { n:69, type:'delf',  titre:'DELF Prim — Exercice 3' },
  ],
};

// ════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════

function audioPlayer(url, label) {
  if (!url) return `<div class="info-box">🔊 <em>Audio bientôt disponible : ${label}</em></div>`;
  return `
<div class="audio-player-box">
  <div class="audio-label">🔊 ${label}</div>
  <audio controls style="width:100%;margin-top:6px;border-radius:8px">
    <source src="${url}" type="audio/mpeg" />
    Votre navigateur ne supporte pas la lecture audio.
  </audio>
</div>`;
}

function typeIcon(type) {
  return { dialogue:'💬', texte:'📄', activite:'✏️', chanson:'🎵', delf:'🏅', test:'📝', copyright:'©' }[type] || '🔊';
}

// ════════════════════════════════════════════════════════════════════
// COURS DEFINITIONS
// ════════════════════════════════════════════════════════════════════

const COURSES_META = [
  {
    key: 'intro',
    titre: 'Tip Top! 2 — C\'est reparti ! (Introduction A1.2)',
    description: 'Révision et mise en route de la méthode Tip Top! 2. Activités d\'écoute pour réactiver le vocabulaire et les structures de l\'A1.',
    niveau: 'A1',
    duree: 20,
    prix: 0,
  },
  {
    key: 'unite1',
    titre: 'Tip Top! 2 — Unité 1 : La rentrée',
    description: 'Premiers échanges à la rentrée : dialogues, textes audio et activités de compréhension orale pour consolider l\'A1.2.',
    niveau: 'A1',
    duree: 45,
    prix: 49,
  },
  {
    key: 'unite2',
    titre: 'Tip Top! 2 — Unité 2 : En ville',
    description: 'Se repérer en ville, décrire des déplacements et comprendre des dialogues sur les lieux et transports.',
    niveau: 'A1',
    duree: 45,
    prix: 49,
  },
  {
    key: 'unite3',
    titre: 'Tip Top! 2 — Unité 3 : Les loisirs',
    description: 'Parler de ses loisirs et activités préférées. Dialogues, textes et préparation au DELF Prim.',
    niveau: 'A1',
    duree: 45,
    prix: 49,
  },
  {
    key: 'unite4',
    titre: 'Tip Top! 2 — Unité 4 : Le quotidien',
    description: 'Décrire sa routine quotidienne, ses habitudes et imiter les gestes du quotidien en français.',
    niveau: 'A1',
    duree: 45,
    prix: 49,
  },
  {
    key: 'unite5',
    titre: 'Tip Top! 2 — Unité 5 : La météo et les métiers',
    description: 'Comprendre les prévisions météo et parler des métiers. Activités orales et chanson Méli-mélodie.',
    niveau: 'A1',
    duree: 45,
    prix: 49,
  },
  {
    key: 'unite6',
    titre: 'Tip Top! 2 — Unité 6 : Au téléphone',
    description: 'Comprendre et simuler des conversations téléphoniques simples. DELF Prim étape finale.',
    niveau: 'A1',
    duree: 45,
    prix: 49,
  },
  {
    key: 'tests',
    titre: 'Tip Top! 2 — Tests et DELF Prim',
    description: 'Évaluations de fin d\'unité et entraînements DELF Prim. Compréhension orale officielle A1.',
    niveau: 'A1',
    duree: 30,
    prix: 0,
  },
];

// ════════════════════════════════════════════════════════════════════
// BUILD PAGES for a section given audio URL map
// ════════════════════════════════════════════════════════════════════

function buildIntroPages(audioUrls) {
  const tracks = TRACK_MAP.intro;
  return [
    {
      id: 1,
      title: 'Bienvenue dans Tip Top! 2',
      content: `<div class="lesson-intro">
  <div class="lesson-badge">🇫🇷 Méthode de français — A1.2</div>
  <h2>C'est reparti !</h2>
  <p class="lead">Bienvenue dans <strong>Tip Top! 2</strong>, la méthode de français pour adolescents. Ce cours couvre le niveau <strong>A1.2</strong> du Cadre Européen Commun de Référence.</p>
  <div class="lesson-objectives">
    <h4>🎯 Cette méthode comprend</h4>
    <ul>
      <li><strong>6 Unités</strong> thématiques avec dialogues et activités</li>
      <li><strong>Méli-mélodie</strong> — une chanson par unité</li>
      <li><strong>Cahier d'activités</strong> — exercices de renforcement</li>
      <li><strong>DELF Prim</strong> — préparation à la certification officielle</li>
    </ul>
  </div>
  <div class="lesson-highlight"><strong>Auteur :</strong> Catherine ADAM · <strong>Éditeur :</strong> Didier · <strong>Niveau :</strong> A1.2</div>
</div>`
    },
    {
      id: 2,
      title: 'C\'est reparti ! — Écoute et réponds',
      content: `<h3>🎧 Activités d'écoute — Révision A1</h3>
<p>Écoute les activités de remise en route et réponds aux questions de ton livre élève.</p>
${audioPlayer(audioUrls[2], 'Activité 1 — Livre élève p. 8')}
<div class="rule-box"><div class="rule-icon">📖</div><div>
  <strong>Consigne :</strong> Écoute et associe chaque personnage à sa description.<br/>
  Reporte tes réponses page <strong>8</strong> du livre élève.
</div></div>
${audioPlayer(audioUrls[3], 'Activité 4 — Livre élève p. 12')}
<div class="rule-box"><div class="rule-icon">📖</div><div>
  <strong>Consigne :</strong> Écoute et complète le tableau.<br/>
  Reporte tes réponses page <strong>12</strong> du livre élève.
</div></div>
<div class="info-box">💡 Ces activités te permettent de <strong>réactiver</strong> ce que tu as appris en Tip Top! 1.</div>`
    }
  ];
}

function buildUnitePages(key, audioUrls) {
  const tracks = TRACK_MAP[key];
  const uniteNum = key.replace('unite','');

  const dialogueTracks  = tracks.filter(t => t.type === 'dialogue');
  const texteTracks     = tracks.filter(t => t.type === 'texte');
  const activiteTracks  = tracks.filter(t => t.type === 'activite' && !t.titre.includes('Cahier'));
  const cahierTracks    = tracks.filter(t => t.type === 'activite' && t.titre.includes('Cahier'));
  const chansonTrack    = tracks.find(t => t.type === 'chanson');
  const delfTracks      = tracks.filter(t => t.type === 'delf');

  const pages = [];

  // Page 1 — Intro Unité
  pages.push({
    id: 1,
    title: `Présentation — Unité ${uniteNum}`,
    content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 Tip Top! 2 — Unité ${uniteNum}</div>
  <h2>Unité ${uniteNum}</h2>
  <div class="lesson-objectives">
    <h4>🎯 Dans cette unité</h4>
    <ul>
      <li>${dialogueTracks.length} dialogue(s) à écouter et comprendre</li>
      ${texteTracks.length ? `<li>${texteTracks.length} texte(s) audio à lire et écouter</li>` : ''}
      <li>${activiteTracks.length} activité(s) de compréhension orale (Livre élève)</li>
      <li>${cahierTracks.length} activité(s) du Cahier d'activités</li>
      ${chansonTrack ? '<li>1 Méli-mélodie 🎵 — chanson de l\'unité</li>' : ''}
      ${delfTracks.length ? `<li>${delfTracks.length} exercice(s) DELF Prim 🏅</li>` : ''}
    </ul>
  </div>
  <div class="lesson-highlight">🔊 Écoute chaque piste, puis consulte ton <strong>Livre élève</strong> pour les activités correspondantes.</div>
</div>`
  });

  // Page 2 — Dialogues
  if (dialogueTracks.length) {
    let content = `<h3>💬 Dialogue${dialogueTracks.length > 1 ? 's' : ''} — Unité ${uniteNum}</h3>
<p>Écoute le${dialogueTracks.length > 1 ? 's' : ''} dialogue${dialogueTracks.length > 1 ? 's' : ''}, puis réponds aux questions de compréhension dans ton livre.</p>`;
    for (const t of dialogueTracks) {
      content += audioPlayer(audioUrls[t.n], `Piste ${t.n} — ${t.titre}${t.page ? ` (p. ${t.page})` : ''}`);
      content += `<div class="rule-box"><div class="rule-icon">💬</div><div><strong>Consigne :</strong> Écoute le dialogue. Qui parle ? De quoi ? Réponds aux questions p. ${t.page} de ton livre.</div></div>`;
    }
    pages.push({ id: 2, title: `Dialogues — Unité ${uniteNum}`, content });
  }

  // Page 3 — Textes audio
  if (texteTracks.length) {
    let content = `<h3>📄 Textes audio — Unité ${uniteNum}</h3>
<p>Lis le texte dans ton livre, puis écoute-le pour travailler ta prononciation et ta compréhension.</p>`;
    for (const t of texteTracks) {
      content += audioPlayer(audioUrls[t.n], `Piste ${t.n} — ${t.titre}${t.page ? ` (p. ${t.page})` : ''}`);
      content += `<div class="rule-box"><div class="rule-icon">📖</div><div><strong>Consigne :</strong> Ouvre ton livre p. ${t.page}. Lis d'abord le texte, puis écoute-le.</div></div>`;
    }
    pages.push({ id: 3, title: `Textes audio — Unité ${uniteNum}`, content });
  }

  // Page 4 — Activités Livre élève
  if (activiteTracks.length) {
    let content = `<h3>✏️ Activités d'écoute — Livre élève</h3>
<p>Écoute chaque piste et complète les activités correspondantes dans ton <strong>Livre élève</strong>.</p>`;
    for (const t of activiteTracks) {
      content += audioPlayer(audioUrls[t.n], `Piste ${t.n} — ${t.titre} (p. ${t.page})`);
      content += `<div class="info-box">📖 Réponses à noter page <strong>${t.page}</strong> du livre élève.</div>`;
    }
    pages.push({ id: 4, title: `Activités — Livre élève`, content });
  }

  // Page 5 — Cahier d'activités
  if (cahierTracks.length) {
    let content = `<h3>✏️ Activités d'écoute — Cahier d'activités</h3>
<p>Écoute chaque piste et complète les exercices correspondants dans ton <strong>Cahier d'activités</strong>.</p>`;
    for (const t of cahierTracks) {
      const pageNum = t.titre.match(/\d+$/)?.[0] || t.page;
      content += audioPlayer(audioUrls[t.n], `Piste ${t.n} — ${t.titre} (Cahier p. ${t.page})`);
      content += `<div class="info-box">📓 Réponses à noter page <strong>${t.page}</strong> du cahier d'activités.</div>`;
    }
    pages.push({ id: 5, title: `Cahier d'activités`, content });
  }

  // Page 6 — Chanson Méli-mélodie
  if (chansonTrack) {
    pages.push({
      id: 6,
      title: `Méli-mélodie 🎵`,
      content: `<h3>🎵 Méli-mélodie — Unité ${uniteNum}</h3>
<p>La chanson de l'unité ! Écoute, chante et mémorise le vocabulaire en musique.</p>
${audioPlayer(audioUrls[chansonTrack.n], `Piste ${chansonTrack.n} — Méli-mélodie`)}
<div class="rule-box"><div class="rule-icon">🎤</div><div>
  <strong>Conseils :</strong>
  <ul>
    <li>1ère écoute → comprendre le sens général</li>
    <li>2ème écoute → repérer les mots connus</li>
    <li>3ème écoute → chanter avec la chanson !</li>
  </ul>
</div></div>
<div class="info-box">💡 Les paroles sont dans ton <strong>Livre élève p. ${chansonTrack.page}</strong>.</div>`
    });
  }

  // Page DELF (si présent)
  if (delfTracks.length) {
    let content = `<h3>🏅 Préparation au DELF Prim</h3>
<p>Ces exercices t'entraînent aux épreuves officielles de compréhension orale du <strong>DELF Prim</strong>.</p>`;
    for (const t of delfTracks) {
      content += audioPlayer(audioUrls[t.n], `Piste ${t.n} — ${t.titre} (Cahier p. ${t.page})`);
      content += `<div class="rule-box"><div class="rule-icon">🏅</div><div><strong>Consigne DELF :</strong> Écoute l'enregistrement et réponds aux questions page <strong>${t.page}</strong> du cahier.</div></div>`;
    }
    pages.push({ id: 7, title: 'DELF Prim — Compréhension orale', content });
  }

  // Dernière page — Récap
  pages.push({
    id: pages.length + 1,
    title: `Récapitulatif — Unité ${uniteNum}`,
    content: `<h3>📊 Récapitulatif de l'Unité ${uniteNum}</h3>
<div class="summary-table">
  <div class="summary-row header"><div>Piste</div><div>Type</div><div>Contenu</div></div>
  ${tracks.filter(t=>t.type!=='copyright').map(t =>
    `<div class="summary-row"><div><span class="prep">${t.n}</span></div><div>${typeIcon(t.type)} ${t.type}</div><div>${t.titre}${t.page ? ` — p. ${t.page}` : ''}</div></div>`
  ).join('')}
</div>
<div class="lesson-highlight" style="margin-top:1.5rem">🎓 Unité ${uniteNum} terminée ! Passe aux <strong>Exercices</strong> pour tester ta compréhension.</div>`
  });

  return pages;
}

function buildTestsPages(audioUrls) {
  const tracks = TRACK_MAP.tests;
  const testTracks = tracks.filter(t => t.type === 'test');
  const delfTracks = tracks.filter(t => t.type === 'delf');

  let testContent = `<h3>📝 Tests de fin d'unité</h3>
<p>Écoute chaque piste et complète le test correspondant dans le <strong>Guide de classe</strong>.</p>`;
  for (const t of testTracks) {
    testContent += audioPlayer(audioUrls[t.n], `Piste ${t.n} — ${t.titre}`);
    testContent += `<div class="info-box">📝 Complète le test de l'unité concernée.</div>`;
  }

  let delfContent = `<h3>🏅 Examens blancs DELF Prim</h3>
<p>Entraîne-toi aux conditions réelles de l'examen. Écoute une seule fois comme à l'examen.</p>`;
  for (const t of delfTracks) {
    delfContent += audioPlayer(audioUrls[t.n], `Piste ${t.n} — ${t.titre}`);
    delfContent += `<div class="rule-box"><div class="rule-icon">🏅</div><div><strong>Règle de l'examen :</strong> Un seul écoutez. Pas de pause. Répondez immédiatement.</div></div>`;
  }

  return [
    {
      id: 1,
      title: 'Tests et évaluations — Présentation',
      content: `<div class="lesson-intro">
  <div class="lesson-badge">📝 Tests & DELF Prim</div>
  <h2>Évaluations Tip Top! 2</h2>
  <p class="lead">Cette section regroupe les <strong>tests de fin d'unité</strong> (6 tests) et les <strong>entraînements DELF Prim</strong> (3 exercices) pour valider ton niveau A1.2.</p>
  <div class="lesson-objectives">
    <h4>🎯 Contenu</h4>
    <ul>
      <li>6 tests — un par unité (pistes 61 à 66)</li>
      <li>3 exercices DELF Prim complets (pistes 67 à 69)</li>
    </ul>
  </div>
</div>`
    },
    { id: 2, title: 'Tests par unité', content: testContent },
    { id: 3, title: 'DELF Prim — Examens blancs', content: delfContent },
    {
      id: 4,
      title: 'Récapitulatif général',
      content: `<h3>📊 Récapitulatif — Toutes les pistes</h3>
<div class="summary-table">
  <div class="summary-row header"><div>Piste</div><div>Unité</div><div>Type</div></div>
  <div class="summary-row"><div><span class="prep">1–3</span></div><div>C'est reparti !</div><div>Introduction</div></div>
  <div class="summary-row"><div><span class="prep">4–14</span></div><div>Unité 1</div><div>Dialogue · Texte · Activités · Chanson</div></div>
  <div class="summary-row"><div><span class="prep">15–23</span></div><div>Unité 2</div><div>Dialogue · Texte · Activités · Chanson</div></div>
  <div class="summary-row"><div><span class="prep">24–34</span></div><div>Unité 3</div><div>Dialogue · Texte · Activités · Chanson · DELF</div></div>
  <div class="summary-row"><div><span class="prep">35–43</span></div><div>Unité 4</div><div>Dialogue · Texte · Activités · Chanson</div></div>
  <div class="summary-row"><div><span class="prep">44–52</span></div><div>Unité 5</div><div>Météo · Dialogue · Texte · Activités · Chanson</div></div>
  <div class="summary-row"><div><span class="prep">53–60</span></div><div>Unité 6</div><div>Dialogue · Texte · Activités · Chanson · DELF</div></div>
  <div class="summary-row"><div><span class="prep">61–69</span></div><div>Tests</div><div>Tests unités · DELF Prim x3</div></div>
</div>
<div class="lesson-highlight" style="margin-top:1.5rem">🎓 Félicitations — tu as complété <strong>Tip Top! 2 (A1.2)</strong> !</div>`
    }
  ];
}

// ════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════

async function main() {
  console.log('🔧 PocketBase :', PB_URL);
  const pb = new PocketBase(PB_URL);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log('✅ Connecté\n');

  // ── 1. Créer/vérifier la collection tiptop2_audio ─────────────────
  let audioCollection;
  try {
    audioCollection = await pb.collections.getOne('tiptop2_audio');
    console.log('ℹ️  Collection "tiptop2_audio" existante.\n');
  } catch {
    console.log('📦 Création de la collection "tiptop2_audio"...');
    audioCollection = await pb.collections.create({
      name: 'tiptop2_audio',
      type: 'base',
      fields: [
        { name: 'piste_numero', type: 'number', required: true },
        { name: 'titre',        type: 'text',   required: true },
        { name: 'section',      type: 'text'    },
        { name: 'type_piste',   type: 'text'    },
        { name: 'fichier',      type: 'file',   options: { maxSelect: 1, mimeTypes: ['audio/mpeg', 'audio/mp3'] } },
      ],
    });
    console.log('✅ Collection créée.\n');
  }

  // ── 2. Upload des fichiers audio disponibles ──────────────────────
  console.log('🎵 Upload des fichiers audio...');
  const audioUrls = {}; // { piste_n: url }

  // Charger les audios déjà uploadés
  const existing = await pb.collection('tiptop2_audio').getFullList({ $autoCancel: false });
  for (const rec of existing) {
    if (rec.fichier) {
      audioUrls[rec.piste_numero] = `${PB_URL}/api/files/tiptop2_audio/${rec.id}/${rec.fichier}`;
      console.log(`  ✓ Piste ${rec.piste_numero} déjà uploadée`);
    }
  }

  // Uploader les nouveaux fichiers
  const audioFiles = existsSync(AUDIO_DIR) ? readdirSync(AUDIO_DIR).filter(f => f.endsWith('.mp3')).sort() : [];

  for (const filename of audioFiles) {
    const match = filename.match(/^(\d+)\s/);
    if (!match) continue;
    const n = parseInt(match[1], 10);
    if (audioUrls[n]) continue; // déjà uploadé

    // Trouver les métadonnées de la piste
    const allTracks = Object.values(TRACK_MAP).flat();
    const trackMeta = allTracks.find(t => t.n === n);
    if (!trackMeta) continue;

    const sectionKey = Object.keys(TRACK_MAP).find(k => TRACK_MAP[k].some(t => t.n === n));

    try {
      const fileBuffer = readFileSync(join(AUDIO_DIR, filename));
      const fileBlob   = new Blob([fileBuffer], { type: 'audio/mpeg' });
      const formData   = new FormData();
      formData.append('piste_numero', String(n));
      formData.append('titre',        trackMeta.titre);
      formData.append('section',      sectionKey || '');
      formData.append('type_piste',   trackMeta.type);
      formData.append('fichier',      fileBlob, filename);

      const rec = await pb.collection('tiptop2_audio').create(formData, { $autoCancel: false });
      audioUrls[n] = `${PB_URL}/api/files/tiptop2_audio/${rec.id}/${rec.fichier}`;
      console.log(`  ✅ Piste ${String(n).padStart(2,' ')} uploadée → ${trackMeta.titre}`);
    } catch (e) {
      console.log(`  ⚠️  Piste ${n} — erreur : ${e.message}`);
    }
  }

  // ── 3. Créer / mettre à jour les 8 cours ─────────────────────────
  console.log('\n📚 Création des cours...\n');

  for (const meta of COURSES_META) {
    let pages;
    if (meta.key === 'intro')  pages = buildIntroPages(audioUrls);
    else if (meta.key === 'tests') pages = buildTestsPages(audioUrls);
    else pages = buildUnitePages(meta.key, audioUrls);

    // Vérifier si le cours existe
    let existingCourse = null;
    try {
      existingCourse = await pb.collection('courses').getFirstListItem(
        `titre="${meta.titre}"`, { $autoCancel: false }
      );
    } catch {}

    const data = {
      titre:         meta.titre,
      langue:        'Francais',
      categorie_age: 'Ados (13-17 ans)',
      cours_nom:     'Français',
      niveau:        meta.niveau,
      section:       'langues',
      categorie:     'langue',
      description:   meta.description,
      instructeur:   'IWS Laayoune',
      duree:         meta.duree,
      prix:          meta.prix,
      pages:         JSON.stringify(pages),
    };

    let record;
    if (existingCourse) {
      record = await pb.collection('courses').update(existingCourse.id, data, { $autoCancel: false });
      console.log(`  🔄 Mis à jour : "${record.titre}" (${pages.length} pages)`);
    } else {
      record = await pb.collection('courses').create(data, { $autoCancel: false });
      console.log(`  ✅ Créé : "${record.titre}" (${pages.length} pages)`);
    }
  }

  // Résumé audio
  const uploaded = Object.keys(audioUrls).length;
  const total = 69;
  console.log(`\n🎵 Audios uploadés : ${uploaded} / ${total}`);
  if (uploaded < total) {
    console.log(`   ⏳ ${total - uploaded} piste(s) en attente du prochain lot.`);
  }

  console.log('\n🎓 Relancez ce script à chaque nouveau lot pour ajouter les audios manquants.');
  console.log('   Les cours se mettront à jour automatiquement avec les nouvelles URLs audio.');
}

main().catch(err => {
  console.error('\n❌ Erreur :', err.message);
  console.error('   data :', JSON.stringify(err?.data, null, 2));
  process.exit(1);
});
