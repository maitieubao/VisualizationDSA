# 📚 Core Architectural Decisions (Pseudocode Sync)

Tài liệu này ghi nhận Quyết định Thiết kế Kiến trúc (ADR) chứng minh tính ưu việt của giải pháp đồng bộ hai chiều mã nguồn và Canvas hoạt ảnh trong phân hệ **Pseudocode Sync**.

---

## 1. Architectural Decision Records (ADR)

### ADR-07: Áp dụng Cơ chế Ánh xạ Tương tác Hai chiều (Bidirectional Code-to-Canvas Mapping)

#### Bối cảnh (Context)
Trong đa số các phần mềm trực quan hóa giải thuật hiện hành, hệ thống chỉ hỗ trợ liên kết một chiều (One-way binding): Khi hoạt ảnh Canvas chạy thì dòng mã nguồn sáng lên bám theo. 

Tuy nhiên, khi sinh viên tự tay thiết lập một mảng dữ liệu tùy chỉnh phức tạp và chỉ muốn kiểm tra xem giải thuật hoán vị các số như thế nào ở dòng lệnh Swap:
*   *Thách thức:* Người học buộc phải kéo thanh Slider dòng thời gian tiến lên từng chút một cách thủ công (mò mẫm) để chờ đợi Canvas chuyển đến bước đó. Điều này gây lãng phí thời gian và giảm hiệu quả tự học rõ rệt.
*   *Đồng bộ đa ngôn ngữ:* Sinh viên học khoa Công nghệ thông tin học rất nhiều ngôn ngữ khác nhau (C++ ở năm nhất, Java ở năm hai, Python ở lớp trí tuệ nhân tạo). Nếu chỉ lập trình cứng mã giả thô sơ sẽ không đáp ứng được tính thực tiễn của giáo trình các trường đại học.

#### Quyết định (Decision)
Hệ thống quyết định xây dựng cơ chế **Ánh xạ Hai chiều** kết hợp tách biệt **Dữ liệu Logic và Dữ liệu Cú pháp**:
1.  **Ánh xạ Hai chiều (Bidirectional Click-to-Snap):** Cho phép người học nhấp chuột trực tiếp vào bất kỳ dòng mã nào trên bảng Code Panel. Hệ thống sẽ tự động quét mảng Frame và điều hướng Canvas nhảy nhanh (Snap) đến khung hình khởi nguồn thực thi dòng lệnh đó.
2.  **Đồng bộ logic trừu tượng (Logical ID Mapping):** Toàn bộ quá trình đồng bộ hoạt ảnh không neo trực tiếp vào số dòng vật lý cụ thể (ví dụ: dòng số 5) của một ngôn ngữ. Thay vào đó, nó neo vào một định danh logic trừu tượng (`logicalId` như `"COMPARE_STEP"`, `"SWAP_STEP"`). Định danh logic này được ánh xạ chéo sang dòng vật lý tương ứng của từng ngôn ngữ lập trình được lựa chọn.

#### Kết quả (Consequences)
*   **Điểm tốt (Pros):**
    *   **Trải nghiệm học tập nhảy vọt:** Sinh viên có thể chủ động nhảy nhanh tới các điểm nút thuật toán quan trọng (như lúc đẻ node con BST, lúc swap mảng) chỉ bằng một click chuột vào dòng code tương ứng.
    *   **Tính cá nhân hóa ngôn ngữ:** Sinh viên được tùy chọn học theo cú pháp ngôn ngữ mình đang học trên giảng đường (C++, Java, Python, JavaScript) giúp tăng tốc tiếp thu kiến thức lập trình rõ rệt.
    *   **Dễ mở rộng hạ tầng:** Khi muốn bổ sung thêm ngôn ngữ lập trình mới, chỉ cần khai báo thêm danh sách dòng mã ánh xạ theo đúng bộ `logicalId` cũ, tuyệt đối không phải chỉnh sửa code Canvas.
*   **Điểm cần lưu ý (Cons):**
    *   Cần biên soạn tệp kịch bản bài học kỹ lưỡng hơn để đảm bảo tất cả các file mã nguồn của các ngôn ngữ đều khai báo chính xác bộ `logicalId`. Việc này đã được kiểm soát bằng schema validator ở phía Backend API.
