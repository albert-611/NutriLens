# NutriLens | Technical Architecture and Stack


Use this document when creating the React application, Supabase project, backend functions, provider integrations and repository layout. The stack is locked for the first prototype unless the team approves a documented change.


# 05 | Technology stack in easy language

| Tool or term | Plain meaning | Its job in NutriLens |
| --- | --- | --- |
| Antigravity | The coding workspace and AI assistant you use while building | Help write, explain and review code; it is not the app's hosted backend |
| HTML + CSS + JavaScript | Page structure, appearance and behavior | Basic web skills beneath the framework |
| React | A way to assemble screens from reusable pieces | Upload form, editable foods, report and shopping list |
| TypeScript | JavaScript with checks for data shapes | Catch errors such as missing fields or wrong units |
| Vite | Development server and production build tool | Run the frontend locally and package it for hosting [S02] |
| Tailwind CSS | Small styling classes | Consistent spacing, colors and responsive layouts |
| React Router | A page-navigation library | Move between Analyze, Report, Plan and Settings |
| Supabase Auth | Login and user-session service | Identify the user securely |
| Postgres | A relational database: structured tables with relationships | Store foods, recipes, prices, profiles and confirmed meals |
| Supabase Storage | File storage | Keep uploaded images in a private bucket |
| Edge Functions | Backend code executed on a server | Validate requests, call AI, calculate nutrients and plan meals |
| API | A defined way for programs to request information | Your backend asks USDA for a food record |
| Gemini API | A hosted, already-trained AI model service | Read images, understand requests and explain supplied evidence |

**Keep one main language:** TypeScript for the frontend and backend functions. You do not need to add Python, Django, Express, MongoDB or Pinecone for this prototype.


# 05B | Supporting tools and key concepts

These tools support the same small application. They are not separate applications your team needs to build.

| Tool or term | Plain meaning | Its job in NutriLens |
| --- | --- | --- |
| RAG | Retrieve relevant evidence, then ask AI to answer with it | Ground chat in approved regional guidance |
| Embedding | A numeric representation used to search by meaning | Find a paragraph about pulses when asked about affordable protein |
| pgvector | Vector-search support inside Postgres | Store and search embeddings without another database [S03] |
| Zod | A data-shape validator | Reject malformed AI output and invalid form requests |
| i18next | A translation system | Keep interface language separate from business logic |
| Git + GitHub | Change history and team collaboration | Feature branches, reviews, recovery and a submission repository |
| Vercel | Frontend hosting | Serve the Vite build; configure page-route fallback [S04] |

**Add only what helps the flow:** A chart library is optional; nutrient cards and simple bars are enough initially. A database migration is a versioned change to your tables. A deployment publishes the current application build. Authentication proves who a user is; authorization determines what that user may access.

**How the pieces connect:** React calls your backend API. The backend reads database rows, makes controlled AI requests, calculates results and sends a validated response back. Supabase groups several backend services together so the team has fewer systems to operate.


# 06 | Architecture and responsibilities

<!-- ARCHITECTURE -->

**Browser:** Displays screens and collects confirmed inputs. It can preview formatting, but its computed values are not authoritative. It holds only the Supabase URL and publishable/anon client key, protected by authentication and Row Level Security.

**Backend:** Verifies the session, checks ownership, validates inputs, calls providers and calculates authoritative results. The user ID comes from the verified session, never from a trusted request-body field. [S05, S06]

**Database:** Stores the food records, source metadata, market observations, recipes and personalized state. Nutrition and price tables use SQL filters and joins; knowledge excerpts use text/vector retrieval. These are different retrieval jobs.

**AI services:** Vision identifies candidates; embeddings help retrieve documents; the chat model phrases an explanation. The model is not permitted to invent food IDs, prices or nutrient measurements.

**Example request:** The browser sends an owned image reference to analyze-meal. The backend returns candidate items. After confirmation, calculate-nutrition reads selected food rows. plan-meals evaluates feasible recipes using price observations. chat retrieves relevant evidence and can explain these computed outputs.

**Minimal external dependence during a demo:** Seed and cache approved food records before the event. Price observations can come from a dated CSV. The real-time model call remains visible. If a model is unavailable, offer manual food search; if using a saved response, label it clearly as a recorded sample.

**Dependency rule:** Vision output is a proposal, not a committed meal. A saved plan references a specific confirmed meal version, market snapshot and formula version. Changing portions or market context requires recalculation.


# 07 | Essential APIs and access decisions

| Service | Use now? | Setup and fallback |
| --- | --- | --- |
| Gemini multimodal API | Yes | Create a separate API project/key, test image input and schema output; use manual entry if unavailable |
| Embedding model from the same provider | Yes for vector RAG | Embed approved excerpts once and each search query; exact embedding model/dimension must match stored vectors |
| USDA FoodData Central | Yes, at least for seeding | Request a data.gov key, search food candidates, verify details, save source IDs; cache approved records |
| Supabase APIs | Yes | Use Auth, database, Storage and Edge Functions; protect every route and table |
| Open Food Facts | Optional | Useful for packaged products, not every cooked dish; product lookup can be a later feature |
| Local grocery/retailer API | Conditional | Use only if access, territory and terms are confirmed early; otherwise use explicit price observations |
| Edamam | Defer | A recipe/text nutrition service; adds another provider and source-reconciliation task [S10] |
| Nutritics | Defer | Assess documented access, covered databases and commercial terms; do not assume free access [S11] |
| Kaggle/WFP datasets | Offline input only | Inspect the original source, unit, place and date; do not call these live store inventory [S12] |

**Current model recommendation:** Google's official model page lists gemini-3.8-flash with image input and structured output. Verify that your account can call it before freezing the build; keep the selected model ID in a server environment variable. The text-only gemini-embedding-001 is documented as an embedding option; verify its output dimension in your test call. Provider availability may change. [S07, S08]

**USDA endpoints:** Search via /foods/search; fetch the chosen /food/{fdcId}. The official guide currently states a default 1,000 requests/hour/IP, with lower DEMO_KEY limits. Use your own key, cache results, handle HTTP 429 and preserve attribution. [S09]

**Open Food Facts:** Use its current documented product API, custom User-Agent and caching. Read calls do not require a private API credential; data may be incomplete. Check its database and image reuse licenses before incorporating or redistributing records. Keep source provenance distinct; separation alone is not a license-compliance guarantee. [S13]

**Day 1 access gate:** One real photo call, one structured JSON response, one embedding, one food lookup, one authenticated database write and one deployed frontend load. IDE access does not automatically provide app API credits.


# 22 | Repository and Antigravity workflow

**Setup:** Install Git and a Node.js version supported by the current Vite documentation. Set up Antigravity from its official instructions. Open one team repository and keep package versions in the lockfile. Test Supabase function deployment separately from the frontend. [S02, S23]

**Starter commands:**

```bash
npm create vite@latest nutrilens -- --template react-ts
cd nutrilens
npm install
npm run dev
```

Follow the current official setup for Tailwind and Supabase rather than mixing commands from tutorials for different major versions. Pin the actual working environment in README after the first successful build.

**Recommended folders:**

```text
src/pages/        Analyze, Confirm, Report, Plan, Settings
src/components/  shared UI and accessible controls
src/contracts/   request/response schemas
src/lib/         units, formatting, API client
src/i18n/        en.json, bn.json
supabase/functions/  vision, calculation, plan, chat
supabase/functions/_shared/  pure math and validators
supabase/migrations/  reviewed schema changes
data/            approved seeds and provenance
tests/           fixtures and acceptance cases
docs/            architecture, API, limitations, evaluation
PROJECT.md       this specification
README.md        how to run and demo
```

**Build loop:** Choose one requirement -> ask Antigravity for a small plan -> review the proposed files and acceptance tests -> implement the bounded task -> run checks -> inspect the interface -> commit. Ask it to explain changed code in simple language. Review any new dependency before adopting it.

**Starter instruction to paste:** "Read PROJECT.md completely. Start with FR-01 and a deployable shell. Propose the files and acceptance checks, then implement the approved task. Keep provider secrets server-side. Do not invent food data. Verify desktop, laptop, tablet and mobile, including navigation, content parity, overflow, accessibility and build checks. Explain each changed file and how I can test it."

**Critical rule:** The team must understand the code it submits. AI-generated code is a draft for review, not a correctness guarantee. Never ask for the entire application in a single uncontrolled prompt.
