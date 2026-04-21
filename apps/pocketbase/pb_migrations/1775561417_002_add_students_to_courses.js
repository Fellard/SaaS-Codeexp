/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const pbc_3657182128Collection = app.findCollectionByNameOrId("pbc_3657182128");
  const collection = app.findCollectionByNameOrId("courses");

  const existing = collection.fields.getByName("students");
  if (existing) {
    if (existing.type === "relation") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("students"); // exists with wrong type, remove first
  }

  collection.fields.add(new RelationField({
    name: "students",
    required: false,
    collectionId: pbc_3657182128Collection.id,
    maxSelect: 999
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("courses");
  collection.fields.removeByName("students");
  return app.save(collection);
})
