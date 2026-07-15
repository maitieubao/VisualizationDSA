# 🛠 Technical Specification - VCR Playback Engine & High-Res Scheduler

Tài liệu này đặc tả chi tiết kiến trúc hạt nhân của bộ lập lịch đập nhịp **VCRPlaybackEngine**, giải thuật hàng đợi bộ nhớ đệm Caching Snapshot và thuật toán tính toán vị trí Scrubber co giãn.

---

## 1. Trình Lập Lịch Xung Nhịp Độ Phân Giải Cao (VCRPlaybackEngine TS)

Hạt nhân điều phối dòng thời gian được thiết lập bằng TypeScript chặt chẽ, sử dụng `requestAnimationFrame` và đồng hồ sai số cực thấp `performance.now()`:

```typescript
export type PlaybackStatus = 'PLAYING' | 'PAUSED' | 'STOPPED';

export interface PlaybackFrame {
  stepIndex: number;
  canvasStateSnapshot: any; // Cấu trúc mảng/cây lưu trữ
  lineNumber: number;
  description: string;
}

export class VCRPlaybackEngine {
  private frames: PlaybackFrame[] = [];
  private currentStepIndex = 0;
  private status: PlaybackStatus = 'PAUSED';
  private playbackSpeed = 1.0; // Hệ số nhân tốc độ (0.1x -> 5.0x)
  
  private lastTickTime = 0;
  private animationFrameId: number | null = null;
  private onStepCallback: (frame: PlaybackFrame) => void;

  constructor(onStep: (frame: PlaybackFrame) => void) {
    this.onStepCallback = onStep;
  }

  public setFrames(frames: PlaybackFrame[]): void {
    this.frames = frames;
    this.currentStepIndex = 0;
  }

  public play(): void {
    if (this.status === 'PLAYING') return;
    this.status = 'PLAYING';
    this.lastTickTime = performance.now();
    this.loop();
  }

  public pause(): void {
    this.status = 'PAUSED';
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public setSpeed(speed: number): void {
    this.playbackSpeed = speed;
  }

  public seekToStep(index: number): PlaybackFrame | null {
    if (index < 0 || index >= this.frames.length) return null;
    this.currentStepIndex = index;
    const frame = this.frames[index];
    this.onStepCallback(frame);
    return frame;
  }

  private loop = (): void => {
    if (this.status !== 'PLAYING') return;

    const now = performance.now();
    const elapsed = now - this.lastTickTime;
    const stepInterval = 1000 / this.playbackSpeed; // Mặc định 1 giây/bước ở tốc độ 1.0x

    if (elapsed >= stepInterval) {
      this.nextStep();
      this.lastTickTime = now;
    }

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private nextStep(): void {
    if (this.currentStepIndex < this.frames.length - 1) {
      this.currentStepIndex++;
      this.onStepCallback(this.frames[this.currentStepIndex]);
    } else {
      this.pause(); // Kết thúc phim giải thuật
    }
  }

  public stepBack(): PlaybackFrame | null {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      const frame = this.frames[this.currentStepIndex];
      this.onStepCallback(frame);
      return frame;
    }
    return null;
  }

  public stepForward(): PlaybackFrame | null {
    if (this.currentStepIndex < this.frames.length - 1) {
      this.currentStepIndex++;
      const frame = this.frames[this.currentStepIndex];
      this.onStepCallback(frame);
      return frame;
    }
    return null;
  }

  public destroy(): void {
    this.pause();
    this.frames = [];
  }
}
```

---

## 2. Thuật toán Caching Snapshot và Tái thiết lập Trạng thái (State Reconciliation)

Hệ thống lưu giữ toàn bộ snapshot mảng/cây ảo của từng bước giải thuật vào một `PlaybackFrame[]` dưới RAM Client-side:
*   **Quét Scrubber:** Khi sinh viên kéo scrubber sang bước $K$:
    $$\text{Seek}(K) \implies \text{Store.canvasSnapshot} = \text{frames}[K].\text{canvasStateSnapshot}$$
    *   *Thời gian phản hồi:* Truy vấn chỉ số mảng dưới **0.1ms**, cập nhật DOM Vue phản hồi dưới **5ms**, cam kết độ mượt mà tối cao.

---

## 3. Công thức định vị chỉ số thanh trượt Scrubber (Scrubber Math)

Khi con chuột kéo trượt trên thanh trượt có chiều rộng thực tế $W$ (pixel):
*   Tọa độ X tương đối của con chuột: $X_{\text{rel}} = X_{\text{mouse}} - \text{getBoundingClientRect().left}$
*   Tỷ lệ phần trăm tiến trình:
    $$\text{percent} = \text{Clamp}\left(\frac{X_{\text{rel}}}{W}, 0.0, 1.0\right)$$
*   Chỉ số bước giải thuật tương ứng:
    $$\text{StepIndex} = \text{Round}\left(\text{percent} \times (\text{totalSteps} - 1)\right)$$
*   *Hành vi Clamping:* Ràng buộc chặt chẽ giá trị trong khoảng $[0, \text{totalSteps} - 1]$ ngăn lỗi chỉ số vượt biên.
