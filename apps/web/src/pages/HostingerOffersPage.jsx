
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { AlertTriangle, Globe, Zap, Mail } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import HostingerPackCard from '@/components/HostingerPackCard.jsx';
import HostingerPackSelector from '@/components/HostingerPackSelector.jsx';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const HostingerOffersPage = () => {
  const { t } = useTranslation();
  const [showEur, setShowEur] = useState(true);

  const packs = [
    {
      title: t('pack.lancement.title'),
      price: 990,
      features: [
        t('pack.lancement.f1'),
        t('pack.lancement.f2'),
        t('pack.lancement.f3'),
        t('pack.lancement.f4'),
        t('pack.lancement.f5')
      ],
      isPopular: false
    },
    {
      title: t('pack.pro.title'),
      price: 1990,
      features: [
        t('pack.pro.f1'),
        t('pack.pro.f2'),
        t('pack.pro.f3'),
        t('pack.pro.f4'),
        t('pack.pro.f5'),
        t('pack.pro.f6')
      ],
      isPopular: true
    },
    {
      title: t('pack.business.title'),
      price: 3990,
      features: [
        t('pack.business.f1'),
        t('pack.business.f2'),
        t('pack.business.f3'),
        t('pack.business.f4'),
        t('pack.business.f5'),
        t('pack.business.f6'),
        t('pack.business.f7')
      ],
      isPopular: false
    },
    {
      title: t('pack.maint_lite.title'),
      price: 490,
      features: [
        t('pack.maint_lite.f1'),
        t('pack.maint_lite.f2'),
        t('pack.maint_lite.f3'),
        t('pack.maint_lite.f4')
      ],
      isPopular: false
    },
    {
      title: t('pack.maint_plus.title'),
      price: 990,
      features: [
        t('pack.maint_plus.f1'),
        t('pack.maint_plus.f2'),
        t('pack.maint_plus.f3'),
        t('pack.maint_plus.f4'),
        t('pack.maint_plus.f5')
      ],
      isPopular: false
    }
  ];

  return (
    <>
      <Helmet>
        <title>{t('offers.title')} - IWS LAAYOUNE</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 pt-20">
          <div className="bg-primary py-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-10">
              <div className="absolute top-0 left-1/2 w-[600px] h-[600px] bg-accent rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
            </div>
            <div className="relative z-10 max-w-4xl mx-auto px-4">
              <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">{t('offers.title')}</h1>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                {t('offers.desc')}
              </p>
            </div>
          </div>

          <section className="section-padding bg-muted">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              {/* Currency Toggle */}
              <div className="flex items-center justify-center gap-3 mb-12 bg-card p-4 rounded-2xl shadow-sm border border-border max-w-md mx-auto">
                <Label htmlFor="currency-toggle" className="text-lg font-medium cursor-pointer">
                  {t('offers.toggle')}
                </Label>
                <Switch 
                  id="currency-toggle" 
                  checked={showEur} 
                  onCheckedChange={setShowEur}
                  className="data-[state=checked]:bg-accent"
                />
              </div>

              {/* Packs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {packs.slice(0, 3).map((pack, idx) => (
                  <HostingerPackCard 
                    key={idx}
                    title={pack.title}
                    price={pack.price}
                    features={pack.features}
                    isPopular={pack.isPopular}
                    showEur={showEur}
                    onSelect={() => document.getElementById('selector').scrollIntoView({ behavior: 'smooth' })}
                  />
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
                {packs.slice(3).map((pack, idx) => (
                  <HostingerPackCard 
                    key={idx + 3}
                    title={pack.title}
                    price={pack.price}
                    features={pack.features}
                    isPopular={pack.isPopular}
                    showEur={showEur}
                    onSelect={() => document.getElementById('selector').scrollIntoView({ behavior: 'smooth' })}
                  />
                ))}
              </div>

              {/* Legal Disclaimer */}
              <div className="disclaimer-box flex items-start gap-4 p-6 rounded-xl mb-24 max-w-4xl mx-auto">
                <AlertTriangle className="w-6 h-6 text-accent shrink-0 mt-0.5" />
                <p className="text-sm md:text-base text-disclaimer-foreground leading-relaxed">
                  {t('offers.disclaimer')}
                </p>
              </div>

              {/* Hostinger Products Section */}
              <div className="bg-card rounded-3xl p-8 md:p-12 border border-border shadow-sm mb-24">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold text-primary mb-4">{t('offers.products.title')}</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    {t('offers.products.desc')}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <a href="https://hostinger.com?REFERRALCODE=TONCODE&utm_source=site_iws&utm_medium=bouton&utm_campaign=domaine" target="_blank" rel="noopener noreferrer" className="block">
                    <div className="bg-muted p-6 rounded-2xl text-center hover:shadow-md transition-all border border-transparent hover:border-accent/30 h-full flex flex-col">
                      <Globe className="w-10 h-10 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-primary mb-2">{t('offers.domain.title')}</h3>
                      <p className="text-sm text-muted-foreground mb-6 flex-1">{t('offers.domain.desc')}</p>
                      <button className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3 px-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2">
                        <span>🌐</span> {t('offers.domain.btn')}
                      </button>
                    </div>
                  </a>
                  
                  <a href="https://hostinger.com?REFERRALCODE=TONCODE&utm_source=site_iws&utm_medium=bouton&utm_campaign=hebergement" target="_blank" rel="noopener noreferrer" className="block">
                    <div className="bg-muted p-6 rounded-2xl text-center hover:shadow-md transition-all border border-transparent hover:border-accent/30 h-full flex flex-col">
                      <Zap className="w-10 h-10 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-primary mb-2">{t('offers.hosting.title')}</h3>
                      <p className="text-sm text-muted-foreground mb-6 flex-1">{t('offers.hosting.desc')}</p>
                      <button className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3 px-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2">
                        <span>⚡</span> {t('offers.hosting.btn')}
                      </button>
                    </div>
                  </a>

                  <a href="https://hostinger.com?REFERRALCODE=TONCODE&utm_source=site_iws&utm_medium=bouton&utm_campaign=email" target="_blank" rel="noopener noreferrer" className="block">
                    <div className="bg-muted p-6 rounded-2xl text-center hover:shadow-md transition-all border border-transparent hover:border-accent/30 h-full flex flex-col">
                      <Mail className="w-10 h-10 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-primary mb-2">{t('offers.email.title')}</h3>
                      <p className="text-sm text-muted-foreground mb-6 flex-1">{t('offers.email.desc')}</p>
                      <button className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3 px-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2">
                        <span>📧</span> {t('offers.email.btn')}
                      </button>
                    </div>
                  </a>
                </div>
              </div>

              {/* Selector Section */}
              <div id="selector" className="scroll-mt-32">
                <HostingerPackSelector />
              </div>

            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default HostingerOffersPage;
