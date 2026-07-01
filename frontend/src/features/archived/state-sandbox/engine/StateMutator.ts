import type { StackFrame3D, HeapNode3D, PointerArrow, BezierPath, MemorySnapshot } from '../types/state-sandbox.types';
import {
  STACK_X, STACK_START_Y, STACK_FRAME_HEIGHT, STACK_FRAME_WIDTH, STACK_FRAME_GAP,
  HEAP_X, HEAP_START_Y, HEAP_NODE_GAP, recalculateStackPositions, recalculateHeapPositions
} from './StatePositioner';

export const stackFrames = new Map<string, StackFrame3D>();
export const heapNodes = new Map<string, HeapNode3D>();
export const pointers = new Map<string, PointerArrow>();
export const snapshots: MemorySnapshot[] = [];
export let frameCounter = 0;

export function pushFrame(functionName: string, params: Record<string, unknown> = {}, localVars: Record<string, unknown> = {}): StackFrame3D {
  frameCounter++;
  const id = `frame-${frameCounter}`, depth = stackFrames.size + 1;
  const paramArray = Object.entries(params).map(([name, value]) => ({ name, value }));
  const localVarArray = Object.entries(localVars).map(([name, value]) => ({
    name, value, isPointer: typeof value === 'string' && value.startsWith('heap-'),
  }));
  const frame: StackFrame3D = {
    id, functionName, params: paramArray, localVars: localVarArray, depth,
    position: { x: STACK_X, y: STACK_START_Y + (depth - 1) * (STACK_FRAME_HEIGHT + STACK_FRAME_GAP), z: depth * 10 },
    size: { width: STACK_FRAME_WIDTH, height: STACK_FRAME_HEIGHT },
  };
  stackFrames.set(id, frame);
  createSnapshot();
  return frame;
}

export function popFrame(): StackFrame3D | null {
  const lastFrame = Array.from(stackFrames.values()).pop();
  if (!lastFrame) return null;
  stackFrames.delete(lastFrame.id);
  for (const [ptrId, ptr] of pointers) {
    if (ptr.fromStackFrameId === lastFrame.id) pointers.delete(ptrId);
  }
  recalculateStackPositions(stackFrames, pointers, heapNodes);
  createSnapshot();
  return lastFrame;
}
export function allocateHeapNode(type: string, size: number, data?: unknown): HeapNode3D {
  const id = `heap-${Date.now()}-${Math.floor(Math.random() * 1000)}`, index = heapNodes.size;
  const node: HeapNode3D = {
    id, type, size, data: data || null,
    position: { x: HEAP_X, y: HEAP_START_Y + index * (size + HEAP_NODE_GAP) },
    references: 0,
  };
  heapNodes.set(id, node);
  createSnapshot();
  return node;
}

export function freeHeapNode(nodeId: string): boolean {
  if (!heapNodes.has(nodeId)) return false;
  heapNodes.delete(nodeId);
  for (const [ptrId, ptr] of pointers) {
    if (ptr.toHeapNodeId === nodeId) pointers.delete(ptrId);
  }
  recalculateHeapPositions(heapNodes, pointers, stackFrames);
  createSnapshot();
  return true;
}

export function createPointer(fromStackFrameId: string, fromVarName: string, toHeapNodeId: string): PointerArrow | null {
  const frame = stackFrames.get(fromStackFrameId);
  const heapNode = heapNodes.get(toHeapNodeId);
  if (!frame || !heapNode) return null;
  const ptrId = `ptr-${fromStackFrameId}-${fromVarName}`;
  const startX = frame.position.x + frame.size.width;
  const startY = frame.position.y + frame.size.height / 2;
  const endX = heapNode.position.x;
  const endY = heapNode.position.y + 20;
  const path: BezierPath = { startX, startY, endX, endY, controlX1: startX + 50, controlY1: startY, controlX2: endX - 50, controlY2: endY };
  const pointer: PointerArrow = { id: ptrId, fromStackFrameId, fromVarName, toHeapNodeId, path, isActive: true };
  pointers.set(ptrId, pointer);
  heapNode.references++;
  const localVar = frame.localVars.find((v) => v.name === fromVarName);
  if (localVar) { localVar.isPointer = true; localVar.value = toHeapNodeId; }
  createSnapshot();
  return pointer;
}

export function resetState(): void {
  stackFrames.clear();
  heapNodes.clear();
  pointers.clear();
  snapshots.length = 0;
  frameCounter = 0;
}

function createSnapshot(): void {
  snapshots.push({
    timestamp: Date.now(),
    stackFrames: Array.from(stackFrames.values()),
    heapNodes: Array.from(heapNodes.values()),
    pointers: Array.from(pointers.values()),
  });
}
