
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation.js';
import { useCart } from '@/hooks/useCart.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const PB_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090';

// Retourne l'URL de la première image d'un produit (champ file `images` ou fallback `image_url`)
const getProductImageUrl = (product) => {
  const imgs = product?.images;
  if (Array.isArray(imgs) && imgs.length > 0 && imgs[0]) {
    return `${PB_URL}/api/files/products/${product.id}/${imgs[0]}`;
  }
  if (typeof imgs === 'string' && imgs) {
    return `${PB_URL}/api/files/products/${product.id}/${imgs}`;
  }
  return product?.image_url || null;
};

const ProductCard = ({ product, isRtl }) => {
  const { t } = useTranslation();
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    // Create a default variant for the cart since our simple DB doesn't have variants
    const defaultVariant = {
      id: product.id,
      title: 'Standard',
      price_in_cents: product.price * 100,
      sale_price_formatted: `${product.price} MAD`,
      currency_info: 'MAD',
      manage_inventory: product.stock !== null && product.stock !== undefined
    };

    addToCart(product, defaultVariant, 1, product.stock || 999)
      .then(() => toast.success(t('store.addedToCart')))
      .catch(err => toast.error(err.message));
  };

  return (
    <Card className="group flex flex-col h-full border-border hover:border-accent/50 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden bg-card" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Image Container */}
      <div className="relative aspect-square bg-muted/30 overflow-hidden flex items-center justify-center">
        {getProductImageUrl(product) ? (
          <img
            src={getProductImageUrl(product)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div className="w-full h-full items-center justify-center" style={{ display: getProductImageUrl(product) ? 'none' : 'flex' }}>
          <ImageIcon className="w-16 h-16 text-muted-foreground/20" />
        </div>
        
        {/* Badges */}
        <div className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} flex flex-col gap-2`}>
          {product.condition === 'neuf' && (
            <span className="px-2.5 py-1 bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] text-xs font-bold rounded-md shadow-sm">
              {t('store.badges.new')}
            </span>
          )}
          {product.condition === 'occasion' && (
            <span className="px-2.5 py-1 bg-muted text-muted-foreground text-xs font-bold rounded-md shadow-sm border border-border">
              {t('store.badges.used')}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-5 flex flex-col flex-1">
        <div className="mb-2">
          <span className="text-xs font-medium text-accent uppercase tracking-wider">
            {product.category}
          </span>
        </div>
        
        <h3 className="font-bold text-lg text-primary mb-2 line-clamp-2 leading-tight">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
            {product.description}
          </p>
        )}
        
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-border">
          <span className="text-xl font-extrabold text-primary">
            {product.price} <span className="text-sm font-medium text-muted-foreground">MAD</span>
          </span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button
            onClick={handleAddToCart}
            className="bg-primary hover:bg-primary/90 text-primary-foreground w-full flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="sr-only md:not-sr-only text-xs">{t('store.buttons.addToCart')}</span>
          </Button>
          <Link to={`/product/${product.id}`} className="w-full">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border-border hover:bg-muted"
            >
              <Eye className="w-4 h-4" />
              <span className="sr-only md:not-sr-only text-xs">{t('store.buttons.viewDetails')}</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
