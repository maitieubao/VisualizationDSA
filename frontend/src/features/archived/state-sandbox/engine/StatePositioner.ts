import type { StackFrame3D, HeapNode3D, PointerArrow, BezierPath } from '../types/state-sandbox.types';

export const STACK_X = 50;
export const STACK_START_Y = 50;
export const STACK_FRAME_HEIGHT = 80;
export const STACK_FRAME_WIDTH = 200;
export const STACK_FRAME_GAP = 10;
export const HEAP_X = 300;
export const HEAP_START_Y = 50;
export const HEAP_NODE_GAP = 20;

export function bezierToSvgPath(path: BezierPath): string {
  return `M ${path.startX} ${path.startY} C ${path.controlX1} ${path.controlY1}, ${path.controlX2} ${path.controlY2}, ${path.endX} ${path.endY}`;
}

export function getAllPointerPaths(pointers: Map<string, PointerArrow>): Array<{ id: string; path: string; isActive: boolean }> {
  return Array.from(pointers.values()).map((ptr) => ({
    id: ptr.id,
    path: bezierToSvgPath(ptr.path),
    isActive: ptr.isActive,
  }));
}

export function updatePointerPaths(
  pointers: Map<string, PointerArrow>,
  stackFrames: Map<string, StackFrame3D>,
  heapNodes: Map<string, HeapNode3D>
): void {
  for (const pointer of pointers.values()) {
    const frame = stackFrames.get(pointer.fromStackFrameId);
    const heapNode = heapNodes.get(pointer.toHeapNodeId);
    if (frame && heapNode) {
      pointer.path.startX = frame.position.x + frame.size.width;
      pointer.path.startY = frame.position.y + frame.size.height / 2;
      pointer.path.endX = heapNode.position.x;
      pointer.path.endY = heapNode.position.y + 20;
      pointer.path.controlX1 = pointer.path.startX + 50;
      pointer.path.controlY1 = pointer.path.startY;
      pointer.path.controlX2 = pointer.path.endX - 50;
      pointer.path.controlY2 = pointer.path.endY;
    }
  }
}

export function recalculateStackPositions(
  stackFrames: Map<string, StackFrame3D>,
  pointers: Map<string, PointerArrow>,
  heapNodes: Map<string, HeapNode3D>
): void {
  let depth = 1;
  for (const frame of stackFrames.values()) {
    frame.depth = depth;
    frame.position.y = STACK_START_Y + (depth - 1) * (STACK_FRAME_HEIGHT + STACK_FRAME_GAP);
    frame.position.z = depth * 10;
    depth++;
  }
  updatePointerPaths(pointers, stackFrames, heapNodes);
}

export function recalculateHeapPositions(
  heapNodes: Map<string, HeapNode3D>,
  pointers: Map<string, PointerArrow>,
  stackFrames: Map<string, StackFrame3D>
): void {
  let index = 0;
  for (const node of heapNodes.values()) {
    node.position.y = HEAP_START_Y + index * (node.size + HEAP_NODE_GAP);
    index++;
  }
  updatePointerPaths(pointers, stackFrames, heapNodes);
}
