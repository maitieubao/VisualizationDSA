import type { DSLCommand, DSLCommandType, DSLCompileResult, StackFrame, HeapObject, Pointer } from '../types/state-sandbox.types';
import { executeDSLCommand } from './dslExecutor';
import { getSampleScripts } from '../scenarios/dslScripts';

export class DSLEngine {
  public static stackFrames = new Map<string, StackFrame>();
  public static heapObjects = new Map<string, HeapObject>();
  public static pointers = new Map<string, Pointer>();
  public static callStackDepth = 0;

  public static parseScript(script: string): DSLCommand[] {
    const lines = script.split('\n').map((line) => line.trim()).filter((line) => line && !line.startsWith('#'));
    return lines.map((line, index) => {
      const parts = line.split(/\s+/);
      return { type: parts[0].toUpperCase() as DSLCommandType, args: parts.slice(1), line: index + 1, raw: line };
    });
  }

  public static compile(script: string): DSLCompileResult {
    const startTime = performance.now();
    try {
      this.reset();
      const commands = this.parseScript(script);
      const frames = commands.map((cmd, idx) => executeDSLCommand(cmd, idx, this));
      return { success: true, frames, commandCount: commands.length, executionTimeMs: performance.now() - startTime };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown compilation error', commandCount: 0, executionTimeMs: performance.now() - startTime };
    }
  }

  public static reset(): void {
    this.stackFrames.clear();
    this.heapObjects.clear();
    this.pointers.clear();
    this.callStackDepth = 0;
  }

  public static getSampleScripts(): Record<string, string> {
    return getSampleScripts();
  }
}

export default DSLEngine;
