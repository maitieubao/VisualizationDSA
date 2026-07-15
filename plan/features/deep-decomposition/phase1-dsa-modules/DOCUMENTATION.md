# 📚 Core Architectural Decisions & SOLID Principles (DSA Library)

Tài liệu này ghi nhận các Quyết định Kiến trúc cốt lõi (ADR) chứng minh tại sao mô hình cắm rút độc lập lại là giải pháp tối ưu nhất cho phân hệ thư viện giải thuật **DSA Modules Library**.

---

## 1. Architectural Decision Records (ADR)

### ADR-03: Áp dụng Strategy Pattern & Reflection cho Thư viện thuật toán

#### Bối cảnh (Context)
Dự án trực quan hóa DSA có đặc thù là số lượng thuật toán sẽ liên tục phình to theo thời gian học tập (Phase 1 có 8 giải thuật, Phase 2 có thêm đồ thị, Phase 3 có thêm các cấu trúc cây nâng cao). Nếu thiết kế theo cách truyền thống:
*   Viết tất cả thuật toán chung trong một Controller hoặc một lớp dịch vụ lớn.
*   Sử dụng cấu trúc `switch-case` khổng lồ để rẽ nhánh gọi hàm thực thi dựa trên `algorithmId`.

Cách làm này sẽ dẫn đến thảm họa bảo trì (Maintenance Nightmare), vi phạm nghiêm trọng nguyên tắc **Single Responsibility Principle (SRP)** và **Open/Closed Principle (OCP)** của SOLID. Mỗi lần thêm một giải thuật mới, lập trình viên buộc phải can thiệp trực tiếp vào mã nguồn điều phối chung, tăng cao nguy cơ gây lỗi hồi quy (Regression Bugs) lên các giải thuật cũ đang chạy ổn định.

#### Quyết định (Decision)
Hệ thống quyết định áp dụng **Strategy Pattern** kết hợp với cơ chế quét tự động **Reflection** ở Dependency Injection Container của .NET Core:
*   Mỗi giải thuật là một Class hoàn toàn độc lập triển khai interface `IAlgorithmStrategy`.
*   Tự động phát hiện và đăng ký mọi chiến thuật giải thuật thông qua cơ chế tự động quét Assembly lúc khởi động dự án.
*   API Controller chính được thiết kế tinh giản, chỉ nhận vào `algorithmId` từ client, yêu cầu DI Container cung cấp Strategy phù hợp để thực thi, loại bỏ hoàn toàn các cấu trúc rẽ nhánh switch-case thủ công.

#### Kết quả (Consequences)
*   **Điểm tốt (Pros):**
    *   **Tuân thủ tuyệt đối OCP:** Khi thêm thuật toán mới (ví dụ: Radix Sort), lập trình viên chỉ cần tạo thêm file class mới, tuyệt đối không chỉnh sửa bất kỳ dòng mã nguồn lõi nào hiện có.
    *   **Phân chia công việc song song (Parallel Development):** Nhiều lập trình viên có thể viết các thuật toán khác nhau cùng lúc trên các file độc lập mà không sợ bị xung đột git (git conflicts).
    *   **Dễ dàng kiểm thử đơn vị (Unit Testing):** Mỗi Strategy là một module độc lập, có thể viết unit test riêng biệt cực kỳ nhanh chóng và rõ ràng.
*   **Điểm cần lưu ý (Cons):**
    *   Tăng số lượng file vật lý trong dự án. Tuy nhiên, điều này giúp cấu trúc dự án trở nên mạch lạc và dễ quản lý hơn rất nhiều.
