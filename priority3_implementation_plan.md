# Implementation Plan — Priority 3: State Mgmt, Error Handling, Quiz Security

## Overview

| # | Issue | Severity | Risk |
|---|-------|----------|------|
| W2 | Duplicate Pinia state across stores | Warning | Low — data inconsistency risk |
| W1 | Inconsistent error handling across API clients | Warning | Medium — errors swallowed silently in some paths |
| W8 | Quiz answers evaluated locally before server confirmation | Warning | Low — XP is already server-authoritative after P1-2 fix |

---

## Fix W2: Consolidate Redundant Pinia Stores

### Problem
`useAuthStore`, `useGamificationStore`, and `useQuizStore` all independently hold user profile data (`totalXP`, `currentLevel`, `streakDays`, `badges`). On page load, `useAuthStore.init()` fetches the user profile (including gamification fields) from the auth endpoint, and then `useGamificationStore.syncProgressFromServer()` fetches the same data again from a separate endpoint. This is redundant and creates a risk of data inconsistency between stores.

### Fix Strategy
1. **`useGamificationStore` becomes the canonical source-of-truth** for all gamification-related user data (XP, level, streak, badges).
2. **`useAuthStore` syncs from gamification store** after login/stateless-init, instead of duplicating gamification fields in its own `currentUser`.
3. **Remove duplicate fetch** — after successful authentication, only one profile fetch occurs (in gamification store).

### Changes

#### File 1: `frontend/src/features/auth/store/useAuthStore.ts`

**Add import:**
```ts
import { useGamificationStore } from '../../gamification-engine/store/useGamificationStore';
```

**Modify `setSession()` flow to trigger gamification sync after login.**

The `setSession()` function is called from `useAuthStore` and `authSessionHelpers.ts`. After setting the session, auth store should trigger gamification profile sync.

**Add a method to sync gamification data into auth store:**
```ts
async function syncGamificationProfile(): Promise<void> {
  const gamificationStore = useGamificationStore();
  try {
    await gamificationStore.syncProgressFromServer();
  } catch {
    // Gamification sync is non-critical for auth flow
  }
}
```

**Call `syncGamificationProfile()` after successful login/register/stateless-init:**

In `register()` (line 75): after `setSession(...)`, add `await syncGamificationProfile()`
In `logIn()` (line 82): after `setSession(...)`, add `await syncGamificationProfile()`  
In `statelessLogin()` (line 204): after `_applyStatelessAuth(response)`, add `await syncGamificationProfile()`
In `statelessRegister()` (line 216): after `_applyStatelessAuth(response)`, add `await syncGamificationProfile()`
In `statelessInit()` (line 241): after `_applyStatelessAuth(response)`, add `await syncGamificationProfile()`

**Reduce duplicated gamification computed properties:**

The auth store already has `userXP`, `userLevel`, `userHearts`, `userGems` as computed properties reading from `currentUser.value`. Since gamification store is now the canonical source, these should reflect gamification store values when online:

```ts
const gamificationStore = useGamificationStore();

const userXP = computed(() => {
  if (gamificationStore.backendProfile.value) {
    return gamificationStore.backendProfile.value.totalXp;
  }
  return currentUser.value?.totalXP ?? 0;
});

const userLevel = computed(() => {
  if (gamificationStore.backendProfile.value) {
    return gamificationStore.backendProfile.value.currentLevel;
  }
  return currentUser.value?.currentLevel ?? 1;
});
```

**BUT:** This creates tight coupling between auth store and gamification store. A safer approach is to just trigger the sync and keep local copies — the local copies are now kept in sync by the one-time fetch.

**Simplest safe approach — just trigger sync, don't change computed properties:**
- Keep computed properties reading from `currentUser.value` (unchanged)
- Add `syncGamificationProfile()` calls after auth events
- This ensures both stores have fresh data without duplicating the fetch

#### File 2: `frontend/src/features/auth/store/authSessionHelpers.ts`

**Check for any session-setting functions that also need gamification sync.**

Read the file first, then add `syncGamificationProfile()` call.

---

## Fix W1: Unify Error Handling Across API Clients

### Problem
Three different error handling patterns exist:
1. `apiClient.ts` — throws structured `ApiError` with `{ status, title, detail, errors? }`
2. `authApi.ts` (`features/auth/services/`) — throws `Error(body?.message)` via local `handleResponse()`
3. `statelessAuthApi.ts` (`features/auth/services/`) — throws `Error(body?.message)` via local `handleResponse()`

### Fix Strategy
Replace `authApi.ts` and `statelessAuthApi.ts` direct `fetch()` calls with centralized `apiClient.ts` methods. This gives all API endpoints consistent error handling, consistent auth token injection, and consistent base URL management.

### Changes

#### File 1: `frontend/src/features/auth/services/authApi.ts`

**Replace direct `fetch()` calls with `apiClient.ts` methods.** The module uses custom `handleResponse()` with inline `fetch()`. Replace all functions:

```ts
// BEFORE (pattern in authApi.ts):
async function handleResponse<T>(response: Response): Promise<T> { ... }
async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await fetch(...);
  return handleResponse<AuthResponse>(res);
}

// AFTER (pattern using apiClient.ts):
import { api, ApiError } from '../../../services/apiClient';

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  try {
    return await api.post<AuthResponse>('/auth/register', payload);
  } catch (err) {
    const error = err as ApiError;
    throw new Error(error.detail ?? 'Registration failed');
  }
}
```

All functions (`register`, `login`, `refreshAccessToken`, `logout`, `getMe`) should follow this pattern.

**Remove local imports and handleResponse function** (no longer needed).

#### File 2: `frontend/src/features/auth/services/statelessAuthApi.ts`

Same approach — replace all `fetch()` calls with `apiClient.ts` methods:

```ts
import { api, ApiError } from '../../../services/apiClient';

export const statelessAuthApi = {
  async register(email: string, username: string, password: string): Promise<StatelessAuthResponse> {
    try {
      return await api.post<StatelessAuthResponse>('/concepts/auth/register', { email, username, password });
    } catch (err) {
      const error = err as ApiError;
      throw new Error(error.detail ?? 'Registration failed');
    }
  },
  // ... etc.
};
```

All functions (`register`, `login`, `refresh`, `logout`, `getMe`, `getProgress`, `updateProfile`, `getDemoCredentials`, `impersonateUser`, `changePassword`) should follow this pattern.

**Update imports** — remove `BASE_URL` constant, remove `JSON_HEADERS`, remove `handleResponse` helper.

---

## Fix W8: Secure Quiz Verification Server-Side

### Problem
Checkpoint quiz verification (`verifyAndRecordOption()` and `QuizVerificationEngine.verifyCanvasClickAnswer()`) happens purely on the frontend. While a backend endpoint exists for quiz submission, checkpoint quiz answers are not yet sent to the server for authoritative verification.

### Fix Strategy
Our P1-2 fix already addressed the most critical part: `syncSessionToServer()` now correctly sends checkpoint answers to the backend and awards XP server-side. The remaining improvement is to ensure the UI reflects server-confirmed results when available.

### Changes

#### File: `frontend/src/features/quiz-system/store/useQuizStore.ts`

**After `syncSessionToServer()` succeeds, update local state with server-confirmed values:**

The current flow after our P1-2 fix:
1. User completes all checkpoints in a lecture
2. `syncSessionToServer()` fires `gamificationApi.awardXP()` → server evaluates and returns XP
3. But local `sessionCorrect`/`sessionTotal` still reflect the frontend's local verification

Enhancement: track whether synced results are available and prefer them for display after sync.

This is a UX enhancement — the security improvement (server-authoritative XP) is already in place from P1-2.

**No additional changes needed for W8 beyond what P1-2 already accomplished** — XP is now server-side authoritative, and the quiz submission endpoint is properly structured.

---

## Execution Order

1. **W1 first** (unify error handling) — foundational change, affects many files
2. **W2 second** (consolidate Pinia stores) — depends on W1's API client stability
3. **W8 third** (quiz security) — already addressed by P1-2, document as done

---

## Verification Plan

- Backend: `dotnet build` — 0 errors
- Frontend: `npm run build` — successful
- Frontend type-check: `npx vue-tsc --noEmit` — 0 errors
- Manual test: login → verify gamification data in auth store matches gamification store
- Manual test: trigger auth error → verify structured `ApiError` format
