# 🔌 Multilingual Code Schema & API Specifications (Phase 1)

Tài liệu này đặc tả chi tiết giao diện thiết kế JSON Schema phân phối giáo trình mã nguồn đa ngôn ngữ từ Backend và cấu trúc gói phản hồi lỗi (Error Response Payloads).

---

## 1. Bản đặc tả JSON Schema Giáo trình Mã nguồn (Multilingual Script Schema)

Khi Client-side tải nội dung học thuật cho một thuật toán chỉ định (ví dụ: `/api/v1/algorithms/bubble-sort/script`), máy chủ Backend trả về gói tài nguyên đa ngôn ngữ khớp hoàn chỉnh với cấu trúc dưới đây.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "AlgorithmMultilingualScript",
  "type": "OBJECT",
  "properties": {
    "algorithmId": {
      "type": "STRING",
      "description": "Định danh duy nhất của thuật toán (ví dụ: bubble-sort, dijkstra)"
    },
    "languages": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "language": {
            "type": "STRING",
            "enum": ["cpp", "java", "python", "javascript"]
          },
          "lines": {
            "type": "ARRAY",
            "items": {
              "type": "OBJECT",
              "properties": {
                "lineNumber": {
                  "type": "INTEGER",
                  "minimum": 1
                },
                "text": {
                  "type": "STRING"
                },
                "logicalId": {
                  "type": "STRING",
                  "description": "Neo liên kết dòng logic chéo ngôn ngữ"
                }
              },
              "required": ["lineNumber", "text", "logicalId"]
            }
          }
        },
        "required": ["language", "lines"]
      }
    }
  },
  "required": ["algorithmId", "languages"]
}
```

---

## 2. Mô hình Kiểm soát Dữ liệu Đầu vào C# ở Backend (.NET Core)

Bộ phận nạp giáo trình kiểm tra tính toàn vẹn cú pháp của các dòng mã trước khi lưu trữ vào Cơ sở Dữ liệu Supabase PostgreSQL:

```csharp
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Core.DTOs
{
    public class MultilingualScriptDto
    {
        [Required]
        [StringLength(50, ErrorMessage = "AlgorithmId không được vượt quá 50 ký tự.")]
        public string AlgorithmId { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "Phải cung cấp ít nhất mã nguồn của một ngôn ngữ lập trình.")]
        public List<LanguageScriptDto> Languages { get; set; } = new List<LanguageScriptDto>();
    }

    public class LanguageScriptDto
    {
        [Required]
        // Giá trị hợp lệ: "cpp", "java", "python", "javascript"
        public string Language { get; set; }

        [Required]
        public List<CodeLineDto> Lines { get; set; } = new List<CodeLineDto>();
    }

    public class CodeLineDto
    {
        [Required]
        [Range(1, 1000, ErrorMessage = "Số dòng vật lý phải dương và nhỏ hơn 1000.")]
        public int LineNumber { get; set; }

        [Required]
        public string Text { get; set; }

        [Required]
        // Neo dòng logic (ví dụ: "SWAP_STEP")
        public string LogicalId { get; set; }
    }
}
```

---

## 3. Các quy tắc Phản hồi Lỗi Hệ thống (Validation Errors Payload)

Nếu người quản trị đăng tải tệp giáo trình mã nguồn bị trùng lặp số dòng vật lý hoặc khai báo thiếu mã định danh `logicalId` thiết yếu, API trả về mã phản hồi lỗi `HTTP 422 Unprocessable Entity`:

```json
{
  "status": 422,
  "error": "Unprocessable Entity",
  "message": "Phát hiện lỗi kiểm thử dữ liệu giáo trình thuật toán.",
  "errors": [
    {
      "field": "Languages[0].Lines[4].LineNumber",
      "reason": "Số dòng vật lý 5 bị khai báo trùng lặp trong cấu trúc C++."
    },
    {
      "field": "Languages[1].Lines[2].LogicalId",
      "reason": "Mã định danh dòng logic (logicalId) không được phép bỏ trống."
    }
  ]
}
```
 Quy chuẩn giao tiếp API chặt chẽ này đảm bảo phân hệ hiển thị ở giao diện học viên luôn ổn định mượt mà, không xảy ra các tình huống lệch dòng hiển thị hay lỗi biên dịch phía Client.
