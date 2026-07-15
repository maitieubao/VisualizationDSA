# 📅 Detailed Implementation Plan - DSA Modules Library (Phase 1)

Kế hoạch phát triển và hiện thực hóa thư viện thuật toán **DSA Modules Library (Phase 1)** được chia làm 2 Sprint song song, tập trung hoàn thiện từ thuật toán cơ bản tuyến tính đến các thuật toán phi tuyến tính đệ quy phức tạp.

---

## 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN

```
+-------------------------------------------------------------+
| Sprint A: Các Cấu Trúc Tuyến Tính & Sắp Xếp Cơ Bản (Ngày 1-3)|
| - Cài đặt Interface, DI quét tự động.                        |
| - Bubble Sort, Selection Sort, Linear Search, Stack/Queue.  |
| - Thiết kế Bar Chart & Box Array, Tube Canvas render.       |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Sprint B: Chia Để Trị & Cấu Trúc Phi Tuyến Tính (Ngày 4-6)   |
| - Cài đặt Quick Sort, Merge Sort đệ quy capture state.       |
| - Cài đặt Cây nhị phân tìm kiếm BST (Insert, Search, LNR).  |
| - Thiết kế Node & Edges Canvas renderer vẽ đồ họa cây.      |
+-------------------------------------------------------------+
```

---

## 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN

### Sprint A: Các Cấu Trúc Tuyến Tính & Sắp Xếp Cơ Bản (Ngày 1-3)
*   **Mục tiêu:** Xây dựng khung kiến trúc cắm rút và triển khai các giải thuật tuyến tính cơ bản cùng hệ thống đồ họa dạng cột và ô ngang.
*   **Danh sách công việc:**
    1.  [ ] Định nghĩa Interface `IAlgorithmStrategy` và DTOs chụp trạng thái ở Backend C#.
    2.  [ ] Hiện thực hóa cơ chế Dependency Injection tự động đăng ký qua Reflection.
    3.  [ ] Viết giải thuật `BubbleSortStrategy`, `SelectionSortStrategy` và `LinearSearchStrategy` có capture state.
    4.  [ ] Triển khai CTDL Ngăn xếp `StackStrategy` và Hàng đợi `QueueStrategy` sinh các snapshot trạng thái tương ứng với thao tác Push/Pop/Enqueue/Dequeue.
    5.  [ ] Ở Frontend, xây dựng Component động `<component :is>` và các bộ vẽ đồ họa `BarChartRenderer.vue` (dạng cột cho sắp xếp), `BoxArrayRenderer.vue` (dạng ô vuông cho tìm kiếm).
    6.  [ ] Viết bộ vẽ `TubeRenderer.vue` (dạng ống nằm dọc/ngang cho Stack/Queue).

### Sprint B: Chia Để Trị & Cấu Trúc Phi Tuyến Tính (Ngày 4-6)
*   **Mục tiêu:** Hiện thực hóa các giải thuật đệ quy phức tạp và cấu trúc cây phân nhánh cùng hệ thống vẽ node liên kết.
*   **Danh sách công việc:**
    1.  [ ] Phát triển giải thuật đệ quy `QuickSortStrategy` chọn chốt Pivot phân hoạch mảng, capture chính xác con trỏ Left/Right.
    2.  [ ] Phát triển giải thuật `MergeSortStrategy` chia đôi mảng đệ quy và trộn mảng phụ, capture tiến trình di chuyển cột.
    3.  [ ] Thiết kế giải thuật tìm kiếm nhị phân `BinarySearchStrategy` so khớp và thu hẹp khoảng tìm kiếm [Left, Right].
    4.  [ ] Xây dựng giải thuật Cây tìm kiếm nhị phân `BSTStrategy` thực hiện chụp trạng thái các thao tác thêm node, tìm kiếm và duyệt cây.
    5.  [ ] Ở Frontend, xây dựng bộ vẽ đồ họa nâng cao `TreeRenderer.vue` tự động tính toán tọa độ $(X, Y)$ của node hình tròn và vẽ mũi tên liên kết.
    6.  [ ] Hoàn thành viết Pinia Store `useAlgorithmStore` quản lý metadata lý thuyết và bảng hiển thị Big-O.

---

## 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)
1.  Mọi thuật toán mới thêm vào tự động đăng ký thành công vào API hệ thống nhờ Reflection DI, vượt qua Unit Test độc lập.
2.  Quick Sort đệ quy capture đầy đủ tiến trình, hiển thị rõ ràng Pivot (tím), so sánh (vàng), hoán vị (đỏ) trên Canvas 60 FPS mượt mà.
3.  Binary Search bắt buộc phải kiểm tra tính chất đã được sắp xếp của mảng dữ liệu custom, ném ra mã lỗi `HTTP 400 Bad Request` nếu mảng lộn xộn.
4.  Cấu trúc cây BST tự động tính toán khoảng cách tọa độ node con không bị đè lên nhau trên Canvas khi hiển thị tối đa 4 tầng cây.
5.  Giao diện tự động thay đổi Renderer phù hợp dựa trên Category thuật toán thông qua Component động Vue 3.
