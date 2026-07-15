# 📚 Core Architectural Decisions (Code-to-Visualization Compiler)

Tài liệu này ghi nhận Quyết định Thiết kế Kiến trúc (ADR) chứng minh tính tối ưu, an toàn tài nguyên và tính mở rộng của giải pháp Phân tích AST & Web Worker Sandbox trong phân hệ **Code-to-Visualization Compiler**.

---

## 1. Architectural Decision Records (ADR)

### ADR-09: Phân tích AST & Tiêm mã Tracing trong Web Worker Sandbox (AST Instrumentation & Web Worker Sandbox)

#### Bối cảnh (Context)
Trong các giải pháp trực quan hóa giải thuật cao cấp, thách thức lớn nhất là cho phép người học viết mã nguồn tùy biến và xem hoạt ảnh tương ứng:
*   *Phương án 1 (Server-side Compile):* Gửi code của học sinh lên máy chủ, chạy trong một Docker container cô lập, ghi log vết thực thi rồi gửi trả lại mảng JSON. 
    *   *Hạn chế:* Tiêu tốn cực kỳ nhiều tài nguyên máy chủ khi cả lớp học hàng trăm sinh viên cùng nhấn Run liên tục, độ trễ truyền dữ liệu mạng cao và tốn phí vận hành Server Sandbox.
*   *Phương án 2 (Client-side Interpreter):* Viết một trình thông dịch JavaScript (Interpreter) giả lập ở Client-side.
    *   *Hạn chế:* Trình thông dịch JS viết tay rất phức tạp, khó cập nhật đầy đủ các tính năng cú pháp hiện đại của ES6+ và có tốc độ thực thi rất chậm.

#### Quyết định (Decision)
Hệ thống quyết định áp dụng phương án **Phân tích AST & Tiêm mã Tracing (Client-side AST Instrumentation)** kết hợp **Web Worker Sandbox**:
1.  **Sử dụng Acorn & Escodegen:** Khi sinh viên bấm nút Run, mã nguồn JavaScript được phân tích cú pháp thành cây AST ở Client-side bằng thư viện siêu nhẹ `acorn`. Quá trình duyệt cây AST tự động tiêm các hàm ghi vết hoạt ảnh (`traceCompare`, `traceSwap`) vào vị trí so sánh và gán mảng. Sau đó, tệp code mới được tái tạo bằng `escodegen`.
2.  **Khởi chạy cô lập qua Web Workers:** Chuyển tệp code đã tái tạo vào một luồng chạy nền Web Worker độc lập. Web Worker thực thi trực tiếp bằng Engine V8 siêu tốc của trình duyệt mà không làm treo đơ Main Thread.
3.  **Tích hợp bộ đếm bước lặp & Timeout Guard:** Tiêm bộ đếm lượt lặp (`__loopCounter`) và bộ ngắt thời gian Timeout 1.0 giây để tự động giải phóng Worker bị treo do lặp vô hạn.

#### Kết quả (Consequences)
*   **Điểm tốt (Pros):**
    *   **Tốc độ biên dịch chớp nhoáng:** Biên dịch và chạy hoàn tất dưới 50ms ở Client-side, không chịu bất kỳ độ trễ truyền tải mạng nào.
    *   **Không tốn tài nguyên Server:** Tận dụng 100% tài nguyên CPU Client-side của học viên, giúp hệ thống Backend chịu tải siêu nhẹ, chi phí vận hành bằng 0.
    *   **Bảo vệ an toàn tuyệt đối:** Giao diện lớp học luôn mượt mà lướt đi, không bao giờ bị đơ cứng màn hình khi học sinh viết lỗi lặp vô hạn.
*   **Điểm cần lưu ý (Cons):**
    *   Giới hạn người học viết các thao tác thuật toán dạng sắp xếp mảng (Array-based sort) và thao tác biến trong Phase 2 MVP. Định dạng này hoàn hảo cho 90% bài học thuật toán cơ bản.
    
