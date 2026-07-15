# 🔌 OOP Concepts API Specifications & JSON Schemas (Phase 2)

Tài liệu này đặc tả chi tiết cấu trúc JSON Schema định nghĩa cấu trúc lớp (Class Definition Metadata) và mô hình thiết lập DTO C# ASP.NET Core nạp sẵn sơ đồ lớp UML phục vụ không gian Polymorphism Sandbox.

---

## 1. Bản đặc tả JSON Schema Cấu hình Định nghĩa Lớp (ClassDefinition Schema)

Siêu dữ liệu mô tả các thuộc tính, phương thức và access modifier của một lớp được định dạng nghiêm ngặt theo JSON Schema dưới đây:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "OOPClassDefinition",
  "type": "OBJECT",
  "properties": {
    "className": {
      "type": "STRING"
    },
    "parentClass": {
      "type": "STRING",
      "description": "Tên lớp cha kế thừa (nếu có)."
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
          "accessModifier": {
            "type": "STRING",
            "enum": ["PUBLIC", "PROTECTED", "PRIVATE"]
          },
          "isOverridden": {
            "type": "BOOLEAN"
          }
        },
        "required": ["name", "type", "accessModifier"]
      }
    }
  },
  "required": ["className", "members"]
}
```

---

## 2. Mô hình tiếp nhận DTO C# ở Backend ASP.NET Core (.NET Core)

Lớp DTO chịu trách nhiệm nạp danh sách cấu hình sơ đồ lớp UML từ máy chủ C# ASP.NET Core:

```csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Core.DTOs
{
    public class OOPClassHierarchyPayloadDto
    {
        [Required]
        public string ProjectId { get; set; }

        [Required]
        public string HierarchyName { get; set; }

        // Mảng các định nghĩa lớp UML nạp vào Polymorphism Sandbox
        [Required]
        public List<UMLClassCardDto> Classes { get; set; }
    }

    public class UMLClassCardDto
    {
        [Required]
        public string ClassName { get; set; }

        public string ParentClass { get; set; }

        [Required]
        public List<UMLClassMemberDto> Members { get; set; }
    }

    public class UMLClassMemberDto
    {
        [Required]
        public string Name { get; set; }

        // FIELD đại diện cho thuộc tính, METHOD đại diện cho phương thức
        [Required]
        public string Type { get; set; } 

        // PUBLIC, PROTECTED, PRIVATE
        [Required]
        public string AccessModifier { get; set; }

        public bool IsOverridden { get; set; } = false;
    }
}
```

---

## 3. Bản Đặc tả Endpoint API Tải Sơ đồ Lớp UML Sandbox (UML Hierarchy Endpoints)

*   **Tải Chuỗi Sơ Đồ Lớp UML Thiết Lập Sẵn:**
    *   *Endpoint:* `GET /api/v1/oop-visualization/hierarchies/{hierarchyId}`
    *   *Phản hồi thành công (200 OK):*
        ```json
        {
          "projectId": "proj-999",
          "hierarchyName": "Geometric Shapes",
          "classes": [
            {
              "className": "Shape",
              "members": [
                { "name": "draw", "type": "METHOD", "accessModifier": "PUBLIC" }
              ]
            },
            {
              "className": "Circle",
              "parentClass": "Shape",
              "members": [
                { "name": "draw", "type": "METHOD", "accessModifier": "PUBLIC", "isOverridden": true }
              ]
            }
          ]
        }
        ```
 Cấu trúc DTO C# an toàn, JSON Schema chặt chẽ và API nạp UML sandbox nhẹ nhàng giúp toàn bộ cơ chế mô phỏng hướng đối tượng hoạt động vô cùng trơn tru, bảo mật và tương thích Responsive cao.
