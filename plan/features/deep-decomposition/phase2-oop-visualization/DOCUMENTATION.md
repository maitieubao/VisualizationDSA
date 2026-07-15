# 📚 Core Architectural Decisions (OOP Concepts)

Tài liệu này ghi nhận Quyết định Thiết kế Kiến trúc (ADR) chứng minh tính ưu việt về mặt tối ưu học thuật, phản hồi tức thời của giải pháp mô phỏng Meta-Object Reflection chạy ở Client trong phân hệ **OOP Concepts Visualizer**.

---

## 1. Architectural Decision Records (ADR)

### ADR-20: Bộ mô phỏng Siêu dữ liệu Meta-Object Reflection Simulator chạy ở Client-side

#### Bối cảnh (Context)
Để dạy cho học viên hiểu sâu sắc về Kế thừa, Đóng gói và Đa hình động VTable, hệ thống cần cho phép người học tự khai báo, sửa đổi cấu trúc lớp và khởi tạo Heap Object trực tiếp:
*   *Thử thách 1 (Rào cản biên dịch backend):* Nếu mỗi lần sinh viên thay đổi access modifier của thuộc tính trong Monaco Editor, hệ thống lại phải gửi code về Backend C#, biên dịch ra mã IL `.dll`, dùng Reflection của .NET trích xuất siêu dữ liệu rồi gửi ngược về Client, thời gian phản hồi sẽ vô cùng chậm trễ (ít nhất 1 giây - 3 giây). Điều này hoàn toàn phá vỡ trải nghiệm học tập nhạy bén.
*   *Thử thách 2 (Khả năng hiển thị trực quan ô nhớ):* Trình biên dịch C# thực tế che giấu địa chỉ con trỏ VTable và địa chỉ Heap thực của đối tượng. Sinh viên chỉ nhìn thấy biến chung chung, không thể quan sát "vật lý" liên kết con trỏ di chuyển lướt trên màn hình.

#### Quyết định (Decision)
Hệ thống quyết định tự xây dựng **Bộ máy giả lập Meta-Object Reflection System viết bằng TypeScript chạy 100% Client-side** thông qua lớp `OOPReflectionEngine`:
1.  **Reflection giả lập ở Client:** Tự định nghĩa cấu trúc dữ liệu mô tả lớp, thuộc tính và phương thức dưới dạng JSON. Dùng Client-side Engine phân tích tính thừa kế chuỗi kế thừa và lập bảng phương thức ảo VTable.
2.  **Địa chỉ nhớ hexa giả lập giống thật:** Cấp phát ô nhớ Heap ảo với địa chỉ Hexa (ví dụ: `0x7FFF12`), tăng offset nhịp nhàng giống hệ điều hành thật quản lý RAM.
3.  **Tia Laser Bắn Đa Hình SVG:** Hoạt ảnh tia laser SVG phản chiếu uốn lượn nối giữa nơi gọi hàm trong Monaco Editor và ô nhớ phương thức đã ghi đè của đối tượng Heap ảo.

#### Kết quả (Consequences)
*   **Điểm tốt (Pros):**
    *   **Phản hồi tức thì dưới 10ms (Instant-Feedback Loop):** Sinh viên đổi modifier từ `public` sang `private` nhìn thấy ổ khóa sập đỏ rực và viền class rung bíp lỗi đóng gói ngay lập tức khi chạy code, mang lại trải nghiệm EdTech premium đỉnh cao.
    *   **Trực quan hóa vật lý ô nhớ:** Giúp học sinh nắm chắc bản chất bảng ảo VTable Lookup mà trước đây chỉ là lý thuyết sáo rỗng trong giáo trình.
    *   **Độc lập hạ tầng biên dịch:** Tiết kiệm hàng ngàn đô-la vận hành hạ tầng API Compiler Backend gánh tải.
*   **Điểm cần lưu ý (Cons):**
    *   Yêu cầu đội ngũ phát triển phải lập trình giả lập cấu trúc class metadata thật chu đáo để phản ánh đúng quy luật OOP của C#/.NET.
    
    
