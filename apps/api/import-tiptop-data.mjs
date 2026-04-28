/**
 * import-tiptop-data.mjs
 * ═══════════════════════════════════════════════════════════════════
 * Importe le dossier produit par export-tiptop-data.mjs dans la
 * PocketBase locale. Idempotent : skip ce qui existe déjà (cours par
 * id, pistes par piste_numero).
 *
 * Usage :
 *   node import-tiptop-data.mjs                     (cherche ./tiptop-export)
 *   node import-tiptop-data.mjs ./tiptop-export
 *   node import-tiptop-data.mjs C:\chemin\absolu\tiptop-export
 *
 * Pré-requis :
 *   - PocketBase doit tourner et avoir appliqué les migrations
 *     (notamment 1777053164_created_tiptop2_audio.js).
 *   - .env doit contenir PB_URL, PB_SUPERUSER_EMAIL, PB_SUPERUSER_PASSWORD.
 * ═══════════════════════════════════════════════════════════════════
 */

import 'dotenv/config';
import PocketBase from 'pocketbase';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Chargement .env ──────────────────────────────────────────────
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

// ── CLI : dossier d'entrée ───────────────────────────────────────
const arg = process.argv[2];
const IN_DIR = arg
  ? (isAbsolute(arg) ? arg : join(process.cwd(), arg))
  : join(__dirname, 'tiptop-export');

if (!existsSync(IN_DIR)) {
  console.error(`❌ Dossier introuvable : ${IN_DIR}`);
  console.error('   Usage : node import-tiptop-data.mjs <chemin-export>');
  process.exit(1);
}

// ── Helpers ──────────────────────────────────────────────────────
async function getKnownFields(name, token) {
  const r = await fetch(`${PB_URL}/api/collections/${name}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await r.json();
  if (!data?.fields) return null;
  return new Set(data.fields.map(f => f.name));
}

// Filtre un objet pour ne garder que les champs reconnus côté cible
function pickKnown(obj, allowed, exclude = []) {
  return Object.fromEntries(
    Object.entries(obj).filter(([k, v]) =>
      allowed.has(k) && !exclude.includes(k) && v !== undefined
    )
  );
}

function safeName(track) {
  const num = String(track.piste_numero ?? '00').padStart(2, '0');
  const file = track.fichier || `piste_${num}.mp3`;
  return `${num}_${file}`;
}

function fdAppend(fd, key, value) {
  if (value === null || value === undefined) {
    fd.append(key, '');
  } else if (typeof value === 'object') {
    fd.append(key, JSON.stringify(value));
  } else {
    fd.append(key, String(value));
  }
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  if (!PB_EMAIL || !PB_PASS) {
    console.error('❌ PB_SUPERUSER_EMAIL / PB_SUPERUSER_PASSWORD manquants dans .env');
    process.exit(1);
  }

  const pb = new PocketBase(PB_URL);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  const token = pb.authStore.token;
  console.log(`✅ PocketBase connecté → ${PB_URL}\n`);

  // ── 1. Manifest ──────────────────────────────────────────────────
  const manifestPath = join(IN_DIR, 'manifest.json');
  if (existsSync(manifestPath)) {
    const m = JSON.parse(readFileSync(manifestPath, 'utf8'));
    console.log(`📋 Export du ${m.exported_at}`);
    console.log(`   Source : ${m.source_url}`);
    console.log(`   ${m.courses_count} cours · ${m.tracks_count} pistes · ${m.files_downloaded} MP3\n`);
  }

  // ── 2. Import des cours ──────────────────────────────────────────
  const coursesPath = join(IN_DIR, 'courses.json');
  if (!existsSync(coursesPath)) {
    console.error(`❌ Fichier introuvable : ${coursesPath}`);
    process.exit(1);
  }
  const coursesData = JSON.parse(readFileSync(coursesPath, 'utf8'));

  const courseFields = await getKnownFields('courses', token);
  if (!courseFields) {
    console.error('❌ Collection "courses" introuvable côté cible.');
    console.error('   → Démarrez PocketBase pour qu\'il applique les migrations, puis relancez.');
    process.exit(1);
  }

  console.log(`📚 Import de ${coursesData.length} cours…`);
  let cOk = 0, cSkip = 0, cErr = 0;
  for (const course of coursesData) {
    try {
      // existe déjà ?
      try {
        await pb.collection('courses').getOne(course.id, { requestKey: null });
        console.log(`  ⏭️   ${course.id} (déjà en base)`);
        cSkip++;
        continue;
      } catch { /* pas trouvé → on crée */ }

      const data = pickKnown(course, courseFields, ['created', 'updated']);
      data.id = course.id;

      await pb.collection('courses').create(data);
      const label = course.cours_nom || course.titre || course.title || '';
      console.log(`  ✅ ${course.id}  ${label}`);
      cOk++;
    } catch (e) {
      console.error(`  ❌ ${course.id} : ${e?.message || e}`);
      if (e?.data) console.error('     ', JSON.stringify(e.data));
      cErr++;
    }
  }

  // ── 3. Import des pistes ─────────────────────────────────────────
  const tracksPath = join(IN_DIR, 'tiptop2_audio.json');
  let tOk = 0, tSkip = 0, tErr = 0, tNoFile = 0;

  if (existsSync(tracksPath)) {
    const tracksData = JSON.parse(readFileSync(tracksPath, 'utf8'));

    if (tracksData.length === 0) {
      console.log('\n🎵 Aucune piste à importer.');
    } else {
      const trackFields = await getKnownFields('tiptop2_audio', token);
      if (!trackFields) {
        console.error('\n❌ Collection "tiptop2_audio" introuvable côté cible.');
        console.error('   → Démarrez PocketBase pour appliquer la migration');
        console.error('     1777053164_created_tiptop2_audio.js, puis relancez.');
        process.exit(1);
      }

      console.log(`\n🎵 Import de ${tracksData.length} pistes…`);
      for (const track of tracksData) {
        try {
          // existe déjà (par piste_numero) ?
          try {
            const existing = await pb.collection('tiptop2_audio')
              .getFirstListItem(`piste_numero = ${track.piste_numero}`, { requestKey: null });
            console.log(`  ⏭️   piste ${track.piste_numero} (déjà en base, ${existing.id})`);
            tSkip++;
            continue;
          } catch { /* pas trouvé → on crée */ }

          // localise le MP3
          const fp = join(IN_DIR, 'audio-files', safeName(track));
          if (!existsSync(fp)) {
            console.error(`  ⚠️  piste ${track.piste_numero} : MP3 manquant (${safeName(track)})`);
            tNoFile++;
            continue;
          }

          // construit le FormData
          const data = pickKnown(track, trackFields, ['created', 'updated', 'fichier']);
          data.id = track.id;

          const buffer = readFileSync(fp);
          const fd = new FormData();
          for (const [k, v] of Object.entries(data)) fdAppend(fd, k, v);
          fd.append(
            'fichier',
            new Blob([buffer], { type: 'audio/mpeg' }),
            track.fichier
          );

          await pb.collection('tiptop2_audio').create(fd);
          console.log(`  ✅ piste ${track.piste_numero}  (${(buffer.length / 1024).toFixed(0)} Ko)`);
          tOk++;
        } catch (e) {
          console.error(`  ❌ piste ${track.piste_numero} : ${e?.message || e}`);
          if (e?.data) console.error('     ', JSON.stringify(e.data));
          tErr++;
        }
      }
    }
  } else {
    console.log('\n🎵 Pas de tiptop2_audio.json dans l\'export — étape sautée.');
  }

  // ── 4. Résumé ────────────────────────────────────────────────────
  console.log('\n─── Résumé ─────────────────────────────────');
  console.log(`  📚 Cours    : ${cOk} importés · ${cSkip} déjà là · ${cErr} erreurs`);
  console.log(`  🎵 Pistes   : ${tOk} importées · ${tSkip} déjà là · ${tErr} erreurs · ${tNoFile} sans MP3`);
  console.log('\n✅ Import terminé. Rechargez votre frontend pour vérifier.');
  if (cErr || tErr) {
    console.log('\n⚠️  Des erreurs sont survenues — relancez le script,');
    console.log('   il sautera ce qui est déjà en base et retentera le reste.');
  }
}

main().catch(err => {
  console.error('\n❌ Erreur fatale :', err);
  process.exit(1);
});
