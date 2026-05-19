/**
 * upload-missing-tracks.mjs
 * ═══════════════════════════════════════════════════════════════════
 * Upload les 3 pistes manquantes (26, 37, 55) dans tiptop2_audio.
 *
 * Usage :
 *   node upload-missing-tracks.mjs
 *
 * Les fichiers MP3 doivent être dans apps/api/audio-tiptop2/
 * (le script cherche automatiquement : 26*.mp3, 37*.mp3, 55*.mp3)
 * ═══════════════════════════════════════════════════════════════════
 */

import 'dotenv/config';
import PocketBase from 'pocketbase';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Charger .env manuellement ────────────────────────────────────
try {
  const env = readFileSync(join(__dirname, '.env'), 'utf8');
  env.split('\n').forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
} catch {}

const PB_URL   = process.env.PB_URL                  || 'http://127.0.0.1:8090';
const PB_EMAIL = process.env.PB_SUPERUSER_EMAIL       || '';
const PB_PASS  = process.env.PB_SUPERUSER_PASSWORD    || '';
const AUDIO_DIR = join(__dirname, 'audio-tiptop2');

// ── Métadonnées des pistes à uploader ────────────────────────────
const MISSING = [
  {
    piste_numero: 26,
    titre:        "On va s'amuser !",
    section:      'unite3',
    type_piste:   'texte',
    livre:        'Livre élève',
    page:         29,
    cours_id:     'bkkzo0bslkalmqa',   // Module 3
  },
  {
    piste_numero: 37,
    titre:        'Fais comme moi !',
    section:      'unite4',
    type_piste:   'texte',
    livre:        'Livre élève',
    page:         37,
    cours_id:     'slnu1e8dqpidq8y',   // Module 4
  },
  {
    piste_numero: 55,
    titre:        "C'est un faux numéro !",
    section:      'unite6',
    type_piste:   'texte',
    livre:        'Livre élève',
    page:         53,
    cours_id:     'prq3piwkn1fflso',   // Module 6
  },
];

// ── Trouver un fichier MP3 correspondant au numéro de piste ──────
function findMp3(num) {
  try {
    const files = readdirSync(AUDIO_DIR);
    // Cherche "26*.mp3", "26 *.mp3", "26.mp3" etc.
    const match = files.find(f =>
      f.endsWith('.mp3') && f.startsWith(String(num))
    );
    return match ? join(AUDIO_DIR, match) : null;
  } catch {
    return null;
  }
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  const pb = new PocketBase(PB_URL);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log('✅ PocketBase connecté\n');

  const results = [];

  for (const track of MISSING) {
    console.log(`🎵 Piste ${track.piste_numero} — "${track.titre}"`);

    // 1. Vérifie si la piste existe déjà
    try {
      const existing = await pb.collection('tiptop2_audio').getFirstListItem(
        `piste_numero = ${track.piste_numero}`
      );
      console.log(`  ⚠️  Déjà en base (ID: ${existing.id}) — skip\n`);
      results.push({ n: track.piste_numero, status: 'skipped', id: existing.id });
      continue;
    } catch { /* pas trouvé → on continue */ }

    // 2. Localise le fichier MP3
    const filePath = findMp3(track.piste_numero);
    if (!filePath) {
      console.error(`  ❌ Fichier MP3 introuvable dans ${AUDIO_DIR}`);
      console.error(`     Attendu : ${track.piste_numero}*.mp3\n`);
      results.push({ n: track.piste_numero, status: 'missing_file' });
      continue;
    }
    console.log(`  📂 Fichier : ${filePath.split(/[\\/]/).pop()}`);

    // 3. Upload vers PocketBase
    const buffer = readFileSync(filePath);
    const safeName = `${track.piste_numero}_piste_${track.piste_numero}.mp3`;

    const formData = new FormData();
    formData.append('piste_numero', String(track.piste_numero));
    formData.append('titre',        track.titre);
    formData.append('section',      track.section);
    formData.append('type',         track.type_piste);
    formData.append('livre',        track.livre);
    formData.append('page',         String(track.page));
    formData.append('fichier',      new Blob([buffer], { type: 'audio/mpeg' }), safeName);

    try {
      const rec = await pb.collection('tiptop2_audio').create(formData);
      const url = pb.files.getURL(rec, rec.fichier);
      console.log(`  ✅ Uploadé  → ${url.split('/').pop()}`);
      console.log(`     ID       : ${rec.id}\n`);
      results.push({ n: track.piste_numero, status: 'ok', id: rec.id, url });
    } catch (e) {
      console.error(`  ❌ Erreur upload : ${e.message}\n`);
      results.push({ n: track.piste_numero, status: 'error', error: e.message });
    }
  }

  // ── Résumé ──────────────────────────────────────────────────────
  console.log('─── Résumé ───────────────────────────────────');
  for (const r of results) {
    const icon = r.status === 'ok' ? '✅' : r.status === 'skipped' ? '⚠️ ' : '❌';
    console.log(`  Piste ${r.n} : ${icon} ${r.status}`);
  }

  const allOk = results.every(r => r.status === 'ok' || r.status === 'skipped');
  if (allOk) {
    console.log('\n🎉 Toutes les pistes sont maintenant en base !');
    console.log('   Lancez ensuite : node setup-course-types.mjs');
  } else {
    console.log('\n⚠️  Certaines pistes n\'ont pas pu être uploadées.');
    console.log('   Vérifiez que les MP3 sont dans : apps/api/audio-tiptop2/');
  }
}

main().catch(console.error);
