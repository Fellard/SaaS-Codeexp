import pb from './src/utils/pocketbaseClient.js';
const col = await pb.collections.getOne('products');
const field = col.fields.find(f => f.name === 'condition');
console.log('Condition values:', JSON.stringify(field?.values || field?.options, null, 2));
process.exit(0);
