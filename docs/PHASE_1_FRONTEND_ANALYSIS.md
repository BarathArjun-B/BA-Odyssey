# Phase 1 — Frontend Analysis Report

Complete inventory of the existing React frontend, produced before any backend code is written, per the migration plan in [CLAUDE.md](../CLAUDE.md). No implementation in this document — analysis only.

---

## 1. Pages (route → component)

| Route | Component | Status |
|---|---|---|
| `/` | `pages/Dashboard/Dashboard.jsx` | Fully built |
| `/journal` | `pages/Journal/Journal.jsx` | Fully built |
| `/discover` | `pages/Discover/Discover.jsx` | Fully built |
| `/ideas` | `pages/Ideas/Ideas.jsx` | Fully built |
| `/matrix` | `pages/Matrix/Matrix.jsx` | Fully built |
| `/review` | `pages/Review/Review.jsx` | Fully built |
| `/growth` | `pages/Growth/Growth.jsx` | Fully built |
| `/system` | `pages/System/System.jsx` | Fully built |
| `/settings` | `pages/Settings/Settings.jsx` | Fully built |
| `/about` | `pages/About/About.jsx` | Static content |
| `/academy` (+ 13 sub-routes) | `pages/FounderAcademy/*` | **Shell only — every module page is a "Coming soon..." stub** (see §3) |

Routing is a single `createBrowserRouter` tree in `src/app/router.jsx`, rendered inside `AppShell` (`src/app/AppShell.jsx`), which provides the sidebar/mobile tab bar and a persistent decorative cosmic background.

## 2. Components

**Structural**: `AppShell`, `Modal`, `EmptyState`.

**Data display**: `SpecimenCard` (problem/idea card shell), `StatusStamp`, `TagPill`, `StatTile`, `ProgressRing`, `Sparkline` (Recharts wrapper).

**Form inputs**: `ScoreSlider` (1–10 slider), `TagInput` (freeform tag entry, comma/enter to commit).

**Decorative only, no data dependency** (`components/cosmic/*`, 15 files): `CosmicBackground`, `MoonElement`, `StarFieldLayer`, `TwinkleStarLayer`, `DriftingStarLayer`, `CosmicDustLayer`, `NebulaLayer`, `AsteroidLayer`, `ShootingStarTrigger`, `ConstellationNetwork`, `PlanetCard`, `PlanetGlyph`, `GalaxyCard`, `StarSystemCell`, `AstronautCharacter`, `NeonBorder`, `CosmicGlow`. These render visuals from problem/idea counts but hold no state of their own — irrelevant to the backend migration.

## 3. Features, by build status

**Fully functional today (LocalStorage-backed):**
- Problem Journal — create/edit/list/search/filter/multi-select problems, grid and table views
- Discovery Assistant — static prompt library + shuffle, no persistence of its own
- Idea Generator — **deterministic client-side scoring, not AI.** Averages source-problem signals through `computeStartupPotentialScore` (`src/lib/scoring.js`) — there is no LLM call anywhere in the current codebase
- Opportunity Matrix — 2×2 pain/demand scatter plot, computed client-side from problems/ideas
- Weekly Review — auto-generated recurring/pain/opportunity/trend summary (`src/lib/reviewEngine.js`) + a free-text reflection the user saves
- Founder Growth — 4 manually-logged tabs: books, concepts, networking goals, skills/experiments
- Founder Operating System — daily habit checklist (6 fixed items) + 7-day streak view; `problemCollection` auto-checks when a problem is logged that day
- Founder Score — single derived number (`getFounderScore`) computed from all of the above, shown on Dashboard
- Settings — profile (name, 1000-problem goal), theme (light/dark/system), full JSON export/import, hard reset

**Not implemented — placeholder stubs only** (`pages/FounderAcademy/modules/*.jsx`, each literally `<div><h2>{Name}</h2><p>Coming soon...</p></div>`, ~140 bytes):
StartupFundamentals, FounderThinking, ProductThinking, Leadership, DecisionSimulator, StartupDatabase, FounderProfiles, BookLibrary, **AIMentor**, DailyMissions, FounderIQDashboard, KnowledgeGraph, MissionDebrief.

Important: `src/lib/academyStorage.js` already defines a full data schema for all of this (modules progress, Founder IQ scores, knowledge graph, mentor conversations, mission debriefs) and `initializeAcademyData()` seeds it into LocalStorage on first visit to `/academy` — but nothing reads or writes most of those fields yet, since the UI that would use them doesn't exist. Treat this schema as a design draft, not a source of truth for what users actually have.

**No AI provider is integrated anywhere in the app today.** "AI Mentor" is a nav link to an unbuilt stub.

## 4. LocalStorage usage — complete inventory

Two namespaces, both accessed only through their respective lib files (verified via repo-wide grep — no component touches `localStorage` directly):

### `ba_data_v1` — `src/lib/storage.js`
```
{
  settings: { founderName, theme, problemGoal, createdAt },
  problems: [{
    id, date, createdAt, problem, whoFaces, frequency,
    currentSolution, whyBad, painLevel, peopleAffected,
    willingnessToPay, canIBuild, marketSizeEstimate,
    marketSizeNote, myIdea, notes, tags[]
  }],
  ideas: [{
    id, createdAt, sourceProblemIds[], customer, solution,
    revenueModel, difficulty, startupPotentialScore, status
  }],
  growth: {
    books: [{ id, title, author, takeaway, dateFinished }],
    concepts: [{ id, concept, source, explanation }],
    networking: [{ id, goal, targetDate, status }],
    skillsExperiments: [{ id, type, title, description, status }]
  },
  operatingSystem: {
    dailyLogs: [{ date, dsa, building, businessReading, problemCollection, networking, reflection }]
  },
  weeklyReviews: [{ weekOf, reflection, completedAt }]
}
```
Functions: `loadData`, `saveData` (whole-object read/write on every `DataContext` change), `exportData`/`importData` (JSON file), `resetData`.

### `ba_academy_v1` — `src/lib/academyStorage.js`
```
{
  modules: {
    startupFundamentals / founderThinking / productThinking / leadership:
      { completed[], currentTopic, progress, readingHistory[] },
    decisionSimulator: { scenariosCompleted, currentScenario, performance, decisions[] },
    dailyMissions: { todaysMission, completedThisWeek, history[] },
    mentorConversations: []
  },
  founderIQ: {
    observation, consistency, customerUnderstanding, execution,
    validation, leadership, learning, decisionMaking, productThinking,
    overallScore, lastUpdated
  },
  knowledgeGraph: { nodes[], edges[] },
  missionDebriefs: []
}
```
Functions: `saveAcademyData(key, value)` / `getAcademyData(key, default)` (per-key read/write into one blob), `clearAcademyData`, `initializeAcademyData`. **Effectively unused** — no page currently calls `saveAcademyData` for anything beyond the seed default, since the modules are all stubs.

Both stores are read/written as one giant JSON blob per namespace — there is no per-record granularity today. This is the single biggest structural gap versus a real database and the main reason "gradual migration" requires care: every `DataContext` mutation currently round-trips the entire dataset.

## 5. State management / hooks

- No custom hooks exist (`src/hooks/` is empty). All shared state goes through two React Contexts:
  - `DataContext` (`src/context/DataContext.jsx`) — the entire `ba_data_v1` object plus mutators (`addProblem`, `updateProblem`, `addIdea`, `updateIdea`, `addGrowthItem`, `toggleOSItem`, `saveWeeklyReview`, `updateSettings`, `forceReloadData`). Persists to LocalStorage via a `useEffect` on every change.
  - `ThemeContext` (`src/context/ThemeContext.jsx`) — thin wrapper reading/writing `settings.theme` through `DataContext`, plus applying `light`/`dark` class to `<html>`.
- Local component state (`useState`/`useMemo`) handles all UI-only concerns: form fields, modal open/close, search/filter/sort, selection sets. None of this needs to move to the backend.
- `src/services/` and `src/shared/` directories exist but are empty — no API client layer has been started.

## 6. Forms — complete inventory

| Form | Location | Fields |
|---|---|---|
| New/Edit Problem | `Journal/NewEntryForm.jsx` | problem*, whoFaces*, frequency*, currentSolution, whyBad, painLevel(1-10), peopleAffected(1-10), willingnessToPay(1-10), canIBuild(1-10), marketSizeEstimate, marketSizeNote, myIdea, notes, tags[] |
| Generate Idea | `Ideas/IdeaGenerationForm.jsx` | customer*, solution*, revenueModel (scores computed client-side from source problems) |
| Growth entry (4 variants by tab) | `Growth/Growth.jsx` | books: title/author/takeaway/dateFinished; concepts: concept/source/explanation; networking: goal/targetDate/status; skillsExperiments: type/title/description/status |
| Weekly reflection | `Review/Review.jsx` | free-text reflection, keyed by `weekOf` |
| Profile & goal | `Settings/Settings.jsx` | founderName, problemGoal (saved on blur) |
| Theme | `Settings/Settings.jsx` | light/dark/system select |
| Import/Export/Reset | `Settings/Settings.jsx` | JSON file upload, JSON file download, destructive reset with confirm() |

`*` = required. No form does server-side-style validation beyond HTML `required` and `disabled` submit — this will need to be added at the API boundary.

## 7. State that should move to the backend

Everything in `ba_data_v1` and (once built) `ba_academy_v1` is a candidate — it's all currently keyed to "the one user of this browser," which breaks the moment there's a login. Concretely, in migration order:

1. **Identity** — `settings.founderName` becomes part of the `Users` document once auth exists; theme preference can stay client-side (localStorage) or move to user prefs, either is fine.
2. **Problems** — `problems[]` → `Problems` collection, one document per problem, `userId` foreign key.
3. **Ideas** — `ideas[]` → `Ideas` collection, references `Problems` by id, `userId` foreign key.
4. **Growth items** — 4 arrays → either one `GrowthItems` collection with a `type` discriminator, or 4 sub-collections; recommend one collection with `type` to keep the repository layer simple.
5. **Operating system logs** — `operatingSystem.dailyLogs[]` → `FounderProgress` (or a dedicated `DailyLogs`) collection, one document per user per day.
6. **Weekly reviews** — `weeklyReviews[]` → `Journal` or a dedicated `WeeklyReviews` collection, one document per user per week.
7. **Founder Academy state** (once the modules are actually built) → `FounderProgress`/`AIHistory`-shaped collections; don't build this early, since the frontend for it doesn't exist yet.

## 8. Future APIs required (by migration phase)

**Auth (Phase 3):** `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`, `GET /api/v1/users/me`, `PATCH /api/v1/users/me`.

**Problem Journal (Phase 4):** `GET /api/v1/problems` (filter by tag/search, paginate), `POST /api/v1/problems`, `GET /api/v1/problems/{id}`, `PATCH /api/v1/problems/{id}`, `DELETE /api/v1/problems/{id}`.

**Ideas:** `GET /api/v1/ideas`, `POST /api/v1/ideas` (server recomputes score server-side, not trusting client-submitted scores), `GET /api/v1/ideas/{id}`, `PATCH /api/v1/ideas/{id}`, `DELETE /api/v1/ideas/{id}`.

**Founder Dashboard:** `GET /api/v1/dashboard/summary` (founder score, streak, progress-to-goal, weekly insight snippets — replaces client-side `getFounderScore`/`computeReview` recomputation on every load).

**Growth:** `GET/POST/PATCH/DELETE /api/v1/growth/{books|concepts|networking|skills}`.

**Operating System:** `GET /api/v1/operating-system/logs?range=`, `PATCH /api/v1/operating-system/logs/{date}`.

**Weekly Review:** `GET /api/v1/reviews/{weekOf}`, `PUT /api/v1/reviews/{weekOf}` (upsert, matches current "find or create" semantics).

**Settings:** `PATCH /api/v1/users/me/settings`, `GET /api/v1/users/me/export`, `POST /api/v1/users/me/import`, `DELETE /api/v1/users/me/data` (reset — should probably become soft-delete/audit-logged server-side rather than the current hard client reset).

**Search:** `GET /api/v1/search?q=` once problem volume outgrows client-side `Array.filter` (currently fine, won't scale past a few thousand records in the browser).

**AI Layer / Founder Mentor (Phase 8-9, and only once the frontend for it exists):** `POST /api/v1/ai/mentor/message`, `GET /api/v1/ai/mentor/conversations`, `POST /api/v1/ai/idea-suggestions` (this would be the first *real* AI-assisted idea generation — today's "Idea Generator" is pure arithmetic, not AI, so this is new product surface, not a migration of existing behavior).

## 9. Missing backend functionality (gaps that don't exist even conceptually today)

- **No multi-user concept at all.** Everything assumes one browser = one founder. Auth introduces the first real identity boundary.
- **No server-side validation.** Sliders/selects are trusted as-is; a backend must re-validate ranges (1-10), enums (frequency, marketSizeEstimate, revenueModel), and required fields.
- **No score integrity.** `startupPotentialScore` is computed and stored client-side today (`IdeaGenerationForm.jsx`); a backend must recompute it server-side so a user can't hand-edit LocalStorage/network requests to fake a high score.
- **No real AI anywhere** — "AI Mentor" is unbuilt; when it is, it needs the full `AIService → Provider Adapter → Prompt Builder → Response Parser` pipeline from CLAUDE.md, plus per-user rate limiting (Redis) since AI calls cost money.
- **No file upload of any kind** exists today beyond JSON export/import — image/PDF/audio support is net-new, not a migration.
- **No search endpoint** — all filtering is `Array.prototype.filter` in the browser.
- **No background jobs** — nothing async happens today; PDF parsing / AI processing / notifications are all net-new.
- **No audit trail** — `resetData()` is an instant, unrecoverable, unlogged wipe. A backend equivalent should be intentional (soft delete + confirmation flow), not a straight port.

## 10. Security concerns

- **Client-trusted computation**: scores (`startupPotentialScore`, `demandScore`, founder score) are all computed and stored client-side with no server recomputation — first thing to fix once an API exists, so a modified request body can't forge a score.
- **Unauthenticated data today** is expected (it's LocalStorage) but becomes a real concern the moment `/api/v1/problems` exists — every problem/idea/growth/OS-log/review endpoint must be scoped to the authenticated user's `userId`, never trust a client-supplied user id.
- **Import endpoint** (`importData`) does almost no validation (`if (!parsed.settings || !parsed.problems) throw`) — a backend equivalent must fully schema-validate (Zod) before persisting, and must not allow importing another user's exported file to silently take over foreign IDs.
- **`resetData`/hard delete**: needs auth + confirmation server-side, ideally rate-limited, since it's fully destructive.
- **No CSRF/XSS surface today** since there's no server, but once real HTML/text fields (problem descriptions, notes, reflections) are rendered from a database instead of trusted local input, sanitize on the way in or escape on the way out — several fields are rendered raw via JSX text interpolation today, which is safe in React by default (no `dangerouslySetInnerHTML` found anywhere in the codebase) — keep it that way.
- **Rate limiting** is entirely absent today (no server) and must be added for auth endpoints (brute force) and future AI endpoints (cost control) via Redis.

## 11. Performance concerns

- **Whole-object read/write**: `DataContext` reloads and rewrites the *entire* `ba_data_v1` blob to LocalStorage on every single mutation (`useEffect` on `[data]`). This is fine at hundreds of records; at thousands it will start to jank. The backend should move to per-record CRUD rather than mirroring this pattern.
- **Client-side derived data recomputed on every render/navigation**: `getFounderScore`, `calculateStreak`, `computeReview` all re-scan the full problems/ideas arrays with no memoized persistence — acceptable client-side today, but if a dashboard summary endpoint is built, compute and cache it server-side (Redis, per CLAUDE.md's "dashboard cache" note) rather than recomputing per request.
- **`Journal.jsx` uses `window.innerWidth` directly in render** (`viewMode === 'grid' || window.innerWidth < 1024`) instead of a resize listener/hook — not a backend concern, but worth flagging as a frontend correctness note for whoever eventually touches that file (it won't react to window resizes without a remount).
- No pagination anywhere — every list (`problems`, `ideas`, growth tabs) renders in full. Needs pagination once real accounts accumulate data over months.

## 12. Suggested MongoDB collections

| Collection | Maps from | Notes |
|---|---|---|
| `users` | `settings` (founderName, theme, problemGoal) + new auth fields | `_id`, `email`, `passwordHash`, `founderName`, `theme`, `problemGoal`, `createdAt`, `refreshTokenVersion` |
| `problems` | `problems[]` | add `userId`, keep existing fields; index on `(userId, date)`, `(userId, tags)` |
| `ideas` | `ideas[]` | add `userId`; `sourceProblemIds` stays as an array of `problems._id` refs; index on `(userId, startupPotentialScore)` |
| `growth_items` | `growth.{books,concepts,networking,skillsExperiments}` | add `userId` + `type` discriminator field instead of 4 separate collections |
| `daily_logs` | `operatingSystem.dailyLogs[]` | add `userId`; unique index on `(userId, date)` |
| `weekly_reviews` | `weeklyReviews[]` | add `userId`; unique index on `(userId, weekOf)` |
| `founder_progress` | *(new, once Academy is built)* | per-user Academy module progress, Founder IQ snapshot |
| `ai_history` | *(new, once AI Mentor is built)* | mentor conversation turns, provider used, tokens, cost, timestamp — never store the API key here, only usage metadata |

Naming intentionally deviates slightly from the constitution's placeholder list (`Problems`/`Ideas`/`Journal`/`FounderProgress`/`AIHistory`) to `snake_case` plural, matching typical MongoDB/PyMongo/Motor convention — flagging this now for a decision before Phase 2 locks in the schema.

## 13. Suggested REST endpoints

Covered in full in §8 above — summarized here as the versioned surface:

```
/api/v1/auth/{register,login,refresh,logout}
/api/v1/users/me
/api/v1/problems[/{id}]
/api/v1/ideas[/{id}]
/api/v1/growth/{books,concepts,networking,skills}[/{id}]
/api/v1/operating-system/logs[/{date}]
/api/v1/reviews[/{weekOf}]
/api/v1/dashboard/summary
/api/v1/search
/api/v1/ai/mentor/*        (Phase 8+, once frontend exists)
```

## 14. Suggested authentication flow

1. **Register**: `POST /api/v1/auth/register` — email + password (bcrypt-hashed server-side, never store plaintext), returns access + refresh token pair. Frontend: new page/modal, not present today — smallest possible addition to the UI, styled to match existing `Modal`/form conventions so it doesn't feel bolted on.
2. **Login**: `POST /api/v1/auth/login` — same response shape.
3. **Token storage**: access token short-lived (e.g. 15 min) held in memory/`DataContext`-equivalent; refresh token longer-lived, httpOnly cookie preferred over LocalStorage to reduce XSS token-theft risk (flag this as a security decision to confirm before implementing).
4. **Refresh**: `POST /api/v1/auth/refresh` rotates the access token using the refresh token; refresh token itself should rotate on use (replay-attack mitigation) per CLAUDE.md's security section.
5. **Protected routes**: every `/api/v1/*` route except `/auth/*` requires a valid access token via an Express middleware; `userId` is taken from the verified JWT claim, never from the request body/query.
6. **Frontend integration**: `AppShell`/`DataContext` need an `AuthContext` (new) that gates the router — unauthenticated users see a login screen instead of `<Outlet/>`. `DataContext` then fetches from the API instead of `loadData()` once authenticated, but keeps its existing external interface (`addProblem`, `updateProblem`, etc.) so no page component needs to change — this is the key to satisfying "don't rewrite the frontend."

---

**Not done in this pass**: no backend code, no schema code, no migrations. Per the migration plan, Phase 2 (architecture design) and Phase 3 (Authentication implementation) come next, in that order, each with its own review before proceeding.
