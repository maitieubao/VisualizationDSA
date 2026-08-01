/**
 * compiler.types.ts — Type-safe interfaces cho Code-to-Visualization Compiler.
 * Định nghĩa cấu trúc LiveFrameDTO, CompilationResult, ConsoleLogEntry.
 */

export interface LiveFrameDTO {
  frameIndex: number;
  type: 'COMPARE' | 'SWAP' | 'ACCESS';
  indices: number[];
  arrayState: number[];
  variables: Record<string, string | number>;
}

export interface CompilationResult {
  success: boolean;
  instrumentedCode?: string;
  error?: string;
  errorLine?: number;
}

export interface ConsoleLogEntry {
  text: string;
  type: 'info' | 'success' | 'error' | 'warn';
  timestamp: string;
}

export interface WorkerPayload {
  code: string;
  initialArray: number[];
}

export interface WorkerResponse {
  success: boolean;
  frames?: LiveFrameDTO[];
  error?: string;
}
