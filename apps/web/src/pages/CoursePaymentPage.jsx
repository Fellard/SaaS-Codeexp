import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate, Link } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ChevronLeft, CreditCard, CheckCircle, Shield, Clock, BookOpen, AlertCircle } from 'lucide-react';

const LEVEL_COLORS = {
  A1:'bg-green-100 text-green-700', A2:'bg-lime-100 text-lime-700',
  B1:'bg-yellow-100 text-yellow-700', B2:'bg-orange-100 text-orange-700',
  C1:'bg-red-100 text-red-700', C2:'bg-purple-100 text-purple-700',
};

export default function CoursePaymentPage() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [step, setStep] = useState('summary'); // summary | payment | success
  const [paymentMethod, setPaymentMethod] = useState('manual');

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const c = await pb.collection('courses').getOne(id, { requestKey: null });
      setCourse(c);
      // Vérifier si déjà inscrit
      try {
        await pb.collection('course_enrollments').getFirstListItem(
          `user_id = "${currentUser.id}" && course_id = "${id}"`,
          { requestKey: null }
        );
        // Déjà inscrit → rediriger vers le cours
        navigate(`/courses/${id}`);
        return;
      } catch {}
    } catch {
      toast.error('Cours introuvable');
      navigate('/formation');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    // Stocker le courseId pour que PaymentSuccessPage puisse créer l'enrollment si redirection externe
    sessionStorage.setItem('pending_course_enrollment', id);
    setPaying(true);
    try {
      // 1. Créer l'enrollment
      await pb.collection('course_enrollments').create({
        user_id: currentUser.id,
        course_id: id,
        status: 'active',
        progression: 0,
        complete: false,
        start_date: new Date().toISOString(),
        payments_history: JSON.stringify([
          `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`
        ]),
      }, { requestKey: null });

      // 2. Créer le paiement
      await pb.collection('payments').create({
        user_id: currentUser.id,
        course_id: id,
        amount: course.price,
        status: 'paid',
        method: paymentMethod,
        month: `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`,
      }, { requestKey: null }).catch(() => {}); // silently fail if collection doesn't exist yet

      sessionStorage.removeItem('pending_course_enrollment'); // Nettoyage : enrollment déjà créé ici
      setStep('success');
      toast.success('Paiement confirmé ! Accès activé 🎓');
    } catch (err) {
      toast.error('Erreur : ' + err.message);
    } finally {
      setPaying(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </main>
    </div>
  );

  if (!course) return null;

  return (
    <>
      <Helmet><title>Paiement — {course.title}</title></Helmet>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 py-10">
          <div className="max-w-3xl mx-auto px-4">

            {step !== 'success' && (
              <Link to={`/courses/${id}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Retour au cours
              </Link>
            )}

            {/* Success */}
            {step === 'success' && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-3">Inscription confirmée !</h1>
                <p className="text-slate-500 mb-2">Vous avez maintenant accès à :</p>
                <p className="text-xl font-semibold text-indigo-700 mb-8">{course.title}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                    onClick={() => navigate(`/courses/${id}`)}>
                    <BookOpen className="w-4 h-4" /> Commencer la formation
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/dashboard/courses')}>
                    Mes formations
                  </Button>
                </div>
              </div>
            )}

            {/* Summary + Payment */}
            {step !== 'success' && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

                {/* Formulaire paiement */}
                <div className="md:col-span-3 space-y-5">
                  <h1 className="text-2xl font-bold text-slate-900">Finaliser l'inscription</h1>

                  {/* Méthode paiement */}
                  <Card className="bg-white border border-slate-100 rounded-2xl">
                    <CardContent className="p-5 space-y-4">
                      <p className="font-semibold text-slate-800 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-indigo-600" /> Méthode de paiement
                      </p>
                      <div className="space-y-2">
                        {[
                          { key: 'manual', label: 'Paiement en agence IWS', desc: 'Payez en espèces ou virement à nos locaux' },
                          { key: 'cmi', label: 'Carte bancaire (CMI)', desc: 'Paiement sécurisé par carte Maroc/Visa/MC' },
                          { key: 'cash_plus', label: 'Cash Plus / Wafacash', desc: 'Transfert via réseau Cash Plus' },
                        ].map(m => (
                          <label key={m.key}
                            className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                              paymentMethod === m.key ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'
                            }`}>
                            <input type="radio" name="method" value={m.key} checked={paymentMethod === m.key}
                              onChange={() => setPaymentMethod(m.key)} className="mt-0.5 accent-indigo-600" />
                            <div>
                              <p className="font-medium text-slate-800 text-sm">{m.label}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>

                      {paymentMethod === 'manual' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 flex gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold mb-1">Paiement en agence</p>
                            <p>Cliquez sur "Confirmer" pour réserver votre place. Votre accès sera activé dès réception du paiement par notre équipe.</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Infos étudiant */}
                  <Card className="bg-white border border-slate-100 rounded-2xl">
                    <CardContent className="p-5 space-y-3">
                      <p className="font-semibold text-slate-800">Informations étudiant</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Nom complet</Label>
                          <Input value={currentUser?.name || ''} disabled className="bg-slate-50 mt-1" />
                        </div>
                        <div>
                          <Label className="text-xs">Email</Label>
                          <Input value={currentUser?.email || ''} disabled className="bg-slate-50 mt-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-base font-semibold gap-2"
                    onClick={handleConfirmPayment} disabled={paying}>
                    {paying ? (
                      <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Traitement...</>
                    ) : (
                      <><CheckCircle className="w-5 h-5" /> Confirmer l'inscription — {course.price} MAD</>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <Shield className="w-3.5 h-3.5" /> Inscription sécurisée — Accès immédiat après confirmation
                  </div>
                </div>

                {/* Résumé commande */}
                <div className="md:col-span-2">
                  <Card className="bg-white border border-slate-100 rounded-2xl sticky top-6">
                    <CardContent className="p-5 space-y-4">
                      <p className="font-semibold text-slate-800 text-sm uppercase tracking-wide">Récapitulatif</p>
                      <div className="space-y-2">
                        <div className="flex gap-2 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${LEVEL_COLORS[course.level] || 'bg-gray-100'}`}>{course.level}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 capitalize">{course.category}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 leading-tight">{course.title}</h3>
                        {course.description && <p className="text-xs text-slate-500 line-clamp-2">{course.description}</p>}
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Clock className="w-3.5 h-3.5" />{course.duration} minutes
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <BookOpen className="w-3.5 h-3.5" />Contenu complet + exercices
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <CheckCircle className="w-3.5 h-3.5" />Accès illimité
                        </div>
                      </div>
                      <div className="border-t border-slate-100 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 text-sm">Sous-total</span>
                          <span className="font-semibold">{course.price} MAD</span>
                        </div>
                        <div className="flex justify-between items-center mt-2 text-lg font-bold">
                          <span>Total</span>
                          <span className="text-indigo-700">{course.price} MAD</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">/ mois, renouvelable</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

              </div>
            )}

          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
