# 🌊 UX Flow & Interactive Multi-View Walkthroughs

Tài liệu này đặc tả chi tiết các kịch bản trải nghiệm người dùng (User Journeys) khi sinh viên chia đôi màn hình học tập song song, kéo tua thanh trượt dòng thời gian VCR Scrubber và điều khiển co giãn các panel làm việc trên **Multi-View Synchronization**.

---

## 📌 KỊCH BẢN 1: SINH VIÊN KÉO TUA TIMELINE SLIDER QUICKSORT SONG SONG

### Tình huống: Học sinh muốn nghiên cứu sâu sắc bước phân tách mảng xoay quanh pivot trong QuickSort đệ quy

```
[Học sinh mở Workspace giải thuật QuickSort]
[Nhấp nút [ CHIA PANEL ] -> Chọn bố cục 2 màn hình song song: Monaco bên trái, SVG bên phải]
[Bấm nút [ PLAY ] tốc độ 1x để quan sát tổng quan giải thuật chạy tự động]
        |
        v Muốn nghiên cứu kỹ bước hoán đổi mảng phức tạp ở giữa tiến trình
[Học viên bấm [ PAUSE ] dừng giải thuật tại bước 10]
[Đặt chuột vào tay cầm thanh trượt tua thời gian VCR Slider cam Neon]
[Kéo trượt nhanh slider từ bước 10 sang bước 15 (Range Scrubbing)]
        |
[Ngay lập tức, cả hai View đồng loạt snap sang trạng thái bước 15 dưới 1ms:]
  - View Monaco Editor trái: Lập tức dời dải sáng vàng hổ phách tô sáng dòng code số 12.
  - View SVG Visualizer phải: Lập tức hoán đổi vị trí bar mảng số 3 và số 4 bừng sáng Cyan.
        |
[Học viên kéo trượt lùi nhanh về bước 14 để xem lại dòng code trước đó]
[Cả 2 View snapping lùi lại đồng điệu hoàn hảo, không một chút trễ hay lệch pha]
[Học sinh vô cùng hài lòng vì sự tương tác trực quan phản hồi tức khắc]
```

---

## 📌 KỊCH BẢN 2: CO GIÃN KHUNG RESIZABLE SPLITTER KHI ĐANG PHÁT GIẢI THUẬT

### Tình huống: Học sinh đang phát hoạt ảnh đổi giá trị mảng 60 FPS và muốn phóng to khung hình SVG bên phải

```
[Giải thuật đang phát tự động ở chế độ 2x (Playback Speed 2x)]
[Các bar mảng SVG đang nhảy múa chuyển động hoán đổi liên tục]
[Dòng code Monaco bên trái sáng rực di chuyển nhịp nhàng]
        |
        v Học sinh muốn nhìn rõ hoạt ảnh mảng hơn
[Học viên đặt chuột lên thanh phân chia Pane Splitter kính mờ Neon]
[Thấy thanh splitter lập tức bừng sáng phát quang màu xanh Cyan Neon báo hiệu sẵn sàng]
[Học sinh bấm giữ chuột trái và kéo mạnh sang bên trái (để mở rộng khung SVG phải)]
        |
[Khung chia ô co giãn mượt mà đúng 60 FPS dưới tác động của Throttled Drag Coordinator]
  - Khung Monaco bên trái thu nhỏ dần đều, văn bản code tự động ngắt dòng thông minh.
  - Khung SVG bên phải mở rộng tương ứng, canvas vẽ lại mượt mà không đứt dòng.
        |
[Học sinh kéo thả chuột, thanh chia dừng lại và khóa an toàn ở mốc tỷ lệ 25% (Code) và 75% (SVG)]
[Hoạt ảnh giải thuật vẫn tiếp tục phát hoàn hảo, dòng highlight Monaco vẫn bám chuẩn dòng]
[Học viên cảm thấy hệ thống hoạt động vô cùng thông minh, linh hoạt và cao cấp]
```
 Trải nghiệm chế độ xem song song đa giao diện đồng bộ cực hạn dưới 1ms kết hợp co giãn splitters kính mờ bừng sáng và VCR Scrubber mượt mà mang lại cho học sinh một môi trường gỡ lỗi giải thuật trực quan tuyệt vời nhất, biến việc học DSA khô khan trở thành một chuyến khám phá công nghệ thú vị.
