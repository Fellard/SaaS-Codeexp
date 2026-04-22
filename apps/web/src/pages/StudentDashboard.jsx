import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useLanguage } from '@/hooks/useLanguage.jsx';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import DashboardStats from '@/components/DashboardStats.jsx';
import RecentActivity from '@/components/RecentActivity.jsx';
import QuickShortcuts from '@/components/QuickShortcuts.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen, TrendingUp, Clock, CheckCircle, PlayCircle, ShoppingBag,
  Mic2, Star, ArrowRight, Zap, Languages, Monitor, Code2,
  CreditCard, Lock, CheckCircle2, AlertCircle, GraduationCap, Gift,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// ── Programme config ─────────────────────────────────────────────
const PROGRAMME_CFG = {
  langues:       { label: 'Langues',       icon: Languages, gradient: 'from-blue-600 to-sky-500',    bg: 'bg-blue-50 dark:bg-blue-950/30',    border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700'    },
  informatique:  { label: 'Informatique',  icon: Monitor,   gradient: 'from-green-600 to-emerald-500', bg: 'bg-green-50 dark:bg-green-950/30',  border: 'border-green-200', badge: 'bg-green-100 text-green-700'  },
  programmation: { label: 'Programmation', icon: Code2,     gradient: 'from-purple-600 to-indigo-500', bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700' },
};

// ── Formation status card ────────────────────────────────────────
const FREE_COURSES_LIMIT = 3;

const FormationStatusCard = ({ currentUser, enrollments, orders }) => {
  const programme   = currentUser?.section;
  const currentCourse = currentUser?.current_course;
  const niveau      = currentUser?.Level;
  const cfg         = programme ? PROGRAMME_CFG[programme] : null;

  const hasActivePayment = orders.some(o => o.status === 'completed');
  // Free tier: first 5 courses are free regardless of pending orders
  const isFreeTier       = enrollments.length < FREE_COURSES_LIMIT && !hasActivePayment;
  const hasPendingOrder  = !isFreeTier && orders.some(o => o.status === 'pending');
  const firstEnrollment  = enrollments[0];

  // Nothing to show if no programme and no enrollment
  if (!programme && !currentCourse && enrollments.length === 0) {
    return (
      <Card className="dash-card border-2 border-dashed border-border">
        <CardContent className="py-8 text-center">
          <GraduationCap className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-semibold text-foreground mb-1">Pas encore de formation</p>
          <p className="text-sm text-muted-foreground mb-4">Choisissez votre programme et commencez votre parcours</p>
          <Link to="/formation/inscription">
            <Button className="bg-accent hover:bg-accent/90 text-primary font-bold rounded-xl gap-2">
              <GraduationCap className="w-4 h-4" /> Choisir une formation
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const Icon = cfg?.icon || GraduationCap;

  return (
    <Card className={`dash-card border-2 overflow-hidden ${cfg ? cfg.border : 'border-border'}`}>
      {cfg && <div className={`h-1 bg-gradient-to-r ${cfg.gradient}`} />}
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          Ma Formation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Programme + cours + niveau */}
        <div className={`rounded-xl p-4 ${cfg ? cfg.bg : 'bg-muted/50'} border ${cfg ? cfg.border : 'border-border'}`}>
          <div className="flex flex-wrap gap-4 justify-between">
            <div>
              {programme && cfg && (
                <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-full mb-2 ${cfg.badge}`}>
                  <Icon className="w-3.5 h-3.5" /> {cfg.label}
                </span>
              )}
              {currentCourse && (
                <p className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-muted-foreground" /> {currentCourse}
                </p>
              )}
              {niveau && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Niveau : <span className="font-semibold text-foreground">{niveau}</span>
                </p>
              )}
            </div>

            {/* Status badge */}
            {hasActivePayment ? (
              <div className="flex flex-col items-end gap-1">
                <Badge className="border-emerald-500 text-emerald-700 bg-emerald-50 gap-1 text-xs" variant="outline">
                  <CheckCircle2 className="w-3 h-3" /> Formation active
                </Badge>
                {firstEnrollment && (
                  <p className="text-xs text-muted-foreground">
                    Progression : {firstEnrollment.progression || 0}%
                  </p>
                )}
              </div>
            ) : isFreeTier ? (
              <div className="flex flex-col items-end gap-1">
                <Badge className="border-emerald-400 text-emerald-700 bg-emerald-50 gap-1 text-xs" variant="outline">
                  <Gift className="w-3 h-3" /> {enrollments.length}/{FREE_COURSES_LIMIT} cours gratuits
                </Badge>
                {firstEnrollment && firstEnrollment.progression > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Progression : {firstEnrollment.progression || 0}%
                  </p>
                )}
              </div>
            ) : hasPendingOrder ? (
              <Badge className="border-amber-400 text-amber-700 bg-amber-50 gap-1 text-xs" variant="outline">
                <AlertCircle className="w-3 h-3" /> En attente de paiement
              </Badge>
            ) : (
              <Badge className="border-slate-300 text-slate-600 bg-slate-50 gap-1 text-xs" variant="outline">
                <CheckCircle2 className="w-3 h-3" /> Inscrit
              </Badge>
            )}
          </div>
        </div>

        {/* Progression bar (if active or free tier with progress) */}
        {(hasActivePayment || isFreeTier) && firstEnrollment && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progression globale</span>
              <span className="font-bold text-foreground">{firstEnrollment.progression || 0}%</span>
            </div>
            <Progress
              value={firstEnrollment.progression || 0}
              className={`h-2 ${(firstEnrollment.progression || 0) >= 80 ? '[&>div]:bg-emerald-500' : '[&>div]:bg-blue-500'}`}
            />
          </div>
        )}

        {/* Free tier info banner */}
        {isFreeTier && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-start gap-2">
            <Gift className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-700">
              <span className="font-semibold">Période gratuite :</span> vous pouvez accéder à vos {FREE_COURSES_LIMIT} premiers cours sans frais. Le débit aura lieu après le {FREE_COURSES_LIMIT}e cours.
            </p>
          </div>
        )}

        {/* Course list — unlocked for free tier AND paid users */}
        {enrollments.length > 0 && (
          <div className="space-y-2">
            {enrollments.slice(0, 3).map(e => {
              const courseTitle = e.expand?.course_id?.titre || e.expand?.course_id?.title || 'Cours';
              const locked      = !hasActivePayment && !isFreeTier;
              return (
                <div key={e.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  locked ? 'bg-muted/30 border-border opacity-70' : 'bg-card border-border hover:border-primary/30'
                }`}>
                  {locked
                    ? <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    : <PlayCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  }
                  <p className="text-sm text-foreground flex-1 truncate">{courseTitle}</p>
                  {locked
                    ? <span className="text-xs text-muted-foreground">Verrouillé</span>
                    : <span className="text-xs font-medium text-primary">{e.progression || 0}%</span>
                  }
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        {hasPendingOrder && (
          <Link to="/formation">
            <Button className="w-full bg-accent hover:bg-accent/90 text-primary font-bold rounded-xl gap-2">
              <CreditCard className="w-4 h-4" /> Effectuer le paiement
            </Button>
          </Link>
        )}
        {(hasActivePayment || isFreeTier) && (
          <Link to="/formation">
            <Button variant="outline" className="w-full rounded-xl gap-2">
              <BookOpen className="w-4 h-4" /> Accéder à mes cours
            </Button>
          </Link>
        )}
        {!hasPendingOrder && !hasActivePayment && !isFreeTier && enrollments.length === 0 && (
          <Link to="/formation/inscription">
            <Button variant="outline" className="w-full rounded-xl gap-2">
              <GraduationCap className="w-4 h-4" /> Choisir une formation
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
};

// ── Niveau config ────────────────────────────────────────────────
const NIVEAU_CONFIG = {
  A1: { label: 'A1', desc: 'Débutant',             next: 'A2', color: 'sky',     progress: 10 },
  A2: { label: 'A2', desc: 'Élémentaire',           next: 'B1', color: 'emerald', progress: 28 },
  B1: { label: 'B1', desc: 'Intermédiaire',         next: 'B2', color: 'violet',  progress: 46 },
  B2: { label: 'B2', desc: 'Intermédiaire avancé',  next: 'C1', color: 'amber',   progress: 64 },
  C1: { label: 'C1', desc: 'Avancé',                next: 'C2', color: 'orange',  progress: 82 },
  C2: { label: 'C2', desc: 'Maîtrise',              next: null,  color: 'red',    progress: 100 },
};

const NIVEAU_TAILWIND = {
  sky:     { bg: 'bg-sky-100',     text: 'text-sky-700',     border: 'border-sky-300',     bar: 'bg-sky-500'     },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300', bar: 'bg-emerald-500' },
  violet:  { bg: 'bg-violet-100',  text: 'text-violet-700',  border: 'border-violet-300',  bar: 'bg-violet-500'  },
  amber:   { bg: 'bg-amber-100',   text: 'text-amber-700',   border: 'border-amber-300',   bar: 'bg-amber-500'   },
  orange:  { bg: 'bg-orange-100',  text: 'text-orange-700',  border: 'border-orange-300',  bar: 'bg-orange-500'  },
  red:     { bg: 'bg-red-100',     text: 'text-red-700',     border: 'border-red-300',      bar: 'bg-red-500'     },
};

const NIVEAUX_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

// ── Level roadmap for student ────────────────────────────────────
const LevelRoadmap = ({ currentLevel }) => {
  const current = NIVEAUX_ORDER.indexOf(currentLevel);
  return (
    <div className="flex items-center gap-1 mt-3">
      {NIVEAUX_ORDER.map((n, i) => {
        const cfg = NIVEAU_CONFIG[n];
        const tw = NIVEAU_TAILWIND[cfg.color];
        const isDone = i < current;
        const isCurrent = i === current;
        return (
          <React.Fragment key={n}>
            <div className={`relative flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold border-2 transition-all ${
              isCurrent ? `${tw.bg} ${tw.text} ${tw.border} scale-125 shadow-md` :
              isDone    ? 'bg-emerald-500 text-white border-emerald-500' :
                          'bg-white text-slate-300 border-slate-200'
            }`}>
              {isDone ? '✓' : n}
              {isCurrent && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-white animate-pulse" />
              )}
            </div>
            {i < NIVEAUX_ORDER.length - 1 && (
              <div className={`h-0.5 w-3 rounded-full ${isDone ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ── Niveau banner card ───────────────────────────────────────────
const NiveauBanner = ({ niveau, currentCourse }) => {
  const cfg = NIVEAU_CONFIG[niveau];
  if (!cfg) return null;
  const tw = NIVEAU_TAILWIND[cfg.color];
  return (
    <div className={`rounded-2xl border ${tw.border} ${tw.bg} p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4`}>
      {/* Badge niveau */}
      <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-white border-2 ${tw.border} shadow-sm flex-shrink-0`}>
        <span className={`text-2xl font-black ${tw.text}`}>{cfg.label}</span>
        <Star className={`w-3 h-3 ${tw.text} mt-0.5`} />
      </div>

      {/* Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`font-bold text-base ${tw.text}`}>Niveau {cfg.label} — {cfg.desc}</span>
        </div>
        {currentCourse && (
          <p className="text-sm text-slate-600 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Cours actuel : <span className="font-semibold">{currentCourse}</span>
          </p>
        )}
        {/* Roadmap */}
        <LevelRoadmap currentLevel={niveau} />
      </div>

      {/* Next level */}
      {cfg.next && (
        <div className="flex flex-col items-center text-center shrink-0">
          <span className="text-xs text-slate-500 mb-1">Prochain niveau</span>
          <div className={`px-3 py-1 rounded-full border-2 ${tw.border} bg-white ${tw.text} font-bold text-sm flex items-center gap-1`}>
            {cfg.next} <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main component ───────────────────────────────────────────────
const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';
  const [enrollments, setEnrollments] = useState([]);
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [enrollRes, ordersRes] = await Promise.allSettled([
        pb.collection('course_enrollments').getFullList({
          filter: `user_id = "${currentUser.id}"`,
          expand: 'course_id',
          sort: '-updated',
          requestKey: null,
        }),
        pb.collection('orders').getFullList({
          filter: `user_id = "${currentUser.id}"`,
          sort: '-created',
          requestKey: null,
        }),
      ]);
      if (enrollRes.status === 'fulfilled') setEnrollments(enrollRes.value);
      if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Keep backward compat alias
  const fetchEnrollments = fetchData;

  // ── Stats ──────────────────────────────────────────────────────
  const totalCourses     = enrollments.length;
  const completedCourses = enrollments.filter(e => e.complete || e.progression === 100).length;
  const averageProgress  = totalCourses > 0
    ? Math.round(enrollments.reduce((sum, e) => sum + (e.progression || 0), 0) / totalCourses)
    : 0;
  const totalMinutes = enrollments.reduce((sum, e) => {
    const duration = e.expand?.course_id?.duree || 0;
    const progress = (e.progression || 0) / 100;
    return sum + (duration * progress);
  }, 0);
  const totalHours = Math.round(totalMinutes / 60);

  // Niveau from user profile
  const niveau       = currentUser?.Level || null;
  const currentCourse = currentUser?.current_course || null;

  // Recent activity
  const recentActivities = enrollments.slice(0, 5).map(e => ({
    id: e.id,
    title: e.expand?.course_id?.titre || 'Formation',
    description: e.complete ? t('studentDashboard.completed') || 'Terminé' : `${e.progression || 0}%`,
    date: e.updated,
    icon: e.complete ? CheckCircle : PlayCircle,
    color: e.complete ? 'green' : 'indigo',
    actionLink: `/course/${e.course_id}`,
    actionLabel: t('studentDashboard.continueLearning') || 'Continuer',
  }));

  // Shortcuts
  const shortcuts = [
    { label: t('studentDashboard.shortcuts.browse') || 'Catalogue',  description: t('studentDashboard.shortcuts.browseDesc') || 'Découvrir de nouvelles formations', icon: BookOpen,  path: '/courses',            color: 'indigo' },
    { label: t('studentDashboard.shortcuts.store') || 'Boutique',    description: t('studentDashboard.shortcuts.storeDesc') || 'Ressources numériques',              icon: ShoppingBag, path: '/store',             color: 'purple' },
    { label: t('studentDashboard.shortcuts.studio') || 'Studio',     description: t('studentDashboard.shortcuts.studioDesc') || 'Réserver un espace',                icon: Mic2,       path: '/studio-reservation', color: 'teal'   },
  ];

  const inProgressCourses = enrollments.filter(e => !e.complete && (e.progression || 0) < 100).slice(0, 3);

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12
    ? (t('studentDashboard.goodMorning') || 'Bonjour')
    : hour < 18
      ? (t('studentDashboard.goodAfternoon') || 'Bon après-midi')
      : (t('studentDashboard.goodEvening') || 'Bonsoir');

  return (
    <>
      <Helmet>
        <title>{t('Dashboard') || 'Tableau de bord'} - IWS Smart Platform</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50/50" dir={isRtl ? 'rtl' : 'ltr'}>
        <Header />

        <main className="flex-1 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* ── Welcome header ──────────────────────────────── */}
            <div className="mb-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                      {greeting},{' '}
                      <span className="text-indigo-600">{currentUser?.prenom || currentUser?.name}</span> 👋
                    </h1>
                    {/* Niveau badge inline */}
                    {niveau && (() => {
                      const cfg = NIVEAU_CONFIG[niveau];
                      const tw = NIVEAU_TAILWIND[cfg?.color || 'sky'];
                      return (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border-2 ${tw.bg} ${tw.text} ${tw.border} shadow-sm`}>
                          <Star className="w-3.5 h-3.5" /> Niveau {niveau}
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-slate-500">
                    {t('studentDashboard.subtitle') || "Voici un aperçu de votre parcours d'apprentissage."}
                  </p>
                </div>
                {totalCourses > 0 && (
                  <Link to="/courses">
                    <Button size="sm" variant="outline" className="gap-2 shrink-0">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Découvrir plus de cours
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* ── Niveau banner (if level set) ─────────────────── */}
            {niveau && (
              <div className="mb-6">
                <NiveauBanner niveau={niveau} currentCourse={currentCourse} />
              </div>
            )}

            {/* ── Ma Formation card ─────────────────────────────── */}
            <div className="mb-8">
              <FormationStatusCard
                currentUser={currentUser}
                enrollments={enrollments}
                orders={orders}
              />
            </div>

            {/* ── Stats grid ───────────────────────────────────── */}
            <div className="dash-grid-bento mb-8">
              <DashboardStats
                title={t('studentDashboard.enrolledCourses') || 'Cours inscrits'}
                value={loading ? '-' : totalCourses}
                icon={BookOpen}
                color="indigo"
                description={t('studentDashboard.enrolledDesc') || 'Total des inscriptions actives'}
              />
              <DashboardStats
                title={t('studentDashboard.avgProgress') || 'Progression moyenne'}
                value={loading ? '-' : `${averageProgress}%`}
                icon={TrendingUp}
                color="blue"
                description={t('studentDashboard.avgProgressDesc') || 'Sur l\'ensemble des cours'}
              />
              <DashboardStats
                title={t('studentDashboard.hoursLearned') || 'Heures apprises'}
                value={loading ? '-' : totalHours}
                icon={Clock}
                color="purple"
                description={t('studentDashboard.hoursLearnedDesc') || 'Temps estimé passé'}
              />
              <DashboardStats
                title={t('studentDashboard.completed') || 'Terminés'}
                value={loading ? '-' : completedCourses}
                icon={CheckCircle}
                color="green"
                description={t('studentDashboard.completedDesc') || 'Cours terminés avec succès'}
              />
            </div>

            {/* ── Main layout ──────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">

                {/* Continue Learning */}
                <Card className="dash-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <PlayCircle className="w-5 h-5 text-indigo-500" />
                      {t('studentDashboard.continueLearning') || 'Continuer l\'apprentissage'}
                    </CardTitle>
                    <Link to="/student/progress" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                      {t('studentDashboard.viewAll') || 'Voir tout'} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        {[1, 2].map(i => (
                          <div key={i} className="flex items-center gap-4">
                            <Skeleton className="w-20 h-16 rounded-xl" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-2 w-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : inProgressCourses.length === 0 ? (
                      <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                          <BookOpen className="w-7 h-7 text-indigo-400" />
                        </div>
                        <p className="text-slate-700 font-semibold mb-1">{t('studentDashboard.noCourses') || 'Aucun cours en cours'}</p>
                        <p className="text-sm text-slate-500 mb-4">{t('studentDashboard.startCourse') || 'Commencez un cours pour le voir ici.'}</p>
                        <Link to="/courses">
                          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                            <BookOpen className="w-4 h-4" />
                            {t('studentDashboard.browseCatalog') || 'Explorer le catalogue'}
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {inProgressCourses.map((enrollment) => {
                          const prog = enrollment.progression || 0;
                          return (
                            <Link
                              key={enrollment.id}
                              to={`/course/${enrollment.course_id}`}
                              className="group block p-4 rounded-xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-md transition-all duration-200"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600 group-hover:scale-110 transition-transform">
                                    <PlayCircle className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-slate-900 line-clamp-1">
                                      {enrollment.expand?.course_id?.titre || 'Formation'}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                      {enrollment.expand?.course_id?.categorie || 'Général'} · {enrollment.expand?.course_id?.duree || 0} min
                                    </p>
                                  </div>
                                </div>
                                <span className={`text-sm font-bold ${prog >= 80 ? 'text-emerald-600' : prog >= 40 ? 'text-indigo-600' : 'text-amber-600'}`}>
                                  {prog}%
                                </span>
                              </div>
                              <Progress
                                value={prog}
                                className={`h-2 bg-slate-100 ${prog >= 80 ? '[&>div]:bg-emerald-500' : prog >= 40 ? '[&>div]:bg-indigo-500' : '[&>div]:bg-amber-500'}`}
                              />
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Shortcuts */}
                <QuickShortcuts shortcuts={shortcuts} />
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <RecentActivity
                  activities={recentActivities}
                  title={t('studentDashboard.learningActivity') || 'Activité d\'apprentissage'}
                />
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default StudentDashboard;
