
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart as CartIcon, LogOut, User, Globe } from 'lucide-react';
import { useCart } from '@/hooks/useCart.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useTranslation } from '@/i18n/useTranslation.js';
import ShoppingCart from '@/components/ShoppingCart.jsx';
import Logo from '@/components/Logo.jsx';
import LanguageSwitcher from '@/components/LanguageSwitcher.jsx';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();
  const { cartItems } = useCart();
  const { currentUser, isAuthenticated, logout, isAdmin } = useAuth();
  const { t } = useTranslation();

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/',          label: t('nav.home') },
    { path: '/agence',    label: 'Agence Web' },
    { path: '/formation', label: t('nav.training') },
    { path: '/store',     label: t('nav.store') },
    { path: '/studio',    label: t('nav.studio') },
    { path: '/hostinger', label: t('nav.hostinger') },
    { path: '/contact',   label: t('nav.contact') },
    { path: '/a-propos',  label: t('nav.about') },
  ];

  const isActive = (path) =>
    location.pathname === path ||
    (path === '/formation' && location.pathname.startsWith('/courses')) ||
    (path === '/hostinger' && location.pathname.startsWith('/hostinger'));

  const isAgenceActive = location.pathname.startsWith('/agence');

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-primary/98 shadow-xl shadow-black/20 py-2.5'
            : 'bg-primary py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-8">

            {/* ── Logo ── */}
            <Link to="/" className="shrink-0 flex items-center">
              <Logo size="medium" />
            </Link>

            {/* ── Nav principale (centrée) ── */}
            <nav className="hidden lg:flex items-center gap-1 flex-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                    isActive(link.path)
                      ? 'text-accent bg-white/8'
                      : 'text-white/80 hover:text-white hover:bg-white/6'
                  }`}
                >
                  {link.label}
                  {isActive(link.path) && (
                    <span className="absolute bottom-0.5 left-3 right-3 h-0.5 bg-accent rounded-full" />
                  )}
                </Link>
              ))}
            </nav>

            {/* ── Côté droit ── */}
            <div className="flex items-center gap-3 ml-auto shrink-0">

              {/* Séparateur */}
              <div className="hidden lg:block h-5 w-px bg-white/15 mx-1" />

              {/* Langue */}
              <LanguageSwitcher />

              {/* Panier */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-white/80 hover:text-accent transition-colors rounded-lg hover:bg-white/6"
                aria-label="Panier"
              >
                <CartIcon className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-accent text-primary text-[10px] font-bold shadow min-w-[18px] px-0.5">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Utilisateur */}
              <div className="hidden lg:flex items-center gap-2 pl-1">
                {!isAuthenticated ? (
                  <Link
                    to="/login"
                    className="text-sm font-semibold text-white/85 hover:text-white px-3 py-2 rounded-lg hover:bg-white/6 transition-all"
                  >
                    {t('nav.login')}
                  </Link>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      to={isAdmin() ? '/admin' : '/dashboard'}
                      className="flex items-center gap-2 text-sm font-medium text-white/85 hover:text-white px-3 py-2 rounded-lg hover:bg-white/6 transition-all"
                    >
                      <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5 text-accent" />
                      </div>
                      <span className="max-w-[90px] truncate">{currentUser?.name}</span>
                      {isAdmin() && (
                        <span className="bg-accent/20 text-accent text-[10px] px-1.5 py-0.5 rounded font-bold border border-accent/30 tracking-wide">
                          ADMIN
                        </span>
                      )}
                    </Link>
                    <button
                      onClick={logout}
                      className="p-2 text-white/40 hover:text-red-400 transition-colors rounded-lg hover:bg-white/6"
                      title={t('nav.logout')}
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Burger mobile */}
              <button
                className="lg:hidden p-2 text-white/80 hover:text-white transition-colors rounded-lg"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Menu mobile ── */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-primary border-t border-white/10 shadow-2xl">
            <nav className="flex flex-col py-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-6 py-3.5 text-sm font-medium transition-colors flex items-center gap-3 ${
                    isActive(link.path)
                      ? 'text-accent bg-white/5 border-l-2 border-accent pl-5'
                      : 'text-white/80 hover:text-white hover:bg-white/5 border-l-2 border-transparent pl-5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-3 pt-3 border-t border-white/10 px-4">
                {!isAuthenticated ? (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-accent text-primary font-bold rounded-xl text-sm"
                  >
                    {t('nav.login')}
                  </Link>
                ) : (
                  <div className="flex items-center justify-between">
                    <Link
                      to={isAdmin() ? '/admin' : '/dashboard'}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-sm font-medium text-white/85"
                    >
                      <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
                        <User className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{currentUser?.name}</p>
                        {isAdmin() && <p className="text-[10px] text-accent font-bold tracking-wide">ADMINISTRATEUR</p>}
                      </div>
                    </Link>
                    <button
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="p-2 text-white/40 hover:text-red-400 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <ShoppingCart isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
    </>
  );
};

export default Header;
