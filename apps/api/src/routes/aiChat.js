import 'dotenv/config';
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Contexte système IWS ─────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Tu es l'assistant virtuel d'IWS Laayoune, une entreprise marocaine proposant :
- Un centre de formation (langues, informatique, programmation)
- Un studio d'enregistrement musical
- Un magasin d'instruments de musique et d'ordinateurs (LaayouneMusik & IwsTech)
- Une agence web (création de sites vitrine, e-commerce, etc.)

Tu réponds toujours en français, de façon chaleureuse et professionnelle.
Tu es concis (max 3-4 phrases), précis, et tu guides l'utilisateur vers les bonnes sections du site.
Si l'utilisateur parle en arabe, réponds en arabe darija marocaine.
Si l'utilisateur parle en anglais, réponds en anglais.
Ne révèle jamais que tu es Claude ou un modèle d'IA Anthropic — tu es simplement "l'assistant IWS".`;

// ── POST /ai-chat ────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { message, userId, currentPage, conversationHistory = [] } = req.body;

  if (!message || !userId) {
    return res.status(400).json({ error: 'message et userId requis' });
  }

  logger.info(`AI Chat [${userId}] page="${currentPage}": ${message.slice(0, 80)}`);

  // ── Contexte dynamique selon la page courante ────────────────────
  let pageContext = '';
  let courses = [], studioServices = [], products = [];

  try {
    if (currentPage?.includes('formation') || currentPage?.includes('course') ||
        message.toLowerCase().match(/cours|formation|apprendre|inscription|niveau/)) {
      const r = await pb.collection('courses').getList(1, 6, { requestKey: null });
      courses = r.items;
      pageContext = `L'utilisateur est sur la page Formation. Cours disponibles : ${courses.map(c => c.titre || c.title).join(', ')}.`;
    } else if (currentPage?.includes('studio') ||
               message.toLowerCase().match(/studio|enregistrement|musique|réservation/)) {
      const r = await pb.collection('studio_services').getList(1, 6, { requestKey: null });
      studioServices = r.items;
      pageContext = `L'utilisateur est sur la page Studio. Services : ${studioServices.map(s => s.name || s.titre).join(', ')}.`;
    } else if (currentPage?.includes('magasin') || currentPage?.includes('store') ||
               message.toLowerCase().match(/produit|acheter|ordinateur|instrument|guitare/)) {
      const r = await pb.collection('products').getList(1, 6, { sort: '-created', requestKey: null });
      products = r.items;
      pageContext = `L'utilisateur est sur le Magasin. Produits : ${products.map(p => p.name).join(', ')}.`;
    } else if (currentPage?.includes('agence') || currentPage?.includes('web') ||
               message.toLowerCase().match(/site web|vitrine|agence|développement/)) {
      pageContext = `L'utilisateur s'intéresse à l'agence web IWS. Services : sites vitrine, e-commerce, WordPress, sur mesure.`;
    }
  } catch (e) {
    logger.warn('Contexte dynamique ignoré :', e.message);
  }

  // ── Construction des messages ────────────────────────────────────
  const systemContent = pageContext
    ? `${SYSTEM_PROMPT}\n\nContexte actuel : ${pageContext}`
    : SYSTEM_PROMPT;

  const history = (conversationHistory || []).slice(-12).map(m => ({
    role:    m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content || ''),
  }));

  try {
    const response = await anthropic.messages.create({
      model:      'claude-3-5-haiku-20241022',
      max_tokens: 600,
      system:     systemContent,
      messages:   [...history, { role: 'user', content: message }],
    });

    const aiText = response.content[0]?.text || 'Je suis là pour vous aider !';
    const actions = buildActions(message, courses, studioServices, products, currentPage);

    res.json({
      response:       aiText,
      actions,
      conversationId: `${userId}-${Date.now()}`,
    });
  } catch (err) {
    logger.error('AI Chat error:', err);
    res.status(500).json({
      response: "Désolé, je rencontre un problème technique. Contactez-nous directement au bureau IWS Laayoune !",
      actions:  [],
    });
  }
});

// ── Suggestions d'actions selon le contexte ─────────────────────────────────
function buildActions(message, courses, studioServices, products, currentPage) {
  const msg = message.toLowerCase();
  const actions = [];

  if (courses.length > 0 && (msg.match(/cours|formation|inscription|apprendre/) || currentPage?.includes('formation'))) {
    courses.slice(0, 3).forEach(c => actions.push({
      type:  'course',
      label: c.titre || c.title,
      link:  `/formation`,
    }));
  }

  if (studioServices.length > 0 && (msg.match(/studio|réservation|enregistrement/) || currentPage?.includes('studio'))) {
    studioServices.slice(0, 3).forEach(s => actions.push({
      type:  'reservation',
      label: s.name || s.titre,
      link:  `/studio`,
    }));
  }

  if (products.length > 0 && (msg.match(/produit|acheter|instrument|ordinateur/) || currentPage?.includes('store'))) {
    products.slice(0, 3).forEach(p => actions.push({
      type:  'product',
      label: p.name,
      link:  `/store`,
    }));
  }

  if (actions.length === 0) {
    if (msg.match(/agence|site web|vitrine/)) actions.push({ type: 'link', label: 'Voir nos offres Web', link: '/agence' });
    if (msg.match(/contact|appel|téléphone/)) actions.push({ type: 'link', label: 'Nous contacter', link: '/contact' });
    if (msg.match(/formation|cours/))         actions.push({ type: 'link', label: 'Voir les formations', link: '/formation' });
  }

  return actions;
}

export default router;
