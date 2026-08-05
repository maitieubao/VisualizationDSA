import axios from 'axios';

export interface CodelabDto {
  id: string;
  title: string;
  description: string;
  initialCode: string;
  difficulty: number;
  xpReward: number;
  maxRuntimeMs: number;
  maxMemoryBytes: number;
  allowedLanguages: string;
  constraints?: string;
  examples?: Array<{ input: string; expectedOutput: string }>;
  hints?: Array<{ content: string; xpCost?: number }>;
  expectedOutput?: string;
}

export interface SubmitCodeRequest {
  code: string;
  language: string;
}

export interface SubmitCodeResult {
  submissionId?: string;
  passed: boolean;
  status: string;
  errorMessage: string;
  runtimeMs: number;
  memoryBytes: number;
  testCaseResultsJson?: string;
}

export const codelabApi = {
  async getCodelab(id: string): Promise<CodelabDto> {
    const response = await axios.get(`/api/codelabs/${id}`);
    return response.data;
  },

  async submitCodelab(id: string, payload: SubmitCodeRequest): Promise<SubmitCodeResult> {
    const response = await axios.post(`/api/codelabs/${id}/submit`, payload);
    return response.data;
  },

  async runCodelab(id: string, payload: SubmitCodeRequest): Promise<SubmitCodeResult> {
    const response = await axios.post(`/api/codelabs/${id}/run`, payload);
    return response.data;
  },

  async revealHint(id: string, hintIndex: number): Promise<void> {
    // Khớp route thật của backend: POST /api/Codelabs/{id}/reveal-hint (body { hintIndex })
    await axios.post(`/api/Codelabs/${id}/reveal-hint`, { hintIndex });
  }
};
