# 🔌 Design Patterns API Specifications & JSON Schemas (Phase 2)

Tài liệu này đặc tả chi tiết cấu trúc JSON Schema định dạng sơ đồ lớp UML tương tác động và giao thức truyền tải báo cáo phân tích khớp nối SOLID lên máy chủ ASP.NET Core.

---

## 1. Bản đặc tả JSON Schema Sơ đồ lớp UML (UML Diagram Class Schema)

Mỗi kịch bản mô hình thiết kế truyền tải từ Backend được mô tả hoàn chỉnh theo tài liệu JSON Schema dưới đây:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "UMLDiagramPayload",
  "type": "OBJECT",
  "properties": {
    "patternId": {
      "type": "STRING"
    },
    "title": {
      "type": "STRING"
    },
    "nodes": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "id": { "type": "STRING" },
          "name": { "type": "STRING" },
          "type": { "type": "STRING", "enum": ["class", "interface", "abstract"] },
          "x": { "type": "INTEGER" },
          "y": { "type": "INTEGER" },
          "width": { "type": "INTEGER" },
          "height": { "type": "INTEGER" }
        },
        "required": ["id", "name", "type", "x", "y", "width", "height"]
      }
    },
    "links": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "id": { "type": "STRING" },
          "sourceId": { "type": "STRING" },
          "targetId": { "type": "STRING" },
          "type": { "type": "STRING", "enum": ["inheritance", "realization", "dependency", "association"] }
        },
        "required": ["id", "sourceId", "targetId", "type"]
      }
    }
  },
  "required": ["patternId", "title", "nodes", "links"]
}
```

---

## 2. Mô hình tiếp nhận DTO C# ở Backend ASP.NET Core (.NET Core)

Khi sinh viên làm bài trắc nghiệm thiết kế phần mềm, tự tay chỉnh sơ đồ để thỏa mãn DIP nguyên lý và nộp kết quả lên máy chủ chấm điểm:

```csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Core.DTOs
{
    public class SOLIDDesignReportDto
    {
        [Required]
        public string PatternId { get; set; }

        [Required]
        public bool IsDIPAppliedSuccessfully { get; set; }

        // Chỉ số khớp nối tính toán được sau khi sinh viên tách lớp (ví dụ: 20%)
        [Required]
        [Range(0, 100, ErrorMessage = "Chỉ số coupling index phải từ 0 đến 100%.")]
        public int CouplingIndexResult { get; set; }

        [Required]
        [StringLength(1000, ErrorMessage = "Nhận xét phân tích SOLID của sinh viên không quá 1000 ký tự.")]
        public string StudentCouplingExplanation { get; set; }
    }
}
```

---

## 3. Quy chuẩn Kiểm duyệt phía Máy chủ (Server validation rules)

Khi tiếp nhận `POST /api/v1/patterns/reports`, máy chủ ASP.NET Core tiến hành:
1.  **Xác thực tính decoupled:** Nếu `PatternId` là `solid-dip` và cờ `IsDIPAppliedSuccessfully` là `true`, máy chủ xác minh chỉ số `CouplingIndexResult` có nhỏ hơn hoặc bằng 30% để chấm điểm đạt yêu cầu bài tập.
2.  Sau khi vượt qua kiểm duyệt, lưu trữ báo cáo và trả về mã thành công `HTTP 200 OK` đồng bộ trực tiếp lên cơ sở dữ liệu Supabase PostgreSQL.
