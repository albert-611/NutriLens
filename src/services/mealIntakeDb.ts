/**
 * NutriLens Persistent Meal Intake & Nutrient Database Service
 * Provides unified, resilient persistence across Supabase PostgreSQL and
 * browser persistent storage. Supports querying all meals, weekwise, monthwise,
 * and daily stacked nutrient statistics for charts and the AI nutrition chatbot.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  calculateItemCost,
  formatMealTime,
  isSampleDummyMeal,
  fetchUserConfirmedMeals,
  calculateExactKcal,
  type ConfirmedMealRecord,
} from './dashboardService';

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

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Converts a standard ConfirmedMealRecord to a normalized StoredMealRecord.
 */
export function normalizeConfirmedMeal(userId: string, meal: ConfirmedMealRecord): StoredMealRecord {
  const ts = meal.timestamp || new Date().toISOString();
  const d = new Date(ts);
  const dateStr = !isNaN(d.getTime()) ? toLocalDateStr(d) : toLocalDateStr(new Date());

  const items: StoredMealItem[] = (meal.items && meal.items.length > 0)
    ? meal.items.map((it: any) => {
        const p = Number(it.protein) || 0;
        const c = Number(it.carbs) || 0;
        const f = Number(it.fat) || 0;
        const itemCal = calculateExactKcal(p, c, f, Number(it.calories) || 0);
        return {
          foodId: it.foodId || it.id,
          name: it.name || it.foodName || 'Confirmed Food',
          nameBn: it.nameBn || it.foodNameBn,
          category: it.category || 'mixed_dishes',
          grams: Number(it.grams) || 100,
          preparationState: it.preparationState || it.state || 'cooked',
          calories: itemCal,
          protein: Number(p.toFixed(1)),
          carbs: Number(c.toFixed(1)),
          fat: Number(f.toFixed(1)),
          fibre: Number(it.fibre) || 0,
          cost: Number(it.cost) || calculateItemCost(it.category, Number(it.grams) || 100, it.name),
        };
      })
    : meal.title.split('+').map((part, idx) => {
        const count = meal.title.split('+').length || 1;
        const p = Number(((meal.protein || 0) / count).toFixed(1));
        const c = Number(((meal.carbs || 0) / count).toFixed(1));
        const f = Number(((meal.fat || 0) / count).toFixed(1));
        const cal = calculateExactKcal(p, c, f, Math.round(Number(meal.calories || 0) / count));
        return {
          foodId: `item_${idx}`,
          name: part.trim(),
          grams: 150,
          preparationState: 'cooked',
          calories: cal,
          protein: p,
          carbs: c,
          fat: f,
          fibre: 1.5,
          cost: Number(((meal.bazarCost || 0) / count).toFixed(2)),
        };
      });

  const fibreSum = items.reduce((acc, it) => acc + (it.fibre || 0), 0);
  const mealPro = Number(meal.protein) || items.reduce((acc, it) => acc + it.protein, 0);
  const mealCarb = Number(meal.carbs) || items.reduce((acc, it) => acc + it.carbs, 0);
  const mealFat = Number(meal.fat) || items.reduce((acc, it) => acc + it.fat, 0);
  const exactMealCal = calculateExactKcal(mealPro, mealCarb, mealFat, Number(meal.calories) || 0);

  return {
    id: meal.id,
    userId: userId || 'guest',
    title: meal.title,
    titleBn: meal.titleBn,
    date: dateStr,
    time: meal.time,
    timestamp: ts,
    mealType: meal.mealType || 'lunch',
    calories: exactMealCal,
    protein: Number(mealPro.toFixed(1)),
    carbs: Number(mealCarb.toFixed(1)),
    fat: Number(mealFat.toFixed(1)),
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
 * Gets all stored meal intakes for a user, perfectly synchronized with authoritative confirmed meals.
 */
export async function getAllMealIntakes(userId: string): Promise<StoredMealRecord[]> {
  try {
    const confirmedMeals = await fetchUserConfirmedMeals(userId);
    if (confirmedMeals && confirmedMeals.length > 0) {
      const normalized = confirmedMeals
        .filter((m) => !isSampleDummyMeal(m))
        .map((m) => normalizeConfirmedMeal(userId, m));
      // Overwrite local storage with the clean deduplicated set
      writeLocalDb(userId, normalized);
      return normalized;
    }
  } catch (err) {
    console.warn('Failed to fetch user confirmed meals in mealIntakeDb:', err);
  }

  const localList = readLocalDb(userId);
  return localList
    .filter((m) => !isSampleDummyMeal(m))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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
  
  // Calculate start of current week (Sunday)
  const dayOfWeek = now.getDay(); // 0 is Sunday
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
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
 * Generates daily stacked nutrient statistics across a specified number of days.
 * For 7-day mode: strictly aligns with the Sunday - Saturday calendar week.
 */
export async function getDailyNutrientStats(userId: string, daysCount: number = 7): Promise<DailyNutrientStat[]> {
  const all = await getAllMealIntakes(userId);
  const now = new Date();

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // 1. Current Week (Sun - Sat)
  if (daysCount === 7) {
    const currentDayOfWeek = now.getDay(); // 0 is Sunday
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - currentDayOfWeek);
    sunday.setHours(0, 0, 0, 0);

    const stats: DailyNutrientStat[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const dateStr = toLocalDateStr(d);

      const isToday = d.toDateString() === now.toDateString();
      const isYesterday = new Date(now.getTime() - 86400000).toDateString() === d.toDateString();
      const dayLabel = isToday ? 'Today' : isYesterday ? 'Yesterday' : dayNames[d.getDay()];
      const dateFormatted = `${monthNames[d.getMonth()]} ${d.getDate()}`;

      const dayMeals = all.filter((m) => {
        if (m.date === dateStr) return true;
        try {
          const md = new Date(m.timestamp);
          return (
            md.getFullYear() === d.getFullYear() &&
            md.getMonth() === d.getMonth() &&
            md.getDate() === d.getDate()
          );
        } catch {
          return false;
        }
      });

      let calories = 0;
      let protein = 0;
      let carbs = 0;
      let fat = 0;
      let fibre = 0;
      let cost = 0;

      for (const m of dayMeals) {
        const mPro = Number(m.protein) || 0;
        const mCarb = Number(m.carbs) || 0;
        const mFat = Number(m.fat) || 0;
        calories += calculateExactKcal(mPro, mCarb, mFat, Number(m.calories) || 0);
        protein += mPro;
        carbs += mCarb;
        fat += mFat;
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

  // 2. Trailing N days (14 days, 30 days)
  const stats: DailyNutrientStat[] = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = toLocalDateStr(d);

    const isToday = i === 0;
    const isYesterday = i === 1;
    const dayLabel = isToday ? 'Today' : isYesterday ? 'Yesterday' : dayNames[d.getDay()];
    const dateFormatted = `${monthNames[d.getMonth()]} ${d.getDate()}`;

    const dayMeals = all.filter((m) => {
      if (m.date === dateStr) return true;
      try {
        const md = new Date(m.timestamp);
        return (
          md.getFullYear() === d.getFullYear() &&
          md.getMonth() === d.getMonth() &&
          md.getDate() === d.getDate()
        );
      } catch {
        return false;
      }
    });

    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let fibre = 0;
    let cost = 0;

    for (const m of dayMeals) {
      const mPro = Number(m.protein) || 0;
      const mCarb = Number(m.carbs) || 0;
      const mFat = Number(m.fat) || 0;
      calories += calculateExactKcal(mPro, mCarb, mFat, Number(m.calories) || 0);
      protein += mPro;
      carbs += mCarb;
      fat += mFat;
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
 * Generates nutrient statistics for a specific month (all days of that month, e.g. 1st to 30th/31st).
 */
export async function getMonthNutrientStats(
  userId: string,
  year: number,
  monthIndex: number // 0 = Jan, 11 = Dec
): Promise<DailyNutrientStat[]> {
  const all = await getAllMealIntakes(userId);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const todayStr = toLocalDateStr(new Date());
  const stats: DailyNutrientStat[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, monthIndex, day);
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const isToday = dateStr === todayStr;
    const dayLabel = isToday ? 'Today' : dayNames[d.getDay()];
    const dateFormatted = `${monthNames[monthIndex]} ${day}`;

    const dayMeals = all.filter((m) => {
      if (m.date === dateStr) return true;
      try {
        const md = new Date(m.timestamp);
        return (
          md.getFullYear() === d.getFullYear() &&
          md.getMonth() === d.getMonth() &&
          md.getDate() === d.getDate()
        );
      } catch {
        return false;
      }
    });

    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let fibre = 0;
    let cost = 0;

    for (const m of dayMeals) {
      const mPro = Number(m.protein) || 0;
      const mCarb = Number(m.carbs) || 0;
      const mFat = Number(m.fat) || 0;
      calories += calculateExactKcal(mPro, mCarb, mFat, Number(m.calories) || 0);
      protein += mPro;
      carbs += mCarb;
      fat += mFat;
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
