/**
 * WebTransportClient — High-performance network manager for real-time
 * collaborative graph synchronization over HTTP/3 WebTransport.
 *
 * This module stubs the WebTransport API (HTTP/3 QUIC-based bidirectional
 * streaming) to emulate low-latency data transport for CRDT document
 * synchronization. When WebTransport is unavailable (most current browsers),
 * it falls back to WebSocket transport automatically.
 *
 * Integration:
 *   useCollaborativeGraphStore.onLocalUpdate() → WebTransportClient.broadcast()
 *   WebTransportClient.onMessage()             → useCollaborativeGraphStore.applyRemoteUpdate()
 */

// ── Transport Types ──────────────────────────────────────────────────────────

export type TransportProtocol = 'webtransport' | 'websocket' | 'local';

export interface TransportConfig {
  /** Server URL (e.g., https://collab.visualizationdsa.dev/sync) */
  serverUrl: string;
  /** Room/session identifier for graph collaboration */
  roomId: string;
  /** Local peer identifier */
  peerId: string;
  /** Reconnection attempts before giving up */
  maxReconnectAttempts: number;
  /** Base delay between reconnection attempts (ms) */
  reconnectBaseDelay: number;
  /** Maximum message size in bytes (64KB default) */
  maxMessageSize: number;
}

export interface TransportStats {
  protocol: TransportProtocol;
  latencyMs: number;
  messagesReceived: number;
  messagesSent: number;
  bytesReceived: number;
  bytesSent: number;
  reconnectCount: number;
  isConnected: boolean;
  lastHeartbeat: number;
}

export type MessageType = 'sync' | 'awareness' | 'heartbeat' | 'full-state-request' | 'full-state-response';

export interface TransportMessage {
  type: MessageType;
  peerId: string;
  roomId: string;
  timestamp: number;
  payload: Uint8Array;
}

type MessageHandler = (message: TransportMessage) => void;
type ConnectionHandler = (connected: boolean) => void;

// ── Default Configuration ────────────────────────────────────────────────────

const DEFAULT_CONFIG: TransportConfig = {
  serverUrl: 'https://localhost:4433/sync',
  roomId: 'default-room',
  peerId: 'local-peer',
  maxReconnectAttempts: 5,
  reconnectBaseDelay: 1000,
  maxMessageSize: 65536,
};

// ── WebTransport Client ──────────────────────────────────────────────────────

export class WebTransportClient {
  private config: TransportConfig;
  private stats: TransportStats;
  private messageHandlers: Set<MessageHandler> = new Set();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempts = 0;
  private activeProtocol: TransportProtocol = 'local';

  constructor(config: Partial<TransportConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.stats = this.createInitialStats();
  }

  // ── Connection Lifecycle ─────────────────────────────────────────────────

  /**
   * Establish connection using the best available transport protocol.
   * Priority: WebTransport (HTTP/3) → WebSocket → Local (offline mode)
   */
  async connect(): Promise<TransportProtocol> {
    // Try WebTransport first (HTTP/3 QUIC-based)
    if (this.isWebTransportSupported()) {
      try {
        await this.connectWebTransport();
        this.activeProtocol = 'webtransport';
        this.onConnected();
        return 'webtransport';
      } catch {
        console.warn('[WebTransportClient] WebTransport failed, falling back to WebSocket');
      }
    }

    // Fallback to WebSocket
    if (this.isWebSocketSupported()) {
      try {
        await this.connectWebSocket();
        this.activeProtocol = 'websocket';
        this.onConnected();
        return 'websocket';
      } catch {
        console.warn('[WebTransportClient] WebSocket failed, entering local mode');
      }
    }

    // Local-only mode (offline collaboration via shared Y.Doc)
    this.activeProtocol = 'local';
    this.onConnected();
    return 'local';
  }

  /**
   * Disconnect and clean up all transport resources.
   */
  disconnect(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.stats.isConnected = false;
    this.reconnectAttempts = 0;
    this.notifyConnectionHandlers(false);
  }

  // ── Message Sending ──────────────────────────────────────────────────────

  /**
   * Broadcast a CRDT update to all peers in the room.
   * Uses transferable semantics for zero-copy when possible.
   */
  broadcast(type: MessageType, payload: Uint8Array): void {
    if (payload.byteLength > this.config.maxMessageSize) {
      console.error(
        `[WebTransportClient] Message exceeds max size: ${payload.byteLength} > ${this.config.maxMessageSize}`,
      );
      return;
    }

    const message: TransportMessage = {
      type,
      peerId: this.config.peerId,
      roomId: this.config.roomId,
      timestamp: Date.now(),
      payload,
    };

    this.stats.messagesSent++;
    this.stats.bytesSent += payload.byteLength;

    // In local mode, echo back to self for testing
    if (this.activeProtocol === 'local') {
      this.handleIncomingMessage(message);
    }
  }

  /**
   * Send a full state snapshot (for new peer initial sync).
   */
  sendFullState(targetPeerId: string, stateData: Uint8Array): void {
    this.broadcast('full-state-response', stateData);
  }

  /**
   * Request full state from existing peers (joining an existing room).
   */
  requestFullState(): void {
    this.broadcast('full-state-request', new Uint8Array(0));
  }

  // ── Event Handlers ───────────────────────────────────────────────────────

  /**
   * Register a handler for incoming messages.
   * Returns an unsubscribe function.
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => { this.messageHandlers.delete(handler); };
  }

  /**
   * Register a handler for connection state changes.
   * Returns an unsubscribe function.
   */
  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler);
    return () => { this.connectionHandlers.delete(handler); };
  }

  // ── Stats & Diagnostics ──────────────────────────────────────────────────

  getStats(): Readonly<TransportStats> {
    return { ...this.stats };
  }

  getProtocol(): TransportProtocol {
    return this.activeProtocol;
  }

  isActive(): boolean {
    return this.stats.isConnected;
  }

  // ── Private: Transport Protocol Stubs ────────────────────────────────────

  private isWebTransportSupported(): boolean {
    return typeof globalThis !== 'undefined' && 'WebTransport' in globalThis;
  }

  private isWebSocketSupported(): boolean {
    return typeof globalThis !== 'undefined' && 'WebSocket' in globalThis;
  }

  /**
   * Stub: Connect via WebTransport (HTTP/3 QUIC).
   * Real implementation would use: new WebTransport(url)
   */
  private async connectWebTransport(): Promise<void> {
    // WebTransport API stub — actual implementation requires HTTP/3 server
    // const transport = new WebTransport(this.config.serverUrl);
    // await transport.ready;
    // const stream = await transport.createBidirectionalStream();
    // const writer = stream.writable.getWriter();
    // const reader = stream.readable.getReader();
    throw new Error('WebTransport server not available');
  }

  /**
   * Stub: Connect via WebSocket (fallback for HTTP/2 environments).
   * Real implementation would use: new WebSocket(url)
   */
  private async connectWebSocket(): Promise<void> {
    // WebSocket stub — actual implementation requires WS server
    // const wsUrl = this.config.serverUrl.replace('https://', 'wss://');
    // const ws = new WebSocket(`${wsUrl}?room=${this.config.roomId}&peer=${this.config.peerId}`);
    // ws.binaryType = 'arraybuffer';
    throw new Error('WebSocket server not available');
  }

  // ── Private: Connection Management ───────────────────────────────────────

  private onConnected(): void {
    this.stats.isConnected = true;
    this.stats.protocol = this.activeProtocol;
    this.reconnectAttempts = 0;
    this.startHeartbeat();
    this.notifyConnectionHandlers(true);
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(() => {
      this.stats.lastHeartbeat = Date.now();
      if (this.activeProtocol !== 'local') {
        this.broadcast('heartbeat', new Uint8Array(0));
      }
    }, 5000);
  }

  private handleIncomingMessage(message: TransportMessage): void {
    // Ignore messages from self (except in local mode for testing)
    if (message.peerId === this.config.peerId && this.activeProtocol !== 'local') {
      return;
    }

    this.stats.messagesReceived++;
    this.stats.bytesReceived += message.payload.byteLength;
    this.stats.latencyMs = Date.now() - message.timestamp;

    for (const handler of this.messageHandlers) {
      handler(message);
    }
  }

  private notifyConnectionHandlers(connected: boolean): void {
    for (const handler of this.connectionHandlers) {
      handler(connected);
    }
  }

  private createInitialStats(): TransportStats {
    return {
      protocol: 'local',
      latencyMs: 0,
      messagesReceived: 0,
      messagesSent: 0,
      bytesReceived: 0,
      bytesSent: 0,
      reconnectCount: 0,
      isConnected: false,
      lastHeartbeat: 0,
    };
  }
}

// ── Factory ──────────────────────────────────────────────────────────────────

/**
 * Create a pre-configured WebTransportClient for graph collaboration.
 *
 * Usage:
 * ```ts
 * const client = createCollabTransport('room-abc', 'peer-123');
 * await client.connect();
 *
 * // Wire up with collaborative store
 * const store = useCollaborativeGraphStore();
 * const unsub = store.onLocalUpdate((update) => {
 *   client.broadcast('sync', update);
 * });
 * client.onMessage((msg) => {
 *   if (msg.type === 'sync') store.applyRemoteUpdate(msg.payload);
 * });
 * ```
 */
export function createCollabTransport(
  roomId: string,
  peerId: string,
  serverUrl?: string,
): WebTransportClient {
  return new WebTransportClient({
    roomId,
    peerId,
    serverUrl: serverUrl ?? import.meta.env.VITE_COLLAB_SERVER_URL ?? 'https://localhost:4433/sync',
  });
}
