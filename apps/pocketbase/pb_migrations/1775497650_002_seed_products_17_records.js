/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("products");

  const record0 = new Record(collection);
    record0.set("name", "Guitare acoustique classique");
    record0.set("category", "Guitares");
    record0.set("section", "music");
    record0.set("price", 2500);
    record0.set("condition", "neuf");
  try {
    app.save(record0);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record1 = new Record(collection);
    record1.set("name", "Guitare \u00e9lectrique Stratocaster");
    record1.set("category", "Guitares");
    record1.set("section", "music");
    record1.set("price", 4500);
    record1.set("condition", "neuf");
  try {
    app.save(record1);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record2 = new Record(collection);
    record2.set("name", "Clavier 88 touches");
    record2.set("category", "Claviers & Synth\u00e9tiseurs");
    record2.set("section", "music");
    record2.set("price", 3200);
    record2.set("condition", "neuf");
  try {
    app.save(record2);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record3 = new Record(collection);
    record3.set("name", "Microphone condensateur USB");
    record3.set("category", "Microphones & \u00c9quipements d'enregistrement");
    record3.set("section", "music");
    record3.set("price", 1200);
    record3.set("condition", "neuf");
  try {
    app.save(record3);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record4 = new Record(collection);
    record4.set("name", "Casque audio professionnel");
    record4.set("category", "Accessoires musicaux");
    record4.set("section", "music");
    record4.set("price", 800);
    record4.set("condition", "neuf");
  try {
    app.save(record4);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record5 = new Record(collection);
    record5.set("name", "C\u00e2bles et accessoires");
    record5.set("category", "Accessoires musicaux");
    record5.set("section", "music");
    record5.set("price", 250);
    record5.set("condition", "neuf");
  try {
    app.save(record5);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record6 = new Record(collection);
    record6.set("name", "Dell XPS 13");
    record6.set("category", "Ordinateurs Neufs");
    record6.set("section", "computers");
    record6.set("price", 12500);
    record6.set("brand", "Dell");
    record6.set("condition", "neuf");
  try {
    app.save(record6);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record7 = new Record(collection);
    record7.set("name", "HP Pavilion 15");
    record7.set("category", "Ordinateurs Neufs");
    record7.set("section", "computers");
    record7.set("price", 8500);
    record7.set("brand", "HP");
    record7.set("condition", "neuf");
  try {
    app.save(record7);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record8 = new Record(collection);
    record8.set("name", "Desktop Gaming Ryzen 5");
    record8.set("category", "Ordinateurs Neufs");
    record8.set("section", "computers");
    record8.set("price", 9500);
    record8.set("brand", "Custom");
    record8.set("condition", "neuf");
  try {
    app.save(record8);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record9 = new Record(collection);
    record9.set("name", "Workstation professionnel");
    record9.set("category", "Ordinateurs Neufs");
    record9.set("section", "computers");
    record9.set("price", 15000);
    record9.set("brand", "Lenovo");
    record9.set("condition", "neuf");
  try {
    app.save(record9);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record10 = new Record(collection);
    record10.set("name", "Moniteur 27\" 4K");
    record10.set("category", "Accessoires Informatiques");
    record10.set("section", "computers");
    record10.set("price", 3500);
    record10.set("brand", "LG");
    record10.set("condition", "neuf");
  try {
    app.save(record10);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record11 = new Record(collection);
    record11.set("name", "Clavier m\u00e9canique RGB");
    record11.set("category", "Accessoires Informatiques");
    record11.set("section", "computers");
    record11.set("price", 1200);
    record11.set("brand", "Corsair");
    record11.set("condition", "neuf");
  try {
    app.save(record11);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record12 = new Record(collection);
    record12.set("name", "Souris sans fil");
    record12.set("category", "Accessoires Informatiques");
    record12.set("section", "computers");
    record12.set("price", 300);
    record12.set("brand", "Logitech");
    record12.set("condition", "neuf");
  try {
    app.save(record12);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record13 = new Record(collection);
    record13.set("name", "Lenovo ThinkPad");
    record13.set("category", "Ordinateurs d'Occasion");
    record13.set("section", "computers");
    record13.set("price", 4500);
    record13.set("brand", "Lenovo");
    record13.set("condition", "occasion");
  try {
    app.save(record13);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record14 = new Record(collection);
    record14.set("name", "MacBook Air 2019");
    record14.set("category", "Ordinateurs d'Occasion");
    record14.set("section", "computers");
    record14.set("price", 6500);
    record14.set("brand", "Apple");
    record14.set("condition", "occasion");
  try {
    app.save(record14);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record15 = new Record(collection);
    record15.set("name", "Desktop i7");
    record15.set("category", "Ordinateurs d'Occasion");
    record15.set("section", "computers");
    record15.set("price", 5500);
    record15.set("brand", "Custom");
    record15.set("condition", "occasion");
  try {
    app.save(record15);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record16 = new Record(collection);
    record16.set("name", "Moniteur 24\"");
    record16.set("category", "Accessoires Informatiques");
    record16.set("section", "computers");
    record16.set("price", 1500);
    record16.set("brand", "Dell");
    record16.set("condition", "occasion");
  try {
    app.save(record16);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }
}, (app) => {
  // Rollback: record IDs not known, manual cleanup needed
})
