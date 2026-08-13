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

### A2 — Biên soạn 2 khóa mẫu hoàn chỉnh
**Mục tiêu:** 2 khóa học chạy từ đầu đến cuối bằng chính authoring tool — bằng chứng release/demo.

| # | Công việc | Acceptance |
| :-- | :-- | :-- |
| A2.1 | Khóa "Sorting 101": 5-6 bài (bubble/selection/quick/merge/heap) mỗi bài đủ 4 bước + quiz + codelab | Học viên mới hoàn thành trọn khóa, XP/badge/streak đủ |
| A2.2 | Khóa "Đồ thị & Tìm kiếm": BFS/DFS/Dijkstra | Tương tự |
| A2.3 | Nội dung lý thuyết học thuật chuẩn (đối chiếu DC-C batch đã sửa) | Không tái phát lỗi kiến thức |

### A3 — Đóng vòng E2E
| # | Công việc | Acceptance |
| :-- | :-- | :-- |
| A3.1 | Chạy manual test (plan/testing) xuyên khóa mẫu | 0 chặn release |
| A3.2 | Cập nhật hồ sơ review: courses-lessons 7→9/10, lesson-study 8→9/10, gamification có dữ liệu thật | Điểm cập nhật trong `plan/review/` |

---

## 🐞 PHASE B — Code Debugger nâng cấp (⏳ CHỜ — sau A)

> CV hiện 8.5/10 — stepper tốt nhưng thiếu UX debugger chuẩn.

- B1: Breakpoint (click gutter) + stop at line
- B2: Watch panel (theo dõi biến tuỳ chọn)
- B3: Instrument closure + template đơn giản; var loop tracking dứt điểm
- B4: Gắn nhãn đúng bản chất "Trình chạy từng bước pseudocode" + lưu/lấy session code (nối Profile/Export)

---

## 🔌 PHASE C — Nối các tích hợp thật (⏳ CHỜ)

> Đưa 3 tính năng Demo-grade/Hạ tầng chờ lên mức thực dụng.

- C1: **Payment** 4→8/10 — nối SePay sandbox thật (sandbox account + webhook test thật) hoặc gắn nhãn "Mô phỏng" rõ ràng; cleanup order hết hạn
- C2: **Notifications** 5→8/10 — nối level-up + badge award (đã có hạ tầng), thêm nguồn thật: deadline lớp, bài mới, trả lời comment
- C3: **Embed** 3→7/10 — test nhúng vào 1 LMS thật (hoặc trang host demo) + verify auto-height cross-origin + tài liệu host
- C4: **Export/Share** 6→7/10 — quyết định chiến lược: share ảnh chất lượng cao cho báo cáo vs workspace tương tác

---

## ✨ PHASE D — Hoàn thiện sản phẩm (⏳ CHỜ)

- D1: Gắn nhãn "Mô phỏng/Demo" cho các luồng chưa nối thật (thanh toán)
- D2: i18n sẵn sàng (tách chuỗi tiếng Việt)
- D3: Component library docs (Storybook/Histoire) cho Core UI
- D4: Analytics học tập (thời gian xem viz, tỷ lệ hoàn thành quiz sau khi xem) — chứng minh hiệu quả

---

## 📈 Tiến độ tổng

| Phase | Trạng thái | Ghi chú |
| :-- | :-- | :-- |
| A — Content Pipeline | 🟢 ĐANG LÀM (A1 ✅ → A2 kế tiếp) | A1 xong 2026-08-11 |
| B — Code Debugger | ⏳ | Sau A (A1.5 xong) |
| C — Tích hợp thật | ⏳ | Sau B |
| D — Hoàn thiện | ⏳ | Sau C |

## 🗓️ Lịch sử
| Ngày | Nội dung |
| :-- | :-- |
| 2026-08-11 | Khởi tạo roadmap; chọn Phase A (Content Pipeline) làm ưu tiên #1 dựa trên đánh giá thực trạng; bắt đầu A1 |
