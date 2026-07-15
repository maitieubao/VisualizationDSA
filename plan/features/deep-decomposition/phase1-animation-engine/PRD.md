# 🚀 Product Requirements Document (PRD) - Animation Engine (Phase 1)

## 1. Tổng quan & Tầm nhìn (Product Overview & Vision)
**Animation Engine** là hạt nhân cốt lõi của nền tảng **VisualizationDSA**, chịu trách nhiệm chuyển đổi luồng tính toán khô khan của các cấu trúc dữ liệu và giải thuật thành những chuỗi chuyển động trực quan, mượt mà và dễ hiểu. 

Mục tiêu tối thượng của Phase 1 là xây dựng một **Khung hoạt họa đa năng (Generic Animation Framework)** có khả năng chịu tải tốt, hiệu năng cao (đạt chuẩn 60 FPS), và cung cấp trải nghiệm tương tác tự nhiên giống như một trình phát video cao cấp, tập trung vào cấu trúc mảng và giải thuật cơ bản trước khi mở rộng ở Phase 2.

---

## 2. Chân dung Người dùng & Kịch bản Sử dụng (User Personas & Scenarios)

### 2.1. Chân dung Người dùng (User Personas)
*   **Học viên CNTT (Huy, 19 tuổi):** Đang học môn Cấu trúc dữ liệu & Giải thuật. Huy thường bị ngợp bởi mã giả và khó hình dung cách các con trỏ so sánh và hoán vị phần tử. Huy cần một công cụ cho phép dừng lại ở các bước khó, tua lại bước trước để xem lại quá trình đổi chỗ, và điều chỉnh tốc độ chạy phù hợp với nhịp tiếp thu cá nhân.
*   **Giảng viên Đại học (Thầy Nam, 45 tuổi):** Dùng phần mềm làm giáo cụ trực quan trên lớp. Thầy cần hệ thống hoạt động ổn định, không bị giật lag khi trình chiếu máy chiếu, và đặc biệt cần khả năng **Timeline Scrubbing (Kéo thanh trượt)** để nhảy nhanh đến các bước phân tích cốt lõi (ví dụ: bước phân hoạch Pivot trong Quick Sort) mà không cần phải chờ đợi phát từ đầu.

### 2.2. Kịch bản Sử dụng (User Scenarios)
1.  **Học tập chủ động:** Huy truy cập bài học "Bubble Sort". Giao diện khởi tạo với một mảng số ngẫu nhiên dưới dạng các cột Canvas. Huy chọn tốc độ phát `1.5x` và bấm **Play**. Mảng bắt đầu chuyển động, các thanh so sánh phát sáng. Đến bước hoán vị thứ 5, Huy thấy khó hiểu tại sao số lớn lại nhảy về sau, Huy bấm **Pause**, sau đó bấm **Step Prev** 2 lần để xem lại trạng thái so sánh trước đó. Sau khi hiểu ra, Huy bấm tiếp **Play** để hoàn tất tiến trình.
2.  **Giảng dạy trên giảng đường:** Thầy Nam chọn giải thuật Quick Sort với mảng nhập tùy chỉnh `[9, 2, 5, 8, 4]`. Sau khi hệ thống sinh dữ liệu trực quan, thầy Nam kéo thanh trượt timeline trực tiếp đến bước phân hoạch cuối cùng để giải thích cơ chế chia để trị cho cả lớp nghe, Canvas tự động vẽ và cập nhật tức thời theo vị trí con trỏ chuột của thầy.

---

## 3. Phạm vi Dự án (Scope of Work)

### 3.1. Trong phạm vi (In-Scope)
*   **Trực quan hóa cấu trúc dữ liệu tuyến tính (Mảng - Array):** Vẽ cột, hiển thị giá trị số, thay đổi màu sắc theo vai trò (đang so sánh, hoán vị, đã sắp xếp).
*   **Hỗ trợ cấu trúc phân nhánh cơ bản:** Cây nhị phân (Binary Tree) và Đồ thị (Graph) thông qua biểu diễn node/edge tĩnh ở Phase 1.
*   **Bảng điều khiển đa phương tiện (Control Panel):**
    *   Phát (Play) / Tạm dừng (Pause).
    *   Tiến một bước (Step Next) / Lùi một bước (Step Prev).
    *   Tua nhanh/chậm (Playback Speed): Hỗ trợ `0.5x`, `1x`, `1.5x`, `2x`, `5x`.
    *   Thanh trượt tiến trình (Timeline Scrubbing) cập nhật thời gian thực.
*   **Đồng bộ Mã giả (Pseudocode Synchronization):** Làm nổi bật dòng code tương ứng đang chạy ở mỗi bước của giải thuật.
*   **Hộp giải thích (Explanation Box):** Hiển thị mô tả văn bản tự nhiên về hành động đang diễn ra ở mỗi bước.
*   **Nhập liệu động (Custom Input):** Cho phép người dùng tạo mảng ngẫu nhiên hoặc tự nhập mảng số mong muốn.

### 3.2. Ngoài phạm vi (Out-of-Scope - Dành cho Phase 2)
*   Trực quan hóa các khái niệm lập trình hướng đối tượng (OOP), các mẫu thiết kế (Design Patterns), nguyên lý SOLID và Dependency Injection.
*   Trình biên dịch trực tiếp từ code người dùng tự viết trên Client sang sơ đồ hoạt họa thời gian thực.
*   Chế độ multiplayer hoặc làm bài kiểm tra tính điểm trực tiếp trên hệ thống hoạt họa.

---

## 4. Danh sách Yêu cầu Tính năng (Functional Requirements)

| ID | Nhóm tính năng | Mô tả chi tiết yêu cầu | Độ ưu tiên |
|:---|:---|:---|:---|
| **FR-1.1** | Player Control | Hỗ trợ nút Play/Pause để bật/tắt tự động nhảy bước hoạt họa. | **Must-Have** |
| **FR-1.2** | Player Control | Hỗ trợ Step Next và Step Prev để di chuyển thủ công từng bước giải thuật. | **Must-Have** |
| **FR-1.3** | Speed Control | Cho phép thay đổi tốc độ chạy của hoạt ảnh thông qua dropdown/slider. | **Must-Have** |
| **FR-1.4** | Timeline | Thanh trượt progress hiển thị phần trăm tiến trình hiện tại. Cho phép người dùng kéo thả chuột (Scrub) để nhảy đến bước bất kỳ. | **Must-Have** |
| **FR-2.1** | Rendering Area | Canvas hiển thị mảng dữ liệu dưới dạng các cột đứng trực quan, chiều cao tương ứng giá trị phần tử. | **Must-Have** |
| **FR-2.2** | Rendering Area | Tự động cập nhật vị trí, màu sắc của các phần tử khi bước hoạt họa thay đổi. | **Must-Have** |
| **FR-3.1** | Code Panel | Hiển thị mã giả của giải thuật đã chọn. Tự động highlight dòng lệnh đang thực thi ở bước hiện tại. | **Must-Have** |
| **FR-4.1** | Explanation | Hộp giải thích hiển thị phụ đề thuyết minh ngôn ngữ tự nhiên tương ứng với hành động trong frame. | **Must-Have** |
| **FR-5.1** | Input Handler | Người dùng nhập mảng tối đa 20 phần tử hoặc bấm nút sinh mảng ngẫu nhiên. | **Must-Have** |

---

## 5. Yêu cầu Phi chức năng (Non-Functional Requirements)

*   **Hiệu năng hiển thị (Performance):** Tần số quét vẽ đồ họa trên Canvas tối thiểu đạt **60 FPS** (Frames Per Second) ở các thiết bị phổ thông. Các chuyển động không được xảy ra hiện tượng răng cưa hay giật cục.
*   **Thời gian phản hồi (Latency):** API sinh mảng Frame từ Backend về Client đối với mảng tối đa 50 phần tử phải phản hồi dưới **300ms** trên môi trường mạng thông thường.
*   **Trải nghiệm người dùng (UX):** Độ trễ phản hồi khi kéo thanh trượt Scrubbing của Timeline đến khi Canvas cập nhật hình ảnh phải dưới **16ms** (tương đương 1 frame hình của tần số 60Hz), tạo cảm giác tương tác tức thì (Instant feedback).
*   **Khả năng tương thích:** Hỗ trợ hiển thị và điều khiển hoàn hảo trên các trình duyệt hiện đại (Chrome, Edge, Firefox, Safari) và tương thích hoàn toàn với chế độ cảm ứng trên máy tính bảng/thiết bị di động.
