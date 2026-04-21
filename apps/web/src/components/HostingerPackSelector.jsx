
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ShoppingCart, ArrowRight } from 'lucide-react';

const HostingerPackSelector = () => {
  const navigate = useNavigate();
  const [selectedPack, setSelectedPack] = useState('pro');
  const [selectedMaintenance, setSelectedMaintenance] = useState('none');

  const packs = {
    lancement: { name: 'Pack Lancement', price: 990 },
    pro: { name: 'Pack Pro', price: 1990 },
    business: { name: 'Pack Business', price: 3990 }
  };

  const maintenance = {
    none: { name: 'Sans maintenance', price: 0 },
    lite: { name: 'Maintenance Lite', price: 149 },
    plus: { name: 'Maintenance Plus', price: 299 }
  };

  const total = packs[selectedPack].price + maintenance[selectedMaintenance].price;

  const handleCheckout = () => {
    navigate('/hostinger/contact', { 
      state: { 
        pack: packs[selectedPack].name, 
        maintenance: maintenance[selectedMaintenance].name,
        total 
      } 
    });
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-8 shadow-lg max-w-3xl mx-auto">
      <h3 className="text-2xl font-bold text-primary mb-8 flex items-center gap-3">
        <ShoppingCart className="w-6 h-6 text-accent" />
        Simulateur de devis
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div>
            <h4 className="font-semibold text-primary mb-4">1. Choisissez votre pack</h4>
            <RadioGroup value={selectedPack} onValueChange={setSelectedPack} className="space-y-3">
              {Object.entries(packs).map(([key, pack]) => (
                <div key={key} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${selectedPack === key ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`} onClick={() => setSelectedPack(key)}>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value={key} id={`pack-${key}`} />
                    <Label htmlFor={`pack-${key}`} className="font-medium cursor-pointer">{pack.name}</Label>
                  </div>
                  <span className="font-bold text-primary">{pack.price} MAD</span>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <h4 className="font-semibold text-primary mb-4">2. Option de maintenance (Mensuel)</h4>
            <RadioGroup value={selectedMaintenance} onValueChange={setSelectedMaintenance} className="space-y-3">
              {Object.entries(maintenance).map(([key, maint]) => (
                <div key={key} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${selectedMaintenance === key ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`} onClick={() => setSelectedMaintenance(key)}>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value={key} id={`maint-${key}`} />
                    <Label htmlFor={`maint-${key}`} className="font-medium cursor-pointer">{maint.name}</Label>
                  </div>
                  <span className="font-bold text-primary">{maint.price > 0 ? `+${maint.price} MAD` : '0 MAD'}</span>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <div className="bg-muted rounded-2xl p-6 flex flex-col">
          <h4 className="font-semibold text-primary mb-6 border-b border-border pb-4">Résumé de votre commande</h4>
          
          <div className="space-y-4 flex-grow">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{packs[selectedPack].name}</span>
              <span className="font-medium text-primary">{packs[selectedPack].price} MAD</span>
            </div>
            {maintenance[selectedMaintenance].price > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{maintenance[selectedMaintenance].name} (1er mois)</span>
                <span className="font-medium text-primary">{maintenance[selectedMaintenance].price} MAD</span>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-4 mt-6 mb-8">
            <div className="flex justify-between items-end">
              <span className="font-bold text-primary">Total estimé</span>
              <div className="text-right">
                <span className="text-3xl font-extrabold text-primary">{total}</span>
                <span className="text-muted-foreground ml-1">MAD</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-right">*Hors frais d'hébergement Hostinger</p>
          </div>

          <Button 
            className="w-full bg-accent hover:bg-accent/90 text-primary font-bold py-6 text-lg rounded-xl"
            onClick={handleCheckout}
          >
            Demander devis / Payer
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-3">
            Vous serez redirigé vers un formulaire de devis
          </p>
        </div>
      </div>
    </div>
  );
};

export default HostingerPackSelector;
