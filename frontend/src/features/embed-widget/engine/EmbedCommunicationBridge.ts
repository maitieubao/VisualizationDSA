







import type { EmbedMessage } from '../types/embed-widget.types';

export type EmbedMessageListener = (msg: EmbedMessage, origin: string) => void;

/** Origin của chính trang đang chạy (an toàn mặc định thay vì '*'). */
function getSelfOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
}

export class EmbedCommunicationBridge {
  private allowedOrigins: string[];
  private listeners: Set<EmbedMessageListener> = new Set();
  private windowMessageEventHandler: ((event: MessageEvent) => void) | null = null;

  constructor(allowedOrigins?: string[]) {
    // Mặc định chỉ tin origin của chính mình — KHÔNG dùng '*' (chặn XSS qua postMessage).
    this.allowedOrigins = allowedOrigins ?? [getSelfOrigin()];
    this.initializeListener();
  }

  


  private initializeListener(): void {
    this.windowMessageEventHandler = (event: MessageEvent) => {
      if (
        this.allowedOrigins.length > 0 &&
        !this.allowedOrigins.includes('*') &&
        !this.allowedOrigins.includes(event.origin)
      ) {
        console.warn(
          `XSS_PREVENTION_BLOCKED: Từ chối tin nhắn từ Origin không an toàn: ${event.origin}`,
        );
        return;
      }

      const msg = event.data as EmbedMessage;
      if (
        msg &&
        (msg.source === 'VISUALIZATION_DSA_HOST' ||
          msg.source === 'VISUALIZATION_DSA_WIDGET')
      ) {
        this.listeners.forEach((listener) => listener(msg, event.origin));
      }
    };

    window.addEventListener('message', this.windowMessageEventHandler);
  }

  


  public sendMessage(
    targetWindow: Window,
    msg: EmbedMessage,
    targetOrigin?: string,
  ): void {
    // Mặc định gửi tới origin đã được phép đầu tiên (an toàn hơn '*'),
    // người gọi có thể truyền targetOrigin cụ thể nếu biết chính xác đối tác.
    const safeOrigin = targetOrigin ?? this.allowedOrigins[0] ?? getSelfOrigin();
    targetWindow.postMessage(msg, safeOrigin);
  }

  



  public onMessage(callback: EmbedMessageListener): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  


  public get listenerCount(): number {
    return this.listeners.size;
  }

  


  public destroy(): void {
    if (this.windowMessageEventHandler) {
      window.removeEventListener('message', this.windowMessageEventHandler);
      this.windowMessageEventHandler = null;
    }
    this.listeners.clear();
  }
}
