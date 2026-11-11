import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type {
  ComprehensiveSignupData,
  MedicalConditionItem,
  AllergyItem,
  IntoleranceItem,
  DetailedPreferenceItem,
  DetailedGoalItem,
  Profile,
} from '../contracts';
import {
  ensureProfileExists,
  saveLocalProfile,
  LOCAL_REGISTERED_USERS_KEY,
} from './authService';

export interface RegistrationResult {
  success: boolean;
  user?: any;
  profile?: Profile;
  error?: string;
}

/**
 * Checks if a username is available.
 */
export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const clean = username.trim().toLowerCase();
  if (!clean || clean.length < 3) return false;

  if (!isSupabaseConfigured) {
    // Offline simulation check
    return !['admin', 'root', 'tariqul', 'nasima', 'tanvir'].includes(clean);
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', clean)
      .maybeSingle();

    if (error) {
      console.warn('Username check notice:', error);
      return true; // Don't block user if query fails
    }

    return !data; // Available if no profile found
  } catch (err) {
    console.warn('Username availability fallback:', err);
    return true;
  }
}

/**
 * Registers an account and persists the full 7-step nutrition profile.
 */
export async function registerComprehensiveAccount(
  data: ComprehensiveSignupData
): Promise<RegistrationResult> {
  // Pre-validate username format and length
  const usernameClean = data.username.trim().toLowerCase();
  if (!usernameClean || usernameClean.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters.' };
  }

  // Pre-validate username uniqueness
  const isAvailable = await checkUsernameAvailable(usernameClean);
  if (!isAvailable) {
    return {
      success: false,
      error: `Username "${data.username}" is already taken. Please choose another.`,
    };
  }

  let createdUser: any = null;

  if (isSupabaseConfigured) {
    try {
      // 1. Create Supabase Auth User
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: data.email.trim(),
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
        return { success: false, error: 'User registration failed to return an account.' };
      }

      createdUser = authData.user;
      const userId = createdUser.id;

      // Ensure base profile exists
      await ensureProfileExists(userId, data.fullName);

      // 2. Update Profiles table with full anthropometric and lifestyle data
      const nowIso = new Date().toISOString();
      const profileUpdates: Partial<Profile> = {
        username: usernameClean,
        full_name: data.fullName.trim(),
        display_name: data.fullName.trim(),
        age: data.age,
        biological_sex: data.biologicalSex as any,
        height_value: data.heightValue || null,
        height_unit: data.heightUnit,
        weight_value: data.weightValue || null,
        weight_unit: data.weightUnit,
        target_weight_value: data.targetWeightValue || null,
        activity_level: data.activityLevel as any,
        exercise_frequency: data.exerciseFrequency as any,
        sleep_duration: data.sleepDuration as any,
        disliked_foods: data.dislikedFoods || null,
        health_data_consent: data.healthDataConsent,
        health_data_consent_at: data.healthDataConsent ? nowIso : null,
        terms_accepted_at: nowIso,
        terms_version: '1.0',
        onboarding_status: 'ONBOARDING_COMPLETED',
        avatar_url: data.avatarUrl || null,
        onboarding_completed: true,
        updated_at: nowIso,
      };

      await supabase.from('profiles').update(profileUpdates).eq('id', userId);

      // 3. Persist Medical Conditions if consented/provided
      if (data.medicalConditions && data.medicalConditions.length > 0) {
        const medicalRows = data.medicalConditions
          .filter((c) => c.name !== 'None')
          .map((c) => ({
            user_id: userId,
            condition_name: c.name,
            condition_specify: c.specify || null,
            diabetes_type: c.diabetesType || null,
          }));

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

      const completeProfile: Profile = {
        id: userId,
        market_id: '22222222-2222-2222-2222-222222222201',
        username: usernameClean,
        full_name: data.fullName.trim(),
        display_name: data.fullName.trim(),
        age: data.age,
        biological_sex: data.biologicalSex as any,
        height_value: data.heightValue || null,
        height_unit: data.heightUnit,
        weight_value: data.weightValue || null,
        weight_unit: data.weightUnit,
        target_weight_value: data.targetWeightValue || null,
        activity_level: data.activityLevel as any,
        exercise_frequency: data.exerciseFrequency as any,
        sleep_duration: data.sleepDuration as any,
        disliked_foods: data.dislikedFoods || null,
        health_data_consent: data.healthDataConsent,
        health_data_consent_at: data.healthDataConsent ? nowIso : null,
        terms_accepted_at: nowIso,
        terms_version: '1.0',
        onboarding_status: 'ONBOARDING_COMPLETED',
        avatar_url: data.avatarUrl || null,
        age_adult_confirmed: true,
        onboarding_completed: true,
        country: 'Bangladesh',
        city: 'Dhaka',
        language: 'bn',
        preferred_language: 'bn',
        unit_preference: 'metric',
        cuisine_preferences: ['bangladeshi'],
        dietary_exclusions: data.foodRestrictions || [],
        declared_allergens: data.allergies?.map((a) => a.name) || [],
        general_goal: (data.primaryGoal as any) || 'balanced_wellness',
        household_size: 1,
        budget_amount: 150,
        budget_currency: 'BDT',
        budget_people: 1,
        budget_duration_days: 1,
        available_time_minutes: 30,
        available_equipment: ['stove', 'pan', 'pot', 'knife'],
        created_at: nowIso,
        updated_at: nowIso,
      };

      saveLocalProfile(completeProfile);

      return { success: true, user: createdUser, profile: completeProfile };
    } catch (err: any) {
      console.error('Registration persistence error:', err);
      return { success: false, error: err?.message || 'Database registration failed.' };
    }
  } else {
    // Offline / Demo fallback
    const mockUserId = crypto.randomUUID();
    createdUser = {
      id: mockUserId,
      email: data.email.trim(),
      user_metadata: { full_name: data.fullName.trim(), username: usernameClean },
    };

    const completeProfile: Profile = {
      id: mockUserId,
      market_id: '22222222-2222-2222-2222-222222222201',
      username: usernameClean,
      full_name: data.fullName.trim(),
      display_name: data.fullName.trim(),
      age: data.age,
      biological_sex: data.biologicalSex as any,
      height_value: data.heightValue || null,
      height_unit: data.heightUnit,
      weight_value: data.weightValue || null,
      weight_unit: data.weightUnit,
      target_weight_value: data.targetWeightValue || null,
      activity_level: data.activityLevel as any,
      exercise_frequency: data.exerciseFrequency as any,
      sleep_duration: data.sleepDuration as any,
      disliked_foods: data.dislikedFoods || null,
      health_data_consent: data.healthDataConsent,
      health_data_consent_at: data.healthDataConsent ? new Date().toISOString() : null,
      terms_accepted_at: new Date().toISOString(),
      terms_version: '1.0',
      onboarding_status: 'ONBOARDING_COMPLETED',
      avatar_url: data.avatarUrl || null,
      age_adult_confirmed: true,
      onboarding_completed: true,
      country: 'Bangladesh',
      city: 'Dhaka',
      language: 'bn',
      preferred_language: 'bn',
      unit_preference: 'metric',
      cuisine_preferences: ['bangladeshi'],
      dietary_exclusions: data.foodRestrictions || [],
      declared_allergens: data.allergies?.map((a) => a.name) || [],
      general_goal: (data.primaryGoal as any) || 'balanced_wellness',
      household_size: 1,
      budget_amount: 150,
      budget_currency: 'BDT',
      budget_people: 1,
      budget_duration_days: 1,
      available_time_minutes: 30,
      available_equipment: ['stove', 'pan', 'pot', 'knife'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Store in local storage for session simulation
    try {
      localStorage.setItem('nutrilens_demo_signup_profile', JSON.stringify(data));
      saveLocalProfile(completeProfile);

      // Register into registered users list for login lookup
      const existingRaw = localStorage.getItem(LOCAL_REGISTERED_USERS_KEY);
      const userList = existingRaw ? JSON.parse(existingRaw) : [];
      userList.push({
        id: mockUserId,
        email: data.email.trim(),
        fullName: data.fullName.trim(),
        username: usernameClean,
        user_metadata: { full_name: data.fullName.trim(), username: usernameClean },
      });
      localStorage.setItem(LOCAL_REGISTERED_USERS_KEY, JSON.stringify(userList));
    } catch {}

    return { success: true, user: createdUser, profile: completeProfile };
  }
}

/**
 * Retrieves the complete nutrition profile for an authenticated user.
 */
export async function fetchFullNutritionProfile(userId: string) {
  if (!isSupabaseConfigured) {
    try {
      const stored = localStorage.getItem('nutrilens_demo_signup_profile');
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  }

  try {
    const [profileRes, medRes, allRes, intRes, prefRes, goalRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('user_medical_conditions').select('*').eq('user_id', userId),
      supabase.from('user_food_allergies').select('*').eq('user_id', userId),
      supabase.from('user_food_intolerances').select('*').eq('user_id', userId),
      supabase.from('user_dietary_preferences_detailed').select('*').eq('user_id', userId),
      supabase.from('user_nutritional_goals_detailed').select('*').eq('user_id', userId),
    ]);

    return {
      profile: profileRes.data,
      medicalConditions: medRes.data || [],
      allergies: allRes.data || [],
      intolerances: intRes.data || [],
      dietaryPreferences: prefRes.data || [],
      goals: goalRes.data || [],
    };
  } catch (err) {
    console.error('Error fetching full nutrition profile:', err);
    return null;
  }
}

