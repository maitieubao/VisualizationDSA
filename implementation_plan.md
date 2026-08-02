# Implementation Plan: Priority 1 & Priority 2 Fixes

**Generated from:** End-to-End Integration Audit Report
**Scope:** Priority 1 (Broken Integrations) + Priority 2 (Architectural Inconsistencies)
**Total Items:** 9 fixes across 7 files (frontend) + 4 files (backend)

---

## Phase 1: Priority 1 — Broken Integrations (Blocks Core Functionality)

---

### Fix P1-1: Gamification API — Missing `/me` in User Progress & XP Endpoints

**Problem:** `frontend/src/services/gamificationApi.ts` calls `/users/progress` and `/users/xp`, but the backend exposes `/users/me/progress` and `/users/me/xp` respectively. Both return 404.

**Impact:** The entire gamification sync loop is broken — `earnsXPWithSync()` and `syncProgressFromServer()` in `useGamificationStore.ts` always fail.

**Files to Modify:**
- `frontend/src/services/gamificationApi.ts`

**Changes:**

| Line | Current | Replace With |
|------|---------|--------------|
| 32 | `api.get<UserProgressResponse>('/users/progress')` | `api.get<UserProgressResponse>('/users/me/progress')` |
| 36 | `api.post<XPAwardResponse>('/users/xp', { amount, reason })` | `api.post<XPAwardResponse>('/users/me/xp', { amount, reason })` |

**Verification:**
1. Run the frontend dev server and open the browser network tab.
2. Navigate to the dashboard/gamification view.
3. Confirm `GET /api/v1/users/me/progress` returns 200 with user progress data.
4. Complete a quiz and confirm `POST /api/v1/users/me/xp` fires with the correct payload.

---

### Fix P1-2: Quiz Submission Payload Structure Mismatch

**Problem:** `frontend/src/features/quiz-system/service/quizApi.ts` sends `{ quizId, score, maxScore, passed }` to `POST /api/v1/quizzes/attempt`, but the backend `QuizzesController.SubmitAttempt()` expects `QuizAttemptRequest` with `{ QuizId: Guid, Answers: int[] }`. The backend never receives actual answers, so no XP is ever awarded for quiz completion.

**Impact:** The gamification loop is completely disconnected — completing a quiz yields zero XP on the server.

**Files to Modify:**
- `frontend/src/features/quiz-system/service/quizApi.ts`
- `frontend/src/features/quiz-system/store/useQuizStore.ts`

**Changes:**

#### File 1: `frontend/src/features/quiz-system/service/quizApi.ts`

Replace the `submitQuizAttempt` function body (lines 38-73). The new function should send `QuizId` and `Answers` (not `score`, `maxScore`, `passed`):

```ts
export async function submitQuizAttempt(
  quizId: string,
  answers: number[],
  token: string | null,
): Promise<{ success: boolean; xpAwarded?: number; message?: string } | null> {
  if (!token) return null;

  try {
    const response = await fetch(`${BASE_URL}/api/v1/quizzes/attempt`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        quizId,
        answers,
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.warn(`[quizApi] submitQuizAttempt: HTTP ${response.status}`);
      return null;
    }

    return (await response.json()) as { success: boolean; xpAwarded?: number; message?: string };
  } catch (err) {
    console.warn('[quizApi] submitQuizAttempt failed (offline?):', err);
    return null;
  }
}
```

#### File 2: `frontend/src/features/quiz-system/store/useQuizStore.ts`

Update `syncSessionToServer()` (lines 83-88):

```ts
async function syncSessionToServer(quizId: string): Promise<void> {
  if (sessionTotal.value === 0) return;
  const authStore = useAuthStore();
  const answers = backendAnswers.value.map(a => a ?? -1);
  await submitQuizAttempt(quizId, answers, authStore.getAccessToken());
}
```

Note: `backendAnswers` is the new ref that will need to exist in the store. If it does not, we need to track the selected answers during the backend quiz flow. See the note below.

**IMPORTANT:** The current `syncSessionToServer()` uses frontend-computed `sessionCorrect.value` and `sessionTotal.value` for `score` and `maxScore`. The new approach sends actual answer indices to the backend, letting the backend `QuizzesController` evaluate correctness and award XP. The frontend should still compute local `sessionAccuracy` for display, but the actual grading must happen server-side.

**Verification:**
1. Start a quiz session and submit answers.
2. Capture the network request to `POST /api/v1/quizzes/attempt`.
3. Confirm the request body contains `{ quizId: "<guid>", answers: [0, 2, 1, ...] }` — not `{ quizId, score, maxScore, passed }`.
4. Confirm the backend response includes `XPEarned` > 0 if the user passed.

---

### Fix P1-3: Learning Progress API — 404'd Endpoints

**Problem:** `frontend/src/services/learningProgressApi.ts` calls `/learning-progress` and `/learning-progress/complete`, but no backend controller serves these endpoints. The correct backend endpoints are `GET /users/me/progress` and `POST /users/me/modules/{moduleId}`.

**Impact:** Learners can never persist their module completion status or view their learning progress from the server.

**Files to Modify:**
- `frontend/src/services/learningProgressApi.ts`

**Changes:**

| Line | Current | Replace With |
|------|---------|--------------|
| 16 | `api.get<LearningProgressDto[]>('/learning-progress')` | `api.get<LearningProgressDto[]>('/users/me/progress')` |
| 19 | `api.post<CompleteModuleResponse>('/learning-progress/complete', { moduleId })` | `api.post<CompleteModuleResponse>('/users/me/modules/' + moduleId)` |

Note: The `LearningProgressDto` and `CompleteModuleResponse` types may need alignment with the backend `UserProgressDto` and the empty 204 response from `CompleteModule`. Update types if needed:

```ts
// Replace CompleteModuleResponse with the actual backend response shape:
export interface ModuleCompletionResponse {
  message: string;
  moduleId: string;
}
```

**Verification:**
1. Mark a module as complete in the learner dashboard.
2. Confirm `POST /api/v1/users/me/modules/{moduleId}` fires and returns 204.
3. Confirm `GET /api/v1/users/me/progress` returns the updated `completedModuleIds` list.

---

### Fix P1-4: Fix Quiz History Endpoint to Include Pagination Params

**Problem:** `frontend/src/services/quizApi.ts:55` calls `GET /quizzes/history` without pagination query params, but the backend `QuizzesController.GetHistory` has default `pageNumber=1, pageSize=10`. Users with >10 quiz attempts never see older results.

**File to Modify:**
- `frontend/src/services/quizApi.ts`

**Change:**

| Line | Current | Replace With |
|------|---------|--------------|
| 54-55 | `getHistory: () => api.get<QuizHistoryEntry[]>('/quizzes/history')` | `getHistory: (page = 1, pageSize = 10) => api.get<QuizHistoryEntry[]>(\`/quizzes/history?pageNumber=${page}&pageSize=${pageSize}\`)` |

---

## Phase 2: Priority 2 — Architectural Inconsistencies

---

### Fix P2-1: Add Class-Level Route & Convert TeacherStudioController to Relative Paths

**Problem:** All 10 endpoint attributes in `TeacherStudioController.cs` use full absolute paths (`"api/v{version:apiVersion}/teacher-studio/roadmaps"`) in action-level attributes without a class-level `[Route]`. Every other controller in the project uses the consistent pattern of a class-level `[Route("api/v{version:apiVersion}/[controller]")]` with relative action paths.

**Impact:** Inconsistent routing pattern creates maintenance risk and makes the controller an architectural outlier.

**File to Modify:**
- `backend/src/WebApi/Controllers/TeacherStudioController.cs`

**Changes:**

1. **Add class-level route attribute** after the existing `ApiController` attribute:
   - Add: `[Route("api/v{version:apiVersion}/teacher-studio")]`

2. **Convert all action-level routes from absolute to relative** — remove the `api/v{version:apiVersion}/teacher-studio` prefix from each attribute:

| Current (line) | Replace With |
|----------------|--------------|
| Line 25: `[HttpGet("api/v{version:apiVersion}/teacher-studio/roadmaps")]` | `[HttpGet("roadmaps")]` |
| Line 34: `[HttpPost("api/v{version:apiVersion}/teacher-studio/roadmaps")]` | `[HttpPost("roadmaps")]` |
| Line 43: `[HttpPut("api/v{version:apiVersion}/teacher-studio/roadmaps/{id:guid}")]` | `[HttpPut("roadmaps/{id:guid}")]` |
| Line 63: `[HttpDelete("api/v{version:apiVersion}/teacher-studio/roadmaps/{id:guid}")]` | `[HttpDelete("roadmaps/{id:guid}")]` |
| Line 87: `[HttpPost("api/v{version:apiVersion}/teacher-studio/roadmaps/{id:guid}/nodes")]` | `[HttpPost("roadmaps/{id:guid}/nodes")]` |
| Line 107: `[HttpPut("api/v{version:apiVersion}/teacher-studio/roadmaps/{id:guid}/nodes/{nodeId:guid}/content")]` | `[HttpPut("roadmaps/{id:guid}/nodes/{nodeId:guid}/content")]` |
| Line 127: `[HttpPut("api/v{version:apiVersion}/teacher-studio/roadmaps/{id:guid}/nodes/{nodeId:guid}/practice")]` | `[HttpPut("roadmaps/{id:guid}/nodes/{nodeId:guid}/practice")]` |
| Line 147: `[HttpDelete("api/v{version:apiVersion}/teacher-studio/roadmaps/{id:guid}/nodes/{nodeId:guid}")]` | `[HttpDelete("roadmaps/{id:guid}/nodes/{nodeId:guid}")]` |
| Line 167: `[HttpPost("api/v{version:apiVersion}/teacher-studio/roadmaps/{id:guid}/publish")]` | `[HttpPost("roadmaps/{id:guid}/publish")]` |
| Line 191: `[HttpPatch("api/v{version:apiVersion}/roadmaps/{id:guid}/approve")]` | `[HttpPatch("roadmaps/{id:guid}/approve")]` |
| Line 211: `[HttpPatch("api/v{version:apiVersion}/roadmaps/{id:guid}/reject")]` | `[HttpPatch("roadmaps/{id:guid}/reject")]` |
| Line 231: `[HttpPost("api/v{version:apiVersion}/teacher-studio/roadmaps/{id:guid}/clone")]` | `[HttpPost("roadmaps/{id:guid}/clone")]` |

**Verification:**
1. Build the backend solution: `dotnet build backend/VisualizationDSA.sln`
2. Start the backend and check Swagger UI at `/swagger` — all TeacherStudio endpoints should appear under the `TeacherStudio` group with correct paths.
3. Use the frontend Teacher Studio view to create, update, publish, and delete a roadmap — confirm each operation succeeds.

---

### Fix P2-2: Fix SessionController EnterNode to Use Relative Path

**Problem:** `SessionController.EnterNode` uses `[HttpPost("/api/v{version:apiVersion}/nodes/{id}/enter")]` — an absolute path that bypasses the class-level `[Route("api/v{version:apiVersion}/session")]`. The actual endpoint becomes `/api/v1/nodes/{id}/enter` instead of `/api/v1/session/...`.

**File to Modify:**
- `backend/src/WebApi/Controllers/SessionController.cs`

**Changes:**

| Line | Current | Replace With |
|------|---------|--------------|
| 36 | `[HttpPost("/api/v{version:apiVersion}/nodes/{id}/enter")]` | `[HttpPost("enter")]` |
| 37 | Method signature uses `string id` parameter name | Keep as-is (the `{id}` route template still works because the relative path appends to the class-level route) |

Note: After this change, the actual endpoint path changes from `/api/v1/nodes/{id}/enter` to `/api/v1/session/{id}/enter`. The frontend `sessionApi.ts` calls `POST /api/v1/nodes/${nodeId}/enter`, which must also be updated:

**Also modify:**
- `frontend/src/features/gamification-engine/service/sessionApi.ts`

| Line | Current | Replace With |
|------|---------|--------------|
| 58 | `\`${API_BASE}/api/v1/nodes/${nodeId}/enter\`` | `\`${API_BASE}/api/v1/session/${nodeId}/enter\`` |

**Verification:**
1. Start backend. Confirm `POST /api/v1/session/{nodeId}/enter` returns 200 with session data.
2. Start frontend and navigate to a lesson/node. Confirm the node entry request hits the correct endpoint.
3. Test out-of-hearts scenario (402 response) to confirm the error handling path still works.

---

### Fix P2-3: Add Versioned Routes to GemsShopController and RoadmapsController

**Problem:** Both controllers use hardcoded v1 routes (`api/v1/gems-shop` and `api/v1/[controller]`) instead of the versioned pattern `api/v{version:apiVersion}/[controller]` used by all other controllers.

**Files to Modify:**
- `backend/src/WebApi/Controllers/GemsShopController.cs`
- `backend/src/WebApi/Controllers/RoadmapsController.cs`

**Changes:**

#### GemsShopController.cs

| Line | Current | Replace With |
|------|---------|--------------|
| 9 | `[Route("api/v1/gems-shop")]` | `[Route("api/v{version:apiVersion}/[controller]")]` |

#### RoadmapsController.cs

| Line | Current | Replace With |
|------|---------|--------------|
| 12 | `[Route("api/v1/[controller]")]` | `[Route("api/v{version:apiVersion}/[controller]")]` |

**Verification:**
1. Build the backend solution.
2. Confirm the routes still resolve correctly with the versioned prefix.
3. Test the Gems Shop and Roadmap Language pages in the frontend.

---

### Fix P2-4: Return DTOs Instead of Domain Entities from BadgesController

**Problem:** `BadgesController.GetAll()` returns `IEnumerable<Badge>` (a Domain Entity), and `GetMyBadges()` also returns `IEnumerable<Badge>`. This leaks internal entity structure (navigation properties like `UserBadges`) to the frontend, violating Clean Architecture's DTO boundary.

**File to Modify:**
- `backend/src/WebApi/Controllers/BadgesController.cs`

**Changes:**

1. Add the `BadgeDto` import (it already exists in `UserDto.cs` in the `Application.DTOs` namespace, but we need to check if it's accessible from the WebApi project). If `BadgeDto` is not accessible, create a new `BadgeDto` in `backend/src/Application/DTOs/` or reuse the one in `UserDto.cs`.

2. Replace both action return types and body logic:

```csharp
// Replace GetAll() return type and body:
[HttpGet]
[AllowAnonymous]
public async Task<ActionResult<IEnumerable<BadgeDto>>> GetAll()
{
    var badges = await _unitOfWork.Badges.GetAllAsync();
    var result = badges.Select(b => new BadgeDto
    {
        Id          = b.Id,
        Name        = b.Name,
        Description = b.Description,
        Icon        = b.Icon,
        Color       = b.Color,
        EarnedAt    = b.EarnedAt,
    });
    return Ok(result);
}

// Replace GetMyBadges() return type and body:
[HttpGet("my")]
public async Task<ActionResult<IEnumerable<BadgeDto>>> GetMyBadges()
{
    var userId = GetCurrentUserId();
    var user = await _unitOfWork.Users.GetByIdAsync(userId);
    if (user == null) return NotFound();

    var badges = user.UserBadges.Select(ub => new BadgeDto
    {
        Id          = ub.BadgeId,
        Name        = ub.Badge?.Name        ?? string.Empty,
        Description = ub.Badge?.Description ?? string.Empty,
        Icon        = ub.Badge?.Icon        ?? string.Empty,
        Color       = ub.Badge?.Color       ?? string.Empty,
        EarnedAt    = ub.EarnedAt,
    });

    return Ok(badges);
}
```

**Note:** If `BadgeDto` is not yet defined in a shared location, add it to `backend/src/Application/DTOs/UserDto.cs` (already exists there) or create a separate `BadgeDtos.cs` file in `backend/src/Application/DTOs/`.

**Verification:**
1. Build the backend solution.
2. Hit `GET /api/v1/badges` and confirm the response contains only DTO fields (no internal navigation properties).
3. Hit `GET /api/v1/badges/my` and confirm it returns an array of `BadgeDto` objects.

---

### Fix P2-5: Create Strongly-Typed DTO for NodesController.ReportNode

**Problem:** `NodesController.ReportNode()` accepts `JsonElement` as the request body, which has no type safety, no validation, and no Swagger documentation.

**File to Modify:**
- `backend/src/WebApi/Controllers/NodesController.cs`
- `backend/src/Application/DTOs/` — new or existing DTO file

**Changes:**

1. **Create or extend a DTO file** — add to an appropriate DTO file (e.g., `backend/src/Application/DTOs/QuizDto.cs` or a new node-specific file):

```csharp
// Add to an appropriate DTO file:
public class ReportNodeRequestDto
{
    public string Reason { get; set; } = string.Empty;
    public string? Detail { get; set; }
}
```

2. **Update the ReportNode action:**

Replace the method signature and body:

```csharp
// Before (line 129):
[HttpPost("{nodeId}/report")]
public async Task<IActionResult> ReportNode(Guid nodeId, [FromBody] JsonElement payload)
{
    var reason = payload.TryGetProperty("reason", out var p) ? p.GetString() : null;
    var detail = payload.TryGetProperty("detail", out var d) ? d.GetString() : null;
    if (string.IsNullOrEmpty(reason)) return BadRequest("Reason is required");
    // ...
}

// After:
[HttpPost("{nodeId}/report")]
public async Task<IActionResult> ReportNode(Guid nodeId, [FromBody] ReportNodeRequestDto request)
{
    if (string.IsNullOrEmpty(request?.Reason))
        return BadRequest("Reason is required");

    var userId = GetCurrentUserId();
    var report = await _moderationService.CreateReportAsync(nodeId, userId, request.Reason, request.Detail);

    return Ok(new { message = "Báo cáo thành công", reportId = report.Id });
}
```

**Verification:**
1. Build the backend.
2. Hit `POST /api/v1/nodes/{nodeId}/report` with `{ reason: "Inappropriate content", detail: "..." }` — confirm 200 response.
3. Hit the same endpoint with `{}` (empty body) — confirm 400 response with "Reason is required".
4. Confirm Swagger UI shows the strongly-typed `ReportNodeRequestDto` schema.

---

## Dependency Graph

```
P1-1 (gamificationApi.ts endpoints)
  ↓ Depends on: Backend UsersController already has /users/me/progress and /users/me/xp

P1-2 (quiz payload + useQuizStore sync)
  ↓ Depends on: Backend QuizzesController.SubmitAttempt already accepts { QuizId, Answers }
  ↓ Requires: useQuizStore.ts to track selected answers (backendAnswers ref)

P1-3 (learningProgressApi.ts endpoints)
  ↓ Depends on: Backend UsersController already has /users/me/progress and /users/me/modules/{id}

P1-4 (quiz history pagination)
  ↓ Independent

P2-1 (TeacherStudioController)
  ↓ Independent of other fixes

P2-2 (SessionController + frontend sessionApi.ts)
  ↓ Independent of other fixes
  ⚠ Note: Changing the endpoint path from /nodes/{id}/enter to /session/{id}/enter
     requires the frontend sessionApi.ts change to match.

P2-3 (GemsShopController + RoadmapsController)
  ↓ Independent

P2-4 (BadgesController DTOs)
  ↓ Independent — but BadgeDto type must be accessible from WebApi project

P2-5 (NodesController ReportNode DTO)
  ↓ Independent
```

---

## Execution Order

Recommended execution order to minimize merge conflicts and allow incremental testing:

1. **P1-1** — Fix gamificationApi.ts endpoints (quick copy-paste, lowest risk)
2. **P1-3** — Fix learningProgressApi.ts endpoints (quick copy-paste)
3. **P1-4** — Fix quiz history pagination (add params, one line)
4. **P2-3** — Fix GemsShopController + RoadmapsController routes (one-line each)
5. **P2-1** — Fix TeacherStudioController (multi-line, but well-scoped)
6. **P2-2** — Fix SessionController + frontend sessionApi.ts (coupled pair, must be done together)
7. **P2-4** — Fix BadgesController to return DTOs (requires checking BadgeDto accessibility)
8. **P2-5** — Create ReportNodeRequestDto + update NodesController (new type + refactor)
9. **P1-2** — Fix quiz payload structure (most complex — involves two files and logic change)

---

## Post-Implementation Verification Checklist

- [ ] P1-1: `GET /api/v1/users/me/progress` returns 200 with user progress data
- [ ] P1-1: `POST /api/v1/users/me/xp` awards XP and returns updated totals
- [ ] P1-2: Quiz submission sends `{ quizId, answers }` — not `{ quizId, score, maxScore, passed }`
- [ ] P1-2: Backend response to quiz submission includes `XPEarned` for passing users
- [ ] P1-3: `GET /api/v1/users/me/progress` returns learning progress
- [ ] P1-3: `POST /api/v1/users/me/modules/{moduleId}` marks module complete (204)
- [ ] P1-4: Quiz history supports pagination via `?pageNumber=1&pageSize=10`
- [ ] P2-1: All TeacherStudio endpoints still work in Swagger UI and frontend
- [ ] P2-2: `POST /api/v1/session/{nodeId}/enter` works (endpoint path changed)
- [ ] P2-2: Frontend `sessionApi.ts` calls the updated endpoint
- [ ] P2-3: GemsShop and Roadmaps endpoints work with versioned routes
- [ ] P2-4: Badges endpoints return only DTO fields (no navigation properties leaked)
- [ ] P2-5: Report node endpoint accepts typed DTO, validates, and returns proper error codes
- [ ] Full backend build succeeds: `dotnet build`
- [ ] Full frontend build succeeds: `npm run build` (or equivalent)
- [ ] Existing auth flow (login, register, refresh) still works end-to-end
- [ ] Gamification loop (quiz complete → XP awarded → leaderboard updated) works end-to-end
