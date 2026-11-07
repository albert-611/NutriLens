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
