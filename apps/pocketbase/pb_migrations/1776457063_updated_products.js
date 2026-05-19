/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_6189353879")

  // update field
  collection.fields.addAt(13, new Field({
    "hidden": false,
    "id": "file3760176746",
    "maxSelect": 4,
    "maxSize": 0,
    "mimeTypes": null,
    "name": "images",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": null,
    "type": "file"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_6189353879")

  // update field
  collection.fields.addAt(13, new Field({
    "hidden": false,
    "id": "file3760176746",
    "maxSelect": 0,
    "maxSize": 0,
    "mimeTypes": null,
    "name": "images",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": null,
    "type": "file"
  }))

  return app.save(collection)
})
