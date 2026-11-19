import React, { useState } from 'react';
import { BarChart3, Calendar, Flame, Beef, Wheat, Droplet, Salad, Info } from 'lucide-react';
import type { DailyNutrientStat } from '../../services/mealIntakeDb';

interface NutrientStackBarChartProps {
  stats: DailyNutrientStat[];
  targetCalories?: number;
  className?: string;
}

export const NutrientStackBarChart: React.FC<NutrientStackBarChartProps> = ({
  stats,
  targetCalories = 2000,
  className = '',
}) => {
  const [activeDay, setActiveDay] = useState<DailyNutrientStat | null>(null);
  const [timeRange, setTimeRange] = useState<7 | 14>(7);

  const displayedStats = timeRange === 7 ? stats.slice(-7) : stats.slice(-14);

  // Find max total macronutrients or calories across days for scaling
  // We stack macros in grams (Protein + Carbs + Fat + Fibre)
  const maxTotalGrams = Math.max(
    ...displayedStats.map((s) => s.protein + s.carbs + s.fat + s.fibre),
    100 // minimum threshold so bars look balanced
  );

  const active = activeDay || displayedStats[displayedStats.length - 1] || null;

  return (
    <div className={`p-5 sm:p-6 rounded-3xl bg-white dark:bg-forest-card border border-slate-200/80 dark:border-forest-border shadow-sm space-y-5 ${className}`}>
      
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Daily Nutrients Intake</span>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Stacked
                </span>
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Macronutrient breakdown in grams per day across confirmed meals
          </p>
        </div>

        {/* Legend & Time Range Selector */}
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {/* Legend Items */}
          <div className="flex items-center gap-2.5 text-[11px] text-slate-600 dark:text-slate-400 select-none">
            <span className="flex items-center gap-1 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Protein
            </span>
            <span className="flex items-center gap-1 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              Carbs
            </span>
            <span className="flex items-center gap-1 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Fat
            </span>
            <span className="flex items-center gap-1 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              Fibre
            </span>
          </div>

          {/* Range Pills */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-forest-root border border-slate-200 dark:border-forest-border text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setTimeRange(7)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeRange === 7
                  ? 'bg-white dark:bg-forest-card text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeRange(14)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeRange === 14
                  ? 'bg-white dark:bg-forest-card text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              14 Days
            </button>
          </div>
        </div>
      </div>

      {/* Stacked Bars Container */}
      <div className="relative pt-6 pb-2">
        {/* Subtle background grid lines */}
        <div className="absolute inset-x-0 top-6 bottom-8 flex flex-col justify-between pointer-events-none opacity-20 dark:opacity-10">
          <div className="border-b border-dashed border-slate-300 dark:border-slate-500 w-full" />
          <div className="border-b border-dashed border-slate-300 dark:border-slate-500 w-full" />
          <div className="border-b border-dashed border-slate-300 dark:border-slate-500 w-full" />
        </div>

        {/* The Bars */}
        <div className="flex items-end justify-between gap-2 sm:gap-4 h-48 sm:h-52 px-1 sm:px-3">
          {displayedStats.map((stat, idx) => {
            const totalGrams = stat.protein + stat.carbs + stat.fat + stat.fibre;
            const barHeightPct = totalGrams > 0 ? Math.min(100, Math.max(14, (totalGrams / maxTotalGrams) * 100)) : 4;
            const isSelected = active?.date === stat.date;

            // Proportions for the stack
            const proteinPct = totalGrams > 0 ? (stat.protein / totalGrams) * 100 : 0;
            const carbsPct = totalGrams > 0 ? (stat.carbs / totalGrams) * 100 : 0;
            const fatPct = totalGrams > 0 ? (stat.fat / totalGrams) * 100 : 0;
            const fibrePct = totalGrams > 0 ? (stat.fibre / totalGrams) * 100 : 0;

            return (
              <div
                key={stat.date}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                onMouseEnter={() => setActiveDay(stat)}
                onClick={() => setActiveDay(stat)}
              >
                {/* Total Value floating label on top of bar */}
                <span
                  className={`text-[10px] font-bold mb-1 transition-all ${
                    isSelected
                      ? 'text-emerald-600 dark:text-emerald-400 scale-110 font-extrabold'
                      : 'text-slate-400 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {stat.calories > 0 ? `${stat.calories}` : '0'}
                </span>

                {/* The Stacked Bar Pillar */}
                <div
                  className={`w-full max-w-[36px] sm:max-w-[44px] rounded-t-xl overflow-hidden flex flex-col justify-end transition-all duration-300 ${
                    isSelected
                      ? 'ring-2 ring-emerald-500 shadow-md shadow-emerald-500/20'
                      : 'group-hover:opacity-90'
                  }`}
                  style={{ height: `${barHeightPct}%` }}
                >
                  {totalGrams > 0 ? (
                    <>
                      {/* 1. Fibre (Teal) - Top */}
                      {fibrePct > 0 && (
                        <div
                          className="w-full bg-teal-500 transition-all duration-300"
                          style={{ height: `${fibrePct}%` }}
                          title={`Fibre: ${stat.fibre}g`}
                        />
                      )}
                      {/* 2. Fat (Amber) */}
                      {fatPct > 0 && (
                        <div
                          className="w-full bg-amber-500 transition-all duration-300"
                          style={{ height: `${fatPct}%` }}
                          title={`Fat: ${stat.fat}g`}
                        />
                      )}
                      {/* 3. Carbs (Sky) */}
                      {carbsPct > 0 && (
                        <div
                          className="w-full bg-sky-500 transition-all duration-300"
                          style={{ height: `${carbsPct}%` }}
                          title={`Carbohydrates: ${stat.carbs}g`}
                        />
                      )}
                      {/* 4. Protein (Emerald) - Bottom */}
                      {proteinPct > 0 && (
                        <div
                          className="w-full bg-emerald-500 transition-all duration-300"
                          style={{ height: `${proteinPct}%` }}
                          title={`Protein: ${stat.protein}g`}
                        />
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full bg-slate-200 dark:bg-forest-root/60 rounded-t-sm" />
                  )}
                </div>

                {/* X-Axis Day Label */}
                <div className="mt-2 text-center">
                  <span
                    className={`block text-[11px] font-medium leading-none ${
                      isSelected
                        ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {stat.dayLabel}
                  </span>
                  <span className="block text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {stat.dateFormatted}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Day Detail Inspector Card */}
      {active && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 dark:bg-forest-root/80 border border-slate-200/70 dark:border-forest-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                {active.dayLabel} • {active.dateFormatted}
                <span className="ml-2 font-normal text-slate-500 dark:text-slate-400">
                  ({active.mealCount} {active.mealCount === 1 ? 'meal' : 'meals'} logged)
                </span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Total Energy: <span className="font-bold text-amber-600 dark:text-amber-400">{active.calories} kcal</span>
                {active.cost > 0 && <> • Bazar Cost: <span className="font-bold text-emerald-600 dark:text-emerald-400">৳{active.cost.toFixed(2)}</span></>}
              </p>
            </div>
          </div>

          {/* Mini Macro Chips */}
          <div className="grid grid-cols-4 gap-2 text-center shrink-0">
            <div className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-forest-card border border-slate-200/60 dark:border-forest-border shadow-2xs">
              <span className="block text-[10px] text-slate-400 font-medium">Protein</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{active.protein}g</span>
            </div>
            <div className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-forest-card border border-slate-200/60 dark:border-forest-border shadow-2xs">
              <span className="block text-[10px] text-slate-400 font-medium">Carbs</span>
              <span className="font-bold text-sky-600 dark:text-sky-400">{active.carbs}g</span>
            </div>
            <div className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-forest-card border border-slate-200/60 dark:border-forest-border shadow-2xs">
              <span className="block text-[10px] text-slate-400 font-medium">Fat</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{active.fat}g</span>
            </div>
            <div className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-forest-card border border-slate-200/60 dark:border-forest-border shadow-2xs">
              <span className="block text-[10px] text-slate-400 font-medium">Fibre</span>
              <span className="font-bold text-teal-600 dark:text-teal-400">{active.fibre}g</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
