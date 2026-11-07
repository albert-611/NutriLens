
-- ==================================================================
-- FILE: supabase/seeds/01_data_sources_and_markets.sql
-- ==================================================================

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


-- ==================================================================
-- FILE: supabase/seeds/02_foods_and_aliases.sql
-- ==================================================================

-- NutriLens Seed Data: Canonical Foods & Multilingual Aliases
-- supabase/seeds/02_foods_and_aliases.sql
-- Contains ~50 reviewed Bangladesh food items per 100g edible portion, with NULL preserved for unmeasured nutrients.

-- 1. Foods Catalog
INSERT INTO foods (
    id, canonical_name, category, preparation_state, edible_basis, basis_grams,
    energy_kcal, protein_g, carbohydrate_g, fat_g, fibre_g,
    source_id, external_record_id, source_version, review_status, nutrient_completeness
)
VALUES
-- Grains & Cereals
(
    '33333333-3333-3333-3333-333333333301',
    'Cooked White Rice (Parboiled)', 'grains_and_cereals', 'boiled', 'edible_portion_100g', 100.00,
    130.00, 2.70, 28.20, 0.30, 0.40,
    '11111111-1111-1111-1111-111111111101', 'FCTB-01-001', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333302',
    'Raw White Rice (Milled)', 'grains_and_cereals', 'raw', 'edible_portion_100g', 100.00,
    358.00, 7.10, 79.00, 0.60, 1.30,
    '11111111-1111-1111-1111-111111111101', 'FCTB-01-002', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333303',
    'Brown Rice (Lal Chal, Cooked)', 'grains_and_cereals', 'boiled', 'edible_portion_100g', 100.00,
    123.00, 2.74, 25.58, 0.97, 1.60,
    '11111111-1111-1111-1111-111111111101', 'FCTB-01-005', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333304',
    'Atta (Whole Wheat Flour)', 'grains_and_cereals', 'raw', 'edible_portion_100g', 100.00,
    341.00, 12.10, 69.40, 1.70, 11.20,
    '11111111-1111-1111-1111-111111111101', 'FCTB-01-010', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333305',
    'Handmade Whole Wheat Roti', 'grains_and_cereals', 'roasted', 'edible_portion_100g', 100.00,
    264.00, 9.30, 53.70, 1.30, 8.60,
    '11111111-1111-1111-1111-111111111101', 'FCTB-01-012', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333306',
    'Puffed Rice (Muri)', 'grains_and_cereals', 'commercial', 'edible_portion_100g', 100.00,
    383.00, 6.30, 85.60, 0.50, 1.70,
    '11111111-1111-1111-1111-111111111101', 'FCTB-01-015', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333307',
    'Flattened Rice (Chira)', 'grains_and_cereals', 'raw', 'edible_portion_100g', 100.00,
    346.00, 6.60, 77.30, 1.20, 2.80,
    '11111111-1111-1111-1111-111111111101', 'FCTB-01-016', '2013-v1', 'approved', 'complete'
),

-- Pulses & Legumes
(
    '33333333-3333-3333-3333-333333333308',
    'Cooked Red Lentils (Masoor Dal Jhol)', 'pulses_and_legumes', 'boiled', 'edible_portion_100g', 100.00,
    98.00, 7.80, 15.20, 0.70, 3.40,
    '11111111-1111-1111-1111-111111111101', 'FCTB-02-001', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333309',
    'Raw Red Lentils (Masoor Dal)', 'pulses_and_legumes', 'raw', 'edible_portion_100g', 100.00,
    343.00, 25.10, 59.00, 0.70, 10.80,
    '11111111-1111-1111-1111-111111111101', 'FCTB-02-002', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333310',
    'Cooked Moong Dal (Mung Bean)', 'pulses_and_legumes', 'boiled', 'edible_portion_100g', 100.00,
    105.00, 7.02, 19.15, 0.38, 7.60,
    '11111111-1111-1111-1111-111111111101', 'FCTB-02-005', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333311',
    'Raw Moong Dal', 'pulses_and_legumes', 'raw', 'edible_portion_100g', 100.00,
    347.00, 24.50, 59.90, 1.20, 16.30,
    '11111111-1111-1111-1111-111111111101', 'FCTB-02-006', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333312',
    'Boiled Chickpeas (Chhola)', 'pulses_and_legumes', 'boiled', 'edible_portion_100g', 100.00,
    164.00, 8.86, 27.42, 2.59, 7.60,
    '11111111-1111-1111-1111-111111111101', 'FCTB-02-010', '2013-v1', 'approved', 'complete'
),

-- Eggs
(
    '33333333-3333-3333-3333-333333333313',
    'Boiled Chicken Egg', 'eggs', 'boiled', 'edible_portion_100g', 100.00,
    155.00, 12.58, 1.12, 10.61, 0.00,
    '11111111-1111-1111-1111-111111111102', 'FDC-171287', '2023-FDC', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333314',
    'Fried Egg (Dim Bhaji with Onion & Oil)', 'eggs', 'fried', 'edible_portion_100g', 100.00,
    196.00, 13.60, 1.80, 15.10, 0.20,
    '11111111-1111-1111-1111-111111111101', 'FCTB-04-002', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333315',
    'Duck Egg (Boiled)', 'eggs', 'boiled', 'edible_portion_100g', 100.00,
    185.00, 12.81, 1.45, 13.77, 0.00,
    '11111111-1111-1111-1111-111111111101', 'FCTB-04-004', '2013-v1', 'approved', 'complete'
),

-- Poultry & Meat
(
    '33333333-3333-3333-3333-333333333316',
    'Broiler Chicken Meat (Raw)', 'meat_and_poultry', 'raw', 'edible_portion_100g', 100.00,
    120.00, 21.40, 0.00, 3.80, 0.00,
    '11111111-1111-1111-1111-111111111101', 'FCTB-05-001', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333317',
    'Chicken Curry (Murgir Mangsho Jhol)', 'meat_and_poultry', 'curried', 'edible_portion_100g', 100.00,
    168.00, 16.50, 3.20, 9.80, 0.80,
    '11111111-1111-1111-1111-111111111101', 'FCTB-05-004', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333318',
    'Beef (Lean, Raw)', 'meat_and_poultry', 'raw', 'edible_portion_100g', 100.00,
    132.00, 22.10, 0.00, 4.80, 0.00,
    '11111111-1111-1111-1111-111111111101', 'FCTB-05-010', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333319',
    'Beef Curry / Bhuna', 'meat_and_poultry', 'curried', 'edible_portion_100g', 100.00,
    215.00, 18.20, 2.50, 14.70, 0.50,
    '11111111-1111-1111-1111-111111111101', 'FCTB-05-012', '2013-v1', 'approved', 'complete'
),

-- Fish & Seafood
(
    '33333333-3333-3333-3333-333333333320',
    'Rohu Fish (Rui Mach, Raw)', 'fish_and_seafood', 'raw', 'edible_portion_100g', 100.00,
    97.00, 16.60, 4.40, 1.40, 0.00,
    '11111111-1111-1111-1111-111111111101', 'FCTB-03-001', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333321',
    'Rohu Fish Curry (Rui Macher Jhol)', 'fish_and_seafood', 'curried', 'edible_portion_100g', 100.00,
    135.00, 13.80, 3.10, 7.40, 0.60,
    '11111111-1111-1111-1111-111111111101', 'FCTB-03-002', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333322',
    'Tilapia Fish (Raw)', 'fish_and_seafood', 'raw', 'edible_portion_100g', 100.00,
    96.00, 20.08, 0.00, 1.70, 0.00,
    '11111111-1111-1111-1111-111111111101', 'FCTB-03-015', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333323',
    'Pangas Fish (Raw)', 'fish_and_seafood', 'raw', 'edible_portion_100g', 100.00,
    124.00, 15.20, 0.00, 7.10, 0.00,
    '11111111-1111-1111-1111-111111111101', 'FCTB-03-020', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333324',
    'Hilsa Fish (Ilish Mach, Raw)', 'fish_and_seafood', 'raw', 'edible_portion_100g', 100.00,
    273.00, 14.80, 2.90, 22.30, 0.00,
    '11111111-1111-1111-1111-111111111101', 'FCTB-03-030', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333325',
    'Small Prawn / Shrimp (Chingri, Raw)', 'fish_and_seafood', 'raw', 'edible_portion_100g', 100.00,
    85.00, 18.10, 0.80, 0.90, 0.00,
    '11111111-1111-1111-1111-111111111101', 'FCTB-03-042', '2013-v1', 'approved', 'complete'
),

-- Vegetables & Greens
(
    '33333333-3333-3333-3333-333333333326',
    'Potato (Alu, Boiled)', 'vegetables', 'boiled', 'edible_portion_100g', 100.00,
    87.00, 1.87, 20.01, 0.10, 1.80,
    '11111111-1111-1111-1111-111111111101', 'FCTB-06-001', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333327',
    'Potato (Alu, Raw)', 'vegetables', 'raw', 'edible_portion_100g', 100.00,
    77.00, 2.05, 17.49, 0.09, 2.10,
    '11111111-1111-1111-1111-111111111101', 'FCTB-06-002', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333328',
    'Spinach (Palong Shak, Raw)', 'vegetables', 'raw', 'edible_portion_100g', 100.00,
    23.00, 2.97, 3.63, 0.39, 2.20,
    '11111111-1111-1111-1111-111111111101', 'FCTB-06-015', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333329',
    'Spinach Bhaji (Cooked with Oil & Garlic)', 'vegetables', 'fried', 'edible_portion_100g', 100.00,
    74.00, 3.10, 4.20, 5.20, 2.60,
    '11111111-1111-1111-1111-111111111101', 'FCTB-06-016', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333330',
    'Red Amaranth (Lal Shak, Cooked Bhaji)', 'vegetables', 'fried', 'edible_portion_100g', 100.00,
    68.00, 2.80, 4.60, 4.50, 2.80,
    '11111111-1111-1111-1111-111111111101', 'FCTB-06-020', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333331',
    'Bottle Gourd (Lau, Boiled/Curried)', 'vegetables', 'boiled', 'edible_portion_100g', 100.00,
    14.00, 0.62, 3.39, 0.02, 1.20,
    '11111111-1111-1111-1111-111111111101', 'FCTB-06-030', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333332',
    'Eggplant (Begun, Fried / Begun Bhaja)', 'vegetables', 'fried', 'edible_portion_100g', 100.00,
    115.00, 1.50, 7.80, 9.10, 3.40,
    '11111111-1111-1111-1111-111111111101', 'FCTB-06-035', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333333',
    'Tomato (Fresh, Raw)', 'vegetables', 'raw', 'edible_portion_100g', 100.00,
    18.00, 0.88, 3.89, 0.20, 1.20,
    '11111111-1111-1111-1111-111111111101', 'FCTB-06-040', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333334',
    'Carrot (Gajor, Raw)', 'vegetables', 'raw', 'edible_portion_100g', 100.00,
    41.00, 0.93, 9.58, 0.24, 2.80,
    '11111111-1111-1111-1111-111111111101', 'FCTB-06-045', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333335',
    'Cabbage (Bandhakopi, Cooked)', 'vegetables', 'boiled', 'edible_portion_100g', 100.00,
    23.00, 1.27, 5.43, 0.06, 1.90,
    '11111111-1111-1111-1111-111111111101', 'FCTB-06-050', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333336',
    'Cauliflower (Fulkopi, Cooked)', 'vegetables', 'boiled', 'edible_portion_100g', 100.00,
    25.00, 1.92, 4.97, 0.28, 2.00,
    '11111111-1111-1111-1111-111111111101', 'FCTB-06-055', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333337',
    'Sweet Pumpkin (Misti Kumra, Cooked)', 'vegetables', 'boiled', 'edible_portion_100g', 100.00,
    26.00, 1.00, 6.50, 0.10, 1.10,
    '11111111-1111-1111-1111-111111111101', 'FCTB-06-060', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333338',
    'Green Papaya (Kacha Pepe, Boiled)', 'vegetables', 'boiled', 'edible_portion_100g', 100.00,
    27.00, 0.70, 6.00, 0.10, 1.70,
    '11111111-1111-1111-1111-111111111101', 'FCTB-06-065', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333339',
    'Okra / Lady Finger (Dherosh, Cooked)', 'vegetables', 'boiled', 'edible_portion_100g', 100.00,
    33.00, 1.93, 7.45, 0.19, 3.20,
    '11111111-1111-1111-1111-111111111101', 'FCTB-06-070', '2013-v1', 'approved', 'complete'
),

-- Fruits
(
    '33333333-3333-3333-3333-333333333340',
    'Banana (Sagor / Champa Kola)', 'fruits', 'raw', 'edible_portion_100g', 100.00,
    89.00, 1.09, 22.84, 0.33, 2.60,
    '11111111-1111-1111-1111-111111111101', 'FCTB-07-001', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333341',
    'Guava (Peyara, Fresh)', 'fruits', 'raw', 'edible_portion_100g', 100.00,
    68.00, 2.55, 14.32, 0.95, 5.40,
    '11111111-1111-1111-1111-111111111101', 'FCTB-07-010', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333342',
    'Ripe Papaya (Paka Pepe)', 'fruits', 'raw', 'edible_portion_100g', 100.00,
    43.00, 0.47, 10.82, 0.26, 1.70,
    '11111111-1111-1111-1111-111111111101', 'FCTB-07-015', '2013-v1', 'approved', 'complete'
),

-- Dairy
(
    '33333333-3333-3333-3333-333333333343',
    'Cow Milk (Boiled/Whole)', 'dairy', 'boiled', 'edible_portion_100g', 100.00,
    61.00, 3.15, 4.80, 3.25, 0.00,
    '11111111-1111-1111-1111-111111111101', 'FCTB-08-001', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333344',
    'Plain Curd / Sour Yogurt (Tok Doi)', 'dairy', 'commercial', 'edible_portion_100g', 100.00,
    63.00, 3.50, 4.70, 3.30, 0.00,
    '11111111-1111-1111-1111-111111111101', 'FCTB-08-005', '2013-v1', 'approved', 'complete'
),

-- Oils, Fats & Condiments
(
    '33333333-3333-3333-3333-333333333345',
    'Mustard Oil (Shorsher Tel)', 'oils_and_fats', 'raw', 'edible_portion_100g', 100.00,
    884.00, 0.00, 0.00, 100.00, 0.00,
    '11111111-1111-1111-1111-111111111101', 'FCTB-09-001', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333346',
    'Soybean Oil', 'oils_and_fats', 'raw', 'edible_portion_100g', 100.00,
    884.00, 0.00, 0.00, 100.00, 0.00,
    '11111111-1111-1111-1111-111111111101', 'FCTB-09-002', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333347',
    'Onion (Peyaj, Raw)', 'spices_and_condiments', 'raw', 'edible_portion_100g', 100.00,
    40.00, 1.10, 9.34, 0.10, 1.70,
    '11111111-1111-1111-1111-111111111101', 'FCTB-10-001', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333348',
    'Garlic (Roshun, Raw)', 'spices_and_condiments', 'raw', 'edible_portion_100g', 100.00,
    149.00, 6.36, 33.06, 0.50, 2.10,
    '11111111-1111-1111-1111-111111111101', 'FCTB-10-005', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333349',
    'Green Chili (Kacha Morich, Raw)', 'spices_and_condiments', 'raw', 'edible_portion_100g', 100.00,
    40.00, 1.87, 8.81, 0.44, 1.50,
    '11111111-1111-1111-1111-111111111101', 'FCTB-10-010', '2013-v1', 'approved', 'complete'
),
(
    '33333333-3333-3333-3333-333333333350',
    'Ginger (Ada, Raw)', 'spices_and_condiments', 'raw', 'edible_portion_100g', 100.00,
    80.00, 1.82, 17.77, 0.75, 2.00,
    '11111111-1111-1111-1111-111111111101', 'FCTB-10-015', '2013-v1', 'approved', 'complete'
)
ON CONFLICT (id) DO UPDATE SET 
    canonical_name = EXCLUDED.canonical_name,
    energy_kcal = EXCLUDED.energy_kcal,
    protein_g = EXCLUDED.protein_g,
    carbohydrate_g = EXCLUDED.carbohydrate_g,
    fat_g = EXCLUDED.fat_g,
    fibre_g = EXCLUDED.fibre_g;

-- 2. Food Names and Multilingual Search Aliases (~100 aliases across Bangla, English, and phonetic transliteration)
INSERT INTO food_names (food_id, language_code, local_name, normalized_alias, alias_type)
VALUES
-- Rice
('33333333-3333-3333-3333-333333333301', 'bn', 'ভাত', 'ভাত', 'canonical'),
('33333333-3333-3333-3333-333333333301', 'bn', 'সিদ্ধ ভাত', 'সিদ্ধ ভাত', 'common'),
('33333333-3333-3333-3333-333333333301', 'en', 'Cooked White Rice', 'cooked white rice', 'canonical'),
('33333333-3333-3333-3333-333333333301', 'bn_translit', 'Bhat', 'bhat', 'common'),
('33333333-3333-3333-3333-333333333301', 'bn_translit', 'Sada Bhat', 'sada bhat', 'colloquial'),

('33333333-3333-3333-3333-333333333302', 'bn', 'চাল', 'চাল', 'canonical'),
('33333333-3333-3333-3333-333333333302', 'en', 'Raw Rice', 'raw rice', 'canonical'),
('33333333-3333-3333-3333-333333333302', 'bn_translit', 'Chal', 'chal', 'common'),

('33333333-3333-3333-3333-333333333303', 'bn', 'লাল চালের ভাত', 'লাল চালের ভাত', 'canonical'),
('33333333-3333-3333-3333-333333333303', 'en', 'Brown Rice', 'brown rice', 'canonical'),
('33333333-3333-3333-3333-333333333303', 'bn_translit', 'Lal Chaler Bhat', 'lal chaler bhat', 'common'),

('33333333-3333-3333-3333-333333333304', 'bn', 'আটা', 'আটা', 'canonical'),
('33333333-3333-3333-3333-333333333304', 'en', 'Whole Wheat Flour', 'whole wheat flour', 'canonical'),
('33333333-3333-3333-3333-333333333304', 'bn_translit', 'Atta', 'atta', 'common'),

('33333333-3333-3333-3333-333333333305', 'bn', 'রুটি', 'রুটি', 'canonical'),
('33333333-3333-3333-3333-333333333305', 'bn', 'হাতে বানানো রুটি', 'হাতে বানানো রুটি', 'common'),
('33333333-3333-3333-3333-333333333305', 'en', 'Roti', 'roti', 'canonical'),
('33333333-3333-3333-3333-333333333305', 'bn_translit', 'Ruti', 'ruti', 'common'),

('33333333-3333-3333-3333-333333333306', 'bn', 'মুড়ি', 'মুড়ি', 'canonical'),
('33333333-3333-3333-3333-333333333306', 'en', 'Puffed Rice', 'puffed rice', 'canonical'),
('33333333-3333-3333-3333-333333333306', 'bn_translit', 'Muri', 'muri', 'common'),

('33333333-3333-3333-3333-333333333307', 'bn', 'চিঁড়া', 'চিঁড়া', 'canonical'),
('33333333-3333-3333-3333-333333333307', 'en', 'Flattened Rice', 'flattened rice', 'canonical'),
('33333333-3333-3333-3333-333333333307', 'bn_translit', 'Chira', 'chira', 'common'),

-- Lentils
('33333333-3333-3333-3333-333333333308', 'bn', 'মসুর ডাল (রান্না)', 'মসুর ডাল রান্না', 'canonical'),
('33333333-3333-3333-3333-333333333308', 'bn', 'ডাল', 'ডাল', 'common'),
('33333333-3333-3333-3333-333333333308', 'en', 'Cooked Lentil Soup', 'cooked lentil soup', 'canonical'),
('33333333-3333-3333-3333-333333333308', 'bn_translit', 'Masoor Dal', 'masoor dal', 'common'),
('33333333-3333-3333-3333-333333333308', 'bn_translit', 'Patla Dal', 'patla dal', 'colloquial'),

('33333333-3333-3333-3333-333333333309', 'bn', 'কাঁচা মসুর ডাল', 'কাঁচা মসুর ডাল', 'canonical'),
('33333333-3333-3333-3333-333333333309', 'en', 'Raw Red Lentils', 'raw red lentils', 'canonical'),
('33333333-3333-3333-3333-333333333309', 'bn_translit', 'Kacha Masoor Dal', 'kacha masoor dal', 'common'),

('33333333-3333-3333-3333-333333333310', 'bn', 'মুগ ডাল (রান্না)', 'মুগ ডাল রান্না', 'canonical'),
('33333333-3333-3333-3333-333333333310', 'en', 'Cooked Moong Dal', 'cooked moong dal', 'canonical'),
('33333333-3333-3333-3333-333333333310', 'bn_translit', 'Moong Dal', 'moong dal', 'common'),

('33333333-3333-3333-3333-333333333312', 'bn', 'ছোলা (সিদ্ধ/ভুনা)', 'ছোলা সিদ্ধ ভুনা', 'canonical'),
('33333333-3333-3333-3333-333333333312', 'en', 'Chickpeas', 'chickpeas', 'canonical'),
('33333333-3333-3333-3333-333333333312', 'bn_translit', 'Chhola', 'chhola', 'common'),
('33333333-3333-3333-3333-333333333312', 'bn_translit', 'Chana Bhuna', 'chana bhuna', 'colloquial'),

-- Eggs
('33333333-3333-3333-3333-333333333313', 'bn', 'সিদ্ধ ডিম', 'সিদ্ধ ডিম', 'canonical'),
('33333333-3333-3333-3333-333333333313', 'en', 'Boiled Egg', 'boiled egg', 'canonical'),
('33333333-3333-3333-3333-333333333313', 'bn_translit', 'Siddha Dim', 'siddha dim', 'common'),

('33333333-3333-3333-3333-333333333314', 'bn', 'ডিম ভাজি', 'ডিম ভাজি', 'canonical'),
('33333333-3333-3333-3333-333333333314', 'bn', 'ডিম ওমলেট', 'ডিম ওমলেট', 'colloquial'),
('33333333-3333-3333-3333-333333333314', 'en', 'Fried Egg Omelette', 'fried egg omelette', 'canonical'),
('33333333-3333-3333-3333-333333333314', 'bn_translit', 'Dim Bhaji', 'dim bhaji', 'common'),

-- Poultry & Meat
('33333333-3333-3333-3333-333333333316', 'bn', 'মুরগির মাংস (কাঁচা)', 'মুরগির মাংস কাঁচা', 'canonical'),
('33333333-3333-3333-3333-333333333316', 'en', 'Chicken Meat Raw', 'chicken meat raw', 'canonical'),
('33333333-3333-3333-3333-333333333316', 'bn_translit', 'Murgir Mangsho Kacha', 'murgir mangsho kacha', 'common'),

('33333333-3333-3333-3333-333333333317', 'bn', 'মুরগির মাংসের ঝোল', 'মুরগির মাংসের ঝোল', 'canonical'),
('33333333-3333-3333-3333-333333333317', 'bn', 'চিকেন কারি', 'চিকেন কারি', 'colloquial'),
('33333333-3333-3333-3333-333333333317', 'en', 'Chicken Curry', 'chicken curry', 'canonical'),
('33333333-3333-3333-3333-333333333317', 'bn_translit', 'Murgir Mangsho Jhol', 'murgir mangsho jhol', 'common'),

('33333333-3333-3333-3333-333333333319', 'bn', 'গরুর মাংস ভুনা', 'গরুর মাংস ভুনা', 'canonical'),
('33333333-3333-3333-3333-333333333319', 'en', 'Beef Bhuna', 'beef bhuna', 'canonical'),
('33333333-3333-3333-3333-333333333319', 'bn_translit', 'Gorur Mangsho Bhuna', 'gorur mangsho bhuna', 'common'),

-- Fish
('33333333-3333-3333-3333-333333333320', 'bn', 'রুই মাছ', 'রুই মাছ', 'canonical'),
('33333333-3333-3333-3333-333333333320', 'en', 'Rohu Fish', 'rohu fish', 'canonical'),
('33333333-3333-3333-3333-333333333320', 'bn_translit', 'Rui Mach', 'rui mach', 'common'),

('33333333-3333-3333-3333-333333333321', 'bn', 'রুই মাছের ঝোল', 'রুই মাছের ঝোল', 'canonical'),
('33333333-3333-3333-3333-333333333321', 'en', 'Rohu Fish Curry', 'rohu fish curry', 'canonical'),
('33333333-3333-3333-3333-333333333321', 'bn_translit', 'Rui Macher Jhol', 'rui macher jhol', 'common'),

('33333333-3333-3333-3333-333333333322', 'bn', 'তেলাপিয়া মাছ', 'তেলাপিয়া মাছ', 'canonical'),
('33333333-3333-3333-3333-333333333322', 'en', 'Tilapia Fish', 'tilapia fish', 'canonical'),
('33333333-3333-3333-3333-333333333322', 'bn_translit', 'Tilapia Mach', 'tilapia mach', 'common'),

('33333333-3333-3333-3333-333333333324', 'bn', 'ইলিশ মাছ', 'ইলিশ মাছ', 'canonical'),
('33333333-3333-3333-3333-333333333324', 'en', 'Hilsa Fish', 'hilsa fish', 'canonical'),
('33333333-3333-3333-3333-333333333324', 'bn_translit', 'Ilish Mach', 'ilish mach', 'common'),

('33333333-3333-3333-3333-333333333325', 'bn', 'চিংড়ি মাছ', 'চিংড়ি মাছ', 'canonical'),
('33333333-3333-3333-3333-333333333325', 'en', 'Shrimp Prawn', 'shrimp prawn', 'canonical'),
('33333333-3333-3333-3333-333333333325', 'bn_translit', 'Chingri Mach', 'chingri mach', 'common'),

-- Vegetables
('33333333-3333-3333-3333-333333333326', 'bn', 'সিদ্ধ আলু', 'সিদ্ধ আলু', 'canonical'),
('33333333-3333-3333-3333-333333333326', 'bn', 'আলু ভর্তা', 'আলু ভর্তা', 'colloquial'),
('33333333-3333-3333-3333-333333333326', 'en', 'Boiled Potato', 'boiled potato', 'canonical'),
('33333333-3333-3333-3333-333333333326', 'bn_translit', 'Alu Siddha', 'alu siddha', 'common'),

('33333333-3333-3333-3333-333333333328', 'bn', 'পালং শাক', 'পালং শাক', 'canonical'),
('33333333-3333-3333-3333-333333333328', 'en', 'Spinach', 'spinach', 'canonical'),
('33333333-3333-3333-3333-333333333328', 'bn_translit', 'Palong Shak', 'palong shak', 'common'),

('33333333-3333-3333-3333-333333333329', 'bn', 'পালং শাক ভাজি', 'পালং শাক ভাজি', 'canonical'),
('33333333-3333-3333-3333-333333333329', 'en', 'Fried Spinach Bhaji', 'fried spinach bhaji', 'canonical'),
('33333333-3333-3333-3333-333333333329', 'bn_translit', 'Palong Shak Bhaji', 'palong shak bhaji', 'common'),

('33333333-3333-3333-3333-333333333330', 'bn', 'লাল শাক ভাজি', 'লাল শাক ভাজি', 'canonical'),
('33333333-3333-3333-3333-333333333330', 'en', 'Red Amaranth Bhaji', 'red amaranth bhaji', 'canonical'),
('33333333-3333-3333-3333-333333333330', 'bn_translit', 'Lal Shak Bhaji', 'lal shak bhaji', 'common'),

('33333333-3333-3333-3333-333333333331', 'bn', 'লাউ', 'লাউ', 'canonical'),
('33333333-3333-3333-3333-333333333331', 'en', 'Bottle Gourd', 'bottle gourd', 'canonical'),
('33333333-3333-3333-3333-333333333331', 'bn_translit', 'Lau', 'lau', 'common'),

('33333333-3333-3333-3333-333333333332', 'bn', 'বেগুন ভাজা', 'বেগুন ভাজা', 'canonical'),
('33333333-3333-3333-3333-333333333332', 'en', 'Fried Eggplant', 'fried eggplant', 'canonical'),
('33333333-3333-3333-3333-333333333332', 'bn_translit', 'Begun Bhaja', 'begun bhaja', 'common'),

('33333333-3333-3333-3333-333333333333', 'bn', 'টমেটো', 'টমেটো', 'canonical'),
('33333333-3333-3333-3333-333333333333', 'en', 'Tomato', 'tomato', 'canonical'),
('33333333-3333-3333-3333-333333333333', 'bn_translit', 'Tomato', 'tomato', 'common'),

('33333333-3333-3333-3333-333333333334', 'bn', 'গাজর', 'গাজর', 'canonical'),
('33333333-3333-3333-3333-333333333334', 'en', 'Carrot', 'carrot', 'canonical'),
('33333333-3333-3333-3333-333333333334', 'bn_translit', 'Gajor', 'gajor', 'common'),

('33333333-3333-3333-3333-333333333335', 'bn', 'বাঁধাকপি', 'বাঁধাকপি', 'canonical'),
('33333333-3333-3333-3333-333333333335', 'en', 'Cabbage', 'cabbage', 'canonical'),
('33333333-3333-3333-3333-333333333335', 'bn_translit', 'Bandhakopi', 'bandhakopi', 'common'),

('33333333-3333-3333-3333-333333333336', 'bn', 'ফুলকপি', 'ফুলকপি', 'canonical'),
('33333333-3333-3333-3333-333333333336', 'en', 'Cauliflower', 'cauliflower', 'canonical'),
('33333333-3333-3333-3333-333333333336', 'bn_translit', 'Fulkopi', 'fulkopi', 'common'),

('33333333-3333-3333-3333-333333333337', 'bn', 'মিষ্টি কুমড়া', 'মিষ্টি কুমড়া', 'canonical'),
('33333333-3333-3333-3333-333333333337', 'en', 'Sweet Pumpkin', 'sweet pumpkin', 'canonical'),
('33333333-3333-3333-3333-333333333337', 'bn_translit', 'Misti Kumra', 'misti kumra', 'common'),

('33333333-3333-3333-3333-333333333338', 'bn', 'কাঁচা পেঁপে', 'কাঁচা পেঁপে', 'canonical'),
('33333333-3333-3333-3333-333333333338', 'en', 'Green Papaya', 'green papaya', 'canonical'),
('33333333-3333-3333-3333-333333333338', 'bn_translit', 'Kacha Pepe', 'kacha pepe', 'common'),

('33333333-3333-3333-3333-333333333340', 'bn', 'কলা', 'কলা', 'canonical'),
('33333333-3333-3333-3333-333333333340', 'en', 'Banana', 'banana', 'canonical'),
('33333333-3333-3333-3333-333333333340', 'bn_translit', 'Kola', 'kola', 'common'),

('33333333-3333-3333-3333-333333333341', 'bn', 'পেয়ারা', 'পেয়ারা', 'canonical'),
('33333333-3333-3333-3333-333333333341', 'en', 'Guava', 'guava', 'canonical'),
('33333333-3333-3333-3333-333333333341', 'bn_translit', 'Peyara', 'peyara', 'common'),

-- Dairy
('33333333-3333-3333-3333-333333333343', 'bn', 'দুধ', 'দুধ', 'canonical'),
('33333333-3333-3333-3333-333333333343', 'en', 'Cow Milk', 'cow milk', 'canonical'),
('33333333-3333-3333-3333-333333333343', 'bn_translit', 'Dudh', 'dudh', 'common'),

('33333333-3333-3333-3333-333333333344', 'bn', 'টক দই', 'টক দই', 'canonical'),
('33333333-3333-3333-3333-333333333344', 'en', 'Plain Yogurt Curd', 'plain yogurt curd', 'canonical'),
('33333333-3333-3333-3333-333333333344', 'bn_translit', 'Tok Doi', 'tok doi', 'common'),

-- Oils & Spices
('33333333-3333-3333-3333-333333333345', 'bn', 'সরিষার তেল', 'সরিষার তেল', 'canonical'),
('33333333-3333-3333-3333-333333333345', 'en', 'Mustard Oil', 'mustard oil', 'canonical'),
('33333333-3333-3333-3333-333333333345', 'bn_translit', 'Shorsher Tel', 'shorsher tel', 'common'),

('33333333-3333-3333-3333-333333333346', 'bn', 'সয়াবিন তেল', 'সয়াবিন তেল', 'canonical'),
('33333333-3333-3333-3333-333333333346', 'en', 'Soybean Oil', 'soybean oil', 'canonical'),
('33333333-3333-3333-3333-333333333346', 'bn_translit', 'Soybean Tel', 'soybean tel', 'common'),

('33333333-3333-3333-3333-333333333347', 'bn', 'পেঁয়াজ', 'পেঁয়াজ', 'canonical'),
('33333333-3333-3333-3333-333333333347', 'en', 'Onion', 'onion', 'canonical'),
('33333333-3333-3333-3333-333333333347', 'bn_translit', 'Peyaj', 'peyaj', 'common'),

('33333333-3333-3333-3333-333333333348', 'bn', 'রসুন', 'রসুন', 'canonical'),
('33333333-3333-3333-3333-333333333348', 'en', 'Garlic', 'garlic', 'canonical'),
('33333333-3333-3333-3333-333333333348', 'bn_translit', 'Roshun', 'roshun', 'common'),

('33333333-3333-3333-3333-333333333349', 'bn', 'কাঁচা মরিচ', 'কাঁচা মরিচ', 'canonical'),
('33333333-3333-3333-3333-333333333349', 'en', 'Green Chili', 'green chili', 'canonical'),
('33333333-3333-3333-3333-333333333349', 'bn_translit', 'Kacha Morich', 'kacha morich', 'common');


-- ==================================================================
-- FILE: supabase/seeds/03_recipes_and_ingredients.sql
-- ==================================================================

-- NutriLens Seed Data: Curated Recipes & Normalized Ingredients
-- supabase/seeds/03_recipes_and_ingredients.sql
-- Contains 14 curated, familiar Bangladeshi recipes with fully validated ingredient mappings.

-- 1. Curated Recipes
INSERT INTO recipes (
    id, market_id, cuisine, name_en, name_bn, description,
    servings, prep_time_minutes, cook_time_minutes, equipment_required,
    instructions, yield_grams, source_id, review_status
)
VALUES
(
    '44444444-4444-4444-4444-444444444401',
    '22222222-2222-2222-2222-222222222201',
    'bangladeshi',
    'Bhat + Masoor Dal + Dim Bhaji (Classic Comfort Plate)',
    'ভাত + মসুর ডাল + ডিম ভাজি',
    'Traditional Bangladeshi everyday staple plate featuring steamed white rice, red lentil soup, and a farm-fresh fried egg.',
    1, 10, 20, ARRAY['stove', 'pot', 'pan'],
    'Cook parboiled rice until tender. Simmer red lentils with turmeric and water, temper with onion and garlic. Fry egg with diced onion and green chilies in oil.',
    420.00, '11111111-1111-1111-1111-111111111101', 'approved'
),
(
    '44444444-4444-4444-4444-444444444402',
    '22222222-2222-2222-2222-222222222201',
    'bangladeshi',
    'Bhat + Rui Macher Patla Jhol with Potato',
    'ভাত + রুই মাছের পাতলা ঝোল',
    'Light freshwater Rohu fish curry cooked with potato cubes and mild spices, served with steamed white rice.',
    1, 15, 25, ARRAY['stove', 'pot', 'pan'],
    'Shallow fry marinated Rohu fish. Saute cumin, onion paste, add potatoes, water, simmer fish until tender. Serve warm with rice.',
    450.00, '11111111-1111-1111-1111-111111111101', 'approved'
),
(
    '44444444-4444-4444-4444-444444444403',
    '22222222-2222-2222-2222-222222222201',
    'bangladeshi',
    'Traditional Bhuna Khichuri',
    'ভুনা খিচুড়ি',
    'Aromatic toasted moong dal cooked with white rice, pure mustard oil, onion, and whole spices.',
    2, 15, 30, ARRAY['stove', 'pot'],
    'Dry roast moong dal until fragrant. Wash rice and lentils together. Saute onions, ginger, garlic in mustard oil, add rice-lentil mix, fry for 3 mins, add boiling water and cook until dry.',
    550.00, '11111111-1111-1111-1111-111111111101', 'approved'
),
(
    '44444444-4444-4444-4444-444444444404',
    '22222222-2222-2222-2222-222222222201',
    'bangladeshi',
    'Dim Bhuna with Steamed Rice',
    'ডিম ভুনা ও সাদা ভাত',
    'Hard-boiled chicken eggs lightly fried and simmered in a thick onion-tomato gravy with steamed rice.',
    1, 10, 20, ARRAY['stove', 'pan', 'pot'],
    'Hard boil eggs and peel. Fry in oil with turmeric until blistered. In same oil saute sliced onions, ginger, green chilies, and simmer eggs for 8 mins. Serve with rice.',
    380.00, '11111111-1111-1111-1111-111111111101', 'approved'
),
(
    '44444444-4444-4444-4444-444444444405',
    '22222222-2222-2222-2222-222222222201',
    'bangladeshi',
    'Murgir Mangsho Bhuna + Bhat',
    'মুরগির মাংস ভুনা ও ভাত',
    'Classic Bangladeshi chicken curry simmered with onion, garlic, ginger, and turmeric, served with rice.',
    2, 20, 35, ARRAY['stove', 'pot'],
    'Marinate chicken pieces with ginger, garlic, turmeric. Brown onions in soybean oil, add meat and saute until oil separates. Simmer on low heat until tender.',
    600.00, '11111111-1111-1111-1111-111111111101', 'approved'
),
(
    '44444444-4444-4444-4444-444444444406',
    '22222222-2222-2222-2222-222222222201',
    'bangladeshi',
    'Palong Shak Bhaji with Garlic & Onion',
    'রসুন দিয়ে পালং শাক ভাজি',
    'Fresh spinach leaves stir-fried with fragrant crushed garlic, sliced onions, and green chilies in mustard oil.',
    2, 10, 10, ARRAY['stove', 'pan'],
    'Wash and coarsely chop spinach. In a pan, heat mustard oil, brown crushed garlic and dry chili, add spinach, cook on high heat for 5-7 minutes until wilted.',
    220.00, '11111111-1111-1111-1111-111111111101', 'approved'
),
(
    '44444444-4444-4444-4444-444444444407',
    '22222222-2222-2222-2222-222222222201',
    'bangladeshi',
    'Lal Shak Bhaji with Steamed Rice',
    'লাল শাক ভাজি ও সাদা ভাত',
    'Iron-rich red amaranth greens sauteed with onions and garlic, paired with warm steamed rice.',
    1, 10, 15, ARRAY['stove', 'pan', 'pot'],
    'Stir fry red amaranth with sliced onion, garlic, and green chili. Serve over fluffy parboiled rice.',
    320.00, '11111111-1111-1111-1111-111111111101', 'approved'
),
(
    '44444444-4444-4444-4444-444444444408',
    '22222222-2222-2222-2222-222222222201',
    'bangladeshi',
    'Chhola Bhuna (Savory Chickpea Stir Fry)',
    'ছোলা ভুনা',
    'Protein-rich boiled chickpeas tossed with diced onions, green chilies, ginger, and mustard oil.',
    2, 10, 15, ARRAY['stove', 'pan'],
    'Heat oil, saute onions, green chili and ginger paste. Add pre-boiled chickpeas and toss briskly for 8 minutes until fragrant.',
    300.00, '11111111-1111-1111-1111-111111111101', 'approved'
),
(
    '44444444-4444-4444-4444-444444444409',
    '22222222-2222-2222-2222-222222222201',
    'bangladeshi',
    'Begun Bhaja with Handmade Whole Wheat Roti',
    'বেগুন ভাজা ও আটার রুটি',
    'Thick sliced eggplant seasoned with turmeric and salt, shallow-fried in mustard oil, served with warm roti.',
    1, 10, 15, ARRAY['stove', 'pan', 'tawa'],
    'Coat sliced eggplant with turmeric and salt. Pan fry in mustard oil on both sides until golden brown. Serve with 2 warm whole wheat rotis.',
    240.00, '11111111-1111-1111-1111-111111111101', 'approved'
),
(
    '44444444-4444-4444-4444-444444444410',
    '22222222-2222-2222-2222-222222222201',
    'bangladeshi',
    'Sobji Khichuri (Vegetable Lentil Rice)',
    'সবজি খিচুড়ি',
    'Nutrient-dense one-pot meal containing parboiled rice, red lentils, sweet pumpkin, cauliflower, and carrots.',
    2, 15, 25, ARRAY['stove', 'pot'],
    'Saute sliced onions, ginger, garlic in oil. Add diced vegetables, rice, and lentils. Add warm water and simmer covered until vegetables and rice are fully tender.',
    520.00, '11111111-1111-1111-1111-111111111101', 'approved'
),
(
    '44444444-4444-4444-4444-444444444411',
    '22222222-2222-2222-2222-222222222201',
    'bangladeshi',
    'Lau Chingri with Steamed Rice',
    'লাউ চিংড়ি ও সাদা ভাত',
    'Tender bottle gourd cooked with sweet small freshwater prawns and green chilies, served with steamed rice.',
    1, 15, 20, ARRAY['stove', 'pot'],
    'Saute small prawns in a little oil. Add finely chopped bottle gourd, green chilies, and salt. Cook covered on low heat until bottle gourd releases its juice and softens.',
    410.00, '11111111-1111-1111-1111-111111111101', 'approved'
),
(
    '44444444-4444-4444-4444-444444444412',
    '22222222-2222-2222-2222-222222222201',
    'bangladeshi',
    'Tok Doi Fruit Bowl with Banana & Guava',
    'টক দই ও ফলের বাটি',
    'Probiotic-rich plain curd paired with sliced fresh local banana and crunchy guava slices.',
    1, 5, 0, ARRAY['knife', 'bowl'],
    'Whisk plain yogurt in a bowl. Top with sliced banana and fresh guava pieces. Serve fresh.',
    250.00, '11111111-1111-1111-1111-111111111101', 'approved'
),
(
    '44444444-4444-4444-4444-444444444413',
    '22222222-2222-2222-2222-222222222201',
    'bangladeshi',
    'Dal Ruti (Red Lentil Soup with Roti)',
    'ডাল ও আটার রুটি',
    'Warm masoor dal soup flavored with garlic and mustard oil, served with two fresh handmade whole wheat rotis.',
    1, 10, 15, ARRAY['stove', 'pot', 'tawa'],
    'Cook red lentils with turmeric and salt, temper with sliced garlic and onion in mustard oil. Serve warm with freshly rolled rotis.',
    280.00, '11111111-1111-1111-1111-111111111101', 'approved'
),
(
    '44444444-4444-4444-4444-444444444414',
    '22222222-2222-2222-2222-222222222201',
    'bangladeshi',
    'Alu Bharta + Dim Siddha + Sada Bhat',
    'আলু ভর্তা, সিদ্ধ ডিম ও সাদা ভাত',
    'Hearty comforting plate of mustard oil mashed potatoes, a hard-boiled egg, and fluffy steamed white rice.',
    1, 10, 15, ARRAY['stove', 'pot'],
    'Mash boiled potatoes with fried onions, green chili, and mustard oil. Serve with a halved hard boiled egg and hot rice.',
    370.00, '11111111-1111-1111-1111-111111111101', 'approved'
)
ON CONFLICT (id) DO UPDATE SET 
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    instructions = EXCLUDED.instructions;

-- 2. Recipe Ingredients (Linking recipes to verified foods)
INSERT INTO recipe_ingredients (
    id, recipe_id, food_id, quantity_g, input_state, is_optional, display_order, notes
)
VALUES
-- Recipe 1: Bhat + Masoor Dal + Dim Bhaji
('55555555-5555-5555-5555-555555555101', '44444444-4444-4444-4444-444444444401', '33333333-3333-3333-3333-333333333301', 200.00, 'boiled', false, 1, 'Warm steamed parboiled rice'),
('55555555-5555-5555-5555-555555555102', '44444444-4444-4444-4444-444444444401', '33333333-3333-3333-3333-333333333308', 150.00, 'boiled', false, 2, 'Cooked masoor dal soup'),
('55555555-5555-5555-5555-555555555103', '44444444-4444-4444-4444-444444444401', '33333333-3333-3333-3333-333333333314', 60.00, 'fried', false, 3, 'One fried egg omelette with onion'),

-- Recipe 2: Bhat + Rui Macher Jhol + Potato
('55555555-5555-5555-5555-555555555201', '44444444-4444-4444-4444-444444444402', '33333333-3333-3333-3333-333333333301', 200.00, 'boiled', false, 1, 'Steamed white rice'),
('55555555-5555-5555-5555-555555555202', '44444444-4444-4444-4444-444444444402', '33333333-3333-3333-3333-333333333321', 180.00, 'curried', false, 2, 'Rohu fish curry steak with gravy'),
('55555555-5555-5555-5555-555555555203', '44444444-4444-4444-4444-444444444402', '33333333-3333-3333-3333-333333333326', 70.00, 'boiled', false, 3, 'Potato chunks in fish curry'),

-- Recipe 3: Bhuna Khichuri
('55555555-5555-5555-5555-555555555301', '44444444-4444-4444-4444-444444444403', '33333333-3333-3333-3333-333333333302', 200.00, 'raw', false, 1, 'Raw rice for khichuri base'),
('55555555-5555-5555-5555-555555555302', '44444444-4444-4444-4444-444444444403', '33333333-3333-3333-3333-333333333311', 120.00, 'raw', false, 2, 'Raw moong dal toasted'),
('55555555-5555-5555-5555-555555555303', '44444444-4444-4444-4444-444444444403', '33333333-3333-3333-3333-333333333345', 25.00, 'raw', false, 3, 'Mustard oil for tempering'),
('55555555-5555-5555-5555-555555555304', '44444444-4444-4444-4444-444444444403', '33333333-3333-3333-3333-333333333347', 40.00, 'raw', false, 4, 'Sliced onions for frying'),

-- Recipe 4: Dim Bhuna + Sada Bhat
('55555555-5555-5555-5555-555555555401', '44444444-4444-4444-4444-444444444404', '33333333-3333-3333-3333-333333333301', 200.00, 'boiled', false, 1, 'Steamed white rice'),
('55555555-5555-5555-5555-555555555402', '44444444-4444-4444-4444-444444444404', '33333333-3333-3333-3333-333333333313', 100.00, 'boiled', false, 2, 'Two boiled eggs'),
('55555555-5555-5555-5555-555555555403', '44444444-4444-4444-4444-444444444404', '33333333-3333-3333-3333-333333333347', 50.00, 'raw', false, 3, 'Onion gravy base'),
('55555555-5555-5555-5555-555555555404', '44444444-4444-4444-4444-444444444404', '33333333-3333-3333-3333-333333333346', 15.00, 'raw', false, 4, 'Soybean cooking oil'),

-- Recipe 5: Murgir Mangsho Bhuna + Bhat
('55555555-5555-5555-5555-555555555501', '44444444-4444-4444-4444-444444444405', '33333333-3333-3333-3333-333333333301', 200.00, 'boiled', false, 1, 'Steamed white rice'),
('55555555-5555-5555-5555-555555555502', '44444444-4444-4444-4444-444444444405', '33333333-3333-3333-3333-333333333317', 220.00, 'curried', false, 2, 'Cooked chicken curry'),

-- Recipe 6: Palong Shak Bhaji
('55555555-5555-5555-5555-555555555601', '44444444-4444-4444-4444-444444444406', '33333333-3333-3333-3333-333333333329', 180.00, 'fried', false, 1, 'Cooked spinach bhaji'),
('55555555-5555-5555-5555-555555555602', '44444444-4444-4444-4444-444444444406', '33333333-3333-3333-3333-333333333348', 10.00, 'raw', false, 2, 'Crushed garlic cloves'),

-- Recipe 8: Chhola Bhuna
('55555555-5555-5555-5555-555555555801', '44444444-4444-4444-4444-444444444408', '33333333-3333-3333-3333-333333333312', 200.00, 'boiled', false, 1, 'Boiled chickpeas'),
('55555555-5555-5555-5555-555555555802', '44444444-4444-4444-4444-444444444408', '33333333-3333-3333-3333-333333333347', 40.00, 'raw', false, 2, 'Sliced onion'),
('55555555-5555-5555-5555-555555555803', '44444444-4444-4444-4444-444444444408', '33333333-3333-3333-3333-333333333345', 15.00, 'raw', false, 3, 'Mustard oil'),

-- Recipe 9: Begun Bhaja + Roti
('55555555-5555-5555-5555-555555555901', '44444444-4444-4444-4444-444444444409', '33333333-3333-3333-3333-333333333305', 120.00, 'roasted', false, 1, 'Two handmade rotis (60g each)'),
('55555555-5555-5555-5555-555555555902', '44444444-4444-4444-4444-444444444409', '33333333-3333-3333-3333-333333333332', 120.00, 'fried', false, 2, 'Fried eggplant slices'),

-- Recipe 10: Sobji Khichuri
('55555555-5555-5555-5555-555555556001', '44444444-4444-4444-4444-444444444410', '33333333-3333-3333-3333-333333333301', 180.00, 'boiled', false, 1, 'Cooked rice in khichuri'),
('55555555-5555-5555-5555-555555556002', '44444444-4444-4444-4444-444444444410', '33333333-3333-3333-3333-333333333308', 120.00, 'boiled', false, 2, 'Cooked lentils in khichuri'),
('55555555-5555-5555-5555-555555556003', '44444444-4444-4444-4444-444444444410', '33333333-3333-3333-3333-333333333337', 80.00, 'boiled', false, 3, 'Sweet pumpkin cubes'),
('55555555-5555-5555-5555-555555556004', '44444444-4444-4444-4444-444444444410', '33333333-3333-3333-3333-333333333334', 60.00, 'boiled', false, 4, 'Carrot slices'),

-- Recipe 11: Lau Chingri + Rice
('55555555-5555-5555-5555-555555556101', '44444444-4444-4444-4444-444444444411', '33333333-3333-3333-3333-333333333301', 200.00, 'boiled', false, 1, 'Steamed white rice'),
('55555555-5555-5555-5555-555555556102', '44444444-4444-4444-4444-444444444411', '33333333-3333-3333-3333-333333333331', 160.00, 'boiled', false, 2, 'Cooked bottle gourd'),
('55555555-5555-5555-5555-555555556103', '44444444-4444-4444-4444-444444444411', '33333333-3333-3333-3333-333333333325', 50.00, 'curried', false, 3, 'Small prawns in curry'),

-- Recipe 12: Tok Doi Fruit Bowl
('55555555-5555-5555-5555-555555556201', '44444444-4444-4444-4444-444444444412', '33333333-3333-3333-3333-333333333344', 150.00, 'commercial', false, 1, 'Plain sour yogurt/curd'),
('55555555-5555-5555-5555-555555556202', '44444444-4444-4444-4444-444444444412', '33333333-3333-3333-3333-333333333340', 80.00, 'raw', false, 2, 'Sliced banana'),
('55555555-5555-5555-5555-555555556203', '44444444-4444-4444-4444-444444444412', '33333333-3333-3333-3333-333333333341', 50.00, 'raw', false, 3, 'Fresh diced guava'),

-- Recipe 13: Dal Ruti
('55555555-5555-5555-5555-555555556301', '44444444-4444-4444-4444-444444444413', '33333333-3333-3333-3333-333333333305', 120.00, 'roasted', false, 1, 'Two handmade whole wheat rotis'),
('55555555-5555-5555-5555-555555556302', '44444444-4444-4444-4444-444444444413', '33333333-3333-3333-3333-333333333308', 160.00, 'boiled', false, 2, 'Tempered masoor dal bowl'),

-- Recipe 14: Alu Bharta + Dim Siddha + Rice
('55555555-5555-5555-5555-555555556401', '44444444-4444-4444-4444-444444444414', '33333333-3333-3333-3333-333333333301', 200.00, 'boiled', false, 1, 'Steamed white rice'),
('55555555-5555-5555-5555-555555556402', '44444444-4444-4444-4444-444444444414', '33333333-3333-3333-3333-333333333326', 100.00, 'boiled', false, 2, 'Boiled potato mashed with mustard oil and onion'),
('55555555-5555-5555-5555-555555556403', '44444444-4444-4444-4444-444444444414', '33333333-3333-3333-3333-333333333313', 50.00, 'boiled', false, 3, 'One boiled egg')
ON CONFLICT (id) DO UPDATE SET 
    quantity_g = EXCLUDED.quantity_g,
    notes = EXCLUDED.notes;


-- ==================================================================
-- FILE: supabase/seeds/04_market_observations.sql
-- ==================================================================

-- NutriLens Seed Data: Synthetic Market Observations
-- supabase/seeds/04_market_observations.sql
-- Contains synthetic market price and stock observations for Savar Demo Market and Ashulia Demo Market.
-- All records are strictly tagged with data_mode = 'synthetic_demo'.

INSERT INTO market_observations (
    id, market_id, food_id, seller_label, currency_code,
    price_amount, pack_quantity, pack_unit, price_per_base_unit,
    stock_state, observed_at, expires_at, source_id, data_mode, notes
)
VALUES
-- === SAVAR DEMO MARKET ===

-- 1. Chicken Eggs (Boiled/Raw reference)
(
    '66666666-6666-6666-6666-666666666101',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333313',
    'Savar Bazar Farm Fresh Egg Stall', 'BDT',
    48.00, 4.00, 'hali', 12.0000,
    'in_stock', now() - INTERVAL '2 hours', now() + INTERVAL '48 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Brown farm eggs 4-pack'
),
-- 2. Duck Eggs
(
    '66666666-6666-6666-6666-666666666102',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333315',
    'Savar Bazar Poultry Corner', 'BDT',
    70.00, 4.00, 'hali', 17.5000,
    'in_stock', now() - INTERVAL '3 hours', now() + INTERVAL '48 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Desi duck eggs 4-pack'
),
-- 3. Raw Red Lentils (1 kg pack)
(
    '66666666-6666-6666-6666-666666666103',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333309',
    'Bismillah Grocery Savar', 'BDT',
    120.00, 1.00, 'kg', 120.0000,
    'in_stock', now() - INTERVAL '4 hours', now() + INTERVAL '72 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Coarse grain masoor dal'
),
-- 4. Raw Red Lentils (500 g pack)
(
    '66666666-6666-6666-6666-666666666104',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333309',
    'Mayer Doa Store Savar', 'BDT',
    65.00, 500.00, 'g', 0.1300,
    'in_stock', now() - INTERVAL '5 hours', now() + INTERVAL '72 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Medium grain masoor dal small pack'
),
-- 5. Raw Moong Dal (1 kg)
(
    '66666666-6666-6666-6666-666666666105',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333311',
    'Bismillah Grocery Savar', 'BDT',
    140.00, 1.00, 'kg', 140.0000,
    'in_stock', now() - INTERVAL '4 hours', now() + INTERVAL '72 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Yellow split moong dal'
),
-- 6. Raw White Rice (Miniket 1 kg loose)
(
    '66666666-6666-6666-6666-666666666106',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333302',
    'Savar Rice Agency', 'BDT',
    68.00, 1.00, 'kg', 68.0000,
    'in_stock', now() - INTERVAL '6 hours', now() + INTERVAL '72 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Premium parboiled rice 1 kg'
),
-- 7. Atta (Whole Wheat Flour 2 kg bag)
(
    '66666666-6666-6666-6666-666666666107',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333304',
    'Al Madina General Store', 'BDT',
    115.00, 2.00, 'kg', 57.5000,
    'in_stock', now() - INTERVAL '1 day', now() + INTERVAL '72 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Packaged brown atta 2 kg'
),
-- 8. Puffed Rice (Muri 500 g)
(
    '66666666-6666-6666-6666-666666666108',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333306',
    'Mayer Doa Store Savar', 'BDT',
    45.00, 500.00, 'g', 0.0900,
    'in_stock', now() - INTERVAL '1 day', now() + INTERVAL '72 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Packaged white muri'
),
-- 9. Broiler Chicken (1 kg dressed)
(
    '66666666-6666-6666-6666-666666666109',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333316',
    'Savar Poultry Syndicate', 'BDT',
    190.00, 1.00, 'kg', 190.0000,
    'in_stock', now() - INTERVAL '2 hours', now() + INTERVAL '24 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Fresh dressed broiler chicken'
),
-- 10. Beef (Lean cut 1 kg)
(
    '66666666-6666-6666-6666-666666666110',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333318',
    'Savar Meat House', 'BDT',
    750.00, 1.00, 'kg', 750.0000,
    'in_stock', now() - INTERVAL '3 hours', now() + INTERVAL '24 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Fresh cut beef'
),
-- 11. Rohu Fish (1 kg whole fresh)
(
    '66666666-6666-6666-6666-666666666111',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333320',
    'Savar Macher Ghor', 'BDT',
    320.00, 1.00, 'kg', 320.0000,
    'in_stock', now() - INTERVAL '1 hour', now() + INTERVAL '24 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Medium pond Rohu fish'
),
-- 12. Tilapia Fish (1 kg)
(
    '66666666-6666-6666-6666-666666666112',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333322',
    'Savar Macher Ghor', 'BDT',
    180.00, 1.00, 'kg', 180.0000,
    'in_stock', now() - INTERVAL '1 hour', now() + INTERVAL '24 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Farm tilapia fish'
),
-- 13. Pangas Fish (1 kg)
(
    '66666666-6666-6666-6666-666666666113',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333323',
    'Savar Macher Ghor', 'BDT',
    140.00, 1.00, 'kg', 140.0000,
    'in_stock', now() - INTERVAL '2 hours', now() + INTERVAL '24 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Cultured pangas fish'
),
-- 14. Small Prawns (500 g)
(
    '66666666-6666-6666-6666-666666666114',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333325',
    'Savar Macher Ghor', 'BDT',
    280.00, 500.00, 'g', 0.5600,
    'in_stock', now() - INTERVAL '3 hours', now() + INTERVAL '24 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Freshwater small prawns'
),
-- 15. Potatoes (1 kg)
(
    '66666666-6666-6666-6666-666666666115',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333327',
    'Savar Sabzi Arat', 'BDT',
    55.00, 1.00, 'kg', 55.0000,
    'in_stock', now() - INTERVAL '4 hours', now() + INTERVAL '48 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Diamond red potatoes'
),
-- 16. Spinach (Palong Shak 1 bunch)
(
    '66666666-6666-6666-6666-666666666116',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333328',
    'Savar Sabzi Arat', 'BDT',
    20.00, 1.00, 'bunch', 20.0000,
    'in_stock', now() - INTERVAL '3 hours', now() + INTERVAL '24 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Fresh winter spinach bunch (~300g)'
),
-- 17. Bottle Gourd (Lau 1 piece)
(
    '66666666-6666-6666-6666-666666666117',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333331',
    'Savar Sabzi Arat', 'BDT',
    50.00, 1.00, 'piece', 50.0000,
    'in_stock', now() - INTERVAL '2 hours', now() + INTERVAL '48 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Medium young green bottle gourd'
),
-- 18. Eggplant (Begun 1 kg)
(
    '66666666-6666-6666-6666-666666666118',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333332',
    'Savar Sabzi Arat', 'BDT',
    60.00, 1.00, 'kg', 60.0000,
    'in_stock', now() - INTERVAL '3 hours', now() + INTERVAL '48 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Long purple brinjal'
),
-- 19. Onion (Peyaj 1 kg)
(
    '66666666-6666-6666-6666-666666666119',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333347',
    'Savar Mosla Bitan', 'BDT',
    110.00, 1.00, 'kg', 110.0000,
    'in_stock', now() - INTERVAL '5 hours', now() + INTERVAL '72 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Local Faridpur desi onion'
),
-- 20. Garlic (Roshun 250 g)
(
    '66666666-6666-6666-6666-666666666120',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333348',
    'Savar Mosla Bitan', 'BDT',
    60.00, 250.00, 'g', 0.2400,
    'in_stock', now() - INTERVAL '5 hours', now() + INTERVAL '72 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Desi garlic small clove'
),
-- 21. Mustard Oil (Shorsher Tel 500 ml bottle)
(
    '66666666-6666-6666-6666-666666666121',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333345',
    'Al Madina General Store', 'BDT',
    140.00, 500.00, 'ml', 0.2800,
    'in_stock', now() - INTERVAL '1 day', now() + INTERVAL '120 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Radhuni pure mustard oil 500ml'
),
-- 22. Plain Yogurt (Tok Doi 500 g tub)
(
    '66666666-6666-6666-6666-666666666122',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333344',
    'Savar Dairy & Sweets', 'BDT',
    120.00, 500.00, 'g', 0.2400,
    'in_stock', now() - INTERVAL '2 hours', now() + INTERVAL '48 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Fresh sour curd tub'
),
-- 23. Bananas (Sagor Kola 4 pieces)
(
    '66666666-6666-6666-6666-666666666123',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333340',
    'Savar Fruit Corner', 'BDT',
    36.00, 4.00, 'hali', 9.0000,
    'in_stock', now() - INTERVAL '3 hours', now() + INTERVAL '36 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Ripe sagor banana 4 pieces'
),
-- 24. Sweet Pumpkin (1 kg cut)
(
    '66666666-6666-6666-6666-666666666124',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333337',
    'Savar Sabzi Arat', 'BDT',
    40.00, 1.00, 'kg', 40.0000,
    'in_stock', now() - INTERVAL '4 hours', now() + INTERVAL '48 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Fresh sweet pumpkin slice'
),

-- === ASHULIA DEMO MARKET ===

-- 25. Chicken Eggs (Ashulia)
(
    '66666666-6666-6666-6666-666666666201',
    '22222222-2222-2222-2222-222222222202',
    '33333333-3333-3333-3333-333333333313',
    'Ashulia Bazar Kacha Market', 'BDT',
    50.00, 4.00, 'hali', 12.5000,
    'in_stock', now() - INTERVAL '1 hour', now() + INTERVAL '48 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Poultry egg 4-pack'
),
-- 26. Raw Red Lentils (Ashulia 1 kg)
(
    '66666666-6666-6666-6666-666666666202',
    '22222222-2222-2222-2222-222222222202',
    '33333333-3333-3333-3333-333333333309',
    'Ashulia Central Grocery', 'BDT',
    125.00, 1.00, 'kg', 125.0000,
    'in_stock', now() - INTERVAL '3 hours', now() + INTERVAL '72 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Masoor dal 1 kg'
),
-- 27. Broiler Chicken (Ashulia 500 g small portion)
(
    '66666666-6666-6666-6666-666666666203',
    '22222222-2222-2222-2222-222222222202',
    '33333333-3333-3333-3333-333333333316',
    'Ashulia Meat & Chicken Shop', 'BDT',
    100.00, 500.00, 'g', 0.2000,
    'in_stock', now() - INTERVAL '2 hours', now() + INTERVAL '24 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Broiler chicken 500g half pack'
),
-- 28. Spinach (Ashulia 1 bunch)
(
    '66666666-6666-6666-6666-666666666204',
    '22222222-2222-2222-2222-222222222202',
    '33333333-3333-3333-3333-333333333328',
    'Ashulia Sabzi Corner', 'BDT',
    25.00, 1.00, 'bunch', 25.0000,
    'in_stock', now() - INTERVAL '4 hours', now() + INTERVAL '24 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Fresh spinach bunch'
),
-- 29. Tilapia Fish (Ashulia 1 kg)
(
    '66666666-6666-6666-6666-666666666205',
    '22222222-2222-2222-2222-222222222202',
    '33333333-3333-3333-3333-333333333322',
    'Ashulia Macher Dokan', 'BDT',
    175.00, 1.00, 'kg', 175.0000,
    'in_stock', now() - INTERVAL '2 hours', now() + INTERVAL '24 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Live pond tilapia'
),
-- 30. Raw White Rice (Ashulia 1 kg)
(
    '66666666-6666-6666-6666-666666666206',
    '22222222-2222-2222-2222-222222222202',
    '33333333-3333-3333-3333-333333333302',
    'Ashulia Central Grocery', 'BDT',
    70.00, 1.00, 'kg', 70.0000,
    'in_stock', now() - INTERVAL '5 hours', now() + INTERVAL '72 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Nazirshail parboiled rice'
),
-- 31. Atta (Ashulia 1 kg loose)
(
    '66666666-6666-6666-6666-666666666207',
    '22222222-2222-2222-2222-222222222202',
    '33333333-3333-3333-3333-333333333304',
    'Ashulia Central Grocery', 'BDT',
    60.00, 1.00, 'kg', 60.0000,
    'in_stock', now() - INTERVAL '4 hours', now() + INTERVAL '72 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Loose whole wheat flour'
),
-- 32. Potatoes (Ashulia 1 kg)
(
    '66666666-6666-6666-6666-666666666208',
    '22222222-2222-2222-2222-222222222202',
    '33333333-3333-3333-3333-333333333327',
    'Ashulia Sabzi Corner', 'BDT',
    52.00, 1.00, 'kg', 52.0000,
    'in_stock', now() - INTERVAL '3 hours', now() + INTERVAL '48 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Fresh potato 1 kg'
),
-- 33. Onion (Ashulia 1 kg)
(
    '66666666-6666-6666-6666-666666666209',
    '22222222-2222-2222-2222-222222222202',
    '33333333-3333-3333-3333-333333333347',
    'Ashulia Central Grocery', 'BDT',
    115.00, 1.00, 'kg', 115.0000,
    'in_stock', now() - INTERVAL '4 hours', now() + INTERVAL '72 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Desi onion 1 kg'
),
-- 34. Soybean Oil (Ashulia 1 litre bottle)
(
    '66666666-6666-6666-6666-666666666210',
    '22222222-2222-2222-2222-222222222202',
    '33333333-3333-3333-3333-333333333346',
    'Ashulia Central Grocery', 'BDT',
    178.00, 1.00, 'litre', 178.0000,
    'in_stock', now() - INTERVAL '5 hours', now() + INTERVAL '96 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Rupchanda soybean oil 1 litre'
),
-- 35. Mustard Oil (Ashulia 1 litre bottle - Currently Out of Stock for testing stock state)
(
    '66666666-6666-6666-6666-666666666211',
    '22222222-2222-2222-2222-222222222202',
    '33333333-3333-3333-3333-333333333345',
    'Ashulia Central Grocery', 'BDT',
    270.00, 1.00, 'litre', 270.0000,
    'out_of_stock', now() - INTERVAL '1 hour', now() + INTERVAL '24 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Stock exhausted today'
),
-- 36. Tomato (Savar 1 kg)
(
    '66666666-6666-6666-6666-666666666125',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333333',
    'Savar Sabzi Arat', 'BDT',
    65.00, 1.00, 'kg', 65.0000,
    'in_stock', now() - INTERVAL '3 hours', now() + INTERVAL '48 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Ripe local red tomatoes'
),
-- 37. Tomato (Ashulia 1 kg)
(
    '66666666-6666-6666-6666-666666666212',
    '22222222-2222-2222-2222-222222222202',
    '33333333-3333-3333-3333-333333333333',
    'Ashulia Sabzi Corner', 'BDT',
    70.00, 1.00, 'kg', 70.0000,
    'in_stock', now() - INTERVAL '2 hours', now() + INTERVAL '48 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Local tomatoes'
),
-- 38. Green Chili (Savar 250 g)
(
    '66666666-6666-6666-6666-666666666126',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333349',
    'Savar Sabzi Arat', 'BDT',
    40.00, 250.00, 'g', 0.1600,
    'in_stock', now() - INTERVAL '4 hours', now() + INTERVAL '48 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Hot green chilies 250g'
),
-- 39. Green Chili (Ashulia 250 g)
(
    '66666666-6666-6666-6666-666666666213',
    '22222222-2222-2222-2222-222222222202',
    '33333333-3333-3333-3333-333333333349',
    'Ashulia Sabzi Corner', 'BDT',
    45.00, 250.00, 'g', 0.1800,
    'in_stock', now() - INTERVAL '3 hours', now() + INTERVAL '48 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Green chilies 250g'
),
-- 40. Ginger (Savar 250 g)
(
    '66666666-6666-6666-6666-666666666127',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333350',
    'Savar Mosla Bitan', 'BDT',
    75.00, 250.00, 'g', 0.3000,
    'in_stock', now() - INTERVAL '5 hours', now() + INTERVAL '72 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Fresh ginger 250g'
),
-- 41. Cauliflower (Savar 1 piece)
(
    '66666666-6666-6666-6666-666666666128',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333336',
    'Savar Sabzi Arat', 'BDT',
    35.00, 1.00, 'piece', 35.0000,
    'in_stock', now() - INTERVAL '3 hours', now() + INTERVAL '48 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Medium fresh cauliflower'
),
-- 42. Cabbage (Savar 1 piece)
(
    '66666666-6666-6666-6666-666666666129',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333335',
    'Savar Sabzi Arat', 'BDT',
    30.00, 1.00, 'piece', 30.0000,
    'in_stock', now() - INTERVAL '3 hours', now() + INTERVAL '48 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Medium green cabbage'
),
-- 43. Carrots (Savar 1 kg)
(
    '66666666-6666-6666-6666-666666666130',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333334',
    'Savar Sabzi Arat', 'BDT',
    60.00, 1.00, 'kg', 60.0000,
    'in_stock', now() - INTERVAL '4 hours', now() + INTERVAL '48 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Fresh orange carrots'
),
-- 44. Guava (Savar 1 kg)
(
    '66666666-6666-6666-6666-666666666131',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333341',
    'Savar Fruit Corner', 'BDT',
    80.00, 1.00, 'kg', 80.0000,
    'in_stock', now() - INTERVAL '2 hours', now() + INTERVAL '48 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Kazi peyara 1 kg'
),
-- 45. Cow Milk (Savar 1 litre)
(
    '66666666-6666-6666-6666-666666666132',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333343',
    'Savar Dairy & Sweets', 'BDT',
    90.00, 1.00, 'litre', 90.0000,
    'in_stock', now() - INTERVAL '1 hour', now() + INTERVAL '24 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Pure cow milk 1 litre'
),
-- 46. Boiled Chickpeas (Savar 1 kg)
(
    '66666666-6666-6666-6666-666666666133',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333312',
    'Bismillah Grocery Savar', 'BDT',
    110.00, 1.00, 'kg', 110.0000,
    'in_stock', now() - INTERVAL '5 hours', now() + INTERVAL '72 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Dry desi chickpeas 1 kg'
),
-- 47. Red Amaranth (Savar 1 bunch)
(
    '66666666-6666-6666-6666-666666666134',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333330',
    'Savar Sabzi Arat', 'BDT',
    18.00, 1.00, 'bunch', 18.0000,
    'in_stock', now() - INTERVAL '3 hours', now() + INTERVAL '24 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Fresh red amaranth bunch'
),
-- 48. Red Amaranth (Ashulia 1 bunch)
(
    '66666666-6666-6666-6666-666666666214',
    '22222222-2222-2222-2222-222222222202',
    '33333333-3333-3333-3333-333333333330',
    'Ashulia Sabzi Corner', 'BDT',
    20.00, 1.00, 'bunch', 20.0000,
    'in_stock', now() - INTERVAL '2 hours', now() + INTERVAL '24 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Fresh red amaranth bunch'
),
-- 49. Green Papaya (Savar 1 kg)
(
    '66666666-6666-6666-6666-666666666135',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333338',
    'Savar Sabzi Arat', 'BDT',
    40.00, 1.00, 'kg', 40.0000,
    'in_stock', now() - INTERVAL '4 hours', now() + INTERVAL '48 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: Fresh raw green papaya'
),
-- 50. Flattened Rice (Chira, Savar 500 g)
(
    '66666666-6666-6666-6666-666666666136',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333307',
    'Mayer Doa Store Savar', 'BDT',
    40.00, 500.00, 'g', 0.0800,
    'in_stock', now() - INTERVAL '1 day', now() + INTERVAL '72 hours',
    '11111111-1111-1111-1111-111111111104', 'synthetic_demo',
    'SIMULATED DEMO DATA: White thin chira pack'
)

ON CONFLICT (id) DO UPDATE SET 
    price_amount = EXCLUDED.price_amount,
    stock_state = EXCLUDED.stock_state,
    observed_at = EXCLUDED.observed_at;


-- ==================================================================
-- FILE: supabase/seeds/05_knowledge_documents_and_chunks.sql
-- ==================================================================

-- NutriLens Seed Data: Knowledge Documents & Vector Chunks (RAG Corpus)
-- supabase/seeds/05_knowledge_documents_and_chunks.sql
-- Contains approved nutrition guidelines and food composition excerpts with 768-dim embeddings.

-- 1. Knowledge Documents
INSERT INTO knowledge_documents (
    id, title, publisher, source_url, country_code, language_code, population, published_at, version, review_status, license_note
)
VALUES
(
    '77777777-7777-7777-7777-777777777701',
    'Dietary Guidelines for Bangladesh: Core Recommendations for Adults',
    'BIRDEM & Ministry of Health and Family Welfare (MOHFW)',
    'https://dghs.gov.bd/nutrition/dietary-guidelines-bangladesh',
    'BD', 'bn', 'general_adult', '2015-01-01', '2015-v1', 'approved',
    'Official government public health guideline'
),
(
    '77777777-7777-7777-7777-777777777702',
    'FAO Food-Based Dietary Guidelines: Pulses and Legumes in South Asia',
    'Food and Agriculture Organization of the United Nations (FAO)',
    'https://www.fao.org/nutrition/education/food-dietary-guidelines/regions/countries/bangladesh/en/',
    'BD', 'en', 'general_adult', '2018-05-10', '2018-v1', 'approved',
    'United Nations public domain guidance'
),
(
    '77777777-7777-7777-7777-777777777703',
    'WHO Regional Office for South-East Asia: Dietary Salt and Edible Oil Guidelines',
    'World Health Organization (WHO)',
    'https://www.who.int/southeastasia/health-topics/nutrition',
    'BD', 'en', 'general_adult', '2020-03-15', '2020-v1', 'approved',
    'WHO South-East Asia public guideline'
)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    publisher = EXCLUDED.publisher;

-- 2. Knowledge Chunks with 768-dimension Vector Fixtures
INSERT INTO knowledge_chunks (
    id, document_id, chunk_text, section_or_page,
    embedding, embedding_model, embedding_dimension, embedding_version
)
VALUES
-- Document 1 Chunks: Bangladesh Dietary Guidelines
(
    '88888888-8888-8888-8888-888888888801',
    '77777777-7777-7777-7777-777777777701',
    'দৈনিক খাদ্যতালিকায় বিভিন্ন ধরনের দানাদার খাদ্য যেমন লাল চালের ভাত এবং লাল আটার রুটি অন্তর্ভুক্ত করা উচিত। এগুলো শরীরের জন্য প্রয়োজনীয় জটিল শর্করা (complex carbohydrate) এবং পর্যাপ্ত আঁশ (dietary fibre) সরবরাহ করে, যা হজম প্রক্রিয়া ও রক্তের শর্করা নিয়ন্ত্রণে সাহায্য করে।',
    'Section 2.1: Cereals and Whole Grains (p. 14)',
    array_fill(0.015::real, ARRAY[768])::vector,
    'text-embedding-004', 768, 'v1'
),
(
    '88888888-8888-8888-8888-888888888802',
    'প্রতিদিনের প্রধান খাবারে ডাল ও অন্যান্য শিমজাতীয় খাদ্য রাখা অত্যন্ত গুরুত্বপূর্ণ। ভাত এবং ডাল (যেমন মসুর, মুগ অথবা ছোলা) একসঙ্গে গ্রহণ করলে অ্যামাইনো অ্যাসিডের পরিপূরকতা তৈরি হয়, যা উদ্ভিজ্জ প্রোটিনের মান উল্লেখযোগ্যভাবে বৃদ্ধি করে।',
    'Section 2.3: Pulses and Legumes (p. 22)',
    array_fill(0.022::real, ARRAY[768])::vector,
    'text-embedding-004', 768, 'v1'
),
(
    '88888888-8888-8888-8888-888888888803',
    'সুস্থ পূর্ণবয়স্ক ব্যক্তির জন্য দিনে অন্তত ১০০ গ্রাম সবুজ শাক এবং ২০০ গ্রাম অন্যান্য মৌসুমি সবজি গ্রহণ করার পরামর্শ দেওয়া হয়। গাঢ় সবুজ শাক (যেমন পালং শাক, লাল শাক) ভিটামিন এ, ফলিক অ্যাসিড, ক্যালসিয়াম এবং লৌহের চমৎকার উৎস।',
    'Section 2.4: Vegetables and Leafy Greens (p. 28)',
    array_fill(0.018::real, ARRAY[768])::vector,
    'text-embedding-004', 768, 'v1'
),
(
    '88888888-8888-8888-8888-888888888804',
    'মাছ হলো উচ্চমানের প্রাণিজ প্রোটিন এবং ওমেগা-৩ ফ্যাটি অ্যাসিডের সর্বোত্তম উৎস। বিশেষ করে ছোট দেশি মাছ (যেমন কাচকি, মলা) কাঁটাসহ খেলে তা থেকে প্রচুর পরিমাণে ক্যালসিয়াম, ফসফরাস ও ভিটামিন এ পাওয়া যায়। সপ্তাহে অন্তত ২-৩ দিন মাছ খাওয়া বাঞ্ছনীয়।',
    'Section 2.5: Fish and Seafood (p. 34)',
    array_fill(0.031::real, ARRAY[768])::vector,
    'text-embedding-004', 768, 'v1'
),
(
    '88888888-8888-8888-8888-888888888805',
    'ডিম হলো প্রোটিন এবং অত্যাবশ্যকীয় পুষ্টি উপাদানের একটি সাশ্রয়ী ও সহজলভ্য প্যাকেজ। সুস্থ প্রাপ্তবয়স্কদের ক্ষেত্রে দিনে একটি ডিম খাওয়া নিরাপদ ও পুষ্টিকর, যা পেশি গঠনে ও রোগ প্রতিরোধ ক্ষমতা বৃদ্ধিতে সহায়তা করে।',
    'Section 2.6: Eggs and Poultry (p. 39)',
    array_fill(0.025::real, ARRAY[768])::vector,
    'text-embedding-004', 768, 'v1'
),
(
    '88888888-8888-8888-8888-888888888806',
    'রান্নায় ভোজ্য তেলের ব্যবহার পরিমিত রাখা প্রয়োজন। অতিরিক্ত তেল ব্যবহারের পরিবর্তে সরিষার তেল ও সয়াবিন তেল মিলিয়ে ব্যবহার স্বাস্থ্যসম্মত ফ্যাটি অ্যাসিডের ভারসাম্য নিশ্চিত করতে সাহায্য করে। দিনে একজন প্রাপ্তবয়স্কের জন্য ২০-৩০ মিলিলিটার তেলের পরিমাণ যথেষ্ট।',
    'Section 3.1: Fats, Oils and Salt (p. 45)',
    array_fill(0.012::real, ARRAY[768])::vector,
    'text-embedding-004', 768, 'v1'
),
(
    '88888888-8888-8888-8888-888888888807',
    'প্রতিদিন অন্তত একটি দেশি তাজা ফল (যেমন পেয়ারা, পাকা পেঁপে বা কলা) খাওয়া উচিত। পেয়ারা আমলকীর পরেই ভিটামিন সি এর অন্যতম সেরা দেশীয় উৎস, যা শরীরের রোগ প্রতিরোধ ক্ষমতা শক্তিশালী করে।',
    'Section 2.7: Seasonal Fruits (p. 42)',
    array_fill(0.019::real, ARRAY[768])::vector,
    'text-embedding-004', 768, 'v1'
),

-- Document 2 Chunks: FAO Guidance
(
    '88888888-8888-8888-8888-888888888808',
    '77777777-7777-7777-7777-777777777702',
    'Combining cereals with pulses: Rice contains adequate methionine but lacks sufficient lysine. Conversely, legumes such as lentils and chickpeas are rich in lysine while low in sulfur-containing amino acids. When eaten in the same meal (e.g. Khichuri or Dal-Bhat), they form a complete protein profile comparable to animal protein.',
    'Section 4: Protein Quality and Mutual Supplementation',
    array_fill(0.028::real, ARRAY[768])::vector,
    'text-embedding-004', 768, 'v1'
),
(
    '88888888-8888-8888-8888-888888888809',
    'Cost-effective protein substitutes in South Asian diets: When animal proteins such as fish or chicken face price spikes in local bazars, increasing pulse quantity (masoor or moong dal) and adding a farm egg provides an equivalent protein intake at a fraction of the expenditure.',
    'Section 7: Economic Nutrition Substitutions',
    array_fill(0.035::real, ARRAY[768])::vector,
    'text-embedding-004', 768, 'v1'
),
(
    '88888888-8888-8888-8888-888888888810',
    'Dietary diversity is strongly correlated with micronutrient adequacy. Consuming foods from at least five of the ten standard food groups within a 24-hour cycle reduces the risk of sub-clinical vitamin and mineral deficiencies in low- and middle-income urban households.',
    'Section 9: Household Dietary Diversity Score (HDDS)',
    array_fill(0.016::real, ARRAY[768])::vector,
    'text-embedding-004', 768, 'v1'
),

-- Document 3 Chunks: WHO Regional Guidelines
(
    '88888888-8888-8888-8888-888888888811',
    '77777777-7777-7777-7777-777777777703',
    'Sodium reduction target: Daily sodium intake should be less than 2,000 mg per day for adults, which corresponds to less than 5 grams of salt (approximately one level teaspoon). Avoid adding extra salt to cooked rice and minimize raw table salt consumption.',
    'Guideline 1: Salt Intake Reduction in South Asia',
    array_fill(0.011::real, ARRAY[768])::vector,
    'text-embedding-004', 768, 'v1'
),
(
    '88888888-8888-8888-8888-888888888812',
    'Healthy fat composition: Total fat intake should not exceed 30% of total energy intake to prevent unhealthy weight gain and non-communicable diseases. Saturated fats should be limited to less than 10%, replacing them with unsaturated vegetable fats like mustard or soybean oil.',
    'Guideline 3: Lipid Profile and Cooking Oil Standards',
    array_fill(0.014::real, ARRAY[768])::vector,
    'text-embedding-004', 768, 'v1'
),
(
    '88888888-8888-8888-8888-888888888813',
    'Fermented milk and gut health: Unsweetened sour curd (Tok Doi) contains live probiotic cultures that support gut microbiome health, enhance lactose tolerance, and improve the bioavailability of calcium and B-vitamins in traditional rice-based diets.',
    'Guideline 5: Probiotics and Fermented Foods',
    array_fill(0.021::real, ARRAY[768])::vector,
    'text-embedding-004', 768, 'v1'
),
(
    '88888888-8888-8888-8888-888888888814',
    'Cooking methods and nutrient retention: Over-boiling green vegetables in open pots and discarding the cooking water causes substantial loss of water-soluble vitamins (Vitamin C and B-complex). Steaming or quick sauteing in small amounts of oil preserves higher nutrient density.',
    'Guideline 6: Culinary Preparation and Nutrient Loss',
    array_fill(0.027::real, ARRAY[768])::vector,
    'text-embedding-004', 768, 'v1'
),
(
    '88888888-8888-8888-8888-888888888815',
    'Nutritional awareness and non-clinical scope: General nutrition intelligence tools should empower citizens with meal-level awareness and transparent market alternatives. They must never diagnose clinical conditions, prescribe medical dosages, or replace professional healthcare consultations.',
    'Guideline 8: Public Health Informatics and Ethics',
    array_fill(0.009::real, ARRAY[768])::vector,
    'text-embedding-004', 768, 'v1'
)
ON CONFLICT (id) DO UPDATE SET 
    chunk_text = EXCLUDED.chunk_text,
    section_or_page = EXCLUDED.section_or_page;


-- ==================================================================
-- FILE: supabase/seeds/06_demo_profiles_provisioning.sql
-- ==================================================================

-- NutriLens Seed Data: Demo Profiles Provisioning
-- supabase/seeds/06_demo_profiles_provisioning.sql
-- Fictional adult demo profiles for Savar and Ashulia test scenarios.
-- Follows strict security rules: No real personal/health data, safe provisioning.

-- 1. Helper function to safely upsert demo profiles linked to auth.users
CREATE OR REPLACE FUNCTION public.provision_demo_profile(
    p_user_id UUID,
    p_email TEXT,
    p_display_name TEXT,
    p_market_id UUID,
    p_language VARCHAR(10),
    p_general_goal TEXT,
    p_household_size INTEGER,
    p_budget_amount NUMERIC(10,2),
    p_budget_duration_days INTEGER,
    p_dietary_exclusions TEXT[],
    p_declared_allergens TEXT[]
) RETURNS VOID AS $$
BEGIN
    -- Check if the corresponding user exists in auth.users
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
        INSERT INTO public.profiles (
            id, market_id, display_name, age_adult_confirmed,
            language, unit_preference, cuisine_preferences,
            dietary_exclusions, declared_allergens, general_goal,
            household_size, budget_amount, budget_currency,
            budget_people, budget_duration_days, available_time_minutes,
            available_equipment
        )
        VALUES (
            p_user_id, p_market_id, p_display_name, true,
            p_language, 'metric', ARRAY['bangladeshi'],
            p_dietary_exclusions, p_declared_allergens, p_general_goal,
            p_household_size, p_budget_amount, 'BDT',
            p_household_size, p_budget_duration_days, 30,
            ARRAY['stove', 'pan', 'pot', 'knife']
        )
        ON CONFLICT (id) DO UPDATE SET 
            display_name = EXCLUDED.display_name,
            market_id = EXCLUDED.market_id,
            budget_amount = EXCLUDED.budget_amount,
            general_goal = EXCLUDED.general_goal,
            updated_at = now();
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Staged Demo User Profiles (Executed automatically when the corresponding user accounts are created)
-- Persona 1: Tariqul Islam (Student in Savar, Daily budget ৳150, Goal: budget_friendly)
-- User ID: 00000000-0000-0000-0000-000000000001
-- Email: demo.student@nutrilens.internal

-- Persona 2: Nasima Akter (Garment Supervisor in Ashulia, Household of 3, Daily budget ৳350, Goal: balanced_wellness)
-- User ID: 00000000-0000-0000-0000-000000000002
-- Email: demo.family@nutrilens.internal

-- Persona 3: Tanvir Ahmed (IT Professional, Savar/Dhaka, Goal: high_protein)
-- User ID: 00000000-0000-0000-0000-000000000003
-- Email: demo.fitness@nutrilens.internal

-- Optional local development convenience: If executed within local Supabase emulator,
-- seed demo users directly into auth.users if not present.
DO $$
BEGIN
    -- Check if we are running in an environment where auth.users can be populated
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        BEGIN
            INSERT INTO auth.users (
                id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
            )
            VALUES
            (
                '00000000-0000-0000-0000-000000000001',
                '00000000-0000-0000-0000-000000000000',
                'authenticated', 'authenticated',
                'demo.student@nutrilens.internal',
                crypt('DemoPassword123!', gen_salt('bf')),
                now(),
                '{"provider":"email","providers":["email"]}',
                '{"full_name":"Tariqul Islam"}',
                now(), now()
            ),
            (
                '00000000-0000-0000-0000-000000000002',
                '00000000-0000-0000-0000-000000000000',
                'authenticated', 'authenticated',
                'demo.family@nutrilens.internal',
                crypt('DemoPassword123!', gen_salt('bf')),
                now(),
                '{"provider":"email","providers":["email"]}',
                '{"full_name":"Nasima Akter"}',
                now(), now()
            ),
            (
                '00000000-0000-0000-0000-000000000003',
                '00000000-0000-0000-0000-000000000000',
                'authenticated', 'authenticated',
                'demo.fitness@nutrilens.internal',
                crypt('DemoPassword123!', gen_salt('bf')),
                now(),
                '{"provider":"email","providers":["email"]}',
                '{"full_name":"Tanvir Ahmed"}',
                now(), now()
            )
            ON CONFLICT (id) DO NOTHING;

            -- Provision their profiles
            PERFORM public.provision_demo_profile(
                '00000000-0000-0000-0000-000000000001'::uuid,
                'demo.student@nutrilens.internal',
                'Tariqul Islam (Student Mess, Savar)',
                '22222222-2222-2222-2222-222222222201'::uuid,
                'bn',
                'budget_friendly',
                1,
                150.00,
                1,
                ARRAY[]::TEXT[],
                ARRAY[]::TEXT[]
            );

            PERFORM public.provision_demo_profile(
                '00000000-0000-0000-0000-000000000002'::uuid,
                'demo.family@nutrilens.internal',
                'Nasima Akter (Household of 3, Ashulia)',
                '22222222-2222-2222-2222-222222222202'::uuid,
                'bn',
                'balanced_wellness',
                3,
                350.00,
                1,
                ARRAY[]::TEXT[],
                ARRAY[]::TEXT[]
            );

            PERFORM public.provision_demo_profile(
                '00000000-0000-0000-0000-000000000003'::uuid,
                'demo.fitness@nutrilens.internal',
                'Tanvir Ahmed (High Protein, Savar)',
                '22222222-2222-2222-2222-222222222201'::uuid,
                'en',
                'high_protein',
                1,
                300.00,
                1,
                ARRAY[]::TEXT[],
                ARRAY[]::TEXT[]
            );
        EXCEPTION
            WHEN OTHERS THEN
                -- In production Supabase Cloud without direct auth.users write permission,
                -- ignore error and let server-side provisioning script handle profile creation.
                RAISE NOTICE 'Notice: Direct auth.users seeding skipped (%): use Supabase Auth admin API instead.', SQLERRM;
        END;
    END IF;
END $$;


