# NutriLens | Prototype Requirement Checklist

Track this file in GitHub Issues or update the status column during development. A feature is not `DONE` until its acceptance test passes on the deployed or agreed test environment.

| ID | Requirement | Priority | Owner | Status | Evidence / test |
|---|---|---|---|---|---|
| P-01 | Scope lock, repo, deployment shell and provider access verified | P0 | | NOT STARTED | |
| P-02 | PostgreSQL migrations apply from clean project | P0 | | NOT STARTED | |
| P-03 | Seed script is repeatable and integrity checks pass | P0 | | NOT STARTED | |
| P-04 | Demo users and RLS isolation work | P0 | | NOT STARTED | |
| P-05 | User profile, market, language and budget persist | P0 | | NOT STARTED | |
| P-06 | Image upload requires consent and validates file | P0 | | NOT STARTED | |
| P-07 | Gemini returns schema-valid food candidates | P0 | | NOT STARTED | |
| P-08 | Manual food search and correction work | P0 | | NOT STARTED | |
| P-09 | Food identity, preparation and grams are confirmed before calculation | P0 | | NOT STARTED | |
| P-10 | Backend nutrition arithmetic passes fixtures | P0 | | NOT STARTED | |
| P-11 | Unknown nutrients remain unknown | P0 | | NOT STARTED | |
| P-12 | Evidence Receipt exposes data source and assumptions | P0 | | NOT STARTED | |
| P-13 | Constraint-aware planner enforces hard constraints | P0 | | NOT STARTED | |
| P-14 | Cuisine-preserving substitutions recalculate totals | P0 | | NOT STARTED | |
| P-15 | Shopping list merges quantities and rounds packs correctly | P0 | | NOT STARTED | |
| P-16 | Synthetic price/stock labels and timestamps are visible | P0 | | NOT STARTED | |
| P-17 | RAG answers use validated citations | P0 | | NOT STARTED | |
| P-18 | User A cannot access User B's records or images | P0 | | NOT STARTED | |
| P-19 | Delete flow removes selected records and owned image | P0 | | NOT STARTED | |
| P-20 | Failure/manual fallback preserves user inputs | P0 | | NOT STARTED | |
| P-21 | Main workflow passes desktop/tablet/mobile review | P0 | | NOT STARTED | |
| P-22 | Deploy and judge demo work from a fresh browser/device | P0 | | NOT STARTED | |
| P-23 | Optional What-If or Pantry-first enhancement | P1 | | NOT STARTED | |
| P-24 | Menu scanner enhancement | P2 | | NOT STARTED | |

## Definition of done

- Requirement implemented against agreed API/database contracts.
- Loading, empty, success and error states handled.
- TypeScript checks and relevant tests pass.
- Responsive and accessibility checks completed.
- Security/ownership checks pass where private data is involved.
- Owner records commit, test evidence and known limitations.
