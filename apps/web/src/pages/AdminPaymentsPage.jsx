
import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import AdminLayout from '@/components/AdminLayout.jsx';
import { useTranslation } from '@/i18n/useTranslation.js';
import { useLanguage } from '@/hooks/useLanguage.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  DollarSign, TrendingUp, Clock, XCircle, Search,
  Download, CheckCircle2, ChevronLeft,
  ChevronRight, CreditCard, Users, BarChart3, Wallet,
  Filter, RefreshCw, Eye,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Helpers ──────────────────────────────────────────────────────
const fmtMAD = (n) => `${(n || 0).toLocaleString('fr-FR')} MAD`;

const exportCSV = (rows, t) => {
  const headers = [
    t('admin.payments.col.ref'),
    t('admin.payments.col.student'),
    'Email',
    `${t('admin.payments.col.amount')} (MAD)`,
    t('admin.payments.col.status'),
    t('admin.payments.col.products'),
    t('admin.payments.col.date'),
  ];
  const data = rows.map(r => [
    r.id.slice(0, 8).toUpperCase(),
    r._studentName || '-',
    r._studentEmail || '-',
    r.total_price || 0,
    r.status,
    (r.expand?.products || []).map(p => p.nom || p.name || 'Produit').join(' | '),
    new Date(r.created).toLocaleDateString('fr-FR'),
  ]);
  const csv = [headers, ...data].map(row => row.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `payments_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const ITEMS_PER_PAGE = 12;

// ── Main ─────────────────────────────────────────────────────────
const AdminPaymentsPage = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const [orders, setOrders]     = useState([]);
  const [students, setStudents] = useState({});
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage]         = useState(1);

  // Status config using t() ────────────────────────────────────
  const STATUS_CFG = {
    completed: {
      label: t('admin.payments.status.paid.badge'),
      cls: 'border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20',
      icon: CheckCircle2,
    },
    pending: {
      label: t('admin.payments.status.pending.badge'),
      cls: 'border-amber-400 text-amber-700 bg-amber-50 dark:bg-amber-900/20',
      icon: Clock,
    },
    cancelled: {
      label: t('admin.payments.status.cancelled.badge'),
      cls: 'border-red-400 text-red-700 bg-red-50 dark:bg-red-900/20',
      icon: XCircle,
    },
  };

  // Month names using browser locale ───────────────────────────
  const getMonthName = (monthIndex) => {
    const locale = language === 'ar-MA' ? 'ar-MA' : language === 'en' ? 'en-GB' : 'fr-FR';
    return new Date(2000, monthIndex, 1).toLocaleDateString(locale, { month: 'short' });
  };

  // ── Fetch ─────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, studentsRes] = await Promise.all([
        pb.collection('orders').getFullList({ sort: '-created', expand: 'products', requestKey: null }),
        pb.collection('users').getFullList({ filter: 'role="etudiant"', requestKey: null }),
      ]);

      const studentsMap = {};
      studentsRes.forEach(s => { studentsMap[s.id] = s; });
      setStudents(studentsMap);

      const enriched = ordersRes.map(o => ({
        ...o,
        _studentName:
          studentsMap[o.user_id]
            ? `${studentsMap[o.user_id].prenom || ''} ${studentsMap[o.user_id].nom || studentsMap[o.user_id].name || ''}`.trim()
            : t('admin.payments.col.student'),
        _studentEmail: studentsMap[o.user_id]?.email || '-',
      }));

      setOrders(enriched);
    } catch {
      toast.error(t('admin.payments.error.load'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Computed stats ────────────────────────────────────────────
  const completed  = orders.filter(o => o.status === 'completed');
  const pending    = orders.filter(o => o.status === 'pending');
  const cancelled  = orders.filter(o => o.status === 'cancelled');

  const totalRevenue = completed.reduce((s, o) => s + (o.total_price || 0), 0);
  const totalPending = pending.reduce((s, o)   => s + (o.total_price || 0), 0);

  const now = new Date();
  const thisMonthRevenue = completed
    .filter(o => {
      const d = new Date(o.created);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, o) => s + (o.total_price || 0), 0);

  const payingStudents = new Set(completed.map(o => o.user_id)).size;

  // ── Chart: last 6 months ──────────────────────────────────────
  const chartData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d    = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const mo   = d.getMonth();
      const yr   = d.getFullYear();
      const revenue = completed
        .filter(o => { const od = new Date(o.created); return od.getMonth() === mo && od.getFullYear() === yr; })
        .reduce((s, o) => s + (o.total_price || 0), 0);
      return { name: getMonthName(mo), revenue };
    });
  }, [orders, language]);

  // ── Per-student summary ───────────────────────────────────────
  const studentSummary = useMemo(() => {
    const map = {};
    orders.forEach(o => {
      if (!map[o.user_id]) {
        map[o.user_id] = { id: o.user_id, name: o._studentName, email: o._studentEmail, totalPaid: 0, totalPending: 0, orders: 0 };
      }
      map[o.user_id].orders++;
      if (o.status === 'completed') map[o.user_id].totalPaid    += (o.total_price || 0);
      if (o.status === 'pending')   map[o.user_id].totalPending += (o.total_price || 0);
    });
    return Object.values(map).sort((a, b) => b.totalPaid - a.totalPaid);
  }, [orders]);

  // ── Filtered list ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter(o => {
      const matchSearch = !q || o._studentName?.toLowerCase().includes(q) || o._studentEmail?.toLowerCase().includes(q) || o.id.toLowerCase().includes(q);
      const matchStatus = filterStatus === 'all' || o.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [orders, search, filterStatus]);

  useEffect(() => { setPage(1); }, [search, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // ── Stat card ─────────────────────────────────────────────────
  const StatCard = ({ icon: Icon, label, value, sub, color, subColor }) => (
    <div className="admin-stat-card group">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${color.bg}`}>
          <Icon className={`w-5 h-5 ${color.text}`} />
        </div>
        {sub && <span className={`text-xs font-semibold ${subColor || 'text-emerald-600'}`}>{sub}</span>}
      </div>
      <p className="text-muted-foreground text-sm font-medium">{label}</p>
      {loading
        ? <Skeleton className="h-8 w-28 mt-1" />
        : <p className={`text-2xl font-bold mt-1 ${color.text} truncate`}>{value}</p>
      }
    </div>
  );

  return (
    <AdminLayout>
      <Helmet>
        <title>{t('admin.payments.title')} - Admin IWS</title>
      </Helmet>

      <div className="space-y-6 animate-slide-up">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <CreditCard className="w-8 h-8 text-primary" />
              {t('admin.payments.title')}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {t('admin.payments.subtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {t('admin.payments.refresh')}
            </Button>
            <Button variant="outline" size="sm" className="gap-2"
              onClick={() => exportCSV(filtered, t)} disabled={filtered.length === 0}>
              <Download className="w-4 h-4" />
              {t('admin.payments.export')}
            </Button>
          </div>
        </div>

        {/* ── Stats ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Wallet} label={t('admin.payments.stat.revenue')} value={fmtMAD(totalRevenue)}
            sub={`${completed.length} ${t('admin.payments.stat.revenue.sub')}`}
            color={{ bg: 'bg-emerald-100 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' }}
          />
          <StatCard
            icon={TrendingUp} label={t('admin.payments.stat.month')} value={fmtMAD(thisMonthRevenue)}
            sub={t('admin.payments.stat.month.sub')}
            color={{ bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' }}
          />
          <StatCard
            icon={Clock} label={t('admin.payments.stat.pending')} value={fmtMAD(totalPending)}
            sub={`${pending.length} ${t('admin.payments.stat.pending.sub')}`}
            subColor="text-amber-600"
            color={{ bg: 'bg-amber-100 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400' }}
          />
          <StatCard
            icon={Users} label={t('admin.payments.stat.students')} value={payingStudents}
            sub={`${t('admin.payments.total.label')} ${Object.keys(students).length}`}
            color={{ bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' }}
          />
        </div>

        {/* ── Charts row ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Monthly revenue */}
          <Card className="dashboard-card lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                {t('admin.payments.chart.monthly')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      tickFormatter={v => `${v} MAD`} />
                    <Tooltip
                      contentStyle={{ borderRadius: '10px', border: '1px solid hsl(var(--border))', fontSize: 12 }}
                      formatter={v => [`${v.toLocaleString('fr-FR')} MAD`, t('admin.payments.tooltip.revenue')]}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Status breakdown */}
          <Card className="dashboard-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                {t('admin.payments.chart.breakdown')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                [1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full rounded-xl" />)
              ) : (
                [
                  { label: t('admin.payments.status.paid'),      count: completed.length, amount: totalRevenue,  color: 'bg-emerald-500', pct: orders.length ? Math.round(completed.length / orders.length * 100) : 0 },
                  { label: t('admin.payments.status.pending'),   count: pending.length,   amount: totalPending,  color: 'bg-amber-400',   pct: orders.length ? Math.round(pending.length   / orders.length * 100) : 0 },
                  { label: t('admin.payments.status.cancelled'), count: cancelled.length, amount: 0,             color: 'bg-red-400',     pct: orders.length ? Math.round(cancelled.length  / orders.length * 100) : 0 },
                ].map(({ label, count, amount, color, pct }) => (
                  <div key={label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{label}</span>
                      <span className="text-muted-foreground">{count} · {fmtMAD(amount)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground text-right">{pct}%</p>
                  </div>
                ))
              )}
              <div className="pt-3 border-t border-border flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t('admin.payments.total.orders')}</span>
                <span className="font-bold text-foreground">{orders.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Per-student balances ──────────────────────────────── */}
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              {t('admin.payments.student.balance')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-5 space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
              </div>
            ) : studentSummary.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p>{t('admin.payments.no.payments')}</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {studentSummary.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/20 transition-colors">
                    <span className="text-sm font-bold text-muted-foreground w-6 text-center shrink-0">{i + 1}</span>
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.email} · {s.orders} {s.orders > 1 ? t('admin.payments.orders') : t('admin.payments.order')}
                      </p>
                    </div>
                    {s.totalPending > 0 && (
                      <div className="text-right shrink-0">
                        <p className="text-xs text-amber-600 font-medium">{t('admin.payments.status.pending')}</p>
                        <p className="text-sm font-bold text-amber-600">{fmtMAD(s.totalPending)}</p>
                      </div>
                    )}
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">{t('admin.payments.total.paid')}</p>
                      <p className="text-base font-bold text-emerald-600">{fmtMAD(s.totalPaid)}</p>
                    </div>
                    <Link to={`/admin/students/${s.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── All orders table ─────────────────────────────────── */}
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              {t('admin.payments.all.orders')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={`${t('admin.payments.col.student')}, email...`}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { value: 'all',       label: t('admin.payments.filter.all')          },
                  { value: 'completed', label: t('admin.payments.status.paid')          },
                  { value: 'pending',   label: t('admin.payments.status.pending')       },
                  { value: 'cancelled', label: t('admin.payments.status.cancelled')     },
                ].map(({ value, label }) => (
                  <Button key={value}
                    variant={filterStatus === value ? 'default' : 'outline'}
                    size="sm" className="text-xs"
                    onClick={() => setFilterStatus(value)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t('admin.payments.col.ref')}</th>
                    <th>{t('admin.payments.col.student')}</th>
                    <th>{t('admin.payments.col.products')}</th>
                    <th>{t('admin.payments.col.amount')}</th>
                    <th>{t('admin.payments.col.status')}</th>
                    <th>{t('admin.payments.col.date')}</th>
                    <th className="text-right">{t('admin.payments.col.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                        <td key={j}><Skeleton className="h-4 w-full" /></td>
                      ))}</tr>
                    ))
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-muted-foreground">
                        <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p>{t('admin.payments.no.orders')}</p>
                      </td>
                    </tr>
                  ) : (
                    paginated.map(o => {
                      const cfg = STATUS_CFG[o.status] || STATUS_CFG.pending;
                      const StatusIcon = cfg.icon;
                      const products = o.expand?.products || [];
                      return (
                        <tr key={o.id} className="hover:bg-muted/20 transition-colors">
                          <td>
                            <span className="font-mono text-xs font-bold text-primary">
                              #{o.id.slice(0, 8).toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                {o._studentName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-foreground text-sm leading-tight">{o._studentName}</p>
                                <p className="text-[10px] text-muted-foreground">{o._studentEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="max-w-[180px]">
                            {products.length > 0 ? (
                              <p className="text-sm text-muted-foreground truncate">
                                {products.map(p => p.nom || p.name || 'Produit').join(', ')}
                              </p>
                            ) : <span className="text-muted-foreground text-xs">—</span>}
                          </td>
                          <td>
                            <span className="font-bold text-foreground">{fmtMAD(o.total_price)}</span>
                          </td>
                          <td>
                            <Badge variant="outline" className={`gap-1 text-xs ${cfg.cls}`}>
                              <StatusIcon className="w-3 h-3" />
                              {cfg.label}
                            </Badge>
                          </td>
                          <td className="text-muted-foreground text-sm whitespace-nowrap">
                            {new Date(o.created).toLocaleDateString(
                              language === 'ar-MA' ? 'ar-MA' : language === 'en' ? 'en-GB' : 'fr-FR',
                              { day: '2-digit', month: 'short', year: 'numeric' }
                            )}
                          </td>
                          <td className="text-right">
                            <Link to={`/admin/students/${o.user_id}`}>
                              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                                <Eye className="w-3.5 h-3.5" /> {t('admin.payments.profile')}
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && filtered.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {t('admin.payments.page')} {page} {t('admin.payments.of')} {totalPages} · {filtered.length} {t('admin.payments.results')}
                </p>
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
                      acc.push(p); return acc;
                    }, [])
                    .map((p, i) => p === '…'
                      ? <span key={`d${i}`} className="px-1 text-muted-foreground text-sm">…</span>
                      : <Button key={p} variant={page === p ? 'default' : 'outline'} size="sm"
                          onClick={() => setPage(p)} className="w-9 h-9">{p}</Button>
                    )}
                  <Button variant="outline" size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Grand total footer */}
            {!loading && filtered.length > 0 && (
              <div className="flex items-center justify-between px-6 py-3 bg-muted/30 border-t border-border">
                <span className="text-sm font-semibold text-muted-foreground">
                  {t('admin.payments.grand.total')}
                </span>
                <div className="flex items-center gap-6">
                  <span className="text-sm text-muted-foreground">
                    {t('admin.payments.grand.paid')}{' '}
                    <span className="font-bold text-emerald-600">
                      {fmtMAD(filtered.filter(o => o.status === 'completed').reduce((s, o) => s + (o.total_price || 0), 0))}
                    </span>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {t('admin.payments.grand.pending')}{' '}
                    <span className="font-bold text-amber-600">
                      {fmtMAD(filtered.filter(o => o.status === 'pending').reduce((s, o) => s + (o.total_price || 0), 0))}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPaymentsPage;
