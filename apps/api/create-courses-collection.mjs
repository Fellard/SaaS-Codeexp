import pb from './src/utils/pocketbaseClient.js';

try {
  // Vérifier si la collection existe
  await pb.collections.getOne('courses');
  console.log('ℹ️ La collection courses existe déjà');
} catch {
  // Créer la collection
  await pb.collections.create({
    name: 'courses',
    type: 'base',
    fields: [
      { name: 'title', type: 'text', required: true },
      { name: 'description', type: 'text', required: false },
      { name: 'level', type: 'select', values: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], required: false },
      { name: 'category', type: 'text', required: false },
      { name: 'duration', type: 'number', required: false },
      { name: 'price', type: 'number', required: false },
      { name: 'content', type: 'text', required: false },
      { name: 'exercises', type: 'text', required: false },
      { name: 'language', type: 'text', required: false },
    ]
  });
  console.log('✅ Collection courses créée avec succès !');
}
process.exit(0);
