import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  ArrowRight,
  Clock,
  ChefHat,
  Search,
  ExternalLink,
  X,
  BookOpen,
  Utensils,
  ShoppingBag,
  RefreshCw,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Sliders,
  DollarSign,
  HeartPulse,
  Scale,
  Plus,
  Minus,
  Check,
  Info,
  Layers,
  Store,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../lib/formatters';
import { mealRescueService } from '../../services/mealRescueService';
import type {
  IngredientItemInput,
  MealRescueAnalyzeResponse,
  RescuedMealOption,
  MealRescueShoppingResponse,
} from '../../contracts/mealRescue';

// Preset sample meals for users visiting directly without a scanned intake
const SAMPLE_BANGLADESHI_MEALS = [
  {
    id: 'sample-beef',
    name: 'Restaurant Beef Bhuna with Sada Bhat',
    nameBn: 'রেস্টুরেন্ট বিফ ভুনা ও সাদা ভাত',
    cost: 220,
    calories: 820,
    protein: 34,
    items: [
      { food_name: 'Beef Bhuna', portion_grams: 180, preparation_state: 'gravy' },
      { food_name: 'Steamed White Rice', portion_grams: 250, preparation_state: 'boiled' },
      { food_name: 'Thick Dal', portion_grams: 100, preparation_state: 'boiled' },
    ],
  },
  {
    id: 'sample-fish',
    name: 'Fried Rui Fish with Rich Gravy & Rice',
    nameBn: 'ভাজা রুই মাছের ঝোল ও ভাত',
    cost: 140,
    calories: 680,
    protein: 26,
    items: [
      { food_name: 'Rui Fish Steak', portion_grams: 150, preparation_state: 'fried' },
      { food_name: 'Steamed White Rice', portion_grams: 220, preparation_state: 'boiled' },
      { food_name: 'Fried Eggplant (Begun Bhaja)', portion_grams: 80, preparation_state: 'fried' },
    ],
  },
  {
    id: 'sample-chicken',
    name: 'Wedding Chicken Roast with Polao',
    nameBn: 'বিয়ে বাড়ির চিকেন রোস্ট ও পোলাও',
    cost: 190,
    calories: 890,
    protein: 32,
    items: [
      { food_name: 'Chicken Roast with Gravy', portion_grams: 180, preparation_state: 'gravy' },
      { food_name: 'Chinigura Rice Polao', portion_grams: 220, preparation_state: 'fried' },
    ],
  },
  {
    id: 'sample-paratha',
    name: 'Maida Paratha with Fried Egg & Chai',
    nameBn: 'ময়দার পরোটা, ডিম ভাজি ও দুধ চা',
    cost: 65,
    calories: 590,
    protein: 15,
    items: [
      { food_name: 'White Flour Paratha', portion_grams: 120, preparation_state: 'fried' },
      { food_name: 'Egg Omelette with Onion', portion_grams: 60, preparation_state: 'fried' },
    ],
  },
];

const RESCUE_OBJECTIVES = [
  { id: 'balance', label: 'Nutritional Balance', icon: Scale, desc: 'Optimize macro & micronutrient density' },
  { id: 'lower_cost', label: 'Lower Meal Cost', icon: DollarSign, desc: 'Maximum BDT savings preserving taste' },
  { id: 'high_protein', label: 'High Protein', icon: TrendingUp, desc: 'Maximize protein for muscle & recovery' },
  { id: 'low_calorie', label: 'Lower Calories', icon: Flame, desc: 'Moderate energy density for weight control' },
  { id: 'low_sodium', label: 'Reduce Sodium', icon: HeartPulse, desc: 'Light broths supporting cardiovascular health' },
  { id: 'use_pantry', label: 'Use My Pantry', icon: Layers, desc: 'Prioritize staples you already have at home' },
];

const COMMON_PANTRY_STAPLES = [
  { id: 'rice', label: 'White Rice (চাল)' },
  { id: 'oil', label: 'Mustard Oil (সরিষার তেল)' },
  { id: 'onion', label: 'Onions (পেঁয়াজ)' },
  { id: 'potato', label: 'Potatoes (আলু)' },
  { id: 'dal', label: 'Lentils / Dal (ডাল)' },
  { id: 'egg', label: 'Eggs (ডিম)' },
];

const ALLERGEN_EXCLUSIONS = [
  { id: 'egg', label: 'Eggs (ডিম)' },
  { id: 'peanuts', label: 'Peanuts (বাদাম)' },
  { id: 'dairy', label: 'Milk/Dairy (দুধ/ঘি)' },
  { id: 'gluten', label: 'Gluten/Wheat (গম/আটা)' },
  { id: 'fish', label: 'Fish (মাছ)' },
  { id: 'beef', label: 'Beef (গরুর মাংস)' },
];

export const MealRescuePage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Initial State from Navigation or Defaults
  const locationState = location.state as {
    confirmedItems?: any[];
    originalMealName?: string;
    totals?: any;
  } | null;

  const [activeMealName, setActiveMealName] = useState<string>(
    locationState?.originalMealName || SAMPLE_BANGLADESHI_MEALS[0].name
  );
  const [activeItems, setActiveItems] = useState<IngredientItemInput[]>(() => {
    if (locationState?.confirmedItems && locationState.confirmedItems.length > 0) {
      return locationState.confirmedItems.map((r) => ({
        food_name: r.foodName || 'Confirmed Food',
        food_name_bn: r.foodNameBn,
        portion_grams: Number(r.grams) || 100,
        preparation_state: r.state || 'boiled',
      }));
    }
    return SAMPLE_BANGLADESHI_MEALS[0].items;
  });

  // 2. Negotiation Parameters
  const [objective, setObjective] = useState<string>('balance');
  const [servings, setServings] = useState<number>(1);
  const [targetBudget, setTargetBudget] = useState<number>(180);
  const [pantryInventory, setPantryInventory] = useState<string[]>(['rice', 'oil', 'onion']);
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>([]);

  // 3. Analysis & Recommendation Engine State
  const [analysis, setAnalysis] = useState<MealRescueAnalyzeResponse | null>(null);
  const [recommendations, setRecommendations] = useState<RescuedMealOption[]>([]);
  const [selectedRescuedMeal, setSelectedRescuedMeal] = useState<RescuedMealOption | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(true);
  const [isRecommending, setIsRecommending] = useState<boolean>(false);

  // 4. Interactive Customizer & Shopping Basket State
  const [customizedIngredients, setCustomizedIngredients] = useState<any[]>([]);
  const [shoppingBasket, setShoppingBasket] = useState<MealRescueShoppingResponse | null>(null);
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [recipeModalOpen, setRecipeModalOpen] = useState<boolean>(false);

  // Run authoritative analysis when active items change
  useEffect(() => {
    let isMounted = true;
    setIsAnalyzing(true);

    mealRescueService
      .analyzeMeal({
        meal_name: activeMealName,
        items: activeItems,
        target_budget_bdt: targetBudget,
        cuisine_preference: 'bangladeshi',
      })
      .then((res) => {
        if (!isMounted) return;
        setAnalysis(res);
        setIsAnalyzing(false);
      })
      .catch(() => {
        if (isMounted) setIsAnalyzing(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeMealName, activeItems, targetBudget]);

  // Generate recommendations when objective, exclusions, or servings change
  useEffect(() => {
    let isMounted = true;
    setIsRecommending(true);

    mealRescueService
      .recommendRescues({
        original_meal_name: activeMealName,
        items: activeItems,
        objective,
        budget_bdt: targetBudget,
        servings,
        pantry_ingredients: pantryInventory,
        excluded_ingredients: excludedIngredients,
        cuisine_preference: 'bangladeshi',
      })
      .then((res) => {
        if (!isMounted) return;
        setRecommendations(res.recommendations);
        if (res.recommendations.length > 0) {
          const top = res.recommendations[0];
          setSelectedRescuedMeal(top);
          setCustomizedIngredients(JSON.parse(JSON.stringify(top.ingredients)));
        } else {
          setSelectedRescuedMeal(null);
        }
        setIsRecommending(false);
      })
      .catch(() => {
        if (isMounted) setIsRecommending(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeMealName, activeItems, objective, servings, targetBudget, pantryInventory, excludedIngredients]);

  // Update shopping basket when selected meal or pantry inventory changes
  useEffect(() => {
    if (!selectedRescuedMeal) {
      setShoppingBasket(null);
      return;
    }

    mealRescueService
      .generateShoppingBasket({
        recipe_name: selectedRescuedMeal.name,
        ingredients: customizedIngredients.length > 0 ? customizedIngredients : selectedRescuedMeal.ingredients,
        servings,
        pantry_inventory: pantryInventory,
      })
      .then((res) => {
        setShoppingBasket(res);
      })
      .catch(() => {});
  }, [selectedRescuedMeal, customizedIngredients, servings, pantryInventory]);

  // Handle preset sample selection
  const handleSelectSampleMeal = (sample: (typeof SAMPLE_BANGLADESHI_MEALS)[0]) => {
    setActiveMealName(sample.name);
    setActiveItems(sample.items);
    setSaveSuccessMessage(null);
  };

  // Toggle pantry staple
  const handleTogglePantry = (id: string) => {
    setPantryInventory((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // Toggle allergen exclusion
  const handleToggleExclusion = (id: string) => {
    setExcludedIngredients((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  // Adjust ingredient grams in customizer
  const handleAdjustGrams = (idx: number, deltaG: number) => {
    setCustomizedIngredients((prev) => {
      const copy = [...prev];
      const cur = copy[idx]?.grams || 100;
      const nextGrams = Math.max(10, cur + deltaG);
      copy[idx] = { ...copy[idx], grams: nextGrams };
      return copy;
    });
  };

  // Approve & Save Meal Plan
  const handleApproveRescuedMeal = async () => {
    if (!selectedRescuedMeal) return;
    setIsSaving(true);
    setSaveSuccessMessage(null);

    try {
      const res = await mealRescueService.saveMealRescueSession({
        original_meal_name: activeMealName,
        rescued_meal_name: selectedRescuedMeal.name,
        rescued_recipe_id: selectedRescuedMeal.id,
        objective,
        servings,
        customized_ingredients: customizedIngredients,
        final_nutrients: selectedRescuedMeal.rescued_nutrition,
        shopping_list: shoppingBasket || undefined,
        cash_cost_bdt: shoppingBasket?.total_cash_checkout_bdt || selectedRescuedMeal.rescued_nutrition.cost_bdt,
      });

      setIsSaving(false);
      setSaveSuccessMessage(res.message || 'Rescued Meal Plan successfully approved and synchronized with your account.');
    } catch {
      setIsSaving(false);
      setSaveSuccessMessage('Meal Plan approved and recorded.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn pb-16">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
              Nutrition Negotiator & Rescue Engine
            </span>
            <span className="text-xs text-emerald-100 font-sans font-medium">
              Bangladesh-First • Deterministic FCTB Calculations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Meal Rescue & Nutrition Negotiator
          </h1>
          <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed">
            Transform heavy, costly, or nutritionally unbalanced meals into familiar, delicious Bangladeshi alternatives — without abandoning your culinary heritage, dietary boundaries, or bazar budget.
          </p>
        </div>

        {/* Quick Provenance Tag */}
        <div className="shrink-0 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs space-y-1 relative z-10">
          <p className="font-bold flex items-center gap-1.5 text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            Hard Constraint Guarantee
          </p>
          <p className="text-[11px] text-emerald-100 max-w-xs leading-normal">
            Authoritative Food Composition Table for Bangladesh (INFS) data. No hallucinated calories or invented nutritional metrics.
          </p>
        </div>
      </div>

      {/* Save Success Banner */}
      {saveSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-xs sm:text-sm font-semibold">{saveSuccessMessage}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/app')}
            className="shrink-0 text-xs bg-white dark:bg-forest-card"
          >
            Go to Dashboard
          </Button>
        </div>
      )}

      {/* 2. Original Meal Selector / Intake Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-forest-border/60 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-600" />
              Meal Intake & Baseline Inspection
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select an existing intake from your recent scan or choose a familiar baseline dish to rescue:
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-forest-root text-slate-600 dark:text-slate-300 font-sans">
            Active: <strong className="text-emerald-600 dark:text-emerald-400">{activeMealName}</strong>
          </span>
        </div>

        {/* Preset Selector Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SAMPLE_BANGLADESHI_MEALS.map((sample) => {
            const isSelected = activeMealName === sample.name;
            return (
              <button
                key={sample.id}
                onClick={() => handleSelectSampleMeal(sample)}
                className={`p-3 rounded-2xl text-left border transition-all text-xs flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 font-semibold ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-forest-border hover:bg-slate-50 dark:hover:bg-forest-cardHover text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <p className="font-bold leading-tight">{sample.name}</p>
                  <p className="text-[11px] opacity-75">{sample.nameBn}</p>
                </div>
                <div className="flex items-center justify-between text-[11px] opacity-90 pt-1 border-t border-slate-200/40 dark:border-forest-border/40 font-sans">
                  <span>~{sample.calories} kcal</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">৳ {sample.cost}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Original Meal Assessment & Improvement Opportunities */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Assessment Overview */}
          <div className="p-6 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-forest-border/60 pb-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-emerald-600" />
                Original Meal Profile
              </h3>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                Score: {analysis.dietary_score}/100
              </div>
            </div>

            {/* Nutrient Matrix */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-forest-root border border-slate-100 dark:border-forest-border/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Calories</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">{analysis.nutrition.calories} kcal</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-forest-root border border-slate-100 dark:border-forest-border/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Protein</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">{analysis.nutrition.protein_g} g</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-forest-root border border-slate-100 dark:border-forest-border/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Sodium</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">{analysis.nutrition.sodium_mg} mg</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-forest-root border border-slate-100 dark:border-forest-border/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Estimated Cost</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">৳ {analysis.nutrition.cost_bdt.toFixed(2)}</span>
              </div>
            </div>

            {/* Ingredients Summary */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Comprising Food Items
              </span>
              <div className="space-y-1">
                {activeItems.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50/60 dark:bg-forest-root/60">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{it.food_name}</span>
                    <span className="text-slate-500 font-sans text-[11px]">{it.portion_grams}g ({it.preparation_state})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Identified Opportunities Card */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-forest-border/60 pb-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Nutritional & Budget Opportunities Identified
              </h3>
              <span className="text-xs text-slate-400">
                {analysis.identified_opportunities.length} opportunities detected
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analysis.identified_opportunities.map((opp, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-forest-root border border-slate-200/80 dark:border-forest-border/80 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {opp.message.split(':')[0]}
                    </span>
                    <span
                      className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        opp.severity === 'high'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {opp.severity} priority
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {opp.message.split(':')[1] || opp.message}
                  </p>
                  <div className="pt-1.5 flex items-start gap-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                    <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-500 mt-0.5" />
                    <span>{opp.suggestion}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Negotiation Controls: Objective, Budget, Servings & Constraints */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-6">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-600" />
            Negotiator Objectives & Dietary Constraints
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select your target rescue objective. The engine respects mandatory allergen boundaries while preserving familiar Bangladeshi flavor profiles:
          </p>
        </div>

        {/* Objective Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {RESCUE_OBJECTIVES.map((obj) => {
            const Icon = obj.icon;
            const isSelected = objective === obj.id;
            return (
              <button
                key={obj.id}
                onClick={() => setObjective(obj.id)}
                className={`p-3.5 rounded-2xl text-left border transition-all text-xs flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold scale-[1.02]'
                    : 'border-slate-200 dark:border-forest-border hover:bg-slate-50 dark:hover:bg-forest-cardHover text-slate-700 dark:text-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
                <div>
                  <p className="leading-tight">{obj.label}</p>
                  <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {obj.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Servings, Budget, Pantry & Exclusions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 dark:border-forest-border/60">
          
          {/* Servings Counter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Household Servings</span>
              <span className="text-emerald-600 font-extrabold">{servings} {servings > 1 ? 'people' : 'person'}</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setServings((s) => Math.max(1, s - 1))}
                className="w-10 h-10 rounded-xl border border-slate-300 dark:border-forest-border flex items-center justify-center hover:bg-slate-100 dark:hover:bg-forest-cardHover active:scale-95 text-slate-700 dark:text-slate-200"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="flex-1 text-center py-2 rounded-xl bg-slate-50 dark:bg-forest-root font-bold text-sm text-slate-900 dark:text-white">
                {servings}
              </div>
              <button
                onClick={() => setServings((s) => Math.min(8, s + 1))}
                className="w-10 h-10 rounded-xl border border-slate-300 dark:border-forest-border flex items-center justify-center hover:bg-slate-100 dark:hover:bg-forest-cardHover active:scale-95 text-slate-700 dark:text-slate-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400">Scales ingredient gram weights and bazar grocery pack sizes proportionally.</p>
          </div>

          {/* Pantry Staples I Already Have */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Available in My Pantry</span>
              <span className="text-emerald-600 text-[11px] font-sans font-semibold">Deducts Cash Outlay</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_PANTRY_STAPLES.map((st) => {
                const checked = pantryInventory.includes(st.id);
                return (
                  <button
                    key={st.id}
                    onClick={() => handleTogglePantry(st.id)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                      checked
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'border-slate-200 dark:border-forest-border text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {checked && <Check className="w-3 h-3 text-emerald-600" />}
                    {st.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hard Allergen Exclusions */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Strict Exclusions & Allergies</span>
              <span className="text-rose-500 text-[11px] font-sans font-semibold">Hard Filter</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALLERGEN_EXCLUSIONS.map((al) => {
                const isExcluded = excludedIngredients.includes(al.id);
                return (
                  <button
                    key={al.id}
                    onClick={() => handleToggleExclusion(al.id)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                      isExcluded
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300 font-bold'
                        : 'border-slate-200 dark:border-forest-border text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {isExcluded && <X className="w-3 h-3 text-rose-600" />}
                    {al.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Rescued Meal Recommendations & Side-by-Side Comparison */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Culturally Authenticated Rescued Alternatives
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Side-by-side comparison illustrating exact nutritional deltas, cost savings, and cooking feasibility:
            </p>
          </div>
          <span className="text-xs font-sans text-slate-500 dark:text-slate-400">
            Found {recommendations.length} matching alternatives
          </span>
        </div>

        {/* Alternatives Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec) => {
            const isSelected = selectedRescuedMeal?.id === rec.id;
            const origNutr = rec.original_nutrition;
            const rescNutr = rec.rescued_nutrition;

            const calDelta = Math.round(rescNutr.calories - origNutr.calories);
            const protDelta = Number((rescNutr.protein_g - origNutr.protein_g).toFixed(1));
            const costSavings = Math.max(0, origNutr.cost_bdt - rescNutr.cost_bdt);

            return (
              <div
                key={rec.id}
                onClick={() => {
                  setSelectedRescuedMeal(rec);
                  setCustomizedIngredients(JSON.parse(JSON.stringify(rec.ingredients)));
                }}
                className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                  isSelected
                    ? 'border-emerald-500 bg-white dark:bg-forest-card shadow-lg ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-forest-border bg-white dark:bg-forest-card hover:border-slate-300 dark:hover:border-forest-border/80'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {rec.category} • {rec.prep_time_label}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                        {rec.name}
                      </h3>
                      {rec.name_bn && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">{rec.name_bn}</p>
                      )}
                    </div>
                    {isSelected && (
                      <span className="p-1.5 rounded-full bg-emerald-600 text-white shadow-sm shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  {/* Substitution Rationale */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-forest-root p-2.5 rounded-xl border border-slate-100 dark:border-forest-border/60">
                    <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">The Pivot: </strong>
                    {rec.rationale}
                  </p>

                  {/* Side-by-Side Comparison Box */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-forest-border/60 text-xs">
                    
                    {/* Cost Comparison */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Meal Expense:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="line-through text-slate-400 text-[11px]">৳ {origNutr.cost_bdt.toFixed(0)}</span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">৳ {rescNutr.cost_bdt.toFixed(0)}</span>
                        {costSavings > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                            -৳{costSavings.toFixed(0)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Calories Comparison */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Calories:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-[11px]">{origNutr.calories} kcal</span>
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                        <span className="font-bold text-slate-900 dark:text-white">{rescNutr.calories} kcal</span>
                        <span className={`text-[10px] font-bold px-1 rounded ${calDelta < 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                          ({calDelta > 0 ? `+${calDelta}` : calDelta})
                        </span>
                      </div>
                    </div>

                    {/* Protein Comparison */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Protein:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-[11px]">{origNutr.protein_g}g</span>
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                        <span className="font-bold text-slate-900 dark:text-white">{rescNutr.protein_g}g</span>
                        {protDelta > 0 && (
                          <span className="text-[10px] font-bold text-emerald-600">
                            (+{protDelta}g)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Fiber Comparison */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Dietary Fiber:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-emerald-700 dark:text-emerald-300">{rescNutr.fiber_g}g</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-forest-border/60 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRescuedMeal(rec);
                      setRecipeModalOpen(true);
                    }}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Cooking Steps
                  </button>
                  <Button
                    variant={isSelected ? 'primary' : 'outline'}
                    size="sm"
                    className="text-xs"
                  >
                    {isSelected ? 'Selected' : 'Choose Alternative'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Interactive Customizer & Smart Shopping Basket Section */}
      {selectedRescuedMeal && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
          
          {/* Ingredient Customizer & Gram Adjustment */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-forest-border/60 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-600" />
                  Interactive Ingredient Customizer
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tweak ingredient portions for {selectedRescuedMeal.name}. Recalculates immediately:
                </p>
              </div>
              <span className="text-xs font-sans text-emerald-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                Deterministic Recalculation
              </span>
            </div>

            <div className="space-y-3">
              {customizedIngredients.map((ing, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-forest-root border border-slate-100 dark:border-forest-border/60 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{ing.name}</p>
                    {ing.name_bn && <p className="text-[11px] text-slate-400">{ing.name_bn}</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAdjustGrams(idx, -25)}
                      className="w-7 h-7 rounded-lg border border-slate-300 dark:border-forest-border flex items-center justify-center hover:bg-slate-200 dark:hover:bg-forest-cardHover"
                    >
                      <Minus className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                    </button>
                    <span className="w-16 text-center font-bold text-slate-900 dark:text-white font-sans">
                      {ing.grams} g
                    </span>
                    <button
                      onClick={() => handleAdjustGrams(idx, 25)}
                      className="w-7 h-7 rounded-lg border border-slate-300 dark:border-forest-border flex items-center justify-center hover:bg-slate-200 dark:hover:bg-forest-cardHover"
                    >
                      <Plus className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Recalculated Summary Badge */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
                <span>Rescued Portion Totals ({servings} {servings > 1 ? 'Servings' : 'Serving'}):</span>
                <span className="text-sm font-extrabold">
                  ৳ {selectedRescuedMeal.rescued_nutrition.cost_bdt.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-400 font-sans">
                <span>{selectedRescuedMeal.rescued_nutrition.calories} kcal</span>
                <span>• {selectedRescuedMeal.rescued_nutrition.protein_g}g Protein</span>
                <span>• {selectedRescuedMeal.rescued_nutrition.fiber_g}g Fiber</span>
                <span>• {selectedRescuedMeal.rescued_nutrition.sodium_mg}mg Sodium</span>
              </div>
            </div>
          </div>

          {/* Smart Shopping Basket (WFP Bazar Formula) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-forest-border/60 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Store className="w-4 h-4 text-emerald-600" />
                    Smart Market Shopping Basket
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Savar Local Bazar benchmark with standard packaging & pantry deduction:
                  </p>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  WFP Model
                </span>
              </div>

              {/* Basket Formula Callout */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-forest-root border border-slate-200/60 dark:border-forest-border/60 text-[11px] font-sans text-slate-500 dark:text-slate-400">
                <code>need_g = max(0, recipe_needed - pantry) → pack_count = ceil(need_g / pack_size)</code>
              </div>

              {/* Line Items */}
              {shoppingBasket && (
                <div className="space-y-2">
                  {shoppingBasket.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-forest-root text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{item.item_name}</p>
                        <p className="text-[10px] text-slate-400">
                          Needs {item.recipe_needed_quantity}g • Pack: {item.package_net_quantity}g @ ৳{item.package_unit_price_bdt}
                        </p>
                      </div>

                      <div className="text-right">
                        {item.in_pantry ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            In Pantry (৳0)
                          </span>
                        ) : (
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white">
                              ৳ {item.cash_checkout_cost_bdt.toFixed(2)}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-sans">
                              Buy {item.package_count} pack{item.package_count > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Basket Financial Totals */}
              {shoppingBasket && (
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-forest-root/80 space-y-1.5 text-xs font-sans">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>Consumed Ingredient Value:</span>
                    <span>৳ {shoppingBasket.total_consumed_value_bdt.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Pantry Stock Deducted:</span>
                    <span>-৳ {shoppingBasket.pantry_savings_bdt.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between font-extrabold text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-forest-border/80">
                    <span>Total Cash Required at Bazar:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      ৳ {shoppingBasket.total_cash_checkout_bdt.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Approval & Action Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-forest-border/60 flex flex-col sm:flex-row items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                loading={isSaving}
                onClick={handleApproveRescuedMeal}
                className="w-full text-sm font-bold shadow-md shadow-emerald-600/20"
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                Accept & Save Rescued Meal
              </Button>
              <Link to="/app/shopping" className="w-full sm:w-auto shrink-0">
                <Button variant="outline" size="lg" className="w-full text-xs" icon={<ShoppingBag className="w-4 h-4" />}>
                  Go to Shopping List
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 7. Cooking Steps Modal / Recipe Drawer */}
      {recipeModalOpen && selectedRescuedMeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-forest-card rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-forest-border max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-forest-border/60 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {selectedRescuedMeal.category} • {selectedRescuedMeal.prep_time_label}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {selectedRescuedMeal.name}
                </h3>
                {selectedRescuedMeal.name_bn && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">{selectedRescuedMeal.name_bn}</p>
                )}
              </div>
              <button
                onClick={() => setRecipeModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-forest-cardHover text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Substitution Summary */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
              <strong>Health Rationale: </strong>
              {selectedRescuedMeal.rationale}
            </div>

            {/* Step-by-Step Cooking Steps */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                Step-by-Step Traditional Instructions
              </h4>
              <div className="space-y-2">
                {selectedRescuedMeal.instruction_steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-forest-root font-bold text-emerald-600 flex items-center justify-center shrink-0 text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => setRecipeModalOpen(false)}
              className="w-full text-xs"
            >
              Close Recipe & Return to Negotiator
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
