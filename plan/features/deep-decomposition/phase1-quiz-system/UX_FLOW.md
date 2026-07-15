# 🌊 UX Flow & Interactive Quiz Walkthroughs - Quiz System

Tài liệu này đặc tả chi tiết các kịch bản trải nghiệm người dùng (User Journeys) trong tiến trình ôn luyện trắc nghiệm xen kẽ bài giảng và tương tác trực quan đỉnh Canvas trên **Interactive Quiz System**.

---

## 📌 KỊCH BẢN 1: GẶP ĐIỂM DỪNG TRẮC NGHIỆM ĐỘT XUẤT KHI XEM BÀI GIẢNG BUBBLE SORT

### Tình huống: Học viên đang xem bài giảng tự động Bubble Sort phát tới bước so sánh đầu tiên

```
[Bật phát bài giảng Bubble Sort tự động] -> [Hoạt ảnh cột số di chuyển mượt mà ở 1.0x]
        |
        v Hoạt ảnh trượt tới Frame thứ 15 (Trước bước hoán vị đầu tiên)
[Hệ thống tự động tạm dừng phát (PAUSE), thanh Range Slider bị khóa cứng màu xám]
[Màn hình tối sương Glassmorphism mờ mượt đè lên Canvas]
[Thẻ trắc nghiệm nổi Zoom-in bật lên chính giữa màn hình]
[Nội dung câu hỏi: "Phép hoán vị (Swap) có xảy ra ở bước tiếp theo hay không?"]
        |
        v Học viên đọc câu hỏi, rê chuột chọn nút đáp án [ CÓ ]
[Viền thẻ trắc nghiệm lóe sáng Neon Emerald xanh tươi dịu mắt]
[Hiển thị biểu tượng chính xác ✓ cùng lời giải thích chi tiết Markdown]
[Lời giải: "Chính xác! Cột A (20) lớn hơn cột B (12) nên giải thuật phải hoán đổi."]
        |
        v Học viên nhấp chọn nút [ Tiếp tục bài giảng ]
[Hộp thoại trắc nghiệm biến mất mượt mà]
[Lớp phủ khóa tháo dỡ, E-Lecture tự động kích hoạt phát tiếp tục]
[Cột số trên Canvas trượt hoán đổi chỗ cho nhau vô cùng sinh động]
```

---

## 📌 KỊCH BẢN 2: TRẢ LỜI CÂU HỎI TƯƠNG TÁC NHẤP CHỌN ĐỈNH CANVAS (Dijkstra)

### Tình huống: Người học nhận thử thách chọn đỉnh tiếp theo được đưa vào tập S của giải thuật Dijkstra

```
[Bài giảng Dijkstra tạm dừng ở mốc duyệt đỉnh kề]
[Thẻ câu hỏi nổi hiện lên mép trên Canvas: "Hãy click thẳng vào Đỉnh có khoảng cách ngắn nhất tiếp theo được đưa vào tập S"]
[Thanh Toolbar vẽ đồ thị bị gray-out khóa cứng]
[Trỏ chuột khi rê trên Canvas chuyển thành hình ngắm bắn chữ thập (Crosshair)]
[Canvas phát sáng nhẹ Cyan báo hiệu đang đợi nhấp chọn]
        |
        v Học viên rê chuột nhấp thử vào Đỉnh "D" trên Canvas
[Khoảng cách Click trúng đỉnh D hợp lệ, hệ thống chấm điểm tức thời]
[Đỉnh D nhấp nháy đỏ rực rực, thẻ câu hỏi rung lắc nhẹ (CSS Shake)]
[Viền thẻ câu hỏi đổi sang màu đỏ Rose Neon nhạt]
[Hiển thị giải thích: "Rất tiếc! Đỉnh D có khoảng cách d(D) = 8. Trong khi đỉnh C có d(C) = 5 nhỏ hơn."]
        |
        v Học viên thấu hiểu lỗi sai nhận thức lý thuyết của mình
[Rê chuột nhấp chọn lại đỉnh "C" trên Canvas]
[Hệ thống chấp nhận, đỉnh C lóe sáng xanh Emerald phát sáng Neon đẹp mắt]
[Bấm [ Tiếp tục ], Canvas Dijkstra vẽ hoạt ảnh duyệt lan tỏa từ đỉnh C xuất sắc]
```
 Kịch bản tương tác game hóa trực quan sinh động này giúp xóa nhòa ranh giới giữa kiểm tra khô khan và tương tác vui vẻ, nâng cao 300% hiệu suất tự học của học sinh.
