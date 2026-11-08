import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, X } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    return sessionStorage.getItem('nutrilens_announcement_dismissed') === 'true';
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('nutrilens_announcement_dismissed', 'true');
  };

  return (
    <aside
      aria-label="Product announcement"
      className="relative z-50 bg-emerald-900/90 dark:bg-emerald-950/90 text-emerald-100 px-4 py-1.5 text-xs font-medium border-b border-emerald-800/40 backdrop-blur-md transition-colors"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center justify-center gap-2 text-center">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Hackathon Prototype
          </span>
          <span className="hidden sm:inline">
            Explore the NutriLens interactive prototype with Savar and Ashulia wet market intelligence.
          </span>
          <span className="sm:hidden">
            Explore the NutriLens interactive prototype.
          </span>
          <Link
            to="/app"
            className="inline-flex items-center gap-1 font-bold text-white underline underline-offset-4 hover:text-emerald-300 ml-1 transition-colors"
          >
            Launch Prototype <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <button
          onClick={handleDismiss}
          className="text-emerald-300 hover:text-white p-1 rounded-md hover:bg-emerald-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
          aria-label="Dismiss announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
