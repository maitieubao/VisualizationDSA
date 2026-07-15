# 📅 Implementation Plan - Multi-View Synchronization (Phase 2)

Kế hoạch phát triển phân hệ Đồng bộ Đa Giao diện được chia thành 2 Sprint chính nhằm tối ưu hóa giao diện Resizable Splitter kính mờ Neon sành điệu và trục truyền tin đồng bộ siêu tốc dưới 1ms.

---

## 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN

```
+-------------------------------------------------------------+
| Sprint A: Thiết kế Layout Splitter & Monaco Sync (Ngày 1-3) |
| - Dựng khung container chia đôi/chia ba Resizable Splitter. |
| - Thiết kế thanh kéo chia pane kính mờ Neon bừng sáng Cyan. |
| - Tích hợp Monaco deltaDecorations highlight active line.   |
| - Tạo hiệu ứng nhấp nháy phát sáng Neon trên Flowchart.     |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Sprint B: Trục Truyền tin Event Bus & Tua Timeline (Ngày 4-6)|
| - Cài đặt bộ điều phối tin tức MultiViewEventBus.           |
| - Đồng bộ hóa tua thời gian VCR Range Scrubber dùng chung.   |
| - Sử dụng rAF Throttle tối ưu hóa kéo co giãn Splitter.     |
| - Viết cơ chế dọn dẹp bộ nhớ RAM unsubscribeAll khi unmount. |
+-------------------------------------------------------------+
```

---

## 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN

### Sprint A: Thiết kế Layout Splitter & Monaco Sync (Ngày 1-3)
*   **Mục tiêu:** Xây dựng khung chia pane co giãn mờ kính sang trọng, liên kết Monaco active line highlight và flowchart node neon flashings.
*   **Danh sách công việc:**
    1.  [ ] Thiết kế container chia màn hình `MultiViewWorkspace.vue` phong cách tối giản kính mờ.
    2.  [ ] Lập trình thanh chia pane kéo trượt `ResizableSplitter.vue` bừng sáng màu Cyan Neon khi di chuột.
    3.  [ ] Tích hợp dịch vụ deltaDecorations cho Monaco Editor tô sáng dòng code đang thực thi màu vàng hổ phách.
    4.  [ ] Đồng bộ hóa hoạt ảnh nhấp nháy phát sáng trên sơ đồ khối `FlowchartVisualizer.vue`.

### Sprint B: Trục Truyền tin Event Bus & Tua Timeline (Ngày 4-6)
*   **Mục tiêu:** Lập trình bộ truyền tin `MultiViewEventBus` siêu tốc dưới 1ms, VCR Scrubber dùng chung, tối ưu hóa rAF drag co giãn.
*   **Danh sách công việc:**
    1.  [ ] Lập trình logic lõi TypeScript `MultiViewEventBus` truyền callback trực tiếp trên RAM.
    2.  [ ] Đồng bộ hóa thanh tua thời gian `VCRTimelineScrubber.vue` kết nối toàn diện 3 View.
    3.  [ ] Thiết lập kỹ thuật Throttled Drag Resize bằng requestAnimationFrame cho thanh kéo pane đạt 60 FPS.
    4.  [ ] Viết cơ chế tự giải phóng bộ nhớ RAM `unsubscribeAll()` khi học viên rời chế độ xem song song.

---

## 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)
1.  Đồng bộ hóa snapping hoàn hảo cả 3 View (Code, Flowchart, SVG) khi tua nhanh timeline slider.
2.  Trễ chênh lệch đồng bộ thời gian thực giữa các panel đo đạc thực tế dưới **1ms**.
3.  Thanh Drag Splitter kéo trượt mượt mà 60 FPS, không gây gián đoạn co giãn Responsive layout.
4.  Ngưỡng khóa an toàn kéo pane co giãn hoạt động chuẩn xác (giới hạn từ 15% đến 85% chiều rộng).
5.  Giải phóng 100% các callback đăng ký trong bộ nhớ RAM khi đóng chế độ xem song song, không gây rò rỉ bộ nhớ.
6.  Dòng code Monaco đang chạy phát sáng màu vàng hổ phách lộng lẫy và hiển thị gutter pointer chuẩn dòng.
