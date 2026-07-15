# 🧠 Playback Control Logic & Scrubbing Math (TypeScript)

Tài liệu này đặc tả chi tiết logic điều khiển tua thời gian (Scrubbing), dọn dẹp bộ nhớ đệm hoạt họa tịnh tiến và toán học co giãn thời gian thực thi theo tốc độ phát ở Frontend sử dụng **TypeScript**.

---

## 1. Cơ chế Tua thời gian Không Lag (Throttled Scrubbing Engine)

Để tránh hiện tượng quá tải CPU khi sinh viên liên tục kéo chuột trên thanh trượt Slider, chúng ta thiết lập cơ chế giới hạn tần suất vẽ lại (Throttling) ở mức 30 FPS kết hợp với dọn dẹp triệt để hoạt ảnh dở dang:

```typescript
import { useThrottleFn } from '@vueuse/core';
import { useAnimationStore } from '@/stores/useAnimationStore';

export class TimelineScrubbingEngine {
  private animStore = useAnimationStore();
  private isScrubbing = false;

  /**
   * Khởi động quá trình kéo tua của người dùng
   */
  public startScrub(): void {
    this.isScrubbing = true;
    
    // 1. Tạm dừng ngay lập tức việc phát tự động của thuật toán
    this.animStore.pause();
    
    // 2. Dọn dẹp triệt để mọi hiệu ứng tịnh tiến đang chạy dở dang trên Canvas
    this.cleanupActiveTweens();
  }

  /**
   * Phương thức kéo tua tua thời gian được giới hạn tần suất (Throttled) tối đa 30 FPS
   * Giúp tránh nghẽn luồng xử lý đồ họa của trình duyệt khi di chuột liên tục
   */
  public updateScrubPosition = useThrottleFn((frameIndex: number): void => {
    if (!this.isScrubbing) return;

    // 1. Hủy bỏ mọi hoạt ảnh tịnh tiến vừa phát sinh
    this.cleanupActiveTweens();

    // 2. Snap trực tiếp tọa độ tĩnh tại Frame đích
    this.animStore.goToFrame(frameIndex);

    // 3. Yêu cầu Canvas vẽ lại ngay lập tức (Force Repaint)
    this.animStore.triggerForceCanvasRepaint();
  }, 33); // 33ms tương đương tối đa ~30 FPS

  /**
   * Kết thúc quá trình kéo tua, phục hồi lại luồng
   */
  public endScrub(): void {
    this.isScrubbing = false;
  }

  /**
   * Hủy bỏ mọi hoạt ảnh tịnh tiến (Tween) đang chạy để tránh đè tọa độ Canvas
   */
  private cleanupActiveTweens(): void {
    // Nếu sử dụng thư viện GSAP để vẽ hiệu ứng tịnh tiến cột mảng:
    if (typeof (window as any).gsap !== 'undefined') {
      (window as any).gsap.killTweensOf('*');
    }
    
    // Nếu sử dụng requestAnimationFrame:
    if (this.animStore.activeAnimationFrameId) {
      cancelAnimationFrame(this.animStore.activeAnimationFrameId);
      this.animStore.activeAnimationFrameId = null;
    }
  }
}
```

---

## 2. Toán học Tính toán Thời lượng Bước giải thuật (Speed & Duration Scaling)

Thời lượng thực hiện trượt hiệu ứng chuyển tiếp giữa hai trạng thái được xác định động thông qua công thức tỉ lệ nghịch với hệ số nhân tốc độ. Điều này giúp tăng tốc hoặc làm chậm hoạt ảnh Canvas tương ứng:

```typescript
export class SpeedScaleCalculator {
  // Thời gian chuyển dịch mặc định của một bước thuật toán (1 giây)
  private static readonly BASE_DURATION_MS = 1000;

  /**
   * Tính toán thời lượng thực thi (miliseconds) thực tế dựa trên hệ số tốc độ phát
   * 
   * Công thức: duration = BASE_DURATION / speed
   */
  public static calculateTransitionDuration(playbackSpeed: number): number {
    if (playbackSpeed <= 0) {
      console.warn('Hệ số tốc độ không hợp lệ, phục hồi về mặc định 1.0x');
      return this.BASE_DURATION_MS;
    }
    
    return Math.round(this.BASE_DURATION_MS / playbackSpeed);
  }
}
```

### Bảng Giá Trị Thực Tế Cho Sư Phạm:
*   **0.25x Speed:** $\text{duration} = 1000 / 0.25 = 4000\text{ms}$ (Thích hợp để giảng viên giải thích chi tiết cơ chế đổi chỗ của Quick Sort đệ quy).
*   **0.50x Speed:** $\text{duration} = 1000 / 0.50 = 2000\text{ms}$.
*   **1.00x Speed (Mặc định):** $\text{duration} = 1000 / 1.00 = 1000\text{ms}$ (Tốc độ tiêu chuẩn nhịp độ vừa phải).
*   **2.00x Speed:** $\text{duration} = 1000 / 2.00 = 500\text{ms}$.
*   **4.00x Speed:** $\text{duration} = 1000 / 4.00 = 250\text{ms}$ (Thích hợp cho sinh viên lướt nhanh thuật toán Bubble Sort mảng dài).
