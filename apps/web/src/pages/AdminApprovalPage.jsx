import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, Home, LogIn } from 'lucide-react';

const AdminApprovalPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('Vérification du lien d\'approbation...');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        console.log('❌ Invalid approval token: No token provided');
        setStatus('error');
        setMessage('Lien d\'approbation invalide ou expiré');
        return;
      }

      try {
        // Fetch the pending approval record
        const record = await pb.collection('pending_approval').getFirstListItem(`approval_token="${token}"`, {
          requestKey: null
        });

        if (record.status === 'pending') {
          // Update the pending_approval record
          await pb.collection('pending_approval').update(record.id, {
            status: 'approved',
            approval_date: new Date().toISOString()
          }, { requestKey: null });

          // Also update the actual user record to approved=true so they can log in
          try {
            await pb.collection('users').update(record.user_id, {
              approved: true
            }, { requestKey: null });
          } catch (userUpdateErr) {
            console.error('Failed to update user approved status:', userUpdateErr);
            // Continue anyway as the pending record was updated
          }

          console.log('✅ Approval token validated');
          setStatus('success');
          setMessage('Compte approuvé! Vous pouvez maintenant vous connecter');
        } else {
          console.log('❌ Invalid approval token: Record already processed');
          setStatus('error');
          setMessage('Ce compte a déjà été traité.');
        }
      } catch (error) {
        console.log('❌ Invalid approval token: Record not found or error', error);
        setStatus('error');
        setMessage('Lien d\'approbation invalide ou expiré');
      }
    };

    validateToken();
  }, [token]);

  return (
    <>
      <Helmet>
        <title>Approbation Administrateur - IWS Smart Platform</title>
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
               status === 'success' ? 'Approbation Réussie' : 'Erreur d\'approbation'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6 pt-4">
            <p className="text-slate-600 text-lg">
              {message}
            </p>
            
            <div className="pt-4">
              {status === 'success' ? (
                <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700">
                  <Link to="/login">
                    <LogIn className="w-4 h-4 mr-2" />
                    Se connecter
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="outline" className="w-full">
                  <Link to="/">
                    <Home className="w-4 h-4 mr-2" />
                    Retour à l'accueil
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminApprovalPage;