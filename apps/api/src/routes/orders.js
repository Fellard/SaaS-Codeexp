/**
 * Routes de gestion des commandes (orders)
 *   POST /orders/:id/cancel    — utilisateur annule sa propre commande pending
 *   POST /orders/:id/mark-paid — admin marque une commande comme payée (+ crée enrollment)
 */
import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// ── Helper : décode et vérifie le JWT Bearer ──────────────────────────────────
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
    const user = await pb.collection('users').getOne(userId, { $autoCancel: false });
    return user;
  } catch (err) {
    res.status(401).json({ error: 'Token invalide', detail: err.message });
    return null;
  }
}

// ── POST /orders/:id/cancel ───────────────────────────────────────────────────
// Utilisateur OU admin annule une commande "pending"
router.post('/:id/cancel', async (req, res) => {
  const { id } = req.params;

  const user = await getAuthUser(req, res);
  if (!user) return;

  try {
    let order;
    try {
      order = await pb.collection('orders').getOne(id, { $autoCancel: false });
    } catch {
      return res.status(404).json({ error: 'Commande introuvable' });
    }

    const isAdmin = user.role === 'admin';
    if (!isAdmin && order.user_id !== user.id) {
      return res.status(403).json({ error: 'Non autorisé — cette commande ne vous appartient pas' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ error: `Impossible d'annuler une commande "${order.status}"` });
    }

    await pb.collection('orders').update(id, { status: 'cancelled' }, { $autoCancel: false });
    logger.info(`Order ${id} cancelled by user ${user.id} (${user.role})`);
    return res.json({ success: true });

  } catch (err) {
    logger.error('Order cancel:', err.message);
    return res.status(500).json({ error: 'Annulation impossible', detail: err.message });
  }
});

// ── POST /orders/:id/mark-paid ────────────────────────────────────────────────
// Admin seulement : passe une commande "pending" → "completed" et crée l'enrollment
router.post('/:id/mark-paid', async (req, res) => {
  const { id } = req.params;

  const user = await getAuthUser(req, res);
  if (!user) return;

  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé — rôle admin requis' });
  }

  try {
    let order;
    try {
      order = await pb.collection('orders').getOne(id, { $autoCancel: false });
    } catch {
      return res.status(404).json({ error: 'Commande introuvable' });
    }

    if (order.status === 'completed') {
      return res.status(400).json({ error: 'Commande déjà marquée comme payée' });
    }

    // Marquer comme payée
    await pb.collection('orders').update(id, {
      status:         'completed',
      payment_method: req.body.payment_method || 'especes',
      paid_at:        new Date().toISOString(),
    }, { $autoCancel: false });

    // Créer l'enrollment si course_id disponible
    if (order.course_id && order.user_id) {
      try {
        const existing = await pb.collection('course_enrollments').getFullList({
          filter: `user_id="${order.user_id}" && course_id="${order.course_id}"`,
          $autoCancel: false,
        });
        if (existing.length === 0) {
          await pb.collection('course_enrollments').create({
            user_id:    order.user_id,
            course_id:  order.course_id,
            progression: 0,
            complete:   false,
            status:     'active',
            start_date: new Date().toISOString(),
          }, { $autoCancel: false });
          logger.info(`Enrollment created: user=${order.user_id} course=${order.course_id}`);
        }
      } catch (enrollErr) {
        logger.warn('Enrollment creation failed (non-bloquant):', enrollErr.message);
      }
    }

    logger.info(`Order ${id} marked as paid by admin ${user.id}`);
    return res.json({ success: true });

  } catch (err) {
    logger.error('Order mark-paid:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
