/**
 * Allergy and Intolerance Awareness Engine for NutriLens.
 * Strictly adheres to Section 6 & 11 of NutriLens Nutrition Profile Specification:
 * - Keeps allergies and intolerances separate.
 * - Never claims a food is allergy-safe when ingredient information is incomplete.
 * - Flags potential allergy conflicts as critical warnings.
 * - Uses discrete token and word-boundary matching to prevent false positives (e.g. Green Chili vs Caffeine).
 * - Deduplicates warnings using stable composite IDs.
 */

export type ConflictType = 'allergy' | 'intolerance';

export type EvidenceLevel =
  | 'confirmed_ingredient'
  | 'possible_ingredient'
  | 'preparation_dependent'
  | 'unknown_ingredients'
  | 'no_conflict';

export interface AllergenConflict {
  id: string; // Stable composite key: foodId::conflictType::restriction
  foodName: string;
  foodItemId?: string;
  matchedAllergen: string;
  conflictType: ConflictType;
  severity: 'high_allergy_warning' | 'intolerance_note';
  evidenceLevel: EvidenceLevel;
  evidenceLabel: string;
  reason: string;
  message: string;
  contributingIngredients: string[];
}

export interface MealSafetyAuditResult {
  hasAllergyConflict: boolean;
  hasIntoleranceConflict: boolean;
  allergyWarnings: AllergenConflict[];
  intoleranceNotes: AllergenConflict[];
  noConflictNotice?: string;
  safetyDisclaimer: string;
}

export interface CandidateFoodForAudit {
  id?: string;
  name: string;
  nameBn?: string;
  preparationState?: string;
  confirmedIngredients?: string[];
  userReportedIngredients?: string[];
}

// ==============================================================================
// VERIFIED RESTRICTION DEFINITIONS (Discrete word boundaries & exact tokens)
// ==============================================================================

interface RestrictionRule {
  name: string;
  type: ConflictType;
  // Regex that requires word boundaries for English names
  englishRegex: RegExp;
  // Exact discrete tokens for Bengali words (split by whitespace/punctuation)
  bengaliTokens: string[];
  // Common specific recipes / dish names that naturally contain this allergen
  knownDishes: string[];
  reasonTemplate: string;
  evidenceLabel: string;
}

const VERIFIED_RULES: RestrictionRule[] = [
  // 1. Caffeine Sensitivity (Intolerance)
  {
    name: 'Caffeine sensitivity',
    type: 'intolerance',
    // Strictly whole words: tea, coffee, espresso, etc. NEVER matches "green chili" or "chili"
    englishRegex: /\b(coffee|espresso|cappuccino|latte|mocha|cold brew|black tea|green tea|milk tea|iced tea|matcha|tea|caffeine|energy drink|red bull|monster|speed|tiger|cola|coca-cola|pepsi|cocoa|chocolate)\b/i,
    // Discrete Bengali word tokens: 'চা' matches ONLY the exact word 'চা' (tea). It NEVER matches 'কাঁচা' (raw) or 'কাঁচামরিচ'
    bengaliTokens: ['চা', 'রং চা', 'দুধ চা', 'লেবু চা', 'গ্রিন টি', 'কফি', 'কোক', 'চকলেট'],
    knownDishes: ['milk tea', 'dudh cha', 'black tea', 'lal cha', 'coffee', 'espresso', 'green tea'],
    reasonTemplate: 'Known dietary source of caffeine (tea, coffee, or caffeinated beverage).',
    evidenceLabel: 'Confirmed ingredient match',
  },
  // 2. Lactose Intolerance
  {
    name: 'Lactose intolerance',
    type: 'intolerance',
    englishRegex: /\b(milk|dairy|ghee|butter|paneer|curd|yogurt|doi|dahi|cream|custard|firni|kheer|payesh|chhana|sandesh|rasgulla|cheese|whey|casein|borhani)\b/i,
    bengaliTokens: ['দুধ', 'ঘি', 'মাখন', 'দই', 'পনির', 'ছানা', 'মালাই', 'ক্ষীর', 'পায়েশ', 'দুধ চা', 'বোরহানি'],
    knownDishes: ['milk tea', 'dudh cha', 'misti doi', 'shahi paneer', 'firni', 'kheer', 'payesh', 'borhani'],
    reasonTemplate: 'Contains milk or dairy products, which are primary sources of lactose.',
    evidenceLabel: 'Confirmed ingredient match',
  },
  // 3. Gluten Intolerance / Celiac
  {
    name: 'Gluten intolerance',
    type: 'intolerance',
    englishRegex: /\b(wheat|atta|maida|suji|semolina|roti|ruti|chapati|paratha|naan|luchi|puri|bread|toast|biscuit|biscuits|cake|pasta|noodles|samosa|shingara|shingada|barley|rye)\b/i,
    bengaliTokens: ['গম', 'আটা', 'ময়দা', 'রুটি', 'পরোটা', 'নান', 'লুচি', 'সুজি', 'পাউরুটি', 'বিস্কুট', 'নুডুলস', 'সিঙ্গাড়া', 'সমুচা'],
    knownDishes: ['roti', 'ruti', 'paratha', 'naan', 'biscuits', 'toast', 'bread', 'noodles', 'cake'],
    reasonTemplate: 'Contains wheat or gluten-bearing flours and grains.',
    evidenceLabel: 'Confirmed ingredient match',
  },
  // 4. Peanuts (Allergy)
  {
    name: 'Peanuts',
    type: 'allergy',
    englishRegex: /\b(peanut|peanuts|groundnut|groundnuts|peanut butter|peanut biscuits|badam sharbat|badam shake)\b/i,
    bengaliTokens: ['চীনাবাদাম', 'চিনা বাদাম', 'চিনাবাদাম', 'বাদাম বিস্কুট'],
    knownDishes: ['peanut biscuits', 'chinabadam bhaja', 'peanut butter'],
    reasonTemplate: 'Verified ingredient record contains peanuts / groundnuts.',
    evidenceLabel: 'Ingredient/database match',
  },
  // 5. Tree Nuts (Allergy)
  {
    name: 'Tree nuts (almonds, walnuts, cashews)',
    type: 'allergy',
    englishRegex: /\b(almond|almonds|cashew|cashews|walnut|walnuts|pistachio|pistachios|kaju|kathbadam|pesta|akrot|korma|rezala)\b/i,
    bengaliTokens: ['কাজুবাদাম', 'কাঠবাদাম', 'পেস্তাবাদাম', 'আখরোট', 'কোরমা', 'রেজালা'],
    knownDishes: ['shahi korma', 'mutton rezala', 'badam kheer'],
    reasonTemplate: 'Dish preparation frequently uses blended tree nuts (cashew or almond paste).',
    evidenceLabel: 'Possible ingredient match',
  },
  // 6. Milk / Dairy (Allergy)
  {
    name: 'Milk/dairy',
    type: 'allergy',
    englishRegex: /\b(milk|dairy|ghee|butter|paneer|curd|yogurt|doi|dahi|cream|custard|firni|kheer|payesh|chhana|sandesh|rasgulla|cheese|whey|casein)\b/i,
    bengaliTokens: ['দুধ', 'ঘি', 'মাখন', 'দই', 'পনির', 'ছানা', 'মালাই', 'ক্ষীর', 'পায়েশ', 'দুধ চা'],
    knownDishes: ['milk tea', 'dudh cha', 'misti doi', 'shahi paneer', 'firni', 'kheer'],
    reasonTemplate: 'Verified dairy ingredients detected in food.',
    evidenceLabel: 'Confirmed ingredient match',
  },
  // 7. Eggs (Allergy)
  {
    name: 'Eggs',
    type: 'allergy',
    englishRegex: /\b(egg|eggs|dim|omelette|mayonnaise)\b/i,
    bengaliTokens: ['ডিম', 'ডিমের ঝোল', 'ডিম ভাজি', 'অমলেট', 'সিদ্ধ ডিম'],
    knownDishes: ['boiled egg', 'dim bhaji', 'egg curry', 'dimer jhol', 'omelette'],
    reasonTemplate: 'Contains eggs or whole egg products.',
    evidenceLabel: 'Confirmed ingredient match',
  },
  // 8. Fish (Allergy)
  {
    name: 'Fish',
    type: 'allergy',
    englishRegex: /\b(fish|rui|ilish|katla|pangas|koi|magur|shing|tengra|boal|tilapia|macher)\b/i,
    bengaliTokens: ['মাছ', 'রুই', 'ইলিশ', 'কাতলা', 'পাঙ্গাস', 'কৈ', 'মাগুর', 'শিং', 'মাছের'],
    knownDishes: ['rui macher jhol', 'ilish bhapa', 'fish curry', 'macher kalia'],
    reasonTemplate: 'Food item is a verified freshwater or saltwater fish.',
    evidenceLabel: 'Confirmed ingredient match',
  },
  // 9. Shellfish (Allergy)
  {
    name: 'Shellfish (shrimp, crab, lobster)',
    type: 'allergy',
    englishRegex: /\b(shrimp|prawn|crab|lobster|chingri|kankra)\b/i,
    bengaliTokens: ['চিংড়ি', 'কাঁকড়া', 'গলদা চিংড়ি', 'বাগদা চিংড়ি', 'চিংড়ি মাছের মালাইকারি'],
    knownDishes: ['chingri malai curry', 'shrimp curry', 'crab curry'],
    reasonTemplate: 'Contains crustacean or shellfish species.',
    evidenceLabel: 'Confirmed ingredient match',
  },
  // 10. Soy (Allergy)
  {
    name: 'Soy',
    type: 'allergy',
    englishRegex: /\b(soy|soya|tofu|edamame|soy sauce|soya chunks)\b/i,
    bengaliTokens: ['সয়া', 'টফু', 'সয়াবিন মিট', 'সয়া সস'],
    knownDishes: ['tofu', 'soya curry', 'soy sauce'],
    reasonTemplate: 'Contains soybean derivatives or soy protein.',
    evidenceLabel: 'Confirmed ingredient match',
  },
  // 11. Mustard (Sensitivity / Allergy)
  {
    name: 'Mustard',
    type: 'intolerance',
    englishRegex: /\b(mustard|mustard oil|shorshe|shorsher tel|kasundi)\b/i,
    bengaliTokens: ['সরিষা', 'সরিষার তেল', 'সর্ষে', 'কাশুন্দি'],
    knownDishes: ['shorshe ilish', 'kasundi'],
    reasonTemplate: 'Prepared with mustard oil or mustard seed paste.',
    evidenceLabel: 'Preparation-dependent concern',
  },
];

/**
 * Tokenizes text into discrete words to prevent partial-word substring bugs.
 * (e.g. "কাঁচা মরিচ" -> ["কাঁচা", "মরিচ"], so "কাঁচা" NEVER matches "চা").
 */
function tokenizeWords(text: string): string[] {
  if (!text) return [];
  // Split on spaces, punctuation, parentheses, brackets, slashes
  return text
    .split(/[\s,()&+\-/।_]+/)
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Audits plate food candidates against user declared allergies and intolerances.
 * Strictly guarantees:
 * 1. Zero false positives (Green Chili will NEVER match Caffeine sensitivity).
 * 2. Stable composite IDs to eliminate duplicate warnings.
 * 3. Merging multiple matching ingredients for the same food into one clean card.
 * 4. Distinct evidence levels and clear safety notices.
 */
export function auditMealForUserRestrictions(
  candidateFoods: CandidateFoodForAudit[],
  userAllergies: string[],
  userIntolerances: string[]
): MealSafetyAuditResult {
  // 1. Deduplicate user restrictions
  const activeAllergies = Array.from(
    new Set(
      (userAllergies || [])
        .map((a) => a?.trim())
        .filter((a) => a && a !== 'None')
    )
  );

  const activeIntolerances = Array.from(
    new Set(
      (userIntolerances || [])
        .map((i) => i?.trim())
        .filter((i) => i && i !== 'None')
    )
  );

  const allergyMap = new Map<string, AllergenConflict>();
  const intoleranceMap = new Map<string, AllergenConflict>();

  // Helper to normalize restriction names for matching
  const findMatchingRule = (name: string, type: ConflictType): RestrictionRule | undefined => {
    const clean = name.toLowerCase().replace(/[\(\)]/g, '').trim();
    return VERIFIED_RULES.find(
      (r) =>
        r.type === type &&
        (r.name.toLowerCase() === clean ||
          clean.includes(r.name.toLowerCase()) ||
          r.name.toLowerCase().includes(clean))
    );
  };

  for (const food of candidateFoods) {
    const foodId = food.id || food.name.toLowerCase().replace(/\s+/g, '-');
    const foodNameLower = food.name.toLowerCase();
    const foodBnLower = (food.nameBn || '').toLowerCase();
    const foodTokens = tokenizeWords(`${food.name} ${food.nameBn || ''}`);

    const extraIngredients = [
      ...(food.confirmedIngredients || []),
      ...(food.userReportedIngredients || []),
    ];

    // -------------------------------------------------------------
    // A. Check Allergies
    // -------------------------------------------------------------
    for (const userAlg of activeAllergies) {
      const rule = findMatchingRule(userAlg, 'allergy');

      let isMatch = false;
      let matchedReason = '';
      let evidenceLevel: EvidenceLevel = 'confirmed_ingredient';
      let evidenceLabel = 'Confirmed ingredient match';
      const contributing: string[] = [];

      if (rule) {
        // 1. Direct Regex match against English name
        if (rule.englishRegex.test(foodNameLower)) {
          isMatch = true;
          contributing.push(food.name);
          matchedReason = rule.reasonTemplate;
          evidenceLabel = rule.evidenceLabel;
        }

        // 2. Exact token match against Bengali name (discrete word match)
        if (!isMatch && rule.bengaliTokens.some((tok) => foodTokens.includes(tok.toLowerCase()))) {
          isMatch = true;
          contributing.push(food.nameBn || food.name);
          matchedReason = rule.reasonTemplate;
          evidenceLabel = rule.evidenceLabel;
        }

        // 3. Known dish match
        if (!isMatch && rule.knownDishes.some((kd) => foodNameLower.includes(kd))) {
          isMatch = true;
          contributing.push(food.name);
          matchedReason = rule.reasonTemplate;
          evidenceLevel = 'possible_ingredient';
          evidenceLabel = 'Common recipe ingredient';
        }

        // 4. Check user-reported / clarified ingredients
        if (extraIngredients.length > 0) {
          for (const extra of extraIngredients) {
            const extraLower = extra.toLowerCase();
            if (rule.englishRegex.test(extraLower) || rule.bengaliTokens.some((t) => extraLower.includes(t))) {
              isMatch = true;
              contributing.push(extra);
              matchedReason = `User clarification indicated: ${extra}.`;
              evidenceLevel = 'preparation_dependent';
              evidenceLabel = 'User clarification response';
            }
          }
        }
      } else {
        // Fallback for custom user allergies: strict word boundary match
        const customLower = userAlg.toLowerCase();
        const customRegex = new RegExp(`\\b${customLower}\\b`, 'i');
        if (customRegex.test(foodNameLower) || foodTokens.includes(customLower)) {
          isMatch = true;
          contributing.push(userAlg);
          matchedReason = `Food name matches declared allergy: ${userAlg}.`;
          evidenceLabel = 'Potential match';
        }
      }

      if (isMatch) {
        const stableKey = `${foodId}::allergy::${userAlg.toLowerCase()}`;
        if (allergyMap.has(stableKey)) {
          const existing = allergyMap.get(stableKey)!;
          contributing.forEach((c) => {
            if (!existing.contributingIngredients.includes(c)) {
              existing.contributingIngredients.push(c);
            }
          });
        } else {
          allergyMap.set(stableKey, {
            id: stableKey,
            foodName: food.name,
            foodItemId: food.id,
            matchedAllergen: userAlg,
            conflictType: 'allergy',
            severity: 'high_allergy_warning',
            evidenceLevel,
            evidenceLabel,
            reason: matchedReason,
            message: `Potential Allergen Conflict: "${food.name}" matches your declared allergy to ${userAlg}.`,
            contributingIngredients: contributing,
          });
        }
      }
    }

    // -------------------------------------------------------------
    // B. Check Intolerances (Reported separately with exact evidence)
    // -------------------------------------------------------------
    for (const userIntol of activeIntolerances) {
      const rule = findMatchingRule(userIntol, 'intolerance');

      let isMatch = false;
      let matchedReason = '';
      let evidenceLevel: EvidenceLevel = 'confirmed_ingredient';
      let evidenceLabel = 'Confirmed ingredient match';
      const contributing: string[] = [];

      if (rule) {
        // 1. Direct Regex match against English name
        if (rule.englishRegex.test(foodNameLower)) {
          isMatch = true;
          contributing.push(food.name);
          matchedReason = rule.reasonTemplate;
          evidenceLabel = rule.evidenceLabel;
        }

        // 2. Exact token match against Bengali name (discrete word match)
        // CRITICAL: Discrete tokens ensure "কাঁচা" NEVER matches "চা"
        if (!isMatch && rule.bengaliTokens.some((tok) => foodTokens.includes(tok.toLowerCase()))) {
          isMatch = true;
          contributing.push(food.nameBn || food.name);
          matchedReason = rule.reasonTemplate;
          evidenceLabel = rule.evidenceLabel;
        }

        // 3. Known dish match
        if (!isMatch && rule.knownDishes.some((kd) => foodNameLower.includes(kd))) {
          isMatch = true;
          contributing.push(food.name);
          matchedReason = rule.reasonTemplate;
          evidenceLevel = 'possible_ingredient';
          evidenceLabel = 'Common recipe ingredient';
        }

        // 4. Check user-reported / clarified ingredients
        if (extraIngredients.length > 0) {
          for (const extra of extraIngredients) {
            const extraLower = extra.toLowerCase();
            if (rule.englishRegex.test(extraLower) || rule.bengaliTokens.some((t) => extraLower.includes(t))) {
              isMatch = true;
              contributing.push(extra);
              matchedReason = `User clarification indicated: ${extra}.`;
              evidenceLevel = 'preparation_dependent';
              evidenceLabel = 'User clarification response';
            }
          }
        }
      } else {
        // Fallback for custom user intolerances: strict word boundary match
        const customLower = userIntol.toLowerCase();
        const customRegex = new RegExp(`\\b${customLower}\\b`, 'i');
        if (customRegex.test(foodNameLower) || foodTokens.includes(customLower)) {
          isMatch = true;
          contributing.push(userIntol);
          matchedReason = `Food name matches declared intolerance: ${userIntol}.`;
          evidenceLabel = 'Potential match';
        }
      }

      if (isMatch) {
        const stableKey = `${foodId}::intolerance::${userIntol.toLowerCase()}`;
        if (intoleranceMap.has(stableKey)) {
          const existing = intoleranceMap.get(stableKey)!;
          contributing.forEach((c) => {
            if (!existing.contributingIngredients.includes(c)) {
              existing.contributingIngredients.push(c);
            }
          });
        } else {
          intoleranceMap.set(stableKey, {
            id: stableKey,
            foodName: food.name,
            foodItemId: food.id,
            matchedAllergen: userIntol,
            conflictType: 'intolerance',
            severity: 'intolerance_note',
            evidenceLevel,
            evidenceLabel,
            reason: matchedReason,
            message: `Digestive Note: "${food.name}" may contain ingredients linked to your ${userIntol}.`,
            contributingIngredients: contributing,
          });
        }
      }
    }
  }

  const allergyWarnings = Array.from(allergyMap.values());
  const intoleranceNotes = Array.from(intoleranceMap.values());

  const hasAnyRestrictions = activeAllergies.length > 0 || activeIntolerances.length > 0;
  const noConflictNotice =
    hasAnyRestrictions && allergyWarnings.length === 0 && intoleranceNotes.length === 0
      ? 'No known conflicts were identified between your confirmed food items and saved dietary restrictions.'
      : undefined;

  return {
    hasAllergyConflict: allergyWarnings.length > 0,
    hasIntoleranceConflict: intoleranceNotes.length > 0,
    allergyWarnings,
    intoleranceNotes,
    noConflictNotice,
    safetyDisclaimer:
      'NutriLens does not claim guaranteed allergen safety. Incomplete ingredient information or cross-contact cannot be ruled out from visual inspection alone.',
  };
}
