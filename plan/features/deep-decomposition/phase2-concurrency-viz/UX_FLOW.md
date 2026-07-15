# 🌊 UX Flow & Interactive Multithreading Walkthroughs

Tài liệu này đặc tả chi tiết các kịch bản trải nghiệm người dùng (User Journeys) trong tiến trình cấu hình kịch bản đa luồng, theo dõi tranh chấp vùng găng và chứng kiến cảnh báo chuông đỏ tắc nghẽn Deadlock trên **Concurrency & Threading Visualizer**.

---

## 📌 KỊCH BẢN 1: HỌC VIÊN PHÁT HIỆN LỖI RACE CONDITION & BẢO VỆ BẰNG MUTEX LOCK

### Tình huống: Học sinh muốn xem thực tế đa luồng cộng dồn Counter gây ra sai số thế nào khi không có khóa bảo vệ

```
[Mở tab Trực quan đa luồng (Concurrency Visualizer)]
[Monaco Editor hiển thị mã giả đa luồng cộng counter dùng chung]
[Màn hình Canvas hiển thị 2 đường ray song song đại diện cho Luồng A và Luồng B]
        |
        v Rê chuột chọn kịch bản [ Race Condition Demo ]
        v Nhấp nút [ PLAY SIMULATION ] màu Cyan lấp lánh
[Hai quả cầu Luồng A và Luồng B cùng trượt song song dọc đường ray thô]
[Cả hai cùng lao qua cổng mốc 50% vùng găng tự do (vì Mutex đang TẮT)]
[Màn hình Console chớp đỏ nhấp nháy báo lỗi xung đột ghi đè tài nguyên]
[Chỉ số sharedCounter chỉ tăng lên 15 (thay vì 20 do bị ghi đè dữ liệu bất đồng bộ)]
        |
        v Học sinh gật gù thấu hiểu, rê chuột bật công tắc [ ENABLE MUTEX LOCK ]
        v Nhấp nút [ RESET SCENARIO ] rồi nhấp lại [ PLAY SIMULATION ]
[Luồng A chạy trước chạm cổng 50%, Mutex xoay tròn chuyển Amber báo KHÓA LẠI]
[Luồng B chạy sau tới cổng 50% lập tức KHỰNG LẠI, đổi màu Amber trạng thái BLOCKED xếp hàng]
[Luồng A trượt hết đường ray mốc 100%, Mutex nhả khóa Cyan]
[Cổng găng mở ra, Luồng B ngay lập tức được đánh thức trượt tiếp qua cổng]
[Chỉ số sharedCounter tăng lên 20 chính xác tuyệt đối, viền Emerald phát sáng rực rỡ]
```

---

## 📌 KỊCH BẢN 2: THỰC THI SCENARIO DEADLOCK & ĐƯỢC GIẢI CỨU BỞI DEADLOCK DETECTOR

### Tình huống: Người học mô phỏng bài toán triết gia tranh chấp đũa gây nghẽn vòng tròn Deadlock

```
[Đang ở giao diện Concurrency Visualizer]
        |
        v Rê chuột chọn kịch bản [ Deadlock Circle Demo ]
        v Nhấp nút [ PLAY SIMULATION ]
[Luồng A chạy chiếm khóa L1 ở mốc 40%, Luồng B chạy chiếm khóa L2 ở mốc 40%]
[Cả hai luồng ảo tiếp tục trượt tới mốc 70%]
[Luồng A đòi hỏi thêm khóa L2 đang bị Luồng B giữ -> Luồng A lập tức BLOCKED dừng lại]
[Luồng B đòi hỏi thêm khóa L1 đang bị Luồng A giữ -> Luồng B lập tức BLOCKED dừng lại]
        |
        v Cả hai luồng cùng đứng im khựng lại tại mốc 70%
        v Đúng 10ms sau khi xảy ra nghẽn khóa chéo...
[Toàn bộ đường ray (Thread Rails) nhấp nháy đỏ Neon rực rỡ báo động Deadlock]
[Một huy hiệu Rose đỏ hiện lên góc màn hình: "CẢNH BÁO DEADLOCK: Chu trình nghẽn L1 <-> L2"]
[Hộp thoại console hướng dẫn sinh viên cách đổi thứ tự acquireLock để giải phóng tắc nghẽn]
        |
        v Học viên hào hứng sửa lại thứ tự lock trên mã nguồn giả và nhấn Run biên dịch thành công
```
 Trải nghiệm lập trình bất đồng bộ trực quan sinh động giúp biến các khái niệm trừu tượng, khó nuốt nhất của ngành khoa học máy tính trở thành các bài học tương tác vô cùng lôi cuốn, nuôi dưỡng tình yêu lập trình hệ thống của học sinh.
