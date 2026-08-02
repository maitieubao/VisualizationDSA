# 📈 Báo Cáo Tiến Độ Dự Án - Development Progress Tracking Log

Tài liệu này theo dõi chi tiết tiến độ hoàn thành **code thực tế** (không phải tài liệu thiết kế) của dự án **VisualizationDSA**.

> ⚠️ **Lưu ý quan trọng:** Bảng này phản ánh trạng thái **code đã được viết và chạy được**, không phải tài liệu đặc tả. Mọi Sprint từ 4 trở về trước cần kiểm tra lại từng file `.ts` / `.vue` thực tế trong `frontend/src/`.

---

## 1. Trạng Thái Tổng Thể (Overall Project Health)

| Hạng mục                        | Giá trị thực tế                                                    |
| :------------------------------ | :----------------------------------------------------------------- |
| **Tổng số Sprints kế hoạch**    | 12 Sprints                                                         |
| **Tài liệu thiết kế**           | 12/12 Sprints (100% — chỉ là spec, chưa phải code)                 |
| **Sprint đã hoàn thành CODE**   | 12 / 12                                                            |
| **Sprint đang triển khai CODE** | Hoàn tất! 🎉                                                       |
| **Backend .NET C#**             | 100% — Clean Architecture + BCrypt Auth + Serilog + RateLimiting + IMemoryCache + Pagination + SignalR Real-time |
| **Tổng file thực tế**           | ~120 files (87 frontend + 35 backend `.cs`)                        |
| **Unit tests**                  | 1549 frontend + 212 backend C# — ✅ 100% PASS                      |

---

## 2. Nhật Ký Tiến Độ Theo Sprint — Trạng Thái CODE Thực Tế

| Sprint        | Nội dung trọng tâm                                  | Trạng thái CODE | Chi tiết                                                                                                                                                                              |
| :------------ | :-------------------------------------------------- | :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --- |
| **Sprint 1**  | Động cơ Core Animation rAF & AST Compiler           | ✅ DONE         | `CoreAnimationEngine.ts`, `CompilerStepExecutor.ts` — 11 unit tests pass                                                                                                              |
| **Sprint 2**  | Sắp xếp mảng động (Bubble, Quick, Merge, Heap, Radix, Counting, Bucket Sort) | ✅ DONE         | 7 frame generators, ArrayBarVisualizer.vue, VcrControlPanel.vue, useVcrStore.ts, Counting/Bucket custom UI renderers, Lerp colors. Cải tiến Counting Sort & Bucket Sort cao cấp với giao diện 3 tầng, stable ID, SVG Bezier connector động. |
| **Sprint 3**  | Đồng bộ dòng lệnh mã giả Monaco Editor              | ✅ DONE         | Monaco Editor thật `@monaco-editor/loader`, `MonacoGutterClickInterceptor` click-to-snap, `PseudocodeSyncer` highlight dòng, `ArrayBarVisualizer` Double Buffering                    |
| **Sprint 4**  | Bài giảng Slide & Câu hỏi Trắc nghiệm Canvas        | ✅ CODE DONE    | `InteractiveLectureSlides.vue` đã mount trong `App.vue` (right column), `syncSlideWithVisualizer` kết nối `vcrStore.jumpToFrame()`, Quiz data hardcoded trong component, 3 tests pass |
| **Sprint 5**  | Sân chơi vẽ đồ thị tự do & Trợ lý Xây dựng Đồ thị (Graph Builder Assistant) | ✅ CODE DONE    | Thiết kế lại UI/UX: Mode Bar dạng top pill, gộp toolbar trái, local BFS/DFS/Dijkstra simulator. Nâng cấp panel phải thành Graph Builder Assistant: bỏ hoàn toàn Array Input, tách tab Build/Import, form thêm cạnh có cấu trúc, đồng bộ hover highlight 2 chiều phát sáng, sinh đồ thị ngẫu nhiên và xóa sạch. 35 tests pass. |
| **Sprint 6**  | OOP Sandbox, đóng gói & VTable đa hình              | ✅ CODE DONE    | `OOPReflectionEngine` + `OOPSandbox.vue` mounted, Encapsulation locks (red/yellow/green), VTable dispatch visualization, Heap allocator UI                                            |     |
| **Sprint 7**  | Chỉ số kết dính SRP LCOM4 DFS & LSP vỡ kính         | ✅ CODE DONE    | `SOLIDLCOM4Calculator` + `LspGlassCracker` + `SOLIDSandbox.vue` mounted, cracked glass animation, cohesion analyzer                                                                   |
| **Sprint 8**  | IoC Container Singleton/Transient & Vòng lặp        | ✅ CODE DONE    | `DIContainerEngine` với DFS cycle detection, `DISandbox.vue` mounted, Transient/Singleton visualization, dependency graph Bezier                                                      |
| **Sprint 9**  | Mẫu thiết kế Observer Strategy Neon Bezier          | ✅ CODE DONE    | `PatternEngine` + `PatternSandbox.vue` mounted, Observer notification flow, Strategy switcher, Factory product creation                                                               |
| **Sprint 10** | Giám sát Call Stack 3D Stack-to-Heap Bezier         | ✅ CODE DONE    | `CallStackEngine` + `DSLEngine` + `StateInspector.vue` mounted, 3D stack-heap visualization, DSL compiler                                                                             |
| **Sprint 11** | Cân bằng tải Server bốc khói & DB Replication lag   | ✅ CODE DONE    | `LoadBalancerEngine` + `SystemSandbox.vue` mounted, Round-robin LB, smoke particles, DB replication lag                                                                               |
| **Sprint 12** | Tích lũy XP & Trình sinh mã nhúng Iframe nhúng      | ✅ CODE DONE    | `XPEngine` + `GamificationPanel.vue` mounted, Level progression, badges, embed widget generator                                                                                       |

### Codelab Practice — CRUD Backend + Real Judge (Piston) ✅

| Hạng mục | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **CRUD API** | `/api/v1/codelabs` (GET list filter+page, GET {id}, POST/PUT/DELETE, CRUD testcases/templates/hints) | ✅ CODE DONE | `CodelabController.cs` + `CodelabCrudCommandHandlerTests.cs` (8 tests). Ghi bị chặn bởi `[Authorize(Roles="Teacher,Admin")]` |
| **Judge thật** | `PistonCodeJudgeService` thay thế `MockCodeJudgeService` | ✅ CODE DONE | `PistonCodeJudgeServiceTests.cs` (11 tests) — Accepted/WA/CE/TLE/MLE/RE/JudgeUnavailable, normalize output, semaphore 3, cache runtime 1h, section `Judge` trong appsettings |
| **Reveal Hint** | `POST /api/codelabs/{id}/reveal-hint` trừ XP qua `User.DeductXP` | ✅ CODE DONE | `RevealHintCommand.cs` + 2 tests (success / insufficient XP). E2E: trừ 5 XP, còn 145 |
| **Model** | `CodelabHint` entity (thay `Hints` string), `SubmissionStatus.JudgeUnavailable=7` | ✅ CODE DONE | Migration `20260801073413_Sprint4_CodelabHintsAndJudge` đã áp dụng vào `visualization_dsa.db` |
| **JWT fix** | `[Authorize(Roles)]` trả 403 sai do MapInboundClaims | ✅ CODE DONE | `RoleClaimType=ClaimTypes.Role`, `NameClaimType=ClaimTypes.NameIdentifier` (Program.cs) — xem ADR-22 |
| **Tests** | 40/40 backend tests PASS + E2E HTTP smoke (create/get/update/delete/reveal-hint/submit) | ✅ CODE DONE | `dotnet test` green; submit map đúng JudgeUnavailable khi Piston public trả 401 (whitelist-only 15/02/2026) |
| **Còn lại (P1)** | Nối `CodelabBuilderTab.vue` (bỏ `crudNotImplemented`), thêm `revealHint` vào `codelabApi.ts`, xóa `LessonStepCodeLab.vue` demo, self-host Piston | 🟡 IN PROGRESS | Backend xong 100%, frontend wiring chưa bắt đầu |

### Phase 2 Interactive Embed Widget — Tiện ích Nhúng Sơ đồ Trực quan

| Bước | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Types** | EmbedMessage, EmbedTheme, EmbedConfig interfaces | ✅ CODE DONE | `embed-widget/types/embed-widget.types.ts` — EmbedMessage, EmbedMessageAction, EmbedTheme, EMBED_ALGORITHM_OPTIONS |
| **Engine** | EmbedCommunicationBridge — postMessage 2-way bridge | ✅ CODE DONE | `EmbedCommunicationBridge.ts` — origin whitelist filtering, XSS prevention, listener lifecycle |
| **Engine** | SecureOriginChecker — Domain whitelist validator | ✅ CODE DONE | `SecureOriginChecker.ts` — configurable whitelist, wildcard mode, add/remove/clear |
| **Engine** | AutoHeightResizer — ResizeObserver dynamic height | ✅ CODE DONE | `AutoHeightResizer.ts` — debounce 100ms, height clamping 300-1200px, GC-safe destroy |
| **Store** | useEmbedConfiguratorStore — Pinia Setup Store | ✅ CODE DONE | `useEmbedConfiguratorStore.ts` — theme/algo/dimensions, live iframe code generation, Clipboard API |
| **UI** | EmbedConfiguratorSidebar — Glassmorphism settings | ✅ CODE DONE | `EmbedConfiguratorSidebar.vue` — theme buttons, algo select, range sliders, toggle switches |
| **UI** | LiveWidgetPreview — Scaled live preview | ✅ CODE DONE | `LiveWidgetPreview.vue` — scaled rendering, 3 theme variants, simulated bars/VCR/watch |
| **UI** | EmbedCodeSnippet — Neon code box + Copy | ✅ CODE DONE | `EmbedCodeSnippet.vue` — Neon Cyan border, Copy→Copied Emerald transition, host integration script |
| **UI** | EmbedWidgetWorkspace — Orchestrator | ✅ CODE DONE | `EmbedWidgetWorkspace.vue` — sidebar + preview + code snippet composition |
| **Infra** | Vite manualChunks Monaco isolation | ✅ CODE DONE | `vite.config.ts` — monaco-vendor chunk separation |
| **Integration** | App.vue "Embed" tab | ✅ CODE DONE | `App.vue` — new "Embed" tab routing to EmbedWidgetWorkspace |
| **Tests** | 76 Unit Tests | ✅ CODE DONE | `EmbedCommunicationBridge.spec.ts` (17), `SecureOriginChecker.spec.ts` (14), `AutoHeightResizer.spec.ts` (10), `useEmbedConfiguratorStore.spec.ts` (35) — ALL PASS |

### Phase 1 Animation Engine — Backend-Driven State Capture

| Bước | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Step 1** | JSON Protocol & DTOs (C# Backend + TS Frontend) | ✅ CODE DONE | `Domain/Engine/HighlightIndices.cs`, `FrameDTO.cs`, `AlgorithmResult.cs`, `AlgorithmBase.cs`; TS interfaces `animation.types.ts` |
| **Step 2** | Pinia Store useAnimationStore + Dummy Engine | ✅ CODE DONE | `useAnimationStore.ts` (play/pause/step/scrub/speed/FSM), `algorithmApi.ts` (dummy BubbleSort generator), `ExplanationPanel.vue`, `AnimControlPanel.vue` |
| **Step 3** | Canvas Rendering Layer + PseudoCode Sync | ✅ CODE DONE | `CanvasLayer.vue` (coordinate calc, color palette, Lerp EaseOut, ResizeObserver), `AnimPseudoCodePanel.vue` (activeLine highlight) |
| **Step 4** | Backend API + E2E Integration | ✅ CODE DONE | `BubbleSortExecutor.cs`, `AlgorithmsController.cs` (POST /api/v1/algorithms/execute), Brotli/Gzip compression, `VisualizationPlayer.vue` orchestrator |

### Phase 1 Custom Input Generator — Zero Trust Input Pipeline

| Bước | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Step 1** | UI Form & Local Validation | ✅ CODE DONE | `CustomInputForm.vue` (TextArea, Regex validation, smart generation dropdown, visual feedback), `useInputStore.ts` (Pinia store, parsedArray, canExecute computed) |
| **Step 2** | Backend Defense & Parsing Pipeline | ✅ CODE DONE | `InputParser.cs` (Regex + int[] parsing), `ConstraintResolver.cs` (per-algorithm safety limits), `CustomInputRequestDto.cs`, `POST /api/v1/algorithms/custom-execute` with CancellationToken 2s timeout |
| **Step 3** | Integration & Pinia Store Setup | ✅ CODE DONE | `useInputStore.submitCustomInput()` → API call → fallback dummy → `animationStore.loadResult()`, loading overlay on Canvas, keyboard shortcuts (Ctrl+Enter, Ctrl+Shift+R, Esc) |

### Phase 1 DSA Modules Library — Strategy Pattern + Reflection DI

| Bước | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Backend** | IAlgorithmStrategy + Reflection DI Auto-Registration | ✅ CODE DONE | `IAlgorithmStrategy.cs`, `AlgorithmStrategyBase.cs`, `AlgorithmMetadata.cs`, `TreeNodeDTO.cs`, `AlgorithmDIConfiguration.cs` (Reflection scan), updated `Program.cs` |
| **Backend** | 10 Algorithm Strategies | ✅ CODE DONE | `BFSStrategy.cs`, `DFSStrategy.cs`, `DijkstraStrategy.cs`, `SlidingWindowStrategy.cs`, `MonotonicStackStrategy.cs`, `LinearSearchStrategy.cs`, `BinarySearchStrategy.cs`, `StackStrategy.cs`, `QueueStrategy.cs`, `BSTStrategy.cs` |
| **Backend** | Controller Refactor + New Endpoints | ✅ CODE DONE | `AlgorithmsController.cs` refactored: `GET /algorithms`, `GET /{id}/metadata`, `POST /execute` + `POST /custom-execute` using DI `IEnumerable<IAlgorithmStrategy>` |
| **Frontend** | useAlgorithmStore + Catalog + API | ✅ CODE DONE | `useAlgorithmStore.ts`, `algorithmCatalog.ts` (10 algos), `dsaApi.ts`, `dummyGenerators.ts` (10 fallback generators), `premiumGenerators.ts` (5 premium simulators) |
| **Frontend** | 4 Canvas Renderers + Dynamic Visualizer | ✅ CODE DONE | `BarChartRenderer.vue`, `BoxArrayRenderer.vue`, `TreeRenderer.vue`, `TubeRenderer.vue`, `AlgorithmVisualizer.vue`. Cải tiến `BoxArrayRenderer` (Binary Search) cao cấp với range co-brackets, MID zoom 1.15x, decision bubble, và thay thế emojis bằng các vector path vẽ tay (bullseye target, checkmark, cross mark) cực kỳ tinh tế. |
| **Frontend** | DSAPlayer + Dashboard + App Integration | ✅ CODE DONE | `DSAPlayer.vue`, `AlgorithmDashboard.vue`, "DSA Modules" tab in `App.vue` |
| **Tests** | 38 Unit Tests | ✅ CODE DONE | `useAlgorithmStore.spec.ts` (10), `dummyGenerators.spec.ts` (18), `dsaApi.spec.ts` (3), `algorithmCatalog.spec.ts` (7) — ALL PASS |

### Phase 1 E-Lecture Mode — Chế độ Bài giảng Điện tử (Script-driven Architecture)

| Bước | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Types** | TypeScript Interfaces (Lecture, Slide, SlideAction) | ✅ CODE DONE | `e-lecture/types/lecture.types.ts` — SlideCommand, SlideType, Slide, LectureScript, LectureErrorResponse |
| **JSON Script** | Kịch bản bài giảng mẫu Bubble Sort | ✅ CODE DONE | `e-lecture/assets/lectures/bubble-sort-intro.json` — 5 slides (theory, guided-animation, interactive-check) |
| **Frontend** | useLectureStore Pinia Store | ✅ CODE DONE | `e-lecture/store/useLectureStore.ts` — startLecture, nextSlide, prevSlide, goToSlide, exitLecture, PLAY_UNTIL sync, isMinimized |
| **Frontend** | LectureOverlay.vue (Glassmorphism UI) | ✅ CODE DONE | `e-lecture/components/LectureOverlay.vue` — glassmorphism panel, dimmed backdrop 40%, auto-minimize (opacity 0.15) khi Canvas chạy, pagination dots, Next/Back/Exit, keyboard shortcuts (Arrow keys, Esc) |
| **Frontend** | Extend useAnimationStore | ✅ CODE DONE | Added `playUntilFrame()`, `goToFrame()`, `cancelPlayUntil()`, `setInteractionLocked()`, `interactionLocked` state |
| **Frontend** | VisualizationPlayer Integration | ✅ CODE DONE | E-Lecture button + LectureOverlay overlay trong `VisualizationPlayer.vue`, AnimControlPanel respects `interactionLocked` |
| **Frontend** | Lecture Loader Service | ✅ CODE DONE | `e-lecture/services/lectureLoader.ts` — bundled JSON + API fallback, `hasLecture()`, `getAvailableLectureIds()` |
| **Backend** | C# Lecture Models | ✅ CODE DONE | `Domain/Lectures/Lecture.cs` (Lecture, Slide, SlideAction), `LectureRepository.cs` (in-memory seed data) |
| **Backend** | LecturesController API | ✅ CODE DONE | `WebApi/Controllers/LecturesController.cs` — `GET /api/v1/lectures`, `GET /api/v1/lectures/{algorithmId}`, Cache-Control 7 days |
| **Tests** | 28 Unit Tests | ✅ CODE DONE | `useLectureStore.spec.ts` (13), `lectureLoader.spec.ts` (7), `animationStoreExtensions.spec.ts` (8) — ALL PASS |

### Phase 1 Execution Control — VCR Control Panel Nâng cấp

| Bước | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Composables** | useSpeedPreferences (localStorage persistence) | ✅ CODE DONE | `composables/useSpeedPreferences.ts` — SPEED_PRESETS [0.25, 0.5, 1.0, 2.0, 4.0], DSA_PREFERENCES_KEY, loadSpeed/saveSpeed/initSpeedFromStorage |
| **Composables** | useThrottledScrub (30 FPS throttle) | ✅ CODE DONE | `composables/useThrottledScrub.ts` — startScrub/updateScrubPosition/endScrub, isScrubbing ref, 33ms throttle |
| **Composables** | usePlaybackHotkeys (Global keyboard shortcuts) | ✅ CODE DONE | `composables/usePlaybackHotkeys.ts` — Space (play/pause/replay), Arrow keys (step), Shift+Arrow (start/end), input focus guard, interactionLocked guard |
| **Composables** | useSliderTooltip (Dynamic hover tooltip) | ✅ CODE DONE | `composables/useSliderTooltip.ts` — handleSliderHover, hideTooltip, truncateText, TooltipState interface |
| **Store** | togglePlay action added | ✅ CODE DONE | `useAnimationStore.ts` — togglePlay() play/pause toggle action |
| **Component** | AnimControlPanel.vue rewrite | ✅ CODE DONE | Replay button (↩ khi FINISHED), YouTube-style neon slider (emerald progress track), Dynamic Tooltip, Speed dropdown (0.25x-4.0x), Glassmorphism backdrop-blur, E-Lecture lock (opacity 0.5 + pointer-events none) |
| **Tests** | 23 Unit Tests | ✅ CODE DONE | `executionControl.spec.ts` — Speed Presets (1), Speed Preferences localStorage (5), Throttled Scrubbing (3), Replay Logic (3), Keyboard Hotkeys (9), Tooltip Logic (2) — ALL PASS |

### Phase 1 Interactive Playground — Sân chơi vẽ đồ thị tương tác (Canvas + Physics)

| Bước | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Store** | usePlaygroundStore (Pinia Setup Store) | ✅ CODE DONE | `store/usePlaygroundStore.ts` — 5 tool modes, NodeDTO/EdgeDTO, addNode/addEdge/deleteNode(cascade)/updateEdgeWeight/moveNode, max 30 nodes, selectNode/selectEdge |
| **Engine** | GraphGeometryEngine (Hit Detection + Arrow Routing) | ✅ CODE DONE | `engine/GraphGeometryEngine.ts` — hitTestNode (Euclidean), hitTestEdge (point-to-segment), calculateArrowPlacement (atan2 border contact), isWithinSnapDistance, edgeMidpoint |
| **Engine** | ForceDirectedEngine (Physics Simulation) | ✅ CODE DONE | `engine/ForceDirectedEngine.ts` — Coulomb repulsion (K=4000), Hooke spring (K=0.05, L=150), damping 0.85, stability detection, canvas boundary clamping, skip dragged node |
| **Component** | PlaygroundCanvas.vue (Canvas 2D + Mouse Events) | ✅ CODE DONE | Single canvas element, 5 tool mode handlers (SELECT drag, ADD_NODE click, ADD_EDGE rubber-band, WEIGHT click-edge, DELETE click), snap glow highlight, arrowhead rendering, weight labels |
| **Component** | FloatingToolbar.vue (Glassmorphism Toolbar) | ✅ CODE DONE | 5 tool buttons (SELECT/ADD_NODE/ADD_EDGE/WEIGHT/DELETE), physics toggle, clear all, keyboard shortcuts (V/N/E/W/Del/Backspace), emerald active glow |
| **Component** | InteractivePlayground.vue (Orchestrator) | ✅ CODE DONE | Status bar (node/edge count, mode badge), Export/Import JSON, Run algorithm (adjacency list output), Weight popover (auto-focus, Enter/Blur/Esc), Toast notifications, JSON output panel |
| **Service** | GraphParser (Graph-to-JSON Converter) | ✅ CODE DONE | `services/GraphParser.ts` — toAdjacencyList (undirected), findIsolatedNodes (BFS connectivity), exportToJSON, importFromJSON (schema validation) |
| **Integration** | App.vue Playground tab | ✅ CODE DONE | New "Playground" tab in App.vue, full-screen InteractivePlayground component |
| **Tests** | 31 Unit Tests | ✅ CODE DONE | `interactivePlayground.spec.ts` — Store (11), GeometryEngine (8), ForceDirectedEngine (4), GraphParser (8) — ALL PASS |

### Phase 1 Pseudocode Sync — Đồng bộ Mã giả Đa Ngôn ngữ & Watch Panel

| Bước | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Types** | FrameDTO extension + Pseudocode interfaces | ✅ CODE DONE | `animation.types.ts` extended (activeLogicalLineId, variables), `pseudocode.types.ts` (CodeLine, LanguageCode, VariableState, PseudocodeScript, SupportedLanguage) |
| **Engine** | PseudocodeSyncEngine core logic | ✅ CODE DONE | `engine/PseudocodeSyncEngine.ts` — getPhysicalLineNumber (logicalId→line mapping), findFirstFrameIndexForLogicalLine (Click-to-Snap), findAllFrameIndicesForLogicalLine, getNextCycleFrameIndex, transformVariablesForWatch, getOccurrenceCount |
| **Store** | usePseudocodeStore Pinia Setup Store | ✅ CODE DONE | `store/usePseudocodeStore.ts` — selectedLanguage, codeLanguages, activeCodeLines, activePhysicalLineNumber, watchVariablesList, changeLanguage, cycleLanguage, loadPseudocodeScript, snapToLogicalLine, snapToNextOccurrence, getOccurrenceInfo, resetStore |
| **Component** | MultilingualCodePanel.vue | ✅ CODE DONE | `components/MultilingualCodePanel.vue` — 4-language Glassmorphic tabs (C++/Java/Python/JavaScript), JetBrains Mono font, emerald neon highlight, auto-scroll active line, Click-to-Snap (cycle navigation), occurrence badge (1/5), syntax highlighting, Tab key language cycle |
| **Component** | VariableWatchPanel.vue | ✅ CODE DONE | `components/VariableWatchPanel.vue` — dynamic variable badges (TransitionGroup fade-in/out), Cyan neon values, Glassmorphism card, hide empty state |
| **Script** | Bubble Sort pseudocode (4 languages) | ✅ CODE DONE | `scripts/bubble-sort.pseudocode.ts` — cpp/java/python/javascript, 5 logicalIds (FUNC_DECL, OUTER_LOOP, INNER_LOOP, COMPARE_STEP, SWAP_STEP), `scriptLoader.ts` registry |
| **Integration** | VisualizationPlayer + Dummy Generators | ✅ CODE DONE | `VisualizationPlayer.vue` replaced AnimPseudoCodePanel with MultilingualCodePanel, auto-load script on algorithmId change, `algorithmApi.ts` dummy BubbleSort updated with activeLogicalLineId + variables per frame |
| **Store Ext** | useAnimationStore activeFrame alias | ✅ CODE DONE | Added `activeFrame` computed alias for `currentFrame` in `useAnimationStore.ts` |
| **Tests** | 37 Unit Tests | ✅ CODE DONE | `PseudocodeSyncEngine.spec.ts` (15), `usePseudocodeStore.spec.ts` (15), `scriptLoader.spec.ts` (7) — ALL PASS |

### Phase 1 Quiz System — Hệ thống Trắc nghiệm Tương tác (Interactive Quiz Checkpoints)

| Bước | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Types** | QuizQuestion, QuizCheckpoint, CanvasNodeDTO, VerificationResult, UserQuizStats | ✅ CODE DONE | `quiz-system/types/quiz.types.ts` — QuestionType union (MULTIPLE_CHOICE, TRUE_FALSE, CANVAS_TARGET), QuizScript, QuizCheckpoint |
| **Engine** | QuizVerificationEngine (MC/TF + Canvas Euclidean Hit) | ✅ CODE DONE | `quiz-system/engine/QuizVerificationEngine.ts` — verifyOptionAnswer, verifyCanvasClickAnswer (Euclidean distance node hit detection) |
| **Engine** | QuizStatsManager (localStorage persistence) | ✅ CODE DONE | `quiz-system/engine/QuizStatsManager.ts` — getStats, saveAttempt (streak tracking), clearStats, STORAGE_KEY `dsa_quiz_statistics` |
| **Engine** | QuizSchemaValidator (JSON structure validation) | ✅ CODE DONE | `quiz-system/engine/QuizSchemaValidator.ts` — validateQuizJson (MC options, CANVAS_TARGET targetNodeId, required fields) |
| **Store** | useQuizStore Pinia Setup Store | ✅ CODE DONE | `quiz-system/store/useQuizStore.ts` — checkpoint detection, triggerCheckpointQuestion, submitOptionAnswer, handleCanvasClickAnswer, dismissQuestionAndContinue, resetQuizStore, sessionAccuracy, allCheckpointsCompleted |
| **Component** | QuizCardOverlay.vue (Glassmorphism Overlay) | ✅ CODE DONE | `quiz-system/components/QuizCardOverlay.vue` — Glassmorphism backdrop-blur, MC/TF option buttons, Neon Emerald correct glow, Rose Red incorrect shake, feedback explanation panel, continue button |
| **Component** | QuizSummaryCard.vue (Score Summary) | ✅ CODE DONE | `quiz-system/components/QuizSummaryCard.vue` — accuracy/correct/streak badges, Glassmorphism card, retry/close actions, dynamic summary message |
| **Script** | Bubble Sort quiz (4 checkpoints) | ✅ CODE DONE | `quiz-system/scripts/bubble-sort.quiz.ts` — 4 checkpoints (MC + TF), frames 1/5/10/16, `quizLoader.ts` registry |
| **LectureStore Ext** | lockLectureInteraction/unlockLectureInteraction/resumeLecturePlayback | ✅ CODE DONE | Extended `useLectureStore.ts` — 3 new actions for quiz-triggered playback lock and auto-resume |
| **Integration** | VisualizationPlayer checkpoint watch | ✅ CODE DONE | `VisualizationPlayer.vue` — QuizCardOverlay + QuizSummaryCard, watch currentIndex for checkpoint detection, watch algorithmId for quiz script loading, watch allCheckpointsCompleted for summary |
| **Tests** | 54 Unit Tests | ✅ CODE DONE | `QuizVerificationEngine.spec.ts` (12), `QuizStatsManager.spec.ts` (9), `QuizSchemaValidator.spec.ts` (11), `useQuizStore.spec.ts` (18), `quizLoader.spec.ts` (4) — ALL PASS |

### Phase 2 Code-to-Visualization Compiler — AST Instrumentation & Web Worker Sandbox

| Bước | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Types** | LiveFrameDTO, CompilationResult, ConsoleLogEntry, WorkerPayload/Response | ✅ CODE DONE | `code-to-visualization/types/compiler.types.ts` |
| **Engine** | ASTInstrumentationEngine (Acorn + acorn-walk + escodegen) | ✅ CODE DONE | `engine/ASTInstrumentationEngine.ts` — compileAndInstrument, instrumentAST (BinaryExpression→traceCompare, AssignmentExpression→traceAssign), injectLoopGuard (__loopCounter > 5000), applyReplacements |
| **Engine** | WorkerLifecycleCoordinator (Web Worker Sandbox) | ✅ CODE DONE | `engine/WorkerLifecycleCoordinator.ts` — executeInSandbox, terminateActiveSession, Blob URL lifecycle, Timeout Guard 1.5s, MAX_FRAMES 2000, traceCompare/traceAssign functions inside Worker |
| **Store** | useLiveCompilerStore Pinia Setup Store | ✅ CODE DONE | `store/useLiveCompilerStore.ts` — sourceCode, isCompiling, compilerConsoleLogs, hasCompileError, inputArray, compileAndExecuteCode (AST→Worker→AnimStore), convertToAnimationFrames (LiveFrameDTO→FrameDTO), cancelExecution |
| **Component** | MonacoEditorPanel.vue (IDE Monaco Editor) | ✅ CODE DONE | `components/MonacoEditorPanel.vue` — algolens-dark theme, JetBrains Mono font, compile error glow (rose red pulse), success glow (emerald), status dot indicator |
| **Component** | CompilerConsole.vue (Nhật ký biên dịch) | ✅ CODE DONE | `components/CompilerConsole.vue` — console log lines (info/success/error/warn), Neon text-shadow, auto-scroll, JetBrains Mono, clear button |
| **Component** | CodeWorkspace.vue (IDE Layout Grid) | ✅ CODE DONE | `components/CodeWorkspace.vue` — 50/50 grid (Editor+Console left, Canvas+Controls right), input array validation, Run button (Cyan gradient + loading state), CanvasLayer + AnimControlPanel reuse |
| **Integration** | App.vue Code IDE tab + module barrel export | ✅ CODE DONE | New "Code IDE" tab in `App.vue`, `index.ts` barrel export |
| **Dependencies** | acorn, acorn-walk, escodegen + @types | ✅ CODE DONE | `acorn`, `acorn-walk`, `escodegen`, `@types/escodegen`, `@types/estree` |
| **Tests** | 32 Unit Tests | ✅ CODE DONE | `ASTInstrumentationEngine.spec.ts` (14), `WorkerLifecycleCoordinator.spec.ts` (7), `useLiveCompilerStore.spec.ts` (11) — ALL PASS |
| **Bug Fix** | 3 Runtime Bugs Fixed | ✅ CODE DONE | Bug 1: Vue Proxy spread `[...inputArray.value]` (useLiveCompilerStore.ts); Bug 2: `__loopCounter` duplicate removed from Function params (WorkerLifecycleCoordinator.ts); Bug 3: `appendAutoInvoke()` appends `functionName(arr)` call (ASTInstrumentationEngine.ts:60-78) |
| **UI Testing** | 5 UI End-to-End Tests | ✅ ALL PASSED | Empty state, Success flow (71 frames), Syntax error, Infinite loop (5000 guard), Invalid input — PR #11 comment with screenshots |

### Phase 2 Compare Algorithms — Side-by-Side Algorithm Comparator

| Bước | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Types** | CompareAlgorithmEntry, CompareStats, ComparePlaybackMode/State | ✅ CODE DONE | `compare-algorithms/types/compare.types.ts` |
| **Engine** | UnifiedPlaybackCoordinator (syncProgressByPercent, calculateAlignedSpeeds) | ✅ CODE DONE | `engine/UnifiedPlaybackCoordinator.ts` — SubStoreState interface, percent-based sync, speed alignment (longer alg keeps base speed, shorter slowed), getGlobalProgress, clamp |
| **Engine** | UnifiedRenderScheduler (Dual rAF loop) | ✅ CODE DONE | `engine/UnifiedRenderScheduler.ts` — registerCallbacks, startSchedulerLoop, stopSchedulerLoop, cleanup — gom 2 Canvas vào 1 vòng rAF tối ưu GPU |
| **Store** | useCompareAlgorithmsStore Pinia Setup Store | ✅ CODE DONE | `store/useCompareAlgorithmsStore.ts` — dual algorithm selection, dual frames (shallowRef), unified VCR (play/pause/stop/step/scrub), independent/normalized playback modes, live stats extraction (comparisons/swaps from highlights), efficiencyRatio, generateRandomInput, cleanup |
| **Component** | CompareAlgorithmSelector.vue (Pair Picker) | ✅ CODE DONE | `components/CompareAlgorithmSelector.vue` — dual dropdowns (Sorting algorithms only), VS badge, "Tạo dữ liệu" (random generate + load), "So sánh" (load with current), disabled option when selected on other side |
| **Component** | CompareCanvasPanel.vue (Single-side Canvas) | ✅ CODE DONE | `components/CompareCanvasPanel.vue` — props-driven (currentFrame, totalFrames, accentColor), bar chart rendering (Lerp EaseOut, sorted/compare/swap highlights), header with algorithm name + complexity + "Hoàn thành" badge, progress bar, ResizeObserver |
| **Component** | ComparativeDashboard.vue (Stats Board) | ✅ CODE DONE | `components/ComparativeDashboard.vue` — 4-column grid: Comparisons, Swaps, Total Steps, Progress — Cyan (left) vs Emerald (right) neon bars, efficiency ratio display |
| **Component** | CompareWorkspace.vue (Orchestrator) | ✅ CODE DONE | `components/CompareWorkspace.vue` — selector + split-screen (grid-cols-2) + dashboard + unified VCR (Play/Pause/Stop/Step/Scrub/Speed/Mode), keyboard shortcuts (Space, Arrow, R), Glassmorphism |
| **Integration** | App.vue "So sánh" tab | ✅ CODE DONE | New "So sánh" tab in `App.vue`, `index.ts` barrel export |
| **Tests** | 33 Unit Tests | ✅ CODE DONE | `UnifiedPlaybackCoordinator.spec.ts` (10), `useCompareAlgorithmsStore.spec.ts` (19), `UnifiedRenderScheduler.spec.ts` (4) — ALL PASS |

### Phase 2 Concurrency Visualizer — Thread Rails & DFS Deadlock Detector

| Bước | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Types** | ThreadInstance, LockInstance, ConcurrencyScenario, DeadlockResult, PlaybackMode | ✅ CODE DONE | `concurrency-viz/types/concurrency.types.ts` — ThreadState (READY/RUNNING/BLOCKED/FINISHED), ScenarioStep, ConcurrencySnapshot |
| **Engine** | ConcurrencySimulationEngine (Thread State Machine + Mutex Lock Queue) | ✅ CODE DONE | `engine/ConcurrencySimulationEngine.ts` — acquireLock (BLOCKED queue), releaseLock (wake signal), moveThread (progress 0-100), incrementCounter, getEngineState |
| **Engine** | DeadlockDetector (DFS Wait-For Graph Cycle Detection) | ✅ CODE DONE | `engine/ConcurrencySimulationEngine.ts` — static detectDeadlock, WFG adjacency list, DFS recStack cycle detection, cycleThreadIds extraction |
| **Store** | useConcurrencyStore Pinia Setup Store | ✅ CODE DONE | `store/useConcurrencyStore.ts` — scenario initialization, step-by-step execution, history snapshots (scrub backward), deadlock detection per step, togglePlayPause, scrubToStep, setMutexEnabled, setSpeed, cleanup |
| **Scenarios** | 4 Concurrency Scenario Presets | ✅ CODE DONE | `scenarios/concurrencyScenarios.ts` — Race Condition (2 threads, 1 Mutex, 24 steps), Deadlock Demo (2 threads, 2 locks, 12 steps), Producer-Consumer (2 threads, 1 lock, 18 steps), Dining Philosophers (5 threads, 5 forks, 20 steps) |
| **Component** | ThreadRailsCanvas.vue (Thread Rails + Critical Section + Mutex Lock) | ✅ CODE DONE | `components/ThreadRailsCanvas.vue` — Slate thread rails, Cyan/Amber/Emerald runner nodes (RUNNING/BLOCKED/FINISHED), Critical Section gate (rose overlay), Mutex padlock icon (open Cyan / locked Amber), Shared Counter display, Deadlock Neon Rose pulse animation, deadlock alert overlay |
| **Component** | ConcurrencyWorkspace.vue (Orchestrator) | ✅ CODE DONE | `components/ConcurrencyWorkspace.vue` — Scenario dropdown selector, Mutex BẬT/TẮT toggle, ThreadRailsCanvas + Pseudocode panel (3-column grid), Unified VCR (Play/Pause/Stop/StepFwd/StepBack/Scrub/Speed), Replay button, Keyboard shortcuts (Space/Arrow/R), Mode badge |
| **Integration** | App.vue "Đa luồng" tab | ✅ CODE DONE | New "Đa luồng" tab in `App.vue`, `index.ts` barrel export |
| **Tests** | 35 Unit Tests | ✅ CODE DONE | `ConcurrencySimulationEngine.spec.ts` (16 — engine + deadlock detector), `useConcurrencyStore.spec.ts` (19 — store) — ALL PASS |

### Phase 2 Debug Mode — Algorithmic Step Debugger Workspace (Generator Yield + Iterator Stepping)

| Bước | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Types** | DebugStepPayload, DebuggerStatus, DebuggerState, DebugCompilationResult | ✅ CODE DONE | `debug-mode/types/debug.types.ts` — DebuggerStatus union (IDLE/DEBUGGING/PAUSED/FINISHED/ERROR), DebugStepPayload (lineNumber, arrayState, variables, callStack) |
| **Engine** | DebuggerYieldEngine (AST → Generator function* + yield injection) | ✅ CODE DONE | `engine/DebuggerYieldEngine.ts` — compileToDebugGenerator, convertFunctionsToGenerators, injectYieldStatements, createYieldStatement (lineNumber + arrayState + variables + callStack), injectLoopGuards (__loopCounter > 5000), appendAutoInvoke (__recursionDepth > 500, __callStack tracking, yield* delegation) |
| **Engine** | LiveCompilerDebugger (Iterator .next() stepping controller) | ✅ CODE DONE | `engine/LiveCompilerDebugger.ts` — stepForward (generator.next()), stepBackward (history restore), continueToNextBreakpoint (loop until breakpoint hit, max 5000 steps), stepOut (loop until callStack.length < currentDepth), setBreakpoints, getHistory, reset |
| **Store** | useLiveDebuggerStore Pinia Setup Store | ✅ CODE DONE | `store/useLiveDebuggerStore.ts` — sourceCode, inputArray, status, activeBreakpoints, currentLineNumber, callStackFrames, watchedVariables, mutatedVariableKeys, stepCount, errorMessage, arrayState; toggleBreakpoint, startDebuggingSession (AST compile + new Function wrapper), stepForward/stepBackward/continueToNextBreakpoint/stepOut, syncDebuggerPayload (mutation detection), stopDebuggingSession |
| **Component** | CallStackVisualizer.vue (3D Glassmorphism stacked cards) | ✅ CODE DONE | `components/CallStackVisualizer.vue` — reverse display (most recent at top), TransitionGroup animation, Active top frame (Cyan border glow, scale 1.01), lower frames (opacity 0.6), depth #, function icon, function name, Active badge |
| **Component** | DebugWatchPanel.vue (Variable watch + mutation highlights) | ✅ CODE DONE | `components/DebugWatchPanel.vue` — variable name=value pairs, mutated vars get Cyan left border + highlight + pulsing dot, TransitionGroup fade transitions, format function (undefined/string/number) |
| **Component** | DebugCanvas.vue (Array bar visualization) | ✅ CODE DONE | `components/DebugCanvas.vue` — bars proportional to value/max, Cyan gradient with glow, shadow blur, roundRect, index labels, responsive resize (requestAnimationFrame + devicePixelRatio DPI scaling) |
| **Component** | DebugWorkspace.vue (IDE Orchestrator) | ✅ CODE DONE | `components/DebugWorkspace.vue` — Monaco Editor (algolens-debug theme, JetBrains Mono, gutter click → toggleBreakpoint, breakpoint rose dots via deltaDecorations, active line Cyan highlight), Canvas (right), CallStack + WatchPanel (right column), VCR controls (Step Over/Back/Out/Continue/Stop/Restart), keyboard shortcuts (F5/F10/F11/Shift+F5/Shift+F11/R), input array editor, status badge, error display |
| **Integration** | App.vue "Debug" tab | ✅ CODE DONE | New "Debug" tab in `App.vue`, `index.ts` barrel export |
| **Tests** | 49 Unit Tests | ✅ CODE DONE | `DebuggerYieldEngine.spec.ts` (15), `LiveCompilerDebugger.spec.ts` (13), `useLiveDebuggerStore.spec.ts` (21) — ALL 49 PASS |

---

### Phase 2 Design Patterns & SOLID Visualizer — SVG UML Class Diagram + Strategy/Observer/DIP

| Bước | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Types** | UMLNode, UMLLink, UMLScenarioPayload, PatternScenarioId | ✅ CODE DONE | `design-patterns/types/design-patterns.types.ts` — UMLNode (id, name, type class/interface/abstract, x/y/width/height, attributes[], methods[]), UMLLink (sourceId, targetId, type inheritance/realization/dependency/association) |
| **Engine** | DesignPatternVisualizerEngine (Bezier path + drag + swap) | ✅ CODE DONE | `engine/DesignPatternVisualizerEngine.ts` — calculateBezierPath (Cubic Bezier M/C), updateNodePosition (clamped boundaries), swapStrategyTarget, calculateAllPaths, getLinksToTarget/FromSource, replaceState |
| **Scenarios** | 3 scenario presets (Strategy, Observer, DIP) | ✅ CODE DONE | `scenarios/scenarioData.ts` — Strategy Pattern (4 nodes, 3 links), Observer Pattern (5 nodes, 4 links), DIP Sandbox (2 nodes, 1 link), getScenario(), getAllScenarioIds(), SCENARIO_LABELS |
| **Store** | useDesignPatternsStore (Pinia setup store) | ✅ CODE DONE | `store/useDesignPatternsStore.ts` — initializeScenario, handleNodeDrag, switchStrategy, triggerObserverNotify (2s timeout), toggleDIP (add/remove IDatabase interface), couplingIndexMetric computed (85%→20%), pathCache reactive Map, cleanup |
| **Component** | ClassNodeCard.vue (Glassmorphism UML node card) | ✅ CODE DONE | `components/ClassNodeCard.vue` — Glassmorphism backdrop-blur, stereotype headers (interface/abstract), JetBrains Mono, attributes + methods sections, drag-and-drop (global window mousemove/mouseup), active strategy Amber glow, observer pulse animation |
| **Component** | DesignPatternsCanvas.vue (SVG connections + nodes) | ✅ CODE DONE | `components/DesignPatternsCanvas.vue` — SVG layer with Bezier paths, 4 arrow markers (inheritance hollow, realization hollow dashed, dependency solid, association), Neon link styles (Emerald/Cyan/Amber), Observer stroke-pulse-flow animation, DIP coupled thick red / decoupled thin cyan |
| **Component** | DesignPatternsWorkspace.vue (Orchestrator) | ✅ CODE DONE | `components/DesignPatternsWorkspace.vue` — Scenario tab selector (3 tabs), Strategy runtime swap buttons (BubbleSort/QuickSort), Observer Notify button, DIP toggle + Coupling Index widget (85% Rose → 20% Cyan), link type legend, node/link count badges |
| **Integration** | App.vue "Patterns" tab | ✅ CODE DONE | Replaced PatternSandbox with DesignPatternsWorkspace in `App.vue`, `index.ts` barrel export |
| **Tests** | 50 Unit Tests | ✅ CODE DONE | `DesignPatternVisualizerEngine.spec.ts` (18), `useDesignPatternsStore.spec.ts` (22), `scenarioData.spec.ts` (10) — ALL 50 PASS |

---

### Phase 2 Export & Share Pipeline — SVG Exporter, lz-string State Compressor, QR Code

| Bước | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Types** | WorkspaceState, LayoutNode, ExportFormat, constants | ✅ CODE DONE | `export-share/types/export-share.types.ts` |
| **Engine** | SVGToCanvasExporter (SVG→PNG 3x + SVG Vector) | ✅ CODE DONE | `engine/SVGToCanvasExporter.ts` — extractSVGDataURI, clampScale (1–4), exportToPNG (Canvas 3x), exportToSVGString |
| **Engine** | WorkspaceStateCompressor (lz-string URL-safe) | ✅ CODE DONE | `engine/WorkspaceStateCompressor.ts` — serializeState, deserializeState, isWithinSizeLimit, serializeStateWithValidation |
| **Engine** | ExternalStylesheetsInjector (CSS extraction) | ✅ CODE DONE | `engine/ExternalStylesheetsInjector.ts` — extractActiveCSSRules, injectCSSIntoSVG |
| **Store** | useExportShareStore Pinia Setup Store | ✅ CODE DONE | `store/useExportShareStore.ts` — modal, export progress, share link, QR, clipboard, overflow validation |
| **Component** | ShareExportModal.vue (Glassmorphism dialog) | ✅ CODE DONE | `components/ShareExportModal.vue` — Teleport, backdrop blur, format selector, progress bar, QR, copy link |
| **Component** | ExportFormatSelector.vue (PNG/SVG buttons) | ✅ CODE DONE | `components/ExportFormatSelector.vue` — Neon active state |
| **Component** | QRCodeDisplay.vue (Dynamic QR amber border) | ✅ CODE DONE | `components/QRCodeDisplay.vue` — qrcode canvas render |
| **Component** | ExportProgressBar.vue (Emerald progress) | ✅ CODE DONE | `components/ExportProgressBar.vue` — Emerald fill + JetBrains Mono % |
| **Component** | ExportShareWorkspace.vue (Orchestrator) | ✅ CODE DONE | `components/ExportShareWorkspace.vue` — Demo SVG + modal integration |
| **Integration** | App.vue "Export/Share" tab + barrel export | ✅ CODE DONE | New "Export/Share" tab in `App.vue`, `index.ts` barrel |
| **Dependencies** | lz-string, qrcode + @types | ✅ CODE DONE | `lz-string`, `qrcode`, `@types/lz-string`, `@types/qrcode` |
| **Tests** | 85 Unit Tests | ✅ CODE DONE | `WorkspaceStateCompressor.spec.ts` (19), `SVGToCanvasExporter.spec.ts` (20), `ExternalStylesheetsInjector.spec.ts` (12), `useExportShareStore.spec.ts` (34) — ALL 85 PASS |

### Phase 2 Gamification Engine — Streak Calculator, Badge Unlocking, Canvas Confetti, Leaderboard

| Bước | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Types** | UserProgressState, BadgeDefinition, LeaderboardEntry, ConfettiParticle, constants | ✅ CODE DONE | `gamification-engine/types/gamification.types.ts` — GRACE_HOURS_OFFSET, MAX_XP_PER_QUIZ, BADGE_TEMPLATES, CONFETTI_COLORS |
| **Engine** | StreakCalculator (Grace Period 2:00 AM) | ✅ CODE DONE | `engine/StreakCalculator.ts` — getAdjustedDate (subtract 2 hours), calculateUpdatedStreak (same-day/consecutive/gap detection) |
| **Engine** | GamificationEngine (Badge Unlocking + XP Validation) | ✅ CODE DONE | `engine/GamificationEngine.ts` — checkNewUnlockedBadges (XP + streak threshold), getBadgeTemplates, validateXPAmount (1–200 cap) |
| **Engine** | CanvasConfettiEngine (HTML5 Canvas Particle 60 FPS) | ✅ CODE DONE | `engine/CanvasConfettiEngine.ts` — burst (150 particles), tick (gravity + air drag + rotation), destroy (GC-safe cleanup) |
| **Store** | useGamificationStore Pinia Setup Store | ✅ CODE DONE | `store/useGamificationStore.ts` — XP, streak, badges, confetti, leaderboard, earnXPLocal, useStreakFreeze, checkAndUnlockBadges |
| **Component** | StreakFire.vue (Neon Orange flame animation) | ✅ CODE DONE | `components/StreakFire.vue` — SVG flame icon, streak-fire-burn keyframes, active/inactive state |
| **Component** | BadgesCabinet.vue (Glassmorphism badge grid) | ✅ CODE DONE | `components/BadgesCabinet.vue` — locked grayscale + unlocked Emerald glow, badge-unlock-pulse animation, hover lift |
| **Component** | WeeklyLeaderboard.vue (Top 10 podium) | ✅ CODE DONE | `components/WeeklyLeaderboard.vue` — Gold/Silver/Bronze borders, rank badges, XP display |
| **Component** | CanvasConfettiOverlay.vue (Teleport fullscreen) | ✅ CODE DONE | `components/CanvasConfettiOverlay.vue` — Teleport to body, pointer-events-none, lifecycle management |
| **Component** | GamificationWorkspace.vue (Orchestrator) | ✅ CODE DONE | `components/GamificationWorkspace.vue` — XP bar, streak fire, badges, leaderboard, demo controls |
| **Integration** | App.vue "Gamification+" tab + barrel export | ✅ CODE DONE | New "Gamification+" tab in `App.vue`, `index.ts` barrel |
| **Tests** | 88 Unit Tests | ✅ CODE DONE | `StreakCalculator.spec.ts` (20), `GamificationEngine.spec.ts` (20), `CanvasConfettiEngine.spec.ts` (17), `useGamificationStore.spec.ts` (31) — ALL 88 PASS |

### Phase 2 Learning Path Skill Tree — DAG Engine, AI Evaluator, Laser Bridges, Offline Sync

| Bước | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Types** | PathNode, UserQuizScore, AIRecommendation, Point, NodePosition, LaserBridge | ✅ CODE DONE | `learning-path/types/learning-path.types.ts` — NodeStatus, SyncStatus, OfflineProgressData |
| **Engine** | PrerequisiteDAGEngine (Client-side DAG Solver) | ✅ CODE DONE | `engine/PrerequisiteDAGEngine.ts` — resolveNodeStatuses, hasCycle (DFS), getTopologicalOrder (Kahn) |
| **Engine** | PersonalizedPathEvaluator (AI Recommendation) | ✅ CODE DONE | `engine/PersonalizedPathEvaluator.ts` — evaluateNextRecommendedNode (70% threshold), completionPercentage, averageScore |
| **Engine** | LaserBatchRenderer (rAF SVG Batch Renderer) | ✅ CODE DONE | `engine/LaserBatchRenderer.ts` — calculateBezierPath, scheduleBatchRender (rAF coalescing), getElementCenter, shouldRenderBridge |
| **Engine** | OfflineProgressSynchronizer (localStorage + Server) | ✅ CODE DONE | `engine/OfflineProgressSynchronizer.ts` — saveToLocalStorage (0ms), loadFromLocalStorage, scheduleDebouncedSync (2000ms) |
| **Store** | useLearningPathStore Pinia Setup Store | ✅ CODE DONE | `store/useLearningPathStore.ts` — rawNodes, completedNodeIds, resolvedNodes, aiRecommendedNode, nodePositions, laserBridges |
| **Component** | PathNodeCircle.vue (3-state Neon circles) | ✅ CODE DONE | `components/PathNodeCircle.vue` — COMPLETED Emerald, UNLOCKED Cyan breath, LOCKED Slate, recommended Amber |
| **Component** | LaserFlowBridge.vue (SVG laser animation) | ✅ CODE DONE | `components/LaserFlowBridge.vue` — SVG path, active Cyan pulse, inactive Slate, Gaussian blur glow |
| **Component** | AIEvaluatorCard.vue (AI Advisor card) | ✅ CODE DONE | `components/AIEvaluatorCard.vue` — Glassmorphism Amber border, review/advance modes, completion banner |
| **Component** | LearningPathMap.vue (RPG Map Grid) | ✅ CODE DONE | `components/LearningPathMap.vue` — radial gradient bg, node circles, laser bridges, progress bar |
| **Component** | LearningPathWorkspace.vue (Orchestrator) | ✅ CODE DONE | `components/LearningPathWorkspace.vue` — header badges, map + sidebar, AI card, node details, demo controls |
| **Integration** | App.vue "Learning Path" tab + barrel export | ✅ CODE DONE | New "Learning Path" tab in App.vue, index.ts barrel |
| **Tests** | 98 Unit Tests | ✅ CODE DONE | `PrerequisiteDAGEngine.spec.ts` (22), `PersonalizedPathEvaluator.spec.ts` (22), `LaserBatchRenderer.spec.ts` (18), `OfflineProgressSynchronizer.spec.ts` (16), `useLearningPathStore.spec.ts` (20) — ALL 98 PASS |

### Phase 2 Multi-View Synchronization — EventBus, Timeline Manager, Resizable Splitter

| Bước | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Types** | TimelineStep, StepChangedCallback, PlaybackSpeed, PaneLayout, SeekResult | ✅ CODE DONE | `multi-view/types/multi-view.types.ts` — PANE_MIN/MAX_PERCENT, PLAYBACK_SPEEDS constants |
| **Engine** | MultiViewEventBus (RAM-based pub/sub <1ms) | ✅ CODE DONE | `engine/MultiViewEventBus.ts` — subscribe, dispatch, unsubscribe, unsubscribeAll, getListenerCount |
| **Engine** | SynchronizedTimelineManager (bounds-safe seek) | ✅ CODE DONE | `engine/SynchronizedTimelineManager.ts` — seekToStep [0, N-1] bounds, stepNext, stepPrev, isAtStart/End |
| **Engine** | ThrottledDragCoordinator (rAF 60 FPS) | ✅ CODE DONE | `engine/ThrottledDragCoordinator.ts` — rAF throttle, clamp 15%-85%, GC-safe destroy |
| **Store** | useMultiViewStore Pinia Setup Store | ✅ CODE DONE | `store/useMultiViewStore.ts` — timeline playback, pane layout, VCR controls, demo Bubble Sort steps |
| **Component** | ResizableSplitter.vue (Neon Cyan handle) | ✅ CODE DONE | `components/ResizableSplitter.vue` — Glassmorphic drag handle, 3-dot indicator, drag events |
| **Component** | VCRScrubberBar.vue (Orange Neon slider) | ✅ CODE DONE | `components/VCRScrubberBar.vue` — play/pause/step/speed buttons, range slider, progress display |
| **Component** | CodeHighlightPanel.vue (Amber line highlight) | ✅ CODE DONE | `components/CodeHighlightPanel.vue` — Bubble Sort pseudocode, amber active line, gutter arrow |
| **Component** | FlowchartPanel.vue (Cyan node pulsing) | ✅ CODE DONE | `components/FlowchartPanel.vue` — 6 flowchart nodes, active node Cyan pulse animation |
| **Component** | SVGVisualizerPanel.vue (Bar chart sync) | ✅ CODE DONE | `components/SVGVisualizerPanel.vue` — SVG bars from memoryStateSnapshot, comparing/sorted coloring |
| **Component** | MultiViewWorkspace.vue (Orchestrator) | ✅ CODE DONE | `components/MultiViewWorkspace.vue` — 2/3-panel layout, header, splitter, VCR bar, sync status |
| **Integration** | App.vue "Multi-View" tab + barrel export | ✅ CODE DONE | New "Multi-View" tab in App.vue, index.ts barrel |
| **Tests** | 102 Unit Tests | ✅ CODE DONE | `MultiViewEventBus.spec.ts` (20), `SynchronizedTimelineManager.spec.ts` (22), `ThrottledDragCoordinator.spec.ts` (15), `useMultiViewStore.spec.ts` (45) — ALL 102 PASS |

### Phase 2 OOP Concepts Visualizer — Reflection Engine, VTable Dispatch, Glassmorphic UML Cards

| Bước | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Types** | ClassMember, ClassDefinition, HeapObjectInstance, ExecutionPointer, CoordinatePoint, LaserSegment, EncapsulationViolation | ✅ CODE DONE | `oop-visualization/types/oop-visualization.types.ts` — AccessModifier, DispatchStatus, MAX_HEAP_OBJECTS=10, MAX_INHERITANCE_DEPTH=5, HEAP_BASE_ADDRESS |
| **Engine** | OOPReflectionEngine (class registry, VTable, heap, encapsulation) | ✅ CODE DONE | `engine/OOPReflectionEngine.ts` — registerClass depth-check, instantiateObject hex address, dispatchMethod VTable lookup, validateEncapsulationAccess PUBLIC/PROTECTED/PRIVATE |
| **Engine** | SVGLaserBatchRenderer (cubic bezier paths, rAF batching) | ✅ CODE DONE | `engine/SVGLaserBatchRenderer.ts` — calculateLaserPath, calculateDispatchLaserPath, getDOMElementCenter, scheduleBatchRender rAF 60FPS, GC-safe destroy |
| **Store** | useOOPVisualizerStore Pinia Setup Store | ✅ CODE DONE | `store/useOOPVisualizerStore.ts` — 4 pillars setup (activePillar: encapsulation/inheritance/polymorphism/abstraction), dynamic demo classes registration per tab, scenarios, heap allocation, triggerPolymorphicCall, tryAccessProperty, callStack, activeCodeLine, VCR autoplay and speed. |
| **Component** | UMLClassCard.vue (Glassmorphism class card) | ✅ CODE DONE | `components/UMLClassCard.vue` — encapsulation-breach-wiggle CSS animation, field/method sections, AccessModifierPadlock integration |
| **Component** | AccessModifierPadlock.vue (3-color Neon badges) | ✅ CODE DONE | `components/AccessModifierPadlock.vue` — RED private, YELLOW protected, GREEN public, Neon drop-shadow glow |
| **Component** | DynamicDispatchLaser.vue (SVG laser animation) | ✅ CODE DONE | `components/DynamicDispatchLaser.vue` — seeking/resolved phases, cubic bezier path, pivot dot, target dot, laser-flow keyframes |
| **Component** | HeapObjectAllocator.vue (Heap memory UI) | ✅ CODE DONE | `components/HeapObjectAllocator.vue` — hex address display, field names, VTable summary badges, free() button |
| **Component** | PolymorphismSandbox.vue (Interactive sandbox) | ✅ CODE DONE | `components/PolymorphismSandbox.vue` — class selector, instantiate, VTable dispatch map, dynamic activePillar titles, dispatch status indicator, violation alert |
| **Component** | OOPConceptsVisualizerWorkspace.vue (Orchestrator) | ✅ CODE DONE | `components/OOPConceptsVisualizerWorkspace.vue` — orchestrator with 4-pillar navigation menu tabs, UML cards vertical stack, sandbox + heap split, dynamic laser coordinate updater, vertical SVG class generalization lines, VCR controls, speed preferences, explanation panel. |
| **Integration** | App.vue "OOP Viz" tab + barrel export | ✅ CODE DONE | New "OOP Viz" tab in App.vue, index.ts barrel |
| **Tests** | 59 Unit Tests | ✅ CODE DONE | `OOPReflectionEngine.spec.ts` (27), `SVGLaserBatchRenderer.spec.ts` (7), `useOOPVisualizerStore.spec.ts` (25) — ALL 59 PASS |

### Phase 2 Smart Interactive Quiz Widget — VCR Playback Interceptor, SVG Target Resolver, Quiz Evaluation Engine

| Bước | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Types** | InteractiveQuizQuestion, QuizEvaluationResult, QuizSubmissionState, QuizOverlayStatus, QuizSessionStats | ✅ CODE DONE | `smart-quiz/types/smart-quiz.types.ts` — QuestionType (SVG_NODE_CLICK/MONACO_LINE_CLICK/MULTIPLE_CHOICE), MultipleChoiceOption, QUIZ_CONSTANTS |
| **Engine** | VCRPlaybackInterceptor — timeline step interception | ✅ CODE DONE | `engine/VCRPlaybackInterceptor.ts` — Map-based quiz registry, interceptStep auto-pause + callback, registerQuiz, removeQuiz, clearQuizzes |
| **Engine** | SVGTargetResolver — click event delegation resolver | ✅ CODE DONE | `engine/SVGTargetResolver.ts` — resolveSelectedNodeId (closest data-node-id), evaluateAnswers (Set-based missing/extra diff) |
| **Engine** | QuizEvaluationEngine — RAM-based scoring engine | ✅ CODE DONE | `engine/QuizEvaluationEngine.ts` — evaluate (matchCount, scorePercentage, isCorrect), validateXPReward (1–200), calculateRetryXP (first-try bonus) |
| **Store** | useSmartQuizStore Pinia Setup Store | ✅ CODE DONE | `store/useSmartQuizStore.ts` — 3 demo quizzes, triggerQuiz, toggleAnswerSelection (max clamp), submitAnswers (debounce 2s), retryQuiz (0 XP retry), closeQuiz (SLIDE_OUT animation), checkTimelineStep, sessionStats tracking |
| **Component** | InteractiveQuizOverlay.vue (Slide-in Glassmorphic panel) | ✅ CODE DONE | `components/InteractiveQuizOverlay.vue` — slide-in right 500ms cubic-bezier, question type badges, MC options, SVG/Monaco click hints, shake animation on wrong answer |
| **Component** | ExplanationHSLCard.vue (Emerald/Crimson feedback) | ✅ CODE DONE | `components/ExplanationHSLCard.vue` — correct Emerald glow + XP reward banner, incorrect Crimson with score percentage |
| **Component** | SVGQuizCanvas.vue (Interactive SVG bar chart) | ✅ CODE DONE | `components/SVGQuizCanvas.vue` — 8-bar demo array, data-node-id click delegation, Cyan hover glow, Amber selected glow, VCR lock indicator |
| **Component** | QuizSessionDashboard.vue (Stats + demo triggers) | ✅ CODE DONE | `components/QuizSessionDashboard.vue` — 3-stat grid (questions/correct/XP), accuracy progress bar, 3 demo quiz trigger buttons, reset session |
| **Component** | SmartQuizWorkspace.vue (Orchestrator) | ✅ CODE DONE | `components/SmartQuizWorkspace.vue` — SVG canvas + overlay left panel, session dashboard right panel, timeline lock status badge |
| **Integration** | App.vue "Smart Quiz" tab + barrel export | ✅ CODE DONE | New "Smart Quiz" tab in App.vue, index.ts barrel |
| **Tests** | 90 Unit Tests | ✅ CODE DONE | `VCRPlaybackInterceptor.spec.ts` (16), `SVGTargetResolver.spec.ts` (12), `QuizEvaluationEngine.spec.ts` (21), `useSmartQuizStore.spec.ts` (41) — ALL 90 PASS |

### Phase 2 SOLID Principles Visualizer — Thermal SRP, Laser Fracture LSP, Neon DIP

| Bước | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Types** | SOLIDClassNode, FireParticle, FractureSegment, DIPState, CoordinatePoint | ✅ CODE DONE | `solid-visualization/types/solid-visualization.types.ts` — SOLIDPrinciple, MemberType, LSPSubstitutionPhase, MAX_PARTICLES=80, LSP_LASER_DELAY_MS=800, SRP_VIOLATION_THRESHOLD=2 |
| **Engine** | LCOMCalculator (DFS connected components LCOM4) | ✅ CODE DONE | `engine/LCOMCalculator.ts` — calculateLCOM4 via adjacency graph + DFS, returns disconnected method group count |
| **Engine** | SOLIDEvaluatorEngine (SRP/LSP evaluation) | ✅ CODE DONE | `engine/SOLIDEvaluatorEngine.ts` — evaluateSRP (LCOM4 >= 2 violation), evaluateLSP (NotImplementedException check) |
| **Engine** | ThermalSparkParticleEngine (Canvas 2D 60FPS) | ✅ CODE DONE | `engine/ThermalSparkParticleEngine.ts` — rAF loop, max 80 particles, HSL hue 0-30, gravity physics, GC-safe destroy |
| **Engine** | LaserFractureCalculator (zigzag segments) | ✅ CODE DONE | `engine/LaserFractureCalculator.ts` — generateFractureSegments 10-15 zigzag, calculateAngle, calculateDistance |
| **Store** | useSOLIDVisualizerStore Pinia Setup Store | ✅ CODE DONE | `store/useSOLIDVisualizerStore.ts` — 5 lessons SRP/OCP/LSP/ISP/DIP, SRP demo UserManager LCOM4=3, triggerSRPSplit 3 classes, LSP 800ms substitution, DIP interface insertion |
| **Component** | ThermalClassCard.vue (Glassmorphic + Canvas sparks) | ✅ CODE DONE | `components/ThermalClassCard.vue` — LCOM4 badge, thermal-glow animation, embedded Canvas particle overlay, split button |
| **Component** | LaserFractureOverlay.vue (SVG fracture) | ✅ CODE DONE | `components/LaserFractureOverlay.vue` — laser beam pulse, zigzag fracture lines, shatter error banner |
| **Component** | NeonFlowingPath.vue (SVG DIP flow) | ✅ CODE DONE | `components/NeonFlowingPath.vue` — violating red/correct green, interface box, flowing dash animation |
| **Component** | SRPLessonPanel, LSPLessonPanel, DIPLessonPanel | ✅ CODE DONE | Lesson-specific panels with interaction buttons, diagnostic results, phase badges |
| **Component** | SOLIDVisualizerWorkspace.vue (Orchestrator) | ✅ CODE DONE | `components/SOLIDVisualizerWorkspace.vue` — 5-tab lesson selector, SRP/LSP/DIP panels, footer status, Reset All |
| **Integration** | App.vue "SOLID Viz" tab + barrel export | ✅ CODE DONE | New "SOLID Viz" tab in App.vue, index.ts barrel export |
| **Tests** | 105 Unit Tests | ✅ CODE DONE | `LCOMCalculator.spec.ts` (12), `SOLIDEvaluatorEngine.spec.ts` (11), `ThermalSparkParticleEngine.spec.ts` (15), `LaserFractureCalculator.spec.ts` (20), `useSOLIDVisualizerStore.spec.ts` (47) — ALL 105 PASS |

### Phase 2 — State Inspector & Stack Frames (`src/features/state-inspector/`)

| Loại | Tên | Trạng thái | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Types** | state-inspector.types.ts | ✅ CODE DONE | `types/state-inspector.types.ts` — StackFrame, StackVariable, RecursionNode, RecursionNodeCoordinate, HeapObject, PointerLink, BezierPathData, MAX_STACK_FRAMES=10, TREE_DEPTH_SPACING_PX=80, BEZIER constants |
| **Engine** | StateInspectorEngine.ts (Call Stack Manager) | ✅ CODE DONE | `engine/StateInspectorEngine.ts` — pushFrame (deactivate all + activate top), popFrame (reactivate previous), switchActiveFrame, getStack shallow copy, MAX_STACK_FRAMES ceiling clamping, clear |
| **Engine** | RecursionTreeGenerator.ts (Layered Coordinate Calculator) | ✅ CODE DONE | `engine/RecursionTreeGenerator.ts` — calculateCoordinates (binary subdivision, depth * 80 + 40 Y-axis), countNodes, getMaxDepth |
| **Engine** | PointerArrowBatchRenderer.ts (Dynamic Bezier SVG) | ✅ CODE DONE | `engine/PointerArrowBatchRenderer.ts` — registerLink, removeLink, clearLinks, start/stop rAF loop, resize listener, calculateBezierPath (Cubic Bezier, BEZIER_MIN_DX=40, 0.4 control factor), GC-safe destroy |
| **Store** | useStateInspectorStore Pinia Setup Store | ✅ CODE DONE | `store/useStateInspectorStore.ts` — stackFrames, recursionTreeRoot, heapObjects, pointerLinks, hoveredHeapAddress, treeCoordinates computed, Fibonacci demo (4 frames + 2 heap + tree), demoStepForward, demoPushCall, MONACO_REVEAL_LINE_EVENT CustomEvent dispatch |
| **Component** | CallStackPanel.vue (3D Glassmorphic Stack) | ✅ CODE DONE | `components/CallStackPanel.vue` — column-reverse stacking, Cyan active border glow, 3D depth scale(0.96), variable list with heapAddress hover |
| **Component** | HeapObjectNode.vue (Heap Memory Cells) | ✅ CODE DONE | `components/HeapObjectNode.vue` — hex address badge, Amber pulse animation on hover, field list |
| **Component** | PointerNeonArrow.vue (SVG Bezier Arrows) | ✅ CODE DONE | `components/PointerNeonArrow.vue` — Cyan neon dashed stroke, arrowhead marker, pointer-flow-dash animation 1.2s |
| **Component** | RecursionTreeSVG.vue (Tree Visualization) | ✅ CODE DONE | `components/RecursionTreeSVG.vue` — SVG nodes (Emerald ACTIVE, Cyan RESOLVED, Slate PENDING), parent→child edges, return value badges |
| **Component** | StateInspectorWorkspace.vue (Orchestrator) | ✅ CODE DONE | `components/StateInspectorWorkspace.vue` — Call Stack + Heap left panel, Recursion Tree + active frame details right panel, Demo Fibonacci/Step Pop/Push Call/Reset All buttons |
| **Integration** | App.vue "State Inspector" tab + barrel export | ✅ CODE DONE | New "State Inspector" tab in App.vue, index.ts barrel export |
| **Tests** | 90 Unit Tests | ✅ CODE DONE | `StateInspectorEngine.spec.ts` (18), `RecursionTreeGenerator.spec.ts` (17), `PointerArrowBatchRenderer.spec.ts` (18), `useStateInspectorStore.spec.ts` (37) — ALL 90 PASS |

---

### Phase 2 System Design Visualizer — Round-Robin LB, Failover Smoke, DB Replication Lag

| Bước | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Types** | SystemNode, NetworkLink, NetworkPacket, SmokeParticle, ReplicationJob, constants | ✅ CODE DONE | `system-design-viz/types/system-design-viz.types.ts` — SystemNodeType, NodeStatus, PacketStatus, PACKET_SPEED=0.05, MAX_ACTIVE_PACKETS=200, REPLICATION_LAG_MIN/MAX/DEFAULT |
| **Engine** | SystemDesignEngine (Round-Robin LB + Failover + Packet GC) | ✅ CODE DONE | `engine/SystemDesignEngine.ts` — registerNode/Link, routeRequestFromLB Round-Robin, createDirectPacket, updatePacketsProgress GC, setNodeStatus, MAX_ACTIVE_PACKETS cap |
| **Engine** | FailureSmokeEmitterEngine (Canvas 2D 60FPS smoke) | ✅ CODE DONE | `engine/FailureSmokeEmitterEngine.ts` — rAF loop, triggerBurst 20 particles, continuous emission, radial angle spread, fade-out alpha, GC-safe destroy |
| **Engine** | ReplicationLagScheduler (DB sync delay queue) | ✅ CODE DONE | `engine/ReplicationLagScheduler.ts` — scheduleReplication with clamped lag 100-5000ms, pending/completed tracking, timer GC on clear |
| **Store** | useSystemDesignStore Pinia Setup Store | ✅ CODE DONE | `store/useSystemDesignStore.ts` — 6-node demo topology, injectHttpRequest, injectTrafficBurst, toggleServerStatus failover, triggerDbWrite replication, tickEngine, setReplicationLag, clearTopology |
| **Component** | SystemNodeCard.vue (Glassmorphic + failed/overloaded) | ✅ CODE DONE | `components/SystemNodeCard.vue` — status dot, type badge, request count, toggle button, is-failed red glow CSS |
| **Component** | NeonPacketDot.vue (Emerald/Amber data particle) | ✅ CODE DONE | `components/NeonPacketDot.vue` — interpolated position, neon drop-shadow, packet color variable |
| **Component** | NetworkLinkSVG.vue (SVG connection lines) | ✅ CODE DONE | `components/NetworkLinkSVG.vue` — Cyan/Red stroke, dashed if failed, opacity change |
| **Component** | ReplicationLagPanel.vue (DB sync controls) | ✅ CODE DONE | `components/ReplicationLagPanel.vue` — lag slider 100-5000ms, pending/completed badges, DB Write button |
| **Component** | SystemDesignWorkspace.vue (Orchestrator) | ✅ CODE DONE | `components/SystemDesignWorkspace.vue` — architecture canvas, SVG links layer, node cards, neon packets, traffic controls, replication panel, reset/clear |
| **Integration** | App.vue "System Design" tab + barrel export | ✅ CODE DONE | New "System Design" tab in App.vue, index.ts barrel export |
| **Tests** | 64 Unit Tests | ✅ CODE DONE | `SystemDesignEngine.spec.ts` (20), `FailureSmokeEmitterEngine.spec.ts` (10), `ReplicationLagScheduler.spec.ts` (10), `useSystemDesignStore.spec.ts` (24) — ALL 64 PASS |

---

## 3. Kiểm Kê Code Thực Tế Đã Có (File Inventory)

### `src/core/` — Sprint 1 ✅

- `CoreAnimationEngine.ts` — vòng lặp rAF, Lerp, deltaTime clamp 32ms, GC-safe destroy
- `CompilerStepExecutor.ts` — JS sandbox executor + Regex fallback, sinh `PlaybackFrame[]`

### `src/features/algorithm-sandbox/` — Sprint 2 ✅ + Sprint 3 ✅ + Sprint 5 ✅

- `algorithms/bubbleSort.ts`, `quickSort.ts`, `mergeSort.ts`, `heapSort.ts` — 4 frame generators
- `components/ArrayBarVisualizer.vue` — Canvas 2D, Double Buffering, Lerp animation, zoom/pan
- `components/CustomInputPanel.vue` — Graph Playground với drag-drop vertices, force-directed auto layout
- `composables/useCamera.ts`, `useMousePan.ts`, `useCanvasResize.ts`
- `renderers/renderSortBar.ts`, `renderLoopPointer.ts`
- `PseudocodeSyncer.ts` — line mapping, step↔line lookup
- `MonacoLineSyncerCoordinator.ts` — điều phối đồng bộ giữa Monaco và VCR
- `CustomInputParser.ts` — parseNumberArray, parseAdjacencyList, InteractivePlaygroundEngine
- `ForceDirectedLayout.ts` — Coulomb repulsion + Hooke attraction physics engine
- `__tests__/ForceDirectedLayout.spec.ts` — 6 unit tests cho physics và graph parsing

#### Sprint 13 — Algorithm Sandbox Audit & Correctness Fixes ✅ CODE DONE

| Vấn đề | Trạng thái | File sửa |
| :--- | :--- | :--- |
| CountingSort chỉ sort theo hàng đơn vị → kết quả sai mảng đa chữ số | ✅ CODE DONE | `algorithms/countingSort.ts` — LSD counting multi-pass + offset số âm, stepIndex từ 0, arrayState tiến hóa, sortedIndices đủ |
| RadixSort crash với số âm + seed sai + sortedIndices luôn rỗng | ✅ CODE DONE | `algorithms/radixSort.ts` — offset âm, bỏ seed 1, sortedIndices frame cuối |
| QuickSort đệ quy không guard depth + thiếu swap đặt pivot | ✅ CODE DONE | `algorithms/quickSort.ts` — stack tường minh (hết StackOverflow), swaps++ pivot placement |
| MergeSort sortedIndices đánh dấu sớm + thiếu stats | ✅ CODE DONE | `algorithms/mergeSort.ts` — sorted chỉ khi merge gốc; thêm comparisons/writes |
| Heap/Bubble crash mảng rỗng (sortedIndices=[0], "Root = undefined") | ✅ CODE DONE | `algorithms/heapSort.ts`, `algorithms/bubbleSort.ts` — guard n=0; heap thêm comparisons |
| BucketSort thiếu stats + arrayState đứng im | ✅ CODE DONE | `algorithms/bucketSort.ts` — comparisons/swaps khớp frame; collect tiến hóa |
| Enricher tráo identity phần tử trùng khi swap xa | ✅ CODE DONE | `helpers/sortingIdEnricher.ts` — swap deterministic qua swappedIndices |
| Heap phase badge sai (keyword 'hoán đổi' không khớp) | ✅ CODE DONE | `composables/useHeapSortVisualizer.ts` — phân biệt BUILD/SORT qua heapSize |
| UI: dock đè drawer, counting/bucket bị clip, Space kích hoạt kép, dispatcher thiếu nhánh bubble/empty state | ✅ CODE DONE | `views/sorting/SortingView.vue`, `components/SortingVisualizerDispatcher.vue`, `components/CountingSortVisualizer.vue`, `components/BucketSortVisualizer.vue`, `components/SortingDrawerTrace.vue`, `components/ArrayBarVisualizer.vue` |
| Test edge case thiếu (counting không có test → bug lọt) | ✅ CODE DONE | `__tests__/sortingEdgeCases.spec.ts` — 27 test khóa hành vi chuẩn |

### `src/features/oop-sandbox/` — Sprint 6 ✅

- `OOPReflectionEngine.ts` — Class registration, VTable dispatch, access modifier checking, heap instantiation
- `EncapsulationLock.ts` — Lock visual effects, violation laser beams, modifier badges (private/protected/public)
- `components/OOPSandbox.vue` — Glassmorphism UML class cards, VTable dispatch panel, Heap memory allocator UI
- `index.ts` — Module exports

### `src/features/solid-sandbox/` — Sprint 7 ✅

- `SOLIDLCOM4Calculator.ts` — LCOM4 cohesion calculator với DFS/BFS connected components analysis
- `LspGlassCracker.ts` — Glass crack path generation, ziczac jitter algorithm, canvas animation
- `components/SOLIDSandbox.vue` — SOLID principles inspector, LCOM4 analyzer, LSP cracked glass demo
- `index.ts` — Module exports

### `src/features/di-sandbox/` — Sprint 8 ✅

- `DIContainerEngine.ts` — IoC Container simulation với DFS cycle detection, Singleton/Transient lifetime, dependency resolution
- `components/DISandbox.vue` — DI visualization, service registration panel, dependency graph, cycle detection demo
- `index.ts` — Module exports

### `src/features/pattern-sandbox/` — Sprint 9 ✅

- `PatternEngine.ts` — Observer, Strategy, Factory pattern simulators với MessageFlowRenderer
- `components/PatternSandbox.vue` — Design patterns playground với 3 tabs: Observer (notification flow), Strategy (algorithm switcher), Factory (product creation)
- `index.ts` — Module exports

### `src/features/state-sandbox/` — Sprint 10 ✅

- `CallStackEngine.ts` — 3D Call Stack & Heap visualization, Stack-to-Heap Bezier pointers
- `DSLEngine.ts` — Custom DSL compiler (ALLOC, PUSH, POP, LINK, FREE, CALL, RETURN)
- `components/StateInspector.vue` — 3D Stack-Heap visualization, DSL compiler playground
- `index.ts` — Module exports

### `src/features/system-sandbox/` — Sprint 11 ✅

- `LoadBalancerEngine.ts` — Round-robin load balancer, HTTP request particles, smoke effects, DB replication
- `components/SystemSandbox.vue` — System design topology, server failure simulation, replication lag
- `index.ts` — Module exports

### `src/features/gamification/` — Sprint 12 ✅

- `XPEngine.ts` — XP accumulation, level progression (8 levels), badges system, embed widget generator
- `components/GamificationPanel.vue` — Progress tracking, badges display, embed code generator
- `index.ts` — Module exports

### `src/features/interactive-playground/` — Phase 1 Interactive Playground ✅

- `store/usePlaygroundStore.ts` — Pinia Setup Store, 5 tool modes, NodeDTO/EdgeDTO, cascade delete, max 30 nodes
- `engine/GraphGeometryEngine.ts` — Euclidean hit detection, atan2 arrowhead placement, point-to-segment edge hit, snap distance
- `engine/ForceDirectedEngine.ts` — Coulomb repulsion + Hooke spring forces, damping 0.85, stability detection, canvas boundary clamping
- `services/GraphParser.ts` — toAdjacencyList (undirected), findIsolatedNodes (BFS), exportToJSON, importFromJSON
- `components/PlaygroundCanvas.vue` — HTML5 Canvas 2D, 5 tool mode mouse handlers, physics render loop 60 FPS, snap glow, arrowheads
- `components/FloatingToolbar.vue` — Glassmorphism vertical toolbar, 5 tool icons, physics toggle, clear all, keyboard shortcuts
- `components/InteractivePlayground.vue` — Orchestrator: status bar, Export/Import JSON, Run algorithm, Weight popover, Toast notifications
- `__tests__/interactivePlayground.spec.ts` — 31 unit tests (Store 11, Geometry 8, Physics 4, Parser 8)
- `index.ts` — Barrel exports

---

## Backend .NET Core — Clean Architecture (15%)

### `backend/src/Domain/` ✅

- `Entities/User.cs` — User entity với gamification fields (TotalXP, Level, Streak)
- `Entities/Badge.cs` — Badge & UserBadge entities
- `Entities/Quiz.cs` — Quiz, QuizQuestion, QuizAttempt entities
- `Entities/LearningProgress.cs` — Learning progress tracking
- `Interfaces/IRepository.cs` — Generic repository interface
- `Interfaces/IUnitOfWork.cs` — Unit of Work pattern

### `backend/src/Application/` ✅

- `DTOs/UserDto.cs` — User DTOs (Register, Login, AuthResponse, XPAward)
- `DTOs/QuizDto.cs` — Quiz DTOs (QuizDto, QuizAttemptRequest/Result)
- `Services/IAuthService.cs` — Auth service interface
- `Services/IQuizService.cs` — Quiz service interface
- `Services/IGamificationService.cs` — Gamification service interface

### `backend/src/Infrastructure/` ✅

- `Data/ApplicationDbContext.cs` — EF Core DbContext với PostgreSQL
- `Data/DbSeeder.cs` — Seed data for badges và quizzes
- `Repositories/Repository.cs` — Generic EF Core repository implementation
- `Repositories/UnitOfWork.cs` — Unit of Work implementation
- `Services/AuthService.cs` — JWT token generation, password hashing
- `Services/QuizService.cs` — Quiz scoring, attempt management
- `Services/GamificationService.cs` — XP awards, badge checking, level calculation

### `backend/src/WebApi/` ✅

- `Controllers/AuthController.cs` — POST /api/auth/register, /login với JWT
- `Controllers/UsersController.cs` — GET /progress, POST /xp endpoints
- `Controllers/QuizzesController.cs` — GET /quizzes, POST /attempt với scoring
- `Controllers/BadgesController.cs` — GET /badges, GET /my, POST /check endpoints
- `Controllers/AlgorithmsController.cs` — POST /api/v1/algorithms/execute (Phase 1 Animation Engine)
- `Program.cs` — DI registration, JWT auth, CORS, Swagger, Brotli/Gzip compression, camelCase JSON
- `appsettings.json` — PostgreSQL connection, JWT secret config

### `backend/src/Domain/Engine/` — Phase 1 Animation Engine ✅

- `HighlightIndices.cs` — Compare/Swap/Sorted index lists for highlight rendering
- `FrameDTO.cs` — Step snapshot: stepId, activeLine, explanation, dataState, highlights
- `AlgorithmResult.cs` — Complete algorithm output: algorithmId, pseudoCode, frames
- `AlgorithmBase.cs` — State Recorder base class with CaptureState/DeepClone pattern
- `BubbleSortExecutor.cs` — Bubble Sort implementation with memory guard (max 50 elements)

### `backend/src/Application/DTOs/` ✅ (updated)

- `AlgorithmRequestDto.cs` — Request DTO: algorithmId, dataType, inputData

### Backend Features ✅

- **JWT Authentication**: Full token-based auth with 7-day expiry
- **Gamification Engine**: XP awards, level progression (formula: level = 1 + √(XP/100)), badge checking
- **Quiz System**: Quiz attempts with 70% pass threshold, automatic XP rewards
- **Algorithm Execution API**: POST /api/v1/algorithms/execute with Brotli/Gzip compression
- **Seed Data**: 8 badges + 5 quizzes (Bubble Sort, Quick Sort, OOP, SOLID, Design Patterns)
- **Clean Architecture**: Domain → Application → Infrastructure → WebApi layers
- **Unit of Work Pattern**: Generic Repository + UoW for transactions

### `src/features/animation-engine/` — Phase 1 Animation Engine ✅

- `types/animation.types.ts` — HighlightIndices, FrameDTO, AlgorithmResult, AlgorithmRequest, PlaybackState interfaces
- `store/useAnimationStore.ts` — Pinia store: shallowRef frames, play/pause/step/scrub/speed, FSM state machine
- `services/algorithmApi.ts` — Backend API client + generateDummyBubbleSortResult fallback
- `components/VisualizationPlayer.vue` — Orchestrator: input bar + canvas + pseudocode + explanation + controls
- `components/CanvasLayer.vue` — HTML5 Canvas: coordinate calculation, 5-color palette, Lerp EaseOut transition, ResizeObserver
- `components/AnimPseudoCodePanel.vue` — Pseudocode display with activeLine highlight sync
- `components/ExplanationPanel.vue` — Natural language explanation display
- `components/AnimControlPanel.vue` — Play/Pause/Step/Stop, timeline scrubber, speed selector, keyboard shortcuts
- `__tests__/useAnimationStore.spec.ts` — 16 unit tests for store FSM
- `__tests__/algorithmApi.spec.ts` — 7 unit tests for dummy data generator

### `src/features/vcr-player/` — Sprint 2 ✅

- `store/useVcrStore.ts` — Pinia store: frames, play/pause/scrub/speed, auto-advance timer
- `components/VcrControlPanel.vue` — UI controls: array input, compile, scrubber, speed, loop

### `src/features/code-editor/` — Sprint 3 ✅

- `components/CodeEditor.vue` — Monaco Editor thật (`@monaco-editor/loader`), `MonacoLineSyncerCoordinator` đồng bộ VCR frame ↔ line highlight, gutter click seek
- `components/PseudocodePanel.vue` — `PseudocodeSyncer` highlight dòng active, auto-scroll
- `components/PseudocodeViewer.vue` — legacy component (replaced by PseudocodePanel)

### `src/features/quiz/` — Sprint 4 ✅

- `service/QuizEvaluationEngine.ts` — QuizEvaluationEngine (score calculator + code compliance linter) + LecturePlaybackCoordinator (slide navigation)
- `components/InteractiveLectureSlides.vue` — Lecture Slides (4 slides với triggerFrameIndex) + MCQ Quiz UI (3 questions) + Code Challenge textarea, mounted trong `App.vue` right column
- `__tests__/QuizEvaluationEngine.spec.ts` — 3 unit tests cho LecturePlaybackCoordinator và QuizEvaluationEngine

---

## 4. ✅ Sprint 3 Đã Hoàn Thành

Tất cả các mục tiêu Sprint 3 đã đạt:

- ✅ Monaco Editor thật (`@monaco-editor/loader`) thay thế textarea
- ✅ `MonacoLineSyncerCoordinator` đồng bộ giữa line highlight và VCR frame
- ✅ `PseudocodeSyncer` tự động highlight dòng theo frame hiện tại
- ✅ Gutter click để seek VCR đến frame tương ứng

---

## 5. ✅ Sprint 4 Đã Hoàn Thành

Tất cả các mục tiêu Sprint 4 đã đạt:

- ✅ `InteractiveLectureSlides.vue` mounted trong `App.vue` (right column)
- ✅ `syncSlideWithVisualizer` kết nối `vcrStore.jumpToFrame()` qua `autoSyncWithVisualizer()`
- ✅ Quiz data hardcoded trong component (4 slides + 3 quiz questions)
- ✅ 3 unit tests pass cho `QuizEvaluationEngine` và `LecturePlaybackCoordinator`

---

## 6. ✅ Sprint 5 Đã Hoàn Thành

Tất cả các mục tiêu Sprint 5 đã đạt:

- ✅ `ForceDirectedLayout` class với Coulomb repulsion và Hooke attraction physics
- ✅ Drag & drop vertices trong `CustomInputPanel.vue` (click chọn → kéo thả)
- ✅ Auto Layout toggle button với animation loop
- ✅ Tích hợp layout physics vào playground canvas
- ✅ 6 unit tests cho ForceDirectedLayout và graph parsing

---

## 7. Cột Mốc Thực Tế Đã Đạt (Actual Milestones)

- ✅ **Mốc 1 (Sprint 1):** Engine rAF 60FPS, JS Sandbox compiler sinh PlaybackFrame[], 11 unit tests pass
- ✅ **Mốc 2 (Sprint 2):** 4 thuật toán sắp xếp hoàn chỉnh, VCR Player với scrubber + speed control, Lerp animation mượt mà
- ✅ **Mốc 3 (Sprint 3):** Pseudocode Viewer highlight dòng đang chạy, Monaco Editor tích hợp, click-to-snap gutter
- ✅ **Mốc 4 (Sprint 4):** Lecture Slides + Interactive Quiz với sync visualizer, code compliance linter, 3 tests pass
- ✅ **Mốc 5 (Sprint 5):** Graph Drawing Playground với force-directed layout, drag-drop nodes, auto-layout physics
- ✅ **Mốc 6 (Sprint 6):** OOP Sandbox với VTable dispatch, encapsulation locks, heap allocator, class inheritance visualization
- ✅ **Mốc 7 (Sprint 7):** SOLID Principles với LCOM4 cohesion analyzer, LSP cracked glass effect, SRP violation detection
- ✅ **Mốc 8 (Sprint 8):** DI Container & IoC visualization với DFS cycle detection, Singleton/Transient lifetime, dependency graph
- ✅ **Mốc 9 (Sprint 9):** Design Patterns (Observer, Strategy, Factory) với Neon Bezier message flow, strategy switching, product creation
- ✅ **Mốc 10 (Sprint 10):** 3D Stack-Heap visualization với DSL compiler, Stack-to-Heap pointers, memory state inspection
- ✅ **Mốc 11 (Sprint 11):** System Design Load Balancer với Round-robin, smoke particles on failover, DB replication lag
- ✅ **Mốc 12 (Sprint 12):** Gamification XP system với 8 levels, badges, embed widget generator
- ✅ **Mốc B1 (Backend Security):** BCrypt password hashing, Global Exception Handler, FluentValidation, JWT Refresh Token, Rate Limiting, Serilog Logging, Health Checks
- ✅ **Mốc B2 (Unit Testing & CI/CD):** 139 xUnit tests (88 Domain + 25 Application + 26 Infrastructure), GitHub Actions CI pipeline

---

## 8. Phase B1: Backend Security & Code Quality Foundation

| Task | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **B1.1** | SHA256 → BCrypt password hashing | ✅ CODE DONE | `AuthService.cs` — `BCrypt.Net.BCrypt.HashPassword(workFactor: 12)`, `BCrypt.Net.BCrypt.Verify()` |
| **B1.2** | Global Exception Handler Middleware | ✅ CODE DONE | `WebApi/Middleware/ExceptionHandlingMiddleware.cs` — RFC 7807 ProblemDetails, domain→HTTP status mapping |
| **B1.3** | Custom Domain Exceptions | ✅ CODE DONE | `Domain/Exceptions/DomainException.cs` — NotFoundException, DomainValidationException, AuthenticationException, ConflictException |
| **B1.4** | FluentValidation cho DTOs | ✅ CODE DONE | `Application/Validators/AuthValidators.cs` — email format, password min 8 + uppercase + lowercase + digit; `QuizValidators.cs` — XP 1-200 |
| **B1.5** | Fix Auth/me endpoint | ✅ CODE DONE | `AuthController.cs` — `[Authorize]` + `User.FindFirst(ClaimTypes.NameIdentifier)` thay vì `[FromHeader] string userId` |
| **B1.6** | Refresh Token | ✅ CODE DONE | `User.cs` — RefreshToken/RefreshTokenExpiry properties; `AuthService.cs` — `RefreshTokenAsync()`; `AuthController.cs` — `POST /api/auth/refresh` |
| **B1.7** | Rate Limiting | ✅ CODE DONE | `Program.cs` — FixedWindow: execute 10/s, auth 5/min, general 30/s; `[EnableRateLimiting]` on controllers |
| **B1.8** | Serilog Structured Logging | ✅ CODE DONE | `Program.cs` — Serilog Console + File sink (rolling daily, 14-day retention), request logging middleware |
| **B1.9** | Health Checks | ✅ CODE DONE | `Program.cs` — `AddHealthChecks().AddDbContextCheck()`, `GET /health` |
| **B1.10** | UsersController Auth Fix | ✅ CODE DONE | `UsersController.cs` — `[Authorize]` + JWT Claims, removed path-based `{id}` → current user only |

## 9. Phase B2: Unit Testing & CI/CD

| Task | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **B2.1** | xUnit test projects + NuGet | ✅ CODE DONE | `Domain.Tests.csproj`, `Application.Tests.csproj`, `Infrastructure.Tests.csproj` — FluentAssertions 6.12.0, Moq 4.20.70, xUnit 2.6.6 |
| **B2.2** | Domain entity tests | ✅ CODE DONE | `UserTests.cs` (9 tests: AwardXP level calc, refresh token, module completion), `BadgeTests.cs` (9 tests: entity construction, quiz pass 70% threshold) |
| **B2.3** | Domain exception tests | ✅ CODE DONE | `DomainExceptionTests.cs` (6 test classes: NotFoundException, DomainValidationException, AuthenticationException, ConflictException, inheritance chain) |
| **B2.4** | Algorithm strategy tests | ✅ CODE DONE | `SortingStrategyTests.cs` (5 algos: Bubble/Selection/Insertion/Quick/Merge — sorted output verify), `SearchStrategyTests.cs` (Linear/Binary), `DataStructureStrategyTests.cs` (Stack/Queue/BST) |
| **B2.5** | InputParser & ConstraintResolver tests | ✅ CODE DONE | `InputParserTests.cs` (12 tests: valid/empty/null/whitespace input, ConstraintResolver limits, case-insensitivity) |
| **B2.6** | AuthService tests with Moq | ✅ CODE DONE | `AuthServiceTests.cs` (9 tests: register, login BCrypt verify, wrong password, refresh token lifecycle, JWT generation via IConfiguration mock) |
| **B2.7** | GamificationService & QuizService tests | ✅ CODE DONE | `GamificationServiceTests.cs` (7 tests), `QuizServiceTests.cs` (9 tests: submit all-correct/all-wrong, XP award verify, answer count validation) |
| **B2.8** | FluentValidation tests | ✅ CODE DONE | `AuthValidatorTests.cs` (18 tests: email/username/password rules via TestValidate), `QuizValidatorTests.cs` (7 tests: GUID/answers/XP range) |
| **B2.9** | GitHub Actions CI/CD | ✅ CODE DONE | `.github/workflows/ci.yml` — frontend (npm ci, lint, typecheck, test) + backend (dotnet restore, build, test) on push/PR to master |
| **B2.10** | Build fixes | ✅ CODE DONE | `Infrastructure.csproj` +JwtBearer, `WebApi.csproj` +HealthChecks.EntityFrameworkCore — resolve missing package refs |

**Test Results:** 139 tests ALL PASS (88 Domain + 25 Application + 26 Infrastructure) — 0 failures

## 10. Phase B3: Frontend-Backend Integration

| Task | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **B3.1** | HTTP API Client Service | ✅ CODE DONE | `frontend/src/services/apiClient.ts` — fetch wrapper, JWT Bearer injection, auto-refresh on 401, RFC 7807 error handling |
| **B3.2** | Auth Store (useAuthStore) | ✅ CODE DONE | `frontend/src/features/auth/store/useAuthStore.ts` — Pinia store: login/register/logout/fetchCurrentUser, JWT localStorage |
| **B3.3** | Gamification → Backend Integration | ✅ CODE DONE | `useGamificationStore.ts` — earnXPWithSync, syncProgressFromServer, checkBadgesFromServer; `gamificationApi.ts` API service |
| **B3.4** | Quiz → Backend Integration | ✅ CODE DONE | `useQuizStore.ts` — fetchQuizzesFromServer, submitAttemptToServer, fetchQuizHistory; `quizApi.ts` API service |
| **B3.5** | Leaderboard API | ✅ CODE DONE | Backend: `LeaderboardController.cs` — GET /api/leaderboard top N by XP; Frontend: `leaderboardApi.ts`, `fetchLeaderboardFromServer()` |
| **B3.6** | Learning Path → Backend Integration | ✅ CODE DONE | Backend: `LearningProgressController.cs` — GET/POST progress; Frontend: `learningProgressApi.ts`, `syncProgressFromServer()` |
| **B3.7** | Unit Tests for B3 Services | ✅ CODE DONE | `apiClient.spec.ts` (15), `useAuthStore.spec.ts` (8), `gamificationApi.spec.ts` (8), `quizApi.spec.ts` (8) — 39 tests ALL PASS |

**Test Results:** 1506+ frontend tests pass (39 new B3 tests) + 139 backend tests — 1 pre-existing frontend failure

## 11. Phase B4: Performance & Caching

| Task | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **B4.1** | IMemoryCache Service | ✅ CODE DONE | `ICacheService.cs` interface + `MemoryCacheService.cs` — ConcurrentDictionary key tracking, prefix-based eviction |
| **B4.2** | Cache Constants & Durations | ✅ CODE DONE | `CacheKeys.cs` — algorithm 24h, quiz 30m, badge 1h, leaderboard 5m |
| **B4.3** | Response Caching Middleware | ✅ CODE DONE | `[ResponseCache]` on GET endpoints — algo 3600s, quiz 300s, badge 600s |
| **B4.4** | ETag Conditional GET | ✅ CODE DONE | `AlgorithmsController.cs` — SHA256-based weak ETag, HTTP 304 Not Modified |
| **B4.5** | PagedResult<T> DTO | ✅ CODE DONE | `PagedResult.cs` — Items, Page, PageSize, TotalCount, TotalPages, HasPrevious/NextPage |
| **B4.6** | Repository Pagination | ✅ CODE DONE | `IRepository.cs` — CountAsync, GetPagedAsync; `Repository.cs` — Skip/Take + AsNoTracking |
| **B4.7** | AsNoTracking Optimization | ✅ CODE DONE | All read-only queries (GetAllAsync, FindAsync, GetPagedAsync) use AsNoTracking() |
| **B4.8** | Paginated Endpoints | ✅ CODE DONE | Quiz history + leaderboard `?page=1&pageSize=10` (max 50) |
| **B4.9** | Algorithm/Quiz/Badge Caching | ✅ CODE DONE | Caching with invalidation on write operations |
| **B4.10** | LeaderboardController (paginated) | ✅ CODE DONE | `LeaderboardController.cs` — GET /api/leaderboard, cached 5m |
| **B4.11** | Unit Tests | ✅ CODE DONE | `MemoryCacheServiceTests.cs` (12), `PagedResultTests.cs` (12), `CacheKeysTests.cs` (9) — 33 tests ALL PASS |

**Test Results:** 173 backend tests pass (33 new B4 tests) — 1 pre-existing frontend failure

## 12. Phase B5: Real-time SignalR

| Task | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **B5.1** | SignalR Configuration | ✅ CODE DONE | `Program.cs` — AddSignalR, JWT query string support for `/hubs/*`, CORS AllowCredentials |
| **B5.2** | LeaderboardHub | ✅ CODE DONE | `LeaderboardHub.cs` — real-time leaderboard push via group "leaderboard", auto join/leave on connect/disconnect |
| **B5.3** | NotificationHub | ✅ CODE DONE | `NotificationHub.cs` — [Authorize], user-specific groups `user:{userId}`, badge/level-up notifications |
| **B5.4** | QuizRoomHub | ✅ CODE DONE | `QuizRoomHub.cs` — CreateRoom, JoinRoom, LeaveRoom, StartQuiz, SubmitAnswer, NextQuestion, GetActiveRooms |
| **B5.5** | IQuizRoomService | ✅ CODE DONE | `IQuizRoomService.cs` interface + `QuizRoomService.cs` — ConcurrentDictionary-based in-memory room management, 6-char room codes |
| **B5.6** | IEventBroadcaster | ✅ CODE DONE | `IEventBroadcaster.cs` (Application layer) + `SignalREventBroadcaster.cs` (WebApi layer) — clean architecture abstraction for hub broadcasting |
| **B5.7** | GamificationService SignalR Integration | ✅ CODE DONE | AwardXPAsync → BroadcastLeaderboardUpdate + LevelUp; CheckAndAwardBadgesAsync → BroadcastBadgeNotification |
| **B5.8** | QuizWithAnswersDto | ✅ CODE DONE | `IQuizService.cs` — GetQuizWithAnswersAsync for server-side answer validation (CorrectIndex included for hub only) |
| **B5.9** | Frontend SignalR Store | ✅ CODE DONE | `useSignalRStore.ts` — Pinia store: 3 hub connections (leaderboard/notifications/quiz-room), auto-reconnect, all hub events |
| **B5.10** | Frontend SignalR Types | ✅ CODE DONE | `signalr.types.ts` — LeaderboardUpdate, BadgeNotification, LevelUpNotification, QuizRoomDto, QuizRoomStatus, SignalRConnectionState |
| **B5.11** | Backend Unit Tests | ✅ CODE DONE | `QuizRoomServiceTests.cs` (27), `SignalRDtosTests.cs` (12) — 39 tests ALL PASS |
| **B5.12** | Frontend Unit Tests | ✅ CODE DONE | `useSignalRStore.spec.ts` (35), `signalr.types.spec.ts` (9) — 44 tests ALL PASS |

**Test Results:** 212+ backend tests (39 new B5) + 1550+ frontend tests (44 new B5) — 1 pre-existing frontend failure

## 13. Phase S1: Sandbox 100-Line Limit Compliance

| Task | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **S1.1** | State Sandbox Refactoring | ✅ CODE DONE | Tách positioning logic sang `StatePositioner.ts`; rút gọn `CallStackEngine.ts` dưới 100 dòng. |
| **S1.2** | OOP Sandbox Refactoring | ✅ CODE DONE | Tách Shape definitions sang `OOPClassRegistry.ts` (rút gọn `OOPSandbox.vue`); tách access check sang `OOPAccessChecker.ts` (rút gọn `OOPReflectionEngine.ts`). |
| **S1.3** | System Sandbox Refactoring | ✅ CODE DONE | Tách SVG server icons sang `ServerIcon.vue`; rút gọn `TopologyCanvas.vue` dưới 100 dòng. |
| **S1.4** | Algorithm Sandbox Refactoring | ✅ CODE DONE | Rút gọn `AlgorithmCanvas.vue`, `GraphPlayground.vue`, `useAnimatedItems.ts`, `CustomInputParser.ts`, `ForceDirectedLayout.ts` dưới 100 dòng. |
| **S1.5** | Unit Test Fixes & Verification | ✅ CODE DONE | Khắc phục lỗi test timeout trong `useInputStore.spec.ts` bằng cách mock `fetch`. Tất cả test case đã pass. |

## 14. Phase S2: Sorting Visualizer UX Refactoring & Component Modularization

| Task | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **S2.1** | Quick Sort Visualizer Modularization | ✅ CODE DONE | Tách `QuickSortVisualizer.vue` thành `LomutoInspector.vue` và `PartitionStack.vue`. Cải thiện chiều cao co giãn dọc của dashboard. |
| **S2.2** | Quick Sort Active/Dim/Hover Highlight | ✅ CODE DONE | Áp dụng cơ chế làm mờ các phần tử ngoài phân đoạn đang xét (opacity 0.2), hover hiển thị khoảng chỉ số phân đoạn, và pivot có icon ngôi sao vàng. |
| **S2.3** | Merge Sort Recursion Tree Layout | ✅ CODE DONE | Thiết kế lại `MergeSortVisualizer.vue` hiển thị cây nhị phân đệ quy (Recursion Tree) theo dạng lưới căn chỉnh absolute dựa trên phần trăm `left` và `width` tương ứng với phân đoạn cha. |
| **S2.4** | Merge Sort Level Labels & Phase Badge | ✅ CODE DONE | Thêm nhãn Tầng đệ quy (Tầng 0, Tầng 1, v.v.) bên trái và nhãn badge chỉ định trạng thái đệ quy (Split Phase ⬇ / Merge Phase ⬆) ở trên cùng. |
| **S2.5** | Merge Inspector UI | ✅ CODE DONE | Tạo mới `MergeInspector.vue` để theo dõi và mô phỏng so sánh phần tử mảng con trái `L[i]` vs phải `R[j]`, và thao tác ghi đè mảng chính tại index `k`. |
| **S2.6** | Unit Testing & Build Validation | ✅ CODE DONE | Xác thực toàn bộ 1514 unit tests pass của Vitest và quá trình compile build sản xuất thành công với zero lỗi. |
| **S2.7** | Fix Merge Sort Animation Stutter & Base Case | ✅ CODE DONE | Sử dụng chỉ số mảng ổn định làm khóa, thêm hiệu ứng phình to `.animate-pop-flash` khi ghi đè, phát frame cho trường hợp cơ sở trong `mergeSort.ts`, và highlight Amber các phần tử thuộc mảng con đang trộn. |
| **S2.8** | Fix Merge Sort Recursion Tree Height Collapse | ✅ CODE DONE | Thêm class `shrink-0` vào các tầng đệ quy trong `MergeSortVisualizer.vue` để ngăn chặn hiện tượng co rút chiều cao và chồng lấp các node mảng con. |

| Theme System (skillsmp.io) | ✅ CODE DONE | theme.css (overwrite), AlgorithmDashboard.vue, LomutoInspector.vue, MergeInspector.vue, SortingDetailPanel.vue, BubbleSortVisualizer.vue | ADR-39 |
| CSS Variables Refactoring (Phần còn lại) | ✅ CODE DONE | lockRenderer.ts, PlaygroundCanvas.vue, playgroundCanvasDraw.ts, ExportShareWorkspace.vue, QRCodeDisplay.vue, LiveWidgetPreview.vue, LectureOverlay.vue, LectureNavigation.vue, TubeRenderer.vue, TreeRenderer.vue, treeCanvasHelpers.ts, boxArrayRenderHelpers.ts, DebugWorkspace.vue, compareCanvasDraw.ts, CanvasLayer.vue, canvasMathHelpers.ts, MonacoEditorPanel.vue, CompareVcrControls.vue | ADR-39 |

## 15. Phase 2 Reorganization — Clean Sidebar & Consolidated Modules

| Hạng mục / Task | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Sidebar Groups** | Tái cấu trúc sidebar thành các nhóm Algorithms, Concepts, Sandbox | ✅ CODE DONE | `appTabs.ts`, `App.vue` — Cấu trúc phân nhóm trực quan, phẳng hóa tự động trên Mobile |
| **Router Clean** | Vô hiệu hóa các route phụ, cập nhật Sandbox | ✅ CODE DONE | `routes.ts` — Vô hiệu hóa 12 routes đã gộp/hoãn, cập nhật title 'Sandbox' cho playground |
| **Code Debugger** | Gộp Workspace, Live Debugger, và State Inspector vào một view | ✅ CODE DONE | `CodeIDEView.vue` — Tab bar switcher với KeepAlive giữ trạng thái editor |
| **DSA Integration** | Tích hợp các thuật toán DSA Modules vào Sorting & Graph | ✅ CODE DONE | `DSAPlayer.vue`, `AlgorithmDashboard.vue`, `SortingView.vue`, `GraphView.vue` — Lọc thuật toán phù hợp qua `allowedCategories`, ẩn mục đề xuất (featured/recommend) khi xem sub-tabs |

## 16. Phase 4 — Software Architecture Modules Full-Stack Integration (SOLID, Design Patterns, DI/IoC)

| Hạng mục / Task | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Backend Strategies** | 3 IConceptStrategy implementations (SOLID, Design Patterns, DI/IoC) | ✅ CODE DONE | `SOLIDPrinciplesStrategy.cs` (SRP/OCP/LSP — 4 frames each), `DesignPatternsStrategy.cs` (Strategy/Observer/Singleton — 4 frames each), `DIContainerStrategy.cs` (Lifetime 5 frames, Cycle 4 frames) |
| **Backend DTOs** | Frame DTOs for all 3 modules | ✅ CODE DONE | `SOLIDFrameDto.cs`, `DesignPatternFrameDto.cs`, `DIContainerFrameDto.cs` — Vietnamese explanation text in C# |
| **Backend Controllers** | REST API endpoints for 3 modules | ✅ CODE DONE | `SOLIDController.cs` (`/api/v1/concepts/solid/`), `DesignPatternsController.cs` (`/api/v1/concepts/design-patterns/`), `DIContainerController.cs` (`/api/v1/concepts/di-container/`) |
| **Frontend API Layers** | Service layers calling backend | ✅ CODE DONE | `solidApi.ts`, `designPatternsApi.ts`, `diContainerApi.ts` — async fetch with error handling |
| **Frontend Store VCR** | Pinia stores with VCR integration | ✅ CODE DONE | `useSOLIDVisualizerStore.ts`, `useDesignPatternStore.ts`, `useDIContainerStore.ts` — loadVcrScenario(), vcrNext/Prev/Reset/exitVcrMode |
| **VCR UI — SOLID** | Scenario Picker + VCR Panel + Explanation Banner | ✅ CODE DONE | `SOLIDVisualizerWorkspace.vue` — 3 scenario buttons (SRP/OCP/LSP), frame navigation, Vietnamese banner, v-if sandbox toggle |
| **VCR UI — Design Patterns** | Scenario Picker + VCR Panel + Explanation Banner | ✅ CODE DONE | `DesignPatternsWorkspace.vue` — 3 scenario buttons (Strategy/Observer/Singleton), frame navigation, Vietnamese banner, v-if sandbox toggle |
| **VCR UI — DI/IoC** | Scenario Picker + VCR Panel + Explanation Banner | ✅ CODE DONE | `DISandbox.vue` — 2 scenario buttons (Lifetime Demo/Cycle Detection), frame navigation, Vietnamese banner, v-if sandbox toggle |
| **E2E Testing** | Browser verification all 3 modules | ✅ CODE DONE | 9/9 API tests passed (curl), 3/3 VCR UI tests passed (browser recording) — Vietnamese text confirms API connectivity |

## 17. Phase 5 — Quiz System & Gamification Engine Full-Stack Integration

| Hạng mục / Task | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Quiz Backend Strategy** | Stateless quiz bank with 6 quizzes (27 questions total) | ✅ CODE DONE | `QuizBankStrategy.cs` — Vietnamese questions/explanations for sorting, graph, OOP, SOLID, design-patterns, DI topics |
| **Quiz Backend DTOs** | Stateless quiz data contracts | ✅ CODE DONE | `QuizFrameDto.cs` — `StatelessQuizDto`, `StatelessQuestionDto`, `StatelessQuizAttemptRequest/Result` |
| **Quiz Controller** | REST API endpoints for quiz CRUD + grading | ✅ CODE DONE | `StatelessQuizController.cs` (`/api/v1/concepts/quiz/`) — GET all/topics/{id}/topic/{topic}, POST submit |
| **Gamification Backend Strategy** | Stateless XP/level/badge/leaderboard engine | ✅ CODE DONE | `GamificationStrategy.cs` — 8 levels, 8 badges, mock leaderboard (10 entries), XP award with auto badge unlock |
| **Gamification Controller** | REST API for profile/XP/badges/leaderboard | ✅ CODE DONE | `StatelessGamificationController.cs` (`/api/v1/concepts/gamification/`) — GET profile/badges/leaderboard/config, POST award-xp |
| **Frontend Quiz API** | Service layer calling backend quiz endpoints | ✅ CODE DONE | `statelessQuizApi.ts` — getAllQuizzes(), getQuizById(), submitAttempt() with typed responses |
| **Frontend Quiz Store** | Pinia store backend quiz mode integration | ✅ CODE DONE | `useQuizStore.ts` — loadQuizCatalog(), startBackendQuiz(), selectBackendAnswer(), submitBackendQuiz(), exitBackendQuiz() |
| **Frontend Quiz UI** | BackendQuizWorkspace component | ✅ CODE DONE | `BackendQuizWorkspace.vue` — quiz catalog grid, question flow with A/B/C/D options, navigation, result card with explanations |
| **Frontend Gamification API** | Service layer calling backend gamification endpoints | ✅ CODE DONE | `statelessGamificationApi.ts` — getProfile(), awardXp(), getBadges(), getLeaderboard() |
| **Frontend Gamification Store** | Pinia store backend integration | ✅ CODE DONE | `useGamificationStore.ts` — loadBackendProfile(), awardXpViaBackend(), loadBackendBadges(), loadBackendLeaderboard() |
| **Frontend Gamification UI** | GamificationWorkspace backend integration | ✅ CODE DONE | `GamificationWorkspace.vue` — server profile display, backend leaderboard, backend badges, +50 XP via API |
| **Route Activation** | Quiz + Gamification routes enabled | ✅ CODE DONE | `routes.ts` — `/#/quiz` (BackendQuizView), `/#/gamification` (GamificationEngineView) |
| **DI Registration** | Singleton strategies in DI container | ✅ CODE DONE | `AlgorithmDIConfiguration.cs` — `QuizBankStrategy`, `GamificationStrategy` registered |
| **Vietnamese Test Guide** | Manual testing documentation | ✅ CODE DONE | `huong-dan-kiem-thu-giai-doan-3.md` — 16 test cases covering API + UI |
| **Compilation** | dotnet build 0 errors + vue-tsc 0 errors | ✅ CODE DONE | Backend 0 errors (42 pre-existing warnings), Frontend vue-tsc --noEmit clean |

## 18. Phase 6 — Authentication & User Management Infrastructure

| Hạng mục / Task | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Backend Auth Strategy** | Stateless in-memory auth (register/login/refresh/logout) | ✅ CODE DONE | `StatelessAuthStrategy.cs` — ConcurrentDictionary user store, SHA256 password hashing, mock JWT generation, refresh token rotation |
| **Backend Auth DTOs** | Domain-layer DTOs for auth flow | ✅ CODE DONE | `StatelessAuthDto.cs` — `StatelessAuthResponse`, `StatelessUserDto`, `StatelessRegisterRequest`, `StatelessLoginRequest`, `StatelessUserProgressDto` |
| **Backend Auth Controller** | REST API for auth + profile + progress | ✅ CODE DONE | `StatelessAuthController.cs` (`/api/v1/concepts/auth/`) — POST register/login/refresh/logout, GET me/progress/demo-credentials, PUT profile, POST award-xp |
| **Frontend Auth API** | Service layer for stateless auth endpoints | ✅ CODE DONE | `statelessAuthApi.ts` — register(), login(), refresh(), logout(), getMe(), getProgress(), updateProfile() |
| **Frontend Auth Store** | Pinia store stateless backend integration | ✅ CODE DONE | `useAuthStore.ts` — statelessLogin(), statelessRegister(), statelessLogout(), statelessInit(), loadStatelessProfile() with localStorage persistence |
| **Login Modal** | Full login/register modal component | ✅ CODE DONE | `LoginModal.vue` — Teleport modal with email/password form, register toggle, error display, demo credentials info |
| **App.vue Integration** | Login modal + header user badge + session init | ✅ CODE DONE | `App.vue` — LoginModal wired, handleLogout detects stateless mode, onMounted calls statelessInit() for session persistence |
| **API Base URL Fix** | Standardized port 5000 → 5050 across all services | ✅ CODE DONE | Fixed 12 files: authApi.ts, userProgressApi.ts, oopApi.ts, systemDesignApi.ts, apiClient.ts (×2), signalR, quizApi, paymentApi, LeaderboardPanel, inputStore, algorithmApi |
| **DI Registration** | Singleton strategy in DI container | ✅ CODE DONE | `AlgorithmDIConfiguration.cs` — `StatelessAuthStrategy` registered |
| **Vietnamese Test Guide** | Manual testing documentation | ✅ CODE DONE | `huong-dan-kiem-thu-giai-doan-4.md` — 17 test cases covering API + UI |
| **Compilation** | dotnet build 0 errors + vue-tsc 0 errors | ✅ CODE DONE | Backend 0 errors, Frontend vue-tsc --noEmit clean |

## 19. Phase 7 — Payment Integration & Premium Feature System

| Hạng mục / Task | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Backend Payment Strategy** | Stateless in-memory payment (checkout/verify/webhook/premium status) | ✅ CODE DONE | `StatelessPaymentStrategy.cs` — ConcurrentDictionary order store, VietQR URL generation, simulate webhook, premium user tracking, feature access gating, transaction log |
| **Backend Payment DTOs** | Domain-layer DTOs for payment flow | ✅ CODE DONE | `StatelessPaymentDto.cs` — `StatelessOrderDto`, `StatelessCheckoutRequest`, `StatelessVerifyRequest`, `StatelessPaymentConfigDto`, `StatelessPremiumStatusDto`, `StatelessTransactionLogEntry` |
| **Backend Payment Controller** | REST API for payment + premium status | ✅ CODE DONE | `StatelessPaymentController.cs` (`/api/v1/concepts/payment/`) — POST checkout/verify/simulate-webhook, GET config/orders/{id}/status/premium-status/check-access/transactions |
| **Frontend Payment API** | Service layer for stateless payment endpoints | ✅ CODE DONE | `statelessPaymentApi.ts` — checkout(), verify(), getOrderStatus(), simulateWebhook(), getPremiumStatus(), checkFeatureAccess(), getTransactions() |
| **Frontend Payment Store** | Pinia store for checkout flow + premium status | ✅ CODE DONE | `usePaymentStore.ts` — startCheckout(), verifyPayment(), simulatePaymentSuccess(), loadPremiumStatus(), checkFeatureAccess(), isPremium computed |
| **PremiumCheckoutView** | Refactored to use stateless payment store | ✅ CODE DONE | `PremiumCheckoutView.vue` — uses usePaymentStore instead of direct API calls, removed `any` type, added simulate webhook button, verifying state |
| **Premium Crown Badge** | Header premium visual indicators | ✅ CODE DONE | `App.vue` — 👑 crown with glow animation, gold avatar gradient, "PRO" tag, premium-specific CSS classes |
| **PremiumGate Component** | Feature gatekeeping for premium content | ✅ CODE DONE | `PremiumGate.vue` — blur overlay + upgrade CTA for non-premium users, slot-based wrapping |
| **Sidebar Premium Tab** | Account group with Premium navigation | ✅ CODE DONE | `appTabs.ts` — "Account" group with "Premium" tab → `/#/checkout` |
| **Payment Polling Fix** | Removed `any` from usePaymentPolling | ✅ CODE DONE | `usePaymentPolling.ts` — `onError?: (err: unknown)` replaces `err: any` |
| **DI Registration** | Singleton strategy in DI container | ✅ CODE DONE | `AlgorithmDIConfiguration.cs` — `StatelessPaymentStrategy` registered |
| **Vietnamese Test Guide** | Manual testing documentation | ✅ CODE DONE | `huong-dan-kiem-thu-giai-doan-5.md` — 15 test cases covering API + UI |
| **Compilation** | dotnet build 0 errors + vue-tsc 0 errors | ✅ CODE DONE | Backend 0 errors, Frontend vue-tsc --noEmit clean |

## 20. Project Polish — Global Error Handling, Toast & Skeleton Loaders

| Hạng mục / Task | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Error Handling Middleware** | Enhanced structured JSON response format | ✅ CODE DONE | `ErrorHandlingMiddleware.cs` — `{ success, message, errorType, statusCode, traceId, path, timestamp }` + Development-only debug fields (detail, exception, stackTrace). Maps 7 exception types to HTTP codes + Vietnamese messages |
| **Diagnostics Controller** | Test error simulation endpoints | ✅ CODE DONE | `DiagnosticsController.cs` — GET health + GET simulate-error?type=500/400/404/401/409/501 |
| **Toast Notification System** | Pinia store + Teleport component | ✅ CODE DONE | `useToast.ts` — `success()`, `error()`, `warning()`, `info()`, `handleApiError()`, auto-dismiss, max 5 toasts. `ToastContainer.vue` — slide-in/out animation, progress bar, Vietnamese labels |
| **Skeleton Loaders** | Shimmer loading components | ✅ CODE DONE | `SkeletonLoader.vue` — 4 variants (text/card/circle/rect) with shimmer wave animation. `SkeletonCard.vue` — compound card skeleton. Integrated into `AlgorithmDashboard.vue` (6 cards) + `BackendQuizWorkspace.vue` (6 cards) |
| **Page Transitions** | Enhanced slide-up + fade transitions | ✅ CODE DONE | `App.vue` — enter: translateY(8px)→0 + opacity 0→1 (0.2s), leave: translateY(0)→-4px + opacity 1→0 (0.12s) |
| **Vietnamese Test Guide** | Manual testing documentation | ✅ CODE DONE | `huong-dan-nghiem-thu-chuyen-nghiep.md` — 20 test cases covering API error simulation + UI toast/skeleton/transitions |
| **Compilation** | dotnet build 0 errors + vue-tsc 0 errors | ✅ CODE DONE | Backend 0 errors, Frontend vue-tsc --noEmit clean |

## 21. Cinematic UI/UX Upgrades — Motion Frameworks, Confetti & Glassmorphism

| Hạng mục / Task | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Dependencies** | canvas-confetti + @vueuse/motion | ✅ CODE DONE | npm install canvas-confetti @vueuse/motion @types/canvas-confetti. MotionPlugin registered in main.ts |
| **Confetti Celebrations** | Epic reward blasts | ✅ CODE DONE | `useConfetti.ts` — `firePremium()` (3s gold cascade + grand finale burst), `fireQuizPass()` (rainbow center burst + dual sides). Integrated into PremiumCheckoutView (on payment success) + BackendQuizWorkspace (on quiz pass via watch) |
| **VCR Timeline Physics** | Cinematic easing upgrade | ✅ CODE DONE | BoxArrayRenderer.vue — easeOutCubic→easeOutQuart, duration 350ms→420ms. VCR banners in SOLID/Patterns/DI wrapped with `<Transition name="vcr-banner-fade">` + slide+scale animation |
| **Glassmorphism** | Ultra-modern glass panels | ✅ CODE DONE | Sidebar: blur(20px) saturate(1.4) rgba(15,23,42,0.55). Header: blur(16px) saturate(1.3). Login Modal: blur(24px) saturate(1.5) + scale spring transition. Dashboard Cards: blur(12px) + spring hover translateY(-4px) scale(1.015) |
| **Motion Utilities** | Global cinematic CSS | ✅ CODE DONE | `cinematic.css` — .spring-hover (cubic-bezier 0.34,1.56), .glass-panel, .vcr-frame-enter (slide+blur), .vcr-active-glow, .stagger-enter. Imported via style.css |
| **Compilation** | dotnet build 0 errors + vue-tsc 0 errors | ✅ CODE DONE | Backend 0 errors, Frontend vue-tsc --noEmit clean, 0 any usages |

## 22. Deep Architecture Refactoring — Clean Architecture & Component De-duplication

| Hạng mục / Task | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Design Tokens** | Centralized premium tokens CSS | ✅ CODE DONE | `assets/styles/design-tokens.css` — 65+ CSS variables: glassmorphism (--glass-bg/blur/border), neon glow (--glow-accent), spring physics (--ease-spring), VCR theme (--vcr-accent), animation durations. Imported globally via style.css |
| **VcrControls.vue** | Shared VCR playback component | ✅ CODE DONE | `components/VcrControls.vue` — Props: currentIndex, totalFrames. Events: prev/next/reset/exit. BEM naming. Uses design tokens for all styles |
| **ConceptScenarioPicker.vue** | Shared scenario picker | ✅ CODE DONE | `components/ConceptScenarioPicker.vue` — Props: scenarios[], label, loading. Event: select. ScenarioOption interface exported |
| **VcrExplanationBanner.vue** | Shared VCR explanation banner | ✅ CODE DONE | `components/VcrExplanationBanner.vue` — Props: actionType, explanation, frameKey. Uses vcr-banner-fade transition from cinematic.css |
| **Component De-duplication** | SOLID/Patterns/DI workspaces | ✅ CODE DONE | Removed ~200 lines of duplicated VCR CSS/HTML from 3 workspace components. All now use shared VcrControls + ConceptScenarioPicker + VcrExplanationBanner |
| **cinematic.css Tokens** | Token-based motion utilities | ✅ CODE DONE | Refactored all hardcoded values to design tokens (var(--duration-*), var(--ease-*), var(--glass-*), var(--shadow-*)) |
| **Backend OCP** | Reflection-based DI registration | ✅ CODE DONE | AlgorithmDIConfiguration: generic RegisterByInterface<T>() method scans assembly. IConceptStrategy now auto-registered via reflection like IAlgorithmStrategy. Adding new concept = 0 edits to DI config |
| **Domain Isolation** | Zero outward dependencies | ✅ CODE DONE | Domain.csproj: 0 project references. 0 imports from Application/Infrastructure/WebApi. Perfect Clean Architecture onion |
| **Compilation** | dotnet build 0 errors + vue-tsc 0 errors | ✅ CODE DONE | Backend 0 errors, Frontend vue-tsc --noEmit clean, 0 any usages |

## 23. Bug-Squashing & UI/UX Edge-Case Polish

| Hạng mục / Task | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **BUG-1: Graph Sidebar Overflow** | Fix layout collapse in CustomInputPanel | ✅ CODE DONE | Added `overflow-hidden` to root, `flex-1 overflow-y-auto` to build tab, `shrink-0` to bottom section, removed `-mx-4` negative margin hack |
| **BUG-2: Graph VCR Canvas** | Fix canvas disappearance on mode switch | ✅ CODE DONE | `PlaygroundCanvas.vue`: guard `resizeCanvas()` against zero dimensions (prevent NaN coordinate scaling). `InteractivePlayground.vue`: `min-h-[200px]` on canvas container to prevent flex collapse |
| **BUG-3: DI Select Dropdown** | Fix white-on-white option text in dark mode | ✅ CODE DONE | Added scoped CSS `option { background-color: var(--color-bg-secondary); color: var(--color-text-primary); }` to DIResolutionDemo, EdgeBuilderForm, CustomInputPanel |
| **BUG-4: Patterns Layout** | Fix narrow canvas strip with empty black sides | ✅ CODE DONE | `PatternsView.vue`: removed `items-center justify-center`, added `w-full p-4`. `DesignPatternsWorkspace.vue`: added `width: 100%`. `DesignPatternsCanvas.vue`: `height: 100%; min-height: 400px` + ResizeObserver for responsive width |
| **BUG-5: Port Standardization** | Lock Vite dev server to port 5173 | ✅ CODE DONE | `vite.config.ts`: added `server: { port: 5173, strictPort: true }` |
| **Compilation** | dotnet build 0 errors + vue-tsc 0 errors | ✅ CODE DONE | Backend 0 errors (42 warnings, pre-existing), Frontend vue-tsc --noEmit clean |

## 24. Automation Bootstrapper & Port Standardization

| Hạng mục / Task | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **run-project.bat** | Windows 1-click startup script | ✅ CODE DONE | Spawns backend (`dotnet run --urls http://localhost:5055`) and frontend (`VITE_API_BASE_URL=http://localhost:5055 npm run dev`) in separate terminal windows |
| **run-project.sh** | macOS/Linux 1-click startup script | ✅ CODE DONE | Background jobs with trap-based cleanup (SIGINT/SIGTERM), PID tracking, graceful shutdown |
| **Port Migration 5050→5055** | 21 frontend service files updated | ✅ CODE DONE | All `localhost:5050` fallbacks changed to `localhost:5055` across API services, stores, and apiClient.ts |
| **Test Guides Updated** | 4 Vietnamese test guides | ✅ CODE DONE | `huong-dan-kiem-thu-giai-doan-{3,4,5}.md` + `huong-dan-nghiem-thu-chuyen-nghiep.md` — all curl commands updated to port 5055 |
| **Compilation** | dotnet build 0 errors + vue-tsc 0 errors | ✅ CODE DONE | Backend Build succeeded, Frontend vue-tsc --noEmit clean |

## 25. Code Debugger — Resilience & Security Hardening

| Hạng mục / Task | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Syntax Error Toast** | useToastStore.error() on AST compile failure | ✅ CODE DONE | `useLiveDebuggerStore.ts`: fires Vietnamese toast "Mã nguồn có lỗi cú pháp..." on compileResult.success=false and runtime eval errors |
| **Infinite Loop Toast** | useToastStore.warning() on loop guard trigger | ✅ CODE DONE | Pattern-matches loop guard errors (`/gioi han an toan.*buoc lap/`) across stepForward, continueToNextBreakpoint, stepOut — fires "Phát hiện vòng lặp vô hạn..." |
| **Loop Guard (pre-existing)** | __loopCounter > 5000 AST injection | ✅ CODE DONE | `DebuggerYieldEngine.ts`: LOOP_LIMIT=5000 injected into for/while/do-while at compile time |
| **Recursion Guard (pre-existing)** | __recursionDepth > 500 | ✅ CODE DONE | MAX_RECURSION_DEPTH=500 injected into generator functions |
| **walkthrough.md** | Security hardening documentation | ✅ CODE DONE | Formal documentation of all 5 protection layers with thresholds and notification types |
| **Compilation** | dotnet build 0 errors + vue-tsc 0 errors | ✅ CODE DONE | Backend Build succeeded, Frontend vue-tsc --noEmit clean |

## 26. EF Core PostgreSQL Persistence — Auth & Gamification

| Hạng mục / Task | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Auth Registration → DB** | POST /register saves User to PostgreSQL | ✅ CODE DONE | `StatelessAuthController.Register()`: creates `User` entity with SHA256 hash, `SaveChangesAsync()` to Users table |
| **Auth Login → DB** | POST /login updates LastLoginAt in DB | ✅ CODE DONE | `StatelessAuthController.Login()`: calls `dbUser.RecordLogin()` + `SaveChangesAsync()` |
| **Auth AwardXP → DB** | POST /award-xp persists XP to DB | ✅ CODE DONE | `StatelessAuthController.AwardXP()`: calls `dbUser.AwardXP()` + `RecordActivity()` |
| **Gamification Leaderboard → DB** | GET /leaderboard reads from Users table | ✅ CODE DONE | `StatelessGamificationController.GetLeaderboard()`: queries Users ordered by TotalXP desc, maps to StatelessLeaderboardEntry |
| **Gamification AwardXp → DB** | POST /award-xp persists demo user XP | ✅ CODE DONE | Updates demo@visualizationdsa.dev user in PostgreSQL |
| **Seed 10 Vietnamese Users** | DbSeeder.SeedLeaderboardUsersAsync() | ✅ CODE DONE | 10 users with varying XP/levels: NguyenVanA (2850), TranThiB (2200), ..., VisualizationDSA Student (150) |
| **EF Migrations Applied** | 5 existing migrations applied to fresh PostgreSQL | ✅ CODE DONE | Users, Badges, UserBadges, RefreshTokens, Orders, Quizzes, QuizQuestions, QuizAttempts, LearningProgresses |
| **Compilation** | dotnet build 0 errors + vue-tsc 0 errors | ✅ CODE DONE | Backend Build succeeded, Frontend vue-tsc clean |

---

## 27. Platform Overhaul (continued in section 28)

---

## 28. System-Wide Hardening — DB Integration for Auth/Quiz/Payment + Port Sweep

| Tính năng | Chi tiết | Trạng thái | Files liên quan |
| :--- | :--- | :--- | :--- |
| **Auth Login → DB sync** | Login response overrides Role/IsPremium/TotalXP/CurrentLevel from PostgreSQL | ✅ CODE DONE | `StatelessAuthController.Login()` |
| **Auth Register → role sync** | Register response explicitly sets Role = "Student" | ✅ CODE DONE | `StatelessAuthController.Register()` |
| **Quiz manage → DB** | POST /quiz/manage persists Quiz + QuizQuestions to PostgreSQL via EF Core | ✅ CODE DONE | `StatelessQuizController.ManageQuiz()` |
| **Payment verify → DB** | POST /payment/verify persists isPremium=true to Users table | ✅ CODE DONE | `StatelessPaymentController.Verify()` + `PersistPremiumStatus()` |
| **Payment webhook → DB** | POST /payment/simulate-webhook persists isPremium=true to Users table | ✅ CODE DONE | `StatelessPaymentController.SimulateWebhook()` + `PersistPremiumStatus()` |
| **Port sweep SKILL.md** | 18 references localhost:5050 → localhost:5055 in testing skill | ✅ CODE DONE | `.agents/skills/testing-custom-input/SKILL.md` |
| **Compilation** | dotnet build 0 errors + vue-tsc 0 errors | ✅ CODE DONE | Backend Build succeeded, Frontend vue-tsc clean |

---

## 27. Platform Overhaul — Landing Page, Dashboard Hub, Multi-Role (Student/Teacher), Teacher Panel

| Tính năng | Chi tiết | Trạng thái | Files liên quan |
| :--- | :--- | :--- | :--- |
| **Landing Page** | `/#/` for unauthenticated users, neon gradients, glassmorphic feature grid, stats bar | ✅ CODE DONE | `frontend/src/views/LandingView.vue` |
| **Dashboard Hub** | `/#/dashboard` for authenticated users, greeting banner, XP progress wheel, top 3 badges, quick links | ✅ CODE DONE | `frontend/src/views/DashboardView.vue` |
| **User.Role (Backend)** | Student/Teacher role on User entity, StatelessAuthStrategy, StatelessUserDto, DbContext config | ✅ CODE DONE | `User.cs`, `StatelessAuthStrategy.cs`, `StatelessAuthDto.cs`, `ApplicationDbContext.cs` |
| **EF Migration: AddUserRole** | Adds Role column (varchar 20, default 'Student') to Users table | ✅ CODE DONE | `Infrastructure/Migrations/AddUserRole` |
| **Demo user = Teacher** | demo@visualizationdsa.dev seeded as Teacher role in both in-memory and DbSeeder | ✅ CODE DONE | `StatelessAuthStrategy.cs`, `DbSeeder.cs` |
| **Router Guards** | beforeEach: Landing→Dashboard redirect, requiresAuth, requiresRole checks | ✅ CODE DONE | `frontend/src/router/index.ts`, `routes.ts`, `routeMeta.d.ts` |
| **Teacher Panel** | `/#/teacher` — analytics grid (quiz stats), quiz management form (POST /quiz/manage) | ✅ CODE DONE | `frontend/src/views/TeacherPanelView.vue` |
| **Quiz Manage Endpoint** | POST /api/v1/concepts/quiz/manage — add new quiz to in-memory bank | ✅ CODE DONE | `StatelessQuizController.cs`, `QuizBankStrategy.cs` |
| **Quiz Analytics Endpoint** | GET /api/v1/concepts/quiz/analytics — total quizzes, attempts, pass rate | ✅ CODE DONE | `StatelessQuizController.cs` |
| **Sidebar Role Filtering** | appTabs with requiresAuth/requiresRole, filtered in App.vue, Teacher Panel visible only for Teacher | ✅ CODE DONE | `appTabs.ts`, `App.vue` |
| **Auth Store: role/isTeacher** | userRole + isTeacher computed, role mapped in _applyStatelessAuth | ✅ CODE DONE | `useAuthStore.ts`, `authApi.ts`, `statelessAuthApi.ts` |
| **Compilation** | dotnet build 0 errors + vue-tsc 0 errors | ✅ CODE DONE | Backend Build succeeded, Frontend vue-tsc clean |

---

## 30. Production Multi-Container Dockerization

| Tính năng | Chi tiết | Trạng thái | Files liên quan |
| :--- | :--- | :--- | :--- |
| **docker-compose.yml** | 3 services: database (postgres:15), backend (.NET 9), frontend (nginx:alpine) | ✅ CODE DONE | `docker-compose.yml` |
| **Backend Dockerfile** | Multi-stage: sdk:9.0 build → aspnet:9.0 runtime, Release mode, port 5055 | ✅ CODE DONE | `backend/Dockerfile`, `backend/.dockerignore` |
| **Frontend Dockerfile** | Multi-stage: node:20 build → nginx:alpine serve, VITE_API_BASE_URL injected | ✅ CODE DONE | `frontend/Dockerfile`, `frontend/.dockerignore` |
| **Nginx SPA config** | try_files fallback, gzip, static asset caching, no-cache index.html | ✅ CODE DONE | `frontend/nginx.conf` |
| **DB health check** | pg_isready interval 5s, 10 retries, backend depends_on condition:service_healthy | ✅ CODE DONE | `docker-compose.yml` |
| **Auto migrations** | Backend runs `context.Database.Migrate()` + `DbSeeder.SeedAsync()` at startup | ✅ CODE DONE | `Program.cs` (existing) |
| **Compilation** | dotnet build 0 errors + vue-tsc 0 errors | ✅ CODE DONE | Backend Build succeeded, Frontend vue-tsc clean |

---

## 31. WebGPU Rendering Pipeline Foundation

| Tính năng | Chi tiết | Trạng thái | Files liên quan |
| :--- | :--- | :--- | :--- |
| **WebGpuPipeline.ts** | Reusable pipeline: probeWebGpu(), initCanvasContext(), createComputePipeline() | ✅ CODE DONE | `frontend/src/core/WebGpuPipeline.ts` |
| **WGSL Compute Shader** | GRAPH_FORCE_COMPUTE_WGSL — Coulomb repulsion kernel for graph node arrays | ✅ CODE DONE | `frontend/src/core/WebGpuPipeline.ts` |
| **Adapter/Device Check** | probeWebGpu() checks navigator.gpu, adapter, device; returns capabilities | ✅ CODE DONE | `frontend/src/core/WebGpuPipeline.ts` |
| **Dashboard Badge** | Glowing "WebGPU Engine: READY" badge with gpuGlow animation + adapter name | ✅ CODE DONE | `frontend/src/views/DashboardView.vue` |
| **@webgpu/types** | TypeScript type definitions for WebGPU API added to tsconfig.app.json | ✅ CODE DONE | `tsconfig.app.json`, `package.json` |
| **Compilation** | dotnet build 0 errors + vue-tsc 0 errors | ✅ CODE DONE | Backend Build succeeded, Frontend vue-tsc clean |

---

## 32. WASM Compute Engine & Web Worker Bridge

| Tính năng | Chi tiết | Trạng thái | Files liên quan |
| :--- | :--- | :--- | :--- |
| **Vite WASM config** | worker format 'es', assetsInclude '*.wasm', optimizeDeps exclude | ✅ CODE DONE | `vite.config.ts` |
| **WasmComputeWorker** | Web Worker: init/compute/abort protocol, WASM instantiation, JS fallback | ✅ CODE DONE | `features/code-to-visualization/engine/WasmComputeWorker.ts` |
| **Transferable bridge** | createWasmBridge() — zero-copy ArrayBuffer transfer, Promise-based API | ✅ CODE DONE | `features/code-to-visualization/engine/WasmComputeWorker.ts` |
| **JS fallback compute** | sort (insertion), graph-force (Coulomb repulsion), iteration guard | ✅ CODE DONE | `features/code-to-visualization/engine/WasmComputeWorker.ts` |
| **Compilation** | dotnet build 0 errors + vue-tsc 0 errors | ✅ CODE DONE | Backend Build succeeded, Frontend vue-tsc clean |

---

## 33. CRDT Collaborative Graph & WebTransport

| Tính năng | Chi tiết | Trạng thái | Files liên quan |
| :--- | :--- | :--- | :--- |
| **yjs dependency** | CRDT library for decentralized state synchronization | ✅ CODE DONE | `package.json` |
| **CollaborativeGraphStore** | Pinia store binding Y.Doc arrays to graph nodes/edges with conflict-free ops | ✅ CODE DONE | `features/graph/store/useCollaborativeGraphStore.ts` |
| **CRDT operations** | addNode, addEdge, removeNode, moveNode (with lock), updateEdgeWeight — all transactional | ✅ CODE DONE | `features/graph/store/useCollaborativeGraphStore.ts` |
| **Awareness layer** | Peer cursors, colors, presence tracking for multi-user editing | ✅ CODE DONE | `features/graph/store/useCollaborativeGraphStore.ts` |
| **WebTransportClient** | HTTP/3 QUIC stub with WebSocket fallback + local offline mode | ✅ CODE DONE | `services/WebTransportClient.ts` |
| **Transport bridge** | createCollabTransport() factory wiring CRDT onLocalUpdate → broadcast | ✅ CODE DONE | `services/WebTransportClient.ts` |
| **Compilation** | dotnet build 0 errors + vue-tsc 0 errors | ✅ CODE DONE | Backend Build succeeded, Frontend vue-tsc clean |

---

## 29. Vietnamese Localization & Responsive Mobile Layout

| Tính năng | Chi tiết | Trạng thái | Files liên quan |
| :--- | :--- | :--- | :--- |
| **Sidebar tabs VN** | Giải thuật, Khái niệm, Tương tác, Tài khoản — 15 tabs translated | ✅ CODE DONE | `appTabs.ts` |
| **Route titles VN** | 13 active route meta titles translated to Vietnamese | ✅ CODE DONE | `router/routes.ts` |
| **Landing Page VN** | 8 feature card titles + 4 stats labels + CTA link translated | ✅ CODE DONE | `LandingView.vue` |
| **Dashboard VN** | Quick links (Sắp xếp, Trắc nghiệm, Bảng xếp hạng, Quản lý GV) | ✅ CODE DONE | `DashboardView.vue` |
| **Teacher Panel VN** | "Bảng điều khiển Giảng viên" + "Quản trị" badge | ✅ CODE DONE | `TeacherPanelView.vue` |
| **Graph View VN** | Tab names: Sân chơi Đồ thị, Cấu trúc Đồ thị & Cây | ✅ CODE DONE | `GraphView.vue` |
| **App.vue VN** | Premium tooltip → "Thành viên Premium", GitHub → "Mã nguồn GitHub" | ✅ CODE DONE | `App.vue` |
| **Responsive: Global** | @media 768px + 480px breakpoints for dashboard grid, stats, workspaces | ✅ CODE DONE | `style.css` |
| **Responsive: App shell** | Header compact, user badge info hidden, sidebar horizontal scroll | ✅ CODE DONE | `App.vue` |
| **Responsive: Landing** | Hero text scaling, CTA stacking, feature grid 1-col on phone | ✅ CODE DONE | `LandingView.vue` |
| **Responsive: Dashboard** | Grid 1-col, XP wheel scaled, quicklinks 2-col grid on phone | ✅ CODE DONE | `DashboardView.vue` |
| **Responsive: Teacher** | Analytics 2→1 col, form inline→stack, options grid 1-col | ✅ CODE DONE | `TeacherPanelView.vue` |
| **Compilation** | dotnet build 0 errors + vue-tsc 0 errors | ✅ CODE DONE | Backend Build succeeded, Frontend vue-tsc clean |

---

## 30. Graph RAG Backend Layer (Trụ Cột 5 — Semantic Matrix Engineering)

| Tính năng | Chi tiết | Trạng thái | Files liên quan |
| :--- | :--- | :--- | :--- |
| **SemanticConceptNode entity** | Domain entity — đỉnh đồ thị tri thức với Embedding (double precision[]), Importance, ConceptKey (unique), Category | ✅ CODE DONE | `backend/src/Domain/Entities/SemanticConceptNode.cs` |
| **KnowledgeEdge entity** | Domain entity — cạnh có hướng với RelationType, Weight, FK Cascade/Restrict | ✅ CODE DONE | `backend/src/Domain/Entities/KnowledgeEdge.cs` |
| **EF Core Fluent API** | DbSet + unique constraints, category index, embedding column type mapping | ✅ CODE DONE | `backend/src/Infrastructure/Data/ApplicationDbContext.cs` |
| **EF Migration** | AddSemanticGraph — creates SemanticConceptNodes + KnowledgeEdges tables | ✅ CODE DONE | `backend/src/Infrastructure/Migrations/20260606094901_AddSemanticGraph.cs` |
| **ISemanticGraphService + DTOs** | Application service interface + SemanticGraphDto, SemanticNodeDto, SemanticEdgeDto, SemanticGraphStatsDto | ✅ CODE DONE | `backend/src/Application/Services/ISemanticGraphService.cs` |
| **SemanticGraphService** | Infrastructure implementation — AsNoTracking, induced subgraph, graph density | ✅ CODE DONE | `backend/src/Infrastructure/Services/SemanticGraphService.cs` |
| **ConceptsController** | GET /api/v1/concepts/analytics/semantic-graph?category= | ✅ CODE DONE | `backend/src/WebApi/Controllers/ConceptsController.cs` |
| **DI Registration** | AddScoped<ISemanticGraphService, SemanticGraphService> | ✅ CODE DONE | `backend/src/WebApi/Program.cs` |
| **Unit tests** | 5 tests (InMemory): all/order/degree/induced-filter/empty | ✅ CODE DONE | `backend/tests/VisualizationDSA.UnitTests/Services/SemanticGraphServiceTests.cs` |
| **Compilation** | dotnet build 0 errors | ✅ CODE DONE | Backend Build succeeded |

---

## 31. Event Sourcing Ledger (Trụ Cột 6 — Immutable Audit Stream)

| Tính năng | Chi tiết | Trạng thái | Files liên quan |
| :--- | :--- | :--- | :--- |
| **SystemAuditEventStream entity** | Domain entity — append-only time-series frame với EventType, UserId, CorrelationId, Payload (JSONB), Sequence (monotonic) | ✅ CODE DONE | `backend/src/Domain/Entities/SystemAuditEventStream.cs` |
| **IAuditEventService** | Application service interface + AuditEventInput DTO | ✅ CODE DONE | `backend/src/Application/Services/IAuditEventService.cs` |
| **AuditEventService** | Infrastructure append-only writer | ✅ CODE DONE | `backend/src/Infrastructure/Services/AuditEventService.cs` |
| **ImmutableAuditInterceptor** | EF Core SaveChanges interceptor — chặn UPDATE/DELETE trên SystemAuditEventStream | ✅ CODE DONE | `backend/src/Infrastructure/Interceptors/ImmutableAuditInterceptor.cs` |
| **AuditEventActionFilter** | Global IAsyncActionFilter — reactive append audit frame after every action | ✅ CODE DONE | `backend/src/WebApi/Filters/AuditEventActionFilter.cs` |
| **EF Migration** | AddSystemAuditEventStream — creates table with time-series indexes | ✅ CODE DONE | `backend/src/Infrastructure/Migrations/20260606100145_AddSystemAuditEventStream.cs` |
| **DI + Interceptor wiring** | AddScoped<IAuditEventService>, AddInterceptors(ImmutableAuditInterceptor) + global filter | ✅ CODE DONE | `backend/src/WebApi/Program.cs` |
| **TEAM_TEST_GUIDE.md** | Hướng dẫn kiểm thử 6 trụ cột kỹ thuật bằng tiếng Việt | ✅ CODE DONE | `TEAM_TEST_GUIDE.md` |
| **walkthrough.md** | Cập nhật index 6 trụ cột kỹ thuật | ✅ CODE DONE | `walkthrough.md` |
| **Unit tests** | 6 tests (InMemory): append/default-payload/monotonic/block-update/block-delete/allow-append | ✅ CODE DONE | `backend/tests/VisualizationDSA.UnitTests/Services/AuditEventLedgerTests.cs` |
| **Compilation** | dotnet build 0 errors + vue-tsc -b 0 errors; backend 19/19 tests + frontend 1528 tests PASS | ✅ CODE DONE | Full workspace clean |

---

## 32. UI/UX Refinements (Graph & Tree Visualization Improvements)

| Tính năng | Chi tiết | Trạng thái | Files liên quan |
| :--- | :--- | :--- | :--- |
| **Pseudocode scrolling & wrap** | Sửa PseudocodeViewer hỗ trợ scroll dọc, khóa title ở đầu trang, và bảo toàn thụt lề đầu dòng | ✅ CODE DONE | `frontend/src/features/dsa-modules/components/PseudocodeViewer.vue` |
| **Glassmorphic HUD Step Card** | Thêm nền mờ kính và hiệu ứng tự ẩn khi hover cho thẻ Step HUD trong canvas | ✅ CODE DONE | `frontend/src/features/dsa-modules/components/AlgorithmVisualizer.vue` |
| **Vietnamese UI Spellcheck** | Sửa các lỗi chính tả nút bấm "Mo phong" thành "Mô phỏng" và "Ly thuyet" thành "Lý thuyết" | ✅ CODE DONE | `frontend/src/features/dsa-modules/components/AlgorithmDashboard.vue` |

---

## 33. IDE Debugger & Quiz Module Polish (State Inspector Scroll, Quiz Selection highlight, Pinia Reactivity)

| Tính năng | Chi tiết | Trạng thái | Files liên quan |
| :--- | :--- | :--- | :--- |
| **State Inspector Scroll** | Sửa CallStackPanel & StateInspectorWorkspace sử dụng flex-box column độc lập để scroll khi stack frames hoặc heap objects dài | ✅ CODE DONE | `frontend/src/features/state-inspector/components/CallStackPanel.vue`, `frontend/src/features/state-inspector/components/StateInspectorWorkspace.vue` |
| **Quiz High-contrast Highlight** | Sửa màu lựa chọn đáp án và progress badge sử dụng color-mix để tránh lỗi hiển thị của Tailwind opacity | ✅ CODE DONE | `frontend/src/features/quiz-system/components/BackendQuizWorkspace.vue`, `frontend/src/features/smart-quiz/components/InteractiveQuizOverlay.vue` |
| **Pinia reactivity splice** | Đột biến mảng backendAnswers bằng phương thức splice để Vue 3 tự động render cập nhật giao diện đáp án | ✅ CODE DONE | `frontend/src/features/quiz-system/store/useQuizStore.ts` |

---

## 34. Authentication & Payment Stabilization (Session Persistence, Anonymous Checkout Gate)

| Tính năng | Chi tiết | Trạng thái | Files liên quan |
| :--- | :--- | :--- | :--- |
| **Stateless Session Restore** | Khôi phục phiên đăng nhập không trạng thái đồng bộ trước khi load progress và router guard chạy | ✅ CODE DONE | `frontend/src/features/auth/store/useAuthStore.ts`, `frontend/src/features/auth/services/statelessAuthApi.ts` |
| **Active Auth Payment Validation** | Bắt buộc đăng nhập trước khi checkout, tạo hóa đơn, kiểm tra tính năng premium và mô phỏng webhook | ✅ CODE DONE | `frontend/src/features/payment/store/usePaymentStore.ts` |
| **Glassmorphic Auth Checkout Gate** | Hiển thị tấm chắn đăng nhập mờ kính trực quan thay vì redirect đột ngột khi khách vãng lai nâng cấp premium | ✅ CODE DONE | `frontend/src/views/PremiumCheckoutView.vue` |

---

## 35. Teacher Panel & Excel Importer (Excel Template, Batch Upload Validation & Parser Unit Tests)

| Tính năng | Chi tiết | Trạng thái | Files liên quan |
| :--- | :--- | :--- | :--- |
| **Excel Parser Helper** | Tách logic phân tích Excel dòng thành DTO cấu trúc Quiz & validation | ✅ CODE DONE | `frontend/src/features/quiz/service/excelParser.ts` |
| **ExcelQuizImporter integration** | Import và gán kết quả phân tích file Excel mẫu cho các trường dữ liệu Vue | ✅ CODE DONE | `frontend/src/features/quiz/components/ExcelQuizImporter.vue` |
| **Teacher Panel view state** | Phân chia tab chi tiết và điều hợp timeline VCR Playback an toàn | ✅ CODE DONE | `frontend/src/views/TeacherPanelView.vue` |
| **Parser Unit Tests** | Viết 3 unit tests bao quát các trường hợp thô, lỗi dòng Excel | ✅ CODE DONE | `frontend/src/features/quiz/__tests__/excelParser.spec.ts` |

---

## 36. Admin Dashboard (Admin panel monitoring & real-time log viewer)

| Tính năng | Chi tiết | Trạng thái | Files liên quan |
| :--- | :--- | :--- | :--- |
| **Admin Panel interface** | Giao diện điều khiển Neon Amber sang trọng, thống kê số liệu, log người dùng | ✅ CODE DONE | `frontend/src/views/AdminPanelView.vue` |
| **SignalR state integration** | Tích hợp realtime logging audit qua SignalR Hub an toàn | ✅ CODE DONE | `frontend/src/features/realtime/store/useSignalRStore.ts` |

---

## 37. FrameDTO Optional Properties Type Mismatch Stabilization

| Tính năng | Chi tiết | Trạng thái | Files liên quan |
| :--- | :--- | :--- | :--- |
| **Safe Canvas Drawing** | Thêm kiểm tra nullish safe và fallbacks cho `dataState` và `highlights` trong composables và panels vẽ canvas | ✅ CODE DONE | `frontend/src/features/animation-engine/composables/useAnimationCanvas.ts`, `frontend/src/features/compare-algorithms/components/compareCanvasDraw.ts`, `frontend/src/features/compare-algorithms/components/CompareCanvasPanel.vue` |
| **Safe Compare Helpers** | Thêm kiểm tra nullish safe khi trích xuất thống kê từ frames trong compare helper | ✅ CODE DONE | `frontend/src/features/compare-algorithms/store/compareHelpers.ts` |
| **Test Spec Refactoring** | Cập nhật file test api để sử dụng non-null assertions (!) nhằm tránh lỗi type check | ✅ CODE DONE | `frontend/src/features/animation-engine/__tests__/algorithmApi.spec.ts` |

---

## Section 38 — DoD Finalization: Code Quality & Build Optimization (09/06/2026)

| Hạng mục | Mô tả | Trạng thái | Files |
| :--- | :--- | :--- | :--- |
| **console.log Cleanup** | Xóa debug log trong `loadMore()` và badge callback | ✅ CODE DONE | `AlgorithmDashboard.vue`, `GamificationPanel.vue` |
| **CS8618 QuizDto Fix** | Thêm `required` modifier cho 8 properties trong 5 DTO classes | ✅ CODE DONE | `backend/src/Application/DTOs/QuizDto.cs` |
| **Security Upgrade** | Npgsql 8.0.0→9.0.4, EF Core 8→9.0.1, Caching.Memory 8→9.0.1 | ✅ CODE DONE | `Infrastructure.csproj`, `Application.csproj`, `WebApi.csproj` |
| **any Type Elimination** | Thay 7 occurrences `any` bằng typed interfaces: `PlaygroundStoreSurface`, `DragState`, `EdgeDrawState`, `GraphAnimationFrame`, `unknown` cast | ✅ CODE DONE | `canvasEventHandlers.ts`, `playgroundCanvasDraw.ts`, `PlaygroundCanvas.vue`, `GraphParser.ts`, `XPProgressSection.vue` |
| **Chunk Optimization** | Tách vendor 827KB thành: vendor 360KB + xlsx 421KB + vue-core 46KB + monaco 8KB | ✅ CODE DONE | `frontend/vite.config.ts` |
| **Coverage Report** | 1531/1531 tests pass. Stmts 79.56%, Branch 66.68%, Funcs 80.76%, Lines 82.07% | ✅ MEASURED | `@vitest/coverage-v8` |

---

## Section 39 — API Integration & 404 UX Stabilization (09/06/2026)

| Hạng mục | Mô tả | Trạng thái | Files |
| :--- | :--- | :--- | :--- |
| **API Base URL Suffix Fix** | Loại bỏ `/api/v1` thừa trong `.env.development` để tránh double-prefixing. Chuẩn hóa `apiClient.ts` ghép hậu tố tự động. | ✅ CODE DONE | `frontend/.env.development`, `frontend/src/services/apiClient.ts`, `frontend/src/shared/services/apiClient.ts` |
| **Custom 404 Not Found Page** | Xây dựng trang `NotFoundView.vue` với thiết kế Glassmorphism, glitch animation 404, SVG và quick nav links. | ✅ CODE DONE | `frontend/src/views/NotFoundView.vue` |
| **Router Catch-All Fix** | Thay thế silent redirect sang trang chủ bằng NotFoundView để hiển thị 404 trực quan. | ✅ CODE DONE | `frontend/src/router/routes.ts` |
| **E2E Validation Walkthrough** | Chạy subagent trình duyệt xác thực toàn bộ các luồng auth, simulation, quiz, playground, compare, gamification và 404. | ✅ VERIFIED | `final_qa_verification_1780999651917.webp` |

---

## Section 40 — Guided Tour & SOLID Pedagogical Refinements (09/06/2026)

| Hạng mục | Mô tả | Trạng thái | Files |
| :--- | :--- | :--- | :--- |
| **Guided Tour State Store** | Pinia store quản lý trạng thái guided tour, lưu trữ localStorage, hỗ trợ 5 bước cơ bản chỉ dẫn các khu vực chính của giao diện. | ✅ CODE DONE | `frontend/src/features/guided-tour/store/useGuidedTourStore.ts` |
| **Guided Tour UI Overlay** | Giao diện overlay mờ kính, spotlight tiêu điểm bám theo selector, có các hiệu ứng micro-animations mượt mà và nút bấm điều khiển. | ✅ CODE DONE | `frontend/src/features/guided-tour/components/GuidedTourOverlay.vue` |
| **Guided Tour Integration** | Mount overlay toàn cục và bổ sung nút khởi chạy hướng dẫn nhanh thủ công cạnh icon GitHub trên thanh Header. | ✅ CODE DONE | `frontend/src/App.vue` |
| **Guided Tour Unit Tests** | 8 unit tests kiểm tra toàn bộ luồng chuyển bước, chặn biên index, và lưu trữ localStorage. | ✅ CODE DONE | `frontend/src/features/guided-tour/__tests__/useGuidedTourStore.spec.ts` |
| **Monaco Resilience Try-Catch** | Thêm try-catch bao bọc loader.init() tránh crash ứng dụng khi lỗi cache/mạng Monaco Editor, render nút reload. | ✅ CODE DONE | `MonacoEditorPanel.vue`, `DebugWorkspace.vue`, `CodeEditor.vue` |
| **SOLID Pedagogical Content** | Nâng cấp giải thích chi tiết nguyên lý LSP và DIP kèm dịch nghĩa tiếng Việt và tương tác trực quan. | ✅ CODE DONE | `LSPLessonPanel.vue`, `DIPLessonPanel.vue` |
| **Test Suite Verification** | 1539/1539 tests pass. Thêm 8 unit tests mới cho Guided Tour. | ✅ MEASURED | `vitest` |






---

## Section 41 — User Profile Management & Sidebar Redesign (09/06/2026)

| Hạng mục | Mô tả | Trạng thái | Files |
| :--- | :--- | :--- | :--- |
| **StatelessAuthStrategy fields** | Bổ sung các trường Nickname, Bio, University vào mô hình lưu trữ InMemoryUser và hàm ánh xạ DTO. | ✅ CODE DONE | `backend/src/Domain/Strategies/StatelessAuthStrategy.cs` |
| **StatelessAuthController updates** | Chuyển tiếp các trường thông tin cập nhật (Nickname, Bio, University) từ request DTO sang Auth Strategy. | ✅ CODE DONE | `backend/src/WebApi/Controllers/StatelessAuthController.cs` |
| **Frontend DTO & Store updates** | Mở rộng kiểu dữ liệu `StatelessUserDto` và `AuthUserDto`, bổ sung hàm cập nhật thông tin trong Pinia `useAuthStore`. | ✅ CODE DONE | `frontend/src/features/auth/services/statelessAuthApi.ts`, `frontend/src/features/auth/services/authApi.ts`, `frontend/src/features/auth/store/useAuthStore.ts` |
| **ProfileView component** | Xây dựng màn hình quản lý tài khoản `ProfileView.vue` với thiết kế mờ kính Glassmorphic, vòng tròn tiến độ XP, tủ trưng bày huy chương (badges cabinet) và form cập nhật thông tin. | ✅ CODE DONE | `frontend/src/views/ProfileView.vue` |
| **Navigation Redesign** | Gỡ bỏ tab VCR Timeline lỗi thời và thay thế bằng tab Profile dưới nhóm "Tài khoản". Cập nhật routing tương ứng. | ✅ CODE DONE | `frontend/src/appTabs.ts`, `frontend/src/router/routes.ts` |
| **Header Badge navigation** | Bổ sung tương tác nhấp chọn vào badge avatar ở Header để điều hướng nhanh đến màn hình Profile. | ✅ CODE DONE | `frontend/src/App.vue`, `frontend/src/shared/components/BaseIcon.vue` |
| **Quiz Topic Selector** | Thay thế ô nhập tự do (free-text input) bằng hộp chọn danh sách thả xuống (select dropdown) cho các chủ đề chuẩn hóa trong Bảng giảng viên để tránh sai lệch dữ liệu. | ✅ CODE DONE | `frontend/src/views/TeacherPanelView.vue` |

## Section 42 — Security Hardening, Localization & Admin UX (14/06/2026)

| Hạng mục | Mô tả | Trạng thái | Files |
| :--- | :--- | :--- | :--- |
| **AdminController 2-layer Auth** | Thêm helper `RequireToken()` trả 401 khi không có Bearer token. Áp dụng 2-layer guard (401 + 403) vào tất cả 7 endpoint của AdminController. Trước đây chỉ trả 403 khi role sai mà không chặn thiếu token hoàn toàn. | ✅ CODE DONE | `backend/src/WebApi/Controllers/AdminController.cs` |
| **Admin UI Việt hóa** | Dịch toàn bộ chuỗi tiếng Anh còn sót: dropdown role (Student/Teacher/Admin), nhãn Free → Miễn phí, log messages từ tiếng Anh sang tiếng Việt. | ✅ CODE DONE | `frontend/src/views/AdminPanelView.vue` |
| **Glassmorphic User Detail Modal** | Thay thế `alert()` bằng modal glassmorphic đầy đủ tính năng: avatar gradient, stats grid (XP/Level/Streak/Premium), thông tin ngày tham gia, animation fade-in cubic-bezier, đóng bằng click backdrop. | ✅ CODE DONE | `frontend/src/views/AdminPanelView.vue` |
| **User IsActive field** | Thêm trường `IsActive` vào `User` entity + phương thức `SetActiveStatus()`. Tạo migration `AddUserIsActive`. | ✅ CODE DONE | `backend/src/Domain/Entities/User.cs`, `backend/src/Infrastructure/Migrations/AddUserIsActive.cs` |
| **Ban/Unban Endpoint** | Thêm `PUT /api/v1/concepts/admin/users/{id}/ban` endpoint. Login kiểm tra `IsActive == false` → trả 403 `ACCOUNT_BANNED` trước khi xác thực mật khẩu. | ✅ CODE DONE | `backend/src/WebApi/Controllers/AdminController.cs`, `backend/src/WebApi/Controllers/StatelessAuthController.cs` |
| **Ban/Unban UI** | Thêm nút Khóa/Mở khóa (🔓/🔒) vào bảng Users với màu sắc động (xanh lá = hoạt động, đỏ = bị khóa), gọi API ban endpoint. Thêm trường `isActive` vào `UserItem` interface. | ✅ CODE DONE | `frontend/src/views/AdminPanelView.vue` |
| **Quiz Accordion (Task 5.1)** | Bấm vào dòng quiz để xổ accordion hiển thị danh sách câu hỏi con với đáp án đúng highlight xanh lá, giải thích vàng. Có trạng thái loading. | ✅ CODE DONE | `frontend/src/views/AdminPanelView.vue` |
| **StatelessQuizController JWT protection** | Áp dụng RequireToken() 2-layer auth và IsTeacherOrAdmin() phân quyền ghi cho các endpoint thêm/sửa/xóa quiz. | ✅ CODE DONE | ackend/src/WebApi/Controllers/StatelessQuizController.cs |
| **TeacherPanel Localization** | Việt hóa 100% giao diện quản lý quiz của Giảng viên (TeacherPanelView.vue) bao gồm thông báo, nút bấm, và hướng dẫn. | ✅ CODE DONE | rontend/src/views/TeacherPanelView.vue |
| **Excel Parser Compatibility** | Cập nhật parser hỗ trợ cả "Tiêu đề trắc nghiệm" và "Tiêu đề Quiz", giúp tương thích ngược với file template Excel cũ. | ✅ CODE DONE | `frontend/src/features/quiz/service/excelParser.ts` |

---

## Section 43 — Impersonation & UI/UX Finalization (14/06/2026)

| Hạng mục | Mô tả | Trạng thái | Files |
| :--- | :--- | :--- | :--- |
| **Input Array Constraint** | Giới hạn 15 phần tử để đảm bảo Canvas hiển thị tối ưu, thêm cảnh báo trên UI. | ✅ CODE DONE | `VcrControlPanel.vue`, `useSortingAnimation.ts` |
| **Compare View Aesthetics** | Đồng bộ gradient glassmorphic, tăng padding/margin để tránh đè chữ. | ✅ CODE DONE | `CompareCanvasPanel.vue`, `compareCanvasDraw.ts` |
| **Viewport Scroll Fixes** | Sửa kẹt thanh cuộn trang /system bằng cách thay overflow-hidden thành overflow-y-auto. | ✅ CODE DONE | `SystemDesignVizView.vue` |
| **Guided Tour Overlay** | Tích hợp Guided Tour cho /sorting và /compare, hỗ trợ xem lại bằng nút ❓. | ✅ CODE DONE | `useGuidedTourStore.ts`, `GuidedTourOverlay.vue`, `SortingView.vue` |
| **Admin Impersonation** | Hiện thực hóa tính năng "Đóng vai người dùng", cấp JWT tạm quyền, có banner thoát đóng vai ở App.vue. | ✅ CODE DONE | `AdminPanelView.vue`, `useAuthStore.ts`, `App.vue` |

---

## Section 44 — Automated Graduation Documentation Finalization (14/06/2026)

| Hạng mục | Mô tả | Trạng thái | Files |
| :--- | :--- | :--- | :--- |
| **Document Generator Scripts** | Hoàn thiện 8 python scripts (`phase0` -> `phase7`) programmatically build tài liệu Word với 28+ sơ đồ, logo và UI screenshots thực tế. | ✅ CODE DONE | `tailieu/phase0_cover_ack.py`, `tailieu/phase1_intro.py`, `tailieu/phase2_survey.py`, `tailieu/phase3_analysis.py`, `tailieu/phase4_design.py`, `tailieu/phase5_implement.py`, `tailieu/phase6_testing.py`, `tailieu/phase7_deploy_conclusion.py` |
| **Word Artifact Production** | Xuất thành công file báo cáo tốt nghiệp chuẩn FPT Polytechnic không chứa placeholders. | ✅ CODE DONE | `tailieu/PRO2192_VisualizationDSA_Report.docx`, `document/PRO2192_Report.docx` |
| **UML/Mermaid Code Separation** | Tự động lọc toàn bộ các đoạn mã UML, Mermaid, Sitemap, Wireframe thô ra khỏi tài liệu Word và đưa vào file văn bản riêng. | ✅ CODE DONE | `tailieu/helpers.py`, `tailieu/run_all.py`, `tailieu/hinhanh_uml_source.txt` |
| **Academic Format Refinement** | Chuyên nghiệp hóa định dạng báo cáo, crop 4 ảnh chân dung thành viên và chèn vào bảng Ban dự án không viền (borderless), chèn ảnh thực tế thay placeholder, dọn dẹp thẻ HTML chú thích ảnh. | ✅ CODE DONE | `tailieu/update_report.py`, `tailieu/crop_avatars.py`, `document/PRO2192_Report.docx` |

---

## Section 45 — Guided Tour Expansion & Dashboard Finalization (16/06/2026)

| Hạng mục | Mô tả | Trạng thái | Files |
| :--- | :--- | :--- | :--- |
| **Guided Tour Target Standardization** | Gắn data-tour-id vào các cấu phần trọng tâm của /sorting, /compare, /graph, /system để định vị chính xác trong Guided Tour. | ✅ CODE DONE | `CompareAlgorithmSelector.vue`, `CompareWorkspace.vue`, `VcrArrayInput.vue`, `VcrControlPanel.vue`, `SortingView.vue`, `SortingDetailPanel.vue`, `InteractivePlayground.vue`, `SystemDesignWorkspace.vue` |
| **Guided Tour Registry Sync** | Đồng bộ cấu trúc PAGE_TOURS trong useGuidedTourStore.ts sử dụng các selector data-tour-id mới cho các trang /sorting, /compare, /graph, /system. | ✅ CODE DONE | `useGuidedTourStore.ts` |
| **Guided Tour Integration & UI** | Tích hợp HelpButton vào CompareView.vue và thiết lập tour tự động chạy khi truy cập lần đầu. | ✅ CODE DONE | `CompareView.vue` |
| **Test Suite Alignment** | Cập nhật bộ unit test useGuidedTourStore.spec.ts phù hợp với số lượng bước và tiêu đề tour mới, pass 100%. | ✅ CODE DONE | `useGuidedTourStore.spec.ts` |
| **Dashboard UI/UX Optimization** | Loại bỏ cụm Lộ trình học tập mockup, nâng cấp nút Hướng dẫn đầy đủ tự động điều hướng sang `/sorting` và ép buộc kích hoạt Guided Tour. | ✅ CODE DONE | `DashboardView.vue` |
| **Auto-Flip & Boundary Clamping** | Hiện thực hóa thuật toán đảo hướng preferredPosition (200px) và giới hạn an toàn viewport clamp cho GuidedTourOverlay. | ✅ CODE DONE | `GuidedTourOverlay.vue` |
| **State Inspector Tour Target** | Gắn data-tour-id vào CallStackPanel, HeapObjects, và RecursionTreeSVG để định vị tour trong phân hệ /state. | ✅ CODE DONE | `StateInspectorWorkspace.vue` |
| **Pedagogical Tour Enhancements** | Bổ sung dynamic beforeAction hỗ trợ chuyển tab tự động (tab-switching) và tích hợp bài học chuyên sâu /state, /graph, /sorting. | ✅ CODE DONE | `useGuidedTourStore.ts`, `useGuidedTourStore.spec.ts` |

---

## Section 46 — Compare & Concurrency UI Standardization & Tour Relocation (16/06/2026)

| Hạng mục | Mô tả | Trạng thái | Files |
| :--- | :--- | :--- | :--- |
| **Glassmorphic Dropdowns in Compare** | Di chuyển từ native select sang custom glassmorphic dropdowns trong CompareAlgorithmSelector.vue để đồng bộ hóa thiết kế. | ✅ CODE DONE | `CompareAlgorithmSelector.vue` |
| **Help Button Relocation** | Đồng bộ hóa và dọn dẹp giao diện bằng cách di chuyển HelpButton từ CompareView.vue trực tiếp vào vị trí trung tâm trong CompareAlgorithmSelector.vue. | ✅ CODE DONE | `CompareView.vue`, `CompareAlgorithmSelector.vue` |
| **Concurrency UI Alignment** | Khắc phục xung đột layout CSS trong ThreadRailsCanvas.vue bằng định vị tuyệt đối và điều chỉnh tương phản lớp nền nhãn trạng thái thread. | ✅ CODE DONE | `ThreadRailsCanvas.vue`, `useThreadClassHelpers.ts` |
| **Mutex Toggle Refactoring** | Nâng cấp nút toggle Mutex trong ConcurrencyScenarioToolbar.vue sang giao diện kính mờ cao cấp với hiệu ứng phát sáng neon cyan. | ✅ CODE DONE | `ConcurrencyScenarioToolbar.vue` |
| **State Inspector Links Cleanup** | Loại bỏ link State Inspector thừa khỏi CodeIDEView.vue để tập trung hóa việc quản lý trạng thái qua module /state riêng biệt. | ✅ CODE DONE | `CodeIDEView.vue` |
| **End-to-End Tour Verification** | Chạy kiểm thử tự động toàn bộ luồng tour hướng dẫn cho các phân hệ /compare, /graph, /state, /oop và xác minh hoạt động chính xác. | ✅ CODE DONE | `useGuidedTourStore.ts` |

## Section 47 – Authentication Race Condition & Administrative Fetch Stabilization (16/06/2026)

| Hạng mục | Mô tả | Trạng thái | Files |
| :--- | :--- | :--- | :--- |
| **Atomic Token Refresh** | Thiết lập khóa lời hứa (Promise locking mechanism) tránh trùng lặp cuộc gọi refresh token đồng thời. | ✅ CODE DONE | `useAuthStore.ts` |
| **Progress Init Retry Logic** | Cấu hình tự động retry progress sync khi gặp lỗi Unauthorized (401) đầu tiên sau khi refresh token thành công. | ✅ CODE DONE | `useUserProgressStore.ts` |
| **Global Fetch Interceptor** | Cài đặt interceptor fetch toàn cục tự động chèn Bearer token và xử lý 401 transparent token refresh & retry. | ✅ CODE DONE | `main.ts` |

---

## Section 48 — Interactive Guided Tour Upgrade (16/06/2026)

| Hạng mục | Mô tả | Trạng thái | Files |
| :--- | :--- | :--- | :--- |
| **Virtual Assistant Mascot** | Hiện thực hóa component Mascot kính mờ VirtualMascot.vue hiển thị các biểu cảm và trạng thái sinh động. | ✅ CODE DONE | VirtualMascot.vue |
| **Virtual Pointer System** | Hiện thực hóa VirtualPointer.vue với di chuyển Lerp, nét đứt Neon và hiệu ứng ripple click để mô phỏng thao tác. | ✅ CODE DONE | VirtualPointer.vue |
| **Interactive Simulation Engine** | Nâng cấp useGuidedTourStore.ts với cơ chế runCurrentStepScript để tự động click, type trên DOM thực tế. | ✅ CODE DONE | useGuidedTourStore.ts |
| **Guided Tour Overlay Upgrades** | Cải tiến GuidedTourOverlay.vue tích hợp Mascot, Pointer, lời thoại Typewriter và sóng âm Equalizer ảo sinh động. | ✅ CODE DONE | GuidedTourOverlay.vue |
| **Vitest Suite Updates** | Cập nhật useGuidedTourStore.spec.ts và chạy thành công 15/15 tests (bổ sung test kịch bản tự chạy). | ✅ CODE DONE | useGuidedTourStore.spec.ts |

## Section 49 — Administrative Authentication Mismatch & Vue Transition Fixing (16/06/2026)

| Hạng mục | Mô tả | Trạng thái | Files |
| :--- | :--- | :--- | :--- |
| **JWT NameClaimType Mapping** | Cấu hình NameClaimType = "sub" và RoleClaimType = "role" để ASP.NET Core map chính xác claim "sub" từ token sang ClaimTypes.NameIdentifier. | ✅ CODE DONE | Program.cs |
| **Get User ID Security Refactor** | Cập nhật GetCurrentUserId() để tìm kiếm theo độ ưu tiên claim an toàn, tránh vứt exception bừa bãi gây 401 giả lập. | ✅ CODE DONE | UsersController.cs |
| **Resilient Page Transition** | Loại bỏ mode="out-in" tại <Transition> và thêm :key=".fullPath" để tránh kẹt opacity 0 khi xảy ra lỗi render. | ✅ CODE DONE | App.vue |
| **Progress Store Clean up** | Dọn dẹp logic retry 401 trùng lặp trong store để ủy quyền hoàn toàn cho Global Interceptor, sửa đổi unit tests tương ứng. | ✅ CODE DONE | useUserProgressStore.ts, useUserProgressStore.spec.ts |

## Section 50 — System Audit, Memory Cache Hardening & Visual Diagnostics (17/06/2026)

| Hạng mục | Mô tả | Trạng thái | Files |
| :--- | :--- | :--- | :--- |
| **Visual & UI Diagnostics Scan** | Chạy kiểm thử tự động toàn bộ 15 routes chính, chụp 18 ảnh màn hình chẩn đoán không có màn hình trống hay lỗi mạng. | ✅ CODE DONE | run-diagnostics.js, report.html |
| **Memory Cache Hardening** | Thiết lập SlidingExpiration (15s) và AbsoluteExpiration (60s) đồng thời cho Leaderboard Cache nhằm ngăn chặn rò rỉ RAM. | ✅ CODE DONE | LeaderboardService.cs |
| **EF Core Read-Only Audit** | Xác nhận 100% các repo đọc dữ liệu (QuizRepository, UserRepository) đều sử dụng .AsNoTracking() đúng chuẩn. | ✅ CODE DONE | QuizRepository.cs, UserRepository.cs |
| **Full Stack Tests Verification** | Chạy hồi quy 1555 vitest frontend + 19 xunit backend và xác nhận toàn bộ test suite PASS 100%. | ✅ CODE DONE | VisualizationDSA.UnitTests.csproj, package.json |

## Section 51 — Backend Performance Optimization & Resilience Audit (17/06/2026)

| Hạng mục | Mô tả | Trạng thái | Files |
| :--- | :--- | :--- | :--- |
| **CancellationToken Guardrails** | Triển khai CancellationTokenSource liên kết với request timeout 2s để ngắt các tiến trình tính toán thuật toán kéo dài. | ✅ CODE DONE | AlgorithmsController.cs |
| **Concept Visualizer Caching** | Áp dụng IMemoryCache cho các Scenario Visualizer (SOLID, OOP, DI Container, System Design, Design Patterns) giảm tải tính toán trùng lặp. | ✅ CODE DONE | SOLIDController.cs, OOPController.cs, DIContainerController.cs, SystemDesignController.cs, DesignPatternsController.cs |
| **Read-Only Database Track Audit** | Đảm bảo tất cả các query đọc trong repo/service sử dụng AsNoTracking() để giảm tải bộ nhớ cho EF Core Change Tracker. | ✅ CODE DONE | QuizRepository.cs, UserRepository.cs, LeaderboardService.cs |
| **System Resiliency Tests Run** | Chạy hồi quy toàn bộ xunit tests của backend đảm bảo không xảy ra regression sau tối ưu hóa hiệu năng. | ✅ CODE DONE | VisualizationDSA.UnitTests.csproj |

## Section 52 — Backend Security Hardening & Rate Limiting (17/06/2026)

| Hạng mục | Mô tả | Trạng thái | Files |
| :--- | :--- | :--- | :--- |
| **Input Size Enforcement** | Tích hợp kiểm tra kích thước mảng ConstraintResolver.ValidateSize vào Execute và Compare endpoints nhằm chống quá tải tài nguyên. | ✅ CODE DONE | AlgorithmsController.cs |
| **Async Request Offloading** | Chuyển đổi các endpoint chạy giải thuật sang async/await và bọc chiến lược thực thi trong Task.Run để tránh nghẽn thread pool. | ✅ CODE DONE | AlgorithmsController.cs |
| **Analytics Query Caching** | Cấu hình Memory Cache cho GetOverview (2 phút) và GetPopularModules (10 phút) để bảo vệ DB khỏi việc đọc lặp lại. | ✅ CODE DONE | AnalyticsController.cs |
| **Rate Limiter Policies** | Khai báo 2 chính sách rate limit mới "api" (60 req/min) và "heavy" (15 req/min, 0 queue) tại Program.cs để chống spam API công cộng. | ✅ CODE DONE | Program.cs |
| **Endpoint Protection Decorators** | Áp dụng thuộc tính [EnableRateLimiting] lên AlgorithmsController, AnalyticsController và các Concepts controllers để kích hoạt chặn spam. | ✅ CODE DONE | AlgorithmsController.cs, AnalyticsController.cs, SOLIDController.cs, OOPController.cs, DIContainerController.cs, SystemDesignController.cs, DesignPatternsController.cs |
| **System Regression Verification** | Chạy kiểm thử tự động xunit và đảm bảo toàn bộ hệ thống hoạt động ổn định không xảy ra lỗi hồi quy. | ✅ CODE DONE | VisualizationDSA.UnitTests.csproj |

## Section 53 — Full-Stack Security & Performance Audit (17/06/2026)

| Hạng mục | Mô tả | Trạng thái | Files |
| :--- | :--- | :--- | :--- |
| **Leaderboard Cache Protection** | Cấu hình Memory Cache cho StatelessGamificationController.GetLeaderboard (15s sliding, 60s absolute) kèm clamp limit tránh spam DB; áp dụng rate limiting cho Leaderboard. | ✅ CODE DONE | LeaderboardController.cs, StatelessGamificationController.cs |
| **Core Animation Engine Cleanup** | Xác minh và đảm bảo requestAnimationFrame loop được cancel qua animationEngine.destroy() trong onBeforeUnmount của canvas controller để chống rò rỉ RAM. | ✅ CODE DONE | CoreAnimationEngine.ts, useAlgorithmCanvasController.ts |
| **Pinia Reactivity Optimization** | Xác minh và đảm bảo dùng shallowRef cho danh sách frames lớn trong useAnimationStore và useVcrStore giúp loại bỏ reactive proxy đệ quy sâu nghẽn CPU. | ✅ CODE DONE | useAnimationStore.ts, useVcrStore.ts |
| **Monaco AST Loop Protection** | Xác minh cơ chế tiêm guard block __loopCounter giới hạn 5000 lần lặp trong ASTInstrumentationEngine.ts để bảo vệ tab trình duyệt khỏi treo đơ. | ✅ CODE DONE | ASTInstrumentationEngine.ts |
| **Web Worker Lifecycle Termination** | Xác minh Web Worker được chấm dứt ngay lập tức thông qua cancelExecution() trong onBeforeUnmount của CodeWorkspace.vue khi rời khỏi IDE. | ✅ CODE DONE | CodeWorkspace.vue, WorkerLifecycleCoordinator.ts |

# # #   A d v a n c e d   G r a p h   C o u r s e   ( 1 4 / 0 7 / 2 0 2 6 ) 
 -   '  T h  m   d a n h   m c   ' G r a p h '   v  o   C a t a l o g   ( B e l l m a n - F o r d ,   K r u s k a l ,   P r i m ,   T a r j a n ,   A * ) . 
 -   '  B   s u n g   m    g i   ( p s e u d o c o d e ) ,     p h c   t p ,   v    d i n   g i i   h c   t h u t . 
 -   '  T  c h   h p   v  o   U I   A l g o r i t h m   D a s h b o a r d ,   f a l l b a c k   m    p h n g   t )n h   t h  n h   c  n g .  
 
## Lớp học (Classroom) - Giai đoạn 1
- ✅ CODE DONE: Đã khởi tạo các entity Classroom, ClassroomEnrollment, update DbContext và viết ClassroomService + ClassroomsController. Các file liên quan: Classroom.cs, ClassroomEnrollment.cs, ApplicationDbContext.cs, ClassroomDto.cs, IClassroomService.cs, ClassroomService.cs, ClassroomsController.cs, Program.cs.

## Lớp học (Classroom) - Giai đoạn 2: Xưởng Tạo Bài Giảng
- ✅ CODE DONE: Đã cập nhật Entity Lesson (thêm PublishStatus, nullable CourseId), thêm ClassroomLesson, LessonReview. Viết các DTOs, LessonAuthoringService, LessonReviewService, LessonAuthoringController, LessonReviewController, và cấu hình DbContext.

## Lớp học (Classroom) - Giai đoạn 3: Thống kê & Báo cáo
- ✅ CODE DONE: Đã cài đặt ClosedXML, thêm ClassroomQuiz, ClassroomQuizAttempt. Đã triển khai ClassroomGradingService và ClassroomExcelExportService. Đã tích hợp API endpoints /statistics và /export-excel.

## Lớp học (Classroom) - Giai đoạn 4: Phân quyền & Quản trị
- ✅ CODE DONE: Đã tạo INotificationService. Đã thêm chức năng Kick học sinh và Archive lớp vào ClassroomService. Đã bổ sung các API Endpoints cho Admin/Teacher trong ClassroomController. Luồng Classroom đã hoàn tất 100%.


## Phase 1: Core Course Module (Strangler Fig Refactoring)
- ✅ CODE DONE: Tách Lesson, CourseModule, ModuleItem đa hình.
- ✅ CODE DONE: Cập nhật DbSeeder và sửa lỗi WebApi controllers.
- ✅ CODE DONE: Ứng dụng compile thành công.
- ✅ CODE DONE: Xây dựng CQRS Slices Courses (CreateCourse, AddModule, AddModuleItem) sử dụng MediatR.
- ✅ CODE DONE: Xây dựng FSD Frontend course-builder cơ bản (Vue 3, Composition API) và thêm route.

## Phase 2: Tích hợp Classroom (Strangler Fig Refactoring)
- ✅ CODE DONE: Bổ sung entity ClassroomModuleItemOverride và UserModuleItemProgress.
- ✅ CODE DONE: Cập nhật DbContext với QueryFilter.
- ✅ CODE DONE: Refactor ClassroomController sang CQRS (MediatR), tạo GetClassroomDetailsQuery và UpdateClassroomModuleItemOverrideCommand.
- ✅ CODE DONE: Refactor ClassroomGradingService và ClassroomExcelExportService tương thích hoàn toàn với ModuleItem.
- ✅ CODE DONE: Cung cấp SQL data migration script (chuyển ClassroomLesson cũ sang cấu trúc mới).

## Phase 3: Tích hợp Codelab (Hệ thống chấm mã nguồn)
- ✅ CODE DONE: Tạo entity Codelab và CodelabSubmission cùng Index B-Tree.
- ✅ CODE DONE: Khởi tạo MockCodeJudgeService mô phỏng độ trễ, lỗi biên dịch và Memory Limit.
- ✅ CODE DONE: Thiết lập SubmitCodelabCommand và GetCodelabDetailsQuery (cộng XP qua User.AwardXP()).
- ✅ CODE DONE: Tạo CodelabsController với endpoint /submit.
- ✅ CODE DONE: Frontend FSD Vue 3 + Monaco Editor (CodelabPlayer.vue) tích hợp API gọi SubmitCode, phân chia màn hình Output/Problem.

## Phase 4: Hoàn thiện & Dọn dẹp (Cleanup)
- ✅ CODE DONE: Viết Unit Tests (xUnit + Moq) cho SubmitCodelabCommandHandler.
- ✅ CODE DONE: Tạo tài liệu cleanup_migration.md chứa script SQL DROP các bảng cũ (UserLessonProgresses, ClassroomLessons, ClassroomQuizzes).

### Phase 3 Refactoring - Migration & Enhancement

| Sprint | Nội dung trọng tâm | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Sprint 1** | Vá 8 lỗi tồn đọng hệ thống | ✅ CODE DONE | Fix Ownership (`Classroom`), Fix API Codelab, Cập nhật DTO, Sửa responsive UI Mobile. Đã kiểm thử thành công. |
| **Sprint 2** | Thống Nhất Kiến Trúc CQRS | ✅ CODE DONE | Chuyển đổi `ClassroomService` và `LessonReviewService` sang `IMediator` Commands/Queries. Cập nhật Interface DB. Xóa các service cũ. Đã kiểm thử build thành công. |
| **Sprint 3** | Nâng Cấp Codelab | ✅ CODE DONE | Tạo `CodelabTestCase`, `CodelabTemplate`, hoàn thiện chấm điểm CodelabEngine. API Create/Update Codelab bằng MediatR. |
| **Sprint 4** | End-to-End Learning Flow | ✅ CODE DONE | Tạo `ProgressRuleEngine`, lưu `UserModuleItemProgress`. API GetCourseProgressQuery. Mở khóa tuần tự các ModuleItem. |
| **Sprint 5** | Teacher Panel Hoạt Động Thật | ✅ CODE DONE | Cập nhật `ClassroomGradingService` tính điểm Codelab, `GetUsersQuery`, `GetQuizAnalyticsQuery`, `GetQuizHistoryQuery`. Đã nối thành công API vào Frontend (TeacherAnalyticsTab, TeacherStudentTab). |

### Phase 2 Codelab LeetCode-like Improvements 
| Bc0 | N-c0i dung | Tr-c1ng th-a1i CODE | Chi ti-c1t |
| :--- | :--- | :--- | :--- |
| **Leaderboard** | ThA-add Real-time Leaderboard tab to CodelabPlayer | A-DONE | CodelabPlayer.vue now has Leaderboard tab with mock ranked data, CodelabPlayer.vue has Leaderboard tab with mock ranked data |
| **Hints System** | Tiered Hints with XP cost reveal | A-DONE | CodelabPlayer.vue has Hint tab with tiered reveal, LessonStepCodeLab.vue has hints with XP cost |
| **Submission History** | Track and display submission attempts | A-DONE | CodelabPlayer.vue tracks submission history with pass/fail, runtime, XP score |
| **LeetCode-Style Test Results** | Green check/red X per testcase, pass/fail indicators | A-DONE | Testcase results use a-emerald-400 for pass, rose-400 for fail with bold markers |
| **Reset Code** | Reset to starter/boilerplate code button | A-DONE | CodelabPlayer.vue and LessonStepCodeLab.vue both have reset code functionality |
| **Monaco Editor Unification** | Both LessonStepCodeLab and CodelabPlayer use Monaco | A-DONE | LessonStepCodeLab.vue upgraded from textarea to Monaco editor with same features as CodelabPlayer |
| **Missing CSS Files** | CodelabPickerModal.css and CodelabEditorModal.css created | A-DONE | Both CSS files created with complete modal styling |
| **Graph Edge List Input** | DSAInputForm supports graph edge list format | A-DONE | Placeholder and random generator for graph format (from-to-weight) |


### Hotfix Frontend Broken Imports (29/07/2026)
*   **Pham vi:** Sua 30 broken relative import tren toan frontend (dashboard view, graph view, dsa legend, teacher modals, OOP/SOLID/Patterns/DI view stubs).
*   **Trang thai:** ✅ CODE DONE — ue-tsc --noEmit exit 0, static import checker ind-missing-imports.cjs bao clean.
*   **Chi tiet:** Xem errors.md → Sua Loi 178. Tooling moi: rontend/scripts/find-missing-imports.cjs de tu quet broken imports trong tuong lai.

### Hotfix Frontend Features Audit - Classroom/Teacher/Courses (30/07/2026)
*   **Phạm vi:** Audit 3 khu vực (classroom, teacher, courses) + fix 3 điểm còn tồn đọng.
*   **Trạng thái:** ✅ CODE DONE — ue-tsc --noEmit exit 0, cả 2 static checker pass.
*   **Chi tiết:** 
    - **Mục 1 (Classroom menu link)**: Tạo iews/classroom/MyClassroomsView.vue (gọi /api/Classroom/mine, kèm modal tham gia bằng mã mời). Thêm route /classrooms trong outer/routes.ts. Thêm entry 'Lớp học của tôi' vào group 'Học tập' trong ppTabs.ts (requiresAuth).
    - **Mục 2 (TeacherAnalyticsTab route legacy)**: 3 endpoint (/api/Classroom/mine, /statistics, /export-excel) chỉ tồn tại ở ClassroomController cũ — controller mới /api/v1/classrooms/* không cover teacher-facing statistics + Excel export. Thêm block comment ở đầu <script setup> giải thích lý do giữ legacy URL + hướng dẫn khi backend migrate.
    - **Mục 3 (CodelabBuilderTab empty CRUD)**: Backend CodelabController (/api/v1/codelabs) hiện là STUB — mọi endpoint chỉ return Ok(new { message = "..." }) không persist. Thay 7 hàm rỗng (saveCodelab/saveTestCase/saveTemplate/saveHint/deleteTestCase/deleteTemplate/deleteHint) + 1 hàm deleteCodelab (đang gọi DELETE không tồn tại) bằng helper crudNotImplemented() hiển thị alert 'đang phát triển' + log warning + comment TODO wire-up khi backend ready. Tránh được 'fake success' (200 OK từ stub nhưng data mất khi reload).
*   **Files changed:** +1 created (MyClassroomsView.vue), 4 edited (outes.ts, ppTabs.ts, TeacherAnalyticsTab.vue, CodelabBuilderTab.vue).

### Hotfix Classroom/Teacher/Courses - Payment & Difficulty Fixes (30/07/2026)
*   **Phạm vi:** Fix 2 lỗi production leak + difficulty mismatch trong Teacher panel.
*   **Trạng thái:** ✅ CODE DONE — vue-tsc --noEmit exit 0, dotnet build 0 errors.
*   **Chi tiết:**
    - **Mục 1 (Simulate payment button prod leak):** Cập nhật isDev = import.meta.env.DEV && !import.meta.env.PROD trong PremiumCheckoutView.vue để chắc chắn nút "💰 Mô phỏng: Xác nhận đã thanh toán" chỉ hiển thị trong môi trường development hoàn toàn, không bị leak sang production build.
    - **Mục 2 (Difficulty mismatch TeacherCourseTab):** Cập nhật 3 địa điểm trong TeacherCourseTab.vue: dropdown options (Easy/Medium/Hard → Beginner/Intermediate/Advanced), courseForm reactive default (Medium → Beginner), và cancelCourseEdit reset (Medium → Beginner). Đồng bộ với backend enum CourseDifficulty và các view khác (CoursesListView, CourseDetailView).
*   **Files changed:** 2 edited (PremiumCheckoutView.vue, TeacherCourseTab.vue).

### Dọn dẹp Dead Code & Chuyển đổi System Design (30/07/2026)
*   **Phạm vi:** Dọn dẹp toàn bộ dead code (views, features) không còn sử dụng + chuyển đổi System Design Visualization thành tài liệu lý thuyết.
*   **Trạng thái:** ✅ CODE DONE — vue-tsc --noEmit exit 0, frontend tests 688/688 PASS, find-missing-imports.cjs OK, dotnet build 0 errors.
*   **Chi tiết:**
    - **Xóa 15 dead views:** AnimationView.vue, CompareView.vue, ConcurrencyView.vue, DebugView.vue, DSAModulesView.vue, LeaderboardView.vue, LearningPathView.vue, MultiViewView.vue, PlaygroundView.vue, StateInspectorView.vue, TimelinePlaybackView.vue, di/, oop/, patterns/, solid/ directories.
    - **Xóa dead feature:** smart-quiz (không có bất kỳ import nào trong toàn bộ codebase).
    - **Lưu ý:** animation-engine được giữ lại và đang được sử dụng bởi 8 features hoạt động (custom-input, code-to-visualization, dsa-modules, e-lecture, interactive-playground, lesson, quiz-system, pseudocode-sync).
    - **Chuyển đổi System Design Visualization sang tài liệu:** Tạo 6 file markdown trong frontend/src/features/docs/content/system-design/ (system-design-intro.md, load-balancer.md, server-health.md, packet-routing.md, replication-lag.md, failure-handling.md). Thêm nhóm "THIẾT KẾ HỆ THỐNG" vào docsNavigation.ts với 6 mục.
    - **Xóa System Design Visualization:** Xóa frontend/src/features/system-design-viz/, frontend/src/views/system-design/, route /system trong routes.ts, entry trong appTabs.ts.
    - **Cập nhật visualizerMap.ts:** Chuyển hướng OOP/SOLID/Patterns/DI/SystemDesign tới DocsView.vue.
    - **Cập nhật LessonStepViz.vue:** Chuyển hướng OOP/SOLID tới DocsView.vue.
    - **Dọn routes.ts:** Xóa 13 dòng route comment đã bị vô hiệu hóa.
*   **Files changed:** +6 created (system design docs), 4 edited (routes.ts, appTabs.ts, visualizerMap.ts, LessonStepViz.vue, docsNavigation.ts), 16 deleted (15 views + smart-quiz feature), 2 directories deleted (system-design-viz, system-design views).


---

## 10. Algorithm-Sandbox Overhaul — Fix All Issues

**Issues Fixed:**
| # | Issue | Fix |
|---|-------|-----|
| 1 | Two rendering systems conflict | Kept deprecated; DOM dispatcher active |
| 2 | Only BubbleSortVisualizer for 7 algos | Created SortingVisualizerDispatcher.vue |
| 3 | Type unsafety (frame as any) | Removed mapping; uses currentSortFrame directly |
| 4 | Math.random() fallback IDs | Replaced with global monotonic counter |
| 5 | Barrel exports missing | Added all missing exports + type exports |
| 6 | Duplicate Camera interface | Unified under canvas.types.ts |
| 7 | No try/catch in frame generation | Added in useSortingAnimation |
| 8 | CustomInputParser limit 20 vs 15 | Unified to 15 |
| 9 | getComputedStyle every render frame | Cached with 5s TTL |
| 10 | GraphCanvas no DPR scaling | Added devicePixelRatio |
| 11 | ForceDirectedLayout.isStable() unused | Physics auto-stops after 3 stable frames |
| 12 | No keyboard shortcuts for sorting | Added Space/Arrow/R keys |
| 13 | Fragile heap phase detection | Documented for future refactor |
| 14 | PlaygroundEngine lacks edge mgmt | Centralized in composable |
| 15 | Missing Counting Sort test | Already covered |

**Files Created:** SortingVisualizerDispatcher.vue

**Verification:** All 688 tests pass (51 files)

---

### Phase 2 HTML Playground — CodePen-style HTML/CSS/JS Editor

| B﻿c | Nội dung | Trạng thại CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Types** | PlaygroundLanguage, PlaygroundSource, PLAYGROUND_TABS | ✓ CODE DONE | `types/playground.types.ts` — HTML/CSS/JS tabs, DEFAULT_PLAYGROUND_SOURCE |
| **Engine** | PlaygroundDocumentBuilder — srcdoc generator | ✓ CODE DONE | `PlaygroundDocumentBuilder.ts` — builds full HTML5 doc, escapes `</script>` as `\u003c/script` |
| **Engine** | PlaygroundUrlCodec — lz-string share codec | ✓ CODE DONE | `PlaygroundUrlCodec.ts` — compressToEncodedURIComponent round-trip, null on invalid payload |
| **Engine** | PlaygroundDebouncer — 800ms debounce | ✓ CODE DONE | `PlaygroundDebouncer.ts` — schedule/flush/cancel, stores latest pending callback |
| **Store** | useHtmlPlaygroundStore — Pinia Setup Store | ✓ CODE DONE | `useHtmlPlaygroundStore.ts` — html/css/js refs, documentHtml computed, loadFromSharePayload |
| **UI** | PlaygroundWorkspace — Monaco editor + tabs | ✓ CODE DONE | `PlaygroundWorkspace.vue` — Monaco via @monaco-editor/loader, setModelLanguage per tab, Run/Reset/Chia sẻ, debounce 800ms |
| **UI** | PlaygroundPreview — sandboxed iframe | ✓ CODE DONE | `PlaygroundPreview.vue` — srcdoc iframe, sandbox allow-scripts allow-modals allow-forms allow-popups allow-same-origin |
| **View** | PlaygroundView + route /playground | ✓ CODE DONE | `PlaygroundView.vue`, `routes.ts`, `appTabs.ts` — loads `route.query.code` in setup, encodeURIComponent share URL |
| **Tests** | 19 Unit Tests | ✓ CODE DONE | `PlaygroundDocumentBuilder.spec.ts`, `PlaygroundUrlCodec.spec.ts`, `PlaygroundDebouncer.spec.ts` — ALL PASS |

---

### BDD Test Suite — Module Khóa học & Quiz Backend (2026-08-01)

| Bước | Nội dung | Trạng thái CODE | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Infra** | Vitest setup polyfill | ✅ CODE DONE | `frontend/vitest.setup.ts` — polyfill `localStorage`/`sessionStorage` cho environment=node; đăng ký qua `test.setupFiles` trong `vite.config.ts` |
| **Infra** | jsdom pragma cho spec DOM-dependent | ✅ CODE DONE | `// @vitest-environment jsdom` tại 8 spec cần window/document/canvas (executionControl, AutoHeightResizer, EmbedCommunicationBridge, CanvasConfettiEngine, ExternalStylesheetsInjector, SVGToCanvasExporter, useExportShareStore, useGuidedTourStore) |
| **Unit** | Course Store — 29 tests BDD | ✅ CODE DONE | `frontend/src/features/courses/__tests__/useCourseStore.spec.ts` — loadCourses/filteredCourses/progress/lesson status/first uncompleted lesson/filters |
| **Unit** | Course API — 5 tests BDD | ✅ CODE DONE | `frontend/src/features/courses/__tests__/courseApi.spec.ts` — createCourse/addModule/addModuleItem + error propagation (mock apiClient) |
| **Unit** | Stateless Quiz API — 10 tests BDD | ✅ CODE DONE | `frontend/src/features/quiz-system/__tests__/statelessQuizApi.spec.ts` — getAll/getTopics/getById/getByTopic/submitAttempt + Authorization header + HTTP errors (mock fetch) |
| **Unit** | Quiz Store Backend Mode — 17 tests BDD | ✅ CODE DONE | `frontend/src/features/quiz-system/__tests__/useQuizStoreBackendMode.spec.ts` — catalog/start/select/clamping/submit (-1 cho câu trống)/exit (mock statelessQuizApi) |
| **Integration** | Course + Quiz flow — 4 tests BDD | ✅ CODE DONE | `frontend/src/tests/integration/courseAndQuizFlow.spec.ts` — luồng học viên end-to-end qua fetch mock giả lập backend thật (200/400/404) |
| **Fix** | Bucket Sort duplicate IDs | ✅ CODE DONE | `frontend/src/features/algorithm-sandbox/algorithms/bucketSort.ts` — mergedArrayState hiển thị mỗi phần tử đúng 1 lần (output + remaining) → id unique mọi frame |
| **Tests** | Điều kiện thoát đạt | ✅ CODE DONE | `npm run test` — **822/822 tests PASS (61/61 files) — 100%** |
