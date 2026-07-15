# 🔌 Đặc Tả Giao Diện Lập Trình Ứng Dụng - Web API Specifications

Tài liệu này đặc tả chi tiết giao diện lập trình ứng dụng RESTful API kết nối giữa Frontend Vue 3 máy khách và Backend C# ASP.NET Core máy chủ trong dự án **VisualizationDSA**.

---

## 1. Kiến Trúc Giao Tiếp (Communication Architecture)
*   **Giao thức:** HTTPS RESTful API.
*   **Định dạng dữ liệu:** JSON (UTF-8).
*   **Ngưỡng phản hồi cam kết (SLA):** < 15ms cho các tác vụ lấy dữ liệu tĩnh, < 50ms cho ghi dữ liệu.
*   **Bảo mật:** Tiêu chuẩn **JWT Bearer Token** truyền qua Header HTTP `Authorization: Bearer <Token>`.
*   **Chống Spam & Gian Lận:** Sử dụng cơ chế `actionToken` ngẫu nhiên chỉ sử dụng một lần (Idempotency Key) cho tất cả các giao dịch cộng XP.

---

## 2. Danh Sách Các Cổng API (API Endpoints Directory)

### 2.1. Xác Thực & Phân Quyền (Authentication & Authorization)

#### 📥 API 1: Đăng ký tài khoản mới
*   **Đường dẫn:** `POST /api/v1/auth/register`
*   **Mô tả:** Đăng ký tài khoản học viên mới. Tự động kích hoạt Trigger khởi tạo bản ghi `user_progress` tương ứng trong PostgreSQL database.
*   **Đầu vào (Request Body):**
```json
{
  "email": "student@dsa.edu.vn",
  "password": "SecurePassword123!"
}
```
*   **Đầu ra (Response - 201 Created):**
```json
{
  "message": "User registered successfully.",
  "userId": "USR_8fdb06f8"
}
```

#### 📥 API 2: Đăng nhập tài khoản
*   **Đường dẫn:** `POST /api/v1/auth/login`
*   **Mô tả:** Kiểm duyệt thông tin đăng nhập và cấp mã khóa bảo mật JWT.
*   **Đầu vào (Request Body):**
```json
{
  "email": "student@dsa.edu.vn",
  "password": "SecurePassword123!"
}
```
*   **Đầu ra (Response - 200 OK):**
```json
{
  "userId": "USR_8fdb06f8",
  "email": "student@dsa.edu.vn",
  "role": "STUDENT",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU1JfOGZkYjA2ZjgiLCJlbWFpbCI6InN0dWRlbnRAZHNhLmVkdS52biIsInJvbGUiOiJTVFVERU5UIn0.signature",
  "expiresAt": "2026-05-25T10:00:00Z"
}
```

---

### 2.2. Quản lý Tiến trình & Tích lũy XP (User Progress & XP Tracking)

#### 📥 API 3: Cộng điểm XP và thăng hạng học viên
*   **Đường dẫn:** `POST /api/v1/progress/xp`
*   **Yêu cầu:** JWT Authorization Header.
*   **Mô tả:** Đồng bộ điểm XP kiếm được từ Canvas trắc nghiệm hoặc bài học lên máy chủ.
*   **Đầu vào (Request Body):**
```json
{
  "earnedXp": 200,
  "actionToken": "ACT-7fdb06f8-facb-4949-bb0e-ff4214c4b6d8"
}
```
*   **Đầu ra (Response - 200 OK):**
```json
{
  "userId": "USR_8fdb06f8",
  "totalXp": 1200,
  "currentLevel": 3,
  "leveledUp": true,
  "unlockedAchievements": [
    {
      "achievementId": "ACH_LEVEL_3",
      "name": "Chinh Phục Neon Cấp 3",
      "badgeIcon": "neon-level-3-glow"
    }
  ]
}
```

#### 📥 API 4: Lấy bảng xếp hạng học tập (Leaderboard)
*   **Đường dẫn:** `GET /api/v1/progress/leaderboard?limit=10`
*   **Mô tả:** Lấy danh sách học viên có số điểm XP cao nhất toàn cục phục vụ thi đua học tập. Được tăng tốc bằng index phủ và Redis caching.
*   **Đầu ra (Response - 200 OK):**
```json
{
  "leaderboard": [
    { "rank": 1, "username": "Học Viên A", "level": 15, "totalXp": 12500, "avatarUrl": "https://dsa.edu.vn/avatars/1.png" },
    { "rank": 2, "username": "Học Viên B", "level": 12, "totalXp": 9800, "avatarUrl": null },
    { "rank": 3, "username": "Học Viên C", "level": 10, "totalXp": 8200, "avatarUrl": "https://dsa.edu.vn/avatars/3.png" }
  ]
}
```

---

### 2.3. Nộp Bài Chấm Điểm Trắc Nghiệm (Quizzes Evaluation)

#### 📥 API 5: Chấm điểm bài trắc nghiệm tương tác
*   **Đường dẫn:** `POST /api/v1/quizzes/submit`
*   **Yêu cầu:** JWT Authorization Header.
*   **Mô tả:** Chấm điểm các câu trả lời trắc nghiệm, kiểm định mã nguồn Monaco AST và cập nhật cơ sở dữ liệu `user_submissions`.
*   **Request Body:**
```json
{
  "quizId": "QZ_BUBBLE_SORT",
  "answers": {
    "Q_BS_1": "O(N^2)",
    "Q_BS_2": "temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;"
  },
  "studentCode": "function bubbleSort(arr) { let temp = 0; for(let i=0; i<arr.length; i++) { if (arr[i] > arr[i+1]) { temp = arr[i]; arr[i] = arr[i+1]; arr[i+1] = temp; } } }"
}
```
*   **Response (200 OK):**
```json
{
  "submissionId": "SUB_9918231",
  "quizId": "QZ_BUBBLE_SORT",
  "score": 10,
  "maxScore": 10,
  "passed": true,
  "xpRewarded": 150,
  "codeCompliant": true
}
```

---

### 2.4. Khởi Tạo Mã Nhúng Widget (Embedding Widgets)

#### 📥 API 6: Lưu cấu hình Iframe Standalone Widget
*   **Đường dẫn:** `POST /api/v1/widgets`
*   **Yêu cầu:** JWT Authorization Header (Tùy chọn, cho phép tạo ẩn danh).
*   **Mô tả:** Lưu trữ cấu hình nhúng của học viên và sinh mã nhúng HTML iframe kèm URL độc lập.
*   **Request Body:**
```json
{
  "algorithmId": "dijkstra",
  "theme": "GLASS_SLATE_DARK",
  "width": 800,
  "height": 600,
  "allowInteraction": true,
  "customDataJson": {
    "nodes": [
      { "id": "A", "x": 100, "y": 150 },
      { "id": "B", "x": 300, "y": 250 }
    ],
    "edges": [
      { "from": "A", "to": "B", "weight": 5 }
    ]
  },
  "customCode": "const graph = new DijkstraGraph();"
}
```
*   **Response (21 Created):**
```json
{
  "widgetId": "WDG_882912",
  "embedUrl": "https://dsa.edu.vn/embed/WDG_882912",
  "iframeHtml": "<iframe src=\"https://dsa.edu.vn/embed/WDG_882912\" width=\"800\" height=\"600\" sandbox=\"allow-scripts allow-same-origin\"></iframe>"
}
```

#### 📥 API 7: Lấy thông tin cấu hình Widget độc lập (Standalone Widget Details)
*   **Đường dẫn:** `GET /api/v1/widgets/{id}`
*   **Mô tả:** Trả về cấu hình độc lập để hiển thị Iframe mờ kính không cần đăng nhập hệ thống chính.
*   **Response (200 OK):**
```json
{
  "widgetId": "WDG_882912",
  "algorithmId": "dijkstra",
  "theme": "GLASS_SLATE_DARK",
  "width": 800,
  "height": 600,
  "allowInteraction": true,
  "customDataJson": {
    "nodes": [
      { "id": "A", "x": 100, "y": 150 },
      { "id": "B", "x": 300, "y": 250 }
    ],
    "edges": [
      { "from": "A", "to": "B", "weight": 5 }
    ]
  },
  "customCode": "const graph = new DijkstraGraph();"
}
```

---

### 2.5. Sân Chơi Tự Vẽ (User Custom Playgrounds)

#### 📥 API 8: Lưu trữ Sân chơi cá nhân hóa
*   **Đường dẫn:** `POST /api/v1/playgrounds`
*   **Yêu cầu:** JWT Authorization Header.
*   **Mô tả:** Lưu trạng thái thiết kế sơ đồ, cấu trúc mảng hoặc đồ thị để học sinh tiếp tục thực hành sau này.
*   **Request Body:**
```json
{
  "name": "Đồ Thị Dijkstra Bài Tập Về Nhà 2",
  "algorithmType": "GRAPH_DIJKSTRA",
  "customDataJson": {
    "nodes": [
      { "id": "V1", "x": 120, "y": 90 },
      { "id": "V2", "x": 240, "y": 180 }
    ],
    "edges": [
      { "from": "V1", "to": "V2", "weight": 12 }
    ]
  },
  "customCode": "// Bắt đầu code giải thuật điền ở đây"
}
```
*   **Response (201 Created):**
```json
{
  "playgroundId": "PLG_239102",
  "message": "Playground saved successfully."
}
```

#### 📥 API 9: Lấy danh sách Sân chơi đã lưu của học viên
*   **Đường dẫn:** `GET /api/v1/playgrounds`
*   **Yêu cầu:** JWT Authorization Header.
*   **Response (200 OK):**
```json
{
  "playgrounds": [
    {
      "id": "PLG_239102",
      "name": "Đồ Thị Dijkstra Bài Tập Về Nhà 2",
      "algorithmType": "GRAPH_DIJKSTRA",
      "updatedAt": "2026-05-18T10:00:00Z"
    }
  ]
}
```

---

## 3. Quản Lý Lỗi Thống Nhất (RFC 7807 Unified Error Handling)

Hệ thống tuân thủ chặt chẽ tiêu chuẩn **RFC 7807 (Problem Details for HTTP APIs)** để trả lỗi nhất quán cho ứng dụng Vue Client dễ dàng bóc tách thông điệp:

### 3.1. Phản hồi Lỗi xác thực hoặc Đầu vào không hợp lệ (400 Bad Request)
```json
{
  "type": "https://dsa.edu.vn/errors/bad-request",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "detail": "The email field is not in correct format.",
  "instance": "/api/v1/auth/register",
  "errors": {
    "Email": [
      "The Email field is not a valid e-mail address."
    ]
  }
}
```

### 3.2. Lỗi token hết hạn hoặc sai mã (401 Unauthorized)
```json
{
  "type": "https://dsa.edu.vn/errors/unauthorized",
  "title": "Unauthorized access denied.",
  "status": 401,
  "detail": "JWT Token has expired. Please authenticate again.",
  "instance": "/api/v1/progress/xp"
}
```

Tài liệu này cam kết đặc tả đúng chuẩn API chuẩn công nghiệp, sẵn sàng cho việc phát triển đồng bộ Frontend-Backend.
