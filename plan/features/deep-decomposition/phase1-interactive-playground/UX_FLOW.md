# 🌊 UX Flow & Drawing Walkthroughs - Interactive Playground

Tài liệu này đặc tả chi tiết các kịch bản trải nghiệm người dùng (User Journeys) thực tế trong quá trình vẽ đồ thị tương tác và ôn thi bằng phím tắt trên **Interactive Playground**.

---

## 📌 KỊCH BẢN 1: THIẾT KẾ ĐỒ THỊ Dijkstra & CHIA SẺ LINK BÀI TẬP

### Tình huống: Học sinh muốn thiết lập một mạng lưới giao thông 4 đỉnh có trọng số để tìm đường ngắn nhất

```
[Mở thuật toán Dijkstra] -> [Màn hình Canvas trống xuất hiện]
        |
        v Rê chuột sang thanh công cụ nổi bên trái, click chọn [ ➕ ] (Add Node)
[Nhấp chuột 4 góc trên Canvas sinh ra 4 đỉnh: A, B, C, D]
        |
        v Click chọn công cụ [ ↘️ ] (Add Edge) trên Toolbar
[Kéo dây chun đứt nét từ A sang B, B sang C, C sang D, D sang A]
[Khi dây chun rê gần đỉnh đích, viền đỉnh đích lóe sáng Glow xanh và tự hút vào viền]
        |
        v Click chọn công cụ [ 🏷️ ] (Weight Tool)
[Click vào con đường nối A-B, một ô Popover nhỏ hiện ra ngay trung điểm]
[Gõ số "6", ấn Enter -> Nhãn chữ "6" nằm ngay ngắn trên cạnh]
        |
        v Rê chuột lên góc trên bên phải, click [ 🔗 Chia sẻ đồ thị ]
[Hệ thống mã hóa đồ thị thành chuỗi Base64 và sao chép Link vào Clipboard]
[Học sinh gửi Link này qua Messenger cho bạn học cùng ôn tập]
```

---

## 📌 KỊCH BẢN 2: THAO TÁC XÓA NHANH BẰNG PHÍM TẮT BÀN PHÍM

### Tình huống: Người học đang vẽ cây nhị phân và muốn tinh chỉnh nhanh bằng phím xóa

```
[Đang ở chế độ SELECT công cụ mui tên di chuyển 🖱️]
        |
        v Click vào một đỉnh Node "E" bị vẽ nhầm trên Canvas
[Viền Node "E" chuyển sang trạng thái nét đứt đậm màu xanh lá cây biểu thị đang chọn]
        |
        v Nhấn phím Backspace hoặc Delete trên bàn phím máy tính
[Node "E" lập tức biến mất mượt mà]
[Toàn bộ các cạnh liên kết nối vào Node "E" cũng tự động biến mất]
        |
        v Canvas vẽ lại trạng thái sạch đẹp chỉ trong 1 khung hình
```

---

## 3. Bản đồ Chuyển dịch Phím tắt Vẽ nhanh (Accessibility shortcuts)

Để hỗ trợ người dùng thao tác vẽ đồ thị nhanh bằng bàn phím máy tính:

*   **Phím `V`:** Chuyển nhanh sang chế độ **SELECT** (Di chuyển đỉnh).
*   **Phím `N`:** Chuyển nhanh sang chế độ **ADD_NODE** (Đẻ đỉnh mới).
*   **Phím `E`:** Chuyển nhanh sang chế độ **ADD_EDGE** (Nối cạnh).
*   **Phím `W`:** Chuyển nhanh sang chế độ **WEIGHT** (Gán trọng số).
*   **Phím `Delete` / `Backspace`:** Xóa bỏ phần tử (đỉnh hoặc cạnh) đang được nhấp chọn.
