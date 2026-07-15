# 🔌 SOLID UML API Specifications & JSON Schemas (Phase 2)

Tài liệu này đặc tả chi tiết cấu trúc JSON Schema định dạng mô tả các Class Node UML tương tác (SOLID UML Class nodes) và mô hình thiết lập DTO C# ASP.NET Core nạp sơ đồ cấu trúc từ máy chủ.

---

## 1. Bản đặc tả JSON Schema Cấu hình Class Node UML (SOLID UML Class Schema)

Siêu dữ liệu mô tả sơ đồ lớp hướng đối tượng cấu hình bài học SOLID được định dạng nghiêm ngặt theo JSON Schema dưới đây:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SOLIDClassDefinition",
  "type": "OBJECT",
  "properties": {
    "nodeId": {
      "type": "STRING"
    },
    "className": {
      "type": "STRING"
    },
    "members": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "name": {
            "type": "STRING"
          },
          "type": {
            "type": "STRING",
            "enum": ["FIELD", "METHOD"]
          },
          "accessedFields": {
            "type": "ARRAY",
            "items": {
              "type": "STRING"
            }
          }
        },
        "required": ["name", "type", "accessedFields"]
      }
    }
  },
  "required": ["nodeId", "className", "members"]
}
```

---

## 2. Mô hình tiếp nhận DTO C# ở Backend ASP.NET Core (.NET Core)

Lớp DTO chịu trách nhiệm nạp sơ đồ lớp UML cấu hình bài học SOLID từ máy chủ C# ASP.NET Core:

```csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Core.DTOs
{
    public class SOLIDExercisePayloadDto
    {
        [Required]
        public string ExerciseId { get; set; }

        [Required]
        public string PrincipleType { get; set; } // SRP, OCP, LSP, ISP, DIP

        [Required]
        public List<UMLClassCardDto> ClassNodes { get; set; }
    }

    public class UMLClassCardDto
    {
        [Required]
        public string NodeId { get; set; }

        [Required]
        public string ClassName { get; set; }

        [Required]
        public List<UMLMemberDto> Members { get; set; }
    }

    public class UMLMemberDto
    {
        [Required]
        public string Name { get; set; }

        // FIELD or METHOD
        [Required]
        public string Type { get; set; }

        // Danh sách các field được method này đọc/ghi để tính LCOM4 Cohesion
        public List<string> AccessedFields { get; set; } = new List<string>();
    }
}
```

---

## 3. Bản Đặc tả Endpoint API Tải Bộ Bài Tập Thiết Kế SOLID (UML API)

*   **Tải Bài Tập Cấu Trúc SOLID:**
    *   *Endpoint:* `GET /api/v1/solid/exercises/{exerciseId}`
    *   *Phản hồi thành công (200 OK):*
        ```json
        {
          "exerciseId": "srp-usermanager-violation",
          "principleType": "SRP",
          "classNodes": [
            {
              "nodeId": "card-user-manager",
              "className": "UserManager",
              "members": [
                { "name": "dbConn", "type": "FIELD", "accessedFields": [] },
                { "name": "smtpServer", "type": "FIELD", "accessedFields": [] },
                { "name": "saveUser", "type": "METHOD", "accessedFields": ["dbConn"] },
                { "name": "sendEmail", "type": "METHOD", "accessedFields": ["smtpServer"] }
              ]
            }
          ]
        }
        ```
 Cấu trúc DTO C# an toàn, JSON Schema chặt chẽ và API nạp sơ đồ lớp SOLID bám sát thực tế thiết kế phần mềm giúp phân hệ vận hành vô cùng trơn tru, bảo mật và chịu tải lớn.
