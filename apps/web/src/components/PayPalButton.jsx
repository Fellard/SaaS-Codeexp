/**
 * PayPalButton — Bouton de paiement PayPal
 * Version avec diagnostic complet et timeouts
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const PayPalButton = ({
  amount,
  description   = 'IWS Laayoune',
  pbOrderId     = null,
  orderType     = 'formation',
  onSuccess,
  onError,
  onCancel,
}) => {
  const containerRef = useRef(null);
  const buttonsRef   = useRef(null);
  const [status, setStatus]     = useState('idle'); // idle | loading | ready | error
  const [errorMsg, setErrorMsg] = useState('');
  const [step, setStep]         = useState('');    // message de progression

  const init = useCallback(async () => {
    setStatus('loading');
    setErrorMsg('');

    try {
      // ── Étape 1 : Contacter l'API ───────────────────────────────
      setStep('Contacting API…');
      console.log('[PayPal] Fetching config from', `${API_URL}/paypal/config`);

      const controller = new AbortController();
      const apiTimer   = setTimeout(() => controller.abort(), 8000);

      let configData;
      try {
        const res = await fetch(`${API_URL}/paypal/config`, { signal: controller.signal });
        clearTimeout(apiTimer);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `API erreur ${res.status}`);
        }
        configData = await res.json();
      } catch (e) {
        clearTimeout(apiTimer);
        if (e.name === 'AbortError') {
          throw new Error(`API inaccessible — vérifiez que l'API tourne sur ${API_URL}`);
        }
        throw new Error(`API: ${e.message}`);
      }

      const { clientId, currency = 'USD' } = configData;
      console.log('[PayPal] Config OK — mode:', configData.mode, '| clientId:', clientId?.substring(0, 10) + '…');

      if (!clientId || clientId.length < 10) {
        throw new Error('PAYPAL_CLIENT_ID manquant dans le .env de l\'API');
      }

      // ── Étape 2 : Charger le SDK PayPal ────────────────────────
      setStep('Loading PayPal SDK…');
      console.log('[PayPal] Loading SDK…');

      if (!window.paypal) {
        await withTimeout(
          loadPayPalSDK(clientId, currency),
          15000,
          'Le SDK PayPal n\'a pas répondu en 15s — vérifiez la connexion internet'
        );
      }
      console.log('[PayPal] SDK loaded ✓');

      if (!containerRef.current) return;

      // ── Étape 3 : Nettoyer l'ancien bouton si re-render ────────
      if (buttonsRef.current) {
        try { buttonsRef.current.close?.(); } catch {}
        buttonsRef.current = null;
      }
      containerRef.current.innerHTML = '';

      // ── Étape 4 : Créer + rendre les boutons PayPal ────────────
      setStep('Initializing PayPal buttons…');
      console.log('[PayPal] Creating buttons…');

      buttonsRef.current = window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color:  'blue',
          shape:  'pill',
          label:  'pay',
          height: 50,
        },

        createOrder: async () => {
          const res = await fetch(`${API_URL}/paypal/create-order`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ amount, description, orderId: pbOrderId, orderType }),
          });
          if (!res.ok) throw new Error('Impossible de créer la commande PayPal');
          const data = await res.json();
          return data.id;
        },

        onApprove: async (data) => {
          setStatus('loading');
          setStep('Capturing payment…');
          try {
            const res = await fetch(`${API_URL}/paypal/capture-order`, {
              method:  'POST',
              headers: { 'Content-Type': 'application/json' },
              body:    JSON.stringify({ paypalOrderId: data.orderID, pbOrderId, orderType }),
            });
            const result = await res.json();
            if (result.success) {
              onSuccess?.({ transactionId: result.transactionId, pbOrderId });
            } else {
              throw new Error(result.error || 'Capture échouée');
            }
          } catch (e) {
            onError?.(e.message);
            setErrorMsg(e.message);
            setStatus('error');
          }
        },

        onCancel: () => onCancel?.(),

        onError: (err) => {
          console.error('[PayPal] Button error:', err);
          const msg = typeof err === 'string' ? err : (err?.message || 'Erreur inconnue');
          onError?.(msg);
          setErrorMsg('Erreur PayPal : ' + msg);
          setStatus('error');
        },
      });

      if (!buttonsRef.current.isEligible()) {
        throw new Error(
          'PayPal non disponible dans cet environnement. ' +
          'Vérifiez que votre compte PayPal Business est vérifié et que la devise USD est activée.'
        );
      }

      console.log('[PayPal] Rendering buttons…');
      await withTimeout(
        buttonsRef.current.render(containerRef.current),
        30000,
        'PayPal n\'a pas rendu les boutons en 30s — essayez en navigation privée (Ctrl+Shift+N)'
      );

      console.log('[PayPal] Buttons rendered ✓');
      setStep('');
      setStatus('ready');

    } catch (e) {
      console.error('[PayPal] Init error:', e.message);
      setErrorMsg(e.message);
      setStatus('error');
    }
  }, [amount, pbOrderId, orderType, description]);

  useEffect(() => {
    init();
    return () => {
      try { buttonsRef.current?.close?.(); } catch {}
    };
  }, [init]);

  return (
    <div className="w-full space-y-2">
      {/* Loader avec étape */}
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-2 py-5 text-muted-foreground text-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{step || 'Chargement de PayPal…'}</span>
        </div>
      )}

      {/* Erreur avec retry */}
      {status === 'error' && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-sm text-destructive space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">PayPal indisponible</p>
              <p className="text-xs mt-0.5 opacity-80 break-words">{errorMsg}</p>
            </div>
          </div>
          <button
            onClick={init}
            className="flex items-center gap-1.5 text-xs underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            <RefreshCw className="w-3 h-3" />
            Réessayer
          </button>
        </div>
      )}

      {/* Conteneur boutons PayPal */}
      <div
        ref={containerRef}
        className={status === 'loading' || status === 'error' ? 'hidden' : 'block'}
      />

      {/* Note sécurité */}
      {status === 'ready' && (
        <p className="text-center text-xs text-muted-foreground">
          🔒 Paiement sécurisé via PayPal — Visa, Mastercard, compte PayPal acceptés
        </p>
      )}
    </div>
  );
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function withTimeout(promise, ms, timeoutMsg) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMsg)), ms)
    ),
  ]);
}

function loadPayPalSDK(clientId, currency = 'USD') {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById('paypal-sdk');
    if (existing) {
      if (window.paypal) { resolve(); return; }
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', () => reject(new Error('Erreur chargement SDK PayPal')), { once: true });
      return;
    }

    const script  = document.createElement('script');
    script.id     = 'paypal-sdk';
    script.src    = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Impossible de charger le SDK depuis paypal.com'));
    document.head.appendChild(script);
  });
}

export default PayPalButton;
