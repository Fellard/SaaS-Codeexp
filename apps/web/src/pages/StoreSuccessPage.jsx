/**
 * StoreSuccessPage — Page de confirmation de commande magasin
 * Route : /store/success  (accessible sans compte)
 *
 * PayPal redirige ici après paiement approuvé.
 * On capture le paiement et on affiche la confirmation.
 */

import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  CheckCircle2, XCircle, Loader2, ShoppingBag, ArrowRight,
  Package, Mail, Phone, MapPin, RefreshCw,
} from 'lucide-react';
import Logo from '@/components/Logo.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function StoreSuccessPage() {
  const [searchParams] = useSearchParams();

  const [status,  setStatus]  = useState('capturing');  // capturing | success | error | cancelled
  const [message, setMessage] = useState('');
  const [order,   setOrder]   = useState(null);

  const paypalOrderId = searchParams.get('token');
  const pbOrderId     = searchParams.get('pb_order_id');
  const orderType     = searchParams.get('order_type') || 'store';
  const cancelled     = searchParams.get('cancelled');

  // Infos client sauvegardées avant la redirection PayPal
  const clientInfo = (() => {
    try { return JSON.parse(sessionStorage.getItem('checkout_client') || '{}'); }
    catch { return {}; }
  })();

  useEffect(() => {
    if (cancelled === 'true' || !paypalOrderId) { setStatus('cancelled'); return; }
    capture();
  }, []);

  const capture = async () => {
    setStatus('capturing');
    try {
      const res = await fetch(`${API_URL}/paypal/capture-order`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paypalOrderId, pbOrderId, orderType: 'store' }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setOrder({ id: pbOrderId, transactionId: data.transactionId });
        sessionStorage.removeItem('checkout_client');
      } else {
        throw new Error(data.error || 'La capture du paiement a échoué');
      }
    } catch (e) {
      setMessage(e.message);
      setStatus('error');
    }
  };

  return (
    <>
      <Helmet><title>Confirmation commande — IWS Laayoune</title></Helmet>

      {/* Header minimal */}
      <header className="h-14 bg-card border-b border-border flex items-center px-6">
        <Logo size="small" />
      </header>

      <main className="min-h-screen bg-muted flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl shadow-lg p-8 space-y-6 text-center">

          {/* Capturing */}
          {status === 'capturing' && (
            <>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Finalisation du paiement…</h2>
                <p className="text-muted-foreground text-sm mt-1">Confirmation de votre commande en cours</p>
              </div>
            </>
          )}

          {/* Success */}
          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">Commande confirmée ! 🎉</h2>
                <p className="text-muted-foreground text-sm mt-1">Votre paiement a été reçu avec succès.</p>
              </div>

              {/* Détails commande */}
              <div className="bg-muted/60 rounded-xl p-4 text-left space-y-2.5 text-sm">
                {order?.id && (
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">N° commande :</span>
                    <span className="font-mono font-bold text-foreground">#{order.id.slice(-8).toUpperCase()}</span>
                  </div>
                )}
                {clientInfo.nom && (
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">Client :</span>
                    <span className="font-medium text-foreground">{clientInfo.nom}</span>
                  </div>
                )}
                {clientInfo.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">Email :</span>
                    <span className="font-medium text-foreground">{clientInfo.email}</span>
                  </div>
                )}
                {clientInfo.ville && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">Livraison :</span>
                    <span className="font-medium text-foreground">{clientInfo.ville}</span>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 text-sm text-blue-700 dark:text-blue-300 text-left">
                <p className="font-semibold mb-0.5">Prochaines étapes</p>
                <p className="text-xs opacity-80">Notre équipe vous contactera dans les 24h pour organiser la livraison.</p>
              </div>

              <Link
                to="/store"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-6 py-3 font-semibold hover:bg-primary/90 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                Continuer mes achats
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}

          {/* Cancelled */}
          {status === 'cancelled' && (
            <>
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-amber-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Paiement annulé</h2>
                <p className="text-muted-foreground text-sm mt-1">Aucun montant n'a été débité.</p>
              </div>
              <Link to="/store/checkout"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-6 py-3 font-semibold hover:bg-primary/90 transition-colors">
                Retour au panier
              </Link>
            </>
          )}

          {/* Error */}
          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Erreur de paiement</h2>
                <p className="text-muted-foreground text-sm mt-1 break-words">{message}</p>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={capture}
                  className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl px-6 py-3 font-semibold hover:bg-primary/90 transition-colors">
                  <RefreshCw className="w-4 h-4" /> Réessayer
                </button>
                <Link to="/store" className="text-sm text-muted-foreground underline underline-offset-2">
                  Retour au magasin
                </Link>
              </div>
            </>
          )}

        </div>
      </main>
    </>
  );
}
