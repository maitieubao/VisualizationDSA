# 🔌 Smart Quiz API Specifications & JSON Schemas (Phase 2)

Tài liệu này đặc tả chi tiết cấu trúc JSON Schema định dạng gói câu đố trắc nghiệm tương tác thông minh (Smart Interactive Quiz) và mô hình thiết lập DTO C# ASP.NET Core tải danh sách câu hỏi bám ngữ cảnh từ máy chủ.

---

## 1. Bản đặc tả JSON Schema Cấu hình Câu đố (InteractiveQuizQuestion Schema)

Siêu dữ liệu mô tả cấu hình một câu hỏi trắc nghiệm tương tác dừng VCR được định dạng nghiêm ngặt theo JSON Schema dưới đây:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SmartInteractiveQuizQuestion",
  "type": "OBJECT",
  "properties": {
    "quizId": {
      "type": "STRING"
    },
    "triggerStepIndex": {
      "type": "INTEGER",
      "minimum": 0
    },
    "questionType": {
      "type": "STRING",
      "enum": ["SVG_NODE_CLICK", "MONACO_LINE_CLICK", "MULTIPLE_CHOICE"]
    },
    "promptText": {
      "type": "STRING"
    },
    "correctAnswers": {
      "type": "ARRAY",
      "items": {
        "type": "STRING"
      }
    },
    "explanationMarkdown": {
      "type": "STRING"
    },
    "xpReward": {
      "type": "INTEGER",
      "minimum": 5
    }
  },
  "required": ["quizId", "triggerStepIndex", "questionType", "promptText", "correctAnswers", "explanationMarkdown", "xpReward"]
}
```

---

## 2. Mô hình tiếp nhận DTO C# ở Backend ASP.NET Core (.NET Core)

Lớp DTO chịu trách nhiệm nạp danh sách câu đố tương tác bám ngữ cảnh của giải thuật từ máy chủ C# ASP.NET Core:

```csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Core.DTOs
{
    public class AlgorithmQuizzesPayloadDto
    {
        [Required]
        public string AlgorithmId { get; set; }

        // Danh sách câu hỏi trắc nghiệm dừng timeline VCR
        [Required]
        public List<SmartQuizQuestionDto> Quizzes { get; set; }
    }

    public class SmartQuizQuestionDto
    {
        [Required]
        public string QuizId { get; set; }

        [Required]
        public int TriggerStepIndex { get; set; }

        // SVG_NODE_CLICK, MONACO_LINE_CLICK, MULTIPLE_CHOICE
        [Required]
        public string QuestionType { get; set; }

        [Required]
        public string PromptText { get; set; }

        // Danh sách các ID cột mảng, node cây hoặc số dòng Monaco đúng
        [Required]
        public List<string> CorrectAnswers { get; set; }

        [Required]
        public string ExplanationMarkdown { get; set; }

        [Required]
        public int XpReward { get; set; } = 30;
    }
}
```

---

## 3. Bản Đặc tả Endpoint API Tải Bộ Trắc Nghiệm Giải Thuật (Quizzes API)

*   **Tải Chuỗi Câu Đố Bám Ngữ Cảnh:**
    *   *Endpoint:* `GET /api/v1/algorithms/{algorithmId}/quizzes`
    *   *Phản hồi thành công (200 OK):*
        ```json
        {
          "algorithmId": "heapsort",
          "quizzes": [
            {
              "quizId": "heapsort-swap-8",
              "triggerStepIndex": 8,
              "questionType": "SVG_NODE_CLICK",
              "promptText": "Hai phần tử nào sẽ hoán đổi tiếp theo?",
              "correctAnswers": ["node-bar-2", "node-bar-5"],
              "explanationMarkdown": "Quy luật Heapify yêu cầu hoán đổi node cha...",
              "xpReward": 30
            }
          ]
        }
        ```
 Cấu trúc DTO C# an toàn, JSON Schema chặt chẽ và API nạp quiz bám ngữ cảnh mượt mà giúp toàn bộ cơ chế trắc nghiệm tương tác thông minh hoạt động vô cùng trơn tru, bảo mật và chịu tải lớn.
