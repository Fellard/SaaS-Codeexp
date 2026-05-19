import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2, Mic2, CalendarDays, Clock, Phone,
  Mail, MessageSquare, ArrowRight, Home,
} from 'lucide-react';

const StudioConfirmationPage = () => {
  const { state } = useLocation();

  // If no state (direct URL access), show generic message
  if (!state) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-primary mb-2">Réservation confirmée !</h1>
            <p className="text-muted-foreground mb-6">Votre demande a bien été envoyée à l'équipe du studio.</p>
            <Button asChild><Link to="/studio">Retour au studio</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { service, date, start, end, tel, email, nom, montant } = state;

  return (
    <>
      <Helmet>
        <title>Réservation confirmée — IWS Records Studio</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 pt-24 pb-16">
          <div className="max-w-lg mx-auto px-4">

            {/* Success animation */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="text-center mb-8"
            >
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-100">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <h1 className="text-3xl font-extrabold text-primary mb-2">Demande envoyée !</h1>
              <p className="text-muted-foreground text-base">
                Votre réservation est en attente de confirmation par l'équipe studio.
              </p>
            </motion.div>

            {/* Recap card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-3xl p-6 shadow-md mb-6"
            >
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
                <div className="p-2.5 bg-purple-100 rounded-xl">
                  <Mic2 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-bold text-foreground">{service?.nom || 'Session studio'}</p>
                  <p className="text-xs text-muted-foreground">IWS Records Studio — Laayoune</p>
                </div>
                {montant > 0 && (
                  <span className="ml-auto text-xl font-extrabold text-purple-600">{montant} MAD</span>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Date :</span>
                  <span className="font-semibold text-foreground">{date}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Horaire :</span>
                  <span className="font-semibold text-foreground">{start} – {end}</span>
                </div>
              </div>
            </motion.div>

            {/* Contact info — how team will reach them */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="bg-purple-50 border border-purple-200 rounded-3xl p-6 mb-6"
            >
              <h2 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Comment vous joindre ?
              </h2>
              <p className="text-sm text-purple-800 mb-4 leading-relaxed">
                L'équipe IWS Records va vous contacter pour confirmer votre session. Vous serez joint par :
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-purple-100">
                  <div className="p-2 bg-purple-100 rounded-lg shrink-0">
                    <Phone className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Téléphone / WhatsApp</p>
                    <p className="font-bold text-foreground text-sm">{tel}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-purple-100">
                  <div className="p-2 bg-purple-100 rounded-lg shrink-0">
                    <Mail className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Email</p>
                    <p className="font-bold text-foreground text-sm">{email}</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-purple-700 mt-4 flex items-start gap-2">
                <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                Délai de réponse : <strong>sous 24 heures</strong>. Le paiement se fait sur place le jour de la session.
              </p>
            </motion.div>

            {/* Studio contact */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-card border border-border rounded-2xl p-5 mb-6 text-sm"
            >
              <p className="font-semibold text-foreground mb-3">Contacter le studio directement :</p>
              <div className="flex flex-col gap-2">
                <a href="tel:+212528XXXXXX" className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium">
                  <Phone className="w-4 h-4" />+212 5 28 XX XX XX
                </a>
                <a href="mailto:studio@iwsrecords.com" className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium">
                  <Mail className="w-4 h-4" />studio@iwsrecords.com
                </a>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Button asChild className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl">
                <Link to="/studio">
                  <Mic2 className="w-4 h-4 mr-2" />Retour au studio
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 rounded-xl">
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />Accueil
                </Link>
              </Button>
            </motion.div>

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default StudioConfirmationPage;
