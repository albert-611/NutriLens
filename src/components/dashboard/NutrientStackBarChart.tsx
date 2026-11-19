import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, Calendar, Flame, Beef, Wheat, Store, ChevronDown } from 'lucide-react';
import {
  getDailyNutrientStats,
  getMonthNutrientStats,
  type DailyNutrientStat,
} from '../../services/mealIntakeDb';

interface NutrientStackBarChartProps {
  stats?: DailyNutrientStat[];
  userId?: string;
  targetCalories?: number;
  className?: string;
}

type NutrientType = 'protein' | 'carbs' | 'cost';
type RangeOption = '7' | '14' | '30' | 'month';

export const NutrientStackBarChart: React.FC<NutrientStackBarChartProps> = ({
  stats: propStats,
  userId = 'guest',
  targetCalories = 2000,
  className = '',
}) => {
  const [selectedRange, setSelectedRange] = useState<RangeOption>('7');
  
  // Specific Month state (default to current month)
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth()); // 0-11

  const [activeDay, setActiveDay] = useState<DailyNutrientStat | null>(null);
  const [hoveredBarDate, setHoveredBarDate] = useState<string | null>(null);
  const [hoveredNutrient, setHoveredNutrient] = useState<NutrientType | null>(null);

  const [loadedStats, setLoadedStats] = useState<DailyNutrientStat[]>(propStats || []);
  const [isLoading, setIsLoading] = useState(false);

  // Load stats based on selectedRange (7d, 14d, 30d, or specific month)
  const fetchStats = async () => {
    setIsLoading(true);
    try {
      if (selectedRange === 'month') {
        const data = await getMonthNutrientStats(userId, selectedYear, selectedMonth);
        setLoadedStats(data);
      } else {
        const days = parseInt(selectedRange, 10) || 7;
        const data = await getDailyNutrientStats(userId, days);
        setLoadedStats(data);
      }
    } catch (err) {
      console.warn('Failed to fetch nutrient stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedRange, selectedYear, selectedMonth, userId]);

  // Listen for live meal updates
  useEffect(() => {
    const handleUpdate = () => {
      fetchStats();
    };
    window.addEventListener('nutrilens_meal_confirmed', handleUpdate);
    window.addEventListener('nutrilens_meal_intake_updated', handleUpdate);
    return () => {
      window.removeEventListener('nutrilens_meal_confirmed', handleUpdate);
      window.removeEventListener('nutrilens_meal_intake_updated', handleUpdate);
    };
  }, [selectedRange, selectedYear, selectedMonth, userId]);

  // Month selector options (Last 12 months)
  const monthOptions = useMemo(() => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const options: Array<{ label: string; year: number; month: number }> = [];
    const current = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(current.getFullYear(), current.getMonth() - i, 1);
      options.push({
        label: `${months[d.getMonth()]} ${d.getFullYear()}`,
        year: d.getFullYear(),
        month: d.getMonth(),
      });
    }
    return options;
  }, []);

  // Compute maximum stack value across visible days for sharp, proportional scaling
  // Stacking: Carbohydrate (g) + Protein (g) + Bazar Cost (scaled)
  const maxStackValue = useMemo(() => {
    if (loadedStats.length === 0) return 100;
    const maxVal = Math.max(
      ...loadedStats.map((s) => s.carbs + s.protein + (s.cost * 0.5)),
      80
    );
    return maxVal;
  }, [loadedStats]);

  const active = activeDay || (hoveredBarDate ? loadedStats.find((s) => s.date === hoveredBarDate) : null) || loadedStats[loadedStats.length - 1] || null;

  return (
    <div className={`p-5 sm:p-6 rounded-3xl bg-white dark:bg-forest-card border border-slate-200/80 dark:border-forest-border shadow-sm space-y-4.5 ${className}`}>
      
      {/* 1. Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Daily Nutrients & Cost Intake</span>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Stacked
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {selectedRange === '7'
              ? 'Sunday - Saturday weekly intake breakdown'
              : selectedRange === 'month'
              ? `Daily breakdown for ${monthOptions.find((m) => m.year === selectedYear && m.month === selectedMonth)?.label}`
              : `Last ${selectedRange} days intake breakdown`}
          </p>
        </div>

        {/* Legend & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Interactive Legend with Focus on Hover */}
          <div className="flex items-center gap-3 text-xs select-none">
            {/* Protein: Red */}
            <button
              type="button"
              onMouseEnter={() => setHoveredNutrient('protein')}
              onMouseLeave={() => setHoveredNutrient(null)}
              className={`flex items-center gap-1.5 transition-all font-semibold ${
                hoveredNutrient && hoveredNutrient !== 'protein' ? 'opacity-30' : 'opacity-100'
              }`}
              title="Click or hover to highlight Protein"
            >
              <span className="w-2.5 h-2.5 rounded-xs bg-red-500 shadow-xs" />
              <span className="text-red-700 dark:text-red-400">Protein</span>
            </button>

            {/* Carbohydrate: Green */}
            <button
              type="button"
              onMouseEnter={() => setHoveredNutrient('carbs')}
              onMouseLeave={() => setHoveredNutrient(null)}
              className={`flex items-center gap-1.5 transition-all font-semibold ${
                hoveredNutrient && hoveredNutrient !== 'carbs' ? 'opacity-30' : 'opacity-100'
              }`}
              title="Click or hover to highlight Carbohydrates"
            >
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 shadow-xs" />
              <span className="text-emerald-700 dark:text-emerald-400">Carbohydrate</span>
            </button>

            {/* Bazar Cost: Blue */}
            <button
              type="button"
              onMouseEnter={() => setHoveredNutrient('cost')}
              onMouseLeave={() => setHoveredNutrient(null)}
              className={`flex items-center gap-1.5 transition-all font-semibold ${
                hoveredNutrient && hoveredNutrient !== 'cost' ? 'opacity-30' : 'opacity-100'
              }`}
              title="Click or hover to highlight Bazar Cost"
            >
              <span className="w-2.5 h-2.5 rounded-xs bg-blue-500 shadow-xs" />
              <span className="text-blue-700 dark:text-blue-400">Bazar Cost</span>
            </button>
          </div>

          {/* Time Range Pills: 7d (Sun-Sat), 14d, 30d, Month */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-forest-root border border-slate-200 dark:border-forest-border text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSelectedRange('7')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedRange === '7'
                  ? 'bg-white dark:bg-forest-card text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              7 Days (Sun-Sat)
            </button>
            <button
              type="button"
              onClick={() => setSelectedRange('14')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedRange === '14'
                  ? 'bg-white dark:bg-forest-card text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              14 Days
            </button>
            <button
              type="button"
              onClick={() => setSelectedRange('30')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedRange === '30'
                  ? 'bg-white dark:bg-forest-card text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              30 Days
            </button>
            <button
              type="button"
              onClick={() => setSelectedRange('month')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedRange === 'month'
                  ? 'bg-white dark:bg-forest-card text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Month
            </button>
          </div>

          {/* Specific Month Dropdown (visible when 'month' range is selected) */}
          {selectedRange === 'month' && (
            <div className="relative">
              <select
                value={`${selectedYear}-${selectedMonth}`}
                onChange={(e) => {
                  const [y, m] = e.target.value.split('-').map(Number);
                  setSelectedYear(y);
                  setSelectedMonth(m);
                }}
                className="appearance-none pl-3 pr-8 py-1 rounded-xl border border-slate-200 dark:border-forest-border bg-white dark:bg-forest-card text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {monthOptions.map((opt) => (
                  <option key={`${opt.year}-${opt.month}`} value={`${opt.year}-${opt.month}`}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}
        </div>
      </div>

      {/* 2. Sharp Stacked Bars Canvas */}
      <div className="relative pt-6 pb-2">
        {/* Subtle grid lines */}
        <div className="absolute inset-x-0 top-6 bottom-8 flex flex-col justify-between pointer-events-none opacity-20 dark:opacity-10">
          <div className="border-b border-dashed border-slate-400 w-full" />
          <div className="border-b border-dashed border-slate-400 w-full" />
          <div className="border-b border-dashed border-slate-400 w-full" />
        </div>

        {/* Bars Container */}
        <div className="flex items-end justify-between gap-1.5 sm:gap-2.5 h-48 sm:h-52 px-1 overflow-x-auto select-none">
          {loadedStats.map((stat) => {
            const stackTotal = stat.carbs + stat.protein + (stat.cost * 0.5);
            const barHeightPct = stackTotal > 0 ? Math.min(100, Math.max(12, (stackTotal / maxStackValue) * 100)) : 3;

            // When hovering any individual bar, other bars get transparent!
            const isThisBarHovered = hoveredBarDate === stat.date;
            const isAnyBarHovered = hoveredBarDate !== null;
            const barOpacityClass = isAnyBarHovered
              ? isThisBarHovered
                ? 'opacity-100'
                : 'opacity-25'
              : 'opacity-100';

            // Proportions within this bar
            const carbsHeightPct = stackTotal > 0 ? (stat.carbs / stackTotal) * 100 : 0;
            const proteinHeightPct = stackTotal > 0 ? (stat.protein / stackTotal) * 100 : 0;
            const costHeightPct = stackTotal > 0 ? ((stat.cost * 0.5) / stackTotal) * 100 : 0;

            const isSelected = active?.date === stat.date;

            return (
              <div
                key={stat.date}
                className={`flex-1 flex flex-col items-center h-full justify-end group cursor-pointer transition-opacity duration-200 ${barOpacityClass}`}
                onMouseEnter={() => {
                  setHoveredBarDate(stat.date);
                  setActiveDay(stat);
                }}
                onMouseLeave={() => setHoveredBarDate(null)}
                onClick={() => setActiveDay(stat)}
              >
                {/* Total Energy Number on top of bar */}
                <span
                  className={`text-[10px] font-bold mb-1 transition-all ${
                    isSelected
                      ? 'text-slate-900 dark:text-white font-black'
                      : 'text-slate-400 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {stat.calories > 0 ? `${stat.calories}` : ''}
                </span>

                {/* THE SHARP STACKED BAR (Clean sharp rectangular edges, zero rounded pill top, no green border) */}
                <div
                  className="w-full max-w-[42px] rounded-none overflow-hidden flex flex-col justify-end transition-all duration-150"
                  style={{ height: `${barHeightPct}%` }}
                >
                  {stackTotal > 0 ? (
                    <>
                      {/* 1. Bazar Cost (Blue) - Top segment */}
                      {costHeightPct > 0 && (
                        <div
                          onMouseEnter={(e) => {
                            e.stopPropagation();
                            setHoveredNutrient('cost');
                          }}
                          onMouseLeave={() => setHoveredNutrient(null)}
                          className={`w-full bg-blue-500 transition-all duration-150 border-b border-white/20 dark:border-forest-card/40 ${
                            hoveredNutrient && hoveredNutrient !== 'cost'
                              ? 'opacity-20'
                              : 'opacity-100 hover:brightness-110'
                          }`}
                          style={{ height: `${costHeightPct}%` }}
                          title={`Bazar Cost: ৳${stat.cost.toFixed(2)}`}
                        />
                      )}

                      {/* 2. Protein (Red) - Middle segment */}
                      {proteinHeightPct > 0 && (
                        <div
                          onMouseEnter={(e) => {
                            e.stopPropagation();
                            setHoveredNutrient('protein');
                          }}
                          onMouseLeave={() => setHoveredNutrient(null)}
                          className={`w-full bg-red-500 transition-all duration-150 border-b border-white/20 dark:border-forest-card/40 ${
                            hoveredNutrient && hoveredNutrient !== 'protein'
                              ? 'opacity-20'
                              : 'opacity-100 hover:brightness-110'
                          }`}
                          style={{ height: `${proteinHeightPct}%` }}
                          title={`Protein: ${stat.protein}g`}
                        />
                      )}

                      {/* 3. Carbohydrates (Green) - Bottom segment */}
                      {carbsHeightPct > 0 && (
                        <div
                          onMouseEnter={(e) => {
                            e.stopPropagation();
                            setHoveredNutrient('carbs');
                          }}
                          onMouseLeave={() => setHoveredNutrient(null)}
                          className={`w-full bg-emerald-500 transition-all duration-150 ${
                            hoveredNutrient && hoveredNutrient !== 'carbs'
                              ? 'opacity-20'
                              : 'opacity-100 hover:brightness-110'
                          }`}
                          style={{ height: `${carbsHeightPct}%` }}
                          title={`Carbohydrates: ${stat.carbs}g`}
                        />
                      )}
                    </>
                  ) : (
                    <div className="w-full h-1 bg-slate-200 dark:bg-forest-root" />
                  )}
                </div>

                {/* X-Axis Day & Date Label */}
                <div className="mt-2 text-center">
                  <span
                    className={`block text-[11px] font-bold leading-tight ${
                      isSelected
                        ? 'text-slate-900 dark:text-white font-extrabold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {stat.dayLabel}
                  </span>
                  <span className="block text-[9px] text-slate-400 dark:text-slate-500">
                    {stat.dateFormatted}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Active Day Detail Inspector Card with Red / Green / Blue Accent Badges */}
      {active && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-forest-root border border-slate-200/70 dark:border-forest-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-200 dark:bg-forest-card text-slate-700 dark:text-slate-300 font-bold shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold text-slate-900 dark:text-white">
                {active.dayLabel} • {active.dateFormatted}
                <span className="ml-2 font-normal text-slate-500 dark:text-slate-400">
                  ({active.mealCount} {active.mealCount === 1 ? 'meal' : 'meals'} confirmed)
                </span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Total Energy: <span className="font-bold text-amber-600 dark:text-amber-400">{active.calories} kcal</span>
              </p>
            </div>
          </div>

          {/* 3 Primary Pillars: Protein (Red), Carbohydrate (Green), Bazar Cost (Blue) */}
          <div className="grid grid-cols-3 gap-2.5 text-center shrink-0">
            {/* Protein (Red) */}
            <div className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40">
              <span className="block text-[10px] text-red-600 dark:text-red-400 font-bold uppercase tracking-wider">
                Protein
              </span>
              <span className="font-extrabold text-sm text-red-700 dark:text-red-300">
                {active.protein}g
              </span>
            </div>

            {/* Carbohydrate (Green) */}
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
              <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                Carbohydrate
              </span>
              <span className="font-extrabold text-sm text-emerald-700 dark:text-emerald-300">
                {active.carbs}g
              </span>
            </div>

            {/* Bazar Cost (Blue) */}
            <div className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
              <span className="block text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                Bazar Cost
              </span>
              <span className="font-extrabold text-sm text-blue-700 dark:text-blue-300">
                ৳ {active.cost.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
