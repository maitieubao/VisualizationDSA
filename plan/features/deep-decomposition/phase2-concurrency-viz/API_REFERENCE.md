# 🔌 Concurrency API Specifications & JSON Schemas (Phase 2)

Tài liệu này đặc tả chi tiết cấu trúc JSON Schema cấu hình kịch bản song song đa luồng và giao thức API gửi nhận kết quả báo cáo thực nghiệm bất đồng bộ từ máy chủ Backend.

---

## 1. Bản đặc tả JSON Schema Kịch bản Đa luồng (Concurrency Scenario Schema)

Cấu hình kịch bản đa luồng (ví dụ: Dining Philosophers) được truyền tải từ Backend dưới dạng cấu trúc JSON chuẩn dưới đây:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ConcurrencyScenarioConfig",
  "type": "OBJECT",
  "properties": {
    "scenarioId": {
      "type": "STRING"
    },
    "title": {
      "type": "STRING"
    },
    "threadsCount": {
      "type": "INTEGER",
      "minimum": 1,
      "maximum": 8
    },
    "initialLocks": {
      "type": "ARRAY",
      "items": {
        "type": "STRING"
      }
    },
    "pseudocode": {
      "type": "STRING",
      "description": "Đoạn mã giả đa luồng hiển thị trong Monaco Editor"
    }
  },
  "required": ["scenarioId", "title", "threadsCount", "initialLocks", "pseudocode"]
}
```

---

## 2. Mô hình tiếp nhận DTO C# ở Backend ASP.NET Core (.NET Core)

Khi sinh viên hoàn thành bài tập phân tích tranh chấp khóa và muốn nộp bài phân tích lên máy chủ chấm điểm:

```csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Core.DTOs
{
    public class ConcurrencyReportDto
    {
        [Required]
        public string ScenarioId { get; set; }

        [Required]
        public bool IsDeadlockedDetected { get; set; }

        // Danh sách các ID luồng bị nghẽn trong chu trình khép kín
        public List<string> DeadlockedThreadIds { get; set; } = new List<string>();

        [Required]
        [Range(0, 10000, ErrorMessage = "Giá trị Counter dùng chung không hợp lệ.")]
        public int SharedCounterValue { get; set; }

        [Required]
        [StringLength(1000, ErrorMessage = "Giải pháp khắc phục Deadlock của sinh viên không quá 1000 ký tự.")]
        public string StudentFixExplanation { get; set; }
    }
}
```

---

## 3. Quy chuẩn Kiểm duyệt phía Máy chủ (Server validation rules)

Khi tiếp nhận `POST /api/v1/concurrency/reports`, máy chủ ASP.NET Core tiến hành:
1.  **Xác thực tính Deadlock:** Kiểm tra nếu `ScenarioId` là kịch bản Deadlock Demo, cờ `IsDeadlockedDetected` bắt buộc phải là `true`, và mảng `DeadlockedThreadIds` phải chứa đúng cặp `["T1", "T2"]` tương ứng.
2.  **Đánh giá chấm điểm:** Nếu sinh viên đề xuất giải pháp đúng (ví dụ: thay đổi thứ tự khóa Acquire để phá vỡ chu trình chờ đợi vòng tròn), hệ thống tự động lưu điểm thực nghiệm xuất sắc vào Supabase PostgreSQL.
