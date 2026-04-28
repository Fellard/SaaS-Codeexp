/**
 * security.pb.js
 * Hook PocketBase — Protection des champs sensibles
 *
 * INSTALLATION :
 *   Copier ce fichier dans : apps/pocketbase/pb_hooks/security.pb.js
 *   Redémarrer PocketBase (le dossier pb_hooks est chargé automatiquement).
 *
 * PROTECTIONS INCLUSES :
 *   [users] Création  : force role="etudiant", approved=false, emailVerified=false
 *   [users] Update    : bloque la modification de role/approved/emailVerified par les non-admins
 *   [users] Vérification : synchronise emailVerified avec le champ natif verified
 *   [orders] Création : force user_id = utilisateur connecté (anti-spoofing)
 */

// ═══════════════════════════════════════════════════════════════════
// USERS — Création : forcer les valeurs par défaut des champs sensibles
// ═══════════════════════════════════════════════════════════════════
onRecordCreateRequest((e) => {
  if (e.record.collection().name !== "users") {
    return e.next();
  }

  // Écrase les champs sensibles peu importe ce que l'utilisateur envoie
  e.record.set("role", "etudiant");
  e.record.set("approved", false);
  e.record.set("emailVerified", false);
  // emailVisibility désactivée par défaut (protection vie privée)
  e.record.set("emailVisibility", false);

  return e.next();
});

// ═══════════════════════════════════════════════════════════════════
// USERS — Mise à jour : bloquer la modification de champs sensibles
// ═══════════════════════════════════════════════════════════════════
onRecordUpdateRequest((e) => {
  if (e.record.collection().name !== "users") {
    return e.next();
  }

  const info = e.requestInfo();
  const auth = info.auth;
  const body = info.body || {};

  if (!auth) {
    throw new BadRequestError("Authentification requise.");
  }

  const isAdmin = auth.get("role") === "admin";

  if (!isAdmin) {
    const protectedFields = ["role", "approved", "emailVerified"];
    for (const field of protectedFields) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        throw new ForbiddenError(
          `Permission refusée : le champ "${field}" ne peut être modifié que par un administrateur.`
        );
      }
    }
  }

  return e.next();
});

// ═══════════════════════════════════════════════════════════════════
// USERS — Vérification email : synchroniser emailVerified avec verified
// Les deux champs doivent toujours être cohérents.
// "verified" est le champ natif PocketBase ; "emailVerified" est le champ
// custom utilisé par l'API Express. Ce hook les garde en sync.
// ═══════════════════════════════════════════════════════════════════
onRecordUpdateRequest((e) => {
  if (e.record.collection().name !== "users") {
    return e.next();
  }

  const info = e.requestInfo();
  const body = info.body || {};

  // Si "verified" change → mettre à jour "emailVerified" en conséquence
  if (Object.prototype.hasOwnProperty.call(body, "verified")) {
    e.record.set("emailVerified", body.verified === true || body.verified === "true");
  }

  // Si "emailVerified" change (par l'API Express) → mettre à jour "verified"
  if (Object.prototype.hasOwnProperty.call(body, "emailVerified")) {
    e.record.set("verified", body.emailVerified === true || body.emailVerified === "true");
  }

  return e.next();
});

// ═══════════════════════════════════════════════════════════════════
// ORDERS — Création : empêcher le spoofing de user_id
// ═══════════════════════════════════════════════════════════════════
onRecordCreateRequest((e) => {
  if (e.record.collection().name !== "orders") {
    return e.next();
  }

  const info = e.requestInfo();
  const auth = info.auth;

  if (!auth) {
    throw new BadRequestError("Authentification requise pour créer une commande.");
  }

  const isAdmin = auth.get("role") === "admin";

  if (!isAdmin) {
    // Forcer user_id = utilisateur connecté, quoi qu'il envoie
    e.record.set("user_id", auth.id);
  }

  return e.next();
});