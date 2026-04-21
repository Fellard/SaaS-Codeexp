
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  ShoppingCart, Users, BookOpen, TrendingUp, Activity,
  GraduationCap, DollarSign, Gift, CheckCircle2, Eye,
  AlertCircle, RefreshCw, Clock, Music2, Laptop2,
  Mic2, Package, Calendar, ArrowRight, Store, Layers,
  ShoppingBag, BarChart3, Globe, Monitor, Code2, Wrench,
  Import, FileText, Wallet,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import pb from '@/lib/pocketbaseClient';
import { useTranslation } from '@/i18n/useTranslation.js';
import AdminLayout from '@/components/AdminLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

const FREE_COURSES_LIMIT = 5;

// ── Mini stat card ───────────────────────────────────────────────
const StatCard = ({ title, value, sub, icon: Icon, colorClass, bgClass, loading }) => (
  <div className="admin-stat-card group">
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2.5 rounded-xl ${bgClass} transition-transform group-hover:scale-110`}>
        <Icon className={`w-5 h-5 ${colorClass}`} />
      </div>
    </div>
    <p className="text-muted-foreground text-sm font-medium">{title}</p>
    {loading
      ? <Skeleton className="h-8 w-20 mt-1" />
      : <p className={`text-3xl font-bold mt-0.5 ${colorClass}`}>{value}</p>
    }
    {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
  </div>
);

// ── Section header ───────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, subtitle, color, linkTo, linkLabel }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      <div className={`p-2.5 rounded-xl ${color.bg}`}>
        <Icon className={`w-5 h-5 ${color.text}`} />
      </div>
      <div>
        <h3 className={`font-bold text-base ${color.text}`}>{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
    {linkTo && (
      <Link to={linkTo}>
        <Button variant="ghost" size="sm" className={`text-xs gap-1 ${color.text}`}>
          {linkLabel || 'Gérer'} <ArrowRight className="w-3 h-3" />
        </Button>
      </Link>
    )}
  </div>
);

// ── Activity row (formation) ─────────────────────────────────────
const ActivityRow = ({ name, course, progress, status, date }) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0">
      {name?.charAt(0).toUpperCase() || '?'}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-foreground truncate">{name}</p>
      <p className="text-xs text-muted-foreground truncate">{course}</p>
    </div>
    <div className="text-right shrink-0">
      <div className="flex items-center gap-1.5 justify-end mb-0.5">
        <Progress value={progress} className={`h-1 w-16 ${progress >= 70 ? '[&>div]:bg-emerald-500' : progress >= 30 ? '[&>div]:bg-blue-500' : '[&>div]:bg-orange-400'}`} />
        <span className={`text-xs font-bold ${progress >= 70 ? 'text-emerald-600' : progress >= 30 ? 'text-blue-600' : 'text-orange-500'}`}>
          {progress}%
        </span>
      </div>
      <div className="flex items-center gap-1.5 justify-end">
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
          status === 'gratuit' ? 'bg-emerald-100 text-emerald-700' :
          status === 'actif'   ? 'bg-blue-100 text-blue-700' :
          status === 'termine' ? 'bg-green-100 text-green-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {status === 'gratuit' ? '🎁 Gratuit' : status === 'actif' ? '▶ En cours' : status === 'termine' ? '✓ Terminé' : '⏳ En attente'}
        </span>
        {date && <span className="text-[10px] text-muted-foreground">{date}</span>}
      </div>
    </div>
  </div>
);

// ── Store KPI card ───────────────────────────────────────────────
const StoreCard = ({ store, stats, loading }) => {
  const [logoFailed, setLogoFailed] = useState(false);
  return (
    <Card className="overflow-hidden border hover:shadow-lg transition-all duration-300">
      <div className={`h-1.5 bg-gradient-to-r ${store.gradient}`} />
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-3 mb-4">
          {store.logo && !logoFailed ? (
            <img src={store.logo} alt={store.name}
              className="w-10 h-10 rounded-xl object-contain border border-border bg-white p-1"
              onError={() => setLogoFailed(true)} />
          ) : (
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${store.gradient}`}>
              <store.icon className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <p className="font-bold text-sm text-foreground">{store.name}</p>
            <p className="text-xs text-muted-foreground">{store.subtitle}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Produits', value: loading ? '—' : stats.products },
            { label: 'Commandes', value: loading ? '—' : stats.orders },
            { label: 'Revenus', value: loading ? '—' : `${(stats.revenue || 0).toLocaleString('fr-FR')} MAD` },
          ].map(({ label, value }) => (
            <div key={label} className={`p-2 rounded-lg ${store.bg} text-center`}>
              {loading
                ? <Skeleton className="h-5 w-10 mx-auto mb-1" />
                : <p className={`font-bold text-sm ${store.color}`}>{value}</p>
              }
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        <Link to={`/admin/magasin/${store.key}`} className="block mt-3">
          <Button variant="outline" size="sm" className={`w-full text-xs border ${store.border} ${store.color} hover:${store.bg}`}>
            Gérer {store.name} <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

// ── Main dashboard ───────────────────────────────────────────────
const AdminDashboard = () => {
  const { t } = useTranslation();
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── Formation stats ──────────────────────────────────────────
  const [stats, setStats] = useState({
    totalStudents: 0, activeStudents: 0, freeTierStudents: 0,
    paidStudents: 0, totalCourses: 0, totalEnrollments: 0,
    avgProgress: 0, completionRate: 0, totalRevenue: 0, pendingPayments: 0,
  });
  const [recentActivity,      setRecentActivity]      = useState([]);
  const [progressDistrib,     setProgressDistrib]     = useState([]);
  const [weeklyRegistrations, setWeeklyRegistrations] = useState([]);

  // ── Magasin stats ────────────────────────────────────────────
  const [shopStats, setShopStats] = useState({
    laayounemusik: { products: 0, orders: 0, revenue: 0 },
    iwstech:       { products: 0, orders: 0, revenue: 0 },
    recentOrders:  [],
    totalProducts: 0,
    totalOrders:   0,
    totalRevenue:  0,
  });

  // ── Studio stats ─────────────────────────────────────────────
  const [studioStats, setStudioStats] = useState({
    reservationsTotal: 0, reservationsThisWeek: 0,
    servicesCount: 0, revenue: 0,
  });

  // ── Web Agency stats ─────────────────────────────────────────
  const [agenceStats, setAgenceStats] = useState({
    totalCommandes: 0, nouvelles: 0, enCours: 0, livrees: 0,
    caEncaisse: 0, pipeline: 0, servicesActifs: 0,
    recentOrders: [],
  });

  const fetchAll = async () => {
    try {
      const token = pb.authStore.token;

      // ── Formation ─────────────────────────────────────────
      const [apiRes, coursesRes] = await Promise.allSettled([
        fetch('http://localhost:3001/admin/all-students', {
          headers: { 'Authorization': `Bearer ${token}` },
        }).then(r => r.ok ? r.json() : null),
        pb.collection('courses').getList(1, 1, { requestKey: null }),
      ]);

      const apiData     = apiRes.status === 'fulfilled' && apiRes.value ? apiRes.value : {};
      const coursesData = coursesRes.status === 'fulfilled' ? coursesRes.value : null;
      const students    = apiData.students    || [];
      const enrollments = apiData.enrollments || [];
      const orders      = apiData.orders      || [];

      const studentMap = {};
      students.forEach(s => { studentMap[s.id] = { ...s, enrs: [], orders: [] }; });
      enrollments.forEach(e => { if (studentMap[e.user_id]) studentMap[e.user_id].enrs.push(e); });
      orders.forEach(o => { if (studentMap[o.user_id]) studentMap[o.user_id].orders.push(o); });

      let activeCount = 0, freeTierCount = 0, paidCount = 0, totalProg = 0;
      const activity = [];

      Object.values(studentMap).forEach(s => {
        const enrCount = s.enrs.length;
        const hasPaid  = s.orders.some(o => o.status === 'paid' || o.status === 'completed');
        const avgProg  = enrCount > 0 ? Math.round(s.enrs.reduce((sum, e) => sum + (e.progression || 0), 0) / enrCount) : 0;
        if (enrCount > 0) activeCount++;
        if (!hasPaid && enrCount <= FREE_COURSES_LIMIT && enrCount > 0) freeTierCount++;
        if (hasPaid) paidCount++;
        if (enrCount > 0) totalProg += avgProg;
        if (enrCount > 0) {
          const bestEnr  = s.enrs.reduce((a, b) => (b.progression || 0) > (a.progression || 0) ? b : a, s.enrs[0]);
          const lastDate = s.enrs.map(e => e.last_activity || e.updated || '').filter(Boolean).sort().pop();
          const fullName = `${s.prenom || ''} ${s.nom || s.name || ''}`.trim() || s.email;
          const status   = (bestEnr.progression || 0) >= 100 ? 'termine'
            : (bestEnr.progression || 0) > 0 ? 'actif'
            : hasPaid ? 'inscrit' : 'gratuit';
          activity.push({
            id: s.id, name: fullName, course: s.current_course || 'Formation',
            progress: avgProg, status,
            date: lastDate ? new Date(lastDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : null,
          });
        }
      });

      activity.sort((a, b) => (b.progress || 0) - (a.progress || 0));
      const totalEnr       = enrollments.length;
      const avgProgress    = activeCount > 0 ? Math.round(totalProg / activeCount) : 0;
      const completionRate = totalEnr > 0 ? Math.round((enrollments.filter(e => e.complete || (e.progression || 0) >= 100).length / totalEnr) * 100) : 0;
      const totalRevenue   = orders.filter(o => o.status === 'paid' || o.status === 'completed').reduce((s, o) => s + (o.total_price || 0), 0);
      const pendingPayments = orders.filter(o => o.status === 'pending').length;

      const dist = [
        { label: '0%', count: 0, color: '#e2e8f0' },
        { label: '1–25%', count: 0, color: '#fbbf24' },
        { label: '26–50%', count: 0, color: '#60a5fa' },
        { label: '51–75%', count: 0, color: '#818cf8' },
        { label: '76–99%', count: 0, color: '#34d399' },
        { label: '100%', count: 0, color: '#10b981' },
      ];
      enrollments.forEach(e => {
        const p = e.progression || 0;
        if (p === 0) dist[0].count++;
        else if (p <= 25) dist[1].count++;
        else if (p <= 50) dist[2].count++;
        else if (p <= 75) dist[3].count++;
        else if (p < 100) dist[4].count++;
        else dist[5].count++;
      });

      const weekMap = {};
      students.forEach(s => {
        const d = new Date(s.created);
        const week = `S${Math.ceil((d.getDate()) / 7)} ${d.toLocaleString('fr-FR', { month: 'short' })}`;
        weekMap[week] = (weekMap[week] || 0) + 1;
      });
      const weeklyData = Object.entries(weekMap).slice(-8).map(([name, users]) => ({ name, users }));

      setStats({
        totalStudents: students.length, activeStudents: activeCount,
        freeTierStudents: freeTierCount, paidStudents: paidCount,
        totalCourses: coursesData?.totalItems || 0, totalEnrollments: totalEnr,
        avgProgress, completionRate, totalRevenue, pendingPayments,
      });
      setRecentActivity(activity.slice(0, 8));
      setProgressDistrib(dist.filter(d => d.count > 0));
      setWeeklyRegistrations(weeklyData.length > 0 ? weeklyData : [{ name: '—', users: 0 }]);

      // ── Magasins ──────────────────────────────────────────
      try {
        const [productsRes, shopOrdersRes] = await Promise.allSettled([
          pb.collection('products').getFullList({ requestKey: null }),
          pb.collection('orders').getFullList({
            sort: '-created', requestKey: null,
          }),
        ]);

        const products   = productsRes.status === 'fulfilled'   ? productsRes.value   : [];
        const shopOrders = shopOrdersRes.status === 'fulfilled' ? shopOrdersRes.value : [];

        // Regrouper par magasin si le champ store/magasin existe
        const musikProducts = products.filter(p => (p.store || p.magasin || '').toLowerCase().includes('musik') || (p.category || '').toLowerCase().includes('musik'));
        const techProducts  = products.filter(p => (p.store || p.magasin || '').toLowerCase().includes('tech') || (p.category || '').toLowerCase().includes('tech'));
        const musikOrders   = shopOrders.filter(o => (o.store || o.magasin || '').toLowerCase().includes('musik'));
        const techOrders    = shopOrders.filter(o => (o.store || o.magasin || '').toLowerCase().includes('tech'));

        const calcRevenue = (ords) => ords.filter(o => o.status === 'paid' || o.status === 'completed').reduce((s, o) => s + (o.total_price || o.total || 0), 0);

        const recentOrders = shopOrders.slice(0, 5).map(o => ({
          id: o.id,
          ref: o.reference || o.id?.slice(0, 8).toUpperCase(),
          store: (o.store || o.magasin || 'Magasin'),
          status: o.status || 'pending',
          total: o.total_price || o.total || 0,
          date: o.created ? new Date(o.created).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—',
        }));

        setShopStats({
          laayounemusik: {
            products: musikProducts.length || Math.floor(products.length / 2),
            orders:   musikOrders.length,
            revenue:  calcRevenue(musikOrders),
          },
          iwstech: {
            products: techProducts.length || Math.ceil(products.length / 2),
            orders:   techOrders.length,
            revenue:  calcRevenue(techOrders),
          },
          recentOrders,
          totalProducts: products.length,
          totalOrders:   shopOrders.length,
          totalRevenue:  calcRevenue(shopOrders),
        });
      } catch { /* collections magasin pas encore actives */ }

      // ── Studio ────────────────────────────────────────────
      try {
        const [reservRes, servicesRes] = await Promise.allSettled([
          pb.collection('studio_reservations').getFullList({ requestKey: null }),
          pb.collection('studio_services').getFullList({ requestKey: null }),
        ]);

        const reservations = reservRes.status === 'fulfilled'    ? reservRes.value    : [];
        const services     = servicesRes.status === 'fulfilled'  ? servicesRes.value  : [];

        const now  = new Date();
        const week = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        const reservThisWeek = reservations.filter(r => r.created && new Date(r.created) >= week).length;
        const studioRevenue  = reservations.filter(r => r.status === 'paid' || r.status === 'completed').reduce((s, r) => s + (r.price || r.total || 0), 0);

        setStudioStats({
          reservationsTotal:   reservations.length,
          reservationsThisWeek: reservThisWeek,
          servicesCount:       services.length,
          revenue:             studioRevenue,
        });
      } catch { /* collections studio pas encore actives */ }

      // ── Web Agency ────────────────────────────────────────
      try {
        const [webOrdersRes, webSvcsRes] = await Promise.allSettled([
          pb.collection('web_orders').getList(1, 500, { requestKey: null }).then(r => r.items.sort((a,b) => new Date(b.created)-new Date(a.created))),
          pb.collection('web_services').getFullList({ requestKey: null }),
        ]);

        const webOrders  = webOrdersRes.status === 'fulfilled' ? webOrdersRes.value : [];
        const webSvcs    = webSvcsRes.status  === 'fulfilled'  ? webSvcsRes.value   : [];

        const TECH_LBL = { wordpress: 'WordPress', iws_builder: 'IWS Builder', node: 'Sur mesure', import: 'Import' };

        setAgenceStats({
          totalCommandes: webOrders.length,
          nouvelles:      webOrders.filter(o => o.statut === 'nouveau').length,
          enCours:        webOrders.filter(o => ['en_discussion','en_cours'].includes(o.statut)).length,
          livrees:        webOrders.filter(o => o.statut === 'livré').length,
          caEncaisse:     webOrders.filter(o => o.statut === 'payé').reduce((s, o) => s + (o.montant || 0), 0),
          pipeline:       webOrders.filter(o => ['nouveau','en_discussion','en_cours','livré'].includes(o.statut)).reduce((s, o) => s + (o.montant || 0), 0),
          servicesActifs: webSvcs.filter(s => s.actif !== false).length,
          recentOrders:   webOrders.slice(0, 5).map(o => ({
            id: o.id, nom: o.client_nom || '—',
            service: o.service_nom || 'Site web',
            tech: TECH_LBL[o.tech_choice] || o.tech_choice || '—',
            statut: o.statut || 'nouveau', montant: o.montant || 0,
            date: o.created ? new Date(o.created).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—',
          })),
        });
      } catch { /* web agency pas encore active */ }

    } catch (err) {
      console.error('AdminDashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);
  const handleRefresh = () => { setRefreshing(true); fetchAll(); };

  // ── Formation KPI cards ──────────────────────────────────────
  const FORMATION_CARDS = [
    { title: 'Étudiants inscrits', value: stats.totalStudents,    sub: `${stats.activeStudents} actifs`, icon: Users,     colorClass: 'text-blue-600',   bgClass: 'bg-blue-100 dark:bg-blue-900/20' },
    { title: 'Progression moy.',  value: `${stats.avgProgress}%`, sub: `Complétion : ${stats.completionRate}%`, icon: TrendingUp, colorClass: 'text-indigo-600', bgClass: 'bg-indigo-100 dark:bg-indigo-900/20' },
    { title: 'Période gratuite',  value: stats.freeTierStudents,  sub: `${stats.paidStudents} payants`,  icon: Gift,      colorClass: 'text-emerald-600', bgClass: 'bg-emerald-100 dark:bg-emerald-900/20' },
    { title: 'Revenus Formation', value: stats.totalRevenue > 0 ? `${stats.totalRevenue.toLocaleString('fr-FR')} MAD` : '0 MAD', sub: `${stats.pendingPayments} en attente`, icon: DollarSign, colorClass: 'text-orange-600', bgClass: 'bg-orange-100 dark:bg-orange-900/20' },
    { title: 'Cours actifs',      value: stats.totalCourses,      sub: `${stats.totalEnrollments} inscriptions`, icon: BookOpen,  colorClass: 'text-purple-600', bgClass: 'bg-purple-100 dark:bg-purple-900/20' },
  ];

  const STORES_CONFIG = [
    { key: 'laayounemusik', name: 'LaayouneMusik', subtitle: 'Instruments & accessoires', icon: Music2, logo: '/logos/logo_laayounemusik.jpeg', gradient: 'from-pink-600 to-rose-500', bg: 'bg-pink-50 dark:bg-pink-950/20', border: 'border-pink-200', color: 'text-pink-700' },
    { key: 'iwstech',       name: 'IwsTech Company', subtitle: 'Ordinateurs & matériel IT', icon: Laptop2, logo: '/logos/Iws_ech.jpg',           gradient: 'from-blue-600 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200', color: 'text-blue-600' },
  ];

  const ORDER_STATUS_STYLE = {
    paid:      'bg-emerald-100 text-emerald-700',
    completed: 'bg-green-100 text-green-700',
    pending:   'bg-amber-100 text-amber-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <AdminLayout>
      <Helmet><title>Dashboard Admin — IWS</title></Helmet>

      <div className="space-y-8 animate-slide-up">

        {/* ── HEADER ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              Tableau de bord global
            </h2>
            <p className="text-muted-foreground text-sm mt-0.5">Vue centralisée — Formation · Magasins · Studio · Web Agency</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="gap-2">
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Link to="/admin/students">
              <Button size="sm" className="gap-2">
                <Eye className="w-3.5 h-3.5" /> Étudiants
              </Button>
            </Link>
          </div>
        </div>

        {/* ── BUSINESS UNITS — 4 tuiles de navigation rapide ──────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              to: '/admin/formation', icon: GraduationCap,
              gradient: 'from-blue-600 to-indigo-600',
              label: 'Centre de Formation',
              kpis: loading ? ['—', '—', '—'] : [
                `${stats.totalStudents} étudiants`,
                `${stats.totalCourses} cours`,
                `${stats.totalRevenue > 0 ? stats.totalRevenue.toLocaleString('fr-FR') : '0'} MAD`,
              ],
            },
            {
              to: '/admin/magasin', icon: ShoppingBag,
              gradient: 'from-orange-500 to-pink-500',
              label: 'Magasins',
              kpis: loading ? ['—', '—', '—'] : [
                `${shopStats.totalProducts} produits`,
                `${shopStats.totalOrders} commandes`,
                `${shopStats.totalRevenue > 0 ? shopStats.totalRevenue.toLocaleString('fr-FR') : '0'} MAD`,
              ],
            },
            {
              to: '/admin/studio', icon: Mic2,
              gradient: 'from-purple-600 to-violet-600',
              label: 'Studio IWS Records',
              kpis: loading ? ['—', '—', '—'] : [
                `${studioStats.reservationsTotal} réservations`,
                `${studioStats.servicesCount} services`,
                `${studioStats.revenue > 0 ? studioStats.revenue.toLocaleString('fr-FR') : '0'} MAD`,
              ],
            },
            {
              to: '/admin/agence', icon: Globe,
              gradient: 'from-cyan-500 to-blue-600',
              label: 'Web Agency',
              kpis: loading ? ['—', '—', '—'] : [
                `${agenceStats.totalCommandes} commandes`,
                `${agenceStats.servicesActifs} services`,
                `${agenceStats.caEncaisse > 0 ? agenceStats.caEncaisse.toLocaleString('fr-FR') : '0'} MAD`,
              ],
            },
          ].map(({ to, icon: Icon, gradient, label, kpis }) => (
            <Link key={to} to={to}>
              <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} text-white p-5 h-full hover:opacity-95 hover:shadow-xl transition-all duration-300 cursor-pointer group`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-sm">{label}</span>
                  <ArrowRight className="w-4 h-4 ml-auto opacity-70 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="space-y-1">
                  {kpis.map((kpi, i) => (
                    <p key={i} className="text-xs text-white/80">{kpi}</p>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════
            SECTION FORMATION
        ═══════════════════════════════════════════════════════════ */}
        <div>
          <SectionHeader
            icon={GraduationCap} title="Centre de Formation"
            subtitle="Cours, étudiants et progression"
            color={{ bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400' }}
            linkTo="/admin/formation" linkLabel="Gérer les cours"
          />

          {/* KPI Formation */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {FORMATION_CARDS.map(card => (
              <StatCard key={card.title} {...card} loading={loading} />
            ))}
          </div>

          {/* Free tier alert */}
          {!loading && stats.freeTierStudents > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-6">
              <Gift className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-emerald-800">
                  {stats.freeTierStudents} étudiant{stats.freeTierStudents > 1 ? 's' : ''} en période gratuite
                </p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Accès gratuit aux {FREE_COURSES_LIMIT} premiers cours.
                </p>
              </div>
              {stats.pendingPayments > 0 && (
                <Badge variant="outline" className="border-amber-400 text-amber-700 bg-amber-50 gap-1 shrink-0">
                  <AlertCircle className="w-3 h-3" /> {stats.pendingPayments} paiements en attente
                </Badge>
              )}
            </div>
          )}

          {/* Charts Formation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="dashboard-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Inscriptions (historique)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-[220px] w-full rounded-xl" /> : (
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyRegistrations}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                        <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ borderRadius: '10px', border: '1px solid hsl(var(--border))', fontSize: 12 }}
                          formatter={(v) => [`${v} étudiant${v > 1 ? 's' : ''}`, 'Inscriptions']} />
                        <Bar dataKey="users" fill="hsl(var(--primary))" radius={[5, 5, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-500" /> Distribution progression
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-[180px] w-full rounded-xl" /> :
                  progressDistrib.length === 0 ? (
                    <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">Aucune donnée</div>
                  ) : (
                    <>
                      <div className="h-[160px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={progressDistrib} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={65} strokeWidth={2}>
                              {progressDistrib.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                            </Pie>
                            <Tooltip formatter={(v, n) => [`${v} inscriptions`, n]} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-1 mt-2">
                        {progressDistrib.map((d, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                              <span className="text-muted-foreground">{d.label}</span>
                            </div>
                            <span className="font-bold text-foreground">{d.count}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )
                }
              </CardContent>
            </Card>
          </div>

          {/* Activité étudiants */}
          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Activité récente des étudiants
              </CardTitle>
              <Link to="/admin/students">
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary hover:text-primary/80">
                  Voir tous <Eye className="w-3 h-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0 px-5 pb-3">
              {loading ? (
                <div className="space-y-3 py-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-1/2" /><Skeleton className="h-2.5 w-1/3" />
                      </div>
                      <Skeleton className="h-3 w-20" />
                    </div>
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Aucune activité récente</p>
                </div>
              ) : recentActivity.map(a => <ActivityRow key={a.id} {...a} />)}
            </CardContent>
          </Card>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            SECTION MAGASINS
        ═══════════════════════════════════════════════════════════ */}
        <div>
          <SectionHeader
            icon={ShoppingBag} title="Magasins"
            subtitle="LaayouneMusik · IwsTech Company"
            color={{ bg: 'bg-orange-100 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400' }}
            linkTo="/admin/magasin" linkLabel="Gérer les magasins"
          />

          {/* Indicateurs globaux magasins */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: 'Total produits', value: shopStats.totalProducts, icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' },
              { label: 'Total commandes', value: shopStats.totalOrders,  icon: ShoppingCart, color: 'text-pink-600', bg: 'bg-pink-50' },
              { label: 'Revenus combinés', value: `${shopStats.totalRevenue.toLocaleString('fr-FR')} MAD`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-4 flex items-center gap-3 border border-border`}>
                <div className={`p-2 rounded-lg bg-white/80`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  {loading ? <Skeleton className="h-5 w-16 mb-1" /> : <p className={`font-bold text-lg ${color}`}>{value}</p>}
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Cards par magasin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {STORES_CONFIG.map(store => (
              <StoreCard
                key={store.key}
                store={store}
                stats={shopStats[store.key]}
                loading={loading}
              />
            ))}
          </div>

          {/* Dernières commandes */}
          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-orange-500" /> Dernières commandes
              </CardTitle>
              <Link to="/admin/payments">
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-orange-600">
                  Voir toutes <Eye className="w-3 h-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div>
              ) : shopStats.recentOrders.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Store className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Aucune commande enregistrée</p>
                  <p className="text-xs mt-1">Les commandes apparaîtront ici dès qu'elles seront créées.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {shopStats.recentOrders.map(order => (
                    <div key={order.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                        <ShoppingCart className="w-3.5 h-3.5 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">#{order.ref}</p>
                        <p className="text-xs text-muted-foreground">{order.store} · {order.date}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-foreground">{(order.total || 0).toLocaleString('fr-FR')} MAD</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${ORDER_STATUS_STYLE[order.status] || 'bg-gray-100 text-gray-600'}`}>
                          {order.status === 'paid' ? '✓ Payé' : order.status === 'completed' ? '✓ Terminé' : order.status === 'pending' ? '⏳ En attente' : order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            SECTION STUDIO
        ═══════════════════════════════════════════════════════════ */}
        <div>
          <SectionHeader
            icon={Mic2} title="Studio IWS Records"
            subtitle="Réservations, services et revenus"
            color={{ bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-400' }}
            linkTo="/admin/studio" linkLabel="Gérer le studio"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Réservations totales', value: studioStats.reservationsTotal, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/20' },
              { label: 'Cette semaine',         value: studioStats.reservationsThisWeek, icon: Clock, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/20' },
              { label: 'Services proposés',    value: studioStats.servicesCount,      icon: Layers,  color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
              { label: 'Revenus studio',        value: `${studioStats.revenue.toLocaleString('fr-FR')} MAD`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-4 border border-border`}>
                <div className={`p-2 rounded-lg bg-white/80 w-fit mb-2`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                {loading ? <Skeleton className="h-7 w-16 mb-1" /> : <p className={`font-bold text-2xl ${color}`}>{value}</p>}
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border border-purple-200 dark:border-purple-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Mic2 className="w-8 h-8 text-purple-500 shrink-0" />
              <div>
                <p className="font-semibold text-purple-800 dark:text-purple-300 text-sm">IWS Records Studio</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">Enregistrement · Mixage · Mastering · Production musicale</p>
              </div>
            </div>
            <Link to="/admin/studio">
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5 shrink-0">
                <Calendar className="w-3.5 h-3.5" /> Voir les réservations
              </Button>
            </Link>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            SECTION WEB AGENCY
        ═══════════════════════════════════════════════════════════ */}
        <div>
          <SectionHeader
            icon={Globe} title="Web Agency"
            subtitle="Création de sites web — commandes & services"
            color={{ bg: 'bg-cyan-100 dark:bg-cyan-900/20', text: 'text-cyan-700 dark:text-cyan-400' }}
            linkTo="/admin/agence" linkLabel="Gérer l'agence"
          />

          {/* KPIs Web Agency */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
            {[
              { label: 'Total commandes', value: agenceStats.totalCommandes, icon: FileText,   color: 'text-cyan-600',    bg: 'bg-cyan-50 dark:bg-cyan-950/20' },
              { label: 'Nouvelles',       value: agenceStats.nouvelles,      icon: AlertCircle, color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-950/20' },
              { label: 'En cours',        value: agenceStats.enCours,        icon: Wrench,     color: 'text-purple-600',  bg: 'bg-purple-50 dark:bg-purple-950/20' },
              { label: 'Livrées',         value: agenceStats.livrees,        icon: CheckCircle2,color: 'text-green-600',   bg: 'bg-green-50 dark:bg-green-950/20' },
              { label: 'CA encaissé',     value: `${agenceStats.caEncaisse.toLocaleString('fr-FR')} MAD`, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
              { label: 'Services actifs', value: agenceStats.servicesActifs, icon: Globe,      color: 'text-indigo-600',  bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-4 border border-border`}>
                <div className={`p-2 rounded-lg bg-white/80 w-fit mb-2`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                {loading ? <Skeleton className="h-7 w-16 mb-1" /> : <p className={`font-bold text-2xl ${color}`}>{value}</p>}
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Dernières commandes web */}
          <Card className="dashboard-card mb-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-500" /> Dernières commandes web
              </CardTitle>
              <Link to="/admin/agence">
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-cyan-600">
                  Tout voir <Eye className="w-3 h-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div>
              ) : agenceStats.recentOrders.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Globe className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Aucune commande web enregistrée</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {agenceStats.recentOrders.map(order => {
                    const STATUS_STYLE = {
                      nouveau: 'bg-blue-100 text-blue-700', en_discussion: 'bg-yellow-100 text-yellow-700',
                      en_cours: 'bg-purple-100 text-purple-700', 'livré': 'bg-green-100 text-green-700',
                      'payé': 'bg-emerald-100 text-emerald-700', 'annulé': 'bg-red-100 text-red-700',
                    };
                    const STATUS_LBL = {
                      nouveau: 'Nouveau', en_discussion: 'Discussion', en_cours: 'En cours',
                      'livré': '✓ Livré', 'payé': '✓ Payé', 'annulé': 'Annulé',
                    };
                    return (
                      <div key={order.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center shrink-0">
                          <Globe className="w-3.5 h-3.5 text-cyan-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{order.nom}</p>
                          <p className="text-xs text-muted-foreground">{order.service} · {order.tech} · {order.date}</p>
                        </div>
                        <div className="text-right shrink-0">
                          {order.montant > 0 && <p className="text-sm font-bold">{order.montant.toLocaleString('fr-FR')} MAD</p>}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_STYLE[order.statut] || 'bg-gray-100 text-gray-600'}`}>
                            {STATUS_LBL[order.statut] || order.statut}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Banner Web Agency */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border border-cyan-200 dark:border-cyan-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-cyan-500 shrink-0" />
              <div>
                <p className="font-semibold text-cyan-800 dark:text-cyan-300 text-sm">IWS Web Agency</p>
                <p className="text-xs text-cyan-600 dark:text-cyan-400">Sites vitrines · E-commerce · WordPress · Développement sur mesure</p>
              </div>
            </div>
            <Link to="/admin/agence">
              <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white gap-1.5 shrink-0">
                <Eye className="w-3.5 h-3.5" /> Gérer les commandes
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
