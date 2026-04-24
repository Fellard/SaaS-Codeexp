/**
 * inject-pages-prepositions.mjs
 *
 * Injecte le contenu pédagogique complet (8 pages HTML) pour le cours
 * "Toutes les prépositions françaises" dans PocketBase.
 *
 * Usage :
 *   node inject-pages-prepositions.mjs              → cours le plus récent
 *   node inject-pages-prepositions.mjs COURSE_ID    → cours précis
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
      <li>Je vais chez ma mère <strong>à</strong> 10 heures et midi.<span class="inline-trans">= I go to my mother's at 10 o'clock and noon.</span></li>
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
  <div class="compare-item good">✅ <strong>au</strong> printemps (masculin — exception !)</div>
  <div class="compare-item good">✅ <strong>en</strong> été / en automne / en hiver</div>
</div>
<div class="info-box">💡 <strong>Astuce :</strong> «dans» répond à <em>«Dans combien de temps ?»</em> — l'action est dans le futur. «en» répond à <em>«Quand ?»</em> avec un mois ou une saison.</div>`
  },
  {
    id: 3,
    title: 'Depuis, Pendant, Pour — Durée',
    content: `<h3>Exprimer la durée : trois prépositions à ne pas confondre</h3>
<div class="rule-box">
  <div class="rule-icon">📆</div>
  <div>
    <strong><span class="prep">depuis</span></strong> — action commencée dans le passé qui <em>continue</em> au présent<br/>
    <ul>
      <li>Pierre travaille ici <strong>depuis</strong> 2018. <em>(il travaille encore)</em><span class="inline-trans">= Pierre has been working here since 2018.</span></li>
      <li><strong>Depuis</strong> deux semaines, je suis malade.<span class="inline-trans">= For two weeks, I have been sick.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">⌛</div>
  <div>
    <strong><span class="prep">pendant</span></strong> — durée déterminée, action terminée<br/>
    <ul>
      <li>Je suis en vacances <strong>pendant</strong> trois semaines.<span class="inline-trans">= I am on holiday for three weeks.</span></li>
      <li>En Irlande, il pleut <strong>pendant</strong> plusieurs jours.<span class="inline-trans">= In Ireland, it rains for several days.</span></li>
      <li>Je laisse cuire la viande <strong>pendant</strong> quelques minutes.<span class="inline-trans">= I let the meat cook for a few minutes.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">🗓️</div>
  <div>
    <strong><span class="prep">pour</span></strong> — durée prévue, souvent avec un verbe de mouvement<br/>
    <ul>
      <li>Je pars <strong>pour</strong> une semaine. <em>(durée planifiée)</em><span class="inline-trans">= I'm leaving for a week.</span></li>
    </ul>
  </div>
</div>
<div class="compare-box">
  <div class="compare-item good">✅ Je travaille ici <strong>depuis</strong> 2018 <em>(encore maintenant)</em></div>
  <div class="compare-item bad">❌ J'ai travaillé ici <strong>depuis</strong> 2018 <em>(incorrect au passé composé)</em></div>
</div>
<div class="compare-box">
  <div class="compare-item good">✅ J'ai étudié <strong>pendant</strong> 2 heures <em>(c'est terminé)</em></div>
  <div class="compare-item bad">❌ J'ai étudié <strong>depuis</strong> 2 heures <em>(confusion fréquente)</em></div>
</div>`
  },
  {
    id: 4,
    title: 'Avant, Après, Vers, Entre — Ordre et approximation',
    content: `<h3>Situer dans le temps : ordre et approximation</h3>
<div class="rule-box">
  <div class="rule-icon">⬅️</div>
  <div>
    <strong><span class="prep">avant</span></strong> — antériorité<br/>
    <ul>
      <li>Je me brosse les dents <strong>avant</strong> d'aller dormir.<span class="inline-trans">= I brush my teeth before going to sleep.</span></li>
      <li><strong>Avant</strong> le petit-déjeuner, je vais au travail.<span class="inline-trans">= Before breakfast, I go to work.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">➡️</div>
  <div>
    <strong><span class="prep">après</span></strong> — postériorité<br/>
    <ul>
      <li><strong>Après</strong> deux semaines, je suis malade. <em>(au bout de)</em><span class="inline-trans">= After two weeks, I am sick.</span></li>
      <li><strong>Après</strong> le dîner, nous regardons un film.<span class="inline-trans">= After dinner, we watch a film.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">≈</div>
  <div>
    <strong><span class="prep">vers</span></strong> — approximation temporelle ou direction<br/>
    <ul>
      <li>Tu viendras <strong>vers</strong> 5 heures pour amener ma sœur à l'école.<span class="inline-trans">= You will come around 5 o'clock to take my sister to school.</span></li>
      <li>Tu viens manger <strong>vers</strong> 7 heures ?<span class="inline-trans">= Are you coming to eat around 7 o'clock?</span></li>
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
</div>
<div class="info-box">💡 <strong>Vers</strong> exprime toujours une <em>approximation</em> — on ne connaît pas l'heure exacte. «à» exprime une heure <em>précise</em>.</div>`
  },
  {
    id: 5,
    title: 'À, Dans, Sur, Sous, Chez, Loin de — Lieu',
    content: `<h3>Prépositions de lieu : où sommes-nous ?</h3>
<div class="rule-box">
  <div class="rule-icon">📍</div>
  <div>
    <strong><span class="prep">à</span></strong> — ville, destination, lieu précis<br/>
    <ul>
      <li>Je vais <strong>à</strong> Paris tous les jours.<span class="inline-trans">= I go to Paris every day.</span></li>
      <li>Je lis <strong>sur</strong> internet. → <strong>sur</strong> pour les réseaux/surfaces<span class="inline-trans">= I read on the internet.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">📦</div>
  <div>
    <strong><span class="prep">dans</span></strong> — intérieur d'un espace<br/>
    <ul>
      <li>Tu as déjà marché <strong>dans</strong> l'herbe pieds nus ? J'adore !<span class="inline-trans">= Have you ever walked barefoot in the grass? I love it!</span></li>
      <li>Je mets du café <strong>dans</strong> ma tasse.<span class="inline-trans">= I put coffee in my cup.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">⬆️</div>
  <div>
    <strong><span class="prep">sur</span></strong> — surface, contact<br/>
    <ul>
      <li>Marc met 17 bougies <strong>sur</strong> le gâteau d'anniversaire.<span class="inline-trans">= Marc puts 17 candles on the birthday cake.</span></li>
      <li>Les jeunes lisent des informations <strong>sur</strong> internet.<span class="inline-trans">= Young people read information on the internet.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">🏠</div>
  <div>
    <strong><span class="prep">chez</span></strong> — domicile d'une personne (toujours + personne)<br/>
    <strong><span class="prep">loin de</span></strong> — distance<br/>
    <ul>
      <li>Je ne le vois pas. Il doit être <strong>loin de</strong> la plage.<span class="inline-trans">= I can't see him. He must be far from the beach.</span></li>
    </ul>
  </div>
</div>
<div class="compare-box">
  <div class="compare-item good">✅ Je suis <strong>dans</strong> la cuisine <em>(intérieur)</em></div>
  <div class="compare-item good">✅ Le livre est <strong>sur</strong> la table <em>(surface)</em></div>
  <div class="compare-item good">✅ Le chat est <strong>sous</strong> la table <em>(dessous)</em></div>
</div>`
  },
  {
    id: 6,
    title: 'Avec, Sans, Par — Manière et cause',
    content: `<h3>Exprimer la manière, la cause, l'agent</h3>
<div class="rule-box">
  <div class="rule-icon">🤝</div>
  <div>
    <strong><span class="prep">avec</span></strong> — accompagnement, manière, instrument<br/>
    <ul>
      <li>Je mange <strong>avec</strong> une fourchette.<span class="inline-trans">= I eat with a fork.</span></li>
      <li>Il répond <strong>avec</strong> politesse.<span class="inline-trans">= He answers politely.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">🚫</div>
  <div>
    <strong><span class="prep">sans</span></strong> — absence, manque (contraire de avec)<br/>
    <ul>
      <li>Je ne vois rien <strong>sans</strong> mes lunettes.<span class="inline-trans">= I can't see anything without my glasses.</span></li>
      <li>Je ne peux pas acheter <strong>sans</strong> argent.<span class="inline-trans">= I can't buy anything without money.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">🔄</div>
  <div>
    <strong><span class="prep">par</span></strong> — agent, cause, moyen, fréquence<br/>
    <ul>
      <li>C'est arrivé <strong>par</strong> sa faute. <em>(cause)</em><span class="inline-trans">= It happened because of him.</span></li>
      <li>Les enfants se brossent les dents 3 fois <strong>par</strong> jour. <em>(fréquence)</em><span class="inline-trans">= Children brush their teeth 3 times a day.</span></li>
      <li>Anne devrait rentrer <strong>à</strong> pied. ⚠️ → rentrer à pied (pas par)</li>
    </ul>
  </div>
</div>
<div class="compare-box">
  <div class="compare-item good">✅ Je voyage <strong>avec</strong> mes amis <em>(compagnie)</em></div>
  <div class="compare-item good">✅ Je voyage <strong>sans</strong> bagages <em>(absence)</em></div>
  <div class="compare-item good">✅ 3 fois <strong>par</strong> jour <em>(fréquence)</em></div>
  <div class="compare-item bad">❌ 3 fois <strong>dans</strong> un jour <em>(incorrect pour fréquence habituell)</em></div>
</div>
<div class="info-box">💡 <strong>À pied / à vélo / à cheval</strong> → toujours la préposition <strong>à</strong> pour les moyens de transport sans moteur.</div>`
  },
  {
    id: 7,
    title: 'Pour, Grâce à, À cause de — But et cause',
    content: `<h3>Exprimer le but et la cause</h3>
<div class="rule-box">
  <div class="rule-icon">🎯</div>
  <div>
    <strong><span class="prep">pour</span></strong> — but, destination, infinitif<br/>
    <ul>
      <li>Je peux t'aider ? Il reste des choses <strong>à</strong> faire ? → <strong>à</strong> + infinitif</li>
      <li>Ils sont intelligents <strong>pour</strong> comprendre la situation.<span class="inline-trans">= They are clever enough to understand the situation.</span></li>
      <li>Je pars <strong>pour</strong> Paris. <em>(destination)</em><span class="inline-trans">= I'm leaving for Paris.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">😊</div>
  <div>
    <strong><span class="prep">grâce à</span></strong> — cause <em>positive</em><br/>
    <ul>
      <li>Je vois bien <strong>grâce à</strong> mes lunettes.<span class="inline-trans">= I can see well thanks to my glasses.</span></li>
      <li>Il a réussi <strong>grâce à</strong> son travail.<span class="inline-trans">= He succeeded thanks to his work.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">😟</div>
  <div>
    <strong><span class="prep">à cause de</span></strong> — cause <em>négative</em><br/>
    <ul>
      <li>Il est en retard <strong>à cause de</strong> la pluie.<span class="inline-trans">= He is late because of the rain.</span></li>
      <li>C'est arrivé <strong>à cause de</strong> lui.<span class="inline-trans">= It happened because of him.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">🏁</div>
  <div>
    <strong><span class="prep">au</span></strong> — contraction de <em>à + le</em> (lieu, direction)<br/>
    <ul>
      <li><strong>Au</strong> rond-point, prenez la deuxième sortie.<span class="inline-trans">= At the roundabout, take the second exit.</span></li>
      <li>Je vais <strong>au</strong> supermarché. <em>(à + le = au)</em><span class="inline-trans">= I'm going to the supermarket.</span></li>
    </ul>
  </div>
</div>
<div class="compare-box">
  <div class="compare-item good">✅ Il a réussi <strong>grâce à</strong> toi <em>(cause positive)</em></div>
  <div class="compare-item bad">❌ Il a réussi <strong>à cause de</strong> toi <em>(sens négatif !)</em></div>
</div>
<div class="info-box">💡 <strong>À + infinitif</strong> vs <strong>Pour + infinitif</strong> : «Il reste des choses <em>à faire</em>» (à = compléter) · «Je travaille <em>pour</em> réussir» (pour = objectif).</div>`
  },
  {
    id: 8,
    title: 'Tableau récapitulatif — Toutes les prépositions',
    content: `<h3>📊 Récapitulatif — Toutes les prépositions françaises</h3>
<div class="summary-table">
  <div class="summary-row header"><div>Préposition</div><div>Usage principal</div><div>Exemple</div></div>
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

// ══════════════════════════════════════════════════════════════════════

async function expandPagesField(pb) {
  // Récupère la collection "courses" et augmente la limite du champ "pages"
  const collection = await pb.collections.getOne('courses');
  const pagesField = collection.fields?.find(f => f.name === 'pages');

  if (!pagesField) {
    console.log('⚠️  Champ "pages" introuvable dans le schéma — on tente quand même l\'update.');
    return;
  }

  if (pagesField.max && pagesField.max >= 200000) {
    console.log(`ℹ️  Limite du champ "pages" déjà suffisante (${pagesField.max} chars).`);
    return;
  }

  pagesField.max = 200000;
  await pb.collections.update('courses', { fields: collection.fields });
  console.log('✅ Limite du champ "pages" augmentée à 200 000 caractères.');
}

async function main() {
  console.log('🔧 PocketBase :', PB_URL);
  const pb = new PocketBase(PB_URL);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log('✅ Connecté\n');

  // 1. Augmenter la limite du champ pages si nécessaire
  await expandPagesField(pb);

  const targetId = process.argv[2];
  let course;

  if (targetId) {
    course = await pb.collection('courses').getOne(targetId);
    console.log(`\n→ Cours ciblé : "${course.titre}"\n`);
  } else {
    const list = await pb.collection('courses').getList(1, 5, { sort: '-created' });
    if (list.items.length === 0) { console.error('❌ Aucun cours'); process.exit(1); }
    console.log('📋 5 cours récents :');
    list.items.forEach((c, i) =>
      console.log(`   ${i+1}. [${c.id}] ${c.titre} (${new Date(c.created).toLocaleDateString('fr-FR')})`));
    course = list.items[0];
    console.log(`\n→ Mise à jour : "${course.titre}"\n`);
  }

  // 2. Injecter les pages
  const pagesJson = JSON.stringify(PAGES);
  console.log(`📄 Taille du JSON pages : ${pagesJson.length} caractères`);

  const updated = await pb.collection('courses').update(course.id, {
    pages: pagesJson,
  });

  console.log(`\n✅ ${PAGES.length} pages injectées dans "${updated.titre}"`);
  PAGES.forEach(p => console.log(`   Page ${p.id} : ${p.title}`));
  console.log('\n🎓 Rechargez la page — le contenu pédagogique est maintenant disponible !');
}

main().catch(err => {
  console.error('\n❌ Erreur complète :');
  console.error('   message :', err.message);
  console.error('   status  :', err?.status);
  console.error('   data    :', JSON.stringify(err?.data || err?.response, null, 2));
  if (err.message?.includes('ECONNREFUSED')) {
    console.error('   → PocketBase non accessible sur', PB_URL);
  }
  process.exit(1);
});
