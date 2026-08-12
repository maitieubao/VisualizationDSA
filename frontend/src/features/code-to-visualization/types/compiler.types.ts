




export interface LiveFrameDTO {
  frameIndex: number;
  type: 'COMPARE' | 'SWAP' | 'ASSIGN' | 'ACCESS';
  indices: number[];
  arrayState: number[];
  variables: Record<string, string | number>;
  lineNumber?: number;
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
  /** true khi số frame vượt ngưỡng MAX_FRAMES và kết quả đã bị cắt bớt */
  truncated?: boolean;
}
