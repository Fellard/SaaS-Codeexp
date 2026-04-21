
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import DashboardLayout from '@/components/DashboardLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ReceiptModal from '@/components/ReceiptModal.jsx';
import {
  ShoppingBag, CheckCircle2, Clock, XCircle, CreditCard,
  Printer, GraduationCap, ArrowRight, TrendingUp, Globe,
  Monitor, Layers, Code2, Import,
} from 'lucide-react';

const WEB_STATUS = {
  nouveau:       { label: 'Nouveau',       cls: 'bg-blue-100 text-blue-700 border-blue-200',       icon: Clock },
  en_discussion: { label: 'En discussion', cls: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
  en_cours:      { label: 'En cours',      cls: 'bg-purple-100 text-purple-700 border-purple-200', icon: Clock },
  'livré':       { label: 'Livré ✓',       cls: 'bg-green-100 text-green-700 border-green-200',    icon: CheckCircle2 },
  'payé':        { label: 'Payé ✓',        cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  'annulé':      { label: 'Annulé',        cls: 'bg-red-100 text-red-700 border-red-200',          icon: XCircle },
};

const TECH_ICON = { wordpress: Layers, iws_builder: Monitor, node: Code2, import: Import };
const TECH_LABEL = { wordpress: 'WordPress', iws_builder: 'IWS Builder', node: 'Sur mesure', import: 'Import projet' };

// ── Status config ─────────────────────────────────────────────────
const ORDER_STATUS = {
  completed: { label: 'Payé',       cls: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: CheckCircle2 },
  pending:   { label: 'En attente', cls: 'bg-amber-100   text-amber-700   border-amber-300',   icon: Clock        },
  cancelled: { label: 'Annulé',     cls: 'bg-red-100     text-red-700     border-red-300',     icon: XCircle      },
};

const FILTER_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  { value: 'completed', label: 'Payé' },
  { value: 'cancelled', label: 'Annulé' },
];

const OrdersPage = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders]         = useState([]);
  const [webOrders, setWebOrders]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('all');
  const [receipt, setReceipt]       = useState(null);

  const displayName = currentUser
    ? (`${currentUser.prenom || ''} ${currentUser.nom || currentUser.name || ''}`.trim() || currentUser.name || 'Étudiant')
    : '';

  useEffect(() => {
    if (!currentUser) return;
    const load = async () => {
      setLoading(true);
      try {
        const [formationOrders, webRes] = await Promise.all([
          pb.collection('orders').getFullList({
            filter: `user_id="${currentUser.id}"`,
            sort: '-created',
            expand: 'course_id',
            requestKey: null,
          }).catch(() => []),
          // PocketBase v0.36 bug : sort + filter → 400, created non retourné automatiquement
          // Solution : champs explicites + tri client-side
          pb.collection('web_orders').getList(1, 200, {
            filter: `client_id = "${currentUser.id}"`,
            fields: 'id,created,updated,client_id,service_nom,tech_choice,domain_name,statut,montant',
            requestKey: null,
          }).then(r => r.items.sort((a, b) => new Date(b.created) - new Date(a.created))).catch(() => []),
        ]);
        setOrders(formationOrders);
        setWebOrders(webRes);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    load();
  }, [currentUser]);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const totalPaid    = orders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.total_price || 0), 0);
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  // Total global : formation + web agency
  const totalCommandes = orders.length + webOrders.length;

  const buildReceipt = (order) => ({
    id: order.id,
    ref: order.id.slice(0, 8).toUpperCase(),
    date: new Date(order.created).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
    service: currentUser?.section
      ? `Programme ${currentUser.section.charAt(0).toUpperCase() + currentUser.section.slice(1)}`
      : 'Centre de Formation',
    studentName: displayName,
    studentEmail: currentUser?.email || '',
    items: [{ label: currentUser?.current_course || 'Formation IWS', qty: 1, unitPrice: order.total_price || 0 }],
    total: order.total_price || 0,
    status: order.status === 'completed' ? 'paid' : order.status === 'cancelled' ? 'cancelled' : 'pending',
    paymentMethod: order.payment_method || 'Espèces',
  });

  return (
    <DashboardLayout>
      <Helmet><title>Mes Commandes — IWS LAAYOUNE</title></Helmet>

      <ReceiptModal
        open={!!receipt}
        onClose={() => setReceipt(null)}
        receipt={receipt}
        companyName="IWS — Centre de Formation"
      />

      <div className="space-y-6 max-w-4xl mx-auto">

        {/* ── Stats ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: ShoppingBag,  label: 'Total commandes', value: loading ? '…' : totalCommandes,   color: { bg: 'bg-indigo-100', text: 'text-indigo-600' } },
            { icon: TrendingUp,   label: 'Total payé',      value: loading ? '…' : `${totalPaid} MAD`, color: { bg: 'bg-emerald-100', text: 'text-emerald-600' } },
            { icon: Clock,        label: 'En attente',      value: loading ? '…' : pendingCount,      color: { bg: 'bg-amber-100', text: 'text-amber-600' } },
          ].map(s => (
            <div key={s.label} className="bg-card rounded-2xl border border-border p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${s.color.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-5 h-5 ${s.color.text}`} />
              </div>
              <p className={`text-2xl font-black ${s.color.text}`}>{s.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Web Agency Orders ────────────────────────────── */}
        {(loading || webOrders.length > 0) && (
          <Card className="border border-blue-200 bg-blue-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                Commandes Web Agency
                {!loading && <span className="text-sm font-normal text-muted-foreground ml-1">({webOrders.length})</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-3"><Skeleton className="h-16 rounded-xl" /></div>
              ) : webOrders.length === 0 ? null : (
                <div className="divide-y divide-blue-100">
                  {webOrders.map(o => {
                    const st = WEB_STATUS[o.statut] || WEB_STATUS['nouveau'];
                    const StatusIcon = st.icon;
                    const TechIcon = TECH_ICON[o.tech_choice] || Globe;
                    return (
                      <div key={o.id} className="flex items-center gap-4 p-4 hover:bg-blue-50/50 transition-colors">
                        <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <TechIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm">
                            {o.service_nom || 'Site web'} — {TECH_LABEL[o.tech_choice] || o.tech_choice}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {o.created ? new Date(o.created).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                          </p>
                          {o.domain_name && (
                            <p className="text-xs text-blue-600 mt-0.5">🌐 {o.domain_name}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          {o.montant > 0 && (
                            <p className="font-black text-foreground text-base">{o.montant.toLocaleString('fr-FR')} MAD</p>
                          )}
                          <Badge variant="outline" className={`text-xs gap-1 ${st.cls}`}>
                            <StatusIcon className="w-3 h-3" /> {st.label}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Order list ───────────────────────────────────── */}
        <Card className="border border-border">
          <CardHeader className="pb-3 flex flex-row items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary" />
              Mes Commandes
              {!loading && <span className="text-sm font-normal text-muted-foreground ml-1">({orders.length})</span>}
            </CardTitle>
            {/* Filter pills */}
            <div className="flex flex-wrap gap-2">
              {FILTER_OPTIONS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filter === f.value
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-14">
                <ShoppingBag className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="font-semibold text-foreground mb-1">
                  {orders.length === 0 ? 'Aucune commande' : 'Aucune commande dans cette catégorie'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {orders.length === 0
                    ? 'Inscrivez-vous à une formation pour créer votre première commande'
                    : 'Essayez un autre filtre'}
                </p>
                {orders.length === 0 && (
                  <Link to="/formation/inscription">
                    <Button className="bg-accent hover:bg-accent/90 text-primary font-bold rounded-xl gap-2">
                      <GraduationCap className="w-4 h-4" /> S'inscrire à une formation
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map(o => {
                  const st   = ORDER_STATUS[o.status] || ORDER_STATUS.pending;
                  const Icon = st.icon;
                  return (
                    <div key={o.id} className="flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors">
                      {/* Status icon */}
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        o.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                        o.status === 'pending'   ? 'bg-amber-100   text-amber-600'   :
                                                   'bg-red-100     text-red-600'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground text-sm">
                            Commande #{o.id.slice(0, 8).toUpperCase()}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(o.created).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        {/* Nom du cours : depuis expand course_id, ou note, ou current_course */}
                        {(o.expand?.course_id?.titre || o.expand?.course_id?.title || o.note || currentUser?.current_course) && (
                          <p className="text-xs text-primary/80 font-medium mt-0.5 truncate">
                            📚 {
                              o.expand?.course_id?.titre ||
                              o.expand?.course_id?.title ||
                              (o.note?.replace('Accès cours : ', '')) ||
                              currentUser.current_course
                            }
                          </p>
                        )}
                      </div>

                      {/* Amount + status + receipt */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <p className="font-black text-foreground text-base">
                          {(o.total_price || 0).toLocaleString('fr-FR')} MAD
                        </p>
                        <Badge variant="outline" className={`text-xs gap-1 ${st.cls}`}>
                          <Icon className="w-3 h-3" /> {st.label}
                        </Badge>
                        {o.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs gap-1 text-primary hover:bg-primary/10"
                            onClick={() => setReceipt(buildReceipt(o))}
                          >
                            <Printer className="w-3.5 h-3.5" /> Reçu
                          </Button>
                        )}
                        {o.status === 'pending' && (
                          <Link to={
                            // Rediriger vers le cours spécifique si course_id disponible
                            o.course_id
                              ? `/dashboard/courses/${o.course_id}/view`
                              : '/dashboard/courses'
                          }>
                            <Button size="sm" className="h-7 px-2 text-xs gap-1 bg-amber-500 hover:bg-amber-600 text-white">
                              <CreditCard className="w-3.5 h-3.5" /> Payer
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Total footer */}
                {orders.length > 0 && totalPaid > 0 && (
                  <div className="flex items-center justify-between px-5 py-3 bg-muted/30">
                    <span className="text-sm font-semibold text-muted-foreground">Total des paiements confirmés</span>
                    <span className="font-black text-lg text-emerald-600">{totalPaid.toLocaleString('fr-FR')} MAD</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default OrdersPage;
