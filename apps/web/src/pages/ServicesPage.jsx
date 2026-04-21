
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Wrench, Search, Megaphone, PenTool, Code, LineChart, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation.js';
import { useLanguage } from '@/hooks/useLanguage.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ServicesPage = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRtl = language?.startsWith('ar');
  const [selectedService, setSelectedService] = useState(null);

  const services = [
    { 
      id: 'maintenance',
      icon: Wrench, 
      title: t('services.maintenance.title'), 
      short: t('services.maintenance.short'),
      details: t('services.maintenance.details'),
      benefits: t('services.maintenance.benefits').split(', '),
      cta: t('services.maintenance.cta')
    },
    { 
      id: 'seo',
      icon: Search, 
      title: t('services.seo.title'), 
      short: t('services.seo.short'),
      details: t('services.seo.details'),
      benefits: t('services.seo.benefits').split(', '),
      cta: t('services.seo.cta')
    },
    { 
      id: 'marketing',
      icon: Megaphone, 
      title: t('services.marketing.title'), 
      short: t('services.marketing.short'),
      details: t('services.marketing.details'),
      benefits: t('services.marketing.benefits').split(', '),
      cta: t('services.marketing.cta')
    },
    { 
      id: 'design',
      icon: PenTool, 
      title: t('services.design.title'), 
      short: t('services.design.short'),
      details: t('services.design.details'),
      benefits: t('services.design.benefits').split(', '),
      cta: t('services.design.cta')
    },
    { 
      id: 'web',
      icon: Code, 
      title: t('services.web.title'), 
      short: t('services.web.short'),
      details: t('services.web.details'),
      benefits: t('services.web.benefits').split(', '),
      cta: t('services.web.cta')
    },
    { 
      id: 'consulting',
      icon: LineChart, 
      title: t('services.consulting.title'), 
      short: t('services.consulting.short'),
      details: t('services.consulting.details'),
      benefits: t('services.consulting.benefits').split(', '),
      cta: t('services.consulting.cta')
    }
  ];

  return (
    <>
      <Helmet>
        <title>{t('nav.services')} - IWS LAAYOUNE</title>
        <meta name="description" content={t('services.hero.subtitle')} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
        <Header />
        
        <main className="flex-1 pt-20">
          {/* Hero Section */}
          <section className="relative py-24 bg-primary overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-10">
              <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent rounded-full blur-[100px] -translate-y-1/2"></div>
            </div>
            <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
                  {t('services.hero.title')}
                </h1>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  {t('services.hero.subtitle')}
                </p>
              </motion.div>
            </div>
          </section>

          {/* Services Grid */}
          <section className="py-24 bg-muted">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card 
                        className="h-full border-border hover:border-accent/50 hover:shadow-xl transition-all duration-300 bg-card cursor-pointer group"
                        onClick={() => setSelectedService(service)}
                      >
                        <CardContent className="p-8 flex flex-col h-full">
                          <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
                            <Icon className="w-8 h-8 text-primary group-hover:text-accent transition-colors" />
                          </div>
                          <h3 className="text-2xl font-bold text-primary mb-4">{service.title}</h3>
                          <p className="text-muted-foreground mb-8 flex-grow leading-relaxed">{service.short}</p>
                          <div className="inline-flex items-center text-sm font-bold text-accent mt-auto group/link">
                            {t('home.services.learn_more')}
                            <ArrowRight className={`w-4 h-4 transition-transform ${isRtl ? 'mr-2 rotate-180 group-hover/link:-translate-x-1' : 'ml-2 group-hover/link:translate-x-1'}`} />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        </main>

        <Footer />

        {/* Service Detail Modal */}
        <AnimatePresence>
          {selectedService && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-primary/80 backdrop-blur-sm"
                onClick={() => setSelectedService(null)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-card rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
                dir={isRtl ? 'rtl' : 'ltr'}
              >
                <div className="p-6 sm:p-8 overflow-y-auto">
                  <button 
                    onClick={() => setSelectedService(null)}
                    className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'} p-2 bg-muted hover:bg-muted/80 rounded-full text-muted-foreground transition-colors`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                    <selectedService.icon className="w-8 h-8 text-accent" />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-primary mb-4">{selectedService.title}</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                    {selectedService.details}
                  </p>
                  
                  <div className="bg-muted rounded-2xl p-6 mb-8">
                    <h3 className="font-bold text-primary mb-4 text-lg">Avantages clés</h3>
                    <ul className="space-y-3">
                      {selectedService.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <span className="text-foreground font-medium">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Link to="/contact" onClick={() => setSelectedService(null)}>
                    <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-primary font-bold h-14 text-lg rounded-xl shadow-lg shadow-accent/20">
                      {selectedService.cta}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ServicesPage;
