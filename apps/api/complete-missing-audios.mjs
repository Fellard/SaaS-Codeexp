#!/usr/bin/env node
/**
 * complete-missing-audios.mjs
 * ═══════════════════════════════════════════════════════════════════
 * Ré-uploade UNIQUEMENT les pistes absentes de la collection
 * `tiptop2_audio`. Idempotent : on peut le relancer sans risque,
 * les pistes déjà présentes sont ignorées.
 *
 * Pré-requis : la migration 1777100000_update_tiptop2_audio_maxsize.js
 * doit avoir été appliquée (sinon les pistes > 5 Mo seront rejetées).
 *
 * Usage :
 *   cd apps/api
 *   node complete-missing-audios.mjs
 * ═══════════════════════════════════════════════════════════════════
 */
import 'dotenv/config';
import PocketBase from 'pocketbase';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const PB_URL    = process.env.PB_URL  || 'http://127.0.0.1:8090';
const PB_EMAIL  = process.env.PB_SUPERUSER_EMAIL    || '';
const PB_PASS   = process.env.PB_SUPERUSER_PASSWORD || '';
const AUDIO_DIR = join(__dirname, 'audio-tiptop2');

// Même carte que setup-tiptop2.mjs — uniquement les champs utiles
const TRACK_MAP = {
  intro:  [
    { n:1,  type:'copyright', titre:'Copyright' },
    { n:2,  type:'activite',  titre:"C'est reparti ! — Activité 1" },
    { n:3,  type:'activite',  titre:"C'est reparti ! — Activité 4" },
  ],
  unite1: [
    { n:4,  type:'dialogue',  titre:'Dialogue' },
    { n:5,  type:'texte',     titre:'Le mail de Maé' },
    { n:6,  type:'texte',     titre:"C'est l'histoire d'une heure" },
    { n:7,  type:'activite',  titre:'Activité 1' },
    { n:8,  type:'activite',  titre:'Activité 2' },
    { n:9,  type:'activite',  titre:'Activité 3' },
    { n:10, type:'chanson',   titre:'Méli-mélodie' },
    { n:11, type:'activite',  titre:'Cahier — Activité 4' },
    { n:12, type:'activite',  titre:'Cahier — Activité 6' },
    { n:13, type:'activite',  titre:'Cahier — Activité 10' },
    { n:14, type:'activite',  titre:'Cahier — Activité 12' },
  ],
  unite2: [
    { n:15, type:'dialogue',  titre:'Dialogue 1' },
    { n:16, type:'dialogue',  titre:'Dialogue 2' },
    { n:17, type:'texte',     titre:'Et où vont-ils ? / Où sont les vélos ?' },
    { n:18, type:'activite',  titre:'Activité 1' },
    { n:19, type:'activite',  titre:'Activité 2' },
    { n:20, type:'activite',  titre:'Activité 3' },
    { n:21, type:'chanson',   titre:'Méli-mélodie' },
    { n:22, type:'activite',  titre:'Cahier — Activité 8' },
    { n:23, type:'activite',  titre:'Cahier — Activité 12' },
  ],
  unite3: [
    { n:24, type:'dialogue',  titre:'Dialogue 1' },
    { n:25, type:'dialogue',  titre:'Dialogue 2' },
    { n:26, type:'texte',     titre:"On va s'amuser !" },
    { n:27, type:'activite',  titre:'Activité 1' },
    { n:28, type:'activite',  titre:'Activité 2' },
    { n:29, type:'chanson',   titre:'Méli-mélodie' },
    { n:30, type:'activite',  titre:'Cahier — Activité 7' },
    { n:31, type:'activite',  titre:'Cahier — Activité 9' },
    { n:32, type:'activite',  titre:'Cahier — Activité 11' },
    { n:33, type:'delf',      titre:'DELF Prim — Exercice 1' },
    { n:34, type:'delf',      titre:'DELF Prim — Exercice 2' },
  ],
  unite4: [
    { n:35, type:'dialogue',  titre:'Dialogue 1' },
    { n:36, type:'dialogue',  titre:'Dialogue 2' },
    { n:37, type:'texte',     titre:'Fais comme moi !' },
    { n:38, type:'activite',  titre:'Activité 1' },
    { n:39, type:'activite',  titre:'Activité 2' },
    { n:40, type:'activite',  titre:'Activité 3' },
    { n:41, type:'chanson',   titre:'Méli-mélodie' },
    { n:42, type:'activite',  titre:'Cahier — Activité 10' },
    { n:43, type:'activite',  titre:'Cahier — Activité 12' },
  ],
  unite5: [
    { n:44, type:'texte',     titre:'Météo' },
    { n:45, type:'dialogue',  titre:'Dialogue' },
    { n:46, type:'texte',     titre:'Les beaux métiers' },
    { n:47, type:'activite',  titre:'Activité 1' },
    { n:48, type:'activite',  titre:'Activité 2' },
    { n:49, type:'chanson',   titre:'Méli-mélodie' },
    { n:50, type:'activite',  titre:'Cahier — Activité 9' },
    { n:51, type:'activite',  titre:'Cahier — Activité 12' },
    { n:52, type:'activite',  titre:'Cahier — Activité 3' },
  ],
  unite6: [
    { n:53, type:'dialogue',  titre:'Dialogue 1' },
    { n:54, type:'dialogue',  titre:'Dialogue 2' },
    { n:55, type:'texte',     titre:"C'est un faux numéro !" },
    { n:56, type:'activite',  titre:'Activité 1' },
    { n:57, type:'chanson',   titre:'Méli-mélodie' },
    { n:58, type:'activite',  titre:'Cahier — Activité 11' },
    { n:59, type:'activite',  titre:'Cahier — Activité 13' },
    { n:60, type:'delf',      titre:'DELF Prim — Étape 1' },
  ],
  tests: [
    { n:61, type:'test', titre:'Test — Unité 1' },
    { n:62, type:'test', titre:'Test — Unité 2' },
    { n:63, type:'test', titre:'Test — Unité 3' },
    { n:64, type:'test', titre:'Test — Unité 4' },
    { n:65, type:'test', titre:'Test — Unité 5' },
    { n:66, type:'test', titre:'Test — Unité 6' },
    { n:67, type:'delf', titre:'DELF Prim — Exercice 1' },
    { n:68, type:'delf', titre:'DELF Prim — Exercice 2' },
    { n:69, type:'delf', titre:'DELF Prim — Exercice 3' },
  ],
};

function fmtMo(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' Mo';
}

async function main() {
  console.log('🎧 complete-missing-audios — pistes manquantes uniquement\n');

  if (!PB_EMAIL || !PB_PASS) {
    console.error('❌ PB_SUPERUSER_EMAIL / PB_SUPERUSER_PASSWORD manquants dans .env');
    process.exit(1);
  }
  if (!existsSync(AUDIO_DIR)) {
    console.error(`❌ Dossier audio introuvable : ${AUDIO_DIR}`);
    process.exit(1);
  }

  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);

  console.log(`🔐 Authentification superuser sur ${PB_URL}…`);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log('✅ Connecté.\n');

  // ── 1. Pistes déjà présentes ───────────────────────────────────
  const existing = await pb.collection('tiptop2_audio').getFullList({ $autoCancel: false });
  const present = new Set(existing.map(r => r.piste_numero));
  console.log(`📊 Pistes déjà en base : ${present.size}`);

  // ── 2. Fichiers MP3 présents sur disque ────────────────────────
  const audioFiles = readdirSync(AUDIO_DIR)
    .filter(f => f.endsWith('.mp3'))
    .sort();

  // ── 3. Détermine les pistes à uploader ─────────────────────────
  const toUpload = [];
  for (const filename of audioFiles) {
    const m = filename.match(/^(\d+)\s/);
    if (!m) continue;
    const n = parseInt(m[1], 10);
    if (present.has(n)) continue;
    toUpload.push({ n, filename });
  }

  if (!toUpload.length) {
    console.log('\n🎉 Rien à faire — toutes les pistes MP3 disponibles sont déjà uploadées.');
    return;
  }

  console.log(`\n🎯 ${toUpload.length} piste(s) à ajouter : ${toUpload.map(t => t.n).join(', ')}\n`);

  const allTracks = Object.values(TRACK_MAP).flat();

  let ok = 0;
  const failures = [];
  for (const { n, filename } of toUpload) {
    const trackMeta = allTracks.find(t => t.n === n);
    if (!trackMeta) {
      console.log(`  ⚠️  Piste ${n} — métadonnées introuvables dans TRACK_MAP, ignorée.`);
      continue;
    }
    const sectionKey = Object.keys(TRACK_MAP).find(k => TRACK_MAP[k].some(t => t.n === n));
    const fullPath = join(AUDIO_DIR, filename);
    const size = statSync(fullPath).size;

    try {
      const fileBuffer = readFileSync(fullPath);
      const fileBlob   = new Blob([fileBuffer], { type: 'audio/mpeg' });
      const formData   = new FormData();
      formData.append('piste_numero', String(n));
      formData.append('titre',        trackMeta.titre);
      formData.append('section',      sectionKey || '');
      formData.append('type_piste',   trackMeta.type);
      formData.append('fichier',      fileBlob, filename);

      const rec = await pb.collection('tiptop2_audio').create(formData, { $autoCancel: false });
      console.log(`  ✅ Piste ${String(n).padStart(2, ' ')} (${fmtMo(size).padStart(8, ' ')}) → ${trackMeta.titre}  [id ${rec.id}]`);
      ok++;
    } catch (e) {
      const reason = e?.response?.data || e.message;
      console.log(`  ❌ Piste ${n} (${fmtMo(size)}) — échec : ${typeof reason === 'string' ? reason : JSON.stringify(reason)}`);
      failures.push({ n, filename, size, reason });
    }
  }

  // ── Récap ──────────────────────────────────────────────────────
  console.log('\n─────────────── Récap ───────────────');
  console.log(`✅ Uploadées : ${ok}`);
  console.log(`❌ Échouées  : ${failures.length}`);

  const after = await pb.collection('tiptop2_audio').getFullList({ $autoCancel: false });
  console.log(`📊 Pistes en base maintenant : ${after.length} / 69`);

  if (failures.length) {
    console.log('\nPistes encore manquantes :');
    for (const f of failures) {
      console.log(`  - Piste ${f.n} (${fmtMo(f.size)}) : ${typeof f.reason === 'string' ? f.reason : JSON.stringify(f.reason)}`);
    }
    console.log('\n💡 Si l\'erreur mentionne la taille maximale, vérifiez que la migration');
    console.log('   1777100000_update_tiptop2_audio_maxsize.js a bien été appliquée.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('\n💥 Erreur fatale :', err);
  process.exit(1);
});
