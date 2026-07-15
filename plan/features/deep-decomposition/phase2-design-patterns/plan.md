# 📅 Implementation Plan - Design Patterns & SOLID Visualizer (Phase 2)

Kế hoạch phát triển phân hệ Trực quan hóa mô hình thiết kế và SOLID (Structural Relationship Visualizer) được phân chia thành 2 Sprint để đảm bảo tính mỹ thuật cao cấp của sơ đồ SVG và tính chính xác của hoạt ảnh runtime.

---

## 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN

```
+-------------------------------------------------------------+
| Sprint A: Sơ đồ Lớp SVG & Kéo thả Tương tác (Ngày 1-3)      |
| - Dựng khung Canvas vẽ nền SVG uốn cong Bezier.             |
| - Thiết kế Thẻ lớp Node bo viền mờ Glassmorphism sang trọng. |
| - Lập trình kéo thả (Drag-and-drop) Node bám đuổi tọa độ.   |
| - Dựng liên kết kế thừa, hiện thực hóa, phụ thuộc Neon.     |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Sprint B: Trình mô phỏng Strategy, Observer & DIP (Ngày 4-6) |
| - Viết mã uốn lượn snap Strategy hoán chuyển runtime.       |
| - Tạo hoạt ảnh stroke-dashoffset chạy tia sáng Observer.   |
| - Tạo công tắc bật tắt DIP chuyển đổi Khớp nối cứng/lỏng.   |
| - Tiền tải các kịch bản Gang of Four qua JSON Loader.       |
+-------------------------------------------------------------+
```

---

## 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN

### Sprint A: Sơ đồ Lớp SVG & Kéo thả Tương tác (Ngày 1-3)
*   **Mục tiêu:** Hoàn thiện sơ đồ lớp SVG có khả năng kéo thả cực nhạy, uốn cong đường dẫn Cubic Bezier bám đuổi tọa độ trơn tru và style Neon sắc sảo.
*   **Danh sách công việc:**
    1.  [ ] Xây dựng khung nền SVG uốn cong Bezier hỗ trợ thu phóng vô hạn.
    2.  [ ] Thiết kế các hộp Node lớp `ClassNodeCard.vue` hiển thị JetBrains Mono JetAttributes và JetMethods đẹp mắt.
    3.  [ ] Lập trình cơ chế kéo thả chuột `@mousedown` cập nhật reactive tọa độ Node tức khắc trên Vue 3.
    4.  [ ] Định nghĩa stylesheet Neon vẽ đường nét đứt, nét liền, mũi tên rỗng cho sơ đồ quan hệ UML.

### Sprint B: Trình mô phỏng Strategy, Observer & DIP (Ngày 4-6)
*   **Mục tiêu:** Cài đặt hoạt ảnh runtime snap đổi hướng Strategy, tia sáng truyền tin Observer và công tắc tách khớp cứng DIP Sandbox.
*   **Danh sách công việc:**
    1.  [ ] Hiện thực hóa lớp TypeScript `DesignPatternVisualizerEngine` hoán chuyển liên kết snap mềm mại khi đổi Strategy.
    2.  [ ] Viết CSS `@keyframes` chạy tia sáng Neon Cyan chạy dọc liên kết biểu thị Observer gửi thông báo.
    3.  [ ] Dựng hộp cát DIP Sandbox: nút gạt "DIP Mode" đổi màu đỏ thẫm coupling dày sang xanh mỏng nhẹ decoupled qua Interface trung gian.
    4.  [ ] Tiền tải kịch bản thiết kế Gang of Four qua JSON Loader sạch sẽ.

---

## 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)
1.  Hộp lớp Class Node Glassmorphism hiển thị đẹp mắt, kéo thả chuột tương tác di chuyển mượt mà 60 FPS.
2.  Đường uốn cong kết nối Cubic Bezier SVG bám sát hoàn hảo tọa độ Node khi kéo thả, tuyệt đối không bị vỡ hạt pixel hay gãy khúc.
3.  Hoán đổi Strategy runtime snap uốn lượn uốn cong liên kết mượt mà sang lớp sắp xếp mới.
4.  Tia sáng Observer lan tỏa chạy dọc đường dẫn SVG chính xác khi bấm nút Notify.
5.  Công tắc DIP Sandbox hoạt động hoàn hảo, thể hiện rõ ràng và súc tích khái niệm Loose Coupling lỏng lẻo sư phạm.
