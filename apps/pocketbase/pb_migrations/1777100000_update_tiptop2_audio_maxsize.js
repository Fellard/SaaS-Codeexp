/// <reference path="../pb_data/types.d.ts" />
// Augmente la taille max du champ `fichier` de tiptop2_audio
// (défaut PocketBase = 5 Mo) pour accepter les pistes volumineuses.
// Les pistes 26, 37 et 55 dépassent 5 Mo et étaient rejetées à l'upload.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_461855837"); // tiptop2_audio
  const field = collection.fields.getById("file2608223519");         // fichier
  if (!field) {
    throw new Error("Champ 'fichier' introuvable sur tiptop2_audio");
  }
  // 15 Mo = 15 * 1024 * 1024 octets
  field.maxSize = 15728640;
  return app.save(collection);
}, (app) => {
  // Rollback : remettre la limite par défaut (0 = 5 Mo)
  const collection = app.findCollectionByNameOrId("pbc_461855837");
  const field = collection.fields.getById("file2608223519");
  if (field) {
    field.maxSize = 0;
  }
  return app.save(collection);
});
