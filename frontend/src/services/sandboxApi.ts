
import { api } from './apiClient';

export interface TraceStep {
  step: number;
  line: number;
  variables: Record<string, any>;
  arrayState: number[];
  highlightIndices: number[];
  swapEvent: { from: number; to: number } | null;
  callStack: string[];
}

export interface SandboxResult {
  success: boolean;
  executionTrace?: TraceStep[];
  totalSteps?: number;
  error?: string;
  message?: string;
}

export const executeSandboxCode = async (sourceCode: string, language: string): Promise<SandboxResult> => {
  try {
    const response = await api.post<SandboxResult>('/sandbox/execute', { sourceCode, language });
    return response;
  } catch (error: any) {
    if (error.error && error.message) {
      return error as SandboxResult;
    }
    return { success: false, error: 'UNKNOWN_ERROR', message: 'Lỗi không xác định khi kết nối tới Sandbox.' };
  }
};
