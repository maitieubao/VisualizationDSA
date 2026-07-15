# 🎭 Behavioral Specification & Step Debugger Policies (Phase 2)

Tài liệu này đặc tả chi tiết các chính sách va chạm điểm dừng Breakpoint, tầm vực hoạt động giám sát của Watch Panel và ràng buộc giới hạn ngăn xếp đệ quy Call Stack trong phân hệ **Algorithmic Step Debugger Workspace**.

---

## 1. Chính sách Kích hoạt Điểm dừng Breakpoint (Breakpoint Hit Policy)

Khi sinh viên chạy chế độ Debugger và nhấn nút `Continue`:
*   **Chỉ dừng trên dòng thực thi được (Executable Lines):** 
    *   Hệ thống chỉ cho phép dừng tại các dòng chứa lệnh thực thi (ví dụ câu lệnh gán, so sánh, gọi hàm).
    *   Nếu sinh viên đặt Breakpoint tại dòng trống, dòng chứa dấu ngoặc đóng đơn lẻ `}`, hoặc dòng ghi chú comment `//`, bộ duyệt AST `LiveCompilerDebugger` tự động lướt qua dòng đó mà không tạm dừng, tránh việc gây bối rối cho người học.
*   **Chặn lặp vô tận (Infinite Loop Guard):**
    *   Khi bấm `Continue`, nếu thuật toán bị lỗi lặp vô hạn chạy liên tục 5000 bước mà không chạm thêm bất kỳ Breakpoint nào, hệ thống tự động ngắt và báo lỗi Timeout, tuyệt đối không để trình duyệt bị treo đơ.

---

## 2. Quy tắc Giới hạn độ sâu Ngăn xếp (Call Stack Depth Constraints)

Để bảo vệ tài nguyên máy tính Client chạy mượt mà:
*   **Giới hạn đệ quy:** 
    *   Ngăn xếp đệ quy `Call Stack` tối đa được phép xếp chồng là **500 cấp đệ quy lồng nhau**.
    *   Nếu vượt quá 500 (ví dụ sinh viên viết đệ quy Quick Sort bị lỗi tràn bộ nhớ), động cơ gỡ lỗi tự ngắt cưỡng bức và chuyển trạng thái về `FINISHED` kèm theo thông báo lỗi đỏ Neon cảnh báo tràn ngăn xếp.

---

## 3. Chính sách Giám sát của Bảng Watch Panel (Watch Panel Scope Policies)

*   **Chỉ hiển thị các biến trong tầm vực (In-scope Variables):**
    *   Watch Panel chỉ liệt kê các biến số và tham số thực sự đã được khai báo và đang tồn tại trong tầm vực hoạt động (scope) của dòng lệnh hiện tại.
    *   Các biến chưa được khai báo sẽ hiển thị trạng thái `undefined` hoặc tự động ẩn đi để giao diện luôn sạch sẽ tối giản.
    *   Khi biến vừa bị gán lại giá trị mới tại dòng vừa chạy qua, dòng biến đó trong Watch Panel lóe sáng Neon Cyan trong vòng 1 giây để thu hút sự tập trung phân tích của sinh viên.
