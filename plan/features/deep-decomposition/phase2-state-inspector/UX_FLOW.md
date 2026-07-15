# 🌊 UX Flow & Interactive Debugging Walkthroughs

Tài liệu này đặc tả chi tiết các kịch bản trải nghiệm người dùng (User Journeys) khi sinh viên thực hành gỡ lỗi từng bước, theo dõi biến số động và nhấp chọn Stack Frame lội ngược dòng thời gian trên **State Inspector & Dynamic Variables Panel**.

---

## 📌 KỊCH BẢN 1: THEO DÕI BIẾN SỐ ĐỘNG CON TRỎ CHỈ SANG HEAP (HEAP POINTER LINK)

### Tình huống: Học sinh gỡ lỗi giải thuật Fibonacci, hover biến cục bộ rà con trỏ

```
[Học sinh bấm phát hoạt ảnh từng bước (Step-by-Step) của giải thuật Fibonacci]
[Hoạt ảnh chạy đến bước 14: Lệnh gọi hàm fib(3) được đẩy vào ngăn xếp]
        |
[Khung Stack Frame mới `fib(3)` xếp chồng 3D Glassmorphic lên đỉnh Call Stack Container]
  - Viền frame bừng sáng Cyan rực rỡ báo hiệu là Top Frame đang chạy.
  - Bên trong hiện danh sách biến: n = 3, ptr = 0x7ffd98.
        |
[Mũi tên Neon uốn lượn SVG Pointer nét đứt lập tức bắn ra:]
  - Nối từ ô biến `ptr` trong Stack Frame.
  - Chỉ thẳng sang ô nhớ đối tượng Node-bar-2 trên Canvas Heap ảo.
  - Luồng sáng Neon Cyan trôi trượt dọc mũi tên tả dòng tham chiếu của con trỏ.
        |
[Sinh viên di chuột (Hover) qua tên biến `ptr` ở ngăn xếp:]
  - Ô nhớ đối tượng Node-bar-2 bên Heap ảo lập tức bừng sáng xung nhịp Amber Neon chớp tắt lôi cuốn.
  - SV hiểu rõ ngay lập tức: "À! Biến ptr này đang quản lý trỏ đúng địa chỉ của Node-bar-2 kia!"
        |
[Sinh viên rời chuột ra -> Xung nhịp Amber tắt ngúm êm dịu, khôi phục trạng thái cũ]
```

---

## 📌 KỊCH BẢN 2: LỘI NGƯỢC DÒNG THỜI GIAN NHẤP CHỌN FRAME CŨ (STACK FRAME REVEAL)

### Tình huống: Học sinh nhấp chọn Stack Frame cũ để thanh tra biến số quá khứ

```
[Call Stack đang sâu 3 cấp xếp chồng: fib(3) -> fib(2) -> fib(1)]
[Khung fib(3) đang nằm trên đỉnh, active]
        |
[Sinh viên nhấp chuột (Click) chọn Khung Stack Frame cũ `fib(2)` ở phía dưới]
        |
        v Hệ thống thực thi đồng bộ ngữ cảnh lập tức dưới 10ms
[Khung fib(2) đổi trạng thái sáng viền Cyan báo hiệu đang được thanh tra:]
  - Bảng biến số cập nhật danh sách biến cục bộ của tầng cũ: n = 2.
  - Cây đệ quy SVG Recursion Tree highlight nhánh gọi `fib(2)` sáng xanh Neon mát mắt.
        |
[Monaco Editor bên cạnh tự động cuộn dòng lệnh (Auto-Scroll):]
  - Di chuyển con trỏ và bôi sáng vàng rực dòng code số 12 (Dòng lệnh đệ quy đã gọi fib(2)).
  - Giúp học viên thấu hiểu: "Tầng fib(2) này được đẻ ra từ dòng code số 12 của tầng cha!"
        |
[Học sinh bấm [ TIẾP TỤC CHẠY ] -> VCR khôi phục chạy tiếp, stack frame đỉnh trở lại active]
```
 Trải nghiệm xếp chồng Call Stack 3D kính mờ Glassmorphic kết hợp đường cong SVG Bezier nét đứt chạy luồng sáng Neon chỉ Heap và click frame nhảy dòng code Monaco mang lại cho sinh viên cảm giác gỡ lỗi cực đỉnh, sành điệu như một chuyên gia lập trình thực thụ.
