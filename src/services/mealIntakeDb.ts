/**
 * NutriLens Persistent Meal Intake & Nutrient Database Service
 * Provides unified, resilient persistence across Supabase PostgreSQL and
 * browser persistent storage. Supports querying all meals, weekwise, monthwise,
 * and daily stacked nutrient statistics for charts and the AI nutrition chatbot.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { calculateItemCost, formatMealTime, isSampleDummyMeal, type ConfirmedMealRecord } from './dashboardService';

export interface StoredMealItem {
  foodId?: string;
  name: string;
  nameBn?: string;
  category?: string;
  grams: number;
  preparationState?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre?: number;
  cost: number;
}

export interface StoredMealRecord {
  id: string;
  userId: string;
  title: string;
  titleBn?: string;
  date: string; // YYYY-MM-DD
  time: string; // Formatted relative string e.g. "Today, 1:30 PM (Lunch)"
  timestamp: string; // ISO 8601 string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
  bazarCost: number;
  items: StoredMealItem[];
}

export interface DailyNutrientStat {
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Mon", "Tue", "Today"
  dateFormatted: string; // e.g. "Nov 19"
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
  cost: number;
  mealCount: number;
  meals: StoredMealRecord[];
}

const STORAGE_PREFIX = 'nutrilens_meal_intake_db_v2_';

function getStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId || 'guest'}`;
}

/**
 * Reads meals from local persistent storage.
 */
function readLocalDb(userId: string): StoredMealRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) {
      if (userId !== 'guest') {
        const guestRaw = localStorage.getItem(getStorageKey('guest'));
        if (guestRaw) return JSON.parse(guestRaw);
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((m) => !isSampleDummyMeal(m));
  } catch (err) {
    console.warn('Failed to read local meal intake db:', err);
    return [];
  }
}

/**
 * Writes meals to local persistent storage.
 */
function writeLocalDb(userId: string, records: StoredMealRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    const filtered = records.filter((m) => !isSampleDummyMeal(m)).slice(0, 200);
    localStorage.setItem(getStorageKey(userId), JSON.stringify(filtered));
    if (userId !== 'guest') {
      localStorage.setItem(getStorageKey('guest'), JSON.stringify(filtered));
    }
  } catch (err) {
    console.warn('Failed to write local meal intake db:', err);
  }
}

/**
 * Converts a standard ConfirmedMealRecord to a normalized StoredMealRecord.
 */
export function normalizeConfirmedMeal(userId: string, meal: ConfirmedMealRecord): StoredMealRecord {
  const ts = meal.timestamp || new Date().toISOString();
  const d = new Date(ts);
  const dateStr = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

  const items: StoredMealItem[] = (meal.items && meal.items.length > 0)
    ? meal.items.map((it: any) => ({
        foodId: it.foodId || it.id,
        name: it.name || it.foodName || 'Confirmed Food',
        nameBn: it.nameBn || it.foodNameBn,
        category: it.category || 'mixed_dishes',
        grams: Number(it.grams) || 100,
        preparationState: it.preparationState || it.state || 'cooked',
        calories: Number(it.calories) || 0,
        protein: Number(it.protein) || 0,
        carbs: Number(it.carbs) || 0,
        fat: Number(it.fat) || 0,
        fibre: Number(it.fibre) || 0,
        cost: Number(it.cost) || calculateItemCost(it.category, Number(it.grams) || 100, it.name),
      }))
    : meal.title.split('+').map((part, idx) => ({
        foodId: `item_${idx}`,
        name: part.trim(),
        grams: 150,
        preparationState: 'cooked',
        calories: Math.round(Number(meal.calories || 0) / (meal.title.split('+').length || 1)),
        protein: Number(((meal.protein || 0) / (meal.title.split('+').length || 1)).toFixed(1)),
        carbs: Number(((meal.carbs || 0) / (meal.title.split('+').length || 1)).toFixed(1)),
        fat: Number(((meal.fat || 0) / (meal.title.split('+').length || 1)).toFixed(1)),
        fibre: 1.5,
        cost: Number(((meal.bazarCost || 0) / (meal.title.split('+').length || 1)).toFixed(2)),
      }));

  const fibreSum = items.reduce((acc, it) => acc + (it.fibre || 0), 0);

  return {
    id: meal.id,
    userId: userId || 'guest',
    title: meal.title,
    titleBn: meal.titleBn,
    date: dateStr,
    time: meal.time,
    timestamp: ts,
    mealType: meal.mealType || 'lunch',
    calories: Number(meal.calories) || 0,
    protein: Number(meal.protein) || 0,
    carbs: Number(meal.carbs) || 0,
    fat: Number(meal.fat) || 0,
    fibre: Number(fibreSum.toFixed(1)),
    bazarCost: Number(meal.bazarCost) || 0,
    items,
  };
}

/**
 * Saves a meal intake record into persistent DB and dispatches live update event.
 */
export async function saveMealIntake(userId: string, meal: ConfirmedMealRecord): Promise<StoredMealRecord> {
  const normalized = normalizeConfirmedMeal(userId, meal);
  if (isSampleDummyMeal(normalized)) return normalized;

  // 1. Update Persistent Local DB
  const current = readLocalDb(userId);
  const filtered = current.filter((m) => m.id !== normalized.id && !isSampleDummyMeal(m));
  const updated = [normalized, ...filtered];
  writeLocalDb(userId, updated);

  // 2. Dispatch live update event for dashboard and chatbot
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nutrilens_meal_intake_updated', { detail: normalized }));
  }

  return normalized;
}

/**
 * Deletes a meal intake record.
 */
export async function deleteMealIntake(userId: string, mealId: string): Promise<void> {
  const current = readLocalDb(userId);
  const updated = current.filter((m) => m.id !== mealId);
  writeLocalDb(userId, updated);

  // Also delete from Supabase if valid remote ID
  if (isSupabaseConfigured && mealId && !mealId.startsWith('meal_')) {
    try {
      await supabase.from('meal_logs').delete().eq('id', mealId);
    } catch (err) {
      console.warn('Failed to delete meal log from Supabase:', err);
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nutrilens_meal_intake_updated', { detail: { id: mealId, deleted: true } }));
  }
}

/**
 * Gets all stored meal intakes for a user.
 */
export async function getAllMealIntakes(userId: string): Promise<StoredMealRecord[]> {
  const localList = readLocalDb(userId);

  // If Supabase is configured and user is logged in, sync with remote logs
  if (isSupabaseConfigured && userId && userId !== 'guest') {
    try {
      const { data: logs, error } = await supabase
        .from('meal_logs')
        .select(`
          id,
          created_at,
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
            preparation_state
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false })
        .limit(60);

      if (!error && logs && logs.length > 0) {
        const mergedMap = new Map<string, StoredMealRecord>();
        for (const loc of localList) {
          mergedMap.set(loc.id, loc);
        }

        for (const log of logs) {
          if (mergedMap.has(log.id)) continue;
          const report = Array.isArray(log.meal_reports) ? log.meal_reports[0] : (log as any).meal_reports;
          if (!report) continue;

          let itemSummaries: StoredMealItem[] = [];
          if (Array.isArray(report.evidence_sources) && report.evidence_sources.length > 0) {
            itemSummaries = report.evidence_sources.map((it: any) => ({
              foodId: it.foodId || it.id,
              name: it.name || 'Confirmed Food',
              nameBn: it.nameBn,
              category: it.category || 'mixed_dishes',
              grams: Number(it.grams) || 100,
              preparationState: it.preparationState || 'cooked',
              calories: Number(it.calories) || 0,
              protein: Number(it.protein) || 0,
              carbs: Number(it.carbs) || 0,
              fat: Number(it.fat) || 0,
              cost: Number(it.cost) || calculateItemCost(it.category, Number(it.grams) || 100, it.name),
            }));
          }

          const cal = Number(report.total_energy_kcal) || itemSummaries.reduce((a, b) => a + b.calories, 0);
          const pro = Number(report.total_protein_g) || itemSummaries.reduce((a, b) => a + b.protein, 0);
          const carb = Number(report.total_carbohydrate_g) || itemSummaries.reduce((a, b) => a + b.carbs, 0);
          const fat = Number(report.total_fat_g) || itemSummaries.reduce((a, b) => a + b.fat, 0);
          const cost = Number(itemSummaries.reduce((a, b) => a + b.cost, 0).toFixed(2));
          const timeInfo = formatMealTime(log.created_at);

          const title = itemSummaries.length > 0
            ? itemSummaries.slice(0, 3).map((x) => x.name).join(' + ')
            : 'Confirmed Meal';
          const titleBn = itemSummaries.length > 0
            ? itemSummaries.slice(0, 3).map((x) => x.nameBn || x.name).join(' + ')
            : undefined;

          const rec: StoredMealRecord = {
            id: log.id,
            userId,
            title,
            titleBn,
            date: log.created_at.split('T')[0],
            time: timeInfo.display,
            timestamp: log.created_at,
            mealType: timeInfo.mealType,
            calories: Math.round(cal),
            protein: Number(pro.toFixed(1)),
            carbs: Number(carb.toFixed(1)),
            fat: Number(fat.toFixed(1)),
            fibre: Number(itemSummaries.reduce((a, b) => a + (b.fibre || 0), 0).toFixed(1)),
            bazarCost: cost,
            items: itemSummaries,
          };

          if (!isSampleDummyMeal(rec)) {
            mergedMap.set(rec.id, rec);
          }
        }

        const fullList = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        writeLocalDb(userId, fullList);
        return fullList;
      }
    } catch (err) {
      console.warn('Supabase meal sync error:', err);
    }
  }

  return localList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Returns meals grouped by Weekwise (This Week vs Previous Weeks).
 */
export async function getMealsWeekwise(userId: string): Promise<{
  thisWeek: StoredMealRecord[];
  pastWeeks: StoredMealRecord[];
}> {
  const all = await getAllMealIntakes(userId);
  const now = new Date();
  
  // Calculate start of current week (Monday)
  const dayOfWeek = now.getDay(); // 0 is Sunday
  const distanceToMonday = (dayOfWeek + 6) % 7;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - distanceToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const thisWeek: StoredMealRecord[] = [];
  const pastWeeks: StoredMealRecord[] = [];

  for (const m of all) {
    const mealDate = new Date(m.timestamp);
    if (mealDate >= startOfWeek) {
      thisWeek.push(m);
    } else {
      pastWeeks.push(m);
    }
  }

  return { thisWeek, pastWeeks };
}

/**
 * Returns meals grouped by Monthwise (This Month vs Previous Months).
 */
export async function getMealsMonthwise(userId: string): Promise<{
  thisMonth: StoredMealRecord[];
  pastMonths: StoredMealRecord[];
}> {
  const all = await getAllMealIntakes(userId);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const thisMonth: StoredMealRecord[] = [];
  const pastMonths: StoredMealRecord[] = [];

  for (const m of all) {
    const mealDate = new Date(m.timestamp);
    if (mealDate.getFullYear() === currentYear && mealDate.getMonth() === currentMonth) {
      thisMonth.push(m);
    } else {
      pastMonths.push(m);
    }
  }

  return { thisMonth, pastMonths };
}

/**
 * Generates daily stacked nutrient statistics across a specified number of days (default: 7 days).
 * Returns array of days with exact stacks of protein, carbs, fat, fibre, and total calories.
 */
export async function getDailyNutrientStats(userId: string, daysCount: number = 7): Promise<DailyNutrientStat[]> {
  const all = await getAllMealIntakes(userId);
  const today = new Date();

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const stats: DailyNutrientStat[] = [];

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const isToday = i === 0;
    const isYesterday = i === 1;
    const dayLabel = isToday ? 'Today' : isYesterday ? 'Yesterday' : dayNames[d.getDay()];
    const dateFormatted = `${monthNames[d.getMonth()]} ${d.getDate()}`;

    // Filter meals for this date
    const dayMeals = all.filter((m) => m.date === dateStr);

    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let fibre = 0;
    let cost = 0;

    for (const m of dayMeals) {
      calories += Number(m.calories) || 0;
      protein += Number(m.protein) || 0;
      carbs += Number(m.carbs) || 0;
      fat += Number(m.fat) || 0;
      fibre += Number(m.fibre) || 0;
      cost += Number(m.bazarCost) || 0;
    }

    stats.push({
      date: dateStr,
      dayLabel,
      dateFormatted,
      calories: Math.round(calories),
      protein: Number(protein.toFixed(1)),
      carbs: Number(carbs.toFixed(1)),
      fat: Number(fat.toFixed(1)),
      fibre: Number(fibre.toFixed(1)),
      cost: Number(cost.toFixed(2)),
      mealCount: dayMeals.length,
      meals: dayMeals,
    });
  }

  return stats;
}

/**
 * Returns a comprehensive nutritional digest specifically designed for the AI Assistant prompt.
 * Enables NutriLens AI Chatbot to accurately know recent meals and nutrient intake.
 */
export async function getChatbotNutrientContext(userId: string): Promise<string> {
  const all = await getAllMealIntakes(userId);
  if (all.length === 0) {
    return 'No confirmed meals recorded yet in the database.';
  }

  const { thisWeek } = await getMealsWeekwise(userId);
  const todayMeals = all.filter((m) => m.date === new Date().toISOString().split('T')[0]);

  const todaySummary = todayMeals.length > 0
    ? todayMeals.map((m) => `• [${m.time}] ${m.title}: ${m.calories} kcal, ${m.protein}g protein, ${m.carbs}g carbs, ${m.fat}g fat (Cost: ৳${m.bazarCost})`).join('\n')
    : 'No meals logged yet today.';

  const weekCal = thisWeek.reduce((a, b) => a + b.calories, 0);
  const weekPro = thisWeek.reduce((a, b) => a + b.protein, 0);
  const weekMealsCount = thisWeek.length;
  const avgPro = weekMealsCount > 0 ? (weekPro / Math.min(weekMealsCount, 7)).toFixed(1) : '0';

  return `
--- LIVE USER MEAL INTAKE DATABASE SUMMARY ---
Meals Logged Today (${todayMeals.length}):
${todaySummary}

This Week's Intake Summary:
• Total Logged Meals: ${weekMealsCount}
• Total Energy: ${weekCal} kcal
• Total Protein: ${weekPro.toFixed(1)}g (Avg ~${avgPro}g/day)
• Recent Dishes Eaten: ${all.slice(0, 5).map((m) => m.title).join(', ')}
-----------------------------------------------`;
}
