// fix-cours-nom.mjs
// Corrige le champ cours_nom manquant sur les cours qui en ont besoin
// pour qu'ils apparaissent correctement dans le panneau admin.
//
// Règle :
//   langue = Francais  → cours_nom = 'Français'
//   langue = Anglais   → cours_nom = 'Anglais'
//   langue = Arabe     → cours_nom = 'Arabe'
//
// Usage : node fix-cours-nom.mjs

import 'dotenv/config';
import PocketBase from 'pocketbase';

const PB_URL   = process.env.PB_URL                || 'http://127.0.0.1:8090';
const PB_EMAIL = process.env.PB_SUPERUSER_EMAIL    || '';
const PB_PASS  = process.env.PB_SUPERUSER_PASSWORD || '';

const LANGUE_TO_COURS_NOM = {
  Francais: 'Français',
  Anglais:  'Anglais',
  Arabe:    'Arabe',
};

const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);
await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
console.log('✅ Connecté à PocketBase\n');

const all = await pb.collection('courses').getFullList({ requestKey: null });

let fixed = 0, skipped = 0;

for (const course of all) {
  const expected = LANGUE_TO_COURS_NOM[course.langue];
  if (!expected) { skipped++; continue; }          // langue inconnue
  if (course.cours_nom === expected) { skipped++; continue; } // déjà correct

  try {
    await pb.collection('courses').update(course.id, { cours_nom: expected }, { requestKey: null });
    console.log(`✅ Corrigé : "${course.titre}" → cours_nom = "${expected}"`);
    fixed++;
  } catch (err) {
    console.error(`❌ Erreur sur "${course.titre}" :`, err.message);
  }
}

console.log(`\n📊 ${fixed} cours corrigé(s), ${skipped} déjà OK ou ignorés.`);
process.exit(0);
