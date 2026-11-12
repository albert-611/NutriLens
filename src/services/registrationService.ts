import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type {
  ComprehensiveSignupData,
  Profile,
} from '../contracts';
import { ensureProfileExists } from './authService';

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
  data: ComprehensiveSignupData
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
    // 1. Create Supabase Auth User
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: cleanEmail,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName.trim(),
          username: usernameClean,
        },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (authErr) {
      return { success: false, error: authErr.message };
    }

    if (!authData.user) {
      return { success: false, error: 'User registration failed to create an account.' };
    }

    const createdUser = authData.user;
    const userId = createdUser.id;

    // Check if email confirmation is required (user has no session yet)
    const emailConfirmationRequired = !authData.session && !createdUser.confirmed_at;

    // Ensure base profile exists in PostgreSQL
    await ensureProfileExists(userId, data.fullName.trim());

    // 2. Update Profiles table with full anthropometric and lifestyle data
    const nowIso = new Date().toISOString();

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

    const profileUpdates: Record<string, any> = {
      username: usernameClean,
      full_name: data.fullName.trim(),
      display_name: data.fullName.trim(),
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
      budget_amount: 150,
      budget_duration_days: 1,
      household_size: 1,
      declared_allergens: data.allergies?.filter((a) => a.name !== 'None').map((a) => a.name) || [],
      dietary_exclusions: data.foodRestrictions?.filter((r) => r !== 'None') || [],
      health_data_consent: data.healthDataConsent,
      health_data_consent_at: data.healthDataConsent ? nowIso : null,
      terms_accepted_at: nowIso,
      terms_version: '1.0',
      onboarding_status: 'ONBOARDING_COMPLETED',
      avatar_url: data.avatarUrl || null,
      onboarding_completed: true,
      updated_at: nowIso,
    };

    const { error: profileUpdateErr } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', userId);

    if (profileUpdateErr) {
      console.warn('Profile update notice:', profileUpdateErr);
    }

    // 3. Persist Medical Conditions if consented/provided
    if (data.medicalConditions && data.medicalConditions.length > 0) {
      const medicalRows = data.medicalConditions
        .filter((c) => c.name && c.name !== 'None')
        .map((c) => {
          let diabetesCode: string | null = null;
          if (c.diabetesType) {
            const dLower = String(c.diabetesType).toLowerCase();
            if (dLower.includes('type 1') || dLower.includes('type_1')) diabetesCode = 'type_1';
            else if (dLower.includes('type 2') || dLower.includes('type_2')) diabetesCode = 'type_2';
            else if (dLower.includes('gest')) diabetesCode = 'gestational';
            else if (dLower.includes('prediabet')) diabetesCode = 'prediabetes';
            else if (dLower.includes('other')) diabetesCode = 'other';
            else diabetesCode = 'not_sure';
          }
          return {
            user_id: userId,
            condition_name: c.name,
            condition_specify: c.specify || null,
            diabetes_type: c.name.toLowerCase().includes('diabetes') ? diabetesCode : null,
          };
        });

      if (medicalRows.length > 0) {
        await supabase.from('user_medical_conditions').insert(medicalRows);
      }
    }

    // 4. Persist Food Allergies (Strictly separated from intolerances)
    if (data.allergies && data.allergies.length > 0) {
      const allergyRows = data.allergies
        .filter((a) => a.name !== 'None')
        .map((a) => ({
          user_id: userId,
          allergy_name: a.name,
          allergy_specify: a.specify || null,
        }));

      if (allergyRows.length > 0) {
        await supabase.from('user_food_allergies').insert(allergyRows);
      }
    }

    // 5. Persist Food Intolerances (Strictly separated from allergies)
    if (data.intolerances && data.intolerances.length > 0) {
      const intoleranceRows = data.intolerances
        .filter((i) => i.name !== 'None')
        .map((i) => ({
          user_id: userId,
          intolerance_name: i.name,
          intolerance_specify: i.specify || null,
        }));

      if (intoleranceRows.length > 0) {
        await supabase.from('user_food_intolerances').insert(intoleranceRows);
      }
    }

    // 6. Persist Detailed Dietary Preferences
    const prefRows: any[] = [];
    if (data.dietaryPreference) {
      prefRows.push({
        user_id: userId,
        preference_type: 'dietary_preference',
        preference_name: data.dietaryPreference,
        preference_specify: data.dietaryPreferenceSpecify || null,
      });
    }

    if (data.foodRestrictions && data.foodRestrictions.length > 0) {
      data.foodRestrictions
        .filter((r) => r !== 'None')
        .forEach((r) => {
          prefRows.push({
            user_id: userId,
            preference_type: 'food_restriction',
            preference_name: r,
            preference_specify: r === 'Other' ? data.foodRestrictionsSpecify : null,
          });
        });
    }

    if (data.religiousRestrictions && data.religiousRestrictions.length > 0) {
      data.religiousRestrictions
        .filter((r) => r !== 'None' && r !== 'Prefer not to say')
        .forEach((r) => {
          prefRows.push({
            user_id: userId,
            preference_type: 'religious_cultural',
            preference_name: r,
            preference_specify: r === 'Other' ? data.religiousRestrictionsSpecify : null,
          });
        });
    }

    if (prefRows.length > 0) {
      await supabase.from('user_dietary_preferences_detailed').insert(prefRows);
    }

    // 7. Persist Detailed Nutritional Goals
    const goalRows: any[] = [];
    if (data.primaryGoal) {
      goalRows.push({
        user_id: userId,
        goal_type: 'primary',
        goal_name: data.primaryGoal,
        goal_specify: data.primaryGoalSpecify || null,
      });
    }

    if (data.secondaryGoals && data.secondaryGoals.length > 0) {
      data.secondaryGoals.forEach((g) => {
        goalRows.push({
          user_id: userId,
          goal_type: 'secondary',
          goal_name: g,
          goal_specify: g === 'Other' ? data.secondaryGoalsSpecify : null,
        });
      });
    }

    if (goalRows.length > 0) {
      await supabase.from('user_nutritional_goals_detailed').insert(goalRows);
    }

    // 8. Upsert user_nutrition_preferences and user_budget_preferences
    try {
      let normalizedPattern = 'no_preference';
      const patLower = String(data.dietaryPreference || '').toLowerCase();
      if (patLower.includes('vegetarian') && !patLower.includes('non')) normalizedPattern = 'vegetarian';
      else if (patLower.includes('vegan')) normalizedPattern = 'vegan';
      else if (patLower.includes('pescatarian')) normalizedPattern = 'pescatarian';
      else if (patLower.includes('halal')) normalizedPattern = 'halal';

      await supabase.from('user_nutrition_preferences').upsert({
        user_id: userId,
        primary_goal: safeGoal,
        secondary_goals: data.secondaryGoals || [],
        dietary_pattern: normalizedPattern,
        updated_at: nowIso,
      }, { onConflict: 'user_id' });

      await supabase.from('user_budget_preferences').upsert({
        user_id: userId,
        budget_amount: 150,
        budget_period: 'daily',
        people_count: 1,
        currency: 'BDT',
        updated_at: nowIso,
      }, { onConflict: 'user_id' });

      // 9. Sync user_food_restrictions for complete legacy compatibility
      const legacyRestrictions: any[] = [
        ...(data.allergies || []).filter((a) => a.name && a.name !== 'None').map((a) => ({
          user_id: userId,
          restriction_type: 'allergy',
          restriction_value: a.name,
          notes: a.specify || null,
        })),
        ...(data.intolerances || []).filter((i) => i.name && i.name !== 'None').map((i) => ({
          user_id: userId,
          restriction_type: 'intolerance',
          restriction_value: i.name,
          notes: i.specify || null,
        })),
        ...(data.religiousRestrictions || []).filter((r) => r && r !== 'None' && r !== 'Prefer not to say').map((r) => ({
          user_id: userId,
          restriction_type: 'religious_exclusion',
          restriction_value: r,
          notes: data.religiousRestrictionsSpecify || null,
        })),
        ...(data.foodRestrictions || []).filter((r) => r && r !== 'None').map((r) => ({
          user_id: userId,
          restriction_type: 'ingredient_avoidance',
          restriction_value: r,
          notes: data.foodRestrictionsSpecify || null,
        })),
      ];
      if (legacyRestrictions.length > 0) {
        await supabase.from('user_food_restrictions').insert(legacyRestrictions);
      }
    } catch (e) {
      console.warn('Preferences upsert notice:', e);
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
