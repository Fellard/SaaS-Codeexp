/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_6189353879")

  // add field
  collection.fields.addAt(17, new Field({
    "hidden": false,
    "id": "number4176402534",
    "max": null,
    "min": null,
    "name": "buy_price",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_6189353879")

  // remove field
  collection.fields.removeById("number4176402534")

  return app.save(collection)
})
