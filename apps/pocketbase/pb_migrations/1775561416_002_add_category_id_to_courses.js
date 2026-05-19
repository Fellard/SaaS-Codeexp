/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const pbc_9783359751Collection = app.findCollectionByNameOrId("pbc_9783359751");
  const collection = app.findCollectionByNameOrId("courses");

  const existing = collection.fields.getByName("category_id");
  if (existing) {
    if (existing.type === "relation") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("category_id"); // exists with wrong type, remove first
  }

  collection.fields.add(new RelationField({
    name: "category_id",
    required: false,
    collectionId: pbc_9783359751Collection.id
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("courses");
  collection.fields.removeByName("category_id");
  return app.save(collection);
})
