import React from 'react';
import { Menu } from 'lucide-react';
import { LangToggle } from '../common/LangToggle';
import { ThemeToggle } from '../common/ThemeToggle';
import { NavbarAvatarMenu } from './NavbarAvatarMenu';

interface AppHeaderProps {
  onMobileMenuToggle: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onMobileMenuToggle }) => {
  return (
    <header className="h-16 shrink-0 bg-white/80 dark:bg-forest-card/70 backdrop-blur-md border-b border-slate-200 dark:border-forest-border px-4 sm:px-6 lg:px-8 flex items-center justify-between z-20">
      
      {/* Left Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-forest-card"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            NutriLens Workspace
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Theme & Language Toggles */}
        <ThemeToggle />
        <LangToggle />

        {/* User Account Avatar Dropdown Menu */}
        <NavbarAvatarMenu />
      </div>
    </header>
  );
};
