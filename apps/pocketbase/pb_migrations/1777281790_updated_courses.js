/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4564003031")

  // add field
  collection.fields.addAt(27, new Field({
    "hidden": false,
    "id": "select1149012527",
    "maxSelect": 1,
    "name": "course_type",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "standard",
      "audio"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4564003031")

  // remove field
  collection.fields.removeById("select1149012527")

  return app.save(collection)
})
