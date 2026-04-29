/**
 * inspect-delf-course.mjs
 * Affiche le contenu du cours "Tests et DELF Prim" pour diagnostic.
 * Usage : cd apps/api && node inspect-delf-course.mjs
 */

import 'dotenv/config';
import PocketBase from 'pocketbase';
import { readFileSync, writeFileSync } from 'node:fs';
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

async function main() {
  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);

  // Search for DELF course
  const courses = await pb.collection('courses').getFullList({
    filter: `titre ~ "DELF" || titre ~ "delf" || titre ~ "Tests"`,
    requestKey: null,
  });

  console.log(`Found ${courses.length} course(s)\n`);

  for (const c of courses) {
    console.log(`ID: ${c.id}`);
    console.log(`Titre: ${c.titre}`);
    console.log(`Langue: ${c.langue}`);
    console.log(`Type: ${c.course_type}`);
    console.log(`cours_nom: ${c.cours_nom}`);
    console.log(`niveau: ${c.niveau}`);
    console.log(`description: ${c.description}`);
    console.log(`exercises length: ${c.exercises ? JSON.stringify(c.exercises).length : 0}`);

    if (c.pages) {
      let pages;
      try { pages = typeof c.pages === 'string' ? JSON.parse(c.pages) : c.pages; } catch { pages = []; }
      console.log(`\nPages (${pages.length}):`);
      pages.forEach((p, i) => {
        console.log(`  [${i+1}] type=${p.type} | title=${p.title}`);
        if (p.content) console.log(`       content (${p.content.length} chars)`);
      });
    }
    console.log('');
  }

  // Also dump full content to file
  writeFileSync(join(__dirname, 'delf-course-dump.json'), JSON.stringify(courses, null, 2), 'utf8');
  console.log('✅ Full content saved to: delf-course-dump.json');
}

main().catch(err => {
  console.error('Fatal:', err?.data ? JSON.stringify(err.data) : err.message);
  process.exit(1);
});
