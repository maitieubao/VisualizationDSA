# 🔌 Quiz JSON Schema & API Specifications (Phase 1)

Tài liệu này đặc tả chi tiết giao diện thiết kế JSON Schema của gói câu hỏi trắc nghiệm đồng bộ và mô hình C# tiếp nhận xử lý ở Backend.

---

## 1. Bản đặc tả JSON Schema Câu hỏi Trắc nghiệm (Quiz Schema Definition)

Gói câu hỏi tương tác của mỗi bài học được phân phối từ Backend API khớp chuẩn tuyệt đối với cấu trúc định dạng dưới đây:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "AlgorithmInteractiveQuiz",
  "type": "OBJECT",
  "properties": {
    "questions": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "id": {
            "type": "STRING"
          },
          "type": {
            "type": "STRING",
            "enum": ["MULTIPLE_CHOICE", "TRUE_FALSE", "CANVAS_TARGET"]
          },
          "prompt": {
            "type": "STRING"
          },
          "options": {
            "type": "ARRAY",
            "items": {
              "type": "STRING"
            }
          },
          "correctOptionIndex": {
            "type": "INTEGER",
            "minimum": 0
          },
          "targetNodeId": {
            "type": "STRING",
            "description": "ID đỉnh Canvas đáp án đúng (cho CANVAS_TARGET)"
          },
          "explanation": {
            "type": "STRING",
            "description": "Lời giải thích định dạng Markdown lý thuyết"
          }
        },
        "required": ["id", "type", "prompt", "explanation"]
      }
    }
  },
  "required": ["questions"]
}
```

---

## 2. Mô hình Kiểm soát Dữ liệu C# ở Backend (.NET Core)

Bộ phận quản lý giáo án điện tử DSA tại Backend ASP.NET Core tiếp nhận và lưu trữ cấu trúc câu hỏi trắc nghiệm thông qua các mô hình lớp sau:

```csharp
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Core.DTOs
{
    public class QuizDatasetDto
    {
        [Required]
        [MinLength(1, ErrorMessage = "Bộ đề trắc nghiệm bắt buộc phải chứa ít nhất 1 câu hỏi.")]
        public List<QuizQuestionDto> Questions { get; set; } = new List<QuizQuestionDto>();
    }

    public class QuizQuestionDto
    {
        [Required]
        public string Id { get; set; }

        [Required]
        // Giá trị hợp lệ: "MULTIPLE_CHOICE", "TRUE_FALSE", "CANVAS_TARGET"
        public string Type { get; set; }

        [Required]
        [StringLength(500, ErrorMessage = "Nội dung câu hỏi không được vượt quá 500 ký tự.")]
        public string Prompt { get; set; }

        // Mảng các phương án lựa chọn (cho trắc nghiệm chữ)
        public List<string> Options { get; set; } = new List<string>();

        // Chỉ số đáp án đúng
        public int? CorrectOptionIndex { get; set; }

        // ID đỉnh tương tác Canvas đáp án đúng
        public string TargetNodeId { get; set; }

        [Required]
        [StringLength(2000, ErrorMessage = "Lời giải thích chi tiết không được vượt quá 2000 ký tự.")]
        public string Explanation { get; set; }
    }
}
```

---

## 3. Quy trình xác thực nghiệp vụ đầu vào ở Máy chủ (Server Validation Rules)

Khi người quản trị đăng tải câu hỏi qua HTTP POST, máy chủ kiểm duyệt chéo các luật biên:
1.  **Dạng CANVAS_TARGET:** Xác thực bắt buộc thuộc tính `TargetNodeId` phải tồn tại trong bộ lưu trữ mô hình đồ họa của bài học gốc để tránh tình trạng trỏ tới đỉnh ảo.
2.  **Dạng MULTIPLE_CHOICE:** Xác thực thuộc tính `CorrectOptionIndex` phải nhỏ hơn tổng số phần tử của mảng `Options` để ngăn chặn lỗi tràn biên chỉ số.
3.  Nếu không qua kiểm duyệt, máy chủ trả về mã phản hồi lỗi `HTTP 400 Bad Request` kèm chi tiết lý do sai sót.
