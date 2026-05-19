/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("courses");

  const existing = collection.fields.getByName("title_en");
  if (existing) {
    if (existing.type === "text") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("title_en"); // exists with wrong type, remove first
  }

  collection.fields.add(new TextField({
    name: "title_en",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("courses");
  collection.fields.removeByName("title_en");
  return app.save(collection);
})
