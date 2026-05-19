import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { CheckCircle2, XCircle, Home, LogIn, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import apiServerClient from '@/lib/apiServerClient';

const ApprovalRedirectPage = () => {
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action'); // approve ou reject
  const token  = searchParams.get('token');
  const status = searchParams.get('status'); // résultat après traitement

  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(status || null);
  const [name, setName]         = useState(searchParams.get('name') || '');

  useEffect(() => {
    if ((action === 'approve' || action === 'reject') && token && !status) {
      setLoading(true);
      const endpoint = action === 'approve'
        ? `/auth/approve/${token}`
        : `/auth/reject/${token}`;

      apiServerClient.fetch(endpoint, { method: 'GET' })
        .then(res => res.json().catch(() => ({})))
        .then(data => {
          setResult(action === 'approve' ? 'approved' : 'rejected');
          if (data.name) setName(data.name);
        })
        .catch(() => setResult('error'))
        .finally(() => setLoading(false));
    }
  }, [action, token, status]);

  const isApproved = result === 'approved';
  const isRejected = result === 'rejected';

  return (
    <>
      <Helmet>
        <title>
          {loading ? 'Traitement...' : isApproved ? 'Accès approuvé' : isRejected ? 'Demande refusée' : 'Traitement'}
          {' — IWS LAAYOUNE'}
        </title>
      </Helmet>
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
            <div className="bg-primary px-8 py-6 text-center">
              <h1 className="text-xl font-bold text-white">IWS LAAYOUNE</h1>
              <p className="text-white/70 text-sm mt-1">Plateforme digitale professionnelle</p>
            </div>

            <div className="p-8 text-center">
              {loading && (
                <>
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                  </div>
                  <h2 className="text-2xl font-bold text-primary mb-3">Traitement en cours...</h2>
                  <p className="text-muted-foreground">Veuillez patienter quelques secondes.</p>
                </>
              )}

              {!loading && isApproved && (
                <>
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-primary mb-3">Accès approuvé !</h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {name ? `Le compte de ${name} a été approuvé.` : 'Le compte a été approuvé avec succès.'}
                    <br />Un email de confirmation a été envoyé à l'utilisateur.
                  </p>
                  <Link to="/admin">
                    <Button className="w-full gap-2 bg-accent hover:bg-accent/90 text-primary font-bold">
                      <LogIn className="w-4 h-4" />
                      Accéder au tableau de bord
                    </Button>
                  </Link>
                </>
              )}

              {!loading && isRejected && (
                <>
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-10 h-10 text-red-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-primary mb-3">Demande refusée</h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    La demande a été refusée. Un email a été envoyé à l'utilisateur.
                  </p>
                  <Link to="/admin">
                    <Button variant="outline" className="w-full gap-2">
                      <Home className="w-4 h-4" />
                      Retour au tableau de bord
                    </Button>
                  </Link>
                </>
              )}

              {!loading && !isApproved && !isRejected && (
                <>
                  <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-10 h-10 text-amber-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-primary mb-3">Lien invalide</h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Ce lien est invalide ou a déjà été utilisé.
                  </p>
                  <Link to="/">
                    <Button variant="outline" className="w-full gap-2">
                      <Home className="w-4 h-4" />
                      Retour à l'accueil
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApprovalRedirectPage;
