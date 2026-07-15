# 🗺️ Sprint 2 Feature Plan - Basic DSA Array & Sorting Visualizers

Tài liệu này đặc tả chi tiết kế hoạch triển khai cho **Sprint 2: Basic DSA Library - Array & Sorting**. Phân hệ chịu trách nhiệm xây dựng các bộ trực quan hóa mảng sắp xếp hoán vị động (Bubble, Quick, Merge, Heap Sort) chạy mượt mà 60 FPS.

---

## 1. Mục tiêu Sprint (Sprint Goal)
Tạo dựng cụm thư viện trực quan hóa mảng dữ liệu và các thuật toán sắp xếp kinh điển:
*   **Hoán vị Lerp Mượt mà (Smooth Swap Animations):** Khi 2 phần tử mảng hoán đổi vị trí, chúng di chuyển uốn lượn lướt qua nhau bằng phép toán Lerp mượt mà dưới **300ms** thay vì dịch chuyển giật cục.
*   **Tô sáng Phân hoạch (Partitioning & Compare Glows):** Tô sáng viền Neon Cyan các phần tử đang so sánh, viền Neon Amber cho chốt Pivot trong QuickSort và viền Neon Emerald khi hoàn thành.
*   **Hỗ trợ 4 Thuật toán Kinh điển:** Bubble Sort, QuickSort, Merge Sort và Heap Sort.

---

## 2. Danh sách công việc (Task Backlog)
1.  [ ] Thiết kế Component `ArrayBarVisualizer.vue` kính mờ biểu diễn các phần tử mảng.
2.  [ ] Lập trình giải thuật hoán vị Lerp Vector di chuyển tọa độ các cột bar mảng.
3.  [ ] Tích hợp bộ tạo hoạt ảnh hoán đổi vị trí trong `VCRPlaybackEngine` từ Sprint 1.
4.  [ ] Lập trình logic tô sáng Pivot và con trỏ so sánh chỉ số `i`, `j` bám đuổi.
5.  [ ] Viết Unit tests kiểm thử hoán vị mảng sắp xếp động.

---

## 3. Tiêu chí nghiệm thu (DoD)
*   Hoạt ảnh hoán vị mảng co giãn và hoán đổi vị trí chạy mượt mà 60 FPS.
*   Các con trỏ chỉ số so sánh `i`, `j` và chốt Pivot được tô sáng đúng màu Neon HSL quy chuẩn.
*   Giải phóng và hủy bỏ toàn bộ render loops rAF khi unmount tránh rò rỉ bộ nhớ RAM.
*   Unit tests bao phủ 100% logic hoán vị mảng và giải thuật sắp xếp.
