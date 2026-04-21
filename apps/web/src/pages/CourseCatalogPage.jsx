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
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { BookOpen, Clock, Search, Star, ChevronRight, Filter, GraduationCap, Tag } from 'lucide-react';

const LEVEL_COLORS = {
  A1: 'bg-green-100 text-green-700 border-green-200',
  A2: 'bg-lime-100 text-lime-700 border-lime-200',
  B1: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  B2: 'bg-orange-100 text-orange-700 border-orange-200',
  C1: 'bg-red-100 text-red-700 border-red-200',
  C2: 'bg-purple-100 text-purple-700 border-purple-200',
};

const LEVELS = ['Tous', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function CourseCatalogPage() {
  const { currentUser } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const isRtl = language === 'ar';

  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('Tous');

  useEffect(() => {
    Promise.all([fetchCourses(), fetchEnrollments()]);
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await pb.collection('courses').getFullList({ sort: 'level,title', requestKey: null });
      setCourses(res);
    } catch { setCourses([]); }
    finally { setLoading(false); }
  };

  const fetchEnrollments = async () => {
    if (!currentUser) return;
    try {
      const res = await pb.collection('course_enrollments').getFullList({
        filter: `user_id = "${currentUser.id}"`,
        requestKey: null,
      });
      setEnrollments(res);
    } catch { setEnrollments([]); }
  };

  const isEnrolled = (courseId) => enrollments.some(e => e.course_id === courseId && e.status === 'active');

  const filtered = courses.filter(c => {
    const matchSearch = (c.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === 'Tous' || c.level === levelFilter;
    return matchSearch && matchLevel;
  });

  // Grouper par niveau
  const grouped = LEVELS.slice(1).reduce((acc, lvl) => {
    const items = filtered.filter(c => c.level === lvl);
    if (items.length) acc[lvl] = items;
    return acc;
  }, {});

  return (
    <>
      <Helmet><title>Catalogue des formations — IWS</title></Helmet>
      <div className="min-h-screen flex flex-col bg-slate-50/50" dir={isRtl ? 'rtl' : 'ltr'}>
        <Header />
        <main className="flex-1 py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Hero */}
            <div className="mb-10 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-4">
                <GraduationCap className="w-4 h-4" />
                Plateforme e-learning IWS Laayoune
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-3">Catalogue des formations</h1>
              <p className="text-slate-500 max-w-xl mx-auto">
                Choisissez votre niveau, découvrez le contenu et commencez à apprendre à votre rythme.
              </p>
            </div>

            {/* Filtres */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input placeholder="Rechercher une formation..." value={search}
                  onChange={e => setSearch(e.target.value)} className="pl-9 bg-white" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-muted-foreground" />
                {LEVELS.map(l => (
                  <button key={l} onClick={() => setLevelFilter(l)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      levelFilter === l
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:text-indigo-600'
                    }`}>{l}</button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <BookOpen className="w-14 h-14 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Aucune formation trouvée</p>
              </div>
            ) : (
              <div className="space-y-10">
                {Object.entries(grouped).map(([level, items]) => (
                  <div key={level}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold border ${LEVEL_COLORS[level] || 'bg-gray-100'}`}>{level}</span>
                      <h2 className="text-lg font-semibold text-slate-800">Niveau {level}</h2>
                      <span className="text-sm text-slate-400">{items.length} formation(s)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {items.map(course => {
                        const enrolled = isEnrolled(course.id);
                        const exCount = (() => { try { return JSON.parse(course.exercises || '[]').length; } catch { return 0; } })();
                        return (
                          <Card key={course.id}
                            className="group bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden cursor-pointer"
                            onClick={() => navigate(`/courses/${course.id}`)}>
                            {/* Color band by level */}
                            <div className={`h-1.5 w-full ${
                              level === 'A1' ? 'bg-green-400' : level === 'A2' ? 'bg-lime-400' :
                              level === 'B1' ? 'bg-yellow-400' : level === 'B2' ? 'bg-orange-400' :
                              level === 'C1' ? 'bg-red-400' : 'bg-purple-400'
                            }`} />
                            <CardContent className="p-5">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-2 leading-snug">{course.title}</h3>
                                  {course.description && (
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{course.description}</p>
                                  )}
                                </div>
                                {enrolled && (
                                  <span className="ml-2 flex-shrink-0 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                                    ✓ Inscrit
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration} min</span>
                                <span className="flex items-center gap-1 capitalize"><Tag className="w-3 h-3" />{course.category}</span>
                                {exCount > 0 && <span className="flex items-center gap-1"><Star className="w-3 h-3" />{exCount} exercice(s)</span>}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className={`text-sm font-bold ${course.price > 0 ? 'text-slate-900' : 'text-emerald-600'}`}>
                                  {course.price > 0 ? `${course.price} MAD/mois` : 'Gratuit'}
                                </span>
                                <Button size="sm"
                                  className={`text-xs gap-1 ${enrolled ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                  onClick={e => { e.stopPropagation(); navigate(`/courses/${course.id}`); }}>
                                  {enrolled ? 'Continuer' : 'Voir le cours'}
                                  <ChevronRight className="w-3 h-3" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
