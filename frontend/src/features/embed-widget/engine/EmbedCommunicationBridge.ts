import type { EmbedMessage, EmbedMessageAction } from '../types/embed-widget.types';
import { EMBED_MESSAGE_ACTIONS } from '../types/embed-widget.types';
import { SecureOriginChecker } from './SecureOriginChecker';

export type EmbedMessageListener = (msg: EmbedMessage, origin: string) => void;

/** Origin của chính trang đang chạy — trả '' khi không có window (SSR/ngoài browser). */
function getSelfOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
}

/**
 * Cầu nối postMessage giữa widget (iframe) và host page (Moodle/Canvas/...).
 * Chính sách fail-closed (EW-006): không truyền allowlist hoặc truyền [] đều
 * chỉ tin origin của chính mình — muốn nhận mọi origin phải truyền rõ ['*'].
 */
export class EmbedCommunicationBridge {
  private readonly allowlist: SecureOriginChecker;
  private readonly hostOrigin: string;
  private listeners: Set<EmbedMessageListener> = new Set();
  private windowMessageEventHandler: ((event: MessageEvent) => void) | null = null;

  constructor(
    allowedOriginsOrChecker?: string[] | SecureOriginChecker,
    hostOrigin?: string,
  ) {
    // EW-006: mảng rỗng/không truyền → mặc định [getSelfOrigin()], KHÔNG hiểu là
    // "nhận mọi origin". EW-022: lọc bỏ '' nếu getSelfOrigin trả rỗng ngoài window,
    // tránh allowlist = ['']. EW-013: allowlist duy nhất = SecureOriginChecker.
    if (allowedOriginsOrChecker instanceof SecureOriginChecker) {
      this.allowlist = allowedOriginsOrChecker;
    } else {
      const hasExplicitOrigins =
        allowedOriginsOrChecker !== undefined && allowedOriginsOrChecker.length > 0;
      const defaultOrigins = [getSelfOrigin()].filter((origin) => origin.length > 0);
      this.allowlist = new SecureOriginChecker(
        hasExplicitOrigins ? allowedOriginsOrChecker : defaultOrigins,
      );
    }
    // Origin của host page nhúng widget — dùng làm targetOrigin mặc định khi gửi ra ngoài.
    this.hostOrigin = hostOrigin ?? '';
    this.initializeListener();
  }

  private initializeListener(): void {
    this.windowMessageEventHandler = (event: MessageEvent) => {
      if (!this.allowlist.isValidOrigin(event.origin)) {
        console.warn(
          `XSS_PREVENTION_BLOCKED: Từ chối tin nhắn từ Origin không an toàn: ${event.origin}`,
        );
        return;
      }
      // EW-012: validate shape fail-closed — action phải thuộc EmbedMessageAction
      // và payload đúng kiểu (height number, stepIndex number...) trước khi dispatch.
      if (!isValidEmbedMessageShape(event.data)) return;
      const msg = event.data as EmbedMessage;
      this.listeners.forEach((listener) => listener(msg, event.origin));
    };

    window.addEventListener('message', this.windowMessageEventHandler);
  }

  /**
   * Gửi message tới targetWindow với targetOrigin an toàn (EW-001):
   *   - truyền targetOrigin rõ ràng nếu biết chính xác đối tác
   *   - HEIGHT_CHANGED: hướng về parent/host — mặc định hostOrigin, nếu chưa biết
   *     host thì dùng '*' (payload chỉ là số px, không nhạy cảm)
   *   - WIDGET_READY: luôn gửi tới origin host
   *   - KHÔNG bao giờ mặc định là origin self (widget cross-origin → browser loại bỏ)
   */
  public sendMessage(
    targetWindow: Window,
    msg: EmbedMessage,
    targetOrigin?: string,
  ): void {
    let safeOrigin = targetOrigin ?? this.getDefaultTargetOrigin(msg.action);
    // EW-011: targetOrigin rỗng → fallback '*' + cảnh báo, tránh postMessage SyntaxError.
    if (safeOrigin.length === 0) {
      console.warn(
        'EMBED_BRIDGE: targetOrigin rỗng — fallback về "*" để tránh lỗi postMessage',
      );
      safeOrigin = '*';
    }
    targetWindow.postMessage(msg, safeOrigin);
  }

  private getDefaultTargetOrigin(action: EmbedMessageAction): string {
    if (action === 'HEIGHT_CHANGED' || action === 'WIDGET_READY') {
      return this.hostOrigin.length > 0 ? this.hostOrigin : '*';
    }
    if (this.hostOrigin.length > 0) return this.hostOrigin;
    return this.allowlist.getWhitelistedDomains()[0] ?? '*';
  }

  /** Cho host script/widget kiểm tra một origin có được phép hay không. */
  public isOriginAllowed(origin: string): boolean {
    return this.allowlist.isValidOrigin(origin);
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

/**
 * Validate shape message trước khi dispatch — fail-closed (EW-012):
 *   - source phải nằm trong EmbedMessageSource
 *   - action phải thuộc EMBED_MESSAGE_ACTIONS
 *   - payload null hoặc object với từng field đúng kiểu primitive
 */
function isValidEmbedMessageShape(data: unknown): data is EmbedMessage {
  if (data === null || typeof data !== 'object') return false;
  const candidate = data as Record<string, unknown>;

  if (
    candidate.source !== 'VISUALIZATION_DSA_HOST' &&
    candidate.source !== 'VISUALIZATION_DSA_WIDGET'
  ) {
    return false;
  }
  if (
    typeof candidate.action !== 'string' ||
    !EMBED_MESSAGE_ACTIONS.includes(candidate.action as EmbedMessageAction)
  ) {
    return false;
  }
  if (candidate.payload !== null && typeof candidate.payload !== 'object') {
    return false;
  }
  if (candidate.payload !== null) {
    const payload = candidate.payload as Record<string, unknown>;
    if (payload.stepIndex !== undefined && typeof payload.stepIndex !== 'number') {
      return false;
    }
    if (payload.height !== undefined && typeof payload.height !== 'number') {
      return false;
    }
    if (payload.quizScore !== undefined && typeof payload.quizScore !== 'number') {
      return false;
    }
    if (
      payload.totalQuizQuestions !== undefined &&
      typeof payload.totalQuizQuestions !== 'number'
    ) {
      return false;
    }
  }
  return true;
}
