// ============================================================
// SOLID Visualization Types — Phase 2 SOLID Principles Visualizer
// Thermal SRP Cards, Laser Fracture LSP, Neon Flowing DIP
// ============================================================

export type SOLIDPrinciple = 'SRP' | 'OCP' | 'LSP' | 'ISP' | 'DIP';

export type MemberType = 'FIELD' | 'METHOD';

export type SRPViolationStatus = 'COHESIVE' | 'OVERHEATED';

export type LSPSubstitutionPhase =
  | 'IDLE'
  | 'TRANSMITTING'
  | 'SHATTERED'
  | 'PASSED';

export type DIPFlowDirection = 'VIOLATING' | 'CORRECT';

export interface UMLClassMember {
  name: string;
  type: MemberType;
  accessedFields: string[];
}

export interface SOLIDClassNode {
  nodeId: string;
  className: string;
  members: UMLClassMember[];
  cohesionScore: number;
  isViolatingSRP: boolean;
}

export interface SRPEvaluationResult {
  isViolating: boolean;
  lcom4: number;
}

export interface LSPEvaluationResult {
  isViolating: boolean;
  errorReason?: string;
}

export interface FireParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

export interface FractureSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface DIPState {
  isViolatingDIP: boolean;
  hasInterfaceInserted: boolean;
}

export interface CoordinatePoint {
  x: number;
  y: number;
}

// ==========================================
// CONSTANTS
// ==========================================

export const MAX_PARTICLES = 80;
export const LSP_LASER_DELAY_MS = 800;
export const FRACTURE_SEGMENT_COUNT_MIN = 10;
export const FRACTURE_SEGMENT_COUNT_MAX = 15;
export const FRACTURE_OFFSET_RANGE = 12;
export const PARTICLE_FPS = 60;
export const SRP_VIOLATION_THRESHOLD = 2;
export const COOL_DOWN_CONFETTI_EVENT = 'SRP_COOL_DOWN_CONFETTI';
export const GLASS_BREAK_SOUND_EVENT = 'PLAY_GLASS_BREAK_SOUND';
