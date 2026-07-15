# 🔌 VCR Playback API Specifications & JSON Schemas (Phase 2)

Tài liệu này đặc tả chi tiết cấu trúc JSON Schema định dạng mô tả các khung hình dòng thời gian giải thuật `PlaybackFrame` và mô hình thiết lập DTO C# ASP.NET Core nạp chuỗi phim hoạt ảnh từ máy chủ.

---

## 1. Bản đặc tả JSON Schema Cấu hình Playback Frames (PlaybackFrame Schema)

Siêu dữ liệu mô tả danh sách các bước hoạt ảnh của dòng thời gian gỡ lỗi được định dạng nghiêm ngặt theo JSON Schema dưới đây:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "VCRPlaybackFrameList",
  "type": "OBJECT",
  "properties": {
    "algorithmId": {
      "type": "STRING"
    },
    "totalSteps": {
      "type": "INTEGER",
      "minimum": 1
    },
    "frames": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "stepIndex": {
            "type": "INTEGER",
            "minimum": 0
          },
          "lineNumber": {
            "type": "INTEGER",
            "minimum": 1
          },
          "description": {
            "type": "STRING"
          },
          "canvasStateSnapshot": {
            "type": "OBJECT"
          }
        },
        "required": ["stepIndex", "lineNumber", "description", "canvasStateSnapshot"]
      }
    }
  },
  "required": ["algorithmId", "totalSteps", "frames"]
}
```

---

## 2. Mô hình tiếp nhận DTO C# ở Backend ASP.NET Core (.NET Core)

Lớp DTO chịu trách nhiệm nạp trọn bộ phim hoạt ảnh giải thuật từ máy chủ C# ASP.NET Core:

```csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Core.DTOs
{
    public class AlgorithmPlaybackPayloadDto
    {
        [Required]
        public string AlgorithmId { get; set; }

        [Required]
        public int TotalSteps { get; set; }

        [Required]
        public List<PlaybackFrameDto> Frames { get; set; }
    }

    public class PlaybackFrameDto
    {
        [Required]
        public int StepIndex { get; set; }

        [Required]
        public int LineNumber { get; set; }

        [Required]
        public string Description { get; set; }

        // Bản lưu trữ cấu hình mảng/cây ảo biểu diễn đồ họa
        [Required]
        public Dictionary<string, object> CanvasStateSnapshot { get; set; }
    }
}
```

---

## 3. Bản Đặc tả Endpoint API Tải Phim Giải Thuật (VCR Playback API)

*   **Tải danh sách các bước hoạt ảnh của thuật toán:**
    *   *Endpoint:* `GET /api/v1/algorithms/{algorithmId}/playback-frames`
    *   *Phản hồi thành công (200 OK):*
        ```json
        {
          "algorithmId": "quicksort-visualization",
          "totalSteps": 3,
          "frames": [
            {
              "stepIndex": 0,
              "lineNumber": 8,
              "description": "Bắt đầu phân hoạch Pivot = 5",
              "canvasStateSnapshot": {
                "array": [5, 2, 8, 4, 1],
                "pivotIndex": 0,
                "pointers": { "i": 1, "j": 4 }
              }
            }
          ]
        }
        ```
 Cấu trúc DTO C# an toàn, JSON Schema chặt chẽ và API nạp phim giải thuật bám sát thiết kế debugger giúp toàn bộ phân hệ vận hành vô cùng trơn tru, bảo mật và chịu tải lớn.
