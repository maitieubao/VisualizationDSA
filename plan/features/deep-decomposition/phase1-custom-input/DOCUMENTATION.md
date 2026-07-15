# 📚 Core Architectural Decisions & Design Patterns (Custom Input)

Tài liệu này ghi nhận các Quyết định Kiến trúc cốt lõi (ADR) và các mẫu thiết kế (Design Patterns) được áp dụng để xây dựng cổng kết nối **Custom Input Generator** an toàn và linh hoạt.

---

## 1. Architectural Decision Records (ADR)

### ADR-02: Nguyên lý Thiết kế "Zero Trust Input Pipeline" (Bộ lọc Không tin tưởng)

#### Bối cảnh (Context)
Tính năng cho phép người dùng tự nhập dữ liệu tự do ẩn chứa rủi ro bảo mật cực cao cho tài nguyên máy chủ. Nếu tin tặc bỏ qua kiểm duyệt phía giao diện (bằng cách gọi API trực tiếp qua curl/postman) và gửi lên một mảng cực lớn (ví dụ: $N = 10,000$) để chạy giải thuật đệ quy nặng nề như Quick Sort hoặc giải thuật nhánh cận TSP, CPU máy chủ sẽ bị treo 100% tài nguyên, gây nghẽn và sập dịch vụ toàn hệ thống (DDoS).

#### Quyết định (Decision)
Hệ thống áp dụng nguyên lý thiết kế **Zero Trust Input Pipeline**:
*   Không tin tưởng bất kỳ gói tin nào gửi lên từ Client. Tất cả dữ liệu đầu vào tùy biến bắt buộc phải trải qua 3 cửa ải kiểm duyệt nghiêm ngặt tại Backend:
    1.  **Format Parser (Regex Gate):** Kiểm tra tính hợp lệ cú pháp của chuỗi thô. Loại bỏ ngay lập tức bất kỳ ký tự đặc biệt lạ nào nhằm tránh các kỹ thuật tấn công tiêm mã độc (Command/SQL Injection).
    2.  **Constraint Resolver (Size Gate):** Tra cứu cấu hình để so khớp kích thước mảng với giới hạn an toàn tối đa cho phép của thuật toán tương ứng trước khi chạy.
    3.  **Thread Cancellation Token (Time Gate):** Đặt giới hạn thời gian chạy tối đa là **2 giây** cho tất cả các tác vụ chạy giải thuật trên server. Nếu quá thời gian, tiến trình sẽ bị huỷ bỏ ngay lập tức để thu hồi CPU.

---

## 2. Các Mẫu thiết kế áp dụng (Design Patterns Applied)

### 2.1. Factory Pattern (Mẫu nhà máy sinh dữ liệu)
Ở Frontend, các hàm tạo mảng ngẫu nhiên thông minh (`generateRandomInput`) áp dụng Factory Pattern:
*   Người dùng truyền vào loại mảng yêu cầu (`'random' | 'nearly-sorted' | 'reversed'`) cùng với kích thước mảng mong muốn.
*   Factory sẽ tự động áp dụng thuật toán tinh chỉnh tương ứng để trả về mảng số nguyên thích hợp điền trực tiếp vào TextArea, giúp tách biệt mã giao diện UI và mã thuật toán sinh số ngẫu nhiên.

### 2.2. Strategy Pattern (Mẫu chiến thuật phân loại giới hạn)
Bộ quản lý giới hạn an toàn `ConstraintResolver` ở Backend áp dụng Strategy Pattern:
*   Mỗi giải thuật được cấu hình một chiến thuật giới hạn phần tử riêng biệt dựa trên độ phức tạp thời gian thực thi (O(N), O(N log N), O(N^2)).
*   Khi có yêu cầu gửi lên, API controller tự động gọi resolver để tìm kiếm chiến thuật phù hợp tương ứng với `algorithmId`, đảm bảo tính đóng gói và dễ dàng bổ sung giải thuật mới mà không cần chỉnh sửa các hàm xác thực hiện có.
