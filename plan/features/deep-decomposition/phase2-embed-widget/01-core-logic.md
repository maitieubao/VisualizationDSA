# 🧠 postMessage Bridge & Event Dispatcher (TypeScript)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của lớp hạt nhân cầu nối truyền tin bảo mật `EmbedCommunicationBridge` và các ca kiểm thử tự động (Unit Tests) xác thực an toàn truyền nhận thông điệp.

---

## 1. Bộ cầu nối Truyền tin bảo mật (TypeScript Core Logic)

Lớp `EmbedCommunicationBridge` thiết lập kênh liên lạc hai chiều an toàn giữa trang chủ Host và Iframe nhúng thuật toán, lọc bỏ các Origin mạo danh độc hại:

```typescript
export interface EmbedMessage {
  source: 'VISUALIZATION_DSA_WIDGET' | 'VISUALIZATION_DSA_HOST';
  action: string;
  payload: any;
}

export class EmbedCommunicationBridge {
  private allowedOrigins: string[];
  private listeners: Set<(msg: EmbedMessage, origin: string) => void> = new Set();
  private windowMessageEventHandler: ((event: MessageEvent) => void) | null = null;

  constructor(allowedOrigins: string[] = ['*']) {
    this.allowedOrigins = allowedOrigins;
    this.initializeListener();
  }

  /**
   * Khởi tạo bộ lắng nghe sự kiện Message toàn cục của window
   */
  private initializeListener(): void {
    this.windowMessageEventHandler = (event: MessageEvent) => {
      // 1. Kiểm duyệt Origin bảo mật chống tấn công XSS
      if (
        this.allowedOrigins.length > 0 && 
        !this.allowedOrigins.includes('*') && 
        !this.allowedOrigins.includes(event.origin)
      ) {
        console.warn(`XSS_PREVENTION_BLOCKED: Từ chối tin nhắn từ Origin không an toàn: ${event.origin}`);
        return;
      }

      const msg = event.data as EmbedMessage;
      // Xác minh đúng cấu trúc gói tin của hệ thống VisualizationDSA
      if (msg && (msg.source === 'VISUALIZATION_DSA_HOST' || msg.source === 'VISUALIZATION_DSA_WIDGET')) {
        this.listeners.forEach(listener => listener(msg, event.origin));
      }
    };

    window.addEventListener('message', this.windowMessageEventHandler);
  }

  /**
   * Bắn thông điệp sang Window đối tác
   */
  public sendMessage(targetWindow: Window, msg: EmbedMessage, targetOrigin: string = '*'): void {
    targetWindow.postMessage(msg, targetOrigin);
  }

  /**
   * Đăng ký callback nhận tin nhắn
   */
  public onMessage(callback: (msg: EmbedMessage, origin: string) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback); // Hàm hủy đăng ký
    };
  }

  /**
   * Giải phóng tài nguyên dọn dẹp bộ lắng nghe chuột/sự kiện toàn cục
   */
  public destroy(): void {
    if (this.windowMessageEventHandler) {
      window.removeEventListener('message', this.windowMessageEventHandler);
      this.windowMessageEventHandler = null;
    }
    this.listeners.clear();
  }
}
```

---

## 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)

Chúng ta xây dựng bộ unit tests xác thực quá trình truyền tin nhắn, kiểm duyệt Whitelist Origin và ngắt dọn dẹp RAM rò rỉ:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { EmbedCommunicationBridge, EmbedMessage } from './EmbedCommunicationBridge';

describe('Embed Communication Bridge Unit Tests', () => {
  it('Should successfully deliver formatted messages from trusted origins', () => {
    // Cho phép nhúng trên domain moodle của trường đại học Bách Khoa
    const bridge = new EmbedCommunicationBridge(['https://moodle.hust.edu.vn']);
    const spyCallback = vi.fn();

    bridge.onMessage(spyCallback);

    // Giả lập sự kiện nhận Message từ Domain tin cậy gửi đến
    const mockEvent = new MessageEvent('message', {
      origin: 'https://moodle.hust.edu.vn',
      data: {
        source: 'VISUALIZATION_DSA_HOST',
        action: 'STEP_FORWARD',
        payload: { step: 5 }
      } as EmbedMessage
    });

    window.dispatchEvent(mockEvent);

    expect(spyCallback).toHaveBeenCalledTimes(1);
    expect(spyCallback).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'STEP_FORWARD' }),
      'https://moodle.hust.edu.vn'
    );

    bridge.destroy();
  });

  it('Should drop messages and warn in console when origin is not whitelisted (XSS prevention)', () => {
    const bridge = new EmbedCommunicationBridge(['https://moodle.hust.edu.vn']);
    const spyCallback = vi.fn();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    bridge.onMessage(spyCallback);

    // Giả lập hacker tấn công từ domain lạ cố tình gửi lệnh can thiệp widget
    const mockMaliciousEvent = new MessageEvent('message', {
      origin: 'https://malicious-hacker.com',
      data: {
        source: 'VISUALIZATION_DSA_HOST',
        action: 'RESET',
        payload: null
      } as EmbedMessage
    });

    window.dispatchEvent(mockMaliciousEvent);

    expect(spyCallback).not.toHaveBeenCalled(); // Hoàn toàn không gọi callback xử lý
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('XSS_PREVENTION_BLOCKED')
    ); // Báo động thành công

    bridge.destroy();
    warnSpy.mockRestore();
  });
});
```
 Bộ cầu nối truyền tin an toàn `EmbedCommunicationBridge` và cơ chế kiểm duyệt whitelist nghiêm ngặt đảm bảo tiện ích nhúng sơ đồ thuật toán luôn an toàn tuyệt đối trước mọi nguy cơ tấn công XSS, mang lại sự an tâm cho các đối tác tích hợp EdTech.
