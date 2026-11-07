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
