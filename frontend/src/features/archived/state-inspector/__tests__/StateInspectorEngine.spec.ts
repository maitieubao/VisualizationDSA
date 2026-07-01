import { describe, it, expect, beforeEach } from 'vitest';
import { StateInspectorEngine } from '../engine/StateInspectorEngine';
import type { StackFrame } from '../types/state-inspector.types';
import { MAX_STACK_FRAMES } from '../types/state-inspector.types';

function createFrame(id: string, fn: string, line: number): StackFrame {
  return {
    frameId: id,
    functionName: fn,
    lineNumber: line,
    localVariables: { n: { value: 1 } },
    isActive: false,
  };
}

describe('StateInspectorEngine — Call Stack Manager', () => {
  let engine: StateInspectorEngine;

  beforeEach(() => {
    engine = new StateInspectorEngine();
  });

  it('should start with empty stack and activeFrameIndex -1', () => {
    expect(engine.getStack()).toEqual([]);
    expect(engine.getDepth()).toBe(0);
    expect(engine.getActiveFrameIndex()).toBe(-1);
  });

  it('should push frame and set it as active', () => {
    const frame = createFrame('f1', 'fib(3)', 12);
    engine.pushFrame(frame);

    expect(engine.getDepth()).toBe(1);
    expect(engine.getStack()[0].isActive).toBe(true);
    expect(engine.getActiveFrameIndex()).toBe(0);
  });

  it('should deactivate previous frames when pushing new one', () => {
    const f1 = createFrame('f1', 'fib(3)', 12);
    const f2 = createFrame('f2', 'fib(2)', 14);

    engine.pushFrame(f1);
    engine.pushFrame(f2);

    const stack = engine.getStack();
    expect(stack.length).toBe(2);
    expect(stack[0].isActive).toBe(false);
    expect(stack[1].isActive).toBe(true);
    expect(engine.getActiveFrameIndex()).toBe(1);
  });

  it('should pop frame and reactivate previous top', () => {
    const f1 = createFrame('f1', 'fib(3)', 12);
    const f2 = createFrame('f2', 'fib(2)', 14);

    engine.pushFrame(f1);
    engine.pushFrame(f2);

    const popped = engine.popFrame();
    expect(popped?.frameId).toBe('f2');
    expect(engine.getDepth()).toBe(1);
    expect(engine.getStack()[0].isActive).toBe(true);
    expect(engine.getActiveFrameIndex()).toBe(0);
  });

  it('should return null when popping empty stack', () => {
    const result = engine.popFrame();
    expect(result).toBeNull();
    expect(engine.getActiveFrameIndex()).toBe(-1);
  });

  it('should pop last frame and set activeFrameIndex to -1', () => {
    engine.pushFrame(createFrame('f1', 'main()', 5));
    engine.popFrame();

    expect(engine.getDepth()).toBe(0);
    expect(engine.getActiveFrameIndex()).toBe(-1);
  });

  it('should switch active frame by valid index', () => {
    engine.pushFrame(createFrame('f1', 'main()', 5));
    engine.pushFrame(createFrame('f2', 'fib(3)', 12));
    engine.pushFrame(createFrame('f3', 'fib(2)', 14));

    const switched = engine.switchActiveFrame(0);
    expect(switched?.frameId).toBe('f1');
    expect(engine.getStack()[0].isActive).toBe(true);
    expect(engine.getStack()[1].isActive).toBe(false);
    expect(engine.getStack()[2].isActive).toBe(false);
    expect(engine.getActiveFrameIndex()).toBe(0);
  });

  it('should return null for invalid switchActiveFrame index (negative)', () => {
    engine.pushFrame(createFrame('f1', 'main()', 5));
    const result = engine.switchActiveFrame(-1);
    expect(result).toBeNull();
  });

  it('should return null for invalid switchActiveFrame index (out of bounds)', () => {
    engine.pushFrame(createFrame('f1', 'main()', 5));
    const result = engine.switchActiveFrame(10);
    expect(result).toBeNull();
  });

  it('should switch to middle frame correctly', () => {
    engine.pushFrame(createFrame('f1', 'main()', 5));
    engine.pushFrame(createFrame('f2', 'fib(3)', 12));
    engine.pushFrame(createFrame('f3', 'fib(2)', 14));

    const switched = engine.switchActiveFrame(1);
    expect(switched?.frameId).toBe('f2');
    expect(engine.getActiveFrameIndex()).toBe(1);
  });

  it('should clear all frames', () => {
    engine.pushFrame(createFrame('f1', 'main()', 5));
    engine.pushFrame(createFrame('f2', 'fib(3)', 12));

    engine.clear();
    expect(engine.getStack()).toEqual([]);
    expect(engine.getDepth()).toBe(0);
    expect(engine.getActiveFrameIndex()).toBe(-1);
  });

  it('should respect MAX_STACK_FRAMES limit', () => {
    for (let i = 0; i < MAX_STACK_FRAMES + 5; i++) {
      engine.pushFrame(createFrame(`f${i}`, `fn${i}()`, i));
    }
    expect(engine.getDepth()).toBe(MAX_STACK_FRAMES);
  });

  it('should handle push-pop-push sequence correctly', () => {
    engine.pushFrame(createFrame('f1', 'a()', 1));
    engine.pushFrame(createFrame('f2', 'b()', 2));
    engine.popFrame();
    engine.pushFrame(createFrame('f3', 'c()', 3));

    expect(engine.getDepth()).toBe(2);
    expect(engine.getStack()[1].frameId).toBe('f3');
    expect(engine.getStack()[1].isActive).toBe(true);
  });

  it('should return shallow copy from getStack', () => {
    engine.pushFrame(createFrame('f1', 'a()', 1));
    const stack1 = engine.getStack();
    const stack2 = engine.getStack();
    expect(stack1).not.toBe(stack2);
    expect(stack1).toEqual(stack2);
  });

  it('should handle multiple pops until empty', () => {
    engine.pushFrame(createFrame('f1', 'a()', 1));
    engine.pushFrame(createFrame('f2', 'b()', 2));
    engine.pushFrame(createFrame('f3', 'c()', 3));

    engine.popFrame();
    expect(engine.getDepth()).toBe(2);
    engine.popFrame();
    expect(engine.getDepth()).toBe(1);
    engine.popFrame();
    expect(engine.getDepth()).toBe(0);
    engine.popFrame(); // extra pop on empty
    expect(engine.getDepth()).toBe(0);
  });

  it('should preserve localVariables with heapAddress', () => {
    const frame: StackFrame = {
      frameId: 'ptr-frame',
      functionName: 'link()',
      lineNumber: 20,
      localVariables: {
        head: { value: null, heapAddress: '0x7ffd00' },
        count: { value: 5 },
      },
      isActive: false,
    };
    engine.pushFrame(frame);

    const stack = engine.getStack();
    expect(stack[0].localVariables.head.heapAddress).toBe('0x7ffd00');
    expect(stack[0].localVariables.count.value).toBe(5);
  });

  it('should handle switchActiveFrame on single-element stack', () => {
    engine.pushFrame(createFrame('f1', 'a()', 1));
    const result = engine.switchActiveFrame(0);
    expect(result?.frameId).toBe('f1');
    expect(result?.isActive).toBe(true);
  });
});
