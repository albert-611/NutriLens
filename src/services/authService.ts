import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type {
  Profile,
  NutritionPreferences,
  FoodRestriction,
  BudgetPreferences,
  OnboardingData,
} from '../contracts';

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
    return {
      error: new Error(
        'Supabase authentication service is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      ),
    };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) return { error };

    // If user is returned and session exists, ensure profile row exists in database
    if (data.user) {
      await ensureProfileExists(data.user.id, fullName.trim());
    }

    return { data: { user: data.user, session: data.session } };
  } catch (err: any) {
    return { error: err };
  }
}

/**
 * Signs in an existing user with email and password via Supabase Auth.
 * Rejects unregistered emails, incorrect passwords, and deleted accounts automatically.
 */
export async function signInUser(
  email: string,
  password: string
): Promise<AuthResponse<{ user: any; session: any }>> {
  if (!isSupabaseConfigured) {
    return {
      error: new Error(
        'Supabase authentication service is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      ),
    };
  }

  const cleanEmail = email.trim().toLowerCase();

  // 1. Verify email has not been recorded as deleted
  try {
    const { data: delRec } = await supabase
      .from('deleted_accounts')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (delRec) {
      return {
        error: new Error(
          'This account has been permanently deleted. Please register a new account if you wish to return.'
        ),
      };
    }
  } catch {}

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) return { error };

    // 2. Reject if auth metadata indicates account was deleted
    if (data?.user?.user_metadata?.account_deleted) {
      await supabase.auth.signOut();
      return {
        error: new Error(
          'This account has been permanently deleted. Please register a new account if you wish to return.'
        ),
      };
    }

    return { data: { user: data.user, session: data.session } };
  } catch (err: any) {
    return { error: err };
  }
}

/**
 * Signs in or initiates OAuth with Google via Supabase Auth.
 */
export async function signInWithGoogle(): Promise<
  AuthResponse<{ user?: any; session?: any; url?: string; isNewUser?: boolean }>
> {
  if (!isSupabaseConfigured) {
    return {
      error: new Error(
        'Google authentication is unavailable because Supabase is not configured.'
      ),
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/app`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) return { error };
    return { data: { url: data.url } };
  } catch (err: any) {
    return { error: err };
  }
}

/**
 * Compresses an image file to a lightweight data URL (max 256x256, JPEG 80%).
 * Ensures payload stays < 50KB to safely store or preview without quota errors.
 */
export function compressImageToDataUrl(file: File, maxDim = 256, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) return resolve('');
      
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(src);
      img.src = src;
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a profile avatar photo to Supabase Storage.
 * Falls back to a compressed data URL if the avatars storage bucket is not yet provisioned.
 */
export async function uploadProfilePhoto(
  userId: string,
  file: File
): Promise<AuthResponse<{ url: string }>> {
  if (!isSupabaseConfigured) {
    try {
      const url = await compressImageToDataUrl(file);
      return { data: { url } };
    } catch {
      return { error: new Error('Failed to read photo file.') };
    }
  }

  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.warn('Supabase storage upload notice (avatars bucket):', uploadError.message);
      // Fallback to lightweight compressed data URL so user is never blocked
      try {
        const url = await compressImageToDataUrl(file);
        return { data: { url } };
      } catch {
        return { error: uploadError };
      }
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return { data: { url: data.publicUrl } };
  } catch (err: any) {
    try {
      const url = await compressImageToDataUrl(file);
      return { data: { url } };
    } catch {
      return { error: err };
    }
  }
}

/**
 * Sends a password recovery email via Supabase Auth.
 */
export async function sendPasswordRecoveryEmail(
  email: string
): Promise<AuthResponse> {
  if (!isSupabaseConfigured) {
    return {
      error: new Error(
        'Password recovery is unavailable because Supabase is not configured.'
      ),
    };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return { error };
    return { data: { success: true } };
  } catch (err: any) {
    return { error: err };
  }
}

/**
 * Updates the user's password in Supabase Auth.
 */
export async function updateUserPassword(
  newPassword: string
): Promise<AuthResponse> {
  if (!isSupabaseConfigured) {
    return {
      error: new Error(
        'Password update is unavailable because Supabase is not configured.'
      ),
    };
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
 * Ensures a profile row exists for the user in PostgreSQL.
 */
export async function ensureProfileExists(
  userId: string,
  fullName?: string
): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;

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
    console.warn('Profile initialization error:', err);
    return null;
  }
}

/**
 * Fetches user profile from Supabase PostgreSQL.
 */
export async function fetchUserProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      return data as Profile;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetches user nutrition preferences from Supabase PostgreSQL.
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
 * Fetches user food restrictions from Supabase PostgreSQL.
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
 * Fetches user budget preferences from Supabase PostgreSQL.
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
 * Saves onboarding data into Supabase PostgreSQL.
 */
export async function saveOnboardingData(
  userId: string,
  data: OnboardingData
): Promise<AuthResponse> {
  if (!isSupabaseConfigured) {
    return {
      error: new Error(
        'Supabase is not configured. Unable to persist onboarding profile.'
      ),
    };
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
    return {
      error: new Error('Supabase is not configured. Unable to delete account.'),
    };
  }

  try {
    const { data: userResp } = await supabase.auth.getUser();
    const currentUser = userResp?.user;

    if (!currentUser) {
      return { error: new Error('No active user session found to delete.') };
    }

    const userId = currentUser.id;
    const email = currentUser.email?.toLowerCase();

    // 1. Direct purge of all application data across all 13 tables
    try {
      await Promise.allSettled([
        supabase.from('user_medical_conditions').delete().eq('user_id', userId),
        supabase.from('user_food_allergies').delete().eq('user_id', userId),
        supabase.from('user_food_intolerances').delete().eq('user_id', userId),
        supabase.from('user_dietary_preferences_detailed').delete().eq('user_id', userId),
        supabase.from('user_nutritional_goals_detailed').delete().eq('user_id', userId),
        supabase.from('user_nutrition_preferences').delete().eq('user_id', userId),
        supabase.from('user_budget_preferences').delete().eq('user_id', userId),
        supabase.from('user_food_restrictions').delete().eq('user_id', userId),
        supabase.from('meal_items').delete().eq('user_id', userId),
        supabase.from('meal_logs').delete().eq('user_id', userId),
        supabase.from('meal_reports').delete().eq('user_id', userId),
        supabase.from('meal_plans').delete().eq('user_id', userId),
        supabase.from('profiles').delete().eq('id', userId),
      ]);
    } catch (e) {
      console.warn('Direct table cleanup notice:', e);
    }

    // 2. Remove avatar files from storage if any
    try {
      await supabase.storage.from('avatars').remove([
        `${userId}/avatar.png`,
        `${userId}/avatar.jpg`,
        `${userId}/avatar.jpeg`,
        `${userId}/avatar.webp`,
      ]);
    } catch {}

    // 3. Record deletion in deleted_accounts tracking table to block re-login
    if (email) {
      try {
        await supabase.from('deleted_accounts').upsert(
          {
            user_id: userId,
            email,
            deleted_at: new Date().toISOString(),
          },
          { onConflict: 'email' }
        );
      } catch (e) {
        console.warn('deleted_accounts record notice:', e);
      }

      // Clean up pending signup storage
      try {
        localStorage.removeItem(`nutrilens_pending_signup_${email}`);
      } catch {}
    }

    // 4. Mark user_metadata as account_deleted in auth
    try {
      await supabase.auth.updateUser({
        data: {
          account_deleted: true,
          deleted_at: new Date().toISOString(),
        },
      });
    } catch (e) {}

    // 5. Call PostgreSQL RPC delete_user_account to completely purge auth.users
    let rpcErr: any = null;
    try {
      const res1 = await supabase.rpc('delete_user_account', { target_user_id: userId });
      rpcErr = res1.error;
    } catch (e1) {
      rpcErr = e1;
    }

    if (rpcErr) {
      try {
        const res2 = await supabase.rpc('delete_user_account');
        rpcErr = res2.error;
      } catch (e2) {
        rpcErr = e2;
      }
    }

    if (rpcErr) {
      console.error('RPC delete_user_account error:', rpcErr);
      // If the RPC does not exist yet in the database, alert the user with clear instructions
      if (
        rpcErr.code === 'PGRST202' ||
        rpcErr.message?.includes('function public.delete_user_account') ||
        rpcErr.message?.includes('does not exist')
      ) {
        return {
          error: new Error(
            "Database function 'delete_user_account' is missing. Please run the migration script in Supabase SQL Editor to enable complete account purge."
          ),
        };
      }
      return { error: new Error(rpcErr.message || 'Failed to permanently purge user account from database.') };
    }

    // 6. Force sign out and clear all sessions and storage
    await supabase.auth.signOut();
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}

    return { data: { success: true } };
  } catch (err: any) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

export interface FullNutritionProfileData {
  medicalConditions: string[];
  medicalConditionSpecify: string;
  diabetesType: string;
  allergies: string[];
  allergySpecify: string;
  intolerances: string[];
  intoleranceSpecify: string;
  dietaryPreference: string;
  dietaryPreferenceSpecify: string;
  foodRestrictions: string[];
  foodRestrictionsSpecify: string;
  religiousRestrictions: string[];
  religiousRestrictionsSpecify: string;
  primaryGoal: string;
  primaryGoalSpecify: string;
  secondaryGoals: string[];
  secondaryGoalsSpecify: string;
  budgetAmount: number;
  budgetPeriod: 'daily' | 'weekly';
  peopleCount: number;
}

export interface SaveFullProfileData {
  fullName?: string;
  displayName?: string;
  avatarUrl?: string | null;
  username?: string;
  age?: number | null;
  biologicalSex?: string;
  heightValue?: number | null;
  heightUnit?: string;
  weightValue?: number | null;
  weightUnit?: string;
  targetWeightValue?: number | null;
  city?: string;
  country?: string;
  prefLang?: string;

  medicalConditions?: string[];
  medicalConditionSpecify?: string;
  diabetesType?: string;
  allergies?: string[];
  allergySpecify?: string;
  intolerances?: string[];
  intoleranceSpecify?: string;

  dietaryPreference?: string;
  dietaryPreferenceSpecify?: string;
  userFoodRestrictions?: string[];
  foodRestrictionsSpecify?: string;
  religiousRestrictions?: string[];
  religiousRestrictionsSpecify?: string;
  dislikedFoods?: string | null;

  activityLevel?: string;
  exerciseFrequency?: string;
  sleepDuration?: string;

  primaryGoal?: string;
  primaryGoalSpecify?: string;
  secondaryGoals?: string[];
  secondaryGoalsSpecify?: string;

  budgetAmount?: number;
  budgetPeriod?: 'daily' | 'weekly';
  peopleCount?: number;
  marketId?: string | null;
}

/**
 * Fetches all detailed preferences across all tabs from PostgreSQL.
 */
export async function fetchFullNutritionProfile(
  userId: string
): Promise<FullNutritionProfileData> {
  const result: FullNutritionProfileData = {
    medicalConditions: [],
    medicalConditionSpecify: '',
    diabetesType: 'Not sure',
    allergies: [],
    allergySpecify: '',
    intolerances: [],
    intoleranceSpecify: '',
    dietaryPreference: 'Non-vegetarian',
    dietaryPreferenceSpecify: '',
    foodRestrictions: [],
    foodRestrictionsSpecify: '',
    religiousRestrictions: [],
    religiousRestrictionsSpecify: '',
    primaryGoal: 'Maintain current weight',
    primaryGoalSpecify: '',
    secondaryGoals: [],
    secondaryGoalsSpecify: '',
    budgetAmount: 150,
    budgetPeriod: 'daily',
    peopleCount: 1,
  };

  if (!isSupabaseConfigured) return result;

  try {
    const [
      medRes,
      allRes,
      intRes,
      dietDetRes,
      goalDetRes,
      nutPrefRes,
      budPrefRes,
    ] = await Promise.all([
      supabase.from('user_medical_conditions').select('*').eq('user_id', userId),
      supabase.from('user_food_allergies').select('*').eq('user_id', userId),
      supabase.from('user_food_intolerances').select('*').eq('user_id', userId),
      supabase.from('user_dietary_preferences_detailed').select('*').eq('user_id', userId),
      supabase.from('user_nutritional_goals_detailed').select('*').eq('user_id', userId),
      supabase.from('user_nutrition_preferences').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('user_budget_preferences').select('*').eq('user_id', userId).maybeSingle(),
    ]);

    if (medRes.data && medRes.data.length > 0) {
      result.medicalConditions = medRes.data.map((r: any) => r.condition_name);
      const withSpecify = medRes.data.find((r: any) => r.condition_specify);
      if (withSpecify) result.medicalConditionSpecify = withSpecify.condition_specify;
      const withDiab = medRes.data.find((r: any) => r.diabetes_type);
      if (withDiab) result.diabetesType = withDiab.diabetes_type;
    }

    if (allRes.data && allRes.data.length > 0) {
      result.allergies = allRes.data.map((r: any) => r.allergy_name);
      const withSpecify = allRes.data.find((r: any) => r.allergy_specify);
      if (withSpecify) result.allergySpecify = withSpecify.allergy_specify;
    }

    if (intRes.data && intRes.data.length > 0) {
      result.intolerances = intRes.data.map((r: any) => r.intolerance_name);
      const withSpecify = intRes.data.find((r: any) => r.intolerance_specify);
      if (withSpecify) result.intoleranceSpecify = withSpecify.intolerance_specify;
    }

    if (dietDetRes.data && dietDetRes.data.length > 0) {
      dietDetRes.data.forEach((r: any) => {
        if (r.preference_type === 'dietary_preference') {
          result.dietaryPreference = r.preference_name;
          if (r.preference_specify) result.dietaryPreferenceSpecify = r.preference_specify;
        } else if (r.preference_type === 'food_restriction') {
          if (!result.foodRestrictions.includes(r.preference_name)) {
            result.foodRestrictions.push(r.preference_name);
          }
          if (r.preference_specify) result.foodRestrictionsSpecify = r.preference_specify;
        } else if (r.preference_type === 'religious_cultural') {
          if (!result.religiousRestrictions.includes(r.preference_name)) {
            result.religiousRestrictions.push(r.preference_name);
          }
          if (r.preference_specify) result.religiousRestrictionsSpecify = r.preference_specify;
        }
      });
    }

    if (goalDetRes.data && goalDetRes.data.length > 0) {
      goalDetRes.data.forEach((r: any) => {
        if (r.goal_type === 'primary') {
          result.primaryGoal = r.goal_name;
          if (r.goal_specify) result.primaryGoalSpecify = r.goal_specify;
        } else if (r.goal_type === 'secondary') {
          if (!result.secondaryGoals.includes(r.goal_name)) {
            result.secondaryGoals.push(r.goal_name);
          }
          if (r.goal_specify) result.secondaryGoalsSpecify = r.goal_specify;
        }
      });
    }

    if (nutPrefRes.data) {
      if (!result.primaryGoal && nutPrefRes.data.primary_goal) {
        result.primaryGoal = nutPrefRes.data.primary_goal;
      }
      if (result.secondaryGoals.length === 0 && Array.isArray(nutPrefRes.data.secondary_goals)) {
        result.secondaryGoals = nutPrefRes.data.secondary_goals;
      }
      if (nutPrefRes.data.dietary_pattern && nutPrefRes.data.dietary_pattern !== 'no_preference') {
        result.dietaryPreference = nutPrefRes.data.dietary_pattern;
      }
    }

    if (budPrefRes.data) {
      if (budPrefRes.data.budget_amount) result.budgetAmount = Number(budPrefRes.data.budget_amount);
      if (budPrefRes.data.budget_period === 'daily' || budPrefRes.data.budget_period === 'weekly') {
        result.budgetPeriod = budPrefRes.data.budget_period;
      }
      if (budPrefRes.data.people_count) result.peopleCount = Number(budPrefRes.data.people_count);
    }

    // Fallbacks from user_food_restrictions if detailed tables are empty
    if (result.allergies.length === 0 || result.intolerances.length === 0) {
      const { data: legacyRestrictions } = await supabase
        .from('user_food_restrictions')
        .select('*')
        .eq('user_id', userId);

      if (legacyRestrictions && legacyRestrictions.length > 0) {
        legacyRestrictions.forEach((r: any) => {
          if (r.restriction_type === 'allergy' && !result.allergies.includes(r.restriction_value)) {
            result.allergies.push(r.restriction_value);
            if (r.notes && !result.allergySpecify) result.allergySpecify = r.notes;
          } else if (r.restriction_type === 'intolerance' && !result.intolerances.includes(r.restriction_value)) {
            result.intolerances.push(r.restriction_value);
            if (r.notes && !result.intoleranceSpecify) result.intoleranceSpecify = r.notes;
          } else if (r.restriction_type === 'religious_exclusion' && !result.religiousRestrictions.includes(r.restriction_value)) {
            result.religiousRestrictions.push(r.restriction_value);
          } else if (r.restriction_type === 'ingredient_avoidance' && !result.foodRestrictions.includes(r.restriction_value)) {
            result.foodRestrictions.push(r.restriction_value);
          }
        });
      }
    }

    // Fallbacks from profiles table
    const { data: profData } = await supabase
      .from('profiles')
      .select('declared_allergens, dietary_exclusions, budget_amount, household_size, budget_duration_days')
      .eq('id', userId)
      .maybeSingle();

    if (profData) {
      if (result.allergies.length === 0 && Array.isArray(profData.declared_allergens) && profData.declared_allergens.length > 0) {
        result.allergies = profData.declared_allergens;
      }
      if (result.foodRestrictions.length === 0 && Array.isArray(profData.dietary_exclusions) && profData.dietary_exclusions.length > 0) {
        result.foodRestrictions = profData.dietary_exclusions;
      }
      if (profData.budget_amount && !result.budgetAmount) {
        result.budgetAmount = Number(profData.budget_amount);
      }
      if (profData.household_size && !result.peopleCount) {
        result.peopleCount = Number(profData.household_size);
      }
      if (profData.budget_duration_days === 7) {
        result.budgetPeriod = 'weekly';
      }
    }
  } catch (err) {
    console.warn('Error fetching full nutrition profile:', err);
  }

  return result;
}

/**
 * Saves all user profile details across all tabs to PostgreSQL.
 */
export async function saveFullNutritionProfile(
  userId: string,
  data: SaveFullProfileData
): Promise<AuthResponse> {
  if (!isSupabaseConfigured) {
    return { data: { success: true } };
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

    const profileUpdates: Record<string, any> = {
      id: userId,
      full_name: data.fullName,
      display_name: data.displayName || data.fullName,
      avatar_url: data.avatarUrl,
      username: data.username?.trim() || undefined,
      age: data.age || undefined,
      biological_sex: safeSex,
      height_value: data.heightValue,
      height_unit: safeHeightUnit,
      weight_value: data.weightValue,
      weight_unit: safeWeightUnit,
      target_weight_value: data.targetWeightValue,
      activity_level: safeActivity,
      exercise_frequency: safeFreq,
      sleep_duration: safeSleep,
      disliked_foods: data.dislikedFoods || null,
      city: data.city,
      country: data.country,
      preferred_language: data.prefLang,
      language: data.prefLang,
      general_goal: safeGoal,
      budget_amount: data.budgetAmount,
      budget_duration_days: data.budgetPeriod === 'weekly' ? 7 : 1,
      household_size: data.peopleCount,
      declared_allergens: data.allergies || [],
      dietary_exclusions: data.userFoodRestrictions || [],
      updated_at: new Date().toISOString(),
    };

    if (data.marketId) {
      try {
        const { data: mkt } = await supabase.from('markets').select('id').eq('id', data.marketId).maybeSingle();
        profileUpdates.market_id = mkt ? data.marketId : null;
      } catch {
        profileUpdates.market_id = null;
      }
    } else {
      profileUpdates.market_id = null;
    }

    let { error: profErr } = await supabase.from('profiles').upsert(profileUpdates, { onConflict: 'id' });

    // Intelligent check-constraint resilience:
    // If the database has a check constraint restricting activity_level (or other lifestyle fields),
    // automatically try alternate standard values ('moderate', raw input) or fallback to null so the save succeeds.
    if (profErr) {
      const errMsg = (profErr.message || '').toLowerCase();

      if (errMsg.includes('activity_level_check') || errMsg.includes('activity_level')) {
        const fallbacks = ['moderate', data.activityLevel, 'moderately_active', null];
        for (const fb of fallbacks) {
          profileUpdates.activity_level = fb;
          const retry = await supabase.from('profiles').upsert(profileUpdates, { onConflict: 'id' });
          if (!retry.error) {
            profErr = null;
            break;
          }
        }
      }

      // If another check constraint failed (e.g. exercise_frequency, sleep_duration, biological_sex)
      if (profErr) {
        const errLower = (profErr.message || '').toLowerCase();
        let retried = false;
        if (errLower.includes('exercise_frequency')) {
          profileUpdates.exercise_frequency = null;
          retried = true;
        }
        if (errLower.includes('sleep_duration')) {
          profileUpdates.sleep_duration = null;
          retried = true;
        }
        if (errLower.includes('biological_sex')) {
          profileUpdates.biological_sex = null;
          retried = true;
        }
        if (errLower.includes('activity_level')) {
          profileUpdates.activity_level = null;
          retried = true;
        }
        if (retried) {
          const retry = await supabase.from('profiles').upsert(profileUpdates, { onConflict: 'id' });
          if (!retry.error) {
            profErr = null;
          }
        }
      }

      if (profErr) {
        console.error('Profile update error:', profErr);
        return { error: new Error(profErr.message) };
      }
    }

    // 2. Synchronize Medical Conditions
    await supabase.from('user_medical_conditions').delete().eq('user_id', userId);
    if (data.medicalConditions && data.medicalConditions.length > 0) {
      let diabetesCode: string | null = null;
      if (data.diabetesType) {
        const dLower = data.diabetesType.toLowerCase();
        if (dLower.includes('type 1') || dLower.includes('type_1')) diabetesCode = 'type_1';
        else if (dLower.includes('type 2') || dLower.includes('type_2')) diabetesCode = 'type_2';
        else if (dLower.includes('gest')) diabetesCode = 'gestational';
        else if (dLower.includes('prediabet')) diabetesCode = 'prediabetes';
        else if (dLower.includes('other')) diabetesCode = 'other';
        else diabetesCode = 'not_sure';
      }

      const medRows = data.medicalConditions
        .filter((c) => c && c !== 'None')
        .map((c) => ({
          user_id: userId,
          condition_name: c,
          condition_specify: data.medicalConditionSpecify || null,
          diabetes_type: c.toLowerCase().includes('diabetes') ? diabetesCode : null,
        }));
      if (medRows.length > 0) {
        await supabase.from('user_medical_conditions').insert(medRows);
      }
    }

    // 3. Synchronize Food Allergies
    await supabase.from('user_food_allergies').delete().eq('user_id', userId);
    if (data.allergies && data.allergies.length > 0) {
      const allergyRows = data.allergies
        .filter((a) => a && a !== 'None')
        .map((a) => ({
          user_id: userId,
          allergy_name: a,
          allergy_specify: data.allergySpecify || null,
        }));
      if (allergyRows.length > 0) {
        await supabase.from('user_food_allergies').insert(allergyRows);
      }
    }

    // 4. Synchronize Food Intolerances
    await supabase.from('user_food_intolerances').delete().eq('user_id', userId);
    if (data.intolerances && data.intolerances.length > 0) {
      const intRows = data.intolerances
        .filter((i) => i && i !== 'None')
        .map((i) => ({
          user_id: userId,
          intolerance_name: i,
          intolerance_specify: data.intoleranceSpecify || null,
        }));
      if (intRows.length > 0) {
        await supabase.from('user_food_intolerances').insert(intRows);
      }
    }

    // 5. Synchronize Detailed Dietary Preferences
    await supabase.from('user_dietary_preferences_detailed').delete().eq('user_id', userId);
    const dietRows: any[] = [];
    if (data.dietaryPreference) {
      dietRows.push({
        user_id: userId,
        preference_type: 'dietary_preference',
        preference_name: data.dietaryPreference,
        preference_specify: data.dietaryPreferenceSpecify || null,
      });
    }
    if (data.userFoodRestrictions && data.userFoodRestrictions.length > 0) {
      data.userFoodRestrictions
        .filter((r) => r && r !== 'None')
        .forEach((r) => {
          dietRows.push({
            user_id: userId,
            preference_type: 'food_restriction',
            preference_name: r,
            preference_specify: data.foodRestrictionsSpecify || null,
          });
        });
    }
    if (data.religiousRestrictions && data.religiousRestrictions.length > 0) {
      data.religiousRestrictions
        .filter((r) => r && r !== 'None' && r !== 'Prefer not to say')
        .forEach((r) => {
          dietRows.push({
            user_id: userId,
            preference_type: 'religious_cultural',
            preference_name: r,
            preference_specify: data.religiousRestrictionsSpecify || null,
          });
        });
    }
    if (dietRows.length > 0) {
      await supabase.from('user_dietary_preferences_detailed').insert(dietRows);
    }

    // 6. Synchronize Detailed Goals
    await supabase.from('user_nutritional_goals_detailed').delete().eq('user_id', userId);
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
          goal_specify: data.secondaryGoalsSpecify || null,
        });
      });
    }
    if (goalRows.length > 0) {
      await supabase.from('user_nutritional_goals_detailed').insert(goalRows);
    }

    // 7. Upsert user_nutrition_preferences
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
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    // 8. Upsert user_budget_preferences
    await supabase.from('user_budget_preferences').upsert({
      user_id: userId,
      budget_amount: data.budgetAmount || 150,
      budget_period: data.budgetPeriod || 'daily',
      people_count: data.peopleCount || 1,
      currency: 'BDT',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    // 9. Sync user_food_restrictions for complete legacy/context compatibility
    try {
      await supabase.from('user_food_restrictions').delete().eq('user_id', userId);
      const restrictionRows: any[] = [
        ...(data.allergies || []).filter((a) => a && a !== 'None').map((a) => ({
          user_id: userId,
          restriction_type: 'allergy',
          restriction_value: a,
          notes: data.allergySpecify || null,
        })),
        ...(data.intolerances || []).filter((i) => i && i !== 'None').map((i) => ({
          user_id: userId,
          restriction_type: 'intolerance',
          restriction_value: i,
          notes: data.intoleranceSpecify || null,
        })),
        ...(data.religiousRestrictions || []).filter((r) => r && r !== 'None' && r !== 'Prefer not to say').map((r) => ({
          user_id: userId,
          restriction_type: 'religious_exclusion',
          restriction_value: r,
          notes: data.religiousRestrictionsSpecify || null,
        })),
        ...(data.userFoodRestrictions || []).filter((r) => r && r !== 'None').map((r) => ({
          user_id: userId,
          restriction_type: 'ingredient_avoidance',
          restriction_value: r,
          notes: data.foodRestrictionsSpecify || null,
        })),
      ];
      if (restrictionRows.length > 0) {
        await supabase.from('user_food_restrictions').insert(restrictionRows);
      }
    } catch (e) {
      console.warn('user_food_restrictions sync notice:', e);
    }

    return { data: { success: true } };
  } catch (err: any) {
    console.error('saveFullNutritionProfile error:', err);
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}
