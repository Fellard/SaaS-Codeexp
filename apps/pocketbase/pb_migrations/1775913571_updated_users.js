/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // add field
  collection.fields.addAt(16, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1529602839",
    "max": 0,
    "min": 0,
    "name": "Level",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(17, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text290960855",
    "max": 0,
    "min": 0,
    "name": "current_course",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(18, new Field({
    "hidden": false,
    "id": "number570552902",
    "max": null,
    "min": null,
    "name": "progress",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(19, new Field({
    "hidden": false,
    "id": "number1831371789",
    "max": null,
    "min": null,
    "name": "payment",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(20, new Field({
    "hidden": false,
    "id": "json2012324585",
    "maxSize": 0,
    "name": "payments_history",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // remove field
  collection.fields.removeById("text1529602839")

  // remove field
  collection.fields.removeById("text290960855")

  // remove field
  collection.fields.removeById("number570552902")

  // remove field
  collection.fields.removeById("number1831371789")

  // remove field
  collection.fields.removeById("json2012324585")

  return app.save(collection)
})
