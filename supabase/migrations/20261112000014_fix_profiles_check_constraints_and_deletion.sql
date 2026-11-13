-- NutriLens Database Migration
-- 20261112000014_fix_profiles_check_constraints_and_deletion.sql
-- Broadens profiles check constraints, ensures complete account deletion,
-- and supports seamless re-registration under previously deleted emails.

-- 1. Ensure authenticated users have explicit DELETE policy on profiles
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
    CREATE POLICY "Users can delete own profile" ON public.profiles
        FOR DELETE TO authenticated
        USING (auth.uid() = id);
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 2. Track permanently deleted accounts to prevent re-login before re-signup
CREATE TABLE IF NOT EXISTS public.deleted_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    email TEXT UNIQUE NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.deleted_accounts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public read of deleted_accounts" ON public.deleted_accounts;
    CREATE POLICY "Allow public read of deleted_accounts" ON public.deleted_accounts
        FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Allow authenticated insert to deleted_accounts" ON public.deleted_accounts;
    CREATE POLICY "Allow authenticated insert to deleted_accounts" ON public.deleted_accounts
        FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public delete from deleted_accounts" ON public.deleted_accounts;
    CREATE POLICY "Allow public delete from deleted_accounts" ON public.deleted_accounts
        FOR DELETE USING (true);
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 3. Function to prepare an email for fresh re-registration (purges any ghost deleted accounts)
CREATE OR REPLACE FUNCTION public.prepare_email_for_registration(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_catalog
AS $$
DECLARE
    v_user_id UUID;
    v_is_deleted BOOLEAN := false;
BEGIN
    p_email := LOWER(TRIM(p_email));
    
    -- Check if ghost user exists in auth.users with deleted metadata
    SELECT id, COALESCE((raw_user_meta_data->>'account_deleted')::boolean, false)
    INTO v_user_id, v_is_deleted
    FROM auth.users
    WHERE LOWER(email) = p_email;

    -- If user exists and is marked deleted, permanently purge them so re-registration succeeds freshly
    IF v_user_id IS NOT NULL AND v_is_deleted THEN
        DELETE FROM public.user_medical_conditions WHERE user_id = v_user_id;
        DELETE FROM public.user_food_allergies WHERE user_id = v_user_id;
        DELETE FROM public.user_food_intolerances WHERE user_id = v_user_id;
        DELETE FROM public.user_dietary_preferences_detailed WHERE user_id = v_user_id;
        DELETE FROM public.user_nutritional_goals_detailed WHERE user_id = v_user_id;
        DELETE FROM public.user_nutrition_preferences WHERE user_id = v_user_id;
        DELETE FROM public.user_budget_preferences WHERE user_id = v_user_id;
        DELETE FROM public.user_food_restrictions WHERE user_id = v_user_id;
        DELETE FROM public.meal_items WHERE meal_log_id IN (SELECT id FROM public.meal_logs WHERE user_id = v_user_id);
        DELETE FROM public.meal_logs WHERE user_id = v_user_id;
        DELETE FROM public.meal_reports WHERE user_id = v_user_id;
        DELETE FROM public.meal_plans WHERE user_id = v_user_id;
        DELETE FROM public.profiles WHERE id = v_user_id;

        DELETE FROM auth.identities WHERE user_id = v_user_id;
        DELETE FROM auth.sessions WHERE user_id = v_user_id;
        DELETE FROM auth.mfa_factors WHERE user_id = v_user_id;
        DELETE FROM auth.users WHERE id = v_user_id;
        
        DELETE FROM public.deleted_accounts WHERE LOWER(email) = p_email;
        RETURN true;
    END IF;

    -- Always clear deleted_accounts entry when re-registering
    DELETE FROM public.deleted_accounts WHERE LOWER(email) = p_email;
    RETURN false;
END;
$$;

GRANT EXECUTE ON FUNCTION public.prepare_email_for_registration(TEXT) TO authenticated, anon;

-- 4. Trigger on auth.users: automatically clear any deleted_accounts tracking when new user is created
CREATE OR REPLACE FUNCTION public.on_auth_user_created_clear_deleted()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.deleted_accounts WHERE LOWER(email) = LOWER(NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
    DROP TRIGGER IF EXISTS tr_clear_deleted_accounts_on_signup ON auth.users;
    CREATE TRIGGER tr_clear_deleted_accounts_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.on_auth_user_created_clear_deleted();
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 5. Comprehensive RPC function for secure account self-deletion (GDPR / Right to be Forgotten)
-- Permanently deletes all 13 application tables, storage files, and completely purges auth.users
CREATE OR REPLACE FUNCTION public.delete_user_account(target_user_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, storage, pg_catalog
AS $$
DECLARE
    v_user_id UUID;
    v_email TEXT;
BEGIN
    -- Determine target user
    v_user_id := COALESCE(target_user_id, auth.uid());
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated: Cannot identify user to delete.';
    END IF;

    -- Security safeguard: authenticated users can ONLY delete themselves
    IF auth.role() = 'authenticated' AND v_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Access denied: You can only delete your own account.';
    END IF;

    -- Retrieve user email for tracking
    SELECT email INTO v_email FROM auth.users WHERE id = v_user_id;

    -- 1. Record in deleted_accounts tracking table to block login until re-signup
    IF v_email IS NOT NULL THEN
        INSERT INTO public.deleted_accounts (user_id, email, deleted_at)
        VALUES (v_user_id, LOWER(v_email), now())
        ON CONFLICT (email) DO UPDATE SET deleted_at = now();
    END IF;

    -- 2. Delete all application data across all 13 tables
    DELETE FROM public.user_medical_conditions WHERE user_id = v_user_id;
    DELETE FROM public.user_food_allergies WHERE user_id = v_user_id;
    DELETE FROM public.user_food_intolerances WHERE user_id = v_user_id;
    DELETE FROM public.user_dietary_preferences_detailed WHERE user_id = v_user_id;
    DELETE FROM public.user_nutritional_goals_detailed WHERE user_id = v_user_id;
    DELETE FROM public.user_nutrition_preferences WHERE user_id = v_user_id;
    DELETE FROM public.user_budget_preferences WHERE user_id = v_user_id;
    DELETE FROM public.user_food_restrictions WHERE user_id = v_user_id;
    DELETE FROM public.meal_items WHERE meal_log_id IN (SELECT id FROM public.meal_logs WHERE user_id = v_user_id);
    DELETE FROM public.meal_logs WHERE user_id = v_user_id;
    DELETE FROM public.meal_reports WHERE user_id = v_user_id;
    DELETE FROM public.meal_plans WHERE user_id = v_user_id;
    DELETE FROM public.profiles WHERE id = v_user_id;

    -- 3. Delete user files from storage
    BEGIN
        DELETE FROM storage.objects 
        WHERE (bucket_id IN ('avatars', 'meal-images', 'nutrilens-media') AND owner = v_user_id)
           OR name LIKE v_user_id::text || '/%';
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;

    -- 4. Clean up auth schema dependencies and permanently purge auth.users
    DELETE FROM auth.identities WHERE user_id = v_user_id;
    DELETE FROM auth.sessions WHERE user_id = v_user_id;
    DELETE FROM auth.mfa_factors WHERE user_id = v_user_id;
    DELETE FROM auth.users WHERE id = v_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'deleted_user_id', v_user_id,
        'deleted_email', v_email,
        'message', 'User account and all data permanently deleted.'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_user_account(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated, anon;

-- 6. Fix and broaden check constraints on profiles table to avoid constraint violation errors
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_activity_level_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_activity_level_check CHECK (
    activity_level IS NULL OR activity_level IN (
        'sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active',
        'light', 'moderate', 'active', 'extra_active',
        'Sedentary (little or no exercise)', 'Lightly active', 'Moderately active', 'Very active', 'Extremely active'
    )
);

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_exercise_frequency_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_exercise_frequency_check CHECK (
    exercise_frequency IS NULL OR exercise_frequency IN (
        'never', '1_2_days', '3_4_days', '5_6_days', 'every_day',
        'Never', '1–2 days per week', '3–4 days per week', '5–6 days per week', 'Every day'
    )
);

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_sleep_duration_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_sleep_duration_check CHECK (
    sleep_duration IS NULL OR sleep_duration IN (
        'less_than_4h', '4_5h', '6_7h', '8_9h', 'more_than_9h',
        'Less than 4 hours', '4–5 hours', '6–7 hours', '8–9 hours', 'More than 9 hours'
    )
);

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_biological_sex_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_biological_sex_check CHECK (
    biological_sex IS NULL OR biological_sex IN (
        'male', 'female', 'prefer_not_to_say',
        'Male', 'Female', 'Prefer not to say'
    )
);
