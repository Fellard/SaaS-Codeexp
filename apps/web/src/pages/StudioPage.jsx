import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  Mic2, Sliders, Disc, Headphones, ArrowRight, Music,
  Radio, Clock, Star, CheckCircle2, Phone, Mail,
} from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation.js';
import { useLanguage } from '@/hooks/useLanguage.jsx';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';

// Map service names to icons
const SERVICE_ICONS = {
  'enregistrement vocal':     Mic2,
  'mixage':                   Sliders,
  'mastering':                Disc,
  'production musicale':      Music,
  'enregistrement instruments': Headphones,
  'podcast':                  Radio,
};
const getIcon = (nom) => {
  const key = Object.keys(SERVICE_ICONS).find(k => nom?.toLowerCase().includes(k));
  return SERVICE_ICONS[key] || Mic2;
};

const EQUIPEMENTS = [
  'Cabine insonorisée professionnelle',
  'Interface audio Focusrite Clarett+',
  'Microphones Neumann & Shure',
  'Préamplis SSL & Universal Audio',
  'Monitoring Yamaha HS8',
  'Pro Tools & Ableton Live',
  'Prise de son instruments acoustiques',
  'Plugins haut de gamme (Waves, FabFilter)',
];

const TEMOIGNAGES = [
  { nom: 'Karim B.', stars: 5, texte: 'Studio impeccable, ingénieur très professionnel. Mon EP sonne parfaitement.' },
  { nom: 'Salma R.', stars: 5, texte: 'Mastering de qualité, mon single est maintenant prêt pour Spotify et Deezer.' },
  { nom: 'DJ Nass',  stars: 5, texte: 'Excellente prise de son, ambiance top. Je reviens pour chaque projet.' },
];

const StudioPage = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRtl = language?.startsWith('ar');
  const [services, setServices] = useState([]);

  useEffect(() => {
    pb.collection('studio_services').getFullList({ sort: 'prix', requestKey: null })
      .then(setServices)
      .catch(() => {});
  }, []);

  return (
    <>
      <Helmet>
        <title>Studio d'enregistrement — IWS Records Laayoune</title>
        <meta name="description" content="Studio d'enregistrement professionnel à Laayoune. Enregistrement vocal, mixage, mastering, production musicale. Réservez votre session en ligne." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
        <Header />

        <main className="flex-1 pt-20">

          {/* ── Hero ─────────────────────────────────────────────────────── */}
          <section className="relative h-[80vh] min-h-[560px] flex items-center">
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1678356384975-331f4f961ea2"
                alt="Studio d'enregistrement"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-transparent" />
            </div>
            <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent font-semibold text-sm mb-6 border border-accent/30 backdrop-blur-sm">
                  <Star className="w-3.5 h-3.5 fill-accent" />
                  Studio professionnel — Laayoune
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                  IWS Records<br /><span className="text-accent">Studio</span>
                </h1>
                <p className="text-lg text-slate-200 mb-8 leading-relaxed">
                  Donnez vie à votre musique dans un espace d'enregistrement professionnel équipé des meilleures technologies audio.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/studio/reservation">
                    <Button size="lg" className="bg-accent hover:bg-accent/90 text-primary font-bold px-8 h-13 text-base rounded-xl shadow-lg shadow-accent/30">
                      Réserver une session
                      <ArrowRight className={`w-5 h-5 ${isRtl ? 'mr-2 rotate-180' : 'ml-2'}`} />
                    </Button>
                  </Link>
                  <a href="tel:+212528XXXXXX">
                    <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 h-13 text-base rounded-xl backdrop-blur-sm">
                      <Phone className="w-4 h-4 mr-2" />Appeler
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* ── Services (depuis PocketBase) ──────────────────────────────── */}
          <section className="py-20 bg-muted/40">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-14">
                <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-4">Nos services</h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  De l'enregistrement au mastering, nous vous accompagnons à chaque étape de votre projet musical.
                </p>
                <div className="w-20 h-1.5 bg-accent mx-auto rounded-full mt-6" />
              </div>

              {services.length === 0 ? (
                /* Fallback statique si PocketBase vide */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { icon: Mic2,      title: 'Enregistrement vocal',    desc: 'Cabine insonorisée, micros de référence.', prix: '150 MAD/h' },
                    { icon: Sliders,   title: 'Mixage audio',            desc: 'Équilibrage, effets et spatialisation stéréo.', prix: '200 MAD/h' },
                    { icon: Disc,      title: 'Mastering',               desc: 'Finalisation pour streaming, CD et vinyle.', prix: '300 MAD/h' },
                    { icon: Headphones,title: 'Production musicale',     desc: 'Beats, arrangements et composition assistée.', prix: '250 MAD/h' },
                  ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <div key={i} className="bg-card p-7 rounded-3xl border border-border hover:border-accent/40 hover:shadow-xl transition-all duration-300 group">
                        <div className="w-14 h-14 bg-primary/5 group-hover:bg-accent/10 rounded-2xl flex items-center justify-center mb-5 transition-colors">
                          <Icon className="w-7 h-7 text-accent" />
                        </div>
                        <h3 className="text-lg font-bold text-primary mb-2">{s.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{s.desc}</p>
                        <span className="text-base font-extrabold text-accent">{s.prix}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map(s => {
                    const Icon = getIcon(s.nom);
                    return (
                      <div key={s.id} className="bg-card p-7 rounded-3xl border border-border hover:border-accent/40 hover:shadow-xl transition-all duration-300 group flex flex-col">
                        <div className="w-14 h-14 bg-primary/5 group-hover:bg-accent/10 rounded-2xl flex items-center justify-center mb-5 transition-colors">
                          <Icon className="w-7 h-7 text-accent" />
                        </div>
                        <h3 className="text-xl font-bold text-primary mb-2">{s.nom}</h3>
                        <p className="text-sm text-muted-foreground mb-4 flex-1 leading-relaxed">{s.description}</p>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                          <div>
                            <span className="text-xl font-extrabold text-accent">{s.prix} MAD</span>
                            <span className="text-xs text-muted-foreground ml-1">/ heure</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />min {s.duree || 60} min
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="text-center mt-12">
                <Link to="/studio/reservation">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-10 rounded-xl">
                    Réserver maintenant
                    <ArrowRight className={`w-5 h-5 ${isRtl ? 'mr-2 rotate-180' : 'ml-2'}`} />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* ── Équipements ───────────────────────────────────────────────── */}
          <section className="py-20 bg-primary text-white">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
                    Équipement<br /><span className="text-accent">haut de gamme</span>
                  </h2>
                  <p className="text-slate-300 mb-8 leading-relaxed">
                    Notre studio est équipé de matériel professionnel utilisé par les ingénieurs du son des plus grandes productions mondiales.
                  </p>
                  <ul className="space-y-3">
                    {EQUIPEMENTS.map((e, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />{e}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600"
                    alt="Console de mixage"
                    className="rounded-3xl shadow-2xl w-full object-cover h-80 md:h-96"
                  />
                  <div className="absolute -bottom-4 -left-4 bg-accent text-primary font-bold px-5 py-3 rounded-2xl shadow-lg text-sm">
                    🎵 Qualité professionnelle
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Témoignages ───────────────────────────────────────────────── */}
          <section className="py-20 bg-background">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-14">
                <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-4">Ce que disent nos artistes</h2>
                <div className="w-20 h-1.5 bg-accent mx-auto rounded-full" />
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {TEMOIGNAGES.map((t, i) => (
                  <div key={i} className="bg-card border border-border rounded-3xl p-7">
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: t.stars }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground text-sm mb-5 leading-relaxed italic">"{t.texte}"</p>
                    <p className="font-bold text-primary text-sm">{t.nom}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA Final ─────────────────────────────────────────────────── */}
          <section className="py-20 bg-gradient-to-br from-purple-900 via-primary to-indigo-900 text-white text-center">
            <div className="max-w-2xl mx-auto px-6">
              <div className="text-5xl mb-4">🎙️</div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Prêt à enregistrer ?</h2>
              <p className="text-slate-300 mb-8 text-lg">
                Réservez votre session en ligne en quelques clics. Disponible 7j/7.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/studio/reservation">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-primary font-bold px-10 h-13 text-base rounded-xl w-full sm:w-auto">
                    Réserver une session
                  </Button>
                </Link>
                <a href="mailto:studio@iwsrecords.com">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold px-10 h-13 text-base rounded-xl w-full sm:w-auto">
                    <Mail className="w-4 h-4 mr-2" />Nous contacter
                  </Button>
                </a>
              </div>
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </>
  );
};

export default StudioPage;
