# 🌊 UX Flow & Interactive OOP Sandbox Walkthroughs

Tài liệu này đặc tả chi tiết các kịch bản trải nghiệm người dùng (User Journeys) khi sinh viên khởi tạo đối tượng Heap, kích hoạt cuộc gọi đa hình VTable Dynamic Dispatch và vi phạm quyền đóng gói access modifiers trên **OOP Concepts Visualizer**.

---

## 📌 KỊCH BẢN 1: PHÂN GIẢI ĐA HÌNH ĐỘNG DYNAMIC DISPATCH TRỰC QUAN

### Tình huống: Học sinh muốn xem tia laser định tuyến VTable khi gọi phương thức draw() của Circle kế thừa Shape

```
[Học sinh mở Polymorphism Sandbox sơ đồ lớp UML]
[Nhấp nút [ NEW INSTANCE ] -> Chọn lớp [ Circle ] để khởi tạo đối tượng trên Heap]
[Hệ thống lập tức cấp phát ô nhớ đối tượng Circle trên Heap ảo tại địa chỉ: [ 0x3100A0 ]]
[Bảng tra VTable của 0x3100A0 hiện rõ: draw() ===> Circle.draw() (Ghi đè)]
        |
        v Sinh viên gõ lệnh chạy trong Monaco Sandbox: shape.draw()
        v Bấm nút [ RUN STEP ]
        |
[Màn hình bắt đầu bùng nổ hoạt ảnh bắn tia Laser SVG Neon cực kỳ mãn nhãn:]
  - Bước 1: Một tia laser lục Neon bắn cuộn từ Monaco Editor trỏ thẳng vào địa chỉ nhớ [ 0x3100A0 ] trên Heap.
  - Bước 2: Tia laser dừng tại bảng ảo VTable trong 800ms để hiển thị quá trình tra cứu phương thức draw().
  - Bước 3: VTable hoàn tất phân giải, tia laser bẻ góc uốn cong lộng lẫy bắn trực tiếp vào ô phương thức [ Circle.draw() ] của thẻ lớp Circle.
        |
[Đồng thời, dòng code định nghĩa phương thức Circle.draw() trong Monaco sáng rực rỡ]
[Học sinh òa lên phấn khích vì lần đầu tiên nhìn thấy cơ chế VTable Dynamic Dispatch bằng hình ảnh]
```

---

## 📌 KỊCH BẢN 2: THỰC NGHIỆM VI PHẠM ĐÓNG GÓI ACCESS MODIFIERS

### Tình huống: Học sinh cố tình nhấp truy cập thuộc tính balance được đánh dấu private của BankAccount từ lớp ngoài

```
[Học sinh mở sơ đồ lớp BankAccount UML Card]
[Thuộc tính [ balance ] đang được khóa chặt bằng biểu tượng ổ khóa đỏ Neon chói lọi]
[Mô tả bên cạnh hiển thị: private double balance]
        |
        v Học viên muốn thử nghiệm độ bảo mật của đóng gói
        v Dùng chuột kéo một con trỏ truy cập từ thẻ lớp [ Hacker ] chỉ thẳng vào ô [ balance ]
        |
[Hệ thống lập tức kích hoạt cơ chế đánh chặn bảo mật đóng gói Client-side:]
  - Thẻ lớp BankAccount lập tức phát sáng đỏ rực Neon và nhấp nháy cảnh báo.
  - Thẻ BankAccount liên tục rung lắc chấn động mạnh mẽ (Wiggle vibration) trong 2 giây.
  - Loa phát ra tiếng bíp báo lỗi đóng gói tinh tế.
  - Hiện thông báo nổi Neon: "ENCAPSULATION_ERROR: Thuộc tính balance là PRIVATE. Không thể truy cập từ Hacker!"
        |
[Sau 2 giây rung lắc, thẻ đối tượng tự khôi phục viền mờ Glassmorphism xanh mát như cũ]
[Học sinh gật gù thấu hiểu: access modifier private thực sự là bức tường thép bảo mật thuộc tính]
```
 Trải nghiệm thực hành OOP Sandbox sống động kết hợp hoạt ảnh bắn tia laser phân giải đa hình VTable Lookup và ổ khóa Neon đóng gói rung chấn chói lọi mang lại cho sinh viên một môi trường học lập trình hướng đối tượng trực quan, lôi cuốn, dễ hiểu và tràn đầy niềm vui khám phá khoa học bộ nhớ.
