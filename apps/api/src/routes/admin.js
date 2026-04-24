import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const router = express.Router();

// ── Auth middleware: vérifie que le token appartient à un admin ──
// Décode le JWT (sans vérification de signature serveur) pour récupérer l'user ID,
// puis charge l'enregistrement via le client superuser pour vérifier le rôle.
async function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!token) return res.status(401).json({ error: 'Token manquant' });

  try {
    // Décode le payload JWT (partie centrale en base64url)
    const parts = token.split('.');
    if (parts.length < 2) throw new Error('JWT malformé');
    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    );

    // Vérifie expiration
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return res.status(401).json({ error: 'Token expiré' });
    }

    const userId = payload.id;
    if (!userId) throw new Error('ID utilisateur absent du token');

    // Charge l'utilisateur via le client superuser pour vérifier le rôle
    const user = await pb.collection('users').getOne(userId, { $autoCancel: false });
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé — rôle admin requis' });
    }
    req.adminUser = user;
    next();
  } catch (err) {
    logger.warn('requireAdmin:', err?.message);
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

// ── Helper: supprime tous les enregistrements d'une collection pour un filtre donné
async function deleteAll(collection, filter) {
  try {
    const records = await pb.collection(collection).getFullList({
      filter,
      $autoCancel: false,
    });
    for (const r of records) {
      await pb.collection(collection).delete(r.id, { $autoCancel: false });
    }
    return records.length;
  } catch (err) {
    // Si la collection n'existe pas ou filtre invalide → on ignore
    logger.warn(`deleteAll(${collection}, ${filter}): ${err?.message}`);
    return 0;
  }
}

// ── DELETE /admin/students/:id ─────────────────────────────────────
// Suppression complète d'un étudiant avec cascade sur toutes les collections liées.
// Le client PocketBase superuser contourne les deleteRules de collection.
router.delete('/students/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  logger.info(`Admin cascade-delete student: ${id}`);

  try {
    // 1. Vérifier que l'utilisateur existe et n'est pas admin
    let targetUser;
    try {
      targetUser = await pb.collection('users').getOne(id, { $autoCancel: false });
    } catch {
      return res.status(404).json({ error: 'Étudiant introuvable' });
    }
    if (targetUser.role === 'admin') {
      return res.status(403).json({ error: 'Impossible de supprimer un compte admin' });
    }

    const deleted = {};

    // ── Étape 1 : collections dépendant d'autres collections (enfants d'enfants) ──

    // artist_uploads dépend de artists → supprimer d'abord les uploads
    try {
      const artists = await pb.collection('artists').getFullList({
        filter: `user_id="${id}"`,
        $autoCancel: false,
      });
      for (const artist of artists) {
        const n = await deleteAll('artist_uploads', `artist_id="${artist.id}"`);
        deleted.artist_uploads = (deleted.artist_uploads || 0) + n;
      }
    } catch { /* artists n'existe pas ou pas de résultats — OK */ }

    // crm_interactions dépend de crm_clients → supprimer d'abord les interactions
    try {
      const clients = await pb.collection('crm_clients').getFullList({
        filter: `user_id="${id}"`,
        $autoCancel: false,
      });
      for (const client of clients) {
        const n = await deleteAll('crm_interactions', `client_id="${client.id}"`);
        deleted.crm_interactions = (deleted.crm_interactions || 0) + n;
      }
    } catch { /* crm_clients n'existe pas — OK */ }

    // payments liés aux orders de l'utilisateur
    try {
      const orders = await pb.collection('orders').getFullList({
        filter: `user_id="${id}"`,
        $autoCancel: false,
      });
      for (const order of orders) {
        const n = await deleteAll('payments', `order_id="${order.id}"`);
        deleted.payments_by_order = (deleted.payments_by_order || 0) + n;
      }
    } catch { /* OK */ }

    // ── Étape 2 : collections avec user_id required (toutes) ──

    deleted.artists           = await deleteAll('artists',           `user_id="${id}"`);
    deleted.crm_clients       = await deleteAll('crm_clients',       `user_id="${id}"`);
    deleted.studio_reservations = await deleteAll('studio_reservations', `user_id="${id}"`);
    deleted.enrollments       = await deleteAll('enrollments',       `user_id="${id}"`);
    deleted.course_enrollments = await deleteAll('course_enrollments', `user_id="${id}"`);
    deleted.orders            = await deleteAll('orders',            `user_id="${id}"`);
    deleted.payments          = await deleteAll('payments',          `user_id="${id}"`);
    deleted.pending_approval  = await deleteAll('pending_approval',  `user_id="${id}"`);

    // ── Étape 3 : supprimer l'utilisateur lui-même ──
    await pb.collection('users').delete(id, { $autoCancel: false });

    logger.info(`Student ${id} (${targetUser.email}) deleted. Cascade: ${JSON.stringify(deleted)}`);
    return res.json({
      success: true,
      message: `Étudiant "${targetUser.email}" supprimé avec succès`,
      deleted,
    });

  } catch (err) {
    logger.error(`Erreur suppression étudiant ${id}:`, err);
    return res.status(500).json({
      error: 'Erreur lors de la suppression',
      detail: err?.message || String(err),
    });
  }
});

// ── Helper : mappe les champs frontend → noms exacts de champs PocketBase ──
// La collection `courses` a ses propres noms de champs (titre, duree, prix, langue, etc.)
// Cette fonction garantit que les bons noms sont envoyés à PocketBase.
function normalizeCourseFields(body) {
  const normalized = { ...body };

  // Mapping des anciens noms → vrais noms PocketBase
  if (normalized.title   !== undefined && normalized.titre   === undefined) normalized.titre   = normalized.title;
  if (normalized.duration !== undefined && normalized.duree  === undefined) normalized.duree   = normalized.duration;
  if (normalized.price   !== undefined && normalized.prix    === undefined) normalized.prix    = normalized.price;
  if (normalized.language !== undefined && normalized.langue === undefined) {
    // Convertit 'fr' → 'Francais', 'en' → 'Anglais', 'ar' → 'Arabe'
    const langMap = { fr: 'Francais', en: 'Anglais', ar: 'Arabe' };
    normalized.langue = langMap[normalized.language] || normalized.language;
  }

  // Valeurs par défaut pour les champs requis manquants
  if (!normalized.titre)         normalized.titre         = normalized.title || '';
  if (!normalized.langue)        normalized.langue        = 'Francais';
  if (!normalized.categorie_age) normalized.categorie_age = 'Ados (13-17 ans)';

  // Nettoyage des anciens noms (ne pas envoyer des doublons à PB)
  delete normalized.title;
  delete normalized.duration;
  delete normalized.price;
  delete normalized.language;
  delete normalized.level;    // PB utilise `niveau`
  delete normalized.category; // PB utilise `categorie`

  return normalized;
}

// ── Helper : construit un FormData PB si un PDF base64 est fourni ──
function buildCoursePayload(body) {
  const { pdf_base64, pdf_filename, pdf_mimetype, ...rawFields } = body;
  const fields = normalizeCourseFields(rawFields);

  if (!pdf_base64) return fields; // pas de fichier → payload JSON simple

  // Node 18+ : FormData et Blob sont natifs
  const formData = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined && v !== null) formData.append(k, String(v));
  }
  const buffer = Buffer.from(pdf_base64, 'base64');
  const blob = new Blob([buffer], { type: pdf_mimetype || 'application/pdf' });
  formData.append('pdf', blob, pdf_filename || 'cours.pdf');
  return formData;
}

// ── POST /admin/courses ─────────────────────────────────────────────
// Crée un cours via le client superuser (contourne la createRule PB).
// Accepte optionnellement :
//   - pdf_base64 / pdf_filename / pdf_mimetype : fichier PDF encodé base64
//   - auto_enroll : boolean — si true, inscrit automatiquement les étudiants de la section
router.post('/courses', requireAdmin, async (req, res) => {
  try {
    const { auto_enroll, ...bodyWithoutMeta } = req.body;
    const payload = buildCoursePayload(bodyWithoutMeta);
    const record = await pb.collection('courses').create(payload, { $autoCancel: false });
    logger.info(`Cours créé : ${record.id} — ${record.titre}`);

    // ── Auto-enrollment ──────────────────────────────────────────
    let enrolledCount = 0;
    const enrolledStudents = [];
    if (auto_enroll && record.section) {
      try {
        // Cherche les étudiants de la section (essai avec plusieurs valeurs de rôle)
        let students = [];
        const filters = [
          `section="${record.section}"`,
          `role="etudiant" && section="${record.section}"`,
          `role="student" && section="${record.section}"`,
        ];
        for (const filter of filters) {
          try {
            const found = await pb.collection('users').getFullList({ filter, $autoCancel: false });
            if (found.length > 0) { students = found; break; }
          } catch { /* essayer le suivant */ }
        }
        for (const student of students) {
          try {
            const existing = await pb.collection('course_enrollments').getFullList({
              filter: `user_id="${student.id}" && course_id="${record.id}"`,
              $autoCancel: false,
            });
            if (existing.length === 0) {
              await pb.collection('course_enrollments').create({
                user_id:     student.id,
                course_id:   record.id,
                progression: 0,
                complete:    false,
                start_date:  new Date().toISOString(),
              }, { $autoCancel: false });
              enrolledCount++;
              enrolledStudents.push(student.email || student.id);
            }
          } catch { /* ignore student individuel */ }
        }
        logger.info(`Auto-enrollment : ${enrolledCount} étudiants inscrits au cours ${record.id}`);
      } catch (enrollErr) {
        logger.warn('Auto-enrollment partiel:', enrollErr.message);
      }
    }

    return res.json({ ...record, enrolled: enrolledCount, enrolledStudents });
  } catch (err) {
    logger.error('Erreur création cours:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ── PATCH /admin/courses/:id ────────────────────────────────────────
// Met à jour un cours via le client superuser. Supporte le remplacement du PDF.
router.patch('/courses/:id', requireAdmin, async (req, res) => {
  try {
    const payload = buildCoursePayload(req.body);
    const record = await pb.collection('courses').update(req.params.id, payload, { $autoCancel: false });
    return res.json(record);
  } catch (err) {
    logger.error('Erreur mise à jour cours:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ── DELETE /admin/courses/:id ───────────────────────────────────────
// Supprime un cours via le client superuser.
// Cascade : supprime d'abord les course_enrollments liés (sinon PB refuse).
router.delete('/courses/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Supprimer toutes les inscriptions liées à ce cours
    const enrollments = await pb.collection('course_enrollments').getFullList({
      filter: `course_id="${id}"`,
      $autoCancel: false,
    }).catch(() => []);
    for (const e of enrollments) {
      await pb.collection('course_enrollments').delete(e.id, { $autoCancel: false }).catch(() => {});
    }

    // 2. Supprimer le cours lui-même
    await pb.collection('courses').delete(id, { $autoCancel: false });
    logger.info(`Cours ${id} supprimé (cascade: ${enrollments.length} inscription(s))`);
    return res.json({ success: true, deletedEnrollments: enrollments.length });
  } catch (err) {
    logger.error('Erreur suppression cours:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ── GET /admin/enrollments ──────────────────────────────────────────
// Retourne toutes les inscriptions. Le client superuser contourne les
// listRules de course_enrollments (inaccessibles depuis le frontend admin).
router.get('/enrollments', requireAdmin, async (req, res) => {
  try {
    const [enrollments, courses] = await Promise.all([
      pb.collection('course_enrollments').getFullList({ $autoCancel: false }),
      pb.collection('courses').getFullList({
        fields: 'id,title,titre,category,categorie,section,level,niveau,price,prix',
        $autoCancel: false,
      }),
    ]);
    return res.json({ enrollments, courses });
  } catch (err) {
    logger.error('Erreur récupération enrollments:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// LOGIQUE BILINGUE — retourne les instructions selon la langue du cours
// Français → explications FR + traduction EN
// Anglais  → explications EN + traduction FR
// Arabe    → explications AR + traduction EN
// ─────────────────────────────────────────────────────────────────────────────
const getBilingualInstructions = (coursNom = '') => {
  const nom = coursNom.toLowerCase().trim();

  if (nom.includes('fran') || nom === 'francais' || nom === 'français') {
    return `
═══════════════════════════════════════════════════════
LOGIQUE BILINGUE OBLIGATOIRE — COURS DE FRANÇAIS (pour anglophones)
═══════════════════════════════════════════════════════
Les apprenants sont anglophones qui apprennent le français.
CHAQUE explication doit être en français + traduction anglaise immédiatement en dessous.

POUR LES LISTES DE VOCABULAIRE (mots-clés, expressions) — utilise ce format liste :
<ul class="vocab-list">
  <li><span class="vocab-term">j'ai hâte que</span><span class="vocab-sep">=</span><span class="vocab-trans">I can't wait for</span></li>
  <li><span class="vocab-term">rendre visite</span><span class="vocab-sep">=</span><span class="vocab-trans">to visit (a person)</span></li>
  <li><span class="vocab-term">le mois prochain</span><span class="vocab-sep">=</span><span class="vocab-trans">next month</span></li>
</ul>

DANS LES RULE-BOX (règles de grammaire) :
<div class="rule-box">
  <div class="rule-icon">🔑</div>
  <div>
    <strong>[Nom de la règle en français]</strong>
    <p>[Explication de la règle en français]</p>
    <p class="translation">🇬🇧 [English translation of the rule explanation]</p>
  </div>
</div>

DANS LES EXAMPLE-BLOCK (exemples de phrases) :
<div class="example-block">
  <div class="example-number">[N]</div>
  <div class="example-content">
    <p class="example-sentence">🇫🇷 <span class="highlight">[Phrase française complète]</span></p>
    <p class="translation">🇬🇧 [English translation + why this is correct]</p>
  </div>
</div>

DANS LES COMPARE-BOX (erreurs courantes) :
<div class="compare-box">
  <div class="compare-item bad">❌ <strong>[Phrase incorrecte en français]</strong><br/><small>🇬🇧 [Why it's wrong in English]</small></div>
  <div class="compare-item good">✅ <strong>[Phrase correcte en français]</strong><br/><small>🇬🇧 [Why it's correct in English]</small></div>
</div>

DANS LE SUMMARY-TABLE (récapitulatif) :
<div class="summary-table">
  <div class="summary-row header"><div>Concept 🇫🇷</div><div>Règle</div><div>Exemple</div><div>🇬🇧 English</div></div>
  <div class="summary-row"><div>[terme français]</div><div>[règle française]</div><div>[exemple]</div><div>[English meaning]</div></div>
</div>

EXERCICES QCM : en français uniquement (pas de traduction dans les questions/options).`;
  }

  if (nom.includes('angl') || nom.includes('engl')) {
    return `
═══════════════════════════════════════════════════════
LOGIQUE BILINGUE OBLIGATOIRE — COURS D'ANGLAIS (pour francophones)
═══════════════════════════════════════════════════════
Les apprenants sont francophones qui apprennent l'anglais.
CHAQUE explication doit être en anglais + traduction française immédiatement en dessous.

POUR LES LISTES DE VOCABULAIRE (mots-clés, expressions) — utilise ce format liste :
<ul class="vocab-list">
  <li><span class="vocab-term">I can't wait for</span><span class="vocab-sep">=</span><span class="vocab-trans">j'ai hâte que</span></li>
  <li><span class="vocab-term">to visit (a person)</span><span class="vocab-sep">=</span><span class="vocab-trans">rendre visite</span></li>
  <li><span class="vocab-term">next month</span><span class="vocab-sep">=</span><span class="vocab-trans">le mois prochain</span></li>
</ul>

DANS LES RULE-BOX (rules) :
<div class="rule-box">
  <div class="rule-icon">🔑</div>
  <div>
    <strong>[Rule name in English]</strong>
    <p>[Explanation of the rule in English]</p>
    <p class="translation">🇫🇷 [Traduction française de l'explication]</p>
  </div>
</div>

DANS LES EXAMPLE-BLOCK (examples) :
<div class="example-block">
  <div class="example-number">[N]</div>
  <div class="example-content">
    <p class="example-sentence">🇬🇧 <span class="highlight">[Full English sentence]</span></p>
    <p class="translation">🇫🇷 [Traduction française + explication pourquoi c'est correct]</p>
  </div>
</div>

DANS LES COMPARE-BOX (common mistakes) :
<div class="compare-box">
  <div class="compare-item bad">❌ <strong>[Incorrect English sentence]</strong><br/><small>🇫🇷 [Pourquoi c'est faux en français]</small></div>
  <div class="compare-item good">✅ <strong>[Correct English sentence]</strong><br/><small>🇫🇷 [Pourquoi c'est correct en français]</small></div>
</div>

DANS LE SUMMARY-TABLE (recap) :
<div class="summary-table">
  <div class="summary-row header"><div>Concept 🇬🇧</div><div>Rule</div><div>Example</div><div>🇫🇷 Traduction</div></div>
  <div class="summary-row"><div>[English term]</div><div>[English rule]</div><div>[example]</div><div>[Traduction française]</div></div>
</div>

QCM EXERCISES: in English only (no translations in questions/options).`;
  }

  if (nom.includes('arab')) {
    return `
═══════════════════════════════════════════════════════
LOGIQUE BILINGUE OBLIGATOIRE — COURS D'ARABE (pour anglophones)
═══════════════════════════════════════════════════════
Les apprenants sont anglophones qui apprennent l'arabe.
CHAQUE explication doit être en arabe + translittération latine + traduction anglaise.

POUR LES LISTES DE VOCABULAIRE (mots-clés, expressions) — utilise ce format liste :
<ul class="vocab-list">
  <li><span class="vocab-term" dir="rtl">مرحباً</span><span class="vocab-sep">=</span><span class="vocab-trans">marhaban (Hello)</span></li>
  <li><span class="vocab-term" dir="rtl">شكراً</span><span class="vocab-sep">=</span><span class="vocab-trans">shukran (Thank you)</span></li>
</ul>

DANS LES RULE-BOX (rules) :
<div class="rule-box">
  <div class="rule-icon">🔑</div>
  <div>
    <strong>[اسم القاعدة] — [Rule name in English]</strong>
    <p dir="rtl">[الشرح بالعربية]</p>
    <p class="transliteration">📝 [Latin transliteration]</p>
    <p class="translation">🇬🇧 [English explanation of the rule]</p>
  </div>
</div>

DANS LES EXAMPLE-BLOCK (examples) :
<div class="example-block">
  <div class="example-number">[N]</div>
  <div class="example-content">
    <p class="example-sentence" dir="rtl">🌍 <span class="highlight">[الجملة كاملة بالعربية]</span></p>
    <p class="transliteration">📝 [Latin transliteration of the sentence]</p>
    <p class="translation">🇬🇧 [English translation + why it is correct]</p>
  </div>
</div>

DANS LES COMPARE-BOX (common mistakes) :
<div class="compare-box">
  <div class="compare-item bad">❌ <strong dir="rtl">[الجملة الخاطئة]</strong><br/><small>🇬🇧 [Why it's wrong in English]</small></div>
  <div class="compare-item good">✅ <strong dir="rtl">[الجملة الصحيحة]</strong><br/><small>🇬🇧 [Why it's correct in English]</small></div>
</div>

DANS LE SUMMARY-TABLE (recap) :
<div class="summary-table">
  <div class="summary-row header"><div>🌍 العربية</div><div>Translittération</div><div>🇬🇧 English</div></div>
  <div class="summary-row"><div dir="rtl">[كلمة/عبارة]</div><div>[translitération]</div><div>[English meaning]</div></div>
</div>

QCM EXERCISES: mix Arabic and English — Arabic sentences as questions, English options for meaning (or vice versa).`;
  }

  // Autres matières (informatique, programmation) → français uniquement
  return '';
};

// ── POST /admin/courses/parse-pdf ──────────────────────────────────
// Envoie un PDF à Claude pour extraire le contenu pédagogique.
// Body JSON: { pdf_base64, pdf_filename, cours_nom?, section? }
// Returns: { title, description, pages: [...], exercises: [...] }
router.post('/courses/parse-pdf', requireAdmin, async (req, res) => {
  const { pdf_base64, pdf_filename, cours_nom, section } = req.body;
  if (!pdf_base64) return res.status(400).json({ error: 'pdf_base64 est requis' });

  const docName = pdf_filename || 'document.pdf';
  const bilingualInstructions = getBilingualInstructions(cours_nom || '');
  logger.info(`Extraction PDF via Claude : ${docName} | cours_nom=${cours_nom || 'non précisé'} | bilingue=${!!bilingualInstructions}`);

  const extractionPrompt = `Tu es un ingénieur pédagogique senior. Analyse ce document PDF et génère un cours structuré pour une plateforme e-learning professionnelle (IWS Laayoune).
${bilingualInstructions ? `
MATIÈRE DÉTECTÉE : ${cours_nom || 'non précisée'}${bilingualInstructions}
` : ''}
⚠️ RÈGLE ABSOLUE : Tu dois produire EXACTEMENT 7 pages dans cet ordre immuable. Aucune déviation n'est autorisée.

═══════════════════════════════════════════════════════
STRUCTURE PÉDAGOGIQUE OBLIGATOIRE (7 pages fixes)
═══════════════════════════════════════════════════════

PAGE 1 — TITRE & INTRODUCTION
Rôle : Accrocher l'apprenant, poser le contexte, annoncer les objectifs.
HTML imposé :
<div class="lesson-intro">
  <div class="lesson-badge">📚 [Matière extraite du PDF]</div>
  <h2>[Titre clair du cours]</h2>
  <p class="lead">[Phrase d'accroche engageante — 2-3 phrases simples, vocabulaire courant]</p>
  <div class="lesson-objectives">
    <h4>🎯 Ce que tu vas apprendre</h4>
    <ul><li>[Objectif 1]</li><li>[Objectif 2]</li><li>[Objectif 3]</li></ul>
  </div>
  <div class="info-box">💡 <strong>Pourquoi c'est important ?</strong> [Explication motivante en 1 phrase]</div>
</div>

PAGE 2 — EXPLICATION DES RÈGLES
Rôle : Poser les règles grammaticales / concepts clés. Clarté maximale, pas de jargon non expliqué.
HTML imposé :
<div class="lesson-content">
  <h3>📖 Les règles essentielles</h3>
  [Pour chaque règle principale, utiliser :]
  <div class="rule-box">
    <div class="rule-icon">🔑</div>
    <div>
      <strong>[Nom de la règle]</strong>
      <p>[Explication simple en 2-3 phrases. Utiliser <span class="prep">[terme clé]</span> pour les mots importants]</p>
    </div>
  </div>
  [Répéter pour chaque règle — minimum 3 règles]
  <div class="info-box">💡 <strong>Astuce :</strong> [Conseil mnémotechnique ou raccourci]</div>
  [OBLIGATOIRE — Vocabulaire clé de la page, avec traduction dans la langue complémentaire :]
  <div class="vocab-box">
    💡 <strong>Vocabulaire clé :</strong>
    <ul>
      <li><em>[terme extrait du cours]</em> = [traduction ou définition en langue complémentaire]</li>
      <li><em>[terme 2]</em> = [traduction 2]</li>
      [4 à 6 termes clés de la page]
    </ul>
  </div>
</div>

PAGE 3 — EXEMPLES (MINIMUM 5, IDÉALEMENT 8-10)
Rôle : Montrer les règles en action avec des exemples concrets, variés et progressifs.
HTML imposé :
<div class="lesson-content">
  <h3>✏️ Exemples concrets</h3>
  <p class="lead">[Phrase introductive courte]</p>
  [Pour chaque exemple :]
  <div class="example-block">
    <div class="example-number">[N°]</div>
    <div class="example-content">
      <p class="example-sentence"><span class="highlight">[Phrase exemple complète]</span></p>
      <p class="example-explain">→ [Explication de POURQUOI cette phrase est correcte — référencer la règle de la page 2]</p>
    </div>
  </div>
  [OBLIGATOIRE : minimum 5 exemples, maximum 10. Varier les contextes : quotidien, professionnel, voyage…]
  [OBLIGATOIRE — Expressions utiles de la page, avec traduction :]
  <div class="vocab-box">
    💡 <strong>Expressions utiles :</strong>
    <ul>
      <li><em>[expression tirée des exemples]</em> = [traduction ou explication en langue complémentaire]</li>
      [4 à 6 expressions des exemples de cette page]
    </ul>
  </div>
</div>

PAGE 4 — ERREURS COURANTES
Rôle : Anticiper et corriger les pièges typiques des apprenants. Très pédagogique.
HTML imposé :
<div class="lesson-content">
  <h3>⚠️ Erreurs fréquentes à éviter</h3>
  <p class="lead">[Introduction motivante : "Ces erreurs sont très courantes — les connaître, c'est déjà les éviter !"]</p>
  [Pour chaque erreur — minimum 4 erreurs :]
  <div class="compare-box">
    <div class="compare-item bad">❌ <strong>[Phrase incorrecte typique]</strong><br/><small>[Pourquoi c'est faux]</small></div>
    <div class="compare-item good">✅ <strong>[Phrase correcte]</strong><br/><small>[Règle appliquée]</small></div>
  </div>
  <div class="info-box">🎯 <strong>Rappel :</strong> [Conseil pour ne plus faire ces erreurs]</div>
</div>

PAGE 5 — PRATIQUE GUIDÉE
Rôle : Exercices interactifs courts intégrés dans la leçon (avant les QCM). Ponts entre théorie et quiz.
HTML imposé :
<div class="lesson-content">
  <h3>🏋️ Pratique guidée</h3>
  <p class="lead">Essayons ensemble avant de passer aux exercices !</p>
  [Pour chaque mini-exercice (3 à 5) :]
  <div class="rule-box">
    <div class="rule-icon">❓</div>
    <div>
      <p><strong>[Question ou phrase à compléter avec ___ ]</strong></p>
      <details>
        <summary>👁️ Voir la réponse</summary>
        <p class="example-explain">✅ [Réponse + explication courte]</p>
      </details>
    </div>
  </div>
</div>

PAGE 6 — RÉSUMÉ RÉCAPITULATIF
Rôle : Synthèse visuelle de tout ce qui a été appris. Tableau de référence à consulter.
HTML imposé :
<div class="lesson-content">
  <h3>📋 Récapitulatif</h3>
  <p class="lead">Voici tout ce que tu as appris dans ce cours :</p>
  <div class="summary-table">
    <div class="summary-row header"><div>Concept</div><div>Règle</div><div>Exemple</div></div>
    [Une ligne par règle principale apprise :]
    <div class="summary-row"><div>[Terme clé]</div><div>[Règle en 1 phrase]</div><div>[Exemple]</div></div>
  </div>
  <div class="info-box">🚀 <strong>Tu es prêt(e) pour les exercices !</strong> Rappelle-toi les points clés ci-dessus.</div>
</div>

PAGE 7 — EXERCICES BILAN
Rôle : Renvoyer vers les QCM + encouragements. C'est la dernière page avant le quiz.
HTML imposé :
<div class="lesson-intro">
  <div class="lesson-badge">📝 Exercices</div>
  <h2>Mets tes connaissances à l'épreuve !</h2>
  <p class="lead">Tu as terminé la leçon — bravo ! Il est temps de tester ce que tu as retenu.</p>
  <div class="lesson-objectives">
    <h4>📌 Les exercices portent sur :</h4>
    <ul>
      <li>[Point clé 1 évalué]</li>
      <li>[Point clé 2 évalué]</li>
      <li>[Point clé 3 évalué]</li>
    </ul>
  </div>
  <div class="info-box">💪 <strong>Conseil :</strong> Relis le récapitulatif si tu bloques sur une question.</div>
</div>

═══════════════════════════════════════════════════════
EXERCICES QCM (20 questions obligatoires)
═══════════════════════════════════════════════════════
- EXACTEMENT 20 questions QCM, 4 options chacune
- answer = index 0-3 de la bonne réponse
- Répartition obligatoire :
  • 5 questions de compréhension des règles (page 2)
  • 7 questions basées sur les exemples (page 3)
  • 4 questions sur les erreurs courantes (page 4)
  • 4 questions de synthèse (pages 5-6)
- Difficulté progressive : les 5 premières faciles, les 10 suivantes moyennes, les 5 dernières difficiles

═══════════════════════════════════════════════════════
TITRE ET DESCRIPTION (obligatoires)
═══════════════════════════════════════════════════════
- title : Titre court et accrocheur (ex: "Les prépositions de lieu en Anglais — Niveau A1")
- description : OBLIGATOIRE — 3 phrases minimum décrivant : (1) le sujet, (2) ce que l'apprenant va maîtriser, (3) à qui s'adresse ce cours

═══════════════════════════════════════════════════════
FORMAT DE RÉPONSE
═══════════════════════════════════════════════════════
Réponds UNIQUEMENT avec ce JSON valide (aucun markdown, aucun bloc de code) :
{
  "title": "...",
  "description": "...",
  "pages": [
    { "id": 1, "title": "Introduction", "content": "..." },
    { "id": 2, "title": "Règles", "content": "..." },
    { "id": 3, "title": "Exemples", "content": "..." },
    { "id": 4, "title": "Erreurs courantes", "content": "..." },
    { "id": 5, "title": "Pratique guidée", "content": "..." },
    { "id": 6, "title": "Récapitulatif", "content": "..." },
    { "id": 7, "title": "Exercices", "content": "..." }
  ],
  "exercises": [
    { "id": "q1", "question": "...", "options": ["a","b","c","d"], "answer": 0 }
  ]
}
IMPORTANT : Produis EXACTEMENT 7 pages dans l'ordre imposé. Jamais moins, jamais plus.`;

  const MODELS = ['claude-sonnet-4-6', 'claude-opus-4-6'];
  let lastError = null;

  for (const model of MODELS) {
    try {
      logger.info(`[parse-pdf] Tentative avec ${model}`);
      const message = await anthropic.messages.create({
        model,
        max_tokens: 8000,
        messages: [{
          role: 'user',
          content: [
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdf_base64 } },
            { type: 'text', text: extractionPrompt },
          ],
        }],
      });

      const text = message.content[0]?.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Réponse invalide — aucun JSON trouvé');

      const data = JSON.parse(jsonMatch[0]);
      const pages = (data.pages || []).map((p, i) => ({
        id: p.id ?? i + 1,
        title: p.title || `Page ${i + 1}`,
        content: p.content || '',
      }));
      const exercises = (data.exercises || []).map((ex, i) => ({
        id: ex.id || `q${i + 1}`,
        question: ex.question || '',
        options: Array.isArray(ex.options) ? ex.options.slice(0, 4) : ['', '', '', ''],
        answer: typeof ex.answer === 'number' ? ex.answer : 0,
      }));

      // Validation de la structure pédagogique obligatoire
      if (pages.length !== 7) {
        logger.warn(`[parse-pdf][${model}] Structure incorrecte : ${pages.length} pages au lieu de 7 attendues`);
      }
      if (exercises.length < 15) {
        logger.warn(`[parse-pdf][${model}] Exercices insuffisants : ${exercises.length} au lieu de 20 attendus`);
      }
      if (!data.description || data.description.trim().length < 20) {
        logger.warn(`[parse-pdf][${model}] Description manquante ou trop courte`);
      }

      const description = (data.description && data.description.trim().length >= 20)
        ? data.description
        : `Ce cours "${data.title || ''}" couvre les concepts essentiels, les règles clés et des exercices pratiques pour progresser rapidement.`;

      logger.info(`[parse-pdf][${model}] OK : ${pages.length} pages, ${exercises.length} exercices`);
      return res.json({ title: data.title || '', description, pages, exercises });

    } catch (err) {
      lastError = err;
      logger.warn(`[parse-pdf][${model}] Échec : ${err?.message}`);
      if (err?.message?.includes('JSON') || err?.message?.includes('invalide')) break;
    }
  }

  // Fallback : retourne le template pédagogique en 7 pages avec le message d'erreur
  const name = (pdf_filename || 'cours').replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
  const errMsg = lastError?.message || 'Erreur inconnue';
  const errStatus = lastError?.status || '';
  logger.warn(`[parse-pdf] Fallback template 7 pages. Erreur : ${errMsg}`);
  return res.json({
    title: name,
    description: `Ce cours porte sur le sujet "${name}". Il vous guidera à travers les règles essentielles, des exemples concrets et des exercices pratiques pour maîtriser ce sujet.`,
    pages: [
      { id: 1, title: 'Introduction', content: `<div class="lesson-intro"><div class="lesson-badge">📚 Cours</div><h2>${name}</h2><p class="lead">Bienvenue dans ce cours ! Vous allez découvrir les concepts essentiels de manière progressive et structurée.</p><div class="lesson-objectives"><h4>🎯 Ce que tu vas apprendre</h4><ul><li>Comprendre les règles fondamentales</li><li>Appliquer les concepts à travers des exemples</li><li>Éviter les erreurs les plus courantes</li></ul></div><div class="info-box">💡 <strong>Conseil :</strong> Lisez chaque page attentivement avant de passer aux exercices.</div></div>` },
      { id: 2, title: 'Règles', content: `<div class="lesson-content"><h3>📖 Les règles essentielles</h3><div class="rule-box"><div class="rule-icon">🔑</div><div><strong>Règle principale</strong><p>Complétez cette section avec le contenu de votre PDF en cliquant sur "Modifier" dans la liste des cours.</p></div></div><div class="info-box">💡 <strong>Astuce :</strong> Importez votre PDF avec le bouton "Générer avec Claude" pour remplir automatiquement ce contenu.</div></div>` },
      { id: 3, title: 'Exemples', content: `<div class="lesson-content"><h3>✏️ Exemples concrets</h3><p class="lead">Des exemples pratiques seront générés automatiquement à partir de votre PDF.</p><div class="example-block"><div class="example-number">1</div><div class="example-content"><p class="example-sentence"><span class="highlight">Exemple à compléter</span></p><p class="example-explain">→ Importez votre PDF pour générer des exemples automatiquement.</p></div></div></div>` },
      { id: 4, title: 'Erreurs courantes', content: `<div class="lesson-content"><h3>⚠️ Erreurs fréquentes à éviter</h3><p class="lead">Ces erreurs sont très courantes — les connaître, c'est déjà les éviter !</p><div class="compare-box"><div class="compare-item bad">❌ <strong>Erreur typique</strong><br/><small>À compléter depuis votre PDF</small></div><div class="compare-item good">✅ <strong>Forme correcte</strong><br/><small>À compléter depuis votre PDF</small></div></div></div>` },
      { id: 5, title: 'Pratique guidée', content: `<div class="lesson-content"><h3>🏋️ Pratique guidée</h3><p class="lead">Essayons ensemble avant de passer aux exercices !</p><div class="rule-box"><div class="rule-icon">❓</div><div><p><strong>Complétez la phrase : Je ___ à Paris. (habiter)</strong></p><details><summary>👁️ Voir la réponse</summary><p class="example-explain">✅ J'habite à Paris. — Utilisez la forme conjuguée au présent.</p></details></div></div></div>` },
      { id: 6, title: 'Récapitulatif', content: `<div class="lesson-content"><h3>📋 Récapitulatif</h3><p class="lead">Voici un résumé de ce que vous avez appris :</p><div class="summary-table"><div class="summary-row header"><div>Concept</div><div>Règle</div><div>Exemple</div></div><div class="summary-row"><div>À compléter</div><div>À compléter</div><div>À compléter</div></div></div><div class="info-box">🚀 <strong>Tu es prêt(e) pour les exercices !</strong></div></div>` },
      { id: 7, title: 'Exercices', content: `<div class="lesson-intro"><div class="lesson-badge">📝 Exercices</div><h2>Mets tes connaissances à l'épreuve !</h2><p class="lead">Tu as terminé la leçon — bravo ! Il est temps de tester ce que tu as retenu.</p><div class="lesson-objectives"><h4>📌 Les exercices portent sur :</h4><ul><li>La compréhension des règles</li><li>L'application des exemples</li><li>L'identification des erreurs</li></ul></div><div class="info-box">💪 <strong>Conseil :</strong> Relis le récapitulatif si tu bloques sur une question.</div></div>` },
    ],
    exercises: [],
    warning: `Erreur API Claude${errStatus ? ` (HTTP ${errStatus})` : ''} : ${errMsg}`,
  });
});

// ── POST /admin/courses/:id/add-bilingual — DÉSACTIVÉ (crédits insuffisants) ──
// Cette route est conservée pour compatibilité mais retourne une erreur explicite.
router.post('/courses/:id/add-bilingual', requireAdmin, async (req, res) => {
  return res.status(503).json({ error: 'Cette fonctionnalité a été désactivée. Les cours bilingues sont désormais générés automatiquement lors de l\'import PDF.' });
});
// Ancien code désactivé :
/*
router.post('/courses/:id/add-bilingual-DISABLED', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const course = await pb.collection('courses').getOne(id, { $autoCancel: false });
    const coursNom = course.cours_nom || course.current_course || '';
    const bilingualInstructions = getBilingualInstructions(coursNom);

    if (!bilingualInstructions) {
      return res.status(400).json({
        error: `Aucune logique bilingue définie pour la matière "${coursNom}". Seuls Français, Anglais et Arabe sont supportés.`,
      });
    }

    // Extraire le contenu HTML brut des pages existantes
    let existingPages = [];
    try { existingPages = JSON.parse(course.pages || '[]'); } catch { existingPages = []; }

    if (existingPages.length === 0) {
      return res.status(400).json({ error: 'Ce cours n\'a pas de pages à convertir. Importez d\'abord un PDF.' });
    }

    const pagesText = existingPages
      .map(p => `=== PAGE ${p.id} : ${p.title} ===\n${p.content || ''}`)
      .join('\n\n');

    const titre  = course.titre || course.title || '';
    const niveau = course.niveau || course.level || '';

    const prompt = `Tu es un ingénieur pédagogique bilingue. Tu reçois le contenu HTML d'un cours existant et tu dois le TRANSFORMER pour appliquer une logique bilingue.

COURS : "${titre}" — Matière : ${coursNom} — Niveau : ${niveau}
${bilingualInstructions}

CONTENU EXISTANT DES PAGES (HTML brut) :
${pagesText.slice(0, 12000)}

INSTRUCTIONS :
1. Conserve EXACTEMENT la même structure en 7 pages (mêmes titres, même id)
2. Transforme le contenu de chaque page pour appliquer la logique bilingue ci-dessus
3. Chaque règle, explication et exemple doit avoir sa traduction dans la langue secondaire
4. NE SUPPRIME AUCUN CONTENU — ajoute uniquement les traductions
5. Garde tous les éléments HTML existants (.rule-box, .example-block, .compare-box, .summary-table, etc.)
6. Pour les traductions manquantes, génère-les toi-même de manière correcte et naturelle

Réponds UNIQUEMENT avec ce JSON valide :
{
  "pages": [
    { "id": 1, "title": "Introduction", "content": "..." },
    { "id": 2, "title": "Règles", "content": "..." },
    { "id": 3, "title": "Exemples", "content": "..." },
    { "id": 4, "title": "Erreurs courantes", "content": "..." },
    { "id": 5, "title": "Pratique guidée", "content": "..." },
    { "id": 6, "title": "Récapitulatif", "content": "..." },
    { "id": 7, "title": "Exercices", "content": "..." }
  ]
}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 12000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Réponse invalide — aucun JSON trouvé');

    const data = JSON.parse(jsonMatch[0]);
    const pages = (data.pages || []).map((p, i) => ({
      id: p.id ?? i + 1,
      title: p.title || existingPages[i]?.title || `Page ${i + 1}`,
      content: p.content || '',
    }));

    if (pages.length === 0) throw new Error('Aucune page générée');

    // Mettre à jour le cours dans PocketBase
    await pb.collection('courses').update(id, { pages: JSON.stringify(pages) }, { $autoCancel: false });

    logger.info(`[add-bilingual] Cours ${id} (${coursNom}) — ${pages.length} pages converties en bilingue`);
    return res.json({ success: true, pagesCount: pages.length, coursNom });

  } catch (err) {
    logger.error(`[add-bilingual] Erreur cours ${id} :`, err);
    return res.status(500).json({ error: err.message || 'Erreur interne' });
  }
}); // fin du bloc désactivé */

// ── POST /admin/courses/:id/generate-description — DÉSACTIVÉ ────────
router.post('/courses/:id/generate-description', requireAdmin, async (req, res) => {
  return res.status(503).json({ error: 'Cette fonctionnalité a été désactivée. Les descriptions sont générées automatiquement lors de l\'import PDF.' });
});

// ── GET /admin/all-students ─────────────────────────────────────────
// Retourne étudiants + inscriptions + cours + commandes en un seul appel.
router.get('/all-students', requireAdmin, async (req, res) => {
  try {
    const [students, enrollments, courses, orders] = await Promise.all([
      pb.collection('users').getFullList({ filter: "role='etudiant'", sort: '-created', $autoCancel: false }),
      pb.collection('course_enrollments').getFullList({ $autoCancel: false }),
      pb.collection('courses').getFullList({
        fields: 'id,title,titre,category,categorie,section,level,niveau,price,prix',
        $autoCancel: false,
      }),
      pb.collection('orders').getFullList({ sort: '-created', $autoCancel: false }),
    ]);
    return res.json({ students, enrollments, courses, orders });
  } catch (err) {
    logger.error('Erreur récupération all-students:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ── GET /admin/student/:id ──────────────────────────────────────────
// Fiche complète d'un étudiant : inscriptions filtrées + cours + commandes filtrées.
// Bypass des listRules PocketBase (course_enrollments et orders ont user_id=@request.auth.id).
router.get('/student/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const [enrollments, courses, orders, student] = await Promise.all([
      pb.collection('course_enrollments').getFullList({
        filter: `user_id="${id}"`,
        sort: '-updated',
        $autoCancel: false,
      }),
      pb.collection('courses').getFullList({
        fields: 'id,title,titre,category,categorie,section,level,niveau,price,prix,duration',
        $autoCancel: false,
      }),
      pb.collection('orders').getFullList({
        filter: `user_id="${id}"`,
        sort: '-created',
        expand: 'products',
        $autoCancel: false,
      }),
      pb.collection('users').getOne(id, { $autoCancel: false }),
    ]);
    return res.json({ student, enrollments, courses, orders });
  } catch (err) {
    logger.error(`Erreur récupération fiche étudiant ${id}:`, err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
