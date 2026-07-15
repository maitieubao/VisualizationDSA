# 📚 Core Architectural Decisions (Execution Control)

Tài liệu này ghi nhận Quyết định Thiết kế Kiến trúc (ADR) chứng minh giải pháp tối ưu hóa hiệu năng vẽ Canvas và dọn dẹp tài nguyên hoạt ảnh trong phân hệ **Execution Control**.

---

## 1. Architectural Decision Records (ADR)

### ADR-05: Throttled State Scrubbing & Tweening Cleanup (Kéo tua Dòng thời gian)

#### Bối cảnh (Context)
Trong một ứng dụng trực quan hóa cấu trúc dữ liệu và giải thuật động, khả năng kéo tua thời gian (Scrubbing) qua thanh trượt Slider là công cụ cực kỳ thiết thực cho sinh viên để học đi học lại các bước khó. 

Tuy nhiên, khi người dùng giữ chuột và di liên tục qua lại trên thanh trượt, sự kiện `@input` ở frontend được trình duyệt kích hoạt liên tục với tần suất cực kỳ cao (lên tới hơn 150 lần mỗi giây). 
*   *Thách thức:* Nếu mỗi sự kiện kéo chuột nhỏ bắt buộc hệ thống phải tính toán lại tọa độ, dựng lại các cột đồ họa và kích hoạt hàm vẽ lại Canvas (`requestAnimationFrame`) ngay lập tức sẽ làm bộ xử lý đồ họa của trình duyệt bị quá tải toàn bộ. Gây ra hiện tượng giật đứng khung hình (UI Freeze), lag chuột và nóng CPU máy tính học viên.
*   *Lỗi hoạt ảnh dở dang (Tweening Collisions):* Nếu mảng đang có hiệu ứng bay di chuyển mượt mà (Tween) mà người dùng đột ngột tua thời gian, các hoạt ảnh tịnh tiến này không bị hủy bỏ sẽ dẫn đến việc vẽ đè các cột, méo mó đồ họa và làm sai lệch tọa độ vẽ của Canvas.

#### Quyết định (Decision)
Hệ thống quyết định áp dụng hai cơ chế tối ưu hóa hiệu năng cốt lõi cho phân hệ điều khiển:
1.  **Dọn dẹp hoạt ảnh dở dang (Tweening Cleanup):** Ngay khi phát hiện sự kiện bắt đầu kéo tua Slider hoặc click nút Step Backward/Forward, hệ thống lập tức ra lệnh **Hủy bỏ hoàn toàn (Kill/Cancel)** mọi tiến trình chuyển động mịn (Tween) đang chạy dở dang trên Canvas. Canvas chuyển sang chế độ **Snap tức thời (Instant Translation)**: Áp dụng trực tiếp tọa độ tĩnh được định cấu hình của Frame đích để vẽ lại ngay lập tức mà không chạy hiệu ứng chuyển tiếp trượt cột.
2.  **Giới hạn Tần suất Vẽ lại (Throttling):** Sử dụng hàm giới hạn của VueUse (`useThrottleFn`) khóa cứng tần suất kích hoạt hàm vẽ lại Canvas tối đa **30 lần mỗi giây (30 FPS)** trong suốt tiến trình giữ chuột kéo tua.

#### Kết quả (Consequences)
*   **Điểm tốt (Pros):**
    *   **Hiệu năng mượt mà phi thường:** Thanh trượt di chuyển nhẹ nhàng, Canvas phản hồi tức thời theo trỏ chuột kéo mà không gây quá tải CPU hay đứng luồng trình duyệt.
    *   **Tính nhất quán dữ liệu đồ họa (Visual Integrity):** Loại bỏ hoàn toàn lỗi vỡ hình, vẽ đè cột mảng hay hiển thị sai vị trí các con trỏ khi tua nhanh thời gian.
*   **Điểm cần lưu ý (Cons):**
    *   Trong khi đang kéo tua chuột, hoạt ảnh tịnh tiến mượt mà sẽ tạm thời chuyển sang snap nhanh 30 FPS. Điều này là hoàn toàn chấp nhận được và phù hợp với thói quen tua video của người dùng.
