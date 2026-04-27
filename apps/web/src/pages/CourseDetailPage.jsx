import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate, Link } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useLanguage } from '@/hooks/useLanguage.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  BookOpen, Clock, Tag, CheckCircle, PlayCircle,
  ChevronLeft, Lock, Unlock, AlertCircle, Star,
  ArrowRight, RotateCcw, Headphones, GraduationCap,
  Users, Zap, ChevronRight,
} from 'lucide-react';

const LEVEL_COLORS = {
  A1: 'bg-green-100 text-green-700', A2: 'bg-lime-100 text-lime-700',
  B1: 'bg-yellow-100 text-yellow-700', B2: 'bg-orange-100 text-orange-700',
  C1: 'bg-red-100 text-red-700', C2: 'bg-purple-100 text-purple-700',
};

// ── Composant QCM interactif ──────────────────────────────────────────────────
function ExerciseQCM({ exercises, onComplete }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const ex = exercises[current];

  const handleSelect = (idx) => {
    if (revealed) return;
    setSelected(idx);
  };

  const handleValidate = () => {
    if (selected === null) return;
    const correct = selected === ex.answer;
    if (correct) setScore(s => s + 1);
    setRevealed(true);
  };

  const handleNext = () => {
    if (current + 1 >= exercises.length) {
      setDone(true);
      const pct = Math.round(((score + (selected === ex.answer ? 1 : 0)) / exercises.length) * 100);
      onComplete(pct);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setRevealed(false);
    }
  };

  const handleReset = () => {
    setCurrent(0); setSelected(null); setRevealed(false); setScore(0); setDone(false);
  };

  if (done) {
    const finalScore = score;
    const pct = Math.round((finalScore / exercises.length) * 100);
    return (
      <div className="text-center py-8">
        <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-bold mb-4 ${
          pct >= 70 ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
        }`}>{pct}%</div>
        <h3 className="text-xl font-bold mb-2">{pct >= 70 ? '🎉 Excellent !' : '📖 Continuez à pratiquer'}</h3>
        <p className="text-slate-500 mb-6">{finalScore}/{exercises.length} bonnes réponses</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="w-4 h-4" /> Recommencer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Progress bar exercices */}
      <div className="flex items-center justify-between text-sm text-slate-500 mb-1">
        <span>Question {current + 1} / {exercises.length}</span>
        <span className="font-semibold text-indigo-600">{score} correct(s)</span>
      </div>
      <Progress value={((current) / exercises.length) * 100} className="h-1.5 bg-slate-100" />

      {/* Question */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
        <p className="font-semibold text-slate-900 text-base leading-relaxed">{ex.question}</p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ex.options.map((opt, j) => {
          let cls = 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50';
          if (revealed) {
            if (j === ex.answer) cls = 'border-emerald-400 bg-emerald-50 text-emerald-800 font-semibold';
            else if (j === selected && j !== ex.answer) cls = 'border-red-300 bg-red-50 text-red-700';
            else cls = 'border-slate-100 bg-slate-50 text-slate-400 opacity-60';
          } else if (j === selected) {
            cls = 'border-indigo-400 bg-indigo-50 text-indigo-800 font-semibold';
          }
          return (
            <button key={j} onClick={() => handleSelect(j)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all text-sm ${cls} ${!revealed ? 'cursor-pointer' : 'cursor-default'}`}>
              <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-xs flex-shrink-0
                border-current">{String.fromCharCode(65 + j)}</span>
              {opt}
              {revealed && j === ex.answer && <CheckCircle className="w-4 h-4 text-emerald-600 ml-auto flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {!revealed ? (
          <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={handleValidate} disabled={selected === null}>
            Valider
          </Button>
        ) : (
          <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={handleNext}>
            {current + 1 >= exercises.length ? 'Voir le résultat' : 'Question suivante'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function CourseDetailPage() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isRtl = language === 'ar';

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState('lecon');
  const [totalEnrollments, setTotalEnrollments] = useState(0);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  // ── Normalize DB field names (FR → EN aliases) ────────────────
  const normalizeCourse = (c) => ({
    ...c,
    title:       c.titre    || c.title_fr  || c.title    || 'Cours sans titre',
    price:       c.prix     ?? c.price     ?? 0,
    level:       c.niveau   || c.level     || c.Level    || '',
    duration:    c.duree    || c.duration  || 0,
    category:    c.categorie|| c.category  || '',
    description: c.description_fr || c.description || '',
    content:     c.content  || '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const raw = await pb.collection('courses').getOne(id, { requestKey: null });
      const c = normalizeCourse(raw);
      setCourse(c);

      // Parse exercises (stored as JSON string)
      try { setExercises(JSON.parse(c.exercises || '[]')); } catch { setExercises([]); }

      if (currentUser) {
        // Get current enrollment
        try {
          const res = await pb.collection('course_enrollments').getFirstListItem(
            `user_id = "${currentUser.id}" && course_id = "${id}"`,
            { requestKey: null }
          );
          setEnrollment(res);
        } catch { setEnrollment(null); }

        // Count total enrollments (for free tier: first 5 courses free)
        try {
          const allEnrollments = await pb.collection('course_enrollments').getFullList({
            filter: `user_id = "${currentUser.id}"`,
            requestKey: null,
          });
          setTotalEnrollments(allEnrollments.length);
        } catch { setTotalEnrollments(0); }
      }
    } catch (err) {
      toast.error('Cours introuvable ou erreur de chargement');
      navigate('/formation');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!currentUser) { navigate('/login'); return; }
    // Paid course → redirect to SecureCourseViewer which handles the payment wall
    if (course.price > 0 && !isFreeByTier) {
      navigate(`/dashboard/courses/${id}/view`);
      return;
    }
    // Free course or within free tier → direct enrollment
    setEnrolling(true);
    try {
      const rec = await pb.collection('course_enrollments').create({
        user_id: currentUser.id,
        course_id: id,
        status: 'active',
        progression: 0,
        complete: false,
        start_date: new Date().toISOString(),
      }, { requestKey: null });
      setEnrollment(rec);
      toast.success('Inscription réussie ! Bonne formation 🎓');
      // Redirection immédiate vers le viewer pour commencer à apprendre
      navigate(`/dashboard/courses/${id}/view`);
    } catch (err) {
      toast.error('Erreur lors de l\'inscription : ' + err.message);
    } finally {
      setEnrolling(false);
    }
  };

  const handleProgressUpdate = async (pct) => {
    if (!enrollment) return;
    try {
      const updated = await pb.collection('course_enrollments').update(enrollment.id, {
        progression: pct,
        complete: pct >= 100,
        last_activity: new Date().toISOString(),
      }, { requestKey: null });
      setEnrollment(updated);
      if (pct >= 100) toast.success('🎉 Cours terminé avec succès !');
    } catch {}
  };

  // Marque automatiquement comme "en cours" (50%) quand la leçon est ouverte pour la 1re fois
  const handleLessonViewed = async () => {
    if (!enrollment || (enrollment.progression || 0) > 0) return;
    try {
      const updated = await pb.collection('course_enrollments').update(enrollment.id, {
        progression: 50,
        last_activity: new Date().toISOString(),
      }, { requestKey: null });
      setEnrollment(updated);
    } catch {}
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </main>
    </div>
  );

  if (!course) return null;

  const isEnrolled = !!enrollment;
  // FREE TIER RULE: first 5 courses free, course price=0 always free
  const isFreeByTier  = totalEnrollments < 5;
  const isFreeByPrice = course.price === 0;
  const isFree        = isFreeByPrice || isFreeByTier;
  const hasAccess     = isEnrolled || isFree;
  const exCount       = exercises.length;

  const isAudio = course.course_type === 'audio';
  const hasPages = (() => { try { return JSON.parse(course.pages || '[]').length > 0; } catch { return false; } })();

  // Dernière page sauvegardée dans localStorage par SecureCourseViewer
  const storedPage = (() => { try { return parseInt(localStorage.getItem(`lastPage_${id}`), 10) || 0; } catch { return 0; } })();

  // Helpers navigation
  const goToCourse = (fromStart = false) => {
    const page = fromStart ? 0 : storedPage;
    navigate(`/dashboard/courses/${id}/view${page > 0 ? `?page=${page}` : ''}`);
  };

  // Dériver l'état du bouton
  const prog = enrollment?.progression || 0;
  const isCompleted = prog >= 100;

  return (
    <>
      <Helmet><title>{course.title} — IWS</title></Helmet>
      <div className="min-h-screen flex flex-col bg-slate-50" dir={isRtl ? 'rtl' : 'ltr'}>
        <Header />

        {/* ── Hero Banner ─────────────────────────────────────────── */}
        <div className={`${isAudio ? 'bg-gradient-to-br from-[#00274D] via-[#003a70] to-[#004d96]' : 'bg-gradient-to-br from-slate-800 to-slate-900'} text-white pt-20 pb-10`}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-white/60 mb-5">
              <Link to="/formation" className="hover:text-white flex items-center gap-1 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Catalogue
              </Link>
              <span>/</span>
              <span className="text-white/80 truncate">{course.title}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2">
                {/* Badges */}
                <div className="flex gap-2 flex-wrap mb-4">
                  {isAudio && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Headphones className="w-3.5 h-3.5" /> Auto-apprentissage audio
                    </span>
                  )}
                  {course.level && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20">
                      Niveau {course.level}
                    </span>
                  )}
                  {(course.duration || course.duree) > 0 && (
                    <span className="px-3 py-1 rounded-full text-xs bg-white/10 text-white/80 border border-white/20 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {course.duration || course.duree} min
                    </span>
                  )}
                  {isFree ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ✓ Gratuit
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {course.price} MAD
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">{course.title}</h1>
                {course.description && (
                  <p className="text-white/70 leading-relaxed text-sm sm:text-base max-w-xl">{course.description}</p>
                )}

                {/* Progression si inscrit */}
                {isEnrolled && (
                  <div className="mt-5 bg-white/10 rounded-xl px-4 py-3 max-w-sm">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-white/80">Ma progression</span>
                      <span className="font-bold text-white">{enrollment.progression || 0}%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${enrollment.progression || 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* CTA mobile (lg: masqué — la sidebar s'en charge) */}
              <div className="lg:hidden space-y-2">
                {isEnrolled ? (
                  <>
                    {isCompleted ? (
                      <div className="flex items-center justify-center gap-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold py-3 px-6 rounded-xl text-sm">
                        <CheckCircle className="w-5 h-5" /> Cours terminé ✓
                      </div>
                    ) : (
                      <button
                        onClick={() => goToCourse(false)}
                        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg"
                      >
                        <PlayCircle className="w-5 h-5" />
                        {prog > 0 ? 'Continuer le cours' : 'Commencer le cours'}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                    {(prog > 0) && (
                      <button
                        onClick={() => goToCourse(true)}
                        className="w-full flex items-center justify-center gap-2 border border-white/30 text-white/80 hover:bg-white/10 font-medium py-2.5 px-6 rounded-xl transition-colors text-sm"
                      >
                        <RotateCcw className="w-4 h-4" /> Recommencer depuis le début
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg disabled:opacity-70"
                  >
                    {enrolling
                      ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Inscription...</>
                      : <><Zap className="w-5 h-5" />{isFree ? 'Commencer gratuitement' : `Payer — ${course.price} MAD`}</>
                    }
                  </button>
                )}
              </div>
            </div>
          </div>
          {/* Bande orange IWS */}
          <div className="h-1 bg-amber-500 mt-8" />
        </div>

        <main className="flex-1 py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contenu principal */}
              <div className="lg:col-span-2 space-y-6">

                {/* Onglets (seulement si accès) */}
                {hasAccess ? (
                  <>
                    <div className="flex gap-1 border-b border-slate-200">
                      {[
                        { key: 'lecon', label: '📖 Leçon' },
                        ...(exCount > 0 ? [{ key: 'exercices', label: `✏️ Exercices (${exCount})` }] : []),
                      ].map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === tab.key
                              ? 'border-indigo-600 text-indigo-700'
                              : 'border-transparent text-slate-500 hover:text-slate-700'
                          }`}>{tab.label}</button>
                      ))}
                    </div>

                    {activeTab === 'lecon' && (
                      <Card className="bg-white border border-slate-100 rounded-2xl">
                        <CardContent className="p-6">
                          {/* Progression tracker pour les cours sans exercices */}
                          {enrollment && (
                            <div className="mb-5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-600">Votre progression</span>
                                <span className={`text-sm font-bold ${(enrollment.progression || 0) >= 100 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                                  {enrollment.progression || 0}%
                                </span>
                              </div>
                              <Progress value={enrollment.progression || 0} className="h-2 mb-3" />
                              {(enrollment.progression || 0) < 100 ? (
                                <Button
                                  size="sm"
                                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                                  onClick={() => handleProgressUpdate(100)}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Marquer ce cours comme terminé
                                </Button>
                              ) : (
                                <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold justify-center">
                                  <CheckCircle className="w-4 h-4" />
                                  Cours terminé à 100% !
                                </div>
                              )}
                            </div>
                          )}

                          {course.content ? (
                            <div className="prose prose-slate max-w-none">
                              <pre
                                className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700 bg-transparent p-0 border-0"
                                onMouseEnter={handleLessonViewed}
                              >
                                {course.content}
                              </pre>
                            </div>
                          ) : hasPages ? (
                            /* Cours multi-pages (audio Tip Top) : bouton vers le viewer */
                            <div className="text-center py-10">
                              <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-4">
                                <Headphones className="w-8 h-8 text-amber-500" />
                              </div>
                              <h3 className="font-bold text-slate-800 text-lg mb-2">
                                Ce cours contient plusieurs modules audio
                              </h3>
                              <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
                                Naviguez entre les leçons, les dialogues et les exercices depuis le lecteur de cours.
                              </p>
                              <button
                                onClick={() => goToCourse(false)}
                                className="inline-flex items-center gap-2 bg-[#00274D] hover:bg-[#003a70] text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md"
                              >
                                <PlayCircle className="w-5 h-5" />
                                {prog > 0 ? 'Continuer le cours' : 'Ouvrir le cours'}
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="text-center py-10 text-slate-400">
                              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                              <p>Le contenu de ce cours sera disponible prochainement.</p>
                              {enrollment && (enrollment.progression || 0) < 100 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="mt-4 gap-2"
                                  onClick={() => handleProgressUpdate(100)}
                                >
                                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                                  J'ai terminé ce cours
                                </Button>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {activeTab === 'exercices' && exCount > 0 && (
                      <Card className="bg-white border border-slate-100 rounded-2xl">
                        <CardContent className="p-6">
                          <ExerciseQCM exercises={exercises} onComplete={handleProgressUpdate} />
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  /* Contenu verrouillé */
                  <Card className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                    <CardContent className="py-16 text-center">
                      <Lock className="w-14 h-14 mx-auto text-slate-300 mb-4" />
                      <h3 className="text-xl font-bold text-slate-700 mb-2">Contenu verrouillé</h3>
                      <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                        Inscrivez-vous à cette formation pour accéder à la leçon et aux exercices interactifs.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar — Carte inscription */}
              <div className="lg:col-span-1 hidden lg:block">
                <div className="sticky top-6 space-y-4">

                  {/* Card principale */}
                  <Card className="bg-white border border-slate-100 rounded-2xl shadow-md overflow-hidden">
                    {/* Bande couleur niveau */}
                    <div className={`h-1.5 w-full ${
                      course.level === 'A1' ? 'bg-green-400' : course.level === 'A2' ? 'bg-lime-400' :
                      course.level === 'B1' ? 'bg-yellow-400' : course.level === 'B2' ? 'bg-orange-400' :
                      course.level === 'C1' ? 'bg-red-400' : 'bg-[#FF9500]'
                    }`} />

                    <CardContent className="p-6 space-y-5">
                      {/* Prix */}
                      <div className="text-center py-2">
                        {isFree ? (
                          <>
                            <div className="text-4xl font-extrabold text-emerald-600">Gratuit</div>
                            {isFreeByTier && course.price > 0 && (
                              <p className="text-sm text-slate-400 mt-1 line-through">{course.price} MAD</p>
                            )}
                            {isFreeByTier && (
                              <p className="text-xs text-emerald-600 mt-1 font-semibold bg-emerald-50 px-3 py-1 rounded-full inline-block">
                                {5 - totalEnrollments} cours gratuit{5 - totalEnrollments > 1 ? 's' : ''} restant{5 - totalEnrollments > 1 ? 's' : ''}
                              </p>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="text-4xl font-extrabold text-slate-900">{course.price} <span className="text-2xl">MAD</span></div>
                            <p className="text-sm text-slate-500 mt-1">accès complet illimité</p>
                          </>
                        )}
                      </div>

                      {/* CTA principal */}
                      {isEnrolled ? (
                        <div className="space-y-2.5">
                          {/* Bouton principal */}
                          {isCompleted ? (
                            <div className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold py-3.5 px-6 rounded-xl text-base">
                              <CheckCircle className="w-5 h-5" /> Cours terminé ✓
                            </div>
                          ) : (
                            <button
                              onClick={() => goToCourse(false)}
                              className="w-full flex items-center justify-center gap-2 bg-[#00274D] hover:bg-[#003a70] text-white font-bold py-3.5 px-6 rounded-xl transition-colors shadow-md text-base"
                            >
                              <PlayCircle className="w-5 h-5" />
                              {prog > 0 ? 'Continuer le cours' : 'Commencer le cours'}
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                          {/* Bouton secondaire "Recommencer" — visible dès qu'il y a eu de la progression */}
                          {prog > 0 && (
                            <button
                              onClick={() => goToCourse(true)}
                              className="w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium py-2.5 px-6 rounded-xl transition-colors text-sm"
                            >
                              <RotateCcw className="w-4 h-4" /> Recommencer depuis le début
                            </button>
                          )}
                          {/* Badge inscription */}
                          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-xs font-medium justify-center">
                            <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                            Inscrit · {prog}% accompli
                          </div>
                        </div>
                      ) : (
                        <button
                          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold py-3.5 px-6 rounded-xl transition-colors shadow-md text-base disabled:opacity-70"
                          onClick={handleEnroll}
                          disabled={enrolling}
                        >
                          {enrolling ? (
                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Inscription...</>
                          ) : isFree ? (
                            <><Zap className="w-5 h-5" /> Commencer gratuitement</>
                          ) : (
                            <><Unlock className="w-5 h-5" /> Payer — {course.price} MAD</>
                          )}
                        </button>
                      )}

                      {!currentUser && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 text-amber-700 text-xs">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>Connectez-vous pour vous inscrire à cette formation.</span>
                        </div>
                      )}

                      {/* Ce cours comprend */}
                      <div className="space-y-3 border-t border-slate-100 pt-5">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ce cours comprend</p>
                        {[
                          { icon: isAudio ? Headphones : BookOpen,
                            text: isAudio ? 'Modules audio interactifs' : 'Leçon complète avec exemples' },
                          { icon: Clock,
                            text: `${course.duration || course.duree || 0} minutes de contenu` },
                          ...(exCount > 0 ? [{ icon: Star, text: `${exCount} exercice(s) QCM corrigés` }] : []),
                          { icon: GraduationCap, text: 'Accès illimité une fois inscrit' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm text-slate-700">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                              <item.icon className="w-4 h-4 text-[#00274D]" />
                            </div>
                            {item.text}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Mini carte — aide */}
                  <div className="bg-[#00274D] rounded-2xl p-4 text-white text-center">
                    <GraduationCap className="w-8 h-8 mx-auto mb-2 text-amber-400" />
                    <p className="text-sm font-semibold mb-1">Besoin d'aide ?</p>
                    <p className="text-xs text-white/60 mb-3">Nos conseillers pédagogiques répondent en moins d'1h</p>
                    <Link to="/contact" className="text-xs font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2">
                      Nous contacter →
                    </Link>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
