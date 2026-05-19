
import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation.js';
import { Button } from '@/components/ui/button';

// section values: 'musik' | 'pc'
const FilterPanel = ({ filters, setFilters, section, categories = [], isRtl }) => {
  const { t } = useTranslation();

  const handleReset = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      brand: '',
      condition: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
        <Filter className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-lg text-primary">{t('store.filters.title')}</h3>
      </div>

      <div className="space-y-6">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            {t('store.filters.category')}
          </label>
          <select
            name="category"
            value={filters.category}
            onChange={handleChange}
            className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
          >
            <option value="">{t('store.filters.allCategories')}</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            {t('store.filters.price')}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              name="minPrice"
              placeholder={t('store.filters.minPrice')}
              value={filters.minPrice}
              onChange={handleChange}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            />
            <span className="text-muted-foreground">-</span>
            <input
              type="number"
              name="maxPrice"
              placeholder={t('store.filters.maxPrice')}
              value={filters.maxPrice}
              onChange={handleChange}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            />
          </div>
        </div>

        {/* Brand Filter */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            {t('store.filters.brand')}
          </label>
          <div className="relative">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRtl ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              name="brand"
              placeholder={t('store.filters.brandPlaceholder')}
              value={filters.brand}
              onChange={handleChange}
              className={`w-full bg-background border border-input rounded-lg py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
            />
          </div>
        </div>

        {/* Condition Filter — shown for PC section only */}
        {section === 'pc' && (
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              {t('store.filters.condition')}
            </label>
            <select
              name="condition"
              value={filters.condition}
              onChange={handleChange}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            >
              <option value="">{t('store.filters.allConditions')}</option>
              <option value="neuf">{t('store.badges.new')}</option>
              <option value="occasion">{t('store.badges.used')}</option>
            </select>
          </div>
        )}

        <Button
          onClick={handleReset}
          variant="outline"
          className="w-full mt-4 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-4 h-4" />
          {t('store.filters.reset')}
        </Button>
      </div>
    </div>
  );
};

export default FilterPanel;
