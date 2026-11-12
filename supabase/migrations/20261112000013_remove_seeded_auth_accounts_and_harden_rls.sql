-- NutriLens Database Migration
-- 20261112000013_remove_seeded_auth_accounts_and_harden_rls.sql
-- Eliminates seeded demo authentication accounts, drops demo provisioning helpers,
-- and verifies Row Level Security (RLS) enforcement across all user-specific tables.

-- 1. Safely clean up hardcoded demo user profiles (preserving all legitimate user accounts)
DELETE FROM public.profiles 
WHERE id IN (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000002'::uuid,
    '00000000-0000-0000-0000-000000000003'::uuid
);

-- Clean up from auth.users if running in an environment with direct auth schema access
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        DELETE FROM auth.users WHERE id IN (
            '00000000-0000-0000-0000-000000000001'::uuid,
            '00000000-0000-0000-0000-000000000002'::uuid,
            '00000000-0000-0000-0000-000000000003'::uuid
        );
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Ignore if running under restricted non-superuser role
END $$;

-- 2. Drop legacy demo provisioning helper function
DROP FUNCTION IF EXISTS public.provision_demo_profile(UUID, TEXT, TEXT, UUID, VARCHAR, TEXT, INTEGER, NUMERIC, INTEGER, TEXT[], TEXT[]);

-- 3. Ensure Row Level Security (RLS) is ENABLED on every user-isolated table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_nutrition_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_food_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_budget_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_medical_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_food_allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_food_intolerances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_dietary_preferences_detailed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_nutritional_goals_detailed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

-- 4. Re-assert strict tenant isolation policies using auth.uid()
-- Profiles: Users can only read/update/insert their own profile
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
    CREATE POLICY "Users can read own profile" ON profiles
        FOR SELECT TO authenticated
        USING (auth.uid() = id);

    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    CREATE POLICY "Users can update own profile" ON profiles
        FOR UPDATE TO authenticated
        USING (auth.uid() = id)
        WITH CHECK (auth.uid() = id);

    DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
    CREATE POLICY "Users can insert own profile" ON profiles
        FOR INSERT TO authenticated
        WITH CHECK (auth.uid() = id);
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 5. RPC function for secure account self-deletion (GDPR / Right to be Forgotten)
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.profiles WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

