# 🏫 Báo Cáo Xác Thực — 10. Classrooms

> **Mục đích báo cáo:** Cung cấp bằng chứng để bạn đọc và xác thực lại luồng lớp học + notification mới (C2).
> **Ngày báo cáo:** 2026-08-14 · **Điểm giá trị thực tế hiện tại:** 8/10 🟢 Thực dụng

---

## 1. 🎯 Mục đích (theo tài liệu gốc)

Giáo viên tạo lớp, mời học viên (invite code), gom quiz/codelab/lesson thành curriculum, theo dõi tiến độ, kick/ban; học viên học theo lớp với sidebar tiến độ.

## 2. 📌 Những gì được triển khai (bằng chứng code)

| Thành phần | Vị trí | Trạng thái |
| :-- | :-- | :-- |
| Vòng đời lớp: create/join (invite code hết hạn 30 ngày)/leave/kick/ban/archive | `backend/src/Application/Features/Classrooms/Commands/*` (~15 handler) | ✅ |
| Curriculum: module/item CRUD + reorder atomic (RowVersion) + override + import course | `ClassroomCurriculumController.cs` + handlers | ✅ |
| UnlockRuleEngine (prerequisite/sequential/hidden) | Application layer | ✅ |
| **C2: notification "bài mới"** — CreateClassroomModuleItem notify học viên ACTIVE (bỏ item ẩn + học viên bị kick) | `CreateClassroomModuleItemCommandHandler.cs` | ✅ NEW |
| **C2: notification "deadline lớp"** — DeadlineReminderService (BackgroundService, quét mỗi giờ: item DueAt trong 24h tới chưa hoàn thành → nhắc, dedupe ngày) | `backend/src/Infrastructure/Services/DeadlineReminderService.cs` + đăng ký `Program.cs` | ✅ NEW |
| FE: MyClassrooms / ClassroomStudy / sidebar curriculum | `frontend/src/views/classroom/*` + `features/classroom/*` | ✅ |
| Teacher analytics lớp | `TeacherClassroomAnalytics.vue` | ✅ |

## 3. 🧪 Bằng chứng test

- Backend: **~20 test files** classrooms (CreateClassroom, Join, Kick, Leave, Archive, Reorder x2, Import, GetStudent/TeacherClassrooms, Curriculum, Override, IntegrityReport...)
- **C2 mới:** `CreateClassroomModuleItemCommandHandlerTests` +2 (notify active + skip kicked; không notify khi item ẩn) + `DeadlineReminderServiceTests` +3 (deadline 24h notify incomplete skip completed; ngoài 24h không notify; dedupe 2 lần 1 notify)
- Frontend: `classroom/__tests__/*` (4 files)
- Tổng suite: Backend **788/788**, Frontend **3512/3512**, vue-tsc 0

## 4. 🖥️ Các bước xác thực thủ công

| # | Bước | Kỳ vọng |
| :-- | :-- | :-- |
| 1 | Teacher tạo lớp → lấy invite code | Lớp xuất hiện, code hợp lệ |
| 2 | Student nhập code join | Vào lớp, thấy curriculum |
| 3 | Teacher thêm 1 bài mới vào lớp | Student nhận notification "📚 Bài mới..." (bell) — C2 |
| 4 | Teacher đặt DueAt cho item trong 24h tới | Trong vòng 1 giờ (chu kỳ quét), student chưa hoàn thành nhận nhắc deadline |
| 5 | Teacher kéo thả reorder 2 item | Thứ tự lưu đúng sau reload |
| 6 | Teacher kick 1 student | Student bị đá, không còn vào lớp |
| 7 | Student hoàn thành bài trong lớp | Sidebar tiến độ cập nhật ngay |

## 5. 🚧 Giới hạn còn lại (thừa nhận trong hồ sơ)

- Deadline có field `DueAt` + nhắc nhở nhưng **chưa chặn nộp/ghi nhận trễ sau hạn**.
- Chưa có bảng điểm tổng hợp theo học viên + export điểm lớp.
- Analytics chưa kéo theo hành động (danh sách học viên trễ — 1 click lọc).

## 6. ⚠️ Lưu ý xác thực đặc biệt

- **DeadlineReminderService chạy nền** — test qua reflection gọi `RemindDeadlinesAsync` trực tiếp; trên server thật service tự chạy mỗi giờ sau khi app start. Để xác thực nhanh: đặt DueAt trong 24h tới, chờ ≤1h hoặc khởi động lại app.
- **Học viên bị kick không nhận notification** — thiết kế đúng (chỉ Active).

---

*Báo cáo dựa trên: `plan/review/features/classrooms.md`, `DeadlineReminderService.cs`, `CreateClassroomModuleItemCommandHandler.cs`, classroom tests. Xác thực xong → đánh dấu ngày + ký tên.*
