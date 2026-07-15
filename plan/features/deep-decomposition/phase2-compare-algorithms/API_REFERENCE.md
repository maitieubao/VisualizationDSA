# 🔌 Comparison API Specifications & JSON Schemas (Phase 2)

Tài liệu này đặc tả chi tiết cấu trúc JSON Schema cấu hình phiên so sánh đối chiếu và giao thức API gửi nhận kết quả học tập từ Backend.

---

## 1. Bản đặc tả JSON Schema Phiên so sánh Giải thuật (Compare Session Schema)

Cấu hình phiên đối sánh cặp thuật toán từ Backend API được truyền tải theo cấu trúc chuẩn mực dưới đây:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "AlgorithmCompareSession",
  "type": "OBJECT",
  "properties": {
    "sessionId": {
      "type": "STRING"
    },
    "leftAlgorithm": {
      "type": "OBJECT",
      "properties": {
        "id": { "type": "STRING" },
        "name": { "type": "STRING" },
        "complexityTime": { "type": "STRING", "example": "O(n^2)" }
      },
      "required": ["id", "name", "complexityTime"]
    },
    "rightAlgorithm": {
      "type": "OBJECT",
      "properties": {
        "id": { "type": "STRING" },
        "name": { "type": "STRING" },
        "complexityTime": { "type": "STRING", "example": "O(n log n)" }
      },
      "required": ["id", "name", "complexityTime"]
    },
    "defaultInputArray": {
      "type": "ARRAY",
      "items": { "type": "INTEGER" },
      "description": "Mảng số ngẫu nhiên ban đầu tiêm chung cho cả 2 bên"
    }
  },
  "required": ["sessionId", "leftAlgorithm", "rightAlgorithm", "defaultInputArray"]
}
```

---

## 2. Mô hình tiếp nhận DTO C# ở Backend ASP.NET Core (.NET Core)

Khi sinh viên xuất sắc hoàn thành một thực nghiệm so sánh đối chiếu và muốn chia sẻ báo cáo phân tích hiệu năng lên mạng xã hội học thuật:

```csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Core.DTOs
{
    public class CompareReportDto
    {
        [Required]
        public string LeftAlgorithmId { get; set; }

        [Required]
        public string RightAlgorithmId { get; set; }

        [Required]
        [Range(1, 100000, ErrorMessage = "Số phép so sánh bên trái phải hợp lệ.")]
        public int LeftComparisonsCount { get; set; }

        [Required]
        [Range(1, 100000, ErrorMessage = "Số phép so sánh bên phải phải hợp lệ.")]
        public int RightComparisonsCount { get; set; }

        [Required]
        // Mảng số thô đã sử dụng để chạy thực nghiệm
        public List<int> SeedInputArray { get; set; } = new List<int>();

        [Required]
        [StringLength(500, ErrorMessage = "Báo cáo phân tích lý thuyết của sinh viên không quá 500 ký tự.")]
        public string StudentTheoreticalAnalysis { get; set; }
    }
}
```

---

## 3. Các quy tắc xác thực nghiệp vụ đầu vào ở Máy chủ (Server validation)

Khi nhận được `POST /api/v1/compare/reports`, máy chủ tiến hành kiểm duyệt:
1.  **Tính hợp lý chỉ số:** Phải cam kết `LeftComparisonsCount` và `RightComparisonsCount` phản ánh tương quan tiệm cận thực tế (ví dụ: Bubble Sort bắt buộc phải có số phép so sánh lớn hơn Quick Sort trên cùng một Seed mảng số thô đảo ngược). Nếu sai lệch phi lý thuyết, hệ thống trả về cảnh báo để sinh viên tự kiểm tra lại số liệu.
2.  Nếu hợp lệ, lưu trữ báo cáo và trả về mã phản hồi `HTTP 201 Created` kèm theo một đường dẫn liên kết tĩnh chia sẻ (Shareable link).
