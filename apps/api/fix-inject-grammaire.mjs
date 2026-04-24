/**
 * fix-inject-grammaire.mjs
 *
 * 1. Restaure "Lettre de Londres" (id: 3fjrmvr3htyxbm9) → vide les pages
 *    pour que le PDF s'affiche à nouveau.
 * 2. Injecte les 8 pages pédagogiques dans "Grammaire-Toutes les prépositions"
 *    (id: 2bzzdva06wbyxbv).
 *
 * Usage : node fix-inject-grammaire.mjs
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

const LETTRE_LONDRES_ID  = '3fjrmvr3htyxbm9';
const GRAMMAIRE_ID       = '2bzzdva06wbyxbv';

// ══════════════════════════════════════════════════════════════════════
// 8 PAGES PÉDAGOGIQUES — Toutes les prépositions françaises
// ══════════════════════════════════════════════════════════════════════
const PAGES = [
  {
    id: 1,
    title: 'Introduction — Les prépositions françaises',
    content: `<div class="lesson-intro">
  <div class="lesson-badge">📚 Grammaire Française</div>
  <h2>Toutes les prépositions françaises</h2>
  <p class="lead">Les <strong>prépositions</strong> sont de petits mots qui relient des éléments de la phrase. Elles indiquent un lieu, un temps, une manière, une cause ou un but.</p>
  <div class="lesson-objectives">
    <h4>🎯 Objectifs de cette leçon</h4>
    <ul>
      <li>Maîtriser les prépositions de lieu : <em>à, dans, sur, sous, chez, loin de…</em></li>
      <li>Maîtriser les prépositions de temps : <em>en, à, dans, depuis, pendant…</em></li>
      <li>Comprendre les prépositions de manière et de cause : <em>avec, sans, par, grâce à…</em></li>
      <li>Éviter les erreurs les plus fréquentes</li>
    </ul>
  </div>
  <div class="lesson-highlight"><strong>Dans cette leçon :</strong> à · en · dans · sur · sous · avec · sans · par · pour · depuis · pendant · vers · grâce à · à cause de · chez · loin de</div>
</div>`
  },
  {
    id: 2,
    title: 'À, En, Dans — Prépositions de temps (1)',
    content: `<h3>Trois prépositions proches, mais différentes</h3>
<div class="rule-box">
  <div class="rule-icon">⏰</div>
  <div>
    <strong><span class="prep">à</span></strong> — heure précise, moment fixe<br/>
    <ul>
      <li>J'arrive au cinéma <strong>à</strong> 7 heures.<span class="inline-trans">= I arrive at the cinema at 7 o'clock.</span></li>
      <li>Mon vol pour Paris est prévu <strong>à</strong> lundi.<span class="inline-trans">= My flight to Paris is scheduled for Monday.</span></li>
      <li>Je vais chez ma mère <strong>à</strong> 10 heures.<span class="inline-trans">= I go to my mother's at 10 o'clock.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">📅</div>
  <div>
    <strong><span class="prep">en</span></strong> — mois, saison (féminin), année<br/>
    <ul>
      <li>Marie part en vacances <strong>en</strong> été.<span class="inline-trans">= Marie goes on holiday in summer.</span></li>
      <li>Les cours commencent <strong>en</strong> septembre.<span class="inline-trans">= Classes start in September.</span></li>
      <li>J'ai commencé le piano <strong>en</strong> 2015.<span class="inline-trans">= I started playing the piano in 2015.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">🔮</div>
  <div>
    <strong><span class="prep">dans</span></strong> — délai futur (dans combien de temps ?)<br/>
    <ul>
      <li>Mon anniversaire est <strong>dans</strong> dix jours.<span class="inline-trans">= My birthday is in ten days.</span></li>
      <li>Nous arrivons <strong>dans</strong> quinze minutes.<span class="inline-trans">= We arrive in fifteen minutes.</span></li>
    </ul>
  </div>
</div>
<div class="compare-box">
  <div class="compare-item good">✅ Je travaille ici <strong>depuis</strong> 2018 (encore maintenant)</div>
  <div class="compare-item special">⚠️ <strong>au</strong> printemps (masculin !)</div>
</div>`
  },
  {
    id: 3,
    title: 'Depuis, Pendant, Pour — Durée',
    content: `<h3>Exprimer la durée</h3>
<div class="rule-box">
  <div class="rule-icon">📆</div>
  <div>
    <strong><span class="prep">depuis</span></strong> — action commencée dans le passé, encore en cours<br/>
    <ul>
      <li>Pierre travaille ici <strong>depuis</strong> 2018.<span class="inline-trans">= Pierre has been working here since 2018.</span></li>
      <li><strong>Depuis</strong> deux semaines, je suis malade.<span class="inline-trans">= For two weeks, I have been sick.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">⌛</div>
  <div>
    <strong><span class="prep">pendant</span></strong> — durée déterminée, terminée<br/>
    <ul>
      <li>Je suis en vacances <strong>pendant</strong> trois semaines.<span class="inline-trans">= I am on holiday for three weeks.</span></li>
      <li>Il a plu <strong>pendant</strong> toute la nuit.<span class="inline-trans">= It rained all night long.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">🎯</div>
  <div>
    <strong><span class="prep">pour</span></strong> — durée prévue ou but<br/>
    <ul>
      <li>Je pars <strong>pour</strong> une semaine.<span class="inline-trans">= I am leaving for a week.</span></li>
      <li>J'étudie <strong>pour</strong> réussir mon examen.<span class="inline-trans">= I study to pass my exam.</span></li>
    </ul>
  </div>
</div>
<div class="compare-box">
  <div class="compare-item good">✅ <strong>depuis</strong> 2018 → encore maintenant</div>
  <div class="compare-item bad">❌ <strong>depuis</strong> avec passé composé (interdit)</div>
</div>`
  },
  {
    id: 4,
    title: 'Avant, Après, Vers, Entre — Ordre et approximation',
    content: `<h3>Situer dans le temps</h3>
<div class="rule-box">
  <div class="rule-icon">⬅️</div>
  <div>
    <strong><span class="prep">avant</span></strong> — antériorité<br/>
    <ul>
      <li>Je me brosse les dents <strong>avant</strong> d'aller dormir.<span class="inline-trans">= I brush my teeth before going to sleep.</span></li>
      <li>Arrive <strong>avant</strong> midi !<span class="inline-trans">= Arrive before noon!</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">➡️</div>
  <div>
    <strong><span class="prep">après</span></strong> — postériorité<br/>
    <ul>
      <li><strong>Après</strong> le petit-déjeuner, je vais au travail.<span class="inline-trans">= After breakfast, I go to work.</span></li>
      <li>On se voit <strong>après</strong> les cours.<span class="inline-trans">= We see each other after class.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">≈</div>
  <div>
    <strong><span class="prep">vers</span></strong> — approximation temporelle<br/>
    <ul>
      <li>Tu viendras <strong>vers</strong> 5 heures.<span class="inline-trans">= You will come around 5 o'clock.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">↔️</div>
  <div>
    <strong><span class="prep">entre</span></strong> — intervalle entre deux moments<br/>
    <ul>
      <li>Je vais chez ma mère <strong>entre</strong> 10 heures et midi.<span class="inline-trans">= I go to my mother's between 10 o'clock and noon.</span></li>
    </ul>
  </div>
</div>`
  },
  {
    id: 5,
    title: 'À, Dans, Sur, Sous, Chez, Loin de — Lieu',
    content: `<h3>Prépositions de lieu</h3>
<div class="rule-box">
  <div class="rule-icon">📍</div>
  <div>
    <strong><span class="prep">à</span></strong> — ville, destination<br/>
    <ul>
      <li>Je vis <strong>à</strong> Paris.<span class="inline-trans">= I live in Paris.</span></li>
      <li>Je vais <strong>à</strong> l'école.<span class="inline-trans">= I go to school.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">📦</div>
  <div>
    <strong><span class="prep">dans</span></strong> — intérieur d'un espace<br/>
    <ul>
      <li>Je mets du café <strong>dans</strong> ma tasse.<span class="inline-trans">= I put coffee in my cup.</span></li>
      <li>Le chat est <strong>dans</strong> la boîte.<span class="inline-trans">= The cat is in the box.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">🪑</div>
  <div>
    <strong><span class="prep">sur</span></strong> — surface<br/>
    <ul>
      <li>Le livre est <strong>sur</strong> la table.<span class="inline-trans">= The book is on the table.</span></li>
      <li>Je cherche <strong>sur</strong> internet.<span class="inline-trans">= I search on the internet.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">⬇️</div>
  <div>
    <strong><span class="prep">sous</span></strong> — en dessous<br/>
    <ul>
      <li>Le chat est <strong>sous</strong> la table.<span class="inline-trans">= The cat is under the table.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">🏠</div>
  <div>
    <strong><span class="prep">chez</span></strong> — domicile d'une personne<br/>
    <ul>
      <li>Je suis <strong>chez</strong> mon oncle.<span class="inline-trans">= I am at my uncle's place.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">🗺️</div>
  <div>
    <strong><span class="prep">loin de</span></strong> — distance<br/>
    <ul>
      <li>Ma maison est <strong>loin de</strong> la plage.<span class="inline-trans">= My house is far from the beach.</span></li>
    </ul>
  </div>
</div>`
  },
  {
    id: 6,
    title: 'Avec, Sans, Par — Manière et cause',
    content: `<h3>Exprimer la manière et la cause</h3>
<div class="rule-box">
  <div class="rule-icon">🤝</div>
  <div>
    <strong><span class="prep">avec</span></strong> — compagnie, manière<br/>
    <ul>
      <li>Je voyage <strong>avec</strong> mes amis.<span class="inline-trans">= I travel with my friends.</span></li>
      <li>Elle parle <strong>avec</strong> gentillesse.<span class="inline-trans">= She speaks with kindness.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">🚫</div>
  <div>
    <strong><span class="prep">sans</span></strong> — absence, manque<br/>
    <ul>
      <li>Je ne peux pas lire <strong>sans</strong> lunettes.<span class="inline-trans">= I cannot read without glasses.</span></li>
      <li>Il est parti <strong>sans</strong> dire au revoir.<span class="inline-trans">= He left without saying goodbye.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">⚙️</div>
  <div>
    <strong><span class="prep">par</span></strong> — cause, agent passif, fréquence<br/>
    <ul>
      <li>C'est <strong>par</strong> sa faute que nous sommes en retard.<span class="inline-trans">= It is because of him that we are late.</span></li>
      <li>Je vais au bureau trois fois <strong>par</strong> semaine.<span class="inline-trans">= I go to the office three times a week.</span></li>
      <li>La lettre a été écrite <strong>par</strong> le directeur.<span class="inline-trans">= The letter was written by the director.</span></li>
    </ul>
  </div>
</div>`
  },
  {
    id: 7,
    title: 'Pour, Grâce à, À cause de — But et cause',
    content: `<h3>Exprimer le but et la cause</h3>
<div class="rule-box">
  <div class="rule-icon">🎯</div>
  <div>
    <strong><span class="prep">pour</span></strong> — but, objectif<br/>
    <ul>
      <li>J'étudie <strong>pour</strong> réussir.<span class="inline-trans">= I study in order to succeed.</span></li>
      <li>Ce médicament est <strong>pour</strong> la toux.<span class="inline-trans">= This medicine is for coughs.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">✨</div>
  <div>
    <strong><span class="prep">grâce à</span></strong> — cause positive<br/>
    <ul>
      <li><strong>Grâce à</strong> son travail, il a réussi.<span class="inline-trans">= Thanks to his work, he succeeded.</span></li>
      <li><strong>Grâce à</strong> toi, tout va bien.<span class="inline-trans">= Thanks to you, everything is fine.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">⚠️</div>
  <div>
    <strong><span class="prep">à cause de</span></strong> — cause négative<br/>
    <ul>
      <li>Je suis en retard <strong>à cause de</strong> la pluie.<span class="inline-trans">= I am late because of the rain.</span></li>
      <li><strong>À cause de</strong> lui, on a raté le train.<span class="inline-trans">= Because of him, we missed the train.</span></li>
    </ul>
  </div>
</div>
<div class="compare-box">
  <div class="compare-item good">✅ <strong>grâce à</strong> → résultat positif</div>
  <div class="compare-item bad">❌ <strong>à cause de</strong> → résultat négatif</div>
</div>`
  },
  {
    id: 8,
    title: 'Tableau récapitulatif — Toutes les prépositions',
    content: `<h3>📊 Récapitulatif de toutes les prépositions</h3>
<div class="summary-table">
  <div class="summary-row header"><div>Préposition</div><div>Usage</div><div>Exemple</div></div>
  <div class="summary-row"><div><span class="prep">à</span></div><div>Heure précise · ville · destination</div><div>à 7h · à Paris</div></div>
  <div class="summary-row"><div><span class="prep">en</span></div><div>Mois · saison fém. · année</div><div>en été · en 2015</div></div>
  <div class="summary-row"><div><span class="prep">dans</span></div><div>Délai futur · intérieur</div><div>dans 10 jours · dans la cuisine</div></div>
  <div class="summary-row"><div><span class="prep">sur</span></div><div>Surface · internet</div><div>sur la table · sur internet</div></div>
  <div class="summary-row"><div><span class="prep">sous</span></div><div>En dessous</div><div>sous la table</div></div>
  <div class="summary-row"><div><span class="prep">depuis</span></div><div>Durée passée → présent</div><div>depuis 2018</div></div>
  <div class="summary-row"><div><span class="prep">pendant</span></div><div>Durée déterminée (terminée)</div><div>pendant 3 semaines</div></div>
  <div class="summary-row"><div><span class="prep">pour</span></div><div>But · durée prévue</div><div>pour réussir · pour une semaine</div></div>
  <div class="summary-row"><div><span class="prep">avant</span></div><div>Antériorité</div><div>avant de dormir</div></div>
  <div class="summary-row"><div><span class="prep">après</span></div><div>Postériorité</div><div>après le dîner</div></div>
  <div class="summary-row"><div><span class="prep">vers</span></div><div>Approximation temporelle</div><div>vers 5 heures</div></div>
  <div class="summary-row"><div><span class="prep">avec</span></div><div>Compagnie · manière</div><div>avec mes amis</div></div>
  <div class="summary-row"><div><span class="prep">sans</span></div><div>Absence</div><div>sans lunettes</div></div>
  <div class="summary-row"><div><span class="prep">par</span></div><div>Cause · fréquence · agent</div><div>par sa faute · 3 fois par jour</div></div>
  <div class="summary-row"><div><span class="prep">grâce à</span></div><div>Cause positive</div><div>grâce à son travail</div></div>
  <div class="summary-row"><div><span class="prep">à cause de</span></div><div>Cause négative</div><div>à cause de la pluie</div></div>
  <div class="summary-row"><div><span class="prep">au / aux</span></div><div>à + le / à + les (contraction)</div><div>au marché · aux toilettes</div></div>
  <div class="summary-row"><div><span class="prep">chez</span></div><div>Domicile d'une personne</div><div>chez mon oncle</div></div>
  <div class="summary-row"><div><span class="prep">loin de</span></div><div>Distance</div><div>loin de la plage</div></div>
</div>
<div class="lesson-highlight" style="margin-top:1.5rem">🎓 Vous avez terminé la leçon ! Passez aux <strong>Exercices</strong> pour tester vos connaissances sur toutes les prépositions.</div>`
  }
];

async function main() {
  console.log('🔧 PocketBase :', PB_URL);
  const pb = new PocketBase(PB_URL);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log('✅ Connecté\n');

  // ── ÉTAPE 1 : Restaurer "Lettre de Londres" ────────────────────────
  console.log('🔧 Étape 1 : Restauration de "Lettre de Londres"...');
  try {
    const lettre = await pb.collection('courses').getOne(LETTRE_LONDRES_ID, { $autoCancel: false });
    console.log(`   Cours trouvé : "${lettre.titre}"`);
    await pb.collection('courses').update(LETTRE_LONDRES_ID, { pages: '' }, { $autoCancel: false });
    console.log('   ✅ Pages vidées → le PDF s\'affichera à nouveau.\n');
  } catch (e) {
    console.log(`   ⚠️  Impossible de trouver le cours Lettre de Londres (${e.message})\n`);
  }

  // ── ÉTAPE 2 : Injecter dans "Grammaire-Toutes les prépositions" ────
  console.log('🔧 Étape 2 : Injection dans "Grammaire-Toutes les prépositions"...');
  try {
    const grammaire = await pb.collection('courses').getOne(GRAMMAIRE_ID, { $autoCancel: false });
    console.log(`   Cours trouvé : "${grammaire.titre}"`);

    const pagesJson = JSON.stringify(PAGES);
    console.log(`   Taille du JSON : ${pagesJson.length} caractères`);

    const updated = await pb.collection('courses').update(GRAMMAIRE_ID, {
      pages: pagesJson,
    }, { $autoCancel: false });

    console.log(`\n   ✅ ${PAGES.length} pages injectées dans "${updated.titre}"`);
    PAGES.forEach(p => console.log(`      Page ${p.id} : ${p.title}`));
  } catch (e) {
    console.log(`   ❌ Erreur pour Grammaire : ${e.message}`);
    console.log(`   data : ${JSON.stringify(e?.data, null, 2)}`);
  }

  console.log('\n🎓 Rechargez les pages étudiantes pour vérifier.');
}

main().catch(err => {
  console.error('\n❌ Erreur globale :', err.message);
  process.exit(1);
});
