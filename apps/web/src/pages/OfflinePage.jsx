import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { WifiOff, RefreshCw, BookOpen, GraduationCap, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OfflinePage = () => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const onOnline  = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online',  onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Auto-redirect when back online
  useEffect(() => {
    if (isOnline) {
      setTimeout(() => { window.location.href = '/dashboard'; }, 1200);
    }
  }, [isOnline]);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <>
      <Helmet><title>Hors ligne — IWS Learn</title></Helmet>

      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-6 text-center">

        {/* Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl font-black text-amber-400">IWS</span>
          </div>
          <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">Learn</p>
        </div>

        {/* Status icon */}
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-500 ${
          isOnline ? 'bg-emerald-500/20 border-2 border-emerald-500/60' : 'bg-slate-700/50 border-2 border-slate-600'
        }`}>
          {isOnline
            ? <Wifi className="w-10 h-10 text-emerald-400 animate-pulse" />
            : <WifiOff className="w-10 h-10 text-slate-400" />
          }
        </div>

        {isOnline ? (
          <>
            <h1 className="text-2xl font-bold text-emerald-400 mb-2">Connexion rétablie !</h1>
            <p className="text-slate-400 mb-6">Redirection en cours…</p>
            <div className="w-48 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full animate-pulse w-3/4" />
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white mb-3">Vous êtes hors ligne</h1>
            <p className="text-slate-400 mb-8 max-w-sm leading-relaxed">
              Pas de connexion internet détectée. Les cours que vous avez déjà consultés sont disponibles en mode hors ligne.
            </p>

            {/* What's available offline */}
            <div className="w-full max-w-sm bg-slate-800/60 border border-slate-700 rounded-2xl p-5 mb-8 text-left space-y-3">
              <p className="text-slate-300 text-sm font-semibold mb-3">Disponible sans connexion :</p>
              {[
                { icon: BookOpen, text: 'Cours déjà consultés' },
                { icon: GraduationCap, text: 'Vos résultats et progression' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-slate-300 text-sm">{text}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="h-12 px-8 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl gap-2 shadow-lg shadow-amber-500/20"
            >
              <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Vérification…' : 'Réessayer'}
            </Button>
          </>
        )}
      </div>
    </>
  );
};

export default OfflinePage;
