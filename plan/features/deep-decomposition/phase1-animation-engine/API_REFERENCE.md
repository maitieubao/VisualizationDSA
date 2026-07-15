# 🔌 API Reference & JSON Protocol Spec (Phase 1)

Tài liệu này đặc tả chi tiết giao tiếp truyền nhận dữ liệu giữa Client và Backend cho Animation Engine của dự án **VisualizationDSA**.

---

## 1. API: Sinh trạng thái mô phỏng thuật toán

*   **URL:** `/api/v1/algorithms/execute`
*   **Method:** `POST`
*   **Headers:**
    *   `Content-Type: application/json`
    *   `Accept-Encoding: gzip, br` (Yêu cầu nén phản hồi Brotli/Gzip)

---

## 2. Đặc tả Cấu trúc Yêu cầu (Request Payload Schema)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "OBJECT",
  "properties": {
    "algorithmId": {
      "type": "STRING",
      "description": "Mã định danh duy nhất của thuật toán",
      "enum": ["bubble-sort", "selection-sort", "quick-sort", "binary-search"]
    },
    "dataType": {
      "type": "STRING",
      "description": "Kiểu cấu trúc dữ liệu",
      "enum": ["array", "tree", "graph"]
    },
    "inputData": {
      "type": "ARRAY",
      "items": { "type": "INTEGER" },
      "description": "Mảng dữ liệu số nguyên đầu vào"
    }
  },
  "required": ["algorithmId", "dataType", "inputData"]
}
```

### Ví dụ JSON Yêu cầu gửi đi:
```json
{
  "algorithmId": "bubble-sort",
  "dataType": "array",
  "inputData": [5, 3, 8]
}
```

---

## 3. Đặc tả Cấu trúc Phản hồi (Response Payload Schema)

Bộ phản hồi trả về bao gồm định danh thuật toán, danh sách dòng mã giả sẽ hiển thị trên giao diện và chuỗi snapshot các bước chạy (`frames`).

### 3.1. Phân tích chi tiết các thuộc tính của `FrameDTO`
*   **`stepId` (integer):** Chỉ số định danh thứ tự bước chạy (1-indexed). Dùng làm nhãn hiển thị và tính toán vị trí thanh trượt timeline.
*   **`activeLine` (integer):** Dòng mã giả đang được thực thi ở bước này (0-indexed). Frontend sẽ làm nổi bật dòng lệnh này ở panel bên phải.
*   **`explanation` (string):** Chuỗi mô tả thuyết minh chi tiết bằng ngôn ngữ tự nhiên về hành động đang diễn ra ở bước hiện tại.
*   **`dataState` (array):** Bản sao mảng dữ liệu số nguyên tĩnh phản ánh trạng thái chính xác tại thời điểm này.
*   **`highlights` (object):** Các con trỏ tô màu làm nổi bật đồ họa Canvas:
    *   `compare` (array of integers): Các chỉ số index đang được so sánh (Màu vàng).
    *   `swap` (array of integers): Các chỉ số index đang được hoán vị (Màu đỏ).
    *   `sorted` (array of integers): Các chỉ số index đã nằm đúng vị trí hoàn tất sắp xếp (Màu xanh lá).

---

## 4. Ví dụ Thực tế về Dữ liệu Phản hồi (Response Payload Examples)

### 4.1. Ví dụ 1: Bubble Sort (Mảng đầu vào [5, 3, 8])
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
      "explanation": "Khởi tạo mảng đầu vào và chuẩn bị sắp xếp.",
      "dataState": [5, 3, 8],
      "highlights": {
        "compare": [],
        "swap": [],
        "sorted": []
      }
    },
    {
      "stepId": 2,
      "activeLine": 2,
      "explanation": "So sánh hai phần tử liền kề A[0] (5) và A[1] (3)",
      "dataState": [5, 3, 8],
      "highlights": {
        "compare": [0, 1],
        "swap": [],
        "sorted": []
      }
    },
    {
      "stepId": 3,
      "activeLine": 3,
      "explanation": "Hoán vị A[0] và A[1] vì 3 nhỏ hơn 5",
      "dataState": [3, 5, 8],
      "highlights": {
        "compare": [],
        "swap": [0, 1],
        "sorted": []
      }
    },
    {
      "stepId": 4,
      "activeLine": 2,
      "explanation": "So sánh hai phần tử liền kề A[1] (5) và A[2] (8)",
      "dataState": [3, 5, 8],
      "highlights": {
        "compare": [1, 2],
        "swap": [],
        "sorted": []
      }
    },
    {
      "stepId": 5,
      "activeLine": 0,
      "explanation": "Phần tử ở vị trí index 2 (8) đã được đưa về đúng vị trí sắp xếp.",
      "dataState": [3, 5, 8],
      "highlights": {
        "compare": [],
        "swap": [],
        "sorted": [2]
      }
    }
  ]
}
```

### 4.2. Ví dụ 2: Lỗi xác thực kích thước đầu vào quá giới hạn (HTTP 400 Bad Request)
```json
{
  "status": 400,
  "title": "Bad Request",
  "errorType": "MEMORY_LIMIT_EXCEEDED",
  "message": "Kích thước mảng đầu vào [85 phần tử] vượt quá giới hạn an toàn quy định cho thuật toán Bubble Sort O(N^2) (tối đa 50 phần tử)."
}
```

### 4.3. Ví dụ 3: Lỗi spam quá số lượt truy vấn (HTTP 429 Too Many Requests)
```json
{
  "status": 429,
  "title": "Too Many Requests",
  "errorType": "RATE_LIMIT_EXCEEDED",
  "message": "Bạn đã gửi quá nhiều yêu cầu trong thời gian ngắn. Vui lòng thử lại sau 45 giây."
}
```
