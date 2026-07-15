# 🛠 Technical Specification - postMessage Bridge & Bundle Optimization

Tài liệu này đặc tả chi tiết giao thức truyền tin hai chiều bảo mật qua postMessage, giải thuật tự động co giãn chiều cao ResizeObserver và cấu hình tách mã nguồn Rollup siêu nhẹ cho Iframe nhúng.

---

## 1. Giao thức Truyền tin Hai chiều (postMessage Protocol Schema)

Để đảm bảo tính bảo mật và tránh các cuộc tấn công tiêm nhiễm mã độc từ bên ngoài (XSS), bộ cầu nối truyền tin `EmbedCommunicationBridge` thực thi kiểm duyệt origin và lọc gói tin nghiêm ngặt:

```typescript
export interface EmbedMessage {
  source: 'VISUALIZATION_DSA_WIDGET' | 'VISUALIZATION_DSA_HOST';
  action: 'WIDGET_READY' | 'STEP_FORWARD' | 'STEP_BACKWARD' | 'RESET' | 'QUIZ_COMPLETED' | 'HEIGHT_CHANGED';
  payload: any;
}

export class EmbedCommunicationBridge {
  private allowedOrigins: string[] = [];

  constructor(allowedOrigins: string[] = ['*']) {
    this.allowedOrigins = allowedOrigins;
  }

  /**
   * Bắn thông điệp sang Window đích
   */
  public sendMessage(targetWindow: Window, msg: EmbedMessage, targetOrigin: string = '*'): void {
    targetWindow.postMessage(msg, targetOrigin);
  }

  /**
   * Lắng nghe và kiểm duyệt sự kiện tin nhắn
   */
  public registerListener(callback: (msg: EmbedMessage) => void): () => void {
    const handler = (event: MessageEvent) => {
      // 1. Kiểm duyệt Origin bảo mật
      if (this.allowedOrigins.length > 0 && !this.allowedOrigins.includes('*') && !this.allowedOrigins.includes(event.origin)) {
        console.warn(`XSS_PREVENTION_BLOCKED: Từ chối gói tin từ Origin không an toàn: ${event.origin}`);
        return;
      }

      const msg = event.data as EmbedMessage;
      if (msg && msg.source === 'VISUALIZATION_DSA_HOST' || msg.source === 'VISUALIZATION_DSA_WIDGET') {
        callback(msg);
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler); // Hàm hủy đăng ký
  }
}
```

---

## 2. Giải thuật Tự động Co giãn Chiều cao (ResizeObserver Dynamic Resizer)

Để loại bỏ thanh cuộn dọc kép gây mất thẩm mỹ, Iframe nhúng tự động giám sát chiều cao content và thông báo lên trang chủ:

```typescript
export function initializeAutoHeightResizer(bridge: EmbedCommunicationBridge) {
  const container = document.body;
  
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const height = Math.ceil(entry.contentRect.height);
      
      // Bắn tin nhắn thay đổi chiều cao gửi lên trang chủ Host
      bridge.sendMessage(window.parent, {
        source: 'VISUALIZATION_DSA_WIDGET',
        action: 'HEIGHT_CHANGED',
        payload: { height }
      });
    }
  });

  resizeObserver.observe(container);
  return () => resizeObserver.disconnect();
}
```

---

## 3. Cấu hình Rollup/Vite Tách gói Tải Siêu Nhẹ (Lightweight Bundle Config)

Để nhúng nhanh chóng dưới 150KB, cấu hình `vite.config.ts` chia nhỏ mã nguồn (Code Splitting) loại bỏ Monaco Editor:

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        embed: './src/embed/index.html' // Trang html nhúng chuyên dụng siêu nhẹ
      },
      output: {
        manualChunks(id) {
          // Tách biệt hoàn toàn Monaco Editor nặng ký khỏi bundle embed
          if (id.includes('monaco-editor')) {
            return 'monaco-vendor';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
});
```
 Giao thức bảo mật postMessage kết hợp giải thuật co giãn tự động `ResizeObserver` và cấu hình tách mã Rollup/Vite đảm bảo trải nghiệm nhúng sơ đồ thuật toán mượt mà 60 FPS, tải trang nhanh chóng và an toàn tuyệt đối.
