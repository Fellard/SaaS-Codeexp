import pb from './src/utils/pocketbaseClient.js';

try {
  // Get first product
  const products = await pb.collection('products').getList(1, 1, {$autoCancel:false});
  if (products.items.length === 0) {
    console.log('Aucun produit trouvé');
    process.exit(0);
  }
  
  const product = products.items[0];
  console.log('Produit trouvé:', product.id, product.name);
  console.log('Section:', product.section);
  console.log('Condition:', product.condition);
  
  // Try simple update
  const updated = await pb.collection('products').update(product.id, {
    name: product.name,
    description: product.description || 'test',
  }, {$autoCancel:false});
  
  console.log('✅ Update réussi!');
} catch(e) {
  console.log('ERROR:', e.message);
  console.log('Response data:', JSON.stringify(e.response?.data || {}));
}
process.exit(0);
