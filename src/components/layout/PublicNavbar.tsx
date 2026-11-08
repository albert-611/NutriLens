import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { LangToggle } from '../common/LangToggle';
import { Button } from '../common/Button';
import { AnnouncementBar } from '../landing/AnnouncementBar';
import { SpecularButton } from '../animations/SpecularButton';
import { BorderBeam } from '@/components/ui/border-beam';

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
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white font-sans block">
                NutriLens
              </span>
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
              <Button variant="outline" size="sm" className="relative overflow-hidden font-semibold border-slate-300 dark:border-forest-border">
                Sign In
                <BorderBeam
                  size={40}
                  initialOffset={20}
                  className="from-transparent via-yellow-500 to-transparent"
                  transition={{
                    type: "spring",
                    stiffness: 60,
                    damping: 20,
                  }}
                />
              </Button>
            </Link>
            
            <Link to="/app">
              <SpecularButton
                size="sm"
                radius={12}
                tint="#10b981"
                tintOpacity={1}
                textColor="#ffffff"
                lineColor="#6ee7b7"
                baseColor="#059669"
                intensity={1.1}
                idleIntensity={0.4}
                glow={1.3}
                followMouse
                proximity={180}
                className="font-bold shadow-md shadow-emerald-500/20"
              >
                <span>Explore NutriLens</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </SpecularButton>
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
                <Button variant="outline" size="sm" className="relative overflow-hidden w-full justify-center font-semibold border-slate-300 dark:border-forest-border">
                  Sign In
                  <BorderBeam
                    size={40}
                    initialOffset={20}
                    className="from-transparent via-yellow-500 to-transparent"
                    transition={{
                      type: "spring",
                      stiffness: 60,
                      damping: 20,
                    }}
                  />
                </Button>
              </Link>
              <Link to="/app" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <SpecularButton
                  size="sm"
                  radius={12}
                  tint="#10b981"
                  tintOpacity={1}
                  textColor="#ffffff"
                  lineColor="#6ee7b7"
                  baseColor="#059669"
                  intensity={1.1}
                  idleIntensity={0.4}
                  glow={1.3}
                  followMouse
                  proximity={180}
                  className="w-full justify-center font-bold shadow-md shadow-emerald-500/20"
                >
                  <span>Explore NutriLens</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </SpecularButton>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
