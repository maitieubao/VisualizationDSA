# 🏫 Classrooms — Hướng dẫn Manual Test

## 📋 Tổng quan
- **Scope:** `views/classroom/**` (MyClassroomsView, StudentClassroomView, ClassroomItemPlayer, StudentCurriculumSidebar) · backend `ClassroomController.cs` / `ClassroomProgressController.cs` / `ClassroomGradingController.cs` + JoinClassroomDtoValidator + ProgressService / UnlockRuleEngine / GradingService
- **Trạng thái:** ✅ DoD (round 16 — 51/51 lỗi đã fix)
- **Test tự động:** frontend 3221/3221 pass (177 files) + backend 665/665 pass (`vue-tsc` 0 lỗi)
- **Môi trường:** Chrome/Edge mới nhất + 1 tab ẩn danh (hoặc 2 trình duyệt) để test 2 vai trò Teacher/Student đồng thời.

## 👤 User Stories

### US-CR-001: Giáo viên tạo lớp và mời học viên bằng invite code
- **Vai trò:** Giáo viên (Teacher)
- **Mục tiêu:** Tạo lớp học, lấy invite code, quản lý danh sách học viên (kick khi cần).
- **Chấp nhận:** Invite code sinh ra hợp lệ với validator (không bị 400); học viên dùng code tham gia thành công; code hết hạn sau 30 ngày.

### US-CR-002: Học viên xem "Lớp của tôi" và tham gia lớp bằng code
- **Vai trò:** Học viên (Student)
- **Mục tiêu:** Xem danh sách lớp đã tham gia; join lớp bằng invite code 6 ký tự.
- **Chấp nhận:** Danh sách tải từ `/api/v1/classrooms/mine` (không 404); join thành công → list reload + điều hướng; mã < 6 ký tự bị chặn ngay tại form.

### US-CR-003: Học viên học trong lớp (player điều hướng + hoàn thành bài)
- **Vai trò:** Học viên
- **Mục tiêu:** Mở bài học trong lớp, điều hướng next/back, hoàn thành bài và thấy sidebar cập nhật ngay.
- **Chấp nhận:** Nút Next/Back hoạt động theo curriculum; CustomLesson render được; hoàn thành bài → sidebar cập nhật ngay không cần F5; tiến độ tự động lưu.

### US-CR-004: Học viên rời lớp và xử lý lỗi truy cập
- **Vai trò:** Học viên
- **Mục tiêu:** Rời lớp khi không còn học; thấy thông báo rõ khi bị kick hoặc lớp không tồn tại.
- **Chấp nhận:** Rời lớp có confirm và gọi POST leave; bị kick → không xem được nội dung + không join lại được; 403/404/network hiện error state rõ thay vì UI giả.

## 🧪 Test Cases

### TC-CR-001: Tạo lớp → lấy invite code → student join thành công (P0)
- **Chuẩn bị:** Teacher + Student (2 tab/trình duyệt khác nhau).
- **Các bước:** 1. Teacher vào `/teacher` → Classrooms → "Tạo lớp", nhập tên, lưu. 2. Copy invite code từ màn hình lớp. 3. Student vào "Lớp của tôi" → nhập code → "Tham gia".
- **Kết quả mong đợi:** Teacher tạo lớp thành công; Student join 200, danh sách reload và hiển thị lớp mới; code 6 ký tự đúng chuẩn không bị 400.
- **Verify regression:** CR-001 (P0 — validator regex mâu thuẫn generator), CR-002 (P0 — URL `/api/v1/classrooms/mine` + `/join`)

### TC-CR-002: MyClassrooms hiển thị danh sách + join hoạt động (P0)
- **Chuẩn bị:** Student đã tham gia ≥ 1 lớp.
- **Các bước:** 1. Vào trang "Lớp của tôi". 2. Kiểm tra Network tab. 3. Bấm "Tham gia lớp" nhập code hợp lệ.
- **Kết quả mong đợi:** Request đến `/api/v1/classrooms/mine` (không phải `/api/Classroom/mine`) trả 200; danh sách hiển thị đúng vai trò (badge "Học viên"/"Giảng viên"); join thành công điều hướng vào lớp.
- **Verify regression:** CR-002 (P0), CR-042 (P2 — badge role), CR-025 (P2 — load lỗi không hiện empty giả)

### TC-CR-003: Player — nút Next/Back điều hướng đúng curriculum (P0)
- **Chuẩn bị:** Lớp có ≥ 3 bài (Lesson/Quiz/Codelab xen kẽ).
- **Các bước:** 1. Student mở bài đầu tiên. 2. Quan sát footer + nút điều hướng. 3. Bấm "Tiếp theo" cho đến bài cuối. 4. Bấm "Quay lại".
- **Kết quả mong đợi:** Nút Next chỉ active khi còn bài (hasNext thật); footer hiển thị đúng trạng thái bài hiện tại (Đang học/Đã hoàn thành); Back quay lại bài trước và nạp nội dung đúng; bài cuối không có Next.
- **Verify regression:** CR-004 (P0 — hasNext hardcode false + footer "Đã hoàn thành module!"), CR-005 (P0 — back emit không ai lắng nghe), CR-023 (P2 — footer status mâu thuẫn badge)

### TC-CR-004: Player render CustomLesson (P0)
- **Chuẩn bị:** Lớp có module item loại CustomLesson (giáo viên tự soạn).
- **Các bước:** 1. Student mở bài CustomLesson trong lớp.
- **Kết quả mong đợi:** Player render nội dung custom (không hiện "Loại bài học không được hỗ trợ"); sidebar hiển thị badge "Tự soạn" nhất quán.
- **Verify regression:** CR-006 (P0 — sidebar hiện nhưng player dead-end)

### TC-CR-005: Hoàn thành bài → sidebar cập nhật ngay (P0)
- **Chuẩn bị:** Lớp có 2 bài, student mở bài 1.
- **Các bước:** 1. Học xong bài 1, bấm "Hoàn thành". 2. Quan sát sidebar + progress summary. 3. Kiểm tra bài 2 đã unlock (nếu có điều kiện).
- **Kết quả mong đợi:** Sidebar đánh dấu bài 1 hoàn thành ngay lập tức (không cần F5); progress summary cập nhật; POST complete được gọi.
- **Verify regression:** CR-007 (P0 — currentItem giữ tham chiếu cũ + sidebar không cập nhật)

### TC-CR-006: Lỗi 403/404 lớp → error state rõ ràng (P0)
- **Chuẩn bị:** URL lớp không tồn tại (404) — ví dụ mở `/classroom/<id-giả>`, hoặc tài khoản bị kick (403).
- **Các bước:** 1. Student mở URL 404. 2. Làm tương tự với URL lớp đã bị kick (403). 3. Quan sát giao diện.
- **Kết quả mong đợi:** Hiển thị error state riêng cho từng loại (403: "không có quyền"/404: "không tìm thấy"/network: "kết nối thất bại") kèm hướng xử lý; không hiện "Chào mừng..." + sidebar rỗng giả.
- **Verify regression:** CR-008 (P0 — không error state → kick vẫn thấy trang)

### TC-CR-007: Kick → student không xem được + không rejoin được (P0)
- **Chuẩn bị:** Teacher + Student trong cùng lớp.
- **Các bước:** 1. Teacher kick student khỏi lớp. 2. Student F5 trang lớp. 3. Student thử join lại bằng invite code.
- **Kết quả mong đợi:** Student thấy 403/trạng thái bị loại khỏi lớp; join lại bị từ chối (ban rejoin); curriculum/progress không còn truy cập được.
- **Verify regression:** CR-014 (P0 — kick vẫn rejoin được), CR-015 (P0 — không filter Active → vẫn xem curriculum), CR-016 (P2 — unlock-status không check Active)

### TC-CR-008: Rời lớp — confirm + POST leave (P0)
- **Chuẩn bị:** Student đã tham gia ít nhất 1 lớp.
- **Các bước:** 1. Vào "Lớp của tôi". 2. Bấm "Rời lớp". 3. Quan sát dialog xác nhận. 4. Xác nhận rời lớp. 5. Thử lại lần nữa và bấm "Hủy".
- **Kết quả mong đợi:** Dialog confirm hiện (Escape/backdrop đóng được); xác nhận → POST `/leave` thành công, lớp biến mất khỏi danh sách; hủy → không gọi API, lớp còn đó.
- **Verify regression:** CR-026 (P2 — không có tính năng rời lớp)

### TC-CR-009: Join validate 6 ký tự đúng chuẩn (P1)
- **Chuẩn bị:** Trang "Lớp của tôi".
- **Các bước:** 1. Nhập mã 3 ký tự, bấm Tham gia. 2. Nhập mã 5 ký tự, bấm Tham gia. 3. Nhập mã 6 ký tự đúng, bấm Tham gia.
- **Kết quả mong đợi:** Mã < 6 bị chặn ngay tại form với thông báo "mã gồm 6 ký tự" (không gửi request); mã 6 ký tự hợp lệ gửi request; lỗi server (400) hiển thị message thật.
- **Verify regression:** CR-024 (P2 — validate chỉ chặn <4), CR-032 (P2 — {Message} hoa M không hiển thị)

### TC-CR-010: Mobile drawer sidebar hoạt động 1 vùng scroll (P1)
- **Chuẩn bị:** DevTools chuyển chế độ mobile (≤768px), mở lớp học.
- **Các bước:** 1. Mở lớp → quan sát sidebar. 2. Mở drawer (FAB/nút menu). 3. Cuộn trong drawer, chọn bài. 4. Đóng drawer.
- **Kết quả mong đợi:** Drawer mở/đóng mượt, chỉ 1 vùng scroll (không double scrollbar, không lệch layout); chọn bài đóng drawer và mở bài đúng; FAB có aria-expanded.
- **Verify regression:** CR-027 (P2 — sticky lồng + 2 vùng scroll), CR-050 (P3 — FAB khi curriculum rỗng + thiếu aria)

### TC-CR-011: Deep-link `?itemId` mở đúng bài + ghi nhận "đang học" (P1)
- **Chuẩn bị:** Lớp có ít nhất 2 bài, lấy URL dạng `/classroom/<id>?itemId=<item2-id>`.
- **Các bước:** 1. Dán URL vào tab mới. 2. Quan sát bài được mở. 3. Kiểm tra Network có POST start.
- **Kết quả mong đợi:** Đúng bài theo itemId mở ra; trackItemStart được gọi (bài tính là "đang học"); navigation sau đó đi từ bài đó.
- **Verify regression:** CR-037 (P2 — deep-link không trackItemStart)

### TC-CR-012: Tiến độ tự lưu khi scroll (P1)
- **Chuẩn bị:** Mở một bài Lesson dài trong lớp.
- **Các bước:** 1. Cuộn bài đến ~50%. 2. Dừng cuộn 1 giây. 3. Kiểm tra Network (debounce ~800ms). 4. F5 và xem progress summary.
- **Kết quả mong đợi:** Có PUT progress sau khi dừng cuộn (scroll debounce); progress summary phản ánh % đã đọc; không spam request khi cuộn liên tục.
- **Verify regression:** CR-021 (P2 — trackItemProgress khai báo không gọi), CR-022 (P2 — progressSummary dead data)

### TC-CR-013: Đổi tài khoản → không rò rỉ lớp cũ (P2)
- **Chuẩn bị:** User A đang ở trang lớp; user B khác.
- **Các bước:** 1. Logout A (hoặc mở lại trang bằng user B). 2. Vào "Lớp của tôi". 3. Mở classroom.
- **Kết quả mong đợi:** Danh sách lớp của B hiển thị (không còn dữ liệu lớp của A); mở lớp không dính progress cũ; watch auth reset store đúng.
- **Verify regression:** CR-038 (P2 — không watch auth)
