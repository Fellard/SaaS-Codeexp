/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const usersCollection  = app.findCollectionByNameOrId("_pb_users_auth_");
  const coursesCollection = app.findCollectionByNameOrId("courses");

  // ── Collection recall_cards ────────────────────────────────────
  const cardsCollection = new Collection({
    "name": "recall_cards",
    "type": "base",
    "createRule": "@request.auth.role = 'admin'",
    "listRule":   "@request.auth.id != ''",
    "viewRule":   "@request.auth.id != ''",
    "updateRule": "@request.auth.role = 'admin'",
    "deleteRule": "@request.auth.role = 'admin'",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text_recall_id",
        "max": 15, "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "relation_card_course",
        "name": "course_id",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation",
        "cascadeDelete": true,
        "collectionId": coursesCollection.id,
        "displayFields": ["title"],
        "maxSelect": 1,
        "minSelect": 0
      },
      {
        "hidden": false,
        "id": "text_card_question",
        "name": "question",
        "presentable": true,
        "required": true,
        "system": false,
        "type": "text",
        "max": 1000,
        "min": 1
      },
      {
        "hidden": false,
        "id": "text_card_answer",
        "name": "answer",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "text",
        "max": 2000,
        "min": 1
      },
      {
        "hidden": false,
        "id": "text_card_langue",
        "name": "langue",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "text",
        "max": 10
      },
      {
        "hidden": false,
        "id": "text_card_niveau",
        "name": "niveau",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "text",
        "max": 20
      },
      {
        "hidden": false,
        "id": "bool_card_auto",
        "name": "auto_generated",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      }
    ]
  });
  app.save(cardsCollection);

  // ── Collection recall_sessions ─────────────────────────────────
  const sessionsCollection = new Collection({
    "name": "recall_sessions",
    "type": "base",
    "createRule": "@request.auth.id != ''",
    "listRule":   "@request.auth.id = user_id",
    "viewRule":   "@request.auth.id = user_id",
    "updateRule": "@request.auth.id = user_id",
    "deleteRule": "@request.auth.role = 'admin'",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text_session_id",
        "max": 15, "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "relation_session_user",
        "name": "user_id",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation",
        "cascadeDelete": true,
        "collectionId": usersCollection.id,
        "displayFields": [],
        "maxSelect": 1,
        "minSelect": 1
      },
      {
        "hidden": false,
        "id": "relation_session_card",
        "name": "card_id",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation",
        "cascadeDelete": true,
        "collectionId": cardsCollection.id,
        "displayFields": [],
        "maxSelect": 1,
        "minSelect": 1
      },
      {
        "hidden": false,
        "id": "select_session_result",
        "name": "result",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "maxSelect": 1,
        "values": ["acquired", "hard"]
      },
      {
        "hidden": false,
        "id": "date_session_next",
        "name": "next_review",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "date"
      },
      {
        "hidden": false,
        "id": "number_session_count",
        "name": "review_count",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number",
        "min": 0,
        "max": null,
        "onlyInt": true
      },
      {
        "hidden": false,
        "id": "number_session_interval",
        "name": "interval_days",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number",
        "min": 1,
        "max": 365,
        "onlyInt": true
      },
      {
        "hidden": false,
        "id": "number_session_streak",
        "name": "streak",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number",
        "min": 0,
        "max": null,
        "onlyInt": true
      }
    ]
  });
  app.save(sessionsCollection);

}, (app) => {
  // Rollback
  try { app.findCollectionByNameOrId("recall_sessions"); app.delete(app.findCollectionByNameOrId("recall_sessions")); } catch {}
  try { app.findCollectionByNameOrId("recall_cards");    app.delete(app.findCollectionByNameOrId("recall_cards"));    } catch {}
});
