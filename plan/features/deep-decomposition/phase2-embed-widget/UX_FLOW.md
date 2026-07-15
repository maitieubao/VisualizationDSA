# 🌊 UX Flow & Interactive Embed Walkthroughs

Tài liệu này đặc tả chi tiết các kịch bản trải nghiệm người dùng (User Journeys) trong tiến trình giáo viên cấu hình tùy biến widget nhúng thuật toán, sao chép code nhúng và cách trang chủ Host điều khiển Iframe nhúng từ xa thông qua postMessage trên **Interactive Embed Widget**.

---

## 📌 KỊCH BẢN 1: GIÁO VIÊN TÙY BIẾN VÀ NHÚNG SƠ ĐỒ VÀO MOODLE LMS

### Tình huống: Giảng viên muốn lấy sơ đồ động Heap Sort mờ Glassmorphism nhúng vào bài giảng của trường

```
[Mở giao diện Bảng Cấu hình Nhúng (Embed Configurator Workspace)]
[Bên trái là thanh Sidebar kính mờ, bên phải hiển thị Live Preview Canvas]
        |
        v Rê chuột chọn giải thuật nhúng: [ Heap Sort ]
        v Kéo thanh trượt đổi chiều rộng: 900px, chiều cao: 600px
        v Chọn Theme hiển thị: [ Glassmorphism ] cực kỳ sành điệu
        v Gạt công tắc tắt [ Watch Variables ] để sơ đồ hiển thị tối giản gọn gàng
        |
[Live Preview Canvas tự động vẽ lại Heap Sort mờ ảo tuyệt đẹp tức thì 60 FPS]
[Hộp code snippet viền Neon hiển thị chuỗi mã thẻ iframe tương ứng thời gian thực]
        |
        v Nhấp nút [ COPY CODE ] màu Cyan phát sáng
[Hoạt ảnh nút chuyển màu sang [ COPIED! ] Emerald dịu mát biểu thị thành công]
        |
        v Giảng viên mở trang soạn thảo Moodle LMS, dán code iframe vào khung bài viết
[Sơ đồ Heap Sort mờ ảo hiển thị hoàn hảo, vừa vặn không hề có thanh cuộn kép]
[Học sinh học lý thuyết đến đâu, trực tiếp bấm tua hoạt ảnh Heap Sort ngay tại Moodle]
```

---

## 📌 KỊCH BẢN 2: TRANG CHỦ HOST ĐIỀU KHIỂN CÂY ĐỆ QUY QUICKSORT NHÚNG TỪ XA

### Tình huống: Học sinh đọc giáo trình điện tử, trang chủ host tự động bắn lệnh tua bước Iframe khi học sinh click nút Next chung

```
[Học sinh đang đọc bài giảng Quick Sort trên trang web giáo trình của trường đại học]
[Giao diện bài giảng có nút [ TIẾP TỤC BÀI HỌC ] ở chân trang]
[Chính giữa bài giảng nhúng cây đệ quy QuickSort của VisualizationDSA]
        |
        v Học viên nhấp chọn nút [ TIẾP TỤC BÀI HỌC ] chung của trang chủ
[Trang chủ bắn tin nhắn message "STEP_FORWARD" bảo mật chui qua biên Iframe sandbox]
        |
[Iframe nhúng nhận tin nhắn an toàn từ Domain tin cậy Whitelist]
[Cây đệ quy QuickSort tự động nhảy sang mốc phân rã mảng tiếp theo mượt mà]
[Tia laser Neon bắn kết nối đỉnh nhánh đệ quy phát sáng lung linh sắc nét]
[Học sinh cảm giác bài giảng được kết nối đồng bộ liền mạch, vô cùng hứng thú học tập]
```
 Trải nghiệm nhúng sơ đồ thuật toán mượt mà co giãn tự động (Interactive Embed Widget) mang lại cho trường học và giảng viên một giải pháp giáo dục thuật toán trực quan sinh động tối tân, mở rộng tầm ảnh hưởng của VisualizationDSA.
