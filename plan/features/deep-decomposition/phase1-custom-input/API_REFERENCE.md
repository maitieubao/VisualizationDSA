# 🔌 API Reference & JSON Schema (Custom Input Generator)

Tài liệu này đặc tả chi tiết giao diện lập trình ứng dụng (API) và cấu trúc dữ liệu JSON liên thông cho phân hệ nhập liệu tùy biến **Custom Input Generator**.

---

## 1. Endpoint: Sinh mô phỏng từ dữ liệu tùy biến

*   **URL:** `/api/v1/algorithms/custom-execute`
*   **Method:** `POST`
*   **Content-Type:** `application/json`
*   **Accept:** `application/json`

---

## 2. Mô hình Yêu cầu gửi đi (Request JSON Schema)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "OBJECT",
  "properties": {
    "algorithmId": {
      "type": "STRING",
      "description": "Mã định danh của giải thuật cần chạy trực quan",
      "enum": ["bubble-sort", "selection-sort", "quick-sort", "merge-sort", "linear-search", "binary-search"]
    },
    "rawInput": {
      "type": "STRING",
      "description": "Chuỗi số nguyên nhập từ textarea thô, cách nhau bởi dấu phẩy",
      "example": "14, 25, -8, 9, 3"
    }
  },
  "required": ["algorithmId", "rawInput"]
}
```

### Ví dụ Body gửi đi hợp lệ:
```json
{
  "algorithmId": "bubble-sort",
  "rawInput": "14, 25, -8, 9, 3"
}
```

---

## 3. Đặc tả Cấu trúc Dữ liệu Phản hồi thành công (HTTP 200 OK)
Phản hồi thành công trả về cấu trúc tương thích hoàn toàn với `useAnimationStore` để nạp ngay vào trình phát hoạt họa:

```json
{
  "algorithmId": "bubble-sort",
  "pseudoCode": [
    "for i from 0 to N-1",
    "  for j from 0 to N-i-2",
    "    if A[j] > A[j+1]",
    "      swap(A[j], A[j+1])"
  ],
  "frames": [
    {
      "stepId": 1,
      "activeLine": 0,
      "explanation": "Bắt đầu khởi chạy giải thuật Bubble Sort.",
      "dataState": [14, 25, -8, 9, 3],
      "highlights": {
        "compare": [],
        "swap": [],
        "sorted": []
      }
    }
  ]
}
```

---

## 4. Đặc tả Mã lỗi Phản hồi (Error Response Contracts)

### 4.1. Lỗi Cú pháp Định dạng đầu vào (HTTP 400 Bad Request)
Trả về khi chuỗi nhập thô chứa ký tự lạ không hợp lệ, không phân tách đúng dấu phẩy:

```json
{
  "status": 400,
  "title": "Bad Request",
  "errorType": "INVALID_FORMAT",
  "message": "Định dạng dữ liệu không hợp lệ. Chuỗi đầu vào chứa ký tự lạ hoặc sai cấu trúc phân tách."
}
```

### 4.2. Lỗi Vượt quá Giới hạn Kích thước An toàn (HTTP 422 Unprocessable Entity)
Trả về khi chuỗi nhập đúng định dạng số nhưng có số phần tử vượt quá giới hạn an toàn quy định cho thuật toán đó:

```json
{
  "status": 422,
  "title": "Unprocessable Entity",
  "errorType": "SIZE_LIMIT_EXCEEDED",
  "message": "Kích thước mảng vượt quá giới hạn an toàn quy định của giải thuật bubble-sort.",
  "details": {
    "maxAllowedLimit": 50,
    "currentInputSize": 85
  }
}
```

### 4.3. Lỗi Thời gian chạy Giải thuật quá lâu (HTTP 504 Gateway Timeout)
Trả về khi thuật toán bị treo dòng lặp vô hạn ở Backend, kích hoạt cơ chế hủy tác vụ tự động:

```json
{
  "status": 504,
  "title": "Gateway Timeout",
  "errorType": "TIMEOUT_EXCEEDED",
  "message": "Thời gian xử lý giải thuật vượt quá giới hạn an toàn cho phép (2 giây). Luồng thực thi đã bị hủy bỏ để giải phóng CPU máy chủ."
}
```
