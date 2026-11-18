import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { LangToggle } from '../../components/common/LangToggle';
import type { OnboardingData } from '../../contracts';
import {
  User,
  Target,
  Utensils,
  AlertTriangle,
  Wallet,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldAlert,
  Info,
  Check,
  Edit2,
  MapPin,
  Clock,
  Heart,
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Basic Info', icon: User },
  { id: 2, title: 'Nutrition Goals', icon: Target },
  { id: 3, title: 'Food Preferences', icon: Utensils },
  { id: 4, title: 'Restrictions', icon: AlertTriangle },
  { id: 5, title: 'Budget & Market', icon: Wallet },
  { id: 6, title: 'Review', icon: CheckCircle2 },
];

export const OnboardingPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile, onboardingCompleted, completeOnboarding } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (onboardingCompleted) {
      navigate('/app', { replace: true });
    }
  }, [onboardingCompleted, navigate]);

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State initialized with user/profile defaults
  const [formData, setFormData] = useState<OnboardingData>({
    fullName: profile?.full_name || user?.user_metadata?.full_name || '',
    age: profile?.age || 24,
    country: profile?.country || 'Bangladesh',
    city: profile?.city || 'Dhaka',
    preferredLanguage: (profile?.preferred_language as 'bn' | 'en') || 'bn',
    primaryGoal: profile?.general_goal || 'balanced_wellness',
    secondaryGoals: [],
    preferredCuisine: 'bangladeshi',
    dietaryPattern: 'no_preference',
    favoriteCategories: ['grains_and_cereals', 'pulses_and_legumes', 'fish_and_seafood'],
    foodsToAvoid: [],
    allergies: profile?.declared_allergens || [],
    intolerances: [],
    religiousExclusions: [],
    dislikedIngredients: [],
    marketId: profile?.market_id || '22222222-2222-2222-2222-222222222201',
    currency: 'BDT',
    budgetAmount: profile?.budget_amount || 150,
    budgetPeriod: 'daily',
    peopleCount: profile?.household_size || 1,
  });

  const updateField = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = <K extends keyof OnboardingData>(key: K, item: string) => {
    setFormData((prev) => {
      const currentList = (prev[key] as string[]) || [];
      const updated = currentList.includes(item)
        ? currentList.filter((x) => x !== item)
        : [...currentList, item];
      return { ...prev, [key]: updated };
    });
  };

  const handleNext = () => {
    setError(null);

    // Validation for Step 1
    if (currentStep === 1) {
      if (!formData.fullName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!formData.age || formData.age < 18) {
        setError('NutriLens is designed for adults aged 18 and older.');
        return;
      }
    }

    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: saveErr } = await completeOnboarding(formData);
      setLoading(false);

      if (saveErr) {
        setError(saveErr.message || 'Failed to save onboarding preferences.');
      } else {
        navigate('/app', { replace: true });
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'An unexpected error occurred while completing onboarding.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface-lightRoot dark:bg-forest-root text-slate-900 dark:text-slate-100 p-4 sm:p-6 transition-colors duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-3xl w-full mx-auto">
        <div className="flex items-center gap-2.5">
          <img 
            src="/logo.svg" 
            alt="NutriLens Logo" 
            className="w-9 h-9 sm:w-10 sm:h-10 object-contain shrink-0" 
          />
          <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
            NutriLens Personalization
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LangToggle />
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-3xl mx-auto my-6 sm:my-8 space-y-6">
        {/* Step Progress Bar */}
        <div className="bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 sm:pb-0">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isDone = step.id < currentStep;
              const isCurrent = step.id === currentStep;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                  disabled={step.id > currentStep}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    isCurrent
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : isDone
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 cursor-pointer'
                      : 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                      isCurrent
                        ? 'bg-white text-emerald-600'
                        : isDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-forest-border text-slate-500'
                    }`}
                  >
                    {isDone ? <Check className="w-3 h-3" /> : step.id}
                  </span>
                  <span className="hidden sm:inline">{step.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2.5 animate-shake">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step Content Card */}
        <div className="rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border p-6 sm:p-8 shadow-xl min-h-[420px] flex flex-col justify-between">
          <div>
            {/* STEP 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Step 1 of 6
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Basic Information
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    We personalize nutrition estimates for adults (18+). Please share your basic details.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      placeholder="e.g. Tariqul Islam"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Age (Adults 18+) *
                    </label>
                    <input
                      type="number"
                      min="18"
                      max="110"
                      value={formData.age}
                      onChange={(e) => updateField('age', parseInt(e.target.value) || 18)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Preferred Language
                    </label>
                    <select
                      value={formData.preferredLanguage}
                      onChange={(e) => updateField('preferredLanguage', e.target.value as 'bn' | 'en')}
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
                      value={formData.country}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-forest-border bg-slate-100 dark:bg-forest-root text-xs text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      City / Region
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
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

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/60 text-[11px] text-slate-500 flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p>
                    The prototype is currently tailored to adult dietary patterns and does not create child nutrition profiles.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: Nutrition Goals */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Step 2 of 6
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Nutrition & Health Focus
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select your primary dietary goal and any secondary focus areas. These are guidance preferences, not clinical treatment plans.
                  </p>
                </div>

                {/* Primary Goal Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Primary Goal (Select One)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { id: 'balanced_wellness', label: 'Maintain a balanced diet', desc: 'Everyday nutrition and macro balance' },
                      { id: 'improve_overall_nutrition', label: 'Improve overall nutrition', desc: 'Target key micronutrients and fiber' },
                      { id: 'increase_protein', label: 'Increase protein intake', desc: 'Focus on affordable, quality protein sources' },
                      { id: 'improve_dietary_variety', label: 'Improve dietary variety', desc: 'Diversify seasonal vegetables and dishes' },
                      { id: 'manage_food_expenses', label: 'Manage food expenses', desc: 'Budget-friendly staple and nutrient optimization' },
                      { id: 'build_healthier_habits', label: 'Build healthier eating habits', desc: 'Mindful portion and preparation choices' },
                    ].map((goal) => (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => updateField('primaryGoal', goal.id)}
                        className={`text-left p-3 rounded-2xl border transition-all ${
                          formData.primaryGoal === goal.id
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 shadow-sm'
                            : 'border-slate-200 dark:border-forest-border hover:border-emerald-500/40 bg-white dark:bg-forest-root text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <p className="font-bold text-xs">{goal.label}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{goal.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Secondary Goals (Multi) */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Secondary Goals (Optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Heart-conscious eating',
                      'Low sodium habits',
                      'High fiber intake',
                      'Energy sustaining meals',
                      'Affordable snacking',
                    ].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => toggleArrayItem('secondaryGoals', sec)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                          formData.secondaryGoals.includes(sec)
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 dark:bg-forest-root border-slate-200 dark:border-forest-border text-slate-700 dark:text-slate-300 hover:border-emerald-500/40'
                        }`}
                      >
                        {sec}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Food Preferences */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Step 3 of 6
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Food Preferences & Dietary Pattern
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tell us what styles of cooking you enjoy. Dietary preferences do not guarantee allergen safety.
                  </p>
                </div>

                {/* Dietary Pattern */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Dietary Pattern
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'no_preference', label: 'No specific preference' },
                      { id: 'halal', label: 'Halal only' },
                      { id: 'pescatarian', label: 'Pescatarian (Fish & Veg)' },
                      { id: 'vegetarian', label: 'Vegetarian' },
                      { id: 'vegan', label: 'Vegan' },
                      { id: 'other', label: 'Other' },
                    ].map((pat) => (
                      <button
                        key={pat.id}
                        type="button"
                        onClick={() => updateField('dietaryPattern', pat.id)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                          formData.dietaryPattern === pat.id
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white dark:bg-forest-root border-slate-200 dark:border-forest-border text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {pat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Favorite Categories */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Favorite Food Categories (Select all that apply)
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
                        onClick={() => toggleArrayItem('favoriteCategories', cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                          formData.favoriteCategories.includes(cat.id)
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

            {/* STEP 4: Food Restrictions */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Step 4 of 6
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Food Restrictions & Allergies
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Declare known allergies, intolerances, and religious exclusions. We treat unknown compositions as unverified.
                  </p>
                </div>

                {/* Common Allergies */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Allergies & Intolerances
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
                        onClick={() => toggleArrayItem('allergies', item)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                          formData.allergies.includes(item)
                            ? 'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 font-bold'
                            : 'bg-slate-50 dark:bg-forest-root border-slate-200 dark:border-forest-border text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Religious / Personal Exclusions */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Excluded Ingredients or Personal Avoidances
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
                        onClick={() => toggleArrayItem('religiousExclusions', item)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                          formData.religiousExclusions.includes(item)
                            ? 'bg-amber-500/15 border-amber-500 text-amber-800 dark:text-amber-300 font-bold'
                            : 'bg-slate-50 dark:bg-forest-root border-slate-200 dark:border-forest-border text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    <strong>Safety Notice:</strong> NutriLens never claims guaranteed allergen safety. Restaurant and open bazar products carry potential cross-contact risks.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 5: Budget & Market Preferences */}
            {currentStep === 5 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Step 5 of 6
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Budget & Market Preferences
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ground your nutrition choices against local commodity prices in Savar and Ashulia.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Target Bazar / Market
                    </label>
                    <select
                      value={formData.marketId || ''}
                      onChange={(e) => updateField('marketId', e.target.value)}
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
                      value={formData.peopleCount}
                      onChange={(e) => updateField('peopleCount', parseInt(e.target.value) || 1)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Target Budget (BDT)
                    </label>
                    <input
                      type="number"
                      min="50"
                      step="25"
                      value={formData.budgetAmount}
                      onChange={(e) => updateField('budgetAmount', parseFloat(e.target.value) || 100)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Budget Period
                    </label>
                    <select
                      value={formData.budgetPeriod}
                      onChange={(e) => updateField('budgetPeriod', e.target.value as 'daily' | 'weekly')}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="daily">Daily Target (৳{formData.budgetAmount}/day)</option>
                      <option value="weekly">Weekly Target (৳{formData.budgetAmount}/week)</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/60 text-[11px] text-slate-500">
                  <p>
                    All price and stock levels displayed in the pilot represent simulated demonstration data for testing.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 6: Review & Complete */}
            {currentStep === 6 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Step 6 of 6
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Review Your Nutrition Profile
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Everything looks ready. You can modify any section now or update it later in your Settings.
                  </p>
                </div>

                {/* Summary Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  {/* Identity */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/60 space-y-1 relative">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="absolute top-3 right-3 text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 text-[10px] font-bold"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Identity</p>
                    <p className="font-bold text-slate-900 dark:text-white">{formData.fullName}</p>
                    <p className="text-slate-500">
                      Age: {formData.age} • {formData.city}, {formData.country}
                    </p>
                  </div>

                  {/* Goal */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/60 space-y-1 relative">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="absolute top-3 right-3 text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 text-[10px] font-bold"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Primary Goal</p>
                    <p className="font-bold text-slate-900 dark:text-white capitalize">
                      {formData.primaryGoal.replace(/_/g, ' ')}
                    </p>
                    <p className="text-slate-500">
                      {formData.secondaryGoals.length} secondary focus areas
                    </p>
                  </div>

                  {/* Restrictions */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/60 space-y-1 relative">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="absolute top-3 right-3 text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 text-[10px] font-bold"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Restrictions</p>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {formData.allergies.length > 0 ? formData.allergies.join(', ') : 'None declared'}
                    </p>
                    <p className="text-slate-500">
                      Pattern: <span className="capitalize">{formData.dietaryPattern.replace(/_/g, ' ')}</span>
                    </p>
                  </div>

                  {/* Budget */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/60 space-y-1 relative">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(5)}
                      className="absolute top-3 right-3 text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 text-[10px] font-bold"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Budget</p>
                    <p className="font-bold text-slate-900 dark:text-white">
                      ৳{formData.budgetAmount} / {formData.budgetPeriod}
                    </p>
                    <p className="text-slate-500">For {formData.peopleCount} person(s)</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-slate-100 dark:border-forest-border flex items-center justify-between">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleBack}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              {currentStep > 1 && currentStep < 6 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold px-2 py-1"
                >
                  Skip Step
                </button>
              )}

              {currentStep < 6 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleNext}
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  disabled={loading}
                  onClick={handleComplete}
                  className="shadow-lg shadow-emerald-600/20"
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  iconPosition="right"
                >
                  Complete Onboarding
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 max-w-md mx-auto">
        Your preferences can be updated anytime in Profile & Settings.
      </div>
    </div>
  );
};

