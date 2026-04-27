/**
 * inspect-all-exercises.mjs
 * Liste tous les cours EN + AR (standard + audio) et leurs pages
 * de type exercises. Sauvegarde dans all-exercises-dump.json
 * Usage : cd apps/api && node inspect-all-exercises.mjs
 */
import 'dotenv/config';
import PocketBase from 'pocketbase';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));
try {
  const env = readFileSync(join(__dirname, '.env'), 'utf8');
  env.split('\n').forEach(line => { const m = line.match(/^([^#=]+)=(.*)$/); if (m) process.env[m[1].trim()] = m[2].trim(); });
} catch {}
const PB_URL   = process.env.PB_URL   || 'http://127.0.0.1:8090';
const PB_EMAIL = process.env.PB_SUPERUSER_EMAIL    || '';
const PB_PASS  = process.env.PB_SUPERUSER_PASSWORD || '';

async function main() {
  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);

  const courses = await pb.collection('courses').getFullList({
    filter: `langue = "Anglais" || langue = "Arabe"`,
    sort: 'langue,course_type,created',
    requestKey: null,
  });

  console.log(`\nFound ${courses.length} courses\n`);
  console.log('─'.repeat(70));

  const out = [];
  for (const c of courses) {
    let pages = [];
    try { pages = typeof c.pages === 'string' ? JSON.parse(c.pages) : (c.pages || []); } catch {}

    const exPages = pages.filter(p => p.type === 'exercises');
    const hasInteractive = exPages.some(p => p.content && p.content.includes('iws-btn'));

    console.log(`[${c.langue}/${c.course_type}] ${c.titre}`);
    console.log(`  ID: ${c.id} | Pages: ${pages.length} | Exercise pages: ${exPages.length} | Interactive: ${hasInteractive ? '✅' : '❌'}`);
    if (exPages.length) {
      exPages.forEach(p => console.log(`    → [${p.type}] "${p.title}" (${(p.content||'').length} chars)`));
    }
    console.log();

    out.push({
      id: c.id,
      titre: c.titre,
      langue: c.langue,
      course_type: c.course_type,
      needsUpdate: exPages.length > 0 && !hasInteractive,
      exercisePageIds: exPages.map(p => p.id),
      pages,
    });
  }

  writeFileSync(join(__dirname, 'all-exercises-dump.json'), JSON.stringify(out, null, 2));
  console.log('✅ Saved to all-exercises-dump.json');
  console.log('\nSummary:');
  console.log(`  Need update: ${out.filter(c => c.needsUpdate).length}`);
  console.log(`  Already interactive: ${out.filter(c => !c.needsUpdate && c.exercisePageIds.length > 0).length}`);
  console.log(`  No exercise pages: ${out.filter(c => c.exercisePageIds.length === 0).length}`);
}
main().catch(err => { console.error('Fatal:', err?.message); process.exit(1); });
