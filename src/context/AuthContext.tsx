import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { Profile } from '../contracts';

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
      age_adult_confirmed: true,
      language: 'bn',
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
      age_adult_confirmed: true,
      language: 'bn',
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
      age_adult_confirmed: true,
      language: 'en',
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
  loading: boolean;
  signIn: (email: string, password?: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password?: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  selectDemoUser: (demoUserId: string) => void;
  isDemoUser: boolean;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);

  useEffect(() => {
    // Check local storage for active demo user session if live Supabase is not signed in
    const checkAuth = async () => {
      setLoading(true);
      try {
        if (isSupabaseConfigured) {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            setSession(data.session);
            setUser(data.session.user);
            await fetchProfile(data.session.user.id);
            setLoading(false);
            return;
          }
        }

        // Check if demo user was previously selected
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

    checkAuth();

    if (isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          setIsDemoUser(false);
          await fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as Profile);
      }
    } catch {
      // Ignore network errors in local dev
    }
  };

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
    if (!isSupabaseConfigured || !password) {
      // Local fallback: map to matching demo user or Tariqul
      const match = DEMO_USERS.find((d) => d.email.toLowerCase() === email.toLowerCase()) || DEMO_USERS[0];
      setDemoUserSession(match);
      return { error: null };
    }

    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error };
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        setIsDemoUser(false);
        localStorage.removeItem('nutrilens_active_demo_user');
        await fetchProfile(data.user.id);
      }
      return { error: null };
    } catch (e: any) {
      return { error: e };
    }
  };

  const signUp = async (email: string, password?: string, fullName?: string) => {
    if (!isSupabaseConfigured || !password) {
      const newUserProfile: Profile = {
        id: '00000000-0000-0000-0000-000000000001',
        market_id: '22222222-2222-2222-2222-222222222201',
        display_name: fullName || 'New Member',
        age_adult_confirmed: true,
        language: 'bn',
        unit_preference: 'metric',
        cuisine_preferences: ['bangladeshi'],
        dietary_exclusions: [],
        declared_allergens: [],
        general_goal: 'balanced_wellness',
        household_size: 1,
        budget_amount: 200,
        budget_currency: 'BDT',
        budget_people: 1,
        budget_duration_days: 1,
        available_time_minutes: 30,
        available_equipment: ['stove', 'pan', 'pot', 'knife'],
      };
      setProfile(newUserProfile);
      setUser({ id: newUserProfile.id, email } as any);
      setIsDemoUser(true);
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && !isDemoUser) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setSession(null);
    setIsDemoUser(false);
    localStorage.removeItem('nutrilens_active_demo_user');
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    setProfile(updated);

    if (isSupabaseConfigured && !isDemoUser) {
      await supabase.from('profiles').update(updates).eq('id', profile.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        selectDemoUser,
        isDemoUser,
        updateProfile,
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
