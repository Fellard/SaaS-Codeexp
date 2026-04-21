/// <reference path="../pb_data/types.d.ts" />

// Migration : supprime la collection 'enrollments' orpheline.
// Tout le code utilise exclusivement 'course_enrollments'.
// Cette collection n'est référencée par aucun composant UI ni route API.
migrate(
  // UP : suppression de la collection orpheline
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId("enrollments");
      app.delete(collection);
      console.log("[migration] Collection 'enrollments' orpheline supprimée.");
    } catch (e) {
      // La collection n'existe peut-être pas dans cet environnement — pas de souci
      console.log("[migration] 'enrollments' introuvable, rien à supprimer :", e.message);
    }
  },
  // DOWN : recréation minimale si rollback nécessaire
  (app) => {
    try {
      app.findCollectionByNameOrId("enrollments");
      // Déjà présente, rien à faire
    } catch {
      const collection = new Collection({
        name: "enrollments",
        type: "base",
        createRule: "@request.auth.id != ''",
        deleteRule: "user_id = @request.auth.id || @request.auth.role = 'admin'",
        fields: [
          { type: "text", name: "id", primaryKey: true, required: true, system: true,
            autogeneratePattern: "[a-z0-9]{15}", min: 15, max: 15 },
          { type: "relation", name: "user_id", required: true, collectionId: "_pb_users_auth_" },
          { type: "relation", name: "course_id", required: true },
          { type: "number",   name: "progression", min: 0, max: 100 },
          { type: "bool",     name: "complete" },
        ],
      });
      app.save(collection);
    }
  }
);
