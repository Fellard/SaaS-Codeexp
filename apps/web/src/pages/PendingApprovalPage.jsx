import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Clock, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PendingApprovalPage = () => {
  return (
    <>
      <Helmet>
        <title>Demande en cours d'examen — IWS LAAYOUNE</title>
      </Helmet>
      <div className="min-h-screen bg-muted flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
            <div className="bg-primary px-8 py-6 text-center">
              <h1 className="text-xl font-bold text-white">IWS LAAYOUNE</h1>
              <p className="text-white/70 text-sm mt-1">Plateforme digitale professionnelle</p>
            </div>

            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-amber-600" />
              </div>

              <h2 className="text-2xl font-bold text-primary mb-3">
                Demande reçue avec succès
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Votre demande d'accès administrateur a bien été transmise à notre équipe. 
                Nous l'examinerons dans les plus brefs délais.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  { icon: CheckCircle2, text: 'Votre dossier est en cours d\'examen', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { icon: Mail, text: 'Un email de réponse vous sera envoyé sous 24-48h', color: 'text-blue-600', bg: 'bg-blue-50' },
                  { icon: Clock, text: 'Vous serez notifié dès que votre accès sera activé', color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map(({ icon: Icon, text, color, bg }, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${bg} text-left`}>
                    <Icon className={`w-5 h-5 ${color} flex-shrink-0 mt-0.5`} />
                    <span className="text-sm text-foreground">{text}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-muted rounded-xl text-left mb-6">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-primary">Besoin d'aide ?</strong><br />
                  Contactez-nous à{' '}
                  <a href="mailto:contactez@iwsrecords.com" className="text-accent hover:underline">
                    contactez@iwsrecords.com
                  </a>
                </p>
              </div>

              <Link to="/">
                <Button variant="outline" className="w-full gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Retour à l'accueil
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PendingApprovalPage;
