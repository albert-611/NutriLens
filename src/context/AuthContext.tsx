import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
  saveLocalProfile,
} from '../services/authService';

export interface DemoUserOption {
  id: string;
  name: string;
  email: string;
  roleDescription: string;
  profile: Profile;
}

export const DEMO_USERS: DemoUserOption[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Tariqul Islam',
    email: 'demo.student@nutrilens.internal',
    roleDescription: 'Savar Mess Student • Budget ৳150/day',
    profile: {
      id: '00000000-0000-0000-0000-000000000001',
      market_id: '22222222-2222-2222-2222-222222222201',
      display_name: 'Tariqul Islam',
      full_name: 'Tariqul Islam',
      age: 22,
      country: 'Bangladesh',
      city: 'Savar',
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
      general_goal: 'budget_friendly',
      household_size: 1,
      budget_amount: 150,
      budget_currency: 'BDT',
      budget_people: 1,
      budget_duration_days: 1,
      available_time_minutes: 25,
      available_equipment: ['stove', 'pan', 'pot', 'knife'],
    },
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Nasima Akter',
    email: 'demo.family@nutrilens.internal',
    roleDescription: 'Ashulia Garments Supervisor • Family of 3 • Budget ৳350/day',
    profile: {
      id: '00000000-0000-0000-0000-000000000002',
      market_id: '22222222-2222-2222-2222-222222222202',
      display_name: 'Nasima Akter',
      full_name: 'Nasima Akter',
      age: 34,
      country: 'Bangladesh',
      city: 'Ashulia',
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
      household_size: 3,
      budget_amount: 350,
      budget_currency: 'BDT',
      budget_people: 3,
      budget_duration_days: 1,
      available_time_minutes: 40,
      available_equipment: ['stove', 'pan', 'pot', 'knife'],
    },
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Tanvir Ahmed',
    email: 'demo.fitness@nutrilens.internal',
    roleDescription: 'IT Professional (Savar) • High Protein Goal',
    profile: {
      id: '00000000-0000-0000-0000-000000000003',
      market_id: '22222222-2222-2222-2222-222222222201',
      display_name: 'Tanvir Ahmed',
      full_name: 'Tanvir Ahmed',
      age: 28,
      country: 'Bangladesh',
      city: 'Savar',
      height_unit: 'cm',
      weight_unit: 'kg',
      health_data_consent: true,
      age_adult_confirmed: true,
      onboarding_completed: true,
      language: 'en',
      preferred_language: 'en',
      unit_preference: 'metric',
      cuisine_preferences: ['bangladeshi'],
      dietary_exclusions: [],
      declared_allergens: [],
      general_goal: 'high_protein',
      household_size: 1,
      budget_amount: 300,
      budget_currency: 'BDT',
      budget_people: 1,
      budget_duration_days: 1,
      available_time_minutes: 30,
      available_equipment: ['stove', 'pan', 'pot', 'knife', 'blender'],
    },
  },
];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  nutritionPreferences: NutritionPreferences | null;
  foodRestrictions: FoodRestriction[];
  budgetPreferences: BudgetPreferences | null;
  loading: boolean;
  onboardingCompleted: boolean;
  isDemoUser: boolean;
  signIn: (email: string, password?: string) => Promise<{ error: Error | null }>;
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
  selectDemoUser: (demoUserId: string) => void;
  refreshUserData: () => Promise<void>;
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
  const [isDemoUser, setIsDemoUser] = useState(false);

  const loadUserData = useCallback(async (userId: string) => {
    try {
      const [prof, nut, rest, bud] = await Promise.all([
        fetchUserProfile(userId),
        fetchNutritionPreferences(userId),
        fetchFoodRestrictions(userId),
        fetchBudgetPreferences(userId),
      ]);

      if (prof) {
        setProfile(prof);
      }
      setNutritionPreferences(nut);
      setFoodRestrictions(rest);
      setBudgetPreferences(bud);
    } catch (err) {
      console.warn('Error loading user data:', err);
    }
  }, []);

  const refreshUserData = useCallback(async () => {
    if (user?.id) {
      await loadUserData(user.id);
    }
  }, [user?.id, loadUserData]);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        if (isSupabaseConfigured) {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            setSession(data.session);
            setUser(data.session.user);
            setIsDemoUser(false);
            await loadUserData(data.session.user.id);
            setLoading(false);
            return;
          }
        }

        // Check active local user session
        const activeUserId = localStorage.getItem('nutrilens_active_user_id');
        if (activeUserId) {
          const prof = await fetchUserProfile(activeUserId);
          if (prof) {
            const persistedUser = {
              id: prof.id,
              email: (prof as any).email || `${prof.username || 'user'}@nutrilens.internal`,
              app_metadata: {},
              user_metadata: { full_name: prof.full_name || prof.display_name },
              aud: 'authenticated',
              created_at: prof.created_at || new Date().toISOString(),
            } as unknown as User;

            setUser(persistedUser);
            setProfile(prof);
            setIsDemoUser(false);
            await loadUserData(activeUserId);
            setLoading(false);
            return;
          }
        }

        // Check if demo user was saved
        const savedDemoId = localStorage.getItem('nutrilens_active_demo_user');
        if (savedDemoId) {
          const demo = DEMO_USERS.find((d) => d.id === savedDemoId) || DEMO_USERS[0];
          setDemoUserSession(demo);
        }
      } catch (err) {
        console.warn('Auth initialization fallback:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    if (isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          setIsDemoUser(false);
          await loadUserData(newSession.user.id);
        } else {
          setProfile(null);
          setNutritionPreferences(null);
          setFoodRestrictions([]);
          setBudgetPreferences(null);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, [loadUserData]);

  const setDemoUserSession = (demo: DemoUserOption) => {
    const mockUser = {
      id: demo.id,
      email: demo.email,
      app_metadata: {},
      user_metadata: { full_name: demo.name },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User;

    setUser(mockUser);
    setProfile(demo.profile);
    setIsDemoUser(true);
    localStorage.setItem('nutrilens_active_demo_user', demo.id);
  };

  const selectDemoUser = (demoUserId: string) => {
    const demo = DEMO_USERS.find((d) => d.id === demoUserId) || DEMO_USERS[0];
    setDemoUserSession(demo);
  };

  const signIn = async (email: string, password?: string) => {
    if (!password) {
      const match = DEMO_USERS.find((d) => d.email.toLowerCase() === email.toLowerCase()) || DEMO_USERS[0];
      setDemoUserSession(match);
      return { error: null };
    }

    const { data, error } = await signInUser(email, password);
    if (error) return { error };

    if (data?.user) {
      setUser(data.user);
      setSession(data.session);
      setIsDemoUser(false);
      localStorage.removeItem('nutrilens_active_demo_user');
      localStorage.setItem('nutrilens_active_user_id', data.user.id);
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
      setIsDemoUser(false);
      localStorage.removeItem('nutrilens_active_demo_user');
      localStorage.setItem('nutrilens_active_user_id', data.user.id);

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
    setIsDemoUser(false);
    localStorage.removeItem('nutrilens_active_demo_user');
    localStorage.setItem('nutrilens_active_user_id', authUser.id);
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await signUpUser(email, password, fullName);
    if (error) return { error };

    if (data?.user) {
      setUser(data.user);
      setSession(data.session);
      setIsDemoUser(false);
      localStorage.removeItem('nutrilens_active_demo_user');
      localStorage.setItem('nutrilens_active_user_id', data.user.id);
      // Create initial local profile
      const prof = await ensureProfileExists(data.user.id, fullName);
      if (prof) setProfile(prof);
    }
    return { error: null };
  };

  const signOut = async () => {
    if (isSupabaseConfigured && !isDemoUser) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setSession(null);
    setNutritionPreferences(null);
    setFoodRestrictions([]);
    setBudgetPreferences(null);
    setIsDemoUser(false);
    localStorage.removeItem('nutrilens_active_demo_user');
    localStorage.removeItem('nutrilens_active_user_id');
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
    if (!profile) return { error: new Error('No active profile.') };
    const updated = { ...profile, ...updates };
    setProfile(updated);

    if (isSupabaseConfigured && !isDemoUser) {
      try {
        const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id);
        if (error) return { error };
      } catch (err: any) {
        return { error: err };
      }
    }
    return { error: null };
  };

  const completeOnboarding = async (data: OnboardingData) => {
    if (!user) return { error: new Error('User not authenticated.') };

    const { error } = await saveOnboardingData(user.id, data);
    if (error) return { error };

    // Update local state and profile with onboarding_completed: true
    const currentProfile = profile || (await fetchUserProfile(user.id));
    const baseProfile: Profile = currentProfile || {
      id: user.id,
      market_id: data.marketId || '22222222-2222-2222-2222-222222222201',
      username: 'member',
      display_name: data.fullName,
      full_name: data.fullName,
      age: data.age,
      country: data.country,
      city: data.city,
      height_unit: 'cm',
      weight_unit: 'kg',
      health_data_consent: true,
      age_adult_confirmed: true,
      onboarding_completed: true,
      language: data.preferredLanguage,
      preferred_language: data.preferredLanguage,
      unit_preference: 'metric',
      cuisine_preferences: ['bangladeshi'],
      dietary_exclusions: [],
      declared_allergens: [],
      general_goal: 'balanced_wellness',
      household_size: data.peopleCount,
      budget_amount: data.budgetAmount,
      budget_currency: data.currency,
      budget_people: data.peopleCount,
      budget_duration_days: 1,
      available_time_minutes: 30,
      available_equipment: ['stove', 'pan', 'pot', 'knife'],
    };

    const updatedProfile: Profile = {
      ...baseProfile,
      full_name: data.fullName,
      display_name: data.fullName,
      age: data.age,
      country: data.country,
      city: data.city,
      preferred_language: data.preferredLanguage,
      language: data.preferredLanguage,
      market_id: data.marketId || baseProfile.market_id,
      budget_amount: data.budgetAmount,
      budget_currency: data.currency,
      household_size: data.peopleCount,
      age_adult_confirmed: true,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    };

    setProfile(updatedProfile);
    saveLocalProfile(updatedProfile);
    localStorage.setItem('nutrilens_active_user_id', user.id);

    await loadUserData(user.id);
    return { error: null };
  };

  const deleteAccount = async () => {
    const { error } = await deleteUserAccount();
    if (error) return { error };

    await signOut();
    return { error: null };
  };

  // Derive onboarding completion status: any authenticated user has completed onboarding
  const onboardingCompleted = Boolean(
    user || profile?.onboarding_completed || isDemoUser
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
        isDemoUser,
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
        selectDemoUser,
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
