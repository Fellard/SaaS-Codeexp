import 'dotenv/config';
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import logger from '../utils/logger.js';

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Catalogues de référence ──────────────────────────────────────────────────

const SITE_TYPES = {
  vitrine:     { label: 'Site Vitrine',         pages: ['Accueil', 'À propos', 'Services', 'Contact'],                          basePrice: 2500  },
  ecommerce:   { label: 'Boutique en ligne',    pages: ['Accueil', 'Catalogue', 'Panier', 'Checkout', 'Mon compte', 'Contact'], basePrice: 5000  },
  portfolio:   { label: 'Portfolio',            pages: ['Accueil', 'Portfolio', 'À propos', 'Contact'],                         basePrice: 1800  },
  blog:        { label: 'Blog / Magazine',      pages: ['Accueil', 'Articles', 'Catégories', 'À propos', 'Contact'],            basePrice: 2000  },
  restaurant:  { label: 'Site Restaurant',      pages: ['Accueil', 'Menu', 'Réservation', 'À propos', 'Contact'],               basePrice: 2800  },
  immobilier:  { label: 'Agence Immobilière',   pages: ['Accueil', 'Annonces', 'Services', 'Équipe', 'Contact'],                basePrice: 3500  },
  medical:     { label: 'Cabinet Médical',      pages: ['Accueil', 'Services', 'Équipe', 'Rendez-vous', 'Contact'],             basePrice: 3000  },
  education:   { label: 'Centre de Formation',  pages: ['Accueil', 'Formations', 'Inscriptions', 'Actualités', 'Contact'],      basePrice: 3200  },
};

const PALETTES = {
  moderne:    { primary: '#1E40AF', secondary: '#F59E0B', bg: '#F8FAFC', desc: 'Bleu professionnel & or'   },
  naturel:    { primary: '#065F46', secondary: '#D97706', bg: '#FFFBEB', desc: 'Vert nature & ambre'       },
  elegance:   { primary: '#1C1917', secondary: '#C084FC', bg: '#FAF5FF', desc: 'Noir élégant & violet'     },
  energie:    { primary: '#B91C1C', secondary: '#F97316', bg: '#FFF7ED', desc: 'Rouge dynamique & orange'  },
  tech:       { primary: '#0F172A', secondary: '#06B6D4', bg: '#F0F9FF', desc: 'Dark tech & cyan'          },
  chaleureux: { primary: '#92400E', secondary: '#F59E0B', bg: '#FFFBEB', desc: 'Brun chaleureux & or'      },
};

// ── POST /web-agency/propose-site ────────────────────────────────────────────
/**
 * Body : { secteur, description, budget, preferences, langue }
 * Retourne une proposition complète générée par Claude
 */
router.post('/propose-site', async (req, res) => {
  const {
    secteur      = '',
    description  = '',
    budget       = '',
    preferences  = '',
    langue       = 'fr',
  } = req.body;

  if (!secteur && !description) {
    return res.status(400).json({ error: 'secteur ou description requis' });
  }

  logger.info(`Web Agency AI proposal: secteur="${secteur}" budget="${budget}"`);

  const prompt = `Tu es un expert en création de sites web pour une agence digitale marocaine (IWS Laayoune).
Un client potentiel décrit son projet. Analyse-le et génère une proposition professionnelle.

Informations client :
- Secteur / type de business : ${secteur || 'non précisé'}
- Description du projet : ${description || 'non précisée'}
- Budget indicatif : ${budget || 'flexible'}
- Préférences / besoins spéciaux : ${preferences || 'aucune précision'}

Types de sites disponibles (choisis le plus adapté) :
${Object.entries(SITE_TYPES).map(([k, v]) => `- ${k}: ${v.label} (à partir de ${v.basePrice} MAD)`).join('\n')}

Palettes de couleurs disponibles (choisis la plus adaptée) :
${Object.entries(PALETTES).map(([k, v]) => `- ${k}: ${v.desc}`).join('\n')}

Réponds UNIQUEMENT en JSON valide (sans markdown, sans texte avant/après) avec cette structure EXACTE :
{
  "type_site": "clé du type (ex: vitrine)",
  "type_label": "libellé du type",
  "resume": "Résumé de la proposition en 2 phrases, s'adressant directement au client",
  "pages": ["Page 1", "Page 2", "Page 3", "Page 4", "Page 5"],
  "palette": "clé de la palette (ex: moderne)",
  "palette_desc": "description de la palette",
  "palette_primary": "#hex",
  "palette_secondary": "#hex",
  "fonctionnalites": ["Fonctionnalité 1", "Fonctionnalité 2", "Fonctionnalité 3", "Fonctionnalité 4"],
  "contenu_accueil": {
    "titre": "Titre accrocheur pour la page d'accueil",
    "sous_titre": "Sous-titre descriptif",
    "cta": "Texte du bouton d'appel à l'action"
  },
  "prix_estime": 2500,
  "delai_jours": 14,
  "points_forts": ["Point fort 1", "Point fort 2", "Point fort 3"],
  "technologies": ["WordPress", "SEO de base", "Responsive mobile"],
  "pourquoi": "Explication en 1-2 phrases du pourquoi ce choix est adapté au client"
}`;

  try {
    const message = await anthropic.messages.create({
      model:      'claude-3-5-haiku-20241022',
      max_tokens: 1200,
      messages:   [{ role: 'user', content: prompt }],
    });

    const text = message.content[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Réponse Claude non JSON');
    const data = JSON.parse(jsonMatch[0]);

    // Enrichir avec les données catalogue
    const typeInfo    = SITE_TYPES[data.type_site] || SITE_TYPES.vitrine;
    const paletteInfo = PALETTES[data.palette]     || PALETTES.moderne;

    res.json({
      success: true,
      proposal: {
        type_site:         data.type_site         || 'vitrine',
        type_label:        data.type_label        || typeInfo.label,
        resume:            data.resume            || '',
        pages:             Array.isArray(data.pages) ? data.pages : typeInfo.pages,
        palette:           data.palette           || 'moderne',
        palette_desc:      data.palette_desc      || paletteInfo.desc,
        palette_primary:   data.palette_primary   || paletteInfo.primary,
        palette_secondary: data.palette_secondary || paletteInfo.secondary,
        fonctionnalites:   Array.isArray(data.fonctionnalites)  ? data.fonctionnalites  : [],
        contenu_accueil:   data.contenu_accueil   || {},
        prix_estime:       data.prix_estime       || typeInfo.basePrice,
        delai_jours:       data.delai_jours       || 14,
        points_forts:      Array.isArray(data.points_forts)     ? data.points_forts     : [],
        technologies:      Array.isArray(data.technologies)     ? data.technologies     : ['WordPress', 'SEO', 'Responsive'],
        pourquoi:          data.pourquoi          || '',
      },
    });
  } catch (err) {
    logger.error('Web Agency AI error:', err);
    res.status(500).json({ error: 'Échec de la génération', detail: err.message });
  }
});

// ── POST /web-agency/generate-content ────────────────────────────────────────
/**
 * Génère du contenu pour une page spécifique d'un site
 * Body : { secteur, page, tone, langue }
 */
router.post('/generate-content', async (req, res) => {
  const { secteur = '', page = 'Accueil', tone = 'professionnel', langue = 'fr' } = req.body;

  const prompt = `Tu travailles pour une agence web marocaine. Génère du contenu pour la page "${page}" d'un site dans le secteur "${secteur}".
Ton : ${tone}. Langue : ${langue === 'ar' ? 'arabe' : 'français'}.

Réponds en JSON sans markdown :
{
  "titre": "Titre principal",
  "sous_titre": "Sous-titre accrocheur",
  "corps": "2-3 paragraphes de contenu pour cette page",
  "cta_texte": "Texte du bouton CTA",
  "mots_cles": ["mot1", "mot2", "mot3"]
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = message.content[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    res.json({ success: true, content: JSON.parse(jsonMatch ? jsonMatch[0] : '{}') });
  } catch (err) {
    logger.error('Generate content error:', err);
    res.status(500).json({ error: 'Échec génération contenu', detail: err.message });
  }
});

export default router;
