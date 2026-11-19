import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CheckSquare,
  Plus,
  Trash2,
  ArrowRight,
  ShieldAlert,
  Info,
  Scale,
  Sparkles,
  Search,
  CheckCircle2,
  HelpCircle,
  X,
  Edit2,
  AlertOctagon,
  AlertCircle,
  Calculator,
  RotateCcw,
  Minus,
  Flame,
  Layers,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { auditMealForUserRestrictions } from '../../services/allergyService';
import {
  type CandidateItem,
  type AnalyzeMealResponse,
  type PreparationState,
  type FoodSearchResultItem,
  type ClarificationQuestion,
  type ClarificationAnswer,
} from '../../contracts';
import {
  generateClarificationQuestions,
  interpretClarificationAnswers,
} from '../../services/clarificationService';
import {
  getDraftAnalysis,
} from '../../services/mealAnalysisService';
import {
  searchFoods,
  getFoodById,
  registerDynamicFood,
  resolveFoodAlias,
} from '../../lib/foodDatabase';
import { searchUSDAFoodsDirect } from '../../services/usdaService';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { saveLocalConfirmedMeal, formatMealTime, calculateItemCost } from '../../services/dashboardService';
import { ensureProfileExists } from '../../services/authService';
import {
  getServingOptionsForFood,
  convertQuantityToGrams,
  type ServingUnitType,
  type FoodServingOption,
} from '../../lib/servingUnits';

export interface ConfirmedEditableItem {
  id: string;
  foodId: string;
  externalRecordId: string;
  name: string;
  nameBn: string;
  category: string;
  grams: number;
  aiEstimatedGrams: number;
  selectedUnit: ServingUnitType | string;
  selectedQuantity: number;
  customWeightPerUnit: number | null;
  conversionNote: string;
  isCountable: boolean;
  detectedCount?: number | null;
  countUnit?: string | null;
  identityConfidence?: number;
  countConfidence?: number;
  weightConfidence?: number;
  packagingDetected?: boolean;
  packageNetWeightGrams?: number | null;
  preparationState: PreparationState;
  portionSource: 'user_entered' | 'ai_estimated_unconfirmed' | 'database_verified';
  uncertaintyReasons: string[];
  questions?: string[];
  confidence?: number;
}

export const getItemEmoji = (name: string, category?: string): string => {
  const n = (name || '').toLowerCase();
  if (n.includes('cucumber') || n.includes('শসা')) return '🥒';
  if (n.includes('carrot') || n.includes('গাজর')) return '🥕';
  if (n.includes('sesame') || n.includes('তিল')) return '🌱';
  if (n.includes('seed') || n.includes('বীজ') || n.includes('chia') || n.includes('mustard') || n.includes('কালোজিরা')) return '🌱';
  if (n.includes('rice') || n.includes('ভাত') || n.includes('chawal')) return '🍚';
  if (n.includes('egg') || n.includes('ডিম')) return '🥚';
  if (n.includes('fish') || n.includes('মাছ') || n.includes('rui') || n.includes('hilsa')) return '🐟';
  if (n.includes('chicken') || n.includes('মুরগি') || n.includes('murgi')) return '🍗';
  if (n.includes('beef') || n.includes('গরু') || n.includes('meat') || n.includes('mutton')) return '🥩';
  if (n.includes('dal') || n.includes('lentil') || n.includes('ডাল')) return '🥣';
  if (n.includes('roti') || n.includes('bread') || n.includes('রুটি') || n.includes('paratha')) return '🫓';
  if (n.includes('salad') || n.includes('সালাদ') || n.includes('lettuce') || n.includes('spinach') || n.includes('shak')) return '🥗';
  if (n.includes('banana') || n.includes('কলা')) return '🍌';
  if (n.includes('apple') || n.includes('আপেল')) return '🍎';
  if (n.includes('tomato') || n.includes('টমেটো')) return '🍅';
  if (n.includes('potato') || n.includes('আলু')) return '🥔';
  if (n.includes('onion') || n.includes('পেঁয়াজ')) return '🧅';
  if (n.includes('chili') || n.includes('মরিচ')) return '🌶️';
  if (n.includes('oil') || n.includes('dressing') || n.includes('তেল')) return '🫒';
  if (n.includes('milk') || n.includes('দুধ') || n.includes('yogurt') || n.includes('দই')) return '🥛';
  if (category === 'fruits') return '🍎';
  if (category === 'vegetables') return '🥦';
  if (category === 'meat') return '🥩';
  if (category === 'fish') return '🐟';
  if (category === 'grains') return '🌾';
  return '🍽️';
};

export const ConfirmPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, foodRestrictions } = useAuth();

  // 1. Initial State from router or draft storage
  const [analysisData, setAnalysisData] = useState<AnalyzeMealResponse | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('/images/demo-plate.png');
  const [items, setItems] = useState<ConfirmedEditableItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clarification questions interactive state
  const [clarificationQuestions, setClarificationQuestions] = useState<ClarificationQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, { selected: string[]; custom: string }>>({});
  const [userReportedIngredients, setUserReportedIngredients] = useState<string[]>([]);
  const [isClarificationSubmitted, setIsClarificationSubmitted] = useState<boolean>(false);
  const [isClarificationEditing, setIsClarificationEditing] = useState<boolean>(false);

  // Search Modal state (for adding or swapping foods)
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodSearchResultItem[]>([]);
  const [activeItemToSwap, setActiveItemToSwap] = useState<string | null>(null);

  // Currently focused item in the Confirm Item Sidebar / Gram Calculator
  const activeItem = useMemo(() => {
    if (!selectedItemId) return items[0] || null;
    return items.find((it) => it.id === selectedItemId) || items[0] || null;
  }, [items, selectedItemId]);

  // Available conditional serving units for the active food
  const activeServingOptions: FoodServingOption[] = useMemo(() => {
    if (!activeItem) return [];
    return getServingOptionsForFood({
      name: activeItem.name,
      category: activeItem.category,
    });
  }, [activeItem]);

  // Current weight per unit (editable for piece, cup, slice, packet, bowl, plate, etc.)
  const currentUnitWeight = useMemo(() => {
    if (!activeItem) return 50;
    if (activeItem.customWeightPerUnit && activeItem.customWeightPerUnit > 0) {
      return activeItem.customWeightPerUnit;
    }
    const opt = activeServingOptions.find((o) => o.unit === activeItem.selectedUnit);
    if (opt?.gramEquivalent) return opt.gramEquivalent;
    if (activeItem.aiEstimatedGrams && activeItem.selectedQuantity > 0) {
      return Math.round((activeItem.aiEstimatedGrams / activeItem.selectedQuantity) * 10) / 10;
    }
    return 50;
  }, [activeItem, activeServingOptions]);

  // AI-detected unit weight for the active item
  const aiUnitWeight = useMemo(() => {
    if (!activeItem || !activeItem.aiEstimatedGrams) return null;
    const count = activeItem.detectedCount && activeItem.detectedCount > 0 ? activeItem.detectedCount : 1;
    return Math.round((activeItem.aiEstimatedGrams / count) * 10) / 10;
  }, [activeItem]);

  // Allergy and Intolerance Audit (Deduplicated with exact evidence levels & user-reported ingredients)
  const allergyAudit = useMemo(() => {
    const userAllergies = Array.from(
      new Set([
        ...(profile?.declared_allergens || []),
        ...foodRestrictions.filter((r) => r.restriction_type === 'allergy').map((r) => r.restriction_value),
      ])
    );
    const userIntolerances = Array.from(
      new Set([
        ...foodRestrictions.filter((r) => r.restriction_type === 'intolerance').map((r) => r.restriction_value),
      ])
    );
    return auditMealForUserRestrictions(
      items.map((it) => ({
        id: it.id,
        name: it.name,
        nameBn: it.nameBn,
        preparationState: it.preparationState,
        userReportedIngredients,
      })),
      userAllergies,
      userIntolerances
    );
  }, [items, profile?.declared_allergens, foodRestrictions, userReportedIngredients]);

  // Load items on mount or when router state changes
  useEffect(() => {
    const routerAnalysis = location.state?.analysis as AnalyzeMealResponse | undefined;
    const routerPreview = location.state?.previewUrl as string | undefined;

    const data = routerAnalysis || getDraftAnalysis();

    if (routerPreview) {
      setPreviewImage(routerPreview);
    }

    if (data && data.candidates && data.candidates.length > 0) {
      setAnalysisData(data);
      // Initialize interactive clarification questions
      const clarif = data.clarification_questions?.length
        ? data.clarification_questions
        : generateClarificationQuestions(data.candidates, data.review_questions);
      setClarificationQuestions(clarif);

      const initAnswers: Record<string, { selected: string[]; custom: string }> = {};
      clarif.forEach((q) => {
        initAnswers[q.question_id] = {
          selected: q.selected_answers || [],
          custom: q.custom_answer || '',
        };
      });
      setUserAnswers(initAnswers);
      setIsClarificationSubmitted(false);
      setIsClarificationEditing(false);
      setUserReportedIngredients([]);
      // Map candidate items to editable items with rich serving units
      const mappedItems: ConfirmedEditableItem[] = data.candidates.map((cand, idx) => {
        const dbFood = cand.matched_food_id
          ? getFoodById(cand.matched_food_id)
          : (resolveFoodAlias(cand.label) || (cand.label_bn ? resolveFoodAlias(cand.label_bn) : null));

        const foodName = cand.label || dbFood?.name_en || 'Food Item';
        const foodNameBn = cand.label_bn || dbFood?.name_bn || '';
        const category = dbFood?.category || 'mixed_dishes';

        const servingOptions = getServingOptionsForFood({ name: foodName, category });
        const isCountable = Boolean(
          cand.is_countable || (cand.detected_count !== undefined && cand.detected_count !== null && cand.detected_count > 0)
        );

        let initialUnit: ServingUnitType | string = 'g';
        let initialQuantity = cand.estimated_grams || dbFood?.standard_serving_grams || 150;
        let initialUnitWeight: number | null = null;

        // Check if food has a countable unit or defaults to one
        const primaryCountable = servingOptions.find((o) => o.isCountable && o.unit !== 'packet');

        if (isCountable && cand.detected_count && cand.detected_count > 0) {
          const matchedCountUnit = servingOptions.find((o) => o.isCountable) || primaryCountable;
          if (matchedCountUnit) {
            initialUnit = matchedCountUnit.unit;
            initialQuantity = cand.detected_count;
            // Calculate piece/unit weight directly from AI estimated total grams
            if (cand.estimated_grams && cand.estimated_grams > 0) {
              initialUnitWeight = Math.round((cand.estimated_grams / cand.detected_count) * 10) / 10;
            } else if (matchedCountUnit.gramEquivalent) {
              initialUnitWeight = matchedCountUnit.gramEquivalent;
            }
          }
        } else if (primaryCountable) {
          initialUnit = primaryCountable.unit;
          initialQuantity = cand.detected_count || primaryCountable.defaultQuantity || 1;
          if (cand.estimated_grams && cand.estimated_grams > 0) {
            initialUnitWeight = Math.round((cand.estimated_grams / initialQuantity) * 10) / 10;
          } else if (primaryCountable.gramEquivalent) {
            initialUnitWeight = primaryCountable.gramEquivalent;
          }
        }

        // If unit is cup/bowl/plate/etc., calculate initial unit weight from AI estimate or preset
        if (!initialUnitWeight && initialUnit !== 'g' && initialUnit !== 'kg') {
          const matchedOption = servingOptions.find((o) => o.unit === initialUnit);
          if (cand.estimated_grams && cand.estimated_grams > 0) {
            initialUnitWeight = Math.round((cand.estimated_grams / initialQuantity) * 10) / 10;
          } else if (matchedOption?.gramEquivalent) {
            initialUnitWeight = matchedOption.gramEquivalent;
          }
        }

        const conv = convertQuantityToGrams({
          foodName,
          category,
          unit: initialUnit,
          quantity: initialQuantity,
          customWeightPerUnit: initialUnitWeight,
        });

        const initialGrams = conv.grams > 0 ? conv.grams : (cand.estimated_grams || dbFood?.standard_serving_grams || 150);

        return {
          id: cand.id || `item-${Date.now()}-${idx}`,
          foodId: dbFood?.id || cand.matched_food_id || `custom-${Date.now()}-${idx}`,
          externalRecordId: dbFood?.external_record_id || 'USDA-FDC-CUSTOM',
          name: foodName,
          nameBn: foodNameBn,
          category,
          grams: initialGrams,
          aiEstimatedGrams: cand.estimated_grams || initialGrams,
          selectedUnit: initialUnit,
          selectedQuantity: initialQuantity,
          customWeightPerUnit: initialUnitWeight,
          conversionNote: conv.conversionNote,
          isCountable,
          detectedCount: cand.detected_count,
          countUnit: cand.count_unit,
          identityConfidence: cand.identity_confidence ?? cand.confidence,
          countConfidence: cand.count_confidence,
          weightConfidence: cand.weight_confidence,
          packagingDetected: cand.packaging_detected,
          packageNetWeightGrams: cand.package_net_weight_grams,
          preparationState:
            (cand.preparation_state as PreparationState) ||
            (dbFood?.preparation_state as PreparationState) ||
            'raw',
          portionSource: (cand.portion_basis as any) || 'ai_estimated_unconfirmed',
          uncertaintyReasons: cand.uncertainty_reasons || [],
          questions: cand.questions,
          confidence: cand.confidence,
        };
      });

      setItems(mappedItems);
      if (mappedItems.length > 0 && !selectedItemId) {
        setSelectedItemId(mappedItems[0].id);
      }
    } else {
      setItems([]);
      setSelectedItemId(null);
    }
  }, [location.state]);

  // Synchronize search query across local catalog and live USDA FDC API
  useEffect(() => {
    let isCancelled = false;

    if (isSearchOpen) {
      const localResults = searchFoods(searchQuery, { limit: 10 });
      setSearchResults(localResults);

      if (searchQuery.trim().length >= 2) {
        searchUSDAFoodsDirect(searchQuery.trim(), 8).then((usdaFoods) => {
          if (isCancelled) return;
          usdaFoods.forEach((uf) => registerDynamicFood(uf));
          const usdaFormatted: FoodSearchResultItem[] = usdaFoods.map((uf) => ({
            food_id: uf.id,
            canonical_name: uf.canonical_name,
            local_name: uf.name_en,
            local_name_bn: uf.name_bn,
            category: uf.category,
            preparation_state: uf.preparation_state,
            energy_kcal: uf.energy_kcal,
            protein_g: uf.protein_g,
            carbohydrate_g: uf.carbohydrate_g,
            fat_g: uf.fat_g,
            fibre_g: uf.fibre_g,
            standard_serving_grams: uf.standard_serving_grams,
            serving_unit: 'g',
          }));

          setSearchResults((prev) => {
            const seen = new Set(prev.map((p) => p.canonical_name.toLowerCase()));
            const fresh = usdaFormatted.filter((u) => !seen.has(u.canonical_name.toLowerCase()));
            return [...prev, ...fresh];
          });
        });
      }
    }

    return () => {
      isCancelled = true;
    };
  }, [searchQuery, isSearchOpen]);

  // Helper to compute deterministic nutrients for an item
  const computeItemNutrients = (it: ConfirmedEditableItem) => {
    const food = getFoodById(it.foodId) || getFoodById(it.id);
    const grams = Math.max(0, Number(it.grams) || 0);
    const mult = grams / 100.0;

    let calMult = 1.0;
    let fatMult = 1.0;
    if (it.preparationState === 'fried') {
      calMult = 1.20;
      fatMult = 1.35;
    } else if (it.preparationState === 'curried') {
      calMult = 1.10;
      fatMult = 1.15;
    }

    const calories = Math.round((food?.energy_kcal ?? 130) * mult * calMult);
    const protein = Number(((food?.protein_g ?? 2.7) * mult).toFixed(1));
    const carbs = Number(((food?.carbohydrate_g ?? 28.2) * mult).toFixed(1));
    const fat = Number(((food?.fat_g ?? 0.3) * mult * fatMult).toFixed(1));
    const fibre = Number(((food?.fibre_g ?? 0.4) * mult).toFixed(1));
    const cost = calculateItemCost(it.category || food?.category, grams, it.name || food?.name_en);

    return { calories, protein, carbs, fat, fibre, cost };
  };

  // Live meal grand totals
  const mealTotals = useMemo(() => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let cost = 0;

    items.forEach((it) => {
      const n = computeItemNutrients(it);
      calories += n.calories;
      protein += n.protein;
      carbs += n.carbs;
      fat += n.fat;
      cost += n.cost;
    });

    return {
      calories,
      protein: Number(protein.toFixed(1)),
      carbs: Number(carbs.toFixed(1)),
      fat: Number(fat.toFixed(1)),
      cost: Number(cost.toFixed(2)),
    };
  }, [items]);

  // Active item nutrients
  const activeItemNutrients = useMemo(() => {
    if (!activeItem) return null;
    return computeItemNutrients(activeItem);
  }, [activeItem]);

  // Clarification questions interactions
  const handleToggleOption = (questionId: string, option: string, isSingleSelect: boolean) => {
    setUserAnswers((prev) => {
      const current = prev[questionId] || { selected: [], custom: '' };
      let newSelected: string[] = [];
      if (isSingleSelect) {
        newSelected = current.selected.includes(option) ? [] : [option];
      } else {
        if (option === 'Not sure' || option.includes('No added oil')) {
          newSelected = current.selected.includes(option) ? [] : [option];
        } else {
          const filtered = current.selected.filter(
            (o) => o !== 'Not sure' && !o.includes('No added oil')
          );
          if (filtered.includes(option)) {
            newSelected = filtered.filter((o) => o !== option);
          } else {
            newSelected = [...filtered, option];
          }
        }
      }
      return {
        ...prev,
        [questionId]: {
          ...current,
          selected: newSelected,
        },
      };
    });
  };

  const handleCustomAnswerChange = (questionId: string, text: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || { selected: [] }),
        custom: text,
      },
    }));
  };

  const handleSubmitClarification = () => {
    const formattedAnswers: ClarificationAnswer[] = Object.entries(userAnswers).map(
      ([qId, ans]) => ({
        question_id: qId,
        selected_answers: ans.selected,
        custom_answer: ans.custom.trim() || null,
      })
    );

    const interpretation = interpretClarificationAnswers(formattedAnswers, clarificationQuestions);
    setUserReportedIngredients(interpretation.userReportedIngredients);
    setIsClarificationSubmitted(true);
    setIsClarificationEditing(false);

    // If additions were suggested (e.g. Potato/Alu, Boiled Egg, Salad, Raita)
    if (interpretation.addedFoods.length > 0) {
      let firstAddedId: string | null = null;
      setItems((prev) => {
        const newItems = [...prev];
        interpretation.addedFoods.forEach((add) => {
          const exists = newItems.some(
            (it) =>
              it.name.toLowerCase() === add.name.toLowerCase() ||
              (add.nameBn && it.nameBn && it.nameBn === add.nameBn)
          );
          if (!exists) {
            const catalogFood: any = (add as any).catalogId
              ? getFoodById((add as any).catalogId)
              : resolveFoodAlias(add.name) || searchFoods(add.name)[0];

            const foodId = catalogFood?.food_id || catalogFood?.id || '';
            const externalRecordId =
              catalogFood?.external_record_id || (add.catalogId ? 'FCTB-03-010' : 'CLARIF-ADD');
            const servingOptions = getServingOptionsForFood({
              name: add.name,
              category: add.category,
            });
            const defaultOpt = servingOptions[0];
            const initialGrams = add.grams || catalogFood?.standard_serving_grams || 60;
            const newItemId = `clarif-add-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
            if (!firstAddedId) firstAddedId = newItemId;

            newItems.push({
              id: newItemId,
              foodId,
              externalRecordId,
              name: add.name,
              nameBn: add.nameBn || catalogFood?.name_bn || catalogFood?.local_name_bn || '',
              category: add.category,
              preparationState: (add.preparationState as PreparationState) || 'boiled',
              grams: initialGrams,
              aiEstimatedGrams: initialGrams,
              isCountable: add.isCountable || defaultOpt?.isCountable || false,
              detectedCount: add.detectedCount || (add.isCountable ? 1 : null),
              countUnit: add.countUnit || null,
              selectedUnit: defaultOpt?.unit || (add.isCountable ? (add.countUnit || 'piece') : 'g'),
              selectedQuantity: defaultOpt?.defaultQuantity || (add.isCountable ? 1 : initialGrams),
              customWeightPerUnit: add.isCountable ? (initialGrams / (add.detectedCount || 1)) : null,
              conversionNote: `Added from clarification: ${add.name}`,
              portionSource: 'user_entered',
              uncertaintyReasons: ['User-confirmed addition via AI clarification response.'],
            });
          }
        });
        return newItems;
      });

      if (firstAddedId) {
        setSelectedItemId(firstAddedId);
      }
    }
  };

  // Gram Calculator: Direct Gram Update (Preserves count/cup unit and recalculates unit weight!)
  const updateGramsDirect = (id: string, val: number) => {
    const safeGrams = Math.max(1, Math.min(2500, Number(val) || 1));
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        if (it.selectedUnit !== 'g' && it.selectedUnit !== 'kg' && it.selectedQuantity > 0) {
          const newUnitWeight = Math.round((safeGrams / it.selectedQuantity) * 10) / 10;
          return {
            ...it,
            grams: safeGrams,
            customWeightPerUnit: newUnitWeight,
            conversionNote: `${it.selectedQuantity} ${it.selectedUnit} × ${newUnitWeight}g/${it.selectedUnit} = ${safeGrams}g (adjusted)`,
            portionSource: 'user_entered',
          };
        }
        return {
          ...it,
          grams: safeGrams,
          selectedUnit: 'g',
          selectedQuantity: safeGrams,
          portionSource: 'user_entered',
          conversionNote: `${safeGrams}g entered directly`,
        };
      })
    );
  };

  // Gram Calculator: Increment / Decrement
  const adjustGramsDelta = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const current = it.grams || 100;
        const updated = Math.max(1, Math.min(2500, Math.round(current + delta)));
        if (it.selectedUnit !== 'g' && it.selectedUnit !== 'kg' && it.selectedQuantity > 0) {
          const newUnitWeight = Math.round((updated / it.selectedQuantity) * 10) / 10;
          return {
            ...it,
            grams: updated,
            customWeightPerUnit: newUnitWeight,
            conversionNote: `${it.selectedQuantity} ${it.selectedUnit} × ${newUnitWeight}g/${it.selectedUnit} = ${updated}g (adjusted)`,
            portionSource: 'user_entered',
          };
        }
        return {
          ...it,
          grams: updated,
          selectedQuantity: updated,
          portionSource: 'user_entered',
          conversionNote: `${updated}g (${delta > 0 ? `+${delta}g` : `${delta}g`})`,
        };
      })
    );
  };

  // User edits weight per unit directly (e.g. 1 piece samosa = 40g, 1 piece onion ring = 20g, 1 cup = 180g)
  const handleUnitWeightChange = (id: string, weightPerUnit: number) => {
    const safeW = Math.max(1, Math.min(2000, Number(weightPerUnit) || 1));
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const qty = it.selectedQuantity || 1;
        const totalG = Math.round(qty * safeW * 10) / 10;
        return {
          ...it,
          customWeightPerUnit: safeW,
          grams: totalG,
          conversionNote: `${qty} ${it.selectedUnit} × ${safeW}g/${it.selectedUnit} = ${totalG}g`,
          portionSource: 'user_entered',
        };
      })
    );
  };

  // Stepper for unit weight (+/- 5g, 10g)
  const adjustUnitWeightDelta = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const currentW = it.customWeightPerUnit && it.customWeightPerUnit > 0
          ? it.customWeightPerUnit
          : (activeServingOptions.find((o) => o.unit === it.selectedUnit)?.gramEquivalent || 50);
        const updatedW = Math.max(1, Math.min(2000, Math.round(currentW + delta)));
        const qty = it.selectedQuantity || 1;
        const totalG = Math.round(qty * updatedW * 10) / 10;
        return {
          ...it,
          customWeightPerUnit: updatedW,
          grams: totalG,
          conversionNote: `${qty} ${it.selectedUnit} × ${updatedW}g/${it.selectedUnit} = ${totalG}g`,
          portionSource: 'user_entered',
        };
      })
    );
  };

  // Reset piece/cup weight to AI detected unit weight
  const handleResetUnitWeightToAI = (id: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const aiTotal = it.aiEstimatedGrams || it.grams;
        const count = it.detectedCount && it.detectedCount > 0 ? it.detectedCount : (it.selectedQuantity || 1);
        const aiUnitW = Math.round((aiTotal / count) * 10) / 10;
        const qty = it.selectedQuantity || 1;
        const totalG = Math.round(qty * aiUnitW * 10) / 10;
        return {
          ...it,
          customWeightPerUnit: aiUnitW,
          grams: totalG,
          conversionNote: `${qty} ${it.selectedUnit} × ${aiUnitW}g/${it.selectedUnit} = ${totalG}g (AI detected unit weight)`,
          portionSource: 'ai_estimated_unconfirmed',
        };
      })
    );
  };

  // Reset to AI-estimated weight
  const resetToAiWeight = (id: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const initialAi = it.aiEstimatedGrams || 100;
        let qty = initialAi;
        let unit = 'g';
        let unitWeight: number | null = null;
        if (it.isCountable && it.detectedCount) {
          qty = it.detectedCount;
          unit = it.countUnit || 'piece';
          unitWeight = Math.round((initialAi / qty) * 10) / 10;
        }
        const conv = convertQuantityToGrams({
          foodName: it.name,
          category: it.category,
          unit,
          quantity: qty,
          customWeightPerUnit: unitWeight,
        });

        return {
          ...it,
          grams: conv.grams > 0 ? conv.grams : initialAi,
          selectedUnit: unit,
          selectedQuantity: qty,
          customWeightPerUnit: unitWeight,
          portionSource: 'ai_estimated_unconfirmed',
          conversionNote: `Reset to AI suggestion: ${initialAi}g`,
        };
      })
    );
  };

  // Count-based quantity change
  const updateCountQuantity = (id: string, qty: number) => {
    const safeQty = Math.max(0.25, Math.min(50, Number(qty) || 1));
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const conv = convertQuantityToGrams({
          foodName: it.name,
          category: it.category,
          unit: it.selectedUnit,
          quantity: safeQty,
          customWeightPerUnit: it.customWeightPerUnit,
        });
        return {
          ...it,
          selectedQuantity: safeQty,
          grams: conv.grams > 0 ? conv.grams : it.grams,
          conversionNote: conv.conversionNote,
          portionSource: 'user_entered',
        };
      })
    );
  };

  // Count-based stepper (+ / - count)
  const adjustCountDelta = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const current = it.selectedQuantity || 1;
        const updated = Math.max(1, Math.min(50, Math.round(current + delta)));
        const conv = convertQuantityToGrams({
          foodName: it.name,
          category: it.category,
          unit: it.selectedUnit,
          quantity: updated,
          customWeightPerUnit: it.customWeightPerUnit,
        });
        return {
          ...it,
          selectedQuantity: updated,
          grams: conv.grams > 0 ? conv.grams : it.grams,
          conversionNote: conv.conversionNote,
          portionSource: 'user_entered',
        };
      })
    );
  };

  // Unit switch (e.g. egg -> grams, grams -> cups, etc.)
  const handleUnitChange = (id: string, newUnit: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        let defaultQty = 1;
        if (newUnit === 'g') {
          defaultQty = it.grams || 100;
        } else {
          const opt = activeServingOptions.find((o) => o.unit === newUnit);
          defaultQty = opt?.defaultQuantity || 1;
        }

        const conv = convertQuantityToGrams({
          foodName: it.name,
          category: it.category,
          unit: newUnit,
          quantity: defaultQty,
          customWeightPerUnit: it.customWeightPerUnit,
        });

        return {
          ...it,
          selectedUnit: newUnit,
          selectedQuantity: defaultQty,
          grams: conv.grams > 0 ? conv.grams : it.grams,
          conversionNote: conv.conversionNote,
          portionSource: 'user_entered',
        };
      })
    );
  };

  // Custom package net weight update (e.g. for biscuit packet)
  const handleCustomPackageWeightChange = (id: string, weightPerUnit: number) => {
    const safeW = Math.max(5, Math.min(1000, Number(weightPerUnit) || 50));
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const conv = convertQuantityToGrams({
          foodName: it.name,
          category: it.category,
          unit: it.selectedUnit,
          quantity: it.selectedQuantity || 1,
          customWeightPerUnit: safeW,
        });
        return {
          ...it,
          customWeightPerUnit: safeW,
          grams: conv.grams,
          conversionNote: conv.conversionNote,
          portionSource: 'user_entered',
        };
      })
    );
  };

  // Preparation state update (preserves grams & count!)
  const updatePrepState = (id: string, prep: PreparationState) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, preparationState: prep } : it))
    );
  };

  // Remove food item
  const removeItem = (id: string) => {
    setItems((prev) => {
      const filtered = prev.filter((it) => it.id !== id);
      if (selectedItemId === id) {
        setSelectedItemId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  // Open search modal to swap an existing item
  const handleOpenSwap = (itemId: string) => {
    setActiveItemToSwap(itemId);
    setSearchQuery('');
    setIsSearchOpen(true);
  };

  // Open search modal to add a new food
  const handleOpenAdd = () => {
    setActiveItemToSwap(null);
    setSearchQuery('');
    setIsSearchOpen(true);
  };

  // Select food from verified search modal
  const handleSelectFood = (food: FoodSearchResultItem) => {
    const rawFood = getFoodById(food.food_id);
    const externalRecordId = rawFood?.external_record_id || 'FCTB-01-001';
    const servingOptions = getServingOptionsForFood({
      name: food.local_name,
      category: food.category,
    });
    const defaultOpt = servingOptions[0];
    const initialGrams = food.standard_serving_grams || 100;

    if (activeItemToSwap) {
      // Swapping existing item
      setItems((prev) =>
        prev.map((it) =>
          it.id === activeItemToSwap
            ? {
                ...it,
                foodId: food.food_id,
                externalRecordId,
                name: food.local_name,
                nameBn: food.local_name_bn,
                category: food.category,
                grams: initialGrams,
                aiEstimatedGrams: initialGrams,
                selectedUnit: defaultOpt?.unit || 'g',
                selectedQuantity: defaultOpt?.defaultQuantity || initialGrams,
                customWeightPerUnit: null,
                conversionNote: `${initialGrams}g confirmed`,
                preparationState: food.preparation_state as PreparationState,
                portionSource: 'user_entered',
                uncertaintyReasons: [],
              }
            : it
        )
      );
    } else {
      // Adding new item
      const newItemId = `item-${Date.now()}`;
      const newItem: ConfirmedEditableItem = {
        id: newItemId,
        foodId: food.food_id,
        externalRecordId,
        name: food.local_name,
        nameBn: food.local_name_bn,
        category: food.category,
        grams: initialGrams,
        aiEstimatedGrams: initialGrams,
        selectedUnit: defaultOpt?.unit || 'g',
        selectedQuantity: defaultOpt?.defaultQuantity || initialGrams,
        customWeightPerUnit: null,
        conversionNote: `${initialGrams}g standard serving`,
        isCountable: defaultOpt?.isCountable || false,
        preparationState: food.preparation_state as PreparationState,
        portionSource: 'user_entered',
        uncertaintyReasons: ['Manually added by user from verified FAO catalog.'],
      };
      setItems((prev) => [...prev, newItem]);
      setSelectedItemId(newItemId);
    }

    setIsSearchOpen(false);
    setActiveItemToSwap(null);
  };

  // Submit and confirm plate
  const handleConfirm = async () => {
    if (items.length === 0) {
      setErrorMessage('Please include at least one food item on your plate.');
      return;
    }

    // Verify all items have valid grams
    const invalidItem = items.find((it) => !it.grams || it.grams <= 0);
    if (invalidItem) {
      setErrorMessage(
        `Please specify a valid gram weight for "${invalidItem.name}" before proceeding.`
      );
      setSelectedItemId(invalidItem.id);
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      let savedMealLogId: string | null = null;
      let authenticatedUserId: string | null = user?.id || profile?.id || null;

      // Format confirmed items for persistence and local state
      const confirmedMealItems = items.map((it) => {
        const food = getFoodById(it.foodId) || getFoodById(it.id);
        const grams = Number(it.grams) || 100;
        const n = computeItemNutrients(it);

        return {
          foodId: it.foodId,
          name: it.name || food?.name_en || 'Food Item',
          nameBn: it.nameBn || food?.name_bn || '',
          category: it.category || food?.category || 'mixed_dishes',
          grams,
          preparationState: it.preparationState || 'cooked',
          calories: n.calories,
          protein: n.protein,
          carbs: n.carbs,
          fat: n.fat,
          cost: n.cost,
        };
      });

      const title = confirmedMealItems.map((x) => x.name).slice(0, 3).join(' + ');
      const titleBn = confirmedMealItems.map((x) => x.nameBn || x.name).slice(0, 3).join(' + ');
      const nowIso = new Date().toISOString();
      const timeInfo = formatMealTime(nowIso);

      if (isSupabaseConfigured) {
        try {
          let { data: authData } = await supabase.auth.getUser();
          let targetUserId = authData?.user?.id || user?.id || profile?.id;
          if (!targetUserId) {
            const { data: sessionData } = await supabase.auth.getSession();
            targetUserId = sessionData?.session?.user?.id;
          }

          if (targetUserId) {
            authenticatedUserId = targetUserId;

            // Ensure profile exists in profiles table so foreign key constraint does not reject meal_logs
            try {
              await ensureProfileExists(targetUserId, authData?.user?.user_metadata?.full_name || profile?.display_name);
            } catch (profErr) {
              console.warn('ensureProfileExists notice in confirm:', profErr);
            }

            const { data: logData, error: logErr } = await supabase
              .from('meal_logs')
              .insert({
                user_id: targetUserId,
                input_mode: analysisData?.input_mode || 'photo',
                status: 'confirmed',
                consent_at: nowIso,
              })
              .select('id')
              .single();

            if (!logErr && logData) {
              savedMealLogId = logData.id;

              // 1. Persist exact verified nutrients & items JSON snapshot to meal_reports
              try {
                await supabase.from('meal_reports').upsert({
                  meal_log_id: savedMealLogId,
                  revision: 1,
                  total_energy_kcal: mealTotals.calories,
                  total_protein_g: mealTotals.protein,
                  total_carbohydrate_g: mealTotals.carbs,
                  total_fat_g: mealTotals.fat,
                  evidence_sources: confirmedMealItems,
                }, { onConflict: 'meal_log_id,revision' });
              } catch (repErr) {
                console.warn('meal_reports snapshot notice:', repErr);
              }

              // 2. Persist individual items to meal_items
              try {
                const fallbackFoodUuid = '33333333-3333-3333-3333-333333333301';
                const rows = confirmedMealItems.map((it, idx) => ({
                  meal_log_id: savedMealLogId,
                  food_id: it.foodId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(it.foodId) ? it.foodId : fallbackFoodUuid,
                  confirmed_grams: it.grams,
                  preparation_state: it.preparationState || 'cooked',
                  portion_source: 'user_entered',
                  display_order: idx + 1,
                }));
                const { error: itemsErr } = await supabase.from('meal_items').insert(rows);
                if (itemsErr) {
                  const safeRows = rows.map((r) => ({ ...r, food_id: fallbackFoodUuid }));
                  await supabase.from('meal_items').insert(safeRows);
                }
              } catch (itemsErr) {
                console.warn('meal_items insert notice:', itemsErr);
              }
            } else if (logErr) {
              console.warn('meal_logs insert error from Supabase:', logErr);
            }
          }
        } catch (dbErr) {
          console.warn('Supabase persistence notice:', dbErr);
        }
      }

      const effectiveUserId = authenticatedUserId || user?.id || profile?.id || 'guest';

      const localMealRecord = {
        id: savedMealLogId || `meal_${Date.now()}`,
        title,
        titleBn,
        time: timeInfo.display,
        timestamp: nowIso,
        mealType: timeInfo.mealType,
        calories: mealTotals.calories,
        protein: mealTotals.protein,
        carbs: mealTotals.carbs,
        fat: mealTotals.fat,
        bazarCost: mealTotals.cost,
        status: 'confirmed' as const,
        items: confirmedMealItems,
      };

      // Always save locally under effective user ID and fallback guest cache
      saveLocalConfirmedMeal(effectiveUserId, localMealRecord);
      if (effectiveUserId !== 'guest') {
        saveLocalConfirmedMeal('guest', localMealRecord);
      }

      // Notify other views (like Dashboard) that a real meal has been confirmed
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('nutrilens_meal_confirmed'));
      }

      const confirmedPayload = items.map((it) => ({
        id: it.id,
        foodId: it.foodId,
        externalRecordId: it.externalRecordId,
        foodName: it.name,
        foodNameBn: it.nameBn,
        category: it.category,
        state: it.preparationState,
        grams: it.grams,
        portionSource: 'user_entered',
        selectedUnit: it.selectedUnit,
        selectedQuantity: it.selectedQuantity,
        conversionNote: it.conversionNote,
      }));

      navigate('/app/report', {
        state: {
          confirmedItems: confirmedPayload,
          mealLogId: savedMealLogId,
          scannedImage: previewImage,
          confirmedAt: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      console.error('Confirmation error:', err);
      setErrorMessage(err?.message || 'Failed to confirm portions.');
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Title & Phase Indicator */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-sans">
            Phase 3 • Step 2 of 4
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">
            AI Proposes Candidates • User Confirms Ground Truth
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('confirm.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Verify food identities, choose countable units or exact grams, and adjust cooking methods for authoritative calculations.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2.5 animate-shake">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Plate Scan Source Image Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 dark:bg-forest-card/60 border border-slate-200 dark:border-forest-border flex flex-col sm:flex-row items-center gap-5">
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-md flex-shrink-0 bg-black/10">
          <img
            src={previewImage}
            alt="Uploaded meal scan"
            className="w-full h-full object-cover object-[center_60%]"
          />
          <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider font-sans bg-black/70 text-emerald-400 border border-emerald-500/30">
            SCANNED
          </span>
        </div>
        <div className="space-y-1.5 flex-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multimodal Vision Detection Active</span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
            {analysisData?.detected_cuisine === 'international' ? 'International & USDA Food Catalog' : 'Food Composition Catalog (FCDB & USDA)'}: {items.length} Candidates Identified
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            AI vision detects food identities and flags portion uncertainty. Adjust the preparation method and gram weight before proceeding to deterministic calculation against official FCDB & USDA FoodData Central databases.
          </p>
        </div>
      </div>

      {/* Separate Food Item Preview Gallery */}
      {items.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-3.5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-forest-border/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Separate Food Item Preview ({items.length} Items Detected)
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Constituent ingredients, garnishes, and toppings separated for individual precision
                </p>
              </div>
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 px-3 py-1 rounded-full self-start sm:self-auto">
              ✓ Individual Item Breakdown
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {items.map((item, idx) => {
              const nutrients = computeItemNutrients(item);
              const isSelected = activeItem?.id === item.id;
              const emoji = getItemEmoji(item.name, item.category);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'bg-slate-50 dark:bg-forest-root border-slate-200 dark:border-forest-border/80 hover:border-emerald-500/40 hover:bg-emerald-50/20'
                  }`}
                  title={`Click to configure ${item.name}`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="w-10 h-10 rounded-xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border flex items-center justify-center text-xl shrink-0 shadow-2xs">
                      {emoji}
                    </span>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {item.name}
                        </span>
                      </div>
                      {item.nameBn && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate font-bengali">
                          {item.nameBn}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block font-extrabold text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                      {item.selectedQuantity && item.selectedUnit !== 'g' && item.selectedUnit !== 'kg'
                        ? `${item.selectedQuantity} ${item.selectedUnit} (${item.grams}g)`
                        : `${item.grams}g`}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5 font-medium">
                      {nutrients.calories} kcal
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive AI Clarification Questions Card */}
      {clarificationQuestions.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-300/60 dark:border-amber-800/40 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-200/70 dark:border-amber-900/50">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <h3 className="font-bold text-sm text-amber-950 dark:text-amber-100">
                  AI Clarification Questions ({clarificationQuestions.length})
                </h3>
              </div>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                Answer these questions to refine cooking oil calories, ingredient assumptions, and allergy safety.
              </p>
            </div>
            {isClarificationSubmitted && !isClarificationEditing && (
              <button
                type="button"
                onClick={() => setIsClarificationEditing(true)}
                className="text-xs font-semibold px-3 py-1 rounded-xl bg-amber-200/60 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 hover:bg-amber-300/60 transition-colors self-start sm:self-auto cursor-pointer"
              >
                Edit Answers
              </button>
            )}
          </div>

          {/* If submitted and not in edit mode, show clean summary */}
          {isClarificationSubmitted && !isClarificationEditing ? (
            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-amber-200/70 dark:border-amber-800/40 text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                <CheckCircle className="w-4 h-4" />
                Answers applied to nutrition & personal intolerance analysis
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {Object.entries(userAnswers).flatMap(([qId, ans]) => {
                  const q = clarificationQuestions.find((cq) => cq.question_id === qId);
                  const list: string[] = [...ans.selected];
                  if (ans.custom) list.push(`"${ans.custom}"`);
                  return list.map((it, idx) => (
                    <span
                      key={`${qId}-${idx}`}
                      className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 text-[11px] font-medium"
                    >
                      {q ? `${q.question.slice(0, 22)}...: ` : ''}{it}
                    </span>
                  ));
                })}
              </div>
            </div>
          ) : (
            /* Interactive question forms */
            <div className="space-y-4">
              {clarificationQuestions.map((q, qIdx) => {
                const ans = userAnswers[q.question_id] || { selected: [], custom: '' };
                const isSingleSelect = q.answer_type === 'single_select' || q.answer_type === 'yes_no';

                return (
                  <div
                    key={q.question_id}
                    className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/70 border border-amber-200/80 dark:border-amber-800/40 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-amber-950 dark:text-amber-100">
                        <span className="text-amber-600 dark:text-amber-400 mr-1.5 font-sans">Q{qIdx + 1}:</span>
                        {q.question}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0 font-sans">
                        {isSingleSelect ? 'Single choice' : 'Multiple choices allowed'}
                      </span>
                    </div>

                    {/* Option Pills */}
                    <div className="flex flex-wrap gap-2">
                      {q.options.map((opt) => {
                        const isSelected = ans.selected.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleToggleOption(q.question_id, opt, isSingleSelect)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500 text-white shadow-xs scale-[1.02]'
                                : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom text answer */}
                    {q.allow_custom_answer && (
                      <div className="pt-1 space-y-1">
                        <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          Other / Additional details (optional):
                        </label>
                        <input
                          type="text"
                          value={ans.custom || ''}
                          onChange={(e) => handleCustomAnswerChange(q.question_id, e.target.value)}
                          placeholder={q.custom_answer_placeholder || 'Enter custom details or ingredients...'}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/50"
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex items-center justify-end gap-3 pt-1">
                {isClarificationEditing && (
                  <button
                    type="button"
                    onClick={() => setIsClarificationEditing(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSubmitClarification}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Submit Answers & Apply to Meal
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Allergy Warning Alert Banner */}
      {allergyAudit.hasAllergyConflict && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500/60 text-rose-900 dark:text-rose-100 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-rose-200 dark:border-rose-900/60">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <div>
                <h4 className="font-extrabold text-sm text-rose-950 dark:text-rose-50">
                  Critical Allergen Conflict Detected
                </h4>
                <p className="text-[11px] text-rose-700 dark:text-rose-300">
                  One or more confirmed foods contain ingredients linked to your declared clinical allergies.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200/80 dark:bg-rose-900/70 text-rose-800 dark:text-rose-200">
              {allergyAudit.allergyWarnings.length} Alert{allergyAudit.allergyWarnings.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allergyAudit.allergyWarnings.map((w) => (
              <div
                key={w.id}
                className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-rose-200/80 dark:border-rose-800/40 shadow-xs space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-xs text-rose-950 dark:text-rose-100 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                    Food: {w.foodName}
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 shrink-0">
                    {w.evidenceLabel}
                  </span>
                </div>

                <div className="text-[11px] space-y-1 text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-rose-800 dark:text-rose-300">Allergen:</span>
                    <span>{w.matchedAllergen}</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="font-semibold text-rose-800 dark:text-rose-300 shrink-0">Reason:</span>
                    <span className="leading-snug">{w.reason}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-rose-700 dark:text-rose-300 pt-1 border-t border-rose-200/60 dark:border-rose-900/40">
            <strong>Important Safety Notice:</strong> {allergyAudit.safetyDisclaimer}
          </p>
        </div>
      )}

      {/* Personal Intolerance Notes Section */}
      {allergyAudit.hasIntoleranceConflict ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/40 text-amber-900 dark:text-amber-100 space-y-3.5 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-amber-200 dark:border-amber-900/60">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-amber-950 dark:text-amber-50">
                  Personal Intolerance Notes
                </h4>
                <p className="text-[11px] text-amber-700 dark:text-amber-300">
                  Potential food conflicts identified against your saved health and dietary profile.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
              {allergyAudit.intoleranceNotes.length} {allergyAudit.intoleranceNotes.length === 1 ? 'Conflict' : 'Conflicts'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allergyAudit.intoleranceNotes.map((note) => (
              <div
                key={note.id}
                className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-amber-200/80 dark:border-amber-800/40 shadow-xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    Food: {note.foodName}
                  </div>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-sm bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 shrink-0">
                    {note.evidenceLabel}
                  </span>
                </div>

                <div className="text-[11px] space-y-1 text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-amber-800 dark:text-amber-300">Concern:</span>
                    <span>{note.matchedAllergen}</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="font-semibold text-amber-800 dark:text-amber-300 shrink-0">Reason:</span>
                    <span className="leading-snug">{note.reason}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-amber-700/90 dark:text-amber-400 pt-1">
            <strong>Clinical Guidance:</strong> Intolerance notes identify digestive sensitivities. Adjust portion sizes or select alternatives to prevent digestive discomfort.
          </p>
        </div>
      ) : allergyAudit.noConflictNotice ? (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-xs font-medium">
              {allergyAudit.noConflictNotice}
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0">
            Verified Clean
          </span>
        </div>
      ) : null}

      {/* Full-Width Plate Food Items Layout with In-Place Horizontal Weight & Quantity Inspector */}
      <div className="space-y-6 w-full">
        {/* Plate Items Section */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-forest-border/60">
            <div className="space-y-0.5">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-500" />
                Plate Food Items ({items.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tap any item to open its Weight &amp; Quantity Inspector and fine-tune serving portions.
              </p>
            </div>
              <Button
                onClick={handleOpenAdd}
                variant="outline"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                {t('confirm.add_item')}
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-3">
                <p className="text-sm font-semibold">No food items on plate.</p>
                <Button onClick={handleOpenAdd} variant="primary" size="sm">
                  Add Verified Food
                </Button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {items.map((item, idx) => {
                  const isSelected = activeItem?.id === item.id;
                  const itemNutrients = computeItemNutrients(item);
                  const itemServingOptions = getServingOptionsForFood({
                    name: item.name,
                    category: item.category,
                  });
                  const itemAiUnitWeight = item.aiEstimatedGrams
                    ? Math.round((item.aiEstimatedGrams / (item.detectedCount || 1)) * 10) / 10
                    : null;
                  const itemCurrentUnitWeight =
                    item.customWeightPerUnit && item.customWeightPerUnit > 0
                      ? item.customWeightPerUnit
                      : (itemServingOptions.find((o) => o.unit === item.selectedUnit)?.gramEquivalent || 50);

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemId(isSelected ? null : item.id)}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer space-y-3.5 ${
                        isSelected
                          ? 'bg-emerald-500/5 dark:bg-forest-cardHover border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                          : 'bg-slate-50/80 dark:bg-forest-root border-slate-200 dark:border-forest-border/70 hover:border-emerald-500/40 hover:bg-slate-50'
                      }`}
                    >
                      {/* Top Row: Name, Bengali, Code, and Badges */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-start sm:items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 transition-colors ${
                              isSelected
                                ? 'bg-emerald-500 text-white'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                                {item.name}
                              </span>
                              {item.nameBn && (
                                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 font-bengali">
                                  ({item.nameBn})
                                </span>
                              )}
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/70 dark:bg-forest-card text-slate-600 dark:text-slate-300">
                                {item.externalRecordId}
                              </span>
                              {item.selectedUnit !== 'g' ? (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-400 font-bold flex items-center gap-1 border border-blue-500/30">
                                  <Layers className="w-2.5 h-2.5" />
                                  {item.selectedQuantity} {item.selectedUnit}
                                </span>
                              ) : (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-forest-border text-slate-700 dark:text-slate-200 font-bold">
                                  {item.grams}g
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Top-Right Action Buttons */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenSwap(item.id);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border text-slate-700 dark:text-slate-300 hover:text-emerald-600 hover:border-emerald-500 transition-colors"
                            title="Swap this food with another from the database"
                          >
                            <Edit2 className="w-3 h-3" />
                            Change Food
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeItem(item.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            className="p-1 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors"
                            title={isSelected ? 'Collapse inspector' : 'Open Weight & Quantity Inspector'}
                          >
                            {isSelected ? (
                              <ChevronUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Middle: AI Visual Uncertainty or Confidence Notes */}
                      {item.uncertaintyReasons && item.uncertaintyReasons.length > 0 && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-forest-card/50 p-2 rounded-xl border border-slate-200/60 dark:border-forest-border/40 flex items-start gap-1.5">
                          <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>
                            <strong>Visual note:</strong> {item.uncertaintyReasons.join('; ')}
                          </span>
                        </div>
                      )}

                      {/* Bottom Info Bar: Weight Equivalent & Real-Time Macro Pills */}
                      <div className="pt-2 border-t border-slate-200/60 dark:border-forest-border/60 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            Total: <span className="text-emerald-600 dark:text-emerald-400">{item.grams}g</span>
                          </span>
                          <span className="text-[11px] text-slate-400">
                            • {item.preparationState}
                          </span>
                          {item.conversionNote && (
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:inline-block">
                              ({item.conversionNote})
                            </span>
                          )}
                        </div>

                        {/* Live Nutrient Preview Pills */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-[11px] flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            {itemNutrients.calories} kcal
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium text-[11px]">
                            P: {itemNutrients.protein}g
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium text-[11px]">
                            C: {itemNutrients.carbs}g
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-400 font-medium text-[11px]">
                            F: {itemNutrients.fat}g
                          </span>
                        </div>
                      </div>

                      {/* --- HORIZONTAL FULL-WIDTH WEIGHT & QUANTITY INSPECTOR (Rendered under active plate item) --- */}
                      {isSelected && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="mt-4 pt-4 border-t-2 border-emerald-500/40 space-y-4 animate-fadeIn cursor-default"
                        >
                          {/* Inspector Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/60 dark:border-forest-border/60">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                <Scale className="w-3 h-3" />
                                Weight &amp; Quantity Inspector
                              </span>
                              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                Adjusting serving &amp; quantity for {item.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200/70 dark:bg-forest-card text-slate-600 dark:text-slate-300">
                                {item.externalRecordId}
                              </span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {itemServingOptions.length} verified units available
                              </span>
                            </div>
                          </div>

                          {/* 1. Unit Selector (Full-width horizontal row) */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                              Measurement Unit:
                            </label>
                            <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-100/90 dark:bg-forest-root border border-slate-200 dark:border-forest-border">
                              {itemServingOptions.map((opt) => {
                                const isOptSelected = item.selectedUnit === opt.unit;
                                return (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => handleUnitChange(item.id, opt.unit)}
                                    className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all text-center ${
                                      isOptSelected
                                        ? 'bg-white dark:bg-forest-card text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/30'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                  >
                                    {opt.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* 2. Full Horizontal Weight & Quantity Controls */}
                          {item.selectedUnit !== 'g' && item.selectedUnit !== 'kg' ? (
                            /* Countable / Serving Unit 3-Column Horizontal Grid */
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-100/60 dark:bg-forest-root border border-slate-200/80 dark:border-forest-border/80">
                              {/* Col 1: Item Count */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    Item Count:
                                  </label>
                                  <span className="text-[11px] text-slate-400 font-medium">
                                    Natural count
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-white dark:bg-forest-card p-1 rounded-xl border border-slate-200 dark:border-forest-border w-fit">
                                  <button
                                    type="button"
                                    onClick={() => adjustCountDelta(item.id, -1)}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-forest-cardHover text-slate-700 dark:text-slate-300"
                                    title="Decrease count"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    step="1"
                                    value={item.selectedQuantity}
                                    onChange={(e) =>
                                      updateCountQuantity(item.id, parseFloat(e.target.value) || 1)
                                    }
                                    className="w-14 text-center font-extrabold text-sm text-slate-900 dark:text-white bg-transparent focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => adjustCountDelta(item.id, 1)}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-forest-cardHover text-slate-700 dark:text-slate-300"
                                    title="Increase count"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-1 pt-1 flex-wrap">
                                  <span className="text-[10px] text-slate-400 font-medium">Quick:</span>
                                  {[1, 2, 3, 4, 6].map((cnt) => (
                                    <button
                                      key={cnt}
                                      type="button"
                                      onClick={() => updateCountQuantity(item.id, cnt)}
                                      className={`px-2 py-0.5 text-xs rounded-lg font-bold border transition-colors ${
                                        item.selectedQuantity === cnt
                                          ? 'bg-emerald-500 text-white border-emerald-500'
                                          : 'bg-white dark:bg-forest-card border-slate-200 dark:border-forest-border text-slate-700 dark:text-slate-300 hover:border-emerald-500'
                                      }`}
                                    >
                                      {cnt}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Col 2: Editable Unit Weight */}
                              <div className="space-y-2 md:border-l md:border-slate-200/80 md:dark:border-forest-border/80 md:pl-4">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                    <Scale className="w-3 h-3 text-emerald-500" />
                                    Weight / {itemServingOptions.find((o) => o.unit === item.selectedUnit)?.name || item.selectedUnit}:
                                  </label>
                                  {itemAiUnitWeight !== null && (
                                    <button
                                      type="button"
                                      onClick={() => handleResetUnitWeightToAI(item.id)}
                                      className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 font-semibold"
                                      title="Restore AI vision detected weight"
                                    >
                                      <Sparkles className="w-3 h-3" />
                                      AI ({itemAiUnitWeight}g)
                                    </button>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1 bg-white dark:bg-forest-card p-1 rounded-xl border border-slate-200 dark:border-forest-border w-fit">
                                    <button
                                      type="button"
                                      onClick={() => adjustUnitWeightDelta(item.id, -5)}
                                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-forest-cardHover text-slate-700 dark:text-slate-300"
                                      title="Decrease unit weight by 5g"
                                    >
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <input
                                      type="number"
                                      min="1"
                                      max="2000"
                                      step="1"
                                      value={itemCurrentUnitWeight}
                                      onChange={(e) =>
                                        handleUnitWeightChange(item.id, parseFloat(e.target.value) || 1)
                                      }
                                      className="w-16 text-center font-extrabold text-sm text-slate-900 dark:text-white bg-transparent focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => adjustUnitWeightDelta(item.id, 5)}
                                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-forest-cardHover text-slate-700 dark:text-slate-300"
                                      title="Increase unit weight by 5g"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <span className="text-xs text-slate-500 font-medium">
                                    g / {item.selectedUnit}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 pt-1 flex-wrap">
                                  <span className="text-[10px] text-slate-400 font-medium">Adjust:</span>
                                  {[-10, -5, +5, +10].map((delta) => (
                                    <button
                                      key={delta}
                                      type="button"
                                      onClick={() => adjustUnitWeightDelta(item.id, delta)}
                                      className="px-2 py-0.5 text-[10px] rounded-lg bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border text-slate-600 dark:text-slate-300 hover:border-emerald-500 font-semibold"
                                    >
                                      {delta > 0 ? `+${delta}g` : `${delta}g`}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Col 3: Total Weight Direct Sync */}
                              <div className="space-y-2 md:border-l md:border-slate-200/80 md:dark:border-forest-border/80 md:pl-4">
                                <div className="flex items-center justify-between text-xs">
                                  <label className="font-bold text-slate-800 dark:text-slate-200">
                                    Total Edible Weight:
                                  </label>
                                  <span className="text-[11px] text-slate-400">
                                    {item.selectedQuantity} × {itemCurrentUnitWeight}g
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min="1"
                                    max="5000"
                                    value={item.grams}
                                    onChange={(e) =>
                                      updateGramsDirect(item.id, parseFloat(e.target.value) || 1)
                                    }
                                    className="w-24 px-3 py-1.5 text-right font-extrabold text-sm text-emerald-600 dark:text-emerald-400 bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border rounded-xl"
                                  />
                                  <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">g</span>
                                </div>
                                <div className="flex items-center gap-1 pt-1 flex-wrap">
                                  <span className="text-[10px] text-slate-400 font-medium">Total:</span>
                                  {[-50, -25, +25, +50].map((delta) => (
                                    <button
                                      key={delta}
                                      type="button"
                                      onClick={() => adjustGramsDelta(item.id, delta)}
                                      className="px-2 py-0.5 text-[10px] rounded-lg bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border text-slate-600 dark:text-slate-300 hover:border-emerald-500 font-semibold"
                                    >
                                      {delta > 0 ? `+${delta}g` : `${delta}g`}
                                    </button>
                                  ))}
                                </div>
                                {item.conversionNote && (
                                  <p className="text-[10px] text-slate-400 leading-tight pt-1">
                                    ℹ️ {item.conversionNote}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            /* Grams (g) 3-Column Horizontal Grid */
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-100/60 dark:bg-forest-root border border-slate-200/80 dark:border-forest-border/80">
                              {/* Col 1: Direct Gram Stepper */}
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                  <Calculator className="w-3.5 h-3.5 text-emerald-500" />
                                  Food Weight in Grams:
                                </label>
                                <div className="flex items-center gap-1.5 bg-white dark:bg-forest-card p-1 rounded-xl border border-slate-200 dark:border-forest-border w-fit">
                                  <button
                                    type="button"
                                    onClick={() => adjustGramsDelta(item.id, -25)}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-forest-cardHover text-slate-700 dark:text-slate-300"
                                    title="Decrease 25g"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <input
                                    type="number"
                                    min="1"
                                    max="2500"
                                    step="5"
                                    value={item.grams}
                                    onChange={(e) =>
                                      updateGramsDirect(item.id, parseFloat(e.target.value) || 0)
                                    }
                                    className="w-16 text-center font-extrabold text-sm text-slate-900 dark:text-white bg-transparent focus:outline-none"
                                  />
                                  <span className="text-xs font-bold text-slate-400 pr-1">g</span>
                                  <button
                                    type="button"
                                    onClick={() => adjustGramsDelta(item.id, 25)}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-forest-cardHover text-slate-700 dark:text-slate-300"
                                    title="Increase 25g"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-1 pt-1 flex-wrap">
                                  <span className="text-[10px] text-slate-400 font-medium">Quick:</span>
                                  {[-50, -25, +25, +50].map((delta) => (
                                    <button
                                      key={delta}
                                      type="button"
                                      onClick={() => adjustGramsDelta(item.id, delta)}
                                      className="px-2 py-0.5 text-[10px] rounded-lg bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border text-slate-600 dark:text-slate-300 hover:border-emerald-500 font-semibold"
                                    >
                                      {delta > 0 ? `+${delta}g` : `${delta}g`}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Col 2: Standard Household Portions */}
                              <div className="space-y-2 md:border-l md:border-slate-200/80 md:dark:border-forest-border/80 md:pl-4">
                                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                  Standard Portions:
                                </label>
                                <div className="grid grid-cols-3 gap-1.5">
                                  {[
                                    { label: '½ Cup', grams: 75 },
                                    { label: '1 Cup', grams: 150 },
                                    { label: '1 Plate', grams: 200 },
                                  ].map((p) => (
                                    <button
                                      key={p.label}
                                      type="button"
                                      onClick={() => updateGramsDirect(item.id, p.grams)}
                                      className={`py-1.5 px-2 text-[11px] font-bold rounded-xl border transition-colors text-center ${
                                        item.grams === p.grams
                                          ? 'bg-emerald-500 text-white border-emerald-500'
                                          : 'bg-white dark:bg-forest-card border-slate-200 dark:border-forest-border text-slate-600 dark:text-slate-300 hover:border-emerald-500'
                                      }`}
                                    >
                                      {p.label} ({p.grams}g)
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Col 3: AI Guess & Reset */}
                              <div className="space-y-2 md:border-l md:border-slate-200/80 md:dark:border-forest-border/80 md:pl-4 flex flex-col justify-between">
                                <div>
                                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    AI Vision Estimation:
                                  </label>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    AI initial detection: <strong className="text-emerald-600 dark:text-emerald-400">{item.aiEstimatedGrams}g</strong>
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => resetToAiWeight(item.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors w-fit"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  Reset to AI Weight ({item.aiEstimatedGrams}g)
                                </button>
                              </div>
                            </div>
                          )}

                          {/* 3. Preparation Method & Live Macro Cards (Full Horizontal Row) */}
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center pt-2 border-t border-slate-200/60 dark:border-forest-border/60">
                            {/* Prep Method (lg:col-span-4) */}
                            <div className="lg:col-span-4 space-y-1.5">
                              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                Preparation Method:
                              </label>
                              <select
                                value={item.preparationState}
                                onChange={(e) => updatePrepState(item.id, e.target.value as PreparationState)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-card text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              >
                                <option value="boiled">Boiled (সিদ্ধ)</option>
                                <option value="fried">Fried (ভাজি / ভাজা - with cooking oil)</option>
                                <option value="curried">Curried / Gravy (ঝোল / ভুনা)</option>
                                <option value="steamed">Steamed (ভাপে সিদ্ধ)</option>
                                <option value="roasted">Roasted / Grilled (পোড়া)</option>
                                <option value="raw">Raw / Fresh (কাঁচা)</option>
                                <option value="commercial">Commercial / Packaged (প্রস্তুতকৃত)</option>
                              </select>
                            </div>

                            {/* Macro Preview (lg:col-span-8) */}
                            <div className="lg:col-span-8 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-extrabold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                                  <Flame className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                  Nutrition Preview ({item.grams}g)
                                </span>
                                <span className="font-black text-sm text-emerald-700 dark:text-emerald-300">
                                  {itemNutrients.calories} kcal
                                </span>
                              </div>
                              <div className="grid grid-cols-5 gap-2 text-center">
                                <div className="p-1.5 rounded-lg bg-white dark:bg-forest-card">
                                  <div className="text-[9px] text-slate-400 font-bold uppercase">Protein</div>
                                  <div className="text-xs font-extrabold text-blue-600 dark:text-blue-400">{itemNutrients.protein}g</div>
                                </div>
                                <div className="p-1.5 rounded-lg bg-white dark:bg-forest-card">
                                  <div className="text-[9px] text-slate-400 font-bold uppercase">Carbs</div>
                                  <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">{itemNutrients.carbs}g</div>
                                </div>
                                <div className="p-1.5 rounded-lg bg-white dark:bg-forest-card">
                                  <div className="text-[9px] text-slate-400 font-bold uppercase">Fat</div>
                                  <div className="text-xs font-extrabold text-rose-600 dark:text-rose-400">{itemNutrients.fat}g</div>
                                </div>
                                <div className="p-1.5 rounded-lg bg-white dark:bg-forest-card">
                                  <div className="text-[9px] text-slate-400 font-bold uppercase">Fibre</div>
                                  <div className="text-xs font-extrabold text-amber-600 dark:text-amber-400">{itemNutrients.fibre}g</div>
                                </div>
                                <div className="p-1.5 rounded-lg bg-white dark:bg-forest-card">
                                  <div className="text-[9px] text-slate-400 font-bold uppercase">Bazar Cost</div>
                                  <div className="text-xs font-extrabold text-slate-700 dark:text-slate-200">৳{itemNutrients.cost}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        {/* Full-Width Grand Meal Total Summary & Confirmation Action */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                Plate Grand Total ({items.length} confirmed food items)
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-white">
                  {mealTotals.calories} <span className="text-sm font-normal text-slate-400">kcal</span>
                </span>
                <span className="text-xs text-slate-300">
                  Est. Bazar Cost: <strong className="text-white">৳{mealTotals.cost}</strong>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
              <div className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700/80">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Protein</div>
                <div className="text-sm font-extrabold text-blue-400">{mealTotals.protein}g</div>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700/80">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Carbs</div>
                <div className="text-sm font-extrabold text-emerald-400">{mealTotals.carbs}g</div>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700/80">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Fat</div>
                <div className="text-sm font-extrabold text-rose-400">{mealTotals.fat}g</div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleConfirm}
            variant="primary"
            size="lg"
            disabled={isSaving || items.length === 0}
            loading={isSaving}
            className="w-full shadow-lg shadow-emerald-600/30 font-extrabold text-sm py-3"
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
          >
            {t('confirm.calculate_btn')}
          </Button>
        </div>
      </div>

      {/* Verified Food Search & Selection Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scaleUp">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-forest-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-emerald-500" />
                  {activeItemToSwap ? 'Select Replacement Food' : 'Add Food from FAO Catalog'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Searches verified Bangladeshi foods from FAO FCTB (2013) & USDA FoodData Central.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 bg-slate-50 dark:bg-forest-root border-b border-slate-100 dark:border-forest-border">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type in English or Bangla (e.g. Rui, Dal, Dim, শাক, ভাত, কলা)..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-card text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Search Results List */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-100 dark:divide-forest-border/40">
              {searchResults.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No verified foods match &ldquo;{searchQuery}&rdquo;. Try another term.
                </div>
              ) : (
                searchResults.map((food) => (
                  <button
                    key={food.food_id}
                    type="button"
                    onClick={() => handleSelectFood(food)}
                    className="w-full text-left pt-2.5 pb-2.5 px-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-forest-cardHover transition-colors flex items-center justify-between group"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                          {food.local_name}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-bengali">
                          {food.local_name_bn}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="capitalize">{food.category.replace(/_/g, ' ')}</span>
                        <span>•</span>
                        <span>Default: {food.preparation_state}</span>
                        <span>•</span>
                        <span>Std serving: {food.standard_serving_grams}g</span>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      Select →
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 dark:bg-forest-root border-t border-slate-100 dark:border-forest-border flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
