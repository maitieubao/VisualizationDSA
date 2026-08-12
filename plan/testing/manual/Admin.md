# 🛠️ Admin Panel — Hướng dẫn Manual Test

## 📋 Tổng quan
- **Scope:** `frontend/src/views/admin/**` (AdminPanelView, AdminUsersTab, AdminQuizzesTab, AdminDashboardTab, AdminAuditTab, AdminSystemTab, useAdminApi) + `useAuthStore` impersonate · backend `AdminController.cs` / `UsersController.cs` + audit chain (AuditEventService, AuditEventActionFilter, ImmutableAuditInterceptor)
- **Trạng thái:** ✅ DoD (round 9 — 58/60 lỗi đã fix; AD-024/AD-044 PARTIAL: giữ native `confirm()` cho row actions + impersonate fetch tại component)
- **Test tự động:** Backend 507/507 pass · Frontend 2866/2866 pass · `vue-tsc -b` 0 lỗi
- **Môi trường test:** Trình duyệt Chromium mới nhất; cần **tối thiểu 2 tài khoản Admin** + 1 tài khoản Student (tạo qua đăng ký) + 1 tài khoản Teacher; route `/admin` chỉ truy cập với quyền Admin
- **Lưu ý:** Các thao tác ban/xóa/impersonate đều ghi audit — sau mỗi test hãy kiểm tra tab Audit để đối chiếu

---

## 👤 User Stories

### US-AD-001: Quản lý danh sách người dùng
- **Vai trò:** Admin
- **Mục tiêu:** Admin xem, tìm kiếm, tạo mới và điều hướng danh sách user.
- **Chấp nhận:** (1) Bảng hiển thị user phân trang (10/trang); (2) tìm kiếm có debounce 300ms, không flood API; (3) tạo user mới trả 201 với role hợp lệ; (4) lỗi tải tách biệt với danh sách rỗng.

### US-AD-002: Quản lý vai trò / premium / ban
- **Vai trò:** Admin
- **Mục tiêu:** Admin đổi vai trò, toggle premium, ban/unban, reset mật khẩu, xóa user.
- **Chấp nhận:** (1) Ban user → user bị chặn login/refresh ngay + ghi audit "BanUser"; (2) demote admin → admin đó mất quyền ngay; (3) admin cuối cùng không ban/xóa được; (4) toggle premium khi user có order pending → 409.

### US-AD-003: Impersonate học viên
- **Vai trò:** Admin
- **Mục tiêu:** Admin đóng vai Student để kiểm tra trải nghiệm thật.
- **Chấp nhận:** (1) Chỉ impersonate Student (không phải Admin/Teacher); (2) token impersonate hợp lệ (iss/aud), mọi API 200; (3) banner "Đóng vai" hiển thị; (4) thoát đóng vai → quay về `/admin` với quyền admin nguyên vẹn.

### US-AD-004: Theo dõi audit log
- **Vai trò:** Admin
- **Mục tiêu:** Admin xem lịch sử hành động nhạy cảm, tìm kiếm và phân trang.
- **Chấp nhận:** (1) Audit log phân trang thật (không giới hạn 100 dòng); (2) search debounce 300ms; (3) audit không thể bị sửa/xóa; (4) nút Làm mới hoạt động.

### US-AD-005: Dashboard và chẩn đoán hệ thống
- **Vai trò:** Admin
- **Mục tiêu:** Admin xem thống kê thật (không phải dữ liệu giả).
- **Chấp nhận:** (1) Dashboard lấy số liệu thật từ DB/API, nếu fallback phải có cờ rõ ràng; (2) System tab đo `/health` thật; (3) chart scale động theo dữ liệu.

---

## 🧪 Test Cases

### TC-AD-001: Impersonate Student → banner "Đóng vai" + API hoạt động (P0)
- **Chuẩn bị:** Tài khoản Admin; Student target đang active. Mở DevTools Network.
- **Các bước:**
  1. Vào `/admin` → tab Users.
  2. Tìm Student → bấm nút "Đóng vai".
  3. Quan sát UI sau khi impersonate; theo dõi các request trong Network.
  4. Mở `/profile` và một trang có dữ liệu (ví dụ `/sorting`).
- **Kết quả mong đợi:** (1) Banner "Đóng vai" (đóng vai...) hiển thị rõ ràng trên toàn app; (2) **mọi request mang token impersonate trả 200** — không còn 401 (token mới có đủ claim `iss`/`aud`); (3) profile hiển thị đúng `currentLevel`/`totalXP`/`streakDays`/`badges` của Student (không NaN); (4) giao diện giống hệt học viên thật.
- **Verify regression:** **AD-001** (lỗi P0 — impersonate token thiếu iss/aud → toàn bộ request 401: đã fix thêm claim vào `GenerateImpersonatedJwt`) + **AD-013** (impersonate response shape đúng `StatelessUserDto`).

### TC-AD-002: Thoát đóng vai → về /admin + quyền admin khôi phục (P0)
- **Chuẩn bị:** Đang trong trạng thái impersonate (từ TC-AD-001).
- **Các bước:**
  1. Bấm nút "Thoát đóng vai" trên banner.
  2. Quan sát điều hướng + quyền.
  3. Nếu impersonate kéo dài > 15 phút (access token hết hạn), thử thoát.
- **Kết quả mong đợi:** (1) Quay về `/admin` đúng tab Users; (2) token admin thật được khôi phục — truy cập mọi tab admin OK, không bị 401 im lặng; (3) banner "Đóng vai" biến mất; (4) toast thông báo thoát đóng vai (không dùng `alert()` native); (5) trường hợp token hết hạn → refresh token impersonate vẫn giữ marker, thoát được bình thường.
- **Verify regression:** **AD-014** (stopImpersonating gán token admin hết hạn → /admin 401 im lặng: đã fix refresh token hết hạn) + **AD-043** (refresh impersonate giữ marker) + **AD-051** (alert native → toast).

### TC-AD-003: Ban user → chặn login/refresh ngay + audit "BanUser" (P0)
- **Chuẩn bị:** Admin + Student B đang đăng nhập ở cửa sổ khác.
- **Các bước:**
  1. Admin: Users tab → tìm B → bấm "Khóa" (Ban) → xác nhận.
  2. Cửa sổ của B: thao tác bất kỳ (refresh trang, mở `/profile`).
  3. Cửa sổ của B: đăng xuất rồi thử đăng nhập lại.
  4. Admin: vào tab Audit, tìm log liên quan B.
- **Kết quả mong đợi:** (1) B bị chặn ngay: refresh trả 401 → toast "Phiên đã hết hạn" + redirect; (2) đăng nhập lại bị từ chối dù đúng mật khẩu; (3) **audit log ghi nhận hành động "BanUser"** kèm actor là admin thực hiện; (4) nút ban của B đổi trạng thái (đã khóa).
- **Verify regression:** **AD-004** (BanUser không ghi audit — đã fix: `LogAdminAction("BanUser"/"UnbanUser")`) + **AD-007** (audit UserId lấy từ token) + AU-011/AU-039 (ban check ở auth).

### TC-AD-004: Demote admin → mất quyền ngay (P0)
- **Chuẩn bị:** 2 tài khoản Admin (A thao tác, B bị demote). B đang mở `/admin`.
- **Các bước:**
  1. A: Users tab → tìm B → đổi role Admin → Student.
  2. B: refresh `/admin` hoặc bấm nút bất kỳ.
  3. B: thử vào lại `/admin`.
- **Kết quả mong đợi:** (1) B **mất quyền ngay** — request admin đầu tiên trả 403, không chờ token hết hạn 15 phút (role đối chiếu DB); (2) `/admin` chặn B, redirect về dashboard; (3) B không thể tự đổi lại role của mình.
- **Verify regression:** **AD-003** (role check từ claim không đối chiếu DB — đã fix: `RequireJwtRole` đối chiếu role DB + chặn tự đổi role).

### TC-AD-005: Admin cuối cùng không ban/xóa được (P0)
- **Chuẩn bị:** Chỉ còn 1 tài khoản Admin duy nhất trong hệ thống (hoặc tạm thời tạo trạng thái này).
- **Các bước:**
  1. Admin duy nhất: Users tab → tự tìm chính mình.
  2. Thử bấm "Khóa" và "Xóa".
  3. Nếu bấm được, xác nhận trong dialog.
- **Kết quả mong đợi:** Nút Ban/Xóa bị **disable** hoặc backend trả 409 `LAST_ADMIN_PROTECTED`; nhãn cảnh báo "⚠ Cuối cùng" hiển thị đúng (dựa trên tổng số admin toàn hệ thống, không phải trang hiện tại); admin không thể tự khóa mình.
- **Verify regression:** **AD-023** (admin cuối không được bảo vệ khi Ban/Xóa — đã fix: backend LAST_ADMIN_PROTECTED + disable nút) + **AD-015** (isLastAdmin tính toàn cục).

### TC-AD-006: Toggle premium khi user có order pending → 409 (P1)
- **Chuẩn bị:** Student C có 1 order đang 'Pending' (tạo qua `/checkout`, chưa webhook).
- **Các bước:**
  1. Admin: Users tab → tìm C → bấm "Premium" (toggle).
  2. Quan sát response/UI.
- **Kết quả mong đợi:** Backend đối chiếu order Pending → trả **409** (kèm lý do tiếng Việt); trạng thái premium của C không thay đổi; UI hiển thị lỗi rõ ràng (toast) — ngăn nguy cơ thu hồi/cấp sai để webhook sau đó bật lại trạng thái mâu thuẫn.
- **Verify regression:** **AD-032** (TogglePremium không đối chiếu Orders — đã fix: chặn khi có order Pending).

### TC-AD-007: Xem audit log + tìm kiếm debounce (P1)
- **Chuẩn bị:** Ít nhất vài chục dòng audit (chạy vài thao tác ban/demote/toggle ở trên).
- **Các bước:**
  1. Vào tab Audit.
  2. Gõ từ khóa (ví dụ tên user hoặc "BanUser") và theo dõi Network.
  3. Chuyển trang (nếu > 1 trang).
  4. Bấm nút "Làm mới".
- **Kết quả mong đợi:** (1) Search chỉ gửi request sau ~300ms dừng gõ (debounce), không 1 request/phím; (2) kết quả search đúng, URL search được encode; (3) phân trang thật — xem được log cũ hơn trang 1; (4) nút Làm mới tải lại, bị disabled khi đang loading; (5) lỗi tải hiển thị rõ (không phải trạng thái rỗng giả).
- **Verify regression:** **AD-017** (search flood + race — đã fix: debounce 300ms + AbortController) + **AD-026** (pageSize 100 không phân trang — đã fix: pagination thật) + **AD-016** (lỗi tách empty).

### TC-AD-008: Impersonate chặn target Admin/Teacher (P1)
- **Chuẩn bị:** Admin + 1 Teacher + 1 Admin khác trong bảng users.
- **Các bước:**
  1. Admin: thử bấm "Đóng vai" trên tài khoản Teacher.
  2. Thử bấm "Đóng vai" trên tài khoản Admin khác.
- **Kết quả mong đợi:** Bị chặn: UI ẩn/disable nút hoặc backend trả 409 với thông báo rõ ràng; không impersonate được Admin/Teacher; không có quyền admin dưới danh tính người khác.
- **Verify regression:** **AD-002** (không chặn impersonate Admin/Teacher — đã fix: chỉ impersonate Student).

### TC-AD-009: Tìm kiếm người dùng — debounce + reset trang (P2)
- **Chuẩn bị:** Hệ thống có ≥ 15 user.
- **Các bước:**
  1. Users tab → sang trang 2.
  2. Gõ từ khóa tìm kiếm, chờ 300ms.
  3. Quan sát kết quả + Network.
- **Kết quả mong đợi:** Search đúng giá trị (URL encoded, case-insensitive theo backend); khi gõ từ khóa mới, page reset về 1; không có response cũ ghi đè response mới (race out-of-order); gõ nhanh liên tục chỉ 1 request cuối.
- **Verify regression:** AD-017 + **AD-060** (test search không assert encoded/page reset).

### TC-AD-010: Xóa user có ràng buộc FK → xử lý rõ ràng (P2)
- **Chuẩn bị:** Student đã tham gia 1 lớp học / có progress (có ràng buộc dữ liệu liên quan).
- **Các bước:**
  1. Users tab → tìm Student → bấm "Xóa" → xác nhận.
  2. Quan sát response.
- **Kết quả mong đợi:** (1) Nếu có dữ liệu ràng buộc không thể xóa → trả **409 Conflict** kèm lý do tiếng Việt (không phải 500 FK violation); (2) nếu xóa được → dữ liệu progress dọn sạch (await đầy đủ), không request fire-and-forget; (3) audit ghi hành động xóa.
- **Verify regression:** **AD-005** (`ExecuteDeleteAsync` không await → FK violation 500: đã fix await + Conflict rõ ràng).

### TC-AD-011: Tạo user mới → 201 + validate role (P2)
- **Chuẩn bị:** Admin đang ở Users tab.
- **Các bước:**
  1. Bấm "Tạo người dùng".
  2. Nhập username/email/mật khẩu, chọn role Student → submit.
  3. Nhập role không hợp lệ (nếu UI cho chọn tự do) → submit.
  4. Bấm Enter 2 lần nhanh để thử double-create.
- **Kết quả mong đợi:** (1) Tạo thành công → response **201** + user xuất hiện trong bảng; (2) role lạ bị validate (không im lặng đổi về Student); (3) double-submit bị chặn (1 request duy nhất); (4) thiếu field → lỗi inline.
- **Verify regression:** **AD-033** (CreateUser không validate role + trả 200 — đã fix: validate + 201) + **AD-047** (Enter double-create).

### TC-AD-012: Reset mật khẩu người dùng (P2)
- **Chuẩn bị:** Admin + Student D.
- **Các bước:**
  1. Users tab → D → "Reset mật khẩu" → xác nhận.
  2. Thử đăng nhập D bằng mật khẩu cũ.
  3. Gửi 20+ request reset nhanh để kiểm tra rate limit.
- **Kết quả mong đợi:** (1) Reset thành công — mật khẩu cũ hết hiệu lực, có hướng dẫn reset hợp lệ; (2) rate limit 429 sau ngưỡng (không brute-force được); (3) audit ghi hành động.
- **Verify regression:** **AD-009** (ResetPassword không rate limit — đã fix) + **AD-031** (rate limiter atomic).

### TC-AD-013: Teacher truy cập /admin → redirect (P1)
- **Chuẩn bị:** Tài khoản Teacher.
- **Các bước:**
  1. Đăng nhập Teacher.
  2. Vào URL `/admin`.
- **Kết quả mong đợi:** Bị router guard chặn: redirect về dashboard (hoặc trang phù hợp), không thấy bất kỳ dữ liệu admin nào; không có "flash" hiển thị panel trước khi chặn.
- **Verify regression:** **AD-058** (guard Teacher → /admin: đã fix test + redirect).

### TC-AD-014: Dashboard & System tab dùng dữ liệu thật (P1)
- **Chuẩn bị:** Admin; hệ thống có vài user/thao tác gần đây.
- **Các bước:**
  1. Vào tab Dashboard: quan sát thống kê, chart, "Top 5 học viên", "Nhật ký hệ thống".
  2. Vào tab System: bấm "Chạy chẩn đoán".
  3. Theo dõi Network.
- **Kết quả mong đợi:** (1) Số liệu khớp dữ liệu thật (request audit-logs/users thật) — **không có chữ "(Simulated)" hay số ngẫu nhiên**; (2) chart scale động theo số liệu (5 hay 500 lượt không vẽ y hệt); (3) top 5 có empty state khi chưa có dữ liệu; (4) System đo `/health` thật, nút có trạng thái running; (5) nếu DB down → fallback có cờ `isFallback` hiển thị cảnh báo.
- **Verify regression:** **AD-021** (dashboard/system data fake — đã fix: fetch audit-logs + /health thật) + **AD-006** (fallback xác nhận + isFallback flag) + **AD-029** (chart scale động).

---

## 📊 Tổng kết bộ test

| Hạng mục | Số lượng |
| :--- | :--- |
| User Stories | 5 (US-AD-001 → 005) |
| Test Cases | 14 (TC-AD-001 → 014) — P0: 5 · P1: 5 · P2: 4 |
| Lỗi P0/P1 verify regression | AD-001, AD-014, AD-043, AD-051, AD-004, AD-007, AD-003, AD-023, AD-015, AD-032, AD-017, AD-026, AD-016, AD-002, AD-005, AD-033, AD-009, AD-031, AD-058, AD-021, AD-006, AD-029 |
