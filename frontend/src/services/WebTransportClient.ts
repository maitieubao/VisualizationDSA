















export type TransportProtocol = 'webtransport' | 'websocket' | 'local';

export interface TransportConfig {
  
  serverUrl: string;
  
  roomId: string;
  
  peerId: string;
  
  maxReconnectAttempts: number;
  
  reconnectBaseDelay: number;
  
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



const DEFAULT_CONFIG: TransportConfig = {
  serverUrl: 'https://localhost:4433/sync',
  roomId: 'default-room',
  peerId: 'local-peer',
  maxReconnectAttempts: 5,
  reconnectBaseDelay: 1000,
  maxMessageSize: 65536,
};



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

  

  



  async connect(): Promise<TransportProtocol> {
    
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

    
    this.activeProtocol = 'local';
    this.onConnected();
    return 'local';
  }

  


  disconnect(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.stats.isConnected = false;
    this.reconnectAttempts = 0;
    this.notifyConnectionHandlers(false);
  }

  

  



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

    
    if (this.activeProtocol === 'local') {
      this.handleIncomingMessage(message);
    }
  }

  


  sendFullState(targetPeerId: string, stateData: Uint8Array): void {
    this.broadcast('full-state-response', stateData);
  }

  


  requestFullState(): void {
    this.broadcast('full-state-request', new Uint8Array(0));
  }

  

  



  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => { this.messageHandlers.delete(handler); };
  }

  



  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler);
    return () => { this.connectionHandlers.delete(handler); };
  }

  

  getStats(): Readonly<TransportStats> {
    return { ...this.stats };
  }

  getProtocol(): TransportProtocol {
    return this.activeProtocol;
  }

  isActive(): boolean {
    return this.stats.isConnected;
  }

  

  private isWebTransportSupported(): boolean {
    return typeof globalThis !== 'undefined' && 'WebTransport' in globalThis;
  }

  private isWebSocketSupported(): boolean {
    return typeof globalThis !== 'undefined' && 'WebSocket' in globalThis;
  }

  



  private async connectWebTransport(): Promise<void> {
    
    
    
    
    
    
    throw new Error('WebTransport server not available');
  }

  



  private async connectWebSocket(): Promise<void> {
    
    
    
    
    throw new Error('WebSocket server not available');
  }

  

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
