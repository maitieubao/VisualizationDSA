# 🎨 UI & UX Specifications - Canvas Rendering System (Vue 3)

Tài liệu này đặc tả chi tiết giao diện người dùng, cấu trúc component và cơ chế hoạt họa tối ưu trên trình duyệt sử dụng **HTML5 Canvas API** và **Vue 3**.

---

## 1. Kiến trúc Thành phần Giao diện (Component Architecture)

Màn hình trình diễn hoạt họa giải thuật được chia nhỏ thành các component độc lập nhằm tăng tính tái sử dụng và dễ bảo trì:

```
+-----------------------------------------------------------------------------------+
|                            VisualizationPlayer.vue                                |
|  Component bọc chính điều phối luồng nạp và phát toàn bộ màn hình Visualizer      |
+-----------------------------------------------------+-----------------------------+
|                                                     |                             |
|                  CanvasLayer.vue                    |     PseudoCodePanel.vue     |
|  - Component đồ họa vẽ bitmap tĩnh của mảng số      |  - Hiển thị danh sách dòng  |
|  - Lắng nghe biến đổi từ useAnimationStore          |    mã giả (Pseudocode)      |
|  - Thực thi vòng lặp 60 FPS mượt mà                 |  - Làm nổi bật activeLine   |
|                                                     |                             |
+-----------------------------------------------------+-----------------------------+
|                            ExplanationPanel.vue                                   |
|  - Hiển thị mô tả thuyết minh ngôn ngữ tự nhiên ứng với currentFrame.explanation  |
+-----------------------------------------------------------------------------------+
|                              ControlPanel.vue                                     |
|  - Chứa thanh trượt Timeline (Scrubbing) đồng bộ currentIndex                     |
|  - Các nút thao tác Play/Pause, Step Forward/Backward, chỉnh tốc độ phát          |
+-----------------------------------------------------------------------------------+
```

---

## 2. Giải pháp Vẽ Đồ họa: HTML5 Canvas vs DOM/SVG

Hệ thống lựa chọn công nghệ **HTML5 Canvas API** làm lõi hiển thị đồ họa trực quan hóa giải thuật dựa trên các tiêu chí so sánh hiệu năng nghiêm ngặt:

| Tiêu chí | Vẽ bằng thẻ HTML (DOM) | Vẽ bằng ảnh vector (SVG) | Vẽ bằng HTML5 Canvas |
|:---|:---|:---|:---|
| **Hiệu năng 60 FPS** | Kém (Trình duyệt tốn nhiều tài nguyên Reflow & Paint lại layout). | Trung bình (Tải nặng khi số lượng thẻ SVG gDOM tăng lớn). | **Xuất sắc** (Vẽ trực tiếp lên 1 bitmap phẳng duy nhất cực kỳ nhanh). |
| **GPU Acceleration** | Không hỗ trợ trực tiếp. | Hỗ trợ hạn chế. | **Hỗ trợ phần cứng GPU** giúp giảm tải cho CPU trình duyệt. |
| **Tiêu tốn bộ nhớ** | Rất cao (Tạo hàng ngàn DOM Node vật lý trong trang). | Cao (Tạo hàng ngàn XML tag trong tài liệu). | **Cực thấp** (Chỉ duy trì 1 khung màn hình phẳng cố định). |
| **Độ linh hoạt hoạt ảnh** | Hạn chế ở các thuộc tính CSS. | Khá tốt nhưng quản lý tọa độ phức tạp. | **Tuyệt vời** (Cơ chế vẽ Pixel tự do, dễ viết công thức toán chuyển động). |

---

## 3. Bản đồ Tọa độ & Bảng màu Chuẩn hóa (Coordinates & Colors)

### 3.1. Tính toán Tọa độ Vẽ Cột (Coordinate Calculations)
Để mảng số hiển thị cân đối bất kể số lượng phần tử thay đổi, Canvas áp dụng công thức tính toán độ rộng và khoảng cách tự động:
*   Gọi chiều rộng của khu vực Canvas là $W_{canvas}$ và chiều cao là $H_{canvas}$.
*   Gọi mảng dữ liệu có $N$ phần tử, giá trị lớn nhất trong mảng là $V_{max}$.
*   Khoảng cách giữa hai cột liền kề: $Gap = 8 \text{px}$.
*   Độ rộng khả dụng của mỗi cột: $W_{column} = \frac{W_{canvas} - Gap \times (N - 1) - Margin \times 2}{N}$.
*   Chiều cao của cột biểu diễn phần tử $A[i]$: $H_{column}[i] = \frac{A[i]}{V_{max}} \times (H_{canvas} - PaddingTop)$.
*   Tọa độ gốc $(X_i, Y_i)$ để vẽ cột thứ $i$ (gốc tọa độ Canvas ở góc trên bên trái):
    $$X_i = Margin + i \times (W_{column} + Gap)$$
    $$Y_i = H_{canvas} - H_{column}[i] - MarginBottom$$

### 3.2. Bảng mã màu sắc chuyên biệt (Theme Palette)
Giao diện áp dụng Sleek Dark Mode sang trọng, độ tương phản cao đạt chuẩn kiểm định tiếp cận WCAG:
*   **Màu nền Canvas:** `#0F172A` (Slate Dark - Ổn định thị giác).
*   **Màu cột mặc định:** `#38BDF8` (Light Blue - Trạng thái chờ trung tính).
*   **Màu cột đang so sánh (Compare):** `#FBBF24` (Amber Gold - Tạo sự chú ý).
*   **Màu cột đang hoán vị (Swap):** `#EF4444` (Ruby Red - Thể hiện sự thay đổi mạnh mẽ).
*   **Màu cột đã sắp xếp xong (Sorted):** `#10B981` (Emerald Green - Trạng thái an toàn, hoàn tất).
*   **Màu chữ số giá trị:** `#FFFFFF` (Vẽ giữa thân cột hoặc đỉnh cột giúp dễ đọc).

---

## 4. Giải pháp Hoạt ảnh Mượt mà (Fluid Transition Engine)

Để tránh hiện tượng cột đồ họa giật nhảy tức thời (teleport) khi có lệnh Swap, chúng ta xây dựng bộ khung nội suy thời gian thực tích hợp bên trong vòng lặp vẽ chính.

### 4.1. Toán học Nội suy Tuyến tính (Lerp - Linear Interpolation)
Khi có sự thay đổi chỉ số vị trí của các phần tử từ tọa độ nguồn $X_{start}$ sang tọa độ đích $X_{end}$ (ví dụ khi hoán vị vị trí $i$ và $i+1$), chúng ta không vẽ cột nhảy ngay lập tức. Tọa độ vẽ thực tế tại mỗi khung hình được tính theo tỷ lệ tiến trình thời gian $t \in [0, 1]$:
$$X(t) = X_{start} + (X_{end} - X_{start}) \times \text{EasingFunction}(t)$$

Trong đó, hàm làm mềm chuyển động (Easing Function) áp dụng công thức **Cubic Ease-Out** để cột di chuyển nhanh lúc đầu và giảm tốc êm ái khi gần đến đích:
$$\text{EaseOut}(t) = 1 - (1 - t)^3$$

### 4.2. Khung mã nguồn điều hướng vẽ bằng requestAnimationFrame
```javascript
let animationProgress = 0; // Tiến trình hoạt ảnh từ 0 đến 1
let sourcePositions = [];   // Lưu tọa độ X ban đầu của các cột
let targetPositions = [];   // Lưu tọa độ X mong muốn của các cột
let isTransitioning = false;

// Kích hoạt khi currentIndex của Store thay đổi
watch(() => store.currentIndex, () => {
  prepareTransition();
});

function prepareTransition() {
  sourcePositions = getStoredPositions(); // Tọa độ cũ
  targetPositions = calculateTargetPositions(); // Tọa độ mới tính theo mảng mới
  animationProgress = 0;
  isTransitioning = true;
}

// Vòng lặp vẽ liên tục 60 FPS
function tick(timestamp) {
  if (isTransitioning) {
    // Tăng tiến trình dựa trên tốc độ phát (playbackSpeed)
    // Giả sử chuyển động chuẩn kéo dài 300ms
    const duration = 300 / store.playbackSpeed;
    const elapsed = timestamp - lastTime;
    animationProgress += elapsed / duration;

    if (animationProgress >= 1) {
      animationProgress = 1;
      isTransitioning = false;
    }
  }

  renderCanvas();
  lastTime = timestamp;
  requestAnimationFrame(tick);
}

function renderCanvas() {
  ctx.clearRect(0, 0, width, height);
  
  // Vẽ nền canvas tối
  ctx.fillStyle = "#0F172A";
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < N; i++) {
    // Tính toán tọa độ vẽ thực tế
    let currentX = calculateX(i);
    if (isTransitioning) {
      const t = easeOut(animationProgress);
      currentX = sourcePositions[i] + (targetPositions[i] - sourcePositions[i]) * t;
    }

    // Tiến hành vẽ cột mảng
    ctx.fillStyle = determineColor(i);
    ctx.fillRect(currentX, Y_i, W_column, H_column[i]);

    // Vẽ chữ số giá trị trên đỉnh cột
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "12px Inter";
    ctx.textAlign = "center";
    ctx.fillText(A[i].toString(), currentX + W_column / 2, Y_i - 5);
  }
}
```
*Lưu ý: Bộ hoạt họa này đảm bảo chuyển động của các cột diễn ra trơn tru bất kể tốc độ phát thay đổi đột ngột từ bảng điều khiển.*
