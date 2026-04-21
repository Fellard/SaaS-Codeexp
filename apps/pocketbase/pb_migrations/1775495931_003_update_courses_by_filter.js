/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  let records;
  try {
    records = app.findRecordsByFilter("courses", "titre='Grammaire-exprimer-le-temps'");
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("No records found, skipping");
      return;
    }
    throw e;
  }
  
  for (const record of records) {
    record.set("title_fr", "Grammaire-exprimer-le-temps");
    record.set("title_en", "Grammar-Express-Time");
    record.set("title_ar", "\u0627\u0644\u0642\u0648\u0627\u0639\u062f-\u0627\u0644\u062a\u0639\u0628\u064a\u0631-\u0639\u0646-\u0627\u0644\u0648\u0642\u062a");
    record.set("description_fr", "Apprenez \u00e0 exprimer le temps en fran\u00e7ais");
    record.set("description_en", "Learn to express time in French");
    record.set("description_ar", "\u062a\u0639\u0644\u0645 \u0627\u0644\u062a\u0639\u0628\u064a\u0631 \u0639\u0646 \u0627\u0644\u0648\u0642\u062a \u0628\u0627\u0644\u0644\u063a\u0629 \u0627\u0644\u0641\u0631\u0646\u0633\u064a\u0629");
    try {
      app.save(record);
    } catch (e) {
      if (e.message.includes("Value must be unique")) {
        console.log("Record with unique value already exists, skipping");
      } else {
        throw e;
      }
    }
  }
}, (app) => {
  // Rollback: original values not stored, manual restore needed
})
