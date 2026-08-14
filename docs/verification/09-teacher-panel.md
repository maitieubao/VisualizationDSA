# 👨‍🏫 Báo Cáo Xác Thực — 09. Teacher Panel

> **Mục đích báo cáo:** Cung cấp bằng chứng để bạn đọc và xác thực lại Teacher Panel — công cụ làm việc hằng ngày của giảng viên.
> **Ngày báo cáo:** 2026-08-14 · **Điểm giá trị thực tế hiện tại:** 8/10 🟢 Thực dụng

---

## 1. 🎯 Mục đích (theo tài liệu gốc)

Giảng viên soạn nội dung giảng dạy (quiz, codelab, khóa học/bài học, theory article), quản lý lớp, xem analytics + xuất Excel — không cần chạm code.

## 2. 📌 Những gì được triển khai (bằng chứng code)

| Thành phần | Vị trí | Trạng thái |
| :-- | :-- | :-- |
| TeacherPanelView + tabs (Quiz, Codelab, Course, Lớp, Học viên, Analytics, Theory) | `frontend/src/views/teacher/TeacherPanelView.vue` | ✅ |
| **TeacherCourseTab nâng cấp (A1.4)** — tab Soạn thảo/Xem trước markdown an toàn, codelab picker, sandboxConfig JSON validate, publish status (Draft/Private/Published), nút "Xem trước như học viên" | `frontend/src/views/teacher/TeacherCourseTab.vue` | ✅ NEW |
| Quiz Builder full CRUD (question form, picker, import từ ngân hàng) | `QuizBuilderTab.vue` + `useQuizBuilder.ts` + modals | ✅ |
| Codelab Builder full CRUD (template/hint/testcase lưu thật) | `CodelabBuilderTab.vue` + modals | ✅ |
| Theory Article Library + editor | `TheoryArticleLibraryTab.vue` + `TheoryArticleEditorModal.vue` | ✅ |
| Analytics tab (completionRate x100, Export Excel có loading) | `TeacherAnalyticsTab.vue` + `TeacherClassroomAnalytics.vue` | ✅ |
| API teacher chuẩn (401 retry, error banner) | `useTeacherApi.ts` | ✅ |

## 3. 🧪 Bằng chứng test

- Frontend: `views/teacher/__tests__/*` (9 files) — gồm `teacherCourseTabAuthoring.spec.ts` (7 test A1.4: tab xem trước không XSS, codelab picker payload, remove codelab, JSON validate, publish status, preview-as-student)
- Backend: TeacherController/Quiz CRUD tests (TeacherQuizManageTests...)
- Tổng suite: Backend **788/788**, Frontend **3512/3512**, vue-tsc 0

## 4. 🖥️ Các bước xác thực thủ công

| # | Bước | Kỳ vọng |
| :-- | :-- | :-- |
| 1 | Đăng nhập teacher → `/teacher` | Các tab hiển thị |
| 2 | Tab Quiz → tạo quiz mới (5 câu) → lưu | Quiz lưu thật, chỉ owner sửa/xóa |
| 3 | Tab Codelab → tạo codelab (template + hint + testcase) → lưu | CRUD hoạt động, dữ liệu lưu DB |
| 4 | Tab Khóa học → mở 1 bài → đổi nội dung → chọn codelab từ picker → publish "Published" | Lưu thành công; codelab gắn đúng |
| 5 | Bấm "Xem trước như học viên" | Chuyển `/lessons/{id}` — xem đúng giao diện học viên với codelab đã gắn |
| 6 | Tab Analytics → xuất Excel | File tải về có loading, dữ liệu đúng |

## 5. 🚧 Giới hạn còn lại (thừa nhận trong hồ sơ)

- **Import Excel đã bị gỡ (ERR-257)** — chỉ còn chiều export.
- TC-041 PARTIAL: "xem học viên của tôi" chưa thực sự scope theo teacher.
- TC-031: nhánh quiz trùng (dead code) chưa gỡ.

## 6. ⚠️ Lưu ý xác thực đặc biệt

- **XSS markdown:** dán `<script>` vào contentMd → tab Xem trước phải hiển thị dạng TEXT (escape-first), không chạy script.
- **Codelab picker chỉ hiện codelab của teacher** + codelab dùng chung (seed) — codelab teacher khác không xuất hiện.

---

*Báo cáo dựa trên: `plan/review/features/teacher-panel.md`, `TeacherCourseTab.vue`, `useTeacherApi.ts`. Xác thực xong → đánh dấu ngày + ký tên.*
