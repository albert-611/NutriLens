import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Camera,
  CheckSquare,
  FileText,
  Store,
  Sparkles,
  ShoppingBag,
  User,
  Settings,
  X,
  ExternalLink,
  Bot,
} from 'lucide-react';

interface AppSidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { t } = useTranslation();

  const navigation = [
    { name: t('nav.dashboard'), href: '/app', icon: LayoutDashboard, end: true },
    { name: t('nav.analyze'), href: '/app/analyze', icon: Camera },
    { name: t('nav.confirm'), href: '/app/confirm', icon: CheckSquare },
    { name: t('nav.report'), href: '/app/report', icon: FileText },
    { name: t('nav.bazar'), href: '/app/bazar', icon: Store, badge: 'Demo' },
    { name: 'NutriLens AI', href: '/app/assistant', icon: Bot, badge: 'AI' },
    { name: t('nav.meal_rescue'), href: '/app/meal-rescue', icon: Sparkles },
    { name: t('nav.shopping'), href: '/app/shopping', icon: ShoppingBag },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-forest-card border-r border-slate-200 dark:border-forest-border select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-forest-border/70">
        <NavLink to="/app" className="flex items-center gap-2.5 group">
          <img 
            src="/logo.svg" 
            alt="NutriLens Logo" 
            className="w-9 h-9 sm:w-10 sm:h-10 object-contain transition-transform duration-200 group-hover:scale-105 shrink-0" 
          />
          <div>
            <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight">
              NutriLens
            </span>
            <span className="ml-1 text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded">
              SaaS
            </span>
          </div>
        </NavLink>

        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-forest-cardHover"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Market Pilot Badge */}
      <div className="px-5 py-3">
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
          <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <span>Savar / Ashulia Pilot</span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              Active
            </span>
          </p>
          <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
            Savar & Ashulia Market Feed Active
          </p>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-2">
          Nutrition Intelligence
        </p>
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-xl transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-forest-cardHover hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </div>
            {item.badge && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-700 dark:text-emerald-300">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Back to Public Landing Link */}
      <div className="p-4 border-t border-slate-100 dark:border-forest-border/60">
        <NavLink
          to="/"
          className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-500 hover:text-emerald-500 rounded-lg transition-colors"
        >
          <span>Landing Page</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-xs h-full z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

