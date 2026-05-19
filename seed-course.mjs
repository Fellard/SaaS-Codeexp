/**
 * seed-course.mjs
 * Crée le cours "Exprimer le temps en français" dans PocketBase
 * + inscrit tous les étudiants Langues/Français/A1 automatiquement
 *
 * Usage: node seed-course.mjs
 */

import 'dotenv/config';
import Pocketbase from 'pocketbase';

const PB_URL      = process.env.POCKETBASE_URL || 'http://localhost:8090';
const PB_EMAIL    = process.env.PB_SUPERUSER_EMAIL    || 'admin@iwslaayoune.com';
const PB_PASSWORD = process.env.PB_SUPERUSER_PASSWORD || 'IWS2026@!Admin';

const pb = new Pocketbase(PB_URL);

// ─── Données du cours ──────────────────────────────────────────────
const COURSE_DATA = {
  title:       'Exprimer le temps en français — Exercices A1',
  description: 'Maîtrisez les prépositions de temps en français (à, en, dans, depuis, pendant, avant, après, entre, vers). 8 leçons + 16 exercices interactifs avec correction par intelligence artificielle.',
  section:     'langues',        // Programme
  cours_nom:   'Français',       // Cours spécifique
  niveau:      'A1',             // Niveau
  // Backward compat
  level:       'A1',
  category:    'langues',
  language:    'fr',
  duration:    45,
  price:       0,
  content:     `Leçon sur les prépositions de temps en français.
Prépositions étudiées : à · en · au · dans · depuis · pendant · avant · après · entre · vers

Règles principales :
• à → heure précise (à 7 heures)
• en → mois / saison féminine / année (en été, en 2015)
• au → saison masculine (au printemps)
• dans → durée future (dans dix jours)
• depuis → durée passée continue (depuis 2018)
• pendant → durée déterminée (pendant 3 semaines)
• avant → antériorité (avant de dormir)
• après → postériorité (après le repas)
• entre → intervalle (entre 10h et midi)
• vers → approximation (vers 5 heures)`,
  exercises: JSON.stringify([
    { id:'q1',  question:"J'arrive au cinéma ___ 7 heures.",               options:['dans','pour','avec','à'],        answer:3 },
    { id:'q2',  question:'Marie part en vacances ___ été.',                  options:['pour','dans','vers','en'],       answer:3 },
    { id:'q3',  question:'Mon anniversaire est ___ dix jours.',              options:['sur','dans','à','en'],           answer:1 },
    { id:'q4',  question:'Mon vol pour Paris est prévu ___ lundi.',          options:['dans','vers','à','pour'],        answer:3 },
    { id:'q5',  question:'Ils se sont mariés ___ printemps.',                options:['à','au','pour','en'],            answer:1 },
    { id:'q6',  question:'Je vais chez ma mère ___ 10h et midi.',            options:['entre','pour','en','avant'],     answer:0 },
    { id:'q7',  question:'Je suis en vacances ___ trois semaines.',          options:['avant','à','entre','pendant'],   answer:3 },
    { id:'q8',  question:'___ deux semaines, je suis malade.',               options:['Entre','Depuis','Vers','Après'], answer:1 },
    { id:'q9',  question:'___ le petit-déjeuner, je vais au travail.',       options:['En','Après','Entre','À'],        answer:1 },
    { id:'q10', question:'Les cours commencent ___ septembre.',              options:['à','pour','dans','en'],          answer:3 },
    { id:'q11', question:'Pierre travaille ici ___ 2018.',                   options:['pour','à','vers','depuis'],      answer:3 },
    { id:'q12', question:"J'ai commencé le piano ___ 2015.",                 options:['pendant','à','entre','en'],      answer:3 },
    { id:'q13', question:'Il pleut ___ plusieurs jours.',                    options:['sur','pendant','dans','à'],      answer:1 },
    { id:'q14', question:"Je me brosse les dents ___ d'aller dormir.",       options:['en','avant','après','pendant'],  answer:1 },
    { id:'q15', question:'Nous arrivons ___ quinze minutes.',                options:['dans','vers','sur','en'],        answer:0 },
    { id:'q16', question:'Tu viendras ___ 5 heures pour amener ma sœur.',   options:['en','vers','dans','sous'],       answer:1 },
  ]),
};

// ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('🔐 Connexion à PocketBase...');
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASSWORD);
  console.log('✅ Connecté');

  // 1. Vérifier si le cours existe déjà
  let existingCourse = null;
  try {
    const existing = await pb.collection('courses').getFullList({
      filter: `section="langues" && cours_nom="Français" && niveau="A1"`,
    });
    if (existing.length > 0) {
      existingCourse = existing[0];
      console.log(`ℹ️  Cours existant trouvé : ${existingCourse.id} — ${existingCourse.title}`);
    }
  } catch {}

  // 2. Créer ou mettre à jour le cours
  let courseRecord;
  if (existingCourse) {
    courseRecord = await pb.collection('courses').update(existingCourse.id, COURSE_DATA);
    console.log('✅ Cours mis à jour :', courseRecord.id);
  } else {
    courseRecord = await pb.collection('courses').create(COURSE_DATA);
    console.log('✅ Cours créé :', courseRecord.id, '—', courseRecord.title);
  }

  // 3. Trouver tous les étudiants Langues / Français / A1
  console.log('\n📋 Recherche des étudiants Langues/Français/A1...');
  let students = [];
  try {
    // IMPORTANT : noms de champs PocketBase = case-sensitive → level (minuscule)
    students = await pb.collection('users').getFullList({
      filter: `section="langues" && current_course="Français" && level="A1"`,
    });
    console.log(`👥 ${students.length} étudiant(s) trouvé(s)`);
  } catch (e) {
    console.log('⚠️  Impossible de filtrer par current_course/level:', e.message);
    // Try without filter
    try {
      const all = await pb.collection('users').getFullList({ filter: `section="langues"` });
      students = all;
      console.log(`👥 ${students.length} étudiant(s) en Langues`);
    } catch {}
  }

  // 4. Créer enrollment pour chaque étudiant
  let enrolled = 0;
  for (const student of students) {
    try {
      // Check if enrollment exists
      const existing = await pb.collection('course_enrollments').getFullList({
        filter: `user_id="${student.id}" && course_id="${courseRecord.id}"`,
      });
      if (existing.length === 0) {
        await pb.collection('course_enrollments').create({
          user_id:     student.id,
          course_id:   courseRecord.id,
          status:      'active',
          progression: 0,
          complete:    false,
          start_date:  new Date().toISOString(),
        });
        console.log(`  ✅ Inscrit : ${student.email || student.name || student.id}`);
        enrolled++;
      } else {
        console.log(`  ℹ️  Déjà inscrit : ${student.email || student.name || student.id}`);
      }
    } catch (e) {
      console.log(`  ⚠️  Erreur pour ${student.id}: ${e.message}`);
    }
  }

  console.log(`\n🎉 Terminé !`);
  console.log(`   Cours ID  : ${courseRecord.id}`);
  console.log(`   Titre     : ${courseRecord.title}`);
  console.log(`   Programme : ${courseRecord.section} → ${courseRecord.cours_nom} → Niveau ${courseRecord.niveau}`);
  console.log(`   Inscrits  : ${enrolled} nouvel(aux) étudiant(s)`);
  console.log(`\n👉 Accès étudiant : /dashboard/courses/${courseRecord.id}/view`);

  process.exit(0);
}

main().catch(e => {
  console.error('❌ Erreur :', e.message || e);
  process.exit(1);
});
