// fix-exam-schema.mjs
// Ajoute la valeur 'exam' au champ select course_type de la collection courses
import 'dotenv/config';
import PocketBase from 'pocketbase';

const PB_URL   = process.env.PB_URL                || 'http://127.0.0.1:8090';
const PB_EMAIL = process.env.PB_SUPERUSER_EMAIL    || '';
const PB_PASS  = process.env.PB_SUPERUSER_PASSWORD || '';

async function main() {
  console.log('🚀 fix-exam-schema.mjs — ajout de course_type=exam');

  const pb = new PocketBase(PB_URL);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log(`Connecté (${PB_URL})`);

  const coll = await pb.send('/api/collections/courses', { method: 'GET' });
  const fields = coll.fields || [];

  const ctField = fields.find(f => f.name === 'course_type');
  if (!ctField) {
    console.log('  [ERREUR] Champ course_type introuvable');
    return;
  }

  const currentValues = ctField.values || [];
  console.log('  Valeurs actuelles de course_type:', currentValues);

  if (currentValues.includes('exam')) {
    console.log('  ✅ "exam" déjà présent — rien à faire');
    return;
  }

  const newValues = [...currentValues, 'exam'];
  ctField.values = newValues;

  await pb.send('/api/collections/courses', {
    method: 'PATCH',
    body: { fields },
  });

  console.log(`  ✅ course_type mis à jour : ${JSON.stringify(newValues)}`);
}

main().catch(e => {
  console.error('Erreur :', e.message);
  process.exit(1);
});
