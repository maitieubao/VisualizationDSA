# Báo Cáo Xác Thực — 01. Auth (Đăng nhập / Đăng ký / Refresh Token)

> **Mục đích báo cáo:** Cung cấp bằng chứng để bạn (chủ dự án) đọc và xác thực lại tính năng này có thật sự hoạt động như tài liệu mô tả — không phải chỉ "test xanh".
> **Ngày báo cáo:** 2026-08-14 - **Điểm giá trị thực tế hiện tại:** 9/10 — Mức: Thực dụng (giữ nguyên — không thay đổi trong Phase A->D)

---

## 1. Mục đích (theo tài liệu gốc)

Khách cần tài khoản riêng để hệ thống theo dõi tiến độ, XP, quyền premium và vai trò. Auth phải đăng nhập/đăng ký/refresh an toàn, không thể đánh cắp phiên, và hoạt động ổn định cả khi token hết hạn.

## 2. Những gì được triển khai (bằng chứng code)

| Thành phần | Vị trí | Trạng thái |
| :-- | :-- | :-- |
| Stateless Auth (JWT access + refresh, rotation chống reuse, single-flight refresh) | `backend/src/Domain/Strategies/StatelessAuthStrategy.cs` | [X] |
| Stateless Auth API (login/register/refresh/logout) | `backend/src/WebApi/Controllers/StatelessAuthController.cs` | [X] |
| AuthService (classic user/pass, hash SHA-256) | `backend/src/Application/Services/AuthService.cs` | [X] |
| JWT signing config (fail-closed — thiếu key tự throw) | `backend/src/Domain/JwtSigningConfig.cs` | [X] |
| Auth store FE (login/register/logout/refresh, 401 auto-refresh) | `frontend/src/features/auth/store/useAuthStore.ts` | [X] |
| Router guard (requiresAuth / requiresRole / impersonation) | `frontend/src/router/index.ts` + `routes.ts` | [X] |
| Impersonate (admin đóng vai student, banner + thoát về /admin) | `backend/src/WebApi/Controllers/AdminController.cs` + FE | [X] |
| Refresh token cleanup (xóa token hết hạn sau 7 ngày) | `backend/src/Infrastructure/Services/RefreshTokenCleanupService.cs` | [X] |

## 3. Bằng chứng test

**Backend (4 test files chuyên auth):**
- `backend/tests/VisualizationDSA.UnitTests/Services/AuthServiceTests.cs`
- `backend/tests/VisualizationDSA.UnitTests/Services/StatelessAuthControllerTests.cs`
- `backend/tests/VisualizationDSA.UnitTests/Services/StatelessAuthStrategyTests.cs`
- `backend/tests/VisualizationDSA.UnitTests/Services/StatelessGamificationControllerTests.cs` (token truyền qua)

**Frontend (4 spec files):**
- `frontend/src/features/auth/__tests__/authP0Tests.spec.ts`
- `frontend/src/features/auth/__tests__/routerGuardTests.spec.ts`
- `frontend/src/features/auth/__tests__/statelessAuthApi.spec.ts`
- `frontend/src/features/auth/__tests__/useAuthStore.spec.ts`

**Tổng:** Backend **788/788**, Frontend **3512/3512** (toàn suite, không riêng auth), `vue-tsc` 0 lỗi.

## 4. Các bước xác thực thủ công (bạn tự chạy)

| # | Bước | Kỳ vọng |
| :-- | :-- | :-- |
| 1 | Khởi động backend (port 5055) + frontend dev | App mở landing, không crash |
| 2 | Vào `/dashboard` khi chưa đăng nhập | Redirect về landing (guard chặn) |
| 3 | Đăng ký tài khoản mới (email + mật khẩu) | Tạo user thành công, tự đăng nhập |
| 4 | Đăng xuất -> đăng nhập lại | Vào được dashboard, dữ liệu cá nhân đúng |
| 5 | Mở DevTools -> Application -> LocalStorage, xóa access token nhưng giữ refresh token | Request tiếp theo 401 -> auto-refresh -> vẫn hoạt động (không bị đá ra) |
| 6 | Đăng nhập admin -> Admin Panel -> impersonate 1 student | Banner "Đóng vai" xuất hiện, vào được dashboard như student |
| 7 | Bấm "Thoát đóng vai" | Về /admin với quyền admin nguyên vẹn |

## 5. Giới hạn còn lại (thừa nhận trong hồ sơ)

- **AU-045 PARTIAL:** một số edge chưa đóng hoàn toàn (chi tiết trong `plan/review/features/auth.md`).
- **Impersonate ít người dùng thật** — chỉ admin chạm tới, không tạo giá trị trực tiếp cho học viên.
- Chưa có "remember-device" (TTL refresh dài hơn khi tích "giữ đăng nhập") — checklist mở.
- Chưa có OAuth xã hội (Google/GitHub) — rào cản nhỏ cho học viên mới.

## 6. [Luu y] Xác thực đặc biệt

- **Kiểm tra bảo mật:** refresh token phải KHÔNG dùng lại được (rotation) — thử: đăng nhập, gọi refresh 2 lần với cùng refresh token cũ, lần 2 phải bị từ chối.
- **Ban user:** đăng nhập user bị admin ban -> login phải bị chặn (test AD-004/007 đã cover).

---

*Báo cáo dựa trên: `plan/review/features/auth.md`, test hiện hữu, routes `/`, `/dashboard`. Xác thực xong -> đánh dấu ngày + ký tên.*
