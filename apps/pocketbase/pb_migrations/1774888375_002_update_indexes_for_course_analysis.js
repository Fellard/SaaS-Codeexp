/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("course_analysis");
  collection.indexes.push("CREATE UNIQUE INDEX idx_course_analysis_courseId ON course_analysis (courseId)");
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("course_analysis");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_course_analysis_courseId"));
  return app.save(collection);
})