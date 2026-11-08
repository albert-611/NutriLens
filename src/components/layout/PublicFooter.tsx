import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Database } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-forest-border bg-white dark:bg-forest-root text-slate-600 dark:text-slate-400 text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="NutriLens Logo" className="w-6 h-6" />
              <span className="font-bold text-slate-900 dark:text-white text-base font-sans">
                NutriLens
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              Bangladesh-first Nutrition Intelligence platform connecting plate photo recognition, verified Food Composition Tables, and local market affordability.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 pt-1">
              <Database className="w-3.5 h-3.5" />
              <span>Sourced from FAO Food Composition Table for Bangladesh (2013) & DGHS Guidelines</span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-2">
            <p className="font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              Platform
            </p>
            <ul className="space-y-1.5">
              <li>
                <Link to="/app/analyze" className="hover:text-emerald-500 transition-colors">Plate Scanner</Link>
              </li>
              <li>
                <Link to="/app/bazar" className="hover:text-emerald-500 transition-colors">Bazar Intelligence</Link>
              </li>
              <li>
                <Link to="/app/meal-rescue" className="hover:text-emerald-500 transition-colors">Meal Rescue</Link>
              </li>
              <li>
                <Link to="/app/shopping" className="hover:text-emerald-500 transition-colors">Smart Shopping</Link>
              </li>
            </ul>
          </div>

          {/* Legal & Standards */}
          <div className="space-y-2">
            <p className="font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              Verification
            </p>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Deterministic Sourced Math</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Savar / Ashulia Demo Pilot</span>
              </li>
              <li className="text-slate-500 dark:text-slate-400">
                Hackathon Prototype v0.1
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 dark:border-forest-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 dark:text-slate-400">
          <p className="max-w-2xl text-center sm:text-left">
            <strong className="text-slate-700 dark:text-slate-300">Non-Clinical Disclaimer:</strong> NutriLens provides nutritional intelligence for educational and lifestyle awareness only. It does not provide medical diagnosis, treatment, or clinical dietary prescriptions.
          </p>
          <p className="shrink-0 flex items-center gap-1">
            Built for Bangladesh with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
