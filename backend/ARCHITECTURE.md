# Backend Architecture

## Overview
The BA Odyssey backend is built on a modern **Node.js, Express, and TypeScript** stack, backed by **MongoDB (Mongoose)** and **Redis**. It follows a **Clean Architecture** approach with strict separation of concerns, ensuring business logic is isolated from the HTTP layer and database access layer.

## Folder Structure

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

## Request Lifecycle
1. **HTTP Request** enters Express.
2. **Global Middleware**: `helmet` (security), CORS (with credentials), body parsing (limit: 1mb).
3. **Rate Limiting**: Redis-backed, strict for `/auth`.
4. **Authentication**: JWT access token in `Authorization` header validated; `userId` attached to `req`.
5. **Route Middleware**: Zod validation of `req.body`, `req.query`, `req.params`.
6. **Controller**: Extracts data from `req` and calls the Service.
7. **Service**: Executes core business logic.
8. **Repository**: Mongoose queries (enforcing `userId` isolation).
9. **Response**: Formats result into standard success envelope.
10. **Error Handler**: Global catch-all formats errors to standard error envelope.

## Authentication & Security
- **Access Tokens**: Short-lived, kept in-memory on the client.
- **Refresh Tokens**: Long-lived, stored in an `httpOnly`, `Secure`, `SameSite=Strict` cookie. Rotated on every use.
- **CORS**: Explicit origins allowed with `credentials: true`.
- **Passwords**: Hashed with bcrypt (cost >= 12).
- **IDOR Prevention**: All repository queries include `userId` from the verified JWT.

## External Services
- **AI Service**: Routes never call providers (OpenAI, Gemini) directly. They use `AIService` -> Provider Adapter.
- **Redis**: Caching (Dashboard summaries, AI responses), Rate Limiting, and Session Management.
- **File Storage**: Abstracted behind a storage adapter (local disk or S3).
