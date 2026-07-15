# 🔌 Preferences API & Local Storage Schema (Execution Control)

Tài liệu này đặc tả chi tiết giao diện lưu trữ cấu hình cá nhân (User Preferences) của người học cả ở Local Storage (Client-side) và đề xuất nâng cấp lưu trữ đồng bộ API Backend ở Phase 2.

---

## 1. Lưu trữ Cấu hình cục bộ (Local Storage Schema)

Để lưu trữ thói quen xem hoạt ảnh giải thuật của học viên (như tốc độ phát yêu thích, tự động chạy khi vào trang) mà không gây tải cho Database ở Phase 1, hệ thống lưu trữ dưới định dạng JSON tại trình duyệt client:

*   **Key định danh:** `dsa_preferences`

### Cấu trúc JSON Schema:
```json
{
  "dsa_preferences": {
    "defaultSpeed": 2.0,
    "autoPlayOnLoad": false,
    "themeMode": "dark",
    "enableHotkeys": true
  }
}
```

### Các thuộc tính chi tiết:
| Trường dữ liệu | Kiểu dữ liệu | Giá trị mặc định | Mô tả chi tiết |
|:---|:---|:---|:---|
| `defaultSpeed` | Float | `1.0` | Tốc độ phát mặc định ban đầu khi tải thuật toán (0.25, 0.5, 1.0, 2.0, 4.0). |
| `autoPlayOnLoad`| Boolean | `false` | Có tự động phát hoạt ảnh ngay khi người dùng mở trang thuật toán hay không. |
| `themeMode` | String | `"dark"` | Lựa chọn chủ đề hiển thị giao diện: `"dark"` (Slate tối) hoặc `"light"`. |
| `enableHotkeys` | Boolean | `true` | Bật/tắt khả năng điều phối nhanh giải thuật bằng phím tắt bàn phím toàn cục. |

---

## 2. API Backend Lưu trữ Cấu hình Cá nhân (Đề xuất Phase 2)

Khi nâng cấp lên hệ thống có đăng nhập tài khoản học viên ở Phase 2, cấu hình sẽ được lưu trực tiếp vào cơ sở dữ liệu để đồng bộ hóa thiết bị thông qua API:

*   **URL:** `/api/v1/users/preferences`
*   **Method:** `PUT`
*   **Headers:**
    *   `Content-Type: application/json`
    *   `Authorization: Bearer <JWT_TOKEN>`

### JSON Payload gửi đi (Request Body):
```json
{
  "defaultSpeed": 2.0,
  "autoPlayOnLoad": false,
  "enableHotkeys": true
}
```

### JSON Phản hồi thành công (HTTP 200 OK):
```json
{
  "status": 200,
  "message": "Cấu hình cá nhân đã được lưu trữ đồng bộ thành công vào hồ sơ học viên.",
  "updatedAt": "2026-05-18T12:15:30Z"
}
```

### Các mã lỗi phản hồi tiêu chuẩn:
*   **HTTP 401 Unauthorized:** Người dùng chưa đăng nhập hoặc token hết hạn.
*   **HTTP 400 Bad Request:** Giá trị tốc độ phát truyền lên vượt quá giới hạn cho phép (ví dụ truyền lên 10x).
