import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Scale,
  Clock,
  Layers,
  Check,
  Store,
  ChefHat,
  Filter,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../lib/formatters';

interface FeasiblePivot {
  id: string;
  name: string;
  nameBn: string;
  originalDish: string;
  substitutedIngredient: string;
  replacementIngredient: string;
  savingsBdt: number;
  newMealCost: number;
  proteinRetained: string;
  prepTime: string;
  cuisineMatch: string;
  ingredients: string[];
}

export const MealRescuePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [budget, setBudget] = useState(80);
  const [servings, setServings] = useState(1);
  const [prepTimeLimit, setPrepTimeLimit] = useState(30);
  const [selectedExclusions, setSelectedExclusions] = useState<string[]>([]);

  const pivots: FeasiblePivot[] = [
    {
      id: 'p1',
      name: 'Dim Bhuna with Sada Bhat & Masoor Dal',
      nameBn: 'ডিম ভুনা ও ডাল-ভাত',
      originalDish: 'Beef Bhuna with Rice (৳220)',
      substitutedIngredient: 'Beef (Lean meat 150g)',
      replacementIngredient: 'Two Farm Fresh Eggs (100g) + Masoor Dal (150g)',
      savingsBdt: 145.00,
      newMealCost: 65.00,
      proteinRetained: '26.4g (92% of original)',
      prepTime: '20 mins',
      cuisineMatch: 'Bangladeshi Everyday Classic',
      ingredients: ['White Rice (200g)', 'Eggs (2 pcs)', 'Masoor Dal (150g)', 'Onion & Spices'],
    },
    {
      id: 'p2',
      name: 'Pond Tilapia Patla Jhol + Sada Bhat',
      nameBn: 'তেলাপিয়া মাছের পাতলা ঝোল ও ভাত',
      originalDish: 'Rohu Fish Jhol (৳110)',
      substitutedIngredient: 'Rohu Fish steak (180g)',
      replacementIngredient: 'Fresh Pond Tilapia (180g)',
      savingsBdt: 38.00,
      newMealCost: 72.00,
      proteinRetained: '25.1g (100% of original)',
      prepTime: '25 mins',
      cuisineMatch: 'Light Fish Curry',
      ingredients: ['White Rice (200g)', 'Tilapia Fish (180g)', 'Potato (70g)', 'Turmeric & Cumin'],
    },
    {
      id: 'p3',
      name: 'Chhola Bhuna with Handmade Whole Wheat Roti',
      nameBn: 'ছোলা ভুনা ও আটার রুটি',
      originalDish: 'Chicken Curry with Roti (৳135)',
      substitutedIngredient: 'Chicken Curry (200g)',
      replacementIngredient: 'Boiled Savory Chickpeas (200g)',
      savingsBdt: 75.00,
      newMealCost: 55.00,
      proteinRetained: '21.0g (85% of original)',
      prepTime: '15 mins',
      cuisineMatch: 'High-Fibre Vegetarian',
      ingredients: ['Whole Wheat Roti (2 pcs)', 'Chickpeas (200g)', 'Onion & Mustard Oil'],
    },
  ];

  const toggleExclusion = (ex: string) => {
    setSelectedExclusions((prev) =>
      prev.includes(ex) ? prev.filter((i) => i !== ex) : [...prev, ex]
    );
  };

  const handleSelectPivot = (pivot: FeasiblePivot) => {
    navigate('/app/shopping', {
      state: {
        selectedMealName: pivot.name,
        estimatedCost: pivot.newMealCost * servings,
      },
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      
      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Constraint Solver
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Cuisine-Preserving Substitution
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('meal_rescue.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {t('meal_rescue.subtitle')}
        </p>
      </div>

      {/* Interactive Constraints Controls */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          {/* Budget Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <label className="text-slate-700 dark:text-slate-300">
                {t('meal_rescue.budget_label')}
              </label>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold font-sans tabular-nums">
                {formatCurrency(budget)}
              </span>
            </div>
            <input
              type="range"
              min="40"
              max="200"
              step="5"
              value={budget}
              onChange={(e) => setBudget(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-sans tabular-nums">
              <span>৳40 min</span>
              <span>৳200 max</span>
            </div>
          </div>

          {/* Servings */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('meal_rescue.servings_label')}
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setServings(num)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    servings === num
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-forest-root border-slate-200 dark:border-forest-border/70 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {num} {num === 1 ? 'Person' : 'People'}
                </button>
              ))}
            </div>
          </div>

          {/* Cooking Time */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Max Prep Time
            </label>
            <div className="flex items-center gap-2">
              {[15, 25, 40].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setPrepTimeLimit(mins)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    prepTimeLimit === mins
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-forest-root border-slate-200 dark:border-forest-border/70 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dietary Exclusions Toggle */}
        <div className="pt-4 border-t border-slate-100 dark:border-forest-border/60 space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Exclude Ingredients (Hard Constraint)
          </label>
          <div className="flex flex-wrap gap-2 text-xs">
            {['Beef', 'Shellfish / Prawns', 'Dairy', 'Gluten', 'Excess Oil'].map((ex) => {
              const active = selectedExclusions.includes(ex);
              return (
                <button
                  key={ex}
                  type="button"
                  onClick={() => toggleExclusion(ex)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    active
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                      : 'bg-slate-100 dark:bg-forest-root border-slate-200 dark:border-forest-border/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {active ? `✕ Excluded: ${ex}` : `+ ${ex}`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recommended Pivots */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Ranked Feasible Alternatives ({pivots.length})
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            All prices tagged SIMULATED DEMO DATA
          </span>
        </div>

        <div className="space-y-4">
          {pivots.map((pivot) => (
            <div
              key={pivot.id}
              className="p-6 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm hover:border-emerald-500/50 transition-all duration-200 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {pivot.name}
                    </h3>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Saves {formatCurrency(pivot.savingsBdt * servings)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {pivot.nameBn} • Original: <span className="line-through text-slate-400">{pivot.originalDish}</span>
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(pivot.newMealCost * servings)}
                  </p>
                  <p className="text-[10px] text-slate-400">for {servings} serving(s)</p>
                </div>
              </div>

              {/* Substitution Details Pill */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/60 text-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Swap Made</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{pivot.replacementIngredient}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Protein Retention</span>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">{pivot.proteinRetained}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Cook Time</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{pivot.prepTime}</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <ChefHat className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{pivot.cuisineMatch}</span>
                </div>

                <Button
                  onClick={() => handleSelectPivot(pivot)}
                  variant="primary"
                  size="sm"
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                  iconPosition="right"
                >
                  Generate Shopping List
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
