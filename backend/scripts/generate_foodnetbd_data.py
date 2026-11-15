import csv
import json
import uuid
import re
import os

CATEGORY_MAP = {
    'Bakery & Snacks': 'mixed_dishes',
    'Beverages': 'beverages',
    'Cereals & Grains': 'grains_and_cereals',
    'Eggs': 'eggs',
    'Fish & Seafood': 'fish_and_seafood',
    'Fruits': 'fruits',
    'Meat & Poultry': 'meat_and_poultry',
    'Milk & Dairy': 'dairy',
    'Nuts & Seeds': 'pulses_and_legumes',
    'Oils & Fats': 'oils_and_fats',
    'Pulses & Legumes': 'pulses_and_legumes',
    'Spices & Condiments': 'spices_and_condiments',
    'Street Foods': 'mixed_dishes',
    'Sugar & Sweeteners': 'mixed_dishes',
    'Traditional Sweets': 'mixed_dishes',
    'Vegetables': 'vegetables',
}

def map_preparation(prep_str: str, category: str) -> str:
    p = (prep_str or '').strip().lower()
    if 'raw' in p:
        return 'raw'
    elif 'boil' in p:
        return 'boiled'
    elif 'fried' in p or 'fry' in p:
        return 'fried'
    elif 'steam' in p:
        return 'steamed'
    elif 'roast' in p:
        return 'roasted'
    elif 'curried' in p or 'curry' in p or 'gravy' in p:
        return 'curried'
    elif 'commercial' in p or 'processed' in p or 'fermented' in p or 'composite' in p:
        return 'commercial'
    elif 'liquid' in p:
        return 'raw' if category == 'fruits' else 'commercial'
    elif 'powdered' in p or 'dried' in p:
        return 'raw'
    elif 'cooked' in p:
        if category in ('fish_and_seafood', 'meat_and_poultry', 'vegetables'):
            return 'curried'
        elif category in ('grains_and_cereals', 'pulses_and_legumes'):
            return 'boiled'
        return 'commercial'
    return 'raw'

def parse_float(val, default=0.0):
    try:
        if val is None or val == '' or str(val).strip() == '-':
            return default
        return round(float(str(val).replace(',', '').strip()), 2)
    except:
        return default

def extract_aliases(en_name: str, bn_name: str, subcat: str) -> list:
    aliases = set()
    # 1. Exact names
    aliases.add(en_name.strip())
    aliases.add(en_name.lower().strip())
    if bn_name:
        aliases.add(bn_name.strip())
    
    # 2. Extract parenthetical parts: e.g. "Watermelon (Tarmuj)" -> "Watermelon", "Tarmuj"
    paren_match = re.search(r'\(([^)]+)\)', en_name)
    if paren_match:
        inside = paren_match.group(1).strip()
        outside = re.sub(r'\([^)]+\)', '', en_name).strip()
        if inside:
            aliases.add(inside)
            aliases.add(inside.lower())
            for part in inside.split('/'):
                p = part.strip()
                if len(p) >= 2:
                    aliases.add(p)
                    aliases.add(p.lower())
        if outside:
            aliases.add(outside)
            aliases.add(outside.lower())
            
    # 3. Clean English tokens
    clean = re.sub(r'[^a-zA-Z0-9\s]', ' ', en_name).strip().lower()
    for token in clean.split():
        if len(token) >= 3 and token not in ('and', 'with', 'the', 'raw', 'mix', 'fresh'):
            aliases.add(token)

    # 4. Bengali words
    if bn_name:
        for bn_part in bn_name.split():
            b = bn_part.strip()
            if len(b) >= 2:
                aliases.add(b)

    return sorted(list(aliases), key=lambda x: -len(x))

def generate():
    csv_path = 'FoodNetBD.csv'
    if not os.path.exists(csv_path):
        print("FoodNetBD.csv not found!")
        return

    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    print(f"Read {len(rows)} rows from FoodNetBD.csv")

    foodnet_foods = []
    
    for row in rows:
        food_id_raw = row['Food_ID'].strip()
        en_name = row['English Name'].strip()
        bn_name = row['Bengali Name'].strip()
        sci_name = row.get('Scientific Name', '').strip()
        cat_raw = row.get('Category', '').strip()
        subcat = row.get('SubCategory', '').strip()
        category = CATEGORY_MAP.get(cat_raw, 'mixed_dishes')
        prep_raw = row.get('Preparation', '').strip()
        preparation_state = map_preparation(prep_raw, category)
        
        serving_g = parse_float(row.get('Standard_Serving_Size_g'), 100.0)
        if serving_g <= 0:
            serving_g = 100.0
            
        energy_kcal = parse_float(row.get('Energy (kcal)'), 0.0)
        energy_kj = parse_float(row.get('Energy (kJ)'), energy_kcal * 4.184)
        water_g = parse_float(row.get('Water (g)'), 0.0)
        protein_g = parse_float(row.get('Protein (g)'), 0.0)
        fat_g = parse_float(row.get('Fat (g)'), 0.0)
        sat_fat_g = parse_float(row.get('Saturated_Fat (g)'), 0.0)
        carbs_g = parse_float(row.get('Carbohydrate (g)'), 0.0)
        sugars_g = parse_float(row.get('Total_Sugars (g)'), 0.0)
        fibre_g = parse_float(row.get('Fibre (g)'), 0.0)
        ash_g = parse_float(row.get('Ash (g)'), 0.0)
        
        # Micronutrients
        ca_mg = parse_float(row.get('Ca (mg)'), 0.0)
        fe_mg = parse_float(row.get('Fe (mg)'), 0.0)
        mg_mg = parse_float(row.get('Mg (mg)'), 0.0)
        p_mg = parse_float(row.get('P (mg)'), 0.0)
        k_mg = parse_float(row.get('K (mg)'), 0.0)
        na_mg = parse_float(row.get('Na (mg)'), 0.0)
        zn_mg = parse_float(row.get('Zn (mg)'), 0.0)
        cu_mg = parse_float(row.get('Cu (mg)'), 0.0)
        selenium_mcg = parse_float(row.get('Selenium (mcg)'), 0.0)
        manganese_mg = parse_float(row.get('Manganese (mg)'), 0.0)
        iodine_mcg = parse_float(row.get('Iodine (mcg)'), 0.0)
        
        # Vitamins
        vit_a_mcg = parse_float(row.get('Vitamin A (mcg)'), 0.0)
        retinol_mcg = parse_float(row.get('Retinol (mcg)'), 0.0)
        beta_carotene_mcg = parse_float(row.get('Beta-carotene (mcg)'), 0.0)
        vit_d_mcg = parse_float(row.get('Vitamin D (mcg)'), 0.0)
        vit_e_mg = parse_float(row.get('Vitamin E (mg)'), 0.0)
        vit_k1_mcg = parse_float(row.get('Vitamin_K1 (mcg)'), 0.0)
        thiamin_mg = parse_float(row.get('Thiamin (mg)'), 0.0)
        riboflavin_mg = parse_float(row.get('Riboflavin (mg)'), 0.0)
        niacin_mg = parse_float(row.get('Niacin (mg)'), 0.0)
        b5_mg = parse_float(row.get('Pantothenic_Acid_B5 (mg)'), 0.0)
        b6_mg = parse_float(row.get('Vitamin B6 (mg)'), 0.0)
        folate_mcg = parse_float(row.get('Folate (mcg)'), 0.0)
        b12_mcg = parse_float(row.get('Vitamin_B12 (mcg)'), 0.0)
        vit_c_mg = parse_float(row.get('Vitamin C (mg)'), 0.0)

        # Deterministic UUID using FoodNetBD namespace
        item_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"foodnetbd_{food_id_raw}_{en_name}"))
        record_id = f"FNBD-{int(food_id_raw):04d}"
        code = f"FNBD_{int(food_id_raw):04d}"

        aliases = extract_aliases(en_name, bn_name, subcat)

        item = {
            "id": item_uuid,
            "code": code,
            "external_record_id": record_id,
            "canonical_name": en_name,
            "name_en": en_name,
            "name_bn": bn_name,
            "scientific_name": sci_name or "South Asian Food Commodity",
            "biblio_source": row.get('Source_Citation', 'FoodNetBD 2024 / NIN / FCDB'),
            "category": category,
            "sub_category": subcat,
            "preparation_state": preparation_state,
            "basis_grams": 100.0,
            "energy_kcal": energy_kcal,
            "energy_kj": energy_kj,
            "water_g": water_g,
            "protein_g": protein_g,
            "fat_g": fat_g,
            "saturated_fat_g": sat_fat_g,
            "carbohydrate_g": carbs_g,
            "total_sugars_g": sugars_g,
            "fibre_g": fibre_g,
            "ash_g": ash_g,
            "calcium_mg": ca_mg,
            "iron_mg": fe_mg,
            "magnesium_mg": mg_mg,
            "phosphorus_mg": p_mg,
            "potassium_mg": k_mg,
            "sodium_mg": na_mg,
            "zinc_mg": zn_mg,
            "copper_mg": cu_mg,
            "selenium_mcg": selenium_mcg,
            "manganese_mg": manganese_mg,
            "iodine_mcg": iodine_mcg,
            "vitamin_a_mcg": vit_a_mcg,
            "retinol_mcg": retinol_mcg,
            "beta_carotene_mcg": beta_carotene_mcg,
            "vitamin_d_mcg": vit_d_mcg,
            "vitamin_e_mg": vit_e_mg,
            "vitamin_k1_mcg": vit_k1_mcg,
            "thiamin_mg": thiamin_mg,
            "riboflavin_mg": riboflavin_mg,
            "niacin_mg": niacin_mg,
            "pantothenic_acid_b5_mg": b5_mg,
            "vitamin_b6_mg": b6_mg,
            "folate_mcg": folate_mcg,
            "vitamin_b12_mcg": b12_mcg,
            "vitamin_c_mg": vit_c_mg,
            "common_allergens": row.get('Common_Allergens', '').strip(),
            "disease_tags": row.get('Disease_Tags', '').strip(),
            "dietary_classification": row.get('Dietary_Classification', '').strip(),
            "halal_status": row.get('Halal_Status', 'Halal').strip(),
            "aliases": aliases,
            "standard_serving_grams": serving_g
        }
        foodnet_foods.append(item)

    # 1. Output backend JSON: backend/app/data/foodnetbd_foods.json
    backend_json_path = 'backend/app/data/foodnetbd_foods.json'
    os.makedirs(os.path.dirname(backend_json_path), exist_ok=True)
    with open(backend_json_path, 'w', encoding='utf-8') as f:
        json.dump(foodnet_foods, f, indent=2, ensure_ascii=False)
    print(f"Generated {backend_json_path} ({len(foodnet_foods)} items)")

    # 2. Output TypeScript: src/lib/foodNetBdFoods.ts
    ts_path = 'src/lib/foodNetBdFoods.ts'
    ts_content = f"""/**
 * Official FoodNet Bangladesh Comprehensive Dataset (FoodNetBD 2024)
 * 600 South Asian & Bangladeshi Food Entries with Laboratory Nutrients & Disease Tags
 */

import type {{ PreparationState }} from '../contracts';

export interface FoodNetBDFoodItem {{
  id: string;
  code: string;
  external_record_id: string;
  canonical_name: string;
  name_en: string;
  name_bn: string;
  scientific_name: string;
  biblio_source: string;
  category: string;
  sub_category?: string;
  preparation_state: PreparationState;
  basis_grams: number;
  energy_kcal: number;
  energy_kj?: number;
  water_g?: number;
  protein_g: number;
  fat_g: number;
  saturated_fat_g?: number;
  carbohydrate_g: number;
  total_sugars_g?: number;
  fibre_g: number;
  ash_g?: number;
  calcium_mg: number;
  iron_mg: number;
  magnesium_mg?: number;
  phosphorus_mg?: number;
  potassium_mg?: number;
  sodium_mg?: number;
  zinc_mg: number;
  copper_mg?: number;
  selenium_mcg?: number;
  manganese_mg?: number;
  iodine_mcg?: number;
  vitamin_a_mcg?: number;
  retinol_mcg?: number;
  beta_carotene_mcg?: number;
  vitamin_d_mcg?: number;
  vitamin_e_mg?: number;
  vitamin_k1_mcg?: number;
  thiamin_mg?: number;
  riboflavin_mg?: number;
  niacin_mg?: number;
  pantothenic_acid_b5_mg?: number;
  vitamin_b6_mg?: number;
  folate_mcg?: number;
  vitamin_b12_mcg?: number;
  vitamin_c_mg: number;
  common_allergens?: string;
  disease_tags?: string;
  dietary_classification?: string;
  halal_status?: string;
  aliases: string[];
  standard_serving_grams: number;
}}

export const FOODNETBD_FOODS: FoodNetBDFoodItem[] = {json.dumps(foodnet_foods, indent=2, ensure_ascii=False)};
"""
    with open(ts_path, 'w', encoding='utf-8') as f:
        f.write(ts_content)
    print(f"Generated {ts_path} ({len(foodnet_foods)} items)")

    # 3. Output Supabase SQL Seed: supabase/seeds/04_foodnetbd_foods.sql
    sql_path = 'supabase/seeds/04_foodnetbd_foods.sql'
    os.makedirs(os.path.dirname(sql_path), exist_ok=True)
    with open(sql_path, 'w', encoding='utf-8') as f:
        f.write("-- NutriLens Seed Data: FoodNetBD 600 Comprehensive Foods Dataset\n")
        f.write("BEGIN;\n\n")
        f.write("INSERT INTO data_sources (id, name, short_citation, publication_year, population_coverage, is_verified)\n")
        f.write("VALUES (\n")
        f.write("    '11111111-1111-1111-1111-111111111103',\n")
        f.write("    'FoodNet Bangladesh Comprehensive Database (FoodNetBD 2024)',\n")
        f.write("    'FoodNetBD 2024 / NIN / FCDB',\n")
        f.write("    2024, 'Bangladesh & South Asia',\n")
        f.write("    true\n")
        f.write(") ON CONFLICT (id) DO UPDATE SET\n")
        f.write("    name = EXCLUDED.name,\n")
        f.write("    short_citation = EXCLUDED.short_citation;\n\n")

        f.write("INSERT INTO foods (\n")
        f.write("    id, canonical_name, category, preparation_state, edible_basis, basis_grams,\n")
        f.write("    energy_kcal, protein_g, carbohydrate_g, fat_g, fibre_g,\n")
        f.write("    source_id, external_record_id, source_version, review_status, nutrient_completeness\n")
        f.write(") VALUES\n")

        food_rows = []
        for item in foodnet_foods:
            cname = item['canonical_name'].replace("'", "''")
            food_rows.append(
                f"('{item['id']}', '{cname}', '{item['category']}', '{item['preparation_state']}', "
                f"'edible_portion_100g', 100.00, {item['energy_kcal']}, {item['protein_g']}, "
                f"{item['carbohydrate_g']}, {item['fat_g']}, {item['fibre_g']}, "
                f"'11111111-1111-1111-1111-111111111103', '{item['external_record_id']}', '2024-v1', 'approved', 'complete')"
            )
        f.write(",\n".join(food_rows))
        f.write("\nON CONFLICT (id) DO NOTHING;\n\n")

        # Names
        f.write("INSERT INTO food_names (food_id, language_code, local_name, normalized_alias, alias_type, review_status)\nVALUES\n")
        name_rows = []
        for item in foodnet_foods:
            en = item['name_en'].replace("'", "''")
            bn = item['name_bn'].replace("'", "''")
            name_rows.append(f"('{item['id']}', 'en', '{en}', '{en.lower()}', 'canonical', 'approved')")
            if bn:
                name_rows.append(f"('{item['id']}', 'bn', '{bn}', '{bn.lower()}', 'canonical', 'approved')")
        f.write(",\n".join(name_rows))
        f.write("\nON CONFLICT DO NOTHING;\n\n")

        f.write("COMMIT;\n")
    print(f"Generated {sql_path}")

if __name__ == '__main__':
    generate()
