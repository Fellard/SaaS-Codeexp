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
  User, Music, BookOpen, ShieldCheck, Eye, EyeOff,
  ArrowLeft, ArrowRight, Check,
} from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient';

// ── Role config ──────────────────────────────────────────────────
const ROLES = [
  { value: 'client',    label: 'Client',        icon: User,        desc: 'Accédez à nos services et produits' },
  { value: 'etudiant',  label: 'Étudiant',       icon: BookOpen,    desc: 'Suivez nos formations en ligne' },
  { value: 'musicien',  label: 'Musicien',       icon: Music,       desc: 'Réservez le studio et partagez votre musique' },
  { value: 'admin',     label: 'Administrateur', icon: ShieldCheck, desc: 'Accès soumis à validation par notre équipe' },
];

// ── Langues disponibles (étudiant only) ─────────────────────────
const LANGUES = [
  { value: 'Français',  label: 'Français',  flag: '🇫🇷', desc: 'Apprenez le français avec nos formateurs certifiés' },
  { value: 'Anglais',   label: 'Anglais',   flag: '🇬🇧', desc: 'Maîtrisez l\'anglais de A1 à C2' },
  { value: 'Arabe',     label: 'Arabe',     flag: '🌍', desc: 'Arabe classique et darija avec nos professeurs' },
  { value: 'Espagnole', label: 'Espagnole', flag: '🇪🇸', desc: 'Découvrez l\'espagnol, langue de nos voisins' },
];

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

  // Formation field (étudiant only) — langue choisie
  const [cours, setCours]                 = useState('');

  const { signup, getDashboardPath } = useAuth();
  const navigate   = useNavigate();
  const { t }      = useTranslation();
  const { language } = useLanguage();
  const isRtl      = language?.startsWith('ar');

  const selectedRole = ROLES.find(r => r.value === role);

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

        // Pour les étudiants : sauvegarder la langue choisie dans le profil
        if (role === 'etudiant' && cours) {
          try {
            const userId = pb.authStore.model?.id;
            if (userId) {
              await pb.collection('users').update(userId, {
                section: 'langues',
                current_course: cours,
                phone: phone || null,
              }, { requestKey: null });
            }
          } catch { /* non-blocking */ }
        }

        toast.success('Bienvenue ! Votre compte a été créé avec succès.');
        navigate(getDashboardPath(role));
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
      setStep(3); // go to language selection
    } else {
      handleSubmitFinal();
    }
  };

  // ── Step 3: langue → final submit ─────────────────────────
  const handleStep3Submit = (e) => {
    e.preventDefault();
    if (!cours) {
      toast.error('Veuillez sélectionner une langue');
      return;
    }
    handleSubmitFinal();
  };

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
                          + Choix de la langue
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
                            L'étape suivante vous permettra de choisir votre langue.
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
                          ? <span className="flex items-center gap-2">Étape suivante : Choisir ma langue <ArrowRight className="w-4 h-4" /></span>
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

              {/* ── Étape 3 : Choix de la langue (étudiant) ────── */}
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
                      <span className="font-semibold text-primary text-sm">Choisissez votre langue</span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Dernière étape avant la création de votre compte
                      </p>
                    </div>
                    <span className="ml-auto text-xs text-muted-foreground opacity-60 shrink-0">2/2</span>
                  </div>

                  <form onSubmit={handleStep3Submit} className="space-y-5">

                    {/* Langue selection */}
                    <div className="space-y-2">
                      <Label className="font-semibold">Quelle langue souhaitez-vous apprendre ? *</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {LANGUES.map(lang => (
                          <button
                            key={lang.value}
                            type="button"
                            onClick={() => setCours(lang.value)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all ${
                              cours === lang.value
                                ? 'border-primary bg-primary/5 shadow-md'
                                : 'border-border hover:border-primary/40 bg-card'
                            }`}
                          >
                            <span className="text-3xl">{lang.flag}</span>
                            <span className={`text-sm font-bold ${cours === lang.value ? 'text-primary' : 'text-foreground'}`}>
                              {lang.label}
                            </span>
                            {cours === lang.value && (
                              <span className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-primary-foreground" />
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={!cours || loading}
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
