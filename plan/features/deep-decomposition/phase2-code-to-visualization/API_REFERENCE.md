# 🔌 Live Compilation Outputs & API Specifications (Phase 2)

Tài liệu này đặc tả chi tiết cấu trúc JSON Schema của mảng vết thực thi (Execution Trace Frames) sinh ra từ bộ biên dịch động ở Client-side và giao thức lưu trữ thuật toán sáng tạo lên Cloud.

---

## 1. Bản đặc tả JSON Schema Vết thực thi Hoạt ảnh tự sinh (Execution Trace Schema)

Sau khi Web Worker chạy thành công tệp mã nguồn tự viết của sinh viên, nó trả về mảng các khung hình hoạt ảnh khớp hoàn chỉnh với cấu trúc dưới đây để nạp vào Canvas vẽ:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "GeneratedExecutionTrace",
  "type": "ARRAY",
  "items": {
    "type": "OBJECT",
    "properties": {
      "type": {
        "type": "STRING",
        "enum": ["COMPARE", "SWAP", "ACCESS"]
      },
      "indices": {
        "type": "ARRAY",
        "items": {
          "type": "INTEGER",
          "minimum": 0
        },
        "description": "Các chỉ số phần tử mảng số chịu tương tác"
      },
      "arrayState": {
        "type": "ARRAY",
        "items": {
          "type": "INTEGER"
        },
        "description": "Trạng thái mảng số thô tại bước hiện hành"
      },
      "variables": {
        "type": "OBJECT",
        "description": "Giá trị các biến chạy phụ trợ kèm theo"
      }
    },
    "required": ["type", "indices", "arrayState"]
  }
}
```

---

## 2. API Lưu trữ Thuật toán Tự viết lên Cloud (Algorithm Cloud Storage API)

Khi sinh viên viết được một hàm sắp xếp xuất sắc và muốn lưu trữ lại vào tài khoản học tập để giáo viên chấm điểm sáng tạo:

*   **Endpoint:** `/api/v1/algorithms/custom`
*   **Method:** `POST`
*   **Request Payload:**
    ```json
    {
      "algorithmName": "Bubble Sort Tối ưu dừng sớm",
      "baseAlgorithmId": "bubble-sort",
      "sourceCode": "function bubbleSort(arr) {\n  let n = arr.length;\n  let swapped;\n  for (let i = 0; i < n - 1; i++) {\n    swapped = false;\n    for (let j = 0; j < n - i - 1; j++) {\n      if (arr[j] > arr[j + 1]) {\n        let temp = arr[j];\n        arr[j] = arr[j + 1];\n        arr[j + 1] = temp;\n        swapped = true;\n      }\n    }\n    if (!swapped) break;\n  }\n}",
      "generatedFramesCount": 42
    }
    ```

*   **Response Payload (HTTP 201 Created):**
    ```json
    {
      "id": "custom_alg_98b50e2d",
      "algorithmName": "Bubble Sort Tối ưu dừng sớm",
      "savedAt": "2026-05-18T12:33:00Z",
      "shareUrl": "https://visualization-dsa.edu/share/custom_alg_98b50e2d"
    }
    ```

---

## 3. Giao thức Báo cáo Lỗi thực thi Sandbox (Execution Error Payload)

Nếu mã nguồn tự viết của sinh viên bị lỗi chia cho 0 hoặc lỗi vượt biên chỉ số mảng nghiêm trọng, Web Worker trả về cấu trúc lỗi chi tiết:

```json
{
  "success": false,
  "error": {
    "code": "EXECUTION_EXCEPTION",
    "message": "Không thể truy cập chỉ số phần tử ngoài biên của mảng: arr[12] tại dòng số 6.",
    "stack": "TypeError: Cannot read properties of undefined (reading '12') at bubbleSort (eval at runInSandboxedWorker...)"
  }
}
```
 Giao diện API và định dạng JSON Trace chặt chẽ giúp phân hệ hiển thị hoạt ảnh luôn đón nhận dữ liệu một cách chuẩn xác, bảo đảm trải nghiệm bài học hoàn hảo.
