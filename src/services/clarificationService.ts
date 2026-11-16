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
  addedFoods: {
    name: string;
    nameBn?: string;
    grams: number;
    category: string;
    preparationState?: string;
    isCountable?: boolean;
    detectedCount?: number | null;
    countUnit?: string | null;
    catalogId?: string;
  }[];
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
  answers: ClarificationAnswer[],
  questions?: ClarificationQuestion[]
): ClarificationInterpretation {
  const userReportedIngredients: string[] = [];
  const addedFoods: ClarificationInterpretation['addedFoods'] = [];
  let oilMultiplier = 1.0;
  let oilPref: ClarificationInterpretation['oilPreference'] = undefined;
  let uncertaintyPreserved = false;
  const summaryNotes: string[] = [];

  const addFoodIfUnique = (food: ClarificationInterpretation['addedFoods'][0]) => {
    const exists = addedFoods.some(
      (f) =>
        f.name.toLowerCase() === food.name.toLowerCase() ||
        (f.nameBn && food.nameBn && f.nameBn === food.nameBn)
    );
    if (!exists) {
      addedFoods.push(food);
    }
  };

  for (const ans of answers) {
    const selected = ans.selected_answers || [];
    const custom = (ans.custom_answer || '').trim();
    const customLower = custom.toLowerCase();

    // Match parent question metadata if provided
    const parentQ = questions?.find((q) => q.question_id === ans.question_id);
    const qText = (parentQ?.question || '').toLowerCase();

    // Check "Not sure"
    if (selected.includes('Not sure') || customLower === 'not sure') {
      uncertaintyPreserved = true;
    }

    const isAffirmative =
      selected.includes('Yes') ||
      selected.includes('yes') ||
      customLower.startsWith('yes') ||
      customLower.includes('included') ||
      customLower.includes('added');

    // 1. Cooking Oil / Fat: Refines oil multiplier and allergen context (DOES NOT add plate food item)
    const isOilQuestion =
      ans.question_id === 'q_cooking_oil' ||
      qText.includes('oil') ||
      qText.includes('fat') ||
      qText.includes('ghee') ||
      qText.includes('তেল') ||
      qText.includes('ঘি');

    if (isOilQuestion) {
      const allOilText = [...selected, custom].join(' ').toLowerCase();
      if (allOilText.includes('ghee') || allOilText.includes('ঘি')) {
        userReportedIngredients.push('Ghee (Dairy/Lactose)');
        oilPref = 'ghee';
        oilMultiplier = Math.max(oilMultiplier, 1.25);
        summaryNotes.push('Cooked with Ghee (contains dairy)');
      }
      if (allOilText.includes('mustard') || allOilText.includes('সরিষা')) {
        userReportedIngredients.push('Mustard oil');
        if (!oilPref) oilPref = 'mustard';
        oilMultiplier = Math.max(oilMultiplier, 1.15);
        summaryNotes.push('Cooked with Mustard oil');
      }
      if (allOilText.includes('soybean') || allOilText.includes('সয়াবিন')) {
        userReportedIngredients.push('Soybean oil');
        if (!oilPref) oilPref = 'soybean';
        oilMultiplier = Math.max(oilMultiplier, 1.15);
        summaryNotes.push('Cooked with Soybean oil');
      }
      if (allOilText.includes('sunflower') || allOilText.includes('সূর্যমুখী')) {
        userReportedIngredients.push('Sunflower oil');
        if (!oilPref) oilPref = 'sunflower';
        oilMultiplier = Math.max(oilMultiplier, 1.15);
        summaryNotes.push('Cooked with Sunflower oil');
      }
      if (allOilText.includes('vegetable oil') || allOilText.includes('ভেজিটেবল')) {
        userReportedIngredients.push('Vegetable oil');
        if (!oilPref) oilPref = 'vegetable';
        oilMultiplier = Math.max(oilMultiplier, 1.15);
        summaryNotes.push('Cooked with Vegetable oil');
      }
      if (allOilText.includes('no added oil') || allOilText.includes('boiled plain')) {
        if (!oilPref) {
          oilPref = 'none';
          oilMultiplier = 1.0;
        }
        summaryNotes.push('Boiled plain / No added oil');
      }
    }

    // 2. Potato / Alu Additions: Adds Boiled Potato (Biryani Alu) to plate
    const isPotatoQuestion =
      ans.question_id === 'q_biryani_potato_egg' ||
      qText.includes('potato') ||
      qText.includes('alu') ||
      qText.includes('aloo') ||
      qText.includes('আলু');

    const potatoSelected = selected.some(
      (s) =>
        s.includes('Potato included') ||
        s.includes('Both potato and egg') ||
        s.toLowerCase().includes('potato') ||
        s.toLowerCase().includes('alu') ||
        s.includes('আলু')
    );

    const potatoInCustom =
      customLower.includes('potato') ||
      customLower.includes('alu') ||
      customLower.includes('aloo') ||
      custom.includes('আলু');

    if (potatoSelected || potatoInCustom || (isPotatoQuestion && isAffirmative)) {
      addFoodIfUnique({
        name: 'Boiled Potato (Biryani Alu)',
        nameBn: 'সিদ্ধ আলু',
        grams: 60,
        category: 'vegetables',
        preparationState: 'boiled',
        isCountable: false,
        catalogId: '33333333-3333-3333-3333-333333333348',
      });
      userReportedIngredients.push('Potato');
      summaryNotes.push('Includes Biryani potato piece (~60g)');
    }

    // 3. Boiled Egg Additions: Adds Boiled Egg to plate
    const isEggQuestion =
      ans.question_id === 'q_biryani_potato_egg' ||
      qText.includes('egg') ||
      qText.includes('dim') ||
      qText.includes('ডিম');

    const eggSelected = selected.some(
      (s) =>
        s.includes('Boiled egg included') ||
        s.includes('Both potato and egg') ||
        s.toLowerCase().includes('egg') ||
        s.toLowerCase().includes('dim') ||
        s.includes('ডিম')
    );

    const eggInCustom =
      customLower.includes('egg') ||
      customLower.includes('dim') ||
      custom.includes('ডিম');

    if (eggSelected || eggInCustom || (isEggQuestion && isAffirmative)) {
      addFoodIfUnique({
        name: 'Boiled Chicken Egg (Dim Shiddho)',
        nameBn: 'সিদ্ধ ডিম',
        grams: 55,
        category: 'eggs',
        preparationState: 'boiled',
        isCountable: true,
        detectedCount: 1,
        countUnit: 'egg',
        catalogId: '33333333-3333-3333-3333-333333333325',
      });
      userReportedIngredients.push('Egg');
      summaryNotes.push('Includes Boiled egg (~55g)');
    }

    // 4. Fresh Salad Additions (e.g. Q3: "Was any additional raita or salad consumed with this meal?")
    const isSaladQuestion =
      qText.includes('salad') ||
      qText.includes('সালাদ') ||
      qText.includes('cucumber') ||
      qText.includes('shosha') ||
      qText.includes('শসা');

    const saladSelected = selected.some(
      (s) =>
        s.toLowerCase().includes('salad') ||
        s.includes('সালাদ') ||
        s.toLowerCase().includes('cucumber') ||
        s.includes('শসা')
    );

    const saladInCustom =
      customLower.includes('salad') ||
      customLower.includes('cucumber') ||
      customLower.includes('shosa') ||
      customLower.includes('shosha') ||
      custom.includes('সালাদ') ||
      custom.includes('শসা');

    if (saladSelected || saladInCustom || (isSaladQuestion && isAffirmative)) {
      addFoodIfUnique({
        name: 'Raw Cucumber Salad with Green Chili & Onion',
        nameBn: 'শসা সালাদ',
        grams: 60,
        category: 'vegetables',
        preparationState: 'raw',
        isCountable: false,
        catalogId: '33333333-3333-3333-3333-333333333345',
      });
      userReportedIngredients.push('Fresh Salad (Cucumber/Onion)');
      summaryNotes.push('Fresh cucumber salad added (~60g)');
    }

    // 5. Raita Additions
    const isRaitaQuestion =
      qText.includes('raita') ||
      qText.includes('রায়তা') ||
      qText.includes('borhani') ||
      qText.includes('বোরহানি');

    const raitaSelected = selected.some(
      (s) =>
        s.toLowerCase().includes('raita') ||
        s.includes('রায়তা') ||
        s.toLowerCase().includes('borhani') ||
        s.includes('বোরহানি')
    );

    const raitaInCustom =
      customLower.includes('raita') ||
      customLower.includes('borhani') ||
      custom.includes('রায়তা') ||
      custom.includes('বোরহানি');

    if (raitaSelected || raitaInCustom || (isRaitaQuestion && isAffirmative)) {
      addFoodIfUnique({
        name: 'Raita / Mint Yogurt Dip',
        nameBn: 'রায়তা',
        grams: 75,
        category: 'dairy_and_milks',
        preparationState: 'raw',
        isCountable: false,
      });
      userReportedIngredients.push('Yogurt/Doi (Dairy/Lactose)');
      summaryNotes.push('Raita yogurt dip added (~75g)');
    }

    // 6. Tea / Coffee Additions
    if (ans.question_id === 'q_tea_additions' || qText.includes('tea') || qText.includes('coffee') || qText.includes('cha')) {
      if (selected.some((s) => s.includes("Cow's milk") || s.includes('Condensed milk') || s.includes('Powdered milk')) || customLower.includes('milk') || customLower.includes('dudh')) {
        userReportedIngredients.push("Cow's milk (Dairy/Lactose)");
        summaryNotes.push('Milk added to beverage');
      }
      if (selected.some((s) => s.includes('Sugar added')) || customLower.includes('sugar') || customLower.includes('chini')) {
        userReportedIngredients.push('Refined sugar');
        summaryNotes.push('Sugar added');
      }
      if (selected.some((s) => s.includes('Black / plain'))) {
        summaryNotes.push('Plain black beverage without milk or sugar');
      }
    }

    // 7. Curry Thickener
    if (ans.question_id === 'q_curry_thickener' || qText.includes('gravy') || qText.includes('thickener')) {
      if (selected.some((s) => s.includes('Yogurt/Doi') || s.includes('Heavy cream')) || customLower.includes('doi') || customLower.includes('yogurt')) {
        userReportedIngredients.push('Yogurt/Doi (Dairy/Lactose)');
        summaryNotes.push('Gravy contains dairy (doi/cream)');
      }
      if (selected.some((s) => s.includes('Nut paste')) || customLower.includes('badam') || customLower.includes('nut')) {
        userReportedIngredients.push('Nut paste (Tree nuts / Peanuts)');
        summaryNotes.push('Gravy thickened with nut paste');
      }
    }

    // 8. Custom written details allergen & ingredient context
    if (custom) {
      userReportedIngredients.push(`User Note: "${custom}"`);
      if (customLower.includes('ghee')) userReportedIngredients.push('Ghee (Dairy/Lactose)');
      if (customLower.includes('mustard')) userReportedIngredients.push('Mustard oil');
      if (customLower.includes('milk') || customLower.includes('dudh')) userReportedIngredients.push("Cow's milk (Dairy/Lactose)");
      if (customLower.includes('peanut') || customLower.includes('badam')) userReportedIngredients.push('Peanut / Nut product');
      if (customLower.includes('egg') || customLower.includes('dim')) userReportedIngredients.push('Egg');

      // Check if user specifically entered a custom food name in the text box (e.g. "dal", "chicken", "beef")
      if ((customLower.includes('dal') || customLower.includes('daal') || custom.includes('ডাল')) && !qText.includes('dal')) {
        addFoodIfUnique({
          name: 'Cooked Red Lentils (Masoor Dal Jhol)',
          nameBn: 'মসুর ডাল ঝোল',
          grams: 100,
          category: 'pulses',
          preparationState: 'curried',
          isCountable: false,
        });
      }
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
