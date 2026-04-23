import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import DashboardLayout from '@/components/DashboardLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Globe, Package, ArrowRight, Clock, CheckCircle2, AlertCircle, Star } from 'lucide-react';

const STATUS_CFG = {
  completed: { label: 'Payé ✓',      cls: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  pending:   { label: 'En attente',  cls: 'bg-amber-100   text-amber-700   border-amber-300'   },
  cancelled: { label: 'Annulé',      cls: 'bg-red-100     text-red-700     border-red-300'     },
};

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

const StatCard = ({ icon: Icon, label, value, color, loading }) => (
  <div className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color.bg}`}>
      <Icon className={`w-5 h-5 ${color.text}`} />
    </div>
    {loading
      ? <Skeleton className="h-8 w-20 mb-1" />
      : <p className={`text-3xl font-black ${color.text}`}>{value}</p>
    }
    <p className="text-sm font-medium text-foreground mt-0.5">{label}</p>
  </div>
);

const ClientDashboardPage = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders]       = useState([]);
  const [webOrders, setWebOrders] = useState([]);
  const [loading, setLoading]     = useState(true);

  const displayName = currentUser
    ? (`${currentUser.prenom || ''} ${currentUser.nom || currentUser.name || ''}`.trim() || currentUser.name || 'Client')
    : 'Client';

  useEffect(() => {
    if (!currentUser?.id) return;
    const uid = currentUser.id;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [ord, web] = await Promise.allSettled([
          pb.collection('orders').getFullList({ filter: `user_id="${uid}"`, sort: '-created', requestKey: null }),
          pb.collection('web_orders').getFullList({ filter: `user_id="${uid}"`, sort: '-created', requestKey: null }),
        ]);
        setOrders(ord.status === 'fulfilled' ? ord.value : []);
        setWebOrders(web.status === 'fulfilled' ? web.value : []);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [currentUser?.id]);

  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const pendingOrders   = orders.filter(o => o.status === 'pending').length;
  const totalSpent      = orders
    .filter(o => o.status === 'completed')
    .reduce((s, o) => s + (parseFloat(o.total_amount) || 0), 0);

  const recentOrders   = orders.slice(0, 3);
  const recentWebOrders = webOrders.slice(0, 2);

  return (
    <>
      <Helmet><title>Espace Client — IWS LAAYOUNE</title></Helmet>
      <DashboardLayout>
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            {getGreeting()}, <span className="text-primary">{displayName}</span> 👋
          </h1>
          <p className="text-muted-foreground mt-1">Bienvenue dans votre espace client IWS.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={ShoppingBag}   label="Commandes"       value={orders.length}    color={{ bg: 'bg-blue-50',    text: 'text-blue-600'    }} loading={loading} />
          <StatCard icon={CheckCircle2}  label="Payées"          value={completedOrders}  color={{ bg: 'bg-emerald-50', text: 'text-emerald-600' }} loading={loading} />
          <StatCard icon={Clock}         label="En attente"      value={pendingOrders}     color={{ bg: 'bg-amber-50',   text: 'text-amber-600'   }} loading={loading} />
          <StatCard icon={Star}          label="Total dépensé"   value={`${totalSpent.toFixed(0)} MAD`} color={{ bg: 'bg-purple-50', text: 'text-purple-600' }} loading={loading} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Commandes magasin */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" /> Commandes magasin
              </CardTitle>
              <Link to="/client/orders">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  Tout voir <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucune commande pour l'instant</p>
                  <Link to="/store">
                    <Button variant="outline" size="sm" className="mt-3">Visiter le magasin</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map(o => {
                    const cfg = STATUS_CFG[o.status] || STATUS_CFG.pending;
                    const date = new Date(o.created).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
                    return (
                      <div key={o.id} className="flex items-center justify-between p-3 bg-muted rounded-xl">
                        <div>
                          <p className="text-sm font-medium">Commande #{o.id.slice(-6).toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground">{date} · {parseFloat(o.total_amount || 0).toFixed(2)} MAD</p>
                        </div>
                        <Badge className={`text-xs border ${cfg.cls}`}>{cfg.label}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Projets Web Agency */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" /> Projets Web
              </CardTitle>
              <Link to="/agence">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  Commander <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
              ) : recentWebOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucun projet web en cours</p>
                  <Link to="/agence">
                    <Button variant="outline" size="sm" className="mt-3">Créer votre site</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentWebOrders.map(o => {
                    const cfg = WEB_STATUS[o.status] || WEB_STATUS.nouveau;
                    const date = new Date(o.created).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
                    return (
                      <div key={o.id} className="flex items-center justify-between p-3 bg-muted rounded-xl">
                        <div>
                          <p className="text-sm font-medium">{o.project_name || o.service_type || 'Projet Web'}</p>
                          <p className="text-xs text-muted-foreground">{date}</p>
                        </div>
                        <Badge className={`text-xs border ${cfg.cls}`}>{cfg.label}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* CTA rapides */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { to: '/store',   label: '🛍️ Magasin',      desc: 'Parcourir nos produits' },
            { to: '/agence',  label: '💻 Web Agency',   desc: 'Créer votre présence en ligne' },
            { to: '/studio',  label: '🎵 Studio',       desc: 'Réserver une session musicale' },
          ].map(cta => (
            <Link key={cta.to} to={cta.to} className="block group">
              <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-sm transition-all">
                <p className="font-semibold text-foreground">{cta.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{cta.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </DashboardLayout>
    </>
  );
};

export default ClientDashboardPage;
