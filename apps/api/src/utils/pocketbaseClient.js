import dotenv from 'dotenv';
dotenv.config();
import Pocketbase from 'pocketbase';

const pocketbaseClient = new Pocketbase('http://localhost:8090');

await pocketbaseClient.collection('_superusers').authWithPassword(
    process.env.PB_SUPERUSER_EMAIL,
    process.env.PB_SUPERUSER_PASSWORD,
);

// Configurer l'URL de l'application pour les emails
try {
  await pocketbaseClient.settings.update({
    meta: {
      appName: 'IWS LAAYOUNE',
      appURL: process.env.SITE_URL || 'http://localhost:3000',
    }
  });
} catch(e) {
  // Non bloquant
}

export default pocketbaseClient;

export { pocketbaseClient };
