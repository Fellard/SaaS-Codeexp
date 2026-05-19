/// <reference path="../pb_data/types.d.ts" />
// Ce hook est désactivé — la gestion des notifications admin est assurée par l'API Express
onRecordAfterCreateSuccess((e) => {
  e.next();
}, "users");
