import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
  Camera,
  Store,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Receipt,
  Clock,
  ShieldCheck,
  Flame,
  Beef,
  Wheat,
  Droplet,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { formatCurrency, formatGrams } from '../../lib/formatters';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { profile } = useAuth();

  const currentGoalLabel = {
    budget_friendly: 'Budget-Friendly Vitality',
    balanced_wellness: 'Balanced Family Nutrition',
    high_protein: 'High Protein / Active Lifestyle',
    diabetic_friendly_lifestyle: 'Low-GI Lifestyle',
    heart_conscious: 'Heart Conscious',
  }[profile?.general_goal || 'balanced_wellness'];

  const recentMeals = [
    {
      id: 'm1',
      title: 'Bhat + Masoor Dal + Dim Bhaji',
      titleBn: 'ভাত + মসুর ডাল + ডিম ভাজি',
      time: 'Today, 1:30 PM (Lunch)',
      calories: 465,
      protein: 21.8,
      bazarCost: 49.60,
      status: 'confirmed',
    },
    {
      id: 'm2',
      title: 'Sobji Khichuri with Pumpkin & Lentil',
      titleBn: 'সবজি খিচুড়ি',
      time: 'Yesterday, 8:45 PM (Dinner)',
      calories: 395,
      protein: 14.2,
      bazarCost: 38.00,
      status: 'confirmed',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 1. Header & Context Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              {currentGoalLabel}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-forest-root px-2.5 py-1 rounded-full border border-slate-200 dark:border-forest-border/60">
              Savar Demo Market
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('dashboard.welcome')}, {profile?.display_name || 'Member'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
            Plate-to-market intelligence active. Tracking nutrition against your {formatCurrency(profile?.budget_amount || 150)} daily budget.
          </p>
        </div>

        {/* Quick Action Button */}
        <div className="shrink-0">
          <Link to="/app/analyze">
            <Button variant="primary" size="lg" icon={<Camera className="w-5 h-5" />}>
              Scan Food Photo
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Calories Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-medium">Energy Intake</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">860 <span className="text-xs font-normal text-slate-400">kcal</span></p>
          <div className="w-full bg-slate-100 dark:bg-forest-root rounded-full h-1.5 overflow-hidden">
            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '45%' }} />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Target: ~2,000 kcal</p>
        </div>

        {/* Protein Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-medium">Protein</span>
            <Beef className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">36.0 <span className="text-xs font-normal text-slate-400">g</span></p>
          <div className="w-full bg-slate-100 dark:bg-forest-root rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '60%' }} />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Lentils & Farm Eggs</p>
        </div>

        {/* Carbohydrates Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-medium">Carbohydrates</span>
            <Wheat className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">125.4 <span className="text-xs font-normal text-slate-400">g</span></p>
          <div className="w-full bg-slate-100 dark:bg-forest-root rounded-full h-1.5 overflow-hidden">
            <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: '52%' }} />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Parboiled Rice basis</p>
        </div>

        {/* Budget Spend Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-medium">Bazar Cost</span>
            <Store className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">৳ 87.60</p>
          <div className="w-full bg-slate-100 dark:bg-forest-root rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '58%' }} />
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Within ৳150 limit</p>
        </div>
      </div>

      {/* 3. Main Grid: Recent Meals & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Recent Meals */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              {t('dashboard.recent_activity')}
            </h2>
            <Link to="/app/report" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
              View Evidence Receipts →
            </Link>
          </div>

          <div className="space-y-3">
            {recentMeals.map((meal) => (
              <div
                key={meal.id}
                className="p-5 rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm hover:border-emerald-500/40 transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-slate-900 dark:text-white">
                      {meal.title}
                    </p>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Confirmed
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {meal.titleBn} • {meal.time}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 text-xs shrink-0">
                  <div className="text-left sm:text-right">
                    <p className="font-bold text-slate-900 dark:text-white">{meal.calories} kcal</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Protein: {meal.protein}g</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">৳ {meal.bazarCost.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">SIMULATED</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Quick Workflows */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Quick Actions
          </h2>

          <div className="space-y-3">
            <Link
              to="/app/analyze"
              className="block p-4 rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border hover:border-emerald-500 transition-all group shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                    {t('dashboard.quick_analyze')}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Capture photo or search local meal dishes manually.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/app/bazar"
              className="block p-4 rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border hover:border-emerald-500 transition-all group shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                    {t('dashboard.quick_bazar')}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Inspect Savar & Ashulia egg, fish, and lentil prices.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/app/meal-rescue"
              className="block p-4 rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border hover:border-emerald-500 transition-all group shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                    {t('dashboard.quick_rescue')}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Affordable ingredient substitutions that match your budget.
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Provenance note */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/60 text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Nutritional Integrity
            </span>
            <p className="text-[11px] leading-relaxed">
              Calculations strictly utilize FAO Food Composition Table for Bangladesh (2013). Unmeasured nutrients remain unknown ($NULL \ne 0$).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
