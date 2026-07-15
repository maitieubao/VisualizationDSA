// ============================================================
// OOP Visualization Types — Phase 2 OOP Concepts Visualizer
// Glassmorphic UML Cards, Neon Padlocks, VTable Dispatch Lasers
// ============================================================

export type AccessModifier = 'PUBLIC' | 'PROTECTED' | 'PRIVATE';

export type MemberType = 'FIELD' | 'METHOD';

export type DispatchStatus =
  | 'IDLE'
  | 'SEEKING_VTABLE'
  | 'DISPATCHED'
  | 'ACCESS_VIOLATED';

export interface ClassMember {
  name: string;
  type: MemberType;
  accessModifier: AccessModifier;
  isOverridden?: boolean;
  isAbstract?: boolean;
  returnType?: string;
}

export interface ClassDefinition {
  className: string;
  parentClass?: string;
  interfaces?: string[];
  isAbstract?: boolean;
  isInterface?: boolean;
  members: ClassMember[];
}

export interface HeapObjectInstance {
  address: string;
  className: string;
  fieldsData: Map<string, unknown>;
  vTable: Map<string, string>;
}

export interface ExecutionPointer {
  callerClass: string;
  activeObjectAddress: string;
  activeMethod: string;
  dispatchStatus: DispatchStatus;
  resolvedClass?: string;
}

export interface CoordinatePoint {
  x: number;
  y: number;
}

export interface LaserSegment {
  id: string;
  start: CoordinatePoint;
  pivot: CoordinatePoint;
  end: CoordinatePoint;
  color: string;
  phase: 'seeking' | 'resolved';
}

export interface EncapsulationViolation {
  targetClass: string;
  memberName: string;
  callerClass: string;
  errorMessage: string;
  timestamp: number;
}

export const MAX_HEAP_OBJECTS = 10;
export const MAX_INHERITANCE_DEPTH = 5;
export const DISPATCH_LASER_DELAY_MS = 800;
export const VIOLATION_SHAKE_DURATION_MS = 2000;
export const HEAP_BASE_ADDRESS = 0x310000;
export const HEAP_ADDRESS_STEP = 16;

// ============================================================
// Backend OOP Frame Types — maps to C# OOPFrameDto
// Used for full-stack VCR playback with backend-generated frames
// ============================================================

/** Snapshot of a heap object from the backend (uses plain objects, not Maps) */
export interface HeapObjectSnapshot {
  address: string;
  className: string;
  fieldsData: Record<string, unknown>;
  vTable: Record<string, string>;
}

/** Full state snapshot for one step in an OOP scenario */
export interface OOPFrame {
  stepId: number;
  codeLineIndex: number;
  actionName: string;
  explanation: string;
  classDefinitions: ClassDefinition[];
  heapObjects: HeapObjectSnapshot[];
  executionPointer: ExecutionPointer | null;
  violation: EncapsulationViolation | null;
  actionPayload?: Record<string, unknown>;
}
