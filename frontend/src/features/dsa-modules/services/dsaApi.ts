import type { AlgorithmResult } from '../types/algorithm.types';
import { generateDummyResult } from './dummyGenerators';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

export interface ExecuteResult {
  result: AlgorithmResult;
  isFallback: boolean;
  errorMessage?: string;
}

export async function executeDSAAlgorithm(
  algorithmId: string,
  inputData: number[],
): Promise<ExecuteResult> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/algorithms/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, br',
      },
      body: JSON.stringify({
        algorithmId,
        dataType: 'integer-array',
        inputData,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return {
      result: (await response.json()) as AlgorithmResult,
      isFallback: false,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi không xác định';
    return {
      result: generateDummyResult(algorithmId, inputData),
      isFallback: true,
      errorMessage: `Không kết nối được máy chủ (${message}). Đang dùng dữ liệu mô phỏng cục bộ.`,
    };
  }
}
