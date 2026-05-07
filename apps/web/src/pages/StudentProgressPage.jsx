/**
 * StudentProgressPage — Tableau de bord de progression
 * ─────────────────────────────────────────────────────────────────────────────
 * Route : /etudiant/dashboard/progression
 * Affiche :
 *   - Stats globales (score moyen, cours réussis, tentatives)
 *   - Graphique de performance par langue (barres CSS)
 *   - Scores par cours groupés par langue
 *   - Historique des 10 dernières tentatives
 *   - Prochain cours recommandé par langue
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import DashboardLayout from '@/components/DashboardLayout.jsx';
import { Button } from '@/components/ui/button';
import {
  TrendingUp, CheckCircle2, Star, Award, PlayCircle,
  BookOpen, Clock, ChevronRight, Trophy, Flame, Target,
  BarChart2, RefreshCw,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ── Config par langue ──────────────────────────────────────────────────────────
const LANG_CFG = {
  Francais: { label: 'Français',  flag: '🇫🇷', color: 'bg-blue-500',    light: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   bar: 'bg-blue-500'   },
  Anglais:  { label: 'Anglais',   flag: '🇬🇧', color: 'bg-red-500',     light: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    bar: 'bg-red-500'    },
  Arabe:    { label: 'Arabe',     flag: '🌍',  color: 'bg-emerald-500', light: 'bg-emerald-50',border: 'border-emerald-200',text: 'text-emerald-700',bar: 'bg-emerald-500'},
  default:  { label: 'Autre',     flag: '📚',  color: 'bg-violet-500',  light: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', bar: 'bg-violet-500' },
};

// ── Couleur selon le score ─────────────────────────────────────────────────────
const scoreColor = (s) => {
  if (s === null || s === undefined) return { bg: 'bg-slate-100', text: 'text-slate-400', label: '—' };
  if (s >= 80) return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: `${s}/100` };
  if (s >= 70) return { bg: 'bg-amber-100',   text: 'text-amber-700',   label: `${s}/100` };
  return       { bg: 'bg-red-100',     text: 'text-red-700',     label: `${s}/100` };
};

// ── Formatage date courte ──────────────────────────────────────────────────────
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ─────────────────────────────────────────────────────────────────────────────
// Mini barre de score (CSS)
// ─────────────────────────────────────────────────────────────────────────────
const ScoreBar = ({ value, max = 100, colorClass = 'bg-indigo-500' }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${colorClass}`}
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      />
    </div>
    <span className="text-xs font-bold text-slate-600 w-8 text-right">{value}%</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function StudentProgressPage() {
  const { currentUser } = useAuth();

  const [scores,      setScores]      = useState([]);   // course_scores records
  const [enrollments, setEnrollments] = useState([]);   // course_enrollments records
  const [pathData,    setPathData]    = useState({});   // { Francais: {...}, Anglais: {...}, Arabe: {...} }
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);

  // ── Chargement ──────────────────────────────────────────────────────────────
  const fetchAll = async (quiet = false) => {
    if (!currentUser?.id) return;
    if (!quiet) setLoading(true);
    else setRefreshing(true);

    try {
      const token = localStorage.getItem('token') || currentUser?.token || '';

      const [scoresRes, enrollRes] = await Promise.allSettled([
        pb.collection('course_scores').getFullList({
          filter:    `user_id = "${currentUser.id}"`,
          expand:    'course_id',
          sort:      '-submitted_at',
          requestKey: null,
        }),
        pb.collection('course_enrollments').getFullList({
          filter:    `user_id = "${currentUser.id}"`,
          expand:    'course_id',
          requestKey: null,
        }),
      ]);

      if (scoresRes.status === 'fulfilled')  setScores(scoresRes.value);
      if (enrollRes.status === 'fulfilled')  setEnrollments(enrollRes.value);

      // Charge les parcours pour FR / EN / AR en parallèle
      const langs = ['Francais', 'Anglais', 'Arabe'];
      const pathResults = await Promise.allSettled(
        langs.map(l =>
          fetch(`${API_URL}/courses/path/${l}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then(r => r.ok ? r.json() : null)
        )
      );
      const pd = {};
      langs.forEach((l, i) => {
        if (pathResults[i].status === 'fulfilled' && pathResults[i].value) {
          pd[l] = pathResults[i].value;
        }
      });
      setPathData(pd);

    } catch (err) {
      console.error('StudentProgressPage fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAll(); }, [currentUser?.id]);

  // ── Meilleur score par cours ───────────────────────────────────────────────
  const bestScorePerCourse = useMemo(() => {
    const map = {};
    scores.forEach(s => {
      const cid = s.course_id;
      if (!map[cid] || s.score > map[cid].score) map[cid] = s;
    });
    return map;
  }, [scores]);

  // ── Stats globales ─────────────────────────────────────────────────────────
  const totalAttempts  = scores.length;
  const passedAttempts = scores.filter(s => s.passed).length;
  const scoredCourses  = Object.values(bestScorePerCourse);
  const avgScore       = scoredCourses.length
    ? Math.round(scoredCourses.reduce((a, s) => a + s.score, 0) / scoredCourses.length)
    : null;
  const bestScore      = scoredCourses.length
    ? Math.max(...scoredCourses.map(s => s.score))
    : null;

  // ── Groupement des cours par langue (depuis enrollments) ──────────────────
  const groupedCourses = useMemo(() => {
    const groups = {};
    enrollments.forEach(e => {
      const course = e.expand?.course_id || {};
      let lang = course.langue || 'default';
      if (!/^(Francais|Anglais|Arabe)$/.test(lang)) lang = 'default';
      if (!groups[lang]) groups[lang] = [];
      groups[lang].push({ enrollment: e, course });
    });
    return groups;
  }, [enrollments]);

  // ── Score moyen par langue ─────────────────────────────────────────────────
  const avgScoreByLang = useMemo(() => {
    const result = {};
    Object.entries(groupedCourses).forEach(([lang, items]) => {
      const withScore = items.filter(({ course }) => bestScorePerCourse[course.id]);
      if (!withScore.length) { result[lang] = null; return; }
      result[lang] = Math.round(
        withScore.reduce((a, { course }) => a + bestScorePerCourse[course.id].score, 0) / withScore.length
      );
    });
    return result;
  }, [groupedCourses, bestScorePerCourse]);

  // ── Prochain cours disponible par langue ──────────────────────────────────
  const nextCourseByLang = useMemo(() => {
    const result = {};
    Object.entries(pathData).forEach(([lang, pd]) => {
      if (!pd?.courses) return;
      const next = pd.courses.find(c => !c.locked && c.status !== 'completed' && !c.isExam);
      result[lang] = next || null;
    });
    return result;
  }, [pathData]);

  // ── Historique des 10 dernières tentatives ────────────────────────────────
  const recentAttempts = scores.slice(0, 10);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-64" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-100 rounded-2xl" />)}
            </div>
            <div className="h-48 bg-slate-100 rounded-2xl" />
            <div className="h-64 bg-slate-100 rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Helmet><title>Ma Progression — IWS Formation</title></Helmet>
      <DashboardLayout>
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

          {/* ── En-tête ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Ma Progression</h1>
                <p className="text-sm text-slate-500">Suivi détaillé de vos résultats et scores</p>
              </div>
            </div>
            <button
              onClick={() => fetchAll(true)}
              disabled={refreshing}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Rafraîchir"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* ── Stats globales ──────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Star,
                label: 'Score moyen',
                value: avgScore !== null ? `${avgScore}/100` : '—',
                sub: 'Sur tous les quiz',
                bg: 'bg-amber-100', text: 'text-amber-600',
              },
              {
                icon: CheckCircle2,
                label: 'Quiz réussis',
                value: `${passedAttempts}/${totalAttempts}`,
                sub: totalAttempts > 0 ? `${Math.round((passedAttempts/totalAttempts)*100)}% de réussite` : 'Aucune tentative',
                bg: 'bg-emerald-100', text: 'text-emerald-600',
              },
              {
                icon: Trophy,
                label: 'Meilleur score',
                value: bestScore !== null ? `${bestScore}/100` : '—',
                sub: 'Record personnel',
                bg: 'bg-violet-100', text: 'text-violet-600',
              },
              {
                icon: BookOpen,
                label: 'Cours évalués',
                value: scoredCourses.length,
                sub: `sur ${enrollments.length} inscrits`,
                bg: 'bg-blue-100', text: 'text-blue-600',
              },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.bg}`}>
                  <s.icon className={`w-5 h-5 ${s.text}`} />
                </div>
                <p className={`text-2xl font-black ${s.text}`}>{s.value}</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">{s.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Grille principale ──────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Col gauche (2/3) ─────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Performance par langue */}
              {Object.keys(groupedCourses).length > 0 && (
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart2 className="w-4 h-4 text-indigo-600" />
                    <h2 className="font-bold text-slate-800">Performance par langue</h2>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(groupedCourses).map(([lang, items]) => {
                      const cfg  = LANG_CFG[lang] || LANG_CFG.default;
                      const avg  = avgScoreByLang[lang];
                      const done = items.filter(({ enrollment: e }) => e.complete || (e.progression||0) >= 100).length;
                      const sc   = scoreColor(avg);
                      return (
                        <div key={lang}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                              <span>{cfg.flag}</span> {cfg.label}
                              <span className="text-xs text-slate-400 font-normal">
                                {done}/{items.length} cours terminés
                              </span>
                            </span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${avg !== null ? sc.bg + ' ' + sc.text : 'bg-slate-100 text-slate-400'}`}>
                              {avg !== null ? `moy. ${avg}/100` : 'Pas encore évalué'}
                            </span>
                          </div>
                          {avg !== null ? (
                            <ScoreBar value={avg} colorClass={cfg.bar} />
                          ) : (
                            <div className="h-2 bg-slate-100 rounded-full" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Scores par cours, groupés par langue */}
              {Object.entries(groupedCourses).map(([lang, items]) => {
                const cfg = LANG_CFG[lang] || LANG_CFG.default;
                return (
                  <div key={lang} className={`bg-white border-2 ${cfg.border} rounded-2xl overflow-hidden shadow-sm`}>
                    {/* Header langue */}
                    <div className={`px-5 py-3 ${cfg.light} flex items-center justify-between`}>
                      <span className={`font-bold text-sm flex items-center gap-2 ${cfg.text}`}>
                        <span className="text-lg">{cfg.flag}</span> {cfg.label}
                      </span>
                      <span className="text-xs text-slate-500">{items.length} cours</span>
                    </div>

                    {/* Liste des cours */}
                    <div className="divide-y divide-slate-50">
                      {items
                        .sort((a, b) => (a.course.sort_order || 0) - (b.course.sort_order || 0))
                        .map(({ enrollment: e, course }) => {
                          const best    = bestScorePerCourse[course.id];
                          const sc      = scoreColor(best?.score ?? null);
                          const isDone  = e.complete || (e.progression || 0) >= 100;
                          const isExam  = course.course_type === 'exam';
                          const prog    = e.progression || 0;

                          // Nombre de tentatives pour ce cours
                          const attempts = scores.filter(s => s.course_id === course.id).length;

                          return (
                            <div key={e.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                              {/* Icône statut */}
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                isExam  ? 'bg-amber-100' :
                                isDone  ? 'bg-emerald-100' :
                                prog > 0 ? 'bg-indigo-100' : 'bg-slate-100'
                              }`}>
                                {isExam  ? <Award    className="w-4 h-4 text-amber-600" /> :
                                 isDone  ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> :
                                 prog > 0 ? <PlayCircle className="w-4 h-4 text-indigo-600" /> :
                                            <BookOpen   className="w-4 h-4 text-slate-400" />}
                              </div>

                              {/* Titre + barre de progression */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">
                                  {isExam && <span className="text-amber-600 mr-1">🎓</span>}
                                  {course.titre}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                  {/* Progression */}
                                  <div className="flex items-center gap-1.5 flex-1">
                                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${isDone ? 'bg-emerald-500' : 'bg-indigo-400'}`}
                                        style={{ width: `${prog}%` }}
                                      />
                                    </div>
                                    <span className="text-[10px] text-slate-400 w-6 text-right">{prog}%</span>
                                  </div>
                                  {/* Tentatives */}
                                  {attempts > 0 && (
                                    <span className="text-[10px] text-slate-400 flex-shrink-0">
                                      {attempts} tentative{attempts > 1 ? 's' : ''}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Score badge */}
                              <div className="flex-shrink-0 text-right">
                                {best ? (
                                  <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${sc.bg} ${sc.text}`}>
                                    <Star className="w-3 h-3" />
                                    {sc.label}
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-300 italic">Non évalué</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              })}

              {/* État vide */}
              {Object.keys(groupedCourses).length === 0 && (
                <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
                  <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="font-semibold text-slate-500">Aucune inscription trouvée</p>
                  <p className="text-sm text-slate-400 mt-1">Inscrivez-vous à une formation pour voir vos scores.</p>
                  <Link to="/formation/inscription">
                    <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white">
                      Choisir une formation
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* ── Col droite (1/3) ─────────────────────────────── */}
            <div className="space-y-5">

              {/* Prochain cours recommandé */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-4 h-4 text-indigo-600" />
                  <h2 className="font-bold text-slate-800 text-sm">Prochain cours</h2>
                </div>
                {['Francais', 'Anglais', 'Arabe'].map(lang => {
                  const cfg  = LANG_CFG[lang];
                  const next = nextCourseByLang[lang];
                  if (!next && !pathData[lang]) return null;
                  return (
                    <div key={lang} className={`mb-3 last:mb-0 rounded-xl border p-3 ${next ? cfg.light + ' ' + cfg.border : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span>{cfg.flag}</span>
                        <span className={`text-xs font-bold ${next ? cfg.text : 'text-slate-400'}`}>{cfg.label}</span>
                      </div>
                      {next ? (
                        <>
                          <p className="text-xs font-semibold text-slate-700 line-clamp-2 mb-2">{next.titre}</p>
                          <Link to={`/etudiant/dashboard/courses/${next.id}/view`}>
                            <button className={`w-full text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 ${cfg.color} text-white hover:opacity-90 transition-opacity`}>
                              <PlayCircle className="w-3 h-3" />
                              {next.status === 'in_progress' ? 'Continuer' : 'Commencer'}
                            </button>
                          </Link>
                        </>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          {pathData[lang]
                            ? (pathData[lang].completed === pathData[lang].total
                              ? '🎉 Parcours complété !'
                              : 'Chargement…')
                            : 'Parcours non commencé'}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Historique des tentatives */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <h2 className="font-bold text-slate-800 text-sm">Dernières tentatives</h2>
                </div>

                {recentAttempts.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">Aucune tentative enregistrée.</p>
                ) : (
                  <div className="space-y-2">
                    {recentAttempts.map(s => {
                      const course = s.expand?.course_id;
                      const sc     = scoreColor(s.score);
                      const lang   = course?.langue || 'default';
                      const lcfg   = LANG_CFG[lang] || LANG_CFG.default;
                      return (
                        <div key={s.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                          <span className="text-sm flex-shrink-0">{lcfg.flag}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-700 truncate">
                              {course?.titre || 'Cours inconnu'}
                            </p>
                            <p className="text-[10px] text-slate-400">{fmtDate(s.submitted_at)}</p>
                          </div>
                          <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                              {s.score}/100
                            </span>
                            {s.passed ? (
                              <span className="text-[10px] text-emerald-600 font-semibold">✓ Réussi</span>
                            ) : (
                              <span className="text-[10px] text-red-500 font-semibold">✗ Échoué</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Lien vers Mon Parcours */}
              <Link to="/etudiant/dashboard/parcours">
                <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 text-white cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-4 h-4 text-yellow-300" />
                    <span className="font-bold text-sm">Voir mon parcours</span>
                  </div>
                  <p className="text-xs text-white/70 mb-3">
                    Chaque cours validé (≥ 70%) débloque le suivant vers votre certificat.
                  </p>
                  <div className="flex items-center gap-1 text-xs font-semibold text-yellow-300">
                    Accéder au parcours <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>

            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
