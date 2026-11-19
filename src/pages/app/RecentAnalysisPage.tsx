import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
  Clock,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  ChevronRight,
  Utensils,
  Camera,
  Flame,
  Beef,
  Wheat,
  Droplet,
  Store,
  RefreshCw,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../lib/formatters';
import {
  getAllMealIntakes,
  getMealsWeekwise,
  getMealsMonthwise,
  deleteMealIntake,
  type StoredMealRecord,
} from '../../services/mealIntakeDb';
import { deleteMealLog } from '../../services/dashboardService';

type FilterPeriod = 'all' | 'week' | 'month';

export const RecentAnalysisPage: React.FC = () => {
  const { t } = useTranslation();
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  const effectiveUserId = user?.id || profile?.id || 'guest';

  const [allMeals, setAllMeals] = useState<StoredMealRecord[]>([]);
  const [weekMeals, setWeekMeals] = useState<StoredMealRecord[]>([]);
  const [monthMeals, setMonthMeals] = useState<StoredMealRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState<FilterPeriod>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [all, weekData, monthData] = await Promise.all([
        getAllMealIntakes(effectiveUserId),
        getMealsWeekwise(effectiveUserId),
        getMealsMonthwise(effectiveUserId),
      ]);
      setAllMeals(all);
      setWeekMeals(weekData.thisWeek);
      setMonthMeals(monthData.thisMonth);
    } catch (err) {
      console.warn('Failed to load meal intake history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener('nutrilens_meal_confirmed', handleUpdate);
    window.addEventListener('nutrilens_meal_intake_updated', handleUpdate);
    return () => {
      window.removeEventListener('nutrilens_meal_confirmed', handleUpdate);
      window.removeEventListener('nutrilens_meal_intake_updated', handleUpdate);
    };
  }, [effectiveUserId]);

  const handleDelete = async (mealId: string) => {
    setDeletingId(mealId);
    try {
      await deleteMealIntake(effectiveUserId, mealId);
      await deleteMealLog(effectiveUserId, mealId);
      await loadData();
    } catch (err) {
      console.warn('Failed to delete meal record:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleMealClick = (meal: StoredMealRecord) => {
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

  // Determine current active subset based on period tab
  const currentPeriodMeals = useMemo(() => {
    if (activePeriod === 'week') return weekMeals;
    if (activePeriod === 'month') return monthMeals;
    return allMeals;
  }, [activePeriod, allMeals, weekMeals, monthMeals]);

  // Apply search query filter
  const filteredMeals = useMemo(() => {
    if (!searchQuery.trim()) return currentPeriodMeals;
    const q = searchQuery.toLowerCase();
    return currentPeriodMeals.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        (m.titleBn && m.titleBn.toLowerCase().includes(q)) ||
        m.items.some((it) => it.name.toLowerCase().includes(q) || (it.nameBn && it.nameBn.toLowerCase().includes(q)))
    );
  }, [currentPeriodMeals, searchQuery]);

  // Aggregate stats for currently viewed period
  const periodStats = useMemo(() => {
    const count = filteredMeals.length;
    const totalCal = filteredMeals.reduce((acc, m) => acc + (m.calories || 0), 0);
    const totalPro = filteredMeals.reduce((acc, m) => acc + (m.protein || 0), 0);
    const totalCost = filteredMeals.reduce((acc, m) => acc + (m.bazarCost || 0), 0);
    const avgCal = count > 0 ? Math.round(totalCal / count) : 0;

    return {
      count,
      totalCal,
      totalPro: Number(totalPro.toFixed(1)),
      totalCost: Number(totalCost.toFixed(2)),
      avgCal,
    };
  }, [filteredMeals]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn pb-12">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-white dark:bg-forest-card border border-slate-200/80 dark:border-forest-border shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Recent Plate Analysis
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            History of your confirmed food scans, itemized nutrients, and verified Bangladesh bazar cost breakdowns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2.5 rounded-2xl border border-slate-200 dark:border-forest-border hover:bg-slate-50 dark:hover:bg-forest-root text-slate-600 dark:text-slate-300 transition-colors"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
          <Link to="/app/analyze">
            <Button variant="primary" size="sm" icon={<Camera className="w-4 h-4" />}>
              Scan New Plate
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Filter Pills & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Period Selector Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-2xs self-start">
          <button
            type="button"
            onClick={() => setActivePeriod('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activePeriod === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Meals ({allMeals.length})
          </button>
          <button
            type="button"
            onClick={() => setActivePeriod('week')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activePeriod === 'week'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            This Week ({weekMeals.length})
          </button>
          <button
            type="button"
            onClick={() => setActivePeriod('month')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activePeriod === 'month'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            This Month ({monthMeals.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px] sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dish (e.g. Rice, Fish, Dal)..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-forest-border bg-white dark:bg-forest-card text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>
      </div>

      {/* 3. Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-forest-card border border-slate-200/80 dark:border-forest-border shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-emerald-500" />
            Total Meals
          </span>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {periodStats.count} <span className="text-xs font-normal text-slate-400">logged</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-forest-card border border-slate-200/80 dark:border-forest-border shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            Avg Calories
          </span>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {periodStats.avgCal} <span className="text-xs font-normal text-slate-400">kcal/meal</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-forest-card border border-slate-200/80 dark:border-forest-border shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Beef className="w-3.5 h-3.5 text-emerald-500" />
            Total Protein
          </span>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {periodStats.totalPro} <span className="text-xs font-normal text-slate-400">g</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-forest-card border border-slate-200/80 dark:border-forest-border shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-emerald-500" />
            Total Bazar Cost
          </span>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            ৳ {periodStats.totalCost.toFixed(2)}
          </p>
        </div>
      </div>

      {/* 4. Meal Cards List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Loading meal records from database...
          </div>
        ) : filteredMeals.length > 0 ? (
          filteredMeals.map((meal) => (
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
              title="Click to view full nutrition evidence receipt"
            >
              {/* Left Info */}
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {meal.title}
                  </p>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Confirmed
                  </span>
                  {meal.mealType && (
                    <span className="text-[10px] font-semibold capitalize text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-forest-root px-2 py-0.5 rounded-full">
                      {meal.mealType}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {meal.titleBn ? `${meal.titleBn} • ` : ''}
                  <span className="font-medium text-slate-700 dark:text-slate-300">{meal.time}</span>
                </p>

                {/* Items breakdown pills */}
                {meal.items && meal.items.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {meal.items.map((it, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-forest-root border border-slate-200/60 dark:border-forest-border/60 text-slate-600 dark:text-slate-300 font-medium"
                      >
                        {it.name} ({it.grams}g)
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Stats & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-5 text-xs shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-forest-border/40">
                <div className="text-left sm:text-right space-y-0.5">
                  <p className="font-extrabold text-base text-slate-900 dark:text-white">
                    {meal.calories} <span className="text-xs font-normal text-slate-400">kcal</span>
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Protein: <span className="font-bold text-emerald-600 dark:text-emerald-400">{meal.protein}g</span>
                  </p>
                </div>

                <div className="text-right space-y-0.5">
                  <p className="font-extrabold text-base text-emerald-600 dark:text-emerald-400">
                    ৳ {meal.bazarCost.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 font-sans font-medium">
                    FCDB VERIFIED
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(meal.id);
                    }}
                    disabled={deletingId === meal.id}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Delete meal record"
                  >
                    <Trash2 className={`w-4 h-4 ${deletingId === meal.id ? 'animate-spin' : ''}`} />
                  </button>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all hidden sm:block" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 rounded-3xl bg-white dark:bg-forest-card border border-dashed border-slate-300 dark:border-forest-border text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              No meal records found for this period
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Scan or confirm your meals to track your daily calorie intake, macronutrients, and bazar cost.
            </p>
            <div className="pt-2">
              <Link to="/app/analyze">
                <Button variant="primary" size="sm" icon={<Camera className="w-4 h-4" />}>
                  Scan Food Photo
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
