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
  ShieldCheck,
  Flame,
  Beef,
  Wheat,
  Droplet,
  UtensilsCrossed,
  CheckCircle2,
  RefreshCw,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../lib/formatters';
import {
  getDashboardMetrics,
  deleteMealLog,
  type DashboardMetrics,
  type ConfirmedMealRecord,
} from '../../services/dashboardService';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  const displayName = profile?.display_name || profile?.full_name || user?.user_metadata?.full_name || 'Member';
  const photoUrl = profile?.avatar_url || (user?.user_metadata as any)?.avatar_url || (user?.user_metadata as any)?.picture;

  const [imgError, setImgError] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  // Load live metrics from Supabase & Local Cache
  const loadMetrics = async () => {
    const effectiveUserId = user?.id || profile?.id || 'guest';
    setIsLoading(true);
    try {
      const data = await getDashboardMetrics(effectiveUserId, profile);
      setMetrics(data);
    } catch (err) {
      console.warn('Failed to load dashboard metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    const effectiveUserId = user?.id || profile?.id || 'guest';
    setDeletingId(mealId);
    try {
      await deleteMealLog(effectiveUserId, mealId);
      await loadMetrics();
    } catch (err) {
      console.warn('Failed to delete meal:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleMealClick = (meal: ConfirmedMealRecord) => {
    // Transform items into confirmedItems structure with high fidelity for ReportPage
    const confirmedItems = (meal.items && meal.items.length > 0)
      ? meal.items.map((it, idx) => ({
          id: it.foodId || `item_${idx}`,
          foodId: it.foodId,
          foodName: it.name,
          foodNameBn: it.nameBn,
          category: it.category,
          state: it.preparationState || 'cooked',
          grams: it.grams || 100,
          calories: it.calories,
          protein: it.protein,
          carbs: it.carbs,
          fat: it.fat,
          cost: it.cost,
        }))
      : meal.title.split('+').map((part, idx) => ({
          id: `item_${idx}`,
          foodId: `item_${idx}`,
          foodName: part.trim(),
          grams: 150,
          state: 'cooked',
        }));

    navigate(`/app/report?mealId=${encodeURIComponent(meal.id)}`, {
      state: {
        meal,
        confirmedItems,
        mealTitle: meal.title,
        mealTitleBn: meal.titleBn,
        mealTime: meal.time,
      },
    });
  };

  useEffect(() => {
    loadMetrics();
    const handleMealConfirmed = () => {
      loadMetrics();
    };
    window.addEventListener('nutrilens_meal_confirmed', handleMealConfirmed);
    return () => window.removeEventListener('nutrilens_meal_confirmed', handleMealConfirmed);
  }, [user?.id, profile?.id]);

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

  const recentMeals = metrics?.recentMeals ?? [];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 1. Header & Context Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-forest-card border border-slate-200/80 dark:border-forest-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-200">
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Profile Photo Avatar */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-700 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-emerald-600/10 ring-2 ring-emerald-500/20 dark:ring-emerald-400/20">
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
              className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-forest-card rounded-full flex items-center justify-center shadow-xs"
              title="Active Profile"
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            </div>
          </div>

          {/* Welcome Text & Live Intelligence Status */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
              <span>{t('dashboard.welcome')}, {displayName}</span>
              <span className="animate-wave text-2xl sm:text-3xl select-none" role="img" aria-label="Waving hand">
                👋
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              Plate-to-market intelligence active. Tracking live nutrition against your {formatCurrency(dailyBudget)} daily budget.
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="shrink-0 flex items-center gap-3">
          <button
            onClick={loadMetrics}
            disabled={isLoading}
            className="p-2.5 rounded-2xl border border-slate-200 dark:border-forest-border hover:bg-slate-50 dark:hover:bg-forest-root text-slate-600 dark:text-slate-300 transition-colors"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>

          <Link to="/app/analyze">
            <Button
              variant="primary"
              size="lg"
              icon={<Camera className="w-5 h-5" />}
              className="shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all duration-200"
            >
              Scan Food Photo
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Grid — 100% Live Aggregates from Database */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Calories Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-medium">Energy Intake</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {todayCalories} <span className="text-xs font-normal text-slate-400">kcal</span>
          </p>
          <div className="w-full bg-slate-100 dark:bg-forest-root rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${caloriesPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            Target: ~{targetCalories.toLocaleString()} kcal ({Math.max(0, targetCalories - todayCalories)} left)
          </p>
        </div>

        {/* Protein Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-medium">Protein</span>
            <Beef className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {todayProtein.toFixed(1)} <span className="text-xs font-normal text-slate-400">g</span>
          </p>
          <div className="w-full bg-slate-100 dark:bg-forest-root rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${proteinPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate" title={metrics?.proteinSourcesText}>
            {metrics?.proteinSourcesText || `${todayProtein}g of ${targetProtein}g target`}
          </p>
        </div>

        {/* Carbohydrates Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-medium">Carbohydrates</span>
            <Wheat className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {todayCarbs.toFixed(1)} <span className="text-xs font-normal text-slate-400">g</span>
          </p>
          <div className="w-full bg-slate-100 dark:bg-forest-root rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-sky-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${carbsPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate" title={metrics?.carbsSourcesText}>
            {metrics?.carbsSourcesText || `${todayCarbs}g of ${targetCarbs}g target`}
          </p>
        </div>

        {/* Budget Spend Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-medium">Bazar Cost</span>
            <Store className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            ৳ {todayCost.toFixed(2)}
          </p>
          <div className="w-full bg-slate-100 dark:bg-forest-root rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                todayCost > dailyBudget ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
          <p
            className={`text-[11px] truncate font-medium ${
              todayCost > dailyBudget
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {metrics?.budgetStatusText || `Within ৳${dailyBudget} limit`}
          </p>
        </div>
      </div>

      {/* 3. Main Grid: Recent Meals & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Recent Confirmed Meals */}
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

          {/* Real Confirmed Meals List */}
          {recentMeals.length > 0 ? (
            <div className="space-y-3">
              {recentMeals.map((meal) => (
                <div
                  key={meal.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleMealClick(meal)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleMealClick(meal);
                    }
                  }}
                  className="group p-5 rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-xs hover:border-emerald-500/60 dark:hover:border-emerald-500/60 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  title="Click to view detailed nutrition report"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {meal.title}
                      </p>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Confirmed
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {meal.titleBn ? `${meal.titleBn} • ` : ''}{meal.time}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 text-xs shrink-0">
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {Number(meal.calories ?? 0).toFixed(0)} kcal
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Protein: {Number(meal.protein ?? 0).toFixed(1)}g
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">
                        ৳ {Number(meal.bazarCost ?? (meal as any).cost ?? 0).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 font-sans font-medium">FCDB VERIFIED</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMeal(meal.id);
                        }}
                        disabled={deletingId === meal.id}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0"
                        title="Delete meal record"
                      >
                        <Trash2 className={`w-4 h-4 ${deletingId === meal.id ? 'animate-spin' : ''}`} />
                      </button>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all hidden sm:block shrink-0" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Clean Empty State when no meals logged yet */
            <div className="p-8 rounded-3xl bg-white dark:bg-forest-card border border-dashed border-slate-300 dark:border-forest-border/80 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <UtensilsCrossed className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  No meals logged yet today
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Take a photo of your breakfast, lunch, or dinner to calculate verified nutrient intake and track your real-time bazar budget.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Link to="/app/analyze">
                  <Button variant="primary" size="md" icon={<Camera className="w-4 h-4" />}>
                    Scan Food Photo
                  </Button>
                </Link>
              </div>
            </div>
          )}
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
