// ============================================================
// StateInspectorEngine — Call Stack Manager
// Push/Pop stack frames with automatic active frame tracking
// ============================================================

import type { StackFrame } from '../types/state-inspector.types';
import { MAX_STACK_FRAMES } from '../types/state-inspector.types';

export class StateInspectorEngine {
  private stack: StackFrame[] = [];
  private activeFrameIndex = -1;

  /** Push a new frame onto the stack, deactivating all previous frames */
  public pushFrame(frame: StackFrame): void {
    if (this.stack.length >= MAX_STACK_FRAMES) {
      return;
    }
    this.stack.forEach((f) => (f.isActive = false));
    frame.isActive = true;
    this.stack.push(frame);
    this.activeFrameIndex = this.stack.length - 1;
  }

  /** Pop the top frame from the stack, reactivating the new top */
  public popFrame(): StackFrame | null {
    if (this.stack.length === 0) return null;
    const popped = this.stack.pop()!;
    this.activeFrameIndex = this.stack.length - 1;
    if (this.activeFrameIndex >= 0) {
      this.stack[this.activeFrameIndex].isActive = true;
    }
    return popped;
  }

  /** Get the current stack (shallow copy) */
  public getStack(): StackFrame[] {
    return [...this.stack];
  }

  /** Get the current stack depth */
  public getDepth(): number {
    return this.stack.length;
  }

  /** Get active frame index */
  public getActiveFrameIndex(): number {
    return this.activeFrameIndex;
  }

  /** Switch to inspect a specific frame by index */
  public switchActiveFrame(index: number): StackFrame | null {
    if (index < 0 || index >= this.stack.length) return null;
    this.stack.forEach((f) => (f.isActive = false));
    this.stack[index].isActive = true;
    this.activeFrameIndex = index;
    return this.stack[index];
  }

  /** Clear the entire stack */
  public clear(): void {
    this.stack = [];
    this.activeFrameIndex = -1;
  }
}
