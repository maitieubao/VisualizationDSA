# 🗺️ Sprint 4 Feature Plan - Interactive Quiz & Lecture System

Tài liệu này đặc tả chi tiết kế hoạch triển khai cho **Sprint 4: Interactive Quiz & Lecture System**. Phân hệ chịu trách nhiệm tích hợp bài giảng điện tử lý thuyết slide lướt êm với bộ máy đập nhịp hoạt ảnh DSA VCR và bộ câu hỏi trắc nghiệm Canvas tương tác chấm điểm tự động.

---

## 1. Mục tiêu Sprint (Sprint Goal)
Xây dựng lớp đồng bộ bài giảng slide lý thuyết và chấm điểm trắc nghiệm mã nguồn:
*   **Đồng bộ Slide & Giải thuật (Slide-to-Algorithm Sync):** Khi học viên đọc tới slide số 3 giải thích "Pivot Partitioning QuickSort", Canvas trực quan bên phải tự động nhảy đến đúng bước hoạt ảnh gỡ lỗi tương thích để minh họa trực quan.
*   **Chấm điểm Trắc nghiệm Canvas (Canvas Interactive Quiz Engine):** Cung cấp các câu hỏi trắc nghiệm lựa chọn đáp án hoặc click chọn trực tiếp dòng code Monaco Editor, chấm điểm tự động tính toán tỷ lệ đạt 80%.
*   **Kiểm tra tính tuân thủ mã (Code Compliance Linter):** Soi xét mã nguồn tùy biến học viên viết dưới Client-side bằng AST Linter kiểm tra đầy đủ các từ khóa bắt buộc trước khi chạy.

---

## 2. Danh sách công việc (Task Backlog)
1.  [ ] Thiết kế Component `InteractiveLectureSlides.vue` kính mờ hiển thị văn bản slide.
2.  [ ] Lập trình điều phối viên slide `LecturePlaybackCoordinator` bắt sự kiện đổi trang.
3.  [ ] Xây dựng bộ máy chấm điểm trắc nghiệm thông minh `QuizEvaluationEngine` Client-side.
4.  [ ] Lập trình static linter `verifyCodeCompliance` phân tích từ khóa bắt buộc dưới RAM.
5.  [ ] Viết Unit tests kiểm thử chấm điểm trắc nghiệm và đồng bộ slide.

---

## 3. Tiêu chí nghiệm thu (DoD)
*   Đổi trang Slide tự động kích hoạt nhảy VCR bước hoạt ảnh Canvas tương ứng chuẩn xác.
*   Bộ linter mã nguồn kiểm soát chặt chẽ từ khóa bắt buộc, phản hồi thông báo sai dưới **5ms**.
*   Thu hồi sạch sẽ các listeners sự kiện slide khi unmount đề phòng rò rỉ RAM.
*   Unit tests bao phủ 100% logic chấm điểm trắc nghiệm và kiểm tra code compliance.
