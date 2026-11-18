import type { WFPPriceObservation } from '../lib/wfpMarketPrices';
import {
  WFP_DIVISIONS,
  WFP_DIVISION_NAMES_BN,
  WFP_DIVISION_MARKETS,
  WFP_2026_MARKET_OBSERVATIONS,
} from '../lib/wfpMarketPrices';

export interface BazarProduct {
  food_id: string;
  category_id: string;
  name_en: string;
  name_bn: string;
  country?: string;
  measurement?: {
    price_unit: string;
    unit_quantity: number;
    unit_label_en: string;
    unit_label_bn: string;
    supported_input_units?: string[];
  };
  regional_prices: Record<
    string,
    {
      division_en: string;
      division_bn: string;
      currency: string;
      unit: string;
      price_min: number;
      price_max: number;
      estimated_midpoint: number;
      price_status?: string;
    }
  >;
  market_prices: Record<
    string,
    {
      market_id: string;
      market_name: string;
      division_code: string;
      division_en: string;
      currency: string;
      unit: string;
      price_min: number;
      price_max: number;
      average_price: number;
      previous_average_price?: number;
      trend: 'up' | 'down' | 'stable';
      trend_percentage: number;
      last_updated: string;
      price_status?: string;
    }
  >;
}

export interface BazarMarket {
  market_id: string;
  division_code: string;
  division_en: string;
  division_bn?: string;
  market_name: string;
  market_name_bn?: string | null;
  market_factor?: number;
}

export interface BazarDataset {
  dataset_id: string;
  dataset_version: string;
  generated_at: string;
  country: {
    name_en: string;
    name_bn: string;
    currency: string;
    currency_symbol: string;
  };
  coverage: {
    scope: string;
    divisions: Array<{ code: string; name_en: string; name_bn: string }>;
    product_count: number;
    market_count: number;
  };
  markets: BazarMarket[];
  products: BazarProduct[];
}

let cachedDataset: BazarDataset | null = null;
let loadPromise: Promise<BazarDataset | null> | null = null;

// Division name to Division Code mapping
const DIVISION_NAME_TO_CODE: Record<string, string> = {
  'Dhaka': 'DHAKA',
  'Chittagong': 'CHATTOGRAM',
  'Chattogram': 'CHATTOGRAM',
  'Rajshahi': 'RAJSHAHI',
  'Khulna': 'KHULNA',
  'Barisal': 'BARISHAL',
  'Barishal': 'BARISHAL',
  'Sylhet': 'SYLHET',
  'Rangpur': 'RANGPUR',
  'Mymensingh': 'MYMENSINGH',
};

/**
 * Loads the complete 2026 Bazar Dataset from /data/bajar_data.json.
 * Uses in-memory caching so the 368 products and 118 markets load in ~200ms once per session.
 */
export async function fetchBazarDataset(): Promise<BazarDataset | null> {
  if (cachedDataset) return cachedDataset;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const res = await fetch('/data/bajar_data.json');
      if (res.ok) {
        const data: BazarDataset = await res.json();
        cachedDataset = data;
        return data;
      }
    } catch (err) {
      console.warn('Notice: Failed to fetch /data/bajar_data.json, using synchronous 2026 dataset:', err);
    }
    return null;
  })();

  return loadPromise;
}

/**
 * Normalizes category IDs between standard filter IDs and dataset IDs.
 */
function matchesCategoryFilter(productCat: string, filterCat: string): boolean {
  if (!filterCat || filterCat === 'all') return true;
  if (productCat === filterCat) return true;

  // Grain aliases
  if (filterCat === 'grains_and_cereals' && (productCat === 'grains_bakery' || productCat === 'rice_grains')) {
    return true;
  }
  // Pulses aliases
  if (filterCat === 'pulses_and_legumes' && productCat === 'pulses_nuts_seeds') {
    return true;
  }
  // Eggs and dairy aliases
  if ((filterCat === 'eggs' || filterCat === 'dairy') && productCat === 'eggs_dairy') {
    return true;
  }
  // Meat aliases
  if (filterCat === 'meat_and_poultry' && productCat === 'meat_poultry') {
    return true;
  }
  // Fish aliases
  if (filterCat === 'fish_and_seafood' && productCat === 'fish_seafood') {
    return true;
  }
  // Spices aliases
  if (filterCat === 'spices_and_condiments' && (productCat === 'herbs_spices_condiments' || productCat === 'herbs_spices')) {
    return true;
  }
  // Oils aliases
  if (filterCat === 'oils_and_fats' && productCat === 'oils_fats') {
    return true;
  }
  // Traditional & snacks
  if (filterCat === 'snacks_and_sweets' && (productCat === 'sweets_desserts' || productCat === 'snacks_street_food')) {
    return true;
  }

  return false;
}

/**
 * Returns reactive 2026 observations from the active dataset.
 * Seamlessly resolves any selected division, market, category, and search query.
 */
export function getBazarObservations(
  dataset: BazarDataset | null,
  options: {
    division?: string;
    market?: string;
    category?: string;
    query?: string;
  }
): WFPPriceObservation[] {
  const { division = 'all', market = 'all', category = 'all', query = '' } = options;
  const q = query.trim().toLowerCase();

  // If dataset is not yet loaded, return synchronous 2026 observations
  if (!dataset || !dataset.products || dataset.products.length === 0) {
    return WFP_2026_MARKET_OBSERVATIONS.filter((item) => {
      const matchDiv = division === 'all' || item.division.toLowerCase() === division.toLowerCase();
      const matchMkt = market === 'all' || item.market.toLowerCase() === market.toLowerCase();
      const matchCat = matchesCategoryFilter(item.category, category);
      const matchQ =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.nameBn && item.nameBn.includes(q)) ||
        item.market.toLowerCase().includes(q) ||
        item.division.toLowerCase().includes(q);
      return matchDiv && matchMkt && matchCat && matchQ;
    });
  }

  // Find target market object if specific market selected
  let targetMarketObj: BazarMarket | undefined;
  if (market !== 'all') {
    targetMarketObj = dataset.markets.find(
      (m) => m.market_name.toLowerCase() === market.toLowerCase() || m.market_id === market
    );
  }

  const results: WFPPriceObservation[] = [];

  for (const product of dataset.products) {
    // 1. Category check
    if (!matchesCategoryFilter(product.category_id, category)) {
      continue;
    }

    // 2. Search query check
    if (q) {
      const matchesSearch =
        product.name_en.toLowerCase().includes(q) ||
        (product.name_bn && product.name_bn.toLowerCase().includes(q)) ||
        product.food_id.toLowerCase().includes(q);
      if (!matchesSearch) continue;
    }

    // CASE A: Specific Market Selected
    if (targetMarketObj && product.market_prices) {
      const mPrice = product.market_prices[targetMarketObj.market_id];
      if (mPrice) {
        results.push({
          id: `${product.food_id}_${targetMarketObj.market_id}_2026`,
          commodity: product.name_en,
          name: product.name_en,
          nameBn: product.name_bn || '',
          category: product.category_id,
          division: targetMarketObj.division_en,
          divisionBn: targetMarketObj.division_bn || WFP_DIVISION_NAMES_BN[targetMarketObj.division_en] || '',
          district: targetMarketObj.market_name,
          market: targetMarketObj.market_name,
          marketId: targetMarketObj.market_id,
          price: mPrice.average_price,
          unit: mPrice.unit || product.measurement?.price_unit || 'kg',
          packSize: product.measurement?.unit_label_en || `per ${mPrice.unit || 'kg'}`,
          trend: mPrice.trend || 'stable',
          change: `${mPrice.trend_percentage > 0 ? '+' : ''}${mPrice.trend_percentage || 0}%`,
          observedAt: mPrice.last_updated || '2026-11-16',
          year: '2026',
          seller: `${targetMarketObj.market_name} Wet Market`,
          source: 'Bazar Intelligence (2026)',
          latitude: '',
          longitude: '',
        });
      }
      continue;
    }

    // CASE B: Division Selected, All Markets in Division
    if (division !== 'all') {
      const divCode = DIVISION_NAME_TO_CODE[division] || division.toUpperCase();
      const reg = product.regional_prices?.[divCode];

      if (reg) {
        results.push({
          id: `${product.food_id}_${divCode}_2026`,
          commodity: product.name_en,
          name: product.name_en,
          nameBn: product.name_bn || '',
          category: product.category_id,
          division: reg.division_en || division,
          divisionBn: reg.division_bn || WFP_DIVISION_NAMES_BN[division] || '',
          district: `All Markets (${reg.division_en || division})`,
          market: `All Markets in ${reg.division_en || division}`,
          marketId: divCode,
          price: reg.estimated_midpoint,
          unit: reg.unit || product.measurement?.price_unit || 'kg',
          packSize: product.measurement?.unit_label_en || `per ${reg.unit || 'kg'}`,
          trend: 'stable',
          change: `৳${reg.price_min} - ৳${reg.price_max}`,
          observedAt: '2026-11-17',
          year: '2026',
          seller: `${reg.division_en || division} Regional Average`,
          source: 'Bazar Intelligence (2026)',
          latitude: '',
          longitude: '',
        });
      }
      continue;
    }

    // CASE C: All Divisions & All Markets (National Benchmark Overview)
    const regPrices = Object.values(product.regional_prices || {});
    if (regPrices.length > 0) {
      const avgPrice = Math.round(
        regPrices.reduce((sum, r) => sum + r.estimated_midpoint, 0) / regPrices.length
      );
      const minPrice = Math.min(...regPrices.map((r) => r.price_min));
      const maxPrice = Math.max(...regPrices.map((r) => r.price_max));
      const unit = regPrices[0].unit || product.measurement?.price_unit || 'kg';

      results.push({
        id: `${product.food_id}_ALL_2026`,
        commodity: product.name_en,
        name: product.name_en,
        nameBn: product.name_bn || '',
        category: product.category_id,
        division: 'National',
        divisionBn: 'জাতীয় গড়',
        district: 'Bangladesh (118 Markets)',
        market: 'National Benchmark Average',
        marketId: 'BD-ALL',
        price: avgPrice,
        unit,
        packSize: product.measurement?.unit_label_en || `per ${unit}`,
        trend: 'stable',
        change: `৳${minPrice} - ৳${maxPrice}`,
        observedAt: '2026-11-17',
        year: '2026',
        seller: 'Bangladesh Retail Monitoring',
        source: 'Bazar Intelligence (2026)',
        latitude: '',
        longitude: '',
      });
    }
  }

  return results;
}
