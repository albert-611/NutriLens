import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, ArrowRight, ArrowUp } from 'lucide-react';
import { motion, useScroll, useSpring, AnimatePresence } from 'motion/react';
import { LangToggle } from '../common/LangToggle';
import { Button } from '../common/Button';
import { SpecularButton } from '../animations/SpecularButton';

export const PublicNavbar: React.FC = () => {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isFooterNear, setIsFooterNear] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 280);

      // Disappear whenever footer hits 60vh from downward (bottom of viewport)
      const footer = document.querySelector('footer');
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        setIsFooterNear(footerRect.top <= window.innerHeight * 0.6);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {/* Scroll-synchronized progress bar pinned to the top of the viewport */}
      <motion.div
        className={`fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.7)] origin-left z-[60] pointer-events-none transition-all duration-300 ease-in-out ${
          isFooterNear ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
        }`}
        style={{ scaleX }}
      />

      <header
        className={`sticky top-0 z-50 w-full bg-white/85 dark:bg-forest-root/85 backdrop-blur-md border-b border-slate-200/70 dark:border-forest-border/60 shadow-xs transition-all duration-300 ease-in-out ${
          isFooterNear ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 h-16 flex items-center justify-between">
          
          {/* Brand Logo & Wordmark */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-white/95 border border-emerald-200/70 dark:border-white/20 flex items-center justify-center p-1.5 shadow-sm group-hover:border-emerald-500 transition-colors duration-200">
              <img src="/logo.svg" alt="NutriLens Logo" className="w-full h-full object-contain" />
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
            
            <Link to="/login">
              <Button
                variant="outline"
                size="sm"
                className="font-semibold border border-slate-300 dark:border-forest-border hover:border-slate-400 dark:hover:border-forest-mint/50 transition-colors"
              >
                Sign In
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
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center font-semibold border border-slate-300 dark:border-forest-border hover:border-slate-400 dark:hover:border-forest-mint/50 transition-colors"
                >
                  Sign In
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

      {/* Smooth Scroll-To-Top Arrow Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            type="button"
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.7, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 p-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-950/25 border border-emerald-400/40 hover:scale-110 active:scale-95 transition-all duration-150 flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 cursor-pointer"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5 stroke-[2.5] group-hover:-translate-y-0.5 transition-transform duration-200" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};
