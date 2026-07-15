# 📅 Implementation Plan - State Inspector & Stack Frames (Phase 2)

Kế hoạch phát triển phân hệ Thanh tra Trạng thái RAM được phân chia làm 2 Sprint chính nhằm tối ưu hóa giao diện ngăn xếp 3D và độ ổn định của đường vẽ động Bezier.

---

## 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN

```
+-------------------------------------------------------------+
| Sprint A: Thiết kế Stack Frames UI & Đường Vẽ Bezier (Ngày 1-3)|
| - Dựng xếp chồng Call Stack Container 3D kính mờ Glass.     |
| - Viết thuật toán bắt bounding box thời gian thực.           |
| - Vẽ đường cong SVG Cubic Bezier Neon Flowing nét đứt.      |
| - Thiết kế hover highlights pulse biến số ngăn xếp Heap.    |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Sprint B: Lập trình Engine Stack & Dựng Cây Đệ quy (Ngày 4-6) |
| - Lập trình logic Push/Pop StateInspectorEngine TS.          |
| - Dựng cây đệ quy SVG RecursionTreeGenerator tự co giãn.     |
| - Liên kết click Stack Frame cuộn Monaco Editor.            |
| - Viết cơ chế tự động tính toán lại Bezier khi resize cửa sổ.|
+-------------------------------------------------------------+
```

---

## 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN

### Sprint A: Thiết kế Stack Frames UI & Đường Vẽ Bezier (Ngày 1-3)
*   **Mục tiêu:** Xây dựng ngăn xếp 3D kính mờ, bộ bắt bounding box DOM, mũi tên SVG Bezier chỉ Heap, hover pulse biến số.
*   **Danh sách công việc:**
    1.  [ ] Thiết kế Component `CallStackPanel.vue` chồng xếp các stack frame 3D kính mờ đẹp mắt.
    2.  [ ] Viết mã tính tọa độ động đầu-cuối của con trỏ từ ngăn xếp sang Heap ảo đồ họa.
    3.  [ ] Dựng component `<path class="pointer-neon-arrow" d="..." />` nét đứt chạy neon.
    4.  [ ] Viết CSS `@keyframes hover-pulse` nhấp nháy phát sáng Amber khi di chuột qua biến.

### Sprint B: Lập trình Engine Stack & Dựng Cây Đệ quy (Ngày 4-6)
*   **Mục tiêu:** Hiện thực hóa logic `StateInspectorEngine` TS, dựng cây đệ quy SVG, sync click Monaco, dọn dẹp RAM GC.
*   **Danh sách công việc:**
    1.  [ ] Lập trình logic hạt nhân `StateInspectorEngine` bằng TypeScript quản lý stack.
    2.  [ ] Thiết lập thuật toán phân bổ tọa độ tầng tự động dựng Cây đệ quy SVG `RecursionTreeGenerator`.
    3.  [ ] Liên kết sự kiện click stack frame gọi API Monaco `revealLineInCenter` nhảy dòng code.
    4.  [ ] Viết debounce window resize listener tự động vẽ co giãn cập nhật lại Bezier, hủy bỏ GC sạch sẽ khi unmount.

---

## 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)
1.  Call Stack chồng xếp mượt mà 3D, click chọn stack frame cũ bắt buộc di chuyển con trỏ và highlight dòng code tương ứng trong Monaco Editor.
2.  Mũi tên SVG pointer bám bắt tọa độ DOM chính xác tuyệt đối từ ngăn xếp trỏ đúng địa chỉ ô nhớ Heap ảo.
3.  Cây đệ quy SVG tự động dựng nhánh xanh Emerald và Cyan thời gian thực bám sát bước chạy.
4.  Tọa độ mũi tên tự động cập nhật lại chính xác tức thì khi người học co giãn (resize) cửa sổ trình duyệt.
5.  Giải phóng hoàn toàn các listeners window resize và clear stack khi unmount workspace.
6.  Đầy đủ unit tests bao phủ 100% logic push/pop stack frames và dựng tọa độ cây đệ quy.
