
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import DashboardLayout from '@/components/DashboardLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ShoppingBag, BookOpen, GraduationCap, Languages, Monitor, Code2,
  CreditCard, CheckCircle2, AlertCircle, Clock, Star, ArrowRight,
  PlayCircle, Lock, TrendingUp, Award, Zap, User, Bell, Gift, Globe,
} from 'lucide-react';

const FREE_COURSES_LIMIT = 3;

// ── Programme config ─────────────────────────────────────────────
const PROGRAMME_CFG = {
  langues:       { label: 'Langues',       icon: Languages, gradient: 'from-blue-600 to-sky-500',     bg: 'bg-blue-50 dark:bg-blue-950/20',    border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700',   ring: 'ring-blue-400'    },
  informatique:  { label: 'Informatique',  icon: Monitor,   gradient: 'from-green-600 to-emerald-500', bg: 'bg-green-50 dark:bg-green-950/20',  border: 'border-green-200', badge: 'bg-green-100 text-green-700', ring: 'ring-green-400'   },
  programmation: { label: 'Programmation', icon: Code2,     gradient: 'from-purple-600 to-indigo-500', bg: 'bg-purple-50 dark:bg-purple-950/20', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700', ring: 'ring-purple-400' },
};

const ORDER_STATUS = {
  completed:     { label: 'Payé',           cls: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  pending:       { label: 'En attente',     cls: 'bg-amber-100   text-amber-700   border-amber-300'   },
  cancelled:     { label: 'Annulé',         cls: 'bg-red-100     text-red-700     border-red-300'     },
};

const WEB_STATUS = {
  nouveau:       { label: 'Nouveau',        cls: 'bg-blue-100    text-blue-700    border-blue-200'    },
  en_discussion: { label: 'En discussion',  cls: 'bg-yellow-100  text-yellow-700  border-yellow-200'  },
  en_cours:      { label: 'En cours',       cls: 'bg-purple-100  text-purple-700  border-purple-200'  },
  'livré':       { label: 'Livré ✓',        cls: 'bg-green-100   text-green-700   border-green-200'   },
  'payé':        { label: 'Payé ✓',         cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  'annulé':      { label: 'Annulé',         cls: 'bg-red-100     text-red-700     border-red-200'     },
};

// ── Greeting based on time ────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
};

// ── Stat card ─────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color, loading }) => (
  <div className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color.bg}`}>
        <Icon className={`w-5 h-5 ${color.text}`} />
      </div>
    </div>
    {loading
      ? <Skeleton className="h-8 w-20 mb-1" />
      : <p className={`text-3xl font-black ${color.text}`}>{value}</p>
    }
    <p className="text-sm font-medium text-foreground mt-0.5">{label}</p>
    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
  </div>
);

// ── Main dashboard ────────────────────────────────────────────────
const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders]         = useState([]);
  const [webOrders, setWebOrders]   = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading]       = useState(true);

  const displayName = currentUser
    ? (`${currentUser.prenom || ''} ${currentUser.nom || currentUser.name || ''}`.trim() || currentUser.name || 'Étudiant')
    : 'Étudiant';

  const programme   = currentUser?.section;
  const progCfg     = programme ? PROGRAMME_CFG[programme] : null;
  const niveau      = currentUser?.Level;
  const currentCourse = currentUser?.current_course;

  useEffect(() => {
    if (!currentUser) return;
    const fetch = async () => {
      try {
        const [ordRes, webRes, enrRes] = await Promise.allSettled([
          pb.collection('orders').getFullList({
            filter: `user_id="${currentUser.id}"`, sort: '-created', requestKey: null,
          }),
          // PocketBase v0.36 bug : sort + filter → 400 sur web_orders → tri client-side
          pb.collection('web_orders').getList(1, 200, {
            filter: `client_id = "${currentUser.id}"`,
            fields: 'id,created,client_id,service_nom,tech_choice,statut,montant',
            requestKey: null,
          }).then(r => r.items.sort((a, b) => new Date(b.created) - new Date(a.created))),
          pb.collection('course_enrollments').getFullList({
            filter: `user_id="${currentUser.id}"`, expand: 'course_id', sort: '+created', requestKey: null,
          }),
        ]);
        if (ordRes.status === 'fulfilled') setOrders(ordRes.value);
        if (webRes.status === 'fulfilled') setWebOrders(webRes.value);
        if (enrRes.status === 'fulfilled') setEnrollments(enrRes.value);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetch();
  }, [currentUser]);

  const hasActivePayment = orders.some(o => o.status === 'completed' || o.status === 'paid');
  // Free tier: first FREE_COURSES_LIMIT courses are free regardless of pending orders
  const isFreeTier       = enrollments.length < FREE_COURSES_LIMIT && !hasActivePayment;
  const hasPendingOrder  = !isFreeTier && orders.some(o => o.status === 'pending');
  const totalPaid = orders
    .filter(o => o.status === 'completed' || o.status === 'paid')
    .reduce((s, o) => s + (o.total_price || 0), 0);
  const avgProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((s, e) => s + (e.progression || 0), 0) / enrollments.length)
    : 0;

  const ProgIcon = progCfg?.icon || GraduationCap;

  return (
    <DashboardLayout>
      <Helmet><title>Tableau de bord — IWS LAAYOUNE</title></Helmet>

      <div className="space-y-6 max-w-5xl mx-auto">

        {/* ── Pending payment alert ──────────────────────────── */}
        {!loading && hasPendingOrder && !hasActivePayment && (
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-amber-800 text-sm">Paiement en attente</p>
                <p className="text-amber-700 text-xs">
                  Votre inscription est enregistrée. Effectuez le paiement pour débloquer vos cours.
                  {orders.find(o => o.status === 'pending') && (
                    <span className="font-semibold ml-1">
                      Montant : {orders.find(o => o.status === 'pending').total_price} MAD
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Link to="/formation">
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shrink-0 gap-2">
                <CreditCard className="w-4 h-4" /> Payer maintenant
              </Button>
            </Link>
          </div>
        )}

        {/* ── Welcome header ─────────────────────────────────── */}
        <div className="relative rounded-2xl overflow-hidden">
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${progCfg?.gradient || 'from-slate-700 to-slate-900'} opacity-90`} />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)' }} />

          <div className="relative px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm text-white flex items-center justify-center font-black text-2xl shadow-lg flex-shrink-0 border-2 border-white/30">
              {displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1">
              <p className="text-white/70 text-sm font-medium mb-0.5">{getGreeting()},</p>
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">{displayName} 👋</h1>
              <div className="flex flex-wrap gap-2">
                {programme && progCfg && (
                  <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30">
                    <ProgIcon className="w-3.5 h-3.5" /> {progCfg.label}
                  </span>
                )}
                {niveau && (
                  <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30">
                    <Star className="w-3.5 h-3.5" /> Niveau {niveau}
                  </span>
                )}
                {hasActivePayment && (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/80 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Formation active
                  </span>
                )}
                {isFreeTier && !hasActivePayment && (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/80 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    <Gift className="w-3.5 h-3.5" /> {enrollments.length}/{FREE_COURSES_LIMIT} cours gratuits
                  </span>
                )}
                {hasPendingOrder && (
                  <span className="inline-flex items-center gap-1.5 bg-amber-400/80 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    <Clock className="w-3.5 h-3.5" /> En attente de paiement
                  </span>
                )}
              </div>
            </div>

            {/* Quick CTA */}
            <div className="shrink-0">
              {hasActivePayment || isFreeTier ? (
                <Link to="/dashboard/courses">
                  <Button className="bg-white text-slate-900 hover:bg-white/90 font-bold rounded-xl gap-2 shadow-lg">
                    <PlayCircle className="w-4 h-4" /> {isFreeTier && !hasActivePayment ? 'Accéder à mes cours' : 'Mes cours'}
                  </Button>
                </Link>
              ) : hasPendingOrder ? (
                <Link to="/formation">
                  <Button className="bg-white text-slate-900 hover:bg-white/90 font-bold rounded-xl gap-2 shadow-lg">
                    <CreditCard className="w-4 h-4" /> Payer ma formation
                  </Button>
                </Link>
              ) : (
                <Link to="/formation/inscription">
                  <Button className="bg-white text-slate-900 hover:bg-white/90 font-bold rounded-xl gap-2 shadow-lg">
                    <GraduationCap className="w-4 h-4" /> Choisir une formation
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={ShoppingBag}  label="Commandes"       value={loading ? '…' : orders.length + webOrders.length}  sub="Total"   color={{ bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600' }} loading={loading} />
          <StatCard icon={BookOpen}     label="Formations"      value={loading ? '…' : enrollments.length} sub="Inscriptions actives"            color={{ bg: 'bg-blue-100 dark:bg-blue-900/30',    text: 'text-blue-600'   }} loading={loading} />
          <StatCard icon={TrendingUp}   label="Progression"     value={loading ? '…' : `${avgProgress}%`} sub="Moyenne sur tous les cours"      color={{ bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600' }} loading={loading} />
          <StatCard icon={CreditCard}   label="Total payé"      value={loading ? '…' : `${totalPaid}`}    sub="MAD"                             color={{ bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600' }} loading={loading} />
        </div>

        {/* ── Main grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Formation card — left (3 cols) */}
          <div className="lg:col-span-3">
            <Card className={`overflow-hidden h-full border-2 ${progCfg?.border || 'border-border'}`}>
              {progCfg && <div className={`h-1.5 bg-gradient-to-r ${progCfg.gradient}`} />}
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" /> Ma Formation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {programme || currentCourse ? (
                  <>
                    {/* Programme info */}
                    <div className={`rounded-xl p-4 ${progCfg?.bg || 'bg-muted/50'} border ${progCfg?.border || 'border-border'}`}>
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <div>
                          {programme && progCfg && (
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full mb-2 ${progCfg.badge}`}>
                              <ProgIcon className="w-3 h-3" /> {progCfg.label}
                            </span>
                          )}
                          {currentCourse && (
                            <p className="font-bold text-foreground">{currentCourse}</p>
                          )}
                          {niveau && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Star className="w-3 h-3" /> Niveau {niveau}
                            </p>
                          )}
                        </div>

                        {hasActivePayment ? (
                          <Badge className="border-emerald-400 text-emerald-700 bg-emerald-50 gap-1" variant="outline">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </Badge>
                        ) : isFreeTier ? (
                          <Badge className="border-emerald-400 text-emerald-700 bg-emerald-50 gap-1" variant="outline">
                            <Gift className="w-3 h-3" /> {enrollments.length}/{FREE_COURSES_LIMIT} gratuits
                          </Badge>
                        ) : hasPendingOrder ? (
                          <Badge className="border-amber-400 text-amber-700 bg-amber-50 gap-1" variant="outline">
                            <Clock className="w-3 h-3" /> En attente
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    {/* Enrolled courses — ordered sequentially */}
                    {loading ? (
                      <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
                    ) : enrollments.length > 0 ? (
                      <div className="space-y-2">
                        {enrollments.slice(0, 3).map((e, idx) => {
                          const title    = e.expand?.course_id?.titre || e.expand?.course_id?.title || `Cours ${idx + 1}`;
                          const prog     = e.progression || 0;
                          const done     = e.complete || prog >= 100;
                          const locked   = !hasActivePayment && !isFreeTier;
                          // Premier cours non-terminé = cours actif à commencer
                          const prevDone = idx === 0 || (enrollments[idx - 1]?.complete || (enrollments[idx - 1]?.progression || 0) >= 100);
                          const isActive = !locked && prevDone && !done;
                          const isNext   = !locked && !prevDone && !done;
                          return (
                            <div key={e.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors
                              ${locked ? 'bg-muted/30 opacity-60' : done ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200' : isActive ? 'bg-primary/5 border-primary/30 shadow-sm' : 'bg-card hover:bg-muted/20'}`}>
                              {/* Numéro / état */}
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm
                                ${locked ? 'bg-slate-100 text-slate-400' : done ? 'bg-emerald-100 text-emerald-600' : isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                {locked ? <Lock className="w-4 h-4" /> : done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{title}</p>
                                {!locked && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <Progress value={prog} className="h-1.5 flex-1" />
                                    <span className="text-xs font-medium text-muted-foreground w-8 text-right">{prog}%</span>
                                  </div>
                                )}
                              </div>
                              {locked ? (
                                <span className="text-xs text-muted-foreground shrink-0">Verrouillé</span>
                              ) : done ? (
                                <span className="text-xs font-bold text-emerald-600 shrink-0">✓ Terminé</span>
                              ) : isActive ? (
                                <Link to={e.course_id ? `/dashboard/courses/${e.course_id}/view` : '/dashboard/courses/view'}>
                                  <Button size="sm" className="h-8 px-3 text-xs font-bold gap-1.5 bg-primary text-primary-foreground shadow-sm whitespace-nowrap">
                                    <PlayCircle className="w-3.5 h-3.5" /> Commencer
                                  </Button>
                                </Link>
                              ) : isNext ? (
                                <span className="text-xs text-muted-foreground shrink-0">Suivant →</span>
                              ) : (
                                <Link to={e.course_id ? `/dashboard/courses/${e.course_id}/view` : '/dashboard/courses/view'}>
                                  <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs font-bold gap-1">
                                    <PlayCircle className="w-3.5 h-3.5" /> Continuer
                                  </Button>
                                </Link>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">Aucun cours inscrit pour le moment.</p>
                    )}

                    {/* Free tier info banner */}
                    {isFreeTier && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2">
                        <Gift className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-emerald-700">
                          <span className="font-semibold">Période gratuite :</span> accédez à vos {FREE_COURSES_LIMIT} premiers cours gratuitement. Le paiement sera demandé après le {FREE_COURSES_LIMIT}e cours.
                        </p>
                      </div>
                    )}

                    {/* CTA */}
                    {hasPendingOrder && (
                      <Link to="/formation">
                        <Button className="w-full bg-accent hover:bg-accent/90 text-primary font-bold rounded-xl gap-2">
                          <CreditCard className="w-4 h-4" /> Payer ma formation
                        </Button>
                      </Link>
                    )}
                    {(hasActivePayment || isFreeTier) && (
                      <Link to="/dashboard/courses">
                        <Button variant="outline" className="w-full rounded-xl gap-2">
                          <PlayCircle className="w-4 h-4" /> {isFreeTier && !hasActivePayment ? 'Accéder à mes cours' : 'Voir tous mes cours'}
                        </Button>
                      </Link>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <GraduationCap className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="font-semibold text-foreground mb-1">Pas encore de formation choisie</p>
                    <p className="text-sm text-muted-foreground mb-4">Commencez par choisir votre programme</p>
                    <Link to="/formation/inscription">
                      <Button className="bg-accent hover:bg-accent/90 text-primary font-bold rounded-xl gap-2">
                        <Zap className="w-4 h-4" /> Choisir une formation
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right side — orders + shortcuts (2 cols) */}
          <div className="lg:col-span-2 space-y-5">

            {/* Recent orders */}
            <Card className="border border-border">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-primary" /> Mes Commandes
                </CardTitle>
                <Link to="/dashboard/orders">
                  <Button variant="ghost" size="sm" className="text-xs gap-1 h-7 text-muted-foreground hover:text-foreground">
                    Voir tout <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[1,2].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}
                  </div>
                ) : orders.length === 0 && webOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Aucune commande</p>
                ) : (
                  <div className="divide-y divide-border">
                    {/* Commandes formation */}
                    {orders.slice(0, 3).map(o => {
                      const st = ORDER_STATUS[o.status] || ORDER_STATUS.pending;
                      return (
                        <div key={`ord-${o.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <GraduationCap className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground">
                                {new Date(o.created).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                              </p>
                              <p className="text-xs text-muted-foreground">{o.total_price} MAD · Formation</p>
                            </div>
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${st.cls}`}>
                            {st.label}
                          </span>
                        </div>
                      );
                    })}
                    {/* Commandes web agency */}
                    {webOrders.slice(0, 4 - Math.min(orders.length, 3)).map(o => {
                      const st = WEB_STATUS[o.statut] || WEB_STATUS['nouveau'];
                      return (
                        <div key={`web-${o.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <Globe className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate max-w-[110px]">
                                {o.service_nom || 'Site web'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {o.montant > 0 ? `${o.montant.toLocaleString('fr-FR')} MAD · ` : ''}Web Agency
                              </p>
                            </div>
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${st.cls}`}>
                            {st.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick links */}
            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" /> Accès rapide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {[
                  { to: '/dashboard/profile',  icon: User,         label: 'Mon Profil',         sub: 'Modifier mes informations' },
                  { to: '/formation',          icon: BookOpen,     label: 'Catalogue',           sub: 'Toutes les formations IWS' },
                  { to: '/dashboard/courses',  icon: PlayCircle,   label: 'Mes Cours',           sub: 'Reprendre mon apprentissage' },
                ].map(item => (
                  <Link key={item.to} to={item.to}>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.sub}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
