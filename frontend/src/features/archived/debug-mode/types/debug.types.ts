/**
 * debug.types.ts — Type-safe interfaces cho Algorithmic Step Debugger.
 * DebugStepPayload, DebuggerState, BreakpointInfo.
 */

export interface DebugStepPayload {
  lineNumber: number;
  arrayState: number[];
  variables: Record<string, string | number | undefined>;
  callStack: string[];
}

export type DebuggerStatus = 'IDLE' | 'DEBUGGING' | 'PAUSED' | 'FINISHED' | 'ERROR';

export interface DebuggerState {
  status: DebuggerStatus;
  currentLineNumber: number | null;
  callStackFrames: string[];
  watchedVariables: Record<string, string | number | undefined>;
  mutatedVariableKeys: string[];
  activeBreakpoints: number[];
  stepCount: number;
  errorMessage: string | null;
}

export interface DebugCompilationResult {
  success: boolean;
  generatorCode?: string;
  error?: string;
  errorLine?: number;
}
