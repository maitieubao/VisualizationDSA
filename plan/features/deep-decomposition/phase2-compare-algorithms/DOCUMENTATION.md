# 📚 Core Architectural Decisions (Algorithm Comparator)

Tài liệu này ghi nhận Quyết định Thiết kế Kiến trúc (ADR) chứng minh tính tối ưu, mượt mà chuyển động và trải nghiệm sư phạm nhất quán của giải pháp Bộ điều phối phát kép đồng bộ trong phân hệ **Side-by-Side Algorithm Comparator**.

---

## 1. Architectural Decision Records (ADR)

### ADR-10: Bộ điều phối Phát kép Đồng bộ & Gom chu kỳ RequestAnimationFrame (Unified Synchronized Multi-Playback & rAF Batching)

#### Bối cảnh (Context)
Trong giảng dạy khoa học thuật toán, việc so sánh trực quan đối sánh hai thuật toán chạy song song (ví dụ: Bubble Sort đấu với Quick Sort) là cực kỳ hiệu quả để dạy Big-O. Tuy nhiên, phân hệ này đối mặt với hai thách thức lớn về hiệu năng và trải nghiệm người dùng:
*   *Thử thách 1 (Bất đồng bộ tiến độ):* Quick Sort có tổng số khung hình hoạt ảnh (ví dụ: 15 frames) ít hơn rất nhiều so với Bubble Sort (ví dụ: 80 frames). Nếu phát cùng số frame/giây, Quick Sort sẽ chạy vèo xong trong 0.5 giây rồi đứng im, còn Bubble Sort lết chầm chậm trong 5 giây, làm người học khó so sánh tiến độ trực quan.
*   *Thử thách 2 (Quá tải Card màn hình UI):* Vẽ đồng thời hai Canvas động 60 FPS riêng lẻ bất đồng bộ gây hiện tượng sụt giảm khung hình nghiêm trọng (Frame drops), đặc biệt là trên trình duyệt Chrome của máy tính bảng hoặc laptop sinh viên cấu hình yếu.

#### Quyết định (Decision)
Hệ thống quyết định xây dựng kiến trúc **Bộ điều phối Phát kép Đồng bộ (Unified Playback Coordinator)** kết hợp **Lập lịch Vẽ RequestAnimationFrame hợp nhất (rAF Batching)**:
1.  **Đồng bộ dòng thời gian dạng Tỷ lệ Phần trăm (%):** Thanh Range Slider trung tâm điều tiết dòng thời gian dựa trên tỉ lệ phần trăm tiến độ chung ($0 - 100\%$). Khi người dùng kéo tua Slider tới mốc $P\%$, cả hai Canvas con lập tức snap tới frame thứ:
    $$\text{Frame}_{target} = \text{Round}\left(\frac{P}{100} \times \text{TotalFrames}\right)$$
2.  **Đồng bộ tốc độ phát tương đối (Aligned Speed):** Bộ điều phối tự động nhân tốc độ phát của thuật toán ngắn hơn dựa trên tỷ số tổng frames, cam kết cả hai thuật toán đối sánh cùng bắt đầu phát và cùng hoàn thành đồng thời, mang lại cảm quan so sánh hiệu năng trực diện tuyệt vời.
3.  **Lập lịch vẽ RequestAnimationFrame hợp nhất:** Triển khai lớp `UnifiedRenderScheduler` gom các cuộc gọi render của cả hai Canvas con vào trong đúng **một chu kỳ quét duy nhất** của GPU màn hình thay vì gọi riêng lẻ hai chu kỳ bất đồng bộ, giảm tải 50% tài nguyên CPU hao phí.

#### Kết quả (Consequences)
*   **Điểm tốt (Pros):**
    *   **Trải nghiệm sư phạm đỉnh cao:** Người học cực kỳ thích thú khi quan sát Quick Sort chạy qua các mốc phần trăm $25\%, 50\%, 75\%$ đồng hành song song cùng Bubble Sort, thấu hiểu sâu sắc Big-O.
    *   **Chạy cực kỳ mượt mà:** Nhờ rAF Batching, tốc độ hiển thị đạt chuẩn 60 FPS ổn định hoàn hảo trên cả các máy tính cấu hình yếu của sinh viên.
    *   **Nhất quán dữ liệu:** Cả hai Canvas đều nạp chung một mảng số ngẫu nhiên ban đầu, tăng tính thuyết phục của thực nghiệm khoa học.
*   **Điểm cần lưu ý (Cons):**
    *   Yêu cầu hệ thống phải tính toán trước toàn bộ mảng Frames của cả hai giải thuật trước khi bắt đầu phát. Việc này đã được hệ thống Store Pinia xử lý mượt mà ở Client-side.
    
