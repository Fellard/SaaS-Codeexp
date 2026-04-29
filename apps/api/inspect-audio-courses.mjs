/**
 * inspect-audio-courses.mjs
 * Affiche le contenu des pages des cours audio arabes pour diagnostic.
 * Usage : cd apps/api && node inspect-audio-courses.mjs
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

  const courses = await pb.collection('courses').getFullList({
    filter: `langue = "Arabe" && course_type = "audio"`,
    sort: 'created',
    requestKey: null,
  });

  console.log(`Found ${courses.length} Arabic audio courses\n`);

  const output = [];

  for (const course of courses) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`[${course.id}] ${course.titre}`);
    console.log('='.repeat(60));

    if (!course.pages) {
      console.log('  (no pages)');
      continue;
    }

    let pages;
    try {
      pages = typeof course.pages === 'string' ? JSON.parse(course.pages) : course.pages;
    } catch {
      console.log('  (invalid JSON)');
      continue;
    }

    console.log(`  ${pages.length} pages`);

    // Extract gray italic text (French translations)
    const allContent = pages.map(p => p.content || '').join('\n');

    // Find all gray italic spans (potential French translations)
    const grayMatches = [...allContent.matchAll(/color:#888[^>]*>([^<]+)</g)];
    const frenchMatches = [...allContent.matchAll(/font-style:italic[^>]*>([^<]+)</g)];
    const tableHeaders = [...allContent.matchAll(/<th[^>]*>([^<]+)</g)];

    console.log('\n  --- Table headers ---');
    tableHeaders.forEach(m => console.log(`    "${m[1].trim()}"`));

    console.log('\n  --- Gray text samples (first 15) ---');
    grayMatches.slice(0, 15).forEach(m => console.log(`    "${m[1].trim()}"`));

    output.push({
      id: course.id,
      titre: course.titre,
      pages: pages.map(p => ({ id: p.id, type: p.type, title: p.title, content: p.content }))
    });
  }

  // Save full content to file for review
  writeFileSync(join(__dirname, 'audio-courses-dump.json'), JSON.stringify(output, null, 2), 'utf8');
  console.log('\n\n✅ Full content saved to: audio-courses-dump.json');
}

main().catch(err => {
  console.error('Fatal:', err?.data ? JSON.stringify(err.data) : err.message);
  process.exit(1);
});
