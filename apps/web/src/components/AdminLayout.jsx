
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Settings, LogOut, Menu, X, Bell,
  CreditCard, Home, GraduationCap, ShoppingBag, Mic2,
  Languages, Monitor, Code2, Music2, Laptop2,
  CalendarDays, SlidersHorizontal, ChevronDown, ChevronRight,
  BookOpen, FileText, Globe,
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useTranslation } from '@/i18n/useTranslation.js';
import { useLanguage } from '@/hooks/useLanguage.jsx';
import LanguageSwitcher from '@/components/LanguageSwitcher.jsx';
import NotificationCenter from '@/components/NotificationCenter.jsx';

const AdminLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRtl = language?.startsWith('ar');
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── helpers ──────────────────────────────────────────────────────
  const isActive = (path, exact = false) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const isSectionActive = (basePath) => location.pathname.startsWith(basePath);

  // ── nav structure ─────────────────────────────────────────────────
  const topItems = [
    { path: '/admin', icon: LayoutDashboard, label: t('admin.nav.dashboard'), exact: true },
  ];

  // Liens directs dans la section SERVICES (pas de sous-menu)
  const serviceDirectLinks = [
    { path: '/admin/agence', icon: Globe, label: 'Web Agency', exact: false },
  ];

  const sections = [
    {
      key: 'magasin',
      icon: ShoppingBag,
      label: t('admin.nav.section.magasin'),
      basePath: '/admin/magasin',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      items: [
        { path: '/admin/magasin/laayounemusik', icon: Music2, label: 'LaayouneMusik' },
        { path: '/admin/magasin/iwstech', icon: Laptop2, label: 'IwsTech Company' },
      ],
    },
    {
      key: 'formation',
      icon: GraduationCap,
      label: t('admin.nav.section.formation'),
      basePath: '/admin/formation',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      items: [
        { path: '/admin/formation/langues', icon: Languages, label: t('admin.nav.formation.langues') },
        { path: '/admin/formation/informatique', icon: Monitor, label: t('admin.nav.formation.informatique') },
        { path: '/admin/formation/programmation', icon: Code2, label: t('admin.nav.formation.programmation') },
        { path: '/admin/students', icon: Users, label: t('admin.nav.students') },
        { path: '/admin/formation/paiements', icon: CreditCard, label: t('admin.nav.payments') },
      ],
    },
    {
      key: 'studio',
      icon: Mic2,
      label: t('admin.nav.section.studio'),
      basePath: '/admin/studio',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      items: [
        { path: '/admin/studio/reservations', icon: CalendarDays, label: t('admin.nav.studio.reservations') },
        { path: '/admin/studio/services', icon: SlidersHorizontal, label: t('admin.nav.studio.services') },
        { path: '/admin/studio/paiements', icon: CreditCard, label: t('admin.nav.studio.paiements') },
      ],
    },
  ];

  const bottomItems = [
    { path: '/admin/notifications', icon: Bell, label: t('admin.nav.notifications') },
    { path: '/admin/settings', icon: Settings, label: t('admin.nav.settings') },
  ];

  // ── SidebarLink component ─────────────────────────────────────────
  const SidebarLink = ({ path, icon: Icon, label, exact = false, indent = false }) => {
    const active = isActive(path, exact);
    return (
      <Link
        to={path}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium
          ${indent ? 'ml-3 pl-3' : ''}
          ${active
            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
      >
        <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
        <span className="truncate">{label}</span>
      </Link>
    );
  };

  // ── CollapsibleSection component ──────────────────────────────────
  const CollapsibleSection = ({ section }) => {
    const active = isSectionActive(section.basePath) ||
      section.items.some(i => location.pathname.startsWith(i.path));
    const [open, setOpen] = useState(active);

    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="w-full">
          <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer select-none
            ${active ? `${section.bgColor} ${section.color} font-semibold` : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            <section.icon className={`w-4 h-4 shrink-0 ${active ? section.color : ''}`} />
            <span className="flex-1 text-left text-sm font-medium truncate">{section.label}</span>
            {open
              ? <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-70" />
              : <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
            }
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1 space-y-0.5 border-l-2 border-border/50 ml-5">
          {section.items.map((item) => (
            <SidebarLink key={item.path} indent {...item} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  // ── Sidebar content ───────────────────────────────────────────────
  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="h-[var(--admin-header-height)] flex items-center px-6 border-b border-border justify-between lg:justify-center shrink-0">
        <img
          src="https://horizons-cdn.hostinger.com/1c587036-9b82-4552-a7aa-82b55c0e4cbb/194eb2392c06f1b937e41ace9ded27ea.png"
          alt="IWS Logo"
          className="h-10 object-contain"
        />
        <button className="lg:hidden text-muted-foreground hover:text-foreground transition-colors" onClick={() => setSidebarOpen(false)}>
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {/* Dashboard */}
        {topItems.map(item => (
          <SidebarLink key={item.path} {...item} />
        ))}

        {/* Separator */}
        <div className="pt-2 pb-1">
          <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
            {t('admin.nav.services')}
          </p>
        </div>

        {/* Liens directs de service (Web Agency, etc.) */}
        {serviceDirectLinks.map(item => (
          <SidebarLink key={item.path} {...item} />
        ))}

        {/* Collapsible sections */}
        <div className="space-y-1">
          {sections.map(section => (
            <CollapsibleSection key={section.key} section={section} />
          ))}
        </div>

        {/* Separator */}
        <div className="pt-2 pb-1">
          <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
            {t('admin.nav.system')}
          </p>
        </div>

        {/* Bottom nav items */}
        {bottomItems.map(item => (
          <SidebarLink key={item.path} {...item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border shrink-0 space-y-1">
        <Link
          to="/"
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-sm font-medium"
        >
          <Home className="w-4 h-4" />
          {t('admin.viewSite')}
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          {t('nav.logout')}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[hsl(var(--admin-background))] flex" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 ${isRtl ? 'right-0' : 'left-0'} z-50
        w-[var(--admin-sidebar-width)] bg-card border-${isRtl ? 'l' : 'r'} border-border
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : isRtl ? 'translate-x-full' : '-translate-x-full'}
        flex flex-col shadow-xl lg:shadow-none
      `}>
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-[var(--admin-header-height)] bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-foreground">
                {t('admin.portal')}
              </h1>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSwitcher />
            <NotificationCenter />
            <div className="flex items-center gap-3 border-l border-border pl-3 sm:pl-4 ml-1 sm:ml-2">
              <div className="flex-col items-end hidden md:flex">
                <span className="text-sm font-bold text-foreground">{currentUser?.name || 'Admin'}</span>
                <span className="text-xs text-muted-foreground capitalize">{currentUser?.role || 'Administrateur'}</span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-background">
                {currentUser?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
