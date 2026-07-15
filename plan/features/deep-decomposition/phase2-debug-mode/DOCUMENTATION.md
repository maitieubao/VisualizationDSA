# 📚 Core Architectural Decisions (Algorithmic Debugger)

Tài liệu này ghi nhận Quyết định Thiết kế Kiến trúc (ADR) chứng minh tính tối ưu hiệu năng, độ chính xác gỡ lỗi dòng và giải pháp sư phạm của bộ biên dịch cô-ru-tin Generator trong phân hệ **Algorithmic Step Debugger Workspace**.

---

## 1. Architectural Decision Records (ADR)

### ADR-12: Bộ gỡ lỗi Tạm dừng/Chạy tiếp dạng Cô-ru-tin (Simulated Coroutine-like Pause/Resume Engine)

#### Bối cảnh (Context)
Trong giảng dạy khoa học máy tính, khả năng chạy từng bước dòng code (Stepping) và đặt điểm dừng (Breakpoint) là vô cùng thiết thực. Tuy nhiên, việc triển khai một trình debugger tùy biến trên trình duyệt gặp các thách thức cực kỳ khó khăn:
*   *Thử thách 1 (JS là đơn luồng):* JavaScript chạy trên trình duyệt web mặc định là đơn luồng (Single-threaded). Khi mã nguồn của sinh viên chạy, ta không thể chặn đứng luồng thực thi giữa dòng lệnh bằng các hàm busy-waiting hoặc `sleep()` thô sơ vì trình duyệt sẽ báo lỗi giật lag màn hình hoặc treo cứng tab ngay lập tức.
*   *Thử thách 2 (Gỡ lỗi hàm đệ quy):* Đối với các thuật toán đệ quy phức tạp (ví dụ: Quick Sort chia để trị), việc dựng cây Call Stack đệ quy dạng bậc thang 3D trực quan yêu cầu ta phải biết chính xác mốc ra/vào của từng lớp hàm con lồng ghép thời gian thực.

#### Quyết định (Decision)
Hệ thống quyết định áp dụng giải pháp **Hàm tạo Generator (`function*`) kết hợp từ khóa `yield` tiêm mã tự động qua AST Compiler ở Client-side**:
1.  **Dịch cú pháp AST sang dạng Generator:** Biến đổi hàm sắp xếp thông thường của sinh viên thành hàm Generator đặc biệt.
2.  **Tiêm Yield tại mỗi dòng thực thi:** Dùng `estraverse` chèn lệnh `yield` mang theo trạng thái biến thô và mảng Call Stack tại mỗi dòng thực thi lệnh.
3.  **Điều khiển Step bằng Iterator `.next()`:** Khi sinh viên bấm phím `Step Over`, Main Thread chỉ cần gọi `generator.next()`. Luồng thực thi lập tức chạy tiếp tới dòng kế tiếp và tự động dừng lại ở `yield` kế, trả về bộ chứa trạng thái mới mà không tiêu tốn tài nguyên xử lý của CPU.

#### Kết quả (Consequences)
*   **Điểm tốt (Pros):**
    *   **Trực quan hóa hoàn hảo đệ quy:** Cực kỳ dễ dàng trích xuất ngăn xếp đệ quy `Call Stack` tại mỗi mốc `yield` để vẽ thành cây đồ thị Glassmorphism 3D xếp chồng lộng lẫy.
    *   **Điều tiết dòng thời gian trơn tru:** Việc chạy debugger không bị đơ giật tab duyệt web, không tiêu hao băng thông máy chủ do biên dịch 100% tại Client.
    *   **Bảo vệ tab duyệt web:** Trình duyệt của sinh viên không bị đứng hình nếu đệ quy vô tận nhờ bộ đếm lượt lặp giới hạn an toàn.
*   **Điểm cần lưu ý (Cons):**
    *   Yêu cầu mã nguồn nhập vào Monaco Editor phải được phân tích cú pháp AST thành công. Nếu chứa lỗi biên dịch (Syntax Error), tiến trình tiêm generator yield sẽ dừng sớm và báo động đỏ rực Neon ở Console, giúp học sinh nhận diện sửa lỗi nhanh chóng.
    *   Các lệnh đệ quy lồng nhau sâu đòi hỏi quản lý ngăn xếp mảng cẩn thận.
    
