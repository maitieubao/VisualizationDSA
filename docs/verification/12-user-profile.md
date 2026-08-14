# 👤 Báo Cáo Xác Thực — 12. User Profile

> **Mục đích báo cáo:** Cung cấp bằng chứng để bạn đọc và xác thực lại trang hồ sơ người dùng.
> **Ngày báo cáo:** 2026-08-14 · **Điểm giá trị thực tế hiện tại:** 8/10 🟢 Thực dụng (giữ nguyên — không thay đổi trong Phase A→D)

---

## 1. 🎯 Mục đích (theo tài liệu gốc)

Người dùng xem/cập nhật thông tin cá nhân (nickname, bio, trường), tiến trình XP/streak, tủ badges, lịch sử học tập, tùy chọn (preferences), bảo mật (đổi mật khẩu) — dữ liệu thật từ server.

## 2. 📌 Những gì được triển khai (bằng chứng code)

| Thành phần | Vị trí | Trạng thái |
| :-- | :-- | :-- |
| ProfileView + 6 tab (General, Progress, History, Preferences, Security, About) | `frontend/src/views/profile/ProfileView.vue` + tabs | ✅ |
| UpdateProfile persist (username/nickname/bio/university/avatar) | backend `UsersController` + `User.UpdateProfile` | ✅ |
| Tiến trình XP + tủ badges dữ liệu thật | `ProfileProgressTab.vue` | ✅ |
| Lịch sử học (bank quiz attempt...) | `ProfileHistoryTab.vue` | ✅ |
| Preferences (tùy chọn học) | `ProfilePreferencesTab.vue` | ✅ |
| Đổi mật khẩu + bảo mật | `ProfileSecurityTab.vue` | ✅ |
| Route `/profile` | `frontend/src/router/routes.ts` | ✅ |

## 3. 🧪 Bằng chứng test

- Backend: User profile tests (trong `Services/*` + AdminControllerTests user CRUD)
- Frontend: `profile/__tests__/*` (3 files)
- Review Round 18: **37/37 lỗi PR-001→037 đã fix**
- Tổng suite: Backend **788/788**, Frontend **3512/3512**, vue-tsc 0

## 4. 🖥️ Các bước xác thực thủ công

| # | Bước | Kỳ vọng |
| :-- | :-- | :-- |
| 1 | Đăng nhập → `/profile` | Thông tin cá nhân hiển thị đúng |
| 2 | Sửa nickname + bio + trường → lưu | Lưu thật; reload vẫn giữ |
| 3 | Tab Progress | XP/level/streak khớp dữ liệu server |
| 4 | Tab Badges (trong Progress) | Badge đã mở hiện sáng, chưa mở mờ — đúng dữ liệu |
| 5 | Tab History | Lịch sử học/quiz hiển thị |
| 6 | Tab Security → đổi mật khẩu | Đổi được, đăng nhập lại với mật khẩu mới OK |

## 5. 🚧 Giới hạn còn lại (thừa nhận trong hồ sơ)

- Chưa có chứng chỉ hoàn thành khóa học trên Profile.
- Lịch sử phụ thuộc dữ liệu học thật — trống nếu user chưa học.

## 6. ⚠️ Lưu ý xác thực đặc biệt

- **Avatar upload** nằm trong UpdateProfile — kiểm tra upload ảnh + hiển thị lại sau reload.

---

*Báo cáo dựa trên: `plan/review/features/user-profile.md`, `ProfileView.vue` + tabs. Xác thực xong → đánh dấu ngày + ký tên.*
