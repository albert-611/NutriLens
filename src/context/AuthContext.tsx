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
function buildDefaultProfile(userId: string, email?: string, fullName?: string): Profile {
  const name = fullName || (email ? email.split('@')[0] : 'NutriLens Member');
  const uname = email ? email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_') : 'member';
  return {
    id: userId,
    full_name: name,
    display_name: name,
    username: uname,
    age: 24,
    biological_sex: 'prefer_not_to_say',
    height_value: 170,
    height_unit: 'cm',
    weight_value: 65,
    weight_unit: 'kg',
    target_weight_value: null,
    activity_level: 'moderately_active',
    exercise_frequency: '3_4_days',
    sleep_duration: '6_7h',
    disliked_foods: null,
    city: 'Dhaka',
    country: 'Bangladesh',
    preferred_language: 'bn',
    language: 'bn',
    unit_preference: 'metric',
    general_goal: 'balanced_wellness',
    household_size: 1,
    budget_amount: 5000,
    budget_currency: 'BDT',
    budget_people: 1,
    budget_duration_days: 30,
    available_time_minutes: 30,
    available_equipment: ['stove', 'pan', 'knife', 'pot'],
    market_id: null,
    declared_allergens: [],
    dietary_exclusions: [],
    cuisine_preferences: ['bangladeshi'],
    health_data_consent: true,
    age_adult_confirmed: true,
    terms_accepted_at: new Date().toISOString(),
    terms_version: '1.0',
    onboarding_completed: true,
    onboarding_status: 'ONBOARDING_COMPLETED',
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

  const loadUserData = useCallback(async (userId: string, currentUser?: User | null) => {
    try {
      const effectiveUser = currentUser || userRef.current;
      const initialProfile = buildDefaultProfile(
        userId,
        effectiveUser?.email,
        effectiveUser?.user_metadata?.full_name
      );

      // Pre-set profile so views have immediate data while fetching
      setProfile((prev) => prev || initialProfile);

      const [prof, nut, rest, bud] = await Promise.all([
        fetchUserProfile(userId),
        fetchNutritionPreferences(userId),
        fetchFoodRestrictions(userId),
        fetchBudgetPreferences(userId),
      ]);

      if (prof) {
        setProfile(prof);
      } else {
        const displayName = effectiveUser?.user_metadata?.full_name || effectiveUser?.email?.split('@')[0];
        const created = await ensureProfileExists(userId, displayName);
        if (created) {
          setProfile(created);
        }
      }

      setNutritionPreferences(nut);
      setFoodRestrictions(rest);
      setBudgetPreferences(bud);
    } catch (err) {
      console.warn('Error loading user profile and preferences:', err);
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
        }

        if (mounted) {
          if (data?.session?.user) {
            setSession(data.session);
            setUser(data.session.user);
            userRef.current = data.session.user;
            setProfile(
              buildDefaultProfile(
                data.session.user.id,
                data.session.user.email,
                data.session.user.user_metadata?.full_name
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
      const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        if (!mounted) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);
        userRef.current = newSession?.user ?? null;
        setLoading(false);

        if (newSession?.user) {
          setProfile(
            buildDefaultProfile(
              newSession.user.id,
              newSession.user.email,
              newSession.user.user_metadata?.full_name
            )
          );
          loadUserData(newSession.user.id, newSession.user);
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
    if (error) return { error };

    if (data?.user) {
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

        const { error } = await supabase.from('profiles').upsert(dbUpdates, { onConflict: 'id' });
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
