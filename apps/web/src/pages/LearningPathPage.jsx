import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useLanguage } from '@/hooks/useLanguage.jsx';
import DashboardLayout from '@/components/DashboardLayout.jsx';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Lock, CheckCircle2, PlayCircle, BookOpen,
  ChevronRight, Trophy, TrendingUp, Globe, Star,
  GraduationCap, Flame, Zap, Award,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ─── Couleurs et labels par statut ──────────────────────────────────────────
const STATUS_CONFIG = {
  completed:   { color: 'bg-emerald-500',  border: 'border-emerald-200', bg: 'bg-emerald-50',  text: 'text-emerald-700', icon: CheckCircle2, label: 'Validé' },
  in_progress: { color: 'bg-indigo-500',   border: 'border-indigo-200',  bg: 'bg-indigo-50',   text: 'text-indigo-700',  icon: PlayCircle,   label: 'En cours' },
  available:   { color: 'bg-amber-400',    border: 'border-amber-200',   bg: 'bg-amber-50',    text: 'text-amber-700',   icon: BookOpen,     label: 'Disponible' },
  locked:      { color: 'bg-slate-300',    border: 'border-slate-200',   bg: 'bg-slate-50',    text: 'text-slate-400',   icon: Lock,         label: 'Verrouillé' },
};

const NIVEAU_COLORS = {
  A0: 'bg-green-100 text-green-700', A1: 'bg-green-100 text-green-700',
  A2: 'bg-lime-100 text-lime-700',   B1: 'bg-yellow-100 text-yellow-700',
  B2: 'bg-orange-100 text-orange-700',
};

const LANGUAGE_OPTIONS = [
  { value: 'Francais', label: '🇫🇷 Français', short: 'FR' },
  { value: 'Anglais',  label: '🇬🇧 Anglais',  short: 'EN' },
  { value: 'Arabe',    label: '🇲🇦 Arabe',    short: 'AR' },
];

export default function LearningPathPage() {
  const { currentUser } = useAuth();
  const { language }    = useLanguage();
  const navigate        = useNavigate();
  const isRtl           = language === 'ar';

  const [selectedLang, setSelectedLang] = useState('Francais');
  const [pathData,     setPathData]     = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);

  const fetchPath = useCallback(async (lang) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || currentUser?.token || '';
      const res = await fetch(`${API_URL}/courses/path/${lang}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setPathData(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { fetchPath(selectedLang); }, [selectedLang, fetchPath]);

  const handleOpenCourse = (course) => {
    if (course.locked) return;
    navigate(`/etudiant/dashboard/courses/${course.id}/view`);
  };

  const globalPct = pathData
    ? Math.round((pathData.completed / (pathData.total || 1)) * 100)
    : 0;

  return (
    <>
      <Helmet><title>Mon Parcours — IWS Formation</title></Helmet>
      <DashboardLayout>
        <div className="max-w-3xl mx-auto px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>

          {/* ── En-tête ─────────────────────────────────────────────── */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Mon Parcours</h1>
            </div>
            <p className="text-slate-500 text-sm ml-13">
              Chaque cours validé (≥ 70%) débloque le suivant. Visez 100% pour décrocher votre certificat.
            </p>
          </div>

          {/* ── Sélecteur de langue ──────────────────────────────────── */}
          <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-xl w-fit">
            {LANGUAGE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelectedLang(opt.value)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedLang === opt.value
                    ? 'bg-white shadow text-indigo-700 ring-1 ring-indigo-200'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* ── Barre de progression globale ────────────────────────── */}
          {pathData && !loading && (
            <div className="bg-white border border-slate-100 rounded-2xl p-5 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold text-slate-800 text-sm">Progression globale</span>
                </div>
                <span className="text-2xl font-bold text-indigo-600">{globalPct}%</span>
              </div>
              <Progress value={globalPct} className="h-3 mb-3" />
              <div className="flex items-center gap-6 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  {pathData.completed} validé{pathData.completed > 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1">
                  <PlayCircle className="w-3.5 h-3.5 text-indigo-500" />
                  {pathData.inProgress} en cours
                </span>
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  {pathData.total - pathData.completed - pathData.inProgress} restant{pathData.total - pathData.completed - pathData.inProgress > 1 ? 's' : ''}
                </span>
                {globalPct === 100 && (
                  <span className="flex items-center gap-1 text-amber-600 font-semibold ml-auto">
                    <Trophy className="w-3.5 h-3.5" /> Parcours complété !
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── Chargement ──────────────────────────────────────────── */}
          {loading && (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          )}

          {/* ── Erreur ──────────────────────────────────────────────── */}
          {error && !loading && (
            <div className="text-center py-12 bg-red-50 border border-red-100 rounded-2xl">
              <p className="text-red-600 font-medium">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => fetchPath(selectedLang)}>
                Réessayer
              </Button>
            </div>
          )}

          {/* ── Liste des cours ──────────────────────────────────────── */}
          {!loading && !error && pathData && (
            <div className="space-y-3">
              {pathData.courses.map((course, idx) => {
                const cfg = course.isExam && !course.locked
                  ? { ...STATUS_CONFIG[course.status], color: course.status === 'completed' ? 'bg-amber-500' : 'bg-amber-400', border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-700' }
                  : STATUS_CONFIG[course.status] || STATUS_CONFIG.locked;
                const Icon = course.isExam ? Award : (cfg.icon || BookOpen);
                const isLocked = course.status === 'locked';
                const isDone   = course.status === 'completed';

                return (
                  <div key={course.id} className="relative flex items-stretch gap-3">

                    {/* ── Ligne verticale du parcours ──────────────── */}
                    {idx < pathData.courses.length - 1 && (
                      <div className="absolute left-5 top-12 w-0.5 h-[calc(100%+12px)] bg-slate-200 z-0" />
                    )}

                    {/* ── Indicateur de position ───────────────────── */}
                    <div className="flex-shrink-0 z-10 flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${cfg.color} ${isLocked ? 'opacity-50' : ''}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    {/* ── Carte du cours ───────────────────────────── */}
                    <button
                      onClick={() => handleOpenCourse(course)}
                      disabled={isLocked}
                      className={`flex-1 text-left rounded-2xl border p-4 transition-all ${cfg.border} ${cfg.bg}
                        ${isLocked
                          ? 'opacity-60 cursor-not-allowed'
                          : 'hover:shadow-md hover:border-indigo-200 cursor-pointer group'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">

                          {/* Numéro + titre */}
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {course.isExam ? (
                              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1">
                                <Award className="w-3 h-3" /> Examen final
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 font-mono">#{String(course.sort_order).padStart(2, '0')}</span>
                            )}
                            {course.niveau && !course.isExam && (
                              <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${NIVEAU_COLORS[course.niveau] || 'bg-gray-100 text-gray-700'}`}>
                                {course.niveau}
                              </span>
                            )}
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                              {cfg.label}
                            </span>
                          </div>

                          <h3 className={`font-semibold leading-snug line-clamp-2 ${isLocked ? 'text-slate-400' : 'text-slate-800 group-hover:text-indigo-700'}`}>
                            {course.titre}
                          </h3>

                          {/* Barre de progression individuelle */}
                          {!isLocked && course.progression > 0 && !isDone && (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${course.progression}%` }} />
                              </div>
                              <span className="text-xs text-slate-500">{course.progression}%</span>
                            </div>
                          )}

                          {/* Score affiché si disponible */}
                          {isDone && course.score !== null && (
                            <div className="mt-1 flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              <span className="text-xs font-bold text-emerald-700">Score : {course.score}/100</span>
                            </div>
                          )}

                          {/* Message verrouillé */}
                          {isLocked && (
                            <p className="text-xs text-slate-400 mt-1">
                              {course.isExam
                                ? 'Validez tous les cours du parcours pour débloquer l\'examen.'
                                : 'Validez le cours précédent (≥ 70%) pour débloquer.'}
                            </p>
                          )}
                        </div>

                        {/* Bouton action */}
                        {!isLocked && (
                          <div className="flex-shrink-0 flex items-center">
                            {isDone ? (
                              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                                <Zap className="w-3.5 h-3.5" /> Réviser
                              </span>
                            ) : (
                              <ChevronRight className="w-5 h-5 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}

              {/* ── Objectif final : Certificat ─────────────────────── */}
              <div className="mt-6 relative flex items-stretch gap-3">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${globalPct === 100 ? 'bg-amber-400' : 'bg-slate-200'}`}>
                    <Trophy className={`w-5 h-5 ${globalPct === 100 ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                </div>
                <div className={`flex-1 rounded-2xl border p-4 ${globalPct === 100 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                  <h3 className={`font-bold ${globalPct === 100 ? 'text-amber-700' : 'text-slate-400'}`}>
                    🎓 Certificat de langue — IWS Formation
                  </h3>
                  <p className={`text-xs mt-1 ${globalPct === 100 ? 'text-amber-600' : 'text-slate-400'}`}>
                    {globalPct === 100
                      ? 'Félicitations ! Votre certificat est disponible.'
                      : `Validez les ${pathData.total} cours du parcours pour obtenir votre certificat.`}
                  </p>
                  {globalPct === 100 && pathData?.courses && (() => {
                    const examCourse = pathData.courses.find(c => c.isExam && c.status === 'completed');
                    return examCourse ? (
                      <Button size="sm" className="mt-3 bg-amber-500 hover:bg-amber-600 text-white gap-2"
                        onClick={() => navigate(`/etudiant/certificate/${examCourse.id}`)}>
                        <Flame className="w-3.5 h-3.5" /> Télécharger mon certificat
                      </Button>
                    ) : null;
                  })()}
                </div>
              </div>

            </div>
          )}

        </div>
      </DashboardLayout>
    </>
  );
}
