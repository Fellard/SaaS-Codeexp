/// <reference path="../pb_data/types.d.ts" />
// NOTE: PocketBase v0.36 ne supporte pas @request.data.fieldname dans les updateRules.
// La cancellation des commandes par les utilisateurs est gérée via l'endpoint API
// POST /orders/:id/cancel (apps/api/src/routes/paypal.js) qui utilise le client admin.
// Cette migration s'assure que la règle reste à admin uniquement pour éviter l'erreur.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("orders");

  // Garder uniquement admin — la cancellation utilisateur passe par l'API Express
  collection.updateRule = `@request.auth.role = 'admin'`;

  app.save(collection);
  console.log("✅ Orders updateRule: admin uniquement (cancellation via API /orders/:id/cancel)");
}, (app) => {
  const collection = app.findCollectionByNameOrId("orders");
  collection.updateRule = `@request.auth.role = 'admin'`;
  app.save(collection);
});
