# BA Odyssey — Engineering Constitution

This file is the permanent, authoritative set of engineering rules for this repository. It applies to every future session. Read it before making architectural decisions.

## What this project is

"The Personal Operating System for Future Founders." Users capture problems, turn them into startup ideas, score opportunities, track founder habits, and review progress over time. Not a note-taking app — a structured founder workflow tool.

## Role

Treat this codebase as a production SaaS platform, not a prototype. Act as lead backend architect, principal engineer, security engineer, and QA — the way an engineer at OpenAI, Anthropic, Stripe, or Notion would. Optimize for correctness, maintainability, scalability, readability, security, and extensibility over speed of typing code.

## Current state (as of the LocalStorage → backend migration)

- **Frontend**: React 19 + Vite + Tailwind CSS + React Router 7 + Framer Motion + Recharts. Plain JavaScript (JSX), not TypeScript, despite the target stack below — do not silently introduce TypeScript mid-migration without discussing it first.
- **Persistence today**: Two LocalStorage namespaces, `ba_data_v1` (problems, ideas, growth, operating system logs, weekly reviews, settings) and `ba_academy_v1` (Founder Academy modules, Founder IQ, knowledge graph, mission debriefs), managed by `src/lib/storage.js` and `src/lib/academyStorage.js`.
- **Backend**: none yet. `backend/` does not exist. This is what we are building.
- **No AI provider is wired up yet** — anything in the UI that looks like AI (e.g. "AI Mentor", idea generation) is currently deterministic/local logic or static content, not a real model call. Verify before assuming an AI feature already works.

## Migration strategy — read this before touching anything

The frontend is stable and ships today. **Do not rewrite it. Do not redesign the UI. Do not break existing functionality at any point in the migration.** The app must keep working end-to-end after every incremental change.

- Treat LocalStorage as the initial prototype persistence layer, not a target state.
- Replace it gradually with FastAPI + MongoDB, one feature/module at a time.
- Never attempt to rewrite the whole application in one pass.
- Order of migration: **Authentication → Users → Problem Journal → Ideas → Founder Dashboard → Search → File Upload → AI Layer → Founder AI Mentor → Background Jobs → Redis → Docker → Deployment.**
- After each module is migrated, verify the corresponding frontend feature still works against the real backend before moving to the next module.

## Target technology stack

**Frontend** (already in place): React, Vite, Tailwind CSS, React Router, Framer Motion.

**Backend** (being introduced):
- Node.js, Express, TypeScript
- Mongoose, MongoDB
- JWT access + refresh tokens, bcrypt password hashing
- Redis — caching, rate limiting, session storage, AI response cache, dashboard cache
- Docker, docker-compose
- OpenAPI / Swagger via Zod-to-OpenAPI

**AI**: OpenAI, Gemini, Anthropic, Ollama, future local models — accessed only through an internal `AIService` abstraction (see AI Architecture below), never called directly from routes.

## Target architecture

```
React → HTTPS → FastAPI → Service Layer → Repository Layer → MongoDB
                                        ↘ Redis
                                        ↘ AI Providers
                                        ↘ File Storage
```

Clean Architecture. Strict separation of Presentation, Business Logic, Persistence, Infrastructure, and the AI Layer. Business logic never talks to MongoDB directly — it goes through the repository layer. Routes never call AI providers directly — they go through the service layer.

## Backend project structure

```
backend/
  src/
    index.ts              # Entry point and composition root
    config/               # settings, constants
    database/             # Mongoose client, connection lifecycle
    middleware/           # Auth, validation, error handling, rate limiting
    models/               # Mongoose schemas and models
    schemas/              # Zod validation schemas
    repositories/         # MongoDB access, one per collection
    services/             # business logic
    api/
      v1/
        routes/           # Express routers
        controllers/      # Route handlers
    utils/                # helpers, logging, custom errors
    types/                # TypeScript type definitions
    ai/                   # AIService, provider adapters, prompt builders
    storage/              # file upload handling
  tests/
  Dockerfile
  docker-compose.yml
  package.json
  tsconfig.json
  README.md
  .env.example
```

## Coding standards

- SOLID, DRY, KISS, Clean Code, Repository Pattern, Dependency Injection, Service Layer.
- TypeScript everywhere in the backend. JSDoc/Docstrings on public functions/classes (why, not what — see comment policy below).
- No global state. No duplicated logic. No magic numbers. Meaningful naming. Small functions, cohesive modules.
- No placeholder code, no `TODO` comments, no faked implementations. If something can't be finished properly, say so instead of stubbing it.
- Comments explain non-obvious *why* (hidden constraints, workarounds, invariants) — not *what* the code does.

## API design

- RESTful, versioned under `/api/v1/...` (e.g. `/api/v1/auth/login`, `/api/v1/problems`, `/api/v1/ideas`).
- Correct HTTP verbs and status codes. Consistent JSON response and error shape across all endpoints.

## Database (MongoDB)

Expected collections: `Users`, `Problems`, `Ideas`, `Journal`, `FounderProgress`, `AIHistory` (exact set to be finalized in the Phase 1/2 analysis). Use proper indexes, pagination, filtering, sorting, and aggregation. Never mix database access code with business logic — that belongs in the repository layer only.

## Authentication

JWT access + refresh tokens, bcrypt for password hashing, protected routes via FastAPI dependencies, role-based authorization where needed, secure password policies (minimum length/complexity enforced server-side).

## Security

- Never hardcode secrets — use `.env` / `.env.example` with no real values committed.
- Validate and sanitize every input at the API boundary.
- Defend against NoSQL injection, XSS, CSRF, JWT attacks, replay attacks.
- Rate limit sensitive endpoints (auth, AI calls) via Redis.
- Always call out security implications of a design choice explicitly, don't just implement silently.

## CORS

Frontend on `localhost:5173`, backend on `localhost:8000`. Allow credentials, `Authorization`, and any custom headers the frontend needs.

## AI architecture

Never call an AI provider directly from a route handler. Always:

```
Route → AIService → Provider Adapter (OpenAI / Gemini / Anthropic / Ollama / local) → Prompt Builder → Response Parser → Storage
```

Providers must be swappable without touching business logic — new adapters implement a common interface.

## File storage

Support images, PDF, audio, documents. Validate file size, extension, and MIME type server-side before accepting an upload.

## Logging

Structured logging for requests, errors, warnings, performance, AI calls, and authentication events. Never log passwords, tokens, or other secrets.

## Redis

Caching, rate limiting, session storage, AI response cache, dashboard cache.

## Background tasks

Use in-memory async processing or job queues (like BullMQ/Redis) initially; design interfaces so a future move to a heavier worker architecture doesn't require reshaping the service layer. Background work includes PDF parsing, AI processing, email, notifications.

## Testing

Every backend feature ships with tests before it's considered done: imports, type hints, routes, validation, auth, MongoDB, Redis, Swagger/OpenAPI, edge cases, error handling.

## Frontend integration rule

Never assume how the frontend works — inspect the actual React code first (components, forms, buttons, routes, existing API-shaped calls, auth flow, loading/error states) before designing or implementing a backend feature. Build the backend to match what the frontend actually expects, changing the frontend only when there's no reasonable way to avoid it — and never for UI/design reasons.

## Development workflow (per feature)

1. Understand the relevant frontend slice.
2. Design the feature.
3. Design the database shape for it.
4. Design the API for it.
5. Implement.
6. Test.
7. Review (architecture, naming, performance, security, scalability, duplication, readability, type hints, folder organization).
8. Refactor.
9. Document.
10. Only then move to the next slice.

Never generate an entire backend, or the entire next module, in one pass. Never skip the review or documentation step to move faster.

## Error handling

When something breaks: never guess. Investigate, find the root cause, explain why it happened, fix it permanently, and check whether the same class of bug exists elsewhere. Don't patch symptoms.

## Documentation

Keep `README.md`, `ARCHITECTURE.md`, `API.md`, `DATABASE.md`, and `CHANGELOG.md` current. Update them whenever the architecture changes — documentation debt is not acceptable.

## Non-negotiables

- No placeholder code, no `TODO`s, no faked implementations, no ignored exceptions, no skipped validation.
- Don't move to the next feature until implementation, tests, review, and docs for the current one are all done.
- If requirements are unclear, ask before coding.
- Explain architectural decisions before implementing them.
