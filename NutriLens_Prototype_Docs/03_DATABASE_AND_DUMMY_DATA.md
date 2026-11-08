# NutriLens | Database Schema and Dummy Data Specification


This is the implementation guide for Phase 1. Use Supabase PostgreSQL as the source of truth. Separate reviewed nutrition/reference records from synthetic market/demo records. The compact schema is the MVP target; the expanded schema is a later normalization guide.


# 08 | Build a trustworthy food-data layer

**Ingestion sequence:** Select foods actually needed for the demo; retrieve their source records; normalize units; review the preparation state; map local names; verify missing values; record source IDs and versions; import via a repeatable script; spot-check the result against the original.

**One food record must state:** Canonical identity, preparation state, edible basis, nutrient basis in grams, nutrient units, source record ID, source URL, imported date and source version/date. Keep values nullable. Unknown fibre is not zero fibre.

**Matching order:** Exact approved alias -> curated recipe name -> filtered candidate search -> manual selection. Do not accept the first fuzzy match automatically. Distinguish dry, raw, boiled, fried, drained and cooked-with-added-fat states.

**Mixed dishes:** A generic curry name is insufficient for precise nutrients. Match a named, sourced standard recipe and label it as a proxy, or confirm its ingredients. Recipe ingredient rows must reference the preparation state in which their grams are recorded.

**Bangladesh:** FAO lists a 2013 Food Composition Table for Bangladesh and country dietary-guideline material. These are useful candidate sources, but older publication dates must remain visible. Check reuse permissions and applicability before importing. The directory listing itself is not an endorsement of every record. [S14, S15]

**International coverage:** An unsupported market can use reviewed generic food matches and a no-price shopping list. Display the actual support level: validated pilot pack, limited pack or generic baseline only. A country selector must not imply worldwide stock coverage.

**Price observation fields:** Food/SKU, country, city or store, currency, package quantity and unit, package price, observation timestamp, source, validity window and data mode. Normalize only when the mass or conversion is known. One egg needs a verified edible weight if nutrition is converted to grams.

**Data modes:** Live retailer response; dated manual observation; historical reference; synthetic demonstration. Seasonal availability is separate metadata. Only a stock observation from an appropriate source supports an in-stock claim.

**Seed quality gate:** No missing source IDs for nutrient records, no negative quantities, no currency mixing, no stale prices silently treated as current, and no guessed unit conversions. All demo recipes must have complete ingredient mappings.


# 16 | Database design: identity and food

Use one Postgres database. Keep public reference data separate from private user state. The following is a logical schema to turn into reviewed migrations; it is not a complete executable SQL file.

**Beginner implementation choice:** The next schema sections describe the complete logical model. Do not create every normalized table during the hackathon. Use the compact mapping below for the first build; expand only after the end-to-end flow is stable.

| Compact MVP table | What it contains |
| --- | --- |
| markets, profiles, data_sources | Locale/coverage and budget presets; user constraints; shared source register |
| foods, food_names | Core nutrient columns with units/completeness, preparation state, source fields and approved aliases |
| recipes | Reviewed ingredients and quantities as validated JSON, servings, equipment, yield and instructions |
| market_observations | Price and optional stock fields with separate timestamps, source and data mode |
| meal_logs, meal_plans | Confirmed items, report versions, constraints, computed output and shopping-list snapshots |
| knowledge_documents, knowledge_chunks | Reviewed guidance metadata, text, citations and embeddings |

This is 11 core tables. Pantry quantities can be a small validated field for MVP; chat can be session-only; a cooking_guides table is optional. JSON ingredient IDs need explicit server existence checks because ordinary foreign keys do not validate IDs inside JSON. All private snapshots still require RLS and version checks.


# 16A | Phase 1 dummy database and seed-data specification

## Purpose

The first build uses a **dummy database** so the team can finish and test the complete Vision-to-Market flow without waiting for supermarket partnerships or live retailer APIs. Use Supabase PostgreSQL from the first prototype; do not use disconnected frontend arrays as the source of truth.

The dummy database has two distinct kinds of records:

- **Reviewed reference records:** foods, aliases, nutrients, recipes and approved knowledge excerpts. These should be sourced or manually reviewed, with provenance stored.
- **Synthetic demonstration records:** prices, stock states, sample markets and demo profiles/transactions created only to demonstrate application behavior. These must carry `data_mode = 'synthetic_demo'` and never be displayed as live market facts.

## Target seed volume

| Dataset | Initial target | Notes |
|---|---:|---|
| Foods | 40–60 | Include common Bangladesh foods and selected preparation states |
| Food aliases | 80–150 | Bangla, English, transliteration and common spelling variants |
| Recipes | 12–20 | Curated, familiar meal combinations with mapped ingredients |
| Market locations | 2–3 | Demo markets around Savar/Ashulia; clearly synthetic where applicable |
| Price observations | 40–80 | Cover every ingredient used in the demo recipes; synthetic demo values |
| Inventory observations | 40–80 | `in_stock`, `out_of_stock` or `unknown`; synthetic demo values |
| Knowledge excerpts | 15–25 | Approved, short, source-linked nutrition/food guidance |
| Demo profiles | 3–5 | Fictional adult profiles; no real health records |

Do not inflate seed counts before the core records are correct. Every recipe ingredient must resolve to a valid food/preparation record. Every nutrient value must have a source and unit. Every market price must have a currency, purchase unit, pack size, timestamp and data mode.

## Bangladesh-first starter catalog

- **Grains/staples:** cooked white rice, raw rice, brown rice, atta/whole-wheat flour, oats, flattened rice/ চিড়া, puffed rice/মুড়ি.
- **Protein foods:** egg, chicken, beef, freshwater fish options, milk, plain yogurt, paneer where supported.
- **Legumes:** masoor dal, moong dal, chickpeas, kidney beans and other supported pulses.
- **Vegetables:** spinach/palak, lau, potato, tomato, cucumber, carrot, eggplant, cabbage, cauliflower, pumpkin, green papaya and seasonal greens.
- **Fruits:** banana, guava, papaya, mango when in the selected demo season, orange and other reviewed local entries.
- **Other ingredients:** onion, garlic, ginger, green chilli, cooking oil and common spices as recipe components where their quantities materially affect results.

This is a suggested catalog, not a claim that all entries have already been verified. Add only entries with an appropriate source and preparation state. Raw rice and cooked rice must be separate records; a generic label such as "fish curry" is not enough for authoritative calculation without a matching reviewed recipe or confirmed ingredients.

## Compact MVP tables

The implementation should use the compact table design from Section 16. Table and column names may be snake_case. The fields below define the expected minimum behavior; migrations should add primary keys, foreign keys, indexes, constraints and RLS policies.

### `markets`

`id`, `country_code`, `region`, `city`, `market_name`, `currency_code`, `time_zone`, `supported_languages`, `coverage_status`, `is_demo_market`.

Seed examples: Bangladesh / Dhaka Division / Savar / "Savar Demo Market" and Bangladesh / Dhaka Division / Ashulia / "Ashulia Demo Market". Both are sample contexts, not verified retailer locations.

### `profiles`

`id` (linked to Supabase Auth user), `market_id`, `display_name`, `age_adult_confirmed`, `language`, `unit_preference`, `cuisine_preferences`, `dietary_exclusions`, `declared_allergens`, `general_goal`, `household_size`, `budget_amount`, `budget_currency`, `budget_people`, `budget_duration_days`, `available_time_minutes`, `available_equipment`, `created_at`, `updated_at`.

Use fictional adult demo users. Do not collect date of birth, diagnosis, blood tests or medical records for this prototype. Optional targets must be labeled as user-entered, not clinically prescribed.

### `data_sources`

`id`, `publisher`, `title`, `source_url`, `source_type`, `license_note`, `source_version`, `published_at`, `retrieved_at`, `review_status`, `notes`.

### `foods`

`id`, `canonical_name`, `category`, `preparation_state`, `edible_basis`, `basis_grams` (normally 100), `energy_kcal`, `protein_g`, `carbohydrate_g`, `fat_g`, `fibre_g`, `source_id`, `external_record_id`, `source_version`, `review_status`, `nutrient_completeness`, `created_at`.

Core nutrient values are per 100 g edible portion unless a record explicitly states otherwise. Missing nutrient values remain `NULL`; never convert missing data to zero. If a nutrient field is present, record its provenance and unit. Store preparation state such as raw, boiled, cooked, fried or drained.

### `food_names`

`id`, `food_id`, `language_code`, `market_id` (nullable for global aliases), `local_name`, `normalized_alias`, `alias_type`, `review_status`.

Include Bangla script, English and commonly used transliterations. Alias matching may propose candidates but must not auto-confirm an ambiguous food.

### `recipes`

`id`, `market_id`, `cuisine`, `name_en`, `name_bn`, `description`, `servings`, `prep_time_minutes`, `cook_time_minutes`, `equipment_required`, `ingredients_json` (MVP option), `instructions`, `source_id`, `review_status`, `yield_grams`, `created_at`.

For a more normalized version, use the `recipe_ingredients` table described in Section 16B. Validate every food ID inside JSON in backend code. Do not rely on an LLM to invent recipes with unverified nutrient values.

### `market_observations`

`id`, `market_id`, `food_id` or `sku`, `seller_label`, `currency_code`, `price_amount`, `pack_quantity`, `pack_unit`, `price_per_base_unit` (only when conversion is valid), `stock_state`, `observed_at`, `expires_at`, `source_id`, `data_mode`, `notes`.

For dummy seed rows, set `data_mode = 'synthetic_demo'`. `stock_state` must be `in_stock`, `out_of_stock` or `unknown`. Price freshness and stock freshness are separate; an old price must not be presented as current and a price must not imply stock.

### `meal_logs`

`id`, `user_id`, `input_mode`, `image_path`, `status`, `revision`, `market_id`, `consent_at`, `created_at`, `updated_at`.

### `meal_plans`

`id`, `user_id`, `meal_log_id`, `meal_revision`, `constraints_snapshot`, `market_snapshot`, `selected_recipe_id`, `nutrient_totals`, `nutrient_completeness`, `shopping_list`, `estimated_cash_cost`, `currency_code`, `data_mode`, `status`, `formula_version`, `created_at`.

### `knowledge_documents` and `knowledge_chunks`

`knowledge_documents`: `id`, `title`, `publisher`, `source_url`, `country_code`, `language_code`, `population`, `published_at`, `version`, `review_status`, `license_note`.

`knowledge_chunks`: `id`, `document_id`, `chunk_text`, `section_or_page`, `embedding`, `embedding_model`, `embedding_dimension`, `embedding_version`, `created_at`.

Use pgvector only for the approved RAG corpus. The embedding model and vector dimension must match for stored chunks and query vectors.

## Example synthetic market seed rows

The following are example dummy values for UI and calculation testing only. They are **not verified current prices and not live stock**. Keep the same labels in the database and UI.

| Market | Item | Example purchase unit | Example price | Mode |
|---|---|---|---:|---|
| Savar Demo Market | Eggs | 4 pieces | ৳48 | `synthetic_demo` |
| Savar Demo Market | Lentils | 1 kg | ৳120 | `synthetic_demo` |
| Ashulia Demo Market | Chicken | 500 g | ৳180 | `synthetic_demo` |
| Savar Demo Market | Tilapia | 1 kg | ৳160 | `synthetic_demo` |
| Ashulia Demo Market | Spinach | 1 bunch | ৳20 | `synthetic_demo` |
| Savar Demo Market | Chickpeas | 1 kg | ৳110 | `synthetic_demo` |

Treat all values above as fixtures. They should be replaced with observations from a permitted, dated data source before anyone describes them as real market prices.

## Suggested demo recipes

Seed only reviewed, reproducible recipes. Examples to consider: rice + masoor dal + egg; rice + fish + vegetables; vegetable khichuri; chicken + rice + vegetables; chickpea curry + rice; egg bhurji + roti; dal + roti + seasonal greens; fish curry + rice; vegetable dal khichuri; yogurt/fruit breakfast bowl. These are recipe concepts, not completed nutrient records. Each one needs measured or sourced ingredient amounts, preparation details, serving size and a review status.

## Required data-mode labels

- `live_retailer`: response from an authorized retailer with a refresh timestamp.
- `dated_manual_observation`: manually collected price with source and time.
- `historical_reference`: historical or reference dataset, not current store inventory.
- `synthetic_demo`: invented test fixture for prototype behavior.

Never display `synthetic_demo` as "live", "real-time", "currently available" or "in stock" without a corresponding live source. When data is missing, show "Price unavailable" or "Stock unknown".

## Seed and reset workflow

1. Create a Supabase project and apply migrations.
2. Enable required extensions, including pgvector only when the RAG phase begins.
3. Import source-register rows.
4. Import reviewed foods and aliases.
5. Import curated recipes and validate every ingredient reference.
6. Import synthetic markets, price observations and stock states with `synthetic_demo` mode.
7. Insert reviewed knowledge documents/chunks and embeddings.
8. Create fictional demo users through Supabase Auth; link their profiles using trusted server-side setup.
9. Run database integrity checks and nutrition/budget fixtures.
10. Keep a repeatable seed script so the database can be reset to the same demo state.

Never put a service-role key or provider secret in a frontend seed script. Avoid committing real user information or production secrets.

## Database acceptance checklist

- Every food nutrient value has a unit, basis, preparation state and provenance.
- `NULL` nutrient values remain unknown in reports and calculations.
- Every recipe ingredient maps to an approved food ID and quantity.
- Every price has currency, pack size, unit, source/time and `data_mode`.
- Every stock value has a state and its own observation/expiry times.
- Synthetic values are clearly labeled in DB rows, API responses and UI.
- No user can read or alter another user's private profile, meal, plan or image.
- Seed scripts are idempotent or include a documented reset strategy.
- Nutrition and purchase calculations pass known fixtures.


# 16B | Expanded food-data schema

This is the normalized reference design. It explains relationships and future improvements; apply the compact mapping above while time is limited.

| Table | Essential fields and relationships |
| --- | --- |
| markets | id, country_code, region/city, default_currency, time_zone, supported_languages, coverage_status |
| profiles | auth user id, market_id, language, units, adult confirmation, cuisine preferences, exclusions, goal, household_size |
| data_sources | id, publisher, title, URL, source_type, license_note, source_version, published_at, retrieved_at |
| foods | id, canonical_name, category, preparation_state, edible_basis, source_id, external_id, source_version |
| nutrients | code, name, canonical_unit such as kcal/g/mg/ug |
| food_nutrients | food_id, nutrient_code, value_per_100g nullable, completeness/status, provenance |
| food_names | food_id, language, market_id nullable, local_name, normalized_alias |
| portion_conversions | food_id, unit_label, grams_per_unit, preparation_state, source_id |
| recipes | id, market/cuisine, translated names/instructions, servings, equipment, time range, source_id, review_status |
| recipe_ingredients | id, recipe_id, food_id, quantity_g, input_state, optional flag and display_order |
| recipe_yields | recipe_id, cooked_batch_g or applicable yield, source_id, method, note |

**Why normalize nutrients:** The original fixed kcal/protein/carbs/fat/fibre columns are acceptable for a very small MVP. A separate nutrient-value table makes units and optional micronutrients explicit without adding columns every time. Choose one representation early; do not maintain two competing sources of truth.

**Important constraints:** Positive quantities and serving counts; valid currency and unit enums; unique external ID within source/version; unique nutrient per food record; required provenance for published data. Treat external IDs as opaque strings.

**Recipe ingredients need their own row IDs:** The same food can appear twice in a recipe, such as oil used at separate stages. A primary key only on recipe_id and food_id can incorrectly prevent this.

**Alias uniqueness:** Market-specific and global aliases need deliberate uniqueness handling. Nullable market fields require an explicit uniqueness strategy; do not assume a standard composite key behaves as desired when NULL is involved.


# 17 | Database design: markets and private state

| Table | Essential fields and relationships |
| --- | --- |
| price_observations | id, market/store, food/SKU, currency, amount, pack size/unit, observed_at, valid_until, source_id, mode |
| inventory_observations | food/SKU, store, state: in_stock/out_of_stock/unknown, observed_at, expires_at, source_id, mode |
| budget_presets | market_id, tier, amount, people basis, duration basis, currency, updated_at |
| guideline_targets | nutrient/group, population, geography, min/max/range, unit, per-day basis, source_id, rule_version |
| cooking_factors | food/group, method, nutrient, retention_fraction, applicability, source_id, source_version |
| cooking_guides | food/category, method, time range, safe_temp, rest_time, equipment, source_id, jurisdiction |
| knowledge_documents | id, title, source_id, region, language, population, valid/review dates, approval state |
| knowledge_chunks | id, document_id, text, section/page, embedding, embedding_model, dimension/version |
| meal_logs | id, user_id, mode, image_path, status, revision, market snapshot, created_at |
| meal_items | id, meal_id, food/recipe ID, confirmed_g, preparation, portion_source, assumption metadata |
| meal_reports | meal_id, revision, totals, nutrient completeness, evidence IDs, formula_version |
| meal_plans | id, user_id, meal_revision, constraints snapshot, market snapshot, computed totals/cost, status |
| pantry_items | user_id, food_id, usable quantity, unit, user-entered freshness/expiry information |
| chat_sessions/messages | user_id through session, content, evidence IDs, tool events, retention timestamp |

**Avoid unnecessary tables:** Shopping list lines can be computed from a saved plan or stored as versioned JSON for MVP. Add an immutable audit record only for important transformations; do not create enterprise infrastructure prematurely.

**Row Level Security:** Enable RLS on every exposed table and explicitly set grants. Private rows require matching the authenticated user. Child rows check ownership through the parent. Reference-data tables are read-only to clients; ingestion uses a protected server role. RLS and grants work together. [S20]

**Storage:** Use a private bucket and user-scoped paths. Check ownership before issuing a short-lived signed URL or passing image bytes to the model. A guessed object path must not grant access.

**Retention and deletion:** Choose a documented prototype policy, such as removing original images after a limited period unless the user opts to keep them. Implement the cleanup and deletion before claiming it. A policy sentence without a working delete path is incomplete.
