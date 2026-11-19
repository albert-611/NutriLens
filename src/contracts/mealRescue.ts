import { z } from 'zod';

export interface IngredientItemInput {
  food_id?: string;
  food_name: string;
  food_name_bn?: string;
  portion_grams: number;
  preparation_state?: string;
  category?: string;
}

export interface NutrientSummary {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g?: number;
  sodium_mg: number;
  cost_bdt: number;
}

export interface IdentifiedOpportunity {
  type: string; // 'excess_calories' | 'low_protein' | 'high_sodium' | 'high_cost' | 'low_fiber' | 'allergen_risk'
  severity: 'high' | 'medium' | 'low';
  message: string;
  suggestion: string;
}

export interface MealRescueAnalyzeRequest {
  meal_id?: string;
  meal_name: string;
  meal_name_bn?: string;
  items: IngredientItemInput[];
  meal_type?: string;
  target_budget_bdt?: number;
  cuisine_preference?: string;
}

export interface MealRescueAnalyzeResponse {
  meal_name: string;
  meal_name_bn?: string;
  nutrition: NutrientSummary;
  dietary_score: number;
  identified_opportunities: IdentifiedOpportunity[];
  allergen_warnings: string[];
  cuisine_detected: string;
}

export interface SubstitutionDetail {
  original_food: string;
  original_grams: number;
  replacement_food: string;
  replacement_food_bn?: string;
  replacement_grams: number;
  reason: string;
  savings_bdt: number;
  protein_delta_g: number;
  calories_delta: number;
}

export interface RescuedMealOption {
  id: string;
  name: string;
  name_bn?: string;
  category: string;
  cuisine_type: string;
  rationale: string;
  substitutions: SubstitutionDetail[];
  original_nutrition: NutrientSummary;
  rescued_nutrition: NutrientSummary;
  savings_bdt: number;
  prep_time_minutes: number;
  prep_time_label: string;
  ingredients: Array<{
    name: string;
    name_bn?: string;
    grams: number;
    measure?: string;
    category?: string;
    pack_size_g?: number;
    pack_price_bdt?: number;
    kg_price_bdt?: number;
  }>;
  instruction_steps: string[];
  tags: string[];
  adherence_score: number;
}

export interface MealRescueRecommendRequest {
  original_meal_name: string;
  items: IngredientItemInput[];
  objective: string; // 'balance' | 'lower_cost' | 'high_protein' | 'low_calorie' | 'low_sodium' | 'preserve_cuisine' | 'use_pantry'
  cuisine_preference?: string;
  budget_bdt?: number;
  servings?: number;
  pantry_ingredients?: string[];
  excluded_ingredients?: string[];
  max_prep_time?: number;
  user_goal?: string;
}

export interface MealRescueRecommendResponse {
  objective: string;
  original_meal_name: string;
  recommendations: RescuedMealOption[];
  cuisine_preserved: boolean;
  hard_constraints_checked: boolean;
  warnings: string[];
}

export interface MealRescueRecalculateRequest {
  items: IngredientItemInput[];
  servings?: number;
  pantry_items?: string[];
  target_budget_bdt?: number;
}

export interface MealRescueRecalculateResponse {
  nutrition: NutrientSummary;
  per_serving_nutrition: NutrientSummary;
  estimated_cost_bdt: number;
  allergen_audits: string[];
  is_safe: boolean;
  nutrition_score: number;
}

export interface BasketLineItem {
  id: string;
  item_name: string;
  bangla_name?: string;
  recipe_needed_quantity: number;
  recipe_needed_unit: string;
  usable_pantry_quantity: number;
  remaining_purchase_quantity: number;
  package_net_quantity: number;
  package_unit: string;
  package_count: number;
  package_unit_price_bdt: number;
  cash_checkout_cost_bdt: number;
  consumed_ingredient_cost_bdt: number;
  in_pantry: boolean;
  seller: string;
  is_simulated_price: boolean;
}

export interface MealRescueShoppingRequest {
  recipe_id?: string;
  recipe_name: string;
  ingredients: Array<Record<string, any>>;
  servings?: number;
  pantry_inventory?: string[];
  market_id?: string;
}

export interface MealRescueShoppingResponse {
  shopping_list_id: string;
  recipe_name: string;
  total_cash_checkout_bdt: number;
  total_consumed_value_bdt: number;
  pantry_savings_bdt: number;
  currency: string;
  items: BasketLineItem[];
  market_label: string;
  data_provenance: string;
}

export interface SaveMealRescueRequest {
  meal_log_id?: string;
  original_meal_name: string;
  rescued_meal_name: string;
  rescued_recipe_id?: string;
  objective: string;
  servings: number;
  customized_ingredients: Array<Record<string, any>>;
  final_nutrients: NutrientSummary;
  shopping_list?: MealRescueShoppingResponse;
  cash_cost_bdt: number;
}
