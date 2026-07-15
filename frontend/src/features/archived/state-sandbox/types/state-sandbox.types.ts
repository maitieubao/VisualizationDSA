export interface StackFrame3D {
  id: string;
  functionName: string;
  params: Array<{ name: string; value: unknown }>;
  localVars: Array<{ name: string; value: unknown; isPointer: boolean }>;
  depth: number;
  position: { x: number; y: number; z: number };
  size: { width: number; height: number };
}

export interface HeapNode3D {
  id: string;
  type: string;
  size: number;
  data: unknown;
  position: { x: number; y: number };
  references: number;
}

export interface BezierPath {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  controlX1: number;
  controlY1: number;
  controlX2: number;
  controlY2: number;
}

export interface PointerArrow {
  id: string;
  fromStackFrameId: string;
  fromVarName: string;
  toHeapNodeId: string;
  path: BezierPath;
  isActive: boolean;
}

export interface MemorySnapshot {
  timestamp: number;
  stackFrames: StackFrame3D[];
  heapNodes: HeapNode3D[];
  pointers: PointerArrow[];
}

export type DSLCommandType = 'ALLOC' | 'PUSH' | 'POP' | 'LINK' | 'FREE' | 'CALL' | 'RETURN';

export interface DSLCommand {
  type: DSLCommandType;
  args: string[];
  line: number;
  raw: string;
}

export interface StackFrame {
  id: string;
  functionName: string;
  parameters: Record<string, unknown>;
  localVars: Record<string, unknown>;
  depth: number;
}

export interface HeapObject {
  id: string;
  type: string;
  size: number;
  data: unknown;
  references: number;
}

export interface Pointer {
  id: string;
  fromStackFrameId?: string;
  toHeapObjectId?: string;
  fromVarName: string;
  targetId: string;
}

export interface DSLAnimationFrame {
  frameIndex: number;
  command: DSLCommand;
  stackFrames: StackFrame[];
  heapObjects: HeapObject[];
  pointers: Pointer[];
  description: string;
}

export interface DSLCompileResult {
  success: boolean;
  frames?: DSLAnimationFrame[];
  error?: string;
  commandCount: number;
  executionTimeMs: number;
}
