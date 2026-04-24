/**
 * recreate-cours-temps-fr.mjs
 *
 * Recrée le cours "Exprimer le temps en français — Niveau A1"
 * avec son contenu pédagogique complet (8 pages) directement
 * depuis le contenu hardcodé du viewer.
 *
 * Usage :
 *   node recreate-cours-temps-fr.mjs
 */

import PocketBase from 'pocketbase';
import { readFileSync } from 'fs';

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

// ── 8 pages pédagogiques (identiques au hardcode du viewer) ───────
const PAGES = [
  { id: 1, title: 'Introduction — Exprimer le temps', content: `<div class="lesson-intro"><div class="lesson-badge">📚 Grammaire Française</div><h2>Exprimer le temps en français</h2><p class="lead">Les <strong>prépositions de temps</strong> permettent de situer une action dans le temps — avant, pendant, après, ou à un moment précis.</p><div class="lesson-objectives"><h4>🎯 Objectifs de cette leçon</h4><ul><li>Comprendre et utiliser correctement les prépositions de temps</li><li>Distinguer les prépositions selon le contexte</li><li>Maîtriser 16 cas pratiques de la langue française</li></ul></div><div class="lesson-highlight"><strong>Dans cette leçon :</strong> à · en · dans · depuis · pendant · après · avant · entre · vers · au · pour</div></div>` },
  { id: 2, title: 'À — Heure et moment précis', content: `<h3>La préposition <span class="prep">à</span></h3><p>On utilise <strong>à</strong> pour indiquer une <em>heure précise</em> ou un <em>moment fixe</em>.</p><div class="rule-box"><div class="rule-icon">⏰</div><div><strong>Règle :</strong> <em>à</em> + heure précise<br/><strong>Exemples :</strong><ul><li>J'arrive au cinéma <strong>à</strong> 7 heures.<span class="inline-trans">= I arrive at the cinema at 7 o'clock.</span></li><li>La réunion commence <strong>à</strong> midi.<span class="inline-trans">= The meeting starts at noon.</span></li><li>Il se lève <strong>à</strong> 6h30 chaque matin.<span class="inline-trans">= He wakes up at 6:30 every morning.</span></li></ul></div></div><div class="info-box">💡 <strong>À retenir :</strong> «à» répond à la question <em>«À quelle heure ?»</em></div>` },
  { id: 3, title: 'En — Mois, saisons et années', content: `<h3>La préposition <span class="prep">en</span></h3><p>On utilise <strong>en</strong> avec les <em>mois</em>, la plupart des <em>saisons</em>, et les <em>années</em>.</p><div class="rule-box"><div class="rule-icon">📅</div><div><strong>Exemples :</strong><ul><li>Marie part en vacances <strong>en</strong> été.<span class="inline-trans">= Marie goes on holiday in summer.</span></li><li>Les cours commencent <strong>en</strong> septembre.<span class="inline-trans">= Classes start in September.</span></li><li>J'ai commencé le piano <strong>en</strong> 2015.<span class="inline-trans">= I started playing the piano in 2015.</span></li></ul></div></div><div class="compare-box"><div class="compare-item good">✅ <strong>en</strong> été, en automne, en hiver</div><div class="compare-item special">⚠️ <strong>au</strong> printemps (masculin !)</div></div>` },
  { id: 4, title: 'Dans — Durée future', content: `<h3>La préposition <span class="prep">dans</span></h3><p><strong>Dans</strong> exprime un délai ou une durée <em>à venir</em>.</p><div class="rule-box"><div class="rule-icon">🔮</div><div><strong>Exemples :</strong><ul><li>Mon anniversaire est <strong>dans</strong> dix jours.<span class="inline-trans">= My birthday is in ten days.</span></li><li>Nous arrivons <strong>dans</strong> quinze minutes.<span class="inline-trans">= We arrive in fifteen minutes.</span></li></ul></div></div><div class="info-box">💡 «dans» répond à <em>«Dans combien de temps ?»</em> — la durée est <strong>future</strong>.</div>` },
  { id: 5, title: 'Depuis — Durée passée jusqu\'à maintenant', content: `<h3>La préposition <span class="prep">depuis</span></h3><p><strong>Depuis</strong> exprime une action qui <em>a commencé dans le passé</em> et qui <em>continue au présent</em>.</p><div class="rule-box"><div class="rule-icon">📆</div><div><strong>Exemples :</strong><ul><li>Pierre travaille ici <strong>depuis</strong> 2018.<span class="inline-trans">= Pierre has been working here since 2018.</span></li><li><strong>Depuis</strong> deux semaines, je suis malade.<span class="inline-trans">= For two weeks, I have been sick.</span></li></ul></div></div><div class="compare-box"><div class="compare-item good">✅ Je travaille ici <strong>depuis</strong> 2018 (encore maintenant)</div><div class="compare-item bad">❌ J'ai travaillé ici <strong>depuis</strong> 2018 (incorrect au passé composé)</div></div>` },
  { id: 6, title: 'Pendant, Avant, Après', content: `<h3><span class="prep">Pendant</span> · <span class="prep">Avant</span> · <span class="prep">Après</span></h3><div class="rule-box"><div class="rule-icon">⌛</div><div><strong>pendant</strong> — durée déterminée<ul><li>Je suis en vacances <strong>pendant</strong> trois semaines.<span class="inline-trans">= I am on holiday for three weeks.</span></li></ul></div></div><div class="rule-box"><div class="rule-icon">⬅️</div><div><strong>avant</strong> — antériorité<ul><li>Je me brosse les dents <strong>avant</strong> d'aller dormir.<span class="inline-trans">= I brush my teeth before going to sleep.</span></li></ul></div></div><div class="rule-box"><div class="rule-icon">➡️</div><div><strong>après</strong> — postériorité<ul><li><strong>Après</strong> le petit-déjeuner, je vais au travail.<span class="inline-trans">= After breakfast, I go to work.</span></li></ul></div></div>` },
  { id: 7, title: 'Entre et Vers', content: `<h3><span class="prep">Entre</span> · <span class="prep">Vers</span></h3><div class="rule-box"><div class="rule-icon">↔️</div><div><strong>entre</strong> — intervalle entre deux moments<ul><li>Je vais chez ma mère <strong>entre</strong> 10 heures et midi.<span class="inline-trans">= I go to my mother's between 10 o'clock and noon.</span></li></ul></div></div><div class="rule-box"><div class="rule-icon">≈</div><div><strong>vers</strong> — approximation temporelle<ul><li>Tu viendras <strong>vers</strong> 5 heures.<span class="inline-trans">= You will come around 5 o'clock.</span></li></ul></div></div><div class="info-box">💡 <strong>Vers</strong> exprime une heure <em>approximative</em>.</div>` },
  { id: 8, title: 'Tableau récapitulatif', content: `<h3>📊 Récapitulatif des prépositions de temps</h3><div class="summary-table"><div class="summary-row header"><div>Préposition</div><div>Usage</div><div>Exemple</div></div><div class="summary-row"><div><span class="prep">à</span></div><div>Heure précise</div><div>à 7 heures</div></div><div class="summary-row"><div><span class="prep">en</span></div><div>Mois, saison (fém.), année</div><div>en été, en 2015</div></div><div class="summary-row"><div><span class="prep">dans</span></div><div>Durée future</div><div>dans dix jours</div></div><div class="summary-row"><div><span class="prep">depuis</span></div><div>Durée passée → présent</div><div>depuis 2018</div></div><div class="summary-row"><div><span class="prep">pendant</span></div><div>Durée déterminée</div><div>pendant trois semaines</div></div><div class="summary-row"><div><span class="prep">avant</span></div><div>Avant un événement</div><div>avant de dormir</div></div><div class="summary-row"><div><span class="prep">après</span></div><div>Après un événement</div><div>après le déjeuner</div></div><div class="summary-row"><div><span class="prep">entre</span></div><div>Intervalle</div><div>entre 10h et midi</div></div><div class="summary-row"><div><span class="prep">vers</span></div><div>Approximation</div><div>vers 5 heures</div></div></div><div class="lesson-highlight" style="margin-top:1.5rem">🎓 Vous avez terminé la leçon ! Passez aux <strong>Exercices</strong> pour tester vos connaissances.</div>` },
];

// ── Exercices QCM (16 questions sur les prépositions de temps) ────
const EXERCISES = [
  { id:'q1',  question:"J'arrive au cinéma ___ 7 heures.",                        options:['dans','en','à','depuis'],            answer:2 },
  { id:'q2',  question:"Marie part en vacances ___ été.",                          options:['à','en','dans','pendant'],           answer:1 },
  { id:'q3',  question:"Mon anniversaire est ___ dix jours.",                     options:['depuis','en','à','dans'],            answer:3 },
  { id:'q4',  question:"Pierre travaille ici ___ 2018.",                          options:['dans','avant','depuis','en'],        answer:2 },
  { id:'q5',  question:"Je suis en vacances ___ trois semaines.",                 options:['depuis','pendant','en','vers'],      answer:1 },
  { id:'q6',  question:"Je me brosse les dents ___ d'aller dormir.",             options:['pendant','vers','avant','après'],    answer:2 },
  { id:'q7',  question:"___ le petit-déjeuner, je vais au travail.",             options:['Vers','Après','Depuis','Pendant'],   answer:1 },
  { id:'q8',  question:"Je vais chez ma mère ___ 10 heures et midi.",            options:['depuis','entre','vers','pendant'],   answer:1 },
  { id:'q9',  question:"Tu viendras ___ 5 heures ? (approximation)",             options:['à','dans','vers','en'],              answer:2 },
  { id:'q10', question:"Les cours commencent ___ septembre.",                    options:['à','dans','depuis','en'],            answer:3 },
  { id:'q11', question:"J'ai commencé le piano ___ 2015.",                       options:['depuis','en','dans','à'],            answer:1 },
  { id:'q12', question:"Nous arrivons ___ quinze minutes.",                      options:['depuis','en','dans','vers'],         answer:2 },
  { id:'q13', question:"___ deux semaines, je suis malade.",                     options:['En','Dans','Depuis','Pendant'],      answer:2 },
  { id:'q14', question:"Les fleurs poussent ___ printemps. (masculin !)",        options:['en','dans','au','à'],                answer:2 },
  { id:'q15', question:"La réunion commence ___ midi.",                          options:['en','à','vers','dans'],              answer:1 },
  { id:'q16', question:"Je travaille ici ___ 2018. (encore maintenant)",         options:['pendant','dans','en','depuis'],      answer:3 },
];

async function main() {
  console.log('🔧 PocketBase :', PB_URL);
  const pb = new PocketBase(PB_URL);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log('✅ Connecté\n');

  // Vérifier si le cours existe déjà
  try {
    const existing = await pb.collection('courses').getFirstListItem(
      'titre="Exprimer le temps en français — Niveau A1"',
      { $autoCancel: false }
    );
    console.log(`ℹ️  Le cours existe déjà : "${existing.titre}" (${existing.id})`);
    console.log('   Mise à jour du contenu...');
    const updated = await pb.collection('courses').update(existing.id, {
      pages:     JSON.stringify(PAGES),
      exercises: JSON.stringify(EXERCISES),
    }, { $autoCancel: false });
    console.log(`✅ Cours mis à jour : "${updated.titre}"`);
    return;
  } catch {
    // N'existe pas → on le crée
  }

  const record = await pb.collection('courses').create({
    titre:         'Exprimer le temps en français — Niveau A1',
    langue:        'Francais',
    categorie_age: 'Ados (13-17 ans)',
    cours_nom:     'Français',
    niveau:        'A1',
    section:       'langues',
    categorie:     'langue',
    description:   'Apprenez à utiliser les prépositions de temps en français : à, en, dans, depuis, pendant, avant, après, entre, vers. 8 leçons progressives et 16 exercices QCM.',
    instructeur:   'IWS Laayoune',
    duree:         60,
    prix:          0,
    pages:         JSON.stringify(PAGES),
    exercises:     JSON.stringify(EXERCISES),
  }, { $autoCancel: false });

  console.log(`✅ Cours recréé : "${record.titre}" (${record.id})`);
  console.log(`   ${PAGES.length} pages pédagogiques`);
  console.log(`   ${EXERCISES.length} exercices QCM`);
  console.log('\n🎓 Le cours est maintenant visible dans la section Langues !');
}

main().catch(err => {
  console.error('\n❌ Erreur :', err.message);
  console.error('   status  :', err?.status);
  console.error('   data    :', JSON.stringify(err?.data, null, 2));
  process.exit(1);
});
