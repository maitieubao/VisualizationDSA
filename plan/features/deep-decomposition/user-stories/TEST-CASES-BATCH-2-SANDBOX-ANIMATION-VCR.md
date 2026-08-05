# 🧪 TEST CASES — BATCH 2: Algorithm Sandbox + Animation Engine + VCR

> Batch 2 cover: US-AS-001–043, US-AE-001–029, US-VR-001–012

---

## PHẦN A: Algorithm Sandbox (Sorting Visualizers)

### TC-AS-001: Chọn thuật toán sắp xếp
- **Story:** US-AS-001
- **Priority:** P0
- **Type:** component
- **Steps:** Mount SortingVisualizerDispatcher, chọn bubble
- **Expected:** BubbleSortVisualizer được mount
- **Evidence:** `SortingAlgorithmControls.vue:21-29`

### TC-AS-002: Xem 4 preset mảng
- **Story:** US-AS-002
- **Priority:** P1
- **Type:** component
- **Steps:** Kiểm tra 4 nút preset
- **Expected:** Ngẫu nhiên/Đã sắp xếp/Đảo ngược/Gần sort
- **Evidence:** `ArrayBarVisualizer.vue:20-28`

### TC-AS-003: Slider N (4-15)
- **Story:** US-AS-003
- **Priority:** P1
- **Type:** component
- **Steps:** Kéo slider
- **Expected:** Kích thước mảng thay đổi 4–15
- **Evidence:** `ArrayBarVisualizer.vue:30-40`

### TC-AS-004: Tab Sorting/Searching
- **Story:** US-AS-005
- **Priority:** P1
- **Type:** component
- **Steps:** Bấm tab Searching
- **Expected:** DSAPlayer mount với allowedCategories
- **Evidence:** `SortingView.vue:6-17`

### TC-AS-005: Empty state dispatcher
- **Story:** US-AS-007
- **Priority:** P2
- **Type:** component
- **Steps:** Mount khi frame null
- **Expected:** "Chưa có dữ liệu hoạt ảnh"
- **Evidence:** `SortingVisualizerDispatcher.vue:2-8`

### TC-AS-006: Progress bar
- **Story:** US-AS-009
- **Priority:** P2
- **Type:** component
- **Steps:** Chạy thuật toán
- **Expected:** Progress bar hiển thị %
- **Evidence:** `SortingProgressBar.vue:1-8`

### TC-AS-007: HUD overlay
- **Story:** US-AS-010
- **Priority:** P2
- **Type:** component
- **Steps:** Chạy thuật toán
- **Expected:** HUD hiển thị mô tả
- **Evidence:** `SortingHudOverlay.vue:1-13`

### TC-AS-008: Drawer Code & Trạng thái
- **Story:** US-AS-011
- **Priority:** P2
- **Type:** component
- **Steps:** Mở drawer
- **Expected:** Drawer trượt lên
- **Evidence:** `SortingDrawerTrace.vue:3-10`

### TC-AS-009: Tab Chi tiết/Bảng biến
- **Story:** US-AS-012
- **Priority:** P2
- **Type:** component
- **Steps:** Bấm tab Bảng biến
- **Expected:** SortingTraceTable hiển thị
- **Evidence:** `SortingDetailPanel.vue:6-16`

### TC-AS-010: Thông tin chi tiết
- **Story:** US-AS-013
- **Priority:** P2
- **Type:** component
- **Steps:** Xem panel detail
- **Expected:** Tên thuật toán, bước, so sánh, hoán đổi
- **Evidence:** `SortingDetailPanel.vue:19-33`

### TC-AS-011: Trace table
- **Story:** US-AS-014
- **Priority:** P1
- **Type:** component
- **Steps:** Chạy bubble-sort
- **Expected:** Bảng biến i, j, swaps, comparisons
- **Evidence:** `SortingTraceTable.vue:76-125`

### TC-AS-012: Click dòng trace → nhảy frame
- **Story:** US-AS-015
- **Priority:** P1
- **Type:** component
- **Steps:** Click dòng trong trace
- **Expected:** Frame thay đổi theo dòng
- **Evidence:** `SortingTraceTable.vue:30`

### TC-AS-013: Auto scroll active row
- **Story:** US-AS-016
- **Priority:** P2
- **Type:** component
- **Steps:** Chạy nhiều bước
- **Expected:** Dòng active tự scroll vào view
- **Evidence:** `SortingTraceTable.vue:172-179`

### TC-AS-014: Label so sánh theo thuật toán
- **Story:** US-AS-017
- **Priority:** P2
- **Type:** component
- **Steps:** Chọn counting-sort
- **Expected:** Label "A[0]→Count[1]"
- **Evidence:** `SortingDetailPanel.vue:75-86`

### TC-AS-015: Tab mặc định theo thuật toán
- **Story:** US-AS-018
- **Priority:** P2
- **Type:** component
- **Steps:** Chọn quick-sort
- **Expected:** Tab Chi tiết active
- **Evidence:** `SortingDetailPanel.vue:90-96`

### TC-AS-016: Bubble sort animation
- **Story:** US-AS-019
- **Priority:** P1
- **Type:** component
- **Steps:** Chạy bubble-sort
- **Expected:** Bar chuyển động swap
- **Evidence:** `BubbleSortVisualizer.vue:6-38`

### TC-AS-017: Màu bar theo trạng thái
- **Story:** US-AS-020
- **Priority:** P1
- **Type:** component
- **Steps:** Chạy bubble-sort
- **Expected:** default xám, compare vàng, swap đỏ, sorted xanh
- **Evidence:** `BubbleSortVisualizer.vue:94-104`

### TC-AS-018: Label chỉ số ≤ 12
- **Story:** US-AS-021
- **Priority:** P2
- **Type:** component
- **Steps:** Mảng 10 phần tử
- **Expected:** Label [0]...[9] hiển thị
- **Evidence:** `BubbleSortVisualizer.vue:30-36`

### TC-AS-019: Quick sort visualizer
- **Story:** US-AS-023
- **Priority:** P1
- **Type:** component
- **Steps:** Chạy quick-sort
- **Expected:** Ô vuông phân hoạch + pivot badge
- **Evidence:** `QuickSortVisualizer.vue:1-32`

### TC-AS-020: Hover tooltip quick sort
- **Story:** US-AS-024
- **Priority:** P2
- **Type:** component
- **Steps:** Hover phần tử
- **Expected:** Tooltip chỉ số, trạng thái, giá trị
- **Evidence:** `QuickSortVisualizer.vue:15-25`

### TC-AS-021: Merge sort tree view
- **Story:** US-AS-028
- **Priority:** P1
- **Type:** component
- **Steps:** Chạy merge-sort
- **Expected:** Cây tầng chia đoạn
- **Evidence:** `MergeSortVisualizer.vue:3-41`

### TC-AS-022: Heap sort tree + array
- **Story:** US-AS-032
- **Priority:** P1
- **Type:** component
- **Steps:** Chạy heap-sort
- **Expected:** HeapTree + HeapArray + badge BUILD/EXTRACT
- **Evidence:** `HeapSortVisualizer.vue:3-9`

### TC-AS-023: Radix sort components
- **Story:** US-AS-034
- **Priority:** P1
- **Type:** component
- **Steps:** Chạy radix-sort
- **Expected:** Banner, Array, Connector, Buckets, Inspector
- **Evidence:** `RadixSortVisualizer.vue:2-8`

### TC-AS-024: Counting sort components
- **Story:** US-AS-035
- **Priority:** P1
- **Type:** component
- **Steps:** Chạy counting-sort
- **Expected:** Banner, Legend, Array, Connector, Grid, Output
- **Evidence:** `CountingSortVisualizer.vue:2-16`

### TC-AS-025: Bucket sort components
- **Story:** US-AS-037
- **Priority:** P1
- **Type:** component
- **Steps:** Chạy bucket-sort
- **Expected:** Banner, Legend, Array, Connector, Grid, Output
- **Evidence:** `BucketSortVisualizer.vue:2-16`

### TC-AS-026: Stable ID animation
- **Story:** US-AS-039
- **Priority:** P1
- **Type:** unit
- **Steps:** Enrich input
- **Expected:** Mỗi phần tử có id unique
- **Evidence:** `sorting.types.ts:25-26`

### TC-AS-027: Fallback input lỗi
- **Story:** US-AS-040
- **Priority:** P1
- **Type:** unit
- **Steps:** Input không hợp lệ
- **Expected:** Fallback [45,12,85,32,9,60]
- **Evidence:** `useSortingAnimation.ts:57-71`

### TC-AS-028: Max 15 phần tử
- **Story:** US-AS-041
- **Priority:** P1
- **Type:** unit
- **Steps:** Input 20 phần tử
- **Expected:** Giới hạn 15
- **Evidence:** `useSortingAnimation.ts:13`

### TC-AS-029: Keyboard shortcuts
- **Story:** US-AS-042
- **Priority:** P1
- **Type:** integration
- **Steps:** Press Space/Arrow/R
- **Expected:** Play/Pause/Step/Reset
- **Evidence:** `SortingView.vue:73-97`

### TC-AS-030: Auto stop khi rời tab
- **Story:** US-AS-043
- **Priority:** P1
- **Type:** integration
- **Steps:** Chạy rồi rời tab
- **Expected:** Timer dừng
- **Evidence:** `SortingView.vue:113-115`

---

## PHẦN B: Animation Engine

### TC-AE-001: VisualizationPlayer tổng hợp
- **Story:** US-AE-001
- **Priority:** P1
- **Type:** component
- **Steps:** Mount VisualizationPlayer
- **Expected:** Canvas, CodePanel, InputForm, Explanation, Controls
- **Evidence:** `VisualizationPlayer.vue:3-36`

### TC-AE-002: CanvasLayer composition
- **Story:** US-AE-005
- **Priority:** P1
- **Type:** component
- **Steps:** Mount VisualizationCanvas
- **Expected:** CanvasLayer, LectureOverlay, QuizCardOverlay
- **Evidence:** `VisualizationCanvas.vue:2-28`

### TC-AE-003: Loading spinner
- **Story:** US-AE-003
- **Priority:** P2
- **Type:** component
- **Steps:** Set loading true
- **Expected:** Spinner overlay
- **Evidence:** `VisualizationCanvas.vue:4-6`

### TC-AE-004: HUD Step X/Y
- **Story:** US-AE-006
- **Priority:** P2
- **Type:** component
- **Steps:** Chạy animation
- **Expected:** "Step 3 / 10" ở góc trên
- **Evidence:** `AnimationHud.vue:2-12`

### TC-AE-005: Progress bar
- **Story:** US-AE-008
- **Priority:** P2
- **Type:** component
- **Steps:** Chạy animation
- **Expected:** Gradient cyan-blue progress
- **Evidence:** `AnimationProgressBar.vue:1-9`

### TC-AE-006: VcrButtonsRow
- **Story:** US-AE-011
- **Priority:** P0
- **Type:** component
- **Steps:** Click StepBack/Play/StepForward
- **Expected:** Controls hoạt động
- **Evidence:** `VcrButtonsRow.vue:4-33`

### TC-AE-007: Play icon change
- **Story:** US-AE-012
- **Priority:** P2
- **Type:** component
- **Steps:** Play → Pause
- **Expected:** Icon đổi play↔pause↔restart
- **Evidence:** `VcrButtonsRow.vue:16-24`

### TC-AE-008: Timeline scrubber
- **Story:** US-AE-013
- **Priority:** P1
- **Type:** component
- **Steps:** Kéo scrubber
- **Expected:** Frame tua
- **Evidence:** `AnimTimelineSlider.vue:9-13`

### TC-AE-009: Tooltip scrubber
- **Story:** US-AE-014
- **Priority:** P2
- **Type:** component
- **Steps:** Hover scrubber
- **Expected:** "Bước X: mô tả"
- **Evidence:** `AnimTimelineSlider.vue:16-19`

### TC-AE-010: Speed presets
- **Story:** US-AE-015
- **Priority:** P2
- **Type:** component
- **Steps:** Chọn speed
- **Expected:** 0.25x–10x
- **Evidence:** `AnimControlPanel.vue:35-39`

### TC-AE-011: PseudocodePanel
- **Story:** US-AE-018
- **Priority:** P1
- **Type:** component
- **Steps:** Chạy animation
- **Expected:** Dòng active highlight cyan
- **Evidence:** `AnimPseudoCodePanel.vue:1-21`

### TC-AE-012: ExplanationPanel
- **Story:** US-AE-020
- **Priority:** P1
- **Type:** component
- **Steps:** Chạy animation
- **Expected:** Giải thích frame hiện tại
- **Evidence:** `ExplanationPanel.vue:1-12`

### TC-AE-013: Keyboard shortcuts
- **Story:** US-AE-022
- **Priority:** P1
- **Type:** integration
- **Steps:** Press Space/Arrow/R/Escape
- **Expected:** Play/Step/Reset/Stop
- **Evidence:** `usePlaybackHotkeys.ts:17-56`

### TC-AE-014: Interaction lock
- **Story:** US-AE-023
- **Priority:** P2
- **Type:** component
- **Steps:** Set disabled
- **Expected:** opacity 0.5, pointer-events none
- **Evidence:** `AnimControlPanel.vue:2-3`

### TC-AE-015: Canvas auto resize
- **Story:** US-AE-024
- **Priority:** P1
- **Type:** integration
- **Steps:** Resize container
- **Expected:** Canvas resize + devicePixelRatio
- **Evidence:** `useAnimationCanvas.ts:125-148`

### TC-AE-016: Animation mượt easeOut
- **Story:** US-AE-025
- **Priority:** P1
- **Type:** integration
- **Steps:** Play animation
- **Expected:** Lerp mượt 60fps
- **Evidence:** `useAnimationCanvas.ts:36-52`

### TC-AE-017: Màu bar theo trạng thái
- **Story:** US-AE-026
- **Priority:** P1
- **Type:** component
- **Steps:** Play sort animation
- **Expected:** default/compare/swap/sorted colors
- **Evidence:** `useAnimationCanvas.ts:27-34`

### TC-AE-018: Quiz summary
- **Story:** US-AE-027
- **Priority:** P1
- **Type:** component
- **Steps:** Hoàn tất checkpoints
- **Expected:** QuizSummaryCard hiển thị
- **Evidence:** `VisualizationCanvas.vue:12-18`

### TC-AE-019: Retry quiz
- **Story:** US-AE-028
- **Priority:** P2
- **Type:** component
- **Steps:** Bấm retry
- **Expected:** Quiz restart
- **Evidence:** `VisualizationPlayer.vue:82-88`

### TC-AE-020: AnimationVcrControls standalone
- **Story:** US-AE-029
- **Priority:** P1
- **Type:** component
- **Steps:** Mount AnimationVcrControls
- **Expected:** Stop/StepBack/Play/StepForward/scrubber/speed
- **Evidence:** `AnimationVcrControls.vue:1-48`

### TC-AE-021: Indicator trạng thái
- **Story:** US-AE-010
- **Priority:** P2
- **Type:** component
- **Steps:** Play/Pause/Finish
- **Expected:** xám/cyan pulse/xanh lá
- **Evidence:** `AnimControlPanel.vue:44-53`

### TC-AE-022: Persist speed
- **Story:** US-AE-017
- **Priority:** P2
- **Type:** integration
- **Steps:** Chọn speed, reload
- **Expected:** Speed được restore
- **Evidence:** `AnimControlPanel.vue:88-91`

---

## PHẦN C: VCR Player

### TC-VR-001: VcrDockBar đầy đủ
- **Story:** US-VR-001
- **Priority:** P0
- **Type:** component
- **Steps:** Mount VcrDockBar
- **Expected:** speed/step/play/reset/scrubber/counter
- **Evidence:** `VcrDockBar.vue:2-83`

### TC-VR-002: Chọn tốc độ
- **Story:** US-VR-002
- **Priority:** P2
- **Type:** component
- **Steps:** Select 2x
- **Expected:** Speed = 2
- **Evidence:** `VcrDockBar.vue:9-15`

### TC-VR-003: Play ↔ Pause toggle
- **Story:** US-VR-003
- **Priority:** P0
- **Type:** component
- **Steps:** Click Play
- **Expected:** Icon đổi Pause
- **Evidence:** `VcrDockBar.vue:35-43`

### TC-VR-004: Scrubber + counter
- **Story:** US-VR-004
- **Priority:** P1
- **Type:** component
- **Steps:** Kéo scrubber
- **Expected:** "X/Y" thay đổi
- **Evidence:** `VcrDockBar.vue:70-81`

### TC-VR-005: Reset
- **Story:** US-VR-005
- **Priority:** P1
- **Type:** component
- **Steps:** Click reset
- **Expected:** Frame về 0
- **Evidence:** `VcrDockBar.vue:57-65`

### TC-VR-006: Step Next disabled ở cuối
- **Story:** US-VR-006
- **Priority:** P1
- **Type:** component
- **Steps:** Đến frame cuối
- **Expected:** Nút disabled
- **Evidence:** `VcrDockBar.vue:47-48`

### TC-VR-007: Error alert
- **Story:** US-VR-007
- **Priority:** P1
- **Type:** component
- **Steps:** Trigger error
- **Expected:** Alert hiển thị
- **Evidence:** `useVcrStore.ts:82-84`

### TC-VR-008: Default bubble sort
- **Story:** US-VR-008
- **Priority:** P1
- **Type:** component
- **Steps:** Init store
- **Expected:** Code = bubble sort template
- **Evidence:** `vcrDefaults.ts:5-20`

### TC-VR-009: Default input
- **Story:** US-VR-009
- **Priority:** P2
- **Type:** component
- **Steps:** Init store
- **Expected:** Input = "45,12,85,32,9,60"
- **Evidence:** `useVcrStore.ts:28`

### TC-VR-010: Disabled khi no frames
- **Story:** US-VR-010
- **Priority:** P1
- **Type:** component
- **Steps:** totalFrames = 0
- **Expected:** All controls disabled
- **Evidence:** `VcrDockBar.vue:26-27`

### TC-VR-011: Looping
- **Story:** US-VR-011
- **Priority:** P2
- **Type:** integration
- **Steps:** Bật loop, play hết
- **Expected:** Tự phát lại từ đầu
- **Evidence:** `useVcrStore.ts:38`

### TC-VR-012: Custom compile
- **Story:** US-VR-012
- **Priority:** P2
- **Type:** integration
- **Steps:** Set customCompileFn
- **Expected:** Compile dùng custom fn
- **Evidence:** `useVcrStore.ts:55`
