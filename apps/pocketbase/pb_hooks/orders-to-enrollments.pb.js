/// <reference path="../pb_data/types.d.ts" />

/**
 * Hook PocketBase : orders → course_enrollments
 *
 * Quand une commande est créée avec status='completed' (ou mise à jour vers 'completed'),
 * on cherche si un champ `course_id` est présent dans l'ordre et on crée l'enrollment
 * correspondant dans course_enrollments.
 *
 * Également, si la commande contient des produits liés à des cours (via le champ
 * product.course_id), on crée les enrollments pour chaque cours lié.
 */

// ── Création d'une commande avec status=completed ────────────────
onRecordAfterCreateSuccess((e) => {
  const record = e.record;
  if (!record) return;
  if (record.get('status') !== 'completed') return;

  createEnrollmentsForOrder(record);
}, 'orders');

// ── Mise à jour vers status=completed ───────────────────────────
onRecordAfterUpdateSuccess((e) => {
  const record = e.record;
  if (!record) return;
  if (record.get('status') !== 'completed') return;

  createEnrollmentsForOrder(record);
}, 'orders');

/**
 * Crée les enrollments pour tous les cours associés à une commande complétée.
 */
function createEnrollmentsForOrder(order) {
  const userId = order.get('user_id');
  if (!userId) return;

  // Cas 1 : champ direct course_id sur la commande
  const directCourseId = order.get('course_id');
  if (directCourseId) {
    ensureEnrollment(userId, directCourseId);
  }

  // Cas 2 : produits liés à des cours (via products[].course_id)
  const productIds = order.get('products') || [];
  if (!Array.isArray(productIds) || productIds.length === 0) return;

  for (const productId of productIds) {
    try {
      const product = $app.findRecordById('products', productId);
      if (!product) continue;
      const courseId = product.get('course_id');
      if (courseId) {
        ensureEnrollment(userId, courseId);
      }
    } catch {
      // Produit introuvable ou pas de cours lié → on ignore
    }
  }
}

/**
 * Crée un enrollment si l'utilisateur n'est pas encore inscrit au cours.
 */
function ensureEnrollment(userId, courseId) {
  try {
    // Vérifier si déjà inscrit
    $app.findFirstRecordByFilter('course_enrollments', `user_id="${userId}" && course_id="${courseId}"`);
    // Si on arrive ici, l'enrollment existe déjà
    return;
  } catch {
    // Pas encore inscrit → créer l'enrollment
  }

  try {
    const collection = $app.findCollectionByNameOrId('course_enrollments');
    const enrollment = new Record(collection);
    enrollment.set('user_id', userId);
    enrollment.set('course_id', courseId);
    enrollment.set('status', 'active');
    enrollment.set('progression', 0);
    enrollment.set('complete', false);
    enrollment.set('start_date', new Date().toISOString());
    $app.save(enrollment);
    console.log(`[hook] Enrollment créé: user=${userId} course=${courseId}`);
  } catch (err) {
    console.error(`[hook] Erreur création enrollment:`, err);
  }
}
