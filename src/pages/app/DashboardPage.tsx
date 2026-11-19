import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Flame,
  Beef,
  Wheat,
  Droplet,
  UtensilsCrossed,
  CheckCircle2,
  RefreshCw,
  Trash2,
  ChevronRight,
  History,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../lib/formatters';
import {
  getDashboardMetrics,
  deleteMealLog,
  type DashboardMetrics,
  type ConfirmedMealRecord,
} from '../../services/dashboardService';
import { NutrientStackBarChart } from '../../components/dashboard/NutrientStackBarChart';
import { getDailyNutrientStats, type DailyNutrientStat } from '../../services/mealIntakeDb';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  const effectiveUserId = user?.id || profile?.id || 'guest';
  const displayName = profile?.display_name || profile?.full_name || user?.user_metadata?.full_name || 'Member';
  const photoUrl = profile?.avatar_url || (user?.user_metadata as any)?.avatar_url || (user?.user_metadata as any)?.picture;

  const [imgError, setImgError] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyNutrientStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setImgError(false);
  }, [photoUrl]);

  const initials = useMemo(() => {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase();
  }, [displayName]);

  // Load live metrics and daily stacked nutrients from database
  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const [metricsData, statsData] = await Promise.all([
        getDashboardMetrics(effectiveUserId, profile),
        getDailyNutrientStats(effectiveUserId, 14),
      ]);
      setMetrics(metricsData);
      setDailyStats(statsData);
    } catch (err) {
      console.warn('Failed to load dashboard metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    const handleMealConfirmed = () => {
      loadMetrics();
    };
    window.addEventListener('nutrilens_meal_confirmed', handleMealConfirmed);
    window.addEventListener('nutrilens_meal_intake_updated', handleMealConfirmed);
    return () => {
      window.removeEventListener('nutrilens_meal_confirmed', handleMealConfirmed);
      window.removeEventListener('nutrilens_meal_intake_updated', handleMealConfirmed);
    };
  }, [effectiveUserId]);

  const dailyBudget = metrics?.dailyBudget || profile?.budget_amount || 150;
  const targetCalories = metrics?.targetCalories || 2000;
  const targetProtein = metrics?.targetProtein || 65;
  const targetCarbs = metrics?.targetCarbs || 250;

  const todayCalories = metrics?.todayCalories ?? 0;
  const todayProtein = metrics?.todayProtein ?? 0;
  const todayCarbs = metrics?.todayCarbs ?? 0;
  const todayCost = metrics?.todayCost ?? 0;

  const caloriesPercent = metrics?.caloriesPercent ?? 0;
  const proteinPercent = metrics?.proteinPercent ?? 0;
  const carbsPercent = metrics?.carbsPercent ?? 0;
  const budgetPercent = metrics?.budgetPercent ?? 0;

  return (
    <div className="space-y-4 animate-fadeIn">
      
      {/* 1. Header & Context Card (Uniform 1rem / p-4 padding & gap-4, sharp rounded-xl radius preserved, green-to-white gradient) */}
      <div className="p-4 sm:p-4.5 rounded-xl bg-gradient-to-l from-emerald-500/12 via-emerald-500/3 to-white dark:from-emerald-950/25 dark:via-forest-card dark:to-forest-card border border-slate-200/80 dark:border-forest-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200">
        <div className="flex items-center gap-3.5 sm:gap-4">
          {/* Profile Photo Avatar */}
          <div className="relative shrink-0">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-700 text-white font-extrabold text-base flex items-center justify-center shadow-xs ring-2 ring-emerald-500/20">
              {photoUrl && !imgError ? (
                <img
                  src={photoUrl}
                  alt={displayName}
                  key={photoUrl}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-forest-card rounded-full flex items-center justify-center shadow-xs"
              title="Active Profile"
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            </div>
          </div>

          {/* Welcome Text & Live Intelligence Status */}
          <div className="space-y-1">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              <span>{t('dashboard.welcome')}, {displayName}</span>
              <span className="animate-wave text-lg select-none" role="img" aria-label="Waving hand">
                👋
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              Plate-to-market intelligence active. Tracking live nutrition against your {formatCurrency(dailyBudget)} daily budget.
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="shrink-0 flex items-center gap-2.5 flex-wrap">
          <button
            onClick={loadMetrics}
            disabled={isLoading}
            className="p-2 rounded-lg border border-slate-200 dark:border-forest-border hover:bg-slate-50 dark:hover:bg-forest-root text-slate-600 dark:text-slate-300 transition-colors"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>

          <Link to="/app/recent-analysis">
            <Button
              variant="outline"
              size="sm"
              icon={<History className="w-3.5 h-3.5 text-emerald-600" />}
              className="rounded-lg text-xs py-1.5 px-3"
            >
              Recent Analysis
            </Button>
          </Link>

          <Link to="/app/analyze">
            <Button
              variant="primary"
              size="sm"
              icon={<Camera className="w-3.5 h-3.5" />}
              className="rounded-lg text-xs py-1.5 px-3 shadow-xs"
            >
              Scan Food Photo
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Grid — Uniform 1rem (16px / gap-4 & p-4) spacing; Colors: kcal -> RED, protein -> YELLOWISH ORANGE (amber), carbs -> GREEN, cost -> BLUE */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Calories Card: RED */}
        <div className="p-4 rounded-xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Energy Intake</span>
            <Flame className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {todayCalories} <span className="text-xs font-normal text-slate-400">kcal</span>
          </p>
          <div className="w-full bg-slate-100 dark:bg-forest-root rounded-full h-1.5 overflow-hidden mt-2">
            <div
              className="bg-red-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${caloriesPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            Target: ~{targetCalories.toLocaleString()} kcal ({Math.max(0, targetCalories - todayCalories)} left)
          </p>
        </div>

        {/* Protein Card: YELLOWISH ORANGE (Amber-500) */}
        <div className="p-4 rounded-xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Protein</span>
            <Beef className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {todayProtein.toFixed(1)} <span className="text-xs font-normal text-slate-400">g</span>
          </p>
          <div className="w-full bg-slate-100 dark:bg-forest-root rounded-full h-1.5 overflow-hidden mt-2">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${proteinPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate" title={metrics?.proteinSourcesText}>
            {metrics?.proteinSourcesText || `${todayProtein}g of ${targetProtein}g target`}
          </p>
        </div>

        {/* Carbohydrates Card: GREEN */}
        <div className="p-4 rounded-xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Carbohydrates</span>
            <Wheat className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {todayCarbs.toFixed(1)} <span className="text-xs font-normal text-slate-400">g</span>
          </p>
          <div className="w-full bg-slate-100 dark:bg-forest-root rounded-full h-1.5 overflow-hidden mt-2">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${carbsPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate" title={metrics?.carbsSourcesText}>
            {metrics?.carbsSourcesText || `${todayCarbs}g of ${targetCarbs}g target`}
          </p>
        </div>

        {/* Budget Spend Card: BLUE */}
        <div className="p-4 rounded-xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Bazar Cost</span>
            <Store className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            ৳ {todayCost.toFixed(2)}
          </p>
          <div className="w-full bg-slate-100 dark:bg-forest-root rounded-full h-1.5 overflow-hidden mt-2">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                todayCost > dailyBudget ? 'bg-rose-500' : 'bg-blue-500'
              }`}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
          <p
            className={`text-[11px] truncate font-medium ${
              todayCost > dailyBudget
                ? 'text-rose-600 dark:text-rose-400 font-bold'
                : 'text-blue-600 dark:text-blue-400'
            }`}
          >
            {metrics?.budgetStatusText || `Within ৳${dailyBudget} limit`}
          </p>
        </div>
      </div>

      {/* 3. Main Grid: Daily Nutrients Stacked Bar Chart & Quick Actions — Uniform 1rem (16px / gap-4) scale */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Stacked Bar Chart for Daily Nutrients Intake */}
        <div className="lg:col-span-8">
          <NutrientStackBarChart
            stats={dailyStats}
            userId={effectiveUserId}
            targetCalories={targetCalories}
          />
        </div>

        {/* Right Column: Quick Workflows & Recent Activity Link (1rem / gap-4 spacing) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Quick Actions
            </h2>
            <Link
              to="/app/recent-analysis"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
            >
              <span>Recent Plates</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            <Link
              to="/app/analyze"
              className="block p-3.5 rounded-xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border hover:border-emerald-500 transition-all group shadow-2xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-7.5 h-7.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Camera className="w-3.5 h-3.5" />
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
              to="/app/recent-analysis"
              className="block p-3.5 rounded-xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border hover:border-emerald-500 transition-all group shadow-2xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-7.5 h-7.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <History className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                    Recent Plate Analysis
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    View all, weekwise, and monthwise confirmed plates.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/app/bazar"
              className="block p-3.5 rounded-xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border hover:border-emerald-500 transition-all group shadow-2xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-7.5 h-7.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Store className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                    Check Bazar Prices
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Inspect Savar & Ashulia egg, fish, and lentil prices.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/app/rescue"
              className="block p-3.5 rounded-xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border hover:border-emerald-500 transition-all group shadow-2xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-7.5 h-7.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                    Optimize Next Meal
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Affordable ingredient substitutions that match your budget.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
