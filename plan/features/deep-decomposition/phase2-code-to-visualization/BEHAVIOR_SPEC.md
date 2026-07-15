# 🎭 Behavioral Specification & Sandbox Security Rules (Phase 2)

Tài liệu này đặc tả chi tiết các chính sách bảo mật an toàn nghiêm ngặt của Sandbox Web Worker, quy tắc chặn lặp vô hạn và cách xử lý va chạm tương tác khi sinh viên nhấp Run liên tục trên **Code-to-Visualization Compiler**.

---

## 1. Ràng buộc Bảo mật Sandbox (Worker Security Constraints)

Vì Web Worker thực thi mã nguồn JavaScript tùy ý do sinh viên soạn thảo, hệ thống phải đảm bảo sinh viên không thể viết các đoạn mã độc hại xâm hại dữ liệu hệ thống (như ăn cắp Cookie hoặc Token):
*   **Ngăn chặn quyền DOM:** 
    *   Môi trường chạy luồng cát Web Worker mặc định không có quyền truy cập vào các đối tượng toàn cục `window`, `document`, `parent` hay `top`. Mọi nỗ lực truy cập vào DOM của sinh viên sẽ báo lỗi `ReferenceError` ngay lập tức.
*   **Vô hiệu hóa kết nối Mạng:**
    *   Web Worker Sandbox tuyệt đối không được phép sử dụng `fetch`, `XMLHttpRequest` hoặc các thư viện kết nối mạng khác để gửi dữ liệu ra máy chủ bên ngoài.
*   **Ngăn chặn Local Storage:**
    *   Không có quyền ghi đọc `localStorage` hay `sessionStorage` của trình duyệt.
*   **Khởi tạo cô lập:**
    *   Hàm thực thi `customFunc` được khởi tạo cục bộ bên trong Worker bằng cách sử dụng `new Function()` sạch sẽ, không kế thừa tầm vực biến của luồng UI chính.

---

## 2. Ngưỡng giới hạn Lặp & Chống Lặp vô hạn (Infinite Loop Policies)

Để bảo đảm tài nguyên CPU Client-side chạy mượt mà, hệ thống áp đặt 2 lớp bảo vệ chống treo:

### Lớp bảo vệ 1: Giới hạn số lượt lặp (AST Counter Limit)
*   **Quy định:** Mỗi cấu trúc lặp `for`, `while` hoặc `do-while` sau khi được tiêm mã chống treo không được phép lặp vượt quá **5,000 lần** trong suốt tiến trình giải thuật.
*   **Xử lý lỗi:** Nếu vượt quá, Worker chủ động ném lỗi `LOOP_LIMIT_EXCEEDED` và kết thúc ngay lập tức.

### Lớp bảo vệ 2: Giới hạn thời gian (Execution Timeout Guard)
*   **Quy định:** Dù vì bất kỳ lý do gì (ví dụ: đệ quy vô hạn làm tràn bộ nhớ stack), Web Worker không được phép chiếm dụng CPU của Client quá **1.5 giây**.
*   **Xử lý lỗi:** Sau 1.5 giây chưa trả về kết quả, Main Thread tự động gọi `worker.terminate()`, giải phóng luồng nền và báo lỗi Timeout lên bảng Console để sinh viên biết và chỉnh sửa lại cấu trúc thuật toán.

---

## 3. Chính sách chống Nhấp chuột Biên dịch Liên tiếp (Debounced Run Protection)

*   **Vấn đề:** Sinh viên bấm nút "Run Compilation" liên tiếp 10 lần trong khi luồng Worker cũ chưa hoàn thành xử lý.
*   **Hành vi xử lý:**
    *   Nút bấm Run bị vô hiệu hóa (`disabled`) và chuyển sang trạng thái loading nhấp nháy Neon Cyan dịu nhẹ ngay khi bắt đầu tiến trình biên dịch.
    *   Hệ thống gọi `WorkerLifecycleCoordinator.terminateActiveSession()` để tiêu hủy ngay lập tức Worker cũ đang chạy dở trước khi cấp phát Worker mới, bảo đảm tuyệt đối không bao giờ bị tràn luồng hoặc tranh chấp tài nguyên Canvas.
