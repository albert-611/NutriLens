-- NutriLens Database Teardown & Reset Script
-- supabase/tests/reset_database.sql
-- Safely truncates all application tables in dependency cascade order to prepare for clean re-seeding.

TRUNCATE TABLE 
    knowledge_chunks,
    knowledge_documents,
    meal_plans,
    meal_reports,
    meal_items,
    meal_logs,
    market_observations,
    recipe_ingredients,
    recipes,
    food_names,
    foods,
    profiles,
    markets,
    data_sources
CASCADE;
