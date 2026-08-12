# 👤 User Profile — Hướng dẫn Manual Test

## 📋 Tổng quan
- **Scope:** `views/profile/**` (ProfileView + 6 tabs) + `useAuthStore` (loadStatelessProfile) + `services/quizApi.ts` · backend `UsersController.cs` / `StatelessAuthController.cs` (UpdateProfile) / `StatelessQuizController.cs` (history) / `StatelessAuthStrategy.cs`
- **Trạng thái:** ✅ DoD (round 18 — 37/37 lỗi đã fix)
- **Test tự động:** frontend 3298/3298 pass (184 files) + backend 720/720 pass (`vue-tsc` 0 lỗi)
- **Môi trường:** Chrome/Edge mới nhất, tài khoản thường (Student) đã có lịch sử làm quiz ít nhất 1 lần (gồm cả quiz bank).

## 👤 User Stories

### US-PR-001: Người dùng xem và cập nhật thông tin cá nhân
- **Vai trò:** Người dùng (Student)
- **Mục tiêu:** Xem/sửa username, bio, thông tin tài khoản; thay đổi được lưu bền vững.
- **Chấp nhận:** Đổi username/bio → lưu → refresh trang vẫn còn (persist DB); username trùng/không hợp lệ hiển thị lỗi inline ngay tại ô input.

### US-PR-002: Người dùng upload avatar
- **Vai trò:** Người dùng
- **Mục tiêu:** Upload ảnh đại diện, xem preview trước khi lưu.
- **Chấp nhận:** Chọn ảnh → preview hiển thị; lưu → avatarUrl cập nhật trên toàn hệ thống sau refresh.

### US-PR-003: Người dùng xem lịch sử làm quiz
- **Vai trò:** Người dùng
- **Mục tiêu:** Xem đầy đủ lịch sử attempt của mọi quiz (kể cả quiz bank).
- **Chấp nhận:** History hiển thị cả attempt quiz thường lẫn quiz bank; phân trang hoạt động; lỗi mạng/5xx hiện error state tách biệt với empty.

### US-PR-004: Người dùng quản lý tiến trình, ưu tiên và bảo mật
- **Vai trò:** Người dùng
- **Mục tiêu:** Xem streak/level chính xác từ server; chỉnh preferences tốc độ thật sự được dùng; đổi mật khẩu an toàn.
- **Chấp nhận:** Streak/level đúng dữ liệu server; preference speed ảnh hưởng playback thật; đổi mật khẩu lỗi hiển thị inline + focus đúng ô.

### US-PR-005: Người dùng điều hướng Profile bằng bàn phím
- **Vai trò:** Người dùng
- **Mục tiêu:** Thao tác tabs/modal bằng bàn phím chuẩn a11y.
- **Chấp nhận:** Escape đóng modal + restore focus; tabs dùng ARIA tablist và phím mũi tên.

## 🧪 Test Cases

### TC-PR-001: Đổi username/bio → persist sau refresh (P0)
- **Chuẩn bị:** Đăng nhập, vào Profile → tab General.
- **Các bước:** 1. Sửa username thành tên mới (3–100 ký tự) + bio mới. 2. Bấm "Lưu". 3. F5 trang. 4. Mở lại tab General.
- **Kết quả mong đợi:** Lưu thành công (toast/feedback); sau F5 username/bio vẫn hiển thị giá trị mới (không mất sau restart/evict).
- **Verify regression:** PR-001 (P0 — UpdateProfile chỉ sửa in-memory không persist DB)

### TC-PR-002: Upload avatar → preview + lưu (P0)
- **Chuẩn bị:** Ảnh đại diện PNG/JPG hợp lệ.
- **Các bước:** 1. Tab General → bấm vào vùng avatar. 2. Chọn ảnh. 3. Kiểm tra preview hiển thị. 4. Bấm "Lưu". 5. F5 và kiểm tra avatar ở header + profile.
- **Kết quả mong đợi:** Preview ảnh hiển thị ngay sau khi chọn; request upload dạng FormData không kèm Content-Type thừa; sau F5 avatar mới hiển thị mọi nơi.
- **Verify regression:** PR-005 (P0 — không có upload avatar)

### TC-PR-003: History hiển thị attempt của cả quiz bank (P0)
- **Chuẩn bị:** Người dùng đã làm: 1 quiz thường (course) + 1 quiz bank (từ lesson/playground).
- **Các bước:** 1. Profile → tab History. 2. Quan sát bảng lịch sử.
- **Kết quả mong đợi:** Cả attempt quiz thường lẫn quiz bank đều xuất hiện; cột điểm/tên quiz hiển thị đúng (title không trống).
- **Verify regression:** PR-002 (P0 — bank quiz không ghi QuizAttempt → history rỗng)

### TC-PR-004: Quiz history phân trang hoạt động (P1)
- **Chuẩn bị:** Người dùng có đủ số attempt để nhiều hơn 1 trang (theo page size hiện tại).
- **Các bước:** 1. Vào tab History. 2. Bấm nút trang 2 / "Tiếp". 3. Quan sát dữ liệu.
- **Kết quả mong đợi:** Phân trang chuyển đúng trang, không reset về trang 1; bảng không vỡ layout trên mobile (cuộn ngang/đáp ứng).
- **Verify regression:** PR-032 (P2 — backend trả toàn bộ không phân trang + bảng kẹt mobile)

### TC-PR-005: History error state tách biệt với empty (P1)
- **Chuẩn bị:** DevTools Network Offline.
- **Các bước:** 1. Vào tab History khi Offline. 2. Quan sát giao diện. 3. Bật Online, bấm "Thử lại" (nếu có). 4. Với tài khoản không có attempt, vào History.
- **Kết quả mong đợi:** Lỗi mạng/5xx → hiển thị thông báo lỗi rõ (không phải "Chưa có lịch sử"); empty state chỉ hiện khi thực sự không có attempt.
- **Verify regression:** PR-014 (P2 — 401/5xx → "Chưa có lịch sử" giả)

### TC-PR-006: Preferences — tốc độ thật được áp dụng (P0)
- **Chuẩn bị:** Người dùng có quyền vào Sorting Visualizer.
- **Các bước:** 1. Profile → tab Preferences, đổi tốc độ playback (vd: 2.0x), bật segment active. 2. Lưu. 3. Mở Sorting Visualizer, chạy thuật toán.
- **Kết quả mong đợi:** Tốc độ playback mới được áp dụng thật (kiểm tra bằng đồng hồ/đếm frame); toggle có role=switch; sau F5 preference vẫn còn (lưu vào `dsa_preferences`).
- **Verify regression:** PR-012 (P2 — preferences dead 3 key `vdsa_pref_*`)

### TC-PR-007: Đổi mật khẩu — lỗi inline + focus đúng ô (P0)
- **Chuẩn bị:** Tab Security.
- **Các bước:** 1. Để trống current password, bấm "Đổi mật khẩu". 2. Nhập current < 8 ký tự. 3. Nhập mật khẩu mới không khớp xác nhận. 4. Nhập sai mật khẩu hiện tại. 5. Nhập hợp lệ.
- **Kết quả mong đợi:** Mỗi trường hợp lỗi đều có thông báo inline tại đúng ô + focus chuyển về ô lỗi; lỗi server (sai mật khẩu hiện tại) hiển thị fieldErrors; 401 → toast phiên hết hạn; thành công → toast + reset form.
- **Verify regression:** PR-008 (P1 — logic change password không test), PR-028 (P3 — dead fieldErrors)

### TC-PR-008: Streak/Level hiển thị đúng từ server (P1)
- **Chuẩn bị:** Người dùng có hoạt động vài ngày gần đây (streak thật).
- **Các bước:** 1. Profile → tab Progress. 2. Đối chiếu streak/level/XP với giá trị trên bảng xếp hạng/workspace.
- **Kết quả mong đợi:** currentStreak/lastActiveDate/level khớp server (không bị ép bằng hôm nay); xpToNext không âm ("Cần thêm -10 XP" không xuất hiện); thanh tiến trình dùng level config từ server.
- **Verify regression:** PR-025 (P3 — không consume gamification contract), PR-016 (P2 — clamp XP), PR-026 (P3 — levelThresholds hardcode)

### TC-PR-009: Escape đóng modal + restore focus (P0)
- **Chuẩn bị:** Mở Profile → tab General → mở modal (vd: avatar/change email).
- **Các bước:** 1. Bấm phím Escape. 2. Quan sát. 3. Mở lại modal, bấm Tab liên tục.
- **Kết quả mong đợi:** Escape đóng modal; focus quay về phần tử mở modal; Tab bị trap trong modal (không bay ra ngoài); nền không cuộn khi modal mở.
- **Verify regression:** PR-003 (P0 — thiếu role=dialog/aria-modal/focus trap), PR-019 (P2 — không autofocus/restore focus + nền cuộn)

### TC-PR-010: Tabs bàn phím (ARIA tablist) (P0)
- **Chuẩn bị:** Trang Profile.
- **Các bước:** 1. Tab đến vùng tab nav. 2. Dùng phím mũi tên trái/phải. 3. Enter/Space để chọn tab.
- **Kết quả mong đợi:** Tab nav có role=tablist + aria-selected/aria-controls; phím mũi tên chuyển tab; nội dung tab tương ứng hiển thị; SR đọc được trạng thái active.
- **Verify regression:** PR-004 (P0 — nav tabs không ARIA tablist)

### TC-PR-011: Username lỗi hiển thị inline + aria-invalid (P1)
- **Chuẩn bị:** Tab General.
- **Các bước:** 1. Nhập username trùng user khác. 2. Nhập username < 3 ký tự / toàn khoảng trắng. 3. Nhập username hợp lệ 3–100 ký tự.
- **Kết quả mong đợi:** Lỗi trùng/ngắn hiển thị ngay dưới ô input kèm aria-invalid; kiểm tra trùng diễn ra cả với user chưa active trong memory (check DB); lưu thành công khi hợp lệ.
- **Verify regression:** PR-015 (P2 — trùng username chỉ check in-memory + không validate độ dài), PR-017 (P2 — chỉ toast không inline)

### TC-PR-012: Form Lưu chỉ enabled khi có thay đổi (P2)
- **Chuẩn bị:** Tab General với dữ liệu đã prefill từ currentUser.
- **Các bước:** 1. Kiểm tra nút "Lưu" khi chưa sửa gì. 2. Sửa bio. 3. Sửa xong rồi khôi phục lại giá trị cũ.
- **Kết quả mong đợi:** Nút Lưu disabled khi form không khác dữ liệu gốc (dirty tracking); sửa → enabled; khôi phục về cũ → disabled lại; prefill form đúng dữ liệu user.
- **Verify regression:** PR-033 (P2 — nút Lưu luôn enabled), PR-013 (P2 — form stale sau load)

### TC-PR-013: History load gọi API chuẩn + không trùng 3 bản logic (P2)
- **Chuẩn bị:** Tab History + DevTools Network.
- **Các bước:** 1. Vào tab History. 2. Kiểm tra Network.
- **Kết quả mong đợi:** Chỉ 1 request history duy nhất qua `fetchQuizHistory`; URL đúng và có Bearer; không có request "url cũ" thừa.
- **Verify regression:** PR-011 (P2 — 3 bản logic lịch sử)
