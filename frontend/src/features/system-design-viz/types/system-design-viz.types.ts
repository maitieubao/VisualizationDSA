// ============================================================
// System Design Visualization Types — Phase 2
// Distributed Architecture, Round-Robin LB, Failover, Replication Lag
// ============================================================

export type SystemNodeType =
  | 'CLIENT'
  | 'LOAD_BALANCER'
  | 'WEB_SERVER'
  | 'REDIS_CACHE'
  | 'POSTGRES_PRIMARY'
  | 'POSTGRES_REPLICA';

export type NodeStatus = 'HEALTHY' | 'OVERLOADED' | 'FAILED';

export type PacketStatus = 'IN_TRANSIT' | 'ARRIVED' | 'DROPPED';

export type PacketColorType = 'HTTP_REQUEST' | 'DB_WRITE' | 'CACHE_HIT';

export interface SystemNode {
  nodeId: string;
  nodeType: SystemNodeType;
  label: string;
  status: NodeStatus;
  requestCount: number;
  posX: number;
  posY: number;
}

export interface NetworkLink {
  linkId: string;
  sourceId: string;
  targetId: string;
  latencyMs: number;
}

export interface NetworkPacket {
  packetId: string;
  sourceId: string;
  targetId: string;
  progress: number;
  status: PacketStatus;
  packetColor: string;
}

export interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface ReplicationJob {
  jobId: string;
  primaryId: string;
  replicaId: string;
  lagDurationMs: number;
  startedAt: number;
  packetColor: string;
}

// ── Backend Frame DTO (maps 1:1 to SystemDesignFrameDto in C#) ──

export type SystemDesignActionType =
  | 'INITIALIZE'
  | 'INJECT_REQUEST'
  | 'PACKET_ARRIVED'
  | 'PACKET_DROPPED'
  | 'SERVER_FAILED'
  | 'SERVER_RECOVERED'
  | 'DB_REPLICATE';

/** Replication job snapshot from backend (no startedAt — that's frontend-only) */
export interface ReplicationJobSnapshot {
  jobId: string;
  primaryId: string;
  replicaId: string;
  lagDurationMs: number;
  packetColor: string;
}

/**
 * A single frame from the backend's SystemDesignStrategy.
 * Each frame is a full state snapshot at one simulation step.
 */
export interface SystemDesignFrame {
  stepId: number;
  actionType: SystemDesignActionType;
  explanation: string;
  nodes: SystemNode[];
  links: NetworkLink[];
  activePackets: NetworkPacket[];
  pendingReplications: ReplicationJobSnapshot[];
}

// ── Constants ──
export const PACKET_SPEED = 0.05;
export const MAX_ACTIVE_PACKETS = 200;
export const OVERLOAD_THRESHOLD = 50;
export const OVERLOAD_RECOVERY_THRESHOLD = 30;
export const OVERLOAD_RECOVERY_DELAY_MS = 3000;
export const REPLICATION_LAG_MIN_MS = 100;
export const REPLICATION_LAG_MAX_MS = 5000;
export const REPLICATION_LAG_DEFAULT_MS = 1000;
export const SMOKE_BURST_COUNT = 20;
export const SMOKE_CONTINUOUS_PROBABILITY = 0.25;

export const PACKET_COLORS: Record<PacketColorType, string> = {
  HTTP_REQUEST: '#10B981',
  DB_WRITE: '#FBBF24',
  CACHE_HIT: '#F59E0B',
};

export const NODE_TYPE_LABELS: Record<SystemNodeType, string> = {
  CLIENT: 'Client',
  LOAD_BALANCER: 'Load Balancer',
  WEB_SERVER: 'Web Server',
  REDIS_CACHE: 'Redis Cache',
  POSTGRES_PRIMARY: 'Primary DB',
  POSTGRES_REPLICA: 'Replica DB',
};
