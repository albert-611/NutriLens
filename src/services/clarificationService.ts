import { ClarificationQuestion, ClarificationAnswer } from '../contracts';

/**
 * Intelligent Clarification Service for NutriLens.
 * Converts food detection uncertainties into structured, interactive clarification questions,
 * and interprets user answers to update ingredient assumptions and allergen safety audits.
 */

export interface ClarificationInterpretation {
  userReportedIngredients: string[];
  oilPreference?: 'ghee' | 'mustard' | 'soybean' | 'sunflower' | 'vegetable' | 'none';
  oilCaloriesMultiplier: number;
  addedFoods: { name: string; nameBn?: string; grams: number; category: string }[];
  uncertaintyPreserved: boolean;
  summaryNotes: string[];
}

/**
 * Generates dish-relevant structured clarification questions.
 */
export function generateClarificationQuestions(
  candidates: {
    label?: string;
    food_name?: string;
    name?: string;
    preparation_state?: string;
    is_countable?: boolean;
    detected_count?: number | null;
  }[],
  rawQuestions?: string[]
): ClarificationQuestion[] {
  const questions: ClarificationQuestion[] = [];
  const foodNames = candidates
    .map((c) => (c.label || c.food_name || c.name || '').toLowerCase())
    .join(' ');

  const hasCookedOrCurried = candidates.some((c) => {
    const prep = (c.preparation_state || '').toLowerCase();
    const name = (c.label || c.food_name || c.name || '').toLowerCase();
    return (
      prep === 'cooked' ||
      prep === 'curried' ||
      prep === 'fried' ||
      prep === 'roasted' ||
      name.includes('rice') ||
      name.includes('dal') ||
      name.includes('curry') ||
      name.includes('jhol') ||
      name.includes('biryani') ||
      name.includes('polao') ||
      name.includes('bhaji')
    );
  });

  const hasBiryaniOrPolao =
    foodNames.includes('biryani') ||
    foodNames.includes('polao') ||
    foodNames.includes('pulao') ||
    foodNames.includes('tehari') ||
    foodNames.includes('khichuri');

  const hasTeaOrCoffee =
    foodNames.includes('tea') ||
    foodNames.includes('cha') ||
    foodNames.includes('coffee') ||
    foodNames.includes('latte') ||
    foodNames.includes('cappuccino');

  const hasCurryOrGravy =
    foodNames.includes('curry') ||
    foodNames.includes('jhol') ||
    foodNames.includes('korma') ||
    foodNames.includes('rezala') ||
    foodNames.includes('gravy') ||
    foodNames.includes('bhuna');

  // 1. Cooking Oil / Fat Question
  if (hasCookedOrCurried) {
    questions.push({
      question_id: 'q_cooking_oil',
      question: 'Which cooking oil or fat was used in preparing the meal?',
      answer_type: 'multi_select_with_custom',
      required: false,
      options: [
        'Soybean oil (সয়াবিন তেল)',
        'Mustard oil (সরিষার তেল)',
        'Ghee (ঘি)',
        'Sunflower oil (সূর্যমুখী তেল)',
        'Vegetable oil (ভেজিটেবল তেল)',
        'No added oil / Boiled plain',
        'Not sure',
      ],
      allow_custom_answer: true,
      custom_answer_placeholder: 'e.g. Mostly soybean oil with a spoonful of ghee...',
      selected_answers: [],
      custom_answer: null,
    });
  }

  // 2. Biryani / Polao Hidden Additions
  if (hasBiryaniOrPolao) {
    questions.push({
      question_id: 'q_biryani_potato_egg',
      question: 'Were any potatoes or boiled eggs included inside the dish?',
      answer_type: 'single_select',
      required: false,
      options: [
        'Potato included (আলু)',
        'Boiled egg included (ডিম)',
        'Both potato and egg included',
        'Neither (meat and rice only)',
        'Not sure',
      ],
      allow_custom_answer: true,
      custom_answer_placeholder: 'e.g. 1 medium potato piece...',
      selected_answers: [],
      custom_answer: null,
    });
  }

  // 3. Tea / Coffee Milk & Sugar Question
  if (hasTeaOrCoffee) {
    questions.push({
      question_id: 'q_tea_additions',
      question: 'Did this beverage include milk or added sugar?',
      answer_type: 'multi_select_with_custom',
      required: false,
      options: [
        "Cow's milk (দুধ)",
        'Condensed milk',
        'Powdered milk',
        'Sugar added (চিনি)',
        'Black / plain (no milk or sugar)',
        'Not sure',
      ],
      allow_custom_answer: true,
      custom_answer_placeholder: 'e.g. 1 tsp sugar, 2 tbsp cow milk...',
      selected_answers: [],
      custom_answer: null,
    });
  }

  // 4. Curry Thickener / Hidden Dairy & Nut Question
  if (hasCurryOrGravy && !hasBiryaniOrPolao) {
    questions.push({
      question_id: 'q_curry_thickener',
      question: 'Was dairy (doi/cream) or nut paste used in this gravy?',
      answer_type: 'single_select',
      required: false,
      options: [
        'Plain onion-ginger gravy (no dairy or nuts)',
        'Yogurt/Doi added (দই)',
        'Nut paste added (বাদাম বাটা)',
        'Heavy cream or malai added',
        'Not sure',
      ],
      allow_custom_answer: true,
      custom_answer_placeholder: 'Describe any special gravy ingredients...',
      selected_answers: [],
      custom_answer: null,
    });
  }

  // 5. If raw review questions were passed by AI Vision and aren't covered yet, convert them
  if (rawQuestions && rawQuestions.length > 0) {
    rawQuestions.forEach((q, idx) => {
      // Don't duplicate if already covered by preset
      const qLower = q.toLowerCase();
      if (
        (qLower.includes('oil') || qLower.includes('ghee')) &&
        questions.some((existing) => existing.question_id === 'q_cooking_oil')
      ) {
        return;
      }
      if (
        (qLower.includes('potato') || qLower.includes('egg')) &&
        questions.some((existing) => existing.question_id === 'q_biryani_potato_egg')
      ) {
        return;
      }
      if (
        (qLower.includes('milk') || qLower.includes('sugar')) &&
        questions.some((existing) => existing.question_id === 'q_tea_additions')
      ) {
        return;
      }

      const isYesNo =
        qLower.includes('was ') ||
        qLower.includes('were ') ||
        qLower.includes('did ') ||
        qLower.includes('is there');

      questions.push({
        question_id: `q_ai_custom_${idx + 1}`,
        question: q,
        answer_type: isYesNo ? 'yes_no' : 'multi_select_with_custom',
        required: false,
        options: isYesNo ? ['Yes', 'No', 'Not sure'] : ['Standard preparation', 'Special preparation', 'Not sure'],
        allow_custom_answer: true,
        custom_answer_placeholder: 'Describe details or other ingredients...',
        selected_answers: [],
        custom_answer: null,
      });
    });
  }

  return questions;
}

/**
 * Interprets user-submitted clarification answers into concrete ingredient and nutrition rules.
 */
export function interpretClarificationAnswers(
  answers: ClarificationAnswer[]
): ClarificationInterpretation {
  const userReportedIngredients: string[] = [];
  const addedFoods: { name: string; nameBn?: string; grams: number; category: string }[] = [];
  let oilMultiplier = 1.0;
  let oilPref: ClarificationInterpretation['oilPreference'] = undefined;
  let uncertaintyPreserved = false;
  const summaryNotes: string[] = [];

  for (const ans of answers) {
    const selected = ans.selected_answers || [];
    const custom = (ans.custom_answer || '').trim();

    // Check "Not sure"
    if (selected.includes('Not sure')) {
      uncertaintyPreserved = true;
    }

    // Question 1: Cooking Oil
    if (ans.question_id === 'q_cooking_oil') {
      if (selected.some((s) => s.includes('Ghee'))) {
        userReportedIngredients.push('Ghee (Dairy/Lactose)');
        oilPref = 'ghee';
        oilMultiplier = Math.max(oilMultiplier, 1.25);
        summaryNotes.push('Cooked with Ghee (contains dairy)');
      }
      if (selected.some((s) => s.includes('Mustard oil'))) {
        userReportedIngredients.push('Mustard oil');
        if (!oilPref) oilPref = 'mustard';
        oilMultiplier = Math.max(oilMultiplier, 1.15);
        summaryNotes.push('Cooked with Mustard oil');
      }
      if (selected.some((s) => s.includes('Soybean oil'))) {
        userReportedIngredients.push('Soybean oil');
        if (!oilPref) oilPref = 'soybean';
        oilMultiplier = Math.max(oilMultiplier, 1.15);
        summaryNotes.push('Cooked with Soybean oil');
      }
      if (selected.some((s) => s.includes('Sunflower oil'))) {
        userReportedIngredients.push('Sunflower oil');
        if (!oilPref) oilPref = 'sunflower';
        oilMultiplier = Math.max(oilMultiplier, 1.15);
        summaryNotes.push('Cooked with Sunflower oil');
      }
      if (selected.some((s) => s.includes('Vegetable oil'))) {
        userReportedIngredients.push('Vegetable oil');
        if (!oilPref) oilPref = 'vegetable';
        oilMultiplier = Math.max(oilMultiplier, 1.15);
        summaryNotes.push('Cooked with Vegetable oil');
      }
      if (selected.some((s) => s.includes('No added oil'))) {
        if (!oilPref) {
          oilPref = 'none';
          oilMultiplier = 1.0;
        }
        summaryNotes.push('Boiled plain / No added oil');
      }
    }

    // Question 2: Biryani Additions
    if (ans.question_id === 'q_biryani_potato_egg') {
      if (selected.some((s) => s.includes('Potato included') || s.includes('Both potato and egg'))) {
        addedFoods.push({
          name: 'Boiled Potato (Biryani Alu)',
          nameBn: 'সিদ্ধ আলু',
          grams: 60,
          category: 'Vegetables',
        });
        userReportedIngredients.push('Potato');
        summaryNotes.push('Includes Biryani potato piece (~60g)');
      }
      if (selected.some((s) => s.includes('Boiled egg included') || s.includes('Both potato and egg'))) {
        addedFoods.push({
          name: 'Boiled Egg',
          nameBn: 'সিদ্ধ ডিম',
          grams: 55,
          category: 'Poultry And Eggs',
        });
        userReportedIngredients.push('Egg');
        summaryNotes.push('Includes Boiled egg (~55g)');
      }
    }

    // Question 3: Tea / Coffee Additions
    if (ans.question_id === 'q_tea_additions') {
      if (selected.some((s) => s.includes("Cow's milk") || s.includes('Condensed milk') || s.includes('Powdered milk'))) {
        userReportedIngredients.push("Cow's milk (Dairy/Lactose)");
        summaryNotes.push('Milk added to beverage');
      }
      if (selected.some((s) => s.includes('Sugar added'))) {
        userReportedIngredients.push('Refined sugar');
        summaryNotes.push('Sugar added');
      }
      if (selected.some((s) => s.includes('Black / plain'))) {
        summaryNotes.push('Plain black beverage without milk or sugar');
      }
    }

    // Question 4: Gravy Thickener
    if (ans.question_id === 'q_curry_thickener') {
      if (selected.some((s) => s.includes('Yogurt/Doi') || s.includes('Heavy cream'))) {
        userReportedIngredients.push('Yogurt/Doi (Dairy/Lactose)');
        summaryNotes.push('Gravy contains dairy (doi/cream)');
      }
      if (selected.some((s) => s.includes('Nut paste'))) {
        userReportedIngredients.push('Nut paste (Tree nuts / Peanuts)');
        summaryNotes.push('Gravy thickened with nut paste');
      }
    }

    // Custom written response
    if (custom) {
      userReportedIngredients.push(`User Note: "${custom}"`);
      const customLower = custom.toLowerCase();
      if (customLower.includes('ghee')) userReportedIngredients.push('Ghee (Dairy/Lactose)');
      if (customLower.includes('mustard')) userReportedIngredients.push('Mustard oil');
      if (customLower.includes('milk') || customLower.includes('dudh')) userReportedIngredients.push("Cow's milk (Dairy/Lactose)");
      if (customLower.includes('peanut') || customLower.includes('badam')) userReportedIngredients.push('Peanut / Nut product');
      if (customLower.includes('egg') || customLower.includes('dim')) userReportedIngredients.push('Egg');
    }
  }

  return {
    userReportedIngredients: Array.from(new Set(userReportedIngredients)),
    oilPreference: oilPref,
    oilCaloriesMultiplier: oilMultiplier,
    addedFoods,
    uncertaintyPreserved,
    summaryNotes,
  };
}
