/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pending_approval");
  collection.listRule = "approval_token = @request.query.token || (@request.auth.role = 'admin' && @request.auth.approved = true)";
  collection.viewRule = "approval_token = @request.query.token || user_id = @request.auth.id || (@request.auth.role = 'admin' && @request.auth.approved = true)";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pending_approval");
  collection.listRule = "@request.auth.role = 'admin' && @request.auth.approved = true";
  collection.viewRule = "user_id = @request.auth.id || (@request.auth.role = 'admin' && @request.auth.approved = true)";
  return app.save(collection);
})