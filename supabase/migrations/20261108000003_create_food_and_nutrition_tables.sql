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
