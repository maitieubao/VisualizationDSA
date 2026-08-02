# 🌌 Tóm Tắt Dự Án: VisualizationDSA (Dành Cho Reviewer)

> **Slogan:** "Biến sự trừu tượng thành hình ảnh - Nền tảng EdTech tối thượng cho Khoa học Máy tính."

Tài liệu này cung cấp cái nhìn tổng quan nhất về dự án **VisualizationDSA**, được trích xuất từ các tài liệu mô tả dự án gốc, giúp người mới tham gia hoặc reviewer dễ dàng nắm bắt được mục tiêu, kiến trúc và các tính năng cốt lõi của hệ thống một cách nhanh chóng.

---

## 1. 🎯 Tổng Quan Hệ Thống (Overview)
**VisualizationDSA** là một nền tảng E-Learning (EdTech) hoàn chỉnh giúp sinh viên và kỹ sư phần mềm trực quan hóa các kiến thức phức tạp trong Khoa học máy tính như: Cấu trúc dữ liệu & Thuật toán (DSA), Lập trình Hướng đối tượng (OOP), SOLID, Design Patterns, và Thiết kế hệ thống (System Design). 
Thay vì chỉ mô phỏng tĩnh, hệ thống đóng vai trò như một "Video Player" phát lại các trạng thái (State Frames) được tính toán và sinh ra từ quá trình thực thi code thực tế ở Backend.

## 2. 👥 Phân Quyền Người Dùng (Actors & Roles)
Hệ thống chia làm 4 vai trò chính:
- **Khách (Guest):** Xem trang Landing Page, dùng thử một số chức năng cơ bản.
- **Học Viên (Student):** Đăng ký khóa học, học lý thuyết, tương tác với visualizer, làm quiz trắc nghiệm, cày điểm XP, thăng cấp (Level), mua gói Premium.
- **Giảng Viên (Teacher):** Quản lý (CRUD) khóa học, bài giảng (hỗ trợ Markdown, LaTeX, Mermaid), tạo đề thi, xem thống kê báo cáo kết quả học tập của sinh viên. Có cơ chế tự import quiz bằng Excel.
- **Quản Trị Viên (Admin):** Quản lý tài khoản (Ban/Khóa/Reset password), có tính năng **"Impersonation"** (đóng vai người dùng khác để debug), xem Dashboard thống kê toàn hệ thống.

## 3. 🛠️ Công Nghệ Cốt Lõi (Tech Stack)
Nền tảng được xây dựng dựa trên kiến trúc phân tách rõ ràng (Decoupled Architecture):
- **Backend (The Brain):**
  - **Framework:** .NET 8/9, C#, ASP.NET Core Web API.
  - **Kiến trúc:** Clean Architecture, Strategy Pattern cho từng thuật toán.
  - **Database:** PostgreSQL (Lưu trữ dữ liệu chính) & Redis (Caching tiến trình học tập, tính toán Leaderboard siêu tốc bằng Sorted Set).
  - **Khác:** SignalR (Phòng thi realtime, Notifications), SePay & VietQR (Thanh toán tự động), JWT Authentication.
- **Frontend (The Canvas):**
  - **Framework:** Vue 3 (Composition API), Vite, TypeScript.
  - **State Management:** Pinia (tách biệt store quản lý hoạt ảnh, input, bài giảng).
  - **Trình diễn đồ họa:** Native HTML5 Canvas 2D / SVG / WebGL tùy thuộc vào độ phức tạp của bài toán.
  - **UI/UX:** TailwindCSS, SCSS, Monaco Editor (giả lập IDE hiển thị mã nguồn code chạy đồng bộ).

## 4. 🌟 Các Tính Năng Nghiệp Vụ Nổi Bật (Key Features & USP)
1. **Interactive Sandbox & Two-way Sync (Đồng bộ hai chiều):**
   - Học viên click/hover vào dòng lý thuyết Markdown -> Visualizer sẽ tự nhảy đến đúng frame hoạt ảnh đang mô tả.
   - Khi hoạt ảnh chạy -> Dòng code tương ứng trong Monaco Editor và dòng lý thuyết tự động cuộn (auto-scroll) & highlight (sáng màu) theo.
2. **Cơ Chế Chống Gian Lận (Anti-Cheat):**
   - Không cho phép học viên lướt qua nhanh bài học để lấy XP. Hệ thống bắt buộc người dùng phải tương tác (xem tối thiểu 90% hoạt ảnh hoặc thời gian chờ tối thiểu 500ms/frame) thì nút "Đánh dấu hoàn thành" mới được mở khóa.
3. **Gamification (Game hóa học tập):**
   - Hệ thống cấp độ (Level) động dựa trên tổng XP kiếm được.
   - Huy hiệu (Badges), Bảng xếp hạng (Leaderboard) thông minh phân khúc theo Tuần/Level/Bạn bè.
   - Chuỗi ngày học (Streak) và vật phẩm bảo vệ chuỗi (Streak Freeze).
4. **Phòng Thi Trắc Nghiệm Realtime (Multiplayer Quiz Room):**
   - Cho phép học viên tạo phòng, thi đấu trắc nghiệm theo thời gian thực (tương tự nền tảng Kahoot) ứng dụng WebSocket/SignalR.
5. **Auto-save Tiến Trình (Cross-device Sync):**
   - Lưu vết vị trí cuộn trang lý thuyết và số hiệu frame hoạt ảnh đang xem dở (sử dụng Debounce để tối ưu request database). Khi mở ứng dụng trên thiết bị khác sẽ hiện thông báo khôi phục lại quá trình học.
6. **Iframe Embed:**
   - Cho phép nhúng trực tiếp visualizer vào các trang web hay blog bên ngoài (VD: qua thẻ `<iframe>` với tham số `?algo=...`) ở chế độ Minimal Mode. Có tích hợp cơ chế khóa bảo vệ cho bài tập Premium.

## 5. 📂 Cấu Trúc Mã Nguồn Cơ Bản (Directory Structure)
- `/backend`: Chứa mã nguồn .NET Core Web API.
- `/frontend`: Chứa mã nguồn Vue 3 client.
- `/plan` & `/document`: Chứa hệ thống tài liệu đặc tả, thiết kế kiến trúc, API, schema database, và tracker các bugs/sprints.
- `README.md` & `PROJECT_DETAILS.md`: Tài liệu master, đặc tả thiết kế chi tiết nghiệp vụ.

## 6. 🚀 Hướng Dẫn Chạy Dự Án Nhanh
Dự án được cấu hình kịch bản tự động hóa chạy cả hai frontend & backend. Từ terminal ở thư mục gốc của dự án, chỉ cần thực thi:
```bash
npm run dev
```
Hệ thống sẽ chạy đồng thời cả Backend Web API (mặc định tại `http://localhost:5055`) và trình phát Vite Development Server cho Frontend.
