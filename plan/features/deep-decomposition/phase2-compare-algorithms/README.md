# ⚖️ SO SÁNH ĐỐI CHIẾU GIẢI THUẬT (SIDE-BY-SIDE ALGORITHM COMPARATOR)
## 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2)

Chào mừng bạn đến với tài liệu kỹ thuật chi tiết nhất về **Side-by-Side Algorithm Comparator** - phân hệ so sánh trực quan đối sánh giải thuật thuộc **Phase 2** của **VisualizationDSA**. Tài liệu này đặc tả chi tiết kiến trúc điều phối đồng bộ luồng phát kép (Unified Playback Orchestration), bảng thống kê hiệu năng thời gian thực song song (Comparative Analytics Dashboard), giải pháp vẽ tối ưu hóa chu kỳ Frame (RequestAnimationFrame rendering optimization), và các quyết định thiết kế kiến trúc nâng tầm tư duy phân tích của học viên.

---

## 📌 BẢN ĐỒ MỤC LỤC
1. [Tầm nhìn Sư phạm & Đối chiếu Hiệu năng (PRD)](#1-tầm-nhìn-sư-phạm--đối-chiếu-hiệu-năng-prd)
2. [Kiến trúc Điều phối Phát kép Đồng bộ (TECHNICAL SPEC)](#2-kiến-trúc-điều-phối-phát-kép-đồng-bộ-technical-spec)
3. [Hiện thực hóa Bộ máy Đồng bộ Playback (Core Logic)](#3-hiện-thực-hóa-bộ-máy-đồng-bộ-playback-core-logic)
4. [Thiết kế Bố cục Song song Split Screen & Stats Dashboard (UI/UX)](#4-thiết-kế-bố-cục-song-song-split-screen--stats-dashboard-uiux)
5. [Quản lý Trạng thái Pinia So sánh Kép (State Management)](#5-quản-lý-trạng-thái-pinia-so-sánh-kép-state-management)
6. [Hạ tầng Tối ưu Hóa Chu kỳ Vẽ Trực quan (Infrastructure)](#6-hạ-tầng-tối-ưu-hóa-chu-kỳ-vẽ-trực-quan-infrastructure)
7. [Hợp đồng JSON Schema API So sánh Đối chiếu (API Reference)](#7-hợp-đồng-json-schema-api-so-sánh-đối-chiếu-api-reference)
8. [Quyết định Kiến trúc & Bộ điều phối Phát đồng bộ (ADR)](#8-quyết-định-kiến-trúc--bộ-điều-phối-phát-đồng-bộ-adr)
9. [Kế hoạch triển khai & Tiêu chí nghiệm thu (DoD)](#9-kế-hoạch-triển-khai--tiêu-chí-nghiệm-thu-dod)

---

## 1. TẦM NHÌN SƯ PHẠM & ĐỐI CHIẾU HIỆU NĂNG (PRD)

### 1.1. Tầm nhìn: Thấu hiểu tiệm cận Big-O bằng nhãn quan thực nghiệm
Hầu hết học sinh học lý thuyết Độ phức tạp thuật toán (Big-O notation) một cách sáo rỗng: họ học thuộc lòng "Quick Sort nhanh hơn Bubble Sort", nhưng không hiểu tại sao và trong điều kiện nào.

**Side-by-Side Algorithm Comparator** giải quyết triệt để vấn đề này:
*   **Màn hình phân đôi trực quan (Dual Split Canvas):** Cho phép đặt hai Canvas vẽ hoạt ảnh của hai thuật toán chạy song song (Ví dụ: bên trái chạy Bubble Sort, bên phải chạy Quick Sort).
*   **Đồng bộ dữ liệu đầu vào (Unified Data Injection):** Cam kết cả hai thuật toán đều thực thi trên cùng một mảng số ngẫu nhiên ban đầu để đảm bảo tính công bằng tuyệt đối của thực nghiệm.
*   **Bảng điều khiển chung (Unified VCR Panel):** Chỉ cần bấm 1 nút Play, cả hai Canvas cùng chuyển động đồng bộ để người học so sánh trực diện tốc độ xử lý.
*   **Bảng phân tích hiệu năng (Performance Dashboard):** Hiển thị số lượt so sánh, số lần hoán đổi (Swaps), bộ nhớ RAM ảo và thời gian thực thi cập nhật liên tục dưới dạng biểu đồ cột sành điệu.

---

## 2. KIẾN TRÚC ĐIỀU PHỐI PHÁT KÉP ĐỒNG BỘ (TECHNICAL SPEC)

Khi người dùng bấm Play trên thanh điều khiển chung, bộ điều phối `UnifiedPlaybackCoordinator` sẽ phát tín hiệu đồng bộ tới cả hai Store con:

### Sơ đồ Kiến trúc Đồng bộ Luồng phát Kép (Unified Multi-Playback)
```
                  [Unified VCR Controls] (Play/Pause/Speed)
                             |
                             v Tín hiệu điều phối chung
              [UnifiedPlaybackCoordinator]
                             |
         +-------------------+-------------------+
         |                                       |
         v                                       v
  [Canvas bên Trái]                       [Canvas bên Phải]
(useAlgorithmLeftStore)                (useAlgorithmRightStore)
- Array: [45, 12, 8, ...]               - Array: [45, 12, 8, ...]
- Thuật toán: Bubble Sort               - Thuật toán: Quick Sort
- Tốc độ: 1.0x                          - Tốc độ: 1.0x
- framesLeft.currentFrameIndex++        - framesRight.currentFrameIndex++
         |                                       |
         +-------------------+-------------------+
                             |
                             v
               [Comparative Analytics Board]
        - So sánh lượt so sánh: 45 vs 12 (Cập nhật liên tục)
        - So sánh lượt hoán vị: 15 vs 6
```

---

## 3. HIỆN THỰC HÓA BỘ MÁY ĐỒNG BỘ PLAYBACK (CORE LOGIC)

Chúng ta xây dựng bộ điều phối luồng phát kép bằng TypeScript giúp đồng bộ thời gian thực mốc khung hình và tỷ lệ tốc độ phát hoạt ảnh.

```typescript
export interface PerformanceStats {
  comparisonsCount: number;
  swapsCount: number;
  executionSteps: number;
  progressPercent: number;
}
```
Lớp `UnifiedPlaybackCoordinator` sẽ tính toán và điều tiết tốc độ chạy của cả hai phân hệ Canvas mượt mà, tránh tình trạng một bên chạy quá nhanh gây giật hình bên còn lại.

---

## 4. THIẾT KẾ BỐ CỤC SONG SONG SPLIT SCREEN & STATS (UI/UX)

### 4.1. Màn hình phân cực Kép (Dual Split screen layout)
*   **Styling:** Bố cục flex 50/50 bo góc mịn màng. Mỗi khung Canvas được bao bọc bởi một lớp viền sương mờ Glassmorphism.
*   **Bảng so sánh hiệu năng trực diện:** 
    *   Sử dụng các thanh tiến trình biểu diễn màu sắc Cyan và Emerald nhấp nháy phát sáng nhẹ để biểu thị số lượng phép tính so sánh đã chạy.
    *   Học viên nhìn thấy thanh của Quick Sort đã dừng lại hoàn thành (100% progress) trong khi thanh của Bubble Sort vẫn tiếp tục tăng lên chầm chậm (phản ánh trực quan Big-O cực kỳ sâu sắc).

---

## 5. QUẢN LÝ TRẠNG THÁI PINIA SO SÁNH KÉP (STATE MANAGEMENT)

Xây dựng bộ quản lý trạng thái Pinia Setup Store `useCompareAlgorithmsStore.ts`:

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCompareAlgorithmsStore = defineStore('compareAlgorithms', () => {
  // State
  const leftAlgorithmId = ref('bubble-sort');
  const rightAlgorithmId = ref('quick-sort');
  const isPlaying = ref(false);
  const globalSpeed = ref(1.0);
  const leftProgress = ref(0);
  const rightProgress = ref(0);

  return { leftAlgorithmId, rightAlgorithmId, isPlaying, globalSpeed, leftProgress, rightProgress };
});
```

---

## 6. HẠ TẦNG TỐI ƯU HÓA CHU KỲ VẼ CANVAS (INFRASTRUCTURE)

### 6.1. Tối ưu hóa Vẽ chu kỳ kép (Dual Rendering Optimization)
*   **Thử thách:** Vẽ đồng thời 2 Canvas hoạt ảnh 60 FPS cùng một lúc trên trình duyệt web có thể gây sụt giảm khung hình nghiêm trọng (Frame drop) trên các thiết bị cấu hình yếu.
*   **Giải pháp hạ tầng:** Tích hợp bộ gom chu kỳ vẽ **Unified RequestAnimationFrame (rAF) Batching**. Gom các lệnh xóa và vẽ lại của cả 2 Canvas vào trong đúng **một chu kỳ quét duy nhất** của GPU màn hình thay vì gọi riêng lẻ hai chu kỳ bất đồng bộ, giảm tải 50% tài nguyên CPU hao phí.

---

## 7. QUYẾT ĐỊNH KIẾN TRÚC & BỘ ĐIỀU PHỐI PHÁT ĐỒNG BỘ (ADR)

### ADR-10: Unified Synchronized Multi-Playback Orchestrator

*   **Quyết định:** Sử dụng một thực thể điều khiển trung tâm **UnifiedPlaybackCoordinator** để quản lý trạng thái phát của cả 2 Canvas con, thay vì cho phép 2 Canvas tự chạy độc lập.
*   **Lý do:** Việc chạy độc lập khiến người học không thể kéo tua dòng thời gian đồng bộ. Bộ điều phối trung tâm khóa cứng dòng thời gian chéo, đảm bảo khi người học tua Slider đến 50%, cả hai thuật toán cùng nhảy về đúng mốc 50% tiến trình tương ứng của chúng.
*   **Kết quả:** Trải nghiệm đối chiếu học thuật hoàn hảo tuyệt đối, mượt mà và trực quan hóa Big-O cực kỳ sống động.

---

## 8. KẾ HOẠCH TRIỂN KHAI & TIÊU CHÍ NGHIỆM THU (DoD)

### 8.1. Lộ trình Triển khai
1.  **Sprint A: Thiết kế Giao diện Split Screen & Dashboard (Ngày 1-3):** Dựng màn hình chia đôi Canvas song song, thiết lập bảng so sánh hiệu năng trực trực quan bằng thanh đo tiến trình.
2.  **Sprint B: Bộ điều phối Đồng bộ Playback & RequestAnimationFrame (Ngày 4-6):** Viết bộ điều phối phát kép, đồng bộ hóa Range Slider và phím bấm VCR chung, tối ưu hóa RequestAnimationFrame chống giật lag.

### 8.2. Tiêu chí nghiệm thu (DoD)
*   Hai Canvas hiển thị song song cân đối, nạp cùng một mảng số ngẫu nhiên ban đầu để đảm bảo thực nghiệm công bằng.
*   Nút bấm Play chung điều khiển cả hai Canvas chạy đồng thời cực kỳ mượt mà.
*   Thanh tua Slider kéo lướt di chuyển đồng bộ tiến độ của cả hai bài giảng trơn tru.
*   Các chỉ số thống kê (so sánh, hoán vị) cập nhật liên tục thời gian thực chuẩn xác 100%.
