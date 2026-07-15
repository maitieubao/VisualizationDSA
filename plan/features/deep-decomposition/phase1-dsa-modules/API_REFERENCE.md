# 🔌 API Reference & JSON Contracts (DSA Modules Library)

Tài liệu này đặc tả chi tiết giao diện lập trình ứng dụng (API) và cấu trúc dữ liệu JSON để lấy danh sách mục lục và siêu dữ liệu lý thuyết của giải thuật.

---

## 1. API: Lấy danh mục thuật toán hiển thị ở Dashboard

*   **URL:** `/api/v1/algorithms`
*   **Method:** `GET`
*   **Headers:**
    *   `Accept: application/json`

### JSON Phản hồi thành công (HTTP 200 OK):
```json
[
  {
    "id": "bubble-sort",
    "name": "Bubble Sort (Sắp xếp nổi bọt)",
    "category": "Sorting",
    "difficulty": "Easy",
    "timeComplexity": "O(N^2)",
    "spaceComplexity": "O(1)"
  },
  {
    "id": "quick-sort",
    "name": "Quick Sort (Sắp xếp nhanh)",
    "category": "Sorting",
    "difficulty": "Medium",
    "timeComplexity": "O(N log N)",
    "spaceComplexity": "O(log N)"
  },
  {
    "id": "binary-search",
    "name": "Binary Search (Tìm kiếm nhị phân)",
    "category": "Searching",
    "difficulty": "Easy",
    "timeComplexity": "O(log N)",
    "spaceComplexity": "O(1)"
  }
]
```

---

## 2. API: Lấy siêu dữ liệu lý thuyết & mã giả của thuật toán

*   **URL:** `/api/v1/algorithms/{algorithmId}/metadata`
*   **Method:** `GET`
*   **Headers:**
    *   `Accept: application/json`

### JSON Phản hồi thành công (HTTP 200 OK):
```json
{
  "timeComplexity": "O(N log N)",
  "spaceComplexity": "O(log N)",
  "description": "Quick Sort hoạt động theo nguyên lý chia để trị. Chọn một phần tử làm chốt Pivot, phân chia mảng thành hai nửa sao cho một nửa nhỏ hơn chốt và nửa kia lớn hơn chốt...",
  "pseudoCode": [
    "runQuickSort(A, low, high)",
    "  if low < high",
    "    pivotIdx = partition(A, low, high)",
    "    runQuickSort(A, low, pivotIdx - 1)",
    "    runQuickSort(A, pivotIdx + 1, high)"
  ]
}
```

---

## 3. Các phản hồi lỗi tiêu chuẩn (Standard Error Responses)

### 3.1. Lỗi không tìm thấy thuật toán tương ứng (HTTP 404 Not Found)
Trả về khi client gửi yêu cầu truy xuất siêu dữ liệu của một `algorithmId` không có trong danh mục:

```json
{
  "status": 404,
  "title": "Not Found",
  "errorType": "ALGORITHM_NOT_FOUND",
  "message": "Không tìm thấy thuật toán tương ứng với ID: 'radix-sort' trong thư viện hệ thống."
}
```
