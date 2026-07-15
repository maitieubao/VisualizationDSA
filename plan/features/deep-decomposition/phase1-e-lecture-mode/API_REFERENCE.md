# 🔌 API Reference & JSON Schema Contracts (E-Lecture Mode)

Tài liệu này đặc tả chi tiết giao diện lập trình ứng dụng (API), kiểu dữ liệu JSON kịch bản bài học và các phản hồi lỗi tiêu chuẩn của phân hệ **E-Lecture Mode**.

---

## 1. API: Truy xuất kịch bản bài giảng điện tử theo thuật toán

*   **URL:** `/api/v1/lectures/{algorithmId}`
*   **Method:** `GET`
*   **Headers:**
    *   `Accept: application/json`

### JSON Phản hồi thành công (HTTP 200 OK):
```json
{
  "lectureId": "quick-sort-pivot-101",
  "algorithmId": "quick-sort",
  "title": "Hiểu sâu về khái niệm phần tử chốt (Pivot)",
  "slides": [
    {
      "slideId": 1,
      "type": "theory",
      "content": "<h3>Khái niệm Chốt (Pivot) là gì?</h3><p>Trong Quick Sort, <b>Pivot</b> đóng vai trò là ranh giới phân tách mảng thành hai nửa...</p>",
      "action": {
        "command": "RESET_CANVAS",
        "targetFrame": 0
      }
    },
    {
      "slideId": 2,
      "type": "guided-animation",
      "content": "<p>Hãy xem cách giải thuật lựa chọn phần tử cuối cùng làm chốt Pivot và phân tách mảng.</p>",
      "action": {
        "command": "PLAY_UNTIL",
        "targetFrame": 15
      }
    },
    {
      "slideId": 3,
      "type": "interactive-check",
      "content": "<p>Tuyệt vời! Giải thuật đã tạm dừng lại ở bước Pivot về đúng vị trí sắp xếp.</p>",
      "action": {
        "command": "PAUSE",
        "targetFrame": 15
      }
    }
  ]
}
```

---

## 2. Đặc tả Chi tiết các thuộc tính JSON Schema

| Trường dữ liệu | Kiểu dữ liệu | Thuộc tính bắt buộc | Mô tả chi tiết |
|:---|:---|:---|:---|
| `lectureId` | String | **Bắt buộc** | Định danh duy nhất của bài học kịch bản (ví dụ: `qs-pivot-101`). |
| `algorithmId` | String | **Bắt buộc** | Liên kết trực tiếp tới ID thuật toán tương ứng (ví dụ: `quick-sort`). |
| `title` | String | **Bắt buộc** | Tiêu đề của bài giảng điện tử (hiển thị trên header của Panel). |
| `slides` | Array | **Bắt buộc** | Danh sách chuỗi các Slide giáo án được sắp xếp theo trình tự tăng dần. |
| `slides[].slideId` | Integer | **Bắt buộc** | Số thứ tự định danh trang slide (bắt đầu từ 1). |
| `slides[].type` | String | **Bắt buộc** | Phân loại slide: `theory` (chỉ hiển thị chữ), `guided-animation` (chạy hoạt họa minh họa), `interactive-check` (làm bài kiểm tra nhỏ). |
| `slides[].content` | String | **Bắt buộc** | Nội dung chữ lý thuyết và thuyết minh sư phạm (hỗ trợ HTML/Markdown). |
| `slides[].action` | Object | **Bắt buộc** | Định nghĩa lệnh hoạt ảnh truyền tới Canvas. |
| `slides[].action.command` | String | **Bắt buộc** | Lệnh: `RESET_CANVAS` (đặt lại về đầu), `PLAY_UNTIL` (phát đến frame), `PAUSE` (tạm dừng). |
| `slides[].action.targetFrame`| Integer | **Bắt buộc** | Chỉ số khung hình đích của lệnh để dừng hoạt ảnh. |

---

## 3. Các phản hồi lỗi tiêu chuẩn (Standard Error Responses)

### 3.1. Lỗi không tìm thấy kịch bản bài học (HTTP 404 Not Found)
Trả về khi giảng viên chưa biên soạn kịch bản bài học cho giải thuật được yêu cầu:

```json
{
  "status": 404,
  "title": "Not Found",
  "errorType": "LECTURE_NOT_FOUND",
  "message": "Không tìm thấy kịch bản bài giảng điện tử cho thuật toán được chỉ định: 'radix-sort'."
}
```
