import React, { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const AdminApprovalHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (processedRef.current) return;
    processedRef.current = true;

    const processApproval = async () => {
      const token = searchParams.get('token');
      const action = searchParams.get('action');

      if (!token || !action) {
        toast.error('Paramètres manquants ou invalides.');
        navigate('/dashboard/admin');
        return;
      }

      try {
        // 1. Verify token exists in pending_approval collection
        // We pass the token as a query parameter to satisfy the listRule: approval_token = @request.query.token
        const record = await pb.collection('pending_approval').getFirstListItem(`approval_token="${token}"`, { 
          token: token,
          requestKey: null 
        });

        if (action === 'approve') {
          // 2. Update user to approved=true
          await pb.collection('users').update(record.user_id, { 
            approved: true 
          }, { requestKey: null });
          
          // 3. Update pending_approval status
          await pb.collection('pending_approval').update(record.id, { 
            status: 'approved',
            approval_date: new Date().toISOString(),
            approved_by: pb.authStore.model?.id
          }, { requestKey: null });
          
          toast.success('Enregistrement approuvé!');
        } else if (action === 'reject') {
          // Delete pending_approval record
          await pb.collection('pending_approval').delete(record.id, { requestKey: null });
          toast.success('Enregistrement rejeté');
        } else {
          toast.error('Action non reconnue.');
        }
      } catch (error) {
        console.error('[AdminApprovalHandler] Error:', error);
        toast.error('Jeton invalide, expiré, ou vous n\'avez pas les permissions nécessaires.');
      } finally {
        // Always redirect back to admin dashboard after processing
        navigate('/dashboard/admin');
      }
    };

    processApproval();
  }, [searchParams, navigate]);

  return (
    <>
      <Helmet>
        <title>Traitement de l'approbation - IWS Smart Platform</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Traitement de la demande...</h2>
          <p className="text-slate-500">Veuillez patienter pendant que nous mettons à jour le statut d'approbation. Vous serez redirigé automatiquement.</p>
        </div>
      </div>
    </>
  );
};

export default AdminApprovalHandler;