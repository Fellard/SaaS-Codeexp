
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lightbulb, 
  Users, 
  HeartHandshake, 
  Wrench, 
  Search, 
  Megaphone, 
  PenTool, 
  Code, 
  LineChart,
  ArrowRight
} from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation.js';
import { useLanguage } from '@/hooks/useLanguage.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const EntreprisePage = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRtl = language?.startsWith('ar');

  const values = [
    { icon: ShieldCheck, title: t('about.values.quality.title'), desc: t('about.values.quality.desc') },
    { icon: Lightbulb, title: t('about.values.innovation.title'), desc: t('about.values.innovation.desc') },
    { icon: Users, title: t('about.values.collaboration.title'), desc: t('about.values.collaboration.desc') },
    { icon: HeartHandshake, title: t('about.values.engagement.title'), desc: t('about.values.engagement.desc') }
  ];

  const expertise = [
    { icon: Wrench, title: t('about.expertise.maintenance.title'), desc: t('about.expertise.maintenance.desc') },
    { icon: Search, title: t('about.expertise.seo.title'), desc: t('about.expertise.seo.desc') },
    { icon: Megaphone, title: t('about.expertise.marketing.title'), desc: t('about.expertise.marketing.desc') },
    { icon: PenTool, title: t('about.expertise.design.title'), desc: t('about.expertise.design.desc') },
    { icon: Code, title: t('about.expertise.web.title'), desc: t('about.expertise.web.desc') },
    { icon: LineChart, title: t('about.expertise.consulting.title'), desc: t('about.expertise.consulting.desc') }
  ];

  const whyChooseUs = [
    { number: "01", title: t('about.why.p1.title'), desc: t('about.why.p1.desc') },
    { number: "02", title: t('about.why.p2.title'), desc: t('about.why.p2.desc') },
    { number: "03", title: t('about.why.p3.title'), desc: t('about.why.p3.desc') }
  ];

  return (
    <>
      <Helmet>
        <title>{t('about.hero.title')} - IWS LAAYOUNE</title>
        <meta name="description" content={t('about.hero.subtitle')} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
        <Header />
        
        <main className="flex-1">
          {/* 1. HERO SECTION */}
          <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1637622124152-33adfabcc923" 
                alt="IWS LAAYOUNE Office" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-primary/85 mix-blend-multiply"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-primary/50 to-primary/90"></div>
            </div>
            
            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
              <motion.div 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-block py-1 px-3 rounded-full bg-accent/20 text-accent font-semibold text-sm tracking-wider mb-6 uppercase">
                  IWS LAAYOUNE SARL AU
                </span>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-8 leading-tight" style={{ letterSpacing: '-0.02em' }}>
                  {t('about.hero.title')}
                </h1>
                <p className="text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto leading-relaxed font-medium">
                  {t('about.hero.subtitle')}
                </p>
              </motion.div>
            </div>
          </section>

          {/* 2. COMPANY PRESENTATION */}
          <section className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <motion.div 
                  initial={{ opacity: 0, x: isRtl ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">{t('about.company.title')}</h2>
                  <div className="w-20 h-1.5 bg-accent rounded-full mb-8"></div>
                  <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                    <p>{t('about.company.description1')}</p>
                    <p>{t('about.company.description2')}</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="relative"
                >
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                    <img 
                      src="https://images.unsplash.com/photo-1562600484-c6ef0ffe27a2" 
                      alt="Team collaboration" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className={`absolute -bottom-8 ${isRtl ? '-left-8' : '-right-8'} bg-card p-8 rounded-2xl shadow-xl border border-border max-w-xs hidden md:block`}>
                    <div className="text-4xl font-extrabold text-accent mb-2">2021</div>
                    <div className="text-primary font-semibold">{t('about.company.founded')}</div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* 3. MISSION SECTION */}
          <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <TargetIcon className="w-16 h-16 text-accent mx-auto mb-8" />
                <h2 className="text-3xl md:text-4xl font-bold mb-8">{t('about.mission.title')}</h2>
                <p className="text-xl md:text-2xl leading-relaxed font-medium text-slate-200">
                  "{t('about.mission.description')}"
                </p>
              </motion.div>
            </div>
          </section>

          {/* 4. VALUES SECTION */}
          <section className="py-24 bg-muted">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">{t('about.values.title')}</h2>
                <div className="w-20 h-1.5 bg-accent mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {values.map((value, idx) => {
                  const Icon = value.icon;
                  return (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="h-full border-none shadow-lg hover:-translate-y-2 transition-transform duration-300 bg-card">
                        <CardContent className="p-8 text-center flex flex-col items-center">
                          <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-6">
                            <Icon className="w-8 h-8 text-accent" />
                          </div>
                          <h3 className="text-xl font-bold text-primary mb-4">{value.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">{value.desc}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 5. EXPERTISE SECTION */}
          <section className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">{t('about.expertise.title')}</h2>
                <div className="w-20 h-1.5 bg-accent mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {expertise.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="h-full border border-border hover:border-accent/50 hover:shadow-xl transition-all duration-300 bg-card">
                        <CardContent className="p-8 flex flex-col h-full">
                          <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                            <Icon className="w-7 h-7 text-accent" />
                          </div>
                          <h3 className="text-xl font-bold text-primary mb-3">{item.title}</h3>
                          <p className="text-muted-foreground leading-relaxed flex-1">{item.desc}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 6. WHY CHOOSE US SECTION */}
          <section className="py-24 bg-muted">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">{t('about.why.title')}</h2>
                <div className="w-20 h-1.5 bg-accent mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {whyChooseUs.map((point, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative flex flex-col"
                  >
                    <div className={`text-7xl font-extrabold text-primary/5 absolute -top-10 ${isRtl ? 'right-0' : 'left-0'} z-0 select-none`}>
                      {point.number}
                    </div>
                    <div className="relative z-10 pt-6">
                      <h3 className="text-2xl font-bold text-primary mb-4">{point.title}</h3>
                      <p className="text-lg text-muted-foreground leading-relaxed">{point.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* 7. CTA SECTION */}
          <section className="py-24 bg-primary text-center px-4">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 leading-tight">
                  {t('about.cta.title')}
                </h2>
                <Link to="/contact">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-primary font-bold text-lg px-10 py-6 rounded-xl shadow-xl hover:shadow-accent/20 transition-all hover:-translate-y-1">
                    {t('about.cta.button')}
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

// Helper icon for Mission section
function TargetIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

export default EntreprisePage;
