/**
 * patch-test1-heure-numero.mjs
 * ═══════════════════════════════════════════════════════════════
 * Corrige UNIQUEMENT la page "Test 1 — Piste 61" du cours
 * "Évaluation orale A1.2 — Tests et DELF Prim"
 *
 * Problème : les exercices précédents ne correspondaient PAS au
 * contenu réel de l'audio (piste 61).
 * L'audio teste : (1) L'HEURE  (2) LES NUMÉROS
 *
 * Ce script remplace la page 2 par des exercices alignés sur
 * l'audio : horloges cliquables + identification de numéros.
 *
 * Usage : node patch-test1-heure-numero.mjs
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
// HELPERS (copiés du script principal, version autonome)
// ════════════════════════════════════════════════════════════════

function audio(url, label) {
  if (!url) return `<div class="info-box">🔊 <em>${label} — audio en cours de chargement.</em></div>`;
  return `<div class="audio-player-box">
  <div class="audio-label">🔊 ${label}</div>
  <audio controls style="width:100%;margin-top:6px;border-radius:8px">
    <source src="${url}" type="audio/mpeg"/>
  </audio>
</div>`;
}

/** Horloge SVG + champ de saisie en dessous */
function clock(label, h = null, m = null, isExample = false) {
  const DEG = Math.PI / 180;
  const cx = 60, cy = 60;
  let hLine, mLine;

  if (h !== null && m !== null) {
    const hA = ((h % 12) * 30 + m * 0.5 - 90) * DEG;
    const mA = (m * 6 - 90) * DEG;
    hLine = `<line x1="${cx}" y1="${cy}"
      x2="${(cx + 30*Math.cos(hA)).toFixed(1)}" y2="${(cy + 30*Math.sin(hA)).toFixed(1)}"
      stroke="${isExample?'#1d4ed8':'#00274D'}" stroke-width="4" stroke-linecap="round"/>`;
    mLine = `<line x1="${cx}" y1="${cy}"
      x2="${(cx + 42*Math.cos(mA)).toFixed(1)}" y2="${(cy + 42*Math.sin(mA)).toFixed(1)}"
      stroke="${isExample?'#3b82f6':'#FF9500'}" stroke-width="3" stroke-linecap="round"/>`;
  } else {
    hLine = `<line x1="${cx}" y1="${cx}" x2="${cx}" y2="${cy-28}"
      stroke="#ddd" stroke-width="3" stroke-dasharray="4" stroke-linecap="round"/>`;
    mLine = `<line x1="${cx}" y1="${cy}" x2="${cx+40}" y2="${cy}"
      stroke="#ddd" stroke-width="2" stroke-dasharray="4" stroke-linecap="round"/>`;
  }

  const ring  = isExample ? '#1d4ed8' : '#00274D';
  const face  = isExample ? '#eff6ff' : '#f8fafc';
  const numC  = isExample ? '#1d4ed8' : '#1e293b';
  const dot   = isExample ? '#1d4ed8' : '#00274D';

  const ticks = [12,1,2,3,4,5,6,7,8,9,10,11].map((n,i) => {
    const a = (i*30-90)*DEG;
    const r = 43;
    const x = (cx+r*Math.cos(a)).toFixed(1);
    const y = (cy+r*Math.sin(a)).toFixed(1);
    if ([12,3,6,9].includes(n))
      return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central"
        font-size="11" font-weight="700" fill="${numC}">${n}</text>`;
    return `<circle cx="${x}" cy="${y}" r="2" fill="${ring}" opacity="0.4"/>`;
  }).join('');

  const inputPart = (h !== null)
    ? `<div style="margin-top:5px;font-weight:700;color:${isExample?'#1d4ed8':'#00274D'};font-size:.9rem">
        ${isExample ? `✏️ Exemple : ${String(h).padStart(2,'0')}h${String(m).padStart(2,'0')}` : `${String(h).padStart(2,'0')}h${String(m).padStart(2,'0')}`}
       </div>`
    : `<input type="text" placeholder="__ h __"
        style="margin-top:6px;width:80px;border:2px solid #00274D;border-radius:6px;
        padding:4px 0;text-align:center;font-size:.9rem;font-weight:700;
        color:#00274D;outline:none;display:block;margin-left:auto;margin-right:auto">`;

  return `<div style="display:inline-block;text-align:center;margin:8px 10px;vertical-align:top">
  <svg width="120" height="120" viewBox="0 0 120 120">
    <circle cx="${cx}" cy="${cy}" r="56" fill="${face}" stroke="${ring}" stroke-width="${isExample?4:3}"/>
    <circle cx="${cx}" cy="${cy}" r="50" fill="${face}" stroke="#e2e8f0" stroke-width="1"/>
    ${ticks}
    ${hLine}${mLine}
    <circle cx="${cx}" cy="${cy}" r="4" fill="${dot}"/>
  </svg>
  <div style="font-size:.77rem;color:#64748b;margin-top:3px;max-width:110px">${label}</div>
  ${inputPart}
</div>`;
}

/** QCM avec vrais radio-buttons */
function qcm(ns, num, question, choices) {
  const name = `${ns}_q${num}`;
  const opts = choices.map((c,i) => `
    <div style="display:flex;align-items:center;gap:9px;margin-bottom:7px">
      <input type="radio" name="${name}" id="${name}_${i}"
        style="width:16px;height:16px;accent-color:#00274D;cursor:pointer;flex-shrink:0">
      <label for="${name}_${i}" style="cursor:pointer;font-size:.9rem">
        <strong>${String.fromCharCode(65+i)}.</strong> ${c}
      </label>
    </div>`).join('');
  return `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;margin:10px 0">
  <div style="font-weight:600;color:#1e293b;margin-bottom:10px">${num}. ${question}</div>
  ${opts}
</div>`;
}

/** Tableau Vrai/Faux avec radio-buttons */
function vraisFaux(ns, items) {
  const rows = items.map((label, i) => `
    <tr>
      <td style="padding:9px 12px;border:1px solid #e2e8f0;font-size:.9rem">${label}</td>
      <td style="padding:9px 12px;border:1px solid #e2e8f0;text-align:center">
        <input type="radio" name="${ns}_${i}" value="vrai"
          style="width:17px;height:17px;accent-color:#16a34a;cursor:pointer">
      </td>
      <td style="padding:9px 12px;border:1px solid #e2e8f0;text-align:center">
        <input type="radio" name="${ns}_${i}" value="faux"
          style="width:17px;height:17px;accent-color:#dc2626;cursor:pointer">
      </td>
    </tr>`).join('');
  return `<div style="overflow-x:auto;margin:12px 0">
  <table style="width:100%;border-collapse:collapse;font-size:.9rem">
    <tr style="background:#00274D;color:white">
      <th style="padding:9px 12px;text-align:left">Proposition</th>
      <th style="padding:9px 12px;min-width:64px">✅ Vrai</th>
      <th style="padding:9px 12px;min-width:64px">❌ Faux</th>
    </tr>
    ${rows}
  </table></div>`;
}

/** Exercice : numéros à identifier — cases radio avec les chiffres */
function numChoice(ns, num, consigne, choices) {
  const name = `${ns}_n${num}`;
  return `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;margin:10px 0">
  <div style="font-weight:600;color:#1e293b;margin-bottom:10px">${num}. ${consigne}</div>
  <div style="display:flex;gap:12px;flex-wrap:wrap">
    ${choices.map((c,i) =>
      `<label style="display:flex;align-items:center;gap:8px;background:white;border:2px solid #e2e8f0;
        border-radius:10px;padding:10px 18px;cursor:pointer;font-size:1.1rem;font-weight:700;color:#00274D;
        transition:all .15s">
        <input type="radio" name="${name}" id="${name}_${i}"
          style="width:16px;height:16px;accent-color:#00274D;cursor:pointer">
        ${c}
      </label>`
    ).join('')}
  </div>
</div>`;
}

/** Bandeau score */
function scoreBox(total) {
  return `<div style="background:linear-gradient(135deg,#00274D,#003d73);border-radius:12px;
  padding:16px 20px;color:white;margin:16px 0;display:flex;align-items:center;
  justify-content:space-between;flex-wrap:wrap;gap:8px">
  <div>
    <div style="font-weight:700">📊 Mon score</div>
    <div style="font-size:.82rem;opacity:.8">1 point par bonne réponse</div>
  </div>
  <div style="display:flex;align-items:center;gap:6px">
    <input type="number" min="0" max="${total}" placeholder="__"
      style="width:52px;border:2px solid rgba(255,255,255,.5);border-radius:6px;
      background:rgba(255,255,255,.1);color:white;text-align:center;font-size:1.3rem;
      font-weight:700;padding:4px;outline:none">
    <span style="font-size:1.3rem;font-weight:700">/ ${total}</span>
  </div>
</div>`;
}

/** Grille auto-évaluation */
function selfEval(skills, ns) {
  const rows = skills.map((s,i) => `
    <tr>
      <td style="padding:8px 12px;border:1px solid #e2e8f0;font-size:.88rem">${s}</td>
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
  <table style="width:100%;border-collapse:collapse;font-size:.88rem">
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

const sep = `<div style="border-top:2px dashed #e2e8f0;margin:20px 0"></div>`;

// ════════════════════════════════════════════════════════════════
// PAGE 2 — TEST 1 : L'HEURE & LES NUMÉROS
// ════════════════════════════════════════════════════════════════

function buildTest1Page(audioUrl) {
  return `<div class="lesson-badge">📝 Test — Module 1 (Piste 61)</div>
<h2 style="margin-top:8px">Évaluation : L'heure &amp; les numéros</h2>

<div class="lesson-objectives">
  <h4>🎯 Ce que vous évaluez</h4>
  <ul>
    <li>Identifier et noter correctement une <strong>heure</strong> entendue à l'oral</li>
    <li>Reconnaître et noter un <strong>numéro</strong> parmi plusieurs propositions</li>
    <li>Comprendre des informations chiffrées dans un contexte scolaire</li>
  </ul>
</div>

<div class="rule-box"><div class="rule-icon">🗝️</div><div>
  <strong>Lexique clé — L'heure à l'école</strong>
  <ul style="margin-top:6px">
    <li><strong>Il est huit heures</strong> <span class="inline-trans">= It is 8 o'clock</span></li>
    <li><strong>Il est huit heures et demie</strong> <span class="inline-trans">= It is 8:30</span></li>
    <li><strong>Il est neuf heures moins le quart</strong> <span class="inline-trans">= It is 8:45</span></li>
    <li><strong>Il est midi</strong> <span class="inline-trans">= It is noon / 12:00</span></li>
    <li><strong>un numéro / un chiffre</strong> <span class="inline-trans">= a number / a digit</span></li>
    <li><strong>le numéro de la piste</strong> <span class="inline-trans">= the track number</span></li>
  </ul>
</div></div>

<!-- Horloge bleue EXEMPLE intégrée dans la consigne -->
<div style="background:#eff6ff;border:2px solid #3b82f6;border-radius:10px;padding:14px 18px;margin:14px 0">
  <div style="font-weight:700;color:#1d4ed8;margin-bottom:10px">🔵 Comment lire une horloge</div>
  <div style="display:flex;align-items:flex-start;gap:20px;flex-wrap:wrap">
    ${clock('Exemple : 8h00', 8, 0, true)}
    <div style="font-size:.9rem;color:#1e3a8a;max-width:300px;padding-top:8px">
      <p style="margin:0 0 8px">
        <strong>Aiguille courte (bleu foncé)</strong> → pointe vers le <strong>8</strong> = l'heure
      </p>
      <p style="margin:0 0 8px">
        <strong>Aiguille longue (bleu clair)</strong> → pointe vers le <strong>12</strong> = 00 minutes
      </p>
      <p style="margin:0 0 8px;font-weight:700;color:#1d4ed8">
        ✏️ On lit : <em>"Il est huit heures."</em> → on écrit <strong>8h00</strong>
      </p>
      <div style="background:#dbeafe;border-radius:6px;padding:8px;font-size:.82rem;color:#1e40af">
        💡 Pour les horloges vides ci-dessous : tapez l'heure dans le champ sous chaque horloge après l'écoute.
      </div>
    </div>
  </div>
</div>

<div style="background:#fff8e1;border-left:4px solid #FF9500;border-radius:8px;padding:14px 18px;margin:12px 0">
  <div style="font-weight:700;color:#b45309;margin-bottom:8px">📋 Avant d'écouter — Lisez les consignes</div>
  <ol style="margin:0;padding-left:1.4rem;color:#444">
    <li style="margin-bottom:4px">Repérez les horloges : vous devrez noter <strong>l'heure entendue</strong> dans le champ sous chaque horloge.</li>
    <li style="margin-bottom:4px">Repérez les exercices de numéros : vous devrez <strong>cocher le bon numéro</strong> parmi les propositions.</li>
    <li style="margin-bottom:4px">Écoutez <strong>attentivement les chiffres</strong> — ne confondez pas 15 et 50, 16 et 60, etc.</li>
  </ol>
</div>

${audio(audioUrl, 'Piste 61 — Évaluation Module 1')}

${sep}

<!-- ═══ EXERCICE 1 : L'HEURE ═══ -->
<h4 style="color:#00274D;margin-bottom:6px">
  Exercice 1 — Écrivez l'heure entendue
  <span style="font-size:.8rem;font-weight:400;color:#64748b"> (tapez l'heure dans le champ sous l'horloge)</span>
</h4>
<p style="color:#64748b;font-size:.88rem;margin-bottom:10px">
  Écoutez l'audio. Pour chaque son de cloche ou annonce horaire, notez l'heure dans le champ correspondant.
</p>

<div style="display:flex;flex-wrap:wrap;gap:4px;margin:10px 0;align-items:flex-start">
  ${clock('Heure 1', null, null, false)}
  ${clock('Heure 2', null, null, false)}
  ${clock('Heure 3', null, null, false)}
  ${clock('Heure 4', null, null, false)}
  ${clock('Heure 5', null, null, false)}
</div>

<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:10px 14px;margin:8px 0;font-size:.85rem;color:#166534">
  💡 <strong>Astuce :</strong> Si vous entendez <em>"et demie"</em> → notez <strong>h30</strong>. Si vous entendez <em>"et quart"</em> → notez <strong>h15</strong>. Si vous entendez <em>"moins le quart"</em> → notez <strong>h45</strong>.
</div>

${sep}

<!-- ═══ EXERCICE 2 : LES NUMÉROS ═══ -->
<h4 style="color:#00274D;margin-bottom:6px">
  Exercice 2 — Cochez le bon numéro
  <span style="font-size:.8rem;font-weight:400;color:#64748b"> (sélectionnez le numéro que vous entendez)</span>
</h4>
<p style="color:#64748b;font-size:.88rem;margin-bottom:10px">
  Écoutez l'audio. Cochez le numéro que vous entendez parmi les propositions.
</p>

${numChoice('t1n','1','Numéro entendu :',['13','30','3'])}
${numChoice('t1n','2','Numéro entendu :',['15','50','5'])}
${numChoice('t1n','3','Numéro entendu :',['16','60','6'])}
${numChoice('t1n','4','Numéro entendu :',['14','40','4'])}
${numChoice('t1n','5','Numéro entendu :',['17','70','7'])}

<div style="background:#fff8e1;border-radius:6px;padding:10px 14px;margin-top:8px;font-size:.85rem;color:#92400e">
  ⚠️ <strong>Attention aux confusions courantes :</strong>
  <span style="display:inline-block;margin-top:4px">
    <strong>13</strong> (treize) ≠ <strong>30</strong> (trente) &nbsp;·&nbsp;
    <strong>14</strong> (quatorze) ≠ <strong>40</strong> (quarante) &nbsp;·&nbsp;
    <strong>15</strong> (quinze) ≠ <strong>50</strong> (cinquante) &nbsp;·&nbsp;
    <strong>16</strong> (seize) ≠ <strong>60</strong> (soixante)
  </span>
</div>

${sep}

<!-- ═══ EXERCICE 3 : VRAI / FAUX (contextuel) ═══ -->
<h4 style="color:#00274D;margin-bottom:10px">
  Exercice 3 — Vrai ou Faux
  <span style="font-size:.8rem;font-weight:400;color:#64748b"> (cliquez sur la bonne case)</span>
</h4>
${vraisFaux('t1vf',[
  'L\'audio mentionne une heure ronde (sans minutes).',
  'Un numéro supérieur à 50 est prononcé dans l\'audio.',
  'L\'heure de midi (12h00) est mentionnée.',
  'Tous les numéros entendus sont inférieurs à 20.',
  'L\'audio utilise "et demie" pour exprimer 30 minutes.',
])}

${sep}

<!-- ═══ EXERCICE 4 : MISE EN SITUATION ═══ -->
<h4 style="color:#00274D;margin-bottom:10px">Exercice 4 — Complétez le tableau</h4>
<p style="color:#64748b;font-size:.88rem;margin-bottom:10px">
  Après l'écoute, complétez ce tableau avec les informations entendues.
</p>
<div style="overflow-x:auto">
<table style="width:100%;border-collapse:collapse;font-size:.9rem">
  <tr style="background:#00274D;color:white">
    <th style="padding:9px 12px;text-align:left">Numéro de l'exercice audio</th>
    <th style="padding:9px 12px;text-align:left">Ce que vous entendez</th>
    <th style="padding:9px 12px;text-align:left">Heure / Numéro</th>
  </tr>
  ${[1,2,3,4,5].map((n,i) =>
    `<tr style="${i%2===0?'':'background:#f8fafc'}">
      <td style="padding:9px 12px;border:1px solid #e2e8f0;font-weight:600;text-align:center">${n}</td>
      <td style="padding:9px 12px;border:1px solid #e2e8f0">
        <input type="text" placeholder="Description courte…"
          style="width:100%;border:none;border-bottom:2px solid #00274D;padding:3px 4px;
          font-size:.88rem;outline:none;background:transparent;box-sizing:border-box">
      </td>
      <td style="padding:9px 12px;border:1px solid #e2e8f0">
        <input type="text" placeholder="__ h __ / numéro __"
          style="width:100%;border:none;border-bottom:2px solid #00274D;padding:3px 4px;
          font-size:.88rem;outline:none;background:transparent;box-sizing:border-box">
      </td>
    </tr>`
  ).join('')}
</table>
</div>

${sep}
${scoreBox(15)}

${selfEval([
  'identifier une heure entendue à l\'oral et la noter correctement',
  'distinguer les nombres confusants (13/30, 15/50, 16/60…)',
  'comprendre des informations chiffrées dans un contexte scolaire',
  'compléter un tableau à partir d\'une écoute',
],'t1ae')}`;
}

// ════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════

async function main() {
  console.log('🔧 patch-test1-heure-numero — Correction ciblée page "Test 1"\n');

  if (!PB_EMAIL || !PB_PASS) { console.error('❌ Identifiants .env manquants'); process.exit(1); }

  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);
  console.log(`🔐 Connexion ${PB_URL}…`);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log('✅ Connecté.\n');

  // ── Récupérer l'URL audio de la piste 61 ──────────────────────
  console.log('🎵 Chargement URL piste 61…');
  let audioUrl61 = null;
  try {
    const recs = await pb.collection('tiptop2_audio').getFullList({
      filter: 'piste_numero=61', $autoCancel:false
    });
    if (recs.length && recs[0].fichier) {
      audioUrl61 = `${PB_URL}/api/files/tiptop2_audio/${recs[0].id}/${recs[0].fichier}`;
      console.log(`   ✅ URL trouvée : ${audioUrl61}\n`);
    } else {
      console.log('   ⚠️  Piste 61 introuvable ou sans fichier.\n');
    }
  } catch (e) { console.log(`   ⚠️  ${e.message}\n`); }

  // ── Trouver le cours ─────────────────────────────────────────
  console.log(`📚 Recherche du cours "${COURSE_TITLE}"…`);
  let course = null;
  try {
    course = await pb.collection('courses').getFirstListItem(
      `titre="${COURSE_TITLE}"`, { $autoCancel:false }
    );
    console.log(`   ✅ Trouvé — id: ${course.id}\n`);
  } catch {
    console.error('   ❌ Cours introuvable. Lancez d\'abord patch-evals-pro.mjs.');
    process.exit(1);
  }

  // ── Lire les pages existantes ─────────────────────────────────
  const pages = JSON.parse(course.pages || '[]');
  console.log(`📄 ${pages.length} pages trouvées dans le cours.\n`);

  // ── Remplacer la page 2 (id:2 = Test 1) ─────────────────────
  const page2Index = pages.findIndex(p => p.id === 2 || p.title?.includes('Test 1'));
  if (page2Index === -1) {
    console.error('❌ Page "Test 1" introuvable dans le cours.');
    process.exit(1);
  }

  console.log(`🔄 Remplacement de la page "${pages[page2Index].title}" (index ${page2Index})…`);
  pages[page2Index] = {
    id: 2,
    title: 'Test 1 — L\'heure & les numéros',
    content: buildTest1Page(audioUrl61),
  };
  console.log('   ✅ Contenu mis à jour.\n');

  // ── Sauvegarder ──────────────────────────────────────────────
  const record = await pb.collection('courses').update(course.id, {
    pages: JSON.stringify(pages),
  }, { $autoCancel:false });

  console.log(`🎉 Page "Test 1" corrigée avec succès !`);
  console.log(`   Exercices : horloges (5) + numéros à cocher (5) + Vrai/Faux (5) + tableau (5)`);
  console.log(`   Score total : 15 points\n`);
  console.log(`   🔗 http://localhost:3000/etudiant/dashboard/courses/${record.id}/view`);
  console.log(`\n💡 Si le contenu de l'audio diffère (nb d'heures, types de numéros),`);
  console.log(`   dites-moi et j'adapterai les exercices au plus précis.\n`);
}

main().catch(err => {
  console.error('\n💥 Erreur :', err.message);
  console.error(JSON.stringify(err?.data, null, 2));
  process.exit(1);
});
