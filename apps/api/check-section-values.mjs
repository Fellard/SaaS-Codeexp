import pb from './src/utils/pocketbaseClient.js';

const col = await pb.collections.getOne('products');
const sectionField = col.fields.find(f => f.name === 'section');
console.log('Section field options:', JSON.stringify(sectionField?.options || sectionField, null, 2));
process.exit(0);
