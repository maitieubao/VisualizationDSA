# 🎭 Behavioral Specification & Edge Case Rules (Pseudocode Sync)

Tài liệu này đặc tả chi tiết các quy tắc xử lý biên, cơ chế chuyển tiếp hoạt ảnh tốc độ cao và hành vi hiển thị biến số khi vượt ngoài phạm vi tầm vực (Scope) trên **Pseudocode Sync**.

---

## 1. Cơ chế Tua nhanh & Đồng bộ Tốc độ cao (Fast Playback Performance)

Khi người học tăng tốc độ phát hoạt ảnh lên mức tối đa (ví dụ: tua ở tốc độ 2.0x hoặc 3.0x trong thanh trượt điều khiển):
*   **Vấn đề:** Các dòng mã nguồn sẽ được highlight liên tục chớp nhoáng, có thể gây ra hiện tượng mỏi mắt hoặc giật nhấp nháy liên tục do tần số quét màn hình không đáp ứng kịp.
*   **Hành vi xử lý:**
    *   Hệ thống tự động áp dụng cơ chế **Debounced Highlight Updates** ở mức 50ms khi phát ở tốc độ $\ge 2.0\text{x}$.
    *   Nếu thời gian chuyển đổi giữa 2 frame kế tiếp nhỏ hơn 50ms, hệ thống sẽ bỏ qua bước trung gian (skip intermediate code highlights) và chỉ highlight dòng code đích cuối cùng của tổ hợp dịch chuyển để bảo vệ thị giác của người học.

---

## 2. Quy tắc Định vị Ngược Click-to-Snap Trùng lặp (Duplicate Logical ID Snapping)

Trong các thuật toán lặp đi lặp lại (như Bubble Sort lặp hàng chục lần so sánh và hoán vị):
*   **Vấn đề:** Dòng lệnh hoán vị `"SWAP_STEP"` được thực thi ở hàng chục khung hình khác nhau xuyên suốt tiến trình giải thuật. Vậy khi người học click vào dòng `swap` trên bảng code, hệ thống nên nhảy tới khung hình nào?
*   **Hành vi xử lý:**
    *   **Quy tắc mặc định:** Hệ thống luôn ưu tiên nhảy tới **Khung hình đầu tiên thực thi dòng lệnh đó** (First occurrence) tính từ đầu tiến trình.
    *   **Quy tắc tối ưu sư phạm:** Phía bên mép phải dòng lệnh hiển thị một nút điều hướng nhỏ màu Slate nhạt biểu thị số lần thực thi (ví dụ: `1/5`). Học sinh có thể click liên tục vào dòng lệnh để tuần tự chuyển tiếp (Cycle/Step) qua các mốc khung hình thực thi kế tiếp của dòng đó:
        $$\text{Frame}_{next} = (\text{CurrentIndex} + 1) \pmod{\text{TotalOccurrences}}$$

---

## 3. Quản lý tầm vực biến ở Watch Panel (Out of Scope Variables)

Khi giải thuật chuyển tiếp giữa các hàm hoặc các khối lệnh con:
*   **Vấn đề:** Một số biến chỉ số (ví dụ: biến tạm thời `temp` hoặc con trỏ `pivot`) chưa được khai báo hoặc đã đi ra ngoài tầm vực của khối lệnh hiện hành (Out of Scope).
*   **Hành vi xử lý:**
    *   Không hiển thị các giá trị lỗi như `undefined` hoặc `null` gây bối rối cho sinh viên.
    *   **Quy tắc ẩn:** Ẩn hoàn toàn nhãn biến đó khỏi Watch Panel. Chỉ hiển thị các biến thực sự đang có giá trị sống trong khung hình hoạt ảnh hiện tại.
    *   Khi biến được khởi tạo lại ở frame tiếp theo (ví dụ: bắt đầu vòng lặp con gán `j = 0`), huy hiệu biến `j` tự động trượt xuất hiện trở lại với hiệu ứng Fade-in mượt mà.
