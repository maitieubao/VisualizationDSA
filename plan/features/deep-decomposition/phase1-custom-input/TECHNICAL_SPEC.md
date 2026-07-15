# 🛠 Technical Specification - Custom Input Generator (Phase 1)

Tài liệu này đặc tả chi tiết kiến trúc kỹ thuật, luồng xác thực đa tầng, mô hình dữ liệu và các giải pháp chống tấn công từ chối dịch vụ cho hệ thống **Custom Input Generator**.

---

## 1. Luồng chạy Dữ liệu & Xác thực Đa tầng (Multi-tier Validation Flow)

Hệ thống áp dụng kiến trúc xác thực đa tầng tuần tự nhằm giảm thiểu băng thông mạng thừa và bảo vệ tài nguyên tính toán của Backend:

```
               +-------------------------------------------+
               |             TRÌNH DUYỆT CLIENT            |
               |                                           |
               |       Người dùng gõ: "5, 12, a, 8"        |
               |                    |                      |
               |                    v                      |
               |         +-----------------------+         |
               |         | Vue 3 Local Regex Val |         | (Phát hiện lỗi 'a')
               |         +-----------------------+         | -> Báo đỏ viền, khóa Run
               |                    |                      |
               |           (Nếu hợp lệ cú pháp)            |
               |                    v                      |
               |         +-----------------------+         |
               |         |    Khớp Limit Client  |         | (Check N <= maxLimit)
               |         +-----------------------+         | -> Khóa Run nếu vượt
               |                    |                      |
               +--------------------|----------------------+
                                    | HTTP POST /api/v1/algorithms/custom-execute
                                    v
               +-------------------------------------------+
               |               SERVER BACKEND              |
               |                                           |
               |         +-----------------------+         |
               |         |  Backend Input Parser |         | (Dùng Regex C# quét lại)
               |         +-----------------------+         | -> HTTP 400 Bad Request
               |                    |                      |
               |           (Nếu hợp lệ cấu trúc)           |
               |                    v                      |
               |         +-----------------------+         |
               |         |  Constraint Resolver  |         | (Check Dictionary Limit)
               |         +-----------------------+         | -> HTTP 422 Size Limit
               |                    |                      |
               |          (Nằm trong ngưỡng an toàn)       |
               |                    v                      |
               |         +-----------------------+         |
               |         |  C# Execution Engine  |         | (Chạy thuật toán thực tế)
               |         +-----------------------+         | -> HTTP 200 OK + Frames
               |                                           |
               +-------------------------------------------+
```

### 1.1. Client-Side: Vue 3 Local Validation Pipeline
*   **Regex Check:** Trình duyệt sử dụng biểu thức chính quy `/^([+-]?\d+)(\s*,\s*[+-]?\d+)*$/` kiểm tra từng ký tự ngay khi người dùng gõ phím. Quá trình kiểm tra diễn ra cục bộ trong bộ nhớ mà không cần kết nối mạng.
*   **Limit Check:** Lấy chỉ số giới hạn từ Pinia Store tương ứng giải thuật hiện tại (ví dụ: Bubble Sort là 50). Khóa nút **Execute** ngay lập tức nếu độ rộng mảng vượt quá chỉ số cho phép.

### 1.2. Server-Side: .NET API Defensive Gates
*   **Input Parser:** Phân tách chuỗi thô thành mảng `int[]`. Ném ra `FormatException` nếu có bất kỳ lỗi định dạng nào lọt qua bộ lọc của trình duyệt. Trả về mã lỗi `HTTP 400 Bad Request`.
*   **Constraint Resolver:** Tra cứu bảng giới hạn `Dictionary<string, int>` để so khớp số phần tử. Trả về mã lỗi `HTTP 422 Unprocessable Entity` nếu vượt quá giới hạn, ngăn chặn tuyệt đối việc nạp mảng quá lớn vào vòng lặp chạy giải thuật.

---

## 2. Đặc tả Cấu trúc Dữ liệu Đầu vào (Input Structure Specifications)

### 2.1. Cấu trúc Mảng một chiều (1D Array)
*   **Định dạng văn bản thô:** Các phần tử là số nguyên (hỗ trợ số nguyên âm và số nguyên dương), phân tách với nhau bằng đúng duy nhất một dấu phẩy `,`. Khoảng trắng trước và sau dấu phẩy được tự động làm sạch.
*   **Ví dụ hợp lệ:** `12, -5, 88, 9, 3`
*   **Ví dụ không hợp lệ:**
    *   `12,,5` (Hai dấu phẩy liên tiếp).
    *   `12, 5, a` (Có chứa ký tự chữ cái lạ).
    *   `12.5, 3` (Chứa số thực không phải số nguyên).

### 2.2. Hướng phát triển Cấu trúc Đồ thị (Graph Adjacency List - Phase 2 Preview)
Để hệ thống dễ dàng mở rộng ở Phase 2, cấu trúc Custom Input của Đồ thị được định nghĩa dưới dạng danh sách các cạnh cách nhau bởi dấu xuống dòng hoặc dấu phẩy:
*   **Cú pháp Edge List:** `{NodeNguồn}-{NodeĐích}` hoặc `{NodeNguồn}-{NodeĐích}:{TrọngSố}`
*   **Ví dụ:** `A-B, B-C, C-A` hoặc `A-B:5, B-C:10`
