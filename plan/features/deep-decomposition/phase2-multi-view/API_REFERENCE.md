# 🔌 Multi-View API Specifications & JSON Schemas (Phase 2)

Tài liệu này đặc tả chi tiết cấu trúc JSON Schema danh sách các bước dòng thời gian của thuật toán và mô hình thiết lập DTO C# ASP.NET Core tải sẵn dữ liệu gỡ lỗi (Debugging Timeline Data) phục vụ chế độ xem song song.

---

## 1. Bản đặc tả JSON Schema Gói tin Bước Thời gian Giải thuật (TimelineStep Schema)

Dữ liệu mô tả từng bước chuyển đổi của thuật toán để đồng bộ hóa 3 View được định dạng nghiêm ngặt theo JSON Schema dưới đây:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "AlgorithmTimelineStep",
  "type": "OBJECT",
  "properties": {
    "stepIndex": {
      "type": "INTEGER",
      "minimum": 0
    },
    "activeLineNumber": {
      "type": "INTEGER",
      "minimum": 1
    },
    "activeFlowchartNodeId": {
      "type": "STRING"
    },
    "memoryStateSnapshot": {
      "type": "OBJECT",
      "description": "Ảnh chụp trạng thái bộ nhớ (ví dụ: mảng giá trị, vị trí pivot)."
    }
  },
  "required": ["stepIndex", "activeLineNumber", "activeFlowchartNodeId", "memoryStateSnapshot"]
}
```

---

## 2. Mô hình tiếp nhận DTO C# ở Backend ASP.NET Core (.NET Core)

Lớp DTO chịu trách nhiệm nạp danh sách các bước thời gian giải thuật phục vụ tua từ máy chủ C# ASP.NET Core:

```csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Core.DTOs
{
    public class AlgorithmTimelinePayloadDto
    {
        [Required]
        public string AlgorithmId { get; set; }

        [Required]
        public int TotalSteps { get; set; }

        // Mảng danh sách toàn bộ các bước thời gian nạp sẵn để tua dưới 1ms
        [Required]
        public List<TimelineStepDto> Steps { get; set; }
    }

    public class TimelineStepDto
    {
        [Required]
        public int StepIndex { get; set; }

        [Required]
        public int ActiveLineNumber { get; set; }

        [Required]
        public string ActiveFlowchartNodeId { get; set; }

        // Lưu trữ dạng string hóa JSON trạng thái bộ nhớ để Client tự phân tích
        [Required]
        public string MemoryStateSnapshotJson { get; set; }
    }
}
```

---

## 3. Bản Đặc tả Endpoint API Tải Dữ liệu Tua Dòng thời gian (Timeline Endpoints)

*   **Tải Chuỗi Bước Tua Giải Thuật:**
    *   *Endpoint:* `GET /api/v1/algorithms/{algorithmId}/timeline`
    *   *Phản hồi thành công (200 OK):*
        ```json
        {
          "algorithmId": "quicksort",
          "totalSteps": 3,
          "steps": [
            { "stepIndex": 0, "activeLineNumber": 1, "activeFlowchartNodeId": "start-node", "memoryStateSnapshotJson": "{\"array\":[4,2,3]}" },
            { "stepIndex": 1, "activeLineNumber": 3, "activeFlowchartNodeId": "pivot-node", "memoryStateSnapshotJson": "{\"array\":[4,2,3],\"pivot\":4}" }
          ]
        }
        ```
 Cấu trúc DTO C# an toàn, JSON Schema chặt chẽ và API nạp timeline nén giúp toàn bộ cơ chế tua thời gian đa giao diện hoạt động vô cùng nhẹ nhàng, bảo mật cao và chịu tải lớn.
