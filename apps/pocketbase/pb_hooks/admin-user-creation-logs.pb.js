/// <reference path="../pb_data/types.d.ts" />
// Désactivé — logs gérés par l'API Express
onRecordCreate((e) => {
  e.next();
}, "users");

onRecordAfterCreateSuccess((e) => {
  e.next();
}, "users");
