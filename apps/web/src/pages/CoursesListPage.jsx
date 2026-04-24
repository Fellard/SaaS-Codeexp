
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

// ── Détection langue depuis les données du cours ─────────────────
const detectLang = (course) => {
  const hay = [
    course.cours_nom,
    course.categorie,
    course.category,
    course.titre,
    course.title,
    course.title_fr,
  ].filter(Boolean).join(' ').toLowerCase();
  if (/anglais|english|brit|uk/.test(hay)) return 'en';
  if (/arab|عرب/.test(hay)) return 'ar';
  if (/français|french|franc/.test(hay)) return 'fr';
  return null;
};

// ── Couverture SVG par langue ─────────────────────────────────────
const LANG_COVERS = {
  fr: {
    g1: '#00274D', g2: '#003d73',
    label: 'LANGUE · FRANÇAIS',
    title: 'Français',
    italic: true,
  },
  en: {
    g1: '#5c1a1a', g2: '#7a2020',
    label: 'LANGUAGE · ENGLISH',
    title: 'English',
    italic: true,
  },
  ar: {
    g1: '#0d3324', g2: '#154a32',
    label: 'اللغة · العربية',
    title: 'العربية',
    italic: false,
    arabic: true,
  },
};

const CourseCoverSVG = ({ course, sec, secCfg }) => {
  const lang = sec === 'langues' ? detectLang(course) : null;
  const cfg = lang ? LANG_COVERS[lang] : null;
  const niveau = course.niveau || course.level || course.Level || '';

  // Couleur de fond pour les sections non-langue
  const sectionColors = {
    informatique: { g1: '#1a3a1a', g2: '#1e4d2a' },
    programmation: { g1: '#1e1040', g2: '#2d1a5e' },
  };

  const bg = cfg ? cfg : (sectionColors[sec] || { g1: '#00274D', g2: '#003d73' });

  const uid = course.id || Math.random().toString(36).slice(2);

  return (
    <svg
      viewBox="0 0 480 270"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id={`cg-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={bg.g1} />
          <stop offset="100%" stopColor={bg.g2} />
        </linearGradient>
      </defs>

      {/* Fond */}
      <rect width="480" height="270" fill={`url(#cg-${uid})`} />

      {/* Cercles déco */}
      <circle cx="420" cy="-20" r="200" fill="#ffffff" fillOpacity="0.04" />
      <circle cx="50" cy="300" r="160" fill="#000000" fillOpacity="0.15" />

      {/* Bande accent orange IWS */}
      <rect x="0" y="240" width="480" height="4" fill="#FF9500" />

      {/* Filet vertical gauche */}
      <rect x="44" y="44" width="3" height="80" fill="#FF9500" opacity="0.9" rx="2" />

      {/* Label langue */}
      <text
        x="60" y="76"
        fontFamily="'Plus Jakarta Sans', sans-serif"
        fontSize="11" fontWeight="700"
        fill="#FF9500" letterSpacing="3"
      >
        {cfg ? cfg.label : (secCfg ? secCfg.label.toUpperCase() : 'IWS LEARN')}
      </text>

      {/* Grand titre */}
      {cfg?.arabic ? (
        <text
          x="44" y="148"
          fontFamily="'Amiri', serif"
          fontSize="56" fontWeight="700"
          fill="white" opacity="0.95"
        >
          {cfg.title}
        </text>
      ) : (
        <text
          x="44" y="138"
          fontFamily="Georgia, serif"
          fontStyle={cfg?.italic ? 'italic' : 'normal'}
          fontSize="62" fontWeight="400"
          fill="white" opacity="0.95"
          letterSpacing="-1"
        >
          {cfg ? cfg.title : (secCfg ? secCfg.label : 'Cours')}
        </text>
      )}

      {/* Badge niveau */}
      {niveau && (
        <>
          <rect x="44" y="166" width="44" height="22" rx="4" fill="#FF9500" />
          <text
            x="66" y="181"
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontSize="11" fontWeight="700"
            fill="#00274D" textAnchor="middle"
          >
            {niveau}
          </text>
        </>
      )}

      {/* IWS Learn watermark */}
      <text
        x="436" y="262"
        fontFamily="'Plus Jakarta Sans', sans-serif"
        fontSize="10" fontWeight="700"
        fill="rgba(255,255,255,0.35)"
        textAnchor="end" letterSpacing="1"
      >
        IWS LEARN
      </text>
    </svg>
  );
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

  // Groupement par langue pour la section Langues
  const LANG_GROUP_CONFIG = {
    fr: { label: 'Français', color: '#00274D', accent: '#003d73', badge: 'bg-blue-100 text-blue-800' },
    en: { label: 'English',  color: '#5c1a1a', accent: '#7a2020', badge: 'bg-red-100 text-red-800' },
    ar: { label: 'العربية', color: '#0d3324', accent: '#154a32', badge: 'bg-green-100 text-green-800', rtl: true },
    other: { label: 'Autres langues', color: '#1e293b', accent: '#334155', badge: 'bg-slate-100 text-slate-700' },
  };

  const langGroups = React.useMemo(() => {
    if (activeSection !== 'langues') return null;
    const groups = { fr: [], en: [], ar: [], other: [] };
    filteredCourses.forEach(c => {
      const l = detectLang(c);
      (groups[l] || groups.other).push(c);
    });
    return groups;
  }, [filteredCourses, activeSection]);

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
            ) : langGroups ? (
              /* ── Vue groupée par langue ─────────────────────── */
              <div className="space-y-12">
                {Object.entries(langGroups).map(([langKey2, langCourses]) => {
                  if (!langCourses.length) return null;
                  const lgCfg = LANG_GROUP_CONFIG[langKey2];
                  return (
                    <div key={langKey2}>
                      {/* En-tête du groupe */}
                      <div className="flex items-center gap-4 mb-6">
                        <div
                          className="w-1 h-10 rounded-full flex-shrink-0"
                          style={{ background: lgCfg.color }}
                        />
                        <div>
                          <h3
                            className="text-xl font-bold"
                            style={{ color: lgCfg.color }}
                            dir={lgCfg.rtl ? 'rtl' : 'ltr'}
                          >
                            {lgCfg.label}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {langCourses.length} formation{langCourses.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {langCourses.map((course) => {
                          const sec = getCourseSection(course);
                          const secCfg = sec ? SECTIONS[sec] : null;
                          const displayTitle = course[`title_${langKey}`] || course.titre || course.title;
                          const displayDesc  = course[`description_${langKey}`] || course.description;
                          const price = course.prix || course.price || 0;
                          return (
                            <Card key={course.id} className="flex flex-col hover:shadow-lg border-border rounded-2xl overflow-hidden transition-shadow duration-200">
                              <div className="h-1.5" style={{ background: `linear-gradient(to right, ${lgCfg.color}, ${lgCfg.accent})` }} />
                              <div className="aspect-video relative overflow-hidden">
                                <CourseCoverSVG course={course} sec={sec} secCfg={secCfg} />
                              </div>
                              <CardContent className="p-6 flex flex-col flex-1">
                                {(course.cours_nom || (course.niveau || course.level)) && (
                                  <div className="flex gap-1.5 flex-wrap mb-2">
                                    {course.cours_nom && (
                                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{course.cours_nom}</span>
                                    )}
                                    {(course.niveau || course.level) && (
                                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${lgCfg.badge}`}>{course.niveau || course.level}</span>
                                    )}
                                  </div>
                                )}
                                <h3 className="font-bold text-foreground text-lg mb-2 line-clamp-2" dir={lgCfg.rtl ? 'rtl' : 'ltr'}>{displayTitle}</h3>
                                {displayDesc && (
                                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1 leading-relaxed">{displayDesc}</p>
                                )}
                                <div className="flex items-center justify-between text-sm text-muted-foreground mb-5 bg-muted/40 px-3 py-2 rounded-lg">
                                  {(course.duree || course.duration) && (
                                    <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /><span>{course.duree || course.duration} h</span></div>
                                  )}
                                  <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-primary" /><span>{course.instructeur || course.instructor || 'IWS'}</span></div>
                                </div>
                                <div className="flex items-center justify-between border-t border-border pt-4">
                                  <span className="font-bold text-xl text-primary">{price > 0 ? `${price} MAD` : 'Gratuit'}</span>
                                  <Link to={`/courses/${course.id}`}>
                                    <Button size="sm" className="bg-accent hover:bg-accent/90 text-primary font-bold rounded-xl">Voir le cours</Button>
                                  </Link>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
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

                      {/* Course cover */}
                      <div className="aspect-video relative overflow-hidden">
                        <CourseCoverSVG course={course} sec={sec} secCfg={secCfg} />
                        {secCfg && (
                          <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${secCfg.badge}`}>
                            {secCfg.label}
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
