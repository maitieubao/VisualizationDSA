# 📚 Core Architectural Decisions (E-Lecture Mode)

Tài liệu này ghi nhận Quyết định Thiết kế Kiến trúc (ADR) chứng minh tại sao mô hình kịch bản động dựa trên JSON lại là nền tảng tối ưu cho việc xây dựng ứng dụng EdTech trực quan giải thuật.

---

## 1. Architectural Decision Records (ADR)

### ADR-04: Phát triển Kiến trúc Hướng Kịch bản (Script-driven Architecture) cho Bài giảng điện tử

#### Bối cảnh (Context)
Dự án VisualizationDSA có đối tượng phục vụ cốt lõi là sinh viên mới học giải thuật. Việc phát triển một công cụ tương tác tự do (Exploration Sandbox) tuy mạnh mẽ nhưng lại gây khó khăn rất lớn cho người mới bắt đầu vì họ không biết bắt đầu từ đâu. 

Khi xây dựng phân hệ E-Lecture để hướng dẫn từng bước:
*   Nếu chúng ta lập trình cứng (Hardcode) nội dung chữ và các điểm dừng hoạt ảnh trên giao diện frontend, mỗi lần giảng viên hoặc chuyên gia sư phạm (Instructional Designers) muốn điều chỉnh một câu giải thích, thêm hình vẽ minh họa hoặc thay đổi khung hình dừng thuật toán, lập trình viên frontend buộc phải chỉnh sửa code Vue, kiểm thử lại toàn bộ và đóng gói triển khai lại sản phẩm.
*   Điều này gây ra độ trễ (delay) cực kỳ lớn trong việc hoàn thiện nội dung và gây tốn kém nhân lực lập trình.

#### Quyết định (Decision)
Hệ thống quyết định tách biệt hoàn toàn **Dữ liệu Sư phạm (Pedagogical Content)** ra khỏi **Động cơ Hiển thị (Rendering Engine)**:
*   Toàn bộ cấu trúc slide bài học, chữ giải thích định dạng HTML/Markdown và các lệnh điều khiển hoạt ảnh (như `PLAY_UNTIL`, `RESET_CANVAS`) được định nghĩa trong các tập tin kịch bản JSON động.
*   Frontend Vue 3 chỉ đóng vai trò là một trình phát kịch bản (Script Player) trung lập: Đọc file JSON, hiển thị chữ lên thẻ bài giảng và dịch các lệnh hành động để điều phối `useAnimationStore`.

#### Kết quả (Consequences)
*   **Điểm tốt (Pros):**
    *   **Tốc độ sản xuất nội dung vượt trội:** Chuyên gia sư phạm có thể chỉnh sửa và ra mắt hàng trăm bài giảng trực quan mới chỉ bằng cách biên soạn file JSON tĩnh, tuyệt đối không cần lập trình viên frontend tham gia viết code.
    *   **Tải lượng nhận thức tối ưu:** Sinh viên được dẫn dắt có kiểm soát qua các slide ngắn, giúp khả năng tiếp thu kiến thức tăng cao rõ rệt.
    *   **Dễ bảo trì:** Mã nguồn của trình phát Slide độc lập hoàn toàn, dễ viết kiểm thử tự động cho các luồng Command.
*   **Điểm cần lưu ý (Cons):**
    *   Cần thiết lập quy chuẩn JSON Schema rất chặt chẽ để tránh lỗi biên dịch kịch bản lúc runtime ở frontend. Điều này đã được xử lý bằng cách khai báo Interfaces TypeScript rõ ràng và viết validator ở API Backend.
