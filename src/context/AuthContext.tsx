import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type {
  Profile,
  NutritionPreferences,
  FoodRestriction,
  BudgetPreferences,
  OnboardingData,
} from '../contracts';
import {
  signUpUser,
  signInUser,
  signInWithGoogle as authSignInWithGoogle,
  uploadProfilePhoto,
  sendPasswordRecoveryEmail,
  updateUserPassword,
  fetchUserProfile,
  fetchNutritionPreferences,
  fetchFoodRestrictions,
  fetchBudgetPreferences,
  saveOnboardingData,
  saveFullNutritionProfile,
  deleteUserAccount,
  ensureProfileExists,
} from '../services/authService';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  nutritionPreferences: NutritionPreferences | null;
  foodRestrictions: FoodRestriction[];
  budgetPreferences: BudgetPreferences | null;
  loading: boolean;
  onboardingCompleted: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null; isNewUser?: boolean }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  setAuthenticatedUser: (user: User, profile: Profile) => void;
  uploadAvatar: (file: File) => Promise<{ url?: string; error: Error | null }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  completeOnboarding: (data: OnboardingData) => Promise<{ error: Error | null }>;
  deleteAccount: () => Promise<{ error: Error | null }>;
  refreshUserData: () => Promise<void>;
}

/**
 * Builds a valid fallback Profile object for an authenticated user.
 * Ensures the app and profile views remain functional even before database migrations are run.
 */
function buildDefaultProfile(userId: string, email?: string, metaOrName?: any): Profile {
  const meta = typeof metaOrName === 'object' && metaOrName !== null ? metaOrName : {};
  const fullName = typeof metaOrName === 'string' ? metaOrName : meta.full_name || meta.display_name;
  const name = fullName || (email ? email.split('@')[0] : 'NutriLens Member');
  const uname = meta.username || (email ? email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_') : 'member');
  const safeGoal = meta.general_goal || meta.primary_goal || 'balanced_wellness';
  const allergies = meta.declared_allergens || meta.allergies || [];
  const restrictions = meta.dietary_exclusions || meta.food_restrictions || [];

  return {
    id: userId,
    full_name: name,
    display_name: name,
    username: uname,
    age: meta.age ?? 25,
    biological_sex: meta.biological_sex || 'prefer_not_to_say',
    height_value: meta.height_value ?? 170,
    height_unit: meta.height_unit || 'cm',
    weight_value: meta.weight_value ?? 65,
    weight_unit: meta.weight_unit || 'kg',
    target_weight_value: meta.target_weight_value ?? null,
    activity_level: meta.activity_level || 'moderately_active',
    exercise_frequency: meta.exercise_frequency || '3_4_days',
    sleep_duration: meta.sleep_duration || '6_7h',
    disliked_foods: meta.disliked_foods || null,
    city: meta.city || 'Dhaka',
    country: meta.country || 'Bangladesh',
    preferred_language: meta.preferred_language || meta.language || 'bn',
    language: meta.language || meta.preferred_language || 'bn',
    unit_preference: 'metric',
    general_goal: safeGoal,
    household_size: meta.household_size || meta.people_count || 1,
    budget_amount: meta.budget_amount ?? 150,
    budget_currency: 'BDT',
    budget_people: meta.household_size || meta.people_count || 1,
    budget_duration_days: meta.budget_duration_days || (meta.budget_period === 'weekly' ? 7 : 1),
    available_time_minutes: 30,
    available_equipment: ['stove', 'pan', 'knife', 'pot'],
    market_id: meta.market_id || null,
    declared_allergens: Array.isArray(allergies) ? allergies : [],
    dietary_exclusions: Array.isArray(restrictions) ? restrictions : [],
    cuisine_preferences: ['bangladeshi'],
    health_data_consent: true,
    age_adult_confirmed: true,
    terms_accepted_at: new Date().toISOString(),
    terms_version: '1.0',
    onboarding_completed: true,
    onboarding_status: 'ONBOARDING_COMPLETED',
    avatar_url: meta.avatar_url || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [nutritionPreferences, setNutritionPreferences] = useState<NutritionPreferences | null>(null);
  const [foodRestrictions, setFoodRestrictions] = useState<FoodRestriction[]>([]);
  const [budgetPreferences, setBudgetPreferences] = useState<BudgetPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  // Stable reference to current user to prevent dependency cycle in loadUserData
  const userRef = useRef<User | null>(null);
  userRef.current = user;

  // Debounce and in-flight tracking to prevent rapid duplicate queries to Supabase
  const isLoadingUserDataRef = useRef(false);
  const lastLoadedUserIdRef = useRef<string | null>(null);
  const lastLoadTimestampRef = useRef<number>(0);

  const loadUserData = useCallback(async (userId: string, currentUser?: User | null) => {
    if (!userId) return;

    // Prevent duplicate queries within 6 seconds for the same user
    const now = Date.now();
    if (isLoadingUserDataRef.current) return;
    if (lastLoadedUserIdRef.current === userId && now - lastLoadTimestampRef.current < 6000) {
      return;
    }

    isLoadingUserDataRef.current = true;
    lastLoadedUserIdRef.current = userId;
    lastLoadTimestampRef.current = now;

    try {
      const effectiveUser = currentUser || userRef.current;

      // Reject deleted account immediately
      if (effectiveUser?.user_metadata?.account_deleted) {
        await supabase.auth.signOut();
        setProfile(null);
        setUser(null);
        setSession(null);
        return;
      }

      const meta = effectiveUser?.user_metadata || {};
      const initialProfile = buildDefaultProfile(
        userId,
        effectiveUser?.email,
        meta
      );

      // Pre-set profile with actual server-authenticated metadata so UI displays real user data immediately
      setProfile((prev) => (prev ? { ...prev, ...meta } : initialProfile));

      // 1. One-time sync of pending signup data ONLY if explicitly present in localStorage
      const userEmail = effectiveUser?.email?.toLowerCase();
      if (userEmail) {
        const pendingKey = `nutrilens_pending_signup_${userEmail}`;
        const pendingRaw = localStorage.getItem(pendingKey);
        if (pendingRaw) {
          localStorage.removeItem(pendingKey);
          try {
            const pendingData = JSON.parse(pendingRaw);
            if (pendingData && typeof pendingData === 'object') {
              await saveFullNutritionProfile(userId, pendingData);
            }
          } catch (e) {
            console.warn('Pending signup profile synchronization notice:', e);
          }
        }
      }

      // 2. Fetch centralized profile data in parallel from PostgreSQL
      let [prof, nut, rest, bud] = await Promise.all([
        fetchUserProfile(userId),
        fetchNutritionPreferences(userId),
        fetchFoodRestrictions(userId),
        fetchBudgetPreferences(userId),
      ]);

      if (!prof) {
        const displayName = meta.full_name || meta.display_name || effectiveUser?.email?.split('@')[0];
        prof = await ensureProfileExists(userId, displayName);
      }

      if (prof) {
        if (meta.age && !prof.age) prof.age = meta.age;
        if (meta.height_value && !prof.height_value) {
          prof.height_value = meta.height_value;
          prof.height_unit = meta.height_unit || 'cm';
        }
        if (meta.weight_value && !prof.weight_value) {
          prof.weight_value = meta.weight_value;
          prof.weight_unit = meta.weight_unit || 'kg';
        }
        if (meta.avatar_url && !prof.avatar_url) prof.avatar_url = meta.avatar_url;

        // Synchronize missing fields from user_metadata (e.g. avatar_url, full_name, username)
        let needsUpdate = false;
        const updates: Partial<Profile> = {};

        const metaAvatar = meta?.avatar_url || (meta as any)?.picture;
        if (!prof.avatar_url && metaAvatar) {
          prof.avatar_url = metaAvatar;
          updates.avatar_url = metaAvatar;
          needsUpdate = true;
        }

        const metaFullName = meta?.full_name || meta?.display_name;
        if ((!prof.full_name || prof.full_name === 'NutriLens Member') && metaFullName) {
          prof.full_name = metaFullName;
          prof.display_name = metaFullName;
          updates.full_name = metaFullName;
          updates.display_name = metaFullName;
          needsUpdate = true;
        }

        if (!prof.username && meta?.username) {
          prof.username = meta.username;
          updates.username = meta.username;
          needsUpdate = true;
        }

        if (needsUpdate && isSupabaseConfigured) {
          try {
            await supabase.from('profiles').update(updates).eq('id', userId);
          } catch (e) {
            console.warn('Failed to sync metadata to profiles:', e);
          }
        }

        setProfile({ ...prof });
      }

      setNutritionPreferences(nut);
      setFoodRestrictions(rest);
      setBudgetPreferences(bud);
    } catch (err) {
      console.warn('Error loading user profile and preferences:', err);
    } finally {
      isLoadingUserDataRef.current = false;
    }
  }, []);

  const refreshUserData = useCallback(async () => {
    if (userRef.current?.id) {
      await loadUserData(userRef.current.id, userRef.current);
    }
  }, [loadUserData]);

  useEffect(() => {
    let mounted = true;

    // Safety timeout: ensure loading spinner is never stuck for more than 1.5 seconds
    const safetyTimer = setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 1500);

    const initializeAuth = async () => {
      if (!isSupabaseConfigured) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Supabase getSession notice:', error);
          await supabase.auth.signOut().catch(() => {});
        }

        if (mounted) {
          if (data?.session?.user) {
            if (data.session.user.user_metadata?.account_deleted) {
              await supabase.auth.signOut();
              setSession(null);
              setUser(null);
              userRef.current = null;
              setProfile(null);
              setLoading(false);
              return;
            }

            setSession(data.session);
            setUser(data.session.user);
            userRef.current = data.session.user;
            setProfile(
              buildDefaultProfile(
                data.session.user.id,
                data.session.user.email,
                data.session.user.user_metadata
              )
            );
            // Complete session check immediately
            setLoading(false);
            // Fetch remote data in background
            loadUserData(data.session.user.id, data.session.user);
          } else {
            setSession(null);
            setUser(null);
            userRef.current = null;
            setProfile(null);
            setLoading(false);
          }
        }
      } catch (err) {
        console.warn('Auth initialization error:', err);
        if (mounted) setLoading(false);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    let authSubscription: { unsubscribe: () => void } | null = null;

    if (isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!mounted) return;

        // Skip token refresh events from re-triggering heavy data loading
        if (event === 'TOKEN_REFRESHED') {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          userRef.current = newSession?.user ?? null;
          return;
        }

        // Block deleted users immediately from setting user or session state
        if (newSession?.user?.user_metadata?.account_deleted) {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          userRef.current = null;
          setProfile(null);
          setLoading(false);
          return;
        }

        setSession(newSession);
        setUser(newSession?.user ?? null);
        userRef.current = newSession?.user ?? null;
        setLoading(false);

        if (newSession?.user) {
          // If we already loaded data for this same user within the last 15 seconds, avoid re-fetching
          const isSameUserRecentlyLoaded =
            lastLoadedUserIdRef.current === newSession.user.id &&
            Date.now() - lastLoadTimestampRef.current < 15000;

          if (!isSameUserRecentlyLoaded) {
            setProfile(
              buildDefaultProfile(
                newSession.user.id,
                newSession.user.email,
                newSession.user.user_metadata
              )
            );
            loadUserData(newSession.user.id, newSession.user);
          }
        } else {
          setProfile(null);
          setNutritionPreferences(null);
          setFoodRestrictions([]);
          setBudgetPreferences(null);
        }
      });
      authSubscription = authListener.subscription;
    }

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [loadUserData]);

  const signIn = async (email: string, password: string) => {
    if (!password) {
      return { error: new Error('Password is required for authentication.') };
    }

    const { data, error } = await signInUser(email, password);
    if (error) {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      return { error };
    }

    if (data?.user) {
      if (data.user.user_metadata?.account_deleted) {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setProfile(null);
        return { error: new Error('This email is not registered. Please sign up.') };
      }

      setUser(data.user);
      setSession(data.session || null);
      await loadUserData(data.user.id);
    }
    return { error: null };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await authSignInWithGoogle();
    if (error) return { error };

    if (data?.url) {
      window.location.href = data.url;
      return { error: null };
    }

    if (data?.user) {
      setUser(data.user);
      setSession(data.session || null);
      const prof = await fetchUserProfile(data.user.id);
      if (prof) {
        setProfile(prof);
      } else {
        const newProf = await ensureProfileExists(data.user.id, data.user.user_metadata?.full_name);
        if (newProf) setProfile(newProf);
      }
      await loadUserData(data.user.id);
      return { error: null, isNewUser: data.isNewUser };
    }
    return { error: null };
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return { error: new Error('User not authenticated.') };
    const { data, error } = await uploadProfilePhoto(user.id, file);
    if (error || !data?.url) return { error: error || new Error('Upload failed') };

    await updateProfile({ avatar_url: data.url });
    return { url: data.url, error: null };
  };

  const setAuthenticatedUser = (authUser: User, authProfile: Profile) => {
    setUser(authUser);
    setProfile(authProfile);
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await signUpUser(email, password, fullName);
    if (error) return { error };

    if (data?.user) {
      setUser(data.user);
      setSession(data.session || null);
      const prof = await ensureProfileExists(data.user.id, fullName);
      if (prof) setProfile(prof);
    }
    return { error: null };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out notice:', err);
      }
    }

    // Only clear transient, in-flight scan drafts; NEVER delete the user's permanent meal logs or chat conversations
    try {
      localStorage.removeItem('nutrilens_current_analysis_draft');
    } catch {}

    setUser(null);
    setProfile(null);
    setSession(null);
    setNutritionPreferences(null);
    setFoodRestrictions([]);
    setBudgetPreferences(null);
  };

  const resetPasswordForEmail = async (email: string) => {
    const res = await sendPasswordRecoveryEmail(email);
    return { error: res.error ?? null };
  };

  const updatePassword = async (newPassword: string) => {
    const res = await updateUserPassword(newPassword);
    return { error: res.error ?? null };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    const activeUserId = profile?.id || user?.id;
    if (!activeUserId) {
      return { error: new Error('No authenticated user session found. Please sign in again.') };
    }

    const currentProfile: Profile = profile || buildDefaultProfile(
      activeUserId,
      user?.email,
      user?.user_metadata?.full_name
    );

    const allowedColumns = [
      'full_name', 'display_name', 'username', 'avatar_url', 'age', 'biological_sex',
      'height_value', 'height_unit', 'weight_value', 'weight_unit', 'target_weight_value',
      'activity_level', 'exercise_frequency', 'sleep_duration', 'disliked_foods',
      'city', 'country', 'preferred_language', 'language', 'unit_preference',
      'general_goal', 'household_size', 'budget_amount', 'budget_currency', 'budget_people',
      'budget_duration_days', 'available_time_minutes', 'available_equipment',
      'market_id', 'declared_allergens', 'dietary_exclusions', 'cuisine_preferences',
      'health_data_consent', 'health_data_consent_at', 'terms_accepted_at', 'terms_version',
      'onboarding_completed', 'onboarding_status', 'updated_at'
    ];

    const dbUpdates: Record<string, any> = {
      id: activeUserId,
    };
    for (const key of Object.keys(updates)) {
      if (allowedColumns.includes(key)) {
        const val = (updates as any)[key];
        dbUpdates[key] = val === undefined ? null : val;
      }
    }

    // Sanitize values to strictly adhere to PostgreSQL table check constraints
    if (dbUpdates.activity_level) {
      const s = String(dbUpdates.activity_level).toLowerCase();
      if (s.includes('sedentary')) dbUpdates.activity_level = 'sedentary';
      else if (s.includes('light')) dbUpdates.activity_level = 'lightly_active';
      else if (s.includes('extreme')) dbUpdates.activity_level = 'extremely_active';
      else if (s.includes('very')) dbUpdates.activity_level = 'very_active';
      else dbUpdates.activity_level = 'moderately_active';
    }
    if (dbUpdates.exercise_frequency) {
      const s = String(dbUpdates.exercise_frequency).toLowerCase();
      if (s.includes('never')) dbUpdates.exercise_frequency = 'never';
      else if (s.includes('1') && s.includes('2')) dbUpdates.exercise_frequency = '1_2_days';
      else if (s.includes('3') && s.includes('4')) dbUpdates.exercise_frequency = '3_4_days';
      else if (s.includes('5') && s.includes('6')) dbUpdates.exercise_frequency = '5_6_days';
      else if (s.includes('every') || s.includes('daily')) dbUpdates.exercise_frequency = 'every_day';
      else dbUpdates.exercise_frequency = '3_4_days';
    }
    if (dbUpdates.sleep_duration) {
      const s = String(dbUpdates.sleep_duration).toLowerCase();
      if (s.includes('less') || s.includes('<')) dbUpdates.sleep_duration = 'less_than_4h';
      else if (s.includes('4') && s.includes('5')) dbUpdates.sleep_duration = '4_5h';
      else if (s.includes('6') && s.includes('7')) dbUpdates.sleep_duration = '6_7h';
      else if (s.includes('8') && s.includes('9')) dbUpdates.sleep_duration = '8_9h';
      else if (s.includes('more') || s.includes('>')) dbUpdates.sleep_duration = 'more_than_9h';
      else dbUpdates.sleep_duration = '6_7h';
    }
    if (dbUpdates.biological_sex) {
      const s = String(dbUpdates.biological_sex).toLowerCase();
      if (s.includes('female')) dbUpdates.biological_sex = 'female';
      else if (s.includes('male')) dbUpdates.biological_sex = 'male';
      else dbUpdates.biological_sex = 'prefer_not_to_say';
    }
    if (dbUpdates.general_goal) {
      const s = String(dbUpdates.general_goal).toLowerCase();
      if (s.includes('protein') || s.includes('muscle')) dbUpdates.general_goal = 'high_protein';
      else if (s.includes('budget') || s.includes('expense')) dbUpdates.general_goal = 'budget_friendly';
      else if (s.includes('diabet') || s.includes('sugar')) dbUpdates.general_goal = 'diabetic_friendly_lifestyle';
      else if (s.includes('heart') || s.includes('pressure')) dbUpdates.general_goal = 'heart_conscious';
      else dbUpdates.general_goal = 'balanced_wellness';
    }
    if (dbUpdates.height_unit) {
      dbUpdates.height_unit = String(dbUpdates.height_unit).toLowerCase().includes('ft') ? 'ft_in' : 'cm';
    }
    if (dbUpdates.weight_unit) {
      dbUpdates.weight_unit = String(dbUpdates.weight_unit).toLowerCase().includes('lb') ? 'lbs' : 'kg';
    }

    dbUpdates.updated_at = new Date().toISOString();

    if (isSupabaseConfigured) {
      try {
        // If market_id was supplied, verify it actually exists in markets table to avoid foreign key errors
        if (dbUpdates.market_id) {
          const { data: mkt } = await supabase.from('markets').select('id').eq('id', dbUpdates.market_id).maybeSingle();
          if (!mkt) {
            dbUpdates.market_id = null;
          }
        }

        let { error } = await supabase.from('profiles').upsert(dbUpdates, { onConflict: 'id' });
        if (error) {
          const errMsg = (error.message || '').toLowerCase();
          if (errMsg.includes('activity_level_check') || errMsg.includes('activity_level')) {
            const fallbacks = ['moderate', (updates as any).activity_level, 'moderately_active', null];
            for (const fb of fallbacks) {
              dbUpdates.activity_level = fb;
              const retry = await supabase.from('profiles').upsert(dbUpdates, { onConflict: 'id' });
              if (!retry.error) {
                error = null;
                break;
              }
            }
          }

          if (error) {
            const errLower = (error.message || '').toLowerCase();
            let retried = false;
            if (errLower.includes('exercise_frequency')) {
              dbUpdates.exercise_frequency = null;
              retried = true;
            }
            if (errLower.includes('sleep_duration')) {
              dbUpdates.sleep_duration = null;
              retried = true;
            }
            if (errLower.includes('biological_sex')) {
              dbUpdates.biological_sex = null;
              retried = true;
            }
            if (errLower.includes('activity_level')) {
              dbUpdates.activity_level = null;
              retried = true;
            }
            if (retried) {
              const retry = await supabase.from('profiles').upsert(dbUpdates, { onConflict: 'id' });
              if (!retry.error) {
                error = null;
              }
            }
          }
        }

        if (error) {
          console.error('Supabase profile upsert error:', error);
          if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
            return {
              error: new Error(
                "Database tables do not exist in Supabase yet. Please run 'supabase/combined_migrations_for_sql_editor.sql' in your Supabase SQL Editor."
              ),
            };
          }
          return { error: new Error(error.message) };
        }
      } catch (err: any) {
        console.error('Supabase profile update exception:', err);
        return { error: err instanceof Error ? err : new Error(String(err)) };
      }
    }

    const updatedProfile: Profile = {
      ...currentProfile,
      ...updates,
      id: activeUserId,
      updated_at: dbUpdates.updated_at,
    };
    setProfile(updatedProfile);

    // Update user metadata in local React state
    if (user) {
      const updatedUser: User = {
        ...user,
        user_metadata: {
          ...user.user_metadata,
          full_name: updatedProfile.full_name || updatedProfile.display_name,
          avatar_url: updatedProfile.avatar_url || null,
        },
      };
      setUser(updatedUser);
    }

    return { error: null };
  };

  const completeOnboarding = async (data: OnboardingData) => {
    if (!user) return { error: new Error('User not authenticated.') };

    const { error } = await saveOnboardingData(user.id, data);
    if (error) return { error };

    await loadUserData(user.id);
    return { error: null };
  };

  const deleteAccount = async () => {
    const { error } = await deleteUserAccount();
    if (error) return { error };

    await signOut();
    return { error: null };
  };

  // Derive onboarding completion status from verified profile
  const onboardingCompleted = Boolean(
    profile?.onboarding_completed || profile?.onboarding_status === 'ONBOARDING_COMPLETED'
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        nutritionPreferences,
        foodRestrictions,
        budgetPreferences,
        loading,
        onboardingCompleted,
        signIn,
        signInWithGoogle,
        signUp,
        setAuthenticatedUser,
        uploadAvatar,
        signOut,
        resetPasswordForEmail,
        updatePassword,
        updateProfile,
        completeOnboarding,
        deleteAccount,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
