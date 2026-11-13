import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type {
  ComprehensiveSignupData,
  Profile,
} from '../contracts';
import {
  ensureProfileExists,
  saveFullNutritionProfile,
  uploadProfilePhoto,
} from './authService';

export interface RegistrationResult {
  success: boolean;
  user?: any;
  session?: any;
  profile?: Profile;
  error?: string;
  emailConfirmationRequired?: boolean;
}

/**
 * Checks if a username is available in Supabase.
 */
export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const clean = username.trim().toLowerCase();
  if (!clean || clean.length < 3) return false;

  if (!isSupabaseConfigured) {
    return true;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', clean)
      .maybeSingle();

    if (error) {
      console.warn('Username check notice:', error);
      return true;
    }

    return !data;
  } catch (err) {
    console.warn('Username availability check exception:', err);
    return true;
  }
}

/**
 * Registers an account with Supabase Auth and persists the full nutrition profile in PostgreSQL.
 */
export async function registerComprehensiveAccount(
  data: ComprehensiveSignupData,
  photoFile?: File | null
): Promise<RegistrationResult> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      error: 'Supabase authentication service is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    };
  }

  // Pre-validate username format and length
  const usernameClean = data.username.trim().toLowerCase();
  if (!usernameClean || usernameClean.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters long.' };
  }

  // Pre-validate username uniqueness
  const isAvailable = await checkUsernameAvailable(usernameClean);
  if (!isAvailable) {
    return {
      success: false,
      error: `Username "${data.username}" is already taken. Please choose another username.`,
    };
  }

  // Email format validation
  const cleanEmail = data.email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    return { success: false, error: 'Please provide a valid email address.' };
  }

  // Password validation
  if (!data.password || data.password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(data.password) || !/[a-z]/.test(data.password) || !/[0-9]/.test(data.password)) {
    return { success: false, error: 'Password must contain uppercase, lowercase, and a number.' };
  }
  if (data.password !== data.confirmPassword) {
    return { success: false, error: 'Passwords do not match.' };
  }

  try {
    let safeSex = 'prefer_not_to_say';
    const sexLower = String(data.biologicalSex || '').toLowerCase();
    if (sexLower.includes('female')) safeSex = 'female';
    else if (sexLower.includes('male')) safeSex = 'male';

    let safeActivity = 'moderately_active';
    const actLower = String(data.activityLevel || '').toLowerCase();
    if (actLower.includes('sedentary')) safeActivity = 'sedentary';
    else if (actLower.includes('light')) safeActivity = 'lightly_active';
    else if (actLower.includes('extreme')) safeActivity = 'extremely_active';
    else if (actLower.includes('very')) safeActivity = 'very_active';

    let safeFreq = '3_4_days';
    const freqLower = String(data.exerciseFrequency || '').toLowerCase();
    if (freqLower.includes('never')) safeFreq = 'never';
    else if (freqLower.includes('1') && freqLower.includes('2')) safeFreq = '1_2_days';
    else if (freqLower.includes('3') && freqLower.includes('4')) safeFreq = '3_4_days';
    else if (freqLower.includes('5') && freqLower.includes('6')) safeFreq = '5_6_days';
    else if (freqLower.includes('every') || freqLower.includes('daily')) safeFreq = 'every_day';

    let safeSleep = '6_7h';
    const sleepLower = String(data.sleepDuration || '').toLowerCase();
    if (sleepLower.includes('less') || sleepLower.includes('<')) safeSleep = 'less_than_4h';
    else if (sleepLower.includes('4') && sleepLower.includes('5')) safeSleep = '4_5h';
    else if (sleepLower.includes('6') && sleepLower.includes('7')) safeSleep = '6_7h';
    else if (sleepLower.includes('8') && sleepLower.includes('9')) safeSleep = '8_9h';
    else if (sleepLower.includes('more') || sleepLower.includes('>')) safeSleep = 'more_than_9h';

    let safeGoal = 'balanced_wellness';
    const goalLower = String(data.primaryGoal || '').toLowerCase();
    if (goalLower.includes('protein') || goalLower.includes('muscle')) safeGoal = 'high_protein';
    else if (goalLower.includes('budget') || goalLower.includes('expense')) safeGoal = 'budget_friendly';
    else if (goalLower.includes('diabet') || goalLower.includes('sugar')) safeGoal = 'diabetic_friendly_lifestyle';
    else if (goalLower.includes('heart') || goalLower.includes('pressure')) safeGoal = 'heart_conscious';

    const safeHeightUnit = String(data.heightUnit || '').toLowerCase().includes('ft') ? 'ft_in' : 'cm';
    const safeWeightUnit = String(data.weightUnit || '').toLowerCase().includes('lb') ? 'lbs' : 'kg';

    // Prepare email for registration: clear any deleted flags and purge any prior deleted ghost accounts
    try {
      localStorage.removeItem(`nutrilens_deleted_${cleanEmail}`);
      await supabase.rpc('prepare_email_for_registration', { p_email: cleanEmail });
      await supabase.from('deleted_accounts').delete().eq('email', cleanEmail);
    } catch (e) {
      console.warn('Prepare email registration notice:', e);
    }

    // 1. Create Supabase Auth User with full metadata
    let authRes = await supabase.auth.signUp({
      email: cleanEmail,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName.trim(),
          display_name: data.fullName.trim(),
          username: usernameClean,
          avatar_url: data.avatarUrl || null,
          age: data.age,
          biological_sex: safeSex,
          height_value: data.heightValue || null,
          height_unit: safeHeightUnit,
          weight_value: data.weightValue || null,
          weight_unit: safeWeightUnit,
          target_weight_value: data.targetWeightValue || null,
          activity_level: safeActivity,
          exercise_frequency: safeFreq,
          sleep_duration: safeSleep,
          disliked_foods: data.dislikedFoods || null,
          general_goal: safeGoal,
        },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    // If Supabase reports already registered, try purging prior deleted account and retry once
    if (authRes.error && authRes.error.message?.toLowerCase().includes('already registered')) {
      try {
        const { data: wasPurged } = await supabase.rpc('prepare_email_for_registration', { p_email: cleanEmail });
        if (wasPurged) {
          authRes = await supabase.auth.signUp({
            email: cleanEmail,
            password: data.password,
            options: {
              data: {
                full_name: data.fullName.trim(),
                display_name: data.fullName.trim(),
                username: usernameClean,
                avatar_url: data.avatarUrl || null,
                age: data.age,
                biological_sex: safeSex,
                height_value: data.heightValue || null,
                height_unit: safeHeightUnit,
                weight_value: data.weightValue || null,
                weight_unit: safeWeightUnit,
                target_weight_value: data.targetWeightValue || null,
                activity_level: safeActivity,
                exercise_frequency: safeFreq,
                sleep_duration: safeSleep,
                disliked_foods: data.dislikedFoods || null,
                general_goal: safeGoal,
              },
              emailRedirectTo: `${window.location.origin}/login`,
            },
          });
        }
      } catch {}
    }

    const authData = authRes.data;
    const authErr = authRes.error;

    if (authErr) {
      return { success: false, error: authErr.message };
    }

    if (!authData.user) {
      return { success: false, error: 'User registration failed to create an account.' };
    }

    // Successfully created new account: permanently clear any deletion tracking for this email
    try {
      localStorage.removeItem(`nutrilens_deleted_${cleanEmail}`);
      await supabase.from('deleted_accounts').delete().eq('email', cleanEmail);
    } catch {}

    const createdUser = authData.user;
    const userId = createdUser.id;
    const emailConfirmationRequired = !authData.session && !createdUser.confirmed_at;

    // Cache registration preferences in localStorage so it can be restored whenever user logs in
    try {
      localStorage.setItem(`nutrilens_pending_signup_${cleanEmail}`, JSON.stringify({
        ...data,
        avatarUrl: data.avatarUrl,
      }));
    } catch (e) {
      console.warn('Could not store pending signup in localStorage:', e);
    }

    let finalAvatarUrl = data.avatarUrl || null;

    // If an active session is returned right away, set it on client and persist everything
    if (authData.session) {
      await supabase.auth.setSession(authData.session);

      if (photoFile) {
        try {
          const { data: photoData } = await uploadProfilePhoto(userId, photoFile);
          if (photoData?.url) {
            finalAvatarUrl = photoData.url;
            await supabase.auth.updateUser({ data: { avatar_url: photoData.url } });
          }
        } catch (photoErr) {
          console.warn('Signup photo upload notice:', photoErr);
        }
      }

      await saveFullNutritionProfile(userId, {
        fullName: data.fullName.trim(),
        displayName: data.fullName.trim(),
        avatarUrl: finalAvatarUrl,
        username: usernameClean,
        age: data.age,
        biologicalSex: safeSex,
        heightValue: data.heightValue || null,
        heightUnit: safeHeightUnit,
        weightValue: data.weightValue || null,
        weightUnit: safeWeightUnit,
        targetWeightValue: data.targetWeightValue || null,
        activityLevel: safeActivity,
        exerciseFrequency: safeFreq,
        sleepDuration: safeSleep,
        dislikedFoods: data.dislikedFoods || null,
        primaryGoal: data.primaryGoal,
        primaryGoalSpecify: data.primaryGoalSpecify,
        secondaryGoals: data.secondaryGoals,
        secondaryGoalsSpecify: data.secondaryGoalsSpecify,
        dietaryPreference: data.dietaryPreference,
        dietaryPreferenceSpecify: data.dietaryPreferenceSpecify,
        userFoodRestrictions: data.foodRestrictions,
        foodRestrictionsSpecify: data.foodRestrictionsSpecify,
        religiousRestrictions: data.religiousRestrictions,
        religiousRestrictionsSpecify: data.religiousRestrictionsSpecify,
        medicalConditions: data.medicalConditions?.map((c) => c.name),
        medicalConditionSpecify: data.medicalConditions?.find((c) => c.specify)?.specify,
        diabetesType: data.medicalConditions?.find((c) => c.diabetesType)?.diabetesType,
        allergies: data.allergies?.map((a) => a.name),
        allergySpecify: data.allergies?.find((a) => a.specify)?.specify,
        intolerances: data.intolerances?.map((i) => i.name),
        intoleranceSpecify: data.intolerances?.find((i) => i.specify)?.specify,
        budgetAmount: 150,
        budgetPeriod: 'daily',
        peopleCount: 1,
      });

      // Clear pending cache since it was saved successfully
      try {
        localStorage.removeItem(`nutrilens_pending_signup_${cleanEmail}`);
      } catch {}
    }

    // Fetch the final confirmed profile from Supabase
    const { data: finalProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    return {
      success: true,
      user: createdUser,
      session: authData.session,
      profile: (finalProfile as Profile) || undefined,
      emailConfirmationRequired,
    };
  } catch (err: any) {
    console.error('Registration persistence error:', err);
    return { success: false, error: err?.message || 'Database registration failed.' };
  }
}
