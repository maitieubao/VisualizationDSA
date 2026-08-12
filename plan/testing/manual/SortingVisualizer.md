# 📊 Sorting Visualizer (7 thuật toán) — Hướng dẫn Manual Test

## 📋 Tổng quan
- **Scope:** `frontend/src/features/algorithm-sandbox/**` (7 engine `algorithms/*.ts`: bubble/selection/insertion/quick/merge/heap + counting/radix/bucket, useSortingAnimation, 4 composable, sortingIdEnricher, PseudocodeSyncer, MonacoLineSyncerCoordinator, MonacoGutterClickInterceptor, 20+ component visualizer) + `views/sorting/SortingView.vue` (route `/sorting`)
- **Trạng thái:** ✅ DoD (round 12 — 44/44 lỗi đã fix)
- **Test tự động:** Frontend 3058/3058 pass (sorting 99 → 215 test) · `vue-tsc -b` 0 lỗi · Backend 507/507 (không đụng)
- **Môi trường test:** Trình duyệt Chromium mới nhất, viewport ≥ 1280px; route `/sorting`
- **Ghi chú:** 7 engine gồm **Bubble Sort, Selection Sort, Insertion Sort, Quick Sort, Merge Sort, Heap Sort, Counting Sort** (Radix/Bucket dùng kèm renderer riêng theo trường hợp; danh sách nút thuật toán hiển thị trong `SortingAlgorithmControls`)

---

## 👤 User Stories

### US-SV-001: Chọn thuật toán và nhập mảng
- **Vai trò:** Student / Khách
- **Mục tiêu:** Người học chọn 1 trong 7 thuật toán, nhập mảng số và bắt đầu mô phỏng.
- **Chấp nhận:** (1) 7 nút thuật toán hiển thị, nút đang chọn có `aria-pressed`; (2) input mảng validate (số nguyên, dấu phẩy/phân tách), mảng rỗng hoặc 1 phần tử xử lý hợp lý; (3) đổi input giữa lúc đang chạy → reset frames đúng.

### US-SV-002: Chạy animation với VCR Playback
- **Vai trò:** Student / Khách
- **Mục tiêu:** Play/Pause/Step/Scrub/Replay animation từng frame.
- **Chấp nhận:** (1) Play chạy tuần tự frame, dừng ở frame cuối; (2) bấm Play ở frame cuối → Replay từ đầu; (3) kéo slider tự pause và "đỗ" đúng frame; (4) speed clamp 0.1x–5.0x.

### US-SV-003: Đồng bộ pseudocode + Monaco gutter click
- **Vai trò:** Student / Khách
- **Mục tiêu:** Pseudocode highlight dòng đang thực thi; click gutter nhảy đúng frame tương ứng.
- **Chấp nhận:** (1) Mọi frame đều có dòng pseudocode active (currentLineNumber > 0) — phủ cả 7 engine; (2) click số dòng ở gutter → jump đến frame **gần nhất** của dòng đó; (3) highlight multi-line (ví dụ Java 3 dòng swap cùng sáng).

### US-SV-004: Xem trace table chi tiết
- **Vai trò:** Student / Khách
- **Mục tiêu:** Theo dõi biến, chỉ số so sánh và mô tả từng bước.
- **Chấp nhận:** (1) Trace table cập nhật theo từng frame (vars/description); (2) điều hướng bàn phím (Enter/Arrow) hoạt động trên row; (3) mảng được đánh dấu sorted đúng ở frame cuối.

### US-SV-005: Xử lý edge case mảng
- **Vai trò:** Student / Khách
- **Mục tiêu:** Mảng rỗng/1 phần tử/trùng giá trị/đã sorted/reversed đều mô phỏng đúng.
- **Chấp nhận:** (1) Mảng 1 phần tử → kết quả đúng, `sortedIndices` đánh dấu đầy đủ; (2) mảng rỗng → không crash, UI báo hợp lý; (3) mảng trùng giá trị không gán sai identity (FLIP animation merge đúng).

---

## 🧪 Test Cases

### TC-SV-001: 7 thuật toán chạy đúng + pseudocode highlight hoạt động (P0)
- **Chuẩn bị:** Vào `/sorting`; input mảng mặc định (hoặc `[5,3,8,1,2]`).
- **Các bước:**
  1. Chọn từng thuật toán trong 7 engine (Bubble → Selection → Insertion → Quick → Merge → Heap → Counting).
  2. Mỗi lần bấm Play, theo dõi pseudocode panel.
  3. Ở frame bất kỳ, đối chiếu dòng pseudocode sáng với highlight trên mảng.
- **Kết quả mong đợi:** (1) Cả 7 thuật toán chạy hoàn tất, mảng kết quả được sắp xếp đúng (ascending); (2) **pseudocode luôn highlight đúng dòng đang thực thi ở MỌI frame** (contract CC-009: `lineNumber > 0` + `activeLogicalLineId` + `highlights.compare ≡ comparingIndices`); (3) không engine nào có frame `currentLineNumber = 0`; (4) sau frame cuối, toàn bộ mảng được đánh dấu sorted.
- **Verify regression:** **SV-002** (lỗi P0 — 7 engine thiếu contract CC-009 nên pseudocode highlight + gutter click chết im lặng: đã fix thêm `lineNumber`/`activeLogicalLineId`/`highlights` vào SortFrame cho cả 7 engine).

### TC-SV-002: Gutter click Monaco → jump đúng frame gần nhất (P1)
- **Chuẩn bị:** Bảng pseudocode hiển thị dạng Monaco editor có số dòng (gutter).
- **Các bước:**
  1. Chạy 1 thuật toán (ví dụ Bubble Sort) với mảng ~10 phần tử.
  2. Click số dòng ở gutter của 1 dòng lặp (dòng được thực thi nhiều lần, ví dụ vòng `for` trong).
  3. Quan sát frame hiện tại + thanh slider.
  4. Click chuột **phải** vào gutter.
- **Kết quả mong đợi:** (1) Jump đến frame **gần nhất** của dòng đó (không phải frame đầu tiên khớp dòng); (2) slider + counter cập nhật đúng; (3) click phải KHÔNG jump (guard `e.event.button`); (4) khi dòng không tồn tại trong frame → không jump (no-op an toàn).
- **Verify regression:** **SV-007** (gutter click luôn nhảy frame đầu tiên khớp line — đã fix: tìm frame gần nhất + snap span) + **SV-023** (click phải cũng jump — đã fix guard).

### TC-SV-003: Merge Sort FLIP animation trộn mảng (P1)
- **Chuẩn bị:** Chọn Merge Sort, mảng không trùng giá trị, ví dụ `[4,2,7,1,9,3,6,5]`.
- **Các bước:**
  1. Play và quan sát giai đoạn merge (các mảng con nhỏ gộp thành mảng lớn).
  2. Chú ý từng phần tử khi "trộn" từ mảng trái/phải.
  3. Lặp lại với mảng có giá trị **trùng** (ví dụ `[5,3,5,3,2]`).
- **Kết quả mong đợi:** (1) Phần tử di chuyển theo **identity** (giá trị trùng không đổi chỗ nhau lung tung) — animation FLIP mượt, không "nhảy tại chỗ"; (2) các thanh trượt vào vị trí đúng của chúng trong mảng hợp nhất; (3) mảng trùng giá trị vẫn sắp xếp đúng và không gán sai identity.
- **Verify regression:** **SV-003** (FLIP animation Merge chết do key theo vị trí — đã fix: key theo `item.id`) + **SV-017** (greedy duplicate `[5,3,5,3,2]`).

### TC-SV-004: Replay ở frame cuối (P1)
- **Chuẩn bị:** Chạy hết 1 thuật toán đến frame cuối.
- **Các bước:**
  1. Đợi animation về frame cuối (hoặc bấm Next tới hết).
  2. Bấm nút Play.
  3. Quan sát nút + counter.
- **Kết quả mong đợi:** Ở frame cuối, nút Play đổi thành nút **Replay** (icon refresh, title "Phát lại từ đầu"); bấm → quay về frame 0 và phát lại từ đầu; counter về `1/total`; sau khi về frame 0 nút lại về dạng Play.
- **Verify regression:** EC-003 (nút Play "chết" ở frame cuối thiếu Replay) + EC-004.

### TC-SV-005: Đổi input giữa lúc đang chạy → reset đúng (P1)
- **Chuẩn bị:** Đang Play thuật toán với mảng A (`[5,3,8,1,2]`).
- **Các bước:**
  1. Đang phát (isPlaying = true), sửa input thành mảng B (`[9,4,6,2,7]`) ngay lập tức.
  2. Không dừng tay, bấm Play/Chạy.
  3. Quan sát frames + slider + pseudocode.
- **Kết quả mong đợi:** (1) Frames cũ của mảng A bị hủy hoàn toàn — không frame cũ xen lẫn frame mới; (2) slider reset về 0, counter khớp frame mới; (3) VCR không "đếm cũ" (tránh lệch frame dock); (4) nếu đang Play → playback mới chạy với mảng B (hoặc dừng chờ bấm Play tùy spec, nhưng KHÔNG đứt đoạn vô nghĩa).
- **Verify regression:** **SV-014** (race đổi input giữa playback — đã fix: invalidate + reset) + **SV-005** (generator throw giữ frame cũ) + **SV-034** (setRawInputArray action thay mutation trực tiếp).

### TC-SV-006: Trace table điều hướng bằng bàn phím (P2)
- **Chuẩn bị:** Đang chạy 1 thuật toán bất kỳ, panel trace table (bảng chi tiết) hiển thị.
- **Các bước:**
  1. Focus vào bảng trace (hoặc dùng Tab để vào).
  2. Dùng phím Enter/Arrow lên xuống để di chuyển.
  3. Quan sát slider/frame có nhảy theo không.
  4. Khi đang Play, để ý độ mượt của scroll.
- **Kết quả mong đợi:** (1) Row trong bảng focus được bằng bàn phím (không bị trơ); (2) điều hướng keyboard làm frame nhảy tương ứng; (3) a11y đầy đủ (th có `scope`, bảng có caption); (4) scroll chỉ nhảy khi user tương tác (không tự cuộn giật mỗi frame khi Play).
- **Verify regression:** **SV-031** (trace table thiếu a11y + không điều hướng bàn phím — đã fix) + **SV-038** (smooth scroll mỗi frame → jank: đã fix chỉ scroll khi user jump).

### TC-SV-007: Mảng rỗng → không crash, báo hợp lý (P2)
- **Chuẩn bị:** Input mảng để trống (hoặc `[]`).
- **Các bước:**
  1. Nhập mảng rỗng.
  2. Bấm Play/Chạy.
- **Kết quả mong đợi:** Không crash, không RangeError; UI báo hợp lý (toast/empty state tiếng Việt); VCR counter hiển thị `0/0` (hoặc trạng thái chưa có frame) — không hiển thị `1/0`; bảng trace không hiển thị dữ liệu ma.
- **Verify regression:** **SV-004** (biên mảng rỗng trong matrix 42 cell) + **SV-026** ("–/0" thay vì "1/0" khi chưa có frame).

### TC-SV-008: Mảng 1 phần tử → đúng + đánh dấu sorted (P1)
- **Chuẩn bị:** Input `[7]`.
- **Các bước:**
  1. Chọn Merge Sort, nhập `[7]`, Play.
  2. Quan sát frame cuối + màu đánh dấu sorted.
  3. Lặp lại nhanh với 2-3 thuật toán khác.
- **Kết quả mong đợi:** (1) Chạy hoàn tất không crash; (2) **frame cuối đánh dấu `sortedIndices = [0]`** — phần tử duy nhất được tô sorted (không phải `[]`); (3) kết quả mảng `[7]` đúng.
- **Verify regression:** **SV-004** (bug nguồn merge n=1 không đánh dấu sorted — đã fix + test `[7] → sortedIndices=[0]`).

### TC-SV-009: Mảng trùng giá trị lớn (P2)
- **Chuẩn bị:** Mảng nhiều phần tử trùng, ví dụ `[5,3,5,3,2,5,3,5]`.
- **Các bước:**
  1. Chạy Merge Sort rồi Heap Sort.
  2. Quan sát highlight + identity các phần tử trùng.
- **Kết quả mong đợi:** (1) Kết quả sorted đúng (stable/tất cả trùng vị trí hợp lý); (2) greedy matching không gán sai id (phần tử trùng không bị hoán đổi lung tung giữa các frame — enricher Map O(n log k)); (3) không có frame "tự so sánh" lạ (comparingIndices `[i,i]`) ở renderer bucket.
- **Verify regression:** **SV-017** (greedy duplicate chưa test — đã fix) + **SV-009** (enricher O(n²) → O(n log k)) + **SV-027** (bucket self-compare label).

### TC-SV-010: Mảng đã sorted / reversed (P2)
- **Chuẩn bị:** Input `[1,2,3,4,5]` và `[5,4,3,2,1]`.
- **Các bước:**
  1. Chạy Bubble Sort với mảng đã sorted — đếm frame.
  2. Chạy với mảng reversed — đếm frame.
  3. Chạy thử 1 thuật toán khác (vd Quick Sort) với cả 2 mảng.
- **Kết quả mong đợi:** (1) Bubble Sort có early-exit: mảng sorted chạy ít frame hơn hẳn reversed (không phải luôn O(n²)); (2) mọi engine đều cho kết quả đúng; (3) mảng 100 phần tử reversed chạy dưới ngưỡng frame (perf, < 20000 frame).
- **Verify regression:** **SV-018** (bubble không early-exit — đã fix) + **SV-012/013** (matrix 42 cell + perf 100 × 7 engine).

### TC-SV-011: Kéo slider (scrub) → tự pause + đỗ đúng frame (P1)
- **Chuẩn bị:** Đang Play thuật toán.
- **Các bước:**
  1. Bấm Play, sau 1-2 giây kéo slider đến frame bất kỳ (ví dụ frame 20).
  2. Nhả chuột, quan sát frame.
- **Kết quả mong đợi:** (1) Vừa chạm slider → tự động pause (icon chuyển Play); (2) sau khi nhả chuột, frame "đỗ" đúng vị trí 20 — không bị ticker đẩy tiếp 21, 22; (3) kéo nhanh không jank (throttle 33ms); (4) counter + pseudocode + trace đồng bộ với frame.
- **Verify regression:** EC-001 (scrub không auto-pause → race ticker) + EC-013 (thiếu mousedown pause/throttle).

### TC-SV-012: Phím tắt Space / Arrow (P2)
- **Chuẩn bị:** Focus không nằm trong ô input.
- **Các bước:**
  1. Bấm giữ **Space** — quan sát nút Play.
  2. Bấm **ArrowRight/ArrowLeft** — quan sát frame.
  3. Focus vào ô nhập mảng rồi bấm Space lần nữa.
- **Kết quả mong đợi:** (1) Space toggle Play/Pause, giữ phím KHÔNG nhấp nháy liên tục (guard `e.repeat`); (2) Arrow step frame, có debounce 100ms chống spam; (3) khi focus trong ô input, Space không điều khiển playback (guard input); (4) phím `R` reset, `Ctrl+Alt+R` (algo playground) không xung đột.
- **Verify regression:** EC-025 (giữ Space rung nhấp nháy — đã fix e.repeat) + EC-036 (hotkey check interactionLocked).

### TC-SV-013: Tốc độ phát 0.1x – 5.0x (P2)
- **Chuẩn bị:** Đang chạy 1 thuật toán dài (≥ 50 frame).
- **Các bước:**
  1. Mở dropdown tốc độ; thử từng mức: 0.1, 0.25, 0.5, 1, 1.5, 2, 4, 5.
  2. Đổi tốc độ **giữa lúc đang Play**.
- **Kết quả mong đợi:** (1) Danh sách đúng các mức, không có 10x; (2) tốc độ thay đổi tức thì khi Play; (3) 0.1x chạy chậm rõ rệt, 5.0x nhanh nhưng không rung/jank; (4) không có giá trị ngoài 0.1–5.0 (clamp).
- **Verify regression:** EC-006 (speed không clamp → Infinity/NaN) + EC-007 (option 10x vượt spec — đã fix dùng `SPEED_PRESETS`).

### TC-SV-014: Pseudocode multi-line — 3 dòng swap cùng sáng (P2)
- **Chuẩn bị:** Chọn thuật toán có phiên bản Java 3 dòng swap (nếu UI có selector ngôn ngữ) hoặc 1 pseudocode nhiều dòng khớp cùng logicalId.
- **Các bước:**
  1. Chạy thuật toán đến frame có thao tác swap.
  2. Quan sát các dòng pseudocode tương ứng.
  3. Đối chiếu highlight với `activeLogicalLineId`.
- **Kết quả mong đợi:** Khi 1 logical line ánh xạ nhiều dòng vật lý (vd SWAP = 3 dòng), **tất cả các dòng đó sáng đồng thời**; highlight dừng đúng khi frame chuyển; badge occurrence (nếu có) hiển thị đúng dòng active; khi speed ≥ 2.0 highlight không giật (debounce 50ms).
- **Verify regression:** PS-006 (highlight debounce khi speed cao) + PS-011 (multi-line mapping).

---

## 📊 Tổng kết bộ test

| Hạng mục | Số lượng |
| :--- | :--- |
| User Stories | 5 (US-SV-001 → 005) |
| Test Cases | 14 (TC-SV-001 → 014) — P0: 1 · P1: 6 · P2: 7 |
| Lỗi P0/P1 verify regression | SV-002 (CC-009), SV-007, SV-023, SV-003, SV-017, EC-003, EC-004, SV-014, SV-005, SV-034, SV-031, SV-038, SV-004, SV-026, SV-009, SV-027, SV-018, SV-012, SV-013, EC-001, EC-013, EC-025, EC-036, EC-006, EC-007, PS-006 |
