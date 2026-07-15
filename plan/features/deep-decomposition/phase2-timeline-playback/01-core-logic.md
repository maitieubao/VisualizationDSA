# 🧠 VCR Playback Engine & High-Res Scheduling Loop (TypeScript)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của trình điều phối phát lại giải thuật `VCRPlaybackEngine`, bộ lập lịch xung đồng hồ độ phân giải cao và các ca kiểm thử tự động (Unit Tests) bảo đảm tính chính xác.

---

## 1. Trình Lập Lịch Khung Hình Tốc Độ Cao (TypeScript Core Logic)

Mã nguồn lõi được thiết lập bằng TypeScript chặt chẽ, tối ưu hóa đập nhịp xung đồng hồ thực tế:

```typescript
export type PlaybackStatus = 'PLAYING' | 'PAUSED' | 'STOPPED';

export interface PlaybackFrame {
  stepIndex: number;
  canvasStateSnapshot: any; // Cấu trúc dữ liệu lưu trữ
  lineNumber: number;
  description: string;
}

export class VCRPlaybackEngine {
  private frames: PlaybackFrame[] = [];
  private currentStepIndex = 0;
  private status: PlaybackStatus = 'PAUSED';
  private playbackSpeed = 1.0; // Hệ số tốc độ (0.1x -> 5.0x)
  
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
      this.pause(); // Kết thúc
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

  public getCurrentStep(): number {
    return this.currentStepIndex;
  }

  public getStatus(): PlaybackStatus {
    return this.status;
  }

  public destroy(): void {
    this.pause();
    this.frames = [];
  }
}
```

---

## 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)

Chúng ta xây dựng bộ unit tests xác thực lùi bước, tiến bước, tua quét seek step và dừng phát chuẩn xác:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VCRPlaybackEngine, PlaybackFrame } from './VCRPlaybackEngine';

describe('VCR Playback Engine Unit Tests', () => {
  let engine: VCRPlaybackEngine;
  let mockCallback: any;
  let mockFrames: PlaybackFrame[];

  beforeEach(() => {
    mockCallback = vi.fn();
    engine = new VCRPlaybackEngine(mockCallback);

    mockFrames = [
      { stepIndex: 0, canvasStateSnapshot: { data: [1, 2] }, lineNumber: 10, description: 'Khởi tạo mảng' },
      { stepIndex: 1, canvasStateSnapshot: { data: [2, 1] }, lineNumber: 12, description: 'Hoán vị 1-2' },
      { stepIndex: 2, canvasStateSnapshot: { data: [2, 1] }, lineNumber: 15, description: 'Hoàn thành' }
    ];

    engine.setFrames(mockFrames);
  });

  it('Should seek to step index correctly and trigger snapshot callbacks', () => {
    const frame = engine.seekToStep(1);

    expect(frame?.stepIndex).toBe(1);
    expect(frame?.lineNumber).toBe(12);
    expect(engine.getCurrentStep()).toBe(1);
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(mockFrames[1]);
  });

  it('Should successfully step forward and step backward with bounding clamps', () => {
    // Đang ở bước 0 -> Tiến 1 bước -> Bước 1
    let frame = engine.stepForward();
    expect(frame?.stepIndex).toBe(1);
    expect(engine.getCurrentStep()).toBe(1);

    // Tiến thêm 1 bước -> Bước 2
    frame = engine.stepForward();
    expect(frame?.stepIndex).toBe(2);

    // Đạt giới hạn tiến -> Không thể tiến thêm
    frame = engine.stepForward();
    expect(frame).toBeNull();
    expect(engine.getCurrentStep()).toBe(2);

    // Lùi 1 bước -> Khôi phục bước 1
    frame = engine.stepBack();
    expect(frame?.stepIndex).toBe(1);
    expect(engine.getCurrentStep()).toBe(1);
  });

  it('Should correctly set and change playback speed dynamic modifiers', () => {
    engine.setSpeed(2.0);
    // Vòng lặp đập nhịp interval sẽ tự động rút ngắn còn 500ms thay vì 1000ms
    expect(engine['playbackSpeed']).toBe(2.0);
  });
});
```
 Hạt nhân VCRPlaybackEngine quản lý phát giải thuật ảo bám sát xung nhịp thực tế kết hợp các ca unit test nghiêm ngặt bảo đảm tua đi lùi bước và kéo scrubber luôn chuẩn chỉ, nhạy bén tuyệt đối.
