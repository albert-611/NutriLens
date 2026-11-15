import type { FoodWithAliases } from '../lib/foodDatabase';

const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

export function getUSDAApiKey(): string {
  const envKey = (import.meta.env.VITE_USDA_API_KEY || '').replace(/['"]/g, '').trim();
  return envKey || 'DEMO_KEY';
}

/**
 * Searches USDA FoodData Central directly using the FDC API endpoints from fdc_api.json.
 */
export async function searchUSDAFoodsDirect(query: string, limit = 10): Promise<FoodWithAliases[]> {
  const cleanQuery = (query || '').trim();
  if (!cleanQuery) return [];

  const apiKey = getUSDAApiKey();
  const url = `${USDA_BASE_URL}/foods/search?api_key=${apiKey}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: cleanQuery,
        pageSize: limit,
      }),
    });

    if (!res.ok) {
      console.warn(`USDA search failed with status ${res.status}`);
      return [];
    }

    const data = await res.json();
    const rawFoods = data.foods || [];

    return rawFoods.map((item: any) => {
      const nutMap: Record<string, number> = {};
      const nutrients = item.foodNutrients || [];

      for (const n of nutrients) {
        const name = (n.nutrientName || '').toLowerCase();
        const num = String(n.nutrientNumber || '');
        const val = Number(n.value) || 0;

        if (num === '208' || num === '1008' || (name.includes('energy') && (n.unitName || '').toLowerCase().includes('kcal'))) {
          nutMap.energy_kcal = val;
        } else if (num === '203' || num === '1003' || name.includes('protein')) {
          nutMap.protein_g = val;
        } else if (num === '204' || num === '1004' || name.includes('total lipid')) {
          nutMap.fat_g = val;
        } else if (num === '205' || num === '1005' || name.includes('carbohydrate')) {
          nutMap.carbohydrate_g = val;
        } else if (num === '291' || num === '1079' || name.includes('fiber')) {
          nutMap.fibre_g = val;
        } else if (num === '301' || num === '1087' || name.includes('calcium')) {
          nutMap.calcium_mg = val;
        } else if (num === '303' || num === '1089' || name.includes('iron')) {
          nutMap.iron_mg = val;
        } else if (num === '307' || num === '1093' || name.includes('sodium')) {
          nutMap.sodium_mg = val;
        } else if (num === '306' || num === '1092' || name.includes('potassium')) {
          nutMap.potassium_mg = val;
        } else if (num === '401' || num === '1162' || name.includes('vitamin c')) {
          nutMap.vitamin_c_mg = val;
        }
      }

      const foodItem: FoodWithAliases = {
        id: crypto.randomUUID(),
        canonical_name: item.description,
        name_en: item.description,
        name_bn: item.description,
        category: item.foodCategory || 'international',
        preparation_state: 'commercial',
        edible_basis: 'edible_portion_100g',
        basis_grams: 100,
        energy_kcal: Math.round(nutMap.energy_kcal || 0),
        protein_g: Number((nutMap.protein_g || 0).toFixed(2)),
        fat_g: Number((nutMap.fat_g || 0).toFixed(2)),
        carbohydrate_g: Number((nutMap.carbohydrate_g || 0).toFixed(2)),
        fibre_g: Number((nutMap.fibre_g || 0).toFixed(2)),
        source_id: '11111111-1111-1111-1111-111111111102',
        external_record_id: `USDA-FDC-${item.fdcId}`,
        review_status: 'approved',
        nutrient_completeness: 'complete',
        aliases: [item.description.toLowerCase()],
        standard_serving_grams: 100,
      };

      return foodItem;
    });
  } catch (err) {
    console.error('Error fetching USDA foods:', err);
    return [];
  }
}
