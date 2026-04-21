import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useTranslation } from '@/i18n/useTranslation.js';
import { toast } from 'sonner';
import {
  ShoppingCart, Loader2, ArrowLeft, CheckCircle, Minus, Plus,
  XCircle, ChevronLeft, ChevronRight, Image as ImageIcon, Tag,
  Package, Layers
} from 'lucide-react';

const PB_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090';

// Build array of image URLs from PocketBase product record
const getImageUrls = (product) => {
  if (!product) return [];
  const imgs = product.images;
  if (Array.isArray(imgs) && imgs.length > 0) {
    return imgs.filter(Boolean).map(
      (filename) => `${PB_URL}/api/files/products/${product.id}/${filename}`
    );
  }
  if (typeof imgs === 'string' && imgs) {
    return [`${PB_URL}/api/files/products/${product.id}/${imgs}`];
  }
  if (product.image_url) return [product.image_url];
  return [];
};

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const record = await pb.collection('products').getOne(id);
        setProduct(record);
      } catch (err) {
        setError(err.message || 'Produit introuvable');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const imageUrls = product ? getImageUrls(product) : [];
  const hasImages = imageUrls.length > 0;
  const hasMultipleImages = imageUrls.length > 1;

  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex(prev => prev === 0 ? imageUrls.length - 1 : prev - 1);
  }, [imageUrls.length]);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex(prev => prev === imageUrls.length - 1 ? 0 : prev + 1);
  }, [imageUrls.length]);

  const handleQuantityChange = useCallback((amount) => {
    setQuantity(prev => {
      const next = prev + amount;
      if (next < 1) return 1;
      if (product?.stock != null && next > product.stock) return prev;
      return next;
    });
  }, [product?.stock]);

  const handleAddToCart = useCallback(async () => {
    if (!product) return;
    const variant = {
      id: product.id,
      title: 'Standard',
      price_in_cents: product.price * 100,
      sale_price_formatted: `${product.price} MAD`,
      currency_info: 'MAD',
      manage_inventory: product.stock != null,
    };
    try {
      await addToCart(product, variant, quantity, product.stock || 999);
      toast.success(t('store.addedToCart'));
    } catch (err) {
      toast.error(err.message);
    }
  }, [product, quantity, addToCart, t]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <XCircle className="w-16 h-16 text-destructive" />
        <p className="text-lg text-muted-foreground text-center">{error || 'Produit introuvable'}</p>
        <Button asChild variant="outline">
          <Link to="/store">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au magasin
          </Link>
        </Button>
      </div>
    );
  }

  const isOutOfStock = product.stock != null && product.stock <= 0;
  const stockManaged = product.stock != null;

  return (
    <>
      <Helmet>
        <title>{product.name} - IWS LAAYOUNE</title>
        <meta name="description" content={product.description?.substring(0, 160) || product.name} />
      </Helmet>

      <div className="min-h-screen bg-background pt-20 pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Back link */}
          <Link
            to="/store"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Retour au magasin
          </Link>

          <div className="grid md:grid-cols-2 gap-10 bg-card border border-border rounded-3xl p-6 md:p-10 shadow-xl">

            {/* ── Image Section ─────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* Main image */}
              <div className="relative aspect-square bg-muted/30 rounded-2xl overflow-hidden flex items-center justify-center shadow-md">
                {hasImages ? (
                  <img
                    key={currentImageIndex}
                    src={imageUrls[currentImageIndex]}
                    alt={`${product.name} ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <ImageIcon className="w-20 h-20 text-muted-foreground/20" />
                )}

                {/* Prev / Next arrows */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background text-foreground p-2 rounded-full shadow transition-colors"
                      aria-label="Image précédente"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background text-foreground p-2 rounded-full shadow transition-colors"
                      aria-label="Image suivante"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Condition badge */}
                {product.condition && (
                  <div className="absolute top-3 left-3">
                    {product.condition === 'neuf' ? (
                      <span className="px-2.5 py-1 bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] text-xs font-bold rounded-md shadow-sm">
                        {t('store.badges.new')}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-muted text-muted-foreground text-xs font-bold rounded-md shadow-sm border border-border">
                        {t('store.badges.used')}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Dot indicators */}
              {hasMultipleImages && (
                <div className="flex justify-center gap-2 mt-3">
                  {imageUrls.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        i === currentImageIndex ? 'bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'
                      }`}
                      aria-label={`Image ${i + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Thumbnail strip */}
              {hasMultipleImages && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {imageUrls.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        i === currentImageIndex
                          ? 'border-primary'
                          : 'border-border hover:border-accent'
                      }`}
                    >
                      <img src={url} alt={`Miniature ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* ── Info Section ──────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="flex flex-col"
            >
              {/* Category */}
              {product.category && (
                <div className="flex items-center gap-1.5 mb-2">
                  <Tag className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                    {product.category}
                  </span>
                </div>
              )}

              <h1 className="text-3xl font-extrabold text-primary mb-2 leading-tight">
                {product.name}
              </h1>

              {product.brand && (
                <p className="text-sm text-muted-foreground mb-4">
                  Marque : <span className="font-medium text-foreground">{product.brand}</span>
                </p>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-extrabold text-primary">{product.price}</span>
                <span className="text-lg font-medium text-muted-foreground">MAD</span>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Stock info */}
              <div className="flex items-center gap-2 mb-6">
                {stockManaged ? (
                  product.stock > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-sm text-green-500 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      En stock ({product.stock} disponibles)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-sm text-destructive font-medium">
                      <XCircle className="w-4 h-4" />
                      Rupture de stock
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Package className="w-4 h-4" />
                    Disponible sur commande
                  </span>
                )}
              </div>

              {/* Quantity selector */}
              {!isOutOfStock && (
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-sm font-medium text-muted-foreground">Quantité :</span>
                  <div className="flex items-center border border-border rounded-full p-1">
                    <Button
                      onClick={() => handleQuantityChange(-1)}
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-8 w-8 hover:bg-muted"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-10 text-center font-bold text-foreground">{quantity}</span>
                    <Button
                      onClick={() => handleQuantityChange(1)}
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-8 w-8 hover:bg-muted"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Add to cart */}
              <div className="mt-auto">
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  disabled={isOutOfStock}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base py-3 rounded-xl disabled:opacity-50"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {isOutOfStock ? 'Rupture de stock' : t('store.buttons.addToCart')}
                </Button>
              </div>

              {/* Extra info row */}
              {(product.section) && (
                <div className="mt-6 pt-6 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                  <Layers className="w-3.5 h-3.5" />
                  <span>
                    Rayon : {product.section === 'musik' ? 'Instruments de musique' : product.section === 'pc' ? 'Informatique' : product.section}
                  </span>
                </div>
              )}
            </motion.div>

          </div>
        </div>
      </div>
    </>
  );
}

export default ProductDetailPage;
