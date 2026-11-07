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
