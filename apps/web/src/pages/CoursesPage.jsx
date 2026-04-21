
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import DashboardLayout from '@/components/DashboardLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, GraduationCap, Languages, Monitor, Code2,
  PlayCircle, CheckCircle2, Lock, Star, Clock, CreditCard,
  AlertCircle, ArrowRight, Zap, Play,
} from 'lucide-react';

// ── Programme config ─────────────────────────────────────────────
const PROGRAMME_CFG = {
  langues:       { label: 'Langues',       icon: Languages, gradient: 'from-blue-600 to-sky-500',     bg: 'bg-blue-50',    border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700'    },
  informatique:  { label: 'Informatique',  icon: Monitor,   gradient: 'from-green-600 to-emerald-500', bg: 'bg-green-50',  border: 'border-green-200', badge: 'bg-green-100 text-green-700'  },
  programmation: { label: 'Programmation', icon: Code2,     gradient: 'from-purple-600 to-indigo-500', bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700' },
};

const ENROLL_STATUS = {
  active:   { label: 'En cours',  cls: 'bg-blue-100   text-blue-700   border-blue-300',   icon: PlayCircle   },
  done:     { label: 'Terminé',   cls: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: CheckCircle2 },
  locked:   { label: 'Verrouillé', cls: 'bg-slate-100 text-slate-600  border-slate-200',  icon: Lock         },
  inscrit:  { label: 'Inscrit',   cls: 'bg-purple-100 text-purple-700 border-purple-300', icon: GraduationCap },
};

const CoursesPage = () => {
  const { currentUser }             = useAuth();
  const navigate                    = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [matchedCourses, setMatchedCourses] = useState([]); // courses matching student profile
  const [orders, setOrders]          = useState([]);
  const [loading, setLoading]        = useState(true);
  const [filter, setFilter]          = useState('all'); // all | active | done

  const programme     = currentUser?.section;
  const progCfg       = programme ? PROGRAMME_CFG[programme] : null;
  const niveau        = currentUser?.Level;
  const currentCourse = currentUser?.current_course;
  const ProgIcon      = progCfg?.icon || GraduationCap;

  useEffect(() => {
    if (!currentUser) return;
    const fetchAll = async () => {
      try {
        // 1. Fetch existing enrollments
        const [enrRes, ordRes] = await Promise.allSettled([
          pb.collection('course_enrollments').getFullList({
            filter: `user_id="${currentUser.id}"`,
            expand: 'course_id',
            sort: '-updated',
            requestKey: null,
          }),
          pb.collection('orders').getFullList({
            filter: `user_id="${currentUser.id}"`,
            sort: '-created',
            requestKey: null,
          }),
        ]);

        const enrList = enrRes.status === 'fulfilled' ? enrRes.value : [];
        const ordList = ordRes.status === 'fulfilled' ? ordRes.value : [];
        setOrders(ordList);

        // 2. Fetch courses matching student's profile (section + cours_nom + niveau)
        let profCourses = [];
        if (programme || currentCourse || niveau) {
          try {
            const allCourses = await pb.collection('courses').getFullList({
              sort: '-created',
              requestKey: null,
            });

            // Match: same section AND (same cours_nom OR title contains currentCourse) AND (same niveau OR level)
            // Flexible language matching: "Arabe Marocain" matches "Arabe", "Anglais des affaires" matches "Anglais"
            profCourses = allCourses.filter(c => {
              const cSec   = c.section || '';
              const cNom   = (c.cours_nom || c.cours || '').toLowerCase().trim();
              const cNiv   = (c.niveau || c.level || c.Level || '').toLowerCase();
              const cTitle = (c.titre || c.title || '').toLowerCase();
              const curNom = (currentCourse || '').toLowerCase().trim();

              const secMatch = !programme || cSec === programme;
              // Flexible match: exact, or one contains the other (handles "Arabe Marocain" ↔ "Arabe")
              const nomMatch = !curNom
                || cNom === curNom
                || cTitle.includes(curNom)
                || curNom.includes(cNom)
                || cNom.split(' ')[0] === curNom.split(' ')[0]; // first word match: "anglais" === "anglais"
              const nivMatch = !niveau || cNiv === niveau.toLowerCase();

              return secMatch && nomMatch && nivMatch;
            });
          } catch { /* courses collection may be empty */ }
        }

        // 3. Merge: auto-create enrollment records for matched courses that don't have one
        const enrolledCourseIds = new Set(enrList.map(e => e.course_id));
        const hasPaid = ordList.some(o => o.status === 'completed');

        const newEnrollments = [...enrList];

        for (const course of profCourses) {
          if (!enrolledCourseIds.has(course.id)) {
            // Course matches but not enrolled — create enrollment record if paid, or add as virtual
            if (hasPaid) {
              try {
                const newEnr = await pb.collection('course_enrollments').create({
                  user_id: currentUser.id,
                  course_id: course.id,
                  progression: 0,
                  complete: false,
                }, { requestKey: null });
                newEnrollments.push({ ...newEnr, expand: { course_id: course } });
              } catch {
                // Add as virtual enrollment (no DB record)
                newEnrollments.push({
                  id: `virtual_${course.id}`,
                  user_id: currentUser.id,
                  course_id: course.id,
                  progression: 0,
                  complete: false,
                  expand: { course_id: course },
                });
              }
            } else {
              // Not paid — show as locked virtual enrollment
              newEnrollments.push({
                id: `virtual_${course.id}`,
                user_id: currentUser.id,
                course_id: course.id,
                progression: 0,
                complete: false,
                expand: { course_id: course },
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

  const hasPendingOrder = orders.some(o => o.status === 'pending');

  const isCourseAccessible = (e) => {
    const course   = e.expand?.course_id;
    const prix     = course?.prix ?? course?.price ?? 0;
    const courseId = e.course_id || course?.id;
    const courseTitle = course?.titre || course?.title || '';

    // Cours gratuit → toujours accessible
    if (prix === 0) return true;

    // Commande complétée pour CE cours spécifiquement
    const hasPaidForCourse = orders.some(o =>
      o.status === 'completed' &&
      (o.course_id === courseId || (courseTitle && o.note?.includes(courseTitle)))
    );
    return hasPaidForCourse;
  };

  const getEnrollStatus = (e) => {
    const accessible = isCourseAccessible(e);
    if (!accessible) return 'locked';
    if (e.complete || e.progression >= 100) return 'done';
    if (e.progression > 0) return 'active';
    return 'inscrit';
  };

  const filtered = filter === 'all'
    ? enrollments
    : filter === 'active'
      ? enrollments.filter(e => !e.complete && (e.progression || 0) < 100)
      : enrollments.filter(e => e.complete || (e.progression || 0) >= 100);

  return (
    <DashboardLayout>
      <Helmet><title>Mes Formations — IWS LAAYOUNE</title></Helmet>

      <div className="space-y-6 max-w-4xl mx-auto">

        {/* ── Pending payment alert ────────────────────────── */}
        {!loading && hasPendingOrder && (
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex-1">
              <p className="font-bold text-amber-800">Paiement en attente</p>
              <p className="text-sm text-amber-700 mt-0.5">
                Vos cours sont verrouillés. Effectuez le paiement pour accéder à votre formation.
              </p>
            </div>
            <Link to="/dashboard/orders">
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl gap-2 shrink-0">
                <CreditCard className="w-4 h-4" /> Voir mes commandes
              </Button>
            </Link>
          </div>
        )}

        {/* ── Programme banner ─────────────────────────────── */}
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
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${progCfg.badge}`}>
                          {progCfg.label}
                        </span>
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

        {/* ── Course list ──────────────────────────────────── */}
        <Card className="border border-border">
          <CardHeader className="pb-3 flex flex-row items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Mes Cours
              {!loading && <span className="text-sm font-normal text-muted-foreground ml-1">({enrollments.length})</span>}
              {!loading && matchedCourses.length > 0 && enrollments.length === 0 && (
                <span className="text-xs text-amber-600 font-medium ml-2">— {matchedCourses.length} cours disponible(s)</span>
              )}
            </CardTitle>
            {/* Filter pills */}
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'Tous' },
                { key: 'active', label: 'En cours' },
                { key: 'done', label: 'Terminés' },
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
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-14">
                <BookOpen className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="font-semibold text-foreground mb-1">
                  {enrollments.length === 0 ? 'Aucun cours inscrit' : 'Aucun cours dans cette catégorie'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {enrollments.length === 0
                    ? 'Inscrivez-vous à une formation pour voir vos cours ici'
                    : 'Essayez un autre filtre'}
                </p>
                {enrollments.length === 0 && (
                  <Link to="/formation/inscription">
                    <Button className="bg-accent hover:bg-accent/90 text-primary font-bold rounded-xl gap-2">
                      <Zap className="w-4 h-4" /> Choisir une formation
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((e, idx) => {
                  const course   = e.expand?.course_id;
                  const title    = course?.titre || course?.title || 'Cours';
                  const cNom     = course?.cours_nom || currentCourse || '';
                  const cNiv     = course?.niveau || course?.level || course?.Level || niveau || '';
                  const cSec     = course?.section || programme || '';
                  const secCfg   = cSec ? PROGRAMME_CFG[cSec] : null;
                  const SecIcon  = secCfg?.icon || BookOpen;
                  const prog     = e.progression || 0;
                  const status   = getEnrollStatus(e);
                  const stCfg    = ENROLL_STATUS[status];
                  const StIcon   = stCfg.icon;
                  const locked   = status === 'locked';
                  const courseId = typeof e.course_id === 'string' && e.course_id.startsWith('virtual_') ? null : e.course_id;
                  const prix     = course?.prix ?? course?.price ?? 0;
                  const isFreeCourse = prix === 0;

                  return (
                    <div key={e.id} className={`flex items-center gap-4 p-4 transition-colors ${locked ? 'opacity-60 bg-muted/10' : 'hover:bg-muted/20'}`}>
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${
                        secCfg ? secCfg.gradient : 'from-slate-400 to-slate-300'
                      } ${locked ? 'opacity-40' : ''}`}>
                        <SecIcon className="w-5 h-5 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-bold text-foreground truncate">{title}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap text-xs mb-2">
                          {secCfg && (
                            <span className={`px-2 py-0.5 rounded-full font-semibold ${secCfg.badge}`}>{secCfg.label}</span>
                          )}
                          {cNom && <span className="text-muted-foreground">{cNom}</span>}
                          {cNiv && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">{cNiv}</span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${isFreeCourse ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                            {isFreeCourse ? '✓ Gratuit' : `${prix} MAD`}
                          </span>
                          {(course?.duree || course?.duration) > 0 && (
                            <span className="flex items-center gap-1 text-muted-foreground"><Clock className="w-3 h-3" />{course.duree || course.duration} min</span>
                          )}
                        </div>
                        {!locked && (
                          <div className="flex items-center gap-2">
                            <Progress
                              value={prog}
                              className={`h-1.5 flex-1 max-w-[180px] ${prog >= 80 ? '[&>div]:bg-emerald-500' : prog >= 40 ? '[&>div]:bg-blue-500' : '[&>div]:bg-amber-500'}`}
                            />
                            <span className={`text-xs font-bold ${prog >= 80 ? 'text-emerald-600' : prog >= 40 ? 'text-blue-600' : 'text-amber-600'}`}>
                              {prog}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Status badge + action */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <Badge variant="outline" className={`text-xs gap-1 ${stCfg.cls}`}>
                          <StIcon className="w-3 h-3" />
                          {stCfg.label}
                        </Badge>
                        {locked ? (
                          <Link to={courseId ? `/dashboard/courses/${courseId}/view` : '/dashboard/orders'}>
                            <Button size="sm" className="h-7 px-3 text-xs gap-1 bg-orange-500 hover:bg-orange-600 text-white font-bold">
                              <CreditCard className="w-3 h-3" /> Payer
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => navigate(courseId ? `/dashboard/courses/${courseId}/view` : '/dashboard/courses/view')}
                            className="h-7 px-3 text-xs gap-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                          >
                            <Play className="w-3 h-3" /> Ouvrir
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Has programme + no courses yet → direct access CTA */}
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
                onClick={() => navigate('/dashboard/courses/view')}
                className={`font-bold rounded-xl gap-2 bg-gradient-to-r ${progCfg?.gradient || 'from-primary to-primary'} text-white shrink-0`}
              >
                <Play className="w-4 h-4" /> Accéder au cours
              </Button>
            </div>
          </div>
        )}

        {/* No programme at all → CTA */}
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
