import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useLanguage } from '@/hooks/useLanguage.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, PlayCircle, CheckCircle, Clock, ChevronRight, Plus, GraduationCap } from 'lucide-react';

const LEVEL_COLORS = {
  A1:'bg-green-100 text-green-700', A2:'bg-lime-100 text-lime-700',
  B1:'bg-yellow-100 text-yellow-700', B2:'bg-orange-100 text-orange-700',
  C1:'bg-red-100 text-red-700', C2:'bg-purple-100 text-purple-700',
};

export default function StudentCoursesPage() {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isRtl = language === 'ar';

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchEnrollments(); }, []);

  const fetchEnrollments = async () => {
    try {
      const res = await pb.collection('course_enrollments').getFullList({
        filter: `user_id = "${currentUser.id}"`,
        expand: 'course_id',
        sort: '-updated',
        requestKey: null,
      });
      setEnrollments(res.filter(e => e.status === 'active'));
    } catch { setEnrollments([]); }
    finally { setLoading(false); }
  };

  const active = enrollments.filter(e => !e.complete && (e.progression || 0) < 100);
  const completed = enrollments.filter(e => e.complete || (e.progression || 0) >= 100);

  return (
    <>
      <Helmet><title>Mes Formations — IWS</title></Helmet>
      <div className="min-h-screen flex flex-col bg-slate-50" dir={isRtl ? 'rtl' : 'ltr'}>
        <Header />
        <main className="flex-1 py-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                  <GraduationCap className="w-8 h-8 text-indigo-600" /> Mes Formations
                </h1>
                <p className="text-slate-500 mt-1">{enrollments.length} formation(s) inscrite(s)</p>
              </div>
              <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                onClick={() => navigate('/formation')}>
                <Plus className="w-4 h-4" /> Explorer le catalogue
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[1,2,3].map(i => <div key={i} className="h-40 rounded-2xl bg-slate-100 animate-pulse" />)}
              </div>
            ) : enrollments.length === 0 ? (
              <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-2xl">
                <BookOpen className="w-14 h-14 mx-auto text-slate-200 mb-4" />
                <h2 className="text-xl font-bold text-slate-700 mb-2">Aucune formation inscrite</h2>
                <p className="text-slate-500 mb-6">Découvrez notre catalogue et commencez à apprendre dès aujourd'hui.</p>
                <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2" onClick={() => navigate('/formation')}>
                  <Plus className="w-4 h-4" /> Voir le catalogue
                </Button>
              </div>
            ) : (
              <div className="space-y-8">

                {/* En cours */}
                {active.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <PlayCircle className="w-5 h-5 text-indigo-600" /> En cours ({active.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {active.map(e => {
                        const course = e.expand?.course_id;
                        const progress = e.progression || 0;
                        const progressColor = progress >= 80 ? 'bg-emerald-500' : progress >= 40 ? 'bg-blue-500' : 'bg-orange-400';
                        return (
                          <Card key={e.id}
                            className="bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all rounded-2xl overflow-hidden cursor-pointer group"
                            onClick={() => navigate(`/courses/${e.course_id}`)}>
                            <div className={`h-1.5 w-full ${progressColor}`} style={{ width: `${progress}%`, minWidth: '4px' }} />
                            <div className="h-1.5 bg-slate-100 -mt-1.5" />
                            <CardContent className="p-5">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex gap-2 mb-2">
                                    {course?.level && (
                                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${LEVEL_COLORS[course.level] || 'bg-gray-100'}`}>
                                        {course.level}
                                      </span>
                                    )}
                                    {course?.category && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 capitalize">{course.category}</span>
                                    )}
                                  </div>
                                  <h3 className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-2 leading-snug">
                                    {course?.title || course?.titre || 'Formation'}
                                  </h3>
                                </div>
                                <span className="ml-3 text-lg font-bold text-indigo-600 flex-shrink-0">{progress}%</span>
                              </div>
                              <div className="mb-3">
                                <Progress value={progress} className="h-2 bg-slate-100" />
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                  <Clock className="w-3 h-3" />{course?.duration || course?.duree || 0} min
                                </div>
                                <Button size="sm" variant="ghost"
                                  className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-xs gap-1 h-7">
                                  Continuer <ChevronRight className="w-3 h-3" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Terminées */}
                {completed.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600" /> Terminées ({completed.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {completed.map(e => {
                        const course = e.expand?.course_id;
                        return (
                          <Card key={e.id}
                            className="bg-emerald-50 border border-emerald-100 hover:shadow-md transition-all rounded-2xl cursor-pointer group"
                            onClick={() => navigate(`/courses/${e.course_id}`)}>
                            <CardContent className="p-5">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  {course?.level && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold mb-1 inline-block ${LEVEL_COLORS[course.level] || 'bg-gray-100'}`}>
                                      {course.level}
                                    </span>
                                  )}
                                  <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                                    {course?.title || course?.titre || 'Formation'}
                                  </h3>
                                  <p className="text-xs text-emerald-600 font-medium mt-1">✓ Complété à 100%</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
