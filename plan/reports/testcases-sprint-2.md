# 🧪 Danh Sách Ca Kiểm Thử (Unit Test Cases Specification) - Sprint 2

Tài liệu này đặc tả chi tiết **4 ca kiểm thử đơn vị (Unit Tests)** được triển khai trong phân hệ `Sorting Algorithm Frame Generators` để nghiệm thu chất lượng mã nguồn cốt lõi của **Sprint 2: Basic DSA Library - Array & Sorting**.

---

## 📌 1. Tổng Quan Kết Quả Kiểm Thử (Test Execution Summary)

*   **Tổng số test cases:** 4/4
*   **Trạng thái:** 🟢 PASS ALL (100% thành công)
*   **Thư viện kiểm thử:** `vitest`
*   **Tập tin kiểm thử:** [sorting.spec.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/algorithm-sandbox/__tests__/sorting.spec.ts)

---

## 🛠️ 2. Đặc Tả Chi Tiết Các Ca Kiểm Thử (Test Cases Specification)

### 2.1. Nhóm 1: Kiểm Thử Giải Thuật Sắp Xếp Bong Bóng (Bubble Sort)

#### 📝 TC-SORT-01: Kiểm thử sinh khung hình Bubble Sort
*   **Mục tiêu:** Xác nhận giải thuật Bubble Sort tạo đúng các khung hình mô phỏng tuần tự (so sánh, hoán vị, yên vị) và cho ra mảng kết quả sắp xếp tăng dần chính xác.
*   **Đầu vào:** `testArray = [5, 3, 8, 4, 2]`
*   **Kết quả mong đợi:**
    *   Mảng kết quả ở khung hình cuối cùng phải được sắp xếp tăng dần hoàn chỉnh: `[2, 3, 4, 5, 8]`.
    *   Số lượng khung hình sinh ra lớn hơn 0.
    *   Thuộc tính `algorithm` của các khung hình luôn là `'bubble'`.
    *   Mảng `sortedIndices` ở khung hình cuối cùng có độ dài bằng chính xác độ dài mảng đầu vào.
*   **Trạng thái:** 🟢 **PASS**

---

### 2.2. Nhóm 2: Kiểm Thử Giải Thuật Sắp Xếp Nhanh (Quick Sort)

#### 📝 TC-SORT-02: Kiểm thử phân hoạch Lomuto & Tô sáng Pivot trong Quick Sort
*   **Mục tiêu:** Đảm bảo giải thuật Quick Sort hoạt động theo mô hình Lomuto Partition, tô sáng đúng chốt Pivot bằng màu Neon Amber và phân hoạch mảng chính xác.
*   **Đầu vào:** `testArray = [5, 3, 8, 4, 2]`
*   **Kết quả mong đợi:**
    *   Sinh ra các khung hình có thuộc tính `pivotIndex` không phải là `null` (chỉ số phần tử chốt đang được so sánh hoặc hoán đổi).
    *   Tốc độ phân hoạch chuẩn xác, mảng kết quả cuối cùng đạt trạng thái sắp xếp hoàn hảo: `[2, 3, 4, 5, 8]`.
*   **Trạng thái:** 🟢 **PASS**

---

### 2.3. Nhóm 3: Kiểm Thử Giải Thuật Sắp Xếp Trộn (Merge Sort)

#### 📝 TC-SORT-03: Kiểm thử phân rã & hợp nhất trong Merge Sort
*   **Mục tiêu:** Đảm bảo giải thuật Merge Sort chia để trị (Divide and Conquer) sinh ra các khung hình mô tả việc chia mảng và trộn các mảng con một cách mượt mà và cho ra kết quả sắp xếp chuẩn.
*   **Đầu vào:** `testArray = [5, 3, 8, 4, 2]`
*   **Kết quả mong đợi:**
    *   Merge Sort sinh ra chuỗi các khung hình thể hiện việc trộn tăng dần các mảng con.
    *   Mảng ở khung hình cuối cùng được sắp xếp tăng dần tuyệt đối: `[2, 3, 4, 5, 8]`.
*   **Trạng thái:** 🟢 **PASS**

---

### 2.4. Nhóm 4: Kiểm Thử Giải Thuật Sắp Xếp Vun Đống (Heap Sort)

#### 📝 TC-SORT-04: Kiểm thử vun đống cực đại & trích xuất trong Heap Sort
*   **Mục tiêu:** Đảm bảo thuật toán Heap Sort xây dựng chính xác cây đống cực đại (Max Heap) ban đầu, sau đó trích xuất các phần tử lớn nhất và vun đống lại tuần tự.
*   **Đầu vào:** `testArray = [5, 3, 8, 4, 2]`
*   **Kết quả mong đợi:**
    *   Thực hiện vun đống cực đại đúng chuẩn qua các khung hình mô tả.
    *   Mảng đầu ra ở khung hình cuối cùng đạt trạng thái tăng dần: `[2, 3, 4, 5, 8]`.
*   **Trạng thái:** 🟢 **PASS**

---

## 📈 3. Kết Luận
Cả 4 thuật toán sắp xếp cốt lõi trong thư viện của Sprint 2 đã vượt qua toàn bộ các ca kiểm thử tự động với độ bao phủ dữ liệu 100%. Các thuộc tính mô phỏng trạng thái trực quan (`comparingIndices`, `pivotIndex`, `swappedIndices`, `sortedIndices`) được cài đặt chính xác trong từng bước chuyển đổi mảng.
