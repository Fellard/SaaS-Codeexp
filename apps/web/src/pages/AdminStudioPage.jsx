import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import AdminLayout from '@/components/AdminLayout.jsx';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Mic2, CalendarDays, SlidersHorizontal, CreditCard, Users,
  BarChart2, Plus, Pencil, Trash2, Check, X, Clock, CheckCircle2,
  XCircle, AlertCircle, Wallet, TrendingUp, ExternalLink,
  Music, Headphones, Radio, ChevronDown, ChevronUp, Eye,
  Phone, Mail, MessageSquare,
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────
const calcDurationH = (debut, fin) => {
  if (!debut || !fin) return 0;
  const [dh, dm] = debut.split(':').map(Number);
  const [fh, fm] = fin.split(':').map(Number);
  return Math.max(0, (fh * 60 + fm - (dh * 60 + dm)) / 60);
};

const calcMontant = (reservation, services) => {
  const svc = services.find(s => s.id === reservation.service_id);
  if (!svc) return 0;
  const h = calcDurationH(reservation.heure_debut, reservation.heure_fin);
  return Math.round(svc.prix * h);
};

const STATUS_CONFIG = {
  'en attente':  { label: 'En attente',  color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
  'confirmée':   { label: 'Confirmée',   color: 'bg-blue-100 text-blue-700 border-blue-200',       icon: CheckCircle2 },
  'en cours':    { label: 'En cours',    color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Mic2 },
  'terminée':    { label: 'Terminée',    color: 'bg-green-100 text-green-700 border-green-200',    icon: Check },
  'annulée':     { label: 'Annulée',     color: 'bg-red-100 text-red-700 border-red-200',          icon: XCircle },
  'payée':       { label: 'Payée ✓',     color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Wallet },
};

const StatusBadge = ({ statut }) => {
  const cfg = STATUS_CONFIG[statut] || STATUS_CONFIG['en attente'];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  );
};

const TABS = [
  { id: 'overview',      label: 'Vue d\'ensemble', icon: BarChart2 },
  { id: 'reservations',  label: 'Réservations',    icon: CalendarDays },
  { id: 'services',      label: 'Services',         icon: SlidersHorizontal },
  { id: 'clients',       label: 'Clients',          icon: Users },
  { id: 'paiements',     label: 'Paiements',        icon: CreditCard },
];

// ── Modal Service ─────────────────────────────────────────────────────────────
const ServiceModal = ({ service, onClose, onSaved }) => {
  const [form, setForm] = useState({
    nom:         service?.nom         || '',
    description: service?.description || '',
    prix:        service?.prix        || '',
    duree:       service?.duree       || 60,
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!form.nom.trim() || !form.prix) return toast.error('Nom et prix requis');
    setLoading(true);
    try {
      const data = { nom: form.nom.trim(), description: form.description.trim(), prix: parseFloat(form.prix), duree: parseInt(form.duree) || 60 };
      if (service?.id) {
        await pb.collection('studio_services').update(service.id, data, { requestKey: null });
        toast.success('Service mis à jour');
      } else {
        await pb.collection('studio_services').create(data, { requestKey: null });
        toast.success('Service créé');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">{service?.id ? 'Modifier le service' : 'Nouveau service'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Nom du service *</label>
            <input value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))}
              className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ex: Enregistrement vocal" />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
              className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Description du service..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Prix (MAD/h) *</label>
              <input type="number" value={form.prix} onChange={e => setForm(p => ({ ...p, prix: e.target.value }))}
                className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="150" min="0" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Durée min. (min)</label>
              <select value={form.duree} onChange={e => setForm(p => ({ ...p, duree: e.target.value }))}
                className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                {[30, 60, 90, 120, 180, 240].map(d => <option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-6 pt-0">
          <Button variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
          <Button onClick={handleSave} disabled={loading} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Reservation Detail Modal ──────────────────────────────────────────────────
const ReservationDetailModal = ({ reservation, services, users, onClose, onUpdate }) => {
  const svc = services.find(s => s.id === reservation.service_id);
  const user = users.find(u => u.id === reservation.user_id);
  const montant = calcMontant(reservation, services);
  const [loading, setLoading] = useState(false);

  const updateStatus = async (statut) => {
    setLoading(true);
    try {
      await pb.collection('studio_reservations').update(reservation.id, { statut }, { requestKey: null });
      toast.success(`Statut mis à jour : ${statut}`);
      onUpdate();
      onClose();
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Détail réservation</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <StatusBadge statut={reservation.statut} />
            <span className="text-lg font-bold text-purple-600">{montant} MAD</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span className="font-medium">{svc?.nom || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Client</span><span className="font-medium">{reservation.client_nom || user?.name || user?.nom || reservation.user_id}</span></div>

            {/* Contact rapide */}
            <div className="my-3 p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-2">
              <p className="text-xs font-bold text-purple-700 mb-2">📞 Contacter le client :</p>
              {(reservation.client_tel || user?.phone) && (
                <a href={`tel:${reservation.client_tel || user?.phone}`}
                  className="flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold text-sm">
                  <Phone className="w-4 h-4 shrink-0" />
                  {reservation.client_tel || user?.phone}
                </a>
              )}
              {!reservation.client_tel && !user?.phone && (
                <p className="text-xs text-muted-foreground italic">Aucun numéro renseigné</p>
              )}
              {user?.email && (
                <a href={`mailto:${user.email}`}
                  className="flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold text-sm">
                  <Mail className="w-4 h-4 shrink-0" />
                  {user.email}
                </a>
              )}
            </div>

            <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">{reservation.date_reservation}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Horaire</span><span className="font-medium">{reservation.heure_debut} → {reservation.heure_fin}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Durée</span><span className="font-medium">{calcDurationH(reservation.heure_debut, reservation.heure_fin).toFixed(1)}h</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Prix/h</span><span className="font-medium">{svc?.prix || 0} MAD</span></div>
            {reservation.notes && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span><span className="font-medium">Notes :</span> {reservation.notes}</span>
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="p-6 pt-0 space-y-2">
          <p className="text-xs text-muted-foreground font-medium mb-2">Changer le statut :</p>
          <div className="grid grid-cols-2 gap-2">
            {reservation.statut === 'en attente' && <>
              <Button size="sm" onClick={() => updateStatus('confirmée')} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white text-xs"><Check className="w-3 h-3 mr-1" />Confirmer</Button>
              <Button size="sm" variant="outline" onClick={() => updateStatus('annulée')} disabled={loading} className="text-red-600 border-red-200 hover:bg-red-50 text-xs"><X className="w-3 h-3 mr-1" />Annuler</Button>
            </>}
            {reservation.statut === 'confirmée' && <>
              <Button size="sm" onClick={() => updateStatus('en cours')} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white text-xs"><Mic2 className="w-3 h-3 mr-1" />En cours</Button>
              <Button size="sm" variant="outline" onClick={() => updateStatus('annulée')} disabled={loading} className="text-red-600 border-red-200 hover:bg-red-50 text-xs"><X className="w-3 h-3 mr-1" />Annuler</Button>
            </>}
            {reservation.statut === 'en cours' && <>
              <Button size="sm" onClick={() => updateStatus('terminée')} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white text-xs"><Check className="w-3 h-3 mr-1" />Terminer</Button>
            </>}
            {reservation.statut === 'terminée' && <>
              <Button size="sm" onClick={() => updateStatus('payée')} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"><Wallet className="w-3 h-3 mr-1" />Marquer payée</Button>
            </>}
            {(reservation.statut === 'payée' || reservation.statut === 'annulée') && (
              <p className="text-xs text-muted-foreground col-span-2 text-center py-2">Statut final — aucune action disponible</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Tab: Vue d'ensemble ───────────────────────────────────────────────────────
const OverviewTab = ({ reservations, services, users }) => {
  const total     = reservations.length;
  const pending   = reservations.filter(r => r.statut === 'en attente').length;
  const confirmed = reservations.filter(r => r.statut === 'confirmée').length;
  const revenue   = reservations
    .filter(r => r.statut === 'payée')
    .reduce((sum, r) => sum + calcMontant(r, services), 0);
  const pipeline  = reservations
    .filter(r => ['en attente', 'confirmée', 'en cours', 'terminée'].includes(r.statut))
    .reduce((sum, r) => sum + calcMontant(r, services), 0);

  const recent = [...reservations].sort((a, b) => new Date(b.created) - new Date(a.created)).slice(0, 5);

  const stats = [
    { label: 'Total réservations', value: total,                 icon: CalendarDays, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'En attente',         value: pending,               icon: Clock,        color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Confirmées',         value: confirmed,             icon: CheckCircle2, color: 'text-blue-600',   bg: 'bg-blue-50'   },
    { label: 'Revenus encaissés',  value: `${revenue} MAD`,      icon: Wallet,       color: 'text-emerald-600',bg: 'bg-emerald-50'},
    { label: 'Pipeline (à venir)', value: `${pipeline} MAD`,     icon: TrendingUp,   color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Services actifs',    value: services.length,       icon: Music,        color: 'text-pink-600',   bg: 'bg-pink-50'   },
  ];

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

      {/* Réservations récentes */}
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-foreground">Dernières réservations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recent.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">Aucune réservation pour le moment</div>
          ) : (
            <div className="divide-y divide-border">
              {recent.map(r => {
                const svc  = services.find(s => s.id === r.service_id);
                const user = users.find(u => u.id === r.user_id);
                const montant = calcMontant(r, services);
                return (
                  <div key={r.id} className="flex items-center gap-4 px-6 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{user?.name || user?.nom || 'Client'}</p>
                      <p className="text-xs text-muted-foreground">{svc?.nom || '—'} · {r.date_reservation} {r.heure_debut}–{r.heure_fin}</p>
                    </div>
                    <StatusBadge statut={r.statut} />
                    <span className="text-sm font-bold text-purple-600 whitespace-nowrap">{montant} MAD</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Services rapides */}
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-foreground">Services disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {services.map(s => (
              <div key={s.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl border border-border">
                <div className="p-2 bg-purple-100 rounded-lg shrink-0">
                  <Mic2 className="w-4 h-4 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{s.nom}</p>
                  <p className="text-xs text-purple-600 font-bold">{s.prix} MAD/h</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ── Quick status update helper ────────────────────────────────────────────────
const quickUpdate = async (id, statut, onUpdate) => {
  try {
    await pb.collection('studio_reservations').update(id, { statut }, { requestKey: null });
    toast.success(`✅ Statut mis à jour : ${statut}`);
    onUpdate();
  } catch (err) { toast.error(err.message); }
};

// ── Tab: Réservations ─────────────────────────────────────────────────────────
const ReservationsTab = ({ reservations, services, users, onUpdate }) => {
  const [filterStatus, setFilterStatus] = useState('');
  const [selected,     setSelected]     = useState(null);
  const [paying,       setPaying]       = useState(null);

  const filtered = filterStatus
    ? reservations.filter(r => r.statut === filterStatus)
    : reservations;

  const sorted = [...filtered].sort((a, b) => {
    const order = ['en attente', 'confirmée', 'en cours', 'terminée', 'payée', 'annulée'];
    return order.indexOf(a.statut) - order.indexOf(b.statut) || new Date(b.date_reservation) - new Date(a.date_reservation);
  });

  const handleEncaisser = async (r) => {
    setPaying(r.id);
    await quickUpdate(r.id, 'payée', onUpdate);
    setPaying(null);
  };

  return (
    <div className="space-y-4">
      {selected && (
        <ReservationDetailModal
          reservation={selected}
          services={services}
          users={users}
          onClose={() => setSelected(null)}
          onUpdate={onUpdate}
        />
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[{ v: '', l: 'Toutes' }, ...Object.entries(STATUS_CONFIG).map(([v, c]) => ({ v, l: c.label }))].map(({ v, l }) => (
          <button key={v} onClick={() => setFilterStatus(v)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${filterStatus === v ? 'bg-purple-600 text-white border-purple-600' : 'bg-background text-muted-foreground border-border hover:border-purple-300'}`}>
            {l} {v === '' ? `(${reservations.length})` : `(${reservations.filter(r => r.statut === v).length})`}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border">
          <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aucune réservation</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(r => {
            const svc       = services.find(s => s.id === r.service_id);
            const user      = users.find(u => u.id === r.user_id);
            const montant   = calcMontant(r, services);
            const dh        = calcDurationH(r.heure_debut, r.heure_fin);
            const isPaid    = r.statut === 'payée';
            const isCancelled = r.statut === 'annulée';

            return (
              <div key={r.id} className={`flex flex-col gap-3 p-4 bg-card border rounded-xl transition-colors ${
                r.statut === 'terminée'   ? 'border-orange-300 bg-orange-50/30' :
                r.statut === 'en attente' ? 'border-yellow-200' :
                isPaid                    ? 'border-emerald-200 bg-emerald-50/20' :
                'border-border hover:border-purple-200'
              }`}>

                {/* Infos client */}
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-bold text-foreground">
                        {r.client_nom || user?.name || user?.nom || 'Client inconnu'}
                      </p>
                      <StatusBadge statut={r.statut} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{svc?.nom || '—'}</span>
                      {' · '}{r.date_reservation} · {r.heure_debut}–{r.heure_fin}
                      {dh > 0 && ` (${dh.toFixed(1)}h)`}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-1">
                      {r.client_tel && (
                        <a href={`tel:${r.client_tel}`} className="text-xs text-purple-600 font-semibold hover:text-purple-800 flex items-center gap-1">
                          <Phone className="w-3 h-3" />{r.client_tel}
                        </a>
                      )}
                      {user?.email && (
                        <a href={`mailto:${user.email}`} className="text-xs text-muted-foreground hover:text-purple-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />{user.email}
                        </a>
                      )}
                    </div>
                  </div>
                  <span className={`text-base font-extrabold whitespace-nowrap ${isPaid ? 'text-emerald-600' : 'text-purple-600'}`}>
                    {montant} MAD
                  </span>
                </div>

                {/* Boutons d'action */}
                {!isCancelled && !isPaid && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">

                    {/* Étapes du flux normal */}
                    {r.statut === 'en attente' && <>
                      <Button size="sm" onClick={() => quickUpdate(r.id, 'confirmée', onUpdate)}
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white h-7 px-3">
                        <Check className="w-3 h-3 mr-1" />Confirmer
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => quickUpdate(r.id, 'annulée', onUpdate)}
                        className="text-xs text-red-600 border-red-200 hover:bg-red-50 h-7 px-3">
                        <X className="w-3 h-3 mr-1" />Annuler
                      </Button>
                    </>}

                    {r.statut === 'confirmée' && <>
                      <Button size="sm" onClick={() => quickUpdate(r.id, 'en cours', onUpdate)}
                        className="text-xs bg-purple-600 hover:bg-purple-700 text-white h-7 px-3">
                        <Mic2 className="w-3 h-3 mr-1" />Client arrivé — Démarrer
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => quickUpdate(r.id, 'annulée', onUpdate)}
                        className="text-xs text-red-600 border-red-200 hover:bg-red-50 h-7 px-3">
                        <X className="w-3 h-3 mr-1" />Annuler
                      </Button>
                    </>}

                    {r.statut === 'en cours' && (
                      <Button size="sm" onClick={() => quickUpdate(r.id, 'terminée', onUpdate)}
                        className="text-xs bg-green-600 hover:bg-green-700 text-white h-7 px-3">
                        <Check className="w-3 h-3 mr-1" />Session terminée
                      </Button>
                    )}

                    {r.statut === 'terminée' && (
                      <Button size="sm" onClick={() => handleEncaisser(r)} disabled={paying === r.id}
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-4 font-bold shadow shadow-emerald-200">
                        <Wallet className="w-3.5 h-3.5 mr-1.5" />
                        {paying === r.id ? 'Enregistrement...' : `💰 Encaisser ${montant} MAD`}
                      </Button>
                    )}

                    {/* ── Bouton paiement direct toujours visible ── */}
                    {r.statut !== 'terminée' && (
                      <Button
                        size="sm"
                        onClick={() => handleEncaisser(r)}
                        disabled={paying === r.id}
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-4 font-bold shadow shadow-emerald-100 ml-auto"
                      >
                        <Wallet className="w-3.5 h-3.5 mr-1.5" />
                        {paying === r.id ? '...' : `💰 Encaisser ${montant} MAD`}
                      </Button>
                    )}

                    <Button size="sm" variant="ghost" onClick={() => setSelected(r)}
                      className={`text-xs text-muted-foreground h-7 px-2 ${r.statut === 'terminée' ? 'ml-auto' : ''}`}>
                      <Eye className="w-3 h-3 mr-1" />Détail
                    </Button>
                  </div>
                )}

                {isPaid && (
                  <div className="flex items-center gap-2 pt-2 border-t border-emerald-200 text-xs text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />Paiement enregistré — {montant} MAD encaissés
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
  const [modal, setModal] = useState(null); // null | 'new' | service object

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce service ?')) return;
    try {
      await pb.collection('studio_services').delete(id, { requestKey: null });
      toast.success('Service supprimé');
      onUpdate();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="space-y-4">
      {modal !== null && (
        <ServiceModal
          service={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={onUpdate}
        />
      )}

      <div className="flex justify-end">
        <Button onClick={() => setModal('new')} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="w-4 h-4" />Nouveau service
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(s => (
          <Card key={s.id} className="border border-border hover:border-purple-200 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2.5 bg-purple-100 rounded-xl shrink-0">
                  <Mic2 className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-sm">{s.nom}</p>
                  <p className="text-xs text-purple-600 font-semibold">{s.prix} MAD / heure</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{s.description || 'Aucune description'}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">Durée min : {s.duree || 60} min</span>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => setModal(s)} className="h-7 w-7 hover:bg-purple-50">
                    <Pencil className="w-3 h-3 text-purple-600" />
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
          <Music className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aucun service défini. Commencez par en créer un.</p>
        </div>
      )}
    </div>
  );
};

// ── Tab: Clients ──────────────────────────────────────────────────────────────
const ClientsTab = ({ reservations, services, users }) => {
  const clientMap = {};
  reservations.forEach(r => {
    if (!clientMap[r.user_id]) {
      const user = users.find(u => u.id === r.user_id);
      clientMap[r.user_id] = { user, sessions: [], totalRevenue: 0 };
    }
    clientMap[r.user_id].sessions.push(r);
    if (r.statut === 'payée') {
      clientMap[r.user_id].totalRevenue += calcMontant(r, services);
    }
  });

  const clients = Object.values(clientMap).sort((a, b) => b.sessions.length - a.sessions.length);
  const [expanded, setExpanded] = useState(null);

  if (clients.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border">
        <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Aucun client n'a encore effectué de réservation.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {clients.map(({ user, sessions, totalRevenue }) => {
        const uid = user?.id || sessions[0]?.user_id;
        const isExpanded = expanded === uid;
        const lastSession = sessions.sort((a, b) => new Date(b.date_reservation) - new Date(a.date_reservation))[0];
        return (
          <Card key={uid} className="border border-border">
            <div
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setExpanded(isExpanded ? null : uid)}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {(user?.name || user?.nom || 'C').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{user?.name || user?.nom || 'Client inconnu'}</p>
                <p className="text-xs text-muted-foreground">{user?.email || '—'} · Dernière session : {lastSession?.date_reservation || '—'}</p>
              </div>
              <div className="flex items-center gap-4 text-right shrink-0">
                <div>
                  <p className="text-sm font-bold text-foreground">{sessions.length}</p>
                  <p className="text-xs text-muted-foreground">sessions</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-600">{totalRevenue} MAD</p>
                  <p className="text-xs text-muted-foreground">payé</p>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </div>
            {isExpanded && (
              <div className="border-t border-border divide-y divide-border">
                {sessions.map(r => {
                  const svc = services.find(s => s.id === r.service_id);
                  return (
                    <div key={r.id} className="flex items-center gap-3 px-4 py-2.5">
                      <div className="flex-1 text-xs">
                        <span className="font-medium text-foreground">{svc?.nom || '—'}</span>
                        <span className="text-muted-foreground"> · {r.date_reservation} · {r.heure_debut}–{r.heure_fin}</span>
                      </div>
                      <StatusBadge statut={r.statut} />
                      <span className="text-xs font-bold text-purple-600">{calcMontant(r, services)} MAD</span>
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
const PaiementsTab = ({ reservations, services, users, onUpdate }) => {
  const toBill   = reservations.filter(r => r.statut === 'terminée');
  const paid     = reservations.filter(r => r.statut === 'payée');
  const cancelled= reservations.filter(r => r.statut === 'annulée');

  const totalPaid    = paid.reduce((s, r) => s + calcMontant(r, services), 0);
  const totalPending = toBill.reduce((s, r) => s + calcMontant(r, services), 0);

  const markPaid = async (id) => {
    try {
      await pb.collection('studio_reservations').update(id, { statut: 'payée' }, { requestKey: null });
      toast.success('Marqué comme payé ✓');
      onUpdate();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Encaissé total', value: `${totalPaid} MAD`, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Wallet },
          { label: 'À encaisser',    value: `${totalPending} MAD`, color: 'text-orange-600', bg: 'bg-orange-50', icon: AlertCircle },
          { label: 'Sessions annulées', value: cancelled.length, color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
        ].map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border border-border">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${s.bg}`}><Icon className={`w-5 h-5 ${s.color}`} /></div>
                <div>
                  <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* À encaisser */}
      {toBill.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-500" />Sessions terminées — en attente de paiement ({toBill.length})
          </h3>
          <div className="space-y-2">
            {toBill.map(r => {
              const svc  = services.find(s => s.id === r.service_id);
              const user = users.find(u => u.id === r.user_id);
              const montant = calcMontant(r, services);
              return (
                <div key={r.id} className="flex items-center gap-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{user?.name || user?.nom || 'Client'}</p>
                    <p className="text-xs text-muted-foreground">{svc?.nom} · {r.date_reservation} · {r.heure_debut}–{r.heure_fin}</p>
                  </div>
                  <span className="text-base font-extrabold text-orange-600">{montant} MAD</span>
                  <Button size="sm" onClick={() => markPaid(r.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1">
                    <Check className="w-3 h-3" />Marquer payée
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Historique payé */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Wallet className="w-4 h-4 text-emerald-500" />Historique des paiements ({paid.length})
        </h3>
        {paid.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border text-sm">
            Aucun paiement enregistré
          </div>
        ) : (
          <div className="space-y-2">
            {[...paid].sort((a, b) => new Date(b.updated) - new Date(a.updated)).map(r => {
              const svc  = services.find(s => s.id === r.service_id);
              const user = users.find(u => u.id === r.user_id);
              const montant = calcMontant(r, services);
              return (
                <div key={r.id} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{user?.name || user?.nom || 'Client'}</p>
                    <p className="text-xs text-muted-foreground">{svc?.nom} · {r.date_reservation} · {r.heure_debut}–{r.heure_fin}</p>
                  </div>
                  <StatusBadge statut="payée" />
                  <span className="text-base font-extrabold text-emerald-600">{montant} MAD</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main AdminStudioPage ──────────────────────────────────────────────────────
const StudioLogo = () => {
  const [failed, setFailed] = useState(false);
  if (!failed) return (
    <img src="/logos/logo_iwsrecords.png" alt="IWS Records" className="h-12 max-w-[140px] object-contain rounded-lg"
      onError={() => setFailed(true)} />
  );
  return (
    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-700 to-pink-600 text-white shadow">
      <Mic2 className="w-6 h-6" />
    </div>
  );
};

const AdminStudioPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [services,     setServices]     = useState([]);
  const [reservations, setReservations] = useState([]);
  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [svcs, resv, usrs] = await Promise.all([
        pb.collection('studio_services').getFullList({ sort: 'nom', requestKey: null }),
        pb.collection('studio_reservations').getFullList({ sort: '-created', requestKey: null }),
        pb.collection('users').getFullList({ sort: 'name', requestKey: null }),
      ]);
      setServices(svcs);
      setReservations(resv);
      setUsers(usrs);
    } catch (err) {
      console.error('Studio fetch error:', err);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <AdminLayout>
      <Helmet><title>Studio IWS Records — Admin</title></Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <StudioLogo />
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Studio IWS Records</h1>
            <p className="text-sm text-muted-foreground">Gestion complète du studio d'enregistrement</p>
          </div>
        </div>
        <div className="sm:ml-auto flex items-center gap-2">
          <a href="https://www.iwsrecords.com" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50">
              <ExternalLink className="w-3.5 h-3.5" />iwsrecords.com
            </Button>
          </a>
          <Button size="sm" variant="outline" onClick={fetchAll} className="gap-1.5 text-xs">
            Actualiser
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl mb-6 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {activeTab === 'overview'     && <OverviewTab      reservations={reservations} services={services} users={users} />}
          {activeTab === 'reservations' && <ReservationsTab  reservations={reservations} services={services} users={users} onUpdate={fetchAll} />}
          {activeTab === 'services'     && <ServicesTab      services={services} onUpdate={fetchAll} />}
          {activeTab === 'clients'      && <ClientsTab       reservations={reservations} services={services} users={users} />}
          {activeTab === 'paiements'    && <PaiementsTab     reservations={reservations} services={services} users={users} onUpdate={fetchAll} />}
        </>
      )}
    </AdminLayout>
  );
};

export default AdminStudioPage;
