# NutriLens | Frontend Screens and UX Specification


This document is the frontend implementation guide. Build the screens around one complete user journey, with responsive layouts, clear evidence labels and honest data-mode disclosure.


# 19A | Prototype navigation and screen inventory

The first usable web prototype should include these screens. Keep the visual language consistent and do not create separate experiences for every feature before the core journey works.

| Screen | MVP purpose | Key actions/data |
|---|---|---|
| Dashboard | Explain the product and show the user's current context | Current goal, market, budget and recent confirmed meals |
| Food Scanner / Analyze | Capture an image or use manual food search | Image preview, consent, analyze action and demo-image fallback |
| Confirm Foods | Let the user correct AI candidates | Food identity, preparation state, portion grams, oil/sauce and add/remove controls |
| Nutrition Report | Present server-calculated nutrition | Calories, protein, carbohydrates, fat, fibre, data completeness and evidence receipt |
| Bazar Intelligence | Show the market context used for recommendations | Market selector, synthetic price/stock labels, observation timestamps and filters |
| Meal Rescue / Planner | Generate and compare feasible pivots | Cuisine preference, budget, exclusions, time/equipment and nutrient/cost deltas |
| Smart Shopping | Present the selected list | Duplicate merging, pantry deduction, pack count, cash cost and unknown-price lines |
| Profile / Settings | Save user context | Language, units, market, goals, exclusions, declared allergens and budget |

History and contextual chat can be added after the primary flow works. Menu scanning, receipt import and organization administration are not launch blockers.

**Visual direction:** Clean, premium, trust-focused nutrition SaaS interface. Use a calm dark-green/neutral visual system if that remains the team's design choice; readable charts and food imagery should support the task, not overwhelm it. Clearly distinguish measured/database-backed values, AI proposals, user-entered values and synthetic demo market data.


# 20 | Frontend screens and cross-device behavior

| Screen | Main task | Essential states |
| --- | --- | --- |
| Welcome / Settings | Establish market and usable preferences | Missing locale, invalid budget, saved success |
| Analyze | Upload/capture or enter food manually | Empty, progress, unsupported format, failed provider |
| Confirm | Correct food, state and grams | Unmatched food, unknown portion, review questions |
| Report | Understand estimates and next action | Incomplete nutrients, source details, stale report |
| Meal Plan | Compare feasible options | No feasible result, changed constraints, partial prices |
| Shopping | See purchase quantities and cash needed | Pantry deduction, pack rounding, unknown stock |
| Cooking | View supported guidance | Unsupported pair, assumptions, sourced safety endpoint |
| History | Revisit or delete records | Empty history, deletion, access protection |
| Chat | Ask about the current meal or preview a change | Retrieval unavailable, unsupported question, apply action |

**Layout:** Sidebar and content area on wide screens; compact navigation or drawer on narrow screens. Chat becomes an accessible full-screen sheet on mobile. Avoid overlapping the camera/upload control or the main action button.

**Every change must be checked on:** Desktop around 1440 px; laptop around 1280 px; tablet around 768 px; mobile at 360 and 390 px. These are a proposed test matrix, not hardcoded device identities. Also test nearby widths, orientation changes and enlarged text.

**Cross-device regression checklist:** Same essential content and actions; usable navigation; no horizontal overflow; no unusual empty gaps; sensible card widths/heights; chart labels and numbers remain readable; mobile keyboard does not hide submit; long translated text wraps; focus stays inside an open dialog; Escape/back closes it safely; controls have labels and visible focus.

**Accessible communication:** Never rely only on red/green. Pair icons with text. Announce loading/error changes to assistive technology. Tables should have an accessible mobile alternative where necessary. Keep units beside numbers and show complete currency codes when symbols could be ambiguous.

**Internationalization:** Use translation keys in every UI component; localized database content or explicit fallback for recipes; locale-aware numbers, dates and currency; separate language from location; keep measurement conversion deterministic. A translated screen alone does not mean a market is supported.
