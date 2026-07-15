# 🌊 UX Flow & Interaction Scenarios - Execution Control

Tài liệu này đặc tả chi tiết các kịch bản trải nghiệm người dùng (User Journeys) thực tế trong quá trình tương tác điều khiển tiến trình phát thuật toán trên **VisualizationDSA**.

---

## 📌 KỊCH BẢN 1: ĐIỀU CHỈNH TỐC ĐỘ ĐỂ HỌC BƯỚC KHÓ

### Tình huống: Học sinh muốn xem chi tiết cơ chế phân hoạch hoán vị của Quick Sort

```
[Mở thuật toán Quick Sort]
        |
        v Giải thuật tự động phát ở tốc độ 1.0x mặc định
[Nhìn thấy mảng số nhảy đổi chỗ quá nhanh tại bước Partition]
        |
        v Click vào dropdown Tốc độ phát bên phải bảng điều khiển
[Chọn mốc tốc độ cực chậm: 0.25x]
        |
        v Hoạt ảnh trượt cột chuyển động siêu chậm (4000ms mỗi bước)
[Học sinh nhìn thấu từng mili-giây cột A tịnh tiến đổi chỗ với cột B]
        |
        v Bấm chọn lại 2.0x để lướt nhanh các bước sắp xếp nhỏ cuối cùng
```

---

## 📌 KỊCH BẢN 2: LÙI/TIẾN TỪNG BƯỚC KHỚP VỚI MÃ GIẢ (PSEUDOCODE)

### Tình huống: Người học muốn ôn thi, đối chiếu từng biến đổi mảng với dòng code sáng lên

```
[Xem hoạt ảnh Bubble Sort đang phát tự động]
        |
        v Thấy 2 phần tử Swap với nhau mà chưa kịp nhìn dòng code nào chịu trách nhiệm
[Gõ phím cách Space để Tạm dừng (Pause) tức thì]
        |
        v Nhấn phím Mũi tên Trái [<-] để lùi lại đúng 1 bước giải thuật
[Canvas snap về trạng thái trước so sánh, dòng Code giả 7 sáng lên: "if arr[j] > arr[j+1]"]
        |
        v Nhấn phím Mũi tên Phải [->] để tiến lại 1 bước giải thuật
[Nhìn cột mảng đổi chỗ, dòng Code giả 8 sáng lên: "swap(arr[j], arr[j+1])"]
        |
        v Đã hiểu rõ bản chất dòng code, gõ phím cách Space để phát tiếp
```

---

## 📌 KỊCH BẢN 3: KÉO THẢ TUA TIMELINE & XEM TOOLTIP ĐỘNG

### Tình huống: Sinh viên muốn nhảy nhanh tới giai đoạn trộn cuối cùng của Merge Sort

```
[Di trỏ chuột rê (Hover) qua các phân đoạn trên thanh Slider tiến trình]
        |
        v Một bong bóng Tooltip nhỏ hiện lên ngay đầu trỏ chuột
[Xem nội dung Tooltip: "Bước 24: Trộn hai mảng con đã sắp xếp hoàn thiện"]
        |
        v Nhấn giữ chuột trái và kéo Slider nhanh tới mốc bước 24 đó
[Mọi chuyển động bay dở dang bị hủy tức thì, Canvas hiển thị mảng tĩnh bước 24]
        |
        v Nhả chuột trái, bấm phím cách Space để bắt đầu phát tiếp từ mốc 24
```
