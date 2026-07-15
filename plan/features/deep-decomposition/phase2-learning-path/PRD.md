# 🚀 Product Requirements Document (PRD) - Learning Path Skill Tree (Phase 2)

## 1. Tổng quan Nghiệp vụ (Overview)
Phân hệ **Learning Path Skill Tree** (Lộ trình Học tập Cá nhân hóa) mang đến cho sinh viên chương trình đào tạo thuật toán trực quan dưới dạng bản đồ phiêu lưu RPG (RPG Quest Map). Từng chương giải thuật được biểu diễn bằng một "Ải môn" kết nối với nhau qua cầu nối ánh sáng tiên quyết, kích thích tính tò mò và lộ trình tự học của học sinh.

---

## 2. Mục tiêu Nghiệp vụ (Goals)
*   **Hệ thống hóa chương trình đào tạo trực quan (Structure):** Bản đồ hóa mối quan hệ tiên quyết giữa các thuật toán, giúp sinh viên hiểu rõ tại sao cần học cơ bản trước khi sang nâng cao.
*   **Gây ấn tượng bằng thiết kế RPG (Engagement):** Ứng dụng các nguyên lý thiết kế game nhập vai với các node ải phát sáng Neon, cầu nối ánh sáng cuộn trào dòng năng lượng cực kỳ lôi cuốn.
*   **Gợi ý cá nhân hóa thông minh (AI Guidance):** Phân tích hiệu suất học tập, điểm số bài thi để đề xuất ải học tối ưu tiếp theo cho từng sinh viên, hỗ trợ học tập cá nhân hóa.
*   **Tương thích Responsive mượt mà:** Bản đồ hoạt động trơn tru trên cả máy tính, máy tính bảng và điện thoại di động.

---

## 3. Các Tính năng trong Phạm vi MVP (Phase 2 MVP Scope)

### 3.1. Bản đồ Kỹ năng RPG Map (Skill Tree Layout)
*   Giao diện lưới bản đồ mờ ảo Glassmorphic sang trọng.
*   Các node ải phát sáng 3 trạng thái: Đã xong (Emerald), Đang học (Cyan), Bị khóa (Slate).
*   Đường cầu nối Laser SVG hiển thị hoạt ảnh dòng chảy năng lượng.

### 3.2. Bộ Giải đồ thị tiên quyết (Prerequisite DAG Solver)
*   Duyệt đồ thị tiên quyết DAG kiểm soát mở khóa ải tiếp theo tức thời ở Client-side.
*   Đồng bộ trạng thái tiến độ học tập thông minh lên cơ sở dữ liệu Supabase.

### 3.3. Đề xuất Cá nhân hóa AI (AI Personalizer Card)
*   Bảng đề xuất gợi ý nổi bật ải nên học tiếp theo dựa trên điểm số.
*   Hiển thị thông điệp khích lệ động lực học tập.

---

## 4. Trải nghiệm người dùng (User Stories)
*   Là một sinh viên bắt đầu học thuật toán, tôi muốn nhìn thấy toàn bộ bản đồ lộ trình học tập RPG mờ ảo Glassmorphism để nắm rõ lộ trình từ cơ bản Sorting đến cấu trúc cây đệ quy phức tạp và SOLID UML.
*   Là một người học vừa thi đỗ ải Bubble Sort, tôi muốn ngay lập tức nhìn thấy cầu nối ánh sáng Neon nối sang ải QuickSort bừng sáng nhấp nháy luồng năng lượng, báo hiệu ải mới đã chính thức được mở khóa thành công.
*   Là một học viên có điểm số phần SOLID Sandbox chưa tốt, tôi muốn bảng điều khiển AI hiển thị thẻ gợi ý: "Bạn hãy dành thêm 15 phút thực hành DIP Sandbox để củng cố nền tảng trước khi bước sang ải Dependency Injection Container tiếp theo nhé!", giúp tôi học tập có định hướng rõ ràng.
