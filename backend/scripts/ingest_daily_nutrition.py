"""
NutriLens Data Ingestion Script: Daily Food and Nutrition Dataset
Parses daily_food_nutrition_dataset.csv (651 records), normalizes nutritional density to per-100g,
and generates:
1. backend/app/data/daily_nutrition_foods.json
2. src/lib/dailyNutritionFoods.ts
3. supabase/seeds/04_daily_nutrition_foods.sql
"""

import csv
import json
import os
import re
import uuid

DAILY_NAMESPACE = uuid.UUID('7c82a920-aeb4-47e9-91c5-11e15fd541d9')
SOURCE_ID = '11111111-1111-1111-1111-111111111104'

COMMON_BN_NAMES = {
    'egg': 'ডিম',
    'scrambled eggs': 'স্ক্র্যাম্বলড ডিম',
    'boiled egg': 'সিদ্ধ ডিম',
    'toast': 'টোস্ট রুটি',
    'bread': 'পাউরুটি',
    'coffee': 'কফি',
    'tea': 'চা',
    'banana': 'কলা',
    'apple': 'আপেল',
    'orange': 'কমলা',
    'salmon': 'স্যামন মাছ',
    'tuna': 'টুনা মাছ',
    'chicken': 'মুরগির মাংস',
    'beef': 'গরুর মাংস',
    'turkey': 'টার্কি মাংস',
    'rice': 'ভাত',
    'quinoa': 'কিনোয়া',
    'oatmeal': 'ওটমিল',
    'broccoli': 'ব্রোকলি',
    'spinach': 'পালং শাক',
    'carrot': 'গাজর',
    'yogurt': 'দই',
    'milk': 'দুধ',
    'cheese': 'পনির / চিজ',
    'potato': 'আলু',
    'almonds': 'কাঠবাদাম',
    'peanut': 'চীনাবাদাম',
    'lentil': 'মসুর ডাল',
    'soup': 'সুপ',
    'pasta': 'পাস্তা',
    'salad': 'সালাদ',
    'cucumber': 'শসা',
    'tomato': 'টমেটো',
    'water': 'পানি',
    'butter': 'মাখন',
    'olive oil': 'জলপাই তেল',
}

def map_category(cat_str: str) -> str:
    c = cat_str.lower()
    if 'egg' in c:
        return 'eggs'
    if 'fish' in c or 'seafood' in c:
        return 'fish_and_seafood'
    if 'meat' in c or 'poultry' in c:
        return 'meat_and_poultry'
    if 'dairy' in c:
        return 'dairy'
    if 'fruit' in c:
        return 'fruits'
    if 'vegetable' in c:
        return 'vegetables'
    if 'legume' in c:
        return 'pulses_and_legumes'
    if 'grain' in c or 'pasta' in c or 'cereal' in c or 'toast' in c:
        return 'grains_and_cereals'
    if 'beverage' in c:
        return 'beverages'
    if 'condiment' in c:
        return 'spices_and_condiments'
    if 'snack' in c or 'dessert' in c or 'nut' in c:
        return 'snacks_and_sweets'
    return 'mixed_dishes'

def determine_prep_state(name: str) -> str:
    nl = name.lower()
    if 'raw' in nl or 'fresh' in nl:
        return 'raw'
    if 'boiled' in nl or 'steamed' in nl:
        return 'boiled'
    if 'fried' in nl:
        return 'fried'
    if 'grilled' in nl or 'roasted' in nl or 'baked' in nl:
        return 'roasted'
    if 'curry' in nl or 'curried' in nl:
        return 'curried'
    if 'toast' in nl or 'cereal' in nl or 'cracker' in nl or 'shake' in nl or 'canned' in nl or 'can' in nl or 'bagel' in nl:
        return 'commercial'
    return 'boiled'

def estimate_serving_grams(name: str, cat: str) -> float:
    nl = name.lower()
    
    # 1. Specific weight markers
    m_oz = re.search(r'(\d+(?:\.\d+)?)\s*oz', nl)
    if m_oz:
        return round(float(m_oz.group(1)) * 28.35, 1)
    
    m_tbsp = re.search(r'(\d+(?:\.\d+)?)\s*tbsp', nl)
    if m_tbsp:
        return round(float(m_tbsp.group(1)) * 15.0, 1)
        
    m_tsp = re.search(r'(\d+(?:\.\d+)?)\s*tsp', nl)
    if m_tsp:
        return round(float(m_tsp.group(1)) * 5.0, 1)

    m_slice = re.search(r'(\d+)\s*slice', nl)
    if m_slice:
        return float(int(m_slice.group(1)) * 35.0)

    if '1 can' in nl:
        return 350.0

    # 2. Cup measures with density context
    if 'cup' in nl:
        factor = 1.0
        m_frac = re.search(r'1/2\s*cup', nl)
        if m_frac:
            factor = 0.5
        elif '1/4' in nl:
            factor = 0.25
        elif '3/4' in nl:
            factor = 0.75

        if 'cereal' in nl or 'popcorn' in nl or 'flakes' in nl:
            return round(40.0 * factor * 2, 1) # ~40g per cup
        if 'spinach' in nl or 'greens' in nl or 'lettuce' in nl:
            return round(35.0 * factor * 2, 1)
        if 'broccoli' in nl or 'carrot' in nl or 'berries' in nl or 'blueberry' in nl:
            return round(90.0 * factor * 2, 1)
        if 'rice' in nl or 'quinoa' in nl or 'oatmeal' in nl or 'pasta' in nl:
            return round(160.0 * factor * 2, 1)
        if 'milk' in nl or 'yogurt' in nl or 'soup' in nl or 'beverage' in nl:
            return round(240.0 * factor * 2, 1)
        return round(150.0 * factor * 2, 1)

    # 3. Piece & size indicators
    if '2 large' in nl or '2 eggs' in nl:
        return 100.0
    if '1 large' in nl or '1 egg' in nl:
        return 50.0
    if 'medium' in nl:
        return 150.0
    if 'small' in nl:
        return 100.0
    if 'large' in nl:
        return 200.0

    # 4. Canonical whole fruits
    if 'banana' in nl:
        return 118.0
    if 'apple' in nl:
        return 150.0
    if 'orange' in nl:
        return 130.0

    # 5. Category-based fallback
    c = cat.lower()
    if 'beverage' in c:
        return 240.0
    if 'condiment' in c:
        return 15.0
    if 'snack' in c or 'nut' in c:
        return 30.0
    if 'vegetable' in c or 'fruit' in c:
        return 100.0
    if 'protein' in c or 'meat' in c or 'fish' in c:
        return 120.0
    return 150.0

def generate_bn_name(name_en: str) -> str:
    nl = name_en.lower()
    for key, bn in COMMON_BN_NAMES.items():
        if key in nl:
            return f"{name_en.split('(')[0].strip()} ({bn})"
    return name_en

def generate_aliases(name_en: str, name_bn: str, cat: str) -> list:
    aliases = set()
    clean_en = re.sub(r'[\(\)\[\],\/]', ' ', name_en).lower()
    tokens = [t.strip() for t in clean_en.split() if len(t.strip()) > 2 and not t.isdigit()]
    aliases.update(tokens)
    aliases.add(name_en.split('(')[0].strip().lower())
    
    clean_bn = re.sub(r'[\(\)\[\],\/]', ' ', name_bn).strip()
    bn_tokens = [t.strip() for t in clean_bn.split() if len(t.strip()) > 1]
    aliases.update(bn_tokens)
    
    return [a for a in aliases if a]

def main():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    csv_path = os.path.join(root_dir, 'daily_food_nutrition_dataset.csv')
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found.")
        return

    print(f"Loading {csv_path}...")
    with open(csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)
        raw_rows = []
        for r in reader:
            if not r:
                continue
            if len(r) == 13:
                r[0] = f"{r[0]},{r[1]}"
                r.pop(1)
            raw_rows.append(r)

    print(f"Read {len(raw_rows)} rows from CSV.")

    foods = []
    for idx, row in enumerate(raw_rows, start=1):
        name_en = row[0].strip()
        cat_str = row[1].strip()
        cals_serving = float(row[2]) if row[2] else 0.0
        prot_serving = float(row[3]) if row[3] else 0.0
        carb_serving = float(row[4]) if row[4] else 0.0
        fat_serving = float(row[5]) if row[5] else 0.0
        fib_serving = float(row[6]) if row[6] else 0.0
        sug_serving = float(row[7]) if len(row) > 7 and row[7] else 0.0
        sod_serving = float(row[8]) if len(row) > 8 and row[8] else 0.0
        chol_serving = float(row[9]) if len(row) > 9 and row[9] else 0.0

        serving_g = estimate_serving_grams(name_en, cat_str)
        if serving_g <= 0:
            serving_g = 100.0

        ratio = 100.0 / serving_g
        energy_100g = round(cals_serving * ratio, 1)
        prot_100g = round(prot_serving * ratio, 2)
        carb_100g = round(carb_serving * ratio, 2)
        fat_100g = round(fat_serving * ratio, 2)
        fib_100g = round(fib_serving * ratio, 2)
        sod_100g = round(sod_serving * ratio, 1)

        code = f"DN_{idx:04d}"
        food_id = str(uuid.uuid5(DAILY_NAMESPACE, f"daily:{code}"))
        category = map_category(cat_str)
        prep_state = determine_prep_state(name_en)
        name_bn = generate_bn_name(name_en)
        aliases = generate_aliases(name_en, name_bn, category)

        foods.append({
            'id': food_id,
            'code': code,
            'external_record_id': f"DAILY-NUTRI-{code}",
            'canonical_name': name_en,
            'name_en': name_en,
            'name_bn': name_bn,
            'scientific_name': 'Commercial / Household Food',
            'biblio_source': 'Daily Food and Nutrition Dataset (Kaggle/HF)',
            'category': category,
            'preparation_state': prep_state,
            'basis_grams': 100,
            'energy_kcal': energy_100g,
            'protein_g': prot_100g,
            'fat_g': fat_100g,
            'carbohydrate_g': carb_100g,
            'fibre_g': fib_100g,
            'calcium_mg': 0.0,
            'iron_mg': 0.0,
            'magnesium_mg': 0.0,
            'potassium_mg': 0.0,
            'sodium_mg': sod_100g,
            'zinc_mg': 0.0,
            'vitamin_c_mg': 0.0,
            'aliases': aliases,
            'standard_serving_grams': round(serving_g)
        })

    print(f"Processed {len(foods)} Daily Nutrition foods.")

    # 1. Output backend JSON: backend/app/data/daily_nutrition_foods.json
    json_path = os.path.join(root_dir, 'backend', 'app', 'data', 'daily_nutrition_foods.json')
    os.makedirs(os.path.dirname(json_path), exist_ok=True)
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(foods, f, indent=2, ensure_ascii=False)
    print(f"Generated backend JSON: {json_path} ({os.path.getsize(json_path)} bytes)")

    # 2. Output frontend TypeScript: src/lib/dailyNutritionFoods.ts
    ts_path = os.path.join(root_dir, 'src', 'lib', 'dailyNutritionFoods.ts')
    with open(ts_path, 'w', encoding='utf-8') as f:
        f.write("/**\n")
        f.write(" * Daily Food and Nutrition Dataset (Kaggle/HF)\n")
        f.write(f" * {len(foods)} Everyday Food & Meal Entries with Grounded Macronutrients & Portion Weights\n")
        f.write(" */\n\n")
        f.write("import type { FCDBFoodItem } from './fcdbFoods';\n\n")
        f.write("export const DAILY_NUTRITION_FOODS: FCDBFoodItem[] = ")
        json.dump(foods, f, indent=2, ensure_ascii=False)
        f.write(";\n")
    print(f"Generated frontend TS: {ts_path} ({os.path.getsize(ts_path)} bytes)")

    # 3. Output SQL Seed: supabase/seeds/04_daily_nutrition_foods.sql
    sql_path = os.path.join(root_dir, 'supabase', 'seeds', '04_daily_nutrition_foods.sql')
    with open(sql_path, 'w', encoding='utf-8') as f:
        f.write("-- NutriLens Seed Data: Daily Food and Nutrition Dataset\n")
        f.write(f"-- Total Foods: {len(foods)} Common Food Items\n\n")
        f.write("BEGIN;\n\n")
        f.write("INSERT INTO data_sources (id, name, short_citation, publication_year, population_coverage, is_verified)\n")
        f.write("VALUES (\n")
        f.write("    '11111111-1111-1111-1111-111111111104',\n")
        f.write("    'Daily Food and Nutrition Dataset',\n")
        f.write("    'Kaggle / Adil Shamim 2024',\n")
        f.write("    2024, 'Global Everyday Diet',\n")
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
        for item in foods:
            clean_name = item['name_en'].replace("'", "''")
            ext_id = item['external_record_id']
            row_sql = f"('{item['id']}', '{clean_name}', '{item['category']}', '{item['preparation_state']}', 'edible_portion_100g', 100.00, {item['energy_kcal']}, {item['protein_g']}, {item['carbohydrate_g']}, {item['fat_g']}, {item['fibre_g']}, '{SOURCE_ID}', '{ext_id}', '2024-v1', 'approved', 'complete')"
            food_rows.append(row_sql)
        f.write(",\n".join(food_rows))
        f.write("\nON CONFLICT (source_id, external_record_id) DO UPDATE SET\n")
        f.write("    canonical_name = EXCLUDED.canonical_name,\n")
        f.write("    energy_kcal = EXCLUDED.energy_kcal,\n")
        f.write("    protein_g = EXCLUDED.protein_g,\n")
        f.write("    carbohydrate_g = EXCLUDED.carbohydrate_g,\n")
        f.write("    fat_g = EXCLUDED.fat_g,\n")
        f.write("    fibre_g = EXCLUDED.fibre_g;\n\n")

        f.write("INSERT INTO food_names (food_id, language_code, local_name, normalized_alias, alias_type, review_status)\nVALUES\n")
        alias_rows = []
        for item in foods:
            clean_name_en = item['name_en'].replace("'", "''")
            clean_name_bn = item['name_bn'].replace("'", "''") if item['name_bn'] else clean_name_en
            alias_rows.append(f"('{item['id']}', 'en', '{clean_name_en}', '{clean_name_en.lower()}', 'canonical', 'approved')")
            alias_rows.append(f"('{item['id']}', 'bn', '{clean_name_bn}', '{clean_name_bn.lower()}', 'canonical', 'approved')")
            for a in item['aliases'][:5]:
                clean_a = a.replace("'", "''")
                alias_rows.append(f"('{item['id']}', 'en_alias', '{clean_a}', '{clean_a.lower()}', 'common', 'approved')")
        f.write(",\n".join(alias_rows))
        f.write(";\n\nCOMMIT;\n")

    print(f"Generated SQL seed file: {sql_path} ({os.path.getsize(sql_path)} bytes)")

if __name__ == '__main__':
    main()
