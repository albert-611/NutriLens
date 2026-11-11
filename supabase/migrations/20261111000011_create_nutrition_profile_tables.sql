-- NutriLens Database Migration
-- 20261111000011_create_nutrition_profile_tables.sql
-- Implements the comprehensive NutriLens User Signup & Nutrition Profile Specification.

-- 1. Enhance profiles table with anthropometric, lifestyle, and consent columns
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS biological_sex TEXT CHECK (biological_sex IS NULL OR biological_sex IN ('male', 'female', 'prefer_not_to_say')),
    ADD COLUMN IF NOT EXISTS height_value NUMERIC(6,2) CHECK (height_value IS NULL OR height_value > 0),
    ADD COLUMN IF NOT EXISTS height_unit TEXT DEFAULT 'cm' CHECK (height_unit IN ('cm', 'ft_in')),
    ADD COLUMN IF NOT EXISTS weight_value NUMERIC(6,2) CHECK (weight_value IS NULL OR weight_value > 0),
    ADD COLUMN IF NOT EXISTS weight_unit TEXT DEFAULT 'kg' CHECK (weight_unit IN ('kg', 'lbs')),
    ADD COLUMN IF NOT EXISTS target_weight_value NUMERIC(6,2) CHECK (target_weight_value IS NULL OR target_weight_value > 0),
    ADD COLUMN IF NOT EXISTS activity_level TEXT CHECK (activity_level IS NULL OR activity_level IN (
        'sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'
    )),
    ADD COLUMN IF NOT EXISTS exercise_frequency TEXT CHECK (exercise_frequency IS NULL OR exercise_frequency IN (
        'never', '1_2_days', '3_4_days', '5_6_days', 'every_day'
    )),
    ADD COLUMN IF NOT EXISTS sleep_duration TEXT CHECK (sleep_duration IS NULL OR sleep_duration IN (
        'less_than_4h', '4_5h', '6_7h', '8_9h', 'more_than_9h'
    )),
    ADD COLUMN IF NOT EXISTS disliked_foods TEXT,
    ADD COLUMN IF NOT EXISTS health_data_consent BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS health_data_consent_at TIMESTAMPTZ;

-- Index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- 2. Medical Conditions Table
CREATE TABLE IF NOT EXISTS user_medical_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    condition_name TEXT NOT NULL,
    condition_specify TEXT,
    diabetes_type TEXT CHECK (diabetes_type IS NULL OR diabetes_type IN (
        'type_1', 'type_2', 'gestational', 'prediabetes', 'other', 'not_sure'
    )),
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_medical_conditions_user_id ON user_medical_conditions(user_id);

-- 3. Food Allergies Table (Strictly separate from intolerances)
CREATE TABLE IF NOT EXISTS user_food_allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    allergy_name TEXT NOT NULL,
    allergy_specify TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_food_allergies_user_id ON user_food_allergies(user_id);

-- 4. Food Intolerances Table (Strictly separate from allergies)
CREATE TABLE IF NOT EXISTS user_food_intolerances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    intolerance_name TEXT NOT NULL,
    intolerance_specify TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_food_intolerances_user_id ON user_food_intolerances(user_id);

-- 5. Dietary Preferences & Restrictions Detailed Table
CREATE TABLE IF NOT EXISTS user_dietary_preferences_detailed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    preference_type TEXT NOT NULL CHECK (preference_type IN (
        'dietary_preference',
        'food_restriction',
        'religious_cultural'
    )),
    preference_name TEXT NOT NULL,
    preference_specify TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_dietary_preferences_detailed_user_id ON user_dietary_preferences_detailed(user_id);

-- 6. Nutritional Goals Detailed Table
CREATE TABLE IF NOT EXISTS user_nutritional_goals_detailed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    goal_type TEXT NOT NULL CHECK (goal_type IN ('primary', 'secondary')),
    goal_name TEXT NOT NULL,
    goal_specify TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_nutritional_goals_detailed_user_id ON user_nutritional_goals_detailed(user_id);

-- 7. Enable Row Level Security (RLS) on all new tables
ALTER TABLE user_medical_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_food_allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_food_intolerances ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dietary_preferences_detailed ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nutritional_goals_detailed ENABLE ROW LEVEL SECURITY;

-- 8. Strict Tenant Isolation Policies based on auth.uid()
-- user_medical_conditions
DO $$
BEGIN
    CREATE POLICY "Users can read own medical conditions" ON user_medical_conditions
        FOR SELECT TO authenticated USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own medical conditions" ON user_medical_conditions
        FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own medical conditions" ON user_medical_conditions
        FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can delete own medical conditions" ON user_medical_conditions
        FOR DELETE TO authenticated USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- user_food_allergies
DO $$
BEGIN
    CREATE POLICY "Users can read own food allergies" ON user_food_allergies
        FOR SELECT TO authenticated USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own food allergies" ON user_food_allergies
        FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own food allergies" ON user_food_allergies
        FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can delete own food allergies" ON user_food_allergies
        FOR DELETE TO authenticated USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- user_food_intolerances
DO $$
BEGIN
    CREATE POLICY "Users can read own food intolerances" ON user_food_intolerances
        FOR SELECT TO authenticated USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own food intolerances" ON user_food_intolerances
        FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own food intolerances" ON user_food_intolerances
        FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can delete own food intolerances" ON user_food_intolerances
        FOR DELETE TO authenticated USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- user_dietary_preferences_detailed
DO $$
BEGIN
    CREATE POLICY "Users can read own dietary preferences detailed" ON user_dietary_preferences_detailed
        FOR SELECT TO authenticated USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own dietary preferences detailed" ON user_dietary_preferences_detailed
        FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own dietary preferences detailed" ON user_dietary_preferences_detailed
        FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can delete own dietary preferences detailed" ON user_dietary_preferences_detailed
        FOR DELETE TO authenticated USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- user_nutritional_goals_detailed
DO $$
BEGIN
    CREATE POLICY "Users can read own nutritional goals detailed" ON user_nutritional_goals_detailed
        FOR SELECT TO authenticated USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own nutritional goals detailed" ON user_nutritional_goals_detailed
        FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own nutritional goals detailed" ON user_nutritional_goals_detailed
        FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can delete own nutritional goals detailed" ON user_nutritional_goals_detailed
        FOR DELETE TO authenticated USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 9. Helper Function to check username availability
CREATE OR REPLACE FUNCTION public.check_username_available(p_username TEXT)
RETURNS boolean AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.profiles WHERE LOWER(username) = LOWER(p_username)) THEN
        RETURN false;
    END IF;
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
