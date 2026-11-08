# NutriLens | Backend API Contracts


These are application-level Supabase Edge Function contracts, not third-party provider endpoints. Keep request and response types in a shared TypeScript contract module so frontend and backend use the same schemas.


# 18 | Backend API contracts

These are your application's proposed interfaces, not provider endpoints. Put shared types in src/contracts or a small shared package imported by frontend and functions.

| Function | Input | Output |
| --- | --- | --- |
| analyze-meal | owned image_path, input_mode, language, market_id | analysis_id, candidates, review questions, schema_version |
| search-foods | query, market, language, preparation filter | verified candidates with source and supported units |
| calculate-nutrition | meal_id, expected_revision, confirmed food IDs and grams | report_id, new revision, totals, completeness, evidence IDs |
| plan-meals | meal/report revision, budget, currency, people, duration, constraints | status, feasible options, nutrient/cost deltas, shopping list, reasons |
| cooking-info | supported food/recipe IDs, method, input basis and grams | supported flag, output basis, factors, estimates, sourced guidance |
| chat | session_id, message, current report/plan ID | reply_text, citations, value_refs, proposed_action, limitations |
| delete-meal | meal_id | deletion result covering dependent records and owned image |

**Shared validation:** Verify authentication, ownership, request size, allowed enum values and numeric bounds. Load the user's authoritative saved constraints on the server rather than trusting everything sent by the browser. Return server-calculated totals only.

**Success envelope:** request_id, schema_version, data, warnings, provenance. **Error envelope:** request_id, error.code, error.message, retryable. Do not return provider credentials or raw internal stack traces.

| Code | Behavior |
| --- | --- |
| INVALID_INPUT / 400 | Explain the field to correct |
| UNAUTHENTICATED / 401 | Restore login without losing draft inputs |
| FORBIDDEN / 403 | Reveal no information about another user's resource |
| VERSION_CONFLICT / 409 | Refresh or explicitly reconcile an edited meal |
| UNSUPPORTED_FOOD / 422 | Offer reviewed food search or manual entry |
| RATE_LIMITED / 429 | Explain when retry is appropriate; do not loop forever |
| PROVIDER_UNAVAILABLE / 503 | Preserve draft and offer the documented fallback |

**Reliability:** Use bounded timeouts, one schema-repair attempt and bounded retry for transient failures. An idempotency key avoids duplicate costly jobs from double taps; store the original result for repeated identical requests. A request ID links logs without exposing personal data.
