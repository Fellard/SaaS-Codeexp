/**
 * IWS Recall — API Routes
 *
 *   POST /recall/generate/:courseId  — Génère des cartes IA pour un cours
 *   GET  /recall/due                 — Cartes à réviser aujourd'hui (auth requise)
 *   POST /recall/review              — Soumet le résultat d'une révision
 *   GET  /recall/stats               — Stats de l'utilisateur connecté
 */

import express      from 'express';
import Anthropic    from '@anthropic-ai/sdk';
import pb           from '../utils/pocketbaseClient.js';
import logger       from '../utils/logger.js';

const router     = express.Router();
const anthropic  = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Auto-création des collections si elles n'existent pas ─────────
let collectionsReady = false;

async function ensureCollections() {
  if (collectionsReady) return true;
  try {
    // Tester si recall_cards existe
    await pb.collection('recall_cards').getList(1, 1, { $autoCancel: false });
    await pb.collection('recall_sessions').getList(1, 1, { $autoCancel: false });
    collectionsReady = true;
    return true;
  } catch (e) {
    // Collections manquantes → les créer via l'API PocketBase
    logger.info('Recall: création automatique des collections...');
    try {
      // Récupérer les IDs nécessaires
      const usersInfo  = await pb.collection('_superusers').getList(1, 1, { $autoCancel: false }).catch(() => null);
      const usersColl  = await pb.send('/api/collections/_pb_users_auth_', { method: 'GET' }).catch(() => null);
      const coursesColl= await pb.send('/api/collections/courses', { method: 'GET' }).catch(() => null);
      const usersId    = usersColl?.id || '_pb_users_auth_';
      const coursesId  = coursesColl?.id || 'courses';

      // Créer recall_cards
      try {
        await pb.send('/api/collections', {
          method: 'POST',
          body: {
            name: 'recall_cards',
            type: 'base',
            createRule: "@request.auth.id != ''",
            listRule:   "@request.auth.id != ''",
            viewRule:   "@request.auth.id != ''",
            updateRule: "@request.auth.id != ''",
            deleteRule: "@request.auth.role = 'admin'",
            fields: [
              { name: 'course_id',      type: 'relation', collectionId: coursesId, maxSelect: 1, cascadeDelete: true, required: false },
              { name: 'question',       type: 'text',     required: true,  max: 1000 },
              { name: 'answer',         type: 'text',     required: true,  max: 2000 },
              { name: 'langue',         type: 'text',     required: false, max: 10   },
              { name: 'niveau',         type: 'text',     required: false, max: 20   },
              { name: 'auto_generated', type: 'bool',     required: false           },
            ],
          },
        });
        logger.info('recall_cards collection créée');
      } catch (ce) {
        if (!ce?.message?.includes('already exists')) throw ce;
      }

      // Récupérer l'ID de recall_cards pour la relation
      const cardsInfo = await pb.send('/api/collections/recall_cards', { method: 'GET' }).catch(() => ({ id: 'recall_cards' }));
      const cardsId   = cardsInfo?.id || 'recall_cards';

      // Créer recall_sessions
      try {
        await pb.send('/api/collections', {
          method: 'POST',
          body: {
            name: 'recall_sessions',
            type: 'base',
            createRule: "@request.auth.id != ''",
            listRule:   "@request.auth.id = user_id",
            viewRule:   "@request.auth.id = user_id",
            updateRule: "@request.auth.id = user_id",
            deleteRule: "@request.auth.role = 'admin'",
            fields: [
              { name: 'user_id',       type: 'relation', collectionId: usersId,  maxSelect: 1, cascadeDelete: true, required: true  },
              { name: 'card_id',       type: 'relation', collectionId: cardsId,  maxSelect: 1, cascadeDelete: true, required: true  },
              { name: 'result',        type: 'select',   values: ['acquired', 'hard'], maxSelect: 1, required: true },
              { name: 'next_review',   type: 'date',     required: true  },
              { name: 'review_count',  type: 'number',   required: false, min: 0, onlyInt: true },
              { name: 'interval_days', type: 'number',   required: false, min: 1, max: 365, onlyInt: true },
              { name: 'streak',        type: 'number',   required: false, min: 0, onlyInt: true },
            ],
          },
        });
        logger.info('recall_sessions collection créée');
      } catch (ce) {
        if (!ce?.message?.includes('already exists')) throw ce;
      }

      collectionsReady = true;
      return true;
    } catch (createErr) {
      logger.error('Impossible de créer les collections recall:', createErr.message);
      return false;
    }
  }
}

// ── Auth helper (identique à orders.js) ──────────────────────────
async function getAuthUser(req, res) {
  const auth  = req.headers.authorization || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!token) { res.status(401).json({ error: 'Token manquant' }); return null; }
  try {
    const parts = token.split('.');
    if (parts.length < 2) throw new Error('JWT malformé');
    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    );
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      res.status(401).json({ error: 'Token expiré' }); return null;
    }
    const userId = payload.id || payload.sub;
    if (!userId) throw new Error('ID utilisateur absent du token');
    return await pb.collection('users').getOne(userId, { $autoCancel: false });
  } catch (err) {
    res.status(401).json({ error: 'Token invalide', detail: err.message });
    return null;
  }
}

// ── Calcul date prochaine révision ────────────────────────────────
function nextReviewDate(intervalDays) {
  const d = new Date();
  d.setDate(d.getDate() + intervalDays);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

// ── POST /recall/generate/:courseId ──────────────────────────────
router.post('/generate/:courseId', async (req, res) => {
  const ready = await ensureCollections();
  if (!ready) return res.status(503).json({ error: 'Service de révision temporairement indisponible', migrationPending: true });

  const user = await getAuthUser(req, res);
  if (!user) return;

  const { courseId } = req.params;

  try {
    // Vérifier que le cours existe
    let course;
    try {
      course = await pb.collection('courses').getOne(courseId, { $autoCancel: false });
    } catch {
      return res.status(404).json({ error: 'Cours introuvable' });
    }

    // Vérifier si des cartes existent déjà pour ce cours
    const existing = await pb.collection('recall_cards').getFullList({
      filter: `course_id="${courseId}"`,
      $autoCancel: false,
    });
    if (existing.length >= 5) {
      return res.json({ cards: existing, generated: false, message: 'Cartes existantes retournées' });
    }

    // Extraire le contenu du cours depuis les champs disponibles
    const courseTitle = course.titre  || course.title || 'ce cours';
    const description = course.description || course.desc || '';
    const objectifs   = course.objectifs || course.objectives || '';
    const contenu     = course.contenu || course.content || '';

    // Combiner tout le contenu disponible
    const rawText = [description, objectifs, contenu]
      .filter(Boolean)
      .join('\n\n')
      .replace(/<[^>]*>/g, ' ')   // strip HTML
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3000);

    // Détecter la langue (PocketBase stocke "Francais", "Anglais", "Arabe")
    const langueRaw = (course.langue || course.language || 'Francais').toLowerCase();
    const langue    = langueRaw.includes('arab') ? 'ar'
                    : langueRaw.includes('angl') || langueRaw.includes('engl') ? 'en'
                    : 'fr';
    const niveau    = course.niveau || course.level || course.categorie_age || '';

    const systemPrompt = `Tu es un expert pédagogique. Tu crées des cartes de révision (flashcards) concises et efficaces à partir du contenu d'un cours. Réponds UNIQUEMENT avec un tableau JSON valide, sans texte avant ou après.`;

    const userPrompt = `Cours : "${courseTitle}"${niveau ? ` — ${niveau}` : ''}
Langue d'enseignement : ${langue === 'ar' ? 'Arabe' : langue === 'en' ? 'Anglais' : 'Français'}

${rawText ? `Description du cours :\n${rawText}` : `Ce cours traite de : ${courseTitle}`}

Génère exactement 8 flashcards de révision style Anki adaptées à ce cours.
Format JSON strict (UNIQUEMENT le tableau JSON, rien d'autre) :
[
  {"question": "...", "answer": "..."},
  ...
]
Règles :
- Questions courtes et précises (max 120 caractères)
- Réponses complètes mais concises (max 300 caractères)
- Varier les types : définition, règle, exemple, traduction, conjugaison, exercice
- Si cours de langue : inclure des exemples de phrases avec la règle grammaticale
- Rédiger les cartes dans la langue d'enseignement : ${langue === 'ar' ? 'Arabe' : langue === 'en' ? 'Anglais' : 'Français'}`;

    let cards = [];
    const MODELS = ['claude-sonnet-4-6', 'claude-3-5-sonnet-20241022'];

    for (const model of MODELS) {
      try {
        const response = await anthropic.messages.create({
          model,
          max_tokens: 1200,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        });
        const raw  = response.content[0]?.text?.trim() || '[]';
        const json = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/, '').trim();
        cards = JSON.parse(json);
        break;
      } catch (err) {
        logger.warn(`Recall generate — model ${model} failed:`, err.message);
      }
    }

    if (!Array.isArray(cards) || cards.length === 0) {
      return res.status(500).json({ error: 'Impossible de générer les cartes' });
    }

    // Sauvegarder les cartes dans PocketBase
    const saved = [];
    for (const card of cards.slice(0, 10)) {
      if (!card.question || !card.answer) continue;
      try {
        const rec = await pb.collection('recall_cards').create({
          course_id:      courseId,
          question:       card.question.trim(),
          answer:         card.answer.trim(),
          langue,
          niveau,
          auto_generated: true,
        }, { $autoCancel: false });
        saved.push(rec);
      } catch (e) {
        logger.warn('Card save error:', e.message);
      }
    }

    logger.info(`Recall: ${saved.length} cartes générées pour cours ${courseId}`);
    return res.json({ cards: saved, generated: true });

  } catch (err) {
    logger.error('Recall generate:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ── GET /recall/due ───────────────────────────────────────────────
// Retourne les cartes dues aujourd'hui pour l'utilisateur connecté
router.get('/due', async (req, res) => {
  const ready = await ensureCollections();
  if (!ready) return res.json({ cards: [], total: 0, dueCount: 0, newCount: 0, migrationPending: true });

  const user = await getAuthUser(req, res);
  if (!user) return;

  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const todayStr = today.toISOString();

    // ── Récupérer sessions dues ─────────────────────────────────
    let dueSessions = [];
    try {
      dueSessions = await pb.collection('recall_sessions').getFullList({
        filter: `user_id="${user.id}" && next_review <= "${todayStr}"`,
        expand: 'card_id',
        sort:   'next_review',
        $autoCancel: false,
      });
    } catch (e) {
      // Collection pas encore créée → retourner cartes vides
      if (e?.status === 404 || e?.message?.includes('not found') || e?.message?.includes('Missing')) {
        logger.warn('recall_sessions collection not found — migration not applied yet');
        return res.json({ cards: [], total: 0, dueCount: 0, newCount: 0, migrationPending: true });
      }
      throw e;
    }

    // ── Enrollments de l'étudiant ───────────────────────────────
    let enrollments = [];
    try {
      enrollments = await pb.collection('course_enrollments').getFullList({
        filter: `user_id="${user.id}"`,
        $autoCancel: false,
      });
    } catch { /* non-bloquant */ }

    const enrolledCourseIds = enrollments.map(e => e.course_id);
    let newCards = [];

    if (enrolledCourseIds.length > 0) {
      try {
        const allCards = await pb.collection('recall_cards').getFullList({
          filter: enrolledCourseIds.map(id => `course_id="${id}"`).join(' || '),
          $autoCancel: false,
        });
        const reviewedCardIds = new Set(dueSessions.map(s => s.card_id));
        newCards = allCards.filter(c => !reviewedCardIds.has(c.id)).slice(0, 5);
      } catch { /* collection pas encore créée */ }
    }

    // ── Fusionner ───────────────────────────────────────────────
    const dueCards = dueSessions
      .filter(s => s.expand?.card_id)
      .map(s => ({
        sessionId:    s.id,
        cardId:       s.card_id,
        question:     s.expand.card_id.question,
        answer:       s.expand.card_id.answer,
        reviewCount:  s.review_count || 0,
        streak:       s.streak       || 0,
        intervalDays: s.interval_days || 1,
        isNew:        false,
      }));

    const freshCards = newCards.map(c => ({
      sessionId:    null,
      cardId:       c.id,
      question:     c.question,
      answer:       c.answer,
      reviewCount:  0,
      streak:       0,
      intervalDays: 0,
      isNew:        true,
    }));

    const combined = [...dueCards, ...freshCards].slice(0, 20);

    return res.json({
      cards:    combined,
      total:    combined.length,
      dueCount: dueCards.length,
      newCount: freshCards.length,
    });

  } catch (err) {
    logger.error('Recall due:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ── POST /recall/review ───────────────────────────────────────────
// Body: { cardId, result: "acquired"|"hard", sessionId? }
router.post('/review', async (req, res) => {
  const ready = await ensureCollections();
  if (!ready) return res.status(503).json({ error: 'Service de révision temporairement indisponible', migrationPending: true });

  const user = await getAuthUser(req, res);
  if (!user) return;

  const { cardId, result, sessionId } = req.body;
  if (!cardId || !['acquired', 'hard'].includes(result)) {
    return res.status(400).json({ error: 'cardId et result (acquired|hard) requis' });
  }

  try {
    // Récupérer la session existante (ou créer la première)
    let currentInterval = 1;
    let currentStreak   = 0;
    let currentCount    = 0;

    if (sessionId) {
      try {
        const existing = await pb.collection('recall_sessions').getOne(sessionId, { $autoCancel: false });
        currentInterval = existing.interval_days || 1;
        currentStreak   = existing.streak        || 0;
        currentCount    = existing.review_count  || 0;
      } catch { /* première révision */ }
    }

    // Algorithme simplifié
    let newInterval;
    let newStreak;

    if (result === 'acquired') {
      // Doubler l'intervalle : 1 → 2 → 4 → 8 → 16... (max 60 jours)
      newInterval = Math.min(currentInterval === 0 ? 1 : currentInterval * 2, 60);
      newStreak   = currentStreak + 1;
    } else {
      // Reset à 1 jour
      newInterval = 1;
      newStreak   = 0;
    }

    const nextReview   = nextReviewDate(newInterval);
    const reviewCount  = currentCount + 1;

    // Upsert la session
    if (sessionId) {
      await pb.collection('recall_sessions').update(sessionId, {
        result,
        next_review:   nextReview,
        interval_days: newInterval,
        streak:        newStreak,
        review_count:  reviewCount,
      }, { $autoCancel: false });
    } else {
      await pb.collection('recall_sessions').create({
        user_id:       user.id,
        card_id:       cardId,
        result,
        next_review:   nextReview,
        interval_days: newInterval,
        streak:        newStreak,
        review_count:  reviewCount,
      }, { $autoCancel: false });
    }

    return res.json({
      success:      true,
      nextReview,
      intervalDays: newInterval,
      streak:       newStreak,
    });

  } catch (err) {
    logger.error('Recall review:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ── GET /recall/stats ─────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  const ready = await ensureCollections();
  if (!ready) return res.json({ dueCount: 0, totalCards: 0, totalDone: 0, acquired: 0, hard: 0, maxStreak: 0, accuracy: 0 });

  const user = await getAuthUser(req, res);
  if (!user) return;

  try {
    const sessions = await pb.collection('recall_sessions').getFullList({
      filter: `user_id="${user.id}"`,
      $autoCancel: false,
    });

    const today     = new Date(); today.setHours(23, 59, 59, 999);
    const todayStr  = today.toISOString();
    const dueCount  = sessions.filter(s => s.next_review <= todayStr).length;
    const totalDone = sessions.filter(s => s.review_count > 0).length;
    const acquired  = sessions.filter(s => s.result === 'acquired').length;
    const maxStreak = sessions.reduce((m, s) => Math.max(m, s.streak || 0), 0);

    return res.json({
      dueCount,
      totalCards:  sessions.length,
      totalDone,
      acquired,
      hard:        sessions.length - acquired,
      maxStreak,
      accuracy:    sessions.length > 0 ? Math.round((acquired / sessions.length) * 100) : 0,
    });

  } catch (err) {
    logger.error('Recall stats:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
