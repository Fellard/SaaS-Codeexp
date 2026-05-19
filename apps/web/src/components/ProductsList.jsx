
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation.js';
import { useCart } from '@/hooks/useCart.jsx';
import { getProducts, formatCurrency } from '@/api/EcommerceApi.js';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const ProductsList = () => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts().then(data => {
      setProducts(data.items || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">No products found.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(product => (
        <div key={product.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col">
          <Link to={`/product/${product.id}`} className="aspect-square bg-muted relative overflow-hidden">
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
            )}
          </Link>
          <div className="p-5 flex flex-col flex-1">
            <Link to={`/product/${product.id}`}>
              <h3 className="font-bold text-lg text-foreground mb-1 hover:text-primary transition-colors">{product.name}</h3>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {product.description || t('store.productDescription')}
            </p>
            <div className="mt-auto flex items-center justify-between">
              <span className="font-bold text-lg">{formatCurrency(product.price)}</span>
              <Button onClick={() => addToCart(product, null, 1)} size="sm">
                {t('store.addToCart')}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductsList;
