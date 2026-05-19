/**
 * inject-exercises.mjs
 *
 * Injecte les 16 exercices QCM extraits du PDF "Toutes les prépositions - Feuille de travail 1"
 * (Lingua.com) dans un cours PocketBase.
 *
 * Usage depuis le terminal (dans apps/api/) :
 *   node inject-exercises.mjs              → met à jour le cours le plus récent
 *   node inject-exercises.mjs COURSE_ID    → met à jour ce cours précis
 *
 * Source des réponses (bas de page du PDF) :
 *   1)c 2)c 3)a 4)d 5)b 6)a 7)d 8)c 9)c 10)d 11)b 12)a 13)c 14)a 15)a 16)b
 */

import PocketBase from 'pocketbase';
import { readFileSync } from 'fs';

// Charger .env manuellement (pas besoin de dotenv)
try {
  const env = readFileSync('.env', 'utf8');
  env.split('\n').forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
} catch {}

const PB_URL   = process.env.PB_URL  || 'http://127.0.0.1:8090';
const PB_EMAIL = process.env.PB_SUPERUSER_EMAIL    || '';
const PB_PASS  = process.env.PB_SUPERUSER_PASSWORD || '';

if (!PB_EMAIL || !PB_PASS) {
  console.error('❌ PB_SUPERUSER_EMAIL et PB_SUPERUSER_PASSWORD doivent être définis dans .env');
  process.exit(1);
}

// ── Exercices extraits du PDF Lingua.com ──────────────────────────────────────
// "Toutes les prépositions - Feuille de travail 1" — Grammaire française
// answer = index (0=a, 1=b, 2=c, 3=d)
const EXERCISES = [
  { id:'q1',  question:"C'est certain que tout cela est arrivé ___ sa faute !",        options:['grâce à','avec','par','à'],           answer:2 },
  { id:'q2',  question:"Les jeunes lisent beaucoup d'informations ___ internet.",       options:['avec','à','sur','dans'],               answer:2 },
  { id:'q3',  question:"Je vais ___ Paris tous les jours.",                            options:['à','pour','à cause de','au-dessus'],    answer:0 },
  { id:'q4',  question:"Je ne le vois pas. Il doit être ___ plage.",                  options:['à cause de','sous','pendant','loin de'],answer:3 },
  { id:'q5',  question:"J'aime me promener dans la forêt ___ été.",                   options:['pendant','en','pour','avec'],           answer:1 },
  { id:'q6',  question:"Je peux t'aider ? Il reste des choses ___ faire ?",           options:['à','par','pour','en'],                  answer:0 },
  { id:'q7',  question:"Je laisse cuire la viande ___ quelques minutes.",             options:['pour','derrière','chez','pendant'],     answer:3 },
  { id:'q8',  question:"Ils sont intelligents ___ comprendre la situation.",           options:['à','entre','pour','depuis'],            answer:2 },
  { id:'q9',  question:"Anne a bu trop d'alcool. Elle devrait rentrer ___ pied.",     options:['par','avec','à','en'],                  answer:2 },
  { id:'q10', question:"Les enfants se brossent les dents 3 fois ___ jour.",          options:['au','avec','à','par'],                  answer:3 },
  { id:'q11', question:"Je ne vois rien ___ mes lunettes.",                           options:['à','sans','au centre de','grâce à'],    answer:1 },
  { id:'q12', question:"Tu viens manger ___ 7 heures ?",                             options:['vers','afin de','à droite de','à cause de'], answer:0 },
  { id:'q13', question:"___ rond-point, prenez la deuxième sortie.",                  options:['De','Devant','Au','En'],                answer:2 },
  { id:'q14', question:"Je ne peux pas acheter ___ argent.",                          options:['sans','avec','à','vers'],               answer:0 },
  { id:'q15', question:"Marc met 17 bougies ___ le gâteau d'anniversaire de Lucas.", options:['sur','vers','en-dessous','dans'],        answer:0 },
  { id:'q16', question:"Tu as déjà marché ___ l'herbe pieds nus ? J'adore !",        options:['avec','dans','vers','depuis'],           answer:1 },
];

async function main() {
  console.log('🔧 Configuration :');
  console.log('   PB_URL   :', PB_URL);
  console.log('   PB_EMAIL :', PB_EMAIL);
  console.log('   PB_PASS  :', PB_PASS ? '***' + PB_PASS.slice(-3) : '(vide)');
  console.log('');

  const pb = new PocketBase(PB_URL);

  // Authentification superuser
  console.log('🔐 Connexion à PocketBase...');
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log(`✅ Connecté à PocketBase (${PB_URL})`);

  // Trouver le cours cible
  const targetId = process.argv[2];
  let course;

  if (targetId) {
    course = await pb.collection('courses').getOne(targetId);
    console.log(`📚 Cours ciblé : "${course.titre}" (${course.id})`);
  } else {
    const list = await pb.collection('courses').getList(1, 5, { sort: '-created' });
    if (list.items.length === 0) {
      console.error('❌ Aucun cours trouvé dans PocketBase');
      process.exit(1);
    }
    // Afficher les 5 plus récents pour que l'utilisateur puisse choisir
    console.log('\n📋 5 cours les plus récents :');
    list.items.forEach((c, i) => console.log(`   ${i+1}. [${c.id}] ${c.titre} (${new Date(c.created).toLocaleDateString('fr-FR')})`));
    course = list.items[0];
    console.log(`\n→ Mise à jour du plus récent : "${course.titre}"`);
    console.log('  (Pour cibler un autre cours : node inject-exercises.mjs COURSE_ID)\n');
  }

  // Injection des exercices
  const updated = await pb.collection('courses').update(course.id, {
    exercises: JSON.stringify(EXERCISES),
  });

  console.log(`\n✅ ${EXERCISES.length} exercices QCM injectés dans "${updated.titre}"`);
  console.log('\nQuestions :');
  EXERCISES.forEach((e, i) => {
    const letter = ['a','b','c','d'][e.answer];
    console.log(`  ${String(i+1).padStart(2,'0')}. ${e.question.slice(0,55)}…  → ${letter}) ${e.options[e.answer]}`);
  });
  console.log('\n🎓 Rechargez la page étudiant pour voir les exercices dans l\'onglet Quiz.');
}

main().catch(err => {
  console.error('\n❌ Erreur complète :');
  console.error('   message :', err.message);
  console.error('   status  :', err?.status);
  console.error('   data    :', JSON.stringify(err?.data || err?.response, null, 2));
  if (err.message?.includes('ECONNREFUSED') || err.message?.includes('fetch')) {
    console.error('\n→ PocketBase n\'est pas accessible sur', PB_URL);
    console.error('  Assurez-vous que PocketBase tourne (pocketbase.exe serve)');
  }
  process.exit(1);
});
