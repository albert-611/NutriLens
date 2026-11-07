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
