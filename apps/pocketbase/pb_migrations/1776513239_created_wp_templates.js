/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
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
        "id": "text1819170229",
        "max": 0,
        "min": 0,
        "name": "nom",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "select1232983604",
        "maxSelect": 1,
        "name": "categorie",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "business",
          "ecommerce",
          "portfolio",
          "restaurant",
          "sante",
          "education",
          "immobilier"
        ]
      },
      {
        "hidden": false,
        "id": "number1513340523",
        "max": null,
        "min": null,
        "name": "prix_base",
        "onlyInt": false,
        "presentable": false,
        "required": true,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "number4030361100",
        "max": null,
        "min": null,
        "name": "prix_mensuel",
        "onlyInt": false,
        "presentable": false,
        "required": true,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "number3478971155",
        "max": null,
        "min": null,
        "name": "delai_jours",
        "onlyInt": false,
        "presentable": false,
        "required": true,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "bool2931128841",
        "name": "popular",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "exceptDomains": null,
        "hidden": false,
        "id": "url3747376442",
        "name": "demo_url",
        "onlyDomains": null,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "url"
      },
      {
        "exceptDomains": null,
        "hidden": false,
        "id": "url3112513328",
        "name": "preview",
        "onlyDomains": null,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "url"
      },
      {
        "hidden": false,
        "id": "json3411203195",
        "maxSize": 0,
        "name": "couleurs",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "json3217087507",
        "maxSize": 0,
        "name": "features",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "bool150283522",
        "name": "actif",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      }
    ],
    "id": "pbc_1132661764",
    "indexes": [],
    "listRule": null,
    "name": "wp_templates",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1132661764");

  return app.delete(collection);
})
