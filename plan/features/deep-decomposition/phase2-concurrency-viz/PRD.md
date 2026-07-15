# 🚀 Product Requirements Document (PRD) - Concurrency Visualizer (Phase 2)

## 1. Tổng quan Nghiệp vụ (Overview)
Phân hệ **Concurrency & Threading Visualizer** (Trực quan hóa Bất đồng bộ & Song song) của **VisualizationDSA** mang lại một môi trường học tập tương tác đột phá, hữu hình hóa các luồng xử lý vô hình bên trong hệ điều hành (Threads, Locks, Semaphores) thành các mô hình chuyển động đường ray (Thread Rails) dễ hiểu, giúp học viên thấu hiểu sâu sắc các bài toán tranh chấp tài nguyên và khóa nghẽn hệ thống.

---

## 2. Mục tiêu Nghiệp vụ (Goals)
*   **Hữu hình hóa khái niệm vô hình:** Biến các khái niệm trừu tượng như vùng găng (Critical Section), khóa loại trừ tương hỗ (Mutex), đèn báo hiệu (Semaphore) thành các cửa cổng ranh giới sáng Neon sắc nét.
*   **Mô phỏng chân thực Race Condition:** Cho phép học sinh bật/tắt Mutex để xem trực quan sự sai lệch giá trị của biến Counter dùng chung khi không có cơ chế bảo vệ luồng.
*   **Cảnh báo Deadlock thông minh:** Tự động phát hiện lỗi nghẽn khóa vòng tròn và lóe sáng màu Neon đỏ Rose rực rỡ quanh vùng bị nghẽn để học viên định vị trực tiếp nguyên nhân deadlock.
*   **Lựa chọn Giáo trình đa luồng kinh điển:** Tích hợp sẵn các bài toán kinh điển như *Nhà sản xuất - Người tiêu dùng (Producer-Consumer)* và *Triết gia ăn tối (Dining Philosophers)* dưới dạng hoạt ảnh sinh động.

---

## 3. Các Tính năng trong Phạm vi MVP (Phase 2 MVP Scope)

### 3.1. Đường ray luồng Thread Rails & Vùng Găng
*   Hiển thị danh sách các luồng dưới dạng các thanh ray ngang Slate mờ song hành.
*   Hộp chữ nhật vùng găng ở giữa hiển thị trực quan số lượng luồng đang được phép chui vào.

### 3.2. Công tắc Bật/Tắt Khóa (Mutex Lock Toggle)
*   Cho phép học viên bật công tắc Mutex để xem cơ chế đồng bộ luồng hoạt động xếp hàng tuần tự.
*   Tắt Mutex để hai luồng chạy chen lấn, sinh ra hiện tượng Race Condition trực quan làm sai lệch giá trị biến đếm Counter.

### 3.3. Đồ thị Khóa & Cảnh báo Deadlock
*   Hệ thống tự động phát hiện chu trình tắc nghẽn khép kín bằng thuật toán DFS đồ thị dưới 10ms.
*   Lóe đỏ Neon báo động và dừng hoạt ảnh tại mốc nghẽn để học sinh phân tích lỗi.

---

## 4. Trải nghiệm người dùng (User Stories)
*   Là một sinh viên đang vật lộn với lập trình hệ thống, tôi muốn nhìn thấy trực quan hai luồng "cướp" khóa của nhau thế nào để thấu hiểu tại sao Mutex Lock lại bảo vệ được tính toàn vẹn dữ liệu.
*   Là một người học, tôi muốn tự tay tạo ra lỗi Deadlock bằng cách lập trình sai thứ tự khóa trên Monaco Editor và nhìn thấy hệ thống vẽ đồ thị báo động đỏ rực rỡ vùng nghẽn, giúp tôi khắc cốt ghi tâm nguyên tắc tránh khóa lồng nhau.
*   Là một giảng viên, tôi muốn dùng hoạt ảnh "Triết gia ăn tối" của phân hệ để giải thích trực quan khái niệm starvation và deadlock cho hàng trăm sinh viên trong lớp học trực tuyến vô cùng lôi cuốn.
