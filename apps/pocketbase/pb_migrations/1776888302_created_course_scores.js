/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.id != ''",
    "deleteRule": "@request.auth.role = 'admin'",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "cascadeDelete": true,
        "collectionId": "_pb_users_auth_",
        "hidden": false,
        "id": "relation2809058197",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "user_id",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": true,
        "collectionId": "pbc_4564003031",
        "hidden": false,
        "id": "relation1495058834",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "course_id",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "number848901969",
        "max": 100,
        "min": 0,
        "name": "score",
        "onlyInt": false,
        "presentable": false,
        "required": true,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "bool1675235655",
        "name": "passed",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "hidden": false,
        "id": "number2995025325",
        "max": null,
        "min": 1,
        "name": "attempt_number",
        "onlyInt": true,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "date830654268",
        "max": "",
        "min": "",
        "name": "submitted_at",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
      }
    ],
    "id": "pbc_1079823202",
    "indexes": [],
    "listRule": "@request.auth.id = user_id || @request.auth.role = 'admin'",
    "name": "course_scores",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.role = 'admin'",
    "viewRule": "@request.auth.id = user_id || @request.auth.role = 'admin'"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1079823202");

  return app.delete(collection);
})
