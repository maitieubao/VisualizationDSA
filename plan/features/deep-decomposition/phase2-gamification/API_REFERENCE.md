# 🔌 Gamification API Specifications & JSON Schemas (Phase 2)

Tài liệu này đặc tả chi tiết cấu trúc JSON Schema gói tin sự kiện cộng điểm XP và mô hình thiết lập DTO C# ASP.NET Core kết nối hạ tầng lưu trữ Redis khóa phân tán.

---

## 1. Bản đặc tả JSON Schema Sự kiện Nhận Điểm XP (XPEarnedEvent Schema)

Mọi sự kiện cộng điểm XP gửi từ Iframe nhúng hoặc Workspace Lab lên máy chủ được định dạng nghiêm ngặt theo JSON Schema dưới đây:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "XPEarnedEvent",
  "type": "OBJECT",
  "properties": {
    "requestId": {
      "type": "STRING",
      "description": "Mã ID duy nhất để đảm bảo tính Idempotency tránh gửi lặp."
    },
    "userId": {
      "type": "STRING"
    },
    "quizId": {
      "type": "STRING"
    },
    "xpAmount": {
      "type": "INTEGER",
      "minimum": 10,
      "maximum": 500
    },
    "todayDateStr": {
      "type": "STRING",
      "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}$"
    }
  },
  "required": ["requestId", "userId", "quizId", "xpAmount", "todayDateStr"]
}
```

---

## 2. Mô hình tiếp nhận DTO C# ở Backend ASP.NET Core (.NET Core)

Lớp DTO tiếp nhận sự kiện XP tại máy chủ C# tích hợp xác thực dữ liệu nghiêm ngặt:

```csharp
using System;
using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Core.DTOs
{
    public class XPEarnedEventDto
    {
        // GUID duy nhất do Client sinh ra để thực thi cơ chế Idempotency
        [Required]
        public Guid RequestId { get; set; }

        [Required]
        public string UserId { get; set; }

        [Required]
        public string QuizId { get; set; }

        [Required]
        [Range(10, 500, ErrorMessage = "Điểm XP nhận được nằm trong khoảng từ 10 đến 500.")]
        public int XpAmount { get; set; }

        // Ngày học thực tế YYYY-MM-DD sau khi đã bù Grace Period 2:00 AM
        [Required]
        [RegularExpression(@"^\d{4}-\d{2}-\d{2}$", ErrorMessage = "Định dạng ngày phải là YYYY-MM-DD")]
        public string TodayDateStr { get; set; }
    }

    public class UserLeaderboardRankDto
    {
        public string UserId { get; set; }
        public string FullName { get; set; }
        public int WeeklyXP { get; set; }
        public int Rank { get; set; }
    }
}
```

---

## 3. Bản Đặc tả Endpoint API Vinh danh (Weekly Leaderboard Endpoints)

*   **Lấy Top 10 Bảng Xếp Hạng Tuần:**
    *   *Endpoint:* `GET /api/v1/gamification/leaderboard/weekly`
    *   *Phản hồi thành công (200 OK):*
        ```json
        [
          { "userId": "user-009", "fullName": "Nguyễn Hoàng Nam", "weeklyXP": 1450, "rank": 1 },
          { "userId": "user-012", "fullName": "Trần Tuấn Kiệt", "weeklyXP": 1250, "rank": 2 },
          { "userId": "user-005", "fullName": "Lê Hà Phương", "weeklyXP": 1100, "rank": 3 }
        ]
        ```
 Cấu trúc DTO C# an toàn, JSON Schema chặt chẽ và endpoint bảng xếp hạng tối ưu hóa ZSET cam kết hạ tầng xử lý điểm số luôn bảo mật cao, chính xác và chịu tải cực lớn.
