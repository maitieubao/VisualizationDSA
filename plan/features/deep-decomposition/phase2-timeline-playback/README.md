# 📼 BỘ ĐIỀU HƯỚNG VCR & DÒNG THỜI GIAN GIẢI THUẬT (TIMELINE PLAYBACK VCR)
## 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2)

Chào mừng bạn đến với tài liệu kỹ thuật chi tiết nhất về **VCR Playback Engine** - phân hệ thanh điều hướng VCR dòng thời gian chạy giải thuật từng bước cực kỳ mượt mà của **VisualizationDSA** hỗ trợ các phím bấm mờ kính Glassmorphic, thanh trượt scrubber Neon quét nhanh tọa độ và bộ máy lập lịch khung hình thời gian thực độ phân giải cao. Tài liệu này đặc tả chi tiết kiến trúc hạt nhân bộ quản lý `VCRPlaybackEngine`, thuật toán tính toán vị trí thanh quét Scrubber và giải pháp đồng bộ ngữ cảnh Monaco Editor 60 FPS.

---

## 📌 BẢN ĐỒ MỤC LỤC
1. [Tầm nhìn Dòng thời gian & Bộ phát lại VCR (PRD)](#1-tầm-nhìn-dòng-thời-gian--bộ-phát-lại-vcr-prd)
2. [Bộ máy Lập lịch Khung hình & Caching Trạng thái (TECHNICAL SPEC)](#2-bộ-máy-lập-lịch-khung-hình--caching-trạng-thái-technical-spec)
3. [Hiện thực hóa Engine Phát VCR TS & Caching (Core Logic)](#3-hiện-thực-hóa-engine-phát-vcr-ts--caching-core-logic)
4. [Bố cục VCR Controller Kính mờ & Scrubber Neon (UI/UX)](#4-bố-cục-vcr-controller-kính-mờ--scrubber-neon-uiux)
5. [Quản lý Trạng thái Pinia useVCRTimelineStore (State Management)](#5-quản-lý-trạng-thái-pinia-usevcrtimelinestore-state-management)
6. [Hạ tầng Đồng hồ High-Res Clock & Monaco Hooks (Infrastructure)](#6-hạ-tầng-đồng-hồ-high-res-clock--monaco-hooks-infrastructure)
7. [Hợp đồng Gói tin Trạng thái Bước JSON Schema & C# Entity (API Reference)](#7-hợp-đồng-gói-tin-trạng-thái-bước-json-schema--c-entity-api-reference)
8. [Quyết định Kiến trúc & Caching Reconciliation (ADR)](#8-quyết-định-kiến-trúc--caching-reconciliation-adr)
9. [Kế hoạch triển khai & Tiêu chí nghiệm thu (DoD)](#9-kế-hoạch-triển-khai--tiêu-chí-nghiệm-thu-dod)

---

## 1. TẦM NHÌN DÒNG THỜI GIAN & BỘ PHÁT LẠI VCR (PRD)

### 1.1. Tầm nhìn: Cung cấp "cỗ máy thời gian" kiểm soát tuyệt đối giải thuật
Các giải thuật cấu trúc dữ liệu chạy cực nhanh và lắt léo. Nhìn code tĩnh chạy ào qua là rào cản lớn khiến sinh viên bế tắc:
*   *Vấn đề:* Sinh viên muốn xem lại bước HeapSort hoán vị ở giây thứ 3 nhưng không thể bấm tua ngược (Rewind). Họ muốn tua nhanh qua các vòng lặp ngoài tẻ nhạt để đi thẳng đến điểm nút (Forward). Họ muốn kéo thanh trượt quét nhanh như xem video YouTube để định hình dòng chảy.
*   *Giải pháp:* **VCR Playback Engine** biến giải thuật thành cuốn phim tương tác:
    1.  **Glassmorphic VCR Controller Panel:** Phím bấm mờ kính sang trọng: Phát (Play), Tạm dừng (Pause), Tua ngược (Rewind), Tua đi (Forward), Từng bước (Step-by-Step) và thanh trượt tốc độ (Speed Slider) 0.1x đến 5.0x.
    2.  **Dynamic Interactive Scrubber Track:** Thanh trượt tiến trình phát sáng Neon Cyan. Sinh viên thoải mái kéo quét indicator qua lại để đảo ngược hoặc tua đi giải thuật trên Canvas, cập nhật DOM Canvas tức thì dưới **5ms**.
    3.  **Step-by-Step Playback Loop Scheduler:** Bộ máy lập lịch FPS chính xác tuyệt đối bám sát xung đồng hồ máy tính, loại bỏ hiện tượng lệch nhịp trôi ảnh.

---

## 2. BỘ MÁY LẬP LỊCH KHUNG HÌNH & CACHING TRẠNG THÁI (TECHNICAL SPEC)

Để quản lý phát lại mượt mà, hệ thống xây dựng động cơ **VCRPlaybackEngine**:

```
[VCR Controller Input] ===> (Tốc độ Speed Slider 0.1x - 5x) ===> [VCRPlaybackEngine TS]
                                                                        | (Đập nhịp rAF)
                                     +----------------------------------+----------------------------------+
                                     v                                                                     v
                        [State Cache Map Lookup (5ms)]                                        [Monaco Line Highlighter]
```

### Thuật toán Caching và Tái thiết lập Trạng thái (State Reconciliation)
Hệ thống lưu giữ toàn bộ snapshot mảng/cây ảo của từng bước giải thuật vào một `StateCacheMap` dưới RAM. Khi sinh viên kéo thả scrubber quét bước, engine chỉ cần bốc cache ứng với bước đó đắp thẳng vào Vue reactive state, tránh hoàn toàn việc phải tính toán lại giải thuật từ đầu.

---

## 3. HIỆN THỰC HÓA ENGINE PHÁT VCR TS & CACHING (CORE LOGIC)

Chúng ta xây dựng cấu trúc mô tả Playback State và VCR Engine bằng TypeScript:

```typescript
export type PlaybackStatus = 'PLAYING' | 'PAUSED' | 'STOPPED';

export interface PlaybackFrame {
  stepIndex: number;
  canvasStateSnapshot: any; // Bản lưu trữ cấu trúc dữ liệu
  lineNumber: number;
  description: string;
}
```
Lớp hạt nhân `VCRPlaybackEngine` sẽ được đặc tả trong tệp core logic.

---

## 4. BỐ CỤC VCR CONTROLLER KÍNH MỜ & SCRUBBER NEON (UI/UX)

### 4.1. Thiết kế Giao diện Khung VCR (Controller UI)
*   **VCR Glassmorphic Panel:** Khung thanh điều khiển bo tròn góc sang trọng mờ kính, nền tối.
*   **Progress Scrubber Track:** Đường trượt mỏng phát sáng Neon Cyan, có hạt quét tròn lơ lửng phát sáng dịu nhẹ bám đuổi theo ngón tay người kéo.

---

## 5. QUẢN LÝ TRẠNG THÁI PINIA PATH STORE (STATE MANAGEMENT)

Xây dựng store `useVCRTimelineStore.ts` quản lý trạng thái phát:

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useVCRTimelineStore = defineStore('vcrTimeline', () => {
  const currentStep = ref(0);
  const totalSteps = ref(100);
  const playbackSpeed = ref(1.0);
  const status = ref<string>('PAUSED');

  return { currentStep, totalSteps, playbackSpeed, status };
});
```

---

## 6. QUYẾT ĐỊNH KIẾN TRÚC & CACHING RECONCILIATION (ADR)

### ADR-25: Hạt nhân VCR Playback Engine áp dụng cơ chế Caching Snapshot và Tái thiết lập Trạng thái Client-side dưới 5ms

*   **Quyết định:** Lưu trữ toàn bộ snapshot của các bước giải thuật thành mảng các đối tượng trạng thái `PlaybackFrame` tĩnh dưới RAM Client-side ngay khi kết thúc biên dịch, phục vụ truy tìm chỉ số kéo scrubber dưới **5ms** thay vì gửi request gọi backend sinh lại bước.
*   **Lý do:**
    1.  *Quét Scrubber mượt mà (Ultra-smooth Scrubbing):* Sinh viên có thể miết kéo chuột liên tục trên thanh trượt Scrubber và nhìn thấy các bar của mảng co giãn đổi vị trí mượt mà 60 FPS.
    2.  *Tiết kiệm tài nguyên máy chủ:* 100% các hành vi tua ngược, tua đi, phát ngắt của học viên được xử lý nội bộ tại RAM Client-side.

---

## 7. KẾ HOẠCH TRIỂN KHAI & TIÊU CHÍ NGHIỆM THU (DoD)

### 7.1. Lộ trình Triển khai
1.  **Sprint A: Thiết kế Giao diện VCR Panel & Scrubber Track (Ngày 1-3):** Dựng panel phím bấm kính mờ, thiết kế thanh trượt Scrubber Neon, speed slider, tooltips preview bước.
2.  **Sprint B: Engine VCRPlaybackEngine & Monaco Synchronization (Ngày 4-6):** Lập trình logic VCR loop rAF độ phân giải cao, mảng Caching Frames, sync click Monaco nhảy dòng.

### 8.2. Tiêu chí nghiệm thu (DoD)
*   Phím Bấm Play/Pause/Rewind/Forward phản hồi tức thì dưới **5ms**, thay đổi trạng thái và tốc độ phát chuẩn xác.
*   Thao tác kéo miết trượt thanh Scrubber cập nhật hình ảnh mảng/cây trên Canvas mượt mà 60 FPS không có độ trễ cảm nhận được.
*   Mỗi bước chuyển frame phát lập tức kích hoạt cuộn Monaco Editor tô sáng dòng code tương ứng chuẩn chỉ.
*   Hủy bỏ 100% listeners và vòng lặp hoạt ảnh `requestAnimationFrame` khi unmount tránh tràn bộ nhớ RAM máy khách.
*   Đầy đủ mã nguồn gỡ lỗi và Unit tests bao phủ 100% logic VCR Engine.
