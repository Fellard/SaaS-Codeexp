/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "",
    "deleteRule": "@request.auth.role = \"admin\"",
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
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text434858273",
        "max": 0,
        "min": 0,
        "name": "client_id",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text3982272998",
        "max": 0,
        "min": 0,
        "name": "service_id",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1312696002",
        "max": 0,
        "min": 0,
        "name": "service_nom",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "select3517332393",
        "maxSelect": 1,
        "name": "tech_choice",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "iws_builder",
          "wordpress",
          "import",
          "node"
        ]
      },
      {
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
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text4093596513",
        "max": 0,
        "min": 0,
        "name": "domain_name",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1271580177",
        "max": 0,
        "min": 0,
        "name": "client_nom",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text3616749739",
        "max": 0,
        "min": 0,
        "name": "client_tel",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text532353031",
        "max": 0,
        "min": 0,
        "name": "brief",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "select3848597695",
        "maxSelect": 1,
        "name": "statut",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "nouveau",
          "en_discussion",
          "en_cours",
          "livré",
          "payé",
          "annulé"
        ]
      },
      {
        "hidden": false,
        "id": "number2851332904",
        "max": null,
        "min": null,
        "name": "montant",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text318367190",
        "max": 0,
        "min": 0,
        "name": "notes_admin",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
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
      }
    ],
    "id": "pbc_216358969",
    "indexes": [],
    "listRule": "@request.auth.role = \"admin\"",
    "name": "web_orders",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.id != \"\"",
    "viewRule": "@request.auth.role = \"admin\""
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_216358969");

  return app.delete(collection);
})
