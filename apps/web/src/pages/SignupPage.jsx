import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useTranslation } from '@/i18n/useTranslation.js';
import { useLanguage } from '@/hooks/useLanguage.jsx';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  User, Briefcase, Music, BookOpen, ShieldCheck, Eye, EyeOff,
  ArrowLeft, ArrowRight, Check, Languages, Monitor, Code2, Star,
} from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient';

// ── Role config ──────────────────────────────────────────────────
const ROLES = [
  { value: 'client',    label: 'Client',        icon: User,        desc: 'Accédez à nos services et produits' },
  { value: 'etudiant',  label: 'Étudiant',       icon: BookOpen,    desc: 'Suivez nos formations en ligne' },
  { value: 'musicien',  label: 'Musicien',       icon: Music,       desc: 'Réservez le studio et partagez votre musique' },
  { value: 'admin',     label: 'Administrateur', icon: ShieldCheck, desc: 'Accès soumis à validation par notre équipe' },
];

// ── Programme config (etudiant only) ────────────────────────────
const PROGRAMMES = {
  langues: {
    label: 'Langues',
    icon: Languages,
    gradient: 'from-blue-600 to-sky-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    subtitle: 'Français · Anglais · Arabe · Espagnol',
    defaultCours: ['Français', 'Anglais', 'Arabe', 'Espagnol'],
    categories: ['langue', 'langues', 'français', 'anglais', 'arabe', 'espagnol'],
    niveaux: [
      { value: 'A1', label: 'A1 — Débutant' },
      { value: 'A2', label: 'A2 — Élémentaire' },
      { value: 'B1', label: 'B1 — Intermédiaire' },
      { value: 'B2', label: 'B2 — Intermédiaire avancé' },
      { value: 'C1', label: 'C1 — Avancé' },
      { value: 'C2', label: 'C2 — Maîtrise' },
    ],
  },
  informatique: {
    label: 'Informatique',
    icon: Monitor,
    gradient: 'from-green-600 to-emerald-500',
    bg: 'bg-green-50',
    border: 'border-green-200',
    subtitle: 'Bureautique · Réseaux · Maintenance',
    defaultCours: ['Bureautique (Word / Excel)', 'Maintenance informatique', 'Réseaux & Infrastructure', 'Graphisme (Photoshop)', 'Administration Windows'],
    categories: ['informatique', 'bureautique', 'maintenance', 'réseau', 'graphisme'],
    niveaux: [
      { value: 'Débutant', label: 'Débutant' },
      { value: 'Intermédiaire', label: 'Intermédiaire' },
      { value: 'Avancé', label: 'Avancé' },
    ],
  },
  programmation: {
    label: 'Programmation',
    icon: Code2,
    gradient: 'from-purple-600 to-indigo-500',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    subtitle: 'Web · Mobile · Python · JavaScript',
    defaultCours: ['HTML / CSS', 'JavaScript', 'React.js', 'Python', 'Développement Mobile', 'Node.js / Express'],
    categories: ['programmation', 'développement', 'web', 'mobile', 'python', 'javascript'],
    niveaux: [
      { value: 'Débutant', label: 'Débutant' },
      { value: 'Intermédiaire', label: 'Intermédiaire' },
      { value: 'Avancé', label: 'Avancé' },
    ],
  },
};

// ── Main component ───────────────────────────────────────────────
const SignupPage = () => {
  const [step, setStep] = useState(1); // 1=rôle, 2=formulaire, 3=formation (étudiant)

  // Common fields
  const [role, setRole]                   = useState('');
  const [name, setName]                   = useState('');
  const [email, setEmail]                 = useState('');
  const [phone, setPhone]                 = useState('');
  const [company, setCompany]             = useState('');
  const [password, setPassword]           = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [loading, setLoading]             = useState(false);

  // Formation fields (étudiant only)
  const [programme, setProgramme]         = useState('');
  const [cours, setCours]                 = useState('');
  const [niveau, setNiveau]               = useState('');

  const { signup } = useAuth();
  const navigate   = useNavigate();
  const { t }      = useTranslation();
  const { language } = useLanguage();
  const isRtl      = language?.startsWith('ar');

  const selectedRole  = ROLES.find(r => r.value === role);
  const progCfg       = programme ? PROGRAMMES[programme] : null;

  const handleRoleSelect = (r) => { setRole(r); setStep(2); };

  // ── Final submit ─────────────────────────────────────────────
  const handleSubmitFinal = async () => {
    setLoading(true);
    try {
      if (role === 'admin') {
        const response = await apiServerClient.fetch('/auth/request-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, phone, company }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erreur lors de la demande');
        toast.success('Demande envoyée ! Vous recevrez un email après validation.');
        navigate('/pending-approval');
      } else {
        // Standard registration
        const response = await apiServerClient.fetch('/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erreur lors de l\'inscription');

        try {
          await signup(email, password, name, role);
        } catch {
          toast.success('Compte créé ! Connectez-vous maintenant.');
          navigate('/login');
          return;
        }

        // Pour les étudiants : sauvegarder le profil formation + inscrire aux 3 premiers cours
        if (role === 'etudiant' && programme) {
          try {
            const userId = pb.authStore.model?.id;
            if (userId) {
              await pb.collection('users').update(userId, {
                section: programme,
                current_course: cours || null,
                Level: niveau || null,
                phone: phone || null,
              }, { requestKey: null });

              // ── Auto-inscription aux 3 premiers cours ──────────────
              try {
                const cfg = PROGRAMMES[programme];
                const allCourses = await pb.collection('courses').getFullList({
                  sort: 'created',
                  requestKey: null,
                });
                const sectionCourses = allCourses.filter(c => {
                  const cat = (c.categorie || c.category || c.section || '').toLowerCase();
                  return cfg.categories.some(k => cat.includes(k));
                });
                const toEnroll = sectionCourses.slice(0, 3);
                for (const course of toEnroll) {
                  try {
                    await pb.collection('course_enrollments').create({
                      user_id:    userId,
                      course_id:  course.id,
                      progression: 0,
                      complete:   false,
                      start_date: new Date().toISOString(),
                    }, { requestKey: null });
                  } catch { /* déjà inscrit ou erreur non-bloquante */ }
                }
              } catch { /* non-bloquant */ }
            }
          } catch { /* non-blocking */ }
        }

        toast.success('Bienvenue ! Votre compte a été créé avec succès.');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: basic info → validate ────────────────────────────
  const handleStep2Next = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (role === 'etudiant') {
      setStep(3); // go to programme selection
    } else {
      handleSubmitFinal();
    }
  };

  // ── Step 3: programme → final submit ─────────────────────────
  const handleStep3Submit = (e) => {
    e.preventDefault();
    if (!programme || !cours || !niveau) {
      toast.error('Veuillez sélectionner un programme, un cours et un niveau');
      return;
    }
    handleSubmitFinal();
  };

  // Course options — only the curated list per programme (no PocketBase courses)
  const coursOptions = progCfg ? progCfg.defaultCours : [];

  return (
    <>
      <Helmet>
        <title>Créer un compte — IWS LAAYOUNE</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-muted p-4" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-lg">
          <Link to="/" className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors mb-6 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
          </Link>

          <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
            {/* Header */}
            <div className="bg-primary px-8 py-6 text-center">
              <h1 className="text-2xl font-bold text-white">Créer votre compte</h1>
              <p className="text-white/70 text-sm mt-1">IWS LAAYOUNE — Plateforme digitale</p>
            </div>

            <div className="p-8">

              {/* ── Étape 1 : Choix du rôle ──────────────────────── */}
              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center mb-6">
                    Choisissez le type de compte qui correspond à votre profil
                  </p>
                  {ROLES.map(({ value, label, icon: Icon, desc }) => (
                    <button
                      key={value}
                      onClick={() => handleRoleSelect(value)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-accent hover:bg-accent/5 transition-all text-left group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/10 transition-colors">
                        <Icon className="w-6 h-6 text-primary group-hover:text-accent transition-colors" />
                      </div>
                      <div>
                        <div className="font-semibold text-primary">{label}</div>
                        <div className="text-sm text-muted-foreground">{desc}</div>
                      </div>
                      {value === 'admin' && (
                        <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                          Validation requise
                        </span>
                      )}
                      {value === 'etudiant' && (
                        <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                          + Choix formation
                        </span>
                      )}
                    </button>
                  ))}
                  <div className="text-center mt-6 text-sm text-muted-foreground">
                    Déjà inscrit ?{' '}
                    <Link to="/login" className="text-accent hover:underline font-medium">Se connecter</Link>
                  </div>
                </div>
              )}

              {/* ── Étape 2 : Formulaire principal ───────────────── */}
              {step === 2 && (
                <div>
                  <button
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-5 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Changer de type de compte
                  </button>

                  {/* Badge rôle */}
                  {selectedRole && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/10 border border-accent/20 mb-5">
                      <selectedRole.icon className="w-5 h-5 text-accent" />
                      <div>
                        <span className="font-semibold text-primary text-sm">{selectedRole.label}</span>
                        {role === 'admin' && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Votre demande sera examinée par notre équipe.
                          </p>
                        )}
                        {role === 'etudiant' && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            L'étape suivante vous permettra de choisir votre formation.
                          </p>
                        )}
                      </div>
                      {role === 'etudiant' && (
                        <span className="ml-auto text-xs text-muted-foreground opacity-60 shrink-0">1/2</span>
                      )}
                    </div>
                  )}

                  <form onSubmit={handleStep2Next} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nom complet *</Label>
                        <Input
                          id="name" required value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="Votre nom et prénom"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Adresse email *</Label>
                        <Input
                          id="email" type="email" required value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="vous@exemple.com"
                        />
                      </div>
                    </div>

                    {/* Phone for students and admin */}
                    {(role === 'etudiant' || role === 'admin') && (
                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone" value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="+212 6XX XXX XXX"
                        />
                      </div>
                    )}

                    {/* Company for admin */}
                    {role === 'admin' && (
                      <div className="space-y-2">
                        <Label htmlFor="company">Entreprise / Organisation</Label>
                        <Input
                          id="company" value={company}
                          onChange={e => setCompany(e.target.value)}
                          placeholder="Nom de votre société"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
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
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
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

                    <Button
                      type="submit"
                      className="w-full bg-accent hover:bg-accent/90 text-primary font-bold h-12 text-base mt-2"
                    >
                      {role === 'admin'
                        ? 'Soumettre ma demande'
                        : role === 'etudiant'
                          ? <span className="flex items-center gap-2">Étape suivante : Choisir ma formation <ArrowRight className="w-4 h-4" /></span>
                          : 'Créer mon compte'}
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

              {/* ── Étape 3 : Choix de la formation (étudiant) ────── */}
              {step === 3 && role === 'etudiant' && (
                <div>
                  <button
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-5 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Retour
                  </button>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/10 border border-accent/20 mb-5">
                    <BookOpen className="w-5 h-5 text-accent" />
                    <div>
                      <span className="font-semibold text-primary text-sm">Choisissez votre formation</span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Dernière étape avant la création de votre compte
                      </p>
                    </div>
                    <span className="ml-auto text-xs text-muted-foreground opacity-60 shrink-0">2/2</span>
                  </div>

                  <form onSubmit={handleStep3Submit} className="space-y-5">

                    {/* Programme selection */}
                    <div className="space-y-2">
                      <Label className="font-semibold">Programme *</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {Object.entries(PROGRAMMES).map(([key, cfg]) => {
                          const Icon = cfg.icon;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => { setProgramme(key); setCours(''); setNiveau(''); }}
                              className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                                programme === key
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/40'
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cfg.gradient} flex items-center justify-center flex-shrink-0`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground text-sm">{cfg.label}</p>
                                <p className="text-xs text-muted-foreground truncate">{cfg.subtitle}</p>
                              </div>
                              {programme === key && <Check className="w-5 h-5 text-primary flex-shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Cours (shown after programme selected) */}
                    {programme && progCfg && (
                      <div className="space-y-2">
                        <Label className="font-semibold">Cours souhaité *</Label>
                        <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                          {coursOptions.map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setCours(c)}
                              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm text-left transition-all ${
                                cours === c
                                  ? 'border-primary bg-primary/5 font-semibold text-primary'
                                  : 'border-border hover:border-primary/40 text-foreground'
                              }`}
                            >
                              <BookOpen className={`w-3.5 h-3.5 flex-shrink-0 ${cours === c ? 'text-primary' : 'text-muted-foreground'}`} />
                              {c}
                              {cours === c && <Check className="w-3.5 h-3.5 ml-auto text-primary" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Niveau (shown after cours selected) */}
                    {cours && progCfg && (
                      <div className="space-y-2">
                        <Label className="font-semibold">Niveau *</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {progCfg.niveaux.map(n => (
                            <button
                              key={n.value}
                              type="button"
                              onClick={() => setNiveau(n.value)}
                              className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                                niveau === n.value
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-border hover:border-primary/40 text-foreground'
                              }`}
                            >
                              <Star className="w-3 h-3 inline mr-1 opacity-60" />
                              {n.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={!programme || !cours || !niveau || loading}
                      className="w-full bg-accent hover:bg-accent/90 text-primary font-bold h-12 text-base"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          Création du compte...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Check className="w-4 h-4" /> Créer mon compte gratuitement
                        </span>
                      )}
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
      </div>
    </>
  );
};

export default SignupPage;
