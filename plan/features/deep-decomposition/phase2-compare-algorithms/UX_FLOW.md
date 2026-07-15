# 🌊 UX Flow & Interactive Comparator Walkthroughs

Tài liệu này đặc tả chi tiết các kịch bản trải nghiệm người dùng (User Journeys) trong tiến trình cấu hình đối sánh thuật toán song song, theo dõi các chỉ số hiệu năng trực quan và kéo tua slider đồng bộ trên **Side-by-Side Algorithm Comparator**.

---

## 📌 KỊCH BẢN 1: HỌC VIÊN SO SÁNH TRỰC DIỆN BUBBLE SORT VÀ QUICK SORT

### Tình huống: Người học muốn thấy sự chênh lệch hiệu năng thực tế của hai giải thuật sắp xếp kinh điển

```
[Mở tab Đối sánh Thuật toán (Algorithm Comparator)]
[Màn hình phân đôi Split Screen cân đối hiện ra]
        |
        v Rê chuột chọn các lựa chọn đầu vào:
        v - Bên Trái (Left Algorithm): Chọn [ Bubble Sort ]
        v - Bên Phải (Right Algorithm): Chọn [ Quick Sort ]
[Hai Canvas vẽ trạng thái mảng thô ban đầu đứng yên giống hệt nhau]
        |
        v Nhấp chuột vào nút [ TẠO DỮ LIỆU ĐỒNG NHẤT ]
[Hệ thống tiêm mảng số ngẫu nhiên [42, 12, 85, 3, 19] vào cả hai bên]
        |
        v Nhấp nút [ PLAY SYNCHRONIZED ] trên thanh điều khiển chung
[Cả hai Canvas cùng chuyển động song song mượt mà ở tốc độ 1.0x]
[Thẻ đo lường hiệu năng Comparative Stats Board bắt đầu đập số cập nhật liên tục]
        |
        v Khoảng 1.0 giây trôi qua...
[Canvas bên phải (Quick Sort) dừng lại tức khắc, cột mảng số xếp ngay ngắn màu xanh]
[Hộp thoại bên phải hiển thị huy hiệu Emerald phát sáng: "HOÀN THÀNH (15 bước)"]
[Canvas bên trái (Bubble Sort) vẫn tiếp tục quét so so sánh di chuyển chầm chậm]
[Bảng chỉ số chênh lệch hiện rõ: Comparisons Bubble 120 vs Quick 14]
[Học sinh ồ lên thấu hiểu sâu sắc tiệm cận Big-O của Quick Sort O(n log n) so với Bubble O(n^2)]
```

---

## 📌 KỊCH BẢN 2: KÉO SLIDER ĐỒNG BỘ ĐỂ PHÂN TÍCH TĨNH TRẠNG THÁI 50% TIẾN TRÌNH

### Tình huống: Học sinh muốn xem tại nửa chặng đường sắp xếp, hình dạng mảng số của 2 giải thuật khác nhau thế nào

```
[Bài giảng so sánh đang phát tự động]
        |
        v Nhấp nút [ PAUSE ] trên cụm điều khiển chung để tạm dừng tĩnh
[Cả hai Canvas con cùng đứng yên lập tức]
        |
        v Rê chuột kéo thanh tua Range Slider trung tâm về mốc chính giữa [ 50% ]
[Canvas bên trái (Bubble Sort) tự động snap về Frame thứ 40]
[Quan sát: Nửa mảng bên phải đã được xếp đều đặn, nửa bên trái vẫn lộn xộn]
[Canvas bên phải (Quick Sort) tự động snap về Frame thứ 7]
[Quan sát: Trục Pivot đang chia mảng số thành hai phân vùng rõ rệt]
        |
        v Học sinh chụp ảnh màn hình lưu báo cáo thực nghiệm thực tế xuất sắc
```
 Các hành trình trải nghiệm được thiết kế tỉ mỉ, mượt mà và trực quan hóa chiều sâu giúp học sinh dễ dàng chuyển hóa từ học thuộc lòng công thức khô khan sang tư duy kỹ sư phân tích thực nghiệm xuất sắc.
