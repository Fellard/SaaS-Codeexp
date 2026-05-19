import pb from './src/utils/pocketbaseClient.js';

const users = await pb.collection('users').getFullList({$autoCancel:false});
console.log('Utilisateurs trouvés:', users.length);

for (const user of users) {
  await pb.collection('users').update(user.id, {
    password: 'NewPass2026!',
    passwordConfirm: 'NewPass2026!'
  }, {$autoCancel:false});
  console.log('Mot de passe réinitialisé pour:', user.email);
}

console.log('Terminé ! Connectez-vous avec le mot de passe: NewPass2026!');
process.exit(0);
