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

## ADR-18: IoC Container Visualizer — Client-side Reflection DI Simulator with VCR Playback

- **Trạng thái:** ✅ IMPLEMENTED
- **Ngữ cảnh:** Khái niệm IoC Container và DI rất trừu tượng. Sinh viên cần thấy trực quan vòng đời Singleton vs Transient, luồng phân giải đệ quy constructor, và lỗi phụ thuộc vòng tròn/giam cầm. Backend DI (.NET Core) resolve quá nhanh (<5ms), không thể thấy các bước trung gian.
- **Quyết định:** Triển khai IoC Container Simulator 100% client-side TypeScript:
  1. **IoCContainerSimulator** — recursive DFS resolve ghi lại ResolutionStep trace (LOOKUP→INJECT→INSTANTIATE→RETRIEVE_SINGLETON), Singleton Vault reuse pattern, visited Set<string> circular guard.
  2. **DFS Circular Dependency Detector** — static method quét đồ thị đăng ký trước khi resolve, trả về cyclePath.
  3. **Captive Dependency Detector** — static method phát hiện Singleton chứa Transient (lỗi kiến trúc phổ biến ASP.NET Core).
  4. **Resolution Tree Builder** — buildResolutionTree generates node hierarchy with layoutTree recursive positioning (spread reduction per depth level).
  5. **VCR Playback Store** — Pinia store điều khiển hoạt ảnh step-by-step 800ms auto-advance với setTimeout, stepForward/stepBackward/jumpToStep tua tùy ý.
  6. **3D Glassmorphic Cabinet** — 2-chamber grid: Singleton Vault (gold radial gradient, amber border) + Transient Lab (silver, slate border).
  7. **SVG Resolution Tree** — Cubic Bezier paths (parent→child) with laser Neon injection animation (stroke-dashoffset keyframes), REUSE badges for retrieved singletons.
  8. **4 Scenario Presets** — Web API Standard (4 regs), Circular Dependency (2 regs cycle), Captive Dependency (3 regs), Clean Architecture CQRS (5 regs).
- **Kiến trúc:**
  - `IoCContainerSimulator` — register, resolve, buildResolutionTree, getResolutionSteps, detectCircularDependency, checkCaptiveDependency
  - `useIoCDebuggerStore` — Pinia setup store: loadScenario, startResolution, stepForward/stepBackward/jumpToStep, status FSM, VCR playback timer
  - `IoCContainerCabinet.vue` — Singleton Vault / Transient Lab chambers
  - `ResolutionTreeCanvas.vue` — SVG tree + laser paths
  - `IoCWorkspace.vue` — Orchestrator with scenario selector + VCR controls + keyboard shortcuts
  - 4 scenario presets in scenarioData.ts
- **Hệ quả:** Sinh viên thấy trực quan Singleton Vault (gold node tái sử dụng) vs Transient Lab (silver node tạo mới mỗi lần), laser Neon tiêm phụ thuộc constructor, DFS phát hiện vòng lặp chớp đỏ Rose, cảnh báo Captive Dependency chớp Amber. Toàn bộ tua-able step-by-step.
- **File liên quan:**
  - Types: di-sandbox/types/ioc.types.ts
  - Engine: di-sandbox/engine/IoCContainerSimulator.ts
  - Store: di-sandbox/store/useIoCDebuggerStore.ts
  - Scenarios: di-sandbox/scenarios/scenarioData.ts (4 presets)
  - Components: IoCWorkspace.vue, IoCContainerCabinet.vue, ResolutionTreeCanvas.vue
  - Module: di-sandbox/index.ts (barrel export)
  - Integration: App.vue ("DI/IoC" tab — replaced DISandbox with IoCWorkspace)
  - Tests: IoCContainerSimulator.spec.ts (30), useIoCDebuggerStore.spec.ts (30), scenarioData.spec.ts (18) — 78 tests total
