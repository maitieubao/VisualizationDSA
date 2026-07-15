# 📋 Hướng Dẫn Kiểm Thử Giai Đoạn 6: Authentication & User Management

> **Phiên bản:** 1.0 — Ngày tạo: 2026-06-05
>
> **Mục đích:** Hướng dẫn chi tiết cho đội ngũ kiểm thử thủ công xác nhận tính năng Đăng ký, Đăng nhập, Profile, và Session Persistence hoạt động đúng end-to-end.

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

**Kiểm tra:**
```bash
curl http://localhost:5055/api/v1/concepts/auth/demo-credentials
# Phải trả về: {"email":"demo@visualizationdsa.dev","password":"Demo@2024",...}
```

### 2.2 Frontend (Vue 3 + Vite)

```bash
cd frontend
VITE_API_BASE_URL=http://localhost:5055 npx vite --host 0.0.0.0 --port 5173
```

Mở trình duyệt: `http://localhost:5173`

---

## 3. Kiểm Thử Authentication API (curl)

### 3.1 Lấy thông tin tài khoản demo

```bash
curl -s http://localhost:5055/api/v1/concepts/auth/demo-credentials | python3 -m json.tool
```

**Kỳ vọng:** `email: "demo@visualizationdsa.dev"`, `password: "Demo@2024"`

### 3.2 Đăng nhập với tài khoản demo

```bash
curl -s -X POST http://localhost:5055/api/v1/concepts/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@visualizationdsa.dev","password":"Demo@2024"}' | python3 -m json.tool
```

**Kỳ vọng:**
- `accessToken`: chuỗi JWT-like (3 phần ngăn cách bởi dấu chấm)
- `refreshToken`: chuỗi 64 ký tự hex
- `expiresIn: 900` (15 phút)
- `user.username: "VisualizationDSA Student"`, `user.totalXP: 150`, `user.currentLevel: 2`

### 3.3 Đăng nhập sai mật khẩu

```bash
curl -s -X POST http://localhost:5055/api/v1/concepts/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@visualizationdsa.dev","password":"WrongPassword"}' | python3 -m json.tool
```

**Kỳ vọng:** HTTP 401 với `error: "LOGIN_FAILED"`, `message: "Email hoặc mật khẩu không đúng."`

### 3.4 Đăng ký tài khoản mới

```bash
curl -s -X POST http://localhost:5055/api/v1/concepts/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"TestUser","password":"Test@12345"}' | python3 -m json.tool
```

**Kỳ vọng:**
- `accessToken` + `refreshToken` hợp lệ
- `user.username: "TestUser"`, `user.totalXP: 0`, `user.currentLevel: 1`

### 3.5 Đăng ký trùng email

```bash
curl -s -X POST http://localhost:5055/api/v1/concepts/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@visualizationdsa.dev","username":"NewUser","password":"Test@12345"}' | python3 -m json.tool
```

**Kỳ vọng:** HTTP 400 với `error: "REGISTRATION_FAILED"`, `message: "Email này đã được sử dụng..."`

### 3.6 Đăng ký mật khẩu yếu

```bash
curl -s -X POST http://localhost:5055/api/v1/concepts/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"weak@example.com","username":"WeakUser","password":"123"}' | python3 -m json.tool
```

**Kỳ vọng:** HTTP 400 với `message: "Mật khẩu phải có ít nhất 8 ký tự."`

### 3.7 Refresh Token

```bash
# Lưu refreshToken từ bước 3.2 vào biến:
REFRESH_TOKEN="<paste refreshToken từ bước 3.2>"

curl -s -X POST http://localhost:5055/api/v1/concepts/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}" | python3 -m json.tool
```

**Kỳ vọng:** Trả về `accessToken` mới + `refreshToken` mới (token cũ bị vô hiệu hóa — rotation strategy)

### 3.8 Logout

```bash
curl -s -X POST http://localhost:5055/api/v1/concepts/auth/logout \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}"
```

**Kỳ vọng:** HTTP 204 No Content

---

## 4. Kiểm Thử User Profile API (curl)

### 4.1 Lấy profile demo user

```bash
curl -s http://localhost:5055/api/v1/concepts/auth/me | python3 -m json.tool
```

**Kỳ vọng:** `id: "demo-user-001"`, `username: "VisualizationDSA Student"`, `totalXP: 150`

### 4.2 Lấy profile theo userId

```bash
curl -s "http://localhost:5055/api/v1/concepts/auth/me?userId=demo-user-001" | python3 -m json.tool
```

**Kỳ vọng:** Cùng kết quả như 4.1

### 4.3 Lấy tiến trình học tập

```bash
curl -s http://localhost:5055/api/v1/concepts/auth/progress | python3 -m json.tool
```

**Kỳ vọng:**
- `totalXP: 150`, `currentLevel: 2`
- `xpToNextLevel: 150` (cần 300 XP cho Level 3, hiện có 150)
- `levelProgressPercent: 25` ((150-100)/(300-100) = 25%)
- `currentStreak: 3`, `badgesEarned: 1`

### 4.4 Cộng XP

```bash
curl -s -X POST http://localhost:5055/api/v1/concepts/auth/award-xp \
  -H "Content-Type: application/json" \
  -d '{"amount":200,"reason":"Hoàn thành module Sorting"}' | python3 -m json.tool
```

**Kỳ vọng:** `totalXP: 350` (150 + 200), `currentLevel: 3` (vượt ngưỡng 300 XP)

### 4.5 Cập nhật profile

```bash
curl -s -X PUT http://localhost:5055/api/v1/concepts/auth/profile \
  -H "Content-Type: application/json" \
  -d '{"username":"VisualizationDSA Pro Student"}' | python3 -m json.tool
```

**Kỳ vọng:** `username: "VisualizationDSA Pro Student"` (đã đổi)

### 4.6 User không tồn tại

```bash
curl -s "http://localhost:5055/api/v1/concepts/auth/me?userId=invalid-id" | python3 -m json.tool
```

**Kỳ vọng:** HTTP 404 với `error: "USER_NOT_FOUND"`

---

## 5. Kiểm Thử Giao Diện Frontend

### 5.1 Nút đăng nhập

1. Mở `http://localhost:5173`
2. Góc phải trên header: phải thấy nút **"Đăng nhập"** (vì chưa đăng nhập)
3. Click nút → Modal đăng nhập xuất hiện với overlay mờ

### 5.2 Đăng nhập demo

1. Trong modal, nhập:
   - Email: `demo@visualizationdsa.dev`
   - Password: `Demo@2024`
2. Click **"Đăng nhập"**
3. **Kỳ vọng:**
   - Modal đóng
   - Header hiển thị avatar chữ "A" + "VisualizationDSA Student" + "Lv.2 · 150 XP"
   - Nút đăng xuất (icon mũi tên) xuất hiện thay nút "Đăng nhập"

### 5.3 Session persistence (F5)

1. Sau khi đăng nhập thành công, nhấn F5 (reload trang)
2. **Kỳ vọng:** User vẫn đăng nhập (refresh token trong localStorage tự động khôi phục session)
3. Header vẫn hiển thị avatar + tên + XP

### 5.4 Đăng xuất

1. Click nút đăng xuất (icon mũi tên bên phải avatar)
2. **Kỳ vọng:**
   - Header quay về hiển thị nút "Đăng nhập"
   - Nhấn F5 → vẫn là guest (session đã bị xóa)

### 5.5 Đăng ký tài khoản mới

1. Click "Đăng nhập" → trong modal, click "Chưa có tài khoản? Đăng ký"
2. Nhập: Email `new@test.com`, Username `NewUser`, Password `NewPass@123`
3. Click "Đăng ký"
4. **Kỳ vọng:** Modal đóng, header hiển thị "N" avatar + "NewUser" + "Lv.1 · 0 XP"

### 5.6 Đăng nhập sai

1. Click "Đăng nhập" → nhập email đúng, mật khẩu sai
2. Click "Đăng nhập"
3. **Kỳ vọng:** Thông báo lỗi đỏ "Email hoặc mật khẩu không đúng." hiển thị trong modal

### 5.7 Demo credentials hiển thị

1. Trong modal đăng nhập, dưới cùng có section "Demo:"
2. **Kỳ vọng:** Hiển thị `demo@visualizationdsa.dev` / `Demo@2024` bằng font monospace

---

## 6. Xử Lý Sự Cố

| Triệu chứng | Nguyên nhân | Cách khắc phục |
|---|---|---|
| Modal không đóng sau login | API trả lỗi CORS | Set `ASPNETCORE_ENVIRONMENT=Development` |
| "Đăng nhập thất bại" dù nhập đúng | Backend chưa chạy hoặc sai port | Kiểm tra `curl http://localhost:5055/api/v1/concepts/auth/demo-credentials` |
| F5 mất session | localStorage bị xóa | Kiểm tra DevTools → Application → Local Storage → `vdsa_refresh_token` |
| Avatar không hiển thị | authStore chưa init | Kiểm tra `onMounted` trong App.vue gọi `statelessInit()` |

---

## 7. Danh Sách Kiểm Thử Tổng Kết

| STT | Test Case | Endpoint / Trang | Kỳ Vọng | Kết Quả |
|---|---|---|---|---|
| 1 | GET /concepts/auth/demo-credentials | API | email + password demo | ☐ |
| 2 | POST /concepts/auth/login (đúng) | API | accessToken + user | ☐ |
| 3 | POST /concepts/auth/login (sai) | API | 401 LOGIN_FAILED | ☐ |
| 4 | POST /concepts/auth/register (mới) | API | accessToken + user mới | ☐ |
| 5 | POST /concepts/auth/register (trùng) | API | 400 REGISTRATION_FAILED | ☐ |
| 6 | POST /concepts/auth/register (yếu) | API | 400 mật khẩu < 8 ký tự | ☐ |
| 7 | POST /concepts/auth/refresh | API | token mới, token cũ vô hiệu | ☐ |
| 8 | POST /concepts/auth/logout | API | 204 No Content | ☐ |
| 9 | GET /concepts/auth/me | API | demo-user profile | ☐ |
| 10 | GET /concepts/auth/progress | API | XP + level + streak | ☐ |
| 11 | POST /concepts/auth/award-xp | API | XP tăng, level up | ☐ |
| 12 | PUT /concepts/auth/profile | API | username đổi | ☐ |
| 13 | Login UI (modal) | Frontend | Modal mở, đăng nhập, đóng | ☐ |
| 14 | Session persistence (F5) | Frontend | Vẫn đăng nhập sau reload | ☐ |
| 15 | Logout UI | Frontend | Avatar biến mất, nút login hiện | ☐ |
| 16 | Register UI | Frontend | Tạo tài khoản mới, avatar mới | ☐ |
| 17 | Login sai UI | Frontend | Error message đỏ | ☐ |

---

> **Ghi chú:** Tất cả endpoint Auth trong Phase 6 là **stateless** — không cần PostgreSQL. Dữ liệu user lưu in-memory (Singleton). Khởi động lại server sẽ reset về trạng thái ban đầu (chỉ còn tài khoản demo).
