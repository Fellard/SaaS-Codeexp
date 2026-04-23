
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import AdminLayout from '@/components/AdminLayout.jsx';
import { useTranslation } from '@/i18n/useTranslation.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  ShoppingBag, Music2, Laptop2, Package, ShoppingCart,
  CreditCard, TrendingUp, BarChart2, ArrowRight, Plus, Pencil,
  Trash2, Eye, X, Search, RefreshCw, Download,
  CheckCircle2, Clock, XCircle, AlertCircle, DollarSign,
  ArrowUpRight, ArrowDownRight, Box, Tag, Loader2,
  Users, Phone, History, ChevronDown, ChevronRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { toast } from 'sonner';

// ─── Store config ─────────────────────────────────────────────────────────────
// section field maps: laayounemusik → 'musik', iwstech → 'pc'
const STORES = {
  laayounemusik: {
    name: 'LaayouneMusik',
    subtitle: 'Instruments de musique & accessoires',
    section: 'musik',
    icon: Music2,
    logo: '/logos/logo_laayounemusik.jpeg',
    gradient: 'from-pink-600 to-rose-500',
    bg: 'bg-pink-50 dark:bg-pink-950/20',
    border: 'border-pink-200 dark:border-pink-800',
    color: 'text-pink-700 dark:text-pink-400',
    headerBg: 'bg-gradient-to-br from-pink-600 to-rose-500',
    accent: '#e11d48',
    categories: ['Guitares', 'Claviers', 'Percussion', 'Vents', 'Cordes', 'Sonorisation', 'Accessoires', 'Autre'],
  },
  iwstech: {
    name: 'IwsTech Company',
    subtitle: 'Ordinateurs & matériel informatique',
    section: 'pc',
    icon: Laptop2,
    logo: '/logos/Iws_ech.jpg',
    gradient: 'from-blue-600 to-cyan-500',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-800',
    color: 'text-blue-600 dark:text-blue-400',
    headerBg: 'bg-gradient-to-br from-blue-600 to-cyan-500',
    accent: '#2563eb',
    categories: ['Ordinateurs', 'Laptops', 'Périphériques', 'Réseaux', 'Stockage', 'Composants', 'Accessoires', 'Autre'],
  },
};

const ORDER_STATUSES = {
  pending:   { label: 'En attente',  cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400', icon: Clock },
  paid:      { label: 'Payé',        cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',         icon: CreditCard },
  completed: { label: 'Complété',    cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',     icon: CheckCircle2 },
  cancelled: { label: 'Annulé',      cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',             icon: XCircle },
};

const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const s = ORDER_STATUSES[status] || ORDER_STATUSES.pending;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}>
      <Icon className="w-3.5 h-3.5" />{s.label}
    </span>
  );
};

const StoreLogo = ({ store: s, className = '', iconSize = 'w-7 h-7' }) => {
  const [failed, setFailed] = useState(false);
  const Icon = s.icon;
  if (s.logo && !failed) {
    return <img src={s.logo} alt={s.name} className={`${className} mix-blend-multiply dark:mix-blend-normal`} onError={() => setFailed(true)} />;
  }
  return <div className={`p-3 rounded-2xl ${s.headerBg} text-white shadow-lg`}><Icon className={iconSize} /></div>;
};

// ─── ProductModal ─────────────────────────────────────────────────────────────
const PB_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_POCKETBASE_URL)
  || 'http://localhost:8090';

const MAX_IMGS = 4;

const ProductModal = ({ open, onClose, product, section, cfg, onSaved }) => {
  const isEdit = !!product?.id;
  const [form, setForm] = useState({ name: '', description: '', category: '', price: '', buy_price: '', stock: '', brand: '', condition: 'neuf' });
  // newFiles[i] = File object to upload, null = slot empty / keep existing
  const [newFiles, setNewFiles] = useState(Array(MAX_IMGS).fill(null));
  // previews[i] = URL string (object URL for new, PB URL for existing, null = empty)
  const [previews, setPreviews] = useState(Array(MAX_IMGS).fill(null));
  // existingNames[i] = PocketBase filename of existing image (to send removal if cleared)
  const [existingNames, setExistingNames] = useState(Array(MAX_IMGS).fill(null));
  // removedNames = filenames to tell PocketBase to delete
  const [removedNames, setRemovedNames] = useState([]);
  const [saving, setSaving] = useState(false);
  const fileRefs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (!open) return;
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        price: product.price ?? '',
        buy_price: product.buy_price ?? '',
        stock: product.stock ?? '',
        brand: product.brand || '',
        condition: product.condition || 'neuf',
      });
      // Load existing images from the `images` file field
      const imgs = Array.isArray(product.images) ? product.images : (product.images ? [product.images] : []);
      const names = Array(MAX_IMGS).fill(null);
      const prevs = Array(MAX_IMGS).fill(null);
      imgs.slice(0, MAX_IMGS).forEach((filename, i) => {
        names[i] = filename;
        prevs[i] = `${PB_URL}/api/files/products/${product.id}/${filename}`;
      });
      setExistingNames(names);
      setPreviews(prevs);
    } else {
      setForm({ name: '', description: '', category: '', price: '', buy_price: '', stock: '', brand: '', condition: 'neuf' });
      setExistingNames(Array(MAX_IMGS).fill(null));
      setPreviews(Array(MAX_IMGS).fill(null));
    }
    setNewFiles(Array(MAX_IMGS).fill(null));
    setRemovedNames([]);
  }, [product, open]);

  const handleImgChange = (slotIdx, e) => {
    const f = e.target.files[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setNewFiles(prev => { const n = [...prev]; n[slotIdx] = f; return n; });
    setPreviews(prev => { const n = [...prev]; n[slotIdx] = url; return n; });
  };

  const removeSlot = (slotIdx) => {
    // If it was an existing PB file, mark for removal
    if (existingNames[slotIdx]) {
      setRemovedNames(prev => [...prev, existingNames[slotIdx]]);
      setExistingNames(prev => { const n = [...prev]; n[slotIdx] = null; return n; });
    }
    setNewFiles(prev => { const n = [...prev]; n[slotIdx] = null; return n; });
    setPreviews(prev => { const n = [...prev]; n[slotIdx] = null; return n; });
    if (fileRefs[slotIdx]?.current) fileRefs[slotIdx].current.value = '';
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Le nom du produit est requis');
    if (!form.category) return toast.error('Veuillez sélectionner une catégorie');
    setSaving(true);
    try {
      // Build FormData — required for file uploads
      const fd = new FormData();
      fd.append('name',        form.name.trim());
      fd.append('description', form.description.trim());
      fd.append('category',    form.category);
      fd.append('price',       parseFloat(form.price)     || 0);
      fd.append('buy_price',   parseFloat(form.buy_price)  || 0);
      fd.append('stock',       parseInt(form.stock)        || 0);
      fd.append('brand',       form.brand.trim());
      fd.append('condition',   form.condition);
      fd.append('section',     section);

      // Append new image files
      newFiles.forEach(f => { if (f) fd.append('images', f); });

      // Tell PocketBase to remove deleted existing files
      removedNames.forEach(name => fd.append('images-', name));

      if (isEdit) {
        await pb.collection('products').update(product.id, fd, { requestKey: null });
        toast.success('Produit mis à jour !');
      } else {
        await pb.collection('products').create(fd, { requestKey: null });
        toast.success('Produit ajouté !');
      }
      onSaved();
      onClose();
    } catch (err) {
      const errData = err?.response?.data || err?.data || {};
      const detail = Object.entries(errData)
        .map(([field, info]) => `${field}: ${info?.message || JSON.stringify(info)}`)
        .join(' | ');
      console.error('Save product error:', errData);
      toast.error(`Erreur : ${detail || err.message}`, { duration: 10000 });
    } finally {
      setSaving(false);
    }
  };

  const margin = form.price && form.buy_price && parseFloat(form.price) > 0
    ? (((parseFloat(form.price) - parseFloat(form.buy_price)) / parseFloat(form.price)) * 100).toFixed(1)
    : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier le produit' : 'Nouveau produit'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          {/* 4 image slots */}
          <div>
            <Label className="mb-2 block">Photos du produit (max 4)</Label>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: MAX_IMGS }).map((_, i) => (
                <div key={i} className="relative">
                  <div
                    onClick={() => !previews[i] && fileRefs[i].current?.click()}
                    className={`aspect-square rounded-xl border-2 overflow-hidden flex items-center justify-center bg-muted/30 transition-colors
                      ${previews[i] ? 'border-solid border-border' : 'border-dashed border-border hover:border-primary cursor-pointer'}`}
                  >
                    {previews[i]
                      ? <img src={previews[i]} className="w-full h-full object-cover" alt={`image ${i + 1}`} />
                      : <div className="text-center text-muted-foreground p-1">
                          <Plus className="w-5 h-5 mx-auto opacity-40" />
                          <span className="text-xs opacity-40">{i === 0 ? 'Principal' : `Photo ${i + 1}`}</span>
                        </div>}
                  </div>
                  {previews[i] && (
                    <button
                      onClick={() => removeSlot(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {previews[i] && (
                    <button
                      onClick={() => fileRefs[i].current?.click()}
                      className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-background/80 border flex items-center justify-center shadow hover:scale-110 transition-transform"
                      title="Remplacer"
                    >
                      <Pencil className="w-2.5 h-2.5" />
                    </button>
                  )}
                  <input
                    ref={fileRefs[i]}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleImgChange(i, e)}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">Cliquez sur un slot vide pour ajouter une photo · Cliquez ✕ pour supprimer</p>
          </div>

          <div className="grid gap-1.5">
            <Label>Nom du produit *</Label>
            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Guitare acoustique Yamaha F310" />
          </div>
          <div className="grid gap-1.5">
            <Label>Description</Label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="Description courte…"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Catégorie</Label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="" disabled>— Catégorie * —</option>
                {cfg.categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label>Marque</Label>
              <Input value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} placeholder="Yamaha, Dell…" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Prix d'achat (MAD)</Label>
              <Input type="number" min="0" step="0.01" value={form.buy_price} onChange={e => setForm(p => ({ ...p, buy_price: e.target.value }))} placeholder="0.00" />
            </div>
            <div className="grid gap-1.5">
              <Label>Prix de vente (MAD)</Label>
              <Input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="0.00" />
            </div>
          </div>

          {margin !== null && (
            <div className={`text-xs px-3 py-2 rounded-lg font-medium ${parseFloat(margin) >= 0 ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700'}`}>
              Marge : {margin}% (+{(parseFloat(form.price) - parseFloat(form.buy_price)).toFixed(2)} MAD)
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Stock (quantité)</Label>
              <Input type="number" min="0" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} placeholder="0" />
            </div>
            <div className="grid gap-1.5">
              <Label>État</Label>
              <select value={form.condition} onChange={e => setForm(p => ({ ...p, condition: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="neuf">Neuf</option>
                <option value="occasion">Occasion</option>
              </select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Annuler</Button>
          <Button onClick={handleSave} disabled={saving} className={`bg-gradient-to-r ${cfg.gradient} text-white border-0`}>
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enregistrement…</> : isEdit ? 'Mettre à jour' : 'Ajouter le produit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── OrderDetailModal ─────────────────────────────────────────────────────────
const OrderDetailModal = ({ open, onClose, order, onStatusChange }) => {
  const [status, setStatus] = useState(order?.status || 'pending');
  const [saving, setSaving] = useState(false);
  let items = [];
  try { items = JSON.parse(order?.items || '[]'); } catch {}

  useEffect(() => { setStatus(order?.status || 'pending'); }, [order]);

  const changeStatus = async (newStatus) => {
    setSaving(true);
    try {
      await pb.collection('store_orders').update(order.id, { status: newStatus }, { requestKey: null });
      setStatus(newStatus);
      onStatusChange(order.id, newStatus);
      toast.success('Statut mis à jour');
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Commande #{order.id?.slice(-6).toUpperCase()}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <StatusBadge status={status} />
            <span className="text-xs text-muted-foreground">{new Date(order.created).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg text-sm">
            <p className="font-semibold">{order.client_nom || 'Client anonyme'}</p>
            {order.client_tel && <p className="text-muted-foreground">{order.client_tel}</p>}
          </div>
          <div>
            <p className="text-sm font-semibold mb-2">Articles</p>
            <div className="divide-y divide-border rounded-lg border overflow-hidden">
              {items.length > 0 ? items.map((it, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span>{it.name} <span className="text-muted-foreground">×{it.qty}</span></span>
                  <span className="font-medium">{((it.price || 0) * (it.qty || 1)).toFixed(2)} MAD</span>
                </div>
              )) : <p className="px-3 py-2 text-sm text-muted-foreground">Aucun article</p>}
            </div>
            <div className="flex justify-between mt-2 px-1 font-bold text-sm">
              <span>Total</span><span>{(order.total || 0).toFixed(2)} MAD</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold mb-2">Changer le statut</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ORDER_STATUSES).map(([key, val]) => {
                const Icon = val.icon;
                return (
                  <Button key={key} size="sm" variant={status === key ? 'default' : 'outline'}
                    className={`gap-1.5 text-xs ${status === key ? 'bg-foreground text-background' : ''}`}
                    onClick={() => changeStatus(key)} disabled={saving || status === key}>
                    <Icon className="w-3.5 h-3.5" />{val.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── NewOrderModal ─────────────────────────────────────────────────────────────
const NewOrderModal = ({ open, onClose, section, storeKey, products, cfg, onSaved }) => {
  const [form, setForm] = useState({ client_nom: '', client_tel: '', status: 'pending' });
  const [items, setItems] = useState([{ product_id: '', name: '', qty: 1, price: 0 }]);
  const [saving, setSaving] = useState(false);

  const total = items.reduce((s, it) => s + it.qty * it.price, 0);

  const addItem = () => setItems(p => [...p, { product_id: '', name: '', qty: 1, price: 0 }]);
  const removeItem = (i) => setItems(p => p.filter((_, idx) => idx !== i));
  const updateItem = (i, field, val) => setItems(p => p.map((it, idx) => {
    if (idx !== i) return it;
    const updated = { ...it, [field]: val };
    if (field === 'product_id') {
      const prod = products.find(p => p.id === val);
      if (prod) { updated.name = prod.name; updated.price = prod.price || 0; }
    }
    return updated;
  }));

  const handleSave = async () => {
    if (!form.client_nom.trim()) return toast.error('Nom du client requis');
    setSaving(true);
    try {
      await pb.collection('store_orders').create({
        ...form,
        store: storeKey,
        section,
        items: JSON.stringify(items.map(it => ({ name: it.name || '?', qty: it.qty, price: it.price, product_id: it.product_id }))),
        total,
      }, { requestKey: null });
      toast.success('Commande créée !');
      onSaved();
      onClose();
      setForm({ client_nom: '', client_tel: '', status: 'pending' });
      setItems([{ product_id: '', name: '', qty: 1, price: 0 }]);
    } catch (err) {
      toast.error(`Erreur : ${err.message}`);
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Nouvelle commande</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5 col-span-2">
              <Label>Nom du client *</Label>
              <Input value={form.client_nom} onChange={e => setForm(p => ({ ...p, client_nom: e.target.value }))} placeholder="Mohamed Alami" />
            </div>
            <div className="grid gap-1.5 col-span-2">
              <Label>Téléphone</Label>
              <Input value={form.client_tel} onChange={e => setForm(p => ({ ...p, client_tel: e.target.value }))} placeholder="+212 6..." />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Articles</Label>
              <Button type="button" size="sm" variant="outline" onClick={addItem}><Plus className="w-3.5 h-3.5 mr-1" />Ajouter</Button>
            </div>
            <div className="space-y-2">
              {items.map((it, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select className="flex-1 h-9 rounded-md border border-input bg-background px-2 text-sm"
                    value={it.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)}>
                    <option value="">— Produit —</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  {!it.product_id && <Input className="flex-1 h-9 text-sm" placeholder="Nom" value={it.name} onChange={e => updateItem(i, 'name', e.target.value)} />}
                  <Input type="number" min="1" className="w-14 h-9 text-sm" value={it.qty} onChange={e => updateItem(i, 'qty', parseInt(e.target.value) || 1)} />
                  <Input type="number" min="0" step="0.01" className="w-24 h-9 text-sm" placeholder="Prix" value={it.price} onChange={e => updateItem(i, 'price', parseFloat(e.target.value) || 0)} />
                  <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-destructive" onClick={() => removeItem(i)}><X className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between font-bold text-sm px-1"><span>Total</span><span>{total.toFixed(2)} MAD</span></div>
          <div className="grid gap-1.5">
            <Label>Statut</Label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              {Object.entries(ORDER_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Annuler</Button>
          <Button onClick={handleSave} disabled={saving} className={`bg-gradient-to-r ${cfg.gradient} text-white border-0`}>
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Création…</> : 'Créer la commande'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Tab: Produits ────────────────────────────────────────────────────────────
const ProduitsTab = ({ storeKey, section, cfg }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [modal, setModal] = useState({ open: false, product: null });
  const [deleteId, setDeleteId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await pb.collection('products').getFullList({
        filter: `section="${section}"`, sort: '-created', requestKey: null,
      });
      setProducts(data);
    } catch (err) {
      if (err.status !== 404) toast.error(`Erreur : ${err.message}`);
      setProducts([]);
    } finally { setLoading(false); }
  }, [section]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    try {
      await pb.collection('products').delete(id, { requestKey: null });
      setProducts(p => p.filter(x => x.id !== id));
      toast.success('Produit supprimé');
      setDeleteId(null);
    } catch (err) { toast.error(err.message); }
  };

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const ms = !q || p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q);
    const mc = !catFilter || p.category === catFilter;
    return ms && mc;
  });

  const stockTotal   = products.reduce((s, p) => s + (p.stock || 0), 0);
  const valeurStock  = products.reduce((s, p) => s + (p.stock || 0) * (p.buy_price || p.price || 0), 0);
  const rupture      = products.filter(p => !p.stock || p.stock === 0).length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Produits', value: products.length, icon: Package, color: 'text-blue-600' },
          { label: 'Total en stock', value: stockTotal, icon: Box, color: 'text-green-600' },
          { label: 'Rupture', value: rupture, icon: AlertCircle, color: 'text-red-600' },
          { label: 'Valeur stock', value: `${valeurStock.toFixed(0)} MAD`, icon: DollarSign, color: 'text-purple-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-bold mt-0.5">{value}</p></div>
                <Icon className={`w-6 h-6 ${color} opacity-70`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">Toutes catégories</option>
          {cfg.categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <Button variant="outline" size="icon" onClick={load}><RefreshCw className="w-4 h-4" /></Button>
        <Button onClick={() => setModal({ open: true, product: null })} className={`bg-gradient-to-r ${cfg.gradient} text-white border-0 gap-2`}>
          <Plus className="w-4 h-4" />Nouveau produit
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mr-2" />Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
          <Package className="w-10 h-10 opacity-30" />
          <p>{products.length === 0 ? 'Aucun produit. Commencez par en ajouter un !' : 'Aucun résultat.'}</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {['Produit', 'Catégorie', 'Achat', 'Vente', 'Stock', 'État', ''].map((h, i) => (
                  <th key={i} className={`px-3 py-3 font-semibold text-muted-foreground text-left ${i === 0 ? 'pl-4' : ''} ${i === 1 || i === 5 ? 'hidden md:table-cell' : ''} ${i === 6 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(prod => {
                const margin = prod.price && prod.buy_price && prod.price > 0
                  ? (((prod.price - prod.buy_price) / prod.price) * 100).toFixed(0)
                  : null;
                return (
                  <tr key={prod.id} className="hover:bg-muted/20 transition-colors">
                    <td className="pl-4 pr-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg border bg-muted/40 flex items-center justify-center overflow-hidden shrink-0">
                          {prod.images?.[0]
                            ? <img src={`${PB_URL}/api/files/products/${prod.id}/${prod.images[0]}`} className="w-full h-full object-cover" alt="" />
                            : prod.image_url
                              ? <img src={prod.image_url} className="w-full h-full object-cover" alt="" />
                              : <Package className="w-5 h-5 opacity-30" />}
                        </div>
                        <div>
                          <p className="font-medium leading-tight truncate max-w-[150px]">{prod.name}</p>
                          {prod.brand && <p className="text-xs text-muted-foreground">{prod.brand}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{prod.category || '—'}</span>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground text-sm">{prod.buy_price ? `${prod.buy_price} MAD` : '—'}</td>
                    <td className="px-3 py-3 font-medium text-sm">
                      {prod.price ? `${prod.price} MAD` : '—'}
                      {margin && <span className="ml-1.5 text-xs text-green-600">({margin}%)</span>}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`font-semibold ${!prod.stock || prod.stock === 0 ? 'text-red-600' : prod.stock < 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {prod.stock ?? 0}
                      </span>
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${prod.condition === 'neuf' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {prod.condition === 'neuf' ? 'Neuf' : prod.condition === 'reconditionne' ? 'Recond.' : 'Occasion'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setModal({ open: true, product: prod })}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        {deleteId === prod.id ? (
                          <>
                            <Button variant="destructive" size="sm" className="h-7 text-xs" onClick={() => handleDelete(prod.id)}>Confirmer</Button>
                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setDeleteId(null)}>Annuler</Button>
                          </>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(prod.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ProductModal open={modal.open} onClose={() => setModal({ open: false, product: null })}
        product={modal.product} section={section} cfg={cfg} onSaved={load} />
    </div>
  );
};

// ─── Tab: Commandes ───────────────────────────────────────────────────────────
const CommandesTab = ({ storeKey, section, cfg }) => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [od, pd] = await Promise.allSettled([
        pb.collection('store_orders').getFullList({ filter: `store="${storeKey}"`, sort: '-created', requestKey: null }),
        pb.collection('products').getFullList({ filter: `section="${section}"`, sort: 'name', requestKey: null }),
      ]);
      setOrders(od.status === 'fulfilled' ? od.value : []);
      setProducts(pd.status === 'fulfilled' ? pd.value : []);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, [storeKey, section]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = (id, newStatus) => {
    setOrders(p => p.map(o => o.id === id ? { ...o, status: newStatus } : o));
    if (selectedOrder?.id === id) setSelectedOrder(o => ({ ...o, status: newStatus }));
  };

  const filtered = orders.filter(o => {
    const ms = !statusFilter || o.status === statusFilter;
    const q = search.toLowerCase();
    const mq = !q || o.client_nom?.toLowerCase().includes(q) || o.id?.toLowerCase().includes(q);
    return ms && mq;
  });

  const revenus = orders.filter(o => o.status === 'paid' || o.status === 'completed').reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total commandes', value: orders.length, icon: ShoppingCart, color: 'text-blue-600' },
          { label: 'En attente', value: orders.filter(o => o.status === 'pending').length, icon: Clock, color: 'text-yellow-600' },
          { label: 'Complétées', value: orders.filter(o => o.status === 'completed').length, icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Revenus confirmés', value: `${revenus.toFixed(0)} MAD`, icon: DollarSign, color: 'text-purple-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-bold mt-0.5">{value}</p></div>
                <Icon className={`w-6 h-6 ${color} opacity-70`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Rechercher client ou ID…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">Tous les statuts</option>
          {Object.entries(ORDER_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <Button variant="outline" size="icon" onClick={load}><RefreshCw className="w-4 h-4" /></Button>
        <Button onClick={() => setShowNew(true)} className={`bg-gradient-to-r ${cfg.gradient} text-white border-0 gap-2`}>
          <Plus className="w-4 h-4" />Nouvelle commande
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mr-2" />Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
          <ShoppingCart className="w-10 h-10 opacity-30" />
          <p>{orders.length === 0 ? 'Aucune commande encore. Créez-en une !' : 'Aucun résultat.'}</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {['ID', 'Client', 'Date', 'Total', 'Statut', ''].map((h, i) => (
                  <th key={i} className={`px-3 py-3 font-semibold text-muted-foreground text-left ${i === 0 ? 'pl-4' : ''} ${i === 2 ? 'hidden md:table-cell' : ''} ${i === 5 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                  <td className="pl-4 pr-3 py-3 font-mono text-xs text-muted-foreground">#{order.id?.slice(-6).toUpperCase()}</td>
                  <td className="px-3 py-3 font-medium">{order.client_nom || '—'}</td>
                  <td className="px-3 py-3 text-muted-foreground text-xs hidden md:table-cell">
                    {new Date(order.created).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-3 py-3 font-semibold">{(order.total || 0).toFixed(2)} MAD</td>
                  <td className="px-3 py-3"><StatusBadge status={order.status} /></td>
                  <td className="px-3 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedOrder(order)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <OrderDetailModal open={!!selectedOrder} onClose={() => setSelectedOrder(null)}
        order={selectedOrder} onStatusChange={handleStatusChange} />
      <NewOrderModal open={showNew} onClose={() => setShowNew(false)}
        section={section} storeKey={storeKey} products={products} cfg={cfg} onSaved={load} />
    </div>
  );
};

// ─── Tab: Comptabilité ────────────────────────────────────────────────────────
const ComptabiliteTab = ({ storeKey, section, cfg }) => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [od, pd] = await Promise.allSettled([
        pb.collection('store_orders').getFullList({ filter: `store="${storeKey}"`, sort: '-created', requestKey: null }),
        pb.collection('products').getFullList({ filter: `section="${section}"`, requestKey: null }),
      ]);
      setOrders(od.status === 'fulfilled' ? od.value : []);
      setProducts(pd.status === 'fulfilled' ? pd.value : []);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, [storeKey, section]);

  useEffect(() => { load(); }, [load]);

  const now = new Date();
  const start = new Date(now);
  if (period === 'week') start.setDate(now.getDate() - 7);
  else if (period === 'month') start.setMonth(now.getMonth() - 1);
  else if (period === 'quarter') start.setMonth(now.getMonth() - 3);
  else if (period === 'year') start.setFullYear(now.getFullYear() - 1);

  const filtered = period === 'all' ? orders : orders.filter(o => new Date(o.created) >= start);
  const paidOrders = filtered.filter(o => o.status === 'paid' || o.status === 'completed');
  const productMap = Object.fromEntries(products.map(p => [p.id, p]));

  let totalRevenue = 0, totalCost = 0;
  const rows = paidOrders.map(order => {
    let items = [];
    try { items = JSON.parse(order.items || '[]'); } catch {}
    const revenue = order.total || 0;
    const cost = items.reduce((s, it) => {
      const prod = productMap[it.product_id];
      return s + (prod?.buy_price || 0) * (it.qty || 1);
    }, 0);
    totalRevenue += revenue;
    totalCost += cost;
    return { order, revenue, cost, profit: revenue - cost };
  });

  const profit = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : 0;

  const generateReceipt = (order) => {
    let items = [];
    try { items = JSON.parse(order.items || '[]'); } catch {}
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Reçu #${order.id?.slice(-6).toUpperCase()}</title>
    <style>body{font-family:Arial,sans-serif;max-width:420px;margin:40px auto;color:#222;font-size:14px;}
    h1{font-size:20px;margin-bottom:4px;}.sub{color:#666;font-size:12px;margin-bottom:20px;}
    table{width:100%;border-collapse:collapse;margin:12px 0;}
    th,td{padding:7px 8px;border-bottom:1px solid #eee;font-size:12px;text-align:left;}
    th{background:#f5f5f5;font-weight:600;}.tot{font-weight:700;background:#f0f4ff;}
    .footer{margin-top:28px;font-size:10px;color:#999;text-align:center;border-top:1px dashed #ccc;padding-top:12px;}</style>
    </head><body>
    <h1>${cfg.name}</h1><p class="sub">Reçu de vente — ${new Date(order.created).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
    <p><strong>Client :</strong> ${order.client_nom || 'Client'}</p>
    ${order.client_tel ? `<p><strong>Tél :</strong> ${order.client_tel}</p>` : ''}
    <table><thead><tr><th>Article</th><th>Qté</th><th>Prix unit.</th><th>Total</th></tr></thead>
    <tbody>${items.map(it => `<tr><td>${it.name}</td><td>${it.qty}</td><td>${(it.price||0).toFixed(2)} MAD</td><td>${((it.qty||1)*(it.price||0)).toFixed(2)} MAD</td></tr>`).join('')}</tbody>
    <tfoot><tr class="tot"><td colspan="3">TOTAL</td><td>${(order.total||0).toFixed(2)} MAD</td></tr></tfoot></table>
    <p class="footer">Merci pour votre achat — ${cfg.name}</p></body></html>`);
    win.document.close(); win.print();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-muted-foreground">Période :</span>
        {[['week', '7 j'], ['month', '30 j'], ['quarter', '3 mois'], ['year', '12 mois'], ['all', 'Tout']].map(([v, l]) => (
          <Button key={v} size="sm" variant={period === v ? 'default' : 'outline'} onClick={() => setPeriod(v)}
            className={period === v ? `bg-gradient-to-r ${cfg.gradient} text-white border-0` : ''}>{l}</Button>
        ))}
        <Button variant="outline" size="icon" onClick={load} className="ml-auto"><RefreshCw className="w-4 h-4" /></Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Chiffre d'affaires", value: `${totalRevenue.toFixed(2)} MAD`, icon: TrendingUp, color: 'text-green-600' },
          { label: 'Coût des ventes', value: `${totalCost.toFixed(2)} MAD`, icon: ArrowDownRight, color: 'text-red-500' },
          { label: 'Bénéfice net', value: `${profit >= 0 ? '+' : ''}${profit.toFixed(2)} MAD`, icon: ArrowUpRight, color: profit >= 0 ? 'text-green-600' : 'text-red-600' },
          { label: 'Marge moyenne', value: `${margin}%`, icon: BarChart2, color: 'text-blue-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-lg font-bold mt-0.5 leading-tight">{value}</p></div>
                <Icon className={`w-6 h-6 ${color} opacity-70`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mr-2" />Chargement…</div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
          <CreditCard className="w-10 h-10 opacity-30" /><p>Aucune transaction sur cette période.</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <div className="px-4 py-3 bg-muted/40 flex items-center gap-2 border-b">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-sm">Transactions payées ({rows.length})</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                {['ID', 'Client', 'Date', 'Revenu', 'Coût', 'Bénéfice', ''].map((h, i) => (
                  <th key={i} className={`px-3 py-2.5 font-semibold text-muted-foreground text-xs text-left ${i === 0 ? 'pl-4' : ''} ${i === 2 || i === 4 ? 'hidden md:table-cell' : ''} ${i === 6 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(({ order, revenue, cost, profit: rowProfit }) => (
                <tr key={order.id} className="hover:bg-muted/20">
                  <td className="pl-4 pr-3 py-2.5 font-mono text-xs text-muted-foreground">#{order.id?.slice(-6).toUpperCase()}</td>
                  <td className="px-3 py-2.5">{order.client_nom || '—'}</td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs hidden md:table-cell">{new Date(order.created).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</td>
                  <td className="px-3 py-2.5 font-medium text-green-700">{revenue.toFixed(2)} MAD</td>
                  <td className="px-3 py-2.5 text-red-600 hidden md:table-cell">{cost.toFixed(2)} MAD</td>
                  <td className={`px-3 py-2.5 font-semibold ${rowProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}>{rowProfit >= 0 ? '+' : ''}{rowProfit.toFixed(2)} MAD</td>
                  <td className="px-3 py-2.5 text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => generateReceipt(order)} title="Reçu"><Download className="w-3.5 h-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-border bg-muted/30">
              <tr className="font-bold text-sm">
                <td className="pl-4 py-3" colSpan={3}>TOTAL</td>
                <td className="px-3 py-3 text-green-700">{totalRevenue.toFixed(2)} MAD</td>
                <td className="px-3 py-3 text-red-600 hidden md:table-cell">{totalCost.toFixed(2)} MAD</td>
                <td className={`px-3 py-3 ${profit >= 0 ? 'text-green-700' : 'text-red-600'}`}>{profit >= 0 ? '+' : ''}{profit.toFixed(2)} MAD</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── Tab: Statistiques ────────────────────────────────────────────────────────
const StatistiquesTab = ({ storeKey, section, cfg }) => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [od, pd] = await Promise.allSettled([
        pb.collection('store_orders').getFullList({ filter: `store="${storeKey}"`, sort: '-created', requestKey: null }),
        pb.collection('products').getFullList({ filter: `section="${section}"`, requestKey: null }),
      ]);
      setOrders(od.status === 'fulfilled' ? od.value : []);
      setProducts(pd.status === 'fulfilled' ? pd.value : []);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, [storeKey, section]);

  useEffect(() => { load(); }, [load]);

  // Revenue by month (last 6 months)
  const revenueByMonth = (() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push({ key, label: d.toLocaleDateString('fr-FR', { month: 'short' }), revenue: 0, nb: 0 });
    }
    orders.filter(o => o.status === 'paid' || o.status === 'completed').forEach(o => {
      const d = new Date(o.created);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const m = months.find(m => m.key === key);
      if (m) { m.revenue += o.total || 0; m.nb++; }
    });
    return months;
  })();

  const ordersByStatus = Object.entries(ORDER_STATUSES).map(([key, val]) => ({
    name: val.label, value: orders.filter(o => o.status === key).length,
    color: key === 'completed' ? '#10b981' : key === 'paid' ? '#6366f1' : key === 'pending' ? '#f59e0b' : '#ef4444',
  })).filter(s => s.value > 0);

  const stockByCat = (() => {
    const map = {};
    products.forEach(p => { const c = p.category || 'Autre'; map[c] = (map[c] || 0) + (p.stock || 0); });
    return Object.entries(map).map(([name, value], i) => ({ name, value, color: CHART_COLORS[i % CHART_COLORS.length] })).filter(c => c.value > 0);
  })();

  const topProducts = (() => {
    const map = {};
    orders.filter(o => o.status === 'paid' || o.status === 'completed').forEach(o => {
      let items = [];
      try { items = JSON.parse(o.items || '[]'); } catch {}
      items.forEach(it => {
        const k = it.product_id || it.name;
        if (!map[k]) map[k] = { nom: it.name, qty: 0, revenue: 0 };
        map[k].qty += it.qty || 1;
        map[k].revenue += (it.qty || 1) * (it.price || 0);
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  })();

  if (loading) return <div className="flex items-center justify-center h-60 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mr-2" />Chargement…</div>;

  return (
    <div className="space-y-6">
      <Card className="border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4" />Revenus — 6 derniers mois</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueByMonth} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v, n) => [n === 'revenue' ? `${(+v).toFixed(2)} MAD` : v, n === 'revenue' ? 'Revenus' : 'Commandes']} />
              <Bar dataKey="revenue" name="Revenus" fill={cfg.accent} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="border">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold flex items-center gap-2"><ShoppingCart className="w-4 h-4" />Statut des commandes</CardTitle></CardHeader>
          <CardContent>
            {ordersByStatus.length === 0
              ? <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">Aucune commande</div>
              : <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={ordersByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}
                      label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {ordersByStatus.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>}
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold flex items-center gap-2"><Box className="w-4 h-4" />Stock par catégorie</CardTitle></CardHeader>
          <CardContent>
            {stockByCat.length === 0
              ? <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">Aucun stock</div>
              : <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={stockByCat} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}
                      label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {stockByCat.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>}
          </CardContent>
        </Card>
      </div>

      <Card className="border">
        <CardHeader className="pb-2"><CardTitle className="text-base font-semibold flex items-center gap-2"><Tag className="w-4 h-4" />Top 5 produits (revenus)</CardTitle></CardHeader>
        <CardContent>
          {topProducts.length === 0
            ? <p className="text-muted-foreground text-sm text-center py-6">Aucune vente enregistrée</p>
            : <div className="space-y-3">
                {topProducts.map((p, i) => {
                  const pct = topProducts[0].revenue > 0 ? (p.revenue / topProducts[0].revenue) * 100 : 0;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium truncate max-w-[60%]">{p.nom}</span>
                        <span className="text-xs text-muted-foreground">{p.qty} ventes — <span className="font-semibold text-foreground">{p.revenue.toFixed(2)} MAD</span></span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: cfg.accent }} />
                      </div>
                    </div>
                  );
                })}
              </div>}
        </CardContent>
      </Card>
    </div>
  );
};

// ─── Tab: Clients ─────────────────────────────────────────────────────────────
const ClientsTab = ({ storeKey, cfg }) => {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [expanded, setExpanded] = useState(null); // client key currently expanded

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let result = [];
      try {
        // Essai 1 : filtre serveur (plus rapide si le champ existe)
        result = await pb.collection('store_orders').getFullList({
          filter: `store="${storeKey}"`,
          sort: '-created',
          requestKey: null,
        });
      } catch {
        try {
          // Essai 2 : fetch global puis filtre côté client (si champ "store" absent du schéma)
          const all = await pb.collection('store_orders').getFullList({
            sort: '-created',
            requestKey: null,
          });
          result = all.filter(o => !o.store || o.store === storeKey);
        } catch {
          // Collection absente ou accès refusé → liste vide sans crash
          result = [];
        }
      }
      setOrders(result);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [storeKey]);

  useEffect(() => { load(); }, [load]);

  // ── Construire la liste des clients uniques ──
  const clients = (() => {
    const map = {};
    for (const o of orders) {
      const nom = (o.client_nom || '').trim() || 'Client inconnu';
      const tel = (o.client_tel || '').trim();
      // clé unique : nom + tel (pour éviter les doublons dus à des fautes de frappe mineures)
      const key = `${nom.toLowerCase()}||${tel}`;
      if (!map[key]) {
        map[key] = { key, nom, tel, orders: [], total: 0, lastDate: null };
      }
      map[key].orders.push(o);
      map[key].total += o.total || 0;
      const d = new Date(o.created);
      if (!map[key].lastDate || d > map[key].lastDate) map[key].lastDate = d;
    }
    return Object.values(map).sort((a, b) => b.lastDate - a.lastDate);
  })();

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return !q || c.nom.toLowerCase().includes(q) || c.tel.includes(q);
  });

  const totalClients  = clients.length;
  const totalRevenue  = clients.reduce((s, c) => s + c.total, 0);
  const topClient     = clients.length ? clients.reduce((a, b) => a.total > b.total ? a : b) : null;
  const avgOrderValue = orders.length ? (orders.reduce((s, o) => s + (o.total || 0), 0) / orders.length) : 0;

  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Clients uniques',    value: totalClients,                  icon: Users,       color: 'text-blue-600' },
          { label: 'Meilleur client',    value: topClient ? topClient.nom : '—', icon: TrendingUp,  color: 'text-emerald-600' },
          { label: 'Panier moyen',       value: `${avgOrderValue.toFixed(0)} MAD`, icon: ShoppingCart, color: 'text-purple-600' },
          { label: 'CA clients',         value: `${totalRevenue.toFixed(0)} MAD`, icon: DollarSign,  color: 'text-amber-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-lg font-bold mt-0.5 truncate max-w-[130px]" title={value}>{value}</p>
                </div>
                <Icon className={`w-6 h-6 ${color} opacity-70 flex-shrink-0`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Rechercher par nom ou téléphone…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button variant="outline" size="icon" onClick={load}><RefreshCw className="w-4 h-4" /></Button>
      </div>

      {/* Client list */}
      {loading ? (
        <div className="flex items-center justify-center h-40 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />Chargement…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
          <Users className="w-10 h-10 opacity-30" />
          <p className="text-sm text-center px-4">
            {clients.length === 0
              ? 'Aucun client encore. Les clients apparaîtront ici dès qu\'une commande est créée dans ce magasin.'
              : 'Aucun résultat pour cette recherche.'}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden divide-y divide-border">
          {filtered.map((c) => {
            const isOpen = expanded === c.key;
            const paidOrders = c.orders.filter(o => o.status === 'paid' || o.status === 'completed');
            return (
              <div key={c.key}>
                {/* Client row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : c.key)}
                  className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-muted/30 transition-colors text-left"
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${cfg.gradient} flex items-center justify-center flex-shrink-0 text-white font-bold text-sm`}>
                    {c.nom.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{c.nom}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {c.tel && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="w-3 h-3" />{c.tel}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {c.orders.length} commande{c.orders.length > 1 ? 's' : ''}
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        {c.total.toFixed(2)} MAD
                      </span>
                    </div>
                  </div>

                  {/* Last date */}
                  <div className="text-right hidden sm:block flex-shrink-0">
                    <p className="text-xs text-muted-foreground">Dernier achat</p>
                    <p className="text-xs font-medium text-foreground">
                      {c.lastDate?.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Fidélité badge */}
                  <div className="flex-shrink-0">
                    {c.orders.length >= 5 ? (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-semibold">⭐ Fidèle</span>
                    ) : c.orders.length >= 2 ? (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">Régulier</span>
                    ) : (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">Nouveau</span>
                    )}
                  </div>

                  {/* Chevron */}
                  {isOpen
                    ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  }
                </button>

                {/* Expanded: historique commandes */}
                {isOpen && (
                  <div className="bg-muted/20 px-4 pb-4 pt-2 border-t border-border">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5" />Historique des commandes
                    </p>
                    <div className="space-y-2">
                      {c.orders.map(o => {
                        let items = [];
                        try { items = JSON.parse(o.items || '[]'); } catch {}
                        return (
                          <div key={o.id} className="bg-card rounded-xl border px-4 py-3 flex items-center gap-4 flex-wrap">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs text-muted-foreground">#{o.id?.slice(-6).toUpperCase()}</span>
                                <StatusBadge status={o.status} />
                              </div>
                              {items.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                  {items.map(it => `${it.name} ×${it.qty}`).join(' · ')}
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-foreground">{(o.total || 0).toFixed(2)} MAD</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(o.created).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Récap client */}
                    <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground border-t pt-3">
                      <span>{c.orders.length} commande{c.orders.length > 1 ? 's' : ''}</span>
                      <span>|</span>
                      <span>{paidOrders.length} payée{paidOrders.length > 1 ? 's' : ''}</span>
                      <span>|</span>
                      <span className="font-semibold text-foreground">{c.total.toFixed(2)} MAD total</span>
                    </div>
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

// ─── Main page ────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'produits',      label: 'Produits',      icon: Package },
  { key: 'commandes',     label: 'Commandes',     icon: ShoppingCart },
  { key: 'clients',       label: 'Clients',       icon: Users },
  { key: 'comptabilite',  label: 'Comptabilité',  icon: CreditCard },
  { key: 'statistiques',  label: 'Statistiques',  icon: BarChart2 },
];

const AdminMagasinPage = () => {
  const { t } = useTranslation();
  const { store } = useParams();
  const [activeTab, setActiveTab] = useState('produits');

  const cfg = store ? STORES[store] : null;
  const title = cfg ? cfg.name : t('admin.nav.section.magasin') || 'Magasins';

  return (
    <AdminLayout>
      <Helmet><title>{title} — IWS Admin</title></Helmet>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {cfg ? (
          <StoreLogo store={cfg} className="h-20 max-w-[220px] object-contain" iconSize="w-7 h-7" />
        ) : (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-600 to-rose-500 text-white shadow-lg">
            <ShoppingBag className="w-7 h-7" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {cfg && <p className="text-muted-foreground text-sm">{cfg.subtitle}</p>}
        </div>
      </div>

      {/* Hub view — store switcher */}
      {!store && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {Object.entries(STORES).map(([key, s]) => (
            <Link key={key} to={`/admin/magasin/${key}`}>
              <Card className={`border-2 ${s.border} hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden`}>
                <div className={`h-2 bg-gradient-to-r ${s.gradient}`} />
                <CardContent className="pt-6 pb-5">
                  <div className="flex items-start justify-between mb-5">
                    <StoreLogo store={s} className="h-24 max-w-[180px] object-contain" iconSize="w-6 h-6" />
                    <ArrowRight className={`w-5 h-5 ${s.color} opacity-0 group-hover:opacity-100 transition-all ml-auto`} />
                  </div>
                  <h2 className={`text-xl font-bold ${s.color}`}>{s.name}</h2>
                  <p className="text-muted-foreground text-sm mt-1">{s.subtitle}</p>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {TABS.map(tab => (
                      <Badge key={tab.key} variant="outline" className={`text-xs ${s.border} ${s.color}`}>{tab.label}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Store view — 4 tabs */}
      {cfg && (
        <>
          {/* Tab bar */}
          <div className="flex gap-1 p-1 rounded-xl mb-6 bg-muted/50">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === key
                    ? `bg-gradient-to-r ${cfg.gradient} text-white shadow-md`
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                }`}>
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {activeTab === 'produits'      && <ProduitsTab     storeKey={store} section={cfg.section} cfg={cfg} />}
          {activeTab === 'commandes'     && <CommandesTab    storeKey={store} section={cfg.section} cfg={cfg} />}
          {activeTab === 'clients'       && <ClientsTab      storeKey={store} cfg={cfg} />}
          {activeTab === 'comptabilite'  && <ComptabiliteTab storeKey={store} section={cfg.section} cfg={cfg} />}
          {activeTab === 'statistiques'  && <StatistiquesTab storeKey={store} section={cfg.section} cfg={cfg} />}

          {/* Store navigation */}
          <div className="flex items-center gap-3 flex-wrap mt-8 pt-6 border-t">
            <Link to="/admin/magasin">
              <Button variant="outline" size="sm" className="gap-2">
                <ShoppingBag className="w-4 h-4" />Tous les magasins
              </Button>
            </Link>
            {Object.entries(STORES).filter(([k]) => k !== store).map(([k, s]) => {
              const Ic = s.icon;
              return (
                <Link key={k} to={`/admin/magasin/${k}`}>
                  <Button variant="outline" size="sm" className={`gap-2 ${s.color} border ${s.border}`}>
                    <Ic className="w-4 h-4" />{s.name}
                  </Button>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminMagasinPage;
