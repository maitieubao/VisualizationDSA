# 📅 Implementation Plan - Export & Share (Phase 2)

Kế hoạch phát triển phân hệ Xuất bản sơ đồ và Chia sẻ vạn năng được phân bổ làm 2 Sprint chính nhằm tối ưu hóa tính tiện dụng của hộp thoại giao diện và sự an toàn bảo mật, sắc nét của tệp ảnh tải xuống.

---

## 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN

```
+-------------------------------------------------------------+
| Sprint A: Thiết kế Hộp thoại Share Dialog & QR Code (Ngày 1-3)|
| - Dựng khung hộp thoại kính mờ Share Modal Glassmorphic.   |
| - Tạo các phím định dạng tải ảnh viền Neon lộng lẫy.        |
| - Tích hợp bộ sinh mã QR Code động mượt mà vàng Neon.       |
| - Hoạt ảnh thanh tiến trình xuất ảnh Emerald progress bar. |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Sprint B: SVG Exporter & Nén băm trạng thái (Ngày 4-6)       |
| - Lập trình lớp SVGToCanvasExporter nhúng stylesheet CSS ngoại vi.|
| - Viết thuật toán nén lz-string WorkspaceStateCompressor.   |
| - Tạo mã băm rút gọn lưu trữ trạng thái lên Supabase DB.    |
| - Tạo thẻ OpenGraph SEO metadata hiển thị sành điệu.        |
+-------------------------------------------------------------+
```

---

## 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN

### Sprint A: Thiết kế Hộp thoại Share Dialog & QR Code (Ngày 1-3)
*   **Mục tiêu:** Xây dựng hộp thoại Share Dialog kính mờ sang trọng, các phím Neon lựa chọn định dạng, bộ sinh mã QR động và clipboard copy tiện lợi.
*   **Danh sách công việc:**
    1.  [ ] Thiết kế hộp thoại `ShareExportModal.vue` mờ Glassmorphism bao quanh bởi dải Neon mỏng mảnh dẻ.
    2.  [ ] Thiết kế phím chọn định dạng tải xuống (PNG 3x, SVG Vector) viền Cyan lộng lẫy.
    3.  [ ] Tích hợp thư viện sinh mã QR Code động hiển thị chính giữa hộp thoại viền vàng mạ ấm áp.
    4.  [ ] Lập trình thanh tiến trình xuất ảnh Emerald Progress Bar chạy mượt từ 0 đến 100% kèm chữ JetBrains Mono hiển thị phần trăm.

### Sprint B: SVG Exporter & Nén băm trạng thái (Ngày 4-6)
*   **Mục tiêu:** Hiện thực bộ chuyển đổi SVG-to-Canvas ẩn, nén băm trạng thái phòng lab lz-string và kết nối API lưu trữ Supabase PostgreSQL.
*   **Danh sách công việc:**
    1.  [ ] Hiện thực hóa logic `SVGToCanvasExporter` gộp CSS styles ngoại vi vẽ lên Canvas ẩn nhân tỉ lệ Scale phóng đại 3x sắc mịn.
    2.  [ ] Viết mã nén băm trạng thái workspace `WorkspaceStateCompressor` bằng lz-string rút gọn dung lượng link chia sẻ dưới 600 bytes.
    3.  [ ] Lập trình tích hợp gọi endpoint API Backend `POST /api/v1/shares` lưu mã băm an toàn vào Supabase database.
    4.  [ ] Thiết lập sinh động các thẻ SEO OpenGraph meta phục vụ hiển thị card khi sinh viên chia sẻ qua mạng xã hội.

---

## 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)
1.  Ảnh PNG 3x tải xuống có độ phân giải siêu nét (trên 3000px), hiển thị đúng font chữ JetBrains Mono và giữ nguyên hiệu ứng kính mờ Neon.
2.  Tệp ảnh SVG Vector tải xuống mở được trực tiếp, chỉnh sửa tách node dễ dàng trên Figma/Illustrator.
3.  Liên kết chia sẻ (Share URL) nén băm tối ưu dưới 800 ký tự, hoạt động ổn định trên cả Safari di động và Chrome máy tính.
4.  Người nhận nhấp vào Share URL phục hồi đúng 100% tọa độ node và trạng thái debug đang chạy dở giống nguyên bản.
5.  Trình sinh mã QR Code hiển thị sắc nét, quét nhạy bén tức thời dưới camera di động Android/iOS.
