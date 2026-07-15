# 🧠 Unified Playback Coordinator & Dynamic Rendering (TypeScript)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của lớp hạt nhân `UnifiedPlaybackCoordinator` điều phối phát kép, bộ lập lịch render RequestAnimationFrame tối ưu GPU và các ca kiểm thử tự động (Unit Tests).

---

## 1. Bộ điều phối Phát kép & Lập lịch Render (TypeScript Core Logic)

Lớp `UnifiedPlaybackCoordinator` và `UnifiedRenderScheduler` đóng vai trò là động cơ đồng bộ hóa dòng thời gian hoạt ảnh và tối ưu hóa vẽ GPU Client-side:

```typescript
export interface SubStoreState {
  currentFrameIndex: number;
  totalFrames: number;
  isPlaying: boolean;
  goToFrame(frameIdx: number): void;
  setPlaySpeed(speed: number): void;
}

export class UnifiedPlaybackCoordinator {
  private leftStore: SubStoreState;
  private rightStore: SubStoreState;

  constructor(leftStore: SubStoreState, rightStore: SubStoreState) {
    this.leftStore = leftStore;
    this.rightStore = rightStore;
  }

  /**
   * 1. Đồng bộ nhảy mốc thời gian chéo theo phần trăm tiến trình chung
   */
  public syncProgressByPercent(percent: number): void {
    if (percent < 0 || percent > 100) return;

    // Tính toán mốc frame đích tương ứng của từng bên
    const leftTargetFrame = Math.round((percent / 100) * this.leftStore.totalFrames);
    const rightTargetFrame = Math.round((percent / 100) * this.rightStore.totalFrames);

    // Snap đồng thời cả 2 bên về mốc tính toán
    this.leftStore.goToFrame(this.clamp(leftTargetFrame, 0, this.leftStore.totalFrames));
    this.rightStore.goToFrame(this.clamp(rightTargetFrame, 0, this.rightStore.totalFrames));
  }

  /**
   * 2. Giải thuật Căn chỉnh Tốc độ Aligned Speeds giúp 2 bài giảng cùng kết thúc đồng thời
   * Đảm bảo so sánh trực diện quá trình di chuyển mượt mà
   */
  public calculateAlignedSpeeds(globalSpeed: number): { leftSpeed: number; rightSpeed: number } {
    const leftTotal = this.leftStore.totalFrames;
    const rightTotal = this.rightStore.totalFrames;

    if (leftTotal === 0 || rightTotal === 0) {
      return { leftSpeed: globalSpeed, rightSpeed: globalSpeed };
    }

    // Thuật toán có số bước dài hơn chạy với tốc độ gốc, thuật toán ngắn hơn chạy tốc độ giảm tương ứng để cùng kết thúc đồng thời
    if (leftTotal > rightTotal) {
      return {
        leftSpeed: globalSpeed,
        rightSpeed: Number((globalSpeed * (rightTotal / leftTotal)).toFixed(2))
      };
    } else {
      return {
        leftSpeed: Number((globalSpeed * (leftTotal / rightTotal)).toFixed(2)),
        rightSpeed: globalSpeed
      };
    }
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}

/**
 * 3. Bộ lập lịch Vẽ RequestAnimationFrame hợp nhất GPU (rAF Scheduler)
 * Gom các thao tác xóa và vẽ lại của cả 2 Canvas vào cùng 1 Frame quét của màn hình
 */
export class UnifiedRenderScheduler {
  private static leftRenderCallback: (() => void) | null = null;
  private static rightRenderCallback: (() => void) | null = null;
  private static isLoopRunning = false;
  private static activeAnimationFrameId: number | null = null;

  public static registerCallbacks(leftCb: () => void, rightCb: () => void) {
    this.leftRenderCallback = leftCb;
    this.rightRenderCallback = rightCb;
  }

  public static startSchedulerLoop(): void {
    if (this.isLoopRunning) return;
    this.isLoopRunning = true;

    const tick = () => {
      if (!this.isLoopRunning) return;

      // Gom cuộc gọi render của cả 2 Canvas con vào đúng 1 nhịp quét màn hình
      if (this.leftRenderCallback) this.leftRenderCallback();
      if (this.rightRenderCallback) this.rightRenderCallback();

      this.activeAnimationFrameId = requestAnimationFrame(tick);
    };

    this.activeAnimationFrameId = requestAnimationFrame(tick);
  }

  public static stopSchedulerLoop(): void {
    this.isLoopRunning = false;
    if (this.activeAnimationFrameId !== null) {
      cancelAnimationFrame(this.activeAnimationFrameId);
      this.activeAnimationFrameId = null;
    }
  }
}
```

---

## 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)

Chúng ta xây dựng bộ unit tests xác thực quá trình đồng bộ hóa tiến độ phần trăm và căn chỉnh tốc độ Aligned Speeds hoạt động hoàn hảo:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { UnifiedPlaybackCoordinator, SubStoreState } from './UnifiedPlaybackCoordinator';

// Khởi tạo các mock store đại diện cho phân hệ Left và Right
const createMockStore = (totalFrames: number): SubStoreState => ({
  currentFrameIndex: 0,
  totalFrames,
  isPlaying: false,
  goToFrame: vi.fn(function(this: SubStoreState, frameIdx: number) {
    this.currentFrameIndex = frameIdx;
  }),
  setPlaySpeed: vi.fn()
});

describe('UnifiedPlaybackCoordinator Unit Tests', () => {
  it('Should successfully synchronize target frames by global percent (50%)', () => {
    const leftStore = createMockStore(100); // 100 frames
    const rightStore = createMockStore(20);  // 20 frames
    const coordinator = new UnifiedPlaybackCoordinator(leftStore, rightStore);

    coordinator.syncProgressByPercent(50); // Đồng bộ tại mốc 50% tiến trình

    expect(leftStore.goToFrame).toHaveBeenCalledWith(50);
    expect(rightStore.goToFrame).toHaveBeenCalledWith(10);
  });

  it('Should align speeds perfectly when left has more frames than right', () => {
    const leftStore = createMockStore(100); // Dài hơn
    const rightStore = createMockStore(50);  // Ngắn hơn (bằng 1/2)
    const coordinator = new UnifiedPlaybackCoordinator(leftStore, rightStore);

    const speeds = coordinator.calculateAlignedSpeeds(2.0); // Tốc độ base là 2.0x

    expect(speeds.leftSpeed).toBe(2.0);
    expect(speeds.rightSpeed).toBe(1.0); // Tốc độ giảm xuống 1/2 để cùng về đích đồng thời
  });

  it('Should align speeds perfectly when right has more frames than left', () => {
    const leftStore = createMockStore(40);  // Ngắn hơn (bằng 1/2)
    const rightStore = createMockStore(80);  // Dài hơn
    const coordinator = new UnifiedPlaybackCoordinator(leftStore, rightStore);

    const speeds = coordinator.calculateAlignedSpeeds(1.5); // Tốc độ base là 1.5x

    expect(speeds.leftSpeed).toBe(0.75); // Tốc độ giảm xuống 1/2
    expect(speeds.rightSpeed).toBe(1.5);
  });
});
```
 Bộ điều phối phát đồng hành kép (Unified Playback Engine) cam kết trải nghiệm học thuật đối sánh mượt mà, phản chiếu trực quan sự chênh lệch độ phức tạp thuật toán cực kỳ sâu sắc cho học viên.
