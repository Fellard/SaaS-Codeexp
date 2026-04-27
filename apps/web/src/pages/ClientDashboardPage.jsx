import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import DashboardLayout from '@/components/DashboardLayout.jsx';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  ShoppingBag, Globe, Package, ArrowRight, Clock, CheckCircle2,
  Star, Music2, GraduationCap, BookOpen, PlayCircle, ChevronRight,
  TrendingUp, Calendar, Layers, Sparkles, ExternalLink,
} from 'lucide-react';

// ── Statuts commandes magasin ─────────────────────────────────────
const ORDER_STATUS = {
  completed: { label: 'Payé ✓',     cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  pending:   { label: 'En attente', cls: 'bg-amber-100   text-amber-700   border-amber-200'   },
  cancelled: { label: 'Annulé',     cls: 'bg-red-100     text-red-700     border-red-200'     },
};

// ── Statuts projets web ───────────────────────────────────────────
const WEB_STATUS = {
  nouveau:       { label: 'Nouveau',       cls: 'bg-blue-100   text-blue-700   border-blue-200'   },
  en_discussion: { label: 'En discussion', cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  en_cours:      { label: 'En cours',      cls: 'bg-purple-100 text-purple-700 border-purple-200' },
  'livré':       { label: 'Livré ✓',       cls: 'bg-green-100  text-green-700  border-green-200'  },
  'payé':        { label: 'Payé ✓',        cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  'annulé':      { label: 'Annulé',        cls: 'bg-red-100    text-red-700    border-red-200'    },
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
};

const fmt = (iso) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

const fmtShort = (iso) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

// ── Composant stat card ───────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color, loading }) => (
  <div className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color.bg}`}>
      <Icon className={`w-5 h-5 ${color.text}`} />
    </div>
    {loading
      ? <Skeleton className="h-8 w-20 mb-1" />
      : <p className={`text-2xl font-black ${color.text}`}>{value}</p>
    }
    <p className="text-sm font-semibold text-foreground mt-0.5">{label}</p>
    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
  </div>
);

// ── Ligne d'activité unifiée ──────────────────────────────────────
const ActivityRow = ({ icon: Icon, iconBg, iconColor, title, sub, badge, badgeCls, link }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 transition-colors group">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      <Icon className={`w-4 h-4 ${iconColor}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-foreground truncate">{title}</p>
      <p className="text-xs text-muted-foreground truncate">{sub}</p>
    </div>
    {badge && (
      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border flex-shrink-0 ${badgeCls}`}>
        {badge}
      </span>
    )}
    {link && (
      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0" />
    )}
  </div>
);

// ── Carte de cours inscrit (pour la section formations) ───────────
const EnrolledCourseCard = ({ enrollment, course, navigate }) => {
  if (!course) return null;
  const prog = enrollment.progression || 0;
  const done = prog >= 100;
  const title = course.titre || course.title || 'Cours';
  const lastPage = (() => {
    try { const p = parseInt(localStorage.getItem(`lastPage_${course.id}`), 10); return isNaN(p) ? 0 : p; }
    catch { return 0; }
  })();
  const viewerHref = `/dashboard/courses/${course.id}/view${prog > 0 && lastPage > 0 ? `?page=${lastPage}` : ''}`;

  return (
    <div className="flex items-center gap-4 p-4 bg-muted/40 border border-border rounded-2xl hover:border-primary/30 hover:shadow-sm transition-all">
      {/* Miniature niveau */}
      <div className="w-12 h-12 rounded-xl bg-[#00274D] flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow-sm">
        {course.niveau || course.level || '—'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground truncate">{title}</p>
        {course.cours_nom && (
          <p className="text-xs text-muted-foreground truncate">{course.cours_nom}</p>
        )}
        {/* Barre de progression */}
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${done ? 'bg-emerald-500' : 'bg-[#00274D]'}`}
              style={{ width: `${prog}%` }}
            />
          </div>
          <span className={`text-xs font-bold flex-shrink-0 ${done ? 'text-emerald-600' : 'text-[#00274D]'}`}>
            {prog}%
          </span>
        </div>
      </div>
      <Link to={viewerHref}>
        <button className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-colors flex-shrink-0 ${
          done
            ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
            : 'bg-[#00274D] hover:bg-[#003a70] text-white'
        }`}>
          {done
            ? <><CheckCircle2 className="w-3.5 h-3.5" /> Réviser</>
            : <><PlayCircle className="w-3.5 h-3.5" /> {prog > 0 ? 'Continuer' : 'Commencer'}</>
          }
        </button>
      </Link>
    </div>
  );
};

// ── Page principale ───────────────────────────────────────────────
const ClientDashboardPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [orders,      setOrders]      = useState([]);
  const [webOrders,   setWebOrders]   = useState([]);
  const [enrollments, setEnrollments] = useState([]);  // inscriptions aux cours
  const [courseMap,   setCourseMap]   = useState({});  // { course_id: course }
  const [loading,     setLoading]     = useState(true);

  const displayName = currentUser
    ? (`${currentUser.prenom || ''} ${currentUser.nom || currentUser.name || ''}`.trim() || currentUser.name || 'Client')
    : 'Client';

  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'CL';

  const memberSince = currentUser?.created
    ? new Date(currentUser.created).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : null;

  useEffect(() => {
    if (!currentUser?.id) return;
    const uid = currentUser.id;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [ord, web, enr] = await Promise.allSettled([
          pb.collection('orders').getFullList({ filter: `user_id="${uid}"`, sort: '-created', requestKey: null }),
          pb.collection('web_orders').getFullList({ filter: `user_id="${uid}"`, sort: '-created', requestKey: null }),
          pb.collection('course_enrollments').getFullList({ filter: `user_id="${uid}"`, sort: '-created', requestKey: null }),
        ]);

        const ordersVal     = ord.status === 'fulfilled' ? ord.value : [];
        const webOrdersVal  = web.status === 'fulfilled' ? web.value : [];
        const enrVal        = enr.status === 'fulfilled' ? enr.value : [];

        setOrders(ordersVal);
        setWebOrders(webOrdersVal);
        setEnrollments(enrVal);

        // Charger les détails des cours inscrits
        if (enrVal.length > 0) {
          const courseIds = [...new Set(enrVal.map(e => e.course_id).filter(Boolean))];
          const courseDetails = await Promise.allSettled(
            courseIds.map(cid =>
              pb.collection('courses').getOne(cid, { fields: 'id,titre,title,niveau,level,cours_nom,course_type', requestKey: null })
            )
          );
          const map = {};
          courseDetails.forEach(res => {
            if (res.status === 'fulfilled') map[res.value.id] = res.value;
          });
          setCourseMap(map);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [currentUser?.id]);

  // ── Stats calculées ───────────────────────────────────────────
  const completedOrders  = orders.filter(o => o.status === 'completed').length;
  const pendingOrders    = orders.filter(o => o.status === 'pending').length;
  const totalSpent       = orders
    .filter(o => o.status === 'completed')
    .reduce((s, o) => s + (parseFloat(o.total_amount) || 0), 0);
  const activeWebProjects = webOrders.filter(o => ['en_cours', 'en_discussion', 'nouveau'].includes(o.status)).length;

  // ── Activité récente unifiée (dernières 5 actions, toutes sources) ──
  const allActivity = [
    ...orders.slice(0, 4).map(o => ({
      key: `ord-${o.id}`,
      icon: Package,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      title: `Commande #${o.id.slice(-6).toUpperCase()}`,
      sub: `${fmtShort(o.created)} · ${parseFloat(o.total_amount || 0).toFixed(0)} MAD`,
      badge: (ORDER_STATUS[o.status] || ORDER_STATUS.pending).label,
      badgeCls: (ORDER_STATUS[o.status] || ORDER_STATUS.pending).cls,
      date: new Date(o.created),
    })),
    ...webOrders.slice(0, 3).map(o => ({
      key: `web-${o.id}`,
      icon: Globe,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      title: o.project_name || o.service_type || 'Projet Web',
      sub: fmtShort(o.created),
      badge: (WEB_STATUS[o.status] || WEB_STATUS.nouveau).label,
      badgeCls: (WEB_STATUS[o.status] || WEB_STATUS.nouveau).cls,
      date: new Date(o.created),
    })),
  ].sort((a, b) => b.date - a.date).slice(0, 5);

  return (
    <>
      <Helmet><title>Espace Client — IWS LAAYOUNE</title></Helmet>
      <DashboardLayout>

        {/* ── Carte héro ─────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-[#00274D] via-[#003a70] to-[#004d96] rounded-3xl p-6 sm:p-8 mb-8 overflow-hidden shadow-lg">
          {/* Décoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />
          {/* Bande accent */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-white font-black text-xl shadow-lg flex-shrink-0">
                {initials}
              </div>
              <div>
                <p className="text-white/60 text-sm font-medium">{getGreeting()},</p>
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {displayName} 👋
                </h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-xs font-bold text-amber-300">
                    <Star className="w-3 h-3" /> Client IWS
                  </span>
                  {memberSince && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 rounded-full text-xs text-white/70">
                      <Calendar className="w-3 h-3" /> Membre depuis {memberSince}
                    </span>
                  )}
                  {enrollments.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-xs font-bold text-emerald-300">
                      <GraduationCap className="w-3 h-3" /> Formation active
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link to="/client/dashboard/orders">
                <button className="flex items-center gap-2 bg-white text-[#00274D] font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-white/90 transition-colors shadow-md">
                  <ShoppingBag className="w-4 h-4" /> Mes commandes
                </button>
              </Link>
              {enrollments.length > 0 && (
                <Link to="/dashboard/courses">
                  <button className="flex items-center gap-2 bg-amber-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-amber-400 transition-colors shadow-md">
                    <BookOpen className="w-4 h-4" /> Mes formations
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={ShoppingBag} label="Commandes" value={loading ? '—' : orders.length}
            sub={`dont ${pendingOrders} en attente`}
            color={{ bg: 'bg-blue-50', text: 'text-blue-600' }} loading={loading}
          />
          <StatCard
            icon={CheckCircle2} label="Payées" value={loading ? '—' : completedOrders}
            sub="commandes complétées"
            color={{ bg: 'bg-emerald-50', text: 'text-emerald-600' }} loading={loading}
          />
          <StatCard
            icon={TrendingUp} label="Total dépensé" value={loading ? '—' : `${totalSpent.toFixed(0)} MAD`}
            sub="achats confirmés"
            color={{ bg: 'bg-purple-50', text: 'text-purple-600' }} loading={loading}
          />
          <StatCard
            icon={Globe} label="Projets Web" value={loading ? '—' : activeWebProjects}
            sub={activeWebProjects === 0 ? 'aucun projet actif' : 'projets en cours'}
            color={{ bg: 'bg-amber-50', text: 'text-amber-600' }} loading={loading}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">

          {/* ── Activité récente ────────────────────────────────── */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" /> Activité récente
              </h2>
              <Link to="/client/dashboard/orders">
                <button className="text-xs text-muted-foreground hover:text-primary font-semibold flex items-center gap-1 transition-colors">
                  Tout voir <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
            <div className="p-3">
              {loading ? (
                <div className="space-y-2 p-2">
                  {[1,2,3,4].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}
                </div>
              ) : allActivity.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">Aucune activité pour l'instant</p>
                  <p className="text-xs mt-1">Vos commandes et projets apparaîtront ici</p>
                </div>
              ) : (
                allActivity.map(a => (
                  <ActivityRow key={a.key} {...a} />
                ))
              )}
            </div>
          </div>

          {/* ── Accès rapide ─────────────────────────────────────── */}
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Services IWS
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {[
                {
                  to: '/store', icon: ShoppingBag,
                  label: 'Magasin',
                  desc: 'Instruments & accessoires',
                  bg: 'bg-blue-50', color: 'text-blue-600', border: 'border-blue-100',
                },
                {
                  to: '/studio', icon: Music2,
                  label: 'Studio d\'enregistrement',
                  desc: 'Réserver une session',
                  bg: 'bg-purple-50', color: 'text-purple-600', border: 'border-purple-100',
                },
                {
                  to: '/agence', icon: Globe,
                  label: 'Web Agency',
                  desc: 'Votre présence en ligne',
                  bg: 'bg-amber-50', color: 'text-amber-600', border: 'border-amber-100',
                },
                {
                  to: '/formation', icon: GraduationCap,
                  label: 'Catalogue formations',
                  desc: 'Langues, informatique, code',
                  bg: 'bg-emerald-50', color: 'text-emerald-600', border: 'border-emerald-100',
                },
              ].map(s => (
                <Link key={s.to} to={s.to} className="block group">
                  <div className={`flex items-center gap-3 p-3 rounded-xl border ${s.border} ${s.bg} hover:shadow-sm transition-all`}>
                    <div className={`w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <s.icon className={`w-4 h-4 ${s.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${s.color}`}>{s.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.desc}</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Section formations (conditionnelle) ────────────────── */}
        {!loading && (
          enrollments.length > 0 ? (
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden mb-6">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div>
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#00274D]" /> Mes formations
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {enrollments.length} cours inscrit{enrollments.length > 1 ? 's' : ''} ·{' '}
                    {enrollments.filter(e => (e.progression || 0) >= 100).length} terminé{enrollments.filter(e => (e.progression || 0) >= 100).length > 1 ? 's' : ''}
                  </p>
                </div>
                <Link to="/dashboard/courses">
                  <button className="text-xs text-muted-foreground hover:text-primary font-semibold flex items-center gap-1 transition-colors">
                    Voir tout <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
              <div className="p-4 space-y-3">
                {enrollments.slice(0, 4).map(enr => (
                  <EnrolledCourseCard
                    key={enr.id}
                    enrollment={enr}
                    course={courseMap[enr.course_id]}
                    navigate={navigate}
                  />
                ))}
                {enrollments.length > 4 && (
                  <Link to="/dashboard/courses">
                    <button className="w-full text-sm font-semibold text-[#00274D] hover:text-[#003a70] py-2.5 border border-dashed border-[#00274D]/30 rounded-xl hover:bg-[#00274D]/5 transition-colors">
                      Voir les {enrollments.length - 4} autres formations →
                    </button>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            /* CTA catalogue si aucune inscription */
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 border border-blue-100 rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#00274D] flex items-center justify-center flex-shrink-0 shadow-md">
                  <GraduationCap className="w-7 h-7 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">Découvrez nos formations</h3>
                  <p className="text-sm text-muted-foreground mt-0.5 max-w-xs">
                    Langues, informatique, programmation — les 3 premiers cours sont gratuits.
                  </p>
                </div>
              </div>
              <Link to="/formation">
                <button className="flex items-center gap-2 bg-[#00274D] hover:bg-[#003a70] text-white font-bold px-5 py-3 rounded-xl transition-colors shadow-md flex-shrink-0 text-sm">
                  <BookOpen className="w-4 h-4" /> Explorer le catalogue
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          )
        )}

      </DashboardLayout>
    </>
  );
};

export default ClientDashboardPage;
