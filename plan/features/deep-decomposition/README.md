# 🏛️ BẢN ĐỒ PHÂN RÃ CHI TIẾT DỰ ÁN VISUALIZATIONDSA (DEEP DECOMPOSITION MASTER INDEX)

## 📝 TRUNG TÂM QUẢN TRỊ KIẾN TRÚC & CHỈ MỤC CÁC PHÂN HỆ (PHASE 1 & PHASE 2)

Chào mừng bạn đến với **Deep Decomposition Master Index** của **VisualizationDSA** - tài liệu hạt nhân tối cao điều phối toàn bộ các phân hệ kiến trúc của dự án EdTech trực quan hóa cấu trúc dữ liệu, giải thuật và kỹ nghệ phần mềm cao cấp (OOP, SOLID, Design Patterns, DI, System Design). Bản đồ này thiết lập cấu trúc thư mục phân rã sâu sắc, liên kết chặt chẽ các tài liệu PRD, Technical Spec, Code Logic, State, UI/UX và các Quyết định Kiến trúc (ADR) hạt nhân của 25 phân hệ.

---

## 📌 BẢN ĐỒ CHỈ MỤC LIÊN KẾT NHANH (MASTER PATHS INDEX)

### 🟢 PHÂN HỆ PHASE 1 (CẤU TRÚC DỮ LIỆU & GIẢI THUẬT CƠ BẢN)

> Chú thích: `✅ CODE DONE` = code thực tế đã viết | `🟡 IN PROGRESS` = đang viết | `🟠 PARTIAL` = có skeleton chưa tích hợp | `❌ SPEC ONLY` = chỉ có tài liệu

- **[01. Animation Engine](./phase1-animation-engine)** `✅ CODE DONE` — `CoreAnimationEngine.ts`, `CompilerStepExecutor.ts`, **Phase 1 Backend-Driven**: `useAnimationStore.ts`, `CanvasLayer.vue`, `VisualizationPlayer.vue`, `BubbleSortExecutor.cs`, `AlgorithmsController.cs`
- **[02. Custom Input](./phase1-custom-input)** `✅ CODE DONE` — `CustomInputParser.ts`, **Phase 1 Custom Input Generator**: `useInputStore.ts`, `CustomInputForm.vue`, `InputParser.cs`, `ConstraintResolver.cs`, custom-execute API endpoint
- **[03. DSA Modules](./phase1-dsa-modules)** `✅ CODE DONE` — **Phase 1 DSA Modules Library**: 10 Algorithm Strategies (Strategy Pattern + Reflection DI), 4 Canvas Renderers (BarChart, BoxArray, Tree, Tube), `DSAPlayer.vue`, `AlgorithmDashboard.vue`, `AlgorithmVisualizer.vue` (dynamic `<component :is>`), 40 unit tests
- **[04. E-Lecture Mode](./phase1-e-lecture-mode)** `✅ CODE DONE` — **Phase 1 E-Lecture Mode**: `useLectureStore.ts` (Pinia orchestration + PLAY_UNTIL sync), `LectureOverlay.vue` (Glassmorphism + dimmed backdrop + auto-minimize), `lectureLoader.ts`, extended `useAnimationStore` (playUntilFrame, goToFrame, interactionLocked), `LecturesController.cs` API, Bubble Sort lecture JSON script, 28 unit tests
- **[05. Execution Control](./phase1-execution-control)** `✅ CODE DONE` — **Phase 1 Execution Control VCR Nâng cấp**: `AnimControlPanel.vue` (Replay button, YouTube-style neon slider, Dynamic Tooltip, Glassmorphism, E-Lecture lock), 4 composables (`useSpeedPreferences`, `useThrottledScrub`, `usePlaybackHotkeys`, `useSliderTooltip`), `togglePlay()` store action, localStorage persistence, 23 unit tests
- **[06. Interactive Playground](./phase1-interactive-playground)** `✅ CODE DONE` — **Phase 1 Interactive Playground**: `usePlaygroundStore.ts` (5 tool modes, cascade delete, max 30 nodes), `GraphGeometryEngine.ts` (Euclidean hit detection, atan2 arrowhead), `ForceDirectedEngine.ts` (Coulomb + Hooke physics), `PlaygroundCanvas.vue` (Canvas 2D + snap glow), `FloatingToolbar.vue` (Glassmorphism + keyboard shortcuts), `GraphParser.ts` (adjacency list + BFS connectivity), 31 unit tests
- **[07. Pseudocode Sync](./phase1-pseudocode-sync)** `✅ CODE DONE` — **Phase 1 Pseudocode Sync**: `usePseudocodeStore.ts` (Pinia store, logicalId mapping, Click-to-Snap reverse lookup, cycle navigation), `PseudocodeSyncEngine.ts` (line mapping, variable transform, occurrence count), `MultilingualCodePanel.vue` (4-language tabs C++/Java/Python/JavaScript, Glassmorphism, emerald highlight, JetBrains Mono), `VariableWatchPanel.vue` (dynamic variable badges, Cyan neon, fade transitions), `bubble-sort.pseudocode.ts` (4 languages, 5 logicalIds), FrameDTO extended (activeLogicalLineId + variables), 37 unit tests
- **[08. Quiz System](./phase1-quiz-system)** `✅ CODE DONE` — **Phase 1 Quiz System**: `QuizVerificationEngine.ts` (MC/TF + Euclidean Canvas hit detection), `QuizStatsManager.ts` (localStorage persistence), `QuizSchemaValidator.ts` (JSON validation), `useQuizStore.ts` (checkpoint detection, lecture lock, session scoring), `QuizCardOverlay.vue` (Glassmorphism overlay, Neon glow emerald/rose, shake animation), `QuizSummaryCard.vue` (accuracy/streak/correct badges), `bubble-sort.quiz.ts` (4 checkpoints), VisualizationPlayer integration (currentIndex watch), 54 unit tests

### 🔵 PHÂN HỆ PHASE 2 (KỸ NGHỆ PHẦN MỀM & KIẾN TRÚC PHÂN TÁN)

> ⚠️ **Toàn bộ Phase 2 chưa có code. Tất cả là tài liệu đặc tả.**

- **[09. Code to Visualization](./phase2-code-to-visualization)** `✅ CODE DONE` — **Phase 2 Code-to-Visualization Compiler**: `ASTInstrumentationEngine.ts` (Acorn parser + acorn-walk + escodegen, traceCompare/traceAssign instrumentation, __loopCounter loop guard), `WorkerLifecycleCoordinator.ts` (Web Worker Sandbox, Blob URL lifecycle, Timeout Guard 1.5s, MAX_FRAMES 2000), `useLiveCompilerStore.ts` (Pinia store, AST→Worker→Canvas pipeline), `MonacoEditorPanel.vue` (algolens-dark theme, JetBrains Mono, error/success glow), `CompilerConsole.vue` (Neon console logs), `CodeWorkspace.vue` (IDE grid layout 50/50), 32 unit tests
- **[10. Compare Algorithms](./phase2-compare-algorithms)** `✅ CODE DONE` — **Phase 2 Compare Algorithms**: `UnifiedPlaybackCoordinator.ts` (syncProgressByPercent, calculateAlignedSpeeds), `UnifiedRenderScheduler.ts` (dual rAF loop), `useCompareAlgorithmsStore.ts` (dual algorithm selection, unified VCR, independent/normalized playback, live stats), `CompareAlgorithmSelector.vue` (pair picker), `CompareCanvasPanel.vue` (props-driven Canvas), `ComparativeDashboard.vue` (Cyan vs Emerald stats), `CompareWorkspace.vue` (orchestrator), 33 unit tests
- **[11. Concurrency Visualizer](./phase2-concurrency-viz)** `✅ CODE DONE` — **Phase 2 Concurrency Visualizer**: `ConcurrencySimulationEngine.ts` (Thread State Machine + Mutex Lock queue-based acquisition), `DeadlockDetector` (DFS Wait-For Graph cycle detection), `useConcurrencyStore.ts` (Pinia store, step-by-step execution, history snapshots, deadlock detection per step), `ThreadRailsCanvas.vue` (horizontal thread rails, Cyan/Amber/Emerald runner nodes, Critical Section gate, Mutex padlock icon, Deadlock Neon Rose pulse), `ConcurrencyWorkspace.vue` (scenario selector, Mutex toggle, VCR controls, keyboard shortcuts), 4 scenario presets (Race Condition, Deadlock Demo, Producer-Consumer, Dining Philosophers), 35 unit tests
- **[12. Debug Mode](./phase2-debug-mode)** `✅ CODE DONE` — **Phase 2 Debug Mode**: `DebuggerYieldEngine.ts` (AST → Generator function* + yield injection, Acorn + acorn-walk + escodegen, __loopCounter 5000 + __recursionDepth 500 guards), `LiveCompilerDebugger.ts` (Iterator .next() stepping, breakpoint hit detection, stepForward/stepBackward/continueToNextBreakpoint/stepOut, history array), `useLiveDebuggerStore.ts` (Pinia store, status FSM, breakpoints, callStack, watchedVariables, mutatedVariableKeys mutation detection), `DebugWorkspace.vue` (Monaco Editor algolens-debug theme + gutter breakpoint rose dots + active line Cyan highlight + VCR debug controls), `CallStackVisualizer.vue` (3D Glassmorphism stacked cards), `DebugWatchPanel.vue` (variable watch + Cyan mutation highlights), `DebugCanvas.vue` (array bar visualization), 49 unit tests
- **[13. Design Patterns](./phase2-design-patterns)** `✅ CODE DONE` — **Phase 2 Design Patterns & SOLID Visualizer**: `DesignPatternVisualizerEngine.ts` (Cubic Bezier path calculation, node position clamping, Strategy swap), `useDesignPatternsStore.ts` (Pinia store: 3 scenarios, DIP toggle, Observer notify pulse, Strategy runtime swap, coupling index metric), `ClassNodeCard.vue` (Glassmorphism UML node, drag-and-drop global mousemove, stereotype headers), `DesignPatternsCanvas.vue` (SVG Bezier connection paths, Neon link styles, Observer pulse animation, DIP coupled/decoupled styles), `DesignPatternsWorkspace.vue` (scenario selector tabs, Strategy/Observer/DIP controls, coupling widget, legend), 3 scenario presets (Strategy Pattern, Observer Pattern, DIP Sandbox), 50 unit tests
- **[14. DI Visualizer](./phase2-di-visualization)** `✅ CODE DONE` — **Phase 2 IoC Container Dependency Visualizer**: `IoCContainerSimulator.ts` (recursive DFS resolve, LOOKUP/INJECT/INSTANTIATE/RETRIEVE_SINGLETON step trace, Singleton Vault reuse, circular dependency guard, captive dependency detection, resolution tree builder with layout), `useIoCDebuggerStore.ts` (Pinia store: VCR playback 800ms auto-advance, 4 scenarios, stepForward/stepBackward/jumpToStep, status FSM IDLE→RESOLVING→RESOLVED→ERROR), `IoCWorkspace.vue` (orchestrator with scenario selector, VCR controls, keyboard shortcuts, captive/circular alerts), `IoCContainerCabinet.vue` (3D Glassmorphic cabinet with Singleton Vault gold + Transient Lab silver, registry table), `ResolutionTreeCanvas.vue` (SVG Cubic Bezier resolution tree, laser Neon injection animation, REUSE badges), 4 scenario presets (Web API Standard, Circular Dependency, Captive Dependency, Clean Architecture), 78 unit tests
- [15. Embed Widget](./phase2-embed-widget) `❌ SPEC ONLY`
- [16. Export & Share](./phase2-export-share) `❌ SPEC ONLY`
- [17. Gamification System](./phase2-gamification) `❌ SPEC ONLY`
- [18. Learning Path](./phase2-learning-path) `❌ SPEC ONLY`
- [19. Multi-View Layout](./phase2-multi-view) `❌ SPEC ONLY`
- [20. OOP Concepts Visualizer](./phase2-oop-visualization) `❌ SPEC ONLY` ~~`[XONG]`~~
- [21. Smart Interactive Quiz Widget](./phase2-smart-quiz) `❌ SPEC ONLY` ~~`[XONG]`~~
- [22. SOLID Principles Visualizer](./phase2-solid-visualization) `❌ SPEC ONLY` ~~`[XONG]`~~
- [23. State Inspector RAM Panel](./phase2-state-inspector) `❌ SPEC ONLY` ~~`[XONG]`~~
- [24. System Design Visualizer](./phase2-system-design-viz) `❌ SPEC ONLY` ~~`[XONG]`~~
- [25. VCR Timeline Playback](./phase2-timeline-playback) `❌ SPEC ONLY` ~~`[XONG]`~~

---

## 🏛️ ĐẶC TẢ CHI TIẾT CÁC PHÂN HỆ (DEEP SPECS — CHỈ LÀ TÀI LIỆU, CHƯA PHẢI CODE)

> ⚠️ **Cảnh báo:** Tất cả các mục bên dưới đánh dấu `[XONG]` trong danh sách trên chỉ có nghĩa **tài liệu đặc tả đã hoàn thành**, KHÔNG có nghĩa là code đã được viết. Không có phân hệ Phase 2 nào có code thực tế tính đến thời điểm hiện tại.

Dưới đây là tóm tắt kiến trúc thiết kế của 6 phân hệ đã được đặc tả chi tiết — làm căn cứ cho AI Agent khi implement:

### 1. OOP Concepts Visualizer (`phase2-oop-visualization`)

- **Cốt lõi:** Trực quan hóa Lập trình hướng đối tượng (Tính kế thừa, Đa hình, Đóng gói) bằng đồ họa.
- **Hạt nhân kỹ thuật:** Lớp TypeScript `OOPReflectionEngine` mô phỏng bảng VTable đa hình ảo và cấp phát ô nhớ Heap RAM.
- **ADR-20:** Thực hiện mô phỏng phản xạ Class và con trỏ đa hình hoàn toàn ở Client-side dưới **10ms** thay vì gửi request gọi trình biên dịch Backend.
- **Giao diện:** Thẻ lớp Glassmorphism chồng xếp mờ kính, khóa ổ khóa đồng phát sáng khi vi phạm truy cập Private, bắn laser Bezier liên kết.

### 2. Smart Interactive Quiz Widget (`phase2-smart-quiz`)

- **Cốt lõi:** Bộ trắc nghiệm tương tác thông minh lồng ghép trực tiếp vào tiến trình chạy VCR giải thuật và Monaco Editor.
- **Hạt nhân kỹ thuật:** Bộ chặn sự kiện `VCRPlaybackInterceptor` tự động dừng tiến trình VCR đúng frame trigger và `MonacoLineClickInterceptor` khóa Monaco Editor chỉ cho phép nhấp chọn dòng code dự đoán đáp án.
- **ADR-21:** Thay thế trắc nghiệm truyền thống bằng tương tác Click trực tiếp lên khung vẽ Canvas đồ họa hoặc dòng lệnh Monaco Editor, tăng 200% khả năng lưu giữ bài học.
- **Giao diện:** Cửa sổ trượt kính mờ, phản hồi HSL Correct (Lục phát sáng) và Incorrect (Đỏ rung động viền lắc).

### 3. SOLID Principles Visualizer (`phase2-solid-visualization`)

- **Cốt lõi:** Trực quan hóa 5 nguyên lý SOLID khó hiểu bậc nhất kỹ nghệ phần mềm.
- **Hạt nhân kỹ thuật:** Bộ tính toán kết dính lớp `LCOMCalculator` (LCOM4 BFS/DFS Disjoint Subgraphs) đo lường nguyên lý SRP và mô phỏng LSP thay thế chim đà điểu nứt vỡ.
- **ADR-22:** Engine tĩnh lint SOLID chạy 100% Client-side phân tích DFS LCOM4 cực nhanh dưới **0.2ms** bảo đảm độ nhạy tương tác.
- **Giao diện:** Thẻ SRP tỏa nhiệt Canvas 2D rực lửa quá tải kết dính, đường nối LSP nứt rạn dạng kính vỡ lộng lẫy và DIP Neon đảo ngược.

### 4. State Inspector RAM Panel (`phase2-state-inspector`)

- **Cốt lõi:** Bộ thanh tra trạng thái RAM ảo xếp chồng ngăn xếp Call Stack và con trỏ chỉ Heap.
- **Hạt nhân kỹ thuật:** Động cơ `StateInspectorEngine` push/pop frames RAM cục bộ và bộ uốn lượn `PointerArrowBatchRenderer` bắt bounding box uốn Bezier SVG nét đứt neon.
- **ADR-23:** Vẽ liên kết tọa độ động từ Stack variable sang Heap node bằng SVG Bezier hoàn toàn ở Client-side, tự động co giãn bám sát tuyệt đối khi resize cửa sổ.
- **Giao diện:** Xếp chồng ngăn xếp 3D kính mờ Cyan phát sáng, hạt quét indicator bám đuổi ngón tay, hover biến bập bùng Amber Pulse.

### 5. System Design Visualizer (`phase2-system-design-viz`)

- **Cốt lõi:** Trực quan hóa thiết kế hệ thống lớn phân tán (Load Balancer, Web Server, DB Replication lag, MQ).
- **Hạt nhân kỹ thuật:** Lập trình định tuyến tròn `SystemDesignEngine` (Round-Robin), tự phục hồi sự cố sập Web Server (Failover) dưới 5ms và hàng đợi Database Replication lag.
- **ADR-24:** Mô phỏng luồng tin mạng phân tán bằng Actor-Model hoàn toàn ở Client-side dưới **10ms** chịu tải mưa hạt dữ liệu lớn.
- **Giao diện:** Thẻ Server kính mờ kéo thả lơ lửng, hạt Neon trôi nổi trượt trên SVG Paths, Canvas khói bụi xám cuồn cuộn 60 FPS khi sập nguồn.

### 6. VCR Timeline Playback (`phase2-timeline-playback`)

- **Cốt lõi:** Hạt nhân điều hướng dòng thời gian giải thuật phim hoạt ảnh Play/Pause/Rewind/Forward.
- **Hạt nhân kỹ thuật:** Động cơ máy lập lịch `VCRPlaybackEngine` chạy đồng hồ hiệu năng cao `performance.now()` kết hợp đập nhịp requestAnimationFrame.
- **ADR-25:** Caching Snapshot mảng dữ liệu `PlaybackFrame` dưới RAM máy khách dưới **5ms** tránh hoàn toàn biên dịch lại bước từ đầu hay gọi Backend.
- **Giao diện:** Cụm phím kén nhộng VCR kính mờ, đường trượt Scrubber Neon, indicator phồng to scale(1.3) bám tay quét mượt mà.

---

## 🎨 HƯỚNG DẪN THIẾT KẾ VÀ TIÊU CHUẨN LẬP TRÌNH (CORE RULES)

Để giữ vững vị thế EdTech trực quan hóa đẳng cấp premium hàng đầu thế giới, toàn bộ 25 phân hệ phải tuân thủ nghiêm ngặt các quy tắc kỹ thuật sau:

1.  **Rich Aesthetics & Dark Mode:** Giao diện tối sẫm màu Slate 900, sử dụng kính mờ Glassmorphism (`backdrop-filter: blur(12px)`), viền mờ ảo 8% trắng, phát sáng Neon với các dải màu tailord HSL (Cyan, Emerald, Amber, Crimson).
2.  **60 FPS Animations:** Tuyệt đối không dùng setTimeout hay setInterval nhàn rỗi để vẽ hoạt ảnh chuyển động. Bắt buộc dùng `requestAnimationFrame` đồng bộ nhịp quét màn hình thiết bị học viên.
3.  **Memory Garbage Collection (GC):** Khi unmount component hoặc đóng workspace, bắt buộc hủy bỏ toàn bộ `cancelAnimationFrame`, tháo dỡ resize window listeners và xóa mảng tĩnh Caching RAM đề phòng tràn bộ nhớ máy khách.
4.  **Client-side First Philosophy:** Các mô phỏng tương tác gỡ lỗi, lội ngược dòng, vẽ mũi tên con trỏ phải xử lý 100% tại RAM máy khách dưới **10ms**, mang lại phản hồi xúc giác tối cao nhạy bén cho sinh viên.
5.  **Monaco Editor Synchronization:** Mọi hành vi gỡ lỗi chuyển bước giải thuật đều phải bắn sự kiện đồng bộ nhảy dòng bôi sáng vàng rực trong Monaco Editor bằng API `revealLineInCenter`.
