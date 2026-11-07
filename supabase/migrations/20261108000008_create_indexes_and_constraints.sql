-- NutriLens Database Migration
-- 20261108000008_create_indexes_and_constraints.sql
-- Optimizes query performance on foreign keys, normalized alias matching, and temporal lookups.

-- Foods & Aliases
CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(category);
CREATE INDEX IF NOT EXISTS idx_foods_source_id ON foods(source_id);
CREATE INDEX IF NOT EXISTS idx_food_names_food_id ON food_names(food_id);
CREATE INDEX IF NOT EXISTS idx_food_names_normalized ON food_names(normalized_alias);
CREATE INDEX IF NOT EXISTS idx_food_names_lang_alias ON food_names(language_code, normalized_alias);

-- Recipes & Ingredients
CREATE INDEX IF NOT EXISTS idx_recipes_cuisine ON recipes(cuisine);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_food_id ON recipe_ingredients(food_id);

-- Markets & Observations
CREATE INDEX IF NOT EXISTS idx_market_observations_market_food ON market_observations(market_id, food_id);
CREATE INDEX IF NOT EXISTS idx_market_observations_observed_at ON market_observations(observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_observations_data_mode ON market_observations(data_mode);

-- User & Meal Sessions
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_id ON meal_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_items_meal_log_id ON meal_items(meal_log_id);
CREATE INDEX IF NOT EXISTS idx_meal_reports_meal_log_id ON meal_reports(meal_log_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_meal_log_id ON meal_plans(meal_log_id);

-- Knowledge Base
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_document_id ON knowledge_chunks(document_id);
