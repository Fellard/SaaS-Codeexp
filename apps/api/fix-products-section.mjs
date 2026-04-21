import pb from './src/utils/pocketbaseClient.js';

const products = await pb.collection('products').getFullList({$autoCancel:false});
console.log(`Correction de ${products.length} produits...`);

for (const p of products) {
  if (!p.section) {
    const name = (p.name + ' ' + (p.category || '')).toLowerCase();
    let section = 'pc';
    if (name.match(/guitare|piano|musique|instrument|micro|ampli|clavier|batterie|violon|basse|musik|audio/)) {
      section = 'musik';
    } else if (name.match(/studio|enregistrement|mixage/)) {
      section = 'studio';
    }
    await pb.collection('products').update(p.id, { section }, {$autoCancel:false});
    console.log(`✅ ${p.name} → ${section}`);
  } else {
    console.log(`ℹ️ ${p.name} → déjà: ${p.section}`);
  }
}
console.log('Terminé !');
process.exit(0);
