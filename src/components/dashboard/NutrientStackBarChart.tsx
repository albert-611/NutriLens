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

type NutrientType = 'protein' | 'carbs' | 'fat';
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
  // Stacking: Carbs (g) + Protein (g) + Fat (g)
  const maxStackValue = useMemo(() => {
    if (loadedStats.length === 0) return 100;
    const maxVal = Math.max(
      ...loadedStats.map((s) => s.carbs + s.protein + s.fat),
      60
    );
    return maxVal;
  }, [loadedStats]);

  const active = activeDay || (hoveredBarDate ? loadedStats.find((s) => s.date === hoveredBarDate) : null) || loadedStats[loadedStats.length - 1] || null;

  return (
    <div className={`p-3 sm:p-4 rounded-xl bg-white dark:bg-forest-card border border-slate-200/80 dark:border-forest-border shadow-2xs space-y-3 ${className}`}>
      
      {/* 1. Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              Daily Nutrients Intake
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

        {/* Legend & Filter Controls - Shifted to Right Corner */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 sm:gap-3 self-end lg:self-auto lg:ml-auto">
          {/* Interactive Legend: 3 Shades of Green (Theme Color) */}
          <div className="flex items-center gap-2.5 text-xs select-none">
            {/* Protein: Deep Forest Green (#047857 / emerald-700) */}
            <button
              type="button"
              onMouseEnter={() => setHoveredNutrient('protein')}
              onMouseLeave={() => setHoveredNutrient(null)}
              className={`flex items-center gap-1.5 transition-all font-semibold ${
                hoveredNutrient && hoveredNutrient !== 'protein' ? 'opacity-25' : 'opacity-100'
              }`}
              title="Highlight Protein"
            >
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-700 dark:bg-emerald-600 shadow-2xs" />
              <span className="text-slate-700 dark:text-slate-300">Protein</span>
            </button>

            {/* Carbohydrate: Vibrant Emerald Green (#10b981 / emerald-500) */}
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
              <span className="text-slate-700 dark:text-slate-300">Carbohydrate</span>
            </button>

            {/* Fats: Fresh Mint Green (#6ee7b7 / emerald-300) */}
            <button
              type="button"
              onMouseEnter={() => setHoveredNutrient('fat')}
              onMouseLeave={() => setHoveredNutrient(null)}
              className={`flex items-center gap-1.5 transition-all font-semibold ${
                hoveredNutrient && hoveredNutrient !== 'fat' ? 'opacity-25' : 'opacity-100'
              }`}
              title="Highlight Fats"
            >
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-300 dark:bg-emerald-400 shadow-2xs" />
              <span className="text-slate-700 dark:text-slate-300">Fats</span>
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
            const stackTotal = stat.carbs + stat.protein + stat.fat;
            const barHeightPct = stackTotal > 0 ? Math.min(100, Math.max(12, (stackTotal / maxStackValue) * 100)) : 3;

            // When hovering any individual bar, other bars get transparent
            const isThisBarHovered = hoveredBarDate === stat.date;
            const isAnyBarHovered = hoveredBarDate !== null;
            const barOpacityClass = isAnyBarHovered
              ? isThisBarHovered
                ? 'opacity-100'
                : 'opacity-25'
              : 'opacity-100';

            // Proportions of each nutrient (Protein, Carbs, Fats)
            const carbsHeightPct = stackTotal > 0 ? (stat.carbs / stackTotal) * 100 : 0;
            const proteinHeightPct = stackTotal > 0 ? (stat.protein / stackTotal) * 100 : 0;
            const fatHeightPct = stackTotal > 0 ? (stat.fat / stackTotal) * 100 : 0;

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

                {/* THE STACKED BAR: 3 Shades of Green (Theme Color), subtle unsharp top corners (rounded-t-[3.5px]) */}
                <div
                  className="w-full max-w-[42px] rounded-t-[3.5px] overflow-hidden flex flex-col justify-end transition-all duration-150"
                  style={{ height: `${barHeightPct}%` }}
                >
                  {stackTotal > 0 ? (
                    <>
                      {/* 1. Fats: Fresh Mint Green (#6ee7b7 / emerald-300) - Top */}
                      {fatHeightPct > 0 && (
                        <div
                          onMouseEnter={(e) => {
                            e.stopPropagation();
                            setHoveredNutrient('fat');
                          }}
                          onMouseLeave={() => setHoveredNutrient(null)}
                          className={`w-full bg-emerald-300 dark:bg-emerald-400 transition-all duration-150 border-b border-white/20 dark:border-forest-card/30 ${
                            hoveredNutrient && hoveredNutrient !== 'fat'
                              ? 'opacity-20'
                              : 'opacity-100 hover:brightness-110'
                          }`}
                          style={{ height: `${fatHeightPct}%` }}
                          title={`Fats: ${stat.fat}g`}
                        />
                      )}

                      {/* 2. Protein: Deep Forest Green (#047857 / emerald-700) - Middle */}
                      {proteinHeightPct > 0 && (
                        <div
                          onMouseEnter={(e) => {
                            e.stopPropagation();
                            setHoveredNutrient('protein');
                          }}
                          onMouseLeave={() => setHoveredNutrient(null)}
                          className={`w-full bg-emerald-700 dark:bg-emerald-600 transition-all duration-150 border-b border-white/20 dark:border-forest-card/30 ${
                            hoveredNutrient && hoveredNutrient !== 'protein'
                              ? 'opacity-20'
                              : 'opacity-100 hover:brightness-110'
                          }`}
                          style={{ height: `${proteinHeightPct}%` }}
                          title={`Protein: ${stat.protein}g`}
                        />
                      )}

                      {/* 3. Carbohydrates: Vibrant Emerald Green (#10b981 / emerald-500) - Bottom */}
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

      {/* 3. Active Day Detail Inspector: Clean bold black & gray typography (No badges) */}
      {active && (
        <div className="p-2.5 sm:p-3 rounded-lg bg-slate-50 dark:bg-forest-root border border-slate-200/70 dark:border-forest-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs transition-all duration-150">
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

          {/* Clean Nutrients: Gray Label + Bold Black Value (No badge background/borders) */}
          <div className="flex items-center justify-between sm:justify-end gap-5 sm:gap-7 shrink-0 px-1 sm:px-0">
            {/* Protein */}
            <div className="text-center sm:text-right">
              <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Protein
              </span>
              <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {active.protein}g
              </span>
            </div>

            {/* Carbohydrate */}
            <div className="text-center sm:text-right">
              <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Carbs
              </span>
              <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {active.carbs}g
              </span>
            </div>

            {/* Fats */}
            <div className="text-center sm:text-right">
              <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Fats
              </span>
              <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {active.fat}g
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
