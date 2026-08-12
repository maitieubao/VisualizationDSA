# 📤 Export & Share — Hướng dẫn Manual Test

## 📋 Tổng quan
- **Scope:** `features/export-share/**` (SVGToCanvasExporter, WorkspaceStateCompressor, useExportShareStore, ShareExportModal, QRCodeDisplay, ExportFormatSelector, ExportProgressBar, ExportShareWorkspace) + `views/export-share/ExportShareView.vue` + `router/routes.ts` (route `/s/`)
- **Trạng thái:** ✅ DoD (round 20 — 29/30 lỗi đã fix; còn EX-023 PARTIAL — dead types giữ do barrel index)
- **Test tự động:** frontend 3398/3398 pass (192 files) + backend 720/720 pass (`vue-tsc` 0 lỗi)
- **Môi trường:** Chrome/Edge mới nhất; để test QR nên có điện thoại có camera quét mã QR.

## 👤 User Stories

### US-EX-001: Người dùng xuất sơ đồ ra PNG/SVG
- **Vai trò:** Người dùng (đã có workspace: sorting/graph/algo playground)
- **Mục tiêu:** Tải ảnh PNG chất lượng cao hoặc file SVG giữ đúng kiểu dáng workspace.
- **Chấp nhận:** PNG có progress thật + file tải về; SVG không lệch font; click đúp chỉ tải 1 file.

### US-EX-002: Người dùng chia sẻ workspace bằng link + QR
- **Vai trò:** Người dùng
- **Mục tiêu:** Tạo link chia sẻ dạng `/s/...` và mã QR để mở lại workspace trên thiết bị khác.
- **Chấp nhận:** QR hiển thị được và quét ra link hợp lệ; mở link → workspace khôi phục đúng trạng thái (roundtrip, kể cả nội dung unicode).

### US-EX-003: Người dùng copy link chia sẻ
- **Vai trò:** Người dùng
- **Mục tiêu:** Copy link ra clipboard với phản hồi rõ ràng.
- **Chấp nhận:** Copy thành công có toast/feedback; nếu clipboard API lỗi → fallback execCommand; link dài > 2500 ký tự → cảnh báo thay vì hỏng QR.

### US-EX-004: Người dùng mở link chia sẻ (restore workspace)
- **Vai trò:** Người dùng nhận link từ người khác
- **Mục tiêu:** Mở `/s/...` khôi phục đúng workspace.
- **Chấp nhận:** Link hợp lệ → render workspace đúng; link hỏng/thất lạc → error state rõ ràng.

## 🧪 Test Cases

### TC-EX-001: QR hiển thị được (P0)
- **Chuẩn bị:** Mở một workspace (vd: Sorting Visualizer), vào nút "Chia sẻ".
- **Các bước:** 1. Bấm "Tạo link chia sẻ" (GENERATE). 2. Quan sát vùng QR.
- **Kết quả mong đợi:** QR code vẽ ra rõ ràng (không phải ô trống); mỗi lần đổi link QR vẽ lại; nếu vẽ lỗi có fallback `.qr-error`.
- **Verify regression:** EX-001 (P0 — watch flush 'pre' → qrCanvas null, QR không bao giờ vẽ)

### TC-EX-002: Mở link `/s/...` → restore workspace (P0)
- **Chuẩn bị:** Workspace với cấu hình cụ thể (vd: mảng [3,1,2], thuật toán bubble-sort, tốc độ 1.5x).
- **Các bước:** 1. Tạo link chia sẻ, copy. 2. Mở tab ẩn danh → dán link vào URL. 3. Quan sát workspace.
- **Kết quả mong đợi:** Route `/s/...` tồn tại (không 404); workspace khôi phục đúng thuật toán + dữ liệu + cấu hình; không có lỗi console.
- **Verify regression:** EX-002 (P0 — route /s/ không tồn tại → link 404)

### TC-EX-003: Link dài > 2500 → cảnh báo, QR không hỏng (P0)
- **Chuẩn bị:** Workspace lớn (nhiều node/giá trị để payload vượt 2500 ký tự).
- **Các bước:** 1. Bấm tạo link chia sẻ. 2. Quan sát độ dài link (DevTools/URL bar).
- **Kết quả mong đợi:** Link vượt giới hạn ~2500 ký tự → hiển thị cảnh báo (không cố vẽ QR hỏng, không unhandled rejection); link cũ hợp lệ không bị xóa cùng lúc với lỗi mới.
- **Verify regression:** EX-003 (P0 — MAX 20.000 vượt dung lượng QR + toCanvas không try/catch), EX-011 (P2 — overflow không xóa link cũ)

### TC-EX-004: Export PNG — progress thật + download (P0)
- **Chuẩn bị:** Workspace có nội dung đủ lớn để render lâu.
- **Các bước:** 1. Bấm "Tải PNG". 2. Quan sát progress bar. 3. Chờ hoàn tất.
- **Kết quả mong đợi:** Progress bar chạy [30,50,75,90]→100 và kết thúc (không kẹt 0%/100% mãi); nút disabled khi đang export; file PNG tải về đúng nội dung; lỗi render → reject + thông báo.
- **Verify regression:** EX-005 (P0 — promise treo vĩnh viễn, isExporting kẹt, interval leak)

### TC-EX-005: SVG không lệch font (P1)
- **Chuẩn bị:** Workspace hiển thị label số/văn bản (vd: sơ đồ cây).
- **Các bước:** 1. Bấm "Tải SVG". 2. Mở file SVG bằng trình duyệt.
- **Kết quả mong đợi:** Font chữ hiển thị khớp preview (không rơi về font fallback lệch bố cục); gradient/clipPath/foreignObject render đúng; file có xmlns hợp lệ (mở standalone không lỗi).
- **Verify regression:** EX-009 (P2 — font không nhúng → lệch fidelity), EX-008 (P2 — cssRules toàn app phá style), EX-028 (P3 — thiếu xmlns)

### TC-EX-006: Copy link có feedback + fallback (P0)
- **Chuẩn bị:** Modal chia sẻ đã có link.
- **Các bước:** 1. Bấm "Sao chép". 2. Quan sát nút/toast. 3. (Tuỳ chọn) mô phỏng clipboard API lỗi bằng DevTools override.
- **Kết quả mong đợi:** Copy thành công → toast "Đã sao chép" + nút đổi trạng thái; clipboard API lỗi → fallback execCommand vẫn copy được và có phản hồi (không fail im lặng).
- **Verify regression:** EX-017 (P2 — copy fail im lặng, không fallback)

### TC-EX-007: Link share roundtrip unicode (P1)
- **Chuẩn bị:** Workspace có tiêu đề/nội dung tiếng Việt (có dấu) hoặc emoji.
- **Các bước:** 1. Tạo link chia sẻ. 2. Copy link và mở ở tab khác. 3. Kiểm tra nội dung khôi phục.
- **Kết quả mong đợi:** Nội dung unicode/emoji khôi phục đầy đủ (không bị `+`→space, không mất ký tự); URL dùng encodeURIComponent đúng.
- **Verify regression:** EX-013 (P2 — payload thô `+`→space phá dữ liệu)

### TC-EX-008: Tải SVG không double-click 2 file (P1)
- **Chuẩn bị:** Modal chia sẻ.
- **Các bước:** 1. Bấm "Tải SVG" nhanh 2 lần liên tiếp.
- **Kết quả mong đợi:** Chỉ 1 file tải về; nút disabled/isExporting khi đang tải (click lần 2 vô hiệu); không có try/catch nuốt lỗi.
- **Verify regression:** EX-012 (P2 — double-click 2 file + không try/catch)

### TC-EX-009: Export/Share fail → thông báo rõ (P1)
- **Chuẩn bị:** Workspace; DevTools Network Offline.
- **Các bước:** 1. Bấm tạo link chia sẻ / tải PNG khi Offline. 2. Quan sát giao diện.
- **Kết quả mong đợi:** Hiển thị exportError/linkError rõ ràng trong modal (không im lặng); nút quay lại trạng thái bình thường để thử lại; success có feedback bền (toast) không biến mất ngay.
- **Verify regression:** EX-004 (P0 — fail chỉ console.error, success feedback biến mất ngay)

### TC-EX-010: Export phản ánh workspace thật (P1)
- **Chuẩn bị:** Workspace với cấu hình riêng (vd: graph 5 node có trọng số, theme dark).
- **Các bước:** 1. Bấm "Chia sẻ" → tạo link. 2. Bấm "Tải PNG/SVG".
- **Kết quả mong đợi:** Nội dung export khớp 100% workspace hiện tại (không phải data demo tĩnh); snapshot được chụp tại thời điểm click.
- **Verify regression:** EX-010 (P2 — pipeline dùng data demo tĩnh)

### TC-EX-011: Modal chia sẻ a11y chuẩn (P1)
- **Chuẩn bị:** Mở modal chia sẻ.
- **Các bước:** 1. Bấm Escape. 2. Tab quanh các phần tử. 3. Quan sát aria.
- **Kết quả mong đợi:** Modal có role=dialog/aria-modal; Escape đóng + restore focus; Tab trap trong modal; QR canvas có role=img/aria-label; progressbar có role + aria-valuenow.
- **Verify regression:** EX-006 (P0 — modal thiếu role/focus trap), EX-015 (P2 — QR/progress thiếu aria)

### TC-EX-012: Modal responsive trên mobile (P2)
- **Chuẩn bị:** DevTools chuyển mobile (≤480px), mở modal chia sẻ.
- **Các bước:** 1. Quan sát modal + các nút.
- **Kết quả mong đợi:** Modal vừa màn hình (không vỡ layout 460px cố định); QR không bị cắt; nút copy/export bấm được thoải mái.
- **Verify regression:** EX-016 (P2 — dialog 460px cố định vỡ <480px)

### TC-EX-013: Progress bar "Đóng gói..." chính xác (P2)
- **Chuẩn bị:** Export PNG với workspace lớn.
- **Các bước:** 1. Bấm "Tải PNG". 2. Đọc text trên progress bar.
- **Kết quả mong đợi:** Progress tăng đều theo tiến trình thật; text trạng thái khớp giai đoạn (không hiện text giả định dạng sai); hoàn tất → 100% + ẩn.
- **Verify regression:** EX-025 (P3 — progress giả setInterval + text sai format)
