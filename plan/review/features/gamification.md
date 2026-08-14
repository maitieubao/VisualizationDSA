# 🏆 Gamification — Hồ Sơ Thực Trạng & Định Hướng

## 🎯 Mục đích

- **Vấn đề người dùng:** Học sinh cần động lực duy trì thói quen học — XP, streak, huy hiệu và bảng xếp hạng tuần là phần thưởng cho hoạt động học thật (hoàn thành lesson/quiz/checkpoint); giáo viên cần công cụ khen thưởng và theo dõi tinh thần lớp.
- **Tuyên bố giá trị:** Biến tiến trình học thành trải nghiệm có phản hồi liên tục (XP + streak + badge + leaderboard), kích thích học lặp lại; toàn bộ số liệu phải là dữ liệu thật của user, không phải demo.

## 📌 Thực trạng hiện tại

- Trạng thái kỹ thuật: ✅ DoD — Review Round 17 (GM-001→046; **46/46 lỗi đã fix**), backend 708/708 + frontend 3269/3269 pass, `vue-tsc -b` 0 lỗi.
- Đang hoạt động thật:
  - **XP chống farm:** Idempotency-Key + cap 500 XP/ngày + rate limit cả 2 endpoint; award XP + badge trong 1 transaction, ledger replay (GM-001/004/005).
  - **Badge 1 nguồn id backend (8 badge)** — tủ huy hiệu hiển thị đúng id/tên/điều kiện mở khóa, có tooltip (GM-009/025).
  - **Streak server là source of truth** — `lastActiveDate` thật từ DB, đổi timezone không lệch, freeze đúng 1 ngày (GM-008/014/029/018).
  - **Leaderboard real-time thật:** Broker publish sau commit + hub `[Authorize]`, hết mock 10 tên giả, highlight theo `userId`, reload ngay sau award (GM-006/010/020/021).
  - Nút "+50 XP" chỉ hiển thị với Teacher/Admin (GM-024); confetti tôn trọng reduced-motion, store reset khi đổi user.
- Giới hạn hiện tại:
  - **Leaderboard chỉ có dữ liệu khi có user thật hoạt động** — hiện chủ yếu là môi trường demo, bảng xếp hạng gần như trống/ít người, trải nghiệm "cạnh tranh" gần như không diễn ra.
  - **Nút "+50 XP Demo" vẫn tồn tại** (chỉ ẩn với Student) — Teacher vẫn có thể bơm XP thủ công vào sản phẩm chính (đã thêm nhãn "(Demo)" + title giải thích — D1).

## ⭐ Đánh giá giá trị thực tế: 8/10 (🟢 Thực dụng — nguồn XP thật đã có nội dung)

- **Điểm thật:** Hạ tầng đúng hướng — XP/badge/streak/leaderboard đều nguồn dữ liệu thật, chống gian lận, có test contract 2 đầu + TZ matrix; freeze/confetti/reduced-motion hoàn chỉnh.
- **Nâng cấp (A2/A3/C2, 2026-08-13):** nguồn XP thật giờ có nội dung — học viên đi hết 40 lesson seed (3 lộ trình published) nhận XP mỗi bài qua CompleteLesson; badge "Sorting Wizard" (4 thuật toán sắp xếp) trở nên chạm được vì 5 codelab sorting thật đã seed + judge backend. E2E xác nhận complete bài → XP + progress. **Notification level-up + badge đã nối (C2):** `GamificationService` + `CompleteLesson` gọi `NotifyLevelUpAsync`/`NotifyBadgeAwardedAsync` sau commit — học sinh level up/mở badge nhận toast + bell realtime.
- **Điểm trừ còn lại:**
  - Leaderboard xanh test nhưng **chưa có user thật cạnh tranh** — bảng xếp hạng sống về mặt kỹ thuật, chết về mặt dữ liệu (demo chỉ 1-2 user).
  - Nút "+50 XP Demo" còn sống trong UI Teacher (đã dán nhãn Demo + title giải thích) — bản chất là tính năng trình diễn, không phải luồng học thật.

## 🚧 Điều cần làm để có giá trị thực tế (checklist ưu tiên)

- [x] **Nối thông báo level-up + badge award** (TODO Round 21 — **C2 ✅ 2026-08-13**) — `GamificationService.AwardXpAndCheckBadgesAsync` + `LessonController.CompleteLesson` gọi `NotifyLevelUp`/`NotifyBadgeAwarded` sau commit (lỗi notification không phá request); học sinh level up/mở badge nhận Notification mới + hub push realtime + toast (TC-NT-002).
- [ ] **Xóa/ẩn chức năng demo khi production** — acceptance: nút "+50 XP Demo" không xuất hiện ở production build (hoặc chỉ trong môi trường demo/dev); Teacher không còn bơm XP thủ công qua UI; XP chỉ đến từ hoạt động học thật. *(D1 đã dán nhãn "(Demo)" + title giải thích — còn phần ẩn ở production build.)*
- [x] **Xây dữ liệu khởi tạo (seed)** — **2026-08-13:** seed đã có user demo (SeedLeaderboardUsersAsync) + 40 lesson/3 lộ trình published cho XP thật; leaderboard có dữ liệu trình diễn.
- [x] **Bổ sung nguồn XP thật** — **2026-08-13 (A2/A3):** CompleteLesson cấp XP mỗi bài (40 bài seed, 5 bài có codelab judge thật) — XP/leaderboard động từ luồng học, không cần demo.

## 🧭 Hướng phát triển tiếp theo

- **Challenge/event tuần** — lý do nghiệp vụ: tạo mục tiêu ngắn hạn (US: "tuần này hoàn thành 3 lesson để nhận huy hiệu đặc biệt"), tái sử dụng engine award hiện có; kỹ thuật: bảng challenge theo tuần + badge event, đẩy qua Notification đã nối.
- **Streak protection gắn bài học** — lý do nghiệp vụ: người học giữ streak thật khi học liên tục, không phải chỉ "điểm danh" (US: "nghỉ 1 ngày không mất streak nếu đã hoàn thành đủ lesson trong tuần"); kỹ thuật: mở rộng `StreakCalculator` với rule grace dựa trên hoạt động học, giữ server source of truth.
- **Huy hiệu sưu tầm theo chủ đề** — lý do nghiệp vụ: bộ sưu tập theo chủ đề (sorting, graph, hệ thống thiết kế) khuyến khích học trọn module; kỹ thuật: nhóm badge theo chủ đề, thêm badge series + tủ trưng bày theo bộ.

## 🧪 User Stories & Test Cases (tham chiếu)

- File manual: `plan/testing/manual/Gamification.md`
- US then chốt: **US-GM-001** (kiếm XP qua hoạt động học tập), **US-GM-002** (theo dõi streak ngày học), **US-GM-004** (xem bảng xếp hạng tuần và vị trí của mình)
- TC then chốt: **TC-GM-001** (XP không farm được — regression GM-001/004/005), **TC-GM-003** (badge mở khóa → tủ đúng id — regression GM-009/007), **TC-GM-004** (streak server source of truth — regression GM-008/014/029), **TC-GM-005** (leaderboard dữ liệu thật + highlight user — regression GM-010/020), **TC-GM-007** (nút "+50 XP" chỉ Teacher/Admin — regression GM-024), **TC-GM-009** (freeze đúng 1 ngày — regression GM-018/023)
