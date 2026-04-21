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
  ArrowRight, RotateCcw,
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

  return (
    <>
      <Helmet><title>{course.title} — IWS</title></Helmet>
      <div className="min-h-screen flex flex-col bg-slate-50" dir={isRtl ? 'rtl' : 'ltr'}>
        <Header />
        <main className="flex-1 py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
              <Link to="/formation" className="hover:text-indigo-600 flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> Catalogue
              </Link>
              <span>/</span>
              <span className="text-slate-700 font-medium truncate">{course.title}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contenu principal */}
              <div className="lg:col-span-2 space-y-6">

                {/* Header cours */}
                <div>
                  <div className="flex gap-2 flex-wrap mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${LEVEL_COLORS[course.level] || 'bg-gray-100'}`}>{course.level}</span>
                    <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 capitalize">{course.category}</span>
                    <span className="px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />{course.duration || course.duree || 0} min
                    </span>
                    {/* Badge prix visible dès le header */}
                    {isFree ? (
                      <span className="px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                        ✓ Gratuit
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-700">
                        {course.price} MAD
                      </span>
                    )}
                    {exCount > 0 && (
                      <span className="px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700 flex items-center gap-1">
                        <Star className="w-3 h-3" />{exCount} exercice(s)
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 leading-tight">{course.title}</h1>
                  {course.description && <p className="text-slate-600 leading-relaxed">{course.description}</p>}
                  {isEnrolled && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-600">Progression</span>
                        <span className="font-bold text-indigo-600">{enrollment.progression || 0}%</span>
                      </div>
                      <Progress value={enrollment.progression || 0} className="h-2 bg-slate-100" />
                    </div>
                  )}
                </div>

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
              <div className="lg:col-span-1">
                <div className="sticky top-6">
                  <Card className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className={`h-2 w-full ${
                      course.level === 'A1' ? 'bg-green-400' : course.level === 'A2' ? 'bg-lime-400' :
                      course.level === 'B1' ? 'bg-yellow-400' : course.level === 'B2' ? 'bg-orange-400' :
                      course.level === 'C1' ? 'bg-red-400' : 'bg-purple-400'
                    }`} />
                    <CardContent className="p-6 space-y-5">
                      {/* Prix */}
                      <div className="text-center">
                        {isFree ? (
                          <>
                            <div className="text-3xl font-bold text-emerald-600">Gratuit</div>
                            {isFreeByTier && course.price > 0 && (
                              <p className="text-xs text-slate-400 mt-1 line-through">{course.price} MAD</p>
                            )}
                            {isFreeByTier && (
                              <p className="text-xs text-emerald-600 mt-1 font-medium">
                                {5 - totalEnrollments} cours gratuit{5 - totalEnrollments > 1 ? 's' : ''} restant{5 - totalEnrollments > 1 ? 's' : ''}
                              </p>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="text-3xl font-bold text-slate-900">{course.price} MAD</div>
                            <p className="text-sm text-slate-500 mt-1">accès complet</p>
                          </>
                        )}
                      </div>

                      {/* Status */}
                      {isEnrolled ? (
                        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          Vous êtes inscrit à cette formation
                        </div>
                      ) : (
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base font-semibold gap-2"
                          onClick={handleEnroll} disabled={enrolling}>
                          {enrolling ? (
                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Inscription...</>
                          ) : isFree ? (
                            <><PlayCircle className="w-4 h-4" />Commencer gratuitement</>
                          ) : (
                            <><Unlock className="w-4 h-4" />Payer — {course.price} MAD</>
                          )}
                        </Button>
                      )}

                      {/* Ce que comprend le cours */}
                      <div className="space-y-2.5 border-t border-slate-100 pt-5">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ce cours comprend</p>
                        {[
                          { icon: BookOpen, text: 'Leçon complète avec exemples' },
                          { icon: Clock, text: `${course.duration || course.duree || 0} minutes de contenu` },
                          ...(exCount > 0 ? [{ icon: Star, text: `${exCount} exercice(s) QCM corrigés` }] : []),
                          { icon: CheckCircle, text: 'Accès illimité une fois inscrit' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-2.5 text-sm text-slate-600">
                            <item.icon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                            {item.text}
                          </div>
                        ))}
                      </div>

                      {!currentUser && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 text-amber-700 text-xs">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>Connectez-vous pour vous inscrire à cette formation.</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
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
