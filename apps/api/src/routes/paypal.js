/**
 * PayPal Checkout Integration — IWS Laayoune
 *
 * Routes :
 *   POST /paypal/create-order   → crée une commande PayPal, retourne { id }
 *   POST /paypal/capture-order  → capture le paiement, met à jour PocketBase
 *
 * Variables d'env requises :
 *   PAYPAL_CLIENT_ID     — côté backend uniquement (aussi exposé au frontend via /paypal/config)
 *   PAYPAL_SECRET        — JAMAIS côté frontend
 *   PAYPAL_MODE          — "sandbox" (test) ou "live" (production), défaut: sandbox
 */

import 'dotenv/config';
import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// ── Config PayPal ────────────────────────────────────────────────────────────
const PAYPAL_MODE      = process.env.PAYPAL_MODE || 'sandbox';
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_SECRET    = process.env.PAYPAL_SECRET    || '';

const PAYPAL_BASE_URL = PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// ── Obtenir un token d'accès PayPal ─────────────────────────────────────────
async function getAccessToken() {
  const credentials = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method:  'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type':  'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`PayPal token error: ${err.error_description || res.status}`);
  }
  const data = await res.json();
  return data.access_token;
}

// ── GET /paypal/config — expose le Client ID au frontend (sans le secret) ───
router.get('/config', (req, res) => {
  if (!PAYPAL_CLIENT_ID) {
    return res.status(500).json({ error: 'PAYPAL_CLIENT_ID non configuré' });
  }
  res.json({
    clientId: PAYPAL_CLIENT_ID,
    mode:     PAYPAL_MODE,
    currency: 'USD',   // PayPal n'accepte pas MAD — conversion côté serveur
  });
});

// ── POST /paypal/create-order ────────────────────────────────────────────────
/**
 * Body : {
 *   amount:       number   (prix en MAD — converti en USD)
 *   description:  string   (ex: "Accès cours Français A1")
 *   orderId:      string   (ID interne PocketBase de la commande, optionnel)
 *   orderType:    string   "formation" | "web_agency"
 * }
 * Retourne : { id: "PAYPAL_ORDER_ID" }
 */
router.post('/create-order', async (req, res) => {
  const { amount, description, orderId, orderType = 'formation' } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'amount requis (en MAD)' });
  }

  try {
    const token = await getAccessToken();

    // Conversion MAD → USD (taux approximatif — ajustez selon le taux du jour)
    // 1 USD ≈ 10 MAD (à adapter)
    const MAD_TO_USD = parseFloat(process.env.MAD_TO_USD_RATE || '0.10');
    const amountUSD  = (amount * MAD_TO_USD).toFixed(2);

    const payload = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value:         amountUSD,
        },
        description: description || 'IWS Laayoune',
        custom_id:   orderId || '',
      }],
      application_context: {
        brand_name:          'IWS Laayoune',
        landing_page:        'NO_PREFERENCE',
        user_action:         'PAY_NOW',
        return_url:          `${process.env.SITE_URL}/payment/success`,
        cancel_url:          `${process.env.SITE_URL}/payment/cancel`,
      },
    };

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      logger.error('PayPal create-order error:', err);
      throw new Error(err.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    logger.info(`PayPal order created: ${data.id} (${amountUSD} USD = ${amount} MAD)`);

    res.json({ id: data.id, amountUSD, amountMAD: amount });
  } catch (err) {
    logger.error('PayPal create-order:', err.message);
    res.status(500).json({ error: 'Impossible de créer la commande PayPal', detail: err.message });
  }
});

// ── POST /paypal/capture-order ───────────────────────────────────────────────
/**
 * Body : {
 *   paypalOrderId:  string  (ID retourné par create-order)
 *   pbOrderId:      string  (ID de la commande PocketBase)
 *   orderType:      string  "formation" | "web_agency"
 * }
 * Retourne : { success, transactionId, status }
 */
router.post('/capture-order', async (req, res) => {
  const { paypalOrderId, pbOrderId, orderType = 'formation' } = req.body;

  if (!paypalOrderId) {
    return res.status(400).json({ error: 'paypalOrderId requis' });
  }

  try {
    const token = await getAccessToken();

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json',
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      logger.error('PayPal capture error:', err);
      throw new Error(err.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const captureStatus = data.status; // COMPLETED | APPROVED | etc.

    logger.info(`PayPal captured: ${paypalOrderId} → status=${captureStatus}`);

    // ── Mettre à jour PocketBase si paiement réussi ──────────────
    if (captureStatus === 'COMPLETED' && pbOrderId) {
      const collection = orderType === 'web_agency' ? 'web_orders' : 'orders';
      try {
        await pb.collection(collection).update(pbOrderId, {
          status:           'completed',
          payment_method:   'paypal',
          paypal_order_id:  paypalOrderId,
          paid_at:          new Date().toISOString(),
        }, { requestKey: null });
        logger.info(`PocketBase ${collection} ${pbOrderId} → completed`);
      } catch (pbErr) {
        // Ne pas bloquer la réponse si PB échoue — le paiement a déjà été capturé
        logger.error(`PocketBase update failed for ${pbOrderId}:`, pbErr.message);
      }
    }

    const transactionId = data.purchase_units?.[0]?.payments?.captures?.[0]?.id || paypalOrderId;

    res.json({
      success:       captureStatus === 'COMPLETED',
      transactionId,
      paypalStatus:  captureStatus,
      pbOrderId,
    });
  } catch (err) {
    logger.error('PayPal capture-order:', err.message);
    res.status(500).json({ error: 'Capture du paiement échouée', detail: err.message });
  }
});

// ── POST /paypal/webhook (optionnel — pour les paiements asynchrones) ────────
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  // À implémenter si vous souhaitez gérer les webhooks PayPal
  // (paiements différés, litiges, remboursements, etc.)
  logger.info('PayPal webhook received');
  res.json({ received: true });
});

export default router;
