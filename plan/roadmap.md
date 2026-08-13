# 🗺️ ROADMAP — Kế Hoạch Phát Triển Tiếp Theo (2026-08-11 →)

> **Cơ sở:** Đánh giá thực trạng 16 tính năng trong `plan/review/` — code đã xanh nhưng giá trị thực tế có độ lệch lớn (Thực dụng vs Demo-grade vs Hạ tầng chờ).
> **Nguyên tắc sắp thứ tự:** (1) lấp điểm yếu thật → (2) giá trị user/effort → (3) khả thi ngay.
> **Trạng thái:** 🟢 Đang làm · ⏳ Chờ · 🔒 Khoá phụ thuộc

---

## 🏗️ PHASE A — Content Pipeline: Công cụ soạn bài + Nội dung mẫu (🟢 ĐANG LÀM)

> **Lý do ưu tiên số 1:** nền tảng 16 tính năng nhưng "thuốc" (bài học thật) mỏng — LMS chỉ 7/10. Mỗi bài hoàn chỉnh (4 bước) kích hoạt đồng thời Gamification, Notifications, Profile, Leaderboard.

### A1 — Lesson Authoring Tool (✅ HOÀN TẤT 2026-08-11)
**Mục tiêu:** Teacher soạn được bài học 4 bước hoàn chỉnh ngay trong app, gắn được codelab của chính mình, xem trước như học viên.
**Kết quả:** migration `AddLessonCodelabId`; Lesson.CodelabId + PublishStatus (Draft/Private/Published); gate publish theo role; codelab payload đủ cho bước 4; form soạn bài có tab Xem trước markdown an toàn, codelab picker, JSON validate, nút "Xem trước như học viên". FE 3486 (+12) / BE 768 (+14) test xanh.

| # | Công việc | Acceptance | Trạng thái |
| :-- | :-- | :-- | :-- |
| A1.1 | Backend: `Lesson.CodelabId` + migration; SaveDraftLessonDto/CreateDraftLessonCommand/Lesson.Update nhận CodelabId + validate thuộc teacher | Có migration mới; lưu/đọc roundtrip CodelabId; codelab teacher khác → 403 | ✅ |
| A1.2 | Backend: GetLessonById trả codelab payload (title/task/testcases) cho bước 4; SaveDraftLessonDto thêm PublishStatus | LessonStudyView hiển thị codelab gắn thật | ✅ |
| A1.3 | Frontend: Lesson type + lessonApi/useLessonStore resolve codelabId (fallback demo registry) | Bước 4 dùng codelab gắn khi có | ✅ |
| A1.4 | Frontend: TeacherCourseTab form nâng cấp — tab Soạn thảo/Xem trước markdown, codelab picker, sandboxConfig JSON validate, publish status, nút "Xem trước như học viên" | Soạn → lưu → preview đủ 4 bước | ✅ |
| A1.5 | Tests: backend command/DTO/403 + frontend form/preview/resolve codelab | 100% test xanh | ✅ |

### A2 — Biên soạn 2 khóa mẫu hoàn chỉnh — ✅ HOÀN TẤT
**Mục tiêu:** Seed 7 codelab thật (Bubble/Selection/Insertion/Merge Sort, Binary Search, BFS/DFS Graph) + gắn vào 5 bài học seed + fix contract mismatch backend→FE.
**Kết quả:** SeedCodelabsAsync upsert 7 codelab dùng chung (OwnerId=null); UpsertLessonCodelabLinksAsync gắn CodelabId vào lesson 09/10/18/20/28; lessonApi normalize `codelab`→`codelabTask` (PascalCase→camelCase, hints→string[], difficulty int→VN). Backend 770 (+2), FE 3488 (+2), vue-tsc 0.

| # | Công việc | Acceptance |
| :-- | :-- | :-- |
| A2.1 | Seed 7 codelab mẫu dùng chung (bubble/selection/insertion/merge/binary-search/bfs/dfs) | 7 codelab có testcases/hints/templates |
| A2.2 | Gắn CodelabId vào 5 lesson seed (09,10,18,20,28) | Lessons có codelabId thật, Published |
| A2.3 | lessonApi normalize backend `codelab` payload | FE nhận codelabTask chuẩn, không lệch field |

### A3 — Đóng vòng E2E — ✅ HOÀN TẤT
| # | Công việc | Acceptance |
| :-- | :-- | :-- |
| A3.1 | E2E integration test xuyên khóa mẫu trên seed thật (LessonE2EFlowTests 5 test): GET lesson published (codelab payload đủ testcase/hint/template) → chạy judge solution pass → complete cộng XP + progress; complete lần 2 không cộng XP | 5/5 pass, backend 775 |
| A3.2 | Cập nhật hồ sơ review: courses-lessons 7→9/10, lesson-study 8→9/10, gamification 7→8/10 (có nguồn XP thật + nội dung) | Điểm cập nhật trong `plan/review/` |

---

## 🐞 PHASE B — Code Debugger nâng cấp (🟢 ĐANG LÀM — B1-B4 ✅ 2026-08-13)

> CV hiện 8.5/10 — stepper tốt nhưng thiếu UX debugger chuẩn. **Đã bổ sung: breakpoint, watch panel, snapshot biến primitive.**

- [x] B1: Breakpoint (click gutter) + stop at line — **2026-08-13**: click gutter line number toggle breakpoint (chấm đỏ glyph), play tự động dừng tại frame có lineNumber ∈ breakpoints, stepNext tay vẫn nhảy qua; menu "Xóa breakpoint".
- [x] B2: Watch panel (theo dõi biến tuỳ chọn) — **2026-08-13**: executor snapshot `variables` primitive (number/string/boolean, không object/array) mỗi frame; store watchList persist + watchedValues + changedVariables (highlight biến đổi); UI panel chips chọn biến + bảng giá trị highlight cyan khi đổi.
- [x] B3: Instrument closure + template đơn giản; var loop tracking dứt điểm — **2026-08-13**: safeVars capture closure (biến hàm con tracked), vòng lặp lồng nhau track đủ i+j; test B3.1/B3.2.
- [x] B4: Gắn nhãn đúng bản chất "Trình chạy từng bước pseudocode" + lưu/lấy session code (nối Profile/Export) — **2026-08-13**: header "Trình chạy từng bước (JavaScript)" + chip pseudocode; menu "Xuất code" (copy clipboard); session code/input đã persist localStorage + share URL.

---

## 🔌 PHASE C — Nối các tích hợp thật (🟢 ĐANG LÀM — C1/C2/C4 ✅ 2026-08-13, C3 ⏳ chờ verify thật)

> Đưa 3 tính năng Demo-grade/Hạ tầng chờ lên mức thực dụng.

- [x] C1: **Payment** — 2026-08-13: lazy-cleanup order hết hạn (GetOrderStatusAsync đánh dấu Expired khi order quá hạn, không còn hiện Pending cho QR chết); nhãn "Môi trường mô phỏng thanh toán" rõ ràng trên checkout. SePay webhook vốn đã fail-closed (Apikey + rate limit + account/amount guard).
- [x] C2: **Notifications** — 2026-08-13: nối level-up + badge award THẬT — `GamificationService.AwardXpAndCheckBadgesAsync` gọi `NotifyLevelUpAsync` (khi level tăng) + `NotifyBadgeAwardedAsync` (từng badge mới) SAU commit; `LessonController.CompleteLesson` gọi NotifyLevelUpAsync (nguồn XP thật từ bài học); lỗi notification không làm hỏng request cấp XP.
- [ ] C3: **Embed** — phần code đã xong từ trước (EW-001..026, auto-height cross-origin pipeline có test); đã thêm `docs/host/sample-host.html` (trang demo host + protocol WIDGET_READY/HEIGHT_CHANGED/QUIZ_COMPLETED). Còn: verify trên browser thật + tài liệu host hoàn chỉnh.
- [x] C4: **Export/Share** — 2026-08-13: quyết định chiến lược = ảnh chất lượng cao cho báo cáo (algo-playground thêm "Xuất ảnh PNG" — canvas.toDataURL + download tên theo demo+bước); system design đã có PNG/SVG pipeline sẵn.

---

## ✨ PHASE D — Hoàn thiện sản phẩm (🟢 D1/D3/D4 ✅ 2026-08-13 — D2 deferred)

- [x] D1: Gắn nhãn "Mô phỏng/Demo" cho các luồng chưa nối thật — 2026-08-13: checkout nhãn "Môi trường mô phỏng thanh toán" (C1); nút "+50 XP (Demo)" chỉ Teacher/Admin + title giải thích XP thật đến từ CompleteLesson.
- [ ] D2: i18n sẵn sàng (tách chuỗi tiếng Việt) — **DEFERRED**: scope lớn (hàng nghìn chuỗi), rủi ro phá 3500+ test; giá trị thấp cho giai đoạn hiện tại. Nếu cần, làm theo module khi sản phẩm có nhu cầu đa ngôn ngữ.
- [x] D3: Component library docs — 2026-08-13: `docs/components.md` (BaseIcon, TheoryAccordionItem/CollapsiblePanel/SummaryView + biến CSS theme + conventions) thay Storybook (không thêm dependency/build).
- [x] D4: Analytics học tập — 2026-08-13: endpoint `GET /admin/analytics/learning` — per-lesson (learners, % xem viz, % làm quiz, % pass quiz, % pass codelab, % hoàn thành, avg best score) + overall + **tương quan "xem viz → pass quiz"** (passRateWith/WithoutVisualizer — bằng chứng hiệu quả). FE: tab "Học tập" trong Admin Panel (5 card tổng quan + biểu đồ so sánh + bảng chi tiết bài).

---

## 📈 Tiến độ tổng

| Phase | Trạng thái | Ghi chú |
| :-- | :-- | :-- |
| A — Content Pipeline | ✅ A1 A2 A3 XONG | 2026-08-11/13 |
| B — Code Debugger | ✅ B1-B4 XONG | 2026-08-13 |
| C — Tích hợp thật | 🟢 C1✅ C2✅ C4✅ — C3 chờ verify thật | C3 cần browser/LMS thật |
| D — Hoàn thiện | 🟢 D1✅ D3✅ D4✅ — D2 deferred | D4 analytics chứng minh hiệu quả |
| C — Tích hợp thật | ⏳ | Sau B |
| D — Hoàn thiện | ⏳ | Sau C |

## 🗓️ Lịch sử
| Ngày | Nội dung |
| :-- | :-- |
| 2026-08-11 | Khởi tạo roadmap; chọn Phase A (Content Pipeline) làm ưu tiên #1 dựa trên đánh giá thực trạng; bắt đầu A1 |
| 2026-08-13 | **A2 hoàn tất** — Seed 7 codelab mẫu (bubble/selection/insertion/merge sort, binary search, bfs/dfs graph) dùng chung OwnerId=null; UpsertLessonCodelabLinks gắn vào 5 lesson seed (09/10/18/20/28); lessonApi normalize backend `codelab` (PascalCase) → FE `codelabTask` (camelCase, hints string[], difficulty VN). Backend 770 (+2), FE 3488 (+2), vue-tsc 0. → Chuyển A3 (E2E manual test). |
| 2026-08-13 | **A3 hoàn tất — Đóng vòng E2E** — LessonE2EFlowTests (5 test) mô phỏng học viên đi xuyên bài khóa mẫu trên seed thật: GET lesson published (codelab payload đủ testcase/hint/template, test ẩn không lộ đáp án) → chạy judge solution pass → CompleteLesson cộng XP + progress, lần 2 không cộng (idempotent). Backend 775 (+5). Review: courses-lessons 7→9, lesson-study 8→9, gamification 7→8. **Phase A Content Pipeline hoàn tất.** |
| 2026-08-13 | **Phase B Code Debugger hoàn tất (B1-B4)** — Breakpoint (click gutter toggle + chấm đỏ + auto-pause khi play); Watch panel (executor snapshot `variables` primitive mỗi frame, watchList persist, highlight biến đổi); instrument closure/vòng lồng nhau track đủ (test B3); nhãn "Trình chạy từng bước" + menu "Xuất code". Frontend 3504/3504 (+16), vue-tsc 0. |
| 2026-08-13 | **Phase C (C1/C2/C4)** — C2 nối notification level-up + badge award thật (GamificationService + CompleteLesson, sau commit, lỗi không phá request); C1 lazy-cleanup order hết hạn + nhãn "Môi trường mô phỏng" checkout; C4 "Xuất ảnh PNG" algo-playground + sample host page (`docs/host/sample-host.html`). Backend 781 (+6), frontend 3504. C3 (verify embed thật) chờ browser/LMS. |
| 2026-08-13 | **Phase D (D1/D3/D4)** — D4 analytics học tập: `GET /admin/analytics/learning` (per-lesson + overall + tương quan "xem viz → pass quiz") + tab "Học tập" Admin Panel (card + biểu đồ + bảng) — bằng chứng hiệu quả cho luận văn; D1 nhãn Demo (XP +50, checkout); D3 `docs/components.md`. Backend 783 (+2), frontend 3504. D2 i18n deferred (scope lớn, giá trị thấp). **Toàn bộ roadmap A→D hoàn tất (trừ C3 verify thật + D2).** |
