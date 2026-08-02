import type { AlgorithmResult } from '../types/algorithm.types';
import { generateDummyResult } from './dummyGenerators';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

export async function executeDSAAlgorithm(
  algorithmId: string,
  inputData: number[],
): Promise<AlgorithmResult> {
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
      throw new Error(`HTTP Error ${response.status}`);
    }

    return (await response.json()) as AlgorithmResult;
  } catch {
    return generateDummyResult(algorithmId, inputData);
  }
}
