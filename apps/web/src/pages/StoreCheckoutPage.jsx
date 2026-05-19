/**
 * StoreCheckoutPage — Commande invité (sans compte)
 * Route : /store/checkout
 *
 * 1. Affiche le récapitulatif du panier
 * 2. Formulaire de livraison (Maroc uniquement)
 * 3. Paiement PayPal → redirige vers /store/success
 */

import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useCart } from '@/hooks/useCart.jsx';
import {
  ShoppingBag, MapPin, User, Mail, Phone, Home, Building2,
  Hash, ChevronRight, ArrowLeft, Loader2, AlertCircle, Lock,
  Package, CreditCard,
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL  = import.meta.env.VITE_API_URL  || 'http://localhost:3001';
const PB_URL   = import.meta.env.VITE_PB_URL   || 'http://localhost:8090';

// Détecte le magasin depuis la section du premier produit du panier
const SECTION_TO_STORE = {
  musik: { storeKey: 'laayounemusik', label: 'LaayouneMusik' },
  pc:    { storeKey: 'iwstech',       label: 'IwsTech Company' },
};

// Villes marocaines courantes
const VILLES_MAROC = [
  'Casablanca','Rabat','Marrakech','Fès','Tanger','Agadir','Meknès','Oujda',
  'Kénitra','Tétouan','El Jadida','Safi','Laâyoune','Dakhla','Beni Mellal',
  'Settat','Berrechid','Nador','Khémisset','Taroudant','Guelmim','Tiznit',
];

const FIELD = ({ icon: Icon, label, required, error, children }) => (
  <div>
    <label className="block text-sm font-semibold text-foreground mb-1.5">
      {Icon && <Icon className="inline w-3.5 h-3.5 mr-1.5 text-muted-foreground" />}
      {label}{required && <span className="text-destructive ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-destructive mt-1">{error}</p>}
  </div>
);

export default function StoreCheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep]       = useState('form');   // form | paying
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const [form, setForm] = useState({
    prenom:      '',
    nom:         '',
    email:       '',
    telephone:   '',
    adresse:     '',
    ville:       '',
    code_postal: '',
  });

  // Détecte le magasin depuis le premier article
  const storeInfo = useMemo(() => {
    if (!cartItems.length) return null;
    const section = cartItems[0]?.product?.section || 'musik';
    return SECTION_TO_STORE[section] || SECTION_TO_STORE.musik;
  }, [cartItems]);

  // Total du panier
  const total = useMemo(() =>
    cartItems.reduce((s, it) => {
      const price = it.variant?.sale_price_in_cents ?? it.variant?.price_in_cents ?? 0;
      return s + (price / 100) * it.quantity;
    }, 0),
  [cartItems]);

  // Articles pour le backend
  const itemsPayload = cartItems.map(it => ({
    product_id: it.product?.id || '',
    name:       it.product?.name || it.product?.titre || '?',
    qty:        it.quantity,
    price:      (it.variant?.sale_price_in_cents ?? it.variant?.price_in_cents ?? 0) / 100,
  }));

  // ── Validation ─────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.prenom.trim())    e.prenom    = 'Prénom requis';
    if (!form.nom.trim())       e.nom       = 'Nom requis';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = 'Email valide requis';
    if (!form.telephone.trim()) e.telephone = 'Téléphone requis';
    if (!form.adresse.trim())   e.adresse   = 'Adresse requise';
    if (!form.ville.trim())     e.ville     = 'Ville requise';
    if (!form.code_postal.trim()) e.code_postal = 'Code postal requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Paiement PayPal ────────────────────────────────────────────
  const handlePayPal = async () => {
    if (!validate()) {
      toast.error('Merci de remplir tous les champs obligatoires');
      return;
    }
    if (!cartItems.length) {
      toast.error('Votre panier est vide');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/paypal/create-order`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount:      total,
          description: `Commande ${storeInfo?.label} — ${itemsPayload.length} article(s)`,
          orderType:   'store',
          storeKey:    storeInfo?.storeKey || 'laayounemusik',
          section:     cartItems[0]?.product?.section || 'musik',
          clientNom:   `${form.prenom} ${form.nom}`.trim(),
          clientEmail: form.email,
          clientTel:   form.telephone,
          adresse:     form.adresse,
          ville:       form.ville,
          codePostal:  form.code_postal,
          items:       itemsPayload,
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `Erreur serveur (${res.status})`);
      }

      const data = await res.json();
      if (!data.approvalUrl) throw new Error("Pas d'URL de paiement retournée");

      // Sauvegarder les infos client dans sessionStorage pour la page de succès
      sessionStorage.setItem('checkout_client', JSON.stringify({
        nom: `${form.prenom} ${form.nom}`.trim(),
        email: form.email,
        ville: form.ville,
      }));

      clearCart();
      window.location.href = data.approvalUrl;

    } catch (e) {
      toast.error(e.message);
      setLoading(false);
    }
  };

  // Panier vide
  if (!cartItems.length && step === 'form') {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-2xl p-10 text-center max-w-md w-full">
          <ShoppingBag className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Votre panier est vide</h2>
          <p className="text-muted-foreground text-sm mb-6">Ajoutez des articles depuis notre magasin</p>
          <Link to="/store" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
            <ShoppingBag className="w-4 h-4" /> Retour au magasin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Commander — IWS Laayoune</title></Helmet>

      {/* Header simple (pas de DashboardLayout car invité) */}
      <header className="h-14 bg-card border-b border-border flex items-center px-4 sm:px-8 gap-3 sticky top-0 z-30">
        <Link to="/store" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Magasin
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
        <span className="text-sm font-semibold text-foreground">Commander</span>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="w-3 h-3" /> Paiement sécurisé
        </div>
      </header>

      <main className="min-h-screen bg-muted py-8 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Formulaire (col 3) ───────────────────────── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Coordonnées */}
            <section className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-bold text-foreground flex items-center gap-2 mb-5">
                <User className="w-4 h-4 text-primary" /> Vos coordonnées
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <FIELD icon={User} label="Prénom" required error={errors.prenom}>
                  <input
                    type="text" value={form.prenom} placeholder="Mohamed"
                    onChange={e => setForm(p => ({ ...p, prenom: e.target.value }))}
                    className={`w-full h-10 rounded-lg border px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.prenom ? 'border-destructive' : 'border-input'}`}
                  />
                </FIELD>
                <FIELD icon={User} label="Nom" required error={errors.nom}>
                  <input
                    type="text" value={form.nom} placeholder="Alami"
                    onChange={e => setForm(p => ({ ...p, nom: e.target.value }))}
                    className={`w-full h-10 rounded-lg border px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.nom ? 'border-destructive' : 'border-input'}`}
                  />
                </FIELD>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <FIELD icon={Mail} label="Email" required error={errors.email}>
                  <input
                    type="email" value={form.email} placeholder="vous@email.com"
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className={`w-full h-10 rounded-lg border px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.email ? 'border-destructive' : 'border-input'}`}
                  />
                </FIELD>
                <FIELD icon={Phone} label="Téléphone" required error={errors.telephone}>
                  <input
                    type="tel" value={form.telephone} placeholder="+212 6XX XXX XXX"
                    onChange={e => setForm(p => ({ ...p, telephone: e.target.value }))}
                    className={`w-full h-10 rounded-lg border px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.telephone ? 'border-destructive' : 'border-input'}`}
                  />
                </FIELD>
              </div>
            </section>

            {/* Adresse de livraison */}
            <section className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-bold text-foreground flex items-center gap-2 mb-5">
                <MapPin className="w-4 h-4 text-primary" /> Adresse de livraison
              </h2>
              <div className="space-y-4">
                <FIELD icon={Home} label="Adresse" required error={errors.adresse}>
                  <input
                    type="text" value={form.adresse} placeholder="N° rue, quartier, immeuble…"
                    onChange={e => setForm(p => ({ ...p, adresse: e.target.value }))}
                    className={`w-full h-10 rounded-lg border px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.adresse ? 'border-destructive' : 'border-input'}`}
                  />
                </FIELD>
                <div className="grid grid-cols-2 gap-4">
                  <FIELD icon={Building2} label="Ville" required error={errors.ville}>
                    <input
                      type="text" value={form.ville} placeholder="Laâyoune"
                      list="villes-maroc"
                      onChange={e => setForm(p => ({ ...p, ville: e.target.value }))}
                      className={`w-full h-10 rounded-lg border px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.ville ? 'border-destructive' : 'border-input'}`}
                    />
                    <datalist id="villes-maroc">
                      {VILLES_MAROC.map(v => <option key={v} value={v} />)}
                    </datalist>
                  </FIELD>
                  <FIELD icon={Hash} label="Code postal" required error={errors.code_postal}>
                    <input
                      type="text" value={form.code_postal} placeholder="70000"
                      onChange={e => setForm(p => ({ ...p, code_postal: e.target.value }))}
                      className={`w-full h-10 rounded-lg border px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.code_postal ? 'border-destructive' : 'border-input'}`}
                    />
                  </FIELD>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2.5 text-xs text-blue-700 dark:text-blue-300">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  Livraison uniquement au <strong className="ml-1">Maroc</strong>
                </div>
              </div>
            </section>

          </div>

          {/* ── Récapitulatif panier (col 2) ─────────────── */}
          <div className="lg:col-span-2 space-y-4">

            <section className="bg-card border border-border rounded-2xl p-5">
              <h2 className="font-bold text-foreground flex items-center gap-2 mb-4">
                <Package className="w-4 h-4 text-primary" /> Votre commande
              </h2>

              <div className="space-y-3">
                {cartItems.map((it, i) => {
                  const price = (it.variant?.sale_price_in_cents ?? it.variant?.price_in_cents ?? 0) / 100;
                  const name  = it.product?.name || it.product?.titre || 'Produit';
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg border bg-muted/40 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {it.product?.images?.[0]
                          ? <img src={`${PB_URL}/api/files/products/${it.product.id}/${it.product.images[0]}`} alt={name} className="w-full h-full object-cover" />
                          : <Package className="w-5 h-5 text-muted-foreground" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{name}</p>
                        <p className="text-xs text-muted-foreground">Qté : {it.quantity}</p>
                      </div>
                      <p className="text-sm font-bold flex-shrink-0">{(price * it.quantity).toFixed(0)} MAD</p>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-border mt-4 pt-4 space-y-1.5">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Sous-total</span>
                  <span>{total.toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Livraison</span>
                  <span className="text-emerald-600 font-semibold">À définir</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-1 border-t border-border mt-1">
                  <span>Total</span>
                  <span className="text-primary">{total.toFixed(2)} MAD</span>
                </div>
              </div>
            </section>

            {/* Bouton PayPal */}
            <section className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <h2 className="font-bold text-foreground flex items-center gap-2 mb-1">
                <CreditCard className="w-4 h-4 text-primary" /> Paiement
              </h2>

              <button
                onClick={handlePayPal}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-[#0070BA] hover:bg-[#003087] disabled:opacity-60 text-white font-bold rounded-full px-6 py-3.5 transition-colors shadow-md"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Redirection vers PayPal…</>
                ) : (
                  <>
                    <PayPalLogo />
                    Payer {total.toFixed(2)} MAD avec PayPal
                  </>
                )}
              </button>

              <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3" /> Paiement 100 % sécurisé via PayPal
              </p>

              <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2.5 text-xs text-amber-700 dark:text-amber-300">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                Vous serez redirigé vers PayPal. Revenez sur ce site après confirmation pour finaliser votre commande.
              </div>
            </section>

          </div>
        </div>
      </main>
    </>
  );
}

// Logo PayPal
const PayPalLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M7.5 21L9 3h6.5c2.5 0 4.5 1 4.5 4 0 4-3 6-6.5 6H11L9.5 21H7.5z" fill="#fff" opacity="0.8"/>
    <path d="M4 21l1.5-18H12c2.5 0 4.5 1 4.5 4 0 4-3 6-6.5 6H7.5L6 21H4z" fill="#fff"/>
  </svg>
);
