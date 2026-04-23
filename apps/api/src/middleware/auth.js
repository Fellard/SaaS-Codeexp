/**
 * Middleware RBAC — IWS LAAYOUNE
 * ─────────────────────────────────────────────────────────────────────────────
 * requireAuth   : tout utilisateur authentifié (token valide)
 * requireRole   : restreint l'accès à un ou plusieurs rôles spécifiques
 * logAccess     : log chaque tentative d'accès aux routes protégées
 * ─────────────────────────────────────────────────────────────────────────────
 */
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

// ── Décode le JWT et charge l'utilisateur depuis PocketBase ─────────────────
async function extractUser(token) {
  const parts = token.split('.');
  if (parts.length < 2) throw new Error('JWT malformé');

  const payload = JSON.parse(
    Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
  );

  if (payload.exp && Date.now() / 1000 > payload.exp) {
    throw new Error('Token expiré');
  }

  const userId = payload.id || payload.sub;
  if (!userId) throw new Error('ID utilisateur absent du token');

  // Charge l'utilisateur en base via le client superuser
  const user = await pb.collection('users').getOne(userId, { $autoCancel: false });
  return user;
}

// ── requireAuth : tout utilisateur connecté ─────────────────────────────────
export async function requireAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return res.status(401).json({ error: 'Authentification requise' });
  }

  try {
    req.user = await extractUser(token);
    logger.info(`[AUTH] ${req.user.email} (${req.user.role}) → ${req.method} ${req.path}`);
    next();
  } catch (err) {
    logger.warn(`[AUTH] Échec d'authentification : ${err.message}`);
    return res.status(401).json({ error: err.message || 'Token invalide ou expiré' });
  }
}

// ── requireRole : restreint à un ou plusieurs rôles ─────────────────────────
// Usage : router.get('/route', requireRole('etudiant', 'admin'), handler)
export function requireRole(...allowedRoles) {
  return async (req, res, next) => {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    try {
      const user = await extractUser(token);

      if (!allowedRoles.includes(user.role)) {
        logger.warn(
          `[RBAC] ACCÈS REFUSÉ — utilisateur "${user.email}" (rôle: ${user.role}) ` +
          `a tenté d'accéder à ${req.method} ${req.originalUrl}. ` +
          `Rôles autorisés : ${allowedRoles.join(', ')}`
        );
        return res.status(403).json({
          error: `Accès refusé — rôle requis : ${allowedRoles.join(' ou ')}`,
          yourRole: user.role,
          requiredRoles: allowedRoles,
        });
      }

      req.user = user;
      logger.info(
        `[RBAC] ACCÈS AUTORISÉ — ${user.email} (${user.role}) → ${req.method} ${req.originalUrl}`
      );
      next();
    } catch (err) {
      logger.warn(`[RBAC] Erreur vérification rôle : ${err.message}`);
      return res.status(401).json({ error: err.message || 'Token invalide ou expiré' });
    }
  };
}

// ── logAccess : middleware de logging simple (non bloquant) ─────────────────
export function logAccess(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length >= 2) {
        const payload = JSON.parse(
          Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
        );
        logger.info(`[ACCESS] ID=${payload.id || '?'} → ${req.method} ${req.originalUrl}`);
      }
    } catch { /* non bloquant */ }
  }
  next();
}
