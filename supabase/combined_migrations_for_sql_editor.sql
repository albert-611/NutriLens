
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


