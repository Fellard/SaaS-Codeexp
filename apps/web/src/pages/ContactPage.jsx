
import React from 'react';
import { Helmet } from 'react-helmet';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ContactForm from '@/components/ContactForm.jsx';

const ContactPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('contact.title')} - IWS LAAYOUNE</title>
        <meta name="description" content={t('contact.desc')} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-muted">
        <Header />
        
        <main className="flex-1 pt-20">
          <div className="bg-primary py-20 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">{t('contact.title')}</h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto px-4">
              {t('contact.desc')}
            </p>
            <div className="w-24 h-1.5 bg-accent mx-auto rounded-full mt-8"></div>
          </div>

          <section className="section-padding">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                
                {/* Contact Info */}
                <div>
                  <h2 className="text-3xl font-bold text-primary mb-10">{t('contact.info.title')}</h2>
                  
                  <div className="space-y-8 bg-card p-10 rounded-3xl border border-border shadow-sm">
                    <div className="flex items-start gap-6">
                      <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center shrink-0">
                        <MapPin className="w-7 h-7 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-bold text-primary text-xl mb-1">{t('contact.address.title')}</h3>
                        <p className="text-muted-foreground text-lg">{t('contact.address.value')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-6">
                      <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center shrink-0">
                        <Phone className="w-7 h-7 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-bold text-primary text-xl mb-1">{t('contact.phone.title')}</h3>
                        <p className="text-muted-foreground text-lg">{t('contact.phone.value')}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-6">
                      <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center shrink-0">
                        <Mail className="w-7 h-7 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-bold text-primary text-xl mb-1">{t('contact.email.title')}</h3>
                        <p className="text-muted-foreground text-lg">{t('contact.email.value')}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-6">
                      <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center shrink-0">
                        <Clock className="w-7 h-7 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-bold text-primary text-xl mb-1">{t('contact.hours.title')}</h3>
                        <p className="text-muted-foreground text-lg">{t('contact.hours.value')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <div className="bg-card p-10 rounded-3xl shadow-lg border border-border">
                  <h2 className="text-3xl font-bold text-primary mb-8">{t('contact.form.title')}</h2>
                  <ContactForm />
                </div>

              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ContactPage;
