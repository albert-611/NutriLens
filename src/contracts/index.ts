import { z } from 'zod';

// ==========================================
// 1. Data Provenance & Common Enums
// ==========================================

export const DataModeSchema = z.enum([
  'live_retailer',
  'dated_manual_observation',
  'historical_reference',
  'synthetic_demo',
]);
export type DataMode = z.infer<typeof DataModeSchema>;

export const PreparationStateSchema = z.enum([
  'raw',
  'boiled',
  'steamed',
  'fried',
  'roasted',
  'curried',
  'drained',
  'commercial',
]);
export type PreparationState = z.infer<typeof PreparationStateSchema>;

export const StockStateSchema = z.enum([
  'in_stock',
  'out_of_stock',
  'unknown',
]);
export type StockState = z.infer<typeof StockStateSchema>;

// ==========================================
// 2. Food & Alias Contracts
// ==========================================

export const FoodSchema = z.object({
  id: z.string().uuid(),
  canonical_name: z.string().min(1),
  category: z.string(),
  preparation_state: PreparationStateSchema,
  edible_basis: z.string().default('edible_portion_100g'),
  basis_grams: z.number().positive().default(100),
  energy_kcal: z.number().nullable(),
  protein_g: z.number().nullable(),
  carbohydrate_g: z.number().nullable(),
  fat_g: z.number().nullable(),
  fibre_g: z.number().nullable(),
  source_id: z.string().uuid(),
  external_record_id: z.string().nullable().optional(),
  source_version: z.string().nullable().optional(),
  review_status: z.enum(['draft', 'reviewed', 'approved']).default('approved'),
  nutrient_completeness: z.enum(['complete', 'partial', 'minimal']).default('complete'),
  created_at: z.string().optional(),
});
export type Food = z.infer<typeof FoodSchema>;

export const FoodNameSchema = z.object({
  id: z.string().uuid(),
  food_id: z.string().uuid(),
  language_code: z.enum(['bn', 'en', 'bn_translit']),
  market_id: z.string().uuid().nullable().optional(),
  local_name: z.string(),
  normalized_alias: z.string(),
  alias_type: z.enum(['canonical', 'common', 'colloquial', 'regional', 'spelling_variant']),
  review_status: z.enum(['draft', 'approved']).default('approved'),
});
export type FoodName = z.infer<typeof FoodNameSchema>;

// ==========================================
// 3. Recipes & Ingredients
// ==========================================

export const RecipeIngredientSchema = z.object({
  id: z.string().uuid(),
  recipe_id: z.string().uuid(),
  food_id: z.string().uuid(),
  quantity_g: z.number().positive(),
  input_state: PreparationStateSchema,
  is_optional: z.boolean().default(false),
  display_order: z.number().default(1),
  notes: z.string().nullable().optional(),
  food: FoodSchema.optional(),
});
export type RecipeIngredient = z.infer<typeof RecipeIngredientSchema>;

export const RecipeSchema = z.object({
  id: z.string().uuid(),
  market_id: z.string().uuid().nullable().optional(),
  cuisine: z.string().default('bangladeshi'),
  name_en: z.string(),
  name_bn: z.string(),
  description: z.string().nullable().optional(),
  servings: z.number().int().positive().default(1),
  prep_time_minutes: z.number().int().nullable().optional(),
  cook_time_minutes: z.number().int().nullable().optional(),
  equipment_required: z.array(z.string()).default([]),
  instructions: z.string().nullable().optional(),
  yield_grams: z.number().positive().nullable().optional(),
  source_id: z.string().uuid().nullable().optional(),
  review_status: z.enum(['draft', 'reviewed', 'approved']).default('approved'),
  created_at: z.string().optional(),
  ingredients: z.array(RecipeIngredientSchema).optional(),
});
export type Recipe = z.infer<typeof RecipeSchema>;

// ==========================================
// 4. Market & Observations
// ==========================================

export const MarketSchema = z.object({
  id: z.string().uuid(),
  country_code: z.string().default('BD'),
  region: z.string(),
  city: z.string(),
  market_name: z.string(),
  currency_code: z.string().default('BDT'),
  time_zone: z.string().default('Asia/Dhaka'),
  supported_languages: z.array(z.string()).default(['bn', 'en']),
  coverage_status: z.enum(['full', 'pilot_market', 'limited', 'unsupported']).default('pilot_market'),
  is_demo_market: z.boolean().default(true),
});
export type Market = z.infer<typeof MarketSchema>;

export const MarketObservationSchema = z.object({
  id: z.string().uuid(),
  market_id: z.string().uuid(),
  food_id: z.string().uuid(),
  seller_label: z.string(),
  currency_code: z.string().default('BDT'),
  price_amount: z.number().min(0),
  pack_quantity: z.number().positive(),
  pack_unit: z.enum(['g', 'kg', 'piece', 'bunch', 'hali', 'litre', 'ml']),
  price_per_base_unit: z.number().min(0).nullable().optional(),
  stock_state: StockStateSchema.default('in_stock'),
  observed_at: z.string(),
  expires_at: z.string().nullable().optional(),
  source_id: z.string().uuid().nullable().optional(),
  data_mode: DataModeSchema.default('synthetic_demo'),
  notes: z.string().nullable().optional(),
  food: FoodSchema.optional(),
});
export type MarketObservation = z.infer<typeof MarketObservationSchema>;

// ==========================================
// 5. User Profiles & Constraints
// ==========================================

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  market_id: z.string().uuid().nullable().optional(),
  display_name: z.string().nullable().optional(),
  age_adult_confirmed: z.boolean().default(true),
  language: z.string().default('bn'),
  unit_preference: z.string().default('metric'),
  cuisine_preferences: z.array(z.string()).default(['bangladeshi']),
  dietary_exclusions: z.array(z.string()).default([]),
  declared_allergens: z.array(z.string()).default([]),
  general_goal: z.enum([
    'balanced_wellness',
    'budget_friendly',
    'high_protein',
    'diabetic_friendly_lifestyle',
    'heart_conscious',
  ]).default('balanced_wellness'),
  household_size: z.number().int().positive().default(1),
  budget_amount: z.number().min(0).nullable().optional(),
  budget_currency: z.string().default('BDT'),
  budget_people: z.number().int().positive().default(1),
  budget_duration_days: z.number().int().positive().default(1),
  available_time_minutes: z.number().positive().nullable().optional(),
  available_equipment: z.array(z.string()).default(['stove', 'pan', 'pot', 'knife']),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type Profile = z.infer<typeof ProfileSchema>;

// ==========================================
// 6. Meal Capture & Nutrition Calculations
// ==========================================

export const ConfirmedItemSchema = z.object({
  food_id: z.string().uuid(),
  confirmed_grams: z.number().positive(),
  preparation_state: PreparationStateSchema,
  portion_source: z.enum(['user_entered', 'ai_estimated_unconfirmed', 'standard_reference_serving']).default('user_entered'),
  confidence_notes: z.string().optional(),
});
export type ConfirmedItem = z.infer<typeof ConfirmedItemSchema>;

export const NutrientTotalsSchema = z.object({
  energy_kcal: z.number().nullable(),
  protein_g: z.number().nullable(),
  carbohydrate_g: z.number().nullable(),
  fat_g: z.number().nullable(),
  fibre_g: z.number().nullable(),
  completeness: z.record(z.string(), z.enum(['complete', 'incomplete', 'missing'])),
  formula_version: z.string().default('v1.0.0-fao_bangladesh'),
});
export type NutrientTotals = z.infer<typeof NutrientTotalsSchema>;

export const MealReportSchema = z.object({
  id: z.string().uuid(),
  meal_log_id: z.string().uuid(),
  revision: z.number().int().positive(),
  total_energy_kcal: z.number().nullable(),
  total_protein_g: z.number().nullable(),
  total_carbohydrate_g: z.number().nullable(),
  total_fat_g: z.number().nullable(),
  total_fibre_g: z.number().nullable(),
  nutrient_completeness: z.record(z.string(), z.any()),
  evidence_sources: z.array(z.any()),
  formula_version: z.string(),
  created_at: z.string(),
});
export type MealReport = z.infer<typeof MealReportSchema>;

// ==========================================
// 7. Shopping List Item
// ==========================================

export const ShoppingItemSchema = z.object({
  food_id: z.string().uuid(),
  name: z.string(),
  needed_quantity: z.number(),
  pantry_quantity: z.number().default(0),
  to_buy_quantity: z.number(),
  pack_unit: z.string(),
  pack_count: z.number().int(),
  estimated_cost: z.number().nullable(),
  currency: z.string().default('BDT'),
  data_mode: DataModeSchema.default('synthetic_demo'),
  stock_state: StockStateSchema.default('in_stock'),
  seller: z.string().optional(),
});
export type ShoppingItem = z.infer<typeof ShoppingItemSchema>;
