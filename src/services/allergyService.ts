/**
 * Allergy and Intolerance Awareness Engine for NutriLens.
 * Strictly adheres to Section 6 & 11 of NutriLens Nutrition Profile Specification:
 * - Keeps allergies and intolerances separate.
 * - Never claims a food is allergy-safe when ingredient information is incomplete.
 * - Flags potential allergy conflicts as critical warnings.
 */

export interface AllergenConflict {
  foodName: string;
  matchedAllergen: string;
  severity: 'high_allergy_warning' | 'intolerance_note';
  message: string;
}

export interface MealSafetyAuditResult {
  hasAllergyConflict: boolean;
  hasIntoleranceConflict: boolean;
  allergyWarnings: AllergenConflict[];
  intoleranceNotes: AllergenConflict[];
  safetyDisclaimer: string;
}

const COMMON_ALLERGEN_KEYWORDS: Record<string, string[]> = {
  Peanuts: ['peanut', 'badam', 'chinabadam', 'চীনাবাদাম'],
  'Tree nuts (almonds, walnuts, cashews)': [
    'almond',
    'walnut',
    'cashew',
    'kaju',
    'kathbadam',
    'কাজুবাদাম',
    'কাঠবাদাম',
  ],
  'Milk/dairy': [
    'milk',
    'dairy',
    'ghee',
    'paneer',
    'doi',
    'yogurt',
    'curd',
    'ঘি',
    'দুধ',
    'দই',
    'পনির',
    'ছানা',
  ],
  Eggs: ['egg', 'dim', 'omelette', 'ডিম'],
  Fish: ['fish', 'mach', 'macher', 'rui', 'ilish', 'katla', 'মাছ', 'রুই', 'ইলিশ'],
  'Shellfish (shrimp, crab, lobster)': ['shrimp', 'prawn', 'crab', 'chingri', 'চিংড়ি', 'কাঁকড়া'],
  Soy: ['soy', 'soya', 'tofu', 'সয়া'],
  Wheat: ['wheat', 'roti', 'atta', 'maida', 'bread', 'রুটি', 'গম', 'ময়দা', 'আটা'],
  Sesame: ['sesame', 'til', 'তিল'],
};

const COMMON_INTOLERANCE_KEYWORDS: Record<string, string[]> = {
  'Lactose intolerance': ['milk', 'doi', 'yogurt', 'curd', 'paneer', 'দুধ', 'দই', 'ছানা'],
  'Gluten intolerance': ['wheat', 'roti', 'atta', 'maida', 'bread', 'রুটি', 'গম', 'আটা'],
  'Caffeine sensitivity': ['coffee', 'tea', 'cha', 'চা', 'কফি'],
};

/**
 * Audits plate food candidates against user declared allergies and intolerances.
 */
export function auditMealForUserRestrictions(
  candidateFoods: { name: string; nameBn?: string }[],
  userAllergies: string[],
  userIntolerances: string[]
): MealSafetyAuditResult {
  const allergyWarnings: AllergenConflict[] = [];
  const intoleranceNotes: AllergenConflict[] = [];

  const activeAllergies = (userAllergies || []).filter((a) => a !== 'None');
  const activeIntolerances = (userIntolerances || []).filter((i) => i !== 'None');

  for (const food of candidateFoods) {
    const textTarget = `${food.name} ${food.nameBn || ''}`.toLowerCase();

    // 1. Check Allergies
    for (const allergy of activeAllergies) {
      const keywords = COMMON_ALLERGEN_KEYWORDS[allergy] || [allergy.toLowerCase()];
      const match = keywords.some((kw) => textTarget.includes(kw.toLowerCase()));

      if (match) {
        allergyWarnings.push({
          foodName: food.name,
          matchedAllergen: allergy,
          severity: 'high_allergy_warning',
          message: `Potential Allergen Conflict: "${food.name}" matches your declared allergy to ${allergy}.`,
        });
      }
    }

    // 2. Check Intolerances (Reported separately)
    for (const intolerance of activeIntolerances) {
      const keywords = COMMON_INTOLERANCE_KEYWORDS[intolerance] || [intolerance.toLowerCase()];
      const match = keywords.some((kw) => textTarget.includes(kw.toLowerCase()));

      if (match) {
        intoleranceNotes.push({
          foodName: food.name,
          matchedAllergen: intolerance,
          severity: 'intolerance_note',
          message: `Digestive Note: "${food.name}" may contain ingredients linked to your ${intolerance}.`,
        });
      }
    }
  }

  return {
    hasAllergyConflict: allergyWarnings.length > 0,
    hasIntoleranceConflict: intoleranceNotes.length > 0,
    allergyWarnings,
    intoleranceNotes,
    safetyDisclaimer:
      'NutriLens does not claim guaranteed allergen safety. Incomplete ingredient information or cross-contact cannot be ruled out from visual inspection alone.',
  };
}
