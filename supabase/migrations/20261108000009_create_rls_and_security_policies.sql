-- NutriLens Database Migration
-- 20261108000009_create_rls_and_security_policies.sql
-- Enforces Row Level Security (RLS) across all reference and private tables.

-- 1. Enable RLS on all tables
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- 2. Public Reference Tables: Allow read access to authenticated and anon users
-- Write operations (INSERT, UPDATE, DELETE) are restricted to service_role only.

DO $$
BEGIN
    -- data_sources
    CREATE POLICY "Allow public read on data_sources" ON data_sources
        FOR SELECT TO authenticated, anon USING (true);

    -- markets
    CREATE POLICY "Allow public read on markets" ON markets
        FOR SELECT TO authenticated, anon USING (true);

    -- foods
    CREATE POLICY "Allow public read on foods" ON foods
        FOR SELECT TO authenticated, anon USING (true);

    -- food_names
    CREATE POLICY "Allow public read on food_names" ON food_names
        FOR SELECT TO authenticated, anon USING (true);

    -- recipes
    CREATE POLICY "Allow public read on recipes" ON recipes
        FOR SELECT TO authenticated, anon USING (true);

    -- recipe_ingredients
    CREATE POLICY "Allow public read on recipe_ingredients" ON recipe_ingredients
        FOR SELECT TO authenticated, anon USING (true);

    -- market_observations
    CREATE POLICY "Allow public read on market_observations" ON market_observations
        FOR SELECT TO authenticated, anon USING (true);

    -- knowledge_documents
    CREATE POLICY "Allow public read on knowledge_documents" ON knowledge_documents
        FOR SELECT TO authenticated, anon USING (true);

    -- knowledge_chunks
    CREATE POLICY "Allow public read on knowledge_chunks" ON knowledge_chunks
        FOR SELECT TO authenticated, anon USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Private User Tables: Strict tenant isolation based on auth.uid()

-- Profiles
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

-- Meal Logs
CREATE POLICY "Users can read own meal_logs" ON meal_logs
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal_logs" ON meal_logs
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal_logs" ON meal_logs
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal_logs" ON meal_logs
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Meal Items (Owner checked through parent meal_log)
CREATE POLICY "Users can read own meal_items" ON meal_items
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM meal_logs 
            WHERE meal_logs.id = meal_items.meal_log_id 
              AND meal_logs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own meal_items" ON meal_items
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM meal_logs 
            WHERE meal_logs.id = meal_items.meal_log_id 
              AND meal_logs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own meal_items" ON meal_items
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM meal_logs 
            WHERE meal_logs.id = meal_items.meal_log_id 
              AND meal_logs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own meal_items" ON meal_items
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM meal_logs 
            WHERE meal_logs.id = meal_items.meal_log_id 
              AND meal_logs.user_id = auth.uid()
        )
    );

-- Meal Reports (Owner checked through parent meal_log)
CREATE POLICY "Users can read own meal_reports" ON meal_reports
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM meal_logs 
            WHERE meal_logs.id = meal_reports.meal_log_id 
              AND meal_logs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own meal_reports" ON meal_reports
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM meal_logs 
            WHERE meal_logs.id = meal_reports.meal_log_id 
              AND meal_logs.user_id = auth.uid()
        )
    );

-- Meal Plans
CREATE POLICY "Users can read own meal_plans" ON meal_plans
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal_plans" ON meal_plans
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal_plans" ON meal_plans
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

-- 4. Automatic profile generation on auth.users sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, language, unit_preference)
    VALUES (
        new.id, 
        COALESCE(new.raw_user_meta_data->>'full_name', new.email),
        'bn',
        'metric'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
