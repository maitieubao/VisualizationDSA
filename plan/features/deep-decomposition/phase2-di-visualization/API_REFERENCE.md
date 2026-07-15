# 🔌 DI API Specifications & JSON Schemas (Phase 2)

Tài liệu này đặc tả chi tiết cấu trúc JSON Schema đăng ký dịch vụ bộ chứa ảo IoC và giao thức truyền tải báo cáo phân giải Dependency Injection lên máy chủ ASP.NET Core.

---

## 1. Bản đặc tả JSON Schema Đăng ký dịch vụ (DI Service Registrations Schema)

Cấu trúc kịch bản cấu hình DI gửi từ Backend hoặc lưu trữ Client được định dạng nghiêm ngặt theo JSON Schema dưới đây:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "DIRegistrationsConfig",
  "type": "OBJECT",
  "properties": {
    "scenarioId": {
      "type": "STRING"
    },
    "title": {
      "type": "STRING"
    },
    "registrations": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "serviceType": { "type": "STRING" },
          "implementationType": { "type": "STRING" },
          "lifetime": { "type": "STRING", "enum": ["SINGLETON", "TRANSIENT"] },
          "dependencies": {
            "type": "ARRAY",
            "items": { "type": "STRING" }
          }
        },
        "required": ["serviceType", "implementationType", "lifetime", "dependencies"]
      }
    }
  },
  "required": ["scenarioId", "title", "registrations"]
}
```

---

## 2. Mô hình tiếp nhận DTO C# ở Backend ASP.NET Core (.NET Core)

Khi sinh viên tự thiết kế hệ thống đăng ký dịch vụ để vượt qua bài kiểm tra phân giải DI không bị Circular, nộp báo cáo kết quả lên máy chủ chấm điểm:

```csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Core.DTOs
{
    public class IoCResolutionReportDto
    {
        [Required]
        public string ScenarioId { get; set; }

        [Required]
        public bool IsCircularDependencyFound { get; set; }

        // Tổng số thực thể Singleton được sinh ra trong bộ nhớ
        [Required]
        [Range(0, 100, ErrorMessage = "Số lượng thực thể Singleton không hợp lệ.")]
        public int TotalSingletonInstancesCreated { get; set; }

        // Danh sách tiến trình các bước phân giải đệ quy (LOOKUP -> INJECT -> INSTANTIATE)
        public List<string> ResolutionStepsTrace { get; set; } = new List<string>();

        [Required]
        [StringLength(1000, ErrorMessage = "Nhận xét phân tích DI của sinh viên không quá 1000 ký tự.")]
        public string StudentResolutionAnalysis { get; set; }
    }
}
```

---

## 3. Quy chuẩn Kiểm duyệt phía Máy chủ (Server validation rules)

Khi tiếp nhận `POST /api/v1/ioc/reports`, máy chủ ASP.NET Core tiến hành:
1.  **Xác thực tính hợp lệ:** Nếu sinh viên nộp kịch bản Web API Standard, cờ `IsCircularDependencyFound` bắt buộc phải là `false`, và số thực thể Singleton được sinh ra phải khớp chuẩn xác là `2` (`SupabaseClient` và `SupabaseUserRepository`).
2.  Sau khi kiểm tra khớp dữ liệu, lưu trữ kết quả và trả về mã phản hồi thành công `HTTP 200 OK` cộng điểm rèn luyện xuất sắc vào hệ thống Supabase cho sinh viên.
