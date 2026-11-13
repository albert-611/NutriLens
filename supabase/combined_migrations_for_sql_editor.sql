
-- ==================================================================
-- MIGRATION: 20261108000001_create_extensions_and_enums.sql
-- ==================================================================

-- NutriLens Database Migration
-- 20261108000001_create_extensions_and_enums.sql
-- Enables required PostgreSQL extensions and shared custom types/enums.

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Enumerated types / checks will be applied either as custom types or CHECK constraints.
-- In Supabase, CHECK constraints are generally preferred for flexible schema evolution.


-- ==================================================================
-- MIGRATION: 20261108000002_create_reference_tables.sql
-- ==================================================================

-- NutriLens Database Migration
-- 20261108000002_create_reference_tables.sql
-- Creates core data provenance and geographical market tables.

-- Data Sources (Registry of all food composition, clinical guidelines, and market observations)
CREATE TABLE IF NOT EXISTS data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publisher TEXT NOT NULL,
    title TEXT NOT NULL,
    source_url TEXT,
    source_type TEXT NOT NULL CHECK (source_type IN ('fct', 'guideline', 'retailer', 'field_survey', 'synthetic_generator')),
    license_note TEXT,
    source_version TEXT,
    published_at DATE,
    retrieved_at TIMESTAMPTZ DEFAULT now(),
    review_status TEXT NOT NULL DEFAULT 'approved' CHECK (review_status IN ('draft', 'reviewed', 'approved', 'deprecated')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Markets (Geographic pilot markets and demo context)
CREATE TABLE IF NOT EXISTS markets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code VARCHAR(2) NOT NULL DEFAULT 'BD',
    region TEXT NOT NULL,
    city TEXT NOT NULL,
    market_name TEXT NOT NULL,
    currency_code VARCHAR(3) NOT NULL DEFAULT 'BDT',
    time_zone TEXT NOT NULL DEFAULT 'Asia/Dhaka',
    supported_languages TEXT[] NOT NULL DEFAULT ARRAY['bn', 'en'],
    coverage_status TEXT NOT NULL DEFAULT 'pilot_market' CHECK (coverage_status IN ('full', 'pilot_market', 'limited', 'unsupported')),
    is_demo_market BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);


-- ==================================================================
-- MIGRATION: 20261108000003_create_food_and_nutrition_tables.sql
-- ==================================================================

-- NutriLens Database Migration
-- 20261108000003_create_food_and_nutrition_tables.sql
-- Creates canonical food and multilingual alias catalog tables.

-- Canonical Foods
CREATE TABLE IF NOT EXISTS foods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'grains_and_cereals',
        'pulses_and_legumes',
        'fish_and_seafood',
        'meat_and_poultry',
        'eggs',
        'vegetables',
        'fruits',
        'dairy',
        'oils_and_fats',
        'spices_and_condiments',
        'beverages',
        'mixed_dishes'
    )),
    preparation_state TEXT NOT NULL CHECK (preparation_state IN (
        'raw',
        'boiled',
        'steamed',
        'fried',
        'roasted',
        'curried',
        'drained',
        'commercial'
    )),
    edible_basis TEXT NOT NULL DEFAULT 'edible_portion_100g',
    basis_grams NUMERIC(6,2) NOT NULL DEFAULT 100.00 CHECK (basis_grams > 0),
    -- Nutrient values per basis_grams (100g). Must remain NULL when unmeasured.
    energy_kcal NUMERIC(8,2) CHECK (energy_kcal >= 0),
    protein_g NUMERIC(8,2) CHECK (protein_g >= 0),
    carbohydrate_g NUMERIC(8,2) CHECK (carbohydrate_g >= 0),
    fat_g NUMERIC(8,2) CHECK (fat_g >= 0),
    fibre_g NUMERIC(8,2) CHECK (fibre_g >= 0),
    source_id UUID NOT NULL REFERENCES data_sources(id) ON DELETE RESTRICT,
    external_record_id TEXT,
    source_version TEXT,
    review_status TEXT NOT NULL DEFAULT 'approved' CHECK (review_status IN ('draft', 'reviewed', 'approved')),
    nutrient_completeness TEXT NOT NULL DEFAULT 'complete' CHECK (nutrient_completeness IN ('complete', 'partial', 'minimal')),
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_food_source_external UNIQUE (source_id, external_record_id)
);

-- Multilingual Food Names and Aliases (Bangla script, English, Banglish transliteration)
CREATE TABLE IF NOT EXISTS food_names (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_id UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
    language_code VARCHAR(15) NOT NULL CHECK (language_code IN ('bn', 'en', 'bn_translit')),
    market_id UUID REFERENCES markets(id) ON DELETE SET NULL,
    local_name TEXT NOT NULL,
    normalized_alias TEXT NOT NULL,
    alias_type TEXT NOT NULL DEFAULT 'common' CHECK (alias_type IN ('canonical', 'common', 'colloquial', 'regional', 'spelling_variant')),
    review_status TEXT NOT NULL DEFAULT 'approved' CHECK (review_status IN ('draft', 'approved')),
    created_at TIMESTAMPTZ DEFAULT now()
);


-- ==================================================================
-- MIGRATION: 20261108000004_create_recipe_tables.sql
-- ==================================================================

-- NutriLens Database Migration
-- 20261108000004_create_recipe_tables.sql
-- Creates curated recipes and normalized recipe ingredients tables.

-- Curated Recipes
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id UUID REFERENCES markets(id) ON DELETE SET NULL,
    cuisine TEXT NOT NULL DEFAULT 'bangladeshi',
    name_en TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    description TEXT,
    servings INTEGER NOT NULL DEFAULT 1 CHECK (servings > 0),
    prep_time_minutes INTEGER CHECK (prep_time_minutes >= 0),
    cook_time_minutes INTEGER CHECK (cook_time_minutes >= 0),
    equipment_required TEXT[] DEFAULT ARRAY[]::TEXT[],
    instructions TEXT,
    yield_grams NUMERIC(8,2) CHECK (yield_grams > 0),
    source_id UUID REFERENCES data_sources(id) ON DELETE SET NULL,
    review_status TEXT NOT NULL DEFAULT 'approved' CHECK (review_status IN ('draft', 'reviewed', 'approved')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Recipe Ingredients (Normalized linking to canonical foods)
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    food_id UUID NOT NULL REFERENCES foods(id) ON DELETE RESTRICT,
    quantity_g NUMERIC(8,2) NOT NULL CHECK (quantity_g > 0),
    input_state TEXT NOT NULL CHECK (input_state IN ('raw', 'boiled', 'steamed', 'fried', 'curried', 'drained')),
    is_optional BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);


-- ==================================================================
-- MIGRATION: 20261108000005_create_market_tables.sql
-- ==================================================================

-- NutriLens Database Migration
-- 20261108000005_create_market_tables.sql
-- Creates local market pricing, pack sizing, and inventory observation tables.

-- Market Observations (Commodity prices and stock states for local bazars)
CREATE TABLE IF NOT EXISTS market_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id UUID NOT NULL REFERENCES markets(id) ON DELETE RESTRICT,
    food_id UUID NOT NULL REFERENCES foods(id) ON DELETE RESTRICT,
    seller_label TEXT NOT NULL,
    currency_code VARCHAR(3) NOT NULL DEFAULT 'BDT',
    price_amount NUMERIC(10,2) NOT NULL CHECK (price_amount >= 0),
    pack_quantity NUMERIC(10,2) NOT NULL CHECK (pack_quantity > 0),
    pack_unit TEXT NOT NULL CHECK (pack_unit IN ('g', 'kg', 'piece', 'bunch', 'hali', 'litre', 'ml')),
    price_per_base_unit NUMERIC(10,4) CHECK (price_per_base_unit >= 0),
    stock_state TEXT NOT NULL DEFAULT 'in_stock' CHECK (stock_state IN ('in_stock', 'out_of_stock', 'unknown')),
    observed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ,
    source_id UUID REFERENCES data_sources(id) ON DELETE SET NULL,
    data_mode TEXT NOT NULL CHECK (data_mode IN ('live_retailer', 'dated_manual_observation', 'historical_reference', 'synthetic_demo')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);


-- ==================================================================
-- MIGRATION: 20261108000006_create_user_and_meal_tables.sql
-- ==================================================================

-- NutriLens Database Migration
-- 20261108000006_create_user_and_meal_tables.sql
-- Creates private user profiles, meal capture logs, confirmed items, calculated nutrition reports, and meal plans.

-- User Profiles (Linked to Supabase Auth User ID)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    market_id UUID REFERENCES markets(id) ON DELETE SET NULL,
    display_name TEXT,
    age_adult_confirmed BOOLEAN NOT NULL DEFAULT false,
    language VARCHAR(10) NOT NULL DEFAULT 'bn',
    unit_preference VARCHAR(10) NOT NULL DEFAULT 'metric',
    cuisine_preferences TEXT[] DEFAULT ARRAY['bangladeshi'],
    dietary_exclusions TEXT[] DEFAULT ARRAY[]::TEXT[],
    declared_allergens TEXT[] DEFAULT ARRAY[]::TEXT[],
    general_goal TEXT DEFAULT 'balanced_wellness' CHECK (general_goal IN (
        'balanced_wellness',
        'budget_friendly',
        'high_protein',
        'diabetic_friendly_lifestyle',
        'heart_conscious'
    )),
    household_size INTEGER NOT NULL DEFAULT 1 CHECK (household_size > 0),
    budget_amount NUMERIC(10,2) CHECK (budget_amount >= 0),
    budget_currency VARCHAR(3) NOT NULL DEFAULT 'BDT',
    budget_people INTEGER DEFAULT 1 CHECK (budget_people > 0),
    budget_duration_days INTEGER DEFAULT 1 CHECK (budget_duration_days > 0),
    available_time_minutes INTEGER CHECK (available_time_minutes > 0),
    available_equipment TEXT[] DEFAULT ARRAY['stove', 'pan', 'knife', 'pot'],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Meal Logs (User photo capture & confirmation sessions)
CREATE TABLE IF NOT EXISTS meal_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    input_mode TEXT NOT NULL DEFAULT 'photo' CHECK (input_mode IN ('photo', 'manual_search', 'menu_text')),
    image_path TEXT,
    status TEXT NOT NULL DEFAULT 'pending_confirmation' CHECK (status IN (
        'uploading',
        'analyzing',
        'pending_confirmation',
        'confirmed',
        'archived',
        'deleted'
    )),
    revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
    market_id UUID REFERENCES markets(id) ON DELETE SET NULL,
    consent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Meal Items (Confirmed food components and portion weights)
CREATE TABLE IF NOT EXISTS meal_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_log_id UUID NOT NULL REFERENCES meal_logs(id) ON DELETE CASCADE,
    food_id UUID NOT NULL REFERENCES foods(id) ON DELETE RESTRICT,
    confirmed_grams NUMERIC(8,2) NOT NULL CHECK (confirmed_grams > 0),
    preparation_state TEXT NOT NULL,
    portion_source TEXT NOT NULL DEFAULT 'user_entered' CHECK (portion_source IN (
        'user_entered',
        'ai_estimated_unconfirmed',
        'standard_reference_serving'
    )),
    confidence_notes TEXT,
    display_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Meal Reports (Deterministic server-calculated nutrition summary and evidence receipt)
CREATE TABLE IF NOT EXISTS meal_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_log_id UUID NOT NULL REFERENCES meal_logs(id) ON DELETE CASCADE,
    revision INTEGER NOT NULL,
    total_energy_kcal NUMERIC(8,2),
    total_protein_g NUMERIC(8,2),
    total_carbohydrate_g NUMERIC(8,2),
    total_fat_g NUMERIC(8,2),
    total_fibre_g NUMERIC(8,2),
    nutrient_completeness JSONB NOT NULL DEFAULT '{}'::jsonb,
    evidence_sources JSONB NOT NULL DEFAULT '[]'::jsonb,
    formula_version TEXT NOT NULL DEFAULT 'v1.0.0-fao_bangladesh',
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_meal_report_revision UNIQUE (meal_log_id, revision)
);

-- Meal Plans (Alternative meal pivots, constraint solver outputs, and smart shopping lists)
CREATE TABLE IF NOT EXISTS meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    meal_log_id UUID REFERENCES meal_logs(id) ON DELETE SET NULL,
    meal_revision INTEGER,
    selected_recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
    constraints_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    market_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    nutrient_totals JSONB NOT NULL DEFAULT '{}'::jsonb,
    nutrient_completeness JSONB NOT NULL DEFAULT '{}'::jsonb,
    shopping_list JSONB NOT NULL DEFAULT '[]'::jsonb,
    estimated_cash_cost NUMERIC(10,2) CHECK (estimated_cash_cost >= 0),
    currency_code VARCHAR(3) NOT NULL DEFAULT 'BDT',
    data_mode TEXT NOT NULL DEFAULT 'synthetic_demo' CHECK (data_mode IN (
        'live_retailer',
        'dated_manual_observation',
        'historical_reference',
        'synthetic_demo'
    )),
    status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'accepted', 'rejected', 'superseded')),
    formula_version TEXT NOT NULL DEFAULT 'v1.0.0-planner',
    created_at TIMESTAMPTZ DEFAULT now()
);


-- ==================================================================
-- MIGRATION: 20261108000007_create_knowledge_and_vector_tables.sql
-- ==================================================================

-- NutriLens Database Migration
-- 20261108000007_create_knowledge_and_vector_tables.sql
-- Creates reviewed knowledge documents and vector chunks for grounded RAG nutrition guidance.

-- Knowledge Documents (Public guidelines, literature, and dietary standards)
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    publisher TEXT NOT NULL,
    source_url TEXT,
    country_code VARCHAR(2) NOT NULL DEFAULT 'BD',
    language_code VARCHAR(10) NOT NULL DEFAULT 'bn',
    population TEXT DEFAULT 'general_adult',
    published_at DATE,
    version TEXT,
    review_status TEXT NOT NULL DEFAULT 'approved' CHECK (review_status IN ('draft', 'reviewed', 'approved')),
    license_note TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Knowledge Chunks (Text chunks with pgvector embeddings for similarity retrieval)
CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    chunk_text TEXT NOT NULL,
    section_or_page TEXT,
    embedding VECTOR(768),
    embedding_model TEXT NOT NULL DEFAULT 'text-embedding-004',
    embedding_dimension INTEGER NOT NULL DEFAULT 768,
    embedding_version TEXT NOT NULL DEFAULT 'v1',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Vector Cosine Similarity Index (HNSW for high-performance approximate nearest neighbor search)
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding_hnsw 
ON knowledge_chunks 
USING hnsw (embedding vector_cosine_ops);


-- ==================================================================
-- MIGRATION: 20261108000008_create_indexes_and_constraints.sql
-- ==================================================================

-- NutriLens Database Migration
-- 20261108000008_create_indexes_and_constraints.sql
-- Optimizes query performance on foreign keys, normalized alias matching, and temporal lookups.

-- Foods & Aliases
CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(category);
CREATE INDEX IF NOT EXISTS idx_foods_source_id ON foods(source_id);
CREATE INDEX IF NOT EXISTS idx_food_names_food_id ON food_names(food_id);
CREATE INDEX IF NOT EXISTS idx_food_names_normalized ON food_names(normalized_alias);
CREATE INDEX IF NOT EXISTS idx_food_names_lang_alias ON food_names(language_code, normalized_alias);

-- Recipes & Ingredients
CREATE INDEX IF NOT EXISTS idx_recipes_cuisine ON recipes(cuisine);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_food_id ON recipe_ingredients(food_id);

-- Markets & Observations
CREATE INDEX IF NOT EXISTS idx_market_observations_market_food ON market_observations(market_id, food_id);
CREATE INDEX IF NOT EXISTS idx_market_observations_observed_at ON market_observations(observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_observations_data_mode ON market_observations(data_mode);

-- User & Meal Sessions
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_id ON meal_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_items_meal_log_id ON meal_items(meal_log_id);
CREATE INDEX IF NOT EXISTS idx_meal_reports_meal_log_id ON meal_reports(meal_log_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_meal_log_id ON meal_plans(meal_log_id);

-- Knowledge Base
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_document_id ON knowledge_chunks(document_id);


-- ==================================================================
-- MIGRATION: 20261108000009_create_rls_and_security_policies.sql
-- ==================================================================

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



-- ==================================================================
-- MIGRATION: 20261110000010_create_auth_and_user_personalization_tables.sql
-- ==================================================================
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



-- ==================================================================
-- MIGRATION: 20261111000011_create_nutrition_profile_tables.sql
-- ==================================================================
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



-- ==================================================================
-- MIGRATION: 20261111000012_add_profile_avatar_and_terms.sql
-- ==================================================================
-- NutriLens Database Migration
-- 20261111000012_add_profile_avatar_and_terms.sql
-- Adds profile photo (avatar_url), terms acceptance tracking, and onboarding status columns.

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS avatar_url TEXT,
    ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS terms_version TEXT DEFAULT '1.0',
    ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'ONBOARDING_COMPLETED' CHECK (onboarding_status IN ('ONBOARDING_REQUIRED', 'ONBOARDING_COMPLETED'));

-- Create storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for user avatars
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );



-- ==================================================================
-- MIGRATION: 20261112000013_remove_seeded_auth_accounts_and_harden_rls.sql
-- ==================================================================
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

    DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
    CREATE POLICY "Users can delete own profile" ON profiles
        FOR DELETE TO authenticated
        USING (auth.uid() = id);
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 5. Track permanently deleted accounts to prevent re-login
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

-- 6. Function to prepare an email for fresh re-registration (purges any ghost deleted accounts)
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

-- 7. Trigger on auth.users: automatically clear any deleted_accounts tracking when new user is created
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

-- 8. RPC function for secure account self-deletion (GDPR / Right to be Forgotten)
-- Permanently deletes all user tables and completely purges auth.users to block re-login
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
    -- Determine target user: either passed explicitly or obtained from active session
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

    -- 1. Record in deleted_accounts tracking table
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

    -- 4. Clean up auth schema identities, sessions, and permanently purge auth.users
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

-- 7. Fix and broaden check constraints on profiles table to avoid constraint violation errors
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

