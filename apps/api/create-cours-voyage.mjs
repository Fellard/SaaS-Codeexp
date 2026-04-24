/**
 * create-cours-voyage.mjs
 *
 * Crée le cours "Le voyage — Texte de lecture A1" dans PocketBase.
 * 7 pages pédagogiques + 1 tableau récapitulatif + 6 exercices QCM.
 * Upload du PDF inclus.
 *
 * Usage : node create-cours-voyage.mjs
 */

import PocketBase from 'pocketbase';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

try {
  const env = readFileSync(join(__dirname, '.env'), 'utf8');
  env.split('\n').forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
} catch {}

const PB_URL   = process.env.PB_URL  || 'http://127.0.0.1:8090';
const PB_EMAIL = process.env.PB_SUPERUSER_EMAIL    || '';
const PB_PASS  = process.env.PB_SUPERUSER_PASSWORD || '';

// ═══════════════════════════════════════════════════════════════════
// 8 PAGES PÉDAGOGIQUES — Le voyage (A1)
// ═══════════════════════════════════════════════════════════════════
const PAGES = [
  {
    id: 1,
    title: 'Introduction — Le voyage',
    content: `<div class="lesson-intro">
  <div class="lesson-badge">📖 Compréhension écrite — A1</div>
  <h2>Le voyage</h2>
  <p class="lead">Dans ce cours, tu vas lire un texte sur un voyage en famille à Barcelone. Tu vas apprendre du <strong>vocabulaire du voyage</strong>, comprendre un texte simple et répondre à des questions de compréhension.</p>
  <div class="lesson-objectives">
    <h4>🎯 Objectifs de cette leçon</h4>
    <ul>
      <li>Lire et comprendre un texte narratif de niveau A1</li>
      <li>Identifier les personnages, les lieux et les actions</li>
      <li>Maîtriser le vocabulaire du voyage et des vacances</li>
      <li>Répondre à des questions de compréhension (QCM)</li>
    </ul>
  </div>
  <div class="lesson-highlight"><strong>Personnages :</strong> Hugo (16 ans) · Laura, sa sœur (13 ans) · leurs parents<br/><strong>Destination :</strong> Barcelone, Espagne 🇪🇸</div>
</div>`
  },
  {
    id: 2,
    title: 'Le texte — "Le voyage"',
    content: `<h3>📄 Lis le texte suivant</h3>
<div class="rule-box" style="line-height:1.9">
  <div class="rule-icon">🧳</div>
  <div>
    <p>Je m'appelle <strong>Hugo</strong> et j'ai <strong>seize ans</strong>. Aujourd'hui, avec mes parents et ma sœur nous partons en voyage.</p>
    <p>Ma sœur s'appelle <strong>Laura</strong>, elle a <strong>treize ans</strong>. Nous sommes à l'aéroport : direction <strong>Barcelone</strong> en <strong>Espagne</strong> !</p>
    <p>J'ai déjà pris l'avion car nous sommes allés à <strong>Rome</strong> en Italie, il y a deux ans. À Barcelone, mes parents ont réservé un <strong>appartement près de la plage</strong>.</p>
    <p>Mes parents souhaitent <strong>louer des vélos</strong> pour visiter Barcelone. Ils veulent admirer la célèbre <strong>Sagrada Familia</strong>, se balader dans le <strong>Parc Güell</strong> et goûter la <strong>nourriture locale</strong>.</p>
    <p>Moi, je veux aller au <strong>zoo</strong> et à l'<strong>aquarium</strong>… et manger des <strong>glaces</strong>. Ma sœur préfère aller à la <strong>plage</strong> pour lire et bronzer.</p>
    <p>Nous séjournons <strong>pendant deux semaines</strong> à Barcelone.</p>
    <p>J'espère qu'il y aura beaucoup de soleil. Je n'aime pas la pluie, surtout pendant les vacances.</p>
  </div>
</div>
<div class="info-box">💡 Lis le texte une deuxième fois en faisant attention aux <strong>noms</strong>, aux <strong>lieux</strong> et aux <strong>verbes d'action</strong>.</div>`
  },
  {
    id: 3,
    title: 'Vocabulaire essentiel du voyage',
    content: `<h3>🗝️ Les mots importants du texte</h3>
<div class="rule-box">
  <div class="rule-icon">✈️</div>
  <div>
    <strong>Le transport</strong>
    <ul>
      <li><strong>l'aéroport</strong> (m.)<span class="inline-trans">= the airport</span></li>
      <li><strong>l'avion</strong> (m.)<span class="inline-trans">= the plane</span></li>
      <li><strong>le vélo</strong><span class="inline-trans">= the bicycle</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">🏖️</div>
  <div>
    <strong>L'hébergement et les lieux</strong>
    <ul>
      <li><strong>l'appartement</strong> (m.)<span class="inline-trans">= the apartment / flat</span></li>
      <li><strong>la plage</strong><span class="inline-trans">= the beach</span></li>
      <li><strong>le zoo</strong><span class="inline-trans">= the zoo</span></li>
      <li><strong>l'aquarium</strong> (m.)<span class="inline-trans">= the aquarium</span></li>
      <li><strong>le parc</strong><span class="inline-trans">= the park</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">🍦</div>
  <div>
    <strong>Les activités et la nourriture</strong>
    <ul>
      <li><strong>goûter</strong><span class="inline-trans">= to taste</span></li>
      <li><strong>se balader</strong><span class="inline-trans">= to stroll / to walk around</span></li>
      <li><strong>bronzer</strong><span class="inline-trans">= to sunbathe</span></li>
      <li><strong>admirer</strong><span class="inline-trans">= to admire</span></li>
      <li><strong>séjourner</strong><span class="inline-trans">= to stay (at a place)</span></li>
      <li><strong>la nourriture locale</strong><span class="inline-trans">= local food</span></li>
      <li><strong>une glace</strong><span class="inline-trans">= an ice cream</span></li>
    </ul>
  </div>
</div>`
  },
  {
    id: 4,
    title: 'Comprendre les personnages',
    content: `<h3>👨‍👩‍👧‍👦 Qui est qui dans l'histoire ?</h3>
<div class="rule-box">
  <div class="rule-icon">👦</div>
  <div>
    <strong>Hugo</strong> — le narrateur
    <ul>
      <li>Il a <strong>16 ans</strong>.</li>
      <li>Il veut aller au <strong>zoo</strong> et à l'<strong>aquarium</strong>.<span class="inline-trans">= He wants to go to the zoo and the aquarium.</span></li>
      <li>Il veut manger des <strong>glaces</strong>.<span class="inline-trans">= He wants to eat ice creams.</span></li>
      <li>Il n'aime pas <strong>la pluie</strong>.<span class="inline-trans">= He does not like rain.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">👧</div>
  <div>
    <strong>Laura</strong> — la sœur d'Hugo
    <ul>
      <li>Elle a <strong>13 ans</strong>.</li>
      <li>Elle préfère aller à <strong>la plage</strong> pour <strong>lire et bronzer</strong>.<span class="inline-trans">= She prefers going to the beach to read and sunbathe.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">👨‍👩‍</div>
  <div>
    <strong>Les parents</strong>
    <ul>
      <li>Ils ont réservé un <strong>appartement</strong> près de la plage.<span class="inline-trans">= They booked an apartment near the beach.</span></li>
      <li>Ils veulent <strong>louer des vélos</strong>.<span class="inline-trans">= They want to hire bicycles.</span></li>
      <li>Ils veulent visiter la <strong>Sagrada Familia</strong> et le <strong>Parc Güell</strong>.</li>
    </ul>
  </div>
</div>`
  },
  {
    id: 5,
    title: 'Les lieux — Barcelone et l\'Espagne',
    content: `<h3>🗺️ Les lieux mentionnés dans le texte</h3>
<div class="rule-box">
  <div class="rule-icon">🇪🇸</div>
  <div>
    <strong>L'Espagne</strong>
    <ul>
      <li>Barcelone est une ville d'<strong>Espagne</strong>.<span class="inline-trans">= Barcelona is a city in Spain.</span></li>
      <li>La famille voyage en <strong>avion</strong> jusqu'à Barcelone.<span class="inline-trans">= The family travels by plane to Barcelona.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">⛪</div>
  <div>
    <strong>La Sagrada Familia</strong>
    <ul>
      <li>C'est une <strong>église célèbre</strong> à Barcelone.<span class="inline-trans">= It is a famous church in Barcelona.</span></li>
      <li>Elle est <strong>célèbre</strong> dans le monde entier.<span class="inline-trans">= It is famous all around the world.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">🌿</div>
  <div>
    <strong>Le Parc Güell</strong>
    <ul>
      <li>C'est un <strong>parc</strong> célèbre à Barcelone.<span class="inline-trans">= It is a famous park in Barcelona.</span></li>
      <li>On peut s'y <strong>balader</strong>.<span class="inline-trans">= You can stroll around there.</span></li>
    </ul>
  </div>
</div>
<div class="compare-box">
  <div class="compare-item good">🇮🇹 Rome (Italie) — voyage précédent, il y a <strong>deux ans</strong></div>
  <div class="compare-item special">🇪🇸 Barcelone (Espagne) — voyage <strong>actuel</strong>, deux semaines</div>
</div>`
  },
  {
    id: 6,
    title: 'Grammaire dans le texte',
    content: `<h3>📝 Points de grammaire à retenir</h3>
<div class="rule-box">
  <div class="rule-icon">⏳</div>
  <div>
    <strong>Le passé composé</strong> — actions terminées dans le passé
    <ul>
      <li>Nous <strong>sommes allés</strong> à Rome.<span class="inline-trans">= We went to Rome.</span></li>
      <li>J'<strong>ai déjà pris</strong> l'avion.<span class="inline-trans">= I have already taken the plane.</span></li>
      <li>Mes parents <strong>ont réservé</strong> un appartement.<span class="inline-trans">= My parents booked an apartment.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">🎯</div>
  <div>
    <strong>Vouloir / Souhaiter / Préférer</strong> — exprimer ses désirs
    <ul>
      <li>Mes parents <strong>souhaitent</strong> louer des vélos.<span class="inline-trans">= My parents wish to hire bicycles.</span></li>
      <li>Je <strong>veux</strong> aller au zoo.<span class="inline-trans">= I want to go to the zoo.</span></li>
      <li>Ma sœur <strong>préfère</strong> aller à la plage.<span class="inline-trans">= My sister prefers going to the beach.</span></li>
    </ul>
  </div>
</div>
<div class="rule-box">
  <div class="rule-icon">📅</div>
  <div>
    <strong>Les expressions de temps</strong>
    <ul>
      <li><strong>Aujourd'hui</strong> = today → nous partons en voyage.<span class="inline-trans">= today → we are leaving on a trip.</span></li>
      <li><strong>Il y a deux ans</strong> = two years ago → nous sommes allés à Rome.<span class="inline-trans">= two years ago → we went to Rome.</span></li>
      <li><strong>Pendant deux semaines</strong> = for two weeks → nous séjournons.<span class="inline-trans">= for two weeks → we are staying.</span></li>
    </ul>
  </div>
</div>`
  },
  {
    id: 7,
    title: 'Récapitulatif — Les points clés',
    content: `<h3>📊 Ce qu'il faut retenir</h3>
<div class="summary-table">
  <div class="summary-row header"><div>Qui ?</div><div>Âge</div><div>Activité souhaitée</div></div>
  <div class="summary-row"><div><span class="prep">Hugo</span></div><div>16 ans</div><div>Zoo · Aquarium · Glaces</div></div>
  <div class="summary-row"><div><span class="prep">Laura</span></div><div>13 ans</div><div>Plage · Lire · Bronzer</div></div>
  <div class="summary-row"><div><span class="prep">Les parents</span></div><div>—</div><div>Vélos · Sagrada Familia · Parc Güell · Nourriture locale</div></div>
</div>
<div class="summary-table" style="margin-top:1.2rem">
  <div class="summary-row header"><div>Lieu</div><div>Pays</div><div>Durée</div></div>
  <div class="summary-row"><div><span class="prep">Barcelone</span></div><div>Espagne 🇪🇸</div><div>2 semaines</div></div>
  <div class="summary-row"><div><span class="prep">Rome</span></div><div>Italie 🇮🇹</div><div>voyage précédent</div></div>
</div>
<div class="summary-table" style="margin-top:1.2rem">
  <div class="summary-row header"><div>Transport</div><div>Hébergement</div><div>Météo souhaitée</div></div>
  <div class="summary-row"><div>Avion ✈️</div><div>Appartement près de la plage</div><div>Beaucoup de soleil ☀️</div></div>
</div>
<div class="lesson-highlight" style="margin-top:1.5rem">🎓 Très bien ! Maintenant passe aux <strong>Exercices</strong> pour tester ta compréhension du texte.</div>`
  }
];

// ═══════════════════════════════════════════════════════════════════
// 6 EXERCICES QCM — Compréhension du texte
// ═══════════════════════════════════════════════════════════════════
const EXERCISES = [
  {
    id: 'q1',
    question: "Quel âge a la sœur d'Hugo ?",
    options: ['6 ans', '7 ans', '13 ans', '16 ans'],
    answer: 2
  },
  {
    id: 'q2',
    question: 'Où Hugo et sa famille partent-ils en vacances ?',
    options: ['à Paris', 'à Barcelone', 'en Italie', 'à Rome'],
    answer: 1
  },
  {
    id: 'q3',
    question: 'Pour aller à Barcelone, Hugo et sa famille utilisent :',
    options: ['Le train', "L'avion", 'La voiture', 'Le vélo'],
    answer: 1
  },
  {
    id: 'q4',
    question: 'Que souhaite visiter Hugo ?',
    options: ["L'appartement", 'La Sagrada Familia et le Parc Güell', "Le zoo et l'aquarium", 'La plage'],
    answer: 2
  },
  {
    id: 'q5',
    question: 'Que souhaite manger Hugo ?',
    options: ['Des glaces', 'Des fruits', 'De la nourriture locale', 'Du poisson'],
    answer: 0
  },
  {
    id: 'q6',
    question: 'Pendant combien de temps séjournent-ils à Barcelone ?',
    options: ['2 ans', '2 mois', '2 semaines', '2 jours'],
    answer: 2
  }
];

// ═══════════════════════════════════════════════════════════════════

async function main() {
  console.log('🔧 PocketBase :', PB_URL);
  const pb = new PocketBase(PB_URL);
  await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASS);
  console.log('✅ Connecté\n');

  // Vérifier si le cours existe déjà
  let existingId = null;
  try {
    const existing = await pb.collection('courses').getFirstListItem(
      'titre="Le voyage — Texte de lecture A1"',
      { $autoCancel: false }
    );
    existingId = existing.id;
    console.log(`ℹ️  Cours existant trouvé : "${existing.titre}" (${existing.id})`);
  } catch {}

  // Préparer le FormData (avec PDF si disponible)
  const formData = new FormData();
  formData.append('titre',         'Le voyage — Texte de lecture A1');
  formData.append('langue',        'Francais');
  formData.append('categorie_age', 'Ados (13-17 ans)');
  formData.append('cours_nom',     'Français');
  formData.append('niveau',        'A1');
  formData.append('section',       'langues');
  formData.append('categorie',     'langue');
  formData.append('description',   'Lisez le récit de voyage d\'Hugo et sa famille à Barcelone. Compréhension écrite, vocabulaire du voyage et exercices de lecture pour débutants.');
  formData.append('instructeur',   'IWS Laayoune');
  formData.append('duree',         '45');
  formData.append('prix',          '49');   // 49 MAD = 4.90 USD
  formData.append('pages',         JSON.stringify(PAGES));
  formData.append('exercises',     JSON.stringify(EXERCISES));

  // Ajouter le PDF s'il existe
  const pdfPath = join(__dirname, 'Francais-texte-voyage.pdf');
  if (existsSync(pdfPath)) {
    const pdfBuffer = readFileSync(pdfPath);
    const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
    formData.append('pdf', pdfBlob, 'Francais-texte-voyage.pdf');
    console.log('📎 PDF joint : Francais-texte-voyage.pdf');
  } else {
    console.log('⚠️  PDF non trouvé — cours créé sans fichier PDF.');
  }

  let record;
  if (existingId) {
    record = await pb.collection('courses').update(existingId, formData, { $autoCancel: false });
    console.log(`✅ Cours mis à jour : "${record.titre}" (${record.id})`);
  } else {
    record = await pb.collection('courses').create(formData, { $autoCancel: false });
    console.log(`✅ Cours créé : "${record.titre}" (${record.id})`);
  }

  console.log(`\n📚 ${PAGES.length} pages pédagogiques`);
  PAGES.forEach(p => console.log(`   Page ${p.id} : ${p.title}`));
  console.log(`\n📝 ${EXERCISES.length} exercices QCM`);
  console.log(`\n💰 Prix : 49 MAD (= 4,90 USD)`);
  console.log(`⏱️  Durée : 45 minutes`);
  console.log(`\n🎓 Le cours est disponible dans la section Langues → Français → A1`);
  console.log(`👉 /dashboard/courses/${record.id}/view`);
}

main().catch(err => {
  console.error('\n❌ Erreur :', err.message);
  console.error('   status :', err?.status);
  console.error('   data   :', JSON.stringify(err?.data, null, 2));
  process.exit(1);
});
