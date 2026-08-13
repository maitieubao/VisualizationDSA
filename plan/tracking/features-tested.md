# Features Tested — UI Redesign Components

## 2026-08-07 — UI Redesign New Component Tests

**Test file:** `features/courses/__tests__/uiRedesignComponents.spec.ts`

### BreadcrumbsBar (5 tests)
- Renders all breadcrumb items
- Renders separators between items
- Last item is not clickable (pointer-events-none)
- First item shows home icon
- Single item renders without separator

### StepTabs (4 tests)
- Renders all step buttons
- Active step has accent background
- Completed steps show check icon
- Emits navigate on step click

### useCourseNavigation (5 tests)
- Sidebar is closed by default
- openSidebar sets isSidebarOpen to true
- closeSidebar sets isSidebarOpen to false
- toggleSidebar toggles state
- Returns computed ref (not raw ref)

### CourseSidebar (7 tests)
- Renders lesson titles
- Renders course title in header
- Shows progress count
- Current lesson has accent border
- Shows Quiz badge for lessons with quizId
- Emits selectLesson on lesson link click
- Shows empty state when no lessons

**Total: 21/21 PASS**

## 2026-08-07 — Backend C# Unit Tests (Integrity Refactor Phase 2)

**Test project:** `backend/tests/VisualizationDSA.UnitTests/VisualizationDSA.UnitTests.csproj` (net10.0 + EF InMemory 10.0.10)
**Test runner:** `dotnet test`

### ReorderClassroomModulesCommandHandler (3 tests) ✅
- `Handle_UpdatesOrderIndex_WhenValidRequest`
- `Handle_ThrowsUnauthorized_WhenWrongTeacher`
- `Handle_ThrowsConflict_WhenConcurrencyOccurs` (uses `ConcurrencyConflictDbContext` stub that throws `DbUpdateConcurrencyException`)

### DeleteClassroomModuleCommandHandler (3 tests) ✅
- `Handle_SoftDeletesModule_WhenValidRequest`
- `Handle_ThrowsUnauthorized_WhenWrongTeacher`
- `Handle_ThrowsArgument_WhenModuleNotFound`

### GetClassroomIntegrityReportQueryHandler (3 tests) ✅
- `Handle_DetectsDuplicateOrderIndex_InModules`
- `Handle_ReturnsValid_WhenNoIssues`
- `Handle_ThrowsUnauthorized_WhenWrongTeacher`

### Test infrastructure helpers
- `TestDbContextFactory.cs` — Sqlite in-memory + InMemory factory
- `ConcurrencyConflictDbContext.cs` — stub `IApplicationDbContext` that throws `DbUpdateConcurrencyException`

**Backend total: 258/258 PASS** (163 existing + 95 new, -5 duplicates removed)

### Classroom Lifecycle Tests (2026-08-08)

**JoinClassroom/KickStudent** (11 tests)
- `Handle_EnrollsStudent_WhenValidInviteCode`
- `Handle_ReactivatesKickedStudent_InsteadOfCreatingNewEnrollment`
- `Handle_ThrowsInvalidOperationException_WhenAlreadyActive`
- `Handle_ThrowsInvalidOperationException_WhenStudentBanned`
- `Handle_ThrowsArgumentException_WhenClassroomNotFound`
- `Handle_ThrowsArgumentException_WhenInviteCodeInvalid`
- `Handle_ThrowsArgumentException_WhenInviteCodeExpired`
- `Handle_ThrowsInvalidOperationException_WhenClassroomArchived`
- `Kick_ThrowsArgumentException_WhenClassroomNotFound`
- `Kick_ThrowsArgumentException_WhenStudentNotEnrolled`
- `Kick_ThrowsInvalidOperationException_WhenAlreadyKicked`

**CreateClassroom** (3 tests)
- `Handle_CreatesClassroom_WhenValidTeacher`
- `Handle_ThrowsUnauthorizedAccessException_WhenUserDoesNotExist`
- `Handle_ThrowsUnauthorizedAccessException_WhenUserNotTeacher`

**UpdateClassroom** (3 tests)
- `Handle_UpdatesDetails_WhenAuthorized`
- `Handle_ThrowsArgumentException_WhenClassroomNotFound`
- `Handle_ThrowsUnauthorizedAccessException_WhenNotOwner`

**RegenerateInviteCode** (3 tests)
- `Handle_RegeneratesInviteCode_WhenAuthorized`
- `Handle_ThrowsArgumentException_WhenClassroomNotFound`
- `Handle_ThrowsUnauthorizedAccessException_WhenNotOwner`

**GetTeacherClassrooms** (3 tests)
- `Handle_ReturnsOnlyActiveClassrooms_ForTeacherId`
- `Handle_ReturnsEmpty_WhenTeacherHasNoClassrooms`
- `Handle_ReturnsOrderedByCreatedAtDescending`

**GetStudentClassrooms** (3 tests)
- `Handle_ReturnsClassrooms_WithActiveEnrollmentsOnly`
- `Handle_ReturnsEmpty_WhenStudentHasNoEnrollments`
- `Handle_ExcludesArchivedClassrooms`

**GetClassroomStudents** (3 tests)
- `Handle_ReturnsStudents_WhenAuthorized`
- `Handle_ThrowsArgumentException_WhenClassroomNotFound`
- `Handle_ThrowsUnauthorizedAccessException_WhenNotOwner`

**UpdateClassroomModule** (3 tests)
- `Handle_UpdatesModule_WhenAuthorized`
- `Handle_ThrowsArgumentException_WhenModuleNotFound`
- `Handle_ThrowsUnauthorizedAccessException_WhenNotOwner`

**UpdateClassroomModuleItemOverride** (5 tests)
- `Handle_CreatesNewOverride_WhenNoneExists`
- `Handle_UpdatesExistingOverride_WhenExists`
- `Handle_ThrowsArgumentException_WhenClassroomNotFound`
- `Handle_ThrowsUnauthorizedAccessException_WhenNotOwner`
- `Handle_ThrowsArgumentException_WhenModuleItemNotFound`

**ImportCourseToClassroom** (5 tests)
- `Handle_ImportsCourse_WhenValid`
- `Handle_ThrowsInvalidOperationException_WhenClassroomNotFound`
- `Handle_ThrowsUnauthorizedAccessException_WhenNotOwner`
- `Handle_ThrowsInvalidOperationException_WhenCourseNotFound`
- `Handle_OverridesExistingModules_WhenOverrideExistingTrue`

## 2026-08-10 — Interactive Playground Test Hardening (IP-033/034/035/036/038/039/040/041)

**Test files:** `frontend/src/features/interactive-playground/__tests__/` (6 files — 182 tests, 100% PASS × 2 runs)

### graphComponentTests.spec.ts (33 tests) — mới
- PlaygroundCanvas mount: ADD_NODE click đúng tọa độ, ADD_EDGE drag + snap → edge, release ngoài canvas không tạo cạnh ma (IP-010), khóa vẽ khi isAlgorithmMode
- Zoom thật: wheel → `store.zoomLevel` 110/90 + `ctx.scale(1.1,1.1)` + clamp 20–300% (IP-033)
- Pan thật: giữa chuột / Alt+click → `ctx.translate` theo delta (IP-033)
- Weight popover: Enter 50 / Blur 33 / Esc hủy / 0·1000·NaN bị từ chối
- Import JSON: invalid → toast lỗi + giữ đồ thị; valid → thay thế + toast thành công
- Phím tắt qua handleKeydown THẬT: V/N/E/W, Delete/Backspace + confirm, INPUT-guard, algorithm-mode guard (IP-041)
- Toolbar lock: ẩn export/import/physics/clear khi isAlgorithmMode + chặn vẽ
- Legend / Guide overlay / header counter bằng DOM thật (IP-033)
- Export: click "Xuất JSON" → Blob nội dung đúng + toast (IP-034)
- GraphView loadTemplate thật: Triangle 3N/3E, Square 4N/4E, Star 6N/5E (IP-035)

### canvasEventHandlersTests.spec.ts (21 tests) — mới (IP-040c)
- 5 tool mode × hit/miss, snap target null, setSourceNodeId khi algorithm mode, clamp world-space, hover node/edge (IP-007)

### graphAlgorithmSimulator.spec.ts (+12 tests = 18) (IP-036 + edge cases)
- Directed BFS/DFS/Dijkstra: chỉ đi theo hướng mũi tên, dist ngược hướng = ∞, 2 cạnh ngược chiều, trọng số đúng chiều
- Edge cases: đồ thị rỗng, single node, source không tồn tại → fallback nodes[0], không liên thông → cảnh báo (IP-019), trọng số âm

### interactivePlayground.spec.ts (+18 tests = 49)
- importFromJSON: reject weight 0/âm/NaN + x/y NaN + dangling edge + trùng id, clamp x/y/radius [0,1000] (IP-001/003/031)
- store.importGraph: chặn >30 node + trùng nhãn
- store biên: addEdge ghost-id → null + lastEdgeError, updateEdgeWeight/deleteNode/deleteEdge id không tồn tại
- IP-004 directed cặp đảo A→B+B→A + graphTypeOverride; IP-009 deleteNode dọn selectedEdgeId

### graphP2Tests.spec.ts (44 tests) — dọn
- Xóa mockKeydownHandler nhân bản logic (IP-041), test tautological zoom/pan/legend/guide/header (IP-033), loadTemplate giả (IP-035) → thay bằng mount + hành vi thật ở graphComponentTests

### graphP0Tests.spec.ts (17 tests) — sửa (IP-034, IP-038)
- Xóa exportGraph tự JSON.stringify; thay bằng mount InteractivePlayground + click nút + spy URL.createObjectURL/Blob
- Canvas mock đầy đủ dùng chung qua `canvasMock.ts` (IP-038)

## Quiz System - Engine/Validator/Stats (frontend/src/features/quiz-system)

### QuizSchemaValidator.spec.ts (24 tests, +13) - QZ-010/011/012/020/021/022/038
- correctOptionIndex ngoai dai phuong an + khong integer (QZ-010); type la MATCHING -> loi "Kieu cau hoi khong ho tro" (QZ-011)
- checkpoint null / non-object khong crash TypeError (QZ-012); checkpoints rong -> "Quiz khong co cau hoi nao" (QZ-020)
- frameIndex 5.5 bi tu choi (QZ-021); trung frameIndex + trung question.id qua Set (QZ-022)
- TRUE_FALSE dung 2 phuong an, option chuoi rong, nodes radius > 0 (QZ-038)

### QuizStatsManager.spec.ts (14 tests, +5) - QZ-013/023/049
- partial JSON thieu field -> fallback an toan (QZ-049); wrong-shape fields (string/null/non-array) -> default
- saveAttempt tren storage hop le JSON nhung sai shape khong crash (QZ-013)
- bestStreak (lifetime) khong giam khi streak phien reset ve 0 (QZ-023); getAccuracy() round(correct/total*100)
## Quiz System - Backend StatelessQuizController (backend/tests/.../Features/Quizzes/QuizSystemTests.cs, 16 tests, MOI) - QZ-016
- Submit dung het -> diem day du + pass + xpAwarded = XPReward; 7/10 pass threshold 70%; 6/10 khong pass (QZ-016)
- Submit lan 2 cung quiz (pass lai) -> xpAwarded = 0, TotalXP khong doi, QuizXpGrant = 1 (QZ-052 backend)
- Body null -> 400 (QZ-014); quiz khong ton tai (Guid + bank string) -> 404 (QZ-015)
- GET mac dinh an CorrectIndex/Explanation; ?withAnswers=true -> co day du (QZ-003)
- Trung Title (2 quiz DB cung ten) -> 409 QUIZ_AMBIGUOUS_TITLE cho GET + Submit (QZ-047)
- Bank path: cung cap XP + QuizXpGrant nhung KHONG ghi QuizAttempt (QZ-002/QZ-048 note); submit lai bank -> xp 0
- Race song song 2 connection (Cache=Shared + busy_timeout): DB quiz + bank quiz -> xp chi 1 lan, grant = 1 (QZ-001/QZ-002)

## Quiz System - UI Components & CANVAS_TARGET Integration (frontend/src/features/quiz-system + views/lesson) - QZ-046 (2026-08-10)

### quizP0Tests.spec.ts (17 tests) - QZ-050
- Backend workspace: pass + xpAwarded=0 -> banner "da nhan XP toi da"; xpAwarded=50 -> "+50 XP" (bo test tautological mock-tu-than)
- Chon dap an / dieu huong cau / submit / ket qua / feedback dung-sai QuizOptionsList

### quizP2Tests.spec.ts (24 tests) - QZ-037/038/039/042
- Fixture nhat quan 3 questions = 3 questionResults (QZ-042)
- Quiz card catalog role="button" + tabindex + Enter mo quiz (QZ-037)
- QuizCardOverlay role="dialog" aria-modal; feedback role="status" aria-live="polite"; backdrop passive khi CANVAS_TARGET (QZ-038/041)
- QuizOptionsList letters A..H dong (QZ-039) + radiogroup/radio/aria-checked

### useQuizStoreBackendMode.spec.ts (16 tests) - QZ-044/052
- Double-submit: submit 2 lan dong thoi -> 1 API call (guard isBackendQuizSubmitting) (QZ-044)
- Fake timers: submit cham 100ms resolve dung (QZ-044)
- Resubmit lan 2 -> xpAwarded=0 tu backend, store phan anh nguyen ven (QZ-052 store-level; enforcement thuc su o backend)

### quizCanvasTarget.spec.ts (7 tests, MOI) - QZ-004
- Crosshair class on/off theo isCanvasTargetMode; click dung node -> submit + flash xanh (#10B981, arc tai toa do node)
- Click sai node -> flash do (#EF4444); click blank -> khong nop, khong flash
- Click ngoai canvas-target mode vo hieu; double-click sau khi nop khong cham lai; unmount go listener (khong leak)

### quizLoader.spec.ts (5 tests) - QZ-045
- Registry key <-> algorithmId nhat quan voi ADR-12 (1 script = 1 file); TODO: can listQuizScriptIds() de duyet toan bo registry

### lessonQuizFlow.spec.ts (8 tests) - QZ-043
- Bien 70%: dung 7/10 -> pass + mo Code Lab; dung 6/10 -> khong pass
- Quiz 1 cau: dung -> 100% pass; sai -> 0% khong pass

### learningFlow.spec.ts (4 tests, integration) - QZ-051
- LessonStepQuiz that + useLessonStore.submitQuiz that + lessonApi that (chi mock fetch): quiz -> xpAwarded=100, award-xp body {amount:100}
- Submit lan 2 -> xpAwarded khong tang (cap per-lesson); kenh userProgressApi.syncXPToServer khong duoc goi (khong di duong tat)

### useAnimationCanvas.spec.ts (6 tests) - EC-009 (animation-engine)
- Composable ton tai + currentFrame/totalSteps/progressPercent theo store (regression sau khi toi uu Map lookup + bo shadowBlur per-bar)

**Ghi chu QZ-046:** bo sung toan bo muc quiz-system UI tests (truoc day chi co engine/validator/stats + backend).

## BugFix Campaign 2026-08-10 � 4 feature ho�n t?t

| Feature | T?ng test | Tr?ng th�i |
| :--- | :--- | :--- |
| Execution Control (vcr-player + animation-engine + dsa-modules) | 402 | ? PASS |
| Interactive Playground | 182 | ? PASS |
| Pseudocode Sync (+ animation-engine + dsa-modules) | 246 | ? PASS |
| Quiz System (+ views/lesson + views/quiz + backend) | Frontend 129 (feature) � Backend 372 | ? PASS |
| **To�n repo frontend** | **2712** | ? PASS (2712/2712) |

## Review Round 2 � 2026-08-10

| Feature | Test m?i | Tr?ng th�i |
| :--- | :--- | :--- |
| Interactive Playground | toAdjacencyList directed (IP-042) | ? PASS |
| Quiz System | 20+ mount stub BaseIcon (QZ-053) | ? PASS |
| **To�n repo frontend** | **2713** | ? PASS (2713/2713) |

## Deep Review Round 3 � 2026-08-10

| Feature | Test m?i | Tr?ng th�i |
| :--- | :--- | :--- |
| Quiz System | +2 test QZ-006 (sync XP c�/kh�ng quizId) | ? PASS |
| **To�n repo frontend** | **2715** | ? PASS (2715/2715) |

## Review Phase 2 — 2026-08-10 (Code-to-Visualization + Docs SOLID/Patterns)

### Code-to-Visualization (CV-008) — +7 test
**ASTInstrumentationEngine.spec.ts (20 tests, +6)**
- Entry selection: helper-first code instrumented không còn chứa `swap(arr);` — chỉ `bubbleSort(arr);` (CV-001)
- Entry 2 tham số: instrumented code chứa `bubbleSort(arr, arr.length)` (CV-005)
- Nested loop 100×100: execution không throw (CV-002)
- Infinite loop thật `while(true)`: vẫn throw `/lặp vô hạn/` (CV-002)
- Counter riêng từng loop: nested loop → 2 counter declaration `__loopCounter0/1` (CV-002)
- Line number: `traceCompare`/`traceAssign` nhận đúng số dòng (CV-003)

**WorkerLifecycleCoordinator.spec.ts (8 tests, +1)**
- `toFriendlyWorkerError` 3 case: StackOverflow → gợi ý base case; loop-limit → giữ nguyên; error khác → giữ nguyên (CV-006)

**Kết quả suite:** code-to-visualization 56/56 PASS.

### Guided Tour (DP-003) — spec test 10 → 4 cases
- `useGuidedTourStore.spec.ts`: bỏ `/solid /oop /di /patterns /state /system` — còn `/sorting /code-ide /graph /quiz` (expectedLength 12, firstTitle khớp 4 tour thật)
- Xóa 516 dòng tour mồ côi khỏi useGuidedTourStore.ts (651 dòng còn lại)

| Feature | Test mới | Trạng thái |
| :--- | :--- | :--- |
| Code-to-Visualization | +6 test AST (entry/counter/nested/line) + 1 test toFriendlyWorkerError | ✅ PASS (56/56) |
| Guided Tour | spec 10 → 4 cases (DP-003) | ✅ PASS (29/29) |
| **Toàn repo frontend** | **2722** | ✅ PASS (2722/2722, 150 file) |
| Backend (dotnet test) | — | ✅ PASS (372/372, build 0 lỗi) |

## Review Round 4 — 2026-08-10 (Code-to-Visualization + Docs)

### Code-to-Visualization (CV-138) — +23 test (suite 56 → 78)

**Test files:** `frontend/src/features/code-to-visualization/__tests__/`

**codeToVizComponentTests.spec.ts (20 tests, MỚI) — CV-138**
- ArrayInputBar (5): validate realtime đúng (CV-119), reject `1,,2`/`0x10`/`1e2` (CV-112), parse hợp lệ, label for/id (CV-137), emit input → store
- CompilerConsole (5): render log info/success/error/warn + icon, auto-scroll có điều kiện (CV-117), wrap log dài (CV-136), clear button
- MonacoEditorPanel (4): mock chỉ `@monaco-editor/loader` (không fetch CDN), setModelMarkers khi error (CV-118), dispose model khi unmount (CV-122), glow xanh chỉ sau `lastCompileSucceeded` (CV-105)
- CodeWorkspace (6): Pinia thật + stub CanvasLayer/AnimControlPanel/BaseIcon, nút Cancel khi compile (CV-116), animStore.clear() đầu compile (CV-135), input mảng chung DEFAULT_INPUT_ARRAY (CV-134), layout responsive class (CV-120), data-tour-id các mốc tour (CV-106)

**useLiveCompilerStore.spec.ts (13 tests, +2) — CV-138**
- Assert frame thật nạp vào animStore (bỏ mock pass-through), `lastCompileSucceeded` set đúng (CV-105), generation token bỏ stale compile khi rời view (CV-115)

**codeToVizP0Tests.spec.ts (16 tests, -1) — CV-138**
- Bỏ test tautological đọc chuỗi nguồn thay vì mount (CV-138); vẫn giữ P0: empty code, success flow, syntax error, loop guard, invalid input

**WorkerLifecycleCoordinator.spec.ts (9 tests, +1) — CV-138**
- `onmessageerror` → reject không bị timeout sai message (CV-128); fake timers bọc try/finally

### Docs (DC-T1→T5) — +40 test (suite 2 → 42)

**Test files:** `frontend/src/features/docs/__tests__/`

**docsComponentTests.spec.ts (35 tests, MỚI) — DC-T1**
- DocsView: fallback `/docs/intro/intro` (DC-005), resolve slug qua `getFirstSectionOfTopic` (DC-007), loading spinner giữ vùng (DC-020), chuyển bài đúng content
- DocsSidebar: highlight active `isCurrentRoute` (DC-012), nhóm collapse giữ state localStorage (DC-021), hamburger mobile mở drawer (DC-001)
- DocsLayout: overlay đóng drawer, breadcrumb/prev-next theo nav
- DocsTableOfContents: click không phá hash router (DC-002), scrollspy highlight theo scroll container (DC-003)
- DocsMarkdownRenderer: copy button hoạt động sau điều hướng (DC-004), escape message Mermaid (DC-009), dedup heading id `-1`/`-2` (DC-010), link `.md` → prefix `/docs/` (DC-019), chặn emoji SVG trong code block (DC-026)
- Router: `/oop→/docs/oop/encapsulation` etc. (DC-006), scrollBehavior scroll-to-top (DC-013)

**docsNavigationConsistency.spec.ts (5 tests, MỚI) — DC-T3**
- 68/68 nav entry ↔ file tồn tại, heading id unique toàn bộ bài (bắt DC-010), frontmatter presence

**docsMermaidSyntax.spec.ts (2 tests) — DC-T5**
- Bỏ biến `parseError` unused; vẫn giữ 95 khối mermaid / 58 file parse hợp lệ

| Feature | Test mới | Trạng thái |
| :--- | :--- | :--- |
| Code-to-Visualization | +23 (suite 56 → 78) | ✅ PASS (78/78) |
| Docs | +40 (suite 2 → 42) | ✅ PASS (42/42) |
| Guided Tour | giữ nguyên (tour /code-ide viết lại CV-106) | ✅ PASS (29/29) |
| **Toàn repo frontend** | **2784** | ✅ PASS (2784/2784, 153 file) |
| Backend (dotnet test) | — | ✅ PASS (372/372) |

## Review Round 5 — 2026-08-10 (fix 4 sub agent, +6 test)

### Docs (DC-027→031, DC-C8→C14, DC-010, DC-C3) — suite 42 → 45

**docsComponentTests.spec.ts (38 tests, +3) — DC-027/029/030**
- DC-027: click link `#/docs/...` → `defaultPrevented=false` (điều hướng thật — chốt regression); anchor `#section` → `prevented=true` + scrollIntoView
- DC-029: `/docs/search` → `router.replace('/docs/intro/intro')`; DC-030: đổi route.path → content đổi không cần remount

**docsNavigationConsistency.spec.ts (5 tests) — DC-010**
- Allowlist `KNOWN_DUPLICATE_SLUGS` → `{}` (nguồn heading trùng đã sửa — test giờ assert 0 trùng)

**docsMermaidSyntax.spec.ts (2 tests)** — vẫn 95 khối/58 file parse 100% (DC-C9/C10/C3 sửa diagram không phá)

### Code-to-Visualization (CV-141→144) — suite 78 → 80

**WorkerLifecycleCoordinator.spec.ts (10 tests, +1) — CV-143**
- e2e chạy script worker thật (MockBlob capture script + sandbox self) → frame ASSIGN có `variables: {k: 1, value: 42}` — không còn key "i" hardcode

**ASTInstrumentationEngine.spec.ts (21 tests, +1) — CV-143**
- Instrument `arr[k] = 42` → spy traceAssign nhận pairs `[['k', 1]]` (tên biến thật từ MemberExpression property)

### Guided Tour (CV-142) — suite 29 → 30

**useGuidedTourStore.spec.ts (16 tests, +1) — CV-142**
- `startPageTour('/code-ide')` → mount CodeWorkspace thật (stub CanvasLayer/AnimControlPanel/BaseIcon + mock `@monaco-editor/loader`) → assert MỌI highlightSelector tồn tại khi không compile + `code-ide-cancel-btn` KHÔNG tồn tại ở trạng thái đó (chốt bắt regression spotlight rỗng)

| Feature | Test mới | Trạng thái |
| :--- | :--- | :--- |
| Code-to-Visualization | +2 (CV-143: variables thật, e2e worker) | ✅ PASS (80/80) |
| Docs | +3 (DC-027 click link, DC-029 redirect, DC-030 watch) | ✅ PASS (45/45) |
| Guided Tour | +1 (CV-142 selector tồn tại) | ✅ PASS (30/30) |
| **Toàn repo frontend** | **2790** | ✅ PASS (2790/2790, 153 file) |
| Backend (dotnet test) | — | ✅ PASS (372/372) |

## Review Round 7 — Auth (2026-08-11, sub-agent FIX BACKEND) — backend 372 → 416 (+44)

### AuthServiceTests.cs (3 → 14 tests) — AU-012/026/027/030/037

**Mock store thật (AU-026):** `FindAsync` compile predicate đánh giá trên list → phân biệt trùng **email** vs trùng **username** (`RegisterAsync_DuplicateEmail/DuplicateUsername`), `RegisterAsync_WithMixedCaseAndSpaces_NormalizesEmail` (AU-037)
- AU-012: `RegisterAsync_WhenDbUniqueViolation` — CommitAsync ném DbUpdateException → ArgumentException generic + không sinh refresh token
- Ban login (`LoginAsync_BannedUser`), email không tồn tại (`LoginAsync_EmailNotFound`), refresh expired/revoked/unknown/deleted-user/banned-user → `UnauthorizedAccessException` (AU-011/030)
- AU-027: `LogoutAsync_RevokesToken_ThenRefreshFails` — revoke server-side + refresh sau logout → 401
- AU-004: `RefreshTokenAsync_ValidToken_RotatesAndRevokesOld` — token cũ IsRevoked = true, token mới tồn tại

### StatelessAuthStrategyTests.cs (16 tests, MỚI) — AU-002/003/004/016/017/022/027/030/037

- Register: thành công + duplicate email + short password (AU-003) + normalize email (AU-037)
- Login: đúng/sai password/email lạ → UnauthorizedAccessException
- AU-004: rotation remove-if-match — `Refresh_Rotates_OldTokenCannotBeReused`
- AU-017: `RefreshToken_PreservesRemainingTtl` (5 phút ≠ 30 ngày) + `RefreshToken_WhenRemainingBelowOneSecond_ClampsToOneSecond` (chốt regression 30 ngày)
- AU-030: refresh user đã xóa → UnauthorizedAccessException (không phải KeyNotFoundException)
- AU-016: `EnsureUserInMemory_ExistingUser_UpdatesStaleData` (XP/level/premium/role cập nhật) + `EnsureUserInMemory_EmailChanged_RemapsEmailKey` + `EvictIdleUsers_RemovesUserPastIdleLifetime` (UserIdleLifetime âm)
- AU-022: `RevokeAllRefreshTokens_InvalidatesAllSessions`; AU-027: `Logout_RevokesToken_ThenRefreshFails`; `UpdateUserPassword_NewPasswordWorks_OldPasswordFails`

### StatelessAuthControllerTests.cs (14 tests, MỚI) — AU-002/003/004/013/022/027/037

- Register: success + persist DB, duplicate email → 400 message GENERIC (AU-013, không lộ "đã được sử dụng"), short password → 400 (AU-003)
- Login: success / wrong password 401 / banned user 401
- AU-004: `Refresh_RotatesToken_OldTokenInvalid_NewTokenWorks`; banned refresh → 401; unknown token → 401
- AU-027: `Logout_RevokesTokenServerSide` → refresh sau logout 401
- AU-022: `ChangePassword_Success_RevokesAllOtherSessions` — 2 phiên cùng user chết + login mật khẩu mới OK, mật khẩu cũ 401
- AU-037: `Register_NormalizesEmail_BothFlows` — register "User@Test.COM" → login "user@test.com"

| Feature | Test mới | Trạng thái |
| :--- | :--- | :--- |
| Backend auth (standard + stateless) | +44 (AuthServiceTests 14, StatelessAuthStrategyTests 16, StatelessAuthControllerTests 14) | ✅ PASS (416/416) |
| Backend (dotnet test toàn repo) | 416 | ✅ PASS (416/416, 0 fail) |

## Review Round 8 — Payment/Checkout Premium (2026-08-11, sub-agent FIX 4 nhánh) — 2846 frontend / 472 backend

### Test mới / sửa

- **`PaymentServiceTests.cs`** (viết lại, 20 test) — PM-053t/054t: theory từng guard webhook (sai TransferType ×3, underpay, sai/thiếu payment code, order Completed, order quá hạn, sai bank → false) + success atomic (Begin/Commit + SetPremiumStatus) + rollback + 2 webhook cùng id no double-grant + CAS 0 dòng + IDOR GetOrderStatus
- **`PaymentsControllerTests.cs` (9 test, MỚI)** — PM-057: webhook thiếu/sai ApiKey → 401; đúng key → success; không lộ cấu hình (500/503 generic)
- **`StatelessPaymentControllerTests.cs` (10 test, MỚI)** — PM-057/001/002/003: simulate-webhook ngoài Development → 404; order user khác → 401; order quá hạn → 409; verify không cấp premium
- **`statelessPaymentApi.spec.ts` (10 test, MỚI)** — PM-035t: contract 8 endpoint (URL/method/body `{paymentMethod}`/`{orderId}`/Bearer/encodeURIComponent/parse lỗi)
- **`checkoutPaymentFlow.spec.ts` (2 test, MỚI)** — PM-012t: luồng thật idle→paying→success (store thật, mock API)
- **`paymentP0Tests.spec.ts`** — PM-050t/051t/052t: polling stop sau 3 fail liên tiếp; PA-014 viết lại đúng; polling Completed→success+isPremium; PM-033t: config 6 feature đúng contract + mapping; PM-037t: auth mock reactive + markPremium + premium false→true
- **`exportP2Tests.spec.ts`** — PM-034t: factory order 11 field camelCase; PM-036t: PremiumGate mock vue-router 4 test; PM-038t: 'Completed' thay 'paid'; bỏ usePaymentPolling import (PM-024); cập nhật formatVND + aria-live
- **`paymentApi.spec.ts`** — PM-056t: +2 error path (non-ok → throw body.message)

| Feature | Test mới | Trạng thái |
| :--- | :--- | :--- |
| Payment frontend (store/API contract/components/view) | 64 → 94 (+30: statelessPaymentApi 10, flow 2, paymentP0 +…) | ✅ PASS |
| Full Frontend Suite | 2846 | ✅ PASS (2846/2846, 157 files, +20) |
| Backend (dotnet test toàn repo) | 472 | ✅ PASS (472/472, +56) |

## Review Round 9 — Admin Panel (2026-08-11, sub-agent FIX 4 nhánh) — 2866 frontend / 507 backend

### Test mới / sửa

- **`AdminControllerTests.cs` (28 case, MỚI)** — AD-034: matrix phân quyền (Student/Teacher/Admin → 403/200), ban→login 401 + refresh 401 + audit "BanUser", unban→200, LAST_ADMIN_PROTECTED 409 (demote/ban/delete), IDOR 404 (5 endpoint), impersonate round-trip 200 + shape `currentLevel/totalXP/streakDays/badges`, impersonate target Admin 409, rate limit 429, TogglePremium Pending 409, CreateUser 201
- **`UsersControllerTests.cs` (5 case, MỚI)** — AD-012/034: SyncXP cap ≤ 50 + reason whitelist, ban check
- **`useAdminApi.spec.ts` (13 test, MỚI)** — AD-039: contract 8 endpoint (GET users, PUT role/premium/ban/reset-password, POST create/impersonate, DELETE user, GET audit-logs) — URL/method/body camelCase/Bearer
- **`adminP0Tests.spec.ts` + `adminP2Tests.spec.ts`** — AD-035: bỏ catch-all mock → 404 fail-closed + test allowlist; AD-036: impersonate assert store call + redirect + shape; AD-037: create user bỏ if-guard + assert body; AD-038: 401→refresh→retry; AD-057: hết `any`; AD-059: `.btn-refresh-audit`; AD-060: search assert URL encoded + page reset; AD-015/013t: totalAdmins + impersonate shape
- **`routerGuardTests.spec.ts`** — AD-058: Teacher → /admin redirect dashboard
- **`AuditEventLedgerTests.cs`** — AD-011: interceptor chặn UPDATE/DELETE trên AuditLog; AD-040: sequence tăng chặt

| Feature | Test mới | Trạng thái |
| :--- | :--- | :--- |
| Admin frontend (users/role/premium/ban/impersonate/audit/quiz/dashboard) | 87 → ~120 (+13 contract, +impersonate/401/search/guard…) | ✅ PASS |
| Full Frontend Suite | 2866 | ✅ PASS (2866/2866, 158 files, +20) |
| Backend (dotnet test toàn repo) | 507 | ✅ PASS (507/507, +35) |

## Review Round 10 — HTML Playground (2026-08-11, sub-agent FIX 3 nhánh) — 2911 frontend

### Test mới / sửa

- **`PlaygroundView.spec.ts` (4 test, MỚI)** — HT-004/017/025: query `?code=` → store nạp html/css/js; roundtrip encodeURIComponent; watch query đổi → nạp lại; payload hỏng → toast warning; KeepAlive giữ state khi đổi mode
- **`editorP2Tests.spec.ts`** — HT-015: component debounce thật (799ms chưa commit → 800ms commit đúng 1 lần, iframe identity bất biến); HT-016: mock Monaco giữ callback + 4 test editor↔store; HP-006: spy window.confirm + test âm tính; HP-011: fallback text mới; HP-013: sandbox `allow-scripts allow-forms` + referrerpolicy + error bridge 2 test
- **`playgroundDemos.spec.ts`** — HT-032: `new Function(js)` thực thi 22 demo bắt syntax error + assert output (bubble-sort `[2,3,4,5,8]`, binary-search `chỉ số 4`, dijkstra `A→0/B→4/D→9`)
- **`PlaygroundDocumentBuilder.spec.ts`** — HT-031: escape `<!--` + unicode/emoji; HT-003/005/007: error bridge script count, `<base about:blank>`, CSP
- **`PlaygroundUrlCodec.spec.ts`** — HT-006: encode/decode null-guard + payload quá ngưỡng 6000
- **`htmlP0Tests.spec.ts`** — HT-029: xóa stub canvas + hết `any`; HT-030: bỏ tautology "runCode"; HT-033: activeCode 3 tab

| Feature | Test mới | Trạng thái |
| :--- | :--- | :--- |
| HTML Playground (engine/store/view/components/demos) | 50 → ~95 (+45: PlaygroundView 4, demos 48, builder +2, editorP2 +, htmlP0 +) | ✅ PASS |
| Full Frontend Suite | 2911 | ✅ PASS (2911/2911, 159 files, +45) |

## Review Round 11 — Algo Playground + Custom Input (2026-08-11, sub-agent FIX 3 nhánh) — 2942 frontend

### Test mới / sửa

- **`useAlgoAnimation.spec.ts` (11 test, MỚI)** — AL-008: rAF stub tick — play/advance, pause giữa transition + snapToCurrent + resume, frame cuối dừng, đổi demoId/speed giữa chừng, race AL-003 (play trước compile → auto-play), unmount destroy
- **`algoCanvasHelpers.spec.ts` (10 test, MỚI)** — AL-009: drawPlaybackFrame tree (active/visited/pruned, cạnh dash) + graph (markEdge, weight) + array 4 trạng thái; Transition lerp t=0/0.5/1; overlay target badge
- **`SortingAnimationEngine.spec.ts`** — AL-021: rafCb động; AL-029: setSpeed 2x vs 1x, pause/snapToCurrent, destroy khi play, swap OOB [0,99]/5 phần tử, mảng rỗng/1/âm; AL-033t: minWithFallback 100k phần tử
- **`useAlgoPlaygroundStore.spec.ts` + `playgroundP0Tests.spec.ts`** — AL-028: pendingPlayAfterCompile (play trước compile → auto-play khi frames về) + play frame cuối wrap 0; AL-020: jumpToFrame(-5) no-op
- **`AlgoPlaygroundWorkspace.spec.ts`** — AL-007: US-AP-014/009/013/023 mount thật; AL-022: Space assert isPlaying; AL-025: responsive layout; AL-026: gutter click Monaco; AL-027: DOM description; AL-046: fake timers onShare; AL-048: deferred resolve
- **`HeapSortAnimationEngine.spec.ts`** — AL-030: isSiftSwap draw cha↔con
- **`MergeSortAnimationEngine.spec.ts`** — AL-032: fillRect ≥2, fillText ≥15, phase label
- **`customInputP2Tests.spec.ts`** — AL-007: CI-007 click clear thật; AL-023: CI-008/011 assert loadResult + fallback; AL-024: CI-013 mount + body algorithmId; AL-049: prop mọi mount
- **`playgroundP2Tests.spec.ts` + `playgroundAlgoDemos.spec.ts`** — AL-047: Object.keys(playgroundAlgoDemos) nguồn duy nhất

| Feature | Test mới | Trạng thái |
| :--- | :--- | :--- |
| Algo Playground + Custom Input | 120 → 151 (+31: useAlgoAnimation 11, algoCanvasHelpers 10, engine +, store +2, workspace +…) | ✅ PASS |
| Full Frontend Suite | 2942 | ✅ PASS (2942/2942, 161 files, +31) |

## Review Round 12 — Sorting Visualizer (2026-08-11, sub-agent FIX 3 nhánh) — 3058 frontend

### Test mới / sửa

- **`sortingP0Tests.spec.ts`** — SV-002t: **21 test contract CC-009** — 7 engine × (lineNumber>0 mọi frame, activeLogicalLineId+highlights chuẩn), highlights.compare≡comparingIndices, currentLineNumber>0 sau stepNext
- **`sortingEdgeCases.spec.ts`** — SV-012: matrix **42 cell** (7 engine × {[], [7], [0], dup, sorted, reversed}); SV-013: perf 100 reversed × 7 engine + frames<20000; SV-004t: merge `[7]`→sortedIndices=[0]; SV-017: greedy `[5,3,5,3,2]`
- **`sortingComposables.spec.ts` (23 test, MỚI)** — SV-015: 4 composable (radix digitPlaceLabel/activeBucketIdx/cellClass, bucket phaseClass/bucketStatus, counting digitParts/âm, heap getNodeClass/getParentIndex) + RadixSortVisualizer.spec (banner/inspector/chip) + SortingAlgorithmControls (7 nút, aria-pressed)
- **`MonacoLineSyncerCoordinator.spec.ts`** — SV-011: 6 test watch currentLineNumber→decorations, line 0 clear, line không frame, multi-line jump gần nhất, destroy, click phải guard
- **`sortingP2Tests.spec.ts`** — SV-001: fix order-coupling (vi.mock + afterEach reset singleton) + US-AS-013 assert algoLabel tab Chi tiết; SV-014: race input giữa playback; SV-044: dispatcher 7 frame → component đúng + OOB
- **`sorting.spec.ts`** — SV-041: FIFO `[11,12,21]` + probe "Thu hồi 11"
- **`PseudocodeSyncer.spec.ts`** — SV-016: viết lại theo contract mới (dead API đã xóa) — highlightMonacoLine decoration id, editor null, chain

| Feature | Test mới | Trạng thái |
| :--- | :--- | :--- |
| Sorting Visualizer (7 engine + UI + contract CC-009) | 99 → 215 (+116: contract 21, matrix 42, composables 23, coordinator 6…) | ✅ PASS |
| Full Frontend Suite | 3058 | ✅ PASS (3058/3058, 163 files, +116) |

## Review Round 13 — Courses & Lessons LMS (2026-08-11, sub-agent FIX 3 nhánh) — 3086 frontend / 507 backend

### Test mới / sửa

- **`lessonStepCodeLab.spec.ts` (6 test, MỚI)** — LM-017: run success→allPassed→submit emit completeLesson; timedOut/compile-error → runError + khóa Submit; resetCode khôi phục initialCode; hint toggle; Reset disabled khi running
- **`lessonApi.spec.ts` (9 test, MỚI)** — LM-018: URL `/api/v1/concepts/lessons/{id}` + encodeURIComponent, Bearer, payload quizPassed/bestScore/quizScore, 403/404 lan truyền
- **`lessonStoreRace.spec.ts` (3 test, MỚI)** — LM-046: loadLesson(A) chậm → B nhanh → kết quả B; 403 drop khi đang chờ
- **`lessonStudyFlow.spec.ts`** — LM-019: 403 premium → message; LM-020: completeCodelab XP diff + reject; LM-047: gating goToStep full matrix; LM-051: mock courseApi (hết fetch network thật); LM-071: getQuizById reject giữ local
- **`lessonCodelabFlow.spec.ts`** — LM-016: postMessage payload {requestId, code, testCases, entryFunction} + terminate + stale requestId; LM-053: worker ok:false shape
- **`lessonP2Tests.spec.ts`** — LM-003: US-LN-027 assert fetch URL search; LM-022: afterEach useRealTimers + unstubAllGlobals
- **`coursesP0Tests.spec.ts`** — LM-002: CR-009 exists() + 3 nhánh auth; LM-048: CR-007 assert thứ tự; LM-049: "/3 bài giảng/"
- **`coursesListView.spec.ts` + `useCourseStore.spec.ts`** — LM-054: hết `as never`; LM-050: bỏ fake timers 300ms

| Feature | Test mới | Trạng thái |
| :--- | :--- | :--- |
| Courses & Lessons LMS (lesson/codelab/course) | 46 → 74 (+28: codelab 6, api 9, race 3, studyFlow +…) | ✅ PASS |
| Full Frontend Suite | 3086 | ✅ PASS (3086/3086, 166 files, +28) |
| Backend (dotnet test toàn repo) | 507 | ✅ PASS (507/507) |

## Review Round 14 — Lesson Study / Course Modules (2026-08-11, sub-agent FIX 3 nhánh) — 3129 frontend / 552 backend

### Test mới / sửa

- **`classroomCurriculum.spec.ts` (14 test, MỚI)** — LS-017: integration store thật stub fetch — URL `/api/v1/classrooms/{id}/curriculum/teacher` + Bearer; POST/PUT/DELETE module+item; reorder body {teacherId, itemOrders}; error path; race 2 classroom stale bị bỏ; saving true/false
- **`studentCurriculumSidebar.spec.ts` (8 test, MỚI)** — LS-018: overall progress; unlockAt qua vi.setSystemTime; prerequisite chưa completed → locked; item ẩn lọc khỏi danh sách + progress; module không required → mở
- **`studentClassroomView.spec.ts` (4 test, MỚI)** — LS-018: load 3 endpoint song song; navigate → POST start; đổi bài → start bài mới; deep-link ?itemId
- **`moduleItemRow.spec.ts` (12 test, MỚI)** — LS-019: displayTitle CustomLesson fallback; badge VN; prerequisite index; emit edit/delete/duplicate/toggle; ItemFormModal nạp thật + prerequisite exclude; OverrideSettingsModal emit isHidden; drop → reorderItemsApi; keyboard move
- **`teacherP2Tests.spec.ts`** — LS-020: hết pass giả (vi.hoisted route + store có data + assert fetchCurriculum args)
- **`progressP2Tests.spec.ts`** — LS-025: LN-001 nâng cấp — 4 tab + label + disabled theo store + markTheoryRead unlock
- **Backend (xUnit)** — LS-021: `GetStudentClassroomCurriculumQueryHandlerTests` 9 test (enroll/hidden/sort/progress/IsUnlocked/merge) + teacher +3; LS-022: `ClassroomCurriculumControllerTests` 10 test (403/404/400 mapping); LS-023: reorder biên 3 test; LS-024: override clear/concurrency 3 test; LS-002: Update/DeleteModuleItem handler tests 7

| Feature | Test mới | Trạng thái |
| :--- | :--- | :--- |
| Lesson Study / Course Modules (store/teacher tab/sidebar/modal) | 46 → 89 (+43: store 14, sidebar 8, view 4, row 12, teacherP2 +…) | ✅ PASS |
| Full Frontend Suite | 3129 | ✅ PASS (3129/3129, 170 files, +43) |
| Backend (dotnet test toàn repo) | 552 | ✅ PASS (552/552, +45) |

## Review Round 15 — Teacher Panel (2026-08-11, sub-agent FIX 3 nhánh) — 3184 frontend / 591 backend

### Test mới / sửa

- **`useTeacherApi.spec.ts` (12 test, MỚI)** — TC-013/043t: getAuthHeaders từ store, formatTopic full map, formatDifficulty, teacherRequest 401→refresh→retry / 403 không retry
- **`useQuizBuilder.spec.ts` (8 test, MỚI)** — TC-043t: GET /quiz/all, GET /quiz/{id}?withAnswers, POST/PUT/DELETE manage, POST/DELETE questions, 401 retry — typed 0 any
- **`teacherCourseTab.spec.ts` (8 test, MỚI)** — TC-036: formatTopic 5 key, POST course body thumbnail (không coverImageUrl), FormData không Content-Type, toggle premium/published, lesson payload
- **`quizBuilderTab.spec.ts` (MỚI)** — TC-040: mount thật — list, filter search + topic, accordion detail, delete ConfirmModal, create/edit payload, saveQuestion
- **`teacherModals.spec.ts` (MỚI)** — TC-039: ModuleFormModal (create/edit/empty), ImportCourseModal (published-only + POST import-course), ConfirmModal
- **`teacherP0Tests.spec.ts` + `teacherP2Tests.spec.ts`** — TC-005t: exact URL `/api/v1/classrooms/*` + not.toContain('/api/Classroom'); TC-035: body deep-equal manage quiz; TC-037: Student modal 2 fetch + debounce 400ms + pagination; TC-038: 401/403/double-submit/confirm stub; TC-007t: completionRate 0.65 → "65.0%"; TC-006t: rename "Export Excel"
- **`moduleItemRow.spec.ts`** — TC-039: unmount toàn bộ wrapper (hết leak DOM)
- **Backend (xUnit)** — TC-034: `TeacherControllerTests` 9 test (role filter, page clamp, search, fallback); TC-021: manage quiz ownership/duplicate/xpReward 6 test; TC-022: soft-delete giữ attempts; TC-025: import transaction + ownership; TC-011: CreateDraftLesson QuizId

| Feature | Test mới | Trạng thái |
| :--- | :--- | :--- |
| Teacher Panel (panel/tabs/builder/modal/API) | 68 → 123 (+55: useTeacherApi 12, useQuizBuilder 8, courseTab 8, quizBuilder, modals…) | ✅ PASS |
| Full Frontend Suite | 3184 | ✅ PASS (3184/3184, 175 files, +55) |
| Backend (dotnet test toàn repo) | 591 | ✅ PASS (591/591, +39) |

## Review Round 16 — Classrooms (2026-08-11, sub-agent FIX 3 nhánh) — 3221 frontend / 665 backend

### Test mới / sửa

- **`myClassroomsView.spec.ts` (11 test, MỚI)** — CR-011/002t/025/026t: whitelist 404 URL lạ + assert `/api/v1/classrooms/mine` + `/join` + not.toContain('/api/Classroom'); join code <6 → lỗi không fetch; join 400 hiện lỗi; join thành công → reload + push; disable khi joining; mine 401 → push `/`; load 500 → error state + Thử lại; "Rời lớp" → POST leave + confirm hủy không gọi
- **`classroomItemPlayer.spec.ts` (13 test, MỚI)** — CR-010: nạp Lesson/Quiz/Codelab → stub sub-component đúng props; emit complete/next/back; **hasNext theo curriculum prop**; footer status theo item.status; ẩn nút hoàn thành khi Completed; CustomLesson branch; itemType lạ → "không được hỗ trợ"
- **`studentClassroomView.spec.ts`** — CR-009: stub có emit → chuỗi complete (POST complete → loadCurriculum + loadProgressSummary → navigate + start); CR-021: scroll debounce 800ms → PUT progress; CR-030: whitelist 404 + path 403/404/500; CR-031: start 200 contract; CR-037t: deep-link → trackItemStart
- **`studentCurriculumSidebar.spec.ts`** — +3 test: isUnlocked backend false/true override, CustomLesson badge "Tự soạn"
- **Backend (xUnit)** — CR-001t: `JoinClassroomDtoValidatorTests` 9 test (code generator thật, lowercase, reject malformed); CR-012: `ClassroomControllerTests` 17 + `ClassroomProgressControllerTests` 15 + `ClassroomGradingControllerTests` 3; CR-013: `ClassroomGradingServiceTests` 9; CR-026: `LeaveClassroomCommandHandlerTests` 4

| Feature | Test mới | Trạng thái |
| :--- | :--- | :--- |
| Classrooms (view/player/sidebar + backend controller/service) | 55 → 92 (+37: myClassrooms 11, player 13, studentView +, sidebar +3…) | ✅ PASS |
| Full Frontend Suite | 3221 | ✅ PASS (3221/3221, 177 files, +37) |
| Backend (dotnet test toàn repo) | 665 | ✅ PASS (665/665, +74) |

## Review Round 17 — Gamification (2026-08-11, sub-agent FIX 3 nhánh) — 3269 frontend / 708 backend

### Test mới / sửa

- **`gamificationApi.spec.ts` (6 test, MỚI)** — GM-031: GET `/users/me/progress`, POST `/users/me/xp` body {amount,reason}, `/badges`, `/badges/my`, POST `/badges/check`; 403 → ApiError; passthrough DTO (currentStreak, badges{id})
- **`leaderboardApi.spec.ts` (4 test, MỚI)** — GM-031: GET `/leaderboard/top?limit=10` (default + limit=5), passthrough, 403
- **`statelessGamificationApi.spec.ts` (7 test, MỚI)** — GM-031: profile GET, award-xp POST + Bearer + body, badges, `leaderboard?limit=5`, config, 403
- **`canvasConfettiOverlay.spec.ts` (4 test, MỚI)** — GM-030/035: visible→burst, ẩn→destroy, unmount→cancel, mount visible=true→burst (watch immediate)
- **`useGamificationStore.spec.ts`** — GM-012: bỏ if-guard + assert showConfetti===true; GM-032: 403/race đổi user; GM-034: freeze store-level; GM-029t: sync set lastActiveDate giữ streak; GM-040t: hết setStreakForTesting (earnXpAcrossDays); GM-041: lastActiveDate ngày fake; GM-042: localStorage clear
- **`StreakCalculator.spec.ts`** — GM-008t: TZ matrix UTC/UTC+5/UTC-7 (23:30/01:00); GM-018: freeze đúng 1 ngày + gap>2 reset + hết freeze reset
- **`CanvasConfettiEngine.spec.ts`** — GM-033: harness rAF invoke callback — loop end-to-end tự dừng + auto-null id + destroy giữa loop
- **`GamificationEngine.spec.ts`** — GM-043: unlock multiple toEqual 8 badge chính xác
- **Backend (xUnit)** — GM-001t/004t/005t: 429 daily cap + idempotency replay + 401; GM-007: parallel race 1 badge row; GM-046: LeaderboardService (clamp/cache/tie-break) + BadgesController + Stateless + Strategy — 43 test mới

| Feature | Test mới | Trạng thái |
| :--- | :--- | :--- |
| Gamification (engine/store/components/API + backend) | 24 → 72 (+48: 3 API 17, confetti overlay 4, store +, streak TZ +, backend +43) | ✅ PASS |
| Full Frontend Suite | 3269 | ✅ PASS (3269/3269, 181 files, +48) |
| Backend (dotnet test toàn repo) | 708 | ✅ PASS (708/708, +43) |

## Review Round 18 — User Profile (2026-08-11, sub-agent FIX 3 nhánh) — 3298 frontend / 720 backend

### Test mới / sửa

- **`profileViewP1Tests.spec.ts` (7 test, MỚI)** — PR-007: mount ProfileView — loadStatelessProfile 1 lần; 6 tab; click từng tab đúng marker; badge pill; Escape ×2 (push/back); unmount gỡ listener
- **`profileSecurityTabTests.spec.ts` (6 test, MỚI)** — PR-008: submit args + toast + reset; current trống/<8/mismatch → inline + focus; server từ chối → fieldErrors + focus; 401 → toast phiên hết hạn
- **`services/__tests__/userProgressApi.spec.ts` (8 test, MỚI)** — PR-009t: GET+Bearer, ApiError 401, syncXPToServer, markModuleComplete 204/500; **syncProgressFromServer dùng lastActiveDate SERVER** (fake time + server 2026-08-05)
- **`profileP0Tests.spec.ts`** — PR-006: PF-007 stub 2 attempts + assert dòng/cột + empty/401 riêng; PR-020: PF-003 4 args + isSaving deferred + reject; PR-021: click 2x → dsa_preferences + segment active + toggle; PR-022: bỏ mock chết; PR-035: prefill 4 input; PR-036: empty-badge + getBadgeIconName; PR-037: unmount + AboutTab
- **Backend (xUnit)** — PR-001t: UpdateProfile persist + login username mới; PR-002t: bank attempt + history title fallback; PR-015t: whitespace/short/long/duplicate DB 4 test; PR-023t: 403 Student + badges shape + 204; PR-009t: GetMyProgress positive SQLite (lastActiveDate thật)

| Feature | Test mới | Trạng thái |
| :--- | :--- | :--- |
| User Profile (ProfileView + 6 tabs + API + backend) | 35 → 64 (+29: viewP1 7, security 6, userProgressApi 8, P0/P2 +, backend +12) | ✅ PASS |
| Full Frontend Suite | 3298 | ✅ PASS (3298/3298, 184 files, +29) |
| Backend (dotnet test toàn repo) | 720 | ✅ PASS (720/720, +12) |

## Review Round 19 — Embed Widget (2026-08-11, sub-agent FIX 3 nhánh) — 3363 frontend

### Test mới / sửa

- **`embedComponents.spec.ts` (24 test, MỚI)** — EW-010: Workspace (config render), Preview (iframe src localhost rewrite, loading→load, error 8s, pointer-events interactive, badge thu nhỏ, VCR postMessage), Snippet (data-embed-widget, copy payload, copyError auto-hide, host script + event.source), Sidebar (radiogroup, dijkstra disable + premium hint, quick-sort option), EmbedWidgetView (isMinimalMode/isInvalidAlgo/isPremiumBlocked/hint tự sinh)
- **`embedWidgetView.spec.ts` (11 test, MỚI)** — EW-003t: mount `?algo=heap-sort&theme=dark&vcr=false&watch=false` → renderer + algorithmId + params consume; EW-002t: WIDGET_READY postMessage + STEP_FORWARD/RESET dispatch; EW-016t: dijkstra premium không overlay
- **`EmbedCommunicationBridge.spec.ts`** — EW-007: default allowlist dispatch origin lạ chặn; EW-006t: bridge([]) fail-closed; EW-012t: shape fail-closed 6 test; EW-032: replay/multi-instance/fallback; EW-001t: targetOrigin host
- **`SecureOriginChecker.spec.ts`** — EW-019: spoof edge 7 test (:8443/http/evil-subdomain/suffix/normalize/wildcard base); EW-031: copy mutate test
- **`AutoHeightResizer.spec.ts`** — EW-008t: RO mock fire callback — 8 test pipeline (clamp, no-spam, stale 500→600→500 chỉ gửi 500, debounce, hostOrigin, destroy)
- **`useEmbedConfiguratorStore.spec.ts`** — EW-009: copy payload assert; EW-020: cleanup afterEach; EW-021: 5 query params + iframeSrcUrl khớp; EW-025: reset clear timer
- **`embedP0Tests.spec.ts`** — EW-033: dedupe 6 case unique

| Feature | Test mới | Trạng thái |
| :--- | :--- | :--- |
| Embed Widget (engine/store/components/view + backend edge) | 42 → 107 (+65: components 24, view 11, bridge +, checker +, resizer 8…) | ✅ PASS |
| Full Frontend Suite | 3363 | ✅ PASS (3363/3363, 186 files, +65) |

## Review Round 20 — Export & Share (2026-08-11, sub-agent FIX 3 nhánh) — 3398 frontend

### Test mới / sửa

- **`shareExportModal.spec.ts` (8 test, MỚI)** — EX-007: click TẢI PNG → downloadPNG3x(svgElement); SVG → downloadSVG; GENERATE → generateShareLink; COPY → copyShareLinkToClipboard; thiếu prop không gọi
- **`qrCodeDisplay.spec.ts` (4 test, MỚI)** — EX-007/001/003: toCanvas payload thật + flush post/onMounted; re-render khi link đổi; reject → .qr-error fallback
- **`shareRestoreView.spec.ts` + `shareRestoreViewRouter.spec.ts` (10 test, MỚI)** — EX-002/007: restore /s/ hợp lệ → render; corrupt/missing → error; roundtrip store→URL→view; router push/watch
- **`useExportShareStore.spec.ts`** — EX-007: roundtrip generateShareLink → URL decode → deserialize deep-equal (unicode/+/=); EX-019: clipboard restore; EX-014t: create/revoke URL + setTimeout
- **`exportP0Tests.spec.ts`** — EX-005t: PNG success-path (Image fire onload, progress [30,50,75,90], isExporting false, interval clear); EX-020: bỏ if-guard; EX-030: hết real timers
- **`SVGToCanvasExporter.spec.ts`** — EX-021: gradient/clipPath/foreignObject/image 5 test; EX-027: try/finally + bỏ tautology; EX-028: xmlns
- **`WorkspaceStateCompressor.spec.ts`** — EX-018: roundtrip unicode + cận ngưỡng + consoleSpy; EX-020
- **`exportP2Tests.spec.ts`** — EX-011t: stale link overflow; EX-029: **tách 51 test SignalR (RT-002→011) + Payment (PA-002→012) sang `signalrP2Tests.spec.ts` + `paymentP2Tests.spec.ts`** — exportP2Tests sạch scope

| Feature | Test mới | Trạng thái |
| :--- | :--- | :--- |
| Export & Share (engine/store/components/view/router /s/) | 46 → 81 (+35: modal 8, QR 4, restore 10, PNG 5, SVG edge 5, roundtrip…) | ✅ PASS |
| Full Frontend Suite | 3398 | ✅ PASS (3398/3398, 192 files, +35) |

## Review Round 21 — Notifications (2026-08-11, sub-agent FIX 3 nhánh) — 3423 frontend / 754 backend

### Test mới / sửa

- **`notificationApi.spec.ts`** — NT-001t: URL `/api/v1/notifications` cả 3 endpoint + not.toContain('/concepts/notifications') + Bearer; NT-008t: 401 → refreshAccessToken → retry token mới / refresh fail → reset; NT-027: env base (không hardcode) + network reject
- **`useNotificationStore.spec.ts`** — NT-017: unauth no-op, mark lỗi giữ isRead, isLoading, id lạ; NT-018t: race 2 load chồng lấn response cũ bị bỏ; NT-004t: watch currentUser?.id → reset + logout reset + reset() vô hiệu load đang chạy
- **`notificationBell.spec.ts`** — NT-006: hết pass giả timing (12 phần tử + flushPromises); NT-019: click đã đọc không mark nhưng navigate, linkUrl="" không push, tự đóng, mark-all chỉ hasUnread, unmount gỡ listener + polling dừng; NT-024t: formatTime 7 biên (1ph/59-60ph/24h/7ngày/Invalid/tương lai) vi.setSystemTime
- **Backend (xUnit)** — NT-007: `NotificationsControllerTests` 14 (route, IDOR chéo 404, unauth 401, mark-all idempotent, Take(100) biên 101, unread-count) + `NotificationServiceTests` 14 (NotifyUser/NotifyAdmins batch + 1 admin fail còn lại vẫn insert/MarkAsRead) + `NotificationHubTests` 6 (no client-invokable, Clients.User đúng user, không bao giờ Clients.All)

| Feature | Test mới | Trạng thái |
| :--- | :--- | :--- |
| Notifications (api/store/bell + backend controller/service/hub) | 12 → 37 (+25: api 8, store +, bell +, backend +34) | ✅ PASS |
| Full Frontend Suite | 3423 | ✅ PASS (3423/3423, 192 files, +25) |
| Backend (dotnet test toàn repo) | 754 | ✅ PASS (754/754, +34) |

## Review Round 22 — Core & UI Components (2026-08-11, sub-agent FIX 3 nhánh) — 3474 frontend — ROUND CUỐI

### Test mới / sửa

- **`useModalA11y.spec.ts` (7 test, MỚI)** — CU-008/031: Esc đóng, Tab/shift+Tab trap vòng, restore focus, scroll-lock, **mở sẵn show=true (watch immediate)**, **stack 2 modal** (đóng 1 không unlock), unmount khi mở
- **`markdown.spec.ts` (10 test, MỚI)** — CU-009: XSS regression (escape &<>/script/img onerror), heading/list/code/emoji, link whitelist (javascript:/data: chặn, http/https/mailto cho phép)
- **`useThemeStore.spec.ts` (11 test, MỚI)** — CU-010: initTheme localStorage, matchMedia prefers-light, giá trị lẻ → fallback, applyTheme data-theme, SecurityError try/catch, matchMedia undefined
- **`appHeaderComponentTests.spec.ts` (10 test, MỚI)** — CU-024: logout/openLogin emit, avatar AU-052 regex, icon theme moon/sun, responsive hidden lg:flex, aria-label, setAttribute('data-theme'), bỏ NA-006 readFileSync
- **`appHeaderP0Tests.spec.ts`** — CU-007: mount THẬT (bỏ filteredTabs copy-paste), tab requiresAuth ẩn/Student/Teacher/Admin; CU-036: localStorage.clear giữa it() + jsdom thật
- **`toastP0Tests.spec.ts` (12 test)** — CU-025: icon BaseIcon thật 4 loại, cap maxToasts 5, clearAll, duration=0, handleApiError (Error/string/ApiError→detail), progress animationDuration; CU-035: click .toast-close + gộp test trùng
- **`skeletonP0Tests.spec.ts` (7 test)** — CU-026: exact 5, variant circle/text/card + custom size, reduced-motion (matchMedia) + aria-hidden
- **`teacherModals.spec.ts` (+7)** — CU-027: ConfirmModal variant danger/warning class, overlay .self click, icon prop, loading (spinner + disabled)
- **`uiP2Tests.spec.ts`** — CU-028: vi.stubGlobal fetch + unstubAllGlobals afterEach; CU-037: GT-012 assert giá trị định vị cụ thể
- **`apiClient.spec.ts` (9 test, MỚI)** — CU-038: timeout/signal, error shape ApiError + fallback HTTP, 204 → undefined, content-type guard, **AU-044 không gắn Bearer ở lớp này**, helpers

| Feature | Test mới | Trạng thái |
| :--- | :--- | :--- |
| Core & UI Components (shared/composables/components) | 35 → 86 (+51: modalA11y 7, markdown 10, theme 11, appHeader 10, toast 12, skeleton 7, apiClient 9…) | ✅ PASS |
| Full Frontend Suite | 3474 | ✅ PASS (3474/3474, 197 files, +51) |
| Backend (dotnet test toàn repo) | 754 | ✅ PASS (754/754) |

> **🏁 CHIẾN DỊCH REVIEW & FIX 16/16 TÍNH NĂNG HOÀN TẤT — 22 ROUND · ~730 lỗi xử lý · 3474 frontend + 754 backend test xanh · 0 lỗi type.**

## Review Round 7 — Auth Frontend (2026-08-11, sub-agent FIX STORE-STATE + UI-UX + TESTS) — 2790 → 2826

### Test mới / sửa (frontend)

- **`statelessAuthApi.spec.ts` (15 tests, MỚI)** — AU-001: contract test stub `global.fetch` — URL `/api/v1/concepts/auth/*`, body camelCase `{email, password, refreshToken}`, Bearer header, parse lỗi theo status (400/401/429 → `{error, message}`), timeout; assert body refresh KHÔNG còn `userId` (AU-055)
- **`routerGuardTests.spec.ts` (MỚI)** — AU-010: `requiresAuth` chưa login → landing; `requiresRole` Student → Admin bị chặn / Admin vào được; rời `/admin` → `stopImpersonating`; reset route `/courses` trong beforeEach chống NAVIGATION_DUPLICATED; stub `window.scrollTo`/`document.documentElement` chống vue-router scroll crash
- **`authP0Tests.spec.ts` (15 → 27 tests)** — AU-003: register thành công / trùng email 400 / password policy; AU-025: fake timers + clear timer sau mỗi test (hết rò timer 3.48s); AU-027: assert `authApi.logout(token)` gọi đúng args; AU-028: `startImpersonating` fetch stub assert URL + Bearer admin token; AU-029: assert giá trị cụ thể thay `userLevel >= 1`
- **`useAuthStore.spec.ts`** — AU-053: dùng `testUtils/localStorageMock` dùng chung; AU-054: gộp impersonate test 1 nơi
- **`progressP0Tests.spec.ts` + `progressP2Tests.spec.ts`** — AU-006: shape queue đổi `{amount, reason, userId}` (P0: `userId: null` vì không mock auth store; P2: `userId: 'user-001'`)

| Feature | Test mới | Trạng thái |
| :--- | :--- | :--- |
| Auth frontend (store + API contract + guard + UI) | 22 → 49 (contract API 15, guard mới, register 27, logout/impersonate/fake timers) | ✅ PASS |
| Full Frontend Suite | 2826 | ✅ PASS (2826/2826, 155 files, +36) |
| vue-tsc typecheck | 0 | ✅ 0 lỗi |

## Phase A2 - Tests (2026-08-13)

- Backend `DbSeederTests`: +2 test codelab seed (7 codelab, OwnerId null, testcase/hint/template du) + gan lesson-codelab (5 lesson). TC_R7 mo rong kiem tra codelab khong nhan doi khi seed 2 lan.
- Frontend `lessonApi.spec.ts`: +1 test normalize payload backend `codelab` (PascalCase) -> codelabTask chuan FE (description/initialCode/difficulty/testCases camelCase/hints string[]).
- Frontend `lessonCodelabResolve.spec.ts`: +1 test lesson co codelabId + payload chuan -> store dung codelabTask payload, khong fallback registry.
- Full: backend 770, frontend 3488, vue-tsc 0.

## Phase A3 - E2E + review scores (2026-08-13) - DONE

- Backend `LessonE2EFlowTests.cs` moi: +5 test dong vong xuyen khoa mau tren seed that (GET lesson published + codelab payload, judge pass/fail, complete XP + idempotent).
- Review scores: courses-lessons 7->9, lesson-study 8->9, gamification 7->8 (A2/A3 noi dung that + nguon XP that).

## Phase B - Code Debugger (2026-08-13) - DONE

- Core `CompilerStepExecutor.instrumentation.spec.ts`: +5 test (variables primitive number/string/boolean, khong object/array, cap nhat theo dong, closure makeCounter, vong long nhau i+j).
- Store `useAlgoPlaygroundStore.spec.ts`: +9 test (toggle/clear breakpoint, auto-pause play, stepNext tay qua breakpoint, currentVariables, toggleWatchVariable, watchedValues loc bien khong ton tai, watchList persist, changedVariables).
- Workspace `AlgoPlaygroundWorkspace.spec.ts`: AL-026 (gutter click jump) thay bang 3 test B1 (gutter toggle breakpoint + decoration, play auto-stop tai breakpoint, stepNext tay qua).
- Full: frontend 3504/3504 (+16), vue-tsc 0. Backend khong doi.

## Phase C - Tests (2026-08-13)

- Backend `PaymentServiceTests`: +2 (GetOrderStatus order qua han -> Expired + commit; order con han -> Pending + khong commit).
- Backend `GamificationServiceTests`: +4 (level-up -> NotifyLevelUpAsync; khong doi level -> khong notify; badge moi -> NotifyBadgeAwardedAsync; notification loi -> request van thanh cong).
- Frontend: checkout 32/32 (nhan mo phong khong pha selector), algo-playground workspace 24/24 (menu Xuat PNG).
- Full: backend 781/781 (+6), frontend 3504/3504.

## Phase D - Tests (2026-08-13)

- Backend `AdminControllerTests`: +2 (GetLearningAnalytics stats dung: 2 learners, 50% viz, 50% pass quiz, 100% pass khi co viz vs 0% khong viz; khong progress -> 0 khong loi).
- Frontend: admin panel tests giu nguyen (tab moi khong pha); gamification text "+50 XP (Demo)" khong test assert cu nao pha.
- Full: backend 783/783 (+2), frontend 3504/3504, vue-tsc 0.
