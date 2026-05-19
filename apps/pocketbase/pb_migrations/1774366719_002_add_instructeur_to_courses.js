/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("courses");

  const existing = collection.fields.getByName("instructeur");
  if (existing) {
    if (existing.type === "text") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("instructeur"); // exists with wrong type, remove first
  }

  collection.fields.add(new TextField({
    name: "instructeur"
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("courses");
  collection.fields.removeByName("instructeur");
  return app.save(collection);
})