-- NutriLens Database Migration
-- 20261110000010_create_auth_and_user_personalization_tables.sql
-- Implements Phase 3: Authentication, Profiles, Nutrition Preferences, Food Restrictions, and Budget Preferences with RLS.

-- 1. Enhance profiles table with additional personalization columns
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS full_name TEXT,
    ADD COLUMN IF NOT EXISTS age INTEGER CHECK (age IS NULL OR age >= 18),
    ADD COLUMN IF NOT EXISTS country TEXT NOT NULL DEFAULT 'Bangladesh',
    ADD COLUMN IF NOT EXISTS city TEXT NOT NULL DEFAULT 'Dhaka',
    ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) NOT NULL DEFAULT 'bn',
    ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

-- Sync full_name with display_name if full_name is null
UPDATE profiles SET full_name = display_name WHERE full_name IS NULL AND display_name IS NOT NULL;
UPDATE profiles SET display_name = full_name WHERE display_name IS NULL AND full_name IS NOT NULL;

-- 2. User Nutrition Preferences Table
CREATE TABLE IF NOT EXISTS user_nutrition_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    primary_goal TEXT NOT NULL DEFAULT 'balanced_wellness' CHECK (primary_goal IN (
        'balanced_wellness',
        'improve_overall_nutrition',
        'increase_protein',
        'improve_dietary_variety',
        'manage_food_expenses',
        'build_healthier_habits',
        'budget_friendly',
        'high_protein',
        'diabetic_friendly_lifestyle',
        'heart_conscious'
    )),
    secondary_goals TEXT[] DEFAULT ARRAY[]::TEXT[],
    dietary_pattern TEXT DEFAULT 'no_preference' CHECK (dietary_pattern IN (
        'no_preference',
        'vegetarian',
        'vegan',
        'pescatarian',
        'halal',
        'other'
    )),
    preferred_cuisine TEXT DEFAULT 'bangladeshi',
    favorite_food_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
    foods_to_avoid TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_user_nutrition_preferences_user_id UNIQUE (user_id)
);

-- 3. User Food Restrictions Table
CREATE TABLE IF NOT EXISTS user_food_restrictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    restriction_type TEXT NOT NULL CHECK (restriction_type IN (
        'allergy',
        'intolerance',
        'religious_exclusion',
        'ingredient_avoidance'
    )),
    restriction_value TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index on user_id for faster retrieval
CREATE INDEX IF NOT EXISTS idx_user_food_restrictions_user_id ON user_food_restrictions(user_id);

-- 4. User Budget Preferences Table
CREATE TABLE IF NOT EXISTS user_budget_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    market_id UUID REFERENCES markets(id) ON DELETE SET NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'BDT',
    budget_amount NUMERIC(10,2) NOT NULL DEFAULT 150.00 CHECK (budget_amount >= 0),
    budget_period TEXT NOT NULL DEFAULT 'daily' CHECK (budget_period IN ('daily', 'weekly', 'monthly')),
    people_count INTEGER NOT NULL DEFAULT 1 CHECK (people_count > 0),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_user_budget_preferences_user_id UNIQUE (user_id)
);

-- 5. Enable Row Level Security (RLS) on all user personalization tables
ALTER TABLE user_nutrition_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_food_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_budget_preferences ENABLE ROW LEVEL SECURITY;

-- 6. Strict Tenant Isolation Policies based on auth.uid()
-- user_nutrition_preferences
DO $$
BEGIN
    CREATE POLICY "Users can read own nutrition preferences" ON user_nutrition_preferences
        FOR SELECT TO authenticated USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own nutrition preferences" ON user_nutrition_preferences
        FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own nutrition preferences" ON user_nutrition_preferences
        FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can delete own nutrition preferences" ON user_nutrition_preferences
        FOR DELETE TO authenticated USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- user_food_restrictions
DO $$
BEGIN
    CREATE POLICY "Users can read own food restrictions" ON user_food_restrictions
        FOR SELECT TO authenticated USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own food restrictions" ON user_food_restrictions
        FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own food restrictions" ON user_food_restrictions
        FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can delete own food restrictions" ON user_food_restrictions
        FOR DELETE TO authenticated USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- user_budget_preferences
DO $$
BEGIN
    CREATE POLICY "Users can read own budget preferences" ON user_budget_preferences
        FOR SELECT TO authenticated USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own budget preferences" ON user_budget_preferences
        FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own budget preferences" ON user_budget_preferences
        FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can delete own budget preferences" ON user_budget_preferences
        FOR DELETE TO authenticated USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 7. Trigger Function to automatically create profile on auth.users sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    default_market_id UUID;
BEGIN
    -- Select first active market (e.g. Savar) as default if available
    SELECT id INTO default_market_id FROM public.markets LIMIT 1;

    INSERT INTO public.profiles (
        id,
        display_name,
        full_name,
        age_adult_confirmed,
        country,
        city,
        preferred_language,
        market_id,
        onboarding_completed
    ) VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'NutriLens Member'),
        COALESCE(new.raw_user_meta_data->>'full_name', 'NutriLens Member'),
        true,
        'Bangladesh',
        'Dhaka',
        'bn',
        default_market_id,
        false
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_nutrition_preferences (
        user_id,
        primary_goal,
        dietary_pattern,
        preferred_cuisine
    ) VALUES (
        new.id,
        'balanced_wellness',
        'no_preference',
        'bangladeshi'
    )
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO public.user_budget_preferences (
        user_id,
        market_id,
        currency,
        budget_amount,
        budget_period,
        people_count
    ) VALUES (
        new.id,
        default_market_id,
        'BDT',
        150.00,
        'daily',
        1
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. RPC Function to allow authenticated user to delete their own account and all data
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Deleting the profile cascades to meal_logs, meal_items, preferences, restrictions
    DELETE FROM public.profiles WHERE id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

