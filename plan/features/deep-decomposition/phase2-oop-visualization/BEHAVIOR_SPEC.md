# 🎭 Behavioral Specification & OOP Sandbox Rules (Phase 2)

Tài liệu này đặc tả chi tiết quy chuẩn kiểm soát đóng gói access modifiers, giới hạn phân bậc kế thừa tối đa và các nguyên tắc bảo vệ bộ nhớ Heap ảo của phân hệ **OOP Concepts Visualizer**.

---

## 1. Ràng buộc Đóng gói Access Modifiers (Encapsulation Rules)

Để phản ánh chính xác các quy tắc thiết kế hướng đối tượng:
*   **Quy chuẩn Khóa Padlock bảo vệ:**
    *   **PRIVATE:** Thành viên chỉ được phép truy cập từ bên trong chính lớp khai báo nó. Mọi cuộc gọi truy xuất từ lớp ngoài (caller class khác target class) lập tức bị chặn đứng ở Client-side.
    *   **PROTECTED:** Thành viên được phép truy cập từ bên trong chính lớp đó hoặc các lớp con có quan hệ kế thừa trực tiếp/gián tiếp (Subclass Chain). Các cuộc gọi từ lớp ngoài không kế thừa sẽ bị cấm tuyệt đối.
    *   **PUBLIC:** Cho phép truy cập tự do từ mọi nơi không giới hạn.
*   **Hành vi khi vi phạm Đóng gói (Access Violation Behavior):**
    *   Nếu phát hiện hành vi truy cập trái phép thuộc tính `private` hay `protected`, thẻ Class UML của mục tiêu lập tức nhấp nháy phát sáng đỏ rực Neon và kích hoạt hiệu ứng CSS Wiggle rung lắc chấn động mạnh trong **2 giây** kèm tiếng bíp cảnh báo. Sau 2 giây, trạng thái tự động khôi phục về bình thường.

---

## 2. Hạn định Phân cấp Kế thừa & Cấp phát Heap ảo (Heap & Inheritance Limits)

Để ngăn chặn các trường hợp thiết kế đồ thị lặp vô hạn gây đơ giật trình duyệt của sinh viên:
*   **Giới hạn Chiều sâu Kế thừa (Inheritance Depth Cap):**
    *   Độ sâu phân cấp kế thừa tối đa được phép thiết lập trong Polymorphism Sandbox là **5 cấp** (Ví dụ: $A \leftarrow B \leftarrow C \leftarrow D \leftarrow E$). Mọi nỗ lực kế thừa sâu hơn sẽ bị chặn ở sandbox kèm thông báo: `"KẾ THỪA QUÁ SÂU: Giới hạn chiều sâu kế thừa tối đa là 5 cấp để đảm bảo tính trong sáng của sơ đồ thiết kế."`
*   **Hạn mức đối tượng trên Heap ảo (Heap Allocation Ceiling):**
    *   Để tránh tràn ngập màn hình trực quan gây rối mắt, số lượng đối tượng Heap Instance tối đa được phép khởi tạo cùng lúc là **10 đối tượng**.
    *   Khi vượt quá mốc 10, nút [ NEW INSTANCE ] sẽ chuyển sang trạng thái Disable mờ xám.

---

## 3. Chính sách Phân giải Đa hình VTable (VTable Resolution Timings)

*   **Thời gian trễ phân giải hoạt ảnh (Laser Dispatch Delays):**
    *   Khi người dùng chạy cuộc gọi đa hình, tia laser SVG bắn từ Monaco Editor chỉ vào địa chỉ nhớ VTable của Heap Object trong đúng **800ms** để học viên kịp quan sát bước tra cứu, sau đó mới bẻ hướng phản xạ bắn thẳng vào ô phương thức đã ghi đè của lớp con dưới thời gian trễ 10ms.
    *   Điều này giúp mắt người kịp thích ứng và thấu hiểu tiến trình Dynamic Dispatch diễn ra trong bộ nhớ máy tính.
