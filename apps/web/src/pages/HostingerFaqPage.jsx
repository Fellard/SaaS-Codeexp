
import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from '@/i18n/useTranslation.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import HostingerFaqItem from '@/components/HostingerFaqItem.jsx';

const HostingerFaqPage = () => {
  const { t } = useTranslation();

  const faqs = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
    { q: t('faq.q5'), a: t('faq.a5') },
    { q: t('faq.q6'), a: t('faq.a6') }
  ];

  return (
    <>
      <Helmet>
        <title>{t('faq.title')} - IWS LAAYOUNE</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 pt-20">
          <div className="bg-primary py-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-10">
              <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-accent rounded-full blur-[100px] -translate-y-1/2"></div>
            </div>
            <div className="relative z-10 max-w-4xl mx-auto px-4">
              <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">{t('faq.title')}</h1>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                {t('faq.desc')}
              </p>
            </div>
          </div>

          <section className="section-padding bg-muted">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <HostingerFaqItem key={idx} question={faq.q} answer={faq.a} />
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default HostingerFaqPage;
