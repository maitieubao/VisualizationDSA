# 🔌 Debugger API Specifications & JSON Schemas (Phase 2)

Tài liệu này đặc tả chi tiết cấu trúc JSON Schema của gói trạng thái gỡ lỗi (Debug Step Frame) trả về từ bộ dịch cô-ru-tin và giao thức nộp báo cáo đệ quy Call Stack lên máy chủ Backend.

---

## 1. Bản đặc tả JSON Schema Bước chạy Gỡ lỗi (Debug Step Frame Schema)

Mỗi bước chạy của debugger trả về gói thông tin trạng thái biến số và call stack khớp hoàn chỉnh cấu trúc JSON dưới đây:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "DebugStepFrame",
  "type": "OBJECT",
  "properties": {
    "lineNumber": {
      "type": "INTEGER",
      "minimum": 1
    },
    "arrayState": {
      "type": "ARRAY",
      "items": { "type": "INTEGER" },
      "description": "Trạng thái mảng số thô tại dòng dừng hiện tại"
    },
    "variables": {
      "type": "OBJECT",
      "description": "Tập giá trị các biến chạy trong tầm vực hoạt động"
    },
    "callStack": {
      "type": "ARRAY",
      "items": { "type": "STRING" },
      "description": "Danh sách ngăn xếp đệ quy gọi hàm lồng nhau"
    }
  },
  "required": ["lineNumber", "arrayState", "variables", "callStack"]
}
```

---

## 2. Mô hình tiếp nhận DTO C# ở Backend ASP.NET Core (.NET Core)

Khi sinh viên muốn nộp bài phân tích Call Stack đệ quy của thuật toán Quick Sort lên máy chủ để hệ thống chấm điểm bài tập:

```csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Core.DTOs
{
    public class RecursiveDebugReportDto
    {
        [Required]
        public string AlgorithmId { get; set; }

        [Required]
        [Range(1, 500, ErrorMessage = "Độ sâu đệ quy tối đa phải nằm trong biên an toàn 1 - 500.")]
        public int MaxRecursionDepthReached { get; set; }

        [Required]
        // Ghi lại tiến trình tên hàm đệ quy sâu nhất (ví dụ: quickSort -> partition)
        public List<string> DeepestCallStackFrame { get; set; } = new List<string>();

        [Required]
        [StringLength(1000, ErrorMessage = "Nhận xét phân tích đệ quy của sinh viên không quá 1000 ký tự.")]
        public string StudentTheoreticalAnalysis { get; set; }
    }
}
```

---

## 3. Quy chuẩn Kiểm duyệt phía Máy chủ (Server validation rules)

Khi nhận được `POST /api/v1/debug/reports`, máy chủ ASP.NET Core tiến hành:
1.  **Xác thực tính đệ quy:** Nếu `AlgorithmId` là `quick-sort`, mảng `DeepestCallStackFrame` bắt buộc phải chứa các lời gọi phân hoạch (ví dụ chứa `'partition'`).
2.  Nếu các mốc chỉ số khớp hoàn toàn lý thuyết, lưu trữ báo cáo và trả về mã phản hồi `HTTP 201 Created` cộng điểm thực hành xuất sắc cho sinh viên vào Supabase.
