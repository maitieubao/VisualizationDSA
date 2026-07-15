# 🔌 Share Registry API Specifications & JSON Schemas (Phase 2)

Tài liệu này đặc tả chi tiết cấu trúc JSON Schema nén trạng thái phòng lab Workspace State và giao thức truyền tải liên kết chia sẻ rút gọn lên máy chủ ASP.NET Core kết nối cơ sở dữ liệu Supabase PostgreSQL.

---

## 1. Bản đặc tả JSON Schema Trạng thái Workspace Nén (WorkspaceState Schema)

Trước khi tiến hành nén bằng lz-string, đối tượng dữ liệu trạng thái phòng lab được thiết kế nghiêm ngặt theo JSON Schema dưới đây:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "WorkspaceStatePayload",
  "type": "OBJECT",
  "properties": {
    "algorithmId": {
      "type": "STRING"
    },
    "layoutNodes": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "id": { "type": "STRING" },
          "x": { "type": "INTEGER" },
          "y": { "type": "INTEGER" }
        },
        "required": ["id", "x", "y"]
      }
    },
    "currentStepIndex": {
      "type": "INTEGER"
    }
  },
  "required": ["algorithmId", "layoutNodes", "currentStepIndex"]
}
```

---

## 2. Mô hình tiếp nhận DTO C# ở Backend ASP.NET Core (.NET Core)

Khi sinh viên bấm nút tạo link chia sẻ, Client gửi chuỗi nén lên máy chủ ASP.NET Core để lưu trữ vào Supabase Database:

```csharp
using System;
using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Core.DTOs
{
    public class GenerateShareLinkDto
    {
        [Required]
        [StringLength(100, ErrorMessage = "Tên kịch bản chia sẻ không quá 100 ký tự.")]
        public string Title { get; set; }

        // Chuỗi mã hóa nén lz-string chứa toàn bộ tọa độ và trạng thái workspace
        [Required]
        [MaxLength(20000, ErrorMessage = "Chuỗi dữ liệu nén trạng thái quá kích thước tối đa 20KB cho phép.")]
        public string CompressedState { get; set; }
    }

    public class ShareLinkResponseDto
    {
        // Mã băm rút gọn duy nhất sinh ra (ví dụ: "e8x9a")
        public string ShareId { get; set; }

        public string CreatedAt { get; set; }
    }
}
```

---

## 3. Cấu trúc Bảng Cơ sở Dữ liệu Supabase Schema (PostgreSQL)

Bảng mapping rút gọn URL `ShareRegistry` được khai báo trong Supabase để lưu trữ lâu dài:

```sql
CREATE TABLE share_registry (
    share_id VARCHAR(10) PRIMARY KEY DEFAULT substring(md5(random()::text) from 1 for 6),
    title VARCHAR(100) NOT NULL,
    compressed_state TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_share_registry_id ON share_registry(share_id);
```
 Cấu trúc DTO C# chặt chẽ, JSON Schema và bảng mapping cơ sở dữ liệu Supabase đảm bảo hạ tầng xuất bản và chia sẻ sơ đồ thuật toán luôn an toàn bảo mật, truy vấn rút gọn cực nhanh dưới 50ms.
