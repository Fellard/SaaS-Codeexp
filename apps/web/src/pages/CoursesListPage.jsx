
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, BookOpen, User, Languages, Monitor, Code2, ChevronRight, GraduationCap, ArrowRight, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/i18n/useTranslation.js';
import { useLanguage } from '@/hooks/useLanguage.jsx';

// ── Programme sections config ────────────────────────────────────
const SECTIONS = {
  langues: {
    key: 'langues',
    label: 'Langues',
    subtitle: 'Français · Anglais · Arabe · Espagnol',
    desc: 'Maîtrisez une nouvelle langue avec nos formateurs certifiés. Niveaux A1 à C2, cours individuels ou en groupe.',
    icon: Languages,
    gradient: 'from-blue-600 to-sky-500',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-100 text-blue-700',
    categories: ['langue', 'langues', 'français', 'anglais', 'arabe', 'espagnol', 'french', 'english', 'arabic'],
  },
  informatique: {
    key: 'informatique',
    label: 'Informatique',
    subtitle: 'Bureautique · Réseaux · Maintenance',
    desc: 'Bureautique, maintenance matérielle, réseaux et graphisme. Des compétences numériques pour le marché du travail.',
    icon: Monitor,
    gradient: 'from-green-600 to-emerald-500',
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800',
    badge: 'bg-green-100 text-green-700',
    categories: ['informatique', 'bureautique', 'maintenance', 'réseau', 'network', 'graphisme', 'it', 'ordinateur'],
  },
  programmation: {
    key: 'programmation',
    label: 'Programmation',
    subtitle: 'Web · Mobile · Python · JavaScript',
    desc: 'Développez des applications web et mobiles. HTML, CSS, JavaScript, React, Python — du débutant au avancé.',
    icon: Code2,
    gradient: 'from-purple-600 to-indigo-500',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-800',
    badge: 'bg-purple-100 text-purple-700',
    categories: ['programmation', 'développement', 'web', 'mobile', 'python', 'javascript', 'html', 'css', 'react', 'code'],
  },
};

const getCourseSection = (course) => {
  // Check direct section field first
  if (course.section && SECTIONS[course.section]) return course.section;
  const cat = (course.categorie || course.category || '').toLowerCase();
  for (const [key, sec] of Object.entries(SECTIONS)) {
    if (sec.categories.some(c => cat.includes(c))) return key;
  }
  return null;
};

// ── Programme card ───────────────────────────────────────────────
const ProgrammeCard = ({ section, count, active, onClick }) => {
  const Icon = section.icon;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 group ${
        active
          ? `border-transparent shadow-lg ring-2 ring-offset-2 ${section.bg}`
          : `${section.border} hover:shadow-md hover:${section.bg} bg-card`
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${section.gradient} shadow-sm flex-shrink-0`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {active && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${section.badge}`}>
            Sélectionné
          </span>
        )}
      </div>
      <h3 className="font-bold text-lg text-foreground mb-1">{section.label}</h3>
      <p className="text-xs text-muted-foreground mb-2 font-medium">{section.subtitle}</p>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{section.desc}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" />
          {count} formation{count !== 1 ? 's' : ''}
        </span>
        <ChevronRight className={`w-4 h-4 transition-transform ${active ? 'text-foreground rotate-90' : 'text-muted-foreground group-hover:translate-x-1'}`} />
      </div>
    </button>
  );
};

// ── Main page ────────────────────────────────────────────────────
const CoursesListPage = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(searchParams.get('section') || null);

  const langKey = language?.startsWith('ar') ? 'ar' : language?.startsWith('en') ? 'en' : 'fr';
  const isRtl = langKey === 'ar';

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const records = await pb.collection('courses').getFullList({
          sort: '-created',
          requestKey: null,
        });
        setCourses(records);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Count courses per section
  const sectionCounts = Object.keys(SECTIONS).reduce((acc, key) => {
    acc[key] = courses.filter(c => getCourseSection(c) === key).length;
    return acc;
  }, {});

  // Filtered courses
  const filteredCourses = activeSection
    ? courses.filter(c => getCourseSection(c) === activeSection)
    : courses;

  const handleSectionClick = (key) => {
    setActiveSection(prev => prev === key ? null : key);
  };

  const handleInscription = (section = null) => {
    const url = section
      ? `/formation/inscription?programme=${section}`
      : '/formation/inscription';
    navigate(url);
  };

  return (
    <>
      <Helmet>
        <title>Nos Formations - IWS LAAYOUNE</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-muted" dir={isRtl ? 'rtl' : 'ltr'}>
        <Header />

        <main className="flex-1 pt-20 pb-24">

          {/* ── Hero ────────────────────────────────────────────── */}
          <div className="bg-primary py-20 text-center mb-0">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm px-4 py-1.5 rounded-full mb-4 border border-white/20">
              <GraduationCap className="w-4 h-4" />
              Centre de Formation IWS
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Nos Formations</h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto px-4">
              Développez vos compétences avec nos formations professionnelles certifiantes adaptées au marché du travail.
            </p>
            <div className="w-24 h-1.5 bg-accent mx-auto rounded-full mt-6 mb-8" />
            <Button
              onClick={() => handleInscription()}
              className="bg-accent hover:bg-accent/90 text-primary font-bold px-8 py-3 rounded-xl text-base shadow-lg"
            >
              S'inscrire à une formation <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          {/* ── 3 Programme cards ───────────────────────────────── */}
          <div className="bg-card border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground">Choisissez votre programme</h2>
                <p className="text-muted-foreground text-sm mt-2">Cliquez sur un programme pour filtrer les formations disponibles</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {Object.values(SECTIONS).map(section => (
                  <ProgrammeCard
                    key={section.key}
                    section={section}
                    count={sectionCounts[section.key] || 0}
                    active={activeSection === section.key}
                    onClick={() => handleSectionClick(section.key)}
                  />
                ))}
              </div>

              {/* CTA inscription par programme */}
              {activeSection && SECTIONS[activeSection] && (
                <div className={`mt-6 rounded-2xl border ${SECTIONS[activeSection].border} ${SECTIONS[activeSection].bg} p-5 flex flex-col sm:flex-row items-center justify-between gap-4`}>
                  <div className="flex items-center gap-3">
                    {React.createElement(SECTIONS[activeSection].icon, { className: 'w-6 h-6 text-foreground' })}
                    <div>
                      <p className="font-semibold text-foreground">Programme {SECTIONS[activeSection].label}</p>
                      <p className="text-sm text-muted-foreground">{SECTIONS[activeSection].subtitle}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleInscription(activeSection)}
                    className={`bg-gradient-to-r ${SECTIONS[activeSection].gradient} text-white font-bold px-6 rounded-xl shrink-0`}
                  >
                    S'inscrire en {SECTIONS[activeSection].label}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* ── Course list ──────────────────────────────────────── */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            {/* Section header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {activeSection
                    ? `Formations en ${SECTIONS[activeSection]?.label}`
                    : 'Toutes les formations'}
                </h2>
                {!loading && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {filteredCourses.length} formation{filteredCourses.length !== 1 ? 's' : ''} disponible{filteredCourses.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              {activeSection && (
                <Button variant="ghost" size="sm" onClick={() => setActiveSection(null)} className="text-muted-foreground">
                  Voir tout
                </Button>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="border-none shadow-md rounded-2xl overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-4" />
                      <Skeleton className="h-4 w-full mb-6" />
                      <Skeleton className="h-12 w-full rounded-xl" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-3xl border border-border">
                <BookOpen className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-lg font-semibold text-foreground mb-2">
                  {activeSection ? `Aucune formation en ${SECTIONS[activeSection]?.label} pour le moment` : 'Aucune formation disponible'}
                </p>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  Nos formations sont en cours de préparation. Inscrivez-vous dès maintenant pour être parmi les premiers informés.
                </p>
                <Button onClick={() => handleInscription(activeSection)} className="bg-accent hover:bg-accent/90 text-primary font-bold rounded-xl">
                  Pré-inscription gratuite
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => {
                  const sec = getCourseSection(course);
                  const secCfg = sec ? SECTIONS[sec] : null;
                  const displayTitle = course[`title_${langKey}`] || course.titre || course.title;
                  const displayDesc  = course[`description_${langKey}`] || course.description;
                  const price = course.prix || course.price || 0;

                  return (
                    <Card key={course.id} className="flex flex-col hover:shadow-lg border-border rounded-2xl overflow-hidden transition-shadow duration-200">
                      {/* Coloured top stripe */}
                      {secCfg && (
                        <div className={`h-1.5 bg-gradient-to-r ${secCfg.gradient}`} />
                      )}

                      {/* Course image placeholder */}
                      <div className="aspect-video bg-primary/5 flex items-center justify-center relative">
                        {secCfg
                          ? React.createElement(secCfg.icon, { className: 'w-14 h-14 opacity-20 text-foreground' })
                          : <BookOpen className="w-12 h-12 text-primary/20" />
                        }
                        {secCfg && (
                          <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${secCfg.badge}`}>
                            {secCfg.label}
                          </span>
                        )}
                        {(course.niveau || course.level || course.Level) && (
                          <span className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full bg-black/50 text-white">
                            {course.niveau || course.level || course.Level}
                          </span>
                        )}
                      </div>

                      <CardContent className="p-6 flex flex-col flex-1">
                        {/* Cours nom + niveau mini badges */}
                      {(course.cours_nom || (course.niveau || course.level)) && (
                        <div className="flex gap-1.5 flex-wrap mb-2">
                          {course.cours_nom && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{course.cours_nom}</span>
                          )}
                          {(course.niveau || course.level) && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">{course.niveau || course.level}</span>
                          )}
                        </div>
                      )}
                      <h3 className="font-bold text-foreground text-lg mb-2 line-clamp-2">{displayTitle}</h3>
                        {displayDesc && (
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1 leading-relaxed">{displayDesc}</p>
                        )}

                        {/* Meta */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-5 bg-muted/40 px-3 py-2 rounded-lg">
                          {(course.duree || course.duration) && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-primary" />
                              <span>{course.duree || course.duration} h</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-primary" />
                            <span>{course.instructeur || course.instructor || 'IWS'}</span>
                          </div>
                          {course.enrolledCount > 0 && (
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-primary" />
                              <span>{course.enrolledCount}</span>
                            </div>
                          )}
                        </div>

                        {/* Price + CTA */}
                        <div className="flex items-center justify-between border-t border-border pt-4">
                          <span className="font-bold text-xl text-primary">
                            {price > 0 ? `${price} MAD` : 'Gratuit'}
                          </span>
                          <Link to={`/courses/${course.id}`}>
                            <Button size="sm" className="bg-accent hover:bg-accent/90 text-primary font-bold rounded-xl">
                              Voir le cours
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Bottom CTA */}
            <div className="mt-16 text-center bg-card rounded-3xl border border-border p-10">
              <GraduationCap className="w-12 h-12 text-primary/30 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-2">Prêt à commencer votre formation ?</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Inscrivez-vous maintenant et rejoignez nos étudiants. Nos conseillers pédagogiques vous accompagnent de A à Z.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button onClick={() => handleInscription()} className="bg-accent hover:bg-accent/90 text-primary font-bold px-8 rounded-xl">
                  S'inscrire maintenant
                </Button>
                <Link to="/contact">
                  <Button variant="outline" className="px-8 rounded-xl">
                    Nous contacter
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CoursesListPage;
