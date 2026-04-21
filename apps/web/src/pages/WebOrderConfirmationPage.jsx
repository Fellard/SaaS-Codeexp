import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Globe, Phone, Mail, Clock, Home, ArrowRight } from 'lucide-react';

const WebOrderConfirmationPage = () => {
  const { state } = useLocation();

  if (!state) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-primary mb-2">Demande envoyée !</h1>
            <p className="text-muted-foreground mb-6">Notre équipe vous contactera sous 24h.</p>
            <Button asChild><Link to="/agence">Retour à l'agence</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { nom, service, tech, tel, email } = state;
  const TECH_NAMES = { iws_builder: 'IWS Builder', wordpress: 'WordPress', import: 'Import de projet', node: 'Développement sur mesure' };

  return (
    <>
      <Helmet><title>Demande envoyée — IWS Web Agency</title></Helmet>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 pt-24 pb-16">
          <div className="max-w-lg mx-auto px-4">

            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="text-center mb-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-100">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <h1 className="text-3xl font-extrabold text-primary mb-2">Demande reçue !</h1>
              <p className="text-muted-foreground">Notre équipe vous contacte sous <strong>24 heures ouvrables</strong>.</p>
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-3xl p-6 shadow-md mb-6">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
                <div className="p-2.5 bg-blue-100 rounded-xl"><Globe className="w-5 h-5 text-blue-600" /></div>
                <div>
                  <p className="font-bold text-foreground">{service || 'Création de site web'}</p>
                  <p className="text-xs text-muted-foreground">IWS Web Agency — Laayoune</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {tech && <div className="flex justify-between"><span className="text-muted-foreground">Technologie</span><span className="font-semibold">{TECH_NAMES[tech] || tech}</span></div>}
              </div>
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }}
              className="bg-blue-50 border border-blue-200 rounded-3xl p-6 mb-6">
              <h2 className="font-bold text-blue-900 mb-3 flex items-center gap-2"><Phone className="w-4 h-4" />Comment vous joindre ?</h2>
              <div className="space-y-2">
                {tel && (
                  <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-blue-100">
                    <div className="p-2 bg-blue-100 rounded-lg shrink-0"><Phone className="w-4 h-4 text-blue-600" /></div>
                    <div><p className="text-xs text-muted-foreground font-medium">Téléphone / WhatsApp</p><p className="font-bold text-foreground text-sm">{tel}</p></div>
                  </div>
                )}
                {email && (
                  <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-blue-100">
                    <div className="p-2 bg-blue-100 rounded-lg shrink-0"><Mail className="w-4 h-4 text-blue-600" /></div>
                    <div><p className="text-xs text-muted-foreground font-medium">Email</p><p className="font-bold text-foreground text-sm">{email}</p></div>
                  </div>
                )}
              </div>
              <p className="text-xs text-blue-700 mt-4 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 shrink-0" />Délai de réponse : <strong>sous 24h ouvrables</strong>.
              </p>
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">
                <Link to="/agence"><Globe className="w-4 h-4 mr-2" />Retour à l'agence</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 rounded-xl">
                <Link to="/"><Home className="w-4 h-4 mr-2" />Accueil</Link>
              </Button>
            </motion.div>

          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default WebOrderConfirmationPage;
