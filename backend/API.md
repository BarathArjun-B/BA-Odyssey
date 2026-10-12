# API Documentation

Base Path: `/api/v1`

## Standard Envelopes

**Success Envelope**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Envelope**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid fields provided",
    "details": [...]
  }
}
```

## Endpoints

### Authentication
- `POST /auth/register` - Register a new user and return access/refresh tokens.
- `POST /auth/login` - Authenticate and return access/refresh tokens.
- `POST /auth/refresh` - Rotate access and refresh tokens.
- `POST /auth/logout` - Invalidate tokens and clear cookies.

### Users & Settings
- `GET /users/me` - Get current user profile.
- `PATCH /users/me` - Update profile.
- `PATCH /users/me/settings` - Update app settings (e.g. theme, goal).
- `GET /users/me/export` - Export user data as JSON.
- `POST /users/me/import` - Import and migrate LocalStorage data.
- `DELETE /users/me/data` - Soft delete account (requires confirmation, audit-logged).

### Problem Journal
- `GET /problems` - List problems (paginated, supports `?tags=` filter).
- `POST /problems` - Create a new problem.
- `GET /problems/:id` - Get problem details.
- `PATCH /problems/:id` - Update problem.
- `DELETE /problems/:id` - Delete problem.

### Ideas
- `GET /ideas` - List ideas.
- `POST /ideas` - Create an idea (scores computed server-side).
- `GET /ideas/:id` - Get idea details.
- `PATCH /ideas/:id` - Update idea.
- `DELETE /ideas/:id` - Delete idea.

### Founder Growth
- `GET /growth/:type` - List growth items (`book`, `concept`, `networking`, `skill`).
- `POST /growth/:type` - Create a growth item.
- `PATCH /growth/:type/:id` - Update growth item.
- `DELETE /growth/:type/:id` - Delete growth item.

### Founder Operating System
- `GET /operating-system/logs?from=&to=` - Get logs within a date range.
- `PATCH /operating-system/logs/:date` - Upsert a daily log flag.

### Weekly Reviews
- `GET /reviews/:weekOf` - Get review for a specific week.
- `PUT /reviews/:weekOf` - Upsert weekly review.

### Notes
- `GET /notes` - List notes for authenticated user (ordered with pinned first; supports `?q=` text search and `?tag=` filter).
- `POST /notes` - Create a new note for authenticated user.
- `GET /notes/:id` - Get single note details (enforces user ownership).
- `PUT /notes/:id` - Update note title, content, tags, or pin status (enforces user ownership).
- `DELETE /notes/:id` - Permanently delete note (enforces user ownership).

### Dashboard & Utilities
- `GET /dashboard/summary` - Get founder score, streak, and goal progress.
- `GET /search?q=` - Search across problems and ideas.

### File Storage (Phase 10)
- `POST /files/upload` - Upload a file (validates size and MIME type).

### AI Layer (Phase 11+)
- `POST /ai/mentor/message` - Send message to AI mentor.
- `GET /ai/mentor/conversations` - List mentor conversations.
- `POST /ai/idea-suggestions` - Generate startup ideas from selected problems.
