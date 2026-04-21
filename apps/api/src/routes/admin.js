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

// ── POST /admin/courses/parse-pdf ──────────────────────────────────
// Envoie un PDF à Claude pour extraire le contenu pédagogique (optionnel).
// Body JSON: { pdf_base64: string, pdf_filename?: string }
// Returns: { title, description, pages: [...], exercises: [...] }
router.post('/courses/parse-pdf', requireAdmin, async (req, res) => {
  const { pdf_base64, pdf_filename } = req.body;
  if (!pdf_base64) return res.status(400).json({ error: 'pdf_base64 est requis' });

  const docName = pdf_filename || 'document.pdf';
  logger.info(`Extraction PDF via Claude : ${docName}`);

  const extractionPrompt = `Tu es un expert pédagogique. Analyse ce document PDF et structure son contenu pour une plateforme d'apprentissage en ligne.

Génère une réponse JSON valide (sans markdown, sans bloc de code) avec cette structure EXACTE :
{
  "title": "Titre suggéré du cours",
  "description": "Description du cours en 2-3 phrases résumant les objectifs",
  "pages": [
    { "id": 1, "title": "Titre de la page", "content": "Contenu HTML de la page" }
  ],
  "exercises": [
    { "id": "q1", "question": "Question avec ___ pour le blanc", "options": ["a","b","c","d"], "answer": 0 }
  ]
}

RÈGLES POUR LES PAGES (6 à 10 pages) :
- Page 1 : <div class="lesson-intro"><div class="lesson-badge">📚 Matière</div><h2>Titre</h2><p class="lead">Accroche</p><div class="lesson-objectives"><h4>🎯 Objectifs</h4><ul><li>...</li></ul></div></div>
- Pages intermédiaires : <span class="prep">terme</span> · <div class="rule-box"><div class="rule-icon">emoji</div><div>règle + exemples</div></div> · <div class="info-box">💡 astuce</div> · <div class="compare-box"><div class="compare-item good">✅ bon</div><div class="compare-item bad">❌ mauvais</div></div>
- Dernière page : <div class="summary-table"><div class="summary-row header"><div>Terme</div><div>Règle</div><div>Exemple</div></div>...</div>

RÈGLES POUR LES EXERCICES : 12 à 16 QCM · 4 options chacun · answer = index 0-3 de la bonne réponse.
IMPORTANT : Réponds UNIQUEMENT avec le JSON.`;

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
      const pages = (data.pages || []).map((p, i) => ({ id: p.id ?? i+1, title: p.title || `Page ${i+1}`, content: p.content || '' }));
      const exercises = (data.exercises || []).map((ex, i) => ({
        id: ex.id || `q${i+1}`, question: ex.question || '',
        options: Array.isArray(ex.options) ? ex.options.slice(0,4) : ['','','',''],
        answer: typeof ex.answer === 'number' ? ex.answer : 0,
      }));

      logger.info(`[parse-pdf][${model}] OK : ${pages.length} pages, ${exercises.length} exercices`);
      return res.json({ title: data.title || '', description: data.description || '', pages, exercises });

    } catch (err) {
      lastError = err;
      logger.warn(`[parse-pdf][${model}] Échec : ${err?.message}`);
      if (err?.message?.includes('JSON') || err?.message?.includes('invalide')) break;
    }
  }

  // Fallback : retourne un template vide avec le message d'erreur
  const name = (pdf_filename || 'cours').replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
  const errMsg = lastError?.message || 'Erreur inconnue';
  const errStatus = lastError?.status || '';
  logger.warn(`[parse-pdf] Fallback template. Erreur : ${errMsg}`);
  return res.json({
    title: name, description: '',
    pages: [{ id: 1, title: 'Introduction', content: `<div class="lesson-intro"><div class="lesson-badge">📚 Cours</div><h2>${name}</h2><p class="lead">Contenu à compléter.</p></div>` }],
    exercises: [],
    warning: `Erreur API Claude${errStatus ? ` (HTTP ${errStatus})` : ''} : ${errMsg}`,
  });
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
