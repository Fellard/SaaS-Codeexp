import pb from './src/utils/pocketbaseClient.js';

try {
  const collection = await pb.collections.getOne('products');
  const fields = [...(collection.fields || [])];
  
  const newFields = ['image_url_2', 'image_url_3', 'image_url_4'];
  let added = 0;
  
  for (const fieldName of newFields) {
    const exists = fields.find(f => f.name === fieldName);
    if (!exists) {
      fields.push({
        name: fieldName,
        type: 'text',
        required: false,
        presentable: false,
        system: false,
        autogeneratePattern: '',
        max: 0,
        min: 0,
        pattern: ''
      });
      added++;
      console.log(`✅ Champ ${fieldName} ajouté`);
    } else {
      console.log(`ℹ️ ${fieldName} existe déjà`);
    }
  }
  
  if (added > 0) {
    await pb.collections.update('products', { fields });
    console.log('✅ Collection products mise à jour avec succès !');
  }
} catch(e) {
  console.log('ERROR:', e.message);
  console.log(JSON.stringify(e.response || {}));
}
process.exit(0);
