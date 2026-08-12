# 🔔 Notifications — Hướng dẫn Manual Test

## 📋 Tổng quan

- **Scope:** `frontend/src/features/notifications/**` (NotificationBell, useNotificationStore, notificationApi) + `features/realtime/stores/useSignalRStore.ts` (connectNotifications) · backend `NotificationsController.cs`/`NotificationService.cs`/`NotificationHub.cs` + `Program.cs` (DI)
- **Vị trí UI:** Bell chuông trên AppHeader (mọi trang); dropdown danh sách thông báo
- **Trạng thái:** ✅ DoD (round 21 — 29 lỗi đã fix, NT-001 → NT-029)
- **Test tự động:** 3423 frontend + 754 backend pass (riêng feature: 37 test — controller 14, service 14, hub 6, api/store/bell FE)

## 👤 User Stories

### US-NT-001: Nhận thông báo mới trong thời gian thực
- **Vai trò:** Học sinh / Giáo viên
- **Mục tiêu:** Khi có sự kiện (award badge, level up, reply comment, admin notify) bell tự cập nhật số chưa đọc và hiện toast.
- **Chấp nhận:** Notification mới đến qua SignalR được prepend vào danh sách, badge tăng, toast hiển thị, không trùng lặp.

### US-NT-002: Đọc và quản lý thông báo
- **Vai trò:** Người dùng
- **Mục tiêu:** Mở dropdown, xem chi tiết, đánh dấu đã đọc từng cái hoặc tất cả.
- **Chấp nhận:** Đánh dấu 1 → badge giảm 1; đánh dấu tất cả → badge về 0; badge đúng kể cả >100 chưa đọc; click thông báo điều hướng đúng link.

### US-NT-003: Hoạt động bền bỉ khi token hết hạn / kết nối yếu
- **Vai trò:** Người dùng
- **Mục tiêu:** Phiên bị 401 do hết hạn token vẫn tự refresh và tiếp tục tải thông báo.
- **Chấp nhận:** 401 → refresh token → retry; refresh fail → reset trạng thái, không kẹt badge cũ; polling backup 60s giữ dữ liệu khi SignalR mất.

### US-NT-004: Quyền riêng tư giữa các tài khoản
- **Vai trò:** Người dùng
- **Mục tiêu:** Đổi tài khoản (logout/impersonate) không còn thấy thông báo của tài khoản cũ.
- **Chấp nhận:** Store reset khi đổi user; danh sách + badge thuộc đúng user hiện tại; user A không đọc/đánh dấu được của user B (IDOR chặn).

### US-NT-005: Sử dụng bằng bàn phím & trợ năng
- **Vai trò:** Người dùng (kể cả dùng screen reader)
- **Mục tiêu:** Mở/đóng dropdown, di chuyển và kích hoạt item bằng bàn phím.
- **Chấp nhận:** Esc đóng dropdown; item focusable (button/keydown); aria-expanded/haspopup/aria-live đầy đủ; touch target ≥44px.

## 🧪 Test Cases

### TC-NT-001: Bell hiển thị + mở dropdown (P0 — verify URL)
- **Chuẩn bị:** Login user có ≥1 thông báo; DevTools → Network.
- **Các bước:**
  1. Quan sát icon chuông trên AppHeader (mọi trang).
  2. Bấm chuông → dropdown mở.
  3. Kiểm tra Network request URL.
- **Kết quả mong đợi:** Request đi đúng `/api/v1/notifications` (KHÔNG phải `/api/v1/concepts/notifications`); dropdown hiển thị danh sách + badge số chưa đọc; loading state không hiện "Chưa có thông báo" giả khi đang tải.
- **Verify regression:** NT-001 (P0 — URL sai → 404 cả tính năng), NT-012.

### TC-NT-002: Nhận thông báo mới realtime → bell cập nhật + toast (P0)
- **Chuẩn bị:** 2 user: A (nhận), B (gây sự kiện — reply comment / admin notify). Đã login A và giữ tab mở.
- **Các bước:**
  1. Từ user B (hoặc admin) tạo 1 thông báo cho A (reply bình luận của A).
  2. Quan sát tab của A trong ≤3 giây.
  3. Mở dropdown kiểm tra danh sách.
- **Kết quả mong đợi:** Bell A tự cập nhật badge +1 (realtime qua hub push Clients.User — không cần F5); toast hiện thông báo mới; item mới được prepend đầu danh sách; không trùng lặp khi cả SignalR lẫn polling cùng trả về (dedupe theo id).
- **Verify regression:** NT-002 (P0 — realtime dead 2 đầu), NT-009, NT-025.

### TC-NT-003: Đánh dấu đã đọc 1 thông báo → badge giảm (P1)
- **Chuẩn bị:** User có 3 thông báo chưa đọc (badge = 3).
- **Các bước:**
  1. Mở dropdown, bấm vào 1 item chưa đọc (hoặc nút mark đã đọc).
  2. Quan sát badge.
  3. Refresh trang và mở lại dropdown.
- **Kết quả mong đợi:** Badge giảm xuống 2; item chuyển trạng thái đã đọc (không còn highlight); sau refresh trạng thái persist (đã PUT lên server); click item đã đọc không gửi mark lại nhưng vẫn điều hướng.
- **Verify regression:** NT-010 (mark kém hiệu quả), NT-021.

### TC-NT-004: Đánh dấu tất cả đã đọc → badge về 0 (P1)
- **Chuẩn bị:** User có ≥5 thông báo chưa đọc.
- **Các bước:**
  1. Mở dropdown → bấm "Đánh dấu tất cả đã đọc".
  2. Quan sát badge.
  3. Bấm nhanh 2 lần liên tiếp (double PUT).
  4. Refresh trang.
- **Kết quả mong đợi:** Badge về 0; toàn bộ item đã đọc; nút bấm lần 2 không gửi request thừa (disabled khi pending — NT-023); sau refresh vẫn 0 (mark-all atomic ExecuteUpdate).
- **Verify regression:** NT-010 (P1), NT-023.

### TC-NT-005: Unread >100 → badge hiển thị đúng (P1)
- **Chuẩn bị:** Seed DB user có 101+ thông báo chưa đọc (qua admin hoặc script test).
- **Các bước:**
  1. Login user đó.
  2. Quan sát badge trên bell.
  3. Mở dropdown kiểm tra danh sách (danh sách lấy 100 mới nhất).
- **Kết quả mong đợi:** Badge hiển thị ≥101 (dùng `unread-count` endpoint + `totalUnread` trong list — không đếm thủ công từ 100 bản); dropdown hiển thị 100 mới nhất; badge chính xác thay vì sai dưới thực tế.
- **Verify regression:** NT-011 (P1 — unreadCount client-side từ 100 bản).

### TC-NT-006: 401 hết hạn token → tự refresh + retry (P1)
- **Chuẩn bị:** Login user; cố tình làm token access hết hạn (đổi thời gian hoặc chờ hết hạn); DevTools → Network.
- **Các bước:**
  1. Mở bell/dropdown (trigger load notifications).
  2. Quan sát Network: request đầu tiên.
  3. Quan sát request retry.
  4. Giả lập refresh token cũng hết hạn (logout force).
- **Kết quả mong đợi:** Request 401 → gọi refreshAccessToken → retry với token mới thành công; nếu refresh fail: trạng thái store được reset (không giữ badge cũ vô hạn, không kẹt isLoading); có xử lý timeout cho fetch.
- **Verify regression:** NT-008 (P1 — 401 nuốt im lặng), NT-022.

### TC-NT-007: Đổi user → danh sách reset, không lẫn tài khoản (P1)
- **Chuẩn bị:** User A có thông báo riêng; User B khác (có thông báo khác).
- **Các bước:**
  1. Login A → mở bell, ghi nhận badge + list.
  2. Logout (không refresh trang) → Login B.
  3. Mở bell ngay.
  4. Thử gọi API mark 1 thông báo của A bằng token B (qua console).
- **Kết quả mong đợi:** Sau login B: badge/list là của B (store reset khi đổi user — không còn dữ liệu A); logout cũng reset; gọi IDOR chéo trả 404 (backend chặn — không lộ/đánh dấu được của người khác).
- **Verify regression:** NT-004 (P1 — store không reset), NT-020.

### TC-NT-008: Esc đóng dropdown + điều hướng bằng bàn phím (P1)
- **Chuẩn bị:** Mở trang bất kỳ có bell; user có vài thông báo.
- **Các bước:**
  1. Bấm chuông mở dropdown.
  2. Bấm phím `Esc`.
  3. Mở lại, dùng `Tab`/phím mũi tên di chuyển qua các item, bấm `Enter` chọn.
  4. Kiểm tra focus sau khi đóng.
- **Kết quả mong đợi:** Esc đóng dropdown + focus quay về bell; item focusable bằng bàn phím (không phải div mù — role/keydown); Enter kích hoạt item (điều hướng link hoặc mark); aria-expanded/haspopup đúng trạng thái; không focus trap khi dropdown không phải dialog.
- **Verify regression:** NT-005 (P1 — item không keyboard), NT-013 (Esc/aria).

### TC-NT-009: Polling backup 60s khi mất realtime (P1)
- **Chuẩn bị:** Login user; DevTools → Network; user B tạo thông báo.
- **Các bước:**
  1. Xác nhận connection SignalR đang chạy (network WS).
  2. Ngắt SignalR (block WS trong DevTools) — hoặc tắt kết nối.
  3. Từ user B tạo thông báo cho A.
  4. Quan sát trong vòng ~60–70 giây.
  5. Khôi phục SignalR.
- **Kết quả mong đợi:** Khi không có realtime, sau ~60s polling GET `/api/v1/notifications` được gọi; thông báo mới xuất hiện sau vòng polling; khi polling + realtime cùng trả về không trùng lặp (merge/diff theo id); unmount rời trang dừng polling (không leak).
- **Verify regression:** NT-009 (P2 — không polling backup), NT-025, NT-018.

### TC-NT-010: Bell a11y — aria-live, badge, reduced-motion (P2)
- **Chuẩn bị:** Screen reader (NVDA/VoiceOver) hoặc kiểm tra DOM; bật prefers-reduced-motion.
- **Các bước:**
  1. Quan sát DOM của bell: `aria-label` động kèm số chưa đọc.
  2. Nghe SR đọc khi số badge thay đổi.
  3. Với reduced-motion: quan sát animation bell-ring.
- **Kết quả mong đợi:** aria-label động ("Thông báo (3) chưa đọc"); badge/aria-live thông báo khi cập nhật; bell-ring không chạy vô hạn khi prefers-reduced-motion; touch target ≥44px trên mobile (không 30px).
- **Verify regression:** NT-014 (aria-live/aria-label tĩnh), NT-015 (mobile vỡ), NT-028 (reduced-motion).

### TC-NT-011: formatTime hiển thị đúng mọi mốc thời gian (P2)
- **Chuẩn bị:** Seed thông báo với các mốc: vừa tạo (1 phút), 30 phút, 2 giờ, 2 ngày, 7 ngày.
- **Các bước:**
  1. Mở dropdown, quan sát chuỗi thời gian từng item.
  2. Seed 1 thông báo có `createdAt` ở tương lai (data xấu).
- **Kết quả mong đợi:** "Vừa xong" cho <1 phút; phút/giờ/ngày đúng biên (59→60 phút = "1 giờ", 23→24h = "1 ngày"); ngày tương lai/Invalid Date không hiện "Vừa xong" sai (fallback an toàn).
- **Verify regression:** NT-024 (formatTime không validate).

### TC-NT-012: Race load — mở/đóng nhanh không ghi đè dữ liệu cũ (P2)
- **Chuẩn bị:** Mạng chậm (Network throttling Slow 3G); user có nhiều thông báo.
- **Các bước:**
  1. Bấm chuông mở dropdown (trigger load).
  2. Đóng dropdown ngay → mở lại lần nữa (2 request chồng nhau).
  3. Chờ response chậm trả về.
- **Kết quả mong đợi:** Response cũ bị bỏ (sequence/AbortController) — không ghi đè danh sách mới bằng dữ liệu cũ; isLoading đúng; không flash sai.
- **Verify regression:** NT-018 (race load 2 nơi).
