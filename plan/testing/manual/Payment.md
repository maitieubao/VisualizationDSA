# 💳 Payment / Checkout Premium — Hướng dẫn Manual Test

## 📋 Tổng quan
- **Scope:** `frontend/src/features/payment/**` (usePaymentStore, statelessPaymentApi, QrPaymentPanel, PremiumGate, CheckoutSuccessScreen, CheckoutIdleScreen, usePaymentTimer) + `views/checkout/PremiumCheckoutView.vue` (route `/checkout`) · backend `PaymentsController.cs` / `StatelessPaymentController.cs` / `PaymentService.cs` / `StatelessPaymentStrategy.cs` + `Order` entity
- **Trạng thái:** ✅ DoD (round 8 — 64/65 lỗi đã fix; PM-053 DEFERRED: countdown `setInterval` → `Date.now()` chưa làm, tab nền có thể lệch giây)
- **Test tự động:** Backend 472/472 pass · Frontend 2846/2846 pass · `vue-tsc -b` 0 lỗi
- **Môi trường test:** Trình duyệt Chromium mới nhất; backend chạy **Development** để dùng được `simulate-webhook` (chỉ dành cho tester); user có sẵn Student tài chính còn hạn dùng
- **Cảnh báo:** Tuyệt đối KHÔNG thực hiện chuyển tiền thật trong môi trường test; mọi luồng hoàn tất thanh toán phải dùng simulate-webhook

---

## 👤 User Stories

### US-PM-001: Khởi tạo đơn hàng premium
- **Vai trò:** Student
- **Mục tiêu:** Student chưa premium mua gói premium qua trang checkout.
- **Chấp nhận:** (1) Khách chưa đăng nhập bị chặn và được đưa về đăng nhập; (2) tạo order → hiển thị QR VietQR + số tài khoản + giá đúng 1 nguồn; (3) đếm ngược 15 phút hiển thị; (4) user đã premium không thể tạo order mới.

### US-PM-002: Thanh toán qua QR + chờ xác nhận
- **Vai trò:** Student
- **Mục tiêu:** Sau khi chuyển tiền, hệ thống tự phát hiện và cấp premium.
- **Chấp nhận:** (1) Polling chạy tự động ở cả 2 nhánh stateless/classic; (2) khi order `Completed` → tự chuyển sang success screen, user thành premium ngay (markPremium); (3) không cần reload trang.

### US-PM-003: Hết hạn order / lỗi thanh toán
- **Vai trò:** Student
- **Mục tiêu:** Order hết hạn hoặc lỗi được xử lý rõ ràng, không để user chuyển tiền nhầm.
- **Chấp nhận:** (1) Hết 15 phút → error state, QR ẩn số tài khoản/nút copy; (2) retry 1 click tạo order mới; (3) order quá hạn bị backend từ chối kể cả khi webhook đến sau.

### US-PM-004: Kiểm tra quyền premium (PremiumGate)
- **Vai trò:** Student / Khách
- **Mục tiêu:** Nội dung premium chỉ mở khi user thực sự là premium.
- **Chấp nhận:** (1) Không premium → dialog mời mua premium, quay lại đúng route nguồn sau khi thanh toán; (2) premium → nội dung mở bình thường.

---

## 🧪 Test Cases

### TC-PM-001: Khách chưa đăng nhập vào checkout bị chặn (P0)
- **Chuẩn bị:** Chưa đăng nhập; URL `/checkout` (hoặc nút "Mua Premium" từ nội dung premium bất kỳ).
- **Các bước:**
  1. Truy cập `/checkout` trực tiếp bằng URL.
  2. Quan sát điều hướng.
- **Kết quả mong đợi:** Bị chặn bởi router guard; redirect về đăng nhập; sau khi đăng nhập quay lại đúng `/checkout` (route nguồn được giữ); không có trạng thái 'paying' khi chưa login.
- **Verify regression:** Gate checkout trước khi tạo order (P0 scope payment).

### TC-PM-002: Tạo order → QR hiển thị + timer 15 phút (P0)
- **Chuẩn bị:** Đăng nhập tài khoản Student chưa premium.
- **Các bước:**
  1. Vào `/checkout`.
  2. Bấm nút tạo đơn hàng (Bắt đầu thanh toán).
  3. Quan sát panel QR.
- **Kết quả mong đợi:** Order mới được tạo (Network: `POST /api/v1/concepts/payment/orders`); QR VietQR hiển thị đúng (canvas/ảnh không trắng); số tài khoản + ngân hàng + số tiền khớp 1 nguồn config (giá gói premium, format VND thống nhất); đếm ngược 15:00 bắt đầu và giảm dần; trạng thái checkout = 'paying'.
- **Verify regression:** PM-006 (1 nguồn giá/bank) + PM-019 (đồng bộ timeout 15 phút) + PM-031/032 (formatVND + giá 1 nguồn).

### TC-PM-003: Endpoint verify KHÔNG tự cấp premium (P0)
- **Chuẩn bị:** Đăng nhập; có 1 order đang 'paying' (từ TC-PM-002). Mở DevTools Network.
- **Các bước:**
  1. Gọi thủ công `POST /api/v1/concepts/payment/verify` với body `{orderId}` của chính mình (qua tab Console/fetch hoặc devtools).
  2. Kiểm tra response.
  3. Vào `/profile` kiểm tra trạng thái premium.
- **Kết quả mong đợi:** Endpoint KHÔNG thay đổi trạng thái — chỉ trả về trạng thái order hiện tại ('Pending'); user KHÔNG trở thành premium; không có endpoint nào ngoài webhook xác thực cấp được premium.
- **Verify regression:** **PM-001** (lỗi bảo mật P0 — verify tự cấp premium: đã fix bằng cách chỉ trả trạng thái order).

### TC-PM-004: Simulate webhook (chỉ Dev) → cấp premium + success screen (P0)
- **Chuẩn bị:** Backend chạy Development; order đang 'paying' ở TC-PM-002.
- **Các bước:**
  1. Từ DevTools gọi `POST /api/v1/concepts/payment/simulate-webhook` với `{orderId}` của order đang chờ (chỉ dành cho Dev — production trả 404).
  2. Không reload trang; quan sát màn hình checkout trong ~5-10s (1 chu kỳ poll).
- **Kết quả mong đợi:** Polling phát hiện `Completed` → tự chuyển sang **CheckoutSuccessScreen** (không cần reload); `authStore.currentUser.isPremium = true` ngay (markPremium qua action); `/profile` hiển thị badge Premium; confetti/icon success hiển thị; countdown dừng, không phủ overlay lên success.
- **Verify regression:** **PM-016** (stateless dead-end polling — đã fix: polling chạy cả 2 branch) + **PM-021** (markPremium action thay 4 chỗ mutation trực tiếp) + **PM-040** (timer không dừng khi success).

### TC-PM-005: User đã premium không mua lại được (P1)
- **Chuẩn bị:** Tài khoản đã premium (từ TC-PM-004 hoặc admin cấp).
- **Các bước:**
  1. Vào `/checkout`.
  2. Quan sát UI / thử tạo order.
- **Kết quả mong đợi:** View/store guard "đã premium" hoạt động: không hiển thị form mua, hoặc chặn tạo order với 409 rõ ràng; không thể tạo order trùng khi đã premium.
- **Verify regression:** **PM-026** (user premium vẫn vào mua — đã fix: guard isPremium cả view lẫn store) + PM-008 (backend chặn).

### TC-PM-006: Order quá hạn bị backend từ chối (P0)
- **Chuẩn bị:** Order 'paying' đã tạo **hơn 15 phút** (có thể chờ thật hoặc sửa `ExpiresAt` trong DB phục vụ test).
- **Các bước:**
  1. Gọi simulate-webhook với orderId quá hạn.
  2. Kiểm tra response + trạng thái order + premium của user.
- **Kết quả mong đợi:** Backend từ chối: response 409 (hoặc không cấp premium) kèm lý do order hết hạn; order chuyển trạng thái `Expired`; premium KHÔNG được cấp; UI (nếu còn mở) chuyển sang error state.
- **Verify regression:** **PM-003** (order không có vòng đời hết hạn — đã fix: `ExpiresAt` 15 phút + từ chối order quá hạn).

### TC-PM-007: Hết giờ → error state + retry 1 click (P1)
- **Chuẩn bị:** Order đang 'paying'; fake time (hoặc chờ) cho countdown về 0:00.
- **Các bước:**
  1. Để countdown hết giờ (0:00).
  2. Quan sát panel QR.
  3. Bấm nút retry.
- **Kết quả mong đợi:** Chuyển sang error state rõ ràng; QR ẩn số tài khoản + nút Copy + box "tự kiểm tra" (không để user chuyển tiền nhầm sau khi hết hạn); nút "Thử lại" **chỉ cần 1 click** tạo order mới → về trạng thái 'paying' với QR mới + timer mới 15:00.
- **Verify regression:** **PM-049** (error state cần 2 click retry — đã fix: retry 1 click) + **PM-028** (QR expired vẫn hiện số tài khoản/copy — đã fix: ẩn).

### TC-PM-008: Refresh trang giữa thanh toán → không mất trạng thái (P1)
- **Chuẩn bị:** Order 'paying' đang hiển thị QR.
- **Các bước:**
  1. F5 refresh trang.
  2. Quan sát `/checkout` sau load.
- **Kết quả mong đợi:** User quay lại đúng route `/checkout` (không bị đẩy sang trang khác); trạng thái order được khôi phục (vẫn 'paying', hoặc nếu đã Completed → success screen); không rơi vào trạng thái 'idle' mất order.
- **Verify regression:** **PM-012/PM-029** (redirect route nguồn sau thanh toán + giữ route khi refresh).

### TC-PM-009: Polling tự phát hiện Completed mà không reload (P1)
- **Chuẩn bị:** Order 'paying' đang mở (không bấm gì).
- **Các bước:**
  1. Gọi simulate-webhook thành công cho order.
  2. Không reload; đợi chu kỳ poll (5s) và quan sát.
  3. Lặp lại lần 2 với order mới, nhưng dùng **2 webhook song song cùng id** (gửi 2 request cùng lúc).
- **Kết quả mong đợi:** (1) Tự chuyển success + premium (không reload); (2) gọi 2 webhook cùng id → chỉ 1 lần cấp premium (idempotency), user không nhận double-grant, log không có 2 giao dịch; (3) polling dừng sau khi Completed.
- **Verify regression:** PM-004 (idempotency transaction) + PM-052/053.

### TC-PM-010: Double-click "Thử lại" → chỉ 1 order (P2)
- **Chuẩn bị:** Ở trạng thái error (hết giờ).
- **Các bước:**
  1. Click "Thử lại" 3 lần thật nhanh (hoặc giữ Enter).
  2. Kiểm tra Network tab số request tạo order.
- **Kết quả mong đợi:** Chỉ 1 request tạo order; reentrancy guard chặn request trùng; nút bị disabled khi đang tạo (isLoading); không tạo ra nhiều order trùng.
- **Verify regression:** **PM-017** (double-submit — đã fix: guard `if (isLoading) return` + disable nút).

### TC-PM-011: Logout khi đang poll → polling dừng, không nhiễu user sau (P2)
- **Chuẩn bị:** Order 'paying' đang chạy polling.
- **Các bước:**
  1. Logout ngay khi đang ở trạng thái 'paying'.
  2. Đăng nhập lại user khác; vào `/checkout` tạo order.
  3. Quan sát Network.
- **Kết quả mong đợi:** Khi logout/token null → `stopPolling()` được gọi (không còn request poll mỗi 5s trong console); user mới không bị poll nhầm order cũ; store reset khi đổi user (premiumStatus/currentOrder sạch).
- **Verify regression:** **PM-018** (polling leak khi logout — đã fix: `if (!token) { stopPolling(); return; }`) + PM-022 (stale state đổi user).

### TC-PM-012: QR hết hạn ẩn hướng dẫn + copy (P2)
- **Chuẩn bị:** Order sắp hết giờ (tạo order rồi chờ 15 phút / chỉnh ExpiresAt DB).
- **Các bước:**
  1. Quan sát QrPaymentPanel trước và sau khi hết giờ.
- **Kết quả mong đợi:** Sau hết giờ: số tài khoản + nút Copy + box hướng dẫn "tự kiểm tra" ẩn hẳn; aria-live announce trạng thái hết hạn; alt QR tiếng Việt hợp lệ; nút Copy có fallback (không im lặng khi clipboard không sẵn).
- **Verify regression:** PM-028 + PM-044/045/046 (alt + copy fallback + aria-live).

### TC-PM-013: Success → quay về route nguồn (P1)
- **Chuẩn bị:** Một trang có gate premium (ví dụ lesson premium hoặc nút mua từ `/sorting`). Nếu chưa có điểm vào, dùng `/checkout` trực tiếp.
- **Các bước:**
  1. Từ trang nguồn bấm nút mua premium → vào `/checkout`.
  2. Tạo order → simulate-webhook thành công.
  3. Bấm nút tiếp tục trên success screen.
- **Kết quả mong đợi:** Sau khi hoàn tất, quay lại đúng route nguồn đã định (không cứng đẩy về `/sorting`); nếu route nguồn có gate → nội dung mở khóa ngay.
- **Verify regression:** **PM-029** (sau success cứng đẩy /sorting — đã fix: redirect route nguồn).

### TC-PM-014: Webhook sai/thiếu ApiKey → 401 (P1)
- **Chuẩn bị:** Kiểm tra DevTools Network hoặc dùng công cụ REST (Postman/cURL).
- **Các bước:**
  1. Gọi `POST /api/v1/payments/webhook` (endpoint webhook thật) với header thiếu hoặc sai `SePay` API key, body giả hợp lệ.
  2. Gọi tiếp với đúng key.
- **Kết quả mong đợi:** Sai/thiếu key → 401; đúng key + dữ liệu hợp lệ → xử lý webhook (nhưng thực tế không có tiền nên guard từ chối — không cấp premium); response không lộ cấu hình nội bộ (bank/số tiền) khi lỗi 500/503.
- **Verify regression:** **PM-057** (webhook auth) + PM-005 (fail-closed thiếu config) + PM-013 (webhook lạ được log warning).

---

## 📊 Tổng kết bộ test

| Hạng mục | Số lượng |
| :--- | :--- |
| User Stories | 4 (US-PM-001 → 004) |
| Test Cases | 14 (TC-PM-001 → 014) — P0: 5 · P1: 5 · P2: 4 |
| Lỗi P0/P1 verify regression | PM-001, PM-016, PM-021, PM-026, PM-003, PM-049, PM-028, PM-029, PM-017, PM-018, PM-057 |
