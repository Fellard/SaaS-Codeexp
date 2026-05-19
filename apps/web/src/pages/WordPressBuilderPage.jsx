import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Layers, Search, Eye, Check, X, ChevronRight, ArrowRight,
  Zap, Shield, Globe, Clock, Star, CheckCircle2, ArrowLeft,
  MessageSquare, Send, Bot, User as UserIcon, Phone, Mail,
  Loader2, ExternalLink, Monitor, Smartphone, Tablet,
  ShoppingCart, Briefcase, Camera, Utensils, Heart, BookOpen,
  Building2, Music, Dumbbell, Info, Sparkles,
} from 'lucide-react';

// ── Données statiques ────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'all',        label: 'Tous', icon: Layers },
  { id: 'business',   label: 'Business', icon: Briefcase },
  { id: 'ecommerce',  label: 'E-commerce', icon: ShoppingCart },
  { id: 'portfolio',  label: 'Portfolio', icon: Camera },
  { id: 'restaurant', label: 'Restaurant', icon: Utensils },
  { id: 'sante',      label: 'Santé', icon: Heart },
  { id: 'education',  label: 'Éducation', icon: BookOpen },
  { id: 'immobilier', label: 'Immobilier', icon: Building2 },
];

const STATIC_TEMPLATES = [
  { id: 't1', nom: 'Nexus Business', categorie: 'business', prix_base: 1200, prix_mensuel: 99, delai_jours: 3, popular: true, demo_url: 'https://demo.page/', preview: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&q=80', couleurs: ['#1e293b','#3b82f6','#f8fafc'], features: ['5 pages','Formulaire contact','SEO optimisé','Responsive','Google Analytics','SSL inclus'] },
  { id: 't2', nom: 'ShopPro',        categorie: 'ecommerce', prix_base: 2500, prix_mensuel: 149, delai_jours: 5, popular: true, demo_url: null, preview: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80', couleurs: ['#7c3aed','#ec4899','#fff'], features: ['WooCommerce','Paiement CB/PayPal','Catalogue illimité','Gestion stock','Tableau de bord ventes','SSL inclus'] },
  { id: 't3', nom: 'PortFolio X',    categorie: 'portfolio', prix_base: 900, prix_mensuel: 79, delai_jours: 2, popular: false, demo_url: null, preview: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&q=80', couleurs: ['#000','#fff','#f59e0b'], features: ['Galerie photo/vidéo','Animations smooth','Page CV','Formulaire contact','Blog inclus','SSL inclus'] },
  { id: 't4', nom: 'Saveurs',        categorie: 'restaurant', prix_base: 1100, prix_mensuel: 89, delai_jours: 3, popular: false, demo_url: null, preview: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', couleurs: ['#92400e','#fbbf24','#fff'], features: ['Menu dynamique','Réservation en ligne','Galerie plats','Carte Google Maps','Horaires d\'ouverture','SSL inclus'] },
  { id: 't5', nom: 'MediCare',       categorie: 'sante', prix_base: 1300, prix_mensuel: 99, delai_jours: 4, popular: false, demo_url: null, preview: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80', couleurs: ['#0284c7','#e0f2fe','#fff'], features: ['Prise de RDV en ligne','Équipe médicale','Services détaillés','Téléphone d\'urgence','Blog santé','SSL inclus'] },
  { id: 't6', nom: 'EduLearn',       categorie: 'education', prix_base: 1400, prix_mensuel: 109, delai_jours: 4, popular: false, demo_url: null, preview: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80', couleurs: ['#059669','#d1fae5','#fff'], features: ['Gestion des cours','Inscription en ligne','Espace élèves','Calendrier','Quiz interactifs','SSL inclus'] },
  { id: 't7', nom: 'ImmoFirst',      categorie: 'immobilier', prix_base: 1800, prix_mensuel: 129, delai_jours: 5, popular: true, demo_url: null, preview: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80', couleurs: ['#1e293b','#d97706','#fff'], features: ['Annonces illimitées','Carte interactive','Filtres avancés','Estimation en ligne','Module CRM','SSL inclus'] },
  { id: 't8', nom: 'Lumina Studio',  categorie: 'portfolio', prix_base: 950, prix_mensuel: 79, delai_jours: 2, popular: false, demo_url: null, preview: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80', couleurs: ['#f9fafb','#111','#6366f1'], features: ['Mode sombre/clair','Galerie fullscreen','Animation parallax','Formulaire client','Témoignages','SSL inclus'] },
  { id: 't9', nom: 'StartUp Pro',    categorie: 'business', prix_base: 1500, prix_mensuel: 119, delai_jours: 3, popular: false, demo_url: null, preview: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80', couleurs: ['#7c3aed','#4f46e5','#fff'], features: ['Landing page optimisée','Section pricing','Témoignages','Intégration CRM','Newsletter','SSL inclus'] },
  { id: 't10', nom: 'FoodDelivery',  categorie: 'restaurant', prix_base: 2200, prix_mensuel: 139, delai_jours: 5, popular: false, demo_url: null, preview: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80', couleurs: ['#dc2626','#fef2f2','#fff'], features: ['Commande en ligne','Zone de livraison','Suivi commande','Paiement en ligne','Menu multilingue','SSL inclus'] },
  { id: 't11', nom: 'AgenceDigital', categorie: 'business', prix_base: 1600, prix_mensuel: 119, delai_jours: 4, popular: false, demo_url: null, preview: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80', couleurs: ['#0f172a','#38bdf8','#fff'], features: ['Portfolio projets','Page équipe','Processus de travail','Blog','Formulaire devis','SSL inclus'] },
  { id: 't12', nom: 'BoutiqueMode',  categorie: 'ecommerce', prix_base: 2800, prix_mensuel: 159, delai_jours: 6, popular: true, demo_url: null, preview: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80', couleurs: ['#fdf2f8','#ec4899','#1f2937'], features: ['Mode & Fashion UI','Lookbook','Wishlist','Soldes & promos','Tailles guide','SSL inclus'] },
];

const OPTIONS = [
  { id: 'maintenance', label: 'Maintenance mensuelle', desc: 'Mises à jour, sauvegardes, monitoring 24/7', prix: 199, recurrent: true },
  { id: 'seo',         label: 'Pack SEO avancé',       desc: 'Rapport mensuel, optimisation continue, backlinks', prix: 299, recurrent: true },
  { id: 'multilang',   label: 'Multilingue',            desc: 'Traduction en 2 langues supplémentaires (AR, EN, FR)', prix: 400, recurrent: false },
  { id: 'logo',        label: 'Logo professionnel',     desc: 'Création logo par notre designer + fichiers sources', prix: 600, recurrent: false },
];

// ── FAQ pour l'assistant IA ───────────────────────────────────────────────────
const AI_FAQ = [
  { keys: ['prix','coûte','tarif','combien'], answer: 'Nos sites WordPress débutent à **900 MAD** pour un portfolio simple. Pour un e-commerce, comptez à partir de **2 500 MAD**. Chaque template affiche son prix exact. Des options comme la maintenance ou le SEO sont disponibles en supplément.' },
  { keys: ['délai','temps','livraison','rapide','vite','quand'], answer: 'La création prend entre **2 et 6 jours ouvrables** selon le template choisi. Les sites vitrine et portfolio sont les plus rapides (2-3 jours). Les e-commerces nécessitent 5-6 jours pour la configuration complète.' },
  { keys: ['domaine','nom de domaine','url','adresse'], answer: 'Vous pouvez utiliser un domaine existant ou en acheter un via Hostinger (notre partenaire). Un domaine **.com** coûte environ 59 MAD/an, un **.ma** environ 99 MAD/an. Nous nous occupons de toute la configuration DNS.' },
  { keys: ['hébergement','serveur','hosting'], answer: 'L\'hébergement est **inclus** dans l\'abonnement mensuel. Nos serveurs sont hébergés chez Hostinger avec un uptime de 99.9%, SSL inclus, et sauvegardes quotidiennes automatiques.' },
  { keys: ['modifier','changer','personnaliser','couleur','logo','texte'], answer: 'Oui ! WordPress est livré avec un tableau de bord intuitif. Vous pouvez modifier textes, images et couleurs vous-même. Nous fournissons également une formation de 30 min incluse avec chaque site.' },
  { keys: ['woocommerce','boutique','vendre','paiement','stripe','paypal'], answer: 'Nos templates e-commerce intègrent **WooCommerce** avec Stripe et PayPal préconfigurés. Vous pouvez accepter des paiements par carte, virement ou à la livraison. Pas de commission supplémentaire de notre part.' },
  { keys: ['seo','google','référencement','classement'], answer: 'Chaque site est livré avec **Yoast SEO** configuré, des balises meta optimisées, un sitemap XML et des images compressées. Pour un suivi mensuel avec rapport, notre Pack SEO est à 299 MAD/mois.' },
  { keys: ['support','aide','assistance','problème','bug'], answer: 'Nous offrons un support par WhatsApp et email. Pour les clients avec abonnement maintenance, la réponse est garantie en moins de 4h. Les autres clients bénéficient d\'un support pendant les 30 premiers jours.' },
  { keys: ['mobile','responsive','téléphone','smartphone'], answer: 'Tous nos templates sont **100% responsive** — ils s\'adaptent parfaitement aux mobiles, tablettes et ordinateurs. Nous testons sur Chrome, Safari, Firefox et les principaux appareils Android et iOS.' },
  { keys: ['wordpress','cms','admin','panneau'], answer: 'WordPress est le CMS numéro 1 mondial (43% des sites web). Il est facile à utiliser, très évolutif et dispose de milliers de plugins. Nous le préconfigurons entièrement — vous recevez les accès admin dès la livraison.' },
  { keys: ['bonjour','salut','hello','hi','bonsoir'], answer: 'Bonjour ! 👋 Je suis l\'assistant IWS. Je peux répondre à vos questions sur la création de sites WordPress — prix, délais, fonctionnalités, hébergement... Qu\'est-ce que je peux faire pour vous ?' },
  { keys: ['merci','super','parfait','excellent','génial'], answer: 'Avec plaisir ! 😊 Si vous avez d\'autres questions ou souhaitez démarrer votre projet, n\'hésitez pas. Vous pouvez aussi nous contacter directement sur WhatsApp.' },
];

const getAIResponse = (message) => {
  const lower = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const faq of AI_FAQ) {
    if (faq.keys.some(k => lower.includes(k))) return faq.answer;
  }
  return 'Je ne suis pas sûr de comprendre votre question 🤔 Pouvez-vous reformuler ? Vous pouvez demander : **prix**, **délais**, **domaine**, **hébergement**, **modifications**, **paiement**, **SEO**, ou **support**.\n\nOu contactez-nous directement sur WhatsApp pour une réponse immédiate.';
};

// ── Composant : Carte template ────────────────────────────────────────────────
const TemplateCard = ({ tpl, onPreview, onSelect }) => (
  <div className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-purple-300 transition-all duration-300 flex flex-col">
    {tpl.popular && (
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
        <Star className="w-3 h-3 fill-white" />Populaire
      </div>
    )}
    <div className="relative overflow-hidden aspect-[16/10] bg-muted">
      <img src={tpl.preview} alt={tpl.nom} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
        <button onClick={() => onPreview(tpl)} className="flex items-center gap-1.5 bg-white text-gray-900 font-semibold text-xs px-3.5 py-2 rounded-full hover:bg-gray-100 transition-colors shadow-lg">
          <Eye className="w-3.5 h-3.5" />Aperçu
        </button>
        <button onClick={() => onSelect(tpl)} className="flex items-center gap-1.5 bg-purple-600 text-white font-semibold text-xs px-3.5 py-2 rounded-full hover:bg-purple-700 transition-colors shadow-lg">
          <Zap className="w-3.5 h-3.5" />Choisir
        </button>
      </div>
    </div>
    <div className="p-4 flex flex-col flex-1">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-foreground">{tpl.nom}</h3>
        <div className="flex gap-1">
          {tpl.couleurs.slice(0,3).map((c, i) => (
            <div key={i} className="w-4 h-4 rounded-full border border-border shadow-sm" style={{ background: c }} />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
        <div>
          <span className="text-lg font-extrabold text-purple-600">{tpl.prix_base} MAD</span>
          <span className="text-xs text-muted-foreground ml-1">+ {tpl.prix_mensuel} MAD/mois</span>
        </div>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">~{tpl.delai_jours} jours</span>
      </div>
    </div>
  </div>
);

// ── Composant : Modal Aperçu ──────────────────────────────────────────────────
const PreviewModal = ({ tpl, onClose, onSelect }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
    <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">{tpl.nom}</h2>
          <p className="text-sm text-muted-foreground capitalize">{tpl.categorie}</p>
        </div>
        <div className="flex items-center gap-3">
          {tpl.demo_url && tpl.demo_url !== '#' && (
            <a href={tpl.demo_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs"><ExternalLink className="w-3.5 h-3.5" />Démo live</Button>
            </a>
          )}
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="p-5">
        {/* Preview image + device mockup tabs */}
        <div className="rounded-xl overflow-hidden border border-border mb-5 aspect-video">
          <img src={tpl.preview} alt={tpl.nom} className="w-full h-full object-cover" />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {/* Fonctionnalités */}
          <div>
            <h3 className="font-bold text-foreground mb-3 text-sm">Fonctionnalités incluses</h3>
            <ul className="space-y-2">
              {tpl.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />{f}
                </li>
              ))}
            </ul>
          </div>

          {/* Prix & détails */}
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5">
            <p className="text-xs font-bold text-purple-700 mb-3">Résumé tarifaire</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Création & installation</span><span className="font-bold text-foreground">{tpl.prix_base} MAD</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Hébergement mensuel</span><span className="font-bold text-foreground">{tpl.prix_mensuel} MAD/mois</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Délai de livraison</span><span className="font-bold text-foreground">~{tpl.delai_jours} jours</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">SSL / HTTPS</span><span className="font-bold text-green-600">Inclus ✓</span></div>
            </div>
            <div className="flex gap-1 mt-4 pt-3 border-t border-purple-200">
              {tpl.couleurs.map((c, i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-white shadow" style={{ background: c }} title={c} />
              ))}
              <span className="text-xs text-purple-700 ml-2 self-center">Palette incluse</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 pt-0">
        <Button onClick={() => { onClose(); onSelect(tpl); }} className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-base">
          <Zap className="w-4 h-4 mr-2" />Choisir ce template — {tpl.prix_base} MAD
        </Button>
      </div>
    </div>
  </div>
);

// ── Composant : Wizard de commande ────────────────────────────────────────────
const OrderWizard = ({ template, onClose, onSuccess, currentUser, isAuthenticated }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    domainStatus: 'a_acheter',
    domainName: '',
    options: [],
    nom: currentUser?.name || '',
    tel: '',
    email: currentUser?.email || '',
    brief: '',
  });
  const [loading, setLoading] = useState(false);

  const toggleOption = (id) => setForm(p => ({
    ...p,
    options: p.options.includes(id) ? p.options.filter(o => o !== id) : [...p.options, id],
  }));

  const selectedOptions = OPTIONS.filter(o => form.options.includes(o.id));
  const totalOptions = selectedOptions.reduce((s, o) => s + o.prix, 0);
  const totalMensuel = template.prix_mensuel + selectedOptions.filter(o => o.recurrent).reduce((s, o) => s + o.prix, 0);
  const totalCreation = template.prix_base + selectedOptions.filter(o => !o.recurrent).reduce((s, o) => s + o.prix, 0);

  const canNext = () => {
    if (step === 1) return true;
    if (step === 2) return true;
    if (step === 3) return form.nom.trim() && form.tel.trim() && form.email.trim();
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await pb.collection('web_orders').create({
        client_id: currentUser?.id || '',
        service_nom: `WordPress — ${template.nom}`,
        tech_choice: 'wordpress',
        domain_status: form.domainStatus,
        domain_name: form.domainName.trim(),
        client_nom: form.nom.trim(),
        client_tel: form.tel.trim(),
        brief: `Template: ${template.nom}\nOptions: ${selectedOptions.map(o => o.label).join(', ') || 'Aucune'}\nNotes: ${form.brief}`,
        statut: 'nouveau',
        montant: totalCreation,
        notes_admin: `Template ID: ${template.id}\nTotal mensuel estimé: ${totalMensuel} MAD/mois`,
      }, { requestKey: null });

      toast.success('🚀 Commande envoyée ! Nous vous contactons sous 24h.');
      onSuccess({ template, form, totalCreation, totalMensuel });
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de l\'envoi. Réessayez.');
    } finally { setLoading(false); }
  };

  const STEPS = ['Template', 'Options', 'Vos infos', 'Récapitulatif'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><Layers className="w-4 h-4 text-purple-600" /></div>
            <div>
              <p className="font-bold text-foreground text-sm">Commander — {template.nom}</p>
              <p className="text-xs text-muted-foreground">{STEPS[step - 1]}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-4 h-4" /></button>
        </div>

        {/* Barre de progression */}
        <div className="flex gap-1 px-5 pt-4">
          {STEPS.map((s, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${step > i ? 'bg-purple-600' : step === i + 1 ? 'bg-purple-400' : 'bg-muted'}`} />
          ))}
        </div>

        <div className="p-5 space-y-5">

          {/* Étape 1 : Template confirmé */}
          {step === 1 && (
            <div>
              <h3 className="font-bold text-foreground mb-4">Template sélectionné</h3>
              <div className="flex gap-4 p-4 bg-purple-50 border border-purple-200 rounded-2xl">
                <img src={template.preview} alt={template.nom} className="w-24 h-16 object-cover rounded-xl shrink-0" />
                <div>
                  <p className="font-bold text-foreground">{template.nom}</p>
                  <p className="text-xs text-muted-foreground capitalize mb-2">{template.categorie}</p>
                  <div className="flex flex-wrap gap-1">
                    {template.features.slice(0, 3).map(f => (
                      <span key={f} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{f}</span>
                    ))}
                  </div>
                </div>
              </div>

              <h3 className="font-bold text-foreground mt-5 mb-3">Votre domaine</h3>
              <div className="space-y-2">
                {[
                  { value: 'a_acheter', label: 'Je n\'ai pas encore de domaine', desc: 'Nous en choisissons un avec vous via Hostinger' },
                  { value: 'deja_proprietaire', label: 'J\'ai déjà mon domaine', desc: 'Renseignez-le ci-dessous' },
                ].map(opt => (
                  <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.domainStatus === opt.value ? 'border-purple-500 bg-purple-50' : 'border-border hover:border-purple-200'}`}>
                    <input type="radio" name="domain" value={opt.value} checked={form.domainStatus === opt.value} onChange={() => setForm(p => ({ ...p, domainStatus: opt.value }))} className="sr-only" />
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${form.domainStatus === opt.value ? 'border-purple-600 bg-purple-600' : 'border-border'}`}>
                      {form.domainStatus === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              {form.domainStatus === 'deja_proprietaire' && (
                <input value={form.domainName} onChange={e => setForm(p => ({ ...p, domainName: e.target.value }))}
                  placeholder="ex: monentreprise.com"
                  className="mt-3 w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-purple-500" />
              )}
            </div>
          )}

          {/* Étape 2 : Options */}
          {step === 2 && (
            <div>
              <h3 className="font-bold text-foreground mb-1">Options supplémentaires</h3>
              <p className="text-sm text-muted-foreground mb-4">Améliorez votre site avec des services additionnels.</p>
              <div className="space-y-3">
                {OPTIONS.map(opt => (
                  <label key={opt.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.options.includes(opt.id) ? 'border-purple-500 bg-purple-50' : 'border-border hover:border-purple-200'}`}>
                    <div className={`w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all ${form.options.includes(opt.id) ? 'border-purple-600 bg-purple-600' : 'border-border'}`}
                      onClick={() => toggleOption(opt.id)}>
                      {form.options.includes(opt.id) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-foreground">{opt.label}</p>
                        <span className="text-sm font-bold text-purple-600">+{opt.prix} MAD{opt.recurrent ? '/mois' : ''}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {selectedOptions.length > 0 && (
                <div className="mt-4 p-3 bg-muted rounded-xl text-xs">
                  <p className="font-semibold text-foreground mb-1">Options sélectionnées :</p>
                  {selectedOptions.filter(o => !o.recurrent).length > 0 && (
                    <p className="text-muted-foreground">En une fois : +{selectedOptions.filter(o => !o.recurrent).reduce((s, o) => s + o.prix, 0)} MAD</p>
                  )}
                  {selectedOptions.filter(o => o.recurrent).length > 0 && (
                    <p className="text-muted-foreground">Mensuel : +{selectedOptions.filter(o => o.recurrent).reduce((s, o) => s + o.prix, 0)} MAD/mois</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Étape 3 : Infos contact */}
          {step === 3 && (
            <div>
              <h3 className="font-bold text-foreground mb-4">Vos coordonnées</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Nom complet *</label>
                    <input value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))}
                      placeholder="Votre nom"
                      className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Téléphone *</label>
                    <input type="tel" value={form.tel} onChange={e => setForm(p => ({ ...p, tel: e.target.value }))}
                      placeholder="+212 6XX XXX XXX"
                      className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="votre@email.com"
                    className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Instructions particulières (optionnel)</label>
                  <textarea value={form.brief} onChange={e => setForm(p => ({ ...p, brief: e.target.value }))} rows={3}
                    placeholder="Couleurs souhaitées, logo existant, contenu à intégrer..."
                    className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
                </div>
              </div>
            </div>
          )}

          {/* Étape 4 : Récapitulatif */}
          {step === 4 && (
            <div>
              <h3 className="font-bold text-foreground mb-4">Récapitulatif de votre commande</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Template</span>
                  <span className="font-semibold">{template.nom}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Domaine</span>
                  <span className="font-semibold">{form.domainStatus === 'a_acheter' ? 'À définir avec vous' : form.domainName || 'Non renseigné'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Délai livraison</span>
                  <span className="font-semibold">~{template.delai_jours} jours ouvrables</span>
                </div>
                {selectedOptions.length > 0 && (
                  <div className="py-2 border-b border-border">
                    <p className="text-muted-foreground mb-2">Options</p>
                    {selectedOptions.map(o => (
                      <div key={o.id} className="flex justify-between text-xs ml-2">
                        <span>{o.label}</span>
                        <span className="font-semibold">+{o.prix} MAD{o.recurrent ? '/mois' : ''}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-purple-800">Création (paiement unique)</span>
                  <span className="font-extrabold text-purple-600 text-lg">{totalCreation} MAD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-800">Hébergement + services</span>
                  <span className="font-bold text-purple-600">{totalMensuel} MAD/mois</span>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground bg-muted p-3 rounded-xl">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-purple-500" />
                Aucun paiement maintenant. Notre équipe vous contactera sous 24h pour confirmer et finaliser les détails.
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 p-5 pt-0 sticky bottom-0 bg-card border-t border-border">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1 rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />Précédent
            </Button>
          )}
          {step < 4 ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
              className="flex-1 h-11 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl">
              Suivant <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}
              className="flex-1 h-11 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Envoi...</> : <><Zap className="w-4 h-4 mr-2" />Confirmer ma commande</>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Composant : Assistant IA ──────────────────────────────────────────────────
const AIAssistant = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Bonjour ! 👋 Je suis l\'assistant IWS. Posez-moi vos questions sur la création de votre site WordPress — prix, délais, fonctionnalités...' }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(p => [...p, { role: 'user', text: userMsg }]);
    setTyping(true);
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
    const response = getAIResponse(userMsg);
    setMessages(p => [...p, { role: 'bot', text: response }]);
    setTyping(false);
  };

  const renderText = (text) => {
    return text.split('**').map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {open && (
        <div className="mb-3 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ height: 420 }}>
          <div className="flex items-center gap-3 p-4 bg-purple-600 text-white">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-sm">Assistant IWS</p>
              <p className="text-xs text-white/70">Répond en quelques secondes</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'bot' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                  {msg.role === 'bot' ? <Bot className="w-3.5 h-3.5 text-purple-600" /> : <UserIcon className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${msg.role === 'bot' ? 'bg-muted text-foreground' : 'bg-purple-600 text-white'}`}>
                  {renderText(msg.text)}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center"><Bot className="w-3.5 h-3.5 text-purple-600" /></div>
                <div className="bg-muted px-3 py-2 rounded-xl flex items-center gap-1">
                  {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Posez votre question..."
                className="flex-1 border border-input rounded-xl px-3 py-2 text-xs bg-background focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <button onClick={sendMessage} className="p-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex gap-2 mt-2">
              {['Prix ?', 'Délais ?', 'Domaine ?'].map(q => (
                <button key={q} onClick={() => { setInput(q); }}
                  className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded-full text-muted-foreground transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setOpen(o => !o)}
        className="w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-xl shadow-purple-600/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95">
        {open ? <X className="w-5 h-5" /> : <MessageSquare className="w-6 h-6" />}
      </button>
      {!open && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card animate-pulse" />
      )}
    </div>
  );
};

// ── Confirmation ──────────────────────────────────────────────────────────────
const ConfirmationScreen = ({ data, onReset }) => (
  <div className="min-h-screen flex items-center justify-center px-4 bg-background">
    <div className="max-w-lg w-full text-center">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
      </div>
      <h1 className="text-3xl font-extrabold text-primary mb-2">Commande reçue !</h1>
      <p className="text-muted-foreground mb-8">Notre équipe vous contacte sous <strong>24h ouvrables</strong> pour démarrer votre site.</p>

      <div className="bg-card border border-border rounded-2xl p-6 mb-6 text-left space-y-3 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">Template</span><span className="font-bold">{data.template.nom}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Création</span><span className="font-bold text-purple-600">{data.totalCreation} MAD</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Mensuel</span><span className="font-bold">{data.totalMensuel} MAD/mois</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Contact</span><span className="font-bold">{data.form.tel}</span></div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-6 text-sm text-purple-800">
        <p className="font-bold mb-1">📱 Prochaines étapes :</p>
        <ol className="space-y-1 text-left list-decimal list-inside">
          <li>Notre équipe vous appelle pour confirmer</li>
          <li>Choix du nom de domaine (si nécessaire)</li>
          <li>Installation WordPress + template ({data.template.delai_jours} jours)</li>
          <li>Formation et remise des accès</li>
        </ol>
      </div>

      <div className="flex gap-3">
        <Button onClick={onReset} variant="outline" className="flex-1 rounded-xl">
          <ArrowLeft className="w-4 h-4 mr-2" />Voir d'autres templates
        </Button>
        <Button asChild className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
          <Link to="/"><Globe className="w-4 h-4 mr-2" />Accueil</Link>
        </Button>
      </div>
    </div>
  </div>
);

// ── Page principale ───────────────────────────────────────────────────────────
const WordPressBuilderPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [templates, setTemplates] = useState(STATIC_TEMPLATES);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [previewTpl, setPreviewTpl] = useState(null);
  const [orderTpl, setOrderTpl] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    pb.collection('wp_templates').getFullList({ filter: 'actif=true', sort: 'popular,prix_base', requestKey: null })
      .then(data => { if (data.length > 0) setTemplates(data); })
      .catch(() => {});
  }, []);

  const filtered = templates.filter(t => {
    const matchCat = category === 'all' || t.categorie === category;
    const matchSearch = !search || t.nom.toLowerCase().includes(search.toLowerCase()) || t.categorie.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (confirmation) return <ConfirmationScreen data={confirmation} onReset={() => setConfirmation(null)} />;

  return (
    <>
      <Helmet>
        <title>Créer un site WordPress — IWS Web Agency</title>
        <meta name="description" content="Choisissez un template WordPress professionnel et lancez votre site en quelques jours. Hébergement, SSL et support inclus." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 pt-20">

          {/* ── Hero ─────────────────────────────────────────────── */}
          <section className="relative py-20 bg-gradient-to-br from-primary via-primary to-purple-900 overflow-hidden">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, #7c3aed 0%, transparent 60%), radial-gradient(circle at 75% 50%, #3b82f6 0%, transparent 60%)' }} />
            <div className="relative max-w-4xl mx-auto px-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 font-semibold text-sm mb-6 border border-white/20 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                WordPress Builder — IWS Web Agency
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-5 leading-tight tracking-tight">
                Votre site WordPress<br />
                <span className="text-accent">prêt en quelques jours</span>
              </h1>
              <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto leading-relaxed">
                Choisissez un template professionnel, personnalisez-le et lancez votre site. Hébergement, SSL et support inclus.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/70">
                {[['⚡', '2-6 jours'], ['🔒', 'SSL inclus'], ['📱', '100% responsive'], ['🎨', `${templates.length} templates`]].map(([icon, label]) => (
                  <span key={label} className="flex items-center gap-1.5">{icon} {label}</span>
                ))}
              </div>
            </div>
          </section>

          {/* ── Galerie templates ─────────────────────────────── */}
          <section className="py-16 bg-muted/30">
            <div className="max-w-7xl mx-auto px-6">

              {/* Filtres */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher un template..."
                    className="w-full pl-9 pr-3 py-2.5 border border-input rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    return (
                      <button key={cat.id} onClick={() => setCategory(cat.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          category === cat.id ? 'bg-purple-600 text-white border-purple-600' : 'bg-background text-muted-foreground border-border hover:border-purple-300'
                        }`}>
                        <Icon className="w-3.5 h-3.5" />{cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-6">{filtered.length} template{filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''}</p>

              {/* Grille */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map(tpl => (
                  <TemplateCard key={tpl.id} tpl={tpl} onPreview={setPreviewTpl} onSelect={setOrderTpl} />
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                  <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>Aucun template trouvé pour "{search}"</p>
                </div>
              )}
            </div>
          </section>

          {/* ── Pourquoi WordPress IWS ──────────────────────── */}
          <section className="py-20 bg-background">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-14">
                <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-4">Tout inclus dans votre WordPress</h2>
                <div className="w-20 h-1.5 bg-accent mx-auto rounded-full" />
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: Zap,       title: 'Installation express',     desc: 'WordPress configuré, thème appliqué, plugins installés. Vous recevez vos accès admin dès la livraison.',     color: 'text-yellow-500 bg-yellow-50' },
                  { icon: Shield,    title: 'Sécurité & performance',   desc: 'SSL gratuit, sauvegardes quotidiennes, plugin sécurité Wordfence, cache optimisé pour des chargements rapides.', color: 'text-green-500 bg-green-50' },
                  { icon: Globe,     title: 'Domaine & hébergement',    desc: 'Hébergement SSD haute performance chez Hostinger. Domaine .com ou .ma disponible. Migration gratuite.',        color: 'text-blue-500 bg-blue-50' },
                  { icon: Monitor,   title: 'Responsive garanti',       desc: 'Chaque template est testé sur mobile, tablette et ordinateur. Score Google PageSpeed > 85 garanti.',            color: 'text-purple-500 bg-purple-50' },
                  { icon: Star,      title: 'Formation incluse',        desc: 'Session de formation de 30 min pour gérer votre site vous-même : ajouter des pages, modifier du contenu.',      color: 'text-orange-500 bg-orange-50' },
                  { icon: Clock,     title: 'Support réactif',          desc: 'Support WhatsApp & email pendant 30 jours après livraison. Abonnement maintenance disponible au-delà.',         color: 'text-indigo-500 bg-indigo-50' },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
                      <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ── CTA ──────────────────────────────────────────── */}
          <section className="py-16 bg-gradient-to-br from-purple-900 via-primary to-indigo-900 text-white text-center">
            <div className="max-w-2xl mx-auto px-6">
              <div className="text-5xl mb-4">🚀</div>
              <h2 className="text-3xl font-extrabold mb-3">Prêt à démarrer ?</h2>
              <p className="text-slate-300 mb-8">Choisissez votre template ci-dessus ou contactez-nous pour un conseil personnalisé.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://wa.me/212XXXXXXXXX" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 rounded-xl w-full sm:w-auto">
                    <Phone className="w-4 h-4 mr-2" />WhatsApp
                  </Button>
                </a>
                <a href="mailto:contact@iws.ma">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 rounded-xl w-full sm:w-auto">
                    <Mail className="w-4 h-4 mr-2" />Nous écrire
                  </Button>
                </a>
              </div>
            </div>
          </section>

        </main>

        <Footer />
      </div>

      {/* Modals */}
      {previewTpl && <PreviewModal tpl={previewTpl} onClose={() => setPreviewTpl(null)} onSelect={(t) => { setPreviewTpl(null); setOrderTpl(t); }} />}
      {orderTpl && (
        <OrderWizard
          template={orderTpl}
          onClose={() => setOrderTpl(null)}
          onSuccess={(data) => { setOrderTpl(null); setConfirmation(data); }}
          currentUser={currentUser}
          isAuthenticated={isAuthenticated}
        />
      )}

      {/* Assistant IA flottant */}
      <AIAssistant />
    </>
  );
};

export default WordPressBuilderPage;
