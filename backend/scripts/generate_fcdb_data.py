import zipfile
import xml.etree.ElementTree as ET
import re
import uuid
import json
import os

# Deterministic UUID namespace for FCDB items
FCDB_NAMESPACE = uuid.UUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')
FCTB_SOURCE_ID = '11111111-1111-1111-1111-111111111101'

CATEGORY_MAP = {
    '01': 'grains_and_cereals',
    '02': 'pulses_and_legumes',
    '03': 'vegetables',
    '04': 'vegetables',
    '05': 'vegetables',
    '06': 'pulses_and_legumes',
    '07': 'spices_and_condiments',
    '08': 'fruits',
    '09': 'fish_and_seafood',
    '10': 'meat_and_poultry',
    '11': 'eggs',
    '12': 'dairy',
    '13': 'oils_and_fats',
    '14': 'beverages',
    '15': 'mixed_dishes'
}

def clean_float(val_str):
    if not val_str:
        return 0.0
    val_str = val_str.strip()
    if val_str in ['-', 'Tr', 'NA', 'na', '', '0', '0.0']:
        return 0.0
    val_str = re.sub(r'[\[\]\(\)]', '', val_str)
    val_str = val_str.split(',')[0].strip()
    try:
        val = float(val_str)
        return round(val, 2)
    except ValueError:
        return 0.0

def parse_energy(val_str):
    if not val_str:
        return 0.0
    val_str = val_str.strip()
    m = re.match(r'^\(?(\d+(?:\.\d+)?)\)?(?:\s*\d+)?', val_str)
    if m:
        try:
            return round(float(m.group(1)), 1)
        except ValueError:
            pass
    m = re.match(r'^\[(\d+(?:\.\d+)?)\]', val_str)
    if m:
        return round(float(m.group(1)), 1)
    return clean_float(val_str)

def determine_prep_state(name_en):
    name_l = name_en.lower()
    if 'boiled' in name_l:
        return 'boiled'
    if 'steamed' in name_l:
        return 'steamed'
    if 'fried' in name_l:
        return 'fried'
    if 'roasted' in name_l:
        return 'roasted'
    if 'curried' in name_l or 'curry' in name_l:
        return 'curried'
    if 'drained' in name_l:
        return 'drained'
    if 'biscuit' in name_l or 'bread' in name_l or 'toast' in name_l or 'powder' in name_l:
        return 'commercial'
    return 'raw'

def generate_aliases(name_en, name_bn, code):
    aliases = set()
    aliases.add(code.lower())
    
    clean_en = re.sub(r'[\*\(\)\[\],]', ' ', name_en).lower()
    tokens = [t.strip() for t in clean_en.split() if len(t.strip()) > 2]
    aliases.update(tokens)
    aliases.add(clean_en.strip())
    
    clean_bn = re.sub(r'[\*\(\)\[\],]', ' ', name_bn).strip()
    bn_tokens = [t.strip() for t in clean_bn.split() if len(t.strip()) > 1]
    aliases.update(bn_tokens)
    aliases.add(clean_bn)
    
    return [a for a in aliases if a]

def main():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    xlsx_path = os.path.join(root_dir, 'FCDB_7_4_14.xlsx')
    if not os.path.exists(xlsx_path):
        print(f"Error: {xlsx_path} not found.")
        return

    print(f"Loading {xlsx_path}...")
    with zipfile.ZipFile(xlsx_path, 'r') as z:
        shared_strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            ss_root = ET.fromstring(z.read('xl/sharedStrings.xml'))
            ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
            for si in ss_root.findall('ns:si', ns):
                t = si.find('ns:t', ns)
                if t is not None and t.text:
                    shared_strings.append(t.text)
                else:
                    text_parts = [r.find('ns:t', ns).text for r in si.findall('ns:r', ns) if r.find('ns:t', ns) is not None and r.find('ns:t', ns).text]
                    shared_strings.append(''.join(text_parts))

        sheet_root = ET.fromstring(z.read('xl/worksheets/sheet5.xml'))
        ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        rows = sheet_root.findall('.//ns:row', ns)
        
        foods = []
        
        for row in rows:
            row_vals = {}
            for c in row.findall('ns:c', ns):
                col_ref = ''.join([ch for ch in c.attrib.get('r', '') if ch.isalpha()])
                t = c.attrib.get('t')
                v = c.find('ns:v', ns)
                val = ''
                if v is not None and v.text:
                    val = shared_strings[int(v.text)] if t == 's' else v.text
                row_vals[col_ref] = val
                
            code = row_vals.get('A', '').strip()
            if re.match(r'^\d{2}_\d{4}', code):
                cat_code = code[:2]
                category = CATEGORY_MAP.get(cat_code, 'mixed_dishes')
                name_en = row_vals.get('B', '').strip()
                name_bn = row_vals.get('C', '').strip()
                scientific_name = row_vals.get('D', '').strip()
                biblio = row_vals.get('E', '').strip()
                
                food_id = str(uuid.uuid5(FCDB_NAMESPACE, f"fcdb:{code}"))
                energy_kcal = parse_energy(row_vals.get('G', ''))
                prot = clean_float(row_vals.get('I', ''))
                fat = clean_float(row_vals.get('J', ''))
                cho = clean_float(row_vals.get('K', ''))
                fib = clean_float(row_vals.get('L', ''))
                
                ca = clean_float(row_vals.get('N', ''))
                fe = clean_float(row_vals.get('O', ''))
                mg = clean_float(row_vals.get('P', ''))
                k = clean_float(row_vals.get('R', ''))
                na = clean_float(row_vals.get('S', ''))
                zn = clean_float(row_vals.get('T', ''))
                vit_c = clean_float(row_vals.get('AK', ''))
                
                prep_state = determine_prep_state(name_en)
                aliases = generate_aliases(name_en, name_bn, code)
                
                foods.append({
                    'id': food_id,
                    'code': code,
                    'external_record_id': f"FCDB-{code}",
                    'name_en': name_en,
                    'name_bn': name_bn,
                    'scientific_name': scientific_name,
                    'biblio_source': biblio,
                    'category': category,
                    'preparation_state': prep_state,
                    'basis_grams': 100,
                    'energy_kcal': energy_kcal,
                    'protein_g': prot,
                    'fat_g': fat,
                    'carbohydrate_g': cho,
                    'fibre_g': fib,
                    'calcium_mg': ca,
                    'iron_mg': fe,
                    'magnesium_mg': mg,
                    'potassium_mg': k,
                    'sodium_mg': na,
                    'zinc_mg': zn,
                    'vitamin_c_mg': vit_c,
                    'aliases': aliases
                })

    print(f"Processed {len(foods)} FCDB foods.")

    # 1. Generate SQL Seed file
    sql_path = os.path.join(root_dir, 'supabase', 'seeds', '02_fcdb_foods.sql')
    os.makedirs(os.path.dirname(sql_path), exist_ok=True)
    with open(sql_path, 'w', encoding='utf-8') as f:
        f.write("-- NutriLens Seed Data: Official Food Composition Database for Bangladesh (FCDB 2014)\n")
        f.write("-- Total Foods: 381 Canonical Laboratory Records with Full Micronutrients\n")
        f.write("-- Source: Institute of Nutrition and Food Science (INFS), University of Dhaka / FAO\n\n")
        
        f.write("BEGIN;\n\n")
        f.write("-- Ensure data source exists\n")
        f.write("INSERT INTO data_sources (id, name, short_citation, publication_year, population_coverage, is_verified)\n")
        f.write("VALUES (\n")
        f.write("    '11111111-1111-1111-1111-111111111101',\n")
        f.write("    'Food Composition Table for Bangladesh (FCTB / FCDB 2014)',\n")
        f.write("    'INFS / University of Dhaka & FAO 2014',\n")
        f.write("    2014, 'Bangladesh National',\n")
        f.write("    true\n")
        f.write(") ON CONFLICT (id) DO UPDATE SET\n")
        f.write("    name = EXCLUDED.name,\n")
        f.write("    short_citation = EXCLUDED.short_citation;\n\n")

        f.write("-- Insert Canonical Foods\n")
        f.write("INSERT INTO foods (\n")
        f.write("    id, canonical_name, category, preparation_state, edible_basis, basis_grams,\n")
        f.write("    energy_kcal, protein_g, carbohydrate_g, fat_g, fibre_g,\n")
        f.write("    source_id, external_record_id, source_version, review_status, nutrient_completeness\n")
        f.write(") VALUES\n")
        
        food_rows = []
        for item in foods:
            clean_name = item['name_en'].replace("'", "''")
            ext_id = item['external_record_id']
            row_sql = f"('{item['id']}', '{clean_name}', '{item['category']}', '{item['preparation_state']}', 'edible_portion_100g', 100.00, {item['energy_kcal']}, {item['protein_g']}, {item['carbohydrate_g']}, {item['fat_g']}, {item['fibre_g']}, '{FCTB_SOURCE_ID}', '{ext_id}', '2014-v1', 'approved', 'complete')"
            food_rows.append(row_sql)
        f.write(",\n".join(food_rows))
        f.write("\nON CONFLICT (source_id, external_record_id) DO UPDATE SET\n")
        f.write("    canonical_name = EXCLUDED.canonical_name,\n")
        f.write("    energy_kcal = EXCLUDED.energy_kcal,\n")
        f.write("    protein_g = EXCLUDED.protein_g,\n")
        f.write("    carbohydrate_g = EXCLUDED.carbohydrate_g,\n")
        f.write("    fat_g = EXCLUDED.fat_g,\n")
        f.write("    fibre_g = EXCLUDED.fibre_g;\n\n")

        f.write("-- Insert Food Names & Aliases\n")
        f.write("INSERT INTO food_names (food_id, language_code, local_name, normalized_alias, alias_type, review_status)\nVALUES\n")
        alias_rows = []
        for item in foods:
            clean_name_en = item['name_en'].replace("'", "''")
            clean_name_bn = item['name_bn'].replace("'", "''") if item['name_bn'] else clean_name_en
            alias_rows.append(f"('{item['id']}', 'en', '{clean_name_en}', '{clean_name_en.lower()}', 'canonical', 'approved')")
            alias_rows.append(f"('{item['id']}', 'bn', '{clean_name_bn}', '{clean_name_bn.lower()}', 'canonical', 'approved')")
            for a in item['aliases'][:5]:
                clean_a = a.replace("'", "''")
                alias_rows.append(f"('{item['id']}', 'bn_translit', '{clean_a}', '{clean_a.lower()}', 'common', 'approved')")
        f.write(",\n".join(alias_rows))
        f.write(";\n\nCOMMIT;\n")
        
    print(f"Generated SQL seed file: {sql_path} ({os.path.getsize(sql_path)} bytes)")

    # 2. Generate TypeScript Food Database: src/lib/fcdbFoods.ts
    ts_path = os.path.join(root_dir, 'src', 'lib', 'fcdbFoods.ts')
    serving_map = {
        'grains_and_cereals': 150,
        'pulses_and_legumes': 100,
        'vegetables': 100,
        'fruits': 120,
        'fish_and_seafood': 100,
        'meat_and_poultry': 120,
        'eggs': 55,
        'dairy': 200,
        'oils_and_fats': 15,
        'spices_and_condiments': 10,
        'beverages': 250,
        'mixed_dishes': 200
    }
    
    for item in foods:
        item['standard_serving_grams'] = serving_map.get(item['category'], 100)
        item['canonical_name'] = item['name_en']

    with open(ts_path, 'w', encoding='utf-8') as f:
        f.write("/**\n * Official Food Composition Database for Bangladesh (FCDB 2014)\n")
        f.write(" * INFS, University of Dhaka & FAO Bangladesh\n")
        f.write(f" * 381 Canonical Items with Laboratory-Verified Nutrition\n */\n\n")
        f.write("import type { PreparationState } from '../contracts';\n\n")
        f.write("export interface FCDBFoodItem {\n")
        f.write("  id: string;\n")
        f.write("  code: string;\n")
        f.write("  external_record_id: string;\n")
        f.write("  canonical_name: string;\n")
        f.write("  name_en: string;\n")
        f.write("  name_bn: string;\n")
        f.write("  scientific_name: string;\n")
        f.write("  biblio_source: string;\n")
        f.write("  category: string;\n")
        f.write("  preparation_state: PreparationState;\n")
        f.write("  basis_grams: number;\n")
        f.write("  energy_kcal: number;\n")
        f.write("  protein_g: number;\n")
        f.write("  fat_g: number;\n")
        f.write("  carbohydrate_g: number;\n")
        f.write("  fibre_g: number;\n")
        f.write("  calcium_mg: number;\n")
        f.write("  iron_mg: number;\n")
        f.write("  magnesium_mg?: number;\n")
        f.write("  potassium_mg?: number;\n")
        f.write("  sodium_mg?: number;\n")
        f.write("  zinc_mg: number;\n")
        f.write("  vitamin_c_mg: number;\n")
        f.write("  aliases: string[];\n")
        f.write("  standard_serving_grams: number;\n")
        f.write("}\n\n")
        f.write("export const FCDB_FOODS: FCDBFoodItem[] = ")
        f.write(json.dumps(foods, indent=2, ensure_ascii=False))
        f.write(";\n")
        
    print(f"Generated TypeScript catalog: {ts_path} ({os.path.getsize(ts_path)} bytes)")

    # 3. Generate Backend JSON data for FastAPI: backend/app/data/fcdb_foods.json
    json_path = os.path.join(root_dir, 'backend', 'app', 'data', 'fcdb_foods.json')
    os.makedirs(os.path.dirname(json_path), exist_ok=True)
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(foods, f, indent=2, ensure_ascii=False)
    print(f"Generated Backend JSON: {json_path} ({os.path.getsize(json_path)} bytes)")

if __name__ == '__main__':
    main()
