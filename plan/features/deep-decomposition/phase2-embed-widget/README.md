# 🧩 TIỆN ÍCH NHÚNG SƠ ĐỒ TRỰC QUAN (EMBED WIDGET)
## 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2)

Chào mừng bạn đến với tài liệu kỹ thuật chi tiết nhất về **Interactive Embed Widget** - phân hệ cho phép giáo viên, blogger công nghệ và các trường đại học nhúng trực tiếp các sơ đồ trực quan thuật toán tương tác động của **VisualizationDSA** vào các nền tảng LMS (như Moodle, Canvas), blog cá nhân (Medium, WordPress) thông qua thẻ `<iframe>` siêu nhẹ và giao thức truyền thông điệp hai chiều bảo mật **postMessage Bridge**. Tài liệu này đặc tả chi tiết kiến trúc tách tách mã nguồn siêu nhẹ (Lightweight Bundle Rollup), giải thuật tự động co giãn kích thước (ResizeObserver Auto-resizer) và cơ chế chống tấn công Cross-Site Scripting (XSS) nghiêm ngặt ở tầng hạ tầng.

---

## 📌 BẢN ĐỒ MỤC LỤC
1. [Tầm nhìn Sư phạm & Tác động Lan tỏa (PRD)](#1-tầm-nhìn-sư-phạm--tác-động-lan-tỏa-prd)
2. [Giao thức Giao tiếp postMessage & Tự động Co giãn (TECHNICAL SPEC)](#2-giao-thức-giao-tiếp-postmessage--tự-động-co-giãn-technical-spec)
3. [Hiện thực hóa Bộ cầu nối Truyền tin Embed Bridge (Core Logic)](#3-hiện-thực-hóa-bộ-cầu-nối-truyền-tin-embed-bridge-core-logic)
4. [Bố cục Bảng cấu hình Settings & neon Code Snippet (UI/UX)](#4-bố-cục-bảng-cấu-hình-settings--neon-code-snippet-uiux)
5. [Quản lý Trạng thái Pinia useEmbedConfiguratorStore (State Management)](#5-quản-lý-trạng-thái-pinia-useembedconfiguratorstore-state-management)
6. [Hạ tầng ResizeObserver & Chống tấn công XSS (Infrastructure)](#6-hạ-tầng-resizeobserver--chống-tấn-công-xss-infrastructure)
7. [Hợp đồng JSON postMessage Schema (API Reference)](#7-hợp-đồng-json-postmessage-schema-api-reference)
8. [Quyết định Kiến trúc & Đóng gói Iframe siêu nhẹ (ADR)](#8-quyết-định-kiến-trúc--đóng-gói-iframe-siêu-nhẹ-adr)
9. [Kế hoạch triển khai & Tiêu chí nghiệm thu (DoD)](#9-kế-hoạch-triển-khai--tiêu-chí-nghiệm-thu-dod)

---

## 1. TẦM NHÌN SƯ PHẠM & TÁC ĐỘNG LAN TỎA (PRD)

### 1.1. Tầm nhìn: Đưa Sơ đồ DSA đi muôn nơi
Các tài liệu lý thuyết thuật toán trên giảng đường thường rất khô khan với các hình ảnh tĩnh (PNG/JPEG) chết lặng.
*   *Vấn đề:* Để thiết kế một bài học thuật toán sống động trên hệ thống LMS Moodle hay blog công nghệ cá nhân, người viết bắt buộc phải viết mã Javascript tương tác rất phức tạp, tốn thời gian.
*   *Giải pháp:* **Interactive Embed Widget** cung cấp một bộ cấu hình trực quan (Embed Configurator). Giáo viên chỉ cần chọn giải thuật, tùy chỉnh theme (Dark/Light/Glass), bật/tắt phím điều khiển tua bước VCR, nhấn nút "Copy Code" và dán trực tiếp thẻ `<iframe>` vào LMS của trường học. Sơ đồ tương tác động lập tức hiện ra lung linh sắc nét.

### 1.2. Các tính năng cốt lõi của Tiện ích Nhúng:
*   **Embed Configurator Sidebar:** Cung cấp thanh cấu hình trực quan (Theme Selector, Controls Toggle, Interactive vs Static mode, Custom Dimensions).
*   **Copy-paste Code Generator:** Tự động tạo thẻ `<iframe src="..." sandbox="...">` hoặc component React/Vue nhúng trực tiếp.
*   **Secure postMessage Bridge:** Cho phép trang web chủ (host) điều khiển widget bên trong iframe (ví dụ: host bấm "Next Step" thì sơ đồ thuật toán tự động nhảy bước) và lắng nghe sự kiện ngược lại (ví dụ: khi học viên hoàn thành quiz nhúng, iframe gửi điểm về cho trang chủ lưu trữ).

---

## 2. GIAO THỨC GIAO TIẾP postMessage & TỰ ĐỘNG CO GIÃN (TECHNICAL SPEC)

Khi nhúng iframe, truyền thông điệp hai chiều (Bidirectional Communication Bridge) được thực hiện qua window postMessage:

```
+-------------------------------------------------------+
|                 Trang chủ (Host Website)              |
+-------------------------------------------------------+
        |                                       ^
        | postMessage("STEP_FORWARD")           | postMessage("QUIZ_COMPLETED")
        v                                       |
+-------------------------------------------------------+
|           Iframe nhúng (Interactive Embed Widget)      |
+-------------------------------------------------------+
```

### Cơ chế Tự động Co giãn Chiều cao (ResizeObserver Dynamic Height)
Iframe nhúng thường bị lỗi thanh cuộn kép khó chịu (Double scrollbars) nếu chiều cao content thay đổi động (ví dụ: khi hộp quiz mở rộng ra).
Hệ thống giải quyết triệt để bằng cách gắn bộ giám sát **ResizeObserver** bên trong Iframe. Khi content cao lên, Iframe tự động bắn thông điệp `WIDGET_RESIZE` gửi chiều cao thực tế lên trang chủ để trang chủ tự động kéo giãn iframe tương thích hoàn hảo.

---

## 3. HIỆN THỰC HÓA BỘ CẦU NỐI TRUYỀN TIN EMBED BRIDGE (CORE LOGIC)

Chúng ta xây dựng bộ cầu nối an toàn bằng TypeScript lọc kỹ càng Origin nguồn và đích để tránh tấn công XSS:

```typescript
export interface EmbedMessage {
  source: 'VISUALIZATION_DSA_WIDGET' | 'VISUALIZATION_DSA_HOST';
  action: string;
  payload: any;
}
```
Lớp logic hạt nhân `EmbedCommunicationBridge` chịu trách nhiệm lọc và chuyển tiếp an toàn các gói tin sẽ được trình bày cụ thể trong tệp tin logic lõi.

---

## 4. BỐ CỤC BẢNG CẤU HÌNH SETTINGS & NEON CODE SNIPPET (UI/UX)

### 4.1. Thiết kế Embed Configurator Panel
*   **Settings Sidebar Glassmorphism:** Thiết kế sidebar cấu hình tinh tế, cung cấp các nút gạt chuyển màu mượt mà.
*   **Live Preview Window:** Hiển thị trực tiếp widget mô phỏng thuật toán động ở chính giữa để giáo viên tương tác kiểm thử trước khi nhúng.
*   **Neon Code Snippet Box:** Hộp hiển thị code sao chép được bao quanh bởi viền phát sáng Neon xanh Cyan mờ mượt mà, bấm một nút sao chép nhanh chóng với hoạt ảnh "Copied!" Emerald.

---

## 5. QUẢN LÝ TRẠNG THÁI PINIA EMBED STORE (STATE MANAGEMENT)

Xây dựng store `useEmbedConfiguratorStore.ts` quản lý cấu hình tiện ích nhúng:

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useEmbedConfiguratorStore = defineStore('embedConfigurator', () => {
  const selectedTheme = ref<'dark' | 'light' | 'glass'>('glass');
  const showVcrControls = ref(true);
  const isInteractive = ref(true);
  const widgetWidth = ref(800);
  const widgetHeight = ref(500);

  return { selectedTheme, showVcrControls, isInteractive, widgetWidth, widgetHeight };
});
```

---

## 6. HẠ TẦNG ResizeObserver & CHỐNG TẤN CÔNG XSS (INFRASTRUCTURE)

*   **Chống tấn công XSS qua Whitelist Domain:**
    *   Hạ tầng nhúng kiểm tra nghiêm ngặt xuất xứ nguồn tin gửi qua postMessage. Chỉ những domain nằm trong danh sách trắng được phép gọi các hành động thay đổi trạng thái thuật toán.
*   **Dọn dẹp sự kiện:** Khi iframe Unmount, toàn bộ bộ lắng nghe sự kiện window `'message'` được gỡ bỏ triệt để để tối ưu RAM.

---

## 7. QUYẾT ĐỊNH KIẾN TRÚC & ĐÓNG GÓI IFRAME SIÊU NHẸ (ADR)

### ADR-15: Sandboxed Lightweight Iframe Embed Engine over Custom Element Web Components

*   **Quyết định:** Lựa chọn giải pháp **Nhúng qua thẻ Iframe có thuộc tính Sandbox bảo mật** kết hợp với cơ chế **Tách mã nguồn siêu nhẹ (Lightweight Rollup Bundle Split)** thay vì nhúng trực tiếp qua Custom Element Web Components.
*   **Lý do:** 
    1.  *An toàn bảo mật tối đa:* Khách hàng nhúng code vào trang LMS của họ rất e ngại mã Javascript ngoài xâm nhập, chiếm quyền lấy Cookie học viên. Thuộc tính `sandbox="allow-scripts allow-same-origin"` của Iframe cách ly hoàn toàn phạm vi biến toàn cục, bảo vệ tuyệt đối an toàn.
    2.  *Chống xung đột CSS:* Iframe có Document riêng biệt, đảm bảo CSS Neon của sơ đồ DSA không bị ghi đè hay làm vỡ bố cục giao diện của blog Host.
    3.  *Bundle siêu nhẹ:* Quá trình build Rollup loại bỏ hoàn toàn các thư viện nặng (như Monaco Editor, AST Compiler) ra khỏi luồng render nhúng, giảm kích thước bundle từ 2.5MB xuống dưới **150KB**, tải trang blog cực nhanh.

---

## 8. KẾ HOẠCH TRIỂN KHAI & TIÊU CHÍ NGHIỆM THU (DoD)

### 8.1. Lộ trình Triển khai
1.  **Sprint A: Thiết kế Giao diện Bảng điều khiển & Code Snippet (Ngày 1-3):** Dựng khung sidebar cấu hình kính mờ, live preview canvas và neon code snippet box kèm nút click copy tiện lợi.
2.  **Sprint B: Hiện thực hóa postMessage Bridge & Tối ưu Bundle (Ngày 4-6):** Lập trình lớp `EmbedCommunicationBridge`, cài đặt ResizeObserver tự động co giãn chiều cao và cấu hình Rollup/Vite tách nhỏ gói tải iframe siêu nhẹ.

### 8.2. Tiêu chí nghiệm thu (DoD)
*   Thẻ Iframe nhúng hiển thị mượt mà 60 FPS sơ đồ thuật toán độc lập trên mọi CMS nhúng.
*   Giao tiếp postMessage truyền tin thành công hai chiều Host-Iframe bảo mật.
*   ResizeObserver tự động đồng bộ chiều cao Iframe tương thích hoàn hảo, không sinh thanh cuộn dọc kép.
*   Kích thước bundle tải Iframe tối ưu hóa dưới 180KB, tốc độ phản hồi cực nhanh dưới 100ms.
*   Nút bấm Copy Code hoạt động ổn định trên cả Windows và macOS.
