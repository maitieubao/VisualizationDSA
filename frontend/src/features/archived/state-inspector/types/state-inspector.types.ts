// ============================================================
// State Inspector & Stack Frames — Type Definitions
// Phase 2: Call Stack 3D Glassmorphic, Pointer Bezier, Recursion Tree
// ============================================================

/** Stack Frame representing a function call in the Call Stack */
export interface StackFrame {
  frameId: string;
  functionName: string;
  lineNumber: number;
  localVariables: Record<string, StackVariable>;
  isActive: boolean;
}

/** A variable stored in a Stack Frame */
export interface StackVariable {
  value: number | string | boolean | null;
  heapAddress?: string;
}

/** Recursion tree node status */
export type RecursionNodeStatus = 'ACTIVE' | 'RESOLVED' | 'PENDING';

/** Node in the recursion tree visualization */
export interface RecursionNode {
  nodeId: string;
  label: string;
  depth: number;
  returnValue?: number | string;
  status: RecursionNodeStatus;
  children: RecursionNode[];
}

/** Flat coordinate entry for SVG rendering of recursion tree */
export interface RecursionNodeCoordinate {
  nodeId: string;
  label: string;
  x: number;
  y: number;
  status: string;
  parentId: string | null;
  returnValue?: number | string;
}

/** Heap object displayed in the Heap panel */
export interface HeapObject {
  objectId: string;
  address: string;
  label: string;
  type: string;
  fields: Record<string, number | string | boolean | null>;
}

/** Link from a Stack variable to a Heap object for Bezier pointer arrow */
export interface PointerLink {
  sourceId: string;
  targetId: string;
}

/** Bezier control points for SVG path rendering */
export interface BezierPathData {
  p0x: number;
  p0y: number;
  p1x: number;
  p1y: number;
  p2x: number;
  p2y: number;
  p3x: number;
  p3y: number;
  pathD: string;
}

// ============================================================
// Constants
// ============================================================

/** Maximum stack frames displayed (depth ceiling clamping) */
export const MAX_STACK_FRAMES = 10;

/** Depth spacing in pixels for recursion tree Y-axis */
export const TREE_DEPTH_SPACING_PX = 80;

/** Vertical offset for root node */
export const TREE_ROOT_OFFSET_PX = 40;

/** Bezier control point spread factor (0.4 = 40% of dx) */
export const BEZIER_CONTROL_FACTOR = 0.4;

/** Minimum dx for Bezier control points */
export const BEZIER_MIN_DX = 40;

/** Monaco line sync custom event name */
export const MONACO_REVEAL_LINE_EVENT = 'MONACO_REVEAL_LINE_INSIGHT';

/** Hover pulse clear delay in ms */
export const HOVER_PULSE_CLEAR_DELAY_MS = 5;
