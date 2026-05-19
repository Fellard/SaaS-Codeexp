/// <reference path="../pb_data/types.d.ts" />
// Désactivé — gestion des emails assurée par l'API Express
onRecordUpdate((e) => {
  e.next();
}, "pending_approval");
