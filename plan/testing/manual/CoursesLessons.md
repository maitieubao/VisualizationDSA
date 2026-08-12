# 🎓 Courses & Lessons (LMS) — Hướng dẫn Manual Test

## 📋 Tổng quan
- **Scope:** frontend `features/lesson/**` (codelabExecutor, codelab.worker, codelabTaskRegistry, useLessonStore, lessonApi, LessonStepCodeLab, LessonStudyView...) + `features/courses/**` (useCourseStore, courseApi, CourseCard, CourseSidebar...) + `views/courses|lesson/**`; backend `CourseController.cs`/`LessonController.cs`/`ClassroomProgressController.cs` — routes `/courses`, `/courses/:id`, `/lessons/:id`
- **Trạng thái:** ✅ DoD (Review Round 13 — 70/71 lỗi LM-001 → LM-071 đã fix; LM-058 DEFERRED worker pool — có kill-switch 1500ms backstop)
- **Test tự động:** frontend 3086/3086 pass (166 files) + backend 507/507 pass; Courses & Lessons suite 46 → 74 tests
- **Môi trường:** Chrome/Edge, backend chạy local (localhost:5055), tài khoản student + teacher; kiểm tra cả role Premium (cần account premium hoặc giả lập qua admin).

## 👤 User Stories

### US-LM-001: Duyệt danh sách khóa học và xem tiến độ cá nhân
- **Vai trò:** Học viên
- **Mục tiêu:** Xem danh sách khóa học, thẻ bài hiển thị tiến độ đúng (bao nhiêu bài đã hoàn thành)
- **Chấp nhận:** Tiến độ tăng ngay sau khi hoàn thành bài; bài Draft không xuất hiện với học viên; khóa học premium hiển thị gating nhất quán.

### US-LM-002: Học bài theo 4 bước và nhận XP
- **Vai trò:** Học viên
- **Mục tiêu:** Đọc lý thuyết → trực quan → làm quiz → codelab; XP cộng đúng theo backend
- **Chấp nhận:** XP không thể farm (gửi request lặp không tăng); điểm quiz quy về thang 0–100 chính xác; đổi bài giữa submit không làm XP bài A rơi vào bài B.

### US-LM-003: Hoàn thành khóa học
- **Vai trò:** Học viên
- **Mục tiêu:** Hoàn thành bài cuối thấy modal thành công, quay lại danh sách thấy tiến độ 100%
- **Chấp nhận:** Modal đóng khi chuyển bài; bài cuối không có nút "Hoàn thành" chết.

### US-LM-004: Làm codelab an toàn trong sandbox
- **Vai trò:** Học viên (đặc biệt tò mò code độc)
- **Mục tiêu:** Viết code giải bài tập, không thể gọi mạng hoặc vòng lặp vô hạn làm treo
- **Chấp nhận:** `fetch`/`while(true)` bị chặn với thông báo rõ ràng; kết quả chạy được so sánh chuẩn.

## 🧪 Test Cases

### TC-LM-001: Tiến độ khóa học đúng sau khi hoàn thành bài (P1)
- **Chuẩn bị:** Đăng nhập học viên; chọn khóa học có 3 bài (lesson_progress_* chưa tồn tại).
- **Các bước:**
  1. Mở `/courses` → ghi lại phần trăm/progress trên thẻ khóa học (ban đầu 0/3).
  2. Vào khóa học, hoàn thành bài 1 (đọc hết lý thuyết + hoàn thành bước cuối).
  3. Quay lại `/courses` (hoặc xem thẻ ngay) → ghi lại progress.
  4. Mở tab ẩn danh khác cũng đăng nhập → xem thẻ khóa học.
- **Kết quả mong đợi:** Progress tăng đúng 1/3 sau khi hoàn thành bài 1 (đếm từ localStorage `lesson_progress_*`); không còn tình trạng luôn 0% / CTA luôn "Bắt đầu" dù đã học; hiển thị nhất quán giữa các tab.
- **Verify regression:** LM-014 (progress card đếm từ localStorage), LM-066 (nút "Tiếp tục" khi progress > 0).

### TC-LM-002: Gating premium đồng nhất mọi điểm chạm (P0)
- **Chuẩn bị:** Đăng nhập học viên KHÔNG premium; khóa học premium (có badge Premium).
- **Các bước:**
  1. Mở `/courses` → bấm vào khóa premium từ thẻ.
  2. Ghi lại hành vi (chuyển `/checkout` hay vào detail).
  3. Vào `/courses/:id` → bấm CTA "Bắt đầu học".
  4. Bấm vào bài premium trong sidebar bên trái.
  5. Đổi sang tài khoản Premium (hoặc admin bật premium) → lặp lại 1–4.
- **Kết quả mong đợi:** Mọi điểm chạm (card, CTA, sidebar, link trực tiếp) đưa học viên không-premium về `/checkout` (hoặc 403 với thông báo) — KHÔNG có chỗ vào thẳng 403 bất ngờ; sau khi premium, vào học bình thường không bị chặn lẻ tẻ.
- **Verify regression:** LM-037 (gating đồng nhất courseAccess.ts), LM-019 (403 premium → message).

### TC-LM-003: XP không farm được (P0 — bảo mật)
- **Chuẩn bị:** Đăng nhập học viên; ghi lại `totalXP` hiện tại (Profile → XP).
- **Các bước:**
  1. Hoàn thành 1 quiz/bài có XP reward → ghi XP tăng bao nhiêu (dự kiến = `lesson.XPReward`).
  2. Dùng DevTools/curl gửi lặp request `POST /api/v1/users/me/xp` (hoặc `award-xp`) 10 lần liên tiếp với cùng payload `{amount: 50}`.
  3. Gửi request với amount 1000 (vượt cap).
  4. Kiểm tra XP sau cùng.
- **Kết quả mong đợi:** XP chỉ cộng 1 lần cho cùng hoạt động (idempotency); request lặp không tăng XP; amount vượt cap bị từ chối/clamp; tổng XP/ngày không vượt cap 500; con số XP hiển thị = con số server cấp (không tin client).
- **Verify regression:** LM-006 (XP server-side + cap 500/ngày + rate limit), LM-009 (CompleteLesson upsert atomic).

### TC-LM-004: Codelab sandbox chặn fetch và while(true) (P0)
- **Chuẩn bị:** Vào bài có Code Lab (bước 4); mở DevTools → Network.
- **Các bước:**
  1. Gõ code: `fetch('https://example.com').then(r => console.log(r))` vào editor codelab → **Chạy**.
  2. Quan sát Network: có request nào gửi ra ngoài không.
  3. Gõ `while (true) {}` → **Chạy**.
  4. Gõ code đúng đáp án → **Chạy** (đối chứng).
- **Kết quả mong đợi:** `fetch` bị chặn (không có request mạng ra ngoài, có thông báo lỗi thay thế); `while(true)` bị dừng bởi LOOP_LIMIT sentinel (kết quả "timed out"/lỗi lặp vô hạn) trong ≤ vài giây, không treo tab; nút Submit bị khóa khi chạy lỗi; code đúng vẫn chạy và pass bình thường.
- **Verify regression:** LM-004 (sandbox chặn fetch/XHR/importScripts + LOOP_LIMIT), LM-017 (runError khóa Submit), LM-055 (onmessageerror).

### TC-LM-005: Quiz score percent đúng thang 0–100 (P1)
- **Chuẩn bị:** Vào bài có quiz 5 câu; mở DevTools → Network để đọc payload `POST .../submit` (hoặc `/auth/progress`).
- **Các bước:**
  1. Làm quiz đúng 4/5 → nộp bài.
  2. Ghi lại `quizScore` trong payload + % hiển thị trên UI.
  3. Làm lại đúng 5/5 → nộp.
  4. Làm lại 0/5 → nộp.
- **Kết quả mong đợi:** UI luôn hiển thị phần trăm 0–100: 4/5 = 80%, 5/5 = 100%, 0/5 = 0%; payload `quizScore` gửi lên cùng thang 0–100 (không gửi "4" để backend hiểu thành 4%); bestScore được ghi nhận.
- **Verify regression:** LM-021 (quizScore thống nhất 0..100 2 đầu), LM-056 (RecordBestScore).

### TC-LM-006: Đổi bài giữa lúc submit không lệch XP (P1)
- **Chuẩn bị:** Hai bài A và B liền kề, đều có quiz; ghi lại XP trước khi test.
- **Các bước:**
  1. Mở bài A, bấm submit quiz bài A.
  2. NGAY LẬP TỨC (khi request đang chờ) bấm chuyển sang bài B.
  3. Đợi response trả về; kiểm tra XP hiển thị và localStorage.
  4. Làm bài B, hoàn thành; kiểm tra lần cuối.
- **Kết quả mong đợi:** XP của bài A chỉ ghi vào bài A (isSameLesson guard sau await); không thấy XP/lịch sử của A ghi đè vào bài B (kể cả khi chuyển bài nhanh giữa submit); retry sync (nếu có) gắn đúng (lessonId, payload) và dừng sau MAX 3 lần.
- **Verify regression:** LM-010 (race đổi bài), LM-030 (retry theo bài + MAX 3), LM-031/032 (course/courses race-token).

### TC-LM-007: Hoàn thành bài cuối → modal đúng, không có nút chết (P2)
- **Chuẩn bị:** Vào bài CUỐI của khóa học (lessonId = bài cuối theo thứ tự).
- **Các bước:**
  1. Hoàn thành tất cả bước của bài cuối.
  2. Quan sát modal hoàn thành (nút chính).
  3. Nếu modal có nút "Học bài tiếp theo" → bấm và quan sát.
  4. Kiểm tra nút "Hoàn thành" ở StepTabs có bị disabled vô lý không.
- **Kết quả mong đợi:** Modal hiển thị đúng (thành công/XP); với bài cuối, modal không đưa tới bài không tồn tại; không có nút "Hoàn thành" disabled chết ở bài cuối (hoặc hành vi phù hợp); khi chuyển bài (nếu có bài kế), modal tự đóng không dính đè lên bài mới.
- **Verify regression:** LM-012 (modal đóng khi chuyển bài), LM-036 (nút hoàn thành bài cuối).

### TC-LM-008: Bài ẩn/Draft không hiển thị với học viên (P0 — phân quyền)
- **Chuẩn bị:** Đăng nhập 2 tài khoản: teacher (có khóa học draft/premium) và student (đăng ký khóa).
- **Các bước:**
  1. Teacher: tạo khóa học mới nhưng để trạng thái **Draft** (chưa publish).
  2. Student: mở `/courses` và search tên khóa.
  3. Teacher: publish khóa; Student refresh `/courses`.
  4. Teacher: ẩn 1 bài (IsHidden) trong khóa; Student mở khóa → xem danh sách bài.
  5. Student: gửi request trực tiếp `GET /api/v1/classrooms/{id}/unlocked-items` với classroom KHÔNG thuộc mình → ghi lại status.
- **Kết quả mong đợi:** Khóa Draft không xuất hiện ở student (server filter IsPublished, không chỉ client lọc); bài IsHidden không hiện trong curriculum/sidebar student; request unlocked-items lớp lạ bị 403 (check enrollment, chống IDOR).
- **Verify regression:** LM-008 (server filter IsPublished), LM-007 (IDOR unlocked-items), LS-007 (query lọc hidden).

### TC-LM-009: Lỗi tải danh sách khóa học → error state riêng, không lẫn empty (P2)
- **Chuẩn bị:** Mở `/courses`; DevTools → Network → Offline.
- **Các bước:**
  1. Refresh `/courses` khi offline.
  2. Quan sát UI.
  3. Bật lại Network → bấm reload.
- **Kết quả mong đợi:** Khi lỗi: hiện error state + nút "Thử lại" (KHÔNG đồng thời hiện "Chưa có khóa học nào" empty state giả); khi có mạng lại, danh sách tải bình thường.
- **Verify regression:** LM-038 (load fail tách empty/error), LM-069 (nút Thử lại ở detail).

### TC-LM-010: StepTabs khóa đúng — click tab khóa không mở (P2)
- **Chuẩn bị:** Vào bài có 4 bước (Lý thuyết → Trực quan → Quiz → Codelab); CHƯA đọc hết lý thuyết.
- **Các bước:**
  1. Bấm vào tab "Trực quan" khi chưa đọc xong lý thuyết.
  2. Quan sát hành vi (có mở không).
  3. DevTools → Accessibility: kiểm tra tab bar `role=tablist`, tab `aria-selected`.
  4. Đọc hết lý thuyết → bấm tab "Trực quan".
- **Kết quả mong đợi:** Tab chưa mở khóa: click không mở (hoặc có thông báo "đọc hết để mở khóa"); tablist/aria-selected đầy đủ; sau khi đọc xong lý thuyết, tab mở được ngay.
- **Verify regression:** LM-015 (gate step 2 thật), LM-040 (StepTabs tablist + khóa), LS-038 (ARIA tab).

### TC-LM-011: Quiz retry không thoái lui trạng thái hoàn thành (P1)
- **Chuẩn bị:** Vào bài có quiz; hoàn thành bài (completed = true trong localStorage `lesson_progress_*`).
- **Các bước:**
  1. Bấm **Làm lại** quiz của bài đã hoàn thành.
  2. Nộp bài với kết quả TRƯỢT (dưới 70%).
  3. Kiểm tra localStorage + badge hoàn thành + XP.
  4. Nộp lại đạt yêu cầu.
- **Kết quả mong đợi:** Bài đã hoàn thành KHÔNG bị đánh dấu completed:false sau lần làm lại trượt (một chiều, không thoái lui); XP không bị trừ; badge/tick hoàn thành giữ nguyên; lần nộp sau đạt vẫn pass bình thường.
- **Verify regression:** LM-034 (completed một chiều), LM-071 (getQuizById fail giữ local).

### TC-LM-012: A11y CompletionModal + Monaco skeleton khi codelab tải (P2)
- **Chuẩn bị:** Vào bài có codelab; DevTools → Network chậm (throttle Slow 4G).
- **Các bước:**
  1. Mở bước Codelab → quan sát vùng editor lúc đang tải Monaco.
  2. Hoàn thành bài → quan sát modal: `role=dialog`, `aria-modal`, focus trap (Tab vòng), Esc đóng, scroll body khóa.
  3. Giả lập Monaco fail (chặn CDN) → reload.
- **Kết quả mong đợi:** Có skeleton loading (không trắng hình); modal chuẩn a11y (focus trap, Esc, restore focus, aria-modal); khi Monaco lỗi có thông báo/retry rõ ràng thay vì chỉ console.error.
- **Verify regression:** LM-039 (CompletionModal a11y), LM-042 (Monaco skeleton + retry).
