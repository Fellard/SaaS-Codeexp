
import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from '@/i18n/useTranslation.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const TermsPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('terms.title')} - IWS LAAYOUNE</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 pt-32 pb-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-primary mb-8">{t('terms.title')}</h1>
            
            <div className="prose prose-slate max-w-none text-muted-foreground">
              <h2 className="text-2xl font-bold text-primary mt-8 mb-4">{t('terms.s1.title')}</h2>
              <p>{t('terms.s1.p1')}</p>

              <h2 className="text-2xl font-bold text-primary mt-8 mb-4">{t('terms.s2.title')}</h2>
              <p>{t('terms.s2.p1')}</p>

              <h2 className="text-2xl font-bold text-primary mt-8 mb-4">{t('terms.s3.title')}</h2>
              <p>{t('terms.s3.p1')}</p>

              <h2 className="text-2xl font-bold text-primary mt-8 mb-4">{t('terms.s4.title')}</h2>
              <p>{t('terms.s4.p1')}</p>

              <h2 className="text-2xl font-bold text-primary mt-8 mb-4">{t('terms.s5.title')}</h2>
              <p>{t('terms.s5.p1')}</p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default TermsPage;
