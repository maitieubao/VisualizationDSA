# 🚀 Product Requirements Document (PRD) - SOLID Principles Visualizer (Phase 2)

## 1. Tổng quan Nghiệp vụ (Overview)
Phân hệ **SOLID Principles Visualizer** mang đến một trải nghiệm trực quan hóa vật lý độc nhất vô nhị cho 5 nguyên lý thiết kế hướng đối tượng SOLID (SRP, OCP, LSP, ISP, DIP). Hệ thống chuyển hóa các lỗi thiết kế phần mềm trừu tượng và khô khan thành các hiện tượng vật lý sinh động (quá nhiệt bùng lửa, rạn nứt nổ tung laser, rẽ lối luồng sáng), giúp sinh viên xây dựng tư duy thiết kế kiến trúc phần mềm sạch sẽ và bền vững.

---

## 2. Mục tiêu Nghiệp vụ (Goals)
*   **Trực quan hóa sinh động tối đa (Thermal & Fracture Visuals):** Tạo ra tác động cảm xúc mạnh mẽ bằng hình ảnh nhiệt lượng bùng cháy lửa (SRP vi phạm) và rạn nứt vỡ tan nát laser kết nối (LSP vi phạm), giúp học sinh thấu hiểu sâu sắc tác hại của code bẩn.
*   **Thực nghiệm tái cấu trúc thời gian thực (Micro-Refactoring Loops):** Cho phép học viên bấm nút tái cấu trúc trực quan (Ví dụ: [ SPLIT ] thẻ lớp SRP, hoặc chèn Abstraction Interface DIP) nhìn thấy hệ thống tự động làm mát hoặc đảo chiều luồng sáng tức thì dưới 10ms.
*   **Học tập bám sát thực tế (Code-to-UML Sync):** Liên kết trực tiếp mã nguồn Monaco Editor với biểu đồ Class UML tương tác. Thay đổi code làm biến đổi kiến trúc UML bừng sáng tức khắc.
*   **Hiệu năng tinh tế mượt mà:** Bộ phát hạt lửa Canvas 2D và nứt vỡ SVG hoạt động 60 FPS cực nhẹ nhàng trên thiết bị máy khách.

---

## 3. Các Tính năng trong Phạm vi MVP (Phase 2 MVP Scope)

### 3.1. Trực quan SRP (Single Responsibility) - Quá nhiệt & Tỏa lửa
*   Thẻ lớp gánh > 2 nhiệm vụ vi phạm SRP sẽ bị "nhiệt hóa" - viền phát sáng đỏ rực, Canvas 2D phía sau bắn tia lửa nhiệt (thermal sparks sparks) dữ dội.
*   Nút bấm [ SPLIT CLASS ] cho phép vỡ thẻ lớp thành 3 thẻ đơn lẻ chuyên biệt, làm mát hệ thống, viền chuyển xanh Emerald êm dịu, dọn sạch tia lửa.

### 3.2. Trực quan LSP (Liskov Substitution) - Nứt vỡ Laser Kết nối
*   Lớp con ghi đè phương thức nhưng ném lỗi `NotImplementedException`.
*   Khi học viên kéo thả thay thế con trỏ lớp cha bằng đối tượng con vi phạm này, tia laser kết nối SVG bừng sáng rồi bị **rạn nứt vỡ vụn** (SVG Fracture overlay) thành ngàn mảnh vỡ rơi rụng kèm tiếng vỡ thủy tinh sắc mịn.

### 3.3. Trực quan DIP (Dependency Inversion) - Đảo chiều Luồng sáng
*   Luồng sáng chạy dọc đường nối thể hiện phụ thuộc.
*   Khi thiết kế sai (Class cao cấp phụ thuộc trực tiếp Class cấp thấp), luồng sáng đỏ chói chạy một chiều đâm thẳng.
*   Khi học viên chèn Interface trừu tượng ở giữa (Đúng DIP), luồng sáng đảo chiều hội tụ mượt mà về phía Interface màu lục Neon dịu mắt.

---

## 4. Trải nghiệm người dùng (User Stories)
*   Là một sinh viên hay viết class "God Object" ôm đồm đủ thứ việc, tôi muốn nhìn thấy thẻ lớp `UserManager` của mình bùng cháy hạt lửa nhiệt lượng đỏ rực chói mắt cảnh báo vi phạm SRP. Khi tôi nhấp nút [ SPLIT ], tôi muốn nhìn thấy thẻ lớp tách đôi êm ái thành `UserRepository` và `EmailSender`, ngọn lửa lập tức tắt ngúm làm dịu mát tâm hồn, giúp tôi ghi khắc sâu sắc nguyên lý Single Responsibility.
*   Là một học viên thực hành kế thừa lớp cha `Bird` sang lớp con `Ostrich` bị lỗi Liskov Substitution, tôi muốn khi chạy dòng code thay thế con trỏ gọi hàm `fly()`, tia laser SVG nối giữa hàm gọi và đối tượng Ostrich lập tức bị nứt vỡ rạn nứt toác đôi như thủy tinh vỡ vụn rơi xuống kèm tiếng bíp báo động, giúp tôi thấu hiểu tại sao không được vi phạm LSP.
*   Là một sinh viên đang nhầm lẫn luồng phụ thuộc DIP, tôi muốn nhìn thấy luồng sáng phát quang đỏ rực bắn thẳng từ lớp cao cấp xuống lớp bê tông cụ thể. Khi tôi bấm chèn Interface trừu tượng ở giữa, luồng sáng lập tức đảo chiều hội tụ về phía Interface lục Emerald lộng lẫy, minh họa trực quan tuyệt mỹ cho Dependency Inversion.
