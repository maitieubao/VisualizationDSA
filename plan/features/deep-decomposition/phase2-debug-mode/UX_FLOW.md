# 🌊 UX Flow & Interactive Debugger Walkthroughs

Tài liệu này đặc tả chi tiết các kịch bản trải nghiệm người dùng (User Journeys) trong tiến trình đặt điểm dừng Breakpoint, gỡ lỗi từng dòng lệnh Monaco, theo dõi ngăn xếp đệ quy xếp chồng Call Stack và các chỉ số biến chạy trên **Algorithmic Step Debugger Workspace**.

---

## 📌 KỊCH BẢN 1: HỌC VIÊN ĐẶT BREAKPOINT & GỠ LỖI THUẬT TOÁN INSERTION SORT

### Tình huống: Người học muốn dừng đúng dòng hoán đổi giá trị để xem chỉ số biến chạy dịch chuyển

```
[Mở tab Lập trình Debug (Debugger Workspace)]
[Monaco Editor hiển thị mã hàm thô sắp xếp chèn (Insertion Sort)]
[Canvas bên phải hiển thị mảng cột số lộn xộn]
        |
        v Nhấp chuột trái vào lề dòng số 5: "arr[j+1] = arr[j];"
[Một chấm tròn đỏ Neon Rose phát sáng lấp lánh xuất hiện cực nhạy bên dòng 5]
        |
        v Nhấp nút [ START DEBUGGING ] màu Cyan rực rỡ
[Hệ thống tự động biên dịch sang Generator yield cô-ru-tin]
[Debugger lập tức đâm thẳng tới dòng số 5 chứa Breakpoint và tạm dừng tĩnh]
[Dòng số 5 trong Monaco Editor sáng bừng màu Cyan sương mờ sang trọng]
[Watch Panel bên dưới hiển thị: i = 1, j = 0, temp = 12 (giá trị phần tử chèn)]
[Dòng biến "j" lóe sáng viền Cyan rực rỡ biểu thị vừa bị gán thay đổi]
[Canvas bên phải vẽ cột số 12 nhô lên cao chuẩn bị chèn vào vị trí]
        |
        v Học viên mỉm cười hài lòng, nhấn nút [ CONTINUE ] để chạy tới mốc hoán vị tiếp theo
```

---

## 📌 KỊCH BẢN 2: TRỰC QUAN HÓA NGĂN XẾP ĐỆ QUY QUICK SORT DẠNG 3D XẾP CHỒNG

### Tình huống: Sinh viên muốn thấu hiểu tường tận các mốc ra/vào của lời gọi hàm đệ quy lồng nhau

```
[Đang gỡ lỗi thuật toán Quick Sort chia để trị đệ quy]
        |
        v Đặt điểm dừng tại dòng 8: "quickSort(arr, left, pivot - 1);"
        v Nhấp nút [ START DEBUGGING ]
[Hệ thống dừng chính xác tại dòng 8 chuẩn bị gọi đệ quy hàm trái]
[Visual Call Stack Tree hiển thị 1 thẻ duy nhất ở đỉnh Stack: "quickSort(0, 9)"]
        |
        v Học sinh nhấp chuột vào nút [ STEP INTO ] để chui vào thân hàm đệ quy con
[Dòng code quay về dòng số 1 bắt đầu hàm mới]
[Một thẻ đệ quy mới trượt mượt mà từ trên xuống xếp chồng lên thẻ cũ:]
"quickSort(0, 3) (Mới)"
"quickSort(0, 9) (Dưới)"
[Thẻ mới ở đỉnh sáng rực viền Neon Cyan, thẻ dưới mờ Slate sang trọng]
        |
        v Nhấn tiếp nút [ STEP OUT ] để thoát nhanh lời gọi đệ quy trái về hàm cha
[Thẻ "quickSort(0, 3)" ở đỉnh Stack thu nhỏ và biến mất mượt mà]
[Khung viền sáng rực Neon quay trở lại bao bọc thẻ cha "quickSort(0, 9)"]
[Học viên ồ lên thích thú vì Call Stack đệ quy trừu tượng hóa ra trực quan và dễ hiểu đến thế]
```
 Trải nghiệm gỡ lỗi tương tác động (Debugger Workspace) và trực quan Call Stack 3D giúp tháo gỡ hoàn toàn rào cản sợ đệ quy và lập trình giải thuật phức tạp, chắp cánh cho tư duy logic kỹ sư phần mềm xuất sắc.
