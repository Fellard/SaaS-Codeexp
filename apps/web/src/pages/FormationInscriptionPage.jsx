
/**
 * FormationInscriptionPage
 * Parcours complet :
 *  Étape 1 — Choix du programme (Langues / Informatique / Programmation)
 *  Étape 2 — Choix du cours + niveau → prix auto
 *  Étape 3 — Formulaire d'inscription (ou connexion si déjà inscrit)
 *  → Redirection vers /dashboard avec statut "En attente de paiement"
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Languages, Monitor, Code2, ArrowLeft, ArrowRight, Check,
  BookOpen, Clock, Star, Eye, EyeOff, GraduationCap, CreditCard,
  User, Lock, CheckCircle2,
} from 'lucide-react';

// ── Programme config ─────────────────────────────────────────────
const PROGRAMMES = {
  langues: {
    label: 'Langues',
    icon: Languages,
    gradient: 'from-blue-600 to-sky-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    ring: 'ring-blue-500',
    subtitle: 'Français · Anglais · Arabe · Espagnol',
    desc: 'Maîtrisez une nouvelle langue avec nos formateurs certifiés. Niveaux A1 à C2.',
    defaultCours: ['Français', 'Anglais', 'Arabe Marocain', 'Espagnol', 'Anglais des affaires'],
    niveaux: [
      { value: 'A1', label: 'A1 — Débutant' },
      { value: 'A2', label: 'A2 — Élémentaire' },
      { value: 'B1', label: 'B1 — Intermédiaire' },
      { value: 'B2', label: 'B2 — Intermédiaire avancé' },
      { value: 'C1', label: 'C1 — Avancé' },
      { value: 'C2', label: 'C2 — Maîtrise' },
    ],
    categories: ['langue', 'langues', 'français', 'anglais', 'arabe', 'espagnol'],
  },
  informatique: {
    label: 'Informatique',
    icon: Monitor,
    gradient: 'from-green-600 to-emerald-500',
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
    ring: 'ring-green-500',
    subtitle: 'Bureautique · Réseaux · Maintenance · Graphisme',
    desc: 'Bureautique, maintenance matérielle, réseaux informatiques et graphisme.',
    defaultCours: ['Bureautique (Word / Excel)', 'Maintenance informatique', 'Réseaux & Infrastructure', 'Graphisme (Photoshop / Illustrator)', 'Administration Windows'],
    niveaux: [
      { value: 'Débutant', label: 'Débutant' },
      { value: 'Intermédiaire', label: 'Intermédiaire' },
      { value: 'Avancé', label: 'Avancé' },
    ],
    categories: ['informatique', 'bureautique', 'maintenance', 'réseau', 'graphisme'],
  },
  programmation: {
    label: 'Programmation',
    icon: Code2,
    gradient: 'from-purple-600 to-indigo-500',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    ring: 'ring-purple-500',
    subtitle: 'Web · Mobile · Python · JavaScript · React',
    desc: 'Développez des applications web et mobiles modernes avec les technologies actuelles.',
    defaultCours: ['HTML / CSS', 'JavaScript', 'React.js', 'Python', 'Développement Mobile', 'Node.js / Express'],
    niveaux: [
      { value: 'Débutant', label: 'Débutant' },
      { value: 'Intermédiaire', label: 'Intermédiaire' },
      { value: 'Avancé', label: 'Avancé' },
    ],
    categories: ['programmation', 'développement', 'web', 'mobile', 'python', 'javascript'],
  },
};

// Default prices by programme
const DEFAULT_PRICES = {
  langues: { A1: 600, A2: 650, B1: 700, B2: 750, C1: 800, C2: 850 },
  informatique: { Débutant: 700, Intermédiaire: 800, Avancé: 950 },
  programmation: { Débutant: 800, Intermédiaire: 950, Avancé: 1100 },
};

// ── Step indicator ───────────────────────────────────────────────
const StepBar = ({ step }) => {
  const steps = [
    { num: 1, label: 'Programme' },
    { num: 2, label: 'Cours & Niveau' },
    { num: 3, label: 'Inscription' },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((s, i) => (
        <React.Fragment key={s.num}>
          <div className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
              step > s.num
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : step === s.num
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'bg-muted border-border text-muted-foreground'
            }`}>
              {step > s.num ? <Check className="w-4 h-4" /> : s.num}
            </div>
            <span className={`text-xs mt-1.5 font-medium ${step >= s.num ? 'text-foreground' : 'text-muted-foreground'}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 w-16 mx-1 mb-4 rounded-full transition-all ${step > s.num + 0 ? 'bg-emerald-500' : 'bg-border'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ── Main page ────────────────────────────────────────────────────
const FormationInscriptionPage = () => {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const { currentUser, signup } = useAuth();

  // Form state
  const [step, setStep]               = useState(1);
  const [programme, setProgramme]     = useState(searchParams.get('programme') || '');
  const [cours, setCours]             = useState('');
  const [niveau, setNiveau]           = useState('');
  const [pbCourses, setPbCourses]     = useState([]);  // from PocketBase
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [autoPrice, setAutoPrice]     = useState(null);
  const [autoDuration, setAutoDuration] = useState('');

  // Step 3 form
  const [prenom, setPrenom]           = useState('');
  const [nom, setNom]                 = useState('');
  const [email, setEmail]             = useState('');
  const [phone, setPhone]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);

  const progCfg = programme ? PROGRAMMES[programme] : null;

  // Auto-advance step 1 if programme pre-selected from URL
  useEffect(() => {
    if (searchParams.get('programme') && PROGRAMMES[searchParams.get('programme')]) {
      setStep(2);
    }
  }, []);

  // If user already logged in, skip step 3 directly to save formation info
  const isLoggedIn = !!currentUser;

  // Fetch courses from PocketBase for selected programme
  useEffect(() => {
    if (!programme) return;
    const fetchCourses = async () => {
      try {
        const all = await pb.collection('courses').getFullList({ requestKey: null });
        const cfg = PROGRAMMES[programme];
        const filtered = all.filter(c => {
          const cat = (c.categorie || c.category || c.section || '').toLowerCase();
          return cfg.categories.some(k => cat.includes(k));
        });
        setPbCourses(filtered);
      } catch { /* ignore */ }
    };
    fetchCourses();
  }, [programme]);

  // Auto-price from PB course or default
  useEffect(() => {
    if (!programme || !niveau) { setAutoPrice(null); return; }
    // Try PB course first
    const matched = pbCourses.find(c =>
      (c.titre || c.title || '').toLowerCase().includes(cours.toLowerCase()) && cours.length > 0
    );
    if (matched) {
      setSelectedCourseId(matched.id);
      setAutoPrice(matched.prix || matched.price || DEFAULT_PRICES[programme]?.[niveau] || null);
      setAutoDuration(matched.duree || matched.duration || '');
    } else {
      setSelectedCourseId(null);
      setAutoPrice(DEFAULT_PRICES[programme]?.[niveau] || null);
      setAutoDuration('');
    }
  }, [cours, niveau, programme, pbCourses]);

  // ── Step 1: Programme ────────────────────────────────────────
  const handleSelectProgramme = (key) => {
    setProgramme(key);
    setCours('');
    setNiveau('');
    setPbCourses([]);
    setStep(2);
  };

  // ── Step 2: Cours + Niveau ───────────────────────────────────
  const handleStep2Next = () => {
    if (!cours || !niveau) {
      toast.error('Veuillez choisir un cours et un niveau');
      return;
    }
    if (isLoggedIn) {
      // Save formation info directly to user profile and redirect
      handleSaveForExistingUser();
    } else {
      setStep(3);
    }
  };

  const handleSaveForExistingUser = async () => {
    setLoading(true);
    try {
      await pb.collection('users').update(currentUser.id, {
        section: programme,
        current_course: cours,
        Level: niveau,
      }, { requestKey: null });
      // Create order if price is known
      if (autoPrice && selectedCourseId) {
        try {
          await pb.collection('orders').create({
            user_id: currentUser.id,
            total_price: autoPrice,
            status: 'pending',
          }, { requestKey: null });
        } catch { /* not blocking */ }
      }
      toast.success('Formation enregistrée ! Rendez-vous sur votre tableau de bord.');
      navigate('/dashboard');
    } catch {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Register ─────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error('Les mots de passe ne correspondent pas'); return; }
    if (password.length < 8) { toast.error('Le mot de passe doit contenir au moins 8 caractères'); return; }

    setLoading(true);
    const fullName = `${prenom} ${nom}`.trim();
    try {
      // 1. Register via API
      const response = await apiServerClient.fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, email, password, role: 'etudiant' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur lors de l\'inscription');

      // 2. Auto-login
      try {
        await signup(email, password, fullName, 'etudiant');
      } catch {
        toast.success('Compte créé ! Connectez-vous pour accéder à votre formation.');
        navigate('/login');
        return;
      }

      // 3. Save formation fields to user profile
      try {
        const userId = pb.authStore.model?.id;
        if (userId) {
          await pb.collection('users').update(userId, {
            prenom, nom, phone,
            section: programme,
            current_course: cours,
            Level: niveau,
          }, { requestKey: null });
          // Create pending order
          if (autoPrice) {
            await pb.collection('orders').create({
              user_id: userId,
              total_price: autoPrice,
              status: 'pending',
            }, { requestKey: null });
          }
        }
      } catch { /* non-blocking */ }

      toast.success('Bienvenue ! Votre inscription a été enregistrée.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // ── Cours options ─────────────────────────────────────────────
  const coursOptions = progCfg
    ? [
        ...progCfg.defaultCours,
        ...pbCourses
          .map(c => c.titre || c.title)
          .filter(t => t && !progCfg.defaultCours.some(d => d.toLowerCase() === t.toLowerCase())),
      ]
    : [];

  return (
    <>
      <Helmet>
        <title>Inscription Formation - IWS LAAYOUNE</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-muted">
        <Header />

        <main className="flex-1 pt-24 pb-16">
          <div className="max-w-2xl mx-auto px-4">

            {/* Back */}
            <Link to="/formation" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Retour aux formations
            </Link>

            <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
              {/* Header */}
              <div className="bg-primary px-8 py-6">
                <div className="flex items-center gap-3 mb-1">
                  <GraduationCap className="w-6 h-6 text-accent" />
                  <h1 className="text-xl font-bold text-white">Inscription — Centre de Formation IWS</h1>
                </div>
                <p className="text-white/60 text-sm">Choisissez votre programme et démarrez votre parcours</p>
              </div>

              <div className="p-8">
                <StepBar step={step} />

                {/* ══ Étape 1 : Choix du programme ══════════════════ */}
                {step === 1 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-foreground text-center mb-6">Quel programme vous intéresse ?</h2>
                    {Object.entries(PROGRAMMES).map(([key, cfg]) => {
                      const Icon = cfg.icon;
                      return (
                        <button
                          key={key}
                          onClick={() => handleSelectProgramme(key)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-primary hover:shadow-md transition-all text-left group`}
                        >
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-foreground text-base">{cfg.label}</div>
                            <div className="text-sm text-muted-foreground">{cfg.subtitle}</div>
                            <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{cfg.desc}</div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* ══ Étape 2 : Cours + Niveau ══════════════════════ */}
                {step === 2 && progCfg && (
                  <div className="space-y-6">
                    {/* Back to step 1 */}
                    <button
                      onClick={() => { setStep(1); setProgramme(''); }}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" /> Changer de programme
                    </button>

                    {/* Programme badge */}
                    <div className={`flex items-center gap-3 p-4 rounded-xl ${progCfg.bg} border ${progCfg.border}`}>
                      {React.createElement(progCfg.icon, { className: 'w-6 h-6 text-foreground' })}
                      <div>
                        <p className="font-bold text-foreground">{progCfg.label}</p>
                        <p className="text-sm text-muted-foreground">{progCfg.subtitle}</p>
                      </div>
                    </div>

                    {/* Cours */}
                    <div className="space-y-2">
                      <Label className="font-semibold">Cours souhaité *</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {coursOptions.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setCours(c)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm text-left transition-all ${
                              cours === c
                                ? `border-primary bg-primary/5 font-semibold text-primary`
                                : 'border-border hover:border-primary/50 text-foreground'
                            }`}
                          >
                            <BookOpen className={`w-4 h-4 flex-shrink-0 ${cours === c ? 'text-primary' : 'text-muted-foreground'}`} />
                            {c}
                            {cours === c && <Check className="w-4 h-4 ml-auto text-primary" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Niveau */}
                    {cours && (
                      <div className="space-y-2">
                        <Label className="font-semibold">Niveau *</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {progCfg.niveaux.map(n => (
                            <button
                              key={n.value}
                              type="button"
                              onClick={() => setNiveau(n.value)}
                              className={`px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                                niveau === n.value
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-border hover:border-primary/50 text-foreground'
                              }`}
                            >
                              <Star className="w-3 h-3 inline mr-1 opacity-60" />
                              {n.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Auto price + duration */}
                    {cours && niveau && (
                      <div className={`rounded-xl ${progCfg.bg} border ${progCfg.border} p-4`}>
                        <div className="flex items-start justify-between flex-wrap gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-0.5">Formation sélectionnée</p>
                            <p className="font-bold text-foreground">{cours}</p>
                            <p className="text-sm text-muted-foreground">{niveau} · {progCfg.label}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground mb-0.5">Frais de formation</p>
                            {autoPrice ? (
                              <p className="text-2xl font-black text-primary">{autoPrice} <span className="text-sm font-normal">MAD</span></p>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">Prix à confirmer</p>
                            )}
                            {autoDuration && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-0.5">
                                <Clock className="w-3 h-3" /> {autoDuration} h
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleStep2Next}
                      disabled={!cours || !niveau || loading}
                      className="w-full bg-accent hover:bg-accent/90 text-primary font-bold h-12 rounded-xl"
                    >
                      {loading ? 'Enregistrement...' : isLoggedIn ? 'Confirmer ma formation' : 'Continuer'}
                      {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
                    </Button>

                    {isLoggedIn && (
                      <p className="text-xs text-center text-muted-foreground">
                        Connecté en tant que <strong>{currentUser?.prenom || currentUser?.name}</strong> — votre formation sera ajoutée à votre profil.
                      </p>
                    )}
                  </div>
                )}

                {/* ══ Étape 3 : Formulaire d'inscription ════════════ */}
                {step === 3 && (
                  <div>
                    <button
                      onClick={() => setStep(2)}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5"
                    >
                      <ArrowLeft className="w-4 h-4" /> Modifier ma formation
                    </button>

                    {/* Récap formation */}
                    {progCfg && (
                      <div className={`flex items-center gap-3 p-3 rounded-xl ${progCfg.bg} border ${progCfg.border} mb-6`}>
                        {React.createElement(progCfg.icon, { className: 'w-5 h-5 text-foreground' })}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{cours}</p>
                          <p className="text-xs text-muted-foreground">{progCfg.label} · {niveau}</p>
                        </div>
                        {autoPrice && (
                          <p className="font-bold text-primary shrink-0">{autoPrice} MAD</p>
                        )}
                      </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-4">
                      {/* Nom / Prénom */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="prenom">Prénom *</Label>
                          <Input
                            id="prenom" required value={prenom}
                            onChange={e => setPrenom(e.target.value)}
                            placeholder="Prénom"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="nom">Nom *</Label>
                          <Input
                            id="nom" required value={nom}
                            onChange={e => setNom(e.target.value)}
                            placeholder="Nom de famille"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <Label htmlFor="email">Adresse email *</Label>
                        <Input
                          id="email" type="email" required value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="vous@exemple.com"
                        />
                      </div>

                      {/* Téléphone */}
                      <div className="space-y-1.5">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone" value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="+212 6XX XXX XXX"
                        />
                      </div>

                      {/* Mot de passe */}
                      <div className="space-y-1.5">
                        <Label htmlFor="password">Mot de passe *</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Minimum 8 caractères"
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirmer mdp */}
                      <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                        <Input
                          id="confirmPassword"
                          type="password" required value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="Répétez votre mot de passe"
                          className={confirmPassword && confirmPassword !== password ? 'border-red-400' : ''}
                        />
                        {confirmPassword && confirmPassword !== password && (
                          <p className="text-xs text-red-500">Les mots de passe ne correspondent pas</p>
                        )}
                      </div>

                      {/* What happens next info */}
                      <div className="rounded-xl bg-muted/60 border border-border p-4 space-y-2 text-sm">
                        <p className="font-semibold text-foreground flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          Après inscription :
                        </p>
                        <ul className="space-y-1 text-muted-foreground pl-6">
                          <li>✓ Accès immédiat à votre tableau de bord</li>
                          <li>✓ Votre formation est réservée</li>
                          <li>✓ Effectuez le paiement pour déverrouiller les cours</li>
                          <li>✓ Reçu généré automatiquement après paiement</li>
                        </ul>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-accent hover:bg-accent/90 text-primary font-bold h-12 rounded-xl text-base"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            Création du compte...
                          </span>
                        ) : 'Créer mon compte et m\'inscrire'}
                      </Button>

                      <p className="text-xs text-center text-muted-foreground">
                        En créant un compte, vous acceptez nos{' '}
                        <Link to="/terms" className="text-accent hover:underline">conditions d'utilisation</Link>
                      </p>
                    </form>

                    <div className="text-center mt-4 text-sm text-muted-foreground">
                      Déjà inscrit ?{' '}
                      <Link to="/login" className="text-accent hover:underline font-medium">Se connecter</Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default FormationInscriptionPage;
