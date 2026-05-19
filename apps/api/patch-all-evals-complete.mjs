/**
 * patch-all-evals-complete.mjs  — Version DÉFINITIVE (basée sur transcriptions réelles)
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * Contenu RÉEL confirmé par transcription Whisper :
 *
 *   Piste 61 → L'heure (4 fois dites verbalement : 10h45, 8h15, 13h10, 9h30)
 *   Piste 62 → Aller à la POSTE à pied, lettre pour grand-mère
 *   Piste 63 → Marie fait du VOLLEY AU PARC, ne peut pas venir
 *   Piste 64 → SANTÉ : mal au pied (rugby), pied cassé, pas école demain
 *   Piste 65 → MÉTÉO : Marseille beau, Strasbourg soleil, Paris pas de pluie, Rennes 20°
 *   Piste 66 → VÊTEMENTS : 3 robes, 1 jean, chaussures, 2 pulls, chaussettes
 *   Piste 67 → DELF : "Entoure le bon dessin" (maths difficile, animaux de ferme…)
 *   Piste 68 → DELF : "Note le numéro du dialogue sous l'image" (sports…)
 *   Piste 69 → DELF : Message de Sylvain (ne peut pas au stade, chez lui, 6h30)
 *
 * Usage :
 *   node patch-all-evals-complete.mjs
 * ═══════════════════════════════════════════════════════════════════════════════════════
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

const PB_URL       = process.env.PB_URL  || 'http://127.0.0.1:8090';
const PB_EMAIL     = process.env.PB_SUPERUSER_EMAIL    || '';
const PB_PASS      = process.env.PB_SUPERUSER_PASSWORD || '';
const AUDIO_COLL   = 'tiptop2_audio';

// ══ ID du cours Évaluation (confirmé par inspection PocketBase) ══
const COURSE_ID = 'utg4lp6nyphwoin';

// ════════════════════════════════════════════════════════════════════
// HELPERS HTML interactifs
// ════════════════════════════════════════════════════════════════════

const DEG = Math.PI / 180;

function audio(url, label) {
  if (!url) return `<div class="info-box">🔊 <em>${label}</em></div>`;
  return `<div class="audio-player-box">
  <div class="audio-label">🔊 ${label}</div>
  <audio controls style="width:100%;margin-top:6px;border-radius:8px">
    <source src="${url}" type="audio/mpeg"/>
  </audio>
</div>`;
}

function beforeListen(questions) {
  return `<div style="background:#fff8e1;border-left:4px solid #FF9500;border-radius:8px;padding:14px 18px;margin:12px 0">
  <div style="font-weight:700;color:#b45309;margin-bottom:8px">📋 Avant d'écouter — Lisez les questions</div>
  <ol style="margin:0;padding-left:1.4rem;color:#444">
    ${questions.map(q => `<li style="margin-bottom:4px">${q}</li>`).join('\n    ')}
  </ol>
</div>`;
}

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

function fieldRow(label, placeholder = '', minWidth = '140px') {
  return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px dashed #e2e8f0">
  <div style="min-width:${minWidth};font-size:0.85rem;font-weight:600;color:#374151">${label}</div>
  <input type="text" placeholder="${placeholder || 'Votre réponse…'}"
    style="flex:1;border:none;border-bottom:2px solid #00274D;padding:4px 6px;
    font-size:0.9rem;outline:none;background:transparent;color:#1e293b">
</div>`;
}

function clock(label, h = null, m = null, isExample = false) {
  const cx = 60, cy = 60;
  let hLine, mLine;
  if (h !== null && m !== null) {
    const hA = ((h % 12) * 30 + m * 0.5 - 90) * DEG;
    const mA = (m * 6 - 90) * DEG;
    hLine = `<line x1="${cx}" y1="${cy}"
      x2="${(cx + 30 * Math.cos(hA)).toFixed(1)}" y2="${(cy + 30 * Math.sin(hA)).toFixed(1)}"
      stroke="${isExample ? '#1d4ed8' : '#00274D'}" stroke-width="4" stroke-linecap="round"/>`;
    mLine = `<line x1="${cx}" y1="${cy}"
      x2="${(cx + 42 * Math.cos(mA)).toFixed(1)}" y2="${(cy + 42 * Math.sin(mA)).toFixed(1)}"
      stroke="${isExample ? '#3b82f6' : '#FF9500'}" stroke-width="3" stroke-linecap="round"/>`;
  } else {
    hLine = `<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy-28}"
      stroke="#ddd" stroke-width="3" stroke-dasharray="4" stroke-linecap="round"/>`;
    mLine = `<line x1="${cx}" y1="${cy}" x2="${cx+40}" y2="${cy}"
      stroke="#ddd" stroke-width="2" stroke-dasharray="4" stroke-linecap="round"/>`;
  }
  const ring = isExample ? '#1d4ed8' : '#00274D';
  const face = isExample ? '#eff6ff' : '#f8fafc';
  const numClr = isExample ? '#1d4ed8' : '#1e293b';
  const dot = isExample ? '#1d4ed8' : '#00274D';
  const svg = `<svg width="120" height="120" viewBox="0 0 120 120">
  <circle cx="${cx}" cy="${cy}" r="56" fill="${face}" stroke="${ring}" stroke-width="${isExample?4:3}"/>
  <circle cx="${cx}" cy="${cy}" r="50" fill="${face}" stroke="#e2e8f0" stroke-width="1"/>
  ${[12,1,2,3,4,5,6,7,8,9,10,11].map((n, i) => {
    const a = (i * 30 - 90) * DEG;
    const r = 42;
    const x = (cx + r * Math.cos(a)).toFixed(1);
    const y = (cy + r * Math.sin(a)).toFixed(1);
    if (![12,3,6,9].includes(n)) return `<circle cx="${x}" cy="${y}" r="2" fill="${ring}" opacity="0.4"/>`;
    return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central"
      font-size="11" font-weight="700" fill="${numClr}">${n}</text>`;
  }).join('\n  ')}
  ${hLine}${mLine}
  <circle cx="${cx}" cy="${cy}" r="4" fill="${dot}"/>
</svg>`;
  const inputOrValue = (h !== null)
    ? `<div style="margin-top:5px;font-weight:700;color:${isExample?'#1d4ed8':'#00274D'};font-size:0.95rem">
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

function objBox(items) {
  return `<div class="lesson-objectives">
  <h4>🎯 Ce que vous évaluez</h4>
  <ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>
</div>`;
}

function vocab(items) {
  return `<div class="rule-box"><div class="rule-icon">🗝️</div><div>
  <strong>Lexique clé</strong>
  <ul style="margin-top:6px">
    ${items.map(([fr,tr]) => `<li><strong>${fr}</strong> <span class="inline-trans">= ${tr}</span></li>`).join('')}
  </ul>
</div></div>`;
}

const sep = `<div style="border-top:2px dashed #e2e8f0;margin:20px 0"></div>`;

function testHeader(num, theme, piste) {
  return `<div class="lesson-badge">📝 Test — Module ${num} (Piste ${piste})</div>
<h2 style="margin-top:8px">Évaluation : ${theme}</h2>`;
}

// Bloc "Écoute et coche la bonne case" — choix image-style en radio
function cocheBonneCase(ns, consigne, choices) {
  return `<div style="background:#f0f9ff;border:2px solid #0ea5e9;border-radius:10px;padding:16px;margin:12px 0">
  <div style="font-weight:700;color:#0c4a6e;margin-bottom:14px">🎯 ${consigne}</div>
  <div style="display:flex;flex-wrap:wrap;gap:12px">
    ${choices.map((c, i) => `
    <label style="flex:1;min-width:130px;border:2px solid #e2e8f0;border-radius:10px;
      padding:14px;text-align:center;cursor:pointer;display:flex;flex-direction:column;
      align-items:center;gap:8px;background:white;font-size:0.9rem;
      transition:border-color .2s">
      <input type="radio" name="${ns}" value="${i}"
        style="width:17px;height:17px;accent-color:#00274D;cursor:pointer">
      <span style="font-size:2rem">${c.emoji}</span>
      <span style="font-weight:600;color:#1e293b">${c.label}</span>
      ${c.sub ? `<span style="font-size:0.78rem;color:#64748b">${c.sub}</span>` : ''}
    </label>`).join('')}
  </div>
</div>`;
}

// ════════════════════════════════════════════════════════════════════
// CONSTRUCTION DES PAGES
// ════════════════════════════════════════════════════════════════════

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
      ['61','📝 Test','L\'heure — 4 heures à identifier'],
      ['62','📝 Test','En ville — la poste'],
      ['63','📝 Test','Sport — le volley au parc'],
      ['64','📝 Test','Santé — mal au pied (rugby)'],
      ['65','📝 Test','Météo — 4 villes françaises'],
      ['66','📝 Test','Vêtements — dans l\'armoire'],
      ['67','🏅 DELF','Épreuve 1 — Entoure le bon dessin'],
      ['68','🏅 DELF','Épreuve 2 — Note le numéro du dialogue'],
      ['69','🏅 DELF','Épreuve 3 — Répondre à des questions (message)'],
    ].map(([n,t,c]) => `<div class="summary-row">
      <div><span class="prep">${n}</span></div><div>${t}</div><div>${c}</div>
    </div>`).join('')}
  </div>
</div>`;

  // ══════════════════════════════════════════════════════════════════
  // PAGE 2 — Piste 61 : L'heure
  // Transcription : "écoute l'heure et note le bon numéro sous les horloges
  //   1. Il est 11h moins le quart  2. Il est 8h15  3. Il est 13h10  4. Il est 9h30"
  // ══════════════════════════════════════════════════════════════════
  const p2 = `${testHeader(1, "L'heure", 61)}
${objBox([
  'Identifier l\'heure à l\'oral',
  'Comprendre "moins le quart", "et quart", "et demie"',
  'Écrire l\'heure en chiffres',
])}
${vocab([
  ['Il est … heures et quart / et demie','It\'s quarter past… / half past…'],
  ['Il est … heures moins le quart','It\'s quarter to…'],
  ['13h = une heure de l\'après-midi','13h00 = 1:00 pm'],
])}

<div style="background:#eff6ff;border:2px solid #3b82f6;border-radius:10px;padding:14px 18px;margin:12px 0">
  <div style="font-weight:700;color:#1d4ed8;margin-bottom:10px">🔵 Exemple de lecture d'horloge</div>
  <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
    ${clock('Exemple : 8h00', 8, 0, true)}
    <div style="font-size:0.9rem;color:#1e3a8a;max-width:280px">
      <p style="margin:0 0 6px"><strong>Aiguille courte (bleue)</strong> → pointe vers le <strong>8</strong></p>
      <p style="margin:0 0 6px"><strong>Aiguille longue (bleue clair)</strong> → pointe vers le <strong>12</strong> = 00 min</p>
      <p style="margin:0;font-weight:700;color:#1d4ed8">✏️ On écrit : <em>8h00</em> — "Il est huit heures."</p>
    </div>
  </div>
</div>

${beforeListen([
  'Il y a 4 heures à identifier.',
  'Attention : "moins le quart" = 15 minutes AVANT l\'heure.',
  'Écrivez l\'heure en chiffres dans le champ sous chaque horloge vide.',
])}
${audio(audioUrls[61],'Piste 61 — L\'heure (4 horloges)')}
${sep}

<h4 style="color:#00274D;margin-bottom:10px">Exercice — Écrivez l'heure que vous entendez</h4>
<p style="font-size:0.88rem;color:#64748b;margin-bottom:8px">
  Tapez l'heure dans le champ sous chaque horloge. Exemple : <strong>8h00</strong>
</p>
<div style="display:flex;flex-wrap:wrap;gap:4px;margin:10px 0;align-items:flex-start">
  ${clock('Horloge 1',null,null,false)}
  ${clock('Horloge 2',null,null,false)}
  ${clock('Horloge 3',null,null,false)}
  ${clock('Horloge 4',null,null,false)}
</div>
${sep}

<h4 style="color:#00274D;margin-bottom:10px">Récapitulatif — Reliez heure orale et heure écrite</h4>
<p style="font-size:0.88rem;color:#64748b;margin-bottom:10px">Tapez la lettre correspondante dans chaque case.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:10px 0">
  <div style="background:#f8fafc;border-radius:8px;padding:12px;border:1px solid #e2e8f0">
    <div style="font-weight:700;color:#00274D;margin-bottom:8px">À l'oral</div>
    ${['A. Il est onze heures moins le quart','B. Il est huit heures et quart','C. Il est treize heures dix','D. Il est neuf heures trente'].map((l,i) =>
      `<div style="padding:6px 0;border-bottom:1px dashed #e2e8f0;font-size:0.88rem">${l}</div>`
    ).join('')}
  </div>
  <div style="background:#f8fafc;border-radius:8px;padding:12px;border:1px solid #e2e8f0">
    <div style="font-weight:700;color:#00274D;margin-bottom:8px">À l'écrit</div>
    ${['9h30','13h10','10h45','8h15'].map((t,i) =>
      `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px dashed #e2e8f0;font-size:0.88rem">
        <strong>${i+1}.</strong> 🕐 ${t}
        <input type="text" maxlength="1" placeholder="_"
          style="width:26px;border:2px solid #00274D;border-radius:4px;text-align:center;
          font-weight:700;font-size:0.9rem;color:#00274D;outline:none;padding:2px;margin-left:auto">
      </div>`
    ).join('')}
  </div>
</div>
${sep}

<div style="background:#fff7ed;border-left:4px solid #FF9500;border-radius:8px;padding:12px 16px;font-size:0.88rem">
  <strong>📌 Les heures de cette piste :</strong>
  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:8px">
    ${[
      ['1','Il est 11h moins le quart','= 10h45'],
      ['2','Il est 8h15','= 8h15'],
      ['3','Il est 13h10','= 13h10 (1h10 pm)'],
      ['4','Il est 9h30','= 9h30'],
    ].map(([n,o,e]) =>
      `<div style="background:white;border-radius:6px;padding:8px 10px;border:1px solid #fed7aa">
        <div style="font-weight:700;color:#c2410c">Horloge ${n}</div>
        <div style="color:#64748b;font-size:0.82rem">${o}</div>
        <div style="font-weight:600;color:#00274D">${e}</div>
      </div>`
    ).join('')}
  </div>
</div>

${scoreBox(8)}
${selfEval([
  'lire et dire l\'heure en français',
  'comprendre "moins le quart", "et quart", "et demie"',
  'convertir heure orale ↔ chiffres',
],'p2')}`;

  // ══════════════════════════════════════════════════════════════════
  // PAGE 3 — Piste 62 : À la poste
  // Transcription : "aujourd'hui je vais 9 rue de la République j'ai une lettre
  //   pour ma grand-mère tu vas à la mairie ? non je vais à la poste à pied"
  // ══════════════════════════════════════════════════════════════════
  const p3 = `${testHeader(2, "En ville — À la poste", 62)}
${objBox([
  'Comprendre une conversation sur un déplacement en ville',
  'Identifier le lieu de destination',
  'Reconnaître le moyen de transport',
  'Comprendre la raison du déplacement',
])}
${vocab([
  ['la poste','the post office'],
  ['la mairie','the town hall'],
  ['à pied','on foot'],
  ['une lettre','a letter'],
  ['ma grand-mère','my grandmother'],
])}
${beforeListen([
  'Où va le personnage ?',
  'Comment y va-t-il ?',
  'Pourquoi y va-t-il ?',
])}
${audio(audioUrls[62],'Piste 62 — Écoute et coche la bonne case')}
${sep}

<h4 style="color:#00274D;margin-bottom:10px">Exercice 1 — Où va-t-il/elle ?</h4>
${cocheBonneCase('p3_lieu',
  'Coche le bon endroit',
  [
    {emoji:'🏛️', label:'La mairie', sub:'Town hall'},
    {emoji:'📮', label:'La poste', sub:'Post office'},
    {emoji:'📚', label:'La bibliothèque', sub:'Library'},
  ]
)}
${sep}

<h4 style="color:#00274D;margin-bottom:10px">Exercice 2 — Comment y va-t-il/elle ?</h4>
${cocheBonneCase('p3_transport',
  'Quel moyen de transport ?',
  [
    {emoji:'🚲', label:'À vélo', sub:'By bike'},
    {emoji:'🚌', label:'En bus', sub:'By bus'},
    {emoji:'🚶', label:'À pied', sub:'On foot'},
  ]
)}
${sep}

<h4 style="color:#00274D;margin-bottom:10px">Exercice 3 — Pourquoi y va-t-il/elle ?</h4>
${cocheBonneCase('p3_raison',
  'Quelle est la raison ?',
  [
    {emoji:'📦', label:'Chercher un colis', sub:'Pick up a parcel'},
    {emoji:'✉️', label:'Envoyer une lettre', sub:'Send a letter (for grandmother)'},
    {emoji:'💰', label:'Retirer de l\'argent', sub:'Withdraw money'},
  ]
)}
${sep}

<h4 style="color:#00274D;margin-bottom:10px">Exercice 4 — Vrai ou Faux</h4>
${vraisFaux('p3vf',[
  'Le personnage va à la mairie.',
  'Le personnage va à la poste.',
  'Le personnage y va à pied.',
  'La lettre est pour sa grand-mère.',
  'La poste est au 9 rue de la République.',
])}
${sep}

${scoreBox(8)}
${selfEval([
  'comprendre un déplacement en ville à l\'oral',
  'identifier un lieu public (la poste)',
  'comprendre le moyen de transport',
  'comprendre la raison d\'un déplacement',
],'p3')}`;

  // ══════════════════════════════════════════════════════════════════
  // PAGE 4 — Piste 63 : Le sport — Marie fait du volley
  // Transcription : "Marie tu viens chez moi après l'école ?
  //   non je ne peux pas je fais du sport je vais faire du volet au parc avec [quelqu'un]"
  // ══════════════════════════════════════════════════════════════════
  const p4 = `${testHeader(3, "Les loisirs — Le sport", 63)}
${objBox([
  'Comprendre une invitation et un refus',
  'Identifier un sport à l\'oral',
  'Comprendre un lieu d\'activité sportive',
  'Reconnaître "je ne peux pas" + raison',
])}
${vocab([
  ['tu viens chez moi ?','are you coming to my place?'],
  ['je ne peux pas','I can\'t'],
  ['je fais du sport','I do sport / I play sport'],
  ['faire du volley','to play volleyball'],
  ['au parc','at the park'],
])}
${beforeListen([
  'Marie accepte-t-elle l\'invitation ?',
  'Quel sport fait-elle ?',
  'Où fait-elle ce sport ?',
])}
${audio(audioUrls[63],'Piste 63 — Écoute et coche la bonne case')}
${sep}

<h4 style="color:#00274D;margin-bottom:10px">Exercice 1 — Marie vient-elle ?</h4>
${cocheBonneCase('p4_reponse',
  'Qu\'est-ce que Marie répond ?',
  [
    {emoji:'✅', label:'Oui, elle vient', sub:'She accepts'},
    {emoji:'❌', label:'Non, elle ne peut pas', sub:'She refuses'},
    {emoji:'🤔', label:'Elle ne sait pas encore', sub:'She doesn\'t know yet'},
  ]
)}
${sep}

<h4 style="color:#00274D;margin-bottom:10px">Exercice 2 — Quel sport fait Marie ?</h4>
${cocheBonneCase('p4_sport',
  'Coche le bon sport',
  [
    {emoji:'⚽', label:'Le football', sub:'Football'},
    {emoji:'🏐', label:'Le volley', sub:'Volleyball ✓'},
    {emoji:'🏊', label:'La natation', sub:'Swimming'},
  ]
)}
${sep}

<h4 style="color:#00274D;margin-bottom:10px">Exercice 3 — Où va-t-elle ?</h4>
${cocheBonneCase('p4_lieu',
  'Coche le bon endroit',
  [
    {emoji:'🏊', label:'À la piscine', sub:'The pool'},
    {emoji:'🌳', label:'Au parc', sub:'The park ✓'},
    {emoji:'🏫', label:'Au gymnase', sub:'The gym'},
  ]
)}
${sep}

<h4 style="color:#00274D;margin-bottom:10px">Exercice 4 — Vrai ou Faux</h4>
${vraisFaux('p4vf',[
  'Marie vient chez son/sa camarade après l\'école.',
  'Marie ne peut pas venir.',
  'Marie fait du football.',
  'Marie fait du volley.',
  'Marie va au parc.',
])}
${sep}

${scoreBox(8)}
${selfEval([
  'comprendre une invitation et un refus',
  'identifier un sport à l\'oral',
  'comprendre "je ne peux pas" + raison',
],'p4')}`;

  // ══════════════════════════════════════════════════════════════════
  // PAGE 5 — Piste 64 : La santé — Mal au pied (rugby)
  // Transcription : "tu as mal ? j'ai mal au pied tu fais du sport ? oui je fais
  //   du rugby tu as le pied cassé demain tu ne vas pas aller à l'école"
  // ══════════════════════════════════════════════════════════════════
  const p5 = `${testHeader(4, "La santé — Mal au pied", 64)}
${objBox([
  'Comprendre une conversation sur la santé',
  'Identifier une partie du corps',
  'Reconnaître une blessure sportive',
  'Comprendre une conséquence (ne pas aller à l\'école)',
])}
${vocab([
  ['j\'ai mal au/à la…','I have a sore…'],
  ['le pied / la tête / le bras / le ventre','foot / head / arm / stomach'],
  ['le pied cassé','broken foot'],
  ['demain','tomorrow'],
  ['tu ne vas pas…','you are not going to…'],
])}
${beforeListen([
  'Où a-t-il mal ?',
  'Quel sport fait-il ?',
  'Qu\'est-ce qu\'il ne peut pas faire demain ?',
])}
${audio(audioUrls[64],'Piste 64 — Écoute et coche la bonne case')}
${sep}

<h4 style="color:#00274D;margin-bottom:10px">Exercice 1 — Où a-t-il mal ?</h4>
${cocheBonneCase('p5_mal',
  'Coche la bonne partie du corps',
  [
    {emoji:'🤕', label:'Il a mal à la tête', sub:'Headache'},
    {emoji:'🦵', label:'Il a mal au pied', sub:'Sore foot ✓'},
    {emoji:'💪', label:'Il a mal au bras', sub:'Sore arm'},
  ]
)}
${sep}

<h4 style="color:#00274D;margin-bottom:10px">Exercice 2 — Quel sport fait-il ?</h4>
${cocheBonneCase('p5_sport',
  'Coche le bon sport',
  [
    {emoji:'🏉', label:'Le rugby', sub:'Rugby ✓'},
    {emoji:'⚽', label:'Le football', sub:'Football'},
    {emoji:'🎾', label:'Le tennis', sub:'Tennis'},
  ]
)}
${sep}

<h4 style="color:#00274D;margin-bottom:10px">Exercice 3 — Qu'est-ce qu'il ne fait pas demain ?</h4>
${cocheBonneCase('p5_demain',
  'Qu\'est-ce qui change demain ?',
  [
    {emoji:'🏃', label:'Il ne fait pas de sport', sub:''},
    {emoji:'🏫', label:'Il ne va pas à l\'école', sub:'✓'},
    {emoji:'🍽️', label:'Il ne mange pas', sub:''},
  ]
)}
${sep}

<h4 style="color:#00274D;margin-bottom:10px">Exercice 4 — Vrai ou Faux</h4>
${vraisFaux('p5vf',[
  'Le personnage a mal à la tête.',
  'Le personnage a mal au pied.',
  'Il fait du football.',
  'Il fait du rugby.',
  'Demain il ne va pas à l\'école.',
])}
${sep}

<h4 style="color:#00274D;margin-bottom:10px">Exercice 5 — Complétez</h4>
<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;line-height:2.2;font-size:0.95rem">
  Le personnage a mal <strong>au/à la</strong>
  <input type="text" placeholder="partie du corps…"
    style="width:100px;border:none;border-bottom:2px solid #00274D;padding:3px 6px;font-size:0.9rem;outline:none;background:transparent;color:#1e293b">.
  Il fait du
  <input type="text" placeholder="sport…"
    style="width:80px;border:none;border-bottom:2px solid #00274D;padding:3px 6px;font-size:0.9rem;outline:none;background:transparent;color:#1e293b">.
  Il a le pied
  <input type="text" placeholder="adjectif…"
    style="width:80px;border:none;border-bottom:2px solid #00274D;padding:3px 6px;font-size:0.9rem;outline:none;background:transparent;color:#1e293b">.
  Demain il ne va pas
  <input type="text" placeholder="lieu…"
    style="width:100px;border:none;border-bottom:2px solid #00274D;padding:3px 6px;font-size:0.9rem;outline:none;background:transparent;color:#1e293b">.
</div>
${sep}

${scoreBox(10)}
${selfEval([
  'nommer les parties du corps en français',
  'exprimer une douleur : "j\'ai mal au/à la…"',
  'comprendre une blessure sportive',
],'p5')}`;

  // ══════════════════════════════════════════════════════════════════
  // PAGE 6 — Piste 65 : La météo — 4 villes françaises
  // Transcription : "aujourd'hui il fait beau à Marseille il y a du soleil à
  //   Strasbourg il n'y a pas de pluie à Paris il fait 20 degrés à Rennes"
  // ══════════════════════════════════════════════════════════════════
  const p6 = `${testHeader(5, "La météo en France", 65)}
${objBox([
  'Comprendre un bulletin météo',
  'Associer une ville à sa météo',
  'Identifier des conditions météorologiques à l\'oral',
  'Reconnaître des températures',
])}
${vocab([
  ['il fait beau','the weather is nice / it\'s sunny'],
  ['il y a du soleil','it\'s sunny'],
  ['il n\'y a pas de pluie','there is no rain'],
  ['il fait 20 degrés','it\'s 20 degrees'],
])}
${beforeListen([
  'Il y a 4 villes françaises dans l\'audio.',
  'Pour chaque ville, notez la météo.',
  'Attention : "il n\'y a pas de pluie" = il ne pleut pas.',
])}
${audio(audioUrls[65],'Piste 65 — Écoute et coche la bonne case')}
${sep}

<h4 style="color:#00274D;margin-bottom:10px">Exercice 1 — Météo par ville</h4>
<p style="font-size:0.88rem;color:#64748b;margin-bottom:10px">Cliquez sur la météo que vous avez entendue pour chaque ville.</p>

${[
  {ville:'🌊 Marseille', ns:'p6_marseille'},
  {ville:'⛪ Strasbourg', ns:'p6_strasbourg'},
  {ville:'🗼 Paris',      ns:'p6_paris'},
  {ville:'🌧️ Rennes',    ns:'p6_rennes'},
].map(({ville, ns}) => `
<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;margin:10px 0">
  <div style="font-weight:700;color:#00274D;margin-bottom:10px">${ville}</div>
  <div style="display:flex;flex-wrap:wrap;gap:10px">
    ${[
      {emoji:'☀️', label:'Il fait beau'},
      {emoji:'🌧️', label:'Il pleut'},
      {emoji:'❄️', label:'Il neige'},
      {emoji:'💨', label:'Il y a du vent'},
      {emoji:'☁️', label:'Il y a des nuages'},
      {emoji:'🌡️', label:'20 degrés'},
    ].map((c,i) => `
    <label style="display:flex;align-items:center;gap:6px;background:white;border:1px solid #e2e8f0;
      border-radius:8px;padding:8px 12px;cursor:pointer;font-size:0.85rem">
      <input type="radio" name="${ns}" value="${i}"
        style="width:15px;height:15px;accent-color:#00274D;cursor:pointer">
      <span>${c.emoji} ${c.label}</span>
    </label>`).join('')}
  </div>
</div>`).join('')}
${sep}

<h4 style="color:#00274D;margin-bottom:10px">Exercice 2 — Tableau récapitulatif</h4>
<div style="overflow-x:auto">
<table style="width:100%;border-collapse:collapse;font-size:0.9rem">
  <tr style="background:#00274D;color:white">
    <th style="padding:9px 14px;text-align:left">Ville</th>
    <th style="padding:9px 14px">Météo entendue</th>
  </tr>
  ${[['🌊','Marseille'],['⛪','Strasbourg'],['🗼','Paris'],['🌧️','Rennes']].map(([e,v],i) =>
    `<tr style="${i%2===0?'background:#f8fafc':''}">
      <td style="padding:9px 14px;border:1px solid #e2e8f0;font-weight:600">${e} ${v}</td>
      <td style="padding:9px 14px;border:1px solid #e2e8f0">
        <input type="text" placeholder="Il fait… / Il y a… / Il pleut…"
          style="width:100%;border:none;border-bottom:1px solid #00274D;
          padding:3px;font-size:0.9rem;outline:none;background:transparent;box-sizing:border-box">
      </td>
    </tr>`
  ).join('')}
</table>
</div>
${sep}

<h4 style="color:#00274D;margin-bottom:10px">Exercice 3 — Vrai ou Faux</h4>
${vraisFaux('p6vf',[
  'Il fait beau à Marseille.',
  'Il y a du soleil à Strasbourg.',
  'Il pleut à Paris.',
  'Il fait 20 degrés à Rennes.',
])}
${sep}

${scoreBox(9)}
${selfEval([
  'comprendre un bulletin météo oral',
  'associer une ville à sa météo',
  'utiliser "il fait…", "il y a…", "il pleut…"',
],'p6')}`;

  // ══════════════════════════════════════════════════════════════════
  // PAGE 7 — Piste 66 : Les vêtements
  // Transcription : "dans mon armoire j'ai mes vêtements préférés
  //   trois robes un jean des chaussures deux pulls et des chaussettes"
  // ══════════════════════════════════════════════════════════════════
  const p7 = `${testHeader(6, "Les vêtements", 66)}
${objBox([
  'Comprendre une liste de vêtements à l\'oral',
  'Associer un vêtement à sa quantité',
  'Identifier des vêtements dans un inventaire',
])}
${vocab([
  ['une robe / des robes','a dress / dresses'],
  ['un jean','a pair of jeans'],
  ['des chaussures','shoes'],
  ['un pull / deux pulls','a sweater / two sweaters'],
  ['des chaussettes','socks'],
  ['une armoire','a wardrobe'],
])}
${beforeListen([
  'Quels vêtements sont dans l\'armoire ?',
  'Combien y en a-t-il pour chaque vêtement ?',
  'Attention aux pluriels et aux quantités !',
])}
${audio(audioUrls[66],'Piste 66 — Écoute et coche la bonne case')}
${sep}

<h4 style="color:#00274D;margin-bottom:10px">Exercice 1 — Vêtements entendus</h4>
<p style="font-size:0.88rem;color:#64748b;margin-bottom:10px">Cochez les vêtements que vous avez entendus ET notez la quantité.</p>
<div style="display:grid;gap:10px;margin:10px 0">
  ${[
    {emoji:'👗',label:'Une robe / des robes'},
    {emoji:'👖',label:'Un jean'},
    {emoji:'👠',label:'Des chaussures'},
    {emoji:'🧥',label:'Un manteau / des manteaux'},
    {emoji:'👕',label:'Un pull / des pulls'},
    {emoji:'🧦',label:'Des chaussettes'},
    {emoji:'👔',label:'Une chemise'},
    {emoji:'🩳',label:'Un short'},
  ].map((v,i) => `
  <div style="display:flex;align-items:center;gap:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 14px">
    <input type="checkbox" style="width:17px;height:17px;accent-color:#00274D;cursor:pointer;flex-shrink:0">
    <span style="font-size:1.4rem">${v.emoji}</span>
    <span style="font-size:0.9rem;font-weight:600;flex:1">${v.label}</span>
    <div style="display:flex;align-items:center;gap:6px;font-size:0.85rem;color:#64748b">
      Quantité :
      <input type="number" min="0" max="20" placeholder="__"
        style="width:40px;border:2px solid #00274D;border-radius:4px;text-align:center;
        font-weight:700;font-size:0.9rem;color:#00274D;outline:none;padding:2px">
    </div>
  </div>`).join('')}
</div>
${sep}

<h4 style="color:#00274D;margin-bottom:10px">Exercice 2 — Vrai ou Faux</h4>
${vraisFaux('p7vf',[
  'Il y a trois robes dans l\'armoire.',
  'Il y a deux jeans.',
  'Il y a des chaussures.',
  'Il y a deux pulls.',
  'Il y a des chaussettes.',
])}
${sep}

<h4 style="color:#00274D;margin-bottom:6px">Exercice 3 — QCM</h4>
${qcm('p7','1','Combien y a-t-il de robes ?',['Une','Deux','Trois','Quatre'])}
${qcm('p7','2','Combien y a-t-il de pulls ?',['Un','Deux','Trois','Quatre'])}
${qcm('p7','3','Où se trouvent les vêtements ?',['Dans le lit','Dans le sac','Dans l\'armoire','Sur la table'])}
${sep}

${scoreBox(10)}
${selfEval([
  'nommer des vêtements en français',
  'utiliser les quantités (un / deux / des)',
  'comprendre une liste de vêtements à l\'oral',
],'p7')}`;

  // ══════════════════════════════════════════════════════════════════
  // PAGE 8 — Piste 67 : DELF Prim Épreuve 1
  // Format : "écoute les messages et entoure le bon dessin"
  // Messages : 1. maths difficile  2. animaux de ferme (poules, vaches, moutons)  + autres
  // ══════════════════════════════════════════════════════════════════
  const p8 = `<div class="lesson-intro">
  <div class="lesson-badge">🏅 DELF Prim — Épreuve 1 (Piste 67)</div>
  <h2>Compréhension de l'oral — Écoute et entoure le bon dessin</h2>
  <p class="lead">Écoutez chaque message et cochez le dessin qui correspond.</p>
</div>
<div class="compare-box">
  <div class="compare-item good">✅ Lisez les choix AVANT d'écouter</div>
  <div class="compare-item special">⚠️ Format officiel DELF Prim — une seule écoute</div>
</div>
${audio(audioUrls[67],'Piste 67 — DELF Prim Épreuve 1')}
${sep}

<h4 style="color:#00274D;margin-bottom:10px">Message 1 — Coche le bon dessin</h4>
<p style="font-size:0.82rem;color:#64748b;margin-bottom:6px;font-style:italic">Indice : quelqu'un parle d'une matière scolaire…</p>
${cocheBonneCase('p8_m1',
  'Quel dessin correspond au message 1 ?',
  [
    {emoji:'🔢', label:'Les mathématiques', sub:'Math — difficile !'},
    {emoji:'⚽', label:'Le sport', sub:''},
    {emoji:'🎨', label:'Les arts plastiques', sub:''},
  ]
)}
${sep}

<h4 style="color:#00274D;margin-bottom:10px">Message 2 — Coche le bon dessin</h4>
<p style="font-size:0.82rem;color:#64748b;margin-bottom:6px;font-style:italic">Indice : des animaux sont mentionnés…</p>
${cocheBonneCase('p8_m2',
  'Quel dessin correspond au message 2 ?',
  [
    {emoji:'🐱', label:'Des animaux domestiques', sub:'Chats, chiens…'},
    {emoji:'🐄', label:'Des animaux de la ferme', sub:'Poules, vaches, moutons'},
    {emoji:'🦁', label:'Des animaux sauvages', sub:'Lion, tigre…'},
  ]
)}
${sep}

<h4 style="color:#00274D;margin-bottom:10px">Messages suivants</h4>
<p style="font-size:0.88rem;color:#64748b;margin-bottom:10px">Cochez l'image correspondante pour chaque message entendu.</p>
${[3,4,5].map(n => cocheBonneCase(`p8_m${n}`,
  `Message ${n} — Quel dessin ?`,
  [
    {emoji:'🏠', label:'Option A', sub:''},
    {emoji:'🎒', label:'Option B', sub:''},
    {emoji:'🌍', label:'Option C', sub:''},
  ]
)).join(sep)}
${sep}

${scoreBox(5)}`;

  // ══════════════════════════════════════════════════════════════════
  // PAGE 9 — Piste 68 : DELF Prim Épreuve 2
  // Format : "Regarde les dessins, écoute les petits dialogues et note le numéro
  //   du dialogue sous l'image correspondante"
  // Dialogue 1 : "Tu veux jouer au foot ? Non, je joue au [basket]"
  // ══════════════════════════════════════════════════════════════════
  const p9 = `<div class="lesson-intro">
  <div class="lesson-badge">🏅 DELF Prim — Épreuve 2 (Piste 68)</div>
  <h2>Compréhension de l'oral — Note le numéro du dialogue</h2>
  <p class="lead">Écoutez les petits dialogues et notez le numéro sous l'image qui correspond.</p>
</div>
<div class="compare-box">
  <div class="compare-item good">✅ Regardez les images AVANT d'écouter</div>
  <div class="compare-item special">⚠️ Concentrez-vous sur le sujet de chaque dialogue</div>
</div>
${audio(audioUrls[68],'Piste 68 — DELF Prim Épreuve 2')}
${sep}

<h4 style="color:#00274D;margin-bottom:10px">Exercice — Notez le numéro du dialogue sous chaque image</h4>
<p style="font-size:0.88rem;color:#64748b;margin-bottom:10px">Tapez 1, 2, 3… dans la case sous l'image qui correspond.</p>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px;margin:10px 0">
  ${[
    {emoji:'⚽', label:'Football / Sport de ballon'},
    {emoji:'🏐', label:'Volleyball / Basket'},
    {emoji:'💃', label:'Danse / Musique'},
    {emoji:'📚', label:'Lecture / École'},
    {emoji:'🎮', label:'Jeux vidéo'},
    {emoji:'🏊', label:'Natation / Piscine'},
  ].map((img,i) =>
    `<div style="border:2px solid #e2e8f0;border-radius:10px;padding:14px;text-align:center;background:#f8fafc">
      <div style="font-size:2.8rem;margin-bottom:6px">${img.emoji}</div>
      <div style="font-size:0.78rem;color:#64748b;margin-bottom:10px">${img.label}</div>
      <input type="number" min="0" max="9" placeholder="N°"
        style="width:42px;height:36px;border:2px solid #00274D;border-radius:6px;text-align:center;
        font-weight:700;font-size:1.1rem;color:#00274D;outline:none">
    </div>`
  ).join('')}
</div>
${sep}

<h4 style="color:#00274D;margin-bottom:10px">Dialogue 1 — Vrai ou Faux</h4>
<p style="font-size:0.82rem;color:#64748b;margin-bottom:6px;font-style:italic">D'après le premier dialogue entendu :</p>
${vraisFaux('p9vf',[
  'Le personnage A veut jouer au foot.',
  'Le personnage B aime le foot.',
  'Le personnage B préfère un autre sport.',
])}
${sep}

${scoreBox(8)}
${selfEval([
  'comprendre de courts dialogues à l\'oral',
  'associer un dialogue à une image',
  'identifier des activités sportives à l\'oral',
],'p9')}`;

  // ══════════════════════════════════════════════════════════════════
  // PAGE 10 — Piste 69 : DELF Prim Épreuve 3
  // Format : "il est trois questions, regarde les dessins, écoute le message
  //   et répond aux questions"
  // Message : "Sylvain, je ne peux pas venir au stade je suis à la maison il est 6h30"
  // ══════════════════════════════════════════════════════════════════
  const p10 = `<div class="lesson-intro">
  <div class="lesson-badge">🏅 DELF Prim — Épreuve 3 (Piste 69)</div>
  <h2>Compréhension d'un message — 3 questions</h2>
  <p class="lead">Écoutez le message et répondez aux 3 questions en cochant la bonne réponse.</p>
</div>
<div class="compare-box">
  <div class="compare-item good">✅ Lisez les 3 questions AVANT d'écouter</div>
  <div class="compare-item special">⚠️ Le message parle de Sylvain et d'un stade</div>
</div>
${audio(audioUrls[69],'Piste 69 — DELF Prim Épreuve 3')}
${sep}

<h4 style="color:#00274D;margin-bottom:4px">🎧 Contexte du message</h4>
<div style="background:#f0f9ff;border-left:4px solid #0ea5e9;border-radius:6px;padding:12px 16px;margin:10px 0;font-size:0.9rem;color:#0c4a6e">
  Quelqu'un laisse un message à <strong>Sylvain</strong>. Il s'excuse de ne pas pouvoir
  venir au <strong>stade</strong>. Il est chez lui, il est <strong>6h30</strong>.
</div>
${sep}

<h4 style="color:#00274D;margin-bottom:6px">Question 1 — Où est la personne ?</h4>
${cocheBonneCase('p10_q1',
  'Où est la personne qui laisse le message ?',
  [
    {emoji:'🏟️', label:'Au stade', sub:'At the stadium'},
    {emoji:'🏠', label:'Chez elle / à la maison', sub:'At home ✓'},
    {emoji:'🏫', label:'À l\'école', sub:'At school'},
  ]
)}
${sep}

<h4 style="color:#00274D;margin-bottom:6px">Question 2 — Quelle heure est-il ?</h4>
${cocheBonneCase('p10_q2',
  'Quelle heure est mentionnée dans le message ?',
  [
    {emoji:'🕕', label:'6h30', sub:'Six heures trente ✓'},
    {emoji:'🕖', label:'7h30', sub:'Sept heures trente'},
    {emoji:'🕒', label:'3h00', sub:'Trois heures'},
  ]
)}
${sep}

<h4 style="color:#00274D;margin-bottom:6px">Question 3 — Pourquoi ne vient-il/elle pas ?</h4>
${cocheBonneCase('p10_q3',
  'Quelle est la raison ?',
  [
    {emoji:'🤒', label:'Il/Elle est malade', sub:''},
    {emoji:'🏠', label:'Il/Elle est à la maison', sub:'Ne peut pas venir ✓'},
    {emoji:'😴', label:'Il/Elle dort', sub:''},
  ]
)}
${sep}

<h4 style="color:#00274D;margin-bottom:10px">Vrai ou Faux — D'après le message</h4>
${vraisFaux('p10vf',[
  'La personne va au stade.',
  'La personne est à la maison.',
  'Il est 6h30 dans le message.',
  'Le message est pour Sylvain.',
])}
${sep}

${scoreBox(7)}
${selfEval([
  'comprendre un message oral court',
  'identifier un lieu et une heure',
  'comprendre une raison/excuse',
],'p10')}`;

  // ── Page 11 : Bilan ─────────────────────────────────────────────
  const p11 = `<div class="lesson-intro">
  <div class="lesson-badge">🏆 Bilan A1.2</div>
  <h2>Mon bilan de compréhension orale</h2>
  <p class="lead">Récapitulatif de vos scores et auto-évaluation globale du niveau A1.2.</p>
</div>

<h4 style="color:#00274D;margin-bottom:10px">📊 Tableau de bord — Mes scores</h4>
<div style="overflow-x:auto">
<table style="width:100%;border-collapse:collapse;font-size:0.9rem">
  <tr style="background:#00274D;color:white">
    <th style="padding:10px 14px;text-align:left">Test / Épreuve</th>
    <th style="padding:10px 14px">Piste</th>
    <th style="padding:10px 14px">Thème réel</th>
    <th style="padding:10px 14px">Score</th>
    <th style="padding:10px 14px">/ Total</th>
  </tr>
  ${[
    ['Test 1','61','L\'heure (4 horloges)','8'],
    ['Test 2','62','À la poste (à pied)','8'],
    ['Test 3','63','Volley au parc (Marie)','8'],
    ['Test 4','64','Santé — mal au pied (rugby)','10'],
    ['Test 5','65','Météo — 4 villes','9'],
    ['Test 6','66','Vêtements — armoire','10'],
    ['DELF 1','67','Entoure le bon dessin','5'],
    ['DELF 2','68','Numéro du dialogue','8'],
    ['DELF 3','69','Message de Sylvain (3 questions)','7'],
  ].map(([m,p,t,tot],i) =>
    `<tr style="${i%2===0?'background:#f8fafc':''}">
      <td style="padding:9px 14px;border:1px solid #e2e8f0;font-weight:600">${m}</td>
      <td style="padding:9px 14px;border:1px solid #e2e8f0;text-align:center">
        <span class="prep">${p}</span>
      </td>
      <td style="padding:9px 14px;border:1px solid #e2e8f0;font-size:0.85rem">${t}</td>
      <td style="padding:9px 14px;border:1px solid #e2e8f0;text-align:center">
        <input type="number" min="0" max="${tot}" placeholder="__"
          style="width:40px;border:2px solid #00274D;border-radius:4px;text-align:center;
          font-weight:700;font-size:0.9rem;color:#00274D;outline:none;padding:2px">
      </td>
      <td style="padding:9px 14px;border:1px solid #e2e8f0;text-align:center;font-weight:700;color:#00274D">/${tot}</td>
    </tr>`
  ).join('')}
  <tr style="background:#00274D;color:white">
    <td colspan="3" style="padding:10px 14px;font-weight:700">TOTAL GÉNÉRAL</td>
    <td style="padding:10px 14px;text-align:center">
      <input type="number" min="0" max="73" placeholder="__"
        style="width:44px;border:2px solid rgba(255,255,255,0.6);border-radius:4px;
        background:rgba(255,255,255,0.15);color:white;text-align:center;
        font-size:1rem;font-weight:700;padding:3px;outline:none">
    </td>
    <td style="padding:10px 14px;text-align:center;font-weight:700">/73</td>
  </tr>
</table>
</div>

<div style="margin:20px 0">
  <div style="font-weight:700;color:#00274D;margin-bottom:12px">🌡️ Interprétation</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px">
    ${[['60–73','🌟 Excellent','Niveau A1.2 maîtrisé','#16a34a'],['50–59','😊 Bon','Quelques points à revoir','#2563eb'],['36–49','🙂 Passable','Révision conseillée','#d97706'],['0–35','😐 À retravailler','Réécoute recommandée','#dc2626']].map(([r,e,d,c]) =>
      `<div style="border-left:4px solid ${c};border-radius:8px;padding:10px 14px;background:#f8fafc">
        <div style="font-weight:700;color:${c}">${e} — ${r}</div>
        <div style="font-size:0.82rem;color:#64748b;margin-top:3px">${d}</div>
      </div>`
    ).join('')}
  </div>
</div>

${selfEval([
  'comprendre l\'heure à l\'oral',
  'comprendre une conversation sur un déplacement',
  'identifier une activité sportive',
  'comprendre une situation de santé',
  'comprendre un bulletin météo',
  'identifier des vêtements et leurs quantités',
  'associer des messages à des images',
],'p11')}

<div style="background:linear-gradient(135deg,#00274D,#003d73);border-radius:12px;padding:18px 22px;color:white;margin:20px 0;text-align:center">
  <div style="font-size:1.3rem;font-weight:700;margin-bottom:8px">🎓 Félicitations !</div>
  <div style="opacity:.9;font-size:0.9rem">Vous avez terminé le module d'évaluation A1.2.<br>
  Continuez à pratiquer en écoutant des dialogues du quotidien !</div>
</div>`;

  return [
    { id: 1,  titre: 'Guide d\'utilisation',                            content: p1  },
    { id: 2,  titre: 'Test 1 — L\'heure (Piste 61)',                    content: p2  },
    { id: 3,  titre: 'Test 2 — À la poste (Piste 62)',                  content: p3  },
    { id: 4,  titre: 'Test 3 — Le sport — Volley (Piste 63)',           content: p4  },
    { id: 5,  titre: 'Test 4 — La santé — Mal au pied (Piste 64)',      content: p5  },
    { id: 6,  titre: 'Test 5 — La météo — 4 villes (Piste 65)',         content: p6  },
    { id: 7,  titre: 'Test 6 — Les vêtements (Piste 66)',               content: p7  },
    { id: 8,  titre: 'DELF Prim — Épreuve 1 — Dessins (Piste 67)',      content: p8  },
    { id: 9,  titre: 'DELF Prim — Épreuve 2 — Dialogues (Piste 68)',    content: p9  },
    { id: 10, titre: 'DELF Prim — Épreuve 3 — Message Sylvain (Piste 69)', content: p10 },
    { id: 11, titre: 'Bilan final A1.2',                                content: p11 },
  ];
}

// ════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════

async function main() {
  const pb = new PocketBase(PB_URL);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log('✅ PocketBase connecté\n');

  // ── Récupération des URLs audio ──────────────────────────────────
  console.log('🔊 Récupération des URLs audio (pistes 61–69)…');
  const audioUrls = {};
  try {
    const allAudios = await pb.collection(AUDIO_COLL).getFullList({ perPage: 500 });
    for (const rec of allAudios) {
      const n = rec.piste_numero;
      if (n >= 61 && n <= 69 && rec.fichier) {
        audioUrls[n] = pb.files.getURL(rec, rec.fichier);
        console.log(`  ✅ Piste ${n} → ${audioUrls[n].split('/').pop()}`);
      }
    }
  } catch (e) {
    console.warn(`  ⚠️  ${AUDIO_COLL} non accessible : ${e.message}`);
  }

  // ── Trouver le cours par ID direct ──────────────────────────────
  let course = null;

  try {
    course = await pb.collection('courses').getOne(COURSE_ID);
    console.log(`📚 Cours trouvé : [${course.id}] ${course.cours_nom}`);
  } catch (e) {
    console.error(`\n❌ Cours introuvable (ID: ${COURSE_ID}) : ${e.message}`);
    process.exit(1);
  }

  // ── Construire et sauvegarder les pages ──────────────────────────
  const pages = buildPages(audioUrls);
  console.log(`\n📄 ${pages.length} pages prêtes.`);

  let currentPages = [];
  try { currentPages = JSON.parse(course.pages || '[]'); } catch {}

  const updatedPages = pages.map(newPage => {
    const existing = currentPages.find(p => p.id === newPage.id) || {};
    return {
      ...existing,
      id:      newPage.id,
      titre:   newPage.titre,
      content: newPage.content,
      type:    existing.type || 'lesson',
    };
  });

  await pb.collection('courses').update(course.id, {
    pages: JSON.stringify(updatedPages),
  });

  console.log('\n✅ SUCCÈS — Toutes les pages ont été mises à jour !');
  console.log(`   Cours ID : ${COURSE_ID}`);
  console.log('   Tests mis à jour :');
  console.log('     p2 → L\'heure (10h45, 8h15, 13h10, 9h30)');
  console.log('     p3 → À la poste à pied — lettre pour grand-mère');
  console.log('     p4 → Marie fait du volley au parc');
  console.log('     p5 → Mal au pied — rugby — pas école demain');
  console.log('     p6 → Météo : Marseille beau / Strasbourg soleil / Paris sans pluie / Rennes 20°');
  console.log('     p7 → Vêtements : 3 robes, 1 jean, chaussures, 2 pulls, chaussettes');
  console.log('     p8 → DELF 1 : messages → dessins (maths, ferme…)');
  console.log('     p9 → DELF 2 : dialogues → images (sports)');
  console.log('     p10→ DELF 3 : message Sylvain (stade, maison, 6h30)');
}

main().catch(e => {
  console.error('❌ Erreur :', e.message);
  process.exit(1);
});
