# 🧪 E2E Selenium Test Suite — VisualizationDSA

Bộ kiểm thử trình duyệt tự động dựa trên **16 file hướng dẫn manual test** trong
`plan/testing/manual/*.md` (205 test cases). Dùng **Selenium WebDriver (Python) + Chrome headless**.

## Yêu cầu

- Python ≥ 3.10, Chrome/Edge cài sẵn (Selenium Manager tự tải chromedriver).
- Backend chạy tại `http://localhost:5055` (môi trường **Development** — cần cho
  simulate-webhook, demo accounts) và frontend Vite tại `http://localhost:5173`.
- Đặt `$env:Jwt__Key` cho backend (key cố định giúp token sống qua restart).

## Cài đặt & chạy

```powershell
cd e2e
pip install -r requirements.txt

# Smoke
python -m pytest test_smoke.py -v

# Theo module (16 suite tương ứng 16 tính năng)
python -m pytest test_auth.py -v

# Theo mức ưu tiên trong manual docs
python -m pytest -m p0

# Toàn bộ (~100 tests, mỗi module tự restart backend khi cần)
python -m pytest
```

Biến môi trường tùy chọn: `E2E_FRONTEND_URL`, `E2E_API_BASE`, `E2E_SHOW_BROWSER=1`
(chạy có cửa sổ), `E2E_ACCESS_TOKEN_TTL_SHORT=1` (bật TC-AU-006 — cần backend TTL 60s).

## Cấu trúc

| File | Tính năng | Manual doc gốc |
| :-- | :-- | :-- |
| `test_auth.py` | Auth (14 TC) | `manual/Auth.md` |
| `test_payment.py` | Payment/Checkout (8 TC) | `manual/Payment.md` |
| `test_admin.py` | Admin Panel (5 TC) | `manual/Admin.md` |
| `test_html_playground.py` | HTML Playground (7 TC) | `manual/HTMLPlayground.md` |
| `test_algo_playground.py` | Algo Playground (7 TC) | `manual/AlgoPlayground.md` |
| `test_sorting.py` | Sorting Visualizer (9 TC) | `manual/SortingVisualizer.md` |
| `test_courses_lessons.py` | Courses & Lessons (6 TC) | `manual/CoursesLessons.md` |
| `test_lesson_study.py` | Lesson Study (6 TC) | `manual/LessonStudy.md` |
| `test_teacher_panel.py` | Teacher Panel (5 TC) | `manual/TeacherPanel.md` |
| `test_classrooms.py` | Classrooms (4 TC) | `manual/Classrooms.md` |
| `test_gamification.py` | Gamification (4 TC) | `manual/Gamification.md` |
| `test_profile.py` | User Profile (8 TC) | `manual/UserProfile.md` |
| `test_embed.py` | Embed Widget (5 TC) | `manual/EmbedWidget.md` |
| `test_export_share.py` | Export & Share (4 TC) | `manual/ExportShare.md` |
| `test_notifications.py` | Notifications (3 TC) | `manual/Notifications.md` |
| `test_core_ui.py` | Core & UI Components (4 TC) | `manual/CoreUI.md` |

Hạ tầng: `conftest.py` (driver headless, fixture `page` xóa session + tắt guided tour,
screenshot khi fail), `helpers/ui.py` (login/logout/register UI), `helpers/api.py`
(webhook simulate, ban/premium qua API), `helpers/backend_ctl.py` (restart backend —
reset bộ nhớ in-memory: rate limit, order thanh toán, premium cache).

## Lưu ý đã biết

- 2 bug sản phẩm tìm thấy khi viết suite đã được FIX (2026-08-16):
  - **PM-008**: refresh khi đang thanh toán mất order → `restoreActiveOrder()` trong
    `usePaymentStore` (khôi phục từ transactions log backend).
  - **AL-002**: đổi demo qua `<select>` kẹt nút "Đang chạy…" → `compileEpoch` trong
    `useAlgoPlaygroundStore`.
  - Chi tiết: `plan/tracking/errors.md` mục "E2E Selenium Suite 2026-08-16".
- 3 bug backend Guid SQLite (E2E-B1/B2/B3) đã sửa: `StatelessPaymentController.cs`,
  `AdminController.cs` — xem cùng mục errors.md.

## Ghi chú vận hành

- Test dùng tài khoản seed trong `DbSeeder.cs` (Development):
  Admin `admin@visualizationdsa.dev/Admin@2024`, Teacher `demo@visualizationdsa.dev/Demo@2024`,
  Student `nguyenvana@visualizationdsa.dev/User@2024`...
- Mỗi module chạy độc lập được; module payment/admin tự restart backend (mất ~30-60s).
- Không chạy song song với `npx vitest` (chia sẻ port/backend dev server).
