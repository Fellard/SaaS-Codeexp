// list-originals.mjs — liste les cours à upgrader (Phase 1)
import 'dotenv/config';
import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.PB_URL || 'http://127.0.0.1:8090');
await pb.collection('_superusers').authWithPassword(
  process.env.PB_SUPERUSER_EMAIL, process.env.PB_SUPERUSER_PASSWORD
);

const all = await pb.collection('courses').getFullList({
  filter: 'course_type = "standard"',
  sort: '+langue,+created',
  fields: 'id,titre,langue,pages,exercises',
  requestKey: null
});

const originals = [];
const upgraded  = [];

for (const c of all) {
  const exs = JSON.parse(c.exercises || '[]');
  const pgs = JSON.parse(c.pages     || '[]');
  const hasUpgrade = exs.some(e => e.type === 'fill' || e.type === 'order' || e.type === 'vf');
  const entry = { id: c.id, titre: c.titre, langue: c.langue, pages: pgs.length, exercises: exs.length };
  if (hasUpgrade) upgraded.push(entry);
  else            originals.push(entry);
}

console.log('\n' + '='.repeat(70));
console.log('COURS ORIGINAUX a upgrader (Phase 1) — ' + originals.length + ' cours');
console.log('='.repeat(70));
originals.forEach((c, i) => {
  const lang = c.langue.substring(0, 2).toUpperCase();
  console.log(String(i+1).padStart(2) + '. [' + lang + '] "' + c.titre + '" | ' + c.pages + 'p / ' + c.exercises + 'q');
});

console.log('\n' + '='.repeat(70));
console.log('COURS DEJA UPGRADES — ' + upgraded.length + ' cours');
console.log('='.repeat(70));
upgraded.forEach((c, i) => {
  const lang = c.langue.substring(0, 2).toUpperCase();
  console.log(String(i+1).padStart(2) + '. [' + lang + '] "' + c.titre + '" | ' + c.pages + 'p / ' + c.exercises + 'q');
});

console.log('\nTotal standard : ' + all.length + ' | A upgrader : ' + originals.length + ' | Deja fait : ' + upgraded.length);
