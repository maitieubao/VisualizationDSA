# 📖 Hồ Sơ: Lesson Study / Course Modules

> Trạng thái file: cập nhật lần cuối 2026-08-13 · Nguồn dữ liệu: `plan/tracking/REVIEW.md` mục 19, `DATN_ERRORS.md` Review Round 14, `plan/testing/manual/LessonStudy.md`

---

## 1. 🎯 Mục đích

Giải quyết vấn đề của **2 vai trò cùng lúc**:
- **Giáo viên**: cần xây dựng giáo trình (curriculum) cho lớp học — gom bài học/quiz/codelab thành module, sắp xếp thứ tự, ẩn bài, đặt điều kiện mở khóa (prerequisite/tuần tự), import khóa học có sẵn.
- **Học viên**: cần đi học theo giáo trình của lớp — sidebar hiện tiến độ, bài khóa có lý do, deep-link vào đúng bài, học tuần tự 4 bước.

**Tuyên bố giá trị:** Biến nội dung LMS tĩnh thành **giáo trình động theo từng lớp học** — mỗi lớp có lộ trình riêng do giáo viên kiểm soát, học viên luôn biết "mình đang ở đâu và được học gì tiếp theo".

## 2. 📌 Thực trạng hiện tại

- **Trạng thái kỹ thuật:** ✅ DoD — Review Round 14 (2026-08-11), 42/42 lỗi LS-001 → LS-042 đã fix (5 P0 chết tính năng đã hồi sinh). Backend **552/552 PASS** (+45), frontend **3129/3129 PASS** (170 files, +43), `vue-tsc` 0 lỗi. Routes `/teacher` (tab Curriculum), `/lessons/:id`, `/classrooms/:id`.
- **Điều thật sự hoạt động:**
  - **5 P0 chết tính năng hồi sinh**: prefix `/api/v1` hết 404 CRUD (LS-001), Update/Delete endpoint mới cho sửa/ẩn/xóa bài (LS-002), **reorder hoạt động — 1 hệ HTML5 + keyboard 2 cấp** (LS-003/026), import-course route + URL đúng (LS-004), ItemFormModal nạp danh sách thật (LS-005).
  - **Backend vững**: student query lọc hidden + chặn leak enrollment, override nối 3 tầng (8 field + validate thuộc lớp + 2 query merge), UnlockRuleEngine không đếm item ẩn, reorder atomic renumber, 403/404/400 thay 500 (LS-006→010/022/023/024).
  - **Frontend đầy đủ**: defineProps classroomId, sequential lock thật, duplicateItem, ConfirmModal, sidebar drawer mobile + deep-link `?itemId`, premium lock icon, prerequisite exclude self, drag chỉ handle, saving thật chống double-submit (LS-011→016/029→033/041).
  - **Test thật**: classroomCurriculum 14 + studentCurriculumSidebar 8 + studentClassroomView 4 + moduleItemRow 12 mới, student query handler 9 + controller 10 (LS-017→022).
- **Giới hạn còn lại:**
  - **Nội dung 4 bước chưa đầy đủ cho từng bài** — curriculum quản lý được "bài" nhưng bên trong mỗi bài, bước Lý thuyết/Trực quan/Quiz/Codelab phụ thuộc nội dung khóa học gốc (nối điểm yếu của `courses-lessons.md`).
  - **Discussion panel còn sơ khai** — từng là dead UI (LM-045), giờ tích hợp vào LessonStudyView (LM-045 ✅) nhưng chỉ là khung nhận xét đơn giản, chưa có gắn kết câu hỏi cụ thể/bài cụ thể, không có chống spam/quản trị.
  - Chưa có gợi ý "bài kế tiếp nên học gì" theo kỹ năng; chưa có đánh dấu/review bài; chưa có tóm tắt tiến độ theo bài (chỉ theo sidebar lớp).

## 3. ⭐ Đánh giá giá trị thực tế: 8/10 — 🟢 Thực dụng

Đây là một trong những tính năng "đáng giá nhất" sau chiến dịch fix: cả 5 lỗi chết tính năng đều đã hồi sinh, luồng giáo viên soạn → học viên học theo lớp hoạt động thật, khớp đúng nhu cầu dạy-học thực tế (giáo viên cần kiểm soát lộ trình lớp học).

**Điểm "ảo" cần trừ:**
- **Giá trị phụ thuộc nội dung bài** — curriculum là "khung" điều khiển; nếu bài học bên trong không có nội dung 4 bước đầy đủ (điểm yếu LMS ở `courses-lessons.md`), học viên vẫn gặp bài trống dù sidebar chạy hoàn hảo.
- **Discussion panel sơ khai** — tính năng xã hội (hỏi đáp) chưa đủ để thay thế kênh hỏi bài ngoài (Zalo/classroom ngoài), nên học viên ít có lý do quay lại dùng.
- Chưa có lớp cá nhân hóa: gợi ý bài kế tiếp, đánh dấu bài, tóm tắt tiến độ — người học vẫn phải tự "bắt mạch" lộ trình.

Không còn lỗi kỹ thuật mở (42/42 FIXED); điểm trừ đều là chiều sâu sản phẩm phía trên hạ tầng đã vững.

## 4. 🚧 Điều cần làm để có giá trị thực tế

Checklist ưu tiên — đánh dấu `[x]` + ngày khi hoàn thành:

- [ ] **Đảm bảo mỗi bài trong curriculum có đủ nội dung 4 bước** — kiểm tra/rà soát các bài được import/add vào lớp: Lý thuyết + Trực quan + Quiz + Codelab đều có nội dung thật; bài thiếu bước phải hiển thị cảnh báo rõ cho giáo viên khi thêm vào lớp.
  - *Xong khi nào:* 100% bài trong mọi curriculum mẫu đi hết 4 bước không gặp bước trống; giáo viên được cảnh báo khi thêm bài chưa đủ nội dung.
- [ ] **Tóm tắt tiến độ bài (per-lesson)** — sau mỗi bài, học viên thấy được: thời gian học, điểm quiz tốt nhất, codelab pass chưa, các khái niệm đã học; lưu thành "hồ sơ bài học".
  - *Xong khi nào:* có màn hình/panel tóm tắt sau khi hoàn thành bài; dữ liệu bền vững sau reload.
- [ ] **Đánh dấu/review bài** — học viên đánh dấu bài cần ôn lại (bookmark) hoặc đánh giá "hiểu/khiến khó hiểu" → hiển thị trong sidebar lần sau.
  - *Xong khi nào:* bài được đánh dấu nổi bật trong sidebar (từ lớp lẫn từ lộ trình cá nhân); bộ lọc "chỉ bài cần ôn".
- [ ] **Gợi ý bài kế tiếp theo kỹ năng** — sau khi hoàn thành bài, đề xuất bài kế phù hợp (cùng chủ đề hoặc bổ trợ kỹ năng còn yếu từ quiz) thay vì chỉ "bài tiếp theo tuần tự".
  - *Xong khi nào:* gợi ý có căn cứ (kỹ năng thiếu từ quiz/codelab trước), không ngẫu nhiên; người dùng có thể bỏ qua.
- [ ] *(Ưu tiên trung bình)* **Nâng cấp Discussion panel** — gắn câu hỏi vào bước/bài cụ thể, trả lời đúng người hỏi, chống spam cơ bản (rate limit), thông báo khi có trả lời (nối `notifications.md`).
  - *Xong khi nào:* câu hỏi hiển thị đúng bài/bước, người hỏi nhận thông báo trả lời, không spam được.

## 5. 🧭 Hướng phát triển tiếp theo

Các hướng tiềm năng (chưa cam kết — chọn theo chiến lược sản phẩm):

- **Curriculum mẫu (template) dùng lại**: giáo viên lưu curriculum thành mẫu, tái sử dụng cho lớp mới với 1 click — giảm công soạn lặp lại.
- **Học nhóm theo curriculum**: giao bài theo nhóm nhỏ trong lớp (nối Classrooms) — hoàn thành bài theo nhóm, giáo viên theo dõi nhóm thay vì từng học viên.
- **Thống kê độ khó thực tế của bài** từ dữ liệu học viên (tỷ lệ pass quiz/codelab): giúp giáo viên điều chỉnh độ khó/prerequisite — dữ liệu đã có ở analytics, cần hiển thị trong tab Curriculum.
- **Chế độ "ôn thi"**: curriculum tự sinh lộ trình ôn tập (lặp lại bài có quiz thấp điểm, theo spaced repetition).
- **Kéo curriculum vào Teacher Panel như tab chính thức**: hiện tab Curriculum nằm trong Teacher Panel — nếu nhu cầu giáo viên dùng nhiều, nâng thành trang riêng với viewport rộng.

## 6. 🧪 User Stories & Test Cases tham chiếu

Nguồn: `plan/testing/manual/LessonStudy.md` (giữ nguyên ID gốc).

| Loại | ID | Nội dung |
| :-- | :-- | :-- |
| US | US-LS-001 | Giáo viên xây dựng giáo trình lớp học (curriculum) |
| US | US-LS-002 | Giáo viên tùy chỉnh bài học cho lớp (override + import) |
| US | US-LS-003 | Học viên xem sidebar và mở bài theo tiến trình |
| US | US-LS-004 | Học bài 4 bước (Lý thuyết → Trực quan → Quiz → Codelab) |
| TC | TC-LS-001 (P0) | Teacher — tạo module + tạo item với nội dung thật — regression LS-001/005/011/032 |
| TC | TC-LS-002 (P0) | Teacher — kéo thả reorder module/item — regression LS-003/023/026/033 |
| TC | TC-LS-003 (P1) | Teacher — override prerequisite/tuần tự/ẩn cho item — regression LS-009/006/016/024 |
| TC | TC-LS-004 (P0) | Teacher — import khóa học vào lớp — regression LS-004/014 |
| TC | TC-LS-005 (P1) | Teacher — xóa/ẩn/nhân bản item có xác nhận — regression LS-013/015/030/041 |
| TC | TC-LS-006 (P0) | Student — sidebar khóa/mở theo prerequisite và unlock thật — regression LS-012/010/007/028 |
| TC | TC-LS-007 (P1) | Student — deep-link ?itemId mở đúng bài và ghi "đang học" — regression LS-029/028/CR-037 |
| TC | TC-LS-008 (P2) | Student — mobile drawer sidebar — regression LS-029/036 |
| TC | TC-LS-009 (P1) | Student — hoàn thành bài cập nhật progress sidebar ngay — regression CR-004/CR-007/LM-036 |
| TC | TC-LS-010 (P0) | Lesson Study — bước 2 khóa tới khi đọc xong lý thuyết — regression LM-015/040/LS-038 |
| TC | TC-LS-011 (P1) | Lesson Study — quiz retry không thoái lui completed — regression LM-034 |
| TC | TC-LS-012 (P2) | Lesson Study — hoàn thành bước cuối + codelab đúng flow — regression LM-068/043/017 |
