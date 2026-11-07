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
