# 🌊 UX Flow & Interaction Design - E-Lecture Mode

Tài liệu này đặc tả chi tiết các luồng trải nghiệm người dùng (UX Flows), hành trình tương tác thực tế và kịch bản chuyển dịch giữa chế độ Bài giảng dẫn dắt (E-Lecture) và Tương tác tự do (Exploration) trong phân hệ **E-Lecture Mode**.

---

## 1. Hành trình Người dùng Mới (First-Time User Journey)

### Kịch bản: Sinh viên lần đầu học thuật toán Sắp xếp Trộn (Merge Sort)

```
[Mở link /algorithm/merge-sort]
        |
        v Hệ thống nhận diện New User (Local Storage check)
[Tự động kích hoạt E-Lecture Overlay]
        |
        v Slide 1: Trình bày lý thuyết "Chia để trị" (Canvas tĩnh)
[Nhấn nút Next]
        |
        v Slide 2: Phát kịch bản chia nhỏ mảng
        v (Panel tự động mờ đi 80%, Canvas tự động chạy đến Frame 10 rồi dừng)
[Panel phóng to lại, chữ giải thích "Bạn đã hiểu cơ chế chia đôi chưa?"]
        |
        +-----> Nhấn [ Exit Tutorial ]
        |             |
        |             v
        |       [Mở khóa 100% Canvas] (Timeline, Speed, Custom Input mở)
        |       [Học viên tự do nhập mảng, tự kéo trượt khám phá]
        |
        +-----> Nhấn [ Next > ]
                      |
                      v
                [Tiếp tục đi sâu slide 3 bài giảng...]
```

1.  **Bước 1: Tiếp cận lần đầu:** Sinh viên nhấp vào liên kết học thuật toán Merge Sort. Hệ thống kiểm tra dữ liệu bộ nhớ cục bộ `localStorage.getItem('has_completed_tutorial')`. 
2.  **Bước 2: Tự động Onboarding:** Do chưa hoàn thành hướng dẫn sử dụng, một thẻ E-Lecture Overlay hiện lên cùng lớp phủ làm mờ đằng sau che Canvas. Slide 1 giới thiệu ý tưởng chính về chia để trị.
3.  **Bước 3: Xem hoạt ảnh minh họa:** Sinh viên nhấn **[ Next > ]**. Thẻ bài giảng tự động mờ đi còn `opacity: 0.2` để lộ rõ Canvas phía sau. Canvas tự chạy mô phỏng chia mảng từ Frame 0 đến Frame 10 rồi tự động dừng lại đúng điểm. Thẻ bài giảng phóng to trở lại sắc nét cùng dòng chữ mới: *"Bạn thấy mảng đã được phân tách đôi chưa? Nhấn tiếp tục để xem cách trộn mảng."*
4.  **Bước 4: Thoát để tự tương tác:** Bất kỳ lúc nào, sinh viên có thể nhấn nút **[ Exit Tutorial ]** ở góc trên. Thẻ bài giảng biến mất mượt mà, lớp phủ tối nền được dọn dẹp, toàn bộ thanh trượt thời gian (Timeline) và bộ nhập mảng tự chế (Custom Input) được mở khóa để học viên tự do nghịch thử nghiệm.

---

## 2. Kích hoạt Chủ động (Manual Activation Flow)

Nếu học viên đang ở chế độ tự vọc tự do (Exploration Mode) và muốn quay trở lại nghe giảng có kịch bản:
1.  Người dùng nhấp vào nút hành động nổi **[ 📖 Học Bài Giảng ]** (E-Lecture Mode Button) ở góc trên thanh công cụ điều khiển.
2.  Hệ thống nạp nhanh kịch bản bài học tương ứng, mở lại thẻ Panel kính mờ E-Lecture, tự động đưa Canvas về Frame 0 và bắt đầu hành trình dẫn dắt sư phạm bài bản.

---

## 3. Bản đồ Chuyển dịch Phím tắt Tiếp cận (Accessibility Key Mappings)

Để hỗ trợ tối đa người học sử dụng thiết bị chuyên biệt hoặc thao tác nhanh bằng bàn phím máy tính:

*   **Phím Mũi tên Phải (Right Arrow):** Thực hiện tiến sang Slide tiếp theo (Next Slide), tương đương click chuột nút `Next`. Bị vô hiệu hóa nếu hoạt ảnh Canvas đang tự chạy.
*   **Phím Mũi tên Trái (Left Arrow):** Thực hiện quay lại Slide phía trước (Back Slide), tương đương click chuột nút `Back`. Bị vô hiệu hóa nếu đang ở slide đầu tiên.
*   **Phím Esc (Escape):** Thực hiện đóng và thoát nhanh chế độ bài học, quay lại màn hình tương tác tự do.
*   **Phím Spacebar (Dấu cách):** Tạm dừng hoặc tiếp tục chạy hoạt ảnh minh họa của Slide hiện tại trong quá trình tự phát.
