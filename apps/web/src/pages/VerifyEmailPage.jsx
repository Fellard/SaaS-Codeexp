import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, LogIn, MailWarning } from 'lucide-react';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('Vérification de votre adresse email...');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Lien de vérification invalide ou manquant.');
        return;
      }

      try {
        // Find the user with this verification token
        const user = await pb.collection('users').getFirstListItem(`verification_token="${token}"`, {
          requestKey: null
        });

        if (user) {
          // Update user to set emailVerified to true and clear the token
          await pb.collection('users').update(user.id, {
            emailVerified: true,
            verification_token: '' // Clear token after use
          }, { requestKey: null });

          setStatus('success');
          setMessage('Email confirmé! Vous pouvez maintenant vous connecter.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Lien invalide ou expiré.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <>
      <Helmet>
        <title>Vérification Email - IWS Smart Platform</title>
      </Helmet>
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 flex items-center justify-center mb-4 rounded-full">
              {status === 'loading' && <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />}
              {status === 'success' && <CheckCircle2 className="w-12 h-12 text-emerald-500" />}
              {status === 'error' && <XCircle className="w-12 h-12 text-red-500" />}
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {status === 'loading' ? 'Vérification en cours' : 
               status === 'success' ? 'Vérification Réussie' : 'Erreur de vérification'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6 pt-4">
            <p className="text-slate-600 text-lg">
              {message}
            </p>
            
            <div className="pt-4 space-y-3">
              {status === 'success' ? (
                <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700">
                  <Link to="/login">
                    <LogIn className="w-4 h-4 mr-2" />
                    Se connecter
                  </Link>
                </Button>
              ) : status === 'error' ? (
                <>
                  <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700">
                    <Link to="/resend-verification">
                      <MailWarning className="w-4 h-4 mr-2" />
                      Demander un nouveau lien
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/">
                      Retour à l'accueil
                    </Link>
                  </Button>
                </>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default VerifyEmailPage;