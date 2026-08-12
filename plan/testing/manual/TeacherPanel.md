# 👨‍🏫 Teacher Panel — Hướng dẫn Manual Test

## 📋 Tổng quan
- **Scope:** `views/teacher/**` (TeacherPanelView + 8 tab + 12 modal + useTeacherApi/useQuizBuilder) · backend `TeacherController.cs` / `StatelessQuizController.cs` (manage) / `CodelabController.cs` / `UploadController.cs`
- **Trạng thái:** ✅ DoD (round 15 — 46/47 lỗi đã fix; còn TC-041 PARTIAL — Student scope backend TODO)
- **Test tự động:** frontend 3184/3184 pass (175 files) + backend 591/591 pass (`vue-tsc` 0 lỗi)
- **Môi trường:** Chrome/Edge mới nhất, khởi động backend + frontend, tài khoản có role **Teacher** (login bằng demo teacher nếu có).

## 👤 User Stories

### US-TC-001: Giảng viên quản lý bộ câu hỏi trắc nghiệm (Quiz Builder)
- **Vai trò:** Giảng viên (Teacher)
- **Mục tiêu:** Tạo, sửa, xóa quiz và câu hỏi trực tiếp trên tab Quiz Builder; chỉ giảng viên sở hữu mới sửa/xóa được quiz của mình.
- **Chấp nhận:** Quiz được tạo có title/difficulty/xpReward; câu hỏi có 2–6 đáp án; search/filter hoạt động; teacher khác không sửa được quiz của mình; xóa quiz không làm mất lịch sử làm bài của học viên.

### US-TC-002: Giảng viên quản lý Codelab (bài tập code)
- **Vai trò:** Giảng viên
- **Mục tiêu:** Tạo codelab với template code, hint và bộ testcase; sửa/xóa được.
- **Chấp nhận:** Lưu Codelab đóng modal và hiển thị trong danh sách; testcase lưu được; không còn cảnh báo "🚧 đang phát triển".

### US-TC-003: Giảng viên quản lý khóa học với ảnh thumbnail
- **Vai trò:** Giảng viên
- **Mục tiêu:** Tạo khóa học mới, upload ảnh bìa, thumbnail hiển thị đúng sau khi tạo.
- **Chấp nhận:** Upload ảnh không trả 400 NO_FILE; khóa học tạo xong có thumbnail đúng ảnh đã chọn; quiz liên kết trong bài giảng giữ nguyên.

### US-TC-004: Giảng viên theo dõi Analytics và xuất Excel
- **Vai trò:** Giảng viên
- **Mục tiêu:** Xem thống kê tiến độ lớp học; xuất Excel có trạng thái loading rõ ràng.
- **Chấp nhận:** completionRate hiển thị dạng phần trăm đúng (0.65 → "65.0%"); nút Export Excel có loading và kết quả tải về được.

### US-TC-005: Giảng viên thao tác trong Panel không mất dữ liệu
- **Vai trò:** Giảng viên
- **Mục tiêu:** Chuyển tab không bị mất trạng thái/scroll; lỗi API hiện banner kèm nút Thử lại thay vì empty state giả.
- **Chấp nhận:** Tab giữ state nhờ KeepAlive; mọi lỗi mạng/5xx đều có banner + Thử lại; modal có focus trap/Escape chuẩn.

## 🧪 Test Cases

### TC-TC-001: QuizBuilder tạo quiz mới thành công (P0)
- **Chuẩn bị:** Đăng nhập tài khoản Teacher, vào `/teacher` → tab "Quiz Builder".
- **Các bước:** 1. Bấm "Tạo quiz". 2. Nhập title, chọn difficulty, nhập xpReward. 3. Thêm 1 câu hỏi với 4 đáp án, đánh dấu đáp án đúng. 4. Bấm "Lưu". 5. Kiểm tra quiz xuất hiện trong danh sách.
- **Kết quả mong đợi:** Quiz lưu thành công, không có lỗi console, hiển thị trong danh sách; mở lại thấy đầy đủ câu hỏi đã thêm.
- **Verify regression:** TC-001 (P0 — CRUD manage API), TC-006 (P1 — token đọc từ Pinia)

### TC-TC-002: CodelabBuilder tạo codelab mới hoạt động (P0)
- **Chuẩn bị:** Đăng nhập Teacher, tab "Codelab Builder".
- **Các bước:** 1. Bấm "Tạo Codelab". 2. Nhập tiêu đề + mô tả, dán template code. 3. Bấm "Lưu".
- **Kết quả mong đợi:** Modal đóng, codelab xuất hiện trong danh sách, không còn alert "🚧 đang phát triển".
- **Verify regression:** TC-002 (P0 — CodelabBuilder implement thật)

### TC-TC-003: Thêm testcase vào codelab hoạt động (P0)
- **Chuẩn bị:** Codelab vừa tạo ở TC-TC-002, mở modal sửa.
- **Các bước:** 1. Bấm nút "Testcase". 2. Nhập input/kỳ vọng output. 3. Bấm "Lưu (thật)". 4. Mở lại modal kiểm tra testcase còn đó.
- **Kết quả mong đợi:** Testcase lưu và hiển thị; không còn nút stub "Lưu (Stub)" emit rỗng.
- **Verify regression:** TC-003/TC-004 (P0 — modal testcase/template/hint + submit form có id)

### TC-TC-004: Upload ảnh khóa học không trả 400 (P0)
- **Chuẩn bị:** Tab "Khóa học", chuẩn bị 1 ảnh PNG/JPG < 5MB.
- **Các bước:** 1. Bấm "Tạo khóa học". 2. Bấm "Tải ảnh lên" và chọn ảnh. 3. Kiểm tra DevTools Network tab.
- **Kết quả mong đợi:** Request upload trả 2xx (không 400 NO_FILE); preview ảnh hiển thị; FormData không kèm `Content-Type: application/json`.
- **Verify regression:** TC-010 (P1 — mất multipart boundary → 400)

### TC-TC-005: Tạo course → thumbnail hiển thị đúng (P0)
- **Chuẩn bị:** Ảnh đã upload ở TC-TC-004.
- **Các bước:** 1. Hoàn tất form tạo khóa học (tên, category hợp lệ, thumbnail đã chọn). 2. Bấm "Lưu". 3. Xem card khóa học trong tab.
- **Kết quả mong đợi:** Khóa học tạo thành công; thumbnail đúng ảnh đã chọn (không bị mất do DTO sai field); payload gửi `thumbnail` không phải `coverImageUrl`.
- **Verify regression:** TC-009 (P1 — coverImageUrl vs Thumbnail, response `.course` vs `{message, courseId}`)

### TC-TC-006: Quiz chỉ owner (teacher tạo ra) sửa/xóa được (P0)
- **Chuẩn bị:** 2 tài khoản Teacher A và B; A tạo quiz.
- **Các bước:** 1. Login B, vào Quiz Builder. 2. Tìm quiz của A, bấm "Sửa". 3. Bấm "Xóa".
- **Kết quả mong đợi:** B không sửa/xóa được quiz của A (403 hoặc không có nút tác vụ); A đăng nhập lại vẫn sửa/xóa bình thường.
- **Verify regression:** TC-021 (P2 — CreatedByTeacherId ownership), TC-019 (P1 — không nuốt lỗi khi lưu)

### TC-TC-007: Xóa quiz soft-delete giữ lịch sử attempt (P0)
- **Chuẩn bị:** Teacher tạo quiz, học viên (Student) làm quiz đó ít nhất 1 lần (có attempt + XP).
- **Các bước:** 1. Teacher xóa quiz (có ConfirmModal xác nhận). 2. Kiểm tra quiz biến mất khỏi danh sách. 3. Student vào trang history của mình.
- **Kết quả mong đợi:** Quiz biến mất nhưng lịch sử attempt + bằng chứng XP của học viên vẫn còn (không hard-delete cascade).
- **Verify regression:** TC-022 (P2 — soft-delete giữ attempt history/XP ledger)

### TC-TC-008: Thêm câu hỏi vào quiz — saveQuestion hoạt động (P0)
- **Chuẩn bị:** Quiz đã tạo ở TC-TC-001.
- **Các bước:** 1. Mở quiz → bấm "Thêm câu hỏi". 2. Nhập nội dung, thêm 2–6 đáp án (thử 2 và 6), chọn đáp án đúng. 3. Bấm "Lưu". 4. Đóng mở lại quiz.
- **Kết quả mong đợi:** Câu hỏi xuất hiện sau khi lưu và còn lại khi mở lại; số đáp án động 2–6 được tôn trọng.
- **Verify regression:** TC-008 (P1 — saveQuestion rỗng), TC-046 (P2 — option động 2-6)

### TC-TC-009: Excel Export hiển thị loading và tải file (P1)
- **Chuẩn bị:** Tab "Analytics" có dữ liệu lớp học.
- **Các bước:** 1. Bấm "Export Excel". 2. Quan sát nút/trạng thái. 3. Chờ kết quả.
- **Kết quả mong đợi:** Nút chuyển trạng thái loading/disabled khi đang xuất (không cho click lại); file .xlsx tải về; nếu lỗi có thông báo rõ thay vì im lặng.
- **Verify regression:** TC-032 (P2 — export không loading + lỗi im lặng)

### TC-TC-010: Lỗi API → banner + nút Thử lại (P0)
- **Chuẩn bị:** Đăng nhập Teacher, tab bất kỳ (Quiz Builder).
- **Các bước:** 1. Bật DevTools → Network → Offline. 2. Vào tab hoặc bấm nút refresh dữ liệu. 3. Quan sát giao diện. 4. Bật Online lại, bấm "Thử lại".
- **Kết quả mong đợi:** Hiển thị banner lỗi kèm nút "Thử lại" (không rơi vào empty state "Chưa có..." giả); sau khi bấm Thử lại, dữ liệu tải lại thành công.
- **Verify regression:** TC-020 (P1 — fetch lỗi chỉ console.error → empty giả)

### TC-TC-011: Tabs giữ state khi chuyển qua lại (KeepAlive) (P1)
- **Chuẩn bị:** Tab "Khóa học", cuộn danh sách xuống một vị trí.
- **Các bước:** 1. Ghi nhận vị trí scroll + dữ liệu đang hiển thị. 2. Chuyển sang tab "Quiz Builder" rồi quay lại. 3. Kiểm tra lại vị trí scroll/dữ liệu.
- **Kết quả mong đợi:** State/scroll giữ nguyên khi quay lại (không remount mất trạng thái); tabs có ARIA tablist chuẩn.
- **Verify regression:** TC-027 (P2 — v-if unmount mất state/scroll/refetch)

### TC-TC-012: Lỗi 401 → tự refresh token → retry (P1)
- **Chuẩn bị:** Teacher đăng nhập, chờ token gần hết hạn (hoặc chỉnh thời gian sống ngắn ở backend nếu dev).
- **Các bước:** 1. Mở tab Quiz Builder. 2. Thực hiện một thao tác tải dữ liệu. 3. Quan sát Network tab.
- **Kết quả mong đợi:** Request 401 → tự gọi refresh → retry thành công, không fail im lặng; mọi tab vẫn hoạt động.
- **Verify regression:** TC-013 (P1 — không 401→refresh→retry + không timeout)

### TC-TC-013: Cảnh báo unsaved khi đóng accordion sửa câu hỏi (P2)
- **Chuẩn bị:** TeacherQuizTab, mở accordion sửa câu hỏi.
- **Các bước:** 1. Sửa nội dung câu hỏi. 2. Bấm đóng accordion.
- **Kết quả mong đợi:** Có cảnh báo xác nhận trước khi đóng (mất thay đổi chưa lưu) — không đóng mất êm.
- **Verify regression:** TC-030 (P2 — đóng không lưu mất hết, không cảnh báo)

### TC-TC-014: Search/filter quiz hoạt động (P1)
- **Chuẩn bị:** Ít nhất 3 quiz với title/topic khác nhau.
- **Các bước:** 1. Gõ từ khóa vào ô search (có debounce). 2. Chọn filter theo topic. 3. Quan sát danh sách.
- **Kết quả mong đợi:** Danh sách lọc đúng theo từ khóa + topic; có thể kết hợp cả 2; xóa search trả về toàn bộ.
- **Verify regression:** TC-007 (P1 — search/filter chết vì v-for bỏ computed)
