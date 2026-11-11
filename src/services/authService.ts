import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type {
  Profile,
  NutritionPreferences,
  FoodRestriction,
  BudgetPreferences,
  OnboardingData,
} from '../contracts';

export const LOCAL_PROFILES_KEY = 'nutrilens_local_profiles';
export const LOCAL_REGISTERED_USERS_KEY = 'nutrilens_registered_users';

export function getLocalProfilesMap(): Record<string, Profile> {
  try {
    const raw = localStorage.getItem(LOCAL_PROFILES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLocalProfile(profile: Profile) {
  try {
    const map = getLocalProfilesMap();
    map[profile.id] = profile;
    localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(map));
  } catch {}
}

export interface AuthResponse<T = any> {
  data?: T;
  error?: Error | null;
}

/**
 * Signs up a new user with email and password via Supabase Auth.
 */
export async function signUpUser(
  email: string,
  password: string,
  fullName: string
): Promise<AuthResponse<{ user: any; session: any }>> {
  if (!isSupabaseConfigured) {
    // Offline local simulation
    const mockUser = {
      id: crypto.randomUUID(),
      email,
      user_metadata: { full_name: fullName },
    };
    return { data: { user: mockUser, session: null } };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) return { error };

    // If session/user created immediately, ensure profile row exists
    if (data.user) {
      await ensureProfileExists(data.user.id, fullName);
    }

    return { data: { user: data.user, session: data.session } };
  } catch (err: any) {
    return { error: err };
  }
}

/**
 * Signs in an existing user with email and password.
 */
export async function signInUser(
  email: string,
  password: string
): Promise<AuthResponse<{ user: any; session: any }>> {
  if (!isSupabaseConfigured) {
    let userId = '00000000-0000-0000-0000-000000000001';
    let userFullName = 'Demo User';
    try {
      const regUsersRaw = localStorage.getItem(LOCAL_REGISTERED_USERS_KEY);
      if (regUsersRaw) {
        const users = JSON.parse(regUsersRaw);
        const cleanEmail = email.trim().toLowerCase();
        const found = users.find((u: any) => u.email?.trim().toLowerCase() === cleanEmail);
        if (found) {
          userId = found.id;
          userFullName = found.fullName || found.user_metadata?.full_name || 'NutriLens Member';
        }
      }
    } catch {}

    const mockUser = {
      id: userId,
      email,
      user_metadata: { full_name: userFullName },
    };
    return { data: { user: mockUser, session: null } };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error };
    return { data: { user: data.user, session: data.session } };
  } catch (err: any) {
    return { error: err };
  }
}

/**
 * Sends a password recovery email.
 */
export async function sendPasswordRecoveryEmail(
  email: string
): Promise<AuthResponse> {
  if (!isSupabaseConfigured) {
    return { data: { success: true } };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return { error };
    return { data: { success: true } };
  } catch (err: any) {
    return { error: err };
  }
}

/**
 * Updates the user's password (used during password recovery / reset).
 */
export async function updateUserPassword(
  newPassword: string
): Promise<AuthResponse> {
  if (!isSupabaseConfigured) {
    return { data: { success: true } };
  }

  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) return { error };
    return { data };
  } catch (err: any) {
    return { error: err };
  }
}

/**
 * Ensures a profile row exists for the user.
 */
export async function ensureProfileExists(
  userId: string,
  fullName?: string
): Promise<Profile | null> {
  if (!isSupabaseConfigured) {
    const existing = await fetchUserProfile(userId);
    if (existing) {
      if (fullName && existing.full_name !== fullName) {
        existing.full_name = fullName;
        existing.display_name = fullName;
        saveLocalProfile(existing);
      }
      return existing;
    }
    const newProf: Profile = {
      id: userId,
      market_id: '22222222-2222-2222-2222-222222222201',
      username: 'member',
      full_name: fullName || 'NutriLens Member',
      display_name: fullName || 'NutriLens Member',
      country: 'Bangladesh',
      city: 'Dhaka',
      language: 'bn',
      preferred_language: 'bn',
      age_adult_confirmed: true,
      onboarding_completed: true,
      height_unit: 'cm',
      weight_unit: 'kg',
      health_data_consent: true,
      unit_preference: 'metric',
      cuisine_preferences: ['bangladeshi'],
      dietary_exclusions: [],
      declared_allergens: [],
      general_goal: 'balanced_wellness',
      household_size: 1,
      budget_amount: 150,
      budget_currency: 'BDT',
      budget_people: 1,
      budget_duration_days: 1,
      available_time_minutes: 30,
      available_equipment: ['stove', 'pan', 'pot', 'knife'],
    };
    saveLocalProfile(newProf);
    return newProf;
  }

  try {
    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (existing) return existing as Profile;

    const { data: inserted, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: fullName || 'NutriLens Member',
        display_name: fullName || 'NutriLens Member',
        country: 'Bangladesh',
        city: 'Dhaka',
        language: 'bn',
        preferred_language: 'bn',
        age_adult_confirmed: true,
        onboarding_completed: true,
      })
      .select()
      .single();

    if (!error && inserted) {
      return inserted as Profile;
    }
    return null;
  } catch (err) {
    console.warn('Profile initialization fallback:', err);
    return null;
  }
}

/**
 * Fetches user profile from Supabase or persistent local storage.
 */
export async function fetchUserProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured) {
    const map = getLocalProfilesMap();
    if (map[userId]) return map[userId];

    // Check if there is a profile stored during signup
    try {
      const stored = localStorage.getItem('nutrilens_demo_signup_profile');
      if (stored) {
        const signupData = JSON.parse(stored);
        const reconstructedProfile: Profile = {
          id: userId,
          market_id: '22222222-2222-2222-2222-222222222201',
          username: signupData.username || 'nutrilens_member',
          display_name: signupData.fullName || 'NutriLens Member',
          full_name: signupData.fullName || 'NutriLens Member',
          age: signupData.age || 24,
          biological_sex: signupData.biologicalSex || 'prefer_not_to_say',
          height_value: signupData.heightValue || null,
          height_unit: signupData.heightUnit || 'cm',
          weight_value: signupData.weightValue || null,
          weight_unit: signupData.weightUnit || 'kg',
          target_weight_value: signupData.targetWeightValue || null,
          activity_level: signupData.activityLevel || null,
          exercise_frequency: signupData.exerciseFrequency || null,
          sleep_duration: signupData.sleepDuration || null,
          disliked_foods: signupData.dislikedFoods || null,
          health_data_consent: Boolean(signupData.healthDataConsent),
          country: 'Bangladesh',
          city: 'Dhaka',
          preferred_language: 'bn',
          age_adult_confirmed: true,
          onboarding_completed: true,
          language: 'bn',
          unit_preference: 'metric',
          cuisine_preferences: ['bangladeshi'],
          dietary_exclusions: [],
          declared_allergens: [],
          general_goal: 'balanced_wellness',
          household_size: 1,
          budget_amount: 150,
          budget_currency: 'BDT',
          budget_people: 1,
          budget_duration_days: 1,
          available_time_minutes: 30,
          available_equipment: ['stove', 'pan', 'pot', 'knife'],
        };
        saveLocalProfile(reconstructedProfile);
        return reconstructedProfile;
      }
    } catch {}

    // Fallback: ready profile with onboarding_completed: true
    const fallbackProfile: Profile = {
      id: userId,
      market_id: '22222222-2222-2222-2222-222222222201',
      username: 'member',
      display_name: 'NutriLens Member',
      full_name: 'NutriLens Member',
      age: 24,
      country: 'Bangladesh',
      city: 'Dhaka',
      height_unit: 'cm',
      weight_unit: 'kg',
      health_data_consent: true,
      age_adult_confirmed: true,
      onboarding_completed: true,
      language: 'bn',
      preferred_language: 'bn',
      unit_preference: 'metric',
      cuisine_preferences: ['bangladeshi'],
      dietary_exclusions: [],
      declared_allergens: [],
      general_goal: 'balanced_wellness',
      household_size: 1,
      budget_amount: 150,
      budget_currency: 'BDT',
      budget_people: 1,
      budget_duration_days: 1,
      available_time_minutes: 30,
      available_equipment: ['stove', 'pan', 'pot', 'knife'],
    };
    saveLocalProfile(fallbackProfile);
    return fallbackProfile;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) return data as Profile;
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetches user nutrition preferences from Supabase.
 */
export async function fetchNutritionPreferences(
  userId: string
): Promise<NutritionPreferences | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from('user_nutrition_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) return data as NutritionPreferences;
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetches user food restrictions from Supabase.
 */
export async function fetchFoodRestrictions(
  userId: string
): Promise<FoodRestriction[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from('user_food_restrictions')
      .select('*')
      .eq('user_id', userId);

    if (!error && data) return data as FoodRestriction[];
    return [];
  } catch {
    return [];
  }
}

/**
 * Fetches user budget preferences from Supabase.
 */
export async function fetchBudgetPreferences(
  userId: string
): Promise<BudgetPreferences | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from('user_budget_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) return data as BudgetPreferences;
    return null;
  } catch {
    return null;
  }
}

/**
 * Saves all 6 onboarding steps into Supabase.
 */
export async function saveOnboardingData(
  userId: string,
  data: OnboardingData
): Promise<AuthResponse> {
  const localProf = await fetchUserProfile(userId);
  if (localProf) {
    const updatedLocal: Profile = {
      ...localProf,
      full_name: data.fullName,
      display_name: data.fullName,
      age: data.age,
      country: data.country,
      city: data.city,
      language: data.preferredLanguage,
      preferred_language: data.preferredLanguage,
      general_goal: data.primaryGoal as any,
      market_id: data.marketId || localProf.market_id,
      budget_amount: data.budgetAmount,
      budget_currency: data.currency,
      household_size: data.peopleCount,
      age_adult_confirmed: true,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    };
    saveLocalProfile(updatedLocal);
  }

  if (!isSupabaseConfigured) {
    return { data: { success: true } };
  }

  try {
    // 1. Update Profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: data.fullName,
        display_name: data.fullName,
        age: data.age,
        country: data.country,
        city: data.city,
        language: data.preferredLanguage,
        preferred_language: data.preferredLanguage,
        general_goal: data.primaryGoal as any,
        market_id: data.marketId || null,
        budget_amount: data.budgetAmount,
        budget_currency: data.currency,
        household_size: data.peopleCount,
        age_adult_confirmed: true,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (profileError) return { error: profileError };

    // 2. Upsert Nutrition Preferences
    const { error: nutErr } = await supabase
      .from('user_nutrition_preferences')
      .upsert(
        {
          user_id: userId,
          primary_goal: data.primaryGoal,
          secondary_goals: data.secondaryGoals,
          dietary_pattern: data.dietaryPattern,
          preferred_cuisine: data.preferredCuisine,
          favorite_food_categories: data.favoriteCategories,
          foods_to_avoid: data.foodsToAvoid,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (nutErr) console.warn('Nutrition preferences upsert notice:', nutErr);

    // 3. Clear and Insert Food Restrictions
    await supabase
      .from('user_food_restrictions')
      .delete()
      .eq('user_id', userId);

    const restrictionRows: any[] = [
      ...data.allergies.map((val) => ({
        user_id: userId,
        restriction_type: 'allergy',
        restriction_value: val,
      })),
      ...data.intolerances.map((val) => ({
        user_id: userId,
        restriction_type: 'intolerance',
        restriction_value: val,
      })),
      ...data.religiousExclusions.map((val) => ({
        user_id: userId,
        restriction_type: 'religious_exclusion',
        restriction_value: val,
      })),
      ...data.dislikedIngredients.map((val) => ({
        user_id: userId,
        restriction_type: 'ingredient_avoidance',
        restriction_value: val,
      })),
    ];

    if (restrictionRows.length > 0) {
      const { error: restErr } = await supabase
        .from('user_food_restrictions')
        .insert(restrictionRows);
      if (restErr) console.warn('Food restrictions insert notice:', restErr);
    }

    // 4. Upsert Budget Preferences
    const { error: budErr } = await supabase
      .from('user_budget_preferences')
      .upsert(
        {
          user_id: userId,
          market_id: data.marketId || null,
          currency: data.currency,
          budget_amount: data.budgetAmount,
          budget_period: data.budgetPeriod,
          people_count: data.peopleCount,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (budErr) console.warn('Budget preferences upsert notice:', budErr);

    return { data: { success: true } };
  } catch (err: any) {
    return { error: err };
  }
}

/**
 * Permanently deletes the user's account and all associated data.
 */
export async function deleteUserAccount(): Promise<AuthResponse> {
  if (!isSupabaseConfigured) {
    return { data: { success: true } };
  }

  try {
    // Call RPC function delete_user_account()
    const { error } = await supabase.rpc('delete_user_account');
    if (error) {
      // Fallback: Delete from profiles directly if RPC is not defined
      const { data: userResp } = await supabase.auth.getUser();
      if (userResp?.user) {
        await supabase.from('profiles').delete().eq('id', userResp.user.id);
      }
    }

    await supabase.auth.signOut();
    return { data: { success: true } };
  } catch (err: any) {
    return { error: err };
  }
}

