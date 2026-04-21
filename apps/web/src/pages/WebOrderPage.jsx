import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Globe, Monitor, Layers, Code2, Import, ArrowRight, ArrowLeft,
  CheckCircle2, Loader2, Phone, User, Mail, MessageSquare,
  ExternalLink, Info, Check,
} from 'lucide-react';

// ── Options ───────────────────────────────────────────────────────────────────
const SERVICE_CATS = [
  { value: 'vitrine',    label: 'Site vitrine',           desc: 'Présenter votre activité, vos services et vos contacts.', emoji: '🏢', prix: '1 500 MAD' },
  { value: 'ecommerce',  label: 'Boutique en ligne',      desc: 'Vendre vos produits sur internet avec paiement sécurisé.', emoji: '🛒', prix: '3 000 MAD' },
  { value: 'wordpress',  label: 'Blog / WordPress',       desc: 'Publier du contenu régulièrement, gérer un magazine.', emoji: '📝', prix: '2 000 MAD' },
  { value: 'sur_mesure', label: 'Application sur mesure', desc: 'Projet complexe avec fonctionnalités spécifiques.', emoji: '⚙️', prix: 'Sur devis' },
  { value: 'maintenance',label: 'Maintenance & refonte',  desc: 'Améliorer ou maintenir un site existant.', emoji: '🔧', prix: 'Sur devis' },
  { value: 'seo',        label: 'SEO & Marketing digital', desc: 'Améliorer le référencement et la visibilité.', emoji: '📈', prix: '1 000 MAD/mois' },
];

const TECH_OPTIONS = [
  {
    value: 'iws_builder',
    icon: Monitor,
    label: 'IWS Builder',
    desc: 'Notre constructeur propriétaire. Simple, rapide, hébergé chez nous.',
    tags: ['Recommandé', 'Drag & drop', 'Hébergement inclus'],
    gradient: 'from-blue-500 to-cyan-400',
    border: 'border-blue-300 bg-blue-50',
  },
  {
    value: 'wordpress',
    icon: Layers,
    label: 'WordPress',
    desc: 'Le CMS le plus populaire au monde. Idéal pour tous types de sites.',
    tags: ['Populaire', 'Flexible', 'SEO optimisé'],
    gradient: 'from-indigo-500 to-purple-500',
    border: 'border-indigo-300 bg-indigo-50',
  },
  {
    value: 'import',
    icon: Import,
    label: 'Importer mon projet',
    desc: 'J\'ai déjà un site ou un projet à migrer vers votre infrastructure.',
    tags: ['Migration', 'Zéro downtime', 'Tous frameworks'],
    gradient: 'from-orange-500 to-amber-400',
    border: 'border-orange-300 bg-orange-50',
  },
  {
    value: 'node',
    icon: Code2,
    label: 'Développement sur mesure',
    desc: 'React, Node.js, API REST... projet 100% personnalisé.',
    tags: ['Pro', 'Scalable', 'Code source fourni'],
    gradient: 'from-green-500 to-teal-400',
    border: 'border-green-300 bg-green-50',
  },
];

const DOMAIN_OPTIONS = [
  { value: 'a_acheter',        label: 'Je n\'ai pas encore de domaine',   desc: 'Nous vous aidons à en choisir un via Hostinger.', emoji: '🌍' },
  { value: 'deja_proprietaire', label: 'J\'ai déjà mon domaine',          desc: 'Vous renseignez votre domaine existant.', emoji: '✅' },
  { value: 'non_defini',       label: 'Je ne sais pas encore',            desc: 'On en discutera lors de la consultation.', emoji: '🤔' },
];

// ── Étape 1 : Service ─────────────────────────────────────────────────────────
const Step1Service = ({ dbServices, selected, onSelect }) => {
  const options = dbServices.length > 0
    ? dbServices.map(s => ({ value: s.id, label: s.nom, desc: s.description, emoji: '🌐', prix: `à partir de ${s.prix_base} MAD`, _isDb: true }))
    : SERVICE_CATS;

  return (
    <div>
      <h2 className="text-2xl font-extrabold text-primary mb-2">Quel type de site souhaitez-vous ?</h2>
      <p className="text-muted-foreground mb-8">Choisissez le service qui correspond le mieux à votre projet.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map(opt => (
          <label key={opt.value} className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
            selected === opt.value ? 'border-blue-500 bg-blue-50' : 'border-border bg-card hover:border-blue-200'
          }`}>
            <input type="radio" name="service" value={opt.value} checked={selected === opt.value}
              onChange={() => onSelect(opt.value)} className="sr-only" />
            <span className="text-3xl shrink-0">{opt.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                <p className="font-bold text-foreground">{opt.label}</p>
                {opt.prix && <span className="text-xs font-bold text-blue-600 whitespace-nowrap">{opt.prix}</span>}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{opt.desc}</p>
            </div>
            {selected === opt.value && <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />}
          </label>
        ))}
      </div>
    </div>
  );
};

// ── Étape 2 : Technologie ─────────────────────────────────────────────────────
const Step2Tech = ({ selected, onSelect, searchParamTech }) => {
  useEffect(() => {
    if (searchParamTech && !selected) onSelect(searchParamTech);
  }, [searchParamTech]);

  return (
    <div>
      <h2 className="text-2xl font-extrabold text-primary mb-2">Comment créer votre site ?</h2>
      <p className="text-muted-foreground mb-8">Choisissez la technologie. Notre équipe vous conseillera si vous hésitez.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TECH_OPTIONS.map(opt => {
          const Icon = opt.icon;
          return (
            <label key={opt.value} className={`flex flex-col gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
              selected === opt.value ? `border-2 ${opt.border}` : 'border-border bg-card hover:border-blue-200'
            }`}>
              <input type="radio" name="tech" value={opt.value} checked={selected === opt.value}
                onChange={() => onSelect(opt.value)} className="sr-only" />
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${opt.gradient} text-white shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-foreground">{opt.label}</p>
                    {selected === opt.value && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{opt.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {opt.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full font-medium">{tag}</span>
                ))}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

// ── Étape 3 : Domaine ─────────────────────────────────────────────────────────
const Step3Domain = ({ domainStatus, domainName, onStatusChange, onNameChange }) => (
  <div>
    <h2 className="text-2xl font-extrabold text-primary mb-2">Votre nom de domaine</h2>
    <p className="text-muted-foreground mb-8">Un domaine est l'adresse de votre site (ex: monentreprise.com).</p>

    <div className="space-y-3 mb-8">
      {DOMAIN_OPTIONS.map(opt => (
        <label key={opt.value} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
          domainStatus === opt.value ? 'border-blue-500 bg-blue-50' : 'border-border bg-card hover:border-blue-200'
        }`}>
          <input type="radio" name="domain_status" value={opt.value} checked={domainStatus === opt.value}
            onChange={() => onStatusChange(opt.value)} className="sr-only" />
          <span className="text-2xl">{opt.emoji}</span>
          <div className="flex-1">
            <p className="font-bold text-foreground">{opt.label}</p>
            <p className="text-sm text-muted-foreground">{opt.desc}</p>
          </div>
          {domainStatus === opt.value && <Check className="w-5 h-5 text-blue-600 shrink-0" />}
        </label>
      ))}
    </div>

    {domainStatus === 'deja_proprietaire' && (
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-2 block">Votre domaine actuel</label>
        <input value={domainName} onChange={e => onNameChange(e.target.value)}
          placeholder="ex: monentreprise.com"
          className="w-full border border-input rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
    )}

    {domainStatus === 'a_acheter' && (
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
        <p className="font-bold text-indigo-800 mb-2 flex items-center gap-2">
          <Globe className="w-4 h-4" />Réservez votre domaine dès maintenant
        </p>
        <p className="text-sm text-indigo-700 mb-4">
          Choisissez votre nom de domaine directement chez Hostinger, notre partenaire hébergeur.
          Nous l'intégrerons dans votre projet.
        </p>
        <div className="flex gap-3">
          <input value={domainName} onChange={e => onNameChange(e.target.value)}
            placeholder="ex: monentreprise.com"
            className="flex-1 border border-input rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <a href="https://hostinger.com/domaines" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-3 text-sm text-indigo-700 font-semibold hover:text-indigo-900">
          <ExternalLink className="w-3.5 h-3.5" />Chercher mon domaine sur Hostinger
        </a>
      </div>
    )}
  </div>
);

// ── Étape 4 : Infos contact + brief ──────────────────────────────────────────
const Step4Brief = ({ form, onChange, currentUser }) => (
  <div>
    <h2 className="text-2xl font-extrabold text-primary mb-2">Parlez-nous de votre projet</h2>
    <p className="text-muted-foreground mb-8">Ces informations nous permettront de vous contacter et de préparer un devis précis.</p>

    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1">
            <User className="w-3 h-3" />Nom complet *
          </label>
          <input value={form.nom} onChange={e => onChange('nom', e.target.value)}
            placeholder="Votre nom"
            className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1">
            <Phone className="w-3 h-3" />Téléphone / WhatsApp *
          </label>
          <input type="tel" value={form.tel} onChange={e => onChange('tel', e.target.value)}
            placeholder="+212 6XX XXX XXX"
            className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1">
          <Mail className="w-3 h-3" />Email *
        </label>
        <input type="email" value={form.email} onChange={e => onChange('email', e.target.value)}
          placeholder="votre@email.com"
          className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />Décrivez votre projet *
        </label>
        <textarea value={form.brief} onChange={e => onChange('brief', e.target.value)} rows={5}
          placeholder="Ex: Je gère un cabinet médical à Laayoune. Je souhaite un site vitrine avec mes horaires, une page de prise de rendez-vous et mes coordonnées. Couleurs : bleu et blanc."
          className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        <p className="text-xs text-muted-foreground mt-1">Plus vous êtes précis, plus vite nous pouvons vous faire un devis.</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          <strong>Aucun paiement requis maintenant.</strong> Nous vous contactons dans les 24h pour discuter de votre projet et vous envoyer un devis détaillé.
        </p>
      </div>
    </div>
  </div>
);

// ── Page principale ───────────────────────────────────────────────────────────
const STEPS = ['Service', 'Technologie', 'Domaine', 'Brief'];

const WebOrderPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const techParam = searchParams.get('tech');

  const [step, setStep] = useState(1);
  const [dbServices, setDbServices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Données du formulaire
  const [selectedService,  setSelectedService]  = useState('');
  const [selectedTech,     setSelectedTech]     = useState(techParam || '');
  const [domainStatus,     setDomainStatus]     = useState('non_defini');
  const [domainName,       setDomainName]       = useState('');
  const [contactForm,      setContactForm]      = useState({
    nom:   currentUser?.name || currentUser?.nom || '',
    tel:   '',
    email: currentUser?.email || '',
    brief: '',
  });

  useEffect(() => {
    pb.collection('web_services')
      .getFullList({ filter: 'actif=true', sort: 'prix_base', requestKey: null })
      .then(setDbServices)
      .catch(() => {});
  }, []);

  // Pré-remplir si param tech
  useEffect(() => {
    if (techParam) { setSelectedTech(techParam); setStep(1); }
  }, [techParam]);

  const updateContact = (key, val) => setContactForm(p => ({ ...p, [key]: val }));

  const canGoNext = () => {
    if (step === 1) return !!selectedService;
    if (step === 2) return !!selectedTech;
    if (step === 3) return true;
    if (step === 4) return contactForm.nom.trim() && contactForm.tel.trim() && contactForm.email.trim() && contactForm.brief.trim();
    return false;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Trouver le service sélectionné
      const dbSvc = dbServices.find(s => s.id === selectedService);
      const catSvc = !dbSvc ? SERVICE_CATS.find(s => s.value === selectedService) : null;
      const serviceNom = dbSvc?.nom || catSvc?.label || selectedService;

      const data = {
        service_id:    dbSvc?.id || null,
        service_nom:   serviceNom,
        tech_choice:   selectedTech,
        domain_status: domainStatus,
        domain_name:   domainName.trim(),
        client_nom:    contactForm.nom.trim(),
        client_tel:    contactForm.tel.trim(),
        brief:         contactForm.brief.trim(),
        statut:        'nouveau',
        montant:       dbSvc?.prix_base || 0,
      };

      if (isAuthenticated && currentUser?.id) {
        data.client_id = currentUser.id;
      }

      await pb.collection('web_orders').create(data, { requestKey: null });

      toast.success('🚀 Demande envoyée ! Nous vous contactons sous 24h.');
      navigate('/agence/confirmation', {
        state: {
          nom:     contactForm.nom,
          service: serviceNom,
          tech:    selectedTech,
          tel:     contactForm.tel,
          email:   contactForm.email,
        }
      });
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de l\'envoi. Réessayez ou contactez-nous directement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Commander un site web — IWS Laayoune</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 pt-24 pb-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">

            {/* Retour */}
            <Link to="/agence" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group text-sm">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Retour à l'agence web
            </Link>

            {/* En-tête */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm mb-4 border border-blue-200">
                <Globe className="w-4 h-4" />Commande de site web
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-3 tracking-tight">
                Démarrons votre projet
              </h1>
              <p className="text-muted-foreground">Devis gratuit · Réponse sous 24h · Sans engagement</p>
            </div>

            {/* Progression */}
            <div className="flex items-center gap-2 mb-10">
              {STEPS.map((label, i) => {
                const stepNum = i + 1;
                const isDone    = step > stepNum;
                const isActive  = step === stepNum;
                return (
                  <React.Fragment key={label}>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isDone ? 'bg-blue-600 text-white' :
                        isActive ? 'bg-blue-600 text-white ring-4 ring-blue-200' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {isDone ? <Check className="w-3.5 h-3.5" /> : stepNum}
                      </div>
                      <span className={`text-xs font-medium hidden sm:block ${isActive ? 'text-blue-600' : isDone ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 rounded-full transition-all ${step > stepNum ? 'bg-blue-600' : 'bg-muted'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Contenu étape */}
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
              {step === 1 && <Step1Service dbServices={dbServices} selected={selectedService} onSelect={setSelectedService} />}
              {step === 2 && <Step2Tech selected={selectedTech} onSelect={setSelectedTech} searchParamTech={techParam} />}
              {step === 3 && <Step3Domain domainStatus={domainStatus} domainName={domainName} onStatusChange={setDomainStatus} onNameChange={setDomainName} />}
              {step === 4 && <Step4Brief form={contactForm} onChange={updateContact} currentUser={currentUser} />}
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1 rounded-xl h-12">
                  <ArrowLeft className="w-4 h-4 mr-2" />Précédent
                </Button>
              )}
              {step < 4 ? (
                <Button
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canGoNext()}
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  Suivant <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !canGoNext()}
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50 text-base"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Envoi en cours...</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4 mr-2" />Envoyer ma demande</>
                  )}
                </Button>
              )}
            </div>

            {/* Récap latéral (visible uniquement étape 4) */}
            {step === 4 && (selectedService || selectedTech) && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm">
                <p className="font-bold text-blue-800 mb-2">Récapitulatif de votre demande :</p>
                <div className="space-y-1 text-blue-700">
                  {selectedService && <p>📦 Service : {dbServices.find(s => s.id === selectedService)?.nom || SERVICE_CATS.find(s => s.value === selectedService)?.label || selectedService}</p>}
                  {selectedTech && <p>⚙️ Technologie : {['iws_builder','wordpress','import','node'].includes(selectedTech) ? {iws_builder:'IWS Builder',wordpress:'WordPress',import:'Import projet',node:'Sur mesure'}[selectedTech] : selectedTech}</p>}
                  {domainName && <p>🌍 Domaine : {domainName}</p>}
                </div>
              </div>
            )}

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default WebOrderPage;
