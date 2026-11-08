# NutriLens | Security, Testing and Deployment


Use this document to secure the prototype, verify correctness and publish a repeatable demo. The security and correctness requirements apply even when all market records are synthetic.


# 21 | Security, privacy and reliability

**Secret handling:** Gemini, USDA and privileged Supabase keys live only in server secrets. The frontend may use the Supabase URL and publishable/anon key with appropriate RLS. Anything exposed through a VITE_ environment variable is public browser configuration. Keep .env files out of Git and commit only names in .env.example. [S05, S20]

**Authorization:** Check the session and object ownership for every private operation, including signed image URLs and chat retrieval. Never trust a client-supplied user_id. A service-role client bypasses RLS; restrict its use and scope every privileged query deliberately. [S06]

**Uploads:** Check byte size, content type and actual file signature. Re-encode images to remove unnecessary metadata where practical. Do not fetch arbitrary image URLs supplied by users; accept owned storage objects to reduce server-side request risks.

**Provider privacy:** The documented Gemini terms distinguish paid and unpaid data handling, restrict clinical use and set age/region conditions. For a hackathon, use fictional adult profiles and non-sensitive meal images. Before accepting real personal or health information, review the selected service terms and user consent; a paid plan is not by itself proof of regulatory compliance. [S22]

**Minimum data:** Do not collect diagnoses, blood tests, exact GPS or date of birth merely to show personalized meal suggestions. City-level market choice and adult confirmation are adequate for the scoped demo. Keep declared allergy handling server-side where possible instead of sending a full health profile to the model.

**Logging:** Log request ID, status, timing, model/version and token usage. Avoid image contents, secrets, personal chat text and health fields in general logs. Do not claim zero retention if the selected provider has its own logging policy.

**Abuse and cost:** Enforce per-user limits, payload limits and a maximum number of model/tool calls. Deduplicate repeated image jobs. Cache public guidance and stable food records. Mark cached or historical market information accurately.

**Failure behavior:** Preserve user edits; allow manual selection; provide bounded retries; return clear unsupported-data messages. Never replace a failed live request with an unlabeled fabricated result.


# 25 | Evaluation and traceability

Do not report model accuracy before measuring it. The following evaluation set and thresholds are proposed acceptance targets for this prototype, not observed results or clinical validation.

**Suggested visual set:** 30 team-owned or permitted inputs: 10 simple ingredient images, 10 local plated meals, 5 mixed/ambiguous dishes and 5 difficult or invalid inputs. If menu mode ships, add a separate small menu set. Keep some examples out of prompt development for a modest holdout test.

**Ground truth:** Record the known ingredients and preparation state. Weigh portions when assessing quantity error. Without weighed references, do not claim calorie-estimation accuracy; evaluate identification and the correction experience instead.

| Test area | Method | Proposed pass condition |
| --- | --- | --- |
| Nutrient math | Known fixture values, mixed units, missing entries | Exact logic with tolerance only for rounding |
| Budget | Loose goods, pack rounding, pantry, unknown prices | All declared feasible plans satisfy the computed cash budget |
| Allergens | Known exclusions and unknown ingredient composition | No known excluded ingredient in a feasible suggestion; unknown remains unverified |
| Vision | Compare detected candidates to reference items | Report recall and correction burden; no arbitrary accuracy claim |
| RAG | 10 answerable and 10 unsupported/conflicting questions | Retrieved evidence supports claims; unsupported cases are acknowledged |
| Security | User A/B reads, writes, deletes and image URL requests | All unauthorized access blocked |
| Resilience | Timeout, malformed JSON, duplicate tap, stale edit | Draft preserved; no duplicate spend/job; no fabricated fallback |
| UX | Primary task on desktop/laptop/tablet/mobile | Every core action works, with no blocking overflow or focus failure |
| Performance | Record at least 20 end-to-end runs on stated setup | Report median/p95 and failure count; compare with the chosen target |

**Traceability examples:** FR-04 -> Confirm screen -> calculate-nutrition -> T-CONFIRM-01; FR-10 -> Shopping screen -> planner -> T-PACK-02; FR-13 -> Chat -> retrieval/citation validator -> T-RAG-03; FR-16 -> History/Storage -> RLS -> T-ACCESS-01.

**Error metrics:** Food identification precision/recall; portion mean absolute error in grams where measured; macro error in grams where a valid reference exists; user-correction rate; feasible-plan rate; evidence support rate; completion rate. Avoid percentage error for nutrients near zero.

**Report format:** Setup, sample definition, test date, software/data/model versions, results, failures and limitations. "All five demo photos passed" is a narrow demo result, not a general accuracy estimate.


# 26 | Deployment, costs and fallback

**Deployment sequence:** Create Supabase project -> apply reviewed migrations and grants -> load approved seeds -> configure private storage -> set server secrets -> deploy and test functions -> build frontend -> configure public frontend variables -> deploy -> verify deep-link refresh and authentication redirects -> run the complete journey from another device.

**Environment separation:** Development uses test profiles and safe fixtures. The demo deployment contains only necessary accounts/data. Keep a known-good commit and data snapshot. Document the deployment steps so a second teammate can reproduce them.

**Required checks before final deploy:** Type checking, production build, calculation tests, budget/constraint tests, auth/RLS tests, retrieval/citation checks and the core browser journey. Use a fast test runner for pure functions and a browser test tool where the team can maintain it. Do not add complex infrastructure only for appearances.

**Cost planning:** Actual expense depends on current model rates, input/output tokens, image processing, embeddings, database/storage usage, hosting plan and retailer access. Free tiers and credit availability are not guaranteed. Check your account dashboards and provider pricing on Day 1. [S24]

```text
estimated AI cost = input usage * input rate
                 + output usage * output rate
                 + embedding usage * embedding rate
total project cost = AI + hosting/database + storage/egress
                   + any licensed data/API fees
```

Use the provider's billing units consistently. Do not assume one image equals a fixed number of billable tokens. Measure a representative request and multiply by planned test volume. Include retries when estimating.

**Team spending control:** Choose a hard experimental budget before enabling paid usage. For example, a US$30 cap would be a team spending decision, not a prediction of the bill. Add app-side request limits and billing alerts; alerts alone may not stop spending.

**Demo fallback:** Keep permitted sample images and a recorded successful run. If live vision fails, enter confirmed foods manually and continue using real calculations. If price data is a snapshot, show its date. If the entire demonstration is recorded, state that plainly.

**Operational record:** Model IDs, data versions, application commit, build time, evaluation results and any cached sample status. Update the documentation when behavior changes; do not present plans as shipped features.
