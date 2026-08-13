# 🔔 Notifications — Hồ Sơ Thực Trạng & Định Hướng

## 🎯 Mục đích

- **Vấn đề người dùng:** Học sinh/giao viên cần được báo ngay khi có việc quan trọng liên quan đến họ — ai đó trả lời bình luận, mở khóa huy hiệu, lên cấp, admin gửi thông báo; không phải tự F5 hay vào từng trang để dò.
- **Tuyên bố giá trị:** Một kênh thông báo thời gian thực duy nhất (bell trên AppHeader) gom mọi sự kiện quan trọng, đọc/quản lý nhanh, hoạt động bền bỉ cả khi token hết hạn hay mất kết nối.

## 📌 Thực trạng hiện tại

- Trạng thái kỹ thuật: ✅ DoD — Review Round 21 (NT-001→029; **29/29 lỗi đã fix**), backend 754/754 + frontend 3423/3423 pass, `vue-tsc -b` 0 lỗi.
- Đang hoạt động thật:
  - **URL đúng `/api/v1/notifications`** — hết 404 toàn bộ 3 endpoint (NT-001).
  - **Realtime thật:** `INotificationService` DI + `NotificationBroadcastBroker` + hub push `Clients.User`; comment reply tạo notification qua service (NT-002); hub hết spoof — không còn method client-invokable (NT-003).
  - FE: **connect sau login + polling 60s backup**, handlers BadgeAwarded/LevelUp/NewNotification prepend + toast + dedupe theo id (NT-002/009/025).
  - **401 auto-refresh + retry**, reset khi refresh fail (NT-008); unread-count endpoint + `totalUnread` — badge đúng cả khi >100 (NT-011); mark-all `ExecuteUpdate` atomic (NT-010); store reset khi đổi user (NT-004); bell a11y đầy đủ (NT-005/013/014).
- Giới hạn hiện tại:
  - **Rất ít nguồn kích hoạt thật:** level-up chưa nối — TODO Round 21 còn mở (`NotifyLevelUp`/`NotifyBadgeAwarded` chưa được gọi tại `GamificationService`/`UsersController`, call sites ngoài scope); badge award mới chỉ có handler FE nhưng backend chưa gọi tới.
  - **Chỉ comment reply là nguồn thường xuyên** (thêm NotifyAdmins cho admin) — với học sinh chỉ học một mình, gần như không nhận được gì ngoài demo.
  - Chưa có nguồn gắn lớp học/bài học (deadline, bài mới, điểm) — mảng thông báo giá trị nhất với LMS chưa tồn tại.

## ⭐ Đánh giá giá trị thực tế: 5/10 (🔴 Hạ tầng chờ)

- **Điểm thật:** Hạ tầng là hàng tốt — realtime + polling backup, chống spoof, IDOR chặn, 401 retry, unread-count đúng, bell a11y, test backend 34 + FE 25; đủ sức gánh mọi nguồn notification tương lai.
- **Điểm "ảo" (code xanh nhưng chưa thực dụng):**
  - Bell/test xanh nhưng **user thật gần như không nhận được thông báo nào** — nguồn trigger thực tế chỉ có comment reply; level-up/badge (2 sự kiện học sinh chờ nhất) chưa được nối.
  - Các handler BadgeAwarded/LevelUp bên FE "xanh" nhưng là code chết 1 đầu — không có backend nào gọi tới.
  - Toàn bộ giá trị "thông báo = kéo user quay lại học" chưa diễn ra vì thiếu nguồn sự kiện học tập.

## 🚧 Điều cần làm để có giá trị thực tế (checklist ưu tiên)

- [x] **Nối level-up + badge award** (TODO Round 21 — C2 ✅ 2026-08-13) — acceptance: tại nơi cấp XP/check badge (`GamificationService`/`UsersController`) gọi `NotifyLevelUp`/`NotifyBadgeAwarded`; học sinh level up/mở badge nhận Notification mới + hub push realtime + toast (TC-NT-002); handler FE không còn dead.
- [ ] **Thêm nguồn thật gắn lớp học/bài học** — acceptance: ít nhất 2 nguồn: (1) deadline/giáo viên gửi thông báo lớp học (`ClassroomGradingService`/`ClassroomProgressController`), (2) bài học mới trong lớp được publish; mỗi sự kiện tạo Notification đúng user, không spam.
- [ ] **Verify luồng admin → học sinh** — acceptance: NotifyAdmins (đã có batch) hiển thị đúng ở bell học sinh; admin theo dõi được trạng thái gửi.
- [ ] **Thống kê nguồn kích hoạt thực tế** — acceptance: sau khi nối, đo 1 tuần sử dụng thật có ≥3 nguồn tự động tạo thông báo cho học sinh trung bình/tuần (không tính demo).

## 🧭 Hướng phát triển tiếp theo

- **Cài đặt loại thông báo** — lý do nghiệp vụ: user không muốn nhận mọi loại (US: "tôi chỉ muốn báo khi ai đó reply, không cần báo streak"); kỹ thuật: bảng preference theo loại notification (gio trước `dsa_preferences`), filter server-side khi tạo/đẩy.
- **Email digest** — lý do nghiệp vụ: user rời app vẫn nắm được việc quan trọng; kỹ thuật: job gom notification chưa đọc gửi email tổng hợp hằng ngày/tuần, link quay lại app.
- **Grouping** — lý do nghiệp vụ: lớp đông comment/điểm dễ spam bell (US: "gộp 12 lượt reply cùng bài thành 1 dòng"); kỹ thuật: nhóm theo entity (lesson/quiz/classroom), mở rộng thì xem chi tiết.

## 🧪 User Stories & Test Cases (tham chiếu)

- File manual: `plan/testing/manual/Notifications.md`
- US then chốt: **US-NT-001** (nhận thông báo mới trong thời gian thực), **US-NT-002** (đọc và quản lý thông báo), **US-NT-003** (hoạt động bền bỉ khi token hết hạn)
- TC then chốt: **TC-NT-001** (bell + URL đúng — regression NT-001), **TC-NT-002** (realtime → bell + toast, không trùng lặp — regression NT-002/009/025), **TC-NT-004** (mark-all về 0 — regression NT-010/023), **TC-NT-005** (unread >100 badge đúng — regression NT-011), **TC-NT-006** (401 auto-refresh retry — regression NT-008/022), **TC-NT-007** (đổi user không lẫn tài khoản — regression NT-004)
