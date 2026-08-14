# Báo Cáo Xác Thực — 15. Notifications

> **Mục đích báo cáo:** Cung cấp bằng chứng để bạn đọc và xác thực lại kênh thông báo — tính năng tăng điểm nhiều nhất nhờ C2 (4 nguồn thật).
> **Ngày báo cáo:** 2026-08-14 - **Điểm giá trị thực tế hiện tại:** 8/10 — Mức: Thực dụng (tăng từ 5/10 — hết "bell rỗng")

---

## 1. Mục đích (theo tài liệu gốc)

Học sinh/giáo viên được báo ngay khi có việc quan trọng: ai đó trả lời bình luận, mở khóa badge, lên cấp, bài mới trong lớp, deadline sắp hết — một kênh bell duy nhất, realtime + polling backup, hoạt động bền khi token hết hạn.

## 2. Những gì được triển khai (bằng chứng code)

| Thành phần | Vị trí | Trạng thái |
| :-- | :-- | :-- |
| NotificationService (tạo + push realtime broker + hub `Clients.User`, chống spoof) | `backend/src/Infrastructure/Services/NotificationService.cs` + `NotificationHub.cs` | [X] |
| **Nguồn 1: comment reply** (có sẵn) | `LessonController.CreateLessonComment` -> NotifyUserAsync parent | [X] |
| **Nguồn 2: level-up** — `GamificationService.AwardXpAndCheckBadgesAsync` + `LessonController.CompleteLesson` gọi `NotifyLevelUpAsync` SAU commit (lỗi không phá request) | `GamificationService.NotifyLevelUpAndBadgesAsync` + `CompleteLesson` | [X] MOI |
| **Nguồn 3: badge award** — `NotifyBadgeAwardedAsync` cho từng badge mới | `GamificationService` | [X] MOI |
| **Nguồn 4: bài mới trong lớp** — CreateClassroomModuleItem notify học viên ACTIVE (bỏ item ẩn + bị kick) | `CreateClassroomModuleItemCommandHandler.cs` | [X] MOI |
| **Nguồn 5: deadline lớp** — DeadlineReminderService (BackgroundService mỗi giờ, DueAt trong 24h chưa hoàn thành -> nhắc, dedupe ngày) | `backend/src/Infrastructure/Services/DeadlineReminderService.cs` | [X] MOI |
| FE: connect sau login + polling 60s backup, toast + bell + dedupe, 401 auto-refresh, unread-count đúng >100, a11y | `frontend/src/features/notifications/*` | [X] |

## 3. Bằng chứng test

- Backend: `NotificationServiceTests` + **C2 mới** — `GamificationServiceTests` +4 (level-up notify, không level không notify, badge notify, notification lỗi không phá request); `CreateClassroomModuleItemCommandHandlerTests` +2; `DeadlineReminderServiceTests` +3
- Frontend: `notifications/__tests__/*` (3 files)
- Review Round 21: **29/29 lỗi NT-001->029 đã fix**
- Tổng suite: Backend **788/788**, Frontend **3512/3512**, vue-tsc 0

## 4. Các bước xác thực thủ công

| # | Bước | Kỳ vọng |
| :-- | :-- | :-- |
| 1 | Student bình luận 1 bài -> teacher/student khác reply | Người bị reply nhận notification (bell + toast realtime) |
| 2 | Student hoàn thành bài đủ XP đổi level | Toast level-up + bell (C2) |
| 3 | Student đạt đủ điều kiện badge | Toast badge + bell (C2) |
| 4 | Teacher thêm bài mới vào lớp | Học viên active nhận "Bài mới..." |
| 5 | Teacher đặt DueAt trong 24h -> chờ 1 chu kỳ quét (hoặc restart app) | Học viên chưa hoàn thành nhận nhắc deadline |
| 6 | Mở bell -> đánh dấu đã đọc (1 cái + tất cả) | Unread-count giảm đúng |
| 7 | Xóa access token, giữ refresh -> thao tác | 401 -> auto-refresh -> vẫn nhận realtime |

## 5. Giới hạn còn lại (thừa nhận trong hồ sơ)

- Chưa có nguồn "giáo viên gửi thông báo lớp" thủ công.
- Chưa verify thống kê nguồn trên dữ liệu user thật (chỉ test + seed).
- Chưa có preference theo loại / email digest / grouping.

## 6. [Luu y] Xác thực đặc biệt

- **DeadlineReminderService chạy nền mỗi giờ** — để xác thực nhanh trên dev: khởi động lại backend sau khi đặt DueAt, hoặc gọi test trực tiếp.
- **Dedupe:** cùng 1 student + 1 item + 1 ngày chỉ nhận 1 lần nhắc — không spam.

---

*Báo cáo dựa trên: `plan/review/features/notifications.md`, `NotificationService.cs`, `GamificationService.cs`, `DeadlineReminderService.cs`, `CreateClassroomModuleItemCommandHandler.cs`. Xác thực xong -> đánh dấu ngày + ký tên.*
