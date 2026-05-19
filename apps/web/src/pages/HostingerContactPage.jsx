
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import { Phone, Mail, MapPin, Send, MessageCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const HostingerContactPage = () => {
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
    if (!formData.name || !formData.phone || !formData.city || !formData.needs) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return false;
    }
    return true;
  };

  const handleWhatsApp = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const text = `Nom: ${formData.name}%0ATéléphone: ${formData.phone}%0AVille: ${formData.city}%0ABesoin: ${formData.needs}`;
    window.open(`https://wa.me/212600000000?text=${text}`, '_blank');
    toast.success('Redirection vers WhatsApp...');
  };

  const handleEmail = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const subject = `Demande de devis - ${formData.name}`;
    const body = `Nom: ${formData.name}%0ATéléphone: ${formData.phone}%0AVille: ${formData.city}%0A%0ABesoin:%0A${formData.needs}`;
    window.location.href = `mailto:contact@iwslaayoune.com?subject=${subject}&body=${body}`;
    toast.success('Ouverture de votre client email...');
  };

  return (
    <>
      <Helmet>
        <title>Contactez-nous - IWS LAAYOUNE</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 pt-20">
          <div className="bg-primary py-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-10">
              <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent rounded-full blur-[100px] -translate-y-1/2"></div>
            </div>
            <div className="relative z-10 max-w-4xl mx-auto px-4">
              <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">Discutons de votre projet</h1>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Remplissez le formulaire ci-dessous. Notre équipe vous répondra dans les plus brefs délais.
              </p>
            </div>
          </div>

          <section className="section-padding bg-muted">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                {/* Form Section */}
                <div className="lg:col-span-2 bg-card p-8 md:p-12 rounded-3xl border border-border shadow-lg">
                  <h2 className="text-3xl font-bold text-primary mb-8">Formulaire de contact</h2>
                  
                  <form className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label htmlFor="name" className="text-base font-semibold">Nom complet *</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} required className="bg-muted/50 h-12 text-base" placeholder="Votre nom" />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="phone" className="text-base font-semibold">Téléphone *</Label>
                        <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required className="bg-muted/50 h-12 text-base" placeholder="+212 6XX XX XX XX" />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="city" className="text-base font-semibold">Ville *</Label>
                      <Input id="city" name="city" value={formData.city} onChange={handleChange} required className="bg-muted/50 h-12 text-base" placeholder="Votre ville" />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="needs" className="text-base font-semibold">Vos besoins / Détails du projet *</Label>
                      <Textarea 
                        id="needs" 
                        name="needs" 
                        rows={6} 
                        value={formData.needs} 
                        onChange={handleChange} 
                        required 
                        className="bg-muted/50 resize-none text-base p-4"
                        placeholder="Décrivez votre projet en quelques mots..."
                      />
                    </div>

                    <div className="flex flex-col gap-4 pt-6">
                      <Button 
                        onClick={handleWhatsApp} 
                        className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold py-7 text-lg rounded-xl shadow-lg shadow-[#25D366]/20 transition-transform active:scale-95"
                      >
                        <MessageCircle className="mr-3 w-6 h-6" />
                        Nous contacter par WhatsApp
                      </Button>
                      
                      <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-border"></div>
                        <span className="flex-shrink-0 mx-4 text-muted-foreground text-sm font-medium uppercase tracking-wider">ou</span>
                        <div className="flex-grow border-t border-border"></div>
                      </div>

                      <Button 
                        onClick={handleEmail} 
                        variant="outline"
                        className="w-full border-2 border-primary text-primary hover:bg-primary/5 font-bold py-7 text-lg rounded-xl transition-transform active:scale-95"
                      >
                        <Send className="mr-3 w-6 h-6" />
                        Envoyer par Email
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Contact Info Section */}
                <div className="space-y-8">
                  <div className="bg-primary text-white p-10 rounded-3xl shadow-xl">
                    <h3 className="text-2xl font-bold mb-8 text-accent">Informations</h3>
                    
                    <div className="space-y-8">
                      <div className="flex items-start gap-5">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                          <MessageCircle className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg mb-1">WhatsApp</p>
                          <p className="text-slate-300 text-lg">+212 6XX XX XX XX</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-5">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                          <Mail className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg mb-1">Email</p>
                          <p className="text-slate-300 text-lg">contact@iwslaayoune.com</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-5">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                          <MapPin className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg mb-1">Adresse</p>
                          <p className="text-slate-300 text-lg">Laâyoune, Maroc</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card p-8 rounded-3xl border border-border shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                      <Clock className="w-6 h-6 text-primary" />
                      <h4 className="text-xl font-bold text-primary">Horaires</h4>
                    </div>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Du Lundi au Vendredi<br/>
                      <span className="font-medium text-primary">09:00 - 18:00</span>
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default HostingerContactPage;
