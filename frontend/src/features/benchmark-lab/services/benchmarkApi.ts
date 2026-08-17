import { api } from '@/services/apiClient';
import type { CompareRequestDto, CompareResultDto } from '../types';

// Gọi POST /api/v1/algorithms/compare — dùng chung apiClient để thừa hưởng
// timeout 15s, chuẩn hóa lỗi JSON và header Content-Type.
export function compareAlgorithms(
  request: CompareRequestDto,
): Promise<CompareResultDto[]> {
  return api.post<CompareResultDto[]>('/algorithms/compare', request);
}
