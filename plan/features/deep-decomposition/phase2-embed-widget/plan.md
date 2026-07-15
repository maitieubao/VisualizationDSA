# 📅 Implementation Plan - Embed Widget (Phase 2)

Kế hoạch phát triển phân hệ Tiện ích nhúng sơ đồ trực quan tương tác được phân chia làm 2 Sprint chính nhằm tối ưu hóa tính tiện dụng của bảng điều khiển và sự an toàn bảo mật của đường truyền postMessage.

---

## 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN

```
+-------------------------------------------------------------+
| Sprint A: Bảng cấu hình Settings & Live Preview (Ngày 1-3)  |
| - Dựng Sidebar cấu hình mờ Glassmorphism (Theme, Size).      |
| - Lập trình Khung xem thử trực quan Live Preview Canvas.   |
| - Thiết kế Hộp Neon Code Snippet & nút nhấp sao chép Copy. |
| - Xây dựng các widget điều khiển bật tắt VCR, watch vars.  |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Sprint B: postMessage Bridge & Tách gói siêu nhẹ (Ngày 4-6) |
| - Cài đặt bộ cầu nối truyền tin an toàn EmbedCommunicationBridge.|
| - Tích hợp ResizeObserver tự động co giãn chiều cao.       |
| - Cấu hình Vite code splitting loại bỏ Monaco Editor nhúng. |
| - Kiểm duyệt Origin nguồn chặn tấn công XSS.                |
+-------------------------------------------------------------+
```

---

## 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN

### Sprint A: Bảng cấu hình Settings & Live Preview (Ngày 1-3)
*   **Mục tiêu:** Xây dựng bảng điều khiển tiện ích nhúng, live preview canvas tương tác và hộp lấy mã nhúng mượt mà.
*   **Danh sách công việc:**
    1.  [ ] Thiết kế sidebar cấu hình mờ Glassmorphism `EmbedConfiguratorSidebar.vue` đầy đủ nút gạt theme và kích thước.
    2.  [ ] Lập trình khung `LiveWidgetPreview.vue` hiển thị trực tiếp sơ đồ trực quan động khi thay đổi thiết lập cấu hình.
    3.  [ ] Thiết kế hộp code snippet viền Neon hiển thị chuỗi iframe nhúng.
    4.  [ ] Hiện thực hóa API Clipboard sao chép nhanh với hoạt ảnh "Copied!" Emerald lôi cuốn.

### Sprint B: postMessage Bridge & Tách gói siêu nhẹ (Ngày 4-6)
*   **Mục tiêu:** Hiện thực cầu nối truyền tin bảo mật postMessage, co giãn chiều cao tự động ResizeObserver và cấu hình Vite giảm dung lượng gói tải.
*   **Danh sách công việc:**
    1.  [ ] Lập trình lớp logic `EmbedCommunicationBridge` lọc tin nhắn và kiểm duyệt Origin whitelist chống XSS.
    2.  [ ] Tích hợp giải thuật `ResizeObserver` cập nhật chiều cao thực tế của document gửi về Host để loại bỏ thanh cuộn kép.
    3.  [ ] Thiết lập cấu hình Vite/Rollup chia tách Manual Chunks, cô lập hoàn toàn Monaco Editor khỏi bundle nhúng `/embed`.
    4.  [ ] Viết mã Javascript mẫu tích hợp ở phía Host để hướng dẫn lập trình viên tích hợp dễ dàng.

---

## 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)
1.  Bảng cấu hình Settings Sidebar hoạt động mượt mà, cập nhật trực quan tức thời lên Live Preview Canvas.
2.  Nút bấm Copy Code hoạt động ổn định trên cả Chrome, Safari, Edge và Firefox.
3.  Iframe nhúng tự động co giãn chiều cao qua ResizeObserver khớp hoàn toàn 100%, không bị lỗi xuất hiện thanh cuộn kép.
4.  Kích thước bundle build chuyên dụng `/embed` tối ưu hóa triệt để dưới 180KB, loại bỏ hoàn toàn mã nguồn Monaco Editor cồng kềnh.
5.  Giải thuật lọc Origin của `EmbedCommunicationBridge` chặn đứng 100% tin nhắn giả mạo từ Origin ngoài danh sách whitelist.
