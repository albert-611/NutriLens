import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';
import {
  User,
  Store,
  DollarSign,
  Users,
  Target,
  ShieldCheck,
  CheckCircle2,
  Languages,
  Save,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../lib/formatters';

export const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { profile, updateProfile, isDemoUser, user } = useAuth();
  const { locale, setLocale } = useLocale();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [budgetAmount, setBudgetAmount] = useState(profile?.budget_amount || 150);
  const [householdSize, setHouseholdSize] = useState(profile?.household_size || 1);
  const [generalGoal, setGeneralGoal] = useState<any>(profile?.general_goal || 'balanced_wellness');
  const [marketId, setMarketId] = useState(profile?.market_id || '22222222-2222-2222-2222-222222222201');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      display_name: displayName,
      budget_amount: budgetAmount,
      household_size: householdSize,
      general_goal: generalGoal,
      market_id: marketId,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            User Context
          </span>
          {isDemoUser && (
            <span className="text-xs font-sans font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
              Active Persona: {profile?.display_name}
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('profile.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {t('profile.subtitle')}
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>Profile preferences saved successfully!</span>
        </div>
      )}

      {/* Settings Card */}
      <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-6">
        
        {/* Basic Identity */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-forest-border/60 pb-3">
            <User className="w-4 h-4 text-emerald-500" />
            Identity & General Context
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('profile.display_name')}
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Registered Email
              </label>
              <input
                type="text"
                disabled
                value={user?.email || 'demo.student@nutrilens.internal'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-forest-border bg-slate-100 dark:bg-forest-root text-xs text-slate-400 cursor-not-allowed font-sans"
              />
            </div>
          </div>
        </div>

        {/* Nutrition Goal & Household */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-forest-border/60 pb-3">
            <Target className="w-4 h-4 text-emerald-500" />
            Nutrition Goals & Constraints
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('profile.goal')}
              </label>
              <select
                value={generalGoal}
                onChange={(e) => setGeneralGoal(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="balanced_wellness">Balanced Everyday Nutrition</option>
                <option value="budget_friendly">Budget-Friendly Vitality</option>
                <option value="high_protein">High Protein (Athletic / Active)</option>
                <option value="diabetic_friendly_lifestyle">Low-Glycemic Lifestyle</option>
                <option value="heart_conscious">Heart Conscious / Low Sodium</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Household Size (People)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={householdSize}
                onChange={(e) => setHouseholdSize(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('profile.budget')}
              </label>
              <input
                type="number"
                min="50"
                step="10"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans tabular-nums font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('profile.market')}
              </label>
              <select
                value={marketId}
                onChange={(e) => setMarketId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="22222222-2222-2222-2222-222222222201">Savar Demo Market (Dhaka Division)</option>
                <option value="22222222-2222-2222-2222-222222222202">Ashulia Demo Market (Dhaka Division)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Language & Theme Controls */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-forest-border/60 pb-3">
            <Languages className="w-4 h-4 text-emerald-500" />
            Preferences
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/60">
              <div>
                <p className="font-semibold text-xs text-slate-900 dark:text-white">Interface Language</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Toggle between English & বাংলা</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setLocale('en')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold ${
                    locale === 'en' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-forest-card text-slate-700 dark:text-slate-300'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLocale('bn')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold ${
                    locale === 'bn' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-forest-card text-slate-700 dark:text-slate-300'
                  }`}
                >
                  বাং
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={<Save className="w-4 h-4" />}
          >
            {t('profile.save_btn')}
          </Button>
        </div>
      </form>
    </div>
  );
};
