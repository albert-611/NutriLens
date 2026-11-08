import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { LangToggle } from '../common/LangToggle';
import { Button } from '../common/Button';
import { AnnouncementBar } from '../landing/AnnouncementBar';

export const PublicNavbar: React.FC = () => {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Non-intrusive Product Announcement */}
      <AnnouncementBar />

      <header className="sticky top-0 z-40 w-full bg-surface-lightRoot/85 dark:bg-forest-root/85 backdrop-blur-md border-b border-slate-200/60 dark:border-forest-border/60 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 h-16 flex items-center justify-between">
          
          {/* Brand Logo & Wordmark */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-forest-card dark:bg-forest-card border border-forest-border flex items-center justify-center p-1.5 shadow-sm group-hover:border-emerald-500 transition-colors duration-200">
              <img src="/logo.svg" alt="NutriLens Logo" className="w-full h-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white font-sans">
                  NutriLens
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                  BD
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5 font-medium hidden sm:block">
                Nutrition Intelligence
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#how-it-works" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Intelligence
            </a>
            <a href="#bangladesh-first" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              About
            </a>
            <a href="#preview" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Product
            </a>
          </nav>

          {/* Action Controls & Authentication */}
          <div className="hidden sm:flex items-center gap-3">
            <LangToggle />
            <ThemeToggle />
            
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            
            <Link to="/app">
              <Button variant="primary" size="sm" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                Explore NutriLens
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:hidden">
            <LangToggle />
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-forest-card focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-b border-slate-200 dark:border-forest-border bg-surface-lightRoot dark:bg-forest-root px-4 pt-2 pb-6 space-y-4 animate-fadeIn">
            <nav className="flex flex-col space-y-3 text-sm font-medium text-slate-700 dark:text-slate-200">
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-emerald-500 transition-colors"
              >
                How It Works
              </a>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-emerald-500 transition-colors"
              >
                Intelligence
              </a>
              <a
                href="#bangladesh-first"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-emerald-500 transition-colors"
              >
                About
              </a>
              <a
                href="#preview"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-emerald-500 transition-colors"
              >
                Product Preview
              </a>
            </nav>

            <div className="pt-4 border-t border-slate-200 dark:border-forest-border flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button variant="outline" size="sm" className="w-full justify-center">
                  Sign In
                </Button>
              </Link>
              <Link to="/app" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button variant="primary" size="sm" className="w-full justify-center">
                  Explore NutriLens
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
