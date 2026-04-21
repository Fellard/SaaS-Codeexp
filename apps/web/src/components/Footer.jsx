
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail } from 'lucide-react';
import Logo from '@/components/Logo.jsx';

const Footer = () => {
  return (
    <footer className="bg-primary text-white pt-20 pb-10 border-t-4 border-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Logo size="medium" className="mb-2" />
            <p className="text-slate-300 leading-relaxed">
              Solutions numériques innovantes pour votre croissance commerciale
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent hover:text-primary transition-all duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent hover:text-primary transition-all duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent hover:text-primary transition-all duration-300">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-accent mb-6 uppercase tracking-wider text-sm">Services</h3>
            <ul className="space-y-4">
              <li><Link to="/services" className="text-slate-300 hover:text-accent transition-colors">Maintenance & Support</Link></li>
              <li><Link to="/services" className="text-slate-300 hover:text-accent transition-colors">Optimisation SEO</Link></li>
              <li><Link to="/services" className="text-slate-300 hover:text-accent transition-colors">Marketing Numérique</Link></li>
              <li><Link to="/services" className="text-slate-300 hover:text-accent transition-colors">Conception Graphique</Link></li>
              <li><Link to="/services" className="text-slate-300 hover:text-accent transition-colors">Développement Web</Link></li>
              <li><Link to="/services" className="text-slate-300 hover:text-accent transition-colors">Consultation Numérique</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-accent mb-6 uppercase tracking-wider text-sm">Produits</h3>
            <ul className="space-y-4">
              <li><Link to="/store" className="text-slate-300 hover:text-accent transition-colors">Instruments de Musique</Link></li>
              <li><Link to="/store" className="text-slate-300 hover:text-accent transition-colors">Ordinateurs</Link></li>
              <li><Link to="/store" className="text-slate-300 hover:text-accent transition-colors">Accessoires</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-accent mb-6 uppercase tracking-wider text-sm">Contact</h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-accent shrink-0 mt-1" />
                <span className="text-slate-300 leading-relaxed">Adresse: Laâyoune, Maroc</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-accent shrink-0" />
                <span className="text-slate-300">Téléphone: +212 XXXXXXXXX</span>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-accent shrink-0" />
                <span className="text-slate-300">Email: contact@iwslaayoune.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © 2021-2024 IWS LAAYOUNE. Tous droits réservés.
          </p>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link to="/legal" className="hover:text-accent transition-colors">Mentions Légales</Link>
            <Link to="/terms" className="hover:text-accent transition-colors">Conditions Générales</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
