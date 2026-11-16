import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { auditMealForUserRestrictions } from '../../services/allergyService';
import {
  type CandidateItem,
  type AnalyzeMealResponse,
  type PreparationState,
  type FoodSearchResultItem,
} from '../../contracts';
import {
  getDraftAnalysis,
  saveDraftAnalysis,
} from '../../services/mealAnalysisService';
import {
  searchFoods,
  getFoodById,
  FOOD_CATALOG,
  registerDynamicFood,
  resolveFoodAlias,
} from '../../lib/foodDatabase';
import { searchUSDAFoodsDirect } from '../../services/usdaService';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { saveLocalConfirmedMeal, formatMealTime, calculateItemCost } from '../../services/dashboardService';

interface ConfirmedEditableItem {
  id: string;
  foodId: string;
  externalRecordId: string;
  name: string;
  nameBn: string;
  category: string;
  grams: number;
  preparationState: PreparationState;
  portionSource: 'user_entered' | 'ai_estimated_unconfirmed';
  uncertaintyReasons: string[];
  questions?: string[];
  confidence?: number;
}

export const ConfirmPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, foodRestrictions } = useAuth();

  // 1. Initial State from router or draft storage
  const [analysisData, setAnalysisData] = useState<AnalyzeMealResponse | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('/images/demo-plate.png');
  const [items, setItems] = useState<ConfirmedEditableItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search Modal state (for adding or swapping foods)
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodSearchResultItem[]>([]);
  const [activeItemToSwap, setActiveItemToSwap] = useState<string | null>(null);

  // Allergy and Intolerance Audit
  const allergyAudit = React.useMemo(() => {
    const userAllergies = [
      ...(profile?.declared_allergens || []),
      ...foodRestrictions.filter((r) => r.restriction_type === 'allergy').map((r) => r.restriction_value),
    ];
    const userIntolerances = [
      ...foodRestrictions.filter((r) => r.restriction_type === 'intolerance').map((r) => r.restriction_value),
    ];
    return auditMealForUserRestrictions(
      items.map((it) => ({ name: it.name, nameBn: it.nameBn })),
      userAllergies,
      userIntolerances
    );
  }, [items, profile?.declared_allergens, foodRestrictions]);

  useEffect(() => {
    // Attempt to load from location.state
    const routerAnalysis = location.state?.analysis as AnalyzeMealResponse | undefined;
    const routerPreview = location.state?.previewUrl as string | undefined;

    const data = routerAnalysis || getDraftAnalysis();

    if (routerPreview) {
      setPreviewImage(routerPreview);
    }

    if (data && data.candidates && data.candidates.length > 0) {
      setAnalysisData(data);
      // Map candidate items to editable items
      const mappedItems: ConfirmedEditableItem[] = data.candidates.map((cand, idx) => {
        const dbFood = cand.matched_food_id
          ? getFoodById(cand.matched_food_id)
          : (resolveFoodAlias(cand.label) || (cand.label_bn ? resolveFoodAlias(cand.label_bn) : null));

        const foodName = cand.label || dbFood?.name_en || 'Food Item';
        const foodNameBn = cand.label_bn || dbFood?.name_bn || '';

        return {
          id: cand.id || `item-${Date.now()}-${idx}`,
          foodId: dbFood?.id || cand.matched_food_id || `custom-${Date.now()}-${idx}`,
          externalRecordId: dbFood?.external_record_id || 'USDA-FDC-CUSTOM',
          name: foodName,
          nameBn: foodNameBn,
          category: dbFood?.category || 'mixed_dishes',
          grams: cand.estimated_grams || dbFood?.standard_serving_grams || 150,
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
    } else {
      // Empty state: never inject prototype fallback fixtures
      setItems([]);
    }
  }, [location.state]);

  // Synchronize search query across local catalog and live USDA FDC API
  useEffect(() => {
    let isCancelled = false;

    if (isSearchOpen) {
      const localResults = searchFoods(searchQuery, { limit: 10 });
      setSearchResults(localResults);

      // If user typed 2+ chars, query live USDA FoodData Central in real-time
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

  // Portion & Gram Adjustments
  const updateGrams = (id: string, val: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              grams: Math.max(10, Math.min(1500, Math.round(val))),
              portionSource: 'user_entered',
            }
          : item
      )
    );
  };

  const adjustGramsDelta = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next = Math.max(10, item.grams + delta);
          return { ...item, grams: next, portionSource: 'user_entered' };
        }
        return item;
      })
    );
  };

  const updatePrepState = (id: string, prep: PreparationState) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, preparationState: prep } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Open search to swap a food
  const handleOpenSwap = (itemId: string) => {
    setActiveItemToSwap(itemId);
    setSearchQuery('');
    setIsSearchOpen(true);
  };

  // Open search to add a new food
  const handleOpenAdd = () => {
    setActiveItemToSwap(null);
    setSearchQuery('');
    setIsSearchOpen(true);
  };

  // Select food from verified search modal
  const handleSelectFood = (food: FoodSearchResultItem) => {
    const rawFood = getFoodById(food.food_id);
    const externalRecordId = rawFood?.external_record_id || 'FCTB-01-001';

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
                preparationState: food.preparation_state as PreparationState,
                portionSource: 'user_entered',
                uncertaintyReasons: [],
              }
            : it
        )
      );
    } else {
      // Adding new item
      const newItem: ConfirmedEditableItem = {
        id: `item-${Date.now()}`,
        foodId: food.food_id,
        externalRecordId,
        name: food.local_name,
        nameBn: food.local_name_bn,
        category: food.category,
        grams: food.standard_serving_grams || 100,
        preparationState: food.preparation_state as PreparationState,
        portionSource: 'user_entered',
        uncertaintyReasons: ['Manually added by user from verified FAO catalog.'],
      };
      setItems((prev) => [...prev, newItem]);
    }

    setIsSearchOpen(false);
    setActiveItemToSwap(null);
  };

  // Explicit confirmation & server submission
  const handleConfirm = async () => {
    if (items.length === 0) {
      setErrorMessage('Please include at least one food item on your plate.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      // 1. If user is authenticated & Supabase configured, create meal_log & meal_items record
      let savedMealLogId: string | null = null;
      let authenticatedUserId: string | null = null;

      if (isSupabaseConfigured) {
        try {
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user) {
            authenticatedUserId = authData.user.id;
            const { data: logData, error: logErr } = await supabase
              .from('meal_logs')
              .insert({
                user_id: authData.user.id,
                input_mode: analysisData?.input_mode || 'photo',
                status: 'confirmed',
                consent_at: new Date().toISOString(),
              })
              .select('id')
              .single();

            if (!logErr && logData) {
              savedMealLogId = logData.id;

              // Validate UUID format for foreign key to foods(id)
              const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
              const fallbackFoodUuid = '33333333-3333-3333-3333-333333333301'; // Cooked White Rice / general staple fallback

              // Insert meal_items
              const rows = items.map((it, idx) => ({
                meal_log_id: savedMealLogId,
                food_id: uuidRegex.test(it.foodId) ? it.foodId : fallbackFoodUuid,
                confirmed_grams: it.grams,
                preparation_state: it.preparationState,
                portion_source: 'user_entered',
                confidence_notes: it.uncertaintyReasons.join('; '),
                display_order: idx + 1,
              }));

              await supabase.from('meal_items').insert(rows);
            }
          }
        } catch (dbErr) {
          console.warn('Supabase persistence bypassed (demo mode):', dbErr);
        }
      }

      // 2. Build local confirmed meal record for instant dashboard sync
      const confirmedMealItems = items.map((it) => {
        const food = getFoodById(it.foodId) || getFoodById(it.id);
        const grams = Number(it.grams) || 100;
        const mult = grams / 100.0;
        const cal = Math.round((food?.energy_kcal ?? 130) * mult);
        const pro = Number(((food?.protein_g ?? 2.7) * mult).toFixed(1));
        const carb = Number(((food?.carbohydrate_g ?? 28.2) * mult).toFixed(1));
        const fat = Number(((food?.fat_g ?? 0.3) * mult).toFixed(1));
        const cost = calculateItemCost(it.category || food?.category, grams);

        return {
          foodId: it.foodId,
          name: it.name || food?.name_en || 'Food Item',
          nameBn: it.nameBn || food?.name_bn || '',
          category: it.category || food?.category || 'mixed_dishes',
          grams,
          preparationState: it.preparationState || 'cooked',
          calories: cal,
          protein: pro,
          carbs: carb,
          fat,
          cost,
        };
      });

      const totalCal = confirmedMealItems.reduce((acc, x) => acc + x.calories, 0);
      const totalPro = Number(confirmedMealItems.reduce((acc, x) => acc + x.protein, 0).toFixed(1));
      const totalCarb = Number(confirmedMealItems.reduce((acc, x) => acc + x.carbs, 0).toFixed(1));
      const totalFat = Number(confirmedMealItems.reduce((acc, x) => acc + x.fat, 0).toFixed(1));
      const totalCost = Number(confirmedMealItems.reduce((acc, x) => acc + x.cost, 0).toFixed(2));

      const title = confirmedMealItems.map((x) => x.name).slice(0, 3).join(' + ');
      const titleBn = confirmedMealItems.map((x) => x.nameBn || x.name).slice(0, 3).join(' + ');
      const nowIso = new Date().toISOString();
      const timeInfo = formatMealTime(nowIso);

      const localMealRecord = {
        id: savedMealLogId || `meal_${Date.now()}`,
        title,
        titleBn,
        time: timeInfo.display,
        timestamp: nowIso,
        mealType: timeInfo.mealType,
        calories: totalCal,
        protein: totalPro,
        carbs: totalCarb,
        fat: totalFat,
        bazarCost: totalCost,
        status: 'confirmed' as const,
        items: confirmedMealItems,
      };

      if (authenticatedUserId) {
        saveLocalConfirmedMeal(authenticatedUserId, localMealRecord);
      }

      // 2. Format confirmed items for Report Page & Phase 4 calculation
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
      }));

      // Navigate to report
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
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
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
          {t('confirm.subtitle')}
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

          {/* AI Uncertainty Review Questions */}
          {analysisData?.review_questions && analysisData.review_questions.length > 0 && (
            <div className="pt-1.5">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" />
                  AI Clarification Questions:
                </p>
                <ul className="list-disc list-inside text-[11px] text-amber-800 dark:text-amber-300 space-y-0.5">
                  {analysisData.review_questions.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Allergy Warning Alert Banner */}
      {allergyAudit.hasAllergyConflict && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500/60 text-rose-800 dark:text-rose-200 space-y-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <h4 className="font-extrabold text-sm text-rose-900 dark:text-rose-100">
              Critical Allergen Conflict Detected
            </h4>
          </div>
          <ul className="list-disc list-inside text-xs space-y-1 pl-1">
            {allergyAudit.allergyWarnings.map((w, i) => (
              <li key={i} className="font-semibold">
                {w.message}
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-rose-700 dark:text-rose-300 pt-1 border-t border-rose-200 dark:border-rose-900/60">
            <strong>Important Safety Notice:</strong> {allergyAudit.safetyDisclaimer}
          </p>
        </div>
      )}

      {/* Intolerance Note Banner */}
      {allergyAudit.hasIntoleranceConflict && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/40 text-amber-800 dark:text-amber-200 space-y-1.5 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <h4 className="font-bold text-xs text-amber-900 dark:text-amber-100">
              Personal Intolerance Notes
            </h4>
          </div>
          <ul className="list-disc list-inside text-[11px] space-y-0.5 pl-1">
            {allergyAudit.intoleranceNotes.map((n, i) => (
              <li key={i}>{n.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Confirmation Items List */}
      <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-forest-border/60">
          <div className="space-y-0.5">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-500" />
              Plate Food Items ({items.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tap any item to swap with another verified Bangladeshi food, or adjust grams directly.
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
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/70 space-y-3 transition-all hover:border-emerald-500/40"
              >
                {/* Top Row: Food Name & Swap Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-start sm:items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                          {item.name}
                        </span>
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 font-bengali">
                          ({item.nameBn})
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/70 dark:bg-forest-card text-slate-600 dark:text-slate-300">
                          {item.externalRecordId}
                        </span>
                        {allergyAudit.allergyWarnings.some((w) => w.foodName === item.name) && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold flex items-center gap-1 border border-rose-500/30">
                            <AlertOctagon className="w-3 h-3 text-rose-500" /> Declared Allergen
                          </span>
                        )}
                        {allergyAudit.intoleranceNotes.some((n) => n.foodName === item.name) && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold flex items-center gap-1 border border-amber-500/30">
                            <AlertCircle className="w-3 h-3 text-amber-500" /> Intolerance Risk
                          </span>
                        )}
                        {item.portionSource === 'ai_estimated_unconfirmed' ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold">
                            AI Proposed
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> User Confirmed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                        Category: {item.category.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Swap Food & Remove */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleOpenSwap(item.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border text-slate-700 dark:text-slate-300 hover:text-emerald-600 hover:border-emerald-500 transition-colors"
                      title="Swap this food with another from the database"
                    >
                      <Edit2 className="w-3 h-3" />
                      Change Food
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* AI Uncertainty Note */}
                {item.uncertaintyReasons && item.uncertaintyReasons.length > 0 && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-forest-card/40 p-2 rounded-xl border border-slate-200/60 dark:border-forest-border/40 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Visual note:</strong> {item.uncertaintyReasons.join('; ')}
                    </span>
                  </div>
                )}

                {/* Bottom Row: Gram Weight + Quick Adjusters + Prep State */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-forest-border/60 flex flex-wrap items-center justify-between gap-4">
                  {/* Preparation Selector */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Preparation:
                    </label>
                    <select
                      value={item.preparationState}
                      onChange={(e) => updatePrepState(item.id, e.target.value as PreparationState)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-card text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="boiled">Boiled (সিদ্ধ)</option>
                      <option value="fried">Fried (ভাজি / ভাজা)</option>
                      <option value="curried">Curried / Gravy (ঝোল / ভুনা)</option>
                      <option value="steamed">Steamed (ভাপে সিদ্ধ)</option>
                      <option value="roasted">Roasted / Grilled (পোড়া)</option>
                      <option value="raw">Raw / Fresh (কাঁচা)</option>
                    </select>
                  </div>

                  {/* Portion Weight with Quick Buttons */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => adjustGramsDelta(item.id, -25)}
                        className="px-2 py-1 rounded-lg bg-slate-200/80 dark:bg-forest-card text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-forest-cardHover"
                        title="Decrease by 25g"
                      >
                        -25g
                      </button>
                      <div className="relative">
                        <input
                          type="number"
                          min="10"
                          max="1500"
                          step="5"
                          value={item.grams}
                          onChange={(e) => updateGrams(item.id, parseFloat(e.target.value) || 0)}
                          className="w-20 px-2.5 py-1 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-card text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-right pr-6"
                        />
                        <span className="absolute right-2 top-1.5 text-[10px] text-slate-400 font-semibold pointer-events-none">
                          g
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => adjustGramsDelta(item.id, 25)}
                        className="px-2 py-1 rounded-lg bg-slate-200/80 dark:bg-forest-card text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-forest-cardHover"
                        title="Increase by 25g"
                      >
                        +25g
                      </button>
                    </div>

                    {/* Standard Serving Shortcuts */}
                    <div className="hidden sm:flex items-center gap-1 pl-1">
                      <button
                        type="button"
                        onClick={() => updateGrams(item.id, 75)}
                        className="px-2 py-1 text-[10px] rounded-lg bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border text-slate-600 dark:text-slate-300 hover:border-emerald-500"
                      >
                        ½ Cup (75g)
                      </button>
                      <button
                        type="button"
                        onClick={() => updateGrams(item.id, 150)}
                        className="px-2 py-1 text-[10px] rounded-lg bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border text-slate-600 dark:text-slate-300 hover:border-emerald-500"
                      >
                        1 Cup (150g)
                      </button>
                      <button
                        type="button"
                        onClick={() => updateGrams(item.id, 200)}
                        className="px-2 py-1 text-[10px] rounded-lg bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border text-slate-600 dark:text-slate-300 hover:border-emerald-500"
                      >
                        1 Plate (200g)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Calculation Guard Notice (FR-04 Non-Negotiable Contract) */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            <strong>Phase 3 Contract:</strong> Gemini Vision proposes detected candidates with uncertainty, but never asserts authoritative grams or calories. Authoritative calculations run only upon your confirmation in Phase 4.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <Button
            onClick={handleConfirm}
            variant="primary"
            size="lg"
            disabled={isSaving || items.length === 0}
            loading={isSaving}
            className="w-full sm:w-auto shadow-lg shadow-emerald-600/20"
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
                  Searches verified Bangladeshi foods from FAO FCTB (2013).
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
                  placeholder="Type in English or Bangla (e.g. Rui, Dal, Dim, শাক, ভাত)..."
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
