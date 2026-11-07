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
