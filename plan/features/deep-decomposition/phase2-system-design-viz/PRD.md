# 🚀 Product Requirements Document (PRD) - System Design Visualizer (Phase 2)

## 1. Tổng quan Nghiệp vụ (Overview)
Phân hệ **System Design & Distributed Architecture Visualizer** mang lại khả năng học tập trực quan tương tác vật lý cực đỉnh cho các khái niệm thiết kế hệ thống lớn phân tán (Load Balancer, API Gateway, Redis Cache, Database Replication, Message Queue). Sinh viên tự tay kéo thả sắp xếp mô hình hệ thống và chứng kiến dòng chảy dữ liệu là các hạt Neon phát sáng trôi nổi, mô phỏng sập nguồn failover tức khắc và đồng bộ replication lag DB trực quan.

---

## 2. Mục tiêu Nghiệp vụ (Goals)
*   **Trực quan hóa Dòng dữ liệu Phân tán (Distributed Data Flows):** Hiện thực dòng dữ liệu trừu tượng thành các hạt Neon phát sáng chạy dọc theo các nét nối mạng giữa các node.
*   **Thực nghiệm Sự cố Hệ thống (Failure & Failover Simulation):** Cho phép học viên bấm tắt nguồn một máy chủ, Load Balancer phát hiện lập tức tái định tuyến luồng tin sang máy chủ an toàn dưới 5ms.
*   **Thấu hiểu sâu sắc Replication Lag:** Minh họa trực quan quy trình ghi dữ liệu xuống Database Primary rồi đồng bộ hóa lan truyền sang Database Replica có độ trễ trễ mạng.
*   **Giao diện Kéo thả Tự do (Drag-and-Drop Editor):** Cho phép tự thiết kế cấu hình topology hệ thống và xuất sơ đồ kiến trúc mờ kính Glassmorphic sang trọng.

---

## 3. Các Tính năng trong Phạm vi MVP (Phase 2 MVP Scope)

### 3.1. Vibrant Interactive Canvas Kéo thả Nodes
*   Kéo thả các node kính mờ phong cách Glassmorphic: Client, Load Balancer, Web Server, Redis Cache, Primary DB, Replica DB.
*   Nối các node tự do bằng các đường dẫn SVG, tự co giãn bám sát vị trí khi di chuyển node.

### 3.2. Mưa Hạt Neon Dữ liệu (Neon Data Packets Flow)
*   HTTP Requests là hạt Neon lục Emerald trôi trượt dọc nét nối. Ghi DB sáng vàng Neon rực rỡ.
*   Thanh kéo xả lũ (Traffic generator slider) tạo mưa hạt Neon trôi nổi dồn dập biểu diễn tải cao.

### 3.3. Mô phỏng Sập nguồn & Tái định tuyến (Failover Simulation)
*   Nút bấm toggle máy chủ sang FAILED: card máy chủ chuyển đỏ rực tỏa khói bụi Canvas 2D.
*   Load Balancer tự động chuyển hướng 100% dòng hạt Neon sang máy chủ an toàn dự phòng lập tức dưới 5ms.

### 3.4. Database Replication Lag Visualizer
*   Đồng bộ ghi dữ liệu từ Primary DB sang Replica DB.
*   Thanh kéo cấu hình độ trễ trễ Sync (100ms - 5000ms) minh họa hiện tượng lệch dữ liệu (replication lag) trong thực tế.

---

## 4. Trải nghiệm người dùng (User Stories)
*   Là một sinh viên đang chuẩn bị thi System Design, tôi muốn tự tay kéo thả sắp xếp 1 Load Balancer và 2 Web Server A và B. Khi tôi bấm nút xả mưa gói tin, tôi muốn nhìn thấy 10 hạt Neon Green bay từ Client đến Load Balancer, và Load Balancer tự động chia 5 hạt sang Server A, 5 hạt sang Server B một cách cân bằng và mượt mà, giúp tôi hiểu sâu sắc giải thuật Round-Robin.
*   Là một kỹ sư đang thiết kế khả năng chống chịu lỗi, tôi muốn bấm tắt nguồn Server A để giả lập sập nguồn. Tôi muốn Server A lập tức đổi màu đỏ rực sập tối bốc khói, và toàn bộ hạt Neon đang bay dồn dập được Load Balancer uốn lượn đổi hướng 100% sang Server B an toàn ngay trước mắt tôi, minh họa trực quan tuyệt mỹ cho failover.
*   Là một lập trình viên học về DB Replication, tôi muốn khi ghi dữ liệu mới, hạt vàng rực rơi xuống Primary DB bừng sáng, rồi sau đúng 2 giây (Replication Lag tôi tự kéo cấu hình) hạt đó mới trôi dọc đường nối sang đồng bộ hóa bừng sáng ở Replica DB, giúp tôi khắc sâu bài học về tính nhất quán cuối cùng (eventual consistency).
