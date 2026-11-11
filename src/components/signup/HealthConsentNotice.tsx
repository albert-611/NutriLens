import React from 'react';
import { ShieldCheck, Info, Lock } from 'lucide-react';

interface HealthConsentNoticeProps {
  consentGiven: boolean;
  onConsentChange: (consented: boolean) => void;
  hasHealthDataProvided: boolean;
}

export const HealthConsentNotice: React.FC<HealthConsentNoticeProps> = ({
  consentGiven,
  onConsentChange,
  hasHealthDataProvided,
}) => {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-500/30 space-y-3">
      <div className="flex items-start gap-2.5">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
            Health & Dietary Data Processing Notice
          </h4>
          <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed">
            NutriLens processes sensitive dietary, health condition, and allergen data exclusively to provide accurate food warnings and nutritional guidance. Health data is completely optional, protected by strict database Row Level Security (RLS), never shared with third parties for marketing or AI retraining, and can be modified or permanently deleted from your profile at any time.
          </p>
        </div>
      </div>

      <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={consentGiven}
          onChange={(e) => onConsentChange(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-forest-border"
        />
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
          I give explicit consent for NutriLens to securely store and process my declared dietary, allergy, and health preferences to personalize my food analysis and nutritional warnings.
        </span>
      </label>

      {hasHealthDataProvided && !consentGiven && (
        <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium pl-6">
          Notice: If consent is not granted, your declared health conditions, allergies, and intolerances will not be stored in your profile.
        </p>
      )}
    </div>
  );
};

