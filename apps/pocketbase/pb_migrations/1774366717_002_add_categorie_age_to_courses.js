/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("courses");

  const existing = collection.fields.getByName("categorie_age");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("categorie_age"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "categorie_age",
    required: true,
    values: ["Enfants (6-12 ans)", "Ados (13-17 ans)", "Adultes"]
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("courses");
  collection.fields.removeByName("categorie_age");
  return app.save(collection);
})