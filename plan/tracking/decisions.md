# 🏛️ Nhật Ký Quyết Định Kiến Trúc - Architectural Decision Records (ADR)

Tài liệu này ghi lại các quyết định kiến trúc kỹ thuật cốt lõi (ADR) định hình toàn bộ hệ thống **VisualizationDSA**.

> ⚠️ **Lưu ý:** Chỉ các ADR có code thực tế đã hiện thực hóa mới được ghi nhận tại đây. Các ADR cho tính năng chưa implement được chuyển về phần spec của từng feature trong `plan/features/deep-decomposition/`.

---

## ADR-01: Kiến Trúc Biên Dịch Tĩnh Client-Side First (AST Compilation under 5ms)

- **Trạng thái:** ✅ IMPLEMENTED — `src/core/CompilerStepExecutor.ts`
- **Ngữ cảnh:** Hệ thống cần phản hồi biên dịch mã nguồn giải thuật tùy biến do sinh viên viết để xuất các khung hình hoạt ảnh. Gửi mã lên Backend gây trễ mạng.
- **Quyết định:** Thực thi mã JavaScript trong một Sandbox an toàn (`new Function(...)`) với hàng phòng ngự thứ hai là Regex fallback, sinh chuỗi `PlaybackFrame[]` 100% tại trình duyệt.
- **Hệ quả:** Loại bỏ hoàn toàn độ trễ mạng. Phản hồi biên dịch tức thì. Bộ bảo vệ chống vòng lặp vô hạn giới hạn 10.000 bước.
- **File liên quan:** `CompilerStepExecutor.ts`, test: `CoreAnimationEngine.spec.ts`

---

## ADR-02: Đồng Bộ Hoạt Ảnh Xung requestAnimationFrame (rAF 60 FPS Engine)

- **Trạng thái:** ✅ IMPLEMENTED — `src/core/CoreAnimationEngine.ts`
- **Ngữ cảnh:** Hoạt ảnh di chuyển các phần tử mảng hoán vị dễ bị giật hình nếu dùng `setInterval` hay `setTimeout`.
- **Quyết định:** Vòng lặp rAF bám tần số quét thực tế màn hình (60Hz–144Hz), áp dụng Lerp tuyến tính cho mọi thuộc tính động (vị trí X, màu RGB, scale). DeltaTime được clamp ở 32ms để chống spike khi ẩn tab.
- **Hệ quả:** Hoạt ảnh 60 FPS mượt mà, tự dừng khi ẩn tab, GC-safe (`cancelAnimationFrame` + `renderCallbacks = []` trong `destroy()`).
- **File liên quan:** `CoreAnimationEngine.ts`, `useAnimatedItems.ts`, `ArrayBarVisualizer.vue`

---

## ADR-03: Kiến Trúc VCR Player — Data-Driven Playback

- **Trạng thái:** ✅ IMPLEMENTED — `src/features/vcr-player/store/useVcrStore.ts`
- **Ngữ cảnh:** Canvas không nên chứa logic so sánh hay kiểm tra thuật toán. Cần tách biệt rõ ràng giữa logic sinh dữ liệu và lớp vẽ.
- **Quyết định:** Backend sinh `SortFrame[]` / `PlaybackFrame[]` trước khi play. Canvas chỉ đọc frame tại `currentFrameIndex` từ Pinia Store và vẽ trạng thái đó. VCR Player điều khiển `currentFrameIndex` qua `stepNext()`, `stepPrev()`, `jumpToFrame()`, `setInterval` auto-advance.
- **Hệ quả:** Canvas không có logic thuật toán nào. Scrubber tức thì không cần re-compute. Tốc độ playback chỉnh được qua `playbackSpeed` ref.
- **File liên quan:** `useVcrStore.ts`, `ArrayBarVisualizer.vue`, `VcrControlPanel.vue`

---

## ADR-04: Modular Feature Architecture — Barrel Exports

- **Trạng thái:** ✅ IMPLEMENTED — `src/features/*/index.ts`
- **Ngữ cảnh:** Cần tổ chức code theo tính năng để tránh import spaghetti giữa các module.
- **Quyết định:** Mỗi feature (`algorithm-sandbox`, `vcr-player`, `code-editor`, `quiz`) có file `index.ts` làm barrel export. `App.vue` chỉ import từ barrel, không import trực tiếp vào nội bộ feature khác.
- **Hệ quả:** Import rõ ràng, đổi tên nội bộ không ảnh hưởng consumer bên ngoài. Store `playback.ts` giữ alias deprecated để backward-compat.
- **File liên quan:** `src/features/*/index.ts`, `src/store/playback.ts`

---

## ADR-05: Chuyển Đổi OOP/SOLID/DP/DI Thành Docs Reference Style

- **Trạng thái:** ✅ IMPLEMENTED — `src/features/docs/`
- **Ngữ cảnh:** Việc xây dựng hoạt ảnh tương tác cho các khái niệm trừu tượng (OOP, SOLID) đòi hỏi quá nhiều chi phí và code phức tạp, nhưng không thực sự mang lại hiệu quả trực quan tốt như DSA.
- **Quyết định:** Tạm thời lưu trữ (archive) các module hoạt ảnh của OOP/SOLID/DP/DI. Thay thế bằng kiến trúc **Docs Reference Style** giống với Vue.js Docs, tập trung hoàn toàn vào lý thuyết cốt lõi, ví dụ code C# và so sánh Bad Code vs Good Code.
- **Hệ quả:** Dễ dàng bảo trì, giảm thiểu code rườm rà. Tính năng hoạt ảnh chỉ nên tập trung dồn sức cho thuật toán DSA nơi hiệu quả trực quan cao nhất.
- **File liên quan:** `src/features/docs/*`, `src/views/docs/DocsView.vue`

---

## ADR chờ implement (tham khảo spec)

Các ADR sau đây được ghi trong tài liệu đặc tả nhưng **chưa có code thực tế**:

| ADR         | Tính năng                                     | Sprint    |
| :---------- | :-------------------------------------------- | :-------- |
| ADR-LCOM4   | Tính LCOM4 BFS/DFS đo kết dính SRP            | Sprint 7  |
| ADR-DI-LOOP | Phát hiện Dependency Loop DFS IoC Container   | Sprint 8  |
| ADR-SMOKE   | Hạt khói Canvas GC-Cycle Emitter Server crash | Sprint 11 |
| ADR-VTABLE  | Mô phỏng VTable đa hình OOP client-side       | Sprint 6  |

---

## ADR-BACKEND-DRIVEN: Backend-Driven State Capture cho Phase 1 Animation Engine

- **Trạng thái:** ✅ IMPLEMENTED
- **Ngữ cảnh:** Phase 1 Animation Engine cần kiến trúc mới cho việc trực quan hóa giải thuật, bổ sung bên cạnh kiến trúc Client-Side First hiện tại (ADR-01).
- **Quyết định:** Áp dụng mô hình Backend-Driven State Capture: Backend C# chạy thuật toán, ghi nhận snapshot từng bước vào List FrameDTO, Frontend Vue 3 nhận JSON và phát lại như video player.
- **Hệ quả:**
  - Tính toàn vẹn dữ liệu cao (logic thuật toán C# tường minh).
  - Scrubbing O(1) complexity (thay đổi currentIndex trong Pinia Store).
  - Mở rộng thuật toán mới cực nhanh (chỉ viết C# class kế thừa AlgorithmBase).
  - shallowRef tối ưu RAM Vue 3 (tiết kiệm 95% CPU tracking reactivity).
  - Fallback dummy engine phía Frontend khi Backend chưa sẵn sàng.
- **File liên quan:**
  - Backend: Domain/Engine/AlgorithmBase.cs, BubbleSortExecutor.cs, FrameDTO.cs, AlgorithmsController.cs
  - Frontend: useAnimationStore.ts, CanvasLayer.vue, VisualizationPlayer.vue, algorithmApi.ts
  - Tests: useAnimationStore.spec.ts (16 tests), algorithmApi.spec.ts (7 tests)

---

## ADR-ZERO-TRUST-INPUT: Zero Trust Input Pipeline cho Phase 1 Custom Input Generator

- **Trạng thái:** ✅ IMPLEMENTED
- **Ngữ cảnh:** Tính năng Custom Input cho phép người dùng nhập dữ liệu tự do, tạo rủi ro bảo mật (DDoS qua mảng lớn, injection qua ký tự lạ).
- **Quyết định:** Áp dụng nguyên lý Zero Trust Input Pipeline — xác thực 3 tầng:
  1. Frontend Regex validation (instant UI feedback, khóa nút Execute khi sai).
  2. Backend InputParser (Regex C# quét lại toàn bộ chuỗi thô).
  3. Backend ConstraintResolver (giới hạn phần tử tối đa per-algorithm) + CancellationToken 2s timeout.
- **Hệ quả:**
  - Bảo vệ CPU server khỏi payload mảng khổng lồ.
  - UX phản hồi tức thì (viền đỏ/xanh/cam, đếm phần tử real-time).
  - Sinh mảng ngẫu nhiên thông minh (random/nearly-sorted/reversed) hoàn toàn client-side.
  - Fallback sang dummy engine khi Backend unreachable.
- **File liên quan:**
  - Backend: Domain/Input/InputParser.cs, ConstraintResolver.cs, Application/DTOs/CustomInputRequestDto.cs, AlgorithmsController.cs (custom-execute endpoint)
  - Frontend: custom-input/store/useInputStore.ts, custom-input/components/CustomInputForm.vue
  - Tests: useInputStore.spec.ts (38 tests)

---

## ADR-STRATEGY-DI: Strategy Pattern + Reflection DI cho Phase 1 DSA Modules Library

- **Trạng thái:** ✅ IMPLEMENTED
- **Ngữ cảnh:** Hệ thống cần mở rộng từ 1 thuật toán (Bubble Sort) lên 10+ thuật toán mà không sửa code Controller hoặc logic hiện tại.
- **Quyết định:** Áp dụng Strategy Pattern + Reflection-based DI Auto-Registration:
  1. `IAlgorithmStrategy` interface: mỗi thuật toán là một Plugin class độc lập.
  2. `AlgorithmDIConfiguration.cs`: quét Assembly tự động tìm tất cả class implement IAlgorithmStrategy và đăng ký vào DI Container.
  3. Controller inject `IEnumerable<IAlgorithmStrategy>`: không cần switch-case, không cần sửa code khi thêm thuật toán mới.
  4. Frontend Dynamic Component: `<component :is>` tự chuyển renderer theo category (Sorting→Bars, Searching→Boxes, Tree→Nodes, Stack-Queue→Tube).
- **Hệ quả:**
  - Open/Closed Principle hoàn hảo: thêm thuật toán mới = chỉ tạo 1 file C# class.
  - 10 thuật toán đầy đủ: BubbleSort, SelectionSort, InsertionSort, QuickSort, MergeSort, LinearSearch, BinarySearch, Stack, Queue, BST.
  - 4 Canvas Renderers chuyên biệt: BarChart (sorting bars), BoxArray (search boxes + Low/Mid/High pointers), TreeRenderer (BST node circles + edges), TubeRenderer (Stack vertical LIFO / Queue horizontal FIFO).
  - Binary Search validation gate: từ chối mảng chưa sắp xếp với HTTP 400.
  - Fallback dummy generators cho tất cả 10 thuật toán khi Backend chưa sẵn sàng.
- **File liên quan:**
  - Backend: Domain/Strategies/IAlgorithmStrategy.cs, AlgorithmStrategyBase.cs, 10 Strategy files, Infrastructure/Extensions/AlgorithmDIConfiguration.cs
  - Frontend: dsa-modules/store/useAlgorithmStore.ts, dsa-modules/services/dummyGenerators.ts, dsa-modules/components/DSAPlayer.vue, AlgorithmVisualizer.vue, 4 renderers
  - Tests: useAlgorithmStore.spec.ts (10), dummyGenerators.spec.ts (19), dsaApi.spec.ts (3), algorithmCatalog.spec.ts (8) — 40 tests total

---

## ADR-E-LECTURE: Script-driven E-Lecture Mode (Phase 1 — Cognitive Load Theory)

- **Trạng thái:** ✅ IMPLEMENTED
- **Ngữ cảnh:** Hệ thống cần chế độ bài giảng điện tử dẫn dắt sinh viên qua từng bước giải thuật theo kịch bản sư phạm (Cognitive Load Theory), không hardcode logic UI mà dùng JSON script.
- **Quyết định:** Áp dụng Script-driven Architecture với 3 trụ cột:
  1. `LectureScript` JSON schema: mỗi bài giảng là mảng `Slide[]`, mỗi slide chứa `SlideAction` với 3 lệnh (`RESET_CANVAS`, `PLAY_UNTIL`, `PAUSE`).
  2. `useLectureStore` orchestration: điều phối slide + đồng bộ `useAnimationStore.playUntilFrame()` Promise — tự động minimize panel (opacity 0.15, scale 0.88) khi Canvas chạy hoạt ảnh.
  3. `interactionLocked` state: khóa Timeline/Speed/CustomInput controls khi bài giảng đang hoạt động, mở khóa khi exitLecture.
- **Hệ quả:**
  - Thêm bài giảng mới = chỉ tạo 1 file JSON, không sửa code Vue/Pinia.
  - Glassmorphism overlay panel: backdrop-blur 16px, dimmed backdrop 40% opacity.
  - 3 slide types: theory (static), guided-animation (PLAY_UNTIL auto-play), interactive-check (pause + chờ user).
  - Keyboard shortcuts: Arrow Right/Left (slide nav), Esc (exit lecture).
  - Backend API: `GET /api/v1/lectures/{algorithmId}` với Cache-Control 7 days.
  - Bundled JSON fallback: `bubble-sort-intro.json` tải offline không cần API.
- **File liên quan:**
  - Frontend: e-lecture/store/useLectureStore.ts, e-lecture/components/LectureOverlay.vue, e-lecture/services/lectureLoader.ts, e-lecture/types/lecture.types.ts
  - Backend: Domain/Lectures/Lecture.cs, LectureRepository.cs, WebApi/Controllers/LecturesController.cs
  - Extended: animation-engine/store/useAnimationStore.ts (playUntilFrame, goToFrame, interactionLocked)
  - Tests: useLectureStore.spec.ts (13), lectureLoader.spec.ts (7), animationStoreExtensions.spec.ts (8) — 28 tests total

---

## ADR-EXECUTION-CONTROL: VCR Control Panel Nâng cấp (Phase 1 — Command Issuer Pattern)

- **Trạng thái:** ✅ IMPLEMENTED
- **Ngữ cảnh:** Hệ thống cần bảng điều khiển VCR chuyên nghiệp kiểu YouTube/Netflix player: Replay, Dynamic Tooltip, Throttled Scrubbing 30 FPS, localStorage persistence, enhanced keyboard shortcuts.
- **Quyết định:** Áp dụng Command Issuer Pattern + Composable Architecture:
  1. `AnimControlPanel.vue` chỉ phát lệnh tới `useAnimationStore`, không xử lý logic Canvas — Loose Coupling.
  2. `useThrottledScrub` composable: Throttle 33ms (~30 FPS) khi kéo tua slider, tự động pause khi bắt đầu scrub.
  3. `usePlaybackHotkeys` composable: Global keyboard listener với input focus guard (INPUT/TEXTAREA/SELECT), Shift+Arrow rewind/fast-forward, interactionLocked guard, auto-cleanup onUnmount.
  4. `useSliderTooltip` composable: Dynamic tooltip hiển thị explanation khi hover slider, truncateText 55 chars.
  5. `useSpeedPreferences` composable: localStorage persistence cho `dsa_preferences.defaultSpeed`, init speed on mount.
  6. Replay button: Play→Pause→Replay (↩) auto-switch theo playbackState (PLAYING/PAUSED/FINISHED).
  7. YouTube-style slider: Emerald neon progress track, glow thumb, hover height transition.
  8. E-Lecture lock: opacity 0.5 + pointer-events none khi interactionLocked=true.
- **Hệ quả:**
  - Thanh trượt kéo tua mượt mà 30 FPS, không lag CPU.
  - Phím tắt toàn cục (Space, Arrow, Shift+Arrow, R, Esc) không xung đột với Custom Input textarea.
  - Tốc độ phát yêu thích được lưu qua phiên qua localStorage.
  - togglePlay() action mới trong useAnimationStore.
- **File liên quan:**
  - Frontend: animation-engine/composables/useSpeedPreferences.ts, useThrottledScrub.ts, usePlaybackHotkeys.ts, useSliderTooltip.ts
  - Component: animation-engine/components/AnimControlPanel.vue (rewritten)
  - Store: animation-engine/store/useAnimationStore.ts (added togglePlay)
  - Tests: executionControl.spec.ts (23 tests)

---

## ADR-PLAYGROUND-CANVAS: Mathematical Collision Canvas cho Phase 1 Interactive Playground

- **Trạng thái:** ✅ IMPLEMENTED
- **Ngữ cảnh:** Interactive Playground cần cho phép người dùng vẽ đồ thị tự do (nodes + edges) với khả năng co giãn đàn hồi, nhưng DOM-based rendering (div per node) gây giật lag khi kết hợp Force-Directed Physics ở 60 FPS.
- **Quyết định:** Áp dụng 100% HTML5 Canvas 2D Context + Mathematical Collision Checking:
  1. **Single Event Listener pattern:** Chỉ đăng ký 1 bộ mousedown/mousemove/mouseup lên canvas, dùng Euclidean distance để hit-test nodes và point-to-segment distance để hit-test edges.
  2. **GraphGeometryEngine:** Thuật toán atan2 tính arrowhead placement dừng sát viền ngoài node (không đâm xuyên tâm).
  3. **ForceDirectedEngine:** Coulomb repulsion (K=4000) + Hooke spring (K=0.05, L=150) + damping 0.85 + stability auto-stop.
  4. **Pinia usePlaygroundStore:** 5 tool modes (SELECT/ADD_NODE/ADD_EDGE/WEIGHT/DELETE), NodeDTO/EdgeDTO, cascade delete, max 30 nodes constraint.
  5. **GraphParser:** Client-side graph-to-adjacency-list converter + BFS connectivity check + JSON export/import.
  6. **Glassmorphism FloatingToolbar:** Vertical toolbar với backdrop-filter blur(12px), emerald active glow, keyboard shortcuts (V/N/E/W/Del).
- **Hệ quả:**
  - 60 FPS mượt mà cho đồ thị 30 nodes + 100 edges với physics simulation.
  - Rubber-band dashed line + snap glow khi vẽ edge.
  - Weight popover tại midpoint cạnh (auto-focus, Enter/Blur/Esc).
  - Isolated node detection trước khi submit API (BFS connectivity).
  - Export/Import JSON file cho chia sẻ bản vẽ.
- **File liên quan:**
  - Frontend: interactive-playground/store/usePlaygroundStore.ts, engine/GraphGeometryEngine.ts, engine/ForceDirectedEngine.ts, services/GraphParser.ts
  - Components: PlaygroundCanvas.vue, FloatingToolbar.vue, InteractivePlayground.vue
  - Tests: interactivePlayground.spec.ts (31 tests)

---

## ADR-PSEUDOCODE-SYNC: LogicalId Cross-Language Mapping cho Phase 1 Pseudocode Sync

- **Trạng thái:** ✅ IMPLEMENTED
- **Ngữ cảnh:** Hệ thống cần đồng bộ real-time giữa Canvas animation frames và dòng mã nguồn đa ngôn ngữ (C++, Java, Python, JavaScript), đồng thời hiển thị biến Watch Panel động theo từng bước thuật toán.
- **Quyết định:** Áp dụng LogicalId Cross-Language Mapping Architecture:
  1. **LogicalId abstraction:** Mỗi dòng code đều gắn `logicalId` trừu tượng (FUNC_DECL, COMPARE_STEP, SWAP_STEP) — cùng logicalId ánh xạ sang dòng vật lý khác nhau tùy ngôn ngữ (C++ line 5 = Python line 6).
  2. **FrameDTO extension:** Mở rộng interface `FrameDTO` với `activeLogicalLineId` và `variables: Record<string, string|number>` — mỗi frame biết đang thực thi dòng logic nào và giá trị biến tại thời điểm đó.
  3. **PseudocodeSyncEngine:** Core logic 6 static methods — `getPhysicalLineNumber` (logicalId→physical line), `findFirstFrameIndexForLogicalLine` (Click-to-Snap), `findAllFrameIndicesForLogicalLine`, `getNextCycleFrameIndex` (cycle navigation), `transformVariablesForWatch`, `getOccurrenceCount`.
  4. **usePseudocodeStore:** Pinia Setup Store lắng nghe `useAnimationStore.activeFrame` reactive — tự động tính `activePhysicalLineNumber` và `watchVariablesList` mà không cần event bus hay manual subscription.
  5. **Script registry pattern:** `scriptLoader.ts` + `PseudocodeScript` interface — thêm thuật toán mới = chỉ tạo 1 file script TypeScript, không sửa store hay component.
- **Hệ quả:**
  - Chuyển ngôn ngữ tab tức thì, highlight dòng tự động cập nhật qua logicalId mapping.
  - Click-to-Snap luôn nhảy tới FIRST occurrence (BEHAVIOR_SPEC), cycle navigation qua tất cả occurrences.
  - Watch Panel hiển thị biến live, ẩn undefined/null (Out-of-Scope handling).
  - Occurrence badge (1/5) cho các dòng thực thi nhiều lần (nested loops).
  - Mở rộng sang thuật toán mới = chỉ thêm 1 script file + cập nhật dummy generator.
- **File liên quan:**
  - Types: animation-engine/types/animation.types.ts (FrameDTO extended), pseudocode-sync/types/pseudocode.types.ts
  - Engine: pseudocode-sync/engine/PseudocodeSyncEngine.ts
  - Store: pseudocode-sync/store/usePseudocodeStore.ts, animation-engine/store/useAnimationStore.ts (activeFrame alias)
  - Components: pseudocode-sync/components/MultilingualCodePanel.vue, VariableWatchPanel.vue
  - Scripts: pseudocode-sync/scripts/bubble-sort.pseudocode.ts, scriptLoader.ts
  - Integration: animation-engine/components/VisualizationPlayer.vue, animation-engine/services/algorithmApi.ts
  - Tests: PseudocodeSyncEngine.spec.ts (15), usePseudocodeStore.spec.ts (15), scriptLoader.spec.ts (7) — 37 tests total

---

## ADR-12: In-Canvas Hit-Target Verification (Euclidean Distance Quiz Engine)

- **Trạng thái:** ✅ IMPLEMENTED — `quiz-system/engine/QuizVerificationEngine.ts`
- **Ngữ cảnh:** Phase 1 Quiz System cần hỗ trợ câu hỏi CANVAS_TARGET — người học click trực tiếp vào node trên Canvas để trả lời, thay vì chọn phương án A/B/C/D truyền thống. Cần phương pháp xác minh va chạm (hit detection) chính xác.
- **Quyết định:**
  1. **Euclidean distance hit detection:** Sử dụng khoảng cách Euclid `d = sqrt((x - node.x)² + (y - node.y)²)` để xác định node nào bị click. Nếu `d ≤ node.radius` → hit. Tối ưu bằng so sánh `d² ≤ r²` tránh `Math.sqrt()`.
  2. **Client-Side Verification:** Toàn bộ chấm điểm diễn ra ở trình duyệt qua `QuizVerificationEngine` static methods — không cần API roundtrip.
  3. **Checkpoint Registry Pattern:** `quizLoader.ts` + `QuizScript` interface — thêm thuật toán mới = chỉ tạo 1 file quiz script, không sửa store hay component.
  4. **localStorage Stats Persistence:** `QuizStatsManager` lưu thống kê (totalAttempts, correctAnswers, streak, completedQuizzes) vào `dsa_quiz_statistics` key, xử lý corrupted data gracefully.
  5. **Checkpoint Repetition Prevention:** `completedCheckpointIndexes` array ngăn câu hỏi trigger lại khi tua ngược timeline.
  6. **Lecture Interaction Lock:** Khi quiz active, `useLectureStore.lockLectureInteraction()` pause animation + set `interactionLocked=true`, `dismissQuestionAndContinue()` unlock.
- **Hệ quả:**
  - Câu hỏi MC/TF/CANVAS_TARGET đều xử lý qua cùng quiz store pipeline.
  - Blank space click bỏ qua (không đếm sai), chỉ submit khi đúng matchedNodeId.
  - Glassmorphism overlay + Neon glow (emerald/rose) + shake animation cho UX feedback tức thì.
  - Quiz Summary Card hiển thị accuracy/streak/correct badges khi hoàn thành tất cả checkpoints.
  - Mở rộng sang thuật toán mới = chỉ thêm 1 quiz script file + register vào quizLoader.
- **File liên quan:**
  - Types: quiz-system/types/quiz.types.ts
  - Engine: quiz-system/engine/QuizVerificationEngine.ts, QuizStatsManager.ts, QuizSchemaValidator.ts
  - Store: quiz-system/store/useQuizStore.ts, e-lecture/store/useLectureStore.ts (lock/unlock/resume)
  - Components: quiz-system/components/QuizCardOverlay.vue, QuizSummaryCard.vue
  - Scripts: quiz-system/scripts/bubble-sort.quiz.ts, quizLoader.ts
  - Integration: animation-engine/components/VisualizationPlayer.vue (checkpoint watch)
  - Tests: QuizVerificationEngine.spec.ts (12), QuizStatsManager.spec.ts (9), QuizSchemaValidator.spec.ts (11), useQuizStore.spec.ts (18), quizLoader.spec.ts (4) — 54 tests total

---

## ADR-13: AST Instrumentation & Web Worker Sandbox (Phase 2 Code-to-Visualization Compiler)

- **Trạng thái:** ✅ IMPLEMENTED — `code-to-visualization/engine/ASTInstrumentationEngine.ts`, `WorkerLifecycleCoordinator.ts`
- **Ngữ cảnh:** Phase 2 Code-to-Visualization yêu cầu biên dịch mã JavaScript tùy biến do sinh viên viết thành chuỗi hoạt ảnh trực quan. Cần AST parsing an toàn, injection tracing tự động, và sandbox execution cô lập.
- **Quyết định:**
  1. **Acorn + acorn-walk + escodegen pipeline:** Parse raw JS → AST (ecmaVersion 2020) → Walk AST nodes → Inject tracing → Regenerate code. Hoàn toàn client-side, không cần backend.
  2. **BinaryExpression instrumentation:** Tự động phát hiện `arr[i] > arr[j]` (MemberExpression with computed property) và thay thế bằng `traceCompare(arr, i, j, ">")` để ghi nhận COMPARE frame.
  3. **AssignmentExpression instrumentation:** Phát hiện `arr[i] = value` và thay thế bằng `traceAssign(arr, i, value)` để ghi nhận SWAP/ACCESS frame.
  4. **Dual Loop Protection:** AST-injected `__loopCounter` (max 5000 iterations per loop) + Worker timeout (1500ms). Hai lớp bảo vệ chống infinite loop.
  5. **Web Worker Sandbox:** Blob URL lifecycle management — create Blob → URL.createObjectURL → Worker constructor → terminate + URL.revokeObjectURL. Cô lập execution thread, không block UI.
  6. **LiveFrameDTO → FrameDTO conversion:** `useLiveCompilerStore.convertToAnimationFrames()` chuyển đổi trace events thành FrameDTO chuẩn, tái sử dụng hoàn toàn CanvasLayer + AnimControlPanel từ Phase 1.
  7. **Monaco Editor algolens-dark theme:** Custom theme với keyword purple (#C084FC), string emerald (#34D399), number amber (#F59E0B), background Slate (#1E293B). JetBrains Mono font.
- **Hệ quả:**
  - Sinh viên viết JS code sắp xếp → nhấn RUN → xem hoạt ảnh 60 FPS trên Canvas, không cần backend.
  - Bảo vệ chống vòng lặp vô hạn 2 tầng: AST guard + Worker timeout.
  - Tái sử dụng 100% animation infrastructure từ Phase 1 (CanvasLayer, AnimControlPanel, useAnimationStore).
  - Monaco Editor IDE chuyên nghiệp với syntax highlighting, error glow, status indicators.
  - Compiler Console hiển thị nhật ký biên dịch real-time với Neon color coding.
- **File liên quan:**
  - Types: code-to-visualization/types/compiler.types.ts
  - Engine: code-to-visualization/engine/ASTInstrumentationEngine.ts, WorkerLifecycleCoordinator.ts
  - Store: code-to-visualization/store/useLiveCompilerStore.ts
  - Components: code-to-visualization/components/MonacoEditorPanel.vue, CompilerConsole.vue, CodeWorkspace.vue
  - Module: code-to-visualization/index.ts (barrel export)
  - Integration: App.vue (Code IDE tab)
  - Tests: ASTInstrumentationEngine.spec.ts (14), WorkerLifecycleCoordinator.spec.ts (7), useLiveCompilerStore.spec.ts (11) — 32 tests total

---

## ADR-14: Side-by-Side Algorithm Comparator — Dual Canvas Unified Playback

- **Trạng thái:** ✅ IMPLEMENTED
- **Ngữ cảnh:** Sinh viên cần so sánh trực quan hiệu năng Big-O giữa 2 thuật toán (ví dụ Bubble Sort vs Quick Sort) chạy trên cùng một mảng dữ liệu.
- **Quyết định:** Triển khai Split Screen 50/50 với 2 Canvas độc lập props-driven, điều phối bởi `useCompareAlgorithmsStore` Pinia store. Hỗ trợ 2 chế độ phát:
  - **Independent:** Mỗi bên chạy với tốc độ base, thuật toán nhanh hơn kết thúc trước với badge "Hoàn thành".
  - **Normalized:** Tốc độ căn chỉnh (thuật toán dài giữ base speed, ngắn giảm tỷ lệ) để cả 2 cùng kết thúc đồng thời.
- **Kiến trúc:**
  - `UnifiedPlaybackCoordinator` — syncProgressByPercent (percent → frame mapping), calculateAlignedSpeeds.
  - `UnifiedRenderScheduler` — Gom 2 Canvas vào 1 vòng rAF tối ưu GPU.
  - `CompareCanvasPanel.vue` — Reusable props-driven Canvas (tách biệt khỏi global useAnimationStore).
  - Stats extraction từ FrameDTO highlights (comparisons = frames with compare[], swaps = frames with swap[]).
  - Fair comparison: Single seed array, cloned vào cả 2 generators.
- **Hệ quả:** Sinh viên trực quan thấy Quick Sort (O(N log N)) xong trước Bubble Sort (O(N²)) hàng chục bước; bảng thống kê Cyan vs Emerald cập nhật real-time.
- **File liên quan:**
  - Types: compare-algorithms/types/compare.types.ts
  - Engine: compare-algorithms/engine/UnifiedPlaybackCoordinator.ts, UnifiedRenderScheduler.ts
  - Store: compare-algorithms/store/useCompareAlgorithmsStore.ts
  - Components: CompareAlgorithmSelector.vue, CompareCanvasPanel.vue, ComparativeDashboard.vue, CompareWorkspace.vue
  - Module: compare-algorithms/index.ts (barrel export)
  - Integration: App.vue ("So sánh" tab)
  - Tests: UnifiedPlaybackCoordinator.spec.ts (10), useCompareAlgorithmsStore.spec.ts (19), UnifiedRenderScheduler.spec.ts (4) — 33 tests total

---

## ADR-15: Concurrency Visualizer — Event-Driven Thread Simulation & DFS Deadlock Detection

- **Trạng thái:** ✅ IMPLEMENTED
- **Ngữ cảnh:** Sinh viên cần hiểu cơ chế đa luồng (Race Condition, Deadlock, Producer-Consumer, Dining Philosophers) nhưng OS thread thật không thể pause/scrub/replay.
- **Quyết định:** Triển khai Event-Driven Simulation Engine 100% client-side, mô phỏng Thread State Machine (READY → RUNNING → BLOCKED ↔ RUNNING → FINISHED) qua chuỗi `ScenarioStep[]` tuần tự. Mutex Lock dùng queue-based acquisition: thread bị BLOCKED nếu lock đã chiếm, tự thức dậy (RUNNING) khi lock được giải phóng. Deadlock detection qua DFS trên Wait-For Graph (WFG) — adjacency list: Thread A → Thread B khi A chờ lock mà B giữ. Chu trình DFS (recStack) = Deadlock.
- **Kiến trúc:**
  - `ConcurrencySimulationEngine` — acquireLock (queue), releaseLock (wake signal), moveThread (progress 0-100%), incrementCounter, getEngineState.
  - `DeadlockDetector` — static detectDeadlock: build WFG adjacency, DFS with recStack, extract cycleThreadIds.
  - `useConcurrencyStore` — Pinia setup store: step-by-step execution, history snapshots (scrub backward via snapshot restore), deadlock check after every step, togglePlayPause, scrubToStep, setMutexEnabled.
  - `ThreadRailsCanvas.vue` — Horizontal rails (Slate), runner nodes (Cyan/Amber/Emerald neon), Critical Section gate (rose overlay), Mutex padlock icon (open/locked), Deadlock Neon Rose pulse animation.
  - 4 scenario presets: Race Condition (24 steps), Deadlock Demo (12 steps), Producer-Consumer (18 steps), Dining Philosophers (20 steps).
- **Hệ quả:** Sinh viên toggle Mutex BẬT/TẮT để thấy Race Condition vs Synchronized. Deadlock tự phát hiện với neon rose alert. Toàn bộ pausable/seekable/replayable.
- **File liên quan:**
  - Types: concurrency-viz/types/concurrency.types.ts
  - Engine: concurrency-viz/engine/ConcurrencySimulationEngine.ts (includes DeadlockDetector)
  - Store: concurrency-viz/store/useConcurrencyStore.ts
  - Scenarios: concurrency-viz/scenarios/concurrencyScenarios.ts (4 presets)
  - Components: ThreadRailsCanvas.vue, ConcurrencyWorkspace.vue
  - Module: concurrency-viz/index.ts (barrel export)
  - Integration: App.vue ("Đa luồng" tab)
  - Tests: ConcurrencySimulationEngine.spec.ts (16), useConcurrencyStore.spec.ts (19) — 35 tests total

---

## ADR-16: Debug Mode — Generator Yield Coroutine Pattern for Pauseable Algorithmic Stepping

- **Trạng thái:** ✅ IMPLEMENTED
- **Ngữ cảnh:** Sinh viên cần debug từng dòng code thuật toán JavaScript, xem biến thay đổi, call stack, và trạng thái mảng tại mỗi bước — giống IDE debugger thật (VS Code F10/F11/F5).
- **Quyết định:** Triển khai Generator Yield Coroutine Pattern 100% client-side:
  1. **AST → Generator function*:** Acorn parser chuyển đổi `function` → `function*`, tiêm `yield { lineNumber, arrayState, variables, callStack }` sau mỗi dòng thực thi.
  2. **Iterator .next() Stepping:** `LiveCompilerDebugger` gọi `generator.next()` để bước từng dòng, lưu history[] cho step backward.
  3. **Breakpoint hit detection:** `continueToNextBreakpoint()` loop `.next()` cho đến khi `lineNumber ∈ breakpoints Set`, max 5000 steps timeout.
  4. **Step Out:** Loop `.next()` cho đến khi `callStack.length < currentDepth`.
  5. **Safety Guards:** `__loopCounter > 5000` chống infinite loop, `__recursionDepth > 500` chống stack overflow.
  6. **Variable Mutation Detection:** So sánh `old vs new watchedVariables` mỗi bước, highlight Cyan Neon cho biến thay đổi.
- **Kiến trúc:**
  - `DebuggerYieldEngine` — compileToDebugGenerator (Acorn parse → AST walk → escodegen regenerate)
  - `LiveCompilerDebugger` — Iterator controller (stepForward/stepBackward/continueToNextBreakpoint/stepOut)
  - `useLiveDebuggerStore` — Pinia store (status FSM, breakpoints, callStack, watchedVars, mutatedKeys)
  - `DebugWorkspace.vue` — Monaco Editor (algolens-debug theme, gutter breakpoints rose dots, active line Cyan) + DebugCanvas + CallStackVisualizer + DebugWatchPanel + VCR debug controls
- **Hệ quả:** Sinh viên thấy code highlight dòng đang chạy, biến thay đổi real-time, call stack 3D Glassmorphism, mảng animate. Toàn bộ pauseable/seekable/stepable — không cần Backend.
- **File liên quan:**
  - Types: debug-mode/types/debug.types.ts
  - Engine: debug-mode/engine/DebuggerYieldEngine.ts, LiveCompilerDebugger.ts
  - Store: debug-mode/store/useLiveDebuggerStore.ts
  - Components: DebugWorkspace.vue, CallStackVisualizer.vue, DebugWatchPanel.vue, DebugCanvas.vue
  - Module: debug-mode/index.ts (barrel export)
  - Integration: App.vue ("Debug" tab)
  - Tests: DebuggerYieldEngine.spec.ts (15), LiveCompilerDebugger.spec.ts (13), useLiveDebuggerStore.spec.ts (21) — 49 tests total

---

## ADR-17: Design Patterns Visualizer — SVG Cubic Bezier UML Diagram with Reactive Drag-and-Drop

- **Trạng thái:** ✅ IMPLEMENTED
- **Ngữ cảnh:** Sinh viên cần hiểu các mẫu thiết kế (Strategy, Observer) và nguyên tắc SOLID (DIP) qua sơ đồ UML tương tác, nhưng sơ đồ tĩnh không thể hiện runtime behavior (swap Strategy, notify Observer, toggle DIP).
- **Quyết định:** Triển khai SVG Cubic Bezier UML Diagram 100% client-side:
  1. **Cubic Bezier Path Calculation:** `M startX,startY C cp1X,cp1Y cp2X,cp2Y endX,endY` với controlOffset = max(30, min(100, deltaY * 0.5)) đảm bảo đường cong mượt mà giữa các node ở mọi khoảng cách.
  2. **Reactive Drag-and-Drop:** Vue 3 reactivity tracking node positions (x, y), SVG paths tự động recalculate qua pathCache reactive Map, global window mousemove/mouseup cho UX drag mượt.
  3. **Strategy Runtime Swap:** Link dependency từ Client snap sang concrete Strategy mới (BubbleSort ↔ QuickSort), Amber neon glow cho active target.
  4. **Observer Notify Pulse:** CSS stroke-dashoffset animation 1.2s infinite linear lan tỏa từ Subject qua SVG paths tới Observers, Cyan neon glow.
  5. **DIP Toggle Sandbox:** Switch giữa "Highly Coupled" (direct red line, 85%) và "Loosely Coupled" (blue lines through IDatabase Interface, 20%) để dạy Dependency Inversion Principle.
  6. **Glassmorphism UML Nodes:** backdrop-blur(12px), rgba background, stereotype headers (<<interface>>, <<abstract>>), JetBrains Mono font.
- **Kiến trúc:**
  - `DesignPatternVisualizerEngine` — calculateBezierPath, updateNodePosition (clamped), swapStrategyTarget, calculateAllPaths, replaceState
  - `useDesignPatternsStore` — Pinia setup store: initializeScenario, handleNodeDrag, switchStrategy, triggerObserverNotify (2s timeout), toggleDIP, couplingIndexMetric computed (85→20), pathCache reactive
  - `ClassNodeCard.vue` — Glassmorphism cards with drag
  - `DesignPatternsCanvas.vue` — SVG layer + HTML overlay
  - `DesignPatternsWorkspace.vue` — Scenario tabs + controls
  - 3 scenario presets: Strategy Pattern (4 nodes), Observer Pattern (5 nodes), DIP Sandbox (2+1 nodes)
- **Hệ quả:** Sinh viên thấy trực quan Strategy swap (Amber line snaps), Observer notify (Cyan pulse flows), DIP toggle (Interface xuất hiện/biến mất, coupling index 85→20). Toàn bộ draggable + interactive.
- **File liên quan:**
  - Types: design-patterns/types/design-patterns.types.ts
  - Engine: design-patterns/engine/DesignPatternVisualizerEngine.ts
  - Store: design-patterns/store/useDesignPatternsStore.ts
  - Scenarios: design-patterns/scenarios/scenarioData.ts (3 presets)
  - Components: ClassNodeCard.vue, DesignPatternsCanvas.vue, DesignPatternsWorkspace.vue
  - Module: design-patterns/index.ts (barrel export)
  - Integration: App.vue ("Patterns" tab — replaced PatternSandbox)
  - Tests: DesignPatternVisualizerEngine.spec.ts (18), useDesignPatternsStore.spec.ts (22), scenarioData.spec.ts (10) — 50 tests total

---

## ADR-18: Architecture Refactoring — Vue Router Lazy Loading + Backend Middleware + FSD Chu?n hóa

- **Tr?ng thái:** `? IMPLEMENTED` — 2026-05-25
- **Quy?t ð?nh:** (1) Vue Router 4 + dynamic import lazy loading, (2) App.vue refactor thành Shell Component 80 d?ng, (3) Database.Migrate() thay EnsureCreated(), (4) ErrorHandlingMiddleware + SecurityHeadersMiddleware, (5) algorithm-sandbox/engine/ subfolder FSD.
- **H? qu?:** Initial bundle gi?m ~80%, thêm tab m?i không s?a App.vue, Backend error JSON chu?n hóa, b?o m?t 7 security headers.

---

## ADR-19: Backend Integrity & Security Upgrades — Transactions, OCC, Signature Webhook & Automated Tests

- **Trạng thái:** `✅ IMPLEMENTED` — 2026-05-25
- **Quyết định:** (1) Triển khai Database Transaction trong Unit of Work để bọc webhook xử lý thanh toán, (2) Cấu hình Optimistic Concurrency Control (OCC) sử dụng shadow property `xmin` của PostgreSQL trên thực thể User, (3) Hỗ trợ xác thực webhook SePay bằng chữ ký bảo mật HMAC-SHA256, (4) Tích hợp FluentValidation tự động kiểm tra tính hợp lệ của request payload, (5) Tạo dự án Unit Tests xUnit cho backend.
- **Hệ quả:** Webhook thanh toán an toàn, đảm bảo tính nguyên tử (atomicity), tránh race condition khi cộng XP đồng thời, tăng tính tin cậy của mã nguồn qua bộ 6 unit tests phủ 100% pass cho AuthService và GamificationService.
- **File liên quan:**
  - Interfaces: [IUnitOfWork.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/Domain/Interfaces/IUnitOfWork.cs)
  - Repositories: [UnitOfWork.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/Infrastructure/Repositories/UnitOfWork.cs)
  - Services: [PaymentService.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/Infrastructure/Services/PaymentService.cs)
  - Entities: [User.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/Domain/Entities/User.cs)
  - Data: [ApplicationDbContext.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/Infrastructure/Data/ApplicationDbContext.cs)
  - Controllers: [PaymentsController.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/WebApi/Controllers/PaymentsController.cs)
  - Middlewares: [ErrorHandlingMiddleware.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/WebApi/Middlewares/ErrorHandlingMiddleware.cs)
  - Project Test: [VisualizationDSA.UnitTests.csproj](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/tests/VisualizationDSA.UnitTests/VisualizationDSA.UnitTests.csproj)
  - Tests: [GamificationServiceTests.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/tests/VisualizationDSA.UnitTests/Services/GamificationServiceTests.cs), [AuthServiceTests.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/tests/VisualizationDSA.UnitTests/Services/AuthServiceTests.cs)


---

## ADR-20: Backend Performance, Resilience, Observability & API Versioning Upgrades

- **Trạng thái:** `✅ IMPLEMENTED` — 2026-05-25
- **Quyết định:**
  1. **Bộ nhớ đệm (Caching):** Đăng ký `IMemoryCache` và áp dụng trong `LeaderboardService` để cache top 20 users xếp hạng trong vòng 60 giây, giúp giảm tải tối đa các truy vấn lặp lại liên tục lên database.
  2. **Chỉ mục cơ sở dữ liệu (Database Indexing):** Cấu hình index cột `TotalXP` cho thực thể `User` trong `ApplicationDbContext` để tối ưu hóa hiệu năng câu lệnh sắp xếp (sorting) trên PostgreSQL, đồng thời sinh migration `AddUserTotalXpIndex`.
  3. **Tự động thử lại (Database Connection Resiliency):** Cấu hình `EnableRetryOnFailure()` của Npgsql khi đăng ký `DbContext` giúp hệ thống tự phục hồi từ các lỗi kết nối mạng tạm thời.
  4. **Log có cấu trúc phong phú (Serilog LogContext Middleware):** Viết `UserLoggingMiddleware` để tự động trích xuất `UserId` từ Claims của JWT và đưa vào `Serilog.Context.LogContext.PushProperty`, hỗ trợ quan sát hành vi của người dùng trong log hệ thống.
  5. **API Versioning chính thức:** Tích hợp gói NuGet `Asp.Versioning.Mvc` và `Asp.Versioning.Mvc.ApiExplorer` (phiên bản v8.1.0 tương thích .NET 9.0) để quản lý phiên bản API qua route. Refactor toàn bộ 10 controllers sang routing dạng `api/v{version:apiVersion}/[controller]`.
- **Hệ quả:**
  - Hiệu năng API Leaderboard được cải thiện đột phá (Response time dưới 2ms cho các lượt request cache).
  - Tối ưu truy vấn SQL sắp xếp của PostgreSQL.
  - Tăng độ tin cậy và tự phục hồi của kết nối Database.
  - Ghi log có cấu trúc chi tiết, dễ dàng tracking lỗi theo `UserId`.
  - Chuẩn hóa phân chia phiên bản API rõ ràng, dễ bảo trì nâng cấp trong tương lai.
- **File liên quan:**
  - Middleware: [UserLoggingMiddleware.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/WebApi/Middlewares/UserLoggingMiddleware.cs)
  - Service: [LeaderboardService.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/Infrastructure/Services/LeaderboardService.cs)
  - Data: [ApplicationDbContext.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/Infrastructure/Data/ApplicationDbContext.cs)
  - Startup: [Program.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/WebApi/Program.cs)
  - Controllers:
    - [AlgorithmsController.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/WebApi/Controllers/AlgorithmsController.cs)
    - [AnalyticsController.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/WebApi/Controllers/AnalyticsController.cs)
    - [AuthController.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/WebApi/Controllers/AuthController.cs)
    - [BadgesController.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/WebApi/Controllers/BadgesController.cs)
    - [GamificationController.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/WebApi/Controllers/GamificationController.cs)
    - [LeaderboardController.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/WebApi/Controllers/LeaderboardController.cs)
    - [LecturesController.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/WebApi/Controllers/LecturesController.cs)
    - [PaymentsController.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/WebApi/Controllers/PaymentsController.cs)
    - [QuizzesController.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/WebApi/Controllers/QuizzesController.cs)
    - [UsersController.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/WebApi/Controllers/UsersController.cs)


---

## ADR-21: DbContext Pooling, Quiz History Pagination and Webhook Idempotency Upgrades

- **Trạng thái:** `✅ IMPLEMENTED` — 2026-05-25
- **Bối cảnh:**
  1. EF Core DbContext khởi tạo liên tục trên mỗi HTTP request tiêu tốn chi phí CPU/RAM khi chịu tải cao.
  2. Lịch sử làm bài trắc nghiệm nạp toàn bộ danh sách, gây chậm và lãng phí RAM khi số lượt làm bài của user tăng lên hàng ngàn.
  3. Webhook của cổng thanh toán SePay có thể gọi lại nhiều lần do retry của network hoặc phía client, dẫn đến nguy cơ ghi nhận trùng giao dịch, cộng XP hoặc kích hoạt Premium nhiều lần.
- **Quyết định:**
  1. **DbContext Pooling:** Thay thế `AddDbContext` thành `AddDbContextPool` trong `Program.cs` để EF Core tái sử dụng các instance DbContext có sẵn trong Pool.
  2. **Quiz History Pagination:** Triển khai phương thức phân trang `GetUserAttemptsWithQuizPaginatedAsync` ở tầng repository (SQL level) sử dụng `Skip()` và `Take()`, và cập nhật controller/service để nhận tham số phân trang.
  3. **Idempotency Webhook:** Thêm trường `TransactionReference` (đánh chỉ mục Unique index) vào thực thể `Order`, và cập nhật `PaymentService.cs` kiểm tra sự tồn tại của transaction reference (sử dụng `payload.Id.ToString()`) trước khi xử lý hóa đơn.
- **Hệ quả:**
  - Tăng khả năng xử lý đồng thời (concurrency) của backend thông qua DbContext Pooling.
  - Tối ưu hóa I/O database và lượng RAM tiêu thụ khi tải lịch sử làm bài thi của người dùng.
  - Bảo vệ hệ thống khỏi race condition và giao dịch trùng lặp nhờ cơ chế kiểm tra Idempotency chặt chẽ.
- **File liên quan:**
  - Domain Entity: [Order.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/Domain/Entities/Order.cs)
  - Domain Interface: [IQuizRepository.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/Domain/Interfaces/IQuizRepository.cs)
  - Application Service: [IQuizService.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/Application/Services/IQuizService.cs)
  - DB Context: [ApplicationDbContext.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/Infrastructure/Data/ApplicationDbContext.cs)
  - Repository: [QuizRepository.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/Infrastructure/Repositories/QuizRepository.cs)
  - Services: [QuizService.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/Infrastructure/Services/QuizService.cs), [PaymentService.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/Infrastructure/Services/PaymentService.cs)
  - Controllers: [QuizzesController.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/WebApi/Controllers/QuizzesController.cs)
  - Startup: [Program.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/WebApi/Program.cs)

---

## ADR-22: Frontend Component Decomposition and Custom Composables Refactoring

- **Trạng thái:** `✅ IMPLEMENTED` — 2026-05-25
- **Bối cảnh:**
  1. Các file component chính trên frontend (như `DSAPlayer.vue` và `PremiumCheckoutView.vue`) gánh vác quá nhiều logic từ quản lý giao diện, bàn phím, countdown timer cho đến API polling.
  2. Bảng điều khiển hoạt ảnh (VCR control) bị viết cứng, trộn lẫn trong `DSAPlayer.vue` gây khó khăn cho việc tái sử dụng ở các màn hình trực quan hóa khác.
- **Quyết định:**
  1. **Decomposition (Phân rã components)**: 
     - Chia nhỏ `DSAPlayer.vue` thành `DSAHeader.vue`, `DSAInputForm.vue` và `PseudocodeViewer.vue`.
     - Chia nhỏ `PremiumCheckoutView.vue` bằng cách tách `PremiumMarketingCard.vue` và `QrPaymentPanel.vue`.
  2. **Custom Composables**: Trích xuất logic nghiệp vụ phức tạp của thanh toán ra khỏi View:
     - `usePaymentTimer.ts` quản lý countdown timer 15 phút.
     - `usePaymentPolling.ts` quản lý việc gọi API kiểm tra trạng thái giao dịch định kỳ.
  3. **Shared VCR Controls**: Tạo `AnimationVcrControls.vue` dùng chung, giao tiếp qua Props/Emits, độc lập khỏi store cụ thể.
- **Hệ quả:**
  - Cải thiện tính bảo trì, khả năng tái sử dụng (Reusability) của các components hiển thị.
  - Tách biệt rõ ràng logic nghiệp vụ khỏi phần giao diện (Clean Architecture frontend).
  - Tất cả 524 tests của Vitest tiếp tục chạy thành công, không gây hồi quy (regression).
- **File liên quan:**
  - Components:
    - [DSAPlayer.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/dsa-modules/components/DSAPlayer.vue)
    - [DSAHeader.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/dsa-modules/components/DSAHeader.vue)
    - [DSAInputForm.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/dsa-modules/components/DSAInputForm.vue)
    - [PseudocodeViewer.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/dsa-modules/components/PseudocodeViewer.vue)
    - [AnimationVcrControls.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/animation-engine/components/AnimationVcrControls.vue)
    - [PremiumMarketingCard.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/payment/components/PremiumMarketingCard.vue)
    - [QrPaymentPanel.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/payment/components/QrPaymentPanel.vue)
  - Composables:
    - [usePaymentTimer.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/payment/composables/usePaymentTimer.ts)
    - [usePaymentPolling.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/payment/composables/usePaymentPolling.ts)
  - Views:
    - [PremiumCheckoutView.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/views/PremiumCheckoutView.vue)

---

---

## ADR-23: Thay Instrumentation Regex Bằng Babel AST Transform Cho Algo Playground (2026-08-03)

- **Bối cảnh:** Instrumentation cũ trong `CompilerStepExecutor.ts` dùng regex hoist mọi `let/const/var` lên đầu sandbox để track biến → phá vỡ closure đệ quy (Tree Traversal chỉ thăm 3/9 node), mất track multi-declaration, không chặn được vòng lặp vô hạn viết 1 dòng.
- **Quyết định:** Viết lại `compileJavaScript` dựa trên `@babel/parser` + `instrumentAst` tự viết (không dùng generator):
  1. Parse code thành AST, giữ NGUYÊN block scope/closure (không hoist).
  2. Chèn `__trackLine(line, safeVars(() => ({...})))` trước mỗi statement, capture theo scope chain (bao gồm tham số hàm) — `safeVars` bọc try/catch chống TDZ.
  3. Chèn `__loopTick()` vào đầu thân mỗi vòng lặp (single-statement body được bọc `{...}`) với ngưỡng riêng `MAX_LOOP_ITERATIONS = 1.000.000` — chống treo tab vì vòng lặp vô hạn.
  4. Không chèn trackLine vào `BlockStatement`/nhánh if-else-try (tránh đứt khối `if(x) __trackLine();{...}`) — nhánh single-statement được bọc block.
- **Contract dữ liệu mới:** Bổ sung 10 hooks Tier-3 (`setCounts`, `setCountingPhase`, `setOutputs`, `setBuckets`, `setBucketPhase`, `setDigitPlace`, `setActiveBucket`, `setRangeLabels`, `setBucketComparing`) + 11 field mới trên `CanvasStateSnapshot` (`countArray`, `countingStep`, `outputArray`, `activeDigitPlace`, `radixBuckets`, `radixStep`, `bucketSortBuckets`, `bucketStep`, `bucketSortActiveIdx`, `bucketRangeLabels`, `bucketSortComparingBucketIndices`) — thay cho 15 field "ma" cũ renderer đọc nhưng compiler không bao giờ sinh.
- **Consequences:** (+) Đệ quy chạy đúng, chặn vòng lặp vô hạn, parser báo lỗi cú pháp rõ ràng. (+) Overlay quick-sort/heap-sort nhận đúng biến từ `loopVariables`. (-) Cần `@babel/parser` + `@babel/types` (thêm vào dependencies — trước đây chỉ là transitive). (-) Trường hợp user khai báo biến trùng tên hook (`let safeVars`) vẫn shadow — chấp nhận, ghi chú giới hạn.

---

## ADR-24: Chuyển Pipeline Compile Sang Web Worker Cho Algo Playground (2026-08-03)

- **Bối cảnh:** `useAlgoPlaygroundStore.run()` compile đồng bộ trên main thread → đơ UI với input lớn; nếu guard chống vòng lặp vô hạn bị lỗi, tab treo cứng; `new Function` chạy cùng context DOM.
- **Quyết định:** Tách compile ra **Dedicated Web Worker**:
  1. `compiler.worker.ts`: onmessage nhận request → `compileAlgorithm` → postMessage kết quả (frames là plain object, structured-cloneable).
  2. `compileWorker.ts`: singleton worker, **timeout 15s** → `worker.terminate()` + tạo lại worker khi cần (kill switch tuyệt đối — ngay cả code phá được loop guard cũng không thể treo tab).
  3. Store `run()` bất đồng bộ + `runSeq` chống stale + `isCompiling` + `pendingPlayAfterCompile`.
  4. Vite bundle worker qua `new Worker(new URL('./compiler.worker.ts', import.meta.url), { type: 'module' })` → chunk `compiler.worker-*.js` riêng.
- **Consequences:** (+) UI không bị chặn khi compile; (+) worker không có DOM → thu hẹp bề mặt self-XSS; (+) timeout terminate là lớp chống treo cuối cùng. (-) Test phải mock `compileInWorker` (worker thật không chạy trong jsdom); (-) frames clone qua structured clone (đã là plain data, không overhead đáng kể). vcr-player vẫn compile đồng bộ (code template tin cậy) — không đổi.

---

## ADR-25: Đại Tu Giao Diện (UI/UX) Algo Playground — Layout, Canvas Overlays & Tooling (2026-08-03)

- **Bối cảnh:** Phân tích UI phát hiện: 4 panel canvas chồng nhau góc trên-phải, ResizeObserver chết từ setup, bar font cố định + số âm vẽ sai, HOOKS_HINT chiếm 1/3 editor, layout 42/58 cứng nhắc không responsive, message lỗi thô kỹ thuật, thiếu tiện ích VCR/trace cơ bản.
- **Quyết định:**
  1. **Canvas overlay zones**: callstack → góc trái; counter + depth + legend → góc phải xếp dọc qua con trỏ `topRightY`; depth badge ẩn khi có callstack; legend chỉ render khi search (found/pruned state).
  2. **Bar rendering chuẩn hóa**: font scale theo barW + baseline 0 (min..max span) cho số âm — đồng bộ `drawArrayBars`/`computeGeo`/counting tier.
  3. **Layout**: `splitpanes` (deps có sẵn) cho editor|canvas, kéo co, `horizontal` khi < 768px; empty state + compile overlay trên canvas.
  4. **Code editor sạch**: bỏ HOOKS_HINT khỏi demo code (panel "Hooks" thay thế); line numbers giờ map thẳng vào code thật.
  5. **Tooling**: `generateDemoInput` sinh input theo demo; `compileErrorTranslator` map 9 nhóm lỗi → tiếng Việt; `traceLogs` computed lọc frame rác; hotkeys Space/Arrow/Home/End; persist `{demoId, code, inputRaw}` qua localStorage; `?demo=` sai → fallback bubble-sort.
- **Consequences:** (+) Canvas không còn chồng panel, mảng lớn/số âm hiển thị đúng, mobile dùng được, sinh viên hiểu lỗi hơn, trải nghiệm VCR đầy đủ. (+) Code demo giảm ~22 dòng hint → editor gọn. (-) Demo code line numbers đổi (hết offset hint) — test không phụ thuộc số dòng tuyệt đối nên an toàn. (-) `usePlaybackHotkeys` của animation-engine gắn chặt store khác nên không tái dùng — viết hotkey cục bộ.

---

## ADR-26: Nội Suy Animation Cho Tree/Graph + Component Tests (2026-08-03)

- **Bối cảnh:** Demo tree/graph nhảy cóc frame-to-frame (array thì có lerp/parabol); tệ hơn, khi đang play các frame tree/graph rơi vào nhánh array-switch với mảng rỗng → trắng màn hình giữa các bước. Toàn dự án chưa có component test nào.
- **Quyết định:**
  1. **Transition pipeline cho tree/graph**: tách `computeTreeLayout` (in-order layout chung) + `nodeStateColor`/`edgeStateColor`; thêm `drawTreeTransition`/`drawGraphTransition` lerp màu trạng thái theo `t` (id node làm khóa — vị trí cây/đồ thị ổn định giữa frame); `drawPlaybackFrameTransition(ctx,w,h,prev,curr,t): boolean` trả false với snapshot array để engine giữ nguyên pipeline mảng; tách `drawSnapshotOverlays` dùng chung. Engine bỏ nhánh `isTreeAlgorithm` cứng — mọi snapshot tree/graph đều được nội suy.
  2. **Component tests**: spec file đầu tiên của dự án cho component Vue (`AlgoPlaygroundWorkspace.spec.ts`, môi trường jsdom per-file) — mock Monaco/splitpanes/compileWorker; 9 test phủ toolbar, hotkeys, trace, overlay.
  3. **Persist versioning**: payload localStorage thêm `version: 1`; restore bỏ dữ liệu version cũ (không migrate).
- **Consequences:** (+) Trải nghiệm tree/graph mượt, hết hiện tượng trắng màn hình khi play; (+) có lưới test UI đầu tiên, mock Monaco là nền tảng cho các component test sau; (+) persist an toàn với thay đổi schema. (-) Transition chỉ lerp màu trạng thái (cấu trúc cây giả định ổn định giữa frame — đúng với mọi demo hiện tại; nếu sau này có demo rebuild cây giữa chừng cần nội suy vị trí theo id). (-) Component test cần jsdom — chậm hơn node env (3s/file).

---

## ADR-27: Cải Thiện UX Playground - Live Validation, Scrubber Nâng Cấp, Complexity Chips, Fullscreen, Share (2026-08-03)

- **Bối cảnh:** Sau đợt đại tu giao diện (ADR-25), các khoảng trống UX còn lại: input không có phản hồi live, scrubber mù (không marker/tooltip), thiếu thông tin độ phức tạp, không fullscreen, không chia sẻ trạng thái đã sửa.
- **Quyết định:**
  1. **Live input validation**: `inputValidation` computed trong store (parse mọi lần gõ) → hint ✓ N phần tử / ✗ lỗi tiếng Việt bên phải dòng mô tả.
  2. **Scrubber thông minh**: `notableSteps` — frame swap ⇄ / found ✓ (giới hạn 15 marker lấy đều); chấm vàng trên slider; tooltip preview description khi hover (tính frame từ clientX / rect).
  3. **Complexity metadata**: `complexity`/`space` field trên `AlgoDemo`, map `DEMO_COMPLEXITY` 21 demo merge trong `register`; chip ⏱/💾 hiển thị cạnh mô tả (sư phạm: gắn trực quan độ phức tạp với hoạt ảnh).
  4. **Viewer**: nút ⛶ fullscreen canvasWrap (+ `:fullscreen` dark bg), VCR buttons disabled khi chưa có frame, trace autoscroll.
  5. **Share**: nút 🔗 Chia sẻ nén `{demo, code, input}` bằng lz-string vào `?src=`; restore khi mount (ưu tiên hơn localStorage); fallback `window.prompt` khi thiếu clipboard.
  6. **Build deterministic**: `vue-tsc -b --force` trong build script — loại lỗi type ảo do tsbuildinfo stale.
- **Consequences:** (+) Người học phản hồi ngay khi nhập, tua tới bước quan trọng dễ dàng, thấy độ phức tạp kèm demo, trình chiếu toàn màn hình, chia sẻ bài làm. (+) Build không còn fail gián đoạn. (-) `--force` làm build chậm hơn ~20s. (-) Marker giới hạn 15 — timeline rất dài vẫn dày nhưng chấp nhận được.

---

## ADR-28: Self-Review Code Algo Playground — Sửa 4 Bug Tìm Được (2026-08-03)

- **Bối cảnh:** Rà soát toàn bộ code đã viết theo tiêu chí ban đầu (20 điểm P0-P2) phát hiện 4 vấn đề còn sót.
- **Quyết định:**
  1. **`applyExternalDemo(id)`**: action store đặt `demoId` + `inputKind` mà không reset code/input — dùng cho mọi đường restore (localStorage, URL ?src=). Chữa bug reload trang trên demo graph parse sai kiểu.
  2. **inputValidation**: trả "Input trống" khi raw rỗng (tránh hiểu lầm default graph).
  3. **matchMedia**: giữ handler tham chiếu và gỡ đúng khi unmount.
  4. **Perf/clean**: `nodeStateColor(snap, id, prunedSet?)` truyền Set dùng chung (O(n²)→O(n)); `generateDemoInput` graph đánh dấu cạnh spanning tree tránh trùng.
- **Quy trình rút ra:** Mọi edit renderer phải chạy typecheck ngay sau khi sửa (đợt này tự phát hiện 1 lỗi gãy block do edit thiếu phần sau).
- **Consequences:** (+) Khôi phục trạng thái đúng 100% với demo graph; hiển thị trung thực; không leak listener; vẽ cây lớn nhanh hơn. (-) Không thay đổi hành vi công khai nào.

---

## ADR-29: Hệ Thống Icon Nhất Quán — Loại bỏ Emoji/Unicode Icon, Dùng SVG (2026-08-03)

- **Bối cảnh:** Dự án dùng lẫn lộn emoji/unicode symbol làm icon (152 vị trí trong template .vue, ~190 trong chuỗi guide tour, ✅→↔ trong explanation frames) — không nhất quán, phụ thuộc font hệ thống, lệch màu/kiểu dáng so với `BaseIcon.vue` SVG có sẵn.
- **Quyết định:**
  1. **Template .vue**: thay toàn bộ emoji/symbol bằng `<BaseIcon name="...">` (đã global-register trong `main.ts`) — mở rộng BaseIcon thêm ~45 icon mới (VCR, arrow, status, editor toolbar...). Tiêu chí: scan tự động `template` = 0 ký tự emoji.
  2. **Chuỗi nội dung (guide tour, explanation frame, markdown, toast, badge icon)**: giữ nguyên chuỗi trong data, render thành inline `<svg>` qua `parseEmojiToSvg()` tại các render surface (markdown renderers, overlay, explanation panels, toast...). Đây chính là nguồn gốc `emojiParser` đã có — mở rộng `SVG_PATHS` + `EMOJI_TO_ICON` phủ 100% emoji đang dùng, thêm bước strip U+FE0F.
  3. **Giữ nguyên có chủ đích**: canvas text (`ctx.fillText` ✓✕←), code/demo string hiển thị trong editor, `console.*` — không phải icon DOM.
  4. **Nội dung người dùng nhập** (markdown bài học, quiz explanation từ Excel): chuyển đổi runtime an toàn (chỉ chèn SVG tĩnh, không chạy HTML khác).
- **Consequences:** (+) Icon đồng bộ stroke-style, inherit `currentColor`, sẵn sàng responsive; không phụ thuộc emoji font; guide tour/explanation nhất quán kể cả nền tảng thiếu emoji. (-) Data string vẫn giữ ký tự emoji (chuyển SVG khi render — đánh đổi: source data giữ nguyên, DOM sạch SVG); canvas text không thể là SVG component nên giữ nguyên. (-) `parseEmojiToSvg` chạy thêm trên mỗi render text — chi phí nhỏ (map lookup), chấp nhận được.

---

## ADR-29: Animation Engine Riêng Cho Merge Sort (Data-Driven, Tách Khỏi Pipeline Chung) (2026-08-03)

- **Bối cảnh:** Merge sort bị ép vào pipeline chung (bar 'move') + cây 3-node giả chỉ hiển thị số lượng — không trực quan được chia-để-trị.
- **Quyết định:**
  1. **`MergeSortAnimationEngine`** — class riêng, stateless singleton, `canHandle(snap)` data-driven (chỉ vẽ khi snapshot có `mergeState`), delegate từ `SortingAnimationEngine.drawCustomLayout`; layout 3 tầng (mảng + segment, L/R + con trỏ, output + slot) không kẻ viền.
  2. **Contract dữ liệu**: `MergeSortState` {phase, left, right, leftIdx, rightIdx, output, low, mid, high, width, pass} trên `CanvasStateSnapshot`; hook `setMergeState` deep-copy.
  3. **Demo**: bottom-up merge gọi hook pha divide mỗi segment + từng bước merge — renderer nhận đủ dữ liệu để vẽ, không chứa logic thuật toán (đúng Quy tắc 3 AGENTS.md).
- **Consequences:** (+) Merge sort có animation thật: thấy segment chia nhỏ dần (width 1→2→4...), con trỏ so sánh L/R, output điền dần. (+) Mở rộng được: bất kỳ demo nào gọi `setMergeState` đều tự dùng layout này (không cần sửa engine). (-) Thêm 1 hook nữa vào sandbox (đã cập nhật HOOKS_HINT). (-) Frame count của demo merge tăng (nhiều bước setMergeState) — chấp nhận, scrubber đã có marker/tooltip.

---

## ADR-30: Animation Engine Riêng Cho Heap Sort (Mở Rộng Pattern Merge Sort ADR-29) (2026-08-03)

- **Bối cảnh:** Heap sort vẫn dùng `buildHeapTree` trong SortingAnimationEngine + pipeline tree-generic — không trực quan pha XÂY ĐỐNG/TRÍCH XUẤT và ranh giới heap.
- **Quyết định:**
  1. **`HeapSortAnimationEngine`** — class riêng, stateless singleton, `canHandle(snap)` data-driven (snapshot có `heapState`); layout 2 phần: cây heap complete-tree (vị trí theo index/tầng) + dải mảng với vùng heap/sorted tô mờ; phase label; không kẻ viền trang trí.
  2. **Contract dữ liệu**: `HeapSortState` {phase: 'build'|'extract', heapSize, activeIdx} trên `CanvasStateSnapshot`; hook `setHeapState` (deep-copy).
  3. **Demo**: biến `phase` chuyển 'build'→'extract'; `heapify` gọi hook mỗi vòng sift với heapSize = n.
  4. **Dọn dẹp**: xóa `isTreeAlgorithm`/`enrichForTree`/`buildHeapTree` khỏi SortingAnimationEngine (đúng Open-Closed — thêm demo/engine không sửa lõi); `drawInterpolated` dùng snapshot trực tiếp; `renderMode` nhận `heapState` → 'tree'.
- **Consequences:** (+) Heap sort hiển thị trọn vẹn: cây heap + ranh giới heapSize thu hẹp dần khi trích xuất + dải mảng song song. (+) Pattern "engine riêng data-driven" đã chuẩn hóa cho merge/heap — mở rộng thuật toán mới không chạm SortingAnimationEngine. (-) Thêm hook thứ 30 vào sandbox (đã cập nhật HOOKS_HINT). (-) Node tree layout theo index có thể chồng khi mảng rất lớn — đã scale nodeR theo độ sâu/tầng.

---

## ADR-31: Redesign Heap Sort Animation Engine - Parent-Centered Layout + Swap Animation + Sift Path (2026-08-03)

- **Bối cảnh:** Heap engine v1 (ADR-30) kém hiệu quả: cây dồn trái tầng cuối, node nhỏ chữ đè, swap nhảy cóc, không thấy đường sift-down.
- **Quyết định:**
  1. **Layout parent-centered**: vị trí node tính bottom-up — lá xếp trái→phải, node trong = trung điểm 2 con → cây cân đối, tận dụng chiều ngang; `nodeR` scale theo cả slot ngang + chiều cao tầng; **ẩn label khi nodeR < 9** (mảng lớn chỉ vẽ chấm màu, hết đè chữ).
  2. **Swap animation**: `draw(ctx, w, h, snap, prev?, progress)` — frame `swappingIndices` → 2 giá trị bay cung parabol giữa 2 vị trí node (easeInOut, arcH scale theo khoảng cách); các node khác tĩnh. SortingAnimationEngine truyền `this.prev` + `this.progress` (đã có sẵn từ pipeline transition).
  3. **Sift path**: `HeapSortState.siftPath?: number[]` — demo track (khởi tạo [i], push mỗi lần chọn largest/di chuyển); node trên path tô amber mờ (độ ưu tiên màu: extracted > beyond > active/comparing/swapping > path > default); compiler deep-copy mảng.
  4. **Dải mảng**: baseline-0 (min..max span — số âm đâm xuống), 2 bar swap trượt ngang khi đổi chỗ, vùng heap/sorted tô mờ giữ nguyên.
- **Consequences:** (+) Cây đọc được ở mọi kích thước input; sift-down sống động (path sáng dần + giá trị bay khi swap); số âm hiển thị đúng trên dải mảng. (+) Vẫn data-driven hoàn toàn — demo chỉ thêm siftPath. (-) Phải truyền prev/progress vào engine riêng (SortingAnimationEngine đã có sẵn). (-) Layout parent-centered đệ quy — an toàn với n ≤ 100 (depth ≤ 7).

---

## ADR-32: Xây Lại Giao Diện Heap Engine v3 - Banner Hướng Dẫn + Bố Cục Động Theo Pha (2026-08-03)

- **Bối cảnh:** v2 (ADR-31) vẫn chưa đạt hiệu quả sư phạm: tỷ lệ cây/mảng cố định 64/36 (pha extract — nơi "sorting" diễn ra — mảng quá nhỏ), thiếu hướng dẫn pha, không nhấn ROOT khi trích xuất, cặp so sánh không có phản hồi.
- **Quyết định (v3):**
  1. **Header banner**: text hướng dẫn theo pha (XÂY ĐỐNG → vun từng node; TRÍCH XUẤT → đưa root về cuối) + stats heapSize/comparisonCount — người học luôn biết mình đang xem gì.
  2. **Bố cục động theo pha**: `treeFrac = build ? 0.58 : 0.42` — mỗi pha dành nhiều không gian cho phần quan trọng nhất.
  3. **Cây**: node lớn hơn + ẩn chữ khi nodeR < 10; palette tối giản 5 trạng thái; glow cho active; **compare pulse** theo progress (cặp so sánh rung nhẹ).
  4. **Mảng**: ROOT marker (tam giác + nhãn) trên bar 0 khi extract; swap bay cung (x trượt + y nhấc); bar ngoài đống tối mờ.
- **Consequences:** (+) Mỗi pha tự điều chỉnh trọng tâm thị giác — extract nhìn rõ root bay về cuối; banner làm rõ ý nghĩa từng pha; pulse tăng cảm giác "đang so sánh". (+) Không đổi contract dữ liệu (vẫn heapState) — demo không phải sửa. (-) Header chiếm 34px (bù lại bố cục động).

---

## ADR-33: Xây Lại Giao Diện Heap Engine v4 - "Mảng Là Chính" + Mini Focus Tree + Caption Tường Thuật (2026-08-03)

- **Bối cảnh:** v3 (ADR-32) vẫn chưa hiệu quả sau 3 lần thiết kế "cây toàn phần + dải mảng". Nhận định: vẽ cả cây heap làm phân tán — hành động thật (sort) nằm ở mảng nhưng mảng chỉ chiếm phần nhỏ; cây toàn phần vô nghĩa khi sift chỉ chạm 1 nhánh; thiếu lời tường thuật.
- **Quyết định (v4):**
  1. **Mảng là nhân vật chính** (62%): bar lớn, chỉ số dưới bar, vùng heap/sorted tô mờ với khe hở ranh giới (thay đường kẻ), ROOT marker, swap bay cung, compare pulse viền sáng.
  2. **Mini Focus Tree** (24%): chỉ vẽ active node + 2 con trong đống — node to r=18, so sánh rung, swap sift bay cung; không còn "rừng node" gây rối.
  3. **Caption tường thuật** (12%): `HeapSortAnimationEngine.captionFor(snap)` — text tiếng Việt sinh từ dữ liệu (so sánh → giữ giá trị lớn hơn; đổi chỗ → root về cuối/heap thu hẹp; vun đống tại node X; root là phần tử lớn nhất). Tách public static để unit-test.
  4. Header gọn 28px (pha + heapSize + so sánh nếu có).
- **Consequences:** (+) Người xem biết CHÍNH XÁC đang xảy ra gì ở mỗi frame (caption), tập trung vào hành động thật trên mảng, mini-tree chỉ phục vụ đúng chỗ cần (so sánh cha-con). (+) Không đổi contract dữ liệu — demo không sửa. (-) Mất "cái nhìn toàn cảnh cây" — bù lại bằng caption + ROOT marker; có thể thêm toggle "xem cả cây" sau này nếu cần.

---

## ADR-34: Tối Ưu Không Gian Workspace Algo Playground (2026-08-03)

- **Bối cảnh:** 5-6 hàng chrome (toolbar 7 controls, dòng mô tả, hooks inline, 2 header pane, VCR/trace) ép vùng hiển thị thuật toán — không gian chật chội.
- **Quyết định:**
  1. Mô tả demo → tooltip select; chips ⏱/💾 cạnh select (gộp dòng mô tả).
  2. Hành động phụ (Hooks/Code mẫu/Chia sẻ) → menu ⋯ có backdrop; bỏ nút Reset trùng VCR ⟲.
  3. Gộp 2 header pane thành 1 thanh điều khiển chung.
  4. **Collapse editor**: Pane size 0 + min-size 0 + `hide-splitter` class (ẩn splitter) — canvas full width khi tập trung xem animation; `v-show` giữ Monaco state (không remount).
  5. Hooks panel → popover absolute (không đẩy layout); validation hint inline trong ô input.
- **Consequences:** (+) Chrome giảm từ 5-6 hàng xuống 3 (toolbar, header gộp, VCR/trace) — canvas/editor nhận lại ~2 hàng không gian; (+) hành động phụ gọn trong ⋯; (+) collapse editor là tính năng "focus mode". (-) Description không còn hiển thị thường trực (chỉ tooltip) — chấp nhận vì chips complexity vẫn hiện; menu ⋯ thêm 1 click cho hành động phụ. Monaco không remount khi collapse (v-show) — giữ nguyên state code.

TEST-APPEND-OK

---

## ADR-35: Lesson Study API-First + Seeder Upsert (2026-08-04)

- **Trang thai:** `IMPLEMENTED` — `useLessonStore.ts`, `LessonStudyView.vue`, `DbSeeder.cs`
- **Ngu canh:** Man hoc bai `/lessons/:id` truoc day la mockup 100% (hardcode Bubble Sort) — moi bai hoc deu hien noi dung giong nhau; store day du (`useLessonStore`) ton tai nhung la dead code.
- **Quyet dinh:**
  1. `loadLesson` uu tien API `GET /concepts/lessons/{id}` (tra title/contentMd/sandboxType/sandboxConfig/quizId/xpReward), fallback `data/lessons.ts` khi offline.
  2. Quiz cua lesson lay tu `statelessQuizApi.getQuizById(quizId)`; codelab task lay tu `CODELAB_TASK_REGISTRY` theo `sandboxConfig.demo` (moi demo mot bai tap co ban).
  3. CodeLab thuc thi that trong Web Worker (`codelab.worker.ts`) voi timeout 1500ms terminate — khong con mockup setTimeout.
  4. Seeder quiz chuyen sang upsert theo Title (`SeedQuizzesAsync`); seeder course guard theo so luong bai cua khoa nhap mon (6) + early return tranh nhan doi khi restart; goi `Publish()` cho tat ca khoa seed.
- **He qua:** Moi bai hoc hien thi dung ly thuyet/visualization/quiz/codelab; khoa seed hien thi tren trang danh sach (fix bug IsPublished=false); chay lai seed an toan.
- **File lien quan:** `frontend/src/features/lesson/*`, `frontend/src/views/lesson/*`, `backend/src/Infrastructure/Data/DbSeeder.cs`, tests: `frontend/src/features/lesson/__tests__/` (5 suite), `backend/tests/.../DbSeederTests.cs`

---

## ADR-36: Mermaid Diagrams — Theme Tối Giản + Syntax Scan Tự Động (2026-08-04)

- **Trang thai:** `IMPLEMENTED` — `frontend/src/utils/mermaidTheme.ts`, `DocsMarkdownRenderer.vue`, `docsMermaidSyntax.spec.ts`
- **Ngu canh:** Docs render mermaid voi `theme:'default'` — bang mau mac dinh nhieu sac (cau vong class diagram, xanh do tim loe loet, khong hop dark theme cua app). Dong thoi 12/88 khoi mermaid trong docs co loi cu phap (chua tung duoc kiem tra, chi hien loi runtime trong UI).
- **Quyet dinh:**
  1. **Theme dung chung toi gian**: `theme:'base'` + `themeVariables` chi 6 tong: background `#131614`, node fill `#1e2320`, secondary `#252b27`, tertiary `#181c19`, border `#343634`, text `#e2e4e2`, edge `#5e605e` — dung 1 accent duy nhat `#3d9970` cho activation bar. Class diagram `fillType0..7` xen ke 2 tong (het "cau vong"). `flowchart.curve:'linear'` cho net ve ky thuat. `themeCSS` ep edge/label cung tong.
  2. **Syntax scan tu dong**: vitest spec doc toan bo `docs/content/**/*.md`, trich 88 khoi ```mermaid, `await mermaid.parse()` tung khoi — fail bao ro file + so khoi + message. Ngan chan hoi quy cu phap khi them/sua docs.
  3. **Sua 12 khoi loi**: backward link `A <-- B` (mermaid KHONG ho tro — viet nguoc lai `B --> A`); parens chua quote trong diamond `{...}` va subgraph title (quote `"..."`); `style fill:rgba(...)` co comma (style parser cat theo comma) → thay bang mau solid; link subgraph bang title string → dung explicit id (`G1 --> G2`); chuan hoa moi `style` directive ve palette app (`#b85c5c` / `#c9a227` / `#3d9970`) thay `#ef4444`/`#3b82f6`/`#10b981`/`#f59e0b`.
- **He qua:** (+) Bieu do dong nhat voi dark theme, toi gian mau, khong loe loet; (+) moi loi cu phap mermaid trong docs bi phat hien ngay khi chay test (khong con cho den luc user mo trang docs). (-) Theme co dinh cho docs (khong tu dong theo light theme) — chap nhan vi docs chi render dark. (-) `mermaid.parse` trong test them ~5s cho suite.

---

## ADR-37: Tailwind v4 CSS-first — Bridge Design Tokens bang `@theme inline` (2026-08-04)

- **Trang thai:** `IMPLEMENTED` — `frontend/src/style.css`, `frontend/src/styles/theme.css`
- **Ngu canh:** Navbar dropdown trong suot 100% vi `bg-bg-surface`/`border-border-default` khong co trong CSS build. Dieu tra: Tailwind v4.3 KHONG tu dong nap `tailwind.config.js` (JS config chi nap khi co `@config`); thu `@config` lam mat core utilities (legacy config thay the default theme cua v4). Huong di CSS-first la chuan cua v4.
- **Quyet dinh:**
  1. **Bo `tailwind.config.js` khoi luong vao build** (giu file lam tai lieu tham chieu) — khai bao token truc tiep trong `src/style.css` bang block `@theme inline`.
  2. **`@theme inline`** (khong phai `@theme` thuong): gia tri la `var(--color-bg-surface)` tham chieu truc tiep bien runtime trong `styles/theme.css` — utility compile thanh `background-color:var(--color-bg-surface)` thay vi reference vao `--color-*` sinh ra (tranh circular reference + cho phep doi theme sang/toi luc runtime). Unlayered `:root` cua theme.css thang `@layer theme` cua Tailwind nen khong xay ra vong lap.
  3. **Hoan thien token**: them `--color-accent-cyan` (dark `#06b6d4`, light `#0891b2`) va `--color-accent-purple` (dark `#a78bfa`, light `#7c3aed`) + glow/dim vao `theme.css` — 183 luot `text-accent-cyan` truoc day khong co dinh nghia.
  4. Khong dung opacity modifier (`bg-bg-surface/30`) tru khi token co san — v4 dung `color-mix` voi var() inline nen van hoat dong.
- **He qua:** (+) Toan bo 1.862 token class (122 file) hoat dong tro lai: dropdown/panel/menu co nen opac, hover state, border, accent mau dung thiet ke; (+) theme sang/toi van chinh xac. (-) Thay doi hinh anh toan app (lay lai mau thiet ke) — co the can nhin lai mot vai cho tuong tac bi "trong suot" truoc day. (-) `tailwind.config.js` gio la dead config (giu lam reference).
---

## ADR-36: Anh bia khoa hoc bang SVG dong (2026-08-04)

- **Trang thai:** `IMPLEMENTED` — `CourseCover.vue`
- **Ngu canh:** Anh bia truoc day la URL Unsplash (phu thuoc mang ngoai, co the loi/che do), khong dong nhat ve mau sac giua cac khoa.
- **Quyet dinh:** Thay <img> bang SVG dong sinh theo danh muc: gradient 2 mau rieng + icon toi gian (bars/kính lúp/cay/nut/OOP cot/SOLID khoi/puzzle/server/code) + badge danh muc. Gradient id unique theo course.id de tranh xung dot nhieu SVG cung trang. Giu field coverImageUrl trong du lieu (khong hien thi) va preview upload cua giang vien.
- **He qua:** Khong con phu thuoc mang ngoai; nhat quan mau sac theo danh muc; hoat hinh hover scale van giu; aria-label cho accessibility.
---

## ADR-37: Lesson doc lap + Roadmap thay the khoa hoc dai (2026-08-04)

- **Trang thai:** `IMPLEMENTED` — DbSeeder.cs, CoursesListView, CourseDetailView
- **Ngu canh:** Khoa hoc dai nhieu module/lesson gay chat luong bai hoc khong deu; user quyet dinh xoa toan bo khoa cu va chuyen sang mô hình lesson doc lap.
- **Quyet dinh:** 39 lesson doc lap (content + quiz 10 cau + demo), 3 Roadmap = Course container (Cơ bản 12 / Trung cấp 15 / Nâng cao 12, moi roadmap 2 Module chang, ModuleItem tham chieu Lesson — 1 lesson co the thuoc nhieu roadmap). Roadmap isPremium=false de lộ trình chính mở cho moi nguoi. Guard seeder theo lesson marker 'Two Pointers'.
- **He qua:** Noi dung viet 1 lan tai dung nhieu noi; them lesson moi khong pha roadmap; E2E xac nhan quiz lien ket dung tung lesson; frontend doi title + truyen courseId khi vao lesson.