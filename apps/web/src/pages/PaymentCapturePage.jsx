/**
 * PaymentCapturePage — Page de retour après paiement PayPal
 *
 * PayPal redirige ici avec : ?token=PAYPAL_ORDER_ID&PayerID=...
 * + nos params : pb_order_id, course_id, user_id, order_type
 *
 * Cette page capture le paiement et redirige vers le cours.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, BookOpen, ArrowRight } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function PaymentCapturePage() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();

  const [status,  setStatus]  = useState('capturing'); // capturing | success | error | cancelled
  const [message, setMessage] = useState('');

  // Paramètres PayPal + nos params
  const paypalOrderId = searchParams.get('token');
  const pbOrderId     = searchParams.get('pb_order_id');
  const courseId      = searchParams.get('course_id');
  const userId        = searchParams.get('user_id');
  const orderType     = searchParams.get('order_type') || 'formation';
  const cancelled     = searchParams.get('cancelled');

  useEffect(() => {
    if (cancelled === 'true' || !paypalOrderId) {
      setStatus('cancelled');
      return;
    }

    capture();
  }, []);

  const capture = async () => {
    setStatus('capturing');
    try {
      const res = await fetch(`${API_URL}/paypal/capture-order`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paypalOrderId,
          pbOrderId,
          courseId,
          userId,
          orderType,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('success');
        // Redirection automatique vers le cours après 3 secondes
        if (courseId) {
          setTimeout(() => navigate(`/dashboard/courses/${courseId}/view`), 3000);
        } else {
          setTimeout(() => navigate('/dashboard/courses'), 3000);
        }
      } else {
        throw new Error(data.error || 'La capture du paiement a échoué');
      }
    } catch (e) {
      setMessage(e.message);
      setStatus('error');
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl shadow-lg p-8 text-center space-y-6">

          {/* Capturing */}
          {status === 'capturing' && (
            <>
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Finalisation du paiement…</h2>
                <p className="text-muted-foreground text-sm mt-1">Confirmation de votre paiement PayPal en cours</p>
              </div>
            </>
          )}

          {/* Success */}
          {status === 'success' && (
            <>
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Paiement confirmé !</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Votre paiement PayPal a été capturé avec succès. Accès au cours activé.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirection vers votre cours dans 3 secondes…
              </div>
              <Link
                to={courseId ? `/dashboard/courses/${courseId}/view` : '/dashboard/courses'}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-6 py-3 font-semibold hover:bg-primary/90 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Accéder au cours maintenant
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}

          {/* Cancelled */}
          {status === 'cancelled' && (
            <>
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-amber-500" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Paiement annulé</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Vous avez annulé le paiement PayPal. Aucun montant n'a été débité.
                </p>
              </div>
              <Link
                to={courseId ? `/dashboard/courses/${courseId}/view` : '/dashboard/courses'}
                className="inline-flex items-center gap-2 bg-muted text-foreground rounded-xl px-6 py-3 font-semibold hover:bg-muted/80 transition-colors"
              >
                Retour au cours
              </Link>
            </>
          )}

          {/* Error */}
          {status === 'error' && (
            <>
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-destructive" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Erreur de paiement</h2>
                <p className="text-muted-foreground text-sm mt-1 break-words">{message}</p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={capture}
                  className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl px-6 py-3 font-semibold hover:bg-primary/90 transition-colors"
                >
                  Réessayer la capture
                </button>
                <Link
                  to="/dashboard/orders"
                  className="text-sm text-muted-foreground underline underline-offset-2"
                >
                  Voir mes commandes
                </Link>
              </div>
            </>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
