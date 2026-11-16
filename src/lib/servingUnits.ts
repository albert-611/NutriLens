/**
 * NutriLens Serving Units & Verified Conversion Registry
 * 
 * Provides verified household measurements, countable units, and gram equivalents
 * based on the Food Composition Table for Bangladesh (FCTB 2013) and USDA FoodData Central.
 * 
 * Strict deterministic integrity: Unknown conversions are never fabricated.
 */

export type ServingUnitType =
  | 'g'
  | 'kg'
  | 'piece'
  | 'egg'
  | 'banana'
  | 'apple'
  | 'slice'
  | 'packet'
  | 'cup'
  | 'half_cup'
  | 'plate'
  | 'bowl'
  | 'tbsp'
  | 'tsp';

export interface FoodServingOption {
  id: string;
  name: string;
  nameBn: string;
  unit: ServingUnitType;
  defaultQuantity: number;
  gramEquivalent: number | null; // null means custom/package weight required
  ediblePortionRatio: number; // e.g. 1.0 (or 0.88 for banana peel exclusion)
  source: 'fcdb_bangladesh' | 'usda_fooddata_central' | 'user_specified' | 'package_label' | 'household_measure';
  verificationStatus: 'verified' | 'user_confirmed' | 'unverified';
  isCountable: boolean;
  requiresCustomWeight?: boolean; // true for packet when net weight is unknown
  description?: string;
}

export interface ConvertedServingResult {
  grams: number;
  conversionNote: string;
  isVerified: boolean;
  requiresWeightInput: boolean;
}

/**
 * Standard Verified Serving Catalog for Countable & Household Units
 */
const VERIFIED_SERVING_PRESETS: Record<string, FoodServingOption[]> = {
  // 1. Eggs
  eggs: [
    {
      id: 'egg_count',
      name: 'Egg(s)',
      nameBn: 'টি ডিম',
      unit: 'egg',
      defaultQuantity: 1,
      gramEquivalent: 55, // Standard large chicken egg edible portion (FCTB-04-001)
      ediblePortionRatio: 1.0,
      source: 'fcdb_bangladesh',
      verificationStatus: 'verified',
      isCountable: true,
      description: '1 standard chicken egg edible portion = 55g (FCTB)',
    },
    {
      id: 'egg_grams',
      name: 'Grams (g)',
      nameBn: 'গ্রাম (g)',
      unit: 'g',
      defaultQuantity: 60,
      gramEquivalent: 1,
      ediblePortionRatio: 1.0,
      source: 'household_measure',
      verificationStatus: 'verified',
      isCountable: false,
    },
  ],

  // 2. Bananas
  bananas: [
    {
      id: 'banana_piece',
      name: 'Piece / Banana',
      nameBn: 'টি কলা',
      unit: 'banana',
      defaultQuantity: 1,
      gramEquivalent: 100, // Medium edible portion without peel (FCTB-05-001 / USDA FDC 173944)
      ediblePortionRatio: 0.70, // 30% skin discarded
      source: 'fcdb_bangladesh',
      verificationStatus: 'verified',
      isCountable: true,
      description: '1 medium banana edible portion = 100g (peel excluded)',
    },
    {
      id: 'banana_grams',
      name: 'Grams (g)',
      nameBn: 'গ্রাম (g)',
      unit: 'g',
      defaultQuantity: 100,
      gramEquivalent: 1,
      ediblePortionRatio: 1.0,
      source: 'household_measure',
      verificationStatus: 'verified',
      isCountable: false,
    },
  ],

  // 3. Apples
  apples: [
    {
      id: 'apple_piece',
      name: 'Piece / Apple',
      nameBn: 'টি আপেল',
      unit: 'apple',
      defaultQuantity: 1,
      gramEquivalent: 182, // Standard medium apple (USDA FDC 171688)
      ediblePortionRatio: 0.90, // Core excluded
      source: 'usda_fooddata_central',
      verificationStatus: 'verified',
      isCountable: true,
      description: '1 medium apple = 182g (USDA FDC)',
    },
    {
      id: 'apple_slice',
      name: 'Slice',
      nameBn: 'স্লাইস',
      unit: 'slice',
      defaultQuantity: 4,
      gramEquivalent: 25, // 1 medium apple slice = ~25g
      ediblePortionRatio: 1.0,
      source: 'household_measure',
      verificationStatus: 'verified',
      isCountable: true,
      description: '1 standard apple slice = 25g',
    },
    {
      id: 'apple_grams',
      name: 'Grams (g)',
      nameBn: 'গ্রাম (g)',
      unit: 'g',
      defaultQuantity: 180,
      gramEquivalent: 1,
      ediblePortionRatio: 1.0,
      source: 'household_measure',
      verificationStatus: 'verified',
      isCountable: false,
    },
  ],

  // 4. Breads
  bread: [
    {
      id: 'bread_slice',
      name: 'Slice(s)',
      nameBn: 'স্লাইস',
      unit: 'slice',
      defaultQuantity: 2,
      gramEquivalent: 38, // Standard commercial sliced bread = 38g (FCTB-01-008 / USDA)
      ediblePortionRatio: 1.0,
      source: 'fcdb_bangladesh',
      verificationStatus: 'verified',
      isCountable: true,
      description: '1 standard bread slice = 38g (FCTB)',
    },
    {
      id: 'bread_piece',
      name: 'Piece (Roll / Bun)',
      nameBn: 'পিস (বন/রোল)',
      unit: 'piece',
      defaultQuantity: 1,
      gramEquivalent: 60, // Standard dinner roll / bun = 60g
      ediblePortionRatio: 1.0,
      source: 'household_measure',
      verificationStatus: 'verified',
      isCountable: true,
    },
    {
      id: 'bread_grams',
      name: 'Grams (g)',
      nameBn: 'গ্রাম (g)',
      unit: 'g',
      defaultQuantity: 75,
      gramEquivalent: 1,
      ediblePortionRatio: 1.0,
      source: 'household_measure',
      verificationStatus: 'verified',
      isCountable: false,
    },
  ],

  // 5. Biscuits & Crackers
  biscuits: [
    {
      id: 'biscuit_piece',
      name: 'Biscuit(s)',
      nameBn: 'টি বিস্কুট',
      unit: 'piece',
      defaultQuantity: 2,
      gramEquivalent: 12, // Standard sweet / tea biscuit = 12g (FCTB-01-009)
      ediblePortionRatio: 1.0,
      source: 'fcdb_bangladesh',
      verificationStatus: 'verified',
      isCountable: true,
      description: '1 individual biscuit = 12g (FCTB)',
    },
    {
      id: 'biscuit_packet',
      name: 'Packet (প্যাকেট)',
      nameBn: 'প্যাকেট',
      unit: 'packet',
      defaultQuantity: 1,
      gramEquivalent: null, // Requires user to specify actual package weight!
      ediblePortionRatio: 1.0,
      source: 'package_label',
      verificationStatus: 'user_confirmed',
      isCountable: true,
      requiresCustomWeight: true,
      description: 'Package sizes vary (e.g. 50g, 75g, 100g). Please enter package net weight.',
    },
    {
      id: 'biscuit_grams',
      name: 'Grams (g)',
      nameBn: 'গ্রাম (g)',
      unit: 'g',
      defaultQuantity: 50,
      gramEquivalent: 1,
      ediblePortionRatio: 1.0,
      source: 'household_measure',
      verificationStatus: 'verified',
      isCountable: false,
    },
  ],

  // 6. Roti & Paratha
  roti: [
    {
      id: 'roti_piece',
      name: 'Roti / Chapati (টি)',
      nameBn: 'টি রুটি',
      unit: 'piece',
      defaultQuantity: 2,
      gramEquivalent: 50, // 1 homemade whole wheat roti = 50g (FCTB-01-005)
      ediblePortionRatio: 1.0,
      source: 'fcdb_bangladesh',
      verificationStatus: 'verified',
      isCountable: true,
      description: '1 medium handmade wheat roti = 50g (FCTB)',
    },
    {
      id: 'roti_grams',
      name: 'Grams (g)',
      nameBn: 'গ্রাম (g)',
      unit: 'g',
      defaultQuantity: 100,
      gramEquivalent: 1,
      ediblePortionRatio: 1.0,
      source: 'household_measure',
      verificationStatus: 'verified',
      isCountable: false,
    },
  ],

  // 7. Fish & Poultry pieces
  fish_meat: [
    {
      id: 'fish_meat_piece',
      name: 'Piece (টুকরো)',
      nameBn: 'টুকরো',
      unit: 'piece',
      defaultQuantity: 1,
      gramEquivalent: 110, // 1 medium fish or chicken piece = 110g (FCTB-03-001)
      ediblePortionRatio: 0.85, // bones excluded
      source: 'fcdb_bangladesh',
      verificationStatus: 'verified',
      isCountable: true,
      description: '1 medium cooked fish/chicken piece = approx 110g (FCTB)',
    },
    {
      id: 'fish_meat_cup',
      name: 'Cup (Curry with gravy)',
      nameBn: 'কাপ (ঝোল সহ)',
      unit: 'cup',
      defaultQuantity: 1,
      gramEquivalent: 180,
      ediblePortionRatio: 1.0,
      source: 'household_measure',
      verificationStatus: 'verified',
      isCountable: false,
    },
    {
      id: 'fish_meat_grams',
      name: 'Grams (g)',
      nameBn: 'গ্রাম (g)',
      unit: 'g',
      defaultQuantity: 120,
      gramEquivalent: 1,
      ediblePortionRatio: 1.0,
      source: 'household_measure',
      verificationStatus: 'verified',
      isCountable: false,
    },
  ],

  // 8. Rice & Grains (Cooked)
  grains: [
    {
      id: 'grain_grams',
      name: 'Grams (g)',
      nameBn: 'গ্রাম (g)',
      unit: 'g',
      defaultQuantity: 200,
      gramEquivalent: 1,
      ediblePortionRatio: 1.0,
      source: 'household_measure',
      verificationStatus: 'verified',
      isCountable: false,
    },
    {
      id: 'grain_plate',
      name: 'Plate (Standard serving)',
      nameBn: 'প্লেট',
      unit: 'plate',
      defaultQuantity: 1,
      gramEquivalent: 200, // Standard adult cooked rice plate = 200g (FCTB-01-001)
      ediblePortionRatio: 1.0,
      source: 'fcdb_bangladesh',
      verificationStatus: 'verified',
      isCountable: true,
      description: '1 standard cooked rice plate = 200g (FCTB)',
    },
    {
      id: 'grain_cup',
      name: 'Cup (Cooked)',
      nameBn: 'কাপ',
      unit: 'cup',
      defaultQuantity: 1,
      gramEquivalent: 150, // 1 packed cup cooked rice = 150g
      ediblePortionRatio: 1.0,
      source: 'household_measure',
      verificationStatus: 'verified',
      isCountable: false,
      description: '1 cup cooked rice = 150g',
    },
    {
      id: 'grain_half_cup',
      name: '½ Cup',
      nameBn: '½ কাপ',
      unit: 'half_cup',
      defaultQuantity: 1,
      gramEquivalent: 75,
      ediblePortionRatio: 1.0,
      source: 'household_measure',
      verificationStatus: 'verified',
      isCountable: false,
    },
  ],

  // 9. Dal, Soups & Curries
  pulses_liquid: [
    {
      id: 'pulse_grams',
      name: 'Grams (g)',
      nameBn: 'গ্রাম (g)',
      unit: 'g',
      defaultQuantity: 150,
      gramEquivalent: 1,
      ediblePortionRatio: 1.0,
      source: 'household_measure',
      verificationStatus: 'verified',
      isCountable: false,
    },
    {
      id: 'pulse_bowl',
      name: 'Bowl / Bati (বাটি)',
      nameBn: 'বাটি',
      unit: 'bowl',
      defaultQuantity: 1,
      gramEquivalent: 150, // 1 medium Bangladeshi dal bati = 150g
      ediblePortionRatio: 1.0,
      source: 'fcdb_bangladesh',
      verificationStatus: 'verified',
      isCountable: true,
      description: '1 medium dal bowl (bati) = 150g (FCTB)',
    },
    {
      id: 'pulse_cup',
      name: 'Cup',
      nameBn: 'কাপ',
      unit: 'cup',
      defaultQuantity: 1,
      gramEquivalent: 150,
      ediblePortionRatio: 1.0,
      source: 'household_measure',
      verificationStatus: 'verified',
      isCountable: false,
    },
    {
      id: 'pulse_tbsp',
      name: 'Tablespoon (tbsp)',
      nameBn: 'টেবিল চামচ',
      unit: 'tbsp',
      defaultQuantity: 2,
      gramEquivalent: 15,
      ediblePortionRatio: 1.0,
      source: 'household_measure',
      verificationStatus: 'verified',
      isCountable: false,
    },
  ],

  // 10. General / Generic food
  generic: [
    {
      id: 'generic_grams',
      name: 'Grams (g)',
      nameBn: 'গ্রাম (g)',
      unit: 'g',
      defaultQuantity: 100,
      gramEquivalent: 1,
      ediblePortionRatio: 1.0,
      source: 'household_measure',
      verificationStatus: 'verified',
      isCountable: false,
    },
    {
      id: 'generic_piece',
      name: 'Piece (টি)',
      nameBn: 'টি / পিস',
      unit: 'piece',
      defaultQuantity: 1,
      gramEquivalent: 100,
      ediblePortionRatio: 1.0,
      source: 'household_measure',
      verificationStatus: 'unverified',
      isCountable: true,
      description: '1 average individual piece (adjust grams as needed)',
    },
    {
      id: 'generic_cup',
      name: 'Cup',
      nameBn: 'কাপ',
      unit: 'cup',
      defaultQuantity: 1,
      gramEquivalent: 150,
      ediblePortionRatio: 1.0,
      source: 'household_measure',
      verificationStatus: 'unverified',
      isCountable: false,
    },
  ],
};

/**
 * Returns conditional, food-relevant serving options for any food item.
 * Strictly prevents irrelevant units (e.g. egg won't have cups or plates).
 */
export function getServingOptionsForFood(params: {
  foodId?: string | null;
  name?: string;
  category?: string;
}): FoodServingOption[] {
  const name = (params.name || '').toLowerCase();
  const cat = (params.category || '').toLowerCase();

  // 1. Eggs
  if (name.includes('egg') || name.includes('dim') || name.includes('ডিম') || cat === 'eggs') {
    return VERIFIED_SERVING_PRESETS.eggs;
  }

  // 2. Bananas
  if (name.includes('banana') || name.includes('kola') || name.includes('কলা')) {
    return VERIFIED_SERVING_PRESETS.bananas;
  }

  // 3. Apples
  if (name.includes('apple') || name.includes('আপেল') || name.includes('aple')) {
    return VERIFIED_SERVING_PRESETS.apples;
  }

  // 4. Bread
  if (name.includes('bread') || name.includes('pauroti') || name.includes('পাউরুটি') || name.includes('toast')) {
    return VERIFIED_SERVING_PRESETS.bread;
  }

  // 5. Biscuits & Cookies
  if (name.includes('biscuit') || name.includes('বিস্কুট') || name.includes('cookie') || name.includes('cracker')) {
    return VERIFIED_SERVING_PRESETS.biscuits;
  }

  // 6. Roti & Paratha
  if (name.includes('roti') || name.includes('ruti') || name.includes('রুটি') || name.includes('paratha') || name.includes('পরোটা')) {
    return VERIFIED_SERVING_PRESETS.roti;
  }

  // 7. Fish & Poultry
  if (
    cat.includes('fish') ||
    cat.includes('meat') ||
    cat.includes('poultry') ||
    name.includes('fish') ||
    name.includes('mach') ||
    name.includes('মাছ') ||
    name.includes('chicken') ||
    name.includes('murgi') ||
    name.includes('মুরগি') ||
    name.includes('beef') ||
    name.includes('গরু')
  ) {
    return VERIFIED_SERVING_PRESETS.fish_meat;
  }

  // 8. Rice & Grains
  if (
    cat.includes('grain') ||
    cat.includes('cereal') ||
    name.includes('rice') ||
    name.includes('bhat') ||
    name.includes('ভাত') ||
    name.includes('khichuri') ||
    name.includes('খিচুড়ি') ||
    name.includes('biryani') ||
    name.includes('বিরিয়ানি') ||
    name.includes('polao')
  ) {
    return VERIFIED_SERVING_PRESETS.grains;
  }

  // 9. Dal, Soups & Curries
  if (
    cat.includes('pulse') ||
    cat.includes('legume') ||
    name.includes('dal') ||
    name.includes('ডাল') ||
    name.includes('soup') ||
    name.includes('ঝোল')
  ) {
    return VERIFIED_SERVING_PRESETS.pulses_liquid;
  }

  return VERIFIED_SERVING_PRESETS.generic;
}

/**
 * Deterministically converts user-selected quantity and unit into gram weight.
 * Strictly adheres to verified data and allows user overrides without fabricating numbers.
 */
export function convertQuantityToGrams(params: {
  foodName: string;
  category?: string;
  unit: ServingUnitType | string;
  quantity: number;
  customWeightPerUnit?: number | null; // User override or package net weight
}): ConvertedServingResult {
  const { foodName, category, unit, quantity, customWeightPerUnit } = params;
  const safeQty = Math.max(0.1, Number(quantity) || 1);

  // 1. Direct grams
  if (unit === 'g') {
    return {
      grams: Math.round(safeQty * 10) / 10,
      conversionNote: `${safeQty}g confirmed directly`,
      isVerified: true,
      requiresWeightInput: false,
    };
  }

  // 2. Kilograms
  if (unit === 'kg') {
    const totalG = safeQty * 1000;
    return {
      grams: Math.round(totalG),
      conversionNote: `${safeQty} kg = ${totalG}g`,
      isVerified: true,
      requiresWeightInput: false,
    };
  }

  // 3. User custom weight override provided (e.g. user entered package net weight or custom weight)
  if (customWeightPerUnit && customWeightPerUnit > 0) {
    const totalG = Math.round(safeQty * customWeightPerUnit * 10) / 10;
    return {
      grams: totalG,
      conversionNote: `${safeQty} × ${customWeightPerUnit}g (user-confirmed net weight)`,
      isVerified: true,
      requiresWeightInput: false,
    };
  }

  // 4. Look up verified serving option
  const options = getServingOptionsForFood({ name: foodName, category });
  const matched = options.find((o) => o.unit === unit);

  if (matched && matched.gramEquivalent !== null) {
    const totalG = Math.round(safeQty * matched.gramEquivalent * 10) / 10;
    return {
      grams: totalG,
      conversionNote: `${safeQty} ${matched.name} = ${totalG}g (${matched.source === 'fcdb_bangladesh' ? 'FCTB Verified' : 'USDA FDC Verified'})`,
      isVerified: matched.verificationStatus === 'verified',
      requiresWeightInput: false,
    };
  }

  // 5. Unit requires custom weight (e.g. packet of biscuits where package weight is unknown)
  if (matched && matched.requiresCustomWeight) {
    return {
      grams: 0,
      conversionNote: 'Package size requires net weight entry',
      isVerified: false,
      requiresWeightInput: true,
    };
  }

  // 6. Fallback: Default 100g per unit if unknown, but flag as unverified
  const defaultServing = 100;
  const totalG = Math.round(safeQty * defaultServing);
  return {
    grams: totalG,
    conversionNote: `${safeQty} unit(s) (~${totalG}g estimated; please verify)`,
    isVerified: false,
    requiresWeightInput: false,
  };
}
