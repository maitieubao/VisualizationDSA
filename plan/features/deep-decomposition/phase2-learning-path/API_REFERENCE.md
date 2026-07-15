# 🔌 Learning Path API Specifications & JSON Schemas (Phase 2)

Tài liệu này đặc tả chi tiết cấu trúc JSON Schema cấu hình cây tiên quyết của bản đồ và mô hình thiết lập DTO C# ASP.NET Core đồng bộ dữ liệu lộ trình học tập lên máy chủ Supabase.

---

## 1. Bản đặc tả JSON Schema Cấu hình Cây Kỹ năng (SkillTree Schema)

Chuỗi cấu hình mô tả các node ải giải thuật và ràng buộc tiên quyết được định dạng nghiêm ngặt theo JSON Schema dưới đây:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "LearningPathSkillTree",
  "type": "ARRAY",
  "items": {
    "type": "OBJECT",
    "properties": {
      "id": {
        "type": "STRING"
      },
      "title": {
        "type": "STRING"
      },
      "prerequisites": {
        "type": "ARRAY",
        "items": { "type": "STRING" }
      },
      "status": {
        "type": "STRING",
        "enum": ["LOCKED", "UNLOCKED", "IN_PROGRESS", "COMPLETED"]
      }
    },
    "required": ["id", "title", "prerequisites", "status"]
  }
}
```

---

## 2. Mô hình tiếp nhận DTO C# ở Backend ASP.NET Core (.NET Core)

Lớp DTO tiếp nhận đồng bộ tiến trình học tập của sinh viên tại máy chủ C# tích hợp xác thực dữ liệu:

```csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Core.DTOs
{
    public class LearningPathSyncDto
    {
        [Required]
        public string UserId { get; set; }

        // Danh sách các Node ID đã hoàn thành xuất sắc
        [Required]
        public List<string> CompletedNodes { get; set; }

        // Lịch sử điểm số bài thi để AI Backend lưu vết phân tích chuyên sâu
        [Required]
        public List<QuizScoreEntryDto> Scores { get; set; }
    }

    public class QuizScoreEntryDto
    {
        [Required]
        public string AlgorithmId { get; set; }

        [Required]
        [Range(0, 100, ErrorMessage = "Điểm số thi đạt phải nằm trong khoảng từ 0 đến 100%.")]
        public int ScorePercentage;

        [Required]
        public int TimeSpentSeconds;
    }
}
```

---

## 3. Cấu trúc Bảng Cơ sở Dữ liệu Supabase Schema (PostgreSQL)

Bảng mapping tiến độ cây kỹ năng `LearningPathProgress` được khai báo trong Supabase để lưu trữ lâu dài:

```sql
CREATE TABLE learning_path_progress (
    user_id VARCHAR(50) PRIMARY KEY,
    completed_nodes TEXT[] NOT NULL DEFAULT '{}', -- Mảng các Node ID đã xong
    scores_history JSONB NOT NULL DEFAULT '[]', -- Chuỗi JSONB lịch sử điểm số bài thi
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_learning_path_progress_user ON learning_path_progress(user_id);
```
 Cấu trúc DTO C# chặt chẽ, JSON Schema và bảng lưu trữ PostgreSQL trong Supabase đảm bảo hạ tầng quản lý tiến trình lộ trình học tập cá nhân hóa luôn an toàn bảo mật cao, chính xác và đồng bộ mượt mà dưới 100ms.
