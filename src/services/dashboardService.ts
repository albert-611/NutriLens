import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { Profile, PreparationState } from '../contracts';
import { getFoodById, resolveFoodAlias } from '../lib/foodDatabase';
import { saveMealIntake } from './mealIntakeDb';
import {
  WFP_2026_BENCHMARK_PRICES_PER_100G,
  WFP_2026_COMMODITY_PRICES_PER_100G,
} from '../lib/wfpMarketPrices';

export interface ConfirmedFoodItemSummary {
  foodId: string;
  name: string;
  nameBn: string;
  category: string;
  grams: number;
  preparationState: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  cost: number;
}

export interface ConfirmedMealRecord {
  id: string;
  title: string;
  titleBn: string;
  time: string;
  timestamp: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  bazarCost: number;
  status: 'confirmed';
  items: ConfirmedFoodItemSummary[];
}

export interface DashboardMetrics {
  // Today's consumption (sum of meals confirmed today)
  todayCalories: number;
  todayProtein: number;
  todayCarbs: number;
  todayFat: number;
  todayCost: number;

  // Personalized Targets
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  dailyBudget: number;

  // Percentage progress
  caloriesPercent: number;
  proteinPercent: number;
  carbsPercent: number;
  budgetPercent: number;

  // Dynamic context descriptions
  proteinSourcesText: string;
  carbsSourcesText: string;
  budgetStatusText: string;

  // Meals list
  recentMeals: ConfirmedMealRecord[];
  hasMealsToday: boolean;
  totalMealsCount: number;
}

/**
 * Calculates item market cost based on official 2026 World Food Programme (WFP) Bangladesh food prices.
 */
export function calculateItemCost(
  category?: string,
  grams: number = 100,
  foodName?: string
): number {
  const multiplier = grams / 100.0;
  let basePer100g = 10.0;

  // 1. Check exact commodity match from 2026 WFP dataset if foodName is available
  if (foodName) {
    const fnLower = foodName.toLowerCase();
    for (const [comm, rate] of Object.entries(WFP_2026_COMMODITY_PRICES_PER_100G)) {
      const commLower = comm.toLowerCase();
      if (fnLower.includes(commLower) || commLower.includes(fnLower)) {
        return Number((rate * multiplier).toFixed(2));
      }
    }
    // Specific frequent keyword heuristics from WFP 2026 data
    if (fnLower.includes('egg') || fnLower.includes('ডিম')) {
      return Number((19.5 * multiplier).toFixed(2)); // ~10.7 BDT per egg
    }
    if (fnLower.includes('rice') || fnLower.includes('ভাত') || fnLower.includes('চাল')) {
      return Number((5.8 * multiplier).toFixed(2)); // ~58 BDT/kg
    }
    if (fnLower.includes('dal') || fnLower.includes('lentil') || fnLower.includes('ডাল')) {
      return Number((10.5 * multiplier).toFixed(2)); // ~105 BDT/kg
    }
    if (fnLower.includes('chicken') || fnLower.includes('মুরগি')) {
      return Number((17.5 * multiplier).toFixed(2)); // ~175 BDT/kg
    }
    if (fnLower.includes('beef') || fnLower.includes('গরু')) {
      return Number((78.0 * multiplier).toFixed(2)); // ~780 BDT/kg
    }
    if (fnLower.includes('potato') || fnLower.includes('আলু')) {
      return Number((3.8 * multiplier).toFixed(2)); // ~38 BDT/kg
    }
  }

  // 2. Fall back to 2026 WFP category average benchmark
  if (category && category in WFP_2026_BENCHMARK_PRICES_PER_100G) {
    basePer100g = WFP_2026_BENCHMARK_PRICES_PER_100G[category];
  } else {
    basePer100g = 12.0;
  }

  return Number((basePer100g * multiplier).toFixed(2));
}

/**
 * Formats a timestamp into human-readable relative/clock time (e.g. "Today, 1:30 PM (Lunch)").
 */
export function formatMealTime(isoString: string): { display: string; mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' } {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) {
      return { display: 'Today', mealType: 'lunch' };
    }

    const hours = d.getHours();
    let mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'snack';
    if (hours >= 5 && hours < 11) mealType = 'breakfast';
    else if (hours >= 11 && hours < 16) mealType = 'lunch';
    else if (hours >= 16 && hours < 18) mealType = 'snack';
    else mealType = 'dinner';

    const typeLabel = mealType.charAt(0).toUpperCase() + mealType.slice(1);

    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

    if (isToday) {
      return { display: `Today, ${timeStr} (${typeLabel})`, mealType };
    } else if (isYesterday) {
      return { display: `Yesterday, ${timeStr} (${typeLabel})`, mealType };
    } else {
      const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      return { display: `${dateStr}, ${timeStr} (${typeLabel})`, mealType };
    }
  } catch (e) {
    return { display: 'Recently', mealType: 'lunch' };
  }
}

/**
 * Calculates personalized daily nutritional targets using Mifflin-St Jeor / FAO guidelines.
 */
export function calculatePersonalizedTargets(profile: Profile | null): {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  dailyBudget: number;
} {
  const rawWeight = profile?.weight_value || 65;
  const rawHeight = profile?.height_value || 170;
  const heightUnit = String(profile?.height_unit || 'cm').toLowerCase();
  const weightUnit = String(profile?.weight_unit || 'kg').toLowerCase();

  // Unit-aware conversions to cm and kg
  const isFeet = heightUnit.includes('ft') || (rawHeight < 10 && rawHeight > 0);
  const height = isFeet ? rawHeight * 30.48 : rawHeight;

  const isLbs = weightUnit.includes('lb');
  const weight = isLbs ? rawWeight * 0.453592 : rawWeight;

  const age = profile?.age || 25;
  const sex = profile?.biological_sex || 'male';
  const activity = profile?.activity_level || 'moderately_active';
  const goal = profile?.general_goal || 'balanced_wellness';

  // Mifflin-St Jeor BMR
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (sex === 'male') {
    bmr += 5;
  } else if (sex === 'female') {
    bmr -= 161;
  } else {
    bmr -= 78;
  }

  // Physical Activity Level (PAL) Multiplier
  let pal = 1.4;
  if (activity === 'sedentary') pal = 1.2;
  else if (activity === 'lightly_active') pal = 1.375;
  else if (activity === 'moderately_active') pal = 1.55;
  else if (activity === 'very_active') pal = 1.725;
  else if (activity === 'extremely_active') pal = 1.9;

  let tdee = Math.round(bmr * pal);

  // Goal adjustment
  if (goal === 'diabetic_friendly_lifestyle') {
    tdee = Math.max(1600, tdee - 200);
  } else if (goal === 'high_protein') {
    tdee = Math.max(1800, tdee);
  }

  // Round to nearest 50 kcal
  const targetCalories = Math.max(1500, Math.round(tdee / 50) * 50);

  // Protein target (1.2g to 1.6g per kg based on goal)
  const proteinMultiplier = goal === 'high_protein' ? 1.6 : 1.1;
  const targetProtein = Math.round(weight * proteinMultiplier);

  // Carbohydrate target (~50% of total calories, 4 kcal/g)
  const carbCalories = targetCalories * (goal === 'diabetic_friendly_lifestyle' ? 0.45 : 0.52);
  const targetCarbs = Math.round(carbCalories / 4);

  // Daily budget
  let dailyBudget = 150;
  if (profile?.budget_amount && profile.budget_amount > 0) {
    if (profile.budget_duration_days && profile.budget_duration_days > 1) {
      dailyBudget = Math.round(profile.budget_amount / profile.budget_duration_days);
    } else {
      dailyBudget = Math.round(profile.budget_amount);
    }
  }

  return {
    targetCalories,
    targetProtein,
    targetCarbs,
    dailyBudget: Math.max(50, dailyBudget),
  };
}

// 100% In-Memory Transient Cache (Zero LocalStorage persistence for user meals)
const inMemoryMealsCache = new Map<string, ConfirmedMealRecord[]>();

/**
 * Detects whether a meal record was generated by the legacy sample test button
 * (e.g. hardcoded Cooked White Rice + Masoor Dal + Dim Bhaji with 525 kcal, 24.7g protein, ৳46.50).
 */
export function isSampleDummyMeal(meal: ConfirmedMealRecord | any): boolean {
  if (!meal) return false;
  const cal = Math.round(Number(meal.calories ?? meal.total_energy_kcal ?? 0));
  const pro = Number(meal.protein ?? meal.total_protein_g ?? 0);
  const cost = Number(meal.bazarCost ?? meal.cost ?? 0);
  const title = String(meal.title || '').toLowerCase();
  const titleBn = String(meal.titleBn || '').toLowerCase();

  // Signature 1: Exact 525 kcal and 24.7g protein (the hardcoded sample plate values)
  if (cal === 525 && Math.abs(pro - 24.7) < 0.6) {
    return true;
  }

  // Signature 2: Title combination of Rice + Dal/Lentil + Egg/Dim with exact 525 kcal or ৳46.50
  const hasRice = title.includes('rice') || titleBn.includes('ভাত');
  const hasDal = title.includes('dal') || title.includes('lentil') || titleBn.includes('ডাল');
  const hasEgg = title.includes('egg') || title.includes('dim') || titleBn.includes('ডিম');
  if (hasRice && hasDal && hasEgg && (cal === 525 || Math.abs(cost - 46.5) < 0.6)) {
    return true;
  }

  // Signature 3: Hardcoded titles
  if (
    title.includes('cooked white rice') && title.includes('masoor dal') &&
    (cal === 525 || Math.abs(pro - 24.7) < 0.6)
  ) {
    return true;
  }

  return false;
}

/**
 * Scrubs any legacy confirmed meals and dummy sample plates from localStorage.
 */
export function cleanAllDummyMealsFromLocalStorage(): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('nutrilens_confirmed_meals_') || key.startsWith('nutrilens_pending_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {}
}

/**
 * Gets in-memory transient confirmed meals for the user.
 */
export function getLocalConfirmedMeals(userId: string): ConfirmedMealRecord[] {
  let list = inMemoryMealsCache.get(userId) || inMemoryMealsCache.get('guest') || [];
  if (list.length === 0 && typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`nutrilens_meal_intake_db_v2_${userId || 'guest'}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed.filter((m) => !isSampleDummyMeal(m));
          inMemoryMealsCache.set(userId, list);
        }
      }
    } catch {}
  }
  return list.filter((m) => !isSampleDummyMeal(m));
}

/**
 * Deletes a confirmed meal log from in-memory cache and Supabase PostgreSQL.
 */
export async function deleteMealLog(userId: string, mealId: string): Promise<ConfirmedMealRecord[]> {
  try {
    // 1. Remove from in-memory cache
    const current = inMemoryMealsCache.get(userId) || [];
    const filtered = current.filter((m) => m.id !== mealId);
    inMemoryMealsCache.set(userId, filtered);

    // Also remove from guest cache if present
    const guestList = inMemoryMealsCache.get('guest');
    if (guestList) {
      inMemoryMealsCache.set('guest', guestList.filter((m) => m.id !== mealId));
    }

    // 2. Remove from Supabase if configured and mealId is a valid UUID
    if (isSupabaseConfigured && mealId && !mealId.startsWith('meal_')) {
      try {
        await supabase.from('meal_logs').delete().eq('id', mealId);
      } catch (err) {
        console.warn('Supabase meal log deletion notice:', err);
      }
    }

    // Notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('nutrilens_meal_confirmed'));
    }

    return filtered;
  } catch (e) {
    console.warn('Failed to delete meal log:', e);
    return getLocalConfirmedMeals(userId);
  }
}

/**
 * Saves a new confirmed meal into in-memory storage (Zero LocalStorage).
 */
export function saveLocalConfirmedMeal(userId: string, meal: ConfirmedMealRecord): void {
  if (isSampleDummyMeal(meal)) return;
  try {
    const existing = inMemoryMealsCache.get(userId) || [];
    const filtered = existing.filter((m) => m.id !== meal.id && !isSampleDummyMeal(m));
    const updated = [meal, ...filtered].slice(0, 50);
    inMemoryMealsCache.set(userId, updated);
    if (userId !== 'guest') {
      inMemoryMealsCache.set('guest', updated);
    }
    // Persist into meal intake database for daily aggregations & chatbot context
    saveMealIntake(userId, meal);
  } catch (e) {
    console.warn('Failed to save in-memory confirmed meal:', e);
  }
}

/**
 * Fetches real confirmed meals from Supabase for the authenticated user
 * and merges with local cache.
 */
export async function fetchUserConfirmedMeals(userId: string): Promise<ConfirmedMealRecord[]> {
  const localList = getLocalConfirmedMeals(userId);

  if (!isSupabaseConfigured || !userId) {
    return localList;
  }

  try {
    const { data: logs, error } = await supabase
      .from('meal_logs')
      .select(`
        id,
        created_at,
        status,
        input_mode,
        meal_reports (
          total_energy_kcal,
          total_protein_g,
          total_carbohydrate_g,
          total_fat_g,
          evidence_sources
        ),
        meal_items (
          id,
          food_id,
          confirmed_grams,
          preparation_state,
          portion_source
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error || !logs) {
      return localList;
    }

    const fetchedRecords: ConfirmedMealRecord[] = [];

    for (const log of logs) {
      const report = Array.isArray(log.meal_reports) ? log.meal_reports[0] : (log as any).meal_reports;
      let itemSummaries: ConfirmedFoodItemSummary[] = [];

      if (report && Array.isArray(report.evidence_sources) && report.evidence_sources.length > 0) {
        // High-fidelity restoration from PostgreSQL meal_reports snapshot
        itemSummaries = report.evidence_sources.map((it: any) => ({
          foodId: it.foodId || it.id || 'food',
          name: it.name || 'Confirmed Food',
          nameBn: it.nameBn || '',
          category: it.category || 'mixed_dishes',
          grams: Number(it.grams) || 100,
          preparationState: it.preparationState || 'cooked',
          calories: Number(it.calories) || 0,
          protein: Number(it.protein) || 0,
          carbs: Number(it.carbs) || 0,
          fat: Number(it.fat) || 0,
          cost: Number(it.cost) || 0,
        }));
      } else {
        const itemsRaw = log.meal_items || [];
        if (itemsRaw.length === 0) continue;

        itemSummaries = itemsRaw.map((it: any) => {
          const dbFood = getFoodById(it.food_id) || resolveFoodAlias(it.food_id);
          const grams = Number(it.confirmed_grams) || 100;
          const mult = grams / 100.0;

          const cal = Math.round((dbFood?.energy_kcal ?? 130) * mult);
          const pro = Number(((dbFood?.protein_g ?? 2.7) * mult).toFixed(1));
          const carb = Number(((dbFood?.carbohydrate_g ?? 28.2) * mult).toFixed(1));
          const fat = Number(((dbFood?.fat_g ?? 0.3) * mult).toFixed(1));
          const cost = calculateItemCost(dbFood?.category, grams, dbFood?.name_en);

          return {
            foodId: it.food_id,
            name: dbFood?.name_en || 'Confirmed Food',
            nameBn: dbFood?.name_bn || '',
            category: dbFood?.category || 'mixed_dishes',
            grams,
            preparationState: it.preparation_state || 'cooked',
            calories: cal,
            protein: pro,
            carbs: carb,
            fat,
            cost,
          };
        });
      }

      if (itemSummaries.length === 0) {
        if (report && report.total_energy_kcal) {
          itemSummaries = [{
            foodId: 'food',
            name: 'Confirmed Meal',
            nameBn: 'নিশ্চিত খাবার',
            category: 'mixed_dishes',
            grams: 200,
            preparationState: 'cooked',
            calories: Number(report.total_energy_kcal) || 0,
            protein: Number(report.total_protein_g) || 0,
            carbs: Number(report.total_carbohydrate_g) || 0,
            fat: Number(report.total_fat_g) || 0,
            cost: 45,
          }];
        } else {
          continue;
        }
      }

      const totalCal = report?.total_energy_kcal ? Number(report.total_energy_kcal) : itemSummaries.reduce((a, b) => a + b.calories, 0);
      const totalPro = report?.total_protein_g ? Number(report.total_protein_g) : Number(itemSummaries.reduce((a, b) => a + b.protein, 0).toFixed(1));
      const totalCarb = report?.total_carbohydrate_g ? Number(report.total_carbohydrate_g) : Number(itemSummaries.reduce((a, b) => a + b.carbs, 0).toFixed(1));
      const totalFat = report?.total_fat_g ? Number(report.total_fat_g) : Number(itemSummaries.reduce((a, b) => a + b.fat, 0).toFixed(1));
      const totalCost = Number(itemSummaries.reduce((a, b) => a + b.cost, 0).toFixed(2));

      const title = itemSummaries.slice(0, 3).map((x) => x.name).join(' + ');
      const titleBn = itemSummaries.slice(0, 3).map((x) => x.nameBn || x.name).join(' + ');
      const timeInfo = formatMealTime(log.created_at);

      if (isSampleDummyMeal({ calories: totalCal, protein: totalPro, bazarCost: totalCost, title, titleBn })) {
        if (log.id && isSupabaseConfigured) {
          Promise.resolve(supabase.from('meal_logs').delete().eq('id', log.id)).catch(() => {});
        }
        continue;
      }

      fetchedRecords.push({
        id: log.id,
        title,
        titleBn,
        time: timeInfo.display,
        timestamp: log.created_at,
        mealType: timeInfo.mealType,
        calories: totalCal,
        protein: totalPro,
        carbs: totalCarb,
        fat: totalFat,
        bazarCost: totalCost,
        status: 'confirmed',
        items: itemSummaries,
      });
    }

    // Merge authoritative Supabase records with local drafts, deduplicating by ID and title+time signature
    const map = new Map<string, ConfirmedMealRecord>();
    const seenSignatures = new Set<string>();

    for (const m of fetchedRecords) {
      if (isSampleDummyMeal(m)) continue;
      map.set(m.id, m);
      const timeBucket = Math.floor(new Date(m.timestamp).getTime() / 20000); // 20-second proximity
      seenSignatures.add(`${m.title.toLowerCase()}-${Math.round(m.calories)}-${timeBucket}`);
    }

    for (const m of localList) {
      if (isSampleDummyMeal(m)) continue;
      if (map.has(m.id)) continue;
      const timeBucket = Math.floor(new Date(m.timestamp).getTime() / 20000);
      if (seenSignatures.has(`${m.title.toLowerCase()}-${Math.round(m.calories)}-${timeBucket}`)) {
        continue; // Already synchronized to Supabase
      }
      map.set(m.id, m);
    }

    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Update in-memory session cache (zero localStorage)
    inMemoryMealsCache.set(userId, merged);

    return merged;
  } catch (err) {
    console.warn('Error fetching user meal logs from Supabase:', err);
    return localList;
  }
}

/**
 * Computes all live dashboard metrics from real confirmed meal logs.
 */
export async function getDashboardMetrics(userId: string, profile: Profile | null): Promise<DashboardMetrics> {
  cleanAllDummyMealsFromLocalStorage();
  const targets = calculatePersonalizedTargets(profile);
  const allMeals = await fetchUserConfirmedMeals(userId);

  const now = new Date();
  const todayDateStr = now.toDateString();
  const todayDay = now.getDate();
  const todayMonth = now.getMonth();
  const todayYear = now.getFullYear();

  const todayMeals = allMeals.filter((m) => {
    try {
      if (!m || !m.timestamp) return false;
      const d = new Date(m.timestamp);
      if (isNaN(d.getTime())) return false;
      return (
        d.toDateString() === todayDateStr ||
        (d.getDate() === todayDay && d.getMonth() === todayMonth && d.getFullYear() === todayYear)
      );
    } catch {
      return false;
    }
  });

  const hasMealsToday = todayMeals.length > 0;

  // Aggregate totals
  const todayCalories = todayMeals.reduce((acc, m) => acc + m.calories, 0);
  const todayProtein = Number(todayMeals.reduce((acc, m) => acc + m.protein, 0).toFixed(1));
  const todayCarbs = Number(todayMeals.reduce((acc, m) => acc + m.carbs, 0).toFixed(1));
  const todayFat = Number(todayMeals.reduce((acc, m) => acc + m.fat, 0).toFixed(1));
  const todayCost = Number(todayMeals.reduce((acc, m) => acc + m.bazarCost, 0).toFixed(2));

  // Percentages
  const caloriesPercent = targets.targetCalories > 0 ? Math.min(100, Math.round((todayCalories / targets.targetCalories) * 100)) : 0;
  const proteinPercent = targets.targetProtein > 0 ? Math.min(100, Math.round((todayProtein / targets.targetProtein) * 100)) : 0;
  const carbsPercent = targets.targetCarbs > 0 ? Math.min(100, Math.round((todayCarbs / targets.targetCarbs) * 100)) : 0;
  const budgetPercent = targets.dailyBudget > 0 ? Math.min(100, Math.round((todayCost / targets.dailyBudget) * 100)) : 0;

  // Extract protein source names
  const proteinItems: string[] = [];
  todayMeals.forEach((m) => {
    m.items.forEach((it) => {
      if (['fish_and_seafood', 'meat_and_poultry', 'eggs', 'pulses_and_legumes', 'dairy'].includes(it.category)) {
        if (!proteinItems.includes(it.name)) proteinItems.push(it.name);
      }
    });
  });

  const proteinSourcesText = proteinItems.length > 0
    ? proteinItems.slice(0, 2).join(' & ')
    : hasMealsToday ? 'Mixed dietary protein' : 'No protein logged yet today';

  // Extract carb source names
  const carbItems: string[] = [];
  todayMeals.forEach((m) => {
    m.items.forEach((it) => {
      if (['grains_and_cereals', 'vegetables'].includes(it.category)) {
        if (!carbItems.includes(it.name)) carbItems.push(it.name);
      }
    });
  });

  const carbsSourcesText = carbItems.length > 0
    ? carbItems.slice(0, 2).join(' & ')
    : hasMealsToday ? 'Balanced meal carbohydrates' : 'No carbohydrates logged yet today';

  // Budget status string
  let budgetStatusText = '';
  if (todayCost <= targets.dailyBudget) {
    const remaining = Number((targets.dailyBudget - todayCost).toFixed(2));
    budgetStatusText = remaining > 0
      ? `৳ ${remaining.toFixed(2)} remaining of ৳ ${targets.dailyBudget} limit`
      : `Within ৳ ${targets.dailyBudget} daily limit`;
  } else {
    const over = Number((todayCost - targets.dailyBudget).toFixed(2));
    budgetStatusText = `Exceeded daily budget by ৳ ${over.toFixed(2)}`;
  }

  return {
    todayCalories,
    todayProtein,
    todayCarbs,
    todayFat,
    todayCost,
    targetCalories: targets.targetCalories,
    targetProtein: targets.targetProtein,
    targetCarbs: targets.targetCarbs,
    dailyBudget: targets.dailyBudget,
    caloriesPercent,
    proteinPercent,
    carbsPercent,
    budgetPercent,
    proteinSourcesText,
    carbsSourcesText,
    budgetStatusText,
    recentMeals: allMeals.slice(0, 5),
    hasMealsToday,
    totalMealsCount: allMeals.length,
  };
}
