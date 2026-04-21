
import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { PackageX } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useTranslation } from '@/i18n/useTranslation.js';
import { useLanguage } from '@/hooks/useLanguage.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import FilterPanel from '@/components/FilterPanel.jsx';
import ProductCard from '@/components/ProductCard.jsx';
import { Skeleton } from '@/components/ui/skeleton';

const StorePage = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRtl = language?.startsWith('ar');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('musik'); // 'musik' or 'pc'
  
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    brand: '',
    condition: ''
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const records = await pb.collection('products').getFullList({
          sort: '-created',
          requestKey: null
        });
        setProducts(records);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Reset filters when switching sections
  useEffect(() => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      brand: '',
      condition: ''
    });
  }, [activeSection]);

  // Unique categories for the active section (passed to FilterPanel)
  const sectionCategories = useMemo(() => {
    const cats = products
      .filter(p => p.section === activeSection && p.category)
      .map(p => p.category);
    return [...new Set(cats)].sort();
  }, [products, activeSection]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Section filter
      if (product.section !== activeSection) return false;
      
      // Category filter
      if (filters.category && !product.category.toLowerCase().includes(filters.category.toLowerCase())) return false;
      
      // Price filter
      if (filters.minPrice && product.price < parseFloat(filters.minPrice)) return false;
      if (filters.maxPrice && product.price > parseFloat(filters.maxPrice)) return false;
      
      // Brand filter
      if (filters.brand && product.brand && !product.brand.toLowerCase().includes(filters.brand.toLowerCase())) return false;
      
      // Condition filter (only for computers)
      if (activeSection === 'pc' && filters.condition && product.condition !== filters.condition) return false;

      return true;
    });
  }, [products, activeSection, filters]);

  return (
    <>
      <Helmet>
        <title>{t('store.title')} - IWS LAAYOUNE</title>
        <meta name="description" content={t('store.desc')} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
        <Header />
        
        <main className="flex-1 pt-20 pb-24">
          {/* Hero Section */}
          <div className="bg-primary py-20 text-center mb-12 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
                {t('store.title')}
              </h1>
              <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto px-4 font-medium">
                {t('store.subtitle')}
              </p>
              <div className="w-24 h-1.5 bg-accent mx-auto rounded-full mt-8"></div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Section Tabs */}
            <div className="flex justify-center mb-12">
              <div className="inline-flex bg-muted p-1.5 rounded-xl shadow-inner">
                <button
                  onClick={() => setActiveSection('musik')}
                  className={`px-6 py-3 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 ${
                    activeSection === 'musik' 
                      ? 'bg-card text-primary shadow-md' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t('store.tabs.music')}
                </button>
                <button
                  onClick={() => setActiveSection('pc')}
                  className={`px-6 py-3 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 ${
                    activeSection === 'pc' 
                      ? 'bg-card text-primary shadow-md' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t('store.tabs.computers')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar Filters */}
              <div className="lg:col-span-1">
                <FilterPanel
                  filters={filters}
                  setFilters={setFilters}
                  section={activeSection}
                  categories={sectionCategories}
                  isRtl={isRtl}
                />
              </div>

              {/* Product Grid */}
              <div className="lg:col-span-3">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="bg-card rounded-2xl p-4 border border-border">
                        <Skeleton className="aspect-square w-full rounded-xl mb-4" />
                        <Skeleton className="h-4 w-1/3 mb-2" />
                        <Skeleton className="h-6 w-3/4 mb-4" />
                        <Skeleton className="h-8 w-1/2 mb-6" />
                        <div className="grid grid-cols-2 gap-2">
                          <Skeleton className="h-10 w-full rounded-md" />
                          <Skeleton className="h-10 w-full rounded-md" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-24 bg-muted/50 rounded-3xl border border-dashed border-border text-center px-4"
                  >
                    <PackageX className="w-16 h-16 text-muted-foreground/40 mb-4" />
                    <h3 className="text-xl font-bold text-primary mb-2">{t('store.empty')}</h3>
                    <p className="text-muted-foreground max-w-md">
                      Essayez de modifier vos filtres ou de changer de catégorie pour trouver ce que vous cherchez.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div 
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredProducts.map((product) => (
                        <motion.div
                          key={product.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ProductCard product={product} isRtl={isRtl} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default StorePage;
