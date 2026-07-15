# 📋 Hướng Dẫn Nghiệm Thu Chuyên Nghiệp: Global Error Handling, Toast & Skeleton Loaders

> **Phiên bản:** 1.0 — Ngày tạo: 2026-06-05
>
> **Mục đích:** Hướng dẫn đội ngũ kiểm thử xác nhận toàn bộ hệ thống Global Error Handling (middleware), Toast Notification, Skeleton Loading, và Page Transitions hoạt động đúng trên cả Backend lẫn Frontend.

---

## 1. Chuẩn Bị Môi Trường

### 1.1 Yêu cầu

- **Node.js** >= 18.x, **.NET SDK** >= 9.0
- **Trình duyệt** Chrome/Edge mới nhất (mở DevTools → Network tab)
- **Terminal** 2 tab (backend + frontend)

### 1.2 Khởi động server

```bash
# Tab 1: Backend
cd backend/src/WebApi
export ASPNETCORE_ENVIRONMENT=Development
dotnet run --urls "http://0.0.0.0:5050"

# Tab 2: Frontend
cd frontend
VITE_API_BASE_URL=http://localhost:5055 npx vite --host 0.0.0.0 --port 5173
```

---

## 2. Kiểm Thử Global Error Handling Middleware (Backend)

### 2.1 Health Check

```bash
curl -s http://localhost:5055/api/v1/diagnostics/health | python3 -m json.tool
```

**Kỳ vọng:**
```json
{
  "success": true,
  "message": "Hệ thống hoạt động bình thường.",
  "environment": "Development"
}
```

### 2.2 Mô phỏng lỗi 500 (Internal Server Error)

```bash
curl -s http://localhost:5055/api/v1/diagnostics/simulate-error?type=500 | python3 -m json.tool
```

**Kỳ vọng:**
```json
{
  "success": false,
  "message": "Lỗi hệ thống nội bộ không xác định (mô phỏng lỗi 500).",
  "errorType": "INTERNAL_SERVER_ERROR",
  "statusCode": 500,
  "traceId": "...",
  "path": "/api/v1/diagnostics/simulate-error",
  "timestamp": "2026-...",
  "detail": "Lỗi hệ thống nội bộ không xác định (mô phỏng lỗi 500).",
  "exception": "Exception",
  "stackTrace": ["..."]
}
```

### 2.3 Mô phỏng lỗi 400 (Validation Error)

```bash
curl -s http://localhost:5055/api/v1/diagnostics/simulate-error?type=400 | python3 -m json.tool
```

**Kỳ vọng:**
- `errorType: "VALIDATION_ERROR"`
- `statusCode: 400`
- `message`: chứa "mô phỏng lỗi 400"

### 2.4 Mô phỏng lỗi 401 (Unauthorized)

```bash
curl -s http://localhost:5055/api/v1/diagnostics/simulate-error?type=401 | python3 -m json.tool
```

**Kỳ vọng:**
- `errorType: "AUTHENTICATION_REQUIRED"`
- `statusCode: 401`

### 2.5 Mô phỏng lỗi 404 (Not Found)

```bash
curl -s http://localhost:5055/api/v1/diagnostics/simulate-error?type=404 | python3 -m json.tool
```

**Kỳ vọng:**
- `errorType: "RESOURCE_NOT_FOUND"`
- `statusCode: 404`

### 2.6 Mô phỏng lỗi 409 (Conflict)

```bash
curl -s http://localhost:5055/api/v1/diagnostics/simulate-error?type=409 | python3 -m json.tool
```

**Kỳ vọng:**
- `errorType: "OPERATION_CONFLICT"`
- `statusCode: 409`

### 2.7 Mô phỏng lỗi 501 (Not Implemented)

```bash
curl -s http://localhost:5055/api/v1/diagnostics/simulate-error?type=501 | python3 -m json.tool
```

**Kỳ vọng:**
- `errorType: "NOT_IMPLEMENTED"`
- `statusCode: 501`

### 2.8 Xác nhận format nhất quán

Tất cả lỗi PHẢI có đúng 7 trường chung:
- `success` (boolean, luôn `false`)
- `message` (string, tiếng Việt)
- `errorType` (string, CONSTANT_CASE)
- `statusCode` (integer)
- `traceId` (string)
- `path` (string)
- `timestamp` (ISO 8601)

Ở chế độ Development, thêm 3 trường debug:
- `detail`, `exception`, `stackTrace`

---

## 3. Kiểm Thử Toast Notification System (Frontend)

### 3.1 Cấu trúc hệ thống

- **Store:** `useToastStore` (Pinia) — quản lý danh sách toast
- **Component:** `ToastContainer.vue` — Teleport vào `<body>`, hiển thị góc phải trên
- **API:** `success()`, `error()`, `warning()`, `info()`, `handleApiError()`

### 3.2 Kiểm tra bằng Console trình duyệt

1. Mở `http://localhost:5173` → F12 → Console
2. Gọi toast thủ công:

```javascript
// Import Pinia store
const { useToastStore } = await import('/src/composables/useToast.ts');
const pinia = document.querySelector('#app').__vue_app__.config.globalProperties.$pinia;
const toastStore = useToastStore(pinia);

// Test 4 loại toast
toastStore.success('Đăng nhập thành công!');
toastStore.error('Không thể kết nối máy chủ.');
toastStore.warning('Phiên đăng nhập sắp hết hạn.');
toastStore.info('Hệ thống đang bảo trì lúc 23:00.');
```

### 3.3 Kỳ vọng giao diện

- Toast xuất hiện ở **góc phải trên** màn hình
- Mỗi toast có:
  - Icon tròn (✓ / ✕ / ⚠ / ℹ) với màu tương ứng
  - Tiêu đề đậm + nội dung
  - Nút đóng (×)
  - Thanh progress bar thu nhỏ dần
- Toast **tự biến mất** sau 4-6 giây
- Click vào toast để đóng ngay
- Hiệu ứng slide-in từ phải + slide-out ra phải
- Tối đa 5 toast đồng thời trên màn hình

---

## 4. Kiểm Thử Skeleton Loading (Frontend)

### 4.1 Algorithm Dashboard Skeleton

1. Mở `http://localhost:5173/#/sorting` (hoặc tab Algorithm bất kỳ)
2. **Tắt backend** hoặc throttle network (DevTools → Network → Slow 3G)
3. **Reload trang** (F5)
4. **Kỳ vọng:** Hiển thị 6 skeleton cards (shimmer effect) với:
   - Thanh tiêu đề giả (120px, 12px cao)
   - 6 card giả với shimmer animation (sóng sáng chạy từ trái sang phải)
   - Card giả có: header bar + 2 text lines + footer (button + circle)

### 4.2 Quiz Catalog Skeleton

1. Mở `http://localhost:5173/#/quiz`
2. Throttle network → reload
3. **Kỳ vọng:** 6 skeleton cards shimmer thay vì "Đang tải..."

### 4.3 Leaderboard Skeleton

1. Mở trang Gamification (nếu có leaderboard)
2. Throttle network → reload
3. **Kỳ vọng:** 10 entry skeleton rows (rank + avatar tròn + name bar + xp bar) với pulse animation

### 4.4 Xác nhận shimmer effect

- Animation: sóng sáng gradient chạy từ trái sang phải (`translateX(-100%)` → `translateX(100%)`)
- Chu kỳ: ~1.8 giây
- Background: `rgba(255, 255, 255, 0.04)` với shimmer gradient `rgba(255, 255, 255, 0.1)`

---

## 5. Kiểm Thử Page Transition (Frontend)

### 5.1 Chuyển trang

1. Click qua lại các tab trên sidebar: Sorting → Graph → OOP → SOLID → Patterns → DI → System Design
2. **Kỳ vọng:**
   - Trang cũ fade-out lên trên (translateY -4px, opacity 0) trong ~0.12s
   - Trang mới fade-in từ dưới (translateY 8px, opacity 0 → 1) trong ~0.2s
   - Chuyển đổi mượt mà, không nhấp nháy trắng

---

## 6. Xử Lý Sự Cố

| Triệu chứng | Nguyên nhân | Cách khắc phục |
|---|---|---|
| Toast không hiển thị | `ToastContainer` chưa mount | Kiểm tra `App.vue` có `<ToastContainer />` |
| Skeleton không hiện | Store `isLoading` quá nhanh | Throttle network trong DevTools |
| Lỗi 500 không trả JSON | Middleware chưa đăng ký | Kiểm tra `app.UseGlobalErrorHandling()` trong Program.cs |
| Page transition giật | CSS conflict | Kiểm tra `.page-fade-*` trong App.vue |

---

## 7. Danh Sách Kiểm Thử Tổng Kết

| STT | Test Case | Loại | Kỳ Vọng | Kết Quả |
|---|---|---|---|---|
| 1 | Health check endpoint | API | `success: true` | ☐ |
| 2 | Simulate error 500 | API | `INTERNAL_SERVER_ERROR` + JSON format | ☐ |
| 3 | Simulate error 400 | API | `VALIDATION_ERROR` | ☐ |
| 4 | Simulate error 401 | API | `AUTHENTICATION_REQUIRED` | ☐ |
| 5 | Simulate error 404 | API | `RESOURCE_NOT_FOUND` | ☐ |
| 6 | Simulate error 409 | API | `OPERATION_CONFLICT` | ☐ |
| 7 | Simulate error 501 | API | `NOT_IMPLEMENTED` | ☐ |
| 8 | JSON format nhất quán | API | 7 trường chung + 3 debug | ☐ |
| 9 | Toast success | UI | Icon ✓ xanh + auto-close 4s | ☐ |
| 10 | Toast error | UI | Icon ✕ đỏ + auto-close 6s | ☐ |
| 11 | Toast warning | UI | Icon ⚠ vàng + auto-close 5s | ☐ |
| 12 | Toast info | UI | Icon ℹ cyan + auto-close 4s | ☐ |
| 13 | Toast slide animation | UI | Slide-in phải → slide-out phải | ☐ |
| 14 | Toast max 5 đồng thời | UI | Toast cũ bị đẩy ra khi > 5 | ☐ |
| 15 | Algorithm Dashboard skeleton | UI | 6 shimmer cards | ☐ |
| 16 | Quiz catalog skeleton | UI | 6 shimmer cards | ☐ |
| 17 | Leaderboard skeleton | UI | 10 pulse rows | ☐ |
| 18 | Shimmer effect | UI | Gradient wave 1.8s cycle | ☐ |
| 19 | Page transition slide-up | UI | translateY 8px → 0 fade-in | ☐ |
| 20 | Page transition no flash | UI | Không nhấp nháy trắng | ☐ |

---

> **Ghi chú:** Diagnostics endpoint `/api/v1/diagnostics/simulate-error` chỉ dùng cho mục đích kiểm thử — tuyệt đối không bật ở Production. Backend middleware tự động ẩn stackTrace khi `ASPNETCORE_ENVIRONMENT != Development`.
