/**
 * add-pages-field.mjs
 * Ajoute le champ `pages` (text) à la collection `courses` dans PocketBase.
 * Ce champ stocke les leçons structurées extraites d'un PDF (JSON array).
 *
 * Usage: node add-pages-field.mjs
 * Prérequis: PocketBase en cours d'exécution sur http://localhost:8090
 */

import 'dotenv/config';
import Pocketbase from 'pocketbase';

const PB_URL      = process.env.POCKETBASE_URL || 'http://localhost:8090';
const PB_EMAIL    = process.env.PB_SUPERUSER_EMAIL    || 'admin@iwslaayoune.com';
const PB_PASSWORD = process.env.PB_SUPERUSER_PASSWORD || 'IWS2026@!Admin';

const pb = new Pocketbase(PB_URL);

async function main() {
  console.log('🔐 Connexion à PocketBase...');
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASSWORD);
  console.log('✅ Connecté');

  // ── Récupérer le schéma actuel de la collection courses ──
  console.log('\n📋 Récupération du schéma de la collection courses...');
  const token = pb.authStore.token;

  const getRes = await fetch(`${PB_URL}/api/collections/courses`, {
    headers: { 'Authorization': token },
  });

  if (!getRes.ok) {
    const errBody = await getRes.json().catch(() => ({}));
    console.error(`❌ Impossible de récupérer la collection courses (HTTP ${getRes.status}) :`, errBody.message || JSON.stringify(errBody));
    process.exit(1);
  }

  const schema = await getRes.json();
  console.log(`   Champs actuels : ${schema.fields?.map(f => f.name).join(', ')}`);

  // ── Vérifier si `pages` existe déjà ──
  const alreadyExists = schema.fields?.some(f => f.name === 'pages');
  if (alreadyExists) {
    console.log('\n✅ Le champ `pages` existe déjà dans la collection courses.');
    return;
  }

  // ── Ajouter le champ `pages` ──
  console.log('\n➕ Ajout du champ `pages` (text)...');
  // PocketBase v0.23+ : pas d'objet `options` imbriqué pour les champs text
  const newFields = [
    ...schema.fields,
    {
      name:     'pages',
      type:     'text',
      required: false,
    },
  ];

  const patchRes = await fetch(`${PB_URL}/api/collections/courses`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
    body: JSON.stringify({ fields: newFields }),
  });

  const result = await patchRes.json();

  if (!patchRes.ok) {
    console.error('❌ Erreur lors de la mise à jour :', result.message || JSON.stringify(result));
    process.exit(1);
  }

  const fieldNames = result.fields?.map(f => f.name);
  if (fieldNames?.includes('pages')) {
    console.log('✅ Champ `pages` ajouté avec succès !');
    console.log(`   Champs maintenant disponibles : ${fieldNames.join(', ')}`);
  } else {
    console.warn('⚠️ Le champ `pages` n\'apparaît pas dans la réponse. Vérifiez manuellement.');
    console.log('   Champs dans la réponse :', fieldNames?.join(', '));
  }
}

main().catch(err => {
  console.error('❌ Erreur fatale :', err.message);
  process.exit(1);
});
