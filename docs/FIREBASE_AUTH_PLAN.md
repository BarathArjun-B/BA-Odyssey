# BA Odyssey — Firebase Google Authentication Roadmap

## 1. Executive Summary

This document specifies the technical architecture, security considerations, and implementation steps for migrating BA Odyssey to **Firebase Authentication** with **Google OAuth (Sign in with Google)**, backed by our existing Node.js/Express backend and MongoDB database.

During development, access is maintained via the isolated `DEV_USER` bypass. This roadmap details how to introduce Google Sign-In seamlessly once development of all core internal pages is concluded.

---

## 2. Target Architecture

```
+-------------------------------------------------------------------------+
|                              FRONTEND                                   |
|                                                                         |
|  [ User clicks "Sign in with Google" ]                                  |
|                 │                                                       |
|                 ▼                                                       |
|  Firebase Web SDK (signInWithPopup / GoogleAuthProvider)                |
|                 │                                                       |
|                 ▼                                                       |
|  Receives Firebase User Credential (ID Token, UID, Email, Photo)        |
|                 │                                                       |
|                 ▼                                                       |
|  POST /api/v1/auth/firebase-google-login  { idToken }                   |
+─────────────────┼───────────────────────────────────────────────────────+
                  │
                  ▼
+─────────────────┼───────────────────────────────────────────────────────+
|                 ▼            BACKEND (Express.js)                       |
|                                                                         |
|  Firebase Admin SDK (admin.auth().verifyIdToken(idToken))               |
|                 │                                                       |
|                 ▼                                                       |
|  Decodes verified claims: { uid, email, name, picture }                 |
|                 │                                                       |
|                 ▼                                                       |
|  Find or Upsert User in MongoDB:                                        |
|    - Query: { $or: [{ firebaseUid: uid }, { email }] }                  |
|    - If user exists by email: attach firebaseUid & avatar               |
|    - If new: create User with verified email and default founder stats  |
|                 │                                                       |
|                 ▼                                                       |
|  Issue Odyssey JWT Access Token & Refresh Cookie                        |
|                 │                                                       |
|                 ▼                                                       |
|  Respond with 200 { user, accessToken }                                 |
+─────────────────────────────────────────────────────────────────────────+
```

---

## 3. Configuration & Environment Setup

### 3.1. Firebase Console Setup
1. Create a Firebase project: `ba-odyssey-prod` (or link existing GCP project).
2. In **Authentication > Sign-in method**:
   - Enable **Google** provider.
   - Configure project support email and OAuth consent screen branding.
   - Add authorized domains: `localhost`, `127.0.0.1`, and production domain.
3. In **Project Settings > Service Accounts**:
   - Generate and download a private key JSON (`firebase-service-account.json`).

### 3.2. Environment Variables

#### Frontend (`.env` or `.env.local`):
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=ba-odyssey.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ba-odyssey
VITE_FIREBASE_STORAGE_BUCKET=ba-odyssey.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

#### Backend (`backend/.env`):
```env
FIREBASE_PROJECT_ID=ba-odyssey
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@ba-odyssey.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

---

## 4. Frontend Implementation Steps

### 4.1. Install Dependency
```bash
npm install firebase
```

### 4.2. Initialize Firebase Client (`src/lib/firebase.js`)
```javascript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
```

### 4.3. Update `AuthContext.jsx` with Google Sign-In Method
```javascript
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();

    // Exchange Firebase ID token for BA Odyssey session
    const { data } = await api.post('/auth/firebase-google', { idToken });
    
    if (data?.data?.accessToken) {
      localStorage.setItem('ba_access_token', data.data.accessToken);
    }
    setUser(data.data.user);
    return data.data.user;
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    throw error;
  }
};
```

### 4.4. Cosmic Google Sign-In UI Button (`src/pages/Auth/AuthPage.jsx`)
```jsx
<button
  type="button"
  onClick={handleGoogleSignIn}
  className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-3 bg-white/[0.04] hover:bg-white/[0.08] border border-[var(--border-glass)] text-white text-body-sm font-medium transition-all shadow-lg hover:shadow-violet-500/10"
>
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    {/* Clean Google 'G' icon path */}
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
  <span>Continue with Google</span>
</button>
```

---

## 5. Backend Implementation Steps

### 5.1. Install Dependency
```bash
cd backend
npm install firebase-admin
```

### 5.2. User Model Update (`backend/src/models/User.ts`)
Add optional `firebaseUid` and `avatar` fields, and make `password` optional when a user authenticates via OAuth:
```typescript
export interface IUser extends Document {
  firebaseUid?: string;
  avatar?: string;
  authProvider: 'local' | 'google';
  // existing fields...
}

const userSchema = new Schema<IUser>({
  firebaseUid: {
    type: String,
    sparse: true,
    unique: true,
  },
  avatar: String,
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  password: {
    type: String,
    select: false,
    required: function(this: IUser) {
      return this.authProvider === 'local';
    },
  },
  // existing fields...
});
```

### 5.3. Firebase Admin Initializer (`backend/src/config/firebase.ts`)
```typescript
import * as admin from 'firebase-admin';
import { config } from './env';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const firebaseAuth = admin.auth();
```

### 5.4. Backend Auth Controller Endpoint (`backend/src/controllers/auth.controller.ts`)
```typescript
export const firebaseGoogleLogin = asyncHandler(async (req: Request, res: Response) => {
  const { idToken } = req.body;
  if (!idToken) {
    throw new AppError('Firebase ID token is required', 400, 'VALIDATION_ERROR');
  }

  // 1. Verify token with Firebase Admin
  const decodedToken = await firebaseAuth.verifyIdToken(idToken);
  const { uid, email, name, picture } = decodedToken;

  if (!email) {
    throw new AppError('Google account must provide an email address', 400, 'VALIDATION_ERROR');
  }

  // 2. Find or Upsert User
  let user = await User.findOne({
    $or: [{ firebaseUid: uid }, { email }],
  });

  if (user) {
    // Link firebaseUid if previously registered with local email/password
    let updated = false;
    if (!user.firebaseUid) {
      user.firebaseUid = uid;
      updated = true;
    }
    if (picture && !user.avatar) {
      user.avatar = picture;
      updated = true;
    }
    if (updated) await user.save();
  } else {
    // Create new Google-authenticated user
    const [firstName, ...lastNameParts] = (name || 'Founder').split(' ');
    const username = email.split('@')[0] + '_' + Math.floor(1000 + Math.random() * 9000);

    user = await User.create({
      firstName,
      lastName: lastNameParts.join(' ') || '',
      username,
      email,
      firebaseUid: uid,
      avatar: picture,
      authProvider: 'google',
    });
  }

  // 3. Issue standard Odyssey JWT session
  sendTokenResponse(user, 200, res);
});
```

---

## 6. LocalStorage Data Cloud Sync Strategy

Currently, user domain data (`ba_data_v1` and `ba_academy_v1`) is saved locally in browser storage. When Google Authentication goes live:

1. **Pre-Sync Check**: On first authenticated login, check if `localStorage.getItem('ba_data_v1')` exists and contains problems or ideas.
2. **Merge Prompt or Automatic Sync**:
   - Provide a background endpoint `POST /api/v1/sync/bootstrap` to ingest existing local problems, ideas, and academy achievements into the user's MongoDB account.
   - Set a flag `localStorage.setItem('ba_cloud_synced', 'true')` once uploaded.
3. **Graceful Fallback**: If offline or server is temporarily unreachable, LocalStorage remains active as the local write cache.

---

## 7. Rollback & Cutover Checklist

| Step | Action | Verification |
|---|---|---|
| 1 | Create Firebase project & enable Google Auth | Verify OAuth Client ID in GCP console |
| 2 | Add `backend/src/config/firebase.ts` & Admin SDK | Run `npm run build` in `backend` |
| 3 | Add `POST /api/v1/auth/firebase-google` | Run Supertest endpoint tests |
| 4 | Add `src/lib/firebase.js` & Google button in `AuthPage.jsx` | Test popup sign-in in browser |
| 5 | Verify account creation & cookie/token issuance | Check MongoDB `users` collection |
| 6 | Disable Dev Bypass flag (`VITE_AUTH_BYPASS=false`) | Verify redirected to Google login flow |
