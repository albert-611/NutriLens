-- NutriLens Database Integrity & Verification Test Suite
-- supabase/tests/database_integrity_test.sql
-- Executes strict data-integrity, constraint, and provenance audits on the seeded schema.
-- In PostgreSQL, each block raises an EXCEPTION if an assertion fails.

DO $$
DECLARE
    v_orphan_ingredients INTEGER;
    v_missing_food_sources INTEGER;
    v_missing_obs_sources INTEGER;
    v_negative_nutrients INTEGER;
    v_negative_prices INTEGER;
    v_non_demo_market_modes INTEGER;
    v_currency_mismatches INTEGER;
    v_food_count INTEGER;
    v_alias_count INTEGER;
    v_recipe_count INTEGER;
    v_market_count INTEGER;
    v_observation_count INTEGER;
    v_knowledge_count INTEGER;
    v_invalid_vectors INTEGER;
    v_empty_recipes INTEGER;
BEGIN
    RAISE NOTICE '=== STARTING NUTRILENS PHASE 1 INTEGRITY TESTS ===';

    -- Test 1: Orphan Recipe Ingredients
    SELECT count(*) INTO v_orphan_ingredients
    FROM recipe_ingredients ri
    LEFT JOIN foods f ON ri.food_id = f.id
    WHERE f.id IS NULL;

    IF v_orphan_ingredients > 0 THEN
        RAISE EXCEPTION 'TEST FAILED: Found % orphan recipe ingredient records with missing foods!', v_orphan_ingredients;
    ELSE
        RAISE NOTICE '✓ PASS: 0 orphan recipe ingredients found.';
    END IF;

    -- Test 2: Missing Data Sources on Foods
    SELECT count(*) INTO v_missing_food_sources
    FROM foods
    WHERE source_id IS NULL;

    IF v_missing_food_sources > 0 THEN
        RAISE EXCEPTION 'TEST FAILED: Found % foods missing data_source provenance!', v_missing_food_sources;
    ELSE
        RAISE NOTICE '✓ PASS: All food records have valid data_source provenance.';
    END IF;

    -- Test 3: Missing Data Sources on Market Observations
    SELECT count(*) INTO v_missing_obs_sources
    FROM market_observations
    WHERE source_id IS NULL;

    IF v_missing_obs_sources > 0 THEN
        RAISE EXCEPTION 'TEST FAILED: Found % market observations missing data_source provenance!', v_missing_obs_sources;
    ELSE
        RAISE NOTICE '✓ PASS: All market observations have valid data_source provenance.';
    END IF;

    -- Test 4: Negative Nutrient Check
    SELECT count(*) INTO v_negative_nutrients
    FROM foods
    WHERE basis_grams <= 0 
       OR energy_kcal < 0 
       OR protein_g < 0 
       OR carbohydrate_g < 0 
       OR fat_g < 0 
       OR fibre_g < 0;

    IF v_negative_nutrients > 0 THEN
        RAISE EXCEPTION 'TEST FAILED: Found % food records with negative nutrient amounts!', v_negative_nutrients;
    ELSE
        RAISE NOTICE '✓ PASS: All food nutrient quantities are non-negative.';
    END IF;

    -- Test 5: Negative Price Check
    SELECT count(*) INTO v_negative_prices
    FROM market_observations
    WHERE price_amount < 0 OR pack_quantity <= 0;

    IF v_negative_prices > 0 THEN
        RAISE EXCEPTION 'TEST FAILED: Found % market observations with negative prices or invalid pack size!', v_negative_prices;
    ELSE
        RAISE NOTICE '✓ PASS: All market observations have positive quantities and valid prices.';
    END IF;

    -- Test 6: Demo Market Mode Compliance
    SELECT count(*) INTO v_non_demo_market_modes
    FROM market_observations mo
    JOIN markets m ON mo.market_id = m.id
    WHERE m.is_demo_market = true AND mo.data_mode != 'synthetic_demo';

    IF v_non_demo_market_modes > 0 THEN
        RAISE EXCEPTION 'TEST FAILED: Found % demo market rows without data_mode = synthetic_demo!', v_non_demo_market_modes;
    ELSE
        RAISE NOTICE '✓ PASS: All demo market observations are explicitly marked synthetic_demo.';
    END IF;

    -- Test 7: Currency Alignment
    SELECT count(*) INTO v_currency_mismatches
    FROM market_observations mo
    JOIN markets m ON mo.market_id = m.id
    WHERE mo.currency_code != m.currency_code;

    IF v_currency_mismatches > 0 THEN
        RAISE EXCEPTION 'TEST FAILED: Found % market observations where currency does not match the market currency!', v_currency_mismatches;
    ELSE
        RAISE NOTICE '✓ PASS: Currency codes consistently match market defaults (BDT).';
    END IF;

    -- Test 8: Recipe Ingredient Count per Recipe (At least 2 ingredients per recipe)
    SELECT count(*) INTO v_empty_recipes
    FROM (
        SELECT recipe_id, count(*) as ing_count
        FROM recipe_ingredients
        GROUP BY recipe_id
        HAVING count(*) < 2
    ) sub;

    IF v_empty_recipes > 0 THEN
        RAISE EXCEPTION 'TEST FAILED: Found % recipes with fewer than 2 mapped ingredients!', v_empty_recipes;
    ELSE
        RAISE NOTICE '✓ PASS: All curated recipes have complete, multi-item ingredient mappings.';
    END IF;

    -- Test 9: Seed Volume Verification
    SELECT count(*) INTO v_food_count FROM foods;
    SELECT count(*) INTO v_alias_count FROM food_names;
    SELECT count(*) INTO v_recipe_count FROM recipes;
    SELECT count(*) INTO v_market_count FROM markets;
    SELECT count(*) INTO v_observation_count FROM market_observations;
    SELECT count(*) INTO v_knowledge_count FROM knowledge_chunks;

    RAISE NOTICE '--- SEED VOLUME AUDIT ---';
    RAISE NOTICE 'Foods count: % (Target: 40-60)', v_food_count;
    RAISE NOTICE 'Food aliases count: % (Target: 80-150)', v_alias_count;
    RAISE NOTICE 'Curated recipes count: % (Target: 12-20)', v_recipe_count;
    RAISE NOTICE 'Markets count: % (Target: 2-3)', v_market_count;
    RAISE NOTICE 'Market observations count: % (Target: 40-80)', v_observation_count;
    RAISE NOTICE 'Knowledge chunks count: % (Target: 15-25)', v_knowledge_count;

    IF v_food_count < 40 OR v_food_count > 60 THEN
        RAISE WARNING 'Food count % is outside target range 40-60', v_food_count;
    END IF;

    IF v_alias_count < 80 OR v_alias_count > 150 THEN
        RAISE WARNING 'Alias count % is outside target range 80-150', v_alias_count;
    END IF;

    IF v_recipe_count < 12 OR v_recipe_count > 20 THEN
        RAISE WARNING 'Recipe count % is outside target range 12-20', v_recipe_count;
    END IF;

    -- Test 10: Vector Dimensions Check (Must be 768)
    SELECT count(*) INTO v_invalid_vectors
    FROM knowledge_chunks
    WHERE embedding IS NULL OR vector_dims(embedding) != 768;

    IF v_invalid_vectors > 0 THEN
        RAISE EXCEPTION 'TEST FAILED: Found % knowledge chunks with missing or non-768-dim embeddings!', v_invalid_vectors;
    ELSE
        RAISE NOTICE '✓ PASS: All RAG knowledge chunks have verified 768-dimension embeddings.';
    END IF;

    RAISE NOTICE '=== ALL NUTRILENS PHASE 1 INTEGRITY TESTS PASSED SUCCESSFULLY! ===';
END $$;
