
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Wrench, Search, Megaphone, PenTool, Code, LineChart, ArrowRight, Globe, Users, HeartHandshake as Handshake, Star, CheckCircle2, Briefcase, Clock, Headphones as Headset } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation.js';
import { useLanguage } from '@/hooks/useLanguage.jsx';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ProductCard from '@/components/ProductCard.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const HomePage = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRtl = language?.startsWith('ar');
  
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const records = await pb.collection('products').getFullList({
          sort: '-created',
          requestKey: null,
        });
        // Afficher 4 produits max, en mélange des deux sections
        setFeaturedProducts(records.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchFeatured();
  }, []);

  const services = [
    { icon: Wrench, title: t('home.services.maintenance.title'), desc: t('home.services.maintenance.desc') },
    { icon: Search, title: t('home.services.seo.title'), desc: t('home.services.seo.desc') },
    { icon: Megaphone, title: t('home.services.marketing.title'), desc: t('home.services.marketing.desc') },
    { icon: PenTool, title: t('home.services.design.title'), desc: t('home.services.design.desc') },
    { icon: Code, title: t('home.services.web.title'), desc: t('home.services.web.desc') },
    { icon: LineChart, title: t('home.services.consulting.title'), desc: t('home.services.consulting.desc') }
  ];

  const whyUs = [
    { icon: Globe, title: t('home.why_us.expertise.title'), desc: t('home.why_us.expertise.desc') },
    { icon: Users, title: t('home.why_us.team.title'), desc: t('home.why_us.team.desc') },
    { icon: Handshake, title: t('home.why_us.partnership.title'), desc: t('home.why_us.partnership.desc') }
  ];

  const testimonials = [
    { name: t('home.testimonials.t1.name'), company: t('home.testimonials.t1.company'), text: t('home.testimonials.t1.text') },
    { name: t('home.testimonials.t2.name'), company: t('home.testimonials.t2.company'), text: t('home.testimonials.t2.text') },
    { name: t('home.testimonials.t3.name'), company: t('home.testimonials.t3.company'), text: t('home.testimonials.t3.text') }
  ];

  const stats = [
    { icon: CheckCircle2, value: "50+", label: t('home.stats.clients') },
    { icon: Briefcase, value: "100+", label: t('home.stats.projects') },
    { icon: Clock, value: "3+", label: t('home.stats.experience') },
    { icon: Headset, value: "24/7", label: t('home.stats.support') }
  ];

  const scrollToServices = () => {
    document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>IWS LAAYOUNE - {t('home.hero.title')}</title>
        <meta name="description" content={t('home.hero.desc')} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
        <Header />
        
        <main className="flex-1">
          {/* SECTION 1: HERO */}
          <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1697638164340-6c5fc558bdf2" 
                alt="Digital Transformation" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-primary/90 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/80 to-background" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-3xl"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent font-semibold text-sm mb-6 border border-accent/30">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                  {t('home.hero.subtitle')}
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight text-balance">
                  {t('home.hero.title')}
                </h1>
                <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl">
                  {t('home.hero.desc')}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/contact">
                    <Button size="lg" className="bg-accent hover:bg-accent/90 text-primary font-bold px-8 h-14 text-lg rounded-xl shadow-lg shadow-accent/20 transition-all hover:-translate-y-1">
                      {t('home.hero.cta_primary')}
                    </Button>
                  </Link>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={scrollToServices}
                    className="bg-transparent border-white/20 text-white hover:bg-white/10 font-bold px-8 h-14 text-lg rounded-xl backdrop-blur-sm transition-all"
                  >
                    {t('home.hero.cta_secondary')}
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>

          {/* SECTION 2: SERVICES */}
          <section id="services-section" className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl md:text-5xl font-bold text-primary mb-4">{t('home.services.title')}</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    {t('home.services.subtitle')}
                  </p>
                  <div className="w-20 h-1.5 bg-accent mx-auto rounded-full mt-6"></div>
                </motion.div>
              </div>

              {/* Bento-style grid to avoid generic 3x2 look */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, index) => {
                  const Icon = service.icon;
                  // Make the first and fourth cards span 2 columns on tablet for visual variety
                  const isWideOnTablet = index === 0 || index === 3;
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className={isWideOnTablet ? "md:col-span-2 lg:col-span-1" : ""}
                    >
                      <Card className="h-full border-border hover:border-accent/50 hover:shadow-xl transition-all duration-300 bg-card group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                        <CardContent className="p-8 flex flex-col h-full relative z-10">
                          <div className="w-14 h-14 rounded-xl bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
                            <Icon className="w-7 h-7 text-primary group-hover:text-accent transition-colors" />
                          </div>
                          <h3 className="text-xl font-bold text-primary mb-3">{service.title}</h3>
                          <p className="text-muted-foreground mb-6 flex-grow leading-relaxed">{service.desc}</p>
                          <Link to="/contact" className="inline-flex items-center text-sm font-bold text-accent mt-auto group/link">
                            {t('home.services.learn_more')}
                            <ArrowRight className={`w-4 h-4 transition-transform ${isRtl ? 'mr-2 rotate-180 group-hover/link:-translate-x-1' : 'ml-2 group-hover/link:translate-x-1'}`} />
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* SECTION 3: WHY US */}
          <section className="py-24 bg-muted relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-primary mb-6">{t('home.why_us.title')}</h2>
                <div className="w-20 h-1.5 bg-accent rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {whyUs.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      <div className={`text-8xl font-extrabold text-primary/5 absolute -top-10 ${isRtl ? 'right-0' : 'left-0'} z-0 select-none pointer-events-none`}>
                        0{index + 1}
                      </div>
                      <div className="relative z-10 pt-8">
                        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-6">
                          <Icon className="w-6 h-6 text-accent" />
                        </div>
                        <h3 className="text-2xl font-bold text-primary mb-4">{item.title}</h3>
                        <p className="text-lg text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* SECTION 4: TESTIMONIALS */}
          <section className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-primary mb-6">{t('home.testimonials.title')}</h2>
                <div className="w-20 h-1.5 bg-accent mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={index === 1 ? "md:mt-12" : ""} // Staggered layout
                  >
                    <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardContent className="p-8">
                        <div className="flex gap-1 mb-6">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-5 h-5 fill-accent text-accent" />
                          ))}
                        </div>
                        <blockquote className="text-lg text-foreground mb-8 leading-relaxed font-medium">
                          "{testimonial.text}"
                        </blockquote>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                            {testimonial.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-primary">{testimonial.name}</div>
                            <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 5: STORE PREVIEW */}
          <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">{t('home.store.title')}</h2>
                  <p className="text-lg text-slate-300">{t('home.store.subtitle')}</p>
                </div>
                <Link to="/store">
                  <Button variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10">
                    {t('home.store.view_all')}
                    <ArrowRight className={`w-4 h-4 ${isRtl ? 'mr-2 rotate-180' : 'ml-2'}`} />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loadingProducts ? (
                  [1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-card/10 rounded-2xl p-4 border border-white/10">
                      <Skeleton className="aspect-square w-full rounded-xl mb-4 bg-white/10" />
                      <Skeleton className="h-4 w-1/3 mb-2 bg-white/10" />
                      <Skeleton className="h-6 w-3/4 mb-4 bg-white/10" />
                      <Skeleton className="h-8 w-1/2 bg-white/10" />
                    </div>
                  ))
                ) : featuredProducts.length > 0 ? (
                  featuredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                    >
                      {/* We use a slightly modified card for dark background context if needed, 
                          but ProductCard handles its own styling. We wrap it in a div to ensure it looks good. */}
                      <div className="h-full">
                        <ProductCard product={product} isRtl={isRtl} />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-slate-300">
                    Boutique en cours de mise à jour...
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* SECTION 6: À PROPOS */}
          <section className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, x: isRtl ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="inline-block py-1 px-3 rounded-full bg-accent/20 text-accent font-semibold text-sm tracking-wider mb-6 uppercase">
                    IWS LAAYOUNE SARL AU
                  </span>
                  <h2 className="text-3xl md:text-5xl font-bold text-primary mb-6 leading-tight">
                    {t('about.hero.title')}
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                    {t('about.hero.subtitle')}
                  </p>
                  <p className="text-muted-foreground mb-10 leading-relaxed">
                    {t('about.company.desc1')}
                  </p>
                  <Link to="/a-propos">
                    <Button size="lg" className="bg-accent hover:bg-accent/90 text-primary font-bold px-8 rounded-xl shadow-lg transition-all hover:-translate-y-1">
                      {t('about.hero.cta') || 'En savoir plus'}
                      <ArrowRight className={`w-5 h-5 ${isRtl ? 'mr-2 rotate-180' : 'ml-2'}`} />
                    </Button>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: isRtl ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="grid grid-cols-2 gap-6"
                >
                  {[
                    { icon: Globe, title: t('home.why_us.expertise.title'), desc: t('home.why_us.expertise.desc') },
                    { icon: Users, title: t('home.why_us.team.title'), desc: t('home.why_us.team.desc') },
                    { icon: Handshake, title: t('home.why_us.partnership.title'), desc: t('home.why_us.partnership.desc') },
                    { icon: CheckCircle2, title: t('home.stats.clients'), desc: '50+ ' + t('home.stats.clients') },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <Card key={i} className="border-border hover:border-accent/40 hover:shadow-lg transition-all duration-300 bg-card">
                        <CardContent className="p-6">
                          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                            <Icon className="w-5 h-5 text-accent" />
                          </div>
                          <h4 className="font-bold text-primary mb-2 text-sm">{item.title}</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{item.desc}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          </section>

          {/* SECTION 7: STATS */}
          <section className="py-20 bg-background border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="text-center"
                    >
                      <div className="w-12 h-12 mx-auto bg-accent/10 rounded-full flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-accent" />
                      </div>
                      <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2 font-variant-numeric tabular-nums">
                        {stat.value}
                      </div>
                      <div className="text-sm md:text-base font-medium text-muted-foreground uppercase tracking-wider">
                        {stat.label}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* SECTION 7: FINAL CTA */}
          <section className="py-24 bg-muted text-center px-4">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-5xl font-bold text-primary mb-6 leading-tight text-balance">
                  {t('home.final_cta.title')}
                </h2>
                <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                  {t('home.final_cta.subtitle')}
                </p>
                <Link to="/contact">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-primary font-bold text-lg px-10 py-7 rounded-xl shadow-xl hover:shadow-accent/20 transition-all hover:-translate-y-1">
                    {t('home.final_cta.btn')}
                    <ArrowRight className={`w-5 h-5 ${isRtl ? 'mr-2 rotate-180' : 'ml-2'}`} />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </>
  );
};

export default HomePage;
