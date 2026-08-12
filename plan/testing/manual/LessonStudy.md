# 📖 Lesson Study / Course Modules — Hướng dẫn Manual Test

## 📋 Tổng quan
- **Scope:** frontend `stores/classroomCurriculum.ts` + `views/teacher/TeacherClassroomCurriculumTab.vue` + `ModuleItemRow.vue` + 4 modal (ModuleForm/ItemForm/OverrideSettings/ImportCourse) + `views/classroom/components/StudentCurriculumSidebar.vue` + `views/classroom/StudentClassroomView.vue` + CourseSidebar; backend `ClassroomCurriculumController.cs` + 14 command/query handler + ClassroomProgressService + UnlockRuleEngine — routes `/teacher` (tab Curriculum), `/lessons/:id`, `/classrooms/:id`
- **Trạng thái:** ✅ DoD (Review Round 14 — 42/42 lỗi LS-001 → LS-042 đã fix; 5 P0 chết tính năng đã hồi sinh)
- **Test tự động:** frontend 3129/3129 pass (170 files) + backend 552/552 pass; Lesson Study suite 46 → 89 tests (classroomCurriculum 14 + studentCurriculumSidebar 8 + moduleItemRow 12 mới)
- **Môi trường:** Chrome/Edge, backend local (localhost:5055), 2 tài khoản: **Teacher** (có lớp học) và **Student** (đã join lớp); kiểm tra desktop + mobile 390px.

## 👤 User Stories

### US-LS-001: Giáo viên xây dựng giáo trình lớp học (curriculum)
- **Vai trò:** Giáo viên
- **Mục tiêu:** Tạo module + thêm item (Lesson/Quiz/Codelab/CustomLesson), sắp xếp lại thứ tự, ẩn bài, nhân bản bài
- **Chấp nhận:** Mọi CRUD hoạt động (không 404); kéo thả reorder lưu thứ tự thật; keyboard cũng reorder được.

### US-LS-002: Giáo viên tùy chỉnh bài học cho lớp (override + import)
- **Vai trò:** Giáo viên
- **Mục tiêu:** Override yêu cầu prerequisite/tính tuần tự cho bài trong lớp; import khóa học có sẵn vào lớp
- **Chấp nhận:** Override lưu xong hiển thị lại đúng (nối 3 tầng UI→store→API); import thành công tạo module + item tương ứng.

### US-LS-003: Học viên xem sidebar và mở bài theo tiến trình
- **Vai trò:** Học viên
- **Mục tiêu:** Sidebar hiện tiến độ, khóa/mở bài theo prerequisite; deep-link vào đúng bài; dùng được trên mobile
- **Chấp nhận:** Bài khóa có lý do; bài ẩn không hiện; `?itemId=` mở đúng bài và ghi "đang học".

### US-LS-004: Học bài 4 bước (Lý thuyết → Trực quan → Quiz → Codelab)
- **Vai trò:** Học viên
- **Mục tiêu:** Hoàn thành tuần tự 4 bước của một lesson
- **Chấp nhận:** Bước sau chỉ mở khi hoàn thành bước trước; quiz retry không phá trạng thái completed; hoàn thành cập nhật progress sidebar ngay.

## 🧪 Test Cases

### TC-LS-001: Teacher — tạo module + tạo item với nội dung thật (P0)
- **Chuẩn bị:** Đăng nhập teacher; mở `/teacher` → tab Curriculum của 1 lớp học.
- **Các bước:**
  1. Bấm **Thêm Module** → đặt tên "Module 1" → Lưu.
  2. Trong Module 1, bấm **Thêm Bài học** (ItemFormModal).
  3. Mở dropdown "Loại nội dung" → kiểm tra danh sách Lesson/Quiz/Codelab được NẠP THẬT từ API (không rỗng).
  4. Chọn 1 lesson → kiểm tra prerequisite select (không liệt kê item đang edit) → bấm **Tạo Bài học**.
  5. Refresh trang → kiểm tra module + item còn đó.
- **Kết quả mong đợi:** Tạo module/item thành công (không 404, không nút "Tạo" khóa vĩnh viễn); danh sách nội dung liên kết nạp thật; sau refresh dữ liệu bền vững.
- **Verify regression:** LS-001 (prefix /api/v1 hết 404), LS-005 (ItemFormModal nạp danh sách thật), LS-011 (defineProps classroomId), LS-032 (prerequisite exclude self).

### TC-LS-002: Teacher — kéo thả reorder module/item (P0)
- **Chuẩn bị:** Curriculum có ít nhất 2 module, mỗi module 2 item.
- **Các bước:**
  1. Kéo module thứ 2 lên trên module thứ 1 → thả.
  2. Kéo item cuối của module 1 xuống cuối danh sách → thả.
  3. Chỉ kéo bằng **drag handle** (không kéo cả dòng accordion).
  4. Refresh trang → kiểm tra thứ tự.
  5. Focus vào drag handle của 1 item → dùng phím mũi tên Lên/Xuống.
- **Kết quả mong đợi:** Reorder lưu thứ tự thật (refresh giữ nguyên); kéo đúng handle không bị lỗi flicker khi qua child; phím mũi tên (keyboard) cũng reorder được (2 cấp: module + item); không còn 2 hệ drag chồng chéo gây lỗi.
- **Verify regression:** LS-003 (reorder wire + 1 hệ drag), LS-023 (reorder atomic renumber), LS-026 (drag handle keyboard), LS-033 (drag chỉ handle).

### TC-LS-003: Teacher — override prerequisite/tuần tự/ẩn cho item (P1)
- **Chuẩn bị:** Curriculum có 3 item liên tiếp A → B → C; A đã hoàn thành bởi student test.
- **Các bước:**
  1. Bấm nút Override (⚙) trên item B → bật **Bắt buộc** (IsRequired), chọn prerequisite = A, bật **Học tuần tự** (IsSequential) → Lưu.
  2. Quan sát dòng B ngay sau khi lưu (có phản ánh override không).
  3. Bấm Override item C → bật **Ẩn** (IsHidden) → Lưu.
  4. Refresh trang → mở lại modal override từng item → kiểm tra các giá trị đã lưu.
  5. Đăng nhập student → xem sidebar.
- **Kết quả mong đợi:** Override lưu thành công và HIỆN LẠI đúng sau refresh (chuỗi UI→store→API→query không đứt); 8 field override đầy đủ (prerequisiteItemId, isSequential, isRequired, isHidden...); item ẩn không hiển thị ở student; setting không vô hiệu im lặng do lệch field isHidden vs isHiddenForStudent.
- **Verify regression:** LS-009 (override nối 3 tầng), LS-006 (positional args IsHidden), LS-016 (mismatch field isHidden), LS-024 (override validate thuộc lớp).

### TC-LS-004: Teacher — import khóa học vào lớp (P0)
- **Chuẩn bị:** Có khóa học đã **Published** trong hệ thống; đang ở tab Curriculum.
- **Các bước:**
  1. Bấm **Import Course** → modal mở ra.
  2. Kiểm tra danh sách khóa: chỉ có khóa Published (không có Draft).
  3. Chọn khóa → bấm **Import**.
  4. Quan sát curriculum sau import (modules + items được sinh).
  5. Bấm Import lần 2 cùng khóa với option "ghi đè" bật → quan sát.
- **Kết quả mong đợi:** Import thành công (URL `/api/v1/classrooms/{id}/import-course` đúng, không 404); modules/items xuất hiện trong curriculum; tùy chọn ghi đè thay thế curriculum cũ đúng; lỗi import (nếu có) hiện error banner thay vì đóng modal im lặng.
- **Verify regression:** LS-004 (import-course route + URL đúng), LS-014 (error banner + try/catch).

### TC-LS-005: Teacher — xóa/ẩn/nhân bản item có xác nhận (P1)
- **Chuẩn bị:** Curriculum có 1 item bình thường.
- **Các bước:**
  1. Bấm nút **Xóa** trên item → quan sát dialog xác nhận → Hủy → item còn.
  2. Bấm Xóa → Xác nhận → item biến mất.
  3. Bấm **Nhân bản** trên item còn lại → quan sát item mới xuất hiện (badge CustomLesson/fallback title).
  4. Bấm nút **Ẩn/Hiện** (toggle) trên 1 item → refresh.
- **Kết quả mong đợi:** Xóa có ConfirmModal (không alert/confirm native); nhân bản tạo item mới hoạt động (không no-op); ẩn/hiện persist sau refresh; mọi thao tác có loading/saving state (double-submit bị chặn).
- **Verify regression:** LS-013 (duplicateItem), LS-015 (ConfirmModal), LS-030 (CustomLesson badge/displayTitle), LS-041 (saving thật).

### TC-LS-006: Student — sidebar khóa/mở theo prerequisite và unlock thật (P0)
- **Chuẩn bị:** Student đã join lớp; teacher đã đặt item B: prerequisite = A (A chưa hoàn thành).
- **Các bước:**
  1. Mở `/classrooms/:id` → quan sát sidebar: A (mở), B (khóa — có lý do "cần hoàn thành A").
  2. Bấm vào B (khóa) → kiểm tra có mở bài không.
  3. Hoàn thành A → refresh sidebar (hoặc chờ cập nhật).
  4. Quan sát trạng thái B sau khi A hoàn thành.
  5. Module không bắt buộc (IsRequired=false) → xác nhận mở tự do.
- **Kết quả mong đợi:** B khóa khi A chưa xong (sequential lock thật, không bỏ qua field isUnlocked backend); bấm vào bài khóa không mở; sau khi A hoàn thành, B tự mở khóa; item ẩn không xuất hiện trong danh sách (và không tính vào progress); unlock từ backend (isUnlocked) được tôn trọng.
- **Verify regression:** LS-012 (sequential lock thật), LS-010 (engine không đếm item ẩn), LS-007 (query lọc hidden), LS-028 (scroll-active module).

### TC-LS-007: Student — deep-link ?itemId mở đúng bài và ghi "đang học" (P1)
- **Chuẩn bị:** Mở bài X bất kỳ trong lớp (lấy itemId từ sidebar hoặc Network).
- **Các bước:**
  1. Mở tab mới với URL `/classrooms/:id?itemId=<itemId của X>`.
  2. Quan sát bài được mở (player hiển thị X, sidebar highlight X).
  3. Quan sát Network: có request `POST .../start` (trackItemStart) không.
  4. Đổi sang itemId không tồn tại → quan sát.
- **Kết quả mong đợi:** Deep-link mở đúng bài X (không fallback về bài đầu); sidebar tự expand + scroll tới item X; có request start ghi trạng thái "đang học"; itemId lạ → xử lý lỗi/fallback an toàn không crash.
- **Verify regression:** LS-029 (deep-link ?itemId), LS-028 (scroll-active/auto-expand), CR-037 (trackItemStart).

### TC-LS-008: Student — mobile drawer sidebar (P2)
- **Chuẩn bị:** Viewport 390px (DevTools); mở `/classrooms/:id`.
- **Các bước:**
  1. Quan sát layout ban đầu: sidebar có ẩn thành drawer không.
  2. Bấm nút hamburger/FAB → sidebar trượt vào.
  3. Bấm overlay/ngoài → sidebar đóng.
  4. Chọn 1 bài trong drawer → quan sát điều hướng.
  5. Kiểm tra chỉ 1 vùng scroll (không double scrollbar).
- **Kết quả mong đợi:** Sidebar mobile dạng drawer mở/đóng được; bấm overlay đóng; chọn bài đóng drawer và mở bài; layout không vỡ, không 2 thanh scroll lồng nhau.
- **Verify regression:** LS-029 (sidebar drawer mobile), LS-036 (z-index overlay).

### TC-LS-009: Student — hoàn thành bài cập nhật progress sidebar ngay (P1)
- **Chuẩn bị:** Student mở lớp có 3 item; item 1 đang học dở.
- **Các bước:**
  1. Hoàn thành item 1 (hoàn tất bước cuối) → KHÔNG refresh.
  2. Quan sát sidebar: tick/badge item 1 + progress tổng (X%).
  3. Bấm nút **Bài tiếp theo** (nếu có) → quan sát footer status + item active.
  4. Refresh → so sánh progress.
- **Kết quả mong đợi:** Sidebar cập nhật ngay sau complete (không cần F5); progress tổng đúng; nút "Bài tiếp theo" chuyển tới item kế (hasNext thật); footer không hiện "Đã hoàn thành module!" sai khi còn bài.
- **Verify regression:** CR-004/CR-007 (hasNext + refresh sau complete), LM-036 (hoàn thành bài cuối).

### TC-LS-010: Lesson Study — bước 2 khóa tới khi đọc xong lý thuyết (P0)
- **Chuẩn bị:** Mở `/lessons/:id` của bài có 4 bước; CHƯA cuộn hết lý thuyết.
- **Các bước:**
  1. Quan sát StepTabs: bước 1 active, bước 2/3/4 trạng thái.
  2. Bấm tab "Trực quan" (bước 2) → quan sát.
  3. Cuộn đọc hết lý thuyết (hoặc bấm "Đánh dấu đã đọc") → quan sát bước 2.
  4. Bấm vào bước 3/4 → quan sát.
- **Kết quả mong đợi:** Bước 2 khóa thật (click không mở / thông báo cần đọc xong lý thuyết); sau khi đọc xong, bước 2 mở; bước 3/4 vẫn khóa tới khi hoàn thành bước 2; không có chữ "mở khóa" giả mà thực tế mở tự do.
- **Verify regression:** LM-015 (gate step 2 thật), LM-040 (StepTabs khóa), LS-038 (ARIA tab).

### TC-LS-011: Lesson Study — quiz retry không thoái lui completed (P1)
- **Chuẩn bị:** Hoàn thành bài (bước quiz pass, completed=true).
- **Các bước:**
  1. Bấm **Làm lại** quiz.
  2. Trả lời sai hơn 70% → nộp.
  3. Kiểm tra badge hoàn thành + localStorage `lesson_progress_*` + XP.
  4. Nộp lại đạt yêu cầu → kiểm tra.
- **Kết quả mong đợi:** Trạng thái completed giữ nguyên sau lần trượt (một chiều, không ghi completed:false); XP không bị trừ; sidebar progress không tụt.
- **Verify regression:** LM-034 (completed một chiều).

### TC-LS-012: Lesson Study — hoàn thành bước cuối + codelab đúng flow (P2)
- **Chuẩn bị:** Bài có đủ quiz + codelab; mạng thường.
- **Các bước:**
  1. Pass quiz → bước codelab mở.
  2. Reset code → chạy → hết running mới bấm Reset (kiểm tra Reset bị chặn khi đang running).
  3. Chạy pass tất cả testcase → bấm **Nộp bài**.
  4. Quan sát modal completion + XP.
- **Kết quả mong đợi:** Reset không chạy khi đang running (không để kết quả cũ ghi đè); nộp chỉ khả dụng khi allPassed; hoàn thành → modal + XP + progress cập nhật; badge task (tên/giới hạn thời gian) hiển thị đúng theo task thật, không hardcode sai.
- **Verify regression:** LM-068 (reset chặn khi running), LM-043 (badge task thật), LM-017 (run/submit/allPassed).
