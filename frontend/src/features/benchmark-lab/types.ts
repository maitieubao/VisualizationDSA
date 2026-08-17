// DTO khớp với request/response của POST /api/v1/algorithms/compare
// (xem backend: AlgorithmsController.Compare — không sửa backend, chỉ mirror hợp đồng).

export interface CompareRequestDto {
  algorithmIds: string[];
  inputData: number[];
}

export interface CompareResultDto {
  algorithmId: string;
  name?: string | null;
  elapsedMs: number;
  frameCount: number;
  timeComplexity?: string | null;
  spaceComplexity?: string | null;
  // Frames do backend trả về để vẽ hoạt ảnh; Benchmark Lab không import engine mô phỏng
  // nên chỉ lưu dạng opaque, không render.
  frames?: unknown[] | null;
  error?: string | null;
}
