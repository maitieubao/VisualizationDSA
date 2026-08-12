# 🛠️ Admin Panel — Hồ Sơ Thực Trạng & Định Hướng

## 🎯 Mục đích

- **Vấn đề người dùng:** Admin (quản trị viên) cần một mặt điều khiển để quản lý người dùng (vai trò, premium, ban), theo dõi mọi hành động nhạy cảm (audit), đóng vai học viên để kiểm tra trải nghiệm thật, và chẩn đoán sức khỏe hệ thống — tất cả phải dựa trên dữ liệu thật, không phải số liệu giả.
- **Tuyên bố giá trị:** Admin Panel là "bảng điều khiển trung tâm" giúp vận hành sản phẩm an toàn: một thao tác ban/đổi role phải có hiệu lực ngay, phải được ghi lại và phải không thể phá hệ thống (bảo vệ admin cuối cùng, chặn impersonate nhầm đối tượng).

## 📌 Thực trạng hiện tại

- Trạng thái kỹ thuật: ✅ DoD — Review Round 9 (AD-001→060; **58/60 lỗi đã fix**, AD-024/AD-044 PARTIAL), backend 507/507 + frontend 2866/2866 pass, `vue-tsc -b` 0 lỗi.
- Đang hoạt động thật:
  - Quản lý user: phân trang 10/trang, search debounce 300ms + AbortController, tạo user mới (201 + validate role), đổi role/demote admin mất quyền ngay (đối chiếu role DB), toggle premium đối chiếu order Pending (409), reset mật khẩu có rate limit, ban/unban ghi audit, bảo vệ admin cuối cùng.
  - Impersonate Student: token đủ `iss`/`aud`, mọi API 200, banner "Đóng vai", thoát về `/admin` + quyền admin nguyên vẹn, chặn impersonate Admin/Teacher.
  - Audit log: bất biến (ImmutableAuditInterceptor), phân trang thật, search debounce, UserId lấy từ token.
  - Dashboard + System: số liệu thật (audit-logs/users), đo `/health` thật, chart scale động, fallback có cờ `isFallback` rõ ràng.
  - A11y: tabs tablist, modal focus trap/Escape, lưu tab vào query.
- Giới hạn hiện tại:
  - **AD-024/AD-044 PARTIAL:** row actions vẫn dùng native `confirm()`, impersonate fetch tại component (test pin hành vi 1-click) — chưa chuẩn ConfirmDialog/startImpersonating.
  - Audit log chưa có bộ filter/search nâng cao (lọc theo action/actor/khoảng thời gian).
  - Impersonate chưa có log phiên (ai đóng vai ai, lúc nào, trong bao lâu).
  - Chưa có bulk actions (ban/xóa hàng loạt) và admin analytics theo thời gian.

## ⭐ Đánh giá giá trị thực tế: 9/10 (🟢 Thực dụng)

- **Điểm thật:** Mọi thao tác quản trị dùng hằng ngày (ban, demote, reset mật khẩu, tạo user, impersonate, xem audit, chẩn đoán) đều hoạt động thật với dữ liệu thật và được bảo vệ đúng — Admin Panel là công cụ vận hành, không phải màn hình trình diễn.
- **Điểm "ảo" (code xanh nhưng chưa thực dụng):**
  - Audit log có search nhưng chưa có filter UI nâng cao — khi log lớn, admin phải gõ từ khóa thủ công thay vì lọc theo action/ngày.
  - Impersonate chưa có log phiên — không thể trả lời "admin nào đã đóng vai học viên X".
  - Native `confirm()` vẫn còn ở row actions — trải nghiệm kém nhưng không cản trở chức năng.

## 🚧 Điều cần làm để có giá trị thực tế (checklist ưu tiên)

- [ ] Audit log filter/search nâng cao (action, actor, role, khoảng thời gian) — acceptance: admin lọc audit theo 2+ tiêu chí đồng thời, URL phản ánh bộ lọc, kết hợp phân trang.
- [ ] Log phiên impersonate — acceptance: mỗi lần đóng vai/thoát ghi audit kèm actor + target + timestamp, hiển thị trong tab Audit.
- [ ] Thay native `confirm()` bằng ConfirmDialog chuẩn (đóng AD-024) — acceptance: mọi row action dùng ConfirmDialog có focus trap/Escape, test pin đổi sang hành vi mới.
- [ ] Đưa impersonate vào `startImpersonating` store (đóng AD-044) — acceptance: fetch không còn nằm trong component, state nhất quán giữa admin và impersonate.
- [ ] Bulk actions (ban/xóa chọn nhiều user) — acceptance: chọn 2+ user → hành động hàng loạt có confirm + audit từng user + báo lỗi riêng từng dòng.

## 🧭 Hướng phát triển tiếp theo

- **Admin analytics theo thời gian** — lý do nghiệp vụ: admin cần xu hướng (user mới, XP, lượt học theo ngày/tuần) để ra quyết định; kỹ thuật: aggregate query + chart theo khoảng ngày, giữ cờ `isFallback`.
- **Bulk actions** — lý do nghiệp vụ: với hệ thống hàng nghìn user, ban từng dòng không bền; kỹ thuật: batch endpoint + transaction + audit từng phần tử.
- **Impersonate session log + cảnh báo song song** — lý do nghiệp vụ: bảo mật giám sát; kỹ thuật: tận dụng audit chain sẵn có, thêm trường impersonateSessionId.
- **Vai trò sub-admin / permissions chi tiết** — lý do nghiệp vụ: phân quyền vận hành (vd chỉ quản lý nội dung, không ban user); kỹ thuật: mở rộng role model + policy-based authorization.

## 🧪 User Stories & Test Cases (tham chiếu)

- File manual: `plan/testing/manual/Admin.md`
- US then chốt: **US-AD-001** (quản lý danh sách người dùng), **US-AD-003** (impersonate học viên), **US-AD-004** (theo dõi audit log)
- TC then chốt: **TC-AD-001** (impersonate → banner + API 200 — regression AD-001/013), **TC-AD-003** (ban user → chặn login/refresh + audit "BanUser" — regression AD-004/007), **TC-AD-004** (demote admin mất quyền ngay — regression AD-003), **TC-AD-005** (admin cuối không ban/xóa được — regression AD-023/015), **TC-AD-007** (audit search debounce + phân trang — regression AD-017/026)
