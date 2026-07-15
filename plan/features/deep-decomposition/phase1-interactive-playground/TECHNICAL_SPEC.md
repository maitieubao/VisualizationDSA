# 🛠 Technical Specification - Interactive Playground (Phase 1)

Tài liệu này đặc tả chi tiết kiến trúc nhận diện va chạm hình học, thuật toán lượng giác định vị đầu mũi tên và hệ thống lực đẩy vật lý cân bằng đồ thị chạy ở Client-side.

---

## 1. Thuật toán Nhận diện Va chạm Đỉnh (Hit Detection math)

Vì toàn bộ các đỉnh được vẽ dạng hình tròn trên một thẻ Canvas chung, chúng ta áp dụng công thức **Khoảng cách Euclide (Euclidean Distance)** để kiểm tra tọa độ click chuột ($x, y$) có nằm trong vòng tròn đỉnh có tâm ($cx, cy$) và bán kính $R$ hay không:

$$d = \sqrt{(x - cx)^2 + (y - cy)^2}$$

### Quy tắc quyết định:
*   Nếu $d \le R$: Va chạm thành công. Đỉnh này được đánh dấu là đối tượng đang chịu sự tương tác (click, nắm kéo, hoặc xóa).
*   Nếu $d > R$: Không va chạm. Tiếp tục kiểm tra các đỉnh còn lại trong danh sách.

---

## 2. Lượng giác Định vị Đầu Mũi tên (Trigonometric Arrowhead Placement)

Mũi tên liên kết của cạnh có hướng nối từ đỉnh A ($x_1, y_1$) sang đỉnh B ($x_2, y_2$) bắt buộc phải dừng lại ngay tại **đường viền ngoài** của hình tròn B để tránh đè lên nhãn chữ của đỉnh.

Chúng ta sử dụng hàm lượng giác `Math.atan2` để xác định chính xác điểm tiếp xúc tọa độ viền ($targetX, targetY$) với bán kính đỉnh là $R$:

```typescript
// 1. Tính góc hướng chéo giữa hai tâm đỉnh
const angle = Math.atan2(y2 - y1, x2 - x1);

// 2. Tính tọa độ tiếp tiếp xúc sát viền ngoài đỉnh B
const targetX = x2 - R * Math.cos(angle);
const targetY = y2 - R * Math.sin(angle);

// 3. Sử dụng targetX, targetY làm tọa độ gốc để vẽ tam giác mũi tên hướng góc angle
```

---

## 3. Thuật toán Vật lý Ổn định Đồ thị (Force-Directed Graph Physics)

Để cấu hình đồ thị vẽ ra luôn gọn gàng tự nhiên mà sinh viên không cần mất công sắp xếp từng node thủ công, hệ thống tích hợp vòng lặp mô phỏng lực vật lý (Physics loop):

*   **Lực đẩy tĩnh điện (Repulsive Force):** Tất cả các node đẩy nhau ra xa như hai cực nam châm cùng dấu để tránh đè lấp lên nhau:
    $$f_{repulsive}(d) = \frac{C_{rep}}{d^2}$$
*   **Lực kéo lò xo (Attractive Force):** Các cạnh liên kết đóng vai trò là các lò xo co giãn, kéo hai node kề sát lại gần nhau nếu chúng ở quá xa:
    $$f_{attractive}(d) = C_{att} \times (d - L_{spring})$$

Hệ thống tính toán tích lũy vectơ lực đẩy-kéo này và cập nhật tọa độ mới cho các node tại mỗi khung hình vẽ lại ở tần suất 60 FPS.
