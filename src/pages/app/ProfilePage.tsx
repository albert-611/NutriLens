import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';
import {
  User,
  Target,
  Utensils,
  AlertTriangle,
  Wallet,
  CheckCircle2,
  Save,
  ShieldCheck,
  Languages,
  DollarSign,
  Users,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const {
    user,
    profile,
    nutritionPreferences,
    foodRestrictions,
    budgetPreferences,
    updateProfile,
    isDemoUser,
    refreshUserData,
  } = useAuth();
  const { locale, setLocale } = useLocale();

  // Tab navigation for clean organization
  const [activeTab, setActiveTab] = useState<'personal' | 'nutrition' | 'restrictions' | 'budget'>('personal');

  // Personal Info Form State
  const [fullName, setFullName] = useState(profile?.full_name || profile?.display_name || '');
  const [age, setAge] = useState<number>(profile?.age || 25);
  const [country, setCountry] = useState(profile?.country || 'Bangladesh');
  const [city, setCity] = useState(profile?.city || 'Dhaka');
  const [prefLang, setPrefLang] = useState(profile?.preferred_language || 'bn');

  // Nutrition Preferences State
  const [primaryGoal, setPrimaryGoal] = useState(nutritionPreferences?.primary_goal || profile?.general_goal || 'balanced_wellness');
  const [dietaryPattern, setDietaryPattern] = useState(nutritionPreferences?.dietary_pattern || 'no_preference');
  const [preferredCuisine, setPreferredCuisine] = useState(nutritionPreferences?.preferred_cuisine || 'bangladeshi');
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>(
    nutritionPreferences?.favorite_food_categories || ['grains_and_cereals', 'pulses_and_legumes', 'fish_and_seafood']
  );

  // Food Restrictions State
  const [allergies, setAllergies] = useState<string[]>(
    foodRestrictions.filter((r) => r.restriction_type === 'allergy').map((r) => r.restriction_value) ||
    profile?.declared_allergens || []
  );
  const [intolerances, setIntolerances] = useState<string[]>(
    foodRestrictions.filter((r) => r.restriction_type === 'intolerance').map((r) => r.restriction_value) || []
  );
  const [exclusions, setExclusions] = useState<string[]>(
    foodRestrictions.filter((r) => r.restriction_type === 'religious_exclusion' || r.restriction_type === 'ingredient_avoidance').map((r) => r.restriction_value) ||
    profile?.dietary_exclusions || []
  );

  // Budget Preferences State
  const [budgetAmount, setBudgetAmount] = useState(budgetPreferences?.budget_amount || profile?.budget_amount || 150);
  const [budgetPeriod, setBudgetPeriod] = useState(budgetPreferences?.budget_period || 'daily');
  const [peopleCount, setPeopleCount] = useState(budgetPreferences?.people_count || profile?.household_size || 1);
  const [marketId, setMarketId] = useState(budgetPreferences?.market_id || profile?.market_id || '22222222-2222-2222-2222-222222222201');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || profile.display_name || '');
      setAge(profile.age || 25);
      setCountry(profile.country || 'Bangladesh');
      setCity(profile.city || 'Dhaka');
      setPrefLang(profile.preferred_language || 'bn');
      setBudgetAmount(profile.budget_amount || 150);
      setPeopleCount(profile.household_size || 1);
      if (profile.market_id) setMarketId(profile.market_id);
    }
    if (nutritionPreferences) {
      setPrimaryGoal(nutritionPreferences.primary_goal);
      setDietaryPattern(nutritionPreferences.dietary_pattern);
      setPreferredCuisine(nutritionPreferences.preferred_cuisine);
      setFavoriteCategories(nutritionPreferences.favorite_food_categories || []);
    }
  }, [profile, nutritionPreferences]);

  const toggleCategory = (cat: string) => {
    setFavoriteCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleAllergy = (all: string) => {
    setAllergies((prev) =>
      prev.includes(all) ? prev.filter((a) => a !== all) : [...prev, all]
    );
  };

  const toggleExclusion = (exc: string) => {
    setExclusions((prev) =>
      prev.includes(exc) ? prev.filter((e) => e !== exc) : [...prev, exc]
    );
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      const { error } = await updateProfile({
        full_name: fullName,
        display_name: fullName,
        age,
        country,
        city,
        preferred_language: prefLang,
        language: prefLang,
        general_goal: primaryGoal as any,
        budget_amount: budgetAmount,
        household_size: peopleCount,
        market_id: marketId,
        declared_allergens: allergies,
        dietary_exclusions: exclusions,
      });

      setSaving(false);

      if (error) {
        setErrorMessage(error.message || 'Failed to update profile.');
      } else {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        await refreshUserData();
      }
    } catch (err: any) {
      setSaving(false);
      setErrorMessage(err?.message || 'An error occurred while saving.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Personalization
          </span>
          {isDemoUser && (
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
              Active Persona: {profile?.display_name}
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          User Profile & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Manage your personal details, dietary goals, food restrictions, and local bazar budget.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Profile and preferences updated successfully!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2.5 animate-shake">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-forest-border pb-2 overflow-x-auto">
        {[
          { id: 'personal', label: 'Personal Information', icon: User },
          { id: 'nutrition', label: 'Nutrition Preferences', icon: Target },
          { id: 'restrictions', label: 'Food Restrictions', icon: AlertTriangle },
          { id: 'budget', label: 'Budget & Market', icon: Wallet },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-forest-card'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Container */}
      <form onSubmit={handleSaveAll} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-6">
        {/* TAB 1: Personal Information */}
        {activeTab === 'personal' && (
          <div className="space-y-5 animate-fadeIn">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-forest-border/60">
              <User className="w-4 h-4 text-emerald-500" />
              Personal Identity
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Registered Email Address
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.email || 'user@example.com'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-forest-border bg-slate-100 dark:bg-forest-root text-xs text-slate-400 cursor-not-allowed font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Age (Adult)
                </label>
                <input
                  type="number"
                  min="18"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 18)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Preferred Language
                </label>
                <select
                  value={prefLang}
                  onChange={(e) => {
                    const l = e.target.value;
                    setPrefLang(l);
                    setLocale(l as any);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="bn">বাংলা (Bengali)</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  disabled
                  value={country}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-forest-border bg-slate-100 dark:bg-forest-root text-xs text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  City / Region
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Dhaka">Dhaka (Metro)</option>
                  <option value="Savar">Savar (Pilot Area)</option>
                  <option value="Ashulia">Ashulia (Pilot Area)</option>
                  <option value="Chittagong">Chittagong</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Khulna">Khulna</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Nutrition Preferences */}
        {activeTab === 'nutrition' && (
          <div className="space-y-5 animate-fadeIn">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-forest-border/60">
              <Target className="w-4 h-4 text-emerald-500" />
              Nutrition Goals & Dietary Pattern
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Primary Nutrition Goal
                </label>
                <select
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="balanced_wellness">Maintain a balanced diet</option>
                  <option value="improve_overall_nutrition">Improve overall nutrition</option>
                  <option value="increase_protein">Increase protein intake</option>
                  <option value="improve_dietary_variety">Improve dietary variety</option>
                  <option value="manage_food_expenses">Manage food expenses</option>
                  <option value="build_healthier_habits">Build healthier eating habits</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Dietary Pattern
                </label>
                <select
                  value={dietaryPattern}
                  onChange={(e) => setDietaryPattern(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="no_preference">No specific preference</option>
                  <option value="halal">Halal only</option>
                  <option value="pescatarian">Pescatarian (Fish & Veg)</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Favorite Food Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'grains_and_cereals', label: 'Grains & Rice' },
                  { id: 'pulses_and_legumes', label: 'Dal & Pulses' },
                  { id: 'fish_and_seafood', label: 'Fish & Seafood' },
                  { id: 'eggs', label: 'Eggs' },
                  { id: 'meat_and_poultry', label: 'Chicken & Meat' },
                  { id: 'vegetables', label: 'Leafy Greens & Shak' },
                  { id: 'dairy_and_milks', label: 'Milk & Yogurt' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                      favoriteCategories.includes(cat.id)
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'bg-slate-50 dark:bg-forest-root border-slate-200 dark:border-forest-border text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Food Restrictions */}
        {activeTab === 'restrictions' && (
          <div className="space-y-5 animate-fadeIn">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-forest-border/60">
              <AlertTriangle className="w-4 h-4 text-emerald-500" />
              Allergies & Exclusions
            </h2>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Declared Allergens & Intolerances
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Peanuts',
                  'Tree Nuts',
                  'Dairy / Lactose',
                  'Shrimp & Prawns',
                  'Hilsa / Fish',
                  'Egg Whites',
                  'Soy',
                  'Wheat / Gluten',
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAllergy(item)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                      allergies.includes(item)
                        ? 'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 font-bold'
                        : 'bg-slate-50 dark:bg-forest-root border-slate-200 dark:border-forest-border text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Ingredient Exclusions & Personal Avoidances
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Beef',
                  'Pork',
                  'Excess Chili',
                  'Mustard Oil',
                  'Bitter Gourd (Karela)',
                  'Added Sugar',
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleExclusion(item)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                      exclusions.includes(item)
                        ? 'bg-amber-500/15 border-amber-500 text-amber-800 dark:text-amber-300 font-bold'
                        : 'bg-slate-50 dark:bg-forest-root border-slate-200 dark:border-forest-border text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Budget & Market */}
        {activeTab === 'budget' && (
          <div className="space-y-5 animate-fadeIn">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-forest-border/60">
              <Wallet className="w-4 h-4 text-emerald-500" />
              Budget & Local Market Context
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Bazar / Market
                </label>
                <select
                  value={marketId}
                  onChange={(e) => setMarketId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="22222222-2222-2222-2222-222222222201">
                    Savar Demo Market (Dhaka Division)
                  </option>
                  <option value="22222222-2222-2222-2222-222222222202">
                    Ashulia Demo Market (Dhaka Division)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Household Size (People)
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Budget Target (BDT)
                </label>
                <input
                  type="number"
                  min="50"
                  step="10"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Budget Period
                </label>
                <select
                  value={budgetPeriod}
                  onChange={(e) => setBudgetPeriod(e.target.value as 'daily' | 'weekly')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="daily">Daily Target (৳{budgetAmount}/day)</option>
                  <option value="weekly">Weekly Target (৳{budgetAmount}/week)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-forest-border flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={saving}
            disabled={saving}
            icon={<Save className="w-4 h-4" />}
          >
            Save All Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};
