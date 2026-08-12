# 👨‍🏫 Teacher Panel — Hồ Sơ Thực Trạng & Định Hướng

## 🎯 Mục đích

- **Vấn đề người dùng:** Giảng viên cần một công cụ làm việc thật để soạn nội dung giảng dạy (quiz, codelab, khóa học), theo dõi tiến độ học viên và xuất báo cáo — thay vì phải nhờ Admin hoặc thao tác tay từng bản ghi.
- **Tuyên bố giá trị:** Teacher Panel là nơi giáo viên tạo ra toàn bộ "nguyên liệu" của nền tảng (bộ câu hỏi, bài tập code, khóa học) và kiểm soát lớp học của mình; nếu panel chết, hệ sinh thái nội dung đứng yên.

## 📌 Thực trạng hiện tại

- Trạng thái kỹ thuật: ✅ DoD — Review Round 15 (TC-001→047; **46/47 lỗi đã fix**, TC-041 PARTIAL), backend 591/591 + frontend 3184/3184 pass, `vue-tsc -b` 0 lỗi.
- Đang hoạt động thật:
  - **Quiz Builder CRUD thật** qua manage API — tạo/sửa/xóa quiz, câu hỏi 2–6 đáp án, search/filter, xác nhận unsaved (TC-001/007/008/030/046).
  - **Codelab Builder full CRUD** — template code, hint, testcase lưu thật, hết modal stub "🚧 đang phát triển" (TC-002/003/004).
  - **Course manager** — tạo khóa học, upload thumbnail hết 400, quiz liên kết lesson giữ nguyên (TC-009/010/011).
  - **Analytics tab** — URL v1 hết 404, completionRate ×100 đúng 2 màn, Export Excel có loading (TC-005/017/032).
  - Quyền sở hữu: **quiz gắn CreatedByTeacherId + soft-delete** giữ attempt history/XP ledger; import course transaction + ownership (TC-021/022/025).
  - UX: KeepAlive tabs giữ state/scroll, modal a11y chuẩn, 401→refresh→retry, banner lỗi + Thử lại (TC-013/020/027/028).
- Giới hạn hiện tại:
  - **Import Excel đã bị gỡ** (ERR-257) — docs/test từng ghi "Done" nhưng chỉ còn chiều **export** (TC-024); không có chiều import nội dung hàng loạt.
  - **Quiz/Codelab Builder mới hồi sinh ở Round 15** — chưa qua thời gian sử dụng thật dài để bộc lộ vấn đề UX.
  - **TC-041 PARTIAL:** Teacher thấy mọi Student/course hệ thống — backend chưa có endpoint scope theo classroom/owner.
  - Còn 2 tab quiz song song (TeacherQuizTab + QuizBuilderTab) với 2 API + 2 thang độ khó (TC-031).

## ⭐ Đánh giá giá trị thực tế: 8/10 (🟢 Thực dụng)

- **Điểm thật:** Các luồng soạn giảng cốt lõi (quiz, codelab, khóa học, analytics, export Excel) đều đã hoạt động thật với quyền sở hữu và soft-delete an toàn — đây là công cụ làm việc mỗi giảng viên dùng thường xuyên.
- **Điểm "ảo" (code xanh nhưng chưa thực dụng):**
  - Import Excel từng là lời hứa "soạn nhanh hàng loạt" nhưng đã bị gỡ — chỉ còn export, một nửa câu chuyện nhập liệu biến mất.
  - Quiz/Codelab Builder vừa hồi sinh nên độ tin cậy UX chưa được kiểm chứng bằng sử dụng dài hạn.
  - Student scope (TC-041) là TODO backend — "xem học viên của tôi" chưa thực sự là "của tôi".

## 🚧 Điều cần làm để có giá trị thực tế (checklist ưu tiên)

- [ ] Đóng TC-041 — Student scope theo teacher — acceptance: teacher chỉ thấy học viên/course thuộc lớp/ownership của mình, có endpoint backend + test IDOR.
- [ ] Gỡ nhánh quiz trùng (TC-031) — acceptance: 1 tab quiz duy nhất, 1 API, 1 thang độ khó, xóa dead code TC-043.
- [ ] Import nội dung hàng loạt (Excel/JSON) cho quiz + codelab — acceptance: chọn file → validate dòng lỗi cụ thể → import; khôi phục cam kết "soạn nhanh hàng loạt" mà TC-024 đã đánh mất.
- [ ] Theo dõi sử dụng thật của Quiz/Codelab Builder — acceptance: 2 tuần dùng thật không có P0/P1 mới; trực hóa điểm nghẽn (ví dụ tốc độ lưu câu hỏi, độ dài modal).
- [ ] Xem trước nội dung như học viên (TC-029 preview thật) — acceptance: bấm "Xem trước" mở được giao diện học viên cho quiz/codelab đang soạn, không phải no-op.

## 🧭 Hướng phát triển tiếp theo

- **Template quiz/codelab** — lý do nghiệp vụ: giáo viên soạn lại từ đầu mỗi lần là tốn thời gian nhất; template chuẩn theo topic giúp tái sử dụng (US: "tôi muốn tạo quiz 5 phút từ template có sẵn").
- **Lịch sử sửa đổi nội dung (versioning)** — lý do nghiệp vụ: giáo viên cần xem ai/thời điểm/thay đổi gì khi nội dung bị lỗi (US: "tôi muốn lùi lại phiên bản trước khi câu hỏi bị sửa hỏng").
- **Import/export đầy đủ (roundtrip)** — lý do nghiệp vụ: di chuyển ngân hàng câu hỏi giữa các khóa học/giáo viên; hiện chỉ còn chiều export.
- **Soạn thảo cộng tác & chia sẻ nội dung giữa giáo viên** — lý do nghiệp vụ: tổ bộ môn cùng soạn 1 ngân hàng đề; cần ownership chia sẻ, không chỉ cá nhân.

## 🧪 User Stories & Test Cases (tham chiếu)

- File manual: `plan/testing/manual/TeacherPanel.md`
- US then chốt: **US-TC-001** (quản lý bộ câu hỏi trắc nghiệm), **US-TC-002** (quản lý Codelab), **US-TC-003** (khóa học với ảnh thumbnail), **US-TC-004** (Analytics + xuất Excel), **US-TC-005** (thao tác không mất dữ liệu)
- TC then chốt: **TC-TC-001** (tạo quiz mới — regression TC-001), **TC-TC-002/003** (Codelab + testcase thật — regression TC-002/003/004), **TC-TC-004/005** (upload ảnh + thumbnail đúng — regression TC-009/010), **TC-TC-006** (quiz chỉ owner sửa/xóa — regression TC-021), **TC-TC-007** (soft-delete giữ attempt — regression TC-022), **TC-TC-009** (Excel export loading — regression TC-032), **TC-TC-010** (lỗi API → banner + Thử lại — regression TC-020), **TC-TC-012** (401 → refresh → retry — regression TC-013)
