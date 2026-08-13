# 🎓 Hồ Sơ: Courses & Lessons (LMS)

> Trạng thái file: cập nhật lần cuối 2026-08-13 · Nguồn dữ liệu: `plan/tracking/REVIEW.md` mục 18, `DATN_ERRORS.md` Review Round 13, `plan/testing/manual/CoursesLessons.md`

---

## 1. 🎯 Mục đích

Giải quyết vấn đề của **học viên học lập trình có lộ trình**: thay vì lang thang xem từng visualizer rời rạc, học viên đi theo một khóa học — mỗi bài gồm 4 bước **Lý thuyết → Trực quan → Quiz → Codelab** — có tiến độ, có XP, có chặn premium.

**Tuyên bố giá trị:** Nền tảng tổ chức toàn bộ nội dung học tập (bài học + trực quan hóa + kiểm tra + thực hành) thành lộ trình có cấu trúc, đo được tiến độ và tạo động lực.

## 2. 📌 Thực trạng hiện tại

- **Trạng thái kỹ thuật:** ✅ DoD — Review Round 13 (2026-08-11), 70/71 lỗi LM-001 → LM-071 đã fix (LM-058 DEFERRED — worker pool, có kill-switch 1500ms backstop). **A2 (2026-08-13): 7 codelab mẫu dùng chung + 5 lesson gắn codelab thật + fix contract `codelab`→`codelabTask`.** Backend **775/775 PASS** (+68), frontend **3488/3488 PASS**, `vue-tsc` 0 lỗi. Routes `/courses`, `/courses/:id`, `/lessons/:id`.
- **Điều thật sự hoạt động:**
  - **Backend vững**: hết route trùng PUT/DELETE lessons 500 (LM-001), codelab sandbox chặn fetch/XHR/importScripts/WebSocket + LOOP_LIMIT sentinel (LM-004), **XP server-side không tin client** + cap 500 XP/ngày + rate limit (LM-006), gate publish/premium cho progress (LM-005), IDOR unlocked-items chặn (LM-007), server filter IsPublished (LM-008), CompleteLesson upsert atomic (LM-009).
  - **Race đổi bài hết**: isSameLesson sau mỗi await, retry sync theo (lessonId, payload) MAX 3, course/courses race-token (LM-010/030/031/032).
  - **Luồng học đúng**: gating premium đồng nhất `courseAccess.ts` mọi điểm chạm, StepTabs khóa bước 2 thật, progress card đếm từ localStorage `lesson_progress_*`, quiz score thống nhất 0–100 2 đầu + bestScore (LM-014/015/021/037/040).
  - **Codelab thật sự chạy được**: sandbox an toàn, task registry, Monaco skeleton + retry, badge task thật (LM-004/042/043).
  - **Nội dung khóa mẫu CÓ THẬT (A2)**: 7 codelab seed dùng chung (Bubble/Selection/Insertion/Merge Sort, Binary Search, BFS/DFS) — mỗi codelab đủ 5 testcase (1 ẩn không lộ đáp án), 3 hints miễn phí, template JS, initialCode chuẩn `function solution`; 5 lesson gắn codelab thật (Sắp xếp cơ bản→Bubble, Tìm kiếm→Binary Search, Cây→DFS, Đồ thị→BFS, Sắp xếp nâng cao→Merge). Có 3 lộ trình published (Foundation/Intermediate/Advanced, 40 lesson) — học viên đi hết khóa không gặp bước trống.
  - **Test thật**: lessonStepCodeLab 6 + lessonApi 9 + lessonStoreRace 3 mới, gating full matrix, hết pass giả (LM-017/018/046/047). **E2E đóng vòng (A3):** 5 test mô phỏng học viên đi xuyên bài khóa mẫu trên seed thật — GET lesson published (codelab payload đủ testcase/hint/template) → chạy judge solution pass → complete cộng XP + progress, complete lần 2 không cộng XP.
- **Giới hạn còn lại:**
  - **Còn 35/40 lesson chưa gắn codelab thật** — 5 bài chủ lực đã có codelab DB, các bài còn lại fallback registry demo FE (vẫn chạy được, nhưng chưa qua judge backend thật).
  - LM-058 DEFERRED: worker pool + per-testcase timeout (tái kiến trúc — kill-switch 1500ms là giải pháp tạm).
  - Chưa có hệ đánh giá/rating khóa học từ học viên.

## 3. ⭐ Đánh giá giá trị thực tế: 9/10 — 🟢 Thực dụng (kệ hàng đã có hàng)

Luồng kỹ thuật là đúng và đáng tin: sandbox an toàn, XP không farm được, gating nhất quán, race đã được xử lý tận gốc. Sau A2/A3 "kệ hàng trống" đã có nội dung thật: 7 codelab seed + 5 bài học gắn codelab + 3 lộ trình published + vòng E2E đóng kín trên dữ liệu seed.

**Điểm trừ còn lại (nhỏ):**
- 35/40 lesson chưa gắn codelab DB — fallback registry demo vẫn chạy được nhưng chưa qua judge backend.
- LM-058 worker pool deferred — kill-switch 1500ms là tạm đủ.
- Chưa có rating/đánh giá khóa học.

## 4. 🚧 Điều cần làm để có giá trị thực tế

Checklist ưu tiên — đánh dấu `[x]` + ngày khi hoàn thành:

- [x] **Biên soạn 1–2 khóa học mẫu HOÀN CHỈNH** — mỗi khóa ≥ 5 bài, mỗi bài đủ 4 bước: lý thuyết (có nội dung thật, không placeholder) + bước trực quan (trỏ đúng visualizer/engine hiện có) + quiz (đạt/không đạt chuẩn) + codelab (task + testcase thật, badge task đúng). **2026-08-13 (A1+A2):** 40 lesson seed nội dung đầy đủ (>800 ký tự mỗi bài), quiz liên kết 40/40, 5 bài gắn codelab DB thật (7 codelab mẫu); 3 lộ trình published. Vòng E2E xác nhận: học viên GET bài published → payload codelab đủ → judge pass → XP + progress.
- [x] **Khóa học thứ 2 đa dạng hóa danh mục** — **2026-08-13 (A2):** 2 chủ đề đã phủ: Sorting (Bubble/Selection/Insertion/Merge) + Graph/Search (BFS/DFS/Binary Search) — quy trình seed lặp lại được (chỉ thêm dữ liệu, không sửa code).
- [ ] **Publish workflow trực quan cho giáo viên** — từ soạn (Teacher Panel) → duyệt → phát hành, có trạng thái rõ ràng (Draft/Published), kiểm tra "đủ 4 bước" trước khi cho publish.
  - *Xong khi nào:* giáo viên tự tạo khóa học đầy đủ → publish → học viên thấy ngay; khóa thiếu bước bị chặn publish kèm lý do. *(A1 đã có codelab picker + publish Draft/Private/Published + "Xem trước như học viên" — còn thiếu kiểm tra "đủ 4 bước" + luồng duyệt.)*
- [ ] **Rating/đánh giá khóa học** — học viên chấm sao + nhận xét sau khi hoàn thành (hoặc đang học), hiển thị trên card khóa học.
  - *Xong khi nào:* khóa học có điểm đánh giá trung bình từ dữ liệu thật; chỉ học viên đã học mới đánh giá được.
- [ ] *(Ưu tiên trung bình)* **Worker pool + per-testcase timeout** (LM-058) — hết cảnh 1 testcase treo giết cả bài chạy.
  - *Xong khi nào:* codelab có nhiều testcase chạy tuần tự không tương tác nhau; 1 testcase treo → timeout riêng, không giết phần còn lại.
- [ ] *(Ưu tiên trung bình)* **Gắn codelab DB cho 35 lesson còn lại** — nâng toàn bộ khóa mẫu lên judge backend thật, bỏ fallback registry.
  - *Xong khi nào:* mọi lesson trong 3 lộ trình đều có CodelabId trỏ codelab seed; registry FE chỉ còn dùng cho demo/offline.

## 5. 🧭 Hướng phát triển tiếp theo

Các hướng tiềm năng (chưa cam kết — chọn theo chiến lược sản phẩm):

- **Editor khóa học trực quan (WYSIWYG)**: kéo thả sắp xếp bài, chèn visualizer/quiz/codelab bằng cách chọn từ thư viện — giảm rào cản biên soạn nội dung.
- **Nội dung cộng đồng (marketplace)**: giáo viên đăng khóa, admin duyệt, chia sẻ doanh thu — nguồn nội dung bền vững ngoài team soạn.
- **Lộ trình học cá nhân hóa**: đề xuất khóa kế tiếp dựa trên kỹ năng đã đạt (nối với gợi ý bài ở `lesson-study.md`).
- **Học theo lớp**: gán khóa học vào Classroom để học viên trong lớp học cùng tiến độ (nối `classrooms.md`).
- **Chứng chỉ hoàn thành khóa học**: học viên hoàn thành khóa nhận chứng chỉ hiển thị trên Profile — động lực hoàn thành + nội dung cho chức năng Profile.

## 6. 🧪 User Stories & Test Cases tham chiếu

Nguồn: `plan/testing/manual/CoursesLessons.md` (giữ nguyên ID gốc).

| Loại | ID | Nội dung |
| :-- | :-- | :-- |
| US | US-LM-001 | Duyệt danh sách khóa học và xem tiến độ cá nhân |
| US | US-LM-002 | Học bài theo 4 bước và nhận XP |
| US | US-LM-003 | Hoàn thành khóa học |
| US | US-LM-004 | Làm codelab an toàn trong sandbox |
| TC | TC-LM-001 (P1) | Tiến độ khóa học đúng sau khi hoàn thành bài — regression LM-014/066 |
| TC | TC-LM-002 (P0) | Gating premium đồng nhất mọi điểm chạm — regression LM-037/019 |
| TC | TC-LM-003 (P0) | XP không farm được — regression LM-006/009 |
| TC | TC-LM-004 (P0) | Codelab sandbox chặn fetch và while(true) — regression LM-004/017/055 |
| TC | TC-LM-005 (P1) | Quiz score percent đúng thang 0–100 — regression LM-021/056 |
| TC | TC-LM-006 (P1) | Đổi bài giữa lúc submit không lệch XP — regression LM-010/030/031/032 |
| TC | TC-LM-007 (P2) | Hoàn thành bài cuối → modal đúng, không có nút chết — regression LM-012/036 |
| TC | TC-LM-008 (P0) | Bài ẩn/Draft không hiển thị với học viên — regression LM-008/007/LS-007 |
| TC | TC-LM-009 (P2) | Lỗi tải danh sách khóa học → error state riêng — regression LM-038/069 |
| TC | TC-LM-010 (P2) | StepTabs khóa đúng — click tab khóa không mở — regression LM-015/040/LS-038 |
| TC | TC-LM-011 (P1) | Quiz retry không thoái lui trạng thái hoàn thành — regression LM-034/071 |
| TC | TC-LM-012 (P2) | A11y CompletionModal + Monaco skeleton khi codelab tải — regression LM-039/042 |
