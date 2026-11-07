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
