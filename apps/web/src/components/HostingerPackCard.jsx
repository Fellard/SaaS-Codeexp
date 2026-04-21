
import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { convertMadToEur } from '@/config/currency.js';

const HostingerPackCard = ({ title, price, features, isPopular, onSelect, showEur }) => {
  const priceEur = convertMadToEur(price);

  return (
    <div className={`relative flex flex-col bg-card rounded-2xl border ${isPopular ? 'border-accent shadow-xl shadow-accent/10 scale-105 z-10' : 'border-border shadow-sm'} p-8 hover-card-effect`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide">
          LE PLUS CHOISI
        </div>
      )}
      
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-primary mb-4">{title}</h3>
        <div className="flex flex-col items-start justify-center min-h-[80px]">
          <div className="flex items-baseline text-primary">
            <span className="text-4xl font-extrabold tracking-tight">{price}</span>
            <span className="text-xl font-semibold ml-2">MAD</span>
          </div>
          {showEur && (
            <div className="text-muted-foreground text-lg font-medium mt-1">
              ~ {priceEur} €
            </div>
          )}
        </div>
      </div>

      <ul className="space-y-4 mb-8 flex-1">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-4 h-4 text-primary" />
            </div>
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <Button 
        onClick={onSelect}
        className={`w-full h-14 text-lg font-bold rounded-xl transition-transform active:scale-95 ${
          isPopular 
            ? 'bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20' 
            : 'bg-primary hover:bg-primary/90 text-white'
        }`}
      >
        Choisir ce pack
      </Button>
    </div>
  );
};

export default HostingerPackCard;
