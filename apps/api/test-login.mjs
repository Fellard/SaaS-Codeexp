import pb from './src/utils/pocketbaseClient.js';

try {
  const auth = await pb.collection('users').authWithPassword(
    'yupavesilak78@gmail.com', 
    'NewPass2026!'
  );
  console.log('SUCCESS! Email:', auth.record.email);
  console.log('verified:', auth.record.verified);
  console.log('approved:', auth.record.approved);
  console.log('role:', auth.record.role);
} catch(e) {
  console.log('ERROR:', e.message);
  console.log('Response:', JSON.stringify(e.response));
}
process.exit(0);
