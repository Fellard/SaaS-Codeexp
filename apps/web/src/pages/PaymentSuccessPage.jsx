import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShoppingBag, LayoutDashboard, BookOpen } from 'lucide-react';
import { useCart } from '@/hooks/useCart.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';

const PaymentSuccessPage = () => {
  const { clearCart } = useCart();
  const { currentUser } = useAuth();
  const [enrolledCourse, setEnrolledCourse] = useState(null);

  useEffect(() => {
    clearCart();
    autoEnrollFromPendingCourse();
  }, [clearCart]);

  // Crée un enrollment si l'utilisateur venait de payer un cours (courseId stocké avant redirection)
  const autoEnrollFromPendingCourse = async () => {
    const pendingCourseId = sessionStorage.getItem('pending_course_enrollment');
    if (!pendingCourseId || !currentUser) return;
    sessionStorage.removeItem('pending_course_enrollment');
    try {
      // Vérifier si pas déjà inscrit
      try {
        await pb.collection('course_enrollments').getFirstListItem(
          `user_id="${currentUser.id}" && course_id="${pendingCourseId}"`,
          { requestKey: null }
        );
        return; // Déjà inscrit, rien à faire
      } catch { /* pas encore inscrit → on crée */ }

      await pb.collection('course_enrollments').create({
        user_id:    currentUser.id,
        course_id:  pendingCourseId,
        status:     'active',
        progression: 0,
        complete:   false,
        start_date: new Date().toISOString(),
      }, { requestKey: null });

      // Récupérer le titre du cours pour l'affichage
      const course = await pb.collection('courses').getOne(pendingCourseId, { requestKey: null });
      setEnrolledCourse(course);
    } catch (err) {
      console.error('Erreur auto-enrollment:', err);
    }
  };

  return (
    <>
      <Helmet>
        <title>Payment Successful - IWS Smart Platform</title>
        <meta name="description" content="Your payment was successful. Thank you for your purchase!" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        
        <main className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="max-w-lg w-full">
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center relative overflow-hidden">
              {/* Decorative background */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-green-50 to-transparent pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4" style={{ letterSpacing: '-0.01em' }}>
                  Payment Successful!
                </h1>
                
                <p className="text-slate-600 mb-8 leading-relaxed">
                  Thank you for your purchase. Your order has been confirmed and is currently being processed. You will receive an email confirmation with your receipt shortly.
                </p>

                {/* Cours inscrit automatiquement */}
                {enrolledCourse && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6 text-left">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-emerald-800 text-sm">Inscription activée automatiquement</p>
                        <p className="text-emerald-700 font-bold mt-0.5">
                          {enrolledCourse.titre || enrolledCourse.title_fr || enrolledCourse.title || 'Votre cours'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left border border-slate-100">
                  <h3 className="font-semibold text-slate-900 mb-2">What happens next?</h3>
                  <ul className="text-sm text-slate-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0"></div>
                      Digital products are available immediately in your dashboard.
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0"></div>
                      Physical items will be shipped within 1-2 business days.
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
                        Continue Shopping
                      </Button>
                    </Link>
                  )}
                  <Link to="/dashboard" className="flex-1">
                    <Button className="w-full h-12 text-base bg-indigo-600 hover:bg-indigo-700 gap-2 shadow-md shadow-indigo-600/20">
                      <LayoutDashboard className="w-5 h-5" />
                      View Dashboard
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