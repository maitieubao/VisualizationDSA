# Báo Cáo Xác Thực — 02. Payment / Checkout Premium

> **Mục đích báo cáo:** Cung cấp bằng chứng để bạn đọc và xác thực lại luồng thanh toán premium — đặc biệt phân biệt rõ phần nào là THẬT và phần nào là MÔ PHỎNG.
> **Ngày báo cáo:** 2026-08-14 · **Điểm giá trị thực tế hiện tại:** 5/10 — Mức: Demo-grade (tăng từ 4/10 nhờ C1)

---

## 1. Mục đích (theo tài liệu gốc)

Học viên trả phí để mở khóa nội dung premium; hệ thống phải nhận tiền, cấp quyền đúng người, đúng thời điểm, không thể bị qua mặt lấy premium miễn phí. Giá trị thật chỉ tồn tại khi **tiền thật chạy qua cổng thanh toán thật**.

## 2. Những gì được triển khai (bằng chứng code)

| Thành phần | Vị trí | Trạng thái |
| :-- | :-- | :-- |
| PaymentService — tạo order (mã VDSAxxxxxx, ExpiresAt 15 phút, chặn user premium/pending tạo order mới) | `backend/src/Infrastructure/Services/PaymentService.cs` | [X] |
| Fail-closed config SePay (thiếu BankAccount/BankId/price → từ chối, không fallback) | `PaymentService.ReadPaymentConfig()` | [X] |
| Webhook SePay (xác thực Apikey + rate limit + account/amount guard + idempotency transaction) | `PaymentsController.ReceiveSePayWebhook` | [X] |
| **C1: lazy-cleanup order hết hạn** — tra cứu order Pending quá hạn → MarkAsExpired ngay | `PaymentService.GetOrderStatusAsync` | [X] MOI |
| **C1: nhãn "Môi trường mô phỏng thanh toán"** trên checkout | `frontend/src/views/checkout/PremiumCheckoutView.vue` | [X] MOI |
| Checkout UI (QR VietQR + timer đếm ngược + polling + success screen + retry) | `frontend/src/views/checkout/*` + `features/payment/*` | [X] |
| PremiumGate (chặn mọi điểm chạm chưa premium → /checkout) | `frontend/src/features/payment/components/PremiumGate.vue` | [X] |
| Stateless payment (API stateless tương ứng) | `StatelessPaymentController.cs` + `StatelessPaymentStrategy.cs` | [X] |

## 3. Bằng chứng test

- `backend/tests/VisualizationDSA.UnitTests/Services/PaymentServiceTests.cs` — **22 test** (bao gồm **2 test C1 mới**: order quá hạn → Expired + commit; order còn hạn → Pending không commit)
- `backend/tests/VisualizationDSA.UnitTests/Services/PaymentsControllerTests.cs` — controller + webhook
- `backend/tests/VisualizationDSA.UnitTests/Services/StatelessPaymentControllerTests.cs` + `StatelessPaymentStrategyTests.cs`
- Frontend: `src/views/checkout/__tests__/` (checkoutP0Tests, checkoutP2Tests, checkoutPaymentFlow) — 32 test
- Tổng suite: Backend **788/788**, Frontend **3512/3512**, vue-tsc 0

## 4. Các bước xác thực thủ công

| # | Bước | Kỳ vọng |
| :-- | :-- | :-- |
| 1 | Đăng nhập student → vào 1 bài premium → bị PremiumGate chặn | Bị đưa về `/checkout` (hoặc 403 có message) |
| 2 | Tại checkout, bấm nâng cấp premium | QR VietQR hiện ra + số tài khoản + giá (1 nguồn config) + timer 15 phút |
| 3 | Quan sát: **nhãn "Môi trường mô phỏng thanh toán" hiển thị rõ** | Có badge cảnh báo không giao dịch tiền thật |
| 4 | Chờ tới khi timer hết hạn (hoặc sửa ExpiresAt trong DB) | Order chuyển sang Expired; UI chuyển error state, ẩn số tài khoản; retry 1 click tạo order mới |
| 5 | Ở môi trường Development: dùng nút "Mô phỏng: Xác nhận đã thanh toán" | Webhook simulate → order Completed → premium được cấp → success screen |
| 6 | (Kiểm tra bảo mật) Gửi lại webhook cùng transaction id 2 lần | Lần 2 bị bỏ qua (idempotent), premium không cấp 2 lần |
| 7 | (Kiểm tra bảo mật) Tạo order mới khi đã có order Pending chưa hết hạn | Bị chặn 409/InvalidOperation |

## 5. Giới hạn còn lại (thừa nhận trong hồ sơ)

- **QUAN TRỌNG — Đây là điều bạn cần đặc biệt xác thực:** thanh toán THẬT không hoàn tất được. Chỉ `simulate-webhook` (Development) cấp premium; **chưa có cổng SePay sandbox/production thật nào được nối** → user production không thể trả tiền thật.
- PM-053 DEFERRED: countdown dùng `setInterval` — tab nền có thể lệch giây.
- Chưa có xem trước hóa đơn trước khi chuyển tiền.

## 6. [Luu y] Kết luận xác thực

**Bạn cần chốt 1 trong 2:** (A) nối SePay sandbox thật để "dòng tiền" chạy thật, hoặc (B) chấp nhận đây là tính năng demo có nhãn rõ ràng (hiện tại). Nếu chọn (B), điểm 5/10 là hợp lý; nếu chọn (A), sau khi nối và test webhook thật, điểm có thể lên 8/10.

---

*Báo cáo dựa trên: `plan/review/features/payment.md`, `PaymentService.cs`, `PaymentsController.cs`, test hiện hữu. Xác thực xong → đánh dấu ngày + ký tên.*
