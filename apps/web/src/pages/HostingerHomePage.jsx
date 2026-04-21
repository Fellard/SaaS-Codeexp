
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Globe, Zap, Mail, Info, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import HostingerServiceCard from '@/components/HostingerServiceCard.jsx';
import { Button } from '@/components/ui/button';

const HostingerHomePage = () => {
  const { t, language } = useTranslation();

  const hostingerLinks = {
    domaine: 'https://hostinger.com?REFERRALCODE=TONCODE&utm_source=site_iws&utm_medium=bouton&utm_campaign=domaine',
    hebergement: 'https://hostinger.com?REFERRALCODE=TONCODE&utm_source=site_iws&utm_medium=bouton&utm_campaign=hebergement',
    email: 'https://hostinger.com?REFERRALCODE=TONCODE&utm_source=site_iws&utm_medium=bouton&utm_campaign=email'
  };

  return (
    <>
      <Helmet>
        <title>{t('nav.hostinger')} - IWS LAAYOUNE</title>
        <meta name="description" content={t('hostinger.hero.desc')} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 pt-20">
          {/* SECTION 1 - HERO / PROPOSITION DE VALEUR */}
          <section className="relative py-24 lg:py-32 bg-primary overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-20">
              <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
              <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>
            </div>
            
            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-8 leading-tight tracking-tight">
                  {t('hostinger.hero.title1')} <span className="text-accent">{t('hostinger.hero.title2')}</span>
                </h1>
                <p className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed max-w-3xl mx-auto">
                  {t('hostinger.hero.desc')}
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-5">
                  <Link to="/hostinger/offres">
                    <Button size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white font-bold px-10 h-16 text-lg rounded-xl shadow-xl shadow-accent/20 transition-transform active:scale-95">
                      {t('hostinger.hero.btn1')}
                    </Button>
                  </Link>
                  <Link to="/hostinger/contact">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white bg-white/20 text-white hover:bg-white hover:text-primary font-bold px-10 h-16 text-lg rounded-xl backdrop-blur-sm transition-all active:scale-95">
                      {t('hostinger.hero.btn2')}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>

          {/* SECTION 2 - MAIN SECTION */}
          <section className="section-padding bg-muted">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-20">
                <h2 className="text-3xl md:text-5xl font-bold text-primary mb-6">{t('hostinger.main.title')}</h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  {t('hostinger.main.desc')}
                </p>
              </div>

              {/* Bento-style grid for features */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
                <motion.div 
                  className="md:col-span-12 lg:col-span-4"
                  initial={{ opacity: 0, y: 20 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ delay: 0.1 }}
                >
                  <HostingerServiceCard 
                    icon={Globe}
                    title={t('hostinger.domain.title')}
                    description={t('hostinger.domain.desc')}
                  >
                    <a 
                      href={hostingerLinks.domaine}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button 
                        className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                      >
                        <span className="mr-2 text-xl">🌐</span> {t('hostinger.domain.btn')}
                      </Button>
                    </a>
                  </HostingerServiceCard>
                </motion.div>
                
                <motion.div 
                  className="md:col-span-6 lg:col-span-4"
                  initial={{ opacity: 0, y: 20 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ delay: 0.2 }}
                >
                  <HostingerServiceCard 
                    icon={Zap}
                    title={t('hostinger.hosting.title')}
                    description={t('hostinger.hosting.desc')}
                  >
                    <a 
                      href={hostingerLinks.hebergement}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button 
                        className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                      >
                        <span className="mr-2 text-xl">⚡</span> {t('hostinger.hosting.btn')}
                      </Button>
                    </a>
                  </HostingerServiceCard>
                </motion.div>

                <motion.div 
                  className="md:col-span-6 lg:col-span-4"
                  initial={{ opacity: 0, y: 20 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ delay: 0.3 }}
                >
                  <HostingerServiceCard 
                    icon={Mail}
                    title={t('hostinger.email.title')}
                    description={t('hostinger.email.desc')}
                  >
                    <a 
                      href={hostingerLinks.email}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button 
                        className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                      >
                        <span className="mr-2 text-xl">📧</span> {t('hostinger.email.btn')}
                      </Button>
                    </a>
                  </HostingerServiceCard>
                </motion.div>
              </div>

              <div className="text-center mt-12">
                <Link to="/hostinger/offres">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold px-10 h-14 text-lg rounded-xl shadow-lg transition-transform active:scale-95">
                    {t('hostinger.packs.btn')}
                    <ArrowRight className={`ml-2 w-5 h-5 ${language === 'ar-MA' ? 'rotate-180 mr-2 ml-0' : ''}`} />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* SECTION 3 - CLARIFICATION BOX */}
          <section className="py-20 bg-background">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-muted border-2 border-border rounded-3xl p-8 md:p-12 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <Info className="w-48 h-48 text-primary" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center shrink-0">
                      <Info className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-primary">{t('hostinger.info.title')}</h2>
                  </div>
                  
                  <div className="space-y-6 text-lg text-muted-foreground leading-relaxed max-w-3xl">
                    <p>{t('hostinger.info.desc1')}</p>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-accent mt-2.5 shrink-0"></span>
                        <span>{t('hostinger.info.li1')}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-accent mt-2.5 shrink-0"></span>
                        <span>{t('hostinger.info.li2')}</span>
                      </li>
                    </ul>
                    <p className="pt-4 font-medium text-primary">
                      {t('hostinger.info.result')}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default HostingerHomePage;
