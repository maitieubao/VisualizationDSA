import type { StackFrame3D, HeapNode3D, PointerArrow, MemorySnapshot } from '../types/state-sandbox.types';
import * as mutator from './StateMutator';
import { getAllPointerPaths as getPaths } from './StatePositioner';

export class CallStackEngine {
  public static pushFrame(name: string, p: Record<string, unknown> = {}, l: Record<string, unknown> = {}): StackFrame3D {
    return mutator.pushFrame(name, p, l);
  }

  public static popFrame(): StackFrame3D | null {
    return mutator.popFrame();
  }

  public static allocateHeapNode(type: string, size: number, data?: unknown): HeapNode3D {
    return mutator.allocateHeapNode(type, size, data);
  }

  public static freeHeapNode(nodeId: string): boolean {
    return mutator.freeHeapNode(nodeId);
  }

  public static createPointer(from: string, name: string, to: string): PointerArrow | null {
    return mutator.createPointer(from, name, to);
  }

  public static getAllPointerPaths(): Array<{ id: string; path: string; isActive: boolean }> {
    return getPaths(mutator.pointers);
  }

  public static getCurrentState(): MemorySnapshot {
    return {
      timestamp: Date.now(),
      stackFrames: Array.from(mutator.stackFrames.values()),
      heapNodes: Array.from(mutator.heapNodes.values()),
      pointers: Array.from(mutator.pointers.values()),
    };
  }

  public static getSnapshots(): MemorySnapshot[] {
    return [...mutator.snapshots];
  }

  public static clearSnapshots(): void {
    mutator.snapshots.length = 0;
  }

  public static reset(): void {
    mutator.resetState();
  }
}

export default CallStackEngine;
