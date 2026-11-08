# NutriLens | Product Scope and Challenge Requirements


This document defines what the prototype is, who it serves, how it maps to the Nutrition Intelligence challenge, and what the team is allowed to build. It is the scope guardrail for product, design and engineering.


# 00 | Challenge fit and build guardrails

| Challenge expectation | Proposed implementation | Honest limitation |
| --- | --- | --- |
| Multimodal input | Real image-capable model for ingredients and meals | Menu mode is a stretch feature; one supported image mode completes the basic loop |
| Personalized report | User-confirmed portions, preferences and constraints | No measurement of metabolism or prediction of individual glucose response |
| RAG and regional guidance | Approved excerpts, retrieval and validated citations | Small, reviewed corpus with explicit population and country coverage |
| Local market connection | Dated local prices and a retailer-adapter interface | Snapshots are not live stock; a simulation proves behavior, not real availability |
| Actionable output | Meal pivot and consolidated shopping quantities | Limited curated recipes and reviewed pilot markets |
| International ambition | Locale-independent logic and market packs | Coverage grows only when new data and behavior are tested |

**Prototype data-mode decision:** Version 1 uses a dummy Bangladesh market database with synthetic price and stock observations. Every market result must show a visible "SIMULATED DEMO DATA" label and an observation timestamp. Do not say prices or stock are live. Keep a retailer-adapter interface so one authorized store feed can replace the simulator later. If the organizer confirms that live inventory is mandatory, pursue a permitted retailer feed early; the dummy database alone will not satisfy a live-inventory requirement.

**Instructions for the coding assistant and team:** Read this specification before implementation. Work one requirement at a time, propose a short plan, review its scope, then implement and explain it. Do not change the agreed stack or add major dependencies without team review.

- Keep provider and privileged credentials only on the server; use .env.example for names, never real keys.
- Require food and portion confirmation before authoritative nutrition calculations.
- Calculate nutrition, purchase quantities and cost in code from reviewed records; never accept invented AI numbers.
- Validate AI JSON, identifiers, user inputs and business constraints. Retry malformed AI output once, then fail clearly.
- Store quantities in metric units; render the user's selected units, language and currency without hardcoded country logic.
- Preserve unknown nutrients, unsupported foods, missing prices and uncertain stock as unknown.
- Cite data and cooking evidence; use general meal guidance without medical diagnosis or guarantees.
- Protect every private row, image and function; implement deletion and consent as real behavior.
- Include loading, empty and error states; verify desktop, laptop, tablet and mobile on every completed feature.
- Keep every claim in the UI, documentation and video aligned with the tested build and actual data mode.


# 00A | Challenge brief translated into product requirements

## Challenge category

**Nutrition Intelligence — Personalized, localized nutrition guidance.** The supplied challenge asks for a functional AI prototype demonstrating a Vision-to-Market loop: a user captures an image of ingredients or a menu, and the system generates a personalized nutritional report plus a localized shopping list or dietary pivot.

The challenge emphasizes multimodal AI, individual preferences and nutritional goals, regional food knowledge, market availability/prices, and culturally aware coaching. NutriLens implements a feasible subset in a transparent, testable prototype rather than claiming full clinical or global coverage.

| Challenge requirement from the brief | NutriLens implementation | Prototype boundary |
|---|---|---|
| Image input for ingredients or meals | Gemini vision proposes visible food candidates | Food identity and portions must be user-confirmed |
| Menu-photo understanding | Optional menu text extraction into selectable dishes | Stretch feature; hidden ingredients are not inferred as fact |
| Personalized nutrition report | User profile + confirmed portions + sourced food records | General adult guidance; no diagnosis or metabolic measurement |
| Localized food knowledge | Bangladesh-first aliases, recipes and food composition records | Coverage is limited to reviewed seeded foods |
| Market connection | Dummy market prices and inventory observations | Synthetic demo data, not real-time availability |
| Dietary pivot | Curated recipe/ingredient alternatives ranked by constraints | A small candidate set, not a globally optimal diet plan |
| Shopping list | Purchase quantities, pack rounding and cost calculation | Unpriced items remain visibly unpriced |
| RAG and regional guidance | Reviewed documents, vector retrieval and source-linked answers | Small approved corpus with explicit coverage labels |

## User-provided challenge examples treated as inspiration

The original challenge mentions: regional produce recognition and seasonal high-protein meal suggestions; RAG over glucose telemetry and traditional cuisines; budget-aware meal generation using supermarket discounts; multi-agent behavioral and culinary coaching; and hidden-ingredient analysis for sensitivities. These examples are not all mandatory requirements. NutriLens will not build glucose telemetry, clinical sensitivity prediction, a custom fine-tuned model or a multi-agent system in the MVP.

## User-provided data sources to consider

- **USDA FoodData Central:** candidate source for structured nutrient profiles.
- **Edamam Nutrition Analysis API:** optional recipe/text nutrition service; defer unless access and terms are verified.
- **Open Food Facts:** optional packaged-product ingredient and label source; not a substitute for cooked-dish data.
- **Nutritics API:** possible localized food-data source; access and commercial terms must be checked.
- **Kaggle Global Food Prices Database:** historical/reference price input only after inspecting the exact dataset, dates, units and provenance; not proof of live local retail stock.
- **Bangladesh Food Composition Table / FAO materials:** candidate local reference material; keep publication date, source, methods and reuse permissions visible.

The MVP should use a small, reviewed, repeatable seed import. Do not integrate every named API merely because it appears in the challenge brief. A data source is only used after its records, permissions, country coverage, units and preparation states have been checked.

## Competitors and product examples supplied by the team

ZOE, Lumen, Season Health, Whisk (Samsung Food) and Suggestic were named in the user-provided challenge brief as examples of adjacent products. Treat them as inspiration and category context only. Do not claim NutriLens has equivalent capabilities, clinical validation, commercial partnerships or a unique market position without separate evidence.

## B2B2C product model

**Potential buyer:** An organization that wants to provide better food guidance around meals it serves or recommends: a university/hostel dining operator, workplace cafeteria, food-service business or nutrition/wellness provider.

**End user:** An adult diner, student, employee or client who scans a plate/menu or selects ingredients, confirms portions and receives a personalized meal pivot and shopping guidance.

**Value to the organization (future product direction):** Make menu information more actionable, support ingredient substitutions, understand anonymized meal-option interest, and help users make choices within declared preferences and budgets. Any organization-level reporting must be privacy-preserving and separately consented.

**MVP limitation:** Use one demo organization/market context at most. Do not build enterprise multi-tenancy, organization-level permissions, billing or staff administration during the prototype. The working journey is still demonstrated through an individual adult profile.


# 00B | Product principles and scope decisions

1. **Local-first, globally extensible:** Bangladesh is the first complete market pack. Do not imply that every country or local market is supported.
2. **Vision proposes; the user confirms:** Image recognition is not authoritative food identification or portion measurement.
3. **Code calculates:** The backend calculates nutrients, purchase quantities and costs from reviewed records. The LLM may explain results but cannot invent numeric values.
4. **Evidence accompanies advice:** Show source, food state, portion basis, market observation time and simulated/live mode.
5. **Unknown stays unknown:** Missing nutrients, unclear preparation, uncertain stock and missing prices are not silently converted to zero, safe, available or free.
6. **Affordability is a hard constraint:** Respect the submitted amount, currency, number of people and duration. Explain when no feasible result exists.
7. **Cultural fit matters:** Prefer familiar Bangladeshi ingredients and recipes when they satisfy the user's hard constraints.
8. **No medical claims:** The product supports general food decisions; it does not diagnose deficiencies, predict glucose response or replace a qualified professional.
9. **Prototype honesty:** Synthetic prices, sample accounts and recorded fallback outputs must be labeled.
10. **One complete loop beats many disconnected features:** Finish and test the Vision-to-Market journey before adding optional modules.

## Explicitly excluded from this hackathon prototype

- **Climate-to-Nutrition Intelligence** — excluded from the selected prototype feature set.
- **AI Food Waste Rescue** — excluded from the selected prototype feature set.
- Glucose telemetry, wearable integrations and metabolic measurement.
- Custom model training/fine-tuning, custom computer vision training and clinical prediction.
- Autonomous multi-agent orchestration, native mobile apps, subscriptions and a complex enterprise admin system.

These exclusions do not prevent future research after the hackathon, but they must not appear as implemented MVP features or be used in the demo claims.


# 02 | Product definition and validation

**Primary user:** An adult who wants a better meal but has limited money, local ingredient choices, time or cooking equipment. Start with one concrete scenario: a student or working adult planning the next meal from a pantry photo.

**Problem hypothesis:** People may understand that they should eat better but still struggle to convert advice into something they can buy and cook locally. This is a hypothesis to test, not a measured market finding.

**Core job:** "Given what I have, what I prefer and what I can spend, help me decide what to eat next and what to buy."

**B2B2C framing:** Organizations may be the paying customer in a future deployment, while adults using the service are the direct beneficiaries. The first prototype proves the end-user experience in one demo environment, not an enterprise multi-tenant product.

**Success for the prototype:** A judge can upload an unfamiliar but supported meal, correct the food and portion, see sourced estimates, change a budget or ingredient constraint, and receive a recalculated plan and shopping list.

**Personalization in this version:** Country and city, preferred cuisine, language, units, dietary exclusions, declared allergens, household size, available ingredients, time, equipment and a general goal. Optional user-supplied targets must be labeled as such. Do not claim to measure metabolism or individual glucose response.

**User research to do during the build:** Run five short interviews as a proposed discovery exercise, not a statistically representative study. Ask what the person ate yesterday, how they decided, their latest shopping difficulty, their available kitchen equipment and which result they would trust. Do not lead with "Would you use our amazing app?"

**Prototype test:** Give each participant the same task: analyze a meal, correct one item, make an affordable change and find its shopping list. Record completion, confusing steps, corrections and whether the displayed evidence was understood. Report actual results only after testing.

**Product boundary:** General adult food guidance. No disease treatment, clinical prescriptions, deficiency diagnosis, medication changes, glucose prediction, food-safety certification or guaranteed allergen absence. Avoid collecting blood tests and medical records during this hackathon.

**International strategy:** One reusable codebase with validated market packs. Start with Bangladesh plus a lighter second pack. A market pack contains foods, local aliases, recipes, price observations, language support and guidelines. New retailer authentication or a new regulatory workflow may still need code; adding every country is not always only adding rows.


# 03 | Scope that can fit 12 days

MVP means the smallest version that completes the user journey. All numbers below are planning targets, not completed work or promised accuracy.

| Priority | Build | Completion evidence |
| --- | --- | --- |
| Must | Ingredient/meal image upload and manual entry | A real model call produces candidates; manual fallback works |
| Must | Confirm food, preparation state and portion | The user can correct every item before calculation |
| Must | Calories, protein, carbs, fat and fibre | Server calculates from selected data records |
| Must | Meal-level improvement suggestion | The recommendation explains its assumptions and source |
| Must | Budget-aware meal pivot and shopping list | Changing the budget recomputes quantities and costs |
| Must | Contextual chatbot with retrieval and citations | Answers use approved documents and computed meal data |
| Must | Country, currency, language and coverage labels | Settings change the relevant data and formatting |
| Must | Privacy, validation, error states and deployed demo | Two-user isolation and the primary journey pass |
| Should | A narrow cooking comparison | One or two sourced food/method pairs work correctly |
| Should | Pantry subtraction and substitutions | Items already owned reduce quantities to buy |
| Stretch | Menu-photo mode | OCR text is confirmed; recipe assumptions remain visible |
| Stretch | Real retailer adapter | Only if approved access works by Day 2 |
| Later | Multi-day optimization, receipt import, household fairness | Add after the core loop is evaluated |

**Do not spend these 12 days on:** model fine-tuning, custom computer vision training, a separate vector database, native Android/iOS apps, multiple autonomous agents, wearables, subscription billing or a complex admin dashboard.

**Cut order if behind:** Second-country depth, menu mode, barcode integration, advanced cooking charts, then visual polish. Preserve confirmation, arithmetic, a sourced report, a local-price shopping list, RAG and the deployed core journey.

**Suggested data ceiling:** About 40-60 well-checked food records, 12-20 recipes, a small set of price observations covering every demo ingredient, 15-25 approved knowledge excerpts and two cooking comparisons. Grow only after these are correct. The original proposal of roughly 150 global foods plus 100 local entries risks consuming the data team's time before the loop works.


# 13 | Approved feature portfolio and differentiators

These features are the agreed NutriLens direction. Their value is in the integrated workflow, not in claiming that no other product offers them. Prioritize a small number and demonstrate them completely.

## Core prototype features (P0)

| Feature | What it does | How it is demonstrated |
|---|---|---|
| **Bangla Plate Intelligence** | Recognizes familiar Bangladesh meals and visible components, supports Bangla/English aliases, and maps candidates to reviewed food/recipe records | Upload a meal photo; AI suggests rice, dal, fish, vegetables or another supported dish; user confirms the match and portion |
| **Bazar-to-Plate AI** | Converts food goals, preferences and budget into realistic options from the local market dataset | User chooses Savar/Ashulia demo market, budget and cuisine; planner checks seeded market observations |
| **Nutrient Gap Optimizer** | Finds meal-level opportunities against a declared goal or selected target and translates them into possible food additions/substitutions | Report explains a practical adjustment and the nutrient/cost delta; it does not diagnose a deficiency |
| **Constraint-Aware Meal Rescue / Nutrition Negotiator** | Balances user goal, cuisine preference, food exclusions, time, equipment, pantry and budget | User says "keep my cuisine and stay within this budget"; the engine ranks feasible curated alternatives |
| **Cuisine-Preserving Substitution** | Recommends familiar alternatives rather than replacing a local meal with unrelated foods | Swap an ingredient or meal component; recalculate nutrients, purchase quantities and cost |
| **Smart Shopping Basket** | Converts the selected plan into merged purchase lines, deducts pantry quantities and rounds to actual dummy pack sizes | Show required quantity, already-owned quantity, purchase quantity, pack count and cash checkout estimate |
| **Evidence Receipt** | Explains how the report and recommendation were produced | Expand a result to see food data source, preparation state, portion assumption, formula/version, price timestamp and simulated-data label |
| **RAG Nutrition Assistant** | Answers questions using approved nutrition/recipe guidance and the user's confirmed meal/plan context | Ask "Why this swap?" and receive a grounded answer with valid source links; unsupported questions receive a limitation response |

## Secondary features (P1, only after the core loop works)

| Feature | What it does | Scope control |
|---|---|---|
| **Best Next Question** | Asks a useful follow-up such as "Was this fried or boiled?" when the answer materially changes the calculation | Rule-based question selection is enough; no autonomous agent is needed |
| **Nutrition What-If Simulator** | Lets users change a portion or ingredient and preview nutrient and cost changes | Recalculate from source records; clearly label simulated market changes |
| **Market Shock Preview** | Lets a judge/user toggle a demo item as unavailable or change its price and see a feasible substitute | This is a controlled scenario simulation, not a climate module or live market prediction |
| **Pantry-First Planning** | Uses food the user already owns and reports only the additional shopping requirement | Keep quantities and units explicit; do not assume an item is in the pantry unless entered |
| **Menu Scanner** | Extracts menu text and lets a user select a dish for further review | Stretch mode; unknown hidden ingredients, sauces, oil and portions stay unknown |

## Later roadmap (not required for the hackathon)

- Same Meal, Different Nutrition: one shared family meal with different serving suggestions for adult profiles.
- Receipt-to-Nutrition: parse a grocery receipt, ask the user to verify items, and update the pantry/spending record.
- Broader retailer integrations and additional market packs.
- Organization dashboard for a cafeteria, university/hostel or workplace food-service buyer.
- More comprehensive recipe coverage and professionally reviewed guidance.

## Priority decision

Build the first end-to-end workflow using Bangla Plate Intelligence + Bazar-to-Plate AI + Nutrient Gap Optimizer + Constraint-Aware Meal Rescue + Smart Shopping Basket + Evidence Receipt. The RAG assistant should be integrated once the approved knowledge corpus is prepared. Add What-If or Menu Scanner only after the must-have flow passes acceptance tests.

## Recommended judge demo story

1. A user selects an adult demo profile, Bangladesh market, cuisine preference and exact budget.
2. The user uploads a photo of a familiar meal or ingredient set.
3. Gemini proposes food candidates; the user corrects one item, chooses the correct preparation state and confirms portion grams.
4. The backend retrieves reviewed food records and calculates nutrition.
5. The app displays an evidence receipt, including portion assumptions and incomplete values.
6. The user asks NutriLens to improve the meal while keeping the cuisine and staying within budget.
7. The deterministic planner filters curated recipes, checks exclusions and market observations, then ranks feasible options.
8. The user selects an alternative and sees recalculated nutrients, quantities and a merged shopping list.
9. The UI clearly identifies all prices/stock as synthetic demo observations, not live market data.

**What makes this more than a calorie counter:** The system moves from visual understanding to a confirmed, sourced calculation and then to a practical purchase decision. The output is actionable, localized and budget-aware.

**What not to claim:** Global superiority, unique worldwide capabilities, medical-grade accuracy, guaranteed allergen safety, live inventory when using dummy data, or a custom-trained nutrition model.


# 28A | Final scope lock and implementation rules

The following scope lock applies to the first hackathon prototype:

- **Build now:** Food image upload; Gemini candidate recognition; manual food search; user confirmation of identity/preparation/grams; deterministic nutrition calculation; Bangladesh-first food aliases and recipes; synthetic Savar/Ashulia market observations; constraint-aware meal rescue; cuisine-preserving swaps; budget-aware shopping list; evidence receipt; basic RAG answers with citations; responsive web deployment.
- **Add only after the core flow passes:** What-if portion/ingredient changes, market shock simulation, pantry-first subtraction, rule-based best-next-question and menu-photo parsing.
- **Do not build in this prototype:** Climate-to-Nutrition Intelligence, AI Food Waste Rescue, glucose/wearable telemetry, metabolic prediction, custom model training, autonomous multi-agent workflow, receipt OCR, family fairness/household planner, full retailer integrations unless access is already confirmed, multi-tenant enterprise administration, billing or native mobile apps.

**Stack lock:** React + Vite + TypeScript + Tailwind; Supabase Auth/Postgres/Storage/Edge Functions; Gemini API; pgvector; Vercel. A change requires a written reason, impact review and team approval. Do not silently switch to Next.js, Express, MySQL, MongoDB or another backend architecture.

**Database-first rule:** Finish reviewed migrations and repeatable dummy seed data before implementing complex UI logic. Build against the agreed API contracts and database records, not hardcoded frontend arrays.

**AI boundary:** AI proposes foods and explanations. The backend validates IDs, reads nutrient/market records, applies rules and performs all authoritative calculations. A malformed or unavailable AI response must not cause the app to invent food, nutrient or market data.

**Truthful demo rule:** Clearly mark synthetic price and stock rows; distinguish snapshots from live inventory; disclose portion assumptions; do not claim clinical validation, global coverage or accuracy that has not been measured.
