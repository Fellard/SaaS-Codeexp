
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, User, ShoppingBag, BookOpen, Settings, LogOut, Menu, X, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useTranslation } from '@/i18n/useTranslation.js';
import { useLanguage } from '@/hooks/useLanguage.jsx';
import LanguageSwitcher from '@/components/LanguageSwitcher.jsx';
import Logo from '@/components/Logo.jsx';

const DashboardLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRtl = language?.startsWith('ar');
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/dashboard',          icon: LayoutDashboard, label: t('admin.dashboard') },
    { path: '/dashboard/profile',  icon: User,            label: t('dashboard.profile') },
    { path: '/dashboard/orders',   icon: ShoppingBag,     label: t('dashboard.orders') },
    { path: '/dashboard/courses',  icon: BookOpen,        label: t('dashboard.courses') },
    { path: '/dashboard/settings', icon: Settings,        label: t('dashboard.settings') },
  ];

  const displayName = currentUser
    ? (`${currentUser.prenom || ''} ${currentUser.nom || currentUser.name || ''}`.trim() || currentUser.name || 'Étudiant')
    : '';

  return (
    <div className="min-h-screen bg-muted flex" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className={`fixed lg:static inset-y-0 ${isRtl ? 'right-0' : 'left-0'} z-50 w-64 bg-card border-${isRtl ? 'l' : 'r'} border-border flex flex-col transform transition-transform duration-300 lg:transform-none ${sidebarOpen ? 'translate-x-0' : isRtl ? 'translate-x-full' : '-translate-x-full'}`}>

        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border justify-between lg:justify-center flex-shrink-0">
          <Logo size="small" />
          <button className="lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer sidebar — Accueil + Déconnexion */}
        <div className="p-4 border-t border-border space-y-1 flex-shrink-0">
          {/* Lien retour accueil */}
          <Link
            to="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            Retour à l'accueil
          </Link>

          {/* Déconnexion — un seul bouton, ici dans la sidebar */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header — sans bouton déconnexion */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Hamburger (mobile) */}
            <button
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            {/* Page title / welcome */}
            <h1 className="text-sm font-semibold text-muted-foreground hidden sm:block">
              Bienvenue,{' '}
              <span className="text-foreground font-bold">{displayName}</span>
            </h1>
          </div>

          {/* Right side — language + avatar only (no logout here) */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            {/* Avatar + name */}
            <div className="flex items-center gap-2 border-l border-border pl-3 ml-1">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                {displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium max-w-[130px] truncate hidden sm:block">{displayName}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
