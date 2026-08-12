# ⚙️ Algo Playground + Custom Input — Hướng dẫn Manual Test

## 📋 Tổng quan
- **Scope:** `frontend/src/features/algo-playground/**` (3 SortingAnimationEngine, AlgoInputParser, compileErrorTranslator, playgroundAlgoDemos, useAlgoPlaygroundStore, useAlgoAnimation, algoCanvasHelpers, AlgoPlaygroundWorkspace) + `frontend/src/features/custom-input/**` (useInputStore, useCustomInputForm, CustomInputForm) — route `/playground` (mode Algo)
- **Trạng thái:** ✅ DoD (Review Round 11 — 48/49 lỗi AL-001 → AL-049 đã fix; AL-042 PARTIAL dead code test-pin, không ảnh hưởng hành vi)
- **Test tự động:** 2942/2942 frontend pass (161 files) + `vue-tsc` 0 lỗi; Algo Playground suite 120 → 151 tests (useAlgoAnimation 11 + algoCanvasHelpers 10 mới)
- **Môi trường:** Chrome/Edge bản mới, desktop ≥ 1280px + mobile 390px; chạy thuần client (worker compile), không cần backend.

## 👤 User Stories

### US-AL-001: Chọn thuật toán và nhập input tùy ý để chạy animation
- **Vai trò:** Sinh viên học sắp xếp/tìm kiếm
- **Mục tiêu:** Chọn thuật toán từ demo hoặc dropdown, nhập mảng input, bấm Play để xem animation từng frame
- **Chấp nhận:** Play khi chưa compile → tự compile rồi phát; sửa input rồi Play → phát frames MỚI (không phát frames cũ); input không hợp lệ bị chặn có thông báo.

### US-AL-002: Điều khiển playback bằng phím tắt Space và menu
- **Vai trò:** Sinh viên xem animation lặp đi lặp lại
- **Mục tiêu:** Space bật/tắt play nhanh; Esc đóng dropdown; tổ hợp Ctrl+Alt+R tạo input ngẫu nhiên
- **Chấp nhận:** Phím tắt không gây tác dụng phụ khi rời tab/mode khác; Esc không xóa dữ liệu đang gõ.

### US-AL-003: Nạp Custom Input từ form và chạy nhiều lần
- **Vai trò:** Sinh viên muốn nhập input lớn/thuật toán giới hạn phần tử
- **Mục tiêu:** Nhập input qua Custom Input Form, chạy nhanh liên tiếp nhiều lần mà không bị kết quả cũ ghi đè
- **Chấp nhận:** Chạy 2 lần nhanh không race (response cũ bị hủy); giới hạn phần tử hiển thị đúng theo thuật toán.

### US-AL-004: Chạy demo có sẵn và chia sẻ
- **Vai trò:** Sinh viên khám phá nhanh các thuật toán
- **Mục tiêu:** Nạp demo từ danh sách, share link chứa demo
- **Chấp nhận:** Link `?demo=` được ưu tiên nạp; chuyển demo giữa lúc compile không bị stale frames.

## 🧪 Test Cases

### TC-AL-001: Bấm Play khi chưa compile → tự compile rồi play (P0)
- **Chuẩn bị:** Mở `/playground` mode Algo; chọn thuật toán Bubble Sort; đảm bảo chưa bấm Run/compile lần nào (frames rỗng).
- **Các bước:**
  1. Bấm nút **Play ▶** ngay lập tức (chưa có frames).
  2. Quan sát: có spinner/trạng thái compile, sau đó animation tự chạy (không cần bấm Play lần 2).
  3. Chờ animation chạy tới frame cuối.
- **Kết quả mong đợi:** Play kích hoạt compile; khi frames về, engine tự động play (watcher frames: `isPlaying ? engine.play()`); nút không bị "treo" ở trạng thái play nhưng engine đứng im frame 0.
- **Verify regression:** AL-003 (race Play→compile→auto-play), AL-028 (pendingPlayAfterCompile).

### TC-AL-002: Đổi demo giữa lúc compile → không bị frames cũ ghi đè (P1)
- **Chuẩn bị:** Mở `/playground` mode Algo; chọn demo Bubble Sort input lớn (compile chậm).
- **Các bước:**
  1. Bấm **Run** (compile đang chạy).
  2. Ngay lập tức chuyển demo sang Merge Sort.
  3. Chờ compile xong; quan sát canvas + caption.
  4. Bấm Play.
- **Kết quả mong đợi:** Kết quả cuối cùng là frames của Merge Sort (demo mới), không phải frames cũ của Bubble Sort chèn vào sau; không xảy ra autoplay bất ngờ của dataset cũ.
- **Verify regression:** AL-004 (runSeq++ + pendingPlay reset), AL-014 (?demo= ưu tiên URL).

### TC-AL-003: Sửa input → Play phát frames MỚI (P0)
- **Chuẩn bị:** Mở `/playground` mode Algo; chọn Selection Sort; Run với input `[5,3,8,1]`; Play tới giữa chừng rồi Pause.
- **Các bước:**
  1. Sửa input thành `[9,2,7]` trong ô nhập.
  2. Bấm **Play** (không bấm Run).
  3. Quan sát mảng hiển thị và các frame phát.
- **Kết quả mong đợi:** Play phát frames mới của `[9,2,7]`; không phát lại frames cũ của `[5,3,8,1]` (setInput invalidate → compile lại).
- **Verify regression:** AL-005 (setInput invalidate), AL-045 (auto-run chỉ khi đổi).

### TC-AL-004: Parser chặn Infinity / số quá lớn (P2)
- **Chuẩn bị:** Mở `/playground` mode Algo; chọn Quick Sort.
- **Các bước:**
  1. Nhập input `[1, Infinity, 2]` → bấm **Run**.
  2. Nhập `[1, -Infinity]` → Run.
  3. Nhập `[1e999]` → Run.
- **Kết quả mong đợi:** Cả 3 case bị từ chối (toast/lỗi parser, không sinh frames); không có bar vẽ méo/NaN trên canvas; thông báo lỗi tiếng Việt rõ ràng.
- **Verify regression:** AL-010 (parser chặn Infinity/1e999).

### TC-AL-005: Input rỗng bị chặn, không chạy được (P2)
- **Chuẩn bị:** Mở `/playground` mode Algo; chọn Counting Sort.
- **Các bước:**
  1. Để trống ô input → bấm **Run/Chạy**.
  2. Nhập `, ,` hoặc khoảng trắng → Run.
  3. Nhập hợp lệ `[3,1,2]` → Run (đối chứng).
- **Kết quả mong đợi:** Input rỗng/`, ,` bị chặn với thông báo (không chạy, không sinh 1 frame vô nghĩa); không xuất hiện lỗi RangeError tiếng Anh "Invalid array length"; input hợp lệ chạy bình thường.
- **Verify regression:** AL-011 (input rỗng + Counting Sort), AL-044 (chặn input trống).

### TC-AL-006: Lỗi compile → toast + nút Play không bị treo (P1)
- **Chuẩn bị:** Mở `/playground` mode Algo; chọn Heap Sort.
- **Các bước:**
  1. Nhập input `[abc]` (không phải số) → bấm **Run**.
  2. Quan sát thông báo lỗi + trạng thái nút Play/Pause.
  3. Nhập input hợp lệ `[5,2,8]` → Run.
- **Kết quả mong đợi:** Toast lỗi compile rõ ràng (tiếng Việt, không phải message Anh thô); nút Play không hiển thị trạng thái "đang phát" treo với timeline rỗng; sau khi sửa input hợp lệ chạy bình thường.
- **Verify regression:** AL-012 (error path reset isPlaying), AL-013 (compileErrorTranslator +4 case).

### TC-AL-007: Phím Space khi rời tab/mode không ảnh hưởng (P1)
- **Chuẩn bị:** Mở `/playground` mode Algo; Play một animation.
- **Các bước:**
  1. Đang play → bấm chuyển sang mode HTML/Free (editor tự do).
  2. Nhấn Space vài lần trong editor HTML.
  3. Quay lại mode Algo.
  4. Mở tab khác của trình duyệt (rời tab) khi đang play, chờ 3 giây, quay lại.
- **Kết quả mong đợi:** Khi ở mode khác, Space không bật/tắt animation ẩn (handler bị gỡ khi KeepAlive deactivate); khi quay lại mode Algo, playback đồng bộ trạng thái store; khi rời tab, engine không chạy rAF 60FPS nền (CPU không tăng, playback không "trôi xa" khi quay lại).
- **Verify regression:** AL-001 (KeepAlive gỡ phím tắt), AL-002 (onDeactivated pause engine).

### TC-AL-008: Custom Input — chạy 2 lần nhanh không bị race (P1)
- **Chuẩn bị:** Mở Custom Input Form (nút mở form trong `/playground` mode Algo); chọn thuật toán Merge Sort.
- **Các bước:**
  1. Nhập input `[10,9,8,7,6,5,4,3,2,1]` → bấm **Chạy**.
  2. Ngay khi đang chạy (chưa xong), đổi input thành `[1,2,3]` và bấm **Chạy** lần 2 nhanh.
  3. Chờ cả 2 kết thúc; quan sát canvas/loadResult cuối.
  4. Trong lúc isLoading, kiểm tra nút **Xóa Trắng** bị disabled.
- **Kết quả mong đợi:** Kết quả cuối là của lần chạy thứ 2 (`[1,2,3]`), response cũ không ghi đè (requestId + AbortController); nút Xóa Trắng disabled khi đang tải; không xung đột khi chạy nhanh liên tiếp.
- **Verify regression:** AL-006 (requestId + AbortController), AL-024 (wiring algorithmId).

### TC-AL-009: Esc chỉ đóng dropdown, không xóa textarea (P1)
- **Chuẩn bị:** Mở Custom Input Form; nhập input `[4,1,6]` vào textarea.
- **Các bước:**
  1. Mở dropdown (nếu có — ví dụ dropdown lịch sử/hooks).
  2. Nhấn **Esc**.
  3. Kiểm tra textarea.
  4. Mở lại dropdown, gõ vài ký tự trong ô tìm kiếm dropdown rồi Esc.
- **Kết quả mong đợi:** Esc chỉ đóng dropdown; textarea input vẫn còn nguyên `[4,1,6]` (không bị xóa sạch mất dữ liệu vô tình).
- **Verify regression:** AL-015 (Esc chỉ đóng dropdown), AL-043 (popover Esc close).

### TC-AL-010: Ctrl+Alt+R tạo input ngẫu nhiên (P2)
- **Chuẩn bị:** Mở `/playground` mode Algo; ô input đang trống.
- **Các bước:**
  1. Nhấn tổ hợp **Ctrl+Alt+R**.
  2. Quan sát ô input được điền.
  3. Nhấn lại 2 lần nữa, so sánh các giá trị.
- **Kết quả mong đợi:** Input ngẫu nhiên được sinh vào ô input (đúng giới hạn phần tử của thuật toán đang chọn — ví dụ Bubble Sort 50 phần tử); mỗi lần nhấn ra dãy khác nhau; trang KHÔNG bị reload (không dùng tổ hợp Ctrl+Shift+R của trình duyệt).
- **Verify regression:** AL-016 (Ctrl+Alt+R random), AL-031 (setAlgorithmLimit theo thuật toán).

### TC-AL-011: Run khi đang play dừng ngay và phát frames mới (P2)
- **Chuẩn bị:** Mở `/playground` mode Algo; Run Bubble Sort `[9,5,1,7]`; Play tới frame ~50%.
- **Các bước:**
  1. Đang play → bấm **Run** (compile lại với input mới `[2,4,1]`).
  2. Quan sát ngay lập tức: playback có dừng ngay hay vẫn advance thêm vài frame nền.
  3. Quan sát frames cuối.
- **Kết quả mong đợi:** Run dừng playback ngay (isPlaying tắt ngay khi bấm, không đợi compile xong); frames cũ không advance nền; kết quả cuối là frames của input mới.
- **Verify regression:** AL-019 (run dừng ngay), AL-020 (jumpToFrame không OOB).

### TC-AL-012: A11y canvas + trình bày mô tả động (P2)
- **Chuẩn bị:** Mở `/playground` mode Algo; chọn Binary Search; Run.
- **Các bước:**
  1. DevTools → Accessibility: kiểm tra `<canvas>` có `role="img"` + `aria-label`.
  2. Play vài frame; kiểm tra vùng mô tả (caption/description) cập nhật theo frame (ví dụ "Dòng 5: so sánh...").
  3. Focus vào ô input Custom Input: kiểm tra label `for/id`, lỗi có `aria-live`, dropdown có `aria-expanded`.
- **Kết quả mong đợi:** Canvas có role/aria-label; mô tả động phản ánh frame hiện tại (không phải chuỗi tĩnh "Dòng X"); form custom input chuẩn a11y (label gắn, lỗi aria-live, aria-expanded).
- **Verify regression:** AL-017 (canvas role/aria), AL-018 (form a11y), AL-027 (DOM description thật).
