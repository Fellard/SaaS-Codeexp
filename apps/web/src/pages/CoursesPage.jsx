
import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import DashboardLayout from '@/components/DashboardLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen, GraduationCap, Languages, Monitor, Code2,
  PlayCircle, CheckCircle2, Lock, Star, Clock, CreditCard,
  AlertCircle, Zap, Play, Globe, TrendingUp,
} from 'lucide-react';

// ── Config de langue ─────────────────────────────────────────────────────────
const LANGUE_CFG = {
  Francais:  { label: 'Français',  flag: '🇫🇷', gradient: 'from-blue-600 to-blue-400',      lightBg: 'bg-blue-50',    border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700',          bar: '[&>div]:bg-blue-500',    icon: 'text-blue-600'    },
  Anglais:   { label: 'Anglais',   flag: '🇬🇧', gradient: 'from-red-600 to-rose-400',       lightBg: 'bg-red-50',     border: 'border-red-200',    badge: 'bg-red-100 text-red-700',            bar: '[&>div]:bg-red-500',     icon: 'text-red-600'     },
  Arabe:     { label: 'Arabe',     flag: '🌍',  gradient: 'from-emerald-600 to-teal-400',   lightBg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700',    bar: '[&>div]:bg-emerald-500', icon: 'text-emerald-600' },
  Espagnole: { label: 'Espagnol',  flag: '🇪🇸', gradient: 'from-yellow-500 to-orange-400',  lightBg: 'bg-yellow-50',  border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700',      bar: '[&>div]:bg-yellow-500',  icon: 'text-yellow-600'  },
  default:   { label: 'Autre',     flag: '📚',  gradient: 'from-violet-600 to-purple-400',  lightBg: 'bg-violet-50',  border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700',      bar: '[&>div]:bg-violet-500',  icon: 'text-violet-600'  },
};

// ── Config de programme ──────────────────────────────────────────────────────
const PROGRAMME_CFG = {
  langues:       { label: 'Langues',       icon: Languages, gradient: 'from-blue-600 to-sky-500',      bg: 'bg-blue-50',    border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700'    },
  informatique:  { label: 'Informatique',  icon: Monitor,   gradient: 'from-green-600 to-emerald-500', bg: 'bg-green-50',   border: 'border-green-200',  badge: 'bg-green-100 text-green-700'  },
  programmation: { label: 'Programmation', icon: Code2,     gradient: 'from-purple-600 to-indigo-500', bg: 'bg-purple-50',  border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700' },
};

// ── Normalisation de la langue ───────────────────────────────────────────────
const normalizeLang = (raw = '') => {
  const s = raw.toLowerCase().trim();
  if (s.includes('fran') || s === 'fr') return 'Francais';
  if (s.includes('angl') || s.includes('engl') || s === 'en') return 'Anglais';
  if (s.includes('arab') || s === 'ar') return 'Arabe';
  if (s.includes('esp') || s.includes('span') || s === 'es') return 'Espagnole';
  return 'default';
};

const FREE_COURSE_LIMIT = 3;

// ─────────────────────────────────────────────────────────────────────────────
// SOUS-COMPOSANTS
// ─────────────────────────────────────────────────────────────────────────────

// Carte individuelle d'un cours dans un groupe de langue
const CourseRow = ({ enrollment, index, orders, currentUser, niveau, programme, navigate }) => {
  const course   = enrollment.expand?.course_id || {};
  const title    = course.titre || course.title || 'Cours';
  const prog     = enrollment.progression || 0;
  const done     = enrollment.complete || prog >= 100;
  const prix     = course.prix ?? course.price ?? 0;
  const isFreeCourse = prix === 0;
  const cNiv     = course.niveau || course.level || course.Level || niveau || '';
  const cSec     = course.section || programme || '';
  const secCfg   = cSec ? PROGRAMME_CFG[cSec] : null;
  const SecIcon  = secCfg?.icon || BookOpen;
  const duration = course.duree || course.duration || 0;
  const rawLang  = course.cours_nom || course.langue || '';
  const langKey  = normalizeLang(rawLang);
  const langCfg  = LANGUE_CFG[langKey] || LANGUE_CFG.default;

  // Déterminer si accessible
  const hasPackOrder   = orders.some(o => o.status === 'completed' && o.order_type === 'pack_12');
  const isAdmin        = currentUser?.role === 'admin' || currentUser?.isAdmin;
  const courseId       = typeof enrollment.course_id === 'string' && enrollment.course_id.startsWith('virtual_') ? null : enrollment.course_id;
  const courseTitle    = course.titre || course.title || '';
  const hasCourseOrder = orders.some(o =>
    o.status === 'completed' &&
    (o.course_id === courseId || (courseTitle && o.note?.includes(courseTitle)))
  );
  const accessible = isAdmin || hasPackOrder || index < FREE_COURSE_LIMIT || hasCourseOrder;
  const locked = !accessible;

  const viewPath = courseId
    ? `/etudiant/dashboard/courses/${courseId}/view`
    : '/etudiant/dashboard/courses/view';

  return (
    <div className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
      locked ? 'bg-muted/30 border-border opacity-60'
      : done  ? 'bg-emerald-50/60 border-emerald-200'
              : 'bg-card border-border hover:border-primary/30 hover:shadow-sm'
    }`}>
      {/* Icône état */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
        locked ? 'bg-muted text-muted-foreground'
        : done  ? 'bg-emerald-100 text-emerald-600'
               : `${langCfg.lightBg} ${langCfg.icon}`
      }`}>
        {locked ? <Lock className="w-4 h-4" />
         : done  ? <CheckCircle2 className="w-4 h-4" />
                 : <PlayCircle className="w-4 h-4" />}
      </div>

      {/* Info cours */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{title}</p>
        <div className="flex flex-wrap items-center gap-2 mt-0.5">
          {cNiv && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${langCfg.badge}`}>{cNiv}</span>
          )}
          {secCfg && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${secCfg.badge}`}>{secCfg.label}</span>
          )}
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isFreeCourse ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
            {isFreeCourse ? '✓ Gratuit' : `${prix} MAD`}
          </span>
          {duration > 0 && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" /> {duration} min
            </span>
          )}
        </div>
        {!locked && (
          <div className="flex items-center gap-2 mt-1.5">
            <Progress value={prog} className={`h-1.5 flex-1 bg-muted ${langCfg.bar}`} />
            <span className="text-[10px] font-bold text-muted-foreground w-8 text-right">{prog}%</span>
          </div>
        )}
      </div>

      {/* Action */}
      {locked ? (
        <Button
          size="sm"
          onClick={() => navigate('/etudiant/dashboard/orders')}
          className="h-8 px-3 text-xs gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold shrink-0"
        >
          <CreditCard className="w-3 h-3" /> Payer
        </Button>
      ) : done ? (
        <span className="text-xs font-bold text-emerald-600 shrink-0">✓ Terminé</span>
      ) : (
        <Button
          size="sm"
          onClick={() => navigate(viewPath)}
          className="h-8 px-3 text-xs gap-1.5 bg-primary text-primary-foreground font-bold shrink-0 whitespace-nowrap"
        >
          <Play className="w-3.5 h-3.5" />
          {prog > 0 ? 'Continuer' : 'Commencer'}
        </Button>
      )}
    </div>
  );
};

// Groupe par langue (collapsible)
const LanguageGroup = ({ langue, enrollments, orders, currentUser, niveau, programme, navigate }) => {
  const cfg     = LANGUE_CFG[langue] || LANGUE_CFG.default;
  const total   = enrollments.length;
  const done    = enrollments.filter(e => e.complete || (e.progression || 0) >= 100).length;
  const avgProg = total > 0
    ? Math.round(enrollments.reduce((s, e) => s + (e.progression || 0), 0) / total)
    : 0;
  const [open, setOpen] = useState(true);

  return (
    <div className={`rounded-2xl border-2 overflow-hidden ${cfg.border} shadow-sm`}>
      {/* En-tête */}
      <div
        className={`bg-gradient-to-r ${cfg.gradient} px-5 py-4 flex items-center justify-between cursor-pointer select-none`}
        onClick={() => setOpen(o => !o)}
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
          <div className="flex flex-col items-end gap-1">
            <span className="text-white font-black text-lg">{avgProg}%</span>
            <div className="w-20 h-1.5 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${avgProg}%` }} />
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold">
            {open ? '−' : '+'}
          </div>
        </div>
      </div>

      {/* Corps */}
      {open && (
        <div className={`p-4 space-y-2.5 ${cfg.lightBg}`}>
          {enrollments.map((e, idx) => (
            <CourseRow
              key={e.id}
              enrollment={e}
              index={idx}
              orders={orders}
              currentUser={currentUser}
              niveau={niveau}
              programme={programme}
              navigate={navigate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

const CoursesPage = () => {
  const { currentUser }               = useAuth();
  const navigate                      = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [matchedCourses, setMatchedCourses] = useState([]);
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState('all'); // all | active | done | locked

  const programme     = currentUser?.section;
  const progCfg       = programme ? PROGRAMME_CFG[programme] : null;
  const niveau        = currentUser?.Level;
  const currentCourse = currentUser?.current_course;
  const ProgIcon      = progCfg?.icon || GraduationCap;

  useEffect(() => {
    if (!currentUser) return;
    const fetchAll = async () => {
      try {
        const [enrRes, ordRes] = await Promise.allSettled([
          pb.collection('course_enrollments').getFullList({
            filter:    `user_id="${currentUser.id}"`,
            expand:    'course_id',
            sort:      '-updated',
            requestKey: null,
          }),
          pb.collection('orders').getFullList({
            filter:    `user_id="${currentUser.id}"`,
            sort:      '-created',
            requestKey: null,
          }),
        ]);

        const enrList = enrRes.status === 'fulfilled' ? enrRes.value : [];
        const ordList = ordRes.status === 'fulfilled' ? ordRes.value : [];
        setOrders(ordList);

        // Cours correspondant au profil étudiant
        let profCourses = [];
        if (programme || currentCourse || niveau) {
          try {
            const allCourses = await pb.collection('courses').getFullList({
              sort:      '-created',
              requestKey: null,
            });
            profCourses = allCourses.filter(c => {
              const cSec  = c.section || '';
              const cLang = normalizeLang(c.langue || c.cours_nom || c.cours || '');
              const cNiv  = (c.niveau || c.level || c.Level || '').toLowerCase();
              const secMatch  = !programme || cSec === programme;
              const langMatch = !currentCourse || cLang === normalizeLang(currentCourse);
              const nivMatch  = !niveau || cNiv === niveau.toLowerCase();
              return secMatch && langMatch && nivMatch;
            });
          } catch { /* ignore */ }
        }

        // Fusionner les enrollments avec les cours du profil
        const enrolledIds     = new Set(enrList.map(e => e.course_id));
        const hasPaid         = ordList.some(o => o.status === 'completed');
        const newEnrollments  = [...enrList];

        for (const course of profCourses) {
          if (!enrolledIds.has(course.id)) {
            if (hasPaid) {
              try {
                const created = await pb.collection('course_enrollments').create({
                  user_id:    currentUser.id,
                  course_id:  course.id,
                  progression: 0,
                  complete:   false,
                }, { requestKey: null });
                newEnrollments.push({ ...created, expand: { course_id: course } });
              } catch {
                newEnrollments.push({
                  id: `virtual_${course.id}`, user_id: currentUser.id, course_id: course.id,
                  progression: 0, complete: false, expand: { course_id: course },
                });
              }
            } else {
              newEnrollments.push({
                id: `virtual_${course.id}`, user_id: currentUser.id, course_id: course.id,
                progression: 0, complete: false, expand: { course_id: course },
              });
            }
          }
        }

        setEnrollments(newEnrollments);
        setMatchedCourses(profCourses);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [currentUser?.id]);

  // ── Groupement par langue ────────────────────────────────────────────────
  const groupedByLang = useMemo(() => {
    const toFilter = filter === 'all' ? enrollments
      : filter === 'active' ? enrollments.filter(e => !e.complete && (e.progression || 0) < 100 && (e.progression || 0) > 0)
      : filter === 'done'   ? enrollments.filter(e =>  e.complete || (e.progression || 0) >= 100)
      :                       enrollments; // locked filter handled in CourseRow

    const groups = {};
    toFilter.forEach(e => {
      const course = e.expand?.course_id || {};
      const raw    = course.cours_nom || course.langue || currentCourse || '';
      const lang   = normalizeLang(raw);
      if (!groups[lang]) groups[lang] = [];
      groups[lang].push(e);
    });
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  }, [enrollments, filter, currentCourse]);

  // ── Stats rapides ────────────────────────────────────────────────────────
  const totalCourses  = enrollments.length;
  const doneCourses   = enrollments.filter(e => e.complete || (e.progression || 0) >= 100).length;
  const avgProgress   = totalCourses > 0
    ? Math.round(enrollments.reduce((s, e) => s + (e.progression || 0), 0) / totalCourses)
    : 0;

  const hasPendingOrder = orders.some(o => o.status === 'pending');
  const hasActivePayment = orders.some(o => o.status === 'completed' || o.status === 'paid');

  return (
    <DashboardLayout>
      <Helmet><title>Mes Formations — IWS LAAYOUNE</title></Helmet>

      <div className="space-y-6 max-w-4xl mx-auto">

        {/* ── Alerte paiement en attente ─────────────────────────────── */}
        {!loading && hasPendingOrder && (
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex-1">
              <p className="font-bold text-amber-800">Paiement en attente</p>
              <p className="text-sm text-amber-700 mt-0.5">
                Vos cours sont verrouillés. Effectuez le paiement pour accéder à votre formation.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate('/etudiant/dashboard/orders')}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl gap-2 shrink-0"
            >
              <CreditCard className="w-4 h-4" /> Voir mes commandes
            </Button>
          </div>
        )}

        {/* ── Bannière programme ─────────────────────────────────────── */}
        {(programme || currentCourse) && (
          <div className={`rounded-2xl border-2 overflow-hidden ${progCfg?.border || 'border-border'}`}>
            {progCfg && <div className={`h-1.5 bg-gradient-to-r ${progCfg.gradient}`} />}
            <div className={`p-5 ${progCfg?.bg || 'bg-muted/30'}`}>
              <div className="flex flex-wrap items-center gap-4 justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${progCfg?.gradient || 'from-primary to-primary'} flex items-center justify-center shadow-sm`}>
                    <ProgIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {progCfg && (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${progCfg.badge}`}>{progCfg.label}</span>
                      )}
                      {niveau && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1">
                          <Star className="w-3 h-3" /> Niveau {niveau}
                        </span>
                      )}
                    </div>
                    {currentCourse && (
                      <p className="font-bold text-foreground mt-1">{currentCourse}</p>
                    )}
                  </div>
                </div>
                {hasPendingOrder ? (
                  <Badge variant="outline" className="border-amber-400 text-amber-700 bg-amber-50 gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> En attente de paiement
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-emerald-400 text-emerald-700 bg-emerald-50 gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Formation active
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Stats rapides ──────────────────────────────────────────── */}
        {!loading && totalCourses > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: BookOpen,     label: 'Cours inscrits',  value: totalCourses,     bg: 'bg-blue-100',    text: 'text-blue-600'    },
              { icon: TrendingUp,   label: 'Progression moy.', value: `${avgProgress}%`, bg: 'bg-emerald-100', text: 'text-emerald-600' },
              { icon: CheckCircle2, label: 'Terminés',        value: doneCourses,      bg: 'bg-violet-100',  text: 'text-violet-600'  },
            ].map(s => (
              <div key={s.label} className="bg-card rounded-2xl border border-border p-4 shadow-sm flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                  <s.icon className={`w-5 h-5 ${s.text}`} />
                </div>
                <div>
                  <p className={`text-2xl font-black ${s.text}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── En-tête section cours ──────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Mes cours par langue
            {!loading && <span className="text-sm font-normal text-muted-foreground ml-1">({totalCourses})</span>}
          </h2>
          {/* Filtres */}
          <div className="flex gap-2">
            {[
              { key: 'all',    label: 'Tous'     },
              { key: 'active', label: 'En cours' },
              { key: 'done',   label: 'Terminés' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === f.key
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Cours groupés par langue ───────────────────────────────── */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="rounded-2xl border-2 border-border overflow-hidden">
                <Skeleton className="h-16 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : groupedByLang.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-12 text-center">
            <GraduationCap className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
            <p className="font-bold text-foreground text-lg mb-1">
              {enrollments.length === 0 ? 'Aucun cours inscrit' : 'Aucun cours dans cette catégorie'}
            </p>
            <p className="text-muted-foreground text-sm mb-6">
              {enrollments.length === 0
                ? 'Inscrivez-vous à une formation pour voir vos cours ici.'
                : 'Essayez un autre filtre.'}
            </p>
            {enrollments.length === 0 && (
              <Link to="/formation/inscription">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl gap-2">
                  <Zap className="w-4 h-4" /> Choisir une formation
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {groupedByLang.map(([lang, langEnrollments]) => (
              <LanguageGroup
                key={lang}
                langue={lang}
                enrollments={langEnrollments}
                orders={orders}
                currentUser={currentUser}
                niveau={niveau}
                programme={programme}
                navigate={navigate}
              />
            ))}
          </div>
        )}

        {/* ── CTA : programme défini mais 0 cours ───────────────────── */}
        {!loading && programme && enrollments.length === 0 && (
          <div className={`rounded-2xl border-2 overflow-hidden ${progCfg?.border || 'border-border'}`}>
            {progCfg && <div className={`h-1 bg-gradient-to-r ${progCfg.gradient}`} />}
            <div className="p-6 flex flex-col sm:flex-row items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${progCfg?.gradient || 'from-primary to-primary'} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <ProgIcon className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="font-bold text-foreground">
                  {currentCourse ? `${currentCourse} — Niveau ${niveau || ''}` : `Formation ${progCfg?.label || programme}`}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Votre cours est prêt — cliquez pour commencer
                </p>
              </div>
              <Button
                onClick={() => navigate('/etudiant/dashboard/courses/view')}
                className={`font-bold rounded-xl gap-2 bg-gradient-to-r ${progCfg?.gradient || 'from-primary to-primary'} text-white shrink-0`}
              >
                <Play className="w-4 h-4" /> Accéder au cours
              </Button>
            </div>
          </div>
        )}

        {/* ── CTA : pas de programme du tout ────────────────────────── */}
        {!loading && !programme && !currentCourse && enrollments.length === 0 && (
          <div className="text-center bg-card rounded-2xl border border-border p-10">
            <GraduationCap className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">Commencez votre parcours</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Choisissez votre programme (Langues, Informatique ou Programmation) pour accéder à vos cours.
            </p>
            <Link to="/formation/inscription">
              <Button className="bg-accent hover:bg-accent/90 text-primary font-bold px-8 rounded-xl gap-2">
                <GraduationCap className="w-4 h-4" /> Choisir ma formation
              </Button>
            </Link>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default CoursesPage;
