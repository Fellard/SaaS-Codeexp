/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("courses");

  const existing = collection.fields.getByName("description_ar");
  if (existing) {
    if (existing.type === "text") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("description_ar"); // exists with wrong type, remove first
  }

  collection.fields.add(new TextField({
    name: "description_ar",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("courses");
  collection.fields.removeByName("description_ar");
  return app.save(collection);
})
