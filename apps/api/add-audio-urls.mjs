// add-audio-urls.mjs
// ─────────────────────────────────────────────────────────────────────────────
// Injecte les audio_url dans les pages des cours "Module" audio (EN + AR)
// Utilisation :
//   1. Mets tes MP3 dans un hébergement (Cloudinary, Bunny CDN, PocketBase Files…)
//   2. Remplace les valeurs null ci-dessous par les vraies URLs
//   3. node add-audio-urls.mjs
// ─────────────────────────────────────────────────────────────────────────────
import 'dotenv/config';
import PocketBase from 'pocketbase';

const PB_URL   = process.env.PB_URL                || 'http://127.0.0.1:8090';
const PB_EMAIL = process.env.PB_SUPERUSER_EMAIL    || '';
const PB_PASS  = process.env.PB_SUPERUSER_PASSWORD || '';

// ─────────────────────────────────────────────────────────────────────────────
// ANGLAIS A1 — Modules 1 → 6
// Chaque entrée = { courseId, pisteNumero, audioUrl }
// audioUrl = null → pas encore disponible (placeholder affiché dans l'UI)
// ─────────────────────────────────────────────────────────────────────────────
const ENGLISH_AUDIO_URLS = [
  // Module 1 · Se présenter (Pistes 1–10)
  { courseId: 'sn2baaic8ylzlnl', pisteNumero: 1,  audioUrl: null }, // Dialogue — Nice to meet you!
  { courseId: 'sn2baaic8ylzlnl', pisteNumero: 2,  audioUrl: null }, // Dialogue — At school

  // Module 2 · La famille et la maison (Pistes 11–20)
  { courseId: '85m0rq8dclno58h', pisteNumero: 11, audioUrl: null },
  { courseId: '85m0rq8dclno58h', pisteNumero: 12, audioUrl: null },

  // Module 3 · La vie quotidienne (Pistes 21–30)
  { courseId: '2hlztf7glx10l61', pisteNumero: 21, audioUrl: null },
  { courseId: '2hlztf7glx10l61', pisteNumero: 22, audioUrl: null },

  // Module 4 · Les courses et la nourriture (Pistes 31–40)
  { courseId: '76dug8t4wjxcchv', pisteNumero: 31, audioUrl: null },
  { courseId: '76dug8t4wjxcchv', pisteNumero: 32, audioUrl: null },

  // Module 5 · Loisirs et sports (Pistes 41–50)
  { courseId: '92ljnifnmlbfyt3', pisteNumero: 41, audioUrl: null },
  { courseId: '92ljnifnmlbfyt3', pisteNumero: 42, audioUrl: null },

  // Module 6 · La ville et les transports (Pistes 51–60)
  { courseId: 'c2pyz13tok4got1', pisteNumero: 51, audioUrl: null },
  { courseId: 'c2pyz13tok4got1', pisteNumero: 52, audioUrl: null },
];

// ─────────────────────────────────────────────────────────────────────────────
// ARABE A1 — Modules 1 → 6
// ─────────────────────────────────────────────────────────────────────────────
const ARABIC_AUDIO_URLS = [
  // Module 1 · The Arabic Alphabet (الحروف العربية)
  { courseId: 'b6nrz95uw5fh3yt', pisteNumero: 1,  audioUrl: null },

  // Module 2 · Greetings & Introductions (التحيات والتعارف)
  { courseId: 'jbcsyuo1286gwbh', pisteNumero: 11, audioUrl: null },
  { courseId: 'jbcsyuo1286gwbh', pisteNumero: 12, audioUrl: null },

  // Module 3 · The Family (الأسرة)
  { courseId: '62sizeupdh8h4uk', pisteNumero: 21, audioUrl: null },
  { courseId: '62sizeupdh8h4uk', pisteNumero: 22, audioUrl: null },

  // Module 4 · Numbers and Colours (الأرقام والألوان)
  { courseId: 'xe5x8qkqybxoac1', pisteNumero: 31, audioUrl: null },
  { courseId: 'xe5x8qkqybxoac1', pisteNumero: 32, audioUrl: null },

  // Module 5 · Food and Meals (الطعام والوجبات)
  { courseId: 'u6f3lywovesf8tw', pisteNumero: 41, audioUrl: null },
  { courseId: 'u6f3lywovesf8tw', pisteNumero: 42, audioUrl: null },

  // Module 6 · The City and Transport (المدينة والنقل)
  { courseId: '8jvy5lx96ctd6o1', pisteNumero: 51, audioUrl: null },
  { courseId: '8jvy5lx96ctd6o1', pisteNumero: 52, audioUrl: null },
];

// ─────────────────────────────────────────────────────────────────────────────
async function patchCourse(pb, courseId, urlMap) {
  const course = await pb.collection('courses').getOne(courseId, { requestKey: null });
  const raw   = course.pages ?? [];
  const pages = typeof raw === 'string' ? JSON.parse(raw) : raw;

  let changed = false;
  const patched = pages.map(p => {
    if (p.type !== 'audio') return p;
    const entry = urlMap[p.piste_numero];
    if (!entry || !entry.audioUrl) return p; // null → keep as-is
    if (p.audio_url === entry.audioUrl) return p; // already set
    changed = true;
    return { ...p, audio_url: entry.audioUrl };
  });

  if (!changed) {
    console.log(`  [SKIP] ${course.titre?.substring(0, 55)} — déjà à jour ou URLs nulles`);
    return;
  }

  await pb.collection('courses').update(courseId, { pages: patched }, { requestKey: null });
  console.log(`  [OK]   ${course.titre?.substring(0, 55)}`);
}

async function main() {
  console.log('🎵 add-audio-urls.mjs — Injection des URLs audio dans les pages\n');

  const pb = new PocketBase(PB_URL);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log(`Connecté (${PB_URL})\n`);

  // Groupe les entrées par courseId
  const group = (list) => {
    const map = {};
    for (const e of list) {
      if (!map[e.courseId]) map[e.courseId] = {};
      map[e.courseId][e.pisteNumero] = e;
    }
    return map;
  };

  console.log('── Anglais ──────────────────────────────────────────────');
  const enByCourse = group(ENGLISH_AUDIO_URLS);
  for (const [courseId, urlMap] of Object.entries(enByCourse)) {
    await patchCourse(pb, courseId, urlMap);
  }

  console.log('\n── Arabe ────────────────────────────────────────────────');
  const arByCourse = group(ARABIC_AUDIO_URLS);
  for (const [courseId, urlMap] of Object.entries(arByCourse)) {
    await patchCourse(pb, courseId, urlMap);
  }

  console.log('\n✅ Terminé.');
}

main().catch(e => { console.error('Erreur :', e.message); process.exit(1); });
