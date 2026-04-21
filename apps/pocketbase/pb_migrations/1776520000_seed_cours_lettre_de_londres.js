/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {

  // ── Pages de lecture ─────────────────────────────────────────────
  const pages = [
    {
      id: 1,
      title: "Introduction — Lettre de Londres",
      content: `<div class="lesson-intro">
        <div class="lesson-badge">📚 Lecture Française — Niveau A1</div>
        <h2>Lettre de Londres</h2>
        <p class="lead">Dans cette leçon, vous allez lire une <strong>lettre authentique</strong> écrite par une étudiante française vivant à Londres. Vous travaillerez votre compréhension écrite en français.</p>
        <div class="lesson-objectives">
          <h4>🎯 Objectifs de cette leçon</h4>
          <ul>
            <li>Lire et comprendre un texte en français de niveau A1</li>
            <li>Identifier des informations précises dans une lettre</li>
            <li>Enrichir votre vocabulaire sur la vie quotidienne et les voyages</li>
          </ul>
        </div>
        <div class="lesson-highlight"><strong>Thème :</strong> La vie à Londres — logement, transport, loisirs, amitié</div>
      </div>`
    },
    {
      id: 2,
      title: "La Lettre — Partie 1 : Arrivée à Londres",
      content: `<div class="rule-box">
        <div class="rule-icon">✉️</div>
        <div>
          <p style="font-style:italic;font-size:1.05em;line-height:1.8">
            <strong>Ma chère Sonia,</strong><br/><br/>
            Je suis bien arrivée à <strong>Londres</strong> pour ma dernière année d'études de <strong>marketing à l'université</strong>.
            Là-bas tout le monde parle <em>anglais</em> ! Londres est différent de Paris.
            Par exemple, les <strong>bus sont rouges</strong> et certaines stations de métro semblent très anciennes.
          </p>
        </div>
      </div>
      <div class="info-box">
        💡 <strong>Vocabulaire clé :</strong><br/>
        • <em>bien arrivée</em> = arrived safely<br/>
        • <em>dernière année</em> = final year<br/>
        • <em>études de marketing</em> = marketing studies<br/>
        • <em>semblent très anciennes</em> = seem very old
      </div>`
    },
    {
      id: 3,
      title: "La Lettre — Partie 2 : L'appartement et les amies",
      content: `<div class="rule-box">
        <div class="rule-icon">🏠</div>
        <div>
          <p style="font-style:italic;font-size:1.05em;line-height:1.8">
            Je <strong>partage un appartement</strong> avec deux autres étudiantes.
            L'une s'appelle <strong>Jennifer</strong> et elle a <strong>21 ans</strong> et l'autre s'appelle <strong>Ashley</strong> et elle a <strong>22 ans</strong>.
            Elles sont <em>sympathiques</em>. Elles m'ont promis de me faire découvrir tout Londres :
            nous visiterons les <strong>musées</strong>, les <strong>monuments</strong> et les <strong>parcs</strong>.
            Nous irons aussi nous amuser à <strong>Camden Town</strong> et voir des concerts.
            Et bien sûr, nous irons faire du <strong>shopping à Oxford Street</strong> et dans le quartier de <strong>Covent Garden</strong>.
          </p>
        </div>
      </div>
      <div class="info-box">
        💡 <strong>Vocabulaire clé :</strong><br/>
        • <em>je partage</em> = I share<br/>
        • <em>sympathiques</em> = nice / friendly<br/>
        • <em>elles m'ont promis</em> = they promised me<br/>
        • <em>nous visiterons</em> = we will visit (futur simple)
      </div>`
    },
    {
      id: 4,
      title: "La Lettre — Partie 3 : La visite de Sonia",
      content: `<div class="rule-box">
        <div class="rule-icon">🗓️</div>
        <div>
          <p style="font-style:italic;font-size:1.05em;line-height:1.8">
            J'ai hâte que tu viennes me rendre visite <strong>le mois prochain</strong>,
            pour te montrer mes endroits préférés !<br/><br/>
            <strong>À très bientôt, bisous Emilie</strong>
          </p>
        </div>
      </div>
      <div class="info-box">
        💡 <strong>Vocabulaire clé :</strong><br/>
        • <em>j'ai hâte que</em> = I can't wait for<br/>
        • <em>rendre visite</em> = to visit (a person)<br/>
        • <em>le mois prochain</em> = next month<br/>
        • <em>mes endroits préférés</em> = my favourite places
      </div>
      <div class="lesson-highlight">
        ✅ Vous avez lu la lettre complète ! Passez aux <strong>Exercices</strong> pour tester votre compréhension.
      </div>`
    },
    {
      id: 5,
      title: "Points de grammaire — Le futur simple",
      content: `<h3>📝 Le <span class="prep">futur simple</span> dans la lettre</h3>
      <p>Émilie parle de ce qu'elle va faire à l'avenir. Elle utilise le <strong>futur simple</strong>.</p>
      <div class="rule-box">
        <div class="rule-icon">🔮</div>
        <div>
          <strong>Exemples tirés de la lettre :</strong>
          <ul>
            <li>nous <strong>visiterons</strong> les musées → we <em>will visit</em> the museums</li>
            <li>nous <strong>irons</strong> à Camden Town → we <em>will go</em> to Camden Town</li>
            <li>nous <strong>irons</strong> faire du shopping → we <em>will go</em> shopping</li>
          </ul>
        </div>
      </div>
      <div class="compare-box">
        <div class="compare-item good">✅ <strong>visiter → nous visiterons</strong> (futur simple)</div>
        <div class="compare-item good">✅ <strong>aller → nous irons</strong> (futur simple irrégulier)</div>
      </div>
      <div class="info-box">💡 Le futur simple se forme avec l'infinitif + <strong>-ons, -ez, -ont</strong> etc. pour « aller » : ir- + terminaison</div>`
    }
  ];

  // ── Exercices QCM ────────────────────────────────────────────────
  // Format : { id, question, options: string[], answer: number (0-indexed) }
  const exercises = [
    {
      id: "q1",
      question: "Où est partie étudier Emilie ?",
      options: ["à Paris", "à Londres", "à Oxford", "en France"],
      answer: 1
    },
    {
      id: "q2",
      question: "Qu'étudie Emilie ?",
      options: ["le commerce", "le tourisme", "le marketing", "le droit"],
      answer: 2
    },
    {
      id: "q3",
      question: "De quelle couleur sont les bus à Londres ?",
      options: ["rouges", "verts", "blancs", "bleus"],
      answer: 0
    },
    {
      id: "q4",
      question: "Où habite Emilie à Londres ?",
      options: ["à l'hôtel", "dans un appartement", "chez ses parents", "à l'université"],
      answer: 1
    },
    {
      id: "q5",
      question: "Où va-t-elle aller voir des concerts ?",
      options: ["au musée", "à Camden Town", "à Covent Garden", "à Oxford Street"],
      answer: 1
    },
    {
      id: "q6",
      question: "Quand Sonia va-t-elle venir à Londres ?",
      options: ["demain", "la semaine prochaine", "le mois prochain", "c'est Emilie qui va aller à Paris"],
      answer: 2
    }
  ];

  // ── Créer le cours dans PocketBase ───────────────────────────────
  const collection = app.findCollectionByNameOrId("courses");

  // Vérifier si le cours existe déjà (éviter les doublons)
  try {
    const existing = app.findRecordsByFilter(
      "courses",
      'titre = "Lettre de Londres — Niveau A1"',
      "", 1, 0
    );
    if (existing && existing.length > 0) {
      console.log("Cours 'Lettre de Londres' existe déjà, migration ignorée.");
      return;
    }
  } catch { /* collection vide ou filtre échoue — continuer */ }

  const record = new Record(collection, {
    titre:          "Lettre de Londres — Niveau A1",
    title:          "Letter from London — Level A1",
    titre_fr:       "Lettre de Londres — Niveau A1",
    titre_en:       "Letter from London — Level A1",
    titre_ar:       "رسالة من لندن — المستوى A1",
    section:        "langues",
    cours_nom:      "Français",
    langue:         "Francais",
    categorie_age:  "Adultes",
    niveau:         "A1",
    prix:           0,
    duree:          30,
    description_fr: "Lisez une lettre authentique écrite par une étudiante française vivant à Londres. Compréhension écrite niveau A1 avec 6 questions QCM.",
    description_en: "Read an authentic letter written by a French student living in London. Reading comprehension level A1 with 6 multiple choice questions.",
    pages:          JSON.stringify(pages),
    exercises:      JSON.stringify(exercises),
  });

  app.save(record);
  console.log("✅ Cours 'Lettre de Londres A1' créé avec succès !");

}, (app) => {
  // Revert : supprimer le cours
  try {
    const records = app.findRecordsByFilter(
      "courses",
      'titre = "Lettre de Londres — Niveau A1"',
      "", 1, 0
    );
    if (records && records.length > 0) {
      app.delete(records[0]);
      console.log("Cours 'Lettre de Londres A1' supprimé (revert migration).");
    }
  } catch { /* rien à supprimer */ }
});
