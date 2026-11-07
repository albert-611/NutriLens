# NutriLens Supabase Database Architecture & Seed Layer (Phase 1)

This directory contains the production-ready PostgreSQL database migrations, seed datasets, and integrity test suite for **NutriLens**.

---

## 1. Directory Structure

```
supabase/
├── migrations/
│   ├── 20261108000001_create_extensions_and_enums.sql
│   ├── 20261108000002_create_reference_tables.sql
│   ├── 20261108000003_create_food_and_nutrition_tables.sql
│   ├── 20261108000004_create_recipe_tables.sql
│   ├── 20261108000005_create_market_tables.sql
│   ├── 20261108000006_create_user_and_meal_tables.sql
│   ├── 20261108000007_create_knowledge_and_vector_tables.sql
│   ├── 20261108000008_create_indexes_and_constraints.sql
│   └── 20261108000009_create_rls_and_security_policies.sql
├── seeds/
│   ├── 01_data_sources_and_markets.sql
│   ├── 02_foods_and_aliases.sql
│   ├── 03_recipes_and_ingredients.sql
│   ├── 04_market_observations.sql
│   ├── 05_knowledge_documents_and_chunks.sql
│   ├── 06_demo_profiles_provisioning.sql
│   └── combined_seed_for_sql_editor.sql
├── tests/
│   ├── database_integrity_test.sql
│   └── reset_database.sql
├── seed.sql
└── combined_migrations_for_sql_editor.sql
```

---

## 2. Seed Data Counts & Target Compliance

| Dataset | Target Range | Exact Seed Count | Compliance Status |
| :--- | :---: | :---: | :---: |
| **Canonical Foods** | 40–60 | **50** | ✓ Passed |
| **Multilingual Aliases** | 80–150 | **135** | ✓ Passed |
| **Curated Recipes** | 12–20 | **14** | ✓ Passed |
| **Recipe Ingredients** | Multi-item | **38** | ✓ Passed (All mapped to valid foods) |
| **Demo Markets** | 2–3 | **2** (Savar, Ashulia) | ✓ Passed |
| **Market Observations** | 40–80 | **50** | ✓ Passed (100% `synthetic_demo`) |
| **Knowledge Documents** | 2–5 | **3** (DGHS, FAO, WHO) | ✓ Passed |
| **Knowledge Chunks (RAG)** | 15–25 | **15** | ✓ Passed (768-dim vectors) |
| **Demo Adult Profiles** | 3–5 | **3** | ✓ Passed (Safe provisioning) |

---

## 3. How to Apply to Supabase

### Option A: Using Supabase Web Dashboard (Recommended for quick setup)
1. Navigate to your Supabase Project: **SQL Editor**.
2. Open `supabase/combined_migrations_for_sql_editor.sql`, paste into the editor, and click **RUN**.
3. Open `supabase/seeds/combined_seed_for_sql_editor.sql`, paste into the editor, and click **RUN**.
4. Open `supabase/tests/database_integrity_test.sql`, paste into the editor, and click **RUN**.
   - You should see the message: `=== ALL NUTRILENS PHASE 1 INTEGRITY TESTS PASSED SUCCESSFULLY! ===`.

### Option B: Using Supabase CLI
```bash
# Link your local project to Supabase Cloud
supabase link --project-ref <your-project-ref>

# Push all migrations
supabase db push

# Reset & re-apply seed
supabase db reset
```

---

## 4. Security & Architecture Checklist
- **Preservation of NULLs:** Missing micronutrients retain `NULL` and are never coerced to `0.0`.
- **Row Level Security (RLS):** Enabled across all 14 tables. Reference tables have public read access; user records (`profiles`, `meal_logs`, `meal_items`, `meal_reports`, `meal_plans`) are isolated to `auth.uid() = user_id`.
- **Synthetic Demo Labeling:** 100% of price and inventory fixtures carry `data_mode = 'synthetic_demo'` with timestamps and seller labels.
