export interface ServerNode {
  id: string;
  name: string;
  type: 'LB' | 'WEB' | 'DB_PRIMARY' | 'DB_REPLICA';
  status: 'HEALTHY' | 'OVERLOADED' | 'FAILED';
  load: number; // 0-100%
  requestCount: number;
  position: { x: number; y: number };
}

export interface HTTPRequest {
  id: string;
  source: string;
  target: string;
  progress: number; // 0-1
  status: 'IN_FLIGHT' | 'ARRIVED' | 'FAILED';
  color: string;
}

export interface DBReplicationEvent {
  id: string;
  from: string;
  to: string;
  delay: number; // ms
  data: Record<string, unknown> | null;
  timestamp: number;
}

export interface SmokeParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number; // 0-1
  color: string;
}
