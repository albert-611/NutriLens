# NutriLens Prototype Documentation Pack

**Version:** 1.0  
**Prepared:** 8 November 2026  
**Purpose:** Build the first functional NutriLens hackathon prototype using a seeded dummy database.

## What NutriLens is

NutriLens is a Bangladesh-first Nutrition Intelligence web prototype. It demonstrates this complete workflow:

**Food photo → AI food candidates → user confirmation → database-backed nutrition report → local market lookup → personalized meal pivot → shopping list.**

The prototype uses real multimodal AI for food recognition, but all authoritative nutrition, purchase quantity, and cost calculations must be performed by TypeScript backend code using reviewed database records. Demo market prices and stock are synthetic and must be labelled **SIMULATED DEMO DATA**.

## Agreed stack — do not silently change

- Frontend: React + Vite + TypeScript + Tailwind CSS.
- Backend services: Supabase Edge Functions (TypeScript).
- Database: Supabase PostgreSQL.
- Authentication: Supabase Auth.
- Image storage: private Supabase Storage bucket.
- AI: Gemini API for image recognition and grounded chat.
- RAG: PostgreSQL + pgvector.
- Frontend hosting: Vercel.
- Shared validation: Zod; localization: i18next; source control: Git/GitHub.

Do not add Next.js, Express, MySQL, MongoDB, Pinecone, a Python backend, microservices, custom model training, or autonomous multi-agent orchestration to this MVP.

## Prototype feature lock

### Build in the first prototype

1. Bangla Plate Intelligence: identify common supported Bangladeshi meals/ingredients from a photo and allow correction.
2. Bazar-to-Plate AI: use a dummy Savar/Ashulia market dataset to compare locally familiar food options.
3. Nutrient Gap Optimizer: describe meal-level opportunities against declared goals; never diagnose a deficiency.
4. Constraint-Aware Meal Rescue / Nutrition Negotiator: preserve cuisine preferences while respecting budget, time, equipment and exclusions.
5. Cuisine-Preserving Substitution: replace an ingredient with a familiar alternative and recalculate the meal.
6. Smart Shopping Basket: merge quantities, subtract declared pantry items, round to demo pack sizes and calculate estimated checkout cost.
7. Evidence Receipt: show food source, preparation state, portion basis, formula version, price timestamp and data mode.
8. Basic RAG Nutrition Assistant: answer from approved knowledge excerpts and the current confirmed meal/plan, with citations.

### Excluded from this prototype

- Climate-to-Nutrition Intelligence.
- AI Food Waste Rescue.
- Glucose telemetry, wearable integrations, metabolism measurement or prediction.
- Custom model training/fine-tuning or custom vision training.
- Autonomous multi-agent orchestration.
- Receipt OCR, household/family fairness planner, native mobile apps, subscriptions, enterprise admin, multi-tenant organization roles and full retailer integration (unless retailer access is already confirmed).

### Optional only after the core loop passes

Menu-photo parsing, pantry-first subtraction, What-If Simulator, Market Shock Preview, Best Next Question and a narrow sourced cooking comparison.

## Read the files in this order

| Order | File | Use |
|---:|---|---|
| 1 | `01_PRODUCT_SCOPE.md` | Problem, challenge mapping, user journey, feature priorities and exclusions |
| 2 | `02_ARCHITECTURE_AND_STACK.md` | Stack, component boundaries, providers and repository workflow |
| 3 | `03_DATABASE_AND_DUMMY_DATA.md` | PostgreSQL schema, seed data, provenance and demo records |
| 4 | `04_API_CONTRACTS.md` | Frontend/backend function inputs, outputs and error model |
| 5 | `05_AI_NUTRITION_AND_RAG.md` | Vision contract, nutrition arithmetic, planner rules and RAG |
| 6 | `06_FRONTEND_UI_UX.md` | Screens, interactions, responsive behavior and visual direction |
| 7 | `07_SECURITY_TESTING_AND_DEPLOYMENT.md` | Privacy, access control, tests, deployment and fallbacks |
| 8 | `08_IMPLEMENTATION_PLAN.md` | Acceptance requirements, milestones and team responsibilities |
| 9 | `09_DEMO_SCRIPT.md` | Reproducible judge demo and truthful claims |
| 10 | `10_ANTIGRAVITY_PROMPTS.md` | Phase-by-phase prompts to give the coding agent |
| Reference | `NutriLens_MASTER_PROJECT.md` | Full single source of truth; this pack is organized for implementation |

## Mandatory implementation rules

1. Start database-first. Build Supabase migrations and repeatable dummy seed data before relying on frontend mock arrays.
2. AI proposes; the user confirms. Never calculate authoritative nutrition from unconfirmed vision output.
3. Backend code calculates all nutrient totals, purchase quantities and cash costs. The LLM may explain results but must not invent them.
4. Preserve unknown nutrient values, unclear portions, missing prices and unknown stock as unknown. Do not turn `NULL` into zero.
5. Every synthetic market observation must use `data_mode = 'synthetic_demo'` and display a clear UI label and observation timestamp.
6. Store mass in grams and money in a decimal-safe representation or integer minor units. Format units/currency only at the UI boundary.
7. Every food/recipe/nutrient/knowledge record needs provenance and review status.
8. Keep Gemini, USDA and Supabase privileged credentials on the server only. Do not commit `.env` files or real secrets.
9. Keep the application general-wellness only. No diagnosis, medical prescription, glucose prediction, clinical claims or guaranteed allergen absence.
10. Implement one requirement at a time. Review the plan, changed files, validation, tests and responsive UI before moving to the next phase.

## First implementation task

Complete **Phase 1: PostgreSQL schema + dummy seed data**. The phase is complete only when migrations can be applied from a clean Supabase project, seed data can be loaded repeatedly, every demo recipe ingredient maps to a food record, synthetic market rows are labelled correctly, and data-integrity checks pass.

## Project status conventions

Use `NOT STARTED`, `IN PROGRESS`, `BLOCKED`, `IN REVIEW`, and `DONE`. A requirement can be `DONE` only when its acceptance test passes. Never represent a planned feature as already implemented.
