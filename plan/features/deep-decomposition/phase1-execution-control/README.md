# 🎛️ BẢNG ĐIỀU KHIỂN TIẾN TRÌNH THỰC THI (EXECUTION CONTROL)
## 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 1)

Chào mừng bạn đến với tài liệu kỹ thuật chi tiết nhất về **Execution Control** - bảng điều khiển VCR (Video Cassette Recorder) giúp người học nắm quyền kiểm soát dòng thời gian hoạt ảnh giải thuật trong **VisualizationDSA**. Tài liệu này đặc tả chi tiết từ yêu cầu trải nghiệm (PRD), kiến trúc Command Issuer kết nối với `useAnimationStore`, công thức toán học nội suy tốc độ phát, cơ chế tự động dọn dẹp bộ nhớ đệm hoạt ảnh (GSAP/Tweening Cleanup) khi tua thời gian (Scrubbing), đến bộ lắng nghe phím tắt toàn cục và giải pháp giới hạn tần suất vẽ lại (Throttling) để chống đơ trình duyệt.

---

## 📌 BẢN ĐỒ MỤC LỤC
1. [Mục tiêu Nghiệp vụ & Bản điều khiển Dòng thời gian (PRD)](#1-mục-tiêu-nghiệp-vụ--bản-điều-khiển-dòng-thời-gian-prd)
2. [Kiến trúc Phát Lệnh & Đồng bộ Client-side (TECHNICAL SPEC)](#2-kiến-trúc-phát-lệnh--đồng-bộ-client-side-technical-spec)
3. [Hiện thực hóa Logic Tua Thời gian & Toán học Tốc độ (Core Logic Playback)](#3-hiện-thực-hóa-logic-tua-thời-gian--toán-học-tốc độ-core-logic-playback)
4. [Đặc tả Giao diện Bảng VCR & Tooltip Động (UI/UX Control Panel)](#4-đặc-tả-giao-diện-bảng-vcr--tooltip-động-uiux-control-panel)
5. [Quản lý Reactivity & Liên kết Động cơ (Frontend Pinia Store Bindings)](#5-quản-lý-reactivity--liên-kết-động-cơ-frontend-pinia-store-bindings)
6. [Đồng bộ Cấu hình Cá nhân & JSON Local Storage (API Reference)](#6-đồng-bộ-cấu-hình-cá-nhân--json-local-storage-api-reference)
7. [Quyết định Kiến trúc & Đảm bảo Hiệu năng Trình diễn (ADR)](#7-quyết-định-kiến-trúc--đảm-bảo-hiệu-năng-trình-diễn-adr)
8. [Kế hoạch triển khai & Tiêu chí nghiệm thu (DoD)](#8-kế-hoạch-triển-khai--tiêu-chí-nghiệm-thu-dod)

---

## 1. MỤC TIÊU NGHIỆP VỤ & BẢN ĐIỀU KHIỂN DÒNG THỜI GIAN (PRD)

### 1.1. Tầm nhìn UX: Bảng điều khiển VCR thân thuộc
Một công cụ trực quan hóa giải thuật đắt giá phải mang lại cảm giác dễ dùng tự nhiên. Phân hệ **Execution Control** đóng vai trò cung cấp cho người học các công cụ kiểm soát dòng thời gian giống hệt như một trình phát video chuyên nghiệp (như YouTube hay Netflix Player):
*   **Play/Pause/Replay:** Khởi chạy, tạm dừng tức thì và tự động chuyển đổi sang nút Replay (Phát lại từ đầu) khi thuật toán kết thúc.
*   **Step-by-step Navigation:** Hỗ trợ lùi/tiến từng khung hình đơn lẻ để phân tích sâu từng dòng mã nguồn.
*   **Timeline Scrubbing:** Thanh trượt tiến trình mượt mà, cho phép kéo thả trỏ chuột tới bất kỳ thời điểm nào của giải thuật.
*   **Speed Control:** Hỗ trợ tăng tốc hoặc làm chậm tiến trình từ $0.25\times$ (dành cho bước phức tạp) đến $4\times$ (dành cho bước lặp tẻ nhạt).

### 1.2. Phím tắt Toàn cục (Keyboard Accessibility Key Bindings)
Hỗ trợ trải nghiệm rảnh tay tối đa với hệ thống phím tắt tiêu chuẩn:
*   `Space`: Tạm dừng hoặc phát tiếp (Play/Pause).
*   `Arrow Left`: Lùi lại 1 bước giải thuật.
*   `Arrow Right`: Tiến lên 1 bước giải thuật.
*   `Shift + Arrow Left`: Tua nhanh về đầu thuật toán (Rewind to start).
*   `Shift + Arrow Right`: Tua nhanh tới bước hoàn thành cuối cùng (Fast-forward to end).

---

## 2. KIẾN TRÚC PHÁT LỆNH & ĐỒNG BỘ CLIENT-SIDE (TECHNICAL SPEC)

Hệ thống điều khiển dòng thời gian hoàn toàn chạy tại Client-side, không trực tiếp gọi API Backend trong quá trình phát hoạt ảnh để bảo toàn băng thông mạng. Component `<ControlPanel>` hoạt động như một **Command Issuer** gửi các lệnh tới `useAnimationStore` để thay đổi chỉ số khung hình hiện tại.

### Sơ đồ Điều phối Kiến trúc
```
+-----------------------------------------------------------+
|                      CONTROL PANEL                        | (Giao diện VCR)
|                  (<ControlPanel.vue>)                     |
+-----------------------------------------------------------+
       |                                             |
       | 1. Thay đổi Slider                          | 3. Chọn Tốc độ (ví dụ: 2x)
       v                                             v
+-----------------------------------------------------------+
|                    useAnimationStore                      | (Pinia Store Lõi)
| - isPlaying: true/false                                   |
| - currentFrameIndex: 14                                   |
+-----------------------------------------------------------+
       |                                             |
       | 2. Hủy các tween cũ &                       | 4. Chia tỷ lệ Duration
       |    Snap tọa độ mới                          |    (baseDuration / 2)
       v                                             v
+-----------------------------+               +-------------+
|     HTML5 Canvas Renderer   |               | Code Panel  |
+-----------------------------+               +-------------+
```

---

## 3. HIỆN THỰC HÓA LOGIC TUA THỜI GIAN & TOÁN HỌC TỐC ĐỘ (CORE LOGIC)

### 3.1. Thách thức lớn nhất: Giải quyết lỗi Glitch Đồ họa khi tua (Scrubbing)
Khi người dùng đang phát hoạt ảnh (ví dụ: cột A và cột B đang dịch chuyển lơ lửng giữa chừng nhờ thư viện hoạt họa) mà người dùng đột ngột kéo thanh trượt Slider về Frame 0:
*   *Lỗi phổ biến:* Các cột vẫn tiếp tục bay theo quán tính cũ rồi mới giật cục nhảy về vị trí mới, hoặc tọa độ Canvas bị tính sai dẫn đến méo mó hình vẽ (glitch).
*   *Giải pháp Core Logic:*
    1.  Ngay khi phát hiện sự kiện thay đổi Slider, gọi hàm hủy bỏ toàn bộ hoạt họa đang diễn ra (`cancelAnimationFrame` hoặc hủy các Tween đang chạy).
    2.  Tiến hành **Snap tức thời (Instant Translation)**: Gán tọa độ các cột mảng bằng chính xác giá trị tọa độ tĩnh được định nghĩa tại Frame đích, tuyệt đối không chạy hiệu ứng chuyển dịch chuyển tiếp.
    3.  Lệnh vẽ lại Canvas (Force Draw) được kích hoạt ngay lập tức.

### 3.2. Công thức Toán học tính toán tốc độ phát
Thời gian thực thi chuyển tiếp một bước cơ sở được định cấu hình bằng hằng số `baseDuration = 1000ms`. Thời gian thực thi chuyển dịch thực tế được chia tỷ lệ nghịch với hệ số tốc độ người dùng thiết lập:
$$\text{duration} = \frac{\text{baseDuration}}{\text{playbackSpeed}}$$

*   Khi Tốc độ là $0.25\times$: $\text{duration} = 1000 / 0.25 = 4000\text{ms}$ (Cực chậm).
*   Khi Tốc độ là $4.0\times$: $\text{duration} = 1000 / 4.0 = 250\text{ms}$ (Siêu nhanh).

---

## 4. ĐẶC TẢ GIAO DIỆN BẢNG VCR & TOOLTIP ĐỘNG (UI/UX CONTROL PANEL)

### 4.1. Bố cục Giao diện Điều khiển (Bottom Bar Layout)
Bảng điều khiển được thiết kế dạng một dải Slate dài bo viền mờ nằm cố định phía chân của vùng vẽ Canvas:
*   **Vùng Bên Trái (Hành động VCR):** Chứa cụm 3 nút biểu tượng bo góc mượt mà: nút Lùi 1 bước `[|◀]`, nút Play/Pause dạng tròn to nổi bật ở giữa `[ ▶ ]` / `[ ⏸ ]`, và nút Tiến 1 bước `[▶|]`.
*   **Vùng Chính Giữa (Thanh Tiến trình Timeline):** Chiếm 70% diện tích chiều ngang. Một thanh trượt Custom Range Input có màu nền xanh Slate thẫm. Đoạn đã chạy (Progress) sẽ được tô màu xanh Neon sáng.
*   **Vùng Bên Phải (Tùy chọn phụ):** Chứa nút Replay `[↩]` (chỉ xuất hiện khi hoàn thành) và Dropdown lựa chọn tốc độ phát `[ 1.0x ▾ ]`.

### 4.2. Tooltip Thuyết minh Động khi Hover (Dynamic Tooltip)
Khi học viên di chuột (hover) trên các điểm khác nhau của thanh tiến trình Slider, một Tooltip nhỏ dạng bong bóng sẽ nổi lên ngay phía trên trỏ chuột:
*   *Nội dung:* Lấy ra trường `explanation` của FrameDTO tương ứng tại vị trí chỉ số index đó.
*   *Tối ưu hiển thị:* Để tránh làm Tooltip quá to che khuất Canvas, chuỗi giải thích dài sẽ tự động được cắt ngắn bằng dấu ba chấm nếu vượt quá 60 ký tự.

---

## 5. QUẢN LÝ REACTIVITY & LIÊN KẾT ĐỘNG CƠ (PINIA BINDINGS)

Sử dụng liên kết hai chiều (Two-way Data Binding) thông qua Vue 3 Computed Properties kết nối trực tiếp với Store quản lý hoạt ảnh cốt lõi:

```html
<!-- ControlPanel.vue -->
<template>
  <div class="control-panel-wrapper">
    <!-- Nút Play/Pause -->
    <button @click="togglePlay" class="vcr-btn">
      <span v-if="isPlaying">⏸</span>
      <span v-else-if="isFinished">↩</span>
      <span v-else>▶</span>
    </button>

    <!-- Thanh tua thời gian Timeline -->
    <input 
      type="range" 
      min="0" 
      :max="totalFrames - 1" 
      v-model.number="currentFrame"
      @input="onScrub"
      class="timeline-slider"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAnimationStore } from '@/stores/useAnimationStore';

const animStore = useAnimationStore();

const isPlaying = computed(() => animStore.isPlaying);
const isFinished = computed(() => animStore.isFinished);
const totalFrames = computed(() => animStore.frames.length);

// Thuộc tính Computed hai chiều điều hành Timeline
const currentFrame = computed({
  get: () => animStore.currentFrameIndex,
  set: (val: number) => {
    animStore.goToFrame(val);
  }
});

function togglePlay() {
  if (isFinished.value) {
    animStore.goToFrame(0);
    animStore.play();
  } else {
    animStore.togglePlay();
  }
}

function onScrub(event: Event) {
  animStore.pause(); // Tạm dừng phát tự động khi đang kéo tua
}
</script>
```

---

## 6. ĐỒNG BỘ CẤU HÌNH CÁ NHÂN & LOCAL STORAGE (API REFERENCE)

Hệ thống tự động ghi nhớ thói quen tốc độ xem của người học để tự động áp dụng cho các phiên học giải thuật tiếp theo mà không cần bắt họ cấu hình lại:

### Cấu trúc Lưu trữ Cá nhân cục bộ (`localStorage.getItem('dsa_preferences')`):
```json
{
  "dsa_preferences": {
    "defaultSpeed": 2.0,
    "autoPlayOnLoad": false,
    "themeMode": "dark"
  }
}
```

Khi tải trang `/algorithm/{id}`, `useAnimationStore` sẽ đọc cấu trúc JSON này lên đầu tiên để thiết lập tốc độ mặc định ban đầu.

---

## 7. QUYẾT ĐỊNH KIẾN TRÚC & ĐẢM BẢO HIỆU NĂNG TRÌNH DIỄN (ADR)

### ADR-05: Throttled State Scrubbing & Tweening Cleanup

*   **Bối cảnh:** Khi người học dùng chuột kéo liên tục qua lại trên thanh tua thời gian Slider, sự kiện `@input` sẽ được trình duyệt kích hoạt hàng trăm lần mỗi giây. Nếu mỗi lần thay đổi nhỏ chúng ta bắt Canvas phải tính toán lại tọa độ, dựng lại các cột và thực hiện vẽ lại ngay lập tức sẽ làm quá tải hoàn toàn nhân đồ họa của trình duyệt, gây ra hiện tượng giật đơ (UI Lag) cực kỳ khó chịu.
*   **Quyết định:** Áp dụng kỹ thuật **Throttling (Giới hạn tần suất)** và **Tween Cleanup** triệt để:
    *   Sử dụng hàm giới hạn của VueUse (`useThrottleFn`) để chốt tần suất vẽ lại Canvas tối đa 30 lần mỗi giây (30 FPS) trong suốt quá trình người học đang giữ chuột kéo tua.
    *   Mọi hoạt ảnh tịnh tiến (Tween) đang chạy dở dang tại Canvas phải bị hủy bỏ ngay lập tức trước khi tải Frame dữ liệu tĩnh mới.
*   **Kết quả:** Thanh tua thời gian di chuyển mượt mà phi thường, Canvas phản hồi tức thời mà không gây đơ hoặc nóng CPU máy học viên.

---

## 8. KẾ HOẠCH TRIỂN KHAI & TIÊU CHÍ NGHIỆM THU (DoD)

### 8.1. Lộ trình Triển khai
1.  **Bước 1: Thiết kế UI Shell Bảng VCR (Ngày 1-2):** Hoàn thành thiết kế giao diện dải Slate mờ bo góc bo cạnh dưới Canvas, cấu hình thanh Slider Youtube-style màu xanh Neon.
2.  **Bước 2: Xử lý Throttling & Hủy hoạt ảnh (Ngày 3-4):** Viết logic hàm `scrubTo` trong store lõi, tích hợp dọn dẹp tween đang chạy và giới hạn tần suất vẽ lại 30 FPS.
3.  **Bước 3: Tích hợp phím tắt bàn phím Hotkeys (Ngày 5-6):** Xây dựng bộ lắng nghe sự kiện keydown toàn cục, xử lý thu hồi listener lúc hủy component để chống rò rỉ RAM.

### 8.2. Tiêu chí nghiệm thu (DoD)
*   Thực hiện kéo thả thanh tua thời gian liên tục 5 giây không gây giật đơ trình duyệt, Canvas snap tọa độ chuẩn chỉnh không lỗi hiển thị.
*   Khi thuật toán chạy đến bước cuối, nút Play tự động đổi sang biểu tượng Replay phát lại.
*   Khi chế độ Bài giảng điện tử (E-Lecture Mode) kích hoạt, toàn bộ bảng điều khiển này bắt buộc phải bị làm xám đi (Disabled), khóa kéo thả timeline để bảo vệ giáo án.
