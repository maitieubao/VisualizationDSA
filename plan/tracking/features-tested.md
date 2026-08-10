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
