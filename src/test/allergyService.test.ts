import { describe, it, expect } from 'vitest';
import { auditMealForUserRestrictions } from '../services/allergyService';

describe('auditMealForUserRestrictions', () => {
  it('detects allergen conflicts in meal ingredients', () => {
    const mealItems = [
      { name: 'Prawn Curry', nameBn: 'চিংড়ি কারি' },
      { name: 'Mustard oil', nameBn: 'সরিষার তেল' },
    ];

    const result = auditMealForUserRestrictions(
      mealItems,
      ['Shellfish (shrimp, crab, lobster)'],
      []
    );

    expect(result.hasAllergyConflict).toBe(true);
    expect(result.allergyWarnings.length).toBeGreaterThan(0);
    expect(result.allergyWarnings[0].matchedAllergen).toBe('Shellfish (shrimp, crab, lobster)');
  });

  it('keeps allergies and intolerances strictly partitioned', () => {
    const mealItems = [
      { name: 'Milk Tea', nameBn: 'দুধ চা' },
      { name: 'Wheat Roti', nameBn: 'গমের রুটি' },
    ];

    const result = auditMealForUserRestrictions(
      mealItems,
      ['Wheat'],
      ['Lactose intolerance']
    );

    expect(result.hasAllergyConflict).toBe(true);
    expect(result.hasIntoleranceConflict).toBe(true);
    expect(result.allergyWarnings[0].matchedAllergen).toBe('Wheat');
    expect(result.intoleranceNotes[0].matchedAllergen).toBe('Lactose intolerance');
  });

  it('includes the responsible non-clinical safety disclaimer', () => {
    const result = auditMealForUserRestrictions(
      [],
      [],
      []
    );

    expect(result.safetyDisclaimer).toContain('NutriLens does not claim guaranteed allergen safety');
  });
});
