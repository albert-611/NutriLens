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
    input_state TEXT NOT NULL CHECK (input_state IN ('raw', 'boiled', 'steamed', 'fried', 'roasted', 'curried', 'drained', 'commercial')),
    is_optional BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
