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

const AR_DETECT_0 = ['مقارنة', 'تفضيل', 'أفعل', 'أكبر', 'أجمل'];  // comparaison
const AR_DETECT_4 = ['الماضي التام', 'الفعل الماضي', 'تصريف الماضي', 'مراجعة الماضي']; // passé composé

const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);
await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);

const ar = await pb.collection('courses').getFullList({
  filter: "langue='Arabe' && course_type='standard'",
  requestKey: null
});

console.log(`\n${ar.length} cours AR standard:\n`);
ar.forEach(c => {
  const text = ((c.titre||'') + ' ' + (c.description||'')).toLowerCase();
  const matchComp = AR_DETECT_0.filter(kw => text.includes(kw));
  const matchPast = AR_DETECT_4.filter(kw => text.includes(kw));
  const flag = matchComp.length ? `⚠️  COMP:${matchComp}` : matchPast.length ? `⚠️  PAST:${matchPast}` : '';
  console.log(`  [${(c.pages||'[]').length > 5 ? 'p'+JSON.parse(c.pages||'[]').length : 'p?'}] ${c.titre} ${flag}`);
});
