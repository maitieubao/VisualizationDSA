# 🚀 Product Requirements Document (PRD) - State Inspector & Stack Frames (Phase 2)

## 1. Tổng quan Nghiệp vụ (Overview)
Phân hệ **State Inspector & Dynamic Variables Panel** mở toang "hộp đen" quản lý bộ nhớ của máy tính trong quá trình chạy giải thuật cấu trúc dữ liệu. Phân hệ này mang lại khả năng quan sát sâu sắc thông qua việc vẽ chồng ngăn xếp Call Stack 3D kính mờ Glassmorphic, bắn mũi tên tham chiếu chỉ thẳng sang Heap ảo và vẽ cây thực thi đệ quy thời gian thực, giúp sinh viên xua tan sự bối rối khi học các giải thuật con trỏ và đệ quy phức tạp.

---

## 2. Mục tiêu Nghiệp vụ (Goals)
*   **Trực quan hóa Cơ chế RAM vật lý (Physical RAM Visualization):** Thiết lập mô hình Call Stack (ngăn xếp chứa lệnh) và Heap (ô nhớ chứa dữ liệu) trực quan sinh động nhất.
*   **Liên kết chặt chẽ Stack-to-Heap (Pointer-to-Heap Arrows):** Vẽ các mũi tên phát quang Neon nối liền biến con trỏ ở Stack sang đúng đối tượng ô nhớ bên Heap, xóa tan sự mơ hồ về quản lý con trỏ C/C++.
*   **Giải mã Đệ quy sâu sắc (Recursion Tree SVG):** Tự động sinh cây đệ quy đồ họa thời gian thực, tô màu luồng thực thi sáng Emerald, minh họa cách thức máy tính phân tách bài toán con.
*   **Đồng bộ mã nguồn Monaco Editor (Code Sync):** Click chọn một stack frame cũ trong danh sách lập tức cuộn Monaco đến dòng lệnh gọi tầng đó, phục vụ đắc lực tính năng gỡ lỗi từng bước (debugging).

---

## 3. Các Tính năng trong Phạm vi MVP (Phase 2 MVP Scope)

### 3.1. Call Stack Frame Visualizer 3D Kính mờ
*   Vẽ xếp chồng thẳng đứng các khung Stack Frame mờ ảo. Khung trên cùng sáng Cyan nhẹ, các khung dưới mờ dần và nhỏ đi tạo chiều sâu 3D sang trọng.
*   Nhấp chọn stack frame cũ cuộn Monaco Editor và cập nhật danh sách biến số động của tầng đó.

### 3.2. Mũi tên Tham chiếu Neon (Pointer-to-Heap Arrows)
*   Bắt tọa độ DOM thời gian thực vẽ đường cong Cubic Bezier uốn lượn SVG nét đứt chạy luồng sáng chỉ thẳng từ Stack variable sang Heap object.
*   Đường chỉ tự động vẽ co giãn chính xác khi sinh viên co giãn (resize) trình duyệt.

### 3.3. Cây Đệ quy Tự động co giãn (Recursion Tree SVG)
*   Dựng sơ đồ cây đệ quy động (Ví dụ: Fibonacci, Merge Sort). Nhánh đang thực thi sáng lục Emerald, nhánh đã trả về giá trị sáng xanh Neon kèm nhãn giá trị trả về.

### 3.4. Highlight Tương tác di chuột (Hover Pulse Inspection)
*   Di chuột qua một biến trong Call Stack làm bừng sáng dạng xung nhịp Amber Neon chớp tắt của đối tượng tương ứng trên Canvas Heap ảo.

---

## 4. Trải nghiệm người dùng (User Stories)
*   Là một sinh viên đang vật lộn tự học đệ quy Fibonacci phức tạp, tôi muốn nhìn thấy một Cây Đệ quy SVG tự động dựng nhánh thời gian thực bám sát bước chạy. Tôi muốn nhìn thấy nhánh đang chạy sáng lục Emerald rực rỡ và nhánh đã trả về sáng xanh Neon hiển thị rõ kết quả `fib(1) = 1`, giúp tôi thấu hiểu sâu sắc đệ quy phân tách.
*   Là một học viên thực hành giải thuật danh sách liên kết Linked List khó nhằn, tôi muốn khi chạy dòng code gán con trỏ `head = node`, một mũi tên Neon uốn lượn SVG nét đứt chạy luồng sáng lập tức bắn từ Call Stack chỉ thẳng sang ô nhớ đối tượng Node bên Heap ảo, giúp tôi thở phào nhẹ nhõm vì hiểu rõ đường đi của con trỏ máy tính.
*   Là một sinh viên đang gỡ lỗi một hàm đệ quy sâu 5 cấp, tôi muốn khi nhấp chọn Stack Frame số 2 (tầng đệ quy cũ), Monaco Editor lập tức cuộn và tô sáng dòng code đã gọi tầng đó, giúp tôi theo dõi chính xác ngữ cảnh thực thi của quá khứ.
