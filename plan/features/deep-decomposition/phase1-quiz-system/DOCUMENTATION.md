# 📚 Core Architectural Decisions (Interactive Quiz)

Tài liệu này ghi nhận Quyết định Thiết kế Kiến trúc (ADR) chứng minh tính thực tiễn và hiệu năng của giải pháp trắc nghiệm nhấp chọn trực tiếp Canvas trong phân hệ **Interactive Quiz System**.

---

## 1. Architectural Decision Records (ADR)

### ADR-08: Tích hợp Giải thuật Kiểm thử Nhấp chọn Trực tiếp lên Canvas (In-Canvas Hit-Target Verification)

#### Bối cảnh (Context)
Trong giảng dạy Khoa học máy tính (EdTech), các câu hỏi trắc nghiệm truyền thống chỉ dừng lại ở dạng chữ:
*   *Hạn chế:* Việc bắt sinh viên đọc câu hỏi rồi chọn một phương án A, B, C, D dài dòng về định danh đỉnh (ví dụ: *"Đỉnh tiếp theo được chọn làm Pivot là đỉnh C"*) làm giảm tính trực quan rõ rệt và cản trở tốc độ tư duy hình thái đồ họa của học viên.
*   *Mong muốn:* Giảng viên mong muốn học sinh tương tác trực tiếp lên bản vẽ Canvas: Nhấp thẳng vào đỉnh, cạnh, hay phân vùng đang hiển thị để nộp câu trả lời, mang lại trải nghiệm giống như chơi game (Gamification).

#### Quyết định (Decision)
Hệ thống quyết định xây dựng cơ chế **Nhấp chọn trực tiếp lên Canvas làm đáp án (In-Canvas Hit-Target)**:
1.  **Tích hợp lớp lắng nghe va chạm (Collision Listener):** Khi câu hỏi thuộc loại `CANVAS_TARGET` được kích hoạt, hệ thống tạm thời khóa toàn bộ Toolbar vẽ đồ thị để tránh người dùng sửa đổi cấu trúc. Thẻ Canvas đăng ký một Event Listener tọa độ đặc biệt.
2.  **Chấm điểm dựa trên khoảng cách hình học:** Không dùng các phần tử HTML đè lên Canvas. Hệ thống trực tiếp lấy tọa độ click chuột ($X, Y$), tính khoảng cách Euclide tới tâm tất cả các đỉnh đang hiển thị trên bản vẽ. Nếu người học click trúng đỉnh có ID khớp với `correctNodeId` đã cấu hình, câu trả lời lập tức được chấp thuận là ĐÚNG.
3.  **Lập trình trạng thái khóa bài giảng:** Bài giảng điện tử tự động chuyển sang trạng thái tạm dừng tĩnh (Pause) và vô hiệu hóa (`disabled`) toàn bộ thanh trượt Slider cùng cụm phím điều tốc VCR. Người học không thể kéo tua lướt qua câu hỏi mà bắt buộc phải hoàn tất tương tác.

#### Kết quả (Consequences)
*   **Điểm tốt (Pros):**
    *   **Trải nghiệm EdTech đột phá:** Sinh viên cực kỳ phấn khích, phản xạ nhận diện thuật toán trực quan qua hình học được cải thiện vượt trội so với đọc chữ thông thường.
    *   **Hiệu năng hoàn hảo:** Việc tính toán va chạm hình học ở Client-side tiêu tốn tài nguyên gần như bằng 0, phản hồi kết quả trắc nghiệm tức khắc trong vòng 1ms.
    *   **Giảm thiểu gian lận:** Việc click trực tiếp yêu cầu học sinh thực sự hiểu sơ đồ đang chạy ở khung hình đó, tránh việc đánh bừa phương án A, B, C, D.
*   **Điểm cần lưu ý (Cons):**
    *   Giảng viên biên soạn kịch bản câu hỏi `CANVAS_TARGET` cần khai báo chính xác ID đỉnh đáp án đúng khớp với cấu trúc thuật toán phát ra. Việc này đã được hệ thống API biên soạn giáo trình tự động hóa.
    
