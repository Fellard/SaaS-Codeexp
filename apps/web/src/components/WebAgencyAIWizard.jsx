import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles, Loader2, ChevronRight, Globe, LayoutDashboard,
  Palette, FileText, DollarSign, Clock, CheckCircle2, RefreshCw,
  Lightbulb, Code2, Layers, ArrowRight, Send,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ── Secteurs prédéfinis ───────────────────────────────────────────────────────
const SECTEURS = [
  { value: 'restaurant',    label: '🍽️ Restaurant / Café'       },
  { value: 'commerce',      label: '🛍️ Boutique / Commerce'      },
  { value: 'médical',       label: '⚕️ Cabinet Médical'          },
  { value: 'immobilier',    label: '🏠 Immobilier'               },
  { value: 'education',     label: '🎓 École / Formation'        },
  { value: 'artisan',       label: '🔨 Artisan / BTP'            },
  { value: 'beaute',        label: '💄 Salon de Beauté'          },
  { value: 'sport',         label: '⚽ Sport / Fitness'          },
  { value: 'transport',     label: '🚗 Transport / Logistique'   },
  { value: 'tech',          label: '💻 Tech / Startup'           },
  { value: 'association',   label: '🤝 Association / ONG'        },
  { value: 'autre',         label: '✨ Autre'                    },
];

const BUDGETS = [
  { value: '1500-2500 MAD',   label: '1 500 – 2 500 MAD',  desc: 'Site simple'    },
  { value: '2500-5000 MAD',   label: '2 500 – 5 000 MAD',  desc: 'Site complet'   },
  { value: '5000-10000 MAD',  label: '5 000 – 10 000 MAD', desc: 'Site avancé'    },
  { value: '+10000 MAD',      label: '+ 10 000 MAD',       desc: 'Projet sur mesure' },
];

// ── Composant principal ───────────────────────────────────────────────────────
const WebAgencyAIWizard = ({ onProposalReady }) => {
  const [step, setStep]               = useState('intro');   // intro | form | loading | result
  const [secteur, setSecteur]         = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget]           = useState('');
  const [preferences, setPreferences] = useState('');
  const [proposal, setProposal]       = useState(null);
  const [error, setError]             = useState('');

  // ── Appel API ─────────────────────────────────────────────────────
  const generateProposal = async () => {
    if (!secteur) { setError('Veuillez choisir votre secteur.'); return; }
    setError('');
    setStep('loading');

    try {
      const res = await fetch(`${API_URL}/web-agency/propose-site`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ secteur, description, budget, preferences }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Erreur serveur');
      setProposal(data.proposal);
      setStep('result');
      onProposalReady?.(data.proposal);
    } catch (e) {
      setError('Impossible de générer la proposition. Réessayez dans un instant.');
      setStep('form');
    }
  };

  const reset = () => {
    setStep('intro'); setSecteur(''); setDescription('');
    setBudget(''); setPreferences(''); setProposal(null); setError('');
  };

  // ════════════════════════════════════════════════════════════════
  // STEP : INTRO
  // ════════════════════════════════════════════════════════════════
  if (step === 'intro') return (
    <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-purple-500/10 border border-primary/20 rounded-3xl p-8 text-center space-y-5">
      <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary/30">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <div>
        <h3 className="text-2xl font-black text-foreground">Proposition de site par IA</h3>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Décrivez votre activité en quelques mots — notre assistant IA génère instantanément
          une proposition de site personnalisée avec structure, design et contenu.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3 text-sm">
        {['Structure de pages','Palette de couleurs','Contenu rédigé','Prix estimé','Délai de livraison'].map(f => (
          <span key={f} className="flex items-center gap-1.5 bg-card border border-border px-3 py-1.5 rounded-full text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {f}
          </span>
        ))}
      </div>
      <Button
        onClick={() => setStep('form')}
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-3 rounded-2xl gap-2 shadow-lg shadow-primary/20 text-base"
      >
        <Sparkles className="w-4 h-4" /> Générer ma proposition gratuite
      </Button>
      <p className="text-xs text-muted-foreground">✨ Gratuit · Instantané · Sans engagement</p>
    </div>
  );

  // ════════════════════════════════════════════════════════════════
  // STEP : FORM
  // ════════════════════════════════════════════════════════════════
  if (step === 'form') return (
    <div className="bg-card border border-border rounded-3xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-black text-foreground">Décrivez votre projet</h3>
          <p className="text-xs text-muted-foreground">30 secondes suffisent pour obtenir votre proposition</p>
        </div>
      </div>

      {/* Secteur */}
      <div>
        <label className="text-sm font-bold text-foreground mb-2 block">
          Votre secteur d'activité <span className="text-destructive">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SECTEURS.map(s => (
            <button
              key={s.value}
              onClick={() => setSecteur(s.value)}
              className={`text-left px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                secteur === s.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-card hover:border-primary/40 text-foreground'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-bold text-foreground mb-2 block">
          Décrivez votre activité <span className="text-muted-foreground font-normal">(optionnel)</span>
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Ex : Je tiens un restaurant marocain traditionnel à Laâyoune, spécialisé dans les tajines et couscous. Je veux attirer des touristes et des locaux..."
          className="w-full h-24 px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      {/* Budget */}
      <div>
        <label className="text-sm font-bold text-foreground mb-2 block">
          Budget indicatif <span className="text-muted-foreground font-normal">(optionnel)</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {BUDGETS.map(b => (
            <button
              key={b.value}
              onClick={() => setBudget(b.value)}
              className={`text-left px-3 py-2.5 rounded-xl border-2 text-sm transition-all ${
                budget === b.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              <p className={`font-bold ${budget === b.value ? 'text-primary' : 'text-foreground'}`}>{b.label}</p>
              <p className="text-xs text-muted-foreground">{b.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Préférences */}
      <div>
        <label className="text-sm font-bold text-foreground mb-2 block">
          Besoins spéciaux <span className="text-muted-foreground font-normal">(optionnel)</span>
        </label>
        <input
          type="text"
          value={preferences}
          onChange={e => setPreferences(e.target.value)}
          placeholder="Ex : Je veux des couleurs chaleureuses, un formulaire de réservation en ligne..."
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-4 py-2.5 rounded-xl">{error}</p>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={reset} className="rounded-xl">
          Annuler
        </Button>
        <Button
          onClick={generateProposal}
          disabled={!secteur}
          className="flex-1 bg-primary hover:bg-primary/90 font-bold rounded-xl gap-2 h-12"
        >
          <Send className="w-4 h-4" /> Générer ma proposition IA
        </Button>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════
  // STEP : LOADING
  // ════════════════════════════════════════════════════════════════
  if (step === 'loading') return (
    <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-5">
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
      <div>
        <h3 className="font-black text-foreground text-lg">Génération en cours…</h3>
        <p className="text-muted-foreground text-sm mt-1">Notre IA analyse votre projet et prépare votre proposition personnalisée</p>
      </div>
      <div className="flex justify-center gap-2 flex-wrap text-xs text-muted-foreground">
        {['Analyse du secteur','Sélection du template','Génération du contenu','Calcul du prix'].map((s, i) => (
          <span key={i} className="flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" /> {s}
          </span>
        ))}
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════
  // STEP : RESULT
  // ════════════════════════════════════════════════════════════════
  if (step === 'result' && proposal) return (
    <div className="space-y-5">
      {/* Header résultat */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-black text-foreground">Proposition générée !</h3>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">{proposal.type_label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{proposal.resume}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Pages suggérées */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <LayoutDashboard className="w-4 h-4 text-primary" />
            <h4 className="font-bold text-sm text-foreground">Structure des pages</h4>
          </div>
          <ul className="space-y-1.5">
            {proposal.pages?.map((page, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                {page}
              </li>
            ))}
          </ul>
        </div>

        {/* Palette */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4 text-primary" />
            <h4 className="font-bold text-sm text-foreground">Palette de couleurs</h4>
          </div>
          <div className="flex gap-3 items-center mb-2">
            <div className="w-10 h-10 rounded-xl shadow-sm flex-shrink-0" style={{ background: proposal.palette_primary }} />
            <div className="w-10 h-10 rounded-xl shadow-sm flex-shrink-0" style={{ background: proposal.palette_secondary }} />
            <div className="w-10 h-10 rounded-xl shadow-sm flex-shrink-0 border border-border" style={{ background: '#F8FAFC' }} />
          </div>
          <p className="text-xs text-muted-foreground">{proposal.palette_desc}</p>
        </div>

        {/* Contenu page d'accueil */}
        {proposal.contenu_accueil?.titre && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-primary" />
              <h4 className="font-bold text-sm text-foreground">Contenu page d'accueil</h4>
            </div>
            <p className="font-bold text-foreground text-sm">{proposal.contenu_accueil.titre}</p>
            <p className="text-xs text-muted-foreground mt-1">{proposal.contenu_accueil.sous_titre}</p>
            {proposal.contenu_accueil.cta && (
              <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                Bouton : {proposal.contenu_accueil.cta}
              </span>
            )}
          </div>
        )}

        {/* Fonctionnalités */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-primary" />
            <h4 className="font-bold text-sm text-foreground">Fonctionnalités incluses</h4>
          </div>
          <ul className="space-y-1.5">
            {proposal.fonctionnalites?.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Technologies */}
      {proposal.technologies?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {proposal.technologies.map((t, i) => (
            <Badge key={i} variant="outline" className="gap-1 text-xs">
              <Code2 className="w-3 h-3" /> {t}
            </Badge>
          ))}
        </div>
      )}

      {/* Prix & Délai */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
          <DollarSign className="w-6 h-6 text-primary mx-auto mb-1" />
          <p className="text-2xl font-black text-primary">{proposal.prix_estime?.toLocaleString('fr-FR')} MAD</p>
          <p className="text-xs text-muted-foreground mt-0.5">Prix estimé</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-4 text-center">
          <Clock className="w-6 h-6 text-orange-500 mx-auto mb-1" />
          <p className="text-2xl font-black text-orange-600">{proposal.delai_jours} jours</p>
          <p className="text-xs text-muted-foreground mt-0.5">Délai de livraison</p>
        </div>
      </div>

      {/* Pourquoi ce choix */}
      {proposal.pourquoi && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
          <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">{proposal.pourquoi}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <Button variant="outline" onClick={reset} className="rounded-xl gap-2">
          <RefreshCw className="w-4 h-4" /> Nouvelle proposition
        </Button>
        <a href="/agence/commander" className="flex-1">
          <Button className="w-full bg-primary hover:bg-primary/90 font-bold rounded-xl gap-2 h-12">
            Commander ce site <ArrowRight className="w-4 h-4" />
          </Button>
        </a>
      </div>
    </div>
  );

  return null;
};

export default WebAgencyAIWizard;
