
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Phone, Mail, MapPin, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const HostingerContactForm = () => {
  const location = useLocation();
  const prefillData = location.state || null;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    needs: prefillData ? `Bonjour, je souhaite commander le ${prefillData.pack} avec l'option ${prefillData.maintenance}. Total estimé: ${prefillData.total} MAD.` : ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    return formData.name && formData.phone && formData.city && formData.needs;
  };

  const handleWhatsApp = () => {
    if (!validateForm()) return alert('Veuillez remplir tous les champs.');
    const text = `Nom: ${formData.name}%0ATéléphone: ${formData.phone}%0AVille: ${formData.city}%0ABesoin: ${formData.needs}`;
    window.open(`https://wa.me/212600000000?text=${text}`, '_blank');
  };

  const handleEmail = () => {
    if (!validateForm()) return alert('Veuillez remplir tous les champs.');
    const subject = `Demande de devis Hostinger - ${formData.name}`;
    const body = `Nom: ${formData.name}%0ATéléphone: ${formData.phone}%0AVille: ${formData.city}%0A%0ABesoin:%0A${formData.needs}`;
    window.location.href = `mailto:contact@iwslaayoune.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 bg-card p-8 md:p-10 rounded-3xl border border-border shadow-sm">
        <h2 className="text-2xl font-bold text-primary mb-6">Formulaire de contact</h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet *</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required className="bg-muted/50" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="city">Ville *</Label>
            <Input id="city" name="city" value={formData.city} onChange={handleChange} required className="bg-muted/50" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="needs">Vos besoins / Détails du projet *</Label>
            <Textarea 
              id="needs" 
              name="needs" 
              rows={5} 
              value={formData.needs} 
              onChange={handleChange} 
              required 
              className="bg-muted/50 resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              onClick={handleWhatsApp} 
              className="flex-1 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold py-6 rounded-xl"
            >
              <MessageCircle className="mr-2 w-5 h-5" />
              Nous contacter par WhatsApp
            </Button>
            <Button 
              onClick={handleEmail} 
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-6 rounded-xl"
            >
              <Send className="mr-2 w-5 h-5" />
              Envoyer par Email
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-primary text-white p-8 rounded-3xl shadow-lg">
          <h3 className="text-xl font-bold mb-6 text-accent">Informations de contact</h3>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <MessageCircle className="w-6 h-6 text-accent shrink-0" />
              <div>
                <p className="font-semibold mb-1">WhatsApp</p>
                <p className="text-slate-300">+212 6XX XX XX XX</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-accent shrink-0" />
              <div>
                <p className="font-semibold mb-1">Email</p>
                <p className="text-slate-300">contact@iwslaayoune.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-accent shrink-0" />
              <div>
                <p className="font-semibold mb-1">Adresse</p>
                <p className="text-slate-300">Laâyoune, Maroc</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted p-6 rounded-2xl border border-border">
          <h4 className="font-bold text-primary mb-2">Horaires d'ouverture</h4>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Du Lundi au Vendredi<br/>
            09:00 - 18:00
          </p>
        </div>
      </div>
    </div>
  );
};

export default HostingerContactForm;
