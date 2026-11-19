import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  ArrowRight,
  Clock,
  ChefHat,
  Search,
  ExternalLink,
  Youtube,
  X,
  BookOpen,
  Utensils,
  ShoppingBag,
  RefreshCw,
  Dices,
  Flame,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../lib/formatters';
import { recipeService, type MealRescueRecipe } from '../../services/recipeService';

export const MealRescuePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Constraints State
  const [budget, setBudget] = useState(180);
  const [servings, setServings] = useState(1);
  const [prepTimeLimit, setPrepTimeLimit] = useState(40);
  const [selectedExclusions, setSelectedExclusions] = useState<string[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Recipes State
  const [recipes, setRecipes] = useState<MealRescueRecipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRandomLoading, setIsRandomLoading] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(16);
  const [activeRecipeModal, setActiveRecipeModal] = useState<MealRescueRecipe | null>(null);

  // Quick rescue suggestion templates with focus on Bangladeshi staples
  const quickPicks = [
    { label: '🇧🇩 All 40 Bangladeshi Recipes', query: 'Bangladeshi' },
    { label: '🥚 ডিম ভুনা ও ডাল-ভাত', query: 'Dim' },
    { label: '🐟 রুই ও তেলাপিয়া মাছের ঝোল', query: 'Mach' },
    { label: '🍲 সবজি ও ভুনা খিচুড়ি', query: 'Khichuri' },
    { label: '🍗 চিকেন ঝাল ফ্রাই ও রেজালা', query: 'Chicken' },
    { label: '🌱 দেশি শাক ভাজি', query: 'Shak' },
    { label: '🥔 স্পেশাল ভর্তা', query: 'Bhortha' },
    { label: '🍝 Mediterranean Pasta', query: 'Pasta' },
  ];

  // Categories supported by TheMealDB
  const mealCategories = [
    { id: 'all', label: 'All Categories' },
    { id: 'Chicken', label: '🍗 Chicken' },
    { id: 'Vegetarian', label: '🥦 Vegetarian' },
    { id: 'Seafood', label: '🐟 Seafood & Fish' },
    { id: 'Pasta', label: '🍝 Pasta & Noodles' },
    { id: 'Breakfast', label: '🍳 Breakfast & Eggs' },
    { id: 'Beef', label: '🥩 Beef & Meat' },
    { id: 'Side', label: '🥗 Salads & Sides' },
  ];

  // Fetch / Generate Meal Rescues
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const results = await recipeService.generateMealRescues({
          budgetBdt: budget,
          servings,
          maxPrepTime: prepTimeLimit,
          cuisineType: selectedCuisine,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          exclusions: selectedExclusions,
          searchQuery: searchQuery || undefined,
        });

        if (!isCancelled) {
          setRecipes(results);
          setIsLoading(false);
          setVisibleCount(12);
        }
      } catch (err) {
        if (!isCancelled) {
          console.warn('Failed to load rescues:', err);
          setIsLoading(false);
        }
      }
    }, 200);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [budget, servings, prepTimeLimit, selectedCuisine, selectedCategory, selectedExclusions, searchQuery]);

  const toggleExclusion = (ex: string) => {
    setSelectedExclusions((prev) =>
      prev.includes(ex) ? prev.filter((i) => i !== ex) : [...prev, ex]
    );
  };

  const handleSelectPivot = (recipe: MealRescueRecipe) => {
    navigate('/app/shopping', {
      state: {
        selectedMealName: recipe.name,
        estimatedCost: recipe.estimatedCostBdt * servings,
        ingredients: recipe.ingredients.map((i) => ({
          name: i.name,
          measure: i.measure,
        })),
      },
    });
  };

  const handleRandomRescue = async () => {
    setIsRandomLoading(true);
    try {
      const randomMeal = await recipeService.getRandomMeal();
      if (randomMeal) {
        setRecipes((prev) => [randomMeal, ...prev.filter((r) => r.id !== randomMeal.id)]);
        setActiveRecipeModal(randomMeal);
      }
    } catch (err) {
      console.warn('Failed to fetch random meal:', err);
    } finally {
      setIsRandomLoading(false);
    }
  };

  const visibleRecipes = recipes.slice(0, visibleCount);

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Title & Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Constraint Solver
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Powered by TheMealDB Culinary API
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-forest-card text-slate-500 dark:text-slate-400 font-mono">
            WFP 2026 Price Grounding
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('meal_rescue.title')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t('meal_rescue.subtitle')}
            </p>
          </div>

          {/* Random Meal Generator Button */}
          <button
            type="button"
            onClick={handleRandomRescue}
            disabled={isRandomLoading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all shrink-0 active:scale-95 disabled:opacity-70"
          >
            {isRandomLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Dices className="w-4 h-4" />
            )}
            <span>Surprise Rescue / Random Meal</span>
          </button>
        </div>
      </div>

      {/* Search & Quick Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any dish or ingredient to rescue (e.g. Chicken, Biryani, Pasta, Egg, Lentil, Fish, Soup, Salad)..."
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Pick Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold shrink-0">Quick Rescue:</span>
          {quickPicks.map((pick) => (
            <button
              key={pick.label}
              type="button"
              onClick={() => setSearchQuery(pick.query === searchQuery ? '' : pick.query)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-all text-xs font-medium ${
                searchQuery === pick.query
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              {pick.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Horizontal Pills */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Recipe Category
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {mealCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
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
              <span className="text-emerald-600 dark:text-emerald-400 font-bold font-sans tabular-nums text-sm">
                {formatCurrency(budget)}
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="400"
              step="10"
              value={budget}
              onChange={(e) => setBudget(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-sans tabular-nums">
              <span>৳50 min</span>
              <span>৳400 max</span>
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
                      : 'bg-slate-50 dark:bg-forest-root border-slate-200 dark:border-forest-border/70 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
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
              {[20, 35, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setPrepTimeLimit(mins)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    prepTimeLimit === mins
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-forest-root border-slate-200 dark:border-forest-border/70 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
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
            {['Beef', 'Shellfish / Prawns', 'Dairy', 'Gluten'].map((ex) => {
              const active = selectedExclusions.includes(ex);
              return (
                <button
                  key={ex}
                  type="button"
                  onClick={() => toggleExclusion(ex)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    active
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                      : 'bg-slate-50 dark:bg-forest-root border-slate-200 dark:border-forest-border/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {active ? `✕ Excluded: ${ex}` : `+ ${ex}`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cuisine Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Cuisines' },
          { id: 'bangladeshi', label: '🇧🇩 Bangladeshi & South Asian' },
          { id: 'mediterranean', label: '🥗 Mediterranean / Italian' },
          { id: 'western', label: '🍔 Western / International' },
          { id: 'asian', label: '🍱 Asian & Oriental' },
        ].map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedCuisine(c.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCuisine === c.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Results Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>
              Generated Meal Rescues ({recipes.length} available)
            </span>
          </h2>
          {isLoading ? (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Generating from TheMealDB...
            </span>
          ) : (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing {Math.min(visibleCount, recipes.length)} of {recipes.length} recipes
            </span>
          )}
        </div>

        {/* Recipes Grid */}
        {recipes.length === 0 && !isLoading ? (
          <div className="p-8 text-center bg-white dark:bg-forest-card rounded-3xl border border-slate-200 dark:border-forest-border space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-forest-root text-slate-400 mx-auto flex items-center justify-center">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200">No Meals Matched These Constraints</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Try increasing your maximum meal budget slider or clearing specific ingredient exclusions.
            </p>
            <Button
              onClick={() => {
                setBudget(220);
                setSelectedExclusions([]);
                setSelectedCuisine('all');
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              variant="outline"
              size="sm"
            >
              Reset Constraints
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {visibleRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm hover:border-emerald-500/50 transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    {/* Recipe Image & Title */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 border border-slate-200 dark:border-forest-border bg-slate-100 dark:bg-forest-root shadow-xs">
                        <img
                          src={recipe.thumbnail}
                          alt={recipe.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1" title={recipe.name}>
                            {recipe.name}
                          </h3>
                        </div>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block">
                          Saves {formatCurrency(recipe.savingsBdt * servings)}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          Swap for: <span className="line-through text-slate-400">{recipe.originalDishName}</span>
                        </p>
                      </div>
                    </div>

                    {/* Price Tag */}
                    <div className="text-right shrink-0">
                      <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 font-sans tabular-nums">
                        {formatCurrency(recipe.estimatedCostBdt * servings)}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {servings > 1 ? `(${servings} people)` : '1 serving'}
                      </p>
                    </div>
                  </div>

                  {/* Substitution Details Pill */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/60 text-xs grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Protein Retention
                      </span>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 text-xs">
                        {recipe.proteinRetained}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Cooking Time
                      </span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1 text-xs">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {recipe.prepTimeLabel}
                      </p>
                    </div>
                  </div>

                  {/* Ingredients Preview */}
                  <div className="flex flex-wrap gap-1">
                    {recipe.ingredients.slice(0, 4).map((ing, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-forest-root text-slate-600 dark:text-slate-300 text-[10px]"
                      >
                        {ing.name}
                      </span>
                    ))}
                    {recipe.ingredients.length > 4 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{recipe.ingredients.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-forest-border/50">
                  <button
                    type="button"
                    onClick={() => setActiveRecipeModal(recipe)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                    <span>View Recipe</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {recipe.youtubeUrl && (
                      <a
                        href={recipe.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition border border-transparent hover:border-rose-200 dark:hover:border-rose-900"
                        title="Watch Cooking Video on YouTube"
                      >
                        <Youtube className="w-4 h-4" />
                      </a>
                    )}
                    <Button
                      onClick={() => handleSelectPivot(recipe)}
                      variant="primary"
                      size="sm"
                      icon={<ShoppingBag className="w-3.5 h-3.5" />}
                    >
                      Shop
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Recipes Button */}
        {recipes.length > visibleCount && (
          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 12)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border text-slate-700 dark:text-slate-200 hover:border-emerald-500 font-bold text-xs shadow-sm hover:shadow transition-all"
            >
              <span>Load More Recipes ({recipes.length - visibleCount} more available)</span>
              <ArrowRight className="w-4 h-4 text-emerald-500" />
            </button>
          </div>
        )}
      </div>

      {/* TheMealDB Attribution Footer as specified in SKILL.md */}
      <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-forest-card/50 border border-slate-200 dark:border-forest-border text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <p>
          Recipe data, instructions, and imagery sourced from{' '}
          <a
            href="https://www.themealdb.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline inline-flex items-center gap-0.5"
          >
            TheMealDB <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        </p>
        <p className="text-[11px] text-slate-400">
          Costs calculated using WFP 2026 Bangladesh Division Market Monitor. Check allergen labels and cross-contamination risks before preparing.
        </p>
      </div>

      {/* Recipe Details Interactive Modal */}
      {activeRecipeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scaleIn">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-forest-border flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={activeRecipeModal.thumbnail}
                  alt={activeRecipeModal.name}
                  className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-200 dark:border-forest-border shadow-xs"
                />
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                    {activeRecipeModal.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activeRecipeModal.area} • {activeRecipeModal.category} • Cost:{' '}
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(activeRecipeModal.estimatedCostBdt * servings)}
                    </span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveRecipeModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-forest-root transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              {/* Ingredients Section */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-emerald-500" />
                  Ingredients Required ({activeRecipeModal.ingredients.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeRecipeModal.ingredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/60 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {ing.name}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        {ing.measure || 'To taste'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Cooking Instructions */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-emerald-500" />
                  Preparation & Cooking Steps
                </h4>
                <div className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeRecipeModal.instructionSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-forest-root/70 border border-slate-100 dark:border-forest-border/40 flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs shrink-0 flex items-center justify-center mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="flex-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-forest-border flex items-center justify-between gap-3 bg-slate-50 dark:bg-forest-root/40">
              {activeRecipeModal.youtubeUrl ? (
                <a
                  href={activeRecipeModal.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline"
                >
                  <Youtube className="w-4 h-4" />
                  Watch Video Tutorial
                </a>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setActiveRecipeModal(null)}
                  variant="outline"
                  size="sm"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    const r = activeRecipeModal;
                    setActiveRecipeModal(null);
                    handleSelectPivot(r);
                  }}
                  variant="primary"
                  size="sm"
                  icon={<ShoppingBag className="w-3.5 h-3.5" />}
                >
                  Generate Shopping List
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
