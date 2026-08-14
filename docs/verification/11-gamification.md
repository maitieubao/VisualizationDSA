# Báo Cáo Xác Thực — 11. Gamification (XP / Streak / Badge / Leaderboard)

> **Mục đích báo cáo:** Cung cấp bằng chứng để bạn đọc và xác thực lại hệ động lực học tập — đặc biệt nguồn XP thật (A2/A3) + notification level-up/badge (C2).
> **Ngày báo cáo:** 2026-08-14 · **Điểm giá trị thực tế hiện tại:** 8/10 — Mức: Thực dụng (tăng từ 7/10)

---

## 1. Mục đích (theo tài liệu gốc)

Biến tiến trình học thành trải nghiệm có phản hồi liên tục: XP từ hoạt động thật, streak giữ động lực, badge mở khóa, leaderboard cạnh tranh — **tất cả chống gian lận** (server là source of truth).

## 2. Những gì được triển khai (bằng chứng code)

| Thành phần | Vị trí | Trạng thái |
| :-- | :-- | :-- |
| XP server-side: idempotency (user+ngày+key), cap 500 XP/ngày, rate limit, không tin client | `backend/src/Infrastructure/Services/GamificationService.cs` (XpGrantLedger) | [X] |
| **A2/A3: nguồn XP THẬT từ học bài** — CompleteLesson cấp XP mỗi bài (40 bài seed), E2E verify idempotent | `LessonController.CompleteLesson` | [X] MOI |
| Badge: 1 nguồn id, criteria thật, unique (UserId, BadgeId) chặn race | `GamificationService.CheckAndAwardBadgesAsync` | [X] |
| **C2: notification level-up + badge award** — gọi `NotifyLevelUpAsync`/`NotifyBadgeAwardedAsync` SAU commit (lỗi không phá request) | `GamificationService.NotifyLevelUpAndBadgesAsync` + `CompleteLesson` | [X] MOI |
| Streak server source of truth (timezone-safe, freeze 1 ngày) | `StreakCalculator` + User entity | [X] |
| Leaderboard realtime (broker publish sau commit + hub authorize) | `LeaderboardBroadcastBroker` + `LeaderboardHub` | [X] |
| FE: Workspace gamification (XP/streak/badge cabinet/confetti) | `frontend/src/features/gamification-engine/*` | [X] |
| Nút "+50 XP (Demo)" — chỉ Teacher/Admin + nhãn Demo + title giải thích (D1) | `GamificationWorkspace.vue` | [X] MOI |

## 3. Bằng chứng test

- `backend/tests/.../GamificationServiceTests.cs` — **14 test** (gồm **4 test C2 mới**: level-up notify, không level không notify, badge notify, notification lỗi không phá request)
- `backend/tests/.../StatelessGamificationControllerTests.cs` + Leaderboard tests
- E2E: `LessonE2EFlowTests` — complete bài → XP + progress; lần 2 không cộng (idempotent)
- FE: `gamification-engine/__tests__/*` (9 files)
- Tổng suite: Backend **788/788**, Frontend **3512/3512**, vue-tsc 0

## 4. Các bước xác thực thủ công

| # | Bước | Kỳ vọng |
| :-- | :-- | :-- |
| 1 | Đăng nhập student → hoàn thành 1 bài học | XP tăng đúng `lesson.XPReward`; toast level-up nếu đủ XP đổi level (C2) |
| 2 | Gửi lại request complete lần 2 (hoặc bấm lại) | XP KHÔNG cộng lần 2 (idempotent) |
| 3 | Hoàn thành đủ 4 thuật toán sắp xếp | Badge "Sorting Wizard" mở khóa + notification badge (C2) |
| 4 | Vào `/gamification` | XP/streak/badge cabinet hiển thị đúng dữ liệu thật |
| 5 | Teacher vào gamification | Nút "+50 XP (Demo)" hiện (chỉ Teacher/Admin); Student không thấy |
| 6 | (Bảo mật) Gửi API award-xp 10 lần cùng idempotency key | Chỉ cộng 1 lần |

## 5. Giới hạn còn lại (thừa nhận trong hồ sơ)

- Leaderboard chưa có user thật cạnh tranh (demo 1-2 user).
- Nút "+50 XP Demo" còn sống (đã dán nhãn Demo + title giải thích) — còn phần ẩn ở production build.
- Chưa có notification preference / email digest / grouping.

## 6. [Luu y] Xác thực đặc biệt

- **Bug 1 (đã fix trong review):** trước đây `CompleteLesson` gọi NotifyLevelUpAsync TRƯỚC SaveChanges (toast giả nếu commit fail + trùng khi retry) — đã chuyển vào SAU commit thành công. Kiểm tra: hoàn thành bài cấp XP → chỉ 1 toast, không trùng.
- **XP không farm:** điểm mấu chốt để luận văn — cap 500 XP/ngày + idempotency.

---

*Báo cáo dựa trên: `plan/review/features/gamification.md`, `GamificationService.cs`, `LessonController.CompleteLesson`, `GamificationServiceTests.cs`. Xác thực xong → đánh dấu ngày + ký tên.*
