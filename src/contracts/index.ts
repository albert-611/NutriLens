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
  id: z.string().guid(),
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
  source_id: z.string().guid(),
  external_record_id: z.string().nullable().optional(),
  source_version: z.string().nullable().optional(),
  review_status: z.enum(['draft', 'reviewed', 'approved']).default('approved'),
  nutrient_completeness: z.enum(['complete', 'partial', 'minimal']).default('complete'),
  created_at: z.string().optional(),
});
export type Food = z.infer<typeof FoodSchema>;

export const FoodNameSchema = z.object({
  id: z.string().guid(),
  food_id: z.string().guid(),
  language_code: z.enum(['bn', 'en', 'bn_translit']),
  market_id: z.string().guid().nullable().optional(),
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
  id: z.string().guid(),
  recipe_id: z.string().guid(),
  food_id: z.string().guid(),
  quantity_g: z.number().positive(),
  input_state: PreparationStateSchema,
  is_optional: z.boolean().default(false),
  display_order: z.number().default(1),
  notes: z.string().nullable().optional(),
  food: FoodSchema.optional(),
});
export type RecipeIngredient = z.infer<typeof RecipeIngredientSchema>;

export const RecipeSchema = z.object({
  id: z.string().guid(),
  market_id: z.string().guid().nullable().optional(),
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
  source_id: z.string().guid().nullable().optional(),
  review_status: z.enum(['draft', 'reviewed', 'approved']).default('approved'),
  created_at: z.string().optional(),
  ingredients: z.array(RecipeIngredientSchema).optional(),
});
export type Recipe = z.infer<typeof RecipeSchema>;

// ==========================================
// 4. Market & Observations
// ==========================================

export const MarketSchema = z.object({
  id: z.string().guid(),
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
  id: z.string().guid(),
  market_id: z.string().guid(),
  food_id: z.string().guid(),
  seller_label: z.string(),
  currency_code: z.string().default('BDT'),
  price_amount: z.number().min(0),
  pack_quantity: z.number().positive(),
  pack_unit: z.enum(['g', 'kg', 'piece', 'bunch', 'hali', 'litre', 'ml']),
  price_per_base_unit: z.number().min(0).nullable().optional(),
  stock_state: StockStateSchema.default('in_stock'),
  observed_at: z.string(),
  expires_at: z.string().nullable().optional(),
  source_id: z.string().guid().nullable().optional(),
  data_mode: DataModeSchema.default('synthetic_demo'),
  notes: z.string().nullable().optional(),
  food: FoodSchema.optional(),
});
export type MarketObservation = z.infer<typeof MarketObservationSchema>;

// ==========================================
// 5. User Profiles & Constraints
// ==========================================

export const ProfileSchema = z.object({
  id: z.string().guid(),
  market_id: z.string().guid().nullable().optional(),
  username: z.string().nullable().optional(),
  display_name: z.string().nullable().optional(),
  full_name: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  age: z.number().int().min(18).max(120).nullable().optional(),
  biological_sex: z.enum(['male', 'female', 'prefer_not_to_say']).nullable().optional(),
  height_value: z.number().nullable().optional(),
  height_unit: z.enum(['cm', 'ft_in']).optional().default('cm'),
  weight_value: z.number().nullable().optional(),
  weight_unit: z.enum(['kg', 'lbs']).optional().default('kg'),
  target_weight_value: z.number().nullable().optional(),
  activity_level: z.enum([
    'sedentary',
    'lightly_active',
    'moderately_active',
    'very_active',
    'extremely_active',
  ]).nullable().optional(),
  exercise_frequency: z.enum([
    'never',
    '1_2_days',
    '3_4_days',
    '5_6_days',
    'every_day',
  ]).nullable().optional(),
  sleep_duration: z.enum([
    'less_than_4h',
    '4_5h',
    '6_7h',
    '8_9h',
    'more_than_9h',
  ]).nullable().optional(),
  disliked_foods: z.string().nullable().optional(),
  health_data_consent: z.boolean().optional().default(false),
  health_data_consent_at: z.string().nullable().optional(),
  terms_accepted_at: z.string().nullable().optional(),
  terms_version: z.string().nullable().optional(),
  country: z.string().default('Bangladesh'),
  city: z.string().default('Dhaka'),
  preferred_language: z.string().default('bn'),
  age_adult_confirmed: z.boolean().default(true),
  onboarding_completed: z.boolean().optional().default(true),
  onboarding_status: z.enum(['ONBOARDING_REQUIRED', 'ONBOARDING_COMPLETED']).nullable().optional(),
  language: z.string().default('bn'),
  unit_preference: z.string().default('metric'),
  cuisine_preferences: z.array(z.string()).default(['bangladeshi']),
  dietary_exclusions: z.array(z.string()).default([]),
  declared_allergens: z.array(z.string()).default([]),
  general_goal: z.enum([
    'balanced_wellness',
    'improve_overall_nutrition',
    'increase_protein',
    'improve_dietary_variety',
    'manage_food_expenses',
    'build_healthier_habits',
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

// Detailed item schemas for User Signup & Nutrition Profile Specification
export const MedicalConditionItemSchema = z.object({
  name: z.string(),
  specify: z.string().optional(),
  diabetesType: z.string().optional(),
});
export type MedicalConditionItem = z.infer<typeof MedicalConditionItemSchema>;

export const AllergyItemSchema = z.object({
  name: z.string(),
  specify: z.string().optional(),
});
export type AllergyItem = z.infer<typeof AllergyItemSchema>;

export const IntoleranceItemSchema = z.object({
  name: z.string(),
  specify: z.string().optional(),
});
export type IntoleranceItem = z.infer<typeof IntoleranceItemSchema>;

export const DetailedPreferenceItemSchema = z.object({
  type: z.enum(['dietary_preference', 'food_restriction', 'religious_cultural']),
  name: z.string(),
  specify: z.string().optional(),
});
export type DetailedPreferenceItem = z.infer<typeof DetailedPreferenceItemSchema>;

export const DetailedGoalItemSchema = z.object({
  type: z.enum(['primary', 'secondary']),
  name: z.string(),
  specify: z.string().optional(),
});
export type DetailedGoalItem = z.infer<typeof DetailedGoalItemSchema>;

// Comprehensive 7-Step Signup Schema
export const ComprehensiveSignupSchema = z.object({
  // Step 1: Personal Information
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  age: z.number().int().min(18, 'Age must be 18 or older'),
  biologicalSex: z.enum(['male', 'female', 'prefer_not_to_say']).optional(),
  heightValue: z.number().positive().nullable().optional(),
  heightUnit: z.enum(['cm', 'ft_in']).default('cm'),
  weightValue: z.number().positive().nullable().optional(),
  weightUnit: z.enum(['kg', 'lbs']).default('kg'),
  targetWeightValue: z.number().positive().nullable().optional(),

  // Step 2: Health Information (Optional)
  medicalConditions: z.array(MedicalConditionItemSchema).default([]),
  allergies: z.array(AllergyItemSchema).default([]),
  intolerances: z.array(IntoleranceItemSchema).default([]),

  // Step 3: Dietary Preferences
  dietaryPreference: z.string().default('Non-vegetarian'),
  dietaryPreferenceSpecify: z.string().optional(),
  foodRestrictions: z.array(z.string()).default([]),
  foodRestrictionsSpecify: z.string().optional(),
  religiousRestrictions: z.array(z.string()).default([]),
  religiousRestrictionsSpecify: z.string().optional(),
  dislikedFoods: z.string().default(''),

  // Step 4: Lifestyle Information (Optional)
  activityLevel: z.string().optional(),
  exerciseFrequency: z.string().optional(),
  sleepDuration: z.string().optional(),

  // Step 5: Nutritional Goals
  primaryGoal: z.string().default('Maintain current weight'),
  primaryGoalSpecify: z.string().optional(),
  secondaryGoals: z.array(z.string()).default([]),
  secondaryGoalsSpecify: z.string().optional(),

  // Step 6: Account Information
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, and _ . -'),
  email: z.string().trim().email('Valid email address is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[0-9]/, 'Password must include at least one number')
    .regex(/[a-z]/, 'Password must include at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter'),
  confirmPassword: z.string(),
  avatarUrl: z.string().nullable().optional(),

  // Step 7: Consent
  healthDataConsent: z.boolean().default(false),
  termsConsent: z.boolean().refine((val) => val === true, 'You must agree to the Terms of Service'),
});
export type ComprehensiveSignupData = z.infer<typeof ComprehensiveSignupSchema>;

export const NutritionPreferencesSchema = z.object({
  id: z.string().guid().optional(),
  user_id: z.string().guid(),
  primary_goal: z.string().default('balanced_wellness'),
  secondary_goals: z.array(z.string()).default([]),
  dietary_pattern: z.string().default('no_preference'),
  preferred_cuisine: z.string().default('bangladeshi'),
  favorite_food_categories: z.array(z.string()).default([]),
  foods_to_avoid: z.array(z.string()).default([]),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type NutritionPreferences = z.infer<typeof NutritionPreferencesSchema>;

export const FoodRestrictionSchema = z.object({
  id: z.string().guid().optional(),
  user_id: z.string().guid(),
  restriction_type: z.enum(['allergy', 'intolerance', 'religious_exclusion', 'ingredient_avoidance']),
  restriction_value: z.string().min(1),
  notes: z.string().optional().nullable(),
  created_at: z.string().optional(),
});
export type FoodRestriction = z.infer<typeof FoodRestrictionSchema>;

export const BudgetPreferencesSchema = z.object({
  id: z.string().guid().optional(),
  user_id: z.string().guid(),
  market_id: z.string().guid().nullable().optional(),
  currency: z.string().default('BDT'),
  budget_amount: z.number().min(0).default(150),
  budget_period: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  people_count: z.number().int().min(1).default(1),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type BudgetPreferences = z.infer<typeof BudgetPreferencesSchema>;

export const OnboardingDataSchema = z.object({
  // Step 1: Basic Info
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().int().min(18, 'Must be at least 18 years old'),
  country: z.string().default('Bangladesh'),
  city: z.string().default('Dhaka'),
  preferredLanguage: z.enum(['bn', 'en']).default('bn'),
  // Step 2: Goals
  primaryGoal: z.string().default('balanced_wellness'),
  secondaryGoals: z.array(z.string()).default([]),
  // Step 3: Food Preferences
  preferredCuisine: z.string().default('bangladeshi'),
  dietaryPattern: z.string().default('no_preference'),
  favoriteCategories: z.array(z.string()).default([]),
  foodsToAvoid: z.array(z.string()).default([]),
  // Step 4: Restrictions
  allergies: z.array(z.string()).default([]),
  intolerances: z.array(z.string()).default([]),
  religiousExclusions: z.array(z.string()).default([]),
  dislikedIngredients: z.array(z.string()).default([]),
  // Step 5: Budget
  marketId: z.string().guid().nullable().optional(),
  currency: z.string().default('BDT'),
  budgetAmount: z.number().min(0).default(150),
  budgetPeriod: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  peopleCount: z.number().int().min(1).default(1),
});
export type OnboardingData = z.infer<typeof OnboardingDataSchema>;

// ==========================================
// 6. Meal Capture & Nutrition Calculations
// ==========================================

export const ConfirmedItemSchema = z.object({
  food_id: z.string().guid(),
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
  id: z.string().guid(),
  meal_log_id: z.string().guid(),
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
  food_id: z.string().guid(),
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

// ==========================================
// 8. Phase 3: AI Vision & Candidate Recognition
// ==========================================

export const CandidateItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  label_bn: z.string().optional(),
  candidate_food_ids: z.array(z.string().guid()).default([]),
  matched_food_id: z.string().guid().nullable().optional(),
  preparation_state: PreparationStateSchema.default('boiled'),
  estimated_grams: z.number().positive().nullable().default(null),
  portion_basis: z.enum([
    'user_entered',
    'ai_estimated_unconfirmed',
    'standard_reference_serving',
    'unknown',
  ]).default('unknown'),
  uncertainty_reasons: z.array(z.string()).default([]),
  questions: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).optional(),
});
export type CandidateItem = z.infer<typeof CandidateItemSchema>;

export const AnalyzeMealRequestSchema = z.object({
  image_data: z.string().optional(), // base64 data URL
  image_path: z.string().optional(),
  input_mode: z.enum(['photo', 'manual_search', 'menu_text']).default('photo'),
  language: z.enum(['bn', 'en']).default('bn'),
  market_id: z.string().guid().optional(),
  manual_query: z.string().optional(),
});
export type AnalyzeMealRequest = z.infer<typeof AnalyzeMealRequestSchema>;

export const AnalyzeMealResponseSchema = z.object({
  analysis_id: z.string().guid(),
  schema_version: z.string().default('1.0'),
  input_mode: z.enum(['photo', 'manual_search', 'menu_text']),
  candidates: z.array(CandidateItemSchema),
  review_questions: z.array(z.string()).default([]),
  detected_cuisine: z.string().default('bangladeshi'),
  warnings: z.array(z.string()).default([]),
  created_at: z.string(),
});
export type AnalyzeMealResponse = z.infer<typeof AnalyzeMealResponseSchema>;

export const SearchFoodsRequestSchema = z.object({
  query: z.string().min(1),
  market_id: z.string().guid().optional(),
  language: z.enum(['bn', 'en', 'bn_translit']).default('bn'),
  category: z.string().optional(),
  preparation_state: PreparationStateSchema.optional(),
});
export type SearchFoodsRequest = z.infer<typeof SearchFoodsRequestSchema>;

export const FoodSearchResultItemSchema = z.object({
  food_id: z.string().guid(),
  canonical_name: z.string(),
  local_name: z.string(),
  local_name_bn: z.string(),
  category: z.string(),
  preparation_state: PreparationStateSchema,
  energy_kcal: z.number().nullable(),
  protein_g: z.number().nullable(),
  carbohydrate_g: z.number().nullable(),
  fat_g: z.number().nullable(),
  fibre_g: z.number().nullable(),
  standard_serving_grams: z.number().default(100),
  serving_unit: z.string().default('g'),
});
export type FoodSearchResultItem = z.infer<typeof FoodSearchResultItemSchema>;
