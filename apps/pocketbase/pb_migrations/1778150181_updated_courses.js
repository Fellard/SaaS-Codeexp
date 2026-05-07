/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4564003031")

  // add field
  collection.fields.addAt(28, new Field({
    "hidden": false,
    "id": "number1169138922",
    "max": null,
    "min": 0,
    "name": "sort_order",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4564003031")

  // remove field
  collection.fields.removeById("number1169138922")

  return app.save(collection)
})
