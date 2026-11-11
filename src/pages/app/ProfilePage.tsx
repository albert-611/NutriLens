import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';
import {
  User,
  HeartPulse,
  Utensils,
  Activity,
  Target,
  Wallet,
  CheckCircle2,
  Save,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { MultiSelectDropdown } from '../../components/signup/MultiSelectDropdown';
import { SingleSelectDropdown } from '../../components/signup/SingleSelectDropdown';
import { UnitValueInput } from '../../components/signup/UnitValueInput';
import { ProfilePhotoUploader } from '../../components/common/ProfilePhotoUploader';
import {
  getAvailableMedicalConditions,
  sanitizeConditionsForSex,
} from '../../lib/medicalConditionsConfig';

export const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const {
    user,
    profile,
    nutritionPreferences,
    foodRestrictions,
    budgetPreferences,
    updateProfile,
    uploadAvatar,
    isDemoUser,
    refreshUserData,
  } = useAuth();
  const { locale, setLocale } = useLocale();

  const handleBiologicalSexChange = (newSex: string) => {
    setBiologicalSex(newSex);
    setMedicalConditions((prev) => sanitizeConditionsForSex(prev, newSex));
  };

  const [activeTab, setActiveTab] = useState<'personal' | 'health' | 'dietary' | 'lifestyle' | 'goals' | 'budget'>('personal');

  // Personal Info
  const [fullName, setFullName] = useState(profile?.full_name || profile?.display_name || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
  const [isPhotoRemoved, setIsPhotoRemoved] = useState<boolean>(false);
  const [username, setUsername] = useState(profile?.username || '');
  const [age, setAge] = useState<number | null>(profile?.age || 24);
  const [biologicalSex, setBiologicalSex] = useState<string>(profile?.biological_sex || 'Prefer not to say');
  const [heightValue, setHeightValue] = useState<number | null>(profile?.height_value || 170);
  const [heightUnit, setHeightUnit] = useState<string>(profile?.height_unit || 'cm');
  const [weightValue, setWeightValue] = useState<number | null>(profile?.weight_value || 68);
  const [weightUnit, setWeightUnit] = useState<string>(profile?.weight_unit || 'kg');
  const [targetWeightValue, setTargetWeightValue] = useState<number | null>(profile?.target_weight_value || 65);
  const [city, setCity] = useState(profile?.city || 'Dhaka');
  const [country, setCountry] = useState(profile?.country || 'Bangladesh');
  const [prefLang, setPrefLang] = useState(profile?.preferred_language || 'bn');

  // Health Info
  const [medicalConditions, setMedicalConditions] = useState<string[]>([]);
  const [medicalConditionSpecify, setMedicalConditionSpecify] = useState('');
  const [diabetesType, setDiabetesType] = useState('Not sure');
  const [allergies, setAllergies] = useState<string[]>(profile?.declared_allergens || []);
  const [allergySpecify, setAllergySpecify] = useState('');
  const [intolerances, setIntolerances] = useState<string[]>(
    foodRestrictions.filter((r) => r.restriction_type === 'intolerance').map((r) => r.restriction_value) || []
  );
  const [intoleranceSpecify, setIntoleranceSpecify] = useState('');

  // Dietary Preferences
  const [dietaryPreference, setDietaryPreference] = useState(nutritionPreferences?.dietary_pattern || 'Non-vegetarian');
  const [dietaryPreferenceSpecify, setDietaryPreferenceSpecify] = useState('');
  const [userFoodRestrictions, setUserFoodRestrictions] = useState<string[]>(
    profile?.dietary_exclusions || []
  );
  const [foodRestrictionsSpecify, setFoodRestrictionsSpecify] = useState('');
  const [religiousRestrictions, setReligiousRestrictions] = useState<string[]>([]);
  const [religiousRestrictionsSpecify, setReligiousRestrictionsSpecify] = useState('');
  const [dislikedFoods, setDislikedFoods] = useState(profile?.disliked_foods || '');

  // Lifestyle
  const [activityLevel, setActivityLevel] = useState(profile?.activity_level || 'Moderately active');
  const [exerciseFrequency, setExerciseFrequency] = useState(profile?.exercise_frequency || '3–4 days per week');
  const [sleepDuration, setSleepDuration] = useState(profile?.sleep_duration || '6–7 hours');

  // Nutritional Goals
  const [primaryGoal, setPrimaryGoal] = useState(nutritionPreferences?.primary_goal || profile?.general_goal || 'Maintain current weight');
  const [primaryGoalSpecify, setPrimaryGoalSpecify] = useState('');
  const [secondaryGoals, setSecondaryGoals] = useState<string[]>(nutritionPreferences?.secondary_goals || []);
  const [secondaryGoalsSpecify, setSecondaryGoalsSpecify] = useState('');

  // Budget
  const [budgetAmount, setBudgetAmount] = useState(profile?.budget_amount || 150);
  const [budgetPeriod, setBudgetPeriod] = useState(budgetPreferences?.budget_period || 'daily');
  const [peopleCount, setPeopleCount] = useState(profile?.household_size || 1);
  const [marketId, setMarketId] = useState(profile?.market_id || '22222222-2222-2222-2222-222222222201');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || profile.display_name || '');
      setAvatarUrl(profile.avatar_url || null);
      setPendingPhotoFile(null);
      setIsPhotoRemoved(false);
      setUsername(profile.username || '');
      setAge(profile.age || 24);
      setBiologicalSex(profile.biological_sex || 'Prefer not to say');
      setHeightValue(profile.height_value || null);
      setHeightUnit(profile.height_unit || 'cm');
      setWeightValue(profile.weight_value || null);
      setWeightUnit(profile.weight_unit || 'kg');
      setTargetWeightValue(profile.target_weight_value || null);
      setCity(profile.city || 'Dhaka');
      setPrefLang(profile.preferred_language || 'bn');
      setBudgetAmount(profile.budget_amount || 150);
      setPeopleCount(profile.household_size || 1);
      if (profile.market_id) setMarketId(profile.market_id);
      if (profile.declared_allergens) setAllergies(profile.declared_allergens);
      if (profile.dietary_exclusions) setUserFoodRestrictions(profile.dietary_exclusions);
      if (profile.disliked_foods) setDislikedFoods(profile.disliked_foods);
      if (profile.activity_level) setActivityLevel(profile.activity_level);
      if (profile.exercise_frequency) setExerciseFrequency(profile.exercise_frequency);
      if (profile.sleep_duration) setSleepDuration(profile.sleep_duration);
    }
  }, [profile]);

  const hasDiabetesSelected = medicalConditions.some(
    (c) => c.toLowerCase().includes('diabetes') || c.toLowerCase().includes('prediabetes')
  );

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      let finalAvatarUrl = avatarUrl;

      // 1. Upload photo if user picked a new file
      if (pendingPhotoFile) {
        const uploadRes = await uploadAvatar(pendingPhotoFile);
        if (uploadRes.error) {
          setSaving(false);
          setErrorMessage(uploadRes.error.message || 'Failed to upload photo.');
          return;
        }
        if (uploadRes.url) {
          finalAvatarUrl = uploadRes.url;
          setAvatarUrl(uploadRes.url);
        }
      } else if (isPhotoRemoved) {
        finalAvatarUrl = null;
      }

      // 2. Persist full profile updates
      const updates = {
        full_name: fullName,
        display_name: fullName,
        avatar_url: finalAvatarUrl,
        username: username.trim() || undefined,
        age: age || undefined,
        biological_sex: biologicalSex as any,
        height_value: heightValue,
        height_unit: heightUnit as any,
        weight_value: weightValue,
        weight_unit: weightUnit as any,
        target_weight_value: targetWeightValue,
        activity_level: activityLevel as any,
        exercise_frequency: exerciseFrequency as any,
        sleep_duration: sleepDuration as any,
        disliked_foods: dislikedFoods || null,
        city,
        country,
        preferred_language: prefLang,
        language: prefLang,
        general_goal: primaryGoal as any,
        budget_amount: budgetAmount,
        household_size: peopleCount,
        market_id: marketId,
        declared_allergens: allergies,
        dietary_exclusions: userFoodRestrictions,
      };

      const { error } = await updateProfile(updates);
      setSaving(false);

      if (error) {
        setErrorMessage(error.message || 'Failed to update profile.');
      } else {
        setPendingPhotoFile(null);
        setIsPhotoRemoved(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
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
            User Profile
          </span>
          {isDemoUser && (
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
              Active Persona: {profile?.display_name}
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Personal Nutrition Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          View and update your health indicators, allergies, dietary constraints, and market preferences.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Profile preferences updated successfully!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2.5 animate-shake">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-forest-border pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'personal', label: 'Personal Information', icon: User },
          { id: 'health', label: 'Health & Allergies', icon: HeartPulse },
          { id: 'dietary', label: 'Dietary Preferences', icon: Utensils },
          { id: 'lifestyle', label: 'Lifestyle & Activity', icon: Activity },
          { id: 'goals', label: 'Nutritional Goals', icon: Target },
          { id: 'budget', label: 'Budget & Market', icon: Wallet },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
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

      {/* Main Settings Form */}
      <form onSubmit={handleSaveAll} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-6">
        {/* TAB 1: Personal Information */}
        {activeTab === 'personal' && (
          <div className="space-y-5 animate-fadeIn">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-forest-border/60">
              <User className="w-4 h-4 text-emerald-500" />
              Personal Identity & Anthropometrics
            </h2>

            <div className="flex justify-center pb-4 border-b border-slate-100 dark:border-forest-border/60">
              <ProfilePhotoUploader
                currentPhotoUrl={avatarUrl}
                onPhotoSelected={(file, dataUrl) => {
                  setPendingPhotoFile(file);
                  setIsPhotoRemoved(false);
                  if (dataUrl) {
                    setAvatarUrl(dataUrl);
                  }
                }}
                onPhotoRemoved={() => {
                  setPendingPhotoFile(null);
                  setIsPhotoRemoved(true);
                  setAvatarUrl(null);
                }}
                label="Profile Photo"
              />
            </div>

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
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Registered Email
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.email || 'demo.user@nutrilens.internal'}
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
                  value={age || ''}
                  onChange={(e) => setAge(parseInt(e.target.value) || null)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div>
                <SingleSelectDropdown
                  label="Biological Sex"
                  options={['Male', 'Female', 'Prefer not to say']}
                  selectedValue={biologicalSex}
                  onChange={handleBiologicalSexChange}
                />
              </div>

              <div>
                <UnitValueInput
                  label="Height"
                  value={heightValue}
                  onChangeValue={setHeightValue}
                  unit={heightUnit}
                  onChangeUnit={setHeightUnit}
                  units={[
                    { label: 'cm', value: 'cm' },
                    { label: 'ft/in', value: 'ft_in' },
                  ]}
                  min={1}
                  max={280}
                />
              </div>

              <div>
                <UnitValueInput
                  label="Current Weight"
                  value={weightValue}
                  onChangeValue={setWeightValue}
                  unit={weightUnit}
                  onChangeUnit={setWeightUnit}
                  units={[
                    { label: 'kg', value: 'kg' },
                    { label: 'lbs', value: 'lbs' },
                  ]}
                  min={20}
                  max={350}
                />
              </div>

              <div>
                <UnitValueInput
                  label="Target Weight"
                  value={targetWeightValue}
                  onChangeValue={setTargetWeightValue}
                  unit={weightUnit}
                  onChangeUnit={setWeightUnit}
                  units={[
                    { label: 'kg', value: 'kg' },
                    { label: 'lbs', value: 'lbs' },
                  ]}
                  min={20}
                  max={350}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Preferred Interface Language
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

        {/* TAB 2: Health Information */}
        {activeTab === 'health' && (
          <div className="space-y-5 animate-fadeIn">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-forest-border/60">
              <HeartPulse className="w-4 h-4 text-emerald-500" />
              Health Conditions & Declared Allergies
            </h2>

            <div className="space-y-4">
              <MultiSelectDropdown
                label="Medical Conditions"
                options={getAvailableMedicalConditions(biologicalSex)}
                selectedValues={medicalConditions}
                onChange={setMedicalConditions}
                otherValue={medicalConditionSpecify}
                onOtherChange={setMedicalConditionSpecify}
                placeholder="Select medical conditions or None"
              />

              {hasDiabetesSelected && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <SingleSelectDropdown
                    label="Diabetes Classification"
                    options={[
                      'Type 1',
                      'Type 2',
                      'Gestational diabetes',
                      'Prediabetes',
                      'Other',
                      'Not sure',
                    ]}
                    selectedValue={diabetesType}
                    onChange={setDiabetesType}
                    placeholder="Select diabetes type"
                  />
                </div>
              )}

              <MultiSelectDropdown
                label="Food Allergies (Strictly Separate from Intolerances)"
                options={[
                  'None',
                  'Peanuts',
                  'Tree nuts (almonds, walnuts, cashews)',
                  'Milk/dairy',
                  'Eggs',
                  'Fish',
                  'Shellfish (shrimp, crab, lobster)',
                  'Soy',
                  'Wheat',
                  'Sesame',
                  'Other (specify)',
                ]}
                selectedValues={allergies}
                onChange={setAllergies}
                otherValue={allergySpecify}
                onOtherChange={setAllergySpecify}
                placeholder="Select food allergies or None"
                helperText="Food recognition features cross-audit detected plates against these declared allergens."
              />

              <MultiSelectDropdown
                label="Food Intolerances & Sensitivities"
                options={[
                  'None',
                  'Lactose intolerance',
                  'Gluten intolerance',
                  'Fructose intolerance',
                  'Histamine intolerance',
                  'Caffeine sensitivity',
                  'Other (specify)',
                ]}
                selectedValues={intolerances}
                onChange={setIntolerances}
                otherValue={intoleranceSpecify}
                onOtherChange={setIntoleranceSpecify}
                placeholder="Select food intolerances or None"
              />
            </div>
          </div>
        )}

        {/* TAB 3: Dietary Preferences */}
        {activeTab === 'dietary' && (
          <div className="space-y-5 animate-fadeIn">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-forest-border/60">
              <Utensils className="w-4 h-4 text-emerald-500" />
              Dietary Patterns & Restrictions
            </h2>

            <div className="space-y-4">
              <SingleSelectDropdown
                label="Primary Dietary Style"
                options={[
                  'Non-vegetarian',
                  'Vegetarian',
                  'Vegan',
                  'Pescatarian',
                  'Flexitarian',
                  'Other (specify)',
                ]}
                selectedValue={dietaryPreference}
                onChange={setDietaryPreference}
                otherValue={dietaryPreferenceSpecify}
                onOtherChange={setDietaryPreferenceSpecify}
              />

              <MultiSelectDropdown
                label="Food Restrictions"
                options={[
                  'None',
                  'No red meat',
                  'No seafood',
                  'No pork',
                  'No dairy',
                  'No eggs',
                  'No added sugar',
                  'Low-carbohydrate diet',
                  'Low-sodium diet',
                  'Gluten-free diet',
                  'Other (specify)',
                ]}
                selectedValues={userFoodRestrictions}
                onChange={setUserFoodRestrictions}
                otherValue={foodRestrictionsSpecify}
                onOtherChange={setFoodRestrictionsSpecify}
              />

              <MultiSelectDropdown
                label="Religious / Cultural Guidelines"
                options={[
                  'None',
                  'Halal',
                  'Kosher',
                  'Hindu dietary restrictions',
                  'Other (specify)',
                  'Prefer not to say',
                ]}
                selectedValues={religiousRestrictions}
                onChange={setReligiousRestrictions}
                otherValue={religiousRestrictionsSpecify}
                onOtherChange={setReligiousRestrictionsSpecify}
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Foods You Dislike
                </label>
                <textarea
                  rows={2}
                  value={dislikedFoods}
                  onChange={(e) => setDislikedFoods(e.target.value)}
                  placeholder="e.g. Bitter gourd (Karela), mustard oil..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Lifestyle Information */}
        {activeTab === 'lifestyle' && (
          <div className="space-y-5 animate-fadeIn">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-forest-border/60">
              <Activity className="w-4 h-4 text-emerald-500" />
              Lifestyle & Activity Factors
            </h2>

            <div className="space-y-4">
              <SingleSelectDropdown
                label="Physical Activity Level"
                options={[
                  'Sedentary (little or no exercise)',
                  'Lightly active',
                  'Moderately active',
                  'Very active',
                  'Extremely active',
                ]}
                selectedValue={activityLevel}
                onChange={setActivityLevel}
              />

              <SingleSelectDropdown
                label="Exercise Frequency"
                options={[
                  'Never',
                  '1–2 days per week',
                  '3–4 days per week',
                  '5–6 days per week',
                  'Every day',
                ]}
                selectedValue={exerciseFrequency}
                onChange={setExerciseFrequency}
              />

              <SingleSelectDropdown
                label="Average Sleep Duration"
                options={[
                  'Less than 4 hours',
                  '4–5 hours',
                  '6–7 hours',
                  '8–9 hours',
                  'More than 9 hours',
                ]}
                selectedValue={sleepDuration}
                onChange={setSleepDuration}
              />
            </div>
          </div>
        )}

        {/* TAB 5: Nutritional Goals */}
        {activeTab === 'goals' && (
          <div className="space-y-5 animate-fadeIn">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-forest-border/60">
              <Target className="w-4 h-4 text-emerald-500" />
              Nutritional Goals & Targets
            </h2>

            <div className="space-y-4">
              <SingleSelectDropdown
                label="Primary Nutritional Goal"
                options={[
                  'Weight loss',
                  'Weight gain',
                  'Maintain current weight',
                  'Muscle building',
                  'Blood sugar management',
                  'Blood pressure management',
                  'Improve heart health',
                  'Improve digestive health',
                  'Improve overall nutrition',
                  'Improve fitness and energy',
                  'Other (specify)',
                ]}
                selectedValue={primaryGoal}
                onChange={setPrimaryGoal}
                otherValue={primaryGoalSpecify}
                onOtherChange={setPrimaryGoalSpecify}
              />

              <MultiSelectDropdown
                label="Secondary Nutritional Goals"
                options={[
                  'Increase protein intake',
                  'Increase fiber intake',
                  'Reduce sugar consumption',
                  'Reduce sodium consumption',
                  'Increase vitamin intake',
                  'Increase mineral intake',
                  'Improve hydration',
                  'Eat more fruits and vegetables',
                  'Improve meal balance',
                  'Other (specify)',
                ]}
                selectedValues={secondaryGoals}
                onChange={setSecondaryGoals}
                otherValue={secondaryGoalsSpecify}
                onOtherChange={setSecondaryGoalsSpecify}
                placeholder="Select secondary goals"
              />
            </div>
          </div>
        )}

        {/* TAB 6: Budget & Market */}
        {activeTab === 'budget' && (
          <div className="space-y-5 animate-fadeIn">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-forest-border/60">
              <Wallet className="w-4 h-4 text-emerald-500" />
              Budget Targets & Local Market Context
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
            Save Nutrition Profile
          </Button>
        </div>
      </form>
    </div>
  );
};
