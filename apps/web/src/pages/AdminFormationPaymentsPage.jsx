
import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useSearchParams } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import AdminLayout from '@/components/AdminLayout.jsx';
import { useTranslation } from '@/i18n/useTranslation.js';
import { useLanguage } from '@/hooks/useLanguage.jsx';
import { FORMATION_SECTIONS, getCourseSection } from './AdminFormationPage.jsx';
import ReceiptModal from '@/components/ReceiptModal.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  CreditCard, TrendingUp, Clock, CheckCircle2, Search,
  Download, ChevronLeft, ChevronRight, Receipt,
  Filter, RefreshCw, GraduationCap, Languages, Monitor, Code2,
  Check, X as XIcon, Loader2,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ── Status config ─────────────────────────────────────────────────
const STATUS_CFG = {
  completed: { label: 'Payé',      color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', dot: 'bg-green-500' },
  paid:      { label: 'Payé',      color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', dot: 'bg-green-500' },
  pending:   { label: 'En attente', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', dot: 'bg-yellow-500' },
  cancelled: { label: 'Annulé',    color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', dot: 'bg-red-500' },
};

// Helper — commande considérée comme payée (PocketBase stocke 'completed')
const isPaid = (o) => o.status === 'completed' || o.status === 'paid';

const PIE_COLORS = ['#3b82f6', '#22c55e', '#a855f7'];

const PAGE_SIZE = 10;

const AdminFormationPaymentsPage = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const initSection = searchParams.get('section') || 'all';

  const [orders, setOrders] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState(initSection);
  const [page, setPage] = useState(1);
  const [receipt, setReceipt] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const locale = language === 'fr' ? 'fr-FR' : language?.startsWith('ar') ? 'ar-MA' : 'en-US';

  // ── Fetch ──────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, coursesRes, usersRes] = await Promise.allSettled([
        pb.collection('orders').getFullList({ sort: '-created', expand: 'course_id', requestKey: null }),
        pb.collection('courses').getFullList({ requestKey: null }),
        pb.collection('users').getFullList({ fields: 'id,name,prenom,nom,email,role', requestKey: null }),
      ]);
      const allOrders = ordersRes.status === 'fulfilled' ? ordersRes.value : [];
      const allCourses = coursesRes.status === 'fulfilled' ? coursesRes.value : [];
      const allUsers = usersRes.status === 'fulfilled' ? usersRes.value : [];

      // Enrich orders with student info
      const enriched = allOrders.map(o => {
        const user = allUsers.find(u => u.id === o.user_id || u.id === o.expand?.user_id?.id);
        return {
          ...o,
          _studentName: user ? `${user.prenom || ''} ${user.nom || user.name || ''}`.trim() : '—',
          _studentEmail: user?.email || '—',
        };
      });

      setOrders(enriched);
      setCourses(allCourses);
      setUsers(allUsers);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Filter orders by section (via course_id) ──────────────────────
  const getOrderSection = (order) => {
    // Try expanded course first, then match by course_id
    const expandedCourse = order.expand?.course_id;
    if (expandedCourse) return getCourseSection(expandedCourse);
    const courseId = order.course_id;
    if (courseId) {
      const found = courses.find(c => c.id === courseId);
      if (found) return getCourseSection(found);
    }
    return 'langues'; // default
  };

  // ── Admin action handlers ──────────────────────────────────────────
  const handleMarkPaid = async (orderId) => {
    setActionLoading(orderId + '_pay');
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/mark-paid`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pb.authStore.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payment_method: 'especes' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur serveur');
      toast.success('✅ Commande marquée comme payée');
      fetchData();
    } catch (e) {
      toast.error(`Impossible : ${e.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Annuler cette commande ?')) return;
    setActionLoading(orderId + '_cancel');
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pb.authStore.token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur serveur');
      toast.success('🚫 Commande annulée');
      fetchData();
    } catch (e) {
      toast.error(`Impossible d'annuler : ${e.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = useMemo(() => {
    let list = orders;
    if (sectionFilter !== 'all') {
      list = list.filter(o => getOrderSection(o) === sectionFilter);
    }
    if (statusFilter !== 'all') {
      list = list.filter(o => o.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o._studentName.toLowerCase().includes(q) ||
        o._studentEmail.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, sectionFilter, statusFilter, search, courses]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // ── Stats per section ──────────────────────────────────────────────
  const sectionRevenue = useMemo(() => {
    return Object.keys(FORMATION_SECTIONS).map(key => {
      const sec = FORMATION_SECTIONS[key];
      const secOrders = orders.filter(o => getOrderSection(o) === key && isPaid(o));
      return {
        key,
        label: t(`admin.formation.section.${key}`),
        revenue: secOrders.reduce((s, o) => s + (o.total_price || 0), 0),
        count: secOrders.length,
        color: key === 'langues' ? '#3b82f6' : key === 'informatique' ? '#22c55e' : '#a855f7',
      };
    });
  }, [orders, courses]);

  const totalRevenue = orders.filter(isPaid).reduce((s, o) => s + (o.total_price || 0), 0);
  const pendingRevenue = orders.filter(o => o.status === 'pending').reduce((s, o) => s + (o.total_price || 0), 0);
  const paidCount = orders.filter(isPaid).length;

  // ── Monthly chart data ─────────────────────────────────────────────
  const monthlyData = useMemo(() => {
    const months = {};
    orders.filter(isPaid).forEach(o => {
      const d = new Date(o.created);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = (months[key] || 0) + (o.total_price || 0);
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, total]) => {
        const [y, m] = key.split('-');
        const name = new Date(Number(y), Number(m) - 1).toLocaleDateString(locale, { month: 'short' });
        return { name, total };
      });
  }, [orders, locale]);

  // ── Export CSV ─────────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ['Réf', 'Étudiant', 'Email', 'Section', 'Montant (MAD)', 'Statut', 'Date'];
    const rows = filtered.map(o => [
      o.id.slice(0, 8).toUpperCase(),
      o._studentName,
      o._studentEmail,
      t(`admin.formation.section.${getOrderSection(o)}`),
      o.total_price || 0,
      o.status,
      new Date(o.created).toLocaleDateString('fr-FR'),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `paiements-formation-${Date.now()}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  // ── Open receipt ───────────────────────────────────────────────────
  const openReceipt = (order) => {
    const course = order.expand?.course_id || courses.find(c => c.id === order.course_id);
    setReceipt({
      id: order.id,
      ref: order.id.slice(0, 8).toUpperCase(),
      date: order.created,
      service: `Centre de Formation — ${t(`admin.formation.section.${getOrderSection(order)}`)}`,
      studentName: order._studentName,
      studentEmail: order._studentEmail,
      items: course
        ? [{ label: course.title || 'Formation', qty: 1, unitPrice: order.total_price || 0 }]
        : [{ label: 'Formation', qty: 1, unitPrice: order.total_price || 0 }],
      total: order.total_price || 0,
      status: order.status,
      paymentMethod: order.payment_method || 'Virement',
    });
  };

  const fmtMAD = (n) => `${(n || 0).toLocaleString('fr-FR')} MAD`;

  return (
    <AdminLayout>
      <Helmet><title>Paiements Formation — IWS Admin</title></Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Link to="/admin/formation" className="hover:text-foreground transition-colors">{t('admin.formation.title')}</Link>
              <span>›</span>
              <span>{t('admin.payments.title')}</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{t('admin.formation.payments.title')}</h1>
            <p className="text-muted-foreground text-sm">{t('admin.formation.payments.subtitle')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> {t('admin.payments.refresh')}
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
            <Download className="w-3.5 h-3.5" /> CSV
          </Button>
        </div>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: TrendingUp, value: fmtMAD(totalRevenue), label: t('admin.payments.totalRevenue'), color: 'text-green-600' },
          { icon: CheckCircle2, value: paidCount, label: t('admin.payments.paidOrders'), color: 'text-blue-600' },
          { icon: Clock, value: fmtMAD(pendingRevenue), label: t('admin.payments.pendingAmount'), color: 'text-yellow-600' },
          { icon: GraduationCap, value: orders.length, label: t('admin.payments.totalOrders'), color: 'text-purple-600' },
        ].map(({ icon: Ic, value, label, color }) => (
          <Card key={label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  {loading ? <><Skeleton className="h-7 w-24 mb-1" /><Skeleton className="h-3 w-28" /></> : (
                    <><p className={`text-2xl font-bold ${color}`}>{value}</p><p className="text-xs text-muted-foreground mt-0.5">{label}</p></>
                  )}
                </div>
                <div className={`p-2.5 rounded-xl bg-muted ${color}`}><Ic className="w-4 h-4" /></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Bar chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('admin.payments.monthlyRevenue')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-44 w-full" /> : (
              <ResponsiveContainer width="100%" height={176}>
                <BarChart data={monthlyData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip formatter={(v) => [`${v.toLocaleString('fr-FR')} MAD`]} />
                  <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenus" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie chart — per section */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('admin.formation.payments.bySection')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-44 w-full" /> : (
              <ResponsiveContainer width="100%" height={176}>
                <PieChart>
                  <Pie
                    data={sectionRevenue}
                    dataKey="revenue"
                    nameKey="label"
                    cx="50%" cy="50%"
                    outerRadius={64}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    fontSize={10}
                  >
                    {sectionRevenue.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v.toLocaleString('fr-FR')} MAD`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section revenue breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {sectionRevenue.map(({ key, label, revenue, count }) => {
          const cfg = FORMATION_SECTIONS[key];
          const Ic = cfg.icon;
          return (
            <Card key={key} className={`border ${cfg.border}`}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${cfg.gradient} text-white`}>
                    <Ic className="w-4 h-4" />
                  </div>
                  <p className={`font-semibold text-sm ${cfg.color}`}>{label}</p>
                </div>
                {loading ? <Skeleton className="h-6 w-32" /> : (
                  <>
                    <p className="text-2xl font-bold text-foreground">{fmtMAD(revenue)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{count} commande{count > 1 ? 's' : ''} payée{count > 1 ? 's' : ''}</p>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className={`w-full mt-3 text-xs border ${cfg.border} ${cfg.color}`}
                  onClick={() => { setSectionFilter(key); setPage(1); }}
                >
                  {t('admin.formation.payments.filterSection')}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('admin.payments.search')}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        {/* Section filter */}
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => { setSectionFilter('all'); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sectionFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            Tous
          </button>
          {Object.entries(FORMATION_SECTIONS).map(([key, cfg]) => {
            const Ic = cfg.icon;
            return (
              <button
                key={key}
                onClick={() => { setSectionFilter(key); setPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${sectionFilter === key ? `bg-gradient-to-r ${cfg.gradient} text-white border-transparent` : `${cfg.border} ${cfg.color} hover:bg-muted`}`}
              >
                <Ic className="w-3 h-3" />
                {t(`admin.formation.section.${key}`)}
              </button>
            );
          })}
        </div>
        {/* Status filter */}
        <div className="flex gap-1.5">
          {['all', 'completed', 'pending', 'cancelled'].map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              {s === 'all' ? 'Tous' : STATUS_CFG[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wide">{t('admin.payments.col.ref')}</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wide">{t('admin.payments.col.student')}</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wide">Section</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wide">{t('admin.payments.col.amount')}</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wide">{t('admin.payments.col.status')}</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wide">{t('admin.payments.col.date')}</th>
                <th className="text-right py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wide">Reçu</th>
                <th className="text-right py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="py-3 px-4"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p>{t('admin.payments.noOrders')}</p>
                  </td>
                </tr>
              ) : (
                paginated.map(order => {
                  const sec = getOrderSection(order);
                  const secCfg = FORMATION_SECTIONS[sec] || FORMATION_SECTIONS.langues;
                  const Ic = secCfg.icon;
                  const sc = STATUS_CFG[order.status] || STATUS_CFG.pending;
                  return (
                    <tr key={order.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs font-semibold">{order.id.slice(0, 8).toUpperCase()}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-foreground">{order._studentName}</p>
                        <p className="text-xs text-muted-foreground">{order._studentEmail}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${secCfg.badge}`}>
                          <Ic className="w-3 h-3" />
                          {t(`admin.formation.section.${sec}`)}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-foreground">
                        {(order.total_price || 0).toLocaleString('fr-FR')} MAD
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        {new Date(order.created).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs gap-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                          onClick={() => openReceipt(order)}
                        >
                          <Receipt className="w-3 h-3" /> Voir
                        </Button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {order.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={actionLoading === order.id + '_pay'}
                                className="h-7 px-2 text-xs gap-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30"
                                onClick={() => handleMarkPaid(order.id)}
                                title="Marquer comme payé"
                              >
                                {actionLoading === order.id + '_pay'
                                  ? <Loader2 className="w-3 h-3 animate-spin" />
                                  : <Check className="w-3 h-3" />}
                                Payé
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={actionLoading === order.id + '_cancel'}
                                className="h-7 px-2 text-xs gap-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                onClick={() => handleCancelOrder(order.id)}
                                title="Annuler la commande"
                              >
                                {actionLoading === order.id + '_cancel'
                                  ? <Loader2 className="w-3 h-3 animate-spin" />
                                  : <XIcon className="w-3 h-3" />}
                                Annuler
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Grand total footer */}
            {!loading && filtered.length > 0 && (
              <tfoot>
                <tr className="bg-blue-50 dark:bg-blue-950/30 font-bold text-sm">
                  <td colSpan={3} className="py-3 px-4 text-blue-700 dark:text-blue-300 text-right">
                    Total ({filtered.filter(isPaid).length} paiements)
                  </td>
                  <td className="py-3 px-4 text-blue-700 dark:text-blue-300 text-base">
                    {filtered.filter(isPaid).reduce((s, o) => s + (o.total_price || 0), 0).toLocaleString('fr-FR')} MAD
                  </td>
                  <td colSpan={4} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-7 w-7 p-0">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <Button
                  key={p}
                  variant={p === page ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPage(p)}
                  className="h-7 w-7 p-0 text-xs"
                >
                  {p}
                </Button>
              ))}
              <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-7 w-7 p-0">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Receipt Modal */}
      <ReceiptModal
        open={!!receipt}
        onClose={() => setReceipt(null)}
        receipt={receipt}
        companyName="IWS — Centre de Formation"
      />
    </AdminLayout>
  );
};

export default AdminFormationPaymentsPage;
