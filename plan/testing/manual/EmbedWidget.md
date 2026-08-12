# 🔗 Embed Widget — Hướng dẫn Manual Test

## 📋 Tổng quan

- **Scope:** `frontend/src/features/embed-widget/**` (EmbedCommunicationBridge, SecureOriginChecker, AutoHeightResizer, useEmbedConfiguratorStore, EmbedWidgetWorkspace, LiveWidgetPreview, EmbedConfiguratorSidebar, EmbedCodeSnippet) + `views/embed/EmbedWidgetView.vue` + `views/sorting/SortingView.vue` + `views/graph/GraphView.vue` (route.query consume)
- **Route chính:** `/embed` (EmbedWidgetView — workspace cấu hình), `/embed?algo=...&theme=...&vcr=...&watch=...` (widget minimal cho host nhúng)
- **Trạng thái:** ✅ DoD (round 19 — 33 lỗi đã fix, EW-001 → EW-033)
- **Test tự động:** 3363 frontend pass (riêng feature: 107 test — embedComponents 24, embedWidgetView 11, bridge/resizer/checker/store, origin edge 7)

## 👤 User Stories

### US-EW-001: Cấu hình widget theo nhu cầu nhúng
- **Vai trò:** Giáo viên / người tạo nội dung
- **Mục tiêu:** Chọn thuật toán, theme, tùy chọn VCR/watch/interactive cho widget.
- **Chấp nhận:** Mọi tùy chọn config phải được mã hóa vào iframe URL và được widget tiêu thụ thật sự.

### US-EW-002: Xem trước widget trước khi nhúng
- **Vai trò:** Giáo viên
- **Mục tiêu:** Preview phải là iframe thật chạy đúng cấu hình, có loading/error state.
- **Chấp nhận:** Preview phản ánh mọi thay đổi config; có trạng thái loading và lỗi rõ ràng; VCR trong preview điều khiển thật qua postMessage.

### US-EW-003: Sao chép mã nhúng (snippet + host script)
- **Vai trò:** Giáo viên
- **Mục tiêu:** Copy được bộ mã iframe + script host để dán vào Moodle/Canvas/website ngoài.
- **Chấp nhận:** Code snippet có `data-embed-widget`, host script bám đúng iframe của widget (không bấu iframe đầu tiên), kiểm tra `event.source` trước khi xử lý message.

### US-EW-004: Widget hoạt động trên trang host ngoài
- **Vai trò:** Người học
- **Mục tiêu:** Mở trang host có nhúng widget → widget hiển thị, phát động, nhận lệnh từ host.
- **Chấp nhận:** Widget gửi WIDGET_READY, nhận STEP_FORWARD/BACKWARD/RESET, tự resize chiều cao cross-origin (targetOrigin hướng host); algo không hợp lệ hiện overlay lỗi thay vì màn hình trắng.

### US-EW-005: Widget responsive trên di động
- **Vai trò:** Người học
- **Mục tiêu:** Widget hiển thị tốt trên màn hình nhỏ.
- **Chấp nhận:** Sidebar/configurator không vỡ ở <480px; preview thu nhỏ có chỉ báo; không tràn ngang.

## 🧪 Test Cases

### TC-EW-001: Config theme/vcr/watch/algo → preview iframe phản ánh thật (P0)
- **Chuẩn bị:** Mở `/embed` (EmbedWidgetWorkspace); DevTools → Network.
- **Các bước:**
  1. Chọn algo `heap-sort`, theme `dark`, bật VCR, bật watch.
  2. Chuyển sang theme `light`, tắt VCR, tắt watch.
  3. Đổi algo sang `quick-sort`.
  4. Quan sát src của iframe preview và nội dung bên trong.
- **Kết quả mong đợi:** `iframe.src` chứa đủ query `algo`, `theme`, `vcr`, `watch` theo từng thao tác; iframe tải lại và bên trong áp theme/ẩn hiện VCR/watch đúng; widget tiêu thụ params (không còn bị bỏ qua).
- **Verify regression:** EW-003 (P0 — query params không được tiêu thụ), EW-021.

### TC-EW-002: Preview là iframe thật (không phải mock tĩnh) (P1)
- **Chuẩn bị:** Mở `/embed`; DevTools → Elements.
- **Các bước:**
  1. Quan sát vùng Preview có element `<iframe>` với src trỏ về app (không phải div vẽ thanh giả).
  2. Chờ iframe load (spinner loading → nội dung).
  3. Bấm các nút VCR trong preview, quan sát animation thật.
  4. Giả lập lỗi (tắt backend) và kiểm tra error state.
- **Kết quả mong đợi:** Preview là iframe thật; có loading/error state; VCR gửi postMessage thật và widget phản hồi (step/play thật); pointer-events hoạt động.
- **Verify regression:** EW-004 (P1 — preview mock tĩnh), EW-015.

### TC-EW-003: Copy code → host script đúng widget (P1)
- **Chuẩn bị:** Mở `/embed`, cấu hình xong; sẵn 1 trang HTML thử nghiệm chứa 2 iframe (1 iframe khác đặt trước).
- **Các bước:**
  1. Bấm nút Copy mã nhúng (EmbedCodeSnippet).
  2. Dán vào file HTML có sẵn 1 iframe khác phía trước.
  3. Mở file đó, bấm nút điều khiển của host script.
  4. Quan sát Network postMessage.
- **Kết quả mong đợi:** Clipboard chứa iframe có `data-embed-widget` + script host; script dùng `querySelector('[data-embed-widget]')` (không bấu nhầm iframe đầu tiên); event.source được kiểm tra trước khi nhận message; có aria-live khi copy thành công.
- **Verify regression:** EW-017 (P1 — host script bấu nhầm iframe), EW-009, EW-026/027.

### TC-EW-004: Mở route /embed?algo=... → widget hoạt động + WIDGET_READY (P0)
- **Chuẩn bị:** Mở tab mới truy cập trực tiếp `http://<host>/embed?algo=bubble-sort&theme=dark&vcr=true&watch=false`.
- **Các bước:**
  1. Quan sát widget minimal render đúng algo.
  2. Mở Console, lắng nghe `window.postMessage` từ iframe.
  3. Gửi thử `{action: 'STEP_FORWARD'}` từ console host.
  4. Kiểm tra message `WIDGET_READY` có được gửi lên host sau khi mount.
- **Kết quả mong đợi:** Widget render đúng renderer theo algo; phát message `WIDGET_READY` sau handshake; nhận `STEP_FORWARD`/`BACKWARD`/`RESET` và thực thi thật (engine wire — không còn dead code); theme/vcr/watch áp dụng đúng.
- **Verify regression:** EW-002 (P0 — engine dead code), EW-014.

### TC-EW-005: Dijkstra premium → cảnh báo + overlay chặn (P1)
- **Chuẩn bị:** Tài khoản KHÔNG premium; mở `/embed`.
- **Các bước:**
  1. Trong sidebar chọn thuật toán `dijkstra`.
  2. Quan sát sidebar: có badge/cảnh báo premium.
  3. Thử mở trực tiếp `/embed?algo=dijkstra` (không premium).
- **Kết quả mong đợi:** Sidebar hiển thị cảnh báo premium (không âm thầm cho phép); mở trực tiếp: widget hiện overlay chặn premium (isPremiumBlocked) — không cho chạy nội dung trả phí; có lối thoát (nút đăng ký/quay lại).
- **Verify regression:** EW-016 (dijkstra premium không cảnh báo), EW-011.

### TC-EW-006: Algo sai → overlay lỗi, không màn hình trắng (P1)
- **Chuẩn bị:** Mở `/embed` với query bất hợp lệ.
- **Các bước:**
  1. Vào `http://<host>/embed?algo=a&algo=b` (query array) — kiểm tra không crash.
  2. Vào `http://<host>/embed?algo=` (rỗng).
  3. Vào `http://<host>/embed?algo=not-exist-xyz`.
- **Kết quả mong đợi:** Không màn hình trắng; hiển thị overlay/state lỗi với thông báo algo không hợp lệ; `toLowerCase()` trên mảng không crash; hint tự sinh liệt kê đúng danh sách algo tồn tại (có quick-sort).
- **Verify regression:** EW-005 (P1 — algo query crash/trắng), EW-030.

### TC-EW-007: Bridge fail-closed — origin lạ bị từ chối (P0)
- **Chuẩn bị:** Mở trang host ngoài (http://evil-site.test) có iframe nhúng widget; Console host.
- **Các bước:**
  1. Từ host giả lập gửi message `{action:'RESET'}` từ origin KHÔNG nằm trong allowlist.
  2. Gửi message có shape sai (thiếu action, height không phải số).
  3. Gửi message từ đúng origin host (đã cấu hình allowlist).
- **Kết quả mong đợi:** Origin lạ: message bị bỏ im lặng (fail-closed — không nhận mọi origin); shape sai: bị validate loại (không xử lý height NaN); origin hợp lệ: xử lý bình thường; wildcard allowlist khớp cả base lẫn subdomain.
- **Verify regression:** EW-006 (P0 — fail-open), EW-012, EW-013, EW-019.

### TC-EW-008: Auto-height cross-origin hoạt động (P1)
- **Chuẩn bị:** Trang host ngoài domain khác nhúng widget (có access server test); không cùng origin với widget.
- **Các bước:**
  1. Tải trang host, quan sát chiều cao iframe ban đầu.
  2. Thay đổi nội dung widget (thu nhỏ canvas — preview scale ≤ 600×400).
  3. Quan sát chiều cao iframe sau vài giây.
  4. Resize nhanh liên tục (500→600→500).
- **Kết quả mong đợi:** Chiều cao iframe tự điều chỉnh theo nội dung (HEIGHT_CHANGED hoạt động cross-origin — targetOrigin hướng host); resize nhanh không spam message (debounce + chỉ gửi giá trị cuối); auto-height không bị chặn bởi browser.
- **Verify regression:** EW-001 (P0 — targetOrigin sai → auto-height chết), EW-008, EW-023.

### TC-EW-009: Quick-sort chọn được trong danh sách algo (P1)
- **Chuẩn bị:** Mở `/embed` (EmbedConfiguratorSidebar).
- **Các bước:**
  1. Mở dropdown/radio danh sách thuật toán.
  2. Tìm và chọn `quick-sort`.
  3. Quan sát preview + iframe URL.
- **Kết quả mong đợi:** `quick-sort` có mặt trong EMBED_ALGORITHM_OPTIONS (không lệch với VISUALIZER_MAP); chọn được và preview chạy quick-sort; hint danh sách khớp (không liệt kê oop/solid/di không tồn tại).
- **Verify regression:** EW-030 (quick-sort thiếu trong options), EW-011.

### TC-EW-010: Responsive mobile — không vỡ layout (P1)
- **Chuẩn bị:** DevTools → chế độ mobile (iPhone 14 / 390×844).
- **Các bước:**
  1. Mở `/embed` ở width 390px.
  2. Mở ở width 320px.
  3. Kiểm tra sidebar, preview, nút copy.
- **Kết quả mong đợi:** Sidebar không còn cứng 320px (có media query — chuyển cột/xếp chồng); preview co giãn theo chiều rộng; không tràn ngang, không mất nút chức năng.
- **Verify regression:** EW-018 (sidebar 320px cứng vỡ mobile).

### TC-EW-011: Copy payload + reset config đúng (P2)
- **Chuẩn bị:** Mở `/embed`; DevTools theo dõi clipboard/writeText.
- **Các bước:**
  1. Cấu hình xong → bấm Copy.
  2. Kiểm tra clipboard chứa `generatedIframeCode` đúng payload (assert writeText được gọi với payload thật).
  3. Giả lập copy thất bại (chặn quyền clipboard) → kiểm tra copyError.
  4. Bấm "Đặt lại Mặc định".
- **Kết quả mong đợi:** Clipboard nhận đúng generatedIframeCode; copy thất bại hiện copyError và tự ẩn sau vài giây; reset xóa cả copyError cũ; timer copyReset không leak.
- **Verify regression:** EW-009, EW-025, EW-027.

### TC-EW-012: Replay/multi-instance — nhiều widget trên cùng trang (P2)
- **Chuẩn bị:** Trang host nhúng 2 widget (algo khác nhau) cùng lúc.
- **Các bước:**
  1. Tải trang có 2 widget.
  2. Gửi lệnh STEP_FORWARD tới widget 1 và widget 2 riêng biệt.
  3. Replay (RESET + play) từng widget.
- **Kết quả mong đợi:** Mỗi widget nhận đúng message của mình (không trộn lẫn); replay hoạt động độc lập; message gửi sau khi listener hủy không gây lỗi; không crash khi widget load chậm.
- **Verify regression:** EW-032 (thiếu replay/multi-instance test), EW-022.
