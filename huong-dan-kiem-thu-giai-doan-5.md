# 📋 Hướng Dẫn Kiểm Thử Giai Đoạn 7: Payment Integration & Premium Feature System

> **Phiên bản:** 1.0 — Ngày tạo: 2026-06-05
>
> **Mục đích:** Hướng dẫn chi tiết cho đội ngũ kiểm thử thủ công xác nhận tính năng Thanh toán Premium, mô phỏng QR VietQR, xác nhận webhook, và Premium Feature Gatekeeping hoạt động đúng end-to-end.

---

## 1. Chuẩn Bị Môi Trường

### 1.1 Yêu cầu

- **Node.js** >= 18.x, **.NET SDK** >= 9.0
- **Trình duyệt** Chrome/Edge mới nhất
- **Terminal** 2 tab (backend + frontend)

### 1.2 Cài đặt

```bash
# Frontend
cd frontend && npm install

# Backend (không cần PostgreSQL — endpoint stateless)
cd backend/src/WebApi && dotnet restore
```

---

## 2. Khởi Động Server

### 2.1 Backend (.NET 9.0)

```bash
cd backend/src/WebApi
export ASPNETCORE_ENVIRONMENT=Development
dotnet run --urls "http://0.0.0.0:5050"
```

### 2.2 Frontend (Vue 3 + Vite)

```bash
cd frontend
VITE_API_BASE_URL=http://localhost:5055 npx vite --host 0.0.0.0 --port 5173
```

---

## 3. Kiểm Thử Payment API (curl)

### 3.1 Lấy cấu hình thanh toán

```bash
curl -s http://localhost:5055/api/v1/concepts/payment/config | python3 -m json.tool
```

**Kỳ vọng:**
- `premiumPrice: 199000`, `currency: "VND"`
- `bankId: "MBBank"`, `bankAccount: "99999999999"`
- `supportedMethods: ["vietqr", "bank_transfer", "momo"]`
- `premiumFeatures`: 6 tính năng (4 premium, 2 free)

### 3.2 Tạo hóa đơn thanh toán (checkout)

```bash
curl -s -X POST http://localhost:5055/api/v1/concepts/payment/checkout \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo-user-001","paymentMethod":"vietqr"}' | python3 -m json.tool
```

**Kỳ vọng:**
- `id`: bắt đầu bằng `"order-"`
- `paymentCode`: dạng `"VDSAxxxxxx"` (6 ký tự hex viết hoa)
- `amount: 199000`, `status: "Pending"`
- `qrUrl`: URL VietQR hợp lệ (chứa `img.vietqr.io`)
- `bankId: "MBBank"`, `accountName: "DSA VISUALIZER ACADEMY"`

**Lưu lại `id` và `paymentCode` để dùng ở các bước tiếp theo!**

### 3.3 Truy vấn trạng thái hóa đơn

```bash
ORDER_ID="<paste id từ bước 3.2>"

curl -s "http://localhost:5055/api/v1/concepts/payment/orders/$ORDER_ID/status?userId=demo-user-001" | python3 -m json.tool
```

**Kỳ vọng:** `status: "Pending"` (chưa thanh toán)

### 3.4 Mô phỏng webhook ngân hàng (xác nhận đã nhận tiền)

```bash
curl -s -X POST http://localhost:5055/api/v1/concepts/payment/simulate-webhook \
  -H "Content-Type: application/json" \
  -d "{\"orderId\":\"$ORDER_ID\"}" | python3 -m json.tool
```

**Kỳ vọng:**
- `status: "Completed"`
- `completedAt`: timestamp không null

### 3.5 Xác nhận thanh toán (verify)

```bash
# Tạo hóa đơn mới để test verify
NEW_ORDER=$(curl -s -X POST http://localhost:5055/api/v1/concepts/payment/checkout \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo-user-001","paymentMethod":"vietqr"}')
NEW_ORDER_ID=$(echo $NEW_ORDER | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

curl -s -X POST http://localhost:5055/api/v1/concepts/payment/verify \
  -H "Content-Type: application/json" \
  -d "{\"orderId\":\"$NEW_ORDER_ID\",\"userId\":\"demo-user-001\"}" | python3 -m json.tool
```

**Kỳ vọng:** `status: "Completed"`, user được nâng cấp Premium

### 3.6 Kiểm tra trạng thái Premium

```bash
curl -s "http://localhost:5055/api/v1/concepts/payment/premium-status?userId=demo-user-001" | python3 -m json.tool
```

**Kỳ vọng:**
- `isPremium: true`
- `plan: "lifetime"`
- `unlockedFeatures`: 6 tính năng (tất cả đều mở khóa)

### 3.7 Tạo hóa đơn khi đã Premium (trùng)

```bash
curl -s -X POST http://localhost:5055/api/v1/concepts/payment/checkout \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo-user-001","paymentMethod":"vietqr"}' | python3 -m json.tool
```

**Kỳ vọng:** HTTP 409 Conflict với `error: "ALREADY_PREMIUM"`

### 3.8 Kiểm tra quyền truy cập tính năng

```bash
# Tính năng Premium (khi đã Premium → có quyền)
curl -s "http://localhost:5055/api/v1/concepts/payment/check-access?featureId=unlimited-runs&userId=demo-user-001" | python3 -m json.tool

# Tính năng Premium (khi chưa Premium → KHÔNG có quyền)
curl -s "http://localhost:5055/api/v1/concepts/payment/check-access?featureId=unlimited-runs&userId=new-user-999" | python3 -m json.tool

# Tính năng miễn phí (luôn có quyền)
curl -s "http://localhost:5055/api/v1/concepts/payment/check-access?featureId=basic-viz&userId=new-user-999" | python3 -m json.tool
```

**Kỳ vọng:**
- Premium user + premium feature: `hasAccess: true`
- Free user + premium feature: `hasAccess: false`
- Free user + free feature: `hasAccess: true`

### 3.9 Lấy lịch sử giao dịch

```bash
curl -s "http://localhost:5055/api/v1/concepts/payment/transactions?userId=demo-user-001" | python3 -m json.tool
```

**Kỳ vọng:** Mảng giao dịch với các entry `CHECKOUT_CREATED`, `PAYMENT_VERIFIED`/`WEBHOOK_CONFIRMED`

### 3.10 Hóa đơn không tồn tại

```bash
curl -s "http://localhost:5055/api/v1/concepts/payment/orders/invalid-order/status" | python3 -m json.tool
```

**Kỳ vọng:** HTTP 404 với `error: "ORDER_NOT_FOUND"`

---

## 4. Kiểm Thử Giao Diện Frontend

### 4.1 Trang Premium Checkout

1. Mở `http://localhost:5173/#/checkout`
2. **Kỳ vọng:**
   - Cột trái: PremiumMarketingCard hiển thị "VDSA PREMIUM", giá 199.000đ
   - Cột phải: Nút "Bắt đầu Thanh toán (VietQR)"

### 4.2 Luồng thanh toán đầy đủ

1. Đăng nhập trước (nếu chưa): Click "Đăng nhập" → `demo@visualizationdsa.dev` / `Demo@2024`
2. Vào `/#/checkout` → Click "Bắt đầu Thanh toán (VietQR)"
3. **Kỳ vọng:** QR code hiển thị + thông tin chuyển khoản (MBBank, 99999999999, mã VDSA...)
4. Click nút "🧪 Mô phỏng: Xác nhận đã thanh toán"
5. **Kỳ vọng:** Màn hình "Thanh Toán Thành Công!" hiện ra

### 4.3 Premium Crown Badge

1. Sau khi thanh toán thành công, quay về trang chính
2. **Kỳ vọng:**
   - Header hiển thị 👑 crown phát sáng bên cạnh avatar
   - Avatar có viền vàng gradient
   - Tag "PRO" xuất hiện bên cạnh tên user

### 4.4 Sidebar có tab Premium

1. Kiểm tra sidebar bên trái
2. **Kỳ vọng:** Nhóm "Account" với tab "Premium" dẫn đến `/#/checkout`

### 4.5 Premium Gatekeeping

1. Đăng xuất (hoặc mở incognito window)
2. Nếu component PremiumGate được sử dụng, nội dung Premium sẽ bị blur với overlay "Nội dung Premium"
3. Click nút "Nâng cấp Premium" → redirect đến `/#/checkout`

---

## 5. Xử Lý Sự Cố

| Triệu chứng | Nguyên nhân | Cách khắc phục |
|---|---|---|
| QR code không hiển thị | URL vietqr.io bị chặn | Kiểm tra mạng, QR URL chỉ cần hiển thị đúng format |
| "ALREADY_PREMIUM" khi checkout | User đã Premium | Restart server để reset in-memory state |
| Crown badge không hiển thị | isPremium chưa sync | F5 reload, kiểm tra localStorage có `vdsa_stateless_user_id` |
| Payment lỗi "Không thể tạo hóa đơn" | Backend chưa chạy | Kiểm tra `curl http://localhost:5055/api/v1/concepts/payment/config` |

---

## 6. Danh Sách Kiểm Thử Tổng Kết

| STT | Test Case | Endpoint / Trang | Kỳ Vọng | Kết Quả |
|---|---|---|---|---|
| 1 | GET /concepts/payment/config | API | Giá + ngân hàng + features | ☐ |
| 2 | POST /concepts/payment/checkout | API | Order + QR URL + paymentCode | ☐ |
| 3 | GET /concepts/payment/orders/{id}/status | API | Status = Pending | ☐ |
| 4 | POST /concepts/payment/simulate-webhook | API | Status → Completed | ☐ |
| 5 | POST /concepts/payment/verify | API | Status → Completed + Premium | ☐ |
| 6 | GET /concepts/payment/premium-status | API | isPremium: true, plan: lifetime | ☐ |
| 7 | POST checkout khi đã Premium | API | 409 ALREADY_PREMIUM | ☐ |
| 8 | GET /concepts/payment/check-access (premium) | API | hasAccess varies by user/feature | ☐ |
| 9 | GET /concepts/payment/transactions | API | Transaction log entries | ☐ |
| 10 | GET order không tồn tại | API | 404 ORDER_NOT_FOUND | ☐ |
| 11 | Checkout page UI | Frontend | Marketing card + checkout button | ☐ |
| 12 | QR payment flow | Frontend | QR → simulate → success | ☐ |
| 13 | Premium crown badge | Frontend | 👑 + vàng + "PRO" tag | ☐ |
| 14 | Sidebar Premium tab | Frontend | "Account" group với "Premium" | ☐ |
| 15 | Premium gatekeeping | Frontend | Blur + overlay cho free users | ☐ |

---

> **Ghi chú:** Tất cả endpoint Payment trong Phase 7 là **stateless** — không cần PostgreSQL / SePay. Dữ liệu lưu in-memory (Singleton). Khởi động lại server sẽ reset toàn bộ hóa đơn và trạng thái Premium.
