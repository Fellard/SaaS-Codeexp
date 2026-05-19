/**
 * CourseSignupModal — Modal d'inscription étudiant
 *
 * Déclenché par "Suivre ce cours" sur CourseDetailPage et CoursesListPage.
 * Le rôle est fixé à "etudiant" et invisible pour l'utilisateur.
 * Après inscription → inscription au cours + redirection vers le viewer.
 *
 * Props :
 *   open       {boolean}   Affiche ou non le modal
 *   onClose    {function}  Ferme le modal
 *   courseId   {string}    ID du cours à rejoindre après inscription (optionnel)
 *   courseName {string}    Nom du cours à afficher dans le modal
 *   onSuccess  {function}  Appelée après inscription réussie (facultatif)
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, GraduationCap, Eye, EyeOff, Loader2,
  CheckCircle2, ArrowRight, BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';

export default function CourseSignupModal({ open, onClose, courseId, courseName, onSuccess }) {
  const navigate = useNavigate();

  const [mode,  setMode]  = useState('signup');  // signup | login
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', password: '', password2: '',
  });
  const [errors, setErrors] = useState({});

  if (!open) return null;

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  // ── Validation signup ─────────────────────────────────────────
  const validateSignup = () => {
    const e = {};
    if (!form.prenom.trim())   e.prenom   = 'Prénom requis';
    if (!form.nom.trim())      e.nom      = 'Nom requis';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = 'Email valide requis';
    if (form.password.length < 8)
      e.password = 'Minimum 8 caractères';
    if (form.password !== form.password2)
      e.password2 = 'Les mots de passe ne correspondent pas';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Après connexion/inscription : inscrit au cours si fourni ──
  const afterAuth = async (userId) => {
    if (courseId) {
      try {
        const existing = await pb.collection('course_enrollments').getFullList({
          filter: `user_id="${userId}" && course_id="${courseId}"`,
          requestKey: null,
        });
        if (existing.length === 0) {
          await pb.collection('course_enrollments').create({
            user_id:    userId,
            course_id:  courseId,
            progression: 0,
            complete:   false,
            status:     'active',
            start_date: new Date().toISOString(),
          }, { requestKey: null });
        }
      } catch {}
    }
    onSuccess?.();
    onClose();
    if (courseId) {
      navigate(`/etudiant/dashboard/courses/${courseId}/view`);
    } else {
      navigate('/etudiant/dashboard');
    }
  };

  // ── Inscription ───────────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateSignup()) return;
    setLoading(true);
    try {
      await pb.collection('users').create({
        prenom:          form.prenom.trim(),
        nom:             form.nom.trim(),
        name:            `${form.prenom.trim()} ${form.nom.trim()}`,
        email:           form.email.trim(),
        password:        form.password,
        passwordConfirm: form.password2,
        role:            'etudiant',
      });
      // Auto-connexion
      await pb.collection('users').authWithPassword(form.email.trim(), form.password);
      const userId = pb.authStore.model?.id;
      toast.success('Compte créé ! Bienvenue 🎓');
      await afterAuth(userId);
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('email'))
        setErrors(p => ({ ...p, email: 'Cet email est déjà utilisé' }));
      else
        toast.error(msg || 'Erreur lors de la création du compte');
    } finally { setLoading(false); }
  };

  // ── Connexion ─────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      setErrors({ email: !form.email.trim() ? 'Email requis' : '', password: !form.password ? 'Mot de passe requis' : '' });
      return;
    }
    setLoading(true);
    try {
      await pb.collection('users').authWithPassword(form.email.trim(), form.password);
      const userId = pb.authStore.model?.id;
      toast.success('Connexion réussie !');
      await afterAuth(userId);
    } catch {
      setErrors({ email: ' ', password: 'Email ou mot de passe incorrect' });
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-primary/80 px-6 py-5 text-primary-foreground">
          <button onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">
                {mode === 'signup' ? 'Créer mon compte étudiant' : 'Se connecter'}
              </h2>
              {courseName && (
                <p className="text-xs opacity-80 mt-0.5 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> {courseName}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {mode === 'signup' ? (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input type="text" placeholder="Prénom *" value={form.prenom}
                    onChange={e => set('prenom', e.target.value)}
                    className={`w-full h-10 rounded-lg border px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.prenom ? 'border-destructive' : 'border-input'}`}
                  />
                  {errors.prenom && <p className="text-xs text-destructive mt-1">{errors.prenom}</p>}
                </div>
                <div>
                  <input type="text" placeholder="Nom *" value={form.nom}
                    onChange={e => set('nom', e.target.value)}
                    className={`w-full h-10 rounded-lg border px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.nom ? 'border-destructive' : 'border-input'}`}
                  />
                  {errors.nom && <p className="text-xs text-destructive mt-1">{errors.nom}</p>}
                </div>
              </div>

              <div>
                <input type="email" placeholder="Email *" value={form.email}
                  onChange={e => set('email', e.target.value)}
                  className={`w-full h-10 rounded-lg border px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.email ? 'border-destructive' : 'border-input'}`}
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>

              <div>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} placeholder="Mot de passe (8 car. min.) *"
                    value={form.password} onChange={e => set('password', e.target.value)}
                    className={`w-full h-10 rounded-lg border px-3 pr-10 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.password ? 'border-destructive' : 'border-input'}`}
                  />
                  <button type="button" onClick={() => setShowPwd(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
              </div>

              <div>
                <div className="relative">
                  <input type={showPwd2 ? 'text' : 'password'} placeholder="Confirmer le mot de passe *"
                    value={form.password2} onChange={e => set('password2', e.target.value)}
                    className={`w-full h-10 rounded-lg border px-3 pr-10 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.password2 ? 'border-destructive' : 'border-input'}`}
                  />
                  <button type="button" onClick={() => setShowPwd2(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPwd2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password2 && <p className="text-xs text-destructive mt-1">{errors.password2}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 font-bold hover:bg-primary/90 transition-colors disabled:opacity-60">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Création du compte…</>
                  : <><CheckCircle2 className="w-4 h-4" /> S'inscrire et commencer</>
                }
              </button>

              <p className="text-center text-sm text-muted-foreground">
                Déjà inscrit ?{' '}
                <button type="button" onClick={() => setMode('login')}
                  className="text-primary font-semibold hover:underline">
                  Se connecter
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input type="email" placeholder="Email *" value={form.email}
                  onChange={e => set('email', e.target.value)}
                  className={`w-full h-10 rounded-lg border px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.email ? 'border-destructive' : 'border-input'}`}
                />
                {errors.email?.trim() && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>

              <div>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} placeholder="Mot de passe *"
                    value={form.password} onChange={e => set('password', e.target.value)}
                    className={`w-full h-10 rounded-lg border px-3 pr-10 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.password ? 'border-destructive' : 'border-input'}`}
                  />
                  <button type="button" onClick={() => setShowPwd(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 font-bold hover:bg-primary/90 transition-colors disabled:opacity-60">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Connexion…</>
                  : <><ArrowRight className="w-4 h-4" /> Se connecter et accéder au cours</>
                }
              </button>

              <p className="text-center text-sm text-muted-foreground">
                Pas encore de compte ?{' '}
                <button type="button" onClick={() => setMode('signup')}
                  className="text-primary font-semibold hover:underline">
                  S'inscrire gratuitement
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
