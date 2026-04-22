/**
 * IWS Recall — Page de révision espacée
 * Interface swipe mobile : glisser droite = acquis, gauche = difficile
 * Fonctionne offline (cards récupérées depuis le cache SW)
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import DashboardLayout from '@/components/DashboardLayout.jsx';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Brain, ChevronLeft, RotateCcw, CheckCircle2, XCircle,
  Zap, Award, TrendingUp, BookOpen, Loader2, AlertCircle,
  RefreshCw, Home,
} from 'lucide-react';
import pb from '@/lib/pocketbaseClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ── Couleurs par résultat ────────────────────────────────────────
const SWIPE_THRESHOLD = 80; // px avant déclenchement

// ── Composant carte avec flip + swipe ────────────────────────────
const FlipCard = ({ card, onResult, isActive }) => {
  const [flipped, setFlipped]       = useState(false);
  const [dragging, setDragging]     = useState(false);
  const [dragX, setDragX]           = useState(0);
  const [leaving, setLeaving]       = useState(null); // 'acquired' | 'hard' | null
  const startXRef                   = useRef(null);
  const cardRef                     = useRef(null);

  // Reset quand la carte change
  useEffect(() => {
    setFlipped(false);
    setDragX(0);
    setLeaving(null);
  }, [card?.cardId]);

  // ── Touch events ─────────────────────────────────────────────
  const handleTouchStart = (e) => {
    if (!flipped) return; // Pas de swipe avant d'avoir vu la réponse
    startXRef.current = e.touches[0].clientX;
    setDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!dragging || startXRef.current === null) return;
    const dx = e.touches[0].clientX - startXRef.current;
    setDragX(dx);
  };

  const handleTouchEnd = () => {
    if (!dragging) return;
    setDragging(false);
    if (dragX > SWIPE_THRESHOLD) {
      triggerResult('acquired');
    } else if (dragX < -SWIPE_THRESHOLD) {
      triggerResult('hard');
    } else {
      setDragX(0); // Revenir au centre
    }
    startXRef.current = null;
  };

  // ── Mouse events (desktop) ───────────────────────────────────
  const handleMouseDown = (e) => {
    if (!flipped) return;
    startXRef.current = e.clientX;
    setDragging(true);
  };

  const handleMouseMove = useCallback((e) => {
    if (!dragging || startXRef.current === null) return;
    setDragX(e.clientX - startXRef.current);
  }, [dragging]);

  const handleMouseUp = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    if (dragX > SWIPE_THRESHOLD) triggerResult('acquired');
    else if (dragX < -SWIPE_THRESHOLD) triggerResult('hard');
    else setDragX(0);
    startXRef.current = null;
  }, [dragging, dragX]);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, handleMouseMove, handleMouseUp]);

  const triggerResult = (result) => {
    setLeaving(result);
    setTimeout(() => onResult(result), 350);
  };

  if (!isActive || !card) return null;

  // Couleur de fond selon le drag
  const swipeProgress = Math.abs(dragX) / SWIPE_THRESHOLD;
  const bgOverlay = dragX > 20
    ? `rgba(34,197,94,${Math.min(swipeProgress * 0.3, 0.3)})`
    : dragX < -20
      ? `rgba(239,68,68,${Math.min(swipeProgress * 0.3, 0.3)})`
      : 'transparent';

  const cardStyle = {
    transform: leaving === 'acquired'
      ? 'translateX(120%) rotate(15deg)'
      : leaving === 'hard'
        ? 'translateX(-120%) rotate(-15deg)'
        : `translateX(${dragX}px) rotate(${dragX * 0.05}deg)`,
    transition: dragging ? 'none' : 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)',
    cursor: flipped ? (dragging ? 'grabbing' : 'grab') : 'pointer',
    userSelect: 'none',
  };

  return (
    <div
      ref={cardRef}
      style={cardStyle}
      className="relative w-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onClick={() => !dragging && Math.abs(dragX) < 5 && setFlipped(f => !f)}
    >
      {/* Indicateurs swipe */}
      {flipped && dragX > 20 && (
        <div className="absolute top-4 right-4 z-20 bg-green-500 text-white font-black text-sm px-3 py-1.5 rounded-full shadow-lg" style={{ opacity: Math.min(swipeProgress, 1) }}>
          ✓ ACQUIS
        </div>
      )}
      {flipped && dragX < -20 && (
        <div className="absolute top-4 left-4 z-20 bg-red-500 text-white font-black text-sm px-3 py-1.5 rounded-full shadow-lg" style={{ opacity: Math.min(swipeProgress, 1) }}>
          ✗ DIFFICILE
        </div>
      )}

      {/* Carte flip */}
      <div className="relative w-full" style={{ perspective: '1200px', height: '300px' }}>
        <div
          className="absolute inset-0 rounded-3xl shadow-2xl transition-all duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            backgroundColor: bgOverlay !== 'transparent' ? bgOverlay : undefined,
          }}
        >
          {/* Face avant — Question */}
          <div
            className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center p-8 text-center"
            style={{ backfaceVisibility: 'hidden', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-5">
              <Brain className="w-6 h-6 text-indigo-400" />
            </div>
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-3">Question</p>
            <p className="text-white text-xl font-bold leading-relaxed">{card.question}</p>
            <p className="text-white/30 text-xs mt-6 flex items-center gap-1.5">
              <span>Appuyer pour voir la réponse</span>
            </p>
          </div>

          {/* Face arrière — Réponse */}
          <div
            className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center p-8 text-center"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)' }}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-400/20 flex items-center justify-center mb-5">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-emerald-300/70 text-xs font-bold uppercase tracking-widest mb-3">Réponse</p>
            <p className="text-white text-xl font-bold leading-relaxed">{card.answer}</p>
            <p className="text-white/30 text-xs mt-6">
              {card.reviewCount > 0 ? `Révisée ${card.reviewCount}× · Série: ${card.streak}` : 'Nouvelle carte'}
            </p>
          </div>
        </div>
      </div>

      {/* Boutons (après flip) */}
      {flipped && (
        <div className="flex gap-4 mt-5">
          <Button
            onClick={(e) => { e.stopPropagation(); triggerResult('hard'); }}
            className="flex-1 h-13 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl gap-2 shadow-lg shadow-red-500/30"
          >
            <XCircle className="w-5 h-5" /> Difficile
          </Button>
          <Button
            onClick={(e) => { e.stopPropagation(); triggerResult('acquired'); }}
            className="flex-1 h-13 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl gap-2 shadow-lg shadow-green-500/30"
          >
            <CheckCircle2 className="w-5 h-5" /> Acquis
          </Button>
        </div>
      )}
    </div>
  );
};

// ── Page principale ───────────────────────────────────────────────
const RecallPage = () => {
  const { currentUser } = useAuth();
  const [searchParams]  = useSearchParams();
  const courseId        = searchParams.get('course');

  const [cards, setCards]         = useState([]);
  const [current, setCurrent]     = useState(0);
  const [results, setResults]     = useState([]); // {cardId, result, sessionId}[]
  const [phase, setPhase]         = useState('loading'); // loading | session | summary | empty | error
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg]   = useState('');

  const token = pb.authStore.token;

  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type':  'application/json',
  };

  // ── Charger les cartes dues ───────────────────────────────────
  useEffect(() => {
    loadCards();
  }, [courseId]);

  const loadCards = async () => {
    setPhase('loading');
    try {
      // Si un courseId est passé dans l'URL, générer d'abord les cartes pour ce cours
      if (courseId) {
        await generateCards(courseId);
      }

      const res  = await fetch(`${API_URL}/recall/due`, { headers: authHeaders });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Erreur serveur (${res.status})`);
      }
      const data = await res.json();

      // Collections pas encore créées
      if (data.migrationPending) { setPhase('migration'); return; }

      // Pas de cartes → générer pour le PREMIER cours inscrit uniquement
      if (!data.cards || data.cards.length === 0) {
        let generated = false;
        try {
          const enrollments = await pb.collection('course_enrollments').getFullList({
            filter: `user_id="${currentUser?.id}"`,
            $autoCancel: false,
          });
          if (enrollments.length > 0) {
            // Un seul cours à la fois pour éviter le timeout
            await generateCards(enrollments[0].course_id);

            const res2  = await fetch(`${API_URL}/recall/due`, { headers: authHeaders });
            const data2 = await res2.json();
            if (data2.cards && data2.cards.length > 0) {
              setCards(data2.cards);
              setResults([]);
              setCurrent(0);
              setPhase('session');
              generated = true;
            }
          }
        } catch (e) {
          console.error('[Recall] auto-generate error:', e.message);
        }
        if (!generated) setPhase('empty');
        return;
      }

      setCards(data.cards);
      setResults([]);
      setCurrent(0);
      setPhase('session');
    } catch (err) {
      console.error('[Recall] loadCards error:', err.message);
      setErrorMsg(err.message);
      setPhase('error');
    }
  };

  // generateCards avec timeout 25 secondes pour éviter le chargement infini
  const generateCards = async (cId) => {
    setGenerating(true);
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => {
      controller.abort();
      console.warn('[Recall] generateCards timeout (25s) pour cours', cId);
    }, 25000);

    try {
      const res = await fetch(`${API_URL}/recall/generate/${cId}`, {
        method:  'POST',
        headers: authHeaders,
        signal:  controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('[Recall] generate failed:', res.status, err);
      }
    } catch (e) {
      clearTimeout(timeoutId);
      if (e.name !== 'AbortError') {
        console.error('[Recall] generate network error:', e.message);
      }
    }
    setGenerating(false);
  };

  // ── Résultat d'une carte ──────────────────────────────────────
  const handleResult = async (result) => {
    const card = cards[current];
    if (!card) return;

    // Envoyer au serveur en arrière-plan (non-bloquant pour l'UX)
    fetch(`${API_URL}/recall/review`, {
      method:  'POST',
      headers: authHeaders,
      body:    JSON.stringify({ cardId: card.cardId, result, sessionId: card.sessionId || undefined }),
    }).catch(() => {});

    const newResults = [...results, { cardId: card.cardId, result, question: card.question }];
    setResults(newResults);

    if (current + 1 >= cards.length) {
      setPhase('summary');
    } else {
      setCurrent(c => c + 1);
    }
  };

  const acquired = results.filter(r => r.result === 'acquired').length;
  const hard     = results.filter(r => r.result === 'hard').length;
  const accuracy = results.length > 0 ? Math.round((acquired / results.length) * 100) : 0;

  // ── États d'affichage ─────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-muted-foreground font-medium">
            {generating ? 'Génération des cartes par l\'IA…' : 'Chargement de vos révisions…'}
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (phase === 'error') {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-bold">Une erreur est survenue</h2>
          <p className="text-muted-foreground text-sm max-w-sm">{errorMsg}</p>
          <Button onClick={loadCards} className="gap-2"><RefreshCw className="w-4 h-4" /> Réessayer</Button>
        </div>
      </DashboardLayout>
    );
  }

  if (phase === 'migration') {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
          <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-950/30 rounded-3xl flex items-center justify-center mx-auto">
            <Brain className="w-10 h-10 text-indigo-500" />
          </div>
          <h2 className="text-xl font-bold">IWS Recall — Initialisation</h2>
          <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
            Le service de révision s'initialise. Si le problème persiste, veuillez redémarrer le serveur API ou contacter l'administrateur.
          </p>
          <div className="flex gap-3">
            <Button onClick={loadCards} variant="outline" className="gap-2"><RefreshCw className="w-4 h-4" /> Réessayer</Button>
            <Link to="/dashboard"><Button variant="ghost" className="gap-2"><Home className="w-4 h-4" /> Tableau de bord</Button></Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (phase === 'empty') {
    return (
      <DashboardLayout>
        <Helmet><title>IWS Recall — Aucune révision</title></Helmet>
        <div className="max-w-md mx-auto text-center py-16 px-4">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Award className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-foreground mb-3">Tout est à jour !</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Excellent travail ! Toutes vos cartes sont à jour. Revenez demain pour votre prochaine session de révision.
          </p>
          <Link to="/dashboard/courses">
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
              <BookOpen className="w-4 h-4" /> Voir mes cours
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // ── Résumé de session ─────────────────────────────────────────
  if (phase === 'summary') {
    return (
      <DashboardLayout>
        <Helmet><title>IWS Recall — Résumé</title></Helmet>
        <div className="max-w-md mx-auto py-10 px-4">
          {/* Header */}
          <div className={`rounded-3xl p-8 text-center mb-6 ${accuracy >= 70 ? 'bg-gradient-to-br from-emerald-500 to-green-600' : 'bg-gradient-to-br from-amber-500 to-orange-600'}`}>
            <div className="text-5xl mb-3">{accuracy >= 90 ? '🏆' : accuracy >= 70 ? '⭐' : '💪'}</div>
            <h2 className="text-2xl font-black text-white mb-1">Session terminée !</h2>
            <p className="text-white/80 text-sm">{results.length} carte{results.length > 1 ? 's' : ''} révisée{results.length > 1 ? 's' : ''}</p>
            <div className="text-4xl font-black text-white mt-3">{accuracy}%</div>
            <p className="text-white/70 text-xs mt-1">Taux d'acquisition</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-card rounded-2xl border border-border p-5 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-3xl font-black text-green-600">{acquired}</p>
              <p className="text-sm text-muted-foreground mt-1">Acquises</p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-5 text-center">
              <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-3xl font-black text-red-600">{hard}</p>
              <p className="text-sm text-muted-foreground mt-1">À retravailler</p>
            </div>
          </div>

          {/* Détail des cartes difficiles */}
          {hard > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-6">
              <p className="text-amber-800 dark:text-amber-300 font-bold text-sm mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" /> À revoir prochainement
              </p>
              <div className="space-y-2">
                {results.filter(r => r.result === 'hard').map((r, i) => (
                  <p key={i} className="text-amber-700 dark:text-amber-400 text-xs bg-amber-100/60 dark:bg-amber-900/30 rounded-lg px-3 py-2">
                    {r.question}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {hard > 0 && (
              <Button
                onClick={loadCards}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 rounded-2xl h-12"
              >
                <RotateCcw className="w-4 h-4" /> Réviser à nouveau
              </Button>
            )}
            <Link to="/dashboard">
              <Button variant="outline" className="w-full gap-2 rounded-2xl h-12">
                <Home className="w-4 h-4" /> Retour au tableau de bord
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Session de révision ───────────────────────────────────────
  const card         = cards[current];
  const progress     = Math.round((current / cards.length) * 100);
  const remaining    = cards.length - current;

  return (
    <DashboardLayout>
      <Helmet><title>IWS Recall — Révision</title></Helmet>

      <div className="max-w-md mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard" className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-500" />
            <span className="font-bold text-foreground text-sm">IWS Recall</span>
          </div>
          <div className="text-sm font-bold text-muted-foreground">
            {current + 1} / {cards.length}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <Progress value={progress} className="h-2 rounded-full" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span className="text-green-600 font-medium">{results.filter(r => r.result === 'acquired').length} acquises</span>
            <span>{remaining} restante{remaining > 1 ? 's' : ''}</span>
            <span className="text-red-500 font-medium">{results.filter(r => r.result === 'hard').length} difficiles</span>
          </div>
        </div>

        {/* Indice swipe (première carte) */}
        {current === 0 && (
          <div className="flex justify-center gap-6 mb-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">← <span className="text-red-500 font-medium">Difficile</span></span>
            <span className="text-muted-foreground/50">·</span>
            <span className="flex items-center gap-1"><span className="text-green-600 font-medium">Acquis</span> →</span>
          </div>
        )}

        {/* Carte active */}
        <FlipCard
          card={card}
          onResult={handleResult}
          isActive={phase === 'session'}
          key={card?.cardId}
        />

        {/* Hint tap */}
        {card && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            Appuie sur la carte pour voir la réponse, puis swipe ou clique sur Acquis / Difficile
          </p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RecallPage;
