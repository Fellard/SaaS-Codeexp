/**
 * export-tiptop-data.mjs
 * ═══════════════════════════════════════════════════════════════════
 * Exporte les cours d'auto-apprentissage audio (Tip Top! A1.2) et
 * leurs pistes audio (collection tiptop2_audio) depuis PocketBase
 * vers un dossier portable, prêt à être réimporté sur une autre
 * machine via import-tiptop-data.mjs.
 *
 * Produit l'arborescence :
 *   ./tiptop-export/
 *     manifest.json          — métadonnées de l'export (date, source, compteurs)
 *     courses.json           — les cours audio (course_type=audio OU id connu)
 *     tiptop2_audio.json     — les 69 pistes (métadonnées sans le binaire)
 *     audio-files/           — les MP3 nommés "<NN>_<filename>.mp3"
 *
 * Usage :
 *   node export-tiptop-data.mjs
 *   node export-tiptop-data.mjs --out ./mon-dossier
 *
 * Variables d'env (chargées depuis apps/api/.env) :
 *   PB_URL, PB_SUPERUSER_EMAIL, PB_SUPERUSER_PASSWORD
 * ═══════════════════════════════════════════════════════════════════
 */

import 'dotenv/config';
import PocketBase from 'pocketbase';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Chargement .env (compat avec les autres scripts) ─────────────
try {
  const env = readFileSync(join(__dirname, '.env'), 'utf8');
  env.split('\n').forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
} catch {}

const PB_URL   = process.env.PB_URL                || 'http://127.0.0.1:8090';
const PB_EMAIL = process.env.PB_SUPERUSER_EMAIL    || '';
const PB_PASS  = process.env.PB_SUPERUSER_PASSWORD || '';

// ── CLI ──────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const outIdx = argv.indexOf('--out');
const OUT_DIR = (outIdx >= 0 && argv[outIdx + 1])
  ? argv[outIdx + 1]
  : join(__dirname, 'tiptop-export');

// ── Fallback : IDs des 7 cours Tip Top! A1.2 ─────────────────────
//   On les liste pour pouvoir exporter même si course_type
//   n'a pas (encore) été peuplé.
const AUDIO_COURSE_IDS = new Set([
  '1yeiteynlt34xrt',
  'w33cg61a0pho8f6',
  'bkkzo0bslkalmqa',
  'slnu1e8dqpidq8y',
  'tko1h1ocellzf48',
  'prq3piwkn1fflso',
  'utg4lp6nyphwoin',
]);

// ── Helpers ──────────────────────────────────────────────────────
function ensureDir(p) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function safeName(track) {
  const num = String(track.piste_numero ?? '00').padStart(2, '0');
  const file = track.fichier || `piste_${num}.mp3`;
  return `${num}_${file}`;
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  if (!PB_EMAIL || !PB_PASS) {
    console.error('❌ PB_SUPERUSER_EMAIL / PB_SUPERUSER_PASSWORD manquants dans .env');
    process.exit(1);
  }

  const pb = new PocketBase(PB_URL);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log(`✅ PocketBase connecté → ${PB_URL}\n`);

  ensureDir(OUT_DIR);
  const audioDir = join(OUT_DIR, 'audio-files');
  ensureDir(audioDir);

  // ── 1. Cours audio ──────────────────────────────────────────────
  console.log('📚 Récupération des cours audio…');
  const allCourses = await pb.collection('courses').getFullList({ requestKey: null });
  const audioCourses = allCourses.filter(c =>
    c.course_type === 'audio' || AUDIO_COURSE_IDS.has(c.id)
  );
  console.log(`  ${audioCourses.length} cours audio sur ${allCourses.length} cours total.`);

  writeFileSync(
    join(OUT_DIR, 'courses.json'),
    JSON.stringify(audioCourses, null, 2),
    'utf8'
  );

  // ── 2. Pistes audio ─────────────────────────────────────────────
  console.log('\n🎵 Récupération des pistes (tiptop2_audio)…');
  let tracks = [];
  try {
    tracks = await pb.collection('tiptop2_audio').getFullList({
      sort: 'piste_numero',
      requestKey: null,
    });
    console.log(`  ${tracks.length} pistes trouvées.`);
  } catch (e) {
    console.error(`  ⚠️  Collection "tiptop2_audio" inaccessible : ${e.message}`);
    console.error('  → l\'export ne contiendra que les cours.');
  }

  writeFileSync(
    join(OUT_DIR, 'tiptop2_audio.json'),
    JSON.stringify(tracks, null, 2),
    'utf8'
  );

  // ── 3. Téléchargement des MP3 ───────────────────────────────────
  console.log('\n📥 Téléchargement des fichiers MP3…');
  let dlOk = 0, dlSkip = 0, dlErr = 0;

  // Token pour fichiers protégés (au cas où la collection a des règles)
  let fileToken = null;
  try { fileToken = await pb.files.getToken(); } catch { /* public, on s'en passe */ }

  for (const track of tracks) {
    if (!track.fichier) {
      console.log(`  ⚠️  piste #${track.piste_numero} : pas de champ "fichier"`);
      continue;
    }
    const dest = join(audioDir, safeName(track));
    if (existsSync(dest)) {
      console.log(`  ⏭️   ${safeName(track)} (déjà présent)`);
      dlSkip++;
      continue;
    }
    try {
      const url = fileToken
        ? pb.files.getURL(track, track.fichier, { token: fileToken })
        : pb.files.getURL(track, track.fichier);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      writeFileSync(dest, buf);
      console.log(`  ✅ ${safeName(track)}  (${(buf.length / 1024).toFixed(0)} Ko)`);
      dlOk++;
    } catch (e) {
      console.error(`  ❌ piste #${track.piste_numero} : ${e.message}`);
      dlErr++;
    }
  }

  // ── 4. Manifest ─────────────────────────────────────────────────
  const manifest = {
    exported_at:      new Date().toISOString(),
    source_url:       PB_URL,
    courses_count:    audioCourses.length,
    tracks_count:     tracks.length,
    files_downloaded: dlOk,
    files_skipped:    dlSkip,
    files_error:      dlErr,
  };
  writeFileSync(
    join(OUT_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );

  // ── 5. Résumé ──────────────────────────────────────────────────
  console.log('\n─── Résumé ─────────────────────────────────');
  console.log(`  📚 Cours          : ${audioCourses.length}`);
  console.log(`  🎵 Pistes         : ${tracks.length}`);
  console.log(`  📥 MP3 OK         : ${dlOk}`);
  console.log(`  ⏭️  MP3 déjà là   : ${dlSkip}`);
  if (dlErr) console.log(`  ❌ MP3 erreurs    : ${dlErr}`);
  console.log(`  📂 Dossier        : ${OUT_DIR}`);
  console.log('\n✅ Export terminé.');
  console.log('   Transférez le dossier sur l\'autre PC, puis :');
  console.log('     node import-tiptop-data.mjs <chemin-vers-tiptop-export>');
}

main().catch(err => {
  console.error('\n❌ Erreur fatale :', err);
  process.exit(1);
});
