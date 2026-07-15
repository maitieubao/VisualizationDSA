# 📚 Core Architectural Decisions (System Design Visualizer)

Tài liệu này ghi nhận Quyết định Thiết kế Kiến trúc (ADR) chứng minh tính ưu việt về hiệu năng mưa hạt trôi nổi và khả năng phản hồi trực quan sự cố sập nguồn tức thì của phân hệ **System Design & Distributed Architecture Visualizer**.

---

## 1. Architectural Decision Records (ADR)

### ADR-24: Bộ máy Mô phỏng Actor-Model định tuyến luồng tin chạy 100% Client-side bằng TypeScript

#### Bối cảnh (Context)
Các hệ thống phân tán lớn cực kỳ phức tạp và trừu tượng (Load Balancer chia tải, API Gateway lọc gói tin, DB Replication trễ trễ mạng). Việc giảng dạy lý thuyết này thường gặp rào cản lớn:
*   *Lệch pha ngữ cảnh thực tế:* Sinh viên không có cảm xúc trực quan về "gói tin bị định tuyến thế nào" nếu không thấy dòng chảy hạt chạy vật lý trước mắt.
*   *Trễ mô phỏng (Simulation Latency):* Nếu gửi yêu cầu xả lũ (mưa hạt) và cấu hình sập nguồn về backend máy chủ để mô phỏng định tuyến mạng rồi trả tọa độ về vẽ, thời gian trễ sẽ băm nát trải nghiệm 60 FPS mượt mà.

#### Quyết định (Decision)
Hệ thống quyết định tự phát triển **Bộ máy mô phỏng hành vi định tuyến phi tập trung (Actor-Model simulator) hoàn toàn ở Client-side bằng TypeScript** lồng ghép Canvas 2D phát khói bụi sập nguồn và SVG Paths uốn lượn:
1.  **Actor-Model Decentralized Nodes:** Mỗi máy chủ, Load Balancer hay DB là một Actor quản lý vòng đời độc lập dưới RAM.
2.  **Mưa hạt Neon 60 FPS:** Vẽ trôi trượt hạt tròn Neon trên các thẻ `<path>` SVG sử dụng công thức tính toán bước thời gian co giãn `progress` độc lập cực nhẹ.
3.  **Canvas khói sương FAILED:** Sập nguồn Server lập tức kích hoạt Canvas 2D phát hạt khói xám bay tỏa tròn cuồn cuộn tả cảnh sụp đổ hệ thống.

#### Kết quả (Consequences)
*   **Điểm tốt (Pros):**
    *   **Failover mượt mà dưới 10ms (Instant Redirection):** Nhấp sập nguồn Server A là Load Balancer đổi hướng 100% dòng hạt Neon sang Server B ngay lập tức dưới **10ms**, tạo cảm giác tương tác cực nhạy.
    *   **Hiệu ứng vật lý sành điệu premium:** Bụi khói sập nguồn cuồn cuộn kết hợp mưa hạt Neon xanh đỏ rực rỡ lôi cuốn trọn vẹn sự thích thú học tập của sinh viên.
    *   **Chịu tải mưa hạt lớn:** Máy khách dễ dàng render 200 hạt dữ liệu đồng hành trôi nổi không sụt giảm FPS.
*   **Điểm cần lưu ý (Cons):**
    *   Phải dọn sạch các hạt đã về đích hoặc bị drop khỏi RAM GC triệt để để tránh rò rỉ bộ nhớ khi học viên xả lũ dồn dập.
    
    
