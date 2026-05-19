/**
 * patch-intro-module1.mjs
 * ═══════════════════════════════════════════════════════════════════
 * Ajoute une page "Introduction" au Module 1 (Tip Top! A1.2)
 * avec les lecteurs audio des pistes 2 et 3 (intro du livre élève).
 *
 *   Piste 2 → Activité 1  — Livre élève p.8
 *   Piste 3 → Activité 4  — Livre élève p.12
 *
 * La page est insérée en 2e position (après le guide/présentation
 * du module, avant la 1re leçon).
 *
 * Usage :
 *   node patch-intro-module1.mjs
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

const PB_URL    = process.env.PB_URL               || 'http://127.0.0.1:8090';
const PB_EMAIL  = process.env.PB_SUPERUSER_EMAIL    || '';
const PB_PASS   = process.env.PB_SUPERUSER_PASSWORD || '';

const MODULE1_ID   = '1yeiteynlt34xrt';
const AUDIO_COLL   = 'tiptop2_audio';

// ── Helper : lecteur audio ───────────────────────────────────────
function audioPlayer(url, label) {
  if (!url) return `<div class="info-box">🔊 <em>${label} — audio non disponible</em></div>`;
  return `<div class="audio-player-box">
  <div class="audio-label">🔊 ${label}</div>
  <audio controls style="width:100%;margin-top:6px;border-radius:8px">
    <source src="${url}" type="audio/mpeg"/>
  </audio>
</div>`;
}

// ── Contenu de la page Introduction ─────────────────────────────
function buildIntroPage(url2, url3) {
  return `<div class="lesson-intro">
  <div class="lesson-badge">🎒 Introduction — Tip Top! A1.2</div>
  <h2>Bienvenue dans la méthode Tip Top !</h2>
  <p class="lead">
    Ces deux activités d'écoute servent d'<strong>entrée en matière</strong>
    avant de commencer les unités. Elles permettent de se familiariser
    avec la voix des personnages et le rythme de la méthode.
  </p>
</div>

<div class="lesson-objectives">
  <h4>🎯 Objectifs de ces écoutes</h4>
  <ul>
    <li>Découvrir les personnages et le contexte de la méthode</li>
    <li>S'habituer à la compréhension orale en français</li>
    <li>Repérer des mots familiers dans un document sonore</li>
  </ul>
</div>

<div class="rule-box">
  <div class="rule-icon">💡</div>
  <div>
    <strong>Comment écouter ?</strong>
    <ol style="margin-top:6px;padding-left:1.2rem">
      <li>Lisez les consignes de votre <em>Livre élève</em> avant d'appuyer sur Lecture.</li>
      <li>Écoutez une première fois en entier sans prendre de notes.</li>
      <li>Rééoutez et notez les mots que vous comprenez.</li>
    </ol>
  </div>
</div>

<div style="border-top:2px dashed #e2e8f0;margin:20px 0"></div>

<h3 style="color:#00274D;margin-bottom:4px">🎧 Piste 2 — Activité 1</h3>
<p style="font-size:0.88rem;color:#64748b;margin-bottom:10px">
  <strong>Livre élève — page 8</strong> · Première activité d'écoute de la méthode.
</p>
${audioPlayer(url2, 'Piste 2 — Activité 1 (p.8)')}

<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 18px;margin:14px 0">
  <p style="margin:0;font-size:0.9rem;color:#374151">
    📖 <strong>Consigne (Livre élève p.8) :</strong>
    Ouvrez votre livre à la page 8 et suivez les instructions de l'Activité 1.
  </p>
</div>

<div style="border-top:2px dashed #e2e8f0;margin:20px 0"></div>

<h3 style="color:#00274D;margin-bottom:4px">🎧 Piste 3 — Activité 4</h3>
<p style="font-size:0.88rem;color:#64748b;margin-bottom:10px">
  <strong>Livre élève — page 12</strong> · Activité de compréhension orale introductive.
</p>
${audioPlayer(url3, 'Piste 3 — Activité 4 (p.12)')}

<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 18px;margin:14px 0">
  <p style="margin:0;font-size:0.9rem;color:#374151">
    📖 <strong>Consigne (Livre élève p.12) :</strong>
    Ouvrez votre livre à la page 12 et suivez les instructions de l'Activité 4.
  </p>
</div>

<div style="border-top:2px dashed #e2e8f0;margin:20px 0"></div>

<div style="background:linear-gradient(135deg,#00274D,#003d73);border-radius:12px;padding:16px 20px;color:white;margin:16px 0;display:flex;align-items:center;gap:14px">
  <span style="font-size:2rem">✅</span>
  <div>
    <div style="font-weight:700">Prêt à commencer ?</div>
    <div style="font-size:0.85rem;opacity:.85;margin-top:3px">
      Passez à la page suivante pour démarrer l'<strong>Unité 1</strong>.
    </div>
  </div>
</div>`;
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  const pb = new PocketBase(PB_URL);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log('✅ PocketBase connecté\n');

  // ── 1. Récupérer les URLs audio des pistes 2 et 3 ───────────────
  console.log('🔊 Recherche des pistes 2 et 3 dans tiptop2_audio…');
  const audioUrls = {};

  for (const num of [2, 3]) {
    try {
      const rec = await pb.collection(AUDIO_COLL).getFirstListItem(
        `piste_numero = ${num}`
      );
      if (rec.fichier) {
        audioUrls[num] = pb.files.getURL(rec, rec.fichier);
        console.log(`  ✅ Piste ${num} → ${audioUrls[num].split('/').pop()}`);
      } else {
        console.warn(`  ⚠️  Piste ${num} trouvée mais sans fichier audio.`);
      }
    } catch {
      console.warn(`  ⚠️  Piste ${num} introuvable dans ${AUDIO_COLL}.`);
    }
  }

  // ── 2. Récupérer les pages actuelles de Module 1 ─────────────────
  console.log('\n📚 Lecture du cours Module 1…');
  const course = await pb.collection('courses').getOne(MODULE1_ID);
  let pages = [];
  try { pages = JSON.parse(course.pages || '[]'); } catch {}
  console.log(`  ${pages.length} pages existantes trouvées.`);

  // ── 3. Vérifier si une page intro existe déjà ───────────────────
  const alreadyExists = pages.some(p =>
    (p.titre || '').toLowerCase().includes('intro') &&
    (p.content || '').includes('Piste 2')
  );
  if (alreadyExists) {
    console.log('\n⚠️  Une page d\'introduction avec la Piste 2 existe déjà — abandon.');
    console.log('   Supprimez-la manuellement dans l\'admin PocketBase avant de relancer.');
    process.exit(0);
  }

  // ── 4. Construire la nouvelle page Introduction ─────────────────
  const introPage = {
    id:      0,                               // sera réattribué ci-dessous
    titre:   'Introduction — Pistes 2 & 3',
    type:    'lesson',
    content: buildIntroPage(audioUrls[2], audioUrls[3]),
  };

  // ── 5. Insérer en 2e position (index 1) ─────────────────────────
  //    Pages existantes :  [p1-guide] [p2-dialogue] [p3-…] …
  //    Résultat attendu : [p1-guide] [INTRO] [p2-dialogue] [p3-…] …
  //
  //    On réattribue les IDs pour garder une séquence propre 1, 2, 3…
  const firstPage  = pages[0] ? [{ ...pages[0], id: 1 }] : [];
  const restPages  = pages.slice(1).map((p, i) => ({ ...p, id: i + 3 }));

  introPage.id = 2;

  const updatedPages = [...firstPage, introPage, ...restPages];

  // ── 6. Sauvegarder ──────────────────────────────────────────────
  await pb.collection('courses').update(MODULE1_ID, {
    pages: JSON.stringify(updatedPages),
  });

  console.log('\n✅ SUCCÈS !');
  console.log(`   Page "Introduction — Pistes 2 & 3" insérée en position 2`);
  console.log(`   Total pages Module 1 : ${updatedPages.length}`);
  console.log('\n   Pistes intégrées :');
  console.log(`   Piste 2 → ${audioUrls[2] ? '✅ URL ok' : '⚠️  URL manquante (piste non uploadée ?)'}`);
  console.log(`   Piste 3 → ${audioUrls[3] ? '✅ URL ok' : '⚠️  URL manquante (piste non uploadée ?)'}`);
}

main().catch(console.error);
