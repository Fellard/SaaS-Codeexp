/**
 * clean-and-find.js
 * -----------------
 * 1. Supprime TOUS les enregistrements de course_enrollments et course_scores
 * 2. Recherche "Cedric" dans toutes les collections connues
 *
 * Usage : node scripts/clean-and-find.js
 */

const PB_URL  = 'http://localhost:8090';
const EMAIL   = 'admin@iwslaayoune.com';
const PASSWORD = 'IWS2026@!Admin';

// ── Auth ─────────────────────────────────────────────────────────────────────
async function getToken() {
  const res = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: EMAIL, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`Auth failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.token;
}

// ── Get all records from a collection ────────────────────────────────────────
async function getAll(token, collection, page = 1, acc = []) {
  const res = await fetch(
    `${PB_URL}/api/collections/${collection}/records?perPage=200&page=${page}`,
    { headers: { Authorization: token } }
  );
  if (!res.ok) return acc; // collection may not exist
  const data = await res.json();
  acc.push(...(data.items || []));
  if (data.page < data.totalPages) return getAll(token, collection, page + 1, acc);
  return acc;
}

// ── Delete one record ─────────────────────────────────────────────────────────
async function deleteRecord(token, collection, id) {
  const res = await fetch(`${PB_URL}/api/collections/${collection}/records/${id}`, {
    method: 'DELETE',
    headers: { Authorization: token },
  });
  return res.ok;
}

// ── Delete all records in a collection ───────────────────────────────────────
async function deleteAll(token, collection) {
  console.log(`\n🗑️  Suppression de "${collection}"…`);
  const records = await getAll(token, collection);
  if (records.length === 0) {
    console.log(`   (vide — rien à supprimer)`);
    return;
  }
  let ok = 0, fail = 0;
  for (const r of records) {
    const deleted = await deleteRecord(token, collection, r.id);
    deleted ? ok++ : fail++;
  }
  console.log(`   ✅ ${ok} supprimé(s)${fail ? `  ❌ ${fail} échoué(s)` : ''}`);
}

// ── Search for a name across collections ─────────────────────────────────────
async function searchName(token, name) {
  const lc = name.toLowerCase();
  const COLLECTIONS_TO_SEARCH = [
    // (collection, fields à tester)
    ['users',               ['name', 'email', 'username']],
    ['crm_clients',         ['nom', 'email', 'telephone', 'prenom']],
    ['studio_reservations', ['client_name', 'client_nom', 'name', 'nom', 'email', 'client_email']],
    ['web_orders',          ['client_name', 'client_nom', 'name', 'nom', 'email']],
    ['store_orders',        ['client_nom', 'client_name', 'name', 'email']],
    ['orders',              ['client_nom', 'note', 'user_id']],
    ['reservations',        ['client_name', 'client_nom', 'nom', 'email']],
    ['contacts',            ['name', 'nom', 'email', 'message']],
  ];

  console.log(`\n🔍 Recherche de "${name}" dans toutes les collections…\n`);
  let found = false;

  for (const [col, fields] of COLLECTIONS_TO_SEARCH) {
    let records;
    try {
      records = await getAll(token, col);
    } catch {
      continue;
    }
    if (!records.length) continue;

    const matches = records.filter(r =>
      fields.some(f => {
        const val = r[f];
        return val && String(val).toLowerCase().includes(lc);
      })
    );

    if (matches.length > 0) {
      found = true;
      console.log(`📌 Trouvé dans "${col}" (${matches.length} enregistrement(s)) :`);
      for (const m of matches) {
        const display = fields.map(f => m[f] ? `${f}="${m[f]}"` : null).filter(Boolean).join('  ');
        console.log(`   ID: ${m.id}  ${display}`);
      }
    }
  }

  if (!found) {
    console.log(`❌ "${name}" introuvable dans aucune des collections listées.`);
    console.log(`   → Vérifiez dans l'interface PocketBase : http://localhost:8090/_/`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  try {
    console.log('🔐 Connexion à PocketBase…');
    const token = await getToken();
    console.log('✅ Authentifié');

    // ── 1. Supprimer toutes les inscriptions aux cours ──
    console.log('\n═══════════════════════════════════════');
    console.log('  NETTOYAGE DES COURS');
    console.log('═══════════════════════════════════════');
    await deleteAll(token, 'course_enrollments');
    await deleteAll(token, 'course_scores');
    await deleteAll(token, 'recall_sessions');
    await deleteAll(token, 'recall_cards');

    // ── 2. Rechercher Cédric ──
    console.log('\n═══════════════════════════════════════');
    console.log('  LOCALISATION DE CÉDRIC');
    console.log('═══════════════════════════════════════');
    await searchName(token, 'cedric');
    await searchName(token, 'cédric');

    console.log('\n✅ Terminé.');
  } catch (err) {
    console.error('\n❌ Erreur :', err.message);
    process.exit(1);
  }
})();
