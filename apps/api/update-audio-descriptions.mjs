/**
 * update-audio-descriptions.mjs
 * Met à jour les titres et descriptions des cours audio arabes (FR → EN).
 * Usage : cd apps/api && node update-audio-descriptions.mjs
 */

import 'dotenv/config';
import PocketBase from 'pocketbase';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
try {
  const env = readFileSync(join(__dirname, '.env'), 'utf8');
  env.split('\n').forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
} catch {}

const PB_URL   = process.env.PB_URL               || 'http://127.0.0.1:8090';
const PB_EMAIL = process.env.PB_SUPERUSER_EMAIL    || '';
const PB_PASS  = process.env.PB_SUPERUSER_PASSWORD || '';

const UPDATES = [
  {
    id: 'b6nrz95uw5fh3yt',
    titre: 'Arabic A1 — Module 1 · The Arabic Alphabet (الحروف العربية)',
    description: 'First module. Discover the Arabic alphabet, the 28 letters, writing direction (right to left), short vowels, and the 4 letter forms.',
  },
  {
    id: 'jbcsyuo1286gwbh',
    titre: 'Arabic A1 — Module 2 · Greetings (التحيات والتعارف)',
    description: 'Second module. Learn to greet, introduce yourself, and exchange courtesies in Arabic. Personal pronouns and nominal sentences.',
  },
  {
    id: '62sizeupdh8h4uk',
    titre: 'Arabic A1 — Module 3 · The Family (الأسرة)',
    description: 'Third module. Learn family vocabulary in Arabic, possessive adjectives, masculine/feminine agreement, and possessive suffixes.',
  },
  {
    id: 'xe5x8qkqybxoac1',
    titre: 'Arabic A1 — Module 4 · Numbers and Colours (الأرقام والألوان)',
    description: 'Fourth module. Arabic numbers from 1 to 100, colours and adjective agreement. Saying your age in Arabic.',
  },
  {
    id: 'u6f3lywovesf8tw',
    titre: 'Arabic A1 — Module 5 · Food and Meals (الطعام والوجبات)',
    description: 'Fifth module. Talk about food, order at a restaurant, and express your preferences. The verb يُرِيد (to want).',
  },
  {
    id: '8jvy5lx96ctd6o1',
    titre: 'Arabic A1 — Module 6 · The City and Transport (المدينة والنقل)',
    description: 'Sixth module. Ask for directions, navigate the city, and describe locations in Arabic. Place prepositions.',
  },
  {
    id: 'an8jxf1naa2u3j1',
    titre: 'Arabic A1 — Final Review and Assessment (المراجعة والتقييم)',
    description: 'Final review module of the A1 Arabic course. Revision of the alphabet, vocabulary, grammar, and self-assessment of your A1 level.',
  },
];

async function main() {
  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);

  console.log('🔐 Authenticating...');
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log('✅ Authenticated\n');

  let updated = 0;
  for (const { id, titre, description } of UPDATES) {
    try {
      await pb.collection('courses').update(id, { titre, description });
      console.log(`  ✅ "${titre}"`);
      updated++;
    } catch (err) {
      console.error(`  ❌ Failed [${id}]: ${err.message}`);
    }
  }

  console.log(`\n════════════════════════════════════════════`);
  console.log(`✅ Done — ${updated}/7 courses updated`);
  console.log(`════════════════════════════════════════════`);
}

main().catch(err => {
  console.error('Fatal:', err?.data ? JSON.stringify(err.data) : err.message);
  process.exit(1);
});
