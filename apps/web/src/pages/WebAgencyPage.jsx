import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  Globe, Monitor, Layers, Code2, Import, ArrowRight, CheckCircle2,
  Star, Phone, Mail, Zap, Shield, Clock, TrendingUp, Users,
  Palette, Search, ShoppingCart, Wrench, ChevronDown, ChevronUp,
} from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import WebAgencyAIWizard from '@/components/WebAgencyAIWizard.jsx';

// ── Données statiques ─────────────────────────────────────────────────────────
const TECH_OPTIONS = [
  {
    id: 'iws_builder',
    icon: Monitor,
    title: 'IWS Builder',
    subtitle: 'Notre solution propriétaire',
    desc: 'Créez votre site avec notre constructeur intégré. Simple, rapide, hébergé chez nous.',
    avantages: ['Interface drag & drop', 'Hébergement inclus', 'Support dédié', 'Mises à jour auto'],
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50 border-blue-200',
    badge: 'Recommandé',
    badgeColor: 'bg-blue-600',
  },
  {
    id: 'wordpress',
    icon: Layers,
    title: 'WordPress',
    subtitle: 'CMS populaire & flexible',
    desc: 'Le CMS numéro 1 mondial. Idéal pour blogs, vitrines et e-commerces évolutifs.',
    avantages: ['30 000+ thèmes', 'WooCommerce inclus', 'SEO optimisé', 'Grande communauté'],
    color: 'from-indigo-500 to-purple-500',
    bg: 'bg-indigo-50 border-indigo-200',
    badge: 'Populaire',
    badgeColor: 'bg-indigo-600',
  },
  {
    id: 'import',
    icon: Import,
    title: 'Import de projet',
    subtitle: 'Vous avez déjà un site',
    desc: 'Importez votre projet existant (WordPress, Node.js, React, etc.) vers notre infrastructure.',
    avantages: ['Migration sécurisée', 'Zéro downtime', 'Tous frameworks', 'Audit inclus'],
    color: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-50 border-orange-200',
    badge: 'Migration',
    badgeColor: 'bg-orange-600',
  },
  {
    id: 'node',
    icon: Code2,
    title: 'Développement sur mesure',
    subtitle: 'Node.js, React, API...',
    desc: 'Application web complète développée sur mesure selon vos besoins spécifiques.',
    avantages: ['100% personnalisé', 'API REST / GraphQL', 'Scalable', 'Code source fourni'],
    color: 'from-green-500 to-teal-500',
    bg: 'bg-green-50 border-green-200',
    badge: 'Pro',
    badgeColor: 'bg-green-600',
  },
];

const PROCESS_STEPS = [
  { num: '01', title: 'Consultation gratuite',   desc: 'Nous analysons vos besoins, votre secteur et vos objectifs.', icon: Users },
  { num: '02', title: 'Devis & validation',       desc: 'Proposition chiffrée claire. Vous validez avant qu\'on commence.', icon: CheckCircle2 },
  { num: '03', title: 'Conception & développement', desc: 'Notre équipe crée votre site avec les dernières technologies.', icon: Palette },
  { num: '04', title: 'Tests & livraison',        desc: 'Tests complets, SEO de base, mise en ligne sur votre domaine.', icon: Zap },
];

const AVANTAGES = [
  { icon: Shield,   title: 'Hébergement sécurisé',   desc: 'Serveurs SSL, sauvegardes quotidiennes, 99.9% uptime garanti.' },
  { icon: Search,   title: 'SEO inclus',              desc: 'Optimisation pour Google dès le lancement de votre site.' },
  { icon: Clock,    title: 'Livraison rapide',        desc: 'Sites vitrines livrés en 7 à 14 jours ouvrables.' },
  { icon: Wrench,   title: 'Support & maintenance',   desc: 'Équipe disponible pour toute modification ou problème.' },
  { icon: TrendingUp, title: 'Évolutif',              desc: 'Votre site grandit avec vous. Ajout de fonctionnalités facile.' },
  { icon: ShoppingCart, title: 'E-commerce intégré',  desc: 'Boutique en ligne, paiements Stripe/PayPal, gestion stock.' },
];

const TEMOIGNAGES = [
  { nom: 'Ahmed K.', role: 'Gérant — Cabinet dentaire', stars: 5, texte: 'Site livré en 10 jours, exactement ce que je voulais. Le référencement local a décollé dès le premier mois.' },
  { nom: 'Sara M.',  role: 'Fondatrice — Boutique mode', stars: 5, texte: 'L\'équipe IWS a transformé mon idée en e-commerce professionnel. Les ventes ont augmenté de 40%.' },
  { nom: 'Youssef B.', role: 'Directeur — Agence immobilière', stars: 5, texte: 'Migration de notre vieux site WordPress en douceur. Zéro interruption, résultat impeccable.' },
];

const FAQ = [
  { q: 'Combien coûte un site web ?', r: 'Nos tarifs débutent à 1 500 MAD pour un site vitrine simple. Un devis personnalisé est établi selon vos besoins exacts.' },
  { q: 'Combien de temps pour créer mon site ?', r: 'Entre 7 et 21 jours selon la complexité. Un site vitrine standard est livré en moins de 2 semaines.' },
  { q: 'Puis-je modifier mon site moi-même ?', r: 'Oui, tous nos sites sont livrés avec une interface d\'administration simple. Formation incluse.' },
  { q: 'Proposez-vous l\'hébergement ?', r: 'Oui. Hébergement Hostinger haute performance inclus ou disponible en option. Domaine .ma, .com, .fr disponibles.' },
  { q: 'Et si j\'ai déjà un site WordPress ?', r: 'Nous pouvons migrer votre site existant sans perte de données ni de référencement. Audit gratuit inclus.' },
];

// ── Composant principal ───────────────────────────────────────────────────────
const WebAgencyPage = () => {
  const [services, setServices] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    pb.collection('web_services')
      .getFullList({ filter: 'actif=true', sort: 'prix_base', requestKey: null })
      .then(setServices)
      .catch(() => {});
  }, []);

  return (
    <>
      <Helmet>
        <title>Création de sites web professionnels — IWS Laayoune</title>
        <meta name="description" content="Agence web à Laayoune. Création de sites vitrines, e-commerce, WordPress et applications sur mesure. Devis gratuit en 24h." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 pt-20">

          {/* ── Hero ──────────────────────────────────────────────────── */}
          <section className="relative min-h-[85vh] flex items-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-blue-900" />
            {/* Grille déco */}
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

            <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-20">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent font-semibold text-sm mb-8 border border-accent/30 backdrop-blur-sm">
                  <Globe className="w-3.5 h-3.5" />
                  Agence Web — Laayoune, Maroc
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                  Votre site web<br />
                  <span className="text-accent">professionnel</span><br />
                  en 10 jours.
                </h1>
                <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-xl">
                  Sites vitrines, e-commerces, WordPress ou développement sur mesure.
                  Hébergement, domaine et SEO inclus.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/agence/commande">
                    <Button size="lg" className="bg-accent hover:bg-accent/90 text-primary font-bold px-10 h-14 text-lg rounded-xl shadow-xl shadow-accent/30">
                      Démarrer mon projet
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <a href="tel:+212XXXXXXXXX">
                    <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 h-14 text-base rounded-xl backdrop-blur-sm">
                      <Phone className="w-4 h-4 mr-2" />Devis gratuit
                    </Button>
                  </a>
                </div>

                {/* Stats hero */}
                <div className="flex flex-wrap gap-8 mt-14">
                  {[
                    { value: '50+', label: 'Sites livrés' },
                    { value: '10j', label: 'Délai moyen' },
                    { value: '100%', label: 'Clients satisfaits' },
                  ].map(s => (
                    <div key={s.value}>
                      <p className="text-3xl font-extrabold text-accent">{s.value}</p>
                      <p className="text-sm text-slate-400">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── IA Wizard — Proposition de site ───────────────────── */}
          <section className="py-20 bg-background">
            <div className="max-w-3xl mx-auto px-6">
              <div className="text-center mb-10">
                <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                  ✨ Nouveau — Propulsé par IA
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-3">
                  Votre site en quelques secondes
                </h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Décrivez votre activité, notre assistant IA génère instantanément une proposition
                  de site personnalisée : structure, design, contenu et prix.
                </p>
              </div>
              <WebAgencyAIWizard />
            </div>
          </section>

          {/* ── Modes de création ──────────────────────────────────── */}
          <section className="py-24 bg-muted/40">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-4">
                  Choisissez votre technologie
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Chaque projet est unique. Nous vous conseillons la meilleure solution selon vos besoins et votre budget.
                </p>
                <div className="w-20 h-1.5 bg-accent mx-auto rounded-full mt-6" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {TECH_OPTIONS.map(tech => {
                  const Icon = tech.icon;
                  return (
                    <div key={tech.id} className={`bg-card border-2 rounded-3xl p-8 hover:shadow-xl transition-all duration-300 group ${tech.bg}`}>
                      <div className="flex items-start gap-4 mb-5">
                        <div className={`p-3 rounded-2xl bg-gradient-to-br ${tech.color} text-white shadow-lg shrink-0`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-extrabold text-primary">{tech.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full text-white font-bold ${tech.badgeColor}`}>{tech.badge}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{tech.subtitle}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{tech.desc}</p>
                      <ul className="space-y-2 mb-6">
                        {tech.avantages.map(av => (
                          <li key={av} className="flex items-center gap-2 text-sm text-foreground">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />{av}
                          </li>
                        ))}
                      </ul>
                      <Link to={tech.id === 'wordpress' ? '/agence/wordpress' : `/agence/commande?tech=${tech.id}`}>
                        <Button className={`w-full bg-gradient-to-r ${tech.color} text-white font-bold rounded-xl hover:opacity-90`}>
                          Choisir {tech.title} <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ── Services (depuis PocketBase) ──────────────────────── */}
          {services.length > 0 && (
            <section className="py-20 bg-background">
              <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-4">Nos offres</h2>
                  <p className="text-muted-foreground">Prix transparents, sans surprise.</p>
                  <div className="w-20 h-1.5 bg-accent mx-auto rounded-full mt-6" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map(s => (
                    <div key={s.id} className="bg-card border border-border rounded-3xl p-7 hover:border-accent/40 hover:shadow-xl transition-all duration-300 flex flex-col">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-5">
                        <Globe className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-extrabold text-primary mb-2">{s.nom}</h3>
                      <p className="text-sm text-muted-foreground mb-5 flex-1 leading-relaxed">{s.description}</p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                        <div>
                          <span className="text-xl font-extrabold text-accent">à partir de {s.prix_base} MAD</span>
                        </div>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">~{s.delai_jours} jours</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-10">
                  <Link to="/agence/commande">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-10 rounded-xl">
                      Commander maintenant <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* ── Processus ─────────────────────────────────────────── */}
          <section className="py-20 bg-primary text-white">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-14">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Comment ça marche ?</h2>
                <div className="w-20 h-1.5 bg-accent mx-auto rounded-full" />
              </div>
              <div className="grid md:grid-cols-4 gap-8">
                {PROCESS_STEPS.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={i} className="text-center">
                      <div className="relative mb-6">
                        <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto border border-accent/30">
                          <Icon className="w-7 h-7 text-accent" />
                        </div>
                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-accent text-primary text-xs font-extrabold rounded-full flex items-center justify-center">
                          {i + 1}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold mb-2">{step.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ── Avantages ─────────────────────────────────────────── */}
          <section className="py-20 bg-muted/40">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-14">
                <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-4">Pourquoi choisir IWS ?</h2>
                <div className="w-20 h-1.5 bg-accent mx-auto rounded-full" />
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {AVANTAGES.map((av, i) => {
                  const Icon = av.icon;
                  return (
                    <div key={i} className="bg-card border border-border rounded-2xl p-6 hover:border-accent/40 hover:shadow-md transition-all">
                      <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-accent" />
                      </div>
                      <h3 className="font-bold text-primary mb-2">{av.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{av.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ── Domaine Hostinger ─────────────────────────────────── */}
          <section className="py-16 bg-background">
            <div className="max-w-7xl mx-auto px-6">
              <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-3xl p-10 text-white">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold mb-4 border border-white/20">
                      🌍 Domaine & Hébergement
                    </div>
                    <h2 className="text-3xl font-extrabold mb-4">Besoin d'un nom de domaine ?</h2>
                    <p className="text-slate-300 leading-relaxed mb-6">
                      Réservez votre domaine .com, .ma, .fr directement via notre partenaire Hostinger.
                      Hébergement haute performance inclus dans tous nos forfaits.
                    </p>
                    <ul className="space-y-2 mb-8">
                      {['À partir de 59 MAD/an (.com)', 'SSL gratuit inclus', 'Emails professionnels', 'Hébergement SSD ultra-rapide'].map(item => (
                        <li key={item} className="flex items-center gap-2 text-sm text-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />{item}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-3">
                      <Link to="/hostinger/offres">
                        <Button className="bg-accent hover:bg-accent/90 text-primary font-bold px-6 rounded-xl">
                          Voir les offres Hostinger
                        </Button>
                      </Link>
                      <Link to="/agence/commande">
                        <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-xl">
                          Inclure dans ma commande
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-8xl mb-4">🌐</div>
                      <p className="text-white/60 text-sm">Partenaire officiel Hostinger</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Témoignages ───────────────────────────────────────── */}
          <section className="py-20 bg-muted/40">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-14">
                <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-4">Ils nous font confiance</h2>
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
                    <div>
                      <p className="font-bold text-primary text-sm">{t.nom}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── FAQ ───────────────────────────────────────────────── */}
          <section className="py-20 bg-background">
            <div className="max-w-3xl mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-4">Questions fréquentes</h2>
                <div className="w-20 h-1.5 bg-accent mx-auto rounded-full" />
              </div>
              <div className="space-y-3">
                {FAQ.map((faq, i) => (
                  <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/30 transition-colors"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <span className="font-semibold text-foreground text-sm pr-4">{faq.q}</span>
                      {openFaq === i ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                    </button>
                    {openFaq === i && (
                      <div className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
                        {faq.r}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA Final ─────────────────────────────────────────── */}
          <section className="py-24 bg-gradient-to-br from-primary via-blue-900 to-indigo-900 text-white text-center">
            <div className="max-w-2xl mx-auto px-6">
              <div className="text-5xl mb-6">🚀</div>
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                Prêt à lancer<br />votre site web ?
              </h2>
              <p className="text-slate-300 mb-10 text-lg leading-relaxed">
                Devis gratuit en 24h. Premier échange sans engagement.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/agence/commande">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-primary font-bold px-12 h-14 text-lg rounded-xl w-full sm:w-auto shadow-xl shadow-accent/30">
                    Démarrer mon projet
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <a href="mailto:contact@iws.ma">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold px-10 h-14 text-base rounded-xl w-full sm:w-auto">
                    <Mail className="w-4 h-4 mr-2" />Nous écrire
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

export default WebAgencyPage;
