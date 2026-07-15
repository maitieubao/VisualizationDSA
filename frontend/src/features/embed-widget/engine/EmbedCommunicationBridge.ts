/**
 * EmbedCommunicationBridge — Secure Bidirectional postMessage Bridge
 *
 * Establishes a secure two-way communication channel between the host
 * website and the embedded iframe widget. Filters messages by origin
 * whitelist and validates message structure to prevent XSS attacks.
 */

import type { EmbedMessage } from '../types/embed-widget.types';

export type EmbedMessageListener = (msg: EmbedMessage, origin: string) => void;

export class EmbedCommunicationBridge {
  private allowedOrigins: string[];
  private listeners: Set<EmbedMessageListener> = new Set();
  private windowMessageEventHandler: ((event: MessageEvent) => void) | null = null;

  constructor(allowedOrigins: string[] = ['*']) {
    this.allowedOrigins = allowedOrigins;
    this.initializeListener();
  }

  /**
   * Sets up the global window message event listener with origin filtering.
   */
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

  /**
   * Sends a structured message to the target window.
   */
  public sendMessage(
    targetWindow: Window,
    msg: EmbedMessage,
    targetOrigin: string = '*',
  ): void {
    targetWindow.postMessage(msg, targetOrigin);
  }

  /**
   * Registers a callback to receive validated messages.
   * Returns an unsubscribe function for cleanup.
   */
  public onMessage(callback: EmbedMessageListener): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Returns the current number of registered listeners.
   */
  public get listenerCount(): number {
    return this.listeners.size;
  }

  /**
   * Cleans up event listeners and releases resources to prevent memory leaks.
   */
  public destroy(): void {
    if (this.windowMessageEventHandler) {
      window.removeEventListener('message', this.windowMessageEventHandler);
      this.windowMessageEventHandler = null;
    }
    this.listeners.clear();
  }
}
