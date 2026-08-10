# 🐛 DATN_ERRORS — Sổ Tay Lỗi Dự Án VisualizationDSA

> Sổ tay này ghi lại **tất cả lỗi phát hiện** trong dự án kể từ ngày khởi tạo (2026-08-09).
> Mọi lỗi mới phát hiện trong tương lai phải được thêm vào đây trước khi sửa.
> Sau khi sửa xong, chuyển trạng thái `OPEN` → `FIXED` (kèm commit hash nếu có) — **không xóa dòng**.

---

## 📌 Quy Ước

| Trường | Ý nghĩa |
|---|---|
| **ID** | Mã lỗi duy nhất. Tiền tố: `EC` (Execution Control), `IP` (Interactive Playground), `PS` (Pseudocode Sync), `QZ` (Quiz System), `CC` (Cross-cutting), `BK` (Backend) |
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

---

## 🗓️ Lịch Sử Cập Nhật

| Ngày | Nội dung |
|---|---|
| 2026-08-09 | Khởi tạo file. Nhập toàn bộ ~166 lỗi phát hiện từ đợt review 16 sub agent (4 feature × 4 góc nhìn: Logic Engine / Store-State / UI-UX / Test-Integration) |
| 2026-08-10 | **Chiến dịch fix 4 feature — 16 sub agent (4 batch × 4)**: Execution Control (EC-001→047) · Interactive Playground (IP-001→041) · Pseudocode Sync (PS-001→041) · Quiz System (QZ-001→052 + backend). Kết quả: frontend **2712/2712 test PASS**, backend **372/372 PASS** (build 0 lỗi). Chi tiết: fix nối dây thủ công (ticker advanceFrame, importGraph wiring, autoLayout action, isolated flash, QZ-003 `withAnswers=true` cho lesson/teacher/admin, HighlightIndices optional) + cập nhật 8 test pin hành vi cũ. Còn lại: QZ-048 ⏳ DEFERRED, CC-011 pre-existing type drift (dsa-modules). |
| 2026-08-10 (round 2) | **Fix Review Round 2 — 6/6 lỗi**: IP-042 toAdjacencyList directed (bug thật 🔴), IP-043 setZoomLevel action, IP-044 TODO stale, EC-048 BaseIcon chevron, EC-049 alias/hardcode vcrDefaults, QZ-053 stub BaseIcon (quizP2Tests + quizP0Tests — hết warning quiz-system). Kết quả: frontend **2713/2713 test PASS** (+1 test directed). Ghi nhận CC-012 (warning BaseIcon pre-existing ở dsa-modules/export-share/dashboard — ngoài scope). |
| 2026-08-10 (round 3 — deep) | **Fix Deep Review — 9/9 lỗi**: QZ-006 nối dây sync XP (🔴, +2 test), IP-045 toast ghi đè (🔴), IP-046 cache getComputedStyle, IP-047 dọn dead code resetZoom, IP-048/049 toast qua store + GraphView import feedback, EC-050 comment hợp đồng customCompileFn, QZ-054 clamp answers restore, QZ-055 action setBackendQuizError, QZ-056 reassignment. Kết quả: frontend **2715/2715 test PASS**. |

> **Quy tắc sử dụng:** Thêm lỗi mới vào cuối phần feature tương ứng (ID tăng dần). Sau khi sửa xong: đổi Status `OPEN` → `FIXED`, ghi commit/bằng chứng. Không xóa lỗi đã ghi.
