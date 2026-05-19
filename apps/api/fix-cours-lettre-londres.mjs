/**
 * fix-cours-lettre-londres.mjs
 *
 * Efface la mauvaise page "Contenu à compléter" du cours
 * "Francais-texte-lettre-de-londres" afin que le PDF s'affiche
 * directement côté étudiant (au lieu du fallback inutile).
 *
 * Usage :
 *   node fix-cours-lettre-londres.mjs
 */

import PocketBase from 'pocketbase';
import { readFileSync } from 'fs';

try {
  const env = readFileSync('.env', 'utf8');
  env.split('\n').forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
} catch {}

const PB_URL   = process.env.PB_URL  || 'http://127.0.0.1:8090';
const PB_EMAIL = process.env.PB_SUPERUSER_EMAIL    || '';
const PB_PASS  = process.env.PB_SUPERUSER_PASSWORD || '';

async function main() {
  console.log('🔧 PocketBase :', PB_URL);
  const pb = new PocketBase(PB_URL);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log('✅ Connecté\n');

  // Cherche tous les cours dont le titre contient "lettre" ou "londres"
  const all = await pb.collection('courses').getFullList({
    sort: '-created',
    $autoCancel: false,
  });

  const targets = all.filter(c => {
    const titre = (c.titre || '').toLowerCase();
    return titre.includes('lettre') || titre.includes('londres') || titre.includes('london');
  });

  if (targets.length === 0) {
    console.log('❌ Aucun cours contenant "lettre" ou "londres" trouvé.');
    console.log('\nCours disponibles :');
    all.slice(0, 10).forEach(c => console.log(`  [${c.id}] ${c.titre}`));
    process.exit(1);
  }

  for (const course of targets) {
    const pagesJson = course.pages || '';
    let pages = [];
    try { pages = JSON.parse(pagesJson); } catch {}

    console.log(`📚 Cours : "${course.titre}" (${course.id})`);
    console.log(`   pages actuelles : ${pages.length} page(s)`);

    // Vérifie si c'est le mauvais fallback (contenu très court / "Contenu à compléter")
    const isFallback = pages.length === 1 &&
      pages[0]?.content?.includes('Contenu à compléter');

    if (isFallback) {
      await pb.collection('courses').update(course.id, {
        pages: '',  // vide → le viewer affichera le PDF
      }, { $autoCancel: false });
      console.log(`✅ Pages fallback effacées. Le PDF s'affichera désormais côté étudiant.\n`);
    } else if (pages.length === 0) {
      console.log(`ℹ️  Aucune page stockée — déjà correct (le PDF s'affiche).\n`);
    } else {
      console.log(`ℹ️  ${pages.length} vraies pages trouvées — aucune modification.\n`);
    }
  }

  console.log('🎓 Rechargez la page étudiant pour voir le PDF.');
}

main().catch(err => {
  console.error('\n❌ Erreur :', err.message);
  console.error('   data :', JSON.stringify(err?.data, null, 2));
  process.exit(1);
});
