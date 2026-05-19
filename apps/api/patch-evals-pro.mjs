/**
 * patch-evals-pro.mjs  v2 — Interactif & Cohérent
 * ═══════════════════════════════════════════════════════════════
 * Génère des pages HTML pleinement interactives :
 *   ✅ Radio-buttons Vrai/Faux et QCM (cliquables)
 *   ✅ Champs <input type="text"> sous chaque horloge
 *   ✅ Horloge bleue "exemple" dans la consigne
 *   ✅ Formulaires téléphoniques et DELF avec vrais inputs
 *   ✅ Flux logique calé sur l'ordre audio
 *
 * Usage : node patch-evals-pro.mjs
 * ═══════════════════════════════════════════════════════════════
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

const PB_URL   = process.env.PB_URL  || 'http://127.0.0.1:8090';
const PB_EMAIL = process.env.PB_SUPERUSER_EMAIL    || '';
const PB_PASS  = process.env.PB_SUPERUSER_PASSWORD || '';
const COURSE_TITLE = 'Évaluation orale A1.2 — Tests et DELF Prim';

// ════════════════════════════════════════════════════════════════
// HELPERS — éléments interactifs HTML natifs
// ════════════════════════════════════════════════════════════════

/** Lecteur audio */
function audio(url, label) {
  if (!url) return `<div class="info-box">🔊 <em>${label} — audio en cours de chargement.</em></div>`;
  return `<div class="audio-player-box">
  <div class="audio-label">🔊 ${label}</div>
  <audio controls style="width:100%;margin-top:6px;border-radius:8px">
    <source src="${url}" type="audio/mpeg"/>
  </audio>
</div>`;
}

/** Bloc jaune "Avant d'écouter" */
function beforeListen(questions) {
  return `<div style="background:#fff8e1;border-left:4px solid #FF9500;border-radius:8px;padding:14px 18px;margin:12px 0">
  <div style="font-weight:700;color:#b45309;margin-bottom:8px">📋 Avant d'écouter — Lisez les questions</div>
  <ol style="margin:0;padding-left:1.4rem;color:#444">
    ${questions.map(q => `<li style="margin-bottom:4px">${q}</li>`).join('\n    ')}
  </ol>
</div>`;
}

/**
 * Tableau Vrai / Faux — vrais radio-buttons cliquables.
 * @param {string} ns   Namespace unique (ex: "p2vf") pour éviter les conflits de name
 * @param {string[]} items  Propositions
 */
function vraisFaux(ns, items) {
  const rows = items.map((label, i) => `
    <tr>
      <td style="padding:9px 12px;border:1px solid #e2e8f0;font-size:0.9rem">${label}</td>
      <td style="padding:9px 12px;border:1px solid #e2e8f0;text-align:center">
        <input type="radio" name="${ns}_${i}" value="vrai"
          style="width:17px;height:17px;accent-color:#16a34a;cursor:pointer">
      </td>
      <td style="padding:9px 12px;border:1px solid #e2e8f0;text-align:center">
        <input type="radio" name="${ns}_${i}" value="faux"
          style="width:17px;height:17px;accent-color:#dc2626;cursor:pointer">
      </td>
    </tr>`).join('');
  return `<div style="margin:14px 0;overflow-x:auto">
  <table style="width:100%;border-collapse:collapse;font-size:0.9rem">
    <tr style="background:#00274D;color:white">
      <th style="padding:9px 12px;text-align:left">Proposition</th>
      <th style="padding:9px 12px;min-width:64px">✅ Vrai</th>
      <th style="padding:9px 12px;min-width:64px">❌ Faux</th>
    </tr>
    ${rows}
  </table>
</div>`;
}

/**
 * QCM avec vrais radio-buttons.
 * @param {string} ns   Namespace unique (ex: "p2qcm")
 * @param {number} num  Numéro de la question
 */
function qcm(ns, num, question, choices) {
  const name = `${ns}_q${num}`;
  const opts = choices.map((c, i) => `
    <div style="display:flex;align-items:center;gap:9px;margin-bottom:7px">
      <input type="radio" name="${name}" id="${name}_${i}"
        style="width:16px;height:16px;accent-color:#00274D;cursor:pointer;flex-shrink:0">
      <label for="${name}_${i}" style="cursor:pointer;font-size:0.9rem">
        <strong>${String.fromCharCode(65+i)}.</strong> ${c}
      </label>
    </div>`).join('');
  return `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;margin:10px 0">
  <div style="font-weight:600;color:#1e293b;margin-bottom:10px">${num}. ${question}</div>
  ${opts}
</div>`;
}

/** Champ texte inline */
function inp(placeholder = '', width = '100%') {
  return `<input type="text" placeholder="${placeholder}"
    style="width:${width};border:none;border-bottom:2px solid #00274D;padding:3px 6px;
    font-size:0.9rem;outline:none;background:transparent;color:#1e293b;box-sizing:border-box">`;
}

/** Ligne label + champ texte */
function fieldRow(label, placeholder = '', minWidth = '130px') {
  return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px dashed #e2e8f0">
  <div style="min-width:${minWidth};font-size:0.85rem;font-weight:600;color:#374151">${label}</div>
  <input type="text" placeholder="${placeholder || 'Votre réponse…'}"
    style="flex:1;border:none;border-bottom:2px solid #00274D;padding:4px 6px;
    font-size:0.9rem;outline:none;background:transparent;color:#1e293b">
</div>`;
}

/** Zone de texte libre */
function textarea(placeholder = 'Notez vos observations…', rows = 3) {
  return `<textarea rows="${rows}" placeholder="${placeholder}"
    style="width:100%;border:1px dashed #00274D;border-radius:6px;padding:8px 10px;
    font-size:0.9rem;outline:none;resize:vertical;color:#1e293b;box-sizing:border-box;
    font-family:inherit;background:#fafafa"></textarea>`;
}

/**
 * Horloge SVG + champ de saisie en dessous.
 * @param {string}  label   Texte affiché sous l'horloge
 * @param {number|null} h   Heure (null = horloge vide à compléter)
 * @param {number|null} m   Minutes
 * @param {boolean} isExample  Horloge bleue exemple
 */
function clock(label, h = null, m = null, isExample = false) {
  const DEG = Math.PI / 180;
  const cx = 60, cy = 60;

  let hLine = `<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy-28}"
    stroke="#ddd" stroke-width="3" stroke-dasharray="4" stroke-linecap="round"/>`;
  let mLine = `<line x1="${cx}" y1="${cy}" x2="${cx+40}" y2="${cy}"
    stroke="#ddd" stroke-width="2" stroke-dasharray="4" stroke-linecap="round"/>`;

  if (h !== null && m !== null) {
    const hA = ((h % 12) * 30 + m * 0.5 - 90) * DEG;
    const mA = (m * 6 - 90) * DEG;
    hLine = `<line x1="${cx}" y1="${cy}"
      x2="${(cx + 30 * Math.cos(hA)).toFixed(1)}" y2="${(cy + 30 * Math.sin(hA)).toFixed(1)}"
      stroke="${isExample ? '#1d4ed8' : '#00274D'}" stroke-width="4" stroke-linecap="round"/>`;
    mLine = `<line x1="${cx}" y1="${cy}"
      x2="${(cx + 42 * Math.cos(mA)).toFixed(1)}" y2="${(cy + 42 * Math.sin(mA)).toFixed(1)}"
      stroke="${isExample ? '#3b82f6' : '#FF9500'}" stroke-width="3" stroke-linecap="round"/>`;
  }

  const ring   = isExample ? '#1d4ed8' : '#00274D';
  const face   = isExample ? '#eff6ff' : '#f8fafc';
  const numClr = isExample ? '#1d4ed8' : '#1e293b';
  const dot    = isExample ? '#1d4ed8' : '#00274D';

  const svg = `<svg width="120" height="120" viewBox="0 0 120 120">
  <circle cx="${cx}" cy="${cy}" r="56" fill="${face}" stroke="${ring}" stroke-width="${isExample ? 4 : 3}"/>
  <circle cx="${cx}" cy="${cy}" r="50" fill="${face}" stroke="#e2e8f0" stroke-width="1"/>
  ${[12,1,2,3,4,5,6,7,8,9,10,11].map((n, i) => {
    const a = (i * 30 - 90) * DEG;
    const r = 42;
    const x = (cx + r * Math.cos(a)).toFixed(1);
    const y = (cy + r * Math.sin(a)).toFixed(1);
    const show = [12,3,6,9].includes(n);
    if (!show) return `<circle cx="${x}" cy="${y}" r="2" fill="${ring}" opacity="0.4"/>`;
    return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central"
      font-size="11" font-weight="700" fill="${numClr}">${n}</text>`;
  }).join('\n  ')}
  ${hLine}
  ${mLine}
  <circle cx="${cx}" cy="${cy}" r="4" fill="${dot}"/>
</svg>`;

  const inputOrValue = (h !== null)
    ? `<div style="margin-top:5px;font-weight:700;color:${isExample ? '#1d4ed8' : '#00274D'};font-size:0.95rem">
        ${isExample ? `✏️ Exemple : ${String(h).padStart(2,'0')}h${String(m).padStart(2,'0')}` : `${String(h).padStart(2,'0')}h${String(m).padStart(2,'0')}`}
      </div>`
    : `<input type="text" placeholder="__ h __"
        style="margin-top:6px;width:80px;border:2px solid #00274D;border-radius:6px;
        padding:4px 0;text-align:center;font-size:0.9rem;font-weight:700;
        color:#00274D;outline:none;display:block;margin-left:auto;margin-right:auto">`;

  return `<div style="display:inline-block;text-align:center;margin:8px 12px;vertical-align:top">
  ${svg}
  <div style="font-size:0.78rem;color:#64748b;margin-top:3px;max-width:100px">${label}</div>
  ${inputOrValue}
</div>`;
}

/** Séparateur */
const sep = `<div style="border-top:2px dashed #e2e8f0;margin:20px 0"></div>`;

/** En-tête de page de test */
function testHeader(num, theme) {
  return `<div class="lesson-badge">📝 Test — Module ${num}</div>
<h2 style="margin-top:8px">Évaluation : ${theme}</h2>`;
}

/** Objectifs */
function objBox(items) {
  return `<div class="lesson-objectives">
  <h4>🎯 Ce que vous évaluez</h4>
  <ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>
</div>`;
}

/** Rappel vocabulaire */
function vocab(items) {
  return `<div class="rule-box"><div class="rule-icon">🗝️</div><div>
  <strong>Lexique clé</strong>
  <ul style="margin-top:6px">
    ${items.map(([fr,tr]) => `<li><strong>${fr}</strong> <span class="inline-trans">= ${tr}</span></li>`).join('')}
  </ul>
</div></div>`;
}

/** Bandeau score avec champ input */
function scoreBox(total) {
  return `<div style="background:linear-gradient(135deg,#00274D,#003d73);border-radius:12px;
  padding:16px 20px;color:white;margin:16px 0;display:flex;align-items:center;
  justify-content:space-between;flex-wrap:wrap;gap:8px">
  <div>
    <div style="font-weight:700">📊 Mon score</div>
    <div style="font-size:0.82rem;opacity:.8">1 point par bonne réponse</div>
  </div>
  <div style="display:flex;align-items:center;gap:6px">
    <input type="number" min="0" max="${total}" placeholder="__"
      style="width:52px;border:2px solid rgba(255,255,255,0.5);border-radius:6px;
      background:rgba(255,255,255,0.1);color:white;text-align:center;font-size:1.3rem;
      font-weight:700;padding:4px;outline:none">
    <span style="font-size:1.3rem;font-weight:700">/ ${total}</span>
  </div>
</div>`;
}

/** Grille auto-évaluation */
function selfEval(skills, ns) {
  const rows = skills.map((s, i) => `
    <tr>
      <td style="padding:8px 12px;border:1px solid #e2e8f0;font-size:0.88rem">${s}</td>
      ${['bien','revoir','difficile'].map(v =>
        `<td style="padding:8px 12px;border:1px solid #e2e8f0;text-align:center">
          <input type="radio" name="${ns}_ae${i}" value="${v}"
            style="width:16px;height:16px;accent-color:#00274D;cursor:pointer">
        </td>`
      ).join('')}
    </tr>`).join('');
  return `<div style="margin:20px 0">
  <div style="font-weight:700;color:#00274D;margin-bottom:8px">🪞 Auto-évaluation</div>
  <div style="overflow-x:auto">
  <table style="width:100%;border-collapse:collapse;font-size:0.88rem">
    <tr style="background:#00274D;color:white">
      <th style="padding:8px 12px;text-align:left">Je sais…</th>
      <th style="padding:8px 12px">😊 Bien</th>
      <th style="padding:8px 12px">🙂 À revoir</th>
      <th style="padding:8px 12px">😐 Difficile</th>
    </tr>
    ${rows}
  </table></div>
</div>`;
}

// ════════════════════════════════════════════════════════════════
// PAGES
// ════════════════════════════════════════════════════════════════

function buildPages(audioUrls) {

  // ── Page 1 : Guide ──────────────────────────────────────────────
  const p1 = `<div class="lesson-intro">
  <div class="lesson-badge">📝 Évaluations & DELF Prim — A1.2</div>
  <h2>Bienvenue dans le module d'évaluation</h2>
  <p class="lead">Ce module regroupe <strong>6 tests de compréhension orale</strong> (un par module)
  et <strong>3 épreuves DELF Prim</strong> pour valider votre niveau A1.2.</p>

  <div class="lesson-objectives">
    <h4>📚 Contenu du module</h4>
    <ul>
      <li>🎧 <strong>Pistes 61–66</strong> — Tests oraux de fin de module (modules 1 à 6)</li>
      <li>🏅 <strong>Pistes 67–69</strong> — 3 épreuves blanches DELF Prim</li>
    </ul>
  </div>

  <div class="rule-box"><div class="rule-icon">💡</div><div>
    <strong>Comment utiliser ce module ?</strong>
    <ol style="margin-top:8px;padding-left:1.2rem">
      <li>Lisez les questions <em>avant</em> d'écouter l'audio.</li>
      <li>Cliquez directement sur les cases ✅/❌ et les boutons radio.</li>
      <li>Tapez votre réponse dans les champs de texte sous les horloges.</li>
      <li>Calculez votre score et remplissez la case 📊 à la fin de chaque page.</li>
    </ol>
  </div></div>

  <div class="summary-table" style="margin-top:1.5rem">
    <div class="summary-row header"><div>Piste</div><div>Type</div><div>Contenu évalué</div></div>
    ${[
      ['61','📝 Test','La rentrée scolaire'],['62','📝 Test','En ville'],
      ['63','📝 Test','Les loisirs'],['64','📝 Test','La vie quotidienne & l\'heure'],
      ['65','📝 Test','Météo & métiers'],['66','📝 Test','Au téléphone'],
      ['67','🏅 DELF','Épreuve 1 — Compréhension orale'],
      ['68','🏅 DELF','Épreuve 2 — Dialogue'],
      ['69','🏅 DELF','Épreuve 3 — Annonce / Message'],
    ].map(([n,t,c]) => `<div class="summary-row">
      <div><span class="prep">${n}</span></div><div>${t}</div><div>${c}</div>
    </div>`).join('')}
  </div>
</div>`;

  // ── Page 2 : Test 1 — La rentrée ────────────────────────────────
  const p2 = `${testHeader(1,'La rentrée scolaire')}
${objBox(['Comprendre un dialogue sur la vie scolaire','Identifier matières et fournitures à l\'oral','Reconnaître le passé composé','Comprendre un message simple'])}
${vocab([['un cahier','an exercise book'],['les devoirs','homework'],['la récréation','break time'],['la cantine','the school canteen']])}
${beforeListen(['Qui sont les personnages ?','De quoi parlent-ils ?','Quelle matière scolaire est mentionnée ?','Quel objet est cité ?'])}
${audio(audioUrls[61],'Piste 61 — Évaluation Module 1')}
${sep}
<h4 style="color:#00274D;margin-bottom:10px">Exercice 1 — Vrai ou Faux <span style="font-size:0.8rem;font-weight:400;color:#64748b">(cliquez sur la bonne case)</span></h4>
${vraisFaux('p2vf',[
  'Les élèves parlent de leurs vacances.',
  'Le personnage principal aime les mathématiques.',
  'Un cahier est mentionné dans la conversation.',
  'La scène se passe pendant la récréation.',
  'Le personnage a oublié ses devoirs.',
])}
${sep}
<h4 style="color:#00274D;margin-bottom:6px">Exercice 2 — QCM</h4>
${qcm('p2','1','La situation se passe…',['Dans une salle de classe','Dans la cantine','Dans la cour de récréation','À la maison'])}
${qcm('p2','2','Maé envoie… à son ami.',['Une lettre','Un message vocal','Un mail','Une carte postale'])}
${qcm('p2','3','Quelle matière est citée ?',['Les sciences','Le français','L\'EPS','L\'histoire-géographie'])}
${sep}
${scoreBox(8)}
${selfEval(['comprendre un dialogue scolaire','identifier des objets et matières à l\'oral','reconnaître le passé composé'],'p2')}`;

  // ── Page 3 : Test 2 — En ville ───────────────────────────────────
  const p3 = `${testHeader(2,'En ville')}
${objBox(['Comprendre des indications pour se déplacer','Identifier des lieux publics à l\'oral','Reconnaître les moyens de transport','Suivre une direction simple'])}
${vocab([['tout droit','straight ahead'],['à gauche / à droite','to the left / to the right'],['en face de','opposite'],['la boulangerie','the bakery'],['à pied','on foot']])}
${beforeListen(['Où veulent aller les personnages ?','Quel moyen de transport est cité ?','Quels lieux sont mentionnés ?','Quelle direction est indiquée ?'])}
${audio(audioUrls[62],'Piste 62 — Évaluation Module 2')}
${sep}
<h4 style="color:#00274D;margin-bottom:10px">Exercice 1 — Associez lieu et description</h4>
<p style="font-size:0.88rem;color:#64748b;margin-bottom:10px">Tapez la lettre correspondante dans chaque case.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:10px 0">
  <div style="background:#f8fafc;border-radius:8px;padding:12px;border:1px solid #e2e8f0">
    <div style="font-weight:700;color:#00274D;margin-bottom:8px">Lieux</div>
    ${['🏛️ La mairie','🍞 La boulangerie','💊 La pharmacie','📚 La bibliothèque','🎬 Le cinéma'].map((l,i) =>
      `<div style="padding:5px 0;border-bottom:1px dashed #e2e8f0;font-size:0.88rem"><strong>${String.fromCharCode(65+i)}.</strong> ${l}</div>`
    ).join('')}
  </div>
  <div style="background:#f8fafc;border-radius:8px;padding:12px;border:1px solid #e2e8f0">
    <div style="font-weight:700;color:#00274D;margin-bottom:8px">Descriptions</div>
    ${['On achète du pain ici.','On regarde des films ici.','On emprunte des livres gratuitement.','On achète des médicaments ici.','C\'est l\'administration de la ville.'].map((d,i) =>
      `<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px dashed #e2e8f0;font-size:0.88rem">
        <strong>${i+1}.</strong> ${d}
        <input type="text" maxlength="1" placeholder="_"
          style="width:28px;border:2px solid #00274D;border-radius:4px;text-align:center;
          font-weight:700;font-size:0.9rem;color:#00274D;outline:none;padding:2px;margin-left:auto">
      </div>`
    ).join('')}
  </div>
</div>
${sep}
<h4 style="color:#00274D;margin-bottom:10px">Exercice 2 — Vrai ou Faux</h4>
${vraisFaux('p3vf',['Les personnages se déplacent à vélo.','La pharmacie est en face du cinéma.','Pour aller à la bibliothèque il faut tourner à gauche.','Le supermarché est loin de la mairie.'])}
${sep}
<h4 style="color:#00274D;margin-bottom:6px">Exercice 3 — QCM</h4>
${qcm('p3','1','Comment dit-on "to the right" en français ?',['Tout droit','À gauche','À droite','En face de'])}
${qcm('p3','2','Le métro est un moyen de transport…',['À pied','Aérien','Souterrain','Fluvial'])}
${sep}
${scoreBox(11)}
${selfEval(['comprendre des directions à l\'oral','identifier des lieux en ville','reconnaître les transports'],'p3')}`;

  // ── Page 4 : Test 3 — Les loisirs ────────────────────────────────
  const p4 = `${testHeader(3,'Les loisirs')}
${objBox(['Comprendre des préférences à l\'oral','Identifier des activités sportives et culturelles','Reconnaître les adverbes de fréquence','Comprendre une proposition d\'activité'])}
${vocab([['j\'adore / je préfère / je déteste','I love / I prefer / I hate'],['souvent / parfois / rarement','often / sometimes / rarely'],['une fois par semaine','once a week'],['on va + infinitif','let\'s + verb']])}
${beforeListen(['Quelles activités sont mentionnées ?','Le personnage aime-t-il cette activité ?','Quelle fréquence est indiquée ?','Une proposition d\'activité est-elle faite ?'])}
${audio(audioUrls[63],'Piste 63 — Évaluation Module 3')}
${sep}
<h4 style="color:#00274D;margin-bottom:10px">Exercice 1 — Cochez les activités entendues</h4>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0">
  ${['Le football','La natation','Le vélo','La danse','Le judo','Les jeux vidéo','Lire','Regarder un film','Écouter de la musique','Dessiner'].map((act,i) =>
    `<label style="display:flex;align-items:center;gap:8px;background:#f8fafc;border:1px solid #e2e8f0;
      border-radius:8px;padding:9px 12px;cursor:pointer;font-size:0.88rem">
      <input type="checkbox" style="width:16px;height:16px;accent-color:#00274D;cursor:pointer;flex-shrink:0">
      ${act}
    </label>`
  ).join('')}
</div>
${sep}
<h4 style="color:#00274D;margin-bottom:10px">Exercice 2 — Texte à trous</h4>
<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;line-height:2.2;font-size:0.95rem">
  Le week-end, Lucas ${inp('verbe…','90px')} de la natation. Il va à la piscine
  ${inp('fréquence…','110px')} par semaine. Il ${inp('verbe…','80px')} aussi le vélo.
  Parfois, il regarde des films à la maison. Il ${inp('verbe…','80px')} les jeux vidéo.
  <div style="background:#fff8e1;border-radius:6px;padding:8px;margin-top:10px;font-size:0.85rem">
    <strong>Mots à utiliser :</strong> fait · deux fois · aime · déteste · joue
  </div>
</div>
${sep}
<h4 style="color:#00274D;margin-bottom:6px">Exercice 3 — QCM</h4>
${qcm('p4','1','Le personnage pratique son activité…',['Tous les jours','Une fois par semaine','Parfois le week-end','Rarement'])}
${qcm('p4','2','Comment propose-t-on une activité en français ?',['Je veux…','On va + infinitif','J\'aime…','Tu peux…'])}
${sep}
${scoreBox(9)}
${selfEval(['comprendre des préférences à l\'oral','identifier des activités et leur fréquence','comprendre une proposition d\'activité'],'p4')}`;

  // ── Page 5 : Test 4 — La vie quotidienne & l'heure ───────────────
  //   ⚠️ Horloge BLEUE exemple intégrée dans la consigne
  const p5 = `${testHeader(4,'La vie quotidienne & l\'heure')}
${objBox(['Comprendre la routine quotidienne à l\'oral','Identifier l\'heure précisément','Reconnaître les verbes pronominaux','Replacer des actions dans l\'ordre chronologique'])}
${vocab([['se lever / se coucher','to get up / to go to bed'],['se brosser les dents','to brush one\'s teeth'],['prendre le petit-déjeuner','to have breakfast'],['faire ses devoirs','to do homework']])}
${beforeListen(['Quelles actions de la routine sont mentionnées ?','À quelle heure se passe chaque action ?','Quel est l\'ordre des actions ?','Repère les verbes pronominaux.'])}

<div style="background:#eff6ff;border:2px solid #3b82f6;border-radius:10px;padding:14px 18px;margin:12px 0">
  <div style="font-weight:700;color:#1d4ed8;margin-bottom:10px">🔵 Exemple de lecture d'horloge</div>
  <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
    ${clock('Exemple : 7h00', 7, 0, true)}
    <div style="font-size:0.9rem;color:#1e3a8a;max-width:280px">
      <p style="margin:0 0 6px"><strong>Aiguille courte (bleue)</strong> → pointe vers le <strong>7</strong> = l'heure</p>
      <p style="margin:0 0 6px"><strong>Aiguille longue (bleue clair)</strong> → pointe vers le <strong>12</strong> = minutes (00)</p>
      <p style="margin:0;font-weight:700;color:#1d4ed8">✏️ On lit : 7h00 — "Il est sept heures."</p>
    </div>
  </div>
  <div style="margin-top:10px;font-size:0.85rem;color:#1d4ed8">
    👇 Maintenant, pour les horloges ci-dessous, <strong>tapez l'heure</strong> que vous entendez dans le champ sous chaque horloge.
  </div>
</div>

${audio(audioUrls[64],'Piste 64 — Évaluation Module 4')}
${sep}
<h4 style="color:#00274D;margin-bottom:10px">Exercice 1 — Écrivez l'heure entendue</h4>
<div style="display:flex;flex-wrap:wrap;gap:4px;margin:10px 0;align-items:flex-start">
  ${clock('Se lever',null,null,false)}
  ${clock('Petit-déjeuner',null,null,false)}
  ${clock('Début école',null,null,false)}
  ${clock('Récréation',null,null,false)}
  ${clock('Déjeuner',null,null,false)}
  ${clock('Se coucher',null,null,false)}
</div>
${sep}
<h4 style="color:#00274D;margin-bottom:10px">Exercice 2 — Remettez dans l'ordre (tapez 1 à 6)</h4>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0">
  ${['Se brosser les dents','Faire ses devoirs','Se lever','Prendre le petit-déjeuner','Dîner en famille','Se coucher'].map(act =>
    `<div style="display:flex;align-items:center;gap:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:9px 12px">
      <input type="number" min="1" max="6" placeholder="__"
        style="width:36px;height:32px;border:2px solid #00274D;border-radius:6px;text-align:center;
        font-weight:700;font-size:0.95rem;color:#00274D;outline:none;flex-shrink:0">
      <span style="font-size:0.88rem">${act}</span>
    </div>`
  ).join('')}
</div>
${sep}
<h4 style="color:#00274D;margin-bottom:6px">Exercice 3 — QCM</h4>
${qcm('p5','1','Le personnage se lève à…',['6h30','7h00','7h30','8h00'])}
${qcm('p5','2','"Se laver" est un verbe…',['D\'action ordinaire','Pronominal','Irrégulier seulement','Auxiliaire'])}
${qcm('p5','3','"Il est midi" signifie…',['12h00','00h00','12h30','11h00'])}
${sep}
${scoreBox(12)}
${selfEval(['comprendre une routine quotidienne','identifier des heures dans une écoute','reconnaître les verbes pronominaux','ordonner des actions chronologiquement'],'p5')}`;

  // ── Page 6 : Test 5 — Météo & métiers ────────────────────────────
  const p6 = `${testHeader(5,'La météo et les métiers')}
${objBox(['Comprendre un bulletin météo oral','Identifier des conditions météorologiques','Reconnaître des professions','Comprendre des projets et ambitions'])}
${vocab([['il fait beau / mauvais','the weather is nice / bad'],['il pleut / il neige','it\'s raining / snowing'],['il y a du vent / du soleil','it\'s windy / sunny'],['je voudrais devenir…','I would like to become…']])}
${beforeListen(['Quel temps fait-il ?','Quelle profession est mentionnée ?','Est-ce un rêve ou une réalité ?','Quelle ville ou région est citée ?'])}
${audio(audioUrls[65],'Piste 65 — Évaluation Module 5')}
${sep}
<h4 style="color:#00274D;margin-bottom:10px">Exercice 1 — Cochez les conditions météo entendues</h4>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;margin:10px 0">
  ${[['☀️','Il fait beau'],['🌧️','Il pleut'],['❄️','Il neige'],['💨','Il y a du vent'],['☁️','Il y a des nuages'],['🌡️','Il fait chaud'],['🥶','Il fait froid'],['🌤️','Il y a du soleil']].map(([e,l]) =>
    `<label style="display:flex;align-items:center;gap:8px;background:#f8fafc;border:1px solid #e2e8f0;
      border-radius:8px;padding:9px 12px;cursor:pointer;font-size:0.88rem">
      <input type="checkbox" style="width:16px;height:16px;accent-color:#00274D;cursor:pointer;flex-shrink:0">
      ${e} ${l}
    </label>`
  ).join('')}
</div>
${sep}
<h4 style="color:#00274D;margin-bottom:10px">Exercice 2 — Cochez les métiers mentionnés</h4>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0">
  ${[['👨‍⚕️','Médecin'],['👨‍🏫','Professeur'],['🚒','Pompier'],['🍳','Cuisinier/Chef'],['⚽','Footballeur'],['🎭','Acteur/Actrice'],['⚙️','Ingénieur'],['💊','Infirmier/ière']].map(([e,l]) =>
    `<label style="display:flex;align-items:center;gap:8px;background:#f8fafc;border:1px solid #e2e8f0;
      border-radius:8px;padding:9px 12px;cursor:pointer;font-size:0.88rem">
      <input type="checkbox" style="width:16px;height:16px;accent-color:#00274D;cursor:pointer;flex-shrink:0">
      ${e} ${l}
    </label>`
  ).join('')}
</div>
${sep}
<h4 style="color:#00274D;margin-bottom:6px">Exercice 3 — QCM</h4>
${qcm('p6','1','La forme féminine de "acteur" est…',['Acteuse','Acteure','Actrice','Actorie'])}
${qcm('p6','2','"Je voudrais devenir médecin" exprime…',['Un fait présent','Une habitude','Un souhait futur','Un ordre'])}
${qcm('p6','3','"Il y a du soleil" signifie…',['It is cloudy','It is sunny','It is raining','It is cold'])}
${sep}
${scoreBox(11)}
${selfEval(['comprendre un bulletin météo oral','identifier des professions à l\'oral','comprendre des projets et ambitions'],'p6')}`;

  // ── Page 7 : Test 6 — Au téléphone ───────────────────────────────
  const p7 = `${testHeader(6,'Conversations téléphoniques')}
${objBox(['Comprendre une conversation téléphonique','Identifier les formules de politesse','Comprendre et noter un numéro','Reconnaître un malentendu'])}
${vocab([['Allô ?','Hello? (on the phone)'],['C\'est de la part de qui ?','Who is calling?'],['Ne quittez pas.','Please hold.'],['Vous avez fait un faux numéro.','You have the wrong number.']])}
${beforeListen(['Qui appelle qui ?','Quel est le motif de l\'appel ?','Y a-t-il un malentendu ?','Un numéro de téléphone est-il donné ?'])}
${audio(audioUrls[66],'Piste 66 — Évaluation Module 6')}
${sep}
<h4 style="color:#00274D;margin-bottom:10px">Exercice 1 — Fiche d'appel téléphonique</h4>
<div style="background:#f8fafc;border:2px solid #00274D;border-radius:10px;padding:20px;max-width:420px">
  <div style="font-weight:700;color:#00274D;font-size:1rem;margin-bottom:16px">📞 Fiche d'appel</div>
  ${fieldRow('De la part de','Prénom / Nom de l\'appelant')}
  ${fieldRow('Appel pour','Destinataire')}
  ${fieldRow('Motif','Raison de l\'appel')}
  ${fieldRow('Heure','__ h __')}
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
    <div style="min-width:130px;font-size:0.85rem;font-weight:600;color:#374151">Numéro de tél.</div>
    <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
      ${[0,1,2,3,4].map(i =>
        `<input type="text" maxlength="2" placeholder="__"
          style="width:32px;border:2px solid #00274D;border-radius:4px;text-align:center;
          font-weight:700;font-size:0.9rem;color:#00274D;outline:none;padding:4px 0">
         ${i<4?`<span style="color:#00274D;font-weight:700">-</span>`:''}`
      ).join('')}
    </div>
  </div>
  <div style="display:flex;align-items:center;gap:16px;font-size:0.9rem;margin-top:4px">
    <span style="font-weight:600;color:#374151">Message laissé :</span>
    <label style="cursor:pointer;display:flex;align-items:center;gap:5px">
      <input type="radio" name="p7msg" value="oui" style="accent-color:#00274D"> Oui
    </label>
    <label style="cursor:pointer;display:flex;align-items:center;gap:5px">
      <input type="radio" name="p7msg" value="non" style="accent-color:#00274D"> Non
    </label>
  </div>
</div>
${sep}
<h4 style="color:#00274D;margin-bottom:10px">Exercice 2 — Vrai ou Faux</h4>
${vraisFaux('p7vf',['L\'appelant a le bon numéro.','La personne appelée n\'est pas disponible.','Un message est laissé sur le répondeur.','Le numéro de téléphone est donné.','La conversation se termine poliment.'])}
${sep}
<h4 style="color:#00274D;margin-bottom:6px">Exercice 3 — QCM</h4>
${qcm('p7','1','"Ne quittez pas" signifie…',['Goodbye','Please leave','Please hold','Call back later'])}
${qcm('p7','2','En France, un numéro de téléphone a…',['8 chiffres','9 chiffres','10 chiffres','12 chiffres'])}
${qcm('p7','3','"Vous avez fait un faux numéro" signifie…',['You called at the wrong time','You have the wrong number','You forgot to call','You need to call back'])}
${sep}
${scoreBox(13)}
${selfEval(['comprendre une conversation téléphonique','noter un numéro à l\'oral','identifier les formules téléphoniques','reconnaître un malentendu'],'p7')}`;

  // ── Page 8 : DELF Épreuve 1 ──────────────────────────────────────
  const p8 = `<div class="lesson-intro">
  <div class="lesson-badge">🏅 DELF Prim — Épreuve 1</div>
  <h2>Compréhension de l'oral — Format officiel</h2>
  <p class="lead">Épreuve en conditions réelles. Lisez les questions, écoutez <strong>une seule fois</strong>, répondez.</p>
</div>
<div class="compare-box">
  <div class="compare-item good">✅ Lisez les questions AVANT d'écouter</div>
  <div class="compare-item special">⚠️ Une seule écoute — comme à l'examen</div>
</div>
${audio(audioUrls[67],'Piste 67 — DELF Prim Épreuve 1')}
${sep}
<h4 style="color:#00274D;margin-bottom:10px">Document 1 — Cochez la bonne image</h4>
<p style="font-size:0.88rem;color:#64748b;margin-bottom:10px">Parmi les situations ci-dessous, cochez celle qui correspond à ce que vous avez entendu.</p>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:12px 0">
  ${[['🎒','École / Sac scolaire'],['🚌','Transport / Bus'],['☀️','Météo / Temps'],['📞','Téléphone']].map(([e,l],i) =>
    `<label style="border:2px solid #e2e8f0;border-radius:10px;padding:14px;text-align:center;cursor:pointer;display:block;transition:all .2s">
      <input type="radio" name="p8d1" style="display:none">
      <div style="font-size:2.2rem;margin-bottom:6px">${e}</div>
      <div style="font-size:0.75rem;color:#64748b">${l}</div>
    </label>`
  ).join('')}
</div>
${sep}
<h4 style="color:#00274D;margin-bottom:6px">Document 2 — QCM</h4>
${qcm('p8','1','Où se passe la conversation ?',['À l\'école','Dans un magasin','À la maison','Dans la rue'])}
${qcm('p8','2','Que demande le personnage ?',['Son chemin','Un objet','L\'heure','Un rendez-vous'])}
${sep}
<h4 style="color:#00274D;margin-bottom:10px">Document 3 — Fiche à compléter</h4>
<div style="border:2px solid #00274D;border-radius:10px;padding:18px;max-width:400px">
  ${fieldRow('Nom de la personne','')}
  ${fieldRow('Heure du rendez-vous','__ h __')}
  ${fieldRow('Lieu','')}
  ${fieldRow('Motif','')}
</div>
${sep}
${scoreBox(8)}`;

  // ── Page 9 : DELF Épreuve 2 ──────────────────────────────────────
  const p9 = `<div class="lesson-intro">
  <div class="lesson-badge">🏅 DELF Prim — Épreuve 2</div>
  <h2>Compréhension d'un dialogue</h2>
  <p class="lead">Écoutez le dialogue et répondez aux questions en cochant la bonne réponse.</p>
</div>
<div class="compare-box">
  <div class="compare-item good">✅ Stratégie : repérez QUI parle et POURQUOI</div>
  <div class="compare-item special">⚠️ Concentrez-vous sur les mots-clés, pas sur chaque mot</div>
</div>
${audio(audioUrls[68],'Piste 68 — DELF Prim Épreuve 2')}
${sep}
<h4 style="color:#00274D;margin-bottom:6px">Questions sur le dialogue</h4>
${qcm('p9','1','Les deux personnages sont…',['Des élèves','Des parents et un professeur','Deux adultes','Un élève et un professeur'])}
${qcm('p9','2','Le dialogue se passe…',['À l\'école','Au téléphone','Dans un magasin','Dans la rue'])}
${qcm('p9','3','Quel est le sujet principal ?',['Les vacances','Les devoirs','Un rendez-vous','Une sortie'])}
${qcm('p9','4','La conversation se termine…',['Par un accord','Par un désaccord','Par une question','Par un au revoir simple'])}
${sep}
<h4 style="color:#00274D;margin-bottom:10px">Vrai ou Faux</h4>
${vraisFaux('p9vf',['Le personnage A est content.','Un lieu est mentionné dans la conversation.','Une heure est donnée dans le dialogue.','La conversation est formelle (vouvoiement).',])}
${sep}
<h4 style="color:#00274D;margin-bottom:10px">Complétez à partir du dialogue</h4>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:10px 0">
  ${['Où vont-ils ?','Quand ?','Avec qui ?','Pourquoi ?'].map(q =>
    `<div>
      <div style="font-size:0.85rem;font-weight:600;color:#374151;margin-bottom:4px">${q}</div>
      <input type="text" placeholder="Votre réponse…"
        style="width:100%;border:none;border-bottom:2px solid #00274D;padding:4px 6px;
        font-size:0.9rem;outline:none;background:transparent;box-sizing:border-box">
    </div>`
  ).join('')}
</div>
${sep}
${scoreBox(9)}
${selfEval(['comprendre l\'essentiel d\'un dialogue','identifier personnages et situation','repérer des informations précises'],'p9')}`;

  // ── Page 10 : DELF Épreuve 3 ─────────────────────────────────────
  const p10 = `<div class="lesson-intro">
  <div class="lesson-badge">🏅 DELF Prim — Épreuve 3</div>
  <h2>Compréhension d'une annonce</h2>
  <p class="lead">Vous allez entendre un message ou une annonce. Complétez la fiche avec les informations entendues.</p>
</div>
<div class="compare-box">
  <div class="compare-item good">✅ Concentrez-vous sur les chiffres, noms et lieux</div>
  <div class="compare-item special">⚠️ Écrivez pendant l'écoute — ne cherchez pas la perfection</div>
</div>
${audio(audioUrls[69],'Piste 69 — DELF Prim Épreuve 3')}
${sep}
<h4 style="color:#00274D;margin-bottom:10px">Fiche d'inscription à compléter</h4>
<div style="border:2px solid #00274D;border-radius:12px;padding:20px;max-width:460px">
  <div style="font-weight:700;color:#00274D;font-size:1rem;margin-bottom:14px">📋 Fiche d'inscription</div>
  ${fieldRow('Prénom','')}
  ${fieldRow('Nom de famille','')}
  ${fieldRow('Âge','__ ans')}
  ${fieldRow('Ville / Adresse','')}
  ${fieldRow('Activité choisie','')}
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px dashed #e2e8f0">
    <div style="min-width:130px;font-size:0.85rem;font-weight:600;color:#374151">Jour</div>
    <input type="text" placeholder="Lundi / Mardi / …"
      style="flex:1;border:none;border-bottom:2px solid #00274D;padding:4px 6px;font-size:0.9rem;outline:none;background:transparent">
    <div style="font-size:0.85rem;font-weight:600;color:#374151;margin-left:10px">à</div>
    <input type="text" placeholder="__ h __"
      style="width:64px;border:none;border-bottom:2px solid #00274D;padding:4px 6px;font-size:0.9rem;outline:none;background:transparent;text-align:center">
  </div>
  ${fieldRow('Tarif','__ €')}
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
    <div style="min-width:130px;font-size:0.85rem;font-weight:600;color:#374151">Numéro de tél.</div>
    <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
      ${[0,1,2,3,4].map(i =>
        `<input type="text" maxlength="2" placeholder="__"
          style="width:32px;border:2px solid #00274D;border-radius:4px;text-align:center;
          font-weight:700;font-size:0.9rem;color:#00274D;outline:none;padding:4px 0">
        ${i<4?'<span style="color:#00274D;font-weight:700">-</span>':''}`
      ).join('')}
    </div>
  </div>
</div>
${sep}
<h4 style="color:#00274D;margin-bottom:6px">Questions complémentaires</h4>
${qcm('p10','1','De quel type d\'annonce s\'agit-il ?',['Un message téléphonique','Une publicité','Une annonce scolaire','Un bulletin météo'])}
${qcm('p10','2','L\'activité proposée est pour…',['Les adultes','Les enfants de 6 à 10 ans','Les adolescents','Tout le monde'])}
${sep}
${scoreBox(11)}`;

  // ── Page 11 : Bilan final ────────────────────────────────────────
  const p11 = `<div class="lesson-intro">
  <div class="lesson-badge">📊 Bilan final — Compréhension orale A1.2</div>
  <h2>Récapitulatif de l'évaluation</h2>
</div>

<div style="overflow-x:auto">
<table style="width:100%;border-collapse:collapse;font-size:0.9rem">
  <tr style="background:#00274D;color:white">
    <th style="padding:9px 12px;text-align:left">Test / Épreuve</th>
    <th style="padding:9px 12px;text-align:left">Thème</th>
    <th style="padding:9px 12px;text-align:center">Score</th>
    <th style="padding:9px 12px;text-align:center">Sur</th>
  </tr>
  ${[['61','Test 1','La rentrée scolaire',8],['62','Test 2','En ville',11],['63','Test 3','Les loisirs',9],
     ['64','Test 4','La vie quotidienne & l\'heure',12],['65','Test 5','Météo & métiers',11],
     ['66','Test 6','Au téléphone',13],['67','DELF 1','Épreuve 1',8],['68','DELF 2','Épreuve 2',9],['69','DELF 3','Épreuve 3',11]
  ].map(([n,t,theme,max],i) =>
    `<tr style="${i%2===0?'':'background:#f8fafc'}">
      <td style="padding:9px 12px;border:1px solid #e2e8f0;font-weight:600"><span class="prep">${n}</span> ${t}</td>
      <td style="padding:9px 12px;border:1px solid #e2e8f0">${theme}</td>
      <td style="padding:9px 12px;border:1px solid #e2e8f0;text-align:center">
        <input type="number" min="0" max="${max}" placeholder="__"
          style="width:44px;border:2px solid #00274D;border-radius:6px;text-align:center;
          font-weight:700;font-size:0.95rem;color:#00274D;outline:none;padding:3px">
      </td>
      <td style="padding:9px 12px;border:1px solid #e2e8f0;text-align:center;font-weight:700;color:#00274D">/${max}</td>
    </tr>`
  ).join('')}
  <tr style="background:#fff8e1;font-weight:700">
    <td colspan="2" style="padding:10px 12px;border:1px solid #e2e8f0">Total général</td>
    <td style="padding:10px 12px;border:1px solid #e2e8f0;text-align:center">
      <input type="number" min="0" max="92" placeholder="__"
        style="width:48px;border:2px solid #FF9500;border-radius:6px;text-align:center;
        font-weight:700;font-size:1rem;color:#FF9500;outline:none;padding:3px">
    </td>
    <td style="padding:10px 12px;border:1px solid #e2e8f0;text-align:center;color:#FF9500;font-size:1rem">/92</td>
  </tr>
</table>
</div>

${selfEval([
  'comprendre des dialogues sur des sujets familiers',
  'identifier des informations précises dans un audio',
  'reconnaître des expressions de temps, lieu et fréquence',
  'comprendre des formules de politesse et conventions',
  'compléter une fiche à partir d\'informations entendues',
  'réussir une épreuve DELF Prim de compréhension orale',
],'p11')}

<div style="background:linear-gradient(135deg,#00274D,#003d73);border-radius:12px;padding:20px;
color:white;margin:20px 0;text-align:center">
  <div style="font-size:1.8rem;margin-bottom:8px">🎓</div>
  <div style="font-weight:700;font-size:1.1rem;margin-bottom:6px">Félicitations !</div>
  <div style="font-size:0.9rem;opacity:.85;max-width:400px;margin:0 auto">
    Vous avez complété le parcours de <strong>Compréhension orale A1.2 — IWS Laayoune</strong>.
    Partagez vos résultats avec votre formateur pour obtenir votre attestation.
  </div>
</div>`;

  return [
    { id:1,  title:'Guide de l\'évaluation',        content:p1  },
    { id:2,  title:'Test 1 — La rentrée scolaire',   content:p2  },
    { id:3,  title:'Test 2 — En ville',              content:p3  },
    { id:4,  title:'Test 3 — Les loisirs',           content:p4  },
    { id:5,  title:'Test 4 — La vie quotidienne',    content:p5  },
    { id:6,  title:'Test 5 — Météo & métiers',       content:p6  },
    { id:7,  title:'Test 6 — Au téléphone',          content:p7  },
    { id:8,  title:'DELF Prim — Épreuve 1',          content:p8  },
    { id:9,  title:'DELF Prim — Épreuve 2',          content:p9  },
    { id:10, title:'DELF Prim — Épreuve 3',          content:p10 },
    { id:11, title:'Bilan & Auto-évaluation',        content:p11 },
  ];
}

// ════════════════════════════════════════════════════════════════
// EXERCICES QCM (onglet Exercices du cours)
// ════════════════════════════════════════════════════════════════

const EXERCISES = [
  { id:'q1', question:'Combien de tests de fin de module contient ce cours ?',         options:['4','5','6','7'],              answer:2 },
  { id:'q2', question:'Le DELF Prim certifie quel niveau du CECRL ?',                  options:['A2–B1','A1–A2','B1–B2','A1'], answer:1 },
  { id:'q3', question:'Pendant l\'examen, on écoute l\'enregistrement…',               options:['Autant de fois que nécessaire','Deux fois','Une seule fois','Trois fois'], answer:2 },
  { id:'q4', question:'Quel module évalue les conversations téléphoniques ?',          options:['Module 3','Module 4','Module 5','Module 6'], answer:3 },
  { id:'q5', question:'Pour les horloges du Test 4, on évalue…',                       options:['Les saisons','L\'heure et la routine','Les transports','Les métiers'], answer:1 },
  { id:'q6', question:'"Vous avez fait un faux numéro" signifie…',                     options:['Wrong time','Wrong number','Wrong person','Wrong day'], answer:1 },
  { id:'q7', question:'Un bulletin météo se reconnaît à l\'oral grâce à…',             options:['Des verbes pronominaux','Des expressions "il fait"/"il y a"','Des numéros de téléphone','Des noms de matières'], answer:1 },
  { id:'q8', question:'Quelle forme d\'exercice est typique de l\'Épreuve 3 DELF ?',   options:['QCM','Texte à trous','Fiche à compléter','Traduction'], answer:2 },
];

// ════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════

async function main() {
  console.log('🎓 patch-evals-pro v2 — Interactif & Cohérent\n');

  if (!PB_EMAIL || !PB_PASS) { console.error('❌ Identifiants .env manquants'); process.exit(1); }

  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);
  console.log(`🔐 Connexion ${PB_URL}…`);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log('✅ Connecté.\n');

  // Chargement audios
  console.log('🎵 Chargement des pistes 61–69…');
  const audioUrls = {};
  try {
    const recs = await pb.collection('tiptop2_audio').getFullList({ $autoCancel:false });
    for (const r of recs) {
      if (r.fichier && r.piste_numero >= 61)
        audioUrls[r.piste_numero] = `${PB_URL}/api/files/tiptop2_audio/${r.id}/${r.fichier}`;
    }
    console.log(`   ✅ ${Object.keys(audioUrls).length} piste(s) trouvée(s)\n`);
  } catch (e) { console.log(`   ⚠️  ${e.message}\n`); }

  // Trouver le cours
  console.log(`📚 Recherche : "${COURSE_TITLE}"…`);
  let courseId = null;
  try {
    const found = await pb.collection('courses').getFirstListItem(
      `titre="${COURSE_TITLE}"`, { $autoCancel:false });
    courseId = found.id;
    console.log(`   ✅ Trouvé — id: ${courseId}\n`);
  } catch { console.log('   ℹ️  Cours introuvable → création\n'); }

  // Build
  console.log('🏗️  Génération des 11 pages interactives…');
  const pages = buildPages(audioUrls);
  console.log(`   ✅ ${pages.length} pages\n`);

  const data = {
    titre:         COURSE_TITLE,
    langue:        'Francais',
    cours_nom:     'Français',
    niveau:        'A1.2',
    section:       'langues',
    categorie:     'langue',
    description:   '6 tests interactifs (Vrai/Faux cliquables, QCM radio, horloges, fiches téléphoniques) + 3 épreuves blanches DELF Prim format officiel.',
    instructeur:   'IWS Laayoune',
    duree:         60,
    prix:          0,
    pages:         JSON.stringify(pages),
    exercises:     JSON.stringify(EXERCISES),
  };

  let record;
  if (courseId) {
    record = await pb.collection('courses').update(courseId, data, { $autoCancel:false });
    console.log(`🔄 Mis à jour : "${record.titre}"`);
  } else {
    record = await pb.collection('courses').create(data, { $autoCancel:false });
    console.log(`✅ Créé : "${record.titre}"`);
  }

  const active = [61,62,63,64,65,66,67,68,69].filter(n => audioUrls[n]).length;
  console.log(`\n   📄 ${pages.length} pages  ✏️  ${EXERCISES.length} QCM  🔊 ${active}/9 audios actifs`);
  console.log('\n🎉 Patch terminé !');
  console.log(`   🔗 http://localhost:3000/etudiant/dashboard/courses/${record.id}/view`);
}

main().catch(err => {
  console.error('\n💥 Erreur :', err.message);
  console.error(JSON.stringify(err?.data, null, 2));
  process.exit(1);
});
