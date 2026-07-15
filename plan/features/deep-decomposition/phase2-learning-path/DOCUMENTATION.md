# 📚 Core Architectural Decisions (Learning Path)

Tài liệu này ghi nhận Quyết định Thiết kế Kiến trúc (ADR) chứng minh tính ưu việt về hiệu năng phản hồi và khả năng mở rộng của bộ máy giải đồ thị tiên quyết chạy 100% Client-side trong phân hệ **Learning Path Skill Tree**.

---

## 1. Architectural Decision Records (ADR)

### ADR-18: Bộ giải Đồ thị Tiên quyết DAG cây kỹ năng chạy 100% ở Client-side (Client-side Prerequisite DAG Solver)

#### Bối cảnh (Context)
Sinh viên di chuyển qua các node ải học tập trên bản đồ RPG Map cần cảm giác mượt mà tức thời:
*   *Thử thách 1 (Độ trễ mạng):* Nếu mỗi khi học viên vượt qua bài quiz, hệ thống lại phải gửi API lên máy chủ backend, chờ backend chạy truy vấn cơ sở dữ liệu xác thực điều kiện rồi trả về danh sách các node được mở khóa tiếp theo, độ trễ sẽ mất ít nhất 300ms - 800ms. Điều này phá vỡ hoạt ảnh bừng sáng Neon nối laser của ải mới, gây đứt đoạn cảm xúc ăn mừng chiến thắng.
*   *Thử thách 2 (Nghẽn mạng ngoại tuyến):* Sinh viên có thể học tập trên xe bus, thư viện nơi sóng Wifi chập chờn. Việc phụ thuộc hoàn toàn vào API máy chủ làm bản đồ học tập bị tê liệt, không thể hiển thị trạng thái mở khóa node nếu mất kết nối Internet.

#### Quyết định (Decision)
Hệ thống quyết định sử dụng **Bộ giải đồ thị có hướng không chu trình (DAG) cây kỹ năng chạy 100% trực tiếp tại Client-side** thông qua lớp TypeScript `PrerequisiteDAGEngine`:
1.  **Duyệt Đồ thị Client-side:** Tải cấu hình metadata cây kỹ năng dạng JSON tĩnh một lần duy nhất lúc khởi động, thực thi duyệt mở khóa node hoàn toàn ở trình duyệt máy khách.
2.  **Đồng bộ LocalStorage trước, Supabase sau:** Lưu trữ lưu vết tiến độ học tập vào `localStorage` cục bộ, sau đó tự động đồng bộ đẩy lên database Supabase ở chế độ chạy ngầm (background sync).
3.  **Tách biệt UI và Logic:** Trạng thái bản đồ RPG là reactive Pinia state, tự động kích hoạt cập nhật giao diện vẽ laser SVG tức khắc khi có sự thay đổi.

#### Kết quả (Consequences)
*   **Điểm tốt (Pros):**
    *   **Phản hồi tức thì dưới 10ms (Instant-Feedback):** Cầu nối ánh sáng Neon bừng sáng và dải năng lượng cuộn trào sang ải mới ngay lập tức khi học viên bấm nút nộp bài quiz đạt điểm đỗ, mang lại trải nghiệm EdTech premium đỉnh cao.
    *   **Khả năng tự học ngoại tuyến (Offline-First):** Học sinh thoải mái học tập và mở khóa ải mới bình thường kể cả khi không có kết nối mạng ổn định.
    *   **Giảm tải backend tối đa:** Máy chủ backend chỉ đóng vai trò lưu trữ bản sao tiến trình (Snapshot), không cần gánh chịu CPU tính toán đồ thị DAG.
*   **Điểm cần lưu ý (Cons):**
    *   Cần lập trình logic giải đồ thị DAG đồng bộ 100% giống hệt nhau ở cả Client (TypeScript) và Backend (C#) để máy chủ có thể chạy cơ chế đối chiếu kiểm duyệt khi chấm điểm cuối khóa, tránh gian lận thay đổi biến LocalStorage phía client.
    
    
