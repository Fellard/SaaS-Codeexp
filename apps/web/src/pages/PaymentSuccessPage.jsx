import React, { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShoppingBag, LayoutDashboard, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '@/hooks/useCart.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const PaymentSuccessPage = () => {
  const { clearCart } = useCart();
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [enrolledCourse, setEnrolledCourse] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const capturedRef = useRef(false);

  useEffect(() => {
    if (capturedRef.current) return;
    capturedRef.current = true;
    clearCart();
    processPayment();
  }, []);

  const processPayment = async () => {
    // Paramètres ajoutés par PayPal dans l'URL de retour + nos params custom
    const paypalOrderId = searchParams.get('token');          // PayPal ajoute ?token=PAYPAL_ORDER_ID
    const pbOrderId     = searchParams.get('pb_order_id');
    const courseId      = searchParams.get('course_id');
    const userId        = searchParams.get('user_id');
    const orderType     = searchParams.get('order_type') || 'formation';

    // ── Cas 1 : paiement PayPal (token présent dans l'URL) ──────────
    if (paypalOrderId) {
      try {
        const res = await fetch(`${API_URL}/paypal/capture-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paypalOrderId, pbOrderId, courseId, userId, orderType }),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || data.detail || 'Capture du paiement échouée');
        }

        // Charger les infos du cours pour l'affichage
        if (courseId) {
          try {
            const course = await pb.collection('courses').getOne(courseId, { requestKey: null });
            setEnrolledCourse(course);
          } catch { /* cours pas critique */ }
        }

        setStatus('success');
      } catch (err) {
        console.error('Capture PayPal échouée:', err);
        setErrorMsg(err.message);
        setStatus('error');
      }
      return;
    }

    // ── Cas 2 : fallback sessionStorage (paiement espèces / virement) ─
    const pendingCourseId = sessionStorage.getItem('pending_course_enrollment');
    if (pendingCourseId && currentUser) {
      sessionStorage.removeItem('pending_course_enrollment');
      try {
        try {
          await pb.collection('course_enrollments').getFirstListItem(
            `user_id="${currentUser.id}" && course_id="${pendingCourseId}"`,
            { requestKey: null }
          );
        } catch {
          await pb.collection('course_enrollments').create({
            user_id:    currentUser.id,
            course_id:  pendingCourseId,
            status:     'active',
            progression: 0,
            complete:   false,
            start_date: new Date().toISOString(),
          }, { requestKey: null });
        }
        const course = await pb.collection('courses').getOne(pendingCourseId, { requestKey: null });
        setEnrolledCourse(course);
      } catch (err) {
        console.error('Erreur auto-enrollment:', err);
      }
    }

    setStatus('success');
  };

  // ── État chargement ───────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <>
        <Helmet><title>Confirmation du paiement — IWS</title></Helmet>
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Confirmation du paiement en cours…</p>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  // ── État erreur ───────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <>
        <Helmet><title>Problème de paiement — IWS</title></Helmet>
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Header />
          <main className="flex-1 flex items-center justify-center px-4">
            <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-3">Problème de confirmation</h1>
              <p className="text-slate-500 mb-2">Le paiement a peut-être été effectué mais la confirmation a échoué.</p>
              {errorMsg && <p className="text-red-500 text-sm bg-red-50 rounded-lg p-3 mb-6">{errorMsg}</p>}
              <p className="text-slate-500 text-sm mb-6">Contactez-nous si votre cours n'est pas accessible dans quelques minutes.</p>
              <div className="flex gap-3 justify-center">
                <Link to="/dashboard">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                    <LayoutDashboard className="w-4 h-4" /> Mon espace
                  </Button>
                </Link>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  // ── État succès ───────────────────────────────────────────────────
  return (
    <>
      <Helmet>
        <title>Paiement confirmé — IWS Smart Platform</title>
        <meta name="description" content="Votre paiement a été confirmé. Merci !" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />

        <main className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="max-w-lg w-full">
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-green-50 to-transparent pointer-events-none" />

              <div className="relative z-10">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4" style={{ letterSpacing: '-0.01em' }}>
                  Paiement confirmé !
                </h1>

                <p className="text-slate-600 mb-8 leading-relaxed">
                  Merci pour votre confiance. Votre paiement a été validé et votre accès est actif.
                </p>

                {/* Cours inscrit automatiquement */}
                {enrolledCourse && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6 text-left">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-emerald-800 text-sm">Accès activé automatiquement</p>
                        <p className="text-emerald-700 font-bold mt-0.5">
                          {enrolledCourse.title || enrolledCourse.titre || enrolledCourse.title_fr || 'Votre cours'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left border border-slate-100">
                  <h3 className="font-semibold text-slate-900 mb-2">Et maintenant ?</h3>
                  <ul className="text-sm text-slate-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                      Votre cours est disponible immédiatement dans votre espace.
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                      Un reçu est disponible dans vos commandes.
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {enrolledCourse ? (
                    <Link to={`/courses/${enrolledCourse.id}`} className="flex-1">
                      <Button className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700 gap-2">
                        <BookOpen className="w-5 h-5" />
                        Commencer ma formation
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/store" className="flex-1">
                      <Button variant="outline" className="w-full h-12 text-base gap-2 border-slate-200 hover:bg-slate-50">
                        <ShoppingBag className="w-5 h-5" />
                        Voir les formations
                      </Button>
                    </Link>
                  )}
                  <Link to="/dashboard" className="flex-1">
                    <Button className="w-full h-12 text-base bg-indigo-600 hover:bg-indigo-700 gap-2 shadow-md shadow-indigo-600/20">
                      <LayoutDashboard className="w-5 h-5" />
                      Mon espace
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PaymentSuccessPage;
