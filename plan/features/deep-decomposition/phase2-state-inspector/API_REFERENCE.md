# 🔌 State Inspector API Specifications & JSON Schemas (Phase 2)

Tài liệu này đặc tả chi tiết cấu trúc JSON Schema định dạng mô tả các khung ngăn xếp Call Stack ảo và mô hình thiết lập DTO C# ASP.NET Core nạp siêu dữ liệu trạng thái bộ nhớ từ máy chủ.

---

## 1. Bản đặc tả JSON Schema Cấu hình Call Stack (StackFrame Schema)

Siêu dữ liệu mô tả ngăn xếp xếp chồng và biến số động được định dạng nghiêm ngặt theo JSON Schema dưới đây:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "StateInspectorStackFrame",
  "type": "OBJECT",
  "properties": {
    "frameId": {
      "type": "STRING"
    },
    "functionName": {
      "type": "STRING"
    },
    "lineNumber": {
      "type": "INTEGER",
      "minimum": 1
    },
    "localVariables": {
      "type": "OBJECT",
      "additionalProperties": {
        "type": "OBJECT",
        "properties": {
          "value": {
            "type": ["STRING", "NUMBER", "BOOLEAN", "NULL"]
          },
          "heapAddress": {
            "type": "STRING"
          }
        },
        "required": ["value"]
      }
    },
    "isActive": {
      "type": "BOOLEAN"
    }
  },
  "required": ["frameId", "functionName", "lineNumber", "localVariables", "isActive"]
}
```

---

## 2. Mô hình tiếp nhận DTO C# ở Backend ASP.NET Core (.NET Core)

Lớp DTO chịu trách nhiệm nạp chuỗi biến số động của Call Stack ngăn xếp từ máy chủ C# ASP.NET Core:

```csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Core.DTOs
{
    public class ExecutionStatePayloadDto
    {
        [Required]
        public string SessionId { get; set; }

        [Required]
        public int StepIndex { get; set; }

        // Danh sách Call Stack Frame sắp xếp từ đáy lên đỉnh
        [Required]
        public List<StackFrameDto> StackFrames { get; set; }
    }

    public class StackFrameDto
    {
        [Required]
        public string FrameId { get; set; }

        [Required]
        public string FunctionName { get; set; }

        [Required]
        public int LineNumber { get; set; }

        // Từ điển biến cục bộ ở tầng đệm (Tên biến -> Trị số + địa chỉ Heap con trỏ)
        [Required]
        public Dictionary<string, VariableValueDto> LocalVariables { get; set; }

        [Required]
        public bool IsActive { get; set; }
    }

    public class VariableValueDto
    {
        [Required]
        public string Value { get; set; } // Giá trị biểu diễn dạng text chữ

        // Địa chỉ ô nhớ ảo dạng Hexa nếu là biến con trỏ chỉ Heap
        public string HeapAddress { get; set; }
    }
}
```

---

## 3. Bản Đặc tả Endpoint API Tải Trạng Thái RAM Giải Thuật (Execution API)

*   **Tải Biến Số Động Theo Bước VCR:**
    *   *Endpoint:* `GET /api/v1/debug/sessions/{sessionId}/steps/{stepIndex}/state`
    *   *Phản hồi thành công (200 OK):*
        ```json
        {
          "sessionId": "heapsort-debugging-123",
          "stepIndex": 8,
          "stackFrames": [
            {
              "frameId": "fib-3-frame",
              "functionName": "fib(3)",
              "lineNumber": 12,
              "localVariables": {
                "n": { "value": "3" },
                "ptr": { "value": "0x7ffd98", "heapAddress": "node-bar-2" }
              },
              "isActive": true
            }
          ]
        }
        ```
 Cấu trúc DTO C# an toàn, JSON Schema chặt chẽ và API nạp trạng thái RAM ảo bám sát thực tế gỡ lỗi của debugger giúp toàn bộ phân hệ vận hành vô cùng trơn tru, bảo mật và chịu tải lớn.
