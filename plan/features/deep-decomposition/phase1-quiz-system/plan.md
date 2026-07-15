# 📅 Implementation Plan - Interactive Quiz System (Phase 1)

Kế hoạch phát triển phân hệ Hệ thống Trắc nghiệm Tương tác (Interactive Quiz) được phân bổ làm 2 Sprint chính để cam kết tính thẩm mỹ của hộp thoại câu hỏi nổi và sự chính xác của cơ chế chấm điểm va chạm Canvas.

---

## 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN

```
+-------------------------------------------------------------+
| Sprint A: Thẻ trắc nghiệm Glassmorphism & Giao diện (Ngày 1-2)|
| - Thiết kế overlay mờ sương đè lên khu vực Canvas.          |
| - Xây dựng component Multiple Choice & True/False UI cards. |
| - Lập trình hiệu ứng phát sáng Neon viền Đúng/Sai.           |
| - Hoàn thành giao diện tổng kết điểm số kèm huy hiệu.       |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Sprint B: Chấm điểm Canvas-Targeted & Checkpoints (Ngày 3-5)|
| - Hiện thực hóa lắng nghe mốc frameIndex đè Pause bài giảng. |
| - Lập trình bộ xác định va chạm hình học click đỉnh Canvas. |
| - Tích hợp Markdown giải thích lý thuyết chi tiết.          |
| - Thiết lập lưu trữ localStorage thống kê chuỗi trả lời đúng. |
+-------------------------------------------------------------+
```

---

## 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN

### Sprint A: Thẻ trắc nghiệm Glassmorphism & Giao diện (Ngày 1-2)
*   **Mục tiêu:** Xây dựng bộ khung thẻ câu hỏi nổi bật chính giữa Canvas, thiết kế các hiệu ứng hình ảnh cao cấp khi nộp bài và bảng tổng kết kết quả học tập.
*   **Danh sách công việc:**
    1.  [ ] Xây dựng lớp phủ mờ Glassmorphism CSS (`backdrop-filter: blur(20px)`) đè lên Canvas, ngăn chặn mọi click chuột ra ngoài vùng câu hỏi.
    2.  [ ] Thiết kế Component `QuizCardOverlay.vue` chứa câu hỏi, các phương án A, B, C, D bo góc tròn mềm mại.
    3.  [ ] Cài đặt hiệu ứng Neon Glow phát sáng viền: xanh Emerald khi trả lời đúng, đỏ Rose nhạt kèm hiệu ứng rung lắc (shake) khi trả lời sai.
    4.  [ ] Xây dựng Component tổng kết kết quả `QuizSummaryCard.vue` hiển thị tỷ lệ chính xác, số chuỗi trả lời đúng liên tiếp và nút làm lại.

### Sprint B: Chấm điểm Canvas-Targeted & Checkpoints (Ngày 3-5)
*   **Mục tiêu:** Đồng bộ điểm dừng tự động của E-Lecture, chấm điểm đỉnh vẽ trực quan và tích hợp lưu trữ thống kê cục bộ.
*   **Danh sách công việc:**
    1.  [ ] Lập trình theo dõi `lectureStore.currentFrameIndex` để phát hiện mốc trắc nghiệm đột xuất, tự động tạm dừng hoạt ảnh và khóa cứng tương tác.
    2.  [ ] Cài đặt bộ lắng nghe sự kiện Click trên Canvas ở chế độ `CANVAS_TARGET`, tính khoảng cách hình học tìm đỉnh đáp án đúng.
    3.  [ ] Tích hợp thư viện hiển thị Markdown (ví dụ: `markdown-it` hoặc `marked`) để render lý thuyết giải thích chi tiết sắc sảo dưới chân câu hỏi.
    4.  [ ] Viết lớp dịch vụ `QuizStatsManager` đồng bộ kết quả xuống `localStorage` theo dõi chuỗi thành tích lập học của sinh viên.

---

## 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)
1.  Hộp trắc nghiệm nổi bật chính giữa màn hình Canvas mượt mà, khóa cứng tuyệt đối thanh Range Slider và bộ nút Play/Pause khi câu hỏi đang mở.
2.  Câu hỏi nhấp chọn Canvas (Canvas-targeted) hoạt động chính xác, nhấp trúng đỉnh đáp án đúng báo xanh lá cây, đỉnh đáp án sai báo đỏ ngay tức khắc.
3.  Lời giải thích lý thuyết Markdown kết xuất hoàn hảo, font chữ dễ đọc, từ khóa đoạn code có định dạng chuyên nghiệp.
4.  Điểm số và chuỗi trả lời đúng lưu giữ chuẩn xác trong `localStorage`, khôi phục đúng thành tích khi học sinh tải lại trang.
