# BA Odyssey — Project Handoff

**Document purpose:** enable a new AI or engineer to continue development of BA Odyssey from its exact current state, without repeating completed work and without breaking anything that already ships.

**Handoff date:** 25 July 2026
**Repository root:** `BA/` (React + Vite app, git-tracked)
**Prepared for:** Antigravity (or any successor agent/engineer)

---

## ⚠️ READ THIS FIRST — Stack Override

`CLAUDE.md` (the repo's "Engineering Constitution") specifies a **Python / FastAPI / Motor / Pydantic** backend. **That is now out of date.**

The project owner has explicitly decided to build the backend on **Node.js + Express + MongoDB + Mongoose (MERN)** instead.

**This handoff document supersedes CLAUDE.md on all stack-specific matters.** CLAUDE.md remains authoritative for everything stack-*agnostic*: architecture layering, migration order, security posture, code-quality rules, and the "do not rewrite the frontend" mandate.

Documents that contain now-obsolete Python references and must be corrected during Phase 2:

| File | Sections needing update | Nature of change |
|---|---|---|
| `CLAUDE.md` | "Target technology stack", "Backend project structure", "Coding standards" (Python type hints), "Background tasks" (FastAPI `BackgroundTasks`) | Rewrite to Node/Express equivalents |
| `docs/PHASE_1_FRONTEND_ANALYSIS.md` | §9 (Pydantic reference), §14.5 (FastAPI dependency reference) | Two incidental mentions; retarget to Express middleware / Zod |

Everything else in both documents is still correct and still binding. **Do not delete either file** — update them in place, and record the change in `CHANGELOG.md`.

---

## 1. Current Project Status

### 1.1 One-line summary

A fully functional, LocalStorage-backed React SPA ships today. Backend work has been **analysed and specified but not started** — zero backend code exists in the repository.

### 1.2 What has been completed

| Item | Status | Artifact |
|---|---|---|
| React frontend (9 core pages) | ✅ Complete and working | `src/pages/*` |
| Client-side persistence layer | ✅ Complete | `src/lib/storage.js`, `src/lib/academyStorage.js` |
| Scoring / review / tagging engines | ✅ Complete | `src/lib/scoring.js`, `reviewEngine.js`, `tagging.js` |
| Engineering constitution | ✅ Written (stack section now superseded) | `CLAUDE.md` |
| **Phase 1 — Frontend Analysis** | ✅ **Complete, 236 lines, reviewed** | `docs/PHASE_1_FRONTEND_ANALYSIS.md` |
| Product README | ✅ Complete | `README.md` |

### 1.3 What is still pending

Everything backend. Specifically: architecture design, database schema, authentication, all CRUD APIs, dashboard, search, settings sync, file upload, AI layer, Redis, Docker, deployment. See §4 for the phased roadmap.

### 1.4 Current frontend state

- **Framework:** React 19.2 + Vite 8 + Tailwind CSS 3.4 + React Router 7.18 + Framer Motion 12 + Recharts 3.8. **Plain JavaScript (JSX), not TypeScript.**
- **Build status:** builds and runs (`npm run dev` → `localhost:5173`). A `dist/` build exists.
- **Functional coverage:** 9 of 10 route groups fully built. The 10th — Founder Academy (`/academy` + 13 sub-routes) — is a routed shell where **every one of the 13 module pages is a ~140-byte "Coming soon…" stub.**
- **No API client exists.** `src/services/`, `src/shared/` and `src/hooks/` are empty directories. Not one `fetch()` or `axios` call exists in the codebase. All persistence is `localStorage`.
- **No authentication concept exists.** The app assumes one browser = one founder.
- **No AI is integrated anywhere.** The "Idea Generator" is deterministic arithmetic (`src/lib/scoring.js`); "AI Mentor" is an unbuilt stub. Do not assume any AI feature currently works.

### 1.5 Current backend state

**None. The `backend/` directory does not exist.**

> **Historical note to prevent confusion:** a FastAPI backend scaffold (config, logging, exceptions, health routes) was begun in an earlier session and then **deleted at the owner's request** before any commit. It is not in git history and must not be restored — it targeted the now-superseded Python stack. Start Phase 2 from a clean slate.

---

## 2. Repository Summary

### 2.1 Folder structure (current, actual)

```
BA/
├── CLAUDE.md                     # Engineering constitution (stack section superseded)
├── PROJECT_HANDOFF.md            # ← this document
├── README.md                     # Product-facing overview
├── docs/
│   └── PHASE_1_FRONTEND_ANALYSIS.md   # Completed Phase 1 deliverable — READ IN FULL
├── index.html
├── package.json                  # Frontend deps only
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── public/
├── dist/                         # Build output (gitignored)
└── src/
    ├── main.jsx                  # Entry point
    ├── App.jsx
    ├── index.css
    ├── app/
    │   ├── router.jsx            # Single createBrowserRouter tree — all routes
    │   └── AppShell.jsx          # Sidebar + mobile tab bar + cosmic background
    ├── context/
    │   ├── DataContext.jsx       # ★ ALL app state + mutators (120 lines)
    │   └── ThemeContext.jsx      # Theme, delegates to DataContext
    ├── lib/
    │   ├── storage.js            # ★ ba_data_v1 LocalStorage namespace
    │   ├── academyStorage.js     # ba_academy_v1 namespace (effectively unused)
    │   ├── scoring.js            # ★ Founder score, streak, demand, potential
    │   ├── reviewEngine.js       # Weekly review computation
    │   ├── tagging.js            # Keyword extraction + problem grouping
    │   ├── prompts.js            # Static Discovery Assistant prompt library
    │   └── utils.js              # clsx/tailwind-merge helper
    ├── components/               # 11 shared components + cosmic/ (17 decorative)
    ├── pages/                    # 10 page groups (see §7.1)
    ├── services/                 # EMPTY — API client belongs here
    ├── shared/                   # EMPTY
    ├── hooks/                    # EMPTY
    └── assets/
```

### 2.2 Important files (ranked by relevance to backend work)

1. **`src/lib/storage.js`** — defines `DEFAULT_DATA`, the authoritative shape of every entity. The MongoDB schema must map from this.
2. **`src/context/DataContext.jsx`** — the seam. It exposes `addProblem`, `updateProblem`, `addIdea`, `updateIdea`, `addGrowthItem`, `toggleOSItem`, `saveWeeklyReview`, `updateSettings`, `forceReloadData`. **Preserving this exact interface while swapping its internals from LocalStorage to API calls is the single key to migrating without touching any page component.**
3. **`src/lib/scoring.js`** — client-side scoring that must be **ported to the server and recomputed server-side** (see §7.6 security note).
4. **`docs/PHASE_1_FRONTEND_ANALYSIS.md`** — the completed analysis. Read it in full before designing anything.
5. **`CLAUDE.md`** — engineering rules (stack section superseded by this document).
6. **`src/app/router.jsx`** — full route table; shows exactly which pages exist.

### 2.3 Existing React architecture

- **Routing:** one `createBrowserRouter` tree in `src/app/router.jsx`. Root path `/` renders `AppShell`, which renders `<Outlet/>` inside persistent chrome. Academy is a nested route group with an index redirect to `fundamentals`.
- **State:** two React Contexts, no Redux, no React Query, no custom hooks.
  - `DataContext` holds the *entire* `ba_data_v1` object in one `useState` and persists it via a `useEffect` on `[data]` — meaning **every mutation rewrites the whole dataset.**
  - `ThemeContext` is a thin wrapper over `settings.theme` that toggles a `light`/`dark` class on `<html>`.
- **Local state:** all UI-only concerns (form fields, modals, search, filter, sort, multi-select) live in component `useState`/`useMemo`. None of it needs to move server-side.
- **Styling:** Tailwind utility classes throughout, with a custom cosmic/space visual theme. **Do not redesign this.**
- **Data flow:** `page component → useData() → DataContext mutator → setState → useEffect → saveData() → localStorage`.

### 2.4 Existing LocalStorage architecture

Two namespaces, accessed *only* through their lib files (verified: no component calls `localStorage` directly).

**`ba_data_v1`** — managed by `src/lib/storage.js`:

```js
{
  settings: { founderName, theme, problemGoal, createdAt },
  problems: [{ id, date, createdAt, problem, whoFaces, frequency, currentSolution,
               whyBad, painLevel, peopleAffected, willingnessToPay, canIBuild,
               marketSizeEstimate, marketSizeNote, myIdea, notes, tags[] }],
  ideas:    [{ id, createdAt, sourceProblemIds[], customer, solution,
               revenueModel, difficulty, startupPotentialScore, status }],
  growth: {
    books:            [{ id, title, author, takeaway, dateFinished }],
    concepts:         [{ id, concept, source, explanation }],
    networking:       [{ id, goal, targetDate, status }],
    skillsExperiments:[{ id, type, title, description, status }]
  },
  operatingSystem: {
    dailyLogs: [{ date, dsa, building, businessReading,
                  problemCollection, networking, reflection }]
  },
  weeklyReviews: [{ weekOf, reflection, completedAt }]
}
```

API: `loadData()`, `saveData(data)`, `exportData()`, `importData(json)`, `resetData()`.
ID convention: client-generated strings — `p_${Date.now()}` for problems, `i_${Date.now()}` for ideas.

**`ba_academy_v1`** — managed by `src/lib/academyStorage.js`. Defines a full schema for Academy module progress, a 9-dimension Founder IQ score, a knowledge graph, and mission debriefs. **Seeded on first `/academy` visit but otherwise unused**, because all 13 module UIs are stubs. Treat it as a *design draft*, not as user data. Do not migrate it early.

**Structural gap:** both stores are read and written as one JSON blob per namespace. There is no per-record granularity today. The backend must move to per-record CRUD, not mirror this pattern.

### 2.5 CLAUDE.md summary

The repo's engineering constitution. Full rules in §5 below. In brief:

- Treat this as a **production SaaS**, not a prototype; act as lead architect + security + QA.
- The frontend is **stable and ships** — do not rewrite it, do not redesign the UI, do not break it at any point.
- LocalStorage is prototype persistence; replace it **gradually**, one module at a time, verifying the frontend still works after each.
- Prescribed migration order: **Authentication → Users → Problem Journal → Ideas → Dashboard → Search → File Upload → AI Layer → AI Mentor → Background Jobs → Redis → Docker → Deployment.**
- Clean Architecture with strict layer separation; business logic never touches the DB directly (repository layer); routes never call AI providers directly (service layer).
- Versioned REST under `/api/v1/...`; consistent JSON response and error shapes.
- Per-feature workflow: understand frontend → design → schema → API → implement → test → review → refactor → document. Never skip review or docs to go faster.
- **Non-negotiables:** no placeholder code, no `TODO`s, no faked implementations, no ignored exceptions, no skipped validation. Ask before coding when requirements are unclear. Explain architectural decisions before implementing them.

### 2.6 PHASE_1_FRONTEND_ANALYSIS.md summary

The completed Phase 1 deliverable (`docs/`, 236 lines, 14 sections). Contents:

§1 Pages/routes · §2 Component inventory · §3 Features by build status · §4 Complete LocalStorage inventory · §5 State management · §6 Complete forms inventory · §7 What must move server-side (in migration order) · §8 Required future APIs by phase · §9 Missing backend functionality · §10 Security concerns · §11 Performance concerns · §12 Suggested MongoDB collections · §13 Suggested REST surface · §14 Suggested authentication flow.

Its most important conclusions:

- Only **9 route groups** are real; Academy's 13 modules are stubs.
- **No AI exists** in the product today — the AI layer is *net-new product surface*, not a migration.
- Scores are computed and stored **client-side** and are therefore forgeable — server-side recomputation is the first integrity fix once an API exists.
- The `DataContext` interface is the migration seam.
- Collection naming was flagged as an **open decision** (`snake_case` plural vs. the constitution's PascalCase). See §6 D-09.

**Read the full document before Phase 2. Do not re-derive its findings.**

---

## 3. Completed Work — itemised

Every item below is **done**. Do not repeat any of it.

**Frontend product build (pre-existing, complete):**

1. `AppShell` with responsive sidebar + mobile tab bar + persistent cosmic background.
2. Router tree covering 10 top-level routes + 13 Academy sub-routes.
3. `DataContext` with 9 mutators and automatic LocalStorage persistence.
4. `ThemeContext` with light/dark/system support.
5. Problem Journal — create, edit, list, search, filter, multi-select, grid + table views.
6. Discovery Assistant — static prompt library with shuffle.
7. Idea Generator — deterministic scoring from selected source problems.
8. Opportunity Matrix — 2×2 pain/demand scatter plot.
9. Weekly Review — auto-generated summary engine + saved free-text reflection.
10. Founder Growth — 4 logged categories (books, concepts, networking, skills/experiments).
11. Founder Operating System — 6-item daily habit checklist + 7-day streak view, with `problemCollection` auto-checking on same-day problem capture.
12. Founder Score — single derived metric with streak bonus and inactivity decay.
13. Settings — profile, goal, theme, JSON export/import, hard reset.
14. 11 shared components + 17 decorative cosmic components.
15. Scoring, review, and tagging engines in `src/lib/`.

**Documentation and planning:**

16. `CLAUDE.md` — engineering constitution authored.
17. `README.md` — product overview authored.
18. **Phase 1 — Frontend Analysis** — complete 14-section audit, delivered and reviewed as `docs/PHASE_1_FRONTEND_ANALYSIS.md`. This satisfies CLAUDE.md's "understand the relevant frontend slice" requirement for *all* slices.

**Decisions made** (see §6 for the full register): backend stack switched to Express + Mongoose; refresh-token storage settled on httpOnly cookies.

**Explicitly NOT completed:** any backend code whatsoever; any schema; any API; any test; any Docker asset; any AI integration; the 13 Academy module UIs.

---

## 4. Remaining Roadmap

Fourteen phases. **Each phase ends with a review and documentation update before the next begins** (CLAUDE.md workflow, non-negotiable). Phase 1 is done; start at Phase 2.

### Phase 2 — Backend Architecture Design ← **NEXT**
Design only, no implementation. Full deliverable spec in §8.

### Phase 3 — Authentication
Register, login, logout, refresh with rotation, bcrypt hashing, JWT access + refresh, auth middleware, protected-route guard, RBAC scaffold. Frontend gains a new `AuthContext` + login/register screen — the smallest possible UI addition, styled to match existing `Modal`/form conventions.

### Phase 4 — Users
`Users` collection, `GET /users/me`, `PATCH /users/me`, profile fields migrated from `settings` (`founderName`, `problemGoal`, `theme`), password change, account deletion (soft delete + audit).

### Phase 5 — Problem Journal
Full `problems` CRUD scoped to `userId`. Server-side validation of all ranges and enums. Pagination, filtering by tag, sorting. `DataContext.addProblem`/`updateProblem` swapped to API calls behind the unchanged interface. **First real end-to-end migration — verify the Journal page works untouched before continuing.**

### Phase 6 — Ideas
`ideas` CRUD. **Server recomputes `startupPotentialScore`, `difficulty` and `status` from the referenced source problems** — never trusts client-submitted scores. Port `computeDemandScore`, `computeStartupPotentialScore`, `getStatusStamp`, `getDifficulty` from `src/lib/scoring.js` to the service layer with identical arithmetic, and cover with tests that assert parity against the JS implementation.

### Phase 7 — Dashboard
`GET /dashboard/summary` returning founder score, streak, progress-to-goal and weekly insight snippets. Port `getFounderScore` and `calculateStreak` server-side (identical arithmetic, including the streak bonus cap of 30 and the post-3-day 1%/day decay). Also migrate Growth, Operating System logs and Weekly Reviews here or as sub-phases — they feed the score.

### Phase 8 — Search
`GET /search?q=` across problems and ideas. Replaces in-browser `Array.filter`. MongoDB text index; consider Atlas Search later. Must be user-scoped.

### Phase 9 — Settings
`PATCH /users/me/settings`, server-side `GET /users/me/export`, `POST /users/me/import` (full schema validation, must not allow importing another user's file or foreign IDs), and `DELETE /users/me/data` as an intentional, audit-logged, rate-limited soft delete — **not** a straight port of today's instant `resetData()` wipe.

### Phase 10 — File Upload
Images, PDF, audio, documents. Streaming multipart, size limits, extension **and** MIME/magic-byte validation server-side, file metadata collection, pluggable storage backend (local disk default, S3 adapter alongside).

### Phase 11 — AI Layer
`AIService → Provider Adapter → Prompt Builder → Response Parser → Storage`. Adapters must be swappable without touching business logic. Routes never call a provider directly. Per-user rate limiting and cost/usage metadata logging are mandatory (AI calls cost money). **This is net-new product surface** — the Academy/AI Mentor frontend does not exist yet, so build the API and the minimal UI together, or defer until that UI is scheduled.

### Phase 12 — Redis
Caching (dashboard, founder score, AI responses), rate limiting, session/refresh-token denylist. TTLs and explicit invalidation on write. Cache must fail *open* — a Redis outage degrades performance, never correctness.

### Phase 13 — Docker
`Dockerfile` (multi-stage, non-root user), `docker-compose.yml` (api + mongo + redis), `.env.example` with no real values, healthchecks, volume for uploads.

### Phase 14 — Deployment
Production config validation at boot, HTTPS/proxy assumptions, structured logging to stdout, index creation script, backup strategy, CI checks, monitoring hooks.

---

## 5. Engineering Rules

Distilled from `CLAUDE.md`, with stack-specific rules translated to Node/Express. **All of these are binding.**

### 5.1 Role and posture
Treat this codebase as a production SaaS platform, not a prototype. Act as lead backend architect, principal engineer, security engineer and QA. Optimise for correctness, maintainability, scalability, readability, security and extensibility over speed of typing code. Justify every architectural decision; explain it *before* implementing it.

### 5.2 Migration discipline
- The frontend is stable and ships today. **Do not rewrite it. Do not redesign the UI. Do not break existing functionality at any point.** The app must work end-to-end after every incremental change.
- Replace LocalStorage gradually, one feature at a time. **Never attempt to rewrite the whole application in one pass.**
- After each module migrates, verify the corresponding frontend feature works against the real backend before moving on.
- Change the frontend only where there is no reasonable alternative — and **never for UI/design reasons.**
- Never assume how the frontend works. Inspect the actual React code first. (Phase 1 already did this — read the analysis instead of re-deriving it.)

### 5.3 Architecture
```
React → HTTPS → Express → Service Layer → Repository Layer → MongoDB
                                        ↘ Redis
                                        ↘ AI Providers
                                        ↘ File Storage
```
Clean Architecture with strict separation of Presentation, Business Logic, Persistence, Infrastructure and the AI Layer. **Business logic never talks to MongoDB directly** — it goes through repositories. **Routes never call AI providers directly** — they go through services. Modular monolith; no premature microservices.

### 5.4 Code quality
SOLID, DRY, KISS, Clean Code, Repository Pattern, Dependency Injection, Service Layer. No global mutable state. No duplicated logic. No magic numbers. Meaningful names. Small functions, cohesive modules. Reusable utilities, dependencies and schemas.

*(Node translation of "type hints everywhere": either adopt TypeScript for the backend, or enforce JSDoc type annotations checked by `tsc --checkJs`. This is open decision **D-02** — resolve it in Phase 2, do not decide silently.)*

Docstrings/JSDoc on public functions and classes. Comments explain non-obvious **why** — hidden constraints, workarounds, invariants — never *what* the code does.

### 5.5 Non-negotiables
No placeholder code. No `TODO` comments. No faked implementations. No ignored exceptions. No skipped validation. If something cannot be finished properly, **say so instead of stubbing it.** Do not move to the next feature until implementation, tests, review and docs for the current one are all done. **If requirements are unclear, ask before coding.**

### 5.6 API design
RESTful, versioned under `/api/v1/...`. Correct HTTP verbs and status codes. One consistent JSON response shape and one consistent error shape across every endpoint, without exception.

### 5.7 Database
MongoDB with proper indexes, pagination, filtering, sorting and aggregation. Never mix database access with business logic — that belongs in the repository layer only.

### 5.8 Authentication
JWT access + refresh tokens, bcrypt password hashing, protected routes via middleware, role-based authorisation where needed, secure password policies enforced **server-side**.

### 5.9 Security
Never hardcode secrets — `.env` / `.env.example` with no real values committed. Validate and sanitise every input at the API boundary. Defend against NoSQL injection, XSS, CSRF, JWT attacks and replay attacks. Rate-limit sensitive endpoints (auth, AI) via Redis. **Always call out security implications of a design choice explicitly — never implement them silently.**

### 5.10 CORS
Frontend `localhost:5173`, backend `localhost:8000`. Allow credentials, `Authorization`, and any custom headers the frontend needs.

### 5.11 Logging
Structured logging for requests, errors, warnings, performance, AI calls and authentication events. **Never log passwords, tokens or other secrets.**

### 5.12 Error handling
Never guess. Investigate, find the root cause, explain why it happened, fix it permanently, and check whether the same class of bug exists elsewhere. **Do not patch symptoms.** Custom exception types for validation, auth, database, AI and storage failures; always return structured JSON.

### 5.13 Testing
Every backend feature ships with tests before it is considered done: imports, routes, validation, auth, MongoDB, Redis, OpenAPI/Swagger, edge cases and error handling. Verify: no syntax errors, no unresolved imports, no circular imports, app starts, DB connects.

### 5.14 Documentation
Keep `README.md`, `ARCHITECTURE.md`, `API.md`, `DATABASE.md` and `CHANGELOG.md` current. Update them whenever the architecture changes. **Documentation debt is not acceptable.**

---

## 6. Current Decisions (Decision Register)

Decisions already made and **not open for re-litigation** unless the owner reopens them.

| ID | Decision | Rationale / Notes |
|---|---|---|
| **D-01** | **Backend stack: Node.js + Express + MongoDB + Mongoose (MERN)** | Owner decision, 25 Jul 2026. **Overrides CLAUDE.md's FastAPI/Motor/Pydantic spec.** Update the affected docs in Phase 2. |
| D-03 | **JWT access + refresh tokens** | Access short-lived; refresh long-lived and **rotated on every use** (replay mitigation). |
| **D-04** | **Refresh token in an httpOnly, Secure, SameSite cookie; access token in memory only** | Owner decision. Immune to XSS token theft. **Consequences you must handle:** CORS requires `credentials: true` and an explicit origin (no wildcard), and the refresh endpoint needs a CSRF defence (double-submit token or strict `SameSite` + origin check). Never put either token in `localStorage`. |
| D-05 | **bcrypt for password hashing** | Server-side only, cost factor ≥ 12. |
| D-06 | **Repository Pattern + Service Layer + Dependency Injection** | Business logic never touches Mongoose models directly; routes stay thin. |
| D-07 | **Modular monolith**, not microservices | Single deployable; module boundaries enforced in code, not infrastructure. |
| D-08 | **REST, versioned at `/api/v1`** | No GraphQL. Consistent response/error envelopes. |
| D-09 | **Collection naming: `snake_case` plural** (`problems`, `ideas`, `growth_items`, `daily_logs`, `weekly_reviews`, `users`) | Proposed in Phase 1 §12, deviating from CLAUDE.md's PascalCase placeholders. **Confirm with the owner at the start of Phase 2 before the schema locks in.** |
| D-10 | **React frontend remains unchanged** | Except: a new `AuthContext` + login/register screen (Phase 3), and `DataContext` internals swapped to API calls behind its **unchanged** public interface. No page component should need edits. |
| D-11 | **Incremental migration from LocalStorage** | One module at a time; app works end-to-end after every step. |
| D-12 | **Do not redesign the UI** | Zero visual/UX changes. Cosmic theme, Tailwind classes and layout stay exactly as they are. |
| D-13 | **Authentication first** | Nothing else can be user-scoped until identity exists. |
| D-14 | **AI comes later** (Phase 11) | No AI exists today; it is net-new surface, not a migration. Do not build it early. |
| D-15 | **Scores recomputed server-side** | Client-submitted scores are never trusted or persisted as-is. |
| D-16 | **Redis for cache + rate limiting + token denylist** | Must fail open for caching; fail closed for auth rate limiting. |
| D-17 | **Docker + docker-compose** for local and deployed environments | api + mongo + redis. |
| D-18 | **Frontend stays plain JavaScript (JSX)** | Do not introduce TypeScript to `src/` mid-migration without discussing it first. |

**Open decisions for Phase 2 to resolve (with the owner):**

- **D-02** — TypeScript vs. JSDoc-checked JavaScript for the **backend**. *Recommendation: TypeScript.* It restores the type safety CLAUDE.md mandates, and the backend is greenfield so there is no migration cost. D-18 is unaffected — the frontend stays JS.
- **D-09** — confirm collection naming.
- Validation library — *recommendation: Zod*, with schemas shared between route validation and OpenAPI generation.
- Migration/seed strategy for existing users' LocalStorage data — is there a one-time import path from `exportData()` JSON into a new account?

---

## 7. Frontend Requirements

Everything below was discovered and verified during Phase 1. Full detail in `docs/PHASE_1_FRONTEND_ANALYSIS.md`.

### 7.1 Pages

| Route | Component | Status |
|---|---|---|
| `/` | `Dashboard` | Built |
| `/journal` | `Journal` | Built |
| `/discover` | `Discover` | Built (static prompts, no persistence) |
| `/ideas` | `Ideas` | Built |
| `/matrix` | `Matrix` | Built (derived view, no own data) |
| `/review` | `Review` | Built |
| `/growth` | `Growth` | Built |
| `/system` | `System` | Built |
| `/settings` | `Settings` | Built |
| `/about` | `About` | Static |
| `/academy` + 13 sub-routes | `FounderAcademy/*` | **Shell only — all 13 modules are stubs** |

Academy sub-routes: `fundamentals`, `thinking`, `product`, `leadership`, `simulator`, `startups`, `founders`, `books`, `mentor`, `missions`, `iq`, `graph`, `debrief`.

### 7.2 Forms

| Form | Location | Fields (`*` = required) |
|---|---|---|
| New/Edit Problem | `Journal/NewEntryForm.jsx` | problem\*, whoFaces\*, frequency\*, currentSolution, whyBad, painLevel (1–10), peopleAffected (1–10), willingnessToPay (1–10), canIBuild (1–10), marketSizeEstimate, marketSizeNote, myIdea, notes, tags[] |
| Generate Idea | `Ideas/IdeaGenerationForm.jsx` | customer\*, solution\*, revenueModel — plus `sourceProblemIds` from multi-select; scores computed client-side |
| Growth (4 variants) | `Growth/Growth.jsx` | books: title/author/takeaway/dateFinished · concepts: concept/source/explanation · networking: goal/targetDate/status · skillsExperiments: type/title/description/status |
| Weekly reflection | `Review/Review.jsx` | free-text reflection keyed by `weekOf` |
| Profile & goal | `Settings/Settings.jsx` | founderName, problemGoal (saved on blur) |
| Theme | `Settings/Settings.jsx` | light / dark / system |
| Import / Export / Reset | `Settings/Settings.jsx` | JSON upload, JSON download, destructive reset behind `confirm()` |

**Enums the server must validate:**
`frequency` ∈ {Daily, Weekly, Monthly, Rarely, One-off} ·
`marketSizeEstimate` ∈ {Niche, Medium, Large, Massive} ·
`revenueModel` ∈ {Subscription, Marketplace, Transaction fee, One-time, Ads, Usage-based, Other} ·
`difficulty` ∈ {Low, Medium, High} ·
`status` ∈ {HIGH POTENTIAL, VALIDATED, NEEDS DATA, ARCHIVED} ·
`theme` ∈ {light, dark, system} ·
All four slider fields are integers 1–10.

### 7.3 CRUD operations in use today

| Entity | Create | Read | Update | Delete |
|---|---|---|---|---|
| Problems | ✅ `addProblem` | ✅ list/filter/search | ✅ `updateProblem` | ❌ not exposed in UI |
| Ideas | ✅ `addIdea` | ✅ list | ✅ `updateIdea` (status) | ❌ not exposed in UI |
| Growth items | ✅ `addGrowthItem` | ✅ list per tab | ❌ | ❌ |
| Daily logs | ✅ upsert via `toggleOSItem` | ✅ 7-day window | ✅ same call | ❌ |
| Weekly reviews | ✅ upsert via `saveWeeklyReview` | ✅ by `weekOf` | ✅ same call | ❌ |
| Settings | — | ✅ | ✅ `updateSettings` | ✅ `resetData` (whole dataset) |

> Delete endpoints are still required by the API design even where no UI triggers them today — but **do not add delete buttons to the UI** without the owner asking (D-12).

### 7.4 Required APIs

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout

GET    /api/v1/users/me
PATCH  /api/v1/users/me
PATCH  /api/v1/users/me/settings
GET    /api/v1/users/me/export
POST   /api/v1/users/me/import
DELETE /api/v1/users/me/data

GET    /api/v1/problems              # filter by tag, search, paginate, sort
POST   /api/v1/problems
GET    /api/v1/problems/{id}
PATCH  /api/v1/problems/{id}
DELETE /api/v1/problems/{id}

GET    /api/v1/ideas
POST   /api/v1/ideas                 # server recomputes scores
GET    /api/v1/ideas/{id}
PATCH  /api/v1/ideas/{id}
DELETE /api/v1/ideas/{id}

GET    /api/v1/growth/{books|concepts|networking|skills}
POST   /api/v1/growth/{type}
PATCH  /api/v1/growth/{type}/{id}
DELETE /api/v1/growth/{type}/{id}

GET    /api/v1/operating-system/logs?from=&to=
PATCH  /api/v1/operating-system/logs/{date}

GET    /api/v1/reviews/{weekOf}
PUT    /api/v1/reviews/{weekOf}      # upsert — matches current find-or-create semantics

GET    /api/v1/dashboard/summary     # founder score, streak, goal progress, insights
GET    /api/v1/search?q=

POST   /api/v1/files/upload          # Phase 10
POST   /api/v1/ai/mentor/message     # Phase 11
GET    /api/v1/ai/mentor/conversations
POST   /api/v1/ai/idea-suggestions
```

### 7.5 MongoDB collections

| Collection | Maps from | Key fields & indexes |
|---|---|---|
| `users` | `settings` + new auth fields | `_id`, `email` (unique), `passwordHash`, `founderName`, `theme`, `problemGoal`, `role`, `createdAt`, `refreshTokenVersion` |
| `problems` | `problems[]` | + `userId`; indexes `(userId, date)`, `(userId, tags)`, text index on `problem`/`notes` |
| `ideas` | `ideas[]` | + `userId`; `sourceProblemIds` as refs to `problems._id`; index `(userId, startupPotentialScore)` |
| `growth_items` | all 4 `growth.*` arrays | + `userId` + `type` discriminator (one collection, not four) |
| `daily_logs` | `operatingSystem.dailyLogs[]` | + `userId`; **unique** index `(userId, date)` |
| `weekly_reviews` | `weeklyReviews[]` | + `userId`; **unique** index `(userId, weekOf)` |
| `founder_progress` | *(new, Academy — build later)* | per-user module progress + Founder IQ snapshot |
| `ai_history` | *(new, Phase 11)* | conversation turns, provider, tokens, cost, timestamp. **Never store API keys here — usage metadata only.** |
| `files` | *(new, Phase 10)* | + `userId`, original name, stored key, size, MIME, checksum |

Naming per D-09 (confirm before locking in).

### 7.6 Known gaps and risks carried forward

- **No multi-user concept exists today** — auth introduces the first identity boundary. Every endpoint must scope by the `userId` taken from the **verified JWT claim**, never from a request body or query parameter.
- **No server-side validation exists** — sliders and selects are trusted as-is today.
- **Scores are forgeable** — `startupPotentialScore` is computed and stored client-side. Recompute server-side (D-15).
- **Import is barely validated** — today's check is `if (!parsed.settings || !parsed.problems) throw`. The server equivalent must fully schema-validate and must not let one user's export take over foreign IDs.
- **`resetData()` is an instant, unlogged, unrecoverable wipe** — the server equivalent must be authenticated, confirmed, rate-limited and audit-logged.
- **No pagination anywhere** — every list renders in full today.
- **Whole-blob rewrite on every mutation** — do not mirror this pattern server-side.
- **Derived data recomputed on every render** — cache the dashboard summary in Redis (Phase 12) rather than recomputing per request.
- **Frontend correctness note (not a backend concern):** `Journal.jsx` reads `window.innerWidth` directly during render instead of using a resize listener, so it won't react to window resizing without a remount. Flagged for whoever eventually touches that file.
- **XSS posture is currently good** — no `dangerouslySetInnerHTML` anywhere in the codebase. Keep it that way; sanitise on the way in or escape on the way out once text fields are served from a database.

---

## 8. Next Immediate Task — Phase 2: Backend Architecture Design

**Begin here. Design only. Write no implementation code.** No route handlers, no models, no `npm init`. The output of this phase is a set of documents plus a reviewed design that the owner approves before Phase 3.

Before starting: read `CLAUDE.md`, `docs/PHASE_1_FRONTEND_ANALYSIS.md` and this document in full. Confirm open decisions **D-02** and **D-09** with the owner.

Deliverables:

1. **Folder structure** — complete `backend/` tree with a one-line purpose for each directory, honouring the layer separation in §5.3. Show where routes, controllers, services, repositories, models, middleware, validators, config, utils, errors and tests live.

2. **Express architecture** — app bootstrap and composition root; router mounting and `/api/v1` versioning; the request lifecycle from HTTP in to JSON out; how dependency injection is wired (constructor injection vs. container); how services and repositories are composed and where the boundaries are enforced; graceful startup/shutdown and Mongo connection lifecycle.

3. **MongoDB schema** — full Mongoose schema for every collection in §7.5: field types, required flags, enums, ranges, defaults, refs, timestamps. Every index with its justification (including the unique compound indexes on `daily_logs` and `weekly_reviews`). Explicitly state how each schema maps from the current LocalStorage shape in §2.4, and how client-generated string IDs (`p_…`, `i_…`) are reconciled with `ObjectId`.

4. **API catalogue** — every endpoint from §7.4 with: method, path, auth requirement, request schema, response schema, status codes, error codes, pagination/filter/sort parameters. Plus the single canonical success envelope and the single canonical error envelope, defined once and used everywhere.

5. **Middleware** — the ordered chain and why the order matters: request ID → structured logging → security headers (helmet) → CORS → body parsing with size limits → rate limiting → authentication → authorisation → route → validation → error handler. Specify which are global and which are per-route.

6. **Authentication flow** — sequence diagrams (or numbered step lists) for register, login, authenticated request, token refresh with rotation, and logout. Cover: token lifetimes, claim structure, the httpOnly cookie configuration required by **D-04**, the CSRF defence on the refresh endpoint, refresh-token invalidation strategy (`refreshTokenVersion` vs. a Redis denylist), and the password policy enforced server-side.

7. **Validation strategy** — where validation happens, which library, how schemas are shared between request validation and OpenAPI generation, how validation errors map to the canonical error envelope, and how the enums and 1–10 ranges in §7.2 are enforced.

8. **Security review** — a written pass over: NoSQL injection, XSS, CSRF, JWT attacks, replay attacks, user enumeration on login/register, mass assignment, IDOR (every query scoped by JWT `userId`), rate limiting targets, secret management, and the import/reset endpoints from §7.6. For each: the threat, the mitigation, and where in the design it lives.

9. **Scalability review** — connection pooling, index coverage for every query in the catalogue, pagination strategy (offset vs. cursor), caching boundaries and invalidation, statelessness for horizontal scaling, and where the current whole-blob pattern would break down.

Also produce as part of this phase: `ARCHITECTURE.md`, `DATABASE.md`, `API.md`, `CHANGELOG.md` (new), and the corrections to `CLAUDE.md` and `docs/PHASE_1_FRONTEND_ANALYSIS.md` listed in the Stack Override section above.

**End the phase with a self-review** covering project structure, naming, scalability, security, performance, readability and architecture — then stop and wait for approval before Phase 3.

---

## 9. Continuation Rules

Binding on whoever picks this up.

1. **Never repeat completed work.** Everything in §3 is done. In particular, **do not re-analyse the frontend** — `docs/PHASE_1_FRONTEND_ANALYSIS.md` is complete, verified and current.
2. **Continue from the current state.** The repository is a working React SPA with no backend. Do not restart, re-scaffold or "start fresh."
3. **Read all existing documentation before making any change**: `CLAUDE.md`, `docs/PHASE_1_FRONTEND_ANALYSIS.md`, `README.md` and this handoff. Read the actual source of `src/lib/storage.js`, `src/lib/scoring.js` and `src/context/DataContext.jsx` before designing the schema.
4. **Preserve the frontend.** Do not rewrite it, restructure it, or change its dependencies. The only sanctioned changes are: a new `AuthContext` + login/register screen (Phase 3), and swapping `DataContext` internals to API calls behind its unchanged public interface.
5. **Preserve all existing functionality.** The app must work end-to-end after every single change. After migrating a module, manually verify the corresponding page still works against the real backend before starting the next.
6. **Do not redesign the UI.** No visual, layout, styling or UX changes. Not one.
7. **Respect the decision register (§6).** Do not silently reverse a decision. If you believe one is wrong, say so and ask — do not just implement the alternative.
8. **Honour the non-negotiables (§5.5).** No placeholders, no `TODO`s, no stubs, no skipped validation, no ignored errors. If something cannot be done properly, say so.
9. **One phase at a time.** Never generate an entire backend, or an entire phase, in one pass. Never skip the review or documentation step to move faster.
10. **Ask when unclear.** Ambiguity is a signal to ask the owner, not to guess.
11. **Keep documentation current** as you go. Update `CHANGELOG.md` at the end of every phase.

---

## Appendix — Quick Start for the Next Engineer

```bash
# Frontend (works today)
npm install
npm run dev            # → http://localhost:5173

# Backend
# Does not exist yet. Phase 2 is design-only — do not create backend/ until
# the architecture design is written and approved.
```

**Environment:** frontend `localhost:5173`, backend will be `localhost:8000`. CORS must allow that origin with `credentials: true` (required by D-04).

**Read in this order:** `PROJECT_HANDOFF.md` (this file) → `CLAUDE.md` → `docs/PHASE_1_FRONTEND_ANALYSIS.md` → `src/lib/storage.js` → `src/context/DataContext.jsx` → `src/lib/scoring.js`.
