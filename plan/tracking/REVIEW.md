# ✅ REVIEW — Nhật Ký Các Tính Năng Đã Được Review Sâu

> **Nguồn dữ liệu chính:** `DATN_ERRORS.md` (nhật ký lỗi chi tiết từng batch).
> **Quy tắc sắt:** File này và `UNREVIEW.md` phải được cập nhật **ngay sau mỗi phiên review sâu hoặc mỗi lần sửa code** liên quan đến tính năng đã liệt kê. Khi một tính năng trong `UNREVIEW.md` được review xong → chuyển sang file này kèm đầy đủ ghi chú.

---

## 📊 Bảng Tổng Hợp

| # | Tính năng | Batch ID trong errors | Số lỗi ghi nhận | Mức review | Trạng thái hiện tại |
| :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | Execution Control / VCR Playback | EC-001 → EC-050 | ~50 | ✅ FULL (round 1, 2, 3, 5) | ✅ Toàn bộ FIXED; residual P3: EC-032/033/034/035/037/039→047 |
| 2 | Interactive Playground (Graph) | IP-001 → IP-049 | ~49 | ✅ FULL (round 1, 2, 3, 5) | ✅ Toàn bộ FIXED |
| 3 | Pseudocode Sync | PS-001 → PS-041 | ~41 | ✅ FULL (round 1, 5) | 🟡 Còn **PS-007** (click-to-snap) + **PS-038** (field `type`) |
| 4 | Quiz System | QZ-001 → QZ-056 | ~56 | ✅ FULL (round 1, 2, 3, 5) | 🟡 Còn **QZ-048** ⏳ DEFERRED (backend bank quiz) |
| 5 | Code-to-Visualization | CV-001 → CV-008, CV-101 → CV-144 | ~52 | ✅ FULL (round 4, 5) | ✅ Toàn bộ FIXED (verify lại round 5) |
| 6 | Docs Knowledge Base | DC-001 → DC-031 + DC-C1→C14 + DC-T1→5 | ~50 | ✅ FULL (round 4, 5) | 🟡 Còn **DC-021** ⏳ DEFERRED (breadcrumb + search) |
| 7 | Design Patterns / OOP / SOLID / DI (chuyển docs) | DP-001 → DP-004 | 4 | ✅ FULL (round 4) | ✅ Chuyển hướng học thuật sang `docs/`, controller backend xóa |
| 8 | Cross-cutting (toàn repo) | CC-001 → CC-012 | 12 | ✅ FULL (round 2→6) | 🟡 Còn **CC-012** ⏳ OPEN (warning BaseIcon pre-existing) |
| 9 | E-Lecture Mode | (lẻ: EC-036, QZ-019, QZ-006) | 3 | 🟡 PARTIAL — chưa có batch riêng | ⚠️ Chưa review đầy đủ 4 góc nhìn |
| 10 | Guided Tour | CV-106, CV-142 | 2 | 🟡 PARTIAL — gắn trong batch CV | ⚠️ Chỉ review các bước tour `/code-ide` |
| 11 | ~~Sorting Visualizer (engine)~~ | (gián tiếp: EC-008, CC-011) | 2 | 🟡 PARTIAL → ✅ **ĐÃ NÂNG FULL (xem mục 17)** | Round 12 (2026-08-11): 44 lỗi SV-001→044, 44/44 FIXED, CC-009 phủ 7 engine |
| 12 | Auth | AU-001 → AU-055 | 55 | ✅ FULL (round 7, 2026-08-11) | ✅ 54/55 FIXED (AU-045 PARTIAL) — backend 416/416 + frontend 2826/2826 |
| 13 | Payment / Checkout Premium | PM-001 → PM-065 | 65 | ✅ FULL (round 8, 2026-08-11) | ✅ 64/65 FIXED (PM-053 DEFERRED) — backend 472/472 + frontend 2846/2846 |
| 14 | Admin Panel | AD-001 → AD-060 | 60 | ✅ FULL (round 9, 2026-08-11) | ✅ 58/60 FIXED (AD-024/044 PARTIAL) — backend 507/507 + frontend 2866/2866 |
| 15 | HTML Playground | HT-001 → HT-033 | 33 | ✅ FULL (round 10, 2026-08-11) | ✅ 33/33 FIXED — frontend 2911/2911 |
| 16 | Algo Playground + Custom Input | AL-001 → AL-049 | 49 | ✅ FULL (round 11, 2026-08-11) | ✅ 48/49 FIXED (AL-042 PARTIAL) — frontend 2942/2942 |
| 17 | Sorting Visualizer (7 engine) | SV-001 → SV-044 | 44 | ✅ FULL (round 12, 2026-08-11) | ✅ 44/44 FIXED — frontend 3058/3058 |
| 18 | Courses & Lessons (LMS) | LM-001 → LM-071 | 71 | ✅ FULL (round 13, 2026-08-11) | ✅ 70/71 FIXED (LM-058 DEFERRED) — frontend 3086/3086 + backend 507/507 |
| 19 | Lesson Study / Course Modules | LS-001 → LS-042 | 42 | ✅ FULL (round 14, 2026-08-11) | ✅ 42/42 FIXED — frontend 3129/3129 + backend 552/552 |
| 20 | Teacher Panel | TC-001 → TC-047 | 47 | ✅ FULL (round 15, 2026-08-11) | ✅ 46/47 FIXED (TC-041 PARTIAL) — frontend 3184/3184 + backend 591/591 |
| 21 | Classrooms | CR-001 → CR-051 | 51 | ✅ FULL (round 16, 2026-08-11) | ✅ 51/51 FIXED — frontend 3221/3221 + backend 665/665 |
| 22 | Gamification | GM-001 → GM-046 | 46 | ✅ FULL (round 17, 2026-08-11) | ✅ 46/46 FIXED — frontend 3269/3269 + backend 708/708 |
| 23 | User Profile | PR-001 → PR-037 | 37 | ✅ FULL (round 18, 2026-08-11) | ✅ 37/37 FIXED — frontend 3298/3298 + backend 720/720 |
| 24 | Embed Widget | EW-001 → EW-033 | 33 | ✅ FULL (round 19, 2026-08-11) | ✅ 33/33 FIXED — frontend 3363/3363 |
| 25 | Export & Share | EX-001 → EX-030 | 30 | ✅ FULL (round 20, 2026-08-11) | ✅ 29/30 FIXED (EX-023 PARTIAL) — frontend 3398/3398 |
| 26 | Notifications | NT-001 → NT-029 | 29 | ✅ FULL (round 21, 2026-08-11) | ✅ 29/29 FIXED — frontend 3423/3423 + backend 754/754 |
| 27 | Core & UI Components | CU-001 → CU-038 | 38 | ✅ FULL (round 22, 2026-08-11) | ✅ 38/38 FIXED — frontend 3474/3474 + backend 754/754 |

---

## 1. 🎬 Execution Control / VCR Playback — ✅ FIXED

- **Scope:** `frontend/src/features/vcr-player/**`, `frontend/src/features/animation-engine/**`, `SortingView.vue`, `VcrDockBar.vue`, `AnimationVcrControls.vue`, `usePlaybackHotkeys.ts`
- **Batch review:** EC-001 → EC-050 (P0=3, P1=7, P2=10, P3~20) — chiến dịch fix 2026-08-10 + round 2 (EC-048/049) + round 3 (EC-050)
- **Đã fix nổi bật:**
  - Ticker dùng `advanceFrame` riêng (không ép pause) + clamp speed 0.1–5.0x (`useVcrStore.ts:156`)
  - Step ép pause + debounce 100ms chống spam (`useVcrStore.ts:126-142`)
  - `jumpToFrame` auto-pause hết race interval ↔ store (`useVcrStore.ts:144-148`)
  - Replay khi ở frame cuối + title/aria-label động + `rounded-full` glass theo spec
  - `isAtEnd` dùng `===` + watch tự heal index khi dataset đổi (`:60-67`)
  - rAF loop chỉ chạy khi playing (`SortingAnimationEngine.ts:51,159-160`); dirty-flag cho PlaygroundCanvas
  - Toast thay `alert()`, `e.repeat` guard cho Space/R, DPI/Retina cho canvas
- **Còn lại (P2/P3, chưa xử lý):** EC-032 dead code `VcrControls.vue`; EC-033 `loadResult` không reset `loopEnabled`; EC-034 latent `playUntilTarget` treo; EC-035 `progressPercent` dataset 1 frame; EC-037 dead flag `isLooping`; EC-039→046 thiếu test (fake timers, ticker core, OOB, dispose watch, `require('fs')`); EC-047 cụm `VisualizationPlayer` chưa mount route production
- **Bằng chứng:** frontend 2790/2790 pass; spec phase1/phase2 khớp code

## 2. 🕸️ Interactive Playground (Graph) — ✅ FIXED

- **Scope:** `frontend/src/features/interactive-playground/**`, `views/graph/GraphView.vue`, `ForceDirectedEngine.ts`
- **Batch review:** IP-001 → IP-049 (P0=1, P1=11, P2=12, P3~10)
- **Đã fix nổi bật:** import JSON validate (tọa độ NaN, trọng số âm, >30 nodes, dangling edge, label trùng); directed vẽ cạnh 2 chiều; bắt buộc liên thông Dijkstra + flash đỉnh cô lập; Pointer Events + `setPointerCapture` + `touch-action:none` (touch OK, pinch zoom TODO); clamp kéo-thả theo world-space đúng zoom; snap/hit-test theo zoom; grid + pan offset; DPR/Retina; `toAdjacencyList` tôn trọng graphType (bug thật round 2); action `setZoomLevel`/`moveNode`/`setSourceNodeId` thay mutation trực tiếp; toast ghi đè + cache `getComputedStyle` + dọn dead code `resetZoom`
- **Còn lại:** TODO nhỏ — gộp `autoLayout` vào store; pinch zoom
- **Bằng chứng:** interactive-playground 14 test pass; canvasEventHandlers P2 pass

## 3. 🔗 Pseudocode Sync — 🟡 còn 2 mục mở

- **Scope:** `frontend/src/features/pseudocode/**`, `PseudocodeSyncEngine.ts`, `usePseudocodeStore.ts`, `MultilingualCodePanel.vue`
- **Batch review:** PS-001 → PS-041 (P0=3, P1=6, P2=14, P3~15)
- **Đã fix nổi bật:** FrameDTO mang `activeLogicalLineId`/`variables` (chuẩn camelCase, backend `BubbleSortStrategy.cs` emit); highlighter viết lại an toàn với HTML đã chèn span; mount UI vào SortingView; debounce highlight 50ms khi speed ≥ 2.0 (PS-006 ✅); `getPhysicalLineNumbers` trả danh sách dòng khớp logicalId (Java 3 dòng SWAP cùng sáng); badge occurrence chỉ hiện đúng dòng active; reset store khi rời view; `temp` capture trước swap
- **Còn lại:**
  - **PS-007 (P1, OPEN):** click-to-snap lệch spec — `MultilingualCodePanel.vue:60` vẫn gọi `snapToNextOccurrence`; phải dùng `snapToLogicalLine` (first occurrence)
  - **PS-038 (P2, TODO):** `VariableState` thiếu field `type: 'index'|'pointer'|'temporary'` — types/* do agent khác sở hữu; `VariableWatchPanel.vue` đã để sẵn TODO comment
- **Bằng chứng:** pseudocode 46 test pass

## 4. 📝 Quiz System — 🟡 còn QZ-048 DEFERRED

- **Scope:** `frontend/src/features/quiz/**` + backend `StatelessQuizController.cs`, `QuizzesController.cs`, `QuizAttempt`
- **Batch review:** QZ-001 → QZ-056 (P0=5, P1=14, P2=25, P3~10)
- **Đã fix nổi bật:** QZ-003 `withAnswers=true` đúng role (lesson/teacher/admin); XP sync nối dây đầy đủ (payload `{quizId, answers}`, retry 1 lần, refresh token 401); CANVAS_TARGET có lối thoát khi data mismatch; validator chặn `correctOptionIndex` cận trên; type guards `statelessQuizApi` (hết fallback giả); endpoint `/concepts/quiz/history` đúng URL; race double-submit có test; token hết hạn tự refresh; `loadCheckpoints` reset khi đổi thuật toán; streak lifetime + `getAccuracy()`
- **Còn lại:**
  - **QZ-048 (P2, ⏳ DEFERRED):** bank quiz không ghi `QuizAttempt` → `/history` thiếu attempt của quiz bank — cần materialize bank hoặc cột nullable `QuizKey` + migration
  - **QZ-007 (⚠️):** race "thoát giữa lúc submit in-flight → result cũ sống lại" — chưa fix, cần generation-token/AbortController (TODO agent store)
  - TODO component: `BackendQuizWorkspace` nên ẩn fallback khi `backendQuizError != null`; `VisualizationPlayer` truyền `script.algorithmId` làm quizId
- **Bằng chứng:** quiz 118 test pass; backend 372/372 pass

## 5. 💻 Code-to-Visualization — ✅ FIXED (verify round 5)

- **Scope:** `frontend/src/features/code-to-visualization/**`, `CompilerStepExecutor.ts`, `compileWorker.ts`, `ASTInstrumentationEngine.ts`
- **Batch review:** CV-001 → CV-008 (gốc) + CV-101 → CV-144 (round 4, 5)
- **Đã fix nổi bật:** `pendingReject` module-level hết dangling promise (CV-101); `compileWorker` dùng `Map<requestId>` + 1 handler duy nhất (CV-102); sandbox chặn `fetch`/`XHR`/`importScripts` (CV-103); auto-invoke heuristic an toàn (CV-104); glow xanh chỉ khi thành công + tour bước 5 spotlight đủ (CV-105/106, CV-141/142); LOOP_LIMIT 20000 + spec đồng bộ; ForOf/In guard; 1-vế-member; IIFE; `onmessageerror`; sentinel; generation token (CV-115); `traceAssign` variables tên thật từ MemberExpression (CV-143); ASSIGN tách khỏi SWAP qua `highlights.assign` (CV-144); 0 lỗi vue-tsc cho ASTInstrumentationEngine (2026-08-11)
- **Còn lại:** `toFriendlyWorkerError` engine cũ thô 🟡 PARTIAL; `var` loop tracking 🟡 PARTIAL; palette chưa có `COLOR_ASSIGN` (chờ agent renderer)
- **Bằng chứng:** code-to-viz 80 test pass; 2790/2790 tổng

## 6. 📚 Docs Knowledge Base — 🟡 còn DC-021 DEFERRED

- **Scope:** `frontend/src/features/docs/**` (layout, renderer, mermaid, sidebar, TOC, nội dung markdown)
- **Batch review:** DC-001 → DC-031 + DC-C1 → C14 (nội dung kiến thức) + DC-T1 → 5 (test/tracking)
- **Đã fix nổi bật:** hamburger mobile; TOC click không phá hash router (selector `a[href^="#"]:not([href^="#/"])`); scrollspy + deep-link `#section` cuộn đúng (`scrollToHashSection` sau 2 thì render); click delegation sống ở mọi bài; redirect `/oop /solid /di /patterns` + 14 slug topic; shiki escape fallback + allowlist style + `normalizeLang`; link `.md` → `/docs/`; đổi title trùng; subgraph nháy id; fontSize 1 nguồn; chặn emoji SVG; nội dung sửa học thuật: quick-sort Lomuto, linear-search sentinel, trie "app", bucket-sort phần tử 0.68, counting-sort không âm, two-pointers [3,4], heap extract SiftDown, BGP path-vector...
- **Còn lại:** **DC-021 ⏳ DEFERRED** — breadcrumb + ô tìm kiếm chưa có (đã xong: scroll active + collapse persistence)
- **Bằng chứng:** docs 45 test pass (round 5 +6 test)

## 7. 🏛️ DP / OOP / SOLID / DI (chuyển hướng docs) — ✅ XONG

- **Batch review:** DP-001 → DP-004
- **Kết luận:** 3 controller backend chết (SOLID/DesignPatterns/DI-Container) → **đã xóa khỏi backend**; thay bằng docs học thuật `docs/di/*.md`, `docs/oop/*.md`, `docs/system-design/*.md` (ADR-05/40); tracking `progress.md`/`README.md` đánh dấu "❌ ĐÃ THAY THẾ — Docs Reference"; 6 kịch bản Guided Tour route cũ không bao giờ kích hoạt (ghi nhận, không cần code)
- **Bằng chứng:** backend build 0 lỗi sau khi xóa controller; `dotnet test` 372/372

## 8. 🔀 Cross-cutting (CC-001 → CC-012) — 🟡 còn CC-012

- **Đã xử lý:** CC-001→010 (tracking sai CODE DONE→PARTIAL, dead code inventory, FrameDTO contract, PlaygroundJsonPanel, syncSessionToServer...) + CC-011 type drift dsa-modules renderers → **✅ FIXED 2026-08-11** (vue-tsc 148→0 lỗi, batch TS-001→012 trong `errors.md` Review Round 6)
- **Còn lại:** **CC-012 ⏳ OPEN** — Vue warn "Failed to resolve component: BaseIcon"/router-link pre-existing trong test `dsa-modules/__tests__/dsaP0Tests.spec.ts`, `PremiumGate` (export-share), `LandingView` (dashboardP2Tests) — nhiễu output, không ảnh hưởng pass/fail

## 9. 🎓 E-Lecture Mode — 🟡 PARTIAL (chưa review đầy đủ)

- **Mới chạm qua:** EC-036 (hotkey phải check `interactionLocked` — đã fix), QZ-019 (dismiss phải resume playback — đã fix), QZ-006 (sync XP khi hoàn tất checkpoint)
- **Chưa làm:** chưa có batch review riêng 4 góc nhìn (engine/store/UI/test) cho `LectureOverlay.vue` + `useLectureStore.ts`

## 10. 🧭 Guided Tour — 🟡 PARTIAL

- **Đã fix:** CV-106 (tour `/code-ide` mô tả IDE không tồn tại → spotlight 11/12 rỗng), CV-142 (bước 5 run-btn luôn tồn tại + test chốt DOM)
- **Chưa làm:** chưa review các tour khác (3 tours: GuidedTourOverlay + HelpButton) một cách hệ thống

## 11. 📊 Sorting Visualizer (engine 7 thuật toán) — 🟡 PARTIAL

- **Đã chạm gián tiếp:** EC-008 (rAF loop khi PAUSED — đã fix), CC-011 (type drift renderers BarChart/BoxArray/Tree/Tube/Graph — đã fix 2026-08-11)
- **Chưa làm:** chưa review sâu 7 engine (`algorithm-sandbox/`) theo batch — dù đã có **460 test pass**

## 12. 🔐 Auth — ✅ FIXED (54/55)

- **Scope:** `frontend/src/features/auth/**` (useAuthStore, statelessAuthApi, authApi, authSessionHelpers, LoginModal) + `services/apiClient.ts` + `router/index.ts` + `main.ts` + `App.vue`; backend `AuthController.cs`, `StatelessAuthController.cs`, `AuthService.cs`, `StatelessAuthStrategy.cs`, `JwtHelper.cs`, `JwtSigningConfig.cs`
- **Batch review:** AU-001 → AU-055 (P0=3, P1=7, P2=19, P3=26) — Review Round 7, 4 góc nhìn, 2026-08-11
- **Đã fix nổi bật:**
  - Backend: refresh rotation trong 1 transaction + reuse detection + stateless remove-if-match (AU-004 — lỗi bảo mật lớn nhất); JWT key env-only, xóa placeholder commit (AU-009); check ban ở refresh (AU-011); TOCTOU register → 400 (AU-012); hết user enumeration (AU-013) + timing side-channel dummy hash (AU-014); rate limit change-password (AU-015); TTL eviction + refresh dữ liệu stateless cache (AU-016); clamp TTL (AU-017); revoke mọi phiên khi đổi mật khẩu (AU-022); fail-closed ban check (AU-039); normalize email (AU-037); iss/aud claims (AU-035)
  - Frontend store: bỏ statelessInit lần 2 — hết mất session khi khởi động (AU-005); logout reset store phụ thuộc + XP queue gắn userId — hết trôi XP (AU-006); session expiry có toast + redirect kèm route nguồn (AU-007); init chỉ clear session khi 4xx (AU-008); single-flight refresh đã có sẵn + dọn dead code (AU-042→045); per-action loading (AU-050)
  - Frontend UI: confirm password (AU-018), focus trap + autofocus (AU-019), logout confirm, inline field error (AU-024), autocomplete, demo cred chỉ login mode, backdrop guard (AU-051), avatar regex (AU-052)
  - Tests: `statelessAuthApi.spec.ts` contract 15 test (AU-001), `routerGuardTests.spec.ts` (AU-010), `StatelessAuthControllerTests` 14 + `StatelessAuthStrategyTests` 16 (AU-002/003), fake timers hết timer leak (AU-025), queue shape +userId 5 test (AU-006)
- **Còn lại:** AU-045 PARTIAL — nhánh classic `authApi.login/register/logOut` giữ vì store còn nhánh classic (cần refactor store nếu muốn bỏ hẳn)
- **Bằng chứng:** backend **416/416 PASS** (+44), frontend **2826/2826 PASS** (155 files, +36), `vue-tsc -b` 0 lỗi

## 13. 💳 Payment / Checkout Premium — ✅ FIXED (64/65)

- **Scope:** `frontend/src/features/payment/**` (usePaymentStore, statelessPaymentApi, QrPaymentPanel, PremiumGate, CheckoutSuccessScreen, CheckoutIdleScreen, usePaymentTimer, usePaymentPolling) + `views/checkout/PremiumCheckoutView.vue`; backend `PaymentsController.cs`/`StatelessPaymentController.cs`/`PaymentService.cs`/`StatelessPaymentStrategy.cs` + Order entity
- **Batch review:** PM-001 → PM-065 (P0=5, P1=15, P2=24, P3=21) — Review Round 8, 4 góc nhìn, 2026-08-11
- **Đã fix nổi bật:**
  - Backend: **verify hết quyền cấp premium** (PM-001 P0 — chỉ trả trạng thái order); simulate-webhook check ownership qua userId từ token (PM-002); `ExpiresAt` 15 phút + migration + từ chối order quá hạn (PM-003); idempotency trong transaction + unique index + affected-rows (PM-004); fail-closed config SePay (PM-005); 1 nguồn config giá/bank (PM-006); DB commit trước cache in-memory (PM-007); chặn user premium/pending 409 (PM-008); enum OrderStatus +Expired (PM-009); evict in-memory (PM-010); 401 thay NRE 500 (PM-011); rate limit webhook (PM-012); warning field + Serilog cho transaction lạ (PM-013); fail-closed feature access (PM-015)
  - Frontend store: **polling chạy cả 2 branch — hết dead-end stateless** (PM-016 P0); reentrancy guard (PM-017); stop polling khi mất token + reset khi đổi user (PM-018/022); 1 hằng số timeout 15 phút (PM-019); `markPremium()` action thay 4 chỗ mutation trực tiếp (PM-021); fetch timeout 10s + in-flight guard (PM-023); xóa usePaymentPolling dead code (PM-024); fail count → error state (PM-025)
  - Frontend UI: PremiumGate dùng được + a11y dialog (PM-020/030); guard "đã premium" (PM-026); lỗi tiếng Việt (PM-027); QR expired ẩn hướng dẫn/copy (PM-028); redirect route nguồn (PM-029); formatVND chung (PM-031); 1 nguồn giá (PM-032); retry 1 click + focus quản lý + reduced-motion + a11y copy/alt/aria-live
  - Tests: **`statelessPaymentApi.spec.ts` contract 10 test** (PM-035t); `checkoutPaymentFlow.spec.ts` luồng thật (PM-012t); `PaymentsControllerTests` 9 + `StatelessPaymentControllerTests` 10 + PaymentServiceTests 20 (PM-053t/054t/057); sửa 3 test pass giả P0 (PM-049t→051t)
- **Còn lại:** PM-053 DEFERRED — countdown `setInterval` → timestamp `Date.now()` (tab nền); PM-004 CAS SQL không làm được (re-check + unique + affected-rows thay thế)
- **Bằng chứng:** backend **472/472 PASS** (+56), frontend **2846/2846 PASS** (157 files, +20), `vue-tsc -b` 0 lỗi

## 14. 🛠️ Admin Panel — ✅ FIXED (58/60)

- **Scope:** `frontend/src/views/admin/**` (AdminPanelView, AdminUsersTab, AdminQuizzesTab, AdminDashboardTab, AdminAuditTab, AdminSystemTab, useAdminApi) + `useAuthStore` impersonate; backend `AdminController.cs`/`UsersController.cs` + audit chain (AuditEventService, AuditEventActionFilter, ImmutableAuditInterceptor)
- **Batch review:** AD-001 → AD-060 (P0=1, P1=5, P2=33, P3=21) — Review Round 9, 4 góc nhìn, 2026-08-11
- **Đã fix nổi bật:**
  - Backend: **impersonate token có iss/aud — hết 401** (AD-001 P0); chặn impersonate Admin/Teacher target (AD-002); RequireJwtRole đối chiếu role DB — demote mất quyền ngay + chặn tự đổi role (AD-003); **BanUser ghi audit** (AD-004); DeleteUser await + FK Conflict 409 (AD-005); dashboard `isFallback` deterministic (AD-006); audit lấy UserId từ token (AD-007); DbContext factory riêng cho audit (AD-008); rate limit ResetPassword (AD-009); AuditLog immutable (AD-011); SyncXP cap 50 + reason whitelist (AD-012); impersonate response chuẩn StatelessUserDto (AD-013); rate limiter atomic + 429 (AD-031); TogglePremium đối chiếu order Pending (AD-032); CreateUser validate role + 201 (AD-033); Sequence Interlocked (AD-040); refresh impersonate giữ marker (AD-043)
  - Frontend core: stopImpersonating refresh token hết hạn (AD-014); **totalAdmins toàn cục** — isLastAdmin đúng (AD-015); loadUsers lỗi tách empty (AD-016); search debounce 300ms + AbortController (AD-017); rowActionLoading per-row + premium confirm (AD-018); **adminRequest timeout 15s + 401→refresh→retry** (AD-019); reset dependent stores khi impersonate (AD-020); nút Xóa btn-delete-danger riêng (AD-022); disable ban/delete admin cuối (AD-023); tabs a11y tablist (AD-027); 3 modal dialog/focus trap/Escape (AD-028); lưu tab vào query (AD-054)
  - Frontend UI: dashboard fetch audit-logs THẬT + SystemTab đo /health thật — hết data fake (AD-021); quizzes 3 trạng thái (AD-025); audit pagination thật (AD-026); chart scale động (AD-029); empty states (AD-030); alert→toast toàn panel (AD-024/051)
  - Tests: **AdminControllerTests 28 case + UsersControllerTests 5** (AD-034); **useAdminApi.spec.ts 13 test contract** (AD-039); bỏ catch-all mock fail-closed (AD-035); impersonate test đầy đủ (AD-036); hết `any` (AD-057); Teacher→/admin guard (AD-058)
- **Còn lại:** AD-024/AD-044 PARTIAL — giữ native `confirm()` cho row actions + impersonate fetch tại component (test pin hành vi 1-click); cần agent test đổi pin nếu muốn chuẩn ConfirmDialog/startImpersonating
- **Bằng chứng:** backend **507/507 PASS** (+35), frontend **2866/2866 PASS** (158 files, +20), `vue-tsc -b` 0 lỗi. **Phase 1 HOÀN TẤT (Auth + Payment + Admin).**

## 15. 🖥️ HTML Playground — ✅ FIXED (33/33)

- **Scope:** `frontend/src/features/html-playground/**` (PlaygroundWorkspace, PlaygroundPreview, useHtmlPlaygroundStore, PlaygroundDocumentBuilder, PlaygroundUrlCodec, PlaygroundDebouncer, playgroundDemos) + `views/playground/PlaygroundView.vue`
- **Batch review:** HT-001 → HT-033 (P1=4, P2=13, P3=16) — Review Round 10, 3 góc nhìn, 2026-08-11
- **Đã fix nổi bật:**
  - **Debouncer hoạt động thật**: `previewDoc` snapshot gating — hết reload iframe mỗi keystroke (HT-001); Run gọi flush (HT-018); phantom run chặn bằng isProgrammaticWrite + equality guard (HT-019)
  - **Bảo mật**: referrerpolicy no-referrer (HT-002); `<base about:blank>` hết cookie leak (HT-005); CSP meta defense-in-depth (HT-007); sandbox bỏ allow-modals/popups (HT-023); MAX_PAYLOAD 6000 guard (HT-006)
  - **UX**: **error bridge `playground-error` + panel console lỗi** (HT-003); isRunning spinner (HT-008); auto-run toggle (HT-009); split drag handle (HT-010); KeepAlive giữ Monaco khi switch mode (HT-011); merge `?code=` (HT-012); reset confirm + giữ tab (HT-013); tabs WAI-ARIA (HT-024); fallback textarea khi Monaco lỗi (HT-026); responsive mobile (HT-027)
  - Tests: **PlaygroundView.spec.ts mới** (share URL→store, roundtrip, toast) (HT-004); component debounce test thật + fake timers (HT-015); editor↔store contract 4 test (HT-016); **demo thực thi 22 demo** bắt syntax error (HT-032); escape `<!--` + unicode (HT-031); hết `any` (HT-029)
- **Bằng chứng:** frontend **2911/2911 PASS** (159 files, +45), `vue-tsc` 0 lỗi, backend 507/507 (không đụng)
- **Ghi chú:** KeepAlive caveat — AlgoPlaygroundWorkspace keydown listener sống khi ẩn mode (handler tự chặn khi focus input; TODO onDeactivated pause nếu cần)

## 16. ⚙️ Algo Playground + Custom Input — ✅ FIXED (48/49)

- **Scope:** `frontend/src/features/algo-playground/**` (3 SortingAnimationEngine, AlgoInputParser, compileErrorTranslator, playgroundAlgoDemos, useAlgoPlaygroundStore, useAlgoAnimation, algoCanvasHelpers, AlgoPlaygroundWorkspace) + `frontend/src/features/custom-input/**` (useInputStore, useCustomInputForm, CustomInputForm)
- **Batch review:** AL-001 → AL-049 (P1=9, P2=24, P3=16) — Review Round 11, 3 góc nhìn, 2026-08-11
- **Đã fix nổi bật:**
  - KeepAlive: onDeactivated gỡ phím tắt + engine.pause(), onActivated đăng ký lại + sync (AL-001/002); **race Play→compile→auto-play** hết nhờ watcher frames play theo store (AL-003); runSeq++ + pendingPlay reset hết stale frames (AL-004); setInput invalidate (AL-005); custom input requestId + AbortController (AL-006)
  - Engine: parser chặn Infinity (AL-010), chặn mảng rỗng (AL-011), translator +4 case (AL-013), minWithFallback thống nhất spread (AL-033), computeGeo memoize (AL-034), COLORS/roundRect/lerpColor gom helpers (AL-036), captionFor heap đúng (AL-037), bucket compare cặp liền kề (AL-038), MergeSort số âm đúng baseline (AL-039)
  - Store/UI: reset isPlaying khi lỗi (AL-012), ?demo= ưu tiên URL (AL-014), Esc chỉ đóng dropdown (AL-015), Ctrl+Alt+R (AL-016), canvas role/aria (AL-017), form a11y (AL-018), run dừng ngay (AL-019), setAlgorithmLimit nối form (AL-031), setPlaybackSpeed/setRawText actions (AL-040/041), popover động + Esc (AL-043), chặn input trống Chạy (AL-044), auto-run chỉ khi đổi (AL-045)
  - Tests: **useAlgoAnimation.spec 11 test + algoCanvasHelpers.spec 10 test MỚI** (AL-008/009); 5 test pass giả → mount thật (AL-007); engine edge tests (AL-029), pendingPlay + replay (AL-028), isSiftSwap (AL-030), MergeSort draw asserts (AL-032), demo ids từ Object.keys (AL-047)
- **Còn lại:** AL-042 PARTIAL — setLimit dead code giữ vì test pin
- **Bằng chứng:** frontend **2942/2942 PASS** (161 files, +31), `vue-tsc` 0 lỗi, backend 507/507 (không đụng)
- **Ghi chú 2026-08-16 (UI Compaction):** Thêm AL-050/051/052 — auto-collapse editor trên mobile, drawer VCR thu gọn được (v-show), persist editorCollapsed (`algo-playground:ui`). +3 test, full suite 3502/3502 PASS, `vue-tsc` CLEAN. Chi tiết: `plan/tracking/progress.md` Phase 2.18.1.

## 17. 📊 Sorting Visualizer — ✅ FIXED (44/44)

- **Scope:** `frontend/src/features/algorithm-sandbox/**` (7 engine algorithms/*.ts, useSortingAnimation, 4 composable riêng, sortingIdEnricher, PseudocodeSyncer, MonacoLineSyncerCoordinator, MonacoGutterClickInterceptor, 20+ component visualizer) + `views/sorting/SortingView.vue`
- **Batch review:** SV-001 → SV-044 (P0=1, P1=3, P2=13, P3=27) — Review Round 12, 3 góc nhìn, 2026-08-11
- **Đã fix nổi bật:**
  - **CC-009 phủ toàn bộ 7 engine**: SortFrame thêm `SortHighlights` + `lineNumber/activeLogicalLineId` — pseudocode highlight + gutter click hoạt động đầy đủ (SV-002); fix order-coupling test (SV-001); **Merge FLIP animation theo identity** (SV-003); mergeSort n=1 sorted (SV-004)
  - Engine: gutter click gần nhất + snap span (SV-007), spread → 1 pass (SV-008), enricher Map O(n log k) (SV-009), bubble early-exit (SV-018), heap phase đúng (SV-019), violation precedence (SV-020), Set sortedIndices (SV-021), dead API xóa (SV-022), click phải guard (SV-023), truncate toast (SV-024), quickSort hết self-swap (SV-025)
  - UI: Merge tree scroll khớp (SV-010), "–/0" (SV-026), bucket distribute label (SV-027), badge VCR PLAYBACK (SV-028), trace a11y (SV-031), aria-pressed (SV-032), --count-items (SV-033), setRawInputArray action (SV-034), radix chip log10 (SV-036), smooth scroll chỉ user jump (SV-038)
  - Tests: **matrix 42 cell 7 engine** (SV-012), **perf 100 × 7 engine** (SV-013), race input giữa playback (SV-014), **sortingComposables.spec 23 test + RadixSortVisualizer.spec** (SV-015), coordinator 6 test huyết mạch (SV-011), greedy duplicate (SV-017), FIFO probe (SV-041), hết `any` (SV-042)
- **Bằng chứng:** frontend **3058/3058 PASS** (163 files, +116 — sorting 99→215), `vue-tsc` 0 lỗi, backend 507/507 (không đụng). **PHASE 2 HOÀN TẤT (HTML + Algo + Sorting).**

## 18. 🎓 Courses & Lessons (LMS) — ✅ FIXED (70/71)

- **Scope:** `features/lesson/**` (codelabExecutor, codelab.worker, codelabTaskRegistry, useLessonStore, lessonApi, LessonStepCodeLab, LessonStudyView...) + `features/courses/**` + `views/courses|lesson/**`; backend `CourseController.cs`/`LessonController.cs`/`ClassroomProgressController.cs`
- **Batch review:** LM-001 → LM-071 (P0=3, P1=19, P2=32, P3=17) — Review Round 13, 3 góc nhìn, 2026-08-11
- **Đã fix nổi bật:**
  - Backend: **hết route trùng PUT/DELETE lessons 500** (LM-001); **codelab sandbox chặn fetch/XHR/importScripts/WebSocket + LOOP_LIMIT 20000 sentinel** (LM-004); **XP không tin client — lấy từ DB lesson.XPReward + rate limit/cap 500 XP/ngày** (LM-006); gate publish/premium cho progress (LM-005); IDOR unlocked-items (LM-007); server filter IsPublished (LM-008); CompleteLesson upsert atomic (LM-009); AddModuleItem ownership (LM-011); **quizScore thống nhất 0..100 2 đầu** (LM-021); N+1 unlocked gom 1 query (LM-026); heuristic quiz link đúng (LM-028); analytics NRE (LM-029); BestScore field + RecordBestScore (LM-056)
  - Store/UI: **race đổi bài hết nhờ isSameLesson sau mỗi await** (LM-010); modal completion đóng khi chuyển bài (LM-012); hết anchor lồng (LM-013); **progress card đếm từ localStorage lesson_progress_*** (LM-014); gate step 2 thật (LM-015); retry sync theo (lessonId, payload) + MAX 3 (LM-030); course/courses race-token + reload đổi user (LM-031/032); completed một chiều hết thoái lui (LM-034); gating premium đồng nhất courseAccess.ts (LM-037); CompletionModal a11y (LM-039); StepTabs tablist + khóa (LM-040); Monaco skeleton + retry (LM-042); DiscussionPanel tích hợp (LM-045)
  - Tests: **lessonStepCodeLab.spec 6 + lessonApi.spec 9 + lessonStoreRace.spec 3 MỚI** (LM-017/018/046); CR-009/US-LN-027 hết pass giả (LM-002/003); gating full matrix (LM-047); hết `as never`/any (LM-054); fake timers sạch (LM-022/050)
- **Còn lại:** LM-058 DEFERRED — worker pool + per-testcase timeout (tái kiến trúc, kill-switch 1500ms backstop)
- **Bằng chứng:** frontend **3086/3086 PASS** (166 files, +28), `vue-tsc` 0 lỗi, backend **507/507**

## 19. 📖 Lesson Study / Course Modules — ✅ FIXED (42/42)

- **Scope:** `stores/classroomCurriculum.ts` + `views/teacher/TeacherClassroomCurriculumTab.vue` + `ModuleItemRow.vue` + 4 modal + `views/classroom/components/StudentCurriculumSidebar.vue` + `StudentClassroomView.vue` + CourseSidebar; backend `ClassroomCurriculumController.cs` + 14 command/query handler + ClassroomProgressService + UnlockRuleEngine
- **Batch review:** LS-001 → LS-042 (P0=5, P1=17, P2=12, P3=8) — Review Round 14, 3 góc nhìn, 2026-08-11
- **Đã fix nổi bật:**
  - **5 P0 chết tính năng đều đã hồi sinh**: prefix /api/v1 hết 404 CRUD (LS-001); Update/DeleteClassroomModuleItem endpoint mới (LS-002); **reorder hoạt động — 1 hệ HTML5 + keyboard 2 cấp** (LS-003/026); import-course route + URL đúng (LS-004); **ItemFormModal nạp danh sách thật** (LS-005)
  - Backend: positional args IsHidden đúng slot (LS-006); student query lọc hidden + chặn leak enrollment (LS-007); GroupBy hết 500 /my-progress (LS-008); **override nối 3 tầng — command 8 field + validate thuộc lớp + 2 query merge** (LS-009); UnlockRuleEngine không đếm item ẩn (LS-010); reorder atomic renumber + biên (LS-023); controller 403/404/400 thay 500 (LS-022); migration PrerequisiteItemId Guid + IsRequired (LS-024)
  - Frontend: defineProps classroomId (LS-011); sequential lock thật (LS-012); duplicateItem (LS-013); error banner + try/catch (LS-014); ConfirmModal (LS-015); isHidden đúng field (LS-016); sidebar drawer mobile + deep-link ?itemId (LS-029); CustomLesson badge (LS-030); premium lock icon (LS-031); prerequisite exclude self (LS-032); drag handle chỉ handle + depth counter (LS-033); saving thật (LS-041)
  - Tests: **classroomCurriculum.spec 14 + studentCurriculumSidebar 8 + studentClassroomView 4 + moduleItemRow 12 MỚI** (LS-017/018/019); teacherP2Tests hết pass giả (LS-020); student query handler 9 + controller 10 (LS-021/022); LN-001 nâng cấp 4 tab (LS-025)
- **Bằng chứng:** backend **552/552 PASS** (+45), frontend **3129/3129 PASS** (170 files, +43), `vue-tsc` 0 lỗi

## 20. 👨‍🏫 Teacher Panel — ✅ FIXED (46/47)

- **Scope:** `views/teacher/**` (TeacherPanelView + 8 tab + 12 modal + useTeacherApi/useQuizBuilder) · backend `TeacherController.cs`/`StatelessQuizController.cs` (manage)/`CodelabController.cs`/`UploadController.cs`
- **Batch review:** TC-001 → TC-047 (P0=5, P1=15, P2=24, P3=9) — Review Round 15, 3 góc nhìn, 2026-08-11
- **Đã fix nổi bật:**
  - **5 P0 hồi sinh**: QuizBuilderTab CRUD qua manage API (TC-001); **CodelabBuilderTab implement thật** (CodelabController full CRUD — TC-002/003/004); Analytics URL v1 hết 404 (TC-005)
  - Backend: **Quiz CreatedByTeacherId ownership + soft-delete giữ attempt history/XP ledger** (TC-021/022); CreateDraftLesson QuizId + ModuleItem Quiz (TC-011); analytics schema đúng (TC-012); teacherRequest… OrderIndex *1000 (TC-023); import course transaction + ownership (TC-025); search case-insensitive (TC-026); GetHistory role DB (TC-042)
  - Frontend: teacherRequest 401→refresh→retry + timeout (TC-013); upload ảnh hết 400 NO_FILE (TC-010); filter/search QuizBuilder thật (TC-007); saveQuestion (TC-008); error banner tách empty (TC-020); **KeepAlive tabs + useModalA11y chung** (TC-027/028); completionRate ×100 (TC-017); ConfirmModal danger (TC-018); preview thật (TC-029); unsaved warning (TC-030); option động 2-6 (TC-046); xóa CustomLessonCreator dead (TC-047)
  - Tests: **TeacherControllerTests 9 + teacherCourseTab 8 + quizBuilderTab + useQuizBuilder 8 + useTeacherApi 12 + teacherModals** (TC-034→040); teacher 68→123
- **Còn lại:** TC-041 PARTIAL — Student scope theo teacher (backend chưa có endpoint, TODO)
- **Bằng chứng:** backend **591/591 PASS** (+39), frontend **3184/3184 PASS** (175 files, +55), `vue-tsc` 0 lỗi

## 21. 🏫 Classrooms — ✅ FIXED (51/51)

- **Scope:** `views/classroom/**` (MyClassroomsView, StudentClassroomView, ClassroomItemPlayer, StudentCurriculumSidebar) · backend `ClassroomController.cs`/`ClassroomProgressController.cs`/`ClassroomGradingController.cs` + JoinClassroomDtoValidator + ProgressService/UnlockRuleEngine/GradingService
- **Batch review:** CR-001 → CR-051 (P0=2, P1=11, P2=18, P3=20) — Review Round 16, 3 góc nhìn, 2026-08-11
- **Đã fix nổi bật:**
  - **2 P0 hết**: validator đồng bộ generator — join hoạt động (CR-001); URL v1 hết 404 list+join (CR-002)
  - **Player hết gãy**: hasNext thật + footer đúng (CR-004), back wire (CR-005), CustomLesson render (CR-006), footer status thật (CR-023)
  - Backend: DTO lesson đủ content (CR-003); **kick = ban rejoin + curriculum filter Active** (CR-014/015); unlock-status/MyProgress check Active → 403 nhất quán (CR-016/017/036); **N+1 engine hết — 400→2 query** (CR-018); analytics theo ClassroomModuleItems + required 2 vế (CR-019); **score server-side không tin client** (CR-020); **tính năng Rời lớp mới** (CR-026); {message} chuẩn (CR-032); invite expiry 30 ngày (CR-034); attempt mới nhất (CR-039); Role DTO (CR-042)
  - Frontend: complete refresh + error state 403/404/network (CR-007/008); trackItemProgress thật (scroll debounce + heartbeat) (CR-021); progressSummary render (CR-022); join validate 6 ký tự (CR-024); leave UX (CR-026); mobile drawer 1 scroll (CR-027); analytics responsive + % đồng bộ (CR-028/029); deep-link trackItemStart (CR-037); watch auth (CR-038); modal a11y (CR-044); tooltip khóa (CR-051)
  - Tests: **myClassroomsView.spec 11 + classroomItemPlayer.spec 13 MỚI** (CR-010/011); controller tests 35 + grading 9 + validator 9 (CR-012/013/001t); complete flow + whitelist mock (CR-009/030/031)
- **Bằng chứng:** backend **665/665 PASS** (+74), frontend **3221/3221 PASS** (177 files, +37), `vue-tsc` 0 lỗi. **PHASE 3 HOÀN TẤT (Courses + Lesson Study + Teacher + Classrooms).**

## 22. 🏆 Gamification — ✅ FIXED (46/46)

- **Scope:** `features/gamification-engine/**` + `services/gamificationApi.ts`/`leaderboardApi.ts` + `useConfetti.ts` · backend `Gamification/StatelessGamification/Badges/LeaderboardController` + `GamificationStrategy/LeaderboardService/LeaderboardHub` + `UsersController` (xp)
- **Batch review:** GM-001 → GM-046 (P0=3, P1=9, P2=22, P3=12) — Review Round 17, 3 góc nhìn, 2026-08-11
- **Đã fix nổi bật:**
  - **XP hết farm**: Idempotency-Key + cap 500 XP/ngày + rate limit cả 2 endpoint (GM-001/005); award + badge 1 transaction + ledger replay (GM-004)
  - **Online-sync hoạt động**: URL/DTO đúng (GM-002/003); **badge 1 nguồn id backend 8 badge + danh sách đầy đủ mở+khóa** (GM-009); **streak server source of truth + lastActiveDate thật** (GM-008/014/029)
  - **Leaderboard real-time thật**: LeaderboardBroadcastBroker publish sau commit + hub [Authorize] (GM-006); bỏ mock 10 tên giả (GM-010); highlight theo userId (GM-020); reload sau award (GM-021)
  - **Badge grant race hết** — root cause EF Id=Guid.NewGuid() → UPDATE 0 row (GM-007); strategy state riêng theo user DB-first (GM-011); Criteria parse thật (GM-045); level table 1 nguồn (GM-019)
  - UX: freeze đúng 1 ngày (GM-018), confetti reduced-motion (GM-022), freeze từ profile + toast (GM-023), nút +50 XP chỉ Teacher/Admin (GM-024), tooltip badge (GM-025), aria-live + font (GM-028), responsive (GM-026)
  - Tests: **3 API contract spec 17 test + confetti overlay 4 + TZ matrix + freeze store** (GM-030→034); backend +43 (GM-046)
- **Bằng chứng:** backend **708/708 PASS** (+43), frontend **3269/3269 PASS** (181 files, +48), `vue-tsc` 0 lỗi

## 23. 👤 User Profile — ✅ FIXED (37/37)

- **Scope:** `views/profile/**` (ProfileView + 6 tabs) + `useAuthStore` (loadStatelessProfile) + `services/quizApi.ts` · backend `UsersController.cs`/`StatelessAuthController.cs` (UpdateProfile)/`StatelessQuizController.cs` (history)/`StatelessAuthStrategy.cs`
- **Batch review:** PR-001 → PR-037 (P1=9, P2=14, P3=14) — Review Round 18, 3 góc nhìn, 2026-08-11
- **Đã fix nổi bật:**
  - **UpdateProfile persist DB** (PR-001) — hết mất dữ liệu sau restart; **bank quiz ghi QuizAttempt — history đầy đủ** (PR-002); trùng username check DB + validate 3-100 (PR-015)
  - **Avatar upload hoạt động end-to-end** (PR-005); **Preferences nối thật dsa_preferences** (PR-012); modal/tabs a11y chuẩn useModalA11y (PR-003/004/019); **lastActiveDate server source of truth 2 đầu** (PR-009)
  - History dùng fetchQuizHistory + error state tách empty (PR-011/014); level từ server config (PR-026); clamp XP (PR-016); inline username error (PR-017); switch role (PR-018); form dirty (PR-033); version env (PR-034)
  - Tests: **profileViewP1Tests 7 + profileSecurityTabTests 6 + userProgressApi 8 MỚI** (PR-007/008/009t); PF-007 hết pass giả (PR-006)
- **Bằng chứng:** backend **720/720 PASS** (+12), frontend **3298/3298 PASS** (184 files, +29), `vue-tsc` 0 lỗi

## 24. 🔗 Embed Widget — ✅ FIXED (33/33)

- **Scope:** `features/embed-widget/**` (bridge/checker/resizer/store/4 components) + `views/embed/EmbedWidgetView.vue` + SortingView/GraphView (route.query consume)
- **Batch review:** EW-001 → EW-033 (P0=3, P1=7, P2=13, P3=10) — Review Round 19, 3 góc nhìn, 2026-08-11
- **Đã fix nổi bật:**
  - **3 P0 hết**: engine wire thật — WIDGET_READY/STEP_FORWARD/BACKWARD/RESET/HEIGHT_CHANGED hoạt động (EW-002); **targetOrigin hướng host** — auto-height cross-origin sống (EW-001); **query params theme/vcr/watch/interactive/algo được widget tiêu thụ** (EW-003)
  - Bảo mật: **bridge fail-closed ([] → self)** + shape validate (EW-006/012); 1 nguồn allowlist qua checker + wildcard khớp cả base lẫn subdomain (EW-013); origin edge test (EW-019)
  - UX: **preview iframe thật** + loading/error + VCR thật postMessage (EW-004/015); premium dijkstra badge + overlay (EW-016); host script data-embed-widget + event.source (EW-017); responsive (EW-018); error-boundary (EW-014); hint tự sinh (EW-011)
  - Tests: **embedComponents 24 + embedWidgetView 11 MỚI** (EW-010/003t/002t); resizer pipeline 8 test RO-fire (EW-008t); origin edge 7 (EW-019)
- **Bằng chứng:** frontend **3363/3363 PASS** (186 files, +65), `vue-tsc` 0 lỗi, backend 720/720 (không đụng)

## 25. 📤 Export & Share — ✅ FIXED (29/30)

- **Scope:** `features/export-share/**` (SVGToCanvasExporter, WorkspaceStateCompressor, useExportShareStore, ShareExportModal, QRCodeDisplay, ExportFormatSelector, ExportProgressBar, ExportShareWorkspace) + `views/export-share/ExportShareView.vue` + `router/routes.ts` (/s/)
- **Batch review:** EX-001 → EX-030 (P1=7, P2=14, P3=9) — Review Round 20, 3 góc nhìn, 2026-08-11
- **Đã fix nổi bật:**
  - **QR vẽ đúng** (flush post + onMounted + try/catch) (EX-001/003); **route /s + ShareRestoreView — roundtrip export→restore thật** (EX-002); **limit 2500 khớp dung lượng QR** (EX-003)
  - **PNG settle thật** (onload try/catch reject) + **progress thật [30,50,75,90]** (EX-005/025); **payload encodeURIComponent hết +→space** (EX-013); **revoke defer setTimeout** (EX-014)
  - cssRules lọc theo scope workspace (EX-008); font fallback khớp preview (EX-009); **workspace wire thật + snapshot tại click** (EX-010); exportError/linkError feedback (EX-004); downloadSVG isExporting + try/catch (EX-012); modal a11y chuẩn (EX-006); copy fallback execCommand (EX-017); responsive (EX-016); progressbar/QR aria (EX-015)
  - Tests: **shareExportModal 8 + qrCodeDisplay 4 + shareRestoreView 10 + roundtrip unicode MỚI** (EX-007); PNG success-path 5 (EX-005t); SVG gradient/clipPath/foreignObject 5 (EX-021); **tách 51 test SignalR/Payment sang spec đúng feature** (EX-029)
- **Còn lại:** EX-023 PARTIAL — dead types giữ do barrel index.ts re-export
- **Bằng chứng:** frontend **3398/3398 PASS** (192 files, +35), `vue-tsc` 0 lỗi, backend 720/720 (không đụng)

## 26. 🔔 Notifications — ✅ FIXED (29/29)

- **Scope:** `features/notifications/**` (NotificationBell, useNotificationStore, notificationApi) + `features/realtime/stores/useSignalRStore.ts` · backend `NotificationsController.cs`/`NotificationService.cs`/`NotificationHub.cs` + Program.cs (DI)
- **Batch review:** NT-001 → NT-029 (P0=1, P1=6, P2=14, P3=8) — Review Round 21, 3 góc nhìn, 2026-08-11
- **Đã fix nổi bật:**
  - **URL đúng hết 404** (NT-001); **realtime thật**: INotificationService DI + NotificationBroadcastBroker + hub push Clients.User + comment reply qua service (NT-002); **hub hết spoof — xóa method client-invokable, không bao giờ Clients.All** (NT-003)
  - **401 auto-refresh retry + reset khi refresh fail** (NT-008); **unread-count endpoint + totalUnread trong list — badge đúng >100** (NT-011); MarkAllAsRead ExecuteUpdate atomic (NT-010); NotifyAdmins batch + role const + 1 admin fail không fail cả batch (NT-016); controller → service layer (NT-026)
  - FE: **connectNotifications sau login + handlers BadgeAwarded/LevelUp/NewNotification → prepend + toast + dedupe** (NT-002); **polling 60s backup** (NT-009); **store reset đổi user** (NT-004); item button keyboard (NT-005); Esc + focus trap + aria đầy đủ (NT-013/014); spinner loading (NT-012); mobile dropdown (NT-015); mark-all guard (NT-023); formatTime validate (NT-024); sort + merge/diff theo id (NT-025); 401 timeout (NT-022); reduced-motion (NT-028)
  - Tests: **NotificationsControllerTests 14 + ServiceTests 14 + HubTests 6** (NT-007); bell hết pass giả + coverage đầy đủ (NT-006/019); race guard (NT-018); formatTime 7 biên (NT-024t)
- **Bằng chứng:** backend **754/754 PASS** (+34), frontend **3423/3423 PASS** (192 files, +25), `vue-tsc` 0 lỗi
- **TODO:** nối NotifyBadgeAwarded/NotifyLevelUp tại GamificationService/UsersController sau commit (call sites ngoài scope)

## 27. 🧱 Core & UI Components — ✅ FIXED (38/38) — ROUND CUỐI CÙNG

- **Scope:** `shared/**` (apiClient, useThemeStore, BaseIcon, markdown, Theory*) + `composables/**` (useToast, useModalA11y, useConfetti) + `components/**` (AppHeader, ToastContainer, Skeleton*, ConfirmModal, SortableContextWrapper, CustomMarkdownEditor, SvgIcon)
- **Batch review:** CU-001 → CU-038 (P0=1, P1=9, P2=18, P3=10) — Review Round 22, 3 góc nhìn, 2026-08-11
- **Đã fix nổi bật:**
  - **XSS markdown hết** — escape-first + whitelist http/https/mailto (CU-001); shared markdown cũng thêm "'" + rel noopener
  - **A11y chuẩn hóa**: ConfirmModal TC-028 (CU-002), useModalA11y immediate + stack modal đúng (CU-003), AppHeader hamburger mobile + dropdown keyboard (CU-004/005), accordion button (CU-006), user-badge (CU-019), collapsible aria (CU-022), editor toolbar aria (CU-023)
  - **Hết leak/rò rỉ**: toast timer Map + cap (CU-013), confetti per-instance + cancel (CU-016), theme hết FOUC + try/catch (CU-014), editor fullscreen cleanup (CU-030)
  - **Hợp nhất**: 1 nguồn apiClient + timeout + content-type (CU-011/012), BaseIcon = nguồn path + SvgIcon alias (CU-029), SortableContextWrapper xóa (CU-017)
  - Tests: **useModalA11y 7 + markdown 10 + theme 11 + appHeader 10 + toast 12 + skeleton 7 + apiClient 9 MỚI** (CU-008→010/024→027/038)
- **Bằng chứng:** frontend **3474/3474 PASS** (197 files, +51), `vue-tsc` 0 lỗi, backend 754/754. **HOÀN TẤT TOÀN BỘ 16/16 TÍNH NĂNG — MỌI ROUND REVIEW ĐÃ ĐÓNG.**

---

## 🗓️ Lịch Sử Cập Nhật

| Ngày | Nội dung |
| :-- | :-- |
| 2026-08-11 | Khởi tạo file từ `DATN_ERRORS.md`: 7 feature review FULL + 4 feature PARTIAL; đóng CC-011 (type cleanup 148→0); ghi nhận các mục mở còn lại (PS-007, PS-038, QZ-048, QZ-007, DC-021, CC-012) |
| 2026-08-11 | **Auth ✅ hoàn tất DoD** — review 55 lỗi (4 sub-agent) + fix 54/55 (4 sub-agent song song): backend 416/416 (+44), frontend 2826/2826 (+36), vue-tsc 0. Thêm mục 12. Xóa khỏi UNREVIEW.md |
| 2026-08-11 | **Payment ✅ hoàn tất DoD** — review 65 lỗi (4 sub-agent) + fix 64/65 (4 sub-agent song song): backend 472/472 (+56), frontend 2846/2846 (+20), vue-tsc 0. PM-053 DEFERRED. Thêm mục 13. Xóa khỏi UNREVIEW.md |
| 2026-08-11 | **Admin ✅ hoàn tất DoD** — review 60 lỗi (4 sub-agent) + fix 58/60 (4 sub-agent; core chạy lại lần 2): backend 507/507 (+35), frontend 2866/2866 (+20), vue-tsc 0. AD-024/044 PARTIAL. Thêm mục 14. **Phase 1 (Auth+Payment+Admin) HOÀN TẤT 3/16** |
| 2026-08-11 | **HTML Playground ✅ hoàn tất DoD** — review 33 lỗi (3 sub-agent) + fix 33/33 (3 sub-agent): frontend 2911/2911 (+45), vue-tsc 0, backend 507/507. Thêm mục 15. **4/16 DONE** |
| 2026-08-11 | **Algo Playground + Custom Input ✅ hoàn tất DoD** — review 49 lỗi (3 sub-agent) + fix 48/49 (3 sub-agent): frontend 2942/2942 (+31), vue-tsc 0, backend 507/507. AL-042 PARTIAL. Thêm mục 16. **5/16 DONE** |
| 2026-08-11 | **Sorting Visualizer ✅ hoàn tất DoD** — review 44 lỗi (3 sub-agent) + fix 44/44 (3 sub-agent): frontend 3058/3058 (+116, sorting 99→215), vue-tsc 0, backend 507/507. **CC-009 phủ 7 engine**. Thêm mục 17. **6/16 DONE — PHASE 2 HOÀN TẤT** |
| 2026-08-11 | **Courses & Lessons LMS ✅ hoàn tất DoD** — review 71 lỗi (3 sub-agent) + fix 70/71 (3 sub-agent): frontend 3086/3086 (+28), vue-tsc 0, backend 507/507. XP server-side + codelab sandbox chặn mạng. LM-058 DEFERRED. Thêm mục 18. **7/16 DONE** |
| 2026-08-11 | **Lesson Study / Course Modules ✅ hoàn tất DoD** — review 42 lỗi (3 sub-agent) + fix 42/42 (3 sub-agent): backend 552/552 (+45), frontend 3129/3129 (+43), vue-tsc 0. **5 P0 chết tính năng hồi sinh** (URL 404, endpoint thiếu, reorder, import-course, ItemFormModal). Thêm mục 19. **8/16 DONE** |
| 2026-08-11 | **Teacher Panel ✅ hoàn tất DoD** — review 47 lỗi (3 sub-agent) + fix 46/47 (3 sub-agent): backend 591/591 (+39), frontend 3184/3184 (+55), vue-tsc 0. QuizBuilder + CodelabBuilder hoạt động thật; quiz ownership + soft-delete. TC-041 PARTIAL. Thêm mục 20. **9/16 DONE** |
| 2026-08-11 | **Classrooms ✅ hoàn tất DoD — PHASE 3 HOÀN TẤT** — review 51 lỗi (3 sub-agent) + fix 51/51 (3 sub-agent): backend 665/665 (+74), frontend 3221/3221 (+37), vue-tsc 0. Join/leave/player hoạt động; kick = ban; score server-side; N+1 engine hết. Thêm mục 21. **10/16 DONE** |
| 2026-08-11 | **Gamification ✅ hoàn tất DoD** — review 46 lỗi (3 sub-agent) + fix 46/46 (3 sub-agent): backend 708/708 (+43), frontend 3269/3269 (+48), vue-tsc 0. XP idempotent + cap; badge 1 nguồn id; streak server source of truth; leaderboard real-time. Thêm mục 22. **11/16 DONE** |
| 2026-08-11 | **User Profile ✅ hoàn tất DoD** — review 37 lỗi (3 sub-agent) + fix 37/37 (3 sub-agent): backend 720/720 (+12), frontend 3298/3298 (+29), vue-tsc 0. UpdateProfile persist; bank quiz attempt; avatar upload; preferences thật. Thêm mục 23. **12/16 DONE** |
| 2026-08-11 | **Embed Widget ✅ hoàn tất DoD** — review 33 lỗi (3 sub-agent) + fix 33/33 (3 sub-agent): frontend 3363/3363 (+65), vue-tsc 0, backend 720/720. Engine wire thật; targetOrigin host; query consumed; preview iframe thật. Thêm mục 24. **13/16 DONE** |
| 2026-08-11 | **Export & Share ✅ hoàn tất DoD** — review 30 lỗi (3 sub-agent) + fix 29/30 (3 sub-agent): frontend 3398/3398 (+35), vue-tsc 0, backend 720/720. QR vẽ đúng; route /s roundtrip; limit 2500; payload encode. EX-023 PARTIAL. Thêm mục 25. **14/16 DONE** |
| 2026-08-11 | **Notifications ✅ hoàn tất DoD** — review 29 lỗi (3 sub-agent) + fix 29/29 (3 sub-agent): backend 754/754 (+34), frontend 3423/3423 (+25), vue-tsc 0. URL đúng; realtime broker; hub hết spoof; 401 retry; unread-count. Thêm mục 26. **15/16 DONE** |
| 2026-08-11 | **Core & UI Components ✅ hoàn tất DoD — ROUND CUỐI, HOÀN TẤT 16/16** — review 38 lỗi (3 sub-agent) + fix 38/38 (3 sub-agent): frontend 3474/3474 (+51), vue-tsc 0, backend 754/754. XSS markdown hết; a11y chuẩn; theme hết FOUC; timer leak hết; 1 nguồn apiClient. Thêm mục 27. **16/16 DONE — CHIẾN DỊCH REVIEW HOÀN TẤT** |
