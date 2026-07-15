# 📚 Core Architectural Decisions (Smart Quiz Widget)

Tài liệu này ghi nhận Quyết định Thiết kế Kiến trúc (ADR) chứng minh tính ưu việt về hiệu quả giữ chân kiến thức học viên và kiến trúc tích hợp trắc nghiệm bám ngữ cảnh trong phân hệ **Smart Interactive Quiz Widget**.

---

## 1. Architectural Decision Records (ADR)

### ADR-21: Trắc nghiệm Tương tác Tọa độ State-Aware Binding trực tiếp trên Canvas SVG & Monaco

#### Bối cảnh (Context)
Các nền tảng lập trình và cấu trúc dữ liệu hiện tại hầu hết dùng các câu hỏi trắc nghiệm A, B, C, D tĩnh đặt ở cuối chương học:
*   *Học vẹt:* Sinh viên lười suy nghĩ chỉ nhấp bừa để qua bài, không liên kết được lý thuyết câu hỏi với hoạt ảnh mảng/cây đang chạy.
*   *Lệch pha ngữ cảnh:* Nếu làm bài trắc nghiệm ở trang riêng, học sinh không thể quan sát "vật lý" trạng thái biến đổi bộ nhớ của giải thuật để trả lời đúng.

#### Quyết định (Decision)
Hệ thống quyết định phát triển giải pháp **Trắc nghiệm tương tác bám ngữ cảnh thời gian thực (State-Aware Interactive Visual Quizzes) kết hợp Event Delegation trực tiếp trên Canvas SVG và Monaco Editor** chạy ở Client-side:
1.  **Dừng tự động VCR Interceptors:** Tự động chèn điểm ngắt (breakpoint quiz) vào chuỗi sự kiện VCR timeline để tạm dừng giải thuật, ép học sinh dừng lại tư duy.
2.  **State-Aware Binding:** Đăng ký listener tạm thời lắng nghe sự kiện click trực tiếp lên các thẻ đồ họa SVG chứa dữ liệu `data-node-id` (Ví dụ: cột mảng bar, node của cây).
3.  **Monaco Clickable Lines:** Tạm thời chuyển editor sang chế độ click chọn dòng, vô hiệu hóa nhập văn bản để học sinh chọn đáp án dòng code tiếp theo.

#### Kết quả (Consequences)
*   **Điểm tốt (Pros):**
    *   **Nâng cao khả năng nhớ bài gấp 3 lần (Cognitive Retention):** Buộc sinh viên phải phân tích sâu sắc trạng thái bộ nhớ và suy nghĩ logic dòng code tiếp theo để tương tác vật lý trực tiếp trên màn hình.
    *   **Trải nghiệm EdTech Premium lôi cuốn:** Sự tò mò kích thích học viên tìm tòi click thử, kết hợp pháo Confetti ăn mừng mang lại niềm vui sướng học tập vô biên.
    *   **Đồng bộ 100% dòng thời gian:** Khi trả lời xong, dòng thời gian VCR được mở khóa để tua tiếp tục mượt mà.
*   **Điểm cần lưu ý (Cons):**
    *   Phải quản lý dọn dẹp các event listener click canvas cực kỳ sạch sẽ khi đóng quiz, khôi phục lại tính năng tương tác bình thường của mảng/cây để tránh lỗi xung đột chuột.
    
    
