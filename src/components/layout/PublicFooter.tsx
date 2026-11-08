import React from 'react';
import { Database, ShieldCheck } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 dark:border-forest-border bg-white dark:bg-forest-root text-slate-600 dark:text-slate-400 text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Brand & Mission */}
          <div className="sm:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="NutriLens Logo" className="w-6 h-6" />
              <span className="font-bold text-slate-900 dark:text-white text-base font-sans">
                NutriLens
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 max-w-md leading-relaxed text-xs">
              Bangladesh-first Nutrition Intelligence platform connecting plate photo recognition, verified Food Composition Tables, and local market affordability.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 pt-1">
              <Database className="w-3.5 h-3.5 shrink-0" />
              <span>FAO Food Composition Table for Bangladesh (2013)</span>
            </div>
          </div>

          {/* Product Navigation Group */}
          <div className="space-y-2">
            <p className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              Product
            </p>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a href="#how-it-works" className="hover:text-emerald-500 transition-colors">How It Works</a>
              </li>
              <li>
                <a href="#features" className="hover:text-emerald-500 transition-colors">Intelligence Features</a>
              </li>
              <li>
                <a href="#preview" className="hover:text-emerald-500 transition-colors">Product Preview</a>
              </li>
              <li>
                <a href="#local-bazar" className="hover:text-emerald-500 transition-colors">Bazar-to-Plate</a>
              </li>
            </ul>
          </div>

          {/* Project & Transparency */}
          <div className="space-y-2">
            <p className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              Project
            </p>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a href="#bangladesh-first" className="hover:text-emerald-500 transition-colors">About NutriLens</a>
              </li>
              <li>
                <a href="#trust" className="hover:text-emerald-500 transition-colors">Trust & Evidence</a>
              </li>
              <li className="flex items-center gap-1.5 pt-1 text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Deterministic Math</span>
              </li>
              <li className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 font-sans">
                Savar & Ashulia Demo
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Disclaimer & Copyright */}
        <div className="pt-6 border-t border-slate-100 dark:border-forest-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 dark:text-slate-400">
          <p className="text-center sm:text-left max-w-2xl leading-relaxed">
            Nutrition information is provided for general informational purposes. Market information in the prototype may include simulated demonstration data.
          </p>
          <p className="shrink-0 font-sans font-medium">
            © {currentYear} NutriLens. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};
