-- NutriLens Seed Data: Sources & Markets
-- supabase/seeds/01_data_sources_and_markets.sql

-- 1. Data Sources (Deterministic UUIDs)
INSERT INTO data_sources (id, publisher, title, source_url, source_type, license_note, source_version, published_at, review_status, notes)
VALUES
(
    '11111111-1111-1111-1111-111111111101',
    'Food and Agriculture Organization (FAO) / Institute of Nutrition and Food Science (INFS)',
    'Food Composition Table for Bangladesh (FCTB)',
    'https://www.fao.org/nutrition/assessment/food-composition-tables/en/',
    'fct',
    'Open research dataset (2013 Edition)',
    '2013-v1',
    '2013-06-01',
    'approved',
    'Primary authoritative nutrient composition table for Bangladesh local foods.'
),
(
    '11111111-1111-1111-1111-111111111102',
    'USDA Agricultural Research Service',
    'FoodData Central (FDC)',
    'https://fdc.nal.usda.gov/',
    'fct',
    'Public domain US government work',
    '2023-FDC',
    '2023-10-01',
    'approved',
    'Secondary reference for preparation states and standard whole commodities.'
),
(
    '11111111-1111-1111-1111-111111111103',
    'Bangladesh Institute of Research and Rehabilitation in Diabetes, Endocrine and Metabolic Disorders (BIRDEM) & DGHS',
    'Dietary Guidelines for Bangladesh',
    'https://dghs.gov.bd/',
    'guideline',
    'National public health guideline',
    '2015-BIRDEM',
    '2015-01-01',
    'approved',
    'National dietary guidance for adult macronutrient balance, pulse intake, and edible oil recommendations.'
),
(
    '11111111-1111-1111-1111-111111111104',
    'NutriLens Synthetic Market Simulator',
    'Savar & Ashulia Local Bazar Benchmark Simulation Dataset',
    'https://nutrilens.internal/data/savar-ashulia-demo',
    'synthetic_generator',
    'Prototype test fixtures only. Explicitly labeled SIMULATED DEMO DATA.',
    'demo-2026-v1',
    '2026-11-08',
    'approved',
    'Synthetic market price and stock simulation for Savar and Ashulia test environments.'
)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    publisher = EXCLUDED.publisher,
    source_version = EXCLUDED.source_version;

-- 2. Pilot Demo Markets (Deterministic UUIDs)
INSERT INTO markets (id, country_code, region, city, market_name, currency_code, time_zone, supported_languages, coverage_status, is_demo_market)
VALUES
(
    '22222222-2222-2222-2222-222222222201',
    'BD',
    'Dhaka Division',
    'Savar',
    'Savar Demo Market',
    'BDT',
    'Asia/Dhaka',
    ARRAY['bn', 'en'],
    'pilot_market',
    true
),
(
    '22222222-2222-2222-2222-222222222202',
    'BD',
    'Dhaka Division',
    'Ashulia',
    'Ashulia Demo Market',
    'BDT',
    'Asia/Dhaka',
    ARRAY['bn', 'en'],
    'pilot_market',
    true
)
ON CONFLICT (id) DO UPDATE SET 
    market_name = EXCLUDED.market_name,
    coverage_status = EXCLUDED.coverage_status;
