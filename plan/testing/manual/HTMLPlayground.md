# 🖥️ HTML Playground — Hướng dẫn Manual Test

## 📋 Tổng quan
- **Scope:** `frontend/src/features/html-playground/**` (PlaygroundWorkspace, PlaygroundPreview, useHtmlPlaygroundStore, PlaygroundDocumentBuilder, PlaygroundUrlCodec, PlaygroundDebouncer, playgroundDemos) + `views/playground/PlaygroundView.vue` — route `/playground`
- **Trạng thái:** ✅ DoD (Review Round 10 — 33/33 lỗi HT-001 → HT-033 đã fix)
- **Test tự động:** 2911/2911 frontend pass (159 files) + `vue-tsc` 0 lỗi; HTML Playground suite 50 → ~95 tests
- **Môi trường:** Chrome/Edge bản mới nhất, viewport desktop ≥ 1280px + mobile 390px, backend không bắt buộc (tính năng chạy thuần client)

## 👤 User Stories

### US-HT-001: Gõ code HTML/CSS/JS và xem preview ngay lập tức
- **Vai trò:** Sinh viên tự học HTML/CSS/JS
- **Mục tiêu:** Nhập code 3 tab, preview render mượt mà không reload giật mỗi keystroke
- **Chấp nhận:** Khi dừng gõ ≥ 800ms, preview tự cập nhật đúng 1 lần; nhấn Run → cập nhật ngay; spinner hiện khi đang chạy.

### US-HT-002: Bật/tắt Auto-run
- **Vai trò:** Sinh viên đang gỡ lỗi code có vòng lặp nặng
- **Mục tiêu:** Tắt auto-run để code không tự chạy lại mỗi 800ms khi chưa muốn
- **Chấp nhận:** Toggle auto-run tắt → gõ code không reload preview; bật lại → auto-run hoạt động như cũ.

### US-HT-003: Chia sẻ code qua link và khôi phục đúng trạng thái
- **Vai trò:** Sinh viên/sinh viên khác muốn chia sẻ bài demo
- **Mục tiêu:** Copy link chứa toàn bộ code, người nhận mở link thấy nguyên vẹn code 3 tab + tab đang mở
- **Chấp nhận:** Roundtrip encode/decode không mất ký tự; payload hỏng → toast cảnh báo thay vì im lặng mất code.

### US-HT-004: Sử dụng demo có sẵn và reset workspace
- **Vai trò:** Sinh viên muốn thử nhanh một demo mẫu
- **Mục tiêu:** Nạp demo nhanh; reset có xác nhận, giữ nguyên tab đang chọn
- **Chấp nhận:** Reset không xóa code ngoài ý muốn (có confirm), không ép nhảy tab HTML, sau reset editor có thể Undo.

## 🧪 Test Cases

### TC-HT-001: Gõ code liên tục → preview chỉ reload đúng 1 lần sau 800ms (P0)
- **Chuẩn bị:** Mở `/playground`, tab HTML; dùng DevTools Performance/Network đếm số lần iframe reload (`srcDoc` thay đổi hoặc network event của iframe).
- **Các bước:**
  1. Bấm vào ô editor HTML, gõ liên tục 30 ký tự `a` (mỗi ký tự < 100ms).
  2. Trong lúc đang gõ (trước 800ms), quan sát preview — không được reload giữa chừng.
  3. Dừng gõ, đếm trong khoảng 800–1200ms có đúng 1 lần reload preview.
  4. Bấm nút **Run** ngay sau khi vừa gõ xong (còn pending debounce) → chỉ reload 1 lần (debounce được flush, không reload 2 lần).
- **Kết quả mong đợi:** Preview chỉ reload đúng 1 lần sau 800ms kể từ keystroke cuối; Run flush không tạo lần reload thứ 2.
- **Verify regression:** HT-001 (debouncer 800ms), HT-018 (Run flush), HT-019 (phantom run sau reset/load share).

### TC-HT-002: iframe không gửi Referer ra ngoài (P1)
- **Chuẩn bị:** Mở `/playground`, tạo 1 file ảnh/script trỏ host ngoài (ví dụ `https://example.com/pixel.png`) trong code HTML; mở DevTools → Network.
- **Các bước:**
  1. Nhập `<img src="https://example.com/pixel.png">` vào tab HTML, Run.
  2. Mở request tới `example.com` trong Network, kiểm tra header `Referer`.
  3. Kiểm tra thẻ `<iframe>` trong DOM: `referrerpolicy="no-referrer"` và sandbox chỉ gồm `allow-scripts allow-forms`.
- **Kết quả mong đợi:** Không có header `Referer` gửi đi (URL trang kèm `?code=` payload không lộ); `<base about:blank>` đảm bảo URL tương đối trong user code không resolve về origin app (không mang cookie session).
- **Verify regression:** HT-002 (Referer leak), HT-005 (`<base>` cookie leak), HT-007 (CSP meta).

### TC-HT-003: Code lỗi JS → panel hiển thị lỗi (P1)
- **Chuẩn bị:** Mở `/playground`, tab JS.
- **Các bước:**
  1. Nhập code `function broken() { return a + b; } broken();` (a, b không khai báo) → Run.
  2. Quan sát preview + khu vực panel/thông báo lỗi.
  3. Đổi sang lỗi syntax: `const x = ;` → Run.
  4. Đổi sang vòng lặp vô hạn `while(true){}` → Run (thử nghiệm nhanh, sau đó reset).
- **Kết quả mong đợi:** Có thông báo lỗi rõ ràng (panel console lỗi hoặc toast) kèm nội dung message; preview không "trắng treo" im lặng; lỗi syntax và runtime đều được báo.
- **Verify regression:** HT-003 (error bridge `playground-error`).

### TC-HT-004: Chia sẻ link → mở lại khôi phục code (P1)
- **Chuẩn bị:** Mở `/playground`, gõ code cả 3 tab (HTML có unicode/emoji + ký tự `+/=`, CSS, JS), chuyển sang tab CSS.
- **Các bước:**
  1. Bấm nút **Chia sẻ / Copy link**.
  2. Mở tab mới (cửa sổ ẩn danh), dán link, Enter.
  3. Kiểm tra code 3 tab + tab đang active (CSS).
  4. Chỉnh sửa 1 ký tự rồi Refresh → code vẫn nguyên.
  5. Dán link `?code=` hỏng (sửa payload bừa) vào tab mới → quan sát thông báo.
- **Kết quả mong đợi:** Code khôi phục nguyên vẹn (unicode/emoji không vỡ), tab active đúng; payload hỏng → toast cảnh báo + hiện code mặc định, không console.warn thầm lặng; Refresh không mất code.
- **Verify regression:** HT-004 (share roundtrip), HT-006 (payload giới hạn), HT-021 (loadFromSource reset activeTab), HT-025 (payload hỏng → toast).

### TC-HT-005: Code quá dài → toast cảnh báo (P1)
- **Chuẩn bị:** Mở `/playground`; chuẩn bị một đoạn code dài > 6000 ký tự (paste lặp lại văn bản).
- **Các bước:**
  1. Dán code dài vượt ngưỡng vào tab JS.
  2. Bấm **Chia sẻ / Copy link**.
  3. Quan sát URL sinh ra + toast.
- **Kết quả mong đợi:** Toast cảnh báo "code quá dài" (không tạo link vỡ); link không bị cắt mất code im lặng; editor vẫn giữ code đang gõ.
- **Verify regression:** HT-006 (MAX_PAYLOAD 6000 guard).

### TC-HT-006: Reset có confirm + giữ tab đang mở (P2)
- **Chuẩn bị:** Mở `/playground`, gõ code tùy ý ở tab JS, chuyển active sang tab CSS.
- **Các bước:**
  1. Bấm nút **Reset**.
  2. Khi dialog confirm xuất hiện → bấm **Hủy** → code giữ nguyên.
  3. Bấm **Reset** lần nữa → bấm **Xác nhận**.
  4. Sau reset, bấm `Ctrl+Z` trong editor.
- **Kết quả mong đợi:** Có dialog xác nhận trước khi xóa; Hủy → không mất gì; Xác nhận → code về mặc định NHƯNG tab active vẫn là CSS (không ép nhảy tab HTML); Ctrl+Z khôi phục được code đã reset.
- **Verify regression:** HT-013 (reset confirm + giữ tab), HT-019 (không phantom run sau reset).

### TC-HT-007: Tắt auto-run → gõ code không reload preview (P2)
- **Chuẩn bị:** Mở `/playground`, đảm bảo auto-run đang BẬT (mặc định).
- **Các bước:**
  1. Bật toggle/checkbox **Auto-run** sang trạng thái tắt.
  2. Gõ liên tục vào tab HTML, quan sát preview trong > 3 giây.
  3. Bấm **Run** → quan sát.
  4. Bật lại auto-run, gõ 1 ký tự, chờ 800ms.
- **Kết quả mong đợi:** Khi tắt: preview KHÔNG tự reload dù dừng gõ lâu; bấm Run vẫn cập nhật; khi bật lại: tự reload sau 800ms như bình thường.
- **Verify regression:** HT-009 (auto-run toggle).

### TC-HT-008: Switch mode free ↔ algo giữ nguyên code (KeepAlive) (P2)
- **Chuẩn bị:** Mở `/playground` mode HTML (free). Gõ code HTML dài + 1 vài dòng JS; ghi nhớ scroll position trong editor JS.
- **Các bước:**
  1. Bấm nút chuyển sang mode **Algo** (Playground View có 2 mode).
  2. Bấm quay lại mode **HTML/Free**.
  3. Kiểm tra code 3 tab, undo history (Ctrl+Z vài lần), scroll position editor.
  4. Quan sát URL query `?code=` có bị xóa khi switch không.
- **Kết quả mong đợi:** Code, undo history, scroll position được giữ nguyên (KeepAlive, không remount Monaco); URL `?code=` không bị xóa khi switch mode → Refresh vẫn giữ code.
- **Verify regression:** HT-011 (KeepAlive giữ Monaco), HT-012 (merge `?code=`).

### TC-HT-009: Sandbox chặn popup/modal & tương tác state preview ổn định (P2)
- **Chuẩn bị:** Mở `/playground`.
- **Các bước:**
  1. Nhập code HTML: `<script>alert('hi')</script>` → Run → `window.open('https://example.com')`.
  2. Quan sát có popup/dialog thoát ra ngoài hay không.
  3. Nhập code `<button onclick="this.textContent++">0</button>` → Run, bấm nút 3 lần.
  4. Gõ thêm 1 ký tự bất kỳ vào editor, chờ 800ms (auto-run reload).
  5. Kiểm tra giá trị nút.
- **Kết quả mong đợi:** `alert()`/`window.open()` bị chặn hoặc vô hiệu (sandbox không allow-modals/popups); sau auto-run reload state nút không bị về 0 mỗi lần remount nếu code không đổi (iframe identity bất biến khi payload giống nhau).
- **Verify regression:** HT-023 (bỏ allow-modals/popups), HT-014 (remount iframe mỗi auto-run).

### TC-HT-010: Drag resize giữa editor và preview (P2)
- **Chuẩn bị:** Mở `/playground` desktop.
- **Các bước:**
  1. Tìm dải phân cách (split handle) giữa editor và preview.
  2. Kéo sang trái/phải.
  3. Thu nhỏ viewport mobile (hoặc DevTools 390px) → quan sát layout toolbar + preview.
- **Kết quả mong đợi:** Kéo handle làm thay đổi tỉ lệ editor/preview; trên mobile toolbar không tràn, preview hiển thị dùng được.
- **Verify regression:** HT-010 (split drag handle), HT-027 (responsive mobile).

### TC-HT-011: Fallback textarea khi Monaco không tải (P2)
- **Chuẩn bị:** Mở `/playground`, DevTools → Network → chặn domain CDN Monaco (block `*monaco*`) → Refresh trang.
- **Các bước:**
  1. Quan sát editor sau khi chặn Monaco.
  2. Gõ code vào vùng editor thay thế → Run.
- **Kết quả mong đợi:** Không bị "trắng hình"; có textarea fallback cho phép gõ code và chạy preview (thông báo không gây hiểu lầm "vẫn chạy được").
- **Verify regression:** HT-026 (fallback textarea).

### TC-HT-012: A11y tabs HTML/CSS/JS (P2)
- **Chuẩn bị:** Mở `/playground`.
- **Các bước:**
  1. Focus vào tab bar (phím Tab) → quan sát `role=tablist/tab`, `aria-controls`, `aria-selected`.
  2. Dùng phím mũi tên Trái/Phải để chuyển tab.
  3. Kiểm tra tab active có thể focus bằng Tab riêng (tabindex).
- **Kết quả mong đợi:** Tab bar chuẩn WAI-ARIA: điều hướng bằng phím mũi tên, trạng thái chọn được thông báo, tabpanel liên kết đúng.
- **Verify regression:** HT-024 (tabs WAI-ARIA).
