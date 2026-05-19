/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_216358969")

  // remove field
  collection.fields.removeById("select342059477")

  // remove field
  collection.fields.removeById("text2662456409")

  // add field
  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text342059477",
    "max": 0,
    "min": 0,
    "name": "domain_status",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "exceptDomains": null,
    "hidden": false,
    "id": "email1157619907",
    "name": "client_email",
    "onlyDomains": null,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "email"
  }))

  // add field
  collection.fields.addAt(14, new Field({
    "exceptDomains": null,
    "hidden": false,
    "id": "url2662456409",
    "name": "url_projet",
    "onlyDomains": null,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "url"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_216358969")

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "select342059477",
    "maxSelect": 1,
    "name": "domain_status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "a_acheter",
      "deja_proprietaire",
      "non_defini"
    ]
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2662456409",
    "max": 0,
    "min": 0,
    "name": "url_projet",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // remove field
  collection.fields.removeById("text342059477")

  // remove field
  collection.fields.removeById("email1157619907")

  // remove field
  collection.fields.removeById("url2662456409")

  return app.save(collection)
})
