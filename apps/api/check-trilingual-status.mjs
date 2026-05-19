// check-trilingual-status.mjs
// Vérifie quels cours français n'ont pas encore d'équivalent EN et/ou AR
// Affiche aussi TOUS les cours EN et AR existants pour repérer les doublons
//
// Usage :  node check-trilingual-status.mjs

import 'dotenv/config';
import PocketBase from 'pocketbase';

const PB_URL   = process.env.PB_URL                || 'http://127.0.0.1:8090';
const PB_EMAIL = process.env.PB_SUPERUSER_EMAIL    || '';
const PB_PASS  = process.env.PB_SUPERUSER_PASSWORD || '';

const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
console.log('✅ Connecté à PocketBase\n');

const all = await pb.collection('courses').getFullList({ requestKey: null });

const fr  = all.filter(c => c.langue === 'Francais' && c.course_type === 'standard');
const en  = all.filter(c => c.langue === 'Anglais');
const ar  = all.filter(c => c.langue === 'Arabe');

// ─── Afficher tous les cours EN ──────────────────────────────────────────────
console.log(`\n${'═'.repeat(70)}`);
console.log(`📘 COURS ANGLAIS (${en.length} total)`);
console.log('═'.repeat(70));
en.forEach(c => console.log(`  [${c.course_type}] [${c.niveau||'?'}]  ${c.titre}`));

// ─── Afficher tous les cours AR ──────────────────────────────────────────────
console.log(`\n${'═'.repeat(70)}`);
console.log(`📗 COURS ARABES (${ar.length} total)`);
console.log('═'.repeat(70));
ar.forEach(c => console.log(`  [${c.course_type}] [${c.niveau||'?'}]  ${c.titre}`));

// ─── Statut EN/AR par cours français ─────────────────────────────────────────
console.log(`\n${'═'.repeat(70)}`);
console.log(`📊 STATUT TRILINGUE — ${fr.length} cours français standard`);
console.log('═'.repeat(70));

// Mots-clés extraits du titre français pour chercher dans EN/AR
function keywords(titre) {
  return titre.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3)
    .slice(0, 4);
}

function fuzzyFind(pool, frTitre) {
  const kws = keywords(frTitre);
  return pool.filter(c => {
    const t = (c.titre || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    return kws.some(k => t.includes(k));
  });
}

let missing = [];
for (const c of fr) {
  const matchEN = fuzzyFind(en, c.titre);
  const matchAR = fuzzyFind(ar, c.titre);
  const enIcon  = matchEN.length ? '✅' : '❌';
  const arIcon  = matchAR.length ? '✅' : '❌';
  console.log(`\n  ${enIcon} EN | ${arIcon} AR | [${c.niveau||'?'}] ${c.titre}`);
  if (matchEN.length) matchEN.forEach(e => console.log(`    🔵 EN trouvé : ${e.titre}`));
  if (matchAR.length) matchAR.forEach(a => console.log(`    🟢 AR trouvé : ${a.titre}`));
  if (!matchEN.length || !matchAR.length) {
    missing.push({ fr: c, hasEN: matchEN.length > 0, hasAR: matchAR.length > 0 });
  }
}

console.log(`\n${'═'.repeat(70)}`);
console.log(`📋 RÉSUMÉ — cours avec traduction manquante`);
console.log('═'.repeat(70));
missing.forEach(m => {
  const manque = [!m.hasEN && 'EN', !m.hasAR && 'AR'].filter(Boolean).join(' + ');
  console.log(`  ❌ ${manque} manquant : ${m.fr.titre} (${m.fr.niveau||'?'})`);
});
if (missing.length === 0) console.log('  🎉 Tous les cours FR ont un équivalent EN et AR !');

process.exit(0);
