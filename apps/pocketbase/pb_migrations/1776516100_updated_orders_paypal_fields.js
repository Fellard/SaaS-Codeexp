/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("orders");
  const coursesCol = app.findCollectionByNameOrId("courses");

  // Champ : payment_method (texte libre)
  const paymentMethodField = new Field({
    "hidden": false,
    "id": "text_payment_method",
    "max": 50,
    "min": 0,
    "name": "payment_method",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  });

  // Champ : note (texte long)
  const noteField = new Field({
    "hidden": false,
    "id": "text_order_note",
    "max": 500,
    "min": 0,
    "name": "note",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  });

  // Champ : paypal_order_id
  const paypalOrderIdField = new Field({
    "hidden": false,
    "id": "text_paypal_order_id",
    "max": 100,
    "min": 0,
    "name": "paypal_order_id",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  });

  // Champ : paid_at (date de paiement)
  const paidAtField = new Field({
    "hidden": false,
    "id": "date_paid_at",
    "max": "",
    "min": "",
    "name": "paid_at",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "date"
  });

  // Champ : course_id (relation vers le cours acheté)
  const courseIdField = new Field({
    "hidden": false,
    "id": "relation_order_course",
    "name": "course_id",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "relation",
    "cascadeDelete": false,
    "collectionId": coursesCol.id,
    "displayFields": [],
    "maxSelect": 1,
    "minSelect": 0
  });

  // Ajouter seulement si les champs n'existent pas déjà
  const existingFields = collection.fields.map(f => f.name);
  if (!existingFields.includes('payment_method')) collection.fields.push(paymentMethodField);
  if (!existingFields.includes('note'))            collection.fields.push(noteField);
  if (!existingFields.includes('paypal_order_id')) collection.fields.push(paypalOrderIdField);
  if (!existingFields.includes('paid_at'))         collection.fields.push(paidAtField);
  if (!existingFields.includes('course_id'))       collection.fields.push(courseIdField);

  return app.save(collection);

}, (app) => {
  const collection = app.findCollectionByNameOrId("orders");

  collection.fields = collection.fields.filter(
    f => !['payment_method', 'note', 'paypal_order_id', 'paid_at', 'course_id'].includes(f.name)
  );

  return app.save(collection);
});
