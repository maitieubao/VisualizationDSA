# ðŸ›ï¸ Nháº­t KÃ½ Quyáº¿t Äá»‹nh Kiáº¿n TrÃºc - Architectural Decision Records (ADR)

TÃ i liá»‡u nÃ y ghi láº¡i cÃ¡c quyáº¿t Ä‘á»‹nh kiáº¿n trÃºc ká»¹ thuáº­t cá»‘t lÃµi (ADR) Ä‘á»‹nh hÃ¬nh toÃ n bá»™ há»‡ thá»‘ng **VisualizationDSA**.

> âš ï¸ **LÆ°u Ã½:** Chá»‰ cÃ¡c ADR cÃ³ code thá»±c táº¿ Ä‘Ã£ hiá»‡n thá»±c hÃ³a má»›i Ä‘Æ°á»£c ghi nháº­n táº¡i Ä‘Ã¢y. CÃ¡c ADR cho tÃ­nh nÄƒng chÆ°a implement Ä‘Æ°á»£c chuyá»ƒn vá» pháº§n spec cá»§a tá»«ng feature trong `plan/features/deep-decomposition/`.

---

## ADR-01: Kiáº¿n TrÃºc BiÃªn Dá»‹ch TÄ©nh Client-Side First (AST Compilation under 5ms)

- **Tráº¡ng thÃ¡i:** âœ… IMPLEMENTED â€” `src/core/CompilerStepExecutor.ts`
- **Ngá»¯ cáº£nh:** Há»‡ thá»‘ng cáº§n pháº£n há»“i biÃªn dá»‹ch mÃ£ nguá»“n giáº£i thuáº­t tÃ¹y biáº¿n do sinh viÃªn viáº¿t Ä‘á»ƒ xuáº¥t cÃ¡c khung hÃ¬nh hoáº¡t áº£nh. Gá»­i mÃ£ lÃªn Backend gÃ¢y trá»… máº¡ng.
- **Quyáº¿t Ä‘á»‹nh:** Thá»±c thi mÃ£ JavaScript trong má»™t Sandbox an toÃ n (`new Function(...)`) vá»›i hÃ ng phÃ²ng ngá»± thá»© hai lÃ  Regex fallback, sinh chuá»—i `PlaybackFrame[]` 100% táº¡i trÃ¬nh duyá»‡t.
- **Há»‡ quáº£:** Loáº¡i bá» hoÃ n toÃ n Ä‘á»™ trá»… máº¡ng. Pháº£n há»“i biÃªn dá»‹ch tá»©c thÃ¬. Bá»™ báº£o vá»‡ chá»‘ng vÃ²ng láº·p vÃ´ háº¡n giá»›i háº¡n 10.000 bÆ°á»›c.
- **File liÃªn quan:** `CompilerStepExecutor.ts`, test: `CoreAnimationEngine.spec.ts`

---

## ADR-02: Äá»“ng Bá»™ Hoáº¡t áº¢nh Xung requestAnimationFrame (rAF 60 FPS Engine)

- **Tráº¡ng thÃ¡i:** âœ… IMPLEMENTED â€” `src/core/CoreAnimationEngine.ts`
- **Ngá»¯ cáº£nh:** Hoáº¡t áº£nh di chuyá»ƒn cÃ¡c pháº§n tá»­ máº£ng hoÃ¡n vá»‹ dá»… bá»‹ giáº­t hÃ¬nh náº¿u dÃ¹ng `setInterval` hay `setTimeout`.
- **Quyáº¿t Ä‘á»‹nh:** VÃ²ng láº·p rAF bÃ¡m táº§n sá»‘ quÃ©t thá»±c táº¿ mÃ n hÃ¬nh (60Hzâ€“144Hz), Ã¡p dá»¥ng Lerp tuyáº¿n tÃ­nh cho má»i thuá»™c tÃ­nh Ä‘á»™ng (vá»‹ trÃ­ X, mÃ u RGB, scale). DeltaTime Ä‘Æ°á»£c clamp á»Ÿ 32ms Ä‘á»ƒ chá»‘ng spike khi áº©n tab.
- **Há»‡ quáº£:** Hoáº¡t áº£nh 60 FPS mÆ°á»£t mÃ , tá»± dá»«ng khi áº©n tab, GC-safe (`cancelAnimationFrame` + `renderCallbacks = []` trong `destroy()`).
- **File liÃªn quan:** `CoreAnimationEngine.ts`, `useAnimatedItems.ts`, `ArrayBarVisualizer.vue`

---

## ADR-03: Kiáº¿n TrÃºc VCR Player â€” Data-Driven Playback

- **Tráº¡ng thÃ¡i:** âœ… IMPLEMENTED â€” `src/features/vcr-player/store/useVcrStore.ts`
- **Ngá»¯ cáº£nh:** Canvas khÃ´ng nÃªn chá»©a logic so sÃ¡nh hay kiá»ƒm tra thuáº­t toÃ¡n. Cáº§n tÃ¡ch biá»‡t rÃµ rÃ ng giá»¯a logic sinh dá»¯ liá»‡u vÃ  lá»›p váº½.
- **Quyáº¿t Ä‘á»‹nh:** Backend sinh `SortFrame[]` / `PlaybackFrame[]` trÆ°á»›c khi play. Canvas chá»‰ Ä‘á»c frame táº¡i `currentFrameIndex` tá»« Pinia Store vÃ  váº½ tráº¡ng thÃ¡i Ä‘Ã³. VCR Player Ä‘iá»u khiá»ƒn `currentFrameIndex` qua `stepNext()`, `stepPrev()`, `jumpToFrame()`, `setInterval` auto-advance.
- **Há»‡ quáº£:** Canvas khÃ´ng cÃ³ logic thuáº­t toÃ¡n nÃ o. Scrubber tá»©c thÃ¬ khÃ´ng cáº§n re-compute. Tá»‘c Ä‘á»™ playback chá»‰nh Ä‘Æ°á»£c qua `playbackSpeed` ref.
- **File liÃªn quan:** `useVcrStore.ts`, `ArrayBarVisualizer.vue`, `VcrControlPanel.vue`

---

## ADR-04: Modular Feature Architecture â€” Barrel Exports

- **Tráº¡ng thÃ¡i:** âœ… IMPLEMENTED â€” `src/features/*/index.ts`
- **Ngá»¯ cáº£nh:** Cáº§n tá»• chá»©c code theo tÃ­nh nÄƒng Ä‘á»ƒ trÃ¡nh import spaghetti giá»¯a cÃ¡c module.
- **Quyáº¿t Ä‘á»‹nh:** Má»—i feature (`algorithm-sandbox`, `vcr-player`, `code-editor`, `quiz`) cÃ³ file `index.ts` lÃ m barrel export. `App.vue` chá»‰ import tá»« barrel, khÃ´ng import trá»±c tiáº¿p vÃ o ná»™i bá»™ feature khÃ¡c.
- **Há»‡ quáº£:** Import rÃµ rÃ ng, Ä‘á»•i tÃªn ná»™i bá»™ khÃ´ng áº£nh hÆ°á»Ÿng consumer bÃªn ngoÃ i. Store `playback.ts` giá»¯ alias deprecated Ä‘á»ƒ backward-compat.
- **File liÃªn quan:** `src/features/*/index.ts`, `src/store/playback.ts`

---

## ADR chá» implement (tham kháº£o spec)

CÃ¡c ADR sau Ä‘Ã¢y Ä‘Æ°á»£c ghi trong tÃ i liá»‡u Ä‘áº·c táº£ nhÆ°ng **chÆ°a cÃ³ code thá»±c táº¿**:

| ADR         | TÃ­nh nÄƒng                                     | Sprint    |
| :---------- | :-------------------------------------------- | :-------- |
| ADR-LCOM4   | TÃ­nh LCOM4 BFS/DFS Ä‘o káº¿t dÃ­nh SRP            | Sprint 7  |
| ADR-DI-LOOP | PhÃ¡t hiá»‡n Dependency Loop DFS IoC Container   | Sprint 8  |
| ADR-SMOKE   | Háº¡t khÃ³i Canvas GC-Cycle Emitter Server crash | Sprint 11 |
| ADR-VTABLE  | MÃ´ phá»ng VTable Ä‘a hÃ¬nh OOP client-side       | Sprint 6  |

---

## ADR-BACKEND-DRIVEN: Backend-Driven State Capture cho Phase 1 Animation Engine

- **Tráº¡ng thÃ¡i:** âœ… IMPLEMENTED
- **Ngá»¯ cáº£nh:** Phase 1 Animation Engine cáº§n kiáº¿n trÃºc má»›i cho viá»‡c trá»±c quan hÃ³a giáº£i thuáº­t, bá»• sung bÃªn cáº¡nh kiáº¿n trÃºc Client-Side First hiá»‡n táº¡i (ADR-01).
- **Quyáº¿t Ä‘á»‹nh:** Ãp dá»¥ng mÃ´ hÃ¬nh Backend-Driven State Capture: Backend C# cháº¡y thuáº­t toÃ¡n, ghi nháº­n snapshot tá»«ng bÆ°á»›c vÃ o List FrameDTO, Frontend Vue 3 nháº­n JSON vÃ  phÃ¡t láº¡i nhÆ° video player.
- **Há»‡ quáº£:**
  - TÃ­nh toÃ n váº¹n dá»¯ liá»‡u cao (logic thuáº­t toÃ¡n C# tÆ°á»ng minh).
  - Scrubbing O(1) complexity (thay Ä‘á»•i currentIndex trong Pinia Store).
  - Má»Ÿ rá»™ng thuáº­t toÃ¡n má»›i cá»±c nhanh (chá»‰ viáº¿t C# class káº¿ thá»«a AlgorithmBase).
  - shallowRef tá»‘i Æ°u RAM Vue 3 (tiáº¿t kiá»‡m 95% CPU tracking reactivity).
  - Fallback dummy engine phÃ­a Frontend khi Backend chÆ°a sáºµn sÃ ng.
- **File liÃªn quan:**
  - Backend: Domain/Engine/AlgorithmBase.cs, BubbleSortExecutor.cs, FrameDTO.cs, AlgorithmsController.cs
  - Frontend: useAnimationStore.ts, CanvasLayer.vue, VisualizationPlayer.vue, algorithmApi.ts
  - Tests: useAnimationStore.spec.ts (16 tests), algorithmApi.spec.ts (7 tests)

---

## ADR-ZERO-TRUST-INPUT: Zero Trust Input Pipeline cho Phase 1 Custom Input Generator

- **Tráº¡ng thÃ¡i:** âœ… IMPLEMENTED
- **Ngá»¯ cáº£nh:** TÃ­nh nÄƒng Custom Input cho phÃ©p ngÆ°á»i dÃ¹ng nháº­p dá»¯ liá»‡u tá»± do, táº¡o rá»§i ro báº£o máº­t (DDoS qua máº£ng lá»›n, injection qua kÃ½ tá»± láº¡).
- **Quyáº¿t Ä‘á»‹nh:** Ãp dá»¥ng nguyÃªn lÃ½ Zero Trust Input Pipeline â€” xÃ¡c thá»±c 3 táº§ng:
  1. Frontend Regex validation (instant UI feedback, khÃ³a nÃºt Execute khi sai).
  2. Backend InputParser (Regex C# quÃ©t láº¡i toÃ n bá»™ chuá»—i thÃ´).
  3. Backend ConstraintResolver (giá»›i háº¡n pháº§n tá»­ tá»‘i Ä‘a per-algorithm) + CancellationToken 2s timeout.
- **Há»‡ quáº£:**
  - Báº£o vá»‡ CPU server khá»i payload máº£ng khá»•ng lá»“.
  - UX pháº£n há»“i tá»©c thÃ¬ (viá»n Ä‘á»/xanh/cam, Ä‘áº¿m pháº§n tá»­ real-time).
  - Sinh máº£ng ngáº«u nhiÃªn thÃ´ng minh (random/nearly-sorted/reversed) hoÃ n toÃ n client-side.
  - Fallback sang dummy engine khi Backend unreachable.
- **File liÃªn quan:**
  - Backend: Domain/Input/InputParser.cs, ConstraintResolver.cs, Application/DTOs/CustomInputRequestDto.cs, AlgorithmsController.cs (custom-execute endpoint)
  - Frontend: custom-input/store/useInputStore.ts, custom-input/components/CustomInputForm.vue
  - Tests: useInputStore.spec.ts (38 tests)

---

## ADR-STRATEGY-DI: Strategy Pattern + Reflection DI cho Phase 1 DSA Modules Library

- **Tráº¡ng thÃ¡i:** âœ… IMPLEMENTED
- **Ngá»¯ cáº£nh:** Há»‡ thá»‘ng cáº§n má»Ÿ rá»™ng tá»« 1 thuáº­t toÃ¡n (Bubble Sort) lÃªn 10+ thuáº­t toÃ¡n mÃ  khÃ´ng sá»­a code Controller hoáº·c logic hiá»‡n táº¡i.
- **Quyáº¿t Ä‘á»‹nh:** Ãp dá»¥ng Strategy Pattern + Reflection-based DI Auto-Registration:
  1. `IAlgorithmStrategy` interface: má»—i thuáº­t toÃ¡n lÃ  má»™t Plugin class Ä‘á»™c láº­p.
  2. `AlgorithmDIConfiguration.cs`: quÃ©t Assembly tá»± Ä‘á»™ng tÃ¬m táº¥t cáº£ class implement IAlgorithmStrategy vÃ  Ä‘Äƒng kÃ½ vÃ o DI Container.
  3. Controller inject `IEnumerable<IAlgorithmStrategy>`: khÃ´ng cáº§n switch-case, khÃ´ng cáº§n sá»­a code khi thÃªm thuáº­t toÃ¡n má»›i.
  4. Frontend Dynamic Component: `<component :is>` tá»± chuyá»ƒn renderer theo category (Sortingâ†’Bars, Searchingâ†’Boxes, Treeâ†’Nodes, Stack-Queueâ†’Tube).
- **Há»‡ quáº£:**
  - Open/Closed Principle hoÃ n háº£o: thÃªm thuáº­t toÃ¡n má»›i = chá»‰ táº¡o 1 file C# class.
  - 10 thuáº­t toÃ¡n Ä‘áº§y Ä‘á»§: BubbleSort, SelectionSort, InsertionSort, QuickSort, MergeSort, LinearSearch, BinarySearch, Stack, Queue, BST.
  - 4 Canvas Renderers chuyÃªn biá»‡t: BarChart (sorting bars), BoxArray (search boxes + Low/Mid/High pointers), TreeRenderer (BST node circles + edges), TubeRenderer (Stack vertical LIFO / Queue horizontal FIFO).
  - Binary Search validation gate: tá»« chá»‘i máº£ng chÆ°a sáº¯p xáº¿p vá»›i HTTP 400.
  - Fallback dummy generators cho táº¥t cáº£ 10 thuáº­t toÃ¡n khi Backend chÆ°a sáºµn sÃ ng.
- **File liÃªn quan:**
  - Backend: Domain/Strategies/IAlgorithmStrategy.cs, AlgorithmStrategyBase.cs, 10 Strategy files, Infrastructure/Extensions/AlgorithmDIConfiguration.cs
  - Frontend: dsa-modules/store/useAlgorithmStore.ts, dsa-modules/services/dummyGenerators.ts, dsa-modules/components/DSAPlayer.vue, AlgorithmVisualizer.vue, 4 renderers
  - Tests: useAlgorithmStore.spec.ts (10), dummyGenerators.spec.ts (19), dsaApi.spec.ts (3), algorithmCatalog.spec.ts (8) â€” 40 tests total

---

## ADR-E-LECTURE: Script-driven E-Lecture Mode (Phase 1 â€” Cognitive Load Theory)

- **Tráº¡ng thÃ¡i:** âœ… IMPLEMENTED
- **Ngá»¯ cáº£nh:** Há»‡ thá»‘ng cáº§n cháº¿ Ä‘á»™ bÃ i giáº£ng Ä‘iá»‡n tá»­ dáº«n dáº¯t sinh viÃªn qua tá»«ng bÆ°á»›c giáº£i thuáº­t theo ká»‹ch báº£n sÆ° pháº¡m (Cognitive Load Theory), khÃ´ng hardcode logic UI mÃ  dÃ¹ng JSON script.
- **Quyáº¿t Ä‘á»‹nh:** Ãp dá»¥ng Script-driven Architecture vá»›i 3 trá»¥ cá»™t:
  1. `LectureScript` JSON schema: má»—i bÃ i giáº£ng lÃ  máº£ng `Slide[]`, má»—i slide chá»©a `SlideAction` vá»›i 3 lá»‡nh (`RESET_CANVAS`, `PLAY_UNTIL`, `PAUSE`).
  2. `useLectureStore` orchestration: Ä‘iá»u phá»‘i slide + Ä‘á»“ng bá»™ `useAnimationStore.playUntilFrame()` Promise â€” tá»± Ä‘á»™ng minimize panel (opacity 0.15, scale 0.88) khi Canvas cháº¡y hoáº¡t áº£nh.
  3. `interactionLocked` state: khÃ³a Timeline/Speed/CustomInput controls khi bÃ i giáº£ng Ä‘ang hoáº¡t Ä‘á»™ng, má»Ÿ khÃ³a khi exitLecture.
- **Há»‡ quáº£:**
  - ThÃªm bÃ i giáº£ng má»›i = chá»‰ táº¡o 1 file JSON, khÃ´ng sá»­a code Vue/Pinia.
  - Glassmorphism overlay panel: backdrop-blur 16px, dimmed backdrop 40% opacity.
  - 3 slide types: theory (static), guided-animation (PLAY_UNTIL auto-play), interactive-check (pause + chá» user).
  - Keyboard shortcuts: Arrow Right/Left (slide nav), Esc (exit lecture).
  - Backend API: `GET /api/v1/lectures/{algorithmId}` vá»›i Cache-Control 7 days.
  - Bundled JSON fallback: `bubble-sort-intro.json` táº£i offline khÃ´ng cáº§n API.
- **File liÃªn quan:**
  - Frontend: e-lecture/store/useLectureStore.ts, e-lecture/components/LectureOverlay.vue, e-lecture/services/lectureLoader.ts, e-lecture/types/lecture.types.ts
  - Backend: Domain/Lectures/Lecture.cs, LectureRepository.cs, WebApi/Controllers/LecturesController.cs
  - Extended: animation-engine/store/useAnimationStore.ts (playUntilFrame, goToFrame, interactionLocked)
  - Tests: useLectureStore.spec.ts (13), lectureLoader.spec.ts (7), animationStoreExtensions.spec.ts (8) â€” 28 tests total

---

## ADR-EXECUTION-CONTROL: VCR Control Panel NÃ¢ng cáº¥p (Phase 1 â€” Command Issuer Pattern)

- **Tráº¡ng thÃ¡i:** âœ… IMPLEMENTED
- **Ngá»¯ cáº£nh:** Há»‡ thá»‘ng cáº§n báº£ng Ä‘iá»u khiá»ƒn VCR chuyÃªn nghiá»‡p kiá»ƒu YouTube/Netflix player: Replay, Dynamic Tooltip, Throttled Scrubbing 30 FPS, localStorage persistence, enhanced keyboard shortcuts.
- **Quyáº¿t Ä‘á»‹nh:** Ãp dá»¥ng Command Issuer Pattern + Composable Architecture:
  1. `AnimControlPanel.vue` chá»‰ phÃ¡t lá»‡nh tá»›i `useAnimationStore`, khÃ´ng xá»­ lÃ½ logic Canvas â€” Loose Coupling.
  2. `useThrottledScrub` composable: Throttle 33ms (~30 FPS) khi kÃ©o tua slider, tá»± Ä‘á»™ng pause khi báº¯t Ä‘áº§u scrub.
  3. `usePlaybackHotkeys` composable: Global keyboard listener vá»›i input focus guard (INPUT/TEXTAREA/SELECT), Shift+Arrow rewind/fast-forward, interactionLocked guard, auto-cleanup onUnmount.
  4. `useSliderTooltip` composable: Dynamic tooltip hiá»ƒn thá»‹ explanation khi hover slider, truncateText 55 chars.
  5. `useSpeedPreferences` composable: localStorage persistence cho `dsa_preferences.defaultSpeed`, init speed on mount.
  6. Replay button: Playâ†’Pauseâ†’Replay (â†©) auto-switch theo playbackState (PLAYING/PAUSED/FINISHED).
  7. YouTube-style slider: Emerald neon progress track, glow thumb, hover height transition.
  8. E-Lecture lock: opacity 0.5 + pointer-events none khi interactionLocked=true.
- **Há»‡ quáº£:**
  - Thanh trÆ°á»£t kÃ©o tua mÆ°á»£t mÃ  30 FPS, khÃ´ng lag CPU.
  - PhÃ­m táº¯t toÃ n cá»¥c (Space, Arrow, Shift+Arrow, R, Esc) khÃ´ng xung Ä‘á»™t vá»›i Custom Input textarea.
  - Tá»‘c Ä‘á»™ phÃ¡t yÃªu thÃ­ch Ä‘Æ°á»£c lÆ°u qua phiÃªn qua localStorage.
  - togglePlay() action má»›i trong useAnimationStore.
- **File liÃªn quan:**
  - Frontend: animation-engine/composables/useSpeedPreferences.ts, useThrottledScrub.ts, usePlaybackHotkeys.ts, useSliderTooltip.ts
  - Component: animation-engine/components/AnimControlPanel.vue (rewritten)
  - Store: animation-engine/store/useAnimationStore.ts (added togglePlay)
  - Tests: executionControl.spec.ts (23 tests)

---

## ADR-PLAYGROUND-CANVAS: Mathematical Collision Canvas cho Phase 1 Interactive Playground

- **Tráº¡ng thÃ¡i:** âœ… IMPLEMENTED
- **Ngá»¯ cáº£nh:** Interactive Playground cáº§n cho phÃ©p ngÆ°á»i dÃ¹ng váº½ Ä‘á»“ thá»‹ tá»± do (nodes + edges) vá»›i kháº£ nÄƒng co giÃ£n Ä‘Ã n há»“i, nhÆ°ng DOM-based rendering (div per node) gÃ¢y giáº­t lag khi káº¿t há»£p Force-Directed Physics á»Ÿ 60 FPS.
- **Quyáº¿t Ä‘á»‹nh:** Ãp dá»¥ng 100% HTML5 Canvas 2D Context + Mathematical Collision Checking:
  1. **Single Event Listener pattern:** Chá»‰ Ä‘Äƒng kÃ½ 1 bá»™ mousedown/mousemove/mouseup lÃªn canvas, dÃ¹ng Euclidean distance Ä‘á»ƒ hit-test nodes vÃ  point-to-segment distance Ä‘á»ƒ hit-test edges.
  2. **GraphGeometryEngine:** Thuáº­t toÃ¡n atan2 tÃ­nh arrowhead placement dá»«ng sÃ¡t viá»n ngoÃ i node (khÃ´ng Ä‘Ã¢m xuyÃªn tÃ¢m).
  3. **ForceDirectedEngine:** Coulomb repulsion (K=4000) + Hooke spring (K=0.05, L=150) + damping 0.85 + stability auto-stop.
  4. **Pinia usePlaygroundStore:** 5 tool modes (SELECT/ADD_NODE/ADD_EDGE/WEIGHT/DELETE), NodeDTO/EdgeDTO, cascade delete, max 30 nodes constraint.
  5. **GraphParser:** Client-side graph-to-adjacency-list converter + BFS connectivity check + JSON export/import.
  6. **Glassmorphism FloatingToolbar:** Vertical toolbar vá»›i backdrop-filter blur(12px), emerald active glow, keyboard shortcuts (V/N/E/W/Del).
- **Há»‡ quáº£:**
  - 60 FPS mÆ°á»£t mÃ  cho Ä‘á»“ thá»‹ 30 nodes + 100 edges vá»›i physics simulation.
  - Rubber-band dashed line + snap glow khi váº½ edge.
  - Weight popover táº¡i midpoint cáº¡nh (auto-focus, Enter/Blur/Esc).
  - Isolated node detection trÆ°á»›c khi submit API (BFS connectivity).
  - Export/Import JSON file cho chia sáº» báº£n váº½.
- **File liÃªn quan:**
  - Frontend: interactive-playground/store/usePlaygroundStore.ts, engine/GraphGeometryEngine.ts, engine/ForceDirectedEngine.ts, services/GraphParser.ts
  - Components: PlaygroundCanvas.vue, FloatingToolbar.vue, InteractivePlayground.vue
  - Tests: interactivePlayground.spec.ts (31 tests)

---

## ADR-PSEUDOCODE-SYNC: LogicalId Cross-Language Mapping cho Phase 1 Pseudocode Sync

- **Tráº¡ng thÃ¡i:** âœ… IMPLEMENTED
- **Ngá»¯ cáº£nh:** Há»‡ thá»‘ng cáº§n Ä‘á»“ng bá»™ real-time giá»¯a Canvas animation frames vÃ  dÃ²ng mÃ£ nguá»“n Ä‘a ngÃ´n ngá»¯ (C++, Java, Python, JavaScript), Ä‘á»“ng thá»i hiá»ƒn thá»‹ biáº¿n Watch Panel Ä‘á»™ng theo tá»«ng bÆ°á»›c thuáº­t toÃ¡n.
- **Quyáº¿t Ä‘á»‹nh:** Ãp dá»¥ng LogicalId Cross-Language Mapping Architecture:
  1. **LogicalId abstraction:** Má»—i dÃ²ng code Ä‘á»u gáº¯n `logicalId` trá»«u tÆ°á»£ng (FUNC_DECL, COMPARE_STEP, SWAP_STEP) â€” cÃ¹ng logicalId Ã¡nh xáº¡ sang dÃ²ng váº­t lÃ½ khÃ¡c nhau tÃ¹y ngÃ´n ngá»¯ (C++ line 5 = Python line 6).
  2. **FrameDTO extension:** Má»Ÿ rá»™ng interface `FrameDTO` vá»›i `activeLogicalLineId` vÃ  `variables: Record<string, string|number>` â€” má»—i frame biáº¿t Ä‘ang thá»±c thi dÃ²ng logic nÃ o vÃ  giÃ¡ trá»‹ biáº¿n táº¡i thá»i Ä‘iá»ƒm Ä‘Ã³.
  3. **PseudocodeSyncEngine:** Core logic 6 static methods â€” `getPhysicalLineNumber` (logicalIdâ†’physical line), `findFirstFrameIndexForLogicalLine` (Click-to-Snap), `findAllFrameIndicesForLogicalLine`, `getNextCycleFrameIndex` (cycle navigation), `transformVariablesForWatch`, `getOccurrenceCount`.
  4. **usePseudocodeStore:** Pinia Setup Store láº¯ng nghe `useAnimationStore.activeFrame` reactive â€” tá»± Ä‘á»™ng tÃ­nh `activePhysicalLineNumber` vÃ  `watchVariablesList` mÃ  khÃ´ng cáº§n event bus hay manual subscription.
  5. **Script registry pattern:** `scriptLoader.ts` + `PseudocodeScript` interface â€” thÃªm thuáº­t toÃ¡n má»›i = chá»‰ táº¡o 1 file script TypeScript, khÃ´ng sá»­a store hay component.
- **Há»‡ quáº£:**
  - Chuyá»ƒn ngÃ´n ngá»¯ tab tá»©c thÃ¬, highlight dÃ²ng tá»± Ä‘á»™ng cáº­p nháº­t qua logicalId mapping.
  - Click-to-Snap luÃ´n nháº£y tá»›i FIRST occurrence (BEHAVIOR_SPEC), cycle navigation qua táº¥t cáº£ occurrences.
  - Watch Panel hiá»ƒn thá»‹ biáº¿n live, áº©n undefined/null (Out-of-Scope handling).
  - Occurrence badge (1/5) cho cÃ¡c dÃ²ng thá»±c thi nhiá»u láº§n (nested loops).
  - Má»Ÿ rá»™ng sang thuáº­t toÃ¡n má»›i = chá»‰ thÃªm 1 script file + cáº­p nháº­t dummy generator.
- **File liÃªn quan:**
  - Types: animation-engine/types/animation.types.ts (FrameDTO extended), pseudocode-sync/types/pseudocode.types.ts
  - Engine: pseudocode-sync/engine/PseudocodeSyncEngine.ts
  - Store: pseudocode-sync/store/usePseudocodeStore.ts, animation-engine/store/useAnimationStore.ts (activeFrame alias)
  - Components: pseudocode-sync/components/MultilingualCodePanel.vue, VariableWatchPanel.vue
  - Scripts: pseudocode-sync/scripts/bubble-sort.pseudocode.ts, scriptLoader.ts
  - Integration: animation-engine/components/VisualizationPlayer.vue, animation-engine/services/algorithmApi.ts
  - Tests: PseudocodeSyncEngine.spec.ts (15), usePseudocodeStore.spec.ts (15), scriptLoader.spec.ts (7) â€” 37 tests total

---

## ADR-12: In-Canvas Hit-Target Verification (Euclidean Distance Quiz Engine)

- **Tráº¡ng thÃ¡i:** âœ… IMPLEMENTED â€” `quiz-system/engine/QuizVerificationEngine.ts`
- **Ngá»¯ cáº£nh:** Phase 1 Quiz System cáº§n há»— trá»£ cÃ¢u há»i CANVAS_TARGET â€” ngÆ°á»i há»c click trá»±c tiáº¿p vÃ o node trÃªn Canvas Ä‘á»ƒ tráº£ lá»i, thay vÃ¬ chá»n phÆ°Æ¡ng Ã¡n A/B/C/D truyá»n thá»‘ng. Cáº§n phÆ°Æ¡ng phÃ¡p xÃ¡c minh va cháº¡m (hit detection) chÃ­nh xÃ¡c.
- **Quyáº¿t Ä‘á»‹nh:**
  1. **Euclidean distance hit detection:** Sá»­ dá»¥ng khoáº£ng cÃ¡ch Euclid `d = sqrt((x - node.x)Â² + (y - node.y)Â²)` Ä‘á»ƒ xÃ¡c Ä‘á»‹nh node nÃ o bá»‹ click. Náº¿u `d â‰¤ node.radius` â†’ hit. Tá»‘i Æ°u báº±ng so sÃ¡nh `dÂ² â‰¤ rÂ²` trÃ¡nh `Math.sqrt()`.
  2. **Client-Side Verification:** ToÃ n bá»™ cháº¥m Ä‘iá»ƒm diá»…n ra á»Ÿ trÃ¬nh duyá»‡t qua `QuizVerificationEngine` static methods â€” khÃ´ng cáº§n API roundtrip.
  3. **Checkpoint Registry Pattern:** `quizLoader.ts` + `QuizScript` interface â€” thÃªm thuáº­t toÃ¡n má»›i = chá»‰ táº¡o 1 file quiz script, khÃ´ng sá»­a store hay component.
  4. **localStorage Stats Persistence:** `QuizStatsManager` lÆ°u thá»‘ng kÃª (totalAttempts, correctAnswers, streak, completedQuizzes) vÃ o `dsa_quiz_statistics` key, xá»­ lÃ½ corrupted data gracefully.
  5. **Checkpoint Repetition Prevention:** `completedCheckpointIndexes` array ngÄƒn cÃ¢u há»i trigger láº¡i khi tua ngÆ°á»£c timeline.
  6. **Lecture Interaction Lock:** Khi quiz active, `useLectureStore.lockLectureInteraction()` pause animation + set `interactionLocked=true`, `dismissQuestionAndContinue()` unlock.
- **Há»‡ quáº£:**
  - CÃ¢u há»i MC/TF/CANVAS_TARGET Ä‘á»u xá»­ lÃ½ qua cÃ¹ng quiz store pipeline.
  - Blank space click bá» qua (khÃ´ng Ä‘áº¿m sai), chá»‰ submit khi Ä‘Ãºng matchedNodeId.
  - Glassmorphism overlay + Neon glow (emerald/rose) + shake animation cho UX feedback tá»©c thÃ¬.
  - Quiz Summary Card hiá»ƒn thá»‹ accuracy/streak/correct badges khi hoÃ n thÃ nh táº¥t cáº£ checkpoints.
  - Má»Ÿ rá»™ng sang thuáº­t toÃ¡n má»›i = chá»‰ thÃªm 1 quiz script file + register vÃ o quizLoader.
- **File liÃªn quan:**
  - Types: quiz-system/types/quiz.types.ts
  - Engine: quiz-system/engine/QuizVerificationEngine.ts, QuizStatsManager.ts, QuizSchemaValidator.ts
  - Store: quiz-system/store/useQuizStore.ts, e-lecture/store/useLectureStore.ts (lock/unlock/resume)
  - Components: quiz-system/components/QuizCardOverlay.vue, QuizSummaryCard.vue
  - Scripts: quiz-system/scripts/bubble-sort.quiz.ts, quizLoader.ts
  - Integration: animation-engine/components/VisualizationPlayer.vue (checkpoint watch)
  - Tests: QuizVerificationEngine.spec.ts (12), QuizStatsManager.spec.ts (9), QuizSchemaValidator.spec.ts (11), useQuizStore.spec.ts (18), quizLoader.spec.ts (4) â€” 54 tests total

---

## ADR-13: AST Instrumentation & Web Worker Sandbox (Phase 2 Code-to-Visualization Compiler)

- **Tráº¡ng thÃ¡i:** âœ… IMPLEMENTED â€” `code-to-visualization/engine/ASTInstrumentationEngine.ts`, `WorkerLifecycleCoordinator.ts`
- **Ngá»¯ cáº£nh:** Phase 2 Code-to-Visualization yÃªu cáº§u biÃªn dá»‹ch mÃ£ JavaScript tÃ¹y biáº¿n do sinh viÃªn viáº¿t thÃ nh chuá»—i hoáº¡t áº£nh trá»±c quan. Cáº§n AST parsing an toÃ n, injection tracing tá»± Ä‘á»™ng, vÃ  sandbox execution cÃ´ láº­p.
- **Quyáº¿t Ä‘á»‹nh:**
  1. **Acorn + acorn-walk + escodegen pipeline:** Parse raw JS â†’ AST (ecmaVersion 2020) â†’ Walk AST nodes â†’ Inject tracing â†’ Regenerate code. HoÃ n toÃ n client-side, khÃ´ng cáº§n backend.
  2. **BinaryExpression instrumentation:** Tá»± Ä‘á»™ng phÃ¡t hiá»‡n `arr[i] > arr[j]` (MemberExpression with computed property) vÃ  thay tháº¿ báº±ng `traceCompare(arr, i, j, ">")` Ä‘á»ƒ ghi nháº­n COMPARE frame.
  3. **AssignmentExpression instrumentation:** PhÃ¡t hiá»‡n `arr[i] = value` vÃ  thay tháº¿ báº±ng `traceAssign(arr, i, value)` Ä‘á»ƒ ghi nháº­n SWAP/ACCESS frame.
  4. **Dual Loop Protection:** AST-injected `__loopCounter` (max 5000 iterations per loop) + Worker timeout (1500ms). Hai lá»›p báº£o vá»‡ chá»‘ng infinite loop.
  5. **Web Worker Sandbox:** Blob URL lifecycle management â€” create Blob â†’ URL.createObjectURL â†’ Worker constructor â†’ terminate + URL.revokeObjectURL. CÃ´ láº­p execution thread, khÃ´ng block UI.
  6. **LiveFrameDTO â†’ FrameDTO conversion:** `useLiveCompilerStore.convertToAnimationFrames()` chuyá»ƒn Ä‘á»•i trace events thÃ nh FrameDTO chuáº©n, tÃ¡i sá»­ dá»¥ng hoÃ n toÃ n CanvasLayer + AnimControlPanel tá»« Phase 1.
  7. **Monaco Editor algolens-dark theme:** Custom theme vá»›i keyword purple (#C084FC), string emerald (#34D399), number amber (#F59E0B), background Slate (#1E293B). JetBrains Mono font.
- **Há»‡ quáº£:**
  - Sinh viÃªn viáº¿t JS code sáº¯p xáº¿p â†’ nháº¥n RUN â†’ xem hoáº¡t áº£nh 60 FPS trÃªn Canvas, khÃ´ng cáº§n backend.
  - Báº£o vá»‡ chá»‘ng vÃ²ng láº·p vÃ´ háº¡n 2 táº§ng: AST guard + Worker timeout.
  - TÃ¡i sá»­ dá»¥ng 100% animation infrastructure tá»« Phase 1 (CanvasLayer, AnimControlPanel, useAnimationStore).
  - Monaco Editor IDE chuyÃªn nghiá»‡p vá»›i syntax highlighting, error glow, status indicators.
  - Compiler Console hiá»ƒn thá»‹ nháº­t kÃ½ biÃªn dá»‹ch real-time vá»›i Neon color coding.
- **File liÃªn quan:**
  - Types: code-to-visualization/types/compiler.types.ts
  - Engine: code-to-visualization/engine/ASTInstrumentationEngine.ts, WorkerLifecycleCoordinator.ts
  - Store: code-to-visualization/store/useLiveCompilerStore.ts
  - Components: code-to-visualization/components/MonacoEditorPanel.vue, CompilerConsole.vue, CodeWorkspace.vue
  - Module: code-to-visualization/index.ts (barrel export)
  - Integration: App.vue (Code IDE tab)
  - Tests: ASTInstrumentationEngine.spec.ts (14), WorkerLifecycleCoordinator.spec.ts (7), useLiveCompilerStore.spec.ts (11) â€” 32 tests total

---

## ADR-14: Side-by-Side Algorithm Comparator â€” Dual Canvas Unified Playback

- **Tráº¡ng thÃ¡i:** âœ… IMPLEMENTED
- **Ngá»¯ cáº£nh:** Sinh viÃªn cáº§n so sÃ¡nh trá»±c quan hiá»‡u nÄƒng Big-O giá»¯a 2 thuáº­t toÃ¡n (vÃ­ dá»¥ Bubble Sort vs Quick Sort) cháº¡y trÃªn cÃ¹ng má»™t máº£ng dá»¯ liá»‡u.
- **Quyáº¿t Ä‘á»‹nh:** Triá»ƒn khai Split Screen 50/50 vá»›i 2 Canvas Ä‘á»™c láº­p props-driven, Ä‘iá»u phá»‘i bá»Ÿi `useCompareAlgorithmsStore` Pinia store. Há»— trá»£ 2 cháº¿ Ä‘á»™ phÃ¡t:
  - **Independent:** Má»—i bÃªn cháº¡y vá»›i tá»‘c Ä‘á»™ base, thuáº­t toÃ¡n nhanh hÆ¡n káº¿t thÃºc trÆ°á»›c vá»›i badge "HoÃ n thÃ nh".
  - **Normalized:** Tá»‘c Ä‘á»™ cÄƒn chá»‰nh (thuáº­t toÃ¡n dÃ i giá»¯ base speed, ngáº¯n giáº£m tá»· lá»‡) Ä‘á»ƒ cáº£ 2 cÃ¹ng káº¿t thÃºc Ä‘á»“ng thá»i.
- **Kiáº¿n trÃºc:**
  - `UnifiedPlaybackCoordinator` â€” syncProgressByPercent (percent â†’ frame mapping), calculateAlignedSpeeds.
  - `UnifiedRenderScheduler` â€” Gom 2 Canvas vÃ o 1 vÃ²ng rAF tá»‘i Æ°u GPU.
  - `CompareCanvasPanel.vue` â€” Reusable props-driven Canvas (tÃ¡ch biá»‡t khá»i global useAnimationStore).
  - Stats extraction tá»« FrameDTO highlights (comparisons = frames with compare[], swaps = frames with swap[]).
  - Fair comparison: Single seed array, cloned vÃ o cáº£ 2 generators.
- **Há»‡ quáº£:** Sinh viÃªn trá»±c quan tháº¥y Quick Sort (O(N log N)) xong trÆ°á»›c Bubble Sort (O(NÂ²)) hÃ ng chá»¥c bÆ°á»›c; báº£ng thá»‘ng kÃª Cyan vs Emerald cáº­p nháº­t real-time.
- **File liÃªn quan:**
  - Types: compare-algorithms/types/compare.types.ts
  - Engine: compare-algorithms/engine/UnifiedPlaybackCoordinator.ts, UnifiedRenderScheduler.ts
  - Store: compare-algorithms/store/useCompareAlgorithmsStore.ts
  - Components: CompareAlgorithmSelector.vue, CompareCanvasPanel.vue, ComparativeDashboard.vue, CompareWorkspace.vue
  - Module: compare-algorithms/index.ts (barrel export)
  - Integration: App.vue ("So sÃ¡nh" tab)
  - Tests: UnifiedPlaybackCoordinator.spec.ts (10), useCompareAlgorithmsStore.spec.ts (19), UnifiedRenderScheduler.spec.ts (4) â€” 33 tests total

---

## ADR-15: Concurrency Visualizer â€” Event-Driven Thread Simulation & DFS Deadlock Detection

- **Tráº¡ng thÃ¡i:** âœ… IMPLEMENTED
- **Ngá»¯ cáº£nh:** Sinh viÃªn cáº§n hiá»ƒu cÆ¡ cháº¿ Ä‘a luá»“ng (Race Condition, Deadlock, Producer-Consumer, Dining Philosophers) nhÆ°ng OS thread tháº­t khÃ´ng thá»ƒ pause/scrub/replay.
- **Quyáº¿t Ä‘á»‹nh:** Triá»ƒn khai Event-Driven Simulation Engine 100% client-side, mÃ´ phá»ng Thread State Machine (READY â†’ RUNNING â†’ BLOCKED â†” RUNNING â†’ FINISHED) qua chuá»—i `ScenarioStep[]` tuáº§n tá»±. Mutex Lock dÃ¹ng queue-based acquisition: thread bá»‹ BLOCKED náº¿u lock Ä‘Ã£ chiáº¿m, tá»± thá»©c dáº­y (RUNNING) khi lock Ä‘Æ°á»£c giáº£i phÃ³ng. Deadlock detection qua DFS trÃªn Wait-For Graph (WFG) â€” adjacency list: Thread A â†’ Thread B khi A chá» lock mÃ  B giá»¯. Chu trÃ¬nh DFS (recStack) = Deadlock.
- **Kiáº¿n trÃºc:**
  - `ConcurrencySimulationEngine` â€” acquireLock (queue), releaseLock (wake signal), moveThread (progress 0-100%), incrementCounter, getEngineState.
  - `DeadlockDetector` â€” static detectDeadlock: build WFG adjacency, DFS with recStack, extract cycleThreadIds.
  - `useConcurrencyStore` â€” Pinia setup store: step-by-step execution, history snapshots (scrub backward via snapshot restore), deadlock check after every step, togglePlayPause, scrubToStep, setMutexEnabled.
  - `ThreadRailsCanvas.vue` â€” Horizontal rails (Slate), runner nodes (Cyan/Amber/Emerald neon), Critical Section gate (rose overlay), Mutex padlock icon (open/locked), Deadlock Neon Rose pulse animation.
  - 4 scenario presets: Race Condition (24 steps), Deadlock Demo (12 steps), Producer-Consumer (18 steps), Dining Philosophers (20 steps).
- **Há»‡ quáº£:** Sinh viÃªn toggle Mutex Báº¬T/Táº®T Ä‘á»ƒ tháº¥y Race Condition vs Synchronized. Deadlock tá»± phÃ¡t hiá»‡n vá»›i neon rose alert. ToÃ n bá»™ pausable/seekable/replayable.
- **File liÃªn quan:**
  - Types: concurrency-viz/types/concurrency.types.ts
  - Engine: concurrency-viz/engine/ConcurrencySimulationEngine.ts (includes DeadlockDetector)
  - Store: concurrency-viz/store/useConcurrencyStore.ts
  - Scenarios: concurrency-viz/scenarios/concurrencyScenarios.ts (4 presets)
  - Components: ThreadRailsCanvas.vue, ConcurrencyWorkspace.vue
  - Module: concurrency-viz/index.ts (barrel export)
  - Integration: App.vue ("Äa luá»“ng" tab)
  - Tests: ConcurrencySimulationEngine.spec.ts (16), useConcurrencyStore.spec.ts (19) â€” 35 tests total

---

## ADR-16: Debug Mode â€” Generator Yield Coroutine Pattern for Pauseable Algorithmic Stepping

- **Tráº¡ng thÃ¡i:** âœ… IMPLEMENTED
- **Ngá»¯ cáº£nh:** Sinh viÃªn cáº§n debug tá»«ng dÃ²ng code thuáº­t toÃ¡n JavaScript, xem biáº¿n thay Ä‘á»•i, call stack, vÃ  tráº¡ng thÃ¡i máº£ng táº¡i má»—i bÆ°á»›c â€” giá»‘ng IDE debugger tháº­t (VS Code F10/F11/F5).
- **Quyáº¿t Ä‘á»‹nh:** Triá»ƒn khai Generator Yield Coroutine Pattern 100% client-side:
  1. **AST â†’ Generator function*:** Acorn parser chuyá»ƒn Ä‘á»•i `function` â†’ `function*`, tiÃªm `yield { lineNumber, arrayState, variables, callStack }` sau má»—i dÃ²ng thá»±c thi.
  2. **Iterator .next() Stepping:** `LiveCompilerDebugger` gá»i `generator.next()` Ä‘á»ƒ bÆ°á»›c tá»«ng dÃ²ng, lÆ°u history[] cho step backward.
  3. **Breakpoint hit detection:** `continueToNextBreakpoint()` loop `.next()` cho Ä‘áº¿n khi `lineNumber âˆˆ breakpoints Set`, max 5000 steps timeout.
  4. **Step Out:** Loop `.next()` cho Ä‘áº¿n khi `callStack.length < currentDepth`.
  5. **Safety Guards:** `__loopCounter > 5000` chá»‘ng infinite loop, `__recursionDepth > 500` chá»‘ng stack overflow.
  6. **Variable Mutation Detection:** So sÃ¡nh `old vs new watchedVariables` má»—i bÆ°á»›c, highlight Cyan Neon cho biáº¿n thay Ä‘á»•i.
- **Kiáº¿n trÃºc:**
  - `DebuggerYieldEngine` â€” compileToDebugGenerator (Acorn parse â†’ AST walk â†’ escodegen regenerate)
  - `LiveCompilerDebugger` â€” Iterator controller (stepForward/stepBackward/continueToNextBreakpoint/stepOut)
  - `useLiveDebuggerStore` â€” Pinia store (status FSM, breakpoints, callStack, watchedVars, mutatedKeys)
  - `DebugWorkspace.vue` â€” Monaco Editor (algolens-debug theme, gutter breakpoints rose dots, active line Cyan) + DebugCanvas + CallStackVisualizer + DebugWatchPanel + VCR debug controls
- **Há»‡ quáº£:** Sinh viÃªn tháº¥y code highlight dÃ²ng Ä‘ang cháº¡y, biáº¿n thay Ä‘á»•i real-time, call stack 3D Glassmorphism, máº£ng animate. ToÃ n bá»™ pauseable/seekable/stepable â€” khÃ´ng cáº§n Backend.
- **File liÃªn quan:**
  - Types: debug-mode/types/debug.types.ts
  - Engine: debug-mode/engine/DebuggerYieldEngine.ts, LiveCompilerDebugger.ts
  - Store: debug-mode/store/useLiveDebuggerStore.ts
  - Components: DebugWorkspace.vue, CallStackVisualizer.vue, DebugWatchPanel.vue, DebugCanvas.vue
  - Module: debug-mode/index.ts (barrel export)
  - Integration: App.vue ("Debug" tab)
  - Tests: DebuggerYieldEngine.spec.ts (15), LiveCompilerDebugger.spec.ts (13), useLiveDebuggerStore.spec.ts (21) â€” 49 tests total

---

## ADR-17: Design Patterns Visualizer â€” SVG Cubic Bezier UML Diagram with Reactive Drag-and-Drop

- **Tráº¡ng thÃ¡i:** âœ… IMPLEMENTED
- **Ngá»¯ cáº£nh:** Sinh viÃªn cáº§n hiá»ƒu cÃ¡c máº«u thiáº¿t káº¿ (Strategy, Observer) vÃ  nguyÃªn táº¯c SOLID (DIP) qua sÆ¡ Ä‘á»“ UML tÆ°Æ¡ng tÃ¡c, nhÆ°ng sÆ¡ Ä‘á»“ tÄ©nh khÃ´ng thá»ƒ hiá»‡n runtime behavior (swap Strategy, notify Observer, toggle DIP).
- **Quyáº¿t Ä‘á»‹nh:** Triá»ƒn khai SVG Cubic Bezier UML Diagram 100% client-side:
  1. **Cubic Bezier Path Calculation:** `M startX,startY C cp1X,cp1Y cp2X,cp2Y endX,endY` vá»›i controlOffset = max(30, min(100, deltaY * 0.5)) Ä‘áº£m báº£o Ä‘Æ°á»ng cong mÆ°á»£t mÃ  giá»¯a cÃ¡c node á»Ÿ má»i khoáº£ng cÃ¡ch.
  2. **Reactive Drag-and-Drop:** Vue 3 reactivity tracking node positions (x, y), SVG paths tá»± Ä‘á»™ng recalculate qua pathCache reactive Map, global window mousemove/mouseup cho UX drag mÆ°á»£t.
  3. **Strategy Runtime Swap:** Link dependency tá»« Client snap sang concrete Strategy má»›i (BubbleSort â†” QuickSort), Amber neon glow cho active target.
  4. **Observer Notify Pulse:** CSS stroke-dashoffset animation 1.2s infinite linear lan tá»a tá»« Subject qua SVG paths tá»›i Observers, Cyan neon glow.
  5. **DIP Toggle Sandbox:** Switch giá»¯a "Highly Coupled" (direct red line, 85%) vÃ  "Loosely Coupled" (blue lines through IDatabase Interface, 20%) Ä‘á»ƒ dáº¡y Dependency Inversion Principle.
  6. **Glassmorphism UML Nodes:** backdrop-blur(12px), rgba background, stereotype headers (<<interface>>, <<abstract>>), JetBrains Mono font.
- **Kiáº¿n trÃºc:**
  - `DesignPatternVisualizerEngine` â€” calculateBezierPath, updateNodePosition (clamped), swapStrategyTarget, calculateAllPaths, replaceState
  - `useDesignPatternsStore` â€” Pinia setup store: initializeScenario, handleNodeDrag, switchStrategy, triggerObserverNotify (2s timeout), toggleDIP, couplingIndexMetric computed (85â†’20), pathCache reactive
  - `ClassNodeCard.vue` â€” Glassmorphism cards with drag
  - `DesignPatternsCanvas.vue` â€” SVG layer + HTML overlay
  - `DesignPatternsWorkspace.vue` â€” Scenario tabs + controls
  - 3 scenario presets: Strategy Pattern (4 nodes), Observer Pattern (5 nodes), DIP Sandbox (2+1 nodes)
- **Há»‡ quáº£:** Sinh viÃªn tháº¥y trá»±c quan Strategy swap (Amber line snaps), Observer notify (Cyan pulse flows), DIP toggle (Interface xuáº¥t hiá»‡n/biáº¿n máº¥t, coupling index 85â†’20). ToÃ n bá»™ draggable + interactive.
- **File liÃªn quan:**
  - Types: design-patterns/types/design-patterns.types.ts
  - Engine: design-patterns/engine/DesignPatternVisualizerEngine.ts
  - Store: design-patterns/store/useDesignPatternsStore.ts
  - Scenarios: design-patterns/scenarios/scenarioData.ts (3 presets)
  - Components: ClassNodeCard.vue, DesignPatternsCanvas.vue, DesignPatternsWorkspace.vue
  - Module: design-patterns/index.ts (barrel export)
  - Integration: App.vue ("Patterns" tab â€” replaced PatternSandbox)
  - Tests: DesignPatternVisualizerEngine.spec.ts (18), useDesignPatternsStore.spec.ts (22), scenarioData.spec.ts (10) â€” 50 tests total

---

## ADR-18: Architecture Refactoring — Vue Router Lazy Loading + Backend Middleware + FSD Chu?n hóa

- **Tr?ng thái:** `? IMPLEMENTED` — 2026-05-25
- **Quy?t ð?nh:** (1) Vue Router 4 + dynamic import lazy loading, (2) App.vue refactor thành Shell Component 80 d?ng, (3) Database.Migrate() thay EnsureCreated(), (4) ErrorHandlingMiddleware + SecurityHeadersMiddleware, (5) algorithm-sandbox/engine/ subfolder FSD.
- **H? qu?:** Initial bundle gi?m ~80%, thêm tab m?i không s?a App.vue, Backend error JSON chu?n hóa, b?o m?t 7 security headers.

---

## ADR-19: Backend Integrity & Security Upgrades â€” Transactions, OCC, Signature Webhook & Automated Tests

- **Tráº¡ng thÃ¡i:** `âœ… IMPLEMENTED` â€” 2026-05-25
- **Quyáº¿t Ä‘á»‹nh:** (1) Triá»ƒn khai Database Transaction trong Unit of Work Ä‘á»ƒ bá»c webhook xá»­ lÃ½ thanh toÃ¡n, (2) Cáº¥u hÃ¬nh Optimistic Concurrency Control (OCC) sá»­ dá»¥ng shadow property `xmin` cá»§a PostgreSQL trÃªn thá»±c thá»ƒ User, (3) Há»— trá»£ xÃ¡c thá»±c webhook SePay báº±ng chá»¯ kÃ½ báº£o máº­t HMAC-SHA256, (4) TÃ­ch há»£p FluentValidation tá»± Ä‘á»™ng kiá»ƒm tra tÃ­nh há»£p lá»‡ cá»§a request payload, (5) Táº¡o dá»± Ã¡n Unit Tests xUnit cho backend.
- **Há»‡ quáº£:** Webhook thanh toÃ¡n an toÃ n, Ä‘áº£m báº£o tÃ­nh nguyÃªn tá»­ (atomicity), trÃ¡nh race condition khi cá»™ng XP Ä‘á»“ng thá»i, tÄƒng tÃ­nh tin cáº­y cá»§a mÃ£ nguá»“n qua bá»™ 6 unit tests phá»§ 100% pass cho AuthService vÃ  GamificationService.
- **File liÃªn quan:**
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

- **Tráº¡ng thÃ¡i:** `âœ… IMPLEMENTED` â€” 2026-05-25
- **Quyáº¿t Ä‘á»‹nh:**
  1. **Bá»™ nhá»› Ä‘á»‡m (Caching):** ÄÄƒng kÃ½ `IMemoryCache` vÃ  Ã¡p dá»¥ng trong `LeaderboardService` Ä‘á»ƒ cache top 20 users xáº¿p háº¡ng trong vÃ²ng 60 giÃ¢y, giÃºp giáº£m táº£i tá»‘i Ä‘a cÃ¡c truy váº¥n láº·p láº¡i liÃªn tá»¥c lÃªn database.
  2. **Chá»‰ má»¥c cÆ¡ sá»Ÿ dá»¯ liá»‡u (Database Indexing):** Cáº¥u hÃ¬nh index cá»™t `TotalXP` cho thá»±c thá»ƒ `User` trong `ApplicationDbContext` Ä‘á»ƒ tá»‘i Æ°u hÃ³a hiá»‡u nÄƒng cÃ¢u lá»‡nh sáº¯p xáº¿p (sorting) trÃªn PostgreSQL, Ä‘á»“ng thá»i sinh migration `AddUserTotalXpIndex`.
  3. **Tá»± Ä‘á»™ng thá»­ láº¡i (Database Connection Resiliency):** Cáº¥u hÃ¬nh `EnableRetryOnFailure()` cá»§a Npgsql khi Ä‘Äƒng kÃ½ `DbContext` giÃºp há»‡ thá»‘ng tá»± phá»¥c há»“i tá»« cÃ¡c lá»—i káº¿t ná»‘i máº¡ng táº¡m thá»i.
  4. **Log cÃ³ cáº¥u trÃºc phong phÃº (Serilog LogContext Middleware):** Viáº¿t `UserLoggingMiddleware` Ä‘á»ƒ tá»± Ä‘á»™ng trÃ­ch xuáº¥t `UserId` tá»« Claims cá»§a JWT vÃ  Ä‘Æ°a vÃ o `Serilog.Context.LogContext.PushProperty`, há»— trá»£ quan sÃ¡t hÃ nh vi cá»§a ngÆ°á»i dÃ¹ng trong log há»‡ thá»‘ng.
  5. **API Versioning chÃ­nh thá»©c:** TÃ­ch há»£p gÃ³i NuGet `Asp.Versioning.Mvc` vÃ  `Asp.Versioning.Mvc.ApiExplorer` (phiÃªn báº£n v8.1.0 tÆ°Æ¡ng thÃ­ch .NET 9.0) Ä‘á»ƒ quáº£n lÃ½ phiÃªn báº£n API qua route. Refactor toÃ n bá»™ 10 controllers sang routing dáº¡ng `api/v{version:apiVersion}/[controller]`.
- **Há»‡ quáº£:**
  - Hiá»‡u nÄƒng API Leaderboard Ä‘Æ°á»£c cáº£i thiá»‡n Ä‘á»™t phÃ¡ (Response time dÆ°á»›i 2ms cho cÃ¡c lÆ°á»£t request cache).
  - Tá»‘i Æ°u truy váº¥n SQL sáº¯p xáº¿p cá»§a PostgreSQL.
  - TÄƒng Ä‘á»™ tin cáº­y vÃ  tá»± phá»¥c há»“i cá»§a káº¿t ná»‘i Database.
  - Ghi log cÃ³ cáº¥u trÃºc chi tiáº¿t, dá»… dÃ ng tracking lá»—i theo `UserId`.
  - Chuáº©n hÃ³a phÃ¢n chia phiÃªn báº£n API rÃµ rÃ ng, dá»… báº£o trÃ¬ nÃ¢ng cáº¥p trong tÆ°Æ¡ng lai.
- **File liÃªn quan:**
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

- **Tráº¡ng thÃ¡i:** `âœ… IMPLEMENTED` â€” 2026-05-25
- **Bá»‘i cáº£nh:**
  1. EF Core DbContext khá»Ÿi táº¡o liÃªn tá»¥c trÃªn má»—i HTTP request tiÃªu tá»‘n chi phÃ­ CPU/RAM khi chá»‹u táº£i cao.
  2. Lá»‹ch sá»­ lÃ m bÃ i tráº¯c nghiá»‡m náº¡p toÃ n bá»™ danh sÃ¡ch, gÃ¢y cháº­m vÃ  lÃ£ng phÃ­ RAM khi sá»‘ lÆ°á»£t lÃ m bÃ i cá»§a user tÄƒng lÃªn hÃ ng ngÃ n.
  3. Webhook cá»§a cá»•ng thanh toÃ¡n SePay cÃ³ thá»ƒ gá»i láº¡i nhiá»u láº§n do retry cá»§a network hoáº·c phÃ­a client, dáº«n Ä‘áº¿n nguy cÆ¡ ghi nháº­n trÃ¹ng giao dá»‹ch, cá»™ng XP hoáº·c kÃ­ch hoáº¡t Premium nhiá»u láº§n.
- **Quyáº¿t Ä‘á»‹nh:**
  1. **DbContext Pooling:** Thay tháº¿ `AddDbContext` thÃ nh `AddDbContextPool` trong `Program.cs` Ä‘á»ƒ EF Core tÃ¡i sá»­ dá»¥ng cÃ¡c instance DbContext cÃ³ sáºµn trong Pool.
  2. **Quiz History Pagination:** Triá»ƒn khai phÆ°Æ¡ng thá»©c phÃ¢n trang `GetUserAttemptsWithQuizPaginatedAsync` á»Ÿ táº§ng repository (SQL level) sá»­ dá»¥ng `Skip()` vÃ  `Take()`, vÃ  cáº­p nháº­t controller/service Ä‘á»ƒ nháº­n tham sá»‘ phÃ¢n trang.
  3. **Idempotency Webhook:** ThÃªm trÆ°á»ng `TransactionReference` (Ä‘Ã¡nh chá»‰ má»¥c Unique index) vÃ o thá»±c thá»ƒ `Order`, vÃ  cáº­p nháº­t `PaymentService.cs` kiá»ƒm tra sá»± tá»“n táº¡i cá»§a transaction reference (sá»­ dá»¥ng `payload.Id.ToString()`) trÆ°á»›c khi xá»­ lÃ½ hÃ³a Ä‘Æ¡n.
- **Há»‡ quáº£:**
  - TÄƒng kháº£ nÄƒng xá»­ lÃ½ Ä‘á»“ng thá»i (concurrency) cá»§a backend thÃ´ng qua DbContext Pooling.
  - Tá»‘i Æ°u hÃ³a I/O database vÃ  lÆ°á»£ng RAM tiÃªu thá»¥ khi táº£i lá»‹ch sá»­ lÃ m bÃ i thi cá»§a ngÆ°á»i dÃ¹ng.
  - Báº£o vá»‡ há»‡ thá»‘ng khá»i race condition vÃ  giao dá»‹ch trÃ¹ng láº·p nhá» cÆ¡ cháº¿ kiá»ƒm tra Idempotency cháº·t cháº½.
- **File liÃªn quan:**
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

- **Tráº¡ng thÃ¡i:** `âœ… IMPLEMENTED` â€” 2026-05-25
- **Bá»‘i cáº£nh:**
  1. CÃ¡c file component chÃ­nh trÃªn frontend (nhÆ° `DSAPlayer.vue` vÃ  `PremiumCheckoutView.vue`) gÃ¡nh vÃ¡c quÃ¡ nhiá»u logic tá»« quáº£n lÃ½ giao diá»‡n, bÃ n phÃ­m, countdown timer cho Ä‘áº¿n API polling.
  2. Báº£ng Ä‘iá»u khiá»ƒn hoáº¡t áº£nh (VCR control) bá»‹ viáº¿t cá»©ng, trá»™n láº«n trong `DSAPlayer.vue` gÃ¢y khÃ³ khÄƒn cho viá»‡c tÃ¡i sá»­ dá»¥ng á»Ÿ cÃ¡c mÃ n hÃ¬nh trá»±c quan hÃ³a khÃ¡c.
- **Quyáº¿t Ä‘á»‹nh:**
  1. **Decomposition (PhÃ¢n rÃ£ components)**: 
     - Chia nhá» `DSAPlayer.vue` thÃ nh `DSAHeader.vue`, `DSAInputForm.vue` vÃ  `PseudocodeViewer.vue`.
     - Chia nhá» `PremiumCheckoutView.vue` báº±ng cÃ¡ch tÃ¡ch `PremiumMarketingCard.vue` vÃ  `QrPaymentPanel.vue`.
  2. **Custom Composables**: TrÃ­ch xuáº¥t logic nghiá»‡p vá»¥ phá»©c táº¡p cá»§a thanh toÃ¡n ra khá»i View:
     - `usePaymentTimer.ts` quáº£n lÃ½ countdown timer 15 phÃºt.
     - `usePaymentPolling.ts` quáº£n lÃ½ viá»‡c gá»i API kiá»ƒm tra tráº¡ng thÃ¡i giao dá»‹ch Ä‘á»‹nh ká»³.
  3. **Shared VCR Controls**: Táº¡o `AnimationVcrControls.vue` dÃ¹ng chung, giao tiáº¿p qua Props/Emits, Ä‘á»™c láº­p khá»i store cá»¥ thá»ƒ.
- **Há»‡ quáº£:**
  - Cáº£i thiá»‡n tÃ­nh báº£o trÃ¬, kháº£ nÄƒng tÃ¡i sá»­ dá»¥ng (Reusability) cá»§a cÃ¡c components hiá»ƒn thá»‹.
  - TÃ¡ch biá»‡t rÃµ rÃ ng logic nghiá»‡p vá»¥ khá»i pháº§n giao diá»‡n (Clean Architecture frontend).
  - Táº¥t cáº£ 524 tests cá»§a Vitest tiáº¿p tá»¥c cháº¡y thÃ nh cÃ´ng, khÃ´ng gÃ¢y há»“i quy (regression).
- **File liÃªn quan:**
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

## ADR-23: Frontend Component Decomposition - Phase 1 (Algorithm Sandbox Upgrades)

- **Tráº¡ng thÃ¡i:** `âœ… IMPLEMENTED` â€” 2026-05-25
- **Bá»‘i cáº£nh:**
  1. HÆ°á»›ng tá»›i tiÃªu chuáº©n cÃ¡c component Vue khÃ´ng vÆ°á»£t quÃ¡ 100 dÃ²ng code.
  2. CÃ¡c file `ArrayBarVisualizer.vue` (424 dÃ²ng) vÃ  `CustomInputPanel.vue` (766 dÃ²ng) quÃ¡ cá»“ng ká»nh do chá»©a cáº£ render canvas, mouse interaction, validation logic vÃ  physics engine.
- **Quyáº¿t Ä‘á»‹nh:**
  1. **ArrayBarVisualizer Refactoring**:
     - TÃ¡ch nhá» thÃ nh `SortingHudOverlay.vue`, `SortingAlgorithmControls.vue`, `SortingProgressBar.vue`.
     - TrÃ­ch xuáº¥t logic state vÃ  lerp sang `useSortingAnimation.ts`.
     - TrÃ­ch xuáº¥t logic double-buffering canvas, camera pan/zoom, resize vÃ  render loop sang `useSortingCanvas.ts`.
     - ÄÆ°a `ArrayBarVisualizer.vue` xuá»‘ng cÃ²n 52 dÃ²ng code.
  2. **CustomInputPanel Refactoring**:
     - TÃ¡ch thÃ nh tab inputs `TextDataInput.vue` vÃ  canvas `GraphPlayground.vue`.
     - TrÃ­ch xuáº¥t logic validation Ä‘áº§u vÃ o sang `useInputValidation.ts`.
     - TrÃ­ch xuáº¥t logic kÃ©o tháº£ node, auto layout Force-directed vÃ  canvas drawing loop sang `useGraphPlayground.ts`.
     - ÄÆ°a `CustomInputPanel.vue` xuá»‘ng cÃ²n 85 dÃ²ng code.
- **Há»‡ quáº£:**
  - Code sáº¡ch hÆ¡n, dá»… báº£o trÃ¬, dá»… viáº¿t unit test cho tá»«ng pháº§n logic.
  - CÃ¡c component vue Ä‘á»u náº±m dÆ°á»›i 100 dÃ²ng code.
  - 524 unit tests cháº¡y thÃ nh cÃ´ng 100%.
- **File liÃªn quan:**
  - Components: [ArrayBarVisualizer.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/ArrayBarVisualizer.vue), [CustomInputPanel.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/CustomInputPanel.vue)
  - Composables: [useSortingCanvas.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/composables/useSortingCanvas.ts), [useSortingAnimation.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/composables/useSortingAnimation.ts), [useInputValidation.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/composables/useInputValidation.ts), [useGraphPlayground.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/composables/useGraphPlayground.ts)

---

## ADR-24: Frontend Component Decomposition - Phase 2 (CanvasLayer Refactoring)

- **Tráº¡ng thÃ¡i:** `âœ… IMPLEMENTED` â€” 2026-05-25
- **Bá»‘i cáº£nh:**
  1. Tiáº¿p tá»¥c bÄƒm nhá» cÃ¡c file component Vue lá»›n hÆ¡n 100 dÃ²ng code.
  2. Component `CanvasLayer.vue` (284 dÃ²ng) chá»©a logic váº½ canvas, transition lerp hoáº¡t áº£nh, resize vÃ  loop hoáº¡t áº£nh.
- **Quyáº¿t Ä‘á»‹nh:**
  1. **CanvasLayer Refactoring**:
     - TÃ¡ch nhá» thÃ nh `AnimationHud.vue` vÃ  `AnimationProgressBar.vue`.
     - TrÃ­ch xuáº¥t logic transition, resize vÃ  loop hoáº¡t áº£nh sang composable `useAnimationCanvas.ts`.
     - ÄÆ°a `CanvasLayer.vue` xuá»‘ng cÃ²n 42 dÃ²ng code.
- **Há»‡ quáº£:**
  - Component dá»… Ä‘á»c, dá»… kiá»ƒm thá»­ vÃ  Ä‘á»™c láº­p hÆ¡n.
  - PhÃ¹ há»£p tiÃªu chuáº©n component < 100 dÃ²ng code.
  - 524 tests cá»§a Vitest cháº¡y thÃ nh cÃ´ng 100%.
- **File liÃªn quan:**
  - Components: [CanvasLayer.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/animation-engine/components/CanvasLayer.vue), [AnimationHud.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/animation-engine/components/AnimationHud.vue), [AnimationProgressBar.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/animation-engine/components/AnimationProgressBar.vue)
  - Composables: [useAnimationCanvas.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/animation-engine/composables/useAnimationCanvas.ts)

---

## ADR-25: Frontend Component Decomposition - Phase 3 (PseudocodePanel Refactoring)

- **Tráº¡ng thÃ¡i:** `âœ… IMPLEMENTED` â€” 2026-05-25
- **Bá»‘i cáº£nh:**
  1. Tiáº¿p tá»¥c bÄƒm nhá» cÃ¡c file component Vue lá»›n hÆ¡n 100 dÃ²ng code.
  2. Component `PseudocodePanel.vue` (184 dÃ²ng) chá»©a logic variables HUD, auto-scroll vÃ  syntax highlighting báº±ng regex.
- **Quyáº¿t Ä‘á»‹nh:**
  1. **PseudocodePanel Refactoring**:
     - TÃ¡ch nhá» variables HUD thÃ nh `VariablesHud.vue`.
     - TrÃ­ch xuáº¥t logic syntax highlighting thÃ nh helper `highlightHelper.ts`.
     - TrÃ­ch xuáº¥t logic auto-scroll sang composable `usePseudocodeScroller.ts`.
     - ÄÆ°a `PseudocodePanel.vue` xuá»‘ng cÃ²n 83 dÃ²ng code.
- **Há»‡ quáº£:**
  - Component má»ng hÆ¡n, dá»… kiá»ƒm thá»­ vÃ  Ä‘á»™c láº­p hÆ¡n.
  - PhÃ¹ há»£p tiÃªu chuáº©n component < 100 dÃ²ng code.
  - 524 tests cá»§a Vitest cháº¡y thÃ nh cÃ´ng 100%.
- **File liÃªn quan:**
  - Components: [PseudocodePanel.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/code-editor/components/PseudocodePanel.vue), [VariablesHud.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/code-editor/components/VariablesHud.vue)
  - Helper: [highlightHelper.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/code-editor/helpers/highlightHelper.ts)
  - Composables: [usePseudocodeScroller.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/code-editor/composables/usePseudocodeScroller.ts)

---

## ADR-26: Centralized Design Token System — Multi-Theme Architecture

- **Tr?ng thái:** ? IMPLEMENTED — rontend/src/styles/theme.css
- **Ngày:** 2026-05-27
- **Ng? c?nh:** Toàn b? màu s?c, font và spacing trý?c ðây b? hardcode r?i rác trong style.css (:root) và tr?c ti?p trong App.vue (Tailwind class slate-*). Ði?u này làm cho vi?c phát tri?n tính nãng multi-theme (light, cyberpunk) v? sau tr? nên r?t khó khãn.
- **Quy?t ð?nh:** Tách toàn b? Design Tokens ra file riêng rontend/src/styles/theme.css làm Single Source of Truth. File t? ch?c theo [data-theme] attribute trên <html>, cho phép switch theme b?ng m?t d?ng JS duy nh?t. Tailwind ðý?c c?u h?nh ð? tham chi?u CSS variables thay v? hardcode màu.
- **Font:** Thêm Space Mono (heading terminal display) + Inter (UI text) t? Google Fonts. JetBrains Mono gi? nguyên cho code blocks.
- **Phong cách:** Chuy?n t? Cyberpunk (cyan neon) sang Terminal/Code Aesthetic (cam terminal #c96a3a) cho accent chính. Cyberpunk palette ðý?c gi? l?i dý?i [data-theme="cyberpunk"].
- **H? qu?:**
  - Toàn b? màu s?c t?p trung t?i 1 file duy nh?t — thêm/s?a theme không c?n s?a t?ng component.
  - App.vue redesign hoàn toàn: logo ~/AlgoLens, traffic light dots, nav tabs dùng CSS vars.
  - style.css ch? c?n reset/utility classes, không c?n màu hardcoded.
  - Scaffold 3 themes: 	erminal-dark (default), light (placeholder), cyberpunk (placeholder).
- **File liên quan:**
  - [theme.css](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/styles/theme.css)
  - [style.css](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/style.css)
  - [App.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/App.vue)
  - [tailwind.config.js](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/tailwind.config.js)
  - [index.html](file:///c:/Users/maiti/OneDrive/Desktop\LearningEnglishApp/VisualizationDSA/frontend/index.html)


## ADR-27: Left Sidebar Layout Migration â€” Widescreen & Navigation Clutter Optimization

- **Tráº¡ng thÃ¡i:** âœ… IMPLEMENTED â€” [App.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/App.vue)
- **NgÃ y:** 2026-05-30
- **Ngá»¯ cáº£nh:** á»¨ng dá»¥ng tÃ­ch lÅ©y nhiá»u tÃ­nh nÄƒng vÃ  cÃ³ tá»›i 23 tab danh má»¥c trÃªn thanh Ä‘iá»u hÆ°á»›ng hÃ ng ngang (header-nav). TrÃªn mÃ n hÃ¬nh PC rá»™ng, viá»‡c xáº¿p ngang gÃ¢y trÃ n ná»™i dung vÃ  khÃ³ theo dÃµi. Äá»“ng thá»i, tab Sorting sá»­ dá»¥ng giá»›i háº¡n `max-w-3xl` táº¡o khoáº£ng trá»‘ng lá»›n lÃ£ng phÃ­ á»Ÿ hai bÃªn.
- **Quyáº¿t Ä‘á»‹nh:** 
  - TÃ¡i cáº¥u trÃºc láº¡i tá»‡p `App.vue` Ä‘á»ƒ chuyá»ƒn toÃ n bá»™ 23 tab tá»« thanh Ä‘iá»u hÆ°á»›ng top header sang má»™t thanh Ä‘iá»u hÆ°á»›ng dá»c náº±m á»Ÿ bÃªn trÃ¡i (sidebar) rá»™ng 230px trÃªn desktop.
  - TÃ­ch há»£p cÃ¡c media queries trong CSS cá»§a `App.vue` Ä‘á»ƒ tá»± Ä‘á»™ng biáº¿n Ä‘á»•i sidebar thÃ nh thanh Ä‘iá»u hÆ°á»›ng cuá»™n ngang á»Ÿ phÃ­a trÃªn trÃªn cÃ¡c thiáº¿t bá»‹ di Ä‘á»™ng/mÃ¡y tÃ­nh báº£ng (dÆ°á»›i 1024px), Ä‘áº£m báº£o giá»¯ nguyÃªn kháº£ nÄƒng tÆ°Æ¡ng tÃ¡c di Ä‘á»™ng.
  - Sá»­a Ä‘á»•i layout trong `SortingView.vue` sang há»‡ thá»‘ng 2 cá»™t (`lg:flex-row`) rá»™ng tá»‘i Ä‘a `1600px` vá»›i tá»‰ lá»‡ 65% Canvas bÃªn trÃ¡i vÃ  35% báº£ng Ä‘iá»u khiá»ƒn VCR bÃªn pháº£i.
- **Há»‡ quáº£:**
  * Giáº£m táº£i nháº­n thá»©c vÃ  giáº£i quyáº¿t triá»‡t Ä‘á»ƒ váº¥n Ä‘á» trÃ n danh má»¥c Ä‘iá»u hÆ°á»›ng.
  * Tá»‘i Æ°u hÃ³a khÃ´ng gian hiá»ƒn thá»‹ cá»§a mÃ n hÃ¬nh rá»™ng, Ä‘á»“ng bá»™ hÃ³a phong cÃ¡ch thiáº¿t káº¿ hai cá»™t chuyÃªn nghiá»‡p cá»§a toÃ n bá»™ há»‡ thá»‘ng.
  * ToÃ n bá»™ 1514 ca kiá»ƒm thá»­ Vitest cá»§a frontend tiáº¿p tá»¥c hoáº¡t Ä‘á»™ng á»•n Ä‘á»‹nh.
- **File liÃªn quan:**
  * [App.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/App.vue)
  * [SortingView.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/views/SortingView.vue)
  * [decisions.md](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/plan/tracking/decisions.md)


## ADR-28: Advanced Quick Sort & Merge Sort UX Visualizer Refactoring

- **Tráº¡ng thÃ¡i:** âœ… IMPLEMENTED â€” [QuickSortVisualizer.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/QuickSortVisualizer.vue), [MergeSortVisualizer.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/MergeSortVisualizer.vue)
- **NgÃ y:** 2026-05-31
- **Ngá»¯ cáº£nh:** 
  - Giao diá»‡n Quick Sort trÆ°á»›c Ä‘Ã¢y cÃ³ nhiá»u khoáº£ng trá»‘ng lá»›n vÃ  chá»©a quÃ¡ nhiá»u code gá»™p chung. NgoÃ i ra, viá»‡c highlight con trá» pivot, i, j chÆ°a thá»±c sá»± ná»•i báº­t Ä‘á»ƒ ngÆ°á»i dÃ¹ng dá»… theo dÃµi.
  - Giao diá»‡n Merge Sort cÅ© chá»‰ hiá»ƒn thá»‹ máº£ng pháº³ng vÃ  stack pháº³ng má» nháº¡t, lÃ m máº¥t Ä‘i Ä‘áº·c trÆ°ng "chia Ä‘á»ƒ trá»‹" (cáº¥u trÃºc cÃ¢y Ä‘á»‡ quy nhá»‹ phÃ¢n) vÃ  khÃ´ng mÃ´ phá»ng rÃµ rÃ ng sá»± so sÃ¡nh giá»¯a hai ná»­a L[i] vs R[j].
- **Quyáº¿t Ä‘á»‹nh:**
  - TÃ¡ch nhá» component QuickSortVisualizer.vue thÃ nh LomutoInspector.vue vÃ  PartitionStack.vue.
  - Thiáº¿t káº¿ láº¡i QuickSortVisualizer.vue Ä‘á»ƒ tá»± Ä‘á»™ng kÃ©o dÃ£n láº¥p Ä‘áº§y chiá»u dá»c, lÃ m má» cÃ¡c pháº§n tá»­ ngoÃ i phÃ¢n Ä‘oáº¡n hiá»‡n táº¡i (opacity 0.2), hiá»ƒn thá»‹ icon ngÃ´i sao cho Pivot, vÃ  tooltip chá»‰ sá»‘ phÃ¢n Ä‘oáº¡n khi hover.
  - TÃ¡i cáº¥u trÃºc MergeSortVisualizer.vue thÃ nh mÃ´ hÃ¬nh cÃ¢y nhá»‹ phÃ¢n Ä‘á»‡ quy (Recursion Tree). CÃ¡c node máº£ng con Ä‘Æ°á»£c Ä‘á»‹nh vá»‹ absolute theo tá»· lá»‡ pháº§n trÄƒm (left vÃ  width) tÆ°Æ¡ng á»©ng vá»›i phÃ¢n Ä‘oáº¡n cha, Ä‘áº£m báº£o phÃ¢n nhÃ¡nh con cÄƒn chá»‰nh hoÃ n háº£o ngay bÃªn dÆ°á»›i máº£ng cha.
  - ThÃªm nhÃ£n má»©c Ä‘á»™ Ä‘á»‡ quy (Táº§ng 0, Táº§ng 1, v.v.) bÃªn cáº¡nh trÃ¡i, banner ká»ƒ chuyá»‡n (Split Phase / Merge Phase) á»Ÿ Ä‘áº§u trang.
  - Táº¡o component MergeInspector.vue Ä‘á»ƒ hiá»ƒn thá»‹ so sÃ¡nh hai máº£ng con L[i] vs R[j] vÃ  tiáº¿n trÃ¬nh ghi Ä‘Ã¨ máº£ng chÃ­nh táº¡i con trá» k.
- **Há»‡ quáº£:**
  * Giáº£i quyáº¿t triá»‡t Ä‘á»ƒ khoáº£ng trá»‘ng thá»«a thÃ£i trÃªn mÃ n hÃ¬nh rá»™ng cho cáº£ hai thuáº­t toÃ¡n sáº¯p xáº¿p.
  * TÄƒng tÃ­nh trá»±c quan há»c thuáº­t: NgÆ°á»i há»c nhÃ¬n tháº¥y rÃµ cÃ¢y chia Ä‘á»‡ quy, tháº¥y Ä‘Æ°á»£c cÃ¡c pháº§n tá»­ di chuyá»ƒn Ä‘i Ä‘Ã¢u, vÃ  quÃ¡ trÃ¬nh so sÃ¡nh/trá»™n diá»…n ra nhÆ° tháº¿ nÃ o.
  * Giá»¯ cáº¥u trÃºc code sáº¡ch sáº½, tuÃ¢n thá»§ cháº·t cháº½ tiÃªu chuáº©n modular component cá»§a Vue 3 vÃ  TypeScript.
- **File liÃªn quan:**
  * [QuickSortVisualizer.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/QuickSortVisualizer.vue)
  * [LomutoInspector.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/LomutoInspector.vue)
  * [PartitionStack.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/PartitionStack.vue)
  * [MergeSortVisualizer.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/MergeSortVisualizer.vue)
  * [MergeInspector.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/MergeInspector.vue)
  * [decisions.md](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/plan/tracking/decisions.md)


## ADR-29: Heap Sort Visualizer UX Redesign and Advanced Controls

- **Tráº¡ng thÃ¡i:** âœ… IMPLEMENTED â€” [HeapSortVisualizer.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/HeapSortVisualizer.vue)
- **NgÃ y:** 2026-05-31
- **Ngá»¯ cáº£nh:** 
  - Giao diá»‡n Heap Sort tuy Ä‘Ã£ cÃ³ cáº¥u trÃºc cÃ¢y nhá»‹ phÃ¢n (Binary Tree) vÃ  máº£ng váº­t lÃ½ bÃªn dÆ°á»›i nhÆ°ng váº«n cÃ²n thiáº¿u sÃ³t vá» máº·t sÆ° pháº¡m trá»±c quan: khÃ´ng cÃ³ highlight node vi pháº¡m Max-Heap, khÃ´ng thá»ƒ hiá»‡n rÃµ 2 pha Build-Heap vs Sort, máº£ng váº­t lÃ½ bÃªn dÆ°á»›i khÃ´ng phÃ¢n cÃ¡ch rÃµ rÃ ng vÃ¹ng Heap vÃ  Sorted, vÃ  thiáº¿u chÃº thÃ­ch mÃ u sáº¯c, index node hoáº·c cÃ´ng cá»¥ hover debug.
- **Quyáº¿t Ä‘á»‹nh:**
  - NÃ¢ng cáº¥p [HeapSortVisualizer.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/HeapSortVisualizer.vue):
    1. **Highlight node vi pháº¡m**: ThÃªm logic `isViolating(idx)` kiá»ƒm tra `parent.value < child.value` vÃ  tÃ´ Ä‘á» rá»±c rá»¡ (chá»›p nháº¥p nhÃ¡y Rose Red + pulse) cho cÃ¡c node con vi pháº¡m Max-Heap kÃ¨m theo stroke line mÃ u Ä‘á» ná»‘i cha-con.
    2. **Äá»‹nh hÃ¬nh CÃ¢y Nhá»‹ phÃ¢n HoÃ n chá»‰nh**: Tá»± Ä‘á»™ng tÃ­nh toÃ¡n `placeholderIndices` Ä‘á»ƒ váº½ thÃªm cÃ¡c node giáº£ rá»—ng (`âˆ…`) vÃ  Ä‘Æ°á»ng line nÃ©t Ä‘á»©t á»Ÿ cÃ¡c vá»‹ trÃ­ khuyáº¿t bÃªn pháº£i cá»§a táº§ng cuá»‘i cÃ¹ng, giÃºp cÃ¢y luÃ´n cÃ¢n Ä‘á»‘i hoÃ n háº£o.
    3. **PhÃ¢n tÃ¡ch RÃµ rÃ ng Pha & Banner**: ThÃªm banner tráº¡ng thÃ¡i ká»ƒ chuyá»‡n mÃ´ táº£ hÃ nh Ä‘á»™ng ngáº¯n gá»n kÃ¨m Phase Badge (`BUILD HEAP` vs `SORT`).
    4. **Divider Ranh giá»›i máº£ng váº­t lÃ½**: ThÃªm margin lá» trÃ¡i (`ml-6`) vÃ  Ä‘Æ°á»ng gáº¡ch Ä‘á»©ng nÃ©t Ä‘á»©t mÃ u vÃ ng há»• phÃ¡ch táº¡i Ä‘iá»ƒm báº¯t Ä‘áº§u cá»§a vÃ¹ng Sorted (`idx === heapSize`), giÃºp ngÆ°á»i dÃ¹ng tháº¥y trá»±c quan quÃ¡ trÃ¬nh thu nhá» cá»§a Heap vÃ  phÃ¬nh to cá»§a Sorted.
    5. **Index Node & Hover Tooltip**: Hiá»ƒn thá»‹ nhÃ£n chá»‰ sá»‘ `[i=...]` nhá» dÆ°á»›i giÃ¡ trá»‹ node vÃ  tÃ­ch há»£p hover tooltip chá»©a thÃ´ng tin chi tiáº¿t cá»§a node cha-con.
    6. **ChÃº thÃ­ch mÃ u sáº¯c (Legend)**: Bá»• sung legend má» kÃ­nh gÃ³c trÃ¡i Tree View chá»‰ dáº«n 4 mÃ u tráº¡ng thÃ¡i (xÃ©t, heap, vi pháº¡m, Ä‘Ã£ chá»‘t).
- **Há»‡ quáº£:**
  * GiÃºp há»c viÃªn láº­p tá»©c nháº­n biáº¿t vÃ  "feel" Ä‘Æ°á»£c tiáº¿n trÃ¬nh heapify (sift down) vÃ  lÃ½ do táº¡i sao cÃ¡c node pháº£i swap.
  * Pháº£n Ã¡nh rÃµ nÃ©t mental model cá»§a Heap Sort (thu háº¹p heap, cÃ¢y complete tree cÃ¢n Ä‘á»‘i).
- **File liÃªn quan:**
  * [HeapSortVisualizer.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/HeapSortVisualizer.vue)
  * [decisions.md](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/plan/tracking/decisions.md)


## ADR-30: Radix Sort Visualizer UX Redesign and Flowing Connection Particles

- **Tráº¡ng thÃ¡i:** âœ… IMPLEMENTED â€” [RadixSortVisualizer.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/RadixSortVisualizer.vue)
- **NgÃ y:** 2026-05-31
- **Ngá»¯ cáº£nh:** 
  - Giao diá»‡n Radix Sort tuy Ä‘Ã£ cÃ³ cáº¥u trÃºc bucket 0-9 nhÆ°ng thiáº¿u tÃ­nh sÆ° pháº¡m Ä‘á»™ng há»c: khÃ´ng mÃ´ táº£ chuyá»ƒn Ä‘á»™ng phÃ¢n phá»‘i (Distribute) hay thu tháº­p (Collect) cá»§a cÃ¡c pháº§n tá»­, khÃ´ng lÃ m ná»•i báº­t chá»¯ sá»‘ Ä‘ang xÃ©t, vÃ  khÃ´ng lÃ m rÃµ tÃ­nh cháº¥t FIFO (First-In, First-Out) cá»§a sá»± á»•n Ä‘á»‹nh giáº£i thuáº­t.
- **Quyáº¿t Ä‘á»‹nh:**
  - NÃ¢ng cáº¥p [RadixSortVisualizer.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/RadixSortVisualizer.vue):
    1. **Hoáº¡t áº£nh Ä‘Æ°á»ng ná»‘i SVG Connector Ä‘á»™ng**: Thiáº¿t láº­p má»™t lá»›p phá»§ SVG tuyá»‡t Ä‘á»‘i náº±m giá»¯a máº£ng trÃªn vÃ  cÃ¡c bucket dÆ°á»›i. Váº½ Ä‘Æ°á»ng cong Bezier Cubic káº¿t ná»‘i pháº§n tá»­ máº£ng Ä‘ang xÃ©t tá»›i Ä‘Ãºng cá»™t bucket Ä‘Ã­ch báº±ng toáº¡ Ä‘á»™ pháº§n trÄƒm `viewBox="0 0 100 100"`.
    2. **Háº¡t sÃ¡ng chuyá»ƒn Ä‘á»™ng**: Má»™t cháº¥m sÃ¡ng neon sáº½ di chuyá»ƒn dá»c theo path (tá»« trÃªn xuá»‘ng dÆ°á»›i á»Ÿ pha Distribute vÃ  tá»« dÆ°á»›i lÃªn á»Ÿ pha Collect) biá»ƒu diá»…n trá»±c quan luá»“ng pháº§n tá»­.
    3. **TÃ­nh á»•n Ä‘á»‹nh FIFO (Stability)**: Trong pha Collect, pháº§n tá»­ dÆ°á»›i Ä‘Ã¡y cá»§a active bucket (index 0 - pháº§n tá»­ rÆ¡i vÃ o trÆ°á»›c) Ä‘Æ°á»£c tÃ´ viá»n nháº¥p nhÃ¡y xanh lÃ¡ Emerald Ä‘á»ƒ nháº¥n máº¡nh nguyÃªn lÃ½ FIFO.
    4. **Digit Zoom Focus**: Khi so sÃ¡nh, chá»¯ sá»‘ hÃ ng Ä‘ang quÃ©t (Ä‘Æ¡n vá»‹, chá»¥c, hoáº·c trÄƒm) phÃ³ng to 120% vÃ  phÃ¡t sÃ¡ng vÃ ng neon, cÃ¡c chá»¯ sá»‘ khÃ¡c Ä‘Æ°á»£c lÃ m má» 75%.
    5. **Digit Place Timeline & Legend**: Bá»• sung thanh tiáº¿n trÃ¬nh hÃ ng chá»¯ sá»‘ `[1s] âž” [10s] âž” [100s]`, báº£ng color legend vÃ  giáº£i thÃ­ch ngáº¯n gá»n nguyÃªn lÃ½ non-comparison.
- **Há»‡ quáº£:**
  * Mang láº¡i tráº£i nghiá»‡m visual "aha" Ä‘á»‰nh cao khi há»c sinh nhÃ¬n tháº¥y luá»“ng pháº§n tá»­ di chuyá»ƒn rÆ¡i vÃ o vÃ  thu há»“i khá»i cÃ¡c bucket.
  * Thá»ƒ hiá»‡n rÃµ nÃ©t cÃ¡c Ä‘áº·c trÆ°ng há»c thuáº­t quan trá»ng nháº¥t cá»§a Radix Sort (Ä‘á»™ á»•n Ä‘á»‹nh FIFO, phÃ¢n nhÃ³m phi so sÃ¡nh).
- **File liÃªn quan:**
  * [RadixSortVisualizer.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/RadixSortVisualizer.vue)
  * [decisions.md](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/plan/tracking/decisions.md)


## ADR-31: Radix Sort Visual Refinements and Pixel-Perfect Measurement Alignment

- **Tráº¡ng thÃ¡i:** âœ… IMPLEMENTED â€” [RadixSortVisualizer.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/RadixSortVisualizer.vue)
- **NgÃ y:** 2026-05-31
- **Ngá»¯ cáº£nh:** 
  - Sau khi chuyá»ƒn Ä‘á»•i SVG sang scale `0..1000`, Ä‘Æ°á»ng váº½ mÅ©i tÃªn káº¿t ná»‘i máº£ng Ä‘á»™ng vÃ  cÃ¡c buckets váº«n bá»‹ lá»‡ch nháº¹ do áº£nh hÆ°á»Ÿng bá»Ÿi cÃ¡c thuá»™c tÃ­nh CSS flexbox, grid gap, borders vÃ  paddings vá»‘n khÃ¡c nhau giá»¯a dÃ²ng máº£ng vÃ  hÃ ng buckets.
  - NgoÃ i ra, Ä‘Æ°á»ng ná»‘i chá»‰ cÃ³ cháº¥m sÃ¡ng trÃ´i ná»•i mÃ  thiáº¿u Ä‘i Ä‘áº§u mÅ©i tÃªn (arrowhead) Ä‘á»ƒ chá»‰ hÆ°á»›ng trá»±c quan rÃµ rÃ ng dÃ²ng dá»¯ liá»‡u.
  - Äá»“ng thá»i, trong pha thu hoáº¡ch (Collect), viá»‡c Vue's `transition-group` dá»‹ch chuyá»ƒn cÃ¡c pháº§n tá»­ táº¡m thá»i cÃ²n láº¡i trong bucket ("still in buckets" elements) gÃ¢y giáº­t cá»¥c vÃ  gÃ¢y hiá»ƒu láº§m ráº±ng Ä‘Ã³ lÃ  hoáº¡t áº£nh swap pháº§n tá»­.
- **Quyáº¿t Ä‘á»‹nh:**
  - NÃ¢ng cáº¥p [RadixSortVisualizer.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/RadixSortVisualizer.vue):
    1. **TÃ­nh toÃ¡n Tá»a Ä‘á»™ Pixel Báº±ng DOM Measurement**: Sá»­ dá»¥ng hÃ m `getBoundingClientRect()` trÃªn cÃ¡c pháº§n tá»­ active (`r-cell--dist` hoáº·c `r-cell--coll` vÃ  `r-bucket--active`) Ä‘o Ä‘áº¡c tá»a Ä‘á»™ pixel thá»±c táº¿ relative vá»›i connector container. Ãnh xáº¡ cÃ¡c giÃ¡ trá»‹ pixel nÃ y vá» scale `0..1000` cá»§a SVG viewBox. Äiá»u nÃ y loáº¡i bá» hoÃ n toÃ n sai sá»‘ tá»« CSS spacing, gaps hay borders, mang láº¡i Ä‘á»™ chÃ­nh xÃ¡c 100% tuyá»‡t Ä‘á»‘i.
    2. **Äáº§u MÅ©i TÃªn Chá»‰ HÆ°á»›ng Äá»™ng (Direction-Aware Arrowheads)**: Khai bÃ¡o `<marker id="arrowhead-dist">` vÃ  `<marker id="arrowhead-coll">` trong Ä‘á»‹nh nghÄ©a SVG. Thiáº¿t káº¿ Bezier Path Ä‘áº£o hÆ°á»›ng linh Ä‘á»™ng theo pha: pha Distribute cháº¡y tá»« máº£ng xuá»‘ng bucket (arrowhead chá»‰ xuá»‘ng), pha Collect cháº¡y tá»« bucket lÃªn máº£ng (arrowhead chá»‰ lÃªn) káº¿t há»£p dá»‹ch chuyá»ƒn háº¡t sÃ¡ng trÃ´i ná»•i tÆ°Æ¡ng á»©ng tá»« dÆ°á»›i lÃªn trÃªn.
    3. **KÃ©o dÃ i khoáº£ng cÃ¡ch visual**: TÄƒng chiá»u cao cá»§a `.r-connector` lÃªn `130px` Ä‘á»ƒ Ä‘Æ°á»ng ná»‘i cÃ³ Ä‘á»™ uá»‘n lÆ°á»£n S-shape rÃµ rá»‡t vÃ  Ä‘áº§u mÅ©i tÃªn hiá»ƒn thá»‹ cá»±c ká»³ sang trá»ng.
    4. **Smooth Placeholder Masking (Loáº¡i bá» Giáº­t Hoáº¡t áº¢nh)**: Trong pha Collect, thay vÃ¬ hiá»ƒn thá»‹ cÃ¡c pháº§n tá»­ chÆ°a thu hoáº¡ch á»Ÿ cuá»‘i máº£ng, chÃºng tÃ´i thay tháº¿ chÃºng báº±ng cÃ¡c Ã´ trá»‘ng nÃ©t Ä‘á»©t `r-cell--placeholder` an toÃ n (sá»­ dá»¥ng cÃ¹ng stable key). Káº¿t quáº£ lÃ  cÃ¡c pháº§n tá»­ máº£ng náº±m im táº¡i vá»‹ trÃ­ cá»™t grid cá»§a chÃºng vÃ  chá»‰ dáº§n dáº§n hiá»‡n ra (reveal) tá»« trÃ¡i sang pháº£i khi Ä‘Æ°á»£c rÃºt tá»« bucket lÃªn, loáº¡i bá» hoÃ n toÃ n tÃ¬nh tráº¡ng trÆ°á»£t ngang giáº­t cá»¥c.
- **Há»‡ quáº£:**
  * MÅ©i tÃªn chá»‰ hÆ°á»›ng hoÃ n toÃ n chÃ­nh xÃ¡c tá»›i tá»«ng pixel, khÃ´ng bá»‹ lá»‡ch á»Ÿ báº¥t ká»³ Ä‘á»™ phÃ¢n giáº£i hay kÃ­ch thÆ°á»›c máº£ng nÃ o.
  * Hoáº¡t áº£nh trÆ¡n tru tuyá»‡t Ä‘á»‘i 60 FPS, biá»ƒu diá»…n rÃµ nÃ©t báº£n cháº¥t cá»§a giáº£i thuáº­t mÃ  khÃ´ng gÃ¢y nháº§m láº«n chuyá»ƒn Ä‘á»™ng.
- **File liÃªn quan:**
  * [RadixSortVisualizer.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/RadixSortVisualizer.vue)
  * [decisions.md](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/plan/tracking/decisions.md)


## ADR-32: Modular Sub-Component Restructuring and Composable Extraction

- **Tráº¡ng thÃ¡i:** âœ… IMPLEMENTED â€” [RadixSortVisualizer.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/RadixSortVisualizer.vue) & [HeapSortVisualizer.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/HeapSortVisualizer.vue)
- **NgÃ y:** 2026-05-31
- **Ngá»¯ cáº£nh:** 
  - Nháº±m tuÃ¢n thá»§ ká»· luáº­t láº­p trÃ¬nh Clean Code nghiÃªm ngáº·t vÃ  quy trÃ¬nh Multi-Agent Collaboration Playbook (`AGENTS.md`), cÃ¡c file component chÃ­nh ban Ä‘áº§u nhÆ° `RadixSortVisualizer.vue` (gáº§n 600 dÃ²ng) vÃ  `HeapSortVisualizer.vue` (gáº§n 400 dÃ²ng) Ä‘ang chá»©a quÃ¡ nhiá»u code, Ã´m Ä‘á»“m cáº£ giao diá»‡n (UI Rendering) láº«n logic xá»­ lÃ½ hÃ¬nh há»c/tráº¡ng thÃ¡i Ä‘á»‡ quy (Algorithm Engine), gÃ¢y khÃ³ khÄƒn cho viá»‡c báº£o trÃ¬.
- **Quyáº¿t Ä‘á»‹nh:**
  1. **TÃ¡ch Biá»‡t Logic Xá»­ LÃ½ Tráº¡ng ThÃ¡i (Composables)**: Chiáº¿t xuáº¥t 100% logic tÃ­nh toÃ¡n hÃ¬nh há»c, classes, styles, vÃ  text descriptions ra thÃ nh cÃ¡c composables chuyÃªn biá»‡t:
     - `composables/useRadixSortVisualizer.ts`
     - `composables/useHeapSortVisualizer.ts`
     CÃ¡c composables nÃ y nháº­n hÃ m truy cáº­p frame `() => SortFrame | null` vÃ  tráº£ vá» toÃ n bá»™ dá»¯ liá»‡u pháº£n á»©ng (reactive state) an toÃ n cho giao diá»‡n.
  2. **ThÆ° Má»¥c ThÃ nh Pháº§n RiÃªng Cho Tá»«ng Giáº£i Thuáº­t (Modular Directories)**: Khá»Ÿi táº¡o cÃ¡c thÆ° má»¥c component con:
     - `components/radix-sort/`
     - `components/heap-sort/`
  3. **PhÃ¢n RÃ£ ThÃ nh Component Con (Sub-Components)**: Chia nhá» file component gá»‘c thÃ nh cÃ¡c thÃ nh pháº§n con Ä‘á»™c láº­p, cÃ³ lá» vÃ  kÃ­ch thÆ°á»›c cá»¥ thá»ƒ:
     - Radix: `RadixBanner.vue`, `RadixArray.vue`, `RadixConnector.vue`, `RadixBuckets.vue`, `RadixInspector.vue`.
     - Heap: `HeapBanner.vue`, `HeapTree.vue`, `HeapArray.vue`.
  4. **Component Shell Tá»‘i Giáº£n (Container Shell Orchestrator)**: Thay Ä‘á»•i `RadixSortVisualizer.vue` vÃ  `HeapSortVisualizer.vue` thÃ nh cÃ¡c Container Shell siÃªu má»ng (dÆ°á»›i 40 dÃ²ng) chá»‰ chá»‹u trÃ¡ch nhiá»‡m náº¡p dá»¯ liá»‡u vÃ  Ä‘iá»u phá»‘i (orchestrate) cÃ¡c component con bÃªn trong, giÃºp giáº£m táº£i nháº­n thá»©c vÃ  tÄƒng tá»‘c Ä‘á»™ HMR cá»§a Vue.
- **Há»‡ quáº£:**
  * Codebase gá»n gÃ ng, tuÃ¢n thá»§ hoÃ n háº£o nguyÃªn lÃ½ Single Responsibility Principle (SRP) vÃ  mÃ´ hÃ¬nh FSD (Feature-Sliced Design).
  * Unit tests vÃ  Production builds cháº¡y á»•n Ä‘á»‹nh, trÆ¡n tru, loáº¡i bá» 100% nguy cÆ¡ regression.
- **File liÃªn quan:**
  * [RadixSortVisualizer.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/RadixSortVisualizer.vue)
  * [HeapSortVisualizer.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/HeapSortVisualizer.vue)
  * [useRadixSortVisualizer.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/composables/useRadixSortVisualizer.ts)
  * [useHeapSortVisualizer.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/composables/useHeapSortVisualizer.ts)


## ADR-33: Restructured DSA Modules Catalog with High-Value Premium Algorithms

- **Tráº¡ng thÃ¡i:** âœ… IMPLEMENTED â€” [algorithmCatalog.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/dsa-modules/services/algorithmCatalog.ts)
- **NgÃ y:** 2026-05-31
- **Ngá»¯ cáº£nh:** 
  - TrÃ¡nh sá»± trÃ¹ng láº·p thá»«a thÃ£i giá»¯a phÃ¢n há»‡ "Sorting Sandbox" vÃ  "DSA Modules" sandbox.
  - Äá»‹nh hÃ¬nh há»‡ thá»‘ng há»c thuáº­t trá»Ÿ thÃ nh má»™t cÃ´ng cá»¥ dáº¡y há»c chuyÃªn nghiá»‡p (product-level visual teaching tool) báº±ng cÃ¡ch táº­p trung danh má»¥c giáº£i thuáº­t dsa-modules vÃ o cÃ¡c giáº£i thuáº­t cÃ³ mental model Ä‘á»™c láº­p, animation mang tÃ­nh ká»ƒ chuyá»‡n cao, nÃ³i KHÃ”NG vá»›i cÃ¡c thuáº­t toÃ¡n swap-based tÆ°Æ¡ng tá»± nhau.
- **Quyáº¿t Ä‘á»‹nh:**
  1. **CÃ´ láº­p giáº£i thuáº­t Sáº¯p Xáº¿p (Sorting Isolation)**: Di chuyá»ƒn vÃ  chá»‰ giá»¯ toÃ n bá»™ cÃ¡c thuáº­t toÃ¡n sáº¯p xáº¿p (Bubble, Selection, Insertion, Quick, Merge, Heap, Radix) Ä‘á»™c quyá»n á»Ÿ tab **Sorting**.
  2. **Loáº¡i bá» khá»i DSA Modules**: XÃ³a 5 giáº£i thuáº­t sorting cÅ© khá»i danh má»¥c DSA Modules trong cáº£ frontend vÃ  backend.
  3. **Bá»• sung 5 giáº£i thuáº­t Premium nÃ¢ng cáº¥p**:
     - **BFS (Breadth-First Search)** - Duyá»‡t cÃ¢y/Ä‘á»“ thá»‹ theo chiá»u rá»™ng (Queue-based).
     - **DFS (Depth-First Search)** - Duyá»‡t cÃ¢y/Ä‘á»“ thá»‹ theo chiá»u sÃ¢u (Recursion/Stack-based).
     - **Dijkstra** - TÃ¬m Ä‘Æ°á»ng Ä‘i ngáº¯n nháº¥t trÃªn Ä‘á»“ thá»‹ nhá»‹ phÃ¢n cÃ³ trá»ng sá»‘ (cáº¡nh trÃ¡i weight 3, cáº¡nh pháº£i weight 5), cáº­p nháº­t nhÃ£n trá»‹ sá»‘ trá»±c tiáº¿p táº¡i má»—i nÃºt.
     - **Sliding Window** - Ká»¹ thuáº­t cá»­a sá»• trÆ°á»£t tÃ¬m tá»•ng máº£ng con lá»›n nháº¥t Ä‘á»™ dÃ i K=3 (Array-based).
     - **Monotonic Stack** - NgÄƒn xáº¿p Ä‘Æ¡n Ä‘iá»‡u giáº£i bÃ i toÃ¡n Next Greater Element (Stack-based).
  4. **TÃ­ch há»£p linh hoáº¡t vá»›i Renderers**:
     - BFS, DFS, Dijkstra tÃ­ch há»£p vá»›i `TreeRenderer` (Canvas-based).
     - Sliding Window tÃ­ch há»£p vá»›i `BoxArrayRenderer` (Array-based).
     - Monotonic Stack tÃ­ch há»£p vá»›i `TubeRenderer` (Stack-based) báº±ng cÃ¡ch náº¡p trá»±c tiáº¿p danh sÃ¡ch máº£ng ngÄƒn xáº¿p vÃ o dataState.
- **Há»‡ quáº£:**
  * DSA Modules sáº¡ch bÃ³ng cÃ¡c giáº£i thuáº­t sáº¯p xáº¿p Ä‘Æ¡n giáº£n, thay tháº¿ báº±ng cÃ¡c bÃ i toÃ¡n há»c thuáº­t cao cáº¥p vÃ  cá»±c ká»³ áº¥n tÆ°á»£ng.
  * Bá»™ kiá»ƒm thá»­ Vitest frontend pass 100% khÃ´ng cÃ³ regression.
- **File liÃªn quan:**
  * [algorithmCatalog.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/dsa-modules/services/algorithmCatalog.ts)
  * [algorithmLocalMetadata.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/dsa-modules/store/algorithmLocalMetadata.ts)
  * [premiumGenerators.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/dsa-modules/services/premiumGenerators.ts)
  * [dummyGenerators.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/dsa-modules/services/dummyGenerators.ts)
  * [BFSStrategy.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/Domain/Strategies/BFSStrategy.cs)
  * [DFSStrategy.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/Domain/Strategies/DFSStrategy.cs)
  * [DijkstraStrategy.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/Domain/Strategies/DijkstraStrategy.cs)
  * [SlidingWindowStrategy.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/Domain/Strategies/SlidingWindowStrategy.cs)
  * [MonotonicStackStrategy.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/Domain/Strategies/MonotonicStackStrategy.cs)


## ADR-34: Addition of Non-Comparison and Distribution-Based Sorting Visualizers

- **Tráº¡ng thÃ¡i:** âœ… IMPLEMENTED â€” [ArrayBarVisualizer.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/ArrayBarVisualizer.vue)
- **NgÃ y:** 2026-05-31
- **Ngá»¯ cáº£nh:** 
  - Nháº±m lÃ m giÃ u tab **Sáº¯p xáº¿p (Sorting)** vÃ  cung cáº¥p cÃ¡c mÃ´ hÃ¬nh trá»±c quan hÃ³a phi so sÃ¡nh (Non-Comparison) vÃ  phÃ¢n phá»‘i (Distribution-based) cÃ³ giÃ¡ trá»‹ giÃ¡o dá»¥c cao, chÃºng ta cáº§n bá»• sung hai giáº£i thuáº­t kinh Ä‘iá»ƒn: **Counting Sort** vÃ  **Bucket Sort** vÃ o thanh Ä‘iá»u hÆ°á»›ng. Hai thuáº­t toÃ¡n nÃ y cÃ³ cÆ¡ cháº¿ hoáº¡t Ä‘á»™ng vÃ  cÃ¡ch thá»©c hiá»ƒn thá»‹ hoÃ n toÃ n tÃ¡ch biá»‡t so vá»›i Bubble, Quick hay Merge Sort.
- Quyáº¿t Ä‘á»‹nh:
  1. **Triá»ƒn khai Counting Sort**:
     - Thiáº¿t láº­p bá»™ sinh frame `countingSort.ts` ghi nháº­n ba tráº¡ng thÃ¡i: Äáº¿m (count), Cá»™ng dá»“n vá»‹ trÃ­ (accumulate) vÃ  Xuáº¥t káº¿t quáº£ (output).
     - Thiáº¿t káº¿ component `CountingSortVisualizer.vue` hiá»ƒn thá»‹ má»™t báº£ng lÆ°á»›i táº§n suáº¥t (Counting Grid) glassmorphic. Báº£ng nÃ y sáº½ nháº¥p nhÃ¡y sÃ¡ng mÃ u Cyan khá»›p chÃ­nh xÃ¡c vá»›i pháº§n tá»­ máº£ng Ä‘ang Ä‘Æ°á»£c Ä‘áº¿m hoáº·c cá»™ng dá»“n theo thá»i gian thá»±c.
  2. **Triá»ƒn khai Bucket Sort**:
     - Thiáº¿t láº­p bá»™ sinh frame `bucketSort.ts` ghi nháº­n ba tráº¡ng thÃ¡i: PhÃ¢n phá»‘i (distribute), Sáº¯p xáº¿p khay (sort) vÃ  GhÃ©p máº£ng (collect).
     - Thiáº¿t káº¿ component `BucketSortVisualizer.vue` gá»“m 4 khay chá»©a (Buckets Grid) chia theo dáº£i giÃ¡ trá»‹. Khi cháº¡y, cÃ¡c con sá»‘ sáº½ rÆ¡i/bay vÃ o cÃ¡c Bucket tÆ°Æ¡ng á»©ng, tá»± sáº¯p xáº¿p vÃ  sau Ä‘Ã³ Ä‘Æ°á»£c ghÃ©p ná»‘i tuáº§n tá»± trá»Ÿ láº¡i máº£ng gá»‘c ráº¥t trá»±c quan.
  3. **Äá»“ng bá»™ Ä‘iá»u khiá»ƒn**:
     - TÃ­ch há»£p cÃ¡c tÃ¹y chá»n vÃ o `SortingAlgorithmControls.vue` vÃ  mapper generators trong `useSortingAnimation.ts`.
- **Há»‡ quáº£:**
  * Tab Sáº¯p xáº¿p Ä‘áº¡t Ä‘á»™ phong phÃº tá»‘i Ä‘a vá» máº·t há»c thuáº­t vá»›i Ä‘áº§y Ä‘á»§ cÃ¡c archetype giáº£i thuáº­t.
  * ToÃ n bá»™ 27 test cases cá»§a sorting sandbox cháº¡y thÃ nh cÃ´ng má»¹ mÃ£n.
- **File liÃªn quan:**
  * [countingSort.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/algorithms/countingSort.ts)
  * [bucketSort.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/algorithms/bucketSort.ts)
  * [CountingSortVisualizer.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/CountingSortVisualizer.vue)
  * [BucketSortVisualizer.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/BucketSortVisualizer.vue)
  * [ArrayBarVisualizer.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/ArrayBarVisualizer.vue)


## ADR-35: Premium Storytelling and Stable Flow Redesign for Counting Sort Visualizer

- **Tráº¡ng thÃ¡i:** âœ… IMPLEMENTED â€” [CountingSortVisualizer.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/CountingSortVisualizer.vue)
- **NgÃ y:** 2026-05-31
- **Ngá»¯ cáº£nh:**
  - Sau khi Ä‘Æ°a Counting Sort vÃ o danh má»¥c Sáº¯p xáº¿p, giao diá»‡n cÅ© chá»‰ biá»ƒu diá»…n Ä‘Æ°á»£c cáº¥u trÃºc tÄ©nh cá»§a máº£ng Ä‘áº¿m táº§n suáº¥t mÃ  thiáº¿u Ä‘i tÃ­nh ká»ƒ chuyá»‡n há»c thuáº­t (storytelling animation flow). LÆ°á»›i máº£ng Ä‘áº¿m quÃ¡ lá»›n (lÃªn tá»›i 85 Ã´) gÃ¢y quÃ¡ táº£i thÃ´ng tin, thiáº¿u máº£ng Ä‘áº§u ra (Output array), vÃ  khÃ´ng lÃ m rÃµ Ä‘Æ°á»£c tÃ­nh cháº¥t Sáº¯p xáº¿p á»•n Ä‘á»‹nh (Stable Sort) - linh há»“n Ä‘áº·c trÆ°ng nháº¥t cá»§a Counting Sort.
- **Quyáº¿t Ä‘á»‹nh:**
  1. **Giá»›i háº¡n máº£ng Ä‘áº¿m (Clamped Grid)**: Ãnh xáº¡ má»i giÃ¡ trá»‹ máº£ng Ä‘áº§u vÃ o vá» pháº¡m vi `0 - 9` sá»­ dá»¥ng modulo `val % 10`. Cáº£i tiáº¿n nÃ y giÃºp máº£ng Ä‘áº¿m cá»‘ Ä‘á»‹nh chÃ­nh xÃ¡c 10 Ã´ tá»« `0-9`, loáº¡i bá» hoÃ n toÃ n nhiá»…u vÃ  Ã´ thá»«a trÃªn giao diá»‡n.
  2. **Giao diá»‡n cáº¥u trÃºc 3 táº§ng (Three-Tier Stacked Layout)**:
     - Táº§ng 1: Máº£ng Ä‘áº§u vÃ o (Input Array) hiá»ƒn thá»‹ máº£ng gá»‘c vá»›i stable index.
     - Táº§ng 2: Báº£ng Ä‘áº¿m táº§n suáº¥t (Counting Grid) 10 Ã´ cá»‘ Ä‘á»‹nh.
     - Táº§ng 3: Máº£ng káº¿t quáº£ (Output Array) Ä‘Æ°á»£c dá»±ng Ä‘á»™ng tá»« cuá»‘i lÃªn.
  3. **Hoáº¡t áº£nh káº¿t ná»‘i Ä‘Æ°á»ng dáº«n Bezier SVG (Dynamic Bezier SVG Connectors)**:
     - Triá»ƒn khai lá»›p SVG che phá»§ toÃ n bá»™ component. Äo tá»a Ä‘á»™ thá»±c táº¿ cá»§a cÃ¡c Ã´ Ä‘ang active vÃ  váº½ Ä‘Æ°á»ng dáº«n cong Bezier nÃ©t Ä‘á»©t chuyá»ƒn Ä‘á»™ng nháº¥p nhÃ¡y:
       - Trong pha Äáº¿m (Count): LiÃªn káº¿t pháº§n tá»­ Input -> Ã´ Ä‘áº¿m Grid.
       - Trong pha Cá»™ng dá»“n (Accumulate): LiÃªn káº¿t vÃ²ng láº·p giá»¯a cÃ¡c Ã´ Grid liá»n ká».
       - Trong pha Táº¡o Ä‘áº§u ra (Output): LiÃªn káº¿t kÃ©p tá»« pháº§n tá»­ Input -> Ã´ Ä‘áº¿m Grid -> Ã´ máº£ng Output Ä‘Ã­ch.
  4. **Minh há»a tÃ­nh á»•n Ä‘á»‹nh sáº¯c nÃ©t (Stable Sort Highlights)**:
     - GÃ¡n stable ID cá»‘ Ä‘á»‹nh vÃ  mÃ£ mÃ u Ä‘á»™c láº­p cho tá»«ng pháº§n tá»­ (giÃºp phÃ¢n biá»‡t cÃ¡c giÃ¡ trá»‹ trÃ¹ng nhau nhÆ° pháº§n tá»­ `5` thá»© nháº¥t vÃ  `5` thá»© hai).
     - Thá»±c hiá»‡n duyá»‡t ngÆ°á»£c máº£ng Ä‘áº§u vÃ o tá»« PHáº¢I qua TRÃI (right-to-left) trong pha dá»±ng máº£ng káº¿t quáº£, cho tháº¥y rÃµ thá»© tá»± tÆ°Æ¡ng Ä‘á»‘i cá»§a cÃ¡c pháº§n tá»­ trÃ¹ng Ä‘Æ°á»£c giá»¯ nguyÃªn váº¹n á»Ÿ máº£ng Output.
  5. **HUD Info Sync**:
     - Cáº­p nháº­t `SortingDetailPanel.vue` sá»­a lá»—i hardcode Bubble Sort tiÃªu Ä‘á» HUD, cung cáº¥p metadata complexity há»c thuáº­t vÃ  live variables watch chuyÃªn biá»‡t cho cáº£ `counting` vÃ  `bucket` sort.
- **Há»‡ quáº£:**
  * Tráº£i nghiá»‡m trá»±c quan hÃ³a thuáº­t toÃ¡n Counting Sort Ä‘áº¡t cháº¥t lÆ°á»£ng cao nháº¥t, giÃºp ngÆ°á»i há»c náº¯m báº¯t sÃ¢u sáº¯c mental model thá»±c sá»±.
  * ToÃ n bá»™ 27 test cases cá»§a sorting sandbox váº«n duy trÃ¬ káº¿t quáº£ 100% Green.
- **File liÃªn quan:**
  * [countingSort.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/algorithms/countingSort.ts)
  * [CountingSortVisualizer.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/CountingSortVisualizer.vue)
  * [SortingDetailPanel.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/SortingDetailPanel.vue)
  * [sorting.types.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/types/sorting.types.ts)


## ADR-36: Premium Three-Tier Pipeline and Animated Bezier Connectors for Bucket Sort Visualizer

- **Tráº¡ng thÃ¡i:** âœ… IMPLEMENTED â€” [BucketSortVisualizer.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/BucketSortVisualizer.vue)
- **NgÃ y:** 2026-05-31
- **Ngá»¯ cáº£nh:**
  - Giao diá»‡n Bucket Sort cÅ© chá»‰ biá»ƒu diá»…n Ä‘Æ°á»£c cáº¥u trÃºc há»™p tÄ©nh cá»§a cÃ¡c bucket, thiáº¿u Ä‘i luá»“ng hoáº¡t áº£nh (animation flow) di chuyá»ƒn phÃ¢n phá»‘i (Distribute) vÃ  thu tháº­p (Collect) cá»§a cÃ¡c pháº§n tá»­. Äá»“ng thá»i, khÃ´ng cÃ³ dáº£i giÃ¡ trá»‹ (range) rÃµ rÃ ng cho tá»«ng bucket, khÃ´ng cÃ³ máº£ng káº¿t quáº£ (Output Array) Ä‘á»™ng há»c trá»±c quan, vÃ  thiáº¿u Ä‘i cÃ¡c hiá»‡u á»©ng highlight so sÃ¡nh/hoÃ¡n Ä‘á»•i (swap) sáº¯c nÃ©t bÃªn trong cÃ¡c bucket khi thá»±c hiá»‡n sáº¯p xáº¿p ná»™i bá»™.
- **Quyáº¿t Ä‘á»‹nh:**
  1. **Giao diá»‡n cáº¥u trÃºc 3 táº§ng há»c thuáº­t (Three-Tier Pipeline Layout)**:
     - Táº§ng 1: Máº£ng Ä‘áº§u vÃ o (Input Array) hiá»ƒn thá»‹ máº£ng gá»‘c vá»›i cÃ¡c cá»™t/thanh cÃ³ chiá»u cao tÆ°Æ¡ng á»©ng giÃ¡ trá»‹, cÃ³ glow active vÃ  pointer chá»‰ hÆ°á»›ng xÃ©t.
     - Táº§ng 2: Há»‡ thá»‘ng 4 Khay chá»©a dá»¯ liá»‡u (Buckets Grid) vá»›i nhÃ£n dáº£i giÃ¡ trá»‹ hiá»ƒn thá»‹ rÃµ rÃ ng: `[0-25)`, `[25-50)`, `[50-75)`, `[75-100]`. Má»—i bucket cÃ³ badge tráº¡ng thÃ¡i Ä‘á»™ng (`Chá»`, `Nháº­n`, `Sort`, `Láº¥y`, `Rá»—ng/Xong`).
     - Táº§ng 3: Máº£ng káº¿t quáº£ (Output Array) gá»“m cÃ¡c slot Ä‘Æ°á»£c láº¥p Ä‘áº§y tá»« trÃ¡i sang pháº£i step-by-step trong pha thu hoáº¡ch.
  2. **Há»‡ thá»‘ng káº¿t ná»‘i Bezier SVG & Háº¡t neon di chuyá»ƒn (Animated Bezier SVG Connectors)**:
     - Dá»±ng lá»›p SVG che phá»§ tuyá»‡t Ä‘á»‘i toÃ n bá»™ canvas. Tá»± Ä‘á»™ng tÃ­nh toÃ¡n vá»‹ trÃ­ DOM pixel chÃ­nh xÃ¡c cá»§a cÃ¡c cá»™t input, cÃ¡c khay bucket, vÃ  cÃ¡c slot output Ä‘ang active.
     - Váº½ Ä‘Æ°á»ng cong Bezier Cubic mÆ°á»£t mÃ  káº¿t há»£p háº¡t neon sÃ¡ng chuyá»ƒn Ä‘á»™ng trÃ´i ná»•i liÃªn tá»¥c dá»c theo luá»“ng tá»« trÃªn xuá»‘ng dÆ°á»›i (Scatter á»Ÿ pha Distribute, vÃ  Gather á»Ÿ pha Collect).
  3. **Visual Camera-Focus Transitions (Hiá»‡u á»©ng láº¥y nÃ©t cá»±c cao)**:
     - Khi thuáº­t toÃ¡n Ä‘ang á»Ÿ pha nÃ o, cÃ¡c táº§ng khÃ´ng hoáº¡t Ä‘á»™ng sáº½ tá»± Ä‘á»™ng giáº£m Ä‘á»™ sÃ¡ng xuá»‘ng `opacity-20` vÃ  lÃ m má» nháº¹ (`blur-[0.4px]`), giÃºp há»c sinh hoÃ n toÃ n táº­p trung vÃ o hÃ nh Ä‘á»™ng cá»‘t lÃµi cá»§a giáº£i thuáº­t.
  4. **Ná»™i suy hoÃ¡n vá»‹ vÃ  so sÃ¡nh bÃªn trong Bucket (Sort inside Bucket)**:
     - Khi má»™t bucket Ä‘ang thá»±c hiá»‡n sáº¯p xáº¿p ná»™i bá»™ (báº±ng Insertion Sort), khay bucket Ä‘Ã³ sáº½ sÃ¡ng rá»±c lÃªn. Hai pháº§n tá»­ Ä‘ang Ä‘Æ°á»£c so sÃ¡nh hoáº·c hoÃ¡n Ä‘á»•i sáº½ tá»± Ä‘á»™ng scale to `1.12x`, tÃ´ viá»n Cyan nháº¥p nhÃ¡y, giÃºp ngÆ°á»i há»c hiá»ƒu rÃµ bucket khÃ´ng pháº£i lÃ  má»™t chiáº¿c há»™p Ä‘en bÃ­ áº©n.
  5. **Äá»“ng bá»™ hÃ³a tÃ´ng mÃ u Cyan Ä‘Æ¡n sáº¯c sang trá»ng**:
     - Loáº¡i bá» viá»‡c tÃ´ mÃ u cáº§u vá»“ng lÃ²e loáº¹t cho cÃ¡c khay. ToÃ n bá»™ cÃ¡c cáº¥u trÃºc Ä‘Æ°á»£c chuáº©n hÃ³a theo tÃ´ng mÃ u xanh da trá»i/Cyan thÆ°Æ¡ng hiá»‡u (`#38bdf8`, `#22d3ee`) cá»§a Sandbox Ä‘á»ƒ Ä‘áº£m báº£o tÃ­nh Ä‘á»“ng bá»™ hoÃ n má»¹.
- **Há»‡ quáº£:**
  * GiÃºp há»c sinh tháº¥u hiá»ƒu trá»n váº¹n báº£n cháº¥t "phÃ¢n chia dáº£i giÃ¡ trá»‹ - sáº¯p xáº¿p ná»™i bá»™ - thu hoáº¡ch tuáº§n tá»±" cá»§a Bucket Sort má»™t cÃ¡ch vÃ´ cÃ¹ng sá»‘ng Ä‘á»™ng.
  * ToÃ n bá»™ 27 test cases cá»§a sorting sandbox cháº¡y thÃ nh cÃ´ng má»¹Ã£n.
- **File liÃªn quan:**
  * [bucketSort.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/algorithms/bucketSort.ts)
  * [BucketSortVisualizer.vue](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/components/BucketSortVisualizer.vue)
  * [sorting.types.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/types/sorting.types.ts)


## ADR-37: Premium Pedagogical Storyboard and Decision-Aware Highlights for Binary Search Visualizer

- **Tráº¡ng thÃ¡i:** âœ… IMPLEMENTED â€” [boxArrayRenderHelpers.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/dsa-modules/components/renderers/boxArrayRenderHelpers.ts)
- **NgÃ y:** 2026-05-31
- **Ngá»¯ cáº£nh:**
  - Máº·c dÃ¹ thuáº­t toÃ¡n Binary Search Ä‘Ã£ Ä‘Æ°á»£c cÃ i Ä‘áº·t Ä‘Ãºng vá» máº·t logic, giao diá»‡n trá»±c quan cÅ© trÃªn Canvas chá»‰ highlight Ä‘Æ¡n Ä‘iá»‡u cÃ¡c con trá» Low/Mid/High mÃ  thiáº¿u Ä‘i sá»± sá»‘ng Ä‘á»™ng há»c thuáº­t: ngÆ°á»i há»c khÃ´ng tháº¥y rÃµ Ä‘Æ°á»£c cÆ¡ cháº¿ chia Ä‘Ã´i pháº¡m vi tÃ¬m kiáº¿m (cáº¯t bá» má»™t ná»­a sau má»—i bÆ°á»›c), khÃ´ng ná»•i báº­t Ä‘Æ°á»£c giÃ¡ trá»‹ Target Ä‘ang tÃ¬m kiáº¿m, khÃ´ng lÃ m ná»•i báº­t há»™p Mid nhÆ° má»™t quyáº¿t Ä‘á»‹nh logic trá»ng tÃ¢m, vÃ  khÃ´ng cÃ³ cÃ¡c pháº£n há»“i so sÃ¡nh trá»±c quan (nháº­n biáº¿t káº¿t quáº£ so sÃ¡nh lá»›n hÆ¡n/nhá» hÆ¡n).
- **Quyáº¿t Ä‘á»‹nh:**
  1. **Tráº¡ng thÃ¡i loáº¡i bá» pháº¡m vi trá»±c quan (Eliminated Range States)**:
     - Biá»ƒu diá»…n rÃµ nÃ©t cÃ¡c pháº§n tá»­ Ä‘Ã£ bá»‹ loáº¡i khá»i pháº¡m vi tÃ¬m kiáº¿m á»Ÿ má»—i bÆ°á»›c báº±ng cÃ¡ch giáº£m Ä‘á»™ sÃ¡ng cá»§a chÃºng xuá»‘ng `opacity 0.25` vÃ  váº½ thÃªm má»™t dáº¥u gáº¡ch chÃ©o Ä‘á» `âœ•` má» qua toÃ n bá»™ há»™p. NgÆ°á»i há»c sáº½ láº­p tá»©c "feel" Ä‘Æ°á»£c sá»± thu háº¹p cá»±c ká»³ máº¡nh máº½ cá»§a Ä‘á»™ phá»©c táº¡p $O(\log N)$.
  2. **Thanh giáº±ng pháº¡m vi tÃ¬m kiáº¿m Ä‘á»™ng (Active Search Range Bracket)**:
     - Váº½ má»™t Ä‘Æ°á»ng thanh giáº±ng ngang káº¿t ná»‘i con trá» Low vÃ  High náº±m ngay phÃ­a trÃªn cÃ¡c há»™p pháº§n tá»­ vá»›i nhÃ£n ná»•i báº­t `ACTIVE SEARCH RANGE`. Khi Low vÃ  High thay Ä‘á»•i, thanh giáº±ng nÃ y co ngáº¯n láº¡i cá»±c ká»³ sinh Ä‘á»™ng qua tá»«ng bÆ°á»›c.
  3. **Láº¥y nÃ©t vÃ  phÃ³ng Ä‘áº¡i há»™p MID (Enlarged MID Attention Focus)**:
     - Khi má»™t pháº§n tá»­ Ä‘Æ°á»£c chá»n lÃ m Mid, há»™p pháº§n tá»­ Ä‘Ã³ tá»± Ä‘á»™ng phÃ³ng to `1.15x`, lá»‡ch nháº¹ vá»‹ trÃ­ lÃªn trÃªn vÃ  tÃ´ viá»n sÃ¡ng vÃ ng/gold rá»±c rá»¡. Äá»“ng thá»i, váº½ má»™t con trá» chá»‰ xuá»‘ng kÃ¨m nhÃ£n `MID` ná»•i báº­t ngay phÃ­a trÃªn.
  4. **Bong bÃ³ng so sÃ¡nh logic tá»©c thá»i (Decision-Aware Comparison Bubble)**:
     - Váº½ má»™t bong bÃ³ng pháº£n há»“i so sÃ¡nh capsule mÃ u vÃ ng gold náº±m ngay trÃªn MID (vÃ­ dá»¥: `12 < 36` hoáº·c `45 > 36`). Äiá»u nÃ y giÃºp ngÆ°á»i há»c hiá»ƒu ngay láº­p tá»©c táº¡i sao Low hoáº·c High láº¡i di chuyá»ƒn mÃ  khÃ´ng cáº§n pháº£i Ä‘á»c lÆ°á»›t qua mÃ´ táº£ vÄƒn báº£n á»Ÿ xa.
  5. **ðŸŽ¯ Target Capsule & FOUND/NOT-FOUND Banners**:
     - Thiáº¿t láº­p nhÃ£n capsule Target chuyÃªn nghiá»‡p á»Ÿ trÃªn cÃ¹ng chÃ­nh giá»¯a canvas (`ðŸŽ¯ Target: 36`).
     - Khi tÃ¬m tháº¥y, váº½ banner ná»•i báº­t `FOUND âœ…` mÃ u xanh lÃ¡ Emerald, vÃ  váº½ banner `NOT FOUND âŒ` mÃ u Ä‘á» rá»±c rá»¡ khi káº¿t thÃºc tÃ¬m kiáº¿m tháº¥t báº¡i.
  6. **Äá»“ng bá»™ hÃ³a mÃ u sáº¯c Ä‘Æ¡n sáº¯c cao cáº¥p**:
     - Thá»‘ng nháº¥t toÃ n bá»™ phong cÃ¡ch váº½ cá»§a `BarChartRenderer.vue` vÃ  `BoxArrayRenderer.vue` sang tÃ´ng mÃ u Cyan thÆ°Æ¡ng hiá»‡u Sandbox, Ä‘iá»ƒm thÃªm mÃ u vÃ ng gold cho con trá» MID vÃ  mÃ u xanh Emerald cho káº¿t quáº£ tÃ¬m tháº¥y.
- **Há»‡ quáº£:**
  * Trá»±c quan hÃ³a thuáº­t toÃ¡n Binary Search Ä‘áº¡t má»©c Ä‘á»™ rÃµ nÃ©t vÃ  sÆ° pháº¡m tá»‘i Ä‘a, mang láº¡i khoáº£nh kháº¯c "aha" thá»±c sá»± cho há»c sinh khi hiá»ƒu rÃµ báº£n cháº¥t chia Ä‘Ã´i pháº¡m vi.
  * ToÃ n bá»™ 38 test cases cá»§a dsa-modules cháº¡y thÃ nh cÃ´ng 100% Green.
- **File liÃªn quan:**
  * [boxArrayRenderHelpers.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/dsa-modules/components/renderers/boxArrayRenderHelpers.ts)
  * [sortingGenerators.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/dsa-modules/services/sortingGenerators.ts)
  * [algorithm.types.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/dsa-modules/types/algorithm.types.ts)


## ADR-38: Thay tháº¿ biá»ƒu tÆ°á»£ng Emojis Canvas báº±ng cÃ¡c Vector Path váº½ tay cao cáº¥p (High-Fidelity Custom Vector Paths)

- **Tráº¡ng thÃ¡i:** âœ… IMPLEMENTED â€” [boxArrayRenderHelpers.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/dsa-modules/components/renderers/boxArrayRenderHelpers.ts)
- **NgÃ y:** 2026-05-31
- **Ngá»¯ cáº£nh:**
  - Nháº±m loáº¡i bá» hoÃ n toÃ n cÃ¡c biá»ƒu tÆ°á»£ng emoji máº·c Ä‘á»‹nh (`ðŸŽ¯`, `âœ…`, `âŒ`) vá»‘n mang láº¡i cáº£m giÃ¡c thiáº¿t káº¿ generic (phong cÃ¡ch Chat GPT) vÃ  khÃ´ng nháº¥t quÃ¡n giá»¯a cÃ¡c trÃ¬nh duyá»‡t khÃ¡c nhau. Visualizer cáº§n má»™t giao diá»‡n nháº¥t quÃ¡n, tinh táº¿ vÃ  Ä‘áº­m cháº¥t há»c thuáº­t cao cáº¥p.
- **Quyáº¿t Ä‘á»‹nh:**
  1. **Thiáº¿t káº¿ láº¡i Target Bullseye (Top Capsule)**:
     - Thay tháº¿ emoji `ðŸŽ¯` báº±ng má»™t biá»ƒu tÆ°á»£ng há»“ng tÃ¢m vector Ä‘Æ°á»£c váº½ trá»±c tiáº¿p báº±ng Canvas 2D Path trong gam mÃ u Cyan (`#38bdf8`).
     - Cáº¥u trÃºc biá»ƒu tÆ°á»£ng gá»“m: 2 vÃ²ng trÃ²n Ä‘á»“ng tÃ¢m (vÃ²ng ngoÃ i bÃ¡n kÃ­nh 5px nÃ©t váº½ máº£nh, vÃ²ng trong nÃ©t Ä‘áº·c bÃ¡n kÃ­nh 1.5px) vÃ  4 Ä‘Æ°á»ng tick chá»‰ hÆ°á»›ng vuÃ´ng gÃ³c tá»« bÃ¡n kÃ­nh 7.5px vÃ o Ä‘áº¿n 5.0px, mang láº¡i váº» ngoÃ i nhÆ° má»™t thÆ°á»›c ngáº¯m radar hiá»‡n Ä‘áº¡i.
  2. **Thiáº¿t káº¿ láº¡i Banner FOUND (Emerald Green)**:
     - Thay tháº¿ `FOUND âœ…` báº±ng vÄƒn báº£n `FOUND` cÄƒn lá» trÃ¡i tinh táº¿, Ä‘i kÃ¨m má»™t vÃ²ng trÃ²n xanh Ä‘áº·c (`#10b981`, bÃ¡n kÃ­nh 6px) chá»©a má»™t dáº¥u tick tráº¯ng máº£nh Ä‘Æ°á»£c vuá»‘t nhá»n gÃ³c (`lineCap='round', lineJoin='round'`), táº¡o Ä‘á»™ ná»•i khá»‘i chuyÃªn nghiá»‡p.
  3. **Thiáº¿t káº¿ láº¡i Banner NOT FOUND (Red Accent)**:
     - Thay tháº¿ `NOT FOUND âŒ` báº±ng vÄƒn báº£n `NOT FOUND` Ä‘i kÃ¨m má»™t vÃ²ng trÃ²n Ä‘á» Ä‘áº·c (`#ef4444`, bÃ¡n kÃ­nh 6px) chá»©a má»™t dáº¥u chÃ©o vector tráº¯ng máº£nh (`#ffffff`), Ä‘áº£m báº£o Ä‘á»™ tÆ°Æ¡ng pháº£n cao vÃ  trá»±c quan.
- **Há»‡ quáº£:**
  * ToÃ n bá»™ visualizer rÅ© bá» hoÃ n toÃ n phong cÃ¡ch "emoji generic", khoÃ¡c lÃªn mÃ¬nh giao diá»‡n Custom Vector Graphics Ä‘á»“ng bá»™ tuyá»‡t Ä‘á»‘i vá»›i phong cÃ¡ch Glassmorphic chung cá»§a dá»± Ã¡n.
  * CÃ¡c biá»ƒu tÆ°á»£ng Ä‘Æ°á»£c váº½ toÃ¡n há»c chÃ­nh xÃ¡c 100% giÃºp kiá»ƒm soÃ¡t cÄƒn lá» vÃ  padding hoÃ n háº£o trÃªn má»i kÃ­ch thÆ°á»›c mÃ n hÃ¬nh vÃ  Ä‘á»™ phÃ¢n giáº£i Retina/DPI mÃ  khÃ´ng bá»‹ vá»¡ nÃ©t hay phá»¥ thuá»™c vÃ o font emoji cá»§a há»‡ Ä‘iá»u hÃ nh.
  * ToÃ n bá»™ 38 test case cá»§a `dsa-modules` tiáº¿p tá»¥c vÆ°á»£t qua thÃ nh cÃ´ng (100% Green).
- **File liÃªn quan:**
  * [boxArrayRenderHelpers.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/dsa-modules/components/renderers/boxArrayRenderHelpers.ts)

---
### ADR-39 | 2026-05-31 | Unify color system with skillsmp.io palette

**Context:** Dashboard va visualizer sandbox dung hai palette khac biet (zinc/cyberpunk-blue).

**Decision:**
- Cap nhat 	heme.css voi bo mau chinh xac tu skillsmp.io (accent salmon #e8825a, green #3db87a, bg #0b0b0b)
- Them --vis-panel-bg* tokens de thay the hardcode #090f19/#0e1726/#0b121e trong inspector panels
- AlgorithmDashboard.vue dung .dash-* scoped classes bridge to CSS vars
- LomutoInspector, MergeInspector, SortingDetailPanel, BubbleSortVisualizer dung .xxx-panel scoped classes

**Consequences:**
- (+) Toan bo he thong dung cung mot nguon su that mau sac
- (+) Doi theme chi can thay gia tri bien trong 	heme.css, khong can cham component
- (+) Semantic vis colors (cyan/green/red/yellow) van giu nguyen ngu nghia hoc thuat
- (-) Cac component canvas (.ts renderer files) van dung hardcode de giu semantic accuracy

---
### ADR-40 | 2026-06-06 | Graph RAG read-path: induced subgraph + AsNoTracking projection

**Context:** Endpoint `GET /api/v1/concepts/analytics/semantic-graph` cáº§n tráº£ vá» Ä‘á»“ thá»‹ tri thá»©c (nodes + edges + stats) hiá»‡u nÄƒng cao, há»— trá»£ lá»c theo category mÃ  khÃ´ng táº¡o cáº¡nh "treo" (dangling edge) trá» tá»›i node Ä‘Ã£ bá»‹ lá»c bá».

**Decision:**
- `SemanticGraphService` truy váº¥n trá»±c tiáº¿p `ApplicationDbContext` vá»›i `AsNoTracking()` + projection sang DTO (khÃ´ng tráº£ entity) Ä‘á»ƒ tá»‘i Æ°u read-path.
- Khi cÃ³ filter `category`, chá»‰ giá»¯ cÃ¡c cáº¡nh náº±m **trá»n** trong táº­p node Ä‘Ã£ lá»c (induced subgraph): `nodeIds.Contains(Source) && nodeIds.Contains(Target)`.
- `Degree` tÃ­nh tá»« `OutgoingEdges.Count + IncomingEdges.Count`; `GraphDensity` = E / (VÂ·(Vâˆ’1)) cho Ä‘á»“ thá»‹ cÃ³ hÆ°á»›ng, tráº£ 0 khi V â‰¤ 1.
- `Embedding` Ã¡nh xáº¡ sang `double precision[]` cá»§a PostgreSQL qua Fluent API.

**Consequences:**
- (+) Lá»c category khÃ´ng bao giá» sinh cáº¡nh treo; client luÃ´n nháº­n Ä‘á»“ thá»‹ nháº¥t quÃ¡n.
- (+) Read-path nháº¹ (no-tracking, projection) â€” phÃ¹ há»£p truy váº¥n analytics Ä‘á»c nhiá»u.
- (âˆ’) `double precision[]` Ä‘áº·c thÃ¹ PostgreSQL; provider khÃ¡c cáº§n mapping thay tháº¿.
- **Tests:** 5 unit tests (InMemory) phá»§ all/order/degree/induced-filter/empty.

---
### ADR-41 | 2026-06-06 | Event Sourcing Ledger: append-only frames + interceptor + reactive action filter

**Context:** Cáº§n ghi láº¡i tÆ°Æ¡ng tÃ¡c thÃ´ cá»§a ngÆ°á»i dÃ¹ng (VCR scrubbing, code syntax gaffe, quiz telemetry, API interaction) dÆ°á»›i dáº¡ng time-series báº¥t biáº¿n Ä‘á»ƒ phá»¥c vá»¥ phÃ¢n tÃ­ch/replay, khÃ´ng Ä‘Æ°á»£c phÃ©p sá»­a/xÃ³a sau khi ghi.

**Decision:**
- Entity `SystemAuditEventStream` append-only: `Payload` JSONB, `Sequence` Ä‘Æ¡n Ä‘iá»‡u tÄƒng (UTC ticks), `OccurredAt` timestamptz, kÃ¨m cÃ¡c index time-series (OccurredAt, Sequence, EventType, (UserId, OccurredAt)).
- `AuditEventService.AppendAsync` chá»‰ Add + SaveChanges (khÃ´ng bao giá» Update/Delete).
- `ImmutableAuditInterceptor` (SaveChanges interceptor) cháº·n má»i entry `SystemAuditEventStream` á»Ÿ tráº¡ng thÃ¡i `Modified`/`Deleted` â†’ nÃ©m `InvalidOperationException` (báº£o vá»‡ táº§ng DB-write).
- `AuditEventActionFilter` (global `IAsyncActionFilter`) append má»™t frame **reactively sau** má»—i action; best-effort, khÃ´ng bao giá» lÃ m fail request gá»‘c.

**Consequences:**
- (+) TÃ­nh báº¥t biáº¿n Ä‘Æ°á»£c báº£o vá»‡ hai táº§ng: interceptor (write) + filter chá»‰-append (ghi).
- (+) Audit khÃ´ng xÃ¢m láº¥n â€” tá»± Ä‘á»™ng báº¯t má»i API action, lá»—i audit khÃ´ng áº£nh hÆ°á»Ÿng response.
- (âˆ’) Má»—i action phÃ¡t sinh thÃªm má»™t INSERT; cháº¥p nháº­n Ä‘Ã¡nh Ä‘á»•i cho má»¥c tiÃªu observability.
- **Tests:** 6 unit tests (InMemory) phá»§ append/default-payload/monotonic-sequence/block-update/block-delete/allow-append.

---
### ADR-42 | 2026-06-06 | Authentication & Payment Session Stabilization: Stateless Init Session Restore + Guest Checkout Prevention

**Context:** Users were experiencing logout on page refresh because the stateless session restore wasn't triggered during the early application initialization (uthStore.init()). Furthermore, anonymous guests could access the premium payment page, bypassing authorization checks, which defaulted checkout transactions to a shared fallback user ID (demo-user-001). This caused conflicts where all guests saw "already premium" due to shared state.

**Decision:**
- Update useAuthStore.init() to check for the presence of dsa_stateless_user_id in localStorage and automatically restore the session via statelessInit() and loadStatelessProfile() prior to app mounting and progress retrieval.
- Require active authentication for payment actions by updating usePaymentStore to abort and raise errors if uthStore.isAuthenticated is false.
- Update PremiumCheckoutView.vue to conditionally render a glassmorphic login gate when not authenticated, providing a clear path to sign in without abrupt page redirection.

**Consequences:**
- (+) Secure, unified authentication checks that prevent unauthorized checkout access.
- (+) Robust session persistence that survives browser reloads.
- (+) Improved UX by displaying a prompt inside the checkout viewport rather than redirecting the user to the landing page.

---
### ADR-43 | 2026-06-09 | FrameDTO Optional Properties Type Mismatch Stabilization

**Context:** The FrameDTO is a base interface used across all algorithm visualizers. However, to support graph simulation algorithms which do not render using array elements (dataState and highlights), these fields were made optional (?). This introduced strict TypeScript compile errors (possibly 'undefined') in sorting visualizers and test specifications that access dataState or highlights directly.

**Decision:**
- Refactor all sorting visualizers (useAnimationCanvas.ts, compareCanvasDraw.ts, CompareCanvasPanel.vue, compareHelpers.ts) to handle the optionality of dataState and highlights safely using nullish coalescing default values (e.g., frame.highlights ?? [] and frame.dataState ?? []).
- In test specifications (e.g., algorithmApi.spec.ts) where sorting frames are guaranteed to contain highlights, apply TypeScript's non-null assertion operator (!) to resolve compile warnings without introducing type bypasses (like as any) which violate the project's strict styling guidelines.

**Consequences:**
- (+) Zero compilation warnings or errors under strict vue-tsc settings.
- (+) Standardized type safety guidelines are fully preserved without resorting to type-bypasses.
- (+) Reusable API integration where Sorting and Graph algorithms share a single FrameDTO interface cleanly.

---
### ADR-44 | 2026-06-09 | Standardizing API Host Configuration & Custom 404 Route Integration

**Context:**
The frontend was encountering API communication failures (404/CORS errors) due to a double API prefix (/api/v1/api/v1) caused by both .env.development and piClient.ts appending the prefix. Additionally, invalid URL paths silently redirected users to the landing page rather than notifying them with a clear 404 Not Found error page.

**Decision:**
- Normalize VITE_API_BASE_URL in .env.development to the host only (http://localhost:5000), and configure piClient.ts to automatically append /api/v1 to standard requests, ensuring consistency.
- Implement NotFoundView.vue utilizing the project's signature Glassmorphism layout, featuring interactive elements like dynamic floating canvas particles, quick navigation links, a glitch 404 code aesthetic, and proper history navigation.
- Update the Vue router catch-all route /:pathMatch(.*)* to directly render NotFoundView.vue instead of performing a silent redirect.

**Consequences:**
- (+) Fixed API communication, resolving leaderboard and user progression data fetching.
- (+) Enhanced UX by preventing confusing silent redirects on missing pages, offering immediate navigation alternatives.
- (+) Preserved application design aesthetics on all error pages.

---
### ADR-45 | 2026-06-09 | Guided Tour Onboarding, Monaco Editor Resilience, and SOLID pedagogical improvements

**Context:**
First-time users found the complex multi-panel DSA workspace and the terminal interface overwhelming. Additionally, when Monaco Editor failed to load due to network drops or CDN cache misses, the application crashed with white screen errors. Lastly, the OOP/SOLID section needed a clear Vietnamese pedagogical explanation to reduce cognitive load on students.

**Decision:**
- Implement `useGuidedTourStore.ts` using Pinia to manage a 5-step interactive guide with persistent state (`localStorage`), step navigation controls (skip, next, prev, restart), and spotlight positioning.
- Develop `GuidedTourOverlay.vue` using glassmorphism styling, a dynamic spotlight overlay, and transition animations for onboarding.
- Integrate a manual " Hu?ng d?n nhanh\ button in the global Header, and trigger the tour automatically on initial app launch.
- Wrap Monaco Editor `loader.init()` in try-catch blocks in `MonacoEditorPanel.vue`, `DebugWorkspace.vue`, and `CodeEditor.vue` with dynamic reloading buttons to prevent app crashes.
- Translate and enrich LSP and DIP educational content with detailed Vietnamese texts in `LSPLessonPanel.vue` and `DIPLessonPanel.vue`.

**Consequences:**
- (+) Streamlined onboarding experience that significantly reduces user friction and cognitive load.
- (+) High resilience to CDN/network failures for the Monaco editor without breaking the rest of the application.
- (+) Clear pedagogical explanations of complex SOLID design principles in Vietnamese.

---
### ADR-46 | 2026-06-09 | User Profile Management & Sidebar Redesign

**Context:**
The platform lacked a personalized space for students to view their gamification progress (XP, level name, badges), update their nickname/bio/university, and manage their account details. Furthermore, the sidebar navigation included a redundant "VCR Timeline" tab which offered no additional pedagogical value over the individual algorithm workspaces.

**Decision:**
- Refactor backend `StatelessAuthStrategy` and `StatelessAuthController` to accept and persist additional profile fields: `Nickname`, `Bio`, and `University` inside the session-level stateless state.
- Update frontend `StatelessUserDto` and `AuthUserDto` interfaces, as well as `useAuthStore` Pinia store actions to support fetching and modifying these new properties.
- Remove the redundant `VCR Timeline` tab from `appTabs.ts`, `routes.ts`, and navigation.
- Implement `ProfileView.vue` using glassmorphism styling, a dynamic XP progression wheel, a grid showcasing earned badges, and an interactive form to edit user metadata.
- Integrate click navigation to `ProfileView` directly from the global Header user badge avatar.

**Consequences:**
- (+) Cleaned up sidebar navigation by removing redundant components.
- (+) Provided a centralized profile panel for tracking gamified student achievements.
- (+) Maintained clean C# and TypeScript models with stateless reactive persistence.

---
### ADR-47 | 2026-06-14 | Backend 2-Layer Token Authentication Guard & Excel Importer Schema Compatibility

**Context:**
The platform required API-level access control on teacher quiz management endpoints (StatelessQuizController) and system administration endpoints (AdminController) to reject unauthenticated or non-role-conforming requests. Additionally, importing legacy quiz templates containing the column header "TiÃªu Ä‘á» tráº¯c nghiá»‡m" instead of "TiÃªu Ä‘á» Quiz" resulted in data parsing failures.

**Decision:**
- Apply the RequireToken() 2-layer authentication guard across all admin and teacher write/management endpoints in AdminController.cs and StatelessQuizController.cs, validating JWT signature integrity using the HMACS256 algorithm and expiration times.
- Implement strict role-based claims verification using IsAdmin() and IsTeacherOrAdmin() to control access to write actions.
- Update the ExcelRowInput interface and excelParser.ts engine to dynamically map both "TiÃªu Ä‘á» tráº¯c nghiá»‡m" and "TiÃªu Ä‘á» Quiz" to the quiz title property, maintaining 100% backward compatibility.
- Localize the remaining English strings inside TeacherPanelView.vue and ExcelQuizImporter.vue into professional academic Vietnamese.

**Consequences:**
- (+) Secured critical backend quiz operations and system administrative actions against malicious API calls.
- (+) Provided a robust, backward-compatible import workflow that handles legacy Excel templates.
- (+) Completed end-to-end localization of the teacher dashboard, enhancing overall UX consistency.


---
### ADR-48 | 2026-06-16 | Guided Tour Expansion & Integration Stability

**Context:**
As the platform grew to include advanced modules like Algorithm Compare, Graph Playground, Sorting View, and System Design, students needed page-specific interactive onboarding guides to explain specialized UI components (VCR controls, comparative panels, physics layouts). Furthermore, the onboarding tests required verification alignment to ensure 100% test coverage with zero regressions.

**Decision:**
- Standardize target UI selectors by embedding explicit `data-tour-id` attributes on key elements of `/sorting`, `/compare`, `/graph`, and `/system` workspaces to avoid fragile CSS class dependence.
- Expand `useGuidedTourStore.ts` with custom multi-step configs under the `PAGE_TOURS` registry for sorting, compare, graph, and system views.
- Integrate the shared `HelpButton.vue` component in `CompareView.vue` and `GraphView.vue`, enabling students to manually trigger or replay the guide.
- Configure automatic onboarding tour triggers on the first view visit using local storage keys (`page_tour_{route}_seen`).
- Align and update the Vitest test suite (`useGuidedTourStore.spec.ts`) assertions to match the updated tour steps and titles, ensuring 100% of the 1548 tests pass.

**Consequences:**
- (+) Highly context-aware onboarding guides that automatically familiarize users with complex specialized controls.
- (+) Clean separation of concerns by using HTML `data-tour-id` attributes for target element selection.
- (+) Fully green, verified, and robust test suite coverage of the entire guided tour lifecycle.

---
### ADR-49 | 2026-06-16 | Interactive Assistant Guided Tour with Virtual Avatar & Simulation Playback

**Context:**
To further lower the cognitive load on students during onboarding, the static guided tour needed to evolve into an interactive "Virtual Assistant" experience. This required a responsive visual mascot to convey emotional states, a typewriter voice dialogue with simulated audio equalizers, and an auto-play "Watch Me Work" capability that drives automated clicks and input events using a virtual pointer.

**Decision:**
- Develop a responsive glassmorphic `VirtualMascot.vue` component with reactive emotional states (Greeting, Simulating, Success) and floating bobbing animations.
- Implement `VirtualPointer.vue` representing a neon tracking cursor with Lerp-based movement and click ripple indicators.
- Refactor `useGuidedTourStore.ts` with a core simulation script execution engine (`runCurrentStepScript`) that dispatches native DOM click and input events based on CSS selectors.
- Update `GuidedTourOverlay.vue` to integrate the virtual avatar, pointer, real-time typewriter dialogue, and simulated voice equalizer waves.
- Update the Vitest test suite (`useGuidedTourStore.spec.ts`) to assert simulation execution and JSDOM environment compatibility, keeping all tests passing.

**Consequences:**
- (+) Significant UX upgrade: immersive, human-like virtual onboarding assistant instead of static popups.
- (+) Low-risk, non-intrusive DOM event simulation that does not mutate component states or introduce memory leaks.
- (+) Complete and robust test suite coverage verifying interactive simulations.

---
### ADR-50 | 2026-06-17 | Hardening Backend Performance and Resilience Audit

**Context:**
To prepare the system for production-level concurrent load, the backend .NET Core API needed performance optimization and resilience guardrails. High-latency execution endpoints were vulnerable to CPU exhaustion, visualization rendering controllers generated redundant database/compute requests, and database queries suffered from excessive memory allocations under high user traffic.

**Decision:**
- Implement `CancellationToken` guardrails with a strict 2-second timeout linked to `HttpContext.RequestAborted` in the `Execute` and `Compare` endpoints of `AlgorithmsController` to prevent runaway processes.
- Integrate `IMemoryCache` caching across all visualization scenario generators (`SOLIDController`, `OOPController`, `DIContainerController`, `SystemDesignController`, `DesignPatternsController`) with sliding and absolute expiration profiles.
- Enforce `.AsNoTracking()` on all read-only repository database queries across the backend, specifically in `QuizRepository` and `UserRepository`.
- Validate the backend codebase with comprehensive regression unit testing to ensure system stability.

**Consequences:**
- (+) Runaway algorithm compilation/execution processes are automatically terminated after 2s, protecting server CPU resources.
- (+) Redundant heavy calculation and strategy resolution requests for visualization scenarios are eliminated via thread-safe caching.
- (+) Lower database query latency and significantly reduced RAM overhead by bypassing EF Core's ChangeTracker overhead.
- (+) Verified system stability with 100% pass rate across all backend unit tests.

---
### ADR-51 | 2026-06-17 | Backend Security Hardening and Rate Limiting Protection

**Context:**
To protect the public visualizer endpoints and system statistics from brute-force crawling, spam, and potential denial-of-service (DoS) attacks, the backend needed robust input size enforcement and granular, IP-based request rate limiting.

**Decision:**
- Enforce mandatory array size limit validation using `ConstraintResolver.ValidateSize` in the `Execute` and `Compare` endpoints of `AlgorithmsController` to reject oversized payloads.
- Refactor the `Execute` and `Compare` endpoints in `AlgorithmsController` to run asynchronously using `Task.Run` to prevent Kestrel thread starvation.
- Implement `IMemoryCache` in `AnalyticsController` to cache public system statistics (`GetOverview` for 2 minutes, `GetPopularModules` for 10 minutes) with a clamped query limit.
- Introduce two new built-in .NET rate limiting policies in `Program.cs`:
  - `"api"`: Fixed window of 60 requests per minute per IP for standard API endpoints.
  - `"heavy"`: Fixed window of 15 requests per minute per IP with immediate rejection (queue limit 0) for computation-heavy controllers.
- Apply `[EnableRateLimiting("heavy")]` to `AlgorithmsController`, `SOLIDController`, `OOPController`, `DIContainerController`, `SystemDesignController`, and `DesignPatternsController`.
- Apply `[EnableRateLimiting("api")]` to `AnalyticsController`.

**Consequences:**
- (+) Protected server resources by immediately rejecting oversized payload requests.
- (+) Mitigated Kestrel thread pool starvation under heavy loads by offloading CPU-intensive executions.
- (+) Reduced database load for public statistics queries using efficient caching.
- (+) Hardened api endpoints against denial of service and scraping with granular rate limits.
