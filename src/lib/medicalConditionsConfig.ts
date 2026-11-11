/**
 * Structured Medical Conditions Configuration for NutriLens.
 * Defines condition items and their gender applicability.
 */

export type BiologicalSexOption = 'male' | 'female' | 'prefer_not_to_say';

export interface MedicalConditionDefinition {
  id: string;
  name: string;
  applicableSex: ('all' | BiologicalSexOption)[];
  category?: 'metabolic' | 'cardiovascular' | 'digestive' | 'reproductive' | 'general' | 'other';
  hasDiabetesSubtype?: boolean;
}

export const MEDICAL_CONDITIONS_REGISTRY: MedicalConditionDefinition[] = [
  {
    id: 'none',
    name: 'None',
    applicableSex: ['all'],
    category: 'general',
  },
  {
    id: 'diabetes',
    name: 'Diabetes (Type 1, Type 2, or Prediabetes)',
    applicableSex: ['all'],
    category: 'metabolic',
    hasDiabetesSubtype: true,
  },
  {
    id: 'hypertension',
    name: 'Hypertension (High Blood Pressure)',
    applicableSex: ['all'],
    category: 'cardiovascular',
  },
  {
    id: 'dyslipidemia',
    name: 'High Cholesterol / Dyslipidemia',
    applicableSex: ['all'],
    category: 'cardiovascular',
  },
  {
    id: 'fatty_liver',
    name: 'Fatty Liver Disease (NAFLD / MASLD)',
    applicableSex: ['all'],
    category: 'metabolic',
  },
  {
    id: 'ckd',
    name: 'Chronic Kidney Disease (CKD)',
    applicableSex: ['all'],
    category: 'metabolic',
  },
  {
    id: 'gerd',
    name: 'Gastroesophageal Reflux Disease (GERD)',
    applicableSex: ['all'],
    category: 'digestive',
  },
  {
    id: 'ibs',
    name: 'Irritable Bowel Syndrome (IBS)',
    applicableSex: ['all'],
    category: 'digestive',
  },
  {
    id: 'celiac',
    name: 'Celiac Disease',
    applicableSex: ['all'],
    category: 'digestive',
  },
  {
    id: 'cardiovascular',
    name: 'Cardiovascular / Heart Disease',
    applicableSex: ['all'],
    category: 'cardiovascular',
  },
  {
    id: 'thyroid',
    name: 'Thyroid Disorder (Hypo / Hyperthyroidism)',
    applicableSex: ['all'],
    category: 'metabolic',
  },
  {
    id: 'gout',
    name: 'Gout / Hyperuricemia',
    applicableSex: ['all'],
    category: 'metabolic',
  },
  // Female-specific conditions
  {
    id: 'pcos',
    name: 'Polycystic Ovary Syndrome (PCOS)',
    applicableSex: ['female'],
    category: 'reproductive',
  },
  {
    id: 'gestational_diabetes',
    name: 'Gestational Diabetes (Past or Present)',
    applicableSex: ['female'],
    category: 'reproductive',
    hasDiabetesSubtype: true,
  },
  {
    id: 'endometriosis',
    name: 'Endometriosis',
    applicableSex: ['female'],
    category: 'reproductive',
  },
  // Male-specific conditions
  {
    id: 'prostate',
    name: 'Benign Prostatic Hyperplasia (BPH) / Prostate Health',
    applicableSex: ['male'],
    category: 'reproductive',
  },
  // Other (specify)
  {
    id: 'other',
    name: 'Other (specify)',
    applicableSex: ['all'],
    category: 'other',
  },
];

/**
 * Returns available medical condition names filtered by biological sex.
 */
export function getAvailableMedicalConditions(sexInput?: string | null): string[] {
  const normalizedSex = (sexInput || 'prefer_not_to_say').toLowerCase().trim();

  let activeSex: BiologicalSexOption = 'prefer_not_to_say';
  if (normalizedSex.includes('female')) {
    activeSex = 'female';
  } else if (normalizedSex.includes('male')) {
    activeSex = 'male';
  }

  return MEDICAL_CONDITIONS_REGISTRY.filter((cond) => {
    if (cond.applicableSex.includes('all')) return true;
    if (activeSex === 'prefer_not_to_say') {
      // Show general/all conditions when prefer not to say
      return cond.applicableSex.includes('all');
    }
    return cond.applicableSex.includes(activeSex);
  }).map((c) => c.name);
}

/**
 * Validates a list of selected condition names against a biological sex,
 * returning only those that remain valid.
 */
export function sanitizeConditionsForSex(
  selectedConditions: string[],
  newSexInput?: string | null
): string[] {
  const available = getAvailableMedicalConditions(newSexInput);
  return selectedConditions.filter((name) => available.includes(name));
}

