/**
 * add-inline-translations.mjs
 * ════════════════════════════════════════════════════════════════
 * Ajoute les traductions inline (gris) dans le contenu HTML des
 * pages de cours :
 *   • Cours français  → traduction anglaise via <span class="inline-trans">
 *   • Cours anglais   → traduction française (à venir)
 *   • Cours arabe     → déjà géré
 *
 * Utilise Claude Haiku pour identifier et traduire les phrases
 * d'exemple dans le HTML des leçons.
 *
 * Usage :
 *   node add-inline-translations.mjs            (tous les cours FR)
 *   node add-inline-translations.mjs --dry-run
 *   node add-inline-translations.mjs --id COURSE_ID
 *   node add-inline-translations.mjs --force    (même si déjà traduit)
 * ════════════════════════════════════════════════════════════════
 */

import 'dotenv/config';
import PocketBase from 'pocketbase';
import Anthropic from '@anthropic-ai/sdk';
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

const PB_URL    = process.env.PB_URL               || 'http://127.0.0.1:8090';
const PB_EMAIL  = process.env.PB_SUPERUSER_EMAIL    || '';
const PB_PASS   = process.env.PB_SUPERUSER_PASSWORD || '';
const DRY_RUN   = process.argv.includes('--dry-run');
const FORCE     = process.argv.includes('--force');
const TARGET_ID = (() => { const i = process.argv.indexOf('--id'); return i !== -1 ? process.argv[i+1] : null; })();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ════════════════════════════════════════════════════════════════
// DÉTECTION LANGUE DU COURS
// ════════════════════════════════════════════════════════════════
function isCourseFrench(course) {
  const langue = (course.langue || '').toLowerCase();
  const titre  = (course.titre  || course.title || '').toLowerCase();
  // Exclure les cours d'anglais et d'arabe
  if (langue.match(/anglais|english|arabe|arabic/)) return false;
  if (titre.match(/\benglish\b|anglais|arabe|arabic/)) return false;
  return true; // par défaut : cours de français
}

function hasInlineTrans(html) {
  return html.includes('inline-trans');
}

// ════════════════════════════════════════════════════════════════
// CLAUDE : ajouter les traductions inline dans le HTML
// ════════════════════════════════════════════════════════════════
async function addTranslationsToHtml(html, pageTitle) {
  const prompt = `You are a French language teacher. I have an HTML lesson page in French.
I need you to add English translations to the French example sentences in the content.

RULES:
1. After each French example sentence inside <li> or <p> tags (that contains actual French text to learn), add:
   <span class="inline-trans">= English translation here</span>
2. ONLY add translations to example sentences (sentences showing how to use grammar rules), NOT to:
   - Explanatory text (rule descriptions, headers)
   - Already translated sentences (that already have inline-trans)
   - Grammar labels/titles
   - Table content (inside summary-table)
3. Keep the translation SHORT and natural (like a teacher's gloss)
4. If a sentence already has <span class="inline-trans">, leave it exactly as is
5. Return ONLY the modified HTML, nothing else, no explanation

Page title: "${pageTitle}"

HTML to process:
${html}`;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.content[0].text.trim();
}

// ════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════
async function main() {
  console.log('\n🌐 add-inline-translations.mjs — Traductions inline cours FR');
  console.log('═'.repeat(62));
  if (DRY_RUN) console.log('⚠️  MODE APERÇU — aucune écriture\n');

  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log(`✅ Connecté à PocketBase (${PB_URL})\n`);

  let courses = await pb.collection('courses').getFullList({ sort: 'created', requestKey: null });
  if (TARGET_ID) courses = courses.filter(c => c.id === TARGET_ID);

  // Filtrer : seulement les cours français avec des pages
  const frCourses = courses.filter(c => {
    if (!isCourseFrench(c)) return false;
    const pages = typeof c.pages === 'string' ? JSON.parse(c.pages || '[]') : (c.pages || []);
    return Array.isArray(pages) && pages.length > 0;
  });

  console.log(`📚 ${frCourses.length} cours français avec pages trouvés\n`);

  let updated = 0, skipped = 0, errors = 0;

  for (const course of frCourses) {
    const titre = course.titre || course.title || '(sans titre)';
    const pages = typeof course.pages === 'string'
      ? JSON.parse(course.pages || '[]')
      : (course.pages || []);

    // Vérifier si déjà traduit (au moins une page a inline-trans)
    const alreadyDone = pages.some(p => hasInlineTrans(p.content || ''));

    if (!FORCE && alreadyDone) {
      console.log(`  ✅ DÉJÀ  "${titre}" — traductions inline existantes`);
      skipped++;
      continue;
    }

    console.log(`  🔄 TRAD  "${titre}" (${pages.length} pages)`);

    if (DRY_RUN) {
      console.log(`           ✅ (simulation)\n`);
      updated++;
      continue;
    }

    try {
      const updatedPages = [];
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const content = page.content || '';

        // Skip pages de type bilan/tableau récap (summary-table) et intro courte
        const isTablePage = content.includes('summary-table') && !content.includes('<ul>');
        const alreadyHasTrans = hasInlineTrans(content);

        if (isTablePage || (alreadyHasTrans && !FORCE)) {
          updatedPages.push(page);
          process.stdout.write(`           Page ${i+1}/${pages.length} ⏭  (skip)\n`);
          continue;
        }

        process.stdout.write(`           Page ${i+1}/${pages.length} "${page.title || ''}"…`);

        const newContent = await addTranslationsToHtml(content, page.title || '');
        updatedPages.push({ ...page, content: newContent });

        process.stdout.write(` ✅\n`);

        // Pause entre les pages
        await new Promise(r => setTimeout(r, 400));
      }

      await pb.collection('courses').update(course.id, {
        pages: JSON.stringify(updatedPages),
      }, { requestKey: null });

      console.log(`           ✅ Cours mis à jour !\n`);
      updated++;

    } catch (e) {
      console.error(`           ❌ Erreur : ${e.message}\n`);
      errors++;
    }

    // Pause entre cours pour le rate limiting
    await new Promise(r => setTimeout(r, 800));
  }

  console.log('═'.repeat(62));
  console.log(`📊 Résultats : ${updated} traduits · ${skipped} ignorés · ${errors} erreurs`);
  if (DRY_RUN) console.log('⚠️  Relancez sans --dry-run pour appliquer');
  console.log('');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
