# 🎨 Glassmorphic Design System & Premium Monaco Shell Shell (Phase 1)

Tài liệu này đặc tả chi tiết thiết kế hệ thống giao diện mờ kính sang trọng **Glassmorphic Design Tokens**, bộ tích hợp trình soạn thảo mã nguồn **Monaco Editor Shell** và động cơ phản hồi âm thanh vật lý của Phase 1.

---

## 1. Ngôn ngữ Thiết kế và Token Giao diện (Glassmorphic Design Tokens)

Thiết kế giao diện Slate tối sâu thẳm, phối màu phản quang Neon tinh tế tạo cảm giác premium hiện đại:

```css
:root {
  /* Bảng màu nền Slate sâu thẳm */
  --slate-900: #0F172A;
  --slate-950: #020617;
  
  /* Các dải màu phát quang HSL (Tailored Neon Glows) */
  --neon-cyan-glow: hsla(190, 90%, 50%, 0.15);
  --neon-emerald-glow: hsla(150, 80%, 40%, 0.15);
  --neon-amber-glow: hsla(38, 92%, 50%, 0.15);
  --neon-crimson-glow: hsla(342, 89%, 48%, 0.15);

  /* Phông chữ Outfit & Inter sành điệu */
  --font-family-title: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  /* Thiết kế mờ kính Glassmorphic */
  --backdrop-blur-intensity: blur(16px);
  --border-glass-opacity: 1px solid rgba(255, 255, 255, 0.08);
}
```

---

## 2. Trình Soạn Thảo Monaco Editor Tương tác (Monaco Editor Integration Spec)

Monaco Editor được thiết lập ở trạng thái chỉ đọc có kiểm soát, chặn các thao tác chuột ngoài ý muốn nhưng cho phép nhấp chọn dòng code dự đoán kết quả giải thuật:

```typescript
export class MonacoShellCoordinator {
  private editorInstance: any = null;

  public initializeMonaco(containerEl: HTMLElement, code: string): void {
    // @ts-ignore
    if (typeof monaco === 'undefined') return;

    // @ts-ignore
    this.editorInstance = monaco.editor.create(containerEl, {
      value: code,
      language: 'javascript',
      theme: 'vs-dark',
      readOnly: true, // Trạng thái chỉ đọc cơ bản
      minimap: { enabled: false },
      fontSize: 14,
      fontFamily: "'Fira Code', 'Courier New', monospace",
      lineDecorationsWidth: 10,
      scrollbar: {
        vertical: 'visible',
        horizontal: 'visible',
        useShadows: false
      }
    });

    this.setupMouseInterceptors();
  }

  private setupMouseInterceptors(): void {
    if (!this.editorInstance) return;

    // Chặn hành vi bôi đen chọn mã nguồn (Text Selection Blocker)
    this.editorInstance.onMouseDown((e: any) => {
      // Cho phép nhấp chọn nếu đang ở chế độ Trắc nghiệm tương tác thông minh Smart Quiz
      const targetType = e.target.type;
      if (targetType !== 3 && targetType !== 4) { // Mouse over gutter or line content
        e.event.preventDefault();
      }
    });
  }

  public destroy(): void {
    if (this.editorInstance) {
      this.editorInstance.dispose();
      this.editorInstance = null;
    }
  }
}
```

---

## 3. Động cơ Phản hồi Âm thanh Vật lý Trễ cực thấp (Acoustic Feedback Engine)

```typescript
export class AcousticFeedbackEngine {
  private static audioCtx: AudioContext | null = null;

  private static initAudio(): void {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Phát tiếng click cơ học nhẹ nhàng khi nhấp phím VCR (Mechanical Click Sound)
   */
  public static playClick(): void {
    this.initAudio();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, this.audioCtx.currentTime); // Âm thanh tí tách trong trẻo
    osc.frequency.exponentialRampToValueAtTime(150, this.audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.08);
  }

  /**
   * Phát tiếng chimes reo vui khi hoàn thành xuất sắc thuật toán (Success Chimes)
   */
  public static playSuccess(): void {
    this.initAudio();
    if (!this.audioCtx) return;

    const osc1 = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, this.audioCtx.currentTime); // Note C5
    osc1.frequency.setValueAtTime(659.25, this.audioCtx.currentTime + 0.1); // Note E5

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, this.audioCtx.currentTime); // Note G5
    osc2.frequency.setValueAtTime(1046.50, this.audioCtx.currentTime + 0.1); // Note C6

    gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(this.audioCtx.currentTime + 0.4);
    osc2.stop(this.audioCtx.currentTime + 0.4);
  }
}
```
 Thiết kế giao diện Glassmorphism mờ kính tinh xảo, bộ chặn chuột text selection Monaco Editor thông minh và động cơ âm thanh Synth Synthesizer tí tách click mang lại cảm giác tương tác nhạy bén, sống động tột cùng.
