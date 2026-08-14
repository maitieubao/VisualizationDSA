# Báo Cáo Xác Thực — 08. Lesson Study / Course Modules (Curriculum)

> **Mục đích báo cáo:** Cung cấp bằng chứng để bạn đọc và xác thực lại luồng học viên học bài 4 bước + giáo viên xây curriculum lớp học.
> **Ngày báo cáo:** 2026-08-14 · **Điểm giá trị thực tế hiện tại:** 9/10 — Mức: Thực dụng (tăng từ 8/10 — nội dung 4 bước có thật)

---

## 1. Mục đích (theo tài liệu gốc)

2 vai trò: giáo viên xây giáo trình (module/item, sắp xếp, ẩn bài, prerequisite, import khóa học); học viên đi học theo lớp — sidebar tiến độ, bài khóa có lý do, deep-link, học tuần tự 4 bước (Lý thuyết → Trực quan → Quiz → Codelab).

## 2. Những gì được triển khai (bằng chứng code)

| Thành phần | Vị trí | Trạng thái |
| :-- | :-- | :-- |
| LessonStudyView (4 bước + gating premium + StepTabs khóa bước) | `frontend/src/views/lesson/LessonStudyView.vue` + `features/lesson/components/StepTabs.vue` | [X] |
| Codelab thật ở bước 4 (resolve codelabId → payload API → codelabTask; fallback registry demo) | `frontend/src/features/lesson/store/useLessonStore.ts` (buildLessonFromApi) | [X] |
| Curriculum teacher (module/item CRUD, reorder, override, import) | `backend/src/Application/Features/Classrooms/*` + FE teacher tab | [X] |
| Student curriculum sidebar (khóa/mở theo prerequisite, deep-link `?itemId`) | `frontend/src/features/classroom/*` | [X] |
| Quiz liên kết lesson (heuristic "quiz ngay sau lesson") | `LessonController.GetLessonById` | [X] |
| Nội dung 4 bước có thật (A2): 40 lesson seed đủ lý thuyết + sandbox + quiz + codelab (5 bài codelab DB) | `DbSeeder.cs` | [X] MOI |

## 3. Bằng chứng test

- Backend: classroom curriculum tests (GetStudentClassroomCurriculum, GetTeacherClassroomCurriculum, ImportCourseToClassroom, UpdateClassroomModuleItem...) — ~10 files
- Frontend: `classroom/__tests__/*` (4 files) + `lesson/__tests__/lessonStepCodeLab, lessonStepTheory, lessonStepViz, lessonQuizFlow, lessonStudyFlow...` (13 files)
- E2E: `LessonE2EFlowTests` xác nhận GET lesson published → payload codelab đủ cho bước 4
- Tổng suite: Backend **788/788**, Frontend **3512/3512**, vue-tsc 0

## 4. Các bước xác thực thủ công

| # | Bước | Kỳ vọng |
| :-- | :-- | :-- |
| 1 | Mở 1 bài trong khóa (vd `/lessons/{id}` bài "Sắp xếp cơ bản") | 4 bước: Lý thuyết → Trực quan → Quiz → Codelab |
| 2 | Bước 2 (Trực quan) bị khóa khi chưa đọc xong lý thuyết | Click tab không mở (StepTabs khóa) |
| 3 | Hoàn thành bước 1 → bước 2 mở | Unlock đúng thứ tự |
| 4 | Bước 3 quiz: trả lời + nộp | Điểm 0-100 + bestScore; retry không thoái lui completed |
| 5 | Bước 4 codelab: chạy code mẫu | Public testcase PASSED → hoàn thành bài → XP + progress |
| 6 | Teacher: vào lớp → tab Curriculum → kéo thả reorder module/item | Thứ tự lưu đúng (reorder atomic) |
| 7 | Teacher: thêm item mới vào lớp | Học viên trong lớp nhận notification "Bài mới" (C2) |
| 8 | Học viên vào lớp → sidebar | Tiến độ từng bài + khóa/mở theo prerequisite |

## 5. Giới hạn còn lại (thừa nhận trong hồ sơ)

- Discussion panel sơ khai (khung nhận xét đơn giản).
- Chưa có gợi ý "bài kế tiếp" theo kỹ năng; chưa có bookmark/review bài; chưa có tóm tắt tiến độ per-lesson.
- 35/40 lesson dùng registry demo cho bước 4 (vẫn chạy được).

## 6. [Luu y] Xác thực đặc biệt

- **Quiz "đạt/không đạt" chuẩn:** ngưỡng pass quiz trong analytics D4 là ≥60/100 — dùng chung quy ước với server.
- **Deep-link:** mở URL `/classrooms/{id}?itemId=...` phải mở đúng bài + đánh dấu "đang học".

---

*Báo cáo dựa trên: `plan/review/features/lesson-study.md`, `LessonStudyView.vue`, `useLessonStore.ts`, classroom curriculum tests. Xác thực xong → đánh dấu ngày + ký tên.*
