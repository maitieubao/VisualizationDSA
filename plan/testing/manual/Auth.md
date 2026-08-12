# 🔐 Auth (Xác thực người dùng) — Hướng dẫn Manual Test

## 📋 Tổng quan
- **Scope:** `frontend/src/features/auth/**` (useAuthStore, statelessAuthApi, authApi, LoginModal) + `services/apiClient.ts` + `router/index.ts` + `main.ts` + `App.vue` · backend `AuthController.cs` / `StatelessAuthController.cs` / `AuthService.cs` / `StatelessAuthStrategy.cs`
- **Trạng thái:** ✅ DoD (round 7 — 54/55 lỗi đã fix; AU-045 PARTIAL giữ nhánh classic authApi)
- **Test tự động:** Backend 416/416 pass · Frontend 2826/2826 pass · `vue-tsc -b` 0 lỗi
- **Môi trường test:** Trình duyệt Chromium mới nhất, viewport ≥ 1280px, frontend dev server + backend API đang chạy
- **Lưu ý:** Mỗi test case nên chạy trên cửa sổ / profile riêng (hoặc `localStorage` đã xóa) để tránh phiên cũ làm nhiễu kết quả

---

## 👤 User Stories

### US-AU-001: Đăng ký tài khoản sinh viên mới
- **Vai trò:** Khách
- **Mục tiêu:** Khách tạo tài khoản Student mới hợp lệ để vào hệ thống.
- **Chấp nhận:** (1) Đăng ký thành công → tự đăng nhập, vào trang chủ; (2) phải nhập "Xác nhận mật khẩu" khớp với mật khẩu; (3) email trùng / mật khẩu ngắn → lỗi inline tiếng Việt, không tạo tài khoản; (4) form không bị đóng khi click backdrop.

### US-AU-002: Đăng nhập với email + mật khẩu
- **Vai trò:** Student / Teacher / Admin
- **Mục tiêu:** Người dùng đã có tài khoản đăng nhập và duy trì phiên.
- **Chấp nhận:** (1) Đúng email + mật khẩu → đăng nhập thành công, header hiển thị avatar + tên; (2) sai mật khẩu → thông báo lỗi inline, không logout người dùng đang đăng nhập; (3) user bị ban → bị từ chối dù mật khẩu đúng.

### US-AU-003: Duy trì phiên khi token hết hạn (refresh token)
- **Vai trò:** Student / Teacher / Admin
- **Mục tiêu:** Access token hết hạn được refresh âm thầm; chỉ khi refresh thất bại mới thông báo.
- **Chấp nhận:** (1) Access token hết hạn → tự gọi refresh, user không bị mất phiên; (2) refresh token cũng hết hạn → toast "Phiên đã hết hạn" + redirect về landing kèm route nguồn; (3) request 401 khi không có refresh token không sinh console.error spam.

### US-AU-004: Đổi mật khẩu
- **Vai trò:** Student
- **Mục tiêu:** Người dùng đổi mật khẩu, toàn bộ phiên khác bị thu hồi ngay.
- **Chấp nhận:** (1) Đổi thành công khi mật khẩu hiện tại đúng → toast thành công; (2) sau khi đổi, phiên trên thiết bị khác (đang đăng nhập bằng mật khẩu cũ) bị đăng xuất; (3) sai mật khẩu hiện tại / confirm không khớp → lỗi inline theo field + focus.

### US-AU-005: Đăng xuất an toàn
- **Vai trò:** Student / Teacher / Admin
- **Mục tiêu:** Đăng xuất xóa phiên, reset toàn bộ store phụ thuộc, không làm nhiễu người dùng kế tiếp.
- **Chấp nhận:** (1) Logout có confirm; (2) sau logout, XP pending queue của user A không bị flush sang user B đăng nhập sau; (3) quiz/progress/notification hiển thị state đã đăng xuất.

### US-AU-006: Impersonate (đóng vai học viên)
- **Vai trò:** Admin
- **Mục tiêu:** Admin đóng vai Student để xem giao diện thật của học viên.
- **Chấp nhận:** (1) Impersonate token chứa đủ claim `iss`/`aud` → mọi API gọi đều 200; (2) hiện banner "Đóng vai" rõ ràng; (3) thoát đóng vai trả về quyền admin.

---

## 🧪 Test Cases

### TC-AU-001: Đăng ký tài khoản mới thành công (P0)
- **Chuẩn bị:** Vào `/`, chưa đăng nhập; chuẩn bị email + username chưa tồn tại.
- **Các bước:**
  1. Click "Đăng nhập" trên header → modal mở.
  2. Chuyển tab "Đăng ký".
  3. Nhập username, email (ví dụ `student1@test.com`), mật khẩu ≥ 8 ký tự, nhập lại đúng mật khẩu ở ô "Xác nhận mật khẩu".
  4. Submit.
- **Kết quả mong đợi:** Đăng ký thành công, tự đăng nhập, chuyển về trang chủ; header hiển thị avatar ký tự đầu tên; không có lỗi console.
- **Verify regression:** Register flow (AU-003).

### TC-AU-002: Xác nhận mật khẩu không khớp bị chặn (P1)
- **Chuẩn bị:** Mở modal đăng ký.
- **Các bước:**
  1. Nhập mật khẩu `Abc@12345`.
  2. Nhập ô "Xác nhận mật khẩu" khác ký tự: `Abc@12346`.
  3. Submit.
- **Kết quả mong đợi:** Chặn ngay phía client: lỗi inline "Mật khẩu không khớp", không gọi API đăng ký, tài khoản không được tạo.
- **Verify regression:** **AU-018** (register thiếu ô "Xác nhận mật khẩu" — đã fix: thêm field confirm + so khớp client-side).

### TC-AU-003: Đăng nhập đúng thông tin thành công (P0)
- **Chuẩn bị:** Tài khoản Student đã đăng ký ở TC-AU-001.
- **Các bước:**
  1. Logout nếu đang đăng nhập.
  2. Mở modal đăng nhập.
  3. Nhập đúng email + mật khẩu.
  4. Submit.
- **Kết quả mong đợi:** Đăng nhập thành công, modal đóng, trả focus về nút mở modal; header đổi thành avatar + tên; truy cập trang cần quyền (ví dụ `/profile`) không bị chặn.
- **Verify regression:** Login happy path (AU-002/003).

### TC-AU-004: Đăng nhập sai mật khẩu → lỗi inline (P0)
- **Chuẩn bị:** Tài khoản đã có.
- **Các bước:**
  1. Mở modal đăng nhập.
  2. Nhập email đúng + mật khẩu sai (vd đúng `Abc@12345`, gõ `abc123`).
  3. Submit.
- **Kết quả mong đợi:** Không đăng nhập; hiện lỗi inline tiếng Việt gắn field (ví dụ "Email hoặc mật khẩu không đúng"), không phải toast 6s; focus quay lại field lỗi; nút submit về trạng thái sẵn sàng.
- **Verify regression:** Login fail path + per-action loading (AU-050).

### TC-AU-005: Email không tồn tại — không lộ thông tin (P2)
- **Chuẩn bị:** Email chắc chắn chưa đăng ký.
- **Các bước:**
  1. Đăng nhập với email lạ + mật khẩu bất kỳ.
  2. Quan sát thông báo lỗi.
- **Kết quả mong đợi:** Lỗi chung generic (không phân biệt "email không tồn tại" vs "sai mật khẩu"); thời gian phản hồi tương đương trường hợp email tồn tại (bù timing side-channel); register email trùng → 400/409 generic, không nói "đã được sử dụng".
- **Verify regression:** AU-013 (user enumeration) + AU-014 (timing side-channel) + AU-012 (TOCTOU register → 400).

### TC-AU-006: Access token hết hạn → tự refresh, phiên sống (P1)
- **Chuẩn bị:** Đăng nhập thành công; access token TTL ngắn (có thể cấu hình env Jwt AccessTokenLifetime = 60s).
- **Các bước:**
  1. Đợi access token hết hạn (hoặc chỉnh clock dev).
  2. Thao tác bất kỳ gọi API yêu cầu auth (mở `/profile`, `/admin` nếu là admin).
  3. Theo dõi Network tab.
- **Kết quả mong đợi:** Request đầu trả 401 → client gọi `/auth/refresh` → retry request cũ thành công; user không bị logout; chỉ 1 request refresh duy nhất (single-flight) kể cả khi nhiều request 401 đồng thời.
- **Verify regression:** AU-004 (refresh rotation + reuse detection) + AU-042→044.

### TC-AU-007: Refresh token hết hạn → toast "Phiên đã hết hạn" + redirect (P0)
- **Chuẩn bị:** Đăng nhập, sau đó xóa refresh token khỏi localStorage (hoặc chờ hết TTL refresh 30 ngày) để buộc refresh fail.
- **Các bước:**
  1. Thao tác gọi API (ví dụ mở trang có fetch dữ liệu).
  2. Quan sát toast + điều hướng.
- **Kết quả mong đợi:** Toast cảnh báo "Phiên đã hết hạn" xuất hiện; redirect về trang đăng nhập/landing; nếu trước đó đang ở `/sorting` thì sau khi đăng nhập lại quay về đúng route nguồn đó; header trở về trạng thái "Đăng nhập"; data user cũ (XP/history) không còn hiển thị.
- **Verify regression:** **AU-007** (session expiry âm thầm — đã fix: toast + redirect kèm route nguồn) + AU-008 (init chỉ clear session khi 4xx).

### TC-AU-008: Đổi mật khẩu → revoke toàn bộ phiên khác (P0)
- **Chuẩn bị:** 2 thiết bị/2 profile cùng đăng nhập 1 tài khoản. Thiết bị A dùng `/profile` → tab Bảo mật.
- **Các bước:**
  1. Thiết bị A nhập mật khẩu hiện tại đúng + mật khẩu mới + xác nhận → Đổi.
  2. Trên thiết bị B, chờ 30s rồi thao tác bất kỳ (refresh `/profile`).
  3. Trên thiết bị A, logout rồi thử login bằng mật khẩu CŨ.
- **Kết quả mong đợi:** (1) Thiết bị A đổi thành công, toast xác nhận; (2) thiết bị B bị đăng xuất ngay — mọi refresh token cũ trả 401, hiện toast "Phiên đã hết hạn"; (3) đăng nhập bằng mật khẩu cũ bị từ chối, mật khẩu mới hoạt động bình thường.
- **Verify regression:** **AU-022** (đổi mật khẩu không revoke session khác — đã fix: `RevokeAllRefreshTokens`).

### TC-AU-009: Logout không làm trôi XP queue của user khác (P1)
- **Chuẩn bị:** 2 tài khoản A (có XP pending trong `pendingSyncQueue` localStorage — ví dụ vừa làm quiz có cộng XP chưa sync) và B.
- **Các bước:**
  1. Đăng nhập A, làm 1 quiz để XP vào queue, KHÔNG đợi sync xong.
  2. Logout A (confirm).
  3. Đăng nhập B ngay lập tức, làm 1 thao tác cộng XP.
  4. Kiểm tra XP cuối của B.
- **Kết quả mong đợi:** XP của A không xuất hiện trên tài khoản B; queue sau logout được xóa (hoặc gắn `userId` nên không bao giờ gửi sang user khác); profile B hiển thị XP đúng của B.
- **Verify regression:** **AU-006** (logout không reset store phụ thuộc + XP queue không gắn userId — đã fix: reset store + gắn userId vào payload queue).

### TC-AU-010: Login khi user bị ban → bị từ chối (P0)
- **Chuẩn bị:** Tài khoản Student đã bị Admin ban (xem Admin TC-AD-003).
- **Các bước:**
  1. Thử đăng nhập với tài khoản bị ban.
  2. Nếu vẫn còn phiên cũ, thử refresh bằng token cũ.
- **Kết quả mong đợi:** Đăng nhập bị từ chối (401), thông báo lỗi tiếng Việt rõ ràng; token refresh của user bị ban cũng bị vô hiệu — kể cả khi DB/API đang bất thường (fail-closed), không bao giờ để user bị ban lọt phiên.
- **Verify regression:** **AU-011** (standard refresh thiếu ban check — đã fix) + **AU-039** (ban check fail-open khi DB lỗi — đã fix: fail-closed).

### TC-AU-011: User bị ban giữa phiên → phiên chết ở refresh kế tiếp (P1)
- **Chuẩn bị:** Tài khoản A đang đăng nhập. Người test thứ 2 (Admin) ban A qua Admin Panel.
- **Các bước:**
  1. Trên phiên A, đợi access token hết hạn hoặc refresh trang.
  2. Quan sát hành vi.
- **Kết quả mong đợi:** Refresh trả 401 → toast "Phiên đã hết hạn" + redirect landing; không còn data user; sau khi unban (Admin) thì đăng nhập lại bình thường.
- **Verify regression:** AU-011 + AU-039.

### TC-AU-012: Đăng ký email trùng → 400 generic (P2)
- **Chuẩn bị:** Email đã tồn tại.
- **Các bước:**
  1. Mở modal đăng ký, nhập email trùng + thông tin hợp lệ khác.
  2. Submit và quan sát.
- **Kết quả mong đợi:** Trả 400/409 với message generic tiếng Việt, không tiết lộ "email đã được sử dụng" dạng enumeration; không sinh refresh token; UI hiển thị lỗi inline.
- **Verify regression:** AU-012 + AU-013 + AU-037 (email normalize: register `User@Test.COM` → login `user@test.com` thành công).

### TC-AU-013: Impersonate admin → token mới có iss/aud, API gọi được (P1)
- **Chuẩn bị:** Tài khoản Admin; tài khoản Student target. (Chi tiết luồng đầy đủ ở Admin TC-AD-001/002.)
- **Các bước:**
  1. Admin mở `/admin` → Users tab → chọn Student → "Đóng vai".
  2. Kiểm tra localStorage: token impersonate (key `ADMIN_*`) phải tồn tại.
  3. Thực hiện các thao tác cần API (mở `/sorting`, mở `/profile`) và theo dõi Network.
- **Kết quả mong đợi:** Mọi request mang token impersonate trả 200 (không có 401 do thiếu claim); banner "Đóng vai" hiển thị; profile hiển thị đúng `currentLevel`/`totalXP`/`streakDays`/`badges` của Student.
- **Verify regression:** **AD-001** (impersonate token thiếu iss/aud → 401 hàng loạt — đã fix: thêm claim `iss`/`aud`).

### TC-AU-014: Modal login reset khi đóng/mở + focus trap (P2)
- **Chuẩn bị:** Chưa đăng nhập.
- **Các bước:**
  1. Mở modal đăng nhập, nhập email/mật khẩu sai 1 lần.
  2. Đóng modal bằng Esc, mở lại.
  3. Bấm Tab liên tục quan sát vòng focus; click backdrop.
- **Kết quả mong đợi:** Mở lại modal: form sạch (không giữ password cũ), lỗi cũ không còn hiển thị; autofocus vào ô email; Tab bị trap trong modal, Esc đóng và trả focus về phần tử mở modal; click backdrop KHÔNG đóng modal (tránh mất dữ liệu đang nhập).
- **Verify regression:** AU-019 (focus trap/autofocus) + AU-046 (form không reset) + AU-047 (authError không clear) + AU-051 (backdrop guard).

---

## 📊 Tổng kết bộ test

| Hạng mục | Số lượng |
| :--- | :--- |
| User Stories | 6 (US-AU-001 → 006) |
| Test Cases | 14 (TC-AU-001 → 014) — P0: 6 · P1: 4 · P2: 4 |
| Lỗi P0/P1 verify regression | AU-018, AU-007, AU-022, AU-006, AU-011, AU-039, AD-001, AU-013, AU-014, AU-012 |
