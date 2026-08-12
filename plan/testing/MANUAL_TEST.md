# 🧪 HƯỚNG DẪN MANUAL TEST TRÊN TRÌNH DUYỆT — VisualizationDSA

> File tổng hợp — mỗi tính năng có 1 file markdown riêng chứa **User Stories + Test Cases chi tiết**.
> Chiến dịch Review & Fix **16/16 tính năng đã hoàn tất** (22 round, ~730 lỗi xử lý, 3474 frontend + 754 backend test tự động xanh). Bộ manual test này dùng để **smoke/acceptance E2E trên trình duyệt** trước khi release.

---

## 📁 Danh mục File Test Theo Tính Năng

| # | Tính năng | File | Số US | Số TC |
| :-- | :-- | :-- | :--: | :--: |
| 1 | Auth (đăng nhập/đăng ký/phiên/impersonate) | [manual/Auth.md](manual/Auth.md) | 6 | 14 |
| 2 | Payment / Checkout Premium | [manual/Payment.md](manual/Payment.md) | 4 | 14 |
| 3 | Admin Panel | [manual/Admin.md](manual/Admin.md) | 5 | 14 |
| 4 | HTML Playground | [manual/HTMLPlayground.md](manual/HTMLPlayground.md) | 4 | 12 |
| 5 | Algo Playground + Custom Input | [manual/AlgoPlayground.md](manual/AlgoPlayground.md) | 4 | 12 |
| 6 | Sorting Visualizer (7 engine) | [manual/SortingVisualizer.md](manual/SortingVisualizer.md) | 5 | 14 |
| 7 | Courses & Lessons (LMS) | [manual/CoursesLessons.md](manual/CoursesLessons.md) | 4 | 12 |
| 8 | Lesson Study / Course Modules | [manual/LessonStudy.md](manual/LessonStudy.md) | 4 | 12 |
| 9 | Teacher Panel | [manual/TeacherPanel.md](manual/TeacherPanel.md) | 5 | 14 |
| 10 | Classrooms | [manual/Classrooms.md](manual/Classrooms.md) | 4 | 13 |
| 11 | Gamification (XP/streak/badge/leaderboard) | [manual/Gamification.md](manual/Gamification.md) | 6 | 12 |
| 12 | User Profile | [manual/UserProfile.md](manual/UserProfile.md) | 5 | 13 |
| 13 | Embed Widget | [manual/EmbedWidget.md](manual/EmbedWidget.md) | 5 | 12 |
| 14 | Export & Share (PNG/SVG/QR/link /s/) | [manual/ExportShare.md](manual/ExportShare.md) | 4 | 13 |
| 15 | Notifications | [manual/Notifications.md](manual/Notifications.md) | 5 | 12 |
| 16 | Core & UI Components | [manual/CoreUI.md](manual/CoreUI.md) | 6 | 12 |

**Tổng cộng:** 16 file · 76 User Stories · 205 Test Cases.

---

## ⚙️ Chuẩn Bị Môi Trường Trước Khi Test

### 1. Chạy Backend (ASP.NET Core net10.0)

```bash
cd backend
# Bắt buộc: đặt JWT key qua env (dev không có key sẽ tự sinh + log warning)
$env:Jwt__Key = "your-256-bit-secret-key-for-local-dev"   # PowerShell
dotnet run --project src/WebApi/WebApi.csproj
```

- Backend mặc định chạy tại `http://localhost:5055`.
- Lần đầu chạy: migration + seeder tự động (tạo tài khoản demo).

### 2. Chạy Frontend (Vue 3 + Vite)

```bash
cd frontend
npm install
npm run dev
```

- Frontend chạy tại `http://localhost:5173`.

### 3. Tài Khoản Demo (từ seeder — kiểm tra `DbSeeder` nếu cần)

| Vai trò | Gợi ý đăng nhập |
| :-- | :-- |
| Student | `demo@visualizationdsa.dev` / `Demo@2024` |
| Teacher | tài khoản seeder có role Teacher (kiểm tra DbSeeder) |
| Admin | tài khoản seeder có role Admin |

> Nếu chưa có tài khoản: tạo qua trang Register hoặc kiểm tra `DbSeeder.cs`/`appsettings.Development.json` để biết seed cụ thể.

### 4. Môi Trường Khuyến Nghị

- **Chrome/Edge mới nhất** (bản desktop) — ít nhất 1280×800.
- **Chế độ DevTools** (F12): tab **Console** — ghi nhận mọi lỗi/warning.
- **Network tab** — kiểm tra request 4xx/5xx.
- Duyệt nhanh bằng **2 tab** (login tab A + tab B) để test session/realtime.

---

## 🧭 Quy Trình Test Khuyến Nghị

1. **Test theo thứ tự phụ thuộc:** Auth → User Profile → Payment → Admin → (các playground) → LMS/Classrooms → Teacher → Gamification/Notifications → Embed/Export → Core UI.
2. **Mỗi TC chạy độc lập** — đọc "Chuẩn bị" trước khi thực hiện.
3. **Verify regression** — các TC có ghi chú `Verify regression: <ID lỗi>` nhằm xác nhận lỗi P0/P1 đã fix không tái phát (ví dụ `AU-007`, `PM-001`, `HT-001`, `CU-001`...).
4. **Báo lỗi theo mẫu:**
   - Tính năng + file test (TC-XXX)
   - ID lỗi liên quan (nếu có)
   - Bước tái hiện
   - Kết quả thực tế vs mong đợi
   - Screenshot / console error / network log
   - Mức độ: 🔴 Chặn release · 🟠 Nghiêm trọng · 🟡 Vừa · 🟢 Nhỏ

---

## ✅ Checklist Tổng Quát (Smoke Test Nhanh)

> Dùng khi muốn quét nhanh toàn hệ thống (~30 phút). Chi tiết từng bước ở file tính năng.

### Luồng Student
- [ ] Đăng ký tài khoản mới (có confirm password) → auto login
- [ ] Xem danh sách khóa học + tiến độ → mở bài học → 4 bước (lý thuyết/trực quan/quiz/codelab)
- [ ] Quiz hoàn thành → XP tăng + badge/streak cập nhật + confetti
- [ ] Chuông thông báo: nhận realtime + đánh dấu đã đọc
- [ ] Học trong lớp (join bằng mã mời) → player next/back/complete
- [ ] Profile: đổi username/avatar → refresh còn nguyên; history quiz đầy đủ

### Luồng Premium
- [ ] Checkout → QR → simulate webhook (Dev) → success + Premium hoạt động
- [ ] Nội dung premium mở khóa đúng (không redirect bất ngờ)

### Luồng Teacher
- [ ] Tạo quiz/course/codelab → upload ảnh → quản lý lesson
- [ ] Lớp học: tạo module/item, kéo thả reorder, override, import course
- [ ] Analytics lớp học + export Excel

### Luồng Admin
- [ ] Danh sách user + tìm kiếm debounce → ban/premium/role/impersonate
- [ ] Audit log đầy đủ mọi hành động
- [ ] Admin cuối không thể ban/xóa chính mình

### Playgrounds & Visualizer
- [ ] HTML Playground: gõ code → preview đúng nhịp 800ms + lỗi JS hiển thị
- [ ] Algo Playground: Play trước compile auto-play; input lỗi bị chặn
- [ ] Sorting Visualizer: 7 thuật toán + pseudocode highlight + gutter click

### Chia sẻ & Nhúng
- [ ] Export PNG/SVG + QR + link /s/ roundtrip
- [ ] Embed widget: config → preview → code → mở trang embed

### Hạ tầng
- [ ] Theme đổi không flash · Modal Esc/focus trap · Toast/Confirm chuẩn a11y
- [ ] Session hết hạn → toast "Phiên đã hết hạn" + redirect đúng
- [ ] Mobile (≤ 390px): menu hamburger, drawer, bảng không vỡ

---

## 🧷 Lưu Ý Khi Báo Cáo

- **Không báo lỗi đã biết ngoài phạm vi** (nợ kỹ thuật PARTIAL/DEFERRED được liệt kê trong `plan/tracking/REVIEW.md` + `plan/tracking/errors.md` — ví dụ: EX-023, TC-041, LM-058, AL-042, AD-024/044, AU-045, PM-053, PS-007).
- **Bảo mật:** nếu phát hiện lỗ hổng (XSS, IDOR, farm XP...) — ưu tiên cao nhất, báo ngay với ID đánh dấu 🔴 Security.
- **Ghi lại môi trường** (OS, browser version, kích thước màn hình) kèm mỗi batch test.

---

## 🔁 Vòng Đời File Test Này

- Các file được tạo từ dữ liệu thực tế: `REVIEW.md` (27 mục) + `DATN_ERRORS.md` (22 round) + `features-tested.md`.
- **Khi sửa code mới:** cập nhật file tính năng tương ứng (thêm TC hoặc sửa kỳ vọng) theo quy tắc tracking của `AGENTS.md`.
