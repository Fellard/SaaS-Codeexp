// setup-store-checkout.mjs
// Ajoute les champs de livraison manquants à la collection store_orders :
//   client_email, adresse, ville, code_postal, paypal_order_id, paid_at
//
// À lancer UNE SEULE FOIS avant d'utiliser le nouveau checkout.
// node setup-store-checkout.mjs

import 'dotenv/config';
import PocketBase from 'pocketbase';

const PB_URL   = process.env.PB_URL                || 'http://127.0.0.1:8090';
const PB_EMAIL = process.env.PB_SUPERUSER_EMAIL    || '';
const PB_PASS  = process.env.PB_SUPERUSER_PASSWORD || '';

async function main() {
  console.log('🔧 setup-store-checkout.mjs');
  console.log('='.repeat(55));

  const pb = new PocketBase(PB_URL);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log(`Connecté (${PB_URL})\n`);

  // ── Récupérer le schéma actuel de store_orders ──────────────────
  let collection;
  try {
    collection = await pb.send('/api/collections/store_orders', { method: 'GET' });
  } catch (e) {
    console.error('Impossible de trouver la collection store_orders :', e.message);
    process.exit(1);
  }

  const existingFieldNames = (collection.fields || collection.schema || []).map(f => f.name);
  console.log('Champs existants :', existingFieldNames.join(', '));

  // ── Nouveaux champs à ajouter ───────────────────────────────────
  const newFields = [
    { name: 'client_email',    type: 'text',   required: false },
    { name: 'adresse',         type: 'text',   required: false },
    { name: 'ville',           type: 'text',   required: false },
    { name: 'code_postal',     type: 'text',   required: false },
    { name: 'paypal_order_id', type: 'text',   required: false },
    { name: 'paid_at',         type: 'text',   required: false },
  ];

  const toAdd = newFields.filter(f => !existingFieldNames.includes(f.name));

  if (toAdd.length === 0) {
    console.log('\n✅ Tous les champs existent déjà — rien à faire.');
    return;
  }

  console.log(`\nAjout de ${toAdd.length} champs : ${toAdd.map(f => f.name).join(', ')}`);

  // ── Mettre à jour le schéma ─────────────────────────────────────
  const currentSchema = collection.fields || collection.schema || [];
  const updatedSchema = [
    ...currentSchema,
    ...toAdd.map(f => ({
      name:     f.name,
      type:     f.type,
      required: f.required,
      options:  {},
    })),
  ];

  try {
    await pb.send(`/api/collections/store_orders`, {
      method: 'PATCH',
      body: JSON.stringify({ schema: updatedSchema }),
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('\n✅ Schéma mis à jour avec succès !');
    console.log('   Champs ajoutés :', toAdd.map(f => f.name).join(', '));
  } catch (e) {
    // Essai alternatif avec "fields" au lieu de "schema" (PB v0.22+)
    try {
      await pb.send(`/api/collections/store_orders`, {
        method: 'PATCH',
        body: JSON.stringify({ fields: updatedSchema }),
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('\n✅ Schéma mis à jour (via fields) !');
    } catch (e2) {
      console.error('\n⚠️  Mise à jour automatique impossible :', e2.message);
      console.log('\n📋 Ajoute manuellement ces champs dans PocketBase Admin');
      console.log('   → http://127.0.0.1:8090/_/#/collections/store_orders');
      console.log('   Champs à ajouter (type Text) :');
      toAdd.forEach(f => console.log(`   - ${f.name}`));
    }
  }
}

main().catch(e => { console.error('Erreur :', e.message); process.exit(1); });
