/**
 * usePWA — Hook pour gérer l'installation de la PWA
 *
 * Usage :
 *   const { canInstall, isInstalled, isIOS, install, dismissInstall } = usePWA();
 *
 * - canInstall   : true si le navigateur supporte le prompt d'installation (Android/Chrome)
 * - isInstalled  : true si l'app est déjà installée (mode standalone)
 * - isIOS        : true si l'utilisateur est sur iOS (afficher instructions manuelles)
 * - install()    : déclenche le prompt natif
 * - dismissInstall() : masque la bannière pour cette session
 */

import { useState, useEffect, useCallback } from 'react';

export const usePWA = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [canInstall, setCanInstall]       = useState(false);
  const [isInstalled, setIsInstalled]     = useState(false);
  const [isIOS, setIsIOS]                 = useState(false);
  const [dismissed, setDismissed]         = useState(
    () => sessionStorage.getItem('pwa-install-dismissed') === 'true'
  );

  useEffect(() => {
    // Detect iOS
    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    setIsIOS(ios);

    // Detect if already installed (standalone mode)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsInstalled(standalone);

    // Android/Chrome — catch the beforeinstallprompt event
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful install
    const onInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setInstallPrompt(null);
    };
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setCanInstall(false);
    }
    setInstallPrompt(null);
  }, [installPrompt]);

  const dismissInstall = useCallback(() => {
    sessionStorage.setItem('pwa-install-dismissed', 'true');
    setDismissed(true);
  }, []);

  // Show banner if: can install OR iOS instructions needed, and not dismissed, not installed
  const showBanner = !isInstalled && !dismissed && (canInstall || isIOS);

  return { canInstall, isInstalled, isIOS, install, dismissInstall, showBanner };
};

// ── Register Service Worker ────────────────────────────────────────
export const registerSW = () => {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

      reg.addEventListener('updatefound', () => {
        const newSW = reg.installing;
        if (!newSW) return;
        newSW.addEventListener('statechange', () => {
          if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available — optionally notify the user
            console.log('[IWS PWA] Nouvelle version disponible. Rechargez pour mettre à jour.');
            // Auto-update after 10s (can be made interactive)
            setTimeout(() => newSW.postMessage({ type: 'SKIP_WAITING' }), 10000);
          }
        });
      });

      console.log('[IWS PWA] Service Worker enregistré :', reg.scope);
    } catch (err) {
      console.warn('[IWS PWA] Échec enregistrement SW :', err);
    }
  });
};
