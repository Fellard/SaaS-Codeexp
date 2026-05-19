/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    const collection = app.findCollectionByNameOrId("pending_approval");

    const newFields = ["approve_token", "reject_token"];
    for (const fieldName of newFields) {
      try {
        collection.fields.add(new Field({
          type: "text",
          name: fieldName,
          required: false,
          presentable: false,
          system: false,
          id: "text_" + fieldName,
          autogeneratePattern: "",
          max: 0,
          min: 0,
          pattern: ""
        }));
      } catch(e) {
        console.log("Field " + fieldName + " may already exist: " + e.message);
      }
    }

    app.save(collection);
    console.log("Migration: added approve_token and reject_token to pending_approval");
  } catch(e) {
    console.log("Migration warning:", e.message);
  }
}, (app) => {});
