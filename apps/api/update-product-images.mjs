import pb from './src/utils/pocketbaseClient.js';

const imageMap = {
  'ENCEIN': 'https://i.ibb.co/5zpHgrQ/ENCEIN.jpg',
  'GUITAR': 'https://i.ibb.co/4Rzf3vWh/GUITAR.jpg',
  'INTERFACE': 'https://i.ibb.co/svXV9xwK/INTERFACE.jpg',
  'MICRO': 'https://i.ibb.co/QFSDVkVH/MICRO.jpg',
  'MPC': 'https://i.ibb.co/WCvQ6HQ/MPC.jpg',
  'MPD': 'https://i.ibb.co/0Rv5gP0m/MPD.jpg',
};

const products = await pb.collection('products').getFullList({$autoCancel:false});

for (const p of products) {
  const name = p.name.toLowerCase();
  
  if (name.includes('guitare') || name.includes('guitar')) {
    await pb.collection('products').update(p.id, { image_url: imageMap.GUITAR }, {$autoCancel:false});
    console.log(`✅ ${p.name} → GUITAR`);
  } else if (name.includes('enceinte') || name.includes('mackie') || name.includes('encein')) {
    await pb.collection('products').update(p.id, { image_url: imageMap.ENCEIN }, {$autoCancel:false});
    console.log(`✅ ${p.name} → ENCEIN`);
  } else if (name.includes('interface') || name.includes('m-audio') || name.includes('air')) {
    await pb.collection('products').update(p.id, { image_url: imageMap.INTERFACE }, {$autoCancel:false});
    console.log(`✅ ${p.name} → INTERFACE`);
  } else if (name.includes('micro') || name.includes('condensateur')) {
    await pb.collection('products').update(p.id, { image_url: imageMap.MICRO }, {$autoCancel:false});
    console.log(`✅ ${p.name} → MICRO`);
  } else if (name.includes('apc') || name.includes('clavier') && name.includes('88')) {
    await pb.collection('products').update(p.id, { image_url: imageMap.MPC }, {$autoCancel:false});
    console.log(`✅ ${p.name} → MPC`);
  } else if (name.includes('mpd') || name.includes('pad')) {
    await pb.collection('products').update(p.id, { image_url: imageMap.MPD }, {$autoCancel:false});
    console.log(`✅ ${p.name} → MPD`);
  } else {
    console.log(`ℹ️ ${p.name} → pas d'image correspondante`);
  }
}

console.log('Terminé !');
process.exit(0);
