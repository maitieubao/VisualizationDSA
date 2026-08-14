# 💳 Payment / Checkout Premium — Hồ Sơ Thực Trạng & Định Hướng

## 🎯 Mục đích

- **Vấn đề người dùng:** Học viên muốn trả phí để mở khóa nội dung premium (bài học, tính năng nâng cao); hệ thống cần nhận tiền, cấp quyền đúng người, đúng thời điểm và không thể bị qua mặt để lấy premium miễn phí.
- **Tuyên bố giá trị:** Payment biến sản phẩm từ "demo học thuật" thành dịch vụ có doanh thu — nhưng giá trị đó chỉ thật sự tồn tại khi **tiền thật chạy qua một cổng thanh toán thật**, không phải nút mô phỏng.

## 📌 Thực trạng hiện tại

- Trạng thái kỹ thuật: ✅ DoD — Review Round 8 (PM-001→065; **64/65 lỗi đã fix**, PM-053 DEFERRED), backend 472/472 + frontend 2846/2846 pass, `vue-tsc -b` 0 lỗi.
- Đang hoạt động thật:
  - Tạo order premium → QR VietQR + số tài khoản + giá 1 nguồn config + đếm ngược 15 phút (ExpiresAt server-side).
  - Polling tự động cả 2 nhánh stateless/classic → phát hiện order `Completed` → success screen + `markPremium()` ngay, không reload.
  - Bảo mật đúng chuẩn: endpoint verify **chỉ trả trạng thái order** (không cấp premium — PM-001), idempotency webhook, fail-closed thiếu config SePay, từ chối order quá hạn, chặn user premium/pending tạo order (409).
  - UX thanh toán: hết giờ → error state ẩn số tài khoản/copy, retry 1 click, redirect route nguồn sau success, PremiumGate mở khóa đúng quyền.
- Giới hạn hiện tại:
  - **Thanh toán thực tế KHÔNG hoàn tất được:** chỉ `simulate-webhook` (Development) mới cấp premium — production trả 404; **chưa có cổng thanh toán thật nào được test** (SePay sandbox chưa nối).
  - PM-053 DEFERRED: countdown dùng `setInterval` — tab nền có thể lệch giây (nên chuyển sang `Date.now()`).
  - Chưa có luồng dọn dẹp order quá hạn (cleanup background), chưa có xem trước hóa đơn trước khi chuyển tiền.

## ⭐ Đánh giá giá trị thực tế: 5/10 (🟡 Demo-grade)

- **Điểm thật:** Luồng checkout UI→QR→polling→cấp quyền chạy đúng với webhook mô phỏng; bảo mật lõi (không cấp premium lậu, idempotency, hết hạn order) đã được chứng minh bằng test 2 đầu. **C1 (2026-08-13):** lazy-cleanup order quá hạn (`GetOrderStatusAsync` đánh dấu Expired ngay khi tra cứu — hết tồn đọng order Pending chết); nhãn "Môi trường mô phỏng thanh toán" trên checkout — user không còn bị hiểu lầm là giao dịch thật.
- **Điểm "ảo" (code xanh nhưng chưa thực dụng):**
  - **Toàn bộ "dòng tiền" là giả** — user thật không thể trả tiền và nhận premium trong production; mọi TC hoàn tất đều đi qua nút mô phỏng dành riêng cho tester.
  - Mục tiêu ban đầu "payment biến sản phẩm thành dịch vụ có doanh thu" chưa đạt — chưa có cổng SePay sandbox/production thật nào được nối.
  - Các con số test chứng minh code đúng spec, KHÔNG chứng minh có doanh thu.

## 🚧 Điều cần làm để có giá trị thực tế (checklist ưu tiên)

- [ ] Nối SePay sandbox thật (tạo order → QR → webhook thật) — acceptance: user trả tiền qua QR thật trong sandbox, webhook SePay cấp premium, log giao dịch khớp; production chặn `simulate-webhook`.
- [x] Gắn nhãn "Mô phỏng" rõ ràng trên UI nếu chưa nối cổng thật — **C1 ✅ 2026-08-13** — checkout hiển thị badge "Môi trường mô phỏng thanh toán — không giao dịch tiền thật".
- [x] Luồng dọn dẹp order quá hạn — **C1 ✅ 2026-08-13** — lazy-cleanup ngay khi tra cứu trạng thái (order Pending quá hạn → Expired + commit).
- [ ] Xem trước hóa đơn trước khi chuyển tiền — acceptance: user thấy tên gói, giá, thời hạn, đơn vị thụ hưởng trước khi tạo QR.
- [ ] Chuyển countdown sang timestamp (đóng PM-053) — acceptance: tab nền/nền foreground không lệch giây hết hạn.

## 🧭 Hướng phát triển tiếp theo

- **QR bank thật (SePay production)** — lý do nghiệp vụ: luồng duy nhất để có doanh thu thật từ học viên; kỹ thuật: giữ nguyên contract order/webhook hiện tại, đổi endpoint + xác thực API key production, thêm mã hóa bí mật env.
- **Lịch sử giao dịch** — lý do nghiệp vụ: user cần đối chiếu đã trả tiền khi khiếu nại; kỹ thuật: tái dùng Order entity + thêm filter status/date, UI trong profile.
- **Hoàn tiền** — lý do nghiệp vụ: xử lý khiếu nại, tăng độ tin cậy; kỹ thuật: admin action hoàn tiền + ghi audit + thu hồi premium.
- **Gói nhiều mức (tháng/năm, gói lớp học)** — lý do nghiệp vụ: tăng lựa chọn giá; kỹ thuật: thêm trường package vào Order, giá 1 nguồn config mở rộng.

## 🧪 User Stories & Test Cases (tham chiếu)

- File manual: `plan/testing/manual/Payment.md`
- US then chốt: **US-PM-001** (khởi tạo đơn hàng premium), **US-PM-002** (thanh toán qua QR + chờ xác nhận), **US-PM-003** (hết hạn order / lỗi thanh toán)
- TC then chốt: **TC-PM-002** (tạo order → QR + timer — regression PM-006/019), **TC-PM-004** (simulate-webhook → premium + success screen — regression PM-016/021), **TC-PM-006** (order quá hạn bị từ chối — regression PM-003), **TC-PM-007** (hết giờ → error + retry 1 click — regression PM-049/028), **TC-PM-009** (polling bắt Completed + idempotency 2 webhook song song — regression PM-004)
