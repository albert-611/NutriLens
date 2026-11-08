# NutriLens | End-to-End Prototype Demo


Use fictional adult demo accounts, reviewed food records, a supported meal photo and synthetic market snapshots. The video and live demo must match the actual build and disclose simulated market data.


# 31 | End-to-end demo script and judge explanation

## Demo setup

Use a fictional adult profile, a selected Bangladesh demo market, a clear meal/ingredient photo, one reviewed recipe option and synthetic market observations. Do not use real personal health data. Confirm all demo foods, portions and seed values before recording.

## Suggested 3–4 minute walkthrough (confirm the organizer's time limit)

1. **Set context:** Show the adult profile, preferred cuisine, general goal, demo market and exact budget.
2. **Capture:** Upload a meal/ingredient image. Explain that the AI identifies candidates, not final nutrient values.
3. **Confirm:** Correct a food match and portion amount; select the correct preparation state.
4. **Calculate:** Show calories, protein, carbohydrate, fat and fibre from the confirmed data records. Open the evidence receipt to show source and assumptions.
5. **Improve:** Ask for a culturally familiar meal pivot that respects the budget and exclusions.
6. **Shop:** Show the selected recipe, merged shopping list, pantry deduction (if enabled), purchase units and total cash estimate.
7. **Disclose:** Point out the `SIMULATED DEMO DATA` label and observation timestamp for market prices/stock.
8. **Explain RAG:** Ask why the alternative was suggested and open its supporting source.

## Judge-facing explanation

"NutriLens uses a multimodal model to propose visible food candidates. The user confirms the food, preparation and portion. Our backend calculates nutrition from reviewed food records rather than asking the language model to invent values. It then checks curated local recipes and dated market observations against the user's preferences and budget, and generates a shopping list. In this prototype, market records are clearly labeled synthetic demo data; our data adapter is designed to accept permitted retailer data later."

## Do not say

- "The photo precisely measures calories" — the image cannot establish exact grams or hidden ingredients.
- "These are live prices/stock" — not while `synthetic_demo` records are being used.
- "The app detects nutrient deficiency or predicts glucose" — it does not.
- "All allergens are guaranteed absent" — image/menu evidence cannot establish cross-contact or hidden composition.
- "We support every country" — only validated market packs are supported.
- "Our model is trained on proprietary nutrition data" — the MVP uses an existing model, approved retrieval and deterministic code.
