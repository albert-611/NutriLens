import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/common/Button';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { LangToggle } from '../../components/common/LangToggle';
import {
  MultiSelectDropdown,
} from '../../components/signup/MultiSelectDropdown';
import {
  SingleSelectDropdown,
} from '../../components/signup/SingleSelectDropdown';
import {
  UnitValueInput,
} from '../../components/signup/UnitValueInput';
import {
  PasswordStrengthMeter,
} from '../../components/signup/PasswordStrengthMeter';
import { useLocation } from 'react-router-dom';
import {
  SignupStepIndicator,
} from '../../components/signup/SignupStepIndicator';
import {
  HealthConsentNotice,
} from '../../components/signup/HealthConsentNotice';
import {
  TermsConfirmationModal,
} from '../../components/signup/TermsConfirmationModal';
import {
  TermsDetailModal,
} from '../../components/signup/TermsDetailModal';
import {
  ProfilePhotoUploader,
} from '../../components/common/ProfilePhotoUploader';
import {
  getAvailableMedicalConditions,
  sanitizeConditionsForSex,
} from '../../lib/medicalConditionsConfig';
import {
  checkUsernameAvailable,
  registerComprehensiveAccount,
} from '../../services/registrationService';
import { compressImageToDataUrl } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabaseClient';
import {
  ArrowLeft,
  ArrowRight,
  User,
  HeartPulse,
  Utensils,
  Activity,
  Target,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Edit2,
  ShieldAlert,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signInWithGoogle, setAuthenticatedUser, refreshUserData } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  // Profile photo state (Optional)
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Terms confirmation modals
  const [showTermsConfirmation, setShowTermsConfirmation] = useState(false);
  const [showTermsDetail, setShowTermsDetail] = useState(false);

  // Google progressive onboarding mode
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  // STEP 1: Personal Information
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number | null>(24);
  const [biologicalSex, setBiologicalSex] = useState<string>('Prefer not to say');
  const [heightValue, setHeightValue] = useState<number | null>(170);
  const [heightUnit, setHeightUnit] = useState<string>('cm');
  const [weightValue, setWeightValue] = useState<number | null>(68);
  const [weightUnit, setWeightUnit] = useState<string>('kg');
  const [targetWeightValue, setTargetWeightValue] = useState<number | null>(65);

  // Check and populate Google user info if in progressive onboarding
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const isGoogleMode = params.get('mode') === 'google';
    if (isGoogleMode || user?.app_metadata?.provider === 'google') {
      setIsGoogleUser(true);
      if (user?.user_metadata?.full_name && !fullName) {
        setFullName(user.user_metadata.full_name);
      }
      if (user?.email && !email) {
        setEmail(user.email);
      }
      if ((user?.user_metadata?.avatar_url || (user?.user_metadata as any)?.picture) && !profilePhotoUrl) {
        setProfilePhotoUrl(user?.user_metadata?.avatar_url || (user?.user_metadata as any)?.picture);
      }
      if (!username && user?.user_metadata?.full_name) {
        const cleanName = user.user_metadata.full_name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .replace(/_+/g, '_')
          .slice(0, 15);
        setUsername(cleanName);
      }
    }
  }, [location.search, user]);

  const handleBiologicalSexChange = (newSex: string) => {
    setBiologicalSex(newSex);
    // Automatically sanitize and clear conditions no longer valid for this sex
    setMedicalConditions((prev) => sanitizeConditionsForSex(prev, newSex));
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setGeneralError(null);
    try {
      const res = await signInWithGoogle();
      setLoading(false);
      if (res.error) {
        setGeneralError(res.error.message || 'Google sign-in failed.');
      } else {
        setIsGoogleUser(true);
        if (user?.user_metadata?.full_name) setFullName(user.user_metadata.full_name);
        if (user?.email) setEmail(user.email);
        if (user?.user_metadata?.avatar_url) setProfilePhotoUrl(user.user_metadata.avatar_url);
      }
    } catch (err: any) {
      setLoading(false);
      setGeneralError(err?.message || 'Unexpected Google sign-in error.');
    }
  };

  // STEP 2: Health Information
  const [medicalConditions, setMedicalConditions] = useState<string[]>([]);
  const [medicalConditionSpecify, setMedicalConditionSpecify] = useState('');
  const [diabetesType, setDiabetesType] = useState('Not sure');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergySpecify, setAllergySpecify] = useState('');
  const [intolerances, setIntolerances] = useState<string[]>([]);
  const [intoleranceSpecify, setIntoleranceSpecify] = useState('');

  // STEP 3: Dietary Preferences
  const [dietaryPreference, setDietaryPreference] = useState('Non-vegetarian');
  const [dietaryPreferenceSpecify, setDietaryPreferenceSpecify] = useState('');
  const [foodRestrictions, setFoodRestrictions] = useState<string[]>([]);
  const [foodRestrictionsSpecify, setFoodRestrictionsSpecify] = useState('');
  const [religiousRestrictions, setReligiousRestrictions] = useState<string[]>([]);
  const [religiousRestrictionsSpecify, setReligiousRestrictionsSpecify] = useState('');
  const [dislikedFoods, setDislikedFoods] = useState('');

  // STEP 4: Lifestyle Information
  const [activityLevel, setActivityLevel] = useState('Moderately active');
  const [exerciseFrequency, setExerciseFrequency] = useState('3–4 days per week');
  const [sleepDuration, setSleepDuration] = useState('6–7 hours');

  // STEP 5: Nutritional Goals
  const [primaryGoal, setPrimaryGoal] = useState('Maintain current weight');
  const [primaryGoalSpecify, setPrimaryGoalSpecify] = useState('');
  const [secondaryGoals, setSecondaryGoals] = useState<string[]>(['Increase protein intake']);
  const [secondaryGoalsSpecify, setSecondaryGoalsSpecify] = useState('');

  // STEP 6: Account Information
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  // STEP 7: Consent & Agreements
  const [healthDataConsent, setHealthDataConsent] = useState(true);
  const [termsConsent, setTermsConsent] = useState(false);

  // Check if diabetes condition is selected
  const hasDiabetesSelected = medicalConditions.some(
    (c) => c.toLowerCase().includes('diabetes') || c.toLowerCase().includes('prediabetes')
  );

  // Clear diabetes type if triggering condition is deselected
  useEffect(() => {
    if (!hasDiabetesSelected && diabetesType !== 'Not sure') {
      setDiabetesType('Not sure');
    }
  }, [hasDiabetesSelected]);

  // Debounced username check
  useEffect(() => {
    if (username.trim().length >= 3) {
      setIsCheckingUsername(true);
      const timer = setTimeout(async () => {
        const available = await checkUsernameAvailable(username.trim());
        setUsernameAvailable(available);
        setIsCheckingUsername(false);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setUsernameAvailable(null);
      setIsCheckingUsername(false);
    }
  }, [username]);

  // Validation function per step
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!fullName.trim() || fullName.trim().length < 2) {
        errors.fullName = 'Please enter your full name (at least 2 characters).';
      }
      if (!age || age < 18 || age > 120) {
        errors.age = 'NutriLens is for adults aged 18 and older.';
      }
      if (heightValue !== null && heightValue !== undefined && heightValue <= 0) {
        errors.height = 'Height must be a positive number.';
      }
      if (weightValue !== null && weightValue !== undefined && weightValue <= 0) {
        errors.weight = 'Weight must be a positive number.';
      }
    }

    if (step === 6) {
      if (!username.trim() || username.trim().length < 3) {
        errors.username = 'Username must be at least 3 characters.';
      } else if (usernameAvailable === false) {
        errors.username = 'This username is already taken.';
      }
      if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
        errors.email = 'Please provide a valid email address.';
      }
      if (!isGoogleUser) {
        if (!password || password.length < 8) {
          errors.password = 'Password must be at least 8 characters.';
        } else if (!/[0-9]/.test(password) || !/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
          errors.password = 'Password must include uppercase, lowercase, and a number.';
        }
        if (password !== confirmPassword) {
          errors.confirmPassword = 'Passwords do not match.';
        }
      }
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinue = () => {
    setGeneralError(null);
    if (!validateStep(currentStep)) return;

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    setCurrentStep((prev) => Math.min(7, prev + 1));
  };

  const handleBack = () => {
    setGeneralError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSkipOptional = () => {
    setGeneralError(null);
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    setCurrentStep((prev) => Math.min(7, prev + 1));
  };

  const handleFinalSubmit = async () => {
    setGeneralError(null);

    if (!termsConsent) {
      setShowTermsConfirmation(true);
      return;
    }

    setLoading(true);

    try {
      // Build structured medical conditions
      const structuredConditions = medicalConditions.map((c) => ({
        name: c,
        specify: c.includes('Other') ? medicalConditionSpecify : undefined,
        diabetesType: hasDiabetesSelected ? diabetesType : undefined,
      }));

      // Build structured allergies
      const structuredAllergies = allergies.map((a) => ({
        name: a,
        specify: a.includes('Other') ? allergySpecify : undefined,
      }));

      // Build structured intolerances
      const structuredIntolerances = intolerances.map((i) => ({
        name: i,
        specify: i.includes('Other') ? intoleranceSpecify : undefined,
      }));

      // Compress avatar photo if user picked a photo file
      let finalAvatarData = profilePhotoUrl;
      if (photoFile) {
        try {
          finalAvatarData = await compressImageToDataUrl(photoFile);
        } catch {
          finalAvatarData = profilePhotoUrl;
        }
      }

      const signupData = {
        fullName: fullName.trim(),
        avatarUrl: finalAvatarData,
        age: age || 24,
        biologicalSex: biologicalSex as any,
        heightValue: heightValue || null,
        heightUnit: heightUnit as any,
        weightValue: weightValue || null,
        weightUnit: weightUnit as any,
        targetWeightValue: targetWeightValue || null,
        medicalConditions: structuredConditions,
        allergies: structuredAllergies,
        intolerances: structuredIntolerances,
        dietaryPreference,
        dietaryPreferenceSpecify,
        foodRestrictions,
        foodRestrictionsSpecify,
        religiousRestrictions,
        religiousRestrictionsSpecify,
        dislikedFoods,
        activityLevel,
        exerciseFrequency,
        sleepDuration,
        primaryGoal,
        primaryGoalSpecify,
        secondaryGoals,
        secondaryGoalsSpecify,
        username: username.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        healthDataConsent,
        termsConsent,
      };

      const result = await registerComprehensiveAccount(signupData, photoFile);
      setLoading(false);

      if (!result.success) {
        setGeneralError(result.error || 'Failed to complete registration.');
      } else if (result.emailConfirmationRequired) {
        navigate('/login?registered=pending_confirmation', { replace: true });
      } else {
        if (result.user && result.profile) {
          setAuthenticatedUser(result.user, result.profile);
        }
        await refreshUserData();
        navigate('/app', { replace: true });
      }
    } catch (err: any) {
      setLoading(false);
      setGeneralError(err?.message || 'An unexpected error occurred during account registration.');
    }
  };

  const hasHealthData =
    medicalConditions.length > 0 || allergies.length > 0 || intolerances.length > 0;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface-lightRoot dark:bg-forest-root text-slate-900 dark:text-slate-100 p-4 sm:p-6 transition-colors duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-3xl w-full mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Landing Page</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LangToggle />
        </div>
      </div>

      {/* Main Registration Container */}
      <div className="w-full max-w-3xl mx-auto my-6 sm:my-8 space-y-6">
        {/* Step Progress Bar */}
        <SignupStepIndicator
          currentStep={currentStep}
          onStepClick={(step) => setCurrentStep(step)}
          completedSteps={completedSteps}
        />

        {generalError && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Step Card */}
        <div className="rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border p-6 sm:p-8 shadow-xl min-h-[460px] flex flex-col justify-between">
          <div>
            {/* STEP 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Step 1 of 7
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Personal Information
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Establish your basic profile. Full name and adult age (18+) are required.
                  </p>
                </div>

                {!isGoogleUser && (
                  <div className="pb-3 border-b border-slate-100 dark:border-forest-border">
                    <button
                      type="button"
                      onClick={handleGoogleSignup}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root hover:bg-slate-50 dark:hover:bg-forest-card text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Sign up faster with Google</span>
                    </button>
                    <div className="flex items-center gap-3 my-2.5">
                      <div className="flex-1 h-px bg-slate-200 dark:bg-forest-border" />
                      <span className="text-[10px] uppercase font-bold text-slate-400">or enter details</span>
                      <div className="flex-1 h-px bg-slate-200 dark:bg-forest-border" />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="sm:col-span-2 flex justify-center pb-2">
                    <ProfilePhotoUploader
                      currentPhotoUrl={profilePhotoUrl}
                      onPhotoSelected={(file, url) => {
                        setPhotoFile(file);
                        setProfilePhotoUrl(url);
                      }}
                      onPhotoRemoved={() => {
                        setPhotoFile(null);
                        setProfilePhotoUrl(null);
                      }}
                      label="Profile Photo (Optional)"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Tariqul Islam"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {stepErrors.fullName && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
                        {stepErrors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Age (Years) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="18"
                      max="120"
                      required
                      value={age !== null ? age : ''}
                      onChange={(e) => setAge(parseInt(e.target.value) || null)}
                      placeholder="e.g. 24"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    />
                    {stepErrors.age && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
                        {stepErrors.age}
                      </p>
                    )}
                  </div>

                  <div>
                    <SingleSelectDropdown
                      label="Biological Sex (Optional)"
                      options={['Male', 'Female', 'Prefer not to say']}
                      selectedValue={biologicalSex}
                      onChange={handleBiologicalSexChange}
                      placeholder="Select biological sex"
                    />
                  </div>

                  <div>
                    <UnitValueInput
                      label="Height (Optional)"
                      value={heightValue}
                      onChangeValue={setHeightValue}
                      unit={heightUnit}
                      onChangeUnit={setHeightUnit}
                      units={[
                        { label: 'cm', value: 'cm' },
                        { label: 'ft/in', value: 'ft_in' },
                      ]}
                      placeholder={heightUnit === 'cm' ? '170' : '5.7'}
                      min={1}
                      max={280}
                    />
                    {stepErrors.height && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
                        {stepErrors.height}
                      </p>
                    )}
                  </div>

                  <div>
                    <UnitValueInput
                      label="Current Weight (Optional)"
                      value={weightValue}
                      onChangeValue={setWeightValue}
                      unit={weightUnit}
                      onChangeUnit={setWeightUnit}
                      units={[
                        { label: 'kg', value: 'kg' },
                        { label: 'lbs', value: 'lbs' },
                      ]}
                      placeholder="68"
                      min={20}
                      max={350}
                    />
                    {stepErrors.weight && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
                        {stepErrors.weight}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <UnitValueInput
                      label="Target Weight (Optional)"
                      value={targetWeightValue}
                      onChangeValue={setTargetWeightValue}
                      unit={weightUnit}
                      onChangeUnit={setWeightUnit}
                      units={[
                        { label: 'kg', value: 'kg' },
                        { label: 'lbs', value: 'lbs' },
                      ]}
                      placeholder="65"
                      min={20}
                      max={350}
                      helperText="Target weight helps personalize caloric and nutritional density targets."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Health Information (Optional) */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Step 2 of 7
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-forest-border text-slate-600 dark:text-slate-300">
                      Optional
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Health Information
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    All fields in this section are voluntary. We never infer conditions, and allergies are stored strictly separate from intolerances.
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  {/* Medical Conditions (dynamically filtered by biological sex) */}
                  <MultiSelectDropdown
                    label="Medical Conditions"
                    options={getAvailableMedicalConditions(biologicalSex)}
                    selectedValues={medicalConditions}
                    onChange={setMedicalConditions}
                    otherValue={medicalConditionSpecify}
                    onOtherChange={setMedicalConditionSpecify}
                    placeholder="Select medical conditions or None"
                    helperText="'None' is mutually exclusive with all other conditions."
                  />

                  {/* Conditional Diabetes Type Dropdown */}
                  {hasDiabetesSelected && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2 animate-fadeIn">
                      <SingleSelectDropdown
                        label="Diabetes Classification (Conditional)"
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
                        helperText="Required only when Diabetes or Prediabetes is selected."
                      />
                    </div>
                  )}

                  {/* Food Allergies */}
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
                    helperText="Stored independently. Food analysis surfaces critical warnings for potential allergen matches."
                  />

                  {/* Food Intolerances */}
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
                    helperText="Intolerances are non-immunological and kept distinct from severe allergic reactions."
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Dietary Preferences */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Step 3 of 7
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Dietary Preferences & Restrictions
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Define your cooking patterns, ingredient exclusions, and religious guidelines.
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  <SingleSelectDropdown
                    label="Primary Dietary Preference"
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
                    selectedValues={foodRestrictions}
                    onChange={setFoodRestrictions}
                    otherValue={foodRestrictionsSpecify}
                    onOtherChange={setFoodRestrictionsSpecify}
                    placeholder="Select food restrictions or None"
                  />

                  <MultiSelectDropdown
                    label="Religious & Cultural Dietary Guidelines"
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
                    placeholder="Select religious restrictions or None"
                    helperText="'None' and 'Prefer not to say' are mutually exclusive choices."
                  />

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Foods You Dislike (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={dislikedFoods}
                      onChange={(e) => setDislikedFoods(e.target.value)}
                      placeholder="e.g. Bitter gourd (Karela), excess coriander, mustard oil..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Personal tastes are saved separately from biological allergies and intolerances.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Lifestyle Information (Optional) */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Step 4 of 7
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-forest-border text-slate-600 dark:text-slate-300">
                      Optional
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Lifestyle & Physical Activity
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Activity and sleep duration guide daily energy and micronutrient requirements.
                  </p>
                </div>

                <div className="space-y-4 pt-1">
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

            {/* STEP 5: Nutritional Goals */}
            {currentStep === 5 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Step 5 of 7
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Nutritional & Wellness Goals
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Choose what you want to achieve with NutriLens meal analyses and recipe pivots.
                  </p>
                </div>

                <div className="space-y-4 pt-1">
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

            {/* STEP 6: Account Information */}
            {currentStep === 6 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Step 6 of 7
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Account Credentials
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Create secure credentials for accessing your NutriLens workspace.
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  {/* Username with Live Check */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Username <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. tariqul_bd"
                        className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <div className="absolute right-3 top-2.5 text-[11px] font-bold">
                        {isCheckingUsername && <span className="text-slate-400">Checking...</span>}
                        {!isCheckingUsername && usernameAvailable === true && (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            Available
                          </span>
                        )}
                        {!isCheckingUsername && usernameAvailable === false && (
                          <span className="text-rose-600 dark:text-rose-400">Unavailable</span>
                        )}
                      </div>
                    </div>
                    {stepErrors.username && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
                        {stepErrors.username}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      readOnly={isGoogleUser}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${isGoogleUser ? 'opacity-70 cursor-not-allowed bg-slate-100 dark:bg-forest-card' : ''}`}
                    />
                    {stepErrors.email && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
                        {stepErrors.email}
                      </p>
                    )}
                  </div>

                  {isGoogleUser ? (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Google account authenticated ({email}). No password creation is required.</span>
                    </div>
                  ) : (
                    <>
                      {/* Password with Strength Meter */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Password <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min 8 characters with numbers & mixed case"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <PasswordStrengthMeter password={password} />
                        {stepErrors.password && (
                          <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
                            {stepErrors.password}
                          </p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Confirm Password <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter your password"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {stepErrors.confirmPassword && (
                          <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
                            {stepErrors.confirmPassword}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* STEP 7: Review & Create Account */}
            {currentStep === 7 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Step 7 of 7
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Review Profile & Consent
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Please review your entered nutrition profile before account creation.
                  </p>
                </div>

                {/* Review Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Personal Info Review */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/60 relative space-y-1">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="absolute top-3 right-3 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 hover:underline text-[10px]"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Personal Info</p>
                    <p className="font-bold text-slate-900 dark:text-white">{fullName}</p>
                    <p className="text-slate-500">
                      Age: {age} • Sex: {biologicalSex}
                    </p>
                    <p className="text-slate-500">
                      Height: {heightValue ? `${heightValue} ${heightUnit}` : 'Not provided'} • Weight:{' '}
                      {weightValue ? `${weightValue} ${weightUnit}` : 'Not provided'}
                    </p>
                  </div>

                  {/* Health Info Review */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/60 relative space-y-1">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="absolute top-3 right-3 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 hover:underline text-[10px]"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Health & Allergies</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      Conditions:{' '}
                      <span className="font-normal">
                        {medicalConditions.length > 0 ? medicalConditions.join(', ') : 'None / Skipped'}
                      </span>
                    </p>
                    <p className="font-semibold text-rose-600 dark:text-rose-400">
                      Allergies:{' '}
                      <span className="font-normal text-slate-700 dark:text-slate-300">
                        {allergies.length > 0 ? allergies.join(', ') : 'None declared'}
                      </span>
                    </p>
                    <p className="font-semibold text-amber-600 dark:text-amber-400">
                      Intolerances:{' '}
                      <span className="font-normal text-slate-700 dark:text-slate-300">
                        {intolerances.length > 0 ? intolerances.join(', ') : 'None declared'}
                      </span>
                    </p>
                  </div>

                  {/* Dietary Preferences Review */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/60 relative space-y-1">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="absolute top-3 right-3 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 hover:underline text-[10px]"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Dietary Style</p>
                    <p className="font-bold text-slate-900 dark:text-white">{dietaryPreference}</p>
                    <p className="text-slate-500">
                      Restrictions:{' '}
                      {foodRestrictions.length > 0 ? foodRestrictions.join(', ') : 'None'}
                    </p>
                    {religiousRestrictions.length > 0 && (
                      <p className="text-slate-500">Religious: {religiousRestrictions.join(', ')}</p>
                    )}
                  </div>

                  {/* Goals & Lifestyle Review */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/60 relative space-y-1">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(5)}
                      className="absolute top-3 right-3 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 hover:underline text-[10px]"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Goals & Lifestyle</p>
                    <p className="font-bold text-slate-900 dark:text-white">{primaryGoal}</p>
                    <p className="text-slate-500">
                      Activity: {activityLevel || 'Not specified'} • Sleep: {sleepDuration || 'Not specified'}
                    </p>
                  </div>

                  {/* Account Credentials Review (Password Masked) */}
                  <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/60 relative space-y-1">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(6)}
                      className="absolute top-3 right-3 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 hover:underline text-[10px]"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Account Credentials</p>
                    <p className="font-bold text-slate-900 dark:text-white">
                      Username: @{username} • Email: {email}
                    </p>
                    <p className="text-slate-500 font-mono">Password: •••••••••••• (Protected)</p>
                  </div>
                </div>

                {/* Explicit Health Data Consent Notice */}
                <HealthConsentNotice
                  consentGiven={healthDataConsent}
                  onConsentChange={setHealthDataConsent}
                  hasHealthDataProvided={hasHealthData}
                />

                {/* Terms of Service Consent */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={termsConsent}
                      onChange={(e) => setTermsConsent(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-forest-border"
                    />
                    <span className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowTermsDetail(true);
                        }}
                        className="text-emerald-600 dark:text-emerald-400 font-semibold underline hover:text-emerald-500"
                      >
                        Terms of Service
                      </button>{' '}
                      and acknowledge that NutriLens provides non-clinical dietary guidance and informational nutrition estimates.
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer Bar */}
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
              {/* Optional Skip Action for Steps 2 and 4 */}
              {(currentStep === 2 || currentStep === 4) && (
                <button
                  type="button"
                  onClick={handleSkipOptional}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-2 py-1"
                >
                  Skip Step
                </button>
              )}

              {currentStep < 7 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleContinue}
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
                  onClick={handleFinalSubmit}
                  className="shadow-lg shadow-emerald-600/20"
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  iconPosition="right"
                >
                  Create NutriLens Account
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Existing User Login Prompt */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Already registered?{' '}
          <Link
            to="/login"
            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Sign In to your Account
          </Link>
        </p>
      </div>

      {/* Footer Disclaimer */}
      <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 max-w-md mx-auto">
        NutriLens respects user data privacy under Row Level Security. Passwords are cryptographically salted and hashed.
      </div>

      {/* Terms Confirmation Modal */}
      <TermsConfirmationModal
        isOpen={showTermsConfirmation}
        onClose={() => setShowTermsConfirmation(false)}
        onReviewTerms={() => {
          setShowTermsConfirmation(false);
          setShowTermsDetail(true);
        }}
      />

      {/* Detailed Terms of Service Modal */}
      <TermsDetailModal
        isOpen={showTermsDetail}
        onClose={() => setShowTermsDetail(false)}
        termsAgreed={termsConsent}
        onAcceptAndClose={() => {
          setTermsConsent(true);
          setShowTermsDetail(false);
        }}
      />
    </div>
  );
};
