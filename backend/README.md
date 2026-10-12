# BA Odyssey — Backend Service

The Node.js, Express, TypeScript, and MongoDB backend powering **BA Odyssey**.

## Features

- **TypeScript Architecture**: Strict types for Express requests, models, controllers, and services.
- **MongoDB Persistence**: Mongoose models (`User`, `Note`, etc.) with compound indexes and schema validations.
- **JWT Authentication**: Access and refresh tokens with HTTP-only cookies and bcrypt password hashing.
- **Notes API**: Full CRUD, text search (`?q=`), tag filtering (`?tag=`), and pin ordering (`isPinned: -1, updatedAt: -1`) under `/api/v1/notes`.
- **Security**: Helmet headers, CORS credentials policy, mass-assignment protection, and request sanitization.
- **Swagger Documentation**: Interactive OpenAPI 3.0 docs at `/api/docs`.
- **Automated Testing**: Jest and Supertest test suites running sequentially (`--runInBand`) against an isolated test database.

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB running locally on port 27017 or a valid MongoDB Atlas connection string

### Environment Configuration

Create a `.env` file in the `backend/` directory:

```env
NODE_ENV=development
PORT=5005
MONGODB_URI=mongodb://localhost:27017/ba_odyssey
JWT_SECRET=dev_jwt_secret_change_in_production_1234567890
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=dev_refresh_secret_change_in_production_0987654321
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### Installation

```bash
cd backend
npm install
```

### Running the Backend

Development mode (with nodemon):
```bash
npm run dev
```

Build TypeScript to `dist/`:
```bash
npm run build
```

Run compiled production build:
```bash
npm start
```

### Running Tests

```bash
npm test
```
Tests run against `mongodb://localhost:27017/ba_odyssey_test` and clean up after execution.

---

## API Overview

Base Path: `/api/v1`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/register` | Register new founder account | No |
| `POST` | `/auth/login` | Login and receive tokens | No |
| `POST` | `/auth/refresh` | Refresh access token | Cookie |
| `POST` | `/auth/logout` | Clear refresh token cookie | No |
| `GET` | `/auth/me` | Get authenticated user | Yes |
| `GET` | `/notes` | List notes (supports `?q=`, `?tag=`, `?pinned=`) | Yes |
| `POST` | `/notes` | Create a new note | Yes |
| `GET` | `/notes/:id` | Get single note by ID | Yes |
| `PUT` | `/notes/:id` | Update note | Yes |
| `DELETE` | `/notes/:id` | Permanently delete note | Yes |

Interactive Swagger documentation is available at `http://localhost:5005/api/docs`.
