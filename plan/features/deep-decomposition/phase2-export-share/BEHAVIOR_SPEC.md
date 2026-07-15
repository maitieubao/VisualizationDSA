# 🎭 Behavioral Specification & Sharing Restrictions (Phase 2)

Tài liệu này đặc tả chi tiết quy tắc giới hạn kích thước xuất ảnh Canvas, chính sách chặn dung lượng nén Workspace State và ràng buộc SEO OpenGraph mạng xã hội trong phân hệ **Export & Share Pipeline**.

---

## 1. Ràng buộc Tỉ lệ Phóng đại Xuất ảnh (Image Scaling Limits)

Để đảm bảo ảnh xuất ra đạt chất lượng in ấn tối đa nhưng không làm tràn bộ nhớ GPU của trình duyệt máy khách:
*   **Giới hạn Tỉ lệ Scale (Scale Factor Clamping):**
    *   Hệ thống thiết lập tỉ lệ scale tối thiểu $\text{MinScale} = 1$ (chất lượng hiển thị web thông thường).
    *   Hệ thống giới hạn tỉ lệ scale tối đa $\text{MaxScale} = 4$ (độ phân giải khổng lồ phục vụ in băng rôn lớn).
    *   Tỉ lệ mặc định khuyên dùng là $3$ (Retina Sharp 300 DPI, hiển thị hoàn hảo trên slide thuyết trình).
*   **Chính sách Nền trong suốt (Transparent Background):**
    *   Tệp ảnh PNG tải xuống bắt buộc phải để nền trong suốt (transparent) để sinh viên dễ dàng chèn đè lên mọi tông nền slide thuyết trình (White/Black) mà không bị viền hộp thô thiển.

---

## 2. Chính sách Chặn Kích thước Nén Workspace State (Size Restriction Policy)

Để tránh các hành vi lạm dụng gửi spam các file JSON cấu hình khổng lồ làm treo cơ sở dữ liệu Supabase:
*   **Giới hạn Kích thước chuỗi nén (Max Compressed Length):**
    *   Hệ thống thiết lập độ dài chuỗi băm tối đa sau khi nén `compressedState` là **20,000 ký tự** (tương đương khoảng 20KB dung lượng lưu trữ).
    *   Nếu vượt quá giới hạn (ví dụ: sinh viên cố tình tạo 10,000 Node thẻ lớp UML rác), hệ thống lập tức chặn đứng quá trình gửi link, chớp tắt cảnh báo đỏ: `"WORKSPACE_OVERFLOW: Sơ đồ quá đồ sộ, vui lòng tinh gọn bớt các Node thừa trước khi chia sẻ!"`

---

## 3. Quy chuẩn Hiển thị SEO Thẻ OpenGraph mạng xã hội (OpenGraph Tags Rules)

Khi chia sẻ URL rút gọn lên Facebook, Zalo, hay Messenger:
*   Hệ thống tự động biên dịch thẻ meta tiêu đề động: `"Trực quan thuật toán QuickSort của [Tên sinh viên]"` kèm mô tả ngắn: `"Xem và tương tác trực tiếp phòng lab cấu hình đệ quy QuickSort động trên hệ thống VisualizationDSA."`
*   Đảm bảo đường link chia sẻ xuất hiện lộng lẫy, tăng cường tính lan tỏa giáo dục và thu hút tương tác xã hội tối đa.
