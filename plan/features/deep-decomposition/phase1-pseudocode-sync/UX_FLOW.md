# 🌊 UX Flow & Interactive Code Walkthroughs - Pseudocode Sync

Tài liệu này đặc tả chi tiết các kịch bản trải nghiệm người dùng (User Journeys) trong tiến trình thao tác bảng mã giả đa ngôn ngữ và điều hướng dòng lệnh trên **Pseudocode Sync**.

---

## 📌 KỊCH BẢN 1: HỌC THUẬT TOÁN SẮP XẾP SỬ DỤNG TÍNH NĂNG TABS & WATCH PANEL

### Tình huống: Người học muốn ôn tập thuật toán Sắp xếp nổi bọt (Bubble Sort) trên ngôn ngữ Python

```
[Chọn bài học Sắp xếp nổi bọt] -> [Màn hình Split-Screen xuất hiện]
[Phía bên trái: Canvas hiển thị các cột số thô đang đứng yên]
[Phía bên phải: Code Panel hiển thị cú pháp mặc định C++]
        |
        v Rê chuột sang bảng bên phải, nhấp vào tab [ Python ] trong con nhộng ngôn ngữ
[Mã nguồn lập trình chuyển đổi tức khắc sang cú pháp Python]
        |
        v Bấm nút [ PLAY ] trên thanh điều khiển hoạt ảnh
[Hoạt ảnh Canvas bắt đầu di chuyển chậm rãi ở tốc độ 1.0x]
[Dòng 4: "if arr[j] > arr[j+1]:" phát sáng Neon Emerald dịu nhẹ]
[Watch Panel hiển thị giá trị các biến chạy: j = 0, i = 0]
        |
        v Thuật toán chuyển đến bước hoán vị
[Cột số màu vàng Canvas trượt sang phải hoán đổi chỗ]
[Dòng 5: "arr[j], arr[j+1] = arr[j+1], arr[j]" lập tức sáng rực Emerald]
[Nhãn chữ "temp" xuất hiện trên Watch Panel báo trị số hoán đổi]
```

---

## 📌 KỊCH BẢN 2: TƯƠNG TÁC NGƯỢC (CLICK-TO-SNAP) & ĐIỀU HƯỚNG BẰNG PHÍM MŨI TÊN

### Tình huống: Học sinh ôn thi muốn kiểm tra nhanh bước hoán vị mảng diễn ra khi nào

```
[Đang xem bài giảng hoạt ảnh trôi đi chậm chạp]
        |
        v Nhấp chuột trực tiếp vào dòng chữ "swap" (Dòng 5) trên Code Panel
[Hoạt ảnh Canvas tự động dịch chuyển chớp nhoáng (Snap) tới Frame thứ 12]
[Hai cột số A và B trên Canvas chuyển sang màu vàng tươi đang chuẩn bị hoán đổi]
[Bảng điều khiển tự động chuyển sang chế độ PAUSE (Tạm dừng) để sinh viên phân tích tĩnh]
        |
        v Người học muốn xem thủ công từng dòng lệnh tiếp theo bằng bàn phím
[Nhấn phím Mũi tên Xuống (Arrow Down) trên bàn phím máy tính]
[Dòng highlight dịch chuyển xuống Dòng 6: "j += 1"]
[Canvas tự động tiến lên 1 frame, các cột số chuyển về màu xanh lam bình thường]
[Biến j ở Watch Panel tăng từ 0 lên 1 tức khắc]
```

---

## 3. Bản đồ Phím tắt Điều khiển Mã nguồn (Keyboard Navigation shortcuts)

Hỗ trợ người dùng ôn luyện học thuật nhanh bằng phím bấm máy tính khi tiêu điểm đang nằm tại bảng Code Panel:

*   **Phím `Arrow Down` / `Mũi tên Xuống`:** Tiến tới khung hình thực thi của dòng lệnh tiếp theo (Step Forward).
*   **Phím `Arrow Up` / `Mũi tên Lên`:** Lùi lại khung hình thực thi của dòng lệnh trước đó (Step Backward).
*   **Phím `Tab`:** Tuần tự hoán chuyển giữa các tab ngôn ngữ lập trình (C++ -> Java -> Python -> JavaScript -> C++).
