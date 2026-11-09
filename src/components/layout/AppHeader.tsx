import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { LangToggle } from '../common/LangToggle';
import { DemoUserSelector } from '../common/DemoUserSelector';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AppHeaderProps {
  onMobileMenuToggle: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onMobileMenuToggle }) => {
  const { signOut, isDemoUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

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
        {/* Quick Demo Persona Switcher */}
        <DemoUserSelector />

        {/* Global Language Toggle */}
        <LangToggle />

        {/* Logout / Switch Account */}
        <button
          onClick={handleLogout}
          title={isDemoUser ? "Reset Demo Session" : "Log out"}
          className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-100 dark:hover:bg-forest-card transition-colors duration-150"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

