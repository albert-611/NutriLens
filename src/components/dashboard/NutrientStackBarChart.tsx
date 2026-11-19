import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, Calendar, Flame, Beef, Wheat, Droplet, Store, ChevronDown } from 'lucide-react';
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

type NutrientType = 'protein' | 'carbs' | 'fat' | 'cost';
type RangeOption = '7' | '14' | '30' | 'month';

export const NutrientStackBarChart: React.FC<NutrientStackBarChartProps> = ({
  stats: propStats,
  userId = 'guest',
  targetCalories = 2000,
  className = '',
}) => {
  const [selectedRange, setSelectedRange] = useState<RangeOption>('7');
  
  // Specific Month state
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

  // Compute maximum stack value across visible days
  // Stacking: Carbs (g) + Protein (g) + Fat (g) + Bazar Cost (scaled)
  const maxStackValue = useMemo(() => {
    if (loadedStats.length === 0) return 100;
    const maxVal = Math.max(
      ...loadedStats.map((s) => s.carbs + s.protein + s.fat + (s.cost * 0.4)),
      80
    );
    return maxVal;
  }, [loadedStats]);

  const active = activeDay || (hoveredBarDate ? loadedStats.find((s) => s.date === hoveredBarDate) : null) || loadedStats[loadedStats.length - 1] || null;

  return (
    <div className={`p-4 sm:p-5 rounded-xl bg-white dark:bg-forest-card border border-slate-200/80 dark:border-forest-border shadow-xs space-y-4 ${className}`}>
      
      {/* 1. Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-7.5 h-7.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
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
          {/* Interactive Legend: protein -> orange, carbohydrate -> green, fats -> red, cost -> blue */}
          <div className="flex items-center gap-2.5 text-xs select-none">
            {/* Protein: Orange */}
            <button
              type="button"
              onMouseEnter={() => setHoveredNutrient('protein')}
              onMouseLeave={() => setHoveredNutrient(null)}
              className={`flex items-center gap-1.5 transition-all font-semibold ${
                hoveredNutrient && hoveredNutrient !== 'protein' ? 'opacity-25' : 'opacity-100'
              }`}
              title="Highlight Protein"
            >
              <span className="w-2.5 h-2.5 rounded-xs bg-orange-500 shadow-2xs" />
              <span className="text-orange-700 dark:text-orange-400">Protein</span>
            </button>

            {/* Carbohydrate: Green */}
            <button
              type="button"
              onMouseEnter={() => setHoveredNutrient('carbs')}
              onMouseLeave={() => setHoveredNutrient(null)}
              className={`flex items-center gap-1.5 transition-all font-semibold ${
                hoveredNutrient && hoveredNutrient !== 'carbs' ? 'opacity-25' : 'opacity-100'
              }`}
              title="Highlight Carbohydrate"
            >
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 shadow-2xs" />
              <span className="text-emerald-700 dark:text-emerald-400">Carbohydrate</span>
            </button>

            {/* Fats: Red */}
            <button
              type="button"
              onMouseEnter={() => setHoveredNutrient('fat')}
              onMouseLeave={() => setHoveredNutrient(null)}
              className={`flex items-center gap-1.5 transition-all font-semibold ${
                hoveredNutrient && hoveredNutrient !== 'fat' ? 'opacity-25' : 'opacity-100'
              }`}
              title="Highlight Fats"
            >
              <span className="w-2.5 h-2.5 rounded-xs bg-red-500 shadow-2xs" />
              <span className="text-red-700 dark:text-red-400">Fats</span>
            </button>

            {/* Cost: Blue */}
            <button
              type="button"
              onMouseEnter={() => setHoveredNutrient('cost')}
              onMouseLeave={() => setHoveredNutrient(null)}
              className={`flex items-center gap-1.5 transition-all font-semibold ${
                hoveredNutrient && hoveredNutrient !== 'cost' ? 'opacity-25' : 'opacity-100'
              }`}
              title="Highlight Bazar Cost"
            >
              <span className="w-2.5 h-2.5 rounded-xs bg-blue-500 shadow-2xs" />
              <span className="text-blue-700 dark:text-blue-400">Bazar Cost</span>
            </button>
          </div>

          {/* Time Range Selector: 7d (Sun-Sat), 14d, 30d, Month */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-forest-root border border-slate-200 dark:border-forest-border text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSelectedRange('7')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                selectedRange === '7'
                  ? 'bg-white dark:bg-forest-card text-emerald-600 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              7 Days (Sun-Sat)
            </button>
            <button
              type="button"
              onClick={() => setSelectedRange('14')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                selectedRange === '14'
                  ? 'bg-white dark:bg-forest-card text-emerald-600 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              14 Days
            </button>
            <button
              type="button"
              onClick={() => setSelectedRange('30')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                selectedRange === '30'
                  ? 'bg-white dark:bg-forest-card text-emerald-600 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              30 Days
            </button>
            <button
              type="button"
              onClick={() => setSelectedRange('month')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                selectedRange === 'month'
                  ? 'bg-white dark:bg-forest-card text-emerald-600 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Month
            </button>
          </div>

          {/* Month Dropdown */}
          {selectedRange === 'month' && (
            <div className="relative">
              <select
                value={`${selectedYear}-${selectedMonth}`}
                onChange={(e) => {
                  const [y, m] = e.target.value.split('-').map(Number);
                  setSelectedYear(y);
                  setSelectedMonth(m);
                }}
                className="appearance-none pl-2.5 pr-7 py-1 rounded-lg border border-slate-200 dark:border-forest-border bg-white dark:bg-forest-card text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {monthOptions.map((opt) => (
                  <option key={`${opt.year}-${opt.month}`} value={`${opt.year}-${opt.month}`}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}
        </div>
      </div>

      {/* 2. Stacked Bars Canvas (Subtle 3px unsharp corner radius, no green border) */}
      <div className="relative pt-5 pb-1">
        {/* Subtle grid lines */}
        <div className="absolute inset-x-0 top-5 bottom-7 flex flex-col justify-between pointer-events-none opacity-20 dark:opacity-10">
          <div className="border-b border-dashed border-slate-400 w-full" />
          <div className="border-b border-dashed border-slate-400 w-full" />
          <div className="border-b border-dashed border-slate-400 w-full" />
        </div>

        {/* Bars Container */}
        <div className="flex items-end justify-between gap-1.5 sm:gap-2 h-44 sm:h-48 px-1 overflow-x-auto select-none">
          {loadedStats.map((stat) => {
            const stackTotal = stat.carbs + stat.protein + stat.fat + (stat.cost * 0.4);
            const barHeightPct = stackTotal > 0 ? Math.min(100, Math.max(12, (stackTotal / maxStackValue) * 100)) : 3;

            // When hovering any individual bar, other bars get transparent
            const isThisBarHovered = hoveredBarDate === stat.date;
            const isAnyBarHovered = hoveredBarDate !== null;
            const barOpacityClass = isAnyBarHovered
              ? isThisBarHovered
                ? 'opacity-100'
                : 'opacity-25'
              : 'opacity-100';

            // Proportions of each nutrient
            const carbsHeightPct = stackTotal > 0 ? (stat.carbs / stackTotal) * 100 : 0;
            const proteinHeightPct = stackTotal > 0 ? (stat.protein / stackTotal) * 100 : 0;
            const fatHeightPct = stackTotal > 0 ? (stat.fat / stackTotal) * 100 : 0;
            const costHeightPct = stackTotal > 0 ? ((stat.cost * 0.4) / stackTotal) * 100 : 0;

            const isSelected = active?.date === stat.date;

            return (
              <div
                key={stat.date}
                className={`flex-1 flex flex-col items-center h-full justify-end group cursor-pointer transition-opacity duration-150 ${barOpacityClass}`}
                onMouseEnter={() => {
                  setHoveredBarDate(stat.date);
                  setActiveDay(stat);
                }}
                onMouseLeave={() => setHoveredBarDate(null)}
                onClick={() => setActiveDay(stat)}
              >
                {/* Total Energy Number */}
                <span
                  className={`text-[10px] font-bold mb-1 transition-all ${
                    isSelected
                      ? 'text-slate-900 dark:text-white font-black'
                      : 'text-slate-400 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {stat.calories > 0 ? `${stat.calories}` : ''}
                </span>

                {/* THE STACKED BAR: Subtle unsharp top radius (rounded-t-[3.5px]), crisp edges, no green border */}
                <div
                  className="w-full max-w-[42px] rounded-t-[3.5px] overflow-hidden flex flex-col justify-end transition-all duration-150"
                  style={{ height: `${barHeightPct}%` }}
                >
                  {stackTotal > 0 ? (
                    <>
                      {/* 1. Bazar Cost (Blue) - Top */}
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

                      {/* 2. Fats (Red) */}
                      {fatHeightPct > 0 && (
                        <div
                          onMouseEnter={(e) => {
                            e.stopPropagation();
                            setHoveredNutrient('fat');
                          }}
                          onMouseLeave={() => setHoveredNutrient(null)}
                          className={`w-full bg-red-500 transition-all duration-150 border-b border-white/20 dark:border-forest-card/40 ${
                            hoveredNutrient && hoveredNutrient !== 'fat'
                              ? 'opacity-20'
                              : 'opacity-100 hover:brightness-110'
                          }`}
                          style={{ height: `${fatHeightPct}%` }}
                          title={`Fats: ${stat.fat}g`}
                        />
                      )}

                      {/* 3. Protein (Orange) */}
                      {proteinHeightPct > 0 && (
                        <div
                          onMouseEnter={(e) => {
                            e.stopPropagation();
                            setHoveredNutrient('protein');
                          }}
                          onMouseLeave={() => setHoveredNutrient(null)}
                          className={`w-full bg-orange-500 transition-all duration-150 border-b border-white/20 dark:border-forest-card/40 ${
                            hoveredNutrient && hoveredNutrient !== 'protein'
                              ? 'opacity-20'
                              : 'opacity-100 hover:brightness-110'
                          }`}
                          style={{ height: `${proteinHeightPct}%` }}
                          title={`Protein: ${stat.protein}g`}
                        />
                      )}

                      {/* 4. Carbohydrates (Green) - Bottom */}
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

                {/* X-Axis Day & Date */}
                <div className="mt-1.5 text-center">
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

      {/* 3. Active Day Detail Inspector: Protein -> Orange, Carbs -> Green, Fats -> Red, Cost -> Blue */}
      {active && (
        <div className="p-3 sm:p-3.5 rounded-lg bg-slate-50 dark:bg-forest-root border border-slate-200/70 dark:border-forest-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs transition-all duration-150">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-slate-200 dark:bg-forest-card text-slate-700 dark:text-slate-300 font-bold shrink-0">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-extrabold text-slate-900 dark:text-white text-xs">
                {active.dayLabel} • {active.dateFormatted}
                <span className="ml-1.5 font-normal text-slate-500 dark:text-slate-400">
                  ({active.mealCount} {active.mealCount === 1 ? 'meal' : 'meals'})
                </span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Total Energy: <span className="font-bold text-slate-900 dark:text-white">{active.calories} kcal</span>
              </p>
            </div>
          </div>

          {/* 4 Pillars: Protein (Orange), Carbohydrates (Green), Fats (Red), Bazar Cost (Blue) */}
          <div className="grid grid-cols-4 gap-2 text-center shrink-0">
            {/* Protein: Orange */}
            <div className="px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/40">
              <span className="block text-[9px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider">
                Protein
              </span>
              <span className="font-extrabold text-xs text-orange-700 dark:text-orange-300">
                {active.protein}g
              </span>
            </div>

            {/* Carbohydrates: Green */}
            <div className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
              <span className="block text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                Carbs
              </span>
              <span className="font-extrabold text-xs text-emerald-700 dark:text-emerald-300">
                {active.carbs}g
              </span>
            </div>

            {/* Fats: Red */}
            <div className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40">
              <span className="block text-[9px] text-red-600 dark:text-red-400 font-bold uppercase tracking-wider">
                Fats
              </span>
              <span className="font-extrabold text-xs text-red-700 dark:text-red-300">
                {active.fat}g
              </span>
            </div>

            {/* Bazar Cost: Blue */}
            <div className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
              <span className="block text-[9px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                Cost
              </span>
              <span className="font-extrabold text-xs text-blue-700 dark:text-blue-300">
                ৳{active.cost.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
