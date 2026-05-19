/**
 * PayPalButton — Bouton de paiement PayPal (flux redirect)
 *
 * Au lieu d'utiliser le SDK PayPal (iframe), ce composant redirige
 * l'utilisateur vers paypal.com pour payer, puis PayPal redirige vers
 * /payment/success pour capturer le paiement.
 *
 * Props :
 *   amount      {number}  Montant en MAD
 *   description {string}  Description de l'achat
 *   courseId    {string}  ID du cours PocketBase
 *   userId      {string}  ID de l'utilisateur PocketBase
 *   orderType   {string}  "formation" | "web_agency"
 *   onError     {function} Appelée en cas d'erreur → (message)
 */

import React, { useState } from 'react';
import { Loader2, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const PayPalButton = ({
  amount,
  description = 'IWS Laayoune',
  courseId    = null,
  userId      = null,
  orderType   = 'formation',
  onError,
}) => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handlePay = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/paypal/create-order`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ amount, description, orderType, courseId, userId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Erreur serveur (${res.status})`);
      }

      const data = await res.json();

      if (!data.approvalUrl) {
        throw new Error("Pas d'URL de paiement retournée par le serveur");
      }

      // Redirection vers PayPal
      window.location.href = data.approvalUrl;

    } catch (e) {
      setError(e.message);
      onError?.(e.message);
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="space-y-2">
        <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">PayPal indisponible</p>
            <p className="text-xs mt-0.5 opacity-80 break-words">{error}</p>
          </div>
        </div>
        <button
          onClick={handlePay}
          className="flex items-center gap-1.5 text-xs text-muted-foreground underline underline-offset-2 hover:opacity-70"
        >
          <RefreshCw className="w-3 h-3" /> Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-[#0070BA] hover:bg-[#003087] disabled:opacity-60 text-white font-bold rounded-full px-6 py-3.5 transition-colors shadow-md"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Redirection vers PayPal…
          </>
        ) : (
          <>
            <PayPalLogo />
            Payer avec PayPal
            <ExternalLink className="w-4 h-4 opacity-70" />
          </>
        )}
      </button>
      <p className="text-center text-xs text-muted-foreground">
        🔒 Vous serez redirigé vers PayPal pour compléter le paiement en toute sécurité
      </p>
    </div>
  );
};

// Logo PayPal SVG simplifié
const PayPalLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.5 21L9 3h6.5c2.5 0 4.5 1 4.5 4 0 4-3 6-6.5 6H11L9.5 21H7.5z" fill="#ffffff" opacity="0.8"/>
    <path d="M4 21l1.5-18H12c2.5 0 4.5 1 4.5 4 0 4-3 6-6.5 6H7.5L6 21H4z" fill="#ffffff"/>
  </svg>
);

export default PayPalButton;
