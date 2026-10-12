# Database Schema

BA Odyssey uses MongoDB via Mongoose. All collections are named in `snake_case` plural and use standard MongoDB `ObjectId`s.

## Collections

### `users`
- `_id`: ObjectId
- `email`: String (Unique)
- `passwordHash`: String
- `founderName`: String
- `theme`: Enum (`light`, `dark`, `system`)
- `problemGoal`: Number
- `role`: String
- `refreshTokenVersion`: Number
- `createdAt`, `updatedAt`

### `problems`
- `_id`: ObjectId
- `userId`: ObjectId (Ref `users`)
- `date`: String
- `problem`: String
- `whoFaces`: String
- `frequency`: Enum (`Daily`, `Weekly`, `Monthly`, `Rarely`, `One-off`)
- `currentSolution`: String
- `whyBad`: String
- `painLevel`: Number (1-10)
- `peopleAffected`: Number (1-10)
- `willingnessToPay`: Number (1-10)
- `canIBuild`: Number (1-10)
- `marketSizeEstimate`: Enum (`Niche`, `Medium`, `Large`, `Massive`)
- `marketSizeNote`: String
- `myIdea`: String
- `notes`: String
- `tags`: Array of Strings
- **Indexes**: `{ userId: 1, date: -1 }`, `{ userId: 1, tags: 1 }`, Text index on `problem` and `notes`.

### `ideas`
- `_id`: ObjectId
- `userId`: ObjectId (Ref `users`)
- `sourceProblemIds`: Array of ObjectIds (Ref `problems`)
- `customer`: String
- `solution`: String
- `revenueModel`: Enum (`Subscription`, `Marketplace`, `Transaction fee`, `One-time`, `Ads`, `Usage-based`, `Other`)
- `difficulty`: Enum (`Low`, `Medium`, `High`)
- `startupPotentialScore`: Number (Computed server-side)
- `status`: Enum (`HIGH POTENTIAL`, `VALIDATED`, `NEEDS DATA`, `ARCHIVED`)
- **Indexes**: `{ userId: 1, startupPotentialScore: -1 }`.

### `growth_items`
- `_id`: ObjectId
- `userId`: ObjectId (Ref `users`)
- `type`: Enum (`book`, `concept`, `networking`, `skill`)
- `title`, `author`, `takeaway`, `dateFinished` (For books)
- `concept`, `source`, `explanation` (For concepts)
- `goal`, `targetDate`, `status` (For networking)
- `description` (For skills)

### `daily_logs`
- `_id`: ObjectId
- `userId`: ObjectId (Ref `users`)
- `date`: String (YYYY-MM-DD)
- `dsa`: Boolean
- `building`: Boolean
- `businessReading`: Boolean
- `problemCollection`: Boolean
- `networking`: Boolean
- `reflection`: Boolean
- **Unique Index**: `{ userId: 1, date: 1 }`

### `weekly_reviews`
- `_id`: ObjectId
- `userId`: ObjectId (Ref `users`)
- `weekOf`: String (YYYY-MM-DD)
- `reflection`: String
### `notes`
- `_id`: ObjectId
- `userId`: ObjectId (Ref `users`)
- `title`: String (Required, max 200)
- `content`: String (Required, max 50,000)
- `tags`: Array of Strings (Max 20, max 50 chars each, normalized lowercase)
- `isPinned`: Boolean (Default: false)
- `createdAt`, `updatedAt`: Date
- **Indexes**: Compound index `{ userId: 1, isPinned: -1, updatedAt: -1 }`, `{ userId: 1, tags: 1 }`, Text index on `title` and `content`.

## Data Migration from LocalStorage
The `POST /api/v1/users/me/import` endpoint handles the one-time migration of `ba_data_v1` LocalStorage data. It re-maps client-generated string IDs (`p_...`, `i_...`) to standard `ObjectId`s and recomputes all scores server-side.
