import React from 'react';
import { Languages } from 'lucide-react';
import { useLocale } from '../../context/LocaleContext';

interface LangToggleProps {
  className?: string;
}

export const LangToggle: React.FC<LangToggleProps> = ({ className = '' }) => {
  const { locale, toggleLocale } = useLocale();

  return (
    <button
      onClick={toggleLocale}
      type="button"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-forest-card border border-slate-200 dark:border-forest-border ${className}`}
      aria-label="Toggle language"
      title={locale === 'en' ? 'বাংলায় দেখুন' : 'Switch to English'}
    >
      <Languages className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
      <span>{locale === 'en' ? 'বাং' : 'EN'}</span>
    </button>
  );
};
