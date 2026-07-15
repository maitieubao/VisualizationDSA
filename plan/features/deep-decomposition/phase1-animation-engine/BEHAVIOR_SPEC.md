# 🎭 Behavioral Specification & State Machine

Tài liệu này định nghĩa chặt chẽ máy trạng thái hữu hạn (Finite State Machine - FSM) kiểm soát toàn bộ hành vi vận hành và tương tác người dùng của **Animation Engine**.

---

## 1. Bản đồ Trạng thái (FSM State List)

Bộ phát hoạt họa Animation Engine vận hành xoay quanh 5 trạng thái logic nghiêm ngặt:

```
    +-----------------+
    |  UNINITIALIZED  |  (Chưa nạp giải thuật)
    +-----------------+
             |
             | LoadResult()
             v
    +-----------------+      Play()      +-----------------+
    |     LOADED      | ---------------> |     PLAYING     |  (Bộ đếm tick hoạt động,
    |  (Đứng ở step 0,| <--------------- |  (Đang chạy tự  |   đồ họa đang Lerp)
    |   tạm dừng)     |    Stop()        |   động)         |
    +-----------------+                  +-----------------+
             ^                                    |
             |                                    | Pause()
             |             StepForward()          v
             |             StepBackward() +-----------------+
             +--------------------------- |     PAUSED      |  (Tạm dừng ở giữa,
                           ScrubTo()      |  (Người dùng inspect)|  dừng bộ đếm)
                                          +-----------------+
                                                  |
                                                  | currentIndex == totalSteps - 1
                                                  v
                                          +-----------------+
                                          |    FINISHED     |  (Đạt bước cuối cùng,
                                          |  (Hiện màn hoàn tất)|  tắt nút Play)
                                          +-----------------+
```

1.  **`UNINITIALIZED` (Chưa khởi tạo):**
    *   *Mô tả:* Trạng thái mặc định khi người dùng mới truy cập trang học và chưa nhập mảng dữ liệu hoặc chưa bấm nút Visualize.
    *   *Trạng thái UI:* Canvas hiển thị khung trống hoặc màn hình chờ (placeholder), thanh trượt timeline bị vô hiệu hóa (disabled), nút Play/Pause không thể nhấp.
2.  **`LOADED` (Đã nạp):**
    *   *Mô tả:* Nhận thành công dữ liệu `AlgorithmResult` từ API. Con trỏ định vị ở khung hình đầu tiên (`currentIndex = 0`). Hoạt ảnh chưa bắt đầu.
    *   *Trạng thái UI:* Canvas vẽ mảng thô ban đầu, thanh timeline sáng lên ở điểm đầu tiên, mã giả sáng lên dòng lệnh khởi tạo đầu tiên.
3.  **`PLAYING` (Đang phát):**
    *   *Mô tả:* Hệ thống đang tự động tăng dần `currentIndex` sau mỗi khoảng thời gian `1000ms / speed`. Cột đồ họa thực hiện hoạt ảnh di chuyển mượt mà (Lerp).
    *   *Trạng thái UI:* Nút Play biến thành nút **Pause**. Timeline di chuyển liên tục từ trái sang phải.
4.  **`PAUSED` (Tạm dừng):**
    *   *Mô tả:* Dừng luồng đếm thời gian tự động, giữ nguyên màn hình tại chỉ số hiện tại để người dùng quan sát, phân tích các chỉ số so sánh hoặc hoán vị.
    *   *Trạng thái UI:* Nút Pause biến thành nút **Play**. Hai nút **Step Next** và **Step Prev** được kích hoạt để di chuyển thủ công.
5.  **`FINISHED` (Hoàn tất):**
    *   *Mô tả:* `currentIndex` chạm mốc bước cuối cùng trong danh sách (`totalSteps - 1`).
    *   *Trạng thái UI:* Hệ thống dừng phát hoàn toàn. Hiện popup thông báo hoàn thành giải thuật hoặc đổi màu mảng hoàn tất. Nút Play tự động bị khóa (disabled).

---

## 2. Ma trận Chuyển đổi Trạng thái (State Transition Matrix)

| Trạng thái nguồn | Hành động kích hoạt (Trigger) | Trạng thái đích | Tác động hệ thống (System Side-Effect) |
|:---|:---|:---|:---|
| `UNINITIALIZED` | Nạp kết quả API (`loadResult`) | `LOADED` | Gán `currentIndex = 0`, vẽ mảng thô, mở khóa bảng điều khiển. |
| `LOADED` | Nhấp nút **Play** (`play`) | `PLAYING` | Kích hoạt bộ hẹn giờ `setTimeout` bắt đầu lặp `tick()`. |
| `PLAYING` | Nhấp nút **Pause** (`pause`) | `PAUSED` | Gọi `clearTimeout(timerId)` hủy lên lịch bước tiếp theo. |
| `PLAYING` | Nhấp kéo Timeline (`scrubTo`) | `PAUSED` | Tạm dừng phát tự động, nhảy `currentIndex` về vị trí kéo thả chuột, render tức thời Canvas. |
| `PLAYING` | Chạm bước cuối (`currentIndex == n-1`) | `FINISHED` | Gọi `clearTimeout(timerId)`, kích hoạt hiệu ứng Emerald Green hoàn thành mảng, vô hiệu hóa nút Play. |
| `PAUSED` | Nhấp nút **Play** (`play`) | `PLAYING` | Bắt đầu chạy lại vòng lặp `tick()` từ chỉ số hiện tại. |
| `PAUSED` | Nhấp **Step Next** (`stepForward`) | `PAUSED` | Tăng chỉ số index thêm 1 đơn vị (nếu chưa chạm cuối mảng), cập nhật hình vẽ tĩnh. |
| `PAUSED` | Nhấp **Step Prev** (`stepBackward`) | `PAUSED` | Giảm chỉ số index đi 1 đơn vị (nếu index > 0), cập nhật hình vẽ tĩnh. |
| `FINISHED` | Nhấp nút **Reset/Stop** (`stop`) | `LOADED` | Đưa `currentIndex` về 0, reset màu sắc mặc định cho toàn bộ cột. |

---

## 3. Đặc tả Chi tiết Hành vi Ranh giới (Edge Case & Boundary Checks)

*   **Chặn nhảy chỉ số (Out of Bounds Guard):** Khi tăng `currentIndex` ở nút Step Next hoặc giảm ở nút Step Prev, hệ thống luôn chèn bộ lọc kiểm tra:
    ```typescript
    if (currentIndex.value < 0) currentIndex.value = 0;
    if (currentIndex.value >= totalSteps.value) currentIndex.value = totalSteps.value - 1;
    ```
*   **Thay đổi tốc độ đột ngột (Speed Change Interruption):** Nếu người dùng thay đổi tốc độ chạy từ `1.0x` sang `5.0x` khi đang ở trạng thái `PLAYING`, hệ thống sẽ tạm dừng bộ hẹn giờ cũ và kích hoạt lại ngay bộ hẹn giờ mới để áp dụng độ trễ rút ngắn `200ms` lập tức, không gây khựng hình hết chu kỳ cũ.
*   **Mất tiêu điểm tab (Tab Out of Focus):** Khi người dùng chuyển sang tab trình duyệt khác, trình duyệt sẽ tự động giảm tải xử lý hoạt ảnh. Pinia Store sử dụng sự kiện `visibilitychange` để tự động **Pause** hoạt ảnh, ngăn trình duyệt bị treo khi người dùng quay lại sau đó.
