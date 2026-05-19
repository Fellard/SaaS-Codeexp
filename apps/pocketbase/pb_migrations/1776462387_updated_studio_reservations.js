/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1138045507")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\"",
    "deleteRule": "@request.auth.role = \"admin\"",
    "listRule": "@request.auth.id != \"\"",
    "updateRule": "@request.auth.id != \"\"",
    "viewRule": "@request.auth.id != \"\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1138045507")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != ''",
    "deleteRule": "user_id = @request.auth.id || @request.auth.role = 'admin'",
    "listRule": "user_id = @request.auth.id || @request.auth.role = 'admin'",
    "updateRule": "user_id = @request.auth.id || @request.auth.role = 'admin'",
    "viewRule": "user_id = @request.auth.id || @request.auth.role = 'admin'"
  }, collection)

  return app.save(collection)
})
