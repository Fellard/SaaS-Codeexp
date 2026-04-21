import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import AdminLayout from '@/components/AdminLayout.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Globe, LayoutDashboard, ShoppingCart, Users, CreditCard,
  Wrench, Plus, Pencil, Trash2, X, Check, Clock, Eye,
  CheckCircle2, XCircle, Wallet, TrendingUp, AlertCircle,
  Phone, Mail, ExternalLink, ChevronDown, ChevronUp,
  Monitor, Code2, Import, Layers, Search, RefreshCw,
  ArrowRight, FileText, Star,
} from 'lucide-react';

// ── Constantes ────────────────────────────────────────────────────────────────
const ORDER_STATUS = {
  'nouveau':       { label: 'Nouveau',        color: 'bg-blue-100 text-blue-700 border-blue-200',       icon: Clock },
  'en_discussion': { label: 'En discussion',  color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: AlertCircle },
  'en_cours':      { label: 'En cours',       color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Wrench },
  'livré':         { label: 'Livré ✓',        color: 'bg-green-100 text-green-700 border-green-200',    icon: CheckCircle2 },
  'payé':          { label: 'Payé ✓',         color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Wallet },
  'annulé':        { label: 'Annulé',         color: 'bg-red-100 text-red-700 border-red-200',          icon: XCircle },
};

const TECH_LABELS = {
  iws_builder: { label: 'IWS Builder',       icon: Monitor, color: 'text-blue-600 bg-blue-50' },
  wordpress:   { label: 'WordPress',          icon: Layers,  color: 'text-indigo-600 bg-indigo-50' },
  import:      { label: 'Import projet',      icon: Import,  color: 'text-orange-600 bg-orange-50' },
  node:        { label: 'Node.js / Sur mesure', icon: Code2, color: 'text-green-600 bg-green-50' },
};

const DOMAIN_STATUS = {
  a_acheter:       'À acheter (Hostinger)',
  deja_proprietaire: 'Déjà propriétaire',
  non_defini:      'Non défini',
};

const TABS = [
  { id: 'overview',  label: 'Vue d\'ensemble', icon: LayoutDashboard },
  { id: 'commandes', label: 'Commandes',        icon: ShoppingCart },
  { id: 'services',  label: 'Services',         icon: Wrench },
  { id: 'clients',   label: 'Clients',          icon: Users },
  { id: 'paiements', label: 'Paiements',        icon: CreditCard },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const StatusBadge = ({ statut }) => {
  const cfg = ORDER_STATUS[statut] || ORDER_STATUS['nouveau'];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  );
};

const TechBadge = ({ tech }) => {
  const cfg = TECH_LABELS[tech];
  if (!cfg) return <span className="text-xs text-muted-foreground">—</span>;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  );
};

// ── Modal Service ─────────────────────────────────────────────────────────────
const ServiceModal = ({ service, onClose, onSaved }) => {
  const [form, setForm] = useState({
    nom:         service?.nom         || '',
    description: service?.description || '',
    prix_base:   service?.prix_base   || '',
    categorie:   service?.categorie   || 'vitrine',
    delai_jours: service?.delai_jours || 14,
    actif:       service?.actif !== false,
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!form.nom.trim() || !form.prix_base) return toast.error('Nom et prix requis');
    setLoading(true);
    try {
      const data = {
        nom: form.nom.trim(),
        description: form.description.trim(),
        prix_base: parseFloat(form.prix_base),
        categorie: form.categorie,
        delai_jours: parseInt(form.delai_jours) || 14,
        actif: form.actif,
      };
      if (service?.id) {
        await pb.collection('web_services').update(service.id, data, { requestKey: null });
        toast.success('Service mis à jour');
      } else {
        await pb.collection('web_services').create(data, { requestKey: null });
        toast.success('Service créé');
      }
      onSaved();
      onClose();
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const CATEGORIES = [
    { value: 'vitrine',    label: 'Site vitrine' },
    { value: 'ecommerce',  label: 'E-commerce' },
    { value: 'wordpress',  label: 'WordPress' },
    { value: 'sur_mesure', label: 'Sur mesure' },
    { value: 'maintenance',label: 'Maintenance' },
    { value: 'seo',        label: 'SEO / Marketing' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-bold">{service?.id ? 'Modifier le service' : 'Nouveau service'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Nom *</label>
            <input value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))}
              className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ex: Site vitrine professionnel" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
              className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Description du service..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Prix à partir de (MAD) *</label>
              <input type="number" value={form.prix_base} onChange={e => setForm(p => ({ ...p, prix_base: e.target.value }))}
                className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="1500" min="0" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Délai livraison (jours)</label>
              <input type="number" value={form.delai_jours} onChange={e => setForm(p => ({ ...p, delai_jours: e.target.value }))}
                className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="14" min="1" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Catégorie</label>
            <select value={form.categorie} onChange={e => setForm(p => ({ ...p, categorie: e.target.value }))}
              className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={form.actif} onChange={e => setForm(p => ({ ...p, actif: e.target.checked }))} className="accent-blue-600 w-4 h-4" />
            <span className="text-sm text-foreground font-medium">Service actif (visible sur le site)</span>
          </label>
        </div>
        <div className="flex gap-3 p-6 pt-0">
          <Button variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
          <Button onClick={handleSave} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Modal Commande ────────────────────────────────────────────────────────────
const OrderModal = ({ order, services, users, onClose, onUpdate }) => {
  const svc  = services.find(s => s.id === order.service_id);
  const user = users.find(u => u.id === order.client_id);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState(order.notes_admin || '');
  const [urlProjet, setUrlProjet] = useState(order.url_projet || '');
  const [montant, setMontant] = useState(order.montant || svc?.prix_base || '');

  const updateStatus = async (statut) => {
    setLoading(true);
    try {
      await pb.collection('web_orders').update(order.id, { statut, notes_admin: notes, url_projet: urlProjet, montant: parseFloat(montant) || 0 }, { requestKey: null });
      toast.success(`Statut → ${ORDER_STATUS[statut]?.label}`);
      onUpdate();
      onClose();
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const saveNotes = async () => {
    setLoading(true);
    try {
      await pb.collection('web_orders').update(order.id, { notes_admin: notes, url_projet: urlProjet, montant: parseFloat(montant) || 0 }, { requestKey: null });
      toast.success('Sauvegardé');
      onUpdate();
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
          <h2 className="text-lg font-bold">Commande #{order.id.slice(-6).toUpperCase()}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-5">
          {/* Status + montant */}
          <div className="flex items-center justify-between">
            <StatusBadge statut={order.statut} />
            <TechBadge tech={order.tech_choice} />
          </div>

          {/* Infos client */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-blue-700 mb-2">👤 Client</p>
            <p className="text-sm font-bold text-foreground">{order.client_nom || user?.name || user?.nom || 'Inconnu'}</p>
            {(order.client_tel || user?.phone) && (
              <a href={`tel:${order.client_tel || user?.phone}`} className="flex items-center gap-2 text-sm text-blue-700 font-medium">
                <Phone className="w-3.5 h-3.5" />{order.client_tel || user?.phone}
              </a>
            )}
            {user?.email && (
              <a href={`mailto:${user.email}`} className="flex items-center gap-2 text-sm text-blue-700 font-medium">
                <Mail className="w-3.5 h-3.5" />{user.email}
              </a>
            )}
          </div>

          {/* Détails commande */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span className="font-medium">{svc?.nom || order.service_nom || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Domaine</span><span className="font-medium">{order.domain_name || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Statut domaine</span><span className="font-medium text-xs">{DOMAIN_STATUS[order.domain_status] || '—'}</span></div>
            {order.brief && (
              <div className="bg-muted rounded-lg p-3 mt-2">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Brief client :</p>
                <p className="text-sm text-foreground">{order.brief}</p>
              </div>
            )}
          </div>

          {/* Montant */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Montant (MAD)</label>
            <input type="number" value={montant} onChange={e => setMontant(e.target.value)}
              className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Montant convenu avec le client" />
          </div>

          {/* URL projet */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">URL du projet livré</label>
            <input value={urlProjet} onChange={e => setUrlProjet(e.target.value)}
              className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="https://client.com" />
          </div>

          {/* Notes admin */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes internes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Notes internes, remarques, suivi..." />
          </div>

          <Button onClick={saveNotes} disabled={loading} variant="outline" className="w-full text-sm">
            Sauvegarder notes & montant
          </Button>

          {/* Actions statut */}
          <div className="border-t border-border pt-4">
            <p className="text-xs font-bold text-muted-foreground mb-3">Changer le statut :</p>
            <div className="grid grid-cols-2 gap-2">
              {order.statut === 'nouveau' && <>
                <Button size="sm" onClick={() => updateStatus('en_discussion')} disabled={loading} className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs">En discussion</Button>
                <Button size="sm" variant="outline" onClick={() => updateStatus('annulé')} disabled={loading} className="text-red-600 border-red-200 hover:bg-red-50 text-xs"><X className="w-3 h-3 mr-1" />Annuler</Button>
              </>}
              {order.statut === 'en_discussion' && <>
                <Button size="sm" onClick={() => updateStatus('en_cours')} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white text-xs"><Wrench className="w-3 h-3 mr-1" />Démarrer</Button>
                <Button size="sm" variant="outline" onClick={() => updateStatus('annulé')} disabled={loading} className="text-red-600 border-red-200 hover:bg-red-50 text-xs"><X className="w-3 h-3 mr-1" />Annuler</Button>
              </>}
              {order.statut === 'en_cours' && <>
                <Button size="sm" onClick={() => updateStatus('livré')} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white text-xs"><Check className="w-3 h-3 mr-1" />Marquer livré</Button>
              </>}
              {order.statut === 'livré' && <>
                <Button size="sm" onClick={() => updateStatus('payé')} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs col-span-2"><Wallet className="w-3 h-3 mr-1" />💰 Encaisser {montant ? `${montant} MAD` : ''}</Button>
              </>}
              {(order.statut === 'payé' || order.statut === 'annulé') && (
                <p className="text-xs text-muted-foreground col-span-2 text-center py-2">Statut final</p>
              )}
            </div>
            {/* Paiement rapide depuis n'importe quel statut non final */}
            {order.statut !== 'payé' && order.statut !== 'annulé' && (
              <Button size="sm" onClick={() => updateStatus('payé')} disabled={loading}
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold">
                <Wallet className="w-3 h-3 mr-1.5" />💰 Encaisser directement {montant ? `${montant} MAD` : ''}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Tab: Vue d'ensemble ───────────────────────────────────────────────────────
const OverviewTab = ({ orders, services, users, onTabChange }) => {
  const total     = orders.length;
  const nouveaux  = orders.filter(o => o.statut === 'nouveau').length;
  const enCours   = orders.filter(o => o.statut === 'en_cours').length;
  const livres    = orders.filter(o => o.statut === 'livré').length;
  const caTotal   = orders.filter(o => o.statut === 'payé').reduce((s, o) => s + (o.montant || 0), 0);
  const pipeline  = orders.filter(o => ['nouveau','en_discussion','en_cours','livré'].includes(o.statut)).reduce((s, o) => s + (o.montant || 0), 0);

  const stats = [
    { label: 'Total commandes', value: total,             icon: ShoppingCart, color: 'text-blue-600',    bg: 'bg-blue-50' },
    { label: 'Nouvelles',       value: nouveaux,          icon: Clock,        color: 'text-yellow-600',  bg: 'bg-yellow-50' },
    { label: 'En production',   value: enCours,           icon: Wrench,       color: 'text-purple-600',  bg: 'bg-purple-50' },
    { label: 'Livrés',          value: livres,            icon: CheckCircle2, color: 'text-green-600',   bg: 'bg-green-50' },
    { label: 'CA encaissé',     value: `${caTotal} MAD`,  icon: Wallet,       color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pipeline',        value: `${pipeline} MAD`, icon: TrendingUp,   color: 'text-indigo-600',  bg: 'bg-indigo-50' },
  ];

  const recent = [...orders].sort((a, b) => new Date(b.created) - new Date(a.created)).slice(0, 6);

  const techStats = Object.keys(TECH_LABELS).map(k => ({
    tech: k,
    count: orders.filter(o => o.tech_choice === k).length,
    ...TECH_LABELS[k],
  })).filter(t => t.count > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border border-border">
              <CardContent className="p-4">
                <div className={`p-2 rounded-xl ${s.bg} w-fit mb-3`}>
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-tight">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Commandes récentes */}
        <div className="md:col-span-2">
          <Card className="border border-border">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Commandes récentes</CardTitle>
              <button onClick={() => onTabChange('commandes')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">Voir tout <ArrowRight className="w-3 h-3" /></button>
            </CardHeader>
            <CardContent className="p-0">
              {recent.length === 0 ? (
                <div className="text-center py-10 text-sm text-muted-foreground">Aucune commande</div>
              ) : (
                <div className="divide-y divide-border">
                  {recent.map(o => {
                    const svc  = services.find(s => s.id === o.service_id);
                    const user = users.find(u => u.id === o.client_id);
                    return (
                      <div key={o.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{o.client_nom || user?.name || 'Client'}</p>
                          <p className="text-xs text-muted-foreground">{svc?.nom || o.service_nom || '—'}</p>
                        </div>
                        <TechBadge tech={o.tech_choice} />
                        <StatusBadge statut={o.statut} />
                        {o.montant > 0 && <span className="text-sm font-bold text-blue-600 whitespace-nowrap">{o.montant} MAD</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Technos + Services */}
        <div className="space-y-4">
          <Card className="border border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Technologies demandées</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {techStats.length === 0 ? <p className="text-xs text-muted-foreground">Aucune donnée</p> : techStats.map(t => {
                const Icon = t.icon;
                return (
                  <div key={t.tech} className="flex items-center gap-2">
                    <span className={`p-1 rounded-md ${t.color.split(' ')[1]}`}><Icon className={`w-3 h-3 ${t.color.split(' ')[0]}`} /></span>
                    <span className="text-xs text-foreground flex-1">{t.label}</span>
                    <span className="text-xs font-bold text-foreground">{t.count}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Services actifs</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {services.filter(s => s.actif !== false).slice(0, 5).map(s => (
                <div key={s.id} className="flex items-center justify-between">
                  <span className="text-xs text-foreground truncate flex-1">{s.nom}</span>
                  <span className="text-xs font-bold text-blue-600 ml-2">{s.prix_base} MAD</span>
                </div>
              ))}
              {services.length === 0 && <p className="text-xs text-muted-foreground">Aucun service</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Raccourcis actions */}
      <Card className="border border-border bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-5">
          <p className="text-sm font-bold text-foreground mb-3">Actions rapides</p>
          <div className="flex flex-wrap gap-3">
            <a href="/agence/commande" target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <ExternalLink className="w-3.5 h-3.5" />Voir le formulaire client
              </Button>
            </a>
            <a href="/agence" target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
                <Globe className="w-3.5 h-3.5" />Page Web Agency publique
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ── Tab: Commandes ────────────────────────────────────────────────────────────
const CommandesTab = ({ orders, services, users, onUpdate }) => {
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = orders
    .filter(o => filterStatus ? o.statut === filterStatus : true)
    .filter(o => {
      if (!search) return true;
      const q = search.toLowerCase();
      const user = users.find(u => u.id === o.client_id);
      return (o.client_nom || user?.name || '').toLowerCase().includes(q)
        || (o.domain_name || '').toLowerCase().includes(q)
        || (o.service_nom || '').toLowerCase().includes(q);
    })
    .sort((a, b) => new Date(b.created) - new Date(a.created));

  const handleQuickEncaisser = async (o) => {
    try {
      await pb.collection('web_orders').update(o.id, { statut: 'payé' }, { requestKey: null });
      toast.success('💰 Paiement enregistré');
      onUpdate();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="space-y-4">
      {selected && (
        <OrderModal order={selected} services={services} users={users}
          onClose={() => setSelected(null)} onUpdate={() => { onUpdate(); setSelected(null); }} />
      )}

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher client, domaine..."
            className="w-full pl-9 pr-3 py-2 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[{ v: '', l: `Tout (${orders.length})` }, ...Object.entries(ORDER_STATUS).map(([v, c]) => ({ v, l: `${c.label} (${orders.filter(o => o.statut === v).length})` }))].map(({ v, l }) => (
            <button key={v} onClick={() => setFilterStatus(v)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${filterStatus === v ? 'bg-blue-600 text-white border-blue-600' : 'bg-background text-muted-foreground border-border hover:border-blue-300'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border">
          <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aucune commande</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(o => {
            const svc  = services.find(s => s.id === o.service_id);
            const user = users.find(u => u.id === o.client_id);
            const isPaid = o.statut === 'payé';
            const isCancelled = o.statut === 'annulé';

            return (
              <div key={o.id} className={`flex flex-col gap-3 p-4 bg-card border rounded-xl transition-colors ${
                isPaid ? 'border-emerald-200 bg-emerald-50/20' :
                o.statut === 'nouveau' ? 'border-blue-200 bg-blue-50/20' :
                'border-border hover:border-blue-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-bold text-foreground">{o.client_nom || user?.name || 'Client inconnu'}</p>
                      <StatusBadge statut={o.statut} />
                      <TechBadge tech={o.tech_choice} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{svc?.nom || o.service_nom || '—'}</span>
                      {o.domain_name && <> · {o.domain_name}</>}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-1">
                      {o.client_tel && (
                        <a href={`tel:${o.client_tel}`} className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                          <Phone className="w-3 h-3" />{o.client_tel}
                        </a>
                      )}
                      {user?.email && (
                        <a href={`mailto:${user.email}`} className="text-xs text-muted-foreground hover:text-blue-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />{user.email}
                        </a>
                      )}
                    </div>
                  </div>
                  {o.montant > 0 && (
                    <span className={`text-base font-extrabold whitespace-nowrap ${isPaid ? 'text-emerald-600' : 'text-blue-600'}`}>
                      {o.montant} MAD
                    </span>
                  )}
                </div>

                {!isCancelled && !isPaid && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                    <Button size="sm" variant="ghost" onClick={() => setSelected(o)} className="text-xs text-muted-foreground h-7 px-2">
                      <Eye className="w-3 h-3 mr-1" />Gérer
                    </Button>
                    <Button size="sm" onClick={() => handleQuickEncaisser(o)}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-3 ml-auto">
                      <Wallet className="w-3 h-3 mr-1" />💰 Encaisser
                    </Button>
                  </div>
                )}

                {isPaid && (
                  <div className="flex items-center gap-2 pt-2 border-t border-emerald-200 text-xs text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />Payé — {o.montant} MAD encaissés
                    {o.url_projet && <a href={o.url_projet} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-1 text-blue-600 hover:underline"><ExternalLink className="w-3 h-3" />Voir le site</a>}
                  </div>
                )}

                {isCancelled && (
                  <div className="flex items-center gap-2 pt-2 border-t border-red-200 text-xs text-red-600">
                    <XCircle className="w-3.5 h-3.5" />Commande annulée
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Tab: Services ─────────────────────────────────────────────────────────────
const ServicesTab = ({ services, onUpdate }) => {
  const [modal, setModal] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce service ?')) return;
    try {
      await pb.collection('web_services').delete(id, { requestKey: null });
      toast.success('Supprimé');
      onUpdate();
    } catch (err) { toast.error(err.message); }
  };

  const CAT_COLORS = {
    vitrine:    'bg-blue-50 text-blue-700',
    ecommerce:  'bg-purple-50 text-purple-700',
    wordpress:  'bg-indigo-50 text-indigo-700',
    sur_mesure: 'bg-orange-50 text-orange-700',
    maintenance:'bg-gray-50 text-gray-700',
    seo:        'bg-green-50 text-green-700',
  };
  const CAT_LABELS = {
    vitrine:'Site vitrine', ecommerce:'E-commerce', wordpress:'WordPress',
    sur_mesure:'Sur mesure', maintenance:'Maintenance', seo:'SEO / Marketing',
  };

  return (
    <div className="space-y-4">
      {modal !== null && (
        <ServiceModal service={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSaved={onUpdate} />
      )}
      <div className="flex justify-end">
        <Button onClick={() => setModal('new')} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4" />Nouveau service
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(s => (
          <Card key={s.id} className={`border transition-colors ${s.actif !== false ? 'border-border hover:border-blue-200' : 'border-dashed border-border opacity-60'}`}>
            <CardContent className="p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2.5 bg-blue-50 rounded-xl shrink-0">
                  <Globe className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-foreground text-sm">{s.nom}</p>
                    {s.actif === false && <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Inactif</span>}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[s.categorie] || 'bg-muted text-muted-foreground'}`}>
                    {CAT_LABELS[s.categorie] || s.categorie}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{s.description || 'Aucune description'}</p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-extrabold text-blue-600">à partir de {s.prix_base} MAD</span>
                  <p className="text-xs text-muted-foreground">Délai : {s.delai_jours} jours</p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => setModal(s)} className="h-7 w-7 hover:bg-blue-50">
                    <Pencil className="w-3 h-3 text-blue-600" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(s.id)} className="h-7 w-7 hover:bg-red-50">
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {services.length === 0 && (
        <div className="text-center py-16 text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border">
          <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aucun service. Créez vos premières offres.</p>
        </div>
      )}
    </div>
  );
};

// ── Tab: Clients ──────────────────────────────────────────────────────────────
const ClientsTab = ({ orders, services, users }) => {
  const clientMap = {};
  orders.forEach(o => {
    const key = o.client_id || o.client_nom;
    if (!clientMap[key]) {
      const user = users.find(u => u.id === o.client_id);
      clientMap[key] = { user, commandes: [], caTotal: 0, nom: o.client_nom || user?.name || 'Inconnu', tel: o.client_tel };
    }
    clientMap[key].commandes.push(o);
    if (o.statut === 'payé') clientMap[key].caTotal += (o.montant || 0);
  });

  const clients = Object.values(clientMap).sort((a, b) => b.commandes.length - a.commandes.length);
  const [expanded, setExpanded] = useState(null);

  if (clients.length === 0) return (
    <div className="text-center py-16 text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border">
      <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
      <p className="text-sm">Aucun client pour le moment.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {clients.map(({ user, commandes, caTotal, nom, tel }) => {
        const key = user?.id || nom;
        const isExpanded = expanded === key;
        return (
          <Card key={key} className="border border-border">
            <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpanded(isExpanded ? null : key)}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {nom.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{nom}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  {tel && <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{tel}</span>}
                  {user?.email && <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</span>}
                </div>
              </div>
              <div className="flex items-center gap-4 text-right shrink-0">
                <div><p className="text-sm font-bold">{commandes.length}</p><p className="text-xs text-muted-foreground">projets</p></div>
                <div><p className="text-sm font-bold text-emerald-600">{caTotal} MAD</p><p className="text-xs text-muted-foreground">payé</p></div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </div>
            {isExpanded && (
              <div className="border-t border-border divide-y divide-border">
                {commandes.map(o => {
                  const svc = services.find(s => s.id === o.service_id);
                  return (
                    <div key={o.id} className="flex items-center gap-3 px-4 py-2.5">
                      <div className="flex-1 text-xs">
                        <span className="font-medium">{svc?.nom || o.service_nom || '—'}</span>
                        {o.domain_name && <span className="text-muted-foreground"> · {o.domain_name}</span>}
                      </div>
                      <TechBadge tech={o.tech_choice} />
                      <StatusBadge statut={o.statut} />
                      {o.montant > 0 && <span className="text-xs font-bold text-blue-600">{o.montant} MAD</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

// ── Tab: Paiements ────────────────────────────────────────────────────────────
const PaiementsTab = ({ orders, services, users, onUpdate }) => {
  const livres   = orders.filter(o => o.statut === 'livré');
  const payes    = orders.filter(o => o.statut === 'payé');
  const annules  = orders.filter(o => o.statut === 'annulé');
  const totalPaye    = payes.reduce((s, o) => s + (o.montant || 0), 0);
  const totalEnAttente = livres.reduce((s, o) => s + (o.montant || 0), 0);

  const markPaid = async (id) => {
    try {
      await pb.collection('web_orders').update(id, { statut: 'payé' }, { requestKey: null });
      toast.success('Marqué comme payé ✓');
      onUpdate();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'CA total encaissé', value: `${totalPaye} MAD`, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Wallet },
          { label: 'À encaisser',       value: `${totalEnAttente} MAD`, color: 'text-orange-600', bg: 'bg-orange-50', icon: AlertCircle },
          { label: 'Annulées',          value: annules.length, color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
        ].map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border border-border">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${s.bg}`}><Icon className={`w-5 h-5 ${s.color}`} /></div>
                <div><p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {livres.length > 0 && (
        <div>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-orange-500" />Projets livrés — en attente de paiement ({livres.length})</h3>
          <div className="space-y-2">
            {livres.map(o => {
              const svc  = services.find(s => s.id === o.service_id);
              const user = users.find(u => u.id === o.client_id);
              return (
                <div key={o.id} className="flex items-center gap-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{o.client_nom || user?.name || 'Client'}</p>
                    <p className="text-xs text-muted-foreground">{svc?.nom || o.service_nom} {o.domain_name ? `· ${o.domain_name}` : ''}</p>
                  </div>
                  <span className="text-base font-extrabold text-orange-600">{o.montant || '?'} MAD</span>
                  <Button size="sm" onClick={() => markPaid(o.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1">
                    <Check className="w-3 h-3" />Encaisser
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Wallet className="w-4 h-4 text-emerald-500" />Historique ({payes.length})</h3>
        {payes.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border">Aucun paiement enregistré</div>
        ) : (
          <div className="space-y-2">
            {[...payes].sort((a, b) => new Date(b.updated) - new Date(a.updated)).map(o => {
              const svc  = services.find(s => s.id === o.service_id);
              const user = users.find(u => u.id === o.client_id);
              return (
                <div key={o.id} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{o.client_nom || user?.name || 'Client'}</p>
                    <p className="text-xs text-muted-foreground">{svc?.nom || o.service_nom} {o.domain_name ? `· ${o.domain_name}` : ''}</p>
                  </div>
                  <StatusBadge statut="payé" />
                  <span className="text-base font-extrabold text-emerald-600">{o.montant} MAD</span>
                  {o.url_projet && <a href={o.url_projet} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800"><ExternalLink className="w-3.5 h-3.5" /></a>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Page principale ───────────────────────────────────────────────────────────
const AdminWebAgencyPage = () => {
  const [activeTab,    setActiveTab]    = useState('overview');
  const [services,     setServices]     = useState([]);
  const [orders,       setOrders]       = useState([]);
  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [svcs, ords, usrs] = await Promise.all([
        pb.collection('web_services').getFullList({ sort: 'nom', requestKey: null }).catch(() => []),
        pb.collection('web_orders').getList(1, 500, { requestKey: null }).then(r => r.items.sort((a,b) => new Date(b.created)-new Date(a.created))).catch(() => []),
        pb.collection('users').getFullList({ sort: 'name', requestKey: null }).catch(() => []),
      ]);
      setServices(svcs);
      setOrders(ords);
      setUsers(usrs);
    } catch (err) {
      console.error('[AdminWebAgency] fetchAll error:', err);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <AdminLayout>
      <Helmet><title>Web Agency — Admin IWS</title></Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Web Agency</h1>
            <p className="text-sm text-muted-foreground">Création de sites web — gestion complète</p>
          </div>
        </div>
        <div className="sm:ml-auto flex items-center gap-2">
          <a href="/agence" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50">
              <ExternalLink className="w-3.5 h-3.5" />Page publique
            </Button>
          </a>
          <Button size="sm" variant="outline" onClick={fetchAll} className="gap-1.5 text-xs">
            <RefreshCw className="w-3.5 h-3.5" />Actualiser
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl mb-6 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}>
              <Icon className="w-4 h-4" />{tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {activeTab === 'overview'  && <OverviewTab   orders={orders} services={services} users={users} onTabChange={setActiveTab} />}
          {activeTab === 'commandes' && <CommandesTab  orders={orders} services={services} users={users} onUpdate={fetchAll} />}
          {activeTab === 'services'  && <ServicesTab   services={services} onUpdate={fetchAll} />}
          {activeTab === 'clients'   && <ClientsTab    orders={orders} services={services} users={users} />}
          {activeTab === 'paiements' && <PaiementsTab  orders={orders} services={services} users={users} onUpdate={fetchAll} />}
        </>
      )}
    </AdminLayout>
  );
};

export default AdminWebAgencyPage;
