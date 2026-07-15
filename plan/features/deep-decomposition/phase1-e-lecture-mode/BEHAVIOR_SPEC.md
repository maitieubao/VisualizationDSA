# 🎭 Behavioral Specification & Interaction Rules (E-Lecture)

Tài liệu này đặc tả chi tiết các quy tắc xử lý chuyển tiếp trạng thái, kịch bản biên dịch hành động người dùng và các quy định tương tác an toàn giữa E-Lecture Mode và Animation Engine.

---

## 1. Cơ chế Bỏ qua Hoạt ảnh (Skip / Fast-forward Behavior)

Khi Slide phát lệnh `PLAY_UNTIL` hoạt ảnh từ Frame 0 đến Frame 20, Canvas bắt đầu chạy hoạt ảnh minh họa. Trong thực tế sử dụng:
*   **Hành vi Skip:** Nếu người học đã hiểu nhanh nội dung hoặc không muốn đợi hoạt ảnh chạy trượt xong, họ có thể nhấn nút **[ Next > ] (Tiếp tục)** ngay lập tức.
*   **Xử lý hệ thống:**
    1.  Hệ thống ngắt ngay vòng lặp giám sát hoạt ảnh hiện tại.
    2.  Ra lệnh cho Animation Engine thực hiện dịch chuyển tức thời (Instant Snap) tới Frame đích số 20.
    3.  Tải nội dung và lệnh của Slide số 3 tiếp theo ngay lập tức mà không gặp bất kỳ độ trễ nào.
    4.  Mở khóa các tương tác mới.

---

## 2. Bảo vệ Ngữ cảnh Sư phạm (State Interaction Lock)

Để đảm bảo người học luôn tiếp cận kiến thức theo đúng lộ trình khoa học và tránh việc nghịch ngợm làm đứt gãy ngữ cảnh giáo án:
*   **Khóa Timeline Scrubbing:** Khi E-Lecture Mode đang hoạt động, thanh trượt thời gian (Timeline Slider) của Canvas hoàn toàn bị vô hiệu hóa (Disabled/Locked). Học viên không thể kéo thả bừa bãi làm sai lệch Frame dữ liệu đang học.
*   **Khóa speed & custom input:** Nút tinh chỉnh tốc độ (Speed Slider) và khung nhập dữ liệu tùy chọn (Custom Input Editor) bị khóa hoàn toàn.
*   **Phục hồi khi thoát (On Exit Restore):** Khi nhấn đóng `Exit E-Lecture`, toàn bộ các công cụ trên (Timeline, Speed, Custom Input) được phục hồi 100% quyền tương tác tự do để học viên thỏa sức vọc thử nghiệm.

---

## 3. Quy tắc làm mờ mờ đục hóa (Focus Overlay Transitions)

*   **Trạng thái Chờ hoạt ảnh (Waiting Mode):** Khi Canvas đang chạy tự động minh họa, Panel bài giảng chuyển trạng thái sang dạng bán trong suốt (`opacity: 0.2`) và vô hiệu hóa mọi sự kiện click chuột (`pointer-events: none`) để mắt người học tập trung hoàn toàn vào các cột đồ họa Canvas đang trượt chéo đổi vị trí.
*   **Trạng thái Tĩnh (Static Mode):** Khi Canvas chạy xong hoặc người học chủ động tạm dừng hoạt ảnh, Panel bài giảng lập tức phóng to phục hồi độ sắc nét (`opacity: 1`, `pointer-events: auto`) để sẵn sàng cho sinh viên tiếp thu bài học.

---

## 4. Quay lui thời gian khi nhấn Back (Backwards Slide Rollback)

Nếu người học nhấn quay lại Slide trước đó (`[ < Back ]`):
*   Hệ thống đọc ngược lệnh hành động của slide đó.
*   Ví dụ: Slide trước có lệnh `RESET_CANVAS` tại Frame 0. Hệ thống sẽ tự động điều khiển Animation Engine quay lui thời gian và hiển thị chính xác trạng thái mảng ban đầu tại Frame 0. Điều này giúp học sinh dễ dàng ôn tập lại kiến thức vừa trượt qua.
