# 🚀 Product Requirements Document (PRD) - Multi-View Synchronization (Phase 2)

## 1. Tổng quan Nghiệp vụ (Overview)
Phân hệ **Multi-View Synchronization** (Đa Giao diện & Chế độ xem Song song) cho phép sinh viên học tập thuật toán ở cấp độ thấu hiểu sâu nhất bằng cách quan sát đồng thời sự thay đổi của mã nguồn, sơ đồ khối logic Flowchart và biến chuyển của cấu trúc dữ liệu trong bộ nhớ (SVG) thông qua một màn hình chia nhỏ thông minh (Split-screen) đồng bộ tuyệt đối về mặt thời gian.

---

## 2. Mục tiêu Nghiệp vụ (Goals)
*   **Đập tan rào cản khái niệm (Conceptual Linkage):** Kết nối trực tiếp từng dòng code đang thực thi với sơ đồ khối và hoạt ảnh mảng/cây, giúp sinh viên hiểu rõ "Code chạy dòng này thì cấu trúc mảng biến chuyển thế nào".
*   **Điều khiển tua dòng thời gian linh hoạt (Scrubbing):** Cung cấp bộ điều khiển tua thời gian VCR Scrubber dùng chung, cho phép người dùng kéo slider tua đi, tua lại thuật toán như một đoạn video, đồng bộ tức thì các view dưới 1ms.
*   **Co giãn phân cực tối tân (Responsive Splitting):** Thiết kế thanh trượt phân chia pane Drag Splitter kính mờ Neon sành điệu, cho phép học viên tự do thay đổi kích cỡ từng bảng xem theo sở thích.
*   **Hiệu năng mượt mà tuyệt đối:** Đảm bảo không xảy ra đơ giật hay lệch pha giữa các khung nhìn khi tua nhanh liên tục.

---

## 3. Các Tính năng trong Phạm vi MVP (Phase 2 MVP Scope)

### 3.1. Bố cục Đa giao diện Song song (Split-Screen Layout)
*   Hỗ trợ chia đôi panel dọc (Left/Right) hoặc chia ba panel (Left/Middle/Right).
*   Thanh kéo thả chia pane kính mờ sành điệu bừng sáng Neon Cyan khi tương tác.

### 3.2. Trục Đồng bộ Dòng thời gian VCR (Unified VCR Scrubber)
*   Bộ trượt thời gian dùng chung đồng bộ hóa 3 View: Monaco Editor, Flowchart và SVG Animation.
*   Bộ điều khiển Play, Pause, Step Next/Prev, đổi tốc độ chạy ($0.5x, 1x, 2x$).

### 3.3. Đồng bộ hóa Monaco Highlight & Flowchart Node Pulsing
*   Tô sáng dòng code Monaco đang chạy bằng màu vàng hổ phách Neon mờ rực rỡ kèm mũi tên laser chỉ biên.
*   Node sơ đồ khối tương ứng nhấp nháy phát sáng đồng điệu.

---

## 4. Trải nghiệm người dùng (User Stories)
*   Là một sinh viên đang vật lộn tìm hiểu thuật toán chia để trị QuickSort phức tạp, tôi muốn chia màn hình làm hai: bên trái hiển thị Monaco Editor tô sáng dòng code phân tách pivot, bên phải hiển thị cấu trúc cây SVG di chuyển hoán đổi các bar mảng, giúp tôi thấu hiểu sâu sắc bản chất thuật toán.
*   Là một học viên thích nghiên cứu kỹ từng bước thực thi của giải thuật đệ quy, tôi muốn kéo thanh trượt tua thời gian VCR Scrubber sang bước 15, nhìn thấy ngay dòng code Monaco sáng rực ở dòng số 9 và node đệ quy tương ứng trên Flowchart bừng sáng nhấp nháy Neon đồng điệu không chút trễ nải.
*   Là một người dùng sở hữu màn hình rộng Ultra-wide, tôi muốn kéo thả thanh chia pane để mở rộng tối đa khung SVG Cấu trúc Cây bên phải, đồng thời thu nhỏ khung Code Monaco bên trái để tập trung quan sát hoạt ảnh trực quan sinh động nhất.
