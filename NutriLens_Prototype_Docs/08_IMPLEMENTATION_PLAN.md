# NutriLens | Requirements, Milestones and Team Workflow


This document converts the product direction into testable requirements and an incremental build sequence. The team should integrate daily and keep the main branch deployable.


# 14 | Functional requirements: capture and analysis

Write each requirement as a testable behavior. A user story explains the need; acceptance criteria determine completion. P0 means necessary for the main demo; P1 means add only after P0 passes.

| ID / priority | Requirement | Acceptance test |
| --- | --- | --- |
| FR-01 / P0 | Save adult user context, market, language, units and budget | Refresh preserves settings; invalid currency/amount combinations are rejected |
| FR-02 / P0 | Upload JPEG/PNG/WebP with a proposed 5 MB application limit | Valid file reaches private storage; invalid file and MIME mismatch show an actionable error |
| FR-03 / P0 | Identify candidate meal/ingredient items through a real model call | Output validates; ambiguous items remain reviewable; nutrients are absent from vision output |
| FR-04 / P0 | Confirm item identity, preparation and grams | The user can add/delete/edit items; no authoritative calculation occurs before confirmation |
| FR-05 / P0 | Calculate sourced nutrient totals on the server | A hand-calculated fixture matches within declared rounding tolerance; missing data remains unknown |
| FR-06 / P0 | Give meal-level guidance tied to evidence | Every general guidance claim cites approved evidence or is explicitly an observation of this meal |
| FR-07 / P0 | Show evidence and uncertainty | Report displays food source, portion basis, incomplete nutrients and relevant assumptions |
| FR-08 / P1 | Parse a menu image into selectable dish text | User confirms extracted text; hidden ingredients and portions are not asserted as known |

**Example story:** "As a user, I want to correct the AI's rice portion before seeing calories, so the report reflects what I actually ate."

**Given/When/Then:** Given a candidate rice item with uncertain grams, when the user enters 180 g and confirms the cooked-rice record, then the server uses 180 g with that record and marks the portion as user-entered. Editing it again invalidates the previous report version.

**Definition of done for each requirement:** Implemented behavior, loading/empty/error states, accessibility check, relevant automated or manual test, cross-device verification, owner review and documentation update. "The UI exists" does not mean the feature is done.

Keep requirements in the repository with columns for owner, status, test ID, evidence and commit. Do not rename requirements to hide missing work.


# 15 | Functional requirements: planning and support

| ID / priority | Requirement | Acceptance test |
| --- | --- | --- |
| FR-09 / P0 | Rank curated meals under explicit constraints | A feasible result satisfies all hard constraints; impossible requests return reasons |
| FR-10 / P0 | Generate a merged shopping list | Duplicate ingredients merge; pantry quantities subtract; pack rounding is correct |
| FR-11 / P0 | Present local price and stock provenance | Every priced line has currency, unit, date, source and mode; unknown stock is not in-stock |
| FR-12 / P0 | Recompute a meal pivot | Removing an ingredient changes nutrients, quantities and costs consistently |
| FR-13 / P0 | Answer nutrition questions with RAG and meal context | Sources come from retrieved records; unsupported requests get a bounded fallback |
| FR-14 / P1 | Compare a supported cooking method | Yield and retention basis is visible; unsupported pairs show no fabricated comparison |
| FR-15 / P0 | Apply locale and unit settings | Dates, numbers and currency format correctly; internal stored mass remains metric |
| FR-16 / P0 | Save and delete private history | User A cannot read, edit, delete or obtain image URLs belonging to User B |
| FR-17 / P0 | Recover from service failures | Timeout, malformed AI response and quota errors preserve inputs and offer retry/manual entry |
| FR-18 / P0 | Disclose and minimize data handling | Consent precedes model upload; delete removes selected records and images; retention policy is stated |

**Non-functional acceptance targets, proposed:** Primary screens usable from 360 px mobile to 1440 px desktop; no horizontal overflow at supported widths; visible keyboard focus; labeled form errors; adequate contrast; loading feedback immediately after submission; an analysis response target of p95 under 20 seconds on the declared test setup, measured rather than promised.

**Data correctness rules:** Monetary calculations use decimal-safe arithmetic or integer minor units. Unit conversion happens once. Round for display after aggregation. Food and recipe IDs must exist and be allowed; user-supplied IDs do not bypass ownership or source checks.

**SaaS boundary:** One account owns its own history. No subscription billing, organization administration or multi-tenant enterprise role system is required for the hackathon. Developer repository access is separate from end-user application permissions.


# 23 | Twelve-day execution plan

All dates are in Asia/Dhaka. This is a recommended plan based on your 20 November deadline. Each day ends with a visible, integrated result, not six disconnected branches.

| Date | Main outcome | Gate before moving on |
| --- | --- | --- |
| 8 Nov / Day 1 | Scope, roles, API access, repository, deployed shell | Real model call and deployed page work; submission rules checked |
| 9 Nov / Day 2 | Schema, auth, private storage and reviewed seed foods | Two users isolated; all first-demo ingredients mapped; retailer decision made |
| 10 Nov / Day 3 | Photo -> candidates -> editable confirmation | New image processed; manual correction and unmatched-food fallback work |
| 11 Nov / Day 4 | Confirmed foods -> server nutrition report | Hand-calculated tests pass; missing values stay unknown |
| 12 Nov / Day 5 | Budget planner and merged shopping list | Purchase cost, pantry and currency checks pass |
| 13 Nov / Day 6 | Complete first loop on deployed app | A teammate unfamiliar with implementation finishes the journey |
| 14 Nov / Day 7 | RAG chatbot with source links | Approved evidence retrieved; fabricated citations rejected |
| 15 Nov / Day 8 | Meal-rescue pivot and evidence receipt | Constraint change recalculates all dependent values |
| 16 Nov / Day 9 | Narrow cooking feature and second market | Only supported comparisons shown; no fake local prices |
| 17 Nov / Day 10 | Cross-device and security regression | Major errors fixed; no new features after this gate |
| 18 Nov / Day 11 | Evaluation, concept book and video recording | Results are measured; recording reflects the actual build |
| 19 Nov / Day 12 | Final deployment, rehearsal and submission buffer | Links work on another device/network; backup video ready |
| 20 Nov | Provisional internal team milestone from the earlier project brief | Confirm whether this is a team target or an organizer deadline |

**If Day 4 slips:** Reduce data breadth and decorative charts. **If Day 6 slips:** Freeze optional menu/barcode features. **If Day 9 slips:** Replace numerical cooking comparison with sourced guidance and document the limitation. Do not sacrifice the main loop to keep every feature claim.

Reserve time each day for integration and verification. Start the README and concept book on Day 1; do not leave documentation until the final night.


# 24 | Six-person responsibilities and learning

This allocation assumes six members. Assign real names in the team's issue board. Everyone should be able to explain the whole user journey even while specializing.

| Member | Main ownership | First learning task | Handoff |
| --- | --- | --- | --- |
| 1: Product/integration | Scope, requirements, merge coordination, deployment | Git branches, request flow, acceptance tests | Working main branch and daily demo |
| 2: Frontend | Upload, confirm, report, navigation | React components, state, forms, responsive CSS | Screens using shared API contracts |
| 3: Backend | Auth, schema, storage, Edge Functions, RLS | SQL relations, API validation, ownership | Secure endpoints and migrations |
| 4: AI/RAG | Vision schema, retrieval, chatbot, evaluation prompts | Structured output, embeddings, grounded answers | Validated candidate and chat responses |
| 5: Data/planning | Food mapping, prices, recipes, cooking, planner | Units, provenance, recipe math, constraints | Reviewed seeds and deterministic calculations |
| 6: QA/story | User testing, cross-device checks, concept book, video | Test cases, bug reporting, demo narration | Test evidence and honest submission materials |

**Avoid bottlenecks:** Member 1 pairs with backend during integration; frontend uses agreed fixtures before APIs are ready; AI and data owners agree food IDs early; QA participates from Day 2. Documentation/video work does not mean Member 6 waits until the end.

**Suggested daily routine:** A short coordination meeting, focused build time, an integration window, then a demo and blocker review. This is a workflow suggestion, not a required schedule. Adjust to actual availability.

**Git discipline:** One branch per bounded feature; small commits; review before merge; run the relevant checks; commit migrations with code; avoid two people changing shared schema files simultaneously. Main should remain deployable. Keep credentials and private data out of commits and screenshots.

**Minimum learning path:** Web request/response -> React forms/state -> TypeScript types -> SQL tables/keys -> authentication versus authorization -> JSON validation -> deterministic calculation -> retrieval -> testing/deployment. Learn each just before implementing its slice; you do not need to master machine learning first.

**Daily evidence record:** Requirement ID, owner, current status, blocking dependency, test result, demo URL/commit and next action. This becomes the source for the final project report.
