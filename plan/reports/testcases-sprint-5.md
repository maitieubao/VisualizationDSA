# 🧪 Danh Sách Ca Kiểm Thử (Unit Test Cases Specification) - Sprint 5

Tài liệu này đặc tả chi tiết **3 ca kiểm thử đơn vị (Unit Tests)** được triển khai trong phân hệ `Custom Input Parser & Interactive Playground` để nghiệm thu chất lượng mã nguồn cốt lõi của **Sprint 5: Interactive Playground & Custom Input**.

---

## 📌 1. Tổng Quan Kết Quả Kiểm Thử (Test Execution Summary)

*   **Tổng số test cases:** 3/3
*   **Trạng thái:** 🟢 PASS ALL (100% thành công)
*   **Thư viện kiểm thử:** `vitest`
*   **Tập tin kiểm thử:** [CustomInputParser.spec.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/__tests__/CustomInputParser.spec.ts)

---

## 🛠️ 2. Đặc Tả Chi Tiết Các Ca Kiểm Thử (Test Cases Specification)

### 2.1. Nhóm 1: Kiểm Thử Phân Tích Cú Pháp Nhập Liệu (CustomInputParser)

#### 📝 TC-PLAY-01: Phân tích mảng số tùy biến hợp lệ và từ chối các chuỗi chứa ký tự chữ cái lỗi
*   **Mục tiêu:** Đảm bảo hàm `CustomInputParser.parseNumberArray` chuyển đổi thành công chuỗi phân cách bằng dấu phẩy thành mảng số nguyên, và ném lỗi phù hợp khi có ký tự không hợp lệ.
*   **Đầu vào:**
    *   Chuỗi hợp lệ: `'5, 8, 12, 20'`
    *   Chuỗi lỗi: `'5, abc, 12'`
*   **Kết quả mong đợi:**
    *   Chuỗi hợp lệ trả về mảng `[5, 8, 12, 20]`.
    *   Chuỗi lỗi ném ngoại lệ chứa thông điệp: `"Giá trị 'abc' không phải là số hợp lệ!"`.
*   **Trạng thái:** 🟢 **PASS**

#### 📝 TC-PLAY-02: Phân tích ma trận kề đồ thị theo định dạng và phát hiện ngoại lệ khi nhập sai cấu trúc
*   **Mục tiêu:** Xác nhận `CustomInputParser.parseAdjacencyList` phân tích đúng cấu trúc liên kết đồ thị dạng `Source-Target:Weight` và chặn đứng các chuỗi sai định dạng.
*   **Đầu vào:**
    *   Chuỗi hợp lệ: `'A-B:10, B-C:20'`
    *   Chuỗi lỗi: `'A-B=10'`
*   **Kết quả mong đợi:**
    *   Chuỗi hợp lệ trả về đồ thị có 3 nút vertex `[A, B, C]` và các cạnh tương ứng với trọng số chính xác.
    *   Chuỗi lỗi ném lỗi cú pháp runtime.
*   **Trạng thái:** 🟢 **PASS**

---

### 2.2. Nhóm 2: Kiểm Thử Động Cơ Vẽ Đồ Thị Tương Tác (InteractivePlaygroundEngine)

#### 📝 TC-PLAY-03: Kiểm định cơ chế nhấp chuột vẽ Vertex đồ thị, chặn các Vertex va chạm đè sát bán kính dưới 50px
*   **Mục tiêu:** Đảm bảo khi người dùng double-click lên Canvas để tạo vertex mới, hệ thống sẽ thêm vertex mới, đồng thời tự động từ chối nếu vị trí double-click quá gần một vertex đã tồn tại (khoảng cách Euclid < 50px) để tránh hiện tượng chồng lấp đồ họa.
*   **Đầu vào:**
    *   Tạo vertex thứ nhất tại tọa độ `(100, 100)`.
    *   Tạo vertex thứ hai tại tọa độ `(110, 110)` (khoảng cách là `Math.hypot(10, 10) = 14.14px < 50px`).
*   **Kết quả mong đợi:**
    *   Vertex thứ nhất được tạo thành công.
    *   Vertex thứ hai bị chặn tạo mới để chống chồng lấp (overlapping prevention), callback thêm vertex không được kích hoạt lần thứ hai.
*   **Trạng thái:** 🟢 **PASS**

---

## 📈 3. Kết Luận
Cả 3 ca kiểm thử thuộc Sprint 5 đã vượt qua thành công 100%. Các cơ chế an toàn dữ liệu, chống crash khi nhập sai cú pháp, và thuật toán phát hiện va chạm hình học khi vẽ đồ thị được tối ưu hóa chạy ổn định trên Client-side.
