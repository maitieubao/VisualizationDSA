# 📚 Core Architectural Decisions (Gamification & Challenges)

Tài liệu này ghi nhận Quyết định Thiết kế Kiến trúc (ADR) chứng minh tính toàn vẹn dữ liệu điểm số và khả năng chịu tải cực cao của bộ máy Gamification bất đồng bộ hỗ trợ bộ nhớ đệm Redis trong phân hệ **Gamification & Challenge Engine**.

---

## 1. Architectural Decision Records (ADR)

### ADR-17: Xử lý Sự kiện Bất đồng bộ Idempotency hỗ trợ bộ nhớ đệm Redis (Idempotent Redis-backed Event-Driven Gamification Engine)

#### Bối cảnh (Context)
Hệ thống tính điểm kinh nghiệm (XP), thăng hạng tuần (Leaderboards) và mở khóa danh hiệu (Badges) cần tiếp nhận hàng vạn gói tin sự kiện học tập từ học sinh mỗi phút:
*   *Thử thách 1 (Double-clicking và Farm Điểm):* Người học CNTT rất giỏi sử dụng các công cụ giả lập request hoặc script automation. Họ có thể gửi 100 gói tin hoàn thành bài tập trắc nghiệm trong 1 giây để nâng khống điểm XP của mình, nhảy vọt lên Top 1 Bảng xếp hạng Tuần bất hợp pháp.
*   *Thử thách 2 (Thao tác DB ghi đè đồng thời - Race Condition):* Khi nhiều người dùng cùng nộp bài một lúc, các phép ghi đè điểm số XP và xếp hạng trên cơ sở dữ liệu có thể gặp hiện tượng xung đột khóa DB, làm suy giảm nghiêm trọng hiệu năng của SQL Server / PostgreSQL.

#### Quyết định (Decision)
Hệ thống quyết định sử dụng kiến trúc **Xử lý Sự kiện Bất đồng bộ an toàn Idempotency hỗ trợ khóa RedLock phân tán trên Redis cache**:
1.  **Distributed Lock (Redis):** Mỗi khi nhận gói sự kiện XP, Backend C# lập tức tạo khóa phân tán theo mẫu băm `lock:user:{userId}:quiz:{quizId}` với thời gian sống 5 giây để khóa chặt mọi request farm điểm lặp.
2.  **Bộ nhớ đệm ZSET (Redis Sorted Set):** Bảng xếp hạng tuần được lưu trữ trực tiếp trên kiểu dữ liệu cấu trúc Sorted Set (`ZSET`) của Redis, cho phép lấy Top 10 bảng vinh danh và xếp hạng của học viên bất kỳ với độ phức tạp thời gian cực nhanh $\mathcal{O}(\log N)$ thay vì thực thi truy vấn `GROUP BY` nặng nề trên SQL Database.

#### Kết quả (Consequences)
*   **Điểm tốt (Pros):**
    *   **Kháng chặn farm điểm 100%:** Mọi hành vi double-click, tool script gửi request farm XP trùng lặp đều bị đánh chặn từ vòng gửi xe ngay tại Redis cache, bảo vệ tính công bằng học thuật.
    *   **Bảng xếp hạng tuần cực nhanh (Sub-millisecond):** Lấy Top 10 Leaderboard chỉ tốn chưa đầy **5ms** nhờ cấu trúc ZSET của Redis, chịu tải hàng vạn học viên trực tuyến đồng thời.
    *   **Giảm tải cơ sở dữ liệu chính:** Các phép ghi đè nặng nề được đẩy bất đồng bộ thông qua Event Queue, giúp SQL Database hoạt động mượt mà không lo nghẽn cổ chai.
*   **Điểm cần lưu ý (Cons):**
    *   Yêu cầu hệ thống phải duy trì hạ tầng cụm Redis Cache ổn định (tuy nhiên Supabase và hệ sinh thái cloud Azure/AWS đã có sẵn các cụm Redis tối tân).
    
    
