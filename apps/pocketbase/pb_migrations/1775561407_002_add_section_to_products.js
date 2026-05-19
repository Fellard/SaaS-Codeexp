/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("products");

  const existing = collection.fields.getByName("section");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("section"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "section",
    required: true,
    values: ["musik", "studio", "pc"]
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("products");
  collection.fields.removeByName("section");
  return app.save(collection);
})
