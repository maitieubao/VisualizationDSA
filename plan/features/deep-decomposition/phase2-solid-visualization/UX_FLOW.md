# 🌊 UX Flow & Interactive SOLID Visualizer Walkthroughs

Tài liệu này đặc tả chi tiết các kịch bản trải nghiệm người dùng (User Journeys) khi học viên thực hành sửa lỗi thiết kế quá nhiệt SRP bùng cháy hạt lửa, rạn nứt nổ vỡ laser LSP và đảo chiều Dependency Inversion trên **SOLID Principles Visualizer**.

---

## 📌 KỊCH BẢN 1: TÁI CẤU TRÚC LỚP QUÁ NHIỆT SRP (SINGLE RESPONSIBILITY)

### Tình huống: Sinh viên khắc phục lỗi thiết kế Class UserManager ôm đồm quá nhiều việc

```
[Học sinh mở bài học Single Responsibility Principle]
[Màn hình hiển thị Thẻ Lớp UserManager UML gánh vác 3 nhiệm vụ: DB, Hashing, SMTP Email]
        |
        v LCOMCalculator phát hiện LCOM4 = 3 (Vi phạm SRP nghiêm trọng!)
[Thẻ UserManager lập tức Quá nhiệt (Overheated):]
  - Viền card phát sáng đỏ Neon chói lọi bập bùng.
  - Canvas 2D phía sau phun tia lửa đỏ cam Neon tóe ra dữ dội như lò than rực cháy.
  - Biểu ngữ đỏ rực hiện cảnh báo lỗi thiết kế: "UserManager đang gánh vác quá nhiều việc!"
        |
[Sinh viên nhấp chuột vào nút [ SPLIT CLASS ] màu xanh Neon lơ lửng dưới Card]
        |
        v Hệ thống thực thi phân tách tái cấu trúc cực nhạy dưới 10ms
[Thẻ UserManager vỡ đôi thành 3 Thẻ Lớp chuyên biệt, sắp xếp thẳng hàng tuyệt đẹp:]
  - Thẻ 1: UserRepository (chuyên DB)
  - Thẻ 2: PasswordHasher (chuyên băm mật khẩu)
  - Thẻ 3: EmailNotifier (chuyên SMTP gửi mail)
        |
[Hiệu ứng hạ nhiệt bừng sáng diễn ra:]
  - Hạt lửa bập bùng tắt ngúm làm sạch RAM GC.
  - Viền 3 thẻ lớp đổi màu lục Emerald mát mắt cực kỳ êm dịu.
  - Màn hình nổ pháo hoa Confetti chúc mừng: +30 XP rực rỡ và ngọn lửa Streak.
```

---

## 📌 KỊCH BẢN 2: THAY THẾ CON TRỎ LSP BỊ NỨT VỠ LASER (LISKOV SUBSTITUTION)

### Tình huống: Đà điểu kế thừa Chim nhưng không bay được gây nứt vỡ hệ thống

```
[Học sinh mở bài học Liskov Substitution Principle]
[Màn hình hiển thị con trỏ Bird và đối tượng gọi hàm client.makeBirdFly(bird)]
[Học sinh kéo thả đối tượng con Ostrich (Đà điểu) thay thế vào vị trí tham số bird]
        |
[Học viên nhấp nút [ RUN SUBSTITUTION ] để giả lập truyền tin]
        |
[Hệ thống giả lập truyền tin laser trong 800ms:]
  - Tia laser màu xanh lục bừng sáng nối từ hàm makeBirdFly() đâm thẳng vào Ostrich.
  - Dòng lệnh giả lập bắt đầu truyền tin trôi nổi.
        |
        v Đến mốc 800ms, Ostrich ném ngoại lệ NotImplementedException!
        |
[Hệ thống kích hoạt hoạt ảnh rạn nứt nổ vỡ tan nát giật gân (LSP Shatter):]
  - Phát âm thanh thủy tinh nứt vỡ giòn giã rợn người.
  - Tia laser xanh lục nổ tung rạn nứt thành các vệt ziczac đỏ rực `.lsp-laser-fracture-line`.
  - Hàng vạn tinh thể laser vụn vỡ rơi rụng dần dần rồi tan biến 60 FPS.
  - Hộp phản hồi hiện cảnh báo: "LSP VI PHẠM! Đà điểu không thể bay, thay thế gây đổ vỡ hệ thống!"
```
 Trải nghiệm quá nhiệt SRP bùng cháy hạt lửa Canvas 2D kết hợp rạn nứt nổ tan nát laser LSP và đảo chiều DIP mang lại cho sinh viên cảm giác tương tác vật lý vô cùng sống động, xóa tan sự trừu tượng khô khan của các nguyên lý thiết kế hệ thống hướng đối tượng SOLID.
