/**
 * setup-magasin-collections.mjs
 *
 * 1. Ajoute le champ `buy_price` à la collection `products` (si absent)
 * 2. Crée la collection `store_orders` (commandes des magasins)
 *    avec ses champs : store, section, client_nom, client_tel, items, total, status
 *
 * Usage :
 *   node setup-magasin-collections.mjs
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

const PB_URL   = process.env.PB_URL                || 'http://127.0.0.1:8090';
const PB_EMAIL = process.env.PB_SUPERUSER_EMAIL    || '';
const PB_PASS  = process.env.PB_SUPERUSER_PASSWORD || '';

async function main() {
  console.log('🔧 PocketBase :', PB_URL);
  const pb = new PocketBase(PB_URL);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log('✅ Connecté\n');

  // ── 1. Ajouter buy_price à products ──────────────────────────────────────
  console.log('📦 Vérification de la collection products...');
  try {
    const col = await pb.collections.getOne('products');

    // PocketBase v0.x uses `schema`, v0.22+ uses `fields`
    const rawFields = col.fields || col.schema || [];
    const fields = [...rawFields];

    const hasBuyPrice = fields.some(f => f.name === 'buy_price');

    if (!hasBuyPrice) {
      const newField = {
        name: 'buy_price',
        type: 'number',
        required: false,
        presentable: false,
        system: false,
        // PocketBase v0.22+ uses these directly on the field object:
        min: null,
        max: null,
        // PocketBase < v0.22 wraps them in options:
        options: { min: null, max: null },
      };
      fields.push(newField);

      try {
        await pb.collections.update('products', { fields });
        console.log('✅ Champ buy_price ajouté à products\n');
      } catch {
        // Fallback: essayer avec schema (ancienne API)
        await pb.collections.update('products', {
          schema: fields.map(f => ({
            name: f.name, type: f.type,
            required: f.required || false,
            options: f.options || { min: null, max: null },
          })),
        });
        console.log('✅ Champ buy_price ajouté à products (API v1)\n');
      }
    } else {
      console.log('ℹ️  buy_price existe déjà dans products\n');
    }
  } catch (err) {
    console.warn('⚠️  Impossible de modifier products :', err.message);
    console.warn('   Continuez quand même — le prix d\'achat sera simplement ignoré à la création.');
  }

  // ── 2. Créer store_orders ─────────────────────────────────────────────────
  console.log('🛒 Vérification de la collection store_orders...');
  let alreadyExists = false;
  try {
    await pb.collections.getOne('store_orders');
    alreadyExists = true;
    console.log('ℹ️  store_orders existe déjà\n');
  } catch { /* n'existe pas → on la crée */ }

  if (!alreadyExists) {
    const fields = [
      { name: 'store',      type: 'text',   required: true,  max: 100  },
      { name: 'section',    type: 'text',   required: false, max: 50   },
      { name: 'client_nom', type: 'text',   required: false, max: 200  },
      { name: 'client_tel', type: 'text',   required: false, max: 50   },
      { name: 'items',      type: 'text',   required: false, max: 10000 },
      { name: 'total',      type: 'number', required: false, min: 0    },
      { name: 'status',     type: 'select', required: false,
        values: ['pending', 'paid', 'completed', 'cancelled'],
        maxSelect: 1 },
      { name: 'notes',      type: 'text',   required: false, max: 1000 },
    ];

    try {
      await pb.collections.create({
        name: 'store_orders',
        type: 'base',
        fields,
        listRule:   '@request.auth.id != ""',
        viewRule:   '@request.auth.id != ""',
        createRule: '@request.auth.id != ""',
        updateRule: '@request.auth.id != ""',
        deleteRule: '@request.auth.id != ""',
      });
      console.log('✅ Collection store_orders créée avec succès !\n');
    } catch (err) {
      // Essai avec schema (ancienne API PocketBase)
      try {
        await pb.collections.create({
          name: 'store_orders',
          type: 'base',
          schema: fields.map(f => ({
            name: f.name,
            type: f.type,
            required: f.required || false,
            options: {
              min: f.min ?? null,
              max: f.max ?? null,
              values: f.values ?? [],
              maxSelect: f.maxSelect ?? null,
            },
          })),
          listRule:   '@request.auth.id != ""',
          viewRule:   '@request.auth.id != ""',
          createRule: '@request.auth.id != ""',
          updateRule: '@request.auth.id != ""',
          deleteRule: '@request.auth.id != ""',
        });
        console.log('✅ Collection store_orders créée (API v1) !\n');
      } catch (err2) {
        console.error('❌ Impossible de créer store_orders :', err2.message);
        console.error('   data :', JSON.stringify(err2?.data, null, 2));
      }
    }
  }

  console.log('🎉 Setup terminé ! Vous pouvez utiliser le module Magasin.');
  console.log('   → Gérez les produits et commandes depuis /admin/magasin/laayounemusik ou /admin/magasin/iwstech');
}

main().catch(err => {
  console.error('\n❌ Erreur :', err.message);
  console.error('   data :', JSON.stringify(err?.data, null, 2));
  process.exit(1);
});
