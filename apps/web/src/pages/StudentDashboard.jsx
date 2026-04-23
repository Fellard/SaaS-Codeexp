/**
 * StudentDashboard — Espace Étudiant IWS LAAYOUNE
 * ─────────────────────────────────────────────────────────────────────────────
 * Dashboard professionnel pour les étudiants :
 *  - Stats : cours inscrits, progression, terminés, niveau
 *  - Cours groupés par LANGUE (Français, Anglais, Arabe, Espagnol...)
 *  - Révision espacée (IWS Recall) et accès rapide
 *  - Level roadmap A1→C2
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import DashboardLayout from '@/components/DashboardLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen, TrendingUp, CheckCircle2, PlayCircle, Brain,
  Star, ArrowRight, GraduationCap, Gift, CreditCard,
  Lock, Clock, Zap, AlertCircle, Globe,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

const FREE_COURSES_LIMIT = 3;

// Config par langue — flag, couleurs Tailwind, label affiché
const LANGUE_CFG = {
  Francais:  { label: 'Français',  flag: '🇫🇷', gradient: 'from-blue-600 to-blue-400',    headerBg: 'bg-blue-600',   lightBg: 'bg-blue-50',   border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700',   bar: '[&>div]:bg-blue-500',   icon: 'text-blue-600'   },
  Anglais:   { label: 'Anglais',   flag: '🇬🇧', gradient: 'from-red-600 to-rose-400',     headerBg: 'bg-red-600',    lightBg: 'bg-red-50',    border: 'border-red-200',  badge: 'bg-red-100 text-red-700',     bar: '[&>div]:bg-red-500',    icon: 'text-red-600'    },
  Arabe:     { label: 'Arabe',     flag: '🌍',  gradient: 'from-emerald-600 to-teal-400', headerBg: 'bg-emerald-600',lightBg: 'bg-emerald-50',border: 'border-emerald-200',badge: 'bg-emerald-100 text-emerald-700', bar: '[&>div]:bg-emerald-500', icon: 'text-emerald-600' },
  Espagnole: { label: 'Espagnol',  flag: '🇪🇸', gradient: 'from-yellow-500 to-orange-400',headerBg: 'bg-yellow-500', lightBg: 'bg-yellow-50', border: 'border-yellow-200',badge: 'bg-yellow-100 text-yellow-700', bar: '[&>div]:bg-yellow-500', icon: 'text-yellow-600' },
  default:   { label: 'Autre',     flag: '📚',  gradient: 'from-violet-600 to-purple-400',headerBg: 'bg-violet-600', lightBg: 'bg-violet-50', border: 'border-violet-200',badge: 'bg-violet-100 text-violet-700', bar: '[&>div]:bg-violet-500', icon: 'text-violet-600' },
};

// Niveau A1→C2
const NIVEAUX = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const NIVEAU_CFG = {
  A1: { desc: 'Débutant',            color: 'bg-sky-500',     text: 'text-sky-700',     bg: 'bg-sky-50',     border: 'border-sky-200'     },
  A2: { desc: 'Élémentaire',         color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  B1: { desc: 'Intermédiaire',       color: 'bg-violet-500',  text: 'text-violet-700',  bg: 'bg-violet-50',  border: 'border-violet-200'  },
  B2: { desc: 'Intermédiaire avancé',color: 'bg-amber-500',   text: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200'   },
  C1: { desc: 'Avancé',              color: 'bg-orange-500',  text: 'text-orange-700',  bg: 'bg-orange-50',  border: 'border-orange-200'  },
  C2: { desc: 'Maîtrise',            color: 'bg-red-500',     text: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200'     },
};

// ─────────────────────────────────────────────────────────────────────────────
// SOUS-COMPOSANTS
// ─────────────────────────────────────────────────────────────────────────────

// Salutation selon l'heure
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
};

// Carte de stat
const StatCard = ({ icon: Icon, label, value, sub, colorBg, colorText, loading }) => (
  <div className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${colorBg}`}>
      <Icon className={`w-5 h-5 ${colorText}`} />
    </div>
    {loading
      ? <Skeleton className="h-8 w-20 mb-1" />
      : <p className={`text-3xl font-black ${colorText}`}>{value}</p>
    }
    <p className="text-sm font-semibold text-foreground mt-0.5">{label}</p>
    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
  </div>
);

// Roadmap de niveaux A1→C2
const LevelRoadmap = ({ currentLevel }) => {
  const currentIdx = NIVEAUX.indexOf(currentLevel);
  return (
    <div className="flex items-center gap-1.5 mt-3 flex-wrap">
      {NIVEAUX.map((n, i) => {
        const cfg = NIVEAU_CFG[n];
        const isDone    = i < currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <React.Fragment key={n}>
            <div className={`relative flex items-center justify-center w-8 h-8 rounded-full text-xs font-black border-2 transition-all ${
              isCurrent ? `${cfg.bg} ${cfg.text} ${cfg.border} scale-110 shadow-md ring-2 ring-offset-1 ring-current` :
              isDone    ? 'bg-emerald-500 text-white border-emerald-500' :
                          'bg-muted text-muted-foreground border-border'
            }`}>
              {isDone ? '✓' : n}
              {isCurrent && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full border border-white animate-pulse" />
              )}
            </div>
            {i < NIVEAUX.length - 1 && (
              <div className={`h-0.5 w-4 rounded-full ${isDone ? 'bg-emerald-400' : 'bg-border'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Carte d'un cours individuel dans un groupe de langue
const CourseCard = ({ enrollment, isLocked, langCfg, courseIdx }) => {
  const course   = enrollment.expand?.course_id || {};
  const title    = course.titre || course.title || `Cours ${courseIdx + 1}`;
  const duration = course.duree || 0;
  const niveau   = course.niveau || course.level || '';
  const prog     = enrollment.progression || 0;
  const done     = enrollment.complete || prog >= 100;
  const courseId = enrollment.course_id;

  return (
    <div className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
      isLocked ? 'bg-muted/30 border-border opacity-60'
      : done   ? 'bg-emerald-50/60 border-emerald-200 dark:bg-emerald-950/20'
               : 'bg-card border-border hover:border-primary/30 hover:shadow-sm'
    }`}>
      {/* Indicateur état */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold ${
        isLocked ? 'bg-muted text-muted-foreground'
        : done   ? 'bg-emerald-100 text-emerald-600'
                 : `${langCfg.lightBg} ${langCfg.icon}`
      }`}>
        {isLocked ? <Lock className="w-4 h-4" /> : done ? <CheckCircle2 className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
      </div>

      {/* Info cours */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {niveau && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${langCfg.badge}`}>{niveau}</span>
          )}
          {duration > 0 && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" /> {duration} min
            </span>
          )}
        </div>
        {!isLocked && (
          <div className="flex items-center gap-2 mt-1.5">
            <Progress value={prog} className={`h-1.5 flex-1 bg-muted ${langCfg.bar}`} />
            <span className="text-[10px] font-bold text-muted-foreground w-8 text-right">{prog}%</span>
          </div>
        )}
      </div>

      {/* Action */}
      {isLocked ? (
        <span className="text-xs text-muted-foreground shrink-0">Verrouillé</span>
      ) : done ? (
        <span className="text-xs font-bold text-emerald-600 shrink-0">✓ Terminé</span>
      ) : (
        <Link to={courseId ? `/etudiant/dashboard/courses/${courseId}/view` : '/etudiant/dashboard/courses'}>
          <Button
            size="sm"
            className={`h-8 px-3 text-xs font-bold gap-1.5 bg-primary text-primary-foreground shadow-sm whitespace-nowrap`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            {prog > 0 ? 'Continuer' : 'Commencer'}
          </Button>
        </Link>
      )}
    </div>
  );
};

// Groupe de cours par langue
const LanguageGroup = ({ langue, enrollments, isLocked, expanded, onToggle }) => {
  const cfg        = LANGUE_CFG[langue] || LANGUE_CFG.default;
  const total      = enrollments.length;
  const done       = enrollments.filter(e => e.complete || (e.progression || 0) >= 100).length;
  const avgProg    = total > 0
    ? Math.round(enrollments.reduce((s, e) => s + (e.progression || 0), 0) / total)
    : 0;
  const displayed  = expanded ? enrollments : enrollments.slice(0, 3);

  return (
    <div className={`rounded-2xl border-2 overflow-hidden ${cfg.border} shadow-sm`}>
      {/* En-tête du groupe */}
      <div
        className={`bg-gradient-to-r ${cfg.gradient} px-5 py-4 flex items-center justify-between cursor-pointer select-none`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{cfg.flag}</span>
          <div>
            <h3 className="font-black text-white text-base">{cfg.label}</h3>
            <p className="text-white/70 text-xs">
              {done}/{total} cours terminés · {avgProg}% progression
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mini progress ring */}
          <div className="flex flex-col items-end gap-1">
            <span className="text-white font-black text-lg">{avgProg}%</span>
            <div className="w-20 h-1.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${avgProg}%` }}
              />
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold">
            {expanded ? '−' : '+'}
          </div>
        </div>
      </div>

      {/* Liste des cours */}
      <div className={`p-4 space-y-2.5 ${cfg.lightBg}`}>
        {displayed.map((e, idx) => (
          <CourseCard
            key={e.id}
            enrollment={e}
            isLocked={isLocked}
            langCfg={cfg}
            courseIdx={idx}
          />
        ))}

        {/* Voir plus */}
        {total > 3 && (
          <button
            onClick={onToggle}
            className={`w-full text-sm font-semibold py-2 rounded-xl border-2 border-dashed ${cfg.border} ${cfg.icon} hover:opacity-80 transition-opacity`}
          >
            {expanded ? `Réduire ↑` : `Voir ${total - 3} cours de plus ↓`}
          </button>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  // Groupes de langues étendus par défaut
  const [expanded, setExpanded]       = useState({});

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    if (!currentUser?.id) return;
    try {
      const [enrollRes, ordersRes] = await Promise.allSettled([
        pb.collection('course_enrollments').getFullList({
          filter:    `user_id = "${currentUser.id}"`,
          expand:    'course_id',
          sort:      '+created',
          requestKey: null,
        }),
        pb.collection('orders').getFullList({
          filter:    `user_id = "${currentUser.id}"`,
          sort:      '-created',
          requestKey: null,
        }),
      ]);
      if (enrollRes.status === 'fulfilled') setEnrollments(enrollRes.value);
      if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value);
    } catch (err) {
      console.error('StudentDashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Statuts de paiement ────────────────────────────────────────────────────
  const hasActivePayment = orders.some(o => o.status === 'completed' || o.status === 'paid');
  const isFreeTier       = enrollments.length <= FREE_COURSES_LIMIT && !hasActivePayment;
  const hasPendingOrder  = !isFreeTier && orders.some(o => o.status === 'pending');
  const isLocked         = !hasActivePayment && !isFreeTier;

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalCourses  = enrollments.length;
  const doneCourses   = enrollments.filter(e => e.complete || (e.progression || 0) >= 100).length;
  const avgProgress   = totalCourses > 0
    ? Math.round(enrollments.reduce((s, e) => s + (e.progression || 0), 0) / totalCourses)
    : 0;
  const niveau        = currentUser?.Level || null;
  const currentCourse = currentUser?.current_course || null;

  // ── Groupement des cours par langue ─────────────────────────────────────────
  // Normalise le nom de langue depuis le champ cours_nom, langue, ou current_course
  const groupedByLang = useMemo(() => {
    const groups = {};
    enrollments.forEach(e => {
      const course = e.expand?.course_id || {};
      // Priorité : cours_nom > langue > current_course > 'Autre'
      let lang = course.cours_nom || course.langue || 'Autre';
      // Normalisation
      if (/fran[cç]/i.test(lang)) lang = 'Francais';
      else if (/angl/i.test(lang)) lang = 'Anglais';
      else if (/arab/i.test(lang)) lang = 'Arabe';
      else if (/espagn/i.test(lang) || /spanish/i.test(lang)) lang = 'Espagnole';
      else lang = 'default';

      if (!groups[lang]) groups[lang] = [];
      groups[lang].push(e);
    });
    // Tri : les langues avec le plus de cours en premier
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  }, [enrollments]);

  // ── Nom d'affichage ────────────────────────────────────────────────────────
  const displayName = currentUser
    ? (`${currentUser.prenom || ''} ${currentUser.nom || currentUser.name || ''}`.trim() || currentUser.name || 'Étudiant')
    : 'Étudiant';

  // ── Toggle groupe ──────────────────────────────────────────────────────────
  const toggleGroup = (lang) =>
    setExpanded(prev => ({ ...prev, [lang]: !prev[lang] }));

  return (
    <>
      <Helmet><title>Espace Étudiant — IWS LAAYOUNE</title></Helmet>
      <DashboardLayout>
        <div className="space-y-6 max-w-5xl mx-auto">

          {/* ══════════════════════════════════════════════════
              ALERTE paiement en attente
          ══════════════════════════════════════════════════ */}
          {!loading && hasPendingOrder && !hasActivePayment && (
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-bold text-amber-800 text-sm">Paiement en attente</p>
                  <p className="text-amber-700 text-xs">
                    Effectuez votre paiement pour débloquer tous vos cours.
                  </p>
                </div>
              </div>
              <Link to="/formation">
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shrink-0 gap-2">
                  <CreditCard className="w-4 h-4" /> Payer maintenant
                </Button>
              </Link>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              EN-TÊTE — Salutation + niveau
          ══════════════════════════════════════════════════ */}
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 opacity-95" />
            <div className="absolute inset-0 opacity-5"
              style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.4) 0%, transparent 60%)' }}
            />
            <div className="relative px-6 py-7 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm text-white flex items-center justify-center font-black text-2xl shadow-lg flex-shrink-0 border-2 border-white/30">
                {displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1">
                <p className="text-white/70 text-sm font-medium mb-0.5">{getGreeting()},</p>
                <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">{displayName} 👋</h1>
                <div className="flex flex-wrap gap-2">
                  {niveau && (
                    <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30">
                      <Star className="w-3.5 h-3.5 text-yellow-300" /> Niveau {niveau}
                      {NIVEAU_CFG[niveau] && <span className="opacity-70">— {NIVEAU_CFG[niveau].desc}</span>}
                    </span>
                  )}
                  {currentCourse && (
                    <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30">
                      <BookOpen className="w-3.5 h-3.5" /> {currentCourse}
                    </span>
                  )}
                  {isFreeTier && (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-500/80 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                      <Gift className="w-3.5 h-3.5" /> {totalCourses}/{FREE_COURSES_LIMIT} cours gratuits
                    </span>
                  )}
                  {hasActivePayment && (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-500/80 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Formation active
                    </span>
                  )}
                </div>
              </div>

              {/* CTA rapide */}
              <div className="shrink-0">
                <Link to="/etudiant/dashboard/courses">
                  <Button className="bg-white text-primary hover:bg-white/90 font-bold rounded-xl gap-2 shadow-lg">
                    <PlayCircle className="w-4 h-4" /> Mes cours
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              ROADMAP DU NIVEAU (si niveau défini)
          ══════════════════════════════════════════════════ */}
          {niveau && NIVEAU_CFG[niveau] && (
            <div className={`rounded-2xl border-2 ${NIVEAU_CFG[niveau].border} ${NIVEAU_CFG[niveau].bg} p-5`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-white border-2 ${NIVEAU_CFG[niveau].border} shadow-sm flex flex-col items-center justify-center flex-shrink-0`}>
                  <span className={`text-xl font-black ${NIVEAU_CFG[niveau].text}`}>{niveau}</span>
                  <Star className={`w-3 h-3 ${NIVEAU_CFG[niveau].text}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`font-bold text-base ${NIVEAU_CFG[niveau].text}`}>
                      Niveau {niveau} — {NIVEAU_CFG[niveau].desc}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Votre progression dans le référentiel CECRL</p>
                  <LevelRoadmap currentLevel={niveau} />
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              STATS — 4 cartes
          ══════════════════════════════════════════════════ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={BookOpen}    label="Cours inscrits"     value={loading ? '…' : totalCourses}       sub="Total des inscriptions"       colorBg="bg-blue-100 dark:bg-blue-900/30"    colorText="text-blue-600"    loading={loading} />
            <StatCard icon={TrendingUp}  label="Progression"        value={loading ? '…' : `${avgProgress}%`} sub="Moyenne sur tous les cours"    colorBg="bg-emerald-100 dark:bg-emerald-900/30" colorText="text-emerald-600" loading={loading} />
            <StatCard icon={CheckCircle2}label="Cours terminés"     value={loading ? '…' : doneCourses}        sub="Complétés avec succès"         colorBg="bg-violet-100 dark:bg-violet-900/30"  colorText="text-violet-600"  loading={loading} />
            <StatCard icon={Star}        label="Niveau actuel"      value={loading ? '…' : (niveau || '—')}   sub={niveau ? NIVEAU_CFG[niveau]?.desc : 'À définir'} colorBg="bg-amber-100 dark:bg-amber-900/30" colorText="text-amber-600" loading={loading} />
          </div>

          {/* ══════════════════════════════════════════════════
              CONTENU PRINCIPAL — Cours par langue + Sidebar
          ══════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Colonne gauche : Cours groupés par langue ── */}
            <div className="lg:col-span-2 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Mes cours par langue
                </h2>
                <Link to="/etudiant/dashboard/courses">
                  <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-foreground">
                    Voir tout <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="rounded-2xl border-2 border-border overflow-hidden">
                      <Skeleton className="h-16 w-full" />
                      <div className="p-4 space-y-2">
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : groupedByLang.length === 0 ? (
                /* Pas de cours inscrits */
                <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-10 text-center">
                  <GraduationCap className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="font-bold text-foreground text-lg mb-1">Aucun cours inscrit</p>
                  <p className="text-muted-foreground text-sm mb-6">
                    Choisissez votre formation et commencez à apprendre dès aujourd'hui.
                  </p>
                  <Link to="/formation/inscription">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl gap-2">
                      <Zap className="w-4 h-4" /> Choisir une formation
                    </Button>
                  </Link>
                </div>
              ) : (
                /* Groupes par langue */
                groupedByLang.map(([lang, langEnrollments]) => (
                  <LanguageGroup
                    key={lang}
                    langue={lang}
                    enrollments={langEnrollments}
                    isLocked={isLocked}
                    expanded={expanded[lang] !== false} // ouvert par défaut
                    onToggle={() => toggleGroup(lang)}
                  />
                ))
              )}

              {/* Banner free tier */}
              {!loading && isFreeTier && totalCourses > 0 && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
                  <Gift className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800">Période d'accès gratuit</p>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Vous accédez à vos {FREE_COURSES_LIMIT} premiers cours gratuitement.
                      Le paiement sera demandé pour accéder aux cours suivants.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Colonne droite : Actions rapides + Recall ── */}
            <div className="space-y-5">

              {/* IWS Recall */}
              {totalCourses > 0 && (
                <Card className="border-2 border-indigo-200 dark:border-indigo-800 overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                        <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">IWS Recall</p>
                        <p className="text-xs text-muted-foreground">Révision espacée intelligente</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                      Consolidez vos apprentissages avec des flashcards générées par IA. 5 minutes par jour suffisent.
                    </p>
                    <Link to="/etudiant/dashboard/recall">
                      <Button className="w-full gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-md shadow-indigo-500/20">
                        <Brain className="w-4 h-4" /> Réviser maintenant
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Accès rapide */}
              <Card className="border border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" /> Accès rapide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5 pt-0">
                  {[
                    { to: '/etudiant/dashboard/profile',  icon: '👤', label: 'Mon profil',        sub: 'Modifier mes informations' },
                    { to: '/formation',                   icon: '📚', label: 'Catalogue de cours', sub: 'Toutes les formations IWS' },
                    { to: '/etudiant/dashboard/orders',   icon: '🧾', label: 'Mes commandes',      sub: 'Historique des paiements'  },
                    { to: '/store',                       icon: '🛒', label: 'Boutique',           sub: 'Ressources numériques'     },
                  ].map(item => (
                    <Link key={item.to} to={item.to}>
                      <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors group">
                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 text-base group-hover:scale-105 transition-transform">
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.sub}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              {/* Progression globale */}
              {totalCourses > 0 && (
                <Card className="border border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" /> Vue d'ensemble
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    {groupedByLang.map(([lang, langEnr]) => {
                      const cfg = LANGUE_CFG[lang] || LANGUE_CFG.default;
                      const avg = langEnr.length > 0
                        ? Math.round(langEnr.reduce((s, e) => s + (e.progression || 0), 0) / langEnr.length)
                        : 0;
                      return (
                        <div key={lang}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-semibold text-foreground flex items-center gap-1.5">
                              <span>{cfg.flag}</span> {cfg.label}
                            </span>
                            <span className="font-bold text-muted-foreground">{avg}%</span>
                          </div>
                          <Progress value={avg} className={`h-2 ${cfg.bar}`} />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

        </div>
      </DashboardLayout>
    </>
  );
};

export default StudentDashboard;
